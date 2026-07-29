# LE Lab v2.4.2 — release report

A correctness patch on v2.4.1, and every item in it comes from the same finding: **the flag file was
allowed to disagree with the analyzer while looking correct.** That is the only failure mode that
matters for an artifact whose entire job is to be evidence in someone else's adjudication, and v2.4.1
shipped four of them.

**No score, stance, admission, or match surface moved.** `fixtures/demo-v2.4.0.json` regenerates
byte-identical — `57bab28b…`, 179,521 bytes — and the frozen benchmarks are untouched.

```
Lab release token ......... v=2.4.1 -> v=2.4.2   (20 references across 9 files)
analyzer .................. 2.4.0            unchanged
scoringConfigHash ......... 1ntbwch          unchanged
canon index ............... 1.0.0+949aef381d5f  unchanged
analysis schema ........... le-lab.analysis/2.4  unchanged
diagnostics schema ........ le-lab.diagnostics/1.0  -> /1.1
feedback schema ........... le-lab.mapping-feedback/1.0 -> /1.1
suite ..................... 123 -> 150 pass / 0 fail
```

> **The analyzer version does not move, and this release is a good test of whether that rule means
> anything.** `js/lab-analyzer.js` changed — identity fields, a row digest, scoped traces, an
> allowlisted export surface, a fate enum. Not one of those changes a number.
> `provenance.analyzer.version` names the engine that produced the numbers, the numbers are
> byte-identical, so it stays at 2.4.0. What moved is announced by the two schema versions that exist
> precisely so the analyzer version does not have to absorb them.

| Commit | Subject |
|---|---|
| `7604ecd` | four ways a flag file can lie, frozen RED |
| `145a67f` | a trace has to rebuild the row it claims to explain |
| `f053475` | a candidate's fate, said accurately, for one passage at a time |
| `6a3a1a8` | name what goes out, and refuse a rule that cannot fire |
| this | release token, manifest, report |

**No stop condition fired.** Nothing required touching scoring, stance, admission, or the match
surface. The integrity check is sound without re-running analysis at flag time — see §1.3. No field
any existing consumer expects was dropped by the allowlist migration — see §3.1.

---

## 0. The RED commit

Four defects, eighteen failing cases, committed before a line of the fix. The nineteenth case was
green from the start and stayed that way: an identical review must still hash to an identical ID, and
the fix for the ID collision must not cost that.

| | Defect | Repro |
|---|---|---|
| **A** | The exporter accepts a trace that contradicts the row | candidates replaced with `[]`, excerpt and hash preserved → exports `available: true`, `candidateCount: 0`, above `frameworks:conversion-ladder 0.76` |
| **B** | `machineClaimLike` is read from a path nothing writes | demo passage re-included by override: `unit.machineClaimLike` `false`, `unit.isClaimLike` `true`, exported `null` |
| **C** | `flagId` collides across distinct reviews | two reviews, same unit and disposition, different expected concepts → `mfb-1o23ou0` both times, one filename, `--out` keeps the last |
| **D** | Candidate fate is mislabelled | `frameworks:sham-relationship` (retrieval rank 9) and `hierarchy:overview` (rank 14), both `context-eligible`, both reporting `survivedTruncationOnEvidence: true`; `hiddenByDisplayCaps` counting the 0.119 / 0.116 / 0.105 sub-threshold hits as cap-hidden |

---

## 1. INTEGRITY

### 1.1 The check that was missing

v2.4.1 asked the trace two questions: is this the same sentence, and was it scored by the same
configuration. **Both are properties of the build.** So are analyzer version, schema version, and
canon version. Every one of them holds for a trace of a different document analyzed by the same
engine, which is why a candidate set emptied to `[]` exported cleanly underneath a displayed primary
at 0.76 — and why a reader could not tell that file from a real one.

The check is now a **reconstruction**. The ledger row is recoverable from the trace: candidates marked
`match` are the displayed matches, in order, and the ones marked `weak-match` are the weak list. So
the exporter rebuilds the row out of the trace's own contents and requires it to come back identical —
mapped status, every canon ID, every score, every alignment, every confidence — and every refusal
names what disagreed.

```
The diagnostic trace does not reproduce the flagged row seg-…claim-02:
  the trace carries 0 displayed match(es) and the analysis shows 1.
  Re-run the analysis before flagging.
```

An adjudicator who receives one of those is being told which of two artifacts to distrust. Six frozen
must-refuse cases cover emptied candidates, a swapped canon ID, a moved score, a changed alignment, a
demoted display class, and a disagreement about whether the row mapped.

### 1.2 What the trace is a trace *of*

Diagnostics now carry identity, not just build metadata:

| Field | What it pins | Verifiable against the analysis? |
|---|---|---|
| `analysisId` | the analysis this trace belongs to | **Yes** — the analysis publishes the same value |
| `canonSnapshotHash` | the canon's actual lexical surface, not the version string it claims | No — provenance |
| `inputDigest` | the analyzed text and the overrides applied to it | No — provenance |
| `unitDigest` (per unit) | the published row this entry describes | **Yes** — recomputed from the analysis |

Only two of the four are checkable, and the module says so where it uses them rather than implying
the other two are more than provenance. A trace bearing a foreign `analysisId` is refused outright.

`claimUnitRowDigest` is exported from the analyzer and imported by the exporter, because two modules
have to agree byte for byte on what "the same published row" means, and a second implementation of
that would be a second opinion.

### 1.3 assertTraceMatchesAnalysis stopped trusting counts

The app-side guard compared IDs, versions, and two metrics: claim-like segments and mapped segments.
Those are aggregate shape. A run that produced entirely different mappings can agree on both.

It now compares **every published row's digest, in order**, plus the passage and set-aside counts. So
"the trace run reproduced the analysis on screen" means the ledger came back the same, not that the
header did.

> **The stop condition on cost did not fire.** Re-running full analysis at flag time was already the
> design — the trace has always been collected by re-running the analyzer on the stored document and
> stored overrides — so verifying against that run costs one digest per row over a run that was
> happening anyway. Measured at 249 ms end to end for a demo-sized document, from submit to file.

### 1.4 machineClaimLike

`applyDomainOverride` writes it on the **unit**, beside the `isClaimLike` it overwrites, so that "the
classifier said no and a visitor said yes" stays legible. The exporter read it from
`unit.domainRelevance`, where nothing has ever written it. It was `null` on every row, silently, and
on exactly the rows where it decides whether a complaint is about the gate or about the override.

### 1.5 Flag IDs

`flagId` hashed analysis + unit + disposition. Two reviewers who disagree about one wrong mapping —
or one reviewer revising an opinion — produced one ID, one filename, and `--out` kept whichever ran
last. It is now a content hash of the whole review: disposition, both concept lists, expected
alignment, note, provenance choice, unit, analysis.

The concept lists are hashed **in order**, deliberately. `expectedCanonIds[0]` is what the router
drafts as the expected primary, so two reviews naming the same concepts in a different order are two
different claims about what should have won.

Live, two conflicting reviews of the demo's `Selection, compatibility, and retention are different
tests.`:

```
mfb-1mjy9yy1p21pn   expected frameworks:smv-matching        -> mfb-1mjy9yy1p21pn.stub.json
mfb-1pz6nrf19mokkt  expected lexicon:term-conversion-ladder -> mfb-1pz6nrf19mokkt.stub.json
```

Two files. Under `1.0`, one. The ID also joins the **download** filename, because the browser's own
download folder was the second place a flag went missing.

**Nothing supersedes anything automatically.** Re-routing an unchanged flag rewrites the same stub
with the same bytes; a revised review lands beside the old one; which opinion won is an adjudication a
human records in the promoted case's `origin` block, and the losing flag stays in the inbox as part
of the record. `md/FEEDBACK-PIPELINE.md` says so, and so does the tool's own header.

---

## 2. DIAGNOSTICS

### 2.1 The fate enum, and why retention is not folded into it

`survivedTruncationOnEvidence` was computed from rank alone, so **anything** the v2.4.0 union kept
past the prefix cut claimed it had been kept on evidence — including the two demo candidates kept on
context. Exact evidence and bounded context are different retrieval rules, and telling them apart is
most of why anyone opens a trace at all.

Each candidate now carries one `fate`, whose **order is its definition**: each test is reached only
when the ones above it did not apply, so the value names the first thing that decided visibility.

| `fate` | Means |
|---|---|
| `retained-after-prefix-cut` | displayed, and it would not have existed before the union |
| `below-weak-threshold` | under `minWeakScore`; nothing downstream could have shown it |
| `credible-cap` | credible, past `maxMatchesPerClaim` |
| `weak-cap` | above the floor, not credible, past `maxWeakMatches` |
| `failed-admission` | above the floor, shown as weak, admission guard refused it |
| `displayed` | a displayed credible match |

**Retention is reported separately, and the demo is why.** `frameworks:sham-relationship` is *both*
union-retained and weak-capped; `hierarchy:overview` is *both* union-retained and below the weak
floor. One enum value per candidate would have traded one lie for another, so
`truncationFate.retainedAfterPrefixCut` and `retainedBecause` stay on every candidate, and the counts
are taken from those rather than from the enum — which, being first-match-wins, would undershoot.

All six values occur in the demo. A test asserts that, so none of the vocabulary is untested.

### 2.2 The counts now answer the questions they are named after

The worked example in the v2.4.1 report, re-flagged live at `:8753`:

```
"Selection, compatibility, and retention are different tests."

  v2.4.1  8 candidates · 3 displayed · 5 HIDDEN BY DISPLAY CAPS
  v2.4.2  8 candidates · 3 displayed · 0 hidden by display caps · 5 below the weak threshold

  r1  0.760  match          -> displayed
  r2  0.349  weak-match     -> failed-admission
  r3  0.311  weak-match     -> failed-admission
  r4  0.119  not-displayed  -> below-weak-threshold
  r5  0.116  not-displayed  -> below-weak-threshold
  r6  0.105  not-displayed  -> below-weak-threshold
  r7  0.098  not-displayed  -> below-weak-threshold
  r8  0.090  not-displayed  -> below-weak-threshold
```

Nothing on that row was ever capped. The old number sent an adjudicator to look at a display cap when
the answer was a score — two different fixes, in two different places.

`hiddenByDisplayCaps` and `hiddenBelowWeakThreshold` partition `notDisplayedCount` exactly, asserted
on every row of the demo. `retainedOnEvidenceAfterCap` counts exact-evidence retention only.

### 2.3 Per-unit traces, measured

v2.4.1 collected the whole document's trace on the first flag. The claim in its §1.5 — "roughly 10 KB
per claim unit, which on a 2,500-unit document is tens of megabytes" — gave one number where the
range is what matters. Measured across the demo, three corpus articles, and a synthetic alias-dense
worst case:

| Source | Passages | Whole-document trace | Scoped to one passage |
|---|---:|---:|---:|
| Demo transcript | 11 | 117.4 KB | **16.1 KB** (13.7%) |
| `01-pew-online-dating` | 64 | 638.4 KB | **12.2 KB** (1.9%) |
| `04-heteropessimism` | 29 | 266.6 KB | **11.4 KB** (4.3%) |
| Alias-dense worst case | 406 | **5.21 MB** | **21.5 KB** (0.4%) |

Per-unit is 9.4–12.6 KB median and 21 KB at its worst, so v2.4.1's per-unit figure was right; the
document figure runs from 117 KB to 5.21 MB, with the 2,500-unit ceiling near 31 MB. "Tens of
megabytes" is the ceiling, not the typical case, and both numbers are now moot for the flag flow:

```
diagnostics: true                    the whole document — CLI, fixtures, tests
diagnostics: { segmentIds: [id] }    those claim units only — the flag flow
```

Analysis still runs whole. It always did, and bounded context makes each passage's result depend on
its predecessor. What is scoped is the trace **assembly**, which is where the size is. A scoped trace
is byte-identical to the same unit in a whole-document trace — asserted, because a flag file
describing a run nobody else can reproduce would be worth nothing — and `scope`,
`requestedSegmentIds` and `analyzedClaimUnitCount` travel in the payload so a reader who finds one
unit can tell "that is all there was" from "that is all that was asked for".

---

## 3. SCHEMA

### 3.1 `publicShape` is an allowlist

It stripped working fields by **prefix**. That is a convention, not a boundary: it holds only while
every field anyone hangs on a candidate happens to be named for it, and `_retrieval` reached an export
once already, back when the strip was by name.

It is now an allowlist of the twenty-one fields a match publishes, in publication order. That
inverts the failure: forgetting to allowlist a new field is a **missing feature**, which gets
noticed; shipping it by default is a **leak**, which does not.

**The stop condition on dropped fields did not fire.** The allowlist was derived from the frozen demo
fixture's actual key set, not written from the source, and the output is byte-identical. Four tests
hold it there: the published surface equals the allowlist exactly, no allowlisted name is dead
vocabulary nothing produces, key order is stable (the fixture is compared byte for byte), and — the
case the underscore rule could never catch — a working field called `internalNotes` is stripped as
readily as `_rawScore`. The recursive no-underscore walk stays as the backstop for the rest of the
document.

### 3.2 Alias typing requires a single token

The analyzer's promotion pass iterates the alias list filtered to entries with no space in them. A
multiword alias typed `standalone` or `contextual` is therefore **never consulted** — it does nothing,
forever, and reads in the source exactly like a rule that works. That is the same failure the existing
"types an alias that is not an alias" check catches, one level in.

Both the builder and the validator now refuse it. Verified against a tampered index:

```
AssertionError: frameworks:smv-matching types "hypergamous mating" standalone, but typing only
reaches single-token aliases — the analyzer's promotion pass never sees a multiword one, so this
rule is inert
```

The shipped canon is unchanged (`3abe4d5c…`); both typed entries — `frameworks:smv-matching`
(`hypergamy`) and `smv:money:provisioning-signal` (`provider`, `breadwinner`) — were already single
tokens. Multiword aliases themselves are fine and already earn phrase treatment on their own length.
Claiming to *type* one is the error.

### 3.3 Weak matches, documented as they actually are

v2.4.1's documents described the display block as carrying weak matches "with score, confidence,
alignment, and match trace". It never has. Stance runs on credible candidates only.

```
display.primary / .secondary   rank · canonId · title · href · category · subcategory ·
                               evidenceType · score · confidence · alignment · whyMatched · contextHelp
display.weak                   rank · canonId · title · score · confidence          ← and nothing else
```

`whyMatched`, `contextHelp` and the rest of a weak candidate's record are in `candidateTrace`, one
lookup away. Corrected in `md/FEEDBACK-PIPELINE.md`, `md/lab-schemas.md` and the v2.4.1 report, and
pinned by a test asserting the exact key list — because a document that overstates a payload leaves an
adjudicator hunting a field and then guessing which of the two artifacts is broken.

---

## 4. Verification

```
ANALYZER BEHAVIOR UNCHANGED
  fixtures/demo-v2.4.0.json ......... 57bab28b… — REGENERATED and byte-identical (179,521 bytes)
  data/le-canon-index.json .......... 3abe4d5c… — identical
  domain-relevance-benchmark.json ... 708f4386… — identical
  match-behavior-benchmark.json ..... 8f7c0935… — identical
  short-utterance-matrix.json ....... 06a5e1da… — identical
  scoringConfigHash ................. 1ntbwch  — identical

SUITE  (npm run test:lab)
  lab-intake ...................... 28 pass / 0 fail
  lab-analyzer .................... 41 pass / 0 fail   (+2: allowlist, ordinary-name strip)
  lab-domain-benchmark ............ 3 pass / 0 fail
  lab-match-behavior .............. 6 pass / 0 fail
  lab-export ...................... 8 pass / 0 fail
  lab-ledger ...................... 5 pass / 0 fail
  lab-feedback .................... 22 pass / 0 fail
  lab-feedback-integrity .......... 25 pass / 0 fail   (new — the RED file, now green)
  lab-canon-mapping-benchmark ..... 4 pass / 0 fail
  lab-short-utterance ............. 8 pass / 0 fail
  ------------------------------------------------------------------
  TOTAL ........................... 150 pass / 0 fail  (was 123)
  canon-index-fixtures ............ 450 concepts / 19 sources / 2 typed-alias entries
  validate-canon-index ............ 450 concepts, 1.0.0+949aef381d5f
  lab_release_audit ............... PASSED (10 modules, 16 edges, 2 resources, v=2.4.2)
  lab_ui_audit .................... PASSED (151 IDs, 29 ARIA refs, 33 named buttons)
  site_integrity_audit ............ PASSED

FROZEN FLOORS
  domain benchmark, 152 cases ..... UNTOUCHED — the file is byte-identical, so the v2.4.0
                                    figures stand: recall 1.000 · ignorePrecision 1.000 ·
                                    junkRecall 0.821

BROWSER  (:8753, lab.html, no console errors)
  release token ................... every module served at v=2.4.2
  ledger .......................... 11 rows × 8 columns · 18 flag controls (11 ledger + 7 triage)
  mapped flag ..................... 249 ms, 21,872-byte file, scope "claim-units"
  the corrected row ............... 8 candidates · 3 displayed · 0 cap-hidden · 5 below threshold
  weak-match keys ................. rank, canonId, title, score, confidence — exactly
  identity in payload ............. analysisId lea-151gtlc · unitDigest ltrotxftamvv ·
                                    canonSnapshotHash 1v8z11a1xzrjgp · inputDigest 1vj04ho179u6z7
  set-aside flag .................. retrieval-not-run, no trace fetched
  network after flagging .......... 0 requests
  storage after flagging .......... localStorage [] · sessionStorage [] · cookies ""

ROUTER  (tools/lab-feedback.mjs)
  two conflicting reviews, one row .. two IDs, two stub files, exit 0 twice
  trace line ........................ "8 candidates · 3 displayed · 0 hidden by display caps ·
                                       5 below the weak threshold"
```

---

## 5. SHA-256 manifest

| SHA-256 | File |
|---|---|
| `b3d5918056e1790e488964a66e604b40585f871444d92d1956d74204ea841d9b` | `js/lab-analyzer.js` |
| `88f117326470779f55259acc9972c2f31cb2b07f1cb39fd0137feaf86fb80fc5` | `js/lab-feedback.js` |
| `62374516f7eb2b8749ec2ce088a420b328e1b242b35f102f5b5d37dcf7301a7a` | `js/lab-app.js` |
| `e89f296a4d0a8370a85098d004ba0f8b64d8ad0ff884d6beeadba357b1db65b8` | `js/lab-analyzer-client.js` |
| `4a6d16292b888cac217a269f08c1939660a73ff6a7093cfef4e552b1d0c3f06a` | `tools/lab-feedback.mjs` |
| `0b9dde0c7c829a33d746f4ff677d5728d57b65db6d0baf51417ba4c68e009345` | `tests/lab-feedback-integrity.test.mjs` **(new)** |
| `c03933516bb234726c07d0d2ab08e885535f8413b5cd4975ab76b7666c958fc6` | `scripts/validate-canon-index.mjs` |
| `65a510336a5f11ece5735a2b4fc3465a87a07d1d867956f36415ef354759e1d7` | `scripts/build-canon-index.mjs` |
| `550eb68918f943b577ef19a74792febd7b7b128d2e1da9db7a4d9a6e493bc6cd` | `md/FEEDBACK-PIPELINE.md` |
| `296f35d0295082147a5fea8a970a40d83c66a8e16690fdc36e948662e8dcd164` | `lab.html` |
| `8932bc87440ccf7ad12f39ddd68a43924d9b74afd088deed2c0f7992be26d1e8` | `css/lab.css` |
| `57bab28b7ea45ea4de0033f7b3b584cf271e9cafaec9cc32b7dd138897c12c07` | `fixtures/demo-v2.4.0.json` *(unchanged)* |
| `3abe4d5c1c86e843d3ada56fcf185078993ed3067882b8ea03236f532fe50c43` | `data/le-canon-index.json` *(unchanged)* |
| `708f438672f151827f93c795bfa147ceb6468c0136d19d81f53a2f8482e47771` | `tests/fixtures/domain-relevance-benchmark.json` *(unchanged)* |
| `8f7c09358ffd9a47711aef32db3922dedd99d415b04727ece15194cc6f51a817` | `tests/fixtures/match-behavior-benchmark.json` *(unchanged)* |
| `06a5e1da7078b36396406fc04b1b9951079700b603f6209f26b6f9e48cb4e846` | `tests/fixtures/short-utterance-matrix.json` *(unchanged)* |
| `3b78c5cc528b7e4562191e30ec7cdeb9609892d508205daa3426d398db46fba3` | `tests/fixtures/canon-mapping-benchmark.json` *(unchanged, still empty)* |

`js/lab-ledger.js`, `js/lab-demo.js`, `js/lab-export.js`, `js/lab-extractors.js`, `js/lab-intake.js`
and `js/lab-analyzer-worker.js` changed only their `?v=` import tokens.

---

## 6. Corpus

**Not re-run, and for the same reason as v2.4.1.** A re-run is only meaningful when the instrument
moved. The analyzer, canon index, overlay and scoring configuration produce byte-identical output, so
every v2.4.0 export in `lab-corpus/` remains current and `lab-corpus.manifest.json` needs no
supersession entry.

The corpus was used here as a **measuring instrument** rather than a subject: §2.3's trace sizes were
taken against three of its articles. No source text was committed.

---

## 7. Open, and deliberately not done here

1. **Everything open in v2.4.1 §7 is still open.** `game`/`rizz` typing blocked on ds-13; methodology
   prose on the match surface; threshold calibration, with every export still carrying
   `coverage.provisional`. Nothing in this release touched any of them, by contract.
2. **`claimLikelihood` is still not published for set-aside passages.** Additive to
   `le-lab.analysis`, so it belongs to a release allowed to move the analysis contract. v2.4.1 §1.4
   stands unchanged.
3. **The mapping benchmark still has no cases.** By design. The first arrives through the pipeline.
4. **`canonSnapshotHash` and `inputDigest` are provenance, not verification.** Nothing checks them
   against the published analysis, because the analysis does not publish anything to check them
   against. Publishing an input digest on `le-lab.analysis` would make them checkable and is additive
   — again, a release allowed to move that contract.
5. **The allowlist covers the match surface, not every depth.** That is where working fields were
   actually hung, and the recursive no-underscore walk is the backstop everywhere else. A full
   published-schema freeze would be stronger and is a larger piece of work than a patch release.
6. **A second flag on a row does not supersede the first.** Deliberate — see §1.5 — but it means an
   inbox can hold contradicting opinions with nothing but the adjudicator's notes to resolve them.
   That is the correct place for it and worth saying out loud.
