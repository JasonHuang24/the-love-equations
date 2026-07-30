# Batch 3 — cold review dispositions and their adjudication

**Three** cold reviews were run against batch 3. **Review 1** saw the original packet. **Review 2** saw the
repaired packet and escalated. **Review 3** was ordered by Jason as the condition for closing that escalation,
saw the review-2-repaired packet, and **cleared it**.

All three reviewers: dispatched with the packet plus the stripped review rules and nothing else — no run
narrative, no orchestrator commentary, no prior findings, and **no knowledge that any earlier review existed**.
Fenced to reading one file, and told explicitly that an absence in the packet is itself a finding rather than a
prompt to look elsewhere.

| | Units | ACCEPT | REWORD | CONTEST | INTEGRITY | Outcome |
|---|---|---|---|---|---|---|
| **Review 1** (original packet) | 8, reviewer-segmented | 1 | 1 | 6 | 0 | Central warrant refused; repaired |
| **Review 2** (repaired packet) | **43**, marked in the artifact | 24 | 9 | 9 | **CONTEST 1** | **HALTED** → escalated → repaired |
| **Review 3** (review-2-repaired) | **43** | **36** | **4** | **3** | **0** | **CLEARED.** All 7 findings applied; pushed |

---

## ✅ ESCALATION CLOSED — review 3 returned zero INTEGRITY items

**Jason's ruling** on the open escalation was option 2 of the three the referee block set out: require a third
cold review of the repaired packet before pushing. That review returned **ACCEPT 36 · REWORD 4 · CONTEST 3 ·
INTEGRITY 0**, and **unit 34 — the escalated unit — came back ACCEPT** with the repair checked rather than
taken on faith:

> "Both texts are now quoted rather than inferred; the site quote is labelled as an orchestrator read with a
> file:line locator and the whole four-check block is trust-classed as unverifiable from inside the packet,
> which is disclosure, not concealment. The withdrawal of the S-I-B 'independent' corroboration is verified by
> S-I-B's own parenthetical '(as described in my assignment)'… The conclusion is correctly narrowed to the
> candidate doctrine's pairing rather than the published page."

It added one observation the packet should carry rather than bury: **checkpoint 01 "is the orchestrator's own
prior record rather than a foreign one."** True, and it is a reason the corroboration is weak, not a reason the
conclusion fails — the conclusion now rests on the three file-search checks, not on the checkpoint.

**On the integrity gate overall, review 3 stated:** *"No claim, quote, figure, DOI or URL in Part One was found
to lack a basis in a cited source, and no source the packet admits it could not reach is summarized as though
read — the unreachable ones (Guttentag & Secord 1983, the published Demography text, the 13 commentaries,
Proulx et al.) are recorded as gaps and their consequences carried through."*

**One thing a reader of this file must know: the pushed packet is review-3-*corrected*, not
review-3-*as-reviewed*.** All seven of review 3's findings were applied after it returned, following the same
practice as batches 1 and 2. The seven are adjudicated in the next section; none was rejected.

### Review 3's seven findings — all applied, none rejected

| Unit | Disposition | Charge | Adjudication |
|---|---|---|---|
| **3** | CONTEST | The limb-2 tier rule named *"both limb-2 assignments in this packet (Trent & South 2011; Filser & Preetz 2021)"* — but S-I-A grades **two more** on design without a published MOE: Esteve et al. 2016 (120 countries, >0.5 billion person-records) and the Hirschl CDE working paper (N = 5,059,000), both "TIER 1 as read". Part One relies on the Esteve assignment | **Applied.** Corrected to all four. **This defect was introduced by the review-2 repair of the same unit** — a count refuted by the packet's own contents, which is the run's second-most-recurrent pattern showing up inside its own fix |
| **6** | CONTEST | The classification table makes a substantive content claim about each source's pairing stage, but **15 of the 21 sources are identified nowhere in the packet beyond a topic label** — no author, year, venue or URL — and none appears in an appendix headed "locators for every source Part One relies on" | **Applied.** All 21 corpus sources now carry author, year, venue and URL, from the committed manifest. The reviewer also noted the table's per-source figures carry **no trust-class flag** unlike units 4 and 36; that is the same selective-disclosure defect the run has now hit four times, and the flag is added |
| **43** | CONTEST | The appendix *"asserts completeness while omitting every source behind the packet's headline quantitative finding, which means the floor failure it exists to close is larger after the appendix than the appendix admits"* — the reviewer's pick for **weakest unit in the packet** | **Applied.** The header no longer claims completeness it lacks; the appendix now has two tables (scout-read sources, and the 21 corpus sources) plus the named residue of genuine floor failures |
| **1** | REWORD | The instruction to check the two unanchored inventories against the scouts' CONFIDENCE NOTES **is only executable for one of them** — the shingle percentages are orchestrator-computed and appear nowhere in Part Two | **Applied.** The two inventories are now distinguished by whether they can be checked at all |
| **12** | REWORD | "The four tests above are all *new measurements*" — but the within-maintenance near-core/far-from-core comparison is a **re-reading of existing corpus shares** under a new classification | **Applied.** Three of four are new measurements; the fourth is a re-reading. The operative claim — none can be run inside the packet — is unchanged |
| **14** | REWORD | The stated reason for withdrawing "partly falsified" (*"'falsified' asserts a disconfirmation the two studies do not deliver"*) **contradicts the packet's own next two units**, which report that Trent & South *did* contradict the structural-power prediction on three outcomes and that Dollar's pooled result *is* a contradiction | **Applied, and it is the sharpest of the seven.** The withdrawal was right and its rationale was wrong. The accurate reason is narrower: Dollar's pooled contradiction is **self-attenuated** and her moderator arm is **mixed**, so the two-test record is S-G's three-way phrase rather than a falsification |
| **40** | REWORD | Withdrawing the phantom 60% floor and then writing *"none of the six collapsed"* **reinstates the same unstated criterion in weaker form** | **Applied.** The six values are now reported with no pass/fail conclusion at all. A clean catch: the repair had re-imported the defect it was repairing |

### What review 3's ACCEPTs establish

It recomputed rather than trusted, in the same style as review 2 and on different targets: it resolved **every
anchor in Part One** against its named block; recomputed all six robustness ratios (3.449×, 2.630×, 3.084×,
3.058×, 2.352×, 2.76×) and found *"every displayed ratio and numerator/denominator pair is exact"*; verified
the 13-row epoch table reconciles to "twelve of thirteen"; counted all ten SHA-256 digests to 64 characters;
and **checked the outside-the-hash-chain inventory exhaustively against all four CONFIDENCE NOTES blocks** —
S-G's six primary reads, S-H's five, S-I-A's two, S-I-B's four — concluding *"every one that is not a hashed
corpus source appears in the table, and none is missing."* It called that unit **"the packet's best-evidenced
inventory."**

It also affirmed three self-corrections as correct behaviour on their merits rather than for existing: unit 27
(*"the strongest provenance correction in the packet"*), unit 32 (the GFG re-analysis downgrade as *"the
conservative and correct call"*), and unit 41 (the extractor explanation *"self-refuting in the packet's
favour"*).

**Adjudication: the charge is valid against the packet, and the quotation it names is valid against its
source. Both halves of the charge are accepted; nothing is rejected.**

**The charge, part 1.** The packet asserted: *"Checkpoint 01's own reverse-check records that passage as
'unnamed, uncited': the site attributes it to nobody, so the site is not misattributing anything to Finkel."*
The reviewer's finding: that quotation is from a document not in the packet, carries **no citation of any
kind**, cannot be located in the packet's own supplied text, and **was the sole support** for the unit's
exculpatory conclusion — while the same unit *did* disclose the trust class of its other unverifiable item
(the site quote) two paragraphs later. Fails check 6, unverifiable source presented as verified.

**Verified.** The quotation is **accurate** — `md/claude-doctrine-checkpoint-01.md:89` reads "unnamed,
uncited" verbatim. So this is not fabrication and not a false statement. It is an **uncited true statement
whose exculpatory weight the packet rested on without letting the reader check it**, and the selective
disclosure makes it worse: the orchestrator demonstrably knew to flag trust class and flagged only one of two
items in the same unit.

**Repair.** The conclusion no longer rests on that quotation. It now rests on four checks, three of them
structural facts about the repository:

1. The Framework callout containing the passage (`dd-relationships-throughout-history.html:269–273`) carries
   **no `dd-callout-cite` element**, while **10 other callouts in the same file do** — including the
   immediately preceding one at `:258`, which cites Rosenfeld, Thomas & Hausen (PNAS 2019). The absence of
   attribution is structural.
2. `Finkel`, `suffocat`, `Mount Maslow`, `oxygenat`, `all-or-nothing` occur **zero times** in that file.
3. Site-wide, `Finkel` appears **only** as a speed-dating co-author (Joel/Eastwick/Finkel 2017 at
   `frameworks.html:183`; Eastwick & Finkel 2008 at `smvlevers.html:158`; Hunt/Eastwick/Finkel 2015 at
   `statistics.html:256`). **The suffocation model is cited nowhere on the site.**
4. Checkpoint 01's reverse-check, now **cited at `md/claude-doctrine-checkpoint-01.md:89`** and demoted to
   corroboration.

All four are disclosed as **orchestrator reads of repository files** — the same trust class as the hash
controls, verifiable by nobody fenced to the packet. The conclusion itself is unchanged and survives: the
published page attributes the passage to nobody, so it misattributes nothing; the risk lives in the doctrine
record's pairing of that passage with "Supporting: Finkel lineage."

**The charge, part 2 — a second, independent defect in the same unit.** The packet wrote that S-I-B
*"independently records"* that the site's sentence uses none of the model's distinctive vocabulary. **It is
not independent.** S-I-B's own sentence reads: *"the website's premise sentence **(as described in my
assignment)** uses none of the model's distinctive vocabulary."* The scout never saw the page; its observation
is derived from the orchestrator's own description of the sentence. Fails check 4, lineage independence — one
source presented as two.

**Verified and applied.** "Independently" is withdrawn. The vocabulary absence is now established by direct
file search (check 2 above) instead, and S-I-B's note is retained only as a canon-mapping observation about
the *described* sentence.

**A miscorrelation risk this adjudication surfaced, which did not exist before it.** Because `Finkel` **is**
present on the site as a speed-dating co-author, any canon or citation sweep keyed on the surname will find
Finkel cited and could wrongly conclude the suffocation model is sourced. Two unrelated Finkel literatures,
only one of them on the site. Recorded in the packet and in the referee block.

---

## The eight other CONTESTs — all applied, none rejected

**Six of the eight are one systemic defect: the citation floor.** The reviewer's own summary: the S-H block
supplies *"no journal, volume, DOI or URL for any of its five primary sources, deferring instead to a
`capture.json` that is not in the packet"*, and the Dollar dissertation is *"the same failure on the packet's
single most load-bearing unhashed source."* It added that the **substance** of those units is sound — *"tier
logic anti-inflationary, lineage independence correctly refused where authors overlap, scope correctly split
in bucket (c)"* — so **the repair is bibliographic, not evidential.**

| Unit | Charge | Check failed | Adjudication |
|---|---|---|---|
| **5** | *"Only three of thirteen stage-classified sources sit on the 2.6.0 side (01 formation; 02 and 04 are 'other')"* — but 02 and 04 are in the **Other** group, so they are not stage-classified at all, and only **one** of thirteen sits on the 2.6.0 side. **The sentence's own parenthetical refutes it.** | 2 — arithmetic against the packet's own counts | **Applied.** Corrected to "exactly one of the thirteen," with the earlier count disclosed. A genuine error, and the second time in this run a count was asserted that the same document refuted |
| **15** | Dollar (2014) appears in Part Two only as *"Dollar (2014) dissertation, NC State repository — raw-02.txt"* — no title, no URL, no DOI — while every other S-G primary read carries a locator | 1 — citation floor | **Applied.** Full locator inline plus a CITATION APPENDIX entry, sourced from `S-G-capture.json` |
| **16** | *"failed only for Whites"* dropped S-G's *"where it was also positive (**non-significant**)"* — converting a null into a counter-directional finding, which is what made "masking a subgroup split" read as established | 2 and 1 | **Applied.** Non-significance restored; the claim is now that the pooled contradiction masks a subgroup split, **not** that Whites showed a counter-effect |
| **20** | Zhang et al. (2019) — the study carrying **C9's only TIER 1 grade** — cannot be located from inside the packet | 1 — citation floor | **Applied** via the appendix. Substance affirmed by the reviewer |
| **21** | Li et al. (2002) — the paper the **entire convergence half** depends on — carries no venue, volume, DOI or URL. The SHA-256 in the provenance section *"identifies a repository artifact, not a resolvable citation"* | 1 | **Applied** via the appendix. The distinction the reviewer draws is correct and worth keeping: a hash is not a citation |
| **22** | Eastwick & Finkel (2008) and Selterman et al. (2015) — the TIER 1 stated-vs-revealed leg — have *"the thinnest bibliographic record in the packet"* among the eight load-bearing unhashed sources | 1 | **Applied** via the appendix |
| **23** | Bibliographic assertions about Li & Kenrick 2006, Li/Valentine/Patel 2011 and Thomas/Sulikowski/Li 2020 — papers no reader can locate, and which S-H did not read | 1 | **Applied.** Named in the appendix as **floor failures retained rather than repaired**, with the note that what they support is a *refusal* to count them as independent lineages — the conservative direction |
| **27** | *"The abstract was cross-checked word-for-word against the published version"* — but S-I-A's comparand is *"the abstract text quoted by a secondary source describing the published version (**schoolinfosystem.org's summary post**)"*, and the published article was never reached at all | 2 — a secondary retelling's text attributed to the primary | **Applied.** Now states the comparand was a third-party blog's rendering, not the publisher's text |

## The nine REWORDs — all applied; one in a stronger form than offered

| Unit | Defect | Adjudication |
|---|---|---|
| **1** | The universal claim that *every* scout-resting Part One assertion carries an anchor is falsified by the packet's own provenance inventories, which are scout-derived and unanchored | **Applied.** Scoped to claims *restated from* a scout, with the two inventories named as explicit exceptions |
| **3** | Limb 2 of the tier definition is stated two different ways — the definition line requires published methodology, the blockquote adds *"and a published margin of error"* — and under the stricter version **neither** of the packet's two limb-2 TIER 1 sources is shown to qualify | **Applied.** The MOE requirement is dropped from the blockquote, the fallback ("sampling design alone, stated as such") is made explicit, and the inconsistency is disclosed |
| **4** | The most load-bearing warrant table is phrased as established fact without the orchestrator-side trust-class flag the packet's own policy commits it to | **Applied.** A sharp catch: the packet had adopted a disclosure rule and then exempted its own central evidence from it |
| **25** | *"Hypogamy's rise runs continuously from about 1970"* drops S-I-A's endpoint — a rise *"between 1970 and about 2010"* with *"a slight resurgence of hypergamy… since the 2010s"* | **Applied** verbatim |
| **28** | Proulx, Helms & Buehler (2007) promoted to *"its strongest empirical citation"* while sitting on S-I-B's explicit NOT-read list with no locator, and its TIER 3 as sourced label dropped | **Applied**, and extended: the appendix names it as a **retained floor failure**, since no batch-3 artifact carries a venue, DOI or URL for it |
| **30** | Two defects: the anchor `▸"typically requires"` supports only area (b)'s existence, not the three-areas claim attached to it; and *"the commentary most likely to bear on **it**"* assigns Neff & Morgan to the **variance** claim when S-I-B assigns it to the **demand** claim | **Both applied.** Anchor swapped to `▸"three areas of significant disagreement"`; Neff & Morgan reassigned to the demand claim with the earlier misassignment disclosed |
| **31** | *"find couples spending more total and alone-together time than in 1965"* generalises a **non-parent** finding to all couples; S-I-B records parents as *"neither gained nor lost"* alone-together time while gaining roughly an hour a day of total spouse time | **Applied** verbatim. This one matters: the overgeneralisation made the counter-evidence against Finkel stronger than the source supports |
| **36** | The 554-item residue is asserted as a **corpus-wide** superlative from a table that tabulates only six sources — *"an unevidenced superlative in the unit whose purpose is withdrawing two unevidenced superlatives"* | **Applied in a stronger form than the replacement offered.** The reviewer proposed scoping the claim to this batch. The claim is in fact **true corpus-wide**, so rather than withdraw a true statement the packet now **evidences** it: the five largest residues across all 21 analyzed sources (22→554 · 09→230 · 07→158 · 05→153 · 13→122), flagged as an orchestrator-side control. The reviewer's diagnosis — *don't assert corpus superlatives from batch data* — is honoured by supplying the corpus data |
| **41** | The explanation *"a different extractor on the scout's side"* is **refuted by the packet's own numbers**: S-H records all its captures as `curl + r.jina.ai`, which covers source 18 — and 18 scored **87.9%** | **Applied** essentially verbatim. The residual is now recorded as **unexplained** rather than explained away. The independent source-21 extractor correction is kept as its own bullet |

## The 24 ACCEPTs, and what the reviewer actually did to earn them

Worth recording because an ACCEPT with no stated basis is worthless, and these were not that. The reviewer
**recomputed rather than trusted**:

- **Unit 6** — reproduced every row and total independently: 7+6+6+2 = 21 sources; 535+1,416+204+46 = 2,201;
  129+99+9+0 = 237; and all four group shares to two decimals.
- **Unit 8** — recomputed the overlap band rather than accepting the claim, arriving at exactly the four
  sources named, two per arm.
- **Unit 9** — **back-solved every leave-one-out row** against the per-source table, noting that excluding
  source 01 yields 27/62 = 43.5%, independently reproducing that source's own share.
- **Unit 13** — recomputed the disputed-assignment arithmetic: moving source 17 out of formation gives
  113/438 = 25.8% and a 3.69× ratio, *"so 'would strengthen the gap' is literally true"* — and independently
  confirmed the density confound at 236 claim-like segments per maintenance source vs 76 per formation source.
- **Unit 11** — recomputed both within-arm spreads (3.74×, 4.14×) against the 3.449× between-arm ratio.
- **Unit 24** — checked the C12 identifiers for internal consistency: *"10.1215 is Duke UP, 00703370 is the
  journal's ISSN, and vol. 61 is 2024."*
- **Unit 35** — recomputed all four column sums and all six per-row shares, and verified mapped + queue =
  claim-like **for every row individually**.
- **Unit 38** — counted each of the six digests to 64 hex characters, plus the four scout-block digests.
- **Unit 39** — **reconstructed the outside-the-hash-chain enumeration independently from Part Two** and found
  it complete: *"nothing omitted and nothing invented"*, with the YES column counting to 8.
- **Unit 2** — checked **every anchor fragment** for literal occurrence in its named block, including the
  awkward cases with markdown intact.

Three ACCEPTs affirmed self-correction as correct behaviour rather than treating it as weakness: **unit 32**
(the GFG re-analysis self-downgrade, *"grounded in Part Two rather than asserted"*), **unit 40** (withdrawing
the unstated 60% floor), and **unit 17** (reassigning credit for the unreached-book gap to the scout).

---

## What this review says about the batch, and about the run

**The repair worked on substance and failed again on provenance.** Review 1 returned ACCEPT 1 of 8. Review 2
returned **ACCEPT 24 of 43** on the same material — and every one of review 1's confirmed factual errors
survived re-inspection as fixed. The quantitative finding, the two-readings framing, the tier logic, the
lineage refusals and the arithmetic were all checked by recomputation and held.

**But the integrity escalation is the same failure mode as batch 2's, for the third time.** Batch 2 ITEM 15:
provenance the scout supplied, shed in compression. Batch 2 unit 30: read status asserted falsely in the
provenance layer. Batch 3 unit 34: an external quotation carrying a conclusion, uncited, with its trust class
disclosed for the *other* unverifiable item in the same paragraph. Three escalations, three instances of
**the orchestrator stating something more confidently than its own artifacts support, in exactly the layer
where a reader is entitled to rely on it.**

**And the citation floor failed at cluster scale for the second time.** Batch 2's Cluster 3 (S-F: zero URLs,
zero DOIs across seven sources). Batch 3's Cluster C9 (S-H: five primary sources, locators deferred to a file
the reader does not have). Both times the floor was stated in the packet and both times a whole cluster
failed it. The batch-3 repair adds a CITATION APPENDIX; **that is a patch on the packet, not a fix to the
process** — the scouts should be required to carry locators inline in the findings file, not in a companion
artifact, because the findings file is what gets embedded.

**The two-part doctrine is doing its job, and this review is the evidence.** Every one of the 18 defects above
was found by comparing Part One against Part Two, from inside a single file, by a reader with no other
context. Six of them were found by *arithmetic on the packet's own tables*. That is the property the structure
was built for.

---

## What three reviews on one packet actually showed

**The trajectory: ACCEPT 1 of 8 → 24 of 43 → 36 of 43, with the integrity gate clearing on the third pass.**
The repairs held; review 3 re-checked the load-bearing ones by recomputation and confirmed them.

**But three of review 3's seven findings are defects the repairs themselves introduced or re-imported**, and
that is the most useful thing this batch produced:

- **Unit 3** — the review-2 repair of the tier block named two limb-2 assignments when the packet relies on
  four. A count refuted by the packet's own contents, committed *while fixing* a different defect in the same
  unit.
- **Unit 40** — the review-2 repair withdrew a phantom 60% floor and then wrote "none of the six collapsed",
  smuggling the same unstated criterion back in.
- **Unit 14** — the review-2 repair withdrew "partly falsified" for a reason contradicted by the packet's own
  next two units.

**The lesson is specific and worth carrying to any future batch: a repair pass needs its own verification pass
against the same checks the original failed.** Fixing a unit does not exempt the fix. Three of seven is a high
enough rate that "repaired" should not be treated as a stronger status than "reviewed" until the repair has
itself been reviewed — which is precisely the gap that left batch 2 repaired-but-unre-reviewed, and precisely
why requiring review 3 was the right ruling rather than a formality.

**One pattern did close, and it is worth naming.** Review 3 found **zero** integrity items and zero provenance
over-scope defects — the failure mode behind all three of the run's escalations. The fix that worked was not a
convention or a reminder; it was **making every unverifiable claim carry an explicit trust-class flag naming
what the reader cannot check.** Unit 6 was the last unflagged holdout and review 3 caught it.
