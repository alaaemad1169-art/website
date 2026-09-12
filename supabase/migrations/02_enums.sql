-- =============================================================================
-- AgriCore Supabase Migration: 02_enums.sql
-- Description: Defines enumerations for user roles, education levels, job
--              statuses, application workflows, and organization sizes.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- User account classification
DO $$ BEGIN
    CREATE TYPE public.user_type_enum AS ENUM (
        'professional',  -- Agricultural specialists, researchers, engineers, consultants, graduates
        'company',       -- Agribusinesses, food manufacturers, farms, laboratories, NGOs
        'admin'          -- Platform administrators and content moderators
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Candidate gender (optional field)
DO $$ BEGIN
    CREATE TYPE public.gender_enum AS ENUM (
        'male',
        'female',
        'unspecified'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Educational qualification tiers
DO $$ BEGIN
    CREATE TYPE public.education_level_enum AS ENUM (
        'diploma',           -- Technical / Agricultural Secondary or Post-secondary Diploma
        'bachelor',          -- B.Sc. in Agriculture, Science, Veterinary, Engineering, etc.
        'master',            -- M.Sc.
        'phd',               -- Ph.D. / Doctorate
        'other'              -- Other recognized certifications
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Candidate profile visibility mode
DO $$ BEGIN
    CREATE TYPE public.visibility_enum AS ENUM (
        'public',            -- Visible to all registered employers and public talent search
        'anonymous',         -- Profile details visible, but name and direct contacts masked until mutual interest
        'private'            -- Hidden from search; only visible when candidate submits direct application
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Agribusiness organization size brackets
DO $$ BEGIN
    CREATE TYPE public.company_size_enum AS ENUM (
        '1-10',              -- Micro / Startups / Boutique Consultancies
        '11-50',             -- Small Agribusinesses / Specialized Labs
        '51-200',            -- Medium Farms & Packaging Plants
        '201-500',           -- Large Food Manufacturers & Export Houses
        '500+'               -- Conglomerates & Multinationals (e.g. Cairo 3A, Nestle, Wadi Group)
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Employment contract types
DO $$ BEGIN
    CREATE TYPE public.employment_type_enum AS ENUM (
        'full_time',
        'part_time',
        'contract',
        'internship',
        'consulting'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Candidate career experience tiers
DO $$ BEGIN
    CREATE TYPE public.experience_level_enum AS ENUM (
        'fresh_grad',        -- 0 - 1 years experience
        'junior',            -- 1 - 3 years experience
        'mid_level',         -- 3 - 6 years experience
        'senior',            -- 6 - 10 years experience
        'expert'             -- 10+ years / Consultants / University Professors
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Job vacancy lifecycle status
DO $$ BEGIN
    CREATE TYPE public.job_status_enum AS ENUM (
        'draft',             -- Unpublished work-in-progress
        'active',            -- Published and accepting applications
        'paused',            -- Temporarily hidden from search
        'closed'             -- Completed / Hired / Archived
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Job application lifecycle status machine
DO $$ BEGIN
    CREATE TYPE public.application_status_enum AS ENUM (
        'applied',           -- Initial submission by candidate
        'under_review',      -- Recruiter opened profile / evaluating qualifications
        'contacted',         -- Recruiter initiated message / phone screening / interview invite
        'accepted',          -- Offer made and accepted / hired
        'rejected',          -- Candidate not moving forward
        'position_closed'    -- Vacancy closed without individual hire
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User and content moderation report status
DO $$ BEGIN
    CREATE TYPE public.report_status_enum AS ENUM (
        'pending',
        'investigating',
        'resolved',
        'dismissed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;
