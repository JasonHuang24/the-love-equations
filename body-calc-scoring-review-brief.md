# Body Calc — measuring-system & rubric second-opinion brief (for Codex)

**Date:** 2026-06-19 · **Author:** Claude · **Files:** `body.html`, `js/body-pose-worker.js`, `models/train_body_beauty.py`

## What this is
The Body Calculator (`body.html`) scores body attractiveness from a single photo, **fully client-side / on-device** (static HTML site, no backend). It's now in a usable state but Jason still sees three recurring failure patterns. **This is a request for a second opinion — review the measuring system AND the rubric, critique the design, and propose fixes (you may implement, but a sharp critique is the primary ask).** It is not a bug ticket with one known answer.

Project ethos (load-bearing — judge proposals against it): transparency, sourced/evidence-tiered data, *honest over confidently wrong*, data over intuition, reasoned judgment calls labelled as such and kept revisable. The geometry panel is deliberately a transparent, evidence-ranked **measurement** the black-box CNN can overrule; degrading to "we can't read this honestly" is preferred over emitting a confident wrong number.

## The three symptoms Jason reports (current build)
1. **Occasional gender misidentification.**
2. **Overrates overweight bodies, and overrates underweight/very-thin bodies.** (Both extremes drift up.)
3. **Underrates an athletic physique when the photo is taken from far away.**

## How the pipeline works today (so you can reason about it)
Two scoring paths, auto-routed per photo:

- **Trained CNN (the headline on CLOTHED shots).** ResNet18 fine-tuned on the **Connor full-body stimulus set** (OSF `egj7c`, 726 *clothed* studio images, attractiveness 0–100). Val **Spearman 0.606** (studio data; weaker out-of-distribution). Exported to ONNX, run via onnxruntime-web. Input `[1,3,224,224]` RGB, ImageNet-normalized, square black-letterboxed person-box crop ×1.15 (`cropBodyTensor`, `body.html:794`). Raw output mapped to a score via `MODEL_CONFIG.outMin/outMax = -2/47` (`body.html:765`) — **explicitly provisional, anchored to "a few real-photo raws,"** because real photos compress into raw ~18–40 vs the studio val range 25–61.
- **Geometry silhouette (the headline on SHIRTLESS/bare shots, and the always-on transparent breakdown).** MediaPipe Pose (33 BlazePose joints) + a dedicated Selfie `ImageSegmenter` confidence mask (`js/body-pose-worker.js`). From the mask it scans shoulder/waist/hip widths → ratios: WHtR (adiposity proxy), WHR, V-taper, shoulder:hip breadth, plus skeletal legTorso & symmetry. Scored by the rubric in `body.html` (`MEASURES`, `scoreMeasure`, `gradeBody`).

**Clothing-aware routing (`drawAndScore`, `body.html:943`):** `torsoSkinFraction()` (YCbCr skin detection of the central torso column) computes a bare-skin fraction; `>= 0.45` (`SKIN_HEADLINE_THRESHOLD`) routes to **geometry**, else to the **CNN**. Rationale: the CNN is clothed-trained, so a shirtless/swimwear torso is OOD and it scores "skin ≈ attractive" regardless of physique; geometry is the right tool for a bare body.

**Sex classifier (`body.html:847`+):** InsightFace genderage on a face crop from BlazePose face keypoints 0–10 (`cropSexFaceTensor`, `body.html:866`), 96×96 raw RGB. Reports async, overrides the frame guess (`bcSetSex`). Marketed as "display only — re-bases the typical bands, not the headline" — **but see Rubric-3 below, that claim is false on the geometry-headline path.**

**Framing gate (`assessPose`, worker):** refuses bent/tilted/seated/profile/hips-cropped poses; returns `framing:'full'` (feet in frame → unlocks WHtR + legTorso) or `'torso'` (upper-body read, drops height-based cues). An **arm-corruption guard** in `extractSilhouette` zeroes the waist/hip width when an elbow/wrist sits inside a measurement band (an arm against the torso fakes a narrow waist).

## My root-cause hypotheses — split into MEASURING vs RUBRIC

### Measuring-system suspects
- **M1 — Frontal silhouette is blind to sagittal (depth) fat.** WHtR is `waist_px / height_px` from a *front-on* width. A gut projects *forward*; a front view sees it edge-on, so an overweight torso doesn't read "wide." This is the prime suspect for **overrated overweight** on the geometry path. A front photo structurally cannot see belly depth or glute projection (already listed in `CANT_READ`, `body.html:338`). Is there *any* honest within-photo proxy (e.g. neck/face adiposity, shoulder-line slope), or should the calc explicitly down-weight its adiposity confidence and say so?
- **M2 — No resolution/scale gate.** A far subject → coarse mask + imprecise joints → width ratios compress toward 1.0 → V-taper/breadth flatten → **athletic bodies underrated** (symptom 3). The CNN crop upscales a tiny person box to 224 → blurry → under-confident. There's no minimum person-box-pixels gate and no warning; the calc degrades silently. Proposal to evaluate: gate on person-box pixel size / landmark confidence and warn ("subject too far / low-res") rather than score.
- **M3 — Sex from a tiny BlazePose-keypoint face crop.** No real face detector/alignment; on far/small/turned faces the 96×96 input is upscaled mush → **misidentification** (symptom 1). Options: gate the sex read on a minimum face-box size + classifier confidence (fall back to "unknown / ask" instead of guessing), or use a proper face-detect+align. Note BlazePose gives only 11 coarse face points.
- **M4 — The 0.45 skin-fraction router is a brittle single threshold.** A pale/backlit shirtless torso or a flesh-toned/tight top can mis-route, flipping the *entire* headline between two models with different scales. Is a hard threshold the right design, or should routing be soft/confidence-weighted, or should the two scores be blended?
- **M5 — Silhouette width = soft-tissue outline, conflates muscle and fat.** A lean-muscular and a soft-but-slim torso can share an outline; a broad *fat* man gets V-taper/breadth credit a broad *muscular* man earns. Muscle-vs-fat is unreadable from a silhouette (acknowledged) — but the rubric still leans hard on breadth/taper.

### Rubric suspects
- **R1 — Monotonic leanness cues → no "too thin" downturn.** `whtr dir:'low'` and male `whr dir:'low'` (`MEASURES`, `body.html:286/289`) use a saturating logistic that rewards leaner indefinitely and never turns back down (`scoreMeasure`, `body.html:360`). An emaciated/underweight frame gets near-max leanness credit → **overrated underweight** (symptom 2). Should adiposity be an **inverted-U / banded** cue (a floor below which it stops helping or reverses), given that a silhouette can't distinguish "lean athletic" from "skinny-no-muscle"? The directional fix was the right call for *broad-shoulder/V-taper* (those are genuinely monotonic); the question is whether **leanness** was wrongly swept into the same monotonic treatment.
- **R2 — Reasoned, not population-fit, bands & curves.** All `band`s, the two lens curves (`PROFILES` contrast/gamma/scaleMax, `body.html:346`), and the composites (`computeComposites`) are reasoned proxies, not fit to data. The absolute scale ("what is a 5?") is provisional. Where would you anchor it? (Connor labels are 0–100; we only use rank info.)
- **R3 — "Sex is display-only" is false on the geometry-headline path.** Sex re-bases the bands consumed by `gradeBody`/`computeComposites`. On a **shirtless** shot (geometry owns the headline), a wrong sex therefore **changes the headline score**, not just panel labels. So symptom 1 (mis-sex) and symptom 2 (mis-scored bare body) interact. The copy claims otherwise (`body.html:530`). Either make it truly sex-agnostic on the headline, or stop claiming it is.
- **R4 — A weak CNN owns the headline while the transparent geometry is demoted to "breakdown."** Spearman 0.606 on *studio* data (lower OOD) is a thin signal to be the authoritative number on every clothed shot. Should the headline be a **blend** (CNN × geometry, weighted by the CNN's OOD confidence), or should geometry get more authority when the CNN is clearly extrapolating? This is the central architecture question.
- **R5 — Calibration `outMin/outMax = -2/47` is anchored to a handful of raws.** It maps average≈4, athletic≈8.5 by hand. Is there a principled real-photo calibration (Jason can supply ~10 labelled raws), or a monotone mapping that's robust to the studio→real distribution shift?

## What to actually deliver
A written second opinion that:
1. **Validates or refutes** each hypothesis above (M1–M5, R1–R5) against the code, and surfaces anything we missed.
2. For the **measuring system**: says clearly what a single frontal photo *can* and *cannot* honestly measure, and where the current code over-claims. Concrete, minimal-dependency fixes preferred (this is a static, on-device, CDN-only site — no backend, no heavy new model unless it runs in onnxruntime-web).
3. For the **rubric**: rules on the monotonic-vs-banded leanness question (R1), the CNN-vs-geometry headline authority question (R4), and the sex-affects-score honesty bug (R3) — these three are the highest-leverage.
4. Ranks fixes by impact-per-effort. Flag any "honest downgrade" (warn / refuse / widen uncertainty) that beats a code fix.

## Key code references
- Rubric: `MEASURES` `body.html:284`, `scoreMeasure` `body.html:360`, `gradeBody` `body.html:369`, `PROFILES` `body.html:346`, `computeComposites` `body.html:318`, tiers `body.html:420`.
- CNN: `MODEL_CONFIG` `body.html:765`, `cropBodyTensor` `body.html:794`, `inferAndSet` `body.html:832`, training recipe `models/train_body_beauty.py`.
- Routing & gates: `torsoSkinFraction` `body.html:813`, `drawAndScore` `body.html:896` (routing at 943, gates at 947/956).
- Sex: `cropSexFaceTensor` `body.html:866`, `sexFromLogits` `body.html:411`, `bcSetSex` `body.html:591`, `guessSex` `body.html:335`.
- Measurement: `assessPose` + `extractSilhouette` + arm guard in `js/body-pose-worker.js`; `bodyRatios` `body.html:253`, `poseSkeleton` `body.html:221`.

## Constraints
- **Static, on-device, CDN-only.** No backend; any new model must run in onnxruntime-web / MediaPipe-WASM.
- Work directly on `main`; **do not commit or push** — Jason tests on localhost:8753 first.
- Three-script pattern in `body.html`: DOM-free testable core (`module.exports`) + UI wiring + MediaPipe ESM module. Keep the core unit-testable.

## How to reproduce
Serve via `.claude/dev-server.py` (:8753, no-cache), open `body.html`, use the URL/file input. CORS-clean test images on `storage.googleapis.com/mediapipe-assets/`: `pose.jpg` (bent leg → framing gate refuses), `segmentation_input_rotation0.jpg` (clothed woman → routes to CNN, raw ~17.5). Jason has the real test photos (overweight shirtless man, skinny model, jacked man, far athletic shot) that triggered the three symptoms.
