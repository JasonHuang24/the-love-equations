(async () => {
  const WIDTH_KEY = 'le-content-width';
  const root = document.documentElement;
  // Each page head stamps this same value before styles.css paints, so a stored
  // preference cannot flash. Keep the two rules identical — change both together.
  let widthMode = 'original';
  try {
    if (localStorage.getItem(WIDTH_KEY) === 'wide') widthMode = 'wide';
  } catch (e) {
    // Storage can be unavailable in privacy-restricted contexts; the toggle still works for this page.
  }
  root.dataset.contentWidth = widthMode;
  // Every page has one content wrapper; preserve Lab's native main and its ID.
  // Install this before fetching partials so the bypass remains usable if a
  // navigation request fails or is slow.
  const main = document.querySelector('main, .page');
  if (main) {
    if (main.tagName !== 'MAIN') main.setAttribute('role', 'main');
    if (!main.id) main.id = 'main-content';
    main.setAttribute('tabindex', '-1');
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = `#${main.id}`;
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }
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
    if (link) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }
  }

  const widthToggle = document.querySelector('.width-toggle');
  if (widthToggle) {
    const renderWidthToggle = () => {
      const isWide = widthMode === 'wide';
      const nextLabel = isWide ? 'original' : 'wide';
      widthToggle.setAttribute('aria-pressed', isWide ? 'true' : 'false');
      widthToggle.setAttribute('aria-label', `Switch to ${nextLabel} content width`);
      widthToggle.title = `Switch to ${nextLabel} width`;
      const icon = widthToggle.querySelector('i');
      if (icon) icon.className = `ti ${isWide ? 'ti-arrows-minimize' : 'ti-arrows-maximize'}`;
    };

    widthToggle.addEventListener('click', () => {
      widthMode = widthMode === 'wide' ? 'original' : 'wide';
      root.dataset.contentWidth = widthMode;
      try { localStorage.setItem(WIDTH_KEY, widthMode); } catch (e) { /* page-only fallback */ }
      renderWidthToggle();
    });
    renderWidthToggle();
  }
  // Mobile hamburger toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    const collapsed = window.matchMedia('(max-width: 1480px)');
    let navFocus = null;
    document.addEventListener('focusin', (event) => {
      navFocus = event.target === toggle || links.contains(event.target) ? event.target : null;
    });
    document.addEventListener('focusout', (event) => {
      // A deliberate blur should not be restored. A responsive display:none
      // blur can precede the media-query event, so remember that hidden control.
      if (event.target === navFocus && !event.relatedTarget && event.target.getClientRects().length) navFocus = null;
    });
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Do not leave keyboard focus inside a menu that has just become hidden.
      if (!open && collapsed.matches && links.contains(document.activeElement)) {
        toggle.focus({ preventScroll: true });
      }
    };
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    // Close after picking a destination, or on Escape
    links.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
    collapsed.addEventListener('change', () => {
      const previousFocus = document.activeElement === document.body ? navFocus : document.activeElement;
      setOpen(false);
      if (collapsed.matches && links.contains(previousFocus)) toggle.focus({ preventScroll: true });
      // The hamburger itself is hidden on desktop; return its focus to a link.
      if (!collapsed.matches && previousFocus === toggle) {
        (links.querySelector('[aria-current="page"]') || links.querySelector('.nav-link'))?.focus({ preventScroll: true });
      }
    });
  }

  // Back-to-top button — long reference pages only
  const TOP_PAGES = ['frameworks', 'statistics', 'mythbuster', 'lexicon'];
  if (TOP_PAGES.includes(page)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="ti ti-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => {
      const heading = document.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
