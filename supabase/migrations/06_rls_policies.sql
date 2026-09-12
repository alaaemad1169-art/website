-- =============================================================================
-- AgriCore Supabase Migration: 06_rls_policies.sql
-- Description: Enforces PostgreSQL Row Level Security (RLS) policies across
--              all platform tables, protecting candidate privacy & employer data.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Helper Function: Check if authenticated user is Platform Admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 1. Policies for public.profiles
-- -----------------------------------------------------------------------------
-- Anyone authenticated can view public profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated, anon
    USING (true);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins have full access
CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL TO authenticated
    USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. Policies for public.professional_profiles
-- -----------------------------------------------------------------------------
-- Public can view if visibility is 'public' or if user owns the profile
CREATE POLICY "professional_select_policy" ON public.professional_profiles
    FOR SELECT TO authenticated, anon
    USING (
        visibility_status = 'public'
        OR auth.uid() = id
        OR public.is_admin()
    );

-- Only owning professional can update
CREATE POLICY "professional_update_own" ON public.professional_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 3. Policies for public.company_profiles
-- -----------------------------------------------------------------------------
-- Anyone can view company profiles
CREATE POLICY "company_select_policy" ON public.company_profiles
    FOR SELECT TO authenticated, anon
    USING (true);

-- Only owning company user can update
CREATE POLICY "company_update_own" ON public.company_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 4. Policies for Reference Taxonomies (Read-only for users, Full for Admins)
-- -----------------------------------------------------------------------------
CREATE POLICY "taxonomies_read_specializations" ON public.specializations
    FOR SELECT TO authenticated, anon USING (is_active = true OR public.is_admin());

CREATE POLICY "taxonomies_admin_specializations" ON public.specializations
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "taxonomies_read_skills" ON public.skills
    FOR SELECT TO authenticated, anon USING (is_active = true OR public.is_admin());

CREATE POLICY "taxonomies_admin_skills" ON public.skills
    FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "taxonomies_read_training" ON public.training_categories
    FOR SELECT TO authenticated, anon USING (is_active = true OR public.is_admin());

CREATE POLICY "taxonomies_admin_training" ON public.training_categories
    FOR ALL TO authenticated USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. Policies for Profile Child Tables (Educations, Experiences, Skills, Specs)
-- -----------------------------------------------------------------------------
-- Educations
CREATE POLICY "educations_select" ON public.educations
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.professional_profiles pp 
            WHERE pp.id = educations.professional_id 
            AND (pp.visibility_status = 'public' OR pp.id = auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY "educations_modify_own" ON public.educations
    FOR ALL TO authenticated
    USING (professional_id = auth.uid())
    WITH CHECK (professional_id = auth.uid());

-- Experiences
CREATE POLICY "experiences_select" ON public.experiences
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM public.professional_profiles pp 
            WHERE pp.id = experiences.professional_id 
            AND (pp.visibility_status = 'public' OR pp.id = auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY "experiences_modify_own" ON public.experiences
    FOR ALL TO authenticated
    USING (professional_id = auth.uid())
    WITH CHECK (professional_id = auth.uid());

-- Profile Skills & Specializations
CREATE POLICY "prof_skills_select" ON public.profile_skills FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "prof_skills_modify" ON public.profile_skills FOR ALL TO authenticated
    USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());

CREATE POLICY "prof_specs_select" ON public.profile_specializations FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "prof_specs_modify" ON public.profile_specializations FOR ALL TO authenticated
    USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());

CREATE POLICY "prof_training_select" ON public.profile_training_categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "prof_training_modify" ON public.profile_training_categories FOR ALL TO authenticated
    USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. Policies for Jobs & Job Requirements
-- -----------------------------------------------------------------------------
-- Anyone can view active jobs. Company can view their own jobs in any status.
CREATE POLICY "jobs_select_policy" ON public.jobs
    FOR SELECT TO authenticated, anon
    USING (status = 'active' OR company_id = auth.uid() OR public.is_admin());

CREATE POLICY "jobs_insert_company" ON public.jobs
    FOR INSERT TO authenticated
    WITH CHECK (company_id = auth.uid());

CREATE POLICY "jobs_update_company" ON public.jobs
    FOR UPDATE TO authenticated
    USING (company_id = auth.uid())
    WITH CHECK (company_id = auth.uid());

CREATE POLICY "jobs_delete_company" ON public.jobs
    FOR DELETE TO authenticated
    USING (company_id = auth.uid() OR public.is_admin());

CREATE POLICY "job_specs_select" ON public.job_specializations FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "job_specs_modify" ON public.job_specializations FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_specializations.job_id AND j.company_id = auth.uid()));

CREATE POLICY "job_skills_select" ON public.job_skills FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "job_skills_modify" ON public.job_skills FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_skills.job_id AND j.company_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 7. Policies for Applications & Saved Candidates
-- -----------------------------------------------------------------------------
-- Candidates can view their own applications. Companies can view applications for their jobs.
CREATE POLICY "applications_select_policy" ON public.applications
    FOR SELECT TO authenticated
    USING (
        professional_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.job_id AND j.company_id = auth.uid())
        OR public.is_admin()
    );

CREATE POLICY "applications_insert_candidate" ON public.applications
    FOR INSERT TO authenticated
    WITH CHECK (professional_id = auth.uid());

CREATE POLICY "applications_update_recruiter" ON public.applications
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.job_id AND j.company_id = auth.uid())
        OR public.is_admin()
    );

-- Saved Candidates
CREATE POLICY "saved_candidates_policy" ON public.saved_candidates
    FOR ALL TO authenticated
    USING (company_id = auth.uid())
    WITH CHECK (company_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 8. Policies for Messaging
-- -----------------------------------------------------------------------------
CREATE POLICY "convo_participants_policy" ON public.conversation_participants
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "messages_select_policy" ON public.messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
        )
        OR public.is_admin()
    );

CREATE POLICY "messages_insert_policy" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 9. Policies for Moderation Reports
-- -----------------------------------------------------------------------------
CREATE POLICY "reports_insert" ON public.user_reports
    FOR INSERT TO authenticated
    WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_admin" ON public.user_reports
    FOR ALL TO authenticated
    USING (public.is_admin());
