(async () => {
  const placeholders = document.querySelectorAll('[data-include]');
  await Promise.all([...placeholders].map(async el => {
    const name = el.dataset.include;
    try {
      const res = await fetch(`partials/${name}.html`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      el.outerHTML = await res.text();
    } catch (e) {
      // Fail-soft: log and leave the placeholder <div data-include> in the DOM.
      // A missing nav/footer should not blank out the rest of the page.
      console.error(`include: failed to load partials/${name}.html`, e);
    }
  }));
  // Let page scripts know the partials are now in the DOM (e.g. the composite-section host).
  document.dispatchEvent(new Event('partials:loaded'));
  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (link) link.classList.add('active');
  }

  // Mobile hamburger toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    // Close after picking a destination, or on Escape
    links.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // Back-to-top button — long reference pages only
  const TOP_PAGES = ['frameworks', 'statistics'];
  if (TOP_PAGES.includes(page)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="ti ti-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
