-- Default chat availability to on when presence is first created

ALTER TABLE user_presence
  ALTER COLUMN available_to_chat SET DEFAULT true;
