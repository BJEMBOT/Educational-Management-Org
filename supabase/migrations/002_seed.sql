-- Seed data for EMO Dashboard (run after 001_initial_schema.sql)

INSERT INTO schools (id, name, district, enrollment) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Lincoln Elementary', 'Metro North', 420),
  ('a1000000-0000-4000-8000-000000000002', 'Riverside Academy', 'Metro North', 680),
  ('a1000000-0000-4000-8000-000000000003', 'Oakwood Middle School', 'Central Valley', 540),
  ('a1000000-0000-4000-8000-000000000004', 'Summit High School', 'Central Valley', 890),
  ('a1000000-0000-4000-8000-000000000005', 'Harborview K-8', 'Coastal District', 310),
  ('a1000000-0000-4000-8000-000000000006', 'Pinecrest Academy', 'Coastal District', 750);

-- Lincoln Elementary: 4/5 on track = 80% healthy
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'academic', 'Reading proficiency %', 75, 78, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000001', 'academic', 'Math proficiency %', 70, 72, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000001', 'financial', 'Budget variance %', 5, 3, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000001', 'staffing', 'Teacher retention %', 90, 88, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000001', 'operations', 'Attendance rate %', 95, 91, 'at_risk', '2025-26');

-- Riverside Academy: 2/5 on track = 40% off track
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-000000000002', 'academic', 'Reading proficiency %', 80, 62, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000002', 'academic', 'Math proficiency %', 75, 58, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000002', 'financial', 'Budget variance %', 5, 4, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000002', 'staffing', 'Teacher retention %', 90, 75, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000002', 'operations', 'Attendance rate %', 95, 88, 'at_risk', '2025-26');

-- Oakwood Middle: 3/5 on track = 60% at risk
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-000000000003', 'academic', 'Reading proficiency %', 78, 76, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000003', 'academic', 'Math proficiency %', 72, 68, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000003', 'financial', 'Budget variance %', 5, 6, 'at_risk', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000003', 'staffing', 'Teacher retention %', 90, 91, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000003', 'operations', 'Attendance rate %', 95, 94, 'on_track', '2025-26');

-- Summit High: 5/5 on track = 100% healthy
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-000000000004', 'academic', 'Graduation rate %', 92, 94, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000004', 'academic', 'College readiness %', 70, 73, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000004', 'financial', 'Budget variance %', 5, 2, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000004', 'staffing', 'Teacher retention %', 90, 93, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000004', 'operations', 'Attendance rate %', 95, 96, 'on_track', '2025-26');

-- Harborview K-8: 2/4 on track = 50% off track
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-000000000005', 'academic', 'Reading proficiency %', 70, 55, 'off_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000005', 'financial', 'Budget variance %', 5, 8, 'off_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000005', 'staffing', 'Teacher retention %', 90, 85, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000005', 'operations', 'Attendance rate %', 95, 96, 'on_track', '2025-26');

-- Pinecrest Academy: 4/5 on track = 80% healthy
INSERT INTO goals (school_id, category, metric_name, target_value, current_value, status, time_period) VALUES
  ('a1000000-0000-4000-8000-000000000006', 'academic', 'Reading proficiency %', 82, 84, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000006', 'academic', 'Math proficiency %', 78, 80, 'on_track', '2025-26'),
  ('a1000000-0000-4000-8000-000000000006', 'financial', 'Budget variance %', 5, 4, 'on_track', 'FY2026'),
  ('a1000000-0000-4000-8000-000000000006', 'staffing', 'Teacher retention %', 90, 82, 'at_risk', '2025-26'),
  ('a1000000-0000-4000-8000-000000000006', 'operations', 'Attendance rate %', 95, 97, 'on_track', '2025-26');

INSERT INTO interventions (school_id, date, issue, action_taken, owner, status) VALUES
  ('a1000000-0000-4000-8000-000000000002', '2026-01-15', 'Declining math scores across grades 6-8', 'Deployed math intervention specialists and after-school tutoring program', 'Dr. Sarah Chen', 'open'),
  ('a1000000-0000-4000-8000-000000000002', '2025-11-20', 'High teacher turnover in science department', 'Implemented retention bonuses and mentorship program', 'James Rodriguez', 'open'),
  ('a1000000-0000-4000-8000-000000000005', '2026-02-01', 'Budget overrun in facilities maintenance', 'Revised maintenance schedule and renegotiated vendor contracts', 'Maria Santos', 'open'),
  ('a1000000-0000-4000-8000-000000000003', '2025-10-10', 'Math proficiency below target', 'Introduced new curriculum and weekly PLC meetings', 'Dr. Sarah Chen', 'resolved'),
  ('a1000000-0000-4000-8000-000000000001', '2025-09-05', 'Attendance dip in Q1', 'Launched parent engagement campaign and attendance incentives', 'James Rodriguez', 'resolved');
