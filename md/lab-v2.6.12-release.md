# v2.6.12 — the misreading branch requires distinctive evidence

2026-07-31. The Class A stance fix, first of the two Jason ruled this session
(misreading branch first, the AWALT special case next as its own release). Red
state and instrument: `md/lab-stance-distinctive-red-manifest.md`. Defect record:
`md/lab-live-crash-test-01.md` (and `md/lab-cold-crash-test-gpt56.md` findings
1, 2, and the direction half of 8).

## The change

`stanceFor`'s misreading branch used to enter on share alone:
`misreadingOverlap >= 0.36` of ANY rejected reading's tokens — most of which the
misreading necessarily shares with the entry it mis-states, so a correct
restatement of the entry entered the branch by construction and, carrying no
negator, exited as "asserts the rejected reading" → High-confidence Contradicts.

Now entering the branch requires BOTH, per rejected reading: the same share
threshold, unchanged, AND at least one token present in that misreading and
absent from every affirmative surface of the entry (title, aliases,
synopsis+category, boundary conditions). Implemented as
`_misreadingDistinctiveSets` beside `_misreadingTokenSets` at index preparation,
a per-misreading signal in scoring, and `rawScore.misreadingAsserted` replacing
the share comparison in `stanceFor`. The alignment evidence now publishes
`misreadingDistinctiveHits` — the tokens that carried the decision, empty
whenever the branch did not run — and the diagnostics trace carries both new
fields. No `SCORING_CONFIG` key was added or changed; `scoringConfigHash` is
untouched. The clause-scoped negation, denial, qualification, and
reported-speech machinery downstream of the entry test is byte-identical.

Release token bumped 2.6.11 → 2.6.12 across lab.html and every lab module
(release audit green: all tokens agree).

## Results, against the red manifest's own predictions

**FP-54 — eliminated.** The 532-entry self-synopsis panel at 2.6.12:
**0 entries label their own synopsis Contradicts** (was 54, all top-match
High-confidence credible). Panel outcome counts are identical (376 self-matched /
150 gate-binned / 6 not-claim-like), confirming retrieval and gating untouched.
Stance on own synopsis is now: Resembles 294 · Supports 46 · Challenges 27 ·
Context only 9 · Extends 6. The 3 lost Supports are the manifest's predicted
lucky-Supports — boundary-phrasing denial cues that only fired inside the branch.

**TP — intact, zero fixture edits.** The full suite is green with no frozen
fixture, benchmark, or assertion value touched: all 15 branch-firing
expected-Contradicts cases in `tests/fixtures/match-behavior-benchmark.json`
still fire, and the negated-misreading Supports cases (mp-04/06/07), negation
parity (sc-01), qualification, and reported-speech paths all hold.

**Corpus — 109 stance moves, 0 score moves.** Full census, 21 archived sources,
7,435 match rows before and after, identical row sets:

```
score moves                          0        (score-neutral by construction, verified)
Contradicts -> Resembles            76
Contradicts -> Supports             29
Supports -> Resembles                4        (the lucky-Supports class)
Contradicts total            141 -> 36
```

Spot-checks of moved rows read correctly: the new Supports are research
sentences stating findings their entries agree with (e.g. the casual-sex motive
gap through `stat-casual-gap`, intimacy/sex findings through
`satisfaction-flywheel`) that had been labeled Contradicts by topic overlap.

**On screen** (lab.html on :8753, hard-refreshed): GPT finding 1's input now
renders `Supports · High · 78/100` and finding 2's `Supports · High · 79/100` —
same matches, same scores, direction corrected. The `stat-double-standard`
synopsis pasted verbatim renders `Supports · High · 81/100` against itself
(was Contradicts). The mp-01 misreading assertion still renders
`Contradicts · Medium · 67/100` against The Love Hierarchy.

## Costs and residue, stated

- **The 4 zero-distinctive misreading surfaces** (named in the red manifest;
  `stat-divorce` among them) cannot fire this branch until authored a token the
  entry's own voice does not use. Canon authoring, Jason's queue.
- **The surviving 36 corpus Contradicts are not certified correct.** The weakest
  surviving evidence is a single near-generic distinctive token — observed
  examples: "apps" carrying `stat-casual-gap`, "women" carrying `the-surplus`.
  Whether the distinctive-hit set should exclude GENERIC_TERMS is a real
  follow-up question; it was deliberately not bundled here (one ruled change per
  release, and the measured goal — the false-Contradicts class — is met without
  it).
- Findings 3 and 10 (the AWALT branch) are untouched by design; next release.
- The under-fire side (finding 9, the 80/20 Supports probe) is also untouched:
  this release narrows when the branch may claim "asserts the rejected reading";
  it does not widen what the branch can catch.

## Verification

- `npm run test:lab` on the working tree: 18/18, exit 0.
- The exact committed snapshot (HEAD + staged patch, without the concurrent
  session's unstaged UI work) verified green in an isolated scratchpad clone:
  18/18, exit 0, with the threshold-neighbors corpus assertion SKIPPED there
  (corpus absent in the clone by design) — that assertion ran un-skipped and
  green on the main tree.
- Shared-tree hygiene: the concurrent debt-cleanup session's uncommitted
  research-card work (js/lab-app.js, lab.html, css/lab.css, tools/lab_ui_audit.py)
  was left unstaged; the two shared files were staged hunk-by-hunk and the staged
  diff verified to contain only this release's token lines.
