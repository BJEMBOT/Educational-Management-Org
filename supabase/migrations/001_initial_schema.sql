-- EMO Dashboard initial schema

CREATE TYPE goal_category AS ENUM ('academic', 'financial', 'staffing', 'operations');
CREATE TYPE goal_status AS ENUM ('on_track', 'at_risk', 'off_track');
CREATE TYPE intervention_status AS ENUM ('open', 'resolved');
CREATE TYPE user_role AS ENUM ('admin', 'regional_manager', 'staff');

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  enrollment INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  category goal_category NOT NULL,
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  status goal_status NOT NULL DEFAULT 'on_track',
  time_period TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  issue TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  owner TEXT NOT NULL,
  status intervention_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX goals_school_id_idx ON goals(school_id);
CREATE INDEX goals_status_idx ON goals(status);
CREATE INDEX interventions_school_id_idx ON interventions(school_id);
CREATE INDEX interventions_status_idx ON interventions(status);

CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read schools"
  ON schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert schools"
  ON schools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update schools"
  ON schools FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete schools"
  ON schools FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read goals"
  ON goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert goals"
  ON goals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update goals"
  ON goals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete goals"
  ON goals FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read interventions"
  ON interventions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert interventions"
  ON interventions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update interventions"
  ON interventions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete interventions"
  ON interventions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
