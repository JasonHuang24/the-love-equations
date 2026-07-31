# Capture-quality audit — population layer & sex-ratio batches

**Date:** 2026-07-31 · **Canon:** 488 · **Analyzer:** 2.6.10 · read-only, no entries changed
**Prompted by:** `md/lab-hookup-transaction-layer.md` §6, which found that the Substitution
Layer's `"AI companion"` alias was buying capture *count* rather than coverage, and recommended
the same audit be run against the batches that had not had one.

Six entries audited: `stock-flow-error`, `residual-pool`, `clearing-order` (population layer,
`b08f6d3`) and `sex-ratio`, `local-market`, `effective-ratio` (sex-ratio batch).

**Headline: neither batch contains a topic magnet.** The defect found in my own batch does not
repeat here. But the audit surfaced two other pathologies, and one of them is systemic and
larger than anything in either batch.

---

## 1. No magnets — and how that was established

The magnet signature is many captures at ~one distinct score with a wide margin over unrelated
runners-up. Measured:

| Entry | Captures | Distinct scores | Median margin | Verdict |
| --- | --- | --- | --- | --- |
| `sex-ratio` | 114 | **7** | 0.035 | dense but genuine |
| `clearing-order` | 4 | 2 | 0.208 | junk-heavy, see §3 |
| `stock-flow-error` | 2 | 2 | 0.169 | healthy shape |
| `residual-pool` | 1 | 1 | 0.004 | healthy shape, barely reaching |
| `local-market` | 0 | — | — | crowded out, see §2 |
| `effective-ratio` | 0 | — | — | crowded out, see §2 |

`sex-ratio`'s 114 captures are the one number that *looks* like my defect and is not. Seven
distinct scores, a small median margin, and the captures come almost entirely from
`17-trent-south-sex-ratios` — a paper literally about sex ratios. Dense capture of an
on-topic source is what a correct entry looks like. Compare the defect it was checked against:
125 captures, **one** distinct score, 0.226 median margin, on passages about a teen suicide.

## 2. Intra-batch crowding — the parent entry eats its own sub-concepts

`local-market` and `effective-ratio` have **zero** top-slot captures. Reachability analysis
shows why, and it is not that they never score:

| Entry | Appears | Mapped | Top-slot | Most often beaten by |
| --- | --- | --- | --- | --- |
| `effective-ratio` | 69 | 3 | 2 | **The Sex Ratio (60)** |
| `local-market` | 35 | 1 | 3 | **The Sex Ratio (20)** |

Both are reachable and both lose, overwhelmingly, to their own batch-mate. A parent concept and
its two refinements share vocabulary, so the parent — carrying the broadest surface — takes the
top slot nearly every time. The refinements are not dark; they are *shadowed*.

Worse, **the best-ever capture for each is non-claim text**:

- `local-market` best = **0.554** on a regression equation:
  `"where H is husband's education (… = 1, …, 6), W is wife's education …"`
- `effective-ratio` best = **0.469** on a section heading: `"Sex Ratios in China"`

So their strongest evidence anywhere in the corpus is a formula and a title. Their genuine
reach is weaker than even the zero-capture figure suggests.

That same regression equation is simultaneously the best-ever capture for `clearing-order`, at
an identical 0.554 — the two entries tie on it exactly (margin 0.000). One garbage passage is
the top evidence for two entries in two different batches.

**This is a recommendation, not a change** — these are another session's entries. If the intent
is for the refinements to be independently retrievable, they need surfaces the parent does not
share. If the intent is for `sex-ratio` to be the retrieval front door with the other two read
as sub-sections, the current state is already correct and the finding is just documentation.

## 3. Non-claim captures, measured against a baseline

A junk rate is meaningless without knowing the corpus's own rate, so that was measured first.

**Corpus baseline: 77 of 790 mapped top-slots (9.7%) are non-claim text** — headings,
equations, citations, numeric fragments. Roughly one in ten, across the whole canon.

Against that baseline:

- `clearing-order` — **2 of 4 (50%)**, above 2× baseline. The two are the regression equation
  and the chart axis label `"Never Married Previously Married Married 100"`. Flagged, but n = 4
  is far too small to call a rate; the direction is what matters, not the percentage.
- `sex-ratio` — 8 of 114 (7%), **below** baseline. Most of those eight are false flags from the
  detector used here (sentences like `"the coefficient for the sex ratio (b = .021)"` contain
  `=` but are genuine claims). Its one real non-claim capture is the heading in §4.
- Everything else — 0 non-claim captures.

## 4. The systemic finding: the product maps units the claim detector rejected

`sex-ratio`'s single highest score anywhere in the corpus is **0.710, High confidence**, on the
four-word heading `"Sex Ratios in China"` — a unit the claim detector scored at
`claimLikelihood: 0.16` and marked **`isClaimLike: false`**.

That should not be able to happen, on the codebase's own stated assumption.
`tools/lab-threshold-sweep.mjs:153` justifies excluding non-claim units from the sweep like this:

> A unit the claim detector rejected is never mapped: analyzeDocument builds segments for
> claim-like units only, so retrieval never runs on it and any score this tool prints for it is
> measuring nothing.

**That is not what the shipped analyzer does.** Measured across the corpus:

```
segments built:              2515
  of which NOT claim-like:    107
mapped top-slots:             790
  on NON-claim-like units:     23  (2.9%)
  of those, High confidence:    7
```

Examples, none of them from the audited batches:

| Score | Conf | Entry | Unit |
| --- | --- | --- | --- |
| 0.743 | High | Mate Retention Intensity | `"Mate retention behavior."` |
| 0.741 | High | The Desire-Maintenance Split | `"Attachment-Related Relational Needs"` |
| 0.718 | High | The Satisfaction Flywheel | `"Sexual Satisfaction"` |
| 0.701 | High | Mate Retention Intensity | `"Mate guarding"` |
| 0.697 | High | The Desire-Maintenance Split | `"Sexual Desire"` |

The pattern is self-fulfilling and worth stating plainly: these entries were *authored from*
these papers, so the papers' **section headings** are near-exact matches for the canon titles and
aliases derived from them. A heading is the highest-precision possible lexical match and carries
no claim at all. The result is a cluster of High-confidence mappings onto table-of-contents
entries.

Two consequences:

1. **A reader-facing defect.** Seven High-confidence mappings in the archived corpus are
   headings. Whatever the Lab reports about them, it is not analysis of a claim.
2. **The sweep and the product disagree about the population.** The sweep excludes all 107
   non-claim units on the ground that retrieval never runs on them. It does run on them, and
   maps 23. So those pairs are invisible to every threshold sweep, every frozen band, and every
   adjudication sheet produced so far — including all four of mine.

**Not fixed here, deliberately.** The candidate fixes — having `analyzeDocument` skip non-claim
units, or widening the sweep to include them — are both behaviour changes to shipped retrieval
with governance implications, and three sessions are working in this tree. This is a defect
report. The enumerate-before-you-fix discipline says the next step is to enumerate all 23 pairs
and decide which of the two artifacts is wrong, before either is changed.

### 4b. Resolved at v2.6.11 — and it was neither of the two candidate fixes

Enumerating the 23 killed both candidates at once. **All 23 carry the stance `Context only`**,
which is not an accident: `stanceFor` has an explicit `!unit.isClaimLike` branch. The analyzer
was never treating these as claims, so "make `analyzeDocument` skip them" would have deleted a
deliberate feature and left the stance branch dead. And the sweep's skip is a defensible *scope*
choice, so "widen the sweep" was not indicated either.

The actual defect was one line below the disagreement, in scoring. Of 788 mapped top-slots, 14
sat on units under `shortUnitWordCount` — and 13 of those 14 were non-claim. The short-unit
penalty that should have caught them was exempting `exactLexicalHit || signatureHits.length`,
an exemption written for the two *overlap* penalties beside it and applied to this one by
grouping. Precision does not answer length, and on short text they correlate backwards: a
three-word heading that is the canon title matches at 100% by construction, so the exemption
fired hardest exactly where the passage was least able to carry a reading.

Dropping the exemption outright was the first attempt and it was **too broad** — it failed
`ta-01`, where `"Hypergamy shapes modern dating."` is four words and *is* a claim. The line is
the one the claim detector already draws: a label names a topic, a short assertion asserts one.
The exemption now survives, conditioned on `isClaimLike`.

Result: the seven High-confidence heading mappings are gone — **zero** non-claim mappings are
now High (9 Medium, 12 Low), and half the short ones drop out of credible entirely.

**The finding that outlives the fix:** the sweep could not have caught this. It skips non-claim
units, and the exemption had *never once fired on a claim-like unit in the corpus* — **0 of
1,188,070 swept pairs move**. So no threshold shifts, no frozen band changes, and there is
nothing to adjudicate. A scoring defect lived for months inside the blind spot of the instrument
built to catch scoring defects, because the instrument's exclusion and the defect's habitat were
the same set. When a tool narrows its population, the excluded region is not merely unmeasured —
it is where defects accumulate.

`tools/lab-threshold-sweep.mjs` keeps the skip, but its comment no longer justifies it with the
two false claims this audit caught (that retrieval never runs on such units, and that they could
never reach a reader). It now states the scope choice and names the residual.

## 5. What was and was not done

Read-only throughout: no canon entry, overlay, page, threshold band, or test was modified. The
scripts live in the session scratchpad rather than `tools/`, because a one-off audit harness
that nobody maintains is exactly the second-artifact-that-can-disagree problem the sweep tool's
own header warns about — the numbers above were all produced by importing the shipped analyzer.

**Open items handed on:**

1. `local-market` / `effective-ratio` shadowed by `sex-ratio` — owner's call whether that is
   intended (§2).
2. `clearing-order`'s two non-claim captures, one of which it ties with `local-market` (§2, §3).
3. ~~**The claim-detector/mapping disagreement (§4)**~~ — **CLOSED at v2.6.11**, see §4b. The
   disagreement was real but was not itself the defect; it was hiding a scoring bug in the
   short-unit penalty's exemption. Fixed there. The sweep's population choice stands, with the
   residual now stated in the tool rather than justified by a false premise.
