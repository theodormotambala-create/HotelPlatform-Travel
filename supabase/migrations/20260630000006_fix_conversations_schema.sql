-- Recrée la table conversations avec le schéma attendu par le code
-- (client_id, pro_id, client_name, pro_name, pro_img, pro_verified, pro_type)
DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id           TEXT PRIMARY KEY,
  client_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pro_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL DEFAULT '',
  pro_name     TEXT NOT NULL DEFAULT '',
  pro_img      TEXT,
  pro_verified BOOLEAN DEFAULT FALSE,
  pro_type     TEXT DEFAULT 'hotel',
  last_message TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_pro    ON conversations(pro_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_read" ON conversations FOR SELECT
  USING (client_id = auth.uid() OR pro_id = auth.uid());

CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK (client_id = auth.uid() OR pro_id = auth.uid());

CREATE POLICY "conversations_update" ON conversations FOR UPDATE
  USING (client_id = auth.uid() OR pro_id = auth.uid());

-- Recrée aussi la table messages liée à conversations
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name     TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL,
  reply_to_body   TEXT,
  reply_to_sender UUID,
  deleted         BOOLEAN DEFAULT FALSE,
  read            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_read" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.client_id = auth.uid() OR c.pro_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.client_id = auth.uid() OR c.pro_id = auth.uid())
    )
  );

CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (auth.uid() = sender_id);
