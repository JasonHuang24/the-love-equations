# Face Calculator preregistered identity evaluation

Frozen 2026-08-18 before evaluating median or trimmed multi-photo aggregation on the holdout.

Matchmaker looks labels are independent editorial judgments. They are useful for this product-specific pressure test, but they are not scientific ground truth, an objective-beauty measure, or universal human consensus. SCUT results are training-contaminated for the shipped Gustrd ResNet18 checkpoint and are not a ship gate.

## Frozen population and leakage boundary

- The unit of assignment, tuning, resampling, and reporting is the identity.
- The frozen split is `data/face-identity-split-v1.csv`, SHA-256 `0005aa687c2b0bb383d857b1df59f2a5859095a6ca203957fdaf181dc5fbcd1a`.
- Counts are train 119, validation 40, and holdout 40 identities. Every canonical and gallery image inherits its identity's one split; image-level splitting is forbidden.
- The split was deterministically stratified by expected-sex label and fixed editorial looks band. No output, refusal, crop diagnostic, or candidate prediction participated in assignment.
- Training identities may be used for engineering. Validation identities choose at most one finalist. Holdout identities are evaluated only after definitions, preprocessing, aggregation, thresholds, and input hashes are frozen in a validation-lock artifact.
- Required baseline auditing already exposed the gallery arithmetic-mean holdout result. That fact is recorded rather than hidden: the split remains locked, but it is a reused benchmark rather than a pristine never-viewed cohort. Median and trimmed-mean holdout results were not examined at this freeze. No method or threshold may change after any holdout output.

## Frozen compact aggregation candidates

All aggregation happens in raw model-output space, followed by the existing monotone display mapping exactly once.

| ID | Exact prediction rule |
| --- | --- |
| `canonical_single` | Raw output of the canonical roster portrait; refusal if that portrait has no finite raw output. This is the comparison baseline. |
| `gallery_mean` | Arithmetic mean of every finite gallery raw output for the identity; refusal only if none score. This is the shipped multi-photo rule generalized to the available gallery photos. |
| `gallery_median` | Median of every finite gallery raw output; refusal only if none score. |
| `gallery_trimmed_mean` | With at least three finite raws, remove exactly one minimum and one maximum, then arithmetic-mean the remainder; with one or two raws, use their arithmetic mean. Refusal only if none score. |

The gallery is used as a repeated-capture stress test. Because canonical and gallery images are different captures, a canonical-versus-gallery result combines capture selection and aggregation. Mean-versus-median-versus-trimmed comparisons isolate the aggregation rule more directly.

Primary candidate comparisons use only the fixed common-scored identity cohort for the phase, so selective refusal cannot change who enters one method's ordering metric. Operational metrics on every identity in the phase, including each candidate's refusal rate, are reported separately.

## Metrics

Primary:

1. Within-expected-sex top-versus-bottom-label-quartile AUC.
2. Within-expected-sex pairwise ordering accuracy for editorial-label gaps of at least 1.0 point.

Secondary:

- Spearman rho and Pearson r.
- Image and identity refusal rates.
- Paired candidate-minus-baseline deltas with identity-bootstrap 95% confidence intervals.
- Within-person raw SD, range, median absolute deviation, and worst photo pair.
- One-, two-, and three-photo raw-mean error to the same all-photo consensus cohort.
- Aggregator leave-one-out SD and range.
- Expected-female and expected-male results.
- Supportable explicit editorial-demographic groups and subgroup deltas.
- Largest improvements and regressions, with filenames and before/after raw values.

Bootstrap confidence intervals use 2,000 deterministic identity-level resamples with seed `20260818`; every sampled identity retains all its photos. NaN and Infinity are hard failures, not omitted observations.

## Demographic policy

Expected-sex labels are reported separately. The only other eligible field is the explicit editorial `ethnicity` field already present in `matchmaker.html`; it is broad, uncontrolled metadata and is not independently verified demographic ground truth. Nothing is inferred from images.

An explicit-editorial group is reported only when the evaluated phase/common cohort contains at least 20 scored identities and both primary label classes. If none qualify, the report says so explicitly. Small groups are suppressed, not pooled post hoc.

## Validation selection

Validation advances at most one aggregation candidate. A candidate is eligible only when, versus `canonical_single` on the paired common cohort:

- at least one primary point estimate improves by at least 0.03;
- the other primary point estimate is no worse than -0.01;
- identity refusal is no more than 0.03 worse; and
- for median or trimmed mean, leave-one-out SD and range are no more than 10% worse than `gallery_mean`.

Eligible candidates are ranked by the larger minimum primary delta, then the sum of the two primary deltas, then the fixed order mean, median, trimmed mean. The validation artifact pins all input hashes, the preregistration hash, candidate definitions, and the selected finalist. If none passes, no aggregation finalist is opened on holdout.

## Holdout ship gate

The selected candidate ships only if the locked holdout shows all of the following:

- at least one primary point estimate improves by at least 0.03 and its paired-bootstrap 95% CI excludes zero on the improving side;
- the other primary point estimate is no worse than -0.01 and its paired-bootstrap lower confidence bound is above -0.03;
- before-versus-after median within-person raw SD, range, and MAD do not worsen by more than 10%;
- image or identity refusal does not increase by more than 0.03 absolute;
- neither expected-sex subgroup has a primary point-estimate regression worse than 0.05;
- no supportable explicit-editorial demographic subgroup has a primary point-estimate regression worse than 0.05; and
- no NaN/Infinity, storage mutation, preprocessing mismatch, or material camera/crop regression is present.

If the evidence is inconclusive or any gate fails, retain the current model/aggregation and reduce the strength and precision of UI claims. A monotone display remap cannot satisfy either primary gate.