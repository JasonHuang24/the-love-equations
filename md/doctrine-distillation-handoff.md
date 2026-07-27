# Doctrine Distillation — Claude lane handoff

**Status:** written 2026-07-27 for Jason to paste as the opening prompt of a fresh Claude Code session. Context: Jason is running a parallel doctrine-distillation effort — a ChatGPT orchestrator with 2 web scouts, an intake analyst, and an adversarial reviewer feeding sources into the LE Lab. The Claude session below is the *parallel researcher lane* with its own subagents. This is a **dataset-collection phase**: no doctrine gets implemented yet.

```
DOCTRINE DISTILLATION — CLAUDE RESEARCH LANE (handoff from the 2026-07-27 maintainer session)

RUN THIS LANE AS: Claude Opus 5 (claude-opus-5), reasoning effort HIGH. (Standing decision
2026-07-27: scout-heavy lanes run Opus — Fable's safeguards can trip mid-run on bulk sweeps
over raw discourse content; Fable stays on the maintainer/judgment lane, where hard calls
can be escalated.)
SUBAGENT POLICY — state model + effort explicitly on every spawn:
- Web scouts (source discovery + claim extraction): Sonnet 5, effort MEDIUM. Cheap,
  parallel, disposable; they return raw data, never conclusions.
- Adversarial verifiers (is this "gap" actually absent from the site? is the claim
  evidenced?): Opus 5, effort HIGH.
- Final distillation and all judgment calls: the Fable main loop itself, never a subagent.
- Subagents NEVER write files, commit, or touch the working tree. They return text/data.

MISSION
You are the parallel researcher in a two-lane doctrine-distillation run. The other lane
is a ChatGPT orchestrator (2 web scouts + intake analyst + adversarial reviewer) crawling
podcasts, blogs, and dating-advice content and feeding it into the LE Lab. Your lane does
the same hunt independently with your own subagents, then compares notes through Jason.

The bar is CORE DOCTRINE ONLY. Jason's words: "we do not want to bloat the website with
anything we can find... what I'm looking for is core doctrine, a fundamental theme I might
have missed." You are hunting for a load-bearing mechanism or theme absent from the canon —
the kind of thing the Abundance Trap was (a whole missing mechanism), not another statistic,
garnish, or rephrasing of existing pages. Expect most candidates to die. A run that returns
"nothing fundamental is missing, here is what I checked" is a valid, valued result
(see memory: reviews-calibrate-dont-pad).

CORE DOCTRINE HAS TWO SHAPES — do not equate "doctrine" with "new card":
(a) A NEW ARTIFACT (chart, framework, mythbuster entry, lexicon term) — the Abundance Trap shape.
(b) An EXPANSION of an existing page — a fundamental theme the discourse runs on that a page
    covers thinly or not at all. This applies to EVERY page on the site: any dossier, framework
    group, chart roster, deep dive, or lexicon section can be thin relative to what's actually
    circulating out there. (Jason's illustrative example: pill content missing from the pill
    dossiers — but treat that as one instance of the general principle, not the target.) A
    candidate that deepens an existing page is just as valuable as one that mints a new
    framework — grade it by whether the THEME is core, not by where it would land.

THIS IS A COLLECTION PHASE. Build the dataset and the distillation dossier. Do NOT
implement doctrine on the site — no new charts, entries, frameworks, or lexicon terms.
Implementation happens later, after Jason merges both lanes' findings.

REPO STATE (verify at session start; if head moved, read the newer commits first)
- F:\Programming\The Love Equations\The Love Equations Website, branch main, head 4f5c616,
  clean tree expected. LE Lab release token v=2.1.2; canon index 450 concepts
  (1.0.0+d59d3e3a55be). Full gate: npm run test:all (Lab + SMV + matchmaker).
- The checkout is SHARED with Jason's ChatGPT/Codex sessions. Check git status before and
  after your work; never sweep foreign WIP into a commit; leave their uncommitted files alone.
- Local preview: python .claude/dev-server.py (no-cache, port 8753).

THE LAB IS YOUR INSTRUMENT
lab.html on :8753 — paste a source, it maps claim-like passages against the 450-concept
canon index, separates mapped coverage from unmapped domain claims (the "Frontier" = the
product), runs pressure tests, and exports a research queue. Workflow per source:
1. Scout subagent fetches/cleans the source text (WebFetch/WebSearch; browser-pane
   get_page_text for 403-happy sites like ftc.gov).
2. Paste into the Lab (browser MCP on :8753; the pane may refuse screenshots when hidden —
   verify via DOM reads, an established pattern).
3. Export the analysis; the unmapped-domain-claim list is your gap candidates.
4. MANDATORY CHECK before calling anything a gap: verify against the LIVE SITE, not the
   Lab verdict alone, using an Opus verifier against the actual pages (statistics,
   frameworks, mythbuster, pills, lexicon, deep dives). The check has THREE outcomes:
   - ALREADY COVERED: the page says it; the Lab just couldn't retrieve it. Fix is overlay
     enrichment (data/canon-overlay.json), not doctrine — Harvest #1's hard lesson
     (md/doctrine-backlog-harvest-01.md).
   - COVERED THINLY → EXPANSION CANDIDATE: the page owns the territory but misses this
     theme or treats it shallowly. Record it as an expansion of that page.
   - GENUINELY ABSENT → NEW-ARTIFACT CANDIDATE.
   Content placement follows memory content-placement-and-lexicon: Pills = worldviews,
   Frameworks = models, Statistics = numbers.

SOURCE TERRITORY (coordinate via Jason to avoid double-covering the ChatGPT scouts)
Sweep genres, not individual URLs: podcast transcripts and long-form YouTube (transcripts),
manosphere/pill canon texts and their strongest critics, mainstream advice columns,
relationship-science popularizers, and the academic literature under all of it. For each
candidate theme, capture: the claim in one sentence, who advances it, the best evidence
tier (per memory data-rigor-and-tiers: Tier 1/2/3), what existing LE page comes closest,
and why it is or is not already covered.

DELIVERABLE
md/doctrine-distillation-claude-01.md — the dossier: sources swept (with Lab run stats),
candidate core themes ranked by (evidence strength x distinctness from canon), each carrying
its live-site check result AND a proposed disposition (new artifact on page X / expansion of
page Y / overlay enrichment only), plus a dead-candidates section recording what you checked
and killed (so the other lane doesn't rediscover it). Commit the dossier when it's verified.

STANDING RULES (non-negotiable, from Jason's memory)
- Commit to main directly, but NEVER push without Jason's explicit in-session word.
- Benchmark files (tests/fixtures/domain-relevance-benchmark.json,
  tests/lab-domain-benchmark.test.mjs) are untouchable outside agreed append commits.
- Any doctrine merge (LATER, not this phase) must rebuild data/le-canon-index.json, move
  the tests/canon-index-fixtures.mjs pins, and run the gate in the same commit — and
  shipped harvest doctrine carries the provenance stamp (md/lab-provenance-stamp.md).
- All .md briefs live in md/. Anything bound for a ChatGPT/Codex session goes as ONE
  copy-pasteable fenced code block.
- Editorial lens for judging candidates: sharp not sloppy (aim aggression at models, not
  people); reasoned judgment calls are first-class where data is thin, labeled honestly.

ESCALATE TO JASON when: a candidate looks genuinely core (do not sit on it until the end);
you and the ChatGPT lane disagree on whether something is covered; or a candidate would
require changing Lab classifier semantics or benchmark contracts to even evaluate.
```
