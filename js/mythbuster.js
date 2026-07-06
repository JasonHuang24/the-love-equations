/* ── The Mythbuster — data + render system ──
 *
 * PROOF OF CONCEPT. Every entry in ENTRIES below is a DRAFT placeholder:
 * plausible in shape, but NOT canon. Jason will replace all content.
 *
 * Architecture:
 *   - The atomic unit is a QUESTION with 1..N competing claims. A single-claim
 *     card is just the N=1 case of the SAME schema and render path — there is
 *     one card type, one render function. No per-card HTML.
 *   - Each claim carries its own verdict; the entry's `ruling` holds the
 *     data-backed conclusion, its evidence tier, and its sources.
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

  /* ── Data: 9 graded DRAFT entries (M-TBD-1/2/5/6/7/8 extractions + Fable-authored
     M-TBD-9/10/11 — valid verdicts + sourced rulings — render with DRAFT chips) plus
     the ungraded docket (verdict/tier 'todo', empty sources): M-TBD-3/4 from the
     original extractions and M-TBD-12..43 ported from gender-dynamics.html
     (2026-07-06). Docket entries intentionally FAIL the gate and log one console.warn
     each until Jason grades them. Rendered cards carry id="<entry id>" anchors so
     other pages can deep-link (statistics.html → mythbuster.html#M-TBD-6 etc.). ── */
  const ENTRIES = [
    {
      id: 'M-TBD-1',
      category: 'Signals',
      question: 'Is the extra-friendly barista flirting with you?',
      claims: [
        { camp: 'Ani',
          text: 'Complimenting a customer and keeping the conversation going is not standard barista behavior. Girls don\u2019t put in that kind of effort with customers unless they enjoy their company \u2014 she was most likely at least a little interested.',
          verdict: 'oversimplified' },
        { camp: 'Mika',
          text: 'Girls in customer-service jobs are trained to be chatty, and some are just naturally social. If she were actually flirting she\u2019d be flirting with dozens of guys every single day \u2014 real flirting is selective and treats you differently from everyone else.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Advantage Mika',
        text: 'Men systematically over-read warmth as romantic interest \u2014 the sexual overperception bias \u2014 and service-industry friendliness is occupational, which inflates the false-positive rate further. The discriminating cue is the one Mika names: differential treatment and effort to extend the interaction, not baseline warmth.',
        tier: 'hard-data',
        sources: [
          { label: 'Sexual overperception bias \u2014 emotion projection & desire study (2021, replicating the bias)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8416843/' },
          { label: 'Hall, Xing & Brooks (2014), Communication Research \u2014 flirting detection accuracy and base rates', url: 'https://journals.sagepub.com/doi/10.1177/0093650214534972' },
        ],
        researchNotes: 'Ani regraded from the earlier proposed Backwards to Oversimplified: Hall shows real flirting is also frequently MISSED, so \u201cyou\u2019re missing signals\u201d has partial support \u2014 her error is ignoring base rates in occupational-warmth contexts, not inverting reality.',
      },
      related: [ { label: 'Rules & Frameworks', href: 'frameworks.html' } ],
      draft: true,
    },
    {
      id: 'M-TBD-2',
      category: 'Signals',
      question: 'How obvious are women when they\u2019re actually interested?',
      claims: [
        { camp: 'Ani',
          text: 'Most girls will give you signals and wait to see if you do something. They\u2019re not going to risk rejection by being super obvious \u2014 listen to what they do, not what they say.',
          verdict: 'oversimplified' },
        { camp: 'Mika',
          text: 'Most girls who are actually interested give multiple hints that are pretty obvious if you\u2019re paying attention \u2014 laughing at unfunny jokes, staying in the conversation longer than needed, personal questions. If she\u2019s truly interested she doesn\u2019t make it nearly that hard.',
          verdict: 'oversimplified' },
      ],
      ruling: {
        badge: 'Both half right',
        text: 'Interested women do emit identifiable cues \u2014 the ones Mika lists are the documented ones \u2014 but detection is genuinely bad: in lab interactions, actual flirting was correctly recognized only about a third of the time, and observers did no better than participants. Signals exist and get missed at high rates. Each camp holds half the picture.',
        tier: 'hard-data',
        sources: [
          { label: 'Hall, Xing & Brooks (2014), Communication Research \u2014 two-study flirting detection design', url: 'https://journals.sagepub.com/doi/10.1177/0093650214534972' },
          { label: 'University of Kansas summary \u2014 detection rates (38% when flirting occurred; women\u2019s flirting read more accurately)', url: 'https://news.ku.edu/2014/06/03/flirting-hard-detect-study-finds' },
        ],
      },
      related: [ { label: 'Lexicon', href: 'lexicon.html' } ],
      draft: true,
    },
    {
      id: 'M-TBD-3',
      category: 'Approach',
      question: 'If you take rejection gracefully, does shooting your shot cost you anything?',
      claims: [
        { camp: 'Ani',
          text: 'Girls don\u2019t give guys a bad reputation for politely asking for a number when the vibe is good. Bad reputations come from being pushy, entitled, or bitter after rejection \u2014 most girls respect a guy who makes a clean move and takes no well.',
          verdict: 'todo' },
        { camp: 'Mika',
          text: 'Perception matters more than how nicely you take the rejection. If she never gave real signals, your advance is unwanted attention no matter how polite it is \u2014 and repeatedly misreading friendliness as flirting damages your reputation, because girls talk.',
          verdict: 'todo' },
      ],
      ruling: {
        badge: 'TODO',
        text: 'TODO',
        tier: 'todo',
        sources: [],
        researchNotes: 'Thin direct literature \u2014 may cap at evidence tier or fail sourcing. Possible angles: unwanted-pursuit perception studies, workplace romance policy research, receptivity-to-approach studies. Flag honestly if it cannot clear the gate.',
      },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-4',
      category: 'Definitions',
      question: 'What counts as a crush?',
      claims: [
        { camp: 'Ani',
          text: '[REPORTED \u2014 needs primary quote from the original Ani session; this wording is Jason\u2019s summary] Anyone who thinks anything positive of you \u2014 finds you cute, laughs at your jokes, has you on their mind \u2014 has a crush.',
          verdict: 'todo' },
        { camp: 'Mika',
          text: 'A crush is romantic interest with emotional investment \u2014 someone excited or nervous to be around you who wants your attention. Finding someone cute or enjoying their company is basic attraction, not a crush.',
          verdict: 'todo' },
      ],
      ruling: {
        badge: 'TODO',
        text: 'TODO',
        tier: 'todo',
        sources: [],
        researchNotes: 'Natural definitional-tier entry. Possible anchors: psychology of limerence (Tennov), infatuation vs. attraction constructs, dictionary/APA definitions. Do not publish the Ani claim without her primary quote.',
      },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-5',
      category: 'Approach',
      question: 'Does cold-approaching women in everyday places actually work?',
      claims: [
        { camp: 'Ani',
          text: 'Average guys who consistently shoot their shot on any sensed interest get rejected a lot but also get far more yeses than the overthinkers \u2014 many girls are open to dating and just don\u2019t want to be the one who initiates. The bold guy wins more often than people admit.',
          verdict: 'oversimplified' },
        { camp: 'Mika',
          text: 'The polite refusal wins by a huge margin \u2014 cold flirting in public has a very low success rate, and the numbers game burns confidence and reputation. High-quality contexts (apps, social circles, hobbies) beat high-quantity approaches.',
          verdict: 'confirmed' },
      ],
      ruling: {
        badge: 'Advantage Mika',
        text: 'Where couples actually form: friends, family, coworkers, school and \u2014 now the leading channel \u2014 online dating account for the bulk of matches; meeting cold in a public place is a small and shrinking share. Initiative matters within a context, but as a strategy, venue beats volume.',
        tier: 'hard-data',
        sources: [
          { label: 'Rosenfeld, Thomas & Hausen (2019), PNAS 116(36):17753\u201317758 \u2014 Disintermediating your friends [PIN pnas.org/DOI link \u2014 10-second lookup]', url: '' },
          { label: 'HCMST 2017-based analysis of meeting channels (friends vs. internet vs. other)', url: 'https://arxiv.org/pdf/2111.03825' },
        ],
        researchNotes: 'PNAS citation triple-confirmed via citing papers; direct pnas.org URL not captured this pass \u2014 the one remaining empty URL in the dataset.',
      },
      related: [ { label: 'Statistics', href: 'statistics.html' } ],
      draft: true,
    },
    {
      id: 'M-TBD-6',
      category: 'Dating',
      question: 'Do women prefer the guy who takes it slow and waits to make a move?',
      claims: [
        { camp: 'Mika',
          text: 'Those stories are extremely rare \u2014 usually she was already strongly attracted, or she friend-zoned the slow guy and is retelling it kindly. For every girl who liked that he waited, hundreds lost interest because he never tried. For average guys, waiting too long is usually a death sentence.',
          verdict: 'oversimplified' },
      ],
      ruling: {
        badge: 'It depends',
        text: 'On long-term outcomes the claim inverts: among 2,035 married individuals, later sexual timing predicted better communication, satisfaction, perceived stability, and sexual quality \u2014 controlling for religiosity, education, partner count, and relationship length. Decisiveness may help short-term attraction, but \u201cdeath sentence\u201d depends entirely on which finish line you\u2019re measuring.',
        tier: 'evidence',
        sources: [
          { label: 'Busby, Carroll & Willoughby (2010), J. of Family Psychology \u2014 Compatibility or restraint? Sexual timing and marriage outcomes', url: 'https://scholarsarchive.byu.edu/facpub/4349/' },
        ],
      },
      related: [ { label: 'Rules & Frameworks', href: 'frameworks.html' } ],
      draft: true,
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
      draft: true,
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
      draft: true,
    },

    /* ── Fable-authored entries from the design mockups ──
     * Unlike the Ani/Mika extractions above, these are FULLY FILLED: claims,
     * proposed verdicts, ruling text, and VERIFIED sources (checked 2026-07-06).
     * They will pass the render gate and display with DRAFT chips. Verdicts and
     * ruling copy are Claude-proposed — Jason ratifies or regrades, then strips
     * the draft flag. */
    {
      id: 'M-TBD-9',
      category: 'Attraction',
      claims: [
        { camp: '', text: 'Opposites attract.', verdict: 'oversimplified' },
      ],
      ruling: {
        badge: 'Oversimplified',
        text: 'Similarity \u2014 actual and perceived \u2014 strongly predicts attraction: r = .47 and .39 across 313 studies. One wrinkle: in established relationships it is perceived similarity that carries the effect, not measured similarity. Evidence for complementarity (\u201copposites\u201d) is weak and trait-specific.',
        tier: 'hard-data',
        sources: [
          { label: 'Montoya, Horton & Kirchner (2008), J. of Social and Personal Relationships \u2014 meta-analysis, 313 studies', url: 'https://journals.sagepub.com/doi/10.1177/0265407508096700' },
        ],
        researchNotes: 'Verified. The stability half of the original mockup claim was trimmed \u2014 Montoya covers attraction, not longitudinal stability; add a homogamy/marital-quality source if the ruling should speak to stability.',
      },
      related: [],
      draft: true,
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
      draft: true,
    },
    {
      id: 'M-TBD-11',
      category: 'Attraction',
      question: 'Who cares more about looks?',
      claims: [
        { camp: 'The classic',
          text: 'Men are visual. Women barely care about looks at all.',
          verdict: 'false' },
        { camp: 'The leveler',
          text: 'Everyone weighs looks the same. The gap is a myth.',
          verdict: 'oversimplified' },
      ],
      ruling: {
        badge: 'Both wrong',
        text: 'In stated preferences the traditional gap is real and replicated: men rate looks as more important, women rate earning prospects higher. But in live speed-dating behavior the sex differences disappear \u2014 both sexes\u2019 actual romantic interest tracked partners\u2019 attractiveness about equally. The stated gap exists; the behavioral gap is a fraction of what either camp believes.',
        tier: 'hard-data',
        sources: [
          { label: 'Eastwick & Finkel (2008), J. of Personality and Social Psychology \u2014 speed-dating, stated vs. revealed preferences', url: 'https://pubmed.ncbi.nlm.nih.gov/18211175/' },
        ],
        researchNotes: 'E&F 2008 verified; a 2015 direct replication reached consistent results. NOTE: \u201cThe classic\u201d regraded from the mockup\u2019s Backwards to False \u2014 the direction of the stated difference is real, so the claim isn\u2019t inverted, just wrong in magnitude. \u201cThe leveler\u201d is closest to right on revealed preferences and could arguably land higher \u2014 Jason\u2019s call. Eastwick et al. (2014) meta-analysis source removed this pass (empty URL, unverified) \u2014 E&F 2008 carries the ruling alone.',
      },
      related: [],
      draft: true,
    },

    /* ── Gender Dynamics ports (2026-07-06) ──
     * Mechanical extractions from gender-dynamics.html — claims are the source
     * cards' own words, lightly trimmed; NOTHING here is graded. Every entry
     * carries verdict/tier 'todo' + empty sources, so all of them FAIL the render
     * gate by design and appear only on the ?preview=1 docket until Jason grades
     * them. sourcePage/sourceCard preserve provenance (gate-ignored fields). */
    {
      id: 'M-TBD-12',
      category: 'Approach',
      question: 'Does being direct about wanting sex get a man rejected where the indirect route succeeds?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Why being direct gets you shut down',
      claims: [
        { camp: '',
          text: 'A guy who just says "wanna have sex" gets shut down immediately, but a guy who goes on three pretend dates gets it. Same goal, opposite outcome. The market rewards the guy willing to play the long game \u2014 the pretend dates, the slow-built vibe, the gradual escalation over multiple conversations \u2014 and punishes the guy who\'s honest about what he wants up front. So it ends up rewarding indirect communicators and punishing direct ones.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-14',
      category: 'Attraction',
      question: 'Do women reward the same player behavior they complain about?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Complaining about the guys you reward',
      claims: [
        { camp: '',
          text: 'A lot of the same people who complain loudest about fuckboys and players are the ones who keep rewarding that behavior and rejecting the honest guys. They author the outcome they complain about.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-16',
      category: 'Attraction',
      question: 'When women say they want an honest guy, is that the real preference?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"I want an honest guy" is branding',
      claims: [
        { camp: '',
          text: '"I want a guy with game" sounds shallow and a little manipulative, while "I want an honest guy" makes you look like you have good values. So people keep saying the thing that makes them look good, even when it isn\'t what they actually respond to. It\'s branding. What someone says they want and what they actually chase are two different data sets \u2014 and the second one is the one that predicts behavior.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-17',
      category: 'Market',
      question: 'Are men checking out of dating?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Guys are checking out',
      claims: [
        { camp: '',
          text: 'A lot of guys just say "fuck this" and check out entirely. Some go monk mode and pour everything into money and themselves; others swallow their pride and learn to become players too. For the ones who only ever wanted to be decent and honest, it really is a raw deal, and a lot of them are losing hope.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-18',
      category: 'Attraction',
      question: 'Does arrogance attract, even when women say they can\'t stand it?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The arrogant-guy paradox',
      claims: [
        { camp: '',
          text: 'That mix of confidence and game is magnetic to a lot of women \u2014 even when the guy is genuinely a dick or full of it. So the very traits women say they can\'t stand \u2014 arrogance, being full of yourself \u2014 are often the ones that get rewarded most.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-19',
      category: 'Attraction',
      question: 'Does charisma make red flags disappear?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Charisma overrides red flags',
      claims: [
        { camp: '',
          text: 'Women will ignore massive red flags if the guy has enough charisma and confidence. They convince themselves "he\'ll change for me" or "I\'m different," then act shocked when the guy who slept with 300 women behaves exactly like a guy who slept with 300 women.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-20',
      category: 'Attraction',
      question: 'Does being wanted by other women make a man more attractive?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Preselection: nothing attracts women like other women',
      claims: [
        { camp: '',
          text: 'Women are drawn to men who other women visibly want. Seeing that you have options \u2014 that you\'re genuinely chosen and pursued \u2014 spikes interest, because it triggers competition and the instinct that "if all these women want him, there must be something good here." This is why a female friend vouching for you does almost nothing, while visibly having women chase you does a lot: one reads as safe, the other as desirable.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-21',
      category: 'Standards',
      question: 'Is a high body count judged the same on men and women?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The body-count double standard',
      claims: [
        { camp: '',
          text: 'A woman with a high body count is widely read as a red flag \u2014 impulsive, low-value, maybe not loyal. A man with a high body count often reads the other way: a lot of women see it as high value, because "if that many women wanted him, he must have something." It\'s preselection again \u2014 her history signals risk, his signals demand.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-22',
      category: 'Attraction',
      question: 'Do objectification complaints depend on who is doing the objectifying?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Stop sexualizing me" is selective',
      claims: [
        { camp: '',
          text: '"Stop sexualizing me \u2014 just treat me like a human." It sounds like a principle, but watch when it actually gets deployed: almost always toward men they\'re not attracted to. The same women are usually fine \u2014 happy, even \u2014 being sexualized by the men they do find attractive. The same exact behavior reads as "hot" from a man she wants and "creepy \u2014 why can\'t you just treat me like a human?" from one she doesn\'t.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-23',
      category: 'Attraction',
      question: 'Do men and women desire celebrities differently?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The celebrity-crush asymmetry',
      claims: [
        { camp: '',
          text: 'When a man likes a female celebrity, it\'s mostly physical and contained \u2014 "she\'s gorgeous," and that\'s about it. When a woman likes a male celebrity, it far more often turns into something intense and emotional \u2014 fan edits, paragraphs, jealousy when he dates someone real, a full parasocial fantasy of actually being with him: "he\'s my husband, he\'s the standard, no real man compares." Male desire tends to run physical and bounded; female desire tends to run emotional, narrative, and fantasy-driven.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-24',
      category: 'Attraction',
      question: 'Does personality matter most \u2014 or do looks decide who even gets considered?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"Personality matters most" is mostly marketing',
      claims: [
        { camp: '',
          text: 'On the apps, most women swipe left on the large majority of men based almost entirely on looks. Personality only gets a turn once she\'s already physically attracted to you. So the "average guy with a great personality" usually can\'t just get girls \u2014 he has to clear the looks filter first, and for most average guys that filter is brutal. "Personality is the most important thing" is largely marketing.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-25',
      category: 'Standards',
      question: 'Is height the one looks preference women state openly?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Height: the one looks preference women own',
      claims: [
        { camp: '',
          text: 'Somewhere along the way it became socially acceptable \u2014 even trendy \u2014 to state it outright, so women own it with zero shame: "6ft minimum," right there in the bio, on TikTok, in interviews, almost worn as a personality trait. Height is the one physical preference women will openly admit to caring about. Every other looks-based filter \u2014 baldness, weight, face, even income preferences \u2014 usually gets hidden behind a more respectable excuse.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-26',
      category: 'Psychology',
      question: 'Whose approval actually drives women\'s choices \u2014 men\'s or other women\'s?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Women care more what other women think',
      claims: [
        { camp: '',
          text: 'Women generally care far more about what other women think than what men think. Take OnlyFans \u2014 most men say plainly they\'d never seriously date a woman who does it, yet it stays popular. Why? Because her female social circle supports it, stays neutral, or at least doesn\'t shame her for it. Male disapproval is loud and consistent, but it loses to the approval of her peers almost every time.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-27',
      category: 'Psychology',
      question: 'Do women move with social consensus more than men?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'The female hive mind',
      claims: [
        { camp: '',
          text: 'Women tend to operate far more as a hive mind than most people want to admit \u2014 much more sensitive to social consensus, trends, and what other women are doing and saying. If one popular woman declares something attractive (or a red flag, or a new rule), a huge share start repeating it, and it spreads like wildfire \u2014 the "6ft minimum," "never split the bill," "the bar is in hell." Men hold more individual, idiosyncratic opinions, even unpopular ones; women tend to move together.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-28',
      category: 'Attraction',
      question: 'When women say they want to feel safe, is that what they choose?',
      sourcePage: 'gender-dynamics',
      sourceCard: '"I just want to feel safe" is usually just talk',
      claims: [
        { camp: '',
          text: '"I just want to feel safe" sounds reasonable, but a lot of the time it\'s pretty words. Watch the actions: the same women who say they want a safe guy are often chasing the exciting, unpredictable, slightly dangerous one who gives them butterflies. They say safety; they go for chaos. What they actually want is a guy who makes them feel safe and excited \u2014 very few want a genuinely stable, low-drama guy if he\'s also boring.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-31',
      category: 'Market',
      question: 'Did dating apps lock the bottom two-thirds of men out of the market?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Winner-take-most: the dating market\'s "Pareto problem"',
      claims: [
        { camp: '',
          text: 'Dating apps turned mating into a winner-take-most market \u2014 the top sliver of men get a flood of options while the bottom 60\u201370% get filtered out and "locked out" of dating entirely, a Pareto / 80\u201320 distribution.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
        { camp: 'Blackpill',
          text: 'It\'s not about game at all, it\'s about looks, height, jawline, and frame. Many decided the game was rigged before they ever stepped on the field.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
        { camp: 'The blackpill',
          text: 'It\'s not guaranteed for everyone \u2014 therefore it\'s hopeless for me specifically.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
    },
    {
      id: 'M-TBD-38',
      category: 'Standards',
      question: 'Do stated standards survive when someone desirable actually shows up?',
      sourcePage: 'gender-dynamics',
      sourceCard: 'Principles are cheap when untested',
      claims: [
        { camp: '',
          text: 'The standards that genuinely hold when an attractive, in-demand person actually shows interest are far fewer than the ones stated when nobody desirable is around. For a lot of people those principles quietly evaporate the moment someone they really want \u2014 someone with options \u2014 is the one pursuing them. It runs both ways: women who swear off "fuckboys" until the hot one with options wants them, men who insist they\'re "not shallow" until a 10 shows interest.',
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
          verdict: 'todo' },
      ],
      ruling: { badge: 'TODO', text: 'TODO', tier: 'todo', sources: [] },
      related: [],
      draft: true,
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
    }
    return problems;
  }

  /* ── One claim (camp + verdict chip on a line, then the quotation) ── */
  function claimHTML(c) {
    const camp = c.camp ? '<span class="mb-camp">' + esc(c.camp) + '</span>' : '';
    return '<div class="mb-claim">' +
        '<div class="mb-claim-head">' + camp +
          '<span class="mb-verdict ' + esc(c.verdict) + '">' + esc(VERDICTS[c.verdict].label) + '</span>' +
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

  /* ── Card HTML for one (already-validated) entry ── */
  function cardHTML(m) {
    const claims = m.claims;
    const n = claims.length;
    const r = m.ruling;
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

        // Body: claims (left/top) | ruling (right/bottom), split by a hairline
        '<div class="mb-body">' +
          '<div class="mb-col mb-claims">' + claims.map(claimHTML).join('') + '</div>' +
          '<div class="mb-col mb-ruling">' +
            // Label (left) + verdict badge (right) share one row.
            '<div class="mb-ruling-head">' +
              '<div class="mb-col-label mb-ruling-label">The ruling</div>' +
              '<div class="mb-ruling-badge">' + esc(r.badge) + '</div>' +
            '</div>' +
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

  /* ── Filter chips auto-generated from categories present in the data ── */
  function chipsHTML(categories) {
    var chips = '<button class="mb-chip active" type="button" data-category="all" aria-pressed="true">All</button>';
    categories.forEach(function (cat) {
      chips += '<button class="mb-chip" type="button" data-category="' + esc(cat) +
        '" aria-pressed="false">' + esc(cat) + '</button>';
    });
    return chips;
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

    // Chips — unique categories, first-seen order. Normal: from gate-passers only.
    // Preview: also fold in docket categories so Jason can filter while grading.
    var filters = document.getElementById(filtersId);
    if (filters) {
      var catSeen = {}, cats = [];
      var chipSource = preview ? rendered.concat(docket) : rendered;
      chipSource.forEach(function (m) {
        if (m.category && !catSeen[m.category]) { catSeen[m.category] = true; cats.push(m.category); }
      });
      filters.innerHTML = chipsHTML(cats);
    }

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
        list.querySelectorAll('.mb-card').forEach(function (card) {
          var show = cat === 'all' || card.dataset.category === cat;
          card.classList.toggle('is-hidden', !show);
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

  function init() {
    var preview = computePreview(location.hostname, location.search);
    if (preview) markPreviewNotice();
    render(ENTRIES, { preview: preview });
    wire();
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
