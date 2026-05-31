-- LISTA trainee document storage (InsForge SQL console / migration)
-- 1. Create bucket via CLI: npx @insforge/cli storage buckets create trainee-documents --public
-- 2. Run policies below so authenticated trainees upload only under their user id path.

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Path-scoped: {userId}/{docType}/{filename}
CREATE POLICY IF NOT EXISTS lista_trainee_docs_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'trainee-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY IF NOT EXISTS lista_trainee_docs_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'trainee-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY IF NOT EXISTS lista_trainee_docs_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'trainee-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY IF NOT EXISTS lista_trainee_docs_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'trainee-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub')
  );

-- Public read for staff verification (optional — remove if bucket should stay private):
-- CREATE POLICY IF NOT EXISTS lista_trainee_docs_public_read ON storage.objects
--   FOR SELECT TO anon
--   USING (bucket_id = 'trainee-documents');
