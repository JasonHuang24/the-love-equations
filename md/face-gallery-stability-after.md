# Face Calculator identity-grouped gallery baseline

Generated from the production Matchmaker gallery and the shipped on-device browser pipeline. All metrics group by identity; no image crosses the frozen train/validation/holdout boundary.

Matchmaker looks labels are independent editorial judgments, not scientific ground truth or universal human consensus.

## Coverage

- Identities: 199 (195 with at least one score; 4 all-refused).
- Gallery images: 825 submitted, 656 scored, 169 refused, 0 errors.
- Image refusal rate: 0.205 [0.174, 0.239].

## Preregistered split metrics

| Split | identities scored/total | image refusal | within-sex top/bottom AUC (95% CI) | ≥1-point pairwise accuracy (95% CI) | Spearman ρ (95% CI) |
| --- | ---: | ---: | ---: | ---: | ---: |
| train | 115/119 | 0.202 [0.159, 0.249] | 0.674 [0.523, 0.811] | 0.596 [0.510, 0.679] | 0.260 [0.083, 0.426] |
| validation | 40/40 | 0.235 [0.162, 0.314] | 0.587 [0.287, 0.823] | 0.579 [0.397, 0.740] | 0.151 [-0.176, 0.456] |
| holdout | 40/40 | 0.183 [0.123, 0.249] | 0.702 [0.434, 0.936] | 0.662 [0.502, 0.811] | 0.376 [0.068, 0.634] |
| all | 195/199 | 0.205 [0.174, 0.239] | 0.666 [0.544, 0.764] | 0.593 [0.532, 0.652] | 0.255 [0.124, 0.385] |

## Cross-photo stability

| Identity statistic (raw model units) | median (identity-bootstrap 95% CI) | eligible identities |
| --- | ---: | ---: |
| within-person SD | 0.365 [0.343, 0.399] | 175 |
| within-person range | 0.762 [0.710, 0.820] | 175 |
| within-person MAD | 0.188 [0.159, 0.214] | 175 |

The per-identity CSV records each worst-scoring photo pair and its absolute raw gap.

## Multi-photo raw averaging

The same common cohort of identities with at least four scored photos is used for k=1, 2, and 3. Every k-photo raw mean is compared with that identity's all-photo raw mean; identities are weighted equally. Held-out-remainder error remains available in the machine-readable artifact as a secondary diagnostic.

| Photos averaged | common-cohort identities | mean absolute raw error to all-photo consensus (95% CI) | median subset-estimate SD (95% CI) | median subset-estimate range (95% CI) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 0.303 [0.280, 0.325] | 0.396 [0.361, 0.435] | 0.881 [0.819, 1.001] |
| 2 | 99 | 0.178 [0.164, 0.192] | 0.223 [0.198, 0.240] | 0.634 [0.555, 0.703] |
| 3 | 99 | 0.111 [0.103, 0.120] | 0.142 [0.124, 0.153] | 0.335 [0.298, 0.406] |

## Expected-sex subgroups

| Expected sex | identities scored/total | refusal rate | AUC (95% CI) | ≥1-point pairwise (95% CI) | Spearman ρ (95% CI) |
| --- | ---: | ---: | ---: | ---: | ---: |
| f | 98/100 | 0.204 [0.159, 0.252] | 0.630 [0.443, 0.789] | 0.582 [0.499, 0.673] | 0.175 [-0.014, 0.356] |
| m | 97/99 | 0.206 [0.158, 0.257] | 0.686 [0.519, 0.820] | 0.603 [0.507, 0.694] | 0.219 [0.027, 0.411] |

## Supportable explicit editorial-demographic groups

These groups come only from the existing explicit matchmaker.html ethnicity field; nothing was inferred from images. Groups below meet the preregistered minimum of 20 scored identities and contain both primary classes.

| Editorial ethnicity field | identities scored/total | refusal rate | AUC (95% CI) | ≥1-point pairwise (95% CI) | Spearman ρ (95% CI) |
| --- | ---: | ---: | ---: | ---: | ---: |
| black | 20/22 | 0.400 [0.287, 0.523] | 0.333 [0.035, 0.768] | 0.368 [0.119, 0.695] | -0.128 [-0.594, 0.387] |
| white | 125/126 | 0.181 [0.144, 0.224] | 0.699 [0.550, 0.826] | 0.609 [0.532, 0.684] | 0.276 [0.101, 0.439] |

## Guardrails

- Candidate selection may use train and validation only. Holdout is run once after candidate and preprocessing choices are frozen.
- The primary metrics are ordering tests; a monotone display remap cannot improve them.
- Refusal and stability intervals resample identities, preserving all of each sampled identity's photos as a cluster.
- Explicit editorial ethnicity metadata is broad and not a controlled or independently verified demographic dataset; subgroup results are a pressure test only.
