# Pressure test 08 — run record (Claude integrator lane)

**Date:** 2026-08-07 · **Contract:** `md/pt08/PROTOCOL.md` · **Method:**
`md/doctrine-pressure-test-04.md` as executed in pt05–pt07 · **Integrator
model:** Claude Opus 5, high effort · **Scout:** ChatGPT/Codex, lanes A–D,
running concurrently and **not yet closed out at the time of writing.**

Baseline: `main` `f5ea75b`, tree clean, `test:lab` 18/18 ok with no skipped
assertions (`lab-corpus/` present), canon 571 at `1.0.0+54d018bff967`.

## Headline

This run shipped **no doctrine and one engine fix.** The gate defect it found
is the kind the corpus could never have surfaced, and the doctrine gap it
found is real but was deliberately left un-authored.

**The domain gate could not read the word "date".** It trusted the gerund
`dating` and nothing else, so the plain noun `dates` and the verb
`date`/`dated` carried no relational frame at all. Same defect SHAPE as the
`marry\w*` morphology bug fixed in v2.6.14 — one inflection named, the rest
missed. Shipped at `959d32c` after a RED-first, fully measured pass.

## Lanes worked

Lanes E–H were assigned; **only lane E was worked.** Three captures, and the
first two consumed the run's discovery budget. F (housing/rent floor), G
(illness, disability, caregiving) and H (loneliness) were **not opened at
all** — stating that plainly because a lane list that goes unmentioned reads
as covered.

| # | lane | source | verdict |
|---|---|---|---|
| 1 | E | The Conversation — GLP-1 disclosure dilemma | instrument + gap candidate |
| 2 | E | Refinery29 — men and hair transplants | **correctly unmapped** (gate right) + instrument |
| 3 | E | Kinsey Institute / IU — GLP-1s and dating | gap + instrument |

## Instrument findings

1. **The gate is blind to `date`/`dated`/`dates`.** Confirmed on two
   independent captures and a synthetic minimal-pair probe. Capture 3 supplied
   a *natural* minimal pair: "12% said they were going on more dates" binned,
   "men were twice as likely to say they were going on more dates" passed,
   differing only by `men` firing `cross-sex-selection`. **FIXED** —
   see below.
2. **A credible-line false positive built from four generic tokens.** A men's
   hair-transplant sentence mapped to a sexed-FEMALE body-positivity entry at
   **0.430** — one thousandth over `minCredibleScore` — on `Distinctive
   overlap: change, yourself, self, thing`. This is the generic-token residue
   `md/lab-v2.6.12-release.md` named as an open cost, on the ordinary branch.
   **Recorded, not fixed** (a whole-corpus scoring change).
3. **Bare numerals and truncated stems inside "distinctive overlap".** `14`
   and `dat` were two of four "distinctive" tokens in a 0.530 Medium mapping.
   `md/lab-numeral-coincidence.md` already ruled a bare numeral out of a match
   once; the shape has recurred. **Recorded, not fixed.**
4. **pt07's common-bigram magnet reproduces on a fresh source.** "sexual
   desire" → `frameworks:desire-maintenance-split` at exactly **0.540**, on a
   source pt07 never saw. The defect class is live, not incidental.
5. **The gerund the gate trusts leaks the other way.** "The carbon *dating* of
   the sediment layer…" is RETAINED as `explicit-relational-outcome`, before
   this run's change and after it. Pre-existing, fails open, **unfixed and not
   caused here** — deliberately excluded from the proposed benchmark append
   rather than shipped as a knowingly-red case.
6. **Tooling:** the extractor must be driven from bash. PowerShell `>` adds a
   BOM and CRLF (wrong SHA-256); `| Set-Content -NoNewline` silently glues
   line-final to line-initial words. Also two Conversation/Refinery29
   container traps that *look* like successful extractions while returning the
   nav or one of 36 body sections.

## The fix (959d32c)

Six positive shapes appended to `partner-access-formation`. Positive shapes,
not `dates?` minus calendar senses — `ignorePrecision` has a hard 0.95 floor.

- Frozen benchmark **identical**: 1.0000 / 1.0000 / 0.8438, 15 misses, before
  and after. Free on all 180 cases.
- Corpus sweep **changed 0, crossings 0** at all three lines, so
  `WEAK_BACKLOG_CEILING = 0` is untouched and there was nothing to adjudicate.
  **The zero is attributed:** the sweep does gate its population
  (`tools/lab-threshold-sweep.mjs:151`), and all 18 bare `date`/`dates`
  occurrences in the corpus are already retained by pre-existing frames.
- Live captures: **6 units rescued**, **zero movement on the control capture**
  with no date tokens.
- **The false positive it buys, frozen:** one rescued unit maps to
  `frameworks:attribution-fork` at 0.434 Low, and it is wrong.
- e3's mapped *share* falls (27.3% → 21.4%) because the denominator grew by
  three real claims. Reporting the share alone would have made a fix look like
  damage.

## Doctrine — a real gap, deliberately NOT authored

**The purchased trait.** When a trait becomes buyable, it stops carrying the
information it used to carry, so the market starts pricing the *acquisition
method* rather than the trait — which is exactly what creates the incentive
not to disclose. Two independent sources give the two halves: 43% of GLP-1
users do not disclose to a date or partner ("is concealing it analogous to
catfishing?"), and 26% would not date a GLP-1 user with a further 29% unsure,
on method grounds.

`frameworks:signal-cost-rule` is the **parent and does not own it**: it asks
what a claim would have cost *if false*, and here nothing false is said. The
body is real; what collapsed is its acquisition cost. That is a separating
signal going pooling — which the entry gestures at (`separating equilibrium`
sits in its `phrases`) but never states, and its own boundary points away
("the rule ranks the cost of the display, not the price of the object").

**Not authored, on purpose.** Authoring it means overlay surfaces, a rebuilt
index, a fresh sweep and a ruling on every weak crossing it opens. The run
had the discovery but not the adjudication budget, and rushed rulings are the
failure mode `--rule` is forbidden to prevent. It is a clean, well-evidenced
proposal for pt09 rather than a half-integrated entry.

## Open for Jason

1. **Proposed benchmark append #5** — `md/pt08/proposed-benchmark-append-05.md`.
   11 cases, measured at domainRecall 1.0000 / ignorePrecision 1.0000 /
   junkRecall **0.8529** (the ratchet rises from 0.8438). Needs explicit
   agreement and its own commit touching no classifier code. **If adopted, the
   ratchet in `CLAUDE.md` should read 0.853.** The gate fix currently ships
   without its guard.
2. **The purchased-trait gap** — author in pt09, or rule no-doctrine-needed.
3. **Instrument findings 2, 3 and 5** — all recorded, none fixed, each a
   scoring or precision change wider than this run could measure.

## Not done

Lanes F, G and H unopened. No canon entry authored, no overlay edit, no index
rebuild, no `generatedAt` stamp commit — none were needed, because nothing in
this run touched canon. **Nothing was pushed.** The scout's lane A–D findings
were not folded: it had not closed out, and the protocol folds a scout file
only after its closeout.
