# Pressure test 05 — parallel run protocol (Claude + ChatGPT/Codex)

**Status:** LIVE for the run of 2026-08-06+. Both agents work THIS checkout on `main`,
concurrently, for at least an hour. This file is the collision contract. The method
being repeated is `md/doctrine-pressure-test-04.md`; the working agreements in
`CLAUDE.md` bind both agents.

## Roles — the one rule that prevents every serious collision

- **Claude = integrator (maintainer lane).** SOLE writer of canon surfaces and SOLE
  committer of canon changes: the site pages, `data/canon-overlay.json`,
  `data/le-canon-index.json`, `tests/**`, and every sweep/adjudication artifact.
  Only Claude rebuilds the index, dumps baselines, regenerates the threshold band,
  or enters rulings.
- **ChatGPT/Codex = scout & drafter.** Runs articles through the headless analyzer
  (read-only against the repo), judges output sense, and writes findings + doctrine
  PROPOSALS. It creates NEW files only, exclusively under `md/pt05/` with a
  `chatgpt-` filename prefix. It edits no tracked file, runs no mutating git
  command (no add/commit/checkout/restore/stash), and never touches
  `lab-corpus/`.

Both agents may run `npm run test:lab` and the headless analyzer freely — those are
read-only against the tree.

## Claim ledger — `md/pt05/CLAIMS.md`

Before fetching an article, append one line: `- [agent] [lane] [URL] [status]`.
Re-read the file immediately before appending; if the URL is already claimed, pick
another. Worst case (a true race) two agents analyze the same article — cheap, not
corrupting. Update your line's status as you go: `claimed → analyzed → verdict`.

## Lanes (pre-partitioned so the agents rarely want the same article)

ChatGPT: **A** infidelity/jealousy discourse · **B** cohabitation & delayed
marriage ("why nobody marries") · **C** marriage economics (weddings, prenups,
alimony discourse) · **D** loneliness/friendship spillover into dating.

Claude: **E** breakups, ghosting, situationships/commitment ambiguity · **F**
app design, algorithms, pay tiers · **G** long-distance & living-apart-together ·
**H** fertility timing / parenthood-decision discourse.

A lane list is a default, not a fence — claim outside your lanes through the ledger
if a lane runs dry. Skip anything the corpus or pt02–pt04 already covered (check
`lab-corpus.manifest.json` and the ledgers in `md/doctrine-media-loop-03.md`,
`md/doctrine-retention-media-02.md`, `md/doctrine-pressure-test-04.md`).

## Cycle (both agents, ~15–20 min each)

1. Claim in the ledger. Fetch raw HTML to your own temp dir (NOT the repo; NOT
   committed — third-party text). Extract with `tools/extract-source-text.mjs`
   (deterministic; record the SHA-256 of the extracted text).
2. `node fixtures/run-analyzer.mjs --source <txt> --out <your-temp>/<slug>.json`.
3. Read the output like a reviewer: are the mapped rows right, are the unmapped
   claims a doctrine gap or correctly novel, did the gate bin anything it
   shouldn't have, any false positives?
4. Record in your own notes file (`md/pt05/chatgpt-findings.md` /
   `md/pt05/claude-findings.md`): source ledger row (URL, words, SHA-256,
   mapped %), the verdict — **covered / gap / instrument finding / correctly
   unmapped** — and, for a gap, a doctrine PROPOSAL.

## Proposal standard (the encompassing rule — Jason's)

One big-picture subject that covers most of what the articles surfaced, not one
entry per detail; merge sibling phenomena into the mechanism they share (pt04
merged attachment-styles + therapy-speak into ONE entry). A proposal names: the
subject, the parent entry if it should be a sub-entry, the 2–4 claims with
sources and tiers, candidate aliases (concept-naming, no populations, no
single-token-with-punctuation, no bare numerals), 1–3 contract-compliant
misreadings (10–18 words, one sentence, no negators, contains an explicit
relational-frame word, ordinary discourse register), boundaries, and what it
deliberately does NOT claim. "No doctrine needed" is a valid, valued verdict.

## Integration (Claude only, every 2–3 cycles)

Fold accumulated gaps — its own and any ChatGPT proposals that clear the standard
— through the full pt04 procedure: baseline `--dump` FIRST, entries + overlay +
rebuilt index + pins in ONE commit with the suite green, sweep `--baseline
--neighbors` onto the existing fixture, rule every weak crossing, enter credible
rulings as recommendations FLAGGED FOR JASON, probe misreadings fire Contradicts,
check the analyzer-demo pins after any alias change, magnet-check new aliases
against the corpus, then the `generatedAt` stamp commit. Before every commit:
`git status --porcelain`, stage ONLY integrator paths (ChatGPT's uncommitted
notes and any Jason WIP stay out), commit from the index with no pathspec,
compare the commit `--stat` to the staged `--stat`. **No push without Jason's
in-session confirmation.**

## Standing constraints (both agents)

Tree stays on `main` — never detach, never branch it, never `git worktree`.
Never reword a site page so the matcher scores better — authored overlay
surfaces only. Floors/ratchets are hard; frozen fixtures are never edited to
green a test. Hyphenated compounds are unreachable by authored surfaces (engine
finding, refusal-pinned) — do not try to author around it. Credible-line
verdicts belong to Jason; Claude records recommendations.
