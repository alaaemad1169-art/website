// =============================================================================
// AgriCore Reference Taxonomies (Real Egyptian & Regional Industry Standards)
// =============================================================================

export const specializationsData = [
  { id: "sp-1", name_en: "Quality Control", name_ar: "مراقبة الجودة (QC)", category: "Food Science & Quality" },
  { id: "sp-2", name_en: "Food Safety", name_ar: "سلامة الغذاء", category: "Food Science & Quality" },
  { id: "sp-3", name_en: "Crop Production", name_ar: "إنتاج المحاصيل", category: "Plant Science" },
  { id: "sp-4", name_en: "Horticulture", name_ar: "البساتين والفاكهة", category: "Plant Science" },
  { id: "sp-5", name_en: "Modern Irrigation", name_ar: "نظم الري الحديث", category: "Soil & Water" },
  { id: "sp-6", name_en: "Greenhouse Production", name_ar: "الزراعة المحمية والصوب", category: "AgriTech" },
  { id: "sp-7", name_en: "Precision Agriculture", name_ar: "الزراعة الدقيقة", category: "AgriTech" },
  { id: "sp-8", name_en: "Poultry Production", name_ar: "إنتاج الدواجن", category: "Animal & Poultry" },
  { id: "sp-9", name_en: "Animal Nutrition", name_ar: "تغذية الحيوان", category: "Animal & Poultry" },
  { id: "sp-10", name_en: "Farm Management", name_ar: "إدارة المزارع", category: "Agribusiness" },
  { id: "sp-11", name_en: "Agricultural Export", name_ar: "التصدير الزراعي", category: "Agribusiness" },
  { id: "sp-12", name_en: "Microbiology", name_ar: "الميكروبيولوجي المعملي", category: "Lab & Diagnostics" }
];

export const skillsData = [
  "Quality Control", "HACCP", "ISO 22000", "GMP", "GLP", "Food Safety",
  "Farm Management", "Irrigation Systems", "Soil Analysis", "Water Analysis",
  "Plant Disease Diagnosis", "Pest Control", "Cold Storage", "Packaging",
  "Supply Chain Management", "Microsoft Excel", "Data Analysis", "English"
];

// Production lists - Populated exclusively from live Supabase database
export const candidatesData = [];
export const companiesData = [];
export const jobsData = [];

export const academyCoursesData = [
  {
    id: "course-1",
    title: "HACCP Food Safety Mastery",
    category: "Food Safety",
    level: "Beginner",
    duration: "4 hours",
    instructor: "Dr. Adel Mansour (NFSA Consultant)",
    students: "1,420 enrolled",
    rating: 4.9
  },
  {
    id: "course-2",
    title: "ISO 22000 Implementation in Food Facilities",
    category: "Quality",
    level: "Intermediate",
    duration: "6 hours",
    instructor: "Eng. Sherif El-Kholy (Lead Auditor)",
    students: "980 enrolled",
    rating: 4.8
  },
  {
    id: "course-3",
    title: "Smart Agriculture & IoT Sensor Integration",
    category: "AgriTech",
    level: "Intermediate",
    duration: "8 hours",
    instructor: "Eng. Tarek Farid (Precision Ag Tech)",
    students: "650 enrolled",
    rating: 4.9
  },
  {
    id: "course-4",
    title: "Agribusiness Management & Global Export",
    category: "Business",
    level: "Advanced",
    duration: "5 hours",
    instructor: "Dr. Hisham Zaki (Export Council)",
    students: "1,120 enrolled",
    rating: 4.7
  }
];
