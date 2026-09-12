-- =============================================================================
-- AgriCore Supabase Migration: 09_clean_dummy_data.sql
-- Description: Removes all hardcoded test accounts, demo companies, and sample jobs
--              leaving the pure real taxonomies (55+ specializations, 45+ skills) ready for production.
-- =============================================================================

-- 1. Remove demo job postings
DELETE FROM public.jobs WHERE id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd'
);

-- 2. Remove demo accounts (Cascade will automatically remove their profiles & child records)
DELETE FROM auth.users WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
);

-- Check remaining clean state
SELECT count(*) AS total_jobs FROM public.jobs;
SELECT count(*) AS total_companies FROM public.company_profiles;
SELECT count(*) AS total_specializations FROM public.specializations;
