# Pressure test 07 — parallel run protocol (Claude + ChatGPT/Codex)

**Status:** READY for a 2-hour run. Both agents work THIS checkout on `main`,
concurrently, in FRESH sessions. This file is the collision contract. The
method is `md/doctrine-pressure-test-04.md` as executed two-handed in pt05 and
pt06 (`md/doctrine-pressure-test-05.md`, `md/doctrine-pressure-test-06.md`);
the working agreements in `CLAUDE.md` bind both agents. Kickoff prompts:
`md/pt07/KICKOFF.md`. Integrator model this run: **Claude Opus 5 at high
effort** (pt04–06 ran Fable high; the judgment work — verdicts, encompassing
calls, crossing rulings — is where effort belongs).

## Roles — the one rule that prevents every serious collision

- **Claude = integrator (maintainer lane).** SOLE writer of canon surfaces and
  SOLE committer: site pages, `data/canon-overlay.json`,
  `data/le-canon-index.json`, `tests/**`, every sweep/adjudication artifact.
  Only Claude rebuilds the index, dumps baselines, regenerates the band, or
  enters rulings.
- **ChatGPT/Codex = scout & drafter.** Read-only against the repo except:
  appending to `md/pt07/CLAIMS.md`, and creating NEW files only under
  `md/pt07/` with a `chatgpt-` prefix. No mutating git commands; never touches
  `lab-corpus/`.

Both agents may run `npm run test:lab` and the headless analyzer freely.
**Read the suite's exit code, never grep its output.**

## Claim ledger — `md/pt07/CLAIMS.md`

Before fetching, append one line: `- [agent] [lane] [URL] [status]`. Re-read
the file immediately before appending; if claimed, pick another. Statuses:
`claimed → analyzed → verdict(covered|gap|instrument|novel)`, plus
`abandoned(reason)` for dead fetches. **Write the file as UTF-8.**

## Lanes (pre-partitioned; a lane list is a default, not a fence)

ChatGPT: **A** dating shows and matchmaking TV as a formation channel (Love
Is Blind-style experiments, televised matchmaking discourse) · **B** romance
scams, verification, and dating safety practice (background checks, video
pre-screens — M-TBD-65 is an open question to pressure, not settled ground) ·
**C** folk typologies as screening instruments (astrology, MBTI,
love-languages matching — the Diagnostic Turn owns pop-CLINICAL labels;
non-clinical folk typing is the probe) · **D** sober dating and alcohol's
exit from courtship (dry dating discourse — the third-spaces deep-dive owns
venue loss; alcohol's role in pairing is the probe).

Claude: **E** desire-discrepancy discourse ("dead bedrooms," sexless-marriage
media — `desire-maintenance-split`, `desire-state-split`, M-TBD-29/39/50
exist; find what the discourse says that those don't own) · **F** dating
after loss (widowhood re-entry, grief and new partners — only the historical
`widows-house` era entry exists) · **G** neurodivergence and dating (autism/
ADHD dating discourse — also a domain-gate stress test) · **H** long-distance
and digital-first relationships (LDR discourse — `term-living-apart-together`
owns LAT, which is not LDR).

Skip anything covered by the corpus or pt02–pt06: check
`lab-corpus.manifest.json` and the ledgers in `md/doctrine-media-loop-03.md`,
`md/doctrine-retention-media-02.md`, and `md/doctrine-pressure-test-04/05/06.md`.

## Cycle (both agents, ~15–20 min each; integrator integrates every 2–3 cycles)

1. Claim in the ledger. Fetch raw HTML to your own temp dir (NOT the repo).
   Extract with `tools/extract-source-text.mjs`; record the SHA-256. Drop
   promo/recirculation furniture (`--drop`/`--cut`): known offenders are The
   Conversation's "Read more:" cards, IFS's inline "Post This" tokens,
   Psychology Today's pathways widget (it renders TWICE — drop both), and
   author-bio lines. **Cloudflare bot-walls block Fast Company and Axios** —
   have a fallback outlet per lane before you burn a claim.
2. `node fixtures/run-analyzer.mjs --source <txt> --out <temp>/<slug>.json`.
   **Record the canon version from the summary line with every capture** —
   mapped % is per-capture, not a fixed-baseline benchmark.
3. Read the output like a reviewer: mapped rows right? unmapped claims a gap
   or correctly novel? gate binning anything it shouldn't? false positives?
   tensions inheriting a wrong nearest match?
4. Record in your findings file (`md/pt07/chatgpt-findings.md` /
   `md/pt07/claude-findings.md`): URL, words, SHA-256, canon version,
   mapped %, verdict — **covered / gap / instrument finding / correctly
   unmapped** — and, for a gap, a PROPOSAL to the encompassing standard.

## Proposal standard (the encompassing rule — Jason's)

One big-picture subject covering most of what the articles surfaced; merge
siblings into the mechanism they share. Name: subject, parent entry, 2–4
sourced tiered claims, candidate aliases (concept-naming, no populations, no
single-token-with-punctuation, no bare numerals), 1–3 contract-compliant
misreadings (10–18 words, one sentence, no negators, an explicit
relational-frame word, ordinary register, none of `married/marries/chosen/
dates`), boundaries, and deliberate nonclaims. "No doctrine needed" is a
valid, valued verdict. Corpus-verifiable stats verify verbatim against
`lab-corpus/` before authoring; the integrator re-verifies every load-bearing
figure at its primary source regardless.

## Integration (Claude only, every 2–3 cycles)

Full pt04 procedure as executed in pt05/pt06: baseline `--dump` FIRST;
entries + overlay + rebuilt index + moved pins in ONE commit suite-green;
sweep `--baseline --neighbors` onto the existing
`tests/fixtures/threshold-neighbors.json` (indent-2 JSON); rule EVERY weak
crossing; credible rulings entered as recommendations FLAGGED FOR JASON;
probe misreadings fire Contradicts end-to-end; check the analyzer-demo pins
after any alias change; magnet-check new aliases against the corpus; then the
`generatedAt` stamp commit. Before every commit: `git status --porcelain`,
stage ONLY integrator paths, commit from the index with no pathspec, compare
the commit `--stat` to the staged `--stat`. **No push without Jason's
in-session confirmation.**

Four lessons from pt05/pt06 with teeth:

- **Misreading and boundary text is live match surface.** Any edit to overlay
  misreadings/boundaries/aliases is a scoring change: re-sweep and rule what
  moved.
- **When a demo pin trips, fix the authored surface, never the pin.** pt06's
  Border Bundle sub-note collided with the volcanic-ash probe's "A new claim
  says…" template — avoid "says" and "new" in authored prose near probe
  vocabulary; the reword restored the pin. `--rule` remains FORBIDDEN.
- **Short-unit token pairs are a credible-line hazard.** An 8-token corpus
  sentence hit 0.608 on two entries at once because both carried the
  romantic+partner token pair across their surfaces. Before shipping, grep
  the corpus for short sentences sharing 2+ content tokens with any new
  alias/misreading; if one entry needs a token pair, make sure only ONE of
  the pair appears across that entry's other surfaces.
- **Watch stance-bleed:** an agreeing sentence lexically close to a new
  misreading can display Contradicts at Low. Record it; do not author around
  it (engine work).

## Standing constraints (both agents)

Tree stays on `main` — never detach, never branch, never `git worktree`.
Never reword a site page so the matcher scores better — authored overlay
surfaces only. Floors/ratchets are hard; frozen fixtures are never edited to
green a test. Hyphenated compounds remain refusal-pinned — do not author
around it (a multi-word alias CONTAINING a hyphenated pair measured fine in
pt06; a single hyphenated compound is still unreachable). Credible-line
verdicts belong to Jason; Claude records recommendations. At close, Claude
writes the run record (`md/doctrine-pressure-test-07.md` + `md/INDEX.md`
rows + mission-notes ledger row) and folds the scout's closed findings file
only after its closeout.
