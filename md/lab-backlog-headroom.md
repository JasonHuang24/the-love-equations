# LE Lab — weak-backlog headroom, measured (2026-07-31)

**Status: LIVE — measurement only. Nothing below was ruled, and nothing in the fixture was touched.**

> **Both open questions were since answered, same day.** §5(a): the 91 readable
> crossings were ruled (`md/lab-weak-backlog-sitting-91.md`). §5(b): Jason ruled the
> 425 orphans RETIRED as a class (`md/lab-weak-orphan-retirement.md`). The
> measurement below stands unedited.

The question: `tests/fixtures/threshold-neighbors.json` holds 516 pending `minWeakScore`
crossings against `WEAK_BACKLOG_CEILING = 516` — zero headroom, so the next doctrine batch
that moves any weak score cannot ship. What is the cheapest honest way to make room?

Measured against the fixture as of `77b0293`+ (corpus epoch `421b1f5b859073c1`, canon 532,
analyzer 2.6.9 config `bt0a7p`). Every instrument below ran read-only; artifacts went to a
session scratchpad, not the tree.

## 1. The queue, decomposed

| threshold | pending | standing |
|---|---|---|
| `candidateScoreFloor` | 4,725 | census, explicitly not adjudicable |
| `minWeakScore` | **516** | the ratcheted backlog, at its ceiling |
| `minCredibleScore` | 0 | fully adjudicated (Jason), release-blocking when nonzero |

Verdicts to date: 172 ACCEPT · 14 REJECT (122 ruled 2026-07-29, 36 on 07-30, 28 on 07-31).

## 2. Every pending crossing is inherited from the retired epoch

Instrument: key-set diff of `rulings` rows with `ruling: "PENDING"` between the current
fixture and its last pre-restoration version (`git show c034013:…`).

Result: **5,241 of 5,241 pending keys existed before the corpus restoration; 0 were added
under the current epoch; 0 were dropped by it.** The restoration carried the rulings object
forward by key (`corpusEpochHistory[0].rulingsCarriedForward: 5427`) and never re-measured
the pending rows. All 516 weak crossings are measurements made against the corpus that no
longer exists. The epoch record's own warning applies to the entire queue: "a verdict from
here describes a passage that may since have changed."

## 3. The finding that changes the triage: 425 of the 516 are unreadable

Pending keys are content-derived (`seg-…claim-NN` ids hash the passage text). I rebuilt the
sweep's unit→source mapping from the restored corpus exactly the way
`tools/lab-threshold-sweep.mjs` builds it (`normalizeInput` → `detectClaimUnits` per
manifest source, pinned timestamp), then joined it against the queue.

Instrument validation, before believing any zero: the rebuilt mapping covers **2,438 of the
2,438** distinct unit ids in the fixture's own current `scores` — the mapper can see the
entire current population, so a miss is a fact about the key, not about the mapper.

- **91 of 516** weak crossings sit on unit ids that still exist in the restored corpus.
  Content-derived ids mean these segments survived the drift byte-identically: they are
  readable today, and a ruling on them means what it says.
- **425 of 516** (82%) are keyed to unit ids that exist nowhere in the current corpus. The
  passage they were measured against drifted or vanished (the restoration landed 1 of 21
  sources byte-exact), and the pre-destruction text is unrecoverable. **These crossings
  cannot be read by anyone, ever.** A ruling on them would be a verdict on a passage nobody
  can see.

The 91 readable ones, by source: `02-fem-centrism` 68 · `19-zhang-preference-replication` 8
· `01-pew-online-dating` 5 · `17-trent-south-sex-ratios` 4 · `20-marzoli-mate-preferences` 3
· `22-finkel-suffocation` 2 · `13-wheatley-counterfeit-connections` 1. Direction: 79 gain /
12 loss. The 68 fem-centrism crossings span 48 canon entries, led by the operative-frame
cluster (`frameworks:operative-frame` 6, `lexicon:term-the-operative-frame` 5,
`lexicon:term-the-feminine-imperative` 5, `term-the-feminine-reality` 4) — one source, one
sitting.

## 4. Distribution of the full 516, for whoever rules

- **Direction:** 363 gain / 153 loss. Readable subset: 79/12. Orphaned: 284/141.
- **216 distinct canon entries.** Top of the table (n · gain/loss · readable-now):
  `lexicon:term-the-consumer-unit` 39 · 39/0 · 4 readable;
  `lexicon:term-heteropessimism` 18 · 18/0 · 0;
  `statistics:stat-orgasm-context` 15 · 13/2 · 1;
  `deep-dive:third-spaces` 14 · 12/2 · 1 (plus `hub:third-spaces` 7 · 7/0 · 0);
  `statistics:stat-couples-meet` 10 · 10/0 · 1;
  `frameworks:operative-frame` 8 · 7/1 · 6.
- **Mythbuster docket:** 112 crossings across 49 `M-TBD-*` entries, nearly all orphaned.
- **Duplicates:** grouping by (entry × segment), 490 distinct pairs; 23 pairs recur across
  multiple claims of the same segment, accounting for 49 crossings. Deduplication buys
  almost nothing — the queue is wide, not repetitive.
- **Canon growth 507→532:** **0** pending crossings involve the 25 added entries. Attributed,
  not assumed: the growth's crossings were absorbed without a baseline
  (`md/lab-post-restoration-sweep-532.md` §5) and never entered this queue, and the queue
  itself predates the growth (§2 above).

## 5. Options, and the recommendation

**(a) Rule the 91 readable crossings, hand-entered, by source.** 68 of them are one source
read in one sitting. This is real adjudication — passage on screen, verdict per row, two
edits per verdict (`counts.pendingByThreshold` and `counts.pending` move together). Buys
headroom of 91 (516 → 425). Cheapest honest option, and the only one that is pure reading.

**(b) The 425 orphans are a standing decision, not a backlog.** They can never be read; they
will hold the ceiling hostage forever unless retired. Retiring them is mechanically a bulk
stamp on rows nobody re-read — the exact shape Jason declined on 2026-07-30 — but it differs
in substance: these rows are not unread, they are *unreadable*, and the fixture itself
records why. If Jason wants them retired, that is a one-time class decision he makes
explicitly (e.g. a distinct verdict value that says "retired with the epoch, passage
unrecoverable" — never ACCEPT/REJECT), recorded with his name only if he actually makes it.
Not a cleanup task; not done here; not recommended *by default*.

**(c) Raising the ceiling: not an option.** The fixture's contract says lowering
`WEAK_BACKLOG_CEILING` is the only edit it permits, and the standing rules say a change that
needs a ratchet loosened does not ship.

**Recommendation: (a), then put (b) in front of Jason as its own question.** After (a), the
ceiling ratchets down to 425 honestly, every remaining pending row is known-unreadable, and
the weak line's future is a single explicit decision instead of 425 fossilized rows.

## 6. What was not done

No `--rule`, no `--baseline`, no sweep invocation of any kind; no edit to
`threshold-neighbors.json`, no verdict recorded, no ceiling touched, no synopsis reworded.
The unit→source mapping and row extracts live in the session scratchpad only. The
`candidateScoreFloor` census (4,725) was characterized only as far as §2's epoch split — it
is not adjudicable and was not triaged further.
