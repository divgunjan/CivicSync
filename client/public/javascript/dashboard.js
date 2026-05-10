// ── GLOBAL UTILITIES ──────────────────────────────────────────────
window.handleUpvote = async function (reportId, btn) {
  const userId = localStorage.getItem('tsim_user_email');
  if (!userId) {
    alert("Please login first to upvote issues!");
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(window.CONFIG.getEndpoint(`/report/${reportId}/upvote`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.success) {
      btn.innerHTML = `✓ ${data.report.upvotes}`;
      btn.style.background = '#1FA84A';
      btn.disabled = true;
      // Also update the local data if needed
    } else {
      alert(data.message || "Upvote failed");
    }
  } catch (err) {
    console.error("Upvote error:", err);
  }
};

// ── DASHBOARD INITIALIZATION ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── CITY DATA (lat/lon + issue info) ──────────────────────────────
  const cities = [
    { name: 'Delhi', lat: 28.61, lon: 77.21, issue: 'Waterlogging', score: 88, color: '#ef4444', r: 8 },
    { name: 'Mumbai', lat: 19.08, lon: 72.88, issue: 'Garbage Dumping', score: 74, color: '#d97706', r: 7 },
    { name: 'Bengaluru', lat: 12.97, lon: 77.59, issue: 'Pothole', score: 92, color: '#ef4444', r: 10 },
    { name: 'Hyderabad', lat: 17.38, lon: 78.49, issue: 'Road Damage', score: 67, color: '#d97706', r: 7 },
    { name: 'Chennai', lat: 13.08, lon: 80.27, issue: 'Drainage', score: 55, color: '#E8831A', r: 6 },
    { name: 'Kolkata', lat: 22.57, lon: 88.36, issue: 'Waterlogging', score: 71, color: '#d97706', r: 7 },
    { name: 'Pune', lat: 18.52, lon: 73.86, issue: 'Potholes', score: 48, color: '#1FA84A', r: 6 },
    { name: 'Jaipur', lat: 26.91, lon: 75.79, issue: 'Garbage', score: 42, color: '#1FA84A', r: 5 },
    { name: 'Ahmedabad', lat: 23.03, lon: 72.59, issue: 'Road Damage', score: 51, color: '#E8831A', r: 6 },
    { name: 'Lucknow', lat: 26.85, lon: 80.95, issue: 'Streetlight', score: 38, color: '#1FA84A', r: 5 },
  ];

  // ── TICKER ────────────────────────────────────────────────────────
  const tickerMessages = cities.map(c => `${c.name}: ${c.issue} — Score ${c.score}`);
  let tickerIdx = 0;
  const tickerEl = document.getElementById('mapTicker');

  function rotateTicker(msg) {
    if (!tickerEl) return;
    tickerEl.style.opacity = '0';
    tickerEl.style.transform = 'translateY(4px)';
    tickerEl.style.transition = 'opacity 0.28s, transform 0.28s';
    setTimeout(() => {
      tickerEl.textContent = msg || tickerMessages[tickerIdx];
      tickerEl.style.opacity = '1';
      tickerEl.style.transform = 'translateY(0)';
    }, 300);
  }
  setInterval(() => {
    tickerIdx = (tickerIdx + 1) % tickerMessages.length;
    rotateTicker();
  }, 3200);

  // ── NAV SCROLL & AUTH ─────────────────────────────────────────────
  const nav = document.querySelector('nav');
  const authBtn = document.querySelector('.btn-outline');
  const userEmail = localStorage.getItem('tsim_user_email');

  if (userEmail) {
    authBtn.textContent = 'Logout';
    authBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('tsim_user_email');
      localStorage.removeItem('tsim_user_logged_in');
      window.location.reload();
    });
  } else {
    authBtn.textContent = 'Login';
    authBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }

  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)';
    nav.style.boxShadow = window.scrollY > 40 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });

  // ── SMOOTH SCROLL ─────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // ── SCORE / BAR ANIMATION ─────────────────────────────────────────
  const bars = document.querySelectorAll('.score-bar, .bar-fill');
  const widths = Array.from(bars).map(b => b.style.width);
  bars.forEach(b => b.style.width = '0');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        bars.forEach((b, i) => setTimeout(() => { b.style.width = widths[i]; }, i * 60));
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const scoreSection = document.querySelector('.impact-section');
  if (scoreSection) io.observe(scoreSection);

  // ── D3 INDIA MAP ──────────────────────────────────────────────────
  const INDIA_GEOJSON_URL =
    'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

  const container = document.getElementById('india-d3-map');
  if (container && typeof d3 !== 'undefined') {
    const W = 480, H = 560;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'stateFill').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#e0f2ea');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#d0ead9');

    const proj = d3.geoMercator()
      .center([82.5, 22])
      .scale(900)
      .translate([W / 2, H / 2]);

    const pathGen = d3.geoPath().projection(proj);

    // Tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    document.body.appendChild(tooltip);

    fetch(INDIA_GEOJSON_URL)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(geo => {
        // Render States
        svg.append('g')
          .selectAll('path')
          .data(geo.features)
          .enter().append('path')
          .attr('class', 'state-path')
          .attr('d', pathGen)
          .attr('fill', 'url(#stateFill)')
          .on('mouseover', function (event, d) {
            d3.select(this).attr('fill', '#c2ddc9');
            const name = d.properties.NAME_1 || d.properties.ST_NM || d.properties.name || '';
            if (name) {
              tooltip.innerHTML = `<span style="font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px">${name}</span>`;
              tooltip.classList.add('visible');
            }
          })
          .on('mousemove', ev => {
            tooltip.style.left = (ev.clientX + 14) + 'px';
            tooltip.style.top = (ev.clientY - 10) + 'px';
          })
          .on('mouseleave', function () {
            d3.select(this).attr('fill', 'url(#stateFill)');
            tooltip.classList.remove('visible');
          });

        // Render Pins
        const pins = svg.append('g').attr('class', 'pins-layer');

        cities.forEach(city => {
          const [x, y] = proj([city.lon, city.lat]);
          const group = pins.append('g')
            .attr('class', 'city-pin-group')
            .attr('transform', `translate(${x}, ${y})`)
            .on('mouseover', (ev) => {
              tooltip.innerHTML = `
                <div style="font-weight:800; font-size:14px; color:#1a1a1a; margin-bottom:4px;">${city.name}</div>
                <div style="font-size:12px; color:#ef4444; font-weight:700; margin-bottom:2px;">${city.issue}</div>
                <div style="font-size:11px; color:#64748b;">Impact Score: <span style="color:#1FA84A; font-weight:800;">${city.score}</span></div>
              `;
              tooltip.classList.add('visible');
            })
            .on('mousemove', ev => {
              tooltip.style.left = (ev.clientX + 15) + 'px';
              tooltip.style.top = (ev.clientY - 15) + 'px';
            })
            .on('mouseleave', () => tooltip.classList.remove('visible'));

          // Pulsing rings
          group.append('circle')
            .attr('class', 'pin-ring-outer')
            .attr('r', 0)
            .attr('fill', city.color)
            .attr('opacity', 0.4);

          group.append('circle')
            .attr('class', 'pin-ring-inner')
            .attr('r', 0)
            .attr('fill', city.color)
            .attr('opacity', 0.6);

          // Core dot
          group.append('circle')
            .attr('class', 'pin-core-circle')
            .attr('r', city.r || 6)
            .attr('fill', city.color);
        });
      })
      .catch(err => console.error("Map load error:", err));
  }

  // ── LIVE RANKING ──────────────────────────────────────────────────
  async function updateLiveRanking() {
    const rankingContainer = document.querySelector('.score-demo');
    if (!rankingContainer) return;

    try {
      const res = await fetch(window.CONFIG.getEndpoint('/report'));
      const data = await res.json();
      if (!data.success || !data.reports) return;

      // Filter for reports that actually have data and sort by upvotes/newest
      const topReports = data.reports
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 3);

      if (topReports.length === 0) return;

      // Keep the title
      const title = rankingContainer.querySelector('.score-demo-title');
      const footer = rankingContainer.querySelector('div[style*="background:rgba(31,168,74,0.06)"]');

      rankingContainer.innerHTML = '';
      if (title) rankingContainer.appendChild(title);

      topReports.forEach(r => {
        const score = r.impactScore || 0;
        const priority = r.priority || 'low';
        const color = priority === 'critical' ? '#ef4444' : priority === 'high' ? '#d97706' : '#E8831A';
        const statusClass = `score-${priority}`;
        const badgeText = priority.toUpperCase();

        const card = document.createElement('div');
        card.className = 'score-issue-card';
        card.innerHTML = `
          <div class="score-num ${statusClass}">${score}</div>
          <div class="score-issue-info">
            <div class="score-issue-type" style="text-transform: capitalize;">${r.type} — ${r.area || (r.address ? r.address.split(',')[0] : 'Local Area')}</div>
            <div class="score-issue-city">${r.city || 'Local Area'} · ${Math.floor((Date.now() - new Date(r.createdAt)) / 86400000)} days unresolved</div>
            <div class="score-bar-wrap" style="margin-top:8px">
              <div class="score-bar" style="width:${Math.min(100, score)}%; background:${color};"></div>
            </div>
          </div>
          <span class="status-badge badge-reported" style="align-self:flex-start">${badgeText}</span>
        `;
        rankingContainer.appendChild(card);
      });

      if (footer) rankingContainer.appendChild(footer);

    } catch (err) {
      console.error("Failed to update live ranking:", err);
    }
  }

  // ── UPDATE ANALYTICS ──────────────────────────────────────────────
  async function updateAnalytics() {
    try {
      const res = await fetch(window.CONFIG.getEndpoint('/report'));
      const data = await res.json();
      if (!data.success || !data.reports) return;

      const reports = data.reports;

      // 1. Issue Types
      const issueCounts = {};
      reports.forEach(r => {
        issueCounts[r.type] = (issueCounts[r.type] || 0) + 1;
      });

      const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
      const maxCount = sortedIssues[0] ? sortedIssues[0][1] : 1;

      const analyticsCard = document.querySelector('.analytics-card');
      if (analyticsCard) {
        const barRows = analyticsCard.querySelectorAll('.bar-row');
        sortedIssues.slice(0, 6).forEach((issue, idx) => {
          if (barRows[idx]) {
            const [type, count] = issue;
            const percentage = (count / maxCount) * 100;
            barRows[idx].querySelector('.bar-label').textContent = type.charAt(0).toUpperCase() + type.slice(1);
            barRows[idx].querySelector('.bar-fill').style.width = `${percentage}%`;
            barRows[idx].querySelector('.bar-count').textContent = count;
          }
        });
      }

      // 2. City Spotlight
      const cityCounts = {};
      reports.forEach(r => {
        if (r.city) {
          cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
        }
      });

      const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
      const spotlightChips = document.querySelectorAll('.stat-chip');

      if (sortedCities[0] && spotlightChips[0]) {
        spotlightChips[0].querySelector('.off-white').textContent = sortedCities[0][0];
        spotlightChips[0].querySelector('.chip-val').textContent = sortedCities[0][1];
      }

      const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'fixed').length;
      if (spotlightChips[1]) {
        spotlightChips[1].querySelector('.chip-val').textContent = resolvedCount;
      }

    } catch (err) {
      console.error("Analytics update failed:", err);
    }
  }

  updateLiveRanking();
  updateAnalytics();
});

