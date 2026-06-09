-- Chat availability + reliable direct conversation creation

ALTER TABLE user_presence
  ADD COLUMN available_to_chat BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION create_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
  dm TEXT;
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF other_user_id = caller THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  dm := LEAST(caller::text, other_user_id::text) || ':' || GREATEST(caller::text, other_user_id::text);

  SELECT id INTO conv_id FROM conversations WHERE dm_key = dm LIMIT 1;
  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  INSERT INTO conversations (is_group, dm_key, created_by)
  VALUES (false, dm, caller)
  RETURNING id INTO conv_id;

  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (conv_id, caller), (conv_id, other_user_id);

  RETURN conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_direct_conversation(UUID) TO authenticated;
