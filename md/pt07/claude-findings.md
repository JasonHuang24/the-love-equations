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

## Extension: lanes F and H, worked after the two-hour close

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
