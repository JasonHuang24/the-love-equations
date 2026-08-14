/* Face × Body composite — the "Overall looks rating".
   Each calculator persists its latest headline score to localStorage:
     - face.html (Face Calc) → window.leComposite.saveFace({ bp, cv, bpMax, cvMax, floor, source, sex, ts })
     - body.html  (Body Calc) → window.leComposite.saveBody({ ... })  or, for an unresolved sex range: { needsSex:true, ts }
   Loaded on BOTH pages; renders into partials/composite-section.html (injected by include.js).

   It shows each calc's RAW lens score — the exact number the calc displayed — and blends the two raw
   scores into the overall. A Black Pill / Conventional toggle switches which lens is shown (mirrors the
   calc toggles). We deliberately DON'T normalise for display: a normalised number (e.g. an 8.3 body on a
   9-max lens → 9.1/10) matches nothing the user saw on the calc and reads as "from nowhere", and it shifts
   the tier too. Raw keeps the composite legible and its tiers consistent with the calcs. The lens ceilings
   differ slightly (face PSL ~8.6, body BP 9; both Conventional 10), but on-screen both read ~1–9, so a
   weighted average of the displayed numbers is exactly what a reader expects ("overall sits between your
   face and body"). Scores survive navigation until Reset. */
(function () {
  'use strict';

  // v3 = the 2026-08-14 recalibration's convention (5.0 = reference-population median, one point =
  // 1/1.4 sd, every score carries a measured uncertainty band). QUARANTINE: we read ONLY v3. A v2 score
  // was produced by the retired contrast curve — on that curve the median face read 3.46 — so blending a
  // stored v2 into an Overall would silently mix two incompatible scales. Old keys are not migrated and
  // not read; they are deleted on load so they cannot be resurrected by a downgrade.
  var FACE_KEY = 'loveEquations.faceScore.v3';
  var BODY_KEY = 'loveEquations.bodyScore.v3';
  var LEGACY_KEYS = ['loveEquations.faceScore.v2', 'loveEquations.bodyScore.v2'];
  var LENS_KEY = 'loveEquations.compositeLens.v1';
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

  function getLens() {
    try { return localStorage.getItem(LENS_KEY) === 'conventional' ? 'conventional' : 'blackpill'; }
    catch (e) { return 'blackpill'; }
  }
  function setLens(l) { try { localStorage.setItem(LENS_KEY, l); } catch (e) {} render(); }

  // A persisted score is trustworthy only if both lens values, both ranges, and the floor are finite and the
  // floor sits below each max. Guards against stale / partial / hand-edited payloads — e.g. a missing `cv`.
  function validScore(o) {
    return !!o && typeof o === 'object'
      && num(o.bp) && num(o.cv) && num(o.bpMax) && num(o.cvMax) && num(o.floor)
      && o.bpMax > o.floor && o.cvMax > o.floor;
  }

  // RAW lens score — the exact number the calc displays (no normalisation, so the composite matches the calc).
  function rawScore(calc, lens) {
    if (!validScore(calc) || calc.needsSex) return null;
    return lens === 'blackpill' ? calc.bp : calc.cv;
  }
  // Blend the two RAW lens scores (weighted average of the displayed numbers).
  function overall(face, body, lens) {
    var f = rawScore(face, lens), b = rawScore(body, lens);
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

  // Tier rungs on the v3 convention: whole-point boundaries that are ALSO percentile boundaries
  // (24th / 50th / 76th / 92nd / 98th). Mirrors the Face Calc's faceTier exactly — if the two ever
  // drift, the composite would label a number differently from the calc that produced it.
  function tierFor(s, lens, sex) {
    var coded = function (m, fem, neutral) { return sex === 'm' ? m : sex === 'f' ? fem : neutral; };
    if (s < 3.0) return 'Sub-tier';
    if (s < 4.0) return 'Below average';
    if (s < 5.0) return 'LTN · Low-Tier Normie';
    if (s < 6.0) return 'MTN · Mid-Tier Normie';
    if (s < 7.0) return 'HTN · High-Tier Normie';
    if (s < 8.0) return coded('Chadlite', 'Stacylite', 'Chadlite / Stacylite');
    if (s < 9.0) return coded('Chad', 'Stacy', 'Chad / Stacy');
    return coded('Gigachad / Model', 'Gigastacy / Model', 'Gigachad / Gigastacy');
  }
  // A band spanning two rungs is labelled with the span, never with one end.
  function tierForBand(lo, hi, lens, sex) {
    var a = tierFor(lo, lens, sex), b = tierFor(hi, lens, sex);
    return a === b ? a : a + ' → ' + b;
  }
  // Half-width of the blended score's band. The two calcs measure different things from different
  // photos, so their errors are independent and combine in quadrature rather than adding. A calc that
  // ships no band (older payload shape) contributes null → we degrade to no band rather than invent one.
  function blendedHalf(face, body) {
    if (!num(face.band) || !num(body.band)) return null;
    var f = FACE_WEIGHT * face.band, b = (1 - FACE_WEIGHT) * body.band;
    return Math.sqrt(f * f + b * b);
  }

  function sourceWord(s) {
    return s === 'model' ? 'trained model'
      : s === 'geometry' ? 'silhouette geometry'
      : s === 'heuristic' ? 'geometry heuristic'
      : s === 'measured' ? 'measured numbers (no photo)'           // Body Calc numbers-only path (objective spine, no photo blended)
      : s === 'hybrid' ? 'hybrid read (measured &times; photo)'   // Body Calc objective-spine blend (bodyScore.v2 additive source)
      : (s || '—');
  }
  function lensLabel(lens) { return lens === 'blackpill' ? 'Black Pill &middot; Frame' : 'Conventional'; }
  function lensColor(lens) { return lens === 'blackpill' ? '#51606F' : '#0F6E56'; }   // match the calc accents
  // The toggle only earns its place if some payload actually DIFFERS between the two fields. The Face
  // Calc collapsed to one scale in v3 (bp === cv), so if the Body Calc has too, the toggle would switch
  // between two identical numbers — worse than absent, because it implies a distinction that is gone.
  function hasTwoLenses(face, body) {
    return !!((face && num(face.bp) && num(face.cv) && face.bp !== face.cv)
           || (body && num(body.bp) && num(body.cv) && body.bp !== body.cv));
  }
  function lensToggle(lens) {
    return '<div class="composite-lens" role="tablist">'
      + '<button type="button" class="composite-lensbtn' + (lens === 'blackpill' ? ' active' : '') + '" data-lens="blackpill">Black Pill &middot; Frame</button>'
      + '<button type="button" class="composite-lensbtn' + (lens === 'conventional' ? ' active' : '') + '" data-lens="conventional">Conventional</button>'
      + '</div>';
  }

  function render() {
    var host = document.getElementById('composite-result');
    if (!host) return;
    var lens = getLens();

    var face = readScore(FACE_KEY);
    var body = readScore(BODY_KEY);
    var haveFace = validScore(face);
    var bodyNeedsSex = !!(body && body.needsSex);
    var haveBody = validScore(body) && !bodyNeedsSex;

    if (haveFace && haveBody) {
      var fsex = face.sex || null, bsex = body.sex || null;
      var sexConflict = !!(fsex && bsex && fsex !== bsex);
      var sex = sexConflict ? null : (fsex || bsex || null);   // conflicted → sex-neutral tier, don't silently pick one
      var sexWord = function (s) { return s === 'm' ? 'male' : 'female'; };
      var o = overall(face, body, lens);
      var fS = rawScore(face, lens), bS = rawScore(body, lens);
      var wF = Math.round(FACE_WEIGHT * 100), wB = 100 - wF;
      var conflictNote = sexConflict
        ? '<div class="composite-note" style="color:var(--scarlet)"><strong>The two reads disagree on sex</strong> &mdash; face read ' + sexWord(fsex) + ', body read ' + sexWord(bsex) + '. The blend assumes <strong>one person</strong>; if that’s right, set the sex on each calc so they match. Tier shown sex-neutral until they agree.</div>'
        : '';
      // Framing-override provenance (additive payload field; absent on pre-existing saves). A score rated on
      // the "Rate anyway — reduced accuracy" override must not blend into the overall looking like a
      // to-standard read — the caveat rides the payload so the blend stays as honest as the calc panel.
      var ovr = [];
      if (face.framingOverride) ovr.push('face');
      if (body.framingOverride) ovr.push('body');
      var overrideNote = ovr.length
        ? '<div class="composite-note" style="color:#A06A12"><strong>&#9888; Reduced-accuracy input.</strong> The ' + ovr.join(' and ') + ' score' + (ovr.length > 1 ? 's were' : ' was') + ' rated on a non-standard-framing override, so the overall is rougher than a to-standard read.</div>'
        : '';
      // Bands ride through the blend: an Overall built from two banded reads is itself a range, and
      // showing it as a bare decimal would re-introduce exactly the false precision the calcs just dropped.
      var oHalf = blendedHalf(face, body);
      var oLo = oHalf == null ? null : Math.max(1, o - oHalf);
      var oHi = oHalf == null ? null : Math.min(10, o + oHalf);
      var headline = oHalf == null
        ? '<div class="composite-score" style="color:' + lensColor(lens) + '">' + fmt(o) + ' <span class="unit">/ 10</span></div>'
          + '<div class="composite-tier" style="color:' + lensColor(lens) + '">' + tierFor(o, lens, sex) + '</div>'
        : '<div class="composite-score" style="color:' + lensColor(lens) + '">' + fmt(oLo) + '&ndash;' + fmt(oHi) + '</div>'
          + '<div class="composite-breakdown" style="margin-top:.25rem">best estimate <strong>' + fmt(o) + '</strong> / 10 &middot; likely band</div>'
          + '<div class="composite-tier" style="color:' + lensColor(lens) + '">' + tierForBand(oLo, oHi, lens, sex) + '</div>';
      var photoNote = num(face.photos) && face.photos < 3
        ? '<div class="composite-note">The face read came from ' + face.photos + ' photo' + (face.photos > 1 ? 's' : '') + '. <a href="face.html">Add more on the Face Calc</a> and this band narrows.</div>'
        : '';
      host.innerHTML =
        (hasTwoLenses(face, body) ? lensToggle(lens) : '')
        + '<div class="composite-score-wrap">'
        + headline
        + '<div class="composite-srcbadge">' + (hasTwoLenses(face, body) ? lensLabel(lens) + ' &middot; ' : '') + 'Face &times; Body</div>'
        + '<div class="composite-breakdown">Face <strong>' + fmt(fS) + '</strong> &amp; Body <strong>' + fmt(bS) + '</strong> &rarr; weighted ' + wF + ' / ' + wB + ' (face / body). These are the same numbers each calc shows.</div>'
        + '</div>'
        + photoNote
        + conflictNote
        + overrideNote
        + '<div class="composite-note"><strong>Two prototype reads, blended.</strong> Face from the ' + sourceWord(face.source) + ' (' + ago(face.ts) + '), body from the ' + sourceWord(body.source) + ' (' + ago(body.ts) + '). <strong>Assumes both are the same person</strong> &mdash; scores persist across visits, so an old read can linger; Reset clears them. The ' + wF + '/' + wB + ' face/body split is a provisional, tunable default. A mirror of the methodology, not a verdict on a person.</div>'
        + '<div class="composite-foot"><button type="button" id="composite-reset">Reset both (scores + photos)</button></div>';
      wireReset(); wireLens();
      return;
    }

    // partial / empty state — show progress and prompt whichever calc is missing
    function rowDone(label, value, when) {
      return '<div class="composite-row done"><i class="ti ti-circle-check" aria-hidden="true"></i> ' + label + ' &mdash; <strong>' + value + '</strong>' + (when ? ' <span style="opacity:.55;font-weight:400">&middot; ' + when + '</span>' : '') + '</div>';
    }
    function rowTodo(label, href, prompt) {
      return '<div class="composite-row todo"><i class="ti ti-circle-dashed" aria-hidden="true"></i> <a href="' + href + '">' + label + ' &mdash; ' + prompt + ' &rarr;</a></div>';
    }
    // A lone half is shown as ITS OWN banded score, explicitly labelled as one half — never as an
    // Overall. Half of the blend is not a smaller Overall, it is a different measurement.
    function halfValue(calc) {
      var s = rawScore(calc, lens);
      if (s == null) return '—';
      if (!num(calc.band)) return fmt(s) + ' / 10';
      return fmt(Math.max(1, s - calc.band)) + '–' + fmt(Math.min(10, s + calc.band)) + ' (best ' + fmt(s) + ')';
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
      (anyScored && hasTwoLenses(face, body) ? lensToggle(lens) : '')
      + '<div class="composite-empty">'
      + '<i class="ti ti-sparkles" aria-hidden="true"></i>'
      + '<div class="composite-empty-lead">Your <strong>overall looks rating</strong> blends both calculators. Score the missing one to see it.</div>'
      + '<div class="composite-rows">' + faceRow + bodyRow + '</div>'
      + loneNote
      + ((anyScored || bodyNeedsSex) ? '<div class="composite-foot"><button type="button" id="composite-reset">Reset</button></div>' : '')
      + '</div>';
    wireReset(); wireLens();
  }

  function wireReset() {
    var rb = document.getElementById('composite-reset');
    if (rb) rb.addEventListener('click', function () { window.leComposite.reset(); });
  }
  function wireLens() {
    var btns = document.querySelectorAll('.composite-lensbtn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { setLens(this.getAttribute('data-lens')); });
    }
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
        localStorage.removeItem('loveEquations.faceShot.v1'); localStorage.removeItem('loveEquations.bodyShot.v1');
        // also drop the body calc's saved height/weight/bf inputs — body.html re-persists a
        // bodyScore from them on its next load, silently resurrecting the score just reset here
        localStorage.removeItem('loveEquations.bodyInputs.v1');
        // the single global Reset: instrument state persists across pages by design, and this
        // button is the one place that clears ALL of it — every key any page writes
        localStorage.removeItem(LENS_KEY);
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
