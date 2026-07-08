/* ── The Mythbuster — data + render system ──
 *
 * Canonical, public content: every entry in ENTRIES below is graded and
 * ratified — no drafts, no docket holds. (See the Data note above ENTRIES.)
 *
 * Architecture:
 *   - The atomic unit is a QUESTION with 1..N competing claims. A single-claim
 *     card is just the N=1 case of the SAME schema and render path — there is
 *     one card type, one render function. No per-card HTML.
 *   - Each claim carries its own verdict; the entry's `ruling` holds the
 *     data-backed conclusion, its evidence tier, and its sources.
 *   - Claims MAY stake a synthesized truth share — `truth: <int 1–99>` on every
 *     claim of an entry (all or none) — rendered as a % suffix inside the claim's
 *     verdict stamp: the claim's staked market share of the evidenced truth.
 *     Mirror claims (one assertion, two lenses) carry the SAME number; competing
 *     camps' numbers sum to exactly 100 (shares of the table). The gate enforces
 *     both shapes.
 *   - Truth semantics (Jason's calibration rule): a claim's number is its market
 *     share of the ANSWER TO THE QUESTION, against the counter-position —
 *     anchored to real data where the ruling carries one (e.g. height: ~70% of
 *     women state the preference → 70). THE QUESTION DEFINES THE CONTESTED
 *     AXIS: a claim earns NOTHING for premises the ruling agrees with — it is
 *     graded where it actually disagrees. (M-TBD-47's question asks about the
 *     advice's MOTIVE, so its claim grades on the motive contest — not on the
 *     agreed "advice is bad" premise. M-TBD-17's question asks about the
 *     checkout TREND, so its claims grade on the trend.) Garnish failures trim
 *     a few points; central-thrust failures sink the number. Mid-range values
 *     must be EARNED by genuinely split evidence — never produced by averaging
 *     a true core with a false extrapolation (that reads as a toss-up).
 *   - The ruling stakes its own share too — `ruling.truth` (required whenever
 *     the claims are staked; gate-enforced ≥ the best claim, since the ruling
 *     subsumes what the claims got right and adds its correction). It NEVER
 *     stakes 100: the empty tail is the margin held open for refutation,
 *     informally capped by tier (hard-data ≲95, evidence ≲85).
 *   - The ruling column renders the STAKE LEDGER: one 0-anchored row per
 *     position — every claim (scarlet) plus the ruling itself (gold) — on a
 *     shared 0–100 axis with the percentage printed on each row. All shares
 *     are ABSOLUTE (nothing is normalized against anything else), so bar
 *     lengths compare directly: the gold row vs the best claim shows exactly
 *     how much the ruling adds. The 25% floor tests EVERY staked claim: if any
 *     argument on the card stakes under 25%, ALL metrics are omitted — a rout
 *     is not a contest, and the silence says the losing claim doesn't
 *     meaningfully reflect reality; the ruling is the ground truth. Clean
 *     poles carry no numbers at all. Stakes are SYNTHESIZED judgment calls,
 *     not measurements — staked to be refuted and refined.
 *   - render() REFUSES an entry missing `ruling.tier`, with an empty
 *     `ruling.sources`, with a duplicate id, or otherwise structurally broken —
 *     it is skipped and a console.warn fires. No unsourced ruling reaches the DOM.
 *   - Preview mode ("the docket") — localhost + ?preview=1 ONLY — additionally
 *     renders the gate-FAILED entries, after the real cards, as read-only
 *     "Ungraded" docket cards for grading. The gate itself is never loosened.
 *   - Claims render in the order given (author orders by ascending accuracy).
 *   - Filter chips auto-generate from the categories present in the data.
 *   - Icons are inline SVG (no external icon font / zero external deps).
 */
(function () {
  'use strict';

  /* ── Vocabularies (claim verdicts + ruling tiers; also the render gate) ── */
  const VERDICTS = {
    'confirmed':      { label: 'Confirmed' },      // success-green
    'oversimplified': { label: 'Oversimplified' }, // amber
    'false':          { label: 'False' },          // scarlet
    'backwards':      { label: 'Backwards' },      // deep scarlet (distinct)
  };
  const TIERS = {
    'hard-data':    { label: 'Hard data' },
    'evidence':     { label: 'Evidence-based' },
    'definitional': { label: 'Definitional' },
  };

  /* ── Inline SVG icons (currentColor-driven, sized in CSS) ── */
  const SVG_BOOK = '<svg class="mb-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0"/><path d="M3 6v13"/><path d="M12 6v13"/><path d="M21 6v13"/></svg>';
  const SVG_CHEVRON = '<svg class="mb-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6 -6"/></svg>';
  // Leading glyph on the evidence-tier pill (bar-chart; inherits the tier's colour).
  const SVG_TIER = '<svg class="mb-svg mb-tier-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16"/><path d="M7 20v-4"/><path d="M12 20v-9"/><path d="M17 20v-14"/></svg>';

  /* ── Data: 62 graded entries, all ratified. Every entry carries valid verdicts
     and fetch-verified sourced rulings and passes the render gate — no drafts and
     no docket holds remain (the last hold, M-TBD-54, was graded 2026-07-07).
     Grading ran across 2026-07-06/07 via per-entry web research plus dual
     adversarial source verification, then Jason ratified. The gate still skips any
     structurally broken entry with a console.warn, and the localhost ?preview=1
     docket surfaces such entries for grading (currently none). Rendered cards carry
     id="<entry id>" anchors so other pages can deep-link
     (statistics.html → mythbuster.html#M-TBD-6 etc.). ── */
  const ENTRIES = [
    {
      id: 'M-TBD-1',
      category: 'Signals',
      question: 'Is the extra-friendly barista flirting with you?',
      claims: [
        { camp: 'Ani',
          text: 'Complimenting a customer and keeping the conversation going is not standard barista behavior. Girls don\u2019t put in that kind of effort with customers unless they enjoy their company \u2014 she was most likely at least a little interested.',
          verdict: 'oversimplified', truth: 25 },
        { camp: 'Mika',
          text: 'Girls in customer-service jobs are trained to be chatty, and some are just naturally social. If she were actually flirting she\u2019d be flirting with dozens of guys every single day \u2014 real flirting is selective and treats you differently from everyone else.',
          verdict: 'confirmed', truth: 75 },
      ],
      ruling: {
        badge: 'Advantage Mika',
        text: 'Men systematically over-read warmth as romantic interest \u2014 the sexual overperception bias \u2014 and service-industry friendliness is occupational, which inflates the false-positive rate further. The discriminating cue is the one Mika names: differential treatment and effort to extend the interaction, not baseline warmth.',
        tier: 'hard-data',
        truth: 80,
        sources: [
          { label: 'Sexual overperception bias \u2014 emotion projection & desire study (2021, replicating the bias)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8416843/' },
          { label: 'Hall, Xing & Brooks (2014), Communication Research \u2014 flirting detection accuracy and base rates', url: 'https://journals.sagepub.com/doi/10.1177/0093650214534972' },
        ],
        researchNotes: 'Ani regraded from the earlier proposed Backwards to Oversimplified: Hall shows real flirting is also frequently MISSED, so \u201cyou\u2019re missing signals\u201d has partial support \u2014 her error is ignoring base rates in occupational-warmth contexts, not inverting reality.',
      },
      related: [ { label: 'Ruling M-TBD-53: the "just friends" misread', href: 'mythbuster.html#M-TBD-53' }, { label: 'Ruling M-TBD-36: what real signals look like', href: 'mythbuster.html#M-TBD-36' } ],
    },
    {
      id: 'M-TBD-2',
      category: 'Signals',
      question: 'How obvious are women when they\u2019re actually interested?',
      claims: [
        { camp: 'Ani',
          text: 'Most girls will give you signals and wait to see if you do something. They\u2019re not going to risk rejection by being super obvious \u2014 listen to what they do, not what they say.',
          verdict: 'oversimplified', truth: 55 },
        { camp: 'Mika',
          text: 'Most girls who are actually interested give multiple hints that are pretty obvious if you\u2019re paying attention \u2014 laughing at unfunny jokes, staying in the conversation longer than needed, personal questions. If she\u2019s truly interested she doesn\u2019t make it nearly that hard.',
          verdict: 'oversimplified', truth: 45 },
      ],
      ruling: {
        badge: 'Both half right',
        text: 'Interested women do emit identifiable cues \u2014 the ones Mika lists are the documented ones \u2014 but detection is genuinely bad: in lab interactions, actual flirting was correctly recognized only about a third of the time, and observers did no better than participants. Signals exist and get missed at high rates. Each camp holds half the picture.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Hall, Xing & Brooks (2014), Communication Research \u2014 two-study flirting detection design', url: 'https://journals.sagepub.com/doi/10.1177/0093650214534972' },
          { label: 'University of Kansas summary \u2014 detection rates (38% when flirting occurred; women\u2019s flirting read more accurately)', url: 'https://news.ku.edu/2014/06/03/flirting-hard-detect-study-finds' },
        ],
      },
      related: [ { label: 'Ruling M-TBD-36: the covert-signal catalog', href: 'mythbuster.html#M-TBD-36' } ],
    },
    {
      id: 'M-TBD-3',
      category: 'Approach',
      question: 'If you take rejection gracefully, does shooting your shot cost you anything?',
      claims: [
        { camp: 'Ani',
          text: 'Girls don\u2019t give guys a bad reputation for politely asking for a number when the vibe is good. Bad reputations come from being pushy, entitled, or bitter after rejection \u2014 most girls respect a guy who makes a clean move and takes no well.',
          verdict: 'confirmed', truth: 70 },
        { camp: 'Mika',
          text: 'Perception matters more than how nicely you take the rejection. If she never gave real signals, your advance is unwanted attention no matter how polite it is \u2014 and repeatedly misreading friendliness as flirting damages your reputation, because girls talk.',
          verdict: 'oversimplified', truth: 30 },
      ],
      ruling: {
        badge: 'Advantage Ani',
        text: 'The pursuit literature puts the damage where Ani puts it: across 241 people\'s dual pursuer/target accounts, targets\' negative reactions attached to persistence after explicit rejection \u2014 and pursuers, especially men, over-reported reciprocation signals and under-reported the no. No study shows a polite, once-and-done ask costing reputation. Mika\'s mechanism is real but narrower: identical advances get labeled harassment more often when the initiator is less attractive, and interested men do overperceive attraction \u2014 so "the vibe was good" is the unreliable part, not the graceful exit.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Sinclair & Frieze (2005), Sex Roles \u2014 unrequited attraction: negativity attaches to persistent pursuit after explicit rejection; pursuers over-report reciprocation signals', url: 'https://link.springer.com/article/10.1007/s11199-005-4203-4' },
          { label: 'Walker & Bonner (2022), Journal of Business and Psychology \u2014 identical romantic advances draw more harassment labeling when the initiator is relatively less attractive', url: 'https://link.springer.com/article/10.1007/s10869-020-09729-w' },
          { label: 'Samara, Roth & Kret (2021), Archives of Sexual Behavior \u2014 speed-dating (277 dates): men who are interested overperceive their partner\'s attraction', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8416843/' },
        ],
        researchNotes: 'No study directly measures reputational fallout from a single graceful approach \u2014 that gap caps this at evidence tier, and Ani\'s "most girls respect a clean move" is inference from the persistence literature, not a measured approval rate. Walker & Bonner\'s harassment-labeling effect comes from workplace vignettes involving physical contact from a superior, so its transfer to a polite number-ask is directional, not exact. A study tying serial misreads spread through gossip networks to concrete reputation loss would strengthen Mika\'s claim and could shift the badge toward "Both half right."',
      },
      related: [ { label: 'Ruling M-TBD-5: cold-approach odds', href: 'mythbuster.html#M-TBD-5' } ],
    },
    {
      id: 'M-TBD-4',
      category: 'Definitions',
      question: 'What counts as a crush?',
      claims: [
        { camp: 'Ani',
          text: '[Reported \u2014 paraphrase] Anyone who thinks anything positive of you \u2014 finds you cute, laughs at your jokes, has you on their mind \u2014 has a crush.',
          verdict: 'oversimplified', truth: 20 },
        { camp: 'Mika',
          text: 'A crush is romantic interest with emotional investment \u2014 someone excited or nervous to be around you who wants your attention. Finding someone cute or enjoying their company is basic attraction, not a crush.',
          verdict: 'oversimplified', truth: 30 },
        { camp: 'Gender Dynamics',
          text: 'A crush isn\'t only the serious, want-to-date-them kind; for most people it just means a flicker of attraction plus a little lift when someone\'s around \u2014 sparked by looks, personality, or both, and easily running several at once. The one real boundary is that a crush needs some pull of attraction; pure fondness with none \u2014 the sweet elderly neighbor \u2014 doesn\'t qualify.',
          verdict: 'confirmed', truth: 50 },
      ],
      ruling: {
        badge: 'Opposite errors',
        text: 'Definitionally both miss, in opposite directions. Crush research treats a crush as an attraction-based, usually unilateral and uncommunicated longing that ranges from light to intense (O\'Sullivan et al. 2022, n=3,585). That sinks Ani\'s \u201cany positive thought counts\u201d \u2014 fondness, or a laughed-at joke with no attraction behind it, isn\'t a crush. But it also undercuts Mika\'s demand for nervous, emotionally invested pining: a crush can be mild. The real line is attraction at any intensity \u2014 not mere liking, and not full limerence (Tennov).',
        tier: 'definitional',
        truth: 85,
        sources: [
          { label: 'O\'Sullivan, Belu & Garcia (2022), J. of Social and Personal Relationships \u2014 crush studies (n=3,585 adults) defining a crush as a typically unilateral, uncommunicated attraction, \u201ca state of unfulfilled longing\u201d', url: 'https://journals.sagepub.com/doi/10.1177/02654075211038612' },
          { label: 'Wyant (2021), J. of Patient Experience \u2014 limerence as obsessive attachment to a \u201climerent object\u201d (Tennov, Love and Limerence, 1979): the intense pole a crush need not reach', url: 'https://pubmed.ncbi.nlm.nih.gov/34869848/' },
        ],
        researchNotes: 'Fable-graded 2026-07-06 at definitional tier on Jason\'s instruction to publish with the marker. Ani\'s claim is still [REPORTED] \u2014 Jason\'s paraphrase, not her verbatim words; swap in her primary quote when it surfaces and re-check the verdict (a genuinely low-threshold reading could push Ani toward Confirmed). Both sources fetch-verified. The APA Dictionary infatuation/limerence entries could not be fetch-verified (JS-rendered), so are not cited; Bradbury et al. (2024) scoping review (link.springer.com/article/10.1007/s11896-024-09674-x) is available as further limerence grounding if a third source is wanted. GD #177 (\u201cCrush is a much bigger bucket\u201d) merged as a third claim and graded Confirmed \u2014 it states the definitional line the ruling lands on: attraction at any intensity, not mere fondness.',
      },
      related: [],
    },
    {
      id: 'M-TBD-5',
      category: 'Approach',
      question: 'Does cold-approaching women in everyday places actually work?',
      claims: [
        { camp: 'Ani',
          text: 'Average guys who consistently shoot their shot on any sensed interest get rejected a lot but also get far more yeses than the overthinkers \u2014 many girls are open to dating and just don\u2019t want to be the one who initiates. The bold guy wins more often than people admit.',
          verdict: 'oversimplified', truth: 25 },
        { camp: 'Mika',
          text: 'The polite refusal wins by a huge margin \u2014 cold flirting in public has a very low success rate, and the numbers game burns confidence and reputation. High-quality contexts (apps, social circles, hobbies) beat high-quantity approaches.',
          verdict: 'confirmed', truth: 75 },
      ],
      ruling: {
        badge: 'Advantage Mika',
        text: 'Where couples actually form: friends, family, coworkers, school and \u2014 now the leading channel \u2014 online dating account for the bulk of matches; meeting cold in a public place is a small and shrinking share. Initiative matters within a context, but as a strategy, venue beats volume.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Rosenfeld, Thomas & Hausen (2019), PNAS 116(36):17753\u201317758 \u2014 Disintermediating your friends', url: 'https://doi.org/10.1073/pnas.1908630116' },
          { label: 'HCMST 2017-based analysis of meeting channels (friends vs. internet vs. other)', url: 'https://arxiv.org/pdf/2111.03825' },
        ],
        researchNotes: 'PNAS citation triple-confirmed via citing papers. DOI URL filled 2026-07-06: doi.org/10.1073/pnas.1908630116 verified to 302-redirect to the canonical pnas.org article page (pnas.org 403s automated fetchers but loads in browsers). No empty URLs remain in the dataset.',
      },
      related: [ { label: 'Chart: how couples actually meet', href: 'statistics.html#stat-couples-meet' }, { label: 'Essay: Third Spaces (the Great Emptying)', href: 'dd-third-spaces.html#great-emptying' } ],
    },
    {
      id: 'M-TBD-6',
      category: 'Dating',
      question: 'Do women prefer the guy who takes it slow and waits to make a move?',
      claims: [
        { camp: 'Mika',
          text: 'Those stories are extremely rare \u2014 usually she was already strongly attracted, or she friend-zoned the slow guy and is retelling it kindly. For every girl who liked that he waited, hundreds lost interest because he never tried. For average guys, waiting too long is usually a death sentence.',
          verdict: 'oversimplified', truth: 30 },
      ],
      ruling: {
        badge: 'It depends',
        text: 'On long-term outcomes the claim inverts: among 2,035 married individuals, later sexual timing predicted better communication, satisfaction, perceived stability, and sexual quality \u2014 controlling for religiosity, education, partner count, and relationship length. Decisiveness may help short-term attraction, but \u201cdeath sentence\u201d depends entirely on which finish line you\u2019re measuring.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Busby, Carroll & Willoughby (2010), J. of Family Psychology \u2014 Compatibility or restraint? Sexual timing and marriage outcomes', url: 'https://scholarsarchive.byu.edu/facpub/4349/' },
        ],
      },
      related: [ { label: 'Framework: The Conversion Ladder', href: 'frameworks.html#conversion-ladder' } ],
    },
    {
      id: 'M-TBD-7',
      category: 'Confidence',
      question: 'Should you build confidence before dating, or through it?',
      claims: [
        { camp: 'Mika',
          text: 'Get-confident-first is a fantasy and a common form of procrastination. Confidence with women only develops through repeated exposure \u2014 you can lift, read, and meditate, but until you\u2019re across the table under pressure it doesn\u2019t fully form. You go through the awkward phase now or you delay it; it\u2019s still coming.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Confirmed',
        text: 'Mastery experiences are the strongest of the four sources of self-efficacy, and the founding formulation is nearly verbatim the claim: persistence in activities that feel threatening but are in fact safe builds efficacy and reduces defensive avoidance. Confidence is downstream of reps, not a prerequisite for them.',
        tier: 'evidence',
        sources: [
          { label: 'Bandura (1977), Psychological Review \u2014 self-efficacy theory; APA overview of the four sources', url: 'https://www.apa.org/research-practice/conduct-research/self-efficacy-human-agency' },
        ],
      },
      related: [],
    },
    {
      id: 'M-TBD-8',
      category: 'Signals',
      question: 'She\u2019s flirting with you in front of her boyfriend \u2014 what does it mean?',
      claims: [
        { camp: 'Ani',
          text: 'Either she\u2019s a natural tease who enjoys feeling desired \u2014 her boyfriend being there may make it more exciting \u2014 or she\u2019s testing the waters in an unhappy relationship. Either way it\u2019s mostly about her validation, not about you.',
          verdict: 'confirmed' },
        { camp: 'Mika',
          text: 'She was most likely flirting for attention, not interest \u2014 girls who do this with their boyfriend right there are enjoying the ego boost. A genuinely interested girl tries to be discreet and catches you when he\u2019s not around.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Agreed \u2014 and it holds',
        text: 'Deliberate jealousy induction is a documented behavior with validated scales; flirting with others in front of a partner is one of the recognized techniques, and the measured motives cluster on attention, validation, security-testing, and relational power \u2014 essentially the two readings both AIs gave. The convergence entry survives its own audit.',
        tier: 'evidence',
        sources: [
          { label: 'Mattingly et al. (2012), Current Psychology \u2014 Romantic Jealousy-Induction Scale and motives', url: 'https://www.researchgate.net/publication/257772214_Development_of_the_Romantic_Jealousy-Induction_Scale_and_the_Motives_for_Inducing_Romantic_Jealousy_Scale' },
          { label: 'TARS young-adult study \u2014 jealousy induction correlates, techniques, and motives', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10211485/' },
        ],
      },
      related: [],
    },

    /* ── Fable-authored entries from the design mockups ──
     * Unlike the Ani/Mika extractions above, these were authored fully filled:
     * claims, verdicts, ruling text, and VERIFIED sources (checked 2026-07-06).
     * Graded and ratified by Jason. */
    {
      id: 'M-TBD-9',
      category: 'Attraction',
      claims: [
        { camp: '', text: 'Opposites attract.', verdict: 'oversimplified', truth: 10 },
      ],
      ruling: {
        badge: 'Oversimplified',
        text: 'Similarity \u2014 actual and perceived \u2014 strongly predicts attraction: r = .47 and .39 across 313 studies. One wrinkle: in established relationships it is perceived similarity that carries the effect, not measured similarity. Evidence for complementarity (\u201copposites\u201d) is weak and trait-specific.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Montoya, Horton & Kirchner (2008), J. of Social and Personal Relationships \u2014 meta-analysis, 313 studies', url: 'https://journals.sagepub.com/doi/10.1177/0265407508096700' },
        ],
        researchNotes: 'Verified. The stability half of the original mockup claim was trimmed \u2014 Montoya covers attraction, not longitudinal stability; add a homogamy/marital-quality source if the ruling should speak to stability.',
      },
      related: [ { label: 'Framework: SMV Matching (assortative mating)', href: 'frameworks.html#smv-matching' }, { label: 'Chart: couples match on looks', href: 'statistics.html#stat-looks-matching' } ],
    },
    {
      id: 'M-TBD-10',
      category: 'Conflict',
      claims: [
        { camp: '', text: 'Never go to bed angry.', verdict: 'backwards' },
      ],
      ruling: {
        badge: 'Backwards',
        text: 'Forcing resolution while physiologically flooded escalates conflict, and sleep-deprived partners fight worse: couples short on sleep behaved more hostilely and showed stronger inflammatory responses to conflict discussions. A structured timeout beats a forced 2 a.m. settlement.',
        tier: 'evidence',
        sources: [
          { label: 'Wilson et al. (2017), Psychoneuroendocrinology \u2014 shortened sleep fuels inflammatory responses to marital conflict', url: 'https://pubmed.ncbi.nlm.nih.gov/28262602/' },
          { label: 'Gottman & Levenson \u2014 marital processes predictive of later dissolution (flooding)', url: 'https://pubmed.ncbi.nlm.nih.gov/1403613/' },
        ],
        researchNotes: 'Wilson 2017 verified. COUNTER-EVIDENCE EXISTS: sleep-consolidation studies (e.g. Baran et al. 2012, J. Neuroscience) suggest sleep can preserve negative emotional memory \u2014 the strongest case FOR the myth. Weigh both lines; verdict may soften to Oversimplified. Gottman source needs a specific citation and URL.',
      },
      related: [],
    },
    {
      id: 'M-TBD-11',
      category: 'Attraction',
      question: 'Who cares more about looks?',
      claims: [
        { camp: 'The classic',
          text: 'Men are visual. Women barely care about looks at all.',
          verdict: 'false', truth: 35 },
        { camp: 'The leveler',
          text: 'Everyone weighs looks the same. The gap is a myth.',
          verdict: 'oversimplified', truth: 65 },
      ],
      ruling: {
        badge: 'Both wrong',
        text: 'In stated preferences the traditional gap is real and replicated: men rate looks as more important, women rate earning prospects higher. But in live speed-dating behavior the sex differences disappear \u2014 both sexes\u2019 actual romantic interest tracked partners\u2019 attractiveness about equally. The stated gap exists; the behavioral gap is a fraction of what either camp believes.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Eastwick & Finkel (2008), J. of Personality and Social Psychology \u2014 speed-dating, stated vs. revealed preferences', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
        ],
        researchNotes: 'E&F 2008 verified; a 2015 direct replication reached consistent results. NOTE: \u201cThe classic\u201d regraded from the mockup\u2019s Backwards to False \u2014 the direction of the stated difference is real, so the claim isn\u2019t inverted, just wrong in magnitude. \u201cThe leveler\u201d is closest to right on revealed preferences and could arguably land higher \u2014 Jason\u2019s call. Eastwick et al. (2014) meta-analysis source removed this pass (empty URL, unverified) \u2014 E&F 2008 carries the ruling alone.',
      },
      related: [ { label: 'Ruling M-TBD-37: the filter runs in both sexes', href: 'mythbuster.html#M-TBD-37' } ],
    },

    /* ── Gender Dynamics ports (2026-07-06) ──
     * Mechanical extractions from gender-dynamics.html — claims are the source
     * cards' own words, lightly trimmed; sourcePage/sourceCard preserve provenance
     * (gate-ignored fields). Graded later the same day by the Fable grading loop
     * (per-entry web research; every source URL fetch-verified; each ruling passed
     * a source-integrity skeptic + a grading-consistency skeptic, with the
     * skeptics' exact repairs applied), then ratified by Jason. M-TBD-36's sourcing
     * audit was resolved and it is graded (tier: evidence). */
    {
      id: 'M-TBD-12',
      category: 'Approach',
      question: 'Does being direct about wanting sex get a man rejected where the indirect route succeeds?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Why being direct gets you shut down',
      claims: [
        { camp: 'Male perspective',
          text: 'A guy who just says "wanna have sex" gets shut down immediately, but a guy who goes on three pretend dates gets it. Same goal, opposite outcome. The market rewards the guy willing to play the long game \u2014 the pretend dates, the slow-built vibe, the gradual escalation over multiple conversations \u2014 and punishes the guy who\'s honest about what he wants up front. So it ends up rewarding indirect communicators and punishing direct ones.',
          verdict: 'oversimplified', truth: 25 },
        { camp: 'Female perspective',
          text: 'When a man is direct and honest about wanting you, it often kills the spark \u2014 and when he plays it cool, teases, and keeps you guessing, it pulls you in. Multiply that across millions of women and you get a training program: men learn that honesty gets them rejected and games get them results.',
          verdict: 'oversimplified', truth: 25 },
        { camp: 'The rebuttal',
          text: 'Blurting "I want to have sex" out of nowhere reads as low-effort and a little gross \u2014 like she\'s just a hole you\'re trying to use. No romance, no buildup, no seduction. Most women want to feel desired, not just needed for sex, and the wording is where that lives. It\'s not directness they hate. It\'s crude, low-effort directness.',
          verdict: 'confirmed', truth: 50 },
      ],
      ruling: {
        badge: 'Right pattern, wrong lesson',
        text: 'The outcome asymmetry is real and repeatedly replicated: in Clark and Hatfield\'s field experiments, 69\u201375% of men accepted a stranger\'s "go to bed with me tonight," zero women did \u2014 yet roughly half of women in the same experiments accepted a date request. The lesson drawn is wrong, though. Women\'s refusals track perceived danger and low expected sexual pleasure, and in a subjectively safe lab setting the gender gap vanishes. The slow route wins because it delivers safety and information \u2014 not because the market punishes honesty.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Clark & Hatfield (1989), Journal of Psychology & Human Sexuality \u2014 original field experiments: 69\u201375% of men vs 0% of women accepted a stranger\'s bed offer; ~50% of both sexes accepted a date', url: 'https://www.sciencefriday.com/wp-content/uploads/2016/04/gender-differences-in-receptivity-to-sexual-offers.pdf' },
          { label: 'Conley (2011), Journal of Personality and Social Psychology \u2014 acceptance tracks perceived proposer characteristics (sexual skill/expected pleasure); gender gap disappears for familiar or famous proposers', url: 'https://pubmed.ncbi.nlm.nih.gov/21171789/' },
          { label: 'Baranowski & Hecht (2015), Archives of Sexual Behavior \u2014 German field replication of the gap; in a subjectively safe laboratory setting the gender difference in consenting to sex disappeared', url: 'https://pubmed.ncbi.nlm.nih.gov/25828991/' },
        ],
        researchNotes: 'The "three dates gets it" half is script-consistent but not directly quantified in this literature, and the lab-parity results (Conley; Baranowski & Hecht) measure hypothetical consent under manufactured safety, not real-world behavior \u2014 so the mechanism evidence is softer than the outcome data. Kunz & Greitemeyer (2025, Journal of Social Psychology; PubMed 39661065, fetched) confirm the field asymmetry persists 40+ years on, independent of proposition type. Read purely as an outcome prediction (direct stranger propositions fail), the claim would grade confirmed; the oversimplified verdict rides on the "market punishes honesty / rewards deception" mechanism. Merged 2026-07-06: the Female-perspective mirror (GD #146) inherits Oversimplified with the original; the delivery rebuttal (GD #11) grades Confirmed \u2014 Conley\u2019s pleasure/safety mechanism is exactly \u201cnot directness, but what the crude version signals.\u201d',
      },
      related: [ { label: 'Chart: the casual-sex gender gap', href: 'statistics.html#stat-casual-gap' } ],
    },
    {
      id: 'M-TBD-13',
      category: 'Approach',
      question: 'Is sexual directness received differently from a woman than from a man?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The double standard is real',
      claims: [
        { camp: '',
          text: 'If a woman says "I want to have sex" to a guy, most guys find it hot as hell \u2014 bold, confident, sexy. A guy says the exact same words to a woman and she\'s usually turned off or uncomfortable. Same sentence, opposite reception. Women can be direct about wanting sex and get rewarded for it; men doing it read as crude.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Holds up',
        text: 'Yes \u2014 this is a repeatedly replicated result. In the Clark\u2013Hatfield paradigm, a woman\'s direct sex offer to a male stranger typically gets a yes, while the identical offer from a man got zero acceptances from women \u2014 a gap that held on campus, in nightclubs, and in a 2025 pair of naturalistic replications. The refinement: Conley showed it isn\'t male directness being punished \u2014 women\'s acceptance rises to match men\'s when the proposer is attractive, famous, or a trusted friend expected to be good in bed.',
        tier: 'hard-data',
        sources: [
          { label: 'Conley (2011), Journal of Personality and Social Psychology \u2014 the Clark\u2013Hatfield gap (men quite likely to accept a stranger\'s casual-sex offer, women never) disappears with attractive, famous, or friend proposers; perceived sexual skill predicts acceptance for both sexes', url: 'https://pubmed.ncbi.nlm.nih.gov/21171789/' },
          { label: 'Baranowski & Hecht (2015), Archives of Sexual Behavior \u2014 field replication on campus and in nightclubs (significantly more men than women consent to a stranger\'s sexual invitation); the gap disappears in a low-perceived-risk laboratory setting', url: 'https://pubmed.ncbi.nlm.nih.gov/25828991/' },
          { label: 'Kunz & Greitemeyer (2025), Journal of Social Psychology \u2014 two fresh naturalistic replications: men still accept a sexual invitation from an opposite-sex stranger far more readily than women', url: 'https://pubmed.ncbi.nlm.nih.gov/39661065/' },
        ],
        researchNotes: 'The original 1989 percentages (commonly cited as ~69-75% of men vs 0% of women) could not be re-verified verbatim this session \u2014 the original article and the 2025 full text both 403\'d \u2014 so the ruling uses the abstract-level magnitudes confirmed on PubMed ("men quite likely to accept, women never did"). Regrade risk: if the card\'s framing hardens into an intrinsic anti-male double standard, Conley 2011 plus the low-risk lab data argue the driver is anticipated pleasure and safety rather than male directness itself, which would pull the verdict toward oversimplified. Note the claim covers the target\'s immediate reception; reputational aftermath for sexually forward women is a separate literature not graded here.',
      },
      related: [ { label: 'Chart: "player" vs "slut"', href: 'statistics.html#stat-double-standard' }, { label: 'Ruling M-TBD-12: the same asymmetry, tested', href: 'mythbuster.html#M-TBD-12' } ],
    },
    {
      id: 'M-TBD-14',
      category: 'Attraction',
      question: 'Do women reward the same player behavior they complain about?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Complaining about the guys you reward',
      claims: [
        { camp: 'Male perspective',
          text: 'A lot of the same people who complain loudest about fuckboys and players are the ones who keep rewarding that behavior and rejecting the honest guys. They author the outcome they complain about.',
          verdict: 'oversimplified', truth: 40 },
        { camp: 'Female perspective',
          text: 'If you\'re endlessly frustrated by fuckboys and players, look honestly at the pattern in who you actually give your time, attention, and chances to. A lot of the heartbreak comes from rewarding the exact behavior you complain about while writing off the steadier men as "boring."',
          verdict: 'oversimplified', truth: 40 },
      ],
      ruling: {
        badge: 'Half right',
        text: 'At first contact, partly yes: narcissists are more popular at first sight, and the charming traits are precisely the toxic ones \u2014 exploitativeness and entitlement (Back et al. 2010). But the reward is front-loaded: across three weeks of real contact the advantage decays as arrogance and untrustworthiness surface (Leckelt et al., n=311). The "rejecting the honest guys" half fails outright \u2014 women chose the nice guy for dates and serious relationships, with looks mattering mainly for casual sex. And no study shows the loudest complainers are the same women doing the rewarding.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology \u2014 narcissism predicts popularity at zero acquaintance, driven most by the exploitativeness/entitlement facet', url: 'https://pubmed.ncbi.nlm.nih.gov/20053038/' },
          { label: 'Leckelt, K\u00fcfner, Nestler & Back (2015), Journal of Personality and Social Psychology \u2014 longitudinal study (n=311) showing narcissists\' initial popularity declines over repeated group contact as arrogant-aggressive behavior and perceived untrustworthiness emerge', url: 'https://pubmed.ncbi.nlm.nih.gov/26191958/' },
          { label: 'Urbaniak & Kilmann (2003), Sex Roles \u2014 women preferred the nice guy for dates and serious relationships; physical attractiveness mattered more for casual-sexual desirability', url: 'https://link.springer.com/article/10.1023/A:1025894203368' },
        ],
        researchNotes: 'No study directly tests the within-person claim \u2014 that the loudest complainers are the same individuals rewarding players \u2014 so that part rests on inference from population-level first-impression effects. A verified partial supporting the "keep going back" reading: Haslam & Montrose (2015, Personality and Individual Differences; confirmed via the Hartpury repository, https://pure.hartpury.ac.uk/en/publications/should-have-known-better-the-impact-of-mating-experience-and-the-/) found women with more mating experience and those desiring marriage rated the narcissistic male personality as more attractive, in a single ~146-woman sample. Regrade risk: Jauk et al. (2016) speed-dating work attributes narcissism\'s mate appeal largely to shared variance with extraversion and physical attractiveness (Wiley paywall blocked verification this session), so "player traits per se get rewarded" is contestable at the mechanism level.',
      },
      related: [ { label: 'Framework: The Charm Ceiling', href: 'frameworks.html#charm-ceiling' } ],
    },
    {
      id: 'M-TBD-15',
      category: 'Attraction',
      question: 'Does smooth game beat honesty in who actually gets chosen?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Butterflies beat honesty',
      claims: [
        { camp: '',
          text: 'Given the choice, a lot of women would rather be with the guy who has smooth game \u2014 even knowing he\'s probably dishonest \u2014 than the awkward but honest one. The ability to make her feel butterflies and say the right thing at the right moment beats honesty for a lot of people. Charm and confidence win over honesty.',
          verdict: 'oversimplified', truth: 35 },
      ],
      ruling: {
        badge: 'True at first sight',
        text: 'At first contact, yes \u2014 confidence and smoothness win. Narcissists are rated more popular at zero acquaintance and earn higher short-term mate appeal in real courtship interactions, via social boldness rather than empathy. But the claim\'s "even knowing he\'s dishonest" clause fails: describing a target as honest raises attractiveness ratings (replicated at n=457), and narcissists\' popularity decays precisely as they come to be seen as untrustworthy. Charm wins because the dishonesty isn\'t visible yet \u2014 not because women knowingly discount it.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology \u2014 narcissists are more popular at zero acquaintance, and the most exploitative/entitled facets charm the most', url: 'https://pubmed.ncbi.nlm.nih.gov/20053038/' },
          { label: 'Dufner, Rauthmann, Czarna & Denissen (2013), Personality and Social Psychology Bulletin \u2014 narcissism boosts short-term mate appeal across three studies (including naturalistic courtship outcomes), mediated by social boldness and physical attractiveness', url: 'https://pubmed.ncbi.nlm.nih.gov/23554177/' },
          { label: 'Niimi & Goto (2023), PLOS ONE \u2014 the "honesty premium": targets described as honest are rated more facially attractive, replicating Paunonen (2006) in two experiments (n=65 and n=457); a fourth experiment failed to replicate, attributed to method', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9925008/' },
          { label: 'Leckelt, K\u00fcfner, Nestler & Back (2015), J. of Personality and Social Psychology \u2014 narcissists\' initial popularity declines over three weeks as arrogant-aggressive behavior surfaces and they are increasingly seen as untrustworthy', url: 'https://pubmed.ncbi.nlm.nih.gov/26191958/' },
        ],
        researchNotes: 'Also verified via PubMed: Leckelt et al. 2015 (JPSP, PMID 26191958) \u2014 narcissists\' initial popularity declines over three weeks as arrogant-aggressive behavior and being seen as untrustworthy take over, which is the mechanism behind the ruling\'s last sentence. Jauk et al. 2016 (European Journal of Personality speed-dating, narcissism predicting both short- and long-term mate appeal) fits the picture but was paywalled (Wiley 402), so it is not cited; a 2025 Journal of Personality speed-dating study on narcissistic dating success (doi 10.1111/jopy.70059) was also paywalled and could soften the first-sight advantage if it is a non-replication. No study directly tests the exact forced choice "knowingly dishonest smooth vs honest awkward," and samples are mostly students/lab paradigms \u2014 hence evidence tier, not hard-data.',
      },
      related: [ { label: 'Framework: The Charm Ceiling', href: 'frameworks.html#charm-ceiling' } ],
    },
    {
      id: 'M-TBD-16',
      category: 'Attraction',
      question: 'When women say they want an honest guy, is that the real preference?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"I want an honest guy" is branding',
      claims: [
        { camp: 'Male perspective',
          text: '"I want a guy with game" sounds shallow and a little manipulative, while "I want an honest guy" makes you look like you have good values. So people keep saying the thing that makes them look good, even when it isn\'t what they actually respond to. It\'s branding. What someone says they want and what they actually chase are two different data sets \u2014 and the second one is the one that predicts behavior.',
          verdict: 'oversimplified', truth: 35 },
        { camp: 'Female perspective',
          text: '"I just want a nice, honest guy" sounds good and makes you look like you\'ve got your priorities straight \u2014 but if the men who actually make you feel something are the confident, cocky, smooth ones, then "honest guy" is branding, not your real preference.',
          verdict: 'oversimplified', truth: 35 },
      ],
      ruling: {
        badge: 'Half right',
        text: 'Partly. In live speed dating, ideals stated beforehand failed to predict who actually inspired desire \u2014 the stated/revealed gap is real and replicated at first attraction. But "branding" overreaches: stated ideals prospectively predicted the traits of partners singles ended up with five months later (N=763), and across 43 countries, partners matching one\'s own ideals were rated better (corrected \u03b2=.19, N=10,358). "Honest" is near-universal boilerplate, so it carries little distinctive signal \u2014 but the gap reflects weak introspection, not image management, and stated ideals do predict selection.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 ideal preferences stated before a speed-dating event failed to predict actual romantic desire at the event', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Gerlach, Arslan, Schultze, Reinhard & Penke (2019), Journal of Personality and Social Psychology \u2014 G\u00f6ttingen Mate Choice Study: N=763 singles tracked prospectively; stated ideals predicted the characteristics of later actual partners', url: 'https://pubmed.ncbi.nlm.nih.gov/28921999/' },
          { label: 'Eastwick et al. (2024), Journal of Personality and Social Psychology \u2014 worldwide test (N=10,358, 43 countries): partners matching one\'s own stated ideals were evaluated more positively, corrected pattern metric \u03b2=.19; single-trait weighting near zero (\u03b2\u2248.04)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12622239/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): stated ideal-partner preferences fail to predict live romantic evaluations', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
        ],
        researchNotes: 'Also verified the Eastwick, Luchies, Finkel & Hunt (2014) Psychological Bulletin meta-analysis (k=97, PMID 23586697): both sexes\' live evaluations tracked attractiveness at r\u2248.40 with nonsignificant sex differences, backing the stated/revealed split at first attraction. The card\'s "branding" mechanism is its weak link \u2014 researchers attribute the gap to construal/introspective limits rather than impression management, though the 2024 worldwide test\'s trait-by-trait level metric (\u03b2\u2248.04) is a genuine partial for the card: naming any single stated trait like honesty adds almost no distinctive predictive weight. Regrade risk: evidence that preference self-reports are driven by social desirability rather than introspection limits would push the verdict toward confirmed.',
      },
      related: [ { label: 'Pill: The Blue Pill', href: 'pills.html#page-bp' }, { label: 'Ruling M-TBD-38: standards vs live desire', href: 'mythbuster.html#M-TBD-38' } ],
    },
    {
      id: 'M-TBD-17',
      category: 'Market',
      question: 'Are men checking out of dating?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Guys are checking out',
      claims: [
        { camp: 'Male perspective',
          text: 'A lot of guys just say "fuck this" and check out entirely. Some go monk mode and pour everything into money and themselves; others swallow their pride and learn to become players too. For the ones who only ever wanted to be decent and honest, it really is a raw deal, and a lot of them are losing hope.',
          verdict: 'oversimplified', truth: 70 },
        { camp: 'Female perspective',
          text: 'For a long time dating ran on an unspoken default: men approach, women select. That arrangement is quietly breaking. A growing share of younger men are opting out of approaching altogether \u2014 worn down by the apps, the rejection, and years of being told they\'re the problem. If your whole strategy is to look good and wait to be approached, the supply you\'re counting on is drying up, through no decision of your own.',
          verdict: 'oversimplified', truth: 70 },
      ],
      ruling: {
        badge: 'Real trend, shaky story',
        text: 'The checkout is measurable: only 50% of single U.S. men were looking for a relationship or dates in July 2022, down from 61% in 2019 (Pew, n=6,034); 63% of men under 30 are single; and past-year sexlessness among men 18\u201324 rose from 19% to 31% between 2000\u20132002 and 2016\u20132018 (GSS). But the why is embellished: singles\' top stated reasons are enjoying single life and other priorities, and the rise concentrates among unmarried men, and sexual inactivity is disproportionately found among low-income and part-time/unemployed men \u2014 not monk-mode self-improvers.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Pew Research Center (2023) \u2014 57% of singles not looking; single men looking fell 61%\u219250% (2019\u20132022); 63% of men under 30 single', url: 'https://www.pewresearch.org/short-reads/2023/02/08/for-valentines-day-5-facts-about-single-americans/' },
          { label: 'Ueda, Mercer, Ghaznavi & Herbenick (2020), JAMA Network Open \u2014 GSS 2000\u20132018: sexual inactivity among men 18\u201324 rose 18.9%\u219230.9%, concentrated among unmarried, lower-income, part-time/unemployed men', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7293001/' },
        ],
        researchNotes: 'The withdrawal trend itself is solid across two independent representative datasets, but the claim\'s motive story (bitter honest men going monk mode or turning player) is untested \u2014 Pew\'s self-reported reasons read as indifference/priorities, not lost hope, and self-reports may under-capture bitterness. Part of the 2019\u21922022 drop overlaps the pandemic, so some rebound is possible (Pew 2025 reports singledom ticking down). A targeted study of male dating-app burnout or disengagement motives could upgrade the motive half and shift the verdict toward confirmed.',
      },
      related: [ { label: 'Framework: The Men\u2019s Strike', href: 'frameworks.html#mens-strike' }, { label: 'Chart: the sex recession', href: 'statistics.html#stat-sex-recession' } ],
    },
    {
      id: 'M-TBD-18',
      category: 'Attraction',
      question: 'Does arrogance attract, even when women say they can\'t stand it?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The arrogant-guy paradox',
      claims: [
        { camp: 'Male perspective',
          text: 'That mix of confidence and game is magnetic to a lot of women \u2014 even when the guy is genuinely a dick or full of it. So the very traits women say they can\'t stand \u2014 arrogance, being full of yourself \u2014 are often the ones that get rewarded most.',
          verdict: 'oversimplified', truth: 45 },
        { camp: 'Female perspective',
          text: 'The cocky, arrogant, slightly-too-confident man often gets you in a way the kind, humble one doesn\'t \u2014 even when you can see he\'s a bit of a jerk. That confidence reads as high value, and it\'s genuinely magnetic. The traits you\'ll publicly say you can\'t stand \u2014 arrogance, a little bit of an edge \u2014 are frequently the ones that actually move you.',
          verdict: 'oversimplified', truth: 45 },
      ],
      ruling: {
        badge: 'True at first sight',
        text: 'At first sight, yes \u2014 this paradox is a replicated finding. Narcissists were more popular at zero acquaintance (73-person round-robin, 2,628 dyads), the entitled, exploitative facet was the most attractive of all, and narcissism predicted real courtship success. But the decomposition matters: the pull runs through confidence, boldness, and appearance \u2014 when observers read a man as arrogant per se, desirability drops. And this evidence covers first impressions and short-term appeal, where the dick side hasn\'t had time to surface.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology \u2014 narcissists more popular at zero acquaintance; the exploitativeness/entitlement facet was the most attractive, mediated by appearance and verbal/nonverbal cues', url: 'https://pubmed.ncbi.nlm.nih.gov/20053038/' },
          { label: 'Dufner, Rauthmann, Czarna & Denissen (2013), Personality and Social Psychology Bulletin \u2014 narcissism raised short-term mate appeal across three studies including real-life courtship outcomes, mediated by physical attractiveness and social boldness', url: 'https://pubmed.ncbi.nlm.nih.gov/23554177/' },
          { label: 'Murphy et al. (2015), Personality and Social Psychology Bulletin \u2014 perceived confidence increased romantic desirability while perceived arrogance counteracted it; overconfidence deterred same-sex rivals', url: 'https://pubmed.ncbi.nlm.nih.gov/26055389/' },
        ],
        researchNotes: 'The reward is front-loaded: Carlson & DesJardins (2015, PSPB, fetched and verified this session) found narcissists initially gained status but lost it with repeated exposure and overestimated their own popularity, so the paradox is strongest where acquaintance is thinnest. Converging support left out under the 3-source cap: Jauk et al. (2016, European Journal of Personality) speed-dating found narcissism predicted mate appeal (via extraversion/attractiveness; Wiley page paywalled, verified only via abstract), and a 2025 Journal of Personality speed-dating study reportedly found rivalrous narcissism predicted more second dates (not independently fetched). Regrade risk: if the question is re-scoped to long-term partner choice, the verdict tilts further against the claim \u2014 narcissism\'s costs surface with exposure.',
      },
      related: [ { label: 'Pill: The Red Pill', href: 'pills.html#page-rp' } ],
    },
    {
      id: 'M-TBD-19',
      category: 'Attraction',
      question: 'Does charisma make red flags disappear?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Charisma overrides red flags',
      claims: [
        { camp: 'Male perspective',
          text: 'Women will ignore massive red flags if the guy has enough charisma and confidence. They convince themselves "he\'ll change for me" or "I\'m different," then act shocked when the guy who slept with 300 women behaves exactly like a guy who slept with 300 women.',
          verdict: 'oversimplified', truth: 40 },
        { camp: 'Female perspective',
          text: 'The smoother and more confident he is, the more you\'ll be tempted to wave off the warning signs \u2014 the inconsistency, the history, the way he treats other people. "He\'s different with me" and "he\'ll change for me" are the famous last words here. The men who hurt you most are rarely the obvious creeps; they\'re the charming ones you decided to trust because they made you feel something.',
          verdict: 'oversimplified', truth: 40 },
      ],
      ruling: {
        badge: 'Charm expires',
        text: 'Temporarily, yes \u2014 and not just on women. In a 73-person round-robin of first meetings (2,628 dyads), the most exploitative, entitled narcissism facets were exactly the most charming at first sight. But the spell decays: across three weeks of group contact, narcissists were increasingly read as untrustworthy and their popularity sank. The base-rate warning is real too \u2014 prior cheaters carried triple the odds of cheating again. Charm masks flags at first glance; it doesn\'t erase them, and it isn\'t female gullibility.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology \u2014 zero-acquaintance round-robin (N=73, 2,628 dyads): the narcissism facets most maladaptive long-term (exploitativeness/entitlement) were the most attractive at first sight, mediated by charming verbal/nonverbal behavior and appearance.', url: 'https://pubmed.ncbi.nlm.nih.gov/20053038/' },
          { label: 'Leckelt, K\u00fcfner, Nestler & Back (2015), Journal of Personality and Social Psychology \u2014 longitudinal groups (n=311, three weekly sessions): narcissists\' initial popularity declines as arrogant-aggressive behavior mounts and they are increasingly perceived as untrustworthy.', url: 'https://pubmed.ncbi.nlm.nih.gov/26191958/' },
          { label: 'Knopp, Scott, Ritchie, Rhoades, Markman & Stanley (2017), Archives of Sexual Behavior \u2014 484 adults tracked across two consecutive relationships: infidelity in the first relationship meant three times the odds of infidelity in the next, consistent across respondent gender.', url: 'https://pubmed.ncbi.nlm.nih.gov/28785917/' },
        ],
        researchNotes: 'The lab evidence measures narcissism-driven first-impression charm, not literal "red flag ignoring," and Back 2010\'s mixed-sex round-robin plus Knopp\'s gender-consistent infidelity odds undercut the women-specific framing; the "he\'ll change for me" persistence is better explained by investment-model commitment research than by charisma. Supporting but uncited: Carter, Campbell & Muncer (2014, PAID) found 128 women rated a high-Dark-Triad male character more attractive. Regrade risk: a proper meta-analysis of Dark Triad attractiveness (speed-dating results are mixed) could shrink the "charm advantage" toward null, pushing this closer to plain false.',
      },
      related: [ { label: 'Framework: The Charm Ceiling', href: 'frameworks.html#charm-ceiling' } ],
    },
    {
      id: 'M-TBD-20',
      category: 'Attraction',
      question: 'Does being wanted by other women make a man more attractive?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Preselection: nothing attracts women like other women',
      claims: [
        { camp: 'Male perspective',
          text: 'Women are drawn to men who other women visibly want. Seeing that you have options \u2014 that you\'re genuinely chosen and pursued \u2014 spikes interest, because it triggers competition and the instinct that "if all these women want him, there must be something good here." This is why a female friend vouching for you does almost nothing, while visibly having women chase you does a lot: one reads as safe, the other as desirable.',
          verdict: 'oversimplified', truth: 65 },
        { camp: 'Female perspective',
          text: 'A man becomes more attractive the moment you can tell other women want him \u2014 it\'s why the taken guy, the popular one, the one with options pulls harder than the equally-good man nobody\'s noticed. It feels like taste; a lot of it is just social proof.',
          verdict: 'oversimplified', truth: 65 },
      ],
      ruling: {
        badge: 'Real but overstated',
        text: 'Mate-choice copying is real and asymmetric in the claim\'s favor: in Hill & Buss (N=847), women rated a man as more desirable when shown surrounded by women, while men rated a woman as less desirable when surrounded by men. But the 2018 Gouda-Vossos meta-analysis found the effect modest, highly heterogeneous, and inflated by moderate publication bias \u2014 reliable for women choosing men, weak-to-mixed for men. "One of the strongest forces" overstates it; the vouching-does-nothing claim is untested.',
        tier: 'hard-data',
        truth: 80,
        sources: [
          { label: 'Hill & Buss (2008), Personality and Social Psychology Bulletin \u2014 women rated men more desirable when surrounded by women (desirability enhancement); men rated women less desirable when surrounded by men (Study 1, N=847).', url: 'https://pubmed.ncbi.nlm.nih.gov/18303129/' },
          { label: 'Gouda-Vossos, Nakagawa, Dixson & Brooks (2018), Adaptive Human Behavior and Physiology \u2014 meta-analysis: copying reliable for women choosing men, no clear effect for men, with high heterogeneity and moderate publication bias favoring positive reports.', url: 'https://research.monash.edu/en/publications/mate-choice-copying-in-humans-a-systematic-review-and-meta-analys' },
        ],
        researchNotes: 'The preselection/mate-choice-copying core is well-replicated for women choosing men, but the 2018 meta-analysis flags high heterogeneity and moderate publication bias, so "one of the strongest forces" is unsupported hyperbole. The card\'s "vouching-does-almost-nothing vs. visible-pursuit-does-a-lot" split is untested and arguably backwards \u2014 "augmentation" studies show even indirect social information (other women\'s endorsements/ratings) can raise a target\'s desirability. Verdict would move to "confirmed" if the card dropped the magnitude framing and the vouching claim; it would weaken toward "false" if it insisted the effect were symmetric across the sexes.',
      },
      related: [ { label: 'Pill: The Red Pill (preselection)', href: 'pills.html#page-rp' } ],
    },
    {
      id: 'M-TBD-21',
      category: 'Standards',
      question: 'Is a high body count judged the same on men and women?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The body-count double standard',
      claims: [
        { camp: 'Male perspective',
          text: 'A woman with a high body count is widely read as a red flag \u2014 impulsive, low-value, maybe not loyal. A man with a high body count often reads the other way: a lot of women see it as high value, because "if that many women wanted him, he must have something." It\'s preselection again \u2014 her history signals risk, his signals demand.',
          verdict: 'oversimplified', truth: 30 },
        { camp: 'Female perspective',
          text: 'Something men rarely say to your face but very often think: a high body count reads to a lot of them as a yellow or red flag, even the ones who\'ll happily sleep with you. The culture says it shouldn\'t matter, and plenty of men won\'t admit it out loud to avoid sounding judgmental \u2014 but in their actual long-term choices, it frequently does.',
          verdict: 'confirmed', truth: 70 },
      ],
      ruling: {
        badge: 'Slight lean, not reversal',
        text: 'The direction is real, the magnitude inflated. Endendijk et al.\'s meta-analysis (99 studies, 123,343 people) finds a traditional double standard \u2014 men\'s sexual activity is evaluated more positively than women\'s \u2014 but the effect is small (d\u22480.25) and shows up only when people rate male vs. female targets (largely implicit vignette-style evaluation studies), vanishing on explicit Likert-scale double-standard questionnaires. Crucially, a high count is no plus for men: Stewart-Williams et al. (2017) found willingness peaks at a modest history then falls sharply, with both sexes equally reluctant about an extensive record. A slight lean, not opposite verdicts.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Endendijk, van Baar & Dekovi\u0107 (2020), Personality and Social Psychology Review \u2014 meta-analysis of 99 studies (123,343 participants) finds a traditional sexual double standard (men\'s sexual activity evaluated more positively; d\u22480.25) in evaluation/expectation-difference studies, largely implicit vignette designs; null on explicit Likert-type SDS questionnaires, null on Likert questionnaires, moderated by country gender equality.', url: 'https://pubmed.ncbi.nlm.nih.gov/31880971/' },
          { label: 'Stewart-Williams, Butler & Thomas (2017), The Journal of Sex Research \u2014 willingness to partner rises with a modest sexual history then falls dramatically; both sexes expressed equal reluctance toward an overly extensive history (no strong double standard at the high end).', url: 'https://pubmed.ncbi.nlm.nih.gov/27805420/' },
        ],
        researchNotes: 'The weak part of the claim is the "opposite directions" framing: the double standard is directional (men judged somewhat more leniently) but small and measurement-dependent, and the "high count reads as high value for men" assertion is essentially unsupported \u2014 high counts are penalized by both sexes. Regrade risk: the equal-penalty-at-the-top finding leans on a single study (Stewart-Williams, n=188), though it converges with the meta-analytic result that the SDS is weak and inconsistent. Could not load the Sage full text or Cronfa PDF (server refused/403); graded from the verified PubMed abstracts. Female-perspective mirror (GD #154) grades Confirmed: it claims only that men privately weigh a high count in long-term choices \u2014 directly supported by the willingness-drop findings \u2014 without the male card\u2019s his-count-is-a-plus asymmetry.',
      },
      related: [ { label: 'Framework: Body Count & Pair-Bonding', href: 'frameworks.html#body-count' }, { label: 'Chart: "player" vs "slut"', href: 'statistics.html#stat-double-standard' } ],
    },
    {
      id: 'M-TBD-22',
      category: 'Attraction',
      question: 'Do objectification complaints depend on who is doing the objectifying?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Stop sexualizing me" is selective',
      claims: [
        { camp: 'Male perspective',
          text: '"Stop sexualizing me \u2014 just treat me like a human." It sounds like a principle, but watch when it actually gets deployed: almost always toward men they\'re not attracted to. The same women are usually fine \u2014 happy, even \u2014 being sexualized by the men they do find attractive. The same exact behavior reads as "hot" from a man she wants and "creepy \u2014 why can\'t you just treat me like a human?" from one she doesn\'t.',
          verdict: 'oversimplified', truth: 45 },
        { camp: 'Female perspective',
          text: 'Be honest about the "just treat me like a human, stop sexualizing me" instinct: it usually fires for men you\'re not attracted to, not the ones you are. The same comment that feels gross from one man feels flattering \u2014 even hot \u2014 from another.',
          verdict: 'oversimplified', truth: 45 },
      ],
      ruling: {
        badge: 'Half true',
        text: 'Partly \u2014 the perceptual asymmetry is real. In vignette experiments, identical ambiguous behavior was judged less harassing when the man was attractive (Golden et al. 2001, N=150); a second N=591 study found attractive opposite-sex perpetrators were judged less harassing (LaRocca & Kromrey 1999). But "unwanted" is built into what harassment means: attention that varies in welcomeness by source is consent logic, not hypocrisy. And "happy, even" fails outright \u2014 objectification by women\'s own chosen partners predicts lower sexual satisfaction, weaker refusal ability, and more coercion (S\u00e1ez et al. 2019).',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Golden, Johnson & Lopez (2001), Sex Roles \u2014 vignette experiment (N=150, photo-manipulated attractiveness): identical ambiguous workplace behavior by attractive men was less likely to be judged harassing', url: 'https://link.springer.com/article/10.1023/A:1015688303023' },
          { label: 'LaRocca & Kromrey (1999), Sex Roles \u2014 N=591 students; an attractive opposite-sex perpetrator in an identical ambiguous scenario was perceived as less harassing than an attractive same-gender perpetrator', url: 'https://link.springer.com/article/10.1023/A:1018829222894' },
          { label: 'S\u00e1ez, Alonso-Ferres, Garrido-Mac\u00edas, Valor-Segura & Exp\u00f3sito (2019), Frontiers in Psychology \u2014 N=138 women: perceived objectification by one\'s own partner is linked to lower sexual satisfaction via undermined refusal ability and higher sexual coercion', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02748/full' },
        ],
        researchNotes: 'The attractiveness-asymmetry evidence is third-party vignette work on student samples, not first-person field data on women\'s in-vivo reactions \u2014 a strong experience-sampling or behavioral study could enlarge or shrink the effect, and the S\u00e1ez et al. counter-evidence is correlational (N=138). The claim\'s kernel is also partly definitional: "unwanted attention" is receiver-relative by construction, so source-dependence alone cannot establish insincerity or weaponization. Regrade risk: direct first-person data showing women uniformly welcome sexualized attention from desired men would push the verdict toward confirmed; none was found.',
      },
      related: [ { label: 'Framework: Treatment Markup', href: 'frameworks.html#treatment-markup' } ],
    },
    {
      id: 'M-TBD-23',
      category: 'Attraction',
      question: 'Do men and women desire celebrities differently?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The celebrity-crush asymmetry',
      claims: [
        { camp: 'Male perspective',
          text: 'When a man likes a female celebrity, it\'s mostly physical and contained \u2014 "she\'s gorgeous," and that\'s about it. When a woman likes a male celebrity, it far more often turns into something intense and emotional \u2014 fan edits, paragraphs, jealousy when he dates someone real, a full parasocial fantasy of actually being with him: "he\'s my husband, he\'s the standard, no real man compares." Male desire tends to run physical and bounded; female desire tends to run emotional, narrative, and fantasy-driven.',
          verdict: 'oversimplified', truth: 50 },
        { camp: 'Female perspective',
          text: 'Where a man\'s interest in a celebrity tends to stay physical and contained, women\'s often run emotional and narrative \u2014 the fan edits, the "he\'s my husband," the genuine pang when he\'s seen with someone else. That\'s not silly; it\'s a window into how female desire often works: emotional, story-driven, fantasy-forward.',
          verdict: 'oversimplified', truth: 50 },
      ],
      ruling: {
        badge: 'Half right',
        text: 'Half of it holds. Girls\' and women\'s celebrity crushes running emotional and narrative is documented: adolescent idols serve as safe practice targets for romantic love \u2014 talked over with peers, complete with excitement and jealousy of the idol\'s real and on-screen relationships (Karniol 2001). The "male desire stays bounded" half breaks: a systematic review finds sex differences in celebrity-worship intensity mixed and inconsistent, most studies find no sex difference at all, and where differences appear, men more often score higher on borderline-pathological worship and slightly likelier to endorse celebrity stalking (one study). The visible fan-edit culture skews female; the obsession that escapes containment tilts male.',
        tier: 'evidence',
        truth: 70,
        sources: [
          { label: 'Karniol (2001), Sex Roles \u2014 adolescent girls\' idolization of male media stars as a safe \'practice\' target of romantic love before dating', url: 'https://link.springer.com/article/10.1023/A:1011037900554' },
          { label: 'Brooks (2018), Current Psychology \u2014 systematic review of celebrity-worship correlates: sex differences mixed; males higher on borderline-pathological worship in most studies; one study finds males slightly likelier to endorse celebrity stalking', url: 'https://link.springer.com/article/10.1007/s12144-018-9978-4' },
          { label: 'Tukachinsky & Dorros (2018), Journal of Children and Media \u2014 parasocial romantic relationships in mixed-sex adolescent samples have distinct emotional and physical dimensions; emotional involvement, not physical attraction, predicts later relationship costs', url: 'https://digitalcommons.chapman.edu/comm_articles/54/' },
        ],
        researchNotes: 'No study directly quantifies the claimed asymmetry \u2014 how often male vs female celebrity attraction becomes an intense parasocial romance \u2014 so the "far more often" magnitude is ungraded folk observation; the female-rehearsal evidence is also adolescent-heavy, with thin adult data. Adjacent literature (sexual-fantasy content, romance-vs-visual-erotica consumption) supports the style core, but the celebrity-worship intensity data cut against "bounded" male desire. A representative adult survey of parasocial-romance prevalence by sex could move this toward confirmed or false.',
      },
      related: [ { label: 'The Matchmaker: the celebrity roster', href: 'matchmaker.html' } ],
    },
    {
      id: 'M-TBD-24',
      category: 'Attraction',
      question: 'Does personality matter most \u2014 or do looks decide who even gets considered?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Personality matters most" is mostly marketing',
      claims: [
        { camp: 'Male perspective',
          text: 'On the apps, most women swipe left on the large majority of men based almost entirely on looks. Personality only gets a turn once she\'s already physically attracted to you. So the "average guy with a great personality" usually can\'t just get girls \u2014 he has to clear the looks filter first, and for most average guys that filter is brutal. "Personality is the most important thing" is largely marketing.',
          verdict: 'oversimplified', truth: 35 },
        { camp: 'Female perspective',
          text: 'For most women, attractiveness is the first filter just like it is for men; his personality only gets a turn once his photos clear the bar. The honest version isn\'t "looks don\'t matter to me," it\'s "looks decide who I\'ll even consider, and then I judge the rest."',
          verdict: 'confirmed', truth: 65 },
      ],
      ruling: {
        badge: 'True at the gate',
        text: 'At the gate, confirmed: a field experiment planting curated profiles before nearly half a million Tinder users found male profiles matched on just 0.6% of their likes (female profiles: 10.5%), in the paper\'s companion survey 93% of women reported liking only profiles they\'re explicitly attracted to, and the same man\'s profile with three photos instead of one drew roughly seven-fold more matches. Initial desire tracks looks in both sexes, and stated ideals don\'t predict it. The overreach is "largely marketing": lengthen acquaintance and the gate measurably weakens \u2014 friends-first couples barely sort on attractiveness.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Tyson, Perta, Haddadi & Seto (2016), IEEE/ACM ASONAM \u2014 Tinder field experiment (~230k male + 250k female profiles): male match rate 0.6% vs female 10.5%; 93% of women like only profiles they\'re attracted to vs 0% casually liking most; same male profile with 1 vs 3 photos: 234 vs 1,568 matches', url: 'https://arxiv.org/abs/1607.01952' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 speed-dating: stated ideal preferences failed to predict actual romantic desire, and physical attractiveness predicted initial interest with no sex differences', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Hunt, Eastwick & Finkel (2015), Psychological Science \u2014 167 couples: longer pre-dating acquaintance and friends-first histories predict sharply reduced assortative mating on physical attractiveness', url: 'https://pubmed.ncbi.nlm.nih.gov/26068893/' },
        ],
        researchNotes: 'The press-circulated "61.9% vs 4.5% like rate" attributed to the Tinder study does not appear in the paper text \u2014 quote only the verified 0.6%/10.5% match rates, the 93% liking-strategy figure, and the photo experiment. The looks gate runs in both sexes (Eastwick & Finkel), so any woman-specific framing of the filter overreaches. The off-app softening rests mainly on one 167-couple study; if Hunt et al. failed to replicate, the verdict would drift toward confirmed. Female-perspective mirror (GD #151) grades Confirmed: it asserts the gate and the symmetry, both carried by the cited sources, without the \u201clargely marketing\u201d overreach.',
      },
      related: [ { label: 'Pill: The Blue Pill ("personality matters")', href: 'pills.html#page-bp' }, { label: 'Ruling M-TBD-34: game vs looks', href: 'mythbuster.html#M-TBD-34' } ],
    },
    {
      id: 'M-TBD-25',
      category: 'Standards',
      question: 'Is height the one looks preference women state openly?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Height: the one looks preference women own',
      claims: [
        { camp: 'Male perspective',
          text: 'Somewhere along the way it became socially acceptable \u2014 even trendy \u2014 to state it outright, so women own it with zero shame: "6ft minimum," right there in the bio, on TikTok, in interviews, almost worn as a personality trait. Height is the one physical preference women will openly admit to caring about. Every other looks-based filter \u2014 baldness, weight, face, even income preferences \u2014 usually gets hidden behind a more respectable excuse.',
          verdict: 'oversimplified', truth: 65 },
        { camp: 'Female perspective',
          text: 'Every other looks-based preference \u2014 weight, baldness, his face \u2014 you\'ll usually hide behind a more acceptable reason. But somewhere it became socially fine to state height outright, so "6ft minimum" goes right in the bio, no embarrassment at all.',
          verdict: 'oversimplified', truth: 65 },
      ],
      ruling: {
        badge: 'Loudest, not only',
        text: 'The height half is solid: women state it openly and strongly \u2014 48.9% of women\'s Yahoo dating ads demanded a taller man outright (versus 13.5% of men wanting shorter), and women\'s height minimums are more selective and more consistent than men\'s. The exclusivity half fails: "even income preferences get hidden" is wrong \u2014 women openly rated good financial prospects higher than men in all 45 countries of the largest cross-cultural replication of Buss\'s mate-preference battery. Height is the loudest openly-owned filter, not the only one.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Yancey & Emerson (2016), Journal of Family Issues \u2014 in Yahoo dating ads, 48.9% of women required a taller man vs 13.5% of men requiring shorter (Rice University summary)', url: 'https://news2.rice.edu/2014/02/10/is-height-important-in-matters-of-the-heart-new-study-says-yes/' },
          { label: 'Stulp, Buunk & Pollet (2013), Personality and Individual Differences \u2014 women are more selective and more consistent in height preferences; satisfaction peaks at a partner 21 cm taller (men: 8 cm)', url: 'https://research.rug.nl/en/publications/women-want-taller-men-more-than-men-want-shorter-women' },
          { label: 'Walter, Conroy-Beam, Buss et al. (2020), Psychological Science \u2014 45-country replication (N=14,399): women openly rate mates\' financial prospects as more important than men do, in every society sampled', url: 'https://research.vu.nl/en/publications/sex-differences-in-mate-preferences-across-45-countries-a-large-s' },
        ],
        researchNotes: 'The claim\'s descriptive core is well-supported by stated-preference data (the 48.9% figure IS women stating the filter in their own ads), and Dial & Brown (2025, Human Nature, PMC12644153, verified) adds 43.4% of women vs 25.8% of men rating height important. But no peer-reviewed content analysis directly compares how openly height vs baldness/weight/face get stated in bios \u2014 the exclusivity leg is graded mainly on the income part, which Walter et al. and personal-ads research (Wiederman 1993, not independently fetched) contradict. Regrade risk: read narrowly as "looks-only preferences publicly owned in bios," the claim edges closer to confirmed. Female-perspective mirror (GD #153) scopes the exclusivity claim to looks-based preferences only, dodging the income counterexample \u2014 but its \u201cyou hide all the others\u201d half is untested by the cited sources, so it stays Oversimplified.',
      },
      related: [ { label: 'Chart: the height preference gap', href: 'statistics.html#height-pref' }, { label: 'Pill: The Height Pill', href: 'pills.html#height-pill' } ],
    },
    {
      id: 'M-TBD-26',
      category: 'Psychology',
      question: 'Whose approval actually drives women\'s choices \u2014 men\'s or other women\'s?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Women care more what other women think',
      claims: [
        { camp: 'Male perspective',
          text: 'Women generally care far more about what other women think than what men think. Take OnlyFans \u2014 most men say plainly they\'d never seriously date a woman who does it, yet it stays popular. Why? Because her female social circle supports it, stays neutral, or at least doesn\'t shame her for it. Male disapproval is loud and consistent, but it loses to the approval of her peers almost every time.',
          verdict: 'oversimplified', truth: 35 },
        { camp: 'Female perspective',
          text: 'A lot of the choices that read as "for men" \u2014 the OnlyFans, the heavy filler, the cosmetic work \u2014 keep happening even when most men say plainly they prefer the natural version. Why? Because your friends and your feed hype it up, and their approval lands harder than any man\'s disapproval. The audience you\'re really dressing for is other women.',
          verdict: 'oversimplified', truth: 35 },
      ],
      ruling: {
        badge: 'Oversimplified',
        text: 'The real finding: policing of women\'s sexual reputation is done chiefly by other women. Baumeister & Twenge\'s 2002 review found the claim that men suppress female sexuality got "hardly any support" \u2014 women stifle each other\'s; Vaillancourt\'s work shows women aim indirect aggression at sexually-available peers. But female peers are the enforcers, not the ultimate audience: intrasexual competition is a contest to attract men, and OnlyFans itself runs on paying male demand. "Far more, almost every time" overreaches.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Vaillancourt (2013), Philosophical Transactions of the Royal Society B \u2014 women use indirect aggression to police sexually-available/attractive female peers, suppressing rivals\' sexuality (incl. the Vaillancourt & Sharma \'sexy peers\' experiment).', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3826209/' },
          { label: 'Baumeister & Twenge (2002), Review of General Psychology \u2014 a cross-domain review concluding female sexuality is suppressed chiefly by other women; the idea that men do the suppressing got \'hardly any support.\'', url: 'https://journals.sagepub.com/doi/10.1037/1089-2680.6.2.166' },
        ],
        researchNotes: 'The narrow core \u2014 female peers, not men, are the chief enforcers of women\'s sexual reputation \u2014 is well-supported (Baumeister & Twenge 2002; Vaillancourt 2013). But "women care far more about what other women think" is a global claim never directly tested as stated, and the OnlyFans example arguably inverts itself since the platform monetizes male demand. Verdict would move to \'confirmed\' if scoped strictly to sexual-reputation sanctioning, or toward \'false\' if read as a claim about all female motivation and choice.',
      },
      related: [ { label: 'GD card: Social approval runs deeper', href: 'gender-dynamics.html#gd-social-approval' } ],
    },
    {
      id: 'M-TBD-27',
      category: 'Psychology',
      question: 'Do women move with social consensus more than men?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The female hive mind',
      claims: [
        { camp: 'Male perspective',
          text: 'Women tend to operate far more as a hive mind than most people want to admit \u2014 much more sensitive to social consensus, trends, and what other women are doing and saying. If one popular woman declares something attractive (or a red flag, or a new rule), a huge share start repeating it, and it spreads like wildfire \u2014 the "6ft minimum," "never split the bill," "the bar is in hell." Men hold more individual, idiosyncratic opinions, even unpopular ones; women tend to move together.',
          verdict: 'oversimplified', truth: 20 },
        { camp: 'Female perspective',
          text: 'Trends in standards, red flags, what\'s attractive, what\'s embarrassing \u2014 they sweep through women fast and almost universally, because most of us are far more tuned to social consensus than we admit. One popular voice says "6ft minimum" or "the bar is in hell," and overnight it\'s everyone\'s opinion.',
          verdict: 'oversimplified', truth: 20 },
      ],
      ruling: {
        badge: 'Everyone conforms',
        text: 'The kernel: classic meta-analytic work \u2014 Eagly & Carli\'s 148-study review \u2014 did report women as slightly more conforming, a small difference partly tied to masculine-biased test content. The modern record shrinks it further: a 2024 systematic review (48 articles covering 78 conformity studies) found only a minority detect any gender effect, and recent studies show no significant disparity; a 2023 Asch replication (n=202) found no sex difference while a third of judgments in the baseline condition bent to an obviously wrong majority. Conformity is human, not female; "hive mind versus independent men" is a caricature.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Capuano & Chekroun (2024), International Review of Social Psychology \u2014 systematic review of 78 conformity studies: only a minority find any gender effect (64 of 78 did not report gender), and recent studies show no significant male-female disparity in conformity', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12372704/' },
          { label: 'Franzen & Mader (2023), PLoS One \u2014 Asch replication with 202 Swiss students: 33% conformity to an obviously wrong majority overall, and no statistically significant gender difference (female trend only at the 10% level)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10686423/' },
          { label: 'Eagly & Carli (1981), Psychological Bulletin \u2014 the classic 148-study meta-analysis behind \'women are more influenceable\'; the female-direction difference it reports is small and moderated by masculine-biased study content and researcher sex', url: 'https://eric.ed.gov/?id=EJ263542' },
        ],
        researchNotes: 'The strongest classic nuance stayed out of the ruling for sourcing reasons: Eagly, Wood & Fishbaugh (1981, JPSP) found the sex gap appeared mainly when responses were public, driven partly by men conforming LESS under surveillance \u2014 male "independence" as display, which cuts against the claim\'s framing, but no stable primary URL would fetch. Bond & Smith\'s 1996 meta also reported higher conformity in samples with more female respondents, so a large modern replication finding a robust female-direction effect could enlarge the kernel \u2014 though nothing in the literature approaches "hive mind" magnitude. The claim\'s trend-diffusion half (viral "6ft minimum" rules) has no direct literature either way; lab conformity is the nearest proxy, and it says both sexes move with the majority.',
      },
      related: [ { label: 'GD card: The herd script just got updated', href: 'gender-dynamics.html#gd-herd-script' } ],
    },
    {
      id: 'M-TBD-28',
      category: 'Attraction',
      question: 'When women say they want to feel safe, is that what they choose?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"I just want to feel safe" is usually just talk',
      claims: [
        { camp: 'Male perspective',
          text: '"I just want to feel safe" sounds reasonable, but a lot of the time it\'s pretty words. Watch the actions: the same women who say they want a safe guy are often chasing the exciting, unpredictable, slightly dangerous one who gives them butterflies. They say safety; they go for chaos. What they actually want is a guy who makes them feel safe and excited \u2014 very few want a genuinely stable, low-drama guy if he\'s also boring.',
          verdict: 'oversimplified', truth: 30 },
        { camp: 'Female perspective',
          text: 'Often "safe" means emotionally safe (he won\'t hurt or abandon you), while the spark still drags you toward the exciting, unpredictable, slightly dangerous guy. Very few women actually want a genuinely stable, low-drama man if he also bores them.',
          verdict: 'oversimplified', truth: 30 },
      ],
      ruling: {
        badge: 'Short-term only',
        text: 'At first sight, the kernel holds: 128 women rated a Dark Triad character as more attractive than a control with looks held constant, and a warm, responsive male stranger earned no attraction boost \u2014 that cue works on men, not on women. But at the choosing stage the claim collapses: women picked the nice guy over the jerk roughly eight to one, and niceness was the most salient factor for serious relationships. Excitement wins the first spark; safe wins the actual pick.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Carter, Campbell & Muncer (2014), Personality and Individual Differences \u2014 128 women rated a high Dark Triad male character as significantly more attractive than a control, with physicality held constant', url: 'https://ray.yorksj.ac.uk/id/eprint/1187/' },
          { label: 'Birnbaum, Ein-Dor, Reis & Segal (2014), Personality and Social Psychology Bulletin \u2014 responsiveness from a stranger raised men\'s attraction to women but gave women no attraction boost in initial acquaintanceships', url: 'https://pubmed.ncbi.nlm.nih.gov/25062930/' },
          { label: 'Urbaniak & Kilmann (2003), Sex Roles \u2014 women chose the nice guy over the insensitive one ~8:1, and niceness was the most salient factor for serious-relationship desirability (looks mattered more only for casual/sexual contexts)', url: 'https://link.springer.com/article/10.1023/A:1025894203368' },
        ],
        researchNotes: 'The \'chaos wins\' kernel rests on limited designs \u2014 Carter et al. is a hypothetical-vignette study, and later work argues the Dark Triad\'s pull shrinks once confounded traits like extraversion/confidence are controlled, so a future meta-analysis could weaken that half. Birnbaum\'s null for women applies to initial acquaintanceship only; in established relationships responsiveness strongly predicts attraction, which actually supports the claim\'s own \'safe AND excited\' concession. The claim\'s biggest miss is treating a first-attraction effect as evidence about what women choose, where kindness/stability wins decisively.',
      },
      related: [ { label: 'GD card: Drawn to chaos more than they\u2019ll admit', href: 'gender-dynamics.html#gd-drawn-to-chaos' } ],
    },
    {
      id: 'M-TBD-29',
      category: 'Psychology',
      question: 'Are most men settling out of fear of being alone?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Most guys are terrified of being alone',
      claims: [
        { camp: '',
          text: 'Most guys are flat-out terrified of being alone. They\'ll tolerate disrespect, games, and low effort, and hold far lower standards than you would, just to avoid being single. A lot would rather sit in a shitty situationship or simp for someone who barely respects them than face being single long-term \u2014 and that desperation is exactly what inflates the entitlement on the other side.',
          verdict: 'oversimplified', truth: 55 },
      ],
      ruling: {
        badge: 'Real but overstated',
        text: 'The mechanism checks out: people high on Spielmann\'s Fear of Being Single Scale stay dependent in unsatisfying relationships and warm to less responsive, less attractive partners across seven studies. The sex direction has real support too \u2014 single men are likelier to want a partner (Pew: 61% looking vs 38% of single women) and less happy single (Hoan & MacDonald, ~6,000 singles). But "most guys are terrified" overshoots: 39% of single men \u2014 the complement of Pew\'s 61% \u2014 aren\'t looking at all, and fear-driven settling appears in both sexes.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Spielmann, MacDonald, Maxwell, Joel, Peragine, Muise & Impett (2013), Journal of Personality and Social Psychology \u2014 fear of being single predicts settling for less: staying in unsatisfying relationships, romantic interest in less responsive/less attractive partners, and lower speed-dating selectivity (7 studies)', url: 'https://pubmed.ncbi.nlm.nih.gov/24128187/' },
          { label: 'Pew Research Center (2020), A Profile of Single Americans \u2014 61% of single men vs 38% of single women say they are looking for a relationship or dates; half of all singles are not looking', url: 'https://www.pewresearch.org/social-trends/2020/08/20/a-profile-of-single-americans/' },
          { label: 'Hoan & MacDonald (2024), Social Psychological and Personality Science (via Univ. of Toronto summary) \u2014 pooled ~6,000 singles: single men report lower satisfaction with single life, lower life and sexual satisfaction, and higher desire for a partner than single women', url: 'https://www.psych.utoronto.ca/news/new-study-finds-single-women-are-happier-single-men' },
        ],
        researchNotes: 'Gender differences on the Fear of Being Single construct itself are mixed \u2014 Spielmann\'s own work reports no consistent sex difference and some adaptations find women slightly higher \u2014 so the male-typing rests on partnering-desire and singlehood-satisfaction data, not on fear scores. The claim\'s tail ("desperation inflates entitlement on the other side") is an untested market mechanism with no direct literature. A future meta-analysis of FOBS sex differences could push this toward false (if women score equal or higher) or firm up the male skew. Spielmann et al. (2013) carries a published correction (PubMed 30321050; Study 3 FOBS wording adapted for partnered participants, conclusions unchanged), and "appears in both sexes" rests on the paper\'s mixed-sex samples reporting no consistent gender difference rather than on the abstract.',
      },
      related: [ { label: 'Chart: why singles opt out', href: 'statistics.html#stat-why-single' } ],
    },
    {
      id: 'M-TBD-30',
      category: 'Standards',
      question: 'Does admitting dating inexperience read as a red flag?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Honesty about inexperience gets punished',
      claims: [
        { camp: '',
          text: 'Being honest about a lack of dating or relationship experience often reads as a red flag \u2014 while inventing a past full of situationships or toxic exes would probably earn more respect. People say they want an honest guy with no baggage, but when they actually meet one, they get suspicious or turned off.',
          verdict: 'oversimplified', truth: 65 },
      ],
      ruling: {
        badge: 'Real, but capped',
        text: 'The stigma is real: across three studies of nearly 5,900 adults, sexually inexperienced people were rated less desirable partners \u2014 even by other inexperienced adults \u2014 and desirability rises from zero past partners to a modest few. But the claim overshoots on the fix: heavy histories get punished harder, with willingness to consider a long-term partner dropping sharply as counts climb (d = 0.87 from 4 to 12 partners, replicated across 11 countries). A bit of a past beats a blank slate; a pile of toxic exes beats neither.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Gesselman, Webster & Garcia (2017), Journal of Sex Research \u2014 three studies (~5,900 adults): sexually inexperienced adults are stigmatized and rated less desirable relationship partners, even by other inexperienced adults', url: 'https://pubmed.ncbi.nlm.nih.gov/26983793/' },
          { label: 'Stewart-Williams, Butler & Thomas (2017), Journal of Sex Research \u2014 willingness to get involved rises from zero to a modest number of past partners, then falls dramatically as the history grows (N=188)', url: 'https://pubmed.ncbi.nlm.nih.gov/27805420/' },
          { label: 'Thomas et al. (2025), Scientific Reports \u2014 11-country replication (N=5,331): willingness to consider a long-term partner drops sharply as past partner count climbs (d=0.87 from 4 to 12, d=0.59 from 12 to 36), and histories that accelerate over time rate worse', url: 'https://www.nature.com/articles/s41598-025-12607-1' },
        ],
        researchNotes: 'All direct evidence concerns sexual history, not disclosure of dating or relationship inexperience per se \u2014 no study tests an honest admission against a fabricated past, so the "inventing toxic exes would earn more respect" counterfactual is untested inference, and the card\'s honesty-is-punished framing conflates the trait penalty with a disclosure penalty. The inexperience penalty is also moderated by rater sociosexuality (unrestricted raters punish low counts more; restricted raters punish high counts more). A direct disclosure experiment could push the second half of this claim to false or, less likely, confirmed.',
      },
      related: [ { label: 'Framework: Body Count & Pair-Bonding', href: 'frameworks.html#body-count' } ],
    },
    {
      id: 'M-TBD-31',
      category: 'Market',
      question: 'Did dating apps lock the bottom two-thirds of men out of the market?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Winner-take-most: the dating market\'s "Pareto problem"',
      claims: [
        { camp: 'Male perspective',
          text: 'Dating apps turned mating into a winner-take-most market \u2014 the top sliver of men get a flood of options while the bottom 60\u201370% get filtered out and "locked out" of dating entirely, a Pareto / 80\u201320 distribution.',
          verdict: 'oversimplified', truth: 25 },
        { camp: 'Female perspective',
          text: 'The apps funnel a huge share of women toward the same small tier of top men. Those men get near-unlimited options \u2014 which is exactly why they have so little reason to commit to any one woman. Meanwhile the steadier, average men who would commit get written off as beneath the bar. So you can have a full inbox and still struggle to find a relationship, because you\'re competing with everyone else for the few who are least likely to choose just you.',
          verdict: 'oversimplified', truth: 25 },
      ],
      ruling: {
        badge: 'Skew, not lock-out',
        text: 'The attention skew is real: male Tinder test profiles converted just 0.6% of likes into matches versus 10.5% for female profiles, and messaging follows a long tail \u2014 one New York woman drew 1,504 messages in a month. But "locked out" fails arithmetic: 61% of U.S. men aged 25\u201354 were married or cohabiting in 2019, and Bruch & Newman found daters at every desirability level still send messages and get replies \u2014 typically aiming 25% above their own league. Unequal attention, yes; Pareto exile, no.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Tyson, Perta, Haddadi & Seto (2016), arXiv:1607.01952 \u2014 Tinder field experiment: male test profiles matched on 0.6% of likes vs 10.5% for female profiles; 59% of women like \u226410% of profiles they see', url: 'https://arxiv.org/abs/1607.01952' },
          { label: 'Bruch & Newman (2018), Science Advances \u2014 online-dating desirability study in four U.S. cities: long-tailed message concentration (top NYC woman got 1,504 messages/month), yet users at all desirability levels message ~25% above their league and reply rates to more-desirable partners top out at ~21%', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/' },
          { label: 'Pew Research Center (2021), census analysis \u2014 \'Rising Share of U.S. Adults Are Living Without a Spouse or Partner\': 38% of adults 25\u201354 unpartnered in 2019 (39% of men), i.e. 61% of prime-age men partnered', url: 'https://www.pewresearch.org/social-trends/2021/10/05/rising-share-of-u-s-adults-are-living-without-a-spouse-or-partner/' },
        ],
        researchNotes: 'Both skew studies are platform-specific and non-representative (Tyson: 14 test profiles; Bruch & Newman: one free site, four cities), so exact inequality magnitudes \u2014 including the blog-derived "Gini 0.58" \u2014 should not be quoted as population facts. The viral "75% of men left out" derivation assumes ~80% of men seek casual sex, but Pew 2023 measured 31% of male users citing casual sex as a major reason (verified: https://www.pewresearch.org/internet/2023/02/02/the-who-where-and-why-of-online-dating-in-the-u-s/). Regrade risk: unpartnered prime-age adults did drift up 29%\u219238% (1990\u20132019), so a weaker "the tail got worse" claim has legs \u2014 but Pew\'s Jan 2025 update (verified) shows the unpartnered share ticking down (44%\u219242%, 2019\u20132023), the opposite of an accelerating lock-out. Pew\'s Jan 2025 44%\u219242% figures cover all adults 18+, while the 29%\u219238% series is ages 25\u201354; Pew reports the decline occurred across all age groups. Female-perspective mirror (GD #162): the funneling core is carried by the match-rate and aiming-up data; the \u201cleast likely to commit\u201d tail is untested inference, hence Oversimplified.',
      },
      related: [ { label: 'Chart: the attention skew', href: 'statistics.html#stat-attention' }, { label: 'Framework: The Attention Market', href: 'frameworks.html#attention-market' } ],
    },
    {
      id: 'M-TBD-32',
      category: 'Market',
      question: 'Do most couples meet on dating apps now?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"40% met online" is an average that hides the skew',
      claims: [
        { camp: '',
          text: 'Dating apps are now where most couples meet \u2014 numbers like "40%" or even "half" get thrown around.',
          verdict: 'oversimplified', truth: 25 },
      ],
      ruling: {
        badge: 'Online, not apps',
        text: 'Online is the single biggest channel for newly formed couples \u2014 Rosenfeld\'s nationally representative HCMST data put it at 39% of heterosexual couples who met in 2017, having overtaken meeting through friends around 2013. But "online" bundles apps, sites, and social media, and 39% isn\'t "most." Across all existing couples, Pew (2023 report; survey July 2022, n=6,034) finds just 10% met their partner on a dating site or app \u2014 20% among adults under 30. Biggest single channel: yes. Where most couples meet: no.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Rosenfeld, Thomas & Hausen (2019), PNAS \u2014 39% of heterosexual couples who met in 2017 met online; online eclipsed friends ~2013; apps are a subset of "online"', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6731751/' },
          { label: 'Rosenfeld, Thomas & Hausen (2019), PNAS 116(36) \u2014 PubMed record confirming venue, DOI 10.1073/pnas.1908630116, and the "most popular way couples meet, eclipsing friends around 2013" abstract claim', url: 'https://pubmed.ncbi.nlm.nih.gov/31431531/' },
          { label: 'Pew Research Center (2023), Key findings about online dating in the U.S. \u2014 10% of partnered adults (20% under 30) met their current partner on a dating site or app', url: 'https://www.pewresearch.org/short-reads/2023/02/02/key-findings-about-online-dating-in-the-u-s/' },
        ],
        researchNotes: 'BONUS verified with a caveat: the direct PNAS URL for Rosenfeld, Thomas & Hausen (2019) is https://www.pnas.org/doi/10.1073/pnas.1908630116 \u2014 title and DOI match the PubMed record exactly, but pnas.org returned HTTP 403 to the fetcher this session, so the PMC/PubMed mirrors above are the fetch-verified anchors. Regrade risk: later HCMST waves (2020/2022) reportedly push the online share for NEWLY formed couples above 50%, which would make "half meet online" fair for new couples (still online, not apps) \u2014 I found only secondhand write-ups, no fetchable primary, this session. The 40%-online vs 10%-on-apps gap is partly stock-vs-flow: HCMST measures how recent couples met, Pew measures all current couples.',
      },
      related: [ { label: 'Chart: how couples actually meet', href: 'statistics.html#stat-couples-meet' } ],
    },
    {
      id: 'M-TBD-33',
      category: 'Market',
      question: 'Have situationships become the dominant form of dating?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The situationship economy',
      claims: [
        { camp: '',
          text: 'Situationships have become the dominant form of dating, and the incentives explain why. Women with abundant options often don\'t want to lock down one guy \u2014 they want the benefits of a relationship (attention, emotional support, sex, validation) without the commitment, while keeping their options open in case someone better shows up. Meanwhile a lot of guys are so starved for attention and affection that they\'ll accept those half-assed terms just to have some connection.',
          verdict: 'oversimplified', truth: 25 },
      ],
      ruling: {
        badge: 'Common, not dominant',
        text: 'No. Situationships are genuinely widespread \u2014 a 2024 YouGov poll finds half of 18\u201334-year-olds have ever been in one, and a 2026 college-sample study classified 34% of relationship experiences as situationships \u2014 but committed relationships still outnumbered them in the one sample that measured the mix (65.9% vs 34.1% in the college study). The claim\'s gendered engine also runs backwards: in Pew\'s representative sample, women daters are the ones likelier to want commitment-only (36% vs 22% of men). Common, rising, and worth naming; dominant, no.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Langlais & Davidson (2026), Sexuality & Culture \u2014 34.1% of 468 college relationship experiences were situationships (defined as unlabeled, low-commitment but romantically behaving ties); situationships predicted lower trust than non-situationship (primarily committed) relationships', url: 'https://link.springer.com/article/10.1007/s12119-026-10592-9' },
          { label: 'Pew Research Center (2020), A Profile of Single Americans \u2014 among singles looking to date, 28% want committed-only, 20% casual-only, 53% either; women likelier than men to seek commitment-only (36% vs 22%)', url: 'https://www.pewresearch.org/social-trends/2020/08/20/a-profile-of-single-americans/' },
          { label: 'YouGov (2024), representative US poll (n=1,110) \u2014 39% of US adults and 50% of 18\u201334s have ever been in a situationship', url: 'https://yougov.com/en-us/articles/48492-half-of-18-to-34-aged-americans-have-been-in-a-situationship' },
        ],
        researchNotes: 'The direct situationship literature is young (2024\u20132026, convenience and qualitative samples), and the headline prevalence figures are lifetime "ever been in one," not the current modal form \u2014 so "dominant" fails but the phenomenon is real. Pew\'s committed-vs-casual fieldwork is 2019, predating the situationship boom; a representative time-series of current relationship-type mix could shift the magnitude call. The gendered engine could still operate in a high-desirability submarket without appearing in population averages, but as stated it is contradicted by the representative data.',
      },
      related: [ { label: 'Framework: The Sham Relationship', href: 'frameworks.html#sham-relationship' } ],
    },
    {
      id: 'M-TBD-34',
      category: 'Attraction',
      question: 'What decides a man\'s dating success \u2014 learnable game or fixed looks?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Bluepill hope vs blackpill despair',
      claims: [
        { camp: 'Bluepill',
          text: 'Game, charisma, confidence, and self-improvement could get almost anyone into the running: learn to talk to girls, dress decently, and you can compete.',
          verdict: 'oversimplified', truth: 45 },
        { camp: 'Blackpill',
          text: 'It\'s not about game at all, it\'s about looks, height, jawline, and frame. Many decided the game was rigged before they ever stepped on the field.',
          verdict: 'oversimplified', truth: 55 },
      ],
      ruling: {
        badge: 'Both overshoot',
        text: 'Both poles overshoot. In real speed-dating studies (Asendorpf, Penke & Back 2011, n=382 followed a year; Eastwick & Finkel 2008), physical attractiveness is the single most powerful predictor of being chosen \u2014 so the bluepill\'s "almost anyone can compete on game alone" is too rosy. But for men, women additionally weighted sociosexuality, low shyness, openness, education and income \u2014 controllable factors \u2014 so the blackpill\'s "it\'s not about game at all, the fixed face decides" overshoots too. Looks lead; they don\'t lock the gate.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Asendorpf, Penke & Back (2011), European Journal of Personality \u2014 n=382 community speed-dating sample followed a year; both sexes chose mainly on physical attractiveness, and women additionally weighted men\'s sociosexuality, openness, low shyness, education and income.', url: 'https://www.larspenke.eu/pdfs/Asendorpf_Penke_Back_2011_-_Speed_dating_mating_relating.pdf' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 physical attractiveness predicted romantic interest similarly for both sexes in live speed dating, and pre-stated ideal preferences failed to predict actual desire at the event.', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
        ],
        researchNotes: 'Attractiveness-as-lead-predictor is well-replicated (also Luo & Zhang 2009, J. Personality, and Feingold 1990\'s meta-analysis, both cited within Asendorpf; Wiley copy of Luo & Zhang was paywalled/402 so it is corroboration, not a cited source). Height is a genuine fixed-looks advantage for men (Pawlowski, Dunbar & Lipowicz 2000, cited within Asendorpf), which is why the blackpill isn\'t simply "false" \u2014 but leanness, low shyness, social boldness and status are movable, so the "rigged before you start" fatalism overshoots just as the bluepill\'s "game gets anyone in" ignores that looks are the main driver. Verdict would shift only if a study showed game/confidence actually closing the attractiveness gap in real choices, which current speed-dating data do not.',
      },
      related: [ { label: 'Pill: The Black Pill', href: 'pills.html#page-blk' }, { label: 'Pill: The Blue Pill', href: 'pills.html#page-bp' } ],
    },
    {
      id: 'M-TBD-35',
      category: 'Market',
      question: 'Is there someone out there for everyone?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"There\'s someone out there for everyone" is a comforting lie',
      claims: [
        { camp: '',
          text: 'There\'s someone out there for everyone.',
          verdict: 'false' },
        { camp: 'The blackpill',
          text: 'It\'s not guaranteed for everyone \u2014 therefore it\'s hopeless for me specifically.',
          verdict: 'false' },
      ],
      ruling: {
        badge: 'Both wrong',
        text: 'No. The guarantee is dead on the data: a record 25% of US 40-year-olds had never married by 2021, and Pew projected in 2014 that a quarter of then-young adults would still be unmarried by their mid-40s to mid-50s \u2014 versus 5% for the cohort that hit midlife in 1980. But the blackpill inference dies on the same page: of those still unmarried at 40 in 2001, one in four married by age 60, and 22% of never-married 40-to-44-year-olds were cohabiting (2022). Lifelong aloneness is a real minority outcome \u2014 not a fixed sentence for any individual.',
        tier: 'hard-data',
        sources: [
          { label: 'Pew Research Center (2023), Census/ACS analysis \u2014 record 25% of US 40-year-olds never married in 2021 (vs 20% in 2010); 22% of never-married 40-44s cohabit; of those unmarried at 40 in 2001, about 1 in 4 had married by 60', url: 'https://www.pewresearch.org/short-reads/2023/06/28/a-record-high-share-of-40-year-olds-in-the-us-have-never-been-married/' },
          { label: 'Wang & Parker (2014), Pew Research Center \u2014 \'Record Share of Americans Have Never Married\'; projects 25% of today\'s young adults will never have married by their mid-40s to mid-50s, vs 5% for the cohort that reached midlife around 1980', url: 'https://www.pewresearch.org/social-trends/2014/09/24/record-share-of-americans-have-never-married/' },
          { label: 'Pew Research Center (2025), Census/ACS analysis \u2014 42% of US adults unpartnered (not married or cohabiting) in 2023, but only 29% among ages 40-54; young men more often unpartnered than young women', url: 'https://www.pewresearch.org/short-reads/2025/01/08/share-of-us-adults-living-without-a-romantic-partner-has-ticked-down-in-recent-years/' },
        ],
        researchNotes: 'Never-married is not never-partnered \u2014 cohabitation and non-cohabiting relationships mean the true lifetime-alone base rate is fuzzier (and lower) than the 25% marriage stat, while point-in-time "unpartnered" figures include the divorced and widowed. The card\'s sharper claim that below-average men specifically drive the alone-for-life pool is plausible (marriage gradients by income/education exist) but was not directly verified here; attractiveness-stratified lifetime-partnering data would be the regrade trigger. Both verdicts are robust to that: the universal guarantee and the individual-hopelessness inference each contradict the same Census/ACS numbers.',
      },
      related: [ { label: 'Pill: The Blue Pill (someone for everyone)', href: 'pills.html#page-bp' }, { label: 'Chart: never married by 40', href: 'statistics.html#stat-never-married' } ],
    },
    {
      id: 'M-TBD-36',
      category: 'Signals',
      question: 'Do women initiate more than either side realizes?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'You signal it \u2014 you just don\'t shoot',
      claims: [
        { camp: '',
          text: 'When you\'re interested, it tends to leak out indirectly rather than as an explicit move: lingering nearby, remembering small details, laughing harder than the joke earned, finding little reasons to talk to him, going quiet or flustered when he\'s around. Field studies of courtship found women actually initiate most encounters through exactly these covert nonverbal signals \u2014 and that men often don\'t consciously register that she signaled first (Moore, 1985).',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Holds up',
        text: 'Well supported. Moore\'s field observations catalogued 52 nonverbal solicitation cues \u2014 glancing, primping, leaning in \u2014 and found the women who signaled most were the ones most often approached, a signal typically eliciting a male approach within about 15 seconds (confirmed by Wade 2018). So the woman\'s covert signal usually initiates the encounter the man then experiences as his own move. The one caveat is magnitude: \u201cmost encounters\u201d is directionally right but not a settled share, and men\'s unawareness is inferred more than measured.',
        tier: 'evidence',
        sources: [
          { label: 'Moore (1985), Ethology and Sociobiology 6(4):237\u2013247 \u2014 catalogued 52 female nonverbal solicitation behaviors; women who signaled more were approached more, signals eliciting a male approach within ~15s', url: 'https://doi.org/10.1016/0162-3095(85)90016-0' },
          { label: 'Wade (2018), Perspectives on Behavior Science \u2014 confirms Moore\'s finding that specific female nonverbal signals correlate with a male approaching within 15 seconds', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6701824/' },
        ],
        researchNotes: 'Fable-graded 2026-07-06. Held back on the first pass because the 52-count and signaling\u2192approach findings were then uncited; both are now confirmed \u2014 Moore (1985) catalogued 52 solicitation behaviors and found \u201cwomen who signaled often were also those who were most often approached by a man\u201d (verified via the ScienceDirect abstract + multiple secondary sources; the doi.org link 403s automated fetchers but resolves in-browser, per the M-TBD-5 PNAS precedent). Dropped from the earlier draft: Perper\'s ~two-thirds first-move figure and de Weerth & Kalma\'s \u201cboth sexes unaware\u201d finding \u2014 neither could be fetch-verified this session, so the ruling no longer rests on them (hence the hedge on \u201cmost encounters\u201d and men\'s unawareness).',
      },
      related: [ { label: 'Chart: who sends the first message', href: 'statistics.html#stat-first-message' }, { label: 'Ruling M-TBD-62: when she moves first', href: 'mythbuster.html#M-TBD-62' } ],
    },
    {
      id: 'M-TBD-37',
      category: 'Attraction',
      question: 'Is the looks filter male-only, or do both sexes run it?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Looks are the first filter \u2014 for both sexes',
      claims: [
        { camp: '',
          text: 'Physical attraction is the first filter for both sexes \u2014 not just men. If she\'s not attractive enough, most men feel no desire; if he\'s not attractive enough, most women feel none either. The real difference isn\'t the mechanism, it\'s the honesty about it. Everything else \u2014 personality, confidence, game \u2014 only gets weighed once that first physical filter is passed.',
          verdict: 'oversimplified', truth: 75 },
      ],
      ruling: {
        badge: 'Mostly holds up',
        text: 'In live interactions, physical attractiveness predicts romantic interest at r \u2248 .40 for both sexes \u2014 the sex difference is .03 and nonsignificant across a 97-study meta-analysis \u2014 and in a speed-dating study it was the single strongest predictor for men and women alike. The stated-preference gap is real, but behavioral parity wins: both sexes run the filter. Two trims: attractiveness is the dominant weight, not a literal pass-first gate; and "honesty" is the wrong word \u2014 stated ideals fail to predict live desire for either sex, so it\'s poor self-insight, not packaging.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 97-study meta-analysis: physical attractiveness predicts romantic evaluations at r \u2248 .40 for both sexes; sex difference r = .03, uniformly nonsignificant', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 stated ideals show the classic sex gap, but at a live speed-dating event there were no sex differences in how partners\' attractiveness drove romantic interest, and pre-event ideals failed to predict in-event desire', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Luo & Zhang (2009), Journal of Personality \u2014 speed-dating study: partners\' physical attractiveness was the strongest predictor of attraction for both sexes; no support for personality similarity', url: 'https://pubmed.ncbi.nlm.nih.gov/19558447/' },
        ],
        researchNotes: 'The strict gate wording ("everything else only gets weighed once the filter is passed") is stronger than the data, which show dominant weighting rather than a literal lexicographic screen; Luo & Zhang also found partner characteristics predicted men\'s attraction better than women\'s, so the symmetry isn\'t perfect. The card\'s "honesty" framing is the main regrade risk: Eastwick & Finkel read the stated/revealed gap as poor introspective access in both sexes, not deliberate female dressing-up \u2014 the mechanism parity is hard data, the motive attribution is not.',
      },
      related: [ { label: 'Pill: The Face Pill', href: 'pills.html#face-pill' }, { label: 'Calc: The Face Calculator', href: 'face.html' } ],
    },
    {
      id: 'M-TBD-38',
      category: 'Standards',
      question: 'Do stated standards survive when someone desirable actually shows up?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Principles are cheap when untested',
      claims: [
        { camp: 'Both sides',
          text: 'The standards that genuinely hold when an attractive, in-demand person actually shows interest are far fewer than the ones stated when nobody desirable is around. For a lot of people those principles quietly evaporate the moment someone they really want \u2014 someone with options \u2014 is the one pursuing them. It runs both ways: women who swear off "fuckboys" until the hot one with options wants them, men who insist they\'re "not shallow" until a 10 shows interest.',
          verdict: 'confirmed' },
        { camp: 'Female perspective',
          text: 'It\'s easy to say "I\'d never date a fuckboy" or "a high body count is a turn-off" \u2014 in the abstract, with nobody desirable in front of you. The real test is what happens when an attractive, in-demand guy with options actually shows interest, and for a lot of women the stated standard quietly evaporates right at that moment.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Holds up',
        text: 'Mostly, no. Ideals govern the abstraction, not the person: when traits were experimentally matched to people\'s stated ideals, matching drove romantic interest in written profiles \u2014 and the effect vanished after a live interaction, because people reinterpret traits to fit whoever is in front of them. Across a 97-study meta-analysis, a partner\'s physical attractiveness predicted romantic evaluations at roughly r = .40 for both sexes, while stated priorities failed to forecast live speed-dating desire. It runs both ways, as claimed: stated standards are the brochure; live desire is the purchase.',
        tier: 'hard-data',
        sources: [
          { label: 'Eastwick, Finkel & Eagly (2011), Journal of Personality and Social Psychology \u2014 ideal-matching boosts romantic interest in written profiles but the effect disappears after a live interaction; people reinterpret traits to fit the actual person', url: 'https://pubmed.ncbi.nlm.nih.gov/21707198/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 97-study meta-analysis: partner attractiveness predicts romantic evaluations at r \u2248 .40 for both sexes; framework centers the live-vs-hypothetical gap in preference-matching validity', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 stated ideal preferences failed to predict actual desire at a speed-dating event; no sex differences in live romantic interest', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
        ],
        researchNotes: 'Ideals aren\'t empty: Gerlach et al. 2019 (JPSP, PMID 28921999, verified this session) found stated preferences prospectively predicted later partners\' traits in a naturalistic sample \u2014 standards shape who you orbit; they bend on contact, and people also revised ideals downward to fit partners who fell short. Caveat/regrade risk: this literature tests trait ideals broadly, not moral deal-breakers (e.g., body count) under active pursuit by a high-option suitor \u2014 direct evidence that deal-breakers specifically hold or collapse live could shift the verdict toward oversimplified. Female-perspective mirror (GD #137) grades Confirmed \u2014 same claim, honest \u201con everyone\u201d scope, fully carried by the ideal-matching evidence.',
      },
      related: [ { label: 'Ruling M-TBD-16: "honest guy" branding', href: 'mythbuster.html#M-TBD-16' }, { label: 'Ruling M-TBD-57: the bar is selective', href: 'mythbuster.html#M-TBD-57' } ],
    },
    {
      id: 'M-TBD-39',
      category: 'Market',
      question: 'Do both sexes reduce each other \u2014 to a body and a wallet?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'She feels like a body; he feels like a wallet',
      claims: [
        { camp: '',
          text: 'A lot of men treat women like sex objects \u2014 interested only until it\'s clear sex isn\'t happening easily, then gone. A lot of women treat men like walking wallets \u2014 interested only until it\'s clear he can\'t provide the money, status, or lifestyle, then gone. Both sides end up feeling valued for what they can supply \u2014 a body, a paycheck \u2014 rather than for who they are.',
          verdict: 'oversimplified', truth: 55 },
      ],
      ruling: {
        badge: 'Real but lopsided',
        text: 'Both currencies are documented. Across 45 countries (N=14,399), women rate financial prospects higher and men rate looks and youth higher in stated preferences \u2014 and a 1990 personal-ads study was literally titled "men as success objects and women as sex objects." But the mirror is lopsided: in live speed-dating, both sexes\' actual desire tracked looks about equally, and earning prospects only weakly \u2014 for both alike. The body screen operates in real-time behavior for everyone; the wallet screen\'s sex skew lives in stated standards and long-term provider expectations, not instant verdicts.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Walter, Conroy-Beam, Buss et al. (2020), Psychological Science \u2014 45-country replication (N=14,399): women rate financial prospects in a mate higher than men do, men rate physical attractiveness and youth higher', url: 'https://labs.la.utexas.edu/buss/files/2020/03/Sex-Differences-in-Mate-Preferences-Across-45-Nations-2020.pdf' },
          { label: 'Davis (1990), Sex Roles \u2014 328 newspaper personal ads: men emphasized seeking physical characteristics, women emphasized employment, financial and intellectual status (\'men as success objects, women as sex objects\')', url: 'https://link.springer.com/article/10.1007/BF00289878' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 speed-dating: stated sex differences (looks vs earning prospects) failed to predict live romantic interest; no sex differences in how partners\' attractiveness or earning prospects drove actual desire', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): physical attractiveness predicted romantic evaluations at r\u2248.40 and earning prospects at r\u2248.10 for both sexes; sex differences nonsignificant', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
        ],
        researchNotes: 'Killewald (2016, American Sociological Review) corroborates the provider half downstream: in post-1975 marriages, husbands not employed full-time faced higher divorce risk while wives\' employment and couples\' finances predicted nothing \u2014 a gendered-expectations effect, not literal wallet-mining (verified only via the ScienceDaily/ASA press summary; the journal and Harvard pages returned 403, so it is not cited). Regrade risks: speed-dating samples are young and income-compressed, which can understate real-world wallet-screening; conversely, the "gone once sex is off the table" male pattern rests more on stated hookup motives than on direct behavioral tests.',
      },
      related: [ { label: 'Framework: The Status Trade', href: 'frameworks.html#status-trade' }, { label: 'Chart: the provider norm is halving', href: 'statistics.html#stat-provider-norm' } ],
    },
    {
      id: 'M-TBD-40',
      category: 'Signals',
      question: 'Do men and women reject differently \u2014 cushioned versus blunt?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Soft truth vs blunt truth',
      claims: [
        { camp: '',
          text: 'Rejection tends to come in two flavors, split loosely along sex lines. Women more often get \u2014 and give \u2014 the cushioned version: "I\'m busy," "I\'m not ready," a slow fade, anything that dodges a hard no. Men, leaning more direct, are likelier to deliver the unvarnished version, sometimes brutally ("I\'m just not attracted to you").',
          verdict: 'oversimplified', truth: 30 },
      ],
      ruling: {
        badge: 'Lens, not law',
        text: 'Only loosely. Indirect, face-saving rejection is common for both sexes, and the documented driver is safety, not rejector sex. Women report roughly twice men\'s worry about the repercussions of saying no \u2014 being hit, followed, touched (n=465) \u2014 and salient safety concerns push rejectors toward ghosting. But in a 414-person registered report, male and female rejectors responded alike (no significant gender interaction), and meta-analytic sex differences in assertive speech are negligible (d=.09). The "men reject brutally" half has no direct evidence. A lens, not a law.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Freedman, Hales, Powell, Le & Williams (2022), Journal of Experimental Social Psychology \u2014 registered report: safety concerns raise ghosting (indirect-rejection) intentions; pilot leaned toward more ghosting of male targets, but the main study (analytic n=414 of 526 targeted) found no significant rejector-gender differences', url: 'https://gilifreedman.com/GenderSafetyGhosting.pdf' },
          { label: 'Moran & Burch (2023), International Journal of Sexual Health \u2014 n=465; women\'s worry about repercussions of rejecting an advance was double men\'s (36.8 vs 18.1), with far higher fear of being hit, followed, or touched, and more avoidance/safety-focused rejection strategies', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10830141/' },
          { label: 'Leaper & Ayres (2007), Personality and Social Psychology Review \u2014 meta-analysis of adult language use: sex differences in assertive (d=.09, men) and affiliative (d=.12, women) speech are statistically significant but negligible', url: 'https://pubmed.ncbi.nlm.nih.gov/18453467/' },
        ],
        researchNotes: 'No study directly measures whether men deliver verbally harsher romantic rejections \u2014 that half of the claim rests on anecdote, and Freedman\'s ns trend (p=.058) plus women\'s clearly documented safety fears mean a larger study could still surface a modest rejector-sex difference (regrade risk toward a weak confirm). Freedman\'s main sample was bisexual US adults, limiting generalization; ghosting-prevalence studies report mixed or null gender differences. The site\'s own source card already hedges the claim as a lens, which this ruling formalizes.',
      },
      related: [ { label: 'Chart: where the safety risk concentrates', href: 'statistics.html#stat-safety' } ],
    },
    {
      id: 'M-TBD-41',
      category: 'Standards',
      question: 'Does dating for potential pay off?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Dating for potential" is half-true',
      claims: [
        { camp: '',
          text: 'I date for potential.',
          verdict: 'oversimplified', truth: 40 },
      ],
      ruling: {
        badge: 'Half-true',
        text: 'Half of this line is bankable: in Buss\'s 37-culture data (N=10,047) and the 45-country 2020 replication (N=14,399), women rate a partner\'s financial prospects higher than men do (both datasets), and ambition too (Buss 1989) \u2014 trajectory genuinely counts on paper. The other half isn\'t: in live speed-dating, stated preferences for earning prospects failed to predict whom people actually desired. Visible momentum gets credited; unrealized potential mostly doesn\'t. "Dating for potential" describes questionnaires better than choices \u2014 a demonstrated trajectory beats a promised one.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Buss (1989), Behavioral and Brain Sciences \u2014 37 cultures, N=10,047: women value earning capacity and ambition\u2013industriousness in mates more than men do', url: 'https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/sex-differences-in-human-mate-preferences-evolutionary-hypotheses-tested-in-37-cultures/0E112ACEB2E7BC877805E3AC11ABC889' },
          { label: 'Walter, Conroy-Beam, Buss et al. (2020), Psychological Science \u2014 45-country replication (N=14,399): women, more than men, prefer mates with good financial prospects', url: 'https://pubmed.ncbi.nlm.nih.gov/32196435/' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 stated preferences for earning prospects failed to predict live romantic interest in speed-dating', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
        ],
        researchNotes: 'The disconfirming half rests mainly on Eastwick & Finkel 2008 \u2014 a single US speed-dating sample measuring initial attraction, not long-term commitment decisions, where resource/trajectory considerations plausibly matter more; a longitudinal study tying partner ambition to actual pairing or marriage outcomes could push this toward confirmed for long-term contexts. No direct literature was found on the card\'s specific "patience with unrealized potential over the years" mechanism \u2014 that part remains inference, not measured evidence.',
      },
      related: [ { label: 'Calc: The SMV Calculator', href: 'smvcalc.html' }, { label: 'Chart: the provider norm is halving', href: 'statistics.html#stat-provider-norm' } ],
    },
    {
      id: 'M-TBD-42',
      category: 'Market',
      question: 'Is "there are no good men left" a report on this era?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Same complaint, new villain every generation',
      claims: [
        { camp: '',
          text: '"There are no good men left" lands like a verdict on this exact moment \u2014 but it\'s a rerun that\'s been playing for a century. The 1920s had "men don\'t know how to court anymore." The 70s had "men are threatened by independent women." The 2000s had "where have all the good men gone." After 2017 it was "men are trash." The complaint itself never changes; only the villain gets a fresh costume each generation.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Century-old rerun',
        text: 'Mostly no \u2014 it\'s a genre. A 1918 letter in The Hospital was already headlined "The Shortage of Husbands"; historians document Americans declaring a national marriage crisis "again and again" across the twentieth century; by 2003 the complaint was a book title (Why There Are No Good Men Left). The rerun is real. One caveat keeps it honest: reruns aren\'t always noise \u2014 Lichter et al. (2020) find unmarried women\'s would-be husbands out-earn actually available single men by about 58%, so today\'s version does track a measurable mismatch.',
        tier: 'evidence',
        sources: [
          { label: 'Walker (1918), The Hospital \u2014 letter headlined \'The Shortage of Husbands\', proof the complaint is at least a century old', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5233321/' },
          { label: 'Fernandez (2019), Jotwell: Legal History \u2014 review of Kuby, Conjugal Misconduct (2018), documenting recurring \'national marriage crisis\' panics across the twentieth century', url: 'https://legalhist.jotwell.com/the-marriage-crisis-and-its-many-backlashes-in-twentieth-century-america/' },
          { label: 'Lichter, Price & Swigert (2020), Journal of Marriage and Family \u2014 \'synthetic husbands\' out-earn actually available unmarried men by ~58% (90% vs 70% employed; 30% vs 25% college)', url: 'https://doi.org/10.1111/jomf.12603' },
          { label: 'Whitehead (2003), Why There Are No Good Men Left: The Romantic Plight of the New Single Woman \u2014 publisher\'s page confirming title, author, and 2003 publication', url: 'https://www.penguinrandomhouse.com/books/189752/why-there-are-no-good-men-left-by-barbara-dafoe-whitehead/' },
        ],
        researchNotes: 'The claim\'s decade-by-decade wordings are loose paraphrases: the verified anchors are 1918 (husband-shortage letter), early-1900s\u20131930s marriage-crisis panics (Kuby via Jotwell), and 2003 (Whitehead\'s "Why There Are No Good Men Left" \u2014 Penguin Random House page fetched this session); I did not verify era primaries for the specific 1920s "can\'t court" and 1970s "threatened by independent women" phrasings, nor a scholarly primary for post-2017 "men are trash." Regrade risk: if the claim is read as "therefore nothing real ever changed," Lichter et al. 2020 (and the genuine post-WWI male deficit behind the 1918 instance) cut against it \u2014 some reruns tracked real market shifts, which is why the caveat sits in the ruling text.',
      },
      related: [ { label: 'Essay: Relationships Throughout History', href: 'dd-relationships-throughout-history.html' } ],
    },
    {
      id: 'M-TBD-43',
      category: 'Market',
      question: 'Where do the couples who actually marry meet?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'How couples actually meet: college and lucky accidents',
      claims: [
        { camp: '',
          text: 'Ask how the actual married couples you know got together and a pattern shows up fast. A big chunk met in college. The rest mostly met through some version of a lucky accident. Most people who end up married weren\'t social butterflies running elaborate game with tons of dating reps. They got dropped into a high-contact environment, or got lucky once and didn\'t fumble it.',
          verdict: 'oversimplified', truth: 30 },
      ],
      ruling: {
        badge: 'Apps, not college',
        text: 'In the nationally representative HCMST surveys, "met in college" was never a big chunk \u2014 about 9% of heterosexual couples at its 1995 peak, 4% by 2017. Among 19,131 Americans married 2005\u20132012, all school combined was 11% of the couples who met offline \u2014 roughly 7% of all marriages. The claim\'s core survives: most spouses met through repeated-contact channels \u2014 friends (33% in 1995, 20% by 2017), work, school, bars \u2014 not elaborate game. But the biggest channel is now deliberate search, not luck: meeting online reached ~39% of couples by 2017, and over a third of recent marriages began online.',
        tier: 'hard-data',
        truth: 90,
        sources: [
          { label: 'Rosenfeld, Thomas & Hausen (2019), PNAS \u2014 HCMST 2009+2017 (N=5,421 heterosexual couples): met in college 9%\u21924% (1995\u20132017); online 2%\u219239%, overtaking friends (33%\u219220%) around 2013', url: 'https://pubmed.ncbi.nlm.nih.gov/31431531/' },
          { label: 'Rosenfeld, Thomas & Hausen (2019) author manuscript, Stanford \u2014 full text carrying Table 1\'s venue percentages, incl. the college 9%\u21924% figures', url: 'https://web.stanford.edu/~mrosenfe/Rosenfeld_et_al_Disintermediating_Friends.pdf' },
          { label: 'Cacioppo, Cacioppo, Gonzaga, Ogburn & VanderWeele (2013), PNAS \u2014 19,131 Americans married 2005\u20132012: >1/3 of marriages began online; offline venues led by work (21.7%) and friends (19.1%), all school 11.0% \u2014 shares among offline-met couples', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3690854/' },
        ],
        researchNotes: 'BONUS verified: doi.org/10.1073/pnas.1908630116 302-redirects to https://pnas.org/doi/full/10.1073/pnas.1908630116 (i.e. the canonical page https://www.pnas.org/doi/10.1073/pnas.1908630116 is real), but pnas.org itself returns HTTP 403 to automated fetches \u2014 use the DOI or PubMed link for the site\'s pending empty-url source. Caveat: HCMST counts all couples, but the paper\'s footnote 1 says results are unchanged when restricted to married couples, and Cacioppo 2013 is marriages-only, so the ruling holds for "couples who actually marry." Regrade risk: among college graduates specifically the met-in-college share is much higher (the widely quoted ~28% same-school figure traces to a non-citable Facebook Data Science blog post) \u2014 a peer-reviewed grads-only analysis could soften "never a big chunk" for degree-holding social circles, which is plausibly the friend group the card is describing.',
      },
      related: [ { label: 'Chart: how couples actually meet', href: 'statistics.html#stat-couples-meet' }, { label: 'Essay: Third Spaces (the Great Emptying)', href: 'dd-third-spaces.html#great-emptying' } ],
    },

    /* ── Gender Dynamics borderline ports (2026-07-06, second wave) ──
     * The 29 borderline cards, ported on Jason's direction: 19 primaries below
     * (7 carrying their Female-lens pair-mirror as a converging claim), the other
     * 10 merged into existing entries (see ledger). Claims are the cards' own
     * words (span-verified); rulings graded via the agent research loop with
     * fetch-verified sources. related links: retargeted 2026-07-07 from the
     * original blanket Gender Dynamics homage to each entry's most pertinent
     * specific target (pill / framework / chart / essay / GD card / sibling
     * ruling) — GD is now cited sparingly, and only card-specific. */
    {
      id: 'M-TBD-44',
      category: 'Market',
      question: 'Are men the offer and women the choosers by default?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Men as the offer',
      sourceCardFem: 'Women as the choosers',
      claims: [
        { camp: 'Male perspective',
          text: 'In the default market state, the man usually carries the burden of making interest legible. He approaches, risks rejection, creates momentum, and presents a reason to be chosen. This does not mean men have no standards. It means men often have to generate access before they can exercise those standards.',
          verdict: 'confirmed' },
        { camp: 'Female perspective',
          text: 'In the default market state, women usually receive more initial romantic attention and therefore perform more early-stage filtering. This creates chooser leverage, but also a burden: attention is not the same as commitment, and abundance can make signal quality harder to read.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Default, not destiny',
        text: 'The default is real. In Kreager et al.\'s dating-site data (8,259 men, 6,274 women), women were four times less likely to send a first message, and on Tinder men\'s likes convert to matches at roughly 0.6% versus 10.5% for women \u2014 men ask, women filter. But \'default\' is the load-bearing word: in a 350-person speed-dating experiment, the women-are-choosier selectivity gap disappeared when women did the rotating. Both roles are real; both are norm-assigned structure, not nature.',
        tier: 'evidence',
        sources: [
          { label: 'Kreager, Cavanagh, Yen & Yu (2014), Journal of Marriage and Family \u2014 dating-site data (8,259 men / 6,274 women): women 4x less likely to send first messages; female-initiated contacts over twice as likely to connect', url: 'https://pubmed.ncbi.nlm.nih.gov/24910472/' },
          { label: 'Tyson, Perta, Haddadi & Seto (2016), arXiv preprint (ASONAM) \u2014 Tinder field experiment: male like-to-match rate ~0.6% vs ~10.5% for women; men mass-like, women filter', url: 'https://arxiv.org/abs/1607.01952' },
          { label: 'Finkel & Eastwick (2009), Psychological Science \u2014 350 speed-daters: when women rotated (approached), the men-less-selective sex difference disappeared; mediated by rotator self-confidence', url: 'https://pubmed.ncbi.nlm.nih.gov/19754525/' },
        ],
        researchNotes: 'Kreager also found women who do initiate connect with more desirable partners, so the chooser role is partly self-reinforcing choice rather than pure imposition. Bruch & Newman (2018) independently corroborate the attention asymmetry at scale. Tier held at evidence: converging but each dataset is non-representative (one city; one Tinder experiment); main regrade risk is women-first app designs eroding the default.',
      },
      related: [ { label: 'Framework: The Attention Market', href: 'frameworks.html#attention-market' }, { label: 'Chart: who sends the first message', href: 'statistics.html#stat-first-message' } ],
    },
    {
      id: 'M-TBD-45',
      category: 'Dating',
      question: 'Is the early-dating workload as one-sided as men feel it is?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'He performs, she judges',
      claims: [
        { camp: '',
          text: 'The work is wildly one-sided. He\'s expected to lead, start the conversation, keep it entertaining, escalate at the right moments, read every signal correctly, and calibrate in real time to her energy \u2014 while she can largely just sit back, exist, and react. If the vibe dies, it\'s almost always chalked up as his failure. Do everything right and he might get rewarded with a date; slip up anywhere along the way and he\'s out. It genuinely feels like auditioning while she plays judge.',
          verdict: 'oversimplified', truth: 55 },
      ],
      ruling: {
        badge: 'Half the ledger',
        text: 'The overt burden is real: in Kreager et al.\'s six-month dating-site dataset, women were four times less likely to send a first message \u2014 the visible asking falls on men. But \'she can largely just sit back\' fails direct observation: Moore\'s naturalistic courtship research, confirmed in Wade\'s 2018 review, found women\'s nonverbal solicitation signals reliably preceded a male approach within 15 seconds. Her early-stage work is covert signaling and filtering \u2014 invisible, not absent. Real asymmetry in visible effort; \'wildly one-sided\' overdraws the ledger.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Kreager, Cavanagh, Yen & Yu (2014), Journal of Marriage and Family \u2014 online dating data: women 4x less likely to initiate messages than men', url: 'https://pubmed.ncbi.nlm.nih.gov/24910472/' },
          { label: 'Wade (2018), Perspectives on Behavior Science \u2014 review confirming Moore\'s (1985) naturalistic finding: female nonverbal courtship signals were followed by a male approach within 15 seconds', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6701824/' },
        ],
        researchNotes: 'No study totals the full early-dating effort ledger (leading conversation vs grooming, planning, safety work), so the magnitude \'wildly one-sided\' is a feeling, not a measured quantity \u2014 graded on the testable halves. Finkel & Eastwick (2009, PubMed 19754525, fetch-verified this session) further show the approach/audition seat itself, whichever sex holds it, lowers selectivity and raises confidence \u2014 the role is norm-assigned. The vibe-dies-it\'s-his-fault attribution claim is unmeasured either way.',
      },
      related: [ { label: 'Chart: who sends the first message', href: 'statistics.html#stat-first-message' }, { label: 'Ruling M-TBD-36: her covert workload', href: 'mythbuster.html#M-TBD-36' } ],
    },
    {
      id: 'M-TBD-46',
      category: 'Psychology',
      question: 'Does attraction override women\'s better judgment?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Instincts override logic',
      sourceCardFem: 'Your feelings can override your better judgment',
      claims: [
        { camp: 'Male perspective',
          text: 'A lot of women aren\'t smarter than their instincts. They like to think they are, but when an attractive guy with good game shows up, emotion and attraction override the brain. On some level they know the smooth player probably isn\'t good for them \u2014 and they choose him anyway, over and over. Logic loses to feelings almost every time.',
          verdict: 'oversimplified', truth: 30 },
        { camp: 'Female perspective',
          text: 'When a man you\'re genuinely attracted to shows up, emotion and chemistry can steamroll everything your rational mind already knows. On some level you might know he\'s not good for you \u2014 and choose him anyway, more than once. That\'s not stupidity; logic loses to feelings for almost everyone.',
          verdict: 'confirmed', truth: 70 },
      ],
      ruling: {
        badge: 'True of everyone',
        text: 'Attraction genuinely bypasses the deliberating brain \u2014 in everyone. Stated ideals fail to predict who actually sparks desire in live speed dating (Eastwick & Finkel, 2008), and across a 97-study meta-analysis looks predict romantic evaluations at r\u2248.40 for both sexes, with sex differences nonsignificant. The cleanest override evidence is on men: Ariely & Loewenstein\'s aroused male subjects endorsed acts their cool-state selves rejected, and couldn\'t predict the shift. The mechanism is human wiring; casting it as a female defect is the part that fails.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 speed dating: ideal preferences failed to predict actual romantic desire; no sex differences in what predicted live attraction', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): physical attractiveness predicts romantic evaluations r\u2248.40 for both sexes; sex differences \u2248.03, uniformly nonsignificant', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
          { label: 'Ariely & Loewenstein (2006), Journal of Behavioral Decision Making \u2014 sexual arousal strongly shifted male students\' judgments (appeal, morally questionable behavior, unsafe sex) and they failed to predict these shifts', url: 'https://scholars.duke.edu/display/pub861349' },
        ],
        researchNotes: 'None of these studies test the \'chooses the known player over and over\' narrative specifically \u2014 they establish ideal-behavior dissociation and arousal override, not repeated self-harming partner choice. Ariely & Loewenstein sampled male students only, which is precisely why the sex-typed framing fails; a female-arousal replication would strengthen the symmetry point further.',
      },
      related: [ { label: 'Ruling M-TBD-38: ideals vs the person in front of you', href: 'mythbuster.html#M-TBD-38' } ],
    },
    {
      id: 'M-TBD-47',
      category: 'Psychology',
      question: 'Is women\'s dating advice to men designed to help them succeed?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Female dating advice protects her image, not your success',
      claims: [
        { camp: '',
          text: 'Most of it isn\'t designed to help you succeed \u2014 it\'s designed to make the speaker sound socially acceptable and virtuous. "Just be yourself, looks don\'t matter, treat her like a human, the right girl will come along" \u2014 these are the nice, comfortable, group-approved answers. Saying the uncomfortable truth \u2014 that looks and status matter a lot, that standards are sky-high, that a nice average guy often isn\'t enough \u2014 would make her look shallow in front of other women.',
          verdict: 'oversimplified', truth: 35 },
      ],
      ruling: {
        badge: 'Bad advice, unproven motive',
        text: 'The advice itself really is unreliable: \'looks don\'t matter\' fails the revealed-preference test \u2014 attractiveness predicts romantic desire at r\u2248.40 for both sexes across 97 studies, and stated ideals don\'t predict whom people actually want. Social pressure also measurably bends self-reports in this domain: under a bogus lie detector, sex differences in reported sexuality collapsed. But \'designed to protect her image\' asserts a motive no study tests \u2014 men\'s stated ideals fail identically, so honest introspective blindness explains the same data without any performance.',
        tier: 'evidence',
        truth: 70,
        sources: [
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): attractiveness predicts romantic evaluations r\u2248.40 for both sexes, contradicting \'looks don\'t matter\' as behavioral description', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 stated ideal preferences failed to predict actual desire for both sexes, showing poor introspective access rather than sex-specific deception', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Alexander & Fisher (2003), Journal of Sex Research \u2014 bogus-pipeline experiment: sex differences in self-reported sexuality negligible under lie detector, moderate when anonymous, greatest under exposure threat', url: 'https://pubmed.ncbi.nlm.nih.gov/12806529/' },
        ],
        researchNotes: 'The motive clause (\'designed to\' protect image) is unfalsifiable with current evidence, so the ruling grades the testable content: advice accuracy and social-desirability pressure. Alexander & Fisher tests self-reports about one\'s own sexuality, not advice-giving to men \u2014 adjacent, flagged as such, not stretched into proof of strategic advice. Direct audience-manipulation studies of dating advice would force a regrade in either direction.',
      },
      related: [ { label: 'Pill: The Blue Pill ("just be yourself")', href: 'pills.html#page-bp' } ],
    },
    {
      id: 'M-TBD-48',
      category: 'Psychology',
      question: 'Do men take blunt feedback about their own shortcomings better than women?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Men accept harsh truths more readily',
      claims: [
        { camp: '',
          text: 'If a guy is fat, broke, or going nowhere, his friends just tell him: hit the gym, get your money up, fix your life. No sugarcoating. Men are generally more willing to accept blunt feedback about themselves and act on it \u2014 which is why you don\'t see guys demanding to be found attractive exactly as they are.',
          verdict: 'backwards' },
      ],
      ruling: {
        badge: 'Other way around',
        text: 'The one directly relevant review points the other way. Roberts (1991, Psychological Bulletin) found women\'s self-assessments track evaluative feedback more than men\'s, and women rate others\' evaluations as more accurate \u2014 men tend to discount evaluations as uninformative, approaching such settings competitively and self-confidently. Taking criticism seriously enough to update is \'accepting and acting on it,\' and in lab studies that is the female pattern. The kernel \u2014 bluntness dents women\'s self-views more \u2014 reflects believing the feedback, not refusing it.',
        tier: 'evidence',
        sources: [
          { label: 'Roberts (1991), Psychological Bulletin \u2014 review: women\'s self-assessments are more responsive to evaluative feedback; men deny the informational value of others\' evaluations', url: 'https://pubmed.ncbi.nlm.nih.gov/2034753/' },
        ],
        researchNotes: 'Roberts reviews achievement-feedback lab studies, not friend-to-friend lifestyle advice, and the claim\'s premise that male friendship norms are blunter is untested either way. Yarnell et al.\'s (2015, Self and Identity) meta-analysis reportedly finds men slightly higher in self-compassion (d\u2248.18), a small kernel for the \'men shrug it off\' half, but its journal page 403\'d this session so it is uncited. The direct literature is old and thin \u2014 a modern feedback-receptivity meta could force a regrade.',
      },
      related: [ { label: 'Ruling M-TBD-51: nobody gives honest feedback', href: 'mythbuster.html#M-TBD-51' } ],
    },
    {
      id: 'M-TBD-49',
      category: 'Market',
      question: 'Without game, do only wealth or exceptional looks keep a man in the running?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The honest guy\'s bind: get rich or get hot',
      claims: [
        { camp: '',
          text: 'The blunt reality is that there are really only two wildcards that override the need for game: getting very rich, or becoming extremely physically attractive. With one of those, you can skip the game; without either, it\'s genuinely hard out there for the honest, humble guy.',
          verdict: 'oversimplified', truth: 30 },
      ],
      ruling: {
        badge: 'Wrong two wildcards',
        text: 'Trade-off studies miscast the two \'wildcards.\' In Li et al.\'s (2002) budget paradigm, kindness and intelligence were necessities for both sexes \u2014 women prioritized status/resources and men looks alongside those basics, not instead of them. And in live attraction, the Eastwick et al. (2014) meta (k=97) puts physical attractiveness at r\u2248.40 but earning prospects at only r\u2248.10 for both sexes. Exceptional looks genuinely are a wildcard; wealth is a screening threshold, not an override; and the kind, smart honest guy holds necessity cards this claim zeroes out.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Li, Bailey, Kenrick & Linsenmeier (2002), Journal of Personality and Social Psychology \u2014 budget studies: kindness and intelligence are necessities for both sexes; status/resources (women) and looks (men) are prioritized at low budgets', url: 'https://pubmed.ncbi.nlm.nih.gov/12051582/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): physical attractiveness predicts romantic evaluations at r\u2248.40, earning prospects only r\u2248.10, both sexes, nonsignificant sex differences', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
          { label: 'Li et al. (2013), Journal of Personality and Social Psychology \u2014 live-interaction studies: low attractiveness/status get screened out, so preference thresholds do operate in real choices', url: 'https://pubmed.ncbi.nlm.nih.gov/23915041/' },
        ],
        researchNotes: '\'Game\' is not a construct these studies test, so the claim\'s baseline (charisma required by default) is unadjudicated rather than refuted. Li et al. (2013) shows genuine threshold screening on looks and status in live choices, so the claim\'s exclusivity fails but its floor logic has support. Earning prospects likely matter more for long-term commitment decisions than for the early-stage attraction these r-values measure \u2014 a regrade risk if the claim is read as marriage-market only.',
      },
      related: [ { label: 'Pill: The Black Pill (LMS)', href: 'pills.html#page-blk' }, { label: 'The Five Levers of SMV', href: 'smvlevers.html' } ],
    },
    {
      id: 'M-TBD-50',
      category: 'Attraction',
      question: 'When women reject on looks, do they say so?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The looks-rejection cope',
      sourceCardFem: 'You reject on looks, then blame something else',
      claims: [
        { camp: 'Male perspective',
          text: 'A woman swipes left on a bald guy instantly \u2014 but instead of saying "I\'m not attracted to bald men," she\'ll say "he\'s catfishing" or "why\'s he wearing a hat in every photo?" She knows exactly why she rejected him; she just won\'t say it out loud, because the honest version sounds shallow. So she manufactures a more acceptable reason.',
          verdict: 'oversimplified', truth: 35 },
        { camp: 'Female perspective',
          text: 'Often the real reason is simply that you weren\'t attracted to him \u2014 but "I\'m not into bald guys" or "he\'s just not attractive to me" feels shallow to say, so it comes out as "he was catfishing," "the vibe was off," "something felt wrong."',
          verdict: 'confirmed', truth: 65 },
      ],
      ruling: {
        badge: 'Gap real, motive unproven',
        text: 'The gap is real; the mind-reading isn\'t. Women\'s stated weighting of looks undershoots behavior: across 97 studies attractiveness predicts romantic interest at r\u2248.40 for both sexes, and stated ideals fail to predict live desire (Eastwick & Finkel 2008; Eastwick et al. 2014). People also bend rejections to spare feelings \u2014 singles accepted unattractive \'real\' dates far more often than hypothetical ones (Joel et al. 2014). But no study catches the manufactured excuse itself, and ideals mispredict even in private: often she genuinely doesn\'t know, not knows-and-won\'t-say.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Eastwick & Finkel (2008), Journal of Personality and Social Psychology \u2014 speed-dating: stated sex-differentiated ideals about looks vanish in live choices and fail to predict actual desire', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): attractiveness predicts romantic evaluations at r\u2248.40 for both sexes despite differing stated importance', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
          { label: 'Joel, Teper & MacDonald (2014), Psychological Science \u2014 singles accepted unattractive or incompatible \'real\' dates far more than predicted, driven by unanticipated concern for the other\'s feelings', url: 'https://pubmed.ncbi.nlm.nih.gov/25344347/' },
        ],
        researchNotes: 'No study directly documents the specific behavior \u2014 swapping a looks rejection for a \'catfishing\' or \'vibes\' explanation \u2014 so the ruling rests on the stated-vs-revealed gap plus rejection-softening, not on caught-in-the-act evidence. The introspection-failure reading cuts specifically against the male lens\'s \'she knows exactly why\'; a diary or attribution study of real swipe decisions could move either verdict. The female-lens \'confirmed\' covers its core (real reason is attraction more often than stated), not the illustrative excuse scripts.',
      },
      related: [ { label: 'Pill: The Face Pill', href: 'pills.html#face-pill' }, { label: 'Ruling M-TBD-37: looks filter both ways', href: 'mythbuster.html#M-TBD-37' } ],
    },
    {
      id: 'M-TBD-51',
      category: 'Psychology',
      question: 'Will anyone tell a man the truth about his looks?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Nobody will tell a man the truth about his looks',
      claims: [
        { camp: '',
          text: 'A guy posts "am I too ugly to date?" and the replies run the same script every time: "it\'s not your looks, bro \u2014 work on your personality, hit the gym, fix your fashion, it\'s all confidence." They\'ll say literally anything except the obvious: that a big part of it is genetics. Calling a man average is treated like an insult, and calling him genetically outmatched is treated as cruel \u2014 so people hand him a fix-it list or gas him up with compliments rather than be straight.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Nobody tells you',
        text: 'Confirmed, with receipts. Abi-Esber et al. (2022; five experiments, N=1,984) found people systematically underestimate how much others want constructive feedback and withhold it \u2014 in the field pilot, only 2.6% told a researcher about food or lipstick on her face. DePaulo & Bell (1996) found no condition in which artists received fully honest feedback on paintings they cared about: evaluators stonewalled, implied praise, and told outright lies. Flattering the invested asker instead of being straight is the documented human default.',
        tier: 'evidence',
        sources: [
          { label: 'Abi-Esber, Abel, Schroeder & Gino (2022), Journal of Personality and Social Psychology \u2014 five experiments (N=1,984): people underestimate others\' desire for constructive feedback and withhold it; 2.6% field-pilot rate for appearance feedback', url: 'https://pubmed.ncbi.nlm.nih.gov/35324242/' },
          { label: 'DePaulo & Bell (1996), Journal of Personality and Social Psychology \u2014 art-evaluation studies: no condition produced fully honest feedback to invested artists; stonewalling, positive implication, and outright lies instead', url: 'https://pubmed.ncbi.nlm.nih.gov/8888599/' },
        ],
        researchNotes: 'The classic MUM-effect line (Rosen & Tesser 1970 onward) converges on the same withholding bias, but no acceptable page for it could be fetch-verified this session, so it goes uncited. None of the cited evidence is sex-specific \u2014 the silence is a general human default, not a courtesy extended only to men \u2014 and the claim\'s \'it\'s mostly genetics\' aside was not adjudicated. The \'fix-it list\' substitution pattern specifically is consistent with, but not directly tested by, these studies.',
      },
      related: [ { label: 'Calc: The Face Calculator', href: 'face.html' } ],
    },
    {
      id: 'M-TBD-52',
      category: 'Attraction',
      question: 'Do looks get the match while game keeps it alive?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Looks get the match; game keeps it',
      claims: [
        { camp: '',
          text: 'On the apps especially, looks get you the match \u2014 but that\'s all they get you. When a woman matches on your photos, she\'s usually expecting the full package to follow: charisma, smooth texting, witty banter, confidence. If you don\'t deliver that "popular guy" energy fast \u2014 if the first few messages don\'t create a spark or keep her entertained \u2014 she loses interest and ghosts, even though she found you attractive enough to match.',
          verdict: 'oversimplified', truth: 40 },
      ],
      ruling: {
        badge: 'Looks keep working',
        text: 'The looks half holds: Tyson et al.\'s Tinder field study measured a 0.6% match rate for male profiles versus 10.5% for female. The \'game\' half wobbles: most matches die in silence \u2014 only 21% of men and 7% of women send any message after matching, and the median male opener is 12 characters \u2014 while Bruch & Newman found longer, harder-working messages barely lift reply rates, and replies track relative desirability instead. Looks don\'t stop working at the match; the claim retires them too early.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Tyson, Perta, Haddadi & Seto (2016), arXiv preprint (Tinder field experiment) \u2014 0.6% vs 10.5% match rates; only 21%/7% of matched men/women ever message; 12- vs 122-character median openers', url: 'https://arxiv.org/abs/1607.01952' },
          { label: 'Bruch & Newman (2018), Science Advances \u2014 reply probability falls steeply with desirability gap (reply rate to more-desirable women never exceeds 21%); longer/more effortful messages yield little or no reply gain; users aim ~25% up', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/' },
        ],
        researchNotes: 'Tyson et al. is a single-platform 2016 field study, and its post-match stats cut both ways: men initiate more often (21% vs 7%) but with 12-character median openers, so mutual silence \u2014 not failed banter \u2014 is the modal match outcome. Ghosting-motive studies (LeFebvre 2019; Freedman et al. 2019) would test the \'no spark, so she ghosts\' clause directly, but SAGE pages returned only site templates this session, so that clause is graded against attrition, effort, and desirability data.',
      },
      related: [ { label: 'Framework: The Charm Ceiling', href: 'frameworks.html#charm-ceiling' } ],
    },
    {
      id: 'M-TBD-53',
      category: 'Signals',
      question: 'Does "just friends" behavior reveal romantic interest?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Just friends" doesn\'t always mean no feelings',
      claims: [
        { camp: '',
          text: 'A woman can call you a "platonic friend" while still keeping you very close \u2014 initiating most of the conversations, hitting you up first, talking nearly every day, even being the one who pushed to exchange contacts in the first place. That\'s not typical "just a friend" behavior. Most women don\'t pour consistent effort into a guy they\'re not at least a little interested in, and few take the lead like that unless they\'re feeling something.',
          verdict: 'oversimplified', truth: 25 },
      ],
      ruling: {
        badge: 'Overreads the signal',
        text: 'Behavior can leak interest, but this card licenses the classic misread. Attraction inside cross-sex friendships is common yet asymmetric: Bleske-Rechek et al. (2012) found young men report substantially more attraction to their female friends than women report toward male friends, and both sexes name it a cost more often than a benefit. Men also systematically over-perceive women\'s friendliness as sexual interest (Haselton & Buss, 2000). No study validates initiation frequency as an interest gauge \u2014 \'she texts first, so she feels something\' is the overperception this literature warns against.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Bleske-Rechek, Somers, Micke, Erickson, Matteson, Stocco, Schumacher & Ritchie (2012), Journal of Social and Personal Relationships \u2014 men report more attraction to cross-sex friends than women do; attraction nominated as a cost more often than a benefit', url: 'https://journals.sagepub.com/doi/abs/10.1177/0265407512443611' },
          { label: 'Haselton & Buss (2000), Journal of Personality and Social Psychology \u2014 error management theory; men systematically overperceive women\'s sexual intent', url: 'https://pubmed.ncbi.nlm.nih.gov/10653507/' },
        ],
        researchNotes: 'Bleske-Rechek also means \'platonic\' rarely guarantees zero feelings, so the card fails on cue reliability, not on friend-attraction existing; I found no study directly validating initiation/effort frequency as a romantic-interest index in friendships. Haselton & Buss\'s bias evidence concerns perception of women\'s friendliness generally, extended to friendships by argument rather than direct test \u2014 regrade risk if a study validating initiation as an interest cue surfaces.',
      },
      related: [ { label: 'GD card: The emotional harem', href: 'gender-dynamics.html#gd-emotional-harem' }, { label: 'Ruling M-TBD-1: the overperception bias', href: 'mythbuster.html#M-TBD-1' } ],
    },
    {
      id: 'M-TBD-54',
      category: 'Dating',
      question: 'Is early romance all-or-nothing while friendship forgives?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Romance is fragile; friendship is durable',
      claims: [
        { camp: '',
          text: 'Once a woman files you under "romantic prospect," it tends to be all-or-nothing: if it doesn\'t progress \u2014 say it stalls after a date or two \u2014 you\'re usually cut off completely, with no soft landing into friendship. But if you\'re in the friend category, the relationship can actually last a long time, as long as you keep putting in effort to stoke it. So the friend zone is paradoxically more durable than the romantic one.',
          verdict: 'oversimplified', truth: 55 },
      ],
      ruling: {
        badge: 'Tendency, not a law',
        text: 'The asymmetry checks out; the female filing system doesn\u2019t. Dissolution research finds total contact cessation characteristic of exactly the stage the claim names \u2014 relationships ended by ghosting were shorter and lower-commitment than those ended by a direct conversation \u2014 and the friendship half is Dunbar\u2019s decay law verbatim: friendships survive on communication and shared activity, and strong ones decay as fast as weak ones once the effort stops. Two corrections. The cutoff is how both sexes exit low-stakes courtship, not something women do to men. And the wall isn\u2019t absolute: once a romance actually establishes, the friendship landing is common \u2014 and the more satisfying the romance was, the likelier it survives as one.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Koessler, Kohut & Campbell (2019), Collabra: Psychology \u2014 relationships ended by ghosting were shorter and lower-commitment than those ended by direct conversation', url: 'https://doi.org/10.1525/collabra.230' },
          { label: 'Bullock, Hackathorn, Clark & Mattingly (2011), Journal of Social Psychology \u2014 remaining friends after a breakup is common and predicted by satisfaction during the dissolved relationship', url: 'https://pubmed.ncbi.nlm.nih.gov/22017080/' },
          { label: 'Roberts & Dunbar (2015), Human Nature \u2014 friendships decay without ongoing contact and shared activities; baseline strength doesn\u2019t protect them', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4626528/' },
        ],
        researchNotes: 'Graded 2026-07-07 at Jason\u2019s request, closing the last docket hold. The 2026-07-06 gap \u2014 no direct test of stalled early-stage courtships \u2014 is closed to \u2018evidence\u2019 (not hard-data) by the ghosting literature: Koessler, Kohut & Campbell measured the association directly (ghost-ended relationships shorter, lower-commitment), verified this session via the Semantic Scholar API record of DOI 10.1525/collabra.230 because UC Press 403s automated fetchers. Their prevalence figures (64.5% report having ghosted, MTurk sample) circulate in secondary summaries but are not in the abstract, so they are not cited. No study measures the conditional rate the claim needs \u2014 P(complete cutoff | stall after 1\u20132 dates) \u2014 so its \u2018usually\u2019 stays an inference; the claim\u2019s hedges (\u2018tends to be\u2019) keep it at Oversimplified rather than worse. Nothing verified shows a sex difference in ghosting, so the \u2018once a woman files you\u2019 mechanism is scored against the claim. Bullock et al. and Roberts & Dunbar re-verified this session (abstract and full text respectively).',
      },
      related: [ { label: 'Ruling M-TBD-33: the situationship economy', href: 'mythbuster.html#M-TBD-33' }, { label: 'Lexicon: Friend zone', href: 'lexicon.html#term-friend-zone' } ],
    },
    {
      id: 'M-TBD-55',
      category: 'Standards',
      question: 'Does "like me for me" run both ways?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Like me for me" only runs one way',
      sourceCardFem: '"Like me for me" \u2014 do you extend the same grace?',
      claims: [
        { camp: 'Male perspective',
          text: '"I want someone who likes me for me" usually means: accept all my flaws \u2014 but that grace rarely runs the other direction. The same person still wants you socially smooth, confident, funny on demand, and good at flirting, even if you\'re naturally awkward. Very few are actually willing to date a guy who\'s genuinely awkward, low-charisma, and bad at the social game, even when he\'s kind, loyal, and honest.',
          verdict: 'oversimplified', truth: 40 },
        { camp: 'Female perspective',
          text: '"I just want a man who likes me for me" is fair \u2014 but notice whether the grace runs both ways. Often it means: accept all my flaws, while I still expect you to be tall, fit, confident, funny, successful, and smooth. Wanting to be loved as you are, while holding him to the "upgraded" version of himself, is a double standard.',
          verdict: 'confirmed', truth: 60 },
      ],
      ruling: {
        badge: 'Runs both ways',
        text: 'The double standard is real; the one-way framing isn\'t. In Li et al.\'s (2002) budget studies nobody buys \'as-is\' acceptance: with tight budgets women spend first on status and resources, men on physical attractiveness; kindness and intelligence are necessities for both \u2014 necessary, not sufficient, the kind-but-awkward man\'s exact problem. And looks predict live romantic interest at r\u2248.40 for both sexes (Eastwick et al., 2014, k=97). \'Like me for me\' coexists with a demands list in both directions; only \'rarely runs the other way\' overreaches.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Li, Bailey, Kenrick & Linsenmeier (2002), Journal of Personality and Social Psychology \u2014 budget paradigm: physical attractiveness a necessity for men, status/resources for women, kindness and intelligence necessities for both sexes', url: 'https://pubmed.ncbi.nlm.nih.gov/12051582/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 meta-analysis (k=97): attractiveness predicts romantic evaluations at r\u2248.40 for both sexes; sex differences tiny and nonsignificant', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
        ],
        researchNotes: 'Li\'s budgets tested kindness and intelligence, not social skills or charisma, so the \'awkwardness disqualifies even the kind guy\' clause is inferred from necessity-not-sufficiency logic rather than directly tested. The female-perspective wording earns \'confirmed\' because it hedges with \'often\' and frames the standard as a double standard to notice; the male-perspective \'rarely runs the other direction\' fails because the necessities data show both sexes running the same one-way grace. Budget paradigm is one lab\'s method (cross-cultural replications exist but were not verified this session), capping the tier at \'evidence\' despite the meta.',
      },
      related: [ { label: 'Framework: The Parity Rule', href: 'frameworks.html#parity-rule' } ],
    },
    {
      id: 'M-TBD-56',
      category: 'Psychology',
      question: 'Does a flood of attention inflate self-assessed value?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Inflated value and the simp economy',
      sourceCardFem: 'Your options can inflate your sense of value',
      claims: [
        { camp: 'Male perspective',
          text: 'When average women have tons of options, constant attention, and a crowd of guys orbiting them, it inflates their sense of their own value \u2014 even when they\'re not particularly special. The male thirst is the supply that props up the leverage, and that power dynamic goes to a lot of their heads.',
          verdict: 'oversimplified', truth: 40 },
        { camp: 'Female perspective',
          text: 'When your inbox is full and there\'s always another option, it\'s easy to conclude you\'re more in-demand than you actually are \u2014 and to keep raising the bar accordingly. But a flood of low-effort attention from men casting a wide net isn\'t the same as genuine high value, and the men you actually want judge by a different standard.',
          verdict: 'confirmed', truth: 60 },
      ],
      ruling: {
        badge: 'Real effect, oversold',
        text: 'The mechanism is real. In controlled experiments (Kavanagh, Robins & Ellis, 2010), being accepted by attractive opposite-sex others raised participants\' mating aspirations, mediated by a lift in state self-esteem \u2014 so incoming attention genuinely inflates self-assessed value and pushes standards up. In real markets both sexes already message partners about 25% more desirable than themselves (Bruch & Newman, 2018). The female lens\'s caveat \u2014 low-effort attention isn\'t genuine demand \u2014 is apt. The male lens\'s \'average, not special\' contempt is editorial, not measured.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Kavanagh, Robins & Ellis (2010), J. Personality & Social Psychology \u2014 experimental acceptance by attractive opposite-sex confederates raised mating aspirations, mediated by state self-esteem', url: 'https://pubmed.ncbi.nlm.nih.gov/20565190/' },
          { label: 'Bruch & Newman (2018), Science Advances \u2014 both sexes pursue partners ~25% more desirable than themselves', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/' },
        ],
        researchNotes: 'Kavanagh et al. is a single two-experiment paper \u2014 the mechanism is established but caps at \'evidence,\' and the \'average women\'/simp-economy causal story is framing, not tested. A women-specific mate-value-feedback study (Pers. Individ. Differ.) that would corroborate directly was paywalled this session (403), so it is uncited.',
      },
      related: [ { label: 'Framework: The Attention Market', href: 'frameworks.html#attention-market' }, { label: 'Ruling M-TBD-58: abundance blindness', href: 'mythbuster.html#M-TBD-58' } ],
    },
    {
      id: 'M-TBD-57',
      category: 'Standards',
      question: 'Is "the bar is in hell" low standards \u2014 or selective ones?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"The bar is in hell" means selective, not low',
      sourceCardFem: 'Your bar isn\'t low \u2014 it\'s selective',
      claims: [
        { camp: 'Male perspective',
          text: 'It doesn\'t hold up: if the bar were really that low, they\'d date anyone. What it actually means is the bar is in hell for guys they\'re not attracted to \u2014 and on the roof for the ones they are. They\'ll overlook massive red flags for a hot or charismatic guy, then turn around and say a normal, decent guy doesn\'t meet their standards. It\'s not low standards; it\'s selective standards.',
          verdict: 'oversimplified', truth: 35 },
        { camp: 'Female perspective',
          text: 'If your bar were genuinely low, you\'d date almost anyone; you don\'t. What\'s actually happening is that the bar sits on the floor for men you\'re not attracted to and on the roof for the ones you are. You\'ll forgive a charming, high-value man things you\'d never tolerate from an average one.',
          verdict: 'confirmed', truth: 65 },
      ],
      ruling: {
        badge: 'Selective, not low',
        text: 'Attraction really does bend the ruler. Meta-analytically, physically attractive people are judged and treated more positively across domains (Langlois et al., 2000), and attractiveness predicts live romantic desire at r\u2248.40 for both sexes (Eastwick et al., 2014) \u2014 so tolerance is conditioned on attraction, not uniformly low. \'Selective, not low\' is the correct reframe. Two caveats drop the male lens to oversimplified: this halo is human-universal, not a female trait, and the effects are real but modest \u2014 \'overlook massive red flags\' overstates the magnitude.',
        tier: 'hard-data',
        truth: 85,
        sources: [
          { label: 'Langlois, Kalakanis, Rubenstein, Larson, Hallam & Smoot (2000), Psychological Bulletin \u2014 meta-analysis: attractive people are judged and treated more positively, with cross-cultural rater agreement', url: 'https://pubmed.ncbi.nlm.nih.gov/10825783/' },
          { label: 'Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin \u2014 attractiveness predicts romantic evaluation at r\u2248.40, near-identical across sexes', url: 'https://pubmed.ncbi.nlm.nih.gov/23586697/' },
        ],
        researchNotes: 'The halo is robust and cross-cultural but modest in size, and it is universal \u2014 not specific to women judging men, which weakens the gendered framing. Mazzella & Feingold\'s (1994) meta-analysis (attractive defendants punished less leniently, d\u2248.12) would directly support the \'forgive transgressions\' point but its journal page was paywalled this session (402), so it is uncited.',
      },
      related: [ { label: 'Framework: Treatment Markup', href: 'frameworks.html#treatment-markup' } ],
    },
    {
      id: 'M-TBD-58',
      category: 'Market',
      question: 'Does her abundance hide how hard the market is for average men?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Abundance blindness: why women don\'t see the crisis',
      sourceCardFem: 'Your abundance hides how hard it is for men',
      claims: [
        { camp: 'Male perspective',
          text: 'Most women genuinely don\'t grasp how rough the dating market has gotten for average men \u2014 because their own experience is the opposite. When you personally have endless options, you assume everyone does: "I get tons of attention, so men must too."',
          verdict: 'oversimplified', truth: 55 },
        { camp: 'Female perspective',
          text: 'If you get steady attention, it\'s natural to assume men have it just as easy \u2014 so when you hear that a huge share of average guys get almost nothing, it sounds exaggerated. It isn\'t. The market is brutally lopsided, and your abundance is the exact thing that hides that from you.',
          verdict: 'oversimplified', truth: 55 },
      ],
      ruling: {
        badge: 'Gap real, blindness unproven',
        text: 'The asymmetry is real. In a Tinder field experiment women accumulated matches rapidly while men accrued them slowly (Tyson et al., 2016); in a full dating market men overwhelmingly message up, where replies from more-desirable women never top 21% and men hear back twice as often from less-desirable ones (Bruch & Newman, 2018). So women do receive more attention and average men face steep odds. But the \'women can\'t perceive it\' half is asserted, not measured \u2014 a plausible egocentric bias, not a proven one.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Tyson, Perta, Haddadi & Seto (2016), ASONAM/arXiv \u2014 Tinder curated-profile experiment: women accumulate matches rapidly, men slowly', url: 'https://arxiv.org/abs/1607.01952' },
          { label: 'Bruch & Newman (2018), Science Advances \u2014 men overwhelmingly message more-desirable women; reply rate up-hierarchy never exceeds 21%', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/' },
        ],
        researchNotes: 'Objective asymmetry is well-supported (apps especially); the perception/\'abundance blinds them\' half is an untested inference. Tyson\'s often-quoted exact match rates (~0.6% men vs ~10.5% women) sit in the paper body, not the abstract I could load, so the ruling leans on the abstract\'s directional finding plus Bruch & Newman\'s verified reply-rate numbers.',
      },
      related: [ { label: 'Chart: the attention skew', href: 'statistics.html#stat-attention' }, { label: 'Ruling M-TBD-31: skew, not lock-out', href: 'mythbuster.html#M-TBD-31' } ],
    },
    {
      id: 'M-TBD-59',
      category: 'Market',
      question: 'Does a man\'s dating window narrow \u2014 and does sitting out compound?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The window narrows \u2014 and sitting out compounds',
      claims: [
        { camp: '',
          text: 'Younger guys still in their early 20s have years to course-correct; by your early-to-mid 30s that luxury is mostly gone \u2014 the window has narrowed. Most women looking to settle down are aiming at men roughly 28\u201338, but they specifically want men who already have their act together: career, social skills, dating experience. The cruel part is that it compounds \u2014 the longer you sit on the sidelines, the harder it becomes to jump back in, because you fall further behind on exactly the things they\'re screening for.',
          verdict: 'oversimplified', truth: 40 },
      ],
      ruling: {
        badge: 'Partly real, partly unproven',
        text: 'Partly grounded, partly not. Women do prefer slightly older partners within a narrower age band (Antfolk, 2017), and romantically/sexually inexperienced adults are stigmatized and less desired (Gesselman et al., 2017) \u2014 so \'they screen for an established, experienced man\' holds. But the \'window narrows by your mid-30s\' framing runs against evidence that men\'s online desirability actually rises with age, peaking near 50 (Bruch & Newman, 2018). The specific 28\u201338 target and the \'sitting out compounds\' claim are untested assertions.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Antfolk (2017), Evolutionary Psychology \u2014 women prefer slightly older partners in a narrower band; men prefer women in their 20s and widen with age', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10367477/' },
          { label: 'Bruch & Newman (2018), Science Advances \u2014 male desirability rises with age, peaking near 50 (counter-evidence to a narrowing 30s window)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/' },
          { label: 'Gesselman, Webster & Garcia (2017), Journal of Sex Research \u2014 sexually/romantically inexperienced adults are stigmatized and less desired as partners', url: 'https://pubmed.ncbi.nlm.nih.gov/26983793/' },
        ],
        researchNotes: 'Antfolk supports slightly-older, narrow-range female preferences but gives no specific 28\u201338 band; Bruch & Newman\'s age-desirability curve (male desirability rising with age) actively cuts against the \'narrowing window,\' though it measures online-message desirability rather than settle-down marriageability. No test of the \'inaction compounds\' mechanism was located, so that half is unverified.',
      },
      related: [ { label: 'GD card: The male window', href: 'gender-dynamics.html#gd-male-window' } ],
    },
    {
      id: 'M-TBD-60',
      category: 'Standards',
      question: 'Is dating-market entitlement a women-only problem?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Entitlement runs both ways',
      claims: [
        { camp: '',
          text: 'Yes, a lot of women carry inflated standards \u2014 the "6 feet, six figures" checklist while bringing little to the table themselves. But entitlement isn\'t a women-only problem. Plenty of men have their own version: convinced they deserve a perfect 10 who cooks, cleans, and adores them while they sit on the couch playing video games with no ambition, no direction, and nothing much to offer. Both sides have people wanting far more than they bring.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Runs both ways',
        text: 'Behavioral data back the symmetry. Analyzing four U.S. cities, Bruch & Newman (2018) found men and women message partners 26% and 23% more desirable than themselves \u2014 near-identical aiming-up. Kreager et al. (2014) likewise found both sexes pursue the most desirable partners regardless of their own standing, and Epley & Whitchurch (2008) showed people literally recognize a beautified version of their own face as real. Entitlement and self-overrating aren\'t a women-only trait; the couch-and-checklist caricatures are just the loud examples.',
        tier: 'hard-data',
        sources: [
          { label: 'Bruch & Newman (2018), Science Advances \u2014 both sexes message partners ~25% more desirable than themselves (men 26%, women 23%).', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/' },
          { label: 'Kreager, Cavanagh, Yen & Yu (2014), Journal of Marriage and Family \u2014 both sexes send messages to the most socially desirable partners regardless of their own desirability; women initiate 4x less than men.', url: 'https://pubmed.ncbi.nlm.nih.gov/24910472/' },
          { label: 'Epley & Whitchurch (2008), Personality and Social Psychology Bulletin \u2014 people recognize an attractively enhanced version of their own face as their true face (self-enhancement).', url: 'https://pubmed.ncbi.nlm.nih.gov/18550861/' },
        ],
        researchNotes: 'Bruch/Newman and Kreager are large behavioral-trace datasets from single dating sites, not representative population surveys, and the 26/23% figures reflect messaging behavior rather than stated entitlement; self-enhancement magnitude (Epley) varies by measure. Direction is robust and replicated across two independent datasets; exact symmetry could shift with sample.',
      },
      related: [ { label: 'Framework: The Parity Rule', href: 'frameworks.html#parity-rule' }, { label: 'Chart: couples match, not trade up', href: 'statistics.html#stat-looks-matching' } ],
    },
    {
      id: 'M-TBD-61',
      category: 'Dating',
      question: 'Do men and women avoid commitment for the same reason?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Why each side dodges commitment',
      claims: [
        { camp: '',
          text: 'A lot of women stay uncommitted because they\'re holding out for a better option: they\'ll keep a decent "good enough" guy around as a backup while they keep looking, never fully locking in because they\'re always wondering if someone higher-value is a swipe away. A lot of men stay uncommitted for a simpler reason: they want to keep their options open to keep sleeping around. Same refusal to commit, opposite motives.',
          verdict: 'oversimplified', truth: 45 },
      ],
      ruling: {
        badge: 'Real but overstated',
        text: 'The sex-typed split is half-real. Schmitt\'s 48-nation study (N=14,059) confirms men score reliably higher on unrestricted sociosexuality \u2014 the \'variety\' motive is well-founded and cross-culturally robust. Apostolou et al. (2020) likewise found men more often single to \'flirt around\' or avoid family life. But the tidy \'women hoard a backup\' half wobbles: Dibble & Drouin (2014) found men, not women, report more \'back burners,\' and women\'s own top single-reasons were pickiness and fear of getting hurt. Overlapping motives, not clean opposites.',
        tier: 'evidence',
        truth: 75,
        sources: [
          { label: 'Schmitt (2005), Behavioral and Brain Sciences \u2014 48 nations, N=14,059; men\'s higher unrestricted sociosexuality is large and cross-culturally universal.', url: 'https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/sociosexuality-from-argentina-to-zimbabwe-a-48nation-study-of-sex-culture-and-strategies-of-human-mating/E6442571B8E524AE8CAF7613BD4CECC8' },
          { label: 'Apostolou, O & Esposito (2020), Frontiers in Psychology \u2014 N=648 singles; men more often single to \'flirt around\'/avoid family life, women more often \'too picky\'/fearing hurt.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7218110/' },
          { label: 'Dibble & Drouin (2014), Computers in Human Behavior \u2014 N=374; men reported more \'back burners\' (alternative partners kept in reserve) than women.', url: 'https://digitalcommons.hope.edu/faculty_publications/1233/' },
        ],
        researchNotes: 'Schmitt\'s sociosexuality sex difference is robust and cross-cultural, but the specific \'women optimize/keep a backup vs men seek variety\' dichotomy rests on single studies (Apostolou; Dibble) that partly conflict \u2014 back-burner counts run opposite to the claim\'s gendering. Regrade risk if stronger reasons-for-single sex-difference data emerges.',
      },
      related: [ { label: 'Chart: why singles opt out', href: 'statistics.html#stat-why-single' } ],
    },
    {
      id: 'M-TBD-62',
      category: 'Signals',
      question: 'How much is a woman\'s explicit first move worth?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'When a woman moves first, weight it heavily',
      claims: [
        { camp: '',
          text: 'A woman making the first explicit move \u2014 not a covert signal, but actually saying it \u2014 is genuinely rare, so when it happens it tends to carry more weight than men give it. When a woman compliments your looks unprompted, asks for your number, or says something like "you smell nice," she\'s usually spent real social risk to do it. Men routinely wave these off ("she\'s just being friendly") and only count interest once it\'s spelled out.',
          verdict: 'oversimplified', truth: 65 },
      ],
      ruling: {
        badge: 'Rare yes, ignored no',
        text: 'Rarity and weight check out; the \'men ignore it\' half is shakier. Kreager et al. (2014) found women send first messages four times less often than men \u2014 and those who do initiate connect with more desirable partners, so an explicit move is both rare and a costly, informative signal. But \'men routinely wave these off\' cuts against Haselton & Buss (2000): men tend to OVERperceive women\'s sexual interest, not under-read it. Treat an explicit move as strong; the dismissal claim is the weak link.',
        tier: 'evidence',
        truth: 80,
        sources: [
          { label: 'Kreager, Cavanagh, Yen & Yu (2014), Journal of Marriage and Family \u2014 women send first messages 4x less often than men; women who initiate connect with more desirable partners.', url: 'https://pubmed.ncbi.nlm.nih.gov/24910472/' },
          { label: 'Haselton & Buss (2000), Journal of Personality and Social Psychology \u2014 men overperceive women\'s sexual intent; women underperceive men\'s commitment (error management theory).', url: 'https://pubmed.ncbi.nlm.nih.gov/10653507/' },
        ],
        researchNotes: 'Kreager\'s 4x initiation gap is one large study; female-initiation rarity is widely observed but only this source was verified here. Haselton & Buss concerns overperception of ambiguous cues, not dismissal of explicit stated moves, so the tension with \'men wave it off\' is suggestive rather than decisive. Clark & Hatfield (1989) measures receptivity to offers, not initiation, and its PDF would not extract cleanly this session, so it was not cited.',
      },
      related: [ { label: 'Chart: who sends the first message', href: 'statistics.html#stat-first-message' }, { label: 'Ruling M-TBD-36: the covert-signal base rate', href: 'mythbuster.html#M-TBD-36' } ],
    },
  ];

  /* ── Escaping (content is placeholder now, Jason's copy later) ── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── Render gate: an entry is only renderable if it is complete + sourced +
     has a unique id. `seenIds` (a Set of already-accepted ids) is optional — it
     is threaded in by render() so a second occurrence of an id fails the gate. ── */
  function validate(entry, seenIds) {
    const problems = [];
    if (!entry || typeof entry !== 'object') return ['not an object'];
    if (!entry.id) problems.push('missing id');
    else if (seenIds && seenIds.has(entry.id)) problems.push('duplicate id');

    const r = entry.ruling;
    if (!r || typeof r !== 'object') {
      problems.push('missing ruling');
    } else {
      if (!TIERS[r.tier]) problems.push('missing/invalid ruling.tier');              // spec: hard-refuse
      if (!Array.isArray(r.sources) || r.sources.length === 0) {
        problems.push('empty ruling.sources');                                       // spec: hard-refuse
      } else {
        r.sources.forEach(function (s, i) {
          // A source with no fetchable URL is unsourced in practice — enforce the header's
          // "no unsourced ruling reaches the DOM" guarantee literally (empty href renders a dead link).
          if (!s || !s.url || !/^https?:\/\//.test(s.url)) problems.push('source[' + i + '] missing/invalid url');
        });
      }
      if (!r.badge) problems.push('missing ruling.badge');
      if (!r.text) problems.push('missing ruling.text');
    }

    if (!Array.isArray(entry.claims) || entry.claims.length === 0) {
      problems.push('no claims');
    } else {
      entry.claims.forEach(function (c, i) {
        if (!c || typeof c !== 'object') { problems.push('claim[' + i + '] not an object'); return; }
        if (!c.text) problems.push('claim[' + i + '] missing text');
        if (!VERDICTS[c.verdict]) problems.push('claim[' + i + '] invalid verdict');
      });
      // Optional synthesized truth stakes: all-or-none across an entry's claims;
      // integers 1–99; and for 2+ claims the numbers must either sum to exactly
      // 100 (competing camps: shares of the table) or all be equal (mirror
      // claims: one shared kernel). A half-staked or non-additive entry is a
      // badly staked number — worse than none — so it fails the whole gate.
      var staked = entry.claims.filter(function (c) { return c && c.truth != null; });
      if (staked.length) {
        if (staked.length !== entry.claims.length) {
          problems.push('claim.truth must be staked on all claims or none');
        }
        var truthShapeOk = true;
        staked.forEach(function (c, i) {
          var t = c.truth;
          if (typeof t !== 'number' || !isFinite(t) || t !== Math.round(t) || t <= 0 || t >= 100) {
            problems.push('claim truth[' + i + '] must be an integer in 1–99');
            truthShapeOk = false;
          }
        });
        if (truthShapeOk && staked.length === entry.claims.length && entry.claims.length > 1) {
          var truthSum = 0, allEqual = true;
          entry.claims.forEach(function (c) {
            truthSum += c.truth;
            if (c.truth !== entry.claims[0].truth) allEqual = false;
          });
          if (truthSum !== 100 && !allEqual) {
            problems.push('claim truths must sum to 100 (camps) or all be equal (mirrors); got ' + truthSum);
          }
        }
      }
      // The ruling's own stake pairs with staked claims: required with them,
      // meaningless without them, integer 1–99, and never below the best claim
      // (the ruling subsumes what the claims got right, then adds to it).
      var rt = entry.ruling && typeof entry.ruling === 'object' ? entry.ruling.truth : null;
      if (staked.length === entry.claims.length && staked.length > 0) {
        if (rt == null) {
          problems.push('staked claims require ruling.truth');
        } else if (typeof rt !== 'number' || !isFinite(rt) || rt !== Math.round(rt) || rt <= 0 || rt >= 100) {
          problems.push('ruling.truth must be an integer in 1–99');
        } else {
          var bestClaim = Math.max.apply(null, entry.claims.map(function (c) { return c.truth; }));
          if (isFinite(bestClaim) && rt < bestClaim) problems.push('ruling.truth (' + rt + ') must be >= the best claim (' + bestClaim + ')');
        }
      } else if (rt != null) {
        problems.push('ruling.truth requires fully staked claims');
      }
    }
    return problems;
  }

  /* ── One claim (camp + verdict chip on a line, then the quotation).
     `metricsOn` (the entry-level 25% floor, computed once in cardHTML) gates the
     staked-% suffix inside the chip — a sub-floor entry shows bare stamps. ── */
  function claimHTML(c, metricsOn) {
    const camp = c.camp ? '<span class="mb-camp">' + esc(c.camp) + '</span>' : '';
    const truth = (metricsOn && c.truth != null)
      ? '<span class="mb-truth" title="This claim&#39;s staked share of the answer to the question — graded where it disagrees with the ruling, not on agreed premises. Synthesized, revised on better data.">&nbsp;&middot; ' + Number(c.truth) + '%</span>'
      : '';
    return '<div class="mb-claim">' +
        '<div class="mb-claim-head">' + camp +
          '<span class="mb-verdict ' + esc(c.verdict) + '">' + esc(VERDICTS[c.verdict].label) + truth + '</span>' +
        '</div>' +
        '<blockquote class="mb-quote">&ldquo;' + esc(c.text) + '&rdquo;</blockquote>' +
      '</div>';
  }

  /* ── Docket claim (preview mode): camp label + quotation, but NEVER a verdict
     chip. A docket entry's verdict is 'todo', which is not in VERDICTS — we must
     not look it up. This is why claimHTML cannot be reused as-is. ── */
  function docketClaimHTML(c) {
    c = c || {};
    const head = c.camp
      ? '<div class="mb-claim-head"><span class="mb-camp">' + esc(c.camp) + '</span></div>'
      : '';
    return '<div class="mb-claim">' + head +
        '<blockquote class="mb-quote">&ldquo;' + esc(c.text) + '&rdquo;</blockquote>' +
      '</div>';
  }

  /* ── Ledger visibility (the 25% floor): metrics render only when every claim
     is staked AND every claim clears 25 — a rout is not a contest, so a card
     with any sub-floor argument shows bare stamps and the ruling stands alone
     as the ground truth. The floor tests only the claims' own stakes, never
     the ruling's. ── */
  function stakesVisible(claims) {
    var truths = claims.map(function (c) { return c.truth; });
    if (truths.some(function (t) { return t == null; })) return false;
    return Math.min.apply(null, truths) >= 25;
  }

  /* ── Stake ledger: one 0-anchored row per position — every claim (scarlet)
     plus the ruling itself (gold) — on a shared 0–100 axis, the percentage
     printed on each row. All shares are ABSOLUTE: nothing is normalized, so
     bar lengths compare directly and the gold row vs the best claim shows how
     much the ruling adds. The ruling never stakes 100 — its empty tail is the
     margin held open for refutation. ── */
  function ledgerRowHTML(label, pct, rowClass) {
    return '<div class="mb-stake-row ' + rowClass + '">' +
        '<span class="mb-stake-label">' + esc(label) + '</span>' +
        '<span class="mb-stake-track" aria-hidden="true"><span class="mb-stake-fill" style="width:' + Number(pct) + '%"></span></span>' +
        '<span class="mb-stake-pct">' + Number(pct) + '%</span>' +
      '</div>';
  }
  function stakeLedgerHTML(claims, r) {
    // Each party keeps its own scarlet step (p0 scarlet → p1 dim → p2 deep) so
    // multi-claim ledgers are attributable at a glance; the ruling row is gold.
    var rows = claims.map(function (c, i) {
      return ledgerRowHTML(c.camp || 'Claim', c.truth, 'p' + i);
    }).join('');
    rows += ledgerRowHTML('Ruling', r.truth, 'is-ruling');
    return '<div class="mb-stake" title="Synthesized stakes — each position&#39;s absolute share of the full truth of the matter, the ruling included. The ruling never claims 100%: its empty tail is the margin we hold open for refutation. Not measurements — bring better data and the numbers move.">' +
        '<div class="mb-stake-head">Our stake</div>' + rows +
      '</div>';
  }

  /* ── Card HTML for one (already-validated) entry ── */
  function cardHTML(m) {
    const claims = m.claims;
    const n = claims.length;
    const r = m.ruling;
    const metricsOn = stakesVisible(claims);   // false = no stakes, or under the 25% floor
    const sourcesId = 'sources-' + m.id;

    const draftChip = m.draft
      ? '<span class="mb-draft" title="Placeholder — not canon">DRAFT</span>'
      : '';

    // Top strip, right side: N=1 shows the claim's verdict badge; N>1 shows the count pill.
    const topRight = n === 1
      ? '<span class="mb-verdict ' + esc(claims[0].verdict) + '">' + esc(VERDICTS[claims[0].verdict].label) + '</span>'
      : '<span class="mb-count">' + n + ' claims tested</span>';

    // Every card gets a semantic <h2>: the question when present, else an sr-only
    // heading built from the (single) claim text so no card is heading-less.
    const heading = m.question
      ? '<h2 class="mb-question">' + esc(m.question) + '</h2>'
      : '<h2 class="mb-sr-only">' + esc(claims[0].text) + '</h2>';

    // Short attribution line, tied to the full list in the Sources footer.
    const first = r.sources[0];
    const extra = r.sources.length > 1 ? ' (+' + (r.sources.length - 1) + ' more)' : '';
    const attribution = esc(first.label) + extra;

    const sourceItems = r.sources.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" rel="noopener"' +
        (/^https?:/i.test(s.url) ? ' target="_blank"' : '') + '>' + esc(s.label) + '</a></li>';
    }).join('');

    // Related links live in the always-visible footer row (right of the Sources
    // toggle), NOT in the collapsed panel. Nothing renders when related[] is empty.
    const relatedFooter = Array.isArray(m.related) && m.related.length
      ? '<div class="mb-related-footer">' +
          '<span class="mb-related-head">Related</span>' +
          '<span class="mb-related-links">' +
            m.related.map(function (rel) {
              return '<a href="' + esc(rel.href) + '">' + esc(rel.label) + '</a>';
            }).join('<span class="mb-related-sep" aria-hidden="true">·</span>') +
          '</span>' +
        '</div>'
      : '';

    return '' +
      '<article class="mb-card' + (m.draft ? ' is-draft' : '') + '" id="' + esc(m.id) + '" data-category="' + esc(m.category) + '" data-id="' + esc(m.id) + '" data-claims="' + n + '">' +

        // Top strip
        '<div class="mb-strip">' +
          '<div class="mb-strip-left">' +
            '<span class="mb-id">' + esc(m.id) + '</span>' +
            (m.category ? '<span class="mb-cat">' + esc(m.category) + '</span>' : '') +
            draftChip +
          '</div>' +
          '<div class="mb-strip-right">' + topRight + '</div>' +
        '</div>' +

        // Heading (visible question, or sr-only claim-derived heading)
        heading +

        // Body: claims (left/top) | ruling (right/bottom), split by a hairline.
        // One entry-level visibility decision feeds both columns: chip %s on
        // the claims, the stake ledger on the ruling.
        '<div class="mb-body">' +
          '<div class="mb-col mb-claims">' + claims.map(function (c) { return claimHTML(c, metricsOn); }).join('') + '</div>' +
          '<div class="mb-col mb-ruling">' +
            // Label (left) + verdict badge (right) share one row.
            '<div class="mb-ruling-head">' +
              '<div class="mb-col-label mb-ruling-label">The ruling</div>' +
              '<div class="mb-ruling-badge">' + esc(r.badge) + '</div>' +
            '</div>' +
            (metricsOn ? stakeLedgerHTML(claims, r) : '') +
            '<p class="mb-ruling-text">' + esc(r.text) + '</p>' +
            '<div class="mb-evidence">' +
              '<span class="mb-tier ' + esc(r.tier) + '">' + SVG_TIER + esc(TIERS[r.tier].label) + '</span>' +
              '<span class="mb-attr">Source &middot; ' + attribution + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Footer: a single row — the expandable-Sources toggle (left) and the
        // always-visible Related links (right). The full source list is in the panel.
        '<div class="mb-sources">' +
          '<div class="mb-sources-bar">' +
            '<button class="mb-sources-toggle" type="button" aria-expanded="false" aria-controls="' + sourcesId + '">' +
              '<span class="mb-sources-btn-label">' + SVG_BOOK + ' Sources</span>' +
              SVG_CHEVRON +
            '</button>' +
            relatedFooter +
          '</div>' +
          '<div class="mb-sources-panel">' +
            '<div class="mb-sources-inner" id="' + sourcesId + '" role="region" aria-label="Sources for ' + esc(m.id) + '">' +
              '<div class="mb-sources-content">' +
                '<ul class="mb-source-list">' + sourceItems + '</ul>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</article>';
  }

  /* ── Docket card (preview mode ONLY): a gate-FAILED entry, shown for grading.
     Same shell, but NO verdict chips, NO ruling badge / tier / source line — an
     "Ungraded" strip pill and an "Awaiting ruling" placeholder stand in, and the
     card carries .is-docket for the washed/dashed treatment. Rendered after all
     gate-passing cards. This is a render-path branch for already-failed entries
     only — it does NOT touch validate() or any gate check. ── */
  function docketCardHTML(m) {
    const claims = Array.isArray(m.claims) ? m.claims : [];
    const n = claims.length;

    // Heading: the question when present, else an sr-only heading from the first
    // claim text (or the id) so no card is heading-less.
    const heading = m.question
      ? '<h2 class="mb-question">' + esc(m.question) + '</h2>'
      : '<h2 class="mb-sr-only">' + esc((claims[0] && claims[0].text) || m.id) + '</h2>';

    return '' +
      '<article class="mb-card is-docket" id="' + esc(m.id) + '" data-category="' + esc(m.category) + '" data-id="' + esc(m.id) + '" data-claims="' + n + '">' +

        // Top strip — id + category only. The Ungraded pill now sits on the
        // ruling-head row (mirroring the real card's badge), not in the strip.
        '<div class="mb-strip">' +
          '<div class="mb-strip-left">' +
            '<span class="mb-id">' + esc(m.id) + '</span>' +
            (m.category ? '<span class="mb-cat">' + esc(m.category) + '</span>' : '') +
          '</div>' +
        '</div>' +

        heading +

        // Body: claims (no verdict chips) | ruling placeholder ("Awaiting ruling").
        '<div class="mb-body">' +
          '<div class="mb-col mb-claims">' + claims.map(docketClaimHTML).join('') + '</div>' +
          '<div class="mb-col mb-ruling">' +
            // Label (left) + Ungraded pill (right) share one row — same treatment
            // as the real card's ruling badge.
            '<div class="mb-ruling-head">' +
              '<div class="mb-col-label mb-ruling-label">The ruling</div>' +
              '<span class="mb-ungraded">Ungraded</span>' +
            '</div>' +
            '<p class="mb-awaiting">Awaiting ruling</p>' +
          '</div>' +
        '</div>' +

      '</article>';
  }

  /* ── Filter chips auto-generated from categories present in the data,
     each carrying its entry count ── */
  function chipsHTML(categories, counts, total) {
    var chips = '<button class="mb-chip active" type="button" data-category="all" aria-pressed="true">All' +
      '<span class="mb-chip-n">' + total + '</span></button>';
    categories.forEach(function (cat) {
      chips += '<button class="mb-chip" type="button" data-category="' + esc(cat) +
        '" aria-pressed="false">' + esc(cat) +
        '<span class="mb-chip-n">' + (counts[cat] || 0) + '</span></button>';
    });
    return chips;
  }

  /* ── Table of contents (shared .page-toc component), generated from the same
     entries the cards render from, grouped by category in first-seen order.
     Groups follow the active filter chip (whole group shows/hides — the filter
     axis IS the grouping axis), mirroring the VMSS law-polling TOC. ── */
  function tocLabel(m) {
    if (m.question) return m.question;
    var t = (m.claims && m.claims[0] && m.claims[0].text) || '';
    if (t.length > 72) t = t.slice(0, 69).replace(/\s+\S*$/, '') + '…';
    return t || m.id;
  }

  function tocGroupsHTML(list) {
    var byCat = {}, cats = [];
    list.forEach(function (m) {
      var c = m.category || 'Uncategorized';
      if (!byCat[c]) { byCat[c] = []; cats.push(c); }
      byCat[c].push(m);
    });
    return cats.map(function (cat) {
      var links = byCat[cat].map(function (m) {
        var num = String(m.id || '').replace(/^M-TBD-/, '');
        return '<a class="toc-entry" href="#' + esc(m.id) + '">' +
          '<span class="toc-num">' + esc(num) + '</span> ' + esc(tocLabel(m)) + '</a>';
      }).join('');
      return '<div class="toc-group" data-category="' + esc(cat) + '">' +
        '<div class="toc-group-label">' + esc(cat) +
          '<span class="toc-count">' + byCat[cat].length + '</span></div>' +
        links +
      '</div>';
    }).join('');
  }

  function setFilterCount(shown, total) {
    var el = document.getElementById('mb-filter-count');
    if (!el) return;
    el.textContent = shown === total
      ? 'Showing all ' + total + ' entries'
      : 'Showing ' + shown + ' of ' + total + ' entries';
  }

  /* ── Preview mode ("the docket"): show gate-FAILED entries for grading, but
     ONLY on localhost with ?preview=1. On the live site this is inert, and a
     normal load (no param) is unaffected. Kept a PURE function of its args (not
     of globals) so the localhost/param guard is directly unit-testable. ── */
  function computePreview(hostname, search) {
    var local = hostname === 'localhost' || hostname === '127.0.0.1';
    var requested = /(?:[?&])preview=1(?:&|$)/.test(search || '');
    return local && requested;
  }

  /* ── Preview mode adds one line to the standing notice. Idempotent. ── */
  function markPreviewNotice() {
    var notice = document.querySelector('.mb-notice');
    if (!notice || notice.querySelector('.mb-notice-preview')) return;
    var body = notice.querySelector('div') || notice;
    var line = document.createElement('div');
    line.className = 'mb-notice-preview';
    line.innerHTML = '<strong>Preview mode:</strong> ungraded entries shown on the docket.';
    body.appendChild(line);
  }

  /* ── Main render ── */
  function render(list, opts) {
    opts = opts || {};
    var mountId = opts.mount || 'mb-list';
    var filtersId = opts.filters || 'mb-filters';
    var preview = !!opts.preview;
    var mount = document.getElementById(mountId);
    if (!mount) return;

    var rendered = [];
    var docket = [];        // gate-FAILED entries; rendered (after real cards) in preview mode only
    var seen = new Set();
    (Array.isArray(list) ? list : []).forEach(function (entry) {
      var problems = validate(entry, seen);
      if (problems.length) {
        console.warn('[mythbuster] Skipped entry ' + (entry && entry.id ? '"' + entry.id + '"' : '(no id)') +
          ' — ' + problems.join(', ') + '. No unsourced/incomplete ruling renders.', entry);
        if (preview && entry && typeof entry === 'object') docket.push(entry);   // preview: keep for the docket; the gate itself is untouched
        return;
      }
      // Soft check: a multi-claim question should carry a question line (still renders).
      if (entry.claims.length > 1 && !entry.question) {
        console.warn('[mythbuster] Entry "' + entry.id + '" has ' + entry.claims.length +
          ' claims but no question — rendering without a visible question heading.');
      }
      seen.add(entry.id);        // mark id as taken only after the entry passes the gate
      rendered.push(entry);
    });

    // Gate-passing cards first, then (preview only) the docket cards after them.
    var cards = rendered.map(cardHTML).join('') +
      (preview ? docket.map(docketCardHTML).join('') : '');
    mount.innerHTML = cards || '<p class="mb-empty">No entries passed the render gate.</p>';

    // Chips (unique categories, first-seen order), TOC, count line, and header
    // hint all draw from the same source — gate-passers only on a normal load;
    // preview folds the docket in, so Jason can filter/jump while grading.
    var deckSource = preview ? rendered.concat(docket) : rendered;
    var catCounts = {}, cats = [];
    deckSource.forEach(function (m) {
      if (!m.category) return;
      if (!catCounts[m.category]) { catCounts[m.category] = 0; cats.push(m.category); }
      catCounts[m.category]++;
    });

    var filters = document.getElementById(filtersId);
    if (filters) filters.innerHTML = chipsHTML(cats, catCounts, deckSource.length);

    var tocMount = document.getElementById('mb-toc-groups');
    if (tocMount) tocMount.innerHTML = tocGroupsHTML(deckSource);

    var hint = document.getElementById('mb-toc-hint');
    if (hint) hint.textContent = deckSource.length + ' entries · ' + cats.length + ' categories';

    setFilterCount(deckSource.length, deckSource.length);

    return rendered.length;
  }

  /* ── Interactions (event delegation — survives re-render) ── */
  function wire() {
    var filters = document.getElementById('mb-filters');
    var list = document.getElementById('mb-list');

    if (filters) {
      filters.addEventListener('click', function (e) {
        var chip = e.target.closest('.mb-chip');
        if (!chip) return;
        var cat = chip.dataset.category;
        filters.querySelectorAll('.mb-chip').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var shown = 0, total = 0;
        list.querySelectorAll('.mb-card').forEach(function (card) {
          var show = cat === 'all' || card.dataset.category === cat;
          card.classList.toggle('is-hidden', !show);
          total++;
          if (show) shown++;
        });
        setFilterCount(shown, total);
        // The TOC follows the active filter (group axis = filter axis).
        document.querySelectorAll('#mb-toc-groups .toc-group').forEach(function (g) {
          g.style.display = (cat === 'all' || g.dataset.category === cat) ? '' : 'none';
        });
      });
    }

    if (list) {
      list.addEventListener('click', function (e) {
        var btn = e.target.closest('.mb-sources-toggle');
        if (!btn) return;
        var sources = btn.closest('.mb-sources');
        var open = sources.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  /* ── Deep-link scroll: cards render client-side, so a browser arriving at
     mythbuster.html#M-TBD-6 tries to scroll BEFORE the anchor exists and lands
     at the top. After render, re-resolve the hash and scroll the card into view
     ourselves (CSS scroll-margin-top keeps it clear of the sticky nav). Only
     acts on our own #M-TBD-* ids so it never fights other on-page anchors. ── */
  function scrollToHashCard() {
    var id = (location.hash || '').slice(1);
    if (!/^M-TBD-/.test(id)) return;
    var el = document.getElementById(id);
    if (el) el.scrollIntoView();
  }

  function init() {
    var preview = computePreview(location.hostname, location.search);
    if (preview) markPreviewNotice();
    render(ENTRIES, { preview: preview });
    wire();
    scrollToHashCard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposed for verification/testing (e.g. feeding a malformed entry to prove the
  // gate, or checking the preview guard without a real localhost/param).
  window.Mythbuster = { data: ENTRIES, render: render, validate: validate, computePreview: computePreview };
})();
