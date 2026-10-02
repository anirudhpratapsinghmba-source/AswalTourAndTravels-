(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nav = $('#nav');
  const progress = $('#progress');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollY = window.scrollY;
  let targetScrollY = scrollY;
  let ticking = false;

  // Navigation + global scroll state.
  const updateScroll = () => {
    scrollY = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    document.documentElement.style.setProperty('--scroll-y', scrollY + 'px');
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  // Reveal every major block with a staggered entrance.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -70px 0px' });

  $$('.reveal, .motion-reveal, .section, .trip-planner, .marquee, .manifesto, .process, .quote-section, .cta, footer, .inner-hero, .plan-wrap, .contact-strip').forEach((el, i) => {
    if (!el.classList.contains('reveal') && !el.classList.contains('motion-reveal') && !el.classList.contains('hero')) {
      el.classList.add('motion-section');
    }
    el.style.setProperty('--delay', Math.min(i % 7, 6) * 65 + 'ms');
    revealObserver.observe(el);
  });

  // Automatic parallax layers. The effect is intentionally subtle so content stays readable.
  const parallaxItems = [
    ...$$('.hero-media, .inner-hero-bg'),
    ...$$('.destination img, .pkg-img img, .manifesto-image, .theme-card:before')
  ];
  const parallaxTick = () => {
    const vh = innerHeight;
    parallaxItems.forEach(el => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      const center = (rect.top + rect.height / 2 - vh / 2) / vh;
      const speed = el.classList.contains('hero-media') || el.classList.contains('inner-hero-bg') ? -18 : -10;
      el.style.setProperty('--parallax-y', (center * speed).toFixed(2) + 'px');
    });
    requestAnimationFrame(parallaxTick);
  };
  if (!reduceMotion) requestAnimationFrame(parallaxTick);

  // 3D card tilt on desktop.
  const tiltCards = $$('.theme-card, .destination, .package, .steps > div');
  tiltCards.forEach(card => {
    card.classList.add('tilt-card');
    card.addEventListener('pointermove', e => {
      if (innerWidth < 901 || reduceMotion) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
      card.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.classList.remove('is-tilting');
    });
  });

  // Magnetic buttons.
  $$('.button, .outline-link, .nav-cta').forEach(button => {
    button.classList.add('magnetic');
    button.addEventListener('pointermove', e => {
      if (innerWidth < 901 || reduceMotion) return;
      const r = button.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      button.style.transform = 'translate3d(' + x * .10 + 'px,' + y * .10 + 'px,0)';
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });

  // Hero mouse movement creates a cinematic camera feel.
  const hero = $('.hero');
  if (hero && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      if (innerWidth < 901) return;
      const x = (e.clientX / innerWidth - .5) * 2;
      const y = (e.clientY / innerHeight - .5) * 2;
      hero.style.setProperty('--hero-x', (x * 10).toFixed(2) + 'px');
      hero.style.setProperty('--hero-y', (y * 7).toFixed(2) + 'px');
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--hero-x', '0px');
      hero.style.setProperty('--hero-y', '0px');
    });
  }

  // Scroll-driven number/line movement in the process section.
  $$('.steps').forEach(steps => {
    steps.addEventListener('pointermove', e => {
      const r = steps.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      steps.style.setProperty('--process-p', p);
    });
  });

  // Trip planner.
  const tripForm = $('#tripForm');
  if (tripForm) {
    tripForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(tripForm);
      const note = $('#formNote');
      if (!note) return;
      const dest = data.get('destination') || 'your destination';
      note.textContent = `Perfect — we'll shape a custom ${dest} journey for ${data.get('travellers') || 1} traveller(s). Connect with us on WhatsApp or call the travel desk to continue.`;
      note.style.color = '#e8793f';
      note.classList.remove('pulse-note');
      void note.offsetWidth;
      note.classList.add('pulse-note');
    });
  }

  // Mobile menu works on every page.
  const menuButton = $('#menu');
  if (menuButton && !$('#mobileMenu')) {
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
    $('.mobile-close', panel).addEventListener('click', close);
    panel.addEventListener('click', e => { if (e.target === panel) close(); });
    $$('a', panel).forEach(a => a.addEventListener('click', close));
  }

  // Smooth same-page anchors.
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
})();