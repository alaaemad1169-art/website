-- =============================================================================
-- AgriCore Supabase Migration: 05_functions_triggers.sql
-- Description: Automated user provisioning, profile completion calculation,
--              and the multi-criteria candidate matching scoring algorithm.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Helper: Automatic updated_at timestamp refresher
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_professional_updated_at ON public.professional_profiles;
CREATE TRIGGER trigger_professional_updated_at
    BEFORE UPDATE ON public.professional_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_companies_updated_at ON public.company_profiles;
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON public.company_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON public.jobs;
CREATE TRIGGER trigger_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON public.applications;
CREATE TRIGGER trigger_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Auth Trigger: Automated Profile Provisioning on Supabase Sign-Up
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_type public.user_type_enum;
    v_full_name TEXT;
    v_agricore_id TEXT;
    v_random_num INT;
BEGIN
    -- Extract role and metadata with safe fallbacks
    v_user_type := COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type_enum, 'professional');
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    -- Insert into base profiles table
    INSERT INTO public.profiles (
        id,
        user_type,
        full_name,
        email,
        phone_number,
        governorate,
        city
    ) VALUES (
        NEW.id,
        v_user_type,
        v_full_name,
        NEW.email,
        NEW.raw_user_meta_data->>'phone_number',
        COALESCE(NEW.raw_user_meta_data->>'governorate', 'Cairo'),
        NEW.raw_user_meta_data->>'city'
    );

    -- If Professional User: create professional profile with unique AgriCore ID
    IF v_user_type = 'professional' THEN
        v_random_num := 10000 + floor(random() * 90000)::INT;
        v_agricore_id := 'AGRI-' || v_random_num::TEXT;

        INSERT INTO public.professional_profiles (
            id,
            agricore_id,
            professional_title,
            summary,
            nationality,
            profile_completion_pct
        ) VALUES (
            NEW.id,
            v_agricore_id,
            COALESCE(NEW.raw_user_meta_data->>'professional_title', 'Agricultural Specialist'),
            NEW.raw_user_meta_data->>'summary',
            COALESCE(NEW.raw_user_meta_data->>'nationality', 'Egyptian'),
            20 -- Default starting completion
        );
    -- If Company User: create company profile
    ELSIF v_user_type = 'company' THEN
        INSERT INTO public.company_profiles (
            id,
            company_name,
            business_sector,
            company_size,
            headquarters_governorate,
            headquarters_city
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', v_full_name),
            COALESCE(NEW.raw_user_meta_data->>'business_sector', 'Agribusiness & Food Production'),
            COALESCE((NEW.raw_user_meta_data->>'company_size')::public.company_size_enum, '11-50'),
            COALESCE(NEW.raw_user_meta_data->>'governorate', 'Cairo'),
            NEW.raw_user_meta_data->>'city'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. Dynamic Profile Completion Calculator (0 - 100%)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_profile_completion(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_score INT := 0;
    v_has_summary BOOLEAN;
    v_has_avatar BOOLEAN;
    v_has_resume BOOLEAN;
    v_edu_count INT;
    v_exp_count INT;
    v_skills_count INT;
    v_spec_count INT;
BEGIN
    -- Check base profile and avatar
    SELECT (avatar_url IS NOT NULL AND avatar_url <> '') INTO v_has_avatar
    FROM public.profiles WHERE id = p_user_id;
    IF v_has_avatar THEN v_score := v_score + 10; END IF;

    -- Check summary and resume
    SELECT 
        (summary IS NOT NULL AND length(trim(summary)) > 20),
        (resume_url IS NOT NULL AND resume_url <> '')
    INTO v_has_summary, v_has_resume
    FROM public.professional_profiles WHERE id = p_user_id;

    IF v_has_summary THEN v_score := v_score + 15; END IF;
    IF v_has_resume THEN v_score := v_score + 15; END IF;

    -- Check educations
    SELECT count(*) INTO v_edu_count FROM public.educations WHERE professional_id = p_user_id;
    IF v_edu_count > 0 THEN v_score := v_score + 20; END IF;

    -- Check experiences
    SELECT count(*) INTO v_exp_count FROM public.experiences WHERE professional_id = p_user_id;
    IF v_exp_count > 0 THEN v_score := v_score + 20; END IF;

    -- Check skills
    SELECT count(*) INTO v_skills_count FROM public.profile_skills WHERE professional_id = p_user_id;
    IF v_skills_count >= 3 THEN v_score := v_score + 10;
    ELSIF v_skills_count > 0 THEN v_score := v_score + 5;
    END IF;

    -- Check specializations
    SELECT count(*) INTO v_spec_count FROM public.profile_specializations WHERE professional_id = p_user_id;
    IF v_spec_count > 0 THEN v_score := v_score + 10; END IF;

    -- Clamp between 10 and 100
    v_score := GREATEST(10, LEAST(100, v_score));

    -- Update table
    UPDATE public.professional_profiles
    SET profile_completion_pct = v_score
    WHERE id = p_user_id;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 4. Candidate Compatibility Matching Engine
-- -----------------------------------------------------------------------------
-- Returns a percentage score (0 - 100) based on 5 weighted criteria:
-- 1. Specializations: 30%
-- 2. Skills: 25%
-- 3. Experience: 20%
-- 4. Location: 15%
-- 5. Education: 10%
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_candidate_match_score(
    p_job_id UUID,
    p_professional_id UUID
)
RETURNS INT AS $$
DECLARE
    -- Weights
    c_weight_spec NUMERIC := 30.0;
    c_weight_skills NUMERIC := 25.0;
    c_weight_exp NUMERIC := 20.0;
    c_weight_loc NUMERIC := 15.0;
    c_weight_edu NUMERIC := 10.0;

    -- Component scores (0.0 to 1.0)
    v_score_spec NUMERIC := 0.0;
    v_score_skills NUMERIC := 0.0;
    v_score_exp NUMERIC := 0.0;
    v_score_loc NUMERIC := 0.0;
    v_score_edu NUMERIC := 0.0;

    -- Job criteria
    v_job_governorate TEXT;
    v_job_is_remote BOOLEAN;
    v_job_min_exp INT;
    v_job_max_exp INT;
    v_job_min_edu public.education_level_enum;
    v_total_job_specs INT := 0;
    v_matching_specs INT := 0;
    v_total_job_skills INT := 0;
    v_matching_skills INT := 0;

    -- Candidate criteria
    v_cand_governorate TEXT;
    v_cand_exp NUMERIC;
    v_cand_edu public.education_level_enum;

    v_final_score INT;
BEGIN
    -- 1. Fetch Job details
    SELECT governorate, is_remote, min_experience_years, max_experience_years, min_education_level
    INTO v_job_governorate, v_job_is_remote, v_job_min_exp, v_job_max_exp, v_job_min_edu
    FROM public.jobs WHERE id = p_job_id;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- 2. Fetch Candidate details
    SELECT p.governorate, pp.years_of_experience, pp.highest_education_level
    INTO v_cand_governorate, v_cand_exp, v_cand_edu
    FROM public.profiles p
    JOIN public.professional_profiles pp ON pp.id = p.id
    WHERE p.id = p_professional_id;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- -------------------------------------------------------------------------
    -- Criterion 1: Specialization Match (30%)
    -- -------------------------------------------------------------------------
    SELECT count(*) INTO v_total_job_specs FROM public.job_specializations WHERE job_id = p_job_id;
    IF v_total_job_specs = 0 THEN
        v_score_spec := 1.0; -- If job has no explicit specs required, default full
    ELSE
        SELECT count(*) INTO v_matching_specs
        FROM public.job_specializations js
        JOIN public.profile_specializations ps ON ps.specialization_id = js.specialization_id
        WHERE js.job_id = p_job_id AND ps.professional_id = p_professional_id;

        v_score_spec := LEAST(1.0, v_matching_specs::NUMERIC / v_total_job_specs::NUMERIC);
    END IF;

    -- -------------------------------------------------------------------------
    -- Criterion 2: Skills Match (25%)
    -- -------------------------------------------------------------------------
    SELECT count(*) INTO v_total_job_skills FROM public.job_skills WHERE job_id = p_job_id;
    IF v_total_job_skills = 0 THEN
        v_score_skills := 1.0;
    ELSE
        SELECT count(*) INTO v_matching_skills
        FROM public.job_skills js
        JOIN public.profile_skills ps ON ps.skill_id = js.skill_id
        WHERE js.job_id = p_job_id AND ps.professional_id = p_professional_id;

        v_score_skills := LEAST(1.0, v_matching_skills::NUMERIC / v_total_job_skills::NUMERIC);
    END IF;

    -- -------------------------------------------------------------------------
    -- Criterion 3: Experience Match (20%)
    -- -------------------------------------------------------------------------
    IF v_cand_exp >= v_job_min_exp THEN
        IF v_job_max_exp IS NULL OR v_cand_exp <= (v_job_max_exp + 2) THEN
            v_score_exp := 1.0; -- Perfect match
        ELSE
            v_score_exp := 0.85; -- Slightly overqualified
        END IF;
    ELSIF v_cand_exp >= (v_job_min_exp - 1) THEN
        v_score_exp := 0.70; -- Close to required
    ELSE
        v_score_exp := GREATEST(0.2, (v_cand_exp / GREATEST(1, v_job_min_exp)) * 0.7);
    END IF;

    -- -------------------------------------------------------------------------
    -- Criterion 4: Location Match (15%)
    -- -------------------------------------------------------------------------
    IF v_job_is_remote THEN
        v_score_loc := 1.0;
    ELSIF lower(trim(COALESCE(v_job_governorate, ''))) = lower(trim(COALESCE(v_cand_governorate, ''))) THEN
        v_score_loc := 1.0; -- Same governorate
    ELSIF (lower(v_job_governorate) IN ('cairo', 'giza') AND lower(v_cand_governorate) IN ('cairo', 'giza')) THEN
        v_score_loc := 0.90; -- Greater Cairo metro area
    ELSE
        v_score_loc := 0.40; -- Distant governorate (willing to relocate)
    END IF;

    -- -------------------------------------------------------------------------
    -- Criterion 5: Education Match (10%)
    -- -------------------------------------------------------------------------
    IF v_cand_edu = v_job_min_edu THEN
        v_score_edu := 1.0;
    ELSIF v_cand_edu IN ('master', 'phd') THEN
        v_score_edu := 1.0; -- Advanced degree satisfies bachelor/diploma
    ELSIF v_cand_edu = 'bachelor' AND v_job_min_edu = 'diploma' THEN
        v_score_edu := 1.0;
    ELSE
        v_score_edu := 0.50;
    END IF;

    -- Compute final aggregate score
    v_final_score := round(
        (v_score_spec * c_weight_spec) +
        (v_score_skills * c_weight_skills) +
        (v_score_exp * c_weight_exp) +
        (v_score_loc * c_weight_loc) +
        (v_score_edu * c_weight_edu)
    )::INT;

    RETURN GREATEST(10, LEAST(99, v_final_score));
END;
$$ LANGUAGE plpgsql STABLE;
