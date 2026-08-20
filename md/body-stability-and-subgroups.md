# Body reliability, stability, and subgroup audit

## Bottom line

The accepted production changes improve engineering reliability, lifecycle ownership, persistence safety, route provenance, precision honesty, and camera guidance. They did **not** improve independently measured subjective-attractiveness discrimination on the locked body-specific holdout. On the same 53 accepted rows, every continuous ordering metric was exactly unchanged; the paired 1,000-replicate bootstrap interval for every delta was `[0, 0]`.

The shipped ONNX weights, production pose crop, score tables, weights, and routing thresholds remain unchanged. This is “reliability improved but subjective accuracy did not,” not better attractiveness intelligence.

## Locked independent result

The independent set contains 61 Moussally et al. synthetic female body-only stimuli with a 1–9 Valence M label averaging attractiveness, beauty, and harmony. It is independent of the shipped Connor-trained model, but it is narrow and the label is not attractiveness-only.

| Metric on identical accepted rows | Frozen before | Final after | Delta |
|---|---:|---:|---:|
| Accepted rows | 53 | 53 | 0 |
| Continuous Spearman | −0.06268 | −0.06268 | 0.00000 |
| Continuous Pearson | −0.09868 | −0.09868 | 0.00000 |
| Top-vs-bottom-quartile AUC | 0.45408 | 0.45408 | 0.00000 |
| Pairwise accuracy, gap 0 | 0.46548 | 0.46548 | 0.00000 |
| Pairwise accuracy, gap 0.5 | 0.45736 | 0.45736 | 0.00000 |
| Pairwise accuracy, gap 1 | 0.46660 | 0.46660 | 0.00000 |
| Pairwise accuracy, gap 2 | 0.49361 | 0.49361 | 0.00000 |

The refusal rate remained 8/61 (13.1%), with all 53 accepted rows staying accepted and all eight refused rows staying refused. Those refusals are highly selective: seven of the lowest-label quartile’s 16 rows were refused, versus one of 15 in quartile two and none in quartiles three or four. Accepted-row discrimination is therefore selection-biased.

The continuous internal score spans only 7.07–7.98. The public half-point headline spans 7.0–8.0 and has Spearman −0.12770 and AUC 0.41582. Public quantization adds ties; it is kept separate from the continuous pipeline value. A monotone display/calibration remap cannot improve Spearman, AUC, or pairwise ordering and receives no attractiveness-intelligence credit.

## Registered transform stability

The final browser audit ran 216 production cases: 12 deterministic label-stratified source bodies × 18 states covering the unmodified control, mirror, two crops, wide/tall padding, background canvas, aspect squeeze, low resolution, brightness, contrast, side lighting, JPEG compression, rotation, mild perspective, and blur. It produced 190 scored rows and 26 refusals; browser localStorage and sessionStorage remained unchanged.

On the 161 non-control pairs where the production original and transform both had a finite result:

- Current production pose/routing pipeline mean absolute continuous change: 0.34078.
- Locked full-letterbox candidate mean absolute change on those same pairs: 0.25051.
- Current public half-point value changed on 59.0% of eligible pairs.
- The letterbox public half-point value changed on 39.2% of all candidate pairs.

The lower aggregate letterbox MAE does not establish a safe replacement. Identical-pair slices showed large candidate regressions in rank retention for mirror, light-gray canvas, aspect squeeze, brightness/contrast, mild perspective, and especially tall padding; tall-padding candidate MAE also exceeded production by 0.74025. The 0.10 MAE/rank flags are descriptive reporting thresholds, not preregistered acceptance cutoffs. The fixed candidate passed the narrow independent accuracy screen but failed this descriptive stability battery and still lacks the required clothed/bare and male/female body-specific breadth. It is rejected for production.

Observed final transform route transitions were 15 model→geometry, nine model→refused, four refused→geometry, and 16 refused→model. Synthetic pixel transforms do **not** prove physical sensor rotation, autofocus, exposure, permissions/browser chrome, actual pose changes, arm placement, real-device motion, or new backgrounds.

### Browser proof of crop padding semantics

A deterministic Chrome Canvas2D fixture draws a solid 4×4 source through the out-of-bounds rectangle `(-2, -2, 4, 4)` into an 8×8 destination. It observes exactly 48 transparent-black pixels and 16 source-color pixels: padding fraction 0.75, matching the geometric diagnostic used by production. This proves the browser pixel behavior; the final production batches separately quantify incidence and score/outcome sensitivity.

In the final independent batch, crop diagnostics were available for all 53 scored rows and none of the eight pre-crop refusals. Every instrumented crop extended outside the source image (53/53); padding fraction ranged from 0.46008 to 0.57676, with q25 0.54348, median 0.55993, q75 0.56816, p90 0.57056, and mean 0.55372. Among those 53 scored rows, padding fraction had Spearman −0.35585 and Pearson −0.26235 with the continuous score. Because there was no inside-crop control, outside-versus-inside refusal or mean-score effects are unidentifiable; these are descriptive associations, not causal estimates.

In the transform battery, diagnostics were available for 191/216 rows (190 scored and one refused), and all 191 crops extended outside. Padding fraction ranged from 0.34265 to 0.65865, with q25 0.52409, median 0.54401, q75 0.56291, p90 0.57265, and mean 0.52650. On the 161 finite non-control pairs, crop-outside score-change MAE was 0.34078. Padding fraction changed on 82 pairs; padding change versus continuous-score change had Spearman 0.20123 and Pearson 0.25139. Each transform also changes pixels or framing, so this establishes synthetic sensitivity only and cannot isolate padding as the cause.


```powershell
C:\Users\sourd\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe tools\audit_body_canvas_padding.mjs --playwright-module C:\Users\sourd\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs --browser-executable "C:\Program Files\Google\Chrome\Application\chrome.exe" --output data\body-canvas-padding-audit.json
```

## Connor diagnostic and subgroup slices

Connor remains training-contaminated/model-selection evidence with holistic whole-person ratings, not body-specific independent ground truth. The source has 726 stimuli and 724 usable labels; WF111/WF112 have missing labels. The OSF node exposes no declared license, so no source photographs are committed.

The exact frozen-base rerun processed 724 rows: 723 page-scored, one refused, and 722 finite displayed results. Routes were 658 clothed→CNN, 59 bare→geometry, six clothed→geometry, and one refusal. Overall continuous Spearman was 0.46644 and AUC 0.80909, but these values are optimistic because the shipped model was trained on Connor.

| Contaminated slice | n | Spearman | AUC |
|---|---:|---:|---:|
| CNN instrument | 658 | 0.59025 | 0.88612 |
| Geometry instrument | 64 | 0.28976 | 0.69141 |
| Clothed | 664 | 0.57687 | 0.88150 |
| Bare | 58 | 0.28444 | 0.68444 |
| Full-body framing | 711 | 0.48666 | 0.82474 |
| Torso framing | 11 | −0.36364 | 0.33333 |
| Clean framing/gate | 689 | 0.51090 | 0.82534 |
| Framing/outline override | 32 | 0.20455 | 0.60938 |
| Female label | 305 | 0.36346 | 0.73284 |
| Male label | 417 | 0.49469 | 0.82512 |
| Original | 451 | 0.46852 | 0.79466 |
| Head swap | 271 | 0.48313 | 0.80277 |

Surviving-cue signatures range from one or two rows to 482 rows; tiny groups are explicitly marked in the machine-readable report and must not be interpreted as stable subgroup estimates. The 133 Connor multiple-image clusters are primarily an original pictured body paired with one or more head-swap composites—not natural repeat photos across angles, poses, sessions, or days. Their mean within-cluster display range was 0.63989 and p90 was 1.03600: contaminated composite sensitivity only, not general multi-photo identity stability or independent accuracy. The independent set has one image per body, so natural repeated-photo stability remains unmeasured.

The A/B/W values in the Connor subgroup table are unverified codes parsed solely from the body filename token. No source-backed meaning was established, so they are not legitimate demographic ground truth and are not fairness evidence.

## Retraining decision

Code changes could fix capture, cancellation, preprocessing provenance, routing consistency, persistence validation, rendering safety, and precision claims. They did not improve independent ordering. The remaining limitations are a combination of dataset shift, narrow/contaminated training evidence, framing sensitivity, and the learned CNN itself. A full-image letterbox can change and sometimes improve ordering, so this is not merely a calibration problem; however, its slice regressions make a production crop swap unjustified.

A meaningful gain now requires retraining or fine-tuning on a broader, licensed, body-specific, identity-disjoint dataset with locked development/test manifests. The 452-row Connor originals-only split is a reproducible GPU-session handoff, not independent validation of the shipped model. Its 68-row shipped-model baseline is committed for parity comparison, with contaminated diagnostic Spearman 0.89312 and Pearson 0.91003.

## Provenance and exact reproduction

- Final `body.html` SHA-256: `d75ec65acc0d766bef409676f82e10864d1fb6293ee2d4707ff2ab555ae8577d`
- Shipped model SHA-256: `6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2`
- Independent manifest SHA-256: `c9c5717fa3f866ec8e5f5d3143dadcc5d1ca5fe43d8305420b24b431967c00be`
- Final independent CSV SHA-256: `03e1322f73c82ff2cf30f3dfa8f2e697aec2dd66607ea88ec387dae4c14c7af2`
- Evaluation lock SHA-256: `6cc28bb1861b4441cb460e57393c3f8b6b4c0a5a2fecefcd4734c289e2aacff5`
- Final manifest runner SHA-256: `c0e14e4a7bfd5b4006c9a4604b957de3850bed54c5161c31c598cbd13e2b595e`
- Transform manifest SHA-256: `41cb0d67b37b24cb9beb9f25c3318c0032b94de939edad25ca875fee67cff8d0`
- Final independent metadata SHA-256: `b987d07a3cf41d1f0855482f11d05f8aec102ccaf9689e2b418d2b08e324b842`
- Exact independent reproduction proof SHA-256: `b86015d0db12962dcfd39afa04e66ade00c2bd3e6c02cc148de138132b098ae3`
- Final transform batch CSV SHA-256: `f1f9ac8ac0125c859062294a9480454250c5e8443779f5c314df858ea998ab27`
- Final transform analyzer SHA-256: `876e6c8eac3e18614cdf9c816c6e0956d8eb0aa48e923facb4cd4c8de1a1562f`
- Training originals-only serialized file SHA-256: `5f618941ab4bbdb7b0e37764d7f53e66f59f6d4032998deaa68aa565a01f380a`; its manifest’s named canonical lock-payload SHA-256 is `8e1047edd28acbfeca16aae37dd54ff76a14cca82434f52d49bdd53cca5785e1`.
- Training baseline CSV SHA-256: `327ca21407c847657b18e1bbeb0043feda457a75963f44f003771d6f4112b83b`

The final 61-row browser batch was run twice. CSV bytes were exactly identical, and metadata was identical after ignoring only `command` and `generated_at` (the two explicitly declared runtime fields). Both runs reported unchanged localStorage/sessionStorage.

```powershell
C:\Users\sourd\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe tools\run_body_manifest_batch.mjs --base http://127.0.0.1:8765/body.html?debug --pipeline-root . --manifest data\body-independent-manifest.csv --dataset-metadata data\body-independent-manifest.meta.json --photos "C:\Users\sourd\AppData\Local\Temp\codex-body-evaluation-cache\body-image-stimuli\Low Resolution - R = 200" --out data\body-independent-after.csv --metadata-out data\body-independent-after.meta.json --playwright-module C:\Users\sourd\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright\index.mjs --browser-executable "C:\Program Files\Google\Chrome\Application\chrome.exe" --timeout-minutes 180

python tools\evaluate_body_accuracy.py --input data\body-independent-after.csv --batch-metadata data\body-independent-after.meta.json --dataset-metadata data\body-independent-manifest.meta.json --evaluation-lock data\body-evaluation-lock-v1.json --evaluation-phase after --output-json data\body-independent-evaluation-after.json --output-md md\body-independent-evaluation-after.md --bootstrap 1000 --seed 20260818

python tools\compare_body_evaluations.py --before data\body-independent-before.csv --before-metadata data\body-independent-before.meta.json --after data\body-independent-after.csv --after-metadata data\body-independent-after.meta.json --dataset-metadata data\body-independent-manifest.meta.json --evaluation-lock data\body-evaluation-lock-v1.json --output-json data\body-before-after-evaluation.json --output-md md\body-before-after-evaluation.md --bootstrap 1000 --seed 20260818
```

Exact transform, repeat-run, and baseline-export commands are additionally embedded in their JSON metadata artifacts. External caches contain source/derivative images; no source photo is committed.
