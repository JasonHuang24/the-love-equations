# Handoff brief — reorganizing the Dynamics cards

This is context for an agent picking up work on `gender-dynamics.html` (the
"Male & Female Dynamics" page). Read it before moving, adding, or editing any
cards. To auto-load it in a fresh Claude Code session, rename this file to
`CLAUDE.md`; otherwise just start the session with "read REORG-BRIEF.md and
follow it."

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
