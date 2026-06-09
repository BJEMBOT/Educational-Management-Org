-- Collaboration: shared calendar, messaging, and presence

CREATE TYPE calendar_event_type AS ENUM (
  'pd',
  'coaching',
  'intervention',
  'meeting',
  'deadline',
  'other'
);

CREATE TYPE presence_status AS ENUM ('online', 'away', 'offline');

-- Custom org calendar events (aggregated PD/coaching/interventions queried in app)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type calendar_event_type NOT NULL DEFAULT 'meeting',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX calendar_events_start_idx ON calendar_events(start_at);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  dm_key TEXT UNIQUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX conversation_participants_user_idx ON conversation_participants(user_id);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id, created_at);

CREATE TABLE user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status presence_status NOT NULL DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read calendar events"
  ON calendar_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage calendar events"
  ON calendar_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role::text IN ('admin', 'regional_manager', 'staff', 'coach', 'consultant', 'developer')
    )
  );

CREATE POLICY "Staff can update calendar events"
  ON calendar_events FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role::text IN ('admin', 'regional_manager', 'staff', 'coach', 'consultant', 'developer')
    )
  );

CREATE POLICY "Staff can delete calendar events"
  ON calendar_events FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role::text IN ('admin', 'regional_manager', 'staff', 'coach', 'consultant', 'developer')
    )
  );

CREATE POLICY "Participants read conversations"
  ON conversations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users create conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Participants update conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants read memberships"
  ON conversation_participants FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users join conversations they create"
  ON conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Participants update own read state"
  ON conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Participants read messages"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users read presence"
  ON user_presence FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users manage own presence"
  ON user_presence FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own presence"
  ON user_presence FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- Sample custom calendar event
INSERT INTO calendar_events (title, description, event_type, start_at, end_at, location)
VALUES (
  'Network Leadership Sync',
  'Monthly cross-school leadership meeting',
  'meeting',
  date_trunc('month', CURRENT_DATE) + INTERVAL '14 days' + TIME '10:00',
  date_trunc('month', CURRENT_DATE) + INTERVAL '14 days' + TIME '11:30',
  'EMO Central Office'
);
