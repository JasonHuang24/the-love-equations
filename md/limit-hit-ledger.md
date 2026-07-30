# LE Lab — limit-hit ledger

One line per production flag whose adjudication landed on a **documented limit** rather than on a
defect. Created empty at v2.6.0.

**What this file is for.** The `documentedLimits` block of
`tests/fixtures/match-behavior-benchmark.json` freezes seventeen cases where a reviewer would be right
and the analyzer is doing the only thing it can do — for fourteen of them, the only thing a
punctuation-approximated clause model can do; for the `morphology` three, the only thing a denylist
compared against a stemmer can do. Every one of them was written from an invented sentence — Sol's, or
this pass's. That makes them a good test and weak evidence: a sentence constructed to break a rule
proves the rule is breakable, not that anyone writes that way.

This ledger is the other kind of evidence. It records the limit families that real sources actually
hit, and how often. When one family accumulates hits on real text, that is the argument for the
decision these limits all defer — whether the Lab should parse clauses instead of approximating them.
That decision is about what this instrument *is*, and it should be made against a count, not against
an intuition that a cue list looked one word short.

**An empty ledger is a finding.** It says the limits are real and rarely reached, which is the
outcome that leaves the deterministic-and-local contract intact. Do not pad it, and do not add
invented sentences to it — those belong in the fixture block, where they are tested.

**Routing** is in `md/FEEDBACK-PIPELINE.md` §4, "When adjudication lands on a documented limit".
Briefly: if the passage is a new *shape*, it is a new fixture case rather than a ledger line; if it
is another instance of a shape already frozen, it is a line here.

**The family table below is the routing table**, and it is executable in the sense that matters:
`tests/lab-feedback-integrity.test.mjs` asserts that every `family` appearing in the fixture block is
registered here, that each row's case list matches that family's documented limits **exactly**, and
that this table registers no family no case carries. A family a fixture knows about and the routing
table does not is a flag with nowhere to go.

**The Cases column lists documented limits only — never guards.** This table routes a production hit
onto a frozen failure, and a guard is not a destination for one: it records behavior that is already
correct. So `bl-11b`, `bl-15` and `bl-19` appear nowhere below. The table was inconsistent about this
until 2026-07-29 — `window` omitted its guard, `coordination` listed one, and the new `morphology` row
copied the wrong precedent — which is what an exact-comparison test is for.

That test was written for `morphology`, which sat in the fixture from v2.6.1 and in neither this table
nor the block's own ruling. **It immediately found a second one:** `qualification`, unregistered since
v2.6.0 — this table was written from the ruling's prose list rather than from the cases, and the prose
list had never named it either. Two gaps of the same shape, both surviving a verification review, and
neither found by reading. That is the argument for the test, not for the two rows it made necessary.

---

## Ledger

| Date | Flag ID | Limit family | Fixture case | Source | Passage |
|---|---|---|---|---|---|

*No entries. The pipeline has produced no production flags yet — see `md/FEEDBACK-PIPELINE.md` §6,
where the one worked example correctly ends in nothing.*

---

## Families, and what a hit on each would mean

| Family | Cases | What repeated real-source hits would argue for |
|---|---|---|
| `coordination` | bl-08, bl-09, bl-10 | Clause boundaries at coordinating conjunctions, which needs to know whether the conjuncts share a subject — the first thing here that is genuinely grammar rather than punctuation. |
| `subordination` | bl-01, bl-07 | Subordinator scope, in both directions: a negator inside a subordinate clause, and a pre-posed concession before the assertion. |
| `appositive` | bl-13, bl-14 | A comma that introduces a modifier of the preceding noun is not a clause boundary. Narrower than the others, and the most likely to be fixable without a full parser. |
| `attribution` | bl-03, bl-05 | Named speakers and multi-level reporting chains. The risk is the opposite of the others: a rule loose enough to catch these makes every capitalised subject an attribution. |
| `quotation` | bl-02, bl-04 | Linking a quoted span to the occurrence it reports rather than to the passage. Independently valuable, and the cheapest of the clause families. |
| `qualification` | bl-06 | A qualification cue that is not subject-linked, so "but the dashboard is too simplistic" softens an equivalence asserted flatly about something else. Needs to know what the following clause is ABOUT, which is the same information `subordination` needs from the other direction — the two probably fall to one change or to neither. Registered here from 2026-07-29; it was in the fixture from v2.6.0 and in this table never, found by the test that now guards it. |
| `window` | bl-11, bl-12 | Evidence that resolves a borrowed word from an adjacent clause, or from just past the eight-token radius. The trade here is direct: widening the window re-admits exactly the cases v2.5.0 tightened it to exclude. |
| `morphology` | bl-16, bl-17, bl-18 | The denylist and the passage disagreeing about what a word is. Not a clause problem and not fixed by a parser: `payment` seeing `paying` is a stem comparison reaching too far, and `health care` seeing `caregivers` is a substring test that was never replaced. Repeated real-source hits argue for a comparison written in one representation on both sides — the same change v2.4.2 and v2.6.1 each made once and each left half-finished. The cheapest family to act on, and the only one whose members this project CREATED rather than found. |
