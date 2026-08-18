# Face Calculator paired before/after evaluation

Both after batches used identical scoring page bytes (SHA-256 df4349e649f09be308d842a454821677ad57e268161123c17aefdaca5542bc3e). The final page adds post-snapshot UI copy and camera lifecycle, reliability, restore, and accessibility safeguards; those non-scoring changes are excluded from these metrics.

Matchmaker labels are independent editorial judgments, not scientific ground truth, objective beauty, or universal human consensus. Paired intervals use 2000 identity bootstrap resamples (seed 20260818).

## Canonical portraits

Common scored identities: 166; outcome transitions: {'refused->refused': 33, 'scored->scored': 166}.

| Metric | Before (95% CI) | After (95% CI) | Paired delta (95% CI) |
| --- | ---: | ---: | ---: |
| Within-sex top/bottom AUC | 0.647 [0.518, 0.761] | 0.647 [0.517, 0.762] | 0.000 [-0.019, 0.022] |
| Within-sex at-least-1-point pairwise | 0.596 [0.529, 0.660] | 0.598 [0.530, 0.658] | 0.002 [-0.011, 0.017] |
| Spearman rho | 0.213 [0.063, 0.364] | 0.215 [0.069, 0.356] | 0.002 [-0.020, 0.025] |

- Identity refusal: 0.166 [0.116, 0.216] to 0.166 [0.116, 0.221]; delta 0.000 [0.000, 0.000].
- Pairwise transitions: {'unchanged': 4670, 'improved': 84, 'regressed': 74, 'eligible_pairs': 4828}.

## Identity-aggregated gallery

Common scored identities: 195; outcome transitions: {'refused->refused': 169, 'scored->scored': 656}.

| Metric | Before (95% CI) | After (95% CI) | Paired delta (95% CI) |
| --- | ---: | ---: | ---: |
| Within-sex top/bottom AUC | 0.663 [0.544, 0.760] | 0.666 [0.539, 0.763] | 0.004 [-0.005, 0.014] |
| Within-sex at-least-1-point pairwise | 0.591 [0.525, 0.655] | 0.593 [0.529, 0.654] | 0.002 [-0.003, 0.008] |
| Spearman rho | 0.251 [0.112, 0.383] | 0.255 [0.121, 0.390] | 0.004 [-0.006, 0.013] |

- Identity refusal: 0.020 [0.005, 0.040] to 0.020 [0.005, 0.040]; delta 0.000 [0.000, 0.000].
- Pairwise transitions: {'unchanged': 6579, 'improved': 51, 'regressed': 37, 'eligible_pairs': 6667}.

Gallery image refusal remained 0.205 [0.172, 0.239] to 0.205 [0.171, 0.239]; delta 0.000 [0.000, 0.000].

## Cross-photo stability

| Identity-median raw statistic | Before (95% CI) | After (95% CI) | Paired delta (95% CI) | Relative change |
| --- | ---: | ---: | ---: | ---: |
| SD | 0.363 [0.334, 0.407] | 0.365 [0.343, 0.406] | 0.003 [-0.010, 0.017] | 0.7% |
| Range | 0.756 [0.698, 0.813] | 0.762 [0.713, 0.820] | 0.006 [-0.008, 0.032] | 0.8% |
| MAD | 0.182 [0.143, 0.211] | 0.188 [0.159, 0.214] | 0.006 [-0.006, 0.023] | 3.3% |

## Crop containment and padding

### Canonical

- Diagnostics complete: 166/166 scored rows.
- Requested crop fit in 160 rows; unavoidable no-fit in 6.
- Fit-capable containment violations: 0.
- Shifted 47; padded 6; partially visible face 26.
- Unavoidable padding median 13.14%, maximum 39.50%; minimum face visible 74.57%.

### Gallery

- Diagnostics complete: 656/656 scored rows.
- Requested crop fit in 576 rows; unavoidable no-fit in 80.
- Fit-capable containment violations: 0.
- Shifted 108; padded 80; partially visible face 23.
- Unavoidable padding median 12.43%, maximum 64.94%; minimum face visible 71.47%.

## Permitted subgroup deltas

Expected-sex labels are reported separately. Other groups use only matchmaker.html's explicit editorial ethnicity field, require at least 20 common scored identities plus both primary classes, and are never inferred from images.

| Group | n | AUC before to after | Pairwise before to after | rho before to after |
| --- | ---: | ---: | ---: | ---: |
| expected sex: f | 98 | 0.615 to 0.630 | 0.577 to 0.582 | 0.162 to 0.175 |
| expected sex: m | 97 | 0.687 to 0.686 | 0.604 to 0.603 | 0.221 to 0.219 |
| explicit editorial ethnicity: black | 20 | 0.361 to 0.333 | 0.368 to 0.368 | -0.103 to -0.128 |
| explicit editorial ethnicity: white | 125 | 0.692 to 0.699 | 0.608 to 0.609 | 0.272 to 0.276 |

## Decision

The crop repair fixed containment and exposes its diagnostics, but did not materially improve real-world ordering. Canonical AUC was exactly unchanged; all paired discrimination deltas were tiny and their confidence intervals included zero. Stability moved slightly worse but stayed inside the 10% guardrail. Retain the current model and arithmetic raw averaging, and make no stronger accuracy claim.

The validation-locked gallery-mean aggregation finalist also failed holdout: no primary gain reached 0.03, AUC moved slightly backward, and expected-female holdout AUC regressed from 0.88 to 0.76.

Artifacts: data/face-before-after-comparison.json, data/face-crop-error-gallery.csv, md/face-crop-error-gallery.html, data/face-aggregation-validation-lock-v1.json, data/face-aggregation-holdout-v1.json, data/face-gallery-stability-before.json, data/face-gallery-stability-after.json, and md/face-evaluation-preregistration.md.

A monotone display remap cannot improve AUC, pairwise ordering, or Spearman rho.
