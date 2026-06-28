-- =============================================================================
-- RGPD Art. 17 — Droit à l'effacement
-- Fonction de suppression complète d'un compte utilisateur
-- -----------------------------------------------------------------------------
-- COMMENT APPLIQUER :
--   Dashboard Supabase → SQL Editor → coller ce fichier → Run
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Avis clients
  DELETE FROM public.reviews WHERE client_id = _uid;

  -- 2. Réservations
  DELETE FROM public.reservations WHERE client_id = _uid;

  -- 3. Profil utilisateur
  DELETE FROM public.profiles WHERE user_id = _uid;

  -- 4. Posts (compte pro)
  DELETE FROM public.posts WHERE owner_id = _uid;

  -- 5. Messages
  DELETE FROM public.messages WHERE sender = _uid::text;

  -- 6. Compte auth — déclenche ON DELETE CASCADE sur toutes les FK restantes
  DELETE FROM auth.users WHERE id = _uid;
END;
$$;

-- Accès : utilisateurs authentifiés uniquement (chacun supprime son propre compte)
REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
