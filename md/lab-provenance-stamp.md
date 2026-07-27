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
