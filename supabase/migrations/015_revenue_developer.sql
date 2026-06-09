-- Developer role and revenue tracking schema (policies in 016 after enum commit)

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';

CREATE TYPE revenue_source AS ENUM (
  'contract',
  'pd',
  'consulting',
  'grant',
  'other'
);

CREATE TABLE revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  source revenue_source NOT NULL DEFAULT 'contract',
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX revenue_entries_date_idx ON revenue_entries(revenue_date);
CREATE INDEX revenue_entries_school_idx ON revenue_entries(school_id);
CREATE INDEX revenue_entries_source_idx ON revenue_entries(source);

ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;
