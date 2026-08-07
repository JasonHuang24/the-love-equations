# Pressure test 09 — parallel 5-hour run protocol (Codex in-tree + Claude-in-clone)

**Status:** READY for a 5-hour concurrent run, two vendors, two lanes.
Baseline: `main` @ e8c553a (v2.6.20), suite 18/18 green, tree clean, synced with
origin. The working agreements in `CLAUDE.md` bind both agents. Method ancestry:
pt04 procedure as run two-handed in pt05/pt06 (`md/pressure-tests.md`), extended
here with an adversarial engine lane and 5-hour scope.

## Agents, models, effort (state these in every sub-spawn and handoff)

- **Codex = ChatGPT Sol 5.6, reasoning xhigh.** DOCTRINE & CANON lane. Works
  THIS checkout on `main`. Sole committer in this tree.
- **Claude = Opus 5, reasoning high.** ADVERSARIAL & ENGINE lane. Works a fresh
  local `git clone` of this checkout in its own session scratchpad. Commits only
  in its clone; ferries work back as a patch series.

## Delegated self-ruling (pt09-specific, ruled by Jason in-session 2026-08-07)

Jason delegated threshold-crossing verdicts to the agents for this run. Rules:

- Rule **per-crossing, having read the crossing** — `--rule` remains FORBIDDEN
  in any form; bulk stamping is not ruling.
- Verdict attribution is the agent: `codex-pt09` or `opus-pt09`. **Never
  attribute a verdict to Jason.** Jason may overturn any pt09 ruling post-run.
- Recording a verdict is still TWO edits: `counts.pendingByThreshold.<t>` and
  `counts.pending` move together; never delete a key.
- Ruled fixture keys never reopen on re-crossing.

## Lanes — the file partition that prevents every serious collision

**Codex owns (edit + commit, this tree):** site pages (`*.html`, `css/`),
`data/canon-overlay.json`, `data/le-canon-index.json`, canon pins in
`tests/fixtures/`, `tests/fixtures/threshold-neighbors.json` rulings, `md/`
records, and `md/pt09/*` except `opus-*` files. Engine code — `js/lab-*.js`,
`fixtures/run-analyzer.mjs`, `tools/lab-*.mjs`, `tests/lab-*.test.mjs` — is
OFF-LIMITS except a minimal fix to a bug that hard-blocks a doctrine ship;
any such fix is logged loudly in `md/pt09/codex-findings.md`. Engine bugs
found but not blocking are recorded as findings for the opus lane.

**Claude owns (edit + commit, in its clone only):** `js/lab-*.js`,
`fixtures/run-analyzer.mjs`, `tools/lab-*.mjs`, `tests/` engine steps. Canon
surfaces, site pages, overlay, and index are READ-ONLY for Claude even inside
the clone — doctrine gaps it finds become PROPOSALS, never direct edits. In
the REAL checkout Claude touches nothing except creating/appending NEW
`md/pt09/opus-*` files and appending to `md/pt09/CLAIMS.md`.

## Cross-feed while both run

- **Claude → Codex:** doctrine proposals to the encompassing standard, appended
  to `md/pt09/opus-proposals.md` (real tree, opus-prefixed, append-only). Codex
  sweeps it at every integration and folds what clears the bar.
- **Codex → Claude:** ordinary commits on the real tree's `main`. Claude runs
  `git fetch origin && git rebase origin/main` in its clone roughly hourly and
  always before close.
- **Ledger:** `md/pt09/CLAIMS.md`, append-only, both agents, UTF-8. Re-read the
  file immediately before appending. One line per input:
  `- [agent] [lane] [source-or-attack] [status]`.
- **NEVER `git push` from the clone.** The clone's `origin` is the live
  checkout; ferry is by format-patch only. And in the real tree, no push to
  GitHub without Jason's in-session confirmation — that rule survives the
  delegation above.

## Codex cycle (~25–35 min; integrate every 2–3 cycles)

1. Claim an input in the ledger. Fetch raw HTML to a temp dir OUTSIDE the repo
   (third-party text is never committed). Extract with
   `tools/extract-source-text.mjs`, record the SHA-256, drop promo/
   recirculation furniture (`--drop`/`--cut`).
2. `node fixtures/run-analyzer.mjs --source <txt> --out <temp>/<slug>.json`,
   recording the canon version from the summary line per capture.
3. Judge like a reviewer: covered / gap / instrument finding / correctly
   unmapped. Log in `md/pt09/codex-findings.md` (URL, words, SHA-256, canon
   version, mapped %, verdict).
4. Integration (full pt04 procedure): baseline `--dump` FIRST; entries +
   overlay + rebuilt index + moved pins in ONE commit, suite green; sweep
   `--baseline --neighbors` onto the EXISTING
   `tests/fixtures/threshold-neighbors.json` (indent-2 JSON); rule EVERY weak
   crossing per the delegation above; probe misreadings fire Contradicts
   end-to-end; check analyzer-demo pins after any alias change — fix the
   authored surface, never the pin; magnet-check new aliases against the
   corpus; then the `generatedAt` stamp commit.

**Content targets** (gap-driven, not quota-driven): statistics (Tier 1/2/3
sourced — never intuitions), frameworks (rules-not-laws, reality-check tags,
cross-cite both ways), lexicon terms, mythbuster entries (schema + stake-ledger
truth ints + CALIBRATION = market share), pill expansions. Placement: Pills =
worldviews, Frameworks = models, Statistics = numbers. Deep dives: PROPOSE with
an outline unless a gap unmistakably merits a full essay; Essays cannot host
Framework components (pt08). Misreadings obey the authoring contract: 10–18
words, one sentence, no negators, an explicit relational-frame word, none of
the morphology traps (`married/marries/chosen/dates`). "No doctrine needed" is
a valid, valued verdict.

## Claude cycle (adversarial & engine)

1. Pick an attack surface; claim it in the ledger (a crafted-input family
   counts as one claim line). Craft or collect inputs; run the analyzer
   headless in the clone.
2. When output is wrong: minimal repro first, then RED — a failing test
   committed (or staged) before the fix — then the fix, suite green in the
   clone, commit with the surface + repro in the message.
3. Log every finding in the clone as you go; fold into
   `md/pt09/opus-findings.md` (real tree) at close.

**Attack map** (starting points, not fences): tokenizer — unicode, CRLF vs LF,
zero-width chars, RTL, emoji, NBSP; intake normalization edges; gate morphology
inflections (the `marry\w*`/"date" class — pt08's bug had siblings); stance-cue
clause scoping (v2.6.20 is days old — probe it hard); misreading firing
contract edges; negation, sarcasm, quoted speech, reported claims ("she said
that…"); long and degenerate inputs (10k-word pastes, single-word, repeated
text, lists, markdown/HTML fragments); register shifts (academic vs forum vs
therapy-speak); injection-shaped text (the Lab must READ it, not obey it).
Known refusal-pinned: hyphenated-compound unreachability — do not re-litigate
the pin.

**Engine-fix rules:** floors are hard (domainRecall ≥ 0.9 · ignorePrecision ≥
0.95 · junkRecall ≥ 0.75 ratchet · knownSplits ≤ 1 · WEAK_BACKLOG_CEILING = 0);
frozen benchmark fixtures and assertion values are never edited to green a
test; a fix that needs a floor loosened does not ship — record it as a finding.
If a fix moves corpus scores: copy `lab-corpus/` into the clone (COPY —
robocopy/cp — NEVER a junction, never committed), sweep in the clone, self-rule
per the delegation with `opus-pt09` attribution; rulings ride the patch series.
Version numbers: real-tree `v2.6.x` numbers are Codex's to claim; Claude's
commits say `v2.6.x-opus-ptNN` placeholders — final numbers assigned at
integration.

## Close (both agents, begin at T-30 min)

- **Codex:** ledger QA (every claim line has a terminal status), close-out
  section in `md/pt09/codex-findings.md` (entries shipped, rulings entered with
  counts, instrument findings, what was deliberately NOT implemented), suite
  green, final stamp commit. The pt09 run record and INDEX row wait for
  integration — do not write them.
- **Claude:** fetch + rebase onto `origin/main`, suite green in the clone,
  `git format-patch origin/main..HEAD -o <real-tree>/md/pt09/opus-patches/`,
  then write `md/pt09/opus-findings.md`: one row per finding — surface, repro,
  RED test, fix commit, floor impact, rulings entered.
- **Integration (post-run, separate session with Jason):** apply the patch
  series, reconcile version numbers, rerun suite + sweep on the merged result,
  review pt09 self-rulings, fold `md/pt09/` into `md/pressure-tests.md` +
  INDEX row + mission-notes ledger row, delete-with-pointer.

## Standing constraints (both agents)

The real tree stays on `main` — never detach, never branch, **never
`git worktree`** (the clone is a clone, not a worktree). Never reword a site
page so the matcher scores better — authored overlay surfaces only.
`lab-corpus/` text is never committed and never junctioned. Before every
commit: `git rev-parse --abbrev-ref HEAD` + `git status --porcelain`; stage
ONLY your lane's paths; read the full staged diff (`--cached`, hunks); commit
from the index with NO pathspec; compare the commit `--stat` to the staged
`--stat` — Jason and the other agent may have files sitting in the tree.
Evidence bulk lives in `md/pt09/` only for the run's duration.
