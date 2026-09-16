-- HEURE D'ARRIVEE D'UN ETABLISSEMENT
--
-- Pourquoi : la politique d'annulation se calcule en heures restantes avant
-- l'arrivee. Or reservations.check_in est de type « date » : il n'existe
-- AUCUNE heure d'arrivee en base (mesure : 21 colonnes sur establishments,
-- aucune de type time ; 7 colonnes sur platform_settings, aucune non plus).
-- Sans cette information, la regle des 24 h / 48 h est incalculable.
--
-- Pourquoi le fuseau EN MEME TEMPS : une heure seule est ambigue pour une
-- plateforme mondiale. « 14:00 » a Dakar et « 14:00 » a Tokyo ne designent pas
-- le meme instant. Sans fuseau, le serveur interpreterait toutes les heures en
-- UTC et le calcul serait faux partout ailleurs. L'heure et le fuseau ne se
-- separent pas.
--
-- Choix de l'emplacement, etabli par lecture et non suppose :
--   - ensure_pro_establishment ne synchronise que type, name, location,
--     description, img, verified, is_premium, svc_mode : une nouvelle colonne
--     sur establishments ne sera JAMAIS ecrasee par ce declencheur ;
--   - protect_establishment_flags ne verrouille que is_premium, verified et
--     stripe_account_id : la nouvelle colonne reste modifiable par son
--     proprietaire ;
--   - la politique establishments_update_owner autorise deja le proprietaire a
--     ecrire sur sa fiche (owner_id = auth.uid()).
--
-- Aucune valeur par defaut n'est inventee. Les colonnes naissent a NULL :
-- l'heure plateforme releve d'une decision d'exploitation, pas du code. Tant
-- qu'aucune heure n'est connue, le calcul d'annulation devra REFUSER de
-- conclure plutot que de supposer minuit.
--
-- Additif et sans effet de bord : aucune ligne existante n'est modifiee, aucune
-- fonction, aucune vue ni aucune RPC ne change de signature.
--
-- Mesures APRES, en transaction annulee (7 cas sur 7) :
--   1 le proprietaire regle SA fiche            -> ACCEPTE
--   2 fuseau horaire inconnu                    -> REFUSE
--   3 regler la fiche d'AUTRUI                  -> REFUSE (0 ligne)
--   4 is_premium / verified toujours proteges   -> false
--   5 heure conservee apres synchro du profil   -> 15:00:00 / Africa/Dakar
--   6 check_in + heure + fuseau -> instant reel -> 2026-09-27 15:00:00+00
--   7 autres etablissements inchanges           -> 0

alter table public.establishments
  add column if not exists check_in_time time without time zone,
  add column if not exists timezone      text;

comment on column public.establishments.check_in_time is
  'Heure d''arrivee locale declaree par l''etablissement. NULL = non renseignee, repli sur platform_settings.default_check_in_time.';
comment on column public.establishments.timezone is
  'Fuseau horaire IANA de l''etablissement (ex. Africa/Dakar). Indispensable pour convertir check_in + check_in_time en instant reel.';

alter table public.platform_settings
  add column if not exists default_check_in_time time without time zone,
  add column if not exists default_timezone      text;

-- Le fuseau est valide COTE SERVEUR : le frontend n'est jamais une frontiere.
-- Un nom inconnu est refuse, sinon la conversion en instant echouerait plus
-- tard, au moment du calcul d'un remboursement — c'est-a-dire au pire moment.
create or replace function public.valider_fuseau_etablissement()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.timezone is not null then
    if not exists (select 1 from pg_timezone_names z where z.name = new.timezone) then
      raise exception 'Fuseau horaire inconnu : %', new.timezone
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_valider_fuseau_etablissement on public.establishments;
create trigger trg_valider_fuseau_etablissement
  before insert or update of timezone on public.establishments
  for each row execute function public.valider_fuseau_etablissement();
