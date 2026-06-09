-- Coaching check-in scheduling, teacher evaluations, and frequency fields

CREATE TYPE teaching_evaluation AS ENUM (
  'exemplary',
  'effective',
  'developing',
  'needs_improvement'
);

CREATE TYPE check_in_frequency AS ENUM (
  'weekly',
  'biweekly',
  'monthly',
  'quarterly'
);

CREATE TYPE frequency_source AS ENUM (
  'evaluation_default',
  'coach_override'
);

CREATE TYPE coaching_support_level AS ENUM (
  'high',
  'standard',
  'light'
);

CREATE TYPE coaching_check_in_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'missed'
);

ALTER TABLE profiles
  ADD COLUMN teaching_evaluation teaching_evaluation;

ALTER TABLE coaching_cycles
  ADD COLUMN check_in_frequency check_in_frequency NOT NULL DEFAULT 'biweekly',
  ADD COLUMN frequency_source frequency_source NOT NULL DEFAULT 'evaluation_default',
  ADD COLUMN support_level coaching_support_level NOT NULL DEFAULT 'standard',
  ADD COLUMN next_check_in_at TIMESTAMPTZ;

CREATE TABLE coaching_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES coaching_cycles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status coaching_check_in_status NOT NULL DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX coaching_check_ins_cycle_id_idx ON coaching_check_ins(cycle_id);
CREATE INDEX coaching_check_ins_scheduled_at_idx ON coaching_check_ins(scheduled_at);
CREATE INDEX coaching_check_ins_status_idx ON coaching_check_ins(status);

ALTER TABLE coaching_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaching check-ins access"
  ON coaching_check_ins FOR ALL TO authenticated
  USING (true);

-- Demo seed: sample cycles when coach + teacher profiles exist
DO $$
DECLARE
  coach_id UUID;
  teacher_biweekly UUID;
  teacher_monthly UUID;
  school_id UUID;
  cycle_biweekly UUID;
  cycle_monthly UUID;
  check_at TIMESTAMPTZ;
  i INT;
BEGIN
  SELECT id INTO coach_id
  FROM profiles
  WHERE role::text IN ('coach', 'consultant', 'admin', 'developer')
  ORDER BY created_at
  LIMIT 1;

  SELECT id INTO school_id FROM schools ORDER BY name LIMIT 1;

  IF coach_id IS NULL OR school_id IS NULL THEN
    RETURN;
  END IF;

  -- Use existing teachers or promote profiles for demo
  SELECT id INTO teacher_biweekly
  FROM profiles
  WHERE role::text = 'teacher' AND teaching_evaluation = 'developing'
  LIMIT 1;

  IF teacher_biweekly IS NULL THEN
    SELECT id INTO teacher_biweekly
    FROM profiles
    WHERE role::text = 'teacher'
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF teacher_biweekly IS NULL THEN
    UPDATE profiles
    SET role = 'teacher', teaching_evaluation = 'developing', name = COALESCE(name, 'Demo Teacher (Developing)')
    WHERE id = coach_id
    RETURNING id INTO teacher_biweekly;
  ELSE
    UPDATE profiles SET teaching_evaluation = 'developing' WHERE id = teacher_biweekly;
  END IF;

  SELECT id INTO teacher_monthly
  FROM profiles
  WHERE role::text = 'teacher' AND id <> teacher_biweekly
  ORDER BY created_at
  LIMIT 1;

  IF teacher_monthly IS NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE id <> teacher_biweekly LIMIT 1
  ) THEN
    SELECT id INTO teacher_monthly
    FROM profiles
    WHERE id <> teacher_biweekly
    ORDER BY created_at
    LIMIT 1;

    UPDATE profiles
    SET role = 'teacher', teaching_evaluation = 'effective', name = COALESCE(name, 'Demo Teacher (Effective)')
    WHERE id = teacher_monthly;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM coaching_cycles LIMIT 1) THEN
    INSERT INTO coaching_cycles (
      coach_id, teacher_id, school_id, focus_area, status, start_date,
      check_in_frequency, frequency_source, support_level, next_check_in_at
    )
    VALUES (
      coach_id, teacher_biweekly, school_id,
      'Differentiated instruction', 'active', CURRENT_DATE,
      'biweekly', 'evaluation_default', 'standard',
      (CURRENT_DATE + INTERVAL '14 days')::timestamptz
    )
    RETURNING id INTO cycle_biweekly;

    check_at := (CURRENT_DATE + INTERVAL '14 days')::timestamptz;
    FOR i IN 0..5 LOOP
      INSERT INTO coaching_check_ins (cycle_id, scheduled_at, status)
      VALUES (cycle_biweekly, check_at + (i * INTERVAL '14 days'), 'scheduled');
    END LOOP;

    IF teacher_monthly IS NOT NULL THEN
      INSERT INTO coaching_cycles (
        coach_id, teacher_id, school_id, focus_area, status, start_date,
        check_in_frequency, frequency_source, support_level, next_check_in_at
      )
      VALUES (
        coach_id, teacher_monthly, school_id,
        'Classroom management', 'active', CURRENT_DATE,
        'monthly', 'evaluation_default', 'light',
        (CURRENT_DATE + INTERVAL '1 month')::timestamptz
      )
      RETURNING id INTO cycle_monthly;

      check_at := (CURRENT_DATE + INTERVAL '1 month')::timestamptz;
      FOR i IN 0..5 LOOP
        INSERT INTO coaching_check_ins (cycle_id, scheduled_at, status)
        VALUES (cycle_monthly, check_at + (i * INTERVAL '1 month'), 'scheduled');
      END LOOP;
    END IF;
  END IF;
END $$;
