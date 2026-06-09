-- Expand user roles and school assignments

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teacher';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coach';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'consultant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'board_member';

CREATE TABLE user_school_assignments (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, school_id)
);

CREATE INDEX user_school_assignments_school_idx ON user_school_assignments(school_id);

ALTER TABLE user_school_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read assignments"
  ON user_school_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage assignments"
  ON user_school_assignments FOR ALL TO authenticated USING (true);
