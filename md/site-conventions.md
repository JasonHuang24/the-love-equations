# Site conventions

A volume of the record shelf (`md/INDEX.md` is the table of contents; one row per section).
Append new records as new `# <name>` sections at the END of the right volume — never as new
md/ files (see "Record hygiene" in CLAUDE.md). Every section below is a byte-exact merge of a
former standalone md/ file; in-text references to `md/<name>.md` resolve to the section of that
name in this or a sibling volume, or to the pre-merge file via the `git show` pointer on the
section header line.


---

# gender-dynamics-conventions.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/gender-dynamics-conventions.md`

# Conventions — the Dynamics cards

Card conventions and invariants for `gender-dynamics.html` (the "Male & Female
Dynamics" page). Read this before moving, adding, or editing any cards.
(Originally the handoff brief for the card reorg, as `REORG-BRIEF.md`; the
reorg is done, but the conventions here remain the page's contract.)

## What this page is

A static, tabbed page. Each tab is a `.dyn-page` div with its own hero and a
list of collapsible Q&A cards grouped under section dividers.

| Tab id        | Tab          |
|---------------|--------------|
| `page-land`   | Overview     |
| `page-male`   | Male         |
| `page-fem`    | Female       |
| `page-both`   | Both Sides   |

JS: `showPage(id, btn)` switches tabs; `toggle(header)` expands/collapses a card.

## The exact markup (copy this shape — do not improvise)

**Card** — ONE single line, indented 8 spaces:

```html
        <div class="dos-card"><div class="dos-head" onclick="toggle(this)"><span class="dos-head-label"><i class="ti ti-ICON"></i> TITLE</span><i class="ti ti-chevron-down dos-chev"></i></div><div class="dos-body"><p>BODY</p></div></div>
```

**Section divider** — 8 spaces. First section in a tab uses `first`:

```html
        <div class="dos-section first">First Section Name</div>
        <div class="dos-section">Later Section Name</div>
```

Use HTML entities in titles/sections (`&amp;` for &, `<em>` for emphasis is fine inside bodies).

## Invariants — breaking any of these breaks the page

1. **One card per line**, indented exactly 8 spaces. No pretty-printing across lines.
2. **One open card per tab.** The *first* card of each tab uses `dos-chev open`
   and `dos-body open`. Every other card is closed (no `open`). If you move the
   first card, make sure exactly one card per tab still has the `open` markers.
3. **Unique content icon per card.** Tabler icons (`ti-*`). Before using an icon,
   check it's not already taken:  `grep -c "ti-ICONNAME" gender-dynamics.html`
   (the `ti-chevron-down` on every card is the only intentional repeat).
4. **Markup balance must hold.** This must be equal after any edit:
   ```bash
   grep -o '<div class="dos-card">' gender-dynamics.html | wc -l
   grep -o '</p></div></div>'        gender-dynamics.html | wc -l
   ```
5. **No orphaned sections** — every `dos-section` must be followed by at least one card.

### Quick inventory / verification

```bash
awk '
/id="page-male"/{p="MALE"} /id="page-fem"/{p="FEM"} /id="page-both"/{p="BOTH"}
/class="dos-card"/{c[p]++}
/class="dos-section/{print p" SECTION: "$0}
END{print "---"; for(k in c) print k, c[k]}
' gender-dynamics.html
```

## Current state (as of this brief)

Counts: **Male 124 / Female 36 / Both 29 = 189** (balanced).

- **Male (11 sections):** The default market · Directness, delivery & the indirect
  game · Selection, hypocrisy & how guys respond · Logic, feelings & the cycle ·
  Facing reality & what attracts · The looks-first reality · The female-approval
  engine & mixed signals · **Game, the mask & reading signals** (by far the
  largest section — the prime candidate to split) · Standards, leverage &
  desperation · The cost of staying true · The macro picture — why dating broke.
- **Female (6 sections):** The choosing & the window · The approval engine · Your
  standards & your choices · How you choose — and what it does · Looks &
  attraction, honestly · Timing, honesty & the mirror.
- **Both Sides (4 sections):** The shared market · How these conversations get
  distorted · Meeting people & the odds · Regret, the missed window & seeing clearly.

## Editorial rules (these encode deliberate decisions — don't undo them)

- **Dedup hard.** Only add genuinely distinct ideas. If a nugget overlaps an
  existing card, fold it in rather than creating a near-duplicate.
- **Tone: "neither rage nor cope."** Debunk false comfort without sliding into
  blackpill bitterness. Clear-eyed, not doom.
- **Voice:** conversational, second-person where natural.
- **Both Sides cards intentionally use "she/he/women/men" framing** to show a
  dynamic running both ways (e.g. "She feels like a body; he feels like a
  wallet"). These are NOT un-neutralized leftovers — leave them.
- **Male-tab cards that are actually gender-neutral** have already been moved to
  Both Sides and rewritten in neutral voice. If you move more cards between tabs,
  neutralize the voice to match the destination tab.
- **`mission-notes.md` is not card material.** Mission-statement/manifesto
  content, brainstorm/miscellaneous notes, and AI-epistemics/meta material live
  there on purpose. Do NOT convert those into cards.

## Known open task

The Male section **"Game, the mask & reading signals"** is bloated (largest
section by far) and is the main reorganization candidate — split it into 2–3
tighter sub-themes. Beyond that, the owner wants a general second-opinion pass on
whether cards are in the right tab/section.

## Workflow

- Branch: develop on a feature branch, commit with clear messages, push. Do NOT
  open a PR unless explicitly asked.
- After any card change, re-run the inventory + balance checks above before committing.

---

# General website audit — 2026-10-28

Requested by Jason, including permission to edit, commit, and push. Baseline:
`d47ba32`. Scope: engineering, usability, accessibility, responsive presentation,
content plumbing, and product-description accuracy across all **24 pages**.

## Coverage and repairs

- **Shared shell:** all 24 pages now have one main landmark and a working first-tab
  skip link. All 16 navigation destinations remain reachable in short mobile menus.
  DOM tab order matches the collapsed layout, Escape returns focus, and responsive
  changes recover focus from controls that become hidden. The full navigation row
  stays compressed through 1800px to avoid overflow immediately above 1700px.
- **Reference interactions:** all 12 back-to-top controls (four references and eight
  essays) respect reduced motion and restore heading focus. Lexicon's five filters
  expose their selected state and respond to same-page/history fragments; term
  links reveal cards hidden by filtering. Malformed Dynamics hashes fail softly.
  The Hierarchy builder's Add factor controls are native buttons; factor fields and
  import/export textareas have labels, and disclosure buttons expose expanded state.
- **Readable styling:** the shared dim text token changed from `#a58b7b` to `#765e51`;
  footer headings increased from .45 to .58 opacity. The final default-state survey
  found 1,806 direct-text token uses and 96 footer headings. Flattened solid-background
  ratios have a 4.90:1 floor for the dim token; footer headings exceed 5.27:1 even
  against the strongest footer glow. These calculations are not a pixel-level or
  whole-site WCAG certification. Screenshots were inspected separately.
- **Responsive components:** Pills' nested grids can shrink to the available column;
  its final synthesis link can wrap. Matchmaker's mobile sliders have usable tracks,
  and both Matchmaker and Compatibility stack according to actual content width,
  including the narrower desktop wide-mode cases. Footer columns wrap before their
  labels collide. Deliberately scrollable tables/timelines remain scrollable.
- **Calculator reliability:** Matchmaker respects Compatibility's explicit touched
  flag, excluding untouched neutral defaults and accepting deliberately scored
  all-minimum profiles. Composite scores survive storage failure for the current page,
  disclose failed persistence, reject invalid/inconsistent scale records, and escape
  stored source labels. Clipboard helpers correctly report refusal or exceptions.
- **Descriptions and maintenance:** added 13 missing meta descriptions (24/24 now
  covered), corrected the homepage's obsolete 150-profile roster and PSL-scale copy,
  and updated the documented v4 score keys. Extended the static audit and added
  repeatable browser and calculator regression checks. Shared asset references and
  the Lab release graph were refreshed; Lab release **2.7.14** changes no algorithm.

## Validation

| Check | Result |
|---|---|
| `npm run test:all` | Passed: Face 45, Body 46, Looks 6, calculator interop 27; Lab 25/25 steps; SMV fixture/structure checks; 200/200 Matchmaker profiles. Zero failures, skipped assertions, disarmed gates, cancellations, or todos. |
| Static site integrity | 27 documents including three partials; 826 local targets; 65 rendered Mythbuster fragments. Metadata, language/viewport, image-alt presence, safe new-tab links, IDs and ARIA references pass. |
| Site browser matrix | 24 pages × 84 viewport sizes × 2 width modes = **4,032** settled measurements; 50/50 checks, zero uncaught exceptions or horizontal overflow. Includes CSS media-query boundaries and neighbors, 320px phones through 4K, 16:9 and 16:10. |
| Final focused rerun | Homepage copy and Compatibility's final container fix: 336 measurements, 6/6 checks. Compatibility additionally passed 22 targeted states including its actual container-query boundary. |
| Interaction browser audit | **52** checks: all page shells, 133 Dynamics card states, five factor tabs, four hierarchy disclosures and builder workflows, all 65 Mythbuster entries and filters, three Pill panels, empty states, and 12 back-to-top controls. |
| Lab browser audit | **19/19** workflows and 300 tab/viewport/mode measurements. Last-record access verified for 305 ledger rows, 307 citations, 200 skipped passages, and 505 source segments. |
| Calculator browser workflows | Seven storage/import/clipboard workflows; zero uncaught errors. Additional settled layout checks cover calculator internals and footer columns. |
| Canon | 715 concepts / 22 sources. All concept entries and scoring surfaces remain identical; only source hashes, index version, and the required post-commit source timestamp change. |

The broad capture contains 240 screenshots: top/middle/end of every page at mobile,
desktop and 4K, plus the final content before each footer on mobile. Representative
top, middle, nested/open, final-card, and footer states were visually reviewed;
tablet and extra instrument/panel screenshots were inspected in the focused audits.
Reports and screenshots remain in ignored `artifacts/site-browser-audit/` and
`artifacts/lab-browser-audit/`; tooling is committed for reproduction. Layout checks
wait for two animation frames after resizing; immediate measurements can observe
stale media-query layout. Geometry checks allow deliberate scrolling/clipping
containers and do not substitute for screenshot inspection.

## Limits and remaining work

This pass did not recrawl or fact-check the 253 unique external URLs, rerun model
training/real-photo benchmarks, or change editorial doctrine or numerical scoring.
The existing [photo-model validity findings](calculators.md#real-photo-looks-benchmark--2026-09-28),
[Matchmaker trait/odds/prose findings](roster.md#matchmaker-audit--2026-10-27), and
[Lab recall/attribution limitations](lab-history.md#le-lab-usefulness-audit--2026-10-27)
remain relevant. Passing software tests is not evidence that those models are
scientifically validated. Browser verification used desktop Chromium with simulated
viewport sizes; physical-device and cross-engine testing were not performed.

