# Loop Assignment 2 — intake segmentation: abbreviation-safe sentence splitting

**Status:** drafted 2026-07-26, HELD until loop assignment 1 (intake cleanup: hero button removal + "Demo Test" rename) merges. Jason pastes the block below to the ChatGPT orchestrator verbatim at that point. Origin: Doctrine Backlog Harvest #1, finding C1 (`md/doctrine-backlog-harvest-01.md`).

```
ASSIGNMENT 2 OF THE QoL ROADMAP — intake segmentation: abbreviation-safe sentence splitting (small, single-purpose PR)

CONTEXT: On a real stats-heavy source, the sentence splitter broke on the period inside "vs." parentheticals, producing five orphan fragments ("27%).", "16%).", ...) that the relevance gate had to set aside, and — worse — leaving the parent claims truncated mid-parenthesis in the ledger and exports ("...more likely than women to have tried online dating (34% vs."). This degrades any statistics-quoting source.

SCOPE: In the claim-unit/sentence segmentation (js/lab-intake.js and/or the unit detection in js/lab-analyzer.js — locate the actual split point first and name it in your report), make sentence splitting abbreviation-safe for at least: vs., U.S., e.g., i.e., etc., approx., No., a.m., p.m. A period followed by a lowercase letter or a digit-continuation inside an open parenthesis must not end a sentence. Add a regression test using a parenthetical-stats fixture, e.g.: "Men are somewhat more likely than women to have tried online dating (34% vs. 27%). Adults who have never been married are much more likely than married adults to report having used them (52% vs. 16%)." — expect exactly two claim units, neither truncated, zero orphan fragments.

CONSTRAINTS (hard)
- Confirm repository path F:\Programming\The Love Equations\The Love Equations Website, branch from current main, record starting SHA and clean tree in your report.
- Do NOT touch: the domain-relevance frames or decision logic in js/lab-analyzer.js beyond the split point if it lives there, tests/fixtures/domain-relevance-benchmark.json, tests/lab-domain-benchmark.test.mjs.
- Segment IDs are content-derived; changing segmentation changes unit IDs for affected sources. That is expected and acceptable — but normalized-document schema (le-lab.normalized-document/1.0.0) must not change shape.
- Bump the lab release token one step consistently if any lab JS changes; npm run test:lab fully green (all JS tests + canon validation + three audits).
- One branch, one PR; PR body lists files touched, the located split point, and confirms benchmark files absent from the diff.

REVIEW (relay to the adversarial reviewer when the PR is up): verify the fixture case produces two whole untruncated claims and no orphan fragments; suite green; no benchmark/classifier-semantics files in the diff; standard verdict vocabulary (APPROVE / CONTRACT VIOLATION / INDEPENDENT REGRESSION).
```
