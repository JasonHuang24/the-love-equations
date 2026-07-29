# LE Lab v2.4.1 — release report

A diagnostic and interface release on top of v2.4.0. It gives a reviewer somewhere to put a
disagreement, a documented path for that disagreement to travel, and a frozen record of what the
analyzer does with the compact utterances a future structural pass will have to argue about.

**The analyzer did not change.** `js/lab-analyzer.js` is byte-identical to v2.4.0 — same SHA-256,
`0e86957c…` — and so are the canon index, the overlay, the demo freeze, and both existing benchmarks.
Every behavioral claim in the v2.4.0 report still holds unmodified.

```
Lab release token ......... v=2.4.0 -> v=2.4.1   (16 references across 7 files)
analyzer .................. 2.4.0            unchanged
analysis schema ........... le-lab.analysis/2.4  unchanged
diagnostics schema ........ le-lab.diagnostics/1.0  unchanged
canon index ............... 1.0.0+949aef381d5f  unchanged
scoringConfigHash ......... 1ntbwch          unchanged
feedback schema ........... (new) le-lab.mapping-feedback/1.0
mapping benchmark ......... (new) le-canon-mapping-benchmark/1.0
short-utterance matrix .... (new) le-lab.short-utterance-matrix/1.0
ledger columns ............ 7 -> 8  (Review joins Triage)
```

> **THE RELEASE TOKEN AND THE ANALYZER VERSION ARE NOT THE SAME NUMBER, and this release is the
> reason to say so out loud.** The token is the cache-buster on every Lab module; the interface
> changed, so it moves. `provenance.analyzer.version` names the engine that produced the numbers; the
> engine did not change, so it does not. Every flag file carries both, because the first question in
> triage is which of the two produced the behavior being complained about.

| Commit | Subject |
|---|---|
| `f90c61c` | flag a mapping, and the file goes to your disk |
| `eb2397e` | a review inbox with a routing table, and a tool that only drafts |
| `a7d7681` | freeze what compact utterances actually do, and which layer decides |
| this | manifest, schemas, release report |

**No stop condition fired.** The Pass A adapter boundary carried the required trace without a single
reach into analyzer internals; nothing in this release required an analyzer behavior change; the
feedback schema did not force an analysis-contract change. One adapter limitation was found and is
documented in §1.4 — it is a property of what the analysis publishes for set-aside passages, not a
defect, and it is reported in the payload rather than papered over.

---

## 1. Flag-mapping export

### 1.1 What a reviewer does

Every ledger row now carries a **Flag** control in a new Review column, and every passage the
relevance gate set aside carries one in the triage panel — the only place a set-aside passage can be
flagged, since it has no ledger row. The dialog opens with a disposition already selected by row kind
(`wrong-primary` for mapped, `missing-expected-concept` for unmapped, `domain-gate-error` for
set-aside), the current primary pre-filled into the forbidden-concepts field, and a 450-entry canon-ID
datalist behind both concept fields. Jason flags mid-production; the friction budget is one click, one
radio, one submit.

Review and Triage are separate columns rather than one, because they are separate judgements with
separate destinations: Triage says what the gate should have decided about the passage, Review says
what the matcher should have decided about the mapping.

### 1.2 Transport

Local download. That is the whole of it.

```
network requests after flagging ......... 0   (read_network_requests, :8753)
localStorage keys ....................... 0
sessionStorage keys ..................... 0
fixtures written ........................ 0
```

The privacy card on `lab.html` says so where the decision is made, and `lab_ui_audit.py` now fails if
that disclosure goes missing — the same treatment the provisional-coverage tag gets.

### 1.3 What the payload carries, and where each field came from

`le-lab.mapping-feedback/1.0`. **Nothing is re-derived.** Two analyzer outputs supply everything:

| Block | Source |
|---|---|
| `claimUnit` — normalized excerpt, stable ID, parent-segment boundary, speaker, timestamps, claim likelihood, bounded-context bridge and its immediate predecessor | `le-lab.analysis/2.4` |
| `domainDecision` — status, decisive reason code, per-frame scores, cue evidence | `le-lab.analysis/2.4` |
| `display` — primary, secondary, weak matches with score, confidence, alignment, match trace | `le-lab.analysis/2.4` |
| `candidateTrace` — the whole working candidate set before display caps | `le-lab.diagnostics/1.0` |
| `build` — Lab release, analyzer version and mode, scoring hash, canon schema and version, analysis schema, diagnostics schema | both |
| `review` — disposition, failure layer, expected/forbidden concepts, expected alignment, note | the reviewer |

The trace is the point of the whole exercise. A reviewer looking at the ledger sees at most four
matches and three weak ones; the candidate that explains the wrong mapping is usually neither. A real
flag from the demo:

```
"Selection, compatibility, and retention are different tests."
  8 candidates retrieved · 3 displayed · 5 HIDDEN BY DISPLAY CAPS
  rank 1  frameworks:conversion-ladder   0.760  match          surfaces: alias, commonMisreading
  rank 2  smv:looks                      0.349  weak-match     surfaces: boundaryCondition
  rank 3  pills:page-bp                  0.311  weak-match     surfaces: boundaryCondition, commonMisreading
  rank 4  hierarchy:…practical-compatibility  0.119  not-displayed   penalty: sparse-shared-tokens
  rank 5  instrument:compatibility-calculator 0.116  not-displayed   penalty: sparse-shared-tokens
  rank 6  lexicon:term-conversion-ladder      0.105  not-displayed   penalty: sparse-shared-tokens
  …
```

Ranks 4–6 were invisible to the reader before this release. They are now in the file, with the
penalty that sank each one named rather than inferred.

**`reviewDisposition`, never `verdict`.** A verdict on this site is a Mythbuster ruling about a claim's
truth; this is a reviewer's opinion about a mapping. A test asserts the string never appears anywhere
in the payload.

**Provenance is opt-in and the transcript never travels.** With the box unticked, `source` carries
only `included: false` and the reason. A test walks every other passage in the source document and
asserts none of them leaked — with one permitted exception, the bounded-context predecessor, which is
part of the analyzer's decision about the flagged unit and is included only when the bridge was
eligible.

### 1.4 The one adapter limitation, reported rather than hidden

The brief's stop condition was: halt if the Pass A boundary is insufficient. It was sufficient. One
field is genuinely unavailable, and it is not a trace gap:

**A set-aside passage has no candidate trace, because retrieval never ran for it.** The gate decides
before any canon entry is scored, so there is no candidate set in existence to report. The payload
says `retrieval-not-run` with an explanation, and the app does not even fetch a trace for those rows.

Alongside that, `domainRelevance.ignoredPassages[]` does not publish `claimLikelihood`, `isClaimLike`,
`sourceBoundary`, or `boundedContext` — the analysis publishes those for retained passages only. The
payload reports each as `null` and lists them under `claimUnit.unpublishedFields` with the reason.
Recomputing them here was the alternative and was rejected: a number this exporter invented would be
indistinguishable in the file from one the analyzer produced, and only one of those is evidence.

**Impact: none on the routing that matters.** The dispositions a set-aside row can carry —
`domain-gate-error`, `should-remain-unmapped`, `segmentation-error` — are all adjudicated from the
reason code and frame evidence, which *are* published. If a future pass wants claim likelihood on
ignored passages, that is an additive change to `le-lab.analysis` and belongs to a release that is
allowed to move the analysis contract.

### 1.5 How the trace is collected

On demand, cached per analysis, not kept for every run.

The trace is the entire pre-display candidate set for every passage — roughly 10 KB per claim unit,
which on a 2,500-unit document is tens of megabytes to build, structured-clone out of the worker, and
hold, for a session that in most cases never flags anything. So the first flag re-runs the analyzer
with `diagnostics: true` on the **stored document and stored overrides**, and every later flag in the
session reads the cache.

> **CORRECTED IN v2.4.2 (2026-07-29).** The paragraph above gives one number where the range is what
> matters, and it describes a design that no longer ships. Measured: ~10 KB per claim unit holds
> (median 9.4–12.6 KB, max 21 KB), but the whole-document figure is 117 KB for the demo, 638 KB for a
> 64-passage corpus article, and 5.21 MB for a 406-passage alias-dense source — with the 2,500-unit
> ceiling around 31 MB. "Tens of megabytes" is the ceiling, not the typical case. More to the point,
> **v2.4.2 stopped building it**: a flag now requests the trace for the flagged passage only, so the
> worst case measured above costs 21.5 KB instead of 5.21 MB. See `md/lab-v2.4.2-release.md` §2.

Determinism is what makes that sound, and it is checked rather than assumed. The re-run must agree
with the analysis on screen on analysis ID, schema, analyzer version, scoring hash, canon version,
claim-like count and mapped count; if it does not, the export refuses. The cache is dropped on every
new analysis, every override re-run, and every reset. Three further refusals throw rather than
producing a flag that looks filed but is unusable: an unknown disposition, a trace whose excerpt
disagrees with the flagged row, and a retained row missing from the trace.

---

## 2. Review inbox and routing

`md/FEEDBACK-PIPELINE.md`: **collect → redact → adjudicate → promote**.

The inbox is `lab-feedback/` — gitignored, on the same reasoning as `lab-corpus/`: a flag quotes
someone's source, and the repository is not where third-party text lives. What reaches the repo is the
adjudicated case, in a commit that names who decided it.

### The routing table

| Failure layer | Dispositions | Destination |
|---|---|---|
| domain-gate | `domain-gate-error` | `tests/fixtures/domain-relevance-benchmark.json` (152 cases) |
| retrieval-ranking | `wrong-primary`, `false-positive`, `missing-expected-concept`, `should-remain-unmapped` | `tests/fixtures/canon-mapping-benchmark.json` **(new)** |
| alignment | `wrong-stance` | the same file, as a stance assertion on a mapping case |
| segmentation | `segmentation-error` | `tests/lab-intake.test.mjs` — intake cases are code |
| score component | *(not a disposition — an adjudication finding)* | a focused unit regression in `tests/lab-analyzer.test.mjs` |

The table exists twice: as prose in the pipeline document and as executable code in
`tools/lab-feedback.mjs`, with a test asserting every disposition routes to exactly one destination.
The document states that if they ever disagree, the tool is right.

The score-component row deliberately has no disposition behind it. A reviewer sees a wrong mapping,
not a wrong `sparseSharePenalty`; that identification is made during adjudication by a human reading
`components` and `penalties` on the candidate that should have won. A benchmark case would be the
wrong instrument for it — it would pass or fail for a dozen reasons at once.

### The tool drafts; it never applies

`tools/lab-feedback.mjs` validates, routes, checks **both** frozen benchmarks for the same passage, and
emits the case a human would commit — with every human field left as an explicit `TBD` it declined to
fill. Writing into `tests/fixtures/` is refused outright, because a tool that could edit a frozen
benchmark would make "append-only" a courtesy rather than a property.

Exit codes carry the result: `0` routed and drafted, `1` invalid, `2` already covered.

### The new benchmark ships empty

`tests/fixtures/canon-mapping-benchmark.json` has zero cases, on purpose. Its first case will come from
an adjudicated flag, not from an author inventing sentences to fill a fixture. The validator runs
regardless, so the receptacle cannot rot while it waits: it rejects a case with no `origin`, no
`observedAtFreeze`, a duplicate text, a canon ID the index no longer has, or — the one that matters —
a case that asserts nothing and would therefore pass forever.

### 2.1 First inbox case: ds-13, and the route that correctly ends in nothing

The inaugural adjudication, and it produces no fixture. That is the result, not a shortfall.

```
$ node tools/lab-feedback.mjs lab-feedback/inbox/le-lab-feedback-domain-gate-error-….json

flag ............ mfb-1m0tilr
disposition ..... domain-gate-error (Relevance gate got it wrong)
failure layer ... domain-gate
row ............. unmapped
build ........... Lab 2.4.1 · analyzer 2.4.0 · canon 1.0.0+949aef381d5f · scoring 1ntbwch
trace ........... 8 candidates, 5 hidden by display caps
excerpt ......... "The studio patched the game so ranked players get fewer unfair matches."

ROUTE ........... tests/fixtures/domain-relevance-benchmark.json
ALREADY COVERED . ds-13 in tests/fixtures/domain-relevance-benchmark.json

Nothing to append. The case is already frozen; the work is the fix, not the fixture.
```

Exit `2`. The reviewer is right and the benchmark already agrees with them: ds-13 has been on record as
a known fail-open miss since the append on 2026-07-29 — retained, visibly triage-labelled, excludable
by hand, never silent data loss. Appending a second copy would inflate the case count without adding a
fact.

The flag is not wasted. It confirms the miss from an independent direction, and ds-13 remains the
stated blocker on typing `game` and `rizz` as contextual aliases on `smv:charm`: typing them today
gains `ds-01` and `ds-03` and loses `ds-13`, moving junk from *merely retained* to *mapped onto a canon
concept*. The unblocking condition is unchanged — fix the gate miss, then type the aliases.

**A pipeline whose only success condition was "a case was added" would have appended a duplicate
here.** That is why the router checks both benchmarks before drafting anything, and why exit code `2`
is a result rather than an error.

---

## 3. Short-utterance matrix — freeze only

Twenty compact passages, frozen at what the shipped analyzer currently does. No detector changed, no
threshold moved, and `minClaimWords` is 4 exactly as it was — asserted by a test, so this fixture can
never quietly become the justification for having moved it.

### The headline, and it is not the expected one

**For three of the four named compact claims, the binding constraint is the DOMAIN GATE, not the
claim-word floor.**

| Case | Text | Words | Outcome | Decided by |
|---|---|---|---|---|
| su-01 | *Hypergamy is real.* | 3 | ignored | **domain-gate** |
| su-02 | *The wall is real.* | 4 | ignored | **domain-gate** |
| su-03 | *Provider men win.* | 3 | ignored | **domain-gate** |
| su-04 | *Men prefer youth.* | 3 | retained-not-claim-like | claim-word-floor |

su-02 is the load-bearing row: at four words it **clears** claim grammar — `isClaimLike` is true — and
the gate sets it aside anyway. Claim detection and domain relevance are independent rules, and no
movement on `minClaimWords` would rescue that passage.

### The expanded twins settle it

Each claim rewritten past every length floor, nothing else changed:

| Case | Text | Words | Outcome | Decided by |
|---|---|---|---|---|
| su-05 | *Hypergamy is real and it shapes who women pursue.* | 9 | **still ignored** | domain-gate |
| su-06 | *The wall is real and it lands hardest on looks-dependent women.* | 12 | **still ignored** | domain-gate |
| su-07 | *Provider men win because resources still signal commitment.* | 8 | **mapped** 0.54 → `smv:money:provisioning-signal` | none |
| su-08 | *Men prefer youth when they are selecting for fertility.* | 9 | retained-unmapped, best candidate 0.275 | admission-threshold |

Nine words, claim-likelihood doubled to 0.60, a participant named — and su-05 is still ignored. Length
is not what is wrong with those rows. **A structural path that only lowers `minClaimWords` would move
exactly one of the four**, and su-07 shows that everything downstream of the gate already works on
this material: the v2.4.0 contextual `provider` alias fires and the passage maps credibly, while its
three-word twin never reaches retrieval.

su-08 is a different problem wearing the same clothes — past the gate, past claim grammar, and stopped
by a 0.43 floor against a 0.275 best candidate. That belongs to the coverage-is-a-threshold-problem
finding from the gate append, not to anything about short utterances.

### The adversarial half is green

All twelve short non-claims and polysemous traps are correctly ignored — *Right.*, *Anyway, moving
on.*, *That makes sense.*, *Game respects game.*, *Providers vary.*, *Our provider went down.*, *The
wall is load-bearing.*, *He has rizz.* A test enforces that their word counts match the claim rows one
for one: a three-word claim is only interesting beside a three-word non-claim, and without the control
"short text is handled badly" is unfalsifiable.

One result worth carrying forward: **shortening a trap can make the gate more accurate.** *Ranked
matches were unfair.* is correctly ignored, while ds-13's longer form is retained fail-open on the
`dating-app-interaction` frame that *"fewer … matches"* trips.

### What the matrix is for

It is green today by construction. Its value is the day it goes red: a future structural pass through
compact utterances arrives to find every row's previous behavior written down, with the layer that
decided it already identified, and has to adjudicate each change deliberately. The test re-derives
each row's binding constraint from the analyzer rather than trusting the label, so the headline above
is checked and not merely asserted.

---

## 4. Verification

```
ANALYZER UNCHANGED
  js/lab-analyzer.js ................ 0e86957c… — identical to v2.4.0
  data/le-canon-index.json .......... 3abe4d5c… — identical
  fixtures/demo-v2.4.0.json ......... 57bab28b… — REGENERATED and byte-identical
  diff-analysis --mode freeze ....... RESULT: PASS, 0 behavioral differences
  domain-relevance-benchmark.json ... 708f4386… — identical
  match-behavior-benchmark.json ..... 8f7c0935… — identical

SUITE  (npm run test:lab)
  lab-intake ...................... 28 pass / 0 fail
  lab-analyzer .................... 39 pass / 0 fail
  lab-domain-benchmark ............ 3 pass / 0 fail
  lab-match-behavior .............. 6 pass / 0 fail
  lab-export ...................... 8 pass / 0 fail
  lab-ledger ...................... 5 pass / 0 fail
  lab-feedback .................... 22 pass / 0 fail   (new)
  lab-canon-mapping-benchmark ..... 4 pass / 0 fail    (new)
  lab-short-utterance ............. 8 pass / 0 fail    (new)
  ------------------------------------------------------------------
  TOTAL ........................... 123 pass / 0 fail  (was 89)
  canon-index-fixtures ............ 450 concepts / 19 sources / 2 typed-alias entries
  validate-canon-index ............ 450 concepts, 1.0.0+949aef381d5f
  lab_release_audit ............... PASSED (10 modules, 14 edges, 2 resources, v=2.4.1)
  lab_ui_audit .................... PASSED (151 IDs, 29 ARIA refs, 33 named buttons)
  site_integrity_audit ............ PASSED

FROZEN FLOORS
  domain benchmark, 152 cases ..... UNTOUCHED — the file is byte-identical, so the
                                    v2.4.0 figures (recall 1.000 · ignorePrecision
                                    1.000 · junkRecall 0.821) stand unchanged

BROWSER  (:8753, lab.html, no console errors)
  ledger .......................... 11 rows × 8 columns
  flag controls ................... 18 (11 ledger + 7 triage)
  mapped flag ..................... 21 KB file, 8 candidates traced, 5 hidden by caps
  set-aside flag .................. retrieval-not-run, provenance opt-in honored
  network after flagging .......... 0 requests
  storage after flagging .......... localStorage [] · sessionStorage []

ROUTER  (tools/lab-feedback.mjs)
  valid retrieval-ranking flag .... routed, stub drafted, exit 0
  ds-13 domain-gate flag .......... already covered by ds-13, no stub, exit 2
  non-feedback JSON ............... 11 named validation errors, exit 1
  --out tests/fixtures ............ refused, exit 1
```

---

## 5. SHA-256 manifest

| SHA-256 | File |
|---|---|
| `0e86957c461ff5cb3bfbb66cfdfd3c4b15876ee7e610e7f2c3821d3ee0c55a09` | `js/lab-analyzer.js` *(unchanged)* |
| `3abe4d5c1c86e843d3ada56fcf185078993ed3067882b8ea03236f532fe50c43` | `data/le-canon-index.json` *(unchanged)* |
| `57bab28b7ea45ea4de0033f7b3b584cf271e9cafaec9cc32b7dd138897c12c07` | `fixtures/demo-v2.4.0.json` *(unchanged)* |
| `708f438672f151827f93c795bfa147ceb6468c0136d19d81f53a2f8482e47771` | `tests/fixtures/domain-relevance-benchmark.json` *(unchanged)* |
| `8f7c09358ffd9a47711aef32db3922dedd99d415b04727ece15194cc6f51a817` | `tests/fixtures/match-behavior-benchmark.json` *(unchanged)* |
| `da58db0771d034e514113c8311006d80a0305879847d9ff806d0ef76335de3f4` | `js/lab-feedback.js` **(new)** |
| `49b669a3e3ccb6789580cf21c3061da9388241c88bbb0eadfda11d581afe2f91` | `js/lab-app.js` |
| `8b438ac3ab62a7918283479ff4ff675b2682970a684cb90a5623e5ebb71b1fd9` | `js/lab-ledger.js` |
| `2cc3abb00c633008a749b50a4ab6335548affba3a89ff088886a20adc2164660` | `lab.html` |
| `d6a493290f140c53cc2cce75f6aff51e915680a011613d0803d566a4b371bd8a` | `css/lab.css` |
| `7980b72037d713cd65568b63ea8597d6ab2b4d75235cff77d955bbe655860f05` | `tools/lab-feedback.mjs` **(new)** |
| `3b78c5cc528b7e4562191e30ec7cdeb9609892d508205daa3426d398db46fba3` | `tests/fixtures/canon-mapping-benchmark.json` **(new)** |
| `06a5e1da7078b36396406fc04b1b9951079700b603f6209f26b6f9e48cb4e846` | `tests/fixtures/short-utterance-matrix.json` **(new)** |
| `c8842c62cbef68dc4a2364f74cde26d6f7f19edb51eb90d2f54683ddb797233a` | `md/FEEDBACK-PIPELINE.md` **(new)** |

Hashes for `js/lab-app.js`, `lab.html`, `css/lab.css` and `js/lab-ledger.js` moved; every other Lab
module changed only its `?v=` import token.

---

## 6. Corpus

**Not re-run, and deliberately.** A re-run is only meaningful when the instrument moved. The analyzer,
canon index, overlay and scoring configuration are byte-identical to v2.4.0, and the demo fixture
regenerates to the same 187,670 bytes — so every v2.4.0 export in `lab-corpus/` remains current and
`lab-corpus.manifest.json` needs no supersession entry. The `epoch` block in that manifest names the
analyzer version, which has not changed.

---

## 7. Open, and deliberately not done here

1. **The three v2.4.0 items are untouched and still open**: `game`/`rizz` typing blocked on ds-13;
   methodology prose on the match surface; threshold calibration, with every export still carrying
   `coverage.provisional`. §8 of `md/lab-v2.4.0-release.md` is unchanged.
2. **The gate is where the short-utterance work actually is.** §3 measured it: three of four compact
   canon claims die at the gate, and stay dead when expanded to nine and twelve words. Whatever comes
   next should start there, not at `minClaimWords` — and the matrix is now the red baseline waiting
   for it.
3. **`claimLikelihood` is not published for set-aside passages.** §1.4. Additive to
   `le-lab.analysis`, so it belongs to a release allowed to move the analysis contract.
4. **`lab-feedback/` does not exist yet.** It is gitignored and created on first use; the pipeline
   document has the `mkdir`.
5. **The mapping benchmark has no cases.** By design. The first one arrives through the pipeline.
6. **The flag inbox is a sample, not a measurement.** Nothing in it supports a claim about how often
   the Lab is right, and the pipeline document says so where someone might be tempted.
