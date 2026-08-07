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
