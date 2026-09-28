/**
 * Pure metrics for tools/looks-benchmark.mjs — DOM-free, dependency-free, unit-tested in
 * tests/looks-benchmark.test.mjs.
 *
 * WHY THESE FOUR. On 2026-09-28 Jason reported the Face/Body Calc scores "aren't reasonable".
 * Running the roster through the shipped pages showed four separable failures, and each metric
 * below measures exactly one of them so a fix can be credited (or not) per failure:
 *   ORDER      — do people the reference rates higher score higher?        spearman, auc
 *   STABILITY  — does the same person score the same across decent photos? icc1, mirror deltas
 *   SHAPE      — do most people land mid-scale with rare extremes?          histogram (caller)
 *   FAIRNESS   — at equal reference looks, does ethnicity move the score?   residualGaps
 * A nicer-looking distribution (SHAPE) can hide a wrong ORDER or FAIRNESS, which is why they are
 * reported side by side and never collapsed into one number.
 */

export function mean(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN; }

export function median(a) {
  if (!a.length) return NaN;
  const s = a.slice().sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Linear-interpolated quantile (numpy default), q in [0,1]. */
export function quantile(a, q) {
  if (!a.length) return NaN;
  const s = a.slice().sort((x, y) => x - y), pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

/** Average ranks (1-based), ties share the mean of their positions. */
export function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

export function pearson(x, y) {
  const n = x.length; if (n < 3) return NaN;
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
}

/** Spearman rho = Pearson on average ranks (tie-correct). */
export function spearman(x, y) { return pearson(ranks(x), ranks(y)); }

/** P(random positive scores above random negative), ties count half. 0.5 = coin flip. */
export function auc(pos, neg) {
  if (!pos.length || !neg.length) return NaN;
  let w = 0;
  for (const p of pos) for (const q of neg) w += p > q ? 1 : p === q ? 0.5 : 0;
  return w / (pos.length * neg.length);
}

/**
 * One-way random-effects ICC(1) for unbalanced groups (Shrout & Fleiss; k0 correction).
 * groups: array of arrays (one array of scores per person, >=2 each to contribute).
 * 1 = a person's score is fully determined by who they are; 0 = it is all photo noise.
 */
export function icc1(groups) {
  const g = groups.filter(a => a.length >= 2);
  const N = g.reduce((s, a) => s + a.length, 0), k = g.length;
  if (k < 2) return { icc: NaN, groups: k, n: N };
  const grand = mean(g.flat());
  let ssb = 0, ssw = 0;
  for (const a of g) { const m = mean(a); ssb += a.length * (m - grand) ** 2; for (const x of a) ssw += (x - m) ** 2; }
  const msb = ssb / (k - 1), msw = ssw / (N - k);
  const k0 = (N - g.reduce((s, a) => s + a.length * a.length, 0) / N) / (k - 1);
  return { icc: (msb - msw) / (msb + (k0 - 1) * msw), groups: k, n: N };
}

/**
 * FAIRNESS at equal reference looks: fit score = a + b*looks by OLS over persons, then the mean
 * residual per group. A group whose mean residual is negative is scored below what its reference
 * looks predict. `focus` also reports focus-minus-everyone-else (the headline gap).
 * rows: [{ looks, score, group }]
 */
export function residualGaps(rows, focus = 'black', minN = 4) {
  const x = rows.map(r => r.looks), y = rows.map(r => r.score);
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; }
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  const res = rows.map(r => ({ group: r.group, res: r.score - (a + b * r.looks) }));
  const by = {};
  for (const r of res) (by[r.group] = by[r.group] || []).push(r.res);
  const groups = {};
  for (const [k, v] of Object.entries(by)) groups[k] = { n: v.length, meanResidual: mean(v), reported: v.length >= minN };
  const inF = res.filter(r => r.group === focus).map(r => r.res), outF = res.filter(r => r.group !== focus).map(r => r.res);
  return { slope: b, intercept: a, groups, focus, focusGap: inF.length && outF.length ? mean(inF) - mean(outF) : NaN, focusN: inF.length };
}

/** Count values into labelled bins; `binOf` maps a value to a label. Keeps first-seen order of `order` if given. */
export function histogram(values, binOf, order) {
  const h = {};
  if (order) for (const k of order) h[k] = 0;
  for (const v of values) { const k = binOf(v); h[k] = (h[k] || 0) + 1; }
  return h;
}
