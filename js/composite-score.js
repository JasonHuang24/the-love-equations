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

  var SCORE_MIN = 1;
  var SCORE_MAX = 10;
  var MIN_TIMESTAMP = Date.UTC(2020, 0, 1);
  var MAX_FUTURE_SKEW = 5 * 60 * 1000;
  var FACE_SOURCES = ['model', 'heuristic'];
  var BODY_SOURCES = ['model', 'geometry', 'hybrid'];
  var BODY_SEX_SOURCES = ['manual', 'model', 'guess', 'unknown', 'unconfirmed'];

  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function num(x) { return typeof x === 'number' && isFinite(x); }
  function plainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }
  function bounded(value, low, high) { return num(value) && value >= low && value <= high; }
  function timestamp(value) {
    return Number.isSafeInteger(value) && value >= MIN_TIMESTAMP && value <= Date.now() + MAX_FUTURE_SKEW;
  }
  function allowed(value, values) { return values.indexOf(value) >= 0; }

  function validNeedsSex(o, kind) {
    return kind === 'body' && plainObject(o)
      && o.schemaVersion === 3 && o.needsSex === true
      && allowed(o.sexSource, ['guess', 'unknown', 'unconfirmed'])
      && timestamp(o.ts);
  }

  // Read only the current single-scale contract. Face keeps its shipped field set (its
  // convention is the version); Body additionally requires schemaVersion 3 and coherent
  // sex-confirmation semantics. Neither route may smuggle an arbitrary source label.
  function validScore(o, kind) {
    if (!plainObject(o) || o.needsSex === true || o.convention !== 'percentile-v3.1') return false;
    if (kind !== 'face' && kind !== 'body') return false;
    if (kind === 'body' && o.schemaVersion !== 3) return false;
    if (kind === 'face' && Object.prototype.hasOwnProperty.call(o, 'schemaVersion') && o.schemaVersion !== 3) return false;
    var sources = kind === 'face' ? FACE_SOURCES : BODY_SOURCES;
    if (!allowed(o.source, sources)
        || !bounded(o.bp, SCORE_MIN, SCORE_MAX) || !bounded(o.cv, SCORE_MIN, SCORE_MAX)
        || Math.abs(o.bp - o.cv) > 1e-9
        || (kind === 'body' && (!Number.isInteger(o.bp * 2) || !Number.isInteger(o.cv * 2)))
        || o.floor !== SCORE_MIN || o.bpMax !== SCORE_MAX || o.cvMax !== SCORE_MAX
        || !bounded(o.band, 0, SCORE_MAX - SCORE_MIN)
        || !Number.isInteger(o.photos) || o.photos < 1 || o.photos > 3
        || !timestamp(o.ts)
        || (o.sex != null && o.sex !== 'm' && o.sex !== 'f')
        || typeof o.framingOverride !== 'boolean') return false;

    if (kind === 'face') return true;

    if (!allowed(o.sexSource, BODY_SEX_SOURCES) || typeof o.sexConfirmed !== 'boolean') return false;
    var hasInputs = Object.prototype.hasOwnProperty.call(o, 'inputs');
    if (o.source === 'hybrid') {
      if (!plainObject(o.inputs)
          || !bounded(o.inputs.ffmi, 0, 60)
          || !bounded(o.inputs.bf, 1, 75)
          || !allowed(o.inputs.bfSource, ['measured', 'picker'])
          || !bounded(o.inputs.weight, 0, 1)) return false;
    } else if (hasInputs) return false;
    var confirmed = o.sexConfirmed === true;
    if (confirmed && (!o.sex || (o.sexSource !== 'manual' && o.sexSource !== 'model'))) return false;
    if (!confirmed && (o.source === 'geometry' || o.source === 'hybrid')) return false;
    var reason = o.overrideReason;
    if (reason !== '' && reason !== 'framing' && reason !== 'outline' && reason !== 'framing+outline') return false;
    if (o.framingOverride !== (reason !== '')) return false;
    return true;
  }

  function readScore(key, kind) {
    var parsed = null, hadRaw = false;
    try {
      var raw = localStorage.getItem(key);
      hadRaw = raw != null;
      if (raw && raw.length > 10000) throw new Error('oversized score record');
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    if (validScore(parsed, kind) || validNeedsSex(parsed, kind)) return parsed;
    if (hadRaw) try { localStorage.removeItem(key); } catch (e) {}
    return null;
  }
  function writeScore(key, obj, kind) {
    if (!validScore(obj, kind) && !validNeedsSex(obj, kind)) {
      try { localStorage.removeItem(key); } catch (e) {}
      return false;
    }
    try { localStorage.setItem(key, JSON.stringify(obj)); return true; }
    catch (e) { try { localStorage.removeItem(key); } catch (_) {} return false; }
  }

  // The exact saved number (Body is public half-point precision; Face remains backward-compatible).
  function rawScore(calc, kind) {
    if (!validScore(calc, kind)) return null;
    return calc.cv;
  }
  function overall(face, body) {
    var f = rawScore(face, 'face'), b = rawScore(body, 'body');
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
      : s === 'hybrid' ? 'hybrid read (measured &times; photo)'   // Body Calc objective-spine blend
      : 'unrecognized source';
  }
  var ACCENT = '#0F6E56';   // the conventional accent — the only scale left

  function render() {
    var host = document.getElementById('composite-result');
    if (!host) return;

    var face = readScore(FACE_KEY, 'face');
    var body = readScore(BODY_KEY, 'body');
    var haveFace = validScore(face, 'face');
    var bodyNeedsSex = validNeedsSex(body, 'body');
    var haveBody = validScore(body, 'body') && !bodyNeedsSex;

    if (haveFace && haveBody) {
      var fsex = face.sex || null, bsex = body.sex || null;
      var sexConflict = !!(fsex && bsex && fsex !== bsex);   // the ladder is sex-neutral; the conflict still gets flagged
      var sexWord = function (s) { return s === 'm' ? 'male' : 'female'; };
      var o = overall(face, body);
      var fS = rawScore(face, 'face'), bS = rawScore(body, 'body');
      var wF = Math.round(FACE_WEIGHT * 100), wB = 100 - wF;
      var conflictNote = sexConflict
        ? '<div class="composite-note" style="color:var(--scarlet)"><strong>The two reads disagree on sex</strong> &mdash; face read ' + sexWord(fsex) + ', body read ' + sexWord(bsex) + '. The blend assumes <strong>one person</strong>; if that’s right, set the sex on each calc so they match.</div>'
        : '';
      // Framing-override provenance (additive payload field; absent on pre-existing saves). A score rated on
      // the "Rate anyway — reduced accuracy" override must not blend into the overall looking like a
      // to-standard read — the caveat rides the payload so the blend stays as honest as the calc panel.
      // Name the actual override cause: the body's rate-anyway flag can mean non-standard framing OR an
      // unreadable outline (bodyScore.v3 overrideReason: 'framing' | 'outline' | 'framing+outline'); the
      // face's only override is framing. Body payloads are schema-bound and always name the cause.
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
    function halfValue(calc, kind) {
      var s = rawScore(calc, kind);
      if (s == null) return '—';
      return fmt(s) + ' / 10';
    }
    var faceRow = haveFace
      ? rowDone('Face Calc', halfValue(face, 'face'), ago(face.ts))
      : rowTodo('Face Calc', 'face.html', 'score a face');
    var bodyRow = haveBody
      ? rowDone('Body Calc', halfValue(body, 'body'), ago(body.ts))
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
    saveFace: function (obj) { writeScore(FACE_KEY, obj, 'face'); render(); },
    saveBody: function (obj) { writeScore(BODY_KEY, obj, 'body'); render(); },
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
