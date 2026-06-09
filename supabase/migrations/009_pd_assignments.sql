-- PD assignment tracking and user groups

ALTER TABLE pd_registrations
  ADD COLUMN assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX pd_registrations_assigned_by_idx ON pd_registrations(assigned_by);

CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_group_members (
  group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX user_group_members_user_idx ON user_group_members(user_id);

ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read groups"
  ON user_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage groups"
  ON user_groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update groups"
  ON user_groups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete groups"
  ON user_groups FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read group members"
  ON user_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage group members"
  ON user_group_members FOR ALL TO authenticated USING (true);
