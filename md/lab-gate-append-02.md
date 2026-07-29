# LE Lab — gate append 02: corpus acquisition, domain-gate fix, v2.3.0 re-run

**Pass:** analyzer `2.2.0` → `2.3.0`, analysis schema `le-lab.analysis/2.2` → `/2.3`. Canon index
**unchanged** at `1.0.0+62c5cb511433`. `SCORING_CONFIG` **unchanged** (`scoringConfigHash` still
`195c1ld`).

Four commits, in the order the discipline required:

| # | Commit | What |
|---|---|---|
| 1 | `a0b46b1` | Corpus sources 01, 04, 02 acquired; manifest + reproducible extractor |
| 2 | `049b7f6` | Benchmark append #2 — committed **RED**, suite failing |
| 3 | `b2b635e` | Gate fix + v2.3.0 version bump — turns it green |
| 4 | *this commit* | Re-run exports, labeling sheets, manifest results, this report |

---

## DECISIONS NEEDED

Seven items. Nothing here is blocking; all of it is either a judgment call I made and am flagging,
or a finding that belongs to the next pass rather than this one.

### 1. `ds-08` — the flagged ambiguous benchmark case

> "His game was off last night and he missed every shot in the second half." — labeled **ignore**.

The bare phrase *"his game was off last night"* is genuinely two-way, and my ignore label rests
entirely on the clause that follows it. Inside a dating-commentary source the bare form should read
seduction-sense. I included it **with** the disambiguation rather than excluding it, and recorded
the ambiguity in the case note, because the fixture policy excludes borderline passages and I did
not want to silently resolve one. **Your call:** keep as labeled, re-label, or drop the case.

### 2. `SCORING_CONFIG` was NOT touched — flagged because the brief asked for it prominently

The brief made threshold changes a last resort requiring prominent disclosure. **None were needed.**
The fix is four frame-table additions and nothing else. `scoringConfigHash` is byte-identical at
`195c1ld` before and after, which is machine-checkable in any export.

### 3. The ratified alias is `out of your/his league` — **not** `out of her league`

`md/lab-canon-alias-pass-01.md` §5 records the blocked addition as `"out of her league"`. The index
and the overlay actually carry **`out of your league`** and **`out of his league`**. That was a
transcription slip in the pass-01 report, not an index error.

It matters now because the gate fix admitted the probe sentence, so we can finally see what happens
to it — and the answer is **nothing**. "He was told he was out of *her* league…" produces **zero
ranked matches**: the passage is retained, reaches the matcher, and finds no phrase to hit. The
gendered form the register actually uses (a man told he is below *her*) is the one form missing.
**Proposal only, not applied** — alias additions are out of this pass's scope.

### 4. A single-word alias can never, on its own, map a claim

Structural, and I think the most consequential finding in this pass:

```
singleAliasStrength = 0.30      the entire score a lone single-word alias hit can contribute
minCredibleScore    = 0.43      the score a match needs to be ranked rather than "weak"
```

`0.30 < 0.43`. A single-word alias hit is worth strictly less than the credible-match gate, so it can
**only** ever surface as a weak match — and only if it survives `maxWeakMatches = 3`.

Observed live: `provider` is a correct alias on `smv:money:provisioning-signal`, the probe sentence
"She wanted a provider who could support a household…" now reaches the matcher, the alias fires — and
`smv:money:provisioning-signal` **does not appear anywhere in the output**, not even as a weak match.
It scored ≈0.30, tied at the bottom, and lost the 3-slot weak cap on an alphabetical tiebreak. The
passage mapped to `deep-dive:relationships-by-country:latin-america` on generic token overlap instead.

This generalizes pass-01's "`game` is inert" finding one level up. `game`/`rizz` are inert because
they are 4 characters and fail `minSingleAliasLength`. **Every** single-word alias — `provider`,
`breadwinner`, `hypergamy`, `resources` — is *sub-credible* for a different reason. Roughly a third
of the ratified additions were single words. **This is threshold-calibration work, not index work.**

### 5. `ds-13` is a known miss and I deliberately did not fix it

> "The studio patched the game so ranked players get fewer unfair matches." → retained (should be set aside)

It is retained by the **append #1** `dating-app-interaction` frame matching "fewer … matches", not by
anything this pass added — it was already a miss before the append, and none of the four new frames
touch it. Fixing it means *narrowing* that frame, which risks losing real app-interaction retentions
and would violate this pass's "no disappearance" constraint. It is a fail-open retention: visible in
the ledger and excludable by hand. Left as a documented miss; `junkRecall` still rose.

### 6. The corpus is NOT single-version, and cannot become so

Source 03 (Gottman) is excluded by your decision and stays a v2.1.2 artifact. `md/RERUN.md` §6
defines completion as every source carrying a current export at the epoch version. **03 never will.**
The three acquired sources *are* single-version at 2.3.0 and comparable to each other; any comparison
that includes 03 is cross-version and must say so. Recorded in the manifest as
`singleVersionStatus.isSingleVersion: false`.

### 7. The Pew re-run is not a like-for-like comparison, and I did not force one

Four variables moved at once (§5 below). I could narrow the extraction boundary to try to reproduce
Harvest #1's 34-claim population, but that would be fitting the text to the number — reverse-engineering
an extraction until it matches a figure whose provenance is gone. I took the wider boundary, kept it
honest, and marked the delta **not attributable**. Say if you would rather I chase the old boundary.

---

## [1] Corpus acquisition — 01, 04, 02 acquired; 03 excluded

`lab-corpus/` stays gitignored. Identity and integrity live in the committed
`lab-corpus.manifest.json`.

| # | Source | Method | Verification | Words (run-01 record) |
|---|---|---|---|---|
| 01 | Pew, *Key findings about online dating in the U.S.* | live page | **VERIFIED** | 2,283 (not recorded) |
| 02 | Rollo Tomassi, *Fem-Centrism* | Wayback `2025-10-23` | VERIFIED identity | 1,210 (1,214) |
| 04 | Asa Seresin, *On Heteropessimism* | live + Wayback `2026-07-16` | **VERIFIED, drift ruled out** | 2,891 (2,938) |
| 03 | Gottman, *The Four Horsemen* | — | **EXCLUDED by decision** | — |

**Pew was the one that required verification before acceptance**, because its URL was
provenance-inferred rather than captured. All four recorded metadata fields match the fetched page:

| Field | Dossier record | Fetched page |
|---|---|---|
| Title | Key findings about online dating in the U.S. | identical |
| Publication date | 2023-02-02 | `datePublished 2023-02-02T12:01:17-05:00` |
| Sample | n=6,034 U.S. adults | 6,034 U.S. adults |
| Field dates | fielded July 2022 | July 5–17, 2022 |

No source failed verification, so the 2-source stop condition did not fire.

**Two provenance results worth naming:**

- **04 is the strongest.** Its extracted text is **byte-identical** to the extraction from a Wayback
  capture taken **eleven days before** the original run. That does not prove the deleted staging held
  these bytes, but it removes source drift as an explanation for any delta the re-run shows — and the
  re-run shows none, which makes the pairing meaningful.
- **02's URL was wrong in the worksheet.** No URL survived, and the first guess
  (`/2011/09/13/fem-centrism/`) does not exist. The permalink is **`/2011/12/21/fem-centrism/`**,
  recovered by Wayback CDX domain search. Its latest pre-run-date capture is nine months old; that
  drift window is recorded as a known limit. The extracted text lands 4 words off the 1,214 on
  record, which is the best available evidence that it is the same text.

### Extraction is a committed script, not a model reading the page

`tools/extract-source-text.mjs`. This is the part that makes the archive worth having. A
model-mediated "read the page and write it out" step is **not reproducible byte-for-byte**, so the
SHA-256 in the manifest would attest to nothing. The chain is now:

```
archived raw HTML  →  tools/extract-source-text.mjs (hash recorded)  →  .txt (hash recorded)
```

Each sidecar records its exact command line and the hash of the HTML it ran against. Anyone holding
the corpus can regenerate the analyzed text and check it. Every recorded SHA-256 in the manifest was
re-verified against disk before this commit.

---

## [2] Benchmark append #2 — committed RED on purpose

18 cases, **7 positives / 11 negatives** (1.6:1, above the 1:1 floor), registered as
`register: "dating-commentary-seduction"`.

At commit `049b7f6` the suite **fails**:

```
152 cases · domainRecall 0.9054 · ignorePrecision 0.9014 · junkRecall 0.8205 — under both hard thresholds
all seven ds positives set aside by the shipped v2.2.0 build
```

That red state is the point. `md/lab-canon-alias-pass-01.md` §§4–5 concluded that the binding
constraint was the gate, not the alias — *"no alias change can fix a passage that never reaches the
matcher."* Committing the fix first would have left only my word for it.

**All seven positives are verbatim probe sentences recovered from the alias pass**, not paraphrases.
The prior session's probe files survived in its scratchpad, so the texts are the originals:

| Case | Text | Why it is a positive |
|---|---|---|
| ds-01 | "He spent two years learning game and it changed how women responded to him." | the exact sentence the `game` alias was added to catch |
| ds-02 | "She keeps playing games instead of saying what she actually wants." | indirect-signaling sense |
| ds-03 | "The whole pickup game industry sells confidence to men who lack it." | seduction-industry commentary |
| ds-04 | "Social calibration matters more than raw looks in a bar." | the register with **no** `game` token |
| ds-05 | "He was told he was out of her league because she earns more and dates taller men." | probe for blocked addition `out of … league` |
| ds-06 | "Most men under six feet get filtered out before a woman ever reads their profile." | probe for blocked addition `under six feet` |
| ds-07 | "She wanted a provider who could support a household while she raised their children." | probe for blocked addition `provider` |

> **One correction to the pass-01 report.** §4 says *"four of five seduction-sense 'game' sentences
> were rejected."* Measured: three of the five sentences containing `game` were rejected (ds-01,
> ds-02, ds-03 here); the fourth rejected probe was ds-04, which carries no `game` token at all, and
> the fifth `game` sentence was retained as `uncertain`. Four probe sentences were rejected — the
> attribution to the word was the imprecise part. It strengthens rather than weakens the case: the
> gate was missing the **register**, not the token.

The eleven negatives are freshly written and each aimed at a specific positive — three sports senses
of `game`, three video-game senses, the sports sense of `playing games` (aimed at ds-02), the sports
sense of `out of X league` (aimed at ds-05), a recruiting sentence structurally parallel to ds-06,
and two `rizz`-as-generic-praise cases.

---

## [3] The gate fix

Four frames added to `RELATIONAL_OUTCOME_FRAMES`. No threshold changes. No new frame family.

| Frame | Catches | Guard against its own trap |
|---|---|---|
| `seduction-craft-register` | pickup / approach / game-as-craft | two branches: unambiguous community vocabulary fires alone; bare `game`/`rizz` needs a relational object |
| `mate-value-mismatch` | league, weight class, settling | idiom must co-occur with a human/relational term |
| `partner-screening-filter` | screening criteria on candidate partners | the filtering act or criterion must land near a partner population |
| `provisioning-role` | provider / breadwinner role | vendor vocabulary (insurance, cloud, service, plans…) vetoes outright |

**All four are deliberately non-decisive.** A decisive frame bypasses the affirmative non-domain veto,
and every term here is polysemous. Left non-decisive they retain through `plausibleRelationalAnchor`,
which still defers to sports/computing/corporate evidence — so `ds-12` and `ds-18` are set aside by
their *existing* non-domain frames even though the register vocabulary is present. This is also why
the fix needed no threshold movement.

### Verification

| Check | Result |
|---|---|
| Full `npm run test:lab` | green — 8 suites, 3 Python audits, release audit at `v=2.3.0` |
| **Frozen 134** | **1.000 / 1.000 / 0.806 — not one case changed status *or* reasonCode** |
| Appended 152 | 1.000 / 1.000 / **0.821** (ratchet up from 0.806) |
| Alias-mode diff vs `demo-v2.2.0-canon-62c5cb511433.json` | 5 differences, **all provenance**, 0 behavioral, 0 dropped, 0 decreased — **PASS** |
| Determinism | `demo-v2.3.0.json` captured twice, byte-identical |
| Match surface | **byte-identical** — no index file touched; `data/le-canon-index.json` still hashes to `e19f6511c05d…` as recorded in pass-01 §7 |

The frozen-134 check was done **per case**, not by comparing the aggregate ratios. Identical ratios
could have concealed compensating flips; a per-case diff of the stashed and unstashed builds cannot.

### The one thing that looked like a stop condition, and was not

Running the fix against the 17-sentence probe battery, the alias-mode gate reported
**`RESULT: FAIL — 2 dropped matches`** (`M-TBD-20`, `M-TBD-5`). Investigated before proceeding:

```
segment-level matches   before 17   after 26
segment-level matches present BEFORE but absent AFTER:  0
M-TBD-20 in segment matches:  before true   after true
M-TBD-5  in segment matches:  before true   after true
```

Both are still matched. What changed is `strongestMatches`, a **document summary capped at 20**
(`maxStrongestMatches: 20`). It held 17 entries before and 20 after; nine newly-mapping passages
pushed the two lowest-scoring entries off the end. That is displacement inside a capped ranked list,
not a lost match. **Worth flagging as a rig limitation:** `--mode alias` reports summary-list
displacement as a "dropped match", so on any source where coverage grows it can raise a false stop
signal. It did not misreport the fixture diff, which showed 0 dropped.

### What the frames actually admitted, with attribution

Exactly the seven positives, each traceable to one frame:

| Passage | Admitted by | Now maps to |
|---|---|---|
| "…learning game…women responded to him" | `seduction-craft-register` | `gender-dynamics:…two-types-of-guys-left` 0.494 |
| "…playing games instead of saying what she actually wants" | `seduction-craft-register` | `M-TBD-12` 0.493 |
| "…pickup game industry sells confidence…" | `seduction-craft-register` | `gender-dynamics:…why-game-became-a-whole-industry` 0.435 |
| "Social calibration matters more than raw looks…" | `seduction-craft-register` | `smv:charm` 0.540 — **exact phrase** *"social calibration"* |
| "…out of her league…" | `mate-value-mismatch` | **no ranked match** (see decision 3) |
| "Most men under six feet get filtered out…" | `partner-screening-filter` | `smv:looks:height` 0.575 — **exact phrase** *"under six feet"* |
| "She wanted a provider…" | `provisioning-role` | `deep-dive:…latin-america` 0.452 — **not** provisioning-signal (see decision 4) |

So of the three additions pass-01 recorded as untestable: **one now fires cleanly** (`under six
feet`, slot 1 at 0.575), **one cannot fire** because the index carries a different gendered form,
and **one fires but is structurally sub-credible**. The gate fix is what made all three legible.

---

## [4] Pills coverage inventory — cited, and re-verified

The inventory **exists** as `md/lab-canon-alias-pass-01.md` §6. Re-verified against the current canon
`1.0.0+62c5cb511433`; it holds unchanged:

| Term | Covered as exact alias/title? | Where |
|---|---|---|
| `red pill` | yes | `pills:page-rp`, `lexicon:term-the-red-pill` |
| `black pill` | yes | `pills:page-blk`, `lexicon:term-the-black-pill` |
| `blue pill` | yes | `pills:page-bp`, `lexicon:term-the-blue-pill` |
| `blackpilled` | **no** | substring only, in one GD card slug |
| `redpilled` | **no** | absent entirely |

Five of the twelve `pills:*` entries still carry no aliases at all, including
`pills:page-rp:hypergamy` and `pills:page-rp:preselection` — which now sit beside lever entries that
gained exactly the vocabulary they lack. Report only; nothing added.

Note the interaction with decision 4: `blackpilled` (11 chars) and `redpilled` (9 chars) would clear
`minSingleAliasLength` — but as **single-word** aliases they would top out at 0.30 and could never
produce a ranked match on their own. Adding them without the threshold work would buy weak matches,
not coverage.

---

## [5] The v2.3.0 re-run

Exports in `lab-corpus/exports/`, named per `md/RERUN.md` §4. Nothing was deleted or overwritten;
supersession is recorded in the manifest.

| Source | Claim-like | Mapped | Mapped share † | Tensions | Queue | Set aside | vs v2.1.2 | Cause |
|---|---|---|---|---|---|---|---|---|
| 01 Pew | 62 | 27 | **43.5 %** | 9 | 35 | 41 | 34 / 50 % / 17 | **mixed — not attributable** |
| 02 Fem-Centrism | 10 | 0 | **0 %** | 0 | 10 | 41 | 10 / 0 % / 10 | **no change; attributable** |
| 04 Heteropessimism | 28 | 1 | **3.6 %** | 0 | 27 | 91 | 28 / 3.6 % / 27 | **no change; attributable** |
| 03 Four Horsemen | *not re-run* | — | — | — | — | — | 17 / 0 % / 17 (v2.1.2) | excluded by decision |

† Provisional. Every export carries `coverage.provisional: true` — the thresholds that produce this
number have never been fitted to labelled data.

### Sources 02 and 04 reproduce their v2.1.2 figures exactly — and that is the result

Not approximately. **Every recorded figure is identical**, and for 04 the single mapping is still the
same concept at the same score: `smv:multiplier:market` ("The Market"), Medium confidence, 0.540.

I isolated the cause rather than assuming it. Re-running the identical texts on the **v2.2.0** build
and diffing:

```
01, 02, 04 : v2.2.0 → v2.3.0  ·  5 differences, all provenance, 0 behavioral, 0 dropped  ·  PASS
new-frame firing census across all three sources: 0 firings, 0 firings, 0 firings
```

Not one of the four new frames matched a single passage in the entire corpus. The gate fix is a
**verified no-op on this corpus** — which is exactly what you want a targeted fix to be, and it means
the zero delta is a fact about the *corpus*, not an artifact of the change.

Fem-Centrism is manosphere writing, so its unchanged 0% deserves a note: it is Rollo's **theoretical**
register (feminine imperative, social conventions, hypergamy-as-thesis), not the **tactical**
seduction-craft register this append taught the gate. Different vocabulary, same movement.

### Pew's delta is not attributable, and I did not pretend otherwise

Four variables moved between Harvest #1 and this run: analyzer `1.7 → 2.3.0`, canon
`6dc9bff7b0fe → 62c5cb511433`, the four visitor includes (content-derived unit IDs cannot survive
re-acquisition), and the article boundary itself — this extraction keeps the "How we did this"
methodology box, the Terminology list, and the Asian-sample note. The near-doubling of claim-like
segments is mostly that boundary. See decision 7.

### The finding this re-run actually produced

Every one of the **173** set-aside passages across all three sources carries the same reason code:

```
no-human-relational-frame : 173 / 173  (100%)
```

And of the **72** unmapped claim-like passages:

| Why unmapped | Count |
|---|---|
| A nearby concept exists, but confidence stayed below the credible-match threshold | **62** |
| The nearest canon concept shares only weak or generic wording | 10 |

Nearest-concept score distribution against the `0.43` credible gate:

```
0.40–0.45  ##############  14      <- within 0.03 of the gate
0.35–0.40  #######################  23
0.30–0.35  #############  13
0.25–0.30  ############  12
0.20–0.25  #######  7
0.15–0.20  ##  2
0.05–0.10  #  1
```

**Fourteen of seventy-two — 19% — sit within 0.03 of the gate.** Read together with decision 4
(a lone single-word alias tops out at 0.30, below the same 0.43 gate), the corpus's coverage problem
is now demonstrably a **threshold** problem, not a vocabulary problem. Two consecutive passes of
index work moved these numbers by zero. The labeling sheets are the input for the pass that can.

### Labeling sheets

`<NN>-<slug>-v2.3.0.labeling.csv`, one per source, generated by the committed
`tools/lab-labeling-sheet.mjs`. Three sections, because there are three distinct ways to be wrong:

| Section | Rows (01 / 02 / 04) | Verdict column |
|---|---|---|
| A — every mapping | 48 / 0 / 1 | `CORRECT` \| `FALSE-POSITIVE` |
| B — every unmapped claim-like passage | 35 / 10 / 27 | `OK-NO-CANON` \| `MISS` |
| C — every passage the gate set aside | 41 / 41 / 91 | `OK` \| `SHOULD-HAVE-BEEN-RETAINED` |

CSV rather than Markdown because the deliverable is a column somebody fills in. Section C is included
in full: the gate is fail-open triage, so its errors are visible — but only if somebody looks.

---

## v2.3.0 release manifest

| SHA-256 | File |
|---|---|
| `9d196ec1020159b58a3d3464d0340df54ddcc3a275ed25f7ed82d608b5320962` | `lab-corpus/exports/01-pew-online-dating-v2.3.0.json` |
| `71855078e5b1e0783a373e27988d5847e4f0a7b27fba578b11a0b3fb32771f59` | `lab-corpus/exports/02-fem-centrism-v2.3.0.json` |
| `df1215bc5c8fecacb613461a5289f1c28c66ecca145a4dcbfff1252a8e006d01` | `lab-corpus/exports/04-heteropessimism-v2.3.0.json` |
| `5f0fe0790ace3c856b410cd351770b2ecbbb280292245cab1c0ae39a3583e5b3` | `lab-corpus/sources/01-pew-online-dating.txt` |
| `027043a51799e3365224a43c7f6567b1b7541e56c2bf5acad03baf3292f38621` | `lab-corpus/sources/02-fem-centrism.txt` |
| `f8d168c53f8ce88b3a3d82dbe1f61aca53cfdf403176bea7c42557d9c835f6cd` | `lab-corpus/sources/04-heteropessimism.txt` |
| `6f3373b0c12145f9b57af26c9eb6d3bf5ee69a0a34d600e61c1c229c1321aa43` | `tools/extract-source-text.mjs` |
| `2d195b7a03d1cedb8be79a8462345acfd32ed2384f905c84a6727ddf1f2fa2c2` | `tools/lab-labeling-sheet.mjs` |
| `e19f6511c05d34a9908c741d21aca8d3817d127c68a9f49efcd53eb72d4114f6` | `data/le-canon-index.json` — **unchanged from pass 01** |

Queue, Markdown, and labeling-sheet hashes are in `lab-corpus.manifest.json` under each source's
`companions`. Every recorded hash was re-verified against disk before this commit.

`fixtures/demo-v2.3.0.json` is the new reference baseline. `fixtures/demo-v2.2.0-canon-62c5cb511433.json`
is retained unchanged as the pre-fix reference.

```bash
node fixtures/diff-analysis.mjs fixtures/demo-v2.3.0.json after.json --mode alias
```

---

## Stop conditions

| Condition | Status |
|---|---|
| Any frozen-134 regression | **not triggered** — zero cases changed status or reasonCode |
| Any fixture match disappears after the gate fix | **not triggered** — 0 dropped on the fixture; the probe-battery "2 dropped" was capped-summary displacement, investigated and cleared |
| Source verification fails on 2+ sources | **not triggered** — 0 failed |
| Fix needs thresholds **and** >~10 new frames | **not triggered** — 0 threshold changes, 4 frames |
