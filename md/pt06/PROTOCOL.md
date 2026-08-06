# Pressure test 06 — parallel run protocol (Claude + ChatGPT/Codex)

**Status:** READY for a 1-hour run. Both agents work THIS checkout on `main`,
concurrently, in FRESH sessions. This file is the collision contract. The method
being repeated is `md/doctrine-pressure-test-04.md` as executed two-handed in
`md/doctrine-pressure-test-05.md`; the working agreements in `CLAUDE.md` bind
both agents. Kickoff prompts for both sessions: `md/pt06/KICKOFF.md`.

## Roles — the one rule that prevents every serious collision

- **Claude = integrator (maintainer lane).** SOLE writer of canon surfaces and
  SOLE committer of canon changes: the site pages, `data/canon-overlay.json`,
  `data/le-canon-index.json`, `tests/**`, and every sweep/adjudication artifact.
  Only Claude rebuilds the index, dumps baselines, regenerates the threshold
  band, or enters rulings.
- **ChatGPT/Codex = scout & drafter.** Runs articles through the headless
  analyzer (read-only against the repo), judges output sense, and writes
  findings + doctrine PROPOSALS. It creates NEW files only, exclusively under
  `md/pt06/` with a `chatgpt-` filename prefix. It edits no tracked file except
  appending to `md/pt06/CLAIMS.md`, runs no mutating git command, and never
  touches `lab-corpus/`.

Both agents may run `npm run test:lab` and the headless analyzer freely.

## Claim ledger — `md/pt06/CLAIMS.md`

Before fetching an article, append one line: `- [agent] [lane] [URL] [status]`.
Re-read the file immediately before appending; if the URL is already claimed,
pick another. Update your line's status as you go:
`claimed → analyzed → verdict(covered|gap|instrument|novel)`.
**Write the file as UTF-8** — pt05's run mojibaked the header arrows once.

## Lanes (pre-partitioned; a lane list is a default, not a fence)

ChatGPT: **A** paid human intermediaries (dating coaches, matchmakers,
date-me-docs) · **B** AI-assisted dating (profile ghostwriting, AI wingman
tools, chatbot screening of matches — NOT AI companions, which the corpus
already covers) · **C** religion and dating (faith-based apps, congregations
as meeting channel, interfaith pairing) · **D** cross-border and international
dating discourse.

Claude: **E** divorce discourse (gray divorce, divorce-rate myths,
walkaway-wife narratives) · **F** dating with children / stepfamily formation ·
**G** deliberate singleness ("boysober," intentional celibacy, single-positive
discourse) · **H** class and education gaps in pairing (hypergamy discourse,
mixed-collar relationships).

Skip anything the corpus or pt02–pt05 already covered — check
`lab-corpus.manifest.json` and the ledgers in `md/doctrine-media-loop-03.md`,
`md/doctrine-retention-media-02.md`, `md/doctrine-pressure-test-04.md`,
`md/doctrine-pressure-test-05.md`.

## Cycle (both agents, ~15–20 min each)

1. Claim in the ledger. Fetch raw HTML to your own temp dir (NOT the repo; NOT
   committed — third-party text). Extract with `tools/extract-source-text.mjs`
   (record the SHA-256 of the extracted text). Watch for embedded promo/
   recirculation blocks — pt05 found "Read more:" cards and recirculation
   furniture polluting claim counts; use `--drop`/`--cut` where the container
   carries them.
2. `node fixtures/run-analyzer.mjs --source <txt> --out <temp>/<slug>.json`.
   **Record the canon version from the summary line with every capture** —
   the canon changes under a parallel run, so mapped % is per-capture, not a
   fixed-baseline benchmark (pt05 provenance caveat).
3. Read the output like a reviewer: mapped rows right? unmapped claims a
   doctrine gap or correctly novel? gate binning anything it shouldn't?
   false positives? tensions inheriting a wrong nearest match?
4. Record in your notes file (`md/pt06/chatgpt-findings.md` /
   `md/pt06/claude-findings.md`): URL, words, SHA-256, canon version,
   mapped %, the verdict — **covered / gap / instrument finding / correctly
   unmapped** — and, for a gap, a doctrine PROPOSAL.

## Proposal standard (the encompassing rule — Jason's)

One big-picture subject that covers most of what the articles surfaced; merge
sibling phenomena into the mechanism they share. A proposal names: the subject,
the parent entry if a sub-entry, 2–4 claims with sources and tiers, candidate
aliases (concept-naming, no populations, no single-token-with-punctuation, no
bare numerals), 1–3 contract-compliant misreadings (10–18 words, one sentence,
no negators, an explicit relational-frame word, ordinary register, and none of
the morphology traps `married/marries/chosen/dates`), boundaries, and what it
deliberately does NOT claim. "No doctrine needed" is a valid, valued verdict.
Corpus-verifiable stats verify verbatim against `lab-corpus/` before authoring
(pt05 practice; the integrator will re-verify regardless).

## Integration (Claude only, every 2–3 cycles)

Full pt04 procedure, as executed twice in pt05: baseline `--dump` FIRST;
entries + overlay + rebuilt index + moved pins in ONE commit with the suite
green; sweep `--baseline --neighbors` onto the existing
`tests/fixtures/threshold-neighbors.json` (indent-2 JSON — match the sweep's
own format when editing rulings); rule EVERY weak crossing; enter credible
rulings as recommendations FLAGGED FOR JASON; probe misreadings fire
Contradicts end-to-end; check the analyzer-demo pins after any alias change;
magnet-check new aliases against the corpus; then the `generatedAt` stamp
commit. Before every commit: `git status --porcelain`, stage ONLY integrator
paths, commit from the index with no pathspec, compare the commit `--stat` to
the staged `--stat`. **No push without Jason's in-session confirmation.**

Two pt05 lessons with teeth:

- **Misreading and boundary text is live match surface.** Any edit to overlay
  misreadings/boundaries/aliases is a scoring change: re-sweep and rule what
  moved. A two-token rewrite moved 5 corpus crossings in pt05.
- **When a demo pin trips, fix the authored surface, not the pin.** pt05's
  boundary reword returned both tripped pins to their committed values; no
  test value moved. `--rule` remains FORBIDDEN in any form.

## Standing constraints (both agents)

Tree stays on `main` — never detach, never branch it, never `git worktree`.
Never reword a site page so the matcher scores better — authored overlay
surfaces only. Floors/ratchets are hard; frozen fixtures are never edited to
green a test. Hyphenated compounds are unreachable by authored surfaces
(engine finding, refusal-pinned) — do not author around it. Credible-line
verdicts belong to Jason; Claude records recommendations. At close, Claude
writes the run record (`md/doctrine-pressure-test-06.md` + `md/INDEX.md` rows
+ mission-notes ledger row) and folds the scout's closed findings file.
