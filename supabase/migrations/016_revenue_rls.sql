-- Revenue RLS and seed (separate migration so developer enum value is committed)

CREATE POLICY "Developers can read revenue"
  ON revenue_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role::text = 'developer'
    )
  );

CREATE POLICY "Developers can insert revenue"
  ON revenue_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role::text = 'developer'
    )
  );

CREATE POLICY "Developers can update revenue"
  ON revenue_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role::text = 'developer'
    )
  );

CREATE POLICY "Developers can delete revenue"
  ON revenue_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role::text = 'developer'
    )
  );

-- Sample revenue for demo
INSERT INTO revenue_entries (description, amount, source, school_id, revenue_date, notes)
SELECT
  'Annual management contract — ' || s.name,
  CASE s.name
    WHEN 'Lincoln Elementary' THEN 185000
    WHEN 'Riverside Academy' THEN 240000
    WHEN 'Oakwood Middle School' THEN 210000
    WHEN 'Summit High School' THEN 320000
    WHEN 'Harborview K-8' THEN 145000
    WHEN 'Pinecrest Academy' THEN 275000
    ELSE 150000
  END,
  'contract',
  s.id,
  DATE_TRUNC('year', CURRENT_DATE)::date,
  'FY recurring contract'
FROM schools s;

INSERT INTO revenue_entries (description, amount, source, revenue_date, notes) VALUES
  ('District-wide PD package', 48000, 'pd', (CURRENT_DATE - INTERVAL '2 months')::date, 'BrightPath PD Solutions'),
  ('MTSS consulting retainer Q1', 62500, 'consulting', (CURRENT_DATE - INTERVAL '1 month')::date, 'Summit Instructional Partners'),
  ('Federal improvement grant', 120000, 'grant', (CURRENT_DATE - INTERVAL '3 months')::date, 'Multi-school allocation');

-- Promote first profile to developer for demo access (adjust in Supabase as needed)
UPDATE profiles SET role = 'developer'
WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);
