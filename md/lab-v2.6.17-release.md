# LE Lab v2.6.17 -- concept admission guards from the media false-mapping pass

**Released 2026-07-31.** This release is the false-mapping pass over the ten-source
media loop recorded in `md/doctrine-media-loop-03.md`. It changes mapping admission,
not relationship doctrine: topic overlap is no longer enough to make a credible
mapping for 21 concepts whose defining axis can be named and tested.

## The measured defect

The shipped v2.6.16 analyzer processed 246 claim-like passages and displayed 76
credible mappings. Human review ruled 45 correct and 31 false positives, with the
false mappings concentrated in 22 passages. The recurring failure was structural:
generic prose shared enough title, synopsis, or research-register vocabulary with a
canon entry to clear `minCredibleScore`, even though the passage never stated the
concept's defining idea.

Examples included "years of marriage" reaching the age-at-first-marriage statistic,
a generic mention of sexual satisfaction reaching the bidirectional Satisfaction
Flywheel, and relationship-quality prose reaching Living Apart Together without a
separate-household claim.

The red state was frozen first in commit `a1ff60e`: 22 copyright-safe paraphrase
cases carrying 31 `absentCanonIds` assertions in
`tests/fixtures/canon-mapping-benchmark.json`. The benchmark runner was also
corrected to use the shipped `analyzeDocument` gate decision, so a named-canon
passage cannot be declared gated out by a separate preflight classifier call.

## The rule that shipped

`CONCEPT_ADMISSION_GUARDS` names the central semantic anchor for each of the 21
implicated canon entries. A guard:

- never retrieves an entry;
- never adds score;
- never changes a scoring threshold;
- only refuses credible admission for its own entry when the anchor is absent; and
- publishes `{ required, passed, label }` as
  `diagnostics.claimUnits[].candidates[].admission.semanticGuard`.

Exact lexical evidence remains subject to this semantic check. "Exact" describes the
surface match, not whether the source asserted the same concept.

One canon authoring defect was fixed beside the analyzer rule:
`sexual satisfaction` was removed as an exact phrase for Satisfaction Flywheel.
A generic mention of the outcome is not evidence for the flywheel's bidirectional
claim; the remaining phrase and guard require reciprocal, predictive, feedback-loop,
or frequency-of-sex evidence.

The Lab analyzer and cache-buster release moved 2.6.16 to 2.6.17. The scoring
configuration is byte-identical: `scoringConfigHash = bt0a7p`. The rebuilt canon is
`1.0.0+93e06ff160d9`.

## Alternatives measured and rejected

Broad research/prose-token suppression removed some false positives but also lost
eight adjudicated-correct mappings and created eight new mappings through reranking.
It was rejected. A contraction/stopword experiment likewise caused reranking and new
false mappings. Neither entered the tree.

That comparison is the doctrine of this pass: when the error belongs to a concept's
missing discriminator, repair admission at that concept. Global vocabulary surgery
is not a substitute for meaning and can move unrelated entries.

## Results

The ten sources were reacquired and replayed through the shipped v2.6.17 analyzer and
the rebuilt canon:

| Measure | v2.6.16 reviewed | v2.6.17 |
|---|---:|---:|
| Displayed credible mappings | 76 | 45 |
| Adjudicated false mappings remaining | 31 | 0 |
| Adjudicated correct mappings retained | 45 | 45 |
| New mappings relative to the reviewed set | -- | 0 |

The full threshold census covered 2,426 passages x 540 entries = 1,310,040 pairs
(435,363 at or above the 0.02 dump floor). The threshold-neighbor fixture had still
named a stale 2,452-passage population, so it was regenerated for this corpus and
canon: 117,857 near-threshold pairs, 5,756 carried rulings, zero credible blockers,
zero weak-line backlog, and 5,009 candidate-floor census rows. No threshold was
retuned.

Verification:

- focused analyzer and canon-mapping benchmark: green;
- canon-index validation: 540 concepts across 19 sources, green;
- `npm run test:all`: 18/18 Lab steps, SMV panel, and matchmaker verification green;
- Lab release, UI, and site-integrity audits: green.

Raw article bodies were held only in temporary storage for the replay and deleted
after hashes and aggregate measurements were recorded. No media source text entered
the repository.

## Cost and limit

These guards are deterministic, concept-specific admission rules derived from an
observed media population. They are not an open-world semantic model, and future
false mappings should still travel through the flag, adjudicate, freeze, then fix
pipeline. A refused candidate may remain visible in the opt-in diagnostic trace or
weak-neighbor machinery; the rule governs credible doctrine mapping.

The Satisfaction Flywheel no longer maps from the bare phrase "sexual satisfaction."
That recall loss is intentional: a source must state the flywheel's bidirectional or
feedback claim, not merely name one outcome.
