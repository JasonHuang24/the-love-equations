# Body model provenance, candidate decision, and GPU handoff

Audit date: 2026-08-18.

## Decision

Keep `models/body-beauty.onnx` unchanged.

The shipped CNN's exact bytes were preserved because the only locked preprocessing candidate, although promising on one narrow independent set, does not meet the registered scope and stability gates for a site-wide replacement. No percentile table, score weight, routing threshold, crop rule, or model checkpoint was changed.

Reliability improvements were achievable in code: camera/source ownership, worker-quality preservation, route and per-shot provenance, strict restore and composite schemas, model hash/cache binding, bounded load/failure behavior, storage-invariant batch execution, public precision consistency, accessibility, and responsive layout. Those changes do not constitute better attractiveness intelligence.

The evidence does **not** show a material improvement in independent subjective-attractiveness discrimination in the shipped production path. Its model and crop remain numerically the same on common finite rows. A monotone calibration curve could alter displayed spacing but could not repair rank correlation, AUC, or pairwise ordering.

## Shipped artifact

| Property | Value |
| --- | --- |
| Path | `models/body-beauty.onnx` |
| Bytes | 44,698,594 |
| SHA-256 | `6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2` |
| Input | float32 `[1,3,224,224]` |
| Output | `[1,1]` |
| Opset | 12 |
| Graph family | ResNet-18-shaped regression graph |
| Embedded model/data metadata | none |

The checkpoint has no committed training log, split manifest, source-row manifest, epoch-selection record, initialization record, PyTorch checkpoint, or PyTorch-to-ONNX/browser parity report. Historical comments are therefore context, not reproducible provenance.

The Connor Full-Body Photo Database archive used by the historical training script is pinned in this audit as 375,037,688 bytes with SHA-256 `71577e780ca5a9ba7a54653b55cca14bbbefe1be1783362ee9a9c0f581a950e8`. It contains 726 stimuli; two ratings are non-finite, leaving 724 usable rows. Originals and head-swap composites can share the same body and must remain in one identity component. The inspected OSF record declares no license, so public download availability is not treated as permission to redistribute the source photos or derived training corpus.

## Demonstrated preprocessing mismatch

Historical training uses the complete EXIF-transposed RGB image, centered in a black square, resized to 224 pixels, and ImageNet-normalized. Production uses a confident pose-landmark bounding square expanded by 1.15, then Canvas2D resize and the same normalization. The production rectangle can extend outside the source and Canvas supplies transparent/black pixels there.

The browser behavior is proven, not assumed, by `data/body-canvas-padding-audit.json` (SHA-256 `dec8240e8cc09a5c89d82d5a1f528a289028d1524cf81b3e7438e70eadad394c`; tool SHA-256 `6f2c1d27e66a32e1a94dd1c1c8d8ac28038cdb658cf79c23cf2462d317cf78c3`). In headless Chromium, a solid 4×4 source drawn through a 75%-out-of-bounds source rectangle produced exactly 48 transparent-black and 16 source-color pixels in the 8×8 destination, matching the geometric 0.75 padding fraction. This fixture establishes Canvas semantics only; final instrumented production batches separately report crop-outside incidence, padding distribution, and outcome/score sensitivity.

The final production evidence quantifies the issue rather than assuming its frequency. In the independent batch, all 53 instrumented/scored pose crops extended outside the source; padding fraction ranged 0.46008–0.57676 (median 0.55993, mean 0.55372), while eight pre-crop refusals had no diagnostic. Padding fraction versus continuous score had Spearman −0.35585, but an inside-crop comparison was impossible because there were zero inside crops.

In the 216-case synthetic transform battery, 191 rows were instrumented and every one extended outside; padding ranged 0.34265–0.65865 (median 0.54401, mean 0.52650). On 161 finite non-control pairs, score-change MAE was 0.34078; padding changed on 82 pairs and padding change versus score change had Spearman 0.20123. These associations are bound in `data/body-transform-stability.json` to final `body.html` SHA-256 `d75ec65acc0d766bef409676f82e10864d1fb6293ee2d4707ff2ab555ae8577d`. They show material sensitivity but cannot isolate padding causally because every instrumented crop was out-of-bounds and each synthetic transform also changed pixels or framing.


On 658 training-contaminated Connor rows that reached the CNN route:

| Diagnostic | Production pose crop | Training full letterbox |
| --- | ---: | ---: |
| Spearman rho against Connor label | 0.590 | 0.914 |
| top/bottom-quartile AUC | 0.886 | 0.998 |

The two raw predictions had Spearman 0.659 and mean absolute difference 9.72 model-output units; full letterbox averaged 6.80 units higher. A portrait 2:3 image gives the training transform one-third horizontal black area, while an in-bounds pose crop generally has none. This is a real framing mismatch, but Connor trained/selected the shipped model, so this diagnostic is optimistically contaminated.

## One-time locked preprocessing candidate

Before accessing the independent candidate result, `data/body-preprocessing-candidate-lock-v1.json` fixed one candidate only: keep the weights and replace production's pose crop with the historical complete-image letterbox. It was then evaluated once on the exact 53 Moussally rows accepted by the frozen CNN route.

| Metric | Production pose crop raw | Full-letterbox raw | Paired delta |
| --- | ---: | ---: | ---: |
| Spearman rho | -0.070 | 0.517 | +0.587, 95% CI [0.363, 0.834] |
| Pearson r | -0.056 | 0.548 | +0.603 |
| top/bottom-quartile AUC | 0.449 | 0.872 | +0.423 |
| pairwise accuracy, all unequal labels | 0.463 | 0.701 | +0.238 |
| pairwise accuracy, gap at least 0.5 | 0.453 | 0.726 | +0.273 |
| pairwise accuracy, gap at least 1 | 0.463 | 0.746 | +0.283 |
| pairwise accuracy, gap at least 2 | 0.491 | 0.777 | +0.286 |

This is a genuine ordering change, not a remap. It passed the narrow registered metric screen. It still does not authorize production deployment:

- the holdout contains only 53 accepted synthetic female-body stimuli from one generated shape continuum;
- it does not test natural male/female photographs, clothing, bare-torso routing, the geometry instrument, real cameras, demographic groups, or repeated photos of one person;
- eight of 61 stimuli were refused, seven from the lowest label quartile;
- the current reference map compresses the candidate's public half-point output: headline Spearman is only 0.193 because many rows tie at 7.5;
- the broader-scope and registered transformation-stability gates remain mandatory even after a narrow metric win.

The candidate output and paired bootstrap are bound in `data/body-independent-preprocessing-candidate.json` and `data/body-independent-preprocessing-candidate.csv`. The candidate is rejected for this delivery; the test set must not be revisited to tune a second crop.

## What remains: calibration, dataset shift, or learned model?

All four matter, but they are not interchangeable:

- **Calibration/display mapping:** the 254- and 385-image reference cohorts are not reproducible from committed evidence. A new license-clear calibration population is needed for defensible display percentiles and public precision. That alone cannot improve ordering.
- **Preprocessing mismatch:** full letterboxing can change ordering substantially and won the narrow locked screen, but its generalization and stability are not broad enough to ship.
- **Dataset shift:** Connor is small, studio-like, includes head swaps, and is contaminated for evaluation of this checkpoint. The independent set is also narrow and synthetic. Neither supports universal body-attractiveness claims.
- **Learned CNN:** the unchanged production CNN was at chance on the only independent body-specific set available here. A meaningful general gain therefore requires new learning evidence, not only JavaScript hardening or a display curve.

CNN retraining or carefully controlled fine-tuning is required for a defensible broad improvement. It cannot responsibly be completed in this environment: there is no CUDA-capable training stack, and the available Connor corpus lacks a declared redistribution license and cannot serve as an independent final test for this model family.

## Reproducible training machinery

`models/train_body_beauty.py` now stages candidates only and refuses to write `models/body-beauty.onnx`. It:

- verifies the exact archive and label hashes before use;
- builds deterministic body-identity connected components so original/head-swap rows cannot cross splits;
- freezes train/development/test manifests before fitting;
- selects epochs and seeds on development only, then accesses the locked test once;
- records source selection, exclusions, hashes, seeds, ResNet-18 ImageNet initialization, augmentation, optimizer settings, epochs, every required PyTorch/ONNX/scientific package version, an exact environment-lock hash, checkpoint choice, and test access;
- supports multiple seeds;
- asserts PyTorch-versus-ONNX parity before staging an export;
- blocks export unless the preregistered development/test thresholds pass;
- treats regeneration of a changed manifest as an explicit reviewed action;
- records that browser/Pillow preprocessing parity still needs golden-pixel fixtures.

The schema and non-result example are `data/body-training-provenance.json`. They are not a claim that training ran.

Corpus-free checks completed here:

```text
python models/train_body_beauty.py --dry-run
node tests/body-training.test.mjs
```

`python models/train_body_beauty.py --smoke` correctly failed closed because this machine lacks `torch`, `torchvision`, `onnx`, `onnxscript`, and `onnxruntime`. No corpus was fetched and no model was written.

## Exact GPU-session handoff

The prepared corpus path on this machine is `C:\Users\sourd\AppData\Local\Temp\codex-body-evaluation-cache\connor\full_body_photo_database`. It is a machine-specific private cache, is not committed, and does not resolve the source record's missing license declaration. Legal authorization to use the corpus remains required.

Two frozen manifests are deliberately distinguished:

- `data/body-training-manifest.json` has 724 usable rows and serialized-file SHA-256 `aceda1372fbccba953440e4fe047bd943af2940962424ec89e0c539b271cea7a`. Its train/development/test allocation has 335/1/1 identity components, so the development and test partitions collapse to one giant component each and are unsuitable for responsible checkpoint selection or final evaluation.
- `data/body-training-manifest-originals-only.json` drops head swaps and has 452 rows split across 316/68/68 identity components. Its serialized-file SHA-256 is `5f618941ab4bbdb7b0e37764d7f53e66f59f6d4032998deaa68aa565a01f380a`; its canonical lock-payload SHA-256 is `8e1047edd28acbfeca16aae37dd54ff76a14cca82434f52d49bdd53cca5785e1`.

The shipped-model full-letterbox predictions for all 68 originals-only locked-test rows are frozen at `data/body-training-baseline-predictions.csv`, SHA-256 `327ca21407c847657b18e1bbeb0043feda457a75963f44f003771d6f4112b83b`.

A CUDA lock cannot be validated on this CPU-only machine, so this handoff does not invent a universal set of pins. After legal authorization, install one platform-appropriate stack, archive its exact resolution, then smoke-check it before any corpus access:

```text
python -c "import pathlib,subprocess,sys; pathlib.Path(r'data/body-training-environment-lock.txt').write_bytes(subprocess.check_output([sys.executable,'-m','pip','freeze','--all']))"
```

Review and preserve that file with the run. The training command refuses a missing lock, verifies exact `==` versions for PyTorch, torchvision, ONNX, ONNX Runtime, onnxscript, Pillow, NumPy, SciPy, and pandas against installed package metadata before reading or downloading the corpus, and records both those versions and the lock SHA-256. Then run:

```text
python models/train_body_beauty.py --smoke --environment-lock data/body-training-environment-lock.txt
python models/train_body_beauty.py --environment-lock data/body-training-environment-lock.txt --data-dir "C:\Users\sourd\AppData\Local\Temp\codex-body-evaluation-cache\connor\full_body_photo_database" --manifest data/body-training-manifest-originals-only.json --drop-headswaps --preprocessing-mode full-letterbox --seeds 1337,2027,4099 --epochs 40 --batch-size 16 --device cuda --baseline-predictions data/body-training-baseline-predictions.csv --min-dev-spearman 0.30 --min-test-spearman 0.30 --min-test-spearman-delta 0.02 --bootstrap-iterations 2000 --candidate-out models/body-beauty.candidate.onnx --run-report data/body-training-run.json
```

This command consumes the already frozen originals-only manifest and baseline predictions. Do not regenerate either during the GPU session, and do not use the all-row collapsed manifest for model selection.

Those thresholds are necessary, not sufficient. Before replacing production, the candidate must also win on a broader license-clear, body-specific, identity-disjoint locked test covering male and female bodies, clothed and bare presentations, full and torso framing, repeated identities, route transitions, supportable subgroups, and registered camera-like transforms. Browser/Python tensor parity and target-device load, memory, latency, offline/cache, and real-camera checks must pass. Only then may a separately fitted reference map be regenerated for calibration; that map receives no credit for rank/AUC/pairwise gains.
