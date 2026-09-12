-- =============================================================================
-- AgriCore Supabase Migration: 04_indexes.sql
-- Description: Creates B-Tree performance indexes for relational joins and
--              GIN trigram indexes for high-throughput candidate search.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. B-Tree Indexes on Foreign Keys and Filter Columns
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_governorate ON public.profiles(governorate);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_professional_visibility ON public.professional_profiles(visibility_status);
CREATE INDEX IF NOT EXISTS idx_professional_experience_years ON public.professional_profiles(years_of_experience);
CREATE INDEX IF NOT EXISTS idx_professional_education ON public.professional_profiles(highest_education_level);
CREATE INDEX IF NOT EXISTS idx_professional_agricore_id ON public.professional_profiles(agricore_id);

CREATE INDEX IF NOT EXISTS idx_companies_sector ON public.company_profiles(business_sector);
CREATE INDEX IF NOT EXISTS idx_companies_hq_governorate ON public.company_profiles(headquarters_governorate);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_governorate ON public.jobs(governorate);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at_desc ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON public.jobs(application_deadline) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_professional_id ON public.applications(professional_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_educations_prof_id ON public.educations(professional_id);
CREATE INDEX IF NOT EXISTS idx_experiences_prof_id ON public.experiences(professional_id);

CREATE INDEX IF NOT EXISTS idx_profile_specs_spec_id ON public.profile_specializations(specialization_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_id ON public.profile_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_profile_training_cat_id ON public.profile_training_categories(training_category_id);

CREATE INDEX IF NOT EXISTS idx_saved_candidates_company ON public.saved_candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_convo_created ON public.messages(conversation_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. GIN Trigram Indexes for Fast Full-Text and Fuzzy Search
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm 
    ON public.profiles USING gin (full_name extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_professional_title_trgm 
    ON public.professional_profiles USING gin (professional_title extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_professional_summary_trgm 
    ON public.professional_profiles USING gin (summary extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_skills_name_en_trgm 
    ON public.skills USING gin (name_en extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_specializations_name_en_trgm 
    ON public.specializations USING gin (name_en extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm 
    ON public.jobs USING gin (title extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_jobs_description_trgm 
    ON public.jobs USING gin (description extensions.gin_trgm_ops);
