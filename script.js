/* STAR BACKGROUND */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2
  });
}
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

/* NAVBAR SCROLL EFFECT */
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  nav.classList.toggle("scrolled", window.scrollY > 50);
});

/* PRICING TOGGLE */
document.getElementById("priceToggle").addEventListener("change", function () {
  document.querySelectorAll(".price").forEach(price => {
    price.innerText = this.checked
      ? "$" + price.dataset.year
      : "$" + price.dataset.month;
  });
});

/* TESTIMONIAL SLIDER — auto-rotate */
let slideIndex = 0;
const testimonials = document.querySelectorAll(".testimonial");
const dots = document.querySelectorAll(".dot");

function goToSlide(n) {
  testimonials[slideIndex].classList.remove("active");
  dots[slideIndex].classList.remove("active");
  slideIndex = n;
  testimonials[slideIndex].classList.add("active");
  dots[slideIndex].classList.add("active");
}

setInterval(() => {
  goToSlide((slideIndex + 1) % testimonials.length);
}, 3500);

/* SCROLL FADE UP */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
});
document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));


/* ============================================
   AUTH MODAL (Login / Sign Up)
   ============================================ */

function openAuthModal(tab) {
  const modal = document.getElementById("authModal");
  modal.classList.add("auth-modal-open");
  document.body.style.overflow = "hidden";
  
  // Reset to clean state
  document.getElementById("auth-success").style.display = "none";
  document.getElementById("form-login").style.display = "";
  document.getElementById("form-signup").style.display = "";
  document.querySelector('.auth-tabs').style.display = '';
  document.getElementById('signup-otp-panel').style.display = 'none';
  
  // Reset OTP state
  _signupOTPClearTimer();
  _signupOTP = null;
  _signupOTPEmail = null;
  _signupOTPExpiry = null;
  _signupFormData = null;
  
  switchTab(tab || "login");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  modal.classList.remove("auth-modal-open");
  document.body.style.overflow = "auto";
  
  // Clean up OTP state when closing modal
  _signupOTPClearTimer();
  _signupOTP = null;
  _signupOTPEmail = null;
  _signupOTPExpiry = null;
  _signupFormData = null;
  
  // Reset OTP panel
  document.getElementById('signup-otp-panel').style.display = 'none';
  document.querySelector('.auth-tabs').style.display = '';
  document.getElementById('form-signup').style.display = '';
}

/* ── Show / Hide password toggle ── */
function togglePasswordVisibility(inputId, checkbox) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = checkbox.checked ? 'text' : 'password';
}

/* Switch between Login / Signup tabs */
function switchTab(tab) {
  const loginForm = document.getElementById("form-login");
  const signupForm = document.getElementById("form-signup");
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const success = document.getElementById("auth-success");

  success.style.display = "none";

  // Clear any previous login error
  const loginErr = document.getElementById('login-error');
  if (loginErr) loginErr.style.display = 'none';

  if (tab === "login") {
    loginForm.classList.remove("auth-form-hidden");
    signupForm.classList.add("auth-form-hidden");
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
  } else {
    signupForm.classList.remove("auth-form-hidden");
    loginForm.classList.add("auth-form-hidden");
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

/* ============================================
   SIGNUP FORM — REAL-TIME FIELD VALIDATION
   ============================================ */

/* Helper: set message and input classes */
function setFieldState(input, msgEl, isValid, validText, invalidText) {
  if (!input || !msgEl) return;
  if (input.value.trim() === '') {
    // Untouched / empty — neutral
    input.classList.remove('input-valid', 'input-invalid');
    msgEl.textContent = '';
    msgEl.className = 'field-msg';
    return;
  }
  input.classList.toggle('input-valid', isValid);
  input.classList.toggle('input-invalid', !isValid);
  msgEl.textContent = isValid ? '✓ ' + validText : '✗ ' + invalidText;
  msgEl.className = 'field-msg ' + (isValid ? 'valid' : 'invalid');
}

/* ── Name validation (letters + spaces only, min 2 chars) ── */
function validateName(inputId, msgId, label) {
  const input = document.getElementById(inputId);
  const msg = document.getElementById(msgId);
  if (!input) return true;
  const val = input.value.trim();
  const valid = val.length >= 2 && /^[A-Za-z\s'-]+$/.test(val);
  setFieldState(input, msg, valid,
    label + ' looks good!',
    label + ' must be at least 2 letters with no numbers.'
  );
  return valid || val === '';
}

/* ── Business name (min 2 chars, any text) ── */
function validateBusiness() {
  const input = document.getElementById('signup-business');
  const msg = document.getElementById('msg-business');
  if (!input) return true;
  const val = input.value.trim();
  const valid = val.length >= 2;
  setFieldState(input, msg, valid,
    'Business name saved.',
    'Please enter your brewery or business name.'
  );
  return valid || val === '';
}

/* ── Email validation ── */
function validateEmail() {
  const input = document.getElementById('signup-email');
  const msg = document.getElementById('msg-email');
  if (!input) return true;
  const val = input.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  setFieldState(input, msg, valid,
    'Valid email address.',
    'Please enter a valid email (e.g. ravi@tamperline.us).'
  );
  return valid || val === '';
}

/* ── Password validation + requirements checklist ── */
function validatePassword() {
  const input = document.getElementById('signup-password');
  const msg = document.getElementById('msg-password');
  if (!input) return true;
  const val = input.value;

  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasDigit = /[0-9]/.test(val);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val);
  const allMet = hasUpper && hasLower && hasDigit && hasSpecial && val.length >= 8;

  // Update checklist items
  const toggle = (id, met) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('req-met', met);
  };
  toggle('req-upper', hasUpper);
  toggle('req-lower', hasLower);
  toggle('req-digit', hasDigit);
  toggle('req-special', hasSpecial);

  // Set field state message only when user has started typing
  if (val.length > 0) {
    if (allMet) {
      input.classList.add('input-valid');
      input.classList.remove('input-invalid');
      msg.textContent = '✓ Strong password!';
      msg.className = 'field-msg valid';
    } else {
      input.classList.add('input-invalid');
      input.classList.remove('input-valid');
      msg.textContent = '✗ Must meet all 4 requirements below.';
      msg.className = 'field-msg invalid';
    }
  } else {
    input.classList.remove('input-valid', 'input-invalid');
    msg.textContent = '';
    msg.className = 'field-msg';
  }
  return allMet;
}

/* Attach real-time listeners after DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  const attach = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', fn);
  };
  attach('signup-fname', () => validateName('signup-fname', 'msg-fname', 'First name'));
  attach('signup-lname', () => validateName('signup-lname', 'msg-lname', 'Last name'));
  attach('signup-business', validateBusiness);
  attach('signup-email', validateEmail);
  attach('signup-password', validatePassword);

  /* Close modal on backdrop click */
  document.getElementById('authModal').addEventListener('click', function (e) {
    if (e.target === this) closeAuthModal();
  });
});

/* Handle form submission */
function handleAuth(e, type) {
  e.preventDefault();

  /* ── LOGIN: check stored credentials ── */
  if (type === 'login') {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    // Show or clear inline error
    let loginErr = document.getElementById('login-error');
    if (!loginErr) {
      loginErr = document.createElement('p');
      loginErr.id = 'login-error';
      loginErr.style.cssText = 'color:#f87171;font-size:13px;margin:6px 0 0;text-align:center;';
      document.getElementById('form-login').querySelector('.auth-submit').insertAdjacentElement('beforebegin', loginErr);
    }

    // Look up user in localStorage
    const storedRaw = localStorage.getItem('tl_user_' + email);
    let credValid = false;
    let userData = null;
    if (storedRaw) {
      userData = JSON.parse(storedRaw);
      credValid = userData.password === password;
    }

    if (!credValid) {
      loginErr.textContent = '✗ Invalid email or password. Please try again.';
      loginErr.style.display = 'block';
      const pwInput = document.getElementById('login-password');
      pwInput.classList.add('input-invalid');
      pwInput.focus();
      return;
    }

    // ✅ Valid credentials — store current user and redirect
    loginErr.style.display = 'none';
    localStorage.setItem('tl_current_user', email);
    const loginForm = document.getElementById('form-login');
    const successBox = document.getElementById('auth-success');
    const successText = document.getElementById('auth-success-text');

    loginForm.style.display = 'none';
    successBox.style.display = 'flex';
    successText.textContent = '✅ Welcome back, ' + userData.firstName + '! Redirecting to your dashboard...';

    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
    return;
  }

  /* ── SIGNUP: run full validation before proceeding ── */
  if (type === 'signup') {
    const fnameOk = validateName('signup-fname', 'msg-fname', 'First name');
    const lnameOk = validateName('signup-lname', 'msg-lname', 'Last name');
    const bizOk = validateBusiness();
    const emailOk = validateEmail();
    const passOk = validatePassword();

    // Force-validate all (show errors even if untouched)
    const forceCheck = (inputId, msgId) => {
      const el = document.getElementById(inputId);
      if (el && el.value.trim() === '') {
        const msg = document.getElementById(msgId);
        if (msg) { msg.textContent = '✗ This field is required.'; msg.className = 'field-msg invalid'; }
        if (el) { el.classList.add('input-invalid'); }
      }
    };
    if (!fnameOk || document.getElementById('signup-fname')?.value.trim() === '') forceCheck('signup-fname', 'msg-fname');
    if (!lnameOk || document.getElementById('signup-lname')?.value.trim() === '') forceCheck('signup-lname', 'msg-lname');
    if (!bizOk || document.getElementById('signup-business')?.value.trim() === '') forceCheck('signup-business', 'msg-business');
    if (!emailOk || document.getElementById('signup-email')?.value.trim() === '') forceCheck('signup-email', 'msg-email');
    if (!passOk || document.getElementById('signup-password')?.value === '') {
      const msg = document.getElementById('msg-password');
      if (msg && document.getElementById('signup-password')?.value === '') {
        msg.textContent = '✗ Please create a password.';
        msg.className = 'field-msg invalid';
        document.getElementById('signup-password').classList.add('input-invalid');
      }
    }
    if (!fnameOk || !lnameOk || !bizOk || !emailOk || !passOk) return;
  }

  // Collect signup data
  const regEmail = document.getElementById('signup-email').value.trim().toLowerCase();
  const regFirst = document.getElementById('signup-fname').value.trim();
  const regLast = document.getElementById('signup-lname').value.trim();
  const regBiz = document.getElementById('signup-business').value.trim();
  const regPass = document.getElementById('signup-password').value;

  // Check if email already exists (prevent duplicate registrations)
  if (localStorage.getItem('tl_user_' + regEmail)) {
    const emailMsg = document.getElementById('msg-email');
    if (emailMsg) {
      emailMsg.textContent = '✗ An account with this email already exists. Please sign in or use a different email.';
      emailMsg.className = 'field-msg invalid';
    }
    document.getElementById('signup-email').classList.add('input-invalid');
    document.getElementById('signup-email').focus();
    return;
  }

  // Store form data for after OTP verification
  _signupFormData = {
    email: regEmail,
    firstName: regFirst,
    lastName: regLast,
    business: regBiz,
    password: regPass
  };

  // Generate OTP and set expiry
  _signupOTP = generateOTP();
  _signupOTPEmail = regEmail;
  _signupOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Hide signup form and show OTP panel
  document.getElementById('form-signup').style.display = 'none';
  document.querySelector('.auth-tabs').style.display = 'none';
  document.getElementById('signup-otp-panel').style.display = 'block';

  // Send OTP email
  signupSendOTP(regEmail, regFirst);
}

/* Close modal on backdrop click */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("authModal").addEventListener("click", function (e) {
    if (e.target === this) closeAuthModal();
  });
});

/* Close modal on Escape key */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeAuthModal(); closeDemoModal(); }
});

/* ============================================================
   FORGOT PASSWORD — 3-step OTP flow
   Uses EmailJS service already configured in bookings.html.

   EmailJS OTP Template setup (one-time, 2 min):
     1. emailjs.com → Email Templates → Create New Template
     2. Set "To Email" field to: {{to_email}}
        Set "From Name" to:     Tamperline.us
        Set Reply-To to:        ravi@tamperline.us
        Subject: Your Tamperline.us Password Reset Code
        Body:
          Hi,
          Your verification code is: {{otp_code}}
          This code expires in 5 minutes.
          — Tamperline.us Team
     3. Copy the Template ID and paste it below:
   ============================================================ */
const FP_EMAILJS_PUBLIC_KEY = 'jAbKS8vkaS0hxeIO3';  // same as bookings
const FP_EMAILJS_SERVICE_ID = 'service_najqzkr';      // same as bookings
const FP_OTP_TEMPLATE_ID = 'template_3xmghlh';      // ← create this template & paste real ID here

/* In-memory OTP session (never written to disk) */
let _fpOTP = null;   // 6-digit string
let _fpEmail = null;   // email being reset
let _fpExpiry = null;   // Date.now() + 5min
let _fpTimerIv = null;   // setInterval ref

/* ── Show/hide helpers ── */
function showForgotPassword() {
  document.getElementById('form-login').style.display = 'none';
  document.getElementById('form-signup').style.display = 'none';
  document.querySelector('.auth-tabs').style.display = 'none';
  document.getElementById('auth-success').style.display = 'none';
  document.getElementById('fp-panel').style.display = 'block';
  _fpShowStep(1);
  document.getElementById('fp-email').value = document.getElementById('login-email').value || '';
  document.getElementById('fp-email-msg').textContent = '';
  document.getElementById('fp-send-status').textContent = '';
}

function hideForgotPassword() {
  _fpClearTimer();
  document.getElementById('fp-panel').style.display = 'none';
  document.querySelector('.auth-tabs').style.display = '';
  document.getElementById('form-login').style.display = '';
  switchTab('login');
}

function _fpShowStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById('fp-step' + i);
    if (el) el.style.display = (i === n) ? '' : 'none';
  });
}

/* ── Step 1: validate email + send OTP ── */
function fpSubmitEmail() {
  const emailInput = document.getElementById('fp-email');
  const msg = document.getElementById('fp-email-msg');
  const status = document.getElementById('fp-send-status');
  const email = emailInput.value.trim().toLowerCase();

  msg.textContent = '';
  status.textContent = '';

  if (!email) {
    msg.textContent = '✗ Please enter your email address.';
    msg.className = 'field-msg invalid'; return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = '✗ Please enter a valid email.';
    msg.className = 'field-msg invalid'; return;
  }

  const stored = localStorage.getItem('tl_user_' + email);
  if (!stored) {
    msg.textContent = '✗ No account found with this email.';
    msg.className = 'field-msg invalid'; return;
  }

  /* Generate 6-digit OTP */
  _fpEmail = email;
  _fpOTP = String(Math.floor(100000 + Math.random() * 900000));
  _fpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  status.innerHTML = '<span style="color:#9333ea;">📧 Sending verification code…</span>';

  /* Initialise EmailJS and send (loaded via CDN — referenced as window.emailjs) */
  const ejs = window.emailjs;
  try { ejs.init(FP_EMAILJS_PUBLIC_KEY); } catch (e) { }

  ejs.send(FP_EMAILJS_SERVICE_ID, FP_OTP_TEMPLATE_ID, {
    to_email: email,
    otp_code: _fpOTP
  }).then(() => {
    status.innerHTML = '<span style="color:#10b981;">✅ Code sent! Check your inbox.</span>';
    setTimeout(() => _fpGoToStep2(), 900);
  }).catch(() => {
    /* EmailJS template not yet created — show OTP on screen for dev/testing */
    status.innerHTML =
      '<span style="color:#f59e0b;">⚠️ Email not configured yet.<br>' +
      'Your OTP (dev mode): <strong style="letter-spacing:0.2em;">' + _fpOTP + '</strong></span>';
    setTimeout(() => _fpGoToStep2(), 2000);
  });
}

function _fpGoToStep2() {
  document.getElementById('fp-step2-sub').textContent =
    'A 6-digit code has been sent to ' + _fpEmail + '. Check your inbox (and spam).';
  document.getElementById('fp-otp').value = '';
  document.getElementById('fp-otp-msg').textContent = '';
  _fpShowStep(2);
  _fpStartTimer();
}

/* ── Countdown timer (5 min) ── */
function _fpStartTimer() {
  _fpClearTimer();
  function tick() {
    const left = Math.max(0, _fpExpiry - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    const timerEl = document.getElementById('fp-timer');
    if (timerEl) timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    if (left === 0) {
      _fpClearTimer();
      const otpMsg = document.getElementById('fp-otp-msg');
      if (otpMsg) { otpMsg.textContent = '✗ Code expired. Please request a new one.'; otpMsg.className = 'field-msg invalid'; }
      _fpOTP = null;
    }
  }
  tick();
  _fpTimerIv = setInterval(tick, 1000);
}

function _fpClearTimer() {
  if (_fpTimerIv) { clearInterval(_fpTimerIv); _fpTimerIv = null; }
}

/* ── Resend OTP ── */
function fpResendOTP() {
  _fpClearTimer();
  _fpShowStep(1);
  document.getElementById('fp-send-status').textContent = '';
}

/* ── Step 2: verify OTP ── */
function fpVerifyOTP() {
  const entered = document.getElementById('fp-otp').value.trim();
  const msg = document.getElementById('fp-otp-msg');

  if (!entered || entered.length !== 6) {
    msg.textContent = '✗ Please enter the 6-digit code.';
    msg.className = 'field-msg invalid'; return;
  }
  if (!_fpOTP || Date.now() > _fpExpiry) {
    msg.textContent = '✗ Code has expired. Please request a new one.';
    msg.className = 'field-msg invalid'; return;
  }
  if (entered !== _fpOTP) {
    msg.textContent = '✗ Incorrect code. Please try again.';
    msg.className = 'field-msg invalid';
    document.getElementById('fp-otp').classList.add('input-invalid');
    return;
  }

  /* OTP matched */
  _fpClearTimer();
  _fpOTP = null; // consume it — cannot reuse
  document.getElementById('fp-newpass').value = '';
  document.getElementById('fp-confirmpass').value = '';
  document.getElementById('fp-newpass-msg').textContent = '';
  document.getElementById('fp-confirm-msg').textContent = '';
  _fpShowStep(3);
}

/* ── Step 3: set new password ── */
function fpSetNewPassword() {
  const newPass = document.getElementById('fp-newpass').value;
  const confirm = document.getElementById('fp-confirmpass').value;
  const passMsg = document.getElementById('fp-newpass-msg');
  const confMsg = document.getElementById('fp-confirm-msg');

  passMsg.textContent = '';
  confMsg.textContent = '';

  if (newPass.length < 8) {
    passMsg.textContent = '✗ Password must be at least 8 characters.';
    passMsg.className = 'field-msg invalid'; return;
  }
  if (newPass !== confirm) {
    confMsg.textContent = '✗ Passwords do not match.';
    confMsg.className = 'field-msg invalid'; return;
  }

  /* Update password in localStorage */
  const raw = localStorage.getItem('tl_user_' + _fpEmail);
  if (!raw) {
    passMsg.textContent = '✗ Account not found. Please try again.';
    passMsg.className = 'field-msg invalid'; return;
  }
  const user = JSON.parse(raw);
  user.password = newPass;
  localStorage.setItem('tl_user_' + _fpEmail, JSON.stringify(user));

  /* Show success, then return to login */
  _fpShowStep(3);
  document.getElementById('fp-step3').innerHTML =
    '<div class="auth-brand" style="margin-bottom:20px;">' +
    '<div class="logo-box" style="margin:0 auto 12px;width:48px;height:48px;font-size:18px;">✅</div>' +
    '<h2 class="auth-title">Password Updated!</h2>' +
    '<p class="auth-sub">Your password has been changed successfully.<br>Redirecting to sign in…</p>' +
    '</div>';

  _fpEmail = null;
  setTimeout(() => hideForgotPassword(), 2000);
}

/* Wire up the "Forgot password?" link */
document.addEventListener('DOMContentLoaded', () => {
  const forgotLink = document.querySelector('.auth-forgot');
  if (forgotLink) {
    forgotLink.addEventListener('click', e => { e.preventDefault(); showForgotPassword(); });
  }
});

/* ============================================
   SIGNUP OTP VERIFICATION (Email Verification)
   ============================================ */

/* In-memory OTP session for signup (never written to disk) */
let _signupOTP = null;          // 6-digit string
let _signupOTPEmail = null;     // email address
let _signupOTPExpiry = null;    // Date.now() + 5min
let _signupOTPTimerIv = null;   // setInterval ref
let _signupFormData = null;     // Stores first/last name, business, password for after OTP verification

/* ── Generate random 6-digit OTP ── */
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── Send OTP via EmailJS ── */
function signupSendOTP(email, firstName) {
  const status = document.getElementById('signup-otp-status');
  status.innerHTML = '<span style="color:#9333ea;">📧 Sending verification code…</span>';

  // Get EmailJS config from global variables (defined in index.html)
  const pubKey = window.SIGNUP_EMAILJS_PUBLIC_KEY || '';
  const serviceId = window.SIGNUP_EMAILJS_SERVICE_ID || '';
  const templateId = window.SIGNUP_EMAILJS_TEMPLATE_ID || '';

  // Check if configuration is complete
  if (!pubKey || pubKey === 'YOUR_PUBLIC_KEY_HERE' || 
      !serviceId || serviceId === 'YOUR_SERVICE_ID_HERE' ||
      !templateId || templateId === 'YOUR_TEMPLATE_ID_HERE') {
    // Configuration incomplete — show OTP in dev mode
    status.innerHTML =
      '<span style="color:#f59e0b;">⚠️ Email not configured yet.<br>' +
      'Your OTP (dev mode): <strong style="letter-spacing:0.2em;">' + _signupOTP + '</strong></span>';
    setTimeout(() => _signupOTPGoToStep2(), 2000);
    return;
  }

  // Initialize EmailJS and send OTP
  const ejs = window.emailjs;
  try { ejs.init(pubKey); } catch (e) { }

  ejs.send(serviceId, templateId, {
    to_email: email,
    first_name: firstName,
    otp_code: _signupOTP
  }).then(() => {
    status.innerHTML = '<span style="color:#10b981;">✅ Code sent! Check your inbox.</span>';
    setTimeout(() => _signupOTPGoToStep2(), 900);
  }).catch((err) => {
    // If send fails but email is configured, show warning
    if (pubKey !== 'YOUR_PUBLIC_KEY_HERE') {
      status.innerHTML =
        '<span style="color:#f87171;">❌ Failed to send email. Please check your EmailJS configuration.<br>' +
        '<small>Hint: Verify your Service ID and Template ID in index.html</small></span>';
      // Don't proceed in case of real failure
      return;
    }
  });
}

/* ── Show OTP verification step ── */
function _signupOTPGoToStep2() {
  document.getElementById('signup-otp-sub').textContent =
    'A 6-digit code has been sent to ' + _signupOTPEmail + '. Check your inbox (and spam).';
  document.getElementById('signup-otp').value = '';
  document.getElementById('signup-otp-msg').textContent = '';
  document.getElementById('signup-otp-panel').style.display = 'block';
  document.getElementById('form-signup').style.display = 'none';
  document.querySelector('.auth-tabs').style.display = 'none';
  _signupOTPStartTimer();
}

/* ── OTP Countdown timer (5 min) ── */
function _signupOTPStartTimer() {
  _signupOTPClearTimer();
  function tick() {
    const left = Math.max(0, _signupOTPExpiry - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    const timerEl = document.getElementById('signup-otp-timer');
    if (timerEl) timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    if (left === 0) {
      _signupOTPClearTimer();
      const otpMsg = document.getElementById('signup-otp-msg');
      if (otpMsg) { otpMsg.textContent = '✗ Code expired. Please try again.'; otpMsg.className = 'field-msg invalid'; }
      _signupOTP = null;
    }
  }
  tick();
  _signupOTPTimerIv = setInterval(tick, 1000);
}

function _signupOTPClearTimer() {
  if (_signupOTPTimerIv) { clearInterval(_signupOTPTimerIv); _signupOTPTimerIv = null; }
}

/* ── Resend OTP ── */
function signupResendOTP() {
  _signupOTPClearTimer();
  _signupOTP = generateOTP();
  _signupOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  signupSendOTP(_signupOTPEmail, _signupFormData.firstName);
}

/* ── Go back to signup form ── */
function signupBackToForm() {
  _signupOTPClearTimer();
  _signupOTP = null;
  _signupOTPEmail = null;
  _signupOTPExpiry = null;
  _signupFormData = null;

  document.getElementById('signup-otp-panel').style.display = 'none';
  document.querySelector('.auth-tabs').style.display = '';
  document.getElementById('form-signup').style.display = '';
  
  // Clear OTP panel
  document.getElementById('signup-otp').value = '';
  document.getElementById('signup-otp-msg').textContent = '';
  document.getElementById('signup-otp-status').textContent = '';
  
  // Focus back on email field for user to correct if needed
  setTimeout(() => {
    document.getElementById('signup-email').focus();
  }, 100);
}

/* ── Verify OTP and create account ── */
function signupVerifyOTP() {
  const entered = document.getElementById('signup-otp').value.trim();
  const msg = document.getElementById('signup-otp-msg');
  const status = document.getElementById('signup-otp-status');

  msg.textContent = '';
  status.textContent = '';

  if (!entered || entered.length !== 6) {
    msg.textContent = '✗ Please enter the 6-digit code.';
    msg.className = 'field-msg invalid'; 
    return;
  }
  if (!_signupOTP || Date.now() > _signupOTPExpiry) {
    msg.textContent = '✗ Code has expired. Please try again.';
    msg.className = 'field-msg invalid'; 
    status.innerHTML = '<span style="color:#f87171;">Your code has expired. Click "Resend" to get a new one.</span>';
    return;
  }
  if (entered !== _signupOTP) {
    msg.textContent = '✗ Incorrect code. Please try again.';
    msg.className = 'field-msg invalid';
    document.getElementById('signup-otp').classList.add('input-invalid');
    return;
  }

  // ✅ OTP verified — now create account with stored form data
  _signupOTPClearTimer();
  _signupOTP = null; // consume it — cannot reuse

  // Create the account with the stored form data
  const regEmail = _signupFormData.email;
  const regFirst = _signupFormData.firstName;
  const regLast = _signupFormData.lastName;
  const regBiz = _signupFormData.business;
  const regPass = _signupFormData.password;

  const newUser = { 
    firstName: regFirst, 
    lastName: regLast, 
    business: regBiz, 
    email: regEmail, 
    password: regPass, 
    createdAt: Date.now(),
    emailVerified: true,
    emailVerifiedAt: Date.now()
  };
  localStorage.setItem('tl_user_' + regEmail, JSON.stringify(newUser));
  localStorage.setItem('tl_current_user', regEmail);

  // Start 2-day free trial
  const trialKey = 'tl_trial_start_' + regEmail;
  if (!localStorage.getItem(trialKey)) {
    localStorage.setItem(trialKey, Date.now().toString());
  }

  // Show success and redirect
  status.innerHTML = '<span style="color:#10b981;">✅ Email verified! Creating your account...</span>';
  
  setTimeout(() => {
    document.getElementById('signup-otp-panel').style.display = 'none';
    document.querySelector('.auth-tabs').style.display = '';
    
    const successBox = document.getElementById('auth-success');
    const successText = document.getElementById('auth-success-text');
    successBox.style.display = 'flex';
    successText.textContent = `🎉 Account created, ${regFirst}! Your 2-day free trial has started. Redirecting to your dashboard...`;
    
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
  }, 1500);
}

/* ============================================
   DEMO VIDEO MODAL
   ============================================ */

function openDemoModal() {
  const modal = document.getElementById('demoModal');
  const video = document.getElementById('demoVideo');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  video.play();
}

function closeDemoModal() {
  const modal = document.getElementById('demoModal');
  if (!modal) return;
  const video = document.getElementById('demoVideo');
  modal.classList.remove('open');
  video.pause();
  video.currentTime = 0;
  document.body.style.overflow = 'auto';
}
