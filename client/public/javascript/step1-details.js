let pinnedLat = null, pinnedLng = null;
let confirmedLat = null, confirmedLng = null;
let confirmedAddress = '';
let tempMarker = null, confirmedMarker = null;
let map, pinCard, clickHint, markersCluster;
let pendingLat = null, pendingLng = null;

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

  // Initialize MarkerClusterGroup
  markersCluster = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let c = ' marker-cluster-';
      if (count < 4) {
        c += 'small';
      } else if (count < 10) {
        c += 'medium';
      } else {
        c += 'large';
      }
      return new L.DivIcon({ 
        html: '<div><span>' + count + '</span></div>', 
        className: 'marker-cluster' + c, 
        iconSize: new L.Point(40, 40) 
      });
    }
  });
  map.addLayer(markersCluster);

  map.on('click', (e) => {
    handleMapClick(e.latlng.lat, e.latlng.lng);
  });

  map.on('movestart', () => { clickHint.style.opacity = '0'; });
  
  // Fetch nearby reports when map stops moving
  map.on('moveend', fetchNearbyReports);
  
  // Fetch initial pins
  fetchNearbyReports();
});

// FETCH REPORTS BY BOUNDS
async function fetchNearbyReports() {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  
  try {
    const res = await fetch(window.CONFIG.getEndpoint(`/report/bounds?swLng=${sw.lng}&swLat=${sw.lat}&neLng=${ne.lng}&neLat=${ne.lat}`));
    const data = await res.json();
    if (data.success) {
      renderReports(data.reports);
    }
  } catch(e) {
    console.error('Failed to fetch reports', e);
  }
}

// RENDER REPORTS
let renderedReportIds = new Set();
function renderReports(reports) {
  const recentList = document.getElementById('recent-reports-list');
  if (recentList && recentList.querySelector('.recent-loading')) {
    recentList.innerHTML = '';
  }

  reports.forEach(r => {
    if (renderedReportIds.has(r._id)) return;
    renderedReportIds.add(r._id);
    
    // Create an icon for the existing report based on status
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:20px;height:20px;
        background:#1A9E4A;
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    const marker = L.marker([r.location.coordinates[1], r.location.coordinates[0]], { icon });
    
    const isAbsolute = r.imageUrl && r.imageUrl.startsWith('http');
    const imgSrc = isAbsolute ? r.imageUrl : window.CONFIG.getEndpoint(r.imageUrl.replace(/\\/g, '/'));
    const imgHtml = r.imageUrl ? `<img src="${imgSrc}" alt="Report Image">` : '';
    
    marker.on('click', () => {
      openSidebarDetails(r, imgHtml);
    });
    
    markersCluster.addLayer(marker);

    // Add to Recent List
    if (recentList) {
      const item = document.createElement('div');
      item.className = 'recent-item';
      item.innerHTML = `
        ${r.imageUrl ? `<img src="${imgSrc}" class="recent-img">` : '<div class="recent-img" style="display:flex;align-items:center;justify-content:center;background:#f4f6f9;color:#8A97AA;font-size:10px">No Pic</div>'}
        <div class="recent-info">
          <div class="recent-type">${r.type}</div>
          <div class="recent-addr">${r.address || r.area || 'Unknown Location'}</div>
        </div>
      `;
      item.onclick = () => {
        map.flyTo([r.location.coordinates[1], r.location.coordinates[0]], 16, { duration: 1 });
        setTimeout(() => openSidebarDetails(r, imgHtml), 1100);
      };
      recentList.prepend(item);
    }
  });
}

// SIDEBAR DETAILS RENDERING
window.openSidebarDetails = function(r, imgHtml) {
  document.getElementById('new-complaint-view').style.display = 'none';
  const sidebar = document.getElementById('existing-report-view');
  sidebar.style.display = 'flex';
  
  const daysSince = Math.floor((Date.now() - new Date(r.createdAt)) / 86400000);
  const urgencyText = daysSince === 0 ? "Reported Today" : `${daysSince} Days Since Last Report`;

  sidebar.innerHTML = `
    <div class="form-header" style="margin-bottom: 20px;">
      <div class="form-header-tag" style="color:#0B1F3A; border-color:#0B1F3A; background:#f4f6f9;">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" stroke="#0B1F3A" stroke-width="1.2"/>
          <circle cx="5" cy="5" r="1.5" fill="#0B1F3A"/>
        </svg>
        Reported Issue
      </div>
      <h2 style="text-transform: capitalize; margin-bottom: 4px;">${r.type}</h2>
      <div style="display:flex; flex-direction:column;">
        <p style="color:#8A97AA; font-size:13px; margin:0;">Submitted on ${new Date(r.createdAt).toLocaleDateString()}</p>
        <div class="urgency-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m9.05 14.81 1.41-1.41"/><path d="M14.05 14.81 15 15.75"/><path d="M12 2v2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M12 20v2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M2 12h2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M12 12v.01"/></svg>
          ${urgencyText}
        </div>
      </div>
    </div>
    
    <div style="flex:1; overflow-y:auto; padding-right:8px; padding-bottom: 20px;">
      <!-- Premium Card -->
      <div style="background: #ffffff; border: 1px solid #e1e7f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        
        <!-- Image Header -->
        ${imgHtml ? `<div style="width:100%; height:200px; overflow:hidden; border-bottom: 1px solid #e1e7f0;">${imgHtml.replace('height: 120px;', 'width: 100%; height: 100%; object-fit: cover; border-radius: 0; margin: 0;')}</div>` : '<div style="width:100%; height:120px; background:#f4f6f9; display:flex; align-items:center; justify-content:center; color:#8A97AA; font-size:13px; border-bottom: 1px solid #e1e7f0;">No photo evidence provided</div>'}
        
        <!-- Card Content -->
        <div style="padding: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span style="background:rgba(232, 131, 26, 0.1); color:#E8831A; padding:4px 10px; border-radius:100px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">${r.status}</span>
            <span style="font-size:13px; font-weight:600; color:#0B1F3A; background: #f4f6f9; padding: 4px 10px; border-radius: 100px;">👍 <span id="sidebar-upvotes-${r._id}">${r.upvotes}</span> Upvotes</span>
          </div>
          
          <p style="font-size:14px; color:#4a5568; line-height:1.6; margin:0 0 18px 0;">
            ${r.description || 'No detailed description was provided for this issue.'}
          </p>
          
          <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:20px; background: #fcfcfd; padding: 12px; border-radius: 8px; border: 1px solid #f0f2f5;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0; margin-top:2px;"><circle cx="8" cy="6" r="3.5" stroke="#1A9E4A" stroke-width="1.5"/><path d="M8 16S2 10.5 2 6a6 6 0 0112 0C14 10.5 8 16 8 16z" stroke="#1A9E4A" stroke-width="1.5" fill="none"/></svg>
            <span style="font-size:13px; color:#5c6b80; line-height:1.5;">${r.address || r.area || 'Unknown Location'}</span>
          </div>
          ${r.authorityEmail ? `<div style="font-size:13px; color:#5c6b80; margin-bottom:15px; padding:8px 12px; background:#f4f6f9; border-radius:6px; border-left:3px solid #1A9E4A;"><strong>Assigned to:</strong> ${r.authorityEmail}</div>` : ''}

          <a href="track-issue.html?id=${r._id}" style="display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#1A9E4A; text-decoration:none; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
            View Full Report Details 
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </a>
        </div>
      </div>
    </div>
    
    <div class="form-footer" style="padding-top:16px; border-top: 1px solid #e1e7f0; display:flex; flex-direction:column; gap:12px;">
      <button onclick="upvoteReport('${r._id}', true)" style="background:#E8831A; color:white; border:none; padding:14px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; width:100%; transition:background 0.2s; font-family:'Poppins';" onmouseover="this.style.background='#d07517'" onmouseout="this.style.background='#E8831A'">👍 Upvote This Issue</button>
      <button onclick="flagReport('${r._id}', true)" style="background:#dc3545; color:white; border:none; padding:14px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; width:100%; transition:background 0.2s; font-family:'Poppins';" onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">🚩 Flag This Issue</button>
      <button onclick="closeSidebarDetails()" style="background:none; border:none; color:#8A97AA; cursor:pointer; font-family:'Poppins'; font-size:13px; font-weight:500; transition:color 0.2s;" onmouseover="this.style.color='#0B1F3A'" onmouseout="this.style.color='#8A97AA'">← Back to Map view</button>
    </div>
  `;
}

window.closeSidebarDetails = function() {
  document.getElementById('existing-report-view').style.display = 'none';
  document.getElementById('new-complaint-view').style.display = 'block';
}

window.upvoteReport = async function(id, fromSidebar = false) {
  try {
    const res = await fetch(window.CONFIG.getEndpoint(`/report/${id}/upvote`), { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      if (fromSidebar) {
        document.getElementById(`sidebar-upvotes-${id}`).textContent = data.report.upvotes;
      } else {
        const upvoteSpan = document.getElementById(`upvotes-${id}`);
        if(upvoteSpan) upvoteSpan.textContent = data.report.upvotes;
      }
    }
  } catch(e) { console.error(e); }
};

window.flagReport = async function(id) {
  try {
    const res = await fetch(window.CONFIG.getEndpoint(`/report/${id}/flag`), { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      alert('Issue has been flagged.');
    }
  } catch(e) { console.error(e); }
};

// DUPLICATE CHECK LOGIC
async function handleMapClick(lat, lng) {
  try {
    const res = await fetch(window.CONFIG.getEndpoint(`/report/nearby?lng=${lng}&lat=${lat}`));
    const data = await res.json();
    
    if (data.success && data.reports && data.reports.length > 0) {
      pendingLat = lat;
      pendingLng = lng;
      document.getElementById('dup-modal').classList.add('visible');
    } else {
      placePin(lat, lng);
    }
  } catch (err) {
    console.error("Duplicate check failed", err);
    placePin(lat, lng);
  }
}

window.continuePinning = function() {
  document.getElementById('dup-modal').classList.remove('visible');
  if (pendingLat && pendingLng) {
    placePin(pendingLat, pendingLng);
    pendingLat = null;
    pendingLng = null;
  }
}

window.closeDupModal = function() {
  document.getElementById('dup-modal').classList.remove('visible');
  pendingLat = null;
  pendingLng = null;
}

// CUSTOM MARKER FOR NEW PINS
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

window.confirmPin = function() {
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

window.cancelPin = function() {
  if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
  pinCard.classList.remove('visible');
  pinnedLat = null; pinnedLng = null;
  clickHint.style.opacity = '1';
}

window.clearPin = function() {
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

window.triggerMapClick = function() {
  map.flyTo([20.5937, 78.9629], 5, { duration: 0.4 });
  clickHint.style.opacity = '1';
}

// AUTO DETECT
window.detectLocation = function() {
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
      handleMapClick(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      btn.classList.remove('loading');
      btn.querySelector('span').textContent = 'Use My Current Location';
      fab.classList.remove('loading');
      handleMapClick(12.9716, 77.5946);
    },
    { timeout: 8000 }
  );
}

// MAP CONTROLS
window.zoomIn = function(){ map.zoomIn(); }
window.zoomOut = function(){ map.zoomOut(); }
window.resetView = function(){ map.flyTo([20.5937, 78.9629], 5, { duration: 0.8 }); }

// SEARCH
let searchTimeout;
window.handleSearch = function(e) {
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
          handleMapClick(+lat, +lon);
          e.target.value = '';
        }
      }).catch(() => {});
  }, 500);
}
