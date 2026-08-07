# The Love Equations

A static site presenting a personal framework for attraction, selection, and compatibility —
a market read, not a moral verdict; neither rage nor cope. Every claim on the site carries an
evidence grade, and the big popular claims get put on trial with sourced rulings.

**Live site:** <https://jasonhchronicles.com/the-love-equations/>

## The site, in reading order

The landing page presents the content in a deliberate hierarchy; the repo follows the same taxonomy.

**The doctrine** — read in order; each page assumes the one before it:

| Page | What it is |
|---|---|
| `hierarchy.html` | The Love Hierarchy — the three-tier gate model (Primary/Secondary/Tertiary) everything else sits on, four takes side by side, plus a build-your-own tool |
| `smvlevers.html` | The Five Levers of SMV — Looks, Money, Status, Charm, Exposure, scaled by clock/market/context |
| `frameworks.html` | Rules & Frameworks — the Conversion Ladder, Interaction and Readiness gates, selection/pairing rules, relationship-maintenance rules, SMV Matching, and the big claims stress-tested |
| `gender-dynamics.html` | Gender Dynamics — the market read from each side, candid and evidence-tagged |

**The instruments** — analysis runs on-device; photos and Lab sources never upload silently:

| Page | What it is |
|---|---|
| `smvcalc.html` | SMV Calculator — 30-question self-assessment, switchable market lenses, profile A/B comparison |
| `face.html` | Face Calculator — MediaPipe landmarks + a trained ONNX model, PSL scale, in-browser |
| `body.html` | Body Calculator — pose + silhouette geometry with a CNN headline, folded with Face into one Looks score |
| `compatibility.html` | Compatibility Calculator — score anyone against any of the four hierarchies, 7–7 Rule verdicts |
| `matchmaker.html` | Matchmaker — your scores against a 150-profile roster, desire × odds ranking with the math shown |
| `lab.html` | LE Lab — normalize pasted transcripts and local sources, map claim-like passages into the LE canon, pressure-test the reasoning, and export unmapped research candidates |

**The evidence:**

| Page | What it is |
|---|---|
| `statistics.html` | Sourced, tier-graded charts |
| `mythbuster.html` | The Mythbuster — popular claims tried as court-style rulings; every ruling graded and sourced. The render gate refuses any entry without a valid tier, verdict vocabulary, and non-empty source URLs |

**The library:** `pills.html` (Pill Dossiers — Black/Red/Blue as lenses), `lexicon.html` (every term in one line),
`deep-dive.html` + `dd-*.html` (long-form essays).

### Evidence grading

Every card and chart carries a tier chip: **Tier 1** (replicated research) · **Tier 2** (real but mixed
evidence) · **Tier 3** (weak/contested) · **Myth** (a popular claim the evidence breaks) · **Observation** ·
**Lens** · **Strategy**. Mythbuster rulings additionally carry a claim verdict (*Confirmed / Oversimplified /
False / Backwards*) and an evidence tier (*hard-data / evidence / definitional*).

## Architecture

No build step, no framework — plain HTML/CSS/JS served statically.

- **Partials:** `partials/navigation-bar.html`, `footer.html`, and `composite-section.html` are injected at
  runtime by `js/include.js` (fetch + `outerHTML`), which then fires a `partials:loaded` event on `document`.
  Scripts that measure layout or render into the partials listen for it.
- **On-device models:** `models/*.onnx` run via onnxruntime-web (pinned CDN); MediaPipe tasks-vision (pinned)
  provides face/pose landmarks. See `models/README.md` for training, calibration anchors, and the
  export contract. Nothing leaves the browser.
- **LE Lab contracts:** `lab.html` is the instrument shell; modular browser extractors normalize every successful input into a versioned document before the deterministic analyzer returns a versioned result. Raw source material stays in session memory by default, and Reset cancels active work and revokes local media previews.
- **Cross-page state:** calculators share `localStorage` keys — `loveEquations.faceScore.v2`,
  `bodyScore.v2`, the shot keys, `smvCalculator.v7_2`, `compatibilityCalculator.v1`, `matchmaker.v1` — and a
  clipboard "profile package" JSON format (`source: 'love-equations.compatibility' | 'love-equations.smv'`)
  for explicit exchange between SMV Calc, Compatibility, and Matchmaker.
- **Fonts & CDN:** Playfair Display is self-hosted in `fonts/` (variable woff2, SIL OFL). Tabler icons and calculator model runtimes remain version-pinned. LE Lab lazy-loads PDF.js 3.11.174 and Tesseract.js 5.1.1 only when needed; top-level bundles carry SRI, worker/core/model URLs are exact-version pinned, failures leave transcript intake usable, and library downloads are labeled separately from source upload.

### LE Lab architecture and maintenance

- **Normalized intake:** paste/clipboard text; TXT, Markdown, SRT, VTT, JSON/JSONL, CSV, HTML, and basic RTF; local PDF text; image/clipboard OCR; and local audio/video metadata plus a companion transcript all converge on `le-lab.normalized-document/1.0.0`.
- **Media honesty:** local audio/video gets a private object-URL preview and analyzable companion subtitles/transcript. No speech-to-text model is shipped, so the UI never describes a media preview as transcription.
- **URL behavior:** ordinary CORS-readable HTML/text can be extracted explicitly. YouTube, podcast/media links without readable text, and CORS-blocked pages remain provenance and route the visitor to paste/upload a transcript.
- **Analysis:** `js/lab-analyzer.js` is the same deterministic lexical engine in browser and fixtures. Before canon retrieval, a separate frame gate evaluates human participants, relational outcomes, social mechanisms, and capped non-domain sense families; claim grammar alone never establishes relevance, and explicit human-relational outcomes outrank incidental causal inputs such as finance or technology. Matching then uses exact aliases, weighted overlap, dependency/neighbor context, a small inspectable LE signature layer, confidence penalties, reasoning-risk detectors, and an honest no-match path. The worker client falls back to the same main-thread implementation.
- **Contracts and exports:** `md/lab-schemas.md` documents `le-lab.normalized-document/1.0.0`, `le-canon-index/1.0`, `le-lab.analysis/2.1`, and `le-lab.research-queue/2.0`. Analysis/queue v2 define domain-filtered analytical populations and use unavailable coverage when no retained relationship-domain claims exist; they are not metric-compatible with v1. Analysis v2.1 additionally treats the relevance gate as visible triage: every set-aside passage is listed with its decision evidence, per-passage visitor overrides (include/exclude) are locked inputs disclosed in results, and the gate is held to a frozen append-only benchmark with recall/precision floors instead of per-round adversarial acceptance. Markdown/JSON exports retain provenance, extraction warnings, index/mode versions, segment references, citations, confidence, overrides, and limitations.
- **Canon maintenance:** `scripts/build-canon-index.mjs` extracts canonical HTML/JS into `data/le-canon-index.json`; `data/canon-overlay.json` contains only semantic aliases, relations, boundaries, and pressure questions that markup cannot provide. The validator rejects drift, bad relations, missing pages/fragments, duplicate IDs, and malformed evidence types.
- **Lab release token:** the shared `?v=` token deploys `css/lab.css`, the entry module, every recursively reachable first-party Lab module and worker, and the runtime canon-index request as one static release. Bump it everywhere when any item in that boundary changes; `tools/lab_release_audit.py` traverses the live graph and rejects omissions or disagreement. The canon index's internal `indexVersion` is an independent analytical contract.

No npm packages or build step are required. Lab tests use Node and the repository Python tooling:

```bash
npm run test:lab                         # Lab intake + analyzer + canon + HTML/ARIA/link audits
npm run test:all                         # Lab + SMV bands + Matchmaker invariants
node scripts/build-canon-index.mjs       # regenerate after canonical source changes
node scripts/validate-canon-index.mjs    # validate committed runtime index
python tools/lab_ui_audit.py             # Lab DOM/ARIA/link/CSS contract
python tools/lab_release_audit.py        # recursive Lab module/resource release-token graph
python tools/site_integrity_audit.py     # whole-site local links/fragments/IDs/ARIA
```

## Local development

```bash
python3 -m http.server 8000     # from the repo root, then open http://localhost:8000
```

Useful switches while developing:

- `mythbuster.html?preview=1` (localhost only) — renders gate-failed docket entries after the live cards.
- `face.html?debug` / `body.html?debug` — the batch calibration harness (sequential scoring of dropped
  image sets; persists nothing). Also enabled automatically on localhost.

## Maintenance tooling

`tools/` holds the Python maintenance scripts (`pip install -r tools/requirements.txt`):
roster image pipeline (`fetch_*`, `wire_roster_candidates.py`, `fill_curated_roster_images.py`,
`crop_roster_images.py`, `audit_roster_images.py`), matchmaker invariants (`verify_matchmaker.py` — run it
after any roster/data edit), and face-model calibration (`calibrate_face_anchors.py`,
`sample_face_calibration.py`). `models/train_body_beauty.py` retrains the body CNN (needs torch/torchvision;
read `models/README.md` first — the calibration anchors in `body.html` are the source of truth).

## Repo layout

```
*.html            the pages (flat, one file per section)
css/              one stylesheet per page + styles.css (shared tokens, nav, footer)
js/               site modules plus the modular Lab intake/analyzer/worker/export pipeline
data/             generated LE canon index + semantic overlay
scripts/          canon index generator and validator
partials/         runtime-injected nav / footer / composite section
fonts/            self-hosted Playfair Display (OFL)
images/           roster photos (manifest.json is generated — don't hand-edit)
models/           ONNX models + training/calibration docs
tests/            deterministic Lab/canon fixtures plus the standing SMV panel harness
tools/            Python maintenance scripts, integrity audits, and requirements.txt
md/               the record shelf — INDEX.md (start here; one row per record) + seven
                  consolidated volumes + mission-notes.md (the build ledger) + the two
                  routing files the test suite reads by path
```

The build ledger in `md/mission-notes.md` records every substantive work batch — what changed, why, and
how it was verified. Add a row when you land one.
