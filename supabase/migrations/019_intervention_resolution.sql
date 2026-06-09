-- Resolution evidence required when closing interventions

ALTER TABLE interventions
  ADD COLUMN resolution_notes TEXT,
  ADD COLUMN resolution_evidence_url TEXT,
  ADD COLUMN resolved_at TIMESTAMPTZ,
  ADD COLUMN resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intervention-evidence',
  'intervention-evidence',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users upload intervention evidence"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'intervention-evidence');

CREATE POLICY "Authenticated users read intervention evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'intervention-evidence');
