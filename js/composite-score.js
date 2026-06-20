/* Face × Body composite — the "Overall looks rating".
   Each calculator persists its latest headline score to localStorage:
     - face.html (Face Calc) → window.leComposite.saveFace({ bp, cv, bpMax, cvMax, source, sex, ts })
     - body.html  (Body Calc) → window.leComposite.saveBody({ bp, cv, bpMax, cvMax, source, sex, ts })
                                 or, when the body read is an unresolved male–female range: { needsSex:true, ts }
   This module is loaded on BOTH pages and renders into partials/composite-section.html (injected by
   include.js). It reads both keys, normalises each calc to a 0–10 share of its own lens range, blends
   them, and shows the overall — prompting the user to complete whichever calc is missing. Scores survive
   navigation until Reset (that's the "persistent unless reset" requirement). */
(function () {
  'use strict';

  // v2: payloads now carry `floor` (the [floor, scaleMax] mapping floor, =1) so the composite can normalise
  // over each calc's ACTUAL range. Bumping the key retires pre-floor v1 scores rather than mis-normalising them.
  var FACE_KEY = 'loveEquations.faceScore.v2';
  var BODY_KEY = 'loveEquations.bodyScore.v2';

  // Provisional, tunable: face vs. body share of "overall looks". The real balance is context- and
  // sex-dependent in the literature (no single settled number), so this is a reasoned default, labelled
  // honestly. Change this one constant to re-weight the composite everywhere.
  var FACE_WEIGHT = 0.5;

  function readScore(key) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function writeScore(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }
  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function num(x) { return typeof x === 'number' && isFinite(x); }

  // A persisted score is trustworthy only if both lens values, both ranges, and the floor are finite and the
  // floor sits below each max. Guards against stale / partial / hand-edited payloads — e.g. a missing `cv`
  // used to render a phantom 0.0 in the conventional line.
  function validScore(o) {
    return !!o && typeof o === 'object'
      && num(o.bp) && num(o.cv) && num(o.bpMax) && num(o.cvMax) && num(o.floor)
      && o.bpMax > o.floor && o.cvMax > o.floor;
  }

  // Both calcs map every lens to [floor, scaleMax] (score = floor + (scaleMax-floor)·x, floor = 1). Normalising
  // over the ACTUAL range — (score-floor)/(max-floor) — puts the worst case at 0, not floor/max (~1.1/10). It
  // also re-bases an 8.6-max PSL face and a 9-max Black-Pill body onto the same 0–10 footing before blending.
  function norm10(score, max, floor) {
    if (!num(score) || !num(max) || !num(floor) || max <= floor) return null;
    return Math.max(0, Math.min(10, (score - floor) / (max - floor) * 10));
  }
  function faceNorm(face, lens) {
    if (!validScore(face)) return null;
    return lens === 'blackpill' ? norm10(face.bp, face.bpMax, face.floor) : norm10(face.cv, face.cvMax, face.floor);
  }
  function bodyNorm(body, lens) {
    if (!validScore(body) || body.needsSex) return null;
    return lens === 'blackpill' ? norm10(body.bp, body.bpMax, body.floor) : norm10(body.cv, body.cvMax, body.floor);
  }
  function overall(face, body, lens) {
    var f = faceNorm(face, lens), b = bodyNorm(body, lens);
    if (f == null || b == null) return null;
    return FACE_WEIGHT * f + (1 - FACE_WEIGHT) * b;
  }
  // Relative age of a saved read — a saved score persists across visits, so this lets the user spot a stale
  // read (a different session, or a different person) feeding the blend.
  function ago(ts) {
    if (!num(ts)) return '';
    var s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    return Math.round(s / 86400) + 'd ago';
  }

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
      var sexConflict = !!(fsex && bsex && fsex !== bsex);
      var sex = sexConflict ? null : (fsex || bsex || null);   // conflicted → sex-neutral tier, don't silently pick one
      var sexWord = function (s) { return s === 'm' ? 'male' : 'female'; };
      var bpO = overall(face, body, 'blackpill');
      var cvO = overall(face, body, 'conventional');
      var fN = faceNorm(face, 'blackpill'), bN = bodyNorm(body, 'blackpill');
      var wF = Math.round(FACE_WEIGHT * 100), wB = 100 - wF;
      var conflictNote = sexConflict
        ? '<div class="composite-note" style="color:var(--scarlet)"><strong>The two reads disagree on sex</strong> &mdash; face read ' + sexWord(fsex) + ', body read ' + sexWord(bsex) + '. The blend assumes <strong>one person</strong>; if that’s right, set the sex on each calc so they match. Tier shown sex-neutral until they agree.</div>'
        : '';
      host.innerHTML =
        '<div class="composite-score-wrap">'
        + '<div class="composite-score" style="color:#51606F">' + fmt(bpO) + ' <span class="unit">/ 10</span></div>'
        + '<div class="composite-tier" style="color:#51606F">' + tierFor(bpO, 'blackpill', sex) + '</div>'
        + '<div class="composite-srcbadge">Black Pill &middot; Face &times; Body</div>'
        + '<div class="composite-other">The conventional lens says <strong>' + fmt(cvO) + ' / 10</strong> (' + tierFor(cvO, 'conventional', sex) + ').</div>'
        + '<div class="composite-breakdown">Face <strong>' + fmt(fN) + '</strong> &amp; Body <strong>' + fmt(bN) + '</strong> &rarr; weighted ' + wF + ' / ' + wB + ' (face / body), each normalised to 10 within its lens.</div>'
        + '</div>'
        + conflictNote
        + '<div class="composite-note"><strong>Two prototype reads, blended.</strong> Face from the ' + sourceWord(face.source) + ' (' + ago(face.ts) + '), body from the ' + sourceWord(body.source) + ' (' + ago(body.ts) + '). <strong>Assumes both are the same person</strong> &mdash; scores persist across visits, so an old read can linger; Reset clears them. The ' + wF + '/' + wB + ' face/body split is a provisional, tunable default &mdash; the real balance is context- and sex-dependent. A mirror of the methodology, not a verdict on a person.</div>'
        + '<div class="composite-foot"><button type="button" id="composite-reset">Reset both scores</button></div>';
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
    var faceRow = haveFace
      ? rowDone('Face Calc', fmt(faceNorm(face, 'blackpill')) + ' / 10', ago(face.ts))
      : rowTodo('Face Calc', 'face.html', 'score a face');
    var bodyRow = haveBody
      ? rowDone('Body Calc', fmt(bodyNorm(body, 'blackpill')) + ' / 10', ago(body.ts))
      : rowTodo('Body Calc', 'body.html', bodyNeedsSex ? 'set a sex to resolve its score' : 'score a body');

    host.innerHTML =
      '<div class="composite-empty">'
      + '<i class="ti ti-sparkles" aria-hidden="true"></i>'
      + '<div class="composite-empty-lead">Your <strong>overall looks rating</strong> blends both calculators. Score the missing one to see it.</div>'
      + '<div class="composite-rows">' + faceRow + bodyRow + '</div>'
      + ((haveFace || haveBody || bodyNeedsSex) ? '<div class="composite-foot"><button type="button" id="composite-reset">Reset</button></div>' : '')
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
    reset: function () {
      try { localStorage.removeItem(FACE_KEY); localStorage.removeItem(BODY_KEY); } catch (e) {}
      render();
    },
    render: render
  };

  // The composite markup arrives via include.js (async fetch). Render when it signals done, and once now
  // in case the partial is already in the DOM (idempotent).
  document.addEventListener('partials:loaded', render);
  if (document.getElementById('composite-result')) render();
})();
