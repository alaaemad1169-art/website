// =============================================================================
// AgriCore Agricultural Professional Progressive Onboarding Flow
// 8 Progressive Steps + 85% Completion Screen + Match Engine Data Binding
// =============================================================================

import { specializationsData, skillsData } from './data.js';

export class ProfessionalOnboardingManager {
  constructor(appInstance) {
    this.app = appInstance;
    this.currentStep = 1;
    this.totalSteps = 8;
    this.isCompleted = false;

    // Standard Egyptian & Arab Agricultural Reference Data for Progressive Dropdowns
    this.taxonomy = {
      universities: [
        "Cairo University (Faculty of Agriculture)",
        "Ain Shams University (Faculty of Agriculture)",
        "Alexandria University (Faculty of Agriculture)",
        "Mansoura University (Faculty of Agriculture)",
        "Zagazig University (Faculty of Agriculture)",
        "Assiut University (Faculty of Agriculture)",
        "Fayoum University (Faculty of Agriculture)",
        "Benha University - Moshtohor",
        "Kafr El Sheikh University",
        "Menoufia University",
        "Suez Canal University",
        "Minya University",
        "South Valley University",
        "Al-Azhar University",
        "King Saud University (Saudi Arabia)",
        "Jordan University of Science & Technology",
        "Other Accredited University"
      ],
      degrees: [
        { id: "bachelor", title: "B.Sc. in Agricultural Sciences (بكالوريوس علوم زراعية)" },
        { id: "bachelor_eng", title: "B.Sc. in Agricultural Engineering (بكالوريوس هندسة زراعية)" },
        { id: "bachelor_vet", title: "B.Sc. in Veterinary Medicine (بكالوريوس طب بيطري)" },
        { id: "bachelor_sci", title: "B.Sc. in Science / Biotechnology (بكالوريوس علوم / كيمياء / بيوتكنولوجي)" },
        { id: "master", title: "Master of Science - M.Sc. (ماجستير)" },
        { id: "phd", title: "Ph.D. / Doctorate (دكتوراه)" },
        { id: "diploma", title: "Postgraduate Diploma / Technical Diploma (دبلوم)" }
      ],
      experienceTiers: [
        { value: 0, label: "Fresh Graduate (0 - 1 years) • حديث تخرج", years: 0.5 },
        { value: 1, label: "Junior Specialist (1 - 3 years) • مبتدئ", years: 2.0 },
        { value: 3, label: "Mid-Level Professional (3 - 6 years) • متوسط الخبرة", years: 4.5 },
        { value: 6, label: "Senior Specialist / Lead (6 - 10 years) • خبير", years: 7.5 },
        { value: 10, label: "Consultant / Technical Director (10+ years) • استشاري", years: 12.0 }
      ],
      employmentStatuses: [
        "Actively Looking & Available Immediately (مستعد للعمل فوراً)",
        "Employed & Open to Opportunities (على رأس عمل ومنفتح للفرص)",
        "Employed & Not Looking (على رأس عمل وغير مهتم حالياً)",
        "Freelance Consultant / Part-Time (استشاري حر / دوام جزئي)",
        "Recent Graduate Seeking Training/Internship (خريج يبحث عن تدريب)"
      ],
      popularTitles: [
        "Quality Control Engineer",
        "Food Safety & HACCP Specialist",
        "Modern Irrigation Engineer",
        "Agronomist / Farm Engineer",
        "Crop Production Supervisor",
        "Greenhouse Specialist",
        "Agricultural Lab Analyst",
        "Poultry Production Engineer",
        "Agricultural Export Specialist",
        "Technical Sales Agronomist"
      ],
      suggestedSkills: [
        "Quality Control", "HACCP", "ISO 22000", "GMP", "GLP", "Food Safety",
        "Modern Irrigation Systems", "Drip Irrigation", "Pivot Systems",
        "Soil & Water Analysis", "Fertigation & Plant Nutrition", "Crop Production",
        "Plant Disease Diagnosis", "Integrated Pest Management (IPM)",
        "Greenhouse Management", "Hydroponics", "Agricultural Export Standards",
        "GLOBALG.A.P.", "Cold Chain Logistics", "Farm Management",
        "Microsoft Excel", "Data Analysis", "English (Technical)"
      ],
      targetJobRoles: [
        "Quality Control Engineer",
        "Food Safety Specialist / Auditor",
        "Modern Irrigation Engineer",
        "Agronomist / Farm Manager",
        "Crop Production Specialist",
        "Lab / Microbiological Analyst",
        "Technical Sales Representative",
        "Post-Harvest & Export Specialist"
      ],
      targetSectors: [
        "Food Processing & Dairy Industry",
        "Commercial Farms & Desert Reclamation",
        "Fresh Fruit & Vegetable Export",
        "Modern Irrigation & AgriTech",
        "Poultry & Animal Feed Production",
        "Laboratories, NFSA & Quality Auditing",
        "Agrochemicals & Fertilizers"
      ],
      targetLocations: [
        "Cairo & Giza",
        "Sadat City (Monufia)",
        "6th of October Industrial Zone",
        "Alexandria & Borg El Arab",
        "Beheira / Nubaria Agricultural Zone",
        "Ismailia & Suez Canal Region",
        "Sharqia & 10th of Ramadan",
        "Fayoum & Upper Egypt",
        "Remote / Hybrid Consulting"
      ],
      employmentTypes: [
        "Full-Time (دوام كامل)",
        "Contract / Seasonal Project (عقد سنوي / موسمي)",
        "Part-Time (دوام جزئي)",
        "Consulting / Technical Advisor (استشارات فنية)",
        "Internship / Graduate Trainee (تدريب خريجين)"
      ],
      commonCertifications: [
        "HACCP Level 3 / Principles & Implementation",
        "ISO 22000:2018 Food Safety Management System",
        "GLOBALG.A.P. Integrated Farm Assurance (IFA)",
        "BRCGS Global Standard for Food Safety",
        "FSSC 22000 Implementation",
        "Six Sigma Green Belt in Food Manufacturing",
        "Certified Crop Advisor / Agronomist",
        "OSHA 30-Hour General Industry"
      ]
    };

    // Load initial state from local draft or defaults
    this.formData = this.loadDraft() || this.getDefaultData();
  }

  getDefaultData() {
    return {
      // Step 1: Account
      account: {
        fullName: "",
        email: "",
        phone: "",
        password: ""
      },
      // Step 2: Professional Identity
      identity: {
        professionalTitle: "Quality Control Engineer",
        mainSpecialization: "Quality Control",
        yearsOfExperience: 1,
        experienceTierLabel: "Junior Specialist (1 - 3 years) • مبتدئ",
        currentStatus: "Actively Looking & Available Immediately (مستعد للعمل فوراً)"
      },
      // Step 3: Education
      education: {
        degree: "B.Sc. in Agricultural Sciences (بكالوريوس علوم زراعية)",
        university: "Cairo University (Faculty of Agriculture)",
        facultyDepartment: "Food Science & Technology (علوم وتكنولوجيا الأغذية)",
        graduationYear: 2023
      },
      // Step 4: Skills (Multi-select)
      skills: [
        "Quality Control",
        "Food Safety",
        "HACCP",
        "ISO 22000",
        "GMP",
        "Microsoft Excel"
      ],
      // Step 5: Experience
      experiences: [
        {
          company: "Cairo 3A for Food Industries",
          title: "Quality Control Engineer",
          startDate: "2023-08",
          endDate: "",
          isCurrent: true,
          responsibilities: "Supervising receiving inspections, monitoring HACCP critical control points, and ensuring NFSA food safety compliance."
        }
      ],
      // Step 6: Certifications
      certifications: [
        {
          name: "HACCP Level 3 / Principles & Implementation",
          organization: "AgriCore Academy / NFSA Standards",
          year: 2023
        }
      ],
      // Step 7: Career Preferences
      preferences: {
        preferredRoles: ["Quality Control Engineer", "Food Safety Specialist / Auditor"],
        preferredSectors: ["Food Processing & Dairy Industry", "Fresh Fruit & Vegetable Export"],
        preferredLocations: ["Cairo & Giza", "Sadat City (Monufia)", "6th of October Industrial Zone"],
        employmentType: "Full-Time (دوام كامل)"
      },
      // Step 8: CV
      cv: {
        fileName: null,
        fileSize: null,
        uploadedAt: null,
        verified: false
      },
      profileCompletion: 85
    };
  }

  saveDraft() {
    try {
      localStorage.setItem('agricore_professional_onboarding_draft', JSON.stringify({
        step: this.currentStep,
        data: this.formData,
        isCompleted: this.isCompleted
      }));
    } catch (e) {
      console.warn('Could not save onboarding draft to localStorage', e);
    }
  }

  loadDraft() {
    try {
      const saved = localStorage.getItem('agricore_professional_onboarding_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('Could not load onboarding draft', e);
    }
    return null;
  }

  // Render the progressive onboarding view container
  renderOnboardingView() {
    const step = this.currentStep;
    const progressPct = this.isCompleted ? 85 : Math.round((step / this.totalSteps) * 85);

    return `
      <div class="onboarding-wrapper">
        <div class="onboarding-container">
          
          <!-- Stepper Brand Header -->
          <div class="onboarding-header">
            <div class="onboarding-brand-pill">
              <span>🌾</span>
              <span>AgriCore Agricultural Career Network</span>
            </div>
            <h1>Agricultural Professional Onboarding</h1>
            <p>Build your verified career profile and connect with regional agribusiness job matching</p>
          </div>

          <!-- Progress Stepper Card -->
          ${!this.isCompleted ? `
            <div class="onboarding-progress-card">
              <div class="onboarding-progress-top">
                <div class="onboarding-step-label">
                  <span class="step-num-badge">Step ${step} of ${this.totalSteps}</span>
                  <strong>${this.getStepTitle(step)}</strong>
                </div>
                <div class="onboarding-completion-badge">
                  Profile Completion: <strong>${progressPct}%</strong>
                </div>
              </div>
              <div class="onboarding-progress-track">
                <div class="onboarding-progress-fill" style="width: ${progressPct}%;"></div>
              </div>

              <!-- Clickable Step Breadcrumbs -->
              <div class="onboarding-steps-track">
                ${Array.from({ length: this.totalSteps }).map((_, i) => {
                  const stepNum = i + 1;
                  const isCompleted = stepNum < step;
                  const isActive = stepNum === step;
                  return `
                    <button class="step-indicator-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                            onclick="window.agriOnboarding.jumpToStep(${stepNum})"
                            title="Go to ${this.getStepTitle(stepNum)}">
                      <span class="step-number-circle">${isCompleted ? '✓' : stepNum}</span>
                      <span>${this.getStepShortLabel(stepNum)}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Form Card -->
          <div class="onboarding-form-card" id="onboardingStepContainer">
            ${this.isCompleted ? this.renderCompletionScreen() : this.renderStepContent(step)}
          </div>

        </div>
      </div>
    `;
  }

  getStepTitle(step) {
    switch (step) {
      case 1: return "Account Creation (حساب المنصة)";
      case 2: return "Professional Identity (الهوية المهنية والتخصص)";
      case 3: return "Education & Qualifications (المؤهل الدراسي)";
      case 4: return "Key Technical Skills (المهارات المهنية)";
      case 5: return "Work Experience (الخبرات السابقة)";
      case 6: return "Professional Certifications (الشهادات والاعتمادات)";
      case 7: return "Career Preferences (تفضيلات العمل والمطابقة)";
      case 8: return "Curriculum Vitae (السيرة الذاتية CV)";
      default: return "";
    }
  }

  getStepShortLabel(step) {
    switch (step) {
      case 1: return "Account";
      case 2: return "Identity";
      case 3: return "Education";
      case 4: return "Skills";
      case 5: return "Experience";
      case 6: return "Certifications";
      case 7: return "Preferences";
      case 8: return "CV";
      default: return "";
    }
  }

  renderStepContent(step) {
    switch (step) {
      case 1: return this.renderStep1Account();
      case 2: return this.renderStep2Identity();
      case 3: return this.renderStep3Education();
      case 4: return this.renderStep4Skills();
      case 5: return this.renderStep5Experience();
      case 6: return this.renderStep6Certifications();
      case 7: return this.renderStep7Preferences();
      case 8: return this.renderStep8CV();
      default: return this.renderStep1Account();
    }
  }

  // ---------------------------------------------------------------------------
  // Step 1: Account Creation
  // ---------------------------------------------------------------------------
  renderStep1Account() {
    const acc = this.formData.account;
    const currentUser = this.app?.currentUser;
    if (currentUser && !acc.fullName) {
      acc.fullName = currentUser.name || "";
      acc.email = currentUser.email || "";
    }

    return `
      <div class="step-content-header">
        <h2>👤 Step 1 — Account Creation</h2>
        <p>Create your personal AgriCore credentials. If you already have an account, enter your details to sync your profile.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep1Submit();">
        <div class="onboarding-group">
          <label class="onboarding-label" for="onbFullName">
            Full Name (الاسم بالكامل) <span class="required-star">*</span>
          </label>
          <input type="text" id="onbFullName" class="onboarding-input" required
                 placeholder="e.g. Eng. Ahmed Mohamed (م. أحمد محمد)" 
                 value="${this.escapeHtml(acc.fullName)}">
          <span class="onboarding-hint">Your legal name as it should appear on your agricultural profile and job applications.</span>
        </div>

        <div class="onboarding-grid-2">
          <div class="onboarding-group">
            <label class="onboarding-label" for="onbEmail">
              Email Address (البريد الإلكتروني) <span class="required-star">*</span>
            </label>
            <input type="email" id="onbEmail" class="onboarding-input" required
                   placeholder="ahmed.agri@gmail.com" 
                   value="${this.escapeHtml(acc.email)}">
          </div>
          <div class="onboarding-group">
            <label class="onboarding-label" for="onbPhone">
              Phone / WhatsApp (الهاتف / واتساب) <span class="required-star">*</span>
            </label>
            <input type="tel" id="onbPhone" class="onboarding-input" required
                   placeholder="+20 101 234 5678" 
                   value="${this.escapeHtml(acc.phone)}">
          </div>
        </div>

        <div class="onboarding-group">
          <label class="onboarding-label" for="onbPassword">
            Password (كلمة المرور) <span class="required-star">*</span>
          </label>
          <input type="password" id="onbPassword" class="onboarding-input" required minlength="6"
                 placeholder="••••••••" 
                 value="${this.escapeHtml(acc.password)}">
          <span class="onboarding-hint">At least 6 characters. Used to log in and manage your applications.</span>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-ghost btn-sm" onclick="window.agriApp.navigateTo('landing')">Cancel</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">
              Save & Continue &rarr;
            </button>
          </div>
        </div>
      </form>
    `;
  }

  handleStep1Submit() {
    const fullName = document.getElementById('onbFullName')?.value?.trim();
    const email = document.getElementById('onbEmail')?.value?.trim();
    const phone = document.getElementById('onbPhone')?.value?.trim();
    const password = document.getElementById('onbPassword')?.value;

    if (!fullName || !email || !phone || !password) {
      alert('Please fill all required account fields (Full Name, Email, Phone, and Password).');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    this.formData.account = { fullName, email, phone, password };
    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 2: Professional Identity
  // ---------------------------------------------------------------------------
  renderStep2Identity() {
    const ident = this.formData.identity;

    return `
      <div class="step-content-header">
        <h2>🌱 Step 2 — Professional Identity</h2>
        <p>Define your primary agricultural domain, title, and current career status so employers find your profile.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep2Submit();">
        <!-- Professional Title -->
        <div class="onboarding-group">
          <label class="onboarding-label" for="onbTitle">
            Professional Title (المسمى المهني) <span class="required-star">*</span>
          </label>
          <input type="text" id="onbTitle" class="onboarding-input" required
                 placeholder="e.g. Quality Control Engineer or Irrigation Specialist" 
                 value="${this.escapeHtml(ident.professionalTitle)}">
          
          <!-- Quick Suggestion Chips -->
          <div class="chip-group" style="margin-top:8px;">
            ${this.taxonomy.popularTitles.map(t => `
              <span class="selection-chip ${ident.professionalTitle === t ? 'selected' : ''}"
                    onclick="window.agriOnboarding.selectQuickTitle('${t}')">
                ${t}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Main Specialization -->
        <div class="onboarding-group">
          <label class="onboarding-label" for="onbSpecialization">
            Main Specialization (التخصص الرئيسي) <span class="required-star">*</span>
          </label>
          <select id="onbSpecialization" class="onboarding-select" required>
            ${specializationsData.map(s => `
              <option value="${s.name_en}" ${ident.mainSpecialization === s.name_en ? 'selected' : ''}>
                ${s.name_en} — ${s.name_ar} (${s.category})
              </option>
            `).join('')}
          </select>
          <span class="onboarding-hint">Powers 30% of your automatic matching score with agribusiness vacancies.</span>
        </div>

        <!-- Years of Experience & Status -->
        <div class="onboarding-grid-2">
          <div class="onboarding-group">
            <label class="onboarding-label" for="onbExpTier">
              Years of Experience (سنوات الخبرة) <span class="required-star">*</span>
            </label>
            <select id="onbExpTier" class="onboarding-select" required>
              ${this.taxonomy.experienceTiers.map(t => `
                <option value="${t.value}" ${ident.yearsOfExperience == t.value ? 'selected' : ''}>
                  ${t.label}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="onboarding-group">
            <label class="onboarding-label" for="onbStatus">
              Current Employment Status (الحالة الوظيفية) <span class="required-star">*</span>
            </label>
            <select id="onbStatus" class="onboarding-select" required>
              ${this.taxonomy.employmentStatuses.map(st => `
                <option value="${st}" ${ident.currentStatus === st ? 'selected' : ''}>
                  ${st}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">Save & Continue &rarr;</button>
          </div>
        </div>
      </form>
    `;
  }

  selectQuickTitle(title) {
    const input = document.getElementById('onbTitle');
    if (input) input.value = title;
    this.formData.identity.professionalTitle = title;
    this.refreshStep();
  }

  handleStep2Submit() {
    const title = document.getElementById('onbTitle')?.value?.trim();
    const spec = document.getElementById('onbSpecialization')?.value;
    const expVal = parseInt(document.getElementById('onbExpTier')?.value || '1', 10);
    const status = document.getElementById('onbStatus')?.value;

    if (!title || !spec) {
      alert('Please fill your professional title and main specialization.');
      return;
    }

    const tierObj = this.taxonomy.experienceTiers.find(t => t.value === expVal) || this.taxonomy.experienceTiers[1];

    this.formData.identity = {
      professionalTitle: title,
      mainSpecialization: spec,
      yearsOfExperience: expVal,
      experienceTierLabel: tierObj.label,
      currentStatus: status
    };

    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 3: Education
  // ---------------------------------------------------------------------------
  renderStep3Education() {
    const edu = this.formData.education;

    return `
      <div class="step-content-header">
        <h2>🎓 Step 3 — Education & Academic Background</h2>
        <p>Your degree and university establish your foundational credentials in the agricultural sector.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep3Submit();">
        <div class="onboarding-group">
          <label class="onboarding-label" for="onbDegree">
            Degree (الدرجة العلمية) <span class="required-star">*</span>
          </label>
          <select id="onbDegree" class="onboarding-select" required>
            ${this.taxonomy.degrees.map(d => `
              <option value="${d.title}" ${edu.degree === d.title ? 'selected' : ''}>${d.title}</option>
            `).join('')}
          </select>
        </div>

        <div class="onboarding-group">
          <label class="onboarding-label" for="onbUniversity">
            University / Institution (الجامعة) <span class="required-star">*</span>
          </label>
          <select id="onbUniversity" class="onboarding-select" required>
            ${this.taxonomy.universities.map(u => `
              <option value="${u}" ${edu.university === u ? 'selected' : ''}>${u}</option>
            `).join('')}
          </select>
        </div>

        <div class="onboarding-grid-2">
          <div class="onboarding-group">
            <label class="onboarding-label" for="onbDept">
              Faculty Department / Specialization (القسم)
            </label>
            <input type="text" id="onbDept" class="onboarding-input" 
                   placeholder="e.g. Food Science, Agronomy, Plant Protection" 
                   value="${this.escapeHtml(edu.facultyDepartment || '')}">
          </div>

          <div class="onboarding-group">
            <label class="onboarding-label" for="onbGradYear">
              Graduation Year (سنة التخرج) <span class="required-star">*</span>
            </label>
            <select id="onbGradYear" class="onboarding-select" required>
              ${Array.from({ length: 40 }).map((_, i) => {
                const yr = 2026 - i;
                return `<option value="${yr}" ${edu.graduationYear == yr ? 'selected' : ''}>${yr}</option>`;
              }).join('')}
            </select>
          </div>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">Save & Continue &rarr;</button>
          </div>
        </div>
      </form>
    `;
  }

  handleStep3Submit() {
    const degree = document.getElementById('onbDegree')?.value;
    const university = document.getElementById('onbUniversity')?.value;
    const dept = document.getElementById('onbDept')?.value?.trim();
    const gradYear = parseInt(document.getElementById('onbGradYear')?.value || '2023', 10);

    if (!degree || !university) {
      alert('Please select your degree and university.');
      return;
    }

    this.formData.education = {
      degree,
      university,
      facultyDepartment: dept,
      graduationYear: gradYear
    };

    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 4: Skills (Multi-Select & Custom Tags)
  // ---------------------------------------------------------------------------
  renderStep4Skills() {
    const currentSkills = this.formData.skills || [];

    return `
      <div class="step-content-header">
        <h2>⚡ Step 4 — Agricultural & Technical Skills</h2>
        <p>Select your specialized skills and technical competencies. Multiple skills significantly boost your vacancy match score.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep4Submit();">
        <div class="onboarding-group">
          <label class="onboarding-label">
            Your Selected Skills (${currentSkills.length} selected) <span class="required-star">*</span>
          </label>
          <div class="skills-selected-box">
            ${currentSkills.length === 0 ? `
              <span style="color:var(--color-text-muted); font-size:0.875rem; padding:6px;">
                No skills selected yet. Click skills below or type custom skills to add.
              </span>
            ` : currentSkills.map(sk => `
              <span class="skill-tag-pill">
                <span>${sk}</span>
                <button type="button" class="remove-skill-btn" onclick="window.agriOnboarding.removeSkill('${this.escapeHtml(sk)}')">&times;</button>
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Add Custom Skill -->
        <div class="onboarding-group">
          <label class="onboarding-label" for="customSkillInput">Add Custom Skill</label>
          <div class="custom-skill-adder">
            <input type="text" id="customSkillInput" class="onboarding-input" 
                   placeholder="Type a skill and press Enter or click Add (e.g. SCADA, BRCGS, Hydroponics)">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.addCustomSkill()">+ Add</button>
          </div>
        </div>

        <!-- Suggested Industry Skills -->
        <div class="onboarding-group">
          <label class="onboarding-label">Suggested Industry Skills (Click to add/remove)</label>
          <div class="chip-group">
            ${this.taxonomy.suggestedSkills.map(sk => {
              const isSelected = currentSkills.includes(sk);
              return `
                <span class="selection-chip ${isSelected ? 'selected' : ''}" 
                      onclick="window.agriOnboarding.toggleSkill('${this.escapeHtml(sk)}')">
                  ${sk}
                </span>
              `;
            }).join('')}
          </div>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">Save & Continue &rarr;</button>
          </div>
        </div>
      </form>
    `;
  }

  toggleSkill(skill) {
    if (!this.formData.skills) this.formData.skills = [];
    const index = this.formData.skills.indexOf(skill);
    if (index > -1) {
      this.formData.skills.splice(index, 1);
    } else {
      this.formData.skills.push(skill);
    }
    this.refreshStep();
  }

  removeSkill(skill) {
    if (!this.formData.skills) return;
    this.formData.skills = this.formData.skills.filter(s => s !== skill);
    this.refreshStep();
  }

  addCustomSkill() {
    const input = document.getElementById('customSkillInput');
    const val = input?.value?.trim();
    if (val) {
      if (!this.formData.skills) this.formData.skills = [];
      if (!this.formData.skills.includes(val)) {
        this.formData.skills.push(val);
      }
      input.value = '';
      this.refreshStep();
    }
  }

  handleStep4Submit() {
    if (!this.formData.skills || this.formData.skills.length === 0) {
      alert('Please select or add at least 1 technical skill to proceed.');
      return;
    }
    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 5: Work Experience
  // ---------------------------------------------------------------------------
  renderStep5Experience() {
    const exps = this.formData.experiences || [];

    return `
      <div class="step-content-header">
        <h2>💼 Step 5 — Work Experience</h2>
        <p>List your current or previous agribusiness positions. Fresh graduates can skip this step.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep5Submit();">
        <div class="dynamic-items-container" id="experiencesList">
          ${exps.map((exp, idx) => `
            <div class="dynamic-item-card" data-exp-index="${idx}">
              <div class="dynamic-item-header">
                <span class="dynamic-item-title">🏢 Position #${idx + 1}</span>
                ${exps.length > 1 ? `
                  <button type="button" class="remove-item-btn" onclick="window.agriOnboarding.removeExperience(${idx})">Remove</button>
                ` : ''}
              </div>

              <div class="onboarding-grid-2">
                <div class="onboarding-group">
                  <label class="onboarding-label">Company / Organization *</label>
                  <input type="text" class="onboarding-input exp-company" required
                         placeholder="e.g. Cairo 3A, Delta Foods, Farm" 
                         value="${this.escapeHtml(exp.company)}">
                </div>
                <div class="onboarding-group">
                  <label class="onboarding-label">Job Title *</label>
                  <input type="text" class="onboarding-input exp-title" required
                         placeholder="e.g. Quality Control Specialist" 
                         value="${this.escapeHtml(exp.title)}">
                </div>
              </div>

              <div class="onboarding-grid-2">
                <div class="onboarding-group">
                  <label class="onboarding-label">Start Date</label>
                  <input type="month" class="onboarding-input exp-start" 
                         value="${exp.startDate || '2023-01'}">
                </div>
                <div class="onboarding-group">
                  <label class="onboarding-label">End Date</label>
                  <input type="month" class="onboarding-input exp-end" ${exp.isCurrent ? 'disabled' : ''}
                         value="${exp.endDate || ''}">
                  <label style="display:flex; align-items:center; gap:6px; font-size:0.8125rem; margin-top:6px; color:var(--color-text-muted);">
                    <input type="checkbox" class="exp-current" ${exp.isCurrent ? 'checked' : ''}
                           onchange="this.closest('.dynamic-item-card').querySelector('.exp-end').disabled = this.checked;">
                    I currently work in this role (على رأس العمل)
                  </label>
                </div>
              </div>

              <div class="onboarding-group" style="margin-bottom:0;">
                <label class="onboarding-label">Key Responsibilities & Achievements</label>
                <textarea class="onboarding-textarea exp-resp" rows="2" 
                          placeholder="Briefly describe your tasks, e.g. supervised quality checks, managed drip irrigation lines, monitored crop yields">${this.escapeHtml(exp.responsibilities || '')}</textarea>
              </div>
            </div>
          `).join('')}
        </div>

        <button type="button" class="add-another-btn" onclick="window.agriOnboarding.addExperience()">
          + Add Another Experience
        </button>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="window.agriOnboarding.skipExperience()">Skip for now (Fresh Graduate)</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">Save & Continue &rarr;</button>
          </div>
        </div>
      </form>
    `;
  }

  addExperience() {
    this.collectExperienceFormValues();
    this.formData.experiences.push({
      company: "",
      title: "",
      startDate: "2023-01",
      endDate: "",
      isCurrent: false,
      responsibilities: ""
    });
    this.refreshStep();
  }

  removeExperience(index) {
    this.collectExperienceFormValues();
    if (this.formData.experiences.length > 1) {
      this.formData.experiences.splice(index, 1);
      this.refreshStep();
    }
  }

  collectExperienceFormValues() {
    const cards = document.querySelectorAll('#experiencesList .dynamic-item-card');
    const updated = [];
    cards.forEach(card => {
      const company = card.querySelector('.exp-company')?.value?.trim() || '';
      const title = card.querySelector('.exp-title')?.value?.trim() || '';
      const startDate = card.querySelector('.exp-start')?.value || '';
      const isCurrent = card.querySelector('.exp-current')?.checked || false;
      const endDate = isCurrent ? '' : (card.querySelector('.exp-end')?.value || '');
      const responsibilities = card.querySelector('.exp-resp')?.value?.trim() || '';
      updated.push({ company, title, startDate, endDate, isCurrent, responsibilities });
    });
    if (updated.length > 0) {
      this.formData.experiences = updated;
    }
  }

  skipExperience() {
    this.formData.experiences = [];
    this.saveDraft();
    this.nextStep();
  }

  handleStep5Submit() {
    this.collectExperienceFormValues();
    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 6: Certifications
  // ---------------------------------------------------------------------------
  renderStep6Certifications() {
    const certs = this.formData.certifications || [];

    return `
      <div class="step-content-header">
        <h2>📜 Step 6 — Industry Certifications</h2>
        <p>Certifications like HACCP, ISO 22000, and GLOBALG.A.P. significantly raise candidate ranking by 40%.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep6Submit();">
        <div class="dynamic-items-container" id="certificationsList">
          ${certs.map((cert, idx) => `
            <div class="dynamic-item-card" data-cert-index="${idx}">
              <div class="dynamic-item-header">
                <span class="dynamic-item-title">🏅 Certification #${idx + 1}</span>
                <button type="button" class="remove-item-btn" onclick="window.agriOnboarding.removeCertification(${idx})">Remove</button>
              </div>

              <div class="onboarding-group">
                <label class="onboarding-label">Certification Title *</label>
                <input type="text" class="onboarding-input cert-name" required
                       placeholder="e.g. ISO 22000 Lead Auditor, HACCP Level 3" 
                       value="${this.escapeHtml(cert.name)}">
              </div>

              <div class="onboarding-grid-2">
                <div class="onboarding-group">
                  <label class="onboarding-label">Issuing Organization *</label>
                  <input type="text" class="onboarding-input cert-org" required
                         placeholder="e.g. NFSA, SGS, TÜV, AgriCore Academy" 
                         value="${this.escapeHtml(cert.organization)}">
                </div>
                <div class="onboarding-group">
                  <label class="onboarding-label">Year of Issue</label>
                  <select class="onboarding-select cert-year">
                    ${Array.from({ length: 15 }).map((_, i) => {
                      const yr = 2026 - i;
                      return `<option value="${yr}" ${cert.year == yr ? 'selected' : ''}>${yr}</option>`;
                    }).join('')}
                  </select>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <button type="button" class="add-another-btn" onclick="window.agriOnboarding.addCertification()">
          + Add Another Certification
        </button>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="window.agriOnboarding.skipCertifications()">Skip (No Certifications Yet)</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">Save & Continue &rarr;</button>
          </div>
        </div>
      </form>
    `;
  }

  addCertification() {
    this.collectCertificationFormValues();
    this.formData.certifications.push({
      name: "ISO 22000:2018 Implementation",
      organization: "AgriCore Academy",
      year: 2023
    });
    this.refreshStep();
  }

  removeCertification(index) {
    this.collectCertificationFormValues();
    this.formData.certifications.splice(index, 1);
    this.refreshStep();
  }

  collectCertificationFormValues() {
    const cards = document.querySelectorAll('#certificationsList .dynamic-item-card');
    const updated = [];
    cards.forEach(card => {
      const name = card.querySelector('.cert-name')?.value?.trim() || '';
      const organization = card.querySelector('.cert-org')?.value?.trim() || '';
      const year = parseInt(card.querySelector('.cert-year')?.value || '2023', 10);
      if (name) {
        updated.push({ name, organization, year });
      }
    });
    this.formData.certifications = updated;
  }

  skipCertifications() {
    this.formData.certifications = [];
    this.saveDraft();
    this.nextStep();
  }

  handleStep6Submit() {
    this.collectCertificationFormValues();
    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 7: Career Preferences
  // ---------------------------------------------------------------------------
  renderStep7Preferences() {
    const pref = this.formData.preferences;

    return `
      <div class="step-content-header">
        <h2>🎯 Step 7 — Career & Matching Preferences</h2>
        <p>Tell the matching engine what vacancies to prioritize for you across Egyptian and Arab agricultural markets.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep7Submit();">
        <!-- Preferred Roles -->
        <div class="onboarding-group">
          <label class="onboarding-label">Preferred Job Roles (Select all that apply) <span class="required-star">*</span></label>
          <div class="chip-group">
            ${this.taxonomy.targetJobRoles.map(role => {
              const isSelected = pref.preferredRoles.includes(role);
              return `
                <span class="selection-chip ${isSelected ? 'selected' : ''}"
                      onclick="window.agriOnboarding.togglePrefRole('${this.escapeHtml(role)}')">
                  ${role}
                </span>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Preferred Sectors -->
        <div class="onboarding-group">
          <label class="onboarding-label">Preferred Sectors (Select target industries) <span class="required-star">*</span></label>
          <div class="chip-group">
            ${this.taxonomy.targetSectors.map(sec => {
              const isSelected = pref.preferredSectors.includes(sec);
              return `
                <span class="selection-chip ${isSelected ? 'selected' : ''}"
                      onclick="window.agriOnboarding.togglePrefSector('${this.escapeHtml(sec)}')">
                  ${sec}
                </span>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Preferred Locations -->
        <div class="onboarding-group">
          <label class="onboarding-label">Preferred Locations (Governorates / Zones) <span class="required-star">*</span></label>
          <div class="chip-group">
            ${this.taxonomy.targetLocations.map(loc => {
              const isSelected = pref.preferredLocations.includes(loc);
              return `
                <span class="selection-chip ${isSelected ? 'selected' : ''}"
                      onclick="window.agriOnboarding.togglePrefLocation('${this.escapeHtml(loc)}')">
                  ${loc}
                </span>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Employment Type -->
        <div class="onboarding-group">
          <label class="onboarding-label" for="onbEmpType">Employment Type (نوع التعاقد) <span class="required-star">*</span></label>
          <select id="onbEmpType" class="onboarding-select" required>
            ${this.taxonomy.employmentTypes.map(type => `
              <option value="${type}" ${pref.employmentType === type ? 'selected' : ''}>${type}</option>
            `).join('')}
          </select>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary">Save & Continue &rarr;</button>
          </div>
        </div>
      </form>
    `;
  }

  togglePrefRole(role) {
    const list = this.formData.preferences.preferredRoles;
    const idx = list.indexOf(role);
    if (idx > -1) list.splice(idx, 1);
    else list.push(role);
    this.refreshStep();
  }

  togglePrefSector(sec) {
    const list = this.formData.preferences.preferredSectors;
    const idx = list.indexOf(sec);
    if (idx > -1) list.splice(idx, 1);
    else list.push(sec);
    this.refreshStep();
  }

  togglePrefLocation(loc) {
    const list = this.formData.preferences.preferredLocations;
    const idx = list.indexOf(loc);
    if (idx > -1) list.splice(idx, 1);
    else list.push(loc);
    this.refreshStep();
  }

  handleStep7Submit() {
    const pref = this.formData.preferences;
    if (pref.preferredRoles.length === 0 || pref.preferredLocations.length === 0) {
      alert('Please select at least 1 preferred job role and 1 preferred location.');
      return;
    }
    pref.employmentType = document.getElementById('onbEmpType')?.value || pref.employmentType;
    this.saveDraft();
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Step 8: CV Upload
  // ---------------------------------------------------------------------------
  renderStep8CV() {
    const cv = this.formData.cv;

    return `
      <div class="step-content-header">
        <h2>📄 Step 8 — Curriculum Vitae (CV Upload)</h2>
        <p>Upload your latest CV in PDF or DOCX format. Agribusiness employers can view your verified resume.</p>
      </div>

      <form id="onboardingStepForm" onsubmit="event.preventDefault(); window.agriOnboarding.handleStep8Submit();">
        <!-- Hidden file input -->
        <input type="file" id="cvFileInput" style="display:none;" accept=".pdf,.docx,.doc" 
               onchange="window.agriOnboarding.handleFileChosen(event)">

        <!-- Drag & Drop Zone -->
        <div class="cv-dropzone" id="cvDropzone" onclick="document.getElementById('cvFileInput').click();">
          <div class="cv-dropzone-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h4 style="font-size:1.0625rem; font-weight:700; color:var(--color-brand-900); margin-bottom:4px;">
            Click to upload your CV or drag and drop here
          </h4>
          <p style="font-size:0.8125rem; color:var(--color-text-muted);">Supported formats: PDF, DOCX, DOC (Max file size: 10 MB)</p>
        </div>

        <!-- Uploaded Status -->
        ${cv && cv.fileName ? `
          <div class="cv-uploaded-card">
            <div class="cv-file-details">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand-700);">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div>
                <strong style="font-size:0.875rem; color:var(--color-brand-900); display:block;">${this.escapeHtml(cv.fileName)}</strong>
                <small style="color:var(--color-text-muted); font-size:0.75rem;">${cv.fileSize} • Uploaded ${cv.uploadedAt}</small>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="verified-badge">Verified Document</span>
              <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('cvFileInput').click()">Replace</button>
            </div>
          </div>
        ` : ''}

        <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:14px; line-height:1.5;">
          🔒 <strong>Privacy Assurance:</strong> Your CV is stored in a private Supabase Storage bucket with strict Row Level Security. Only hiring companies for vacancies you choose will have access.
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-footer-left">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.prevStep()">&larr; Back</button>
          </div>
          <div class="onboarding-footer-right">
            <button type="submit" class="btn btn-primary" id="finishOnboardingBtn">
              Complete Profile & View Matches &rarr;
            </button>
          </div>
        </div>
      </form>
    `;
  }

  handleFileChosen(event) {
    const file = event.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      this.formData.cv = {
        fileName: file.name,
        fileSize: `${sizeMB} MB`,
        uploadedAt: "Just now",
        verified: true
      };
      this.saveDraft();
      this.refreshStep();
    }
  }

  handleStep8Submit() {
    this.isCompleted = true;
    this.formData.profileCompletion = 85;
    this.saveDraft();
    this.syncWithApplicationData();
    this.refreshStep();
  }

  // ---------------------------------------------------------------------------
  // Step 9: Completion Screen (85% Profile Completion + CTAs)
  // ---------------------------------------------------------------------------
  renderCompletionScreen() {
    const acc = this.formData.account;
    const ident = this.formData.identity;
    const edu = this.formData.education;
    const skills = this.formData.skills;
    const pref = this.formData.preferences;

    return `
      <div class="completion-container">
        
        <!-- Score Circular Badge -->
        <div class="completion-score-card">
          <div class="completion-score-inner">
            <div class="score-num">85%</div>
            <div class="score-text">Completed</div>
          </div>
        </div>

        <div class="completion-badge-tag">
          <span>✨</span>
          <span>Professional Profile Ready for Matching</span>
        </div>

        <h2 style="font-size:1.625rem; font-weight:800; color:var(--color-brand-900); margin-bottom:8px;">
          Congratulations, ${this.escapeHtml(acc.fullName || 'Colleague')}!
        </h2>
        <p style="color:var(--color-text-muted); font-size:0.9375rem; max-width:540px; margin:0 auto 20px;">
          Your agricultural professional profile has been built and structured. The matching engine is ready to evaluate your qualifications against active vacancies.
        </p>

        <!-- Summary Cards -->
        <div class="completion-summary-grid">
          <div class="completion-item">
            <div class="completion-item-icon">🌱</div>
            <div>
              <strong style="font-size:0.8125rem; color:var(--color-brand-800); display:block;">Specialization & Title</strong>
              <span style="font-size:0.875rem; color:var(--color-text-main);">${this.escapeHtml(ident.professionalTitle)} (${ident.mainSpecialization})</span>
            </div>
          </div>

          <div class="completion-item">
            <div class="completion-item-icon">🎓</div>
            <div>
              <strong style="font-size:0.8125rem; color:var(--color-brand-800); display:block;">Academic Qualification</strong>
              <span style="font-size:0.875rem; color:var(--color-text-main);">${this.escapeHtml(edu.university)} (${edu.graduationYear})</span>
            </div>
          </div>

          <div class="completion-item">
            <div class="completion-item-icon">⚡</div>
            <div>
              <strong style="font-size:0.8125rem; color:var(--color-brand-800); display:block;">Verified Skills</strong>
              <span style="font-size:0.875rem; color:var(--color-text-main);">${skills.slice(0, 4).join(', ')}${skills.length > 4 ? ` +${skills.length - 4} more` : ''}</span>
            </div>
          </div>

          <div class="completion-item">
            <div class="completion-item-icon">📄</div>
            <div>
              <strong style="font-size:0.8125rem; color:var(--color-brand-800); display:block;">Resume Status</strong>
              <span style="font-size:0.875rem; color:var(--color-text-main);">${this.escapeHtml(this.formData.cv.fileName)} (Verified)</span>
            </div>
          </div>
        </div>

        <div style="background:var(--color-brand-50); border:1px solid var(--color-brand-100); border-radius:var(--radius-md); padding:14px 18px; margin:20px 0; text-align:left; font-size:0.8125rem; color:var(--color-brand-900);">
          💡 <strong>How to reach 100%:</strong> You can add a profile photo and request endorsements anytime from your Profile page.
        </div>

        <!-- CTAs -->
        <div class="completion-actions">
          <button type="button" class="btn btn-primary btn-lg" onclick="window.agriOnboarding.goToMatches()">
            🔍 View My Matches &rarr;
          </button>
          
          <div style="display:flex; justify-content:center; gap:12px; margin-top:6px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.agriOnboarding.goToProfile()">
              📄 View My Profile
            </button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="window.agriOnboarding.jumpToStep(1)">
              ✏️ Edit Information
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Step Navigation & State Controls
  // ---------------------------------------------------------------------------
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 120, behavior: 'smooth' });
      this.refreshStep();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 120, behavior: 'smooth' });
      this.refreshStep();
    }
  }

  jumpToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.isCompleted = false;
      this.currentStep = stepNumber;
      window.scrollTo({ top: 120, behavior: 'smooth' });
      this.refreshStep();
    }
  }

  refreshStep() {
    const container = document.getElementById('appRoot');
    if (container && this.app.currentView === 'professional_onboarding') {
      container.innerHTML = this.renderOnboardingView();
      this.bindDropzoneEvents();
    }
  }

  bindDropzoneEvents() {
    const dropzone = document.getElementById('cvDropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        this.formData.cv = {
          fileName: file.name,
          fileSize: `${sizeMB} MB`,
          uploadedAt: "Just now",
          verified: true
        };
        this.saveDraft();
        this.refreshStep();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Sync with App & Matching Engine
  // ---------------------------------------------------------------------------
  syncWithApplicationData() {
    const d = this.formData;
    const name = d.account.fullName || "Ahmed Mohamed";

    // Build standard candidate profile object
    const candidateProfile = {
      name: name,
      title: d.identity.professionalTitle,
      email: d.account.email || "ahmed.agri@agricore.eg",
      phone: d.account.phone || "+20 101 234 5678",
      governorate: d.preferences.preferredLocations[0]?.split(' ')[0] || "Cairo",
      nationality: "Egyptian",
      birth_date: "1997-04-12",
      agricore_id: "AGRI-" + Math.floor(10000 + Math.random() * 90000),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=15573b&color=ffffff&size=160`,
      cover: "assets/images/profile_cover.jpg",
      about: `${d.identity.professionalTitle} with specialized expertise in ${d.identity.mainSpecialization}. Holds a ${d.education.degree} from ${d.education.university}. Passionate about precision quality, agricultural standards, and modern sustainable systems.`,
      specializations: [d.identity.mainSpecialization],
      skills: [...d.skills],
      experience_years: d.identity.yearsOfExperience || 2,
      education_level: d.education.degree.toLowerCase().includes('master') ? 'master' : (d.education.degree.toLowerCase().includes('phd') ? 'phd' : 'bachelor'),
      education: [
        {
          degree: d.education.degree,
          university: d.education.university,
          department: d.education.facultyDepartment,
          year: `${d.education.graduationYear}`,
          grade: "Excellent with Honors"
        }
      ],
      experiences: d.experiences.map(e => ({
        role: e.title,
        company: e.company,
        period: `${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate}`,
        desc: e.responsibilities
      })),
      certifications: d.certifications.map(c => ({
        name: c.name,
        org: c.organization,
        year: `${c.year}`
      })),
      cv: d.cv,
      profile_completion_pct: 85
    };

    // Save as current candidate in app instance
    this.app.currentCandidateProfile = candidateProfile;

    // Also update currentUser if not already logged in
    if (!this.app.currentUser) {
      this.app.currentUser = {
        id: "usr-" + Date.now(),
        name: name,
        email: d.account.email,
        avatar: candidateProfile.avatar,
        userType: 'professional'
      };
    }
  }

  goToMatches() {
    this.syncWithApplicationData();
    this.app.navigateTo('jobs_search');
  }

  goToProfile() {
    this.syncWithApplicationData();
    this.app.navigateTo('candidate_profile');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
