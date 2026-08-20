# Body Calculator subjective-accuracy evaluation

Dataset: Connor Full-Body Photo Database<br>
Label: mean holistic attractiveness rating of the full person<br>
Input: `F:\Programming\The Love Equations\The Love Equations Website\data\body-connor-before.csv`<br>
SHA-256: `0de0edfcd7c93a655e518fbff5d3c45134df230751e67bbceac96134c39cb5fc`<br>
Evaluation lock: none<br>
Rows: 724 · numeric production results: 722 · refused/error/non-numeric: 2

## Evidence classification

- Independent of the shipped model: false.
- Body-specific label: false.
- Interpretation: training-contaminated/model-selection diagnostic; not a locked independent test.

## Discrimination

| instrument | n | Spearman | Pearson | top-vs-bottom quartile AUC |
| --- | ---: | ---: | ---: | ---: |
| continuous internal pipeline score (primary metric) | 722 | 0.466 | 0.354 | 0.809 |
| public half-point headline | 722 | 0.455 | 0.350 | 0.798 |
| CNN raw, model-route rows | 658 | 0.590 | 0.581 | 0.886 |

Pairwise ordering for the public half-point headline (ties receive one half):

| minimum label gap | eligible pairs | accuracy |
| ---: | ---: | ---: |
| 0 | 260237 | 0.656 |
| 5 | 208052 | 0.687 |
| 10 | 159586 | 0.716 |
| 20 | 84203 | 0.761 |
| 30 | 36713 | 0.791 |

A strictly monotone remap leaves Spearman, AUC, and pairwise ordering unchanged. Half-point quantization introduces ties and can change tie-aware metrics, but adds no attractiveness intelligence.

## Bootstrap uncertainty

Cluster bootstrap: 1000 repetitions, 453 clusters, seed 20260818.

- pairwise_gap_0: 95% CI [0.638, 0.690]
- pairwise_gap_10: 95% CI [0.690, 0.763]
- pairwise_gap_20: 95% CI [0.723, 0.821]
- pairwise_gap_30: 95% CI [0.738, 0.863]
- pairwise_gap_5: 95% CI [0.665, 0.728]
- pearson: 95% CI [0.266, 0.438]
- spearman: 95% CI [0.388, 0.538]
- top_bottom_quartile_auc: 95% CI [0.743, 0.859]

## Refusal selectivity

Refused/error/non-numeric labels: n=2, mean=50.157, range [42.364, 57.950], IDs: AF236-BF70, BF64.

- q1_lowest: 0/181 refused (0.0%); IDs: none
- q2: 0/181 refused (0.0%); IDs: none
- q3: 1/181 refused (0.6%); IDs: AF236-BF70
- q4_highest: 1/181 refused (0.6%); IDs: BF64

## Production crop padding instrumentation

Crop diagnostics were available for 0/724 rows; 0 instrumented crops extended outside the image (fraction n/a).
Padding-fraction distribution: min n/a, q25 n/a, median n/a, q75 n/a, p90 n/a, max n/a.
Refusal/error rate among instrumented outside crops was n/a (n=0); inside crops n/a (n=0).
Among finite scores, padding-versus-score Spearman was n/a; outside-minus-inside mean score was n/a.
Descriptive association only. Padding is produced by pose/framing geometry and is not randomized, so score or refusal differences are not causal evidence.
No rows contain crop diagnostics, so crop-padding incidence or effect cannot be estimated from this artifact.


## Display calibration

The descriptive in-sample label-on-display fit has intercept 7.100 and slope 4.849. This is not a locked calibration result and is not evidence of better attractiveness ordering.

## Routing and refusals

- Outcomes: refused=1, scored=723
- Instruments: cnn=658, geometry=64, none=2
- Production routes: bare→geometry=59, clothed→geometry=6, clothed→model=658, unknown=1

## Subgroup and route slices

### label_sex

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| f | 305 | no | 0.363 | 0.733 |
| m | 417 | no | 0.495 | 0.825 |

### variant

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| headswap | 271 | no | 0.483 | 0.803 |
| original | 451 | no | 0.469 | 0.795 |

### demographic_code

> Provenance: Values are unverified codes parsed from a filename token; the dataset metadata supplies no source-backed meaning. Status: not legitimate demographic ground truth and not fairness evidence.

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| A | 12 | no | 0.151 | 0.667 |
| B | 272 | no | 0.495 | 0.814 |
| W | 438 | no | 0.460 | 0.792 |

### instrument

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| cnn | 658 | no | 0.590 | 0.886 |
| geometry | 64 | no | 0.290 | 0.691 |

### framing

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| full | 711 | no | 0.487 | 0.825 |
| torso | 11 | no | -0.364 | 0.333 |

### routing

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| bare→geometry | 58 | no | 0.284 | 0.684 |
| clothed→geometry | 6 | yes | 0.143 | 0.500 |
| clothed→model | 658 | no | 0.590 | 0.886 |

### body_exposure

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| bare | 58 | no | 0.284 | 0.684 |
| clothed | 664 | no | 0.577 | 0.881 |

### framing_quality

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| clean | 689 | no | 0.511 | 0.825 |
| degraded | 1 | yes | n/a | n/a |
| override | 32 | no | 0.205 | 0.609 |

### override

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| framing | 3 | yes | -1.000 | 0.000 |
| framing+outline | 8 | yes | -0.429 | 0.000 |
| outline | 21 | no | 0.418 | 0.806 |
| unknown | 690 | no | 0.512 | 0.826 |

### gate_band

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| degraded | 11 | no | -0.364 | 0.333 |
| pass | 711 | no | 0.487 | 0.825 |

### geom_cues

| value | n | small sample | Spearman | AUC |
|---|---:|:---:|---:|---:|
| legTorso+symmetry | 26 | no | 0.552 | 0.980 |
| shoulderHip | 8 | yes | -0.429 | 0.000 |
| shoulderHip+legTorso+symmetry | 156 | no | 0.485 | 0.823 |
| vTaper | 1 | yes | n/a | n/a |
| vTaper+legTorso+symmetry | 47 | no | 0.509 | 0.806 |
| whr+vTaper+shoulderHip | 2 | yes | n/a | n/a |
| whr+vTaper+shoulderHip+legTorso+symmetry | 482 | no | 0.440 | 0.763 |

## Multi-image stability diagnostic

Identity field: `body_id`. Original and head-swap rows sharing the same body token are one cluster.

Multiple-image clusters: 133; clusters containing head-swap composites: 133. Evidence type: same pictured-body/head-swap composite clusters, not natural repeat photos, angles, or days.

This diagnostic is not general multi-photo identity stability unless dataset metadata establishes natural repeat photographs across poses, angles, sessions, or days.

## Limitations

- Labels are holistic full-person judgments, not body-specific attractiveness ground truth.
- The dataset is training/model-selection contaminated for the shipped model and is not an independent test.
- Repeated body-token clusters primarily compare originals with head-swap composites, not natural repeat photographs.
- Source-license status: no license declared in the OSF node/API inspected for this audit. Source photographs are not committed.
