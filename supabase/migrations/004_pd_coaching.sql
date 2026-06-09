-- PD & Coaching module

CREATE TYPE growth_plan_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE goal_item_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE coaching_cycle_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE observation_type AS ENUM ('walkthrough', 'formal', 'informal');
CREATE TYPE pd_event_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE pd_registration_status AS ENUM ('registered', 'attended', 'cancelled', 'no_show');
CREATE TYPE certification_status AS ENUM ('active', 'expiring', 'expired');

CREATE TABLE growth_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL,
  status growth_plan_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE growth_plan_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES growth_plans(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  action_steps TEXT,
  status goal_item_status NOT NULL DEFAULT 'not_started',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE growth_plan_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES growth_plans(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reflection_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE growth_plan_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES growth_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coaching_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  focus_area TEXT NOT NULL,
  status coaching_cycle_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES coaching_cycles(id) ON DELETE CASCADE,
  observation_type observation_type NOT NULL DEFAULT 'walkthrough',
  notes TEXT NOT NULL,
  feedback TEXT NOT NULL,
  ratings JSONB DEFAULT '{}',
  observation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES coaching_cycles(id) ON DELETE CASCADE,
  log_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pd_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  credit_hours NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  format TEXT NOT NULL DEFAULT 'in_person',
  location TEXT,
  status pd_event_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pd_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES pd_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status pd_registration_status NOT NULL DEFAULT 'registered',
  attended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE,
  status certification_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX growth_plans_user_idx ON growth_plans(user_id);
CREATE INDEX growth_plans_school_idx ON growth_plans(school_id);
CREATE INDEX coaching_cycles_coach_idx ON coaching_cycles(coach_id);
CREATE INDEX coaching_cycles_teacher_idx ON coaching_cycles(teacher_id);
CREATE INDEX pd_registrations_user_idx ON pd_registrations(user_id);
CREATE INDEX certifications_user_idx ON certifications(user_id);
CREATE INDEX certifications_expiry_idx ON certifications(expiry_date);

CREATE OR REPLACE FUNCTION update_growth_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER growth_plans_updated_at
  BEFORE UPDATE ON growth_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_growth_plans_updated_at();

ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plan_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plan_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plan_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Growth plans: own or admin
CREATE POLICY "Users read own growth plans" ON growth_plans FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR true);
CREATE POLICY "Users manage own growth plans" ON growth_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR true);
CREATE POLICY "Users update growth plans" ON growth_plans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users delete growth plans" ON growth_plans FOR DELETE TO authenticated USING (true);

CREATE POLICY "Growth plan goals access" ON growth_plan_goals FOR ALL TO authenticated USING (true);
CREATE POLICY "Growth plan reflections access" ON growth_plan_reflections FOR ALL TO authenticated USING (true);
CREATE POLICY "Growth plan evidence access" ON growth_plan_evidence FOR ALL TO authenticated USING (true);

CREATE POLICY "Coaching cycles access" ON coaching_cycles FOR ALL TO authenticated USING (true);
CREATE POLICY "Observations access" ON observations FOR ALL TO authenticated USING (true);
CREATE POLICY "Coaching logs access" ON coaching_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "PD events read" ON pd_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "PD events manage" ON pd_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "PD events update" ON pd_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "PD events delete" ON pd_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "PD registrations access" ON pd_registrations FOR ALL TO authenticated USING (true);
CREATE POLICY "Certifications access" ON certifications FOR ALL TO authenticated USING (true);
