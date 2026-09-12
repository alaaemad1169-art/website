-- =============================================================================
-- AgriCore Supabase Migration: 08_seed_data.sql
-- Description: Comprehensive production seed data including 55+ specializations,
--              45+ skills, 25+ training categories, and UI demo records.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seed Specializations (55 Agricultural & Related Fields)
-- -----------------------------------------------------------------------------
INSERT INTO public.specializations (name_en, name_ar, category_group) VALUES
-- Plant & Crop Sciences
('Crop Production', 'إنتاج المحاصيل', 'Plant Science'),
('Field Crops', 'المحاصيل الحقلية', 'Plant Science'),
('Horticulture', 'البساتين', 'Plant Science'),
('Vegetables', 'الخضر', 'Plant Science'),
('Fruits', 'الفاكهة', 'Plant Science'),
('Ornamental Plants', 'نباتات الزينة', 'Plant Science'),
('Plant Protection', 'وقاية النبات', 'Plant Protection & Health'),
('Pest Management', 'مكافحة الآفات', 'Plant Protection & Health'),
('Plant Disease Management', 'أمراض النبات', 'Plant Protection & Health'),
('Biological Control', 'المكافحة الحيوية', 'Plant Protection & Health'),
('Pesticides', 'المبيدات الزراعية', 'Plant Protection & Health'),
-- Soil, Water & Precision Tech
('Soil Science', 'علوم الأراضي والتربة', 'Soil & Water'),
('Water Science', 'علوم المياه والري', 'Soil & Water'),
('Irrigation & Drainage', 'الري والصرف', 'Soil & Water'),
('Modern Irrigation', 'نظم الري الحديث', 'Soil & Water'),
('Greenhouse Production', 'الزراعة المحمية والصوب', 'AgriTech & Modern Systems'),
('Organic Agriculture', 'الزراعة العضوية', 'AgriTech & Modern Systems'),
('Smart Agriculture', 'الزراعة الذكية', 'AgriTech & Modern Systems'),
('Precision Agriculture', 'الزراعة الدقيقة', 'AgriTech & Modern Systems'),
('Agricultural Biotechnology', 'التكنولوجيا الحيوية الزراعية', 'AgriTech & Modern Systems'),
('Agricultural Machinery', 'الميكنة والآلات الزراعية', 'AgriTech & Modern Systems'),
-- Animal & Poultry Production
('Livestock Production', 'الإنتاج الحيواني', 'Animal & Poultry'),
('Animal Nutrition', 'تغذية الحيوان', 'Animal & Poultry'),
('Poultry Production', 'إنتاج الدواجن', 'Animal & Poultry'),
('Poultry Nutrition', 'تغذية الدواجن', 'Animal & Poultry'),
('Hatcheries', 'التفريخ ومعامل التفريخ', 'Animal & Poultry'),
('Aquaculture', 'الاستزراع السمكي', 'Animal & Poultry'),
('Feed Industry', 'صناعة الأعلاف', 'Animal & Poultry'),
-- Food Technology & Safety
('Food Technology', 'تكنولوجيا الأغذية', 'Food Science & Quality'),
('Food Processing', 'التصنيع الغذائي', 'Food Science & Quality'),
('Quality Control', 'مراقبة الجودة (QC)', 'Food Science & Quality'),
('Quality Assurance', 'توكيد الجودة (QA)', 'Food Science & Quality'),
('Food Safety', 'سلامة الغذاء', 'Food Science & Quality'),
('Laboratory Sciences', 'العلوم المعملية', 'Lab & Diagnostics'),
('Medical Laboratory Sciences', 'التحاليل الطبية والمعملية', 'Lab & Diagnostics'),
('Microbiology', 'الميكروبيولوجي', 'Lab & Diagnostics'),
('Biochemistry', 'الكيمياء الحيوية', 'Lab & Diagnostics'),
('Clinical Nutrition', 'التغذية العلاجية', 'Food Science & Quality'),
-- Landscaping, Management & Business
('Landscaping', 'تنسيق الحدائق واللاندسكيب', 'Landscape & Design'),
('Farm Management', 'إدارة المزارع', 'Management & Agribusiness'),
('Agricultural Marketing', 'التسويق الزراعي', 'Management & Agribusiness'),
('Agricultural Export', 'التصدير الزراعي', 'Management & Agribusiness'),
('Supply Chain', 'سلاسل الإمداد والتوريد', 'Management & Agribusiness'),
('Agricultural Economics', 'الاقتصاد الزراعي', 'Management & Agribusiness'),
('Agricultural Extension', 'الإرشاد الزراعي', 'Management & Agribusiness'),
('Agricultural Consulting', 'الاستشارات الزراعية', 'Management & Agribusiness'),
('Fertilizers', 'الأسمدة والمغذيات الزراعية', 'Plant Science'),
('Agricultural Services', 'الخدمات الزراعية', 'Management & Agribusiness'),
('Research & Development', 'البحث والتطوير (R&D)', 'Science & Research'),
('Agricultural Education', 'التعليم الزراعي والأكاديمي', 'Science & Research'),
('Operations Management', 'إدارة العمليات والتشغيل', 'Management & Agribusiness'),
('Agricultural Sales', 'المبيعات الزراعية', 'Sales & Commercial'),
('Agricultural Procurement', 'المشتريات الزراعية', 'Management & Agribusiness'),
('Agricultural HR', 'الموارد البشرية الزراعية', 'Management & Agribusiness'),
('Agricultural Finance & Accounting', 'المحاسبة والمالية الزراعية', 'Management & Agribusiness')
ON CONFLICT (name_en) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Seed Skills (45 Agricultural & Technical Competencies)
-- -----------------------------------------------------------------------------
INSERT INTO public.skills (name_en, name_ar, category_group) VALUES
('Farm Management', 'إدارة المزارع', 'Management'),
('Workforce Management', 'إدارة العمالة الزراعية', 'Management'),
('Crop Production', 'إنتاج المحاصيل', 'Agronomy'),
('Livestock Production', 'إدارة الإنتاج الحيواني', 'Animal Science'),
('Poultry Production', 'إدارة مزارع الدواجن', 'Poultry'),
('Animal Nutrition', 'تركيب علائق وتغذية حيوان', 'Nutrition'),
('Poultry Nutrition', 'تغذية دواجن', 'Nutrition'),
('Greenhouse Management', 'إدارة الصوب الزراعية', 'Agronomy'),
('Irrigation Systems', 'تشغيل وصيانة شبكات الري', 'Engineering'),
('Soil Analysis', 'تحليل التربة وتفسير النتائج', 'Laboratory'),
('Water Analysis', 'تحاليل المياه وصلاحية الري', 'Laboratory'),
('Food Safety', 'تطبيق اشتراطات سلامة الغذاء', 'Quality'),
('Quality Assurance', 'توكيد الجودة والأنظمة', 'Quality'),
('Quality Control', 'الفحص والرقابة على خطوط الإنتاج', 'Quality'),
('HACCP', 'نظام تحليل المخاطر ونقاط التحكم الحرجة', 'Standards'),
('ISO 22000', 'نظام إدارة سلامة الغذاء ISO 22000', 'Standards'),
('GMP', 'الممارسات التصنيعية الجيدة', 'Standards'),
('GLP', 'الممارسات المعملية الجيدة', 'Standards'),
('Food Manufacturing', 'التصنيع الغذائي والعمليات الحرارية', 'Processing'),
('Packaging', 'التعبئة والتغليف', 'Processing'),
('Cold Storage', 'إدارة التبريد والمخازن المبردة', 'Logistics'),
('Pest Control', 'المكافحة المتكاملة للآفات (IPM)', 'Plant Protection'),
('Biological Control', 'استخدام المفترسات والأعداء الحيوية', 'Plant Protection'),
('Plant Disease Diagnosis', 'تشخيص أمراض النبات الفطرية والبكتيرية', 'Plant Protection'),
('Animal Disease Diagnosis', 'تشخيص الأمراض البيطرية', 'Veterinary'),
('Laboratory Analysis', 'إجراء الفحوصات والتحاليل المعملية', 'Laboratory'),
('Microbiology', 'الفحص الميكروبيولوجي', 'Laboratory'),
('Biochemistry', 'التحاليل الكيميائية والحيوية', 'Laboratory'),
('Clinical Nutrition', 'تخطيط الوجبات والتغذية الإكلينيكية', 'Nutrition'),
('Landscaping', 'تنفيذ وصيانة المسطحات الخضراء', 'Landscape'),
('Garden Design', 'تصميم الحدائق وشبكات الري', 'Landscape'),
('Project Management', 'إدارة المشروعات الزراعية', 'Management'),
('Agricultural Marketing', 'التسويق للمنتجات الزراعية', 'Commercial'),
('Sales', 'المبيعات الفنية الزراعية', 'Commercial'),
('Export Management', 'إجراءات وشحن الحاصلات الزراعية', 'Commercial'),
('Negotiation', 'التفاوض والتعاقدات', 'Soft Skills'),
('Supply Chain Management', 'إدارة سلاسل التوريد واللوجستيات', 'Logistics'),
('Microsoft Excel', 'تحليل البيانات ببرنامج إكسل', 'Digital Skills'),
('Data Analysis', 'تحليل البيانات وإعداد الإحصاءات', 'Digital Skills'),
('Reporting', 'إعداد التقارير الفنية والإدارية', 'Soft Skills'),
('Research', 'إجراء التجارب والبحوث العلمية', 'Research'),
('Training', 'تدريب وتأهيل الكوادر', 'Leadership'),
('Consulting', 'تقديم الاستشارات الفنية المتخصصة', 'Consulting'),
('English Language', 'اللغة الإنجليزية المهنية', 'Languages')
ON CONFLICT (name_en) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Seed Training Categories (25 Professional Programs & Certifications)
-- -----------------------------------------------------------------------------
INSERT INTO public.training_categories (name_en, name_ar, code) VALUES
('HACCP', 'نظام تحليل المخاطر ونقاط التحكم الحرجة', 'HACCP'),
('ISO 22000', 'نظام إدارة سلامة الغذاء آيزو 22000', 'ISO-22000'),
('GMP', 'ممارسات التصنيع الجيد (Good Manufacturing Practice)', 'GMP'),
('GLP', 'الممارسات المعملية الجيدة (Good Laboratory Practice)', 'GLP'),
('Food Safety', 'أساسيات سلامة الغذاء والصحة المهنية', 'FOOD-SAFETY'),
('Quality Management', 'إدارة الجودة الشاملة (TQM)', 'Q-MGMT'),
('Pest Control', 'المكافحة المتكاملة لآفات الصحة العامة والزراعة', 'PEST-CTRL'),
('Livestock Production', 'إدارة وإنتاج قطعان الماشية والألبان', 'LIVESTOCK-PRD'),
('Poultry Production', 'إدارة قطعان التسمين والبياض والأمهات', 'POULTRY-PRD'),
('Food Processing', 'تقنيات التصنيع الغذائي وحفظ الأغذية', 'FOOD-PROC'),
('Organic Farming', 'اشتراطات ومعايير الزراعة العضوية والحيوية', 'ORGANIC'),
('Modern Irrigation', 'تصميم وإدارة شبكات الري الحديث بالتنقيط والرش', 'MODERN-IRR'),
('Landscaping', 'هندسة اللاندسكيب ونباتات الزينة', 'LANDSCAPE'),
('Farm Management', 'الإدارة المالية والفنية للمزارع الكبرى', 'FARM-MGMT'),
('Agricultural Marketing', 'تسويق الحاصلات الزراعية والمنتجات الغذائية', 'AGRI-MKTG'),
('Agricultural Export', 'مواصفات التصدير ومعايير الجودة العالمية', 'AGRI-EXPORT'),
('Laboratory Analysis', 'الفحوصات الكيميائية والميكروبيولوجية المتقدمة', 'LAB-ANALYSIS'),
('Clinical Nutrition', 'التغذية العلاجية وإعداد البرامج الغذائية', 'CLIN-NUTR'),
('Microsoft Office', 'حزمة برامج مايكروسوفت أوفيس وإكسل للمهندسين', 'MS-OFFICE'),
('Farm Management Software', 'البرمجيات المتخصصة في إدارة المزارع والقطعان', 'FARM-SW'),
('Data Analysis', 'تحليل البيانات الزراعية والإحصاء الحيوي', 'DATA-ANALYSIS'),
('Quality Assurance', 'توكيد الجودة والمطابقة وتدقيق الأنظمة', 'QA-AUDIT'),
('Risk Management', 'إدارة المخاطر في سلاسل الإمداد الغذائي', 'RISK-MGMT'),
('Occupational Health & Safety', 'السلامة والصحة المهنية (OSHA)', 'OHS'),
('Other', 'دورات وتدريبات تخصصية أخرى', 'OTHER')
ON CONFLICT (name_en) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Seed UI Demo Agribusiness Companies & Jobs
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    v_cairo3a_id UUID := '11111111-1111-1111-1111-111111111111';
    v_delta_id UUID := '22222222-2222-2222-2222-222222222222';
    v_agromisr_id UUID := '33333333-3333-3333-3333-333333333333';
    v_nestle_id UUID := '44444444-4444-4444-4444-444444444444';
    
    v_job_qc UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_job_fs UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    v_job_agri UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    v_job_prod UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';

    v_spec_qc UUID;
    v_spec_fs UUID;
    v_spec_agri UUID;
    v_skill_haccp UUID;
    v_skill_iso UUID;
    v_skill_qc UUID;
    v_skill_excel UUID;
BEGIN
    -- Fetch taxonomy IDs for mapping
    SELECT id INTO v_spec_qc FROM public.specializations WHERE name_en = 'Quality Control' LIMIT 1;
    SELECT id INTO v_spec_fs FROM public.specializations WHERE name_en = 'Food Safety' LIMIT 1;
    SELECT id INTO v_spec_agri FROM public.specializations WHERE name_en = 'Crop Production' LIMIT 1;

    SELECT id INTO v_skill_haccp FROM public.skills WHERE name_en = 'HACCP' LIMIT 1;
    SELECT id INTO v_skill_iso FROM public.skills WHERE name_en = 'ISO 22000' LIMIT 1;
    SELECT id INTO v_skill_qc FROM public.skills WHERE name_en = 'Quality Control' LIMIT 1;
    SELECT id INTO v_skill_excel FROM public.skills WHERE name_en = 'Microsoft Excel' LIMIT 1;

    -- -------------------------------------------------------------------------
    -- 4.1 Insert Demo Users into auth.users to satisfy Foreign Key constraints
    -- -------------------------------------------------------------------------
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES
    (
        v_delta_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'hr@deltafoods.eg', extensions.crypt('AgriCore2026!', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        '{"user_type":"company","company_name":"Delta Foods","full_name":"Delta Foods","governorate":"Cairo","city":"6th of October City"}',
        now(), now()
    ),
    (
        v_cairo3a_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'careers@cairo3a.com', extensions.crypt('AgriCore2026!', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        '{"user_type":"company","company_name":"Cairo 3A","full_name":"Cairo 3A","governorate":"Cairo","city":"New Cairo"}',
        now(), now()
    ),
    (
        v_agromisr_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'recruitment@agromisr.com', extensions.crypt('AgriCore2026!', extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        '{"user_type":"company","company_name":"AgroMisr","full_name":"AgroMisr","governorate":"Fayoum","city":"Kom Oshim"}',
        now(), now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- -------------------------------------------------------------------------
    -- 4.2 Profiles for Companies
    -- -------------------------------------------------------------------------
    INSERT INTO public.profiles (id, user_type, full_name, email, phone_number, governorate, city)
    VALUES 
    (v_delta_id, 'company', 'Delta Foods', 'hr@deltafoods.eg', '+201001234567', 'Cairo', '6th of October City'),
    (v_cairo3a_id, 'company', 'Cairo 3A', 'careers@cairo3a.com', '+201009876543', 'Cairo', 'New Cairo'),
    (v_agromisr_id, 'company', 'AgroMisr', 'recruitment@agromisr.com', '+201023456789', 'Fayoum', 'Kom Oshim')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.company_profiles (id, company_name, business_sector, company_size, headquarters_governorate, headquarters_city, is_verified)
    VALUES 
    (v_delta_id, 'Delta Foods', 'Food Industry & FMCG', '201-500', 'Cairo', '6th of October City', true),
    (v_cairo3a_id, 'Cairo 3A', 'Agribusiness & Poultry Conglomerate', '500+', 'Cairo', 'New Cairo', true),
    (v_agromisr_id, 'AgroMisr', 'Agricultural Production & Export', '51-200', 'Fayoum', 'Kom Oshim', true)
    ON CONFLICT (id) DO UPDATE SET is_verified = true;

    -- -------------------------------------------------------------------------
    -- Jobs Matching the UI Mockups
    -- -------------------------------------------------------------------------
    -- 1. Quality Control Engineer (Cairo 3A / Delta Foods)
    INSERT INTO public.jobs (
        id, company_id, title, description, responsibilities, qualifications, 
        employment_type, experience_level, min_experience_years, max_experience_years, 
        governorate, city, is_remote, min_education_level, status
    ) VALUES (
        v_job_qc, v_cairo3a_id, 'Quality Control Engineer',
        'Ensure product quality and food safety standards across dairy and processing lines.',
        'Monitor production processes; verify HACCP CCPs; audit sanitary conditions; inspect raw ingredients.',
        'B.Sc. in Agriculture (Food Science) or Veterinary Medicine. Minimum 1 year experience in food manufacturing.',
        'full_time', 'junior', 1, 3, 'Cairo', 'Badr Industrial City', false, 'bachelor', 'active'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Food Safety Specialist (Nestle / FMCG)
    INSERT INTO public.jobs (
        id, company_id, title, description, responsibilities, qualifications, 
        employment_type, experience_level, min_experience_years, max_experience_years, 
        governorate, city, is_remote, min_education_level, status
    ) VALUES (
        v_job_fs, v_delta_id, 'Food Safety Specialist',
        'Implement and audit HACCP and ISO 22000 food safety management systems.',
        'Lead internal audits; maintain supplier approval programs; coordinate with National Food Safety Authority (NFSA).',
        'B.Sc. in Agriculture or Science (Biochemistry/Microbiology). 2-5 years in FMCG.',
        'full_time', 'mid_level', 2, 5, 'Giza', '6th of October City', false, 'bachelor', 'active'
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Agricultural Engineer (AgroMisr)
    INSERT INTO public.jobs (
        id, company_id, title, description, responsibilities, qualifications, 
        employment_type, experience_level, min_experience_years, max_experience_years, 
        governorate, city, is_remote, min_education_level, status
    ) VALUES (
        v_job_agri, v_agromisr_id, 'Agricultural Engineer',
        'Support agricultural export projects, irrigation scheduling, and field operations in olive and citrus orchards.',
        'Oversee drip irrigation; supervise pruning and harvesting teams; manage fertilizer injection recipes.',
        'B.Sc. in Agricultural Engineering or Crop Science. Fresh graduate or up to 2 years experience.',
        'full_time', 'fresh_grad', 0, 2, 'Fayoum', 'Tamiya', false, 'bachelor', 'active'
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Production Engineer (Delta Foods)
    INSERT INTO public.jobs (
        id, company_id, title, description, responsibilities, qualifications, 
        employment_type, experience_level, min_experience_years, max_experience_years, 
        governorate, city, is_remote, min_education_level, status
    ) VALUES (
        v_job_prod, v_delta_id, 'Production Engineer',
        'Improve production efficiency, minimize downtime, and oversee canning and packaging shifts.',
        'Manage line operators; track OEE and production KPI targets; enforce GMP protocols.',
        'B.Sc. in Food Engineering or Agricultural Sciences. 1-3 years experience.',
        'full_time', 'junior', 1, 3, 'Cairo', 'Obour City', false, 'bachelor', 'active'
    ) ON CONFLICT (id) DO NOTHING;

    -- Link Job Specializations & Skills
    IF v_spec_qc IS NOT NULL THEN
        INSERT INTO public.job_specializations (job_id, specialization_id) VALUES (v_job_qc, v_spec_qc) ON CONFLICT DO NOTHING;
    END IF;
    IF v_spec_fs IS NOT NULL THEN
        INSERT INTO public.job_specializations (job_id, specialization_id) VALUES (v_job_fs, v_spec_fs) ON CONFLICT DO NOTHING;
    END IF;
    IF v_skill_haccp IS NOT NULL THEN
        INSERT INTO public.job_skills (job_id, skill_id, is_required) VALUES (v_job_qc, v_skill_haccp, true) ON CONFLICT DO NOTHING;
        INSERT INTO public.job_skills (job_id, skill_id, is_required) VALUES (v_job_fs, v_skill_haccp, true) ON CONFLICT DO NOTHING;
    END IF;
    IF v_skill_iso IS NOT NULL THEN
        INSERT INTO public.job_skills (job_id, skill_id, is_required) VALUES (v_job_qc, v_skill_iso, true) ON CONFLICT DO NOTHING;
        INSERT INTO public.job_skills (job_id, skill_id, is_required) VALUES (v_job_fs, v_skill_iso, true) ON CONFLICT DO NOTHING;
    END IF;

END $$;
