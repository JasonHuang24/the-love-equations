# Stance fix red manifest — the misreading branch, frozen before the edit

2026-07-31. RED-first record for the Class A fix Jason ruled this session (fix the
misreading-overlap branch first, the AWALT special case second, as recommended in
the triage that followed `md/lab-live-crash-test-01.md`). Everything below was
measured on `main 7b02932 · clean` at analyzer 2.6.11, BEFORE any engine edit.
The crash-test report is the defect record; this is the fix's instrument record.

## The rule being shipped

`stanceFor`'s misreading branch currently enters on
`misreadingOverlap >= misreadingContradictionShare (0.36)` — a share of ALL the
misreading's tokens, most of which the misreading necessarily shares with the
entry it mis-states. Topic overlap is being read as stance agreement.

The fix adds a structural condition, no new tunable: the branch may fire only if
the passage contains **at least one token distinctive to the rejected reading** —
present in that misreading's token set and absent from every affirmative surface
of the entry (title, aliases, synopsis+category, boundary conditions). The share
threshold, the clause-scoped negation machinery, and every downstream label path
are untouched. `SCORING_CONFIG` gains no key, so `scoringConfigHash` does not move.
Scores are untouched by construction — stance is computed after scoring — so no
threshold crossing can occur and the weak-backlog ceiling (0) is not engaged.

## Red populations, frozen

**FP-54 (must stop firing):** the 54 entries that label their own synopsis
`Contradicts` — top match, High, credible band — listed in full in
`md/lab-live-crash-test-01.md`'s appendix. Plus GPT findings 1–2 verbatim
(stat-divorce restatement, share 0.50; stat-orgasm-context restatement, 0.583).

**TP (must keep firing):** every `tests/fixtures/match-behavior-benchmark.json`
case with expected stance `Contradicts` whose mechanism today is the misreading
branch — 15 cases across the misreadingPolarity / stanceComposition /
clauseMechanics / documentedLimits blocks (mp-01..03, sc-01, sc-04, sc-06, sc-07,
cm-07, cm-10, cm-12, cm-13, cm-14, bl-02, bl-03, bl-05 orbit
`frameworks:option-pool`, `frameworks:attention-market`, `hierarchy:overview`).
The negated-misreading Supports cases (mp-04, mp-06, mp-07) and the qualification/
reported-speech paths must also hold: the discriminator gates on token presence
only, so negation handling is unchanged by design — verified after the edit.

## Discriminator measurement (the reason this rule and not another)

Measured with the production tokenizer against the shipped index, before the edit:

```
FP-54  own-synopsis inputs      54/54 stop firing   0 still fire
TP     benchmark Contradicts    15/15 keep firing   0 lost
GPT-1  stat-divorce input       stops firing (share 0.50, distinctive hits: none)
GPT-2  stat-orgasm-context      stops firing (share 0.58, distinctive hits: none)
```

Perfect separation on every population available to measure. The candidate was
chosen over scope/negation reworks because it names the actual defect: the
branch's evidence never distinguished the rejected reading from the entry's own
claim vocabulary.

## The cost, named before it is paid

**4 of 588 misreading surfaces have zero distinctive tokens** — written entirely
in the entry's own vocabulary, so under the new rule the branch can never fire
for them:

```
gender-dynamics:both-sides:meeting-people-the-odds:asking-fast-filters-for-lukewarm-dates
statistics:stat-divorce
M-TBD-1
M-TBD-11
```

`stat-divorce` is GPT finding 1's entry: its misreading ("Women want most
divorces, so women also end most cohabiting and non-marital relationships") shares
every token with the entry's own synopsis — which is precisely why a correct
restatement tripped it. Someone asserting that actual misreading will no longer
get `Contradicts` from this branch (the generic contradiction-cue ladder may or
may not catch it). The remedy is canon authoring — give those four misreadings a
token the entry's own voice does not use — and it is Jason's, not this fix's.
`md/lab-face-age-match-surface.md` already measured that a misreading written in
the entry's own vocabulary buys nothing; these four are that finding's roster.

## Corpus baseline, frozen for the after-diff

Full corpus stance census (21 archived sources through the production path,
7,435 match rows; stance-labeled rows below):

```
Resembles 933 · Supports 258 · Contradicts 141 · Context only 89 ·
Challenges 16 · Extends 5
```

The release record must publish the same census after the edit, the per-row diff
count, and a score diff of exactly zero rows.

## What the fix must NOT do

- Move any score, confidence, band, or retrieval outcome anywhere.
- Change `scoringConfigHash`.
- Touch the AWALT special case (that is the second, separate commit).
- Edit any frozen fixture EXCEPT where a pinned expectation is the defect itself;
  any such edit is enumerated in the release record.
- Reword any canon page or misreading (the 4-surface cost is recorded, not fixed).
