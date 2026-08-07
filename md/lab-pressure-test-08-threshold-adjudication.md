# PT08 threshold adjudication — the two folded scout proposals

Rendered snapshot. **`tests/fixtures/threshold-neighbors.json` is the source of
truth**; this sheet records the reasoning behind the verdicts it holds.

Swept against a `--dump` baseline captured from the clean pre-edit tree at
`09bb709`, before any canon edit. Canon `1.0.0+54d018bff967` (571) →
`1.0.0+903fb1917167` (573). Population 2,426 retained passages × 573 entries =
1,390,098 pairs.

## What shipped

Two of the three PT08 scout proposals, after independent re-verification of
every load-bearing figure at primary source:

- **15.3 The Authority Firewall**, `data-parent="meeting-channel"`
- **30.1 Synthetic Reciprocity**, `data-parent="substitution-layer"`

The Parenthood Fork was **deferred to PT09** — see the run record.

## Verdict tally

**219 crossings ruled, all same day, `ruledBy: Claude`** — 105 ACCEPT / 114
REJECT. Weak pending 0, credible pending 0. The candidate-floor line
(20,552 pending) is a CENSUS, not a ruling line
(`md/lab-adjudication-at-scale.md`).

| line | gains | losses | ruling |
|---|---|---|---|
| minCredibleScore | 6 | 3 | 7 ACCEPT / 2 REJECT |
| minWeakScore | 155 | 55 | 98 ACCEPT / 112 REJECT |

**The 9 credible rulings are Claude's recommendations and are FLAGGED FOR
JASON.** Jason gave no pt08 delegation of the credible line; the suite blocks
on unruled credible crossings, so they are entered rather than left PENDING,
and they are attributed to Claude. Nothing here is attributed to Jason.

## The credible line, row by row

**ACCEPT — 5 gains, all `synthetic-reciprocity`, all genuinely on-topic.** The
entry took passages that previously had no owner at any score:

| score | source | passage |
|---|---|---|
| 0 → 0.564 | wheatley | "Exploring emotional bonds: Human-AI interactions and the complexity of relationships." |
| 0 → 0.493 | common-sense | "Thirty-three percent of teens use AI companions for social interaction and relationships." |
| 0 → 0.476 | common-sense | "One-third of teens (33%) use AI companions…" |
| 0 → 0.443 | common-sense | "I don't use AI companions to practice social skills" |
| 0 → 0.438 | common-sense | "While nearly three in four teens have used AI companions…" |

The teen-prevalence rows map to an entry that explicitly **nonclaims**
prevalence and treats adolescent use as a boundary. That is the correct
behaviour, not a contradiction: the reader is shown the nearest canon concept
and the boundary that tells them the site makes no prevalence claim.

**ACCEPT — 2 mechanical drift rows.** `statistics:height-pref` 0.429 → 0.430
and `deep-dive:single-parenthood` 0.430 → 0.429. One thousandth each, pure IDF
movement from adding two entries. Neither new entry is a candidate for either
passage.

**REJECT — 2 real losses, both costs this batch bought:**

1. **`M-TBD-53` 0.464 → 0.419** on *"Nearly 1 in 3 young adult men and 1 in 4
   young adult women have chatted with an AI simulated romantic partner."* The
   docket lost a reader-visible mapping and **`synthetic-reciprocity` did not
   pick it up** — it scores below 0.30 on that sentence. This is the measured
   price of the anti-magnet constraint: the entry deliberately carries no
   `AI companion` / `AI girlfriend` / `chatbot partner` / `Replika` surface
   (pt07 removed exactly those as a topic magnet), and the cost is that it
   cannot reach the most literal AI-romantic-partner sentence in the corpus.
   **The constraint was preserved and the coverage hole recorded rather than
   closed by restoring a magnet surface.**
2. **`M-TBD-29` 0.457 → 0.403** on *"Both men and women were less satisfied
   with their relationships when their partners were attentive to
   alternatives."* IDF dilution on `attentive`, which `synthetic-reciprocity`
   uses in its synopsis. Neither new entry took the passage;
   `statistics:stat-commitment-model` is now the nearest at 0.343.

Per the standing rule, a REJECT is **not** a threshold change. Both are
recorded as costs.

## The weak line

- **26 ACCEPT** — `synthetic-reciprocity` weak gains from the two AI sources.
  On-topic nearby-concept contacts.
- **17 ACCEPT** — weak gains on pre-existing entries, IDF drift.
- **55 ACCEPT** — every weak loss. Median drop 0.010, largest 0.042, all IDF
  dilution, none a displacement by a new entry.
- **112 REJECT** — 78 `synthetic-reciprocity` and 34 `authority-firewall` weak
  gains from off-topic sources, riding generic tokens (`need`, `time`,
  `three`, `distinct`, `order`) rather than either mechanism. Real noise in
  the research card's nearby-concept list, recorded as a cost.

## Four false positives removed by rewording the authored surface, never a pin

pt07's rule held again: when the surface collides, fix the surface.

1. **`authority-firewall` 0.470 on a bibliography line** — *"Saunders (Eds.),
   Philosophy of Love in the Past, Present, and Future (pp. 240–256)."* The
   three matched tokens were `past`, `present`, `future`, all from one
   boundary of mine: *"Some policies reach past present authority…"* An
   ordinary-word trio colliding with a book title. Reworded to "extend beyond
   current authority… authority a person is expected to acquire later" →
   **0.470 → 0**.
2. **`synthetic-reciprocity` 0.443 on human-couple prose** — *"In short, couple
   time facilitates need fulfillment, which in turn predicts relationship
   quality."* Matched `short`, `need`, `quality`. Dropped `short` from a
   boundary and changed "bond quality" to "a strong bond" → **0.443 → 0.245**,
   below the weak line as well as the credible one.
3–4. **`authority-firewall` weak noise, 56 → 34 rows.** `participant` and
   `measure` were pulling in research-methods prose ("participants completed
   the QMI…", "ANOVAs for participants' responses"). One misreading reworded
   from "voluntary approval from each participant" to "from both people
   involved", and one boundary from "attitudes … measure opinion" to
   "record opinion". Three sampled rows fell 0.364 → 0.230, 0.350 → 0.011 and
   0.343 → 0.218. `evaluative` was left alone deliberately: evaluative
   authority **is** the mechanism, and removing it to quiet the corpus would
   be authoring around the instrument.

Both reworded surfaces were mirrored into `frameworks.html` so the
reader-facing prose and the match surface say the same thing.

## Checks that passed before shipping

- **Magnet check, independent of the scout's.** All 12 candidate surfaces:
  zero exact hits across `lab-corpus/`, `data/`, `tests/fixtures/`. Reproduces
  the scout's result.
- **Short-unit token-pair hazard** (which fired three times in pt07): zero
  corpus sentences of 3–12 words share 2+ content tokens with any new surface.
- **No magnet signature in the gains.** Scores are spread, not stacked: the
  most common single score carries 4 rows for `synthetic-reciprocity` and 7
  for `authority-firewall`, nothing like pt07's flat block of ~40 at 0.540.
- **All 6 misreadings pass `tools/check-mis.mjs`** — 10–18 words, no negator,
  no meta-language, no morphology trap, and each forms a claim unit that
  clears the domain gate.
- **6/6 fire `Contradicts` end to end** against the correct entry at **High**
  confidence, scores 0.734–0.860.
- **Analyzer demo pin unchanged** at 11 passages / 6 mapped / 54.5%.
- **`npm run test:lab` 18/18, exit 0, no skipped assertions.**

## Three canon-growth pins moved, none of them a goalpost

All three are pins that track canon size and carry their own change logs; the
behavioural assertions beside them were untouched and still pass.

- `tests/canon-index-fixtures.mjs`: `conceptCount` 571 → 573,
  `Rules & Frameworks` 68 → 70, entries-with-misreadings 571 → 573,
  entries-with-boundaries 538 → 540. The zero-entries-without-a-misreading
  assertion passed unchanged, which is what proves both new entries can
  disagree with a reader.
- `tests/lab-analyzer.test.mjs`: the Availability corpus pin 0.537 → 0.536,
  logged as its **twelfth** move with the reason. Neither new entry is a
  candidate for that passage; the movement is IDF alone. The two assertions
  the test exists for — score above `minCredibleScore`, admission guard still
  blocking — both still hold.
