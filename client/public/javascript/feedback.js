
// ── STATE ──
let selType = 'Bug Report';
let consent = false;
let screenshots = [];

// ── TYPE SELECT ──
function selectType(el) {
  document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  selType = el.dataset.type;

  const isBug = selType === 'Bug Report';
  document.getElementById('page-field').style.display = isBug ? '' : 'none';

  const hints = {
    'Bug Report':'Describe the bug — what did you do, what did you expect, what happened instead?',
    'Feature Request':'Describe the feature you\'d like to see. What problem would it solve for you?',
    'General':'Write your message below. We read everything that comes in.',
  };
  document.getElementById('msg-hint').textContent = hints[selType] || hints['General'];

  const placeholders = {
    'Bug Report':'Tell us everything — the more detail, the faster we can fix it…',
    'Feature Request':'I think it would be really useful if TSIM could…',
    'General':'Hi team, I wanted to share…',
  };
  document.getElementById('inp-message').placeholder = placeholders[selType] || '';
}

// Initialize hidden fields
document.getElementById('page-field').style.display = '';

// ── CHAR COUNT ──
function updateChar() {
  const v = document.getElementById('inp-message').value;
  const n = v.length;
  document.getElementById('char-now').textContent = n;
  const pct = (n / 1000) * 100;
  const fill = document.getElementById('char-fill');
  fill.style.width = pct + '%';
  fill.style.background = pct > 80 ? 'var(--saffron)' : 'var(--green)';
  validate();
}

// ── CONSENT ──
function toggleConsent() {
  consent = !consent;
  const box = document.getElementById('cb-consent');
  if (consent) {
    box.classList.add('checked');
    box.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  } else {
    box.classList.remove('checked');
    box.innerHTML = '';
  }
  validate();
}

// ── VALIDATE ──
function validate() {
  const name = document.getElementById('inp-name').value.trim();
  const email = document.getElementById('inp-email').value.trim();
  const subject = document.getElementById('inp-subject').value.trim();
  const msg = document.getElementById('inp-message').value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const ok = name && emailOk && subject && msg.length >= 10 && consent;
  document.getElementById('btn-submit').disabled = !ok;
}

// ── SCREENSHOTS ──
function handleScreenshots(e) {
  const files = Array.from(e.target.files);
  const remaining = 3 - screenshots.length;
  files.slice(0, remaining).forEach(file => {
    if (file.size > 5 * 1024 * 1024) { showToast('File too large — max 5MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      screenshots.push({ id: Date.now() + Math.random(), dataUrl: ev.target.result, name: file.name });
      renderScreenshots();
      showToast('Screenshot attached!');
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function removeScreenshot(id) {
  screenshots = screenshots.filter(s => s.id !== id);
  renderScreenshots();
}

function renderScreenshots() {
  const wrap = document.getElementById('ss-previews');
  wrap.innerHTML = '';
  screenshots.forEach(s => {
    const div = document.createElement('div');
    div.className = 'ss-thumb';
    div.setAttribute('data-id', s.id);
    div.innerHTML = `
      <img src="${s.dataUrl}" alt="${s.name}">
      <button class="ss-remove" onclick="removeScreenshot(${s.id})">
        <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 1l5 5M6 1L1 6" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>
      </button>`;
    wrap.appendChild(div);
  });
  const zone = document.getElementById('attach-zone');
  zone.style.display = screenshots.length >= 3 ? 'none' : '';
}

// Drag and drop
const az = document.getElementById('attach-zone');
az.addEventListener('dragover', e => { e.preventDefault(); az.classList.add('drag'); });
az.addEventListener('dragleave', () => az.classList.remove('drag'));
az.addEventListener('drop', e => {
  e.preventDefault(); az.classList.remove('drag');
  if (e.dataTransfer.files.length) handleScreenshots({ target: { files: e.dataTransfer.files, value: '' } });
});

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── SUBMIT ──
function submitFeedback() {
  const btn = document.getElementById('btn-submit');
  btn.classList.add('loading');
  btn.disabled = true;

  // Simulate sending
  setTimeout(() => {
    btn.classList.remove('loading');
    const ticket = `FB-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`;
    document.getElementById('success-ticket').textContent = ticket;
    document.getElementById('success-type').textContent = selType;
    document.getElementById('success-overlay').classList.add('show');
  }, 1600);
}

// ── RESET ──
function sendAnother() {
  document.getElementById('success-overlay').classList.remove('show');
  document.getElementById('inp-name').value = '';
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-subject').value = '';
  document.getElementById('inp-message').value = '';
  document.getElementById('inp-url').value = '';
  document.getElementById('char-now').textContent = '0';
  document.getElementById('char-fill').style.width = '0';
  screenshots = []; renderScreenshots();
  consent = false;
  const cb = document.getElementById('cb-consent');
  cb.classList.remove('checked'); cb.innerHTML = '';
  document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('selected'));
  document.querySelector('.type-tab').classList.add('selected');
  selType = 'Bug Report';
  document.getElementById('page-field').style.display = '';
  document.getElementById('msg-hint').textContent = 'Describe the bug — what did you do, what did you expect, what happened instead?';
  document.getElementById('inp-message').placeholder = 'Tell us everything — the more detail, the faster we can fix it…';
  document.getElementById('btn-submit').disabled = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
