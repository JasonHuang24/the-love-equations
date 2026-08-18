# Face Calculator evaluation methodology and decision

Generated 2026-08-18. This is the consolidated methodology and results index for the crop, camera, repeated-photo, and model-candidate pressure test.

## Decision

The crop and camera repairs are reliability improvements, not demonstrated improvements in real-world face-ranking discrimination.

- Ship the contained shared crop and structured crop diagnostics.
- Ship the live guide mapping, bounded scale/pose checks, stable-pass auto-snap, ready styling, and manual-shutter provenance.
- Retain the shipped Gustrd SCUT ResNet18 and arithmetic raw-mean multi-photo rule.
- Do not ship FPEM/LiveBeauty or a new ensemble.
- Do not claim objective beauty, universal consensus, demographic neutrality, “accuracy” percentages, or improved discrimination.
- Keep UI precision and claims reduced: half-point presentation, percentile deciles, model-output bands, and explicit photo/capture sensitivity.

A monotone display remap cannot change AUC, pairwise ordering, or Spearman rho.

## Evidence boundary

The independent Matchmaker labels are one site's editorial judgments. They are useful for this product-specific pressure test, but they are not scientific ground truth or universal human consensus.

The SCUT results are contaminated and optimistic because the shipped checkpoint was trained on SCUT-FBP5500:

| SCUT evaluation | n | Spearman rho |
| --- | ---: | ---: |
| Balanced, tail-enriched | 400 | 0.933 |
| Balanced, random-only | 280 | 0.879 |

Those values are context, not a ship gate.

## Frozen identity design

The split was frozen before alternative aggregation evaluation:

- Unit: identity, never image.
- Train: 119 identities.
- Validation: 40 identities.
- Holdout: 40 identities.
- Stratification: expected-sex label and fixed editorial looks band.
- Split manifest: [face-identity-split-v1.csv](../data/face-identity-split-v1.csv), SHA-256 0005aa687c2b0bb383d857b1df59f2a5859095a6ca203957fdaf181dc5fbcd1a.
- Full preregistration: [face-evaluation-preregistration.md](face-evaluation-preregistration.md).
- Machine preregistration: [face-evaluation-preregistration-v1.json](../data/face-evaluation-preregistration-v1.json).

Every canonical/gallery image inherited its identity's split. Primary comparisons used the identical common-scored identities for each phase. Operational refusal was reported separately so selective refusal could not masquerade as better ordering.

The required gallery arithmetic-mean baseline exposed that baseline's holdout result before alternative aggregation results were opened. This is recorded as a reused locked benchmark, not described as a pristine never-viewed holdout. Median and trimmed-mean definitions and gates were frozen before their results were examined; no threshold changed after holdout output.

## Preserved browser runs and provenance

| Artifact | Submitted | Scored | Refused | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| Canonical before | 199 | 166 | 33 | 64b5444de08989123b52084dba917961043f4bf00060767e3b6d036e47fe58e3 |
| Canonical after | 199 | 166 | 33 | 64922a34ae723ab43b5ced93b1e119be6c8c7e92715f44f5196e3c2eb5189710 |
| Gallery before | 825 | 656 | 169 | 6e4a711c1fd9f12b12d5db4b224605d072187dcb92ed7871f6f204343fd97f38 |
| Gallery after | 825 | 656 | 169 | 5f5128631271659edcb9ba4b75d4a1fe9d78cca0727dcb05cfca92d2b56da2d6 |

All batches verified row order/completeness and localStorage non-mutation. Canonical-after and gallery-after both loaded identical scoring page bytes, SHA-256 df4349e649f09be308d842a454821677ad57e268161123c17aefdaca5542bc3e. Both used:

- face-beauty.onnx SHA-256 4bdf12f3c3f21306522a33872a30cdf68fd7aa04f027c4581a10ac8638424fb8
- face-sex.onnx SHA-256 4fde69b1c810857b88c64a335084f1c3fe8f01246c9a191b48c7bb756d6652fb

After both runtime snapshots, face.html changed in its CSS cache key, user-facing claim/rounding copy, and camera lifecycle, reliability-provenance, restore-validation, and accessibility safeguards. Final page SHA-256 844cc3dca33beb636164a299d277ce75b4fd8000c00f09ef003bd0a3feb17c1c is excluded from metric provenance; no crop, preprocessing, model inference, raw aggregation, framing thresholds, or batch scoring logic changed. The final camera audit below was rerun against these bytes.

## Exact paired crop results

Paired 95% confidence intervals use 2,000 deterministic identity-level bootstrap resamples, seed 20260818.

| Dataset and metric | Before | After | After minus before, paired 95% CI |
| --- | ---: | ---: | ---: |
| Canonical within-sex top/bottom AUC | 0.647321 | 0.647321 | 0.000000 [-0.018942, 0.021587] |
| Canonical within-sex at-least-1-point pairwise | 0.595588 | 0.597659 | 0.002071 [-0.011383, 0.017223] |
| Canonical Spearman rho | 0.213283 | 0.214893 | 0.001610 [-0.019911, 0.024879] |
| Gallery identity-mean within-sex top/bottom AUC | 0.662662 | 0.666234 | 0.003571 [-0.004929, 0.014105] |
| Gallery identity-mean within-sex at-least-1-point pairwise | 0.590820 | 0.592845 | 0.002025 [-0.003362, 0.007991] |
| Gallery identity-mean Spearman rho | 0.251280 | 0.255032 | 0.003752 [-0.005874, 0.013222] |

Canonical outcomes were 166 scored-to-scored and 33 refused-to-refused. Gallery outcomes were 656 scored-to-scored and 169 refused-to-refused. Both refusal deltas and their paired confidence intervals are exactly zero.

The intervals include zero and the point changes are far below the preregistered material threshold. The crop repair did not demonstrate better real-world discrimination.

Full paired result: [face-before-after-comparison.json](../data/face-before-after-comparison.json). Human report: [face-before-after-evaluation.md](face-before-after-evaluation.md).

## Repeated-photo stability

The gallery contains 825 production photos across all 199 frozen identities. After the crop repair:

- 195/199 identities had at least one score; 4 were all-refused.
- Image refusal was 0.204848, identity-bootstrap 95% CI [0.173636, 0.238663].
- Median within-person raw SD was 0.365167 [0.343015, 0.398998].
- Median within-person range was 0.762 [0.709775, 0.820150].
- Median within-person MAD was 0.1885 [0.1585, 0.2140].
- Every identity's worst-pair filenames, both raw values, and gap are in [face-gallery-identity-after.csv](../data/face-gallery-identity-after.csv).

Paired stability deltas, using the 175 identities eligible in both runs:

| Statistic | Before | After | Delta, paired 95% CI | Relative |
| --- | ---: | ---: | ---: | ---: |
| Median raw SD | 0.362577 | 0.365167 | 0.002590 [-0.010356, 0.016929] | +0.71% |
| Median raw range | 0.756000 | 0.762000 | 0.006000 [-0.008000, 0.032000] | +0.79% |
| Median raw MAD | 0.182500 | 0.188500 | 0.006000 [-0.006000, 0.022500] | +3.29% |

All are slightly worse point estimates but remain inside the 10% guardrail.

On the fixed common cohort of 99 identities with at least four scored photos, raw-mean error to the all-photo consensus fell as expected with averaging:

| Photos averaged | Before | After |
| ---: | ---: | ---: |
| 1 | 0.301746 [0.278049, 0.324557] | 0.302520 [0.279635, 0.325171] |
| 2 | 0.177513 [0.163785, 0.191613] | 0.177649 [0.164225, 0.191553] |
| 3 | 0.111503 [0.102991, 0.120491] | 0.111299 [0.103204, 0.120343] |

Before and after gallery reports: [before](face-gallery-stability-before.md), [after](face-gallery-stability-after.md).

## Locked aggregation candidates

The compact candidates were defined before alternative holdout evaluation:

- canonical single portrait;
- gallery arithmetic mean in raw space;
- gallery median in raw space;
- gallery symmetric one-point trimmed mean for three or more raw scores.

Validation common cohort n=37 selected gallery_mean under the frozen ranking rule:

| Candidate minus canonical | AUC delta, 95% CI | Pairwise delta, 95% CI | rho delta, 95% CI |
| --- | ---: | ---: | ---: |
| Mean | +0.080 [-0.108, 0.255] | +0.031 [-0.081, 0.137] | +0.109 [-0.102, 0.324] |
| Median | +0.040 [-0.147, 0.228] | +0.013 [-0.098, 0.115] | +0.084 [-0.122, 0.292] |
| Trimmed mean | +0.060 [-0.136, 0.255] | +0.022 [-0.097, 0.132] | +0.094 [-0.112, 0.319] |

The one-time holdout common cohort n=35 did not clear the gate:

| Metric | Canonical | Gallery mean | Paired delta, 95% CI |
| --- | ---: | ---: | ---: |
| AUC | 0.765432 | 0.753086 | -0.012346 [-0.250, 0.202] |
| Pairwise | 0.693467 | 0.703518 | +0.010050 [-0.153, 0.168] |
| rho | 0.374246 | 0.429063 | +0.054816 [-0.195, 0.298] |

No primary metric improved by 0.03, AUC crossed the -0.01 tolerance, and confidence intervals were inconclusive. Expected-female AUC regressed from 0.88 to 0.76, another explicit gate failure. Arithmetic mean remains because it is existing behavior and repeated-photo averaging improves stability, not because holdout proved better discrimination.

Locks: [validation](../data/face-aggregation-validation-lock-v1.json), [holdout](../data/face-aggregation-holdout-v1.json).

## Crop containment diagnostics

All 166 canonical and 656 gallery scored rows emitted the full crop diagnostic schema.

| Set | Requested crop fits | Unavoidable no-fit/padding | Shifted to fit | Containment violations when fit | Maximum padding area | Minimum face visible |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Canonical | 160 | 6 | 47 | 0 | 39.50% | 74.57% |
| Gallery | 576 | 80 | 108 | 0 | 64.94% | 71.47% |

Every source rectangle passed to drawImage was contained. Blank crop fields belong only to rows refused before crop creation. Machine summary: [face-crop-diagnostic-summary.json](../data/face-crop-diagnostic-summary.json).

The ranked error gallery uses within-expected-sex rank-percentile error to avoid treating the editorial scale and the model percentile scale as identical. Display residual is included only as a descriptive diagnostic:

- [View error gallery](face-crop-error-gallery.html)
- [Machine-readable error rows](../data/face-crop-error-gallery.csv)

The CSV has 361 common identity rows and includes representative filenames, before/after raw values, rank/display errors, and after-crop diagnostics.

## Camera alignment coverage

The rendered audit passed all requested synthetic coverage:

- 14/14 viewport and width-mode cases;
- 42/42 portrait, 4:3, and 16:9 viewBox-to-feed mapping cases;
- 112/112 rendered alignment state cases;
- all eight codes: no face, move closer, move back, center face, align eyes, level head, face camera square-on, and ready;
- mirrored preview mapping preserved raw direction and used non-directional center copy;
- no horizontal overflow; ready-only green guide styling;
- 7/7 mocked lifecycle/restore cases: pending permission cancellation, track-ended and pagehide cleanup, live-region deduplication, reduced motion, pending-source retirement, and malformed-restore rejection;
- storage snapshots unchanged.

Coverage includes mobile portrait, tablet, 1366x768, 1920x1080, 2560x1440, 1920x1200 16:10, 4K, and original/wide site modes. Full report: [face-camera-coverage.md](face-camera-coverage.md); machine detail: [face-camera-coverage.json](../data/face-camera-coverage.json).

This is deterministic synthetic rendering. It did not exercise physical camera hardware, browser permission prompts, sensor rotation metadata, autofocus/exposure, motion, or a real face. Those remain manual device checks.

## Demographic reporting policy and results

Expected-female and expected-male labels are reported separately. The only other allowed field is matchmaker.html's existing explicit editorial ethnicity field. Nothing was inferred from images.

An explicit-editorial group is reported only with at least 20 common scored identities and both primary classes. Black and white met that threshold in the full gallery; all other fields were suppressed. These broad editorial fields are not controlled or independently verified demographic ground truth.

After crop, full-gallery expected-sex results were:

| Expected sex | n scored | AUC | Pairwise | rho | Image refusal |
| --- | ---: | ---: | ---: | ---: | ---: |
| female | 98/100 | 0.630 | 0.582 | 0.175 | 0.204 |
| male | 97/99 | 0.686 | 0.603 | 0.219 | 0.206 |

Supportable explicit-editorial fields:

| Field | n scored | AUC before to after | Pairwise before to after | rho before to after |
| --- | ---: | ---: | ---: | ---: |
| black | 20/22 | 0.361 to 0.333 | 0.368 to 0.368 | -0.103 to -0.128 |
| white | 125/126 | 0.692 to 0.699 | 0.608 to 0.609 | 0.272 to 0.276 |

Intervals are wide, especially for n=20. These are pressure-test signals, not fairness certification.

## Replacement-model audit

The official ICCV 2025 FPEM/LiveBeauty candidate is no-ship:

- its official Git LFS checkpoint is currently unavailable from the published source;
- code licensing does not clear checkpoint redistribution, combined dependency weights, or individual training images;
- LiveBeauty access and image/person rights do not establish a production training grant;
- the released single-image/export path has CUDA, N=1 squeeze, strict-load, dependency pinning, and ONNX export defects;
- the released model is roughly 140M parameters/27 GFLOPs and has no browser/mobile qualification;
- exact PyTorch to ONNX to ORT-Web parity and the locked identity holdout were not completed.

Pinned provenance, exact three-input preprocessing, output semantics, licensing findings, and numerical parity gate: [face-model-candidate-evaluation.md](face-model-candidate-evaluation.md).

## Regression and coverage verification

The face suite covers:

- REF_RAW and score-map monotonicity;
- multi-photo raw averaging;
- crop containment plus centered, every-edge, every-corner, portrait, landscape, very-close, and very-small fixtures;
- exact camera viewBox mapping, all alignment codes, mirrored preview behavior, framing thresholds, and boundary values;
- stable-pass auto-snap, exact frozen-frame auto/manual structured provenance, full-resolution downstream capture, permission-generation cancellation, stream-end cleanup, and restore sanitization;
- batch column completeness, row escaping, storage non-mutation, and NaN/Infinity rejection;
- all requested viewport/feed/mode combinations.

Commands:

    npm run test:face
    python -X utf8 tools/audit_face_accuracy.py --roster data/face-roster-pressure-test-before.csv --json data/face-pressure-test-before.json
    python -X utf8 tools/audit_face_gallery.py
    python -X utf8 tools/compare_face_runs.py
    python -X utf8 tools/evaluate_face_aggregation_candidates.py --phase validation
    python -X utf8 tools/evaluate_face_aggregation_candidates.py --phase holdout

## Artifact index

- Baseline canonical: [machine](../data/face-pressure-test-before.json), [report](face-pressure-test-baseline.md).
- After canonical: [machine](../data/face-pressure-test-after.json), [report](face-pressure-test-after.md).
- Frozen split: [CSV](../data/face-identity-split-v1.csv), [manifest](../data/face-identity-split-v1.json).
- Gallery stability: [before](../data/face-gallery-stability-before.json), [after](../data/face-gallery-stability-after.json).
- Paired crop comparison: [machine](../data/face-before-after-comparison.json), [report](face-before-after-evaluation.md).
- Error galleries: [HTML](face-crop-error-gallery.html), [CSV](../data/face-crop-error-gallery.csv).
- Aggregation lock: [validation](../data/face-aggregation-validation-lock-v1.json), [holdout](../data/face-aggregation-holdout-v1.json).
- Crop coverage: [machine](../data/face-crop-diagnostic-summary.json).
- Camera coverage: [report](face-camera-coverage.md), [machine](../data/face-camera-coverage.json).
- Model candidate: [FPEM/LiveBeauty audit](face-model-candidate-evaluation.md).
- Shipped model/crop methodology: [models README](../models/README.md).

No commit or push was performed.
