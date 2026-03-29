/* ============================================================
   GOLDEN RUPEE FINTECH – script.js
   ============================================================ */

/* ── CONFIGURATION – Replace with your real credentials ──── */
const EMAILJS_SERVICE_ID       = 'service_dmtqbxo';      // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_LOAN    = 'template_5f61oei'; // e.g. 'template_loan'
const EMAILJS_TEMPLATE_PARTNER = 'template_no6quza';
const EMAILJS_PUBLIC_KEY       = 'd6nr5XVWzIxUPmJXU';
const GOOGLE_SHEET_URL         = '1P6avLX-t7VBPn1ymShGPjuQDm0O5G8kLSmRkaocMbDDcuvRPig7jQgs5';
/* ─────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════
   1. TABS
══════════════════════════════════════════════════════ */
function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}


/* ══════════════════════════════════════════════════════
   2. MODALS
══════════════════════════════════════════════════════ */
function openPartnerModal() { document.getElementById('partnerModal').classList.add('open'); }
function openApplyModal()   { document.getElementById('applyModal').classList.add('open'); }
function closeModal(id)     { document.getElementById(id).classList.remove('open'); }

function openLegalModal(type) {
  document.getElementById(type === 'privacy' ? 'privacyModal' : 'termsModal').classList.add('open');
}

// Close on backdrop click
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});


/* ══════════════════════════════════════════════════════
   3. TOAST NOTIFICATION
══════════════════════════════════════════════════════ */
function showToast(msg, ok = true) {
  const t = document.getElementById('gr-toast');
  t.style.background = ok
    ? 'linear-gradient(135deg,#C9A84C,#A07830)'
    : '#ef4444';
  t.style.color = ok ? '#0A0E1A' : '#fff';
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}


/* ══════════════════════════════════════════════════════
   4. EMI CALCULATOR  (fixed)
══════════════════════════════════════════════════════ */
function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function updateSliderFill(el) {
  const min = parseFloat(el.min);
  const max = parseFloat(el.max);
  const val = parseFloat(el.value);
  const pct = ((val - min) / (max - min)) * 100;
  el.style.background =
    `linear-gradient(to right, var(--gold) ${pct}%, rgba(201,168,76,.15) ${pct}%)`;
}

function calcEMI() {
  const amountEl  = document.getElementById('r-amount');
  const tenureEl  = document.getElementById('r-tenure');
  const rateEl    = document.getElementById('r-rate');

  const P = parseFloat(amountEl.value);
  const N = parseFloat(tenureEl.value);       // months
  const R = parseFloat(rateEl.value) / 12 / 100;

  // EMI formula
  let emi;
  if (R === 0) {
    emi = P / N;
  } else {
    emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
  }

  const total    = emi * N;
  const interest = total - P;

  // Update labels
  document.getElementById('lbl-amount').textContent = fmtINR(P);

  const mo = Math.round(N);
  const yrs = Math.floor(mo / 12);
  const months = mo % 12;
  let tenureText = '';
  if (yrs > 0) tenureText += yrs + ' Yr' + (yrs > 1 ? 's' : '');
  if (months > 0) tenureText += (yrs > 0 ? ' ' : '') + months + ' Mo';
  if (mo < 12) tenureText = mo + ' Months';
  document.getElementById('lbl-tenure').textContent = tenureText;

  document.getElementById('lbl-rate').textContent =
    parseFloat(rateEl.value).toFixed(1) + '%';

  // Update result panel
  document.getElementById('res-emi').textContent       = fmtINR(emi);
  document.getElementById('res-principal').textContent = fmtINR(P);
  document.getElementById('res-interest').textContent  = fmtINR(interest);
  document.getElementById('res-total').textContent     = fmtINR(total);

  // Update donut chart
  const circ   = 2 * Math.PI * 48;   // r=48 matches SVG
  const pRatio = P / total;
  const pArc   = circ * pRatio;
  const dp = document.getElementById('donut-principal');
  const di = document.getElementById('donut-interest');
  dp.setAttribute('stroke-dasharray', circ);
  dp.setAttribute('stroke-dashoffset', circ - pArc);
  di.setAttribute('stroke-dasharray', circ);
  di.setAttribute('stroke-dashoffset', pArc);

  // Update slider fills
  updateSliderFill(amountEl);
  updateSliderFill(tenureEl);
  updateSliderFill(rateEl);
}

// Attach events and run once on load
document.addEventListener('DOMContentLoaded', function () {
  ['r-amount', 'r-tenure', 'r-rate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcEMI);
      updateSliderFill(el);
    }
  });
  calcEMI();
});


/* ══════════════════════════════════════════════════════
   5. COUNTER ANIMATION
══════════════════════════════════════════════════════ */
let counted = false;
const statsSection = document.getElementById('stats');

if (statsSection) {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      [
        ['s1', 28,  '+'],
        ['s2', 50,  '+'],
        ['s3', 120, '+'],
        ['s4', 5,   '+']
      ].forEach(([id, target, sfx]) => {
        const el = document.getElementById(id);
        let startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          const p = Math.min((ts - startTime) / 1800, 1);
          el.textContent = Math.floor(p * target) + (p < 1 ? '' : sfx);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + sfx;
        }
        requestAnimationFrame(step);
      });
    }
  }, { threshold: 0.4 });
  obs.observe(statsSection);
}


/* ══════════════════════════════════════════════════════
   6. LIVE INPUT RESTRICTIONS
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  // ── Helper: mark field valid/invalid ──
  function setFieldState(el, valid, msg) {
    const group = el.closest('.form-group');
    let hint = group.querySelector('.field-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'field-hint';
      group.appendChild(hint);
    }
    el.style.borderColor = valid ? 'rgba(110,231,154,0.5)' : 'rgba(239,68,68,0.5)';
    hint.textContent = valid ? '' : msg;
    hint.style.color = '#ef4444';
  }

  function clearFieldState(el) {
    el.style.borderColor = '';
    const hint = el.closest('.form-group').querySelector('.field-hint');
    if (hint) hint.textContent = '';
  }

  // ── Name: letters and spaces only, min 3 chars ──
  ['apply-name', 'p-name'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.replace(/[^a-zA-Z\s]/g, '');
      if (el.value.trim().length > 0 && el.value.trim().length < 3)
        setFieldState(el, false, 'Name must be at least 3 characters');
      else clearFieldState(el);
    });
    el.setAttribute('maxlength', '60');
  });

  // ── Phone: digits only, exactly 10 digits ──
  ['apply-phone', 'p-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, 10);
      if (el.value.length > 0 && el.value.length < 10)
        setFieldState(el, false, 'Enter valid 10-digit mobile number');
      else if (el.value.length === 10 && !/^[6-9]/.test(el.value))
        setFieldState(el, false, 'Number must start with 6, 7, 8, or 9');
      else if (el.value.length === 10)
        setFieldState(el, true, '');
      else clearFieldState(el);
    });
    el.setAttribute('placeholder', '10-digit mobile number');
    el.setAttribute('maxlength', '10');
  });

  // ── PAN: format ABCDE1234F (5 letters, 4 digits, 1 letter) ──
  ['apply-pan', 'p-pan'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      const pan = el.value;
      if (pan.length > 0 && pan.length < 10)
        setFieldState(el, false, 'PAN must be 10 characters (e.g. ABCDE1234F)');
      else if (pan.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan))
        setFieldState(el, false, 'Invalid PAN format (e.g. ABCDE1234F)');
      else if (pan.length === 10)
        setFieldState(el, true, '');
      else clearFieldState(el);
    });
    el.setAttribute('placeholder', 'ABCDE1234F');
    el.setAttribute('maxlength', '10');
  });

  // ── Aadhaar: digits only, exactly 12 digits ──
  const aadhaarEl = document.getElementById('p-aadhaar');
  if (aadhaarEl) {
    aadhaarEl.addEventListener('input', () => {
      aadhaarEl.value = aadhaarEl.value.replace(/\D/g, '').slice(0, 12);
      if (aadhaarEl.value.length > 0 && aadhaarEl.value.length < 12)
        setFieldState(aadhaarEl, false, 'Aadhaar must be exactly 12 digits');
      else if (aadhaarEl.value.length === 12)
        setFieldState(aadhaarEl, true, '');
      else clearFieldState(aadhaarEl);
    });
    aadhaarEl.setAttribute('placeholder', '12-digit Aadhaar number');
    aadhaarEl.setAttribute('maxlength', '12');
  }

  // ── Email: valid format ──
  const emailEl = document.getElementById('p-email');
  if (emailEl) {
    emailEl.addEventListener('blur', () => {
      const v = emailEl.value.trim();
      if (v.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        setFieldState(emailEl, false, 'Enter a valid email address');
      else if (v.length > 0)
        setFieldState(emailEl, true, '');
      else clearFieldState(emailEl);
    });
    emailEl.setAttribute('maxlength', '80');
  }

  // ── Experience: 0–50 years only ──
  const expEl = document.getElementById('p-exp');
  if (expEl) {
    expEl.addEventListener('input', () => {
      let v = parseInt(expEl.value);
      if (isNaN(v) || v < 0) expEl.value = 0;
      if (v > 50) expEl.value = 50;
      clearFieldState(expEl);
    });
    expEl.setAttribute('min', '0');
    expEl.setAttribute('max', '50');
  }
});


/* ══════════════════════════════════════════════════════
   7. FORM VALIDATION HELPERS
══════════════════════════════════════════════════════ */

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}
function validatePAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}
function validateAadhaar(aadhaar) {
  return /^\d{12}$/.test(aadhaar);
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateName(name) {
  return name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
}


/* ══════════════════════════════════════════════════════
   8. FORM SUBMISSIONS (EmailJS + Google Sheets)
══════════════════════════════════════════════════════ */

// Send to Google Sheets
async function sendToSheet(data) {
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.warn('Sheet error:', e);
  }
}

// Send via EmailJS
async function sendEmail(templateId, params) {
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, templateId, params, EMAILJS_PUBLIC_KEY);
  } catch (e) {
    console.warn('EmailJS error:', e);
  }
}

// ── Loan Application ──
async function submitLoanForm() {
  const nameEl  = document.getElementById('apply-name');
  const phoneEl = document.getElementById('apply-phone');
  const panEl   = document.getElementById('apply-pan');
  const loan    = document.getElementById('apply-loantype').value;
  const agreed  = document.getElementById('pp2').checked;

  const name  = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const pan   = panEl.value.trim().toUpperCase();

  // ── Validations ──
  if (!name) {
    showToast('⚠ Full Name is required.', false); nameEl.focus(); return;
  }
  if (!validateName(name)) {
    showToast('⚠ Name must be at least 3 letters. No numbers or symbols.', false); nameEl.focus(); return;
  }
  if (!phone) {
    showToast('⚠ Phone Number is required.', false); phoneEl.focus(); return;
  }
  if (!validatePhone(phone)) {
    showToast('⚠ Enter a valid 10-digit Indian mobile number starting with 6–9.', false); phoneEl.focus(); return;
  }
  if (pan && !validatePAN(pan)) {
    showToast('⚠ Invalid PAN format. Example: ABCDE1234F', false); panEl.focus(); return;
  }
  if (!agreed) {
    showToast('⚠ Please accept the Privacy Policy and Terms & Conditions.', false); return;
  }

  const btn = document.getElementById('apply-submit');
  btn.textContent = 'Submitting…';
  btn.disabled = true;

  const ts   = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const data = { type: 'Loan Application', name, phone, pan, loanType: loan, timestamp: ts };

  await Promise.all([
    sendToSheet(data),
    sendEmail(EMAILJS_TEMPLATE_LOAN, {
      from_name: name, phone, pan, loan_type: loan, timestamp: ts, to_email: 'info@goldenrupee.in'
    })
  ]);

  btn.textContent = 'Apply / Login →';
  btn.disabled = false;
  closeModal('applyModal');
  showToast('✓ Application received! We will contact you shortly.');

  ['apply-name', 'apply-phone', 'apply-pan'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.style.borderColor = '';
  });
  document.getElementById('pp2').checked = false;
}

// ── DSA Partner ──
async function submitPartnerForm() {
  const nameEl    = document.getElementById('p-name');
  const phoneEl   = document.getElementById('p-phone');
  const emailEl   = document.getElementById('p-email');
  const expEl     = document.getElementById('p-exp');
  const aadhaarEl = document.getElementById('p-aadhaar');
  const panEl     = document.getElementById('p-pan');
  const loan      = document.getElementById('p-loantype').value;
  const agreed    = document.getElementById('pp1').checked;

  const name    = nameEl.value.trim();
  const phone   = phoneEl.value.trim();
  const email   = emailEl.value.trim();
  const exp     = expEl.value.trim();
  const aadhaar = aadhaarEl.value.trim();
  const pan     = panEl.value.trim().toUpperCase();

  // ── Validations ──
  if (!name) {
    showToast('⚠ Full Name is required.', false); nameEl.focus(); return;
  }
  if (!validateName(name)) {
    showToast('⚠ Name must be at least 3 letters. No numbers or symbols.', false); nameEl.focus(); return;
  }
  if (!phone) {
    showToast('⚠ Phone Number is required.', false); phoneEl.focus(); return;
  }
  if (!validatePhone(phone)) {
    showToast('⚠ Enter a valid 10-digit Indian mobile number starting with 6–9.', false); phoneEl.focus(); return;
  }
  if (email && !validateEmail(email)) {
    showToast('⚠ Enter a valid email address (e.g. name@gmail.com).', false); emailEl.focus(); return;
  }
  if (aadhaar && !validateAadhaar(aadhaar)) {
    showToast('⚠ Aadhaar must be exactly 12 digits.', false); aadhaarEl.focus(); return;
  }
  if (pan && !validatePAN(pan)) {
    showToast('⚠ Invalid PAN format. Example: ABCDE1234F', false); panEl.focus(); return;
  }
  if (exp && (isNaN(exp) || +exp < 0 || +exp > 50)) {
    showToast('⚠ Experience must be between 0 and 50 years.', false); expEl.focus(); return;
  }
  if (!agreed) {
    showToast('⚠ Please accept the Privacy Policy and Terms & Conditions.', false); return;
  }

  const btn = document.getElementById('partner-submit');
  btn.textContent = 'Submitting…';
  btn.disabled = true;

  const ts   = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const data = { type: 'DSA Partner', name, phone, email, experience: exp, aadhaar, pan, loanType: loan, timestamp: ts };

  await Promise.all([
    sendToSheet(data),
    sendEmail(EMAILJS_TEMPLATE_PARTNER, {
      from_name: name, phone, email, experience: exp, pan, aadhaar, loan_type: loan, timestamp: ts, to_email: 'info@goldenrupee.in'
    })
  ]);

  btn.textContent = 'Submit Application';
  btn.disabled = false;
  closeModal('partnerModal');
  showToast('✓ Partner application received! We will be in touch soon.');

  ['p-name', 'p-phone', 'p-email', 'p-exp', 'p-aadhaar', 'p-pan'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.style.borderColor = '';
  });
  document.getElementById('pp1').checked = false;
}