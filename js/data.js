// =============================================================================
// AgriCore Reference Taxonomies (Real Egyptian & Regional Industry Standards)
// =============================================================================

export const specializationsData = [
  { id: "sp-1", name_en: "Quality Control", name_ar: "مراقبة الجودة", category: "علوم جودة الغذاء" },
  { id: "sp-2", name_en: "Food Safety", name_ar: "سلامة الغذاء", category: "علوم جودة الغذاء" },
  { id: "sp-3", name_en: "Crop Production", name_ar: "إنتاج المحاصيل", category: "علوم النبات" },
  { id: "sp-4", name_en: "Horticulture", name_ar: "البساتين", category: "علوم النبات" },
  { id: "sp-5", name_en: "Modern Irrigation", name_ar: "نظم الري الحديث", category: "التربة والمياه" },
  { id: "sp-6", name_en: "Greenhouse Production", name_ar: "الزراعة المحمية (الصوب)", category: "التكنولوجيا الزراعية" },
  { id: "sp-7", name_en: "Precision Agriculture", name_ar: "الزراعة الدقيقة", category: "التكنولوجيا الزراعية" },
  { id: "sp-8", name_en: "Poultry Production", name_ar: "الإنتاج الداجني", category: "الإنتاج الحيواني والداجني" },
  { id: "sp-9", name_en: "Animal Nutrition", name_ar: "تغذية الحيوان", category: "الإنتاج الحيواني والداجني" },
  { id: "sp-10", name_en: "Farm Management", name_ar: "إدارة المزارع", category: "الأعمال الزراعية" },
  { id: "sp-11", name_en: "Agricultural Export", name_ar: "التصدير الزراعي", category: "الأعمال الزراعية" },
  { id: "sp-12", name_en: "Microbiology", name_ar: "الميكروبيولوجي", category: "المعامل والتحاليل" }
];

export const skillsData = [
  "مراقبة الجودة", "HACCP", "ISO 22000", "GMP", "GLP", "سلامة الغذاء",
  "إدارة المزارع", "نظم الري", "تحليل التربة", "تحليل المياه",
  "تشخيص أمراض النبات", "مكافحة الآفات", "التخزين المبرد", "التعبئة والتغليف",
  "إدارة سلاسل الإمداد", "Microsoft Excel", "تحليل البيانات", "اللغة الإنجليزية"
];

// Demo data for UI preview — replaced with live Supabase data on connect
export const candidatesData = [
  {
    id: "cand-1",
    name: "م. أحمد محمد رمضان",
    title: "مهندس مراقبة الجودة",
    governorate: "القاهرة (Cairo)",
    experience_years: 2.5,
    education_level: "bachelor",
    specializations: ["Quality Control", "Food Safety"],
    skills: ["HACCP", "ISO 22000", "GMP", "GLP", "مراقبة الجودة", "Microsoft Excel"],
    match_score: 96,
    avatar: "https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=15573b&color=ffffff&size=80",
    status: "actively_looking"
  },
  {
    id: "cand-2",
    name: "م. سارة خالد إبراهيم",
    title: "مهندس ري حديث",
    governorate: "الفيوم (Fayoum)",
    experience_years: 4,
    education_level: "bachelor",
    specializations: ["Modern Irrigation", "Crop Production"],
    skills: ["الري بالتنقيط", "تحليل التربة", "GIS", "إدارة المزارع", "التسميد مع الري"],
    match_score: 89,
    avatar: "https://ui-avatars.com/api/?name=Sara+Khaled&background=1a6b4a&color=ffffff&size=80",
    status: "employed_open"
  },
  {
    id: "cand-3",
    name: "م. محمد طارق عبدالله",
    title: "أخصائي سلامة الغذاء وهاسب",
    governorate: "الإسكندرية (Alexandria)",
    experience_years: 6,
    education_level: "master",
    specializations: ["Food Safety", "Microbiology"],
    skills: ["HACCP", "ISO 22000", "BRCGS", "الميكروبيولوجي", "GMP", "FSSC 22000"],
    match_score: 93,
    avatar: "https://ui-avatars.com/api/?name=Mohamed+Tarek&background=0d5c3a&color=ffffff&size=80",
    status: "actively_looking"
  },
  {
    id: "cand-4",
    name: "م. نور الهدى حسن",
    title: "أخصائي إنتاج نباتي ومحاصيل",
    governorate: "البحيرة (Beheira)",
    experience_years: 3,
    education_level: "bachelor",
    specializations: ["Crop Production", "Horticulture"],
    skills: ["تشخيص أمراض النبات", "مكافحة الآفات", "تحليل التربة", "إدارة الصوب الزراعية"],
    match_score: 82,
    avatar: "https://ui-avatars.com/api/?name=Nour+Hassan&background=2d7a50&color=ffffff&size=80",
    status: "actively_looking"
  }
];

export const companiesData = [
  {
    id: "comp-1",
    company_name: "شركة دلتا للصناعات الغذائية (Delta Foods)",
    business_sector: "التصنيع الغذائي والألبان",
    governorate: "القاهرة (Cairo)",
    logo_text: "DF",
    active_jobs: 12,
    verified: true
  },
  {
    id: "comp-2",
    company_name: "الشركة المصرية للتصدير الزراعي (Egyptian Agro Export)",
    business_sector: "التصدير الزراعي",
    governorate: "الإسكندرية (Alexandria)",
    logo_text: "EA",
    active_jobs: 7,
    verified: true
  },
  {
    id: "comp-3",
    company_name: "مزارع النيل الحديثة (Nile Valley Modern Farms)",
    business_sector: "المزارع والإنتاج",
    governorate: "الفيوم (Fayoum)",
    logo_text: "NV",
    active_jobs: 5,
    verified: true
  }
];

export const jobsData = [
  {
    id: "job-demo-1",
    title: "مهندس مراقبة الجودة (Quality Control)",
    company: "شركة دلتا للصناعات الغذائية (Delta Foods)",
    logo_text: "DF",
    sector: "التصنيع الغذائي",
    location: "القاهرة (Cairo)",
    city: "المنطقة الصناعية",
    type: "دوام كامل (Full Time)",
    experience: "1-3 سنوات",
    min_exp: 1,
    max_exp: 3,
    min_edu: "bachelor",
    specializations: ["Quality Control", "Food Safety"],
    skills: ["HACCP", "ISO 22000", "GMP", "مراقبة الجودة"],
    match_score: 96,
    description: "الإشراف على عمليات مراقبة الجودة عبر خطوط الإنتاج، وإجراء الفحوصات اليومية، وضمان الامتثال الكامل لنظام HACCP و ISO 22000.",
    created_at: "منذ يومين",
    applied: false
  },
  {
    id: "job-demo-2",
    title: "مهندس نظم الري الحديث (Modern Irrigation)",
    company: "مزارع النيل الحديثة (Nile Valley Modern Farms)",
    logo_text: "NV",
    sector: "المزارع والإنتاج",
    location: "الفيوم (Fayoum)",
    city: "المنطقة الزراعية بالفيوم",
    type: "دوام كامل (Full Time)",
    experience: "2-5 سنوات",
    min_exp: 2,
    max_exp: 5,
    min_edu: "bachelor",
    specializations: ["Modern Irrigation", "Crop Production"],
    skills: ["الري بالتنقيط", "التسميد مع الري", "تحليل التربة", "GIS"],
    match_score: 88,
    description: "تصميم وإدارة نظم الري الحديث (تنقيط ومحوري) في مشروع استصلاح صحراوي مساحته 500+ فدان في الفيوم.",
    created_at: "منذ أسبوع",
    applied: false
  },
  {
    id: "job-demo-3",
    title: "مراجع سلامة الغذاء وهاسب (HACCP Auditor)",
    company: "الشركة المصرية للتصدير الزراعي (Egyptian Agro Export)",
    logo_text: "EA",
    sector: "التصدير الزراعي",
    location: "الإسكندرية (Alexandria)",
    city: "برج العرب",
    type: "دوام كامل (Full Time)",
    experience: "3-7 سنوات",
    min_exp: 3,
    max_exp: 7,
    min_edu: "bachelor",
    specializations: ["Food Safety", "Agricultural Export"],
    skills: ["HACCP", "GLOBALG.A.P.", "Cold Chain Logistics", "ISO 22000", "BRCGS"],
    match_score: 91,
    description: "قيادة مراجعات سلامة الغذاء وعمليات شهادة GLOBALG.A.P. لعمليات تصدير الخضروات والفواكه الطازجة.",
    created_at: "منذ 3 أيام",
    applied: false
  },
  {
    id: "job-demo-4",
    title: "محلل معمل زراعي (ميكروبيولوجي)",
    company: "شركة دلتا للصناعات الغذائية (Delta Foods)",
    logo_text: "DF",
    sector: "التصنيع الغذائي",
    location: "القاهرة (Cairo)",
    city: "مصر الجديدة",
    type: "دوام كامل (Full Time)",
    experience: "1-4 سنوات",
    min_exp: 1,
    max_exp: 4,
    min_edu: "bachelor",
    specializations: ["Microbiology", "Food Safety"],
    skills: ["GLP", "الميكروبيولوجي", "GMP", "تحاليل معملية", "سلامة الغذاء"],
    match_score: 84,
    description: "إجراء الاختبارات الميكروبيولوجية للمواد الخام والمنتجات النهائية، والاحتفاظ بسجلات دقيقة للمعمل وفقاً لمعايير هيئة سلامة الغذاء (NFSA).",
    created_at: "منذ 5 أيام",
    applied: false
  },
  {
    id: "job-demo-5",
    title: "مشرف إنتاج محاصيل (Crop Production Supervisor)",
    company: "مزارع النيل الحديثة (Nile Valley Modern Farms)",
    logo_text: "NV",
    sector: "المزارع والإنتاج",
    location: "البحيرة (Beheira)",
    city: "منطقة النوبارية",
    type: "دوام كامل (Full Time)",
    experience: "2-6 سنوات",
    min_exp: 2,
    max_exp: 6,
    min_edu: "bachelor",
    specializations: ["Crop Production", "Farm Management"],
    skills: ["تشخيص أمراض النبات", "مكافحة الآفات", "إدارة المزارع", "الإنتاج النباتي"],
    match_score: 79,
    description: "إدارة العمليات الميدانية اليومية لإنتاج الطماطم والفلفل على مساحة 1200 فدان بنظام الزراعة المحمية.",
    created_at: "منذ أسبوعين",
    applied: false
  }
];

export const academyCoursesData = [
  {
    id: "course-1",
    title: "إتقان سلامة الغذاء والهاسب (HACCP Mastery)",
    category: "سلامة الغذاء",
    level: "مبتدئ",
    duration: "4 ساعات",
    instructor: "د. عادل منصور (استشاري سلامة الغذاء)",
    students: "1,420 طالب",
    rating: 4.9
  },
  {
    id: "course-2",
    title: "تطبيق ISO 22000 في المنشآت الغذائية",
    category: "الجودة",
    level: "متوسط",
    duration: "6 ساعات",
    instructor: "م. شريف الخولي (كبير مراجعين)",
    students: "980 طالب",
    rating: 4.8
  },
  {
    id: "course-3",
    title: "الزراعة الذكية ودمج مستشعرات إنترنت الأشياء (IoT)",
    category: "التكنولوجيا الزراعية",
    level: "متوسط",
    duration: "8 ساعات",
    instructor: "م. طارق فريد (خبير الزراعة الدقيقة)",
    students: "650 طالب",
    rating: 4.9
  },
  {
    id: "course-4",
    title: "إدارة الأعمال الزراعية والتصدير العالمي",
    category: "إدارة الأعمال",
    level: "متقدم",
    duration: "5 ساعات",
    instructor: "د. هشام زكي (المجلس التصديري)",
    students: "1,120 طالب",
    rating: 4.7
  }
];
