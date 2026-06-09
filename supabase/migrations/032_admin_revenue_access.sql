-- Allow admins to access revenue data (still gated by finance PIN in the app)

DROP POLICY IF EXISTS "Developers can read revenue" ON revenue_entries;
DROP POLICY IF EXISTS "Developers can insert revenue" ON revenue_entries;
DROP POLICY IF EXISTS "Developers can update revenue" ON revenue_entries;
DROP POLICY IF EXISTS "Developers can delete revenue" ON revenue_entries;

CREATE POLICY "Finance users can read revenue"
  ON revenue_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role::text IN ('developer', 'admin')
    )
  );

CREATE POLICY "Finance users can insert revenue"
  ON revenue_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role::text IN ('developer', 'admin')
    )
  );

CREATE POLICY "Finance users can update revenue"
  ON revenue_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role::text IN ('developer', 'admin')
    )
  );

CREATE POLICY "Finance users can delete revenue"
  ON revenue_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role::text IN ('developer', 'admin')
    )
  );
