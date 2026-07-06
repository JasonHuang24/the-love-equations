/* ── The Mythbuster — data + render system ──
 *
 * PROOF OF CONCEPT. Every entry in ENTRIES below is a DRAFT placeholder:
 * plausible in shape, but NOT canon. Jason will replace all content.
 *
 * Architecture:
 *   - The atomic unit is a QUESTION with 1..N competing claims. A single-claim
 *     card is just the N=1 case of the SAME schema and render path — there is
 *     one card type, one render function. No per-card HTML.
 *   - Each claim carries its own verdict; the entry's `ruling` holds the
 *     data-backed conclusion, its evidence tier, and its sources.
 *   - render() REFUSES an entry missing `ruling.tier`, with an empty
 *     `ruling.sources`, with a duplicate id, or otherwise structurally broken —
 *     it is skipped and a console.warn fires. No unsourced ruling reaches the DOM.
 *   - Claims render in the order given (author orders by ascending accuracy).
 *   - Filter chips auto-generate from the categories present in the data.
 *   - Icons are inline SVG (no external icon font / zero external deps).
 */
(function () {
  'use strict';

  /* ── Vocabularies (claim verdicts + ruling tiers; also the render gate) ── */
  const VERDICTS = {
    'confirmed':      { label: 'Confirmed' },      // success-green
    'oversimplified': { label: 'Oversimplified' }, // amber
    'false':          { label: 'False' },          // scarlet
    'backwards':      { label: 'Backwards' },      // deep scarlet (distinct)
  };
  const TIERS = {
    'hard-data':    { label: 'Hard data' },
    'evidence':     { label: 'Evidence-based' },
    'definitional': { label: 'Definitional' },
  };

  /* ── Inline SVG icons (currentColor-driven, sized in CSS) ── */
  const SVG_BOOK = '<svg class="mb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0"/><path d="M3 6v13"/><path d="M12 6v13"/><path d="M21 6v13"/></svg>';
  const SVG_CHEVRON = '<svg class="mb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6 -6"/></svg>';

  /* ── Data (4 DRAFT placeholders: N=1 & N=1+question & N=2 & N=3-with-confirmed) ── */
  const ENTRIES = [
    {
      id: 'M-001',
      category: 'Attraction',
      // N=1, no question — the top strip shows the single claim's verdict badge.
      claims: [
        { camp: '', text: 'Looks are the only thing that decides a first date.', verdict: 'false' },
      ],
      ruling: {
        badge: 'False',
        text: 'Placeholder ruling for the proof-of-concept. Two to three sentences of data-backed conclusion so the ruling column, the tier pill, and the source line render at realistic length. None of this is canon — Jason replaces every entry.',
        tier: 'hard-data',
        sources: [
          { label: 'Placeholder citation — replace with a primary source', url: '#' },
          { label: 'Placeholder secondary source — replace', url: '#' },
        ],
      },
      related: [
        { label: 'Five Levers of SMV', href: 'smvlevers.html' },
        { label: 'Statistics', href: 'statistics.html' },
      ],
      draft: true,
    },
    {
      id: 'M-002',
      category: 'Status & Money',
      question: 'Does money decide female attraction?',
      // N=2 — competing camps, ordered least-accurate first.
      claims: [
        { camp: 'The cynic', text: 'Money is the only thing women weigh in a partner.', verdict: 'false' },
        { camp: 'The realist', text: 'Resources matter, but they trade off against everything else on the table.', verdict: 'oversimplified' },
      ],
      ruling: {
        badge: 'Both miss',
        text: 'Placeholder ruling. This entry shows a two-claim question with a claim-count pill and a question line. The conclusion will be a sourced two-to-three-sentence synthesis, not this scaffold text.',
        tier: 'evidence',
        sources: [
          { label: 'Placeholder citation — replace with a study', url: '#' },
        ],
      },
      related: [
        { label: 'Rules & Frameworks', href: 'frameworks.html' },
      ],
      draft: true,
    },
    {
      id: 'M-003',
      category: 'Commitment',
      question: 'Does playing hard to get work?',
      // N=3 — includes a "confirmed" claim (success-green chip), ordered ascending accuracy.
      claims: [
        { camp: 'The pickup line', text: 'Playing hard to get always increases desire.', verdict: 'backwards' },
        { camp: 'The skeptic', text: 'It never works and only ever pushes people away.', verdict: 'oversimplified' },
        { camp: 'The evidence', text: 'Selective interest raises desire, but only once mutual interest already exists.', verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'It depends',
        text: 'Placeholder ruling. A three-claim question demonstrating that N is open-ended and that one of the claims can land as confirmed. Replace with the sourced conclusion.',
        tier: 'definitional',
        sources: [
          { label: 'Placeholder — definitional / reference source', url: '#' },
          { label: 'Placeholder glossary entry', url: '#' },
        ],
      },
      related: [
        { label: 'Lexicon', href: 'lexicon.html' },
      ],
      draft: true,
    },
    {
      id: 'M-004',
      category: 'Attraction',
      question: 'Is height a dealbreaker?',
      // N=1 WITH a question — question line renders AND the strip shows the verdict badge.
      claims: [
        { camp: '', text: 'Height is a hard filter for every woman.', verdict: 'oversimplified' },
      ],
      ruling: {
        badge: 'Overblown',
        text: 'Placeholder ruling. A second Attraction entry so the category filter has something to filter, and a single-claim card that still carries a question line. Replace with sourced copy.',
        tier: 'hard-data',
        sources: [
          { label: 'Placeholder citation — replace', url: '#' },
        ],
      },
      related: [
        { label: 'Statistics — height preference', href: 'statistics.html#height-pref' },
      ],
      draft: true,
    },
  ];

  /* ── Escaping (content is placeholder now, Jason's copy later) ── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── Render gate: an entry is only renderable if it is complete + sourced +
     has a unique id. `seenIds` (a Set of already-accepted ids) is optional — it
     is threaded in by render() so a second occurrence of an id fails the gate. ── */
  function validate(entry, seenIds) {
    const problems = [];
    if (!entry || typeof entry !== 'object') return ['not an object'];
    if (!entry.id) problems.push('missing id');
    else if (seenIds && seenIds.has(entry.id)) problems.push('duplicate id');

    const r = entry.ruling;
    if (!r || typeof r !== 'object') {
      problems.push('missing ruling');
    } else {
      if (!TIERS[r.tier]) problems.push('missing/invalid ruling.tier');              // spec: hard-refuse
      if (!Array.isArray(r.sources) || r.sources.length === 0) {
        problems.push('empty ruling.sources');                                       // spec: hard-refuse
      }
      if (!r.badge) problems.push('missing ruling.badge');
      if (!r.text) problems.push('missing ruling.text');
    }

    if (!Array.isArray(entry.claims) || entry.claims.length === 0) {
      problems.push('no claims');
    } else {
      entry.claims.forEach(function (c, i) {
        if (!c || typeof c !== 'object') { problems.push('claim[' + i + '] not an object'); return; }
        if (!c.text) problems.push('claim[' + i + '] missing text');
        if (!VERDICTS[c.verdict]) problems.push('claim[' + i + '] invalid verdict');
      });
    }
    return problems;
  }

  /* ── One claim (camp + verdict chip on a line, then the quotation) ── */
  function claimHTML(c) {
    const camp = c.camp ? '<span class="mb-camp">' + esc(c.camp) + '</span>' : '';
    return '<div class="mb-claim">' +
        '<div class="mb-claim-head">' + camp +
          '<span class="mb-verdict ' + esc(c.verdict) + '">' + esc(VERDICTS[c.verdict].label) + '</span>' +
        '</div>' +
        '<blockquote class="mb-quote">&ldquo;' + esc(c.text) + '&rdquo;</blockquote>' +
      '</div>';
  }

  /* ── Card HTML for one (already-validated) entry ── */
  function cardHTML(m) {
    const claims = m.claims;
    const n = claims.length;
    const r = m.ruling;
    const sourcesId = 'sources-' + m.id;

    const draftChip = m.draft
      ? '<span class="mb-draft" title="Placeholder — not canon">DRAFT</span>'
      : '';

    // Top strip, right side: N=1 shows the claim's verdict badge; N>1 shows the count pill.
    const topRight = n === 1
      ? '<span class="mb-verdict ' + esc(claims[0].verdict) + '">' + esc(VERDICTS[claims[0].verdict].label) + '</span>'
      : '<span class="mb-count">' + n + ' claims tested</span>';

    // Every card gets a semantic <h2>: the question when present, else an sr-only
    // heading built from the (single) claim text so no card is heading-less.
    const heading = m.question
      ? '<h2 class="mb-question">' + esc(m.question) + '</h2>'
      : '<h2 class="mb-sr-only">' + esc(claims[0].text) + '</h2>';

    // Short attribution line, tied to the full list in the Sources footer.
    const first = r.sources[0];
    const extra = r.sources.length > 1 ? ' (+' + (r.sources.length - 1) + ' more)' : '';
    const attribution = esc(first.label) + extra;

    const sourceItems = r.sources.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" rel="noopener"' +
        (/^https?:/i.test(s.url) ? ' target="_blank"' : '') + '>' + esc(s.label) + '</a></li>';
    }).join('');

    const related = Array.isArray(m.related) && m.related.length
      ? '<div class="mb-sources-block mb-related">' +
          '<div class="mb-sources-head">Related</div>' +
          '<span class="mb-related-links">' +
            m.related.map(function (rel) {
              return '<a href="' + esc(rel.href) + '">' + esc(rel.label) + '</a>';
            }).join('<span class="mb-related-sep" aria-hidden="true">·</span>') +
          '</span>' +
        '</div>'
      : '';

    return '' +
      '<article class="mb-card' + (m.draft ? ' is-draft' : '') + '" data-category="' + esc(m.category) + '" data-id="' + esc(m.id) + '" data-claims="' + n + '">' +

        // Top strip
        '<div class="mb-strip">' +
          '<div class="mb-strip-left">' +
            '<span class="mb-id">' + esc(m.id) + '</span>' +
            (m.category ? '<span class="mb-cat">' + esc(m.category) + '</span>' : '') +
            draftChip +
          '</div>' +
          '<div class="mb-strip-right">' + topRight + '</div>' +
        '</div>' +

        // Heading (visible question, or sr-only claim-derived heading)
        heading +

        // Body: claims (left/top) | ruling (right/bottom), split by a hairline
        '<div class="mb-body">' +
          '<div class="mb-col mb-claims">' + claims.map(claimHTML).join('') + '</div>' +
          '<div class="mb-col mb-ruling">' +
            '<div class="mb-col-label mb-ruling-label">The ruling</div>' +
            '<div class="mb-ruling-badge">' + esc(r.badge) + '</div>' +
            '<p class="mb-ruling-text">' + esc(r.text) + '</p>' +
            '<div class="mb-evidence">' +
              '<span class="mb-tier ' + esc(r.tier) + '">' + esc(TIERS[r.tier].label) + '</span>' +
              '<span class="mb-attr">Source &middot; ' + attribution + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Footer: expandable Sources (closed by default)
        '<div class="mb-sources">' +
          '<button class="mb-sources-toggle" type="button" aria-expanded="false" aria-controls="' + sourcesId + '">' +
            '<span class="mb-sources-btn-label">' + SVG_BOOK + ' Sources</span>' +
            SVG_CHEVRON +
          '</button>' +
          '<div class="mb-sources-panel">' +
            '<div class="mb-sources-inner" id="' + sourcesId + '" role="region" aria-label="Sources and related links for ' + esc(m.id) + '">' +
              '<div class="mb-sources-content">' +
                '<ul class="mb-source-list">' + sourceItems + '</ul>' +
                related +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</article>';
  }

  /* ── Filter chips auto-generated from categories present in the data ── */
  function chipsHTML(categories) {
    var chips = '<button class="mb-chip active" type="button" data-category="all" aria-pressed="true">All</button>';
    categories.forEach(function (cat) {
      chips += '<button class="mb-chip" type="button" data-category="' + esc(cat) +
        '" aria-pressed="false">' + esc(cat) + '</button>';
    });
    return chips;
  }

  /* ── Main render ── */
  function render(list, opts) {
    opts = opts || {};
    var mountId = opts.mount || 'mb-list';
    var filtersId = opts.filters || 'mb-filters';
    var mount = document.getElementById(mountId);
    if (!mount) return;

    var rendered = [];
    var seen = new Set();
    (Array.isArray(list) ? list : []).forEach(function (entry) {
      var problems = validate(entry, seen);
      if (problems.length) {
        console.warn('[mythbuster] Skipped entry ' + (entry && entry.id ? '"' + entry.id + '"' : '(no id)') +
          ' — ' + problems.join(', ') + '. No unsourced/incomplete ruling renders.', entry);
        return;
      }
      // Soft check: a multi-claim question should carry a question line (still renders).
      if (entry.claims.length > 1 && !entry.question) {
        console.warn('[mythbuster] Entry "' + entry.id + '" has ' + entry.claims.length +
          ' claims but no question — rendering without a visible question heading.');
      }
      seen.add(entry.id);        // mark id as taken only after the entry passes the gate
      rendered.push(entry);
    });

    mount.innerHTML = rendered.length
      ? rendered.map(cardHTML).join('')
      : '<p class="mb-empty">No entries passed the render gate.</p>';

    // Chips — unique categories, first-seen order, from entries that survived the gate.
    var filters = document.getElementById(filtersId);
    if (filters) {
      var catSeen = {}, cats = [];
      rendered.forEach(function (m) {
        if (m.category && !catSeen[m.category]) { catSeen[m.category] = true; cats.push(m.category); }
      });
      filters.innerHTML = chipsHTML(cats);
    }

    return rendered.length;
  }

  /* ── Interactions (event delegation — survives re-render) ── */
  function wire() {
    var filters = document.getElementById('mb-filters');
    var list = document.getElementById('mb-list');

    if (filters) {
      filters.addEventListener('click', function (e) {
        var chip = e.target.closest('.mb-chip');
        if (!chip) return;
        var cat = chip.dataset.category;
        filters.querySelectorAll('.mb-chip').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        list.querySelectorAll('.mb-card').forEach(function (card) {
          var show = cat === 'all' || card.dataset.category === cat;
          card.classList.toggle('is-hidden', !show);
        });
      });
    }

    if (list) {
      list.addEventListener('click', function (e) {
        var btn = e.target.closest('.mb-sources-toggle');
        if (!btn) return;
        var sources = btn.closest('.mb-sources');
        var open = sources.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function init() {
    render(ENTRIES);
    wire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposed for verification/testing (e.g. feeding a malformed entry to prove the gate).
  window.Mythbuster = { data: ENTRIES, render: render, validate: validate };
})();
