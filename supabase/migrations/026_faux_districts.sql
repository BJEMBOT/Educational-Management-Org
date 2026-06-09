-- Add 7 faux districts with varied schools, goals, and interventions

INSERT INTO schools (id, name, district, enrollment) VALUES
  -- North Ridge Alliance (2)
  ('a1000000-0000-4000-8000-00000000001e', 'North Ridge Elementary', 'North Ridge Alliance', 340),
  ('a1000000-0000-4000-8000-00000000001f', 'North Ridge High', 'North Ridge Alliance', 920),
  -- Golden Gate Unified (3)
  ('a1000000-0000-4000-8000-000000000020', 'Golden Gate Primary', 'Golden Gate Unified', 280),
  ('a1000000-0000-4000-8000-000000000021', 'Golden Gate Middle', 'Golden Gate Unified', 515),
  ('a1000000-0000-4000-8000-000000000022', 'Golden Gate Academy', 'Golden Gate Unified', 680),
  -- Highland Park (1)
  ('a1000000-0000-4000-8000-000000000023', 'Highland Park School', 'Highland Park', 550),
  -- Maple County Schools (2)
  ('a1000000-0000-4000-8000-000000000024', 'Maple County Elementary', 'Maple County Schools', 365),
  ('a1000000-0000-4000-8000-000000000025', 'Maple County High', 'Maple County Schools', 990),
  -- Bayview Consortium (4)
  ('a1000000-0000-4000-8000-000000000026', 'Bayview Primary', 'Bayview Consortium', 295),
  ('a1000000-0000-4000-8000-000000000027', 'Bayview Elementary', 'Bayview Consortium', 410),
  ('a1000000-0000-4000-8000-000000000028', 'Bayview Middle', 'Bayview Consortium', 530),
  ('a1000000-0000-4000-8000-000000000029', 'Bayview Collegiate', 'Bayview Consortium', 760),
  -- Pioneer Valley (2)
  ('a1000000-0000-4000-8000-00000000002a', 'Pioneer Valley K-8', 'Pioneer Valley', 440),
  ('a1000000-0000-4000-8000-00000000002b', 'Pioneer Valley High', 'Pioneer Valley', 870),
  -- Silver Creek ISD (3)
  ('a1000000-0000-4000-8000-00000000002c', 'Silver Creek Elementary', 'Silver Creek ISD', 325),
  ('a1000000-0000-4000-8000-00000000002d', 'Silver Creek Middle', 'Silver Creek ISD', 495),
  ('a1000000-0000-4000-8000-00000000002e', 'Silver Creek High', 'Silver Creek ISD', 1120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-00000000001e', 'academic', 'Reading proficiency %', 74, 76, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001e', 'operations', 'Attendance rate %', 95, 93, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001f', 'academic', 'Graduation rate %', 89, 81, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000001f', 'staffing', 'Teacher retention %', 90, 85, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000020', 'academic', 'Reading proficiency %', 70, 72, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000021', 'academic', 'Math proficiency %', 73, 66, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000021', 'financial', 'Budget variance %', 5, 8, 'off_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000022', 'academic', 'College readiness %', 72, 75, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000022', 'operations', 'Attendance rate %', 95, 96, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000023', 'academic', 'Reading proficiency %', 78, 80, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000023', 'academic', 'Math proficiency %', 76, 77, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000024', 'academic', 'Reading proficiency %', 72, 60, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000024', 'staffing', 'Teacher retention %', 90, 76, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000025', 'academic', 'Graduation rate %', 91, 89, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000026', 'academic', 'Reading proficiency %', 70, 74, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000027', 'academic', 'Math proficiency %', 71, 63, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000028', 'academic', 'Reading proficiency %', 77, 72, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000028', 'operations', 'Attendance rate %', 95, 91, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000029', 'academic', 'Graduation rate %', 88, 90, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002a', 'academic', 'Reading proficiency %', 73, 65, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002a', 'financial', 'Budget variance %', 5, 6, 'at_risk', 'FY2026'),
  ('a1000000-0000-4000-8000-00000000002b', 'academic', 'Graduation rate %', 87, 83, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002c', 'academic', 'Reading proficiency %', 75, 78, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002d', 'academic', 'Math proficiency %', 72, 68, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002e', 'academic', 'Graduation rate %', 92, 87, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-00000000002e', 'staffing', 'Teacher retention %', 90, 88, 'on_track', '2025-26');

INSERT INTO interventions (school_id, date, issue, action_taken, owner, status) VALUES
  ('a1000000-0000-4000-8000-00000000001f', '2026-02-18', 'Graduation rate dropped below 85%', 'Senior credit recovery and counselor caseload review', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-000000000021', '2026-01-22', 'Operations budget overrun', 'Purchasing freeze and vendor renegotiation', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-000000000021', '2025-11-30', 'Math scores flat for two quarters', 'Curriculum audit and instructional coaching', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-000000000024', '2026-02-08', 'Reading scores in bottom quartile', 'Literacy intervention blocks added daily', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-000000000027', '2026-03-04', 'Grade 4 math proficiency crisis', 'Tutoring program and parent math nights', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-000000000028', '2026-01-15', 'Attendance trending down', 'Truancy outreach and incentive program', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-00000000002a', '2026-02-25', 'Budget variance in facilities', 'Deferred maintenance plan and cost controls', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-00000000002b', '2026-01-05', 'Graduation rate early warning triggered', 'At-risk senior tracking and mentor assignments', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-00000000002e', '2026-02-14', 'College readiness scores lagging', 'AP expansion and college visit program', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-00000000002d', '2025-12-10', 'Discipline referrals up 22%', 'Restorative justice training for staff', 'Maria Santos', 'resolved');

INSERT INTO user_school_assignments (user_id, school_id)
SELECT p.id, s.id
FROM profiles p
CROSS JOIN schools s
WHERE p.role IN ('admin', 'regional_manager')
  AND s.id >= 'a1000000-0000-4000-8000-00000000001e'
ON CONFLICT DO NOTHING;
