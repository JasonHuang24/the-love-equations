# LE Lab — the feedback pipeline

**What this is.** The path a reviewer's disagreement takes from the Lab interface to a frozen fixture.
Four steps: **collect → redact → adjudicate → promote**. Every step is a human's, except the two the
tooling can do without judgement — validating the file and drafting the stub.

**What this is not.** Automation. Nothing here promotes a case, edits a benchmark, or moves a
threshold. A flag is one person's opinion about one mapping, and it earns a place in a frozen fixture
by surviving adjudication, not by arriving.

---

## 0. The shape of the thing

```
Lab ledger row  ──[Flag]──▶  le-lab.mapping-feedback/1.1  ──▶  lab-feedback/inbox/
                                  (local download)                     │
                                                                       ▼
                                                        tools/lab-feedback.mjs
                                                     validate · route · draft stub
                                                                       │
                                                                       ▼
                                                            human adjudication
                                                                       │
                                              ┌────────────────────────┼───────────────────┐
                                              ▼                        ▼                   ▼
                                   domain benchmark        canon-mapping benchmark    intake fixtures
                                   (append, human commit)  (append, human commit)     (test code)
```

---

## 1. Collect

In the Lab, every ledger row carries a **Flag** control in its Review column, and every passage the
relevance gate set aside carries one in the triage panel. Flagging opens a picker: what went wrong,
optionally which concepts should or should not have matched, optionally the alignment it should have
carried, and a one-line note.

Submitting downloads a JSON file. **That is the entire transport.** Nothing is uploaded, nothing is
written to `localStorage`, no fixture changes, and no request leaves the page — verified on
`:8753` with an empty network log and empty storage after flagging.

The file carries:

| Block | What is in it | Where it came from |
|---|---|---|
| `review` | `reviewDisposition`, failure layer, expected/forbidden canon IDs, expected alignment, note | the reviewer |
| `claimUnit` | normalized excerpt, stable ID, parent segment boundary, speaker, timestamps, claim likelihood, bounded-context bridge and its immediate predecessor when one was eligible | `le-lab.analysis/2.4` |
| `domainDecision` | status, decisive reason code, per-frame scores, cue evidence | `le-lab.analysis/2.4` |
| `display` | primary and secondary matches with score, confidence, alignment, `whyMatched` and `contextHelp`; weak matches with **rank, ID, title, score and confidence only** — stance runs on credible candidates, so a weak match has no alignment, and its reasons live in `candidateTrace` | `le-lab.analysis/2.4` |
| `candidateTrace` | **the whole working candidate set before display caps** — score components, penalties by name, evidence surfaces with provenance types, admission outcome, context assistance, rank, rank at retrieval, truncation fate, and the hits the caps hid | `le-lab.diagnostics/1.1` |
| `build` | Lab release, analyzer version and mode, scoring-config hash, canon index schema and version, analysis schema, diagnostics schema | both |
| `source` | title, type, URL, extraction method — **only if the reviewer ticked the box** | `le-lab.analysis/2.4` |

Nothing in the file is re-derived. If a value is not published by one of those two analyzer outputs,
it is reported as unavailable with the reason, never reconstructed.

### The trace has to reproduce the row, or there is no file

Before anything is written, the exporter rebuilds the ledger row out of the trace's own candidates —
the ones marked `match` are the displayed matches, in order; the ones marked `weak-match` are the weak
list — and requires it to come back identical to the row the analysis published: mapped status, every
canon ID, every score, every alignment, every confidence. Any disagreement refuses the export and
names what disagreed.

This is the check that has to be there, because the obvious ones are not checks at all. Analyzer
version, schema version, scoring hash and canon version are properties of the **build**: they hold
just as well for a trace of a different document analyzed by the same engine. Under `1.0` a trace
whose candidates had been replaced with `[]` satisfied every one of them and produced a file claiming
a primary match at 0.76 above a candidate set of zero — indistinguishable, to a reader, from a real
flag. The trace also now carries the analysis ID, a canon snapshot hash, a digest of the analyzed
input and its overrides, and a per-unit digest; of those only the analysis ID is checkable against the
published analysis, and the file does not pretend the others are more than provenance.

### Flag IDs, and what a second flag on the same row means

The flag ID is a content hash of the **whole review** — disposition, expected and forbidden concept
IDs in the order the reviewer gave them, expected alignment, note, provenance choice, the unit, and the
analysis. Not of the row.

So two reviewers who disagree about one wrong mapping produce two files, and a reviewer who revises an
opinion produces a second file rather than replacing the first. **Nothing supersedes anything
automatically.** Re-routing an unchanged flag rewrites the same stub with the same bytes; a changed
review lands beside it. Which opinion won is an adjudication, recorded in the promoted case's `origin`
block by the human who made it, and the flag that lost stays in the inbox as part of the record of how
the case was decided.

Under `1.0` the ID hashed analysis + unit + disposition only, so both of those situations collided onto
one ID and one filename, and `--out` kept whichever ran last.

**Set-aside passages carry no candidate trace**, and that is correct rather than missing: the gate
decided before any canon entry was scored, so there is no candidate set in existence. The file says
`retrieval-not-run` and names the fields the analysis does not publish for ignored passages.

### The trace is fetched for the flagged passage, not the document

Flagging re-runs the analyzer on the **stored document and stored overrides**, asking for the trace of
that one claim unit. The analysis still runs whole — it always did, and bounded context makes each
passage's result depend on its predecessor — but the trace assembly is scoped, and the trace is where
the size is: measured at ~10 KB per claim unit against 117 KB for the demo document, 638 KB for a
64-passage corpus article, and **5.21 MB for a 406-passage alias-dense source**, whose worst single
passage costs 21.5 KB. A trace's `scope` field says which it is, so a reader who finds one unit in a
file can tell "that is all there was" from "that is all that was asked for".

A scoped trace is byte-identical to the same unit in a whole-document trace, and a test asserts it,
because a flag file describing a run nobody else can reproduce would be worth nothing. Whole-document
mode stays available for the CLI, the fixtures, and `fixtures/run-analyzer.mjs --diagnostics`.

### What the candidate fate fields mean

Each candidate carries one `fate`, naming the first thing that decided its visibility:
`retained-after-prefix-cut` · `below-weak-threshold` · `credible-cap` · `weak-cap` ·
`failed-admission` · `displayed`. Retention is reported separately and always —
`truncationFate.retainedAfterPrefixCut` with `retainedBecause` naming which rule kept it
(`top-ranked`, `exact-evidence`, `context-eligible`) — so a candidate that is both cap-hidden and
union-retained reports both facts rather than losing one to the other.

The summary counts follow the same discipline. `hiddenByDisplayCaps` counts candidates a **cap**
pushed off the ledger and `hiddenBelowWeakThreshold` counts the ones that never cleared the score
floor, because those route to different fixes: a cap is a display decision, a threshold is a scoring
one. Through `1.0` the first number counted both, and `retainedOnEvidenceAfterCap` counted every
candidate the union kept, including the ones it kept on context.

### `reviewDisposition`, never `verdict`

**Verdict** is the Mythbuster term for what the site concluded about a claim's truth. A disposition is
a reviewer's opinion about a mapping. Conflating them would put a docket word on an instrument
reading, and a test asserts the string never appears in the payload.

---

## 2. The inbox

```
lab-feedback/
  inbox/        flag files as downloaded, untouched
  adjudicated/  flags that have been through step 4, with the decision recorded
  drafts/       stubs from tools/lab-feedback.mjs, pre-commit
```

**`lab-feedback/` is gitignored**, on the same reasoning as `lab-corpus/`: a flag file quotes a
passage from someone's source, and the repository is not where third-party text lives. What reaches
the repo is the adjudicated fixture case — a sentence a human decided was worth freezing, in a commit
that says who decided it.

Create the directory when the first flag arrives:

```bash
mkdir -p lab-feedback/inbox lab-feedback/adjudicated lab-feedback/drafts
```

---

## 3. Redact

Before a flag leaves the inbox, read the excerpt. Two questions, both the adjudicator's:

1. **Does the excerpt identify a person?** A benchmark case is committed verbatim and lives forever.
   Names, handles, and identifying detail come out — or the case does not get made. Rewriting the
   sentence to remove them is legitimate *only* if the rewrite still triggers the behavior; check it
   against the analyzer before assuming so, because the defect may live in the exact wording.
2. **Is the source quotable at all?** The flag file carries one sentence, which is fair use by any
   reading. A benchmark full of one publisher's sentences is a different artifact. Prefer a
   paraphrase that reproduces the defect; record in the case note that it is one.

If the flag came in with `source.included: true`, the provenance stays in the inbox copy and does
**not** travel into the fixture case unless the source is public and citable.

---

## 4. Adjudicate

Run the router. It validates the file, decides the layer, checks both frozen benchmarks for the same
passage, and drafts the case:

```bash
node tools/lab-feedback.mjs lab-feedback/inbox/le-lab-feedback-wrong-primary-seg-00002.json
```

Exit codes: `0` routed and drafted · `1` not a valid feedback file · `2` valid, but the passage is
already frozen somewhere.

The tool refuses to write into `tests/fixtures/`. Promotion is a human commit; a tool that could edit
a frozen benchmark would make "append-only" a courtesy rather than a property.

Then decide, in this order:

1. **Is the reviewer right?** Read the `candidateTrace` before agreeing. The usual finding is that the
   analyzer had the right entry in hand and ranked or admitted it wrongly — visible as a candidate at
   rank 9 with `retainedBecause: "exact-evidence"` and `display: "not-displayed"`. That is a different
   defect from "the concept was never retrieved", and they are fixed in different places.
2. **Is the case unambiguous?** The domain benchmark's own policy excludes deliberately borderline
   passages, because the gate's fail-open triage UI is the designed handling for genuine uncertainty.
   The same standard applies to the mapping benchmark. A case a careful reader could argue either way
   is not a fixture; it is a conversation.
3. **What did the adjudication actually decide?** Assert that and nothing else. A case that asserts
   every observable fact about a passage fails for reasons unrelated to the defect it was written for.

### The routing table

| Failure layer | Dispositions | Destination | Why there |
|---|---|---|---|
| **domain-gate** | `domain-gate-error` | `tests/fixtures/domain-relevance-benchmark.json` | The gate decides whether a passage enters analysis at all. Nothing downstream can be judged until that is right. |
| **retrieval-ranking** | `wrong-primary`, `false-positive`, `missing-expected-concept`, `should-remain-unmapped` | `tests/fixtures/canon-mapping-benchmark.json` | The passage was retained; what the matcher then did with it is a retrieval, ranking, or admission decision. |
| **alignment** | `wrong-stance` | `tests/fixtures/canon-mapping-benchmark.json`, as a stance assertion on a mapping case | The right concept with the wrong stance is one case with an `alignment` expectation, not a separate fixture. |
| **segmentation** | `segmentation-error` | `tests/lab-intake.test.mjs` | Intake owns passage boundaries, and its cases are code rather than JSON. |
| **score component** | *(not a disposition — an adjudication finding)* | a focused unit regression in `tests/lab-analyzer.test.mjs` | When the trace isolates the defect to one component or penalty, a benchmark case is the wrong instrument: it would pass or fail for a dozen reasons. Assert the component directly. |

The table above is duplicated in `tools/lab-feedback.mjs` as executable code, and a test asserts every
disposition routes to exactly one destination. If the document and the tool ever disagree, **the tool
is right** and this file is stale.

`score component` is the one row without a disposition, on purpose. A reviewer sees a wrong mapping,
not a wrong `sparseSharePenalty`; that identification is made during adjudication, from the trace, by
someone reading `components` and `penalties` on the candidate that should have won.

---

## 5. Promote

Promotion is one commit that:

1. **appends** the case to its fixture — never edits or removes an existing one;
2. records the case's `origin`: flag ID, disposition, the build it was flagged on, who adjudicated it,
   and when;
3. records `observedAtFreeze` — what the shipped analyzer did when the case was written down, so a
   later reader can tell a fixed defect from a moved goalpost;
4. changes **no analyzer code**. A red case is a legitimate thing to commit. It is the record of a
   defect, and separating "we agreed this is wrong" from "we changed the code" is what makes the fix
   reviewable.

Then move the flag from `inbox/` to `adjudicated/` and run `npm run test:lab`. A newly appended case
that is red will fail the suite — deliberately, and exactly as the v2.4.0 RED fixture commit did.

---

## 6. Worked example — ds-13, and the route that correctly ends in nothing

The first case through this pipeline, and it is instructive precisely because it produces no new
fixture.

**The flag.** *"The studio patched the game so ranked players get fewer unfair matches."* Video-game
patch notes. The Lab retains it (`uncertain`, `plausible-human-relational-frame`) and shows it as an
unmapped row with three weak matches. A reviewer flags it `domain-gate-error`: this is not a
relationship claim and should have been set aside.

**The routing.**

```
$ node tools/lab-feedback.mjs lab-feedback/inbox/le-lab-feedback-domain-gate-error-....json

flag ............ mfb-1m0tilr
disposition ..... domain-gate-error (Relevance gate got it wrong)
failure layer ... domain-gate
row ............. unmapped
build ........... Lab 2.4.1 · analyzer 2.4.0 · canon 1.0.0+949aef381d5f · scoring 1ntbwch
trace ........... 8 candidates, 5 hidden by display caps
excerpt ......... "The studio patched the game so ranked players get fewer unfair matches."

ROUTE ........... tests/fixtures/domain-relevance-benchmark.json
  because ....... The gate decided whether this passage entered analysis at all. Nothing
                  downstream can be judged until that is right.

ALREADY COVERED . ds-13 in tests/fixtures/domain-relevance-benchmark.json
  Append #2 (2026-07-29): video-game trap combining `game` with the `matches` polysemy.
  KNOWN MISS at append time and after the append #2 gate fix: retained fail-open by the
  append #1 `dating-app-interaction` mechanism frame ('fewer ... matches'), not by
  anything this append added.

Nothing to append. The case is already frozen; the work is the fix, not the fixture.
```

Exit code `2`. No stub drafted.

**The adjudication.** The reviewer is right, and the benchmark already agrees with them. ds-13 has
been on record as a known miss since the gate append on 2026-07-29, failing open exactly as the
contract requires: retained, visibly triage-labelled, excludable by hand — never silent data loss.
Appending a second copy would inflate the case count without adding a single new fact.

**What the flag is actually worth.** ds-13 is not idle. It is the stated blocker on typing `game` and
`rizz` as contextual aliases on `smv:charm` (`md/lab-v2.4.0-release.md` §3): typing them today would
gain `ds-01` and `ds-03` and lose `ds-13` — moving junk from *merely retained* to *mapped onto a canon
concept*, which is putting a wrong claim on the ledger rather than leaving a right one off it. The
unblocking condition is specific and unchanged: **fix the ds-13 gate miss, then type `game` and
`rizz`.**

So the route for this flag terminates in a pointer, not a fixture:

> **ds-13 · domain-gate-error · adjudicated 2026-07-29 · already frozen.** No append. Confirms the
> existing known miss from an independent direction. Blocks: contextual typing of `game`/`rizz` on
> `smv:charm`. Next action belongs to the gate, not to this pipeline.

That is a complete, correct outcome. **A pipeline whose only success condition is "a new case was
added" would have appended a duplicate here** — which is why the router checks both benchmarks before
drafting anything, and why exit code `2` is a result rather than an error.

---

## 7. What this pipeline deliberately cannot do

- **It cannot move a threshold.** Coverage figures are still provisional and every export still says
  so. Calibration needs a labelled corpus, not a pile of disagreements.
- **It cannot change the analyzer.** Not one step here edits `js/lab-analyzer.js`. Fixtures record
  what should happen; changing what does happen is a separate, reviewable commit.
- **It cannot promote without a human.** The tool drafts. Every `TBD` in a stub is a decision it
  declined to make on someone's behalf.
- **It cannot see what the reviewer did not flag.** A flag is a sample, not a measurement. Nothing in
  the inbox supports a claim about how often the Lab is right.
