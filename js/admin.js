// Admin page — reads contact form submissions saved to localStorage
// by js/script.js (key: 'frostlineSubmissions'), and gates the page
// behind a simple sign-in screen.
//
// IMPORTANT: this is a plain static site with no server, so this is
// NOT real authentication. The credentials below live in this file
// and are visible to anyone who views the page source — it just
// keeps the dashboard out of casual view, not a secure login.

const FL_ADMIN_USERNAME = 'admin';
const FL_ADMIN_PASSWORD = 'frostline2026';
const FL_ADMIN_SESSION_KEY = 'frostlineAdminAuthed';

function fl_timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hr ago';
  const days = Math.floor(hrs / 24);
  return days + (days === 1 ? ' day ago' : ' days ago');
}

function fl_escape(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Demo leads shown the first time the dashboard is opened, so it isn't
// blank before any real contact-form submissions exist. Only used to seed
// localStorage once — if the key is already present (including an empty
// array, e.g. after "Clear leads"), we leave it alone.
const FL_DEMO_LEADS = [
  { id: 1001, name: 'Rohan Kapoor', company: 'Meadow Farms Dairy', email: 'rohan.kapoor@meadowfarms.in', phone: '+91 98111 22345', shipmentType: 'Dairy & frozen goods', message: 'Need a daily reefer pickup from our Sonipat plant into Delhi NCR retail, roughly 2 tons/day.', submittedAt: new Date(Date.now() - 26*60*1000).toISOString() },
  { id: 1002, name: 'Ananya Reddy', company: 'Nordic Pharma', email: 'ananya.reddy@nordicpharma.example', phone: '+91 90000 11223', shipmentType: 'Pharmaceuticals & biologics', message: 'Looking for GDP-compliant storage and transport for a vaccine batch, Hyderabad to Chennai.', submittedAt: new Date(Date.now() - 3*60*60*1000).toISOString() },
  { id: 1003, name: 'Karan Mehta', company: 'Fresh Route Foods', email: 'karan@freshroutefoods.example', phone: '', shipmentType: 'Perishable food & produce', message: 'Weekly produce run from Nashik to Mumbai, need blast-freeze option for excess stock.', submittedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
  { id: 1004, name: 'Simran Kaur', company: '', email: 'simran.kaur@gmail.example', phone: '+91 98700 44556', shipmentType: 'Other temperature-sensitive goods', message: 'Shipping temperature-sensitive cosmetics from Ludhiana to Bengaluru, need a quote.', submittedAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { id: 1005, name: 'Vikram Nair', company: 'Bloom Dairy Co.', email: 'vikram.nair@bloomdairy.example', phone: '+91 99887 66554', shipmentType: 'Dairy & frozen goods', message: 'Scaling up from 1 to 3 routes next quarter, want to discuss a longer-term contract.', submittedAt: new Date(Date.now() - 4*24*60*60*1000).toISOString() }
];

function fl_seedDemoLeadsIfNeeded() {
  if (localStorage.getItem('frostlineSubmissions') === null) {
    localStorage.setItem('frostlineSubmissions', JSON.stringify(FL_DEMO_LEADS));
  }
}

function fl_getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem('frostlineSubmissions') || '[]');
  } catch (e) {
    return [];
  }
}

function fl_renderSubmissions() {
  fl_seedDemoLeadsIfNeeded();
  const list = fl_getSubmissions();
  const tbody = document.getElementById('submissionsBody');
  const empty = document.getElementById('submissionsEmpty');
  const wrap = document.getElementById('submissionsTableWrap');
  const countEl = document.getElementById('kpiTotalLeads');
  const todayEl = document.getElementById('kpiLeadsToday');

  if (countEl) countEl.textContent = list.length;
  if (todayEl) {
    const todayStr = new Date().toDateString();
    todayEl.textContent = list.filter(s => new Date(s.submittedAt).toDateString() === todayStr).length;
  }

  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = '';
    if (wrap) wrap.style.display = 'none';
    if (empty) empty.style.display = 'block';
    fl_renderLeadSources();
    return;
  }
  if (wrap) wrap.style.display = 'block';
  if (empty) empty.style.display = 'none';

  fl_renderLeadSources();

  tbody.innerHTML = list.map(s => `
    <tr>
      <td><b>${fl_escape(s.name || '—')}</b>${s.company ? `<span class="td-sub">${fl_escape(s.company)}</span>` : ''}</td>
      <td>${fl_escape(s.email || '—')}${s.phone ? `<span class="td-sub">${fl_escape(s.phone)}</span>` : ''}</td>
      <td>${fl_escape(s.shipmentType || '—')}</td>
      <td class="td-msg">${fl_escape(s.message || '—')}</td>
      <td class="td-time">${fl_timeAgo(s.submittedAt)}</td>
    </tr>
  `).join('');
}

const FL_SHIPMENT_COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--warn)', 'var(--danger)', 'var(--text-faint)'];

function fl_renderLeadSources() {
  const el = document.getElementById('leadSources');
  if (!el) return;
  const list = fl_getSubmissions();

  if (!list.length) {
    el.innerHTML = '<div class="lead-src-empty">No leads yet — breakdown will appear here once the contact form gets submissions.</div>';
    return;
  }

  const counts = {};
  list.forEach(s => {
    const key = s.shipmentType || 'Other';
    counts[key] = (counts[key] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = list.length;

  el.innerHTML = entries.map(([type, count], i) => {
    const pct = Math.round((count / total) * 100);
    const color = FL_SHIPMENT_COLORS[i % FL_SHIPMENT_COLORS.length];
    return `
      <div class="lead-src-row">
        <div class="lead-src-top"><span>${fl_escape(type)}</span><span>${count} · ${pct}%</span></div>
        <div class="meter"><i style="width:${pct}%; background:${color};"></i></div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginWrap = document.getElementById('adminLogin');
  const app = document.getElementById('adminApp');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('adminLoginError');
  const logoutBtn = document.getElementById('adminLogout');

  function showApp() {
    if (loginWrap) loginWrap.style.display = 'none';
    if (app) app.style.display = '';
    if (app) {
      app.classList.remove('app-in');
      void app.offsetWidth; // restart animation each time the app becomes visible
      app.classList.add('app-in');
    }
    fl_renderSubmissions();
  }

  function showLogin() {
    if (app) { app.style.display = 'none'; app.classList.remove('app-in'); }
    if (loginWrap) loginWrap.style.display = 'flex';
  }

  // Already signed in this browser session?
  if (sessionStorage.getItem(FL_ADMIN_SESSION_KEY) === 'true') {
    showApp();
  } else {
    showLogin();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(loginForm);
      const username = (fd.get('username') || '').trim();
      const password = fd.get('password') || '';

      if (username === FL_ADMIN_USERNAME && password === FL_ADMIN_PASSWORD) {
        sessionStorage.setItem(FL_ADMIN_SESSION_KEY, 'true');
        if (loginError) loginError.classList.remove('show');
        loginForm.reset();
        showApp();
      } else if (loginError) {
        // remove + reflow + re-add so the shake animation replays on every failed attempt
        loginError.classList.remove('show');
        void loginError.offsetWidth;
        loginError.classList.add('show');
      }
    });
  }

  // Show/hide password toggle on the login form
  const pwToggle = document.getElementById('pwToggle');
  const pwInput = document.getElementById('adminPassword');
  const PW_ICON_SHOW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const PW_ICON_HIDE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.5 5.2A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a13.4 13.4 0 01-3.1 3.9M6.5 6.6C4 8.3 2 12 2 12s2.7 5.4 7.2 6.6"/></svg>';
  if (pwToggle && pwInput) {
    pwToggle.addEventListener('click', () => {
      const showing = pwInput.type === 'text';
      pwInput.type = showing ? 'password' : 'text';
      pwToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      pwToggle.innerHTML = showing ? PW_ICON_SHOW : PW_ICON_HIDE;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(FL_ADMIN_SESSION_KEY);
      showLogin();
    });
  }

  const clearBtn = document.getElementById('clearSubmissions');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all stored submissions? This cannot be undone.')) {
        localStorage.removeItem('frostlineSubmissions');
        fl_renderSubmissions();
      }
    });
  }

  // Keep the table in sync if a submission comes in from another tab
  window.addEventListener('storage', (e) => {
    if (e.key === 'frostlineSubmissions') fl_renderSubmissions();
  });
});
