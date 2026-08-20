# Locked Body preprocessing candidate

## Decision

The preregistered training-style full-image black-letterbox candidate passed the narrow metric screen on the 53 production-accepted rows of the independent synthetic-female set. It is **not approved for production**. The locked scope requires broader clothed/bare and male/female body-specific evidence, and the one-time accuracy run did not itself evaluate transform stability.

This is a preprocessing candidate, not a calibration remap. It changes pixels presented to the CNN and therefore can change ordering. A monotone percentile or display remap still cannot improve Spearman correlation, AUC, or pairwise ordering.

## One-time locked result

| Measure | Frozen production pose crop | Full-image letterbox | Paired change | 95% paired bootstrap CI |
|---|---:|---:|---:|---:|
| CNN-raw Spearman | −0.06975 | 0.51675 | +0.58650 | [0.36329, 0.83409] |
| Top-vs-bottom-quartile AUC | 0.44898 | 0.87245 | +0.42347 | [0.16837, 0.68583] |
| CNN-raw pairwise accuracy, label gap 0 | 0.46294 | 0.70058 | +0.23765 | [0.15750, 0.32864] |
| CNN-raw pairwise accuracy, label gap 0.5 | 0.45318 | 0.72575 | +0.27258 | [0.18309, 0.37099] |
| CNN-raw pairwise accuracy, label gap 1 | 0.46267 | 0.74558 | +0.28291 | [0.16475, 0.40707] |
| CNN-raw pairwise accuracy, label gap 2 | 0.49105 | 0.77749 | +0.28645 | [0.14393, 0.44296] |

With the existing display mapping, the candidate's continuous Spearman remained 0.51675, while public half-point quantization reduced it to 0.19307 by introducing many ties. This is why the report keeps continuous internal ordering separate from the public display.

## Provenance

- Candidate lock SHA-256: `4c67cacbc32386b27b034f0954052252c1180d1a81d3e2c6b17885294c7599e1`
- Parent evaluation lock SHA-256: `6cc28bb1861b4441cb460e57393c3f8b6b4c0a5a2fecefcd4734c289e2aacff5`
- Canonical JSON SHA-256: `e8baaec65b83cf3be74e0868875b690325f2a8cfde520f1c67983127eb99340b`
- Paired-row CSV SHA-256: `1aed57d308e36a09174f3f06940e60cb27c5fb5ae4c2497f0d1c2b1f9aac84e7`
- Model SHA-256: `6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2`
- Independent manifest SHA-256: `c9c5717fa3f866ec8e5f5d3143dadcc5d1ca5fe43d8305420b24b431967c00be`
- Bootstrap: 1,000 identity-cluster repetitions, seed 20260818.

The independent set is body-specific but narrow: 61 synthetic female stimuli on one shape continuum, with 53 rows accepted by the frozen CNN route. Its Valence M label averages attractiveness, beauty, and harmony; it is not an attractiveness-only judgment. Source photos were read from an external cache and are not committed.
