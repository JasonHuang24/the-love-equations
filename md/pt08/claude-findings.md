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
