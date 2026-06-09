-- Set existing users to admin and seed demo PD/coaching data

UPDATE profiles SET role = 'admin' WHERE role = 'staff';

-- Create a demo teacher profile placeholder via temp approach:
-- Seed coaching/growth data for the first admin user if no plans exist
DO $$
DECLARE
  admin_id UUID;
  school_id UUID;
BEGIN
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  SELECT id INTO school_id FROM schools ORDER BY name LIMIT 1;

  IF admin_id IS NULL OR school_id IS NULL THEN
    RETURN;
  END IF;

  -- Growth plan for admin (demo)
  IF NOT EXISTS (SELECT 1 FROM growth_plans WHERE user_id = admin_id) THEN
    INSERT INTO growth_plans (user_id, school_id, school_year, status)
    VALUES (admin_id, school_id, '2025-26', 'active');
  END IF;

  -- Certification with expiring status for notification demo
  IF NOT EXISTS (SELECT 1 FROM certifications WHERE user_id = admin_id) THEN
    INSERT INTO certifications (user_id, certification_type, issued_date, expiry_date, status, notes)
    VALUES
      (admin_id, 'State Teaching License', '2020-08-15', '2027-08-15', 'active', 'Renewal not due'),
      (admin_id, 'Reading Specialist Endorsement', '2022-01-10', (CURRENT_DATE + INTERVAL '45 days')::date, 'expiring', 'Renew within 90 days');
  END IF;

  -- PD registration for first upcoming event
  INSERT INTO pd_registrations (event_id, user_id, status)
  SELECT e.id, admin_id, 'registered'
  FROM pd_events e
  WHERE e.status = 'scheduled'
    AND NOT EXISTS (
      SELECT 1 FROM pd_registrations r WHERE r.event_id = e.id AND r.user_id = admin_id
    )
  ORDER BY e.start_date
  LIMIT 1;

END $$;
