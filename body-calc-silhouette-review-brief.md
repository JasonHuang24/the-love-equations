# Body Calc — silhouette reliability & evaluation-generalization brief (for Codex)

**Date:** 2026-06-19 · **Author:** Claude · **Files:** `body.html`, `js/body-pose-worker.js`

## The problem Jason is hitting
The Body Calc accepts photos but **evaluates them badly and non-generally**. Concretely, on real photos:
- A clearly jacked man (torso cropped at the thighs) scored **1.0**.
- A fit woman (full body) scored **4.6**.
- A woman seated on an exercise ball scored **1.0**.

Jason's diagnosis is correct: *"The partial body shots and unique poses throw off the rating."* The directional-scoring fix I landed earlier (below) corrected the standing-case inversion but **did not generalize** — because on most real photos the calc runs **skeletal-only**, where the only cues are `legTorso` (breaks on any crop / non-standing pose) and `symmetry` (≈always "asymmetric" = pose noise). Both are Tier-3 noise. The Tier-1 signal (leanness, waist-to-hip, V-taper) **all require the segmentation silhouette, which fails on most real photos.**

## What I already shipped this session (verified, keep)
All in `body.html`, pure-core + UI + module; localhost only, uncommitted.
1. **Directional scoring** — `scoreMeasure` was a symmetric gaussian on "closeness to the typical band", which punished elite extremes (broad shoulders 1.76 → 6/100). Added per-measure `dir` ('low'/'high'/'band', sex-conditional for `whr`+`shoulderHip`) + a saturating logistic for directional cues. Symmetry made lenient (`tol:4`) + low weight.
2. **Face sex-ID** — ported the Looks Calc's InsightFace genderage (`models/face-sex.onnx`), cropping the face from BlazePose keypoints 0–10; `bcSetSex` overrides the frame guess. Verified: a woman the frame calls male reads female 99.7%.
3. **Bony-breadth units bug** — removed the skeletal `shoulderHip` → silhouette-band fallback (bony ~1.6 for everyone; over-credited men, zeroed women).
4. **Stale caption bug** — the status note under the photo was set once with the frame guess and never updated; now rebuilt via `bcStatusNote()` from current state (face/manual), called from `bcAnalyze`/`bcSetSex`/manual-flip.

## The decisive root-cause findings (this is the new, important part)
I investigated the silhouette failure empirically in the Preview browser. **The segmentation engine, not the scoring, is the ceiling.**

### 1. CPU delegate hard-aborts segmentation
The worker (`js/body-pose-worker.js`) uses `baseOptions.delegate:'CPU'`. With `outputSegmentationMasks:true`, `detect()` throws Emscripten **`Aborted()`** on many real bodies. Console shows, immediately before each abort:
```
F image_frame.cc:415] Check failed: 1 == ChannelSize() (1 vs. 4)
Aborted()
```
→ a **channel-count mismatch (expects 1, gets 4 = RGBA)** in the segmentation mask path. The worker catches it → skeletal-only fallback (current behavior). **A/B proven:** same image, `outputSegmentationMasks:false` → 33 landmarks ✅; `:true` → `Aborted()` ❌. This `ChannelSize` check is the most concrete lead on *why* CPU seg dies — worth chasing (input image format? a tasks-vision `@0.10.14` bug? does a newer/older version fix it?).

### 2. GPU delegate does NOT abort — but the mask is finicky
- Same image that aborts on CPU → **GPU returns 33 landmarks + a non-empty mask** (fracOn 0.176). Clean, repeatable in a *fresh* isolated landmarker.
- **But integrating GPU into `body.html` did not yield usable silhouettes:**
  - In-app, `extractSilhouette` got **0 width at every landmark row** even when the mask was non-empty → mask content misaligned with the landmarks.
  - The mask is **square (256/257)** regardless of image aspect; landmarks are normalized to the image aspect. The row-mapping (`y*mh`) likely needs letterbox/stretch handling. On a *square* test image it still read 0 widths, so it may also be a **threshold/semantics** issue (is person = `>0.5`? is it inverted? multi-channel?).
  - **WebGL context exhaustion:** creating several GPU landmarkers across one page session degraded later masks to empty — masks that worked on the first landmarker returned fracOn 0 afterward. Lifecycle/`.close()` discipline matters.
- **I attempted a main-thread GPU rewrite and REVERTED it** — it regressed (the worker silhouettes `pose.jpg`; the GPU integration silhouetted nothing in-app). Don't re-apply without solving the alignment + context issues.

### 3. GPU-in-Worker returns an EMPTY mask
Verified with a blob worker: a GPU landmarker inits and returns 33 landmarks, but `segmentationMasks[0]` reads **all zeros** (OffscreenCanvas WebGL readback is blank in worker scope). **So you cannot have both worker isolation and the GPU silhouette.** Pick one.

### Summary table
| | CPU delegate | GPU delegate |
|---|---|---|
| **Main thread** | ❌ `Aborted()` (ChannelSize 1 vs 4) | ⚠️ no abort, but mask empty/misaligned in-app + context-exhaustion |
| **Web Worker** | ❌ `Aborted()` (current shipped path → skeletal) | ⚠️ landmarks OK, **mask all-zero** (worker GL readback) |

## Open questions for you (Codex)
1. **Can the segmentation silhouette be made reliable?**
   - Chase the `ChannelSize() (1 vs 4)` abort on CPU — is it an input-format issue we control (pass a 1-channel? a specific ImageData/bitmap form?), or a tasks-vision version bug (try a different `@version`, or `pose_landmarker_lite/heavy`)?
   - For GPU: solve the square-mask↔image-aspect mapping in `extractSilhouette`, confirm the mask semantics/threshold, and a single-landmarker lifecycle that avoids context exhaustion. Main-thread GPU detect is synchronous (can block ~0.5s) and a GPU hang would freeze the page (the worker watchdog can't help GPU) — acceptable?
2. **Or do we pivot the magnitude signal off geometry entirely?** No turnkey body-beauty CNN exists (`models/README.md`). The face-beauty CNN (`models/face-beauty.onnx`, already on disk, works) is the one reliable, clothing/pose-independent signal — Jason deferred the face×body composite, but if the silhouette can't be made reliable, that (or training a body CNN) may be the real path, with geometry demoted to an honest breakdown. Consistent with the project's "instruments are replaceable" north star.
3. **Robust input gating (needed regardless):** partial-body shots (cropped legs → MediaPipe *extrapolates* ankles → garbage `legTorso`) and non-standing/seated poses must be **detected and either rejected or restricted to the cues the framing actually supports** — and when too few reliable cues remain, say so honestly instead of emitting a confident wrong number. Today the `skel.vis < 0.5` gate passes extrapolated ankles.

## How to reproduce
Serve on localhost (`.claude/dev-server.py` :8753), open `body.html`. CORS-clean repro images on `storage.googleapis.com/mediapipe-assets/`: `pose.jpg` (worker silhouettes it), `segmentation_input_rotation0.jpg` (CPU aborts; GPU mask misaligns). Use the URL input. Worker delegate is at `js/body-pose-worker.js` `makeLandmarker()`.
