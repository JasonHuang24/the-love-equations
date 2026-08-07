# Pressure test 08 — parallel run protocol (Claude + ChatGPT/Codex)

**Status:** READY for a 3-hour run (2026-08-07). Both agents work THIS
checkout on `main`, concurrently, in FRESH sessions. This file is the
collision contract. The method is `md/doctrine-pressure-test-04.md` as
executed three-handed in pt05–pt07 (`md/doctrine-pressure-test-05.md`,
`-06.md`, `-07.md`); the working agreements in `CLAUDE.md` bind both agents.
Kickoff prompts: `md/pt08/KICKOFF.md`. Integrator model this run: **Claude
Opus 5 at high effort** (as in pt07 — the judgment work, verdicts,
encompassing calls, crossing rulings, is where effort belongs).

Canon at run start: **571 entries**, index `1.0.0+54d018bff967`, tree clean at
`f5ea75b`.

## Roles — the one rule that prevents every serious collision

- **Claude = integrator (maintainer lane).** SOLE writer of canon surfaces and
  SOLE committer: site pages, `data/canon-overlay.json`,
  `data/le-canon-index.json`, `tests/**`, every sweep/adjudication artifact.
  Only Claude rebuilds the index, dumps baselines, regenerates the band, or
  enters rulings.
- **ChatGPT/Codex = scout & drafter.** Read-only against the repo except:
  appending to `md/pt08/CLAIMS.md`, and creating NEW files only under
  `md/pt08/` with a `chatgpt-` prefix. No mutating git commands; never touches
  `lab-corpus/`.

Both agents may run `npm run test:lab` and the headless analyzer freely.
**Read the suite's exit code, never grep its output.**

## Claim ledger — `md/pt08/CLAIMS.md`

Before fetching, append one line: `- [agent] [lane] [URL] [status]`. Re-read
the file immediately before appending; if claimed, pick another. Statuses:
`claimed → analyzed → verdict(covered|gap|instrument|novel)`, plus
`abandoned(reason)` for dead fetches. **Write the file as UTF-8.**

## Lanes (pre-partitioned; a lane list is a default, not a fence)

Every lane below was picked because a probe of `data/le-canon-index.json`
found it thin or empty. The probe counts are recorded so a "covered" verdict
can be judged against what was expected.

ChatGPT: **A** AI companions and synthetic intimacy (chatbot partners,
Replika/Character-style discourse — `chatbot`/`AI companion` are **0** in the
index because pt07's hookup pass REMOVED the "AI companion" alias as a topic
magnet and reopened the C2 gap honestly, see
`md/lab-hookup-transaction-layer.md`; this lane is that reopened gap, and any
proposed alias here must be magnet-checked hard) · **B** consensual
non-monogamy as a relationship STRUCTURE (`polyam` 1, `open relationship` 0 —
structure negotiation, not sexual behaviour) · **C** workplace, campus and
institutional romance rules (`colleague` 0, `workplace` 3 — HR policy, bans,
the workplace's exit as a meeting channel; the Meeting Channel entry owns
channel SHIFT, the probe here is institutional PROHIBITION) · **D**
third-party reproduction and solo parenthood by choice (donor conception,
IVF, single-mothers-by-choice; `sperm`/`donor`/`IVF` all 0 — note pt05 ruled
egg freezing **correctly unmapped**, so clearing that bar takes a mechanism,
not a topic).

Claude: **E** appearance intervention as a market lever (GLP-1/Ozempic,
cosmetic procedures, looksmaxxing as deliberate strategy — `ozempic` 0,
`cosmetic` 2; the site owns *having* looks, the probe is *buying* them) ·
**F** housing, rent burden and the material floor under pairing
(`cost of living` 0, `housing` 2 — moving in to afford rent, living with
parents, the lease as a commitment device) · **G** illness, disability and
caregiving inside pairing (`disabilit` 0, `chronic illness` 0, `caregiv` 1) ·
**H** loneliness and the friendship recession as a dating input
(`lonelin` 0; `male friend` 8 — the support-portfolio entry from pt05 exists,
find what the discourse says that it does not own).

Skip anything covered by the corpus or pt02–pt07: check
`lab-corpus.manifest.json` and the ledgers in `md/doctrine-media-loop-03.md`,
`md/doctrine-retention-media-02.md`, and
`md/doctrine-pressure-test-04/05/06/07.md`.

## Cycle (both agents, ~15–20 min each; integrator integrates every 2–3 cycles)

1. Claim in the ledger. Fetch raw HTML to your own temp dir (NOT the repo).
   Extract with `tools/extract-source-text.mjs`; record the SHA-256. Drop
   promo/recirculation furniture (`--drop`/`--cut`): known offenders are The
   Conversation's "Read more:" cards, IFS's inline "Post This" tokens,
   Psychology Today's pathways widget (it renders TWICE — drop both), and
   author-bio lines. **Cloudflare bot-walls block Fast Company and Axios**;
   pt07 also lost Ofcom, the FBI and Oxford Academic to bot walls — have a
   fallback outlet per lane before you burn a claim.
2. `node fixtures/run-analyzer.mjs --source <txt> --out <temp>/<slug>.json`.
   **Record the canon version from the summary line with every capture** —
   mapped % is per-capture, not a fixed-baseline benchmark.
3. Read the output like a reviewer: mapped rows right? unmapped claims a gap
   or correctly novel? gate binning anything it shouldn't? false positives?
   tensions inheriting a wrong nearest match?
4. Record in your findings file (`md/pt08/chatgpt-findings.md` /
   `md/pt08/claude-findings.md`): URL, words, SHA-256, canon version,
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

Full pt04 procedure as executed in pt05–pt07: baseline `--dump` FIRST;
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

Five lessons carried forward from pt05–pt07, all with teeth:

- **Misreading and boundary text is live match surface.** Any edit to overlay
  misreadings/boundaries/aliases is a scoring change: re-sweep and rule what
  moved.
- **When a demo pin trips, fix the authored surface, never the pin.** pt06's
  Border Bundle sub-note collided with the volcanic-ash probe's "A new claim
  says…" template; pt07 tripped the analyzer demo-routing pin once. Avoid
  "says" and "new" in authored prose near probe vocabulary. `--rule` remains
  FORBIDDEN in any form.
- **Short-unit token pairs are a credible-line hazard,** and pt07 saw this
  fire THREE separate times. An 8-token corpus sentence hit 0.608 on two
  entries at once because both carried the romantic+partner token pair. Before
  shipping, grep the corpus for short sentences sharing 2+ content tokens with
  any new alias/misreading; if one entry needs a token pair, make sure only
  ONE of the pair appears across that entry's other surfaces.
- **The common-bigram magnet is a defect CLASS, not an incident** (pt07 §
  instrument findings): any canon title or alias that is an ordinary English
  bigram (`the wall`, `sexual desire`) collects every sentence containing it
  at one flat score, and it DISPLACES the correct match. Magnet-check every
  proposed multi-word alias against `lab-corpus/` before authoring, and treat
  a flat identical score across many rows as the signature.
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
writes the run record (`md/doctrine-pressure-test-08.md` + `md/INDEX.md` rows
+ mission-notes ledger row) and folds the scout's closed findings file only
after its closeout.
