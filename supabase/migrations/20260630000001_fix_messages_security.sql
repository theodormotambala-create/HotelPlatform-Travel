-- =============================================================================
-- MIGRATION : Correction sécurité messages
-- Problème : messages_read_participant utilisait USING (TRUE) → tout utilisateur
--            connecté pouvait lire TOUTES les conversations de TOUS les autres.
-- Correction : ajout de sender_id UUID + RLS basée sur l'identité réelle.
-- =============================================================================

-- 1. Ajouter les colonnes manquantes utilisées par le code (sender_id, sender_name,
--    reply_to_body, reply_to_sender) pour corriger le mismatch schéma/code
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS sender_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sender_name   TEXT,
  ADD COLUMN IF NOT EXISTS receiver_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reply_to_body TEXT,
  ADD COLUMN IF NOT EXISTS reply_to_sender UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index pour les performances (lecture par conversation + par participant)
CREATE INDEX IF NOT EXISTS idx_messages_sender_id   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- 3. Supprimer l'ancienne policy non sécurisée (USING TRUE = tout le monde lit tout)
DROP POLICY IF EXISTS "messages_read_participant"    ON messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON messages;

-- 4. Nouvelle policy lecture : uniquement l'expéditeur ou le destinataire
CREATE POLICY "messages_read_participant"
  ON messages FOR SELECT
  USING (
    sender_id   = auth.uid() OR
    receiver_id = auth.uid()
  );

-- 5. Nouvelle policy insertion : uniquement pour son propre sender_id
CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    sender_id = auth.uid()
  );

-- 6. Policy mise à jour (marquer comme lu) : uniquement le destinataire
CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- 7. Suppression logique (soft delete) : uniquement l'expéditeur
CREATE POLICY "messages_delete_own"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());
