-- Succeeding schools to balance portfolio with healthy performers

INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-00000000002f', 'Willowbrook Elementary', 'Metro North', 455),
  ('a1000000-0000-4000-8000-000000000030', 'Seaside Primary', 'Coastal District', 285),
  ('a1000000-0000-4000-8000-000000000031', 'Crestview Honors High', 'Central Valley', 1140),
  ('a1000000-0000-4000-8000-000000000032', 'Lakewood Stars Academy', 'Lakewood Union', 395),
  ('a1000000-0000-4000-8000-000000000033', 'Eastside Excellence Academy', 'Eastside Partnership', 615),
  ('a1000000-0000-4000-8000-000000000034', 'Lakeshore Montessori', 'Lakeshore County', 215),
  ('a1000000-0000-4000-8000-000000000035', 'Golden Gate Lighthouse School', 'Golden Gate Unified', 425),
  ('a1000000-0000-4000-8000-000000000036', 'Silver Creek STEM Center', 'Silver Creek ISD', 545),
  ('a1000000-0000-4000-8000-000000000037', 'Harbor Point Elementary', 'Harbor Point Schools', 370),
  ('a1000000-0000-4000-8000-000000000038', 'Harbor Point Preparatory', 'Harbor Point Schools', 710)
ON CONFLICT (id) DO NOTHING;

-- All goals on_track or 4/5 on_track (≥80% healthy)
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  -- Willowbrook Elementary (100% healthy)
  ('a1000000-0000-4000-8000-00000000002f', 'academic', 'Reading proficiency %', 78, 84, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002f', 'academic', 'Math proficiency %', 75, 81, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002f', 'financial', 'Budget variance %', 5, 2, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-00000000002f', 'staffing', 'Teacher retention %', 92, 94, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002f', 'operations', 'Attendance rate %', 96, 97, 'on_track', '2025-26'),
  -- Seaside Primary (100% healthy)
  ('a1000000-0000-4000-8000-000000000030', 'academic', 'Reading proficiency %', 72, 79, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000030', 'academic', 'Math proficiency %', 70, 76, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000030', 'staffing', 'Teacher retention %', 90, 93, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000030', 'operations', 'Attendance rate %', 95, 98, 'on_track', '2025-26'),
  -- Crestview Honors High (100% healthy — flagship)
  ('a1000000-0000-4000-8000-000000000031', 'academic', 'Graduation rate %', 94, 97, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000031', 'academic', 'College readiness %', 75, 82, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000031', 'academic', 'AP participation %', 45, 52, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000031', 'financial', 'Budget variance %', 5, 1, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000031', 'staffing', 'Teacher retention %', 93, 96, 'on_track', '2025-26'),
  -- Lakewood Stars Academy (80% healthy — bright spot in struggling district)
  ('a1000000-0000-4000-8000-000000000032', 'academic', 'Reading proficiency %', 76, 83, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000032', 'academic', 'Math proficiency %', 74, 80, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000032', 'staffing', 'Teacher retention %', 91, 92, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000032', 'operations', 'Attendance rate %', 96, 97, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000032', 'financial', 'Budget variance %', 5, 6, 'at_risk', 'FY2026'),
  -- Eastside Excellence Academy (100% healthy)
  ('a1000000-0000-4000-8000-000000000033', 'academic', 'Reading proficiency %', 80, 88, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000033', 'academic', 'Math proficiency %', 78, 85, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000033', 'operations', 'Attendance rate %', 96, 98, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000033', 'staffing', 'Teacher retention %', 92, 95, 'on_track', '2025-26'),
  -- Lakeshore Montessori (100% healthy)
  ('a1000000-0000-4000-8000-000000000034', 'academic', 'Reading proficiency %', 74, 81, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000034', 'academic', 'Math proficiency %', 72, 78, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000034', 'operations', 'Attendance rate %', 95, 97, 'on_track', '2025-26'),
  -- Golden Gate Lighthouse (100% healthy)
  ('a1000000-0000-4000-8000-000000000035', 'academic', 'Reading proficiency %', 77, 82, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000035', 'academic', 'Math proficiency %', 75, 80, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000035', 'financial', 'Budget variance %', 5, 3, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000035', 'staffing', 'Teacher retention %', 90, 94, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000035', 'operations', 'Attendance rate %', 95, 96, 'on_track', '2025-26'),
  -- Silver Creek STEM Center (100% healthy)
  ('a1000000-0000-4000-8000-000000000036', 'academic', 'STEM proficiency %', 82, 89, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000036', 'academic', 'Math proficiency %', 80, 87, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000036', 'operations', 'Attendance rate %', 96, 97, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000036', 'staffing', 'Teacher retention %', 91, 93, 'on_track', '2025-26'),
  -- Harbor Point Schools (new all-succeeding district)
  ('a1000000-0000-4000-8000-000000000037', 'academic', 'Reading proficiency %', 79, 86, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000037', 'academic', 'Math proficiency %', 76, 83, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000037', 'operations', 'Attendance rate %', 96, 98, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000037', 'staffing', 'Teacher retention %', 92, 95, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000038', 'academic', 'Graduation rate %', 93, 96, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000038', 'academic', 'College readiness %', 72, 79, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000038', 'financial', 'Budget variance %', 5, 2, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000038', 'operations', 'Attendance rate %', 96, 97, 'on_track', '2025-26');

-- Resolved interventions showing past turnaround success
INSERT INTO interventions (school_id, date, issue, action_taken, owner, status) VALUES
  ('a1000000-0000-4000-8000-00000000002f', '2025-08-15', 'Reading scores plateaued in grade 3', 'Literacy coaching and guided reading blocks — scores rose 9 pts', 'Dr. Sarah Chen', 'resolved'),
  ('a1000000-0000-4000-8000-000000000031', '2025-06-01', 'AP pass rates below 60%', 'Teacher PD on rigorous instruction; pass rates now 72%', 'James Rodriguez', 'resolved'),
  ('a1000000-0000-4000-8000-000000000033', '2025-09-20', 'Attendance dipped after relocation', 'Community welcome events and family liaisons hired', 'Maria Santos', 'resolved'),
  ('a1000000-0000-4000-8000-000000000036', '2025-07-10', 'STEM lab equipment outdated', 'Grant-funded lab refresh and industry partnerships', 'Dr. Sarah Chen', 'resolved'),
  ('a1000000-0000-4000-8000-000000000037', '2025-05-12', 'New principal onboarding support', 'Mentor principal pairing and 90-day success plan', 'James Rodriguez', 'resolved');

INSERT INTO user_school_assignments (user_id, school_id)
SELECT p.id, s.id
FROM profiles p
CROSS JOIN schools s
WHERE p.role IN ('admin', 'regional_manager')
  AND s.id >= 'a1000000-0000-4000-8000-00000000002f'
ON CONFLICT DO NOTHING;
