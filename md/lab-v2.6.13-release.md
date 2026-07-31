# v2.6.13 — the AWALT ruling learns where its clause ends

2026-07-31. The second of the two stance fixes Jason ruled this session
(Class B in the crash-test triage — `md/lab-live-crash-test-01.md` §4; GPT
finding 3, and the direction half of the story in finding 10). Follows
v2.6.12 (`md/lab-v2.6.12-release.md`) as its own release, per the ruling.

## The change

The hand-adjudicated AWALT branch in `stanceFor` fired on a sentence-wide
regex — any passage matching the AWALT entry and containing
`all women / women always / women never / every woman` was stamped
`Contradicts` with "the source states that overreach directly", with no
negation scoping at all. A sentence DENYING the blanket claim ("…not an
exceptionless rule that every woman must obey") carried the same label and
rationale as one asserting it, at High confidence.

The branch now locates the blanket phrase's own clause with `misreadingScope`
— the identical machinery the misreading branch below it uses — and routes
through the identical decision grammar: qualification → Challenges; reported
speech → Contradicts on endorsement, Supports on rejection, Context only
otherwise; clause-scoped denial or rejection → Supports; plain assertion →
Contradicts, with the original rationale unchanged. The blanket regex is
hoisted to a named `AWALT_BLANKET_CUE` so the entry test and the clause
locator cannot drift apart. Release token 2.6.12 → 2.6.13 across the module
graph; no `SCORING_CONFIG` change; `scoringConfigHash` untouched.

## Verification

Probes (engine, and finding 3 re-checked on the served lab.html):

```
negated blanket   (finding 3)    Contradicts -> Supports · High 79   "denies the blanket all-women generalization"
asserted blanket  (finding 10)   Contradicts, unchanged · High 79
reported blanket                 Context only — the overreach belongs to the person quoted
reported + rejected blanket      Supports ("is false" caught as the rejection)
plain AWALT assertion            Contradicts, unchanged
```

- Suite 18/18, exit 0, zero fixture or assertion edits — including the demo
  fixture that pins `Contradicts` on a plain blanket assertion.
- Corpus census 2.6.12 → 2.6.13: **0 stance moves, 0 score moves** across all
  7,435 rows. The archived corpus is research-register prose and contains no
  negated blanket claims that reach AWALT — this fix faces live discourse, the
  register the crash-test inputs came from, not the archive.
- Self-synopsis panel unchanged: still 0 Contradicts-on-own-synopsis, outcome
  counts identical.

## Residue, unchanged by design

- **Finding 10's concept displacement stands.** AWALT still outscores the wall
  material on "Every woman hits the same dating cliff…" because its misreading
  and boundary surfaces make it a topic magnet for blanket sentences — that is
  retrieval, not stance, and it is not part of this ruling. Same shape as the
  retired AI-companion alias magnet (`md/lab-hookup-transaction-layer.md`);
  it belongs to the canon-authoring queue, not to a stance branch.
- The two remaining hand rulings in `stanceFor` (conversion-ladder,
  smv:overview) keep their sentence-wide regexes. Both fire toward `Supports`,
  so their failure mode is milder, but they carry the same scoping defect in
  principle; noted for the queue, deliberately not bundled.
