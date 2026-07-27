# Pressure-Test Loop Re-entry Brief

**Status:** delivered to Jason 2026-07-27 for pasting to the ChatGPT orchestrator, after the docket closeout push (`115111a`). Retained here so the exact wording survives; if the head commit moves before pasting, update the SHA line. Context: assignments 1–2 were superseded (Claude shipped the QoL run, segmentation fix, and Section column directly at v=2.1); the loop's remaining role is read-only adversarial pressure-testing.

```
PRESSURE-TEST LOOP RE-ENTRY — state update + new standing role

STATE (read first; supersedes all prior assignments):
- Assignments 1 and 2 are CLOSED — do not implement, re-scope, or resend them. The maintainer's session shipped everything directly: the QoL run (hero "Bring a source" button removed, "Demo Test" rename, clickable stat-tile + flow-stage ledger filters, six→seven sortable ledger columns, expandable "+N adjacent"), the abbreviation-safe sentence segmentation (mergeSentenceSplitArtifacts in js/lab-analyzer.js; benchmark untouched and green), and the subsection-granular Section column (ledger + adjacent list + Markdown passage map).
- Repository: F:\Programming\The Love Equations\The Love Equations Website, branch main, release token v=2.1, head commit 115111a. Full gate is green: npm run test:lab = intake + analyzer (35) + frozen benchmark (134 cases: domainRecall 1.000 / ignorePrecision 1.000 / junkRecall 0.806) + export + canon fixtures + validate-canon-index + lab_release_audit + lab_ui_audit + site_integrity_audit.
- Governance unchanged: le-lab.analysis/2.1 fail-open triage contract; benchmark is append-only, thresholds live in the fixture, appends only by maintainer+reviewer agreement in commits touching no classifier code.

NEW STANDING ROLE — adversarial pressure-testing, not building:
The loop's job is now to break the shipped v=2.1 release and report, in read-only mode.
- HARD FENCE: no file writes, no branches, no PRs, no commits. The checkout is the maintainer's live working directory. Findings are REPORTS ONLY; fixes happen in the maintainer's session after triage.
- Test surface (browser, localhost, any port serving the repo root):
  1. Tile filters: metric tiles (claim-like, mapped) and flow stages (Claims/LE connections/Unmapped) filter the connection ledger; toggle clears; "Show all rows" clears; aria-pressed tracks state; Source/Tensions stages navigate to their views.
  2. Ledger sorting: all seven columns (Segment order, Source excerpt A–Z, Alignment grouped with Unmapped last, LE connection A–Z, Section grouped, Confidence numeric defaulting descending, Triage grouped); aria-sort correctness; stability under repeated clicks.
  3. Interplay: filter+sort must survive an include/exclude override re-run and reset on a new document or Reset; excluded rows must leave the ledger and appear in the triage panel; includes must re-enter every analytical population (the criterion-4 contract).
  4. "+N adjacent" expandable: every extra match listed with title, section, alignment, confidence; nothing hidden.
  5. Section column: breadcrumbs correct against data/le-canon-index.json entries (category · subcategory); weak-match rows show the nearest concept's section; em dash only when truly absent.
  6. Segmentation: stats-heavy sources with parentheticals ("(34% vs. 27%)"), e.g./i.e./approx./U.S./No./a.m./p.m. — no truncated parents, no orphan shards, and legitimate sentence boundaries (". U.S. Many...") still split.
  7. Exports: Markdown/JSON must disclose triage, overrides, and now the per-match section; no divergence between UI rows and exported rows beyond the documented render caps.
  8. Accessibility: keyboard operability of every new control, focus visibility, screen-reader labels.
- REPORT FORMAT: numbered findings, each with (a) exact reproduction steps, (b) observed vs expected, (c) classification from the fixed vocabulary — CONTRACT VIOLATION (breaks a documented contract in md/lab-schemas.md or the triage/benchmark governance) / INDEPENDENT REGRESSION (broken exports, schema violations, silent data loss, security defects, inaccessible controls) / SUGGESTION (visible-and-reversible polish; never blocking). No finding may propose editing tests/fixtures/domain-relevance-benchmark.json or tests/lab-domain-benchmark.test.mjs; fresh adversarial paraphrases the gate misses are proposed benchmark APPENDS routed to the maintainer, never ad-hoc blockers.
- ESCALATE to the maintainer instead of looping when: the same area produces contested findings twice running; a finding implies changing thresholds, classifier semantics, or schema contracts; or a new contract needs design.
Confirm the fence and the role, then begin with test surfaces 1–3.
```
