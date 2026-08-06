# Pressure test 06 — threshold adjudication (integration 1)

**Date:** 2026-08-06 · **Baseline:** canon `1.0.0+608b9220122a` (563), suite 18/18,
captured via `--dump` before any edit · **Final:** canon `1.0.0+79158e0f6247` (564).
Snapshot only — `tests/fixtures/threshold-neighbors.json` is the source of truth.

## Change under adjudication

One new sub-entry `frameworks:gray-divergence` (31.1, under the Stock–Flow Error)
with overlay aliases/phrases/boundaries/misreadings, plus one alias
(`walkaway wife syndrome`) and one misreading added to
`statistics:stat-demand-withdraw`. Sweep `--baseline` against the pre-change dump:
1,378 crossings — 1,085 candidateScoreFloor (census lane, recorded, not
adjudicable per `md/lab-adjudication-at-scale.md`), 290 minWeakScore, 3
minCredibleScore. 253 new rulings entered (40 crossing pairs already carried
rulings from earlier epochs; those stand).

## minCredibleScore — 3 ruled, 3 REJECT — **recommendations FLAGGED FOR JASON**

All three are the same passage shape: the Heyman & Slep crossvalidation table
header "Predicted Status Divorced Married or Living Together"
(06-heyman-crossvalidation, three occurrences) reaching
`frameworks:gray-divergence` at 0.441. Junk rows — table furniture, not prose;
the pt04 standard (tables, legends, keyword lists rejected) applies verbatim.
**REJECT ×3 recommended; final credible-line verdicts are Jason's.**

## minWeakScore — 250 new rulings (222 gain-REJECT · 12 gain-ACCEPT · 16 loss-ACCEPT)

Standard: weak = "genuinely related nearby concept" (pt04). Accepted gains:

- `frameworks:gray-divergence` ×10 — Finkel's divorce-rate-trend and
  divergence-by-education prose ("The divorce rate doubled in the 1960s and
  1970s…", "Although the divorce rate continues to climb in the least educated
  group…", "In 1974… more marriages ended in divorce than in death", "In
  1900, two thirds of American marriages ended with the death of one partner…",
  the stabilization "dark perspective" row, Figure-18 narration,
  socioeconomic-discrepancy rows ×2, the social-trends-causing-fewer-divorces
  row, and the easier-divorce-since-the-1960s row). These state the entry's
  subject — the aggregate rate as a composite whose components diverge — in a
  neighboring (education/SES) dimension.
- `statistics:stat-demand-withdraw` ×2 — Kim & Capaldi's Christensen & Heavey
  row (the demand-withdraw literature itself) and the Stanley et al.
  negative-startup/husband-refusal row.

Rejected gains (222): junk rows (the Heyman predicted-status table ×3 at the
weak line, figure captions/panel legends, reference titles, "Published in final
edited form" furniture) and vocabulary coincidences — Finkel suffocation-model
prose using marriage/divorce vocabulary without engaging rate composition,
McNulty sexual-satisfaction methods, van Lankveld, Conroy-Beam, Trent, Li,
Pew app-usage rows, AI-companion rows, and 36 ±0.001 IDF-drift crossings on
unrelated entries.

Accepted losses (16): all coincidental borderline pairs pushed under the line
by IDF dilution from canon growth — correct prunings, same class pt04/pt05
accepted.

## Verification

- 4/4 new misreadings fire Contradicts end-to-end (0.73–0.75, High), probed
  through the shipped analyzer.
- Magnet check: zero verbatim corpus occurrences of any new alias phrase
  ("gray divorce", "grey divorce", "silver splitters", "later-life divorce",
  "walkaway wife syndrome"); weak-crossing score distribution shows no
  flat-score cluster (max 6 pairs at one score).
- Demo pins: untouched, suite 18/18 green (exit 0) on the final tree.
- Census lane: 14,354 pending recorded, unchanged.
