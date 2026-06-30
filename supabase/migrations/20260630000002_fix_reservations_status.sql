-- =============================================================================
-- MIGRATION : Correction contrainte CHECK sur reservations.status
-- Problème : la contrainte n'acceptait pas 'consumed' et 'refused' utilisés
--            dans le code → toute mise à jour de statut échouait en DB.
-- =============================================================================

ALTER TABLE reservations
  DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE reservations
  ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('confirmed','pending','cancelled','completed','consumed','refused'));
