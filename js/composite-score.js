/* Face × Body composite — the "Overall looks rating".
   Each calculator persists its latest headline score to localStorage:
     - face.html (Face Calc) → window.leComposite.saveFace({ bp, cv, bpMax, cvMax, floor, source, sex, ts })
     - body.html  (Body Calc) → window.leComposite.saveBody({ ... })  or, for an unresolved sex range: { needsSex:true, ts }
   Loaded on BOTH pages; renders into partials/composite-section.html (injected by include.js).

   It shows each calc's score — the exact number the calc displayed — and blends the two into the
   overall. One scale (the 2026-08-14 conventional anchor: percentile of a stated reference population,
   5.5 = median, 1 pt = 1/1.4 sd, ceilings both 10); the old Black Pill / Conventional lens toggle is
   gone with the lenses themselves. Scores survive navigation until Reset. */
(function () {
  'use strict';

  // v3 = the 2026-08-14 recalibration's convention (5.0 = reference-population median, one point =
  // 1/1.4 sd, every score carries a measured uncertainty band). QUARANTINE: we read ONLY v3. A v2 score
  // was produced by the retired contrast curve — on that curve the median face read 3.46 — so blending a
  // stored v2 into an Overall would silently mix two incompatible scales. Old keys are not migrated and
  // not read; they are deleted on load so they cannot be resurrected by a downgrade.
  var FACE_KEY = 'loveEquations.faceScore.v3';
  var BODY_KEY = 'loveEquations.bodyScore.v3';
  // The stored lens pick joins the legacy purge: the lens toggle is gone (one scale since 2026-08-14).
  var LEGACY_KEYS = ['loveEquations.faceScore.v2', 'loveEquations.bodyScore.v2', 'loveEquations.compositeLens.v1'];
  for (var _i = 0; _i < LEGACY_KEYS.length; _i++) {
    try { localStorage.removeItem(LEGACY_KEYS[_i]); } catch (e) {}
  }

  // Provisional, tunable: face vs. body share of "overall looks" (one constant re-weights everywhere).
  var FACE_WEIGHT = 0.5;

  function readScore(key) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function writeScore(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {} }
  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function num(x) { return typeof x === 'number' && isFinite(x); }

  // A persisted score is trustworthy only if it names the CURRENT convention (percentile-v3.1, the
  // 2026-08-14 5.5-median anchor — an older 5.0-median score blended in would silently mix two scales,
  // the same class of defect that retired the v2 keys), both score fields agree and are finite, and the
  // floor sits below the max. Guards against stale / partial / hand-edited payloads.
  function validScore(o) {
    return !!o && typeof o === 'object'
      && o.convention === 'percentile-v3.1'
      && num(o.bp) && num(o.cv) && num(o.bpMax) && num(o.cvMax) && num(o.floor)
      && o.bpMax > o.floor && o.cvMax > o.floor;
  }

  // The exact number the calc displays (bp === cv on the single scale; no normalisation).
  function rawScore(calc) {
    if (!validScore(calc) || calc.needsSex) return null;
    return calc.cv;
  }
  // Blend the two scores (weighted average of the displayed numbers).
  function overall(face, body) {
    var f = rawScore(face), b = rawScore(body);
    if (f == null || b == null) return null;
    return FACE_WEIGHT * f + (1 - FACE_WEIGHT) * b;
  }

  // Relative age of a saved read — scores persist across visits, so this flags a stale read (other session/person).
  function ago(ts) {
    if (!num(ts)) return '';
    var s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    return Math.round(s / 86400) + 'd ago';
  }

  // Tier rungs, conventional vocabulary, banded by PERCENTILE (8 / 24 / 76 / 92 / 98 / 99.8) on the
  // 5.5-median / 1.4-sd anchor. The numeric rungs below are 5.5 + invNorm(p) × 1.4, precomputed because
  // this file has no invNorm. LOCKSTEP with face.html faceTier and body.html frameTier — if the rungs
  // or labels drift, the composite labels a number differently from the calc that produced it.
  function tierFor(s) {
    if (s < 3.533) return 'Well below average';
    if (s < 4.511) return 'Below average';
    if (s < 6.489) return 'Average';
    if (s < 7.467) return 'Above average';
    if (s < 8.375) return 'Attractive';
    if (s < 9.529) return 'Very attractive';
    return 'Exceptional';
  }
  function sourceWord(s) {
    return s === 'model' ? 'trained model'
      : s === 'geometry' ? 'silhouette geometry'
      : s === 'heuristic' ? 'geometry heuristic'
      : s === 'measured' ? 'measured numbers (no photo)'           // Body Calc numbers-only path (objective spine, no photo blended)
      : s === 'hybrid' ? 'hybrid read (measured &times; photo)'   // Body Calc objective-spine blend (bodyScore.v2 additive source)
      : (s || '—');
  }
  var ACCENT = '#0F6E56';   // the conventional accent — the only scale left

  function render() {
    var host = document.getElementById('composite-result');
    if (!host) return;

    var face = readScore(FACE_KEY);
    var body = readScore(BODY_KEY);
    var haveFace = validScore(face);
    var bodyNeedsSex = !!(body && body.needsSex);
    var haveBody = validScore(body) && !bodyNeedsSex;

    if (haveFace && haveBody) {
      var fsex = face.sex || null, bsex = body.sex || null;
      var sexConflict = !!(fsex && bsex && fsex !== bsex);   // the ladder is sex-neutral; the conflict still gets flagged
      var sexWord = function (s) { return s === 'm' ? 'male' : 'female'; };
      var o = overall(face, body);
      var fS = rawScore(face), bS = rawScore(body);
      var wF = Math.round(FACE_WEIGHT * 100), wB = 100 - wF;
      var conflictNote = sexConflict
        ? '<div class="composite-note" style="color:var(--scarlet)"><strong>The two reads disagree on sex</strong> &mdash; face read ' + sexWord(fsex) + ', body read ' + sexWord(bsex) + '. The blend assumes <strong>one person</strong>; if that’s right, set the sex on each calc so they match.</div>'
        : '';
      // Framing-override provenance (additive payload field; absent on pre-existing saves). A score rated on
      // the "Rate anyway — reduced accuracy" override must not blend into the overall looking like a
      // to-standard read — the caveat rides the payload so the blend stays as honest as the calc panel.
      // Name the actual override cause: the body's rate-anyway flag can mean non-standard framing OR an
      // unreadable outline (bodyScore.v3 overrideReason: 'framing' | 'outline' | 'framing+outline'); the
      // face's only override is framing. Older body payloads without overrideReason read as framing.
      var bodyCause = body.overrideReason === 'outline' ? 'unreadable outline'
        : body.overrideReason === 'framing+outline' ? 'non-standard framing and an unreadable outline'
        : 'non-standard framing';
      var ovr = [];
      if (face.framingOverride) ovr.push('face (non-standard framing)');
      if (body.framingOverride) ovr.push('body (' + bodyCause + ')');
      var overrideNote = ovr.length
        ? '<div class="composite-note" style="color:#A06A12"><strong>&#9888; Reduced-accuracy input.</strong> The ' + ovr.join(' and ') + ' score' + (ovr.length > 1 ? 's were rated on rate-anyway overrides' : ' was rated on a rate-anyway override') + ', so the overall is rougher than a to-standard read.</div>'
        : '';
      // Presentation is the single weighted point estimate and its tier. Payload uncertainty fields remain
      // untouched for the v3 machine contract, but Jason's 2026-08-14 ruling removes them from display.
      var headline = '<div class="composite-score" style="color:' + ACCENT + '">' + fmt(o) + ' <span class="unit">/ 10</span></div>'
        + '<div class="composite-tier" style="color:' + ACCENT + '">' + tierFor(o) + '</div>';
      var photoNote = num(face.photos) && face.photos < 3
        ? '<div class="composite-note">The face read came from ' + face.photos + ' photo' + (face.photos > 1 ? 's' : '') + '. <a href="face.html">Add more on the Face Calc</a> for a steadier read.</div>'
        : '';
      host.innerHTML =
        '<div class="composite-score-wrap">'
        + headline
        + '<div class="composite-srcbadge">Face &times; Body</div>'
        + '<div class="composite-breakdown">Face <strong>' + fmt(fS) + '</strong> &amp; Body <strong>' + fmt(bS) + '</strong> &rarr; weighted ' + wF + ' / ' + wB + ' (face / body). These are the same numbers each calc shows.</div>'
        + '</div>'
        + photoNote
        + conflictNote
        + overrideNote
        + '<div class="composite-note"><strong>Two prototype reads, blended.</strong> Face from the ' + sourceWord(face.source) + ' (' + ago(face.ts) + '), body from the ' + sourceWord(body.source) + ' (' + ago(body.ts) + '). <strong>Assumes both are the same person</strong> &mdash; scores persist across visits, so an old read can linger; Reset clears them. The ' + wF + '/' + wB + ' face/body split is a provisional, tunable default. A mirror of the methodology, not a verdict on a person.</div>'
        + '<div class="composite-foot"><button type="button" id="composite-reset">Reset both (scores + photos)</button></div>';
      wireReset();
      return;
    }

    // partial / empty state — show progress and prompt whichever calc is missing
    function rowDone(label, value, when) {
      return '<div class="composite-row done"><i class="ti ti-circle-check" aria-hidden="true"></i> ' + label + ' &mdash; <strong>' + value + '</strong>' + (when ? ' <span style="opacity:.55;font-weight:400">&middot; ' + when + '</span>' : '') + '</div>';
    }
    function rowTodo(label, href, prompt) {
      return '<div class="composite-row todo"><i class="ti ti-circle-dashed" aria-hidden="true"></i> <a href="' + href + '">' + label + ' &mdash; ' + prompt + ' &rarr;</a></div>';
    }
    // A lone half is shown as ITS OWN point score, explicitly labelled as one half — never as an Overall.
    // Half of the blend is not a smaller Overall, it is a different measurement.
    function halfValue(calc) {
      var s = rawScore(calc);
      if (s == null) return '—';
      return fmt(s) + ' / 10';
    }
    var faceRow = haveFace
      ? rowDone('Face Calc', halfValue(face), ago(face.ts))
      : rowTodo('Face Calc', 'face.html', 'score a face');
    var bodyRow = haveBody
      ? rowDone('Body Calc', halfValue(body), ago(body.ts))
      : rowTodo('Body Calc', 'body.html', bodyNeedsSex ? 'set a sex to resolve its score' : 'score a body');

    var anyScored = haveFace || haveBody;
    var loneNote = (haveFace !== haveBody)
      ? '<div class="composite-note">Showing the <strong>' + (haveFace ? 'face' : 'body') + ' read alone</strong> — this is not an overall looks rating, and it is not half of one. Score the other calculator to get the blend.</div>'
      : '';
    host.innerHTML =
      '<div class="composite-empty">'
      + '<i class="ti ti-sparkles" aria-hidden="true"></i>'
      + '<div class="composite-empty-lead">Your <strong>overall looks rating</strong> blends both calculators. Score the missing one to see it.</div>'
      + '<div class="composite-rows">' + faceRow + bodyRow + '</div>'
      + loneNote
      + ((anyScored || bodyNeedsSex) ? '<div class="composite-foot"><button type="button" id="composite-reset">Reset</button></div>' : '')
      + '</div>';
    wireReset();
  }

  function wireReset() {
    var rb = document.getElementById('composite-reset');
    if (rb) rb.addEventListener('click', function () { window.leComposite.reset(); });
  }

  window.leComposite = {
    saveFace: function (obj) { writeScore(FACE_KEY, obj); render(); },
    saveBody: function (obj) { writeScore(BODY_KEY, obj); render(); },
    // a calc invalidates its own result (failed/cleared photo) → drop its composite score so the blend
    // never shows a number for an emptied calculator
    clearFace: function () { try { localStorage.removeItem(FACE_KEY); } catch (e) {} render(); },
    clearBody: function () { try { localStorage.removeItem(BODY_KEY); } catch (e) {} render(); },
    reset: function () {
      try {
        localStorage.removeItem(FACE_KEY); localStorage.removeItem(BODY_KEY);
        // face.html LC_SHOT_KEY is faceShot.v2 (v1 is purged by face.html on load); body.html BC_SHOT_KEY is bodyShot.v1
        localStorage.removeItem('loveEquations.faceShot.v2'); localStorage.removeItem('loveEquations.bodyShot.v1');
        // also drop the body calc's saved height/weight/bf inputs — body.html re-persists a
        // bodyScore from them on its next load, silently resurrecting the score just reset here
        localStorage.removeItem('loveEquations.bodyInputs.v1');
        // the single global Reset: instrument state persists across pages by design, and this
        // button is the one place that clears ALL of it — every key any page writes
        localStorage.removeItem('loveEquations.smvCalculator.v7_2');
        localStorage.removeItem('loveEquations.compatibilityCalculator.v1');
        localStorage.removeItem('loveEquations.matchmaker.v1');
        localStorage.removeItem('loveEquations.matchmaker.pwMin');
        localStorage.removeItem('loveHierarchyBuilder');
      } catch (e) {}
      if (window.bcResetAll) window.bcResetAll();   // clear the body calc's photo + result if we're on body.html
      if (window.lcResetAll) window.lcResetAll();   // ditto the face calc if we're on face.html
      render();
    },
    render: render
  };

  // The composite markup arrives via include.js (async fetch). Render when it signals done, and once now
  // in case the partial is already in the DOM (idempotent).
  document.addEventListener('partials:loaded', render);
  if (document.getElementById('composite-result')) render();

  // bfcache (face + body pages): a Back-restored page revives pre-Reset calc state, and the
  // next render would re-persist the just-cleared scores — force a fresh boot (Sol review #4).
  window.addEventListener('pageshow', function (e) { if (e.persisted) window.location.reload(); });
})();
