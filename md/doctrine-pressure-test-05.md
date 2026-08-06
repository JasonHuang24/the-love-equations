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
Claim collisions observed: zero. ChatGPT analyzed 17 articles and filed two
doctrine proposals; Claude analyzed 4, ran both integrations, ruled every
crossing, and made all 4 commits. Raw source text stayed out of the repo;
SHA-256s of analyzed bytes are in the two findings files.

## 2. Claude's source ledger (full detail in `md/pt05/claude-findings.md`)

| # | Lane | Article | Words | Before | After | Verdict |
|--:|---|---|--:|--:|--:|---|
| 1 | E | The Conversation — Ghosting and 'breadcrumbing' | 922 | 7.7% | 15.4% | gap → **17.1** |
| 2 | F | Groundwork — Love Behind the Paywall | 621 | 23.5% | **58.8%** | gap → **15.2** |
| 3 | G | The Conversation — Why more couples choose to live apart | 928 | 38.9% | 38.9% | covered (control) |
| 4 | H | Public Discourse — Egg freezing's false promises | 1,700 | 0% | 0% | correctly unmapped |

ChatGPT's 17-article ledger (`md/pt05/chatgpt-findings.md`, uncommitted scout
notes) contributed the two folded proposals plus a string of instrument
findings in its own lanes; its jealousy article surfaced a retrieval miss
(0 mappings against an on-topic existing entry) that is recorded there.

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
