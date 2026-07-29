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

## Analysis result — `le-lab.analysis/2.4`

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
  verdict, so its exclusions are always visible, never silent;
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

## Diagnostic trace — `le-lab.diagnostics/1.0`

Opt-in and off by default: `analyzeDocument(document, canonIndex,
{ diagnostics: true })` adds a `diagnostics` key, and omitting the option leaves
the key absent rather than empty. `LabAnalyzerClient.analyze` forwards the flag
on both the worker and the main-thread fallback route.

The trace is the Pass B adapter boundary. Per claim unit it reports the domain
decision with its frame summary, the bounded-context bridge, and the **whole
working candidate set before display caps** — each candidate with its rank, its
rank at retrieval, the number of candidates above the floor, its truncation
fate (`top-ranked`, `exact-evidence`, `context-eligible`), the decomposed score
components, the penalties applied by name, the evidence surfaces hit with their
provenance types, the admission outcome, any context assistance, and whether it
was displayed as a match, a weak match, or not at all.

Everything under `diagnostics` is derived. It never feeds a decision, so the
same document analyzed with and without it produces the same matches, scores,
and stances — asserted as a test, not merely intended. It is versioned
independently of the analysis schema because it is an internal view and is
expected to churn faster than the published contract; nothing in the Lab
interface reads it.

## Research queue — `le-lab.research-queue/2.0`

The standalone queue export references its parent analysis, source, extraction
warnings, analyzer mode, and canon version. Each candidate keeps its source
location/excerpt, reason it stayed unmapped, nearest concepts, proposed canon
destination, empirical question, suggested search terms, falsifier, and risk
flags. Every item is labeled **research candidate — not LE doctrine**.
Research Queue v2 follows the analysis-v2 domain-filtered population and cannot
be interpreted as a v1 queue with merely additive metadata.

## Adapter boundary

A future analyzer may consume `le-lab.normalized-document/1.0.0` and return
`le-lab.analysis/2.1` without changing intake or the interface. It must identify
its mode, preserve segment references and canon IDs, report uncertainty, and
must not claim an upload-free or on-device mode unless that is true.
