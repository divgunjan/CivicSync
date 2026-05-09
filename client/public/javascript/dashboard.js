
  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Animate score bars on scroll into view
  const bars = document.querySelectorAll('.score-bar, .bar-fill');
  const widths = Array.from(bars).map(b => b.style.width);
  bars.forEach(b => b.style.width = '0');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach((b, i) => { b.style.width = widths[i]; });
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const scoreSection = document.querySelector('.impact-section');
  if (scoreSection) io.observe(scoreSection);

  // Nav scroll effect updated for light mode
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(255, 255, 255, 0.98)'
      : 'rgba(255, 255, 255, 0.92)';
    nav.style.boxShadow = window.scrollY > 40
      ? '0 4px 20px rgba(0,0,0,0.05)'
      : 'none';
  });

// ── CITY DATA (lat/lon + issue info) ──────────────────────────────
const cities = [
  { name:'Delhi',      lat:28.61, lon:77.21, issue:'Waterlogging',   score:88, color:'#ef4444', r:8  },
  { name:'Mumbai',     lat:19.08, lon:72.88, issue:'Garbage Dumping',score:74, color:'#d97706', r:7  },
  { name:'Bengaluru',  lat:12.97, lon:77.59, issue:'Pothole',        score:92, color:'#ef4444', r:10 },
  { name:'Hyderabad',  lat:17.38, lon:78.49, issue:'Road Damage',    score:67, color:'#d97706', r:7  },
  { name:'Chennai',    lat:13.08, lon:80.27, issue:'Drainage',       score:55, color:'#E8831A', r:6  },
  { name:'Kolkata',    lat:22.57, lon:88.36, issue:'Waterlogging',   score:71, color:'#d97706', r:7  },
  { name:'Pune',       lat:18.52, lon:73.86, issue:'Potholes',       score:48, color:'#1FA84A', r:6  },
  { name:'Jaipur',     lat:26.91, lon:75.79, issue:'Garbage',        score:42, color:'#1FA84A', r:5  },
  { name:'Ahmedabad',  lat:23.03, lon:72.59, issue:'Road Damage',    score:51, color:'#E8831A', r:6  },
  { name:'Lucknow',    lat:26.85, lon:80.95, issue:'Streetlight',    score:38, color:'#1FA84A', r:5  },
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

// ── NAV SCROLL ────────────────────────────────────────────────────
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 40 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)';
  nav.style.boxShadow  = window.scrollY > 40 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior:'smooth' }); }
  });
});

// ── SCORE / BAR ANIMATION ─────────────────────────────────────────
const bars   = document.querySelectorAll('.score-bar, .bar-fill');
const widths = Array.from(bars).map(b => b.style.width);
bars.forEach(b => b.style.width = '0');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      bars.forEach((b,i) => setTimeout(() => { b.style.width = widths[i]; }, i * 60));
      io.disconnect();
    }
  });
}, { threshold: 0.3 });
const scoreSection = document.querySelector('.impact-section');
if (scoreSection) io.observe(scoreSection);

// ── D3 INDIA MAP ──────────────────────────────────────────────────
const INDIA_GEOJSON_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

const container = document.getElementById('india-d3-map');
if (container && typeof d3 !== 'undefined') {
  const W = 480, H = 560;

  const svg = d3.select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const defs = svg.append('defs');
  const grad = defs.append('linearGradient')
    .attr('id','stateFill').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
  grad.append('stop').attr('offset','0%').attr('stop-color','#e0f2ea');
  grad.append('stop').attr('offset','100%').attr('stop-color','#d0ead9');

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
      svg.append('g')
        .selectAll('path')
        .data(geo.features)
        .enter().append('path')
          .attr('class','state-path')
          .attr('d', pathGen)
          .on('mouseover', function(event, d) {
            d3.select(this).attr('fill','#c2ddc9');
            const name = d.properties.NAME_1 || d.properties.ST_NM || d.properties.name || '';
            if (name) {
              tooltip.innerHTML = `<span style="font-weight:700;font-family:'Syne',sans-serif;font-size:13px">${name}</span>`;
              tooltip.classList.add('visible');
            }
          })
          .on('mousemove', ev => {
            tooltip.style.left = (ev.clientX + 14) + 'px';
            tooltip.style.top  = (ev.clientY - 10) + 'px';
          })
          .on('mouseleave', function() {
            d3.select(this).attr('fill','url(#stateFill)');
            tooltip.classList.remove('visible');
          });

      drawPins(svg, proj, tooltip);
    })
    .catch(() => drawPins(svg, proj, tooltip));
}

function drawPins(svg, proj, tooltip) {
  const delays = [0,300,600,150,450,750,200,500,350,100];

  cities.forEach((city, i) => {
    const [px, py] = proj([city.lon, city.lat]);
    const delay = delays[i % delays.length];
    const labelW = city.name.length * 6.8 + 14;

    const g = svg.append('g')
      .attr('class','city-pin-group')
      .attr('transform', `translate(${px},${py})`);

    // Animated ring 1
    g.append('circle')
      .attr('r', city.r + 2)
      .attr('fill','none')
      .attr('stroke', city.color)
      .attr('stroke-width','1.5')
      .attr('opacity','0')
      .style('animation','pingRingD3 2.4s ease-out infinite')
      .style('animation-delay', delay + 'ms')
      .style('transform-box','fill-box')
      .style('transform-origin','center');

    // Animated ring 2
    g.append('circle')
      .attr('r', city.r + 2)
      .attr('fill','none')
      .attr('stroke', city.color)
      .attr('stroke-width','1')
      .attr('opacity','0')
      .style('animation','pingRingD3 2.4s ease-out infinite')
      .style('animation-delay', (delay + 600) + 'ms')
      .style('transform-box','fill-box')
      .style('transform-origin','center');

    // Core dot
    const core = g.append('circle')
      .attr('class','pin-core-circle')
      .attr('r', city.r)
      .attr('fill', city.color)
      .attr('stroke','white')
      .attr('stroke-width','2.5');

    // Label pill
    const lx = -labelW / 2;
    const ly = -(city.r + 27);
    g.append('rect')
      .attr('x', lx).attr('y', ly)
      .attr('width', labelW).attr('height', 17)
      .attr('rx', 8.5)
      .attr('fill','white')
      .attr('stroke','rgba(0,0,0,0.08)')
      .attr('stroke-width','0.8');

    g.append('text')
      .attr('x', 0).attr('y', ly + 11.5)
      .attr('text-anchor','middle')
      .attr('font-family',"'DM Sans', sans-serif")
      .attr('font-size','9.5')
      .attr('font-weight','600')
      .attr('fill','#1a1a1a')
      .text(city.name);

    // Interactions
    g.on('mouseenter', function(event) {
      core.attr('r', city.r + 3.5);
      tooltip.innerHTML = `
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:14px;margin-bottom:3px">${city.name}</div>
        <div style="font-size:11.5px;color:#64748b;margin-bottom:8px">${city.issue}</div>
        <div style="display:flex;align-items:baseline;gap:6px">
          <span style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:${city.color};line-height:1">${city.score}</span>
          <span style="font-size:11px;color:#94a3b8">Impact Score</span>
        </div>`;
      tooltip.classList.add('visible');
    })
    .on('mousemove', ev => {
      tooltip.style.left = (ev.clientX + 16) + 'px';
      tooltip.style.top  = (ev.clientY - 14) + 'px';
    })
    .on('mouseleave', function() {
      core.attr('r', city.r);
      tooltip.classList.remove('visible');
    })
    .on('click', () => rotateTicker(`${city.name}: ${city.issue} — Score ${city.score}`));
  });
}
