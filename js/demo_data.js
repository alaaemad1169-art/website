// =============================================================================
// AgriCore DEMO DATA — بيانات تجريبية لأغراض اختبار الواجهة فقط
// =============================================================================
// ⚠️  DEMO MODE — هذه البيانات وهمية وتُستخدم فقط عند عدم وجود بيانات حقيقية من Supabase
// للإطلاق الحقيقي: احذف هذا الملف أو اضبط IS_DEMO_MODE = false
// =============================================================================

export const IS_DEMO_MODE = true;

export const DEMO_LABEL = "⚠️ بيانات تجريبية";

// --- Demo Candidates (4 مرشحين تجريبيين) ---
export const demoCandidates = [
  {
    id: "cand-demo-1",
    _is_demo: true,
    name: "م. أحمد محمد رمضان",
    title: "Quality Control Engineer",
    governorate: "Cairo",
    experience_years: 2.5,
    education_level: "bachelor",
    specializations: ["Quality Control", "Food Safety"],
    skills: ["HACCP", "ISO 22000", "GMP", "GLP", "Quality Control", "Microsoft Excel"],
    avatar: "https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=15573b&color=ffffff&size=80",
    status: "actively_looking"
  },
  {
    id: "cand-demo-2",
    _is_demo: true,
    name: "م. سارة خالد إبراهيم",
    title: "Modern Irrigation Engineer",
    governorate: "Fayoum",
    experience_years: 4,
    education_level: "bachelor",
    specializations: ["Modern Irrigation", "Crop Production"],
    skills: ["Drip Irrigation", "Soil Analysis", "GIS", "Farm Management", "Fertigation"],
    avatar: "https://ui-avatars.com/api/?name=Sara+Khaled&background=1a6b4a&color=ffffff&size=80",
    status: "employed_open"
  },
  {
    id: "cand-demo-3",
    _is_demo: true,
    name: "م. محمد طارق عبدالله",
    title: "Food Safety & HACCP Specialist",
    governorate: "Alexandria",
    experience_years: 6,
    education_level: "master",
    specializations: ["Food Safety", "Microbiology"],
    skills: ["HACCP", "ISO 22000", "BRCGS", "Microbiology", "GMP", "FSSC 22000"],
    avatar: "https://ui-avatars.com/api/?name=Mohamed+Tarek&background=0d5c3a&color=ffffff&size=80",
    status: "actively_looking"
  },
  {
    id: "cand-demo-4",
    _is_demo: true,
    name: "م. نور الهدى حسن",
    title: "Agronomist & Crop Production Specialist",
    governorate: "Beheira",
    experience_years: 3,
    education_level: "bachelor",
    specializations: ["Crop Production", "Horticulture"],
    skills: ["Plant Disease Diagnosis", "Pest Management", "Soil Analysis", "Greenhouse Management"],
    avatar: "https://ui-avatars.com/api/?name=Nour+Hassan&background=2d7a50&color=ffffff&size=80",
    status: "actively_looking"
  }
];

// --- Demo Companies (3 شركات تجريبية) ---
export const demoCompanies = [
  {
    id: "comp-demo-1",
    _is_demo: true,
    company_name: "Delta Foods for Food Industries",
    business_sector: "Food Processing & Dairy",
    governorate: "Cairo",
    logo_text: "DF",
    active_jobs: 2,
    verified: true
  },
  {
    id: "comp-demo-2",
    _is_demo: true,
    company_name: "Egyptian Agro Export Company",
    business_sector: "Agricultural Export",
    governorate: "Alexandria",
    logo_text: "EA",
    active_jobs: 1,
    verified: true
  },
  {
    id: "comp-demo-3",
    _is_demo: true,
    company_name: "Nile Valley Modern Farms",
    business_sector: "Farms & Production",
    governorate: "Fayoum",
    logo_text: "NV",
    active_jobs: 2,
    verified: true
  }
];

// --- Demo Jobs (5 وظائف تجريبية) ---
export const demoJobs = [
  {
    id: "job-demo-1",
    _is_demo: true,
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
    description: "Supervise quality control operations across production lines, conduct daily inspections, and ensure full HACCP and ISO 22000 compliance.",
    created_at: "2 days ago",
    applied: false
  },
  {
    id: "job-demo-2",
    _is_demo: true,
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
    description: "Design and manage modern drip and pivot irrigation systems across a desert reclamation project in Fayoum.",
    created_at: "1 week ago",
    applied: false
  },
  {
    id: "job-demo-3",
    _is_demo: true,
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
    description: "Lead food safety audits and GLOBALG.A.P. certification processes for fresh fruit and vegetable export operations.",
    created_at: "3 days ago",
    applied: false
  },
  {
    id: "job-demo-4",
    _is_demo: true,
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
    description: "Conduct microbiological testing of raw materials and finished products, maintaining accurate laboratory records per NFSA standards.",
    created_at: "5 days ago",
    applied: false
  },
  {
    id: "job-demo-5",
    _is_demo: true,
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
    description: "Manage daily field operations for a tomato and pepper production project under protected cultivation system.",
    created_at: "2 weeks ago",
    applied: false
  }
];

// --- Demo Academy Courses (4 كورسات تجريبية) ---
export const demoCourses = [
  {
    id: "course-demo-1",
    _is_demo: true,
    title: "HACCP Food Safety Mastery",
    category: "Food Safety",
    level: "Beginner",
    duration: "4 hours",
    instructor: "Dr. Adel Mansour (NFSA Consultant)",
    enrolled_count: 0,
    rating: 4.9
  },
  {
    id: "course-demo-2",
    _is_demo: true,
    title: "ISO 22000 Implementation in Food Facilities",
    category: "Quality",
    level: "Intermediate",
    duration: "6 hours",
    instructor: "Eng. Sherif El-Kholy (Lead Auditor)",
    enrolled_count: 0,
    rating: 4.8
  },
  {
    id: "course-demo-3",
    _is_demo: true,
    title: "Smart Agriculture & IoT Sensor Integration",
    category: "AgriTech",
    level: "Intermediate",
    duration: "8 hours",
    instructor: "Eng. Tarek Farid (Precision Ag Tech)",
    enrolled_count: 0,
    rating: 4.9
  },
  {
    id: "course-demo-4",
    _is_demo: true,
    title: "Agribusiness Management & Global Export",
    category: "Business",
    level: "Advanced",
    duration: "5 hours",
    instructor: "Dr. Hisham Zaki (Export Council)",
    enrolled_count: 0,
    rating: 4.7
  }
];

// --- Demo Testimonials (شهادات تجريبية) ---
export const demoTestimonials = [
  {
    id: "tst-demo-1",
    _is_demo: true,
    name: "م. أحمد رمضان",
    title: "Quality Control Engineer",
    company: "Delta Foods for Food Industries",
    quote: "ساعدتني المنصة في إيجاد فرصة عمل مناسبة لتخصصي في رقابة الجودة. العملية كانت سلسة وسريعة.",
    avatar: "AR"
  },
  {
    id: "tst-demo-2",
    _is_demo: true,
    name: "م. سارة محمود",
    title: "Irrigation Engineer",
    company: "Nile Valley Modern Farms",
    quote: "AgriCore أتاحت لي التواصل مع شركات متخصصة في مجال الري الحديث لم أكن لأصل إليها بطريقة أخرى.",
    avatar: "SM"
  },
  {
    id: "tst-demo-3",
    _is_demo: true,
    name: "م. عمر حسين",
    title: "Lab Analyst",
    company: "Egyptian Agro Export Company",
    quote: "كخريج جديد، ساعدني الملف الشخصي في عرض مهاراتي بشكل احترافي وتلقي عروض من شركات معروفة.",
    avatar: "OH"
  }
];
