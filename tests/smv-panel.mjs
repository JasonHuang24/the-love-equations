// SMV calculator — celebrity pressure-test panel.
//
// Extracts the scoring core from smvcalc.html (regex-slices the single inline <script>, strips
// the DOM boot block, and evaluates the rest in a Node VM with light stubs), then runs a fixed
// set of celebrity/archetype fixtures through the REAL calculateScores() and asserts each lands
// in its expected band. Exits non-zero when any band or structural property is violated.
//
// Fixtures are permanent regression fixtures — future recalibrations rerun this panel. Charm
// inputs for public figures are ESTIMATES (dating history isn't public); they're marked as such.
//
//   node tests/smv-panel.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = readFileSync(join(__dirname, '..', 'smvcalc.html'), 'utf8');

// 1) Slice the inline <script> (the include.js tag has attributes, so bare <script> misses it).
const m = HTML.match(/<script>\n([\s\S]*?)<\/script>/);
if (!m) { console.error('Could not find the inline <script> in smvcalc.html'); process.exit(2); }
let core = m[1];

// 2) Drop the DOM boot block at the very bottom (everything from the top-level `restoringState =
//    true;`). It calls document.getElementById etc.; the scoring core above it does not.
const bootAt = core.indexOf('restoringState = true;');
if (bootAt >= 0) core = core.slice(0, bootAt);

// 3) The harness runs INSIDE the same VM script so it shares the core's lexical scope (top-level
//    const/let/function). It drives the real state (answers, selectedLensA, aInputMode) and calls
//    calculateScores(), then exports plain data via globalThis.__PANEL__ for Node to print.
const harness = `
;(function () {
  const idx = pred => QUESTIONS.findIndex(pred);
  const I = {
    sex: idx(q => q.type === 'sex'),
    age: idx(q => q.type === 'age'),
    height: idx(q => q.type === 'height'),
    build: idx(q => q.type === 'build'),
    bodyfat: idx(q => q.type === 'bodyfat'),
    face: idx(q => q.type === 'face'),
    look6: idx(q => q.type === 'checklist' && q.factor === 0),
    networth: idx(q => q.type === 'networth'),
    income: idx(q => q.type === 'income'),
    car: idx(q => q.type === 'car'),
    housing: idx(q => q.factor === 1 && q.opts && /housing/.test(q.text)),
    career: idx(q => q.factor === 1 && q.opts && /career/.test(q.text)),
    expenses: idx(q => q.type === 'expenses'),
    fame: idx(q => q.type === 'fame'),
    following: idx(q => q.type === 'following'),
    job: idx(q => q.type === 'jobtitle'),
    education: idx(q => q.type === 'education'),
    kids: idx(q => q.type === 'kids'),
    record: idx(q => q.factor === 2 && q.opts && /record/.test(q.text)),
    rel: idx(q => q.type === 'relationship'),
    orbit: idx(q => q.type === 'orbit'),
    above: idx(q => q.type === 'above'),
    retention: idx(q => q.type === 'retention'),
    friends: idx(q => q.factor === 3 && q.type === 'count'),
    metro: idx(q => q.id === 'metro'),
    metmix: idx(q => q.type === 'metmix'),
    venues: idx(q => q.type === 'checklist' && q.factor === 4),
    apps: idx(q => q.type === 'apps')
  };
  const unitcounts = QUESTIONS.map((q, i) => q.type === 'unitcount' ? i : -1).filter(i => i >= 0);
  I.approaches = unitcounts[0];
  I.inbound = unitcounts[1];
  // §10.2: E7 invitations is gone — the fixtures no longer answer it.

  const checks = n => { const a = { checked: [], touched: true }; for (let i = 0; i < n; i++) a.checked[i] = true; return a; };

  function run(sex, set) {
    answers = Array(QUESTIONS.length).fill(null);
    aInputMode = 'quiz';
    curQ = 0;
    selectedLensA = sex === 'f' ? 'female' : 'male';
    answers[I.sex] = sex;
    set(answers, I);
    const total = calculateScores();
    return { total, factors: scores.slice(), tier: getTier(total).label };
  }

  // ── Fixtures ────────────────────────────────────────────────────────────
  const F = {};

  // 1) Ceiling — a top-tier male celebrity (LeBron-class): max fame, 9-figure net worth, elite
  //    following, mogul-level career. Charm/orbit are generous public-figure estimates.
  F.ceiling = () => run('m', (a) => {
    a[I.age] = '30-34';
    a[I.height] = 198; a[I.build] = 92; a[I.bodyfat] = 11; a[I.face] = 10; a[I.look6] = checks(8);   // BMI ~23.5, elite frame, ~11% lean → 9.0
    a[I.networth] = { t: 900000000 }; a[I.income] = { annual: 120000000, monthly: 10000000, unit: 'year' };
    a[I.car] = 5; a[I.housing] = 4; a[I.career] = 4; a[I.expenses] = 200000;
    a[I.fame] = { n: 90000000 };
    a[I.following] = { yt: 3000000, ig: 150000000, x: 52000000, tt: 20000000, other: 5000000 };
    a[I.job] = { mode: 'pick', label: 'Chief executive (CEO)', score: 8.8 };
    a[I.education] = { degree: 3, tier: 1 };
    a[I.kids] = { count: 0 };                                   // no kids at 30-34 = neutral, not a drag
    a[I.record] = 0;
    a[I.rel] = { months: 180, partner: [true, true, true, true] };   // est. long marriage, above-tier partner
    a[I.orbit] = { active: 12, peak: 20, recency: 'r0' };
    a[I.above] = { above: 8, at: 2, below: 0 };
    a[I.retention] = { n: 5, above: true };
    a[I.friends] = 20;
    a[I.metro] = 25000000; a[I.metmix] = { inperson: 40, online: 40, window: 'w0', touched: true };
    a[I.venues] = { checked: [1,1,1,1,1,1,1,1], other: 2, touched: true };
    a[I.apps] = { out: 150, in: 200, touched: true };           // maximal at-bats
    a[I.approaches] = { n: 20, unit: 'month' }; a[I.inbound] = { n: 8, unit: 'month' };
  });

  // 2) Median — 35yo teacher, 1.5M metro, $58k income, modest savings, bachelor's typical school,
  //    clean record, no kids, 2-year longest relationship, small orbit, a couple of venues, light apps.
  F.median = () => run('f', (a) => {
    a[I.age] = '35-39';
    a[I.height] = 162; a[I.build] = 68; a[I.bodyfat] = 37; a[I.face] = 5.0; a[I.look6] = checks(3);   // BMI ~25, plain-median; ~37% ≈ female median → ~5.4
    a[I.networth] = { t: 60000 }; a[I.income] = { annual: 58000, monthly: 4833, unit: 'year' };
    a[I.car] = 2; a[I.housing] = 2; a[I.career] = 1; a[I.expenses] = 4100;
    a[I.fame] = { n: 0 };
    a[I.following] = { ig: 400, touched: true };
    a[I.job] = { mode: 'pick', label: 'Teacher (K–12)', score: 6.4 };
    a[I.education] = { degree: 3, tier: 2 };
    a[I.kids] = { count: 0 };
    a[I.record] = 0;
    a[I.rel] = { months: 24, partner: [false, true, false, false] };
    a[I.orbit] = { active: 1, peak: 3, recency: 'r1' };
    a[I.above] = { above: 2, at: 5, below: 3 };
    a[I.retention] = { n: 2, above: false };
    a[I.friends] = 4;
    a[I.metro] = 1500000; a[I.metmix] = { inperson: 3, online: 2, window: 'w0', touched: true };
    a[I.venues] = { checked: [1,1], touched: true };
    a[I.apps] = { out: 2, in: 25, touched: true };
    a[I.approaches] = { n: 0, unit: 'month' }; a[I.inbound] = { n: 3, unit: 'month' };
  });

  // 3) Rich-anonymous — 45yo, $5M net worth, $800k income, luxury car, owns outright, but median
  //    looks and zero fame/following, median charm/exposure. Money/Looks fine; Status is the ceiling.
  F.richAnon = () => run('m', (a) => {
    a[I.age] = '40-49';
    a[I.height] = 175; a[I.build] = 82; a[I.bodyfat] = 24; a[I.face] = 5.5; a[I.look6] = checks(4);   // ~24% ≈ male median → ~5.5
    a[I.networth] = { t: 5000000 }; a[I.income] = { annual: 800000, monthly: 66667, unit: 'year' };
    a[I.car] = 4; a[I.housing] = 4; a[I.career] = 3; a[I.expenses] = 15000;
    a[I.fame] = { n: 0 };
    a[I.following] = { ig: 0, touched: true };
    a[I.job] = { mode: 'fallback', band: 3, label: 'Professional', score: 6.5 };
    a[I.education] = { degree: 3, tier: 2 };
    a[I.kids] = { count: 2, custody: 'shared' };
    a[I.record] = 0;
    a[I.rel] = { months: 60, partner: [false, false, false, false] };
    a[I.orbit] = { active: 1, peak: 2, recency: 'r1' };
    a[I.above] = { above: 1, at: 6, below: 3 };
    a[I.retention] = { n: 2, above: false };
    a[I.friends] = 4;
    a[I.metro] = 1500000; a[I.metmix] = { inperson: 3, online: 1, window: 'w0', touched: true };
    a[I.venues] = { checked: [1,1], touched: true };
    a[I.apps] = { out: 8, in: 2, touched: true };
    a[I.approaches] = { n: 2, unit: 'month' }; a[I.inbound] = { n: 1, unit: 'month' };
  });

  // 4) Famous-broke — 24yo viral TikToker: 2M TikTok (×0.2 = 400k effective), 100k strangers know
  //    her, negative net worth, no car, rents with roommates. Money is clearly the bottleneck.
  F.famousBroke = () => run('f', (a) => {
    a[I.age] = '18-24';
    a[I.height] = 168; a[I.build] = 58; a[I.bodyfat] = 22; a[I.face] = 7.5; a[I.look6] = checks(7);   // BMI ~20.5, lean ~22% → ~8.8
    a[I.networth] = { t: -15000 }; a[I.income] = { annual: 30000, monthly: 2500, unit: 'year' };
    a[I.car] = 0; a[I.housing] = 1; a[I.career] = 0; a[I.expenses] = 2600;
    a[I.fame] = { n: 100000 };
    a[I.following] = { tt: 2000000, ig: 200000, touched: true };
    a[I.job] = { mode: 'pick', label: 'Content creator / Influencer', score: 5.6 };
    a[I.education] = { degree: 2, tier: null };
    a[I.kids] = { count: 0 };
    a[I.record] = 0;
    a[I.rel] = { months: 12, partner: [true, false, false, false] };
    a[I.orbit] = { active: 5, peak: 8, recency: 'r0' };
    a[I.above] = { above: 3, at: 5, below: 2 };
    a[I.retention] = { n: 3, above: false };
    a[I.friends] = 5;
    a[I.metro] = 4000000; a[I.metmix] = { inperson: 8, online: 15, window: 'w0', touched: true };
    a[I.venues] = { checked: [1,1,1], touched: true };
    a[I.apps] = { out: 5, in: 120, touched: true };
    a[I.approaches] = { n: 2, unit: 'month' }; a[I.inbound] = { n: 15, unit: 'month' };
  });

  // 5) Looks-only — 26yo model-tier looks (face 9+, build 9, tall), everything else median-or-worse.
  F.looksOnly = () => run('f', (a) => {
    a[I.age] = '25-29';
    a[I.height] = 178; a[I.build] = 58; a[I.bodyfat] = 19; a[I.face] = 9.2; a[I.look6] = checks(6);   // tall, BMI ~18.3, model-lean ~19% → peak 9.0
    a[I.networth] = { t: 10000 }; a[I.income] = { annual: 40000, monthly: 3333, unit: 'year' };
    a[I.car] = 1; a[I.housing] = 1; a[I.career] = 0; a[I.expenses] = 3600;
    a[I.fame] = { n: 0 };
    a[I.following] = { ig: 2000, touched: true };
    a[I.job] = { mode: 'fallback', band: 1, label: 'Service or manual', score: 4.5 };
    a[I.education] = { degree: 1, tier: null };
    a[I.kids] = { count: 0 };
    a[I.record] = 0;
    a[I.rel] = { months: 12, partner: [false, false, false, false] };
    a[I.orbit] = { active: 2, peak: 4, recency: 'r1' };
    a[I.above] = { above: 1, at: 5, below: 4 };
    a[I.retention] = { n: 2, above: false };
    a[I.friends] = 3;
    a[I.metro] = 1000000; a[I.metmix] = { inperson: 3, online: 3, window: 'w0', touched: true };
    a[I.venues] = { checked: [1], touched: true };
    a[I.apps] = { out: 1, in: 60, touched: true };
    a[I.approaches] = { n: 0, unit: 'month' }; a[I.inbound] = { n: 6, unit: 'month' };
  });

  // 6) Floor — 29yo: unemployed, felony, negative net worth, no car (small town), lives with parents,
  //    no degree, 2 kids full custody, no relationship over 3 months, empty orbit, tiny metro, nothing.
  F.floor = () => run('m', (a) => {
    a[I.age] = '25-29';
    a[I.height] = 170; a[I.build] = 105; a[I.bodyfat] = 40; a[I.face] = 3.0; a[I.look6] = checks(0);   // BMI ~36, obese ~40% → ~2.6
    a[I.networth] = { t: -40000 }; a[I.income] = { annual: 8000, monthly: 667, unit: 'year' };
    a[I.car] = 0; a[I.housing] = 0; a[I.career] = 0; a[I.expenses] = 900;
    a[I.fame] = { n: 0 };
    a[I.following] = { ig: 0, touched: true };
    a[I.job] = { mode: 'pick', label: 'Unemployed', score: 3.0 };
    a[I.education] = { degree: 0, tier: null };
    a[I.kids] = { count: 2, custody: 'full' };
    a[I.record] = 2;                                            // felony
    a[I.rel] = { months: 3, partner: [false, false, false, false] };
    a[I.orbit] = { active: 0, peak: 0, recency: 'r2' };
    a[I.above] = { above: 0, at: 1, below: 9 };
    a[I.retention] = { n: 0, above: false };
    a[I.friends] = 0;
    a[I.metro] = 15000; a[I.metmix] = { inperson: 0, online: 0, window: 'w0', touched: true };
    a[I.venues] = { checked: [], touched: true };
    a[I.apps] = { out: 0, in: 0, touched: true };
    a[I.approaches] = { n: 0, unit: 'month' }; a[I.inbound] = { n: 0, unit: 'month' };
  });

  // 7) The Davidson case — median-to-modest looks, real fame (millions know him), solid money, C3
  //    answered mostly-above, big orbit PB. Charm should read as a top factor; total 7.5+.
  F.davidson = () => run('m', (a) => {
    a[I.age] = '25-29';
    a[I.height] = 185; a[I.build] = 74; a[I.bodyfat] = 20; a[I.face] = 5.5; a[I.look6] = checks(5);   // ~20% average-lean → ~6.5
    a[I.networth] = { t: 8000000 }; a[I.income] = { annual: 6000000, monthly: 500000, unit: 'year' };
    a[I.car] = 3; a[I.housing] = 3; a[I.career] = 2; a[I.expenses] = 120000;
    a[I.fame] = { n: 5000000 };
    a[I.following] = { ig: 1500000, touched: true };
    a[I.job] = { mode: 'pick', label: 'Actor', score: 6.0 };
    a[I.education] = { degree: 1, tier: null };
    a[I.kids] = { count: 0 };
    a[I.record] = 0;
    a[I.rel] = { months: 10, partner: [true, true, true, true] };   // est. dated visibly-above-tier partners
    a[I.orbit] = { active: 10, peak: 20, recency: 'r0' };
    a[I.above] = { above: 9, at: 1, below: 0 };                 // the residual-leverage signature
    a[I.retention] = { n: 5, above: true };
    a[I.friends] = 20;
    a[I.metro] = 20000000; a[I.metmix] = { inperson: 10, online: 5, window: 'w0', touched: true };
    a[I.venues] = { checked: [1,1,1,1], touched: true };
    a[I.apps] = { out: 8, in: 60, touched: true };
    a[I.approaches] = { n: 4, unit: 'month' }; a[I.inbound] = { n: 8, unit: 'month' };
  });

  // ── Structural profiles ─────────────────────────────────────────────────
  // (a) all-median-inputs: every input picked to score ~5.5. Total must land within ±0.5 of 5.5.
  F.allMedian = () => run('m', (a) => {
    a[I.age] = '30-34';
    a[I.height] = 171; a[I.build] = 84; a[I.bodyfat] = 24; a[I.face] = 5.5; a[I.look6] = checks(4);   // BMI ~28.7 → ~5.4; ~24% → ~5.5
    a[I.networth] = { t: 75000 }; a[I.income] = { annual: 60000, monthly: 5000, unit: 'year' };
    a[I.car] = 2; a[I.housing] = 1; a[I.career] = 1; a[I.expenses] = 4250;         // 15% disposable → 5.5
    a[I.fame] = { n: 20 };
    a[I.following] = { yt: 200, touched: true };
    a[I.job] = { mode: 'fallback', band: 2, label: 'Skilled trade or clerical', score: 5.5 };
    a[I.education] = { degree: 2, tier: null };
    a[I.kids] = { count: 0 };
    a[I.record] = 0;
    a[I.rel] = { months: 24, partner: [true, false, false, false] };
    a[I.orbit] = { active: 1, peak: 3, recency: 'r0' };
    a[I.above] = { above: 0, at: 6, below: 4 };
    a[I.retention] = { n: 2, above: false };
    a[I.friends] = 3;
    a[I.metro] = 1500000; a[I.metmix] = { inperson: 3, online: 2, window: 'w0', touched: true };
    a[I.venues] = { checked: [1], touched: true };
    a[I.apps] = { out: 10, in: 3, touched: true };
    a[I.approaches] = { n: 2, unit: 'month' }; a[I.inbound] = { n: 0, unit: 'month' };
  });

  // §9.3 probes — the Status ceiling/floor are REAL, proven directly. Only the four marker inputs
  // (fame/following/job/education) plus the two §9.1 modifiers (kids/record) drive Status; the rest
  // stay neutral. maxStatus maxes every marker + the no-kids/clean bonuses → Status must clear 9.0.
  // minStatus floors every marker (name-against fame) + 3-kids-full + multi-felony → Status ≤ 1.5.
  F.maxStatus = () => run('m', (a) => {
    a[I.age] = '30-34';
    a[I.fame] = { n: 50000000 };
    a[I.following] = { yt: 20000000, ig: 200000000, x: 100000000, tt: 50000000, other: 10000000 };
    a[I.job] = { mode: 'pick', label: '(max-prestige probe)', score: 9.5 };
    a[I.education] = { degree: 4, tier: 0 };                    // advanced + elite institution
    a[I.kids] = { count: 0 };                                   // +0.2 no-kids bonus
    a[I.record] = 0;                                            // +0.2 clean bonus
  });
  F.minStatus = () => run('m', (a) => {
    a[I.age] = '18-24';                                         // full kids penalty age grade
    a[I.fame] = { against: true };                             // name works against you → 2.5
    a[I.following] = { ig: 0, touched: true };
    a[I.job] = { mode: 'pick', label: 'Unemployed', score: 3.0 };
    a[I.education] = { degree: 0, tier: null };                 // no HS diploma
    a[I.kids] = { count: 3, custody: 'full' };                  // −3.5 full penalty
    a[I.record] = 3;                                            // −4.5 multiple felonies / in the system
  });

  // (b) per-sex Exposure weight totals must be equal (E4/E5/E6 mirrored, as old Q28–Q30 were).
  const expoIdx = QUESTIONS.map((q, i) => q.factor === 4 ? i : -1).filter(i => i >= 0);
  const expoWeight = sex => expoIdx.reduce((s, i) => {
    const q = QUESTIONS[i];
    return s + ((q.weights && q.weights[sex]) || q.weight || 1);
  }, 0);

  globalThis.__PANEL__ = {
    results: {
      ceiling: F.ceiling(), median: F.median(), richAnon: F.richAnon(),
      famousBroke: F.famousBroke(), looksOnly: F.looksOnly(), floor: F.floor(),
      davidson: F.davidson(), allMedian: F.allMedian(),
      maxStatus: F.maxStatus(), minStatus: F.minStatus()
    },
    factorNames: FACTORS.map(f => f.name),
    statusIdx: FACTORS.findIndex(f => f.key === 'status'),
    expoWeightM: expoWeight('m'),
    expoWeightF: expoWeight('f'),
    jobCount: JOB_TITLES.length,
    questionCount: QUESTIONS.length,
    looksCount: QUESTIONS.filter(q => q.factor === 0).length,
    exposureCount: QUESTIONS.filter(q => q.factor === 4).length,
    bodyfatIdx: I.bodyfat
  };
})();
`;

// 4) VM context with the light stubs the core touches lazily (localStorage in face/body import).
const ctx = vm.createContext({
  console,
  Math, JSON, Date, Number, String, Object, Array, parseInt, parseFloat, isFinite, isNaN,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: undefined,
  window: undefined,
  navigator: undefined
});

try {
  new vm.Script(core + harness, { filename: 'smvcalc-core.js' }).runInContext(ctx);
} catch (err) {
  console.error('Failed to evaluate the scoring core:', err && err.stack || err);
  process.exit(2);
}

const P = ctx.__PANEL__;
if (!P) { console.error('Harness produced no result.'); process.exit(2); }

// ── Expectation bands (permanent regression bands) ──────────────────────────
// Each band pins the spec's NUMERIC envelope [min,max] plus every tier that envelope can
// legitimately cross under the §9.2-rescaled TIERS boundaries: Low SMV 0–2.9, Below Average 3.0–4.9,
// Average 5.0–6.4, Above Average 6.5–7.9, High Value 8.0–8.9, Elite 9.0–10. A band's `tiers` list is
// the exact set of tier labels [min,max] can map to under those boundaries — it is not "widened."
//
// §9.3 makes the ceiling and floor tier expectations HONESTLY ENFORCED (no more documented deviations):
//   • ceiling: §9.3 pins total ≥9.0 AND tier Elite. §9.1 lets Status reach ~9.4 (the four markers keep
//     their full range once kids/record left the average), so the max-everything Ceiling fixture totals
//     9.3 → Elite under the §9.2 boundary (Elite = ≥9.0). tiers is the single label ['Elite'] — strict.
//   • floor: §9.3 pins total ≤3.0 AND tier Low SMV. §9.1 lets the single felony subtract a full −3.5
//     (was a compressed 2.0 inside the average), dropping Status to the clamp floor 1.0 and the total to
//     2.7 → Low SMV (0–2.9). tiers is the single label ['Low SMV'] — strict.
// No other fixture's band changed: the §9.2 rescale moved only the High Value/Elite boundary (8.9/9.0),
// and no non-ceiling fixture (next highest is Davidson 7.7) sits near it, so their tiers are untouched.
const BANDS = {
  ceiling:     { min: 9.0, max: 10.0, tiers: ['Elite'] },                    // §9.3: ≥9.0 AND Elite, strict
  median:      { min: 4.6, max: 5.8,  tiers: ['Average', 'Below Average'] },
  richAnon:    { min: 6.0, max: 7.5,  tiers: ['Average', 'Above Average', 'High Value'] },
  famousBroke: { min: 5.8, max: 7.3,  tiers: ['Above Average', 'Average', 'High Value'] },
  looksOnly:   { min: 5.5, max: 7.0,  tiers: ['Above Average', 'Average'] },
  floor:       { min: 0.0, max: 3.0,  tiers: ['Low SMV'] },                  // §9.3: ≤3.0 AND Low SMV, strict
  davidson:    { min: 7.5, max: 9.2,  tiers: ['Above Average', 'High Value', 'Elite'] }
};
const FIXTURE_ORDER = ['ceiling', 'median', 'richAnon', 'famousBroke', 'looksOnly', 'floor', 'davidson'];
const LABEL = {
  ceiling: 'Ceiling (top male celeb)', median: 'Median (35yo teacher)',
  richAnon: 'Rich-anonymous', famousBroke: 'Famous-broke (TikToker)',
  looksOnly: 'Looks-only (model)', floor: 'Floor (worst-case)', davidson: 'The Davidson case'
};

const fail = [];
const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

// ── Print the panel table ──────────────────────────────────────────────────
const fnames = P.factorNames;
console.log('\nSMV CALIBRATION PANEL');
console.log('='.repeat(96));
console.log(pad('Fixture', 26) + fnames.map(n => padL(n.slice(0, 8), 9)).join('') + padL('TOTAL', 8) + '  ' + pad('Tier', 14) + 'Band');
console.log('-'.repeat(96));
for (const key of FIXTURE_ORDER) {
  const r = P.results[key];
  const b = BANDS[key];
  const inBand = r.total >= b.min && r.total <= b.max && b.tiers.includes(r.tier);
  if (!inBand) fail.push(`${LABEL[key]}: total ${r.total.toFixed(1)} / tier "${r.tier}" outside band [${b.min}–${b.max}] ${JSON.stringify(b.tiers)}`);
  console.log(
    pad(LABEL[key], 26) +
    r.factors.map(v => padL(v.toFixed(1), 9)).join('') +
    padL(r.total.toFixed(1), 8) + '  ' +
    pad(r.tier, 14) +
    (inBand ? 'OK' : `FAIL want ${b.min}-${b.max}`)
  );
}
console.log('-'.repeat(96));

// ── Structural assertions ───────────────────────────────────────────────────
console.log('\nSTRUCTURAL ASSERTIONS');

// §10.5: total question count stays 30 (Looks 7, Exposure 6 after the body-fat add + invitations cut).
const qcOK = P.questionCount === 30 && P.looksCount === 7 && P.exposureCount === 6 && P.bodyfatIdx >= 0;
if (!qcOK) fail.push(`question shape wrong: total=${P.questionCount} (want 30), Looks=${P.looksCount} (want 7), Exposure=${P.exposureCount} (want 6), bodyfatIdx=${P.bodyfatIdx}`);
console.log(`  (0) question shape: total=${P.questionCount}, Looks=${P.looksCount}, Exposure=${P.exposureCount}  ${qcOK ? 'OK' : 'FAIL'}`);

const am = P.results.allMedian;
const amOK = Math.abs(am.total - 5.5) <= 0.5;
if (!amOK) fail.push(`all-median total ${am.total.toFixed(1)} not within ±0.5 of 5.5`);
console.log(`  (a) all-median total = ${am.total.toFixed(1)}  (want 5.0–6.0)  ${amOK ? 'OK' : 'FAIL'}`);

const weightsEqual = Math.abs(P.expoWeightM - P.expoWeightF) < 1e-9;
if (!weightsEqual) fail.push(`per-sex Exposure weight totals differ: m=${P.expoWeightM} f=${P.expoWeightF}`);
console.log(`  (b) Exposure weight totals: m=${P.expoWeightM.toFixed(2)} f=${P.expoWeightF.toFixed(2)}  ${weightsEqual ? 'OK' : 'FAIL'}`);

// §9.3 structural: the Status ceiling and floor are REAL. Proven directly by the probes so the range
// isn't just asserted through the composite total — max-everything Status ≥ 9.0, worst-case ≤ 1.5.
const maxSt = P.results.maxStatus.factors[P.statusIdx];
const maxStOK = maxSt >= 9.0;
if (!maxStOK) fail.push(`max-everything Status probe = ${maxSt.toFixed(1)}, want ≥ 9.0`);
console.log(`  (c) max-everything Status = ${maxSt.toFixed(1)}  (want ≥ 9.0)  ${maxStOK ? 'OK' : 'FAIL'}`);

const minSt = P.results.minStatus.factors[P.statusIdx];
const minStOK = minSt <= 1.5;
if (!minStOK) fail.push(`worst-case Status probe = ${minSt.toFixed(1)}, want ≤ 1.5`);
console.log(`  (d) worst-case Status = ${minSt.toFixed(1)}  (want ≤ 1.5)  ${minStOK ? 'OK' : 'FAIL'}`);

// Extra sanity: the rich-anonymous fixture's bottleneck must be Status or Exposure (§7 fixture 3 —
// Money/Looks are his strengths, the soft social axes cap him). §9.1 legitimately lifted his Status
// above Charm (kids/record no longer drag the average), leaving Exposure tied at the minimum with
// Charm — so we require Status OR Exposure to SIT AT the minimum (tie-tolerant), rather than winning
// indexOf's first-match tiebreak. This still fails if Looks/Money ever became his bottleneck.
const ra = P.results.richAnon;
const raMin = Math.min(...ra.factors);
const raBottleneckOK = ['Status', 'Exposure'].some(n => ra.factors[fnames.indexOf(n)] === raMin);
const raLowName = fnames[ra.factors.indexOf(raMin)];
if (!raBottleneckOK) fail.push(`rich-anonymous bottleneck is ${raLowName}, expected Status or Exposure at the minimum`);
console.log(`  (+) rich-anonymous bottleneck = ${raLowName} (Status ${ra.factors[fnames.indexOf('Status')].toFixed(1)}, Exposure ${ra.factors[fnames.indexOf('Exposure')].toFixed(1)})  ${raBottleneckOK ? 'OK' : 'FAIL'}`);

// Davidson: Charm must be one of his top-2 factors (the residual-leverage design working).
const dav = P.results.davidson;
const davRanked = fnames.map((n, i) => ({ n, v: dav.factors[i] })).sort((a, b) => b.v - a.v);
const davCharmTop = davRanked.slice(0, 2).some(x => x.n === 'Charm');
if (!davCharmTop) fail.push(`Davidson Charm (${dav.factors[fnames.indexOf('Charm')].toFixed(1)}) is not a top-2 factor`);
console.log(`  (+) Davidson top factors = ${davRanked.slice(0, 2).map(x => x.n).join(', ')}  ${davCharmTop ? 'OK' : 'FAIL'}`);

console.log(`\n  job-title list size = ${P.jobCount} (spec: ~150–200)`);

// ── Verdict ─────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(96));
if (fail.length) {
  console.log(`RESULT: ${fail.length} failure(s)\n`);
  fail.forEach(f => console.log('  ✗ ' + f));
  console.log('');
  process.exit(1);
}
console.log('RESULT: all fixtures and structural assertions passed.\n');
process.exit(0);
