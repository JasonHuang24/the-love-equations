(async () => {
  const placeholders = document.querySelectorAll('[data-include]');
  await Promise.all([...placeholders].map(async el => {
    const name = el.dataset.include;
    try {
      const res = await fetch(`partials/${name}.html`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      el.outerHTML = await res.text();
    } catch (e) {
      console.error(`include: failed to load partials/${name}.html`, e);
    }
  }));
  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (link) link.classList.add('active');
  }
})();
