# Pressure test 06 — threshold adjudication (integrations 1 and 2)

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

# Integration 2 — the scout's two proposals, folded

**Date:** 2026-08-06 · **Baseline:** canon `1.0.0+79158e0f6247` (564), fresh
`--dump` before any edit · **Final:** canon `1.0.0+c4f092f8c7d3` (566).

## Change under adjudication

Two sub-entries folded from ChatGPT's closed proposals after independent
verification at source (Rochadiat 2020 via Crossref; Adda, Pinotti & Tura's
40%/20% verbatim from the RePEc abstract; Chang's N = 64,972 verbatim from the
Crossref abstract; Statham & Sunanta 2026 confirmed): **17.3 The Delegation
Boundary** (under the Third-Party Layer) and **35.1 The Border Bundle** (under
the Local Market), each with overlay aliases/phrases/boundaries/misreadings.

## The demo pin that tripped, and the authored-surface remedy

The volcanic-ash negative-control probe mapped to `frameworks:border-bundle`
at 0.486 — my sub-note prose used "says … says" and "a new social network,"
colliding with the probe's "A new claim says…" template. Reworded the
sub-note (never the pin); the probe returned to unmapped and no test value
moved. A second over-reach surfaced in the sweep: the 8-token Finkel passage
"He also has to be your only romantic partner." scored 0.608 credible on BOTH
new entries — the short-unit coverage effect on the token pair
romantic+partner, which both entries carried across their surfaces. Remedy:
reworded P1's first misreading (dropped "partner") and P2's boundary text
(dropped "romantic"); both pairs fell below every line. Re-swept after each
edit — misreading and boundary text is live match surface.

## minCredibleScore — 7 ruled — **recommendations FLAGGED FOR JASON**

5 gain-REJECT: Finkel suffocation-model prose (0.475) and a junk
attribution row (0.441) on `border-bundle`; a Kim methods row
("Relationship status was assessed by separation at T2", 0.443) on
`border-bundle`; a Common Sense AI-companion parenting row (0.464) on
`delegation-boundary` (companions are a different mechanism from proxy
courtship); a Wheatley fragment (0.430) on an unrelated gender-dynamics
entry. 2 loss-ACCEPT: coincidental borderline pairs pruned by IDF dilution.
(A sixth gain — Pew's Tinder-share row onto `stat-pay-to-play` — already
carried a ruling from an earlier epoch and stands.)

## minWeakScore — 220 new rulings (190 gain-REJECT · 30 loss-ACCEPT)

Zero weak gains accepted, and that is the honest result: the corpus contains
no delegation-in-courtship or cross-border-pairing prose — every gain is a
vocabulary coincidence (marriage/partner/relationship academic prose, AI-
companion rows against the delegation entry — substitute partner, not proxy),
junk (reference titles, Dutch questionnaire items, attribution lines), or
methods boilerplate. The corpus's only genuinely-adjacent passage (Trent's
migration × marriage-markets future-work sentence) crosses only the census
floor at 0.172. All 30 losses are correct prunings. 66 crossing pairs already
carried rulings from earlier epochs and stand.

## Verification

- 6/6 new misreadings fire Contradicts end-to-end (0.73–0.80, High).
- Magnet check: every new alias phrase has 0 verbatim corpus occurrences
  except "marriage migration" (3 — one future-work sentence, two reference
  citations in Trent; no magnet shape).
- Suite 18/18 (exit 0) on the final tree; census lane 14,354, unchanged.
