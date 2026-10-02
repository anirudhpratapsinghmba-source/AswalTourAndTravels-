(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = $('#nav');
  const progress = $('#progress');

  // Global scroll state.
  let ticking = false;
  const updateScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (progress) progress.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    document.documentElement.style.setProperty('--scroll-y', y + 'px');

    // Hero becomes a cinematic opening frame as it leaves the viewport.
    const hero = $('.hero');
    if (hero && !reduceMotion) {
      const p = Math.min(1, Math.max(0, y / Math.max(1, innerHeight * .85)));
      hero.style.setProperty('--hero-scroll', p.toFixed(3));
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  // Section entrance choreography.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .06, rootMargin: '0px 0px -55px 0px' });

  $$('.reveal, .motion-reveal, .section, .trip-planner, .marquee, .manifesto, .process, .quote-section, .cta, footer, .inner-hero, .plan-wrap, .contact-strip, .immersive3d').forEach((el, i) => {
    if (!el.classList.contains('reveal') && !el.classList.contains('motion-reveal') && !el.classList.contains('hero')) {
      el.classList.add('motion-section');
    }
    el.style.setProperty('--delay', Math.min(i % 8, 7) * 70 + 'ms');
    revealObserver.observe(el);
  });

  // Scroll parallax — only real DOM elements, never pseudo-elements.
  const parallaxItems = [
    ...$$('.hero-media, .inner-hero-bg'),
    ...$$('.destination img, .pkg-img img, .manifesto-image'),
    ...$$('.theme-card')
  ];
  const parallaxTick = () => {
    if (!reduceMotion) {
      const vh = innerHeight;
      parallaxItems.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -120 || rect.top > vh + 120) return;
        const center = (rect.top + rect.height / 2 - vh / 2) / vh;
        const value = center * -18;
        if (el.classList.contains('theme-card')) {
          el.style.setProperty('--parallax-y', value.toFixed(2) + 'px');
        } else {
          el.style.setProperty('--parallax-y', value.toFixed(2) + 'px');
        }
      });
    }
    requestAnimationFrame(parallaxTick);
  };
  requestAnimationFrame(parallaxTick);

  // Desktop 3D tilt.
  $$('.theme-card, .destination, .package, .steps > div').forEach(card => {
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
    button.addEventListener('pointerleave', () => button.style.transform = '');
  });

  // Hero camera movement.
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

  // Interactive process timeline.
  $$('.steps').forEach(steps => {
    steps.addEventListener('pointermove', e => {
      const r = steps.getBoundingClientRect();
      steps.style.setProperty('--process-p', Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
    });
  });

  // Trip planner feedback.
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

  // Premium page-to-page fade.
  $$('a[href$=".html"], a[href^="http"]').forEach(a => {
    if (a.target === '_blank' || a.origin !== location.origin || a.getAttribute('href')?.startsWith('#')) return;
    a.addEventListener('click', e => {
      if (reduceMotion) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => location.href = a.href, 260);
    });
  });

  // Mobile menu.
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

  // Same-page smooth links.
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();