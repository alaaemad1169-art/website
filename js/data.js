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

// Demo data for UI preview — replaced with live Supabase data on connect
export const candidatesData = [
  {
    id: "cand-1",
    name: "م. أحمد محمد رمضان",
    title: "Quality Control Engineer",
    governorate: "Cairo",
    experience_years: 2.5,
    education_level: "bachelor",
    specializations: ["Quality Control", "Food Safety"],
    skills: ["HACCP", "ISO 22000", "GMP", "GLP", "Quality Control", "Microsoft Excel"],
    match_score: 96,
    avatar: "https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=15573b&color=ffffff&size=80",
    status: "actively_looking"
  },
  {
    id: "cand-2",
    name: "م. سارة خالد إبراهيم",
    title: "Modern Irrigation Engineer",
    governorate: "Fayoum",
    experience_years: 4,
    education_level: "bachelor",
    specializations: ["Modern Irrigation", "Crop Production"],
    skills: ["Drip Irrigation", "Soil Analysis", "GIS", "Farm Management", "Fertigation"],
    match_score: 89,
    avatar: "https://ui-avatars.com/api/?name=Sara+Khaled&background=1a6b4a&color=ffffff&size=80",
    status: "employed_open"
  },
  {
    id: "cand-3",
    name: "م. محمد طارق عبدالله",
    title: "Food Safety & HACCP Specialist",
    governorate: "Alexandria",
    experience_years: 6,
    education_level: "master",
    specializations: ["Food Safety", "Microbiology"],
    skills: ["HACCP", "ISO 22000", "BRCGS", "Microbiology", "GMP", "FSSC 22000"],
    match_score: 93,
    avatar: "https://ui-avatars.com/api/?name=Mohamed+Tarek&background=0d5c3a&color=ffffff&size=80",
    status: "actively_looking"
  },
  {
    id: "cand-4",
    name: "م. نور الهدى حسن",
    title: "Agronomist & Crop Production Specialist",
    governorate: "Beheira",
    experience_years: 3,
    education_level: "bachelor",
    specializations: ["Crop Production", "Horticulture"],
    skills: ["Plant Disease Diagnosis", "Pest Management", "Soil Analysis", "Greenhouse Management"],
    match_score: 82,
    avatar: "https://ui-avatars.com/api/?name=Nour+Hassan&background=2d7a50&color=ffffff&size=80",
    status: "actively_looking"
  }
];

export const companiesData = [
  {
    id: "comp-1",
    company_name: "Delta Foods for Food Industries",
    business_sector: "Food Processing & Dairy",
    governorate: "Cairo",
    logo_text: "DF",
    active_jobs: 12,
    verified: true
  },
  {
    id: "comp-2",
    company_name: "Egyptian Agro Export Company",
    business_sector: "Agricultural Export",
    governorate: "Alexandria",
    logo_text: "EA",
    active_jobs: 7,
    verified: true
  },
  {
    id: "comp-3",
    company_name: "Nile Valley Modern Farms",
    business_sector: "Farms & Production",
    governorate: "Fayoum",
    logo_text: "NV",
    active_jobs: 5,
    verified: true
  }
];

export const jobsData = [
  {
    id: "job-demo-1",
    title: "Quality Control Engineer",
    company: "Delta Foods for Food Industries",
    logo_text: "DF",
    sector: "Food Industry",
    location: "Cairo",
    city: "Industrial Zone",
    type: "Full Time",
    experience: "1-3 Years",
    min_exp: 1,
    max_exp: 3,
    min_edu: "bachelor",
    specializations: ["Quality Control", "Food Safety"],
    skills: ["HACCP", "ISO 22000", "GMP", "Quality Control"],
    match_score: 96,
    description: "Supervise quality control operations across production lines, conduct daily inspections, and ensure full HACCP and ISO 22000 compliance.",
    created_at: "2 days ago",
    applied: false
  },
  {
    id: "job-demo-2",
    title: "Modern Irrigation Systems Engineer",
    company: "Nile Valley Modern Farms",
    logo_text: "NV",
    sector: "Farms & Production",
    location: "Fayoum",
    city: "Fayoum Agricultural Zone",
    type: "Full Time",
    experience: "2-5 Years",
    min_exp: 2,
    max_exp: 5,
    min_edu: "bachelor",
    specializations: ["Modern Irrigation", "Crop Production"],
    skills: ["Drip Irrigation", "Fertigation", "Soil Analysis", "GIS"],
    match_score: 88,
    description: "Design and manage modern drip and pivot irrigation systems across 500+ feddan desert reclamation project in Fayoum.",
    created_at: "1 week ago",
    applied: false
  },
  {
    id: "job-demo-3",
    title: "Food Safety & HACCP Auditor",
    company: "Egyptian Agro Export Company",
    logo_text: "EA",
    sector: "Agricultural Export",
    location: "Alexandria",
    city: "Borg El Arab",
    type: "Full Time",
    experience: "3-7 Years",
    min_exp: 3,
    max_exp: 7,
    min_edu: "bachelor",
    specializations: ["Food Safety", "Agricultural Export"],
    skills: ["HACCP", "GLOBALG.A.P.", "Cold Chain Logistics", "ISO 22000", "BRCGS"],
    match_score: 91,
    description: "Lead food safety audits and GLOBALG.A.P. certification processes for fresh fruit and vegetable export operations.",
    created_at: "3 days ago",
    applied: false
  },
  {
    id: "job-demo-4",
    title: "Agricultural Lab Analyst (Microbiology)",
    company: "Delta Foods for Food Industries",
    logo_text: "DF",
    sector: "Food Industry",
    location: "Cairo",
    city: "Heliopolis",
    type: "Full Time",
    experience: "1-4 Years",
    min_exp: 1,
    max_exp: 4,
    min_edu: "bachelor",
    specializations: ["Microbiology", "Food Safety"],
    skills: ["GLP", "Microbiology", "GMP", "Lab Analysis", "Food Safety"],
    match_score: 84,
    description: "Conduct microbiological testing of raw materials and finished products, maintaining accurate laboratory records per NFSA standards.",
    created_at: "5 days ago",
    applied: false
  },
  {
    id: "job-demo-5",
    title: "Crop Production Supervisor",
    company: "Nile Valley Modern Farms",
    logo_text: "NV",
    sector: "Farms & Production",
    location: "Beheira",
    city: "Nubaria Zone",
    type: "Full Time",
    experience: "2-6 Years",
    min_exp: 2,
    max_exp: 6,
    min_edu: "bachelor",
    specializations: ["Crop Production", "Farm Management"],
    skills: ["Plant Disease Diagnosis", "Pest Management", "Farm Management", "Crop Production"],
    match_score: 79,
    description: "Manage daily field operations for 1,200 feddan tomato and pepper production under protected cultivation system.",
    created_at: "2 weeks ago",
    applied: false
  }
];

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
