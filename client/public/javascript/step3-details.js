
const issueLabels = {
  'pothole': 'Pothole',
  'garbage': 'Garbage / Waste',
  'drainage': 'Drainage Issue',
  'streetlight': 'Street Light',
  'road': 'Road Damage',
  'water': 'Water Logging',
  'encroachment': 'Encroachment',
  'other': 'Other'
};

const severityLabels = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'critical': 'Critical'
};

// Navigation
function goToStep2() { window.location.href = 'step2-details.html'; }
function goToHome() { window.location.href = 'tsim-homepage-light.html'; }

// Load and display data on page load
window.addEventListener('DOMContentLoaded', () => {
  try {
    const locData = JSON.parse(sessionStorage.getItem('complaintLocation') || '{}');
    const detData = JSON.parse(sessionStorage.getItem('complaintDetails') || '{}');

    document.getElementById('rv-location').textContent = locData.address || '—';
    document.getElementById('rv-issue').textContent = issueLabels[detData.issue] || '—';
    
    document.getElementById('rv-desc').textContent = detData.description || '—';
    
    const photoCount = detData.photos ? detData.photos.length : 0;
    document.getElementById('rv-photos').textContent = photoCount > 0 
      ? `${photoCount} photo${photoCount > 1 ? 's' : ''} attached` 
      : 'None uploaded';
  } catch(e) {
    console.error('Error loading data:', e);
  }
});

// Submit form
function submitForm() {
  const btn = document.getElementById('btn-next');
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    const id = `SIM-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`;
    document.getElementById('success-id').textContent = id;
    const score = Math.round(Math.random()*30 + 5);
    document.getElementById('success-score').textContent = `Impact Score: ${score}`;
    document.getElementById('success-overlay').classList.add('visible');
    
    // Clear session data
    sessionStorage.removeItem('complaintLocation');
    sessionStorage.removeItem('complaintDetails');
  }, 1800);
}

function downloadPDF() {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '⏳ Generating PDF…';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '✓ PDF Ready (Demo)';
    btn.style.background = 'var(--green-dark)';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.style.background = ''; }, 2500);
  }, 1200);
}

function reportAnother() {
  sessionStorage.clear();
  window.location.href = 'step1-location.html';
}
