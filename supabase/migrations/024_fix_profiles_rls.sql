-- Fix infinite recursion (42P17) on profiles RLS from 023_partner_users.sql

CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role::text <> 'partner'
  );
$$;

GRANT EXECUTE ON FUNCTION is_internal_user() TO authenticated;

DROP POLICY IF EXISTS "Scoped read profiles" ON profiles;

CREATE POLICY "Scoped read profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR is_internal_user()
    OR (
      get_current_partner_id() IS NOT NULL
      AND partner_id = get_current_partner_id()
    )
  );
