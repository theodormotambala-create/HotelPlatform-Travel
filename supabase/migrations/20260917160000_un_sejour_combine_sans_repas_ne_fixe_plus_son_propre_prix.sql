-- UN SEJOUR COMBINE SANS REPAS NE FIXE PLUS SON PROPRE PRIX
--
-- Constat MESURE, en transaction annulee, en se faisant passer pour un vrai
-- client authentifie :
--   combine AVEC repas, chambre a 100 payee 1 EUR   -> REFUSE (corrige en 6edff33)
--   combine SANS repas, 200 EUR payes 1 EUR         -> ACCEPTE (total=1.00)
--
-- Mon rapport de 6edff33 etait donc incomplet : j'ai annonce « combine paye 1
-- -> refuse », ce qui n'est vrai QUE si des repas sont selectionnes.
--
-- Cause reelle, verifiee dans les trois fonctions concernees :
--   enforce_reservation_price  sort immediatement sur isCombo ;
--   enforce_reservation_items  sort immediatement quand data->'items' est
--                              absent, ce qui est le cas lorsqu'aucun repas
--                              n'est choisi (App.jsx, _lignesCommande renvoie
--                              null sur une selection vide) ;
--   aucune autre fonction ne regarde le prix.
-- Personne ne verifie donc le prix de la chambre d'un sejour combine sans repas.
--
-- Pourquoi la correction est sure des maintenant, alors que l'interface
-- deployee n'envoie pas encore data->'items'. Un discriminateur existe DEJA
-- dans les donnees envoyees par les deux versions de l'interface :
-- data->'comboMeals'. App.jsx ecrit comboMeals:isCombo?e.comboMeals:null, et la
-- reservation HP-776117 presente en base porte bien « comboMeals: [] ».
--   comboMeals non vide -> des repas ont ete factures, leur prix ne peut pas
--                          etre reconstitue sans items : on ne touche a rien ;
--   comboMeals vide     -> aucun repas n'a ete facture, donc le total attendu
--                          est exactement prix de la chambre x nuits.
-- La regle appliquee est celle qui est DEJA ecrite dans App.jsx :
--   comboTotal = prix chambre + repas, puis total = comboTotal x nuits.
-- Sans repas, comboTotal = prix chambre. Rien n'est invente.
--
-- Ce qui reste strictement identique : les sejours combines AVEC repas, toutes
-- les reservations de chambre, toutes les reservations de restaurant, la voie
-- de service (auth.uid() nul), les statuts, les transitions, et le chemin
-- d'insertion en un seul INSERT.
--
-- SIGNALE SANS Y TOUCHER. Une seconde voie echappe encore au controle du prix :
-- un restaurant NON combine reserve depuis le bouton « Reserver » en haut de
-- fiche (App.jsx:3327), sans passer par la selection de plats. Son prix devient
-- price_from x nombre de tables, c'est-a-dire le prix du plat le MOINS CHER
-- multiplie par le nombre de tables. Le serveur saurait recalculer ce montant
-- (price_from est tenu a jour par _price_from_recalc), mais faire benir par le
-- serveur un montant qui n'a pas de sens commercial serait figer une regle que
-- personne n'a decidee. Cela demande un arbitrage du proprietaire, pas une
-- deduction.

create or replace function public.enforce_reservation_items()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  _items jsonb; _somme numeric := 0; _nuits int; _attendu numeric;
  _prix_chambre numeric; _it jsonb; _q int; _p numeric; _combine boolean;
  _repas jsonb;
begin
  -- Voie de service inchangee, exactement comme les declencheurs voisins.
  if auth.uid() is null then return new; end if;
  if new.status in ('cancelled','refused') then return new; end if;

  _items   := new.data->'items';
  _combine := coalesce((new.data->>'isCombo')::boolean, false);

  if _items is null or jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    -- Aucune commande transmise.
    _repas := new.data->'comboMeals';
    if _combine
       and (_repas is null or jsonb_typeof(_repas) <> 'array' or jsonb_array_length(_repas) = 0)
       and new.room_id is not null
       and new.check_in is not null and new.check_out is not null
    then
      -- Sejour combine sans aucun repas : le total attendu est entierement
      -- determine par le catalogue, le serveur peut donc l'imposer.
      select r.price into _prix_chambre from public.establishment_rooms r
       where r.id = new.room_id and r.establishment_id = new.establishment_id
         and r.available is distinct from false;
      if _prix_chambre is null then
        raise exception 'Chambre indisponible ou inconnue' using errcode='check_violation';
      end if;
      _nuits := greatest((new.check_out - new.check_in), 1);
      _attendu := round(_prix_chambre * _nuits, 2);
      if new.total_price is null then
        new.total_price := _attendu;
      elsif round(new.total_price, 2) <> _attendu then
        raise exception 'Le tarif a changé (% € attendus). Rechargez la fiche de l''établissement et recommencez.', _attendu
          using errcode='check_violation';
      end if;
      new.currency := coalesce(new.currency, 'EUR');
    end if;
    -- Deploiement en deux temps : hors de ce cas, comportement inchange.
    return new;
  end if;

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
