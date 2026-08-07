# Pressure test 08 — run record (Claude integrator lane)

**Date:** 2026-08-07 · **Contract:** `md/pt08/PROTOCOL.md` · **Method:**
`md/doctrine-pressure-test-04.md` as executed in pt05–pt07 · **Integrator
model:** Claude Opus 5, high effort · **Scout:** ChatGPT/Codex, lanes A–D,
run concurrently, closed after 3:00:55 and **triaged in a second pass** —
everything above the "Scout triage" divider was written before that closeout
and is left as first-pass text; where it says the scout was not folded, read
the divider.

Baseline: `main` `f5ea75b`, tree clean, `test:lab` 18/18 ok with no skipped
assertions (`lab-corpus/` present), canon 571 at `1.0.0+54d018bff967`.

## Headline

The integrator's own lanes shipped **no doctrine and one engine fix.** The
scout's lanes then shipped **two entries** (571 → 573) in a second pass after
its closeout — see "Scout triage" at the foot of this record.

The gate defect the integrator found is the kind the corpus could never have
surfaced, and the doctrine gap it found is real but was deliberately left
un-authored.

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

## Open for Jason (first pass — all now closed, see the closeout)

1. **Proposed benchmark append #5** — `md/pt08/proposed-benchmark-append-05.md`.
   11 cases, measured at domainRecall 1.0000 / ignorePrecision 1.0000 /
   junkRecall **0.8529** (the ratchet rises from 0.8438). Needs explicit
   agreement and its own commit touching no classifier code. **If adopted, the
   ratchet in `CLAUDE.md` should read 0.853.** The gate fix currently ships
   without its guard.
2. **The purchased-trait gap** — author in pt09, or rule no-doctrine-needed.
3. **Instrument findings 2, 3 and 5** — all recorded, none fixed, each a
   scoring or precision change wider than this run could measure.

## Not done (first pass)

Lanes F, G and H unopened. No canon entry authored, no overlay edit, no index
rebuild, no `generatedAt` stamp commit — none were needed, because nothing in
the first pass touched canon. **Nothing was pushed.** The scout's lane A–D
findings were not folded: it had not closed out, and the protocol folds a
scout file only after its closeout. *(The second pass below did all of the
canon work, and the scout's files were folded at `bc41bdb` with the stamp at
`21b52d7`. Lanes F, G and H remain unopened. Nothing has been pushed.)*

---

# Scout triage (second pass, after the scout's 3:00:55 closeout)

The ChatGPT scout closed with 26 analyzed captures, 4 abandoned fetches, and
verdicts of 19 gap / 5 covered / 2 correctly unmapped. Three proposals were
triaged independently. **A scout "gap" verdict was not treated as authorization
to author**: every load-bearing figure was re-verified at primary source first,
and that caught two defects the scout's own QA had not.

| proposal | ruling |
|---|---|
| **Synthetic Reciprocity** → `substitution-layer` | **integrated**, re-scoped |
| **The Authority Firewall** → `meeting-channel` | **integrated**, attribution corrected |
| **The Parenthood Fork** → `deep-dive:single-parenthood` | **deferred intact to PT09** |

## What re-verification caught

**The Authority Firewall cited the wrong author, twice.** Claims 1 and 3 credit
"Horan & Chory's 2022 nationwide survey." DOI `10.3390/bs12080278` is
**La France, B. H. (2022)**, *Behavioral Sciences* 12(8):278. Every figure
verified exactly — N=259, 3.64/1.97 vs 5.31/1.81, t(257)=−15.39, d=−0.96,
policy d=1.16, reports-to-you d=0.70 — so the evidence was sound and only the
attribution was wrong. Corrected before authoring.

**The Parenthood Fork's claim 2 inverts its source.** It states that "parenting
stress and financial difficulty were associated with adjustment problems."
Golombok et al. (2020) found financial difficulties **did not** predict child
adjustment at Phase 2; the predictors were parenting stress and prior
adjustment difficulties. Combined with a structural problem —
`deep-dive:single-parenthood` is an `Essay` whose 33 children are
`Essay section`s, and the proposal declares no content type at all — this is
deferred rather than patched. The parent choice is a design call, not a typo.

Everything else verified exactly: Folk/Heine/Dunn 2025 (N=1,274, Study 2
preregistered, B=.100 p=.013), Ta et al. 2020 (1,854 reviews, 66 users, no
tangible support), Smith/Bradbury/Karney 2025, Fang et al. 2025 (N=981,
non-causal), the NIH and UNC Charlotte policies verbatim, Zamora-Martínez 2025
(26 studies), Zadeh 2017 (19 children, 8/4/3/4), HFEA 1-in-6, and Golombok 2023
(30/30, 80%/60% power).

## Re-scoping, not just folding

Synthetic Reciprocity was **narrowed**. The proposal's analytical point 3 —
supplement versus displacement — is already owned by the parent's own boundary
("substitution and complementarity are observationally identical in
cross-section"). Restating it would have duplicated canon. The component keeps
what is genuinely new: which functions perceived responsiveness supplies, and
which need a second party with something at stake. The parent had also
deliberately published **no figure** on synthetic companionship for want of
verified evidence; that blank is what this fills.

**Lane B preserved as no-new-doctrine.** `agreement-surface`'s synopsis already
names "monogamous," "open" and "polyamorous" and owns the operating contract.
No mechanism outside it was found.

## The cost that was recorded rather than paid

`M-TBD-53` lost its mapping on *"Nearly 1 in 3 young adult men and 1 in 4 young
adult women have chatted with an AI simulated romantic partner"* (0.464 →
0.419), and **Synthetic Reciprocity did not pick it up** — it scores below 0.30
there. This is the measured price of the anti-magnet constraint: the entry
carries no `AI companion` / `AI girlfriend` / `chatbot partner` / `Replika`
surface, so it cannot reach the most literal AI-partner sentence in the corpus.
The constraint was kept and the coverage hole recorded. Closing it would mean
restoring exactly the magnet pt07 removed.

Full adjudication: `md/lab-pressure-test-08-threshold-adjudication.md` — 219
crossings ruled same day (105 ACCEPT / 114 REJECT, ruledBy Claude), weak and
credible pending both 0, **the 9 credible rulings flagged for Jason** because
no pt08 delegation was given.

## Still open for Jason after this pass

1. **Proposed benchmark append #5** (unchanged from the first pass) — the gate
   fix at `959d32c` still ships without its guard.
2. **The Parenthood Fork** — pick a parent and content type, and correct
   claim 2, or rule no-doctrine-needed.
3. **The 9 credible rulings above**, including the two REJECTed losses.
4. **The purchased-trait gap** from the integrator's lane E — still unauthored.

---

# Closeout — 2026-08-07

**Jason delegated the outstanding PT08 calls to Claude in session and closed
the run.** The five dispositions below are Claude's under that delegation.
Nothing in this run is attributed to Jason as his own verdict.

| # | item | disposition |
|---|---|---|
| 1 | Benchmark append #5 | **ADOPTED** — `c520776` |
| 2 | The 9 credible rulings | **CLOSED as ruled** (`ruledBy: Claude`) |
| 3 | The Parenthood Fork | **DEFERRED to PT09** |
| 4 | The purchased-trait gap | **DEFERRED to PT09** |
| 5 | Instrument findings 2, 3, 5 | **LEFT UNFIXED**, carried to PT09 |

**1 — Append #5 adopted.** The gate fix at `959d32c` had been shipping without
its guard, which was the one thing in this run that could silently regress. It
was re-measured on the tree it landed on rather than on the figure quoted when
it was proposed, because the canon is part of the gate as of v2.6.6 and had
moved 571 → 573 in between; the numbers were unchanged. `junkRecall` 0.8438 →
**0.8529**, the only permitted direction. The declared 0.75 minimum was left
alone, as every prior append left it. The twelfth case — "carbon dating" —
stays out, because appending a knowingly-red case would put the suite in the
red for a pre-existing defect this run neither caused nor fixed.

**2 — The credible line closed as ruled.** 7 ACCEPT / 2 REJECT, all
`ruledBy: Claude`. The two REJECTs are recorded as costs, not un-crossed; a
REJECT is never a threshold change.

**3 — The Parenthood Fork deferred, not patched.** Two independent reasons, and
either alone would be enough: its claim 2 **inverts its source** (Golombok 2020
found financial difficulty did *not* predict child adjustment at Phase 2), and
its proposed parent structurally cannot host it — `deep-dive:single-parenthood`
is an `Essay` whose 33 children are `Essay section`s, while the proposal
declares no content type at all. Choosing a parent is a design decision, not a
correction, so it goes to PT09 intact rather than being silently re-homed at
close.

**4 — The purchased-trait gap deferred.** It is well evidenced and the run
record above states the mechanism, the parent analysis and the sources in full.
Authoring it means an overlay edit, a rebuilt index, a fresh sweep and a ruling
on every weak crossing it opens — the same 219-crossing sequence the scout fold
just took. Starting that at close is exactly the rushed-adjudication failure
`--rule` exists to prevent. It is a clean PT09 proposal.

**5 — Instrument findings 2, 3 and 5 left unfixed, deliberately.** Each is a
whole-corpus scoring or precision change, none is caused by this run, and none
can be measured inside it: the generic-token credible false positive
(`change/yourself/self/thing` at 0.430), bare numerals and truncated stems
counted as "distinctive" (`14`, `dat`), and the gerund leak on "carbon dating".
Finding 4 — pt07's common-bigram magnet reproducing on a fresh source — also
stands unfixed and is now confirmed across two runs.

## Final state

Canon **573** at `1.0.0+903fb1917167`. `npm run test:lab` 18/18, exit 0, no
skipped assertions. Working tree clean. **Nothing was pushed.**

Commits, in order: `283f95b` protocol · `959d32c` gate fix · `0b9c3e3`
first-pass records · `bc41bdb` scout fold · `21b52d7` index stamp · `9b7dcf7`
triage records · `c520776` append #5.

Lanes F, G and H were never opened, and no later pass changed that.
