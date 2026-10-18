-- LA RESERVATION ENREGISTRE CE QUI A ETE COMMANDE, ET LE SERVEUR EN IMPOSE LE PRIX
--
-- Constat MESURE (tests en transaction annulee, 8 cas sur 8) :
--   E. un plat a 40 EUR paye 1 EUR          -> ACCEPTE (total=1.00)
--   G. un combine, chambre a 100, paye 1    -> ACCEPTE (total=1.00)
--   H. une reservation restaurant sans prix -> ACCEPTE (total=NULL)
--   B. une chambre a 100 payee 1            -> refusee (deja protege)
--   D. 5 chambres pour un stock de 1        -> refusee (deja protege)
-- Et, prouve en executant la ligne reelle d'App.jsx qui construit la
-- reservation : la liste des plats commandes n'est JAMAIS enregistree. Le
-- restaurant recoit « 3 plats selectionnes » et un montant, sans savoir
-- lesquels preparer.
--
-- Cause reelle. enforce_reservation_price sort immediatement sur
--   if new.room_id is null   -> toute reservation de plats echappe au controle
--   if isCombo               -> tout sejour combine y echappe aussi
-- Elle ne peut pas faire autrement : le serveur ignore ce qui a ete commande.
-- Tant que la commande n'existe pas cote serveur, aucun prix ne peut etre
-- verifie. C'est la cause, pas le symptome.
--
-- Correction : la commande devient une donnee du serveur. Chaque ligne est
-- conservee avec un instantane du nom et du prix pratiques au moment de la
-- reservation, et le total est recalcule par le serveur depuis son propre
-- catalogue.
--
-- Pourquoi un instantane et pas une cle etrangere vers establishment_dishes :
-- set_establishment_dishes SUPPRIME les plats absents de la liste envoyee
-- (delete ... where not (id = any(_garde))). Une cle etrangere empecherait
-- l'etablissement de retirer un plat de sa carte, ou effacerait l'historique
-- des commandes deja passees. Le nom et le prix sont donc figes sur la ligne,
-- comme le fait toute plateforme de vente reelle, et dish_id reste une
-- reference simple pour les rapprochements.
--
-- Pourquoi un declencheur et pas une fonction d'insertion dediee : le client
-- envoie la reservation en UN SEUL insert PostgREST (DataLayer.create, App.jsx).
-- Deux appels separes ne seraient pas atomiques. Le declencheur garde le chemin
-- d'insertion existant strictement inchange.
--
-- DEPLOIEMENT EN DEUX TEMPS, VOLONTAIRE. Tant que l'interface deployee n'envoie
-- pas encore la commande, une reservation SANS data->'items' garde exactement
-- son comportement actuel : refuser des maintenant casserait toutes les
-- reservations restaurant en production. Rendre la commande OBLIGATOIRE est une
-- migration distincte, a appliquer une fois l'interface en ligne.
--
-- Ce qui reste strictement identique : l'insertion par le client, les
-- reservations de chambre (deja protegees par enforce_reservation_price et
-- enforce_room_availability), la voie de service (auth.uid() nul), tous les
-- statuts et toutes les transitions.

create table if not exists public.reservation_items (
  reservation_id   text    not null references public.reservations(id) on delete cascade,
  ligne            int     not null,
  dish_id          text    not null,
  establishment_id text    not null,
  name             text    not null,
  unit_price       numeric not null check (unit_price >= 0),
  quantity         int     not null default 1 check (quantity > 0),
  created_at       timestamptz not null default now(),
  primary key (reservation_id, ligne)
);

-- La cle primaire commence par reservation_id : elle sert l'unique acces
-- frequent (les lignes d'une reservation) et la suppression en cascade. Aucun
-- autre index n'est cree tant qu'aucune requete ne le justifie.

alter table public.reservation_items enable row level security;

drop policy if exists reservation_items_select_participant on public.reservation_items;
create policy reservation_items_select_participant on public.reservation_items
  for select using (
    exists (select 1 from public.reservations r
             where r.id = reservation_items.reservation_id
               and ((select auth.uid()) = r.client_id or (select auth.uid()) = r.estab_owner_id))
  );

-- Aucune politique d'ecriture : seules les fonctions ci-dessous, en
-- security definer, alimentent cette table.
revoke insert, update, delete on table public.reservation_items from anon, authenticated;

create or replace function public.enforce_reservation_items()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  _items jsonb; _somme numeric := 0; _nuits int; _attendu numeric;
  _prix_chambre numeric; _it jsonb; _q int; _p numeric; _combine boolean;
begin
  -- Voie de service inchangee, exactement comme les declencheurs voisins.
  if auth.uid() is null then return new; end if;

  _items := new.data->'items';
  -- Deploiement en deux temps : sans commande, comportement actuel inchange.
  if _items is null or jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    return new;
  end if;
  if new.status in ('cancelled','refused') then return new; end if;

  _combine := coalesce((new.data->>'isCombo')::boolean, false);

  for _it in select value from jsonb_array_elements(_items) loop
    _q := coalesce(nullif(_it->>'quantity','')::int, 1);
    if _q <= 0 then
      raise exception 'Quantité invalide pour un plat commandé' using errcode='check_violation';
    end if;
    select d.price into _p
      from public.establishment_dishes d
     where d.id = _it->>'dish_id'
       and d.establishment_id = new.establishment_id
       and d.available is distinct from false;
    if _p is null then
      raise exception 'Plat indisponible ou inconnu : %. Rechargez la carte et recommencez.', coalesce(_it->>'dish_id','?')
        using errcode='check_violation';
    end if;
    _somme := _somme + (_p * _q);
  end loop;

  if _combine then
    -- Regle lue dans App.jsx : comboTotal = prix chambre + repas, puis x nuits.
    if new.room_id is null then
      raise exception 'Un séjour combiné doit désigner une chambre' using errcode='check_violation';
    end if;
    select r.price into _prix_chambre from public.establishment_rooms r
     where r.id = new.room_id and r.establishment_id = new.establishment_id
       and r.available is distinct from false;
    if _prix_chambre is null then
      raise exception 'Chambre indisponible ou inconnue' using errcode='check_violation';
    end if;
    if new.check_in is null or new.check_out is null then
      raise exception 'Un séjour combiné doit préciser ses dates' using errcode='check_violation';
    end if;
    _nuits := greatest((new.check_out - new.check_in), 1);
    _attendu := round((_prix_chambre + _somme) * _nuits, 2);
  else
    -- Regle lue dans App.jsx : totalPrice = dishTotal x tableCount, tableCount
    -- etant transmis dans la colonne quantity par saveReservation.
    _attendu := round(_somme * coalesce(new.quantity, 1), 2);
  end if;

  if new.total_price is null then
    new.total_price := _attendu;
  elsif round(new.total_price, 2) <> _attendu then
    raise exception 'Le tarif a changé (% € attendus). Rechargez la fiche de l''établissement et recommencez.', _attendu
      using errcode='check_violation';
  end if;
  new.currency := coalesce(new.currency, 'EUR');
  return new;
end $function$;

create or replace function public.ecrire_reservation_items()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare _items jsonb;
begin
  if auth.uid() is null then return null; end if;
  _items := new.data->'items';
  if _items is null or jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    return null;
  end if;
  if new.status in ('cancelled','refused') then return null; end if;

  insert into public.reservation_items
    (reservation_id, ligne, dish_id, establishment_id, name, unit_price, quantity)
  select new.id,
         x.ord::int,
         x.value->>'dish_id',
         new.establishment_id,
         d.name,
         d.price,
         coalesce(nullif(x.value->>'quantity','')::int, 1)
    from jsonb_array_elements(_items) with ordinality as x(value, ord)
    join public.establishment_dishes d
      on d.id = x.value->>'dish_id'
     and d.establishment_id = new.establishment_id
  on conflict (reservation_id, ligne) do nothing;

  return null;
end $function$;

-- Ordre des declencheurs. A timing egal, PostgreSQL les execute par ordre
-- alphabetique. « trg_c_ » passe donc APRES trg_a_protect_reservation_status,
-- qui resout establishment_id, et AVANT trg_enforce_reservation_price, qui
-- reste inchange et continue de sortir sur room_id nul ou sur isCombo.
drop trigger if exists trg_c_enforce_reservation_items on public.reservations;
create trigger trg_c_enforce_reservation_items
  before insert on public.reservations
  for each row execute function public.enforce_reservation_items();

drop trigger if exists trg_z_ecrire_reservation_items on public.reservations;
create trigger trg_z_ecrire_reservation_items
  after insert on public.reservations
  for each row execute function public.ecrire_reservation_items();
