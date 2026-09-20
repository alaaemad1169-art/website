const fs = require('fs');
let code = fs.readFileSync('e:/website/js/app.js', 'utf8');

// 1. Landing Page string replacements
code = code.replace(/Explore thousands of agri-related opportunities/g, 'Browse agricultural opportunities');
code = code.replace(/Join 12,450\+ agricultural professionals and 150\+ companies already on AgriCore\. Start building your verified career profile today — it's free\./g, "Start building your career profile today — it's free.");
code = code.replace(/<div class="metric-number" id="metricTalents">—<\/div>/g, '<div class="metric-number" id="metricTalents">0</div>');
code = code.replace(/<div class="metric-number" id="metricJobs">—<\/div>/g, '<div class="metric-number" id="metricJobs">0</div>');
code = code.replace(/<div class="metric-number" id="metricCompanies">—<\/div>/g, '<div class="metric-number" id="metricCompanies">0</div>');
code = code.replace(/\$\{academyCoursesData\.length\}\+/g, '0');

// Remove Testimonials
code = code.replace(/<!-- ============================================================\s*Testimonials Section\s*============================================================ -->[\s\S]*?<!-- ============================================================\s*CTA Banner\s*============================================================ -->/g, '<!-- ============================================================\n           CTA Banner\n           ============================================================ -->');

// In Featured Jobs Ticker, change jobsData.slice(0, 3) to this.jobs.slice(0, 3) and add empty state
code = code.replace(/\$\{jobsData\.slice\(0, 3\)\.map\(job => `/g, '${this.jobs.length === 0 ? `<div style="grid-column:1/-1; text-align:center; padding:40px; background:#fafffe; border:1px solid var(--color-border); border-radius:var(--radius-lg);">لا توجد وظائف منشورة حاليًا. سيتم عرض البيانات هنا عند توفرها.</div>` : this.jobs.slice(0, 3).map(job => `');

// Remove 'AI Matching Engine'
code = code.replace(/'Post a Job', 'Search Talent Pool', 'Pricing Plans', 'Recruiting Dashboard', 'AI Matching Engine'/g, "'Post a Job', 'Search Talent Pool', 'Pricing Plans', 'Recruiting Dashboard'");

// 2. Landing Metrics update
code = code.replace(/if \(jobsEl\) jobsEl\.textContent = this\.jobs\.length > 0 \? `\$\{this\.jobs\.length\}\+` : `\$\{jobsData\.length\}\+`;/g, 'if (jobsEl) jobsEl.textContent = `${this.jobs.length}`;');
code = code.replace(/if \(companiesEl\) companiesEl\.textContent = uniqueCompanies > 0 \? `\$\{uniqueCompanies\}\+` : `\$\{companiesData\.length\}\+`;/g, 'if (companiesEl) companiesEl.textContent = `${uniqueCompanies}`;');
code = code.replace(/if \(talentsEl\) talentsEl\.textContent = '12,450\+';/g, "if (talentsEl) talentsEl.textContent = '0';");

// 3. Jobs Search View empty state
code = code.replace(/const filteredJobs = this\.jobs\.length > 0 \? this\.jobs : jobsData;/g, 'const filteredJobs = this.jobs;');

// Replace the fallback empty state string in jobs search
code = code.replace(/\$\{filteredJobs\.length === 0 \? `[\s\S]*?` : filteredJobs\.map\(job => \{/g, '${filteredJobs.length === 0 ? `\n<div style="text-align:center; padding:40px; background:#fff; border:1px solid var(--color-border); border-radius:var(--radius-lg); grid-column:1/-1;">لا توجد وظائف منشورة حاليًا تطابق بحثك. سيتم عرض البيانات هنا عند توفرها.</div>\n` : filteredJobs.map(job => {');

// 4. Disable fake buttons in app.js
// "Download CV" in candidate profile
code = code.replace(/<button class="btn btn-secondary btn-sm" style="flex:1; justify-content:center;" onclick="alert\('Downloading CV...'\)">/g, '<button class="btn btn-secondary btn-sm" style="flex:1; justify-content:center;" disabled>غير متاح حاليًا');
code = code.replace(/<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"><\/path><polyline points="7 10 12 15 17 10"><\/polyline><line x1="12" y1="15" x2="12" y2="3"><\/line><\/svg>\s*Download CV/g, '');

// "Message" in candidate profile
code = code.replace(/<button class="btn btn-primary btn-sm" style="flex:1; justify-content:center;" onclick="alert\('Opening message thread with Ahmed...'\)">/g, '<button class="btn btn-primary btn-sm" style="flex:1; justify-content:center;" disabled>غير متاح حاليًا');
code = code.replace(/<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"><\/path><\/svg>\s*Message/g, '');

// "Share Profile"
code = code.replace(/<button class="btn btn-ghost btn-sm" style="width:36px; padding:0; justify-content:center;" onclick="alert\('Profile link copied: agricore\.eg\/p\/ahmed-mohamed'\)" title="Share Profile">/g, `<button class="btn btn-ghost btn-sm" style="width:36px; padding:0; justify-content:center;" onclick="navigator.clipboard.writeText(window.location.href); alert('تم نسخ رابط الموقع')" title="Share Profile">`);

// 5. Training page "Enroll Now"
code = code.replace(/<button class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" onclick="alert\('Enrollment application started...'\)">Enroll Now/g, '<button class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" disabled>غير متاح حاليًا');

// 6. Fix "createJob" error handling
// Find submitNewJob
code = code.replace(/try \{\n\s*await supabaseBridge\.createJob/g, 'try {\n        await supabaseBridge.createJob');
code = code.replace(/this\._showToast\('Vacancy published successfully!', 'success'\);\n\s*this\.closeAllModals\(\);\n\s*this\.renderCurrentView\(\);\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.error\('\\[submitNewJob\\] Error:', err\);\n\s*\/\/ FALLBACK FOR LOCAL TESTING ONLY/g, `this._showToast('Vacancy published successfully!', 'success');\n        this.closeAllModals();\n        this.renderCurrentView();\n      }\n    } catch (err) {\n      console.error('[submitNewJob] Error:', err);\n      document.getElementById('postJobGlobalError').innerText = 'حدث خطأ أثناء النشر: ' + err.message;\n      document.getElementById('postJobGlobalError').style.display = 'block';\n      // REMOVED LOCAL FALLBACK`);
code = code.replace(/const newJob = \{\n\s*id: 'TEMP-' \+ Date\.now\(\),[\s\S]*?this\.renderCurrentView\(\);\n\s*\}/g, '}');

// Remove match scores logic in jobs_search
code = code.replace(/const match = calculateMatchScore\(job, candidatesData\[0\]\);/g, '');
code = code.replace(/<span class="chip chip-active" style="font-size:0.75rem; padding:3px 10px;">⭐ \$\{job\.match_score || match\}% match<\/span>/g, '');
code = code.replace(/<span class="chip chip-active" style="font-size:0.75rem; padding:3px 10px;">⭐ \$\{job\.match_score\}% match<\/span>/g, '');

fs.writeFileSync('e:/website/js/app.js', code);
console.log('Cleanup script executed successfully.');
