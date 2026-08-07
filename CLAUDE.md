# The Love Equations — working agreements

Static site + the LE Lab (an NLP engine mapping discourse onto the site's canon).
Suites: `npm run test:lab` (18 steps) · `npm run test:all`. **Read the exit code, never
grep the output** — two steps throw bare AssertionErrors outside TAP, and a piped
`tail` hides the exit status. The suite's first line names the tree it tested;
believe it, not your assumption.

## The shared working tree

Several Claude and Codex sessions edit this one checkout concurrently, often at the
same time. On 2026-07-31 a detached-HEAD session left the tree eight files stale and
another session read its red suite as a regression.

- **This tree stays on `main`.** Never detach it, never switch it to a feature branch.
  Isolated work goes in a fresh COPY of the tree (a local `git clone` is fine) in your
  session scratchpad — never in this checkout.
- **Never use `git worktree` here.** A `git worktree remove --force` follows junctions;
  it once followed a `lab-corpus` junction and destroyed the real archive.
- Before EVERY commit: `git rev-parse --abbrev-ref HEAD` and `git status --porcelain`.
  `git add X && git commit` ships the WHOLE INDEX, and `git commit -- <paths>` ships
  WORKING-TREE content, not what you reviewed. So: stage ONLY your paths, read the full
  staged diff (`--cached`, hunks not `--stat`), commit from the index with NO pathspec,
  then check the commit's `--stat` matches the staged `--stat` — other sessions' files
  may be sitting in the tree.
- Commit straight to `main` when verified. **NEVER push without Jason's in-session
  confirmation.**

## lab-corpus/

Gitignored, third-party, and UNRECOVERABLE if destroyed (md/RERUN.md §1). Never commit
its text, never junction it anywhere — copy it. If it is absent, threshold tests SKIP
and the adjudication tripwire silently disarms; the suite prints skipped assertions —
read them, a skipped gate also looks green.

## Canon and the Lab

- Canon source pages (lexicon.html, pills.html, frameworks.html, …) feed
  `scripts/build-canon-index.mjs`. Any edit to one — including an href-only edit —
  changes the built index and must ship WITH the rebuilt `data/le-canon-index.json`
  in the same commit, suite green. `generatedAt` derives from the git state of the
  inputs, so the build cannot stamp its own commit: expect a follow-up
  "stamp the index" commit (pattern: 83bd559, 84dd62f).
- **Never reword a site page so a lexical matcher scores better.** Authored canon
  surfaces (aliases, misreadings via the overlay) are the permitted remedy.
- Threshold sweep (`tools/lab-threshold-sweep.mjs`): `--rule` is FORBIDDEN in any form
  (it stamps every outstanding crossing with one unread decision; Jason declined this
  explicitly on 2026-07-30). Never `--baseline` against a stale capture. Regenerate
  the band only with `--neighbors` onto the existing
  `tests/fixtures/threshold-neighbors.json` (or a copy of it) — sweeping to a fresh
  path silently produces a band with zero rulings and an identical-looking banner.
- Recording a verdict is TWO edits: `counts.pendingByThreshold.<t>` and
  `counts.pending` move together; never delete a key. Never attribute a verdict or
  approval to Jason that he did not give.
- Floors and ratchets are hard and a change that needs one loosened does not ship:
  domainRecall ≥ 0.9 · ignorePrecision ≥ 0.95 · junkRecall ≥ 0.75 (ratchet — floor may
  only rise; measured 0.853 over 191 cases since pt08 append #5, was 0.844 over 180) ·
  WEAK_BACKLOG_CEILING = 0 (every new weak crossing blocks
  until ruled; lowering was the only permitted edit and it is spent) · knownSplits ≤ 1.
- Frozen benchmark fixtures and assertion values are never edited to green a test.
  A red test is diagnosed and reported; goalposts move only by Jason's ruling.

## Where things are recorded

- `md/INDEX.md` — every record file: date, status (LIVE/HIST/SUPERSEDED), what it
  ruled or measured. Start there before re-deriving anything.
- `md/RERUN.md` — corpus/re-run protocol. `md/lab-adjudication-at-scale.md` — how the
  three threshold lines are governed. `md/mission-notes.md` — tone guardrails and the
  build-attribution ledger (new md records go in `md/`).
- Discipline that has paid for itself: measure before you change; attribute a zero to
  what the instrument could see before believing it; RED-first for new guards; report
  what you did NOT do as explicitly as what you did.
