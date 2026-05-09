
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

// Helper to convert dataURL to Blob
function dataURLtoBlob(dataurl) {
  try {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Blob conversion failed:', e);
    return null;
  }
}

// Submit form
async function submitForm() {
  const btn = document.getElementById('btn-next');
  if (btn.classList.contains('loading')) return;

  console.log('Submission started...');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const locData = JSON.parse(sessionStorage.getItem('complaintLocation') || '{}');
    const detData = JSON.parse(sessionStorage.getItem('complaintDetails') || '{}');

    console.log('Session Data:', { locData, detData });

    if (!detData.issue || !locData.lat) {
      console.warn('Missing required data in sessionStorage');
      throw new Error('Some complaint details are missing. Please go back and ensure all fields are filled.');
    }

    const formData = new FormData();
    formData.append('type', detData.issue);
    formData.append('description', detData.description || '');
    formData.append('lat', locData.lat);
    formData.append('lng', locData.lng);
    formData.append('status', 'reported');

    if (detData.photos && detData.photos.length > 0) {
      detData.photos.forEach((photo, index) => {
        const blob = dataURLtoBlob(photo.dataUrl);
        if (blob) {
          formData.append('image', blob, photo.name || `image-${index}.jpg`);
        }
      });
    }

    console.log('Sending request to backend...');
    const response = await fetch('http://localhost:5000/report', {
      method: 'POST',
      body: formData
    });

    console.log('Response received:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    console.log('Submission success:', result);

    // Update success UI before showing overlay
    document.getElementById('success-id').textContent = result._id || 'SIM-SUCCESS';
    const score = Math.round(Math.random() * 30 + 5);
    document.getElementById('success-score').textContent = `Impact Score: ${score}`;
    
    // Show success overlay
    document.getElementById('success-overlay').classList.add('visible');

    // Clear session data ONLY on success
    sessionStorage.removeItem('complaintLocation');
    sessionStorage.removeItem('complaintDetails');

  } catch (err) {
    console.error('Submission failed:', err);
    alert(err.message || 'Failed to submit complaint. Please try again.');
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
