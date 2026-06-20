# Peer-review brief — Composite calc + Body-Calc mis-sex fixes + Face rename

**Builder:** Claude · **Reviewer:** Codex · **Date:** 2026-06-20
**Status:** all on the **working tree, uncommitted** (Jason tests on `localhost:8753`). We commit + push **only after you and I agree.** This brief is the review scope.
**Workflow constraint:** straight-to-`main`, no feature branches. `.claude/` is gitignored — that's why this brief sits at repo root.

---

## TL;DR — what to review

Four loosely-coupled changesets landed in one round. Review them as one body of work because they ship together:

1. **Body Calc — three-layer "don't confidently mis-sex" defense** (`body.html`). The headline bug Jason hit repeatedly: women read as **male**. Three independent root causes, three guards.
2. **Body Calc — retrained CNN calibration anchors** (`body.html` `MODEL_CONFIG`).
3. **Face × Body composite** — new shared module + partial, on both calc pages (`js/composite-score.js`, `partials/composite-section.html`, CSS, `include.js`).
4. **Looks Calc → Face Calc rename** + composite title simplification.

**The single most important thing I want challenged:** the **accepted-flaw decision** in §A-bonus below — we are *deliberately not* recalibrating the body geometry weights. I want you to attack that reasoning, not assume it.

---

## File inventory

**New files** (review in full, not as a diff):
- `body.html` — the entire Body Calc page (never committed before).
- `js/body-pose-worker.js` — MediaPipe Pose worker for the body calc.
- `js/composite-score.js` — the composite module.
- `partials/composite-section.html` — composite host markup.
- `models/body-beauty.onnx` — retrained body model binary.
- `models/train_body_beauty.py` — its training script.

**Modified (tracked) files** (review as diff vs `HEAD`):
- `face.html` (was `looks.html`, `git mv`) — rename + composite wiring + QOVES link.
- `partials/navigation-bar.html`, `css/styles.css`, `js/include.js`, `models/README.md`, `mission-notes.md`.

**Do NOT commit:** `models/__pycache__/` (Python bytecode — needs a `.gitignore` entry; flag if you see other stray artifacts).

---

## A. Body Calc — three-layer mis-sex defense (`body.html`)

Sex is read from the **body** photo: BlazePose face keypoints (0 nose · 1–6 eyes · 7–8 ears · 9–10 mouth) crop a face → InsightFace **`genderage.onnx`** (`models/face-sex.onnx`, 96×96 raw RGB, output `[female, male, age]`). The sex re-bases the typical bands and the composite tier coding, so a wrong sex visibly corrupts the result. Priority chain: **manual toggle > model > geometry guess**, graceful fallback if the model file is absent.

Each guard fixes a **distinct, reproduced** failure (all three were verified live against real photos driven through the pipeline):

| Guard | Location | Failure it fixes | Mechanism | Threshold + justification |
|---|---|---|---|---|
| **Crop gate** | `cropSexFaceTensor` ~`body.html:990` | Classifier never fired → fell to the unreliable geometry guess | Gate on the **sampled** region `side = faceBox × cropScale(1.9)`, not the raw inner-face bbox | `side < 40px` → `face-too-small`. Old raw-40px gate rejected normal single-subject shots (inner-face bbox ~25–45px). |
| **Occlusion guard** | `faceEyesOccluded` ~`body.html:957` | genderage **confidently** mis-sexes sunglasses-women as male (97–99% conf) — eyes are its strongest cue | Eye-center vs same-face cheek **luminance ratio** (tone-robust) | `ratio < 0.70` → undetermined. Clear eyes ~0.99 (bright sclera), dark/reflective shades 0.51–0.65. Biased to catch. |
| **Confidence gate** | `inferSex` ~`body.html:1010` | Tiny sunglasses face (25px) the occlusion guard can't resolve; genderage asserted male at only **63%** | Respect genderage's own soft confidence | `conf < 0.75` → undetermined. Correct reads cluster 0.87–1.0. |

Plus existing gates kept: low-visibility (`avgVis < 0.5`), degenerate-bbox, and a **stale-generation discard** (`gen !== currentGen`) so an older async inference can't overwrite a newer photo's result. Undetermined state → `window.bcSetSexUnknown(reason)` → renders "Sex undetermined — …" + a male–female score range + a one-click **Read as female / male** toggle (the final backstop).

**Already verified live (don't redo):** Obama clear face (ratio 0.994, conf 0.87–0.99) → fires male, no false-positive; two Commons sunglasses-women (ratio 0.508 / 0.654) → undetermined; simulated 63% read → undetermined render correct; console clean.

**Test hooks for your own repro:** `window.__bcSex` (n, avgVis, facePx, sampledPx, reason, sex, conf) and `window.__bcEyeRatio` are set on every read.

### A-bonus — the accepted flaw I want you to attack

Jason's athletic woman (fit, sportswear) scores ~**5/10 body**; an earlier overweight man scored ~**5.4**. My position, which he's accepted **pending your review**:

> These are the *same* failure in opposite directions. A **frontal silhouette** reads proportion (WHR, V-taper, an adiposity proxy) but **not body composition** — it cannot tell that an average-width midsection is muscle vs. softness. So *fit* and *fat* both collapse toward the middle. Any weight tweak that lifts the athletic woman also lifts the overweight man. It's an **approach ceiling**, not a tunable constant — the same "geometry can't read gestalt" lesson as the Face Calc heuristic. **Recommendation: accept + label (prototype framing, QOVES pointer), do not recalibrate.** The real fix is the trained CNN (still *unexercised* — every test shot was shirtless → fell through to geometry) or a side view for depth.

**Questions for you:**
- **P1** — Is that reasoning sound, or is there a genuinely non-breaking calibration win I'm dismissing? Specifically: distinguish **global compression toward 5** (everyone clusters mid → a *spread/contrast* fix that does NOT risk other cases) from **per-case silhouette-blindness** (not tunable). If you can show it's the former from the geometry mapping, that changes the call.
- **P2** — The female conventional lens leans on WHR/curviness, which structurally under-credits an athletic (lean-hipped, non-hourglass) frame. Is that a defensible "the rubric encodes one ideal" tradeoff, or a bias worth a labeled second mode?

---

## B. Body Calc — retrained CNN anchors (`body.html` `MODEL_CONFIG` ~:834)

`outMin: 26.234, outMax: 69.261` (was -2/47). From the 2026-06-20 retrain (single grouped-**holdout** split — not cross-validation; best epoch + calibration percentiles both read off the same val set — val **Spearman 0.716 / Pearson 0.717 / RMSE 10.8**, ONNX parity 0.0). These are **studio percentiles** — a starting anchor. Real phone photos historically compressed ~10–20pt below studio, so the model is expected to under-spread on real shots until re-anchored on a real-photo calibration set.

- **P2** — The anchors are honest but unexercised on **clothed** real photos (all test shots were shirtless → geometry path). Is shipping the studio anchors with a "provisional, re-anchor when raws cluster low" caveat acceptable, or should the CNN headline stay gated off until calibrated? Note `mapModelScore` interprets the single CNN value through each lens curve.

---

## C. Face × Body composite (`js/composite-score.js` + `partials/composite-section.html`)

Cross-page persistence via **localStorage** (NOT live globals — `window.LC`/`window.BC` live on separate pages and never coexist). Keys `loveEquations.faceScore.v1` / `bodyScore.v1`. Each calc persists both lens scores + each lens's `scaleMax` + source + sex via `window.leComposite.saveFace/saveBody`, called from the **tail of each page's `renderResult`** (fires on every finalized score, incl. async model arrival + sex/profile changes).

**Blend:** `norm10(score, max)` maps each calc to a 0–10 share of **its own lens range** (face PSL maxes 8.6, body BP maxes 9 → normalize so they're comparable), then `overall = FACE_WEIGHT·face + (1−FACE_WEIGHT)·body`, **`FACE_WEIGHT = 0.5`** (one constant, labeled provisional). States: both-scored hero (BP headline + conventional secondary + face/body breakdown + source attribution), partial/empty (prompts the missing calc), body `needsSex` ("set a sex to resolve"), Reset (clears both keys). Renders on a `partials:loaded` event `include.js` now dispatches.

**Already verified live (don't redo):** real face scored on Face Calc → carried cross-page to Body Calc → body scored → blended 5.8 "High-tier normie", `needsSex` path, partial states, Reset all correct; CSS native; console clean.

**Questions:**
- **P1** — `norm10` guards `!max`, but a **stale `.v1` payload** from before a schema change could carry a missing/zero `bpMax`/`scaleMax`. Is the guard + key-versioning enough, or do we need an explicit shape check / migration before trusting persisted data?
- **P1** — Is "normalize each lens to its **own** max, then blend" sound, or does dividing by different per-lens maxes (8.6 vs 9) distort the comparison in a way that misleads? Sanity-check the math.
- **P2** — `FACE_WEIGHT = 0.5`: reasonable default, or should it be sex-conditional (the face/body balance differs by sex in the literature)? Tier-label coding (Chad/Stacy) — is it consistent across the two calcs and the composite?

---

## D. Looks → Face rename (`face.html` et al.)

`git mv looks.html face.html` (history preserved). `data-page="looks"` → `"face"` on both `<body>` and the nav-link (that pair drives the active-nav highlight in `include.js`). Every reference repointed: nav href, `body.html` page-sub link, `composite-score.js` todo link + comment, `models/README.md`. Composite title "Overall looks & appearance rating" → **"Overall looks rating"**. Internal `window.LC` global left as-is (page-private, never user-facing).

**Already verified live:** `face.html` → 200, `looks.html` → 404, nav highlight lights "Face Calc", body.html links repoint, console clean.

- **P3** — Any remaining `looks.html` reference that *should* have moved? (Intentional leftovers: historical `mission-notes.md` ledger rows and `looks-calc-review-brief.md`, which describe past work under the old name.)

---

## Review checklist (priority-ordered)

- **P1** — Correctness/regression: the three sex gates' thresholds + interaction order (occlusion runs in `drawAndScore` *before* the classifier; confidence gate *after*); any path that now suppresses a confident-**correct** read. Composite `norm10` edge cases + per-lens normalization soundness + stale-payload safety.
- **P1** — The **accepted-flaw** reasoning in §A-bonus: global-compression (fixable) vs silhouette-blindness (not). This is the call that gates whether we touch weights at all.
- **P2** — `FACE_WEIGHT 0.5` (sex-conditional?); CNN studio anchors shipped uncalibrated on clothed shots; female-lens WHR bias.
- **P3** — `models/__pycache__/` must not be committed; CSS cache-bust version; rename leftovers; a11y on the composite section; dead code.

**When we agree:** commit straight to `main`, message ending `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`, push. Decide at commit time whether `models/body-beauty.onnx` (binary) goes in (prior convention committed the `.onnx` binaries).
