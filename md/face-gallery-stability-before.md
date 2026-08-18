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
| train | 115/119 | 0.202 [0.159, 0.249] | 0.675 [0.527, 0.814] | 0.593 [0.509, 0.674] | 0.260 [0.082, 0.428] |
| validation | 40/40 | 0.235 [0.162, 0.314] | 0.587 [0.285, 0.833] | 0.579 [0.397, 0.739] | 0.155 [-0.175, 0.466] |
| holdout | 40/40 | 0.183 [0.123, 0.249] | 0.686 [0.436, 0.914] | 0.658 [0.507, 0.798] | 0.365 [0.052, 0.622] |
| all | 195/199 | 0.205 [0.174, 0.239] | 0.663 [0.538, 0.758] | 0.591 [0.530, 0.651] | 0.251 [0.122, 0.383] |

## Cross-photo stability

| Identity statistic (raw model units) | median (identity-bootstrap 95% CI) | eligible identities |
| --- | ---: | ---: |
| within-person SD | 0.363 [0.334, 0.407] | 175 |
| within-person range | 0.756 [0.698, 0.813] | 175 |
| within-person MAD | 0.182 [0.144, 0.211] | 175 |

The per-identity CSV records each worst-scoring photo pair and its absolute raw gap.

## Multi-photo raw averaging

The same common cohort of identities with at least four scored photos is used for k=1, 2, and 3. Every k-photo raw mean is compared with that identity's all-photo raw mean; identities are weighted equally. Held-out-remainder error remains available in the machine-readable artifact as a secondary diagnostic.

| Photos averaged | common-cohort identities | mean absolute raw error to all-photo consensus (95% CI) | median subset-estimate SD (95% CI) | median subset-estimate range (95% CI) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 0.302 [0.278, 0.325] | 0.397 [0.361, 0.441] | 0.911 [0.810, 1.037] |
| 2 | 99 | 0.178 [0.164, 0.192] | 0.225 [0.198, 0.245] | 0.619 [0.555, 0.706] |
| 3 | 99 | 0.112 [0.103, 0.120] | 0.142 [0.126, 0.157] | 0.346 [0.309, 0.406] |

## Expected-sex subgroups

| Expected sex | identities scored/total | refusal rate | AUC (95% CI) | ≥1-point pairwise (95% CI) | Spearman ρ (95% CI) |
| --- | ---: | ---: | ---: | ---: | ---: |
| f | 98/100 | 0.204 [0.159, 0.252] | 0.615 [0.437, 0.773] | 0.577 [0.494, 0.665] | 0.162 [-0.028, 0.348] |
| m | 97/99 | 0.206 [0.158, 0.257] | 0.687 [0.518, 0.822] | 0.604 [0.507, 0.696] | 0.221 [0.028, 0.408] |

## Supportable explicit editorial-demographic groups

These groups come only from the existing explicit matchmaker.html ethnicity field; nothing was inferred from images. Groups below meet the preregistered minimum of 20 scored identities and contain both primary classes.

| Editorial ethnicity field | identities scored/total | refusal rate | AUC (95% CI) | ≥1-point pairwise (95% CI) | Spearman ρ (95% CI) |
| --- | ---: | ---: | ---: | ---: | ---: |
| black | 20/22 | 0.400 [0.287, 0.523] | 0.361 [0.047, 0.786] | 0.368 [0.119, 0.695] | -0.103 [-0.591, 0.396] |
| white | 125/126 | 0.181 [0.144, 0.224] | 0.692 [0.544, 0.821] | 0.608 [0.532, 0.685] | 0.272 [0.096, 0.436] |

## Guardrails

- Candidate selection may use train and validation only. Holdout is run once after candidate and preprocessing choices are frozen.
- The primary metrics are ordering tests; a monotone display remap cannot improve them.
- Refusal and stability intervals resample identities, preserving all of each sampled identity's photos as a cluster.
- Explicit editorial ethnicity metadata is broad and not a controlled or independently verified demographic dataset; subgroup results are a pressure test only.
