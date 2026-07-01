-- =============================================================================
-- MIGRATION Phase 2 : Favoris posts — Supabase source unique de vérité
-- Crée la table post_favorites pour les posts mis en favoris par les utilisateurs.
-- Les favoris établissements sont déjà dans profiles.fav_estabs (aucun changement).
-- =============================================================================

CREATE TABLE IF NOT EXISTS post_favorites (
  user_id    uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    text  NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_favorites_user ON post_favorites(user_id);

ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;

-- Favoris privés : chaque utilisateur ne voit QUE ses propres favoris
CREATE POLICY "post_favorites_select" ON post_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "post_favorites_insert" ON post_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "post_favorites_delete" ON post_favorites
  FOR DELETE USING (user_id = auth.uid());
