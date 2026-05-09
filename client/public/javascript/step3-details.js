
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

// Helper to convert DataURL to Blob
async function dataURLtoBlob(dataurl) {
  const parts = dataurl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Submit form
async function submitForm() {
  const btn = document.getElementById('btn-next');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const locData = JSON.parse(sessionStorage.getItem('complaintLocation') || '{}');
    const detData = JSON.parse(sessionStorage.getItem('complaintDetails') || '{}');

    const formData = new FormData();
    formData.append('type', detData.issue);
    formData.append('lat', locData.lat);
    formData.append('lng', locData.lng);
    formData.append('address', locData.address);
    formData.append('description', detData.description);
    formData.append('priority', detData.severity);
    formData.append('status', 'reported');

    // Add first photo (backend currently handles .single("image"))
    if (detData.photos && detData.photos.length > 0) {
      const blob = await dataURLtoBlob(detData.photos[0].dataUrl);
      formData.append('image', blob, detData.photos[0].name);
    }

    const res = await fetch(window.CONFIG.getEndpoint('/report'), {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      btn.classList.remove('loading');
      document.getElementById('success-id').textContent = `SIM-${data._id.slice(-6).toUpperCase()}`;
      document.getElementById('success-score').textContent = `Impact Score: ${data.upvotes || 0}`;
      document.getElementById('success-overlay').classList.add('visible');
      
      // Clear session data
      sessionStorage.removeItem('complaintLocation');
      sessionStorage.removeItem('complaintDetails');
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch(e) {
    console.error('Submission error:', e);
    alert('Error submitting report: ' + e.message);
    btn.classList.remove('loading');
    btn.disabled = false;
  }
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
