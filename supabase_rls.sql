-- =============================================================================
-- AgriCore – Supabase Row Level Security (RLS) Policies
-- Run this entire script in the Supabase SQL Editor (once).
-- It is idempotent: DROP IF EXISTS before every CREATE.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: a stable function that reads user_type from JWT claim
-- =============================================================================
CREATE OR REPLACE FUNCTION auth.user_type()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'user_type'),
    (auth.jwt() ->> 'user_type')
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_no_id_change" ON profiles;

-- SELECT: users can read only their own row
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: users can only insert their own row
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: users can update only their own row AND cannot change owner id
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- Note: changing `id` is already blocked by the PK + the WITH CHECK above.

-- DELETE: nobody can delete a profile through the API
-- (omitting a DELETE policy means it is denied by default when RLS is enabled)


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. JOBS TABLE
-- =============================================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_active"      ON jobs;
DROP POLICY IF EXISTS "jobs_insert_company"     ON jobs;
DROP POLICY IF EXISTS "jobs_update_own_company" ON jobs;
DROP POLICY IF EXISTS "jobs_delete_own_company" ON jobs;

-- SELECT: anyone (including anon) can read active/published jobs
CREATE POLICY "jobs_select_active"
  ON jobs FOR SELECT
  USING (status = 'active');

-- INSERT: only authenticated company users
CREATE POLICY "jobs_insert_company"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'company'
    AND auth.uid() = company_user_id   -- column that links job to poster
  );

-- UPDATE: company can edit only its own jobs
CREATE POLICY "jobs_update_own_company"
  ON jobs FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'company'
    AND auth.uid() = company_user_id
  )
  WITH CHECK (
    auth.uid() = company_user_id
  );

-- DELETE: company can delete only its own jobs
CREATE POLICY "jobs_delete_own_company"
  ON jobs FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'company'
    AND auth.uid() = company_user_id
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. APPLICATIONS TABLE
-- =============================================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_insert_seeker"         ON applications;
DROP POLICY IF EXISTS "applications_select_own_seeker"     ON applications;
DROP POLICY IF EXISTS "applications_select_company"        ON applications;
DROP POLICY IF EXISTS "applications_update_company_status" ON applications;
DROP POLICY IF EXISTS "applications_no_seeker_update"      ON applications;

-- Unique constraint: one application per (seeker, job)
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_seeker_job_unique;
ALTER TABLE applications
  ADD CONSTRAINT applications_seeker_job_unique
  UNIQUE (seeker_user_id, job_id);

-- INSERT: only authenticated seekers can submit; applicant_id must equal own uid
CREATE POLICY "applications_insert_seeker"
  ON applications FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'seeker'
    AND auth.uid() = seeker_user_id
  );

-- SELECT (seeker): can see only own applications
CREATE POLICY "applications_select_own_seeker"
  ON applications FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'seeker'
    AND auth.uid() = seeker_user_id
  );

-- SELECT (company): can see applications only for its own jobs
CREATE POLICY "applications_select_company"
  ON applications FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'company'
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.company_user_id = auth.uid()
    )
  );

-- UPDATE (company only): company can change status; seekers cannot
CREATE POLICY "applications_update_company_status"
  ON applications FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND auth.user_type() = 'company'
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.company_user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Prevent changing seeker_user_id or job_id; only status is writable
    seeker_user_id = (SELECT seeker_user_id FROM applications a2 WHERE a2.id = applications.id)
    AND job_id      = (SELECT job_id      FROM applications a2 WHERE a2.id = applications.id)
  );

-- No seeker UPDATE policy → seekers cannot change their own application status


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. STORAGE – CV BUCKET (make private, add per-user + company-for-applied policies)
-- =============================================================================
-- Run these in the Supabase Dashboard → Storage → Policies
-- or via the SQL editor if using storage schema directly.

-- Step A: Make the cv_uploads bucket NOT public (run in dashboard or via API):
--   Dashboard → Storage → cv_uploads → Edit bucket → Public = OFF

-- Step B: Storage RLS policies (storage.objects table)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cv_owner_read"          ON storage.objects;
DROP POLICY IF EXISTS "cv_owner_write"         ON storage.objects;
DROP POLICY IF EXISTS "cv_company_read_applied" ON storage.objects;

-- Owner can upload/update/delete their own CV
-- Convention: path is "{user_id}/{filename}"
CREATE POLICY "cv_owner_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cv_uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can read their own CV
CREATE POLICY "cv_owner_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cv_uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Company can read a CV only when the candidate applied to one of its jobs
CREATE POLICY "cv_company_read_applied"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cv_uploads'
    AND auth.role() = 'authenticated'
    AND auth.user_type() = 'company'
    AND EXISTS (
      SELECT 1
      FROM applications app
      JOIN jobs j ON j.id = app.job_id
      WHERE j.company_user_id = auth.uid()
        AND app.seeker_user_id::text = (storage.foldername(name))[1]
    )
  );

-- Public (anon) has NO policy → public URLs for cv_uploads will return 403
-- Make sure the bucket is set to Private in the Supabase dashboard.


-- =============================================================================
-- END OF SCRIPT
-- =============================================================================
