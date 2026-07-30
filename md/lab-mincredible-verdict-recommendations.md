# minCredibleScore — recommended verdicts for the 29 outstanding crossings

**These are recommendations. The ruling is Jason's.** Nothing in
`tests/fixtures/threshold-neighbors.json` was stamped to produce this document;
it assembles the evidence beside each crossing so each can be approved or
overturned in one pass instead of across five adjudication sheets.

## Why only these 29

The fixture holds **3744 PENDING rulings**: 3368 at
`candidateScoreFloor`, 347 at `minWeakScore`, and these 29 at
`minCredibleScore`. Only the last group changes what a reader is **shown** — the
other two move what enters the candidate set and the weak band, both inspectable
but never displayed as a mapping. So this is the rulable set.

Every row was resolved against the real corpus passage and re-checked through the
**full analyzer on the whole source document**, with display caps and stance
applied — not by re-scoring the sentence in isolation, which re-segments it and
gives different numbers (`stat-app-reasons` scores 0.422 in document and 0.438
standalone). The "reaches the reader" column is therefore the reader's actual
outcome, which is a different question from the retrieval crossing.

## Recommendation in one line

**ACCEPT all 29**, in four groups with genuinely different reasons — plus two
follow-ups that are not threshold questions and should not be ruled as if they
were.

| group | rows | what they are | recommendation |
|---|---|---|---|
| A | 20 | doctrine reaching the essays it was written from | ACCEPT |
| B | 3 | a section heading the sweep scored as a passage | ACCEPT as harmless — **and fix the instrument** |
| C | 1 | a +0.001 IDF drift | ACCEPT |
| D | 5 | the losses | ACCEPT — the reader loses nothing in any of them |

---

## Group A — 20 rows: the doctrine landing where it was aimed

Every row is a gain to a credible, **displayed** match, 19 of them from a prior score
of exactly **0.000**, and every one is on `02-fem-centrism` or
`04-heteropessimism` — the two archived sources this session's doctrine was
written from. The entries are `operative-frame`, `the feminine imperative`,
`the male imperative`, `the feminine reality`, `the locus-of-control shift`,
`heteropessimism` and `MGTOW`.

A 0.000 means the pair was not in the candidate set at all: the passage was being
discarded by the gate, or the concept did not exist. Both causes were addressed
deliberately and with their costs measured (`ab62871`, `4b7b1a9`, `ca6dab2`).
There is no reading of ACCEPT under which a concept written from an essay should
not match that essay.

| # | entry | passage | before → after | reaches the reader | rec |
|---|---|---|---|---|---|
| 1 | `lexicon:term-mgtow`<br>MGTOW | 04-heteropessimism · 28<br>“The most zealous male heteropessimists—so committed that they are mocked by other male-supremaci…” | 0.265 → 0.645 | **displayed** rank 1 @ 0.645 · Resembles | **ACCEPT** |
| | | The largest single move in the set, and the most interesting. The passage is about men who act on heteropessimism by actually withdrawing; MGTOW is the site’s entry for exit-as-ideology. The canon connected a mainstream-register term to its manosphere counterpart without being told to. | | | |
| 2 | `frameworks:operative-frame`<br>The Operative Frame | 02-fem-centrism · 1<br>“Across ethnicities, and encompassing all manner of social diversity, this influence is so insatu…” | 0.000 → 0.575 | **displayed** rank 1 @ 0.575 · Resembles | **ACCEPT** |
| 3 | `lexicon:term-the-operative-frame`<br>The Operative Frame | 02-fem-centrism · 1<br>“Across ethnicities, and encompassing all manner of social diversity, this influence is so insatu…” | 0.000 → 0.575 | **displayed** rank 2 @ 0.575 · Resembles | **ACCEPT** |
| 4 | `frameworks:operative-frame`<br>The Operative Frame | 02-fem-centrism · 3<br>“However, the point is that the operative framework, the reality we function in, is defined by th…” | 0.000 → 0.575 | **displayed** rank 1 @ 0.575 · Resembles | **ACCEPT** |
| 5 | `lexicon:term-the-operative-frame`<br>The Operative Frame | 02-fem-centrism · 3<br>“However, the point is that the operative framework, the reality we function in, is defined by th…” | 0.000 → 0.575 | **displayed** rank 2 @ 0.575 · Resembles | **ACCEPT** |
| 6 | `lexicon:term-the-feminine-imperative`<br>The feminine imperative | 02-fem-centrism · 10<br>“Publicly and privately, not even an afterthought was spared for the woman’s motivation and despe…” | 0.000 → 0.575 | **displayed** rank 1 @ 0.575 · Resembles | **ACCEPT** |
| 7 | `lexicon:term-the-feminine-reality`<br>The feminine reality | 02-fem-centrism · 18<br>“Whether in the developing world or in first world nations, the onus of directing the course of h…” | 0.000 → 0.575 | **displayed** rank 1 @ 0.575 · Resembles | **ACCEPT** |
| 8 | `lexicon:term-the-male-imperative`<br>The male imperative | 02-fem-centrism · 2<br>“I realize this is a tough pill to swallow, because the male imperative does in fact intersect wi…” | 0.000 → 0.575 | **displayed** rank 1 @ 0.575 · Resembles | **ACCEPT** |
| 9 | `lexicon:term-the-feminine-imperative`<br>The feminine imperative | 02-fem-centrism · 15<br>“The threat that male contraception represents to the feminine imperative is one of controlling t…” | 0.000 → 0.575 | **displayed** rank 1 @ 0.575 · Resembles | **ACCEPT** |
| 10 | `frameworks:operative-frame`<br>The Operative Frame | 02-fem-centrism · 17<br>“Once feminine-exclusive birth control was convenient and available the locus of control switched…” | 0.000 → 0.540 | **displayed** rank 1 @ 0.54 · Resembles | **ACCEPT** |
| 11 | `frameworks:operative-frame`<br>The Operative Frame | 02-fem-centrism · 10<br>“Publicly and privately, not even an afterthought was spared for the woman’s motivation and despe…” | 0.000 → 0.540 | **displayed** rank 2 @ 0.54 · Resembles | **ACCEPT** |
| 12 | `lexicon:term-the-feminine-reality`<br>The feminine reality | 02-fem-centrism · 13<br>“While that may have some merit I would argue that the perpetuation of this notion better serves …” | 0.000 → 0.540 | **displayed** rank 1 @ 0.54 · Resembles | **ACCEPT** |
| 13 | `lexicon:term-heteropessimism`<br>Heteropessimism | 04-heteropessimism · 10<br>“As is fairly common in straight culture, a negative trait like obsessive jealousy—which in reali…” | 0.000 → 0.540 | **displayed** rank 1 @ 0.54 · Resembles | **ACCEPT** |
| 14 | `lexicon:term-heteropessimism`<br>Heteropessimism | 04-heteropessimism · 14<br>“Heteropessimism’s anesthetic effect is especially seductive because it dissociates women from th…” | 0.000 → 0.540 | **displayed** rank 1 @ 0.54 · Resembles | **ACCEPT** |
| 15 | `frameworks:operative-frame`<br>The Operative Frame | 02-fem-centrism · 2<br>“I realize this is a tough pill to swallow, because the male imperative does in fact intersect wi…” | 0.000 → 0.540 | **displayed** rank 2 @ 0.54 · Resembles | **ACCEPT** |
| 16 | `frameworks:operative-frame`<br>The Operative Frame | 02-fem-centrism · 15<br>“The threat that male contraception represents to the feminine imperative is one of controlling t…” | 0.000 → 0.540 | **displayed** rank 2 @ 0.54 · Resembles | **ACCEPT** |
| 17 | `lexicon:term-the-locus-of-control-shift`<br>The locus-of-control shift | 02-fem-centrism · 17<br>“Once feminine-exclusive birth control was convenient and available the locus of control switched…” | 0.000 → 0.523 | **displayed** rank 2 @ 0.52 · Resembles | **ACCEPT** |
| | | Displays at rank 2 (0.520) behind `frameworks:operative-frame` (0.540) on the birth-control sentence. Arguably the APTER of the two — that entry is specifically about reliable contraception from 1960 moving leverage. Both display, so this is an ordering observation rather than a threshold one; noted so it is not mistaken for a miss. | | | |
| 18 | `lexicon:term-the-feminine-reality`<br>The feminine reality | 02-fem-centrism · 3<br>“However, the point is that the operative framework, the reality we function in, is defined by th…” | 0.000 → 0.495 | **displayed** rank 3 @ 0.495 · Resembles | **ACCEPT** |
| 22 | `lexicon:term-heteropessimism`<br>Heteropessimism | 04-heteropessimism · 28<br>“The most zealous male heteropessimists—so committed that they are mocked by other male-supremaci…” | 0.000 → 0.448 | **displayed** rank 2 @ 0.448 · Resembles | **ACCEPT** |
| 23 | `lexicon:term-heteropessimism`<br>Heteropessimism | 04-heteropessimism · 13<br>“In this sense, heteropessimism is, to borrow Lee Edelman’s phrase, an “anesthetic feeling”: “a f…” | 0.000 → 0.435 | **displayed** rank 1 @ 0.435 · Resembles | **ACCEPT** |

---

## Group B — 3 rows: not a ruling anyone should have been asked to make

All three are the same "passage": `01-pew-online-dating · 63`, whose full text is
the two words **“Online Dating”**. It is a section heading.

The analyzer already knows this. The unit carries `isClaimLike: false` and
`claimLikelihood: 0`, and nothing displays for it — one of the three sits in the
weak band and two are not in either band. The crossings are an artifact of length:
a two-token passage has almost no query weight, so any shared token produces a
large coverage ratio.

The defect is in the **instrument**, not the analyzer. `loadPassages` in
`tools/lab-threshold-sweep.mjs` filters its population on
`domainRelevance.status === 'irrelevant'` only, so it scores units the analyzer
would never map. Two of the 120 retained "passages" are headings
(“Online Dating”, “Romance & Dating”).

**Recommended: ACCEPT** — the new side is not wrong so much as meaningless, and a
REJECT would mint a fixture pinning a non-claim's score. **Then add
`isClaimLike` to that filter**, which removes this whole class from every future
sheet rather than adjudicating it again.

| # | entry | passage | before → after | reaches the reader | rec |
|---|---|---|---|---|---|
| 19 | `statistics:stat-couples-meet`<br>Online displaced everyone else | 01-pew-online-dating · 63<br>“Online Dating” | 0.161 → 0.493 | weak only | **ACCEPT** |
| 20 | `deep-dive:third-spaces`<br>Third Spaces | 01-pew-online-dating · 63<br>“Online Dating” | 0.096 → 0.477 | not in either band | **ACCEPT** |
| 21 | `statistics:stat-orgasm-context`<br>Women's odds of orgasm: casual vs. committed | 01-pew-online-dating · 63<br>“Online Dating” | 0.150 → 0.471 | not in either band | **ACCEPT** |

---

## Group C — 1 row: drift, not behaviour

| # | entry | passage | before → after | reaches the reader | rec |
|---|---|---|---|---|---|
| 24 | `statistics:stat-pay-to-play`<br>Pay-to-play: who buys reach, and what it buys | 01-pew-online-dating · 36<br>“Around six-in-ten paid users (58%) say their personal experiences with dating sites or apps have…” | 0.429 → 0.430 | **displayed** rank 1 @ 0.431 · Supports | **ACCEPT** |
| | | A +0.001 crossing — IDF drift from a canon that grew by six entries, not a behaviour change. Right concept, rank 1, stance Supports, on a passage about paid users’ experiences. | | | |

---

## Group D — 5 rows: the losses, and why none of them costs the reader

A loss is where a REJECT would normally live, so each was checked individually
rather than as a group. In two of the five the entry **still displays** — the
sweep is retrieval-only by design and excludes the bounded-context boost. In the
other three the entry that dropped out was the marginal one and a better-aimed
match displays in its place.

| # | entry | passage | before → after | reaches the reader | rec |
|---|---|---|---|---|---|
| 25 | `M-TBD-45`<br>Is the early-dating workload as one-sided as men feel it is? | 01-pew-online-dating · 34<br>“Men who have dated online are more likely than women to report having paid for these sites and a…” | 0.434 → 0.429 | weak only | **ACCEPT** |
| | | The passage is about who PAID for apps; this Mythbuster entry asks whether the early-dating workload is one-sided. `statistics:stat-pay-to-play` displays at rank 1 (0.634) and is the apt match. The reader keeps the right concept and loses a marginal one. | | | |
| 26 | `M-TBD-44`<br>Are men the offer and women the choosers by default? | 01-pew-online-dating · 52<br>“Women are more likely than men to say online dating is not too or not at all safe.” | 0.432 → 0.425 | weak only | **ACCEPT** |
| | | The passage is about perceived SAFETY; this entry asks whether men are the offer and women the choosers. `statistics:stat-safety` (0.482) and `statistics:stat-attention` (0.519) both display. Same shape as M-TBD-45: a marginal Mythbuster drops out from under better-aimed matches. | | | |
| 27 | `statistics:stat-app-reasons`<br>Why people are actually on the apps | 01-pew-online-dating · 44<br>“About four-in-ten U.S. adults overall (42%) say online dating has made the search for a long-ter…” | 0.447 → 0.422 | **displayed** rank 1 @ 0.438 · Supports | **ACCEPT** |
| | | STILL DISPLAYED, rank 1 at 0.438. The crossing is invisible to the reader: the sweep is retrieval-only by design (no bounded-context boost, no display caps — see the tool header), and in-document that boost puts it back over the line. Verified in-document, not by re-scoring the sentence in isolation, which gives a different number. | | | |
| 28 | `gender-dynamics:male:the-macro-picture-why-dating-broke:gen-z-has-it-even-worse`<br>Gen Z has it even worse | 01-pew-online-dating · 46<br>“Adults under 30 are less convinced than their older counterparts that online dating has made the…” | 0.449 → 0.419 | **displayed** rank 2 @ 0.436 · Resembles | **ACCEPT** |
| | | STILL DISPLAYED, rank 2 at 0.436, for the same reason as stat-app-reasons. The entry is apt — the passage is under-30s being less convinced about apps — and the reader still sees it. | | | |
| 29 | `frameworks:attention-market`<br>The Attention Market | 04-heteropessimism · 17<br>“Like most online subcultures, heteropessimism occupies a contradictory relationship to the marke…” | 0.437 → 0.361 | weak only | **ACCEPT** |
| | | The only loss with a real reader-visible effect, and it is an improvement. The passage is about heteropessimism and CONSUMER markets; the Attention Market is about who gets noticed before pairing. `smv:multiplier:market` displays at 0.540 instead. Worth flagging that the replacement is also imperfect: the canon has no concept for the consumer-capitalism claims this essay makes about coupling. That is a doctrine gap, not a threshold question. | | | |

---

## The two follow-ups, which are not threshold rulings

1. **`tools/lab-threshold-sweep.mjs` should skip non-claim-like units.** Three of
   these 29 rulings exist only because it does not. This is a one-line population
   filter; it will change the sweep population from 120 to 118 and should therefore
   land on its own, with a fresh baseline, not folded into a ruling.
2. **The canon has no concept for consumer-capitalism claims about coupling.**
   Row 29 is the only reader-visible loss, and the concept that replaced
   `frameworks:attention-market` is itself imperfect. `04-heteropessimism` argues
   about marital consumption, the couple as a consumer unit, and the individual
   consumer replacing the pair — a register the canon can currently only
   approximate with `smv:multiplier:market`. Candidate tranche-3 doctrine.

## Applying these

The tool's `--rule ACCEPT --ruled-by <name>` flag stamps **every** outstanding
crossing, which would answer all 3744 — including the 3715 nobody has looked at.
So it is the wrong instrument for this set until the other two thresholds are
ruled too.

The 29 keys are listed below so the record is durable in the repo rather than in
a scratch file. Each is `<unitId>|<canonId>|<threshold>`, the key
`tests/fixtures/threshold-neighbors.json` uses under `rulings`. Say the word and
I will stamp exactly these — or name the rows to overturn and I will stamp the
rest and pin the overturned ones as fixtures, which is what a REJECT means here.

```
seg-00014-0brr9zu.claim-03|lexicon:term-mgtow|minCredibleScore
seg-00001-1ls04yg.claim-02|frameworks:operative-frame|minCredibleScore
seg-00001-1ls04yg.claim-02|lexicon:term-the-operative-frame|minCredibleScore
seg-00001-1ls04yg.claim-04|frameworks:operative-frame|minCredibleScore
seg-00001-1ls04yg.claim-04|lexicon:term-the-operative-frame|minCredibleScore
seg-00007-07z07zp.claim-03|lexicon:term-the-feminine-imperative|minCredibleScore
seg-00016-0jahdlp.claim-04|lexicon:term-the-feminine-reality|minCredibleScore
seg-00001-1ls04yg.claim-03|lexicon:term-the-male-imperative|minCredibleScore
seg-00015-14bwlf7.claim-02|lexicon:term-the-feminine-imperative|minCredibleScore
seg-00016-0jahdlp.claim-01|frameworks:operative-frame|minCredibleScore
seg-00007-07z07zp.claim-03|frameworks:operative-frame|minCredibleScore
seg-00008-10nh3tb.claim-02|lexicon:term-the-feminine-reality|minCredibleScore
seg-00007-1jirrr9.claim-04|lexicon:term-heteropessimism|minCredibleScore
seg-00008-1qs6s6l.claim-02|lexicon:term-heteropessimism|minCredibleScore
seg-00001-1ls04yg.claim-03|frameworks:operative-frame|minCredibleScore
seg-00015-14bwlf7.claim-02|frameworks:operative-frame|minCredibleScore
seg-00016-0jahdlp.claim-01|lexicon:term-the-locus-of-control-shift|minCredibleScore
seg-00001-1ls04yg.claim-04|lexicon:term-the-feminine-reality|minCredibleScore
seg-00049-10fc995.claim-01|statistics:stat-couples-meet|minCredibleScore
seg-00049-10fc995.claim-01|deep-dive:third-spaces|minCredibleScore
seg-00049-10fc995.claim-01|statistics:stat-orgasm-context|minCredibleScore
seg-00014-0brr9zu.claim-03|lexicon:term-heteropessimism|minCredibleScore
seg-00008-1qs6s6l.claim-01|lexicon:term-heteropessimism|minCredibleScore
seg-00030-0kv9wpp.claim-02|statistics:stat-pay-to-play|minCredibleScore
seg-00029-186g33t.claim-04|M-TBD-45|minCredibleScore
seg-00040-0cn4hh2.claim-03|M-TBD-44|minCredibleScore
seg-00036-0t2gpvx.claim-01|statistics:stat-app-reasons|minCredibleScore
seg-00037-0rlkmop.claim-01|gender-dynamics:male:the-macro-picture-why-dating-broke:gen-z-has-it-even-worse|minCredibleScore
seg-00009-165o1nj.claim-01|frameworks:attention-market|minCredibleScore
```

Recording a verdict also requires setting `ruledBy`, because a verdict with no
name on it is indistinguishable from a default, and `adjudicationOpen` is derived
from the remaining PENDING count rather than set by hand. Both are enforced by the
suite.
