-- =============================================================================
-- AgriCore – Supabase Row Level Security (RLS) Policies
-- Run this entire script in the Supabase SQL Editor (once).
-- It is idempotent: DROP IF EXISTS before every CREATE POLICY.
-- No DROP TABLE or DELETE statements are included.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: stable function that reads user_type from JWT metadata claim
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.agri_user_type()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'user_type'),
    (auth.jwt() ->> 'user_type')
  );
$$;

-- =============================================================================
-- 1. PROFILES TABLE
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;

-- Users can read only their own profile row
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert only their own profile row
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own row; cannot change the owner id
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No DELETE policy → profile deletion is denied by default when RLS is on


-- =============================================================================
-- 2. JOBS TABLE
-- =============================================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_active"      ON jobs;
DROP POLICY IF EXISTS "jobs_insert_company"     ON jobs;
DROP POLICY IF EXISTS "jobs_update_own_company" ON jobs;
DROP POLICY IF EXISTS "jobs_delete_own_company" ON jobs;

-- Anyone (including anonymous visitors) can read active/published jobs
CREATE POLICY "jobs_select_active"
  ON jobs FOR SELECT
  USING (status = 'active');

-- Only authenticated company users can create jobs;
-- the job must be linked to the posting user
CREATE POLICY "jobs_insert_company"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'company'
    AND auth.uid() = company_user_id
  );

-- A company can edit only its own jobs
CREATE POLICY "jobs_update_own_company"
  ON jobs FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'company'
    AND auth.uid() = company_user_id
  )
  WITH CHECK (
    auth.uid() = company_user_id
  );

-- A company can delete only its own jobs
CREATE POLICY "jobs_delete_own_company"
  ON jobs FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'company'
    AND auth.uid() = company_user_id
  );


-- =============================================================================
-- 3. APPLICATIONS TABLE
-- =============================================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_insert_seeker"          ON applications;
DROP POLICY IF EXISTS "applications_select_own_seeker"      ON applications;
DROP POLICY IF EXISTS "applications_select_company"         ON applications;
DROP POLICY IF EXISTS "applications_update_company_status"  ON applications;

-- Unique constraint: one application per (seeker, job)
-- Safe to run multiple times — drops the old one first if it exists
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_seeker_job_unique;
ALTER TABLE applications
  ADD CONSTRAINT applications_seeker_job_unique
  UNIQUE (seeker_user_id, job_id);

-- Only authenticated seekers can submit applications;
-- seeker_user_id must equal their own uid
CREATE POLICY "applications_insert_seeker"
  ON applications FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'seeker'
    AND auth.uid() = seeker_user_id
  );

-- Seekers can read only their own applications
CREATE POLICY "applications_select_own_seeker"
  ON applications FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'seeker'
    AND auth.uid() = seeker_user_id
  );

-- Companies can read applications only for jobs they own
CREATE POLICY "applications_select_company"
  ON applications FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'company'
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.company_user_id = auth.uid()
    )
  );

-- Companies can update the status field on applications for their own jobs.
-- The WITH CHECK prevents changing seeker_user_id or job_id.
CREATE POLICY "applications_update_company_status"
  ON applications FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.agri_user_type() = 'company'
    AND EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
        AND jobs.company_user_id = auth.uid()
    )
  )
  WITH CHECK (
    seeker_user_id = (SELECT a2.seeker_user_id FROM applications a2 WHERE a2.id = applications.id)
    AND job_id     = (SELECT a2.job_id      FROM applications a2 WHERE a2.id = applications.id)
  );

-- No seeker UPDATE policy → seekers cannot change their own application status


-- =============================================================================
-- 4. STORAGE — resumes BUCKET (private CV access)
-- =============================================================================
-- IMPORTANT: Before running the storage policies below, go to:
--   Supabase Dashboard → Storage → resumes → Edit bucket → set Public = OFF
--
-- Storage path convention used here: "{user_id}/{filename}"
-- =============================================================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cv_owner_write"          ON storage.objects;
DROP POLICY IF EXISTS "cv_owner_read"           ON storage.objects;
DROP POLICY IF EXISTS "cv_company_read_applied" ON storage.objects;

-- CV owner: can upload (INSERT) their own files
CREATE POLICY "cv_owner_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- CV owner: can read (SELECT) their own files
CREATE POLICY "cv_owner_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Company: can read a CV only when that candidate applied to one of its jobs
CREATE POLICY "cv_company_read_applied"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes'
    AND auth.role() = 'authenticated'
    AND public.agri_user_type() = 'company'
    AND EXISTS (
      SELECT 1
      FROM applications app
      JOIN jobs j ON j.id = app.job_id
      WHERE j.company_user_id = auth.uid()
        AND app.seeker_user_id::text = (storage.foldername(name))[1]
    )
  );

-- Anonymous users have NO storage policy → public CV URLs return 403 Forbidden

-- =============================================================================
-- END OF SCRIPT
-- =============================================================================
