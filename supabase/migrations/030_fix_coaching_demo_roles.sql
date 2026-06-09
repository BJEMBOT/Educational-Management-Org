-- Migration 029 demo seed incorrectly set developer/admin accounts to role=teacher
-- when no teacher profiles existed. Restore privileged users who are coaches on cycles.

UPDATE profiles p
SET
  role = 'developer',
  teaching_evaluation = NULL,
  name = CASE
    WHEN p.name = 'Demo Teacher (Developing)' THEN NULL
    ELSE p.name
  END
WHERE p.role::text = 'teacher'
  AND EXISTS (
    SELECT 1 FROM coaching_cycles cc WHERE cc.coach_id = p.id
  );

-- Second demo teacher slot may have demoted another profile; restore if they coach cycles
-- or if they are the only non-partner internal user incorrectly set to teacher.
UPDATE profiles p
SET role = 'admin', teaching_evaluation = NULL
WHERE p.role::text = 'teacher'
  AND p.name = 'Demo Teacher (Effective)';
