# Body preprocessing transform-stability audit

## Result

The audit ran 216 production browser cases: 12 source stimuli × 18 deterministic states. The production route scored 190 rows and refused 26 (12.0%).

Across non-control cases with a scored original and transformed production result, the current pipeline's mean absolute continuous-score change was 0.3408. On those identical production-accepted pairs, the locked full-letterbox candidate's mean absolute change was 0.2505. These are stability measurements, not independently judged attractiveness improvements.
The descriptive common-pair screen flagged 8 transformed states where candidate MAE worsened by more than 0.10 or rank retention worsened by more than 0.10. These reporting thresholds were not preregistered acceptance cutoffs.


## Per-transform results

| Transform | Current scored | Refused | Route changes | Current MAE | Current rank retention | Candidate MAE | Candidate rank retention |
|---|---:|---:|---:|---:|---:|---:|---:|
| original | 10/12 | 2 | 0 | 0.0000 | 1.0000 | 0.0000 | 1.0000 |
| mirror | 11/12 | 1 | 1 | 0.2580 | 0.7301 | 0.2938 | 0.2364 |
| crop_center_10 | 5/12 | 7 | 10 | 0.6310 | -0.5263 | 0.1619 | 0.9000 |
| crop_legs_20 | 12/12 | 0 | 12 | 0.7250 | 0.6197 | 0.1432 | 0.6000 |
| pad_wide_black | 12/12 | 0 | 2 | 0.1630 | 0.5969 | 0.0060 | 0.9879 |
| pad_tall_black | 10/12 | 2 | 2 | 0.2533 | 0.6950 | 0.9936 | -0.1333 |
| canvas_light_gray | 10/12 | 2 | 2 | 0.2967 | 0.8645 | 0.3238 | 0.3667 |
| aspect_squeeze_80 | 11/12 | 1 | 3 | 1.0333 | 0.4407 | 1.0537 | 0.2000 |
| resolution_256 | 10/12 | 2 | 0 | 0.2760 | 0.4602 | 0.0423 | 0.8545 |
| brightness_70 | 11/12 | 1 | 1 | 0.2850 | 0.5062 | 0.3188 | 0.1152 |
| brightness_130 | 11/12 | 1 | 1 | 0.3510 | 0.7178 | 0.2917 | 0.5636 |
| contrast_70 | 11/12 | 1 | 1 | 0.2610 | 0.6462 | 0.2295 | 0.3818 |
| contrast_130 | 11/12 | 1 | 1 | 0.3080 | 0.6319 | 0.0739 | 0.9515 |
| side_lighting | 11/12 | 1 | 1 | 0.1500 | 0.6111 | 0.0790 | 0.8545 |
| jpeg_q35 | 12/12 | 0 | 2 | 0.1410 | 0.5617 | 0.0314 | 0.9879 |
| rotate_3 | 11/12 | 1 | 3 | 0.3056 | 0.3077 | 0.1742 | 0.4167 |
| perspective_mild | 10/12 | 2 | 1 | 0.3070 | 0.8037 | 0.1149 | 0.5636 |
| gaussian_blur_1_5 | 11/12 | 1 | 1 | 0.2460 | 0.5169 | 0.0370 | 0.9515 |

## Production pose-crop padding

Crop geometry was instrumented for 191/216 rows; 191 extended outside the image (1.0000 of instrumented rows).
Padding fractions: min 0.3427, q25 0.5241, median 0.5440, q75 0.5629, p90 0.5727, max 0.6586.
Refusal/error rates were 0.0052 for outside crops (n=191) and — for inside crops (n=0).
Among finite results, padding-versus-score Spearman was 0.0066; outside-minus-inside mean score was —. Paired transform MAE was 0.3408 for outside crops versus — for inside crops.
Within-source padding-fraction change versus continuous-score change used 161 pairs: Spearman 0.2012, Pearson 0.2514.
Within-source synthetic transforms quantify association between a changed production padding fraction and score change; transforms also change pixels/framing, so this is sensitivity evidence, not a randomized causal estimate.
Descriptive association only. Padding is produced by pose/framing geometry and is not randomized, so score or refusal differences are not causal evidence.
Every instrumented crop extended outside the image; there is no inside-crop control group, so outside-versus-inside outcome or mean-score effects are unidentifiable.

## Route and refusal behavior

Observed route transitions: `{"clothed\u2192model -> clothed\u2192geometry": 15, "clothed\u2192model -> refused": 9, "refused -> clothed\u2192geometry": 4, "refused -> clothed\u2192model": 16}`.

Observed refusal reasons: `{"No body found \u2014 use a clear, full-body, front-facing photo.": 10, "The geometry route produced no scored body cue. Retake with your full outline visible, arms a few inches out, and stronger contrast from the background.": 1, "This body is too side-on for frontal width ratios. Use a front-facing photo.": 13}`.

Machine-readable slices by production route, inferred sex, framing state, surviving geometry cues, transform family, label quartile, and frozen baseline outcome are in the JSON artifact. Sparse slices are descriptive only.

## Interpretation and limits

The full-letterbox candidate is a preprocessing change and can alter ordering; it is not a monotone display remap. Public half-point quantization is reported separately because it adds ties and can obscure continuous differences. No calibration curve receives credit for ranking or ordering.

This registered stability check is narrow: the sources are synthetic female bodies on one controlled shape continuum. Synthetic mirrors, crops, padding, resampling, lighting edits, background canvases, JPEG compression, rotation, perspective warps, and blur do **not** prove behavior for actual pose changes, arm placement, physical sensor rotation, autofocus, exposure, permission/browser chrome, or real-device motion. It also supplies no male, clothed, bare-torso, demographic, or real-background breadth.

Rejected for production: the narrow accuracy screen passed, but the registered synthetic stability screen showed material regressions and broader body-specific scope is absent.

## Reproduction

Exact commands, input paths, hashes, model/page bindings, and the external-cache warning are recorded in the JSON and batch metadata artifacts.
