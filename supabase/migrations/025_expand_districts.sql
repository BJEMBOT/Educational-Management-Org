-- Expand network to 10 districts with varied schools, goals, and interventions

-- Metro North (+1 school)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000007', 'Maple Grove Elementary', 'Metro North', 385)
ON CONFLICT (id) DO NOTHING;

-- Central Valley (+2 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000008', 'Cedar Ridge Middle School', 'Central Valley', 610),
  ('a1000000-0000-4000-8000-000000000009', 'Valley View High School', 'Central Valley', 1020)
ON CONFLICT (id) DO NOTHING;

-- Lakewood Union (4 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-00000000000a', 'Lakewood Primary', 'Lakewood Union', 290),
  ('a1000000-0000-4000-8000-00000000000b', 'Lakewood Intermediate', 'Lakewood Union', 445),
  ('a1000000-0000-4000-8000-00000000000c', 'Lakewood Middle', 'Lakewood Union', 520),
  ('a1000000-0000-4000-8000-00000000000d', 'Lakewood High', 'Lakewood Union', 1180)
ON CONFLICT (id) DO NOTHING;

-- Riverside Heights (3 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-00000000000e', 'Heights Elementary', 'Riverside Heights', 360),
  ('a1000000-0000-4000-8000-00000000000f', 'Heights Middle School', 'Riverside Heights', 575),
  ('a1000000-0000-4000-8000-000000000010', 'Heights Preparatory', 'Riverside Heights', 640)
ON CONFLICT (id) DO NOTHING;

-- Mountain View (1 school)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000011', 'Mountain View Academy', 'Mountain View', 480)
ON CONFLICT (id) DO NOTHING;

-- Eastside Partnership (5 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000012', 'Eastside Primary', 'Eastside Partnership', 310),
  ('a1000000-0000-4000-8000-000000000013', 'Eastside Elementary', 'Eastside Partnership', 395),
  ('a1000000-0000-4000-8000-000000000014', 'Eastside Middle', 'Eastside Partnership', 505),
  ('a1000000-0000-4000-8000-000000000015', 'Eastside STEM Academy', 'Eastside Partnership', 720),
  ('a1000000-0000-4000-8000-000000000016', 'Eastside Collegiate', 'Eastside Partnership', 940)
ON CONFLICT (id) DO NOTHING;

-- Lakeshore County (2 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000017', 'Lakeshore Elementary', 'Lakeshore County', 275),
  ('a1000000-0000-4000-8000-000000000018', 'Lakeshore High', 'Lakeshore County', 830)
ON CONFLICT (id) DO NOTHING;

-- Southgate ISD (3 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000019', 'Southgate Elementary', 'Southgate ISD', 410),
  ('a1000000-0000-4000-8000-00000000001a', 'Southgate Middle', 'Southgate ISD', 560),
  ('a1000000-0000-4000-8000-00000000001b', 'Southgate High', 'Southgate ISD', 1050)
ON CONFLICT (id) DO NOTHING;

-- Desert Plains (2 schools)
INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-00000000001c', 'Desert Plains K-8', 'Desert Plains', 490),
  ('a1000000-0000-4000-8000-00000000001d', 'Desert Plains High', 'Desert Plains', 870)
ON CONFLICT (id) DO NOTHING;

-- Goals for new schools
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  -- Maple Grove (healthy)
  ('a1000000-0000-4000-8000-000000000007', 'academic', 'Reading proficiency %', 75, 77, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000007', 'academic', 'Math proficiency %', 70, 74, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000007', 'operations', 'Attendance rate %', 95, 96, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000007', 'staffing', 'Teacher retention %', 90, 89, 'on_track', '2025-26'),
  -- Cedar Ridge (at risk)
  ('a1000000-0000-4000-8000-000000000008', 'academic', 'Reading proficiency %', 78, 71, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000008', 'academic', 'Math proficiency %', 72, 69, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000008', 'financial', 'Budget variance %', 5, 5, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000008', 'operations', 'Attendance rate %', 95, 93, 'on_track', '2025-26'),
  -- Valley View (healthy)
  ('a1000000-0000-4000-8000-000000000009', 'academic', 'Graduation rate %', 90, 92, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000009', 'academic', 'College readiness %', 68, 71, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000009', 'staffing', 'Teacher retention %', 90, 91, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000009', 'operations', 'Attendance rate %', 95, 95, 'on_track', '2025-26'),
  -- Lakewood Primary (off track)
  ('a1000000-0000-4000-8000-00000000000a', 'academic', 'Reading proficiency %', 70, 52, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000a', 'academic', 'Math proficiency %', 68, 50, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000a', 'operations', 'Attendance rate %', 95, 87, 'at_risk', '2025-26'),
  -- Lakewood Intermediate (at risk)
  ('a1000000-0000-4000-8000-00000000000b', 'academic', 'Reading proficiency %', 75, 70, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000b', 'academic', 'Math proficiency %', 72, 73, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000b', 'staffing', 'Teacher retention %', 90, 84, 'at_risk', '2025-26'),
  -- Lakewood Middle (healthy)
  ('a1000000-0000-4000-8000-00000000000c', 'academic', 'Reading proficiency %', 78, 80, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000c', 'academic', 'Math proficiency %', 74, 76, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000c', 'operations', 'Attendance rate %', 95, 94, 'on_track', '2025-26'),
  -- Lakewood High (at risk)
  ('a1000000-0000-4000-8000-00000000000d', 'academic', 'Graduation rate %', 88, 82, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000d', 'academic', 'College readiness %', 65, 60, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000d', 'financial', 'Budget variance %', 5, 7, 'at_risk', 'FY2026'),
  -- Heights Elementary (healthy)
  ('a1000000-0000-4000-8000-00000000000e', 'academic', 'Reading proficiency %', 76, 79, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000e', 'operations', 'Attendance rate %', 95, 97, 'on_track', '2025-26'),
  -- Heights Middle (off track)
  ('a1000000-0000-4000-8000-00000000000f', 'academic', 'Math proficiency %', 72, 55, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000f', 'staffing', 'Teacher retention %', 90, 72, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000000f', 'operations', 'Attendance rate %', 95, 90, 'at_risk', '2025-26'),
  -- Heights Prep (healthy)
  ('a1000000-0000-4000-8000-000000000010', 'academic', 'Reading proficiency %', 82, 85, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000010', 'academic', 'Math proficiency %', 80, 83, 'on_track', '2025-26'),
  -- Mountain View (at risk)
  ('a1000000-0000-4000-8000-000000000011', 'academic', 'Reading proficiency %', 75, 68, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000011', 'financial', 'Budget variance %', 5, 9, 'off_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000011', 'staffing', 'Teacher retention %', 90, 88, 'on_track', '2025-26'),
  -- Eastside schools
  ('a1000000-0000-4000-8000-000000000012', 'academic', 'Reading proficiency %', 70, 73, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000012', 'operations', 'Attendance rate %', 95, 94, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000013', 'academic', 'Math proficiency %', 72, 64, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000013', 'staffing', 'Teacher retention %', 90, 78, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000014', 'academic', 'Reading proficiency %', 78, 75, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000014', 'academic', 'Math proficiency %', 74, 70, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000015', 'academic', 'STEM proficiency %', 80, 82, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000015', 'operations', 'Attendance rate %', 95, 96, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000016', 'academic', 'Graduation rate %', 90, 86, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000016', 'financial', 'Budget variance %', 5, 4, 'on_track', 'FY2026'),
  -- Lakeshore
  ('a1000000-0000-4000-8000-000000000017', 'academic', 'Reading proficiency %', 72, 74, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000017', 'operations', 'Attendance rate %', 95, 92, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000018', 'academic', 'Graduation rate %', 88, 90, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000018', 'staffing', 'Teacher retention %', 90, 92, 'on_track', '2025-26'),
  -- Southgate
  ('a1000000-0000-4000-8000-000000000019', 'academic', 'Reading proficiency %', 74, 76, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000019', 'operations', 'Attendance rate %', 95, 95, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001a', 'academic', 'Math proficiency %', 73, 67, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001a', 'financial', 'Budget variance %', 5, 6, 'at_risk', 'FY2026'),
  ('a1000000-0000-4000-8000-00000000001b', 'academic', 'Graduation rate %', 91, 88, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001b', 'academic', 'College readiness %', 70, 72, 'on_track', '2025-26'),
  -- Desert Plains
  ('a1000000-0000-4000-8000-00000000001c', 'academic', 'Reading proficiency %', 70, 58, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001c', 'operations', 'Attendance rate %', 95, 88, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001d', 'academic', 'Graduation rate %', 85, 84, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001d', 'financial', 'Budget variance %', 5, 3, 'on_track', 'FY2026');

-- Interventions (varied per district)
INSERT INTO interventions (school_id, date, issue, action_taken, owner, status) VALUES
  ('a1000000-0000-4000-8000-000000000007', '2026-03-01', 'Chronic absenteeism in grade 2', 'Home visit program and attendance coach assigned', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-000000000008', '2026-02-10', 'Literacy scores declining in grade 7', 'Added reading intervention blocks three days per week', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-00000000000a', '2026-01-20', 'K-2 reading scores critically low', 'Phonics intervention and parent literacy nights launched', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-00000000000a', '2025-12-05', 'Special education staffing gap', 'Contracted two additional SPED teachers', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-00000000000b', '2026-02-15', 'Teacher retention below target', 'Signing bonuses and peer mentoring program', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-00000000000d', '2026-01-08', 'Graduation rate slip among seniors', 'Credit recovery program and counselor check-ins', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-00000000000d', '2025-11-12', 'CTE program enrollment down', 'Industry partnership outreach and student tours', 'Dr. Sarah Chen', 'resolved'),
  ('a1000000-0000-4000-8000-00000000000f', '2026-02-20', 'Math department turnover', 'Emergency hiring and substitute teacher pool expanded', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-000000000011', '2026-01-30', 'Facilities budget overrun', 'Deferred non-critical repairs and renegotiated contracts', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-000000000013', '2026-02-05', 'Math proficiency gap in grades 4-5', 'After-school tutoring and new curriculum pilot', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-000000000013', '2025-10-18', 'Playground safety concerns', 'Completed repairs and safety audit', 'Maria Santos', 'resolved'),
  ('a1000000-0000-4000-8000-000000000014', '2026-03-05', 'Behavior incidents up 18%', 'Restorative practices training for all staff', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-000000000016', '2026-01-25', 'College application completion lagging', 'Senior seminar and FAFSA support sessions', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-000000000017', '2026-02-12', 'Attendance below 92% districtwide', 'Community attendance campaign and incentive program', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-00000000001a', '2026-01-18', 'Budget variance in operations', 'Centralized purchasing and vendor review', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-00000000001b', '2025-12-20', 'Graduation rate monitoring', 'Early warning system for at-risk seniors', 'Dr. Sarah Chen', 'resolved'),
  ('a1000000-0000-4000-8000-00000000001c', '2026-02-28', 'Reading intervention needed grades 6-8', 'Literacy coaches deployed twice weekly', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-00000000001c', '2026-01-10', 'HVAC failures in wing B', 'Emergency repairs and maintenance plan update', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-00000000001d', '2026-03-02', 'AP enrollment below projections', 'Student outreach and teacher recruitment', 'Dr. Sarah Chen', 'open');

-- Assign admins to new schools
INSERT INTO user_school_assignments (user_id, school_id)
SELECT p.id, s.id
FROM profiles p
CROSS JOIN schools s
WHERE p.role IN ('admin', 'regional_manager')
  AND s.id >= 'a1000000-0000-4000-8000-000000000007'
ON CONFLICT DO NOTHING;
