# Body Calc — Objective-Spine Hybrid Spec (v1 draft)

**Status:** IMPLEMENTED & COMMITTED to main 2026-07-05 (Jason's localhost test passed) — all 6 decision points (DP-1 … DP-6) ruled below.
**Architect:** Fable 5 (this session). **Implementer:** Claude Code, Opus 4.8, Ultracode / xhigh.
**Scope:** `body.html`, `js/composite-score.js` (payload shape only — see §7), new CSS in `css/body.css`.
**Non-scope:** Face Calc code (its remaining work is a calibration *protocol*, Appendix A — no code change).

---

## 1. Why this exists — the documented holes it patches

The current Body Calc is a two-instrument system: the Connor-trained CNN owns clothed
shots (torso skin < 45%), silhouette geometry owns bare physiques (≥ 45%). The mission
ledger documents four structural failures that neither instrument can fix from a photo:

1. **The bare path lost its Tier-1 leanness signal.** WHtR was correctly demoted to
   "measured, not scored" (frontal *width*/height doesn't convert to the circumference
   bands — the P0 units bug). Consequence: the shirtless/swimwear path — the hero
   "rate my physique" use case — scores with **no adiposity term at all**.
2. **Depth blindness.** A gut projects forward; a frontal silhouette sees it edge-on.
   Overweight bodies are systematically overrated on the bare path.
3. **Muscle/fat conflation.** "A lean frame and a soft one can share an outline" — the
   silhouette cannot tell lean-athletic from skinny-fat.
4. **No absolute scale.** Height and mass are unmeasurable from pixels; every ratio is
   relative.

Height + weight + BF% are exactly the three numbers that close all four holes, with real
units and no proxy math. That is the whole argument for the hybrid: the objective spine
supplies what a photo structurally cannot, and the photo supplies shape/distribution,
which the numbers structurally cannot. Complementary instruments, each scoped to its
domain — the same principle Codex's "don't blend unvalidated signals" review established,
except the objective tier is *more* validated than either photo instrument (FFMI and BF%
are real measurements, not learned or proxied).

---

## 2. Architecture — three tiers

```
INPUTS (new)                 PHOTO (existing, unchanged internally)
height · weight · BF%        CNN (clothed) | silhouette geometry (bare)
        │                                  │
        ▼                                  ▼
  TIER 0 · Objective spine          TIER 1 · Photo read
  FFMI + BF% leanness score         shape/distribution score
        │                                  │
        └────────────┬─────────────────────┘
                     ▼
        TIER 2 · Doctrine blend  →  headline
        + cross-check flag (silhouette vs claimed BF%)
```

### Tier 0 — Objective spine (new)

**Inputs.** Height (dual ft-in/cm — reuse the exact dual-unit input pattern already
shipped in `smvcalc.html`'s de-vibed Looks section), weight (dual lb/kg, same source),
and **BF% via a visual picker**, not a numeric field.

**BF% visual picker.** A sex-conditional grid of 7 reference silhouettes per sex
(m: 6–9% · 10–13% · 14–17% · 18–22% · 23–27% · 28–34% · 35%+;
f: 14–17% · 18–21% · 22–25% · 26–30% · 31–36% · 37–44% · 45%+), each tile an
**illustrated SVG silhouette** in the site's ivory/scarlet palette. Self-estimates skew
~5 pts low; picture-matching is far more honest than typing a number. Selecting a tile
sets BF% to the bucket midpoint. A small "I know my measured BF%" reveal offers a numeric
field for caliper/BIA/DEXA users, with the existing smart-scale accuracy caveat reused.

> **DP-1 — Picker artwork.** (a) Original SVG silhouettes (ship-safe, on-palette,
> CC-buildable — **recommended**); (b) sourced photo grid (more accurate matching,
> licensing burden, style clash). Rule: **(a) Original SVG silhouettes** — ivory/scarlet
> palette, CC-built, no sourced photos. (Parametric `bfSilhouetteSVG(sex, level)`, 7 tiles/sex.)

**Computation.**
- `leanMass = weight × (1 − bf)`
- `FFMI = leanMass(kg) / height(m)²`, then normalized `FFMI_adj = FFMI + 6.1 × (1.8 − h)`
  (Kouri height adjustment, so short/tall frames read on one scale).
- **Frame score (0–100):** sex-conditional curve on FFMI_adj.
  Male anchors (provisional, tunable like INCOME_ANCHORS): 16→15 · 18→40 · 20→65 ·
  22→88 · 23.5→97 · 25→100, plateau above (natural ceiling ≈ 25; beyond it is
  enhancement territory, credited but not extrapolated).
  Female anchors: 13→20 · 14.5→45 · 16→70 · 17.5→90 · 19→100.
- **Leanness score (0–100):** sex-conditional **inverted-U** on BF% — a `band` cue, not
  monotonic. Male band [9, 15] center 12; female band [17, 24] center 20.5; gaussian
  falloff both directions. This deliberately fixes the R1 monotonic-leanness defect from
  the Codex rubric review (an emaciated frame must not bank near-max leanness credit) —
  the objective tier gets the inverted-U the silhouette path couldn't honestly have.
- **Objective score** = weighted mean of frame + leanness.

> **DP-2 — Frame vs leanness weights inside Tier 0.** My draft: 45% frame / 55% leanness
> (leanness is the single strongest replicated cue per Tovée & Cornelissen, and BF% is
> the more reliable input). Rule: **45% frame / 55% leanness** (draft adopted as-is;
> `TIER0_W = { frame: 0.45, leanness: 0.55 }`, provisional/tunable).

All anchors and bands ship as named constants in the pure-core script block with the
`module.exports` test hook, matching the existing sacred-constants pattern.

### Tier 1 — Photo read (existing, internally unchanged)

CNN/geometry routing, gates, refusals, sex chain: all unchanged. What changes is *rank*:
the photo read becomes a component, not the sole headline, whenever Tier 0 inputs exist.

### Tier 2 — Doctrine blend

When both tiers are present:
`headline_raw = W_OBJ × objectiveScore + (1 − W_OBJ) × photoScore` (both 0–100), then
through the existing lens curves (contrast/gamma/scaleMax) exactly as `gradeBody` does
today — the lenses keep interpreting; only the measurement underneath changes.

Lens-differentiated weighting is allowed: Black Pill ("frame" lens) may weight the photo
higher (shape is the frame doctrine); Conventional may weight the objective spine higher
(health/leanness read).

> **DP-3 — The photo-tier bounds (the design's load-bearing decision).**
> How much can the photo move the objective base?
> - (a) **Fixed blend** — my draft: `W_OBJ = 0.60` both lenses, or BP 0.50 / conv 0.65.
>   Simple, transparent, auditable ("your numbers say 6.8; your photo moved it to 7.3").
> - (b) **Bounded modifier** — photo can shift the objective score by at most ±1.5 points
>   (post-lens). Harder cap, even more auditable, slightly more code.
> Rule: **(a) Fixed blend, `W_OBJ = 0.60` for both lenses** — no ±cap variant. Blend on the
> two pre-lens 0–100 scores, then one lens curve (`mapModelScore(blend/100, lens)`).

**Degradation ladder (page identity — photo-first with optional inputs, inverted-pyramid):**

| Present | Headline | Badge |
|---|---|---|
| photo + inputs | Tier-2 blend | "Hybrid — measured inputs × photo read" |
| photo only | current behavior, unchanged | current badges + a nudge: "Add height/weight/BF% for a stronger read" |
| inputs only | objective score alone | "Numbers-only read — add a photo for shape" |

> **DP-4 — Page identity.** The table above keeps photo-first (drop a photo, get the
> current experience, inputs upgrade it) — zero regression for existing users, and the
> inputs panel sits above the drop zone as step 1 of 2. Alternative: inputs-*required*
> (no score without height/weight/BF%), which is more anti-vibes but breaks the
> drag-and-drop-and-forget promise the page copy makes. My rec: photo-first as tabled.
> Rule: **Photo-first, exactly as tabled** — inputs optional (Step 1), the three-state
> degradation ladder as written; zero regression on the photo-only path (verified live).

### Cross-check — the receipts mechanism

When both a bare-physique silhouette and a claimed BF% exist, compare the silhouette's
*frontal* WHtR (its own units — never converted to circumference; that was the P0 bug)
against a provisional frontal-WHtR-by-BF%-bucket table. On gross mismatch (claimed
≤ 13% BF but frontal WHtR reads in the top bucket, or the inverse), render a
non-blocking flag: *"The silhouette and your stated body-fat disagree — one of them is
off (arms/clothing can corrupt the silhouette; self-estimates skew low)."*

> **DP-5 — Flag vs dampen.** (a) **Flag only** (recommended v1 — honest, no fake
> precision; the bucket table is reasoned, not photo-calibrated); (b) dampen the
> objective tier's BF% toward the silhouette read on mismatch (stronger receipts,
> but punishes users for photo artifacts until the table is calibrated). Rule: **(a) Flag
> only** — the cross-check never dampens or modifies any score (verified live: same score
> with the flag firing and not). `crossCheckBF` returns a display flag, not a score delta.

---

## 3. Persistence & interop

- New key `loveEquations.bodyInputs.v1` `{ heightCm, weightKg, bfPct, bfSource:
  'picker'|'measured', sex, ts }` — survives page switches like the shot does; Reset
  clears it (extend `bcResetAll`).
- `bodyScore.v2` **payload shape unchanged** (bp/cv/maxes/floor/source/sex/ts) so
  `composite-score.js` and the SMV calc import keep working untouched. Only additions:
  `source` gains a `'hybrid'` value and an optional `tier0:{ffmi,bf}` field (additive —
  `validScore()` ignores unknown fields). If review finds any consumer switching on
  `source`, bump to v3 with a v2 fallback read.
- SMV calc note (no code this phase): its Build question already imports
  `bodyScore.v2` cv — a hybrid-provenance score makes that import *stronger*; the
  source-aware build weight (1.6 import / 1.25 BMI-only) may later deserve a third tier
  for `'hybrid'`. Logged as follow-up, not built.

## 4. UI

Inputs panel as a new `bc-panel` above the drop zone: height + weight fields (smvcalc
dual-unit pattern), the BF% picker grid, and a one-line honesty note ("Numbers you can
verify: a tape, a scale, a mirror-match. Self-flattery in, garbage out."). Breakdown
panel gains a **Tier 0 section at the top** — FFMI (with the band marker treatment),
BF% leanness (inverted-U band), each with the same measured-vs-typical rendering as the
existing rows, plus the blend arithmetic spelled out: `0.60 × 71 + 0.40 × 64 = 68 → 7.1`.
The math being visible **is** the product.

## 5. Validation — the before/after protocol (locked earlier this session)

Fixed test set 15–30 photos (lean/heavy, muscular/skinny-fat, clothed/bare, good/bad
light, deliberate stress cases: selfie distortion, flexed vs relaxed, baggy clothes) +
per-photo height/weight/BF% ground truth where obtainable. Panel: 3–5 raters, blind,
independent; mean per photo. Metrics: (1) Spearman rank vs panel, before-calc vs hybrid;
(2) consistency — same person, 3 conditions, score swing (hybrid must beat photo-only);
(3) failure-direction audit — hybrid misses should cluster on "bad photo input", and the
cross-check flag should fire on the deliberately mismatched cases. Log the before-calc's
failure modes into mission-notes as boundary markers (why the hybrid exists).

## 6. Test plan (CC session exit criteria)

Node tests on the pure core: FFMI math (incl. Kouri adjustment edge cases), both anchor
curves monotonic within range and plateaued past ceiling, leanness inverted-U (both-side
falloff, sex-conditional), blend arithmetic, degradation ladder (all three presence
states), payload backward-compat (`validScore()` passes with and without `tier0`),
persistence round-trip, Reset clears inputs. Live (localhost:8753): all three ladder
states render with correct badges, picker persists across reload, cross-check flag fires
on a synthetic mismatch, composite + SMV import unaffected, zero console errors.
Uncommitted per standing rule; Jason tests on localhost.

## 7. Explicitly out of scope this phase

Face Calc code (Appendix A is a protocol), CNN retraining, SMV build-weight retune,
matchmaker interop, geometry band recalibration (resumes after the hybrid lands, tuned
against the blend).

Phase 3 candidate: frozen DINOv2/CLIP features + small regression head on Connor labels — same ONNX slot, targets the studio→real-photo drift; revisit after hybrid validation.

---

## Appendix A — Face Calc calibration protocol (Jason runs; no code)

The face model's `outMin/outMax = 1.5/4.5` is the conservative Codex interim — the
ledger flags it as softening scores you liked. Same fix the body model got: collect
10–15 varied clean frontal faces spanning the range, run each on localhost with
`?debug`, record the red `model raw output` line, set `outMin/outMax` to roughly the
2nd/98th percentile of the observed raws (or two-point fit against faces whose scores
you're confident in, as done for the body). One constants edit, revisable per batch.

> **DP-6 — Face recalibration timing.** Fold the constants edit into this CC session's
> diff (you supply the raws before the run), or defer to its own pass. Rule: **Defer** —
> Face Calc is fully out of scope this session; `face.html` and its constants were not touched.
