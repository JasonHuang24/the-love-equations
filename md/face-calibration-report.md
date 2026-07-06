# Face Calc — model-scale calibration report (session F1)

**Date:** 2026-07-06 · **Author:** Claude (Opus 4.8, ultracode) · **Status:** landed in the working tree, **uncommitted** (Jason reviews on `localhost:8753`).

## What changed (and only this)

`face.html` → `MODEL_CONFIG`, **two constants + their comment**:

| | before | after |
| --- | --- | --- |
| `outMin` | `1.5` | **`1.797`** |
| `outMax` | `4.5` | **`4.379`** |

Nothing else that scores changed — `PROFILES` (gamma/contrast/scaleMax/weights), `METRICS`, `MEASURES`, `gradeFace`, `mapModelScore`, tier thresholds, `SEX_MODEL_CONFIG` are byte-untouched. The two constants only relocate where the model's raw output maps onto `[0,1]` before each lens's curve:

```
norm = clamp01( (model_raw − outMin) / (outMax − outMin) )
displayed = mapModelScore(norm, lens)   // unchanged curve
```

This replaces the honest interim confession in the old comment — *"min-max off ~3 faces is fragile"* — with anchors derived from 400 real calibration faces run through the shipped pipeline. It mirrors the Body Calc recalibration of 2026-06-21 (studio percentiles → real-pipeline percentiles).

## The instrument (why the browser, not Python)

Calibration was measured through **`face.html`'s own debug Batch mode at `localhost:8753`** — the exact shipped pipeline: MediaPipe face box → 1.4× square crop with the 0.06 forehead nudge → 224² canvas resample → ImageNet-normalized tensor → `models/face-beauty.onnx`. The crop/framing is itself a distribution shift; calibrating a Python reimplementation would measure the wrong instrument (the Body Calc's *"framing dominates the raw"* lesson). The batch harness (`window.__lcBatchRun`) was driven from fetched image blobs via the connected Chrome browser; **`localStorage` was verified byte-identical before/after every batch** (the harness's own guard + an explicit snapshot compare).

## 1 · Data

**SCUT-FBP5500 v2** (Liang et al., 2018, arXiv:1801.06345) — 5500 frontal faces, each labelled with the **mean of 60 human beauty ratings** on a 1–5 scale, across four subsets: Asian-Female (**AF**, 2000), Asian-Male (**AM**, 2000), Caucasian-Female (**CF**, 750), Caucasian-Male (**CM**, 750). Non-commercial research use only. Obtained via the official GitHub repo's Google-Drive zip (`SCUT-FBP5500_v2.zip`, 171 MB, id `1w0TorBfTIqbquQVd6k3h_77ypnrvfGwf`), stored under `images/calibration-scut/` (**gitignored** — dataset never committed, mirroring `images/calibration/`). Acquisition + label table are reproducible: `tools/fetch_calibration_faces.py`. Label table (`labels.csv`) verified: 5500 rows, AF=2000/AM=2000/CF=750/CM=750, all images present on disk, images are 350×350 RGB.

## 2 · Sample (~400)

`tools/sample_face_calibration.py` (seed `20260706`, deterministic) → `sample_manifest.csv`: **400 images, 100 per subset**, each subset = **top-15 + bottom-15 by rating (forced tails)** + 70 random from the middle. By reason: 60 top15, 60 bottom15, 280 random. 400 unique filenames. Sample rating span **1.017 – 4.750** (full dataset tail-to-tail, by construction).

## 3 · Pipeline run

All 400 fetched (0 fetch failures) and scored through the batch harness.

**Refusal breakdown: 400 scored · 0 refused · 0 error.** SCUT's clean, centered frontal faces are ideal MediaPipe input, so the expected "no face found / too small" refusals did not occur — a documented outcome, not a gap. `model_raw` present on all 400. `localStorage` unchanged ✓. Raw export saved to `images/calibration-scut/batch_results.csv` (29,676 bytes, 400 rows).

`model_raw` distribution over the 400 scored: **min 1.322 · max 4.501 · mean 3.088 · sd 0.744.** Note the old `outMin=1.5` sat *above* the true minimum (3 faces were being floored) and `outMax=4.5` sat at the very top (only 1 face reached norm≈1) — the interim anchors mislocated the distribution.

## 4 · Analysis

`tools/calibrate_face_anchors.py` (DOM-free; stdlib + numpy; self-contained Spearman + percentile so an independent verifier can re-derive).

### (a) Proposed anchors — p2/p98 of `model_raw`

**outMin = p2 = 1.7967 → `1.797`**, **outMax = p98 = 4.3794 → `4.379`** (3 dp, matching Body Calc's convention). Clamping: old `1.5/4.5` → 3 low + 1 high; new → 8 low + 8 high (~2% each tail, by construction).

### (b) Spearman ρ — `model_raw` vs SCUT mean rating (demographic-skew disclosure)

| scope | n | Spearman ρ | Pearson r |
| --- | --- | --- | --- |
| **overall** | 400 | **0.933** | 0.945 |
| AF (Asian F) | 100 | 0.957 | 0.953 |
| AM (Asian M) | 100 | 0.941 | 0.961 |
| CF (Caucasian F) | 100 | 0.917 | 0.937 |
| CM (Caucasian M) | 100 | 0.905 | 0.928 |

The model tracks human ratings tightly and **consistently across all four demographic subsets** (ρ range 0.905–0.957) — no subset where the scale collapses. The Asian subsets edge out the Caucasian ones, plausibly reflecting SCUT's 2000/2000 vs 750/750 training weighting.

### (c) Contamination check → ρ is OPTIMISTIC

Our `models/face-beauty.onnx` **is** the Gustrd `resnet18_py3.pth` SCUT-FBP5500 checkpoint (documented in `models/README.md`, the conversion recipe). The dataset ships an official split (`train_test_files.zip`), but **no holdout manifest is recorded in this repo or alongside our checkpoint** identifying which images Gustrd held out. Per the pre-registered rule, all 400 sampled images are therefore treated as **training-seen**, and the ρ above is an **in-distribution upper bound (optimistic)**.

Context for the size of the optimism: the canonical SCUT-FBP5500 ResNet-18 benchmark reports **test-set Pearson ≈ 0.878** on the official 60/40 split (Liang et al., 2018). Our in-distribution Pearson (0.945) exceeds that by ~0.07 — that gap *is* the contamination inflation. Even the pessimistic held-out figure (~0.88) clears the trustworthiness bar comfortably.

**The anchors are unaffected by contamination** — they only locate the output distribution (a percentile of `model_raw`), which is a property of the model's outputs on realistic inputs regardless of train/test membership. Only the *validation claim* (ρ) carries the caveat.

### (d) Before/after — displayed headline at `model_raw` percentiles

Displayed Black Pill (PSL /8.6) | Conventional (/10), old `1.5/4.5` vs new `1.797/4.379`:

| pct | model_raw | OLD BP | OLD CV | NEW BP | NEW CV |
| --- | --- | --- | --- | --- | --- |
| p5 | 2.004 | 1.44 | 2.17 | **1.10** | **1.45** |
| p25 | 2.604 | 3.12 | 4.27 | **2.53** | **3.64** |
| p50 | 2.846 | 4.12 | 5.22 | **3.58** | **4.72** |
| p75 | 3.838 | 7.85 | 8.74 | **7.92** | **8.83** |
| p95 | 4.313 | 8.53 | 9.80 | **8.59** | **9.94** |

The recalibration **lowers the low-to-mid range** (raising `outMin` 1.5→1.797 pushes a median face from BP 4.12 → 3.58) and barely moves the top (raising the high tail slightly as `outMax` drops 4.5→4.379). Net effect: the page was **over-scoring average faces**; the new anchors seat the median SCUT face — an ordinary person — at a below-average headline, which is the honest reading.

## 5 · Pre-registered thresholds (report-only; Jason rules on any action)

| threshold | met? |
| --- | --- |
| **ρ ≥ 0.6** → scale trustworthy as displayed | **YES** — overall ρ = 0.933 (optimistic); even the ~0.88 held-out benchmark clears it |
| 0.4 ≤ ρ < 0.6 → flag one-decimal display may overstate resolving power | n/a |
| ρ < 0.4 → land anchors, flag model discrimination | n/a |

**Finding: the scale is trustworthy as displayed** against the pre-registered bar. This session made **no** change to display precision, tiers, or copy (authorized to touch exactly the two constants). If Jason wants the contamination caveat surfaced to users, that's a separate copy decision — flagged, not acted on.

## 6 · The landed constants

`face.html` `MODEL_CONFIG` now reads:

```js
outMin: 1.797, outMax: 4.379,  // SCUT-FBP5500 p2/p98 of model_raw through the shipped browser
// pipeline (crop→model), 2026-07-06, N=400 scored / 0 refused; overall Spearman ρ=0.93
// (in-distribution → optimistic: this .onnx is the Gustrd SCUT checkpoint, canonical
// held-out ResNet18 PC≈0.88). See md/face-calibration-report.md
```

## Verification (every claim cites file / CSV row / pasted output)

**Port cross-check (analysis integrity).** The `mapModelScore` port in `calibrate_face_anchors.py` was checked against the harness's *own* `bp`/`cv` output under the OLD anchors on all 400 rows: **bp exact-match 373/400, cv 374/400, max |diff| 0.01** — the ~27 mismatches are all a single 2-dp rounding boundary (the harness computes from full-precision `model_raw`; the CSV logs it to 3 dp). The port faithfully reproduces the page's scoring curve, so the before/after "after" column is trustworthy.

**V1 — independent recompute (separate code, no shared functions).** A verification agent re-derived p2, p98, and ρ (overall + per subset) from `batch_results.csv` + `labels.csv` with its own CSV loader, own numpy percentile call, and a from-scratch average-tie Spearman. All **7/7 numbers matched to 4 dp** (p2 1.7967, p98 4.3794, ρ overall 0.9333, AF 0.9571, AM 0.9412, CF 0.9165, CM 0.9049). It independently confirmed 400 scored / 0 non-scored, clean join (no unmatched filenames), model_raw min/max 1.3220/4.5010, and that tie-handling is genuinely exercised (78 tied points across 38 values). **VERDICT: PASS.**

**V2 — live `:8753` spot-check (page shows exactly norm→curve→displayed under new anchors).** Three images re-scored through the reloaded (edited) page; `model_raw` was **identical** to the pre-edit run (1.322 / 2.783 / 4.033 — proving the edit touched only the display mapping, not the model path). Hand-computed `norm → lens curve → js_round2` under `1.797/4.379` matched the page's displayed bp/cv **to the penny** for all three:

| image | model_raw | norm | page BP / hand | page CV / hand |
| --- | --- | --- | --- | --- |
| AF1986 | 1.322 | 0.000 (floored) | 1.00 / 1.00 ✓ | 1.00 / 1.00 ✓ |
| CF235 | 2.783 | 0.382 | 3.29 / 3.29 ✓ | 4.44 / 4.44 ✓ |
| AF1973 | 4.033 | 0.866 | 8.32 / 8.32 ✓ | 9.39 / 9.39 ✓ |

**VERDICT: PASS.**

**V3 — regression (single-shot / persistence / composite / console / localStorage).**
- Single-shot: drove one image through the real file-input path → headline rendered **"8.3 PSL"** (live `model_raw` 4.0326 → new-anchor BP 8.32). ✓
- Persistence: `loveEquations.faceScore.v2` updated with the new-anchor payload `{bp:8.320, cv:9.393, bpMax:8.6, cvMax:10, floor:1, source:"model", sex:"f", ts}`. ✓
- Face × Body composite: `leComposite.saveFace` writes `FACE_KEY = loveEquations.faceScore.v2` (`js/composite-score.js:182`), which the composite's `overall()` reads — so it now carries new-anchor data. (`compositeLens.v1` correctly unchanged; it stores only the lens-toggle preference, `js/composite-score.js:20,37`.) ✓
- Console: zero errors from the change; the only console message is MediaPipe's benign `INFO: Created TensorFlow Lite XNNPACK delegate for CPU`, pre-existing on every load. ✓
- `localStorage`: batch mode never persisted (`ls_unchanged` true in V2); the single-shot's intentional writes were then **fully restored** from a pre-test snapshot (extra `faceShot.v1` removed, `faceScore.v2` and all 10 keys restored exactly). The user's saved state is untouched. ✓

**VERDICT: PASS.**

## Reproducibility

```bash
python tools/fetch_calibration_faces.py         # download + extract SCUT-FBP5500 → images/calibration-scut/
python tools/sample_face_calibration.py         # deterministic 400-image sample → sample_manifest.csv
# run the sample through face.html Batch mode at localhost:8753 (drive __lcBatchRun with the sampled blobs),
# export → images/calibration-scut/batch_results.csv
python tools/calibrate_face_anchors.py          # anchors, ρ, before/after → anchor_analysis.json + joined_analysis.csv
```

## Appendix — analysis stdout (verbatim, negative results preserved)

```
N scored = 400 | N refused/error = 0
model_raw: min=1.322 max=4.501 mean=3.088 sd=0.744

(a) PROPOSED ANCHORS  outMin=p2=1.797  outMax=p98=4.379   (old 1.5/4.5)
    faces clamped (norm hits 0/1):  OLD 3 low + 1 high  |  NEW 8 low + 8 high (~2% each tail by construction)

(b) SPEARMAN rho (model_raw vs SCUT mean rating):
    OVERALL  rho=0.933  (Pearson r=0.945, n=400)
    AF  rho=0.957  (Pearson r=0.953, n=100)
    AM  rho=0.941  (Pearson r=0.961, n=100)
    CF  rho=0.916  (Pearson r=0.937, n=100)
    CM  rho=0.905  (Pearson r=0.928, n=100)

(c) CONTAMINATION: face-beauty.onnx == Gustrd SCUT-FBP5500 checkpoint (models/README.md);
    no holdout manifest recorded in-repo/alongside the model -> ALL images treated as training-seen.
    => rho above is OPTIMISTIC (in-distribution upper bound). Anchors unaffected.

[port check] mapModelScore port vs harness bp/cv under OLD anchors over 400 rows:
    bp exact-match 373/400 (max |diff| 0.01); cv exact-match 374/400 (max |diff| 0.01)
    (tiny mismatches expected only at a 2-dp rounding boundary, since raw is logged to 3 dp)

(d) BEFORE/AFTER at model_raw percentiles (displayed headline BP | CV):
    pct   raw    | OLD 1.5/4.5  BP    CV   | NEW 1.797/4.379  BP    CV
    p5    2.004 |             1.44  2.17 |                  1.10  1.45
    p25   2.604 |             3.12  4.27 |                  2.53  3.64
    p50   2.846 |             4.12  5.22 |                  3.58  4.72
    p75   3.838 |             7.85  8.74 |                  7.92  8.83
    p95   4.313 |             8.53  9.80 |                  8.59  9.94

(5) PRE-REGISTERED THRESHOLDS (report-only; Jason rules on any action):
    overall rho=0.933 (optimistic)  ->  rho >= 0.6 -> scale trustworthy as displayed
```
