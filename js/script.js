// Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  });

  // Mobile menu (simple show/hide of nav links)
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.display = open ? 'none' : 'flex';
    navLinks.style.cssText += open ? '' : 'position:absolute; top:64px; left:0; right:0; background:var(--bg); flex-direction:column; padding:20px 32px; border-bottom:1px solid var(--border-soft); display:flex;';
  });

  // Scroll reveal — content is visible by default (see CSS). Only elements
  // that are genuinely BELOW the fold when the page finishes loading get
  // hidden and animated in as the user scrolls down to them.
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const belowFold = rect.top >= window.innerHeight;
    if (belowFold) {
      el.classList.add('pending');
      io.observe(el);
    }
  });

  // A same-page nav click (e.g. "Coverage") jumps straight to that section
  // instead of scrolling through the ones in between — so those in-between
  // sections never pass through the viewport and the observer above never
  // sees them. Reveal everything immediately whenever that kind of jump
  // happens, since there's no scroll narrative to animate in that case.
  function fl_revealAllPending() {
    document.querySelectorAll('.reveal.pending:not(.in)').forEach(el => el.classList.add('in'));
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', fl_revealAllPending);
  });
  window.addEventListener('hashchange', fl_revealAllPending);

  // Back to top
  const totop = document.getElementById('totop');
  window.addEventListener('scroll', () => {
    totop.classList.toggle('show', window.scrollY > 500);
  });
  totop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Bars in monitor widget
  const bars = document.getElementById('bars');
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('i');
    b.style.height = (20 + Math.random()*26) + 'px';
    b.style.animationDelay = (Math.random()*2) + 's';
    bars.appendChild(b);
  }

  // Subtle live temperature tick
  const tempEl = document.getElementById('tempReadout');
  setInterval(() => {
    const base = -18.4;
    const jitter = (Math.random()*0.6 - 0.3).toFixed(1);
    const val = (base + parseFloat(jitter)).toFixed(1);
    tempEl.innerHTML = val + '<span>°C</span>';
  }, 2800);

  // Spotlight cursor glow on service cards
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });

  // Animated count-up for stat numbers
  const counters = document.querySelectorAll('.stat-cell .val, .microstat .num');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countIO.unobserve(el);
      const raw = el.textContent.trim();
      const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
      if (!match) return;
      const [, prefix, numStr, suffix] = match;
      const target = parseFloat(numStr.replace(/,/g, ''));
      if (isNaN(target)) return;
      const decimals = (numStr.split('.')[1] || '').length;
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = (target * eased).toFixed(decimals);
        el.textContent = prefix + Number(val).toLocaleString(undefined, {minimumFractionDigits:decimals, maximumFractionDigits:decimals}) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => countIO.observe(el));

  // Contact form → store submission locally so the admin page can show it
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const entry = {
        id: Date.now(),
        name: (fd.get('fullName') || '').trim(),
        company: (fd.get('company') || '').trim(),
        email: (fd.get('email') || '').trim(),
        phone: (fd.get('phone') || '').trim(),
        shipmentType: fd.get('shipmentType') || '',
        message: (fd.get('message') || '').trim(),
        submittedAt: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('frostlineSubmissions') || '[]');
      existing.unshift(entry);
      localStorage.setItem('frostlineSubmissions', JSON.stringify(existing));

      const btn = contactForm.querySelector('.btn');
      const original = btn.textContent;
      btn.textContent = 'Request sent ✓';
      contactForm.reset();
      setTimeout(() => { btn.textContent = original; }, 3000);
    });
  }

  // Frost field particles
  const field = document.getElementById('frostField');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    const size = 2 + Math.random()*4;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random()*100 + '%';
    s.style.top = Math.random()*100 + '%';
    s.style.animationDuration = (5 + Math.random()*6) + 's';
    s.style.animationDelay = (Math.random()*4) + 's';
    field.appendChild(s);
  }
