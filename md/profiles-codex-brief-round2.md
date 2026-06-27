# Brief: Roster Profiles — Codex round 2 (edit the code directly)

Round 1 landed cleanly — 11 profiles are now live in `const PROFILES` in `matchmaker.html`.
This round you **edit the file directly** instead of returning a block.

**Read `md/profiles-codex-brief.md` first** — the full schema, the women/men trait lists, the scoring
conventions, the voice, and the `over` override map all live there and still apply verbatim.

## Your task
Pick **another 10–20** from the remaining roster (list below) and add them as new entries to the
`const PROFILES = { ... }` object in `matchmaker.html` (search for `ROSTER PROFILES`).

## Rules for editing the code
- **Append only.** Add your new `'slug': { ... }` entries before the closing `};` of `PROFILES`.
  Do not reformat, realign, or alter any existing entry.
- **Same schema, every profile gets `by: 'gpt'`.** Full trait set — 11 for women, 10 for men — plus
  `over` wherever a trait repeats under two labels (Female 2 `desire` → `male-1-2`; Male 1 `status`
  → `fem-claude-2-0`; Male 2 `status` → `fem-gpt-2-0`, `purity` → `fem-gpt-2-2`).
- **Anchor to the roster.** `looks` matches roster `looks` (± ~0.5); men's `status` tracks roster
  `status`/`smv`. Read each person's attributes from `const ROSTER` in the same file.
- **House style: use em-dashes `—`** in prose, not ` - ` (round 1's hyphens were converted on review).
- **Touch nothing else.** Not the matchmaker engine, the tuned scoring constants, the CSS, or the
  `?v=` cache version. Only add keys to `PROFILES`. Don't redo any of the 11 already done.
- It's fine to leave the working tree dirty/uncommitted — Claude audits, then commits.

## After you're done
In your reply, list the slugs you added, and say whether you want **another round** or you're
**tapping out**. If you're done, Claude authors the rest of the roster in your calibrated voice.
Either way Claude audits your additions against the roster anchors and pushes back on anything off.

## Already done — do NOT redo (11)
margot-robbie, sydney-sweeney, gal-gadot, zendaya, taylor-swift, adele,
henry-cavill, chris-hemsworth, ryan-gosling, paul-rudd, dev-patel.

## Remaining to choose from (67)
**Women (33):** scarlett-johansson, kim-kardashian, mila-kunis, anne-hathaway, emma-stone,
jennifer-lawrence, mindy-kaling, amy-schumer, lizzo, lena-dunham, susan-boyle, mama-june,
amber-heard, bella-thorne, grimes, rebel-wilson, azealia-banks, anna-sorokin, trisha-paytas,
farrah-abraham, elizabeth-holmes, casey-anthony, tonya-harding, rachel-dolezal, whoopi-goldberg,
angela-deem, tila-tequila, aubrey-oday, jenelle-evans, nadya-suleman, roseanne-barr, rosie-odonnell,
jo-brand.

**Men (34):** idris-elba, michael-b-jordan, brad-pitt, drake, pete-davidson, jonah-hill, seth-rogen,
elon-musk, mark-zuckerberg, jeff-bezos, danny-devito, steve-buscemi, kevin-federline, pauly-shore,
armie-hammer, johnny-depp, russell-brand, shia-labeouf, nicolas-cage, post-malone, jack-black,
joe-rogan, billy-mcfarland, ben-shapiro, james-corden, martin-shkreli, george-santos,
sam-bankman-fried, rudy-giuliani, spencer-pratt, jon-gosselin, kato-kaelin, tekashi-6ix9ine,
joe-exotic.
