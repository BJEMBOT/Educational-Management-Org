-- Link interventions to administrator profiles for auto-assignment

ALTER TABLE interventions
  ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX interventions_owner_id_idx ON interventions(owner_id);

-- Backfill owner_id from existing owner names where possible
UPDATE interventions i
SET owner_id = p.id
FROM profiles p
WHERE i.owner_id IS NULL
  AND p.name IS NOT NULL
  AND lower(trim(p.name)) = lower(trim(i.owner));
