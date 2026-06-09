-- Time-off requests and IT ticket submission

CREATE TYPE time_off_type AS ENUM ('absence', 'vacation');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied', 'cancelled');
CREATE TYPE it_ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE it_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TABLE time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type time_off_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT time_off_requests_date_check CHECK (end_date >= start_date)
);

CREATE TABLE it_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority it_ticket_priority NOT NULL DEFAULT 'normal',
  status it_ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX time_off_requests_user_id_idx ON time_off_requests(user_id);
CREATE INDEX time_off_requests_partner_id_idx ON time_off_requests(partner_id);
CREATE INDEX time_off_requests_status_idx ON time_off_requests(status);
CREATE INDEX it_tickets_user_id_idx ON it_tickets(user_id);
CREATE INDEX it_tickets_status_idx ON it_tickets(status);

ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_tickets ENABLE ROW LEVEL SECURITY;

-- Time-off: partner users submit for themselves
CREATE POLICY "Partner users insert own time off"
  ON time_off_requests FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND user_id = auth.uid()
    AND partner_id = get_current_partner_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role::text = 'partner'
        AND partner_id IS NOT NULL
    )
  );

-- Time-off: admin/developer submit on behalf of partner employees
CREATE POLICY "Content editors insert time off on behalf"
  ON time_off_requests FOR INSERT TO authenticated
  WITH CHECK (
    is_content_editor()
    AND submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles subject
      WHERE subject.id = user_id
        AND subject.role::text = 'partner'
        AND subject.partner_user_type::text = 'employee'
        AND subject.partner_id = time_off_requests.partner_id
    )
  );

CREATE POLICY "Scoped read time off requests"
  ON time_off_requests FOR SELECT TO authenticated
  USING (
    is_content_editor()
    OR user_id = auth.uid()
  );

CREATE POLICY "Content editors update time off requests"
  ON time_off_requests FOR UPDATE TO authenticated
  USING (is_content_editor())
  WITH CHECK (is_content_editor());

-- IT tickets: any authenticated user submits own tickets
CREATE POLICY "Users insert own it tickets"
  ON it_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Scoped read it tickets"
  ON it_tickets FOR SELECT TO authenticated
  USING (
    is_content_editor()
    OR user_id = auth.uid()
  );

CREATE POLICY "Content editors update it tickets"
  ON it_tickets FOR UPDATE TO authenticated
  USING (is_content_editor())
  WITH CHECK (is_content_editor());
