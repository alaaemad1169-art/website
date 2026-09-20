// =============================================================================
// AgriCore Live Supabase Client Bridge
// Production Auth, Session Management & REST integration
// =============================================================================

export const SUPABASE_CONFIG = {
  url: (typeof window !== 'undefined' && (window.ENV?.SUPABASE_URL || window.__ENV__?.SUPABASE_URL)) || "https://pwlonqrutxbpjiebbpug.supabase.co",
  anonKey: (typeof window !== 'undefined' && (window.ENV?.SUPABASE_ANON_KEY || window.__ENV__?.SUPABASE_ANON_KEY)) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bG9ucXJ1dHhicGppZWJicHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDIxNjQsImV4cCI6MjEwNDM3ODE2NH0.AA7cjMveKEQu1SytpkYBQnEBCf8-oS2hipv5IGcojDI",
  status: "live_connected"
};

export class AgriCoreSupabaseClient {
  constructor(config = SUPABASE_CONFIG) {
    // Step 7: Environment variables verification
    const envUrl = (typeof window !== 'undefined' && (window.ENV?.SUPABASE_URL || window.__ENV__?.SUPABASE_URL)) || null;
    const envKey = (typeof window !== 'undefined' && (window.ENV?.SUPABASE_ANON_KEY || window.__ENV__?.SUPABASE_ANON_KEY)) || null;

    this.url = envUrl || config.url;
    this.anonKey = envKey || config.anonKey;
    this.session = this.loadStoredSession();

    console.log('[Supabase] Initializing client:', {
      url: this.url,
      hasAnonKey: !!this.anonKey,
      anonKeyLength: this.anonKey?.length || 0,
      source: envUrl ? 'environment_variables (window.ENV)' : 'bundled_config'
    });

    if (!this.url || !this.anonKey) {
      console.error('[Supabase] CRITICAL: Supabase URL or Anon Key is missing! Check your configuration.');
    }

    // Step 4 & 5: Auth State Change Listeners
    this._authListeners = [];

    // Step 6: Expose standard supabase.auth API compatibility
    this.auth = {
      signUp: async (options) => {
        console.log('[Supabase] auth.signUp() invoked with options:', options);
        if (options.options?.data) {
          const meta = options.options.data;
          return this.signUp({
            email: options.email,
            password: options.password,
            fullName: meta.full_name || meta.fullName,
            userType: meta.user_type || meta.userType || 'professional',
            governorate: meta.governorate,
            phone: meta.phone_number || meta.phone,
            title: meta.professional_title || meta.title,
            companyName: meta.company_name || meta.companyName,
            businessSector: meta.business_sector || meta.businessSector
          });
        }
        return this.signUp(options);
      },
      signInWithPassword: async ({ email, password }) => this.signIn({ email, password }),
      signOut: async () => this.signOut(),
      getUser: () => this.session?.user || null,
      getSession: () => this.session,
      resend: async ({ type = 'signup', email }) => this.resendVerificationEmail({ type, email }),
      onAuthStateChange: (callback) => {
        console.log('[Supabase AuthState] Registered new onAuthStateChange listener');
        if (typeof callback === 'function') {
          this._authListeners.push(callback);
          try {
            callback('INITIAL_SESSION', this.session);
          } catch (e) {
            console.error('[Supabase AuthState] Error in initial callback:', e);
          }
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                this._authListeners = this._authListeners.filter(cb => cb !== callback);
              }
            }
          }
        };
      }
    };
  }

  getHeaders(useAuth = false) {
    const headers = {
      "apikey": this.anonKey,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };

    if (useAuth && this.session?.access_token) {
      headers["Authorization"] = `Bearer ${this.session.access_token}`;
    } else {
      headers["Authorization"] = `Bearer ${this.anonKey}`;
    }

    return headers;
  }

  loadStoredSession() {
    try {
      const stored = localStorage.getItem("agricore_supabase_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  saveSession(sessionData) {
    this.session = sessionData;
    if (sessionData) {
      localStorage.setItem("agricore_supabase_session", JSON.stringify(sessionData));
    } else {
      localStorage.removeItem("agricore_supabase_session");
    }
    this._notifyAuthState(sessionData ? 'SIGNED_IN' : 'SIGNED_OUT', sessionData);
  }

  _notifyAuthState(event, session) {
    console.log(`[Supabase AuthState] 4 & 5. Auth state changed: ${event}`, {
      hasSession: !!session,
      userId: session?.user?.id || session?.id || null,
      email: session?.user?.email || session?.email || null
    });
    this._authListeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (err) {
        console.error('[Supabase AuthState] Error executing listener callback:', err);
      }
    });
  }

  async resendVerificationEmail({ type = 'signup', email }) {
    const endpoint = `${this.url}/auth/v1/resend`;
    console.log('[Supabase Auth] 2. Resending verification email to:', email);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ type, email: email.trim() })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.msg || data.message || data.error_description || "فشل إعادة إرسال رابط التأكيد";
      console.warn('[Supabase Auth] Resend failed:', msg);
      throw new Error(msg);
    }
    console.log('[Supabase Auth] Verification email resent successfully!');
    return data;
  }

  async checkProfileExists(userId) {
    console.log('[Supabase Profile] 6 & 7. Checking profile record in database for userId:', userId);
    try {
      const res = await fetch(`${this.url}/rest/v1/profiles?id=eq.${userId}&select=*,professional_profiles(*),company_profiles(*)`, {
        headers: this.getHeaders(false)
      });
      const rows = await res.json();
      const profile = rows && rows.length > 0 ? rows[0] : null;
      console.log('[Supabase Profile] 6. Profile query result:', {
        exists: !!profile,
        userType: profile?.user_type,
        fullName: profile?.full_name
      });
      return profile;
    } catch (err) {
      console.error('[Supabase Profile] 7. Error checking profile in database:', err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Real Supabase Auth: Sign Up
  // ---------------------------------------------------------------------------
  async signUp({ email, password, fullName, userType, governorate, phone, title, companyName, businessSector }) {
    const endpoint = `${this.url}/auth/v1/signup`;
    const metadata = {
      full_name: fullName,
      user_type: userType,
      governorate: governorate || "Cairo",
      phone_number: phone || ""
    };

    if (userType === 'company') {
      metadata.company_name = companyName || fullName;
      metadata.business_sector = businessSector || "Agribusiness";
    } else {
      metadata.professional_title = title || "Agricultural Engineer";
    }

    const payload = {
      email: email.trim(),
      password: password,
      data: metadata
    };

    console.log('[Supabase Network] 8. Sending POST request to:', endpoint);
    console.log('[Supabase Network] Payload metadata:', metadata);

    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: this.getHeaders(false),
        body: JSON.stringify(payload)
      });
    } catch (fetchErr) {
      console.error('[Supabase Network] Fetch error (network failed):', fetchErr);
      throw new Error(`Network request failed: ${fetchErr.message}`);
    }

    console.log('[Supabase Network] Received HTTP status:', res.status, res.statusText);

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error('[Supabase Network] Failed to parse JSON response:', parseErr);
      throw new Error('Invalid JSON response from auth server');
    }

    if (!res.ok) {
      const errMsg = data.msg || data.message || data.error_description || "فشل إنشاء الحساب";
      console.error('[Supabase Network] Auth error returned from Supabase:', { status: res.status, data });
      throw new Error(errMsg);
    }

    console.log('[Supabase Network] Sign up success! Response data:', data);

    // If auto-confirmed or session returned
    if (data.access_token) {
      this.saveSession(data);
    }

    return data;
  }

  // ---------------------------------------------------------------------------
  // Real Supabase Auth: Sign In
  // ---------------------------------------------------------------------------
  async signIn({ email, password }) {
    const endpoint = `${this.url}/auth/v1/token?grant_type=password`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({
        email: email.trim(),
        password: password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error_description || data.msg || data.message || "بيانات الدخول غير صحيحة";
      throw new Error(errMsg);
    }

    this.saveSession(data);
    return data;
  }

  // ---------------------------------------------------------------------------
  // Real Supabase Auth: Sign Out
  // ---------------------------------------------------------------------------
  async signOut() {
    if (this.session?.access_token) {
      try {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: "POST",
          headers: this.getHeaders(true)
        });
      } catch (err) {
        console.warn("Logout error:", err);
      }
    }
    this.saveSession(null);
  }

  // ---------------------------------------------------------------------------
  // User Profile Loader
  // ---------------------------------------------------------------------------
  async getCurrentUserProfile() {
    if (!this.session?.user?.id) return null;
    const userId = this.session.user.id;

    try {
      const res = await fetch(`${this.url}/rest/v1/profiles?id=eq.${userId}&select=*,professional_profiles(*),company_profiles(*)`, {
        headers: this.getHeaders(true)
      });
      const rows = await res.json();
      return rows && rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error("Error loading user profile:", err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Taxonomies & Jobs Queries
  // ---------------------------------------------------------------------------
  async getSpecializations() {
    try {
      const res = await fetch(`${this.url}/rest/v1/specializations?is_active=eq.true&select=*&order=name_en.asc`, {
        headers: this.getHeaders(false)
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async getSkills() {
    try {
      const res = await fetch(`${this.url}/rest/v1/skills?is_active=eq.true&select=*&order=name_en.asc`, {
        headers: this.getHeaders(false)
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async getJobs() {
    try {
      const res = await fetch(`${this.url}/rest/v1/jobs?status=eq.active&select=*,company_profiles(*),job_skills(*,skills(*)),job_specializations(*,specializations(*))&order=created_at.desc`, {
        headers: this.getHeaders(false)
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async createJob(jobData) {
    const res = await fetch(`${this.url}/rest/v1/jobs`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(jobData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to publish job");
    }
    return await res.json();
  }

  async applyToJob(applicationData) {
    const res = await fetch(`${this.url}/rest/v1/applications`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(applicationData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to submit application");
    }
    return await res.json();
  }

  async applyForJob(jobId, coverNote = '') {
    return this.applyToJob({
      job_id: jobId,
      cover_note: coverNote,
      status: 'applied',
      applied_at: new Date().toISOString()
    });
  }
}

export const supabaseBridge = new AgriCoreSupabaseClient();

// Expose globally for console debugging and external integrations
if (typeof window !== 'undefined') {
  window.supabaseBridge = supabaseBridge;
  window.supabase = supabaseBridge;
}
