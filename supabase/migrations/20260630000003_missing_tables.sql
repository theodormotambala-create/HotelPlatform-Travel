-- =============================================================================
-- MIGRATION : Tables manquantes — likes, commentaires, signalements, conversations
-- Ces tables sont utilisées dans le code mais absentes du schéma initial.
-- =============================================================================

-- 1. LIKES sur les posts du feed
CREATE TABLE IF NOT EXISTS post_likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    TEXT NOT NULL,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post   ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user   ON post_likes(user_id);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_likes_read"   ON post_likes FOR SELECT USING (TRUE);
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- 2. COMMENTAIRES sur les posts du feed
CREATE TABLE IF NOT EXISTS post_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     TEXT NOT NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body        TEXT NOT NULL,
  reply_to_id UUID REFERENCES post_comments(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at);
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_comments_read"   ON post_comments FOR SELECT USING (TRUE);
CREATE POLICY "post_comments_insert" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_delete" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- 3. SIGNALEMENTS de contenu
CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','user','establishment')),
  target_id   TEXT NOT NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_read_own" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- 4. CONVERSATIONS du chat
CREATE TABLE IF NOT EXISTS conversations (
  id           TEXT PRIMARY KEY,
  participant1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant1);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant2);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_read" ON conversations FOR SELECT
  USING (participant1 = auth.uid() OR participant2 = auth.uid());
CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (participant1 = auth.uid() OR participant2 = auth.uid());
CREATE POLICY "conversations_update" ON conversations FOR UPDATE
  USING (participant1 = auth.uid() OR participant2 = auth.uid());
