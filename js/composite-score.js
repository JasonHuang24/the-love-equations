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

  var FACE_KEY = 'loveEquations.faceScore.v2';
  var BODY_KEY = 'loveEquations.bodyScore.v2';
  var LENS_KEY = 'loveEquations.compositeLens.v1';

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

  // Tiers are fed the RAW score, same thresholds the calcs use, so the labels stay consistent with them.
  function tierFor(s, lens, sex) {
    if (lens === 'blackpill') {
      var coded = function (m, fem, neutral) { return sex === 'm' ? m : sex === 'f' ? fem : neutral; };
      if (s < 3) return 'Sub-tier';
      if (s < 4.5) return 'Below average';
      if (s < 5.5) return 'Mid-tier normie';
      if (s < 6.5) return 'High-tier normie';
      if (s < 7.5) return coded('Chadlite', 'Stacylite', 'Chadlite / Stacylite');
      if (s < 8.5) return coded('Chad', 'Stacy', 'Chad / Stacy');
      return coded('Gigachad / Model', 'Gigastacy / Model', 'Gigachad / Gigastacy');
    }
    if (s < 3) return 'Well below average';
    if (s < 4.5) return 'Below average';
    if (s < 5.5) return 'About average';
    if (s < 6.5) return 'Above average';
    if (s < 8) return 'Attractive';
    if (s < 9) return 'Very attractive';
    return 'Exceptional';
  }

  function sourceWord(s) {
    return s === 'model' ? 'trained model'
      : s === 'geometry' ? 'silhouette geometry'
      : s === 'heuristic' ? 'geometry heuristic'
      : (s || '—');
  }
  function lensLabel(lens) { return lens === 'blackpill' ? 'Black Pill &middot; Frame' : 'Conventional'; }
  function lensColor(lens) { return lens === 'blackpill' ? '#51606F' : '#0F6E56'; }   // match the calc accents
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
      host.innerHTML =
        lensToggle(lens)
        + '<div class="composite-score-wrap">'
        + '<div class="composite-score" style="color:' + lensColor(lens) + '">' + fmt(o) + ' <span class="unit">/ 10</span></div>'
        + '<div class="composite-tier" style="color:' + lensColor(lens) + '">' + tierFor(o, lens, sex) + '</div>'
        + '<div class="composite-srcbadge">' + lensLabel(lens) + ' &middot; Face &times; Body</div>'
        + '<div class="composite-breakdown">Face <strong>' + fmt(fS) + '</strong> &amp; Body <strong>' + fmt(bS) + '</strong> &rarr; weighted ' + wF + ' / ' + wB + ' (face / body). These are the same numbers each calc shows.</div>'
        + '</div>'
        + conflictNote
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
    var faceRow = haveFace
      ? rowDone('Face Calc', fmt(rawScore(face, lens)) + ' / 10', ago(face.ts))
      : rowTodo('Face Calc', 'face.html', 'score a face');
    var bodyRow = haveBody
      ? rowDone('Body Calc', fmt(rawScore(body, lens)) + ' / 10', ago(body.ts))
      : rowTodo('Body Calc', 'body.html', bodyNeedsSex ? 'set a sex to resolve its score' : 'score a body');

    var anyScored = haveFace || haveBody;
    host.innerHTML =
      (anyScored ? lensToggle(lens) : '')
      + '<div class="composite-empty">'
      + '<i class="ti ti-sparkles" aria-hidden="true"></i>'
      + '<div class="composite-empty-lead">Your <strong>overall looks rating</strong> blends both calculators. Score the missing one to see it.</div>'
      + '<div class="composite-rows">' + faceRow + bodyRow + '</div>'
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
})();
