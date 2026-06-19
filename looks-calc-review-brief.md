# Looks Calculator — review brief for Codex (v2)

**Builder:** Claude · **Status:** working prototype, on `localhost:8753`, **uncommitted** · **File:** `looks.html` (+ `partials/navigation-bar.html` nav slot, `models/README.md` recipes)

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
3. **MediaPipe module** (ESM, jsDelivr): `FaceLandmarker`; `MODEL_CONFIG` + `initModel`/`cropFaceTensor`/`inferAndSet` (beauty); `SEX_MODEL_CONFIG` + `initSexModel`/`cropSexTensor`/`inferSex` (sex); `samplePixels`; `drawAndScore`. Both model crops are taken from the **clean canvas before the overlay**, stashed (`pendingTensor`/`pendingSexTensor`), and auto-run when the (large) models finish loading.

## Please focus your review on
1. **New landmark indices** — `noseWidth` uses alar **129/358 ÷ intercanthal (133/362)**; `eyeOpen` uses lids **159/145 / 386/374 ÷ eyeW**. Are these the right canonical MediaPipe points? (Wrong index = silent garbage, as facial-thirds taught us.) On real faces noseWidth reads ~1.0–1.4, eyeOpen ~0.3 — plausible, but confirm.
2. **The known foreTop bug, now contained** — `leanness` (lower-face ratio) divides by face *height* using landmark **10 = mid-forehead, not the hairline**, so it inflates and reads "Wide" on normal faces. It's **excluded from `mascIndex`/composites** but its own display band is **not yet recalibrated**. Is excluding it the right call, or is there a better height reference (e.g. brow-to-chin)? Same blind spot killed facial thirds.
3. **The composites** (`computeComposites`) — averageness = `100 − mean(band-deviation)*38`; dimorphism = `50 + (sex-oriented mascIndex)*16`. `mascIndex` = jaw + eye-size primary, lips/nose light secondary (eye-openness & lips were dropped from the *guess* as expression-noise). Is this a defensible dimorphism proxy? Are the multipliers (38, 16) and clamps sane, or do they over/under-spread?
4. **Provisional bands** — every `MEASURES` band (incl. the `{f,m}` splits) and the composite thresholds are **reasoned, never fitted to data**. Which look wrong? `eyeSpacing` tends to read "Wide-set," `leanness` reads high (known). Flag mis-set ideals.
5. **Beauty model calibration** — `MODEL_CONFIG.outMin/outMax` = **2.0/4.2**, calibrated off ~3 faces (SCUT raw rarely hits 1 or 5). `mapModelScore` then runs the normalized value through each lens's sigmoid/gamma curve. Is the curve interpretation sound? Is the crop in `cropFaceTensor` (margins 0.18, top-biased) a reasonable match to SCUT framing?
6. **Sex-model integration** — `cropSexTensor` (face box ×1.5, centred, 96²) vs genderage's expected framing; `preprocessSex` (raw 0–255 RGB); `sexFromLogits` output-order assumption (`[female,male,…]`). Override priority (`lcSetSex` respects `LC.sexManual`). Any races between the async model loads and a face dropped first?
7. **Bugs / failure modes** — odd images, no-face, tiny-face guard (`faceW<55 || fwFrac<0.10`), CORS URL load, camera, double-submit (`lcBusy`), objectURL revoke.
8. **Honesty/framing** — does the copy honestly bound the limits (Bone Pill cross-link, "can't read" list, pixel reads relabeled as lighting proxies, "score is sex-agnostic")? Flag anything that over-claims.

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
- **Model files are NOT committed** (`face-beauty.onnx` ~43 MB, `face-sex.onnx` ~1.3 MB — Jason supplies them; recipes in `models/README.md`). The page **falls back gracefully** without either (geometry heuristic for the score, geometry guess for sex).
