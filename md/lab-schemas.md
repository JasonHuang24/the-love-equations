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

## Canon index — `le-canon-index/1.0`

`data/le-canon-index.json` is generated from canonical HTML plus a small
semantic overlay. It contains version metadata, indexed source pages, coverage
statistics, and an `entries` array. Every entry has a stable ID, title, page,
anchor, category, synopsis, evidence/content type, aliases/phrases,
dependencies, related entries, boundary conditions, common misreadings,
existing LE source links, and pressure questions where the source supplies
them. `scripts/validate-canon-index.mjs` rejects broken pages/fragments,
duplicate IDs, malformed evidence types, and invalid relations.

## Analysis result — `le-lab.analysis/1.0`

The deterministic local adapter returns:

- source provenance and extraction warnings;
- analyzer mode and exact canon-index version;
- word, source-segment, claim-segment, mapped, and unmapped counts;
- mapped claim-segment and claim-word coverage, explicitly labeled as document
  coverage rather than population evidence;
- excerpt-level canon matches with stance, confidence, lexical trace, deep
  links, LE synopsis, evidence/content type, sources, boundaries, dependencies,
  and related doctrine;
- category and evidence-tier distributions;
- prioritized pressure tests;
- adjacent doctrine;
- an independently exportable Research Queue;
- ambiguity warnings and limitations.

`segments[].matches[].score` is a bounded local lexical score, not a probability
that a claim is true. The alignment vocabulary is `Supports`, `Resembles`,
`Extends`, `Challenges`, `Contradicts`, and `Context only`.

## Research queue — `le-lab.research-queue/1.0`

The standalone queue export references its parent analysis, source, extraction
warnings, analyzer mode, and canon version. Each candidate keeps its source
location/excerpt, reason it stayed unmapped, nearest concepts, proposed canon
destination, empirical question, suggested search terms, falsifier, and risk
flags. Every item is labeled **research candidate — not LE doctrine**.

## Adapter boundary

A future analyzer may consume `le-lab.normalized-document/1.0.0` and return
`le-lab.analysis/1.0` without changing intake or the interface. It must identify
its mode, preserve segment references and canon IDs, report uncertainty, and
must not claim an upload-free or on-device mode unless that is true.
