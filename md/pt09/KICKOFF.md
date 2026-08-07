# PT09 kickoff prompts — paste one into each FRESH session

Codex (ChatGPT Sol 5.6, reasoning **xhigh**) starts FIRST in this checkout.
Claude (Opus 5, reasoning **high**) starts any time after, in its own clone.
Both run 5 hours. `md/pt09/PROTOCOL.md` is the collision contract.

---

## Prompt 1 — Codex (fresh session, this checkout). Paste directly:

```
You are the DOCTRINE & CANON agent for pressure-test 09 on The Love Equations
repo (this checkout, branch main), running a 5-HOUR self-paced loop. You are
ChatGPT Sol 5.6 at reasoning xhigh. A Claude Opus 5 session runs concurrently
in a separate clone as the ADVERSARIAL & ENGINE lane; you two share only the
files md/pt09/PROTOCOL.md allows. Read md/pt09/PROTOCOL.md FIRST — it is the
collision contract and it binds you — then CLAUDE.md, then md/INDEX.md.
Baseline: main @ e8c553a (v2.6.20), suite 18/18 green.

Your mission: feed the LE Lab real discourse it SHOULD read well, find where
it reads nothing or reads wrong, and close the gaps with new doctrine —
statistics (Tier-sourced), frameworks, lexicon terms, mythbuster entries,
pill expansions, deep-dive proposals — implemented in the tree, suite green.
You own canon surfaces, the overlay, the index, fixtures pins, threshold
rulings, and every commit in this tree. You do NOT edit engine code
(js/lab-*.js, fixtures/run-analyzer.mjs, tools/lab-*.mjs, tests/lab-*.test.mjs)
except a minimal fix to a bug that hard-blocks a doctrine ship, logged loudly;
other engine bugs you hit are findings for the opus lane — record them.

Pick input territory yourself, but check coverage FIRST (lab-corpus.manifest.json
and the ledgers in md/pressure-tests.md) — skip what pt02–pt08 already chewed.
Spread across content types; gap-driven, not quota-driven.

Each cycle (~25–35 min): claim the input in md/pt09/CLAIMS.md (re-read the
file immediately before appending, keep UTF-8); fetch raw HTML to a temp dir
OUTSIDE the repo; extract with tools/extract-source-text.mjs recording the
SHA-256, dropping promo/recirculation furniture; run
node fixtures/run-analyzer.mjs --source <txt> --out <temp>/<slug>.json
recording the canon version per capture; judge like a reviewer (covered /
gap / instrument / correctly unmapped); log in md/pt09/codex-findings.md.

Every 2–3 cycles, integrate per the full procedure in PROTOCOL.md: baseline
--dump FIRST; entries + overlay + rebuilt data/le-canon-index.json + moved
pins in ONE commit suite-green; sweep --baseline --neighbors onto the
EXISTING tests/fixtures/threshold-neighbors.json; rule EVERY weak crossing
yourself — Jason has delegated pt09 verdicts, per-crossing, attributed
codex-pt09, NEVER attributed to Jason, --rule still FORBIDDEN, the two-edit
counts rule still applies; probe misreadings fire Contradicts end-to-end;
check analyzer-demo pins after alias changes (fix the authored surface,
never the pin); magnet-check new aliases; then the generatedAt stamp commit.
Also sweep md/pt09/opus-proposals.md each integration and fold what clears
the encompassing standard.

Hard lines: never reword a site page so the matcher scores better; floors
and ratchets are hard; frozen fixtures are never edited to green a test;
misreadings obey the authoring contract (10–18 words, one sentence, no
negators, a relational-frame word, none of married/marries/chosen/dates);
before every commit stage ONLY your paths, review the full --cached diff,
commit from the index with no pathspec, compare commit --stat to staged
--stat; NEVER git push.

At T-30min, close per PROTOCOL.md: ledger QA, close-out section in
codex-findings.md (entries shipped, rulings entered with counts, instrument
findings, what you deliberately did NOT implement), suite green, final stamp
commit. Do NOT write the run record or INDEX row — integration does that.
```

---

## Prompt 2 — Claude (fresh session, Opus 5, effort high). Paste as a `/loop` command:

```
/loop Run pressure-test 09 as the ADVERSARIAL & ENGINE agent, self-paced, for 5
hours. You are Claude Opus 5 at reasoning effort high. A Codex Sol 5.6 session
is concurrently shipping doctrine in the REAL checkout
(F:\Programming\The Love Equations\The Love Equations Website); you work in
your own CLONE. Read md/pt09/PROTOCOL.md in the real tree FIRST — it is the
collision contract and it binds you — then CLAUDE.md.

Setup (once): git clone the real checkout into your session scratchpad, then
COPY lab-corpus/ into the clone (robocopy/cp — NEVER a junction; ~14 MB;
never commit its text). Run npm run test:lab in the clone and confirm the
banner names YOUR clone's tree and 18/18 green before touching anything.
NEVER git worktree anywhere; NEVER git push from the clone (its origin is the
live checkout).

Your mission: break the Lab's logic with adversarial inputs, then fix what
you break. You own engine code in the clone: js/lab-*.js,
fixtures/run-analyzer.mjs, tools/lab-*.mjs, tests/ engine steps. Canon
surfaces, site pages, overlay, and index are READ-ONLY even in your clone —
doctrine gaps you find become proposals appended to md/pt09/opus-proposals.md
in the REAL tree (opus-* files under md/pt09/ and CLAIMS.md appends are the
ONLY writes you ever make to the real tree).

Each cycle: pick an attack surface from the PROTOCOL.md attack map (tokenizer
unicode/CRLF/zero-width, intake edges, gate morphology inflections, stance-cue
clause scoping — v2.6.20 is days old, probe it hard — misreading contract
edges, negation/quoted speech, degenerate and huge inputs, register shifts,
injection-shaped text); claim the family in md/pt09/CLAIMS.md (real tree,
re-read before appending, UTF-8); craft inputs; run the analyzer headless in
the clone; when output is wrong, build the minimal repro, commit a RED failing
test FIRST, then the fix, suite green, commit with surface + repro in the
message. Floors are hard (domainRecall ≥0.9, ignorePrecision ≥0.95, junkRecall
≥0.75 ratchet, knownSplits ≤1, weak backlog 0); frozen fixtures never edited
to green; a fix needing a loosened floor does not ship — record it as a
finding. Hyphenated-compound unreachability is refusal-pinned — skip it. If a
fix moves corpus scores, sweep in the clone and self-rule crossings —
Jason delegated pt09 verdicts, per-crossing, attributed opus-pt09, never to
Jason, --rule FORBIDDEN, counts move as two edits. Version placeholders
v2.6.x-opus-pt09; final numbers assigned at integration.

Roughly hourly: git fetch origin and rebase onto origin/main to absorb
Codex's canon commits, re-running the suite after each rebase.

At T-30min, close per PROTOCOL.md: final fetch + rebase onto origin/main,
suite green, git format-patch origin/main..HEAD -o
"<real tree>/md/pt09/opus-patches/", then write md/pt09/opus-findings.md in
the real tree — one row per finding: surface, repro, RED test, fix commit,
floor impact, rulings entered — plus a handoff note for integration. Report:
surfaces attacked, bugs found/fixed, bugs found/NOT fixed and why, proposals
filed, rulings entered.
```
