# The Love Equations

A static site presenting a personal framework for attraction, selection, and compatibility —
a market read, not a moral verdict; neither rage nor cope. Every claim on the site carries an
evidence grade, and the big popular claims get put on trial with sourced rulings.

**Live site:** <https://jasonhuang24.github.io/the-love-equations/>

## The site, in reading order

The landing page presents the content in a deliberate hierarchy; the repo follows the same taxonomy.

**The doctrine** — read in order; each page assumes the one before it:

| Page | What it is |
|---|---|
| `hierarchy.html` | The Love Hierarchy — the three-tier gate model (Primary/Secondary/Tertiary) everything else sits on, four takes side by side, plus a build-your-own tool |
| `smvlevers.html` | The Five Levers of SMV — Looks, Money, Status, Charm, Exposure, scaled by clock/market/context |
| `frameworks.html` | Rules & Frameworks — the 7–7 Rule, the Conversion Ladder, SMV Matching, and the big claims stress-tested |
| `gender-dynamics.html` | Gender Dynamics — the market read from each side, candid and evidence-tagged |

**The instruments** — everything scores on-device; photos never upload:

| Page | What it is |
|---|---|
| `smvcalc.html` | SMV Calculator — 30-question self-assessment, switchable market lenses, profile A/B comparison |
| `face.html` | Face Calculator — MediaPipe landmarks + a trained ONNX model, PSL scale, in-browser |
| `body.html` | Body Calculator — pose + silhouette geometry with a CNN headline, folded with Face into one Looks score |
| `compatibility.html` | Compatibility Calculator — score anyone against any of the four hierarchies, 7–7 Rule verdicts |
| `matchmaker.html` | Matchmaker — your scores against a 150-profile roster, desire × odds ranking with the math shown |

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
- **Cross-page state:** calculators share `localStorage` keys — `loveEquations.faceScore.v2`,
  `bodyScore.v2`, the shot keys, `smvCalculator.v6`, `compatibilityCalculator.v1`, `matchmaker.v1` — and a
  clipboard "profile package" JSON format (`source: 'love-equations.compatibility' | 'love-equations.smv'`)
  for explicit exchange between SMV Calc, Compatibility, and Matchmaker.
- **Fonts & CDN:** Playfair Display is self-hosted in `fonts/` (variable woff2, SIL OFL). The only external
  runtime deps are the pinned, SRI-tagged Tabler icon font and the pinned onnxruntime/MediaPipe bundles.

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
js/               include.js, composite-score.js, mythbuster.js, deep-dive.js, body-pose-worker.js
partials/         runtime-injected nav / footer / composite section
fonts/            self-hosted Playfair Display (OFL)
images/           roster photos (manifest.json is generated — don't hand-edit)
models/           ONNX models + training/calibration docs
tools/            Python maintenance scripts + requirements.txt
md/               project ledger (mission-notes.md — read this first for history), specs, briefs
```

The build ledger in `md/mission-notes.md` records every substantive work batch — what changed, why, and
how it was verified. Add a row when you land one.
