# Face Calculator pressure-test baseline

Generated 2026-08-18 from the shipped `face.html` browser pipeline.

## Bottom line

The model's out-of-sample roster rank correlation is **ρ=0.213** and its within-sex top-vs-bottom-quartile AUC is **0.647** (42 low / 48 high). That is the honest discrimination baseline. A monotone display remap cannot improve either number; it can only redistribute the visible 1–10 values.

SCUT results are an optimistic ceiling because the shipped ONNX checkpoint was trained on SCUT and no holdout manifest is available. Roster labels are independent of the model but remain one site's editorial judgments, not universal ground truth.

## Ranking and extreme separation

| Dataset | Scored n | Spearman ρ (bootstrap 95% CI) | Pearson r | top/bottom quartile AUC (low/high n) | pairwise accuracy, ≥0.5 label gap | pairwise accuracy, ≥1.0 label gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| SCUT balanced, tail-enriched (training-contaminated) | 400 | 0.933 [0.917, 0.945] | 0.945 | 1.000 (102/100) | 0.972 (n=14146) | 0.996 (n=9882) |
| SCUT balanced random-only (training-contaminated) | 280 | 0.879 [0.839, 0.909] | 0.910 | 0.998 (73/72) | 0.960 (n=5631) | 0.995 (n=3036) |
| Roster canonical portraits (independent editorial labels) | 166 | 0.213 [0.064, 0.362] | 0.234 | 0.647 (42/48) | 0.578 (n=5915) | 0.596 (n=4828) |

Pairwise comparisons are within demographic subset for SCUT and within expected sex for the roster, so group-level score offsets cannot inflate the result.

## Roster capture and scale diagnostics

- Batch outcomes: refused=33, scored=166.
- Reliability cautions among scored rows: 97/166.
- Displayed score: median 6.23, p10 4.27, p90 7.19.
- Editorial label: median 7.20, p10 4.00, p90 9.00.
- Display minus editorial label: mean -0.88, median -1.14, MAE 1.80.

The residual is descriptive only: the Face Calc scale is a percentile transform of SCUT model outputs, while Matchmaker labels are hand-authored 1–10 ratings. Forcing zero residual would conflate two different conventions and would still not repair ordering errors.

## Roster subgroups

| Expected sex | n | Spearman ρ | top/bottom quartile AUC | ≥1.0-gap pairwise accuracy |
| --- | ---: | ---: | ---: | ---: |
| f | 84 | 0.187 | 0.625 | 0.585 (n=2361) |
| m | 82 | 0.214 | 0.681 | 0.606 (n=2467) |

## Interpretation guardrails

- High-vs-low separation is the defensible claim; adjacent one-decimal distinctions are much harder and should not be described as precise.
- The SCUT model covers only two race groups, studio-like frontal images, and one rater population. Roster portraits broaden image conditions but do not supply controlled demographic labels.
- Scores can move with crop, focal length, expression, grooming, lighting, age, and image quality. Multi-photo identity stability must be tested separately on the roster galleries.
- Any future recalibration must be fitted on one split and reported on a disjoint holdout. Never select a curve on the same rows used to advertise improvement.
