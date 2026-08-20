# Body Calculator subjective-accuracy evaluation

Dataset: Moussally et al. body-only computer-generated pictures of women<br>
Label: mean body valence from attractiveness, beauty, and harmony judgments<br>
Input: `F:\Programming\The Love Equations\The Love Equations Website\data\body-independent-before.csv`<br>
SHA-256: `561b635b520a24d771cc4bd715887ebfc5fd0130394dc246f618b2efdb4738cd`<br>
Evaluation lock: `6cc28bb1861b4441cb460e57393c3f8b6b4c0a5a2fecefcd4734c289e2aacff5` (before)<br>
Rows: 61 · numeric production results: 53 · refused/error/non-numeric: 8

## Evidence classification

- Independent of the shipped model: true.
- Body-specific label: true.
- Interpretation: The shipped CNN was trained on Connor full-body photographs, not these 61 Moussally synthetic body-only stimuli; no result from this set selected the shipped model.

## Discrimination

| instrument | n | Spearman | Pearson | top-vs-bottom quartile AUC |
| --- | ---: | ---: | ---: | ---: |
| continuous internal pipeline score (primary metric) | 53 | -0.063 | -0.099 | 0.454 |
| public half-point headline | 53 | -0.128 | -0.119 | 0.416 |
| CNN raw, model-route rows | 53 | -0.070 | -0.056 | 0.449 |

Pairwise ordering for the public half-point headline (ties receive one half):

| minimum label gap | eligible pairs | accuracy |
| ---: | ---: | ---: |
| 0 | 1376 | 0.458 |
| 0.5 | 1196 | 0.452 |
| 1 | 1018 | 0.449 |
| 2 | 782 | 0.453 |

A strictly monotone remap leaves Spearman, AUC, and pairwise ordering unchanged. Half-point quantization introduces ties and can change tie-aware metrics, but adds no attractiveness intelligence.

## Bootstrap uncertainty

Cluster bootstrap: 1000 repetitions, 53 clusters, seed 20260818.

- pairwise_gap_0: 95% CI [0.365, 0.570]
- pairwise_gap_0.5: 95% CI [0.354, 0.568]
- pairwise_gap_1: 95% CI [0.348, 0.594]
- pairwise_gap_2: 95% CI [0.359, 0.637]
- pearson: 95% CI [-0.337, 0.173]
- spearman: 95% CI [-0.342, 0.237]
- top_bottom_quartile_auc: 95% CI [0.204, 0.681]

## Refusal selectivity

Refused/error/non-numeric labels: n=8, mean=1.401, range [1.170, 1.800], IDs: H190, H200, H250, H260, H270, H280, H290, H300.

- q1_lowest: 7/16 refused (43.8%); IDs: H190, H250, H260, H270, H280, H290, H300
- q2: 1/15 refused (6.7%); IDs: H200
- q3: 0/15 refused (0.0%); IDs: none
- q4_highest: 0/15 refused (0.0%); IDs: none

## Production crop padding instrumentation

Crop diagnostics were available for 0/61 rows; 0 instrumented crops extended outside the image (fraction n/a).
Padding-fraction distribution: min n/a, q25 n/a, median n/a, q75 n/a, p90 n/a, max n/a.
Refusal/error rate among instrumented outside crops was n/a (n=0); inside crops n/a (n=0).
Among finite scores, padding-versus-score Spearman was n/a; outside-minus-inside mean score was n/a.
Descriptive association only. Padding is produced by pose/framing geometry and is not randomized, so score or refusal differences are not causal evidence.
No rows contain crop diagnostics, so crop-padding incidence or effect cannot be estimated from this artifact.


## Display calibration

The descriptive in-sample label-on-display fit has intercept 11.193 and slope -0.897. This is not a locked calibration result and is not evidence of better attractiveness ordering.

## Routing and refusals

- Outcomes: refused=8, scored=53
- Instruments: cnn=53, none=8
- Production routes: clothed→model=53, unknown=8

## Subgroup and route slices

### label_sex

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| f | 53 | no | -0.063 | 0.454 |

### variant

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| synthetic_body_only | 53 | no | -0.063 | 0.454 |

### demographic_code

> Provenance: Values are unverified codes parsed from a filename token; the dataset metadata supplies no source-backed meaning. Status: not legitimate demographic ground truth and not fairness evidence.

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| synthetic | 53 | no | -0.063 | 0.454 |

### instrument

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| cnn | 53 | no | -0.063 | 0.454 |

### framing

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| full | 53 | no | -0.063 | 0.454 |

### routing

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| clothed→model | 53 | no | -0.063 | 0.454 |

### body_exposure

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| clothed | 53 | no | -0.063 | 0.454 |

### framing_quality

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| clean | 53 | no | -0.063 | 0.454 |

### override

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| unknown | 53 | no | -0.063 | 0.454 |

### gate_band

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| pass | 53 | no | -0.063 | 0.454 |

### geom_cues

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| legTorso+symmetry | 2 | yes | n/a | n/a |
| shoulderHip+legTorso+symmetry | 2 | yes | n/a | n/a |
| whr+vTaper+shoulderHip+legTorso+symmetry | 49 | no | -0.215 | 0.314 |

## Multi-image stability diagnostic

Identity field: `body_id`. Each rendered stimulus appears once, so this set cannot measure multi-photo identity stability.

Multiple-image clusters: 0; clusters containing head-swap composites: 0. Evidence type: no scored identity has multiple images.

This diagnostic is not general multi-photo identity stability unless dataset metadata establishes natural repeat photographs across poses, angles, sessions, or days.

## Limitations

- Synthetic female-presenting bodies from one generated shape continuum do not represent natural photographic diversity.
- The dataset has no male bodies and no legitimate human demographic subgroup labels.
- Each body appears once, so it cannot estimate multi-photo identity stability.
- The body-valence aggregate is body-specific but not attractiveness-only.
