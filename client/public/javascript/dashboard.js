
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
