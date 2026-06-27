# Brief: author Roster Profiles (Codex first-draft pass)

## What this is
`matchmaker.html` now has a floating **Roster Profile** widget. When you click a match in the
results, it loads a fixed, hand-authored breakdown of that person — per-trait scores + tailored
prose — and reshapes it to whichever **hierarchy standard** is selected (Female 1 / Female 2 for
women; Male 1 / Male 2 for men), recomputing the overall per standard.

The data lives in one object, `const PROFILES = { ... }`, in `matchmaker.html` (search for
`ROSTER PROFILES`). One profile is authored so far — **Margot Robbie** — as the gold-standard
template. The roster of 78 (39 women + 39 men) lives in `const ROSTER` in the same file.

You (ChatGPT/Codex) generated the very first versions of these breakdowns, so you get **first
dibs**: draft **10–20 profiles you're most comfortable with** (your pick from the roster). Claude
then QAs your set, corrects anything off, and authors the rest in the same voice. Claude may
overwrite a score or note where it disagrees — flag your reasoning inline if you feel strongly.

## Your deliverable
A single JS object, keyed by roster `slug`, each value a profile in the **exact schema** below,
ready to paste/merge into `PROFILES`. Every profile you write gets `by: 'gpt'`. **Do not touch any
code** — just return the data block. Pick people you genuinely know; skip anyone you'd be guessing on.

## The schema (per profile)
```js
'roster-slug': {
  by: 'gpt',
  blurb: "One punchy sentence — the overall read on this person.",
  traits: {
    // every trait the person's sex uses (see lists below) → { s: score, note: "tailored prose" }
    looks: { s: 9.5, note: "..." },
    // ...
  },
  over: {
    // OPTIONAL. Only when one SRC trait appears under two different labels in a standard and the
    // second framing wants different prose. Key = '<standardKey>-<tierIndex>-<factorIndex>'. See map below.
  }
}
```

## Trait dictionaries (score ALL of them, by sex)

### Women — 11 traits
| key | meaning | surfaces in the standards as |
|---|---|---|
| `looks` | face, body, femininity, grooming, vitality | F1 "Physical attractiveness" · F2 "Attractiveness & vitality" |
| `class` | grace, refinement, dignity; not crude/attention-seeking | F1 "Classiness" |
| `desire` | her attraction/receptivity toward the man — how much the pull runs toward *you* | F1 "Attraction toward you" · F2 "Sexual receptivity" + "Respect & admiration" |
| `fun` | light, playful, low-maintenance, easy company; not high-friction | F1 "Fun & easygoing" · F2 "Low-friction presence" |
| `initiative` | assertiveness; meets you halfway, contributes, initiates | F1 "Assertiveness / initiative" |
| `purity` | low baggage, emotional stability, no chaos/volatility, clean history | F1 "Purity / low baggage" · F2 "Emotional stability" |
| `values` | alignment on a shared life — family, the big questions | F1 "Alignment in values" · F2 "Shared values & family" |
| `interests` | overlap in how you spend time / daily practical compatibility | F1 "Common interests" · F2 "Practical compatibility" |
| `avail` | actually free to invest — emotionally, practically, timing | F1 "Availability" |
| `warmth` | kindness, affection, makes life lighter | F2 "Warmth & kindness" |
| `loyalty` | exclusivity, faithfulness, no doubt about commitment | F2 "Loyalty & exclusivity" |

### Men — 10 traits
| key | meaning | surfaces in the standards as |
|---|---|---|
| `confidence` | self-assured, non-needy, holds his own frame | M1 "Confidence & frame" |
| `status` | direction, drive, competence, provision capacity, social rank | M1 "Status & ambition" + "Provision & stability" · M2 "Masculine competence" + "Provision capacity" |
| `looks` | physical attractiveness, masculine presence, height/build/grooming | M1 "Physical attractiveness" · M2 "Attraction" |
| `spark` | chemistry, the electric pull | M1 "Spark & chemistry" |
| `initiative` | leadership, pursues decisively, makes her feel chosen | M1 "Leadership & pursuit" |
| `warmth` | emotional steadiness & treatment / attunement | M1 "Stability & treatment" · M2 "Emotional attunement" |
| `loyalty` | commitment, consistency, faithfulness | M1 "Commitment & loyalty" · M2 "Consistency" |
| `values` | shared goals, lifestyle, the future | M1 "Shared values & goals" · M2 "Shared values & lifestyle" |
| `purity` | safety/calibration + character under pressure; not chaotic, creepy, cruel, reckless | M2 "Safety & calibration" + "Character under pressure" |
| `desire` | selective investment — how specifically he values *her* | M2 "Selective investment" |

## The `over` override map (only if the two framings need different prose)
Some standards reuse one SRC trait under two different labels. By default both show the same note.
Add an `over` entry **only** when the second label deserves its own wording:

| standard | reused trait | second label | override key |
|---|---|---|---|
| Female 2 | `desire` | "Respect & admiration" | `male-1-2` |
| Male 1 | `status` | "Provision & stability" | `fem-claude-2-0` |
| Male 2 | `status` | "Provision capacity" | `fem-gpt-2-0` |
| Male 2 | `purity` | "Character under pressure" | `fem-gpt-2-2` |

(The base `traits` note covers the *first* appearance; `over` replaces only the second.)

## Scoring conventions
- **1–10, half-points OK.** Be honest and willing to go low; red flags (volatility, scandal,
  disloyalty) should crater `purity`/`loyalty`. Don't inflate to be nice.
- **Anchor to the roster.** Read each person's `looks`, `smv`, `status`, `age` (from `born`),
  `career`, `heightCm`, `build`, `hairColor`, `ethnicity`, `style`, `personality[]`, `vibe[]` from
  `ROSTER`. Your `looks` score should match the roster `looks` (use it, ± ~0.5 at most). For men,
  `status` should track roster `status`/`smv`. The whole profile should be plausible against roster `smv`.
- **Don't compute the overall or any curve** — the widget does that from your trait scores. Just score the traits.
- If you think a roster stat is wrong, say so in a comment; Claude arbitrates (the matchmaker's
  tuned numbers are otherwise sacred).

## Voice
The site's register: sharp, analytical, red-pill/manosphere-adjacent — but aim the edge at the
**model and the dynamics, never cruelty toward the person**. Every note must be **specific to the
individual** — cite the actual fact (the marriage, the felony, the body of work, the public
meltdown). Generic notes are the failure mode. Keep each note ~1–3 sentences; the `blurb` is one line.

## Gold-standard example (already in PROFILES — copy this structure exactly)
```js
'margot-robbie': {
  by: 'gpt',
  blurb: "Refined, understated A-list presence. Universal appeal and a clean public record — but globally scheduled and publicly married, so the scarce axis is access, not approval.",
  traits: {
    looks:     { s:9.5, note:"Top of the roster — symmetrical, sun-kissed, the kind of face the camera and the culture both already agreed on. Registers before a word is said." },
    class:     { s:9,   note:"Poised in every public frame: media-trained, graceful, never crude. Reads as elevated, not attention-seeking." },
    desire:    { s:7,   note:"Admired in the abstract by nearly everyone — but publicly married, so the pull aimed at you specifically is the soft spot, not the wattage." },
    fun:       { s:8,   note:"Quick, warm, and playful in interviews — easy company on the surface, not tense or high-friction." },
    initiative:{ s:7,   note:"Drives her own career hard — produces, doesn't just star. But the ambition is professional; she's not going to pursue a stranger." },
    purity:    { s:9,   note:"No public pattern of chaos or volatility. Stable history, clean reputation, little visible baggage." },
    values:    { s:8,   note:"Family-minded and philanthropic in her public messaging — broadly aligned on a serious life, if not niche to yours." },
    interests: { s:7,   note:"Film, producing, a glamorous social world — real overlap, but her orbit is its own ecosystem." },
    avail:     { s:6,   note:"Married, in-demand, and globally scheduled. The scarcest axis by far — availability, not interest, is the real gate." },
    warmth:    { s:8,   note:"Comes across as genuinely kind and appreciative — the type who makes a room lighter rather than heavier." },
    loyalty:   { s:9,   note:"A long, stable marriage and no whiff of disloyalty — exclusivity reads as a settled trait, not a hope." }
  },
  over: {
    'male-1-2': "Speaks generously about collaborators and partners; the admiration she extends is real, but it's spread across a public life, not concentrated on one suitor."
  }
}
```

## Roster slugs to choose from (read full attributes from ROSTER)
**Women (39):** margot-robbie *(done)*, sydney-sweeney, gal-gadot, zendaya, scarlett-johansson,
kim-kardashian, mila-kunis, anne-hathaway, emma-stone, jennifer-lawrence, taylor-swift, adele,
mindy-kaling, amy-schumer, lizzo, lena-dunham, susan-boyle, mama-june, amber-heard, bella-thorne,
grimes, rebel-wilson, azealia-banks, anna-sorokin, trisha-paytas, farrah-abraham, elizabeth-holmes,
casey-anthony, tonya-harding, rachel-dolezal, whoopi-goldberg, angela-deem, tila-tequila,
aubrey-oday, jenelle-evans, nadya-suleman, roseanne-barr, rosie-odonnell, jo-brand.

**Men (39):** henry-cavill, chris-hemsworth, idris-elba, michael-b-jordan, ryan-gosling, brad-pitt,
drake, paul-rudd, pete-davidson, jonah-hill, seth-rogen, elon-musk, mark-zuckerberg, jeff-bezos,
danny-devito, steve-buscemi, kevin-federline, pauly-shore, armie-hammer, dev-patel, johnny-depp,
russell-brand, shia-labeouf, nicolas-cage, post-malone, jack-black, joe-rogan, billy-mcfarland,
ben-shapiro, james-corden, martin-shkreli, george-santos, sam-bankman-fried, rudy-giuliani,
spencer-pratt, jon-gosselin, kato-kaelin, tekashi-6ix9ine, joe-exotic.

## Return
One JS object, slugs → profiles, `by: 'gpt'` on each, paste-ready for `PROFILES`. Note which you
skipped and why, so Claude knows what's left to author.
