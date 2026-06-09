-- Link certifications to schools and optional free-text location

ALTER TABLE certifications
  ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  ADD COLUMN location TEXT;

CREATE INDEX certifications_school_idx ON certifications(school_id);

-- Backfill demo certifications with first school when available
UPDATE certifications c
SET school_id = (SELECT id FROM schools ORDER BY name LIMIT 1)
WHERE c.school_id IS NULL
  AND EXISTS (SELECT 1 FROM schools);
