
let selectedIssue = '';
let selectedSeverity = 'high';
let description = '';
let photos = [];
let cameraStream = null;

// =======================
// Navigation
// =======================
function goToStep1() {
  window.location.href = 'step1-location.html';
}

function goToStep3() {
  storeDetailsData();
  window.location.href = 'step3-review.html';
}

// =======================
// Store Data
// =======================
function storeDetailsData() {
  try {
    const data = {
      issue: selectedIssue,
      severity: selectedSeverity,
      description: description,
      photos: photos
    };

    sessionStorage.setItem(
      'complaintDetails',
      JSON.stringify(data)
    );
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// =======================
// Issue Selection
// =======================
function selectIssue(el) {
  document.querySelectorAll('.issue-tile')
    .forEach(tile => tile.classList.remove('selected'));

  el.classList.add('selected');

  selectedIssue = el.dataset.type;

  validateForm();
}

// =======================
// Severity
// =======================
function selectSeverity(el, level) {
  document.querySelectorAll('.severity-btn')
    .forEach(btn => btn.classList.remove('active'));

  el.classList.add('active');

  selectedSeverity = level;
}

// =======================
// Description
// =======================
function updateCharCount() {
  const text = document.getElementById('description').value;

  description = text;

  document.getElementById('char-count').textContent =
    text.length;

  validateForm();
}

// =======================
// Validation
// =======================
function validateForm() {
  const valid =
    selectedIssue !== '' &&
    description.trim().length >= 10 &&
    photos.length >= 1 &&
    photos.length <= 3;

  document.getElementById('btn-next').disabled = !valid;
}

// =======================
// Add Photos
// =======================
function addPhotoFile(file) {

  // max photo limit
  if (photos.length >= 3) {
    alert('Maximum 3 photos allowed');
    return;
  }

  // file type validation
  if (!file.type.startsWith('image/')) {
    alert('Only image files are allowed');
    return;
  }

  // size validation
  if (file.size > 5 * 1024 * 1024) {
    alert(`${file.name} exceeds 5MB`);
    return;
  }

  const reader = new FileReader();

  const id = Date.now() + Math.random();

  reader.onload = function(e) {

    photos.push({
      id: id,
      name: file.name,
      dataUrl: e.target.result
    });

    renderPhotos();
    validateForm();
  };

  reader.readAsDataURL(file);
}

// =======================
// File Upload
// =======================
function handlePhotos(event) {

  const files = Array.from(event.target.files || []);

  files.forEach(file => {
    addPhotoFile(file);
  });

  event.target.value = '';
}

// =======================
// Remove Photo
// =======================
function removePhoto(id) {

  photos = photos.filter(photo => photo.id !== id);

  renderPhotos();
  validateForm();
}

// =======================
// Render Photos
// =======================
function renderPhotos() {

  const previewContainer =
    document.getElementById('photo-previews');

  const hint =
    document.getElementById('photo-count-hint');

  previewContainer.innerHTML = '';

  photos.forEach(photo => {

    const div = document.createElement('div');

    div.className = 'photo-thumb';

    div.innerHTML = `
      <img src="${photo.dataUrl}" alt="${photo.name}">

      <button
        class="photo-thumb-remove"
        onclick="removePhoto(${photo.id})"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M1 1l6 6M7 1L1 7"
            stroke="white"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
      </button>
    `;

    previewContainer.appendChild(div);
  });

  if (photos.length > 0) {

    hint.style.display = 'block';

    hint.textContent =
      `${photos.length}/3 photo${photos.length > 1 ? 's' : ''} added`;

  } else {

    hint.style.display = 'none';
  }
}

// =======================
// Camera Open
// =======================
async function openCameraModal() {

  const modal =
    document.getElementById('camera-modal');

  const video =
    document.getElementById('camera-video');

  const status =
    document.getElementById('camera-status');

  modal.classList.add('active');

  status.textContent = 'Opening camera...';

  try {

    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment'
          }
        },
        audio: false
      });

    video.srcObject = cameraStream;

    await video.play();

    status.textContent = '';

  } catch (err) {

    console.error(err);

    status.textContent =
      'Unable to access camera';

    setTimeout(() => {
      closeCameraModal();
    }, 2000);
  }
}

// =======================
// Camera Close
// =======================
function closeCameraModal() {

  if (cameraStream) {

    cameraStream.getTracks()
      .forEach(track => track.stop());

    cameraStream = null;
  }

  const video =
    document.getElementById('camera-video');

  video.srcObject = null;

  document.getElementById('camera-modal')
    .classList.remove('active');
}

// =======================
// Capture Photo
// =======================
function capturePhoto() {

  const video =
    document.getElementById('camera-video');

  if (!video.videoWidth) {

    document.getElementById('camera-status')
      .textContent = 'Camera not ready';

    return;
  }

  const canvas = document.createElement('canvas');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  canvas.toBlob(blob => {

    if (!blob) return;

    const file = new File(
      [blob],
      `camera-${Date.now()}.jpg`,
      {
        type: 'image/jpeg'
      }
    );

    addPhotoFile(file);

    closeCameraModal();

  }, 'image/jpeg', 0.95);
}

// =======================
// Drag & Drop
// =======================
const zone =
  document.getElementById('photo-zone');

zone.addEventListener('dragover', e => {

  e.preventDefault();

  zone.classList.add('dragover');
});

zone.addEventListener('dragleave', () => {

  zone.classList.remove('dragover');
});

zone.addEventListener('drop', e => {

  e.preventDefault();

  zone.classList.remove('dragover');

  const files = Array.from(e.dataTransfer.files);

  files.forEach(file => {
    addPhotoFile(file);
  });
});

// =======================
// Restore Previous Data
// =======================
window.addEventListener('DOMContentLoaded', () => {

  try {

    const saved =
      JSON.parse(
        sessionStorage.getItem('complaintDetails')
      );

    if (!saved) return;

    selectedIssue = saved.issue || '';
    selectedSeverity = saved.severity || 'high';
    description = saved.description || '';
    photos = saved.photos || [];

    // restore issue
    if (selectedIssue) {

      const issueEl =
        document.querySelector(
          `.issue-tile[data-type="${selectedIssue}"]`
        );

      if (issueEl) {
        issueEl.classList.add('selected');
      }
    }

    // restore severity
    document.querySelectorAll('.severity-btn')
      .forEach(btn => btn.classList.remove('active'));

    const sevBtn =
      document.querySelector(
        `.severity-btn.${selectedSeverity}`
      );

    if (sevBtn) {
      sevBtn.classList.add('active');
    }

    // restore description
    const textarea =
      document.getElementById('description');

    textarea.value = description;

    document.getElementById('char-count')
      .textContent = description.length;

    renderPhotos();
    validateForm();

  } catch (err) {

    console.error('Restore failed', err);
  }
});
