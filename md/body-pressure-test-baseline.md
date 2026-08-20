# Body Calculator frozen baseline and route inventory

Frozen before any Body scoring change: commit `11bb0b98391bbd9a1d3eab67553c1034d68f30e4` from `codex/face-calculator-reliability`, evaluated on 2026-08-18.

## Bottom line

The first body-specific test independent of the shipped model found no useful ordering signal on its narrow supported slice: 53/61 Moussally synthetic female-body stimuli were scored by the CNN, with continuous-score Spearman **rho=-0.063** (95% bootstrap CI **[-0.342, 0.237]**), Pearson **r=-0.099**, and top-vs-bottom-quartile AUC **0.454**. The public half-point headline had rho **-0.128**. Seven of eight refusals came from the lowest label quartile, so accepted-row metrics alone are optimistic about coverage.

Connor results are training-contaminated diagnostics, not independent accuracy evidence. The production CNN raw output reached rho **0.590** on the 658 Connor images routed to it, while the full mixed production result reached rho **0.466** on 722 finite rows. Those values cannot establish generalization because Connor supplied the model's training and model-selection data.

A monotone calibration or percentile remap cannot improve Spearman correlation, AUC, or pairwise ordering on identical rows. It may improve display calibration only.

## Frozen asset binding

| Asset | SHA-256 |
| --- | --- |
| `body.html` | `af651aefcd3e5608681aa211c4dcd4bbbe014c2118124a46e8f1bceb7a10f092` |
| `css/body.css` | `6f73432566803d6309078a10e2abfc3404c244e16f8fc333fbe074699a595326` |
| `js/body-pose-worker.js` | `c987806844eca1ff4bc6df26c6a42882d3cd7013e13fa73817993bbe792c9e4c` |
| `js/body-arm-band.js` | `4ff2541455942d99a561a4afe89701be5be3342fa8852d2406cf4b6f6af05b6d` |
| `models/body-beauty.onnx` | `6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2` |
| `models/train_body_beauty.py` | `e48f450452d8761e8464413267932a845d98695ffc9019588291281c01866698` |

The ONNX file is 44,698,594 bytes, accepts float32 `[1,3,224,224]`, emits `[1,1]`, uses opset 12, and contains no model-card or data metadata.

## Production route inventory

The page contains two different instruments and six operational paths. They must not be treated as one learned model.

| Path | Entry condition | Instrument | Important gates/fallbacks |
| --- | --- | --- | --- |
| Full, clothed, supported | usable full pose; skin below routing threshold; CNN available or loading | trained CNN | person scale, pose/framing band, arm-band read, crop and model availability |
| Full, bare / high-skin torso | usable full pose; skin above routing threshold | geometry/silhouette | surviving outline cues; rate-anyway when cues are degraded |
| Torso crop, clothed | usable shoulders/hips but lower body unavailable | geometry/silhouette | leg/symmetry cues removed; no CNN because training/calibration require full body |
| Torso crop, bare | same crop plus bare routing | geometry/silhouette | torso-only surviving cues; outline override possible |
| Model unavailable or person-crop failure | otherwise CNN-eligible | geometry/silhouette | must record attempted and final routes separately; no-cue geometry must refuse |
| Model inference failure after scheduling | otherwise CNN-eligible | geometry/silhouette | bounded timeout/failure path; stale inference must not win later |

Before any instrument is selected, the worker can refuse no/partial/side-on/bent or otherwise unusable poses. A degraded framing band or insufficient geometry cues opens a user-controlled “rate anyway” path. Batch mode deliberately accepts that override and must preserve its provenance.

Multi-photo analysis converts each model raw or geometry read to a percentile and averages the percentiles. That is a product aggregation convention, not evidence that the CNN and geometry instruments have equal reliability or interchangeable errors. Optional height, weight, and body-fat inputs form a separate bounded hybrid calculation and must never resurrect stale photo or sex state.

## State and async inventory

The audited states include upload, URL, paste, camera, pending decode, pending pose, pending model load, pending inference, guide not-ready/ready, manual/automatic shutter, gated override, accepted result, add-photo aggregation, source replacement, reset, restore, tab switch, track-ended/inactive, pagehide, model error, worker timeout/retry, and storage-quota failure.

Persistent inputs on the frozen page used `loveEquations.bodyInputs.v1`, `loveEquations.bodyShot.v1`, and `loveEquations.bodyScore.v3`, plus `loveEquations.bodyAutoSnap.v1` and the shared content-width preference. The frozen restore path trusted fields and image data too broadly; the model cache used an unversioned `le-models-v1` key; camera acquisition and alignment probes were not generation-owned.

## Demonstrated baseline engineering defects

- Late `getUserMedia()` or `play()` completion could resurrect a retired camera. Stop did not detach `srcObject` or bind `ended`/`inactive`; reset and paste could leave a live stream.
- Disabling auto-snap also disabled live alignment guidance. The drawn square SVG target and classifier used different coordinate/scale rules, and the guide hint was hidden from assistive technology.
- Worker failure could lose its quality verdict and default an unsupported crop to full/pass. Model, pose, and source async work could outlive a replacement.
- Restored reliability, issue, source, metric, and image fields were untrusted and reached HTML rendering or calculations. Body and composite persistence could disagree after quota failure.
- A torso/no-outline geometry route could accept “rate anyway” yet produce no number; zero surviving metrics could display 100 typicality.
- Model cache entries and restored raw model outputs were not bound to the ONNX hash, preprocessing version, or percentile-table version.
- Per-shot override and final-route provenance were incomplete. Mixed CNN/geometry badges and uncertainty could describe only the latest shot.
- The headline rounded to half-points while the composite used the hidden float and called it the exact displayed number.
- At 980 to 981 CSS pixels, wide mode changed the content width abruptly while the two-column Body grid remained active; long result copy also lacked a useful 4K line-length cap.

These are capture, routing, persistence, consistency, security, and display-contract defects. Fixing them does not by itself improve attractiveness ranking.

## Evidence and provenance audit

No committed Body-specific test suite, browser runner, evaluation CSV/JSON, camera matrix, screenshot set, or calibration manifest existed at the frozen commit. The page's 254- and 385-image Wikimedia calibration populations were represented only by prose and embedded percentile knots. The tracked fetcher used keyword search and wrote its manifest under a wholly ignored directory; it could not reconstruct those claimed cohorts. The larger roster references likewise had no body labels, licenses, hashes, split, or committed results. These remain legacy, non-reproducible calibration claims rather than verified populations.

The Connor archive contains 726 images and 724 usable ratings after two missing labels. Its public OSF node does not declare a redistribution license; source photos therefore remain in an external cache. No copyrighted evaluation photo is committed.

The independent Moussally evaluation commits only IDs, labels, hashes, DOI/source metadata, and aggregate/batch outputs. The images remain externally cached because the authors retain copyright and the distribution record does not grant this repository redistribution rights. Its label is the mean of attractiveness, beauty, and harmony ratings, so it is body-specific but not attractiveness-only; all stimuli are synthetic female bodies from one continuum.

## Frozen test condition

The incoming commit's `npm run test:all` stopped in `scripts/validate-canon-index.mjs` because `data/le-canon-index.json` was stale after the Face Calculator work. This known starting failure is not attributed to Body changes. The final Body delivery regenerates the index after all edits.

Machine-readable sources: `data/body-evaluation-lock-v1.json`, `data/body-independent-manifest.csv`, `data/body-independent-manifest.meta.json`, `data/body-independent-before.csv`, `data/body-independent-before.meta.json`, `data/body-independent-evaluation-before.json`, `data/body-connor-before.csv`, `data/body-connor-before.meta.json`, and `data/body-preprocessing-before.json`.
