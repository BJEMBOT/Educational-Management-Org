-- Fix infinite recursion (42P17) in messaging RLS policies

CREATE OR REPLACE FUNCTION is_conversation_member(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_conversation_member(UUID) TO authenticated;

DROP POLICY IF EXISTS "Participants read conversations" ON conversations;
DROP POLICY IF EXISTS "Participants update conversations" ON conversations;
DROP POLICY IF EXISTS "Participants read memberships" ON conversation_participants;
DROP POLICY IF EXISTS "Participants read messages" ON messages;
DROP POLICY IF EXISTS "Participants send messages" ON messages;

CREATE POLICY "Participants read conversations"
  ON conversations FOR SELECT TO authenticated
  USING (is_conversation_member(id));

CREATE POLICY "Participants update conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (is_conversation_member(id));

CREATE POLICY "Participants read memberships"
  ON conversation_participants FOR SELECT TO authenticated
  USING (is_conversation_member(conversation_id));

CREATE POLICY "Participants read messages"
  ON messages FOR SELECT TO authenticated
  USING (is_conversation_member(conversation_id));

CREATE POLICY "Participants send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND is_conversation_member(conversation_id)
  );
