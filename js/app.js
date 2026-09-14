// =============================================================================
// AgriCore Application Controller & Dynamic View Router
// =============================================================================

import {
  specializationsData,
  skillsData,
  candidatesData,
  companiesData,
  jobsData,
  academyCoursesData
} from './data.js';

import { calculateMatchScore } from './matchingEngine.js';
import { supabaseBridge } from './supabaseClient.js';
import { ProfessionalOnboardingManager } from './onboarding.js';

class AgriCoreApp {
  constructor() {
    this.currentView = 'landing';
    this.activeProfileTab = 'about';
    this.jobs = [...jobsData];
    this.candidates = [...candidatesData];
    this._signupRole = 'professional';
    this.currentUser = null; // Will be set after login
    this.currentCandidateProfile = null; // Set after onboarding completion
    this.searchFilters = {
      keyword: '',
      location: 'all',
      specialization: 'all'
    };

    // Initialize the onboarding manager
    this.onboardingManager = new ProfessionalOnboardingManager(this);

    this.init();
  }

  async init() {
    this.bindRoleSwitcher();
    this.bindGlobalEvents();

    // 4 & 5: Listen to Supabase onAuthStateChange events
    supabaseBridge.auth.onAuthStateChange(async (event, session) => {
      console.log(`[App Controller] 4 & 5. onAuthStateChange: ${event}`, {
        hasSession: !!session,
        userId: session?.user?.id || session?.id || null
      });

      if (event === 'SIGNED_IN' && session) {
        await this.syncCurrentUserFromSession(session);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.renderCurrentView();
      }
    });

    // Restore existing stored session if available
    const storedSession = supabaseBridge.session;
    if (storedSession?.user) {
      await this.syncCurrentUserFromSession(storedSession);
    }

    // Connect and load live data from Supabase
    try {
      const liveJobs = await supabaseBridge.getJobs();
      if (liveJobs && Array.isArray(liveJobs) && liveJobs.length > 0) {
        console.log("Connected to Supabase! Loaded live vacancies:", liveJobs.length);
        this.jobs = liveJobs.map((j, idx) => ({
          id: j.id,
          title: j.title,
          company: j.company_profiles?.company_name || "AgriCore Company",
          logo_text: (j.company_profiles?.company_name || "Ag").substring(0, 2).toUpperCase(),
          sector: j.company_profiles?.business_sector || "Agribusiness",
          location: j.governorate,
          city: j.city || "Cairo",
          type: j.employment_type === 'full_time' ? 'Full Time' : (j.employment_type || 'Full Time'),
          experience: `${j.min_experience_years || 1}-${j.max_experience_years || 3} Years`,
          min_exp: j.min_experience_years || 1,
          max_exp: j.max_experience_years || 3,
          min_edu: j.min_education_level || "bachelor",
          specializations: j.job_specializations?.map(js => js.specializations?.name_en).filter(Boolean) || [],
          skills: j.job_skills?.map(js => js.skills?.name_en).filter(Boolean) || [],
          match_score: 0,
          description: j.description || '',
          created_at: j.created_at,
          applied: false
        }));
      }
    } catch (err) {
      console.warn("Operating without live jobs:", err);
    }

    this.renderCurrentView();
  }

  // ---------------------------------------------------------------------------
  // Navigation & Role Controller
  // ---------------------------------------------------------------------------
  bindRoleSwitcher() {
    const buttons = document.querySelectorAll('.role-btn[data-view]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // SQL Architecture Modal Trigger
    const sqlBtn = document.getElementById('openSqlModalBtn');
    if (sqlBtn) {
      sqlBtn.addEventListener('click', () => this.openSqlModal());
    }
  }

  navigateTo(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.role-btn[data-view]').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderCurrentView();
  }

  bindGlobalEvents() {
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // 1 & 2: Dedicated Event Listeners for Registration & Login Forms
    const signUpForm = document.getElementById('signUpForm');
    const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');
    const loginForm = document.getElementById('loginForm');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');

    if (signUpForm) {
      signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('[SignUp] 2. Form submit event fired');
        this.handleSignUp();
      });
    }

    if (signUpSubmitBtn) {
      signUpSubmitBtn.addEventListener('click', (e) => {
        console.log('[SignUp] 1. Button clicked directly');
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('[Login] Form submit event fired');
        this.handleLogin();
      });
    }

    // Clear input errors as user types
    ['regFullName', 'regEmail', 'regPassword', 'regCompanyName', 'regPhone', 'loginEmail', 'loginPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.classList.remove('input-error');
          const alert = document.getElementById('authAlert');
          if (alert && alert.dataset.type === 'error') {
            alert.style.display = 'none';
          }
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // View Dispatcher
  // ---------------------------------------------------------------------------
  renderCurrentView() {
    const container = document.getElementById('appRoot');
    if (!container) return;

    switch (this.currentView) {
      case 'landing':
        container.innerHTML = this.renderLandingPage();
        this.bindLandingEvents();
        break;
      case 'seeker_dashboard':
        container.innerHTML = this.renderSeekerDashboard();
        this.bindSeekerEvents();
        break;
      case 'jobs_search':
        container.innerHTML = this.renderJobsSearchPage();
        this.bindJobsSearchEvents();
        break;
      case 'company_dashboard':
        container.innerHTML = this.renderCompanyDashboard();
        this.bindCompanyEvents();
        break;
      case 'candidate_profile':
        container.innerHTML = this.renderCandidateProfile();
        this.bindCandidateProfileEvents();
        break;
      case 'academy':
        container.innerHTML = this.renderAcademyPage();
        this.bindAcademyEvents();
        break;
      case 'insights':
        container.innerHTML = this.renderInsightsPage();
        break;
      case 'professional_onboarding':
        container.innerHTML = this.onboardingManager.renderOnboardingView();
        this.onboardingManager.bindDropzoneEvents();
        break;
      default:
        container.innerHTML = this.renderLandingPage();
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Landing Page View
  // ---------------------------------------------------------------------------
  renderLandingPage() {
    return `
      <!-- Public Header -->
      <header class="public-header">
        <div class="header-container">
          <div class="brand-logo" onclick="window.agriApp.navigateTo('landing')">
            <svg class="brand-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z"></path>
              <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3s-4.5 2-4.5 4.5 2 4.5 4.5 4.5z"></path>
              <path d="M12 12v9"></path>
            </svg>
            <span>AgriCore</span>
          </div>
          <nav class="public-nav">
            <span class="public-nav-link active" onclick="window.agriApp.navigateTo('landing')">Home</span>
            <span class="public-nav-link" onclick="window.agriApp.navigateTo('jobs_search')">Jobs</span>
            <span class="public-nav-link" onclick="window.agriApp.navigateTo('academy')">Training</span>
            <span class="public-nav-link" onclick="window.agriApp.navigateTo('company_dashboard')">Companies</span>
            <span class="public-nav-link" onclick="window.agriApp.navigateTo('insights')">Insights</span>
          </nav>
          <div class="header-actions">
            <button class="btn btn-ghost btn-sm" onclick="window.agriApp.openAuthModal('login')">Login</button>
            <button class="btn btn-primary btn-sm" onclick="window.agriApp.openAuthModal('signup')">Sign Up</button>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section" style="background-image: url('assets/images/hero_bg.jpg');">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            The Leading Agricultural Talent Ecosystem
          </div>
          <h1 class="hero-title">The Core of <span>Agricultural</span> Careers</h1>
          <p class="hero-subtitle">Connecting agricultural talent with opportunities to build a stronger and more sustainable future across Egypt and the Arab region.</p>

          <!-- Omnisearch Bar -->
          <div class="hero-search-wrapper">
            <form id="heroSearchForm" class="omnisearch-bar" onsubmit="event.preventDefault(); window.agriApp.handleHeroSearch();">
              <div class="search-field">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="heroKeyword" placeholder="Job Title or Keyword (e.g. Quality Engineer)" value="Quality Engineer">
              </div>
              <div class="search-divider"></div>
              <div class="search-field">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <select id="heroLocation">
                  <option value="all">All Locations</option>
                  <option value="Cairo" selected>Cairo</option>
                  <option value="Giza">Giza</option>
                  <option value="Fayoum">Fayoum</option>
                  <option value="Alexandria">Alexandria</option>
                  <option value="Beheira">Beheira</option>
                </select>
              </div>
              <div class="search-divider"></div>
              <div class="search-field">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <select id="heroSpecialization">
                  <option value="all">Specialization</option>
                  <option value="Quality Control" selected>Food Industry / QC</option>
                  <option value="Crop Production">Crop Production</option>
                  <option value="Modern Irrigation">Modern Irrigation</option>
                  <option value="Animal Nutrition">Livestock & Poultry</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Search Jobs</button>
            </form>
          </div>

          <!-- Value Propositions -->
          <div class="hero-value-props">
            <div class="value-prop-item">
              <div class="value-prop-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
              <div class="value-prop-text">
                <h4>Find Jobs</h4>
                <p>Explore thousands of agri-related opportunities</p>
              </div>
            </div>
            <div class="value-prop-item">
              <div class="value-prop-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
              </div>
              <div class="value-prop-text">
                <h4>Build Your Skills</h4>
                <p>Access training & certifications</p>
              </div>
            </div>
            <div class="value-prop-item">
              <div class="value-prop-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
              </div>
              <div class="value-prop-text">
                <h4>Grow Your Career</h4>
                <p>Get matched and reach your goals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Metrics Section -->
      <section class="metrics-section">
        <div class="metrics-container">
          <div class="metric-item">
            <div class="metric-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <div>
              <div class="metric-number" id="metricJobs">—</div>
              <div class="metric-label">Active Jobs</div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path></svg>
            </div>
            <div>
              <div class="metric-number" id="metricCompanies">—</div>
              <div class="metric-label">Registered Companies</div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <div>
              <div class="metric-number">${academyCoursesData.length}+</div>
              <div class="metric-label">Training Programs</div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div class="metric-number" id="metricTalents">—</div>
              <div class="metric-label">Registered Talents</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Top Hiring Companies -->
      <section class="companies-section">
        <div class="section-header">
          <h2 class="section-title">Join AgriCore Today</h2>
          <span class="section-link" onclick="window.agriApp.openAuthModal('signup')">Sign Up Free &rarr;</span>
        </div>
        <div class="companies-grid">
          <div class="company-logo-card" onclick="window.agriApp.startProfessionalOnboarding()" style="cursor:pointer; border: 2px solid transparent; transition: border-color 0.2s;" onmouseenter="this.style.borderColor='var(--color-brand-600)'" onmouseleave="this.style.borderColor='transparent'">
            <div class="company-logo-badge">🌾</div>
            <div class="company-logo-name">Agricultural Engineers</div>
            <div class="company-logo-sector" style="color:var(--color-brand-700); font-weight:600;">Start Profile &rarr;</div>
          </div>
          <div class="company-logo-card" onclick="window.agriApp.openAuthModal('signup')" style="cursor:pointer;">
            <div class="company-logo-badge">🏢</div>
            <div class="company-logo-name">Agribusinesses</div>
            <div class="company-logo-sector">Find top talent</div>
          </div>
          <div class="company-logo-card" onclick="window.agriApp.openAuthModal('signup')" style="cursor:pointer;">
            <div class="company-logo-badge">🔬</div>
            <div class="company-logo-name">Research Institutes</div>
            <div class="company-logo-sector">Connect with experts</div>
          </div>
          <div class="company-logo-card" onclick="window.agriApp.openAuthModal('signup')" style="cursor:pointer;">
            <div class="company-logo-badge">📋</div>
            <div class="company-logo-name">Consultants</div>
            <div class="company-logo-sector">Grow your network</div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           How It Works Section
           ============================================================ -->
      <section style="padding: 72px 0; background: #f8fffe;">
        <div style="max-width: 1160px; margin: 0 auto; padding: 0 24px;">
          <div class="section-header" style="text-align:center; flex-direction:column; gap:10px; margin-bottom:48px;">
            <div style="display:inline-flex; align-items:center; gap:8px; background:var(--color-brand-50); border:1px solid var(--color-brand-100); border-radius:999px; padding:6px 16px; font-size:0.8125rem; font-weight:700; color:var(--color-brand-700); margin-bottom:8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              How AgriCore Works
            </div>
            <h2 class="section-title" style="font-size:2rem; font-weight:800; text-align:center;">From Profile to Opportunity in 4 Steps</h2>
            <p style="color:var(--color-text-muted); max-width:540px; margin:0 auto; font-size:0.9375rem;">Our intelligent matching engine connects Egyptian agricultural talent with the right companies in record time.</p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:28px;">
            ${[
              { step: '1', icon: '👤', title: 'Build Your Profile', desc: 'Complete our 8-step agricultural professional onboarding with your specializations, skills, certifications and CV.' },
              { step: '2', icon: '🤖', title: 'AI Matching Engine', desc: 'Our algorithm scores your profile against all active vacancies using 5-factor matching — specialization, skills, experience, location, education.' },
              { step: '3', icon: '🎯', title: 'Get Matched Instantly', desc: 'Receive a ranked list of vacancies with match percentages. Apply to top matches with your verified AgriCore profile.' },
              { step: '4', icon: '🌾', title: 'Grow Your Career', desc: 'Track applications, earn certifications at AgriCore Academy, and get discovered by Egypt\'s leading agribusinesses.' }
            ].map(item => `
              <div style="background:#ffffff; border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:28px 22px; position:relative; transition:box-shadow 0.2s, transform 0.2s;" onmouseenter="this.style.boxShadow='0 12px 40px rgba(21,87,59,0.12)'; this.style.transform='translateY(-4px)'" onmouseleave="this.style.boxShadow=''; this.style.transform=''">
                <div style="position:absolute; top:-16px; left:22px; width:32px; height:32px; background:var(--color-brand-700); color:#ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.875rem; font-weight:800; box-shadow: 0 4px 12px rgba(21,87,59,0.3);">
                  ${item.step}
                </div>
                <div style="font-size:2rem; margin-bottom:12px; margin-top:8px;">${item.icon}</div>
                <h3 style="font-size:1rem; font-weight:700; color:var(--color-text-main); margin-bottom:8px;">${item.title}</h3>
                <p style="font-size:0.875rem; color:var(--color-text-muted); line-height:1.6;">${item.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ============================================================
           Featured Jobs Ticker / Live Jobs Preview
           ============================================================ -->
      <section style="padding: 56px 0; background:#ffffff;">
        <div style="max-width: 1160px; margin: 0 auto; padding: 0 24px;">
          <div class="section-header" style="margin-bottom:28px;">
            <h2 class="section-title">Featured Agricultural Vacancies</h2>
            <span class="section-link" onclick="window.agriApp.navigateTo('jobs_search')">View All Jobs &rarr;</span>
          </div>

          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px;">
            ${jobsData.slice(0, 3).map(job => `
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:20px 22px; background:#fafffe; transition:box-shadow 0.2s, border-color 0.2s;" onmouseenter="this.style.borderColor='var(--color-brand-400)'; this.style.boxShadow='0 6px 24px rgba(21,87,59,0.1)'" onmouseleave="this.style.borderColor='var(--color-border)'; this.style.boxShadow=''">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
                  <div class="job-item-logo" style="width:44px; height:44px; font-size:0.875rem;">${job.logo_text}</div>
                  <div>
                    <h4 style="font-size:0.9375rem; font-weight:700; line-height:1.3;">${job.title}</h4>
                    <p style="font-size:0.8125rem; color:var(--color-text-muted);">${job.company}</p>
                  </div>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
                  <span class="chip" style="font-size:0.75rem; padding:3px 10px;">📍 ${job.location}</span>
                  <span class="chip" style="font-size:0.75rem; padding:3px 10px;">⏳ ${job.experience}</span>
                  <span class="chip chip-active" style="font-size:0.75rem; padding:3px 10px;">⭐ ${job.match_score}% match</span>
                </div>
                <p style="font-size:0.8125rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:16px;">${job.description.substring(0, 80)}...</p>
                <button class="btn btn-primary btn-sm" style="width:100%;" onclick="window.agriApp.openAuthModal('signup')">Apply Now &rarr;</button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ============================================================
           Testimonials Section
           ============================================================ -->
      <section style="padding: 72px 0; background: linear-gradient(135deg, #0a3824 0%, #15573b 100%); color:#ffffff;">
        <div style="max-width: 1160px; margin: 0 auto; padding: 0 24px;">
          <div style="text-align:center; margin-bottom:48px;">
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.15); border-radius:999px; padding:6px 16px; font-size:0.8125rem; font-weight:700; color:rgba(255,255,255,0.9); margin-bottom:12px;">
              ⭐ Success Stories
            </div>
            <h2 style="font-size:2rem; font-weight:800; margin-bottom:8px;">What Our Professionals Say</h2>
            <p style="color:rgba(255,255,255,0.75); font-size:0.9375rem;">Real outcomes from Egypt's agricultural talent ecosystem</p>
          </div>

          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:24px;">
            ${[
              { name: "م. أحمد رمضان", title: "Quality Control Engineer, Delta Foods", quote: "Through AgriCore I found my dream position in 3 weeks. The matching engine is incredibly accurate — it understood my HACCP expertise perfectly.", rating: 5, avatar: "AR" },
              { name: "م. سارة محمود", title: "Irrigation Specialist, Nile Valley Farms", quote: "AgriCore Academy gave me an ISO 22000 certification that opened doors. The platform connected me with companies I never would have reached on my own.", rating: 5, avatar: "SM" },
              { name: "م. عمر حسين", title: "Lab Analyst, Egyptian Agro Export", quote: "As a fresh graduate, I was lost. AgriCore's onboarding helped me structure my agricultural skills and the matching engine showed me real opportunities I qualified for.", rating: 5, avatar: "OH" }
            ].map(t => `
              <div style="background:rgba(255,255,255,0.1); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); border-radius:var(--radius-lg); padding:28px 24px;">
                <div style="display:flex; gap:2px; margin-bottom:16px;">
                  ${'⭐'.repeat(t.rating)}
                </div>
                <p style="font-size:0.9375rem; color:rgba(255,255,255,0.9); line-height:1.7; margin-bottom:20px; font-style:italic;">"${t.quote}"</p>
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.875rem;">${t.avatar}</div>
                  <div>
                    <div style="font-weight:700; font-size:0.9375rem;">${t.name}</div>
                    <div style="font-size:0.8125rem; color:rgba(255,255,255,0.65);">${t.title}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ============================================================
           CTA Banner
           ============================================================ -->
      <section style="padding: 64px 24px; background: #f0fdf4; text-align:center;">
        <div style="max-width:640px; margin:0 auto;">
          <div style="font-size:2.5rem; margin-bottom:16px;">🌱</div>
          <h2 style="font-size:2rem; font-weight:800; color:var(--color-brand-950); margin-bottom:12px;">Ready to Grow Your Agricultural Career?</h2>
          <p style="color:var(--color-text-muted); font-size:1rem; margin-bottom:28px;">Join 12,450+ agricultural professionals and 150+ companies already on AgriCore. Start building your verified career profile today — it's free.</p>
          <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">
            <button class="btn btn-primary btn-lg" onclick="window.agriApp.startProfessionalOnboarding()">
              🌾 Start My Profile Free
            </button>
            <button class="btn btn-secondary btn-lg" onclick="window.agriApp.navigateTo('jobs_search')">
              🔍 Browse Jobs
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================================
           Footer
           ============================================================ -->
      <footer style="background: #0a3824; color:rgba(255,255,255,0.8); padding: 52px 24px 28px;">
        <div style="max-width: 1160px; margin: 0 auto;">
          <div style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap:40px; margin-bottom:40px;">
            <!-- Brand -->
            <div>
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color:#4ade80;">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z"></path>
                  <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3s-4.5 2-4.5 4.5 2 4.5 4.5 4.5z"></path>
                  <path d="M12 12v9"></path>
                </svg>
                <span style="font-size:1.25rem; font-weight:800; color:#ffffff;">AgriCore</span>
              </div>
              <p style="font-size:0.875rem; line-height:1.7; color:rgba(255,255,255,0.65); max-width:280px;">The core of agricultural careers in Egypt and the Arab region. Connecting verified talent with leading agribusinesses.</p>
              <div style="display:flex; gap:10px; margin-top:20px;">
                ${['LinkedIn', 'Facebook', 'WhatsApp'].map(s => `
                  <div style="width:36px; height:36px; background:rgba(255,255,255,0.1); border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.75rem; font-weight:700; transition:background 0.2s;" onmouseenter="this.style.background='rgba(255,255,255,0.2)'" onmouseleave="this.style.background='rgba(255,255,255,0.1)'">${s[0]}</div>
                `).join('')}
              </div>
            </div>

            <!-- For Professionals -->
            <div>
              <h4 style="font-size:0.875rem; font-weight:700; color:#ffffff; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.05em;">For Professionals</h4>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${['Create Profile', 'Browse Jobs', 'AgriCore Academy', 'Salary Guide', 'Career Insights'].map(l => `
                  <span style="font-size:0.875rem; color:rgba(255,255,255,0.65); cursor:pointer; transition:color 0.15s;" onmouseenter="this.style.color='#4ade80'" onmouseleave="this.style.color='rgba(255,255,255,0.65)'" onclick="window.agriApp.navigateTo('landing')">${l}</span>
                `).join('')}
              </div>
            </div>

            <!-- For Employers -->
            <div>
              <h4 style="font-size:0.875rem; font-weight:700; color:#ffffff; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.05em;">For Employers</h4>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${['Post a Job', 'Search Talent Pool', 'Pricing Plans', 'Recruiting Dashboard', 'AI Matching Engine'].map(l => `
                  <span style="font-size:0.875rem; color:rgba(255,255,255,0.65); cursor:pointer; transition:color 0.15s;" onmouseenter="this.style.color='#4ade80'" onmouseleave="this.style.color='rgba(255,255,255,0.65)'" onclick="window.agriApp.navigateTo('company_dashboard')">${l}</span>
                `).join('')}
              </div>
            </div>

            <!-- Company -->
            <div>
              <h4 style="font-size:0.875rem; font-weight:700; color:#ffffff; margin-bottom:14px; text-transform:uppercase; letter-spacing:0.05em;">Company</h4>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${['About AgriCore', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Supabase Architecture'].map(l => `
                  <span style="font-size:0.875rem; color:rgba(255,255,255,0.65); cursor:pointer; transition:color 0.15s;" onmouseenter="this.style.color='#4ade80'" onmouseleave="this.style.color='rgba(255,255,255,0.65)'">${l}</span>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <p style="font-size:0.8125rem; color:rgba(255,255,255,0.45);">© 2026 AgriCore Platform. All rights reserved. Built with Supabase PostgreSQL.</p>
            <div style="display:flex; gap:16px;">
              <span style="font-size:0.75rem; color:rgba(255,255,255,0.45); cursor:pointer;" onmouseenter="this.style.color='rgba(255,255,255,0.7)'" onmouseleave="this.style.color='rgba(255,255,255,0.45)'">Privacy</span>
              <span style="font-size:0.75rem; color:rgba(255,255,255,0.45); cursor:pointer;" onmouseenter="this.style.color='rgba(255,255,255,0.7)'" onmouseleave="this.style.color='rgba(255,255,255,0.45)'">Terms</span>
              <span style="font-size:0.75rem; color:rgba(255,255,255,0.45); cursor:pointer;" onmouseenter="this.style.color='rgba(255,255,255,0.7)'" onmouseleave="this.style.color='rgba(255,255,255,0.45)'">Sitemap</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  handleHeroSearch() {
    const keyword = document.getElementById('heroKeyword')?.value || '';
    const location = document.getElementById('heroLocation')?.value || 'all';
    const specialization = document.getElementById('heroSpecialization')?.value || 'all';

    this.searchFilters = { keyword, location, specialization };
    this.navigateTo('jobs_search');
  }

  // ---------------------------------------------------------------------------
  // 2. Job Seeker Dashboard View
  // ---------------------------------------------------------------------------
  renderSeekerDashboard() {
    const user = this.currentUser;
    const userName = user?.name || 'Guest';
    const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=User&background=15573b&color=ffffff&size=80`;

    return `
      <div class="dashboard-layout">
        <!-- Sidebar Navigation -->
        ${this.renderSidebar('seeker', 'dashboard')}

        <!-- Main Workspace -->
        <main class="dashboard-main">
          <!-- Topbar -->
          <header class="dashboard-topbar">
            <div class="topbar-search">
              <div class="search-field" style="background:#f1f5f9; padding:6px 14px; border-radius:999px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Search jobs, skills, or companies...">
              </div>
            </div>
            <div class="topbar-user">
              ${user ? `
                <div class="user-avatar-pill" onclick="window.agriApp.navigateTo('candidate_profile')">
                  <img src="${userAvatar}" class="user-avatar-img" alt="${userName}">
                  <div class="user-avatar-info">
                    <h4>${userName}</h4>
                    <p>Job Seeker</p>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="window.agriApp.handleLogout()" title="تسجيل الخروج">خروج</button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="window.agriApp.openAuthModal('login')">تسجيل الدخول</button>
              `}
            </div>
          </header>

          <!-- Dashboard Body -->
          <div class="dashboard-body">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 1.625rem; font-weight:800; color:var(--color-text-main);">Welcome, ${user ? userName : 'Guest'} 👋</h2>
              <p style="color: var(--color-text-muted);">${user ? 'Keep going! Your future in agriculture is growing.' : 'Sign in to access your personalized dashboard.'}</p>
            </div>

            <div class="seeker-dash-grid">
              <!-- Left Column: Completion & Jobs -->
              <div style="display:flex; flex-direction:column; gap: 24px;">
                <!-- Profile Completion Widget -->
                <div class="completion-widget">
                  <div class="progress-ring-container">
                    <svg class="progress-ring" width="80" height="80">
                      <circle class="progress-ring__circle-bg" stroke-width="8" fill="transparent" r="32" cx="40" cy="40"/>
                      <circle class="progress-ring__circle" stroke-width="8" stroke-dasharray="201" stroke-dashoffset="${user ? 40 : 201}" fill="transparent" r="32" cx="40" cy="40"/>
                    </svg>
                    <div class="progress-ring-text">${user ? '40%' : '0%'}</div>
                  </div>
                  <div style="flex:1;">
                    <h3 style="font-size: 1.0625rem; font-weight:700; color:var(--color-brand-950);">Profile Completion</h3>
                    <p style="font-size: 0.875rem; color:var(--color-text-muted); margin-top:2px;">Complete your profile to get better matches and more opportunities.</p>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="window.agriApp.${user ? "navigateTo('candidate_profile')" : "openAuthModal('signup')"}">${user ? 'Complete Profile' : 'Sign Up First'}</button>
                </div>

                <!-- AgriCore Academy Banner -->
                <div class="academy-banner-card" style="background-image: url('assets/images/academy_banner.jpg');">
                  <div class="academy-banner-overlay"></div>
                  <div class="academy-banner-content">
                    <h3 style="font-size: 1.25rem; font-weight:800;">AgriCore Academy</h3>
                    <p style="font-size: 0.875rem; margin: 4px 0 16px; opacity:0.9;">Upgrade your skills, build your future with verified agri certifications.</p>
                    <button class="btn btn-primary btn-sm" onclick="window.agriApp.navigateTo('academy')">Explore Courses</button>
                  </div>
                </div>

                <!-- Recent Jobs Feed -->
                <div class="card" style="padding:0; overflow:hidden;">
                  <div style="padding: 18px 24px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size: 1.0625rem; font-weight:700;">Recent Jobs</h3>
                    <span style="font-size:0.875rem; font-weight:600; color:var(--color-brand-600); cursor:pointer;" onclick="window.agriApp.navigateTo('jobs_search')">View All</span>
                  </div>
                  <div class="job-list-container">
                    ${this.jobs.length === 0 ? `
                      <div style="padding:32px 24px; text-align:center; color:var(--color-text-muted);">
                        <p style="font-size:0.9375rem;">No jobs posted yet. Be the first company to post!</p>
                        <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="window.agriApp.openAuthModal('signup')">Register as a Company</button>
                      </div>
                    ` : this.jobs.slice(0, 5).map(job => `
                      <div class="job-list-card">
                        <div class="job-item-main">
                          <div class="job-item-logo">${job.logo_text}</div>
                          <div class="job-item-info">
                            <h4>${job.title}</h4>
                            <div class="job-item-meta">
                              <span>${job.company}</span>
                              <span>•</span>
                              <span>${job.location}</span>
                              <span>•</span>
                              <span>${job.type}</span>
                            </div>
                          </div>
                        </div>
                        <div style="display:flex; align-items:center; gap: 16px;">
                          <button class="btn btn-primary btn-sm" onclick="window.agriApp.openApplyModal('${job.id}')">
                            ${job.applied ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Right Column: Quick Actions -->
              <div style="display:flex; flex-direction:column; gap: 24px;">
                <!-- Quick Actions Card -->
                <div class="card">
                  <h3 style="font-size: 1rem; font-weight:700; margin-bottom:16px;">Quick Actions</h3>
                  <div style="display:flex; flex-direction:column; gap: 10px;">
                    <button class="btn btn-primary" onclick="window.agriApp.navigateTo('jobs_search')">🔍 Browse All Jobs</button>
                    <button class="btn btn-secondary" onclick="window.agriApp.navigateTo('academy')">🎓 Training & Courses</button>
                    <button class="btn btn-secondary" onclick="window.agriApp.navigateTo('insights')">📊 Market Insights</button>
                  </div>
                </div>

                <!-- Recommended Skills Widget -->
                <div class="card">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="font-size: 1rem; font-weight:700;">Top Skills in Demand</h3>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap: 8px;">
                    <span class="chip chip-active">HACCP</span>
                    <span class="chip chip-active">ISO 22000</span>
                    <span class="chip">Quality Control</span>
                    <span class="chip">GIS & Mapping</span>
                    <span class="chip">English Language</span>
                    <span class="chip">GMP Practices</span>
                    <span class="chip">Farm Management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 3. Jobs Search & Filter View
  // ---------------------------------------------------------------------------
  renderJobsSearchPage() {
    const filteredJobs = this.getFilteredJobs();

    return `
      <div class="dashboard-layout">
        <!-- Sidebar Navigation -->
        ${this.renderSidebar('seeker', 'jobs')}

        <main class="dashboard-main">
          <!-- Topbar -->
          <header class="dashboard-topbar">
            <div class="topbar-search">
              <div class="search-field" style="background:#f1f5f9; padding:6px 14px; border-radius:999px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="jobsSearchInput" placeholder="Search by job title, skill, or keyword..." value="${this.searchFilters.keyword}">
              </div>
            </div>
            <div class="topbar-user">
              <button class="btn btn-primary btn-sm" onclick="window.agriApp.navigateTo('candidate_profile')">My Profile</button>
            </div>
          </header>

          <div class="dashboard-body">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 1.5rem; font-weight:800; color:var(--color-text-main);">Find Your Next Opportunity</h2>
              <p style="color: var(--color-text-muted);">Explore jobs that match your agricultural skills and career goals.</p>
            </div>

            <!-- Filter Controls Row -->
            <div class="card" style="padding: 16px 20px; margin-bottom: 24px;">
              <div style="display:flex; align-items:center; gap: 16px; flex-wrap:wrap;">
                <div class="search-field" style="max-width:240px;">
                  <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); display:block; margin-bottom:4px;">Location</label>
                  <select id="filterLocationSelect" style="padding:8px; border:1px solid var(--color-border); border-radius:var(--radius-sm);">
                    <option value="all" ${this.searchFilters.location === 'all' ? 'selected' : ''}>All Locations</option>
                    <option value="Cairo" ${this.searchFilters.location === 'Cairo' ? 'selected' : ''}>Cairo</option>
                    <option value="Giza" ${this.searchFilters.location === 'Giza' ? 'selected' : ''}>Giza</option>
                    <option value="Fayoum" ${this.searchFilters.location === 'Fayoum' ? 'selected' : ''}>Fayoum</option>
                  </select>
                </div>
                <div class="search-field" style="max-width:260px;">
                  <label style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); display:block; margin-bottom:4px;">Specialization</label>
                  <select id="filterSpecSelect" style="padding:8px; border:1px solid var(--color-border); border-radius:var(--radius-sm);">
                    <option value="all">All Specializations</option>
                    ${specializationsData.map(s => `
                      <option value="${s.name_en}" ${this.searchFilters.specialization === s.name_en ? 'selected' : ''}>${s.name_en}</option>
                    `).join('')}
                  </select>
                </div>
                <div style="display:flex; align-items:flex-end; gap:8px; margin-left:auto;">
                  <button class="btn btn-secondary btn-sm" onclick="window.agriApp.resetFilters()">Reset</button>
                  <button class="btn btn-primary btn-sm" onclick="window.agriApp.applyFilters()">Apply Filters</button>
                </div>
              </div>
            </div>

            <!-- Results Meta Row -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
              <h3 style="font-size: 1rem; font-weight:700; color:var(--color-text-main);">${filteredJobs.length} jobs found</h3>
              <div style="display:flex; align-items:center; gap: 8px; font-size:0.875rem; color:var(--color-text-muted);">
                <span>Sort by:</span>
                <strong style="color:var(--color-brand-700);">Most Relevant</strong>
              </div>
            </div>

            <!-- Job Cards Stream -->
            <div style="display:flex; flex-direction:column; gap: 16px;">
              ${filteredJobs.length === 0 ? `
                <div class="card" style="text-align:center; padding: 48px 24px;">
                  <h4 style="font-size:1.125rem; font-weight:700;">No matching vacancies found</h4>
                  <p style="color:var(--color-text-muted); margin: 8px 0 16px;">Try adjusting your keywords or location filter.</p>
                  <button class="btn btn-primary btn-sm" onclick="window.agriApp.resetFilters()">Clear Filters</button>
                </div>
              ` : filteredJobs.map(job => {
                const match = calculateMatchScore(job, candidatesData[0]);
                return `
                  <div class="card" style="display:flex; align-items:center; justify-content:space-between; padding:20px 24px;">
                    <div style="display:flex; align-items:center; gap: 20px;">
                      <div class="job-item-logo" style="width:52px; height:52px; font-size:1.125rem;">${job.logo_text}</div>
                      <div>
                        <div style="display:flex; align-items:center; gap: 10px;">
                          <h3 style="font-size: 1.125rem; font-weight:700;">${job.title}</h3>
                          <span class="chip" style="font-size:0.75rem; padding:2px 8px;">${job.type}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap: 10px; margin: 4px 0 8px; font-size:0.875rem; color:var(--color-text-muted);">
                          <strong>${job.company}</strong>
                          <span>•</span>
                          <span>${job.location}, Egypt</span>
                          <span>•</span>
                          <span>${job.experience}</span>
                        </div>
                        <p style="font-size:0.875rem; color:var(--color-text-muted);">${job.description}</p>
                      </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap: 12px; flex-shrink:0;">
                      <span class="match-badge ${match >= 85 ? 'high' : 'medium'}">
                        <svg class="match-icon" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        ${match}% match
                      </span>
                      <button class="btn btn-primary btn-sm" onclick="window.agriApp.openApplyModal('${job.id}')">
                        ${job.applied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </main>
      </div>
    `;
  }

  getFilteredJobs() {
    return this.jobs.filter(job => {
      if (this.searchFilters.keyword) {
        const q = this.searchFilters.keyword.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesSkill = (job.skills || []).some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesSkill) return false;
      }
      if (this.searchFilters.location !== 'all') {
        if (job.location.toLowerCase() !== this.searchFilters.location.toLowerCase()) return false;
      }
      if (this.searchFilters.specialization !== 'all') {
        if (!(job.specializations || []).includes(this.searchFilters.specialization)) return false;
      }
      return true;
    });
  }

  applyFilters() {
    const keyword = document.getElementById('jobsSearchInput')?.value || '';
    const location = document.getElementById('filterLocationSelect')?.value || 'all';
    const specialization = document.getElementById('filterSpecSelect')?.value || 'all';
    this.searchFilters = { keyword, location, specialization };
    this.renderCurrentView();
  }

  resetFilters() {
    this.searchFilters = { keyword: '', location: 'all', specialization: 'all' };
    this.renderCurrentView();
  }

  // ---------------------------------------------------------------------------
  // 4. Company Dashboard View (Delta Foods)
  // ---------------------------------------------------------------------------
  renderCompanyDashboard() {
    const candidates = this.candidates;

    return `
      <div class="dashboard-layout">
        <!-- Sidebar Navigation -->
        ${this.renderSidebar('company', 'dashboard')}

        <main class="dashboard-main">
          <!-- Topbar -->
          <header class="dashboard-topbar">
            <div style="display:flex; align-items:center; gap: 12px;">
              <div class="company-logo-badge" style="width:36px; height:36px; font-size:0.875rem;">DF</div>
              <div>
                <h3 style="font-size:0.9375rem; font-weight:800; line-height:1.2;">Delta Foods</h3>
                <p style="font-size:0.75rem; color:var(--color-text-muted);">Food Industry • Cairo, Egypt</p>
              </div>
            </div>
            <div class="topbar-user">
              <button class="btn btn-primary btn-sm" onclick="window.agriApp.openPostJobModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Post a Job
              </button>
              <div class="user-avatar-pill">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" class="user-avatar-img" alt="HR Sarah">
                <div class="user-avatar-info">
                  <h4>Sarah Ahmed</h4>
                  <p>HR Manager</p>
                </div>
              </div>
            </div>
          </header>

          <div class="dashboard-body">
            <!-- Top KPI Cards -->
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px;">
              <div class="kpi-card">
                <span class="kpi-title">Your Active Jobs</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">12</span>
                  <span class="kpi-badge">+2 new</span>
                </div>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Applications</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">248</span>
                  <span class="kpi-badge">+18%</span>
                </div>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Shortlisted</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">32</span>
                  <span class="kpi-badge">+5%</span>
                </div>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Hired</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">8</span>
                  <span class="kpi-badge">+3%</span>
                </div>
              </div>
            </div>

            <!-- Main Content Split -->
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 24px;">
              <!-- Recommended Candidates List -->
              <div class="card" style="padding:0; overflow:hidden;">
                <div style="padding: 18px 24px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
                  <h3 style="font-size: 1.0625rem; font-weight:700;">Recommended Candidates</h3>
                  <span style="font-size:0.875rem; font-weight:600; color:var(--color-brand-600); cursor:pointer;">View All &rarr;</span>
                </div>
                <div>
                  ${candidates.map(cand => `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding: 18px 24px; border-bottom:1px solid var(--color-border-light);">
                      <div style="display:flex; align-items:center; gap: 16px;">
                        <img src="${cand.avatar}" style="width:48px; height:48px; border-radius:999px; object-fit:cover;" alt="${cand.name}">
                        <div>
                          <h4 style="font-size: 1rem; font-weight:700; cursor:pointer;" onclick="window.agriApp.navigateTo('candidate_profile')">${cand.name}</h4>
                          <div style="font-size: 0.8125rem; color:var(--color-text-muted); display:flex; gap:8px;">
                            <span>${cand.title}</span>
                            <span>•</span>
                            <span>${cand.governorate}</span>
                            <span>•</span>
                            <span>${cand.experience_years} Years Exp</span>
                          </div>
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap: 12px;">
                        <span class="match-badge high">${cand.match_score || 95}% match</span>
                        <button class="btn btn-secondary btn-sm" onclick="window.agriApp.navigateTo('candidate_profile')">View Profile</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Post a Job Call-to-Action Card -->
              <div class="card" style="background: linear-gradient(135deg, #0a3824 0%, #15573b 100%); color:#ffffff; display:flex; flex-direction:column; justify-content:space-between; padding:28px;">
                <div>
                  <span class="hero-badge" style="background:rgba(255,255,255,0.15); margin-bottom:16px;">Recruiter Suite</span>
                  <h3 style="font-size: 1.35rem; font-weight:800; line-height:1.3; margin-bottom:12px;">Find the right talent for your team</h3>
                  <p style="font-size: 0.875rem; color: rgba(255,255,255,0.85); line-height:1.6;">Access verified agricultural engineers, lab specialists, and farm managers across Egypt and build a stronger workforce.</p>
                </div>
                <div style="margin-top:24px;">
                  <button class="btn btn-primary btn-lg" style="width:100%;" onclick="window.agriApp.openPostJobModal()">Post a Job</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 5. Candidate Profile View (Dynamic — uses onboarded profile or fallback)
  // ---------------------------------------------------------------------------
  renderCandidateProfile() {
    // Use onboarded profile data if available, otherwise show empty state
    const prof = this.currentCandidateProfile;
    const hasProfile = !!prof;

    if (!hasProfile) {
      return `
        <div class="dashboard-layout">
          ${this.renderSidebar('seeker', 'profile')}
          <main class="dashboard-main">
            <header class="dashboard-topbar">
              <button class="btn btn-secondary btn-sm" onclick="window.agriApp.navigateTo('seeker_dashboard')">&larr; Back to Dashboard</button>
            </header>
            <div class="dashboard-body" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center;">
              <div style="font-size:3rem; margin-bottom:16px;">🌱</div>
              <h2 style="font-size:1.5rem; font-weight:800; color:var(--color-brand-900); margin-bottom:8px;">Your Profile is Empty</h2>
              <p style="color:var(--color-text-muted); max-width:400px; margin-bottom:24px;">Complete the Agricultural Professional onboarding to build your verified career profile and start receiving matched job opportunities.</p>
              <button class="btn btn-primary" onclick="window.agriApp.startProfessionalOnboarding()">
                🌾 Start Building My Profile
              </button>
            </div>
          </main>
        </div>
      `;
    }

    const completionPct = prof.profile_completion_pct || 85;

    return `
      <div class="dashboard-layout">
        <!-- Sidebar Navigation -->
        ${this.renderSidebar('seeker', 'profile')}

        <main class="dashboard-main">
          <!-- Topbar -->
          <header class="dashboard-topbar">
            <button class="btn btn-secondary btn-sm" onclick="window.agriApp.navigateTo('seeker_dashboard')">&larr; Back to Dashboard</button>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-ghost btn-sm" onclick="window.agriApp.startProfessionalOnboarding(1)">✏️ Edit Profile</button>
              <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('https://agricore.eg/u/${prof.agricore_id}').then(()=>alert('Profile link copied!'))">Share Profile</button>
              <button class="btn btn-primary btn-sm" onclick="alert('Downloading CV: ${prof.cv?.fileName || 'CV.pdf'}')">Download CV</button>
            </div>
          </header>

          <div class="dashboard-body">
            <!-- Profile Completion Banner -->
            <div style="background: linear-gradient(135deg, var(--color-brand-900) 0%, var(--color-brand-700) 100%); border-radius:var(--radius-lg); padding:18px 24px; margin-bottom:20px; color:#ffffff; display:flex; align-items:center; justify-content:space-between;">
              <div>
                <div style="font-size:0.875rem; font-weight:600; opacity:0.85; margin-bottom:4px;">Profile Completion</div>
                <div style="font-size:1.5rem; font-weight:800;">${completionPct}% Complete</div>
                <div style="font-size:0.8125rem; opacity:0.75; margin-top:2px;">Add a profile photo to reach 100%</div>
              </div>
              <div style="display:flex; align-items:center; gap:16px;">
                <div style="background:rgba(255,255,255,0.15); border-radius:var(--radius-md); padding:8px 16px; font-size:0.8125rem; font-weight:700;">
                  ID: ${prof.agricore_id}
                </div>
                <button class="btn btn-sm" style="background:#ffffff; color:var(--color-brand-800); font-weight:700;" onclick="window.agriApp.onboardingManager.goToMatches()">
                  View My Matches &rarr;
                </button>
              </div>
            </div>

            <!-- Cover Banner -->
            <div class="profile-cover-banner" style="background: linear-gradient(135deg, #0a3824 0%, #146845 60%, #10b981 100%);"></div>

            <!-- Profile Header Card -->
            <div class="profile-header-card">
              <div class="profile-avatar-row">
                <img src="${prof.avatar}" class="profile-avatar-large" alt="${prof.name}">
                <div style="display:flex; gap:10px;">
                  <button class="btn btn-primary btn-sm" onclick="alert('Downloading CV: ${prof.cv?.fileName || 'CV.pdf'}')">Download CV</button>
                  <button class="btn btn-secondary btn-sm" onclick="window.agriApp.startProfessionalOnboarding(1)">✏️ Edit Profile</button>
                </div>
              </div>
              <div class="profile-title-area">
                <h2>
                  ${prof.name}
                  <span class="verified-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Verified
                  </span>
                </h2>
                <p style="font-size: 1rem; color:var(--color-brand-700); font-weight:600; margin-top:2px;">${prof.title}</p>
                <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:6px; font-size:0.875rem; color:var(--color-text-muted);">
                  <span>📍 ${prof.governorate}, Egypt</span>
                  <span>•</span>
                  <span>⏳ ${prof.experience_years}+ Years Experience</span>
                  <span>•</span>
                  <span>🎓 ${prof.education?.[0]?.university || 'University'}</span>
                </div>
              </div>

              <!-- Profile Navigation Tabs -->
              <div class="nav-tabs" style="margin-top:24px;">
                <button class="tab-btn ${this.activeProfileTab === 'about' ? 'active' : ''}" onclick="window.agriApp.setProfileTab('about')">About</button>
                <button class="tab-btn ${this.activeProfileTab === 'experience' ? 'active' : ''}" onclick="window.agriApp.setProfileTab('experience')">Experience</button>
                <button class="tab-btn ${this.activeProfileTab === 'education' ? 'active' : ''}" onclick="window.agriApp.setProfileTab('education')">Education</button>
                <button class="tab-btn ${this.activeProfileTab === 'skills' ? 'active' : ''}" onclick="window.agriApp.setProfileTab('skills')">Skills</button>
                <button class="tab-btn ${this.activeProfileTab === 'certifications' ? 'active' : ''}" onclick="window.agriApp.setProfileTab('certifications')">Certifications</button>
              </div>
            </div>

            <!-- Profile Details Split -->
            <div class="profile-layout-grid">
              <!-- Left Column: Personal Information -->
              <div class="card" style="height: fit-content;">
                <h3 style="font-size:1.0625rem; font-weight:700; margin-bottom:16px;">Personal Information</h3>
                <div style="display:flex; flex-direction:column; gap: 14px; font-size:0.875rem;">
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Email Address</span>
                    <strong>${prof.email}</strong>
                  </div>
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Phone / WhatsApp</span>
                    <strong>${prof.phone}</strong>
                  </div>
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Location</span>
                    <strong>${prof.governorate}, Egypt</strong>
                  </div>
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Nationality</span>
                    <strong>${prof.nationality || 'Egyptian'}</strong>
                  </div>
                  <div style="margin-top:12px; padding: 12px; background:var(--color-bg); border-radius:var(--radius-md);">
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">AgriCore ID</span>
                    <strong style="color:var(--color-brand-700); font-family:var(--font-mono);">${prof.agricore_id}</strong>
                  </div>
                  <div style="padding-top:12px; border-top:1px solid var(--color-border);">
                    <button class="btn btn-primary" style="width:100%; font-size:0.8125rem;" onclick="window.agriApp.onboardingManager.goToMatches()">
                      🔍 View My Matches
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right Column: Active Tab Content -->
              <div class="card">
                ${this.renderProfileTabContent(prof)}
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  setProfileTab(tabName) {
    this.activeProfileTab = tabName;
    this.renderCurrentView();
  }

  renderProfileTabContent(cand) {
    switch (this.activeProfileTab) {
      case 'about':
        return `
          <div>
            <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:12px;">About Me</h3>
            <p style="color:var(--color-text-muted); line-height:1.7;">${cand.about || 'No summary provided yet.'}</p>
            
            <h3 style="font-size:1.125rem; font-weight:700; margin:24px 0 12px;">Specializations</h3>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${(cand.specializations || []).map(s => `<span class="chip chip-active">${s}</span>`).join('')}
            </div>

            <h3 style="font-size:1.125rem; font-weight:700; margin:24px 0 12px;">Key Skills</h3>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${(cand.skills || []).map(sk => `<span class="chip">${sk}</span>`).join('')}
            </div>
          </div>
        `;
      case 'experience': {
        const exps = cand.experiences || [];
        return `
          <div>
            <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:20px;">Work Experience</h3>
            ${exps.length === 0 ? `
              <div style="text-align:center; padding:32px; color:var(--color-text-muted);">
                <div style="font-size:2rem; margin-bottom:8px;">💼</div>
                <p>No work experience added yet.</p>
                <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="window.agriApp.startProfessionalOnboarding(5)">Add Experience</button>
              </div>
            ` : exps.map(exp => `
              <div class="timeline-item">
                <h4 style="font-size:1rem; font-weight:700;">${exp.role || exp.title || ''}</h4>
                <div style="font-size:0.875rem; color:var(--color-brand-700); font-weight:600; margin:2px 0 6px;">
                  ${exp.company || ''} • <span style="color:var(--color-text-muted);">${exp.period || ''}</span>
                </div>
                ${exp.bullets ? `
                  <ul style="padding-left:18px; color:var(--color-text-muted); font-size:0.875rem; line-height:1.6;">
                    ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
                  </ul>
                ` : exp.desc ? `
                  <p style="color:var(--color-text-muted); font-size:0.875rem; line-height:1.6;">${exp.desc}</p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
      case 'education': {
        const edus = cand.education || [];
        return `
          <div>
            <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:20px;">Educational Qualifications</h3>
            ${edus.map(edu => `
              <div style="padding:16px; border:1px solid var(--color-border); border-radius:var(--radius-md); margin-bottom:12px;">
                <h4 style="font-size:1rem; font-weight:700;">${edu.degree}</h4>
                <p style="color:var(--color-brand-700); font-weight:600; font-size:0.875rem;">
                  ${edu.university}
                  ${edu.faculty ? ` • ${edu.faculty}` : ''}
                  ${edu.department ? ` (${edu.department})` : ''}
                </p>
                <div style="display:flex; gap:12px; font-size:0.8125rem; color:var(--color-text-muted); margin-top:4px;">
                  <span>Graduation: ${edu.years || edu.year}</span>
                  ${edu.grade ? `<span>•</span><span>Grade: ${edu.grade}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      case 'certifications': {
        const certs = cand.certifications || [];
        return `
          <div>
            <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:20px;">Certifications & Training</h3>
            ${certs.length === 0 ? `
              <div style="text-align:center; padding:32px; color:var(--color-text-muted);">
                <div style="font-size:2rem; margin-bottom:8px;">📜</div>
                <p>No certifications added yet.</p>
                <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="window.agriApp.startProfessionalOnboarding(6)">Add Certifications</button>
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${certs.map(cert => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:var(--color-bg); border-radius:var(--radius-md);">
                    <div>
                      <h4 style="font-size:0.9375rem; font-weight:700;">${cert.name}</h4>
                      <p style="font-size:0.8125rem; color:var(--color-text-muted);">${cert.issuer || cert.org || cert.organization || ''} • ${cert.year}</p>
                    </div>
                    <span class="verified-badge">Completed</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      }
      case 'skills':
        return `
          <div>
            <h3 style="font-size:1.125rem; font-weight:700; margin-bottom:16px;">Core Competencies</h3>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${(cand.skills || []).map(sk => `<span class="chip" style="font-size:0.875rem; padding:8px 16px;">${sk}</span>`).join('')}
            </div>
          </div>
        `;
      default:
        return `<p>Content not available.</p>`;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. AgriCore Academy View
  // ---------------------------------------------------------------------------
  renderAcademyPage() {
    return `
      <div class="dashboard-layout">
        ${this.renderSidebar('seeker', 'academy')}

        <main class="dashboard-main">
          <header class="dashboard-topbar">
            <div class="topbar-search">
              <div class="search-field" style="background:#f1f5f9; padding:6px 14px; border-radius:999px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Search for a course or certification...">
              </div>
            </div>
          </header>

          <div class="dashboard-body">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 1.625rem; font-weight:800; color:var(--color-text-main);">AgriCore Academy</h2>
              <p style="color: var(--color-text-muted);">Learn, Develop, and Grow with certified agricultural modules.</p>
            </div>

            <!-- Tabs -->
            <div class="nav-tabs" style="margin-bottom:24px;">
              <button class="tab-btn active">Courses</button>
              <button class="tab-btn">Certifications</button>
              <button class="tab-btn">My Learning</button>
            </div>

            <!-- Course Grid -->
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
              ${academyCoursesData.map(course => `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; padding:24px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                      <span class="chip" style="font-size:0.75rem;">${course.category}</span>
                      <span style="font-size:0.8125rem; font-weight:700; color:#f59e0b;">⭐ ${course.rating}</span>
                    </div>
                    <h3 style="font-size:1.125rem; font-weight:700; line-height:1.3; margin-bottom:6px;">${course.title}</h3>
                    <p style="font-size:0.875rem; color:var(--color-text-muted);">Instructor: ${course.instructor}</p>
                    <div style="display:flex; gap:12px; font-size:0.8125rem; color:var(--color-text-light); margin-top:8px;">
                      <span>⏳ ${course.duration}</span>
                      <span>•</span>
                      <span>👥 ${course.students}</span>
                      <span>•</span>
                      <span>Level: ${course.level}</span>
                    </div>
                  </div>
                  <div style="margin-top:20px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-primary btn-sm" onclick="alert('Enrolled in ${course.title}!')">Enroll Course</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 7. AgriCore Insights & Analytics View
  // ---------------------------------------------------------------------------
  renderInsightsPage() {
    return `
      <div class="dashboard-layout">
        ${this.renderSidebar('seeker', 'insights')}

        <main class="dashboard-main">
          <div class="dashboard-body">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 1.625rem; font-weight:800; color:var(--color-text-main);">AgriCore Insights</h2>
              <p style="color: var(--color-text-muted);">Data-driven intelligence for a stronger, competitive agricultural sector.</p>
            </div>

            <div class="nav-tabs" style="margin-bottom:24px;">
              <button class="tab-btn active">Overview</button>
              <button class="tab-btn">Jobs Analysis</button>
              <button class="tab-btn">Skills Analysis</button>
              <button class="tab-btn">Regional Distribution</button>
            </div>

            <!-- Top Metric Tiles -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px;">
              <div class="kpi-card">
                <span class="kpi-title">Total Registered Talents</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">12,450</span>
                  <span class="kpi-badge">+12%</span>
                </div>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Active Vacancies</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">186</span>
                  <span class="kpi-badge">+8%</span>
                </div>
              </div>
              <div class="kpi-card">
                <span class="kpi-title">Hired Candidates</span>
                <div class="kpi-value-row">
                  <span class="kpi-number">370</span>
                  <span class="kpi-badge">+15%</span>
                </div>
              </div>
            </div>

            <!-- Analytics Charts Container -->
            <div style="display:grid; grid-template-columns: 3fr 2fr; gap: 24px;">
              <!-- Most Demanded Specializations Bar Chart -->
              <div class="card">
                <h3 style="font-size:1.0625rem; font-weight:700; margin-bottom:20px;">Most Demanded Specializations</h3>
                <div style="display:flex; flex-direction:column; gap:16px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:4px;">
                      <span>Food Safety & HACCP</span>
                      <strong>32%</strong>
                    </div>
                    <div style="height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                      <div style="width:32%; height:100%; background:var(--color-brand-600);"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:4px;">
                      <span>Quality Control & Inspection</span>
                      <strong>28%</strong>
                    </div>
                    <div style="height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                      <div style="width:28%; height:100%; background:var(--color-brand-600);"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:4px;">
                      <span>Agricultural Engineering & Irrigation</span>
                      <strong>21%</strong>
                    </div>
                    <div style="height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                      <div style="width:21%; height:100%; background:var(--color-brand-600);"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:4px;">
                      <span>Production & Operations</span>
                      <strong>18%</strong>
                    </div>
                    <div style="height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                      <div style="width:18%; height:100%; background:var(--color-brand-600);"></div>
                    </div>
                  </div>
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:4px;">
                      <span>Agribusiness & Export Management</span>
                      <strong>15%</strong>
                    </div>
                    <div style="height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                      <div style="width:15%; height:100%; background:var(--color-brand-600);"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Top Skills in Demand -->
              <div class="card">
                <h3 style="font-size:1.0625rem; font-weight:700; margin-bottom:16px;">Top Skills in Demand</h3>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                  <span class="chip chip-active">HACCP</span>
                  <span class="chip chip-active">ISO 22000</span>
                  <span class="chip">Microsoft Excel</span>
                  <span class="chip">Quality Control</span>
                  <span class="chip">English Language</span>
                  <span class="chip">GIS & Mapping</span>
                  <span class="chip">Modern Irrigation</span>
                  <span class="chip">GMP Practices</span>
                  <span class="chip">Pest Management</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Reusable Sidebar Template
  // ---------------------------------------------------------------------------
  renderSidebar(role = 'seeker', activeTab = 'dashboard') {
    if (role === 'company') {
      return `
        <aside class="sidebar">
          <div class="sidebar-header">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-brand-400);">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z"></path>
              <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3s-4.5 2-4.5 4.5 2 4.5 4.5 4.5z"></path>
              <path d="M12 12v9"></path>
            </svg>
            <span class="sidebar-brand">AgriCore</span>
          </div>
          <nav class="sidebar-nav">
            <div class="sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}" onclick="window.agriApp.navigateTo('company_dashboard')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard</span>
              </div>
            </div>
            <div class="sidebar-link" onclick="window.agriApp.navigateTo('company_dashboard')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path></svg>
                <span>My Company</span>
              </div>
            </div>
            <div class="sidebar-link" onclick="window.agriApp.navigateTo('jobs_search')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                <span>Jobs</span>
              </div>
            </div>
            <div class="sidebar-link" onclick="window.agriApp.navigateTo('candidate_profile')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                <span>Candidates</span>
              </div>
            </div>
            <div class="sidebar-link" onclick="window.agriApp.navigateTo('company_dashboard')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>Talent Pool</span>
              </div>
            </div>
            <div class="sidebar-link" onclick="alert('Messaging channel open.')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Messages</span>
              </div>
              <span class="sidebar-badge">5</span>
            </div>
            <div class="sidebar-link" onclick="window.agriApp.navigateTo('landing')">
              <div class="sidebar-link-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Settings</span>
              </div>
            </div>
          </nav>
        </aside>
      `;
    }

    // Default: Job Seeker Sidebar
    return `
      <aside class="sidebar">
        <div class="sidebar-header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-brand-400);">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z"></path>
            <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3s-4.5 2-4.5 4.5 2 4.5 4.5 4.5z"></path>
            <path d="M12 12v9"></path>
          </svg>
          <span class="sidebar-brand">AgriCore</span>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}" onclick="window.agriApp.navigateTo('seeker_dashboard')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Dashboard</span>
            </div>
          </div>
          <div class="sidebar-link ${activeTab === 'profile' ? 'active' : ''}" onclick="window.agriApp.navigateTo('candidate_profile')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>My Profile</span>
            </div>
          </div>
          <div class="sidebar-link ${activeTab === 'jobs' ? 'active' : ''}" onclick="window.agriApp.navigateTo('jobs_search')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span>Jobs</span>
            </div>
          </div>
          <div class="sidebar-link ${activeTab === 'academy' ? 'active' : ''}" onclick="window.agriApp.navigateTo('academy')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              <span>Training & Academy</span>
            </div>
          </div>
          <div class="sidebar-link ${activeTab === 'insights' ? 'active' : ''}" onclick="window.agriApp.navigateTo('insights')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>Insights</span>
            </div>
          </div>
          <div class="sidebar-link" onclick="alert('Messaging channel: 3 unread messages from recruiters.')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>Messages</span>
            </div>
            <span class="sidebar-badge">3</span>
          </div>
          <div class="sidebar-link" onclick="window.agriApp.navigateTo('landing')">
            <div class="sidebar-link-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Settings</span>
            </div>
          </div>
        </nav>
      </aside>
    `;
  }

  // ---------------------------------------------------------------------------
  // Modals & User Actions
  // ---------------------------------------------------------------------------
  openApplyModal(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById('applyModal');
    const titleEl = document.getElementById('applyJobTitle');
    const compEl = document.getElementById('applyJobCompany');
    if (modal && titleEl && compEl) {
      titleEl.innerText = job.title;
      compEl.innerText = `${job.company} • ${job.location}`;
      modal.setAttribute('data-target-job-id', jobId);
      modal.classList.add('open');
    }
  }

  submitApplication() {
    const modal = document.getElementById('applyModal');
    const jobId = modal?.getAttribute('data-target-job-id');
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.applied = true;
      alert(`Success! Your verified application has been submitted to ${job.company}. Status: Applied.`);
      this.closeAllModals();
      this.renderCurrentView();
    }
  }

  openPostJobModal() {
    const modal = document.getElementById('postJobModal');
    if (modal) modal.classList.add('open');
  }

  submitNewJob() {
    const title = document.getElementById('newJobTitle')?.value;
    const location = document.getElementById('newJobLocation')?.value || 'Cairo';
    const minExp = parseInt(document.getElementById('newJobExp')?.value || '1');
    const spec = document.getElementById('newJobSpec')?.value || 'Quality Control';

    if (!title) {
      alert('Please enter a job title');
      return;
    }

    const newJob = {
      id: 'job-' + (this.jobs.length + 1),
      title,
      company: 'Delta Foods',
      logo_text: 'DF',
      sector: 'Food Industry',
      location,
      city: 'Industrial Zone',
      type: 'Full Time',
      experience: `${minExp}-${minExp + 2} Years`,
      min_exp: minExp,
      max_exp: minExp + 2,
      min_edu: 'bachelor',
      specializations: [spec],
      skills: ['Quality Control', 'Food Safety', 'HACCP'],
      match_score: 91,
      description: 'Newly posted agricultural opportunity directly via Delta Foods recruiter console.',
      created_at: 'Just now',
      applied: false
    };

    this.jobs.unshift(newJob);
    alert(`Success! Vacancy "${title}" is now published and active on AgriCore.`);
    this.closeAllModals();
    this.renderCurrentView();
  }

  openSqlModal() {
    const modal = document.getElementById('sqlViewerModal');
    if (modal) modal.classList.add('open');
  }

  // ---------------------------------------------------------------------------
  // Auth Modal Handlers
  // ---------------------------------------------------------------------------
  openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('open');
      this.switchAuthTab(tab);
    }
  }

  switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signUpForm = document.getElementById('signUpForm');
    const loginBtn = document.getElementById('tabLoginBtn');
    const signupBtn = document.getElementById('tabSignUpBtn');
    const alert = document.getElementById('authAlert');
    const notice = document.getElementById('emailVerifyNotice');

    if (!loginForm || !signUpForm) return;

    if (alert) { alert.style.display = 'none'; alert.textContent = ''; }
    if (notice) { notice.style.display = 'none'; notice.innerHTML = ''; }

    if (tab === 'login') {
      loginForm.style.display = '';
      signUpForm.style.display = 'none';
      loginBtn?.classList.add('active');
      signupBtn?.classList.remove('active');
    } else {
      loginForm.style.display = 'none';
      signUpForm.style.display = '';
      loginBtn?.classList.remove('active');
      signupBtn?.classList.add('active');
    }
  }

  selectSignupRole(role) {
    this._signupRole = role;
    const seekerBtn = document.getElementById('roleSeekerBtn');
    const companyBtn = document.getElementById('roleCompanyBtn');
    const seekerFields = document.getElementById('seekerExtraFields');
    const companyFields = document.getElementById('companyExtraFields');

    if (role === 'company') {
      companyBtn?.classList.replace('btn-secondary', 'btn-primary');
      seekerBtn?.classList.replace('btn-primary', 'btn-secondary');
      if (companyFields) companyFields.style.display = '';
      if (seekerFields) seekerFields.style.display = 'none';
    } else {
      seekerBtn?.classList.replace('btn-secondary', 'btn-primary');
      companyBtn?.classList.replace('btn-primary', 'btn-secondary');
      if (seekerFields) seekerFields.style.display = '';
      if (companyFields) companyFields.style.display = 'none';
    }
  }

  showAuthAlert(msg, type = 'error', highlightFieldId = null) {
    const alert = document.getElementById('authAlert');
    if (!alert) return;
    alert.dataset.type = type;
    alert.innerHTML = msg;
    alert.style.display = 'block';

    // Remove any existing shake
    alert.classList.remove('auth-alert-shake');
    void alert.offsetWidth; // trigger reflow

    if (type === 'error') {
      alert.style.background = '#fef2f2';
      alert.style.color = '#991b1b';
      alert.style.border = '1px solid #f87171';
      alert.classList.add('auth-alert-shake');
      if (highlightFieldId) {
        const field = document.getElementById(highlightFieldId);
        if (field) {
          field.classList.add('input-error');
          field.focus();
        }
      }
    } else {
      alert.style.background = '#f0fdf4';
      alert.style.color = '#166534';
      alert.style.border = '1px solid #86efac';
    }

    // Ensure alert is visible within the modal dialog
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async handleLogin() {
    console.log('[Login] Handling login request...');
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const btn = document.getElementById('loginSubmitBtn');

    if (!email || !password) {
      this.showAuthAlert('يرجى إدخال البريد الإلكتروني وكلمة المرور.', 'error', !email ? 'loginEmail' : 'loginPassword');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> جاري التحقق...';

    try {
      const session = await supabaseBridge.signIn({ email, password });
      // Store current user info
      if (session?.user) {
        this.currentUser = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.user_metadata?.full_name || 'U')}&background=15573b&color=ffffff&size=80`,
          userType: session.user.user_metadata?.user_type || 'professional'
        };
      }
      this.showAuthAlert(`مرحباً! جاري تحميل لوحة التحكم...`, 'success');
      setTimeout(() => {
        this.closeAllModals();
        this.navigateTo('seeker_dashboard');
      }, 1000);
    } catch (err) {
      console.error('[Login] Login error:', err);
      this.showAuthAlert(`فشل تسجيل الدخول: ${err.message}`, 'error');
      btn.disabled = false;
      btn.textContent = 'دخول إلى المنصة';
    }
  }

  async handleLogout() {
    await supabaseBridge.signOut();
    this.currentUser = null;
    this.navigateTo('landing');
  }

  async handleSignUp() {
    console.log('[SignUp] 1. Button click / submission handling started');

    const fullNameInput = document.getElementById('regFullName');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const companyNameInput = document.getElementById('regCompanyName');
    const btn = document.getElementById('signUpSubmitBtn');

    // Reset error states on all inputs
    document.querySelectorAll('#signUpForm .input-error').forEach(el => el.classList.remove('input-error'));

    const fullName = fullNameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const password = passwordInput?.value || '';
    const governorate = document.getElementById('regGovernorate')?.value || 'Cairo';
    const phone = document.getElementById('regPhone')?.value?.trim() || '';
    const userType = this._signupRole || 'professional';
    const title = document.getElementById('regTitle')?.value?.trim() || '';
    const companyName = companyNameInput?.value?.trim() || '';
    const businessSector = document.getElementById('regBusinessSector')?.value || 'Food Industry';

    console.log('[SignUp] 3. Validating inputs...', {
      userType,
      hasFullName: !!fullName,
      email,
      hasPassword: !!password,
      passwordLength: password ? password.length : 0,
      governorate,
      hasPhone: !!phone
    });

    // --- Validation (with visible feedback and field highlighting) ---
    if (!fullName) {
      console.warn('[SignUp] 3. Validation FAILED: Full Name is required.');
      this.showAuthAlert('⚠️ يرجى إدخال الاسم بالكامل (Full Name).', 'error', 'regFullName');
      return;
    }

    if (userType === 'company' && !companyName) {
      console.warn('[SignUp] 3. Validation FAILED: Company Name is required for company accounts.');
      this.showAuthAlert('⚠️ يرجى إدخال اسم المنشأة / الشركة (Company Name).', 'error', 'regCompanyName');
      return;
    }

    if (!email) {
      console.warn('[SignUp] 3. Validation FAILED: Email is required.');
      this.showAuthAlert('⚠️ يرجى إدخال البريد الإلكتروني (Email).', 'error', 'regEmail');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      console.warn('[SignUp] 3. Validation FAILED: Email format invalid:', email);
      this.showAuthAlert('⚠️ صيغة البريد الإلكتروني غير صحيحة (مثال: user@gmail.com).', 'error', 'regEmail');
      return;
    }

    if (!password || password.length < 6) {
      console.warn('[SignUp] 3. Validation FAILED: Password too short.');
      this.showAuthAlert('⚠️ كلمة المرور يجب أن تكون 6 خانات على الأقل.', 'error', 'regPassword');
      return;
    }

    console.log('[SignUp] 3. Validation PASSED ✅ Proceeding to Supabase signUp call...');

    // 10: Visible User Feedback - Loading State with Animated Spinner
    const originalBtnHTML = btn ? btn.innerHTML : '<span id="signUpSubmitBtnText">تأكيد وإنشاء الحساب (Sign Up)</span>';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span> جاري إنشاء حسابك في AgriCore...';
    }

    try {
      console.log('[SignUp] 4. Executing supabase.auth.signUp()...');
      const result = await supabaseBridge.auth.signUp({
        email,
        password,
        fullName,
        userType,
        governorate,
        phone,
        title,
        companyName,
        businessSector
      });

      console.log('[SignUp] 5. Supabase signUp Success Response:', result);

      const userId = result.user?.id || result.id;
      const hasAccessToken = !!(result.access_token || result.session?.access_token);
      const isEmailConfirmationRequired = !hasAccessToken;

      // 9: Detailed Logging for Post-Signup Flow
      console.log('[PostSignUp Flow] 9. Investigation Report:', {
        userId,
        email: result.user?.email || result.email || email,
        hasAccessToken,
        sessionPresent: !!(result.session || result.access_token),
        confirmationSentAt: result.confirmation_sent_at || result.user?.confirmation_sent_at || null,
        isEmailConfirmationRequired
      });

      // 6 & 7: Verify profile creation in PostgreSQL database
      console.log('[PostSignUp Flow] 6 & 7. Verifying profile creation and RLS...');
      const profile = await supabaseBridge.checkProfileExists(userId);
      console.log('[PostSignUp Flow] Profile record in database:', profile ? 'EXISTS in Postgres ✅' : 'PENDING/NOT_FOUND');

      // Check whether email confirmation is enabled or disabled
      if (!isEmailConfirmationRequired) {
        // Step 3: If email confirmation is disabled -> Log in immediately & redirect
        console.log('[PostSignUp Flow] 3. Email confirmation is DISABLED. Creating session & logging in...');
        const sessionData = result.session || result;
        supabaseBridge.saveSession(sessionData);

        await this.syncCurrentUserFromSession(sessionData);

        const targetDashboard = userType === 'company' ? 'company_dashboard' : 'seeker_dashboard';
        console.log(`[PostSignUp Flow] 8. Executing redirect to: ${targetDashboard}`);

        this.showAuthAlert('🎉 تم إنشاء حسابك وتسجيل الدخول بنجاح! جاري التوجيه إلى لوحة التحكم...', 'success');

        setTimeout(() => {
          this.closeAllModals();
          this.navigateTo(targetDashboard);
        }, 1200);

      } else {
        // Step 2: If email confirmation is enabled -> Show prominent verification UI
        console.log('[PostSignUp Flow] 1 & 2. Email confirmation is ENABLED in Supabase Auth. Rendering clear verification screen.');

        if (passwordInput) passwordInput.value = '';
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalBtnHTML;
        }

        this.renderEmailVerificationNotice({
          email,
          fullName,
          userType,
          userId,
          profileCreated: !!profile
        });
      }

    } catch (err) {
      console.error('[SignUp] 6. Supabase signUp Error Response:', err);

      let msg = err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.';

      // Translate common Supabase error messages to friendly Arabic
      const lower = msg.toLowerCase();
      if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('user already registered')) {
        msg = '⚠️ هذا البريد الإلكتروني مسجل بالفعل. يمكنك التبديل إلى "تسجيل الدخول".';
      } else if (lower.includes('rate limit') || lower.includes('429') || lower.includes('too many requests')) {
        msg = `⏳ <strong>تم تجاوز الحد المسموح لإرسال إيميلات التأكيد في Supabase (Rate Limit).</strong><br>
        يقوم خادم Supabase في الخطة المجانية بالسماح بعدد 3 إلى 4 إيميلات تأكيد فقط في الساعة.<br><br>
        <strong>⚡ الحل الفوري والتلقائي:</strong><br>
        افتح لوحة تحكم <strong>Supabase</strong> الخاصة بالمشروع وعطّل خيار تأكيد الإيميل:<br>
        <span style="direction:ltr; display:inline-block; font-family:monospace; background:#fee2e2; padding:3px 8px; border-radius:6px; margin:6px 0; font-size:0.8rem; font-weight:700;">
          Authentication &gt; Providers &gt; Email &gt; Confirm email: [OFF]
        </span><br>
        بمجرد إيقافه، سيعمل التسجيل فوراً وسيتم توجيهك مباشرة إلى لوحة التحكم دون إرسال إيميل ودون مواجهة أي Rate Limit!`;
      } else if (lower.includes('invalid email') || lower.includes('email_address_invalid')) {
        msg = '⚠️ البريد الإلكتروني غير صالح أو غير معتمد. استخدم بريداً حقيقياً (مثل Gmail أو Outlook).';
      } else if (lower.includes('weak password') || lower.includes('password should be at least')) {
        msg = '⚠️ كلمة المرور ضعيفة. يجب أن تحتوي على 6 خانات على الأقل تشمل أرقاماً وحروفاً.';
      } else if (lower.includes('network') || lower.includes('failed to fetch')) {
        msg = '⚠️ تعذر الاتصال بخادم Supabase. تحقق من اتصالك بالإنترنت.';
      }

      this.showAuthAlert(msg, 'error');

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
      }
    }
  }

  async syncCurrentUserFromSession(session) {
    if (!session) return;
    const user = session.user || session;
    const metadata = user.user_metadata || {};

    // 6 & 7: Check profile creation in Postgres database
    let profile = null;
    if (user.id) {
      profile = await supabaseBridge.checkProfileExists(user.id);
    }

    const fullName = profile?.full_name || metadata.full_name || user.email?.split('@')[0] || 'User';
    const userType = profile?.user_type || metadata.user_type || this._signupRole || 'professional';

    this.currentUser = {
      id: user.id,
      name: fullName,
      email: user.email,
      avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=15573b&color=ffffff&size=80`,
      userType: userType,
      profile: profile
    };

    console.log('[App Controller] 3 & 4. Current user synchronized from session:', this.currentUser);
    this.renderCurrentView();
  }

  prefillLoginEmail(email) {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput && email) {
      emailInput.value = email;
      setTimeout(() => passwordInput?.focus(), 150);
    }
  }

  async handleResendVerification(email) {
    const btn = document.getElementById('resendEmailBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ جاري إعادة الإرسال...';
    }

    try {
      await supabaseBridge.auth.resend({ type: 'signup', email });
      this.showAuthAlert(`✅ تم إعادة إرسال رابط التأكيد بنجاح إلى: ${email}`, 'success');
      if (btn) {
        btn.textContent = '✅ تم الإرسال!';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '🔄 إعادة إرسال رابط التأكيد مرة أخرى';
        }, 60000);
      }
    } catch (err) {
      const msg = err.message || 'فشل إعادة الإرسال.';
      this.showAuthAlert(`⚠️ ${msg}`, 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🔄 إعادة إرسال رابط التأكيد';
      }
    }
  }

  renderEmailVerificationNotice({ email, fullName, userType, userId, profileCreated }) {
    const signUpForm = document.getElementById('signUpForm');
    const loginForm = document.getElementById('loginForm');
    const alert = document.getElementById('authAlert');
    const notice = document.getElementById('emailVerifyNotice');

    if (signUpForm) signUpForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'none';
    if (alert) alert.style.display = 'none';

    if (!notice) return;

    notice.style.display = 'block';
    notice.innerHTML = `
      <div style="background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); border: 1px solid #bbf7d0; border-radius: 16px; padding: 26px 18px; box-shadow: 0 4px 12px rgba(22, 101, 52, 0.08);">
        <div style="width: 64px; height: 64px; margin: 0 auto 16px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; box-shadow: 0 0 0 6px #f0fdf4;">
          ✉️
        </div>

        <h3 style="font-size: 1.25rem; font-weight: 800; color: #14532d; margin-bottom: 6px;">
          تأكيد البريد الإلكتروني مطلوب
        </h3>
        <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 14px;">
          Email Confirmation Required
        </p>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; margin-bottom: 18px; word-break: break-all;">
          <span style="font-size: 0.8125rem; color: #6b7280; display: block; margin-bottom: 4px;">تم إرسال رابط التفعيل إلى:</span>
          <strong style="color: #065f46; font-size: 1.05rem;">${email}</strong>
        </div>

        <div style="text-align: right; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 0.875rem; line-height: 1.6; color: #334155;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
            📌 الخطوات التالية لإتمام الدخول:
          </div>
          <ol style="padding-inline-start: 20px; margin: 0;">
            <li>افتح صندوق الوارد أو مجلد <em>Spam / Junk</em> في بريدك.</li>
            <li>اضغط على رابط التأكيد في رسالة Supabase لتفعيل الحساب.</li>
            <li>بعد الضغط على الرابط، انقر على زر <strong>تسجيل الدخول</strong> أدناه.</li>
          </ol>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button type="button" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700;" onclick="window.agriApp.switchAuthTab('login'); window.agriApp.prefillLoginEmail('${email}');">
            🔑 الانتقال لتسجيل الدخول بعد التأكيد (Go to Login)
          </button>
          <button type="button" id="resendEmailBtn" class="btn btn-secondary btn-sm" style="width: 100%;" onclick="window.agriApp.handleResendVerification('${email}');">
            🔄 إعادة إرسال رابط التأكيد (Resend Email)
          </button>
        </div>

        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 0.75rem; color: #64748b; line-height: 1.5; text-align: right;">
          💡 <strong>معلومة للمطور / Admin:</strong> إذا أردت تسجيل الدخول المباشر فوراً دون انتظار رسالة التأكيد، يمكنك إيقاف خيار <code>Confirm email</code> من لوحة تحكم Supabase:<br>
          <span style="direction: ltr; display: inline-block; font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">Supabase Dashboard > Authentication > Providers > Email > Confirm email: OFF</span>
        </div>
      </div>
    `;
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }

  bindLandingEvents() {}
  bindSeekerEvents() {}
  bindJobsSearchEvents() {
    const searchInput = document.getElementById('jobsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchFilters.keyword = e.target.value;
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.applyFilters();
      });
    }
  }
  bindCompanyEvents() {}
  bindCandidateProfileEvents() {}
  bindAcademyEvents() {}

  // ---------------------------------------------------------------------------
  // Professional Onboarding Entry Points
  // ---------------------------------------------------------------------------
  startProfessionalOnboarding(step = 1) {
    if (step === 1) {
      // Reset onboarding for fresh start
      this.onboardingManager.currentStep = 1;
      this.onboardingManager.isCompleted = false;
    } else {
      // Jump directly to a specific step for editing
      this.onboardingManager.currentStep = step;
      this.onboardingManager.isCompleted = false;
    }
    this.navigateTo('professional_onboarding');
  }
}

// Instantiate and expose globally
window.agriApp = new AgriCoreApp();

// Also expose onboarding instance globally after app is ready
Object.defineProperty(window, 'agriOnboarding', {
  get() { return window.agriApp?.onboardingManager; }
});
