-- Seed PD & Coaching sample data (requires profiles from user signups)
-- Seeds PD events and links to first school; coaching/growth plans seeded via app

INSERT INTO pd_events (title, description, credit_hours, start_date, format, location, status) VALUES
  ('Differentiated Instruction Workshop', 'Strategies for meeting diverse learner needs in K-12 classrooms.', 6, '2026-09-15 09:00:00+00', 'in_person', 'District PD Center', 'scheduled'),
  ('MTSS Tier 1 Foundations', 'Building strong universal supports for all students.', 3, '2026-10-01 13:00:00+00', 'virtual', 'Zoom', 'scheduled'),
  ('Data-Driven Instruction', 'Using formative assessment data to guide instructional decisions.', 4, '2026-08-20 09:00:00+00', 'hybrid', 'Summit High School', 'scheduled'),
  ('Coaching Conversations', 'Effective feedback and growth-oriented dialogue for coaches.', 2, '2026-07-10 09:00:00+00', 'in_person', 'Riverside Academy', 'completed'),
  ('IEP Compliance Essentials', 'Documentation requirements and best practices for special educators.', 5, '2026-11-05 09:00:00+00', 'virtual', 'Zoom', 'scheduled');
