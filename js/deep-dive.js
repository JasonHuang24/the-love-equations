/* Deep Dive essay shell — the era timeline is the navigation spine:
   era scrollspy, progress-within-era indicator, docking (with visible year
   labels), era-click jumps, and mobile auto-centring of the active chip.

   Scroll architecture (kept deliberately defensive; the original per-frame
   layout thrash and self-scheduling rAF were real defects, so those fixes
   stand — note the earlier "renderer freeze / won't scroll" symptoms turned
   out to be a backgrounded-tab artifact (rAF throttled + scroll-behavior:
   smooth never progressing), NOT a page bug, so no root cause is claimed):
     • One requestAnimationFrame per scroll burst; it never reschedules
       itself. The callback reads scrollY once, then writes only what changed.
     • All layout geometry (section offsets, dock line/delta, doc height,
       viewport, strip metrics) is cached on load + debounced resize.
     • Docking's height change is reserved by a spacer, so it does not alter
       document scroll geometry (belt-and-suspenders; also removes any dock
       jitter).
     • The only writes to WINDOW scroll are user-initiated (back-to-top click,
       era-anchor jump via href). Active-chip centring writes the horizontal
       TRACK scroll only — never the window — so it cannot re-enter the window
       scroll handler; it uses cached geometry and fires only on era change.

   Self-contained: does not touch include.js (whose back-to-top TOP_PAGES
   allow-list intentionally excludes deep-dive). */
(function () {
  const sections = [...document.querySelectorAll('.dd-section')];
  if (!sections.length) return;

  const timeline = document.querySelector('.dd-timeline');
  const track = document.querySelector('.dd-timeline-track');
  const progressFill = document.querySelector('.dd-timeline-progress-fill');

  const eras = new Map();
  document.querySelectorAll('.dd-era').forEach((el) => {
    eras.set(el.getAttribute('href').slice(1), el);
  });

  const READ_LINE = 0.32; // reading line, as a fraction of viewport height
  const DOCK_HYST = 24;    // dock at docLine+H, undock at docLine-H (~48px band)

  // Spacer reserves the docked/undocked height difference so docking never
  // changes document height. Inserted right after the timeline in flow.
  let spacer = null;
  if (timeline) {
    spacer = document.createElement('div');
    spacer.className = 'dd-timeline-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.height = '0px';
    timeline.insertAdjacentElement('afterend', spacer);
  }

  // ── Cached geometry — computed on load and on debounced resize, never per-frame ──
  let viewportH = 0;
  let docHeight = 0;
  let docLine = 0;
  let dockDelta = 0;
  let btnLine = 0;
  let sectionTops = [];
  let sectionEnds = [];
  let trackOverflows = false;
  const eraCentre = new Map(); // section id → cached target scrollLeft to centre its chip

  // ── Docking state (class + compensating spacer toggle together) ──
  let docked = false;
  function shouldDock(y) {
    return docked ? y > docLine - DOCK_HYST : y > docLine + DOCK_HYST;
  }
  function applyDock(want) {
    if (!timeline || want === docked) return;
    docked = want;
    timeline.classList.toggle('docked', want);
    if (spacer) spacer.style.height = want ? dockDelta + 'px' : '0px';
  }

  function measure() {
    viewportH = window.innerHeight;
    // Normalise to the undocked baseline so geometry is dock-state-independent.
    if (timeline) timeline.classList.remove('docked');
    if (spacer) spacer.style.height = '0px';
    docked = false;

    sectionTops = sections.map((s) => s.offsetTop);
    sectionEnds = sections.map((s, i) =>
      i < sections.length - 1 ? sections[i + 1].offsetTop : s.offsetTop + s.offsetHeight);
    btnLine = sections[0].offsetTop + sections[0].offsetHeight;
    docHeight = document.documentElement.scrollHeight;

    if (timeline) {
      const stickyTop = parseFloat(getComputedStyle(timeline).top) || 0;
      docLine = timeline.offsetTop - stickyTop;
      // Measure the height the dock class removes, so the spacer can restore it.
      const hUndocked = timeline.offsetHeight;
      timeline.classList.add('docked');
      const hDocked = timeline.offsetHeight;
      timeline.classList.remove('docked');
      dockDelta = Math.max(0, hUndocked - hDocked);
    }
    if (track) {
      const clientW = track.clientWidth;
      trackOverflows = track.scrollWidth > clientW + 1; // only mobile strip overflows
      eraCentre.clear();
      eras.forEach((el, id) => eraCentre.set(id, Math.max(0, el.offsetLeft - (clientW - el.offsetWidth) / 2)));
    }
    // Re-apply the correct dock state for the current scroll position.
    applyDock(shouldDock(window.scrollY));
  }

  // ── Back-to-top control — its scrollTo is user-click only ──
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="ti ti-arrow-up" aria-hidden="true"></i>';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Per-frame work: one scrollY read, then writes only when values change ──
  let activeId = null;
  let lastPct = -1;
  let btnShown = false;
  let scheduled = false;

  function frame() {
    scheduled = false;
    const y = window.scrollY; // the single layout read; all writes come after
    const vh = viewportH;
    const ref = y + vh * READ_LINE;
    const N = sections.length;

    // Active section / era via cached boundaries.
    let i = 0;
    for (let k = 0; k < N; k++) if (sectionTops[k] <= ref) i = k;

    // Progress within the active era (0–100 across its segment of the strip).
    let pct;
    if (y + vh >= docHeight - 4) {
      i = N - 1;
      pct = 100;
    } else {
      const top = sectionTops[i];
      const end = sectionEnds[i];
      let f = (ref - top) / Math.max(1, end - top);
      f = f < 0 ? 0 : f > 1 ? 1 : f;
      pct = ((i + f) / N) * 100;
    }

    // Writes — each guarded so we only touch the DOM on an actual change.
    const id = sections[i].id;
    if (id !== activeId) {
      const prev = activeId && eras.get(activeId);
      if (prev) {
        prev.classList.remove('active');
        prev.removeAttribute('aria-current');
      }
      const cur = eras.get(id);
      if (cur) {
        cur.classList.add('active');
        cur.setAttribute('aria-current', 'true');
      }
      activeId = id;
      // Mobile: keep the active chip centred in the horizontally-scrollable
      // strip (restored — this was cut only to satisfy a false premise). It
      // scrolls the TRACK horizontally, never the window, so it can't re-enter
      // the window scroll handler; cached geometry means no layout read here,
      // and it fires only when the era changes (a handful of times per read).
      if (track && trackOverflows) {
        const t = eraCentre.get(id);
        if (t != null) track.scrollTo({ left: t, behavior: 'smooth' });
      }
    }
    if (progressFill && pct !== lastPct) {
      progressFill.style.width = pct + '%';
      lastPct = pct;
    }
    applyDock(shouldDock(y));
    const show = y > btnLine;
    if (show !== btnShown) {
      btn.classList.toggle('show', show);
      btnShown = show;
    }
  }

  // ── Scheduling: one rAF per scroll burst, no self-rescheduling loop ──
  function requestTick() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(frame);
  }

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      activeId = null;
      lastPct = -1;
      measure();
      requestTick();
    }, 150);
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  // include.js injects the nav/footer partials AFTER deferred scripts run, shifting every
  // cached offset by the sticky nav's height — re-measure when they land (and once more on
  // window load, when late images/fonts have settled the final geometry).
  document.addEventListener('partials:loaded', () => { activeId = null; lastPct = -1; measure(); requestTick(); });
  window.addEventListener('load', () => { activeId = null; lastPct = -1; measure(); requestTick(); });
  measure();
  requestTick();
})();
