-- LE TICKET DE RESERVATION DEVIENT INFALSIFIABLE, ET LA CONSOMMATION L'EXIGE
--
-- Constat mesure. Le QR presente au client ne contenait que l'identifiant brut
-- de la reservation (App.jsx, QRTicket : QRCodeSVG value={id}). N'importe qui
-- connaissant un identifiant pouvait fabriquer le meme code.
-- Surtout : la consommation n'etait qu'un UPDATE de statut ordinaire
-- (scanQR -> _appliqueStatut -> updateReservationStatus), et
-- protect_reservation_status autorise le proprietaire a poser « consumed » sur
-- n'importe laquelle de ses reservations. Le ticket ne prouvait donc rien, et
-- un vrai scanner n'y aurait rien change tant que cette voie restait ouverte.
--
-- Correction : le serveur SIGNE le ticket, et seule une fonction qui VERIFIE
-- cette signature peut faire passer une reservation en « consumed ».
--
-- Ce qui reste strictement identique : les transitions confirmed et refused par
-- l'etablissement, l'annulation par le client, tous les autres statuts, et le
-- comportement de la voie de service (auth.uid() null), inchange.
--
-- Mesures APRES, en transaction annulee, 12 cas sur 12 :
--   01 le client obtient son ticket            -> emis
--   02 ticket d'autrui                         -> refuse
--   03 UPDATE direct en consumed               -> sans effet (reste confirmed)
--   04 ticket falsifie                         -> invalide
--   05 ticket sans signature                   -> invalide
--   06 scanne par un autre etablissement       -> pas_votre_etablissement
--   07 le bon etablissement consomme           -> consommee
--   08 statut apres consommation               -> consumed
--   09 second scan                             -> deja_consommee (idempotent)
--   10 reservation en attente                  -> statut_incompatible
--   11 le pro confirme toujours                -> confirmed
--   12 le client annule toujours               -> cancelled

create table if not exists public.platform_secrets (
  name       text primary key,
  value      text not null,
  created_at timestamptz not null default now()
);
alter table public.platform_secrets enable row level security;
revoke all on table public.platform_secrets from anon, authenticated;

insert into public.platform_secrets (name, value)
select 'ticket_hmac', encode(extensions.gen_random_bytes(32), 'hex')
where not exists (select 1 from public.platform_secrets where name = 'ticket_hmac');

create or replace function public.emettre_ticket_reservation(p_reservation_id text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare _cle text; _client uuid;
begin
  if auth.uid() is null then raise exception 'Non autorise'; end if;
  select client_id into _client from public.reservations where id = p_reservation_id;
  if _client is null or _client <> auth.uid() then
    raise exception 'Non autorise';
  end if;
  select value into _cle from public.platform_secrets where name = 'ticket_hmac';
  if _cle is null then raise exception 'Signature indisponible'; end if;
  -- base64url sans remplissage : le code QR reste court et sans caractere ambigu
  return p_reservation_id || '.' ||
         translate(encode(extensions.hmac(p_reservation_id, _cle, 'sha256'), 'base64'), '+/=', '-_');
end $$;

create or replace function public.consommer_ticket_reservation(p_ticket text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare _cle text; _id text; _sig text; _attendue text; _r record; _proprio uuid;
begin
  if auth.uid() is null then raise exception 'Non autorise'; end if;
  if p_ticket is null or position('.' in p_ticket) = 0 then
    return jsonb_build_object('etat','invalide');
  end if;
  _id  := split_part(p_ticket, '.', 1);
  _sig := split_part(p_ticket, '.', 2);

  select value into _cle from public.platform_secrets where name = 'ticket_hmac';
  if _cle is null then raise exception 'Signature indisponible'; end if;
  _attendue := translate(encode(extensions.hmac(_id, _cle, 'sha256'), 'base64'), '+/=', '-_');
  if _sig is distinct from _attendue then
    return jsonb_build_object('etat','invalide');
  end if;

-- Verrou : la ligne est prise avant toute decision.
  select * into _r from public.reservations where id = _id for update;
  if not found then return jsonb_build_object('etat','introuvable'); end if;

  -- Le proprietaire fait foi. estab_owner_id est une copie posee a l'insertion ;
  -- lorsqu'elle est absente, on remonte a l'etablissement, exactement comme le
  -- fait protect_reservation_status lui-meme.
  _proprio := coalesce(_r.estab_owner_id,
                       (select e.owner_id from public.establishments e where e.id = _r.establishment_id));
  if _proprio is null or _proprio <> auth.uid() then
    return jsonb_build_object('etat','pas_votre_etablissement');
  end if;

  if _r.status = 'consumed' then
    return jsonb_build_object('etat','deja_consommee','reservation',_r.id);
  end if;
  if _r.status <> 'confirmed' then
    return jsonb_build_object('etat','statut_incompatible','statut',_r.status);
  end if;

  perform set_config('hp.ticket_verifie', '1', true);
  update public.reservations set status = 'consumed', updated_at = now() where id = _r.id;
  perform set_config('hp.ticket_verifie', '', true);

  return jsonb_build_object('etat','consommee','reservation',_r.id);
end $$;

revoke all on function public.emettre_ticket_reservation(text)   from public, anon;
revoke all on function public.consommer_ticket_reservation(text) from public, anon;
grant execute on function public.emettre_ticket_reservation(text)   to authenticated;
grant execute on function public.consommer_ticket_reservation(text) to authenticated;

create or replace function public.protect_reservation_status()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare me uuid := auth.uid(); _owner uuid; _eid text; _trouve boolean := false;
begin
  if tg_op='INSERT' then
    if me is not null then
      new.status:='pending';
      if new.establishment_id is not null then
        select owner_id,id into _owner,_eid from public.establishments where id=new.establishment_id;
        if found then _trouve:=true; end if; end if;
      if not _trouve and new.estab_id is not null then
        select owner_id,id into _owner,_eid from public.establishments where id=new.estab_id;
        if found then _trouve:=true; end if; end if;
      if not _trouve and new.estab_id is not null then
        select owner_id,id into _owner,_eid from public.establishments where name=new.estab_id order by created_at,id limit 1;
        if found then _trouve:=true; end if; end if;
      if not _trouve then
        raise exception 'Établissement introuvable pour cette réservation' using errcode='check_violation'; end if;
      new.estab_owner_id:=_owner; new.establishment_id:=_eid;
    end if; return new; end if;
  if me is null then return new; end if;
  if new.status is distinct from old.status then
    if me=old.client_id then
      if not (new.status='cancelled' and old.status in ('pending','confirmed')) then new.status:=old.status; end if;
    elsif me=old.estab_owner_id then
      -- « consumed » n'est plus atteignable sans ticket verifie : c'est la
      -- fonction consommer_ticket_reservation qui pose ce drapeau, apres avoir
      -- valide la signature du ticket presente par le client.
      if new.status='consumed' and coalesce(current_setting('hp.ticket_verifie', true),'') <> '1' then
        new.status:=old.status;
      elsif new.status not in ('confirmed','refused','consumed') then
        new.status:=old.status;
      end if;
    else new.status:=old.status; end if; end if;
  if new.estab_owner_id is distinct from old.estab_owner_id then new.estab_owner_id:=old.estab_owner_id; end if;
  if new.establishment_id is distinct from old.establishment_id then new.establishment_id:=old.establishment_id; end if;
  return new; end $function$;
