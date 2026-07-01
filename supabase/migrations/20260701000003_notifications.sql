-- =============================================================================
-- MIGRATION Phase 3 : Notifications — Supabase source unique de vérité
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         text        NOT NULL,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icon       text        NOT NULL DEFAULT 'Bell',
  color      text        NOT NULL DEFAULT '#6366f1',
  title      text        NOT NULL,
  body       text        NOT NULL,
  time       text        NOT NULL DEFAULT 'maintenant',
  read       boolean     NOT NULL DEFAULT false,
  tab        text        NOT NULL DEFAULT 'feed',
  pref_key   text        NOT NULL DEFAULT 'reservation',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications privées : chaque utilisateur accède uniquement aux siennes
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE USING (user_id = auth.uid());
