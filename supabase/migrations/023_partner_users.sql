-- Partner user role, profile linkage, and scoped RLS

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

CREATE TYPE partner_user_type AS ENUM ('employee', 'administrator');

ALTER TABLE profiles
  ADD COLUMN partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  ADD COLUMN partner_user_type partner_user_type;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_partner_role_check CHECK (
    role::text <> 'partner'
    OR (partner_id IS NOT NULL AND partner_user_type IS NOT NULL)
  );

CREATE INDEX profiles_partner_id_idx ON profiles(partner_id);

-- Helper: org-wide admins (full partner visibility + management)
CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role::text IN ('admin', 'developer', 'regional_manager')
  );
$$;

CREATE OR REPLACE FUNCTION is_content_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role::text IN ('admin', 'developer')
  );
$$;

CREATE OR REPLACE FUNCTION get_current_partner_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION can_read_all_partners()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role::text IN (
        'admin',
        'developer',
        'regional_manager',
        'staff',
        'board_member'
      )
  );
$$;

GRANT EXECUTE ON FUNCTION is_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_content_editor() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_partner_id() TO authenticated;
GRANT EXECUTE ON FUNCTION can_read_all_partners() TO authenticated;

-- Partners RLS
DROP POLICY IF EXISTS "Authenticated users can read partners" ON partners;
DROP POLICY IF EXISTS "Authenticated users can manage partners" ON partners;
DROP POLICY IF EXISTS "Authenticated users can update partners" ON partners;
DROP POLICY IF EXISTS "Authenticated users can delete partners" ON partners;

CREATE POLICY "Scoped read partners"
  ON partners FOR SELECT TO authenticated
  USING (
    can_read_all_partners()
    OR id = get_current_partner_id()
  );

CREATE POLICY "Org admins insert partners"
  ON partners FOR INSERT TO authenticated
  WITH CHECK (is_org_admin());

CREATE POLICY "Org admins update partners"
  ON partners FOR UPDATE TO authenticated
  USING (is_org_admin());

CREATE POLICY "Org admins delete partners"
  ON partners FOR DELETE TO authenticated
  USING (is_org_admin());

-- Partner schools RLS
DROP POLICY IF EXISTS "Authenticated users can read partner schools" ON partner_schools;
DROP POLICY IF EXISTS "Authenticated users can manage partner schools" ON partner_schools;

CREATE POLICY "Scoped read partner schools"
  ON partner_schools FOR SELECT TO authenticated
  USING (
    can_read_all_partners()
    OR partner_id = get_current_partner_id()
  );

CREATE POLICY "Org admins manage partner schools"
  ON partner_schools FOR ALL TO authenticated
  USING (is_org_admin())
  WITH CHECK (is_org_admin());

-- Profiles: partner users see only colleagues in same org; internal users see all
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;

CREATE POLICY "Scoped read profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles viewer
      WHERE viewer.id = auth.uid()
        AND viewer.role::text <> 'partner'
    )
    OR (
      get_current_partner_id() IS NOT NULL
      AND partner_id = get_current_partner_id()
    )
  );
