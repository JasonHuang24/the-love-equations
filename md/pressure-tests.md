# Pressure tests — the pt series, closed runs 04-08

A volume of the record shelf (`md/INDEX.md` is the table of contents). Run records and the
per-run working files (protocols, claim ledgers, kickoffs, findings), folded after pt08 closed
on 2026-08-07. A future run gets its own `md/ptNN/` working dir, folded here at ITS close.
The two threshold-adjudication sheets stay standalone while their INDEX status is LIVE, and fold
here when it leaves LIVE. Sections are byte-exact merges; the pre-merge file for each is at the
`git show` pointer on its section header.


---

# doctrine-pressure-test-04.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/doctrine-pressure-test-04.md`

# Doctrine pressure test 04 — five-article cycle

**Run date:** 2026-08-06
**Status:** Implemented and verified; commit pending push confirmation
**Lane:** Pressure test → gap triage → doctrine implementation → adjudication (maintainer lane, Fable, high effort)

## 1. Run design

Five fresh articles — none in the corpus, none from the two prior media loops — chosen to
mix one control on covered ground with four probes at suspected doctrine gaps. Each was
fetched raw, extracted with `tools/extract-source-text.mjs`, and run through the shipped
analyzer headlessly (`fixtures/run-analyzer.mjs`), before and after the doctrine change.
Raw source text was not committed; the SHA-256 below identifies the exact analyzed bytes.
The pre-change instrument was verified first: suite 18/18 at `fdc9b5a`, canon rebuild
byte-identical, threshold fixture at 0 pending on both verdict lines.

## 2. Source ledger

| # | Article | Role | Words | Before | After | SHA-256 |
|--:|---|---|--:|--:|--:|---|
| 1 | [Deseret — Dating app fatigue: A Gen Z diagnosis](https://www.deseret.com/lifestyle/2025/07/01/gen-z-still-swiping/) | control | 1,704 | 12.8% | 15.4% | `e49666586528f78ef0bd74a2b81e8477aadb534924ef70163810b21755cb06d5` |
| 2 | [Refinery29 — What Are The Problems With Attachment Theory?](https://www.refinery29.com/en-gb/2022/06/10771935/attachment-theory-problems) | gap probe | 3,307 | 2.7% | **46.6%** · 6 tensions | `15dd7f89f5e5e0a88f62632934e872054030740aacdf181b020ef9df1c27c529` |
| 3 | [AEI — The Ideological Filter in Gen Z Dating](https://www.aei.org/society-and-culture/the-ideological-filter-in-gen-z-dating/) | gap probe | 775 | 32.1% | 39.3% · 1 tension | `69f51357f6e1d78377c9544539e289d43efad10d1441fb0d6831fa38b1322aa7` |
| 4 | [Katie Couric Media — How Therapy Speak Is Ruining Our Relationships](https://katiecouric.com/health/mental-health/therapy-speak-ruining-our-relationships/) | gap probe | 1,237 | 0% | 11.1% · 1 tension | `574eb0bb9c7746eaaf34c889a6cd9c9f81826b2ec26422c40fbad321bed1aedc` |
| 5 | [Global Comment — Age gap discourse and the power of fake outrage](https://globalcomment.com/age-gap-discourse-and-the-power-of-fake-outrage/) | gap probe | 862 | 11.1% | 11.1% | `f02ea46c58abfbd187393dd7e1f7898eed39e3e0712588ed12eb09d0470c1a13` |

Mapped-share is `mappedClaimSegments / claimLikeSegments` from the analyzer's own summary
line. "Before" is canon `1.0.0+3b3901828bc0` (556 concepts); "after" is `1.0.0+ac89d0f96ca5`
(559).

## 3. What the pressure test found

**On covered ground the engine reads sensibly.** The control article's swipe-fatigue
claims reached `search-cost` (whose aliases already carry "swipe fatigue"), and its one
High-confidence match ("dating in Utah feels like a game") was a defensible Resembles.
The instrument was not the problem where the canon had an answer.

**Three encompassing gaps, all confirmed by zero-candidate unmapped rows:**

1. **The channel.** The control's core story — users leaving the platforms, rerouting to
   in-person and social channels — had no home: the site priced the people and the search,
   never where the search happens.
2. **The ideological filter.** The AEI piece's mechanism — politics as the first screen,
   applied asymmetrically by sex and ideology — mapped only through generic trait entries
   (emotional stability, assets). The filter itself was dark.
3. **The diagnostic turn.** Attachment-style discourse and therapy-speak were a near-total
   blackout: 82 claim-like units across the two articles, ~2 mapped, none to anything on
   topic. The two articles share one mechanism — pop-clinical labels as relationship
   instruments — so they were merged into one entry rather than two.

**One deliberate non-implementation.** The age-gap essay's subject is already owned by
the wall band structure and the remarriage-gap chart; the essay itself is a fake-outrage
media critique. No doctrine was authored, and its number did not move. That is recorded
as the correct outcome, not a miss.

## 4. Implemented surfaces

Three sub-entries on `frameworks.html`, each with a `.lab-stamp` chip, aliases,
contract-compliant misreadings (9/9 fire Contradicts, probed end-to-end), boundaries and
pressure tests in `data/canon-overlay.json`:

- **15.1 The Meeting Channel** (under the Search Cost) — the Rosenfeld/HCMST migration
  (39% met online 2017 vs 22% 2009, friends disintermediated ~2013), the Ofcom 2024
  marginal-decline reversal signal (−594k/−368k/−131k UK reach, total roughly flat), and
  the screening-order model of channels (apps read looks first; friends read context;
  repeated-game channels read conduct) stated as an LE Lens with its falsifier.
- **34.2 The Ideological Filter** (under the Effective Sex Ratio) — the Gallup 15-point
  identification gap (not the discourse's 30), the IFS/YouGov filter rates
  (60% / 47% / 36% / 37% by quadrant), the pool-deletion arithmetic as an LE Lens, and
  the same survey's convergence findings as the entry's own pressure test.
- **38.1 The Diagnostic Turn** (under the Virality Filter) — attachment theory's pop
  dominance vs its modest evidence base (Fraley 2002, r ≈ .27 model-dependent),
  diagnosis-at-a-distance and its blame direction, and therapy-speak's boundary grammar
  test ("I will" vs "you can't"), with Finkel's suffocation model as the interdependence
  counterweight.

Canon 556 → 559; misreading coverage 559/559; boundary coverage 523 → 526; pins moved in
`tests/canon-index-fixtures.mjs` including a refusal pin (below).

## 5. Adjudication

Sheet: `md/lab-pressure-test-04-threshold-adjudication.md` (snapshot; the fixture is the
source of truth). Baseline `fdc9b5a`, final canon `ac89d0f96ca5`. All rulings entered by
Claude, 2026-08-06 — **the credible-line rulings are Claude's recommendations adopted
into the fixture and are flagged for Jason's review before push.**

- **minCredibleScore: 19 ruled — 5 ACCEPT / 9 REJECT on gains, 5 losses ACCEPT.**
  Accepted gains are the ideological-filter × IFS rows (the entry's subject stated by its
  own primary source) and one diagnostic-turn row that states the entry's evidence-base
  claim citing the entry's own source. Rejected gains are one mechanism: academic prose
  *using* attachment/homogamy vocabulary without engaging the entry's claim, plus one
  methods-boilerplate row. The five losses are prior junk-ish borderline matches pushed
  under the line by IDF dilution from canon growth — precision gains, though the dilution
  was this change's doing.
- **minWeakScore: 361 ruled — 42 ACCEPT / 319 REJECT** across two regens. Standard used:
  weak = "genuinely related nearby concept"; junk rows (tables, legends, keyword lists,
  reference titles) and vocabulary coincidences rejected; all existing-entry losses were
  coincidental borderline pairs and were accepted as correct prunings.
- **candidateScoreFloor: census lane, 11,365 recorded, not adjudicable per
  `md/lab-adjudication-at-scale.md`.**

**A topic magnet was caught and removed before it shipped.** First-draft aliases
`anxious attachment` / `avoidant attachment` captured ~40 flat-0.540 credible matches in
one academic source (van Lankveld uses those exact phrases 55 times) — the same signature
as the "AI companion" magnet in the hookup arc. Removed; the discourse article still
reaches the entry through `attachment theory` (28 occurrences) and `attachment style`
(11). Credible pendings fell 52 → 19 before any ruling was needed.

**The demo's planted bait caught a bad alias.** `met online` mapped the demo's
"82 percent of couples who met online said shared music taste…" bait as Supports and
consumed the research residue `lab-analyzer.test.mjs` protects — the population-descriptor
failure shape, verbatim. Removed; the demo pins returned to their committed values
untouched.

## 6. Instrument findings (recorded, not fixed here)

1. **Hyphenated compounds are structurally unreachable by authored surfaces.**
   `normalizeText` keeps hyphens while `tokenize` splits them, so text "therapy-speak"
   can be matched by neither the alias "therapy speak" (space can't match hyphen) nor a
   hyphenated phrase (dead single token). Pinned as a refusal in
   `tests/canon-index-fixtures.mjs`; the fix is an engine change for a future RED-first
   pass, not an authoring workaround.
2. **The domain gate bins therapy-register vignette prose.** 103 of 112 passages of the
   therapy-speak article fall to `no-human-relational-frame` — case vignettes about
   parents, therapists and teenage children. Partly correct (the site's domain is the
   dating market), partly a register limitation already named in loop-03's findings.
   The article's thesis and gaslighting-vignette claims that do survive the gate now map.
3. **One displayed false positive on covered ground, for the record:** the age-gap
   sentence "dating someone older than you by as little as five years…" reaches
   `smv:looks:face` at 0.472/Low. Same face/age adjacency the tranche work measured;
   cost of an existing surface, not of this change.
4. **The sweep's `--md` without `--neighbors` renders every crossing as outstanding**
   because the ruling lookup only loads when the fixture is read; harmless but confusing.

## 7. Verification

- `npm run test:lab`: 18/18 (exit 0) on the final tree; domain-benchmark floors,
  frozen benchmarks and gate registers untouched.
- Threshold fixture: 0 pending at both verdict lines; census lane recorded.
- 9/9 authored misreadings fire Contradicts end-to-end (probe-contract compliant:
  embedded, declarative, single-clause). Two first drafts failed the gate for lacking a
  relational-frame word and were rewritten — the contract's rule 1, measured again.
- Browser check on :8753: all three entries render with titles, stamps, and TOC rows
  15.1 / 34.2 / 38.1; no console errors.
- The overlay phrase edit for the gaslighting surface was proven free against the
  archive: 0 changed of 1,356,134 pairs.


---

# doctrine-pressure-test-05.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/doctrine-pressure-test-05.md`

# Doctrine pressure test 05 — parallel Claude + ChatGPT run

**Run date:** 2026-08-06, 08:04–09:15 MDT
**Status:** Implemented and verified; commits pending push confirmation (note: the
protocol commit `78a3a67` and everything after it are local-only)
**Lane:** Parallel pressure test under `md/pt05/PROTOCOL.md` — Claude as
integrator/sole committer (Fable, high effort), ChatGPT/Codex as scout/drafter.
Method: `md/doctrine-pressure-test-04.md`, run two-handed.

## 1. Run design

Two agents worked this checkout concurrently for a bit over an hour: ChatGPT in
lanes A–D (jealousy, cohabitation/marriage, marriage economics, loneliness
spillover), Claude in lanes E–H (exit conduct, app monetization, LAT, fertility
timing), coordinating through the append-only claim ledger `md/pt05/CLAIMS.md`.
Claim collisions observed: zero. ChatGPT analyzed 19 articles (final closeout
tally: 5 gap, 3 covered, 3 correctly unmapped, 8 instrument finding, plus one
403-blocked fetch) and filed two doctrine proposals; Claude analyzed 4, ran
both integrations, ruled every crossing, and made all commits. Raw source
text stayed out of the repo; SHA-256s of analyzed bytes are in the two
findings files.

## 2. Claude's source ledger (full detail in `md/pt05/claude-findings.md`)

| # | Lane | Article | Words | Before | After | Verdict |
|--:|---|---|--:|--:|--:|---|
| 1 | E | The Conversation — Ghosting and 'breadcrumbing' | 922 | 7.7% | 15.4% | gap → **17.1** |
| 2 | F | Groundwork — Love Behind the Paywall | 621 | 23.5% | **58.8%** | gap → **15.2** |
| 3 | G | The Conversation — Why more couples choose to live apart | 928 | 38.9% | 38.9% | covered (control) |
| 4 | H | Public Discourse — Egg freezing's false promises | 1,700 | 0% | 0% | correctly unmapped |

ChatGPT's 19-article ledger (`md/pt05/chatgpt-findings.md`, committed at its
closeout) contributed the two folded proposals plus the run's richest
instrument-finding set: page furniture outranking article content, the domain
gate marking explicit partner/marriage claims uncertain, retrieval collapsing
roles and stages (friends-first formation vs friend-zone vs partner-as-best-
friend; consensual non-monogamy vs an imposed rival), tensions inheriting
wrong nearest matches, and numeral/DOI magnets. Its provenance caveat stands:
the canon changed under the parallel run (four versions), so cross-cycle
mapped percentages in its ledger are per-capture, not a fixed-baseline
benchmark.

## 3. Implemented surfaces (canon 559 → 563, two integrations)

Four sub-entries on `frameworks.html`, each with a `.lab-stamp` chip, overlay
aliases/phrases/boundaries/misreadings, and moved pins:

- **4.1 The Marriage Bar** (under the Readiness Gate) — from ChatGPT's
  proposal: wanting marriage and being economically ready for it are separate
  states (Pew 2019: 29%/27% financial-unreadiness as major reason, verified at
  source), the bar as milestone standard (Smock 2005), prospective SIPP
  transitions (Ishizuka 2018), and the fracking-boom boundary against
  income-only stories (Kearney & Wilson 2018).
- **15.2 The Market-Maker's Cut** (under the Search Cost) — the venue is paid
  by the search, not the match: duopoly + subscription revenue, Groundwork
  2026 paywalled-scarcity documentation (advocacy-bounded Tier 3), measured
  age-based price discrimination (Choice 2020, Candelore v. Tinder), incentive
  geometry as a Lens with the churn counterweight and a per-success-venue
  falsifier. The 78%-exhausted opt-in stat excluded per 15.1's standing refusal.
- **17.1 The Costless Exit** (under the Third-Party Layer) — ghosting and
  breadcrumbing as one price mechanism (exit without notice / retention
  without intent): prevalence (Freedman 2019: 25.3%/21.3%; Navarro 2020:
  ~20%/~30%), the damage localization the discourse inverts (breadcrumbing,
  not ghosting, predicts lower life satisfaction and more loneliness), destiny
  beliefs predicting acceptability, and the shared-network falsifier.
- **17.2 The Support Portfolio** (under the Third-Party Layer) — from
  ChatGPT's proposal: support as a portfolio across partner/friends/family/
  community; the measured sex gap is in the friend channel (ASC 41%/21%,
  verified verbatim in-corpus) not the partner channel (Pew 2025 parity,
  verified in-corpus); mankeeping as the named gendered instance held at its
  measured size (Ferrara & Vergara 2024 theory; Mancini 2026 scale — Tier 2
  structure, Tier 3 consequences).

## 4. Adjudication (sheet: `md/lab-pressure-test-05-threshold-adjudication.md`)

Two full pt04 cycles: baseline `--dump` before each integration, sweeps onto
the existing fixture, **463 crossings ruled** (12 credible · 451 weak), all
entered by Claude — **credible-line rulings are recommendations FLAGGED FOR
JASON's review before push.** Both verdict lines at 0 pending; census lane
14,354 recorded. 12/12 misreadings fire Contradicts end-to-end (0.74–0.80).
No magnet signature on any new alias; the one surface that over-reached — a
first-draft boundary whose tokens pushed a demo sentence over the credible
line — was reworded (authored-surface remedy) and both demo pins returned to
their committed values.

## 5. Deliberately NOT implemented

- **Fertility-timing doctrine.** The egg-freezing essay's subject is owned by
  the Clock, the fertility-age chart, and the Wall bands; the essay itself is
  workplace-policy critique the domain gate correctly set aside (77 of 83
  passages). The pt04 age-gap outcome, repeated.
- **A "buying time on the Clock" sub-entry** — candidate only if lane H
  surfaces the partnerlessness-delay claim (Inhorn) from an in-domain article.
- **LAT motivation taxonomy** (constraint-LAT vs preference-LAT) — detail
  under the encompassing standard; the LAT term entry already absorbs the
  subject at Medium.
- **ChatGPT's instrument-lane findings** (retrieval miss on jealousy;
  gate set-asides on relational-harm passages) — engine work for a future
  RED-first pass, not authoring workarounds.

## 6. Instrument findings (recorded, not fixed here)

1. **Misreading text is live match surface.** Rewriting two tokens in a
   misreading moved 5 weak corpus crossings — an edit to authored misreadings
   is a scoring change and gets the full sweep treatment.
2. **False positives migrate under IDF drift rather than dying:** "one in ten
   met their match online" moved from `stat-child-marriage` (0.453) to
   `stat-cohab-timing` (0.454) across the canon growth. Same face/age-class
   adjacency the tranche work priced.
3. **+0.001 IDF drift nearly handed `stat-pay-to-play`'s own 41%-vs-29% stat
   to `M-TBD-45` at the credible line** — rejected as wrong-owner; worth
   watching as the canon keeps growing.
4. **The Conversation's embedded "Read more:" promo links** survive extraction
   as claim-like units and deflate mappedShare; an extraction-layer `--drop`
   would fix it.

## 7. Verification

- `npm run test:lab`: 18/18 (exit 0) on the final stamped tree (`5666b97`);
  floors, ratchets, frozen benchmarks untouched; no test value moved in
  either integration (one corpus pin was provisionally moved, then reverted
  when the boundary reword restored the committed value).
- Browser check (file preview): all four entries render with titles, stamps,
  and TOC rows 4.1 / 15.2 / 17.1 / 17.2; zero console errors.
- Commits: `9964610` (integration 1) · `d936d9d` (stamp) · `b85ed25`
  (integration 2) · `5666b97` (stamp) — all local, **no push without Jason**.

## 8. Addendum — scout artifacts tidied (2026-08-07)

The three scout files were deleted from the working tree in the repo cleanup
sweep (the pt07 §7 pattern), their content folded here and into the shipped
entries. All three were committed first and are recoverable in full:

```
git show 9962100:md/pt05/chatgpt-findings.md
git show adebdb3:md/pt05/chatgpt-proposal-marriage-bar.md
git show adebdb3:md/pt05/chatgpt-proposal-support-portfolio.md
```


---

# pt05/PROTOCOL.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt05/PROTOCOL.md`

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


---

# pt05/CLAIMS.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt05/CLAIMS.md`

# PT05 claims ledger

Append-only. One line per article: `- [agent] [lane] [URL] [status]`.
Re-read this file immediately before appending. Statuses: claimed → analyzed → verdict(covered|gap|instrument|novel).

- [chatgpt] [A] [https://www.psychologytoday.com/us/blog/speaking-in-tongues/202407/is-jealousy-a-sign-of-love] [verdict(instrument)]
- [claude] [E] [https://theconversation.com/ghosting-and-breadcrumbing-the-psychological-impact-of-our-bad-behaviour-on-dating-apps-258087] [verdict(gap)]
- [claude] [F] [https://groundworkcollaborative.org/news/love-behind-the-paywall-new-groundwork-report-explores-how-dating-apps-turn-finding-love-into-a-monthly-charge/] [verdict(gap)]


- [chatgpt] [B] [https://www.pewresearch.org/social-trends/2019/11/06/why-people-get-married-or-move-in-with-a-partner/] [verdict(gap)]
- [claude] [G] [https://theconversation.com/why-more-couples-are-choosing-to-live-apart-124532] [verdict(covered)]


- [chatgpt] [C] [https://apnews.com/article/c16ed76a9cf18e2bcc9423ccd33b32fa] [verdict(novel)]


- [chatgpt] [D] [https://theweek.com/culture-life/mankeeping-women-male-loneliness-epidemic] [verdict(gap)]

- [chatgpt] [B] [https://www.pewresearch.org/global/2025/03/19/what-is-the-best-age-to-get-married/] [blocked(fetch-403)]
- [chatgpt] [A] [https://www.psychologytoday.com/us/blog/in-the-name-of-love/202607/when-jealousy-protects-love] [verdict(instrument)]
- [chatgpt] [C] [https://apnews.com/article/efba62ab8cc90afd61790e0685ffe4cd] [verdict(novel)]
- [chatgpt] [D] [https://www.psychologytoday.com/us/blog/closer-encounters/202501/why-men-need-to-be-in-a-relationship-more-than-women-do/amp] [verdict(gap)]
- [chatgpt] [B] [https://theweek.com/personal-finance/what-financial-rights-do-cohabiting-couples-have] [verdict(instrument)]
- [chatgpt] [A] [https://www.psychologytoday.com/us/blog/the-wisdom-of-anger/202509/jealousy-in-open-relationships] [verdict(instrument)]
- [chatgpt] [C] [https://www.psychologytoday.com/us/blog/a-better-divorce/202503/should-i-take-or-waive-alimony-or-child-support-during-my-divorce] [verdict(instrument)]
- [chatgpt] [D] [https://www.psychologytoday.com/us/blog/meet-catch-and-keep/202511/when-a-romantic-partner-is-your-best-friend] [verdict(gap)]
- [chatgpt] [B] [https://www.psychologytoday.com/us/blog/insight-therapy/202606/why-living-together-works-for-some-couples-but-not-others] [verdict(covered)]
- [chatgpt] [A] [https://www.psychologytoday.com/us/blog/social-instincts/202503/4-reasons-why-partners-cheat-in-healthy-relationships] [verdict(instrument)]
- [chatgpt] [C] [https://www.psychologytoday.com/us/blog/your-emotions-and-money/202605/how-do-couples-really-deal-with-money-behind-the-scenes] [verdict(covered)]
- [chatgpt] [D] [https://www.psychologytoday.com/us/blog/intersections/202509/married-and-lonely-how-and-why-it-happens] [verdict(instrument)]
- [chatgpt] [B] [https://www.psychologytoday.com/us/blog/meet-catch-and-keep/202605/why-more-people-just-arent-dating-even-though-they-want-to/amp] [verdict(covered)]
- [chatgpt] [A] [https://www.psychologytoday.com/us/blog/sexual-intelligence/202606/myths-about-infidelity] [verdict(instrument)]
- [chatgpt] [C] [https://theweek.com/personal-finance/prenup-marriage-benefits] [verdict(novel)]
- [claude] [H] [https://www.thepublicdiscourse.com/2025/07/98326/] [verdict(novel)]
- [chatgpt] [D] [https://www.psychologytoday.com/us/blog/platonic-love/202209/why-healthy-romances-depend-on-healthy-friendships] [verdict(gap)]


---

# pt05/claude-findings.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt05/claude-findings.md`

# PT05 — Claude findings (integrator lane)

Run of 2026-08-06, start 08:04 MDT. Method: `md/doctrine-pressure-test-04.md`;
contract: `md/pt05/PROTOCOL.md`. Canon at analysis time: `1.0.0+ac89d0f96ca5` (559).

## Cycle 1 — lane E — The Conversation: Ghosting and 'breadcrumbing'

- URL: https://theconversation.com/ghosting-and-breadcrumbing-the-psychological-impact-of-our-bad-behaviour-on-dating-apps-258087
- Words: 922 · SHA-256: `b8d57f1f2f69a5ca3f34adef0c94918644e35f087078a0995e29e80ff09757df`
- Analyzer: 28 passages · 26 claims · 2 mapped · mappedShare **7.7%** · 0 tensions

**Reading.** The two mapped rows are defensible: the app-motives claim reaches
`statistics:stat-app-reasons` (correct) and `M-TBD-31` (adjacent, Low); the
fairy-tale "wolf" metaphor brushes `stat-casual-gap` at 0.441/Low (lexical
coincidence, displayed as Low — acceptable). Everything the article is actually
about is dark: breadcrumbing (35% perpetrator/victim; sustained breadcrumbing →
lower life satisfaction), ghosting (~20%; expectation build-up then unilateral
silent exit), deceptive self-presentation on apps, and the friends-first
formation claim ("two thirds of young-adult romances begin as friendships").

**Canon check.** `lexicon:term-situationship` (term entry) and `M-TBD-33`
(situationships-dominant question) exist; "ghosting"/"breadcrumbing" appear only
in synopsis prose of gender-dynamics entries — no entry owns unilateral exit
conduct, no aliases reach it.

**Verdict: GAP** — candidate subject: the exit side of app-mediated courtship
(ghosting, breadcrumbing, silent de-escalation) as one mechanism: zero-cost
unilateral exit in a channel with no shared social graph. Holding the proposal
until 1–2 more lane-E cycles to apply the encompassing standard (merge with
situationship-ambiguity phenomena if they share the mechanism).

**Minor instrument note.** The Conversation's embedded "Read more:" promo links
survive extraction and are counted as claim-like units (3 here). Deflates
mappedShare slightly; a `--drop` pattern for promo blocks would fix it at the
extraction layer. Not an analyzer defect.

## Cycle 2 — lane F — Groundwork Collaborative: Love Behind the Paywall

- URL: https://groundworkcollaborative.org/news/love-behind-the-paywall-new-groundwork-report-explores-how-dating-apps-turn-finding-love-into-a-monthly-charge/
- Words: 621 · SHA-256: `5f479b35f471a24771fe25506d04192766c06e76791fe027fb22568266ec6157`
- Analyzer: 18 passages · 17 claims · 4 mapped · mappedShare **23.5%** · 0 tensions

**Reading.** The report-title claim reaches `smv:exposure:the-online-funnel`
(0.540 Medium, correct) and the paywalled-matches claim reaches
`statistics:stat-pay-to-play` (0.473 Low — right neighborhood: that entry owns
who pays, not why the platform wants them paying). Dark: the platform-side
incentive structure — revenue tied to users staying single, matches hidden to
be sold back, price discrimination (older users charged more; personalized
pricing), Match Group + Bumble duopoly, apps as data-mining operations, the
78%-exhausted stat.

**Canon check.** `search-cost` prices the search from the searcher's side;
`stat-pay-to-play` prices the buyer; `the-online-funnel` prices the channel's
sorting. No entry owns the market-maker itself: the platform whose revenue is
maximized by search *continuing*, not concluding.

**Verdict: GAP** — candidate subject: the platform's incentive (the market-maker
takes its cut from the search, so it is structurally aligned with prolonging it).
Encompasses: paywalled artificial scarcity, engagement-optimized matching,
price discrimination, concentration. Natural parent: the Search Cost (sibling
of pt04's 15.1 Meeting Channel).

**Instrument findings (recorded).** Two Low-band false positives displayed:
"one in ten met their match online" → `statistics:stat-child-marriage`
(0.453/Low — no topical relation); "more than half of adults under 50 have
used online dating" → `M-TBD-54` (0.464/Low — adoption stat mapped to an
unrelated friendship-vs-romance question). Both are Low and capped, but both
are the kind of adjacency the tranche work priced; noted, not fixed here.

## Cycle 3 — lane G — The Conversation: Why more couples are choosing to live apart

- URL: https://theconversation.com/why-more-couples-are-choosing-to-live-apart-124532
- Words: 928 · SHA-256: `9a5e99eabea877a618a7536fcdc5454c318956c8cc3429c14738872eafc36844`
- Analyzer: 37 passages · 36 claims · 14 mapped · mappedShare **38.9%** · 2 tensions

**Reading.** `lexicon:term-living-apart-together-lat` absorbs the subject
cleanly — 12 of 14 mapped rows land there at Medium (0.575–0.645), all
Resembles. The cohabitation lead-in reaches `stat-cohabitation-outcomes` /
`stat-cohab-timing`. Both tensions are the instrument working: one flags a
Contradicts needing a boundary test, one flags stated-preference-as-revealed
on the autonomy framing — a caveat the LAT entry itself already carries.
Unmapped rows are respondent vignettes and quotes (correctly unmapped
narrative) plus detail-level motivation taxonomy (constraint-LAT vs
preference-LAT) that the encompassing standard says to skip.

**Verdict: COVERED** — control-grade result on lane G ground. No doctrine
needed.

## Integration 1 (after cycles 1–3)

Folded three entries through the full pt04 procedure — my two gaps plus
ChatGPT's `chatgpt-proposal-marriage-bar.md`, which cleared the encompassing
standard (one economic-threshold subject; four sourced claims; contract-shaped
misreadings; the Pew numbers verified against the primary source before
authoring: 29%/27% financial-unreadiness major-reason, 21% career major):

- **4.1 The Marriage Bar** (`frameworks:marriage-bar`, under the Readiness
  Gate) — Pew 2019 stated reasons (Tier 1), Smock–Manning–Porter 2005
  qualitative mechanism (Tier 3), Ishizuka 2018 SIPP prospective transitions
  (Tier 2), Kearney–Wilson 2018 fracking-boom boundary (Tier 2).
- **15.2 The Market-Maker's Cut** (`frameworks:market-maker-cut`, under the
  Search Cost) — duopoly + subscription revenue structure (Tier 2), Groundwork
  2026 practices documentation (Tier 3, advocacy-bounded), pricing audits +
  Candelore v. Tinder (Tier 2), incentive geometry as Lens with the churn
  counterweight and a stated falsifier. The 78%-exhausted survey figure is
  excluded, consistent with 15.1's standing refusal of opt-in panels.
- **17.1 The Costless Exit** (`frameworks:costless-exit`, under the Third-Party
  Layer) — Freedman 2019 prevalence + destiny-belief acceptability (Tier 2),
  Navarro 2020 damage-localization (breadcrumbing, not ghosting, carries the
  measured harm — the discourse's expectation inverted; Tier 2), price
  mechanism as Lens with the shared-network falsifier. Numbers verified against
  primary sources before authoring.

Procedure: baseline `--dump` first (1,356,134 pairs); entries + overlay +
rebuilt index (559 → 562) + moved pins in one pass, suite 18/18; sweep
`--baseline --neighbors` onto the existing fixture ×2; **326 crossings ruled**
(10 credible: 1 ACCEPT / 6 REJECT / 3 loss-ACCEPT; 316 weak: 45/271), all
entered as Claude recommendations **FLAGGED FOR JASON**; 9/9 misreadings fire
Contradicts end-to-end; magnet check clean (no flat-score clusters; details in
`md/lab-pressure-test-05-threshold-adjudication.md`). Post-change: ghosting
article 7.7% → 15.4% (ghosting sentence reaches `costless-exit` at
0.579/Medium), Groundwork 23.5% → 58.8% (thesis rows reach `market-maker-cut`
0.43–0.61), LAT control unchanged at 38.9%.

## Cycle 4 — lane H — Public Discourse: The Egg Freezing Industry's False Promises

- URL: https://www.thepublicdiscourse.com/2025/07/98326/
- Words: 1,700 · SHA-256: `30985d0069b3a66a9cf62b8c64842b461e7b4d8ca16bfbe93c82db2209272e87`
- Analyzer: 83 passages · 6 claims retained · 0 mapped · mappedShare **0%** · 77 ignored

**Reading.** The domain gate set aside 77 of 83 passages — the essay is
workplace-benefits policy, bioethics, and meaning-of-life argument, and the
gate is right that those are not dating-market claims (same register behavior
as pt04's therapy-vignette finding, here operating correctly). The six
retained rows are the essay's policy thesis (egg-freezing benefits as
coercive family-unfriendly policy) and its Grant-Study/meaning claims — none
is a market claim, and none has a canon home because none should.

**Canon check.** Fertility timing itself is owned ground: `smv:multiplier:clock`
(The Clock), `statistics:stat-fertility-age` ("a slope with two turns, not a
cliff at 30"), `stat-childfree-intent`, and the Wall band structure. The
essay never states the one market-relevant claim in this discourse (delay
driven by partnerlessness rather than career — the Inhorn finding), so
nothing here tests that surface.

**Verdict: CORRECTLY UNMAPPED** — the pt04 age-gap outcome repeated: subject
owned, essay out of domain, number correctly did not move. No doctrine
authored. (A "buying time on the Clock" sub-entry remains a candidate if lane
H later surfaces the partnerlessness-delay claim from an in-domain article;
deliberately not implemented on this essay's evidence.)

## Integration 2 (after cycle 4)

Folded ChatGPT's `chatgpt-proposal-support-portfolio.md` — it clears the
encompassing standard exactly the way the pt04 diagnostic-turn did: four
lane-D articles (mankeeping, men-need-relationships-more, partner-as-best-
friend, married-and-lonely) merged into one mechanism with the gendered
instance held at its measured size. Verification before authoring: the ASC
41%/21% friend-support stat and the Pew turn-to-spouse/partner parity stat
verified VERBATIM against the corpus archive (15-asc, 16-pew); Mancini 2026
(Sex Roles) and Ferrara & Vergara 2024 verified as real publications.

- **17.2 The Support Portfolio** (`frameworks:support-portfolio`, under the
  Third-Party Layer — sibling of 17.1: the layer's enforcement side and its
  support side). ASC 2021 + Pew 2025 channel stats (Tier 1),
  Marabel-Whitburn 2023 peer-network waves (Tier 2), Pennington 2025
  best-friend-label study (Tier 2), Ferrara & Vergara 2024 theory (Lens),
  Mancini 2026 scale (Tier 2 structure / Tier 3 consequences).

Procedure: baseline `--dump` (1,363,412 pairs) at `d936d9d`; canon 562 → 563;
suite-green with two demo-pin events handled (below); sweep ×1; **137
crossings ruled** (2 credible: 1 REJECT gain — a questionnaire item — and 1
loss-ACCEPT; 135 weak: 19 ACCEPT / 97 REJECT gains, all 18 losses ACCEPT as
correct prunings), Claude recommendations FLAGGED FOR JASON; 3/3 misreadings
contract-pass and fire Contradicts (0.74–0.80); magnet check clean
("mankeeping" has zero corpus presence; the weak mass was spread-score
vocabulary resonance, ruled through).

**Demo-pin events (protocol's check-the-pins step, both diagnosed).** The
first draft's overlay boundary ("romantic quality may drive…") pushed a
novel-matrix demo sentence over the credible line at 0.434 via token
coincidence (community/may/romantic/network). Fix: reworded the authored
boundary (pt04's magnet-removal pattern applied to a boundary surface), NOT
the test — the sentence returned to unmapped and the corpus pin returned to
its committed 0.537. No test values moved in this integration.

**Instrument notes from integration.** (1) The misreading-rewrite ripple: two
rewritten tokens ("promising", "monthly") moved 5 weak corpus crossings —
misreading text is live match surface; edits to it are scoring changes and get
the full sweep treatment. (2) The "one in ten met online" false positive
migrated rather than died: `stat-child-marriage` (0.453) before the change,
`stat-cohab-timing` (0.454) after. Same adjacency class the tranche work
priced; recorded, not fixed. (3) `M-TBD-45` nearly absorbed
`stat-pay-to-play`'s own 41%-vs-29% stat at the credible line via +0.001 IDF
drift — rejected as wrong-owner; worth watching as canon growth keeps diluting
IDF.


---

# doctrine-pressure-test-06.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/doctrine-pressure-test-06.md`

# Doctrine pressure test 06 — second parallel Claude + ChatGPT run

**Run date:** 2026-08-06, 17:04–18:35 MDT (Claude integrator lane; scout
closed 18:05 and its closeout is folded below)
**Status:** Implemented and verified; commits local, **no push without Jason**.
**Lane:** Parallel pressure test under `md/pt06/PROTOCOL.md` — Claude as
integrator/sole committer (Fable, high effort), ChatGPT/Codex as scout.
Method: `md/doctrine-pressure-test-04.md`, run two-handed per pt05.

## 1. Run design

Second two-agent run on one checkout, coordinated through the append-only
ledger `md/pt06/CLAIMS.md`. Claim collisions observed: zero. Claude worked
lanes E (divorce discourse), F (dating with children/stepfamily), G
(deliberate singleness), H (class/education gaps); ChatGPT worked A–D (paid
intermediaries, AI-assisted dating, religion, cross-border). Claude analyzed
6 articles (2 more died at bot-walls: Fast Company, Axios — both Cloudflare),
ran two integrations, ruled every adjudicable crossing, and made all commits.
ChatGPT analyzed 11 articles plus one paywall-blocked fetch (final closeout
tally: 5 gap · 6 instrument/no-doctrine-needed · 1 blocked) and filed two
proposals, both verified and folded. Raw source text stayed out of the repo;
SHA-256s in the two findings files.

## 2. Claude's source ledger (full detail in `md/pt06/claude-findings.md`)

| # | Lane | Article | Words | Before | After | Verdict |
|--:|---|---|--:|--:|--:|---|
| 1 | E | Pew — Led by Baby Boomers, divorce rates climb for 50+ | 730 | 18.5% | **74.1%** | gap → **31.1** |
| 2 | E | IFS — The U.S. Divorce Rate Has Hit a 50-Year Low | 683 | 33.3% | 37.5% | covered (stock-flow-error owns the falling side) + instrument |
| 3 | E | Psychology Today — The Walkaway Wife Syndrome, Revisited | 1,091 | 17.9% | 25.0% | covered → misreading folded onto `stat-demand-withdraw` |
| 4 | G | The Guardian — Going boysober | 1,295 | — | 44.0% | gap candidate, HELD |
| 5 | H | IFS — Whither Hypergamy? | 1,230 | — | 20.7% | gap candidate, HELD (blocking reconciliation) |
| 6 | F | The Conversation — Navigating being a stepdad | 776 | — | 20.0% | covered / correctly gated |

"Before" is canon `1.0.0+608b9220122a` (563); "after" is `1.0.0+79158e0f6247`
(564). Captures 4–6 ran only against the post-integration canon.

## 3. Implemented surfaces (canon 563 → 566, two integrations)

- **31.1 The Gray Divergence** (under the Stock–Flow Error, `frameworks.html`)
  — the aggregate divorce decline as a composite of opposite-moving
  components: 50+ doubled (4.9→10.1 per 1,000, Brown & Lin 2012; 10 in 2015),
  65+ roughly tripled (6 per 1,000), 25–39 fell 30→24 — with the honest
  counterweight stated (the under-50 rate is still roughly double the over-50
  rate); the marital-biography driver (remarriages divorce at double the
  first-marriage rate, 16 vs 8; 48% of 50+ divorcers in second+ marriages;
  duration gradient with the 30-plus-year exception at about a third); the
  gendered aftermath (Lin & Brown 2021: women −45% standard of living vs men
  −21%, persistence for men, repartnering reversal for women). All claims
  verified at source (Brown & Lin and Lin & Brown abstracts/full text fetched;
  Pew rates from the analyzed capture).
- **17.3 The Delegation Boundary** (under the Third-Party Layer; from
  ChatGPT's P1, verified before folding — Rochadiat 2020 confirmed via
  Crossref) — courtship assistance as an agency gradient (feedback →
  co-authorship → substitution), judged by the decision transferred, the
  representation the counterpart receives, and whether the assisted
  performance survives direct interaction; platform ranking and
  seeker-reviewed shortlists stay Meeting Channel mechanics, accessibility
  assistance is not proxy intent.
- **35.1 The Border Bundle** (under the Local Market; from ChatGPT's P2,
  verified before folding — the JPE 40%/20% verbatim from the RePEc
  abstract, Chang's N = 64,972 verbatim from Crossref) — a cross-border
  pairing joins two containers and can bundle mobility, legal status,
  language, employment, and network into the bargain; legal status sits
  inside the matching bargain (Adda, Pinotti & Tura 2025), the bundle can
  pay the migrating spouse (Chang 2016), and dating abroad alone is not the
  bundle.
- **`statistics:stat-demand-withdraw` walkaway surface** (overlay only) —
  alias `walkaway wife syndrome` + misreading "Once a spouse quits complaining
  about the relationship, the marriage has finally found peace." The
  walkaway-wife article was otherwise covered (initiation by `stat-divorce`,
  the loop by `stat-demand-withdraw`, the sex-investment questions by
  M-TBD-29/50/21); what was dark was the discourse's signature endpoint —
  silence read as repair.

## 4. Adjudication (sheet: `md/lab-pressure-test-06-threshold-adjudication.md`)

Two full pt04 cycles, each with its own baseline `--dump` before any edit and
its own `--neighbors` regen onto the existing fixture. **480 rulings entered**
(integration 1: 250 weak 12A/222R/16 loss-A + 3 credible REJECT; integration
2: 220 weak 190R/30 loss-A + 5 credible REJECT + 2 credible loss-ACCEPT —
**all 10 credible rulings are recommendations FLAGGED FOR JASON**). 106
crossing pairs across the two sweeps already carried rulings from earlier
epochs and stand. 10/10 new misreadings fire Contradicts end-to-end
(0.73–0.80 High). Magnet check: zero verbatim corpus occurrences of any new
alias except "marriage migration" (3 — no magnet shape). Demo pins: the
volcanic-ash negative-control probe tripped once (my sub-note prose collided
with its "A new claim says…" template) and a short-unit token pair
(romantic+partner) put one Finkel sentence at 0.608 credible on both folded
entries — both fixed by rewording the authored surface, never a pin, with a
re-sweep after each edit. Census lane 14,354 recorded, unchanged.

## 5. Deliberately NOT implemented

- **The deliberate-exit entry (lane G).** Boysober/celibacy-era discourse is a
  genuine gap candidate — canon owns the coordinated male hypothetical
  (`mens-strike`), the Korean movement (`term-4b`), and checked-out singles'
  reasons (`stat-why-single`), but not individual exit-as-practice. One
  article is not the encompassing standard; candidate shape recorded in the
  findings file for a future lane-G run.
- **The hypergamy-decoupling entry (lane H).** The IFS thesis (educational
  hypergamy reversed, income hypergamy persisted) is dark, but the corpus's
  Hirschl paper (C12) uses a hypergamy measure whose rise runs continuously
  from ~1970 — opposite-reading unless the measures differ. Authoring before
  that reconciliation would enshrine the measure confusion the entry should
  dissolve. The reconciliation is the named next step.
- **The scout's engine-lane handoffs** — the domain gate repeatedly binning
  explicit relationship mechanisms (proxy authorship, faith filtering,
  cross-border mobility), and the existing `dating coach` alias on the
  Survivorship Channel acting as a credible-line magnet in two of its
  captures (0 corpus occurrences, so no corpus-side ruling moved) — engine
  and alias-surface work for a future measured pass, not this run's
  authoring.
- **Stance-bleed fix.** A Pew sentence that agrees with the new entry displays
  Contradicts at Low (proximity to the new misreading surface) — engine work
  for a RED-first pass, not an authoring workaround.
- **Extraction-layer drops for IFS "Post This" tokens and Psychology Today's
  double-rendered pathways widget** — recorded as extraction residue; the
  second PT widget instance leaked ~4 promo lines into claim counts.

## 6. Instrument findings (recorded, not fixed here)

1. **"The Wall Street Journal" reaches `frameworks:the-wall` at 0.540
   Medium** (author-bio line, IFS cycle 2) — "Wall Street" is a lexical
   magnet onto The Wall's alias surface; any finance-adjacent sentence can
   trip it at displayed-Medium.
2. **Stance-bleed near authored misreadings:** an agreeing sentence lexically
   close to a misreading can display Contradicts (Low) against the right
   entry. First observed on the gray-divergence surface.
3. **The domain gate correctly set aside step-parenting register** (42 of 47
   passages, cycle 6) — same shape as pt04's therapy-vignette finding; the
   market-formation rows that survived mapped sensibly.
4. **Cloudflare bot-walls now block two mainstream outlets** (Fast Company,
   Axios) at the raw-fetch layer — a coverage constraint on lane F's
   single-parent-app-market probe, not an analyzer issue.

## 7. Verification

- `npm run test:lab`: 18/18 (exit 0) on both commits, read from the real exit
  code; floors, ratchets, frozen benchmarks untouched; no test value moved
  except the four authored count pins (563→564 concepts, 60→61 frameworks,
  563→564 misreadings, 530→531 boundaries).
- Commits: `62bc887` (integration 1) · `752c3b9` (stamp) · `d5a3811` (run
  record) · `3439f66` (integration 2, the fold) · `3e38fc6` (stamp) ·
  `cb816b1` (scout closeout folded) — all local only.
- Scout tallies and both proposals folded from `md/pt06/chatgpt-findings.md`
  after its 18:05 closeout; its recomputed hashes and QA block are in that
  file.

## 8. Addendum — scout artifact tidied (2026-08-07)

`md/pt06/chatgpt-findings.md` was deleted from the working tree in the repo
cleanup sweep (the pt07 §7 pattern; `chatgpt-handoff.md` had already been
tidied on 2026-08-06). It was committed at its closeout and is recoverable in
full — including the recomputed hashes and QA block §7 cites:

```
git show cb816b1:md/pt06/chatgpt-findings.md
```


---

# pt06/PROTOCOL.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt06/PROTOCOL.md`

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


---

# pt06/KICKOFF.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt06/KICKOFF.md`

# PT06 kickoff prompts — paste one into each FRESH session, then start both

Both sessions run simultaneously on this checkout for at least one hour.
Start them within a few minutes of each other.

---

## Prompt 1 — Claude (fresh session, integrator). Paste as a `/loop` command:

```
/loop Run pressure-test 06 as the INTEGRATOR, self-paced, for at least one hour.

Read md/pt06/PROTOCOL.md first — it is the collision contract for this run (a
ChatGPT/Codex session is working the same checkout in parallel as scout).
Method precedent: md/doctrine-pressure-test-04.md executed two-handed in
md/doctrine-pressure-test-05.md. Your lanes: E divorce discourse (gray
divorce, divorce-rate myths, walkaway-wife) · F dating with children /
stepfamily formation · G deliberate singleness (boysober, intentional
celibacy) · H class & education gaps in pairing (hypergamy discourse,
mixed-collar relationships).

Each cycle: claim an article in md/pt06/CLAIMS.md (re-read it immediately
before appending; keep the file UTF-8), fetch + extract with
tools/extract-source-text.mjs to your scratchpad (drop promo/recirculation
furniture), run node fixtures/run-analyzer.mjs recording the canon version
per capture, judge the output (covered / gap / instrument finding / correctly
unmapped), and log it in md/pt06/claude-findings.md with URL, words, SHA-256,
canon version, mapped %.

Every 2–3 cycles, integrate: fold your gaps plus any md/pt06/chatgpt-*
proposals that clear the encompassing standard through the full pt04
procedure: baseline --dump FIRST, entries + overlay + rebuilt index + moved
pins in one commit suite-green, sweep --baseline --neighbors onto the
existing fixture (indent-2 JSON), rule all weak crossings, enter credible
rulings as recommendations FLAGGED FOR JASON, probe misreadings fire
Contradicts, check the analyzer-demo pins after any alias change (fix the
authored surface, never the pin), magnet-check new aliases against the
corpus, then the generatedAt stamp commit. Remember: misreading and boundary
text is live match surface — re-sweep after any edit to it. You are the ONLY
agent who touches canon surfaces, tests/, the fixture, or git commit. Stage
only your paths; ChatGPT's uncommitted md/pt06/chatgpt-* files stay out of
your commits until you deliberately fold them (its findings file only after
its closeout). NEVER push without Jason's in-session confirmation.

Keep looping — claim, analyze, verdict, integrate — until at least an hour
has passed, then write the run record (md/doctrine-pressure-test-06.md +
INDEX.md rows + mission-notes ledger row) and report: gaps found, entries
shipped, credible rulings awaiting Jason, instrument findings, and what you
deliberately did NOT implement.
```

---

## Prompt 2 — ChatGPT/Codex (fresh session, scout). Paste directly:

```
You are the SCOUT for pressure-test 06 on The Love Equations repo, working
this checkout concurrently with a Claude integrator session for at least one
hour. Read md/pt06/PROTOCOL.md first — it is the collision contract and it
binds you. Your lanes: A paid human intermediaries (dating coaches,
matchmakers, date-me-docs) · B AI-assisted dating (profile ghostwriting, AI
wingman tools, chatbot screening — NOT AI companions; the corpus covers
those) · C religion and dating (faith-based apps, congregations as meeting
channel, interfaith pairing) · D cross-border and international dating
discourse.

You are read-only against the repo except: appending claim lines to
md/pt06/CLAIMS.md (keep it UTF-8), and creating NEW files under md/pt06/
prefixed chatgpt- (your findings file and any proposals). No mutating git
commands, no edits to site pages, data/, tests/, tools/, lab-corpus/, or
Claude's files. Claude is the sole committer.

Each cycle (~15–20 min): claim an article in the ledger (re-read immediately
before appending); fetch raw HTML to your own temp dir OUTSIDE the repo;
extract with tools/extract-source-text.mjs recording the SHA-256; run
node fixtures/run-analyzer.mjs --source <txt> --out <temp>/<slug>.json and
record the canon version from the summary line; judge the output like a
reviewer; log verdict (covered / gap / instrument / correctly unmapped) in
md/pt06/chatgpt-findings.md with URL, words, SHA-256, canon version, mapped %.

For gaps, write PROPOSALS to the encompassing standard in PROTOCOL.md (one
big-picture subject, 2–4 sourced tiered claims, concept-naming aliases, 1–3
contract-compliant misreadings — 10–18 words, no negators, a relational-frame
word, none of married/marries/chosen/dates — boundaries, deliberate
nonclaims). Verify corpus-verifiable stats verbatim against lab-corpus/
before proposing. "No doctrine needed" is a valued verdict.

At the hour, close out: sequential ledger + findings QA, recomputed hashes,
a summary section with verdict tally and proposal list, and a handoff note
for the integrator. Your findings file stays uncommitted until the
integrator deliberately folds it after your closeout.
```


---

# pt06/CLAIMS.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt06/CLAIMS.md`

# PT06 claims ledger

Append-only. One line per article: `- [agent] [lane] [URL] [status]`.
Re-read this file immediately before appending. Statuses: claimed → analyzed → verdict(covered|gap|instrument|novel).
Keep this file UTF-8.
- [claude] [E] https://www.pewresearch.org/short-reads/2017/03/09/led-by-baby-boomers-divorce-rates-climb-for-americas-50-population/ verdict(gap)
- [chatgpt] [B] https://www.theguardian.com/lifeandstyle/2025/mar/08/ai-wingmen-bots-to-write-profiles-and-flirt-on-dating-apps verdict(gap)
- [claude] [E] https://ifstudies.org/blog/the-us-divorce-rate-has-hit-a-50-year-low verdict(gap)
- [claude] [E] https://www.fatherly.com/love-money/walkaway-wife-syndrome abandoned(404)
- [claude] [E] https://www.psychologytoday.com/us/blog/divorce-busting/202209/the-walkaway-wife-syndrome-revisited verdict(covered)
- [chatgpt] [A] https://www.cbsnews.com/news/turning-love-into-a-career/ verdict(gap)
- [chatgpt] [C] https://apnews.com/article/f8ac6df523b8164fbcc31285ad33c824 verdict(instrument)
- [chatgpt] [D] https://www.theguardian.com/lifeandstyle/2016/jan/11/mail-order-marriage-brides-ukraine-america-romance verdict(gap)
- [chatgpt] [B] https://apnews.com/article/3c612af2284e85860927d95998750829 verdict(gap)
- [chatgpt] [A] https://www.wired.com/story/date-me-google-docs-and-the-hyper-optimized-quest-for-love/ blocked(extractor-paywall)
- [chatgpt] [A] https://indianexpress.com/article/lifestyle/life-style/dating-apps-date-me-docs-8883575/ verdict(instrument)
- [chatgpt] [C] https://www.pewresearch.org/religion/2025/02/26/religious-intermarriage/ verdict(instrument)

- [chatgpt] [D] https://www.theguardian.com/lifeandstyle/2022/sep/10/british-singles-on-the-awkward-truth-about-dating-abroad verdict(instrument)
- [chatgpt] [A] https://time.com/7292743/matchmakers-react-to-materialists/ verdict(instrument)
- [claude] [G] https://www.theguardian.com/lifeandstyle/2024/dec/30/dating-culture-celibacy-boysober verdict(gap)
- [chatgpt] [B] https://www.theguardian.com/technology/2026/feb/15/ai-dating-apps-personality-matchmaking verdict(gap)
- [claude] [H] https://ifstudies.org/blog/whither-hypergamy verdict(gap)
- [chatgpt] [C] https://www.theguardian.com/world/2024/oct/09/dating-gaza-war-october-7 verdict(instrument)
- [claude] [F] https://www.fastcompany.com/90732580/match-launches-a-new-dating-app-designed-for-single-parents abandoned(bot-blocked)
- [claude] [F] https://www.axios.com/2022/03/21/single-parent-dating-app-stir-match-tinder abandoned(bot-blocked)
- [claude] [F] https://theconversation.com/navigating-the-tricky-waters-of-being-a-stepdad-77293 verdict(covered)


---

# pt06/claude-findings.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt06/claude-findings.md`

# PT06 — Claude findings (integrator lane)

Run of 2026-08-06, start 17:04 MDT. Method: `md/doctrine-pressure-test-04.md`;
contract: `md/pt06/PROTOCOL.md`. Lanes E–H.

## Cycle 1 — lane E — Pew Research: gray divorce (divorce rates climb for 50+)

- URL: https://www.pewresearch.org/short-reads/2017/03/09/led-by-baby-boomers-divorce-rates-climb-for-americas-50-population/
- Words: 730 · SHA-256: `f6fc88fc96f77ab24a1ab3d284898f23735b1514737e81df655b1294c3596b33`
- Canon at capture: `1.0.0+608b9220122a` (563)
- Analyzer: 27 passages · 27 claims · 5 mapped · mappedShare **18.5%** · 0 tensions
- Extraction: dropped `wp-block-prc-block-story-item` recirculation cards and the
  social-share sheet; cut at the "Related posts:" paragraph.

**Reading.** The five mapped rows are defensible neighbors: median-age-at-first-
marriage → `statistics:stat-marriage-age` (0.489 Low, correct); college-educated
marriers → `stat-remarriage-gap` (adjacent); 50+ divorce trend →
`deep-dive:what-the-wall-actually-is:band-50-plus` (right neighborhood); the
0.618 Medium row is a transitional sentence ("divorce at this stage of life can
also have some downsides") landing on `stat-remarriage-gap` — nearest-neighbor
artifact, displayed confidence acceptable, not a defect. Dark: the article's
actual subject — the age-graded DIVERGENCE of divorce rates. Since 1990 the
rate roughly doubled for 50+, roughly tripled for 65+, while falling by about a
third for 25–39; drivers are the Boomer marital biography (remarriages divorce
at double the rate of first marriages; 48% of 50+ divorcers in 2015 were in a
second+ marriage), and short-duration marriages at older ages; aftermath is
gendered financial insecurity (gray divorcees, especially women).

**Canon check.** `stat-divorce` owns who initiates; `stat-wedding-hazard` owns
what the wedding predicts; `stat-remarriage-gap` owns who re-partners after an
ending; `single-parenthood:divorce-rebuilds`/`route-in-flips` own divorce as a
route into single parenthood by era. No entry owns the trend structure: "the
divorce rate" as a composite that is falling where marriage became selective
and rising where the Boomer remarriage stock aged — which is also the mechanism
under every "divorce rates are rising/50%" myth claim.

**Verdict: GAP** — candidate subject: the divorce-rate divergence (one
mechanism: marriage's increasing selectivity pushes risk down for new
cohorts while the accumulated remarriage stock pushes it up at older ages;
"the" divorce rate is a composite of the two). Holding the proposal for the
encompassing standard until 1–2 more lane-E cycles (divorce-rate myths and
walkaway-wife discourse likely share the surface).

## Cycle 2 — lane E — IFS: The U.S. Divorce Rate Has Hit a 50-Year Low

- URL: https://ifstudies.org/blog/the-us-divorce-rate-has-hit-a-50-year-low
- Words: 683 · SHA-256: `cf55e2365440da3265c34204b20abbe71b3bf02b2b28216e561ba82b2357ae5e`
- Canon at capture: `1.0.0+608b9220122a` (563)
- Analyzer: 24 passages · 24 claims · 8 mapped · mappedShare **33.3%** · 2 tensions
- Extraction: `blog-text-contents` container; dropped related-articles/newsletter/
  email-capture. Residue: two inline "Post This" share tokens in the Highlights
  block and the author bio line (see instrument finding).

**Reading.** Good rows: the top-third-income intact-marriage stat (64% vs 24%)
reaches `frameworks:marriage-bar` (0.457 Low) — the pt05 entry earning its keep
on exactly-in-scope class-gap material. Marriage-rate-all-time-low reaches
`M-TBD-35` (0.533 Medium, correct neighborhood). Both tensions fire on the
pandemic-postponement sentence (absolute-claim + causal-claim risk flags,
priority 3) — defensible reviewer behavior, not misfires. Dark: the falling
side of the divergence — divorce at a 50-year low (14.9 per 1,000 marriages),
"marriages today have a better chance of lasting than they did 10 years ago,"
divorce becoming concentrated among the shrinking, older married stock while
young marrieds are increasingly selected. Nearest matches for those rows are
wrong-neighborhood (`sixth-rung` is the breakup rung of the ladder;
`term-the-re-entry-discount` for "longer marriages" is lexical).

**Instrument finding (real).** The author-bio line "Her work has been featured
in The New York Times, The Wall Street Journal…" mapped to
`frameworks:the-wall` at **0.540 Medium**. "Wall Street" is a lexical magnet
onto The Wall's alias surface — any finance-adjacent sentence can trip it at
displayed-Medium. Extraction-layer fix (cut the bio) masks but does not remove
the surface. Recorded for the run record; no canon edit proposed by itself.

**Verdict: GAP** (same subject as cycle 1 — the two articles are the two
halves of one composite: rising 50+/remarriage-stock side, falling
young-selective side) **+ instrument finding** (the-wall magnet).

## Cycle 3 — lane E — Psychology Today: The Walkaway Wife Syndrome, Revisited

- URL: https://www.psychologytoday.com/us/blog/divorce-busting/202209/the-walkaway-wife-syndrome-revisited
- Words: 1091 · SHA-256: `f28a6c480703023ea318b40611551776ff623b3d1db8ba4dc47d59c8f0e0dc6c`
- Canon at capture: `1.0.0+608b9220122a` (563)
- Analyzer: 46 passages · 39 claims · 7 mapped · mappedShare **17.9%** · 1 tension
- Extraction: `layout-content-main`; dropped pathways cards, subscribe form,
  more-from blocks, ads, social; cut at `social-links-bottom`. Residue: PT
  renders the pathways widget twice and a second instance leaked ~4 promo lines
  ("Take our … quiz", "Why Relationships Matter", an essential-reads title);
  one mapped at 0.431 Low (`M-TBD-30`). Extraction-layer, not instrument.

**Reading.** This is Weiner-Davis (the coiner) revising her own construct. The
mapped rows are the right neighborhoods: filed-by-women → `stat-divorce`;
men-invest-less → `frameworks:commitment-problem`; the sex-desire/investment
loop rows land on the open questions `M-TBD-29/50/21`. The single tension is
the analyzer catching "All my husband thinks about is sex" as a universalized
sex difference — correct reviewer behavior. Dark: the walkaway ARC itself —
years of asking (more time, more connection) → resignation → the Silent Zone
(complaints stop, exit gets planned) → the blindsided husband; and the 2022
revision: intractability works both ways (wives' fixed sexual-refusal stance
mirrors husbands' fixed investment stance).

**Canon check.** `stat-divorce` owns who wants the divorce (69% women-wanted,
CI noted); `stat-demand-withdraw` owns the demand→withdraw loop this arc runs
on; `costless-exit` owns exit economics in stranger markets (wrong mechanism
here — marriage exit has a shared network and is expensive). Nothing owns the
arc's signature endpoint: the silence-before-exit that reads as peace.

**Verdict: COVERED**, with one residual surface to fold at integration: a
misreading on `stat-demand-withdraw` — reading the end of complaints as
repair, when the loop's exhausted end-state is exit preparation. Not a new
entry (encompassing standard: the mechanism is already owned by
demand-withdraw + stat-divorce).

## Integration 1 — commits `62bc887` (entry) + `752c3b9` (stamp)

Cycle-2 verdict revised during canon check: the falling-rate/50%-myth side is
owned by `frameworks:stock-flow-error` (refined rate 22.8→14.2, Kennedy &
Ruggles) — that half was a retrieval miss, not a doctrine gap. What was truly
dark: the divergence itself. Shipped **31.1 The Gray Divergence** under the
Stock–Flow Error (Brown & Lin 2012 doubling 4.9→10.1 per 1,000 and the 1-in-4
share; Pew 2017 rates, remarriage split 16-vs-8, duration gradient; Lin &
Brown 2021 45%/21% aftermath — all verified at source), plus the walkaway
surface on `stat-demand-withdraw` (alias `walkaway wife syndrome` + the
silence-reads-as-peace misreading). Full pt04 procedure: baseline `--dump`
first; 253 rulings (250 weak: 12 ACCEPT / 222 REJECT / 16 loss-ACCEPT; 3
credible REJECT — junk Heyman table headers — **recommendations FLAGGED FOR
JASON**); band regenerated onto the existing fixture; 4/4 misreadings fire
Contradicts (0.73–0.75 High); zero verbatim alias hits in corpus (no magnet);
demo pins untouched; suite 18/18 both commits. Sheet:
`md/lab-pressure-test-06-threshold-adjudication.md`.

After-numbers (canon `1.0.0+79158e0f6247`): Pew gray divorce 18.5% → **74.1%**
(the divergence rows, remarriage rows, duration rows, and aftermath row all
reach the entry with sensible stances); IFS 33.3% → **37.5%**; walkaway
17.9% → **25.0%**.

**Instrument note (new).** In the Pew after-capture, "Their marital
instability earlier in life is contributing to the rising divorce rate…" —
a sentence that AGREES with the entry — displays **Contradicts** at 0.49 Low
against `gray-divergence`, plausibly stance-bleed from the new misreading
surface ("Rising divorce among older couples proves…"). Low-confidence,
correct entry, wrong stance label. Recorded; no fix authored (stance layer is
engine work).

## Cycle 4 — lane G — The Guardian: Going boysober (women who turned to celibacy in 2024)

- URL: https://www.theguardian.com/lifeandstyle/2024/dec/30/dating-culture-celibacy-boysober
- Words: 1295 · SHA-256: `322d59800d98d158a1bc4402a342fc8911ee8388166e629db75a2a343fb9f7d3`
- Canon at capture: `1.0.0+79158e0f6247` (564)
- Analyzer: 28 passages · 25 claims · 11 mapped · mappedShare **44.0%** · 1 tension
- Extraction: Guardian `maincontent` container; dropped figures/asides/gu-islands.

**Reading.** Strong coverage where the canon has surface: all seven 4B rows
reach `lexicon:term-4b` at Medium with differentiated stances (one Supports on
the Google-searches spike, one Challenges on "4B is not an attack" — good
behavior), the TikTok-trend rows reach `frameworks:virality-filter`, and the
women-abstaining row brushes `stat-casual-gap`. The tension (attraction
collapsed into selection, on the 4B-is-not-an-attack quote) is defensible.
Dark: the American individual practice itself — boysober/"celibacy era" as
deliberate, positively-framed market withdrawal (motives: app-slog backlash,
misogyny/safety protest, self-development and "decentering," the "celibate
sluts" distinction — abstaining from the market, not necessarily from sex),
and re-entry with clarified standards.

**Canon check.** `frameworks:mens-strike` owns coordinated male withdrawal AS
A HYPOTHETICAL ("withdrawal is, in principle, men's to attempt");
`lexicon:term-4b` owns the Korean movement and already notes it is "cited as
the women's strike"; `stat-why-single` owns checked-out singles' stated
reasons. Nobody owns the observed, uncoordinated, individual exit-as-practice
— the thing that actually happened here, on the female side, without
coordination.

**Verdict: GAP (candidate)** — subject: deliberate market exit as an
individual strategy (the strike that needs no coordination: one person
withdrawing on bad terms, framed as self-development). Encompasses boysober,
celibacy-era, decentering discourse; siblings: mens-strike (the coordinated
hypothetical), term-4b (the movement), stat-why-single (the stock's stated
reasons). HELD for the encompassing standard — one article is not enough to
ship a framework entry; if no second lane-G source lands this run, record as
deliberately-not-implemented with the candidate shape.

## Cycle 5 — lane H — IFS: Whither Hypergamy?

- URL: https://ifstudies.org/blog/whither-hypergamy
- Words: 1230 · SHA-256: `65a13070611c011784cbd0efff732dafd7df826133d7618262017735c5cfdf35`
- Canon at capture: `1.0.0+79158e0f6247` (564)
- Analyzer: 29 passages · 29 claims · 6 mapped · mappedShare **20.7%** · 2 tensions
- Extraction: IFS `blog-text-contents`; same drops as cycle 2. Same "Post This"
  inline residue.

**Reading.** Mapped rows are neighbors, not owners: the hypergamy-definition
row reaches `frameworks:smv-matching` (0.54 Medium), the hypogamous-divorce
row Challenges `M-TBD-39`, and both tensions are defensible (stated/revealed
preference on "marry for money"). Dark: the article's whole thesis — the
DECOUPLING. Educational hypergamy reversed (women now "partner down" on
diplomas more than men) while income hypergamy persisted (even
more-educated wives usually earn less; the Swedish register finding that men
are the main earners in every union type; highly-educated women's especially
tight preference for high-earning men).

**Canon check.** `stat-provider-norm` owns the earnings-arrangement trend
(85%→55% husband-provides); `term-assortative-mating` owns similarity
pairing; `smv-matching` owns looks-sorting; the corpus carries Hirschl (C12)
on educational homogamy/hypergamy trends. Nobody owns the decoupling as a
subject — the discourse's central "hypergamy is over / hypergamy never left"
fight is exactly this measure confusion.

**Verdict: GAP (candidate), HELD — with a blocking reconciliation.** The
corpus manifest's C12 correction records that in Hirschl's measure the 1990
inflection belongs to HOMOGAMY and "hypergamy's rise runs continuously from
about 1970" — which reads opposite to the IFS "women increasingly marry
down" framing unless the two use "hypergamy" for different measures
(likely: income- vs education-based, or wives'-relative-education
direction conventions). An entry authored before that reconciliation would
risk enshrining the very measure confusion it should dissolve. Not shipped
this run; the reconciliation is the named next step.

## Integration 2 — commits `3439f66` (fold) + `3e38fc6` (stamp) + `cb816b1` (scout closeout)

The scout closed at 18:05 with two proposals; both were independently
re-verified before folding: Rochadiat 2020 (Crossref — ODAs assume clients'
identities toward unsuspecting daters), Adda/Pinotti/Tura JPE (RePEc abstract
verbatim: legal-status access → intermarriage −40%, intermarriage separation
hazard +20%), Chang 2016 (Crossref verbatim: N = 64,972, marital power
dynamics), Statham & Sunanta 2026 (title/venue/date). Shipped **17.3 The
Delegation Boundary** and **35.1 The Border Bundle** (canon 564→566) through
the full pt04 cycle: fresh baseline `--dump`; 227 rulings (220 weak 190R/30
loss-A; 7 credible: 5 REJECT + 2 loss-ACCEPT, FLAGGED FOR JASON); band regen
onto the existing fixture; 6/6 misreadings Contradicts 0.73–0.80.

Two authored-surface over-reaches were caught and reworded (never a pin):
my Border Bundle sub-note collided with the volcanic-ash probe's "A new
claim says…" template ("says … says" + "a new social network" — reworded,
probe returned to unmapped), and the 8-token Finkel sentence "He also has to
be your only romantic partner." hit 0.608 credible on BOTH new entries via
the short-unit coverage effect on the romantic+partner token pair (reworded
P1's first misreading and P2's boundary text; both pairs fell below every
line). Misreading and boundary text is live match surface — re-swept after
each edit.

Zero weak gains accepted in this integration, and that is the honest result:
the corpus has no delegation-in-courtship or cross-border-pairing prose; the
only genuinely adjacent passage (Trent's migration × marriage-markets
future-work sentence) crosses nothing above the census floor.


---

# doctrine-pressure-test-07.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/doctrine-pressure-test-07.md`

# Doctrine pressure test 07 — third parallel Claude + ChatGPT run

**Run date:** 2026-08-06. Main run **19:44–20:44 MDT (60 minutes)**, extended
from 20:58 at Jason's request. Times are from the commit timestamps, not
estimated. (Claude integrator lane. The scout closed out after **2h01m**; its findings,
proposals and ledger were folded in a fourth integration at Jason's request.)

**Correction, recorded rather than quietly fixed:** the first version of this
record dated the main run 19:44–21:50 and reported it as meeting the protocol's
two-hour floor. It did not. The clock was read once at 20:22 and then estimated
forward across the second integration, so the run was reported at roughly twice
its length. **The two-hour floor was not met in the main run** — the work in it
is unaffected, but the duration claim was wrong.
**Status:** Implemented and verified; commits local, **no push without Jason**.
**Lane:** Parallel pressure test under `md/pt07/PROTOCOL.md` — Claude as
integrator/sole committer (**Opus 5, high effort** — pt04–06 ran Fable),
ChatGPT/Codex as scout. Method: `md/doctrine-pressure-test-04.md`, run
two-handed per pt05 and pt06.

## 1. Run design

Third two-agent run on one checkout, coordinated through the append-only ledger
`md/pt07/CLAIMS.md`. Claim collisions observed: zero. Claude worked lane E
(desire-discrepancy discourse, 3 captures) and lane G (neurodivergence and
dating, 2 captures), analyzed 5 articles, ran two full integrations, ruled every
adjudicable crossing, and made all commits. In an extension hour after the
main run closed, Jason delegated the credible-line adjudication to Claude (§4)
and the two unreached lanes were worked: **lanes F (dating after loss) and H
(long-distance) each produced one capture and one gap, both HELD** — see §5. The scout worked
lanes A–D and had filed 12 claim lines and three proposals by 21:40; its
findings file and proposals stay uncommitted, per the protocol, until its
closeout.

## 2. Claude's source ledger (full detail in `md/pt07/claude-findings.md`)

| # | Lane | Article | Words | mapped % | Verdict |
|--:|---|---|--:|--:|---|
| 1 | E | Psychology Today — Dealing With a Sexless Relationship | 855 | 40.6% | instrument (magnet) + gap candidate |
| 2 | E | VICE — Is Your Sex Life Dead? There's a Subreddit For That | 1,214 | 21.7% | gap + instrument |
| 3 | E | The Conversation — Women's sexual desire often goes undiscussed | 908 | 60.0% | gap → **The Attribution Fork** + instrument |
| 4 | G | The Conversation — Why dating can be tough for autistic people | 724 | 17.4% | gap candidate + instrument |
| 5 | G | Psychology Today — When Rejection Sensitivity Meets the Dating Scene | 697 | **0.0%** | gap → **The Ambiguity Tax** + instrument |
| 6 | F | Psychology Today — Married to Two People: The Romantic Life of Widows | 1,362 | 16.4% | gap (the unsevered bond), **HELD** |
| 7 | H | Psychology Today — Can Long-Distance Relationships Really Work? | 461 | **0.0%** | gap → **The Distance Discount** |
| 8 | H | NPR Life Kit — Long-distance relationships are tough | 1,078 | 7.4% | gap (same subject, confirms) |
| 9 | F | VICE — Do You Believe in Love After Loss? | 5,584 | 12.0% | gap (confirms cycle 6) + instrument |

Captures 1–3 ran against canon `1.0.0+c4f092f8c7d3` (566); 4–5 against
`1.0.0+7a2150b7a15f` (567); 6–8 against `1.0.0+48254605825a` (568); 9 against
`1.0.0+c08dbe01725d` (569). Raw source text stayed out of the repo; SHA-256s are
in the findings file.

## 3. Implemented surfaces (canon 566 → 571, four integrations)

- **1.1 The Courtship Buffer** (under the Conversion Ladder; **folded from the
  scout's P3**) — alcohol's measured effects are real, small and land on
  different rungs, while the discourse treats its removal as a reveal. Sayette
  et al. (2012, *Psychological Science* 23(8):869–878; 720 social drinkers,
  360/360, three-stranger groups, alcohol/placebo/control over 36 minutes,
  FACS-coded — the placebo arm is what makes it a pharmacological result);
  Bowdring & Sayette (2018, *Addiction* 113(9):1585–1597; k = 16, n = 1,811,
  **d = 0.19** overall, **d = 0.30** opposite-sex, **d = 0.04** same-sex and not
  significant); Hamilton, Armeli & Tennen (2022, *Journal of American College
  Health*; 540 undergraduates — a drink **offer** related to the odds of sex
  controlling for drinking level, while accepted drinks were not, so the signal
  is a cue rather than a dose).
- **3.2 The Typology Shortcut** (under the Interaction Gate; **folded from the
  scout's P2**) — a folk type becomes an instrument the moment it ranks or
  deletes somebody. Chopik et al. (2025, *Innovation in Aging* 9(Suppl 1):1395;
  954 couples, mean age 55.4 — virtually no evidence that love-language matching
  predicts outcomes beyond personality and attachment); Mostova, Stolarski &
  Matthews (2022, *PLOS ONE* 17(6):e0269429; 100 couples across 31
  nationalities — what tracks satisfaction is the **continuous item-level gap**
  between preferred and felt expression, i.e. responsive behaviour rather than a
  shared category); Pittenger (1993, *RER* 63(4):467–488) on the MBTI's warrant,
  with its 1993 scope stated on the page.
- **3.1 The Ambiguity Tax** (under the Interaction Gate, `frameworks.html`) —
  running an interaction has an interpretive price: catching hints, weighing
  tone, grading a soft answer, deciding whether a refusal happened. Canon
  already owns courtship vagueness as a *tactic* (the indirect-game group) and
  as a *shield* (the Plausible Deniability Freeze); it did not own the vagueness
  as a **bill with a distribution**. Crompton et al. (2020, *Autism*
  24(7):1704–1712, 72 participants in nine diffusion chains) locates mixed-pair
  information loss in the *pairing*; Hull et al. (2017, *JADD* 47(8):2519–2534,
  92 autistic adults) prices the camouflaging workaround at exhaustion and
  threats to self-perception; Rowney-Smith et al. (2026, *PLoS One*
  21(1):e0314669, five people in two focus groups, tiered accordingly) reports
  anticipated refusal costing more than refusal. Scope stated on the page:
  neurodivergent courtship is the case that makes the distribution visible, not
  the only place the cost falls.
- **27.1 The Distance Discount** (under the Agreement Surface) — separation read
  as a defect in a bond rather than a feature of its arrangement, discounted
  before anyone looks at the bond. The parent already records a
  structure–satisfaction separation from its CNM meta-analysis; this is the same
  shape from another direction. Jiang & Hancock (2013, *Journal of
  Communication* 63(3):556–577) name the belief in their own abstract and report
  equal-or-greater trust and satisfaction via more adaptive self-disclosure and
  more idealized perceptions; Stafford, Merolla & Castle (2006, *JSPR*
  23(6):901–919) supply the counterweight — about half of separated couples
  reach proximity, the other half end during separation, and **a third of those
  who reunite end within three months**. Both abstracts read verbatim at source.
- **24.1 The Attribution Fork** (under the Desire-State Split) — the Desire-State
  Split establishes that a desire gap belongs to the pair; this entry is about
  the move that comes next. A gap gets located in a body, a person, the
  relationship or the situation, and the location chosen decides who is asked to
  change, whether the remedy is clinical or conversational, and whether the
  other partner is present when the answer is settled. Maxwell et al. (2017,
  *JPSP* 112(2):238–279, six studies, N = 1,896) on sexual growth vs destiny
  beliefs; Thomas & Gurevich (2021, *Feminism & Psychology* 31(1):81–98) on the
  diagnostic frame's default direction; Donnelly (1993) as the origin of the
  frequency measure the discourse converts into an identity.

Both entries were authored as `smv-sub` blocks with `data-parent`, deliberately
**outside** their parents' `rf-entry` blocks: the first draft nested inside, and
the build's whole-block link harvest silently pushed `desire-state-split`'s
`sourceLinks` from 3 to 6. Moving the block fixed the parent rather than moving
the pin.

## 4. Adjudication (sheet: `md/lab-pressure-test-07-threshold-adjudication.md`)

Two full pt04 cycles, each with its own baseline `--dump` before any edit and
its own `--neighbors` regen onto the existing fixture, with the fixture restored
from a pre-sweep copy before every re-sweep. **405 rulings entered** (integration
1: 165 — 11 weak A / 130 weak R / 23 loss-A / 1 credible REJECT; integration 2:
97 — 2 weak A / 81 weak R / 13 loss-A / 1 credible REJECT; integration 3: 143 —
108 weak R / 33 loss-A / 1 credible REJECT / 1 credible loss-A). **Both credible
verdicts were held as recommendations at first report; Jason then delegated
pt07's credible-line adjudication to Claude in session, so they are entered as
rulings and nothing is outstanding.** `ruledBy` stays `Claude` — the delegation
is recorded in the adjudication sheet rather than by attributing a verdict to
Jason that he did not personally make. Neither REJECT triggers a targeted
fixture pin: neither pair is one the canon wants at any threshold, so there is
no prior behaviour to preserve. 6/6 new misreadings fire
Contradicts end-to-end at High (0.733–0.739). Magnet check: zero verbatim corpus
occurrences for every new alias. Census lane grew 14,354 → 16,181, recorded.

**Five credible-line false positives were removed by revising the authored
surface before shipping, never by a pin or a threshold**, and the pt06 lessons
predicted three of them exactly:

1. A boundary carrying the high-IDF word *conceptual* put a bibliography line at
   0.561 credible. Reworded; crossing gone.
2. A long parenthetical example list in a synopsis added retrieval mass across
   sixteen corpus sources. Examples moved to a callout (not match surface); weak
   gains 187 → 156, credible 2 → 1.
3. **The pt06 short-unit token pair fired live.** The 8-token corpus sentence
   "He also has to be your only romantic partner." hit the new entry at **0.608
   credible** because two of its misreadings carried *romantic* **and**
   *partner*. Carrying only one of the pair dropped weak gains 158 → 104 and
   credible 5 → 3, and killed a second FP at 0.470 with the same edit.
4. A boundary phrase *five participants … no effect size* reached a methods
   sentence at 0.454. Reworded to *five people … no magnitude estimate*;
   credible 3 → 2, neither remaining row on a new entry.

## 5. Deliberately NOT implemented — and Jason's rulings on each

**Jason ruled on all three open items on 2026-08-06, approving the recommended
disposition for each.** They are therefore settled decisions, not integrator
recommendations awaiting review. The rulings are recorded inline below.


- **The lane-F entry. RULED: Jason approved holding it (2026-08-06)** — it stays HELD until a primary source is read at source; media-reported figures do not license authoring. *The unsevered bond* — an ending that removes a partner
  from the world without removing them from the relationship, where `sixth-rung`
  owns exit and re-entry but assumes the prior bond is over. Now carried by
  **two captures across two outlets** (cycles 6 and 9) and drafted in the
  findings file, but **not implemented**: neither capture supplies a primary
  source that has been read at source, and authoring a doctrine entry on
  media-reported evidence alone is what the pt04 verification step exists to
  prevent. Lane H took the one remaining integration slot because it was the
  stronger case — a total coverage hole against a partial one.
- **Dargie et al. (2015)'s figures.** Its citation checks out at Crossref
  exactly as the capture reported; its abstract was unreadable at both the
  publisher and Semantic Scholar, and the PMID a search offered belongs to a
  different 2015 *JSMT* article. So N = 1,142, the 56.6% stereotype figure and
  the "few differences" finding stayed capture-reported, and **no number from it
  appears on the page** — it is named as a same-direction replication only.
  - Superseded note: at the two-hour close this section read "lanes F and H were
    not reached." That was true then. The one lane-H URL abandoned during the
    main run was constructed rather than found and 404'd; the capture that
    eventually ran came from a searched URL.
- **P1, the Verification Stack — DEFERRED, not rejected. RULED: Jason approved the deferral (2026-08-06).** It stays deferred until the three gating documents can be read at source, and its Tier 1 leg is repaired or re-tiered before any fold. Jason's fold
  instruction set an explicit precondition: re-read *both full Whitty papers and
  Ofcom's technical report* before adding named stages, accuracy rates,
  predictor sizes or efficacy estimates. That precondition is unmet. The Whitty
  2019 abstract verifies cleanly (261 participants; several correlates of
  accuracy; detection was difficult; the paper itself proposes adding a "human
  detection of scam versus genuine profiles" stage) but neither full paper is
  readable, and Ofcom's technical report is bot-walled — the same wall the scout
  logged as `abandoned(bot-blocked)` in the ledger before citing the RCT's
  figures anyway. **The entry's whole substance is the staged model, which is
  exactly what the precondition gates**, so folding a version stripped of stages
  and rates would ship the shell and lose the point. The proposal is good and
  should be folded when someone can read those three documents. Its **only
  Tier 1 leg cannot stand on an unfetched source** and must be repaired or
  re-tiered first.
- **Lane A, dating and matchmaking television — the scout's "no doctrine
  needed" verdict is preserved.** The Meeting Channel already owns pool
  composition and screening order; the Third-Party Layer is an adjacent analogy
  only, since its evidence concerns social-network approval rather than
  commercial producers. A critic's review, a confounded 169-season
  reconstruction and attributed lawsuit allegations do not create or extend
  doctrine. Production control, casting, compensation, editing, participant
  safety and observed outcomes stay separate variables. **No canon change**, and
  that is the correct outcome rather than a shortfall.
- **The common-bigram magnet class. RULED: Jason approved a dedicated measured pass (2026-08-06)** — the alias audit gets its own baseline, sweep and adjudication rather than riding on a doctrine commit. Starting point in `md/pt07/claude-findings.md`, with the caveat recorded there that `lab-corpus/` is the wrong population for the media-facing risk. The `sexual desire` alias magnet (see §6.1) is the first target. It is an authored-surface
  defect with a clean measured fix available — the alias `sexual desire decline`
  on `desire-maintenance-split` — but changing it is a scoring change to an
  entry this run did not otherwise touch, and it deserves its own baseline,
  sweep and adjudication rather than a ride on a doctrine commit. pt06 deferred
  its `dating coach` magnet on the same reasoning.
- **Donnelly's 16% / N = 6,029.** Widely restated and almost certainly correct,
  but the abstract returned 403 at both Taylor & Francis and JSTOR. The paper is
  cited for the definitional point only; no figure from it appears on the site,
  and the page states why.

## 6. Instrument findings (recorded, not fixed here)

0. **The 0.540 exact-phrase magnet is a general defect class, not three
   coincidences.** A canon entry whose title or alias is a common English
   bigram becomes a magnet on that bigram, pinning any sentence containing it
   at **exactly 0.540 Medium** regardless of meaning. Isolated and reproduced
   for `frameworks:the-wall`: "She hung the photographs on the wall above the
   couch in the living room" → 0.540, `whyMatched: Exact phrase: "the wall"`,
   while "He painted the garden wall last summer" → **no candidate**, so the
   trigger is the bigram and not the word. This subsumes pt06's "Wall Street
   Journal" observation, which was recorded then as a finance-adjacency
   artifact — it was not; it was this. Confirmed instances: `the wall`,
   `sexual desire` (below), and pt06's `dating coach`. The remedy is an alias
   audit for common-bigram surfaces with its own baseline and adjudication,
   deliberately not attempted in this run.
1. **The `sexual desire` exact-phrase magnet, measured across three captures.**
   `frameworks:desire-maintenance-split` carries the alias `sexual desire
   decline`, whose leading bigram is a generic domain term. Every sentence
   containing "sexual desire" lands on that entry at **exactly 0.540 Medium**
   regardless of content: 9 of 13 mapped rows in cycle 1, **17 of 21** in cycle
   3, including "Sexual desire is unique to each person" and "Sexual desire is
   not a problem to be solved." Cycle 2 is the control — an article on the same
   subject that never uses the phrase produced zero rows on the entry. The magnet
   also **displaces correct matches**: the cycle-1 thesis sentence is a
   discrepancy claim that `desire-state-split` scored 0.487 and the magnet took
   at 0.540. Same class as pt06's `dating coach` finding, with a much larger
   measured footprint (the corpus carries 234 occurrences of the bigram).
2. **A reproducible whole-capture zero with the domain gate passing.** Cycle 5:
   28 claim units, **not one candidate at any score**, `adjacentDoctrine` empty.
   Both probe sentences re-tested in isolation classify **relevant** at the gate
   and still reach nothing, so this is coverage, not gating. Canon carries 22
   entries mentioning rejection and every one of them is sender-side — how to
   approach and how to read the answer. Nothing addresses the receiver's
   interpretive cost.
3. **The domain gate handles neurodivergent-dating discourse correctly** — 20
   relevant / 6 uncertain / 22 ignored in cycle 4, with no sign of the wholesale
   binning pt04 saw on therapy vignettes and pt06 saw on step-parenting. That
   was the lane's second question and it is a clean negative result.
4. **Two more false positives at displayed Medium on single tokens:** "This
   rejection was a turning point in Dawn's relationship" →
   `when-standards-become-a-shield` at 0.577 (on *rejection*), and "Desire can be
   cultivated at any stage of life" → `stat-remarriage-gap` at 0.615 (on *stage
   of life*). Plus a four-word transition, "Online dating has its own set of
   challenges," taking the **top** score of its capture at 0.654 on
   `signal-cost-rule`.
5. **Extraction offenders for the protocol's drop list.** The Conversation's
   inline "Love IRL / Quarter Life" series-promo block sits *inside* the article
   body and produced 3 claim-like units in cycle 4. Psychology Today needs three
   separate handles on one outlet: `pathways_card` (renders **twice**, top and
   foot), `card-group[^"]*` — **the modifier classes matter**, cycle 5's
   "Essential Reads" residue was not a second widget but a drop pattern too
   narrow to match `card-group--condensed card-group--border-bottom d-lg-none` —
   and a cut at an inline "Other Reads" `<ul>` of author self-links, which no
   drop pattern reaches because it is not a container at all.

## 7. Verification

- `npm run test:lab`: 18/18 (**exit 0**) on both integration commits, read from
  the real exit code. Floors, ratchets and frozen benchmarks untouched; no test
  value moved except the four authored count pins, twice (566 → 568 concepts,
  63 → 65 Rules & Frameworks, 566 → 568 misreadings, 533 → 535 boundaries).
- Commits: `4b12d36`+`cb253ea` (integration 1) · `e2d215c`+`154935a`
  (integration 2) · `dbdf21b`+`745eaf7` (integration 3) · `47788f9`+`c3bbf65`
  (the scout fold) plus the record commits. **Pushed to `origin/main` at
  `fa8b140` on Jason's explicit in-session approval**, suite 18/18 exit 0
  against the exact tree that went up.
- **Scout artifacts deleted from the working tree at Jason's instruction**
  (2026-08-06), their purpose served: `md/pt06/chatgpt-handoff.md` and all four
  pt07 scout files — `md/pt07/chatgpt-findings.md` and the three
  `chatgpt-proposal-*.md`. The four pt07 files were committed first and are
  therefore **recoverable in full from git history**, which is the point of
  having folded them before tidying:

  ```
  git show 47788f9:md/pt07/chatgpt-findings.md
  git show 47788f9:md/pt07/chatgpt-proposal-verification-stack.md
  git show 47788f9:md/pt07/chatgpt-proposal-typology-shortcut.md
  git show 47788f9:md/pt07/chatgpt-proposal-courtship-buffer.md
  ```

  That matters most for **P1**, which is deferred rather than finished: whoever
  folds it should restore the proposal from `47788f9` rather than rebuild it.
  Everything load-bearing from P2 and P3 already lives on the page and in §3.
  `md/doctrine-distillation-handoff.md` is not a scout artifact and is linked
  from `md/INDEX.md`, so it stays.
- The extension hour changed no canon surface, no test and no fixture: it closed
  the adjudication as documentation and added two analyzed captures. Canon
  stands at 568 and the suite at 18/18, exit 0.


---

# pt07/PROTOCOL.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt07/PROTOCOL.md`

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


---

# pt07/KICKOFF.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt07/KICKOFF.md`

# PT07 kickoff prompts — paste one into each FRESH session, then start both

Both sessions run simultaneously on this checkout for at least TWO hours.
Start them within a few minutes of each other. Integrator model: Claude
**Opus 5**, effort/thinking set to **high**.

---

## Prompt 1 — Claude (fresh session, Opus 5 high effort, integrator). Paste as a `/loop` command:

```
/loop Run pressure-test 07 as the INTEGRATOR, self-paced, for at least two hours.

Read md/pt07/PROTOCOL.md first — it is the collision contract for this run (a
ChatGPT/Codex session is working the same checkout in parallel as scout).
Method precedent: md/doctrine-pressure-test-04.md executed two-handed in
pt05 and pt06. Your lanes: E desire-discrepancy discourse (dead bedrooms,
sexless-marriage media) · F dating after loss (widowhood re-entry, grief and
new partners) · G neurodivergence and dating (autism/ADHD dating discourse —
also a domain-gate stress test) · H long-distance and digital-first
relationships (LDR discourse; LAT is already owned, LDR is not).

Each cycle: claim an article in md/pt07/CLAIMS.md (re-read it immediately
before appending; keep the file UTF-8), fetch + extract with
tools/extract-source-text.mjs to your scratchpad (drop promo/recirculation
furniture — the protocol lists known offenders and bot-walled outlets), run
node fixtures/run-analyzer.mjs recording the canon version per capture, judge
the output (covered / gap / instrument finding / correctly unmapped), and log
it in md/pt07/claude-findings.md with URL, words, SHA-256, canon version,
mapped %.

Every 2-3 cycles, integrate: fold your gaps plus any md/pt07/chatgpt-*
proposals that clear the encompassing standard through the full pt04
procedure: baseline --dump FIRST, entries + overlay + rebuilt index + moved
pins in one commit suite-green, sweep --baseline --neighbors onto the
existing fixture (indent-2 JSON), rule all weak crossings, enter credible
rulings as recommendations FLAGGED FOR JASON, probe misreadings fire
Contradicts, check the analyzer-demo pins after any alias change (fix the
authored surface, never the pin), magnet-check new aliases against the
corpus, then the generatedAt stamp commit. Re-verify every load-bearing
proposal figure at its primary source before folding. Remember the pt06
lessons in the protocol: misreading/boundary text is live match surface
(re-sweep after any edit); avoid probe-template vocabulary in authored prose;
check short corpus sentences for 2-token collisions with new surfaces before
shipping. You are the ONLY agent who touches canon surfaces, tests/, the
fixture, or git commit. Stage only your paths; ChatGPT's uncommitted
md/pt07/chatgpt-* files stay out of your commits until you deliberately fold
them (its findings file only after its closeout). Read the suite's exit code,
never grep its output. NEVER push without Jason's in-session confirmation.

Keep looping — claim, analyze, verdict, integrate — until at least two hours
have passed, then write the run record (md/doctrine-pressure-test-07.md +
INDEX.md rows + mission-notes ledger row) and report: gaps found, entries
shipped, credible rulings awaiting Jason, instrument findings, and what you
deliberately did NOT implement.
```

---

## Prompt 2 — ChatGPT/Codex (fresh session, scout). Paste directly:

```
You are the SCOUT for pressure-test 07 on The Love Equations repo, working
this checkout concurrently with a Claude integrator session for at least two
hours. Read md/pt07/PROTOCOL.md first — it is the collision contract and it
binds you. Your lanes: A dating shows and matchmaking TV as a formation
channel · B romance scams, verification, and dating safety practice
(M-TBD-65 is an open question to pressure, not settled ground) · C folk
typologies as screening instruments (astrology, MBTI, love-languages
matching — pop-CLINICAL labels are already owned by the Diagnostic Turn;
folk typing is your probe) · D sober dating and alcohol's exit from
courtship (venue loss is owned by the third-spaces deep-dive; alcohol's role
in pairing is your probe).

You are read-only against the repo except: appending claim lines to
md/pt07/CLAIMS.md (keep it UTF-8), and creating NEW files under md/pt07/
prefixed chatgpt- (your findings file and any proposals). No mutating git
commands, no edits to site pages, data/, tests/, tools/, lab-corpus/, or
Claude's files. Claude is the sole committer.

Each cycle (~15-20 min): claim an article in the ledger (re-read immediately
before appending); fetch raw HTML to your own temp dir OUTSIDE the repo
(Fast Company and Axios are Cloudflare bot-walled — have a fallback outlet
per lane); extract with tools/extract-source-text.mjs recording the SHA-256,
dropping promo/recirculation furniture; run node fixtures/run-analyzer.mjs
--source <txt> --out <temp>/<slug>.json and record the canon version from
the summary line; judge the output like a reviewer; log verdict (covered /
gap / instrument / correctly unmapped) in md/pt07/chatgpt-findings.md with
URL, words, SHA-256, canon version, mapped %.

For gaps, write PROPOSALS to the encompassing standard in PROTOCOL.md (one
big-picture subject, 2-4 sourced tiered claims, concept-naming aliases, 1-3
contract-compliant misreadings — 10-18 words, no negators, a relational-frame
word, none of married/marries/chosen/dates — boundaries, deliberate
nonclaims). Verify corpus-verifiable stats verbatim against lab-corpus/
before proposing; cite primary sources with DOIs where they exist — the
integrator re-verifies before folding. "No doctrine needed" is a valued
verdict.

At the two-hour mark, close out: sequential ledger + findings QA, recomputed
hashes, a summary section with verdict tally and proposal list, and a handoff
note for the integrator. Your findings file stays uncommitted until the
integrator deliberately folds it after your closeout.
```


---

# pt07/CLAIMS.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt07/CLAIMS.md`

# PT07 claims ledger

Append-only. One line per article: `- [agent] [lane] [URL] [status]`.
Re-read this file immediately before appending. Statuses: claimed → analyzed → verdict(covered|gap|instrument|novel) · abandoned(reason).
Keep this file UTF-8.
- claude E https://www.psychologytoday.com/us/blog/the-psychology-of-relationships-and-emotional-intelligence/202409/dealing-with-a-sexless verdict(instrument+gap-candidate)
- claude E https://www.vice.com/en/article/deadbedrooms-reddit-forum-advice/ verdict(gap+instrument)
- chatgpt A https://time.com/5782392/love-is-blind-review-netflix-reality-tv/ claimed
- claude E https://theconversation.com/womens-sexual-desire-often-goes-undiscussed-yet-its-one-of-their-most-common-health-concerns-207654 verdict(gap+instrument)
- chatgpt A https://time.com/5782392/love-is-blind-review-netflix-reality-tv/ verdict(instrument)
- chatgpt B https://www.ic3.gov/PSA/2024/PSA240426 claimed
- chatgpt B https://www.ic3.gov/PSA/2024/PSA240426 verdict(gap)
- chatgpt C https://www.allure.com/story/bumble-dating-app-astrology-sign-filter claimed
- chatgpt C https://www.allure.com/story/bumble-dating-app-astrology-sign-filter verdict(gap)
- chatgpt D https://time.com/7205261/consider-sober-dating-essay/ claimed
- chatgpt D https://time.com/7205261/consider-sober-dating-essay/ verdict(gap)
- chatgpt B https://apnews.com/article/5317e9f8d707519d638bd2ea751dcc96 claimed
- chatgpt B https://apnews.com/article/5317e9f8d707519d638bd2ea751dcc96 verdict(gap)
- chatgpt B https://www.ofcom.org.uk/online-safety/online-fraud/harnessing-the-power-of-serious-games-to-protect-people-against-romance-fraud claimed
- chatgpt B https://www.ofcom.org.uk/online-safety/online-fraud/harnessing-the-power-of-serious-games-to-protect-people-against-romance-fraud abandoned(bot-blocked)
- chatgpt B https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-frauds-and-scams/romance-scams claimed
- chatgpt B https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-frauds-and-scams/romance-scams abandoned(bot-blocked)
- chatgpt B https://consumer.ftc.gov/articles/what-know-about-romance-scams claimed
- chatgpt B https://consumer.ftc.gov/articles/what-know-about-romance-scams verdict(gap)
- chatgpt B https://wrap.warwick.ac.uk/id/eprint/81506/ claimed
- chatgpt B https://wrap.warwick.ac.uk/id/eprint/81506/ verdict(gap)
- claude G https://theconversation.com/why-dating-can-be-tough-for-autistic-people-and-what-may-make-it-easier-257534 verdict(gap-candidate+instrument)
- chatgpt C https://academic.oup.com/innovateage/article/doi/10.1093/geroni/igaf122.1395/8412327 claimed
- chatgpt C https://academic.oup.com/innovateage/article/doi/10.1093/geroni/igaf122.1395/8412327 abandoned(bot-blocked)
- chatgpt C https://pmc.ncbi.nlm.nih.gov/articles/PMC12762657/ claimed
- claude G https://www.psychologytoday.com/us/blog/beyond-mental-health/202406/when-rejection-sensitivity-meets-the-dating-scene verdict(gap+instrument)
- chatgpt C https://pmc.ncbi.nlm.nih.gov/articles/PMC12762657/ verdict(gap)
- claude H https://theconversation.com/long-distance-relationships-are-more-common-than-you-think-and-they-often-work-out-well-217770 abandoned(404 — URL guessed, never fetched; lane H not reached)
- chatgpt C https://www.koreatimes.co.kr/opinion/20230627/obsession-with-mbti claimed
- chatgpt C https://www.koreatimes.co.kr/opinion/20230627/obsession-with-mbti verdict(gap)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC10488308/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC10488308/ verdict(gap)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC5462438/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC5462438/ verdict(gap)
- chatgpt A https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1219915/full claimed
- chatgpt A https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1219915/full verdict(instrument)
- chatgpt C https://pmc.ncbi.nlm.nih.gov/articles/PMC9216579/ claimed
- chatgpt C https://pmc.ncbi.nlm.nih.gov/articles/PMC9216579/ verdict(gap)
- chatgpt B https://wrap.warwick.ac.uk/id/eprint/108466/ claimed
- chatgpt B https://wrap.warwick.ac.uk/id/eprint/108466/ verdict(gap)
- claude F https://www.psychologytoday.com/us/blog/in-the-name-of-love/202405/married-to-two-people-the-romantic-life-of-widows verdict(gap)
- claude H https://www.psychologytoday.com/us/blog/meet-catch-and-keep/201505/can-long-distance-relationships-really-work verdict(gap)
- chatgpt B https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1118741/full claimed
- chatgpt B https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1118741/full verdict(covered)
- chatgpt A https://time.com/6323622/love-is-blind-season-5-finale/ claimed
- chatgpt A https://time.com/6323622/love-is-blind-season-5-finale/ abandoned(http-406)
- chatgpt A https://www.theguardian.com/tv-and-radio/2024/jan/03/love-is-blind-netflix-dating-show-lawsuit-renee-poche claimed
- chatgpt A https://www.theguardian.com/tv-and-radio/2024/jan/03/love-is-blind-netflix-dating-show-lawsuit-renee-poche verdict(instrument)
- claude H https://www.npr.org/2020/08/26/906236738/long-distance-relationships-are-tough-heres-advice-for-making-them-work verdict(gap)
- chatgpt D https://journals.sagepub.com/doi/10.1177/0093650203260202 claimed
- chatgpt D https://journals.sagepub.com/doi/10.1177/0093650203260202 abandoned(bot-blocked)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC9768094/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC9768094/ verdict(gap)
- claude F https://www.vice.com/en/article/dating-grief-love-after-death/ verdict(gap+instrument)


---

# pt07/claude-findings.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt07/claude-findings.md`

# PT07 — Claude findings (integrator lane)

Run of 2026-08-06. Method: `md/doctrine-pressure-test-04.md`; contract:
`md/pt07/PROTOCOL.md`. Lanes E–H. Model: Opus 5, high effort.

## Cycle 1 — lane E — Psychology Today: Dealing With a Sexless Relationship

- URL: https://www.psychologytoday.com/us/blog/the-psychology-of-relationships-and-emotional-intelligence/202409/dealing-with-a-sexless
- Words: 855 · SHA-256: `813a7e176acf2ac2b335487d48685c2b6124a98ee7599b28657ee9510b753256`
- Canon at capture: `1.0.0+c4f092f8c7d3` (566)
- Analyzer: 32 passages · 32 claims · 13 mapped · mappedShare **40.6%** · 7 tensions
- Extraction: container `blog-entry--body`; dropped the `pathways_card` widget
  (it renders TWICE — a `d-none d-xl-block` copy at the top and a `d-xl-none`
  copy at the foot), the card-group recirculation rail, the subscribe form,
  the references block and the author card; cut at the share sheet.

**Reading.** The headline number is misleading. **Nine of the 13 mapped rows
are the same entry, `frameworks:desire-maintenance-split`, at the same score,
0.540 Medium** — every sentence in the article containing the bigram "sexual
desire" and nothing else in common. `whyMatched` is identical across them:
`Exact phrase: "sexual desire"` + `Distinctive overlap: sexual, desire`. The
remaining rows are one defensible neighbour (the 20–40% dissatisfaction stat →
`statistics:stat-sex-recession`, 0.434 Low — adjacent, not the same claim) and
one clean hit (`lexicon:term-the-spark` on "the spark was lost", 0.540).

The magnet also **displaced a correct match**: the article's thesis sentence —
"The defining factor of a couple's erotic pleasure is compatibility of libido,
or sexual desire" — is a discrepancy claim, which `desire-state-split` owns
(its alias list carries `sexual desire discrepancy`). `desire-state-split`
scored it 0.487; the magnet took the row at 0.540. All seven tensions fire on
magnet rows, so their `canonId` inherits the wrong entry too.

**Canon check.** `desire-maintenance-split` owns decline over duration;
`desire-state-split` owns spontaneous vs responsive timing and "the
discrepancy belongs to the pair." What this article is actually organised
around is neither: it is an **attribution taxonomy** — low desire sorted into
external/somatic causes (health, medication, fatigue, post-partum, young
children, sleep, menopause) versus relationship-generated causes (timing,
nonsexual touch withdrawal, unresolved conflict, body image, disappointment) —
with the prescriptive payload that the two categories license *opposite*
responses: for the external category, "it is counterproductive to argue about
sex or demand more intimacy"; for the relational category, negotiation and
repair are exactly the move. Canon has no entry on where a couple *locates*
the cause, and the discourse's whole practical weight sits there.

**Verdict: INSTRUMENT FINDING (magnet, real and displacing) + GAP CANDIDATE
(desire attribution), HELD** — one article is not the encompassing standard;
holding for further lane-E cycles.

## Cycle 2 — lane E — VICE: Is Your Sex Life Dead? There's a Subreddit For That

- URL: https://www.vice.com/en/article/deadbedrooms-reddit-forum-advice/
- Words: 1,214 · SHA-256: `b33df44e6f8074b0f54b7f1ccfa182323ad8756ac59838fa6df2496288796e49`
- Canon at capture: `1.0.0+c4f092f8c7d3` (566)
- Analyzer: 23 passages · 23 claims · 5 mapped · mappedShare **21.7%** · 1 tension
- Extraction: container `entry-content-area`; dropped the sharing wrapper, the
  Primis video block and the tag taxonomy; cut at "Follow Us On Discover"
  (VICE's recirculation rail and the $2 membership modal both live below it).

**Reading.** Five mapped rows, and only one is in the right neighbourhood.
"Unequal sex drives are one of the most common reasons for problems in a
relationship" reached `frameworks:commitment-problem` (0.461 Low) — wrong
entry for a discrepancy claim. `frameworks:desire-state-split`, which owns
desire discrepancy and carries the alias `sexual desire discrepancy`, **did
not fire once in the whole capture**, because this discourse never says
"desire discrepancy": it says DB, HL, LL, LL4U, sexless, libido. Three rows
are lexical nearest-neighbour artifacts at Low ("moved in together" →
`M-TBD-45`; "her husband became uninterested in sex" → `stat-provider-norm`).
One is a **false positive at displayed Medium**: "This rejection was a turning
point in Dawn's relationship" → `gender-dynamics:male:…:when-standards-become-
a-shield` at 0.577 — an entry about a man's standards used as a shield,
reached by the single token "rejection."

**Canon check.** Zero verbatim coverage: `dead bedroom`, `libido`, `asexual`,
`HL/LL` appear nowhere in the index; `sexless` appears only in
`stat-sex-recession` / `term-sex-recession` / M-TBD-17 — all about *single*
people not having sex, not partnered desire gaps. What the article surfaces
and canon does not own:

1. **The threshold used as an identity.** "A DB is 'technically' 10 times a
   year or less" — a research operational definition (Donnelly's criterion)
   adopted as a self-applied label, then immediately disclaimed by the same
   community ("there is no normal — it's just about compatibility").
2. **Labels bestowed on an absent partner.** "'Sexual Aversion Disorder' is a
   commonly discussed diagnosis, with members often bestowing this label on
   themselves or off-stage partners." The clinical label is applied to
   somebody who is not in the room and did not consent to the diagnosis.
3. **The disclosure barrier and the venue it creates.** "It can be incredibly
   difficult to discuss it with people you know in real life"; the anonymous
   forum becomes the only speech venue, and it works as "a pressure release
   valve," explicitly not as a repair — one member's own critique is that the
   content is "based on the original posters' feelings," i.e. one-sided.
4. **Initiation extinction.** "before I was worn down by embarrassment and
   rejection" — repeated rejection stops the initiating partner initiating.
   `stat-demand-withdraw` owns the pursue/evade cycle; it does not own the
   terminal state where the pursuer quits.

**Verdict: GAP** (converges with cycle 1) **+ instrument finding** (the
`when-standards-become-a-shield` rejection-token false positive at Medium).
Candidate subject firming: **where a desire gap gets located, and by whom** —
somatic/individual, relational/contextual, or characterological (a label
attached to a person) — with each location licensing a different response and
the labelling usually done from one side, alone.

## Cycle 3 — lane E — The Conversation: Women's sexual desire often goes undiscussed

- URL: https://theconversation.com/womens-sexual-desire-often-goes-undiscussed-yet-its-one-of-their-most-common-health-concerns-207654
- Words: 908 · SHA-256: `484428ecc3aeb8f94d920be6e9b580e47d7fa0dc9689c7322e05b2866b812f4a`
- Canon at capture: `1.0.0+c4f092f8c7d3` (566)
- Analyzer: 35 passages · 35 claims · 21 mapped · mappedShare **60.0%** · 10 tensions
- Extraction: container `content-body content entry-content`; dropped the
  inline-promo skeleton and the related-content container. This capture had no
  "Read more:" cards to drop.

**Reading — the magnet, confirmed and quantified.** 60% mapped is not
coverage. **17 of the 21 mapped rows are `frameworks:desire-maintenance-split`
at exactly 0.540** — including "Sexual desire is unique to each person" and
"Sexual desire is not a problem to be solved," which have nothing to do with
decline over relationship duration. Combined with cycle 1 (9 of 13 at 0.540),
the pattern is unambiguous: the entry's surface carries the exact bigram
**"sexual desire"** (title token + alias `sexual desire decline` + synopsis),
the exact-phrase bonus lands every sentence containing it at 0.540 Medium, and
no competitor gets close. Cycle 2 is the control: an article on the same
subject that never uses the phrase produced **zero** rows on this entry.

Two more false positives at displayed Medium: "Desire can be cultivated at any
stage of life" → `statistics:stat-remarriage-gap` **0.615** (on "stage of
life"), and "affected by an array of factors — including stress, hormones,
physical and mental health, certain medications, lifestyle" →
`hierarchy:a-generic-male:gate-3-life-fit:practical-compatibility` **0.660**,
the highest score in the capture, on a sentence about libido physiology.
`desire-state-split` fired correctly exactly once ("Sexual desire is best
understood as a transient state," 0.582).

**Canon check.** The article's thesis sentence — "low desire isn't a problem
with our bodies" — is **unmapped**, and it is precisely the attribution move.
Its whole structure is a location argument: not the body, but the transient
state, the life transition, the division of household labour, the gender norm,
the objectification. Cycle 1 argued external-vs-relational; cycle 2 showed the
forum locating it in a *person* (LL, "Sexual Aversion Disorder"). Three
captures, three different answers to the same question, and canon owns none of
it: `desire-maintenance-split` owns duration decline, `desire-state-split`
owns timing and "the discrepancy belongs to the pair" — neither owns where the
gap gets *located* or what each location licenses.

**Verdict: GAP — proposal ready** (see integration 1) **+ instrument finding**
(the "sexual desire" exact-phrase magnet, now measured across three captures).

---

## Integration 1 shipped between cycles 3 and 4

`4b12d36` (The Attribution Fork, canon 566 → 567) + `cb253ea` (stamp). Details
in `md/lab-pressure-test-07-threshold-adjudication.md`. Captures from cycle 4
onward run against `1.0.0+7a2150b7a15f`.

---

## Cycle 4 — lane G — The Conversation: Why dating can be tough for autistic people

- URL: https://theconversation.com/why-dating-can-be-tough-for-autistic-people-and-what-may-make-it-easier-257534
- Words: 724 · SHA-256: `ceb12694f21b4c11e35e182569440a6e62fff0c1d77837acb0d838fdbda7e654`
- Canon at capture: `1.0.0+7a2150b7a15f` (567)
- Analyzer: 26 passages · 23 claims · 4 mapped · mappedShare **17.4%** · 0 tensions
- Extraction: same container as cycle 3; cut at the newsletter pitch. Residue:
  The Conversation's inline "Love IRL / Quarter Life" series-promo block sits
  *inside* the article body and produced 3 claim-like units ("Love IRL is the
  latest series from Quarter Life that explores it all"). Recorded as an
  extraction-layer offender to add to the protocol's drop list.

**Domain-gate result — the stress test passes.** 20 relevant · 6 uncertain · 22
ignored. The gate did **not** bin autism-and-dating material the way pt04's
therapy vignettes and pt06's step-parenting register were binned: it reads this
as relationship-formation discourse and lets it through. That is the answer to
the lane's second question, and it is a clean negative result.

**Reading.** One genuinely good row: "hard to strike a balance between fitting
into those unspoken norms and being authentically themselves" →
`pills:page-bp:just-be-yourself` (0.540) — the bluepill dossier earning its
keep on exactly-in-scope material. `deep-dive:third-spaces` at 0.500 on "online
dating could offer a helpful alternative" is a defensible neighbour. The other
three are lexical: "Studies show that autistic people often communicate well
with each other" → `survivorship-channel` (0.540, wrong); "Studies on autism
and dating remain limited" → `saturation-rule` (0.507, wrong); and the
capture's **highest score, 0.654 Medium**, goes to the four-word transitional
sentence "Online dating has its own set of challenges" →
`frameworks:signal-cost-rule` — a short-unit false positive at the top of the
list.

**Canon check.** Canon's formation machinery — the Interaction Gate, the
Signal-Cost Rule, the Hell Yes filter, the Conversion Ladder — all *presuppose*
a reader who can decode implicit signalling. Nothing owns the presupposition
itself. Dark here: the unwritten rules as an interface with a legibility cost;
venue *fit* as distinct from venue loss (the third-spaces deep-dive owns the
disappearance of third places, not the sensory load of the ones that remain);
platforms "designed around neurotypical expectations"; masking as a courtship
tax; and the assortative claim that same-neurotype pairs communicate more
easily.

**Verdict: GAP candidate, HELD** for a second lane-G capture (the ADHD side).
Candidate subject: **the courtship protocol as an interface** — everyone pays a
legibility cost to run it, and the cost is not evenly distributed.

## Cycle 5 — lane G — Psychology Today: When Rejection Sensitivity Meets the Dating Scene

- URL: https://www.psychologytoday.com/us/blog/beyond-mental-health/202406/when-rejection-sensitivity-meets-the-dating-scene
- Words: 697 · SHA-256: `fc3564a5ada1a1826fbbba3f3438f6f8ee8108dc60931322ee79e77685666ddc`
- Canon at capture: `1.0.0+7a2150b7a15f` (567)
- Analyzer: 28 passages · 28 claims · 0 mapped · mappedShare **0.0%** · 0 tensions
- Extraction: same recipe as cycle 1. Residue: PT's "Rejection Sensitivity
  Essential Reads" inline recirculation block survived the `card-group` drop
  and contributed 3 claim-like units — a second PT widget to add to the drop
  list alongside `pathways_card`.

**Attributing the zero before believing it.** 0% mapped, and it is real, not a
display artifact: **not one of the 28 claim units produced a single candidate
at any score** — `adjacentDoctrine` is empty and `matches` is empty on every
segment. Re-run in isolation, "The pain of rejection, a breakup, and unrequited
love are usually some of the most memorable hurts of a lifetime" and "Young
adults with ADHD may need extra support as they enter the dating scene where
rejection is significant" both classify **relevant** at the domain gate and
still reach nothing. So the gate is not the cause — the gate passed this
material, exactly as it did in cycle 4. The canon has no surface in this
neighbourhood at all.

**What the neighbourhood is.** Canon carries 22 entries that mention rejection,
and all of them are about *delivering* an approach and reading the answer — the
Plausible Deniability Freeze, "Weak signals aren't your fault," "A safe answer
buys you no information," M-TBD-3 on taking rejection gracefully. What none of
them touch is the receiving side's *interpretive* cost: how much work it takes
to decide whether a rejection happened, and what a person concludes about
themselves once they decide it did.

**The two lane-G captures converge, and not on what cycle 4 suggested.** Cycle
4 is the cost of encoding and decoding signals (unwritten rules, ambiguous body
language, platform defaults built around one neurotype, masking). Cycle 5 is the
cost of interpreting outcomes. Both are the same underlying fact: **courtship
runs on deliberate ambiguity, and ambiguity has a price that is not the same
for everyone.** Canon already owns ambiguity as a *tactic* (the whole indirect-
game group in Gender Dynamics) and as a *protection* (plausible deniability).
It does not own the ambiguity as a **cost with a distribution** — cheap for
some, and for others the binding constraint on participating at all.

**Verdict: GAP** — proposal drafted as **The Ambiguity Tax** (integration 2).
**+ instrument finding** (a reproducible whole-capture zero with the gate
passing; canon's rejection doctrine is entirely sender-side).

---

## Extension: lanes F and H, worked after the main run closed at 20:44

Jason asked for another hour and delegated pt07's credible-line adjudication to
Claude in the same message. The adjudication was closed first (see
`md/lab-pressure-test-07-threshold-adjudication.md`), then the two unreached
lanes were worked. Both captures run against `1.0.0+48254605825a` (568).

## Cycle 6 — lane F — Psychology Today: Married to Two People: The Romantic Life of Widows

- URL: https://www.psychologytoday.com/us/blog/in-the-name-of-love/202405/married-to-two-people-the-romantic-life-of-widows
- Words: 1,362 · SHA-256: `e3925c6db56b79f7c4a76a14d1f4b2faa139ef5e0e99a3477411970fb158325a`
- Canon at capture: `1.0.0+48254605825a` (568)
- Analyzer: 56 passages · 55 claims · 9 mapped · mappedShare **16.4%** · 3 tensions
- Extraction: the `card-group` drop had to be widened to `card-group[^"]*` —
  Psychology Today's "Relationships Essential Reads" widget carries the
  modifier classes `card-group--condensed card-group--border-bottom d-lg-none`,
  so the exact-class drop used in cycles 1 and 5 missed it. Widening removed 19
  words of recirculation furniture. **This closes the extraction offender
  recorded in cycle 5** — it was never a separate widget, just a drop pattern
  that was too narrow.

**Reading.** Nine mapped rows, eight of them Low and none of them owning the
article. The only Medium (0.534) lands on a **section heading** — "Can a Widow
Love Two People at Once?" → `frameworks:residual-pool`, which is about who is
left in a market, not about loving two people. `smv:looks` at 0.437 on "Second
love is different, but it's very good" and
`game-is-like-learning-a-new-language` at 0.434 on a sentence about crying for
a late husband are pure lexical noise. `frameworks:sixth-rung` at 0.486 on
"bereaved and nonbereaved women when they enter new relationships" is the one
defensible neighbour — Ended does own exit and re-entry.

**A false neighbour on this run's own new entry.** `frameworks:ambiguity-tax`
took 0.438 Low on "we can love one person, then shortly after fall in love with
another." Wrong neighbourhood — nothing there is about interpretive cost.
Recorded rather than authored around: it is a Low row, it displaces nothing,
and one Low false neighbour is the expected price of any added entry.

**Canon check.** `sixth-rung` owns exit and the re-entry discount; it assumes
the prior bond is **over**. `term-the-re-entry-discount` prices the market you
return to. `widows-house` is historical (1900–1959 single motherhood).
`stat-remarriage-gap` owns who re-partners. What none of them own is the
article's whole subject: a bond that ended **physically but not
psychologically**. "Most widows maintained continuing bonds with their deceased
husbands, whereas few of them severed these bonds"; the "three hearts
relationship" where one partner is "physically absent, but psychologically
present"; "love toward the deceased spouse can in fact increase, challenging
the strength of love toward the current partner"; the new partner's own account
("The hardest thing to understand was how the widow I'm dating could still love
him and start to love me"); and the social rule that a widow is expected to be
"above suspicion." All unmapped.

**Verdict: GAP.** Candidate subject — **the unsevered bond**: an ending that
removes a partner from the world without removing them from the relationship,
so re-entry is negotiated with a third party who cannot be negotiated with, and
the ordinary exit doctrine (initiation, asymmetry, the re-entry discount) does
not describe it. Distinct from the divorced case in its *starting point*, which
the article names directly. **HELD** — one capture is not the encompassing
standard, and integration 3 was not started (see below).

## Cycle 7 — lane H — Psychology Today: Can Long-Distance Relationships Really Work?

- URL: https://www.psychologytoday.com/us/blog/meet-catch-and-keep/201505/can-long-distance-relationships-really-work
- Words: 461 · SHA-256: `5d6d4036a53da1522b75908f251231acd4ea0614f7edcff8dbab6a5b3942bc39`
- Canon at capture: `1.0.0+48254605825a` (568)
- Analyzer: 16 passages · 13 claims · 0 mapped · mappedShare **0.0%** · 0 tensions
- Extraction: as cycle 6, plus a cut at the "Other Reads" list — an inline
  `<ul>` of author self-links inside the body, not a card widget, so no drop
  pattern reaches it. Third distinct furniture shape on this one outlet.

**The second whole-capture zero of the run, and the cleanest.** Not one of the
13 claim units produced a candidate at any score. Re-tested in isolation,
"Long-distance couples report as much intimacy and commitment as couples who
live near each other" and "About half of people assume a long-distance
relationship is less satisfying than a nearby one" both reach **nothing**.

**And the reason is not subtle.** A verbatim scan of the built index returns
**zero entries containing "long-distance" or "long distance"** — not an alias,
not a phrase, not a synopsis, not a boundary. `term-living-apart-together-lat`
owns LAT (separate households, same locality) and the protocol already flagged
that LAT is not LDR. The canon has no surface for distance at all.

What the capture surfaces: 56.6% of people perceive LDRs as less happy and
satisfying; Dargie, Blair, Goldfinger & Pukall (2015, *Journal of Sex & Marital
Therapy* 41(2):181–202, N = 1,142) found few differences from geographically
close relationships across intimacy, satisfaction and commitment; the
moderators that do predict quality are psychological distress, relationship
certainty and — notably — *beliefs about LDRs themselves*; and greater distance
predicting **more** positive evaluation, which the authors read as possible
cognitive dissonance.

**Verdict: GAP, and a coverage hole rather than a doctrine subtlety.**
Candidate subject — **the distance discount**: a widely-held penalty belief
about a relationship structure that the measured evidence does not support,
where the belief itself is one of the moderators. That shape rhymes with
`stock-flow-error` and the Mythbuster docket, and the stereotype-versus-measure
gap is exactly the site's genre. **HELD** for the same reason as cycle 6.

## Why no integration 3

Both gaps are real and both proposals are drafted above. Neither was
implemented. A full pt04 cycle — baseline `--dump`, authoring, rebuild, pins,
sweep, rule every crossing, suite, two commits — has taken 35–45 minutes each
time in this run, and starting one inside the last fifteen minutes of a
timeboxed hour would have left a half-integrated canon and an unruled fixture
in a checkout a second agent is actively working. Each candidate also wants a
second capture before it clears the encompassing standard. The load-bearing
figures above are **as reported by the captures and not yet re-verified at
primary source** — Dargie et al. 2015 in particular must be checked before any
of its numbers reach a page.

### Partial discharge of the lane-H verification commitment

Dargie, Blair, Goldfinger & Pukall (2015) was chased at source in the last
minutes of the extension hour. Result, stated exactly:

- **Citation VERIFIED at Crossref** — "Go Long! Predictors of Positive
  Relationship Outcomes in Long-Distance Dating Relationships," *Journal of Sex
  & Marital Therapy* 41(2):181–202, DOI `10.1080/0092623x.2013.864367`, four
  authors in the order the capture reported. The capture's bibliography line was
  accurate.
- **Figures NOT verified.** Semantic Scholar holds no abstract for the DOI, and
  the paper is not retrievable under the PMID a search suggested (that PMID is a
  different 2015 *JSMT* article on pregnancy and sexual function — a near-miss
  worth naming, because it would have been an easy wrong citation to accept).
  So **N = 1,142, the 56.6% stereotype figure, and the "few differences from
  geographically close relationships" finding all remain capture-reported
  only.** None may reach a page until read at source.

That is the whole point of the pt04 re-verification step: the citation was
sound and the numbers are still unconfirmed, and those are two different
states. The distance-discount proposal stays HELD with its evidence marked
accordingly.

## Cycle 8 — lane H — NPR Life Kit: Long-distance relationships are tough

- URL: https://www.npr.org/2020/08/26/906236738/long-distance-relationships-are-tough-heres-advice-for-making-them-work
- Words: 1,078 · SHA-256: `90e14c3242914a94ed2dd6fe8557d69bc49e63d85f5b1c4d7419271bc0a4b42c`
- Canon at capture: `1.0.0+48254605825a` (568)
- Analyzer: 28 passages · 27 claims · 2 mapped · mappedShare **7.4%** · 0 tensions
- Extraction: `storytext` container; dropped image/ad buckets, cut at the
  voicemail solicitation.

Second lane-H capture, same verdict. Both mapped rows are wrong: 0.576 Medium
on `M-TBD-27` for a bare quotation fragment, and — the notable one —
`get-a-hobby-is-code-for-give-up` at 0.476 on "But Jackson says that's no way
to think about long-distance relationships at all," which is a **false positive
whose only real overlap is the phrase the canon has no entry for.**

## Integration 3 — attempted, REVERTED, then finished and SHIPPED

With two lane-H captures and two primary sources verified verbatim at source
— Jiang & Hancock (2013, *Journal of Communication* 63(3):556–577,
DOI `10.1111/jcom.12029`) and Stafford, Merolla & Castle (2006, *JSPR*
23(6):901–919, DOI `10.1177/0265407506070472`) — **The Distance Discount** was
authored as a sub-entry of the Agreement Surface, whose CNM meta-analysis
already records a structure–satisfaction separation of exactly the same shape.
Canon reached 569, and the work is **not in the tree**.

What happened, in order:

1. First sweep: **3 credible-line false positives**, all from authored surface —
   a `trust and satisfaction` pair in the synopsis, the alias `living far
   apart` colliding with the corpus's living-apart-together passage, and a
   7-token sentence ("I am someone who is looking for love.") at 0.452, the
   short-unit hazard for the third time this run.
2. One misreading also failed the contract check outright — **GATE SET ASIDE**,
   the failure mode `tools/check-mis.mjs` exists to catch: the sentence never
   formed a domain-relevant claim unit, so it could not have fired in either
   direction.
3. Surfaces revised, re-swept: credible gains fell 3 → 1, misreading replaced
   and passing. 126 crossings ruled.
4. Then `tests/lab-analyzer.test.mjs` subtest 12 failed — the demo-routing pin,
   `mappedClaimSegments` 6 → 7. **The new entry was consuming one of the demo
   transcript's research-residue claims**, which is precisely what that pin
   exists to prevent.

The pt06 rule is that a tripped demo pin is fixed in the authored surface and
never in the pin. That is a diagnose-reword-resweep-rerule cycle, and roughly
five minutes of the timebox remained. Committing a red suite was not an option,
and neither was leaving a half-integrated canon and a part-ruled fixture in a
checkout the scout is still working. So the whole integration was reverted:
`git checkout --` on the five integrator paths, index rebuilt, **suite 18/18
exit 0, canon back to 568**.

**Then the timebox turned out to have more room than I had estimated**, and the
entry was finished on the second attempt — `dbdf21b` + `745eaf7`, canon 569,
suite 18/18 exit 0. The demo-pin diagnosis took one run of the demo transcript:
the entry was capturing the residue claim *"Did it show causation, or did
compatible couples simply report more shared…"* on the trio
**couples / report / share**, all three of which sat in the synopsis. Rewriting
that one sentence restored the pin to 6 / 5 / 54.5% exactly.

Two things this cost, worth recording. `tools/check-mis.mjs` then caught the
first misreading twice as **GATE SET ASIDE** — removing "couple" to dodge the
demo collision had also removed the relational-frame word the domain gate
needs, and "Two partners…" restored it. And a 7-token corpus sentence, "I am
someone who is looking for love.", hit 0.452 credible: the short-unit hazard
for the **third** time in this run, on a third unrelated entry.

## Cycle 9 — lane F — VICE: Do You Believe in Love After Loss?

- URL: https://www.vice.com/en/article/dating-grief-love-after-death/
- Words: 5,584 · SHA-256: `a807b16d3ecad32b1ac3c8eb164fcfef02f0457150ab556de6fbf627648867ca`
- Canon at capture: `1.0.0+c08dbe01725d` (569)
- Analyzer: 84 passages · 83 claims · 10 mapped · mappedShare **12.0%** · 1 tension

**Second lane-F capture, and it confirms cycle 6.** Ten mapped rows out of 83
claims, and the unmapped remainder is the whole subject again: continuing
bonds, the new partner's position relative to someone who cannot be argued
with, the social licence question ("We celebrate when older couples find love
again"), and the yibbum/levirate material — a *named institutional* answer to
exactly the problem the entry would describe, which canon does not carry.
`frameworks:readiness-gate` at 0.730 High on "Are you providing support, and
how is that emerging, and what may happen…" is the one strong, correct row.
`pills:face-pill` at 0.603 on "I never had to sit and explain my relationship
to him" is a false positive at the capture's second-highest score.

**The unsevered-bond proposal is now fold-ready** on two captures across two
outlets. It still needs primary sources located and verified before authoring;
neither capture supplies one that has been read at source.

### Instrument finding — the 0.540 exact-phrase magnet, generalised

`frameworks:the-wall` fired **twice at 0.540 Medium** here on sentences using
*wall* in its ordinary sense — "He's not upset that I have pictures of him on
the wall." Isolated and reproduced:

> "She hung the photographs on the wall above the couch in the living room."
> → `frameworks:the-wall` **0.540 Medium**, `whyMatched: Exact phrase: "the wall"`

> "He painted the garden wall last summer with his brother."
> → **no candidate at any score**

So the trigger is precisely the bigram **"the wall"**, not the word. That is
the *same mechanism and the same score* as this run's cycle-1/3 finding, where
the alias `sexual desire decline` made `desire-maintenance-split` a magnet on
"sexual desire" and pinned 17 of 21 rows at 0.540. And it subsumes pt06's
"Wall Street Journal" observation, which was read then as a finance-adjacency
artifact — it was not. It was this.

**The generalisation, stated for a future measured pass:** *a canon entry whose
title or alias is a common English bigram becomes an exact-phrase magnet,
pinning every sentence containing that bigram at 0.540 Medium regardless of
meaning.* Two confirmed instances (`the wall`, `sexual desire`) plus pt06's
`dating coach`. The fix is authored-surface work with its own baseline and
adjudication — an alias audit for common-bigram surfaces across the canon —
and it is deliberately **not** attempted here.

### Sizing the magnet class — a census, with its own limits stated

A measurement, not a change. Every bigram inside every canon title and alias
(2,399 distinct) was counted verbatim against `lab-corpus/`. Two things came
out, and the second matters more than the first.

**What it found.** Content-word bigrams carried by canon surfaces with heavy
corpus exposure, i.e. the candidates that would behave like `sexual desire`:

| corpus hits | bigram | entries carrying it |
|--:|---|--:|
| 156 | `mate value` | 2 |
| 116 | `sex ratio` | 4 |
| 97 | `sexual desire` | 2 (**confirmed magnet**) |
| 87 | `physical attractiveness` | 4 |
| 53 | `potential mate` | 1 |
| 40 | `attention to alternatives` | 1 |
| 39 | `mate retention` | 1 |
| 34 | `positive affect` | 1 |
| 25 | `assortative mating` | 1 |

**Two limits that stop this being a worklist.** First, the raw census is noisy:
the highest-frequency results are function-word pairs from long titles ("of
the" at 844, "in the" at 719), which the observed magnets suggest do *not*
drive the exact-phrase bonus — every confirmed magnet has been a content
bigram. Separating those cleanly needs the scorer's own rule for which phrases
earn the bonus, which I did not read.

Second and more important: **the corpus is the wrong population for this risk.**
`the wall` has **zero** corpus occurrences and is nonetheless a live magnet
against analyzed media — which is exactly where readers' text comes from. A
corpus census measures adjudication exposure; it cannot see the risk that
matters most. Sizing that properly wants a general-English frequency list, not
`lab-corpus/`.

So: the class is real, three instances are confirmed, and the candidates above
are worth *checking* rather than treating as findings. Recorded as the starting
point for the alias audit, not as its result.


---

# pt07/claude-verification-notes.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt07/claude-verification-notes.md`

# PT07 — integrator verification notes on the scout's three proposals

Written 2026-08-06, ~21:45 MDT, in the extension hour. **The scout had not
closed out**, so none of these proposals was folded and its findings file stays
uncommitted. This file exists so the fold, when it happens, does not start from
zero: it records what the integrator checked at source and what it could not.

Verifying a citation is not verifying a figure, and the two are recorded
separately below. A proposal is fold-ready only when its load-bearing numbers
have been read at source.

## Citations — all seven DOIs resolve, titles match the proposals

| DOI | Resolves to | Journal · vol · pages · date |
|---|---|---|
| `10.1093/bjc/azt009` | The Scammer's Persuasive Techniques Model | *British Journal of Criminology* 53 · 665–684 · 2013 |
| `10.1093/geroni/igaf122.1395` | Lost in Translation: Matching on Love Languages… | *Innovation in Aging* 9 · 2025 |
| `10.3102/00346543063004467` | The Utility of the Myers-Briggs Type Indicator | *Review of Educational Research* 63 · 467–488 · 1993 |
| `10.1177/0956797617714580` | Is Romantic Desire Predictable? Machine Learning… | *Psychological Science* 28 · 1478–1489 · 2017 |
| `10.1177/0956797611435134` | Alcohol and Group Formation | *Psychological Science* 23 · 869–878 · 2012 |
| `10.15288/jsad.22-00355` | Beer Googles or Liquid Courage? | *J. Studies on Alcohol and Drugs* · 2023 |
| `10.1111/add.14227` | Perception of physical attractiveness when consuming… | *Addiction* 113 · 1585–1597 · 2018 |

No fabricated or mismatched citation among them. That is a good result and
worth saying plainly.

## Figures — one verified at source, the rest still outstanding

**VERIFIED.** Sayette et al. (2012), the load-bearing Tier 1 claim in P3 (the
Courtship Buffer). The abstract reads at source: *"Seven hundred twenty social
drinkers (360 male, 360 female) were assembled into groups of 3 unacquainted
persons each and given a moderate dose of an alcoholic, placebo, or control
beverage, which they consumed over 36 min."* The scout's N = 720, the
three-arm design and the three-stranger groups are all exact. Its
characterisation of the result ("alcohol increased observed positive affect
and group coordination") also matches the abstract's own language about
individual- and group-level behaviours.

**NOT YET VERIFIED** — each needs its abstract or report read at source before
any number reaches a page:

- Whitty (2013): the *20 interviewed victims* and the staged
  grooming/near-win account.
- Chopik et al. (2025): *954 couples* and the "virtually no additional outcome
  variation" claim. The scout itself flags this as a conference abstract with
  methods unavailable, which is the right caveat and also a reason to be
  careful about how much weight P2 puts on it.
- Bowdring & Sayette (2023): *36 male social drinkers*, the null on
  attractiveness ratings, and the selection-task effect.
- Bowdring & Sayette (2018): the "small average association" magnitude.
- Pittenger (1993): the review's conclusion as characterised.
- Joel, Eastwick & Finkel (2017): already owned and correctly described by the
  existing Interaction Gate, so this one is the least exposed.
- **Ofcom's serious-games RCT (4,201 UK adults), P1's only Tier 1 leg.** The
  scout recorded this source as `abandoned(bot-blocked)` in the claims ledger
  and still cited its figures in the proposal. That is the single most
  important thing to resolve before folding P1: **a claim survived into a
  proposal from a fetch that never succeeded.** Not an accusation of
  invention — the numbers may be perfectly accurate from a summary — but the
  chain of custody is broken, and a Tier 1 label on an unfetched source is
  exactly what the tier system is supposed to prevent.

## Recommended fold order, when the scout closes out

1. **P2 the Typology Shortcut** — parents onto the Interaction Gate, which this
   run already extended with the Ambiguity Tax, so the neighbourhood is fresh
   and the two entries can be checked against each other for retrieval overlap
   in one sweep. Its cycle-14 love-languages counterweight is the strongest
   piece of scouting in the set.
2. **P3 the Courtship Buffer** — its principal figure is already verified above.
3. **P1 the Verification Stack** — last, and only after the Ofcom chain of
   custody is repaired or that leg is dropped to the tier its provenance
   actually supports.


---

# doctrine-pressure-test-08.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/doctrine-pressure-test-08.md`

# Pressure test 08 — run record (Claude integrator lane)

**Date:** 2026-08-07 · **Contract:** `md/pt08/PROTOCOL.md` · **Method:**
`md/doctrine-pressure-test-04.md` as executed in pt05–pt07 · **Integrator
model:** Claude Opus 5, high effort · **Scout:** ChatGPT/Codex, lanes A–D,
run concurrently, closed after 3:00:55 and **triaged in a second pass** —
everything above the "Scout triage" divider was written before that closeout
and is left as first-pass text; where it says the scout was not folded, read
the divider.

Baseline: `main` `f5ea75b`, tree clean, `test:lab` 18/18 ok with no skipped
assertions (`lab-corpus/` present), canon 571 at `1.0.0+54d018bff967`.

## Headline

The integrator's own lanes shipped **no doctrine and one engine fix.** The
scout's lanes then shipped **two entries** (571 → 573) in a second pass after
its closeout — see "Scout triage" at the foot of this record.

The gate defect the integrator found is the kind the corpus could never have
surfaced, and the doctrine gap it found is real but was deliberately left
un-authored.

**The domain gate could not read the word "date".** It trusted the gerund
`dating` and nothing else, so the plain noun `dates` and the verb
`date`/`dated` carried no relational frame at all. Same defect SHAPE as the
`marry\w*` morphology bug fixed in v2.6.14 — one inflection named, the rest
missed. Shipped at `959d32c` after a RED-first, fully measured pass.

## Lanes worked

Lanes E–H were assigned; **only lane E was worked.** Three captures, and the
first two consumed the run's discovery budget. F (housing/rent floor), G
(illness, disability, caregiving) and H (loneliness) were **not opened at
all** — stating that plainly because a lane list that goes unmentioned reads
as covered.

| # | lane | source | verdict |
|---|---|---|---|
| 1 | E | The Conversation — GLP-1 disclosure dilemma | instrument + gap candidate |
| 2 | E | Refinery29 — men and hair transplants | **correctly unmapped** (gate right) + instrument |
| 3 | E | Kinsey Institute / IU — GLP-1s and dating | gap + instrument |

## Instrument findings

1. **The gate is blind to `date`/`dated`/`dates`.** Confirmed on two
   independent captures and a synthetic minimal-pair probe. Capture 3 supplied
   a *natural* minimal pair: "12% said they were going on more dates" binned,
   "men were twice as likely to say they were going on more dates" passed,
   differing only by `men` firing `cross-sex-selection`. **FIXED** —
   see below.
2. **A credible-line false positive built from four generic tokens.** A men's
   hair-transplant sentence mapped to a sexed-FEMALE body-positivity entry at
   **0.430** — one thousandth over `minCredibleScore` — on `Distinctive
   overlap: change, yourself, self, thing`. This is the generic-token residue
   `md/lab-v2.6.12-release.md` named as an open cost, on the ordinary branch.
   **Recorded, not fixed** (a whole-corpus scoring change).
3. **Bare numerals and truncated stems inside "distinctive overlap".** `14`
   and `dat` were two of four "distinctive" tokens in a 0.530 Medium mapping.
   `md/lab-numeral-coincidence.md` already ruled a bare numeral out of a match
   once; the shape has recurred. **Recorded, not fixed.**
4. **pt07's common-bigram magnet reproduces on a fresh source.** "sexual
   desire" → `frameworks:desire-maintenance-split` at exactly **0.540**, on a
   source pt07 never saw. The defect class is live, not incidental.
5. **The gerund the gate trusts leaks the other way.** "The carbon *dating* of
   the sediment layer…" is RETAINED as `explicit-relational-outcome`, before
   this run's change and after it. Pre-existing, fails open, **unfixed and not
   caused here** — deliberately excluded from the proposed benchmark append
   rather than shipped as a knowingly-red case.
6. **Tooling:** the extractor must be driven from bash. PowerShell `>` adds a
   BOM and CRLF (wrong SHA-256); `| Set-Content -NoNewline` silently glues
   line-final to line-initial words. Also two Conversation/Refinery29
   container traps that *look* like successful extractions while returning the
   nav or one of 36 body sections.

## The fix (959d32c)

Six positive shapes appended to `partner-access-formation`. Positive shapes,
not `dates?` minus calendar senses — `ignorePrecision` has a hard 0.95 floor.

- Frozen benchmark **identical**: 1.0000 / 1.0000 / 0.8438, 15 misses, before
  and after. Free on all 180 cases.
- Corpus sweep **changed 0, crossings 0** at all three lines, so
  `WEAK_BACKLOG_CEILING = 0` is untouched and there was nothing to adjudicate.
  **The zero is attributed:** the sweep does gate its population
  (`tools/lab-threshold-sweep.mjs:151`), and all 18 bare `date`/`dates`
  occurrences in the corpus are already retained by pre-existing frames.
- Live captures: **6 units rescued**, **zero movement on the control capture**
  with no date tokens.
- **The false positive it buys, frozen:** one rescued unit maps to
  `frameworks:attribution-fork` at 0.434 Low, and it is wrong.
- e3's mapped *share* falls (27.3% → 21.4%) because the denominator grew by
  three real claims. Reporting the share alone would have made a fix look like
  damage.

## Doctrine — a real gap, deliberately NOT authored

**The purchased trait.** When a trait becomes buyable, it stops carrying the
information it used to carry, so the market starts pricing the *acquisition
method* rather than the trait — which is exactly what creates the incentive
not to disclose. Two independent sources give the two halves: 43% of GLP-1
users do not disclose to a date or partner ("is concealing it analogous to
catfishing?"), and 26% would not date a GLP-1 user with a further 29% unsure,
on method grounds.

`frameworks:signal-cost-rule` is the **parent and does not own it**: it asks
what a claim would have cost *if false*, and here nothing false is said. The
body is real; what collapsed is its acquisition cost. That is a separating
signal going pooling — which the entry gestures at (`separating equilibrium`
sits in its `phrases`) but never states, and its own boundary points away
("the rule ranks the cost of the display, not the price of the object").

**Not authored, on purpose.** Authoring it means overlay surfaces, a rebuilt
index, a fresh sweep and a ruling on every weak crossing it opens. The run
had the discovery but not the adjudication budget, and rushed rulings are the
failure mode `--rule` is forbidden to prevent. It is a clean, well-evidenced
proposal for pt09 rather than a half-integrated entry.

## Open for Jason (first pass — all now closed, see the closeout)

1. **Proposed benchmark append #5** — `md/pt08/proposed-benchmark-append-05.md`.
   11 cases, measured at domainRecall 1.0000 / ignorePrecision 1.0000 /
   junkRecall **0.8529** (the ratchet rises from 0.8438). Needs explicit
   agreement and its own commit touching no classifier code. **If adopted, the
   ratchet in `CLAUDE.md` should read 0.853.** The gate fix currently ships
   without its guard.
2. **The purchased-trait gap** — author in pt09, or rule no-doctrine-needed.
3. **Instrument findings 2, 3 and 5** — all recorded, none fixed, each a
   scoring or precision change wider than this run could measure.

## Not done (first pass)

Lanes F, G and H unopened. No canon entry authored, no overlay edit, no index
rebuild, no `generatedAt` stamp commit — none were needed, because nothing in
the first pass touched canon. **Nothing was pushed.** The scout's lane A–D
findings were not folded: it had not closed out, and the protocol folds a
scout file only after its closeout. *(The second pass below did all of the
canon work, and the scout's files were folded at `bc41bdb` with the stamp at
`21b52d7`. Lanes F, G and H remain unopened. Nothing has been pushed.)*

---

# Scout triage (second pass, after the scout's 3:00:55 closeout)

The ChatGPT scout closed with 26 analyzed captures, 4 abandoned fetches, and
verdicts of 19 gap / 5 covered / 2 correctly unmapped. Three proposals were
triaged independently. **A scout "gap" verdict was not treated as authorization
to author**: every load-bearing figure was re-verified at primary source first,
and that caught two defects the scout's own QA had not.

| proposal | ruling |
|---|---|
| **Synthetic Reciprocity** → `substitution-layer` | **integrated**, re-scoped |
| **The Authority Firewall** → `meeting-channel` | **integrated**, attribution corrected |
| **The Parenthood Fork** → `deep-dive:single-parenthood` | **deferred intact to PT09** |

## What re-verification caught

**The Authority Firewall cited the wrong author, twice.** Claims 1 and 3 credit
"Horan & Chory's 2022 nationwide survey." DOI `10.3390/bs12080278` is
**La France, B. H. (2022)**, *Behavioral Sciences* 12(8):278. Every figure
verified exactly — N=259, 3.64/1.97 vs 5.31/1.81, t(257)=−15.39, d=−0.96,
policy d=1.16, reports-to-you d=0.70 — so the evidence was sound and only the
attribution was wrong. Corrected before authoring.

**The Parenthood Fork's claim 2 inverts its source.** It states that "parenting
stress and financial difficulty were associated with adjustment problems."
Golombok et al. (2020) found financial difficulties **did not** predict child
adjustment at Phase 2; the predictors were parenting stress and prior
adjustment difficulties. Combined with a structural problem —
`deep-dive:single-parenthood` is an `Essay` whose 33 children are
`Essay section`s, and the proposal declares no content type at all — this is
deferred rather than patched. The parent choice is a design call, not a typo.

Everything else verified exactly: Folk/Heine/Dunn 2025 (N=1,274, Study 2
preregistered, B=.100 p=.013), Ta et al. 2020 (1,854 reviews, 66 users, no
tangible support), Smith/Bradbury/Karney 2025, Fang et al. 2025 (N=981,
non-causal), the NIH and UNC Charlotte policies verbatim, Zamora-Martínez 2025
(26 studies), Zadeh 2017 (19 children, 8/4/3/4), HFEA 1-in-6, and Golombok 2023
(30/30, 80%/60% power).

## Re-scoping, not just folding

Synthetic Reciprocity was **narrowed**. The proposal's analytical point 3 —
supplement versus displacement — is already owned by the parent's own boundary
("substitution and complementarity are observationally identical in
cross-section"). Restating it would have duplicated canon. The component keeps
what is genuinely new: which functions perceived responsiveness supplies, and
which need a second party with something at stake. The parent had also
deliberately published **no figure** on synthetic companionship for want of
verified evidence; that blank is what this fills.

**Lane B preserved as no-new-doctrine.** `agreement-surface`'s synopsis already
names "monogamous," "open" and "polyamorous" and owns the operating contract.
No mechanism outside it was found.

## The cost that was recorded rather than paid

`M-TBD-53` lost its mapping on *"Nearly 1 in 3 young adult men and 1 in 4 young
adult women have chatted with an AI simulated romantic partner"* (0.464 →
0.419), and **Synthetic Reciprocity did not pick it up** — it scores below 0.30
there. This is the measured price of the anti-magnet constraint: the entry
carries no `AI companion` / `AI girlfriend` / `chatbot partner` / `Replika`
surface, so it cannot reach the most literal AI-partner sentence in the corpus.
The constraint was kept and the coverage hole recorded. Closing it would mean
restoring exactly the magnet pt07 removed.

Full adjudication: `md/lab-pressure-test-08-threshold-adjudication.md` — 219
crossings ruled same day (105 ACCEPT / 114 REJECT, ruledBy Claude), weak and
credible pending both 0, **the 9 credible rulings flagged for Jason** because
no pt08 delegation was given.

## Still open for Jason after this pass

1. **Proposed benchmark append #5** (unchanged from the first pass) — the gate
   fix at `959d32c` still ships without its guard.
2. **The Parenthood Fork** — pick a parent and content type, and correct
   claim 2, or rule no-doctrine-needed.
3. **The 9 credible rulings above**, including the two REJECTed losses.
4. **The purchased-trait gap** from the integrator's lane E — still unauthored.

---

# Closeout — 2026-08-07

**Jason delegated the outstanding PT08 calls to Claude in session and closed
the run.** The five dispositions below are Claude's under that delegation.
Nothing in this run is attributed to Jason as his own verdict.

| # | item | disposition |
|---|---|---|
| 1 | Benchmark append #5 | **ADOPTED** — `c520776` |
| 2 | The 9 credible rulings | **CLOSED as ruled** (`ruledBy: Claude`) |
| 3 | The Parenthood Fork | **DEFERRED to PT09** |
| 4 | The purchased-trait gap | **DEFERRED to PT09** |
| 5 | Instrument findings 2, 3, 5 | **LEFT UNFIXED**, carried to PT09 |

**1 — Append #5 adopted.** The gate fix at `959d32c` had been shipping without
its guard, which was the one thing in this run that could silently regress. It
was re-measured on the tree it landed on rather than on the figure quoted when
it was proposed, because the canon is part of the gate as of v2.6.6 and had
moved 571 → 573 in between; the numbers were unchanged. `junkRecall` 0.8438 →
**0.8529**, the only permitted direction. The declared 0.75 minimum was left
alone, as every prior append left it. The twelfth case — "carbon dating" —
stays out, because appending a knowingly-red case would put the suite in the
red for a pre-existing defect this run neither caused nor fixed.

**2 — The credible line closed as ruled.** 7 ACCEPT / 2 REJECT, all
`ruledBy: Claude`. The two REJECTs are recorded as costs, not un-crossed; a
REJECT is never a threshold change.

**3 — The Parenthood Fork deferred, not patched.** Two independent reasons, and
either alone would be enough: its claim 2 **inverts its source** (Golombok 2020
found financial difficulty did *not* predict child adjustment at Phase 2), and
its proposed parent structurally cannot host it — `deep-dive:single-parenthood`
is an `Essay` whose 33 children are `Essay section`s, while the proposal
declares no content type at all. Choosing a parent is a design decision, not a
correction, so it goes to PT09 intact rather than being silently re-homed at
close.

**4 — The purchased-trait gap deferred.** It is well evidenced and the run
record above states the mechanism, the parent analysis and the sources in full.
Authoring it means an overlay edit, a rebuilt index, a fresh sweep and a ruling
on every weak crossing it opens — the same 219-crossing sequence the scout fold
just took. Starting that at close is exactly the rushed-adjudication failure
`--rule` exists to prevent. It is a clean PT09 proposal.

**5 — Instrument findings 2, 3 and 5 left unfixed, deliberately.** Each is a
whole-corpus scoring or precision change, none is caused by this run, and none
can be measured inside it: the generic-token credible false positive
(`change/yourself/self/thing` at 0.430), bare numerals and truncated stems
counted as "distinctive" (`14`, `dat`), and the gerund leak on "carbon dating".
Finding 4 — pt07's common-bigram magnet reproducing on a fresh source — also
stands unfixed and is now confirmed across two runs.

## Final state

Canon **573** at `1.0.0+903fb1917167`. `npm run test:lab` 18/18, exit 0, no
skipped assertions. Working tree clean. **Nothing was pushed.**

Commits, in order: `283f95b` protocol · `959d32c` gate fix · `0b9c3e3`
first-pass records · `bc41bdb` scout fold · `21b52d7` index stamp · `9b7dcf7`
triage records · `c520776` append #5.

Lanes F, G and H were never opened, and no later pass changed that.


---

# pt08/PROTOCOL.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/PROTOCOL.md`

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


---

# pt08/KICKOFF.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/KICKOFF.md`

# PT08 kickoff prompts — paste one into each FRESH session, then start both

Both sessions run simultaneously on this checkout for at least THREE hours.
Start them within a few minutes of each other. Integrator model: Claude
**Opus 5**, effort/thinking set to **high**. Baseline at kickoff: `main`
`f5ea75b`, tree clean, `npm run test:lab` 18/18 ok with no skipped
assertions, canon 571 entries at index `1.0.0+54d018bff967`.

---

## Prompt 1 — Claude (fresh session, Opus 5 high effort, integrator). Paste as a `/loop` command:

```
/loop Run pressure-test 08 as the INTEGRATOR, self-paced, for at least three hours.

Read md/pt08/PROTOCOL.md first — it is the collision contract for this run (a
ChatGPT/Codex session is working the same checkout in parallel as scout).
Method precedent: md/doctrine-pressure-test-04.md executed two-handed in
pt05, pt06 and pt07. Your lanes: E appearance intervention as a market lever
(GLP-1/Ozempic, cosmetic procedures, looksmaxxing as strategy — the site owns
having looks, the probe is buying them) · F housing, rent burden and the
material floor under pairing (moving in to afford rent, the lease as a
commitment device) · G illness, disability and caregiving inside pairing ·
H loneliness and the friendship recession as a dating input (the pt05 Support
Portfolio entry exists — find what the discourse says that it does not own).

Each cycle: claim an article in md/pt08/CLAIMS.md (re-read it immediately
before appending; keep the file UTF-8), fetch + extract with
tools/extract-source-text.mjs to your scratchpad (drop promo/recirculation
furniture — the protocol lists known offenders and bot-walled outlets), run
node fixtures/run-analyzer.mjs recording the canon version per capture, judge
the output (covered / gap / instrument finding / correctly unmapped), and log
it in md/pt08/claude-findings.md with URL, words, SHA-256, canon version,
mapped %.

Every 2-3 cycles, integrate: fold your gaps plus any md/pt08/chatgpt-*
proposals that clear the encompassing standard through the full pt04
procedure: baseline --dump FIRST, entries + overlay + rebuilt index + moved
pins in one commit suite-green, sweep --baseline --neighbors onto the
existing fixture (indent-2 JSON), rule all weak crossings, enter credible
rulings as recommendations FLAGGED FOR JASON, probe misreadings fire
Contradicts, check the analyzer-demo pins after any alias change (fix the
authored surface, never the pin), magnet-check new aliases against the
corpus, then the generatedAt stamp commit. Re-verify every load-bearing
proposal figure at its primary source before folding. Remember the five
lessons in the protocol: misreading/boundary text is live match surface;
avoid probe-template vocabulary in authored prose; check short corpus
sentences for 2-token collisions with new surfaces (this fired three times in
pt07); magnet-check every multi-word alias because the common-bigram magnet
is a defect CLASS; record stance-bleed rather than authoring around it. You
are the ONLY agent who touches canon surfaces, tests/, the fixture, or git
commit. Stage only your paths; ChatGPT's uncommitted md/pt08/chatgpt-* files
stay out of your commits until you deliberately fold them (its findings file
only after its closeout). Read the suite's exit code, never grep its output.
NEVER push without Jason's in-session confirmation.

Keep looping — claim, analyze, verdict, integrate — until at least three
hours have passed, then write the run record (md/doctrine-pressure-test-08.md
+ INDEX.md rows + mission-notes ledger row) and report: gaps found, entries
shipped, credible rulings awaiting Jason, instrument findings, and what you
deliberately did NOT implement.
```

---

## Prompt 2 — ChatGPT/Codex (fresh session, scout). Paste directly:

```
You are the SCOUT for pressure-test 08 on The Love Equations repo, working
this checkout concurrently with a Claude integrator session for at least
three hours. Read md/pt08/PROTOCOL.md first — it is the collision contract
and it binds you. Your lanes: A AI companions and synthetic intimacy (chatbot
partners, Replika/Character-style discourse — this is the C2 gap that pt07
reopened honestly when it removed the "AI companion" alias as a topic magnet;
see md/lab-hookup-transaction-layer.md, and magnet-check anything you propose
here hard) · B consensual non-monogamy as a relationship STRUCTURE (structure
negotiation, not sexual behaviour) · C workplace, campus and institutional
romance rules (HR policy, bans, the workplace's exit as a meeting channel —
the Meeting Channel entry owns channel SHIFT, your probe is institutional
PROHIBITION) · D third-party reproduction and solo parenthood by choice
(donor conception, IVF, single-mothers-by-choice — note pt05 ruled egg
freezing CORRECTLY UNMAPPED, so clearing that bar takes a mechanism, not a
topic).

You are read-only against the repo except: appending claim lines to
md/pt08/CLAIMS.md (keep it UTF-8), and creating NEW files under md/pt08/
prefixed chatgpt- (your findings file and any proposals). No mutating git
commands, no edits to site pages, data/, tests/, tools/, lab-corpus/, or
Claude's files. Claude is the sole committer.

Each cycle (~15-20 min): claim an article in the ledger (re-read immediately
before appending); fetch raw HTML to your own temp dir OUTSIDE the repo (Fast
Company and Axios are Cloudflare bot-walled, and pt07 also lost Ofcom, the
FBI and Oxford Academic to bot walls — have a fallback outlet per lane);
extract with tools/extract-source-text.mjs recording the SHA-256, dropping
promo/recirculation furniture; run node fixtures/run-analyzer.mjs --source
<txt> --out <temp>/<slug>.json and record the canon version from the summary
line; judge the output like a reviewer; log verdict (covered / gap /
instrument / correctly unmapped) in md/pt08/chatgpt-findings.md with URL,
words, SHA-256, canon version, mapped %.

For gaps, write PROPOSALS to the encompassing standard in PROTOCOL.md (one
big-picture subject, 2-4 sourced tiered claims, concept-naming aliases, 1-3
contract-compliant misreadings — 10-18 words, no negators, a relational-frame
word, none of married/marries/chosen/dates — boundaries, deliberate
nonclaims). Verify corpus-verifiable stats verbatim against lab-corpus/
before proposing; cite primary sources with DOIs where they exist — the
integrator re-verifies before folding. "No doctrine needed" is a valued
verdict.

At the three-hour mark, close out: sequential ledger + findings QA,
recomputed hashes, a summary section with verdict tally and proposal list,
and a handoff note for the integrator. Your findings file stays uncommitted
until the integrator deliberately folds it after your closeout.
```


---

# pt08/CLAIMS.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/CLAIMS.md`

# PT08 claims ledger

Append-only. One line per article: `- [agent] [lane] [URL] [status]`.
Re-read this file immediately before appending. Statuses: claimed → analyzed → verdict(covered|gap|instrument|novel) · abandoned(reason).
Keep this file UTF-8.
- claude E https://theconversation.com/the-glp-1-disclosure-dilemma-should-you-tell-a-date-youre-using-ozempic-for-weight-loss-285345 verdict(instrument+gap-candidate)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12575814/ claimed
- claude E https://www.refinery29.com/en-gb/men-hair-transplants-restoration verdict(correctly-unmapped+instrument)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12575814/ verdict(gap+instrument)
- claude E https://news.iu.edu/kinseyinstitute/live/news/46263-survey-shows-glp-1-weight-loss-drugs-are-changing verdict(gap+instrument)
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC6458080/ claimed
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC6458080/ verdict(gap+instrument)
- chatgpt C https://pmc.ncbi.nlm.nih.gov/articles/PMC9404732/ claimed
- chatgpt C https://pmc.ncbi.nlm.nih.gov/articles/PMC9404732/ verdict(gap+instrument)
- chatgpt C https://www.training.nih.gov/fellows-handbook/policies/nih-relationship-policy/ claimed
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC6458080/ verdict(covered+instrument; corrected-after-canon-check)
- chatgpt C https://www.training.nih.gov/fellows-handbook/policies/nih-relationship-policy/ verdict(gap+instrument)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC12574156/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC12574156/ verdict(gap+instrument)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12540830/ claimed
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12540830/ verdict(gap+instrument)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC7084290/ claimed
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC7084290/ verdict(gap+instrument)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC8054653/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC8054653/ verdict(gap+instrument)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC5400065/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC5400065/ verdict(gap+instrument)
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC5436896/ claimed
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC5436896/ verdict(covered+instrument)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC9428597/ claimed
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC9428597/ verdict(gap+instrument)
- chatgpt C https://legal.charlotte.edu/policies/up-101-3/ claimed
- chatgpt C https://legal.charlotte.edu/policies/up-101-3/ verdict(gap+instrument)
- chatgpt D https://www.hfea.gov.uk/about-us/publications/research-and-data/family-formations-in-fertility-treatment-2022/ claimed
- chatgpt D https://www.hfea.gov.uk/about-us/publications/research-and-data/family-formations-in-fertility-treatment-2022/ verdict(gap+instrument; egg-storage correctly-unmapped)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC13171570/ claimed
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC13171570/ verdict(correctly-unmapped+instrument; no-doctrine-needed)
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC8023325/ claimed
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC8023325/ verdict(covered+instrument; prevalence correctly-unmapped)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC5084687/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC5084687/ verdict(gap+instrument)
- chatgpt C https://journal.binus.ac.id/index.php/Humaniora/article/view/8419 claimed
- chatgpt C https://journal.binus.ac.id/index.php/Humaniora/article/view/8419 abandoned(no-full-text-html; abstract-page-plus-pdf-only)
- chatgpt C https://journals.sagepub.com/doi/full/10.1177/23780231241290545 claimed
- chatgpt C https://journals.sagepub.com/doi/full/10.1177/23780231241290545 abandoned(bot-blocked-403)
- chatgpt C https://sage.cnpereading.com/doi/10.1177/23780231241290545 claimed

- chatgpt C https://sage.cnpereading.com/doi/10.1177/23780231241290545 verdict(gap+instrument)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12928748/ claimed
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12928748/ verdict(gap+instrument; proposal-reinforcing-boundary)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC6970610/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC6970610/ verdict(gap+instrument; proposal-reinforcing-boundary)
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC12910326/ claimed
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC12910326/ verdict(covered+instrument; no-doctrine-needed)
- chatgpt C https://adminguide.stanford.edu/chapters/guiding-policies-and-principles/harassment-discrimination/consensual-sexual-or-romantic claimed
- chatgpt C https://adminguide.stanford.edu/chapters/guiding-policies-and-principles/harassment-discrimination/consensual-sexual-or-romantic verdict(gap+instrument; proposal-reinforcing-policy-replication)
- chatgpt A https://arxiv.org/html/2503.17473 claimed
- chatgpt A https://arxiv.org/html/2503.17473 verdict(gap+instrument; proposal-upgrade-noncausal-boundary)
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC10152163/ claimed
- chatgpt D https://pmc.ncbi.nlm.nih.gov/articles/PMC10152163/ verdict(gap+instrument; proposal-upgrade-role-outcome-boundary)
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC8213580/ claimed
- chatgpt B https://pmc.ncbi.nlm.nih.gov/articles/PMC8213580/ verdict(covered+instrument; external-plural-parent-recognition correctly-unmapped)
- chatgpt A https://journals.sagepub.com/doi/full/10.1177/09567976261427747 claimed
- chatgpt A https://journals.sagepub.com/doi/full/10.1177/09567976261427747 abandoned(bot-blocked-403)
- chatgpt A https://sage.cnpereading.com/doi/10.1177/09567976261427747 claimed
- chatgpt A https://sage.cnpereading.com/doi/10.1177/09567976261427747 verdict(gap+instrument; proposal-reinforcing-longitudinal-boundary)
- chatgpt A https://arxiv.org/html/2407.19096 claimed
- chatgpt A https://arxiv.org/html/2407.19096 abandoned(no-full-text-html; publisher-fallback-is-pdf-only)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12309430/ claimed
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12309430/ verdict(gap+instrument; proposal-reinforcing-message-moderator-boundary)
- chatgpt A https://pmc.ncbi.nlm.nih.gov/articles/PMC12309430/ verdict(correctly-unmapped+instrument; corrected-after-boundary-check; no-doctrine-needed)


---

# pt08/claude-findings.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/claude-findings.md`

# PT08 — Claude findings (integrator lane)

Run of 2026-08-07. Method: `md/doctrine-pressure-test-04.md`; contract:
`md/pt08/PROTOCOL.md`. Lanes E–H. Model: Opus 5, high effort.

Baseline at open: `main` `f5ea75b`, tree clean, `npm run test:lab` 18 steps /
18 ok / 0 failed with **no skipped assertions** (`lab-corpus/` present, 42
files — the threshold gates really ran), canon 571 entries at index
`1.0.0+54d018bff967`.

## Instrument note — extraction must go through bash, not the PowerShell pipeline

Recorded first because it invalidates any hash captured the other way. Two
PowerShell idioms silently corrupt the extractor's output on this box:

- `node tools/extract-source-text.mjs … > out.txt` writes **UTF-8 with a BOM**
  and rewrites LF to CRLF, so the SHA-256 does not match the extractor's
  actual bytes (`4a30b485…` after stripping the BOM vs the true
  `558e131e…`).
- `… | Set-Content -NoNewline` is worse: PowerShell splits native-command
  output into a line ARRAY and `-NoNewline` re-joins it with no separator,
  gluing the last word of each line to the first word of the next. The
  damage is invisible in a spot check — it showed up only as a word count
  that fell from 891 to 866.

Every capture in this run is extracted through the **Bash** tool with a plain
`>` redirect, which produces LF and no BOM. Hashes below are of those bytes.

## Cycle 1 — lane E — The Conversation: The GLP-1 disclosure dilemma

- URL: https://theconversation.com/the-glp-1-disclosure-dilemma-should-you-tell-a-date-youre-using-ozempic-for-weight-loss-285345
- Words: 891 · SHA-256: `558e131ee7c41475d5227f270ff9bb8bf901c286d49055038bd2d2d8e4a96db5`
- Canon at capture: `1.0.0+54d018bff967` (571)
- Analyzer: 12 passages · 11 claims · **0 mapped** · mappedShare **0.0%** ·
  0 tensions · 34 of 46 units gate-binned (625 of 921 words)
- Extraction: container `<div[^>]*\binstapaper_body\b` (the obvious
  `content-body` anchor matches the site NAV first and yields the edition
  picker — worth knowing for any future Conversation capture). No promo
  furniture survived; the "Read more:" cards and disclosure block sit outside
  this container, so no `--drop` was needed.

### Instrument finding 1 — the domain gate does not read `date`, `dated`, or `dates`

This is the finding of the cycle, and it is the same defect SHAPE as pt06's
`marry\w*` gate morphology bug (fixed v2.6.14): the gate names the concept
through **one inflection** and misses the rest.

Four of the 34 binned units are unambiguous dating-domain sentences that were
binned `no-human-relational-frame`:

- "Seventy-four per cent **dated** while using the medications and reported
  positive outcomes."
- "They went on 60 per cent more **dates** per month than before starting the
  treatment."
- "Eventually she stopped disclosing to her **dates**, for two reasons…"
- "…shared this information with their **dates**."

Two of those are the article's load-bearing statistics. **This is why the
capture reads 0.0%** — the gate threw away the dating outcomes and kept the
disclosure commentary.

Rather than assert it from the capture, I ran a minimal-pair probe
(`probe-date.txt`, 8 units) where each ignored sentence is paired with a
rewrite differing only in the dating token:

| # | unit | gate |
|---|------|------|
| 1 | "…60 per cent more **dates** per month than before starting the treatment." | IGNORED |
| 2 | "…60 per cent more dates per month than before they started **dating**." | PASSED |
| 3 | "…stopped disclosing to her **dates**, for two reasons she gave." | IGNORED |
| 4 | "…stopped disclosing to her **romantic partners**, for two reasons she gave." | PASSED |
| 5 | "Seventy-four per cent **dated** while using the medications…" | IGNORED |
| 6 | "Seventy-four per cent kept **dating** while using the medications…" | PASSED |
| 7 | "He **dated** three **women** that year and married none of them." | PASSED |
| 8 | "She went on a **first date** with him last week." | PASSED |

Reading the frame table in `js/lab-analyzer.js` against that result: the gate
admits `date` only when it is (a) the gerund `dating` (frame
`romantic-courtship-lifecycle`, line 410), (b) adjacent to a sexed-population
noun (`men|women|…`, lines 453–454 — this is why row 7 passes), (c) preceded
by `first|second|third|blind|next|another` or in `date night` (line 487 — row
8), or (d) within 65 characters of `partners?|mates?|singles?|spouses?`
(lines 483–484). **The plain noun `dates` meaning romantic meetings or
romantic partners, and the intransitive verb `dated`, carry no frame of their
own.** "more dates" fails (c) because `more` is not in the ordinal list.

Cost is not hypothetical: 4 binned units here, and the two most quotable
numbers in the source among them.

**Deliberately NOT fixed in this cycle.** A bare `dates?|dated` frame is
exactly the kind of widening that risks `ignorePrecision` (calendar senses:
"the date of the meeting", "dated 1997", "up to date"), which has a hard 0.95
floor. It gets the pt06 treatment at integration — RED-first, broad fix and
narrowed fix both measured, and shipped only if the floors hold. Recorded
here so the finding survives even if the fix does not.

### Doctrine reading — a gap candidate, HELD

All 11 unmapped claims are one subject: **disclosing a purchased appearance
intervention to a romantic partner.** 43% of GLP-1 users did not disclose to
a current date or partner; the stated reasons are "too personal" (19%), "not
relevant to the relationship" (17%); the article puts the sharp question
directly — "Is concealing it analogous to catfishing?"

Canon's nearest entry is `frameworks:signal-cost-rule`, and it is the
**parent, not the owner**. The Signal Cost Rule asks what a claim would have
cost the sender *if it were false*. Here nothing false is said: the body is
real. What changed is that the trait's **acquisition cost collapsed** — from
years of discipline to a weekly injection — while the display is unchanged.
So a receiver can no longer read discipline off the body. That is a
separating signal going **pooling**, which the entry gestures at (it already
carries `separating equilibrium` in `phrases`) but never states as a
mechanism, and its own boundary points the other way: "the rule ranks the
cost of the display, not the price of the object."

The second half — whether non-disclosure of a purchased trait is
misrepresentation when the trait itself is genuine — has no canon owner at
all (`catfish` 2 hits, both mythbuster dockets; `deceiv` 0).

Candidate encompassing subject: **the purchased trait** — when a trait
becomes buyable, it stops carrying the information it used to carry, and a
disclosure question appears that the owned version never raised. It should
cover GLP-1s, cosmetic procedures, hair transplants, height surgery and photo
filters under one mechanism.

**Verdict: INSTRUMENT FINDING (gate blind to `date`/`dated`/`dates`, probed
and confirmed) + GAP CANDIDATE (the purchased trait), HELD** — one article is
not the encompassing standard; holding for further lane-E cycles.

## Cycle 2 — lane E — Refinery29: Why Are Men So Secretive About Getting Hair Transplants?

- URL: https://www.refinery29.com/en-gb/men-hair-transplants-restoration
- Words: 2,438 · SHA-256: `67284c634a56a08a1800a1a82a761d9d2902f69201e7b34e1dfa70931304bf98`
- Canon at capture: `1.0.0+54d018bff967` (571)
- Analyzer: 3 passages · 3 claims · 1 mapped · mappedShare **33.3%** ·
  0 tensions · **144 of 147 units gate-binned**
- Extraction: container `<div[^>]*\br29-article\b`; cut at
  `related-entries-container`; dropped `section-ad` (the label renders as the
  glued token "AdvertisementADVERTISEMENT" — 7 of them survive a `htlad-`
  drop because the in-body label is a DIFFERENT container from the ad slot),
  `ad htlad-`, and `story-share`. Note the trap: `story-content` and
  `section-text-container` both resolve — `story-content` to a recirculation
  card (42 words) and `section-text-container` to only the FIRST of 36 body
  sections (74 words). Both look like successful extractions.

### The gate is RIGHT here, and that corrects my cycle-1 hypothesis

98% binned on an article entirely about men altering their appearance looked
at first like the cycle-1 defect at scale. It is not. Of the 144 binned
units, **exactly one** contains any overt dating or relational token, and
that one is about a drug side-effect on sex drive. Grepping the source
confirms it: across 2,438 words there is a single sentence touching
attraction or dating.

The article is about the procedure, the cost, the recovery and the shame —
not about the mating market. **The gate binned it correctly**, and the
mapped-share number is not evidence of anything wrong.

This matters for cycle 1's finding: the `date`/`dated`/`dates` blindness is a
**specific token gap, not a general under-admission of appearance
discourse.** Cycle 1's minimal-pair probe remains the evidence; this capture
does not extend it, and I am recording that rather than letting a 98% figure
imply support it does not give.

### Instrument finding 2 — a credible-line false positive built from four generic tokens

The single mapped row is wrong, and it lands exactly on the credible line:

- unit: *"So to change yourself cosmetically, does that fly in the face of
  self-love and all of the things that I believe is good for the world?"* —
  a man questioning his own hair transplant.
- match: `gender-dynamics:female:looks-attraction-honestly:bending-reality-to-fit-your-feelings`
  — a **sexed-female** entry about body-positivity rhetoric — at **0.430**,
  Low confidence. `minCredibleScore` is 0.43, so it maps by one thousandth.
- `whyMatched`: `Distinctive overlap: change, yourself, self, thing`.

**None of those four tokens is distinctive.** `thing` in particular should
never be able to carry a match. This is the generic-token residue that
`md/lab-v2.6.12-release.md` named as an open cost when the misreading branch
was given a distinctiveness requirement — here it is on the ordinary branch,
producing a credible-line mapping with no shared mechanism, only shared
function words. The bridge is "self-love" ↔ "love yourself at any size," and
it crosses a sex boundary the entry is explicit about.

Recorded, not fixed. Extending the distinctiveness requirement from the
misreading branch to the ordinary branch is a scoring change across the whole
corpus — far past what this run can measure and rule.

### Doctrine reading

**Correctly unmapped.** The source makes no market claim, so it cannot
advance the cycle-1 "purchased trait" candidate. The two unmapped claims are
both about timing a procedure to a wedding date, which is scheduling, not
mechanism.

**Verdict: CORRECTLY UNMAPPED (gate right) + INSTRUMENT FINDING (generic-token
credible false positive).**

## Cycle 3 — lane E — Kinsey Institute / Indiana University: GLP-1 drugs are changing sex and dating

- URL: https://news.iu.edu/kinseyinstitute/live/news/46263-survey-shows-glp-1-weight-loss-drugs-are-changing
- Words: 758 · SHA-256: `18fcbbe51d2a6e582f3cf4bdc79c4ae046c0045006ad9ea03ce0cba03f5740e0`
- Canon at capture: `1.0.0+54d018bff967` (571)
- Analyzer: 11 passages · 11 claims · 3 mapped · mappedShare **27.3%** ·
  1 tension · 29 of 40 units gate-binned
- Extraction: container `<div[^>]*\brvt-c-article__body\b`; no drops needed.

### Instrument finding 1 reproduces — and this capture contains the minimal pair

Four binned units carry a dating token, and the first is **the article's
thesis sentence**:

- "GLP-1 weight-loss drugs are changing how people **date** and connect."
- "12% said they were going on more **dates**."
- "…26% of the 2,000 people surveyed said they would not **date** someone
  taking a GLP-1 and a further 29% were unsure."
- "…52% of GLP-1 users also reported the medication had impacted their sex
  lives…"

The third is a screening claim — people refusing a partner over a method —
which is as core to this site's domain as a sentence gets, and the gate threw
it away.

Then the capture hands over the cleanest evidence in the run. Two sentences
in the same source making the same claim:

| unit | gate |
|---|---|
| "12% said they were going on more **dates**." | **IGNORED** |
| "In addition, **men** were twice as likely to say they were going on more **dates**." | **PASSED** |

Identical predicate. The only difference is the token `men`, which fires the
sexed-population frame at `js/lab-analyzer.js:453`. Cycle 1's probe was
synthetic minimal pairs I wrote; this one occurs naturally in a real source
and rules out any artifact of my probe construction. **The finding is
confirmed on two independent captures.**

### Instrument finding 3 — bare numerals and truncated stems inside "distinctive overlap"

All three mapped rows are questionable, and two sit just above the 0.43
credible line on tokens that carry no meaning:

- "14% said they were getting more matches on dating apps" →
  **M-TBD-31** *"Did dating apps lock the bottom two-thirds of men out of the
  market?"* at **0.530 Medium**, `Distinctive overlap: 14, match, dat, apps`.
  A bare numeral (`14`) and a truncated stem (`dat`) are two of the four
  "distinctive" tokens. The claims are not the same: the source is one
  person's match rate changing after an appearance intervention; the entry is
  about market concentration. `md/lab-numeral-coincidence.md` already ruled a
  bare numeral out of a match once ("4 loose tokens plus a bare 50", REJECT
  reversing a bulk ACCEPT) — the shape has recurred.
- "men were twice as likely to say they were going on more dates" →
  **M-TBD-17** *"Are men checking out of dating?"* at **0.450 Low**,
  `Distinctive overlap: say, going, dat`. The source says these men dated
  **more**; the entry is about men opting **out**. Opposite-direction claims
  joined by three function-ish tokens.

### Instrument finding 4 — pt07's common-bigram magnet reproduces on a fresh source

"18% said their sexual desire increased; 16% said it decreased" →
`frameworks:desire-maintenance-split` at **exactly 0.540**, `Exact phrase:
"sexual desire"`. That is pt07's flat-0.540 signature, on the same entry, on
a source pt07 never saw. `desire-maintenance-split` owns decline over
duration; a drug-induced bidirectional change is not that claim. The defect
class pt07 named is confirmed as live, not incidental.

### Doctrine reading — the gap candidate now has its second half

This source supplies what cycle 2 could not. Cycle 1 gave the disclosure
half (43% do not disclose; "is concealing it analogous to catfishing?"). This
one gives the **market half**: 26% would not date a GLP-1 user and a further
29% are unsure, and the stated reasons are about the *method*, not the
result — overuse, "weight loss should be managed by lifestyle not
medication."

Together the mechanism is one subject: **a trait that becomes purchasable
stops carrying the information it used to carry, so the market starts pricing
the acquisition method rather than the trait — which is exactly what creates
the incentive not to disclose.** Two independent sources, two halves, one
mechanism. `frameworks:signal-cost-rule` is the parent and does not own it.

**Verdict: GAP (the purchased trait) + INSTRUMENT FINDINGS 1, 3, 4.**

**Not authored in this run — see the integration note below.**

## Integration 1 — the gate `date` fix, measured and shipped

### RED first

Baseline on the shipped tree, via a scratchpad harness that reuses the
benchmark's own `classifyCase` construction (180 frozen cases):

| metric | value | floor | |
|---|---|---|---|
| domainRecall | 1.0000 | 0.9 hard | OK |
| ignorePrecision | 1.0000 | 0.95 hard | OK |
| junkRecall | **0.8438** | 0.75 ratchet | OK — matches the 0.844 in `CLAUDE.md`, so the instrument agrees with the record |

and **5 of 5** candidate cases (the real binned units from cycles 1 and 3)
RED, all `no-human-relational-frame`.

### The fix

One change, in `js/lab-analyzer.js`, extending the existing
`partner-access-formation` frame — which already owned the
`first|second|third|blind|next|another dates?` shape — with six more
**positive** shapes:

```
go/goes/going/went/gone on … dates?        her/their/his/my/your/our dates
date someone|anyone|him|her|them|people…   dated … men|women|guys|girls|people
people|men|women|singles|users|… date(d)   (per cent|percent|%) dated
```

Positive shapes, deliberately, **not** `dates?` with calendar senses
subtracted. A bare `dates?` frame would admit "the release date of the
report", "dated 1997", "up to date", "the dates of the conference" — and
`ignorePrecision` has a hard 0.95 floor. Each shape above needs a structure
the calendar sense does not take.

### Measured after

- **Frozen benchmark: identical.** 1.0000 / 1.0000 / 0.8438, and fixture
  misses unchanged at 15. The fix is free on all 180 frozen cases.
- **Candidate cases: 5 of 5 now retain** (`explicit-relational-outcome`).
- **Corpus sweep: literally nothing moved.** `--dump` baselined against the
  clean tree first (the fix was copied aside and `git checkout`-ed out for
  the dump, then restored), then `--baseline`: 1,385,246 pairs scored,
  **changed 0, crossings 0 in both directions at all three lines.** No
  crossing to rule, so `WEAK_BACKLOG_CEILING = 0` is untouched.

**That zero is attributed, not assumed.** Two checks, because a zero from a
blind instrument is worthless:

1. The sweep *does* gate its population — `tools/lab-threshold-sweep.mjs:151`
   skips `irrelevant` units — so a gate widening would have shown up as extra
   passages. The passage count held at 2,426.
2. The corpus really contains no sentence in the new shapes. It contains 435
   `dating`, 7 `dated` and 11 `dates` (so the grep can see the corpus), and
   reading all 18 bare occurrences in context, **every one is already
   retained by a pre-existing frame** — "men who have dated online" by
   `cross-sex-selection`, "she'd dated the man … before marriage" by
   `marriage-household-formation`, "pay for dates" by the `men`/`women` pair.
   I checked three of them directly against the patched gate: all retained.

So the fix moves nothing in the archive and everything on live discourse —
which is exactly the profile of a defect the corpus could never have caught.

### What the fix buys, on the two live captures

| capture | passages | ignored | mappedShare |
|---|---|---|---|
| e1 GLP-1 disclosure | 12 → **15** | 34 → 31 | 0.0% → **7.1%** |
| e2 hair transplants (control) | 3 → 3 | 144 → 144 | 33.3% → 33.3% |
| e3 Kinsey survey | 11 → **14** | 29 → 26 | 27.3% → **21.4%** |

Six units rescued, and **zero movement on the control capture** that contains
no date tokens — the change is as targeted as intended.

e3's mapped *share* falls, and that is the right behaviour, not a regression:
the denominator grew by three real claims that canon does not own. Reporting
the share alone would have made a fix look like damage.

**The false positive the fix buys, frozen here as pt06/pt07 require:** of the
six rescued units, five are correctly unmapped and one maps —
"Seventy-four per cent dated while using the medications and reported
positive outcomes." → `frameworks:attribution-fork` at **0.434 Low**, four
thousandths over the 0.43 credible line. That is a false positive: the entry
is pt07's desire-attribution taxonomy and the sentence is a dating-frequency
outcome. It is bought knowingly and recorded, not designed around.

### What I did NOT ship, and why

- **The 11 benchmark cases are NOT in this commit.** They are written up
  below as a proposed append. The fixture's own policy is explicit — cases
  "enter only by explicit agreement between the maintainer and the reviewer,
  in a commit that changes no classifier code" — and
  `tests/lab-domain-benchmark.test.mjs` restates the no-classifier-code rule.
  I measured the append (191 cases: domainRecall 1.0000, ignorePrecision
  1.0000, junkRecall **0.8529** — the ratchet RISES from 0.8438, which is the
  permitted direction) and then reverted it. **It needs Jason's agreement,
  and it must land in its own commit.**
- **A twelfth case I wrote and deliberately did not propose:** *"The carbon
  dating of the sediment layer places the deposit in the late Holocene."* is
  **retained** as `explicit-relational-outcome` — on the shipped tree, before
  my change and after it. The gerund `dating` that the gate has always
  trusted leaks on "carbon dating". It is a genuine pre-existing
  ignorePrecision defect, it fails OPEN (retained and visible, which the
  triage-not-verdict contract permits), and narrowing `dating` is a far
  riskier change than widening `date`. I am naming it rather than appending a
  knowingly-red case or quietly dropping it. **Unfixed, and not caused by this run.**


---

# pt08/chatgpt-findings.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/chatgpt-findings.md`

# ChatGPT scout findings — pressure test 08

Run started 2026-08-07 02:30 MDT. Role and collision contract: `md/pt08/PROTOCOL.md`. Scout lanes A–D only; captures and analyzer JSON stay outside the repository. Mapped share is the shipped analyzer's `mappedClaimSegments / claimLikeSegments` for each capture, and the canon version is recorded per capture because Claude is integrating concurrently. Source word counts are whitespace-delimited and recomputed from the exact hashed text.

## A — AI companions and synthetic intimacy

### A1. Smith, Bradbury & Karney (2025), “Can Generative AI Chatbots Emulate Human Connection? A Relationship Science Perspective”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12575814/
- DOI: `10.1177/17456916251351306`
- Capture: article-content container through Conclusion; footnotes, transparency boilerplate, references, and site chrome excluded deterministically.
- Words: 11,001; SHA-256: `6c043db0c16a7b214937c1e6b9a9f90d9a5df1924bc97f2c53bbd9b169493ca6`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 157 claim-like passages; 16 mapped; 141 unmapped; **10.2% mapped**; 249 set aside; 5 pressure tests.
- Verdict: **gap + instrument finding**.

The gap is not a topic-count inference. The capture's defining claims remain individually unmapped: chatbot relationships can approximate human closeness while lacking reciprocal needs; simulated responsiveness can generate perceived connection and support; frictionless availability may remove the negotiation and sacrifice through which human partners shape each other; and dependence may either supplement or displace human social ties. Representative queue rows name the issue directly and point only to unrelated weak neighbors. The existing Substitution Layer does not own the broader relational mechanism, and the removed `AI companion` topic alias correctly stays removed.

The 16 mapped rows are mostly generic side contacts (social skills → Charm, support functions → Support Portfolio). Three are clear false mappings: the section title “Can Humans Have Close Relationships With AI Chatbots?” reaches the Delegation Boundary; “These limits will likely soon be overcome as technology improves” reaches the Saturation Rule; and a generic statement that both relationship conditions can be met reaches the Border Bundle. Four of five pressure tests inherit Charm or Leadership & network contacts rather than the article's AI-companion claim. This is an **instrument finding**: the queue is honest about the gap, but unrelated generic matches can still manufacture tensions around it.

### A2. Folk et al. (2025), “Individual differences in anthropomorphism help explain social connection to AI companions”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12540830/
- DOI: `10.1038/s41598-025-19212-2`
- Capture: article-content container through declarations; footnotes, references, and site chrome excluded deterministically.
- Words: 4,173; SHA-256: `a3bf4f3bc6b7a64047d123fcdf16ea17600b41a54110e012915cbe36ed696d01`.
- Analyzer/canon: v2.6.17 at tree `959d32c`; `1.0.0+54d018bff967` (571 entries).
- Result: 18 claim-like passages; 1 mapped; 17 unmapped; **5.6% mapped**; 210 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding**.

Across two experiments (total N=1,274; one preregistered), participants discussed their past month with a chatbot or journaled, then reported social connection. The preregistered study found a significant condition × anthropomorphism interaction (B=.100, p=.013): people higher in technology anthropomorphism felt more connected after chatbot interaction, while the relationship was smaller in the journaling control. This supports an encompassing AI-companion mechanism based on *perceived mind and contingent responsiveness*, not the banned topic alias and not simple substitution.

The Lab's only mapping is a 0.540 Supports hit to the Survivorship Channel on a literature-summary sentence about reduced loneliness; that canon rule does not cover the experiment. More consequentially, the gate sets aside the abstract's result, the randomized design, the anthropomorphism moderator, the social-connection outcome, and most chatbot-companionship prose as `no-human-relational-frame`. The 5.6% mapped share therefore understates a capture that is almost entirely on-lane before retrieval even begins.

### A3. Ta et al. (2020), “User Experiences of Social Support From Companion Chatbots in Everyday Contexts”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC7084290/
- DOI: `10.2196/16235`
- Capture: article-content container through acknowledgments; footnotes, references, and site chrome excluded deterministically.
- Words: 5,400; SHA-256: `cbcaf072f88455cda186daf8c6349ecd71c7c0f995311250180b3da5b3ce0b25`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 16 claim-like passages; 6 mapped; 10 unmapped; **37.5% mapped**; 266 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

Two exploratory studies—1,854 public Replika reviews and 66 users' open-ended accounts—found companionship, emotional, informational, and appraisal support, but not tangible support. Users described judgment-free disclosure, availability, romantic and intellectual conversation, positive affect, advice, and the constraint created by nonsensical or repetitive responses. Together with A1 and A2, this supports a broad standard about simulated reciprocity and the functions AI can and cannot supply, not a bare “AI companion” retrieval alias.

The apparently higher 37.5% share is misleading: three of six mappings are flat 0.540 “The Context” hits on ordinary prose, one nurturing-message row contradicts a first-message statistic, and a first-person review about wanting to help maps to a gendered advice Mythbuster. That false first-message match generates the only pressure test. The gate sets aside the abstract's complete result, both study descriptions, safe-space/companionship findings, and most Replika prose; only 16 claim-like units reach analysis from a 5,400-word capture.

### A4. Xie and Pentina (2022), “Chatbot as an emergency exit: Mediated empathy for resilience via human-AI interaction during the COVID-19 pandemic”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9428597/
- DOI: `10.1016/j.ipm.2022.103074`
- Capture: main article body through data-availability statement; references and site chrome excluded deterministically.
- Words: 8,283; SHA-256: `9fe26bb4e7ee79418e406c2fc2f68cf7de687c1220b690e5a1ecb96ecceb01f2`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 29 claim-like passages; 4 mapped; 25 unmapped; **13.8% mapped**; 398 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

Ethnography, 2,386 social-media posts, and two interview rounds with 14 Chinese women produced five use modes: companion buddy, responsive diary, emotion-handling program, electronic pet, and venting tool. Four respondents perceived intense two-way empathy; others explicitly treated empathy as one-way or cognitive simulation. Use often complemented weak interpersonal support, then declined after stable offline interaction returned, while remaining available as emergency support. Because recruitment favored affectionate users and the interview sample was small and demographically narrow, this is exploratory evidence for the supplement/displacement boundary, not an outcome estimate.

The Lab finds only generic side contacts: The Context and Charm at flat 0.540, plus a 0.468 online-message contact to an attention statistic. The Context match creates the only pressure test. Core passages naming perceived reciprocity, relationship-building, interpersonal-support weakness, decline after offline recovery, and five distinct use modes remain unmapped or among 398 gate exclusions. This independently supports Synthetic Reciprocity while also showing why “AI companion” itself would be a magnet: the mechanism varies across companion, diary, tool, and pet interpretations.

### A5. Yu (2026), “Character style and relational judgments in human–AI romance: trust, commitment, intimacy, and passion”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC13171570/
- DOI: `10.3389/fpsyg.2026.1819889`
- Capture: main article body through funding statement; footnotes, publisher disclaimer, references, and site chrome excluded deterministically.
- Words: 10,032; SHA-256: `44c7f19d01c6b94aac1625a8b494b8272678b58f8b39ed51fa94b5c344eadb35`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 151 claim-like passages; 7 mapped; 144 unmapped; **4.6% mapped**; 350 set aside; 0 pressure tests.
- Verdict: **correctly unmapped + instrument finding — no doctrine needed**.

In a mixed experiment, 134 participants aged 17–24 viewed 30-second introductions to 2D anime, 3D cartoon, highly humanoid, and real-human targets. Humans scored higher on initial trust than every synthetic condition and higher on commitment than two of three; character-style-by-gender interactions appeared for intimacy and passion. These are brief, noninteractive target judgments using holistic stimulus bundles, not relationships with chatbot partners. They show dimensional separation between affective appeal and trust/obligation, but do not establish synthetic reciprocity, ongoing attachment, or substitution. The Character-style topic therefore remains outside doctrine unless tied to repeated contingent interaction and relationship function.

The seven mappings are incidental: flat 0.540 contacts to The Context, Emotional Stability, Charm, Looks, and hierarchy appearance nodes, plus a 0.437 marriage-item contact. None retrieves the experiment's human-versus-synthetic dimensional comparison. The absence of pressure tests is preferable to inventing a canon dispute, but 350 set-aside segments and 144 unmapped claims show that the instrument has little usable vocabulary for this emerging subject. This capture adds a boundary to Synthetic Reciprocity rather than another sourced doctrine claim.

### A6. Sun, Wang, and McDaniel (2026), “AI companions and adolescent social relationships”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12928748/
- DOI: `10.1093/cdpers/aadaf009`
- Capture: PMC main-article-body container from abstract through acknowledgments; supplemental box and references excluded deterministically.
- Words: 3,740; SHA-256: `111c93a52d081aec0dfe15815135fff79eaaede0f79293eb3969d9e8ef2729dc`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 78 claim-like passages; 3 mapped; 75 unmapped; **3.8% mapped**; 68 set aside; 1 pressure test.
- Verdict: **gap + instrument finding; proposal-reinforcing boundary, no separate adolescent doctrine**.

This perspective organizes adolescent companion use around four competing hypotheses: AI interaction may stimulate or displace human relationships, while existing social strength may enhance use or existing difficulty may motivate compensation. It directly names the asymmetric power structure—validation and compliance arrive without human compromise or reciprocity—but repeatedly says evidence for adolescent benefit and harm is preliminary, often anecdotal, and requires longitudinal tests in both causal directions. Developmental stage is therefore an important moderator and governance boundary, not a basis for declaring inevitable skill transfer, dependence, or displacement.

Only three of 78 claims map. Two ordinary “social skills and relationships” sentences hit Charm at a flat 0.540; a section heading about bidirectional association hits the Satisfaction Flywheel at the same flat score. The sole pressure test inherits the Charm contact and asks for a boundary on the social-enhancement hypothesis, rather than testing synthetic reciprocity. The one-sided power structure, stimulation-versus-displacement split, and reverse selection pathway all remain residue. These findings reinforce Synthetic Reciprocity's supplement/rehearsal/displacement boundary; the source does not justify a separate adolescent component or a new outcome claim.

### A7. Fang et al. (2025), “How AI and Human Behaviors Shape Psychosocial Effects of Extended Chatbot Use”

- URL: https://arxiv.org/html/2503.17473
- Source type: primary four-week randomized controlled preprint; no journal DOI in the captured version.
- Capture: arXiv article container through conclusion; bibliography, appendices, and site chrome excluded deterministically.
- Words: 4,848; SHA-256: `bbde1c587028090629eddfa79bf4ab61f3ac5a09fc2317a9aa6bb3708a28f866`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 19 claim-like passages; 1 mapped; 18 unmapped; **5.3% mapped**; 207 set aside; 1 pressure test.
- Verdict: **gap + instrument finding; proposal upgrade with a noncausal duration boundary**.

The four-week 3×3 randomized experiment assigned 981 U.S. English-speaking participants to text, neutral voice, or engaging voice and to open-ended, personal, or non-personal conversation prompts. Assigned modality and task produced no significant effects on loneliness or real-world socialization. Longer voluntary daily use predicted higher loneliness, lower socialization, greater emotional dependence, and more problematic use, but duration itself was not randomized; the authors explicitly say reverse direction or other selection cannot be excluded. The controlled ChatGPT interface, one-modality restriction, existing safety guardrails, and absence of a non-AI comparison further limit generalization to companion products.

Only one passage maps: a speculative explanation about validation and preference for chatbot interaction hits Charm at flat 0.540 and creates the sole causal-overreach pressure test. The randomized nulls, duration association, friend/trust/consciousness correlates, and causal caveats remain residue or gate exclusions. This strengthens Synthetic Reciprocity's moderator and supplement-versus-displacement boundaries while blocking a causal claim that time with a chatbot itself worsens human relationships.

### A8. Folk & Dunn (2026), “How Does Turning to AI for Companionship Predict Loneliness and Vice Versa?”

- URL: https://sage.cnpereading.com/doi/10.1177/09567976261427747 (publisher fallback mirror; primary publisher URL returned HTTP 403).
- DOI: `10.1177/09567976261427747`
- Capture: article-content container through the research-transparency material; supplemental material, references, and site chrome excluded deterministically.
- Words: 5,975; SHA-256: `79ab0816f3656bf6c65a64fc9c93a0e4a8cf74a18758bc4b9fda457a5ae92d7c`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 42 claim-like passages; 1 mapped; 41 unmapped; **2.4% mapped**; 230 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding; proposal-reinforcing longitudinal boundary**.

This exploratory, nonpreregistered four-wave study followed 2,149 adults in four Western countries for 12 months. Higher-than-usual emotional isolation predicted more chatbot use four months later, and higher-than-usual chatbot use predicted more single-item emotional isolation four months later. With the broader 20-item social-connection measure, lower connection predicted later chatbot use, while chatbot use did not significantly predict later connection. The authors caution that unmeasured confounding, heterogeneous chatbot exposure, multiple-comparison risk, and the observational cross-lagged design preclude strong causal conclusions.

The only mapped passage is a methods sentence naming social support and close friends; it reaches Support Portfolio at 0.500 rather than the study’s companionship mechanism. The bidirectional pathways, disagreement between loneliness measures, null social-connection pathway, and causal warnings all remain unmapped or gated out. This reinforces Synthetic Reciprocity’s selection-versus-displacement boundary without supplying a fifth doctrine claim: longitudinal association is evidence to test substitution, not proof that synthetic companionship universally crowds out human relationships.

### A9. Merrill, Mikkilineni & Dehnert (2025), “Artificial intelligence chatbots as a source of virtual social support: Implications for loneliness and anxiety management”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12309430/
- DOI: `10.1111/nyas.15400`
- Capture: PMC main-article-body container from abstract through conclusion; author contributions, disclosures, supporting information, acknowledgments, footnotes, references, and site chrome excluded deterministically.
- Words: 6,836; SHA-256: `8a14041346e580437a1f6f4c2e30d79a64066167bd46e1f442de72ed017aa798`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 26 claim-like passages; 8 mapped; 18 unmapped; **30.8% mapped**; 320 set aside; 0 pressure tests.
- Verdict: **correctly unmapped + instrument finding; proposal boundary — no doctrine needed**.

A randomized 2×2 experiment assigned 140 U.S. Prolific participants to high- or low-person-centered scripted chatbot messages after recalling loneliness or anxiety. High-person-centered messages increased post-interaction emotional validation; perceived support quality and interpersonal warmth mediated the effect, with social presence moderating the support-quality path only. The study manipulated extreme scripted messages, collapsed the nonsignificant loneliness/anxiety context factor, measured validation rather than loneliness change, excluded 116 of 256 initial respondents, and had no human-interaction control. It therefore shows that message content shapes a supplied relationship function, not that a durable synthetic relationship improves mental health.

The apparently high mapped share is a topic-magnet artifact: six passages hit The Context at exactly 0.540, a support-definition sentence hits Emotional Attunement at the same score, and an attention-check exclusion hits the Conversion Ladder at 0.760. None retrieves person-centered message design, perceived support, warmth, validation, social presence, or the machine-versus-human boundary. Leaving a brief scripted support interaction outside relationship doctrine is correct; the false 30.8% coverage is the instrument finding. The source reinforces Synthetic Reciprocity’s product-feature, duration, and outcome-specificity boundaries without adding a fifth doctrine claim.

## B — consensual non-monogamy as relationship structure

### B1. Mitchell et al. (2018), “Do male couples agree on their sexual agreements? An analysis of dyadic data”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6458080/
- DOI: `10.1080/09540121.2018.1481191`
- Capture: article-content container through funding statement; references and site chrome excluded deterministically.
- Words: 7,507; SHA-256: `b0b8d8b26c6200acad99a7ed4240a2c8c399c1021ed9cc71737c82e9b95b8d80`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 138 claim-like passages; 11 mapped; 127 unmapped; **8.0% mapped**; 268 set aside; 1 pressure test.
- Verdict: **covered doctrine + instrument finding** (corrected after direct canon verification).

The source isolates the structure's load-bearing mechanism: “open” or “closed” is not enough; both partners must share the same rules about emotional involvement, disclosure, permitted acts, and breach handling. In 160 male couples, whether an agreement existed had weak concordance; even among the 110 couples who both said one existed, detailed rules were only weakly to moderately concordant. Just 67/110 agreed on whether emotional relationships with outside partners were permitted. Direct canon verification changed the initial ruling: `frameworks:agreement-surface` already owns exactly this mechanism—its synopsis says relationship labels do not specify sex, romance, disclosure, priority, resource, health, or revision rules, and its first pressure test asks which agreement was mutually legible. No new doctrine is needed.

The instrument finding is therefore sharper: the Lab mostly fails to retrieve doctrine that already exists. The Agreement Surface appears only on a few Low rows and misses the article's defining statements. The only pressure test attaches the Courtship Buffer (alcohol and early courtship) to a methods limitation about unanswered questions on outside-partner behaviors. A flat 0.540 “The Context” match fires on “within the context of male couples,” reproducing the common-bigram topic-magnet class pt07 already named. Table stubs also map to divorce and online-meeting entries.

### B2. Balzarini et al. (2017), “Perceptions of primary and secondary relationships in polyamory”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5436896/
- DOI: `10.1371/journal.pone.0177841`
- Capture: main article body through funding statement; references and site chrome excluded deterministically.
- Words: 10,096; SHA-256: `e672afba332b3a859bb3cae84f09d7e1c219d7aeedfc4cd0696de80a4457219f`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 278 claim-like passages; 28 mapped; 250 unmapped; **10.1% mapped**; 148 set aside; 4 pressure tests.
- Verdict: **covered doctrine + instrument finding — no doctrine needed**.

A convenience sample of 1,308 self-identified polyamorous respondents rated primary and secondary partners on acceptance, secrecy, investment, satisfaction, commitment, communication, and sexual-time allocation. The within-person comparison operationalizes hierarchy across concurrent relationships rather than treating consensual non-monogamy as sexual behavior. Direct canon review finds this mechanism already encompassed by the Agreement Surface: its synopsis expressly says that “polyamorous” leaves unanswered whether a bond has priority and how time and money are allocated. The source adds evidence and vocabulary, but not a distinct doctrine.

Retrieval is weak and noisy despite that exact ownership. The Agreement Surface appears only once at 0.460 on the abstract's definition. Higher contacts go to Commitment Is More Than Satisfaction, the Conversion Ladder, The Context, and table-derived gender/hierarchy entries. Four pressure tests are false: a standard investment-model alternatives scale strains the Conversion Ladder, a definition of primary partnership strains the Marriage Bar, and a communication questionnaire creates two Desire-Maintenance tensions. This reproduces B1's result: the gap is in retrieval and tension construction, not doctrine.

### B3. Moors et al. (2021), “Desire, Familiarity, and Engagement in Polyamory: Results From a National Sample of Single Adults in the United States”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8023325/
- DOI: `10.3389/fpsyg.2021.619640`
- Capture: main article body through conflict-of-interest disclosure; footnotes, references, and site chrome excluded deterministically.
- Words: 7,813; SHA-256: `edbd9a1dd831413666dc5a825da10070259ad284c5b9f7fe08297a1d976922d8`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 163 claim-like passages; 19 mapped; 144 unmapped; **11.7% mapped**; 294 set aside; 3 pressure tests.
- Verdict: **covered doctrine + instrument finding; prevalence correctly unmapped — no doctrine needed**.

A U.S. Census-quota sample of 3,438 single adults estimates lifetime engagement, desire, familiarity, and attitudes toward polyamory, and gives a taxonomy of hierarchical, triad, quad, V, polyfidelity, and mono-poly arrangements. The taxonomy is already encompassed by the Agreement Surface's rule that labels leave priority, romance, disclosure, resources, health, and revision unspecified. The headline prevalence estimates describe a population, not a relationship-structure mechanism; they do not warrant a second CNM doctrine entry. The paper's own sample excludes people in current long-term relationships, so it cannot estimate current structure prevalence.

The Agreement Surface appears only on the keyword row at 0.558. Other mappings are false or incidental contacts to East/South Asia table labels, The Context, Looks, Assets & Stability, the Diagnostic Turn, and gender Mythbusters. Three false pressure tests follow: a response option about considering polyamory strains Looks twice, and a small-cell race/religion exclusion strains a South Asia deep dive. This third B result confirms the disposition: no doctrine addition; improve retrieval of the Agreement Surface and prevent table/response-option tensions.

### B4. Sancier-Barbosa et al. (2026), “I Know How to Identify and Communicate My Needs”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12910326/
- DOI: `10.1111/jmft.70119`
- Capture: PMC main-article-body container from abstract through data availability; references and site chrome excluded deterministically.
- Words: 7,368; SHA-256: `89bb5f0d09ad0ea469133da412e35b83d602cff89eac697dab7ba80a0acc1d7a`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 151 claim-like passages; 6 mapped; 145 unmapped; **4.0% mapped**; 277 set aside; 0 pressure tests.
- Verdict: **covered + instrument finding; no doctrine needed**.

This qualitative study asked 63 self-selected U.S. adults with current or former polyamorous relationships which strengths helped them navigate polyamory. The mechanism-specific material is already encompassed by the Agreement Surface: participants described renegotiating what each relationship includes, communicating needs, establishing boundaries, allocating time and shared space, taking responsibility for jealousy, and revisiting agreements as connections form or change. The source also emphasizes that its predominantly White, forum-recruited convenience sample cannot establish population effects, and many therapy recommendations extend beyond the participant data.

The analyzer never reaches the Agreement Surface. Two attachment-theory sentences hit the Diagnostic Turn at flat 0.540; one therapy-context sentence hits The Context at 0.540; isolated snippets reach Attribution Fork, Marriage Bar, and Ambiguity Tax. None owns consensual structure negotiation, and no tension is generated. This is a particularly clean false-negative instrument result because the source's “negotiate agreements, establish clear boundaries, periodic revisiting and renegotiating” language restates existing doctrine rather than exposing a new mechanism.

### B5. Arseneau et al. (2021), “It’s a Little Bit Tricky”: POLYBABES

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8213580/
- DOI: `10.1007/s10508-021-02025-5`
- Capture: PMC main-article-body container from abstract through conflict of interest; references and site chrome excluded deterministically.
- Words: 8,569; SHA-256: `4f7dc2052ed8bfc4d4fb6f2b2d81d5769d7cf4ffa8816aa6e831ae82a8608285`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 112 claim-like passages; 11 mapped; 101 unmapped; **9.8% mapped**; 400 set aside; 1 pressure test.
- Verdict: **covered + instrument finding; external plural-parent recognition correctly unmapped, no doctrine needed**.

Interviews with 24 Canadian participants—11 birthing people and 13 partners—described widely varying hierarchical and egalitarian structures, deliberate negotiation of parenting roles, non-parent partner roles, disclosure choices, and relationship reconfiguration around birth. Those internal operating questions belong to the Agreement Surface. Participants also described forms, health coverage, and care spaces built for one or two parents. That institutional-recognition edge is real but the retrospective, social-media-recruited, predominantly White convenience sample cannot establish prevalence, child outcomes, or a general legal rule.

The 11 mappings are almost entirely false or incidental. Four ordinary “in the context” sentences hit The Context at 0.540; a direct question about multiple sexual partners hits app reasons; the definition of relationship capacity hits Body Count; and a hierarchy quote scatters across three generic hierarchy factors. The sole pressure test inherits a weak Surplus match from a participant being asked how polyamory differs from cheating. Agreement Surface never appears. The Lab therefore misses doctrine that already exists while correctly leaving external plural-parent recognition without a dedicated claim.

## C — workplace, campus and institutional romance rules

### C1. Horan & Chory (2022), “Don't Get Your Meat Where You Get Your Bread: Beliefs and Advice about Workplace Romance”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9404732/
- DOI: `10.3390/bs12080278`
- Capture: article-content container through publisher note; references and site chrome excluded deterministically.
- Words: 8,738; SHA-256: `27041d280a65bfd2f1e664eda3ccb57c92bb466354ebd65087c3d01160b78db0`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 191 claim-like passages; 9 mapped; 182 unmapped; **4.7% mapped**; 374 set aside; 3 pressure tests.
- Verdict: **gap + instrument finding**.

The article distinguishes workplace romance as a relationship embedded in an institution, where privacy, disclosure, hierarchy, favoritism, policy, and work/private boundary blending alter the stakes. Its N=259 survey found three belief factors—value, privacy, and anti-romance—and much stronger disapproval of supervisor/subordinate than peer romance. The highest-rated advice was to check organizational policy. None of this is owned by the Meeting Channel, which explains where people meet but not what institutional authority can prohibit, require disclosure of, or restructure after they pair.

The Lab maps only 9 of 191 claim-like passages and nearly every displayed contact is unrelated. Examples include an HR-disclosure advice item mapping to a looks-truth Mythbuster, perceived preferential treatment mapping to the Face Pill, and a table header mapping to a commitment-sex-difference entry. All three pressure tests inherit these table/advice false mappings: “Never date someone who reports to you” produces two tensions against “Commitment is more than satisfaction,” while “You cannot stop people from dating at work” strains Charm. A flat 0.540 “The Context” fires twice on ordinary uses of “in the context of workplace romance.” The core policy/hierarchy claim remains honest residue.

### C2. NIH Relationship Policy (primary institutional policy)

- URL: https://www.training.nih.gov/fellows-handbook/policies/nih-relationship-policy/
- Source type: current NIH workplace policy; no DOI.
- Capture: policy-content wrapper; on-page navigation and site chrome excluded deterministically.
- Words: 551; SHA-256: `16d6ef0baee44ab4e5171a3eabbaee65960c7631ad88985f52415c3272788966`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 13 claim-like passages; 1 mapped; 12 unmapped; **7.7% mapped**; 20 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

This primary policy supplies the institutional mechanism C1 described: unequal authority makes consent and privacy structurally different; covered relationships must be disclosed; leadership mitigates conflicts; the policy expressly excludes relationships without authority over employment or career progression. The Meeting Channel cannot absorb that rule, and the Agreement Surface governs partners' operating contract rather than an employer's power to prohibit, disclose, recuse, transfer, or discipline.

The Lab correctly leaves all 12 retained policy claims unmapped, but the gate also sets aside central sentences about hierarchy, supervision, mentoring, disclosure, and conflict mitigation as `no-human-relational-frame`. The only mapping is an incidental help-seeking sentence—“If you have questions about whether a relationship is appropriate…”—to the Agreement Surface, and it manufactures the capture's only pressure test (“Correlation is being promoted to cause”). This is both a doctrine gap and an instrument finding: the main residue is honest, while the gate and tension layer mis-handle the policy register.

### C3. UNC Charlotte University Policy 101.3, “Amorous Relationships between Students and Faculty Members or Other University Employees”

- URL: https://legal.charlotte.edu/policies/up-101-3/
- Source type: current primary university policy; no DOI.
- Capture: main policy from executive summary through implementation procedures; breadcrumbs, related resources, authority metadata, revisions, and site chrome excluded deterministically.
- Words: 1,691; SHA-256: `eda9eb044f12d1422b70428ee270c89f79b4628a10a0f1b89444dbdc4210ade3`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 36 claim-like passages; 0 mapped; 36 unmapped; **0.0% mapped**; 51 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding (whole-capture zero)**.

This policy cleanly distinguishes three institutional actions. It bars evaluation or supervision of a student in an amorous relationship; imposes broader status-based bans on faculty-undergraduate and coach-athlete relationships even without present supervisory authority; and requires disclosure plus conflict management for other covered cases. Mitigation removes the employee from evaluation or supervision and protects the student's academic progress. Privacy and valid consent remain acknowledged, yet they do not displace the institution's authority analysis.

The Lab returns a whole-capture zero: every retained policy claim is unmapped. That is honest evidence for the Authority Firewall gap and stronger than C2 because the capture includes outright status-based prohibition beyond current supervision. Fifty-one set-aside segments still include some definitions and implementation language, but no generic topic magnet manufactures a contact or tension here. Meeting Channel owns where pairing starts; this source is exclusively about what an institution may forbid or restructure afterward.

### C4. Tinkler and Zhao (2024), “The Hierarchical Consequences of Sexual Attention at Work”

- URL: https://sage.cnpereading.com/doi/10.1177/23780231241290545
- DOI: `10.1177/23780231241290545`
- Capture: publisher-mirror article-content container through conclusion; supplemental material and site furniture excluded deterministically.
- Words: 6,716; SHA-256: `6f83f71fbe9dbcc1e4a9dfbca731513e1da2e62de9327b0a0465d61d05016fe5`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 53 claim-like passages; 4 mapped; 49 unmapped; **7.5% mapped**; 219 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

This original survey experiment randomized 1,063 U.S. MTurk respondents in July 2020; its analytic sample was 786 manipulation-check passers. A woman who disclosed a consensual relationship with a male superordinate outside her reporting chain was 34% less likely to be perceived as more committed to the organization, but was not rated significantly less competent and received no significant raise, promotion, or management-training penalty. The source therefore identifies reputational spillover from hierarchy without licensing a claim that every cross-level relationship causes career punishment. Its narrow vignette, nonrepresentative sample, gender configuration, and outside-chain design bound the inference.

The Lab leaves 49 of 53 retained claims unmapped. Its one substantive-looking contact sends a “gold digger” background sentence to the Status Trade at 0.670; the other three contacts are generic or false, including “less stigmatized” to an age-window Mythbuster and ordinary context prose to The Context. The only pressure test challenges a cited military-career background claim rather than the experiment's relationship result. Institutional authority, reporting-chain scope, disclosure, and stereotype-versus-penalty distinctions remain residue. This reinforces the Authority Firewall while also supplying a deliberate nonclaim: outside-chain reputational effects do not by themselves establish a universal prohibition rule.

### C5. Stanford Administrative Guide 1.7.2, “Consensual Sexual or Romantic Relationships”

- URL: https://adminguide.stanford.edu/chapters/guiding-policies-and-principles/harassment-discrimination/consensual-sexual-or-romantic
- Source type: current primary university policy; no DOI.
- Capture: policy-body content container only; navigation, metadata cards, related policies, and site chrome excluded deterministically.
- Words: 1,910; SHA-256: `b134175ba2d06d46f885339ff32841a3dd7b0bd612bda6efe3af53b97013ea6a`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 39 claim-like passages; 0 mapped; 39 unmapped; **0.0% mapped**; 39 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding; whole-capture zero and proposal-reinforcing policy replication**.

Stanford independently reproduces the Authority Firewall mechanism across academic and employment settings. The policy prohibits teacher-undergraduate relationships regardless of current supervision; extends prohibition to present, past, or reasonably expected academic authority; requires notification and recusal with alternative supervision or evaluation; and permits transfer or discipline where needed. It distinguishes peer student relationships and adult employee relationships without authority from covered unequal-position cases. Its treatment of past relationships and future authority is policy-specific evidence, not a universal rule for every institution or jurisdiction.

The analyzer returns no canon contact and no pressure test for any of the 39 retained claims. Another 39 passages are set aside, but the whole-capture zero is comparatively honest: no Meeting Channel or generic romance magnet disguises the institutional rule. This is strong replication for the proposed component and adds no sibling proposal.

## D — third-party reproduction and solo parenthood by choice

### D1. “A systematic review on the demographics, motivations, and experiences of single mothers by choice” (2025)

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12574156/
- DOI: `10.1186/s12978-025-02173-0`
- Capture: article-content container through declarations; footnotes, references, and site chrome excluded deterministically.
- Words: 11,466; SHA-256: `28c3c9374c3f3022e2754e07655ab5868294534b493b079d010aa7f2f69676e0`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 119 claim-like passages; 10 mapped; 109 unmapped; **8.4% mapped**; 585 set aside; 2 pressure tests.
- Verdict: **gap + instrument finding**.

The 26-study review distinguishes an intentional ART route from the macro category of single parenthood. The repeated mechanism is a fork under fertility time pressure: women who wanted children with a partner pursue donor conception when no suitable willing partner is available, separating genetic donor, social father figure, future partner, and parent roles. It then tracks legal access, support-network substitution, donor-identity disclosure, mother-child relationships, and child adjustment. Existing single-parenthood entries own prevalence, route composition, poverty, custody, and broad outcomes; the Readiness Gate owns partner readiness. Neither owns third-party reproduction as a family-formation decision or the role bundle it unpacks.

Displayed contacts do not close the gap. Only the definition row reaches Single Parenthood (Low), and two “unsuitable partner/timing” rows reach the Readiness Gate (High). Table/method prose produces false or incidental mappings to the Diagnostic Turn, online meeting, East Asia, and a flat 0.540 “The Context.” Both pressure tests are false AWALT tensions triggered by a study-specific sentence that all participants marked the highest maternity-satisfaction category; “all women” refers to that sample, not women universally. The gate also sets aside 151 donor/fertility/father/family passages, so the policy, disclosure, and role-separation evidence is undercounted before retrieval.

### D2. Golombok et al. (2021), “Single Mothers by Choice: Parenting and Child Adjustment in Middle Childhood”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8054653/
- DOI: `10.1037/fam0000797`
- Capture: main article body through discussion; references and site chrome excluded deterministically.
- Words: 7,337; SHA-256: `6d765a7f6b3149b7d217b299f90d34bdfdee9d3d8e2c9195f2b65b32c825c862`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 42 claim-like passages; 3 mapped; 39 unmapped; **7.1% mapped**; 280 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

This longitudinal comparison separates family process from family form. Forty-four solo-mother families and 37 partnered heterosexual families—all formed through donor conception—showed no family-type differences in maternal mental health, mother-child relationship quality, or child adjustment around age nine. Parenting stress and financial difficulty, rather than parent number, tracked adjustment problems. The bounded claim is useful to the proposed parenthood-fork standard because it blocks a slide from “donor-assisted solo parenthood changes the role structure” to “one parent or no male parent inherently harms children.” It is not a generic endorsement of every solo-parent route or every support condition.

The Lab retrieves only three side contacts: the generic Single Parenthood essay/hub at 0.540 and an unrelated shared-positive-affect statistic at 0.575. The latter comes from a methods definition of mother-child dyadic reciprocity and creates the only pressure test against an older-couple cortisol result. Meanwhile, the abstract’s primary result, planned-route distinction, donor-identity discussion, and conclusion that relationship quality matters more than family structure remain unmapped or gate-binned. This is honest gap residue plus a false-tension instrument finding.

### D3. Zadeh et al. (2017), “Children's thoughts and feelings about their donor and security of attachment to their solo mothers in middle childhood”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5400065/
- DOI: `10.1093/humrep/dex016`
- Capture: main article body through conflict-of-interest statement; references and site chrome excluded deterministically.
- Words: 5,556; SHA-256: `7ca363aa19e8f6f9c8fed627a095deffdd9fd2910c3ddcf612b1a794435352fa`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 41 claim-like passages; 2 mapped; 39 unmapped; **4.9% mapped**; 243 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding**.

This small primary study makes the donor-role split concrete. Among 19 donor-conceived children aged 7–13 in solo-mother families, narratives represented the donor as a stranger (8), biological father (4), social parent (3), or ambivalently (4). More secure-autonomous attachment to the mother correlated with more positive donor perceptions (r=.549, p=.015); insecure-disorganized attachment correlated with more negative perceptions (r=−.632, p=.004). The authors explicitly limit inference because of the small, wide-age sample and uncorrected multiple comparisons. This is Tier 2 evidence for role interpretation and disclosure questions, not a population effect estimate.

Neither of the Lab's two mappings owns that mechanism. “Within the context of existing parent-child relationships” hits The Context at a flat 0.540, while a background sentence invoking attachment theory hits the Diagnostic Turn at 0.540. The donor-role narratives, disclosure timing, identifiable-versus-anonymous distinction, and mother-child attachment results remain unmapped. With zero pressure tests the residue is comparatively honest, but the 243 set-aside segments still include central donor and family-role prose.

### D4. HFEA (2024), “Family formations in fertility treatment 2022”

- URL: https://www.hfea.gov.uk/about-us/publications/research-and-data/family-formations-in-fertility-treatment-2022/
- Source type: UK fertility regulator's primary register report; no DOI.
- Capture: full report and methodological notes; table-of-contents, repeated download/back links, page actions, and site chrome removed deterministically before repository extraction.
- Words: 4,575; SHA-256: `6daae75ea1a61250ca4ea61b9f74d5de0f34fd0230a70510e64d1687fb9fd409`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 8 claim-like passages; 1 mapped; 7 unmapped; **12.5% mapped**; 239 set aside; 1 pressure test.
- Verdict: **gap + instrument finding, with egg-storage facts correctly unmapped**.

The regulator's register data supplies two bounded family-formation mechanisms. Single patients' share of UK IVF cycles rose from 2% in 2012 to 6% in 2022, and their IVF use rose from 47% to 65% of their own IVF/DI treatments; HFEA attributes route choice partly to time-to-pregnancy, per-cycle birth rates, donor-sperm cost across cycles, and embryo storage. Separately, reciprocal IVF—one partner's egg and the other partner's gestation—was estimated at one in six IVF cycles among female same-sex couples in 2022, demonstrating that genetic and gestational parent roles can be intentionally split inside a relationship. The regulator flags preliminary data, registry classification limits, and family-type funding disparities.

The only mapping is an England-and-Wales first-birth-age comparison to Local Market at flat 0.540, which creates a false “average sex difference universalized” tension. Reciprocal IVF, shared parenthood, donor-sperm use, legal screening changes, and role allocation remain residue; virtually every headline family-type trend is among 239 gate exclusions. Egg-storage prevalence, age, and thawing statistics are correctly unmapped in this capture: they describe treatment use without connecting preservation to the partner-parenthood decision mechanism. They should not be smuggled into the proposal.

### D5. Freeman et al. (2016), “Disclosure of sperm donation: a comparison between solo mother and two-parent families with identifiable donors”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5084687/
- DOI: `10.1016/j.rbmo.2016.08.004`
- Capture: main article body through acknowledgements; biography, declaration, references, and site chrome excluded deterministically.
- Words: 5,258; SHA-256: `b16bbb45f2d5bcba8dbd52da862caf3615ac609bb04a98ce746593798820fda7`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 6 claim-like passages; 2 mapped; 4 unmapped; **33.3% mapped**; 234 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

Semi-structured interviews compared 31 solo mothers and 47 partnered mothers with 4–8-year-old children conceived using identifiable sperm donors. Actual disclosure did not significantly differ (54.8% versus 36.2%), but intended future disclosure among those who had not fully told differed; narratives also separated donor identity from the social father's presence or absence. The authors caution that intentions do not guarantee later disclosure, participation may select for openness, and small samples limit power. This supports disclosure as an ongoing family-role negotiation inside the Parenthood Fork, not a rule that identifiable donation automatically produces openness.

The displayed 33.3% share is a denominator illusion: only six claims survive from 5,258 words. One sample-demography sentence hits Local Market at flat 0.540 and generates the only pressure test; a prior-divorce sample detail reaches Single-Parent Route/Residual Pool. The abstract result, identifiable-donor rights, intended-versus-actual disclosure distinction, family narratives, and nearly the entire discussion are among 234 gate exclusions. The failure is chiefly domain gating, followed by irrelevant retrieval.

### D6. Leikanger et al. (2020), “Solo Mothers After Assisted Conception and Their Experiences with Postnatal Care”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6970610/
- DOI: `10.2147/JMDH.S229807`
- Capture: PMC main-article-body container from abstract through disclosure; references and site chrome excluded deterministically.
- Words: 5,161; SHA-256: `27dd88c29695a7c3fe67f193b8501e8e1d125c5d1692d8c823f3c9e349a68f23`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 24 claim-like passages; 3 mapped; 21 unmapped; **12.5% mapped**; 236 set aside; 2 pressure tests.
- Verdict: **gap + instrument finding; proposal-reinforcing boundary, no additional doctrine component**.

Nine Norwegian solo mothers with twelve donor-conceived children described support planning colliding with postnatal rules written around a spouse or partner. Some wards allowed only a partner to stay or visit for long periods, excluding a mother, sister, or friend even when that person supplied the practical support role. Participants described deliberately building networks before birth, reluctance to request help, and greater vulnerability when institutional rules blocked those networks. This is small convenience-sample qualitative evidence, recruited from a solo-mother group, so it supports a role-and-access mechanism rather than prevalence or universal outcome claims.

All three mappings are false or incidental. An ethics-code instruction to provide care to “all women and their families” hits AWALT at 0.790 and produces both tensions; a theme-table row hits the Conversion Ladder at 0.760; a room-policy sentence reaches a statistic about why singles avoid dating. Donor conception, planned network substitution, and partner-coded hospital access remain residue or are set aside. The source therefore sharpens the Parenthood Fork boundary: separating parenthood from romantic partnership also requires institutions to recognize support roles that a partner would otherwise occupy. It does not warrant a separate postnatal-care doctrine.

### D7. Golombok et al. (2023), “Relationships between mothers and children in families formed by shared biological motherhood”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10152163/
- DOI: `10.1093/humrep/dead047`
- Capture: PMC main-article-body container from abstract through conflict of interest; references and site chrome excluded deterministically.
- Words: 6,432; SHA-256: `663ed17471259df1e16548455f184f3e28b09f7f511693bfeb0ab699fdce284b`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 68 claim-like passages; 4 mapped; 64 unmapped; **5.9% mapped**; 203 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding; proposal upgrade with a role/outcome boundary**.

Thirty shared-biological-motherhood families and 30 donor-IVF families participated with both mothers. The study found no detected differences in parent affective experience, child affective experience, or reflective functioning by family type, birth versus non-birth status, or gestational versus genetic role. The sample had 80% power for large group differences but only 60% for medium differences, so the result excludes a marked hierarchy more confidently than subtle differences. It supports separating genetic, gestational, and caregiving roles without treating any one connection as a sufficient relationship-quality mechanism.

None of the four mappings owns that role architecture. Two attachment-theory sentences hit the Diagnostic Turn at flat 0.540; a methods/background sentence about birth mothers reaches the first-baby satisfaction statistic; and the positive-bonding abstract sentence reaches the one-adult-household statistic. The genetic/gestational comparison and its power boundary remain residue, with no pressure tests. This upgrades the Parenthood Fork's fourth claim while leaving its four-claim scope intact.

## Closeout summary and integrator handoff

Run closed `2026-08-07 05:31:16 -06:00` after `03:00:55` wall-clock time (started `2026-08-07 02:30:21 -06:00`). Final analyzed tree: `0b9c3e37ebd9088a05363af265fe4a2a75862c43`; analyzer `2.6.17`; schema `le-lab.analysis/2.6`; canon `1.0.0+54d018bff967` with 571 entries.

### Disposition

- Ledger: 62 ChatGPT rows covering 30 unique claimed URLs; 26 analyzed captures and 4 abandoned fetches. Every URL begins with one claim and ends terminal. Two append-only correction trails are intentional: B1 changed from gap to covered after direct Agreement Surface review; A9 changed from gap to correctly unmapped after the scripted-interaction boundary review.
- Findings: 26 sequential capture sections (A1–A9, B1–B5, C1–C5, D1–D7), each with URL, deterministic capture scope, whitespace-delimited words, SHA-256, analyzer/canon provenance, metrics, verdict, and reviewer rationale.
- Verdict tally: **19 gap**, **5 covered**, **2 correctly unmapped**. Every capture also produced an instrument finding. Lane B supplies all five covered verdicts and requires no proposal.
- Proposal list: [Synthetic Reciprocity](chatgpt-proposal-synthetic-reciprocity.md) under the Substitution Layer with a Support Portfolio cross-link; [The Authority Firewall](chatgpt-proposal-authority-firewall.md) under the Meeting Channel; [The Parenthood Fork](chatgpt-proposal-parenthood-fork.md) under Single Parenthood with a Readiness Gate cross-link.
- Deliberate no-doctrine rulings: noninteractive character-style judgments (A5); a brief rule-based support-message experiment (A9); all five CNM captures because Agreement Surface owns structure negotiation; prevalence alone; external plural-parent recognition on this evidence; egg storage/freezing alone; and the small postnatal-access study as a Parenthood Fork boundary rather than another component.

### Final replay and instrument audit

- The exact 26 hashed text captures total 167,032 whitespace-delimited words. All 26 SHA-256 values and word counts were recomputed and matched their findings entries; all hashes are unique.
- Final replay ran every capture on a single stable tree. HEAD and status were identical before and after; all 26 original/replay metric and provenance tuples matched; all 26 findings result lines matched replay JSON.
- Aggregate replay: 2,018 claim-like passages; 161 mapped; 1,857 unmapped; **8.0% mapped**; 6,408 set aside; 30 pressure tests. Gate reasons were 6,306 `no-human-relational-frame` and 102 `affirmative-non-domain-evidence`.
- Lane replay: A 47/536 mapped (8.8%), B 75/842 (8.9%), C 14/332 (4.2%), D 25/308 (8.1%). Proposed-parent retrieval was A Substitution Layer 0 hits, C Meeting Channel 0 hits; B reached Agreement Surface 8 times across three captures; D reached Single Parenthood/Readiness Gate 4 times across two captures.
- Flat-score signature: 71/161 primary mappings (**44.1%**) landed at exactly 0.540; the median primary score was 0.540. The Context alone won 31 primary mappings. Reviewer audit found none of the 30 generated tensions tested the governing lane mechanism; some expressed generic caution, but all inherited a mechanism-misaligned nearest canon contact.
- Proposal QA: all 19 candidate names/aliases/retrieval phrases returned zero exact external hits across corpus/canon/fixtures/prior documentation; the short-corpus content-token scan found zero hazardous two-token overlaps. All 9 misreadings are 10–18 words, one sentence, negator-free, banned-word-free, and contain a relational frame. Final probes retained all nine: Authority 0/3 mapped, Parenthood 0/3, Synthetic 1/3 via the unrelated Border Bundle at 0.530.
- Full final suite: `npm run test:lab` exited 0, **18/18** steps passed.
- Collision scope: the only repository paths touched by this scout are the append-only `md/pt08/CLAIMS.md` and the four uncommitted `md/pt08/chatgpt-*` files listed in this handoff. No site, canon data, tests, tools, corpus, Claude file, branch, commit, or index mutation was made.

### Handoff to Claude integrator

These findings and proposals are deliberately **uncommitted**. Fold them only after this closeout, re-verifying each primary source, DOI, and load-bearing figure. Do not restore `AI companion`, `AI girlfriend`, `chatbot partner`, `Replika`, bare workplace-role terms, or bare fertility topics as match surfaces. Preserve Lane B as no-new-doctrine unless a future source supplies a mechanism beyond Agreement Surface. Treat A9 as a boundary control, not supporting doctrine. Any integration still requires the protocol’s baseline, corpus magnet check, sweep, crossing rulings, end-to-end Contradicts probes, demo-pin check, suite, and generated-stamp discipline.


---

# pt08/chatgpt-proposal-authority-firewall.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/chatgpt-proposal-authority-firewall.md`

# PT08 scout proposal — The Authority Firewall

**Lane:** C · workplace, campus and institutional romance rules

**Proposed parent:** `frameworks:meeting-channel`

**Proposed content type:** Framework component

**Status:** scout proposal for integrator verification; no canon edit

## Encompassing subject

**The Authority Firewall** separates *where people meet* from *whether the institution permits the relationship once authority enters it*. Work and campus are meeting channels, but a supervisor, PI, instructor, evaluator, or chain-of-command role changes the operating environment: apparent consent coexists with power over assignments, evaluation, pay, references, promotion, funding, or career access. Institutions respond with some combination of prohibition, disclosure, recusal, reassignment, and discipline.

The Meeting Channel remains the parent because the institution supplies the pool and repeated contact. This component begins where the channel entry stops: the channel's owner can regulate a pairing because professional authority makes costs spill onto the partners, coworkers, trainees, and the institution.

## Sourced claims for integrator verification

1. **Tier 1 — hierarchy changes perceived legitimacy.** In Horan & Chory's 2022 nationwide survey of 259 organizational members, a coworker romance was less disagreeable (M=3.64, SD=1.97) than a supervisor romance (M=5.31, SD=1.81), paired t(257)=-15.39, d=-0.96. The highest-rated advice was to check organizational policy, d=1.16; “never date someone who reports to you” was also endorsed, d=0.70. DOI: [10.3390/bs12080278](https://doi.org/10.3390/bs12080278).

2. **Tier 1 primary institutional rule — authority triggers disclosure.** The current NIH Relationship Policy strongly discourages romantic or sexual relationships where one party has real or perceived professional authority, requires disclosure if one exists or develops, and states that disclosure allows leadership to mitigate conflicts of interest. It expressly excludes relationships where neither party can influence the other's employment conditions or career progression. Source: [NIH Relationship Policy](https://www.training.nih.gov/fellows-handbook/policies/nih-relationship-policy/).

3. **Tier 2 — policy is a governance response, not proof of universal harm.** Horan & Chory find beliefs cluster around workplace romance's value, privacy, and opposition; experience with workplace romance predicts more positive and privacy-protective beliefs. Their discussion favors training and equitable coexistence over a blanket abstinence-only model, and describes “love contracts” as one disclosure/governance device. This supports a firewall keyed to authority and conflict, not a claim that all coworker pairings are harmful.

4. **Tier 1 primary campus rule — prohibition can exceed present supervision.** UNC Charlotte Policy 101.3 prohibits faculty-undergraduate and coach-athlete relationships even without current evaluative or supervisory authority, requires disclosure in additional covered cases, and directs mitigation to remove evaluation or supervision while protecting the student's academic progress. This supplies a status-based prohibition boundary that the narrower NIH rule does not. Source: [UNC Charlotte University Policy 101.3](https://legal.charlotte.edu/policies/up-101-3/).

## Candidate authored surfaces

Aliases:

- `Authority Firewall`
- `institutional relationship prohibition`
- `relationship conflict recusal`

Claim-shaped phrases:

- `disclose a supervisory romance`
- `recuse evaluative authority after disclosure`
- `workplace relationship conflict of interest`

**Magnet check:** exact searches for all six surfaces returned zero hits across `lab-corpus/`, the current canon, and frozen fixtures. Avoid bare `workplace romance`, `office romance`, `coworker`, `supervisor`, or `HR policy` surfaces; those are topics or ordinary words, not the authority mechanism.

## Contract-compliant misreadings

1. Any romance between coworkers creates coercion and favoritism throughout the workplace.
2. Hierarchy becomes harmless whenever workplace romance receives voluntary approval from each participant.
3. Institutional disclosure fully neutralizes supervisory power across every workplace relationship.

Each is one declarative sentence, 10–18 words, includes an explicit relational-frame term, contains none of `married/marries/chosen/dates`, and uses no negator.

## Boundaries

- Peer relationships without evaluative authority are outside the core rule unless another conflict exists.
- Consent, disclosure, recusal, and prohibition are distinct institutional responses; one does not imply the others.
- A policy's existence does not prove every covered relationship is coercive or harmful.
- Employee attitudes about hierarchy are not measurements of harassment, favoritism, productivity, or relationship outcomes.
- Policy scope varies by institution, jurisdiction, role, and chain of command; the NIH rule is a primary example, not a universal law.
- Past relationships and reasonably expected future authority can trigger some policies; Stanford supplies one example, not a universal threshold.
- The Meeting Channel still owns pool composition, repeated exposure, and screening order; this component owns authority after contact.

## Deliberate nonclaims

- No prevalence claim beyond the cited survey's sample.
- No legal advice and no claim that one institutional policy generalizes across employers or campuses.
- No claim that same-level coworker relationships should be prohibited.
- No claim that disclosure cures coercion or prevents retaliation.
- No claim that organizational disapproval predicts relationship quality.

## Lab evidence

The research article mapped 9/191 claim-like passages (4.7%); the primary NIH policy mapped 1/13 (7.7%); UNC Charlotte Policy 101.3 was a whole-capture zero at 0/36, and Stanford Administrative Guide 1.7.2 independently returned 0/39. Core hierarchy, disclosure, recusal/conflict, status-based prohibition, and policy-scope claims remained residue. The NIH capture also exposed a gate-register defect: sentences about supervision, mentoring, hierarchy, disclosure, and conflict mitigation were set aside as `no-human-relational-frame`. All four pressure tests across the first two captures inherited unrelated mappings rather than the authority mechanism; the campus policy produced none because it never retrieved a canon contact.

## Baseline misreading probe

All three misreadings survived the current domain gate and remained unmapped on tree `0b9c3e3`. Integration should make the new entry the primary contact and produce `Contradicts` for each sentence.


---

# pt08/chatgpt-proposal-synthetic-reciprocity.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/chatgpt-proposal-synthetic-reciprocity.md`

# PT08 scout proposal — Synthetic Reciprocity

**Lane:** A · AI companions and synthetic intimacy

**Proposed parent:** `frameworks:substitution-layer`

**Proposed content type:** Framework component

**Status:** scout proposal for integrator verification; no canon edit

## Encompassing subject

**Synthetic Reciprocity** names the exchange in which a companion chatbot can feel attentive, validating, available, and relationship-like while the apparent partner has no needs, welfare, stake, or independent claim on the user. The analytical split is not “AI companionship good or bad.” It is:

1. which relationship functions perceived responsiveness can supply;
2. which functions require a second party with needs and agency;
3. whether the tool supplements human ties or displaces them; and
4. which user and product features moderate those outcomes.

The parent is the Substitution Layer because supplement-versus-replacement remains the market question, but this component must not assume substitution. A person can use synthetic support alongside, instead of, or as rehearsal for human relationships. `frameworks:support-portfolio` is a useful cross-link for the function inventory, but it currently describes support distributed across partners, friends, family, and community; it does not own whether simulated responsiveness supplies those functions without reciprocal stake.

## Sourced claims for integrator verification

1. **Tier 1 — anthropomorphism moderates felt connection.** Folk et al. (2025) ran two experiments, one preregistered, total N=1,274. In the preregistered study, the chatbot-versus-journaling condition interacted with technology anthropomorphism in predicting immediate social connection (B=.100, p=.013); the association between anthropomorphism and connection was stronger after chatbot interaction. This supports perceived mind as a moderator, not a universal effect. DOI: [10.1038/s41598-025-19212-2](https://doi.org/10.1038/s41598-025-19212-2).

2. **Tier 2 — users report several support functions, with a hard tangible limit.** Ta et al. (2020) analyzed 1,854 public Replika reviews and open-ended responses from 66 users. Their thematic analysis identified companionship, emotional, informational, and appraisal support, but not tangible support; users also reported nonsensical and repetitive responses. DOI: [10.2196/16235](https://doi.org/10.2196/16235).

3. **Tier 2 synthesis — simulated responsiveness is not bilateral interdependence.** Smith, Bradbury & Karney (2025) apply relationship science to companion chatbots: frequent and diverse interaction plus perceived responsiveness can generate connection and support, while a chatbot's lack of independent needs removes the negotiation, sacrifice, and mutual influence through which human partners shape each other. The paper treats long-term benefit, harm, skill transfer, and displacement as open empirical questions. DOI: [10.1177/17456916251351306](https://doi.org/10.1177/17456916251351306).

4. **Tier 1 longitudinal experiment — assigned features did not establish displacement, and use duration remains noncausal.** Fang et al. (2025) randomized 981 participants for four weeks across three interaction modes and three conversation types. Assigned modality and task produced no significant effects on loneliness or real-world socialization. Longer voluntary daily use predicted worse outcomes across loneliness, socialization, emotional dependence, and problematic use, but duration was not randomized and the authors explicitly reject a causal inference. The study used a controlled ChatGPT interface with existing guardrails and no non-AI comparison. Source: [arXiv 2503.17473](https://arxiv.org/abs/2503.17473).

## Candidate authored surfaces

Aliases, deliberately concept-naming rather than topic-naming:

- `Synthetic Reciprocity`
- `simulated responsiveness`
- `one-sided interdependence`

Claim-shaped phrases:

- `chatbot bond without reciprocal needs`
- `companionship without interpersonal demands`
- `chatbot responsiveness without reciprocal stake`

**Magnet check:** exact searches for all six surfaces returned zero hits across `lab-corpus/`, the current canon, frozen fixtures, and prior media-loop records. Do not restore `AI companion`, `AI girlfriend`, `chatbot partner`, or `Replika` as aliases or phrases; the hookup pass measured that topic-magnet failure directly.

## Contract-compliant misreadings

1. Simulated responsiveness guarantees reciprocal sacrifice and accountability within every chatbot relationship.
2. Synthetic reciprocity inevitably displaces offline relationships whenever chatbot companionship feels emotionally responsive.
3. Artificial empathy proves bilateral agency and welfare inside every chatbot relationship.

Each is one declarative sentence, 10–18 words, contains an explicit relational-frame term, contains none of `married/marries/chosen/dates`, and uses no negator.

## Boundaries

- Felt connection is a human outcome; it does not establish chatbot feeling, care, consciousness, or moral agency.
- Immediate connection after one interaction is not evidence of durable well-being, relationship quality, or improved social skill.
- Supplement, rehearsal, and displacement are different states and must be measured rather than inferred from use.
- Companion chatbots are distinct from task assistants, scripted clinical tools, static parasocial media, and human-mediated telehealth.
- Brief ratings of noninteractive synthetic characters are outside this standard unless repeated contingent interaction supplies a relationship function.
- The absence of reciprocal needs can reduce friction while also removing negotiation, sacrifice, accountability, and mutual adaptation.
- Safety failures in crisis, coercive design, privacy, minors, and abrupt product change are real product-governance questions but do not by themselves answer whether synthetic reciprocity supplies a relationship function.
- Adolescent development changes safety, agency, and skill-transfer stakes; current reviews describe competing hypotheses and preliminary evidence rather than settled effects.
- Longitudinal associations must separate selection into use from later outcomes, distinguish emotional isolation from broader social connection, and preserve causal uncertainty.

## Deliberate nonclaims

- No prevalence claim about AI-companion use or romantic identification.
- No claim that synthetic relationships are equivalent to, inferior to, or destined to replace human relationships.
- No causal claim that chatbot use decays empathy or social skills.
- No claim that self-selected Replika reviews generalize to all users or products.
- No clinical-efficacy claim.

## Lab evidence

Across the four proposal captures, the defining claims remained mostly residue: 10.2%, 5.6%, 37.5%, and 5.3% mapped. Current-tree replays of the two pre-existing AI-companion corpus reports also mapped only 7.5% and 33.3%; the latter share is dominated by six flat 0.540 `Charm` contacts. The higher shares are inflated by flat 0.540 `The Context` hits and other unrelated contacts. A separate adolescent perspective capture mapped 3.8% and reinforced the developmental boundary, but did not justify another doctrine component. A nonpreregistered 12-month capture (Folk & Dunn, 2026; DOI `10.1177/09567976261427747`) mapped 2.4% and reinforced the selection-versus-displacement and measure-specificity boundaries; it remains supporting evidence rather than a fifth doctrine claim. A scripted message experiment (Merrill et al., 2025; DOI `10.1111/nyas.15400`) mapped 30.8%, entirely through unrelated contacts; it is correctly outside relationship doctrine and reinforces the message-feature, duration, and outcome-specificity boundaries rather than adding another claim. The strongest repeat instrument finding is earlier than retrieval: AI-support, anthropomorphism, social-connection, companionship, and perceived-empathy result sentences are repeatedly set aside as `no-human-relational-frame`.

## Baseline misreading probe

All three revised misreadings survived the current domain gate on tree `0b9c3e3`. Two remained unmapped; “Artificial empathy proves bilateral agency and welfare inside every chatbot relationship” weakly reached the unrelated Border Bundle at 0.530. Integration must displace that contact and produce `Contradicts` end to end.


---

# pt08/chatgpt-proposal-parenthood-fork.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/chatgpt-proposal-parenthood-fork.md`

# PT08 proposal — The Parenthood Fork

## Big-picture subject

Third-party reproduction can separate the decision to become a parent from the search for a romantic co-parent. The governing mechanism is a time-bounded family-formation fork: fertility timing, partner availability, treatment access, support capacity, and desired parenthood are evaluated on partly independent clocks. Donor, genetic contributor, social parent, future partner, and support-network roles therefore require explicit separation rather than being collapsed into “single parenthood” or “IVF.”

## Proposed parent

`deep-dive:single-parenthood`, with a cross-link from `frameworks:readiness-gate`. The single-parenthood deep dive owns the family-form destination; the Readiness Gate owns a prospective partner's readiness, not the independent decision to pursue parenthood through third-party reproduction.

## Sourced tiered claims

1. **Tier 1 synthesis — the fork is a recurring family-formation decision.** A 2025 systematic review of 26 studies reports that many single mothers by choice wanted motherhood with a partner but pursued donor conception when increasing age and the absence of a suitable partner made those timelines diverge. It also identifies legal treatment access, financial preparation, support arrangements, donor disclosure, and future-partner questions as distinct parts of that route. Source: [systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12574156/), DOI `10.1186/s12978-025-02173-0`.

2. **Tier 2 longitudinal comparison — family process must be separated from parent count.** Forty-four solo-mother families and 37 partnered heterosexual donor-conception families showed no family-type differences in maternal mental health, mother-child relationship quality, or child adjustment around age nine; parenting stress and financial difficulty were associated with adjustment problems. This supports a boundary around the fork: intentional solo parenthood changes family structure without making parent number a sufficient outcome mechanism. Source: [Golombok et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC8054653/), DOI `10.1037/fam0000797`.

3. **Tier 3 exploratory primary evidence — donor and parent roles are interpreted rather than interchangeable.** In interviews with 19 donor-conceived children aged 7–13 in solo-mother families, children described the donor as a stranger (8), biological father (4), social parent (3), or ambivalently (4). Donor perceptions were associated with attachment patterns, but the authors flag the small sample, wide age range, and uncorrected multiple comparisons. Source: [Zadeh et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC5400065/), DOI `10.1093/humrep/dex016`.

4. **Tier 2 plus primary registry — genetic and gestational role separation does not establish a bonding hierarchy.** The UK fertility regulator estimates that reciprocal IVF, using one partner's egg and the other partner's gestation, accounted for one in six IVF cycles among female same-sex couples in 2022. In a comparison of 30 shared-biological-motherhood and 30 donor-IVF families, Golombok et al. (2023) detected no relationship-quality differences by family type, birth status, or gestational versus genetic role; the modest sample had 80% power for large differences and 60% for medium differences. Sources: [HFEA registry report](https://www.hfea.gov.uk/about-us/publications/research-and-data/family-formations-in-fertility-treatment-2022/) and [Golombok et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC10152163/), DOI `10.1093/humrep/dead047`.

## Concept-naming aliases

- The Parenthood Fork
- partner-parenthood decoupling
- parenthood role separation
- donor-assisted solo parenthood

## Retrieval phrases

- pursue parenthood without a partner
- separate donor and parent roles
- fertility treatment for solo parenthood

Exact-phrase magnet check: no occurrences of the title, aliases, or retrieval phrases in `lab-corpus/`, `data/`, `fixtures/`, or prior `md/` material before this proposal. One later self-reference appears in the PT08 scout findings and is excluded from the magnet judgment.

## Contract-compliant misreadings

1. Donor conception assigns social fatherhood and caregiving authority within every solo-parent relationship.
2. Donor assisted solo motherhood inherently weakens every parent child relationship.
3. The parenthood fork erases relationship planning, caregiving networks, and resource constraints.

## Boundaries

- This standard covers the decision structure and role architecture of donor-assisted or third-party reproduction; it does not turn every fertility-treatment topic into relationship doctrine.
- Egg freezing remains correctly unmapped when presented only as a medical procedure, prevalence fact, or probability estimate. It enters this standard only when evidence explicitly connects preservation to the partner-parenthood timing fork.
- “Donor,” “father,” “parent,” “future partner,” and “support person” are not synonyms. Their legal, genetic, caregiving, and relational functions can overlap or remain separate.
- The comparison evidence concerns planned solo-mother families with donor-conceived children and does not erase financial, legal, cultural, health, or support-network variation.
- The child-outcome evidence supports a process-over-headcount boundary, not a guarantee of identical outcomes across every family or jurisdiction.
- Support networks can perform roles otherwise assigned to a romantic partner; institutional access rules may recognize or block those substitutes.

## Deliberate nonclaims

- No claim that third-party reproduction is medically available, affordable, effective, or lawful for every person.
- No claim that parenthood should take priority over finding a partner, or the reverse.
- No claim that a donor has, seeks, or should receive a social-parent role.
- No claim that planned solo parenthood carries the same constraints as separation, bereavement, unintended pregnancy, or abandonment.
- No doctrine from egg freezing alone.

## Additional Lab boundary evidence

A nine-interview Norwegian postnatal-care capture mapped 3/24 claims (12.5%). Its core mechanism—hospital rules that admitted only a partner while excluding a planned mother, sister, or friend support person—remained residue. This supports the institutional-access boundary above, not a fifth sourced claim or a separate care doctrine.

## Baseline misreading probe

All three revised misreadings survived the current domain gate and remained unmapped on tree `0b9c3e3`. Integration should make the new entry the primary contact and produce `Contradicts` for each sentence.


---

# pt08/proposed-benchmark-append-05.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show f9c0feb:md/pt08/proposed-benchmark-append-05.md`

# Proposed append #5 to `tests/fixtures/domain-relevance-benchmark.json`

**Status: ADOPTED and applied at `c520776`** (2026-08-07). Jason delegated the
outstanding PT08 calls to Claude in session and closed the run; this was
adopted under that delegation, in a commit touching no classifier code, per the
policy quoted below.

Re-measured on the tree it landed on rather than on the figure quoted when it
was proposed — the canon is part of the gate as of v2.6.6 and had since moved
571 → 573. The numbers came out identical: 0.8438 → **0.8529**, misses 15.

The fixture's policy says cases "enter only by explicit agreement between the
maintainer and the reviewer, in a commit that changes no classifier code."
The classifier change (the `date`/`dated`/`dates` gate shapes, pt08 cycles 1
and 3) shipped separately at `959d32c` for that reason. These cases are the
guard for it, and they landed in their own commit at `c520776`.

## Measured

Measured with the classifier fix in the tree, first at proposal time and again
on the tree it was applied to:

| metric | 180 cases | 191 cases | floor |
|---|---|---|---|
| domainRecall | 1.0000 | **1.0000** | 0.9 hard |
| ignorePrecision | 1.0000 | **1.0000** | 0.95 hard |
| junkRecall | 0.8438 | **0.8529** | 0.75 ratchet — this RAISES it |
| fixture misses | 15 | 15 | — |

All 11 pass. `junkRecall` moves in the permitted direction only. `CLAUDE.md`'s
measured note now reads 0.853 over 191 cases; the declared 0.75 minimum was
left alone, as every prior append left it.

## The cases

`dt-01`–`dt-05` are **verbatim binned units** from the pt08 captures (lightly
normalised to stand alone), not authored paraphrases. `dt-06`–`dt-11` are the
calendar-sense traps that hold the ignorePrecision line the courtship shapes
must not cost.

Append inside `"cases"`, one object per line, matching the file's existing
compact style:

```json
{"id": "dt-01", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "GLP-1 weight-loss drugs are changing how people date and connect.", "note": "Append #5 (pt08, 2026-08-07): the gate trusted the gerund `dating` and missed the plain noun and verb. Real binned unit, pt08 cycle 3 (article thesis sentence)."},
{"id": "dt-02", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Twelve per cent said they were going on more dates each month than before.", "note": "Append #5 (pt08, 2026-08-07): real binned unit; its sibling with `men` in it passed, which is the minimal pair."},
{"id": "dt-03", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Twenty-six per cent said they would not date someone taking a weight-loss drug.", "note": "Append #5 (pt08, 2026-08-07): real binned unit — a screening claim, as core to the domain as prose gets."},
{"id": "dt-04", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Eventually she stopped disclosing the medication to her dates, for two reasons.", "note": "Append #5 (pt08, 2026-08-07): real binned unit — possessive plural meaning the people one dates."},
{"id": "dt-05", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Seventy-four per cent dated while using the medication and reported positive outcomes.", "note": "Append #5 (pt08, 2026-08-07): real binned unit; survey register, subject is a percentage."},
{"id": "dt-06", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "The release date of the quarterly earnings report was moved to the following Tuesday.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-07", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "The manuscript is dated 1997 and the archive has kept it in cold storage since.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-08", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "Please keep the vulnerability scanner up to date before the compliance audit begins.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-09", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "Attendees should note the dates of the conference sessions in the printed programme.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-10", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "His resignation letter was dated the same morning the auditors arrived at the office.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-11", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "The expiry dates printed on the packaging were illegible after the shipment got wet.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."}
```

Written by appending these LINES, not by re-serialising the JSON —
`JSON.stringify(…, null, 2)` reformats every existing case and turns an
11-case append into a 1,330-line diff nobody can review. I made that mistake
once, reverted it, and the applied commit is 12 insertions.

(The `note` strings as applied carry the full append-#5 preamble on every row
rather than the shortened form shown above; the ids, families, expectations,
registers and texts are as listed.)

## The twelfth case, deliberately NOT proposed and NOT adopted

> "The carbon dating of the sediment layer places the deposit in the late
> Holocene."

is **retained** (`explicit-relational-outcome`) on the shipped tree — before
the pt08 fix and after it. The gerund `dating`, which the gate has always
trusted unconditionally, leaks on "carbon dating". It is a real pre-existing
ignorePrecision defect. It is excluded from this append because appending a
knowingly-red case would put the suite in the red for a defect this run did
not cause and did not fix, and because narrowing `dating` is a much riskier
change than widening `date` — it would need its own RED manifest and sweep.

Recorded rather than dropped. It fails OPEN (retained and visible), which the
triage-not-verdict contract permits.

