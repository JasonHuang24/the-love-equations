# Lab operations — LIVE protocols and standing rulings

A volume of the record shelf (`md/INDEX.md` is the table of contents; one row per section).
Append new records as new `# <name>` sections at the END of the right volume — never as new
md/ files (see "Record hygiene" in CLAUDE.md). Every section below is a byte-exact merge of a
former standalone md/ file; in-text references to `md/<name>.md` resolve to the section of that
name in this or a sibling volume, or to the pre-merge file via the `git show` pointer on the
section header line.


---

# lab-provenance-stamp.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-provenance-stamp.md`

# Lab Provenance Stamp — convention

**Established 2026-07-27** (Jason's idea). Whenever an LE Lab harvest produces new doctrine that gets implemented on the site, the shipped artifact carries a **provenance stamp**: the date the Lab surfaced it and the source it was extracted from.

## The stamp

- Shared class `.lab-stamp` in `css/styles.css` — dashed specimen-tag chip (deliberately neutral: it is **provenance, not an evidence grade**; tier pills keep that job). Links to `lab.html`; hover turns the border solid scarlet.
- Text format: `Lab find · <harvest date> · <short source>` with a flask glyph (Tabler `ti-flask` on icon-font pages; inline `SVG_FLASK` on the Mythbuster, which has no icon font).
- `title` attribute carries the long form: "Doctrine surfaced by the LE Lab canon-mapper run of `<date>` (Doctrine Harvest #N), extracted from `<full source>`".

## Placement rules

Stamp **artifact-level doctrine** — a new chart, a new Mythbuster entry, a new framework, a new Lexicon card. Do **not** stamp garnish-level additions (an extra bar rung, a note sentence, an honesty line): a chip per sentence is clutter, and the harvest memo already records those.

Per-surface hooks:
- **Statistics chart** → inside `.chart-meta`, after `.chart-sample`.
- **Frameworks entry** → inline at the end of `.rf-eyebrow`.
- **Mythbuster entry** → optional `ruling.lab: { date, source, sourceShort }` field; the renderer emits the stamp in `.mb-evidence` after the source attribution (absent field = no stamp; the render gate ignores it).
- **Lexicon card** → `<span class="lab-stamp">` (not a link — the card already has its own link) at the end of the definition HTML.

## Applied so far (Harvest #1, run 2026-07-26, Pew Feb 2023)

- `statistics.html#stat-pay-to-play`
- `mythbuster.html#M-TBD-65` (via the new `ruling.lab` field)
- `frameworks.html#abundance-trap`
- `lexicon.html#term-the-abundance-trap`

Garnishes deliberately left unstamped: the `#stat-safety` 43% rung, the `#stat-couples-meet` under-30 note, the Compatibility Calculator honesty note, the `#stat-mythbuster` index row.

## Maintenance

Adding a stamp changes visible page text → rebuild `data/le-canon-index.json` and run `npm run test:lab` in the same commit (standard doctrine-merge discipline; concept counts don't change, the hash does).


---

# lab-schemas.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-schemas.md`

# LE Lab data contracts

The Lab keeps intake, analysis, and rendering separate so a future local model
or secure server-side adapter can reuse the same documents and results. These
schemas are versioned product contracts, not browser storage formats. Raw source
text, files, and media are held in session memory and are not written to
`localStorage` or uploaded by the Lab.

## Normalized document — `le-lab.normalized-document` `1.0.0`

Every successful intake route produces the same object:

```json
{
  "schema": "le-lab.normalized-document",
  "schemaVersion": "1.0.0",
  "id": "doc-…",
  "createdAt": "ISO-8601 timestamp",
  "source": {
    "title": "Source title",
    "type": "pasted-text | local-file | pdf-document | image-ocr | media-with-companion-transcript | article-url | …",
    "url": "optional canonical provenance URL",
    "fileName": "optional local filename",
    "mimeType": "optional MIME type",
    "media": "optional local-media metadata without bytes"
  },
  "extraction": {
    "method": "versioned extractor name",
    "boundarySpace": "normalized-decoded-input | extracted-text",
    "confidence": "optional OCR confidence from 0–100",
    "warnings": [
      { "code": "STABLE_CODE", "message": "Actionable note", "severity": "info | warning | error" }
    ]
  },
  "speakers": ["recoverable unique speaker names"],
  "segments": [
    {
      "id": "stable content-derived segment ID",
      "order": 0,
      "speaker": "optional speaker",
      "startMs": "optional integer",
      "endMs": "optional integer",
      "text": "plain inert source text",
      "original": {
        "source": "normalized-decoded-input | extracted-text",
        "startOffset": 0,
        "endOffset": 42,
        "lineStart": "optional integer",
        "lineEnd": "optional integer",
        "cue": "optional subtitle cue",
        "record": "optional JSON record",
        "row": "optional CSV row",
        "page": "optional PDF page"
      }
    }
  ],
  "text": "normalized analyzable text",
  "stats": {
    "characters": 0,
    "words": 0,
    "segments": 0,
    "timedSegments": 0,
    "durationMs": "optional integer"
  }
}
```

Segment IDs are stable for the same ordered content, speaker, and timing.
Original boundaries explicitly name their coordinate space because PDF, HTML,
RTF, and OCR cannot point back into source bytes in the same way decoded text
can.

## Canon index — `le-canon-index/1.1`

`data/le-canon-index.json` is generated from canonical HTML plus a small
semantic overlay. It contains version metadata, indexed source pages, coverage
statistics, and an `entries` array. Every entry has a stable ID, title, page,
anchor, category, synopsis, evidence/content type, aliases/phrases,
dependencies, related entries, boundary conditions, common misreadings,
existing LE source links, and pressure questions where the source supplies
them. `scripts/validate-canon-index.mjs` rejects broken pages/fragments,
duplicate IDs, malformed evidence types, and invalid relations.

`verdict` is an additive string field, non-empty only on Mythbuster entries,
carrying that docket entry's ruling badge ("Holds up", "Common, not dominant").
It is **recorded, never matched**: a verdict is what the canon concluded about a
claim, not a name a source would use for the concept, so it is deliberately kept
off the analyzer's alias/phrase match surface. Through v2.2.0 these badges were
emitted as aliases, which both invented matches on verdict-shaped prose and
crowded correct concepts out of the ranked slots. The field is additive and
backward compatible — `prepareCanonIndex` reads named fields and ignores unknown
ones — so it did not on its own move the schema. `validate-canon-index.mjs`
type-checks it and rejects any entry that repeats its verdict as an alias.

`standaloneAliases` and `contextualAliases` (added at `1.1`, v2.4.0) type the
single-word aliases. A single word is insufficient evidence by default; these
two lists are the curated exceptions and everything untyped keeps the
conservative behavior. `standaloneAliases` is a plain string array —
high-specificity terms that mean the concept wherever they appear.
`contextualAliases` is an array of `{ alias, notAfter }` — ordinary words the
concept borrows, which need independent relational evidence in the same passage
and are disqualified outright by any `notAfter` modifier immediately preceding
them (`cloud provider` is not the LE concept of a provider). The asymmetry is
the semantics: being unconditional is what makes an alias standalone. The
version moved because typing is a new statement about what the match surface
MEANS, and a consumer must be able to tell a typed index from an untyped one
without inspecting entries. Both fields are validated as statements about the
match surface — a typed alias that is not one of the entry's aliases is rejected
at build time, because it would otherwise do nothing at all, silently.

## Analysis result — `le-lab.analysis/2.6`

The deterministic local adapter returns:

- source provenance and extraction warnings;
- analyzer mode and exact canon-index version;
- word, source-segment, claim-segment, mapped, and unmapped counts;
- a deterministic domain-relevance summary with relevant, uncertain-retained,
  ignored-passage, and ignored-word counts; clearly non-domain passages remain
  in the normalized source but are absent from analysis mappings and residue;
- an inspectable `domainRelevance.ignoredPassages` list: every set-aside
  passage with its location, excerpt, word count, machine status, decisive
  reason code and label, and capped frame evidence — the gate is triage, not a
  verdict, so its exclusions are always visible, never silent. From
  `le-lab.analysis/2.5` each record also carries everything the analyzer
  computed *before* the gate ruled: `claimLikelihood`, `isClaimLike`,
  `machineClaimLike`, `sourceBoundary`, `boundedContext`, `decisiveReason`,
  `domainScore`, `nonDomainScore`, and per-frame `frameScores`. Retrieval-stage
  evidence is still absent, because retrieval never ran for these rows;
- a `domainRelevance.overrides` echo of visitor triage decisions: `applied`
  (`{segmentId, action}` for each honored include/exclude) and `unmatchedIds`
  (override keys that matched no passage; also surfaced as a warning);
- mapped claim-segment and claim-word coverage, explicitly labeled as document
  coverage rather than population evidence; the three coverage values are
  `null` when no retained relationship-domain claims exist, because that
  denominator is unavailable rather than zero;
- excerpt-level canon matches with stance, confidence, lexical trace, deep
  links, LE synopsis, evidence/content type, sources, boundaries, dependencies,
  and related doctrine;
- category and evidence-tier distributions;
- prioritized pressure tests;
- adjacent doctrine;
- an independently exportable Research Queue;
- ambiguity warnings and limitations.

Analysis v2 changes the analytical population: claim, mapping, coverage,
distribution, pressure-test, and Research Queue fields include only retained
relationship-domain passages. Those v2 metric meanings are not backward
compatible with analysis v1, even though several new diagnostic fields are additive.

Analysis v2.1 is additive over v2.0: it lists ignored passages individually and
accepts per-passage visitor overrides. `analyzeDocument(document, canonIndex,
{ domainOverrides })` takes a `{unitId: "include" | "exclude"}` map of locked
visitor decisions applied after local classification and before any analytical
population is built. An include joins analysis with `status: "relevant"`,
`reasonCode: "user-override-include"`, and the machine's original verdict
preserved in `localStatus`; it also admits the passage as an analyzable claim
unit even when claim grammar alone would have treated it as context, with the
machine's grammar verdict preserved in `machineClaimLike` — a locked input is
honored through every analytical population (claims, coverage, mappings, and
the Research Queue), never merely echoed. An exclude moves a passage to the
ignored list with `overridden: true`. Re-included passages stay listed in the
interface's triage panel with their Undo control alongside their ledger rows. Overrides are session-scoped user decisions keyed to
content-derived unit IDs — they are disclosed in the result and every export,
never presented as classifier verdicts, and an overridden passage neither
receives nor provides context inheritance beyond its locked status.

The relevance gate itself is held to a frozen, append-only benchmark
(`tests/fixtures/domain-relevance-benchmark.json`): hard floors on domain
recall and ignore precision, a ratchet floor on junk recall, and the standing
safety property that every benchmark miss on non-domain text fails open —
retained and visibly triage-labeled — never as silent data loss.

Each retained `segments[].unit` includes a `domainRelevance` decision with its
local status, decisive reason, participant frame, outcome frame, mechanism
frame, capped non-domain frame, and any tightly bounded previous-sentence
assistance. `relevant` and conservative `uncertain` passages continue into
canon retrieval; `irrelevant` passages are represented only by aggregate
metrics and are never exported as individual analysis or research rows.
Claim-likeness is grammatical evidence only: a passage needs an explicit
relationship outcome or a grounded human/social mechanism to be retained.
Non-domain evidence is capped by semantic family, and an explicit relational
outcome takes precedence over incidental technical or economic input terms.

`segments[].matches[].score` is a bounded local lexical score, not a probability
that a claim is true. Optional `segments[].matches[].contextHelp` records tightly
bounded adjacent-sentence assistance with its source unit, relation, boost,
local score, and reason; it is never an untraced parent-paragraph signal.
A numeric score is admitted as a credible match only when it also carries an
exact phrase or alias, a concept signature, or at least two distinctive shared
concepts. Generic relationship terms cannot satisfy that evidence gate alone.
The alignment vocabulary is `Supports`, `Resembles`,
`Extends`, `Challenges`, `Contradicts`, and `Context only`.

Analysis v2.4 changes three decisions and adds one trace.

1. **Retention.** The working candidate set is the union of the top-ranked
   candidates, every entry carrying exact evidence (phrase hit, alias hit, or
   concept signature), and the entries the previous sentence established plus
   their declared relations. Ranking and display caps apply after that union,
   not before it, so an exact hit can no longer be discarded before admission,
   context, or stance can consider it. Retention is not credibility: admission
   is unchanged.
2. **Stance.** Token overlap now records which canon surface supplied it —
   `title`, `alias`, `synopsis`, `boundaryCondition`, `commonMisreading` — and
   each `segments[].matches[].alignment` carries an additive `evidence` object
   with the surfaces hit, the misreading overlap, whether the overlap was
   misreading-only or boundary-only, and whether reported speech or a denial
   cue fired. Strong overlap with an entry's `commonMisreadings` is
   `Contradicts` when asserted, `Supports` when denied, and `Context only` when
   reported — the passage relaying a claim is not charged with making it. An
   overlap drawn from nothing but an entry's `boundaryConditions` is
   `Challenges`, never a silent `Resembles`. Retrieval is unaffected; only the
   label and its trace change. The alignment vocabulary is unchanged.
3. **Alias typing.** See `le-canon-index/1.1` above. A typed alias hit appears
   in `whyMatched` as `Typed alias "x" (standalone|contextual): <reason>`.

`match-behavior` is the frozen, append-only fixture for all three
(`tests/fixtures/match-behavior-benchmark.json`), and, like the domain
benchmark, every case records what the shipped analyzer did when the case was
written down.

### The frozen fixtures, and which layer each one owns

Four append-only fixtures, each answering a question the others cannot. A flag
routed to the wrong one produces a case that fails for reasons unrelated to the
defect it was written for.

| Fixture | Layer | Question |
|---|---|---|
| `domain-relevance-benchmark.json` | the gate | Did the passage enter analysis at all? |
| `match-behavior-benchmark.json` | retrieval, stance, alias typing | Do the three v2.4.0 rulings hold? |
| `canon-mapping-benchmark.json` | retrieval, ranking, admission, alignment | Did the matcher map the retained passage the way an adjudicator decided it should? |
| `short-utterance-matrix.json` | all of them, on compact text | What does the analyzer do with three-to-twelve-word utterances, and which layer decided? |

`canon-mapping-benchmark` (`le-canon-mapping-benchmark/1.0`, added at v2.4.1) is
the destination for adjudicated reviewer flags about everything downstream of the
gate. It ships empty on purpose: its cases arrive one adjudication at a time
through `md/FEEDBACK-PIPELINE.md`, never from an author inventing sentences to
fill a fixture. Every case records its `origin` — flag ID, disposition, build,
who adjudicated it and when — alongside `expected` and `observedAtFreeze`. Its
validator runs whether or not there are cases and rejects a case with no origin,
a duplicate text, a canon ID the index no longer has, or no assertion at all.

`short-utterance-matrix` (`le-lab.short-utterance-matrix/1.0`, added at v2.4.1)
is a **freeze, not a proposal**: every expectation is the outcome the shipped
analyzer produced on 2026-07-29, and a test asserts `minClaimWords` is still 4 so
the fixture cannot become the justification for having moved it. Each row names
its binding constraint — `domain-gate`, `claim-word-floor`,
`admission-threshold`, or `none` — and the test re-derives that from the analyzer
rather than trusting the label. `humanReading` records what a careful reader
would say the passage is and is never asserted.

## Diagnostic trace — `le-lab.diagnostics/1.1`

Opt-in and off by default: `analyzeDocument(document, canonIndex,
{ diagnostics: true })` adds a `diagnostics` key covering the whole document,
`{ diagnostics: { segmentIds: [id] } }` covers those claim units only, and
omitting the option leaves the key absent rather than empty. `scope` reports
which of the two it is, alongside `requestedSegmentIds` and
`analyzedClaimUnitCount`, so a reader who finds one unit in a trace can tell
"that is all there was" from "that is all that was asked for". A scoped trace is
byte-identical to the same unit in a whole-document trace, and a test asserts it.
`LabAnalyzerClient.analyze` forwards the option verbatim on both the worker and
the main-thread fallback route.

The trace is the Pass B adapter boundary. Per claim unit it reports the domain
decision with its frame summary, the bounded-context bridge, a `unitDigest`
binding the entry to the row the analysis published, and the **whole working
candidate set before display caps** — each candidate with its rank, its rank at
retrieval, the number of candidates above the floor, its `fate`, its truncation
fate, the decomposed score components, the penalties applied by name, the
evidence surfaces hit with their provenance types, the admission outcome, any
context assistance, and whether it was displayed as a match, a weak match, or
not at all.

Admission may also carry `semanticGuard: { required, passed, label }`. It is a
concept-specific credibility gate: it contributes no score and retrieves nothing,
but a required guard that does not pass prevents a candidate from becoming a
credible mapping. The label names the semantic anchor the passage needed. The field
is derived and appears in diagnostics even when the candidate is refused.

`fate` names the first thing that decided a candidate's visibility, in this
order: `retained-after-prefix-cut` · `below-weak-threshold` · `credible-cap` ·
`weak-cap` · `failed-admission` · `displayed`. Retention is reported separately
and always — `truncationFate.retainedAfterPrefixCut` with `retainedBecause`
naming which rule kept it (`top-ranked`, `exact-evidence`, `context-eligible`) —
because the two axes are independent: a candidate can be both cap-hidden and
union-retained, and `1.0`'s single boolean reported every past-the-cut candidate
as evidence-retained including the ones kept on context.

The trace also carries what it is a trace **of**, not just what produced it:
`analysisId` (which the analysis publishes too, so a consumer can verify it), a
`canonSnapshotHash` over the canon's actual lexical surface rather than the
version string it claims, and an `inputDigest` over the analyzed text and its
overrides. Analyzer version, schema version and scoring hash are properties of
the build and hold for a trace of any other document on the same build.

Everything under `diagnostics` is derived. It never feeds a decision, so the
same document analyzed with and without it produces the same matches, scores,
and stances — asserted as a test, not merely intended. It is versioned
independently of the analysis schema because it is an internal view and is
expected to churn faster than the published contract; nothing in the Lab
interface reads it.

## Mapping feedback — `le-lab.mapping-feedback/1.1`

One reviewer disagreement about one claim unit, written by
`js/lab-feedback.js` and downloaded to the visitor's own disk. **The download
is the entire transport**: there is no endpoint, no `localStorage` key, no
fixture mutation, and no automatic promotion. A flag is a draft addressed to a
human, and `md/FEEDBACK-PIPELINE.md` is where that human picks it up.

The payload is assembled from two analyzer outputs and re-derives nothing. The
claim unit, its domain decision with per-frame evidence, claim likelihood,
speaker, timestamps, parent-segment boundary, bounded-context bridge with its
immediate predecessor, and the displayed matches come from
`le-lab.analysis/2.6`. The **whole working candidate set before display caps** —
score components, penalties by name, evidence surfaces with their provenance
types, admission outcome, context assistance, rank, rank at retrieval, fate, and
the hits the caps hid — comes from `le-lab.diagnostics/1.1`. A value not
published by one of those two is reported as unavailable with the reason, never
reconstructed: a feedback file that quietly disagreed with the analyzer would be
worse than one that admits a gap.

**The two displayed lists carry different fields, because the analyzer produces
different fields for them.** `display.primary` and each `display.secondary`
carry rank, canon ID, title, href, category, subcategory, evidence type, score,
confidence, alignment (label, rationale, evidence), `whyMatched`, and
`contextHelp`. Each `display.weak` carries **rank, canon ID, title, score, and
confidence — and nothing else**: stance runs on credible candidates only, so a
weak match has no alignment to report, and its `whyMatched` and `contextHelp`
are read from `candidateTrace` where the full candidate record lives.

`candidateTrace` summarizes itself with counts taken from the thing each one
names: `displayedCount`, `notDisplayedCount`, `hiddenByDisplayCaps` (a cap
pushed it off the ledger), `hiddenBelowWeakThreshold` (it never cleared the
score floor), `retainedAfterPrefixCut`, and `retainedOnEvidenceAfterCap` (exact
evidence only, not context). The first two of those partition
`notDisplayedCount` exactly, and a test asserts it on every row.

`review.reviewDisposition` is `wrong-primary`, `false-positive`,
`missing-expected-concept`, `should-remain-unmapped`, `wrong-stance`,
`domain-gate-error`, or `segmentation-error`, and each carries a
`failureLayer` that is the routing key. It is deliberately **not** called a
verdict: a verdict on this site is a Mythbuster ruling about a claim's truth,
and this is a reviewer's opinion about a mapping. Optional
`expectedCanonIds`, `forbiddenCanonIds`, and `expectedAlignment` record what the
reviewer thinks should have happened; `expectedAlignment` is restricted to the
analyzer's own alignment vocabulary.

`build` names the Lab release, the analyzer version and mode, the
scoring-config hash, the canon index schema and version, the analysis schema,
and the diagnostics schema. The Lab release and the analyzer version are
separate fields on purpose — a UI-only patch moves the first and not the second,
and triage needs to tell them apart.

`privacy` states the transport, and the flagged excerpt is the only source text
included by default. `source` provenance (title, type, URL, extraction method)
appears only when the reviewer ticks the opt-in box; the full transcript is
never included, and a test walks every other passage in the document asserting
it did not leak.

A **set-aside passage carries no candidate trace**, and that is the analyzer's
behavior rather than a gap in it: the relevance gate decided before any canon
entry was scored, so no candidate set exists. The file reports
`retrieval-not-run` and names the unit fields the analysis does not publish for
ignored passages.

Refusals throw rather than exporting a flag that looks filed but is unusable: an
unknown disposition, a trace whose excerpt disagrees with the flagged row, a
retained row missing from the trace, a trace with no analysis identity or the
wrong one, and — the check `1.1` was cut for — **a trace that does not
reproduce the flagged row**. The exporter rebuilds the ledger row from the
trace's own candidates (`display: 'match'` are the displayed matches, in order;
`display: 'weak-match'` are the weak list) and requires mapped status, every
canon ID, every score, every alignment and every confidence to come back
identical. Each refusal names what disagreed.

`flagId` is a content hash of the whole review — disposition, both concept ID
lists in the order given, expected alignment, note, provenance choice, unit, and
analysis. Two reviewers who disagree about one mapping get two files; a revised
opinion is a new file beside the old one, superseded by a human's adjudication
and never automatically.

`tools/lab-feedback.mjs` validates a file against this schema, routes it by
failure layer, checks both frozen benchmarks for the same passage, and drafts
the fixture stub a human would commit. It refuses to write into
`tests/fixtures/`.

## Research queue — `le-lab.research-queue/2.3`

The standalone queue export references its parent analysis, source, extraction
warnings, analyzer mode, and canon version. Each candidate keeps its source
location/excerpt, reason it stayed unmapped, nearest concepts, proposed canon
destination, empirical question, suggested search terms, falsifier, and risk
flags. Every item is labeled **research candidate — not LE doctrine**.
Research Queue v2 follows the analysis-v2 domain-filtered population and cannot
be interpreted as a v1 queue with merely additive metadata.

Queue 2.3 adds `umbrellaTaxonomy` at the queue root and
`unmatchedTriage` on every item. This is a second, post-match dimension:
`primaryUmbrella` (plus an optional `secondaryUmbrella`) names the
relational territory, while `unmatchedReason` says why doctrine matching did
not clear. Each item also carries the triage/taxonomy schema versions,
confidence, explicit `abstained` state, matched signals, a plain-language
rationale, and an in-band doctrine-status warning. The exact source excerpt and
its existing location boundaries remain the authority. `nearestConcepts`
remain nonmatches and are explicitly labeled that way.

The dependency direction is one-way and guarded: `researchItemFor` invokes
the deterministic umbrella classifier only for the final `unmappedClaims`
population. The classifier receives the source fragment alone. It receives no
canon entry, retrieval candidate, lexical score, gate result, exclusion,
alignment, or ownership field and therefore cannot promote, suppress, or
reroute a doctrine match. Low-signal text returns the `unclassified` umbrella
with `abstained: true`; generic relationship words never clear a subject
umbrella on their own.

Taxonomy 1.1 adds explanatory `currentDoctrineOwners` for the Asymmetric and
Institutional umbrellas (`frameworks:synthetic-reciprocity` and
`frameworks:authority-firewall`). This registry belongs only to unmatched
triage. It is not imported by the matcher. Reason precedence is
outside-human/furniture, descriptive evidence, boundary/moderator/directional
evidence, existing-doctrine retrieval miss, possible doctrine gap, then
insufficient evidence. A boundary statement is therefore not flattened into a
retrieval miss merely because its subject umbrella has a current owner.

Role unbundling requires an explicit separation, substitution, comparison, or
unbundling mechanism. Assisted reproduction, surrogacy, donors, intended
parents, or parenthood words alone do not qualify. Legal parenthood,
recognition, consent, eligibility, and access prefer External recognition when
the exact fragment states that mechanism. Statistical and procedural uses of
`separate`, `role`, and family vocabulary are guarded as furniture.

JSON keeps each queue excerpt byte-exact. Markdown uses a dedicated excerpt
serializer: it preserves spaces, tabs, line breaks, and blank lines, emits
every source line in the blockquote, and encodes only `&`, `<`, and `>`. The
ordinary heading and metadata serializer still performs its existing
whitespace normalization. In the ledger, an old result with no
`unmatchedTriage` renders plain `Unmatched`; `Unmatched — Unclassified` is
reserved for a real versioned triage record with `abstained: true`.

Two revisions after this section was first written, both recorded in the
constant's own comment (`js/lab-analyzer.js`, `RESEARCH_QUEUE_SCHEMA_VERSION`):
2.1 (v2.2.0) put a provenance block on the queue object itself, so a queue
lifted out of an analysis is self-describing on its own; 2.2 (v2.6.10) changed
the item shape — `scoredConceptTotal` and `nearbyBandTotal` say what the three
nearest concepts are three OF; 2.3 (v2.7.1) adds the versioned post-match
umbrella taxonomy and item triage described above. Analyzer v2.7.2 retains the
2.3 queue shape while advancing the taxonomy/triage payload to 1.1 and
tightening its explanatory rules. This heading sat at 2.0 while production shipped
both; the drift was caught by the 2026-08-07 cold review (finding 7) and the
analyzer's live export version is asserted against the constant in
`tests/lab-analyzer.test.mjs`, so the contract a consumer receives is the
constant, not this heading — but the heading now agrees.

## Adapter boundary

A future analyzer may consume `le-lab.normalized-document/1.0.0` and return
`le-lab.analysis/2.1` without changing intake or the interface. It must identify
its mode, preserve segment references and canon IDs, report uncertainty, and
must not claim an upload-free or on-device mode unless that is true.


---

# RERUN.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/RERUN.md`

# LE Lab — v2.2.0 re-run protocol

**Why this exists.** v2.2.0 changes what an export *says about itself* (schema versions, provenance
stamp, scoring-config hash, provisional marker) without changing what the analyzer *decides*. Every
source analyzed under v2.1.2 or earlier therefore carries an export that is behaviorally current but
provenance-illegible: it cannot name the analyzer build, the canon snapshot, or the threshold set that
produced it. Re-running brings the corpus to a single version so cross-source comparisons in the
distillation lane are made against one instrument.

**Scope.** This document is the procedure. It is deliberately not executed here.

---

## 0. Precondition — read this first

**The existing corpus has no archived raw text in this repository.** All four previously-processed
sources were staged in `.claude/lab-sources/`, which is gitignored (`.claude/` in `.gitignore`), and the
run-01 dossier records that "staging removed after the run — the tree was clean before and after."
No analysis or queue export is committed anywhere in the tree either.

Consequence: **steps 2–5 below are not executable for the existing corpus until the source texts are
re-acquired** (step 1). A re-acquired text is not guaranteed byte-identical to what was analyzed in
July 2026 — living web pages change. Any re-run built on re-acquired text must be labelled
`reacquired` in the manifest and treated as a *new* measurement that supersedes the old one, not as a
reproduction of it.

The archive introduced in step 1 is what makes every *future* re-run a true reproduction.

### The corpus to re-run

| # | Source | Run | Analyzer | Canon snapshot | Recorded result |
|---|---|---|---|---|---|
| 1 | Pew Research Center, "Key findings about online dating in the U.S." (Feb 2 2023; n=6,034 U.S. adults, July 2022) | Harvest #1, 2026-07-26 | `v=1.7` | `1.0.0+6dc9bff7b0fe` | 34 retained claims · 50% mapped · 17 queue · 4 pressure tests |
| 2 | Rollo Tomassi, "Fem-Centrism", *The Rational Male* (2011) | Distillation run 01, 2026-07-27 | `v=2.1.2` | `1.0.0+8c38a2f1d015` | 1,214 words · 10 claim-like · 0 mapped (0%) · 10 queue |
| 3 | The Gottman Institute, "The Four Horsemen" | Distillation run 01, 2026-07-27 | `v=2.1.2` | `1.0.0+8c38a2f1d015` | 885 words · 17 claim-like · 0 mapped (0%) · 17 queue |
| 4 | Asa Seresin, "On Heteropessimism", *The New Inquiry* (2019) | Distillation run 01, 2026-07-27 | `v=2.1.2` | `1.0.0+8c38a2f1d015` | 2,938 words · 28 claim-like · 1 mapped (3.6%) · 27 queue |

Sources 2–4 are the priority: they ran on the same canon snapshot the Lab still ships, so their
re-runs isolate the v2.1.2 → v2.2.0 delta exactly. Source 1 ran on an older canon and an older
analyzer, so its re-run moves two variables at once — record that in its manifest note.

---

## 1. Establish the source archive

Create a durable, versioned home for raw source text. `.claude/lab-sources/` cannot serve: it is
gitignored and was treated as scratch.

```bash
mkdir -p lab-corpus/sources lab-corpus/exports
```

One file per source, named `<NN>-<slug>.<ext>` (`.txt` / `.md` / `.vtt` — whatever intake format the
source was captured in). Alongside each, a sidecar `<NN>-<slug>.source.json`:

```json
{
  "id": "02-fem-centrism",
  "title": "Fem-Centrism",
  "author": "Rollo Tomassi",
  "publication": "The Rational Male",
  "year": 2011,
  "url": "https://…",
  "capturedAt": "2026-07-29T00:00:00.000Z",
  "capturedBy": "reacquired",
  "format": "txt",
  "sha256": "<sha256 of the text file>",
  "notes": "Re-acquired 2026-07-29; not byte-verified against the 2026-07-27 staging, which was deleted."
}
```

`capturedBy` is `original` only when the file is provably the bytes that were analyzed. For the
existing corpus it is `reacquired`.

**Decide before committing:** these are third-party texts. If they should not live in the repo, put
the archive outside it and record the absolute path plus the SHA-256 in the manifest instead — the
hash is what makes a future run verifiable, not the location. Do not silently commit long verbatim
third-party copy without deciding that first.

> **DECIDED 2026-07-29 — the corpus is not published.** `lab-corpus/` lives in the working tree and
> is gitignored; `lab-corpus.manifest.json` is committed at the repo root and carries identity,
> provenance, and the SHA-256 per source, so presence and integrity are verifiable without
> publishing the text. In-tree-but-ignored was chosen over a sibling directory so the relative paths
> in the manifest resolve for anyone who holds the files. This supersedes the §5 location
> `lab-corpus/manifest.json`; the schema (`le-lab.corpus-manifest/1.0`) is unchanged apart from an
> added `archive` block recording the arrangement. The acquisition worksheet is
> `md/lab-corpus-acquisition-01.md`; the archive is scaffolded and empty pending Jason's GO.

---

## 2. Confirm the instrument before re-running

A re-run is only meaningful if the analyzer is the shipped one and the canon index is the shipped one.

```bash
npm run test:lab
```

Then confirm the canon index regenerates byte-identically (guards against a stale artifact):

```bash
node scripts/build-canon-index.mjs && git diff --stat data/le-canon-index.json
```

An empty diff is the check. **From v2.6.0 the built file's SHA-256 is itself reproducible**, so this
is a plain rebuild rather than the pinned-timestamp incantation it used to need: `generatedAt` is now
derived from the git state of the build's inputs — every canon source page plus the builder — instead
of from the wall clock. Two builds of the same tree produce the same bytes, and the archive doctrine
below, which treats SHA-256 as the reproducibility anchor, is now true of this file too. It was not
before; v2.5.0 §6 and §7.6 recorded the exception and this closes it.

Outside a git checkout the build **throws** rather than inventing a stamp. Pass `generatedAt` or set
`CANON_GENERATED_AT` — which is also how you reproduce an archived artifact exactly:

```bash
CANON_GENERATED_AT="$(node -p "require('./data/le-canon-index.json').generatedAt")" node scripts/build-canon-index.mjs
```

Record the printed `indexVersion` — it goes in the manifest as the canon snapshot for this re-run
epoch. `indexVersion` remains the file's content identity; SHA-256 is now a second, equally valid
one rather than a stand-in that drifted.

---

## 3. Re-analyze each source

Use the headless harness, not the browser. It imports the shipped `js/lab-analyzer.js`, so the result
is the same code path the Lab runs, and it is deterministic (wall-clock fields are stabilized).

```bash
node fixtures/run-analyzer.mjs --source lab-corpus/sources/02-fem-centrism.txt --out lab-corpus/exports/02-fem-centrism-v2.2.0.json
```

Repeat per source. The harness prints a one-line summary to stderr (passages, claims, mapped,
coverage, tensions, queue size) — capture it; it is the row you will compare against the table above.

If a source needs per-passage visitor overrides to reproduce the original run's population (Harvest #1
used 4 visitor includes), pass them:

```bash
node fixtures/run-analyzer.mjs --source lab-corpus/sources/01-pew.txt --overrides lab-corpus/sources/01-pew.overrides.json --out lab-corpus/exports/01-pew-v2.2.0.json
```

The overrides file is `{ "<unitId>": "include" | "exclude" }`. **Unit IDs are content-derived**, so
they only survive if the source text is byte-identical. If the text was re-acquired, the old override
IDs will not match; the harness surfaces this as `domainRelevance.overrides.unmatchedIds` and a
warning. Re-derive them from the new run rather than forcing the old ones.

For the browser path instead (when a human wants to eyeball it): serve on `:8753`
(`python .claude/dev-server.py`), open `lab.html`, paste the source, analyze, and use the export
buttons. Hard-refresh once — the `?v=2.2.0` bump should handle cache, but the local server has bitten
this project before.

---

## 4. Naming and supersession — retain, never delete

**v2.1.2 and earlier exports are retained.** They are the evidence behind the run-01 dossier and the
Harvest #1 backlog; deleting them would orphan conclusions already published in `md/`.

Naming convention for everything in `lab-corpus/exports/`:

```
<NN>-<slug>-<analyzer-version>.json          analysis export
<NN>-<slug>-<analyzer-version>.queue.json    research-queue export
<NN>-<slug>-<analyzer-version>.md            analysis Markdown
```

- `<analyzer-version>` is the release token (`v2.1.2`, `v2.2.0`), matching `provenance.analyzer.version`.
- Never overwrite across versions. Two files with different version suffixes are the point.
- If a source is re-run twice on the same version (e.g. after re-acquiring text), disambiguate with a
  date: `02-fem-centrism-v2.2.0-2026-07-29.json`. Do not add `-final`, `-new`, or `-fixed`.
- Legacy exports that were never captured to disk are simply absent. Record that as
  `"priorExport": null` in the manifest rather than reconstructing one — a reconstructed "v2.1.2
  export" produced by today's code would be a fabrication.

Supersession is recorded in the manifest, not by file deletion or renaming.

---

## 5. Manifest update procedure

`lab-corpus/manifest.json` is the index of the corpus and the record of which export is current.

```json
{
  "schemaVersion": "le-lab.corpus-manifest/1.0",
  "updatedAt": "2026-07-29T00:00:00.000Z",
  "epoch": {
    "analyzerVersion": "2.2.0",
    "analysisSchemaVersion": "le-lab.analysis/2.2",
    "researchQueueSchemaVersion": "le-lab.research-queue/2.1",
    "scoringConfigHash": "195c1ld",
    "canonIndexVersion": "1.0.0+8c38a2f1d015",
    "canonGeneratedAt": "2026-07-27T11:25:27.240Z"
  },
  "sources": [
    {
      "id": "02-fem-centrism",
      "sourceFile": "lab-corpus/sources/02-fem-centrism.txt",
      "sourceSha256": "<sha256>",
      "capturedBy": "reacquired",
      "current": "lab-corpus/exports/02-fem-centrism-v2.2.0.json",
      "superseded": [],
      "priorExport": null,
      "priorRun": {
        "analyzerVersion": "2.1.2",
        "canonIndexVersion": "1.0.0+8c38a2f1d015",
        "recordedIn": "md/doctrine-distillation-claude-01.md",
        "claimLike": 10,
        "mapped": 0,
        "coveragePct": 0
      },
      "result": { "claimLike": null, "mapped": null, "coveragePct": null },
      "delta": "…",
      "notes": "Text re-acquired 2026-07-29; original staging deleted, so this supersedes rather than reproduces."
    }
  ]
}
```

Per re-run, in order:

1. **Append, do not replace.** Move the previous `current` path into `superseded[]` before setting the
   new one. `superseded` is append-only.
2. **Copy the epoch from the export itself**, not from memory: every field in `epoch` is readable from
   `provenance.analyzer` and `provenance.canonIndex` in any v2.2.0 export. If two exports in one
   re-run disagree on the epoch, stop — something re-ran against a different canon mid-pass.
3. **Fill `result`** from the harness summary line.
4. **Write `delta`** as one plain sentence comparing `result` to `priorRun` — e.g. "unchanged: 10
   claim-like, 0 mapped" or "coverage 0% → 6.9% (2 new alias matches)". A re-run with no delta is the
   expected outcome for v2.2.0 and is worth stating explicitly.
5. **Update `updatedAt`.**
6. **Commit the manifest in the same commit as the exports it indexes.** A manifest that points at
   uncommitted files is worse than no manifest.

### Verifying a re-run before you trust it

For sources whose text is byte-identical to the v2.1.2 run, the v2.1.2 → v2.2.0 diff must be
provenance-only:

```bash
node fixtures/diff-analysis.mjs lab-corpus/exports/02-fem-centrism-v2.1.2.json lab-corpus/exports/02-fem-centrism-v2.2.0.json --mode freeze
```

`RESULT: PASS` with `0 behavioral` is the expected outcome. Anything else means the re-run is not the
version bump it claims to be — investigate before updating the manifest.

After a canon alias expansion, use the recall gate instead, which fails on any score decrease or
dropped match:

```bash
node fixtures/diff-analysis.mjs before.json after.json --mode alias
```

---

## 6. When the corpus is single-version

Re-runs are complete when every entry in `manifest.sources` has a `current` export whose
`provenance.analyzer.version` equals the epoch's. At that point the distillation lane's cross-source
comparison (the 0% / 0% / 3.6% vs 50% contrast that produced the retention-gap finding) rests on one
instrument, one threshold set, and one canon snapshot — and the manifest can prove it.


---

# lab-adjudication-at-scale.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-adjudication-at-scale.md`

# The adjudication gate had disarmed itself, and the volume is why

2026-07-30. No analyzer change, no canon change. One fixture field, one rewritten
test.

## What was wrong

The crossing record's gate was one flag:

```js
adjudicationOpen: pending > 0
```

While open, the suite REPORTED outstanding crossings instead of failing on them,
so a release could be built in parallel with the adjudication it was waiting for.
Closing it was the release's job. That is a good rule, and it worked while the
sweep covered 117 passages and a change produced a few dozen crossings a human
could read in an afternoon.

The sweep now covers 2,401 passages. Of the 5,138 outstanding crossings, **4,622
are at `candidateScoreFloor`** and nobody is ever going to read them. While they
sit there `adjudicationOpen` is permanently true, which means the branch that
FAILS is permanently unreachable.

**A guard that can only ever report is not a guard.** It had quietly become a
log line. The honest options were to disarm it openly or to arm the part that
matters, and the second is obviously right — the reason the volume is
unadjudicable is that most of it is at the least consequential line, not that
adjudication stopped being worth doing.

## The three lines are three different kinds of event

| line | treatment | outstanding |
|---|---|---|
| `minCredibleScore` | **BLOCKING**, no volume exception | **0** |
| `minWeakScore` | **RATCHET**, may only fall | 516 |
| `candidateScoreFloor` | **CENSUS**, not adjudicable | 4,622 |

**`minCredibleScore` blocks.** It decides whether a reader is shown a match as
credible. There is no volume argument available here and there never will be:
the entire archive has produced **38 of these ever**, across every change since
the record began. If one is outstanding, the suite fails and says which sentence
to go read.

**`minWeakScore` ratchets.** It changes the nearby-concepts list a reader sees,
so it is not a census. But 516 are outstanding from before this rule, and
demanding they be cleared before the next release would just disarm the guard a
second way — this time by making it impossible to satisfy instead of impossible
to trip. The count may only FALL: a change that adds weak crossings has to answer
them, and the historical backlog gets worked down in its own time. Same shape as
`junkRecall`, for the same reason.

**`candidateScoreFloor` is a census.** It decides which entries were CONSIDERED.
It can never put a match in front of a reader: `applyBoundedContext` refuses to
boost anything below `minWeakScore`, and the largest boost available is 0.045
against a 0.17 gap.

It is still **recorded**, and that is deliberate. When the sweep widened I nearly
gave this tier a narrower band to shrink the fixture, and checking stopped it: a
pair clearing the floor on a unit with no stronger candidate becomes `nearest`,
and `nearest` decides an unmapped claim's reason line, its destination, and the
entry title seeded into its research search terms. Not adjudicable is not the
same as invisible, and the record says which one it means.

## What shipped

`counts.pendingByThreshold` in `tests/fixtures/threshold-neighbors.json`, written
by the sweep and cross-checked against `rulings` by the suite so the summary
cannot drift from what it summarises.

`tests/lab-threshold-neighbors.test.mjs` reads it per-threshold. Both new
branches are RED-verified:

```
flip one ACCEPT back to PENDING
  -> "1 minCredibleScore crossing(s) are unruled. This is the line that decides
      whether a reader is shown a match as credible, and it is release-blocking
      with no volume exception"

lower WEAK_BACKLOG_CEILING 516 -> 515
  -> "516 minWeakScore crossings are unruled, above the ceiling of 515. This
      change added weak crossings without answering them."
```

`adjudicationOpen` stays and keeps its meaning — it is the honest one-line
summary of whether anything is outstanding. What changed is that the suite no
longer decides what to do from that flag alone.

The suite now prints its state every run rather than only when something is
wrong:

```
adjudication: 0 credible (blocking) · 516/516 weak (ratchet) · 4622 candidate-floor (census)
```

## What this does not do

It does not reduce the backlog. 4,622 candidate-floor crossings remain recorded
and unread, and that is now the stated policy rather than an accident.

It does not answer whether the band should still store 97,888 scored pairs at
8.4 MB. That is a separate question about the tripwire, not about the verdict
record, and the tripwire is still doing real work — it caught 100 unrecorded
crossings from the entry-side change this afternoon.

## The lesson worth keeping

The gate broke by **growing**, not by being wrong. Every individual decision that
led here was correct: widening the sweep to 21 sources, recording every crossing,
deriving `adjudicationOpen` rather than setting it. The failure was that a rule
calibrated for one population size was carried into a population 20× larger
without anybody re-asking whether it still meant what it said.

Worth checking the same way on the other frozen instruments: the band width
(±0.03), the `dumpFloor` (0.02) and the display caps were all chosen against a
much smaller corpus too.

## Addendum — 2026-07-31: the weak backlog no longer exists

The 516 figures above are the state at ruling time and stay as written. The next
day the backlog was cleared: the 91 readable crossings were ruled hand-entered
(48 ACCEPT / 43 REJECT, `lab-weak-backlog-sitting-91.md`) and Jason ruled the
425 epoch orphans RETIRED as a class (`lab-weak-orphan-retirement.md`).
`WEAK_BACKLOG_CEILING` is now **0**: the ratchet's headroom is spent, and every
future weak crossing blocks until ruled. The three-line governance itself —
BLOCK / RATCHET / CENSUS — is unchanged and still operative.


---

# lab-v2.6.2-scope.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-v2.6.2-scope.md`

# LE Lab v2.6.2 — scope carried out of the v2.6.1 record pass

**Status:** written 2026-07-29 when the v2.6.1 record-fidelity review loop was closed by Jason after
five verification passes. Nothing here is urgent and nothing here is a production defect — the
instrument was ACCEPTed on all five passes and `js/lab-analyzer.js` is byte-identical to its pre-pass
value, `f452c2b326dc4ebf312ca794a7b102cc2554c0c39066585d1e5079b6fe59ba25`. These are the items the record
pass could not do because it was forbidden from touching the analyzer, plus one cleanup.

**Why this file exists rather than another review round.** Of the nineteen findings across passes 2–5,
about seventeen were defects introduced by the previous round's corrections rather than by the shipped
release. The loop had stopped measuring the release and started measuring the editing. Everything below
is actionable from this file alone; none of it needs a sixth brief.

---

## 1. Publish which test matched — `matchedBy`

**The gap.** `contextualAliasTrace` publishes the modifier that refused a contextual alias
(`reason: technical modifier “health care” within 3 tokens`) but not **which of `carries`'s three tests
selected it**. So the branch table in `tests/lab-match-behavior.test.mjs` and §2.1 of
`md/lab-v2.6.1-release.md` attribute per-test behavior with a **replica** of `carries`, anchored on the
returned modifier and the outcome. Production could change the branch while preserving modifier, score,
fate and admission, and the replica's columns would silently go false.

**The change.** Either shape closes it:

- `carries` returns `{ modifier, matchedBy }` instead of a bare modifier, and `disqualifyingModifier`
  forwards `matchedBy` into the trace row; or
- `promotedAliases` adds `matchedBy` to the `contextualAliasTrace` row it already builds.

**Cost.** Additive to `le-lab.diagnostics` (→ `/1.2`) and to the flag-file contract that carries the
trace. Moves the analyzer hash. **Moves no score**, so by v2.4.2's rule the analyzer *version* need not
move — but check that against the release's own reasoning rather than against this sentence.

**What it buys.** §2.1's table stops being a labelled model and becomes a freeze; the replica in
`tests/lab-match-behavior.test.mjs` can be deleted, and with it the drift surface that produced the
worst finding of the whole arc (the lane-priority model, which got two of six rows wrong).

## 2. The comment at `js/lab-analyzer.js:1878`

It still describes the contiguous-stem run as having **replaced** substring matching. That claim was
retracted three times over in the record (Appendix A of the release report) and the comment is the
load-bearing copy — the next person to modify `carries` reads it, not the release note.

Comment-only, no behavior, but it moves the analyzer hash, which is why the record pass left it. Jason
ruled documentation-only at the time and required the divergence be named in the record; it is, in §2.2.
**Fix it in the same commit as item 1**, since that commit is already rewriting the function.

## 3. The contiguous-stem generalization — still queued, still behind `GENERIC_TERMS`

Dropping the substring test so the stem run is the only multiword rule. **Score-moving**, which is why
it is not a record correction. Full argument in §7.2 of the release report; the safety measurement
already exists as `bl-19` (`health care services` stays disqualified without the substring test, because
the stem run matches `health care` directly and `care`/`service` match literally).

Unblocked by a production flag landing on `bl-17`/`bl-18` territory. Ordered behind `GENERIC_TERMS`
(v2.6.0 §13.2) because both are the same defect — a hand-written list compared against a representation
it was not written in — and fixing the smaller one first means touching `carries` twice.

## 4. Cleanup — one attestation without a source

`tests/fixtures/denylist-widening-census.json` requires every surface in `arguableAttested` to carry an
`attestationEvidence` row with a source and either a URL or an explicit note. **`hosters` has the note
and no URL**, which the test permits and which the fixture itself flags as the weakest verdict in the
file. Either cite it or move it to `reachedButUnattested`. Nothing depends on the answer; it is a loose
end recorded so it is not rediscovered as a finding.

---

## Not carried forward, and why

**The `reason`-string change is already covered.** Adding test 3 can change *which* modifier is reported
for an unchanged verdict — `healths care` would have reported `care` at v2.6.0 and reports `health care`
now (§2.1). No further work: the branch table asserts the returned modifier per row, so a future change
to that ordering fails the suite.

**`softwarization` stays a recorded gap, not a task.** It strips to `softwar`, so the denylist cannot see
a live technical term. Widening the denylist to catch it is a vocabulary change and this project's
standing position is that enumerating vendors and spellings is not a rule — see v2.5.0 §1.2 and the
`realButNotReached` note in the census. Recorded so it is not rediscovered; not queued.


---

# lab-post-restoration-sweep-532.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-post-restoration-sweep-532.md`

# Post-restoration sweep — canon 532, restored corpus

**Date:** 2026-07-31 · **Canon:** 532 (`1.0.0+19b16e04659d`) · **Analyzer:** 2.6.11
**Scoring config:** `bt0a7p` (unchanged) · **Corpus:** restored, 21 sources
Read-only: no entry, overlay, page, band, fixture or threshold was modified by this run.

Run at Jason's instruction after the corpus was re-acquired, to answer two things: what the
adjudication gate says now that it can run again, and whether `statistics:stat-desire-prediction`
is over-broad — the open question behind the deliberate red on `lab-analyzer.test.mjs` test 8.

---

## 1. The gate is clean, and it is genuinely running again

`npm run test:lab` chains with `&&`, so the deliberate red on test 8 stops the suite before the
threshold step. These were therefore run directly:

```
ok 1  the frozen band is internally consistent
ok 2  an outstanding credible-line verdict blocks, and the weak backlog may only fall
ok 3  no corpus pair crosses an admission line without a ruling      (8.0 ms, NOT skipped)

adjudication: 0 credible (blocking) · 516/516 weak (ratchet) · 4725 candidate-floor
```

The sweep reproduces the committed band's provenance exactly — **2448 passages × 532 entries =
1,302,336 pairs**, 428,730 at or above the 0.02 dump floor — matching `scoredPairs` in
`tests/fixtures/threshold-neighbors.json` to the number. Band and tree agree.

**What `ok 3` does and does not license.** It says the current tree crosses no admission line
the band has not already recorded. It is **not** evidence that the 507 → 532 canon growth crossed
none, because the band was **regenerated** after that growth (`127cec7`), and regenerating a
frozen band is a baseline reset — it absorbs crossings rather than reporting them. The
regeneration was measured before it was applied (rulings 5427 → 5427, weak 516/516, credible 0,
no orphaned rulings), which is the right discipline and is why nothing is believed to have been
lost. But the crossings from that growth were **absorbed, not adjudicated**, and no instrument
can now recover them: see §5.

## 2. `stat-desire-prediction` is NOT over-broad — the probe is the thing that aged

The entry's total reach across the whole restored corpus is **two captures**:

| Score | Conf | claim-like | Source | Passage |
| --- | --- | --- | --- | --- |
| 0.486 | Low | yes | `09-conroy-beam-discrepancies` | "In particular, what happens when our mates do not match our preferences?" |
| 0.431 | Low | yes | `01-pew-online-dating` | "Most U.S. adults are skeptical or unsure that dating algorithms can predict love." |

Two captures, two distinct scores, both claim-like, zero non-claim junk, and the second is
*precisely* the entry's subject — dating algorithms predicting love. That is a well-behaved
entry, not a topic magnet, and nothing here resembles the `"AI companion"` defect.

**Consequence for the ruling.** Option (b), narrowing the entry's match surface, would be the
wrong repair: the only thing narrowing protects is a synthetic probe, and the thing it would
cost is the Pew capture, which is correct.

**The sharper measurement.** The probe scores **0.475**. Real corpus text on this topic scores
**0.431–0.486**. The probe now sits *inside* the band of legitimate captures, which is the exact
sense in which it stopped being novel: it can no longer act as a negative control because it is
no longer distinguishable from a true positive. A negative control has to be outside the
distribution it is controlling for.

This is evidence for an adjudication, not the adjudication. Jason has ruled (a) leave red, twice.

## 3. Capture quality of all 20 new entries — no magnets

First capture audit these entries have had. Corpus-wide mapped top-slots: **857** (was 790 at
canon 491, before both the canon growth and the corpus restoration).

| Entry | Captures | Distinct | Med margin | Best | Non-claim |
| --- | --- | --- | --- | --- | --- |
| `stat-sexual-communication` | 11 | 11 | 0.067 | 0.758 | 2 |
| `stat-cycling` | 6 | 4 | 0.124 | 0.646 | 1 |
| `stat-cohab-timing` | 4 | 4 | n/a | 0.523 | 0 |
| `stat-wedding-hazard` | 3 | 3 | n/a | 0.617 | 0 |
| `stat-relationship-education` | 3 | 1 | 0.058 | 0.518 | 0 |
| `stat-desire-prediction` | 2 | 2 | 0.046 | 0.486 | 0 |
| `stat-marriage-market`, `stat-acquaintance-matching`, `stat-sex-frequency` | 0 | — | — | — | — |
| all 11 `pills:` entries | 0 | — | — | — | — |

The magnet signature — many captures at ~one distinct score with a wide runner-up margin — appears
**nowhere**. The densest entry has as many distinct scores as captures.

`stat-relationship-education` is the only one worth a second look (3 captures, 1 distinct score),
but n = 3 is far too small to call a rate, and its margin is a healthy 0.058.

## 4. Fourteen of the twenty take no top slot — and that is not what it first looked like

**This section was wrong twice in its first version and is corrected here rather than quietly
edited.** It said "ten", and it read the number as evidence the entries were unvalidated. The
count is **fourteen** (all eleven `pills:` entries plus `stat-marriage-market`,
`stat-acquaintance-matching`, `stat-sex-frequency`), and the inference does not survive contact
with the retrieval layer.

**The instrument, not the entries.** §3 counted **top-slot** captures — the entry `analyzeDocument`
ranks first. "Zero captures" was then read as "never surfaces to a reader", and those are not the
same claim. Measured against the sweep dump, none of the fourteen is dark; every one is reachable,
with **224 to 1,562** scored pairs each:

| Entry | Pairs ≥0.02 | Best | ≥weak | ≥credible |
| --- | --- | --- | --- | --- |
| `stat-sex-frequency` | 1562 | 0.483 | 182 | 2 |
| `stat-acquaintance-matching` | 1258 | 0.501 | 52 | 3 |
| `stat-marriage-market` | 1104 | 0.424 | 61 | 0 |
| `pills:page-rp:dread` | 549 | 0.617 | 8 | 1 |
| `pills:page-bp:love-conquers-all` | 224 | 0.521 | 5 | 1 |
| `pills:black-scoreboard` | 970 | 0.414 | 15 | 0 |
| remaining eight `pills:` | 292–643 | 0.263–0.302 | 1–3 | 0 |

**Case A — validated, just outranked.** `stat-sex-frequency` and `stat-acquaintance-matching` are
credible matches on real corpus text, at ranks 3 and 4:

- `stat-sex-frequency` **0.483 credible**, rank 3, on *"Mean Marital Satisfaction, Sexual
  Satisfaction, Sexual Frequency, across Waves of Measurement…"*, behind `satisfaction-flywheel`
  0.564 and `stat-sexual-communication` 0.494.
- `stat-acquaintance-matching` **0.501 credible**, rank 4, on *"The search for a romantic partner:
  the effects of self-esteem and physical attractiveness on romantic behavior."*, behind three
  physical-attractiveness entries tied at 0.540.

They reach readers. They are validated against real text. The earlier claim that they need a
register this corpus does not contain was simply false for these two.

**Case B — the admission gate refusing a coincidence, correctly.** The two highest scores any
`pills:` entry achieves are both *rejected* by the shipped pipeline, and inspecting why is the
most reassuring result in this document:

- `pills:page-rp:dread` scores **0.617** on *"He also has to be your only romantic partner."* —
  and lands in `weakMatches` with **no credible match on that unit at all**.
- `pills:page-bp:love-conquers-all` scores **0.521** on *"I am someone who is looking for love."*
  — also weak-only.

`isCredibleCandidate` is `score >= minCredibleScore` **AND** `hasCredibleMatchEvidence`, which
demands a signature hit, phrase hit, exact alias hit, or ≥2 admission-distinctive shared tokens.
Both sentences clear the score and fail the evidence: they are topic-word coincidences —
*romantic partner*, *love* — on entries about dread game and about love conquering practical
disagreement. **A high score with thin evidence is exactly what that gate exists to refuse, and
it refused it.** This is the gate working, not an entry failing.

**What actually remains.** The eight `pills:` entries topping out at 0.263–0.302 never approach
the credible line, and *shit test*, *cope*, *LMS* and the Black Pill scoreboard genuinely do not
appear in Pew reports or marriage-research papers. Their misreadings have still only fired on
synthetic self-tests. That residual is real and narrower than first stated, and closing it needs a
corpus source in the manosphere register — the same gap `md/lab-hookup-transaction-layer.md` §6
flagged for the AI-companion material. **No entry needs changing.**

**The lesson, which is the third of its kind in this document:** a metric's definition is part of
its claim. "Zero captures" meant zero *top slots*, and was read as zero *reach*. Same family as
§1's `ok 3` (a skipped gate reads as a pass) and §5's absorbed crossings (a regenerated baseline
reads as no change).

## 5. The confound that is now permanent, and worth stating once

The corpus that came back is not the corpus that was lost: **1 source byte-exact, 13 within 2%,
7 drifted beyond 2%, 1 excluded by prior decision.** Only `02-fem-centrism` reproduced exactly,
and only because it was captured from an immutable Wayback `id_` URL — the other twenty were
live-fetched, and a live page cannot be re-fetched byte-identically.

So any comparison spanning the loss conflates two independent changes: **canon growth
(507 → 532)** and **corpus drift (20 of 21 sources superseded)**. There is no baseline that
isolates either, and there will never be one. The pre-loss band measured a population that no
longer exists.

Practical rule this leaves behind: a threshold baseline is only meaningful against a fixed
corpus, so **the corpus hash set is part of the baseline's identity**, not context around it.

## 6. What was and was not done

Read-only. The band was not regenerated, no pin was moved, no fixture was touched — in
particular `tests/lab-analyzer.test.mjs` test 8 remains red by ruling, and this record is
evidence for that adjudication rather than a step toward closing it.

Method notes, both downstream of how the corpus was destroyed: the corpus was **copied** into a
detached worktree rather than junctioned, and the copy was deleted before the worktree was
removed. Every number here came from importing the shipped analyzer, not from a re-implementation.

**Open, and needing Jason:**

1. ~~**Test 8**~~ — **RULED AND CLOSED.** Jason adjudicated (c), reword the probe. §2 is why (b)
   was rejected: an entry reaching two passages, one of them exactly on subject, is not
   over-broad, and narrowing it would have cost the correct capture. See §7.
2. **The absorbed crossings** (§1) — unrecoverable; noted so no later reader mistakes `ok 3` for
   a statement about the 507 → 532 growth.
3. **The unvalidated entries** (§4) — **re-scoped after measurement, and it was never ten.** Of
   the fourteen with no top slot, two are credible matches on real text and merely outranked, and
   the two highest-scoring `pills:` matches are coincidences the admission gate correctly refuses.
   The genuine residual is the **eight** `pills:` entries topping out at 0.263–0.302, which needs
   a manosphere-register corpus source. That is a source-acquisition decision for Jason, not an
   entry defect: **no entry needs changing.**

## 7. The ruling, and the selection rule it leaves behind

Jason held (a) until the entry could be measured, then ruled **(c) reword the probe**. The new
probe is *"A new claim says volcanic ash decides which romantic partner sneezes more in autumn."*

It was chosen by measurement against two criteria, because the old one died of being written in
vocabulary the canon later grew into:

1. **Headroom below `minCredibleScore`.** Best match 0.336 (`lexicon:term-the-consumer-unit`)
   against the 0.43 line — **0.094 clear**. Seven candidates were measured.
2. **Outside the canon's growth direction.** *"does the laundry"* (0.346) and *"parks the car"*
   (0.335) scored as well or better and were **rejected anyway**: `statistics` now carries
   `stat-equal-earner-labor`, so household-labour vocabulary is precisely where this canon is
   expanding. Seasonal physiology is not.

**The general rule: a negative control has to sit OUTSIDE the distribution it controls for.**
The old probe's failure was drifting inside it — 0.475 against genuine corpus captures of
0.431–0.486 on the same topic. Headroom alone is not enough, because headroom erodes in whatever
direction the canon is growing. If this probe ages out too, re-measure candidates the same way
rather than taking the first sentence that passes.

Verified after the reword, with the corpus present so the tripwire is armed rather than skipped:
`npm run test:lab` — **18 steps · 18 ok · 0 failed**.


---

# lab-alias-naming-rule.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-alias-naming-rule.md`

# The alias-naming rule, tested: the corpus is blind to half of it

2026-07-31. No canon change. Canon `1.0.0+07fb1c92bac5`, 491 concepts, 21
archived sources.

`md/lab-synopsis-register.md` §4b claimed, from post-hoc data, that multi-word is
not the safety property in an alias — **what the phrase NAMES is** — and recorded
the claim as untested prospectively. This is the test. It half-succeeds, and the
half that fails is more useful than the half that works.

## 1. The design, and why it is prospective

Every multi-word alias in the canon was classified **from its grammar alone**, by
a rule fixed in the script before any occurrence was counted or any passage read:

```
BARE-NP      a noun phrase denoting a topic or a group, no predicate,
             evaluation, quantifier or imperative
PREDICATIVE  anything asserting, evaluating, quantifying or commanding
```

The classifier cannot see the outcome, so a motivated classification was not
available to me. That was the de-biasing the previous round said this needed —
the register census failed precisely because the person with a stake authored the
probes.

**Prediction registered before the numbers existed:** BARE-NP aliases fire on
passages that DESCRIBE their topic; PREDICATIVE aliases fire on passages
ASSERTING something. No split means §4b is wrong and gets withdrawn.

## 2. The test is VOID, and that is the result

```
multi-word aliases (title echoes excluded)     360
  BARE-NP                                      328
  PREDICATIVE                                   32

with at least one literal archive occurrence    29 of 360
  BARE-NP        28/328 fire · 312 occurrences
  PREDICATIVE     1/32  fire ·   1 occurrence
```

**One firing out of thirty-two.** The predicative class has no population in this
corpus, so the comparison cannot be made and a null here means nothing about
safety. That is fact (p) of the triage contract again — the 21-source archive is
essays and papers, and it has no discourse register at all, which is exactly
where predicative aliases live.

The single PREDICATIVE hit is `too many women`, and it is the **title of
Guttentag and Secord's 1983 book**, on the one entry that cites them. n=1, and a
book title is not a claim being made.

### The correction this forces to my own recommendation

§4b and §2 of `lab-synopsis-register.md` recommend discourse-register multi-word
aliases as "the cheapest register bridge available". **That recommendation rests
entirely on authored probes.** `just move` reaches an authored ordinary-register
sentence at 0.645 and occurs **zero times** in twenty-one sources. The archive
cannot confirm it and cannot refute it, and any future claim that the remedy
"works" needs a corpus this one is not.

Also worth stating plainly: **331 of 360 multi-word aliases never occur in the
archive at all.** Most of the alias surface is untested by the only instrument the
project has.

## 3. The salvageable half, and it sharpens the rule

The 28 firing BARE-NP aliases were read. They split cleanly, and not on the axis
§4b proposed:

**Aliases naming the CONCEPT ITSELF land on claims about it.**

```
physical attractiveness   84  -> smv:looks
   "they also place a higher value in a partner's physical attractiveness (39% vs 30%)"
dyadic power               7  -> frameworks:sex-ratio
   "Members of the sex in short supply enjoy greater dyadic power"
mate value discrepancy    19  -> frameworks:replaceability-asymmetry
mate retention behavior   15  -> frameworks:mate-retention-intensity
```

`smv:looks` **is** the physical-attractiveness lever; `sex-ratio` **is** the
dyadic-power mechanism. The alias is the concept's own name in the source
register, and its hits are findings about the concept.

**Aliases naming a POPULATION the concept ranges over land on crosstabs and
figure labels.**

```
previously married         3  -> frameworks:clearing-order
   "Never Married  Previously Married  Married  100 Percent 80 68 60 54 42 40 20 …"
   "The percent of never married, previously married, and married individuals who
    see their parents and their siblings at least weekly"
```

Two of its three hits are a **figure axis label** and its caption. That is the
same failure as `younger women` on `smv:looks:age` — a demographic category
matched wherever a dataset breaks out by it — and it is live in the shipped canon
today.

### The rule, restated

> **An alias must name the CONCEPT, not a population the concept ranges over.**

That is a better axis than claim-versus-population and it explains every case the
project has measured:

```
physical attractiveness  names the concept       fires on claims          GOOD
dyadic power             names the mechanism     fires on the mechanism   GOOD
just move                names the claim         (unmeasurable here)
previously married       names a demographic     fires on figure labels   BAD
younger women            names a population      fires on a harassment stat  BAD
age · face · body        names the concept BUT the name is also a universal
                         axis or a homonym       +75 credible, none right  BAD
```

The last row is why naming the concept is **necessary and not sufficient**: `age`
names `smv:looks:age` exactly and still fails, because the token's presence
carries no information about whether the passage makes the claim. Both conditions
have to hold — name the concept, and pick a name whose appearance is evidence.

## 4. One actionable defect, not mine to fix

`previously married` on `frameworks:clearing-order` is a population-naming alias
firing on figure labels in the shipped canon. It is the concurrent session's
entry and a canon edit, so it is flagged rather than changed. Its measured cost is
small — three archive occurrences — and the fix is to drop the alias, not to
reword anything. Recorded here so the next canon pass has it.

## 5. What would actually test this

A corpus with a discourse register: forum threads, comment sections, transcripts.
`md/lab-constants-audit.md` already needs one for `shortUnitWordCount` and the
three context boosts, all of which are near-inert on essays and papers. **That is
now three separate findings pointing at the same missing instrument**, and it is
the highest-value acquisition on the board — not more analysis of the archive we
have.

## Reproducing

```
alias-naming-census.mjs   grammar classifier, occurrence census, excerpt dump
                          -> alias-naming-census.json
```


---

# lab-weak-orphan-retirement.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-weak-orphan-retirement.md`

# LE Lab — the 425 epoch orphans, retired as a class (2026-07-31)

**Status: LIVE.** The §5b decision from `md/lab-backlog-headroom.md`, made explicitly
by Jason in-session on 2026-07-31 ("let's retire the 425 orphans"), same day as the
91-crossing sitting (`md/lab-weak-backlog-sitting-91.md`).

## What was ruled, and by whom

All 425 remaining `minWeakScore` PENDING rows carry `ruling: "RETIRED"`,
`ruledBy: "Jason"`, `ruledAt: "2026-07-31"`, and a per-row note stating the ground:
the passage each was measured against did not survive the 2026-07-31 corpus loss and
re-acquisition, and cannot be read by anyone, ever. **RETIRED is not a verdict on the
crossing — it is the record that no verdict is possible.** It is deliberately not
ACCEPT (the association was never endorsed) and not REJECT (it was never refuted).

This is attributed to Jason because he made exactly this decision, about exactly this
class, in-session. It is not the bulk stamp he declined on 2026-07-30: those rows
were unread; these are unreadable, and the instrument that separates the two
(the sweep-identical unit→source rebuild, validated against all 2,438 current unit
ids in `md/lab-backlog-headroom.md` §3) ran again at stamp time — the script refuses
any row whose passage exists in the current corpus. 425 of 425 were orphans; 0
readable rows were touched.

## Mechanics

- The retirement script re-verified per-row unreadability before stamping, then moved
  the two counts together: `counts.pending` 5150 → 4725,
  `counts.pendingByThreshold.minWeakScore` 425 → 0, both cross-checked against the
  rulings they summarize.
- RED-first on the contract: the stamp was run against the unmodified suite first,
  and the value guard fired (`…carries an unrecognised ruling: RETIRED`). Only then
  was `RETIRED` added to the test's `RULINGS` set, with a comment stating it can
  never substitute for ACCEPT/REJECT on a readable row and that `--rule` cannot
  produce it (the sweep's `--rule` still only accepts ACCEPT/REJECT).
- `WEAK_BACKLOG_CEILING` ratcheted 425 → 0 — the only edit the test file permits.
- Suite 18/18 green with the corpus present, tripwire armed.

## What the weak line means from today

The ceiling at 0 ends the grandfather clause. The historical backlog is gone — 91
read and ruled, 425 retired with the epoch — so from now the standing rule applies
with no buffer: **a change that adds any weak crossing cannot ship until that
crossing is ruled.** That was always the principle; the ceiling existed only to keep
the inherited backlog from disarming the guard. The remaining pending population is
exactly the 4,725 `candidateScoreFloor` census rows, which are recorded, not
adjudicable, and stated policy (`md/lab-adjudication-at-scale.md`).

## What was not done

No `--rule` (and `--rule` cannot express RETIRED); no `--baseline`; no sweep run; no
threshold moved; no score touched. The census tier was not touched. `minCredibleScore`
stands at 0 pending. Nothing was deleted from the fixture — all 5,427 ruling rows
remain, every verdict and retirement carrying its author and date.


---

# lab-gate-option2a-shipped.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-gate-option2a-shipped.md`

# Option 2a shipped: the canon is part of the gate, and the two instruments are now coupled

v2.6.6, 2026-07-30. Adopted by Jason with the coupling ruled **live**.

A passage that names a distinctive canon concept is in the relationship domain by
construction. Distinctive means a **multi-word alias phrase** — 843 of them
today, and not one bare word.

## What it does

`localDomainRelevance` gained a fifth input beside the four vocabulary frames. If
the frames would bin a passage and no affirmative non-domain evidence fired, but
the text contains a full canon phrase, the passage is retained as `uncertain`
with `reasonCode: 'named-canon-concept'`.

It never overrides a non-domain veto. A finance passage that happens to contain a
canon phrase is still a finance passage; this reaches only passages the frames
would bin for having no vocabulary at all.

The evidence entry is recorded whenever it fires, so a reader inspecting a
retained passage can see which concept the canon recognised.

## What it cost, measured

```
domainRecall      1.000   unchanged   (hard floor 0.9)
ignorePrecision   1.000   unchanged   (hard floor 0.95)
junkRecall        0.844   unchanged   (ratchet, may only rise)
cultural recall   10/24 -> 15/24
minimal-pair splits  3/8 -> 2/8
```

Nothing charged. The prediction in `lab-gate-option2.md` — 15/24, both floors
untouched, one split closed — held exactly.

The five newly retained cultural claims are all on surfaces the doctrine merge
authored six commits ago:

```
"...how the feminine reality frames the directions of our lives."
"Put simply, the feminine imperative will not allow this."
"Heteropessimism consists of performative disaffiliations with heterosexuality..."
"...extricate your own straight experience from straightness as an institution."
"Collectively changing the conditions of straight culture is not the purview of..."
```

This is the mechanism the option was chosen for: gate scope grew by **authoring
doctrine**, not by editing a regex.

### The split that closed

`cr-frame`, whose `plain` side had been the clearest single illustration of the
register gap:

```
keyed  "The operative frame in which men and women date is culturally manufactured."
plain  "The operative frame in which the sexes encounter each other is culturally manufactured."
```

The plain side has no participant vocabulary and no decisive relational frame, so
the gate binned it while retaining its twin. It now retains on **"the operative
frame"** — a concept the site authored in the retention doctrine merge. The
frozen verdict moved `irrelevant / no-human-relational-frame` →
`uncertain / named-canon-concept`, `knownSplits` came down 3 → 2, and the ratchet
in `tests/lab-gate-register.test.mjs` demanded both before it would go green.

### On the corpus, which no rig had measured

The frozen band's population pin — added hours earlier in `39415b2` — caught this
before any of it was written down:

```
The swept population is 2398 passages and the band was frozen at 2220.
```

**2a rescues 178 passages across the 21 archived sources**, contributing 27,403
scored pairs, of which **229 clear `minCredibleScore`**. Where they come from is
the sanity check:

```
 67  17-trent-south-sex-ratios          sex ratios and marriage markets
 45  08-mcnulty-early-marriage
 17  10-miller-alternatives
 14  18-li-necessities-luxuries
 13  21-hirschl-assortative-mating
  7  14-common-sense-ai-companions
  5  13-wheatley-counterfeit-connections
  4  04-heteropessimism
  2  02-fem-centrism
  2  11-ifs-genz-partner-priorities
  1  05-kim-generalizability
  1  19-zhang-preference-replication
```

A sex-ratio paper contributing a third of them is the register this option exists
for: social structure shaping mating, argued without a single "he asked her out".

**0 pre-existing pairs moved and 0 were lost.** Retention only widens, and a pair
already being scored is scored from the same unit against the same entry with
canon-derived IDF, so it cannot move. Same additive shape as the source widening,
and verified the same way rather than assumed.

## The part that is a contract change, not a feature

`tests/lab-domain-benchmark.test.mjs` — the gate's acceptance contract — now
loads the shipped canon and passes its surfaces to `classifyCase`. Jason ruled
the consequence explicitly:

> **Canon authoring may move the benchmark's thresholds, and the benchmark is
> re-run on every canon change.**

Adding a multi-word alias to `data/canon-overlay.json` is now a gate change. The
standing rule that a benchmark **append** lands in a commit touching no
classifier code is unchanged; what changed is that a canon commit is a commit
this benchmark can fail on. The policy is written into the file's own header, not
only here.

The alternative Jason rejected was a frozen snapshot of distinctive surfaces
updated deliberately, which keeps the instruments independent at the cost of
letting the snapshot go stale — the same failure that left the threshold sweep
reading three sources for a month.

### The argument stayed optional, so a test carries the contract

`classifyDomainRelevance(units, overrides, canonSurfaces)` has 35 call sites
outside the analyzer, most of them testing one frame's vocabulary in isolation
where a canon is noise. Making the third argument required would have added it to
all 35 to buy nothing.

So the argument is optional and a test enforces that the contract passes it:

```
test('the benchmark measures the gate that ships, canon included')
```

It pins an authored passage that no frame retains — *"Put simply, the feminine
imperative will not allow this."* — asserts it is binned with no canon, and
asserts `classifyCase` retains it with `reasonCode: 'named-canon-concept'`.
RED-verified by deleting the third argument, which produces:

> classifyCase is no longer passing the canon to the gate. Every metric in this
> file is now a true statement about a gate that is not the shipped gate.

`md/lab-gate-option2.md` refused to ship option 2 behind an optional argument for
exactly this reason. The argument is still optional; what changed is that
dropping it now fails a test instead of quietly succeeding.

## Everything else that had to move with it

`tools/lab-threshold-sweep.mjs` and `tests/lab-threshold-neighbors.test.mjs` both
pass the surfaces, because their population must be the product's population — a
sweep without them would have been short by exactly the 178 passages 2a rescued,
and every census it printed would have been quietly narrow. That is the same
defect the sweep widening fixed this morning, and it would have been reintroduced
by shipping 2a without touching them.

`tests/lab-gate-register.test.mjs` passes them too, and it matters most there:
those are minimal pairs, and 2a is precisely a mechanism that reads LE
vocabulary. Measuring the pairs against a canon-free gate would report a keyword
dependency the product does not have.

## What was rejected

**Variant 2b** — multi-word aliases plus curated single-word aliases, minus
`rizz` by name — reaches 16/24 instead of 15/24 and costs nothing on the
benchmark. It is not shipped. Excluding one word by name is fitting the rule to
the fixture, and the rule 2a states instead has a reason: one word is
insufficient evidence, which is the same reason `minSingleAliasLength` exists.

The two cases `rizz` costs are `ds-15` and `ds-16` — a sneaker colorway and a
mascot said to have it. Slang escapes its domain; a phrase does so far less
often.

## The five claims still unrescued

Four of the five are participant-vocabulary cases, unchanged by 2a and waiting on
the narrower design in
[`lab-gate-participant-vocabulary.md`](lab-gate-participant-vocabulary.md). The
fifth needs a concept for consumer-capitalism claims about coupling, which the
canon still lacks — and which is now, under the live coupling, a piece of
doctrine that will move this benchmark when it lands.


---

# lab-idf-unseen-token-fallback.md

# The unseen-token IDF fallback is non-monotonic, and the first entry to use a word taxes every entry that lacks it

2026-08-08. Found while repairing a recall loss the Lexicon crawl (e61e336)
caused. Diagnosed jointly: the QoL session bisected it to the commit and named
the mechanism; this session reproduced every number independently. Jason ruled
it an **engine finding to be opened as separate work**, not a fixture to re-cut.
Status **HIST** — closed 2026-08-09 by the v2.7.0 `unsharedTokenDfFloor`
release; see `# lab-adjudication-2026-08-08` in this volume. Open item 2
(corpus crossings) did not close and is carried there as permanent debt.

## What was measured

`js/lab-analyzer.js:1502` builds the IDF map over entry tokens only:

    idf.set(token, Math.log((entries.length + 1) / ((documentFrequency.get(token) || 0) + 1)) + 1)

and `scoreEntry` (:2498-2500) reads it for QUERY tokens as `idf.get(token) || 1`.
A query token that no canon entry uses is therefore not in the map and takes the
fallback **1.0**.

That fallback is **below the value the formula itself would assign**. At 707
concepts:

| df | source | weight |
|----|--------|--------|
| 0 | `\|\| 1` fallback | **1.000** |
| 0 | the formula, if asked | log(708/1)+1 ≈ **7.562** |
| 1 | the formula | log(708/2)+1 ≈ **6.869** |

So weight is not monotone in df. A word no entry has ever used is the cheapest
token in the language; the moment ONE entry uses it, it becomes among the
dearest. Nothing about the word's informativeness changed.

## What it cost

The claim "A person can prefer predictability without preferring commitment."
mapped to `lexicon:term-commitment` at 0.437 and fell to **0.383** — under
`minCredibleScore` 0.43 — so it mapped to nothing.

Commitment was byte-identical across the two canons: same id, same 36 tokens,
same `_phrases`, entryWeight 142.419 → 142.382. The entire delta is one query
stem. "preferring" stems to `preferr`, df 0 before the crawl. Exactly one of the
128 new entries introduced it — `lexicon:term-the-typology-shortcut`, on "what a
person **preferred** and what they felt their partner expressed" — taking df to
1 and the weight to 6.869. `preferr` is absent from Commitment's token set, so
it added ~5.87 to `queryWeight` while contributing nothing to `sharedWeight`,
and `queryCoverage = sharedWeight/queryWeight` collapsed.

**One entry, one stem, -0.054.** The whole-corpus IDF drift from all 128 entries
together moved the Availability pin by 0.001. The single-entry effect is
twenty-five times the aggregate effect of the change that carried it.

## The generalisation

Adding vocabulary to the canon can REDUCE recall for exactly the claims that use
that vocabulary. This inverts the intuition every canon-growth pass has run on —
that more canon is monotonically more reach — and it is invisible to the metric
that would normally catch it, because aggregate drift stays in the thousandths
while individual claims move by tens of thousandths.

Two failures in `tests/lab-analyzer.test.mjs` were near-gate at the time and only
one was this mechanism; the other, `frameworks:conversion-ladder`, was a fixture
pinned at EXACTLY 0.430 against a 0.43 gate. Its bounded-context promotion is
intact and measured — +0.045 both before (0.385 → 0.430) and after (0.383 →
0.428) — so only the landing point moved. Jason ruled that zero-margin pin is
**evidence for this finding**, not a test to re-cut, and it stays red.

Note the asymmetry the finding implies: those two are simply the near-gate pairs
that happened to carry fixtures. Any other pair sitting within a few thousandths
of an admission line moved the same way, unobserved.

## The blast radius: 311

Measured by the QoL session and reproduced here independently, comparing the
prepared canon at f5cb372 against e61e336:

| | |
|---|---|
| canon vocabulary | 5,194 → **5,505** stems |
| stems that ENTERED the canon | **311** |
| stems that left | **0** |
| of the 311, at df 1 — the maximum jump | **291** (idf 6.8693, **+5.8693** off the 1.0 fallback) |
| the rest | 16 at df 2 · 3 at df 3 · 1 at df 7 |

So `preferr` is not a special case; it is one of 291 identical cases. Every one
of those stems is a latent recall cliff for any claim that uses that word and
meets an entry that does not. The two red fixtures are not the blast radius —
they are the two places a fixture happened to sit close enough to a gate to make
the mechanism visible.

Why 128 glossary rows produced 311 new stems: `lexicalText`
(`js/lab-analyzer.js:1395`) splats `...entry.boundaryConditions` and
`...entry.commonMisreadings` into the tokenized surface, so overlay prose is
fully in the IDF corpus. The authored misreadings carry far more vocabulary than
the rows themselves. This also explains an ordering effect seen while the fix was
in flight: two of the three reds appeared from the lexicon rows alone and the
third only after the 128 overlay records merged. Overlay tranches are
score-moving events, not annotation.

## What was NOT done

- **The engine was not touched.** No change to the fallback, the formula, or any
  threshold. Restoring monotonicity (df 0 costing ~7.562 rather than 1.0) would
  make every unknown token expensive, move scores corpus-wide, and is a
  score-moving release in the v2.6.0 sense — it needs its own red manifest,
  crossing adjudication, and ruling. It is not a hotfix.
- **No page was reworded** and no gate moved. The recall loss was repaired with
  the permitted remedy — an authored canon surface. `lexicon:term-commitment`
  gained the `commonMisreadings` entry for the predictability conflation it
  genuinely lacked, which is a real gap in the entry independent of the score.
  It now ranks first at 0.593 and maps.
- **The exposure was not measured.** `lab-corpus/` is absent in this checkout, so
  the corpus adjudication tripwire in `lab-threshold-neighbors` SKIPS while its
  step still reports `ok`. How many pairs the 128 entries pushed across an
  admission line is unknown, against `WEAK_BACKLOG_CEILING = 0`. Measuring it
  needs the corpus restored (RERUN §1) and is the natural first step of the
  separate work.

## Open

1. Decide whether the fallback becomes formula-consistent, is left as documented
   behavior, or is replaced by a query-side rule that does not read entry df.
2. Restore `lab-corpus/` and sweep, to size how many crossings the crawl caused.
3. `frameworks:conversion-ladder` stays red until 1 is settled.

# lab-adjudication-2026-08-08.md

# Five tensions adjudicated, and the v2.7.0 unshared-token price ceiling that closes the first

2026-08-09. Two briefs (the Lexicon and UX sessions) put five design tensions to
adjudication. Jason delegated the decisions in-session on 2026-08-08 ("make the
decisions"); the rulings below are the adjudicating session's under that
delegation, Jason retains override on every one. No verdict below beyond that
delegation is his.

## T1 — unseen-token cost. RULED and SHIPPED (v2.7.0)

Neither pole survived measurement. Keeping 1.0 mints a cliff per new stem
(291 standing). Formula-consistent df-0 pricing (~7.56) is not a repair: the
pre-crawl Commitment pass existed only because of the 1.0 subsidy, so the
"consistent" price universalizes the injury — and it broke a frozen behavioral
fixture (a reader with one off-canon word must still reach a concept,
lab-match-behavior:1648).

Shipped: `unsharedTokenDfFloor: 12` in SCORING_CONFIG. A query token the entry
does not share is priced `min(idf, price(df 12))` (~5.0 at 715); the unseen
price IS the ceiling, so cost is continuous at first sighting and all 291
cliffs die by construction. Shared tokens and entry-side weights keep full IDF
— discrimination and authored-surface lift untouched. Inactive below the
small-canon cutoff (ceiling < 1), so toy fixtures keep frozen pricing.

Measured before shipping (sweep: legacy, formula0, formula1, cap3/4/5,
dffloor12; artifacts in session scratchpad): floors byte-identical under every
policy (domainRecall 1.000 · ignorePrecision 1.000 · junkRecall 0.854 — the
relevance gate never reads the fallback); full 19-step suite green under
dffloor12 except the Availability exact pin; census over 104 real-canon fixture
units: 2 flips, both unmapped→mapped domain claims reaching apt concepts, zero
junk crossings, 6 units gain an apt extra match. The standing red closed BY
ENGINE REPAIR: the continuation fixture maps at 0.445 with contextHelp intact,
+0.015 margin where it had 0.000. ANALYZER_VERSION 2.6.24 → 2.7.0; the config
hash moves with the new key, so provenance distinguishes the eras.

## T2 — the deliberately-red test, zero-margin fixtures, the pin. RULED

A red closes only by the engine work it evidences (here: shipped) or by Jason
re-cutting it; never by canon prose. A deliberate red must not share an exit
code with regression — moot this time (the suite is green), standing rule if
one recurs. Zero-margin fixtures are a test-design defect: a fixture asserting
a landing point when its subject is a mechanism measures the corpus instead.
The margin census (this release's baseline) lists the near-gate set; re-anchor
them on mechanism, per fixture, as follow-up. DONE 2026-08-09, and the
per-owner reading was better news than the ruling assumed: the hypergamy pair
(term-hypergamy 0.4300 exactly, page-rp 0.4290) sits under an EQUIVALENCE
assertion (apostrophe variants drift together), and the marriage-years claim
(stat-cohabitation-outcomes 0.4300 exactly) under a GUARD-behaviour assertion
— both already mechanism-anchored, no edit needed or made. The continuation
fixture was the one landing-anchored test; it now also pins its promotion
delta in [0.02, 0.08] (held ~+0.045 through every state), so a future landing
drift reds it only if the mechanism broke. seven-seven-rule remains −0.001
below the gate on the anchor claim with no assertion anchored to it: a
crossing would surface as a new split in the frozen mapping benchmark, which
is the correct place for it to be diagnosed. No assertion was loosened; no
goalpost moved. The Availability pin: converted
to a band [0.47, 0.56] (measured 0.509); its 13-move log is retired closed —
the crawl that cost a claim 0.054 moved the pin 0.001, so the exact pin was
the wrong instrument and its log is the asset. Standing authority: a session
may update a banded pin for a canon-growth cause with behavioral assertions
holding, logged; engine causes always get a record.

## T3 — overlay prose moves scores. RULED: keep the coupling, meter it

The coupling is the remedy's engine, not a side effect: the Commitment repair's
lift rides `predictability`, df 1, idf 6.881 — a stem the repair itself promoted
from unseen. Decoupling annotation from retrieval would gut the sanctioned
remedy. Standing rule: every canon/overlay-touching commit runs the cliff
census (stems entered, df histogram) and the fixture margin diff, recorded with
the commit. Instrument SHIPPED 2026-08-09: `tools/lab-cliff-census.mjs`
(old index from `git show <ref>:data/le-canon-index.json` into scratchpad;
`--selftest` for suite-independent verification). Validated against the crawl:
it reports 579→715, +335 stems, 313 at df 1, `predictability` first entrant. v2.7.0 bounds the damage a minted stem can do to entries that lack
it (~5.0 ceiling), but shared-side lift is uncapped by design — the census is
how that stays honest.

## T4 — repair vs. gaming. RULED: four prongs

Lexical tests cannot draw this line (the approved Commitment repair contains
neither `preferr` nor `prefer`; it works through an equivalent rare stem). The
line that matches both of Jason's prior rulings: (1) doctrine before
measurement — the gap is written as reader-error doctrine before its score
effect is looked at, and the record shows that order; (2) non-restatement — the
surface must add doctrine the entry's surfaces don't already state (the
conversion-ladder proposal failed exactly this); (3) decisive clearance — a
repair landing within 0.05 of the gate is presumptively fitting and escalates;
(4) the ledger — every red resolved by authored surface gets a row (entry,
fixture, stems entered, df histogram); a second repair on the same entry or
fixture escalates. No frequency cap; no invisible accumulation.

## T5 — the disarmed corpus tripwire. RULED, debt recorded

A skipped gate may not report `ok`: it must carry a loud third state
(DISARMED), and a canon-index-changing commit made while disarmed must carry a
debt row. SHIPPED 2026-08-09 (`tools/lab-suite-classify.mjs`, guarded by suite
step `tests/lab-suite-classify.test.mjs`; the suite is 20 steps now). Closing
it surfaced a second self-disarm: the runner's skip detector grepped the TAP
literal `# SKIP` while node emits the spec reporter here, so the SKIPPED
ASSERTIONS block had been silently dead — the detector for the disarmed state
was itself disarmed. Both reporter dialects are now read, and spec-format `✖`
failures count as failures rather than throws. PERMANENT DEBT, recorded here: the
crossings caused by e61e336/4ad8410 (311 stems, 291 at the then-maximum jump)
can never be measured against the original corpus. Recovery: successor corpus
+ committed hash manifest (identity, not just presence); the band regenerates
`--neighbors`-onto-existing against v2.7.0 scoring, so crossings are ruled
once, not twice; whether old rulings carry as precedent is Jason's alone.

Release hardening 2026-08-09: DISARMED is now machine-actionable as well as
visible. The ordinary runner exits 2 when any assertion skips; an operator must
use `--allow-disarmed` (or `npm run test:lab:allow-disarmed`) to acknowledge the
known missing precondition for that run. A real failure still dominates at exit
1. The suite is 21 steps: the cliff-census self-test now runs in-band and guards
both entrant vocabulary and a real weak/credible margin crossing. This does not
recover or forgive the permanent corpus debt above.

Successor baseline restored in the same hardening pass: committed corpus epoch
`9429b35a081698e6` (29 sources, all byte-exact) retains 3,238 passages against
715 entries under analyzer 2.7.0 / scoring hash `19eenj1`. Regenerating
`threshold-neighbors.json` onto its existing rulings carried all 36,320 human
records forward by key. Pending verdicts remain 0 credible / 0 weak; 29,242
candidate-floor rows remain the census the suite deliberately does not treat as
adjudicable. The original e61e336 crossing delta is still unknowable, as stated
above, but future corpus/canon/engine drift is armed again against this committed
successor identity.

## T6 — raised, not asked

The zero-dark-entries guard forced 128 overlay records to be bulk-authored in
one pass under test pressure — every crawl becomes a mass score-moving
authoring event. A staged admission state (misreadings owed, quarantined from
match surface until authored) is queued as design work for Jason.
