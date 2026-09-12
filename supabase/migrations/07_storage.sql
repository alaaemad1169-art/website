-- =============================================================================
-- AgriCore Supabase Migration: 07_storage.sql
-- Description: Configures Supabase Storage buckets ('avatars', 'company-logos',
--              'resumes') and their respective Row Level Security policies.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create Buckets
-- -----------------------------------------------------------------------------
-- Public profile avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Public company brand logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'company-logos',
    'company-logos',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Private candidate CV / Resume storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false, -- Private; accessed via signed URLs
    15728640, -- 15 MB
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['application/pdf'];

-- -----------------------------------------------------------------------------
-- 2. Storage Row Level Security (storage.objects)
-- -----------------------------------------------------------------------------

-- Avatars: Public read
CREATE POLICY "avatars_public_select" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'avatars');

-- Avatars: User can upload only to their own directory (e.g. avatars/{user_id}/*)
CREATE POLICY "avatars_owner_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "avatars_owner_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "avatars_owner_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- Company Logos: Public read
CREATE POLICY "logos_public_select" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'company-logos');

-- Company Logos: Company user can upload only to their directory
CREATE POLICY "logos_company_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'company-logos' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "logos_company_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'company-logos' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- Resumes: Candidate owner can read, upload, and update
CREATE POLICY "resumes_owner_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'resumes' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::TEXT
            -- Or if candidate applied to a job posted by the authenticated company
            OR EXISTS (
                SELECT 1 FROM public.applications a
                JOIN public.jobs j ON j.id = a.job_id
                WHERE j.company_id = auth.uid()
                AND a.professional_id::TEXT = (storage.foldername(name))[1]
            )
            -- Or platform admin
            OR public.is_admin()
        )
    );

CREATE POLICY "resumes_owner_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'resumes' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "resumes_owner_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'resumes' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "resumes_owner_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'resumes' 
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );
