
let pinnedLat = null, pinnedLng = null;
let confirmedLat = null, confirmedLng = null;
let confirmedAddress = '';
let tempMarker = null, confirmedMarker = null;
let map, pinCard, clickHint;

// Store location data for next steps
function storeLocationData() {
  try {
    const data = {
      lat: confirmedLat,
      lng: confirmedLng,
      address: confirmedAddress
    };
    sessionStorage.setItem('complaintLocation', JSON.stringify(data));
  } catch(e) { console.error('Storage error:', e); }
}

// Go to step 2
function goToStep2() {
  storeLocationData();
  window.location.href = 'step2-details.html';
}

// MAP INIT
window.addEventListener('DOMContentLoaded', () => {
  pinCard = document.getElementById('pin-card');
  clickHint = document.getElementById('click-hint');

  map = L.map('map', {
    center: [20.5937, 78.9629],
    zoom: 5,
    zoomControl: false,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  map.on('click', (e) => {
    placePin(e.latlng.lat, e.latlng.lng);
  });

  map.on('movestart', () => { clickHint.style.opacity = '0'; });
});

// CUSTOM MARKER
function makeIcon(confirmed = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;
      background:${confirmed ? '#1A9E4A' : '#E8831A'};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 3px 12px rgba(${confirmed?'26,158,74':'232,131,26'},.55);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

// PIN PLACEMENT
function placePin(lat, lng) {
  pinnedLat = lat; pinnedLng = lng;
  if (tempMarker) map.removeLayer(tempMarker);
  if (confirmedMarker) map.removeLayer(confirmedMarker);

  tempMarker = L.marker([lat, lng], { icon: makeIcon(false) }).addTo(map);
  map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.8 });

  clickHint.style.opacity = '0';
  pinCard.classList.add('visible');

  document.getElementById('mpc-coords').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  document.getElementById('mpc-address').textContent = 'Fetching address…';

  reverseGeocode(lat, lng);
}

// REVERSE GEOCODE
function reverseGeocode(lat, lng) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
    .then(r => r.json())
    .then(data => {
      const a = data.address || {};
      const parts = [
        a.road || a.hamlet,
        a.suburb || a.neighbourhood,
        a.city || a.town || a.village || a.county,
        a.state
      ].filter(Boolean);
      const address = parts.join(', ') || data.display_name || 'Unknown location';

      document.getElementById('mpc-address').textContent = address;
      document.getElementById('loc-address').textContent = address;
      document.getElementById('loc-coords').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    })
    .catch(() => {
      const fallback = `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      document.getElementById('mpc-address').textContent = fallback;
      document.getElementById('loc-address').textContent = fallback;
      document.getElementById('loc-coords').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    });
}

function confirmPin() {
  confirmedLat = pinnedLat; confirmedLng = pinnedLng;
  confirmedAddress = document.getElementById('mpc-address').textContent;

  if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
  confirmedMarker = L.marker([confirmedLat, confirmedLng], { icon: makeIcon(true) })
    .addTo(map)
    .bindPopup(`<strong style="font-size:13px">${confirmedAddress}</strong>`, { closeButton: false })
    .openPopup();

  pinCard.classList.remove('visible');
  document.getElementById('location-empty').classList.add('hidden');
  document.getElementById('location-detected').classList.remove('hidden');

  document.getElementById('btn-next').disabled = false;
}

function cancelPin() {
  if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
  pinCard.classList.remove('visible');
  pinnedLat = null; pinnedLng = null;
  clickHint.style.opacity = '1';
}

function clearPin() {
  confirmedLat = null; confirmedLng = null;
  if (confirmedMarker) { map.removeLayer(confirmedMarker); confirmedMarker = null; }
  if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
  document.getElementById('location-empty').classList.remove('hidden');
  document.getElementById('location-detected').classList.add('hidden');
  pinCard.classList.remove('visible');
  clickHint.style.opacity = '1';
  map.flyTo([20.5937, 78.9629], 5, { duration: 0.8 });
  document.getElementById('btn-next').disabled = true;
}

function triggerMapClick() {
  map.flyTo([20.5937, 78.9629], 5, { duration: 0.4 });
  clickHint.style.opacity = '1';
}

// AUTO DETECT
function detectLocation() {
  const btn = document.getElementById('btn-detect');
  const fab = document.getElementById('fab-locate');
  btn.classList.add('loading');
  btn.querySelector('span').textContent = 'Detecting…';
  fab.classList.add('loading');

  if (!navigator.geolocation) {
    alert('Geolocation not supported by your browser.'); return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('loading');
      btn.querySelector('span').textContent = 'Use My Current Location';
      fab.classList.remove('loading');
      placePin(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      btn.classList.remove('loading');
      btn.querySelector('span').textContent = 'Use My Current Location';
      fab.classList.remove('loading');
      placePin(12.9716, 77.5946);
    },
    { timeout: 8000 }
  );
}

// MAP CONTROLS
function zoomIn(){ map.zoomIn(); }
function zoomOut(){ map.zoomOut(); }
function resetView(){ map.flyTo([20.5937, 78.9629], 5, { duration: 0.8 }); }

// SEARCH
let searchTimeout;
function handleSearch(e) {
  clearTimeout(searchTimeout);
  const q = e.target.value.trim();
  if (q.length < 3) return;
  searchTimeout = setTimeout(() => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q+' India')}&limit=1&accept-language=en`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          map.flyTo([+lat, +lon], 14, { duration: 1 });
          placePin(+lat, +lon);
          e.target.value = '';
        }
      }).catch(() => {});
  }, 500);
}
