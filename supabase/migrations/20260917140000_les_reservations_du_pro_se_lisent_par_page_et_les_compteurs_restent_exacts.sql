-- LES RESERVATIONS DU PRO SE LISENT PAR PAGE, ET LES COMPTEURS RESTENT EXACTS
--
-- Constat MESURE sur l'ecran professionnel (App.jsx, ProResa) :
--
-- 1. La requete n'a NI pagination NI limite :
--      .select("id,client_id,status,data,created_at")
--      .or("estab_owner_id.eq.<moi>,estab_id.eq.<nom>")
--      .order("created_at",{ascending:false})
--    Elle rapatrie toutes les reservations depuis toujours, blob « data »
--    compris. A l'echelle visee, un etablissement a des millions de lignes.
--
-- 2. Son plan est un BALAYAGE SEQUENTIEL, et ce n'est pas un choix du
--    planificateur : avec enable_seqscan = off, PostgreSQL retombe QUAND MEME
--    sur un Seq Scan. Aucun chemin indexe n'existe, parce que estab_id (le NOM)
--    n'est couvert par aucun index et qu'un OR sur deux colonnes exige un index
--    sur chaque branche.
--
-- 3. La branche « OR estab_id = <nom> » ne peut ramener AUCUNE ligne
--    supplementaire. Mesure en prenant le role authenticated :
--      pro proprietaire            -> 0 ligne visible
--      un autre pro                -> 0 ligne visible
--      client auteur               -> 3 lignes
--      voie de service (sans RLS)  -> 5 lignes
--    La politique reservations_select_participant n'autorise le pro que sur
--    estab_owner_id = auth.uid(). Tout ce que la branche « nom » pourrait
--    trouver en plus est bloque par la RLS. Elle ne coute que le Seq Scan.
--    (Chaine verifiee par ailleurs sur un VRAI etablissement : le declencheur
--    protect_reservation_status pose bien estab_owner_id, le proprietaire voit
--    sa reservation, un autre pro ne la voit pas.)
--
-- 4. La liste alimente aussi DES COMPTEURS ET UN CHIFFRE D'AFFAIRES, calcules
--    dans le navigateur sur le tableau charge : « En attente », « Confirmees »
--    et « Revenus ». Paginer sans plus ne les rendrait pas seulement faux : il
--    produirait des compteurs approximatifs, ce que les regles interdisent.
--    C'est pourquoi cette migration livre les deux ensemble.
--
-- Correction :
--   a) un index qui sert exactement le tri et le filtre de l'ecran ;
--   b) une lecture par curseur, sur le modele DEJA en place dans le projet
--      (get_feed_page : curseur keyset (created_at, id) et LIMIT qui sert a la
--      fois de taille de page et de plafond) ;
--   c) des compteurs tenus a jour par declencheur, donc EXACTS quel que soit le
--      volume, et lus en une seule requete bornee au proprietaire.
--
-- Ce qui reste strictement identique : la table reservations, ses colonnes, ses
-- politiques RLS, tous les autres declencheurs, et l'ecran lui-meme tant qu'il
-- n'appelle pas ces fonctions. Rien n'est supprime.

-- a) L'index qui sert le tri de l'ecran, pour le seul chemin que la RLS
--    autorise au professionnel.
create index if not exists idx_reservations_owner_recent
  on public.reservations (estab_owner_id, created_at desc, id desc)
  where estab_owner_id is not null;

-- c) Les compteurs. Une ligne par (etablissement, statut) : aucun statut n'est
--    enumere dans le schema, donc un nouveau statut ne demandera aucune
--    migration. La cle primaire sert l'unique acces (les compteurs d'un
--    etablissement).
create table if not exists public.establishment_reservation_stats (
  establishment_id text    not null,
  status           text    not null,
  nb               bigint  not null default 0,
  revenu           numeric not null default 0,
  updated_at       timestamptz not null default now(),
  primary key (establishment_id, status)
);

alter table public.establishment_reservation_stats enable row level security;
-- Lecture par la fonction ci-dessous uniquement, qui borne au proprietaire.
revoke all on table public.establishment_reservation_stats from anon, authenticated;

-- Le revenu retenu est celui du SERVEUR (total_price), pas le total transmis par
-- le navigateur (data->>'total'). C'est la seule source de verite du montant :
-- enforce_reservation_price et enforce_reservation_items l'imposent depuis le
-- catalogue. La condition de paiement, elle, est reprise telle quelle de
-- l'ecran : payMode « avec » et statut confirme ou consomme.
create or replace function public._stats_resa_delta(
  p_estab text, p_status text, p_nb int, p_revenu numeric)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if p_estab is null or p_status is null then return; end if;
  insert into public.establishment_reservation_stats as s
    (establishment_id, status, nb, revenu, updated_at)
  values (p_estab, p_status, p_nb, coalesce(p_revenu,0), now())
  on conflict (establishment_id, status) do update
    set nb = s.nb + excluded.nb,
        revenu = s.revenu + excluded.revenu,
        updated_at = now();
end $function$;

create or replace function public.maj_stats_reservation()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare _av numeric := 0; _ap numeric := 0;
begin
  if tg_op in ('UPDATE','DELETE') then
    if old.status in ('confirmed','consumed')
       and coalesce(old.data->>'payMode','') = 'avec' then
      _av := coalesce(old.total_price, 0);
    end if;
    perform public._stats_resa_delta(old.establishment_id, old.status, -1, -_av);
  end if;
  if tg_op in ('INSERT','UPDATE') then
    if new.status in ('confirmed','consumed')
       and coalesce(new.data->>'payMode','') = 'avec' then
      _ap := coalesce(new.total_price, 0);
    end if;
    perform public._stats_resa_delta(new.establishment_id, new.status, 1, _ap);
  end if;
  return null;
end $function$;

-- « trg_zz_ » : apres tous les declencheurs BEFORE, donc sur les valeurs
-- reellement ecrites (statut force par protect_reservation_status, montant
-- impose par enforce_reservation_price / enforce_reservation_items).
drop trigger if exists trg_zz_stats_reservation on public.reservations;
create trigger trg_zz_stats_reservation
  after insert or delete or update of status, total_price, data, establishment_id
  on public.reservations
  for each row execute function public.maj_stats_reservation();

-- Reprise de l'existant : les compteurs partent de la realite, pas de zero.
insert into public.establishment_reservation_stats (establishment_id, status, nb, revenu)
select r.establishment_id, r.status, count(*),
       coalesce(sum(case when r.status in ('confirmed','consumed')
                          and coalesce(r.data->>'payMode','') = 'avec'
                         then coalesce(r.total_price,0) else 0 end), 0)
  from public.reservations r
 where r.establishment_id is not null and r.status is not null
 group by r.establishment_id, r.status
on conflict (establishment_id, status) do nothing;

-- b) La page. Curseur keyset (created_at, id), strictement le motif de
--    get_feed_page. Bornee au proprietaire : c'est le seul ensemble que la RLS
--    autorise, et c'est ce que sert l'index ci-dessus.
create or replace function public.get_pro_reservations_page(
  p_after_created_at timestamptz default null,
  p_after_id text default null,
  p_limit int default 30,
  p_status text default null)
returns setof public.reservations
language sql
stable
security invoker
set search_path to 'public'
as $function$
  select r.*
    from public.reservations r
   where r.estab_owner_id = (select auth.uid())
     and (p_status is null or r.status = p_status)
     and (p_after_created_at is null
          or r.created_at < p_after_created_at
          or (r.created_at = p_after_created_at and r.id < p_after_id))
   order by r.created_at desc, r.id desc
   limit least(greatest(coalesce(p_limit, 30), 1), 100);
$function$;

-- Les compteurs du professionnel, exacts, en une seule lecture bornee a ses
-- propres etablissements. Aucun parcours des reservations.
create or replace function public.get_pro_reservation_stats()
returns table(status text, nb bigint, revenu numeric)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select s.status, sum(s.nb)::bigint, sum(s.revenu)::numeric
    from public.establishment_reservation_stats s
    join public.establishments e on e.id = s.establishment_id
   where e.owner_id = (select auth.uid())
     and (select auth.uid()) is not null
   group by s.status;
$function$;

revoke all on function public.get_pro_reservation_stats() from public, anon;
grant execute on function public.get_pro_reservation_stats() to authenticated;
grant execute on function public.get_pro_reservations_page(timestamptz, text, int, text) to authenticated;
