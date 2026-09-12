-- =============================================================================
-- AgriCore Supabase Migration: 03_tables.sql
-- Description: Creates all relational tables, constraints, foreign keys,
--              and default values for the AgriCore talent platform.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Base User Profiles (Linked 1:1 with auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type public.user_type_enum NOT NULL DEFAULT 'professional',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    avatar_url TEXT,
    governorate TEXT, -- E.g. Cairo, Giza, Alexandria, Fayoum, Beheira, Minya, etc.
    city TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'AgriCore: Base profile shared across professionals, companies, and admins';

-- -----------------------------------------------------------------------------
-- 2. Professional / Job Seeker Profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    agricore_id TEXT UNIQUE NOT NULL, -- Human-friendly ID, e.g. AGRI-10284
    professional_title TEXT NOT NULL, -- E.g. "Quality Control Engineer", "Irrigation Specialist"
    summary TEXT,
    date_of_birth DATE,
    gender public.gender_enum DEFAULT 'unspecified',
    nationality TEXT DEFAULT 'Egyptian',
    years_of_experience NUMERIC(4, 1) DEFAULT 0.0 CHECK (years_of_experience >= 0),
    highest_education_level public.education_level_enum DEFAULT 'bachelor',
    graduation_year INT CHECK (graduation_year BETWEEN 1960 AND 2040),
    resume_url TEXT, -- Path in private 'resumes' Supabase Storage bucket
    visibility_status public.visibility_enum NOT NULL DEFAULT 'public',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    profile_completion_pct INT NOT NULL DEFAULT 20 CHECK (profile_completion_pct BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.professional_profiles IS 'AgriCore: Extended profile for agricultural candidates and specialists';

-- -----------------------------------------------------------------------------
-- 3. Company / Agribusiness Profiles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    logo_url TEXT, -- Path in public 'company-logos' Supabase Storage bucket
    business_sector TEXT NOT NULL, -- E.g. "Food Manufacturing", "Poultry Production", "Agrochemicals"
    company_size public.company_size_enum NOT NULL DEFAULT '11-50',
    website_url TEXT,
    description TEXT,
    headquarters_governorate TEXT NOT NULL,
    headquarters_city TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.company_profiles IS 'AgriCore: Extended profile for agribusinesses and hiring organizations';

-- -----------------------------------------------------------------------------
-- 4. Reference Taxonomies: Specializations, Skills, Training Categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    category_group TEXT NOT NULL, -- E.g. "Plant Science", "Animal Science", "Food & Quality", "Management"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    category_group TEXT NOT NULL, -- E.g. "Technical", "Lab & Quality", "Agronomy", "Soft Skills"
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    code TEXT UNIQUE, -- E.g. "HACCP", "ISO-22000", "GLOBALG.A.P."
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. Many-to-Many Mappings for Professionals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_specializations (
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES public.specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (professional_id, specialization_id)
);

CREATE TABLE IF NOT EXISTS public.profile_skills (
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    years_experience NUMERIC(4, 1),
    PRIMARY KEY (professional_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.profile_training_categories (
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    training_category_id UUID NOT NULL REFERENCES public.training_categories(id) ON DELETE CASCADE,
    completion_year INT CHECK (completion_year BETWEEN 1970 AND 2040),
    PRIMARY KEY (professional_id, training_category_id)
);

-- -----------------------------------------------------------------------------
-- 6. Education & Work Experience Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    degree public.education_level_enum NOT NULL DEFAULT 'bachelor',
    university TEXT NOT NULL, -- E.g. Cairo University, Ain Shams, Alexandria
    faculty TEXT NOT NULL, -- E.g. Faculty of Agriculture, Veterinary Medicine
    department TEXT, -- E.g. Food Science, Plant Pathology, Agronomy
    graduation_year INT NOT NULL CHECK (graduation_year BETWEEN 1960 AND 2040),
    gpa_or_grade TEXT, -- Optional, e.g. "Excellent", "Very Good", "3.6 GPA"
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    industry_sector TEXT,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    responsibilities TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_experience_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- -----------------------------------------------------------------------------
-- 7. Jobs & Vacancies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    qualifications TEXT,
    employment_type public.employment_type_enum NOT NULL DEFAULT 'full_time',
    experience_level public.experience_level_enum NOT NULL DEFAULT 'mid_level',
    min_experience_years INT NOT NULL DEFAULT 0 CHECK (min_experience_years >= 0),
    max_experience_years INT CHECK (max_experience_years IS NULL OR max_experience_years >= min_experience_years),
    governorate TEXT NOT NULL,
    city TEXT,
    is_remote BOOLEAN NOT NULL DEFAULT false,
    min_education_level public.education_level_enum DEFAULT 'bachelor',
    application_deadline DATE,
    status public.job_status_enum NOT NULL DEFAULT 'active',
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_specializations (
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    specialization_id UUID NOT NULL REFERENCES public.specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, specialization_id)
);

CREATE TABLE IF NOT EXISTS public.job_skills (
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    is_required BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (job_id, skill_id)
);

-- -----------------------------------------------------------------------------
-- 8. Applications & Saved Candidates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL, -- Snapshot of resume version when applied
    cover_note TEXT,
    status public.application_status_enum NOT NULL DEFAULT 'applied',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (job_id, professional_id) -- Prevent duplicate active applications
);

CREATE TABLE IF NOT EXISTS public.saved_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, professional_id)
);

-- -----------------------------------------------------------------------------
-- 9. Messaging & Notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 10. Moderation & Platform Administration
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status public.report_status_enum NOT NULL DEFAULT 'pending',
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
