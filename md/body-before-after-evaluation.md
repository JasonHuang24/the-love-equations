# Body Calculator frozen-before versus final-after evaluation

## Result

The final pipeline did not demonstrate a registered meaningful gain in independent subjective-attractiveness discrimination; any accepted changes are reliability or consistency improvements.

Engineering reliability and capture consistency are distinct from better ranking against independent human judgments. The primary comparison below uses identical rows accepted by both snapshots and the continuous internal score. Public half-point metrics are reported separately because display quantization introduces ties.

| Metric | Frozen before | Final after | After − before |
|---|---:|---:|---:|
| Accepted identical rows | 53 | 53 | 0 |
| Spearman | -0.06268 | -0.06268 | 0.00000 |
| Pearson | -0.09868 | -0.09868 | 0.00000 |
| Top-vs-bottom-quartile AUC | 0.45408 | 0.45408 | 0.00000 |

Frozen refusal rate: 13.1%; final refusal rate: 13.1%; change: +0.0%.

## Paired uncertainty

Bootstrap: 1000 repetitions, 53 identity clusters, seed 20260818.
- pairwise_0: [0.00000, 0.00000]
- pairwise_0.5: [0.00000, 0.00000]
- pairwise_1: [0.00000, 0.00000]
- pairwise_2: [0.00000, 0.00000]
- pearson: [0.00000, 0.00000]
- spearman: [0.00000, 0.00000]
- top_bottom_quartile_auc: [0.00000, 0.00000]

## Interpretation

A strictly monotone calibration/display remap cannot improve Spearman, AUC, or pairwise ordering. Any reliability gain without a locked discrimination gain must be described as better capture, preprocessing, routing, persistence, or consistency—not better attractiveness intelligence.

This holdout is body-specific but narrow: synthetic female bodies on one controlled shape continuum, with a Valence M label averaging attractiveness, beauty, and harmony. It cannot authorize a broad model replacement across sexes, clothing, bare torsos, real backgrounds, poses, cameras, or demographics.

## Provenance

Exact commands and SHA-256 bindings for both CSVs, both batch metadata files, the manifest, model, page snapshots, evaluator lock, and this comparison tool are recorded in the JSON artifact.
