# Looks Calculator — review brief for Codex (v2)

**Builder:** Claude · **Status:** working prototype on `localhost:8753`. Last committed checkpoint **`a03056a`** (includes both `.onnx` binaries); the subsequent fix passes (Codex P1–P3 review, the tiny-face-gate relaxation, and the full-resolution model crops) are **uncommitted on the working tree**. · **File:** `looks.html` (+ `partials/navigation-bar.html` nav slot, `models/README.md` recipes)

This supersedes the v1 brief (which described the pre-CNN heuristic — now obsolete). Read this one.

## What it is now
A client-side **Looks Calc** face page. The image never leaves the browser. Two lenses (Black Pill/PSL, Conventional) share one engine. It produces:
- a **headline score** — from a trained **beauty CNN** (a black box), with a **geometry heuristic** as graceful fallback when the model file is absent;
- a **transparent breakdown** beneath it — an **evidence-ranked "measurement panel"** (descriptive, *not* a rival score);
- a **sex read** — from an on-device **sex classifier**, defaulting the sex-conditional bands, user-flippable.

Body calc + face×body composite are still future phases, not built.

## The arc since v1 (context for the review)
1. **v1 was a pure geometry+pixel heuristic.** You (Codex) and Claude both concluded it can't reach real-use precision (Cavill underrated, etc.) — the missing signal is gestalt/dimorphism, not a constant. Agreed fix: **trained CNN for the score, heuristic as the explainable breakdown.**
2. **Beauty CNN added** (`models/face-beauty.onnx`, ResNet18 SCUT-FBP5500, onnxruntime-web). Notable debugging: the source checkpoint was HCIILAB's *custom* `Nets.py` ResNet (`group1`/`group2`/`fullyconnected`), not torchvision — `strict=False` silently loaded **zero** weights → a random net → every face scored in a dead band. Fixed by loading into the exact arch (recipe + warning in `models/README.md`).
3. **Breakdown remodelled to an "honest measurement panel"** — the old bars were a weaker rival scorer mis-captioned as the CNN's "explanation," and they contradicted it. Now each row is **measured-vs-typical** (a marker against a typical band; outside the band is *noted*, not penalized). Facial thirds removed as structurally unmeasurable → moved to a "a front photo can't read" list.
4. **Rubric re-anchored to the evidence** (Rhodes 2006; Sci Reports 2025; Geniole 2015; Coetzee 2009) — added averageness + dimorphism (Tier-1 composites), nose width, eye size; demoted fWHR + canthal to a "Lens — weak evidence" group; tier-tagged every row; **sex-conditional bands**.
5. **Sex classifier added** (`models/face-sex.onnx`, InsightFace genderage) after the geometry sex-guess proved unreliable (front-view ratios don't separate sex). Model overrides guess; manual toggle overrides model; falls back to the guess if absent.

## Architecture (three `<script>` blocks in `looks.html`)
1. **Pure core** (DOM-free, `module.exports`, node-testable):
   - `IDX` landmark indices; `computeMetrics(lm,W,H)` → 11 geo metrics incl. **new** `noseWidth` (alar 129/358 ÷ intercanthal) and `eyeOpen` (lids 159/145/386/374 ÷ eyeW). Roll-normalized.
   - `MEASURES` — the display rubric: `tier`/`group`/sex-conditional `band:{f,m}`/`disp`/`below`/`above`. `bandFor(m,sex)`.
   - `mascIndex(geo)` (signed M/F index), `computeComposites(geo,sex)` (averageness + dimorphism), `guessSex(geo)`.
   - Beauty path: `gradeFace` (fallback score), `scoreMetric`, `PROFILES`, `mapModelScore(t,profKey)`, `preprocessToTensor` (224 ImageNet NCHW).
   - Sex path: `preprocessSex` (96 RGB **raw 0–255** NCHW), `sexFromLogits(out)` (`[female,male,age]` → argmax + softmax conf).
   - `pslTier(s,sex)` (sex-aware: Chad↔Stacy, incel↔femcel), `convTier`, `tierFor`.
2. **UI wiring**: `LC` state, `renderResult()` (score + sex toggle + tiered panel), `measureRow`/`pxRow`, `window.lcAnalyze`/`lcSetModelScore`/`lcSetSex`. Manual sex pick sets `LC.sexManual` (blocks the model from overriding).
3. **MediaPipe module** (ESM, jsDelivr): `FaceLandmarker`; `MODEL_CONFIG` + `initModel`/`cropFaceTensor`/`inferAndSet` (beauty); `SEX_MODEL_CONFIG` + `initSexModel`/`cropSexTensor`/`inferSex` (sex); `samplePixels`; `drawAndScore`. Detection + the overlay run on a **520px working canvas** (downscaled for speed); both model crops, however, are taken from the **original-resolution source element** (`srcEl` + native `srcW/srcH`) before the overlay — landmarks are normalized `[0,1]` so they map onto the native frame, preserving detail for the CNN. Crops are stashed (`pendingTensor`/`pendingSexTensor`) and auto-run when the (large) models finish loading. A stale-async generation guard (`currentGen`) discards both successful and *rejected* results from superseded faces.

## Please focus your review on
1. **New landmark indices** — `noseWidth` uses alar **129/358 ÷ intercanthal (133/362)**; `eyeOpen` uses lids **159/145 / 386/374 ÷ eyeW**. Are these the right canonical MediaPipe points? (Wrong index = silent garbage, as facial-thirds taught us.) On real faces noseWidth reads ~1.0–1.4, eyeOpen ~0.3 — plausible, but confirm.
2. **The known foreTop bug, now contained** — `leanness` (lower-face ratio) divides by face *height* using landmark **10 = mid-forehead, not the hairline**, so it inflates and reads "Wide" on normal faces. It's **excluded from `mascIndex`/composites** but its own display band is **not yet recalibrated**. Is excluding it the right call, or is there a better height reference (e.g. brow-to-chin)? Same blind spot killed facial thirds.
3. **The composites** (`computeComposites`, relabeled "proportional typicality" + "dimorphic cues") — typicality = `100 − mean(band-deviation)*38`; dimorphism = `50 + (sex-oriented mascIndex)*16`, where `mascIndex` is **jaw + nose dominant** with eye-openness/lips kept only as light terms (they're expression-noisy). The fallback `guessSex` uses a **separate jaw+nose rule** vs the female/male band midpoints (not `mascIndex`). Defensible proxies? Multipliers (38, 16) sane?
4. **Provisional bands** — every `MEASURES` band (incl. the `{f,m}` splits) and the composite thresholds are **reasoned, never fitted to data**. Which look wrong? `eyeSpacing` tends to read "Wide-set," `leanness` reads high (known). Flag mis-set ideals.
5. **Beauty model calibration** — `MODEL_CONFIG.outMin/outMax` = **1.5/4.5** (conservative interim; SCUT raw rarely hits 1 or 5 — replace with holdout quantiles once a calibration set exists). `mapModelScore` then runs the normalized value through each lens's sigmoid/gamma curve, and `inferAndSet` now throws on a non-finite raw output (no NaN scores). Is the curve interpretation sound? Is the crop in `cropFaceTensor` (square, aspect-preserving, 1.4× face, top-biased, from full-res `srcEl`) a reasonable match to SCUT framing?
6. **Sex-model integration** — `cropSexTensor` (face box ×1.5, centred, 96²) vs genderage's expected framing; `preprocessSex` (raw 0–255 RGB); `sexFromLogits` output-order assumption (`[female,male,…]`). Override priority (`lcSetSex` respects `LC.sexManual`). Any races between the async model loads and a face dropped first?
7. **Bugs / failure modes** — odd images, no-face, tiny-face gate (now a **single fraction-of-frame floor `fwFrac < 0.10`** — no absolute-px floor; genuinely-soft small faces are scored with a non-blocking "⚠ Low-res read" caveat rather than rejected, gated on native face px `<110` or `fwFrac<0.14`), CORS URL load, camera, double-submit (`lcBusy`), objectURL revoke.
8. **Honesty/framing** — does the copy honestly bound the limits (Bone Pill cross-link, the "What this panel cannot measure" list, pixel reads relabeled as lighting proxies, the sex toggle noting it only re-bases the bands and the CNN carries its training set's biases, the input panel's "proportional-typicality and dimorphic-cue proxies" wording)? Flag anything that over-claims.

## Out of scope / deliberate — please don't re-flag
- **Single PSL decimal + tiers** are intentional (genre conceit); honesty lives in the surrounding copy, not in softening the number.
- **The score is a black box by design**; the geometry is the transparent breakdown, *not* an explanation of the CNN — divergence between them is expected and is the point (Bone Pill).
- **Pixel reads (skin/under-eye) are lighting-confounded** — disclosed and demoted to "photo quality, not dermatology," not used in the headline.
- **Bands are provisional, never dataset-fitted** — intentional and labeled; suggest better values, but "they're not calibrated" is already known.
- **Sex auto-detect misses some edge cases** — accepted; the one-click manual toggle is the backstop.
- **Profile/hairline/eye-whites can't be read from a front photo** — disclosed in the "can't read" list, not faked.

## How to test
- **Pure core is node-testable**: extract the first non-module `<script>` (it has `module.exports`) and require it. Claude's harness regexes the `<script>` blocks, writes the core to a temp file, requires it, and also pulls `measureRow`/`pxRow` out of the UI block (they're DOM-free string builders). Synthetic `geo` objects exercise the rubric; synthetic landmark arrays exercise `computeMetrics`.
- **NOT testable in-sandbox**: MediaPipe detection, onnxruntime inference, real-photo behavior — needs the `.onnx` files + a browser.
- **Model files ARE committed** as of `a03056a` (`face-beauty.onnx` ~43 MB, `face-sex.onnx` ~1.3 MB; recipes in `models/README.md`). The page still **falls back gracefully** if either is absent (geometry heuristic for the score, geometry guess for sex).
