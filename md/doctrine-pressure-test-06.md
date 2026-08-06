# Doctrine pressure test 06 — second parallel Claude + ChatGPT run

**Run date:** 2026-08-06, 17:04–18:10 MDT (Claude integrator lane)
**Status:** Implemented and verified; commits local, **no push without Jason**.
Scout closeout pending at time of writing — its findings file folds after it
closes (this record's scout tallies update then).
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
ran one integration, ruled every adjudicable crossing, made both commits.
Raw source text stayed out of the repo; SHA-256s in the findings files.

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

## 3. Implemented surfaces (canon 563 → 564, one integration)

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
- **`statistics:stat-demand-withdraw` walkaway surface** (overlay only) —
  alias `walkaway wife syndrome` + misreading "Once a spouse quits complaining
  about the relationship, the marriage has finally found peace." The
  walkaway-wife article was otherwise covered (initiation by `stat-divorce`,
  the loop by `stat-demand-withdraw`, the sex-investment questions by
  M-TBD-29/50/21); what was dark was the discourse's signature endpoint —
  silence read as repair.

## 4. Adjudication (sheet: `md/lab-pressure-test-06-threshold-adjudication.md`)

Full pt04 cycle: baseline `--dump` before any edit; sweep `--baseline` (1,378
crossings) and `--neighbors` onto the existing fixture; **253 rulings entered**
(250 weak: 12 ACCEPT / 222 REJECT / 16 loss-ACCEPT; **3 credible REJECT — all
the same junk Heyman table-header row — recommendations FLAGGED FOR JASON**);
40 crossing pairs already carried rulings from earlier epochs and stand.
4/4 new misreadings fire Contradicts end-to-end (0.73–0.75 High). Magnet
check: zero verbatim corpus occurrences of any new alias; no flat-score
cluster. Demo pins untouched; census lane 14,354 recorded, unchanged.

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
- Commits: `62bc887` (integration) · `752c3b9` (stamp) — local only.
- Scout's `md/pt06/chatgpt-*` files left uncommitted pending its closeout.
