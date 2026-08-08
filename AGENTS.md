# Delivery quality standard

Treat the user's first complete prompt as the graded submission brief. Do not rely on follow-up prompts to discover obvious scope, completeness, or basic visual judgment.

## Scope and coverage

- Interpret "each", "every", "site-wide", "across the page", and similar language literally. Inventory and count every affected element before editing.
- Translate the request into observable acceptance criteria, including total target count and deliberate exceptions.
- Inspect the actual document/component hierarchy before choosing selectors. Do not infer full coverage from a few visible examples.
- Handle first, last, nested, continuation, empty, desktop, and mobile states when they are relevant.
- Ask the user only when a genuine product choice or material ambiguity remains. Do not ask them to specify routine completeness.

## UI implementation

- Apply consistent visual treatments across every intended target. Supplied screenshots are examples unless the user explicitly limits scope to them.
- Use ordinary visual judgment at boundaries: preserve breathing room, avoid dividers that separate nothing, and keep primary and subordinate hierarchy intentional.
- Inspect representative top, middle, nested, and final states at relevant viewport sizes before calling a visual change complete.
- For site-wide responsive work, cover mobile, tablet, standard desktop, 1080p, 1440p, and 4K classes; include common 16:9 and 16:10 resolutions and every user-selectable width mode.
- Check behavior between breakpoints as well as at breakpoint boundaries. Verify horizontal overflow, clipping, wrapping, spacing, readable line length, and component proportions.

## Verification and delivery

- Verify semantic coverage in addition to syntax, links, and structural integrity. Passing automated integrity checks does not prove visual completeness.
- For repeated UI changes, run or create a coverage audit that compares the requested targets with the elements actually styled.
- Do not describe work as finished, commit it, or push it until every acceptance criterion has been checked.
- Report validation precisely. Never present a structural audit as evidence for something it does not test.
