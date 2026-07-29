# LE Lab — limit-hit ledger

One line per production flag whose adjudication landed on a **documented limit** rather than on a
defect. Created empty at v2.6.0.

**What this file is for.** The `documentedLimits` block of
`tests/fixtures/match-behavior-benchmark.json` freezes fifteen cases where a reviewer would be right
and the analyzer is doing the only thing a punctuation-approximated clause model can do. Every one of
them was written from an invented sentence — Sol's, or this pass's. That makes them a good test and
weak evidence: a sentence constructed to break a rule proves the rule is breakable, not that anyone
writes that way.

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
| `coordination` | bl-08, bl-09, bl-10, bl-15 | Clause boundaries at coordinating conjunctions, which needs to know whether the conjuncts share a subject — the first thing here that is genuinely grammar rather than punctuation. |
| `subordination` | bl-01, bl-07 | Subordinator scope, in both directions: a negator inside a subordinate clause, and a pre-posed concession before the assertion. |
| `appositive` | bl-13, bl-14 | A comma that introduces a modifier of the preceding noun is not a clause boundary. Narrower than the others, and the most likely to be fixable without a full parser. |
| `attribution` | bl-03, bl-05 | Named speakers and multi-level reporting chains. The risk is the opposite of the others: a rule loose enough to catch these makes every capitalised subject an attribution. |
| `quotation` | bl-02, bl-04 | Linking a quoted span to the occurrence it reports rather than to the passage. Independently valuable, and the cheapest of the six. |
| `window` | bl-11, bl-12 | Evidence that resolves a borrowed word from an adjacent clause, or from just past the eight-token radius. The trade here is direct: widening the window re-admits exactly the cases v2.5.0 tightened it to exclude. |
