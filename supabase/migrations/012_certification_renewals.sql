-- Renewal submission and admin approval workflow

ALTER TABLE certifications
  ADD COLUMN renewal_issued_date DATE,
  ADD COLUMN renewal_expiry_date DATE,
  ADD COLUMN renewal_approval_status TEXT
    CHECK (renewal_approval_status IS NULL OR renewal_approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN renewal_submitted_at TIMESTAMPTZ,
  ADD COLUMN renewal_approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN renewal_approved_at TIMESTAMPTZ;

CREATE INDEX certifications_renewal_pending_idx
  ON certifications (renewal_approval_status)
  WHERE renewal_approval_status = 'pending';
