-- Extended PD event details: virtual meeting links, facilitator, materials

ALTER TABLE pd_events
  ADD COLUMN end_date TIMESTAMPTZ,
  ADD COLUMN facilitator TEXT,
  ADD COLUMN meeting_url TEXT,
  ADD COLUMN meeting_id TEXT,
  ADD COLUMN meeting_passcode TEXT,
  ADD COLUMN materials_url TEXT,
  ADD COLUMN join_instructions TEXT;
