-- Partners: consultants and vendors supporting EMO client schools

CREATE TYPE partner_type AS ENUM ('consultant', 'vendor');
CREATE TYPE partner_status AS ENUM ('active', 'inactive');

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  partner_type partner_type NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  services TEXT,
  website TEXT,
  status partner_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE partner_schools (
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (partner_id, school_id)
);

CREATE INDEX partners_type_idx ON partners(partner_type);
CREATE INDEX partners_status_idx ON partners(status);
CREATE INDEX partner_schools_school_idx ON partner_schools(school_id);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read partners"
  ON partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage partners"
  ON partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update partners"
  ON partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete partners"
  ON partners FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read partner schools"
  ON partner_schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage partner schools"
  ON partner_schools FOR ALL TO authenticated USING (true);

-- Sample partners
INSERT INTO partners (name, partner_type, contact_name, contact_email, contact_phone, services, website, status) VALUES
  ('EdLead Consulting Group', 'consultant', 'Dr. Patricia Moore', 'pmoore@edlead.example', '555-0101', 'School turnaround, leadership coaching, strategic planning', 'https://edlead.example', 'active'),
  ('Summit Instructional Partners', 'consultant', 'James Okonkwo', 'jokonkwo@summitip.example', '555-0102', 'MTSS implementation, literacy coaching, data teams', NULL, 'active'),
  ('BrightPath PD Solutions', 'vendor', 'Sarah Lin', 'sarah@brightpath.example', '555-0201', 'Professional development workshops, online course platform', 'https://brightpath.example', 'active'),
  ('SafeSchools Facilities Co.', 'vendor', 'Mike Torres', 'mike@safeschools.example', '555-0202', 'HVAC maintenance, security systems, facilities management', NULL, 'active'),
  ('Equity Analytics LLC', 'consultant', 'Aisha Rahman', 'aisha@equityanalytics.example', '555-0103', 'Equity audits, disaggregated data analysis, board reporting', 'https://equityanalytics.example', 'active');

INSERT INTO partner_schools (partner_id, school_id)
SELECT p.id, s.id
FROM partners p
CROSS JOIN schools s
WHERE p.name = 'EdLead Consulting Group'
  AND s.name IN ('Riverside Academy', 'Oakwood Middle School');

INSERT INTO partner_schools (partner_id, school_id)
SELECT p.id, s.id
FROM partners p
CROSS JOIN schools s
WHERE p.name = 'Summit Instructional Partners'
  AND s.name IN ('Lincoln Elementary', 'Harborview K-8');

INSERT INTO partner_schools (partner_id, school_id)
SELECT p.id, s.id
FROM partners p
CROSS JOIN schools s
WHERE p.name = 'BrightPath PD Solutions';

INSERT INTO partner_schools (partner_id, school_id)
SELECT p.id, s.id
FROM partners p
CROSS JOIN schools s
WHERE p.name = 'SafeSchools Facilities Co.'
  AND s.name IN ('Summit High School', 'Pinecrest Academy');

INSERT INTO partner_schools (partner_id, school_id)
SELECT p.id, s.id
FROM partners p
CROSS JOIN schools s
WHERE p.name = 'Equity Analytics LLC'
  AND s.name IN ('Riverside Academy', 'Summit High School', 'Pinecrest Academy');
