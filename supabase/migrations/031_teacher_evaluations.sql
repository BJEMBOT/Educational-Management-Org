-- Teacher Evaluation Module

CREATE TYPE evaluation_cycle_type AS ENUM ('quarterly', 'semester', 'annual');
CREATE TYPE evaluation_cycle_status AS ENUM (
  'draft',
  'active',
  'mid_year_review',
  'completed',
  'archived'
);
CREATE TYPE rubric_rating AS ENUM (
  'exemplary',
  'effective',
  'developing',
  'needs_improvement'
);
CREATE TYPE artifact_type AS ENUM (
  'lesson_plan',
  'assessment',
  'student_work',
  'pd_certificate',
  'communication_log',
  'other'
);

CREATE TABLE evaluation_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rubric_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES evaluation_frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rubric_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES rubric_domains(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evaluation_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES evaluation_frameworks(id),
  cycle_type evaluation_cycle_type NOT NULL DEFAULT 'annual',
  school_year TEXT NOT NULL,
  status evaluation_cycle_status NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  overall_rating teaching_evaluation,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE observation_rubric_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES rubric_indicators(id) ON DELETE CASCADE,
  rating rubric_rating NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (observation_id, indicator_id)
);

CREATE TABLE evaluation_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_cycle_id UUID NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  artifact_type artifact_type NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  file_url TEXT,
  notes TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE district_evaluation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES evaluation_frameworks(id),
  school_year TEXT NOT NULL,
  weighting JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extend observations for evaluation-only or dual-linked records
ALTER TABLE observations
  ADD COLUMN evaluation_cycle_id UUID REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  ADD COLUMN observer_id UUID REFERENCES profiles(id),
  ADD COLUMN walkthrough_data JSONB NOT NULL DEFAULT '{}';

ALTER TABLE observations ALTER COLUMN cycle_id DROP NOT NULL;

ALTER TABLE observations
  ADD CONSTRAINT observations_cycle_or_evaluation_check
  CHECK (cycle_id IS NOT NULL OR evaluation_cycle_id IS NOT NULL);

ALTER TABLE coaching_cycles
  ADD COLUMN evaluation_cycle_id UUID REFERENCES evaluation_cycles(id) ON DELETE SET NULL;

CREATE INDEX evaluation_cycles_teacher_idx ON evaluation_cycles(teacher_id);
CREATE INDEX evaluation_cycles_evaluator_idx ON evaluation_cycles(evaluator_id);
CREATE INDEX evaluation_cycles_school_idx ON evaluation_cycles(school_id);
CREATE INDEX evaluation_cycles_status_idx ON evaluation_cycles(status);
CREATE INDEX observations_evaluation_cycle_idx ON observations(evaluation_cycle_id);
CREATE INDEX observation_rubric_scores_observation_idx ON observation_rubric_scores(observation_id);
CREATE INDEX evaluation_artifacts_cycle_idx ON evaluation_artifacts(evaluation_cycle_id);

CREATE OR REPLACE FUNCTION update_evaluation_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evaluation_cycles_updated_at
  BEFORE UPDATE ON evaluation_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_evaluation_cycles_updated_at();

ALTER TABLE evaluation_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_rubric_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_evaluation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evaluation frameworks access" ON evaluation_frameworks FOR ALL TO authenticated USING (true);
CREATE POLICY "Rubric domains access" ON rubric_domains FOR ALL TO authenticated USING (true);
CREATE POLICY "Rubric indicators access" ON rubric_indicators FOR ALL TO authenticated USING (true);
CREATE POLICY "Evaluation cycles access" ON evaluation_cycles FOR ALL TO authenticated USING (true);
CREATE POLICY "Observation rubric scores access" ON observation_rubric_scores FOR ALL TO authenticated USING (true);
CREATE POLICY "Evaluation artifacts access" ON evaluation_artifacts FOR ALL TO authenticated USING (true);
CREATE POLICY "District evaluation settings access" ON district_evaluation_settings FOR ALL TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evaluation-artifacts',
  'evaluation-artifacts',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Evaluation artifacts upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evaluation-artifacts');

CREATE POLICY "Evaluation artifacts read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'evaluation-artifacts');

-- Seed Danielson framework
DO $$
DECLARE
  danielson_id UUID;
  marzano_id UUID;
  d1 UUID; d2 UUID; d3 UUID; d4 UUID;
BEGIN
  INSERT INTO evaluation_frameworks (name, slug, is_system, is_active)
  VALUES ('Danielson Framework', 'danielson', true, true)
  RETURNING id INTO danielson_id;

  INSERT INTO evaluation_frameworks (name, slug, is_system, is_active)
  VALUES ('Marzano Framework', 'marzano', true, false)
  RETURNING id INTO marzano_id;

  INSERT INTO rubric_domains (framework_id, name, sort_order) VALUES
    (danielson_id, 'Planning and Preparation', 1) RETURNING id INTO d1;
  INSERT INTO rubric_domains (framework_id, name, sort_order) VALUES
    (danielson_id, 'Classroom Environment', 2) RETURNING id INTO d2;
  INSERT INTO rubric_domains (framework_id, name, sort_order) VALUES
    (danielson_id, 'Instruction', 3) RETURNING id INTO d3;
  INSERT INTO rubric_domains (framework_id, name, sort_order) VALUES
    (danielson_id, 'Professional Responsibilities', 4) RETURNING id INTO d4;

  INSERT INTO rubric_indicators (domain_id, code, description, sort_order) VALUES
    (d1, '1a', 'Demonstrating knowledge of content and pedagogy', 1),
    (d1, '1b', 'Demonstrating knowledge of students', 2),
    (d1, '1c', 'Setting instructional outcomes', 3),
    (d1, '1d', 'Demonstrating knowledge of resources', 4),
    (d2, '2a', 'Creating an environment of respect and rapport', 1),
    (d2, '2b', 'Establishing a culture for learning', 2),
    (d2, '2c', 'Managing classroom procedures', 3),
    (d2, '2d', 'Managing student behavior', 4),
    (d3, '3a', 'Communicating with students', 1),
    (d3, '3b', 'Using questioning and discussion techniques', 2),
    (d3, '3c', 'Engaging students in learning', 3),
    (d3, '3d', 'Using assessment in instruction', 4),
    (d4, '4a', 'Reflecting on teaching', 1),
    (d4, '4b', 'Maintaining accurate records', 2),
    (d4, '4c', 'Communicating with families', 3),
    (d4, '4d', 'Participating in a professional community', 4);

  INSERT INTO district_evaluation_settings (framework_id, school_year, weighting, is_active)
  VALUES (danielson_id, '2025-2026', '{}', true);
END $$;
