(() => {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }, { passive: true });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .motion-reveal, .destination, .package, .theme-card, .steps > div, .principles > div').forEach((el, i) => {
    if (!el.classList.contains('reveal') && !el.classList.contains('motion-reveal')) el.classList.add('motion-reveal');
    el.style.setProperty('--delay', Math.min(i % 6, 5) * 70 + 'ms');
    observer.observe(el);
  });

  const tripForm = document.getElementById('tripForm');
  if (tripForm) {
    tripForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(tripForm);
      const note = document.getElementById('formNote');
      if (!note) return;
      const dest = data.get('destination') || 'your destination';
      note.textContent = `Perfect — we'll shape a custom ${dest} journey for ${data.get('travellers') || 1} traveller(s). Connect with us on WhatsApp or call the travel desk to continue.`;
      note.style.color = '#e8793f';
    });
  }

  // Mobile menu works on every page.
  const menuButton = document.getElementById('menu');
  if (menuButton && !document.getElementById('mobileMenu')) {
    const panel = document.createElement('div');
    panel.id = 'mobileMenu';
    panel.className = 'mobile-menu';
    panel.innerHTML = `
      <div class="mobile-menu-inner">
        <button class="mobile-close" aria-label="Close menu">×</button>
        <span class="eyebrow">ASWAL TOUR & TRAVELS</span>
        <a href="index.html">Home <span>↗</span></a>
        <a href="destinations.html">Destinations <span>↗</span></a>
        <a href="packages.html">Packages <span>↗</span></a>
        <a href="experiences.html">Experiences <span>↗</span></a>
        <a href="about.html">Why Aswal <span>↗</span></a>
        <a class="mobile-plan" href="plan.html">Plan My Trip <span>↗</span></a>
      </div>`;
    document.body.appendChild(panel);

    const close = () => {
      panel.classList.remove('open');
      menuButton.classList.remove('active');
      document.body.classList.remove('menu-open');
    };
    menuButton.addEventListener('click', () => {
      panel.classList.add('open');
      menuButton.classList.add('active');
      document.body.classList.add('menu-open');
    });
    panel.querySelector('.mobile-close').addEventListener('click', close);
    panel.addEventListener('click', e => { if (e.target === panel) close(); });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  // Smooth only same-page anchors; never hijack real page navigation.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();