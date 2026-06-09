-- Assign org administrators to all schools for intervention routing

INSERT INTO user_school_assignments (user_id, school_id)
SELECT p.id, s.id
FROM profiles p
CROSS JOIN schools s
WHERE p.role IN ('admin', 'regional_manager')
ON CONFLICT DO NOTHING;

-- Backfill any interventions still missing owner_id
UPDATE interventions i
SET owner_id = (
  SELECT usa.user_id
  FROM user_school_assignments usa
  JOIN profiles p ON p.id = usa.user_id
  WHERE usa.school_id = i.school_id
    AND p.role IN ('admin', 'regional_manager')
  ORDER BY CASE p.role WHEN 'admin' THEN 0 ELSE 1 END
  LIMIT 1
)
WHERE i.owner_id IS NULL;

UPDATE interventions i
SET owner = COALESCE(p.name, i.owner)
FROM profiles p
WHERE i.owner_id = p.id
  AND p.name IS NOT NULL;
