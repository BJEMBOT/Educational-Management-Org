-- Finance access PIN (validated via SECURITY DEFINER functions; only developers can reset)

CREATE TABLE finance_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pin CHAR(5) NOT NULL CHECK (pin ~ '^\d{5}$'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

INSERT INTO finance_settings (id, pin) VALUES (1, '19146');

ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION validate_finance_pin(input_pin TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM finance_settings
    WHERE id = 1 AND pin = input_pin
  );
$$;

CREATE OR REPLACE FUNCTION reset_finance_pin(current_pin TEXT, new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_pin !~ '^\d{5}$' THEN
    RAISE EXCEPTION 'Access code must be exactly 5 digits';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role::text = 'developer'
  ) THEN
    RAISE EXCEPTION 'Only developers can reset the finance access code';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM finance_settings
    WHERE id = 1 AND pin = current_pin
  ) THEN
    RETURN FALSE;
  END IF;

  UPDATE finance_settings
  SET pin = new_pin, updated_at = now(), updated_by = auth.uid()
  WHERE id = 1;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_finance_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_finance_pin(TEXT, TEXT) TO authenticated;
