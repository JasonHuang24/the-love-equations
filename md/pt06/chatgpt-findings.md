# PT06 ChatGPT scout findings

**Run date:** 2026-08-06
**Role:** Scout/drafter; lanes A–D; raw source text and analyzer captures remain outside the repository.
**Provenance caveat:** Canon may change during this parallel run. Every percentage below belongs to the named per-capture canon version.

## Cycle 1 — lane B: AI-assisted dating

**Source:** [The Guardian — “AI ‘wingmen’ bots to write profiles and flirt on dating apps”](https://www.theguardian.com/lifeandstyle/2025/mar/08/ai-wingmen-bots-to-write-profiles-and-flirt-on-dating-apps)  
**Capture:** 919 words · SHA-256 `7e9c4990ed3272b5073fe21581aa54b2b908f584780892685e8b370e90c181bb` · canon `1.0.0+608b9220122a` (563 concepts) · 20 claim-like passages · 3 mapped · **15.0% mapped** · 0 tensions.  
**Extraction:** Guardian `data-gu-name="body"` container; dropped `<figure>`; cut before the terminal `data-print-layout="hide"` topic rail.

**Verdict: gap.** The article’s encompassing mechanism is delegated courtship: a human or machine intermediary can help present, screen, and converse for a seeker, while the counterpart may reasonably infer that the displayed voice and ability belong to the seeker. The current canon prices search cost, meeting channels, app incentives, charm, and generic third-party effects, but has no entry for agency/authorship transfer during courtship.

Reviewer judgment:

- The two mappings to **Charm** (both 0.540) are topic-adjacent, not ownership of the claims. One concerns live-skill atrophy after AI-authored chat; the other bundles alleged social harms.
- “Dating apps are very similar to social media” mapped to **Do most couples meet on dating apps now?** (0.436); this is a false positive.
- Core unmapped rows include AI writing profiles/messages, authentication and trust, performance homogenisation, and a bot swiping/chatting with 5,000 women on one user’s behalf.
- Secondary instrument finding: the domain gate discarded explicit rows about AI-authored messaging, trust in counterpart authenticity, live-date anxiety, and the bot-mediated engagement despite clear courtship context.
- The article supplies allegations, product plans, and one anecdote rather than outcome evidence. Its 4.9m/60.5m/three-quarters figures are unneeded for doctrine and were not promoted.

**Proposal routing:** candidate P1, to be drafted after a lane-A human-intermediary source tests whether one mechanism encompasses both forms of delegation.



## Cycle 2 — lane A: paid human intermediaries

**Source:** [CBS News — “Swiping on dating apps has turned into a career for some”](https://www.cbsnews.com/news/turning-love-into-a-career/)  
**Capture:** 1,191 words · SHA-256 `b18f7faf5a3e8d04a071998b64e1b0e67a3ce1bcb9be1dc85dd4544debec4365` · canon `1.0.0+608b9220122a` (563 concepts) · 18 claim-like passages · 4 mapped · **22.2% mapped** · 0 tensions.  
**Extraction:** CBS `<section class="content__body">`; dropped the “Unique jobs” preamble, ad wrappers, and figures; cut before `content__body--footer` and recirculation.

**Verdict: gap.** Human dating assistants already perform the same agency transfer the AI article anticipates: profile authorship, candidate selection, swiping, and message exchange in another person’s voice. This confirms that the encompassing subject is delegated courtship rather than AI dating.

Reviewer judgment:

- **The Meeting Channel** (0.511) for a worker logging into apps is a wrong-owner mapping; the sentence describes employment, not how the worker personally meets partners.
- **Online displaced everyone else** (0.449) attached to finding a writer through Craigslist, another false positive.
- **The Market** (0.540) is defensible only for the article’s industry-size estimate, not the delegation mechanism. **Physical attractiveness** (0.540) correctly catches one narrow sentence about evaluating prospects for a client.
- The domain gate discarded 38 passages / 740 words, including the clearest rows: ghostwriters “write messages to prospects in the voice” of clients, imitate clients after intake interviews, maintain profile continuity, and select from client preferences. This is a repeatable instrument finding, not an extraction problem.
- Marketdata’s `$1.2–$1.5bn` estimate and company-reported staffing/client counts are deliberately excluded from doctrine: they are commercial estimates or unverified self-report and do not establish prevalence, efficacy, or harm.

## Proposal P1 — The Delegation Boundary

**Subject and parent:** **The Delegation Boundary**, proposed as a sub-entry under **The Third-Party Layer** (`frameworks:third-party-layer`). Courtship assistance transfers different amounts of agency: feedback leaves the seeker authoring and deciding; co-authorship shares presentation; substitution lets a proxy present, screen, select, or converse as the seeker. The governing question is what the counterpart is reasonably led to attribute to the person they may meet.

**Sourced, tiered claims:**

1. **Tier 2 — exploratory qualitative evidence:** Rochadiat, Tong, Hancock & Stuart-Ulin (2020), *Social Media + Society*, interviewed six online-dating assistants at one pseudonymous firm. The workflow separated profile writing, candidate screening, and proxy messaging; most workers remained invisible to unsuspecting counterpart daters. [DOI / open paper](https://doi.org/10.1177/2056305120957290)
2. **Tier 3 — documented commercial practice:** CBS observed a human service selling profile creation, swiping, screening, and messages composed in a client’s voice. This documents the practice, not its prevalence, efficacy, or relationship outcomes. [CBS source](https://www.cbsnews.com/news/turning-love-into-a-career/)
3. **Tier 3 — emerging product/discourse evidence:** The Guardian documented planned AI profile, photograph, coaching, and messaging functions; AP distinguished feedback from substitution; a later Guardian report documented live agentic selection and coaching. These are product practice, guidance, and forecasts, not measured harms. [Guardian plans](https://www.theguardian.com/lifeandstyle/2025/mar/08/ai-wingmen-bots-to-write-profiles-and-flirt-on-dating-apps) [AP guidance](https://apnews.com/article/3c612af2284e85860927d95998750829) [Guardian agentic practice](https://www.theguardian.com/technology/2026/feb/15/ai-dating-apps-personality-matchmaking)

**LE Lens mechanism synthesis:** Evaluate delegation by the decision transferred, the representation the counterpart receives, and whether the assisted performance survives direct interaction. The mechanism applies equally to friends, paid professionals, and software; medium alone does not settle it.



**Candidate aliases:** `Delegation Boundary`; `delegated courtship`; `courtship delegation`; `dating labor outsourcing`; `relationship ghostwriting`; `authorship transfer`; `proxy messaging`; `romantic proxy`; `assisted self presentation`; `third party courtship`.

**Contract-compliant misreadings:**

- “A polished profile proves the seeker will communicate equally well with a partner.” (13 words)
- “Using any assistant makes every courtship deceptive from the first message onward.” (12 words)
- “An intermediary who finds a match can guarantee chemistry once the relationship moves offline.” (14 words)

**Boundaries:**

- Proofreading, accessibility support, advice, collaborative drafting, undisclosed impersonation, and autonomous selection transfer different decisions; the entry must keep them separate.
- Platform ranking, seeker-set filters, and shortlists the seeker still reviews remain Meeting Channel mechanics; delegation increases when an assistant applies or invents preferences to accept, reject, or suppress candidates without the seeker’s review.
- Candidate sourcing, identity checks, date logistics, and coaching remain ordinary intermediary functions unless the intermediary starts authoring material self-presentation or exercising seeker judgment.
- The counterpart’s stake concerns material attribution of identity, preferences, judgment, and conversational ability. Tool identity alone does not determine that stake.
- Disclosure expectations may vary by stage, platform rules, culture, and the materiality of the delegated act.
- Existing evidence is descriptive and qualitative. It supplies no population prevalence, causal harm estimate, success rate, or ranking of human versus AI assistance.
- Accessibility uses require special care: assistance that enables a seeker to express their own intent is not equivalent to a proxy supplying the intent.

**Deliberate nonclaims:** This proposal does not ban coaching or assistive technology; label assisted seekers dishonest; guarantee that direct authorship is authentic; predict match, relationship, or safety outcomes; or treat a friend’s feedback as equivalent to concealed proxy conversation. No corpus-verifiable statistic is proposed.


## Cycle 3 — lane C: religion and dating

**Source:** [Associated Press — “From apps to matchmaking: the diverse ways some American Muslims navigate finding marriage partners”](https://apnews.com/article/f8ac6df523b8164fbcc31285ad33c824)  
**Capture:** 1,234 words · SHA-256 `da9bd1632420793d4102d28178d28f1669edafe7b472b0ffc191beb68f9854b4` · canon `1.0.0+608b9220122a` (563 concepts) · 28 claim-like passages · 1 mapped · **3.6% mapped** · 0 tensions.  
**Extraction:** AP `RichTextStoryBody RichTextBody` container; dropped advertising, related-story, HTML-embed, and figure blocks; cut at the `<p>___` funding-footer delimiter.

**Verdict: instrument finding — no doctrine needed.** Human decomposition finds current canon owners for almost the entire article:

- **The Meeting Channel** owns apps, family/friend introductions, mosque volunteering, singles events, and professional matchmakers as differently screened routes.
- **The Local Market** plus the **Effective Sex Ratio** own a small, geographically dispersed co-religionist pool and the resulting long-distance pressure.
- **The Third-Party Layer** owns family introductions, parental cultural vetoes, mosque intermediaries, chaperones, and network accountability.
- **Shared values & lifestyle**, **Opposites attract**, and the filter logic already stated in **The Ideological Filter** own religion/observance as a multidimensional compatibility screen.
- **The Interaction Gate** and existing agreement/boundary doctrine own intentional public courtship without premarital intimacy. The source-specific “halal-haram ratio” and “Rules of Three” are a reality show’s branded instruments, not doctrine.

Reviewer judgment:

- The only displayed mapping sent “try a long-distance relationship” to **She’s flirting with you in front of her boyfriend — what does it mean?** (0.503). It is a clear false positive.
- The gate discarded the article’s cleanest in-domain rows: meeting through family/friends/college/work; a small Muslim pool; co-religionists “few and far between”; differing practice intensity; discussing compatibility without intimacy; family consultation; and matchmaking through a mosque.
- The 3.6% mapped figure therefore measures retrieval/gate failure, not doctrine absence. Adding a faith-specific framework would duplicate existing channel, pool, filter, values, and third-party mechanisms.
- AP’s 60% religiosity figure is deliberately unused; no corpus-verifiable statistic enters a proposal.

**Proposal routing:** none. A future authored-surface or engine task may test concept-naming phrases for religious practice compatibility, but this run should not create a duplicate “Faith Filter.”


## Cycle 4 — lane D: cross-border and international dating discourse

**Source:** [The Guardian — “Mail-order brides: old practice still seen as new chance for a better life — for some”](https://www.theguardian.com/lifeandstyle/2016/jan/11/mail-order-marriage-brides-ukraine-america-romance)  
**Capture:** 1,379 words · SHA-256 `cdf8c27ae3cc9e932208910d20e335727fc75da90d2caca2702a42a0633d8558` · canon `1.0.0+79158e0f6247` (564 concepts) · 28 claim-like passages · 3 mapped · **10.7% mapped** · 0 tensions.  
**Extraction:** Guardian `data-gu-name="body"` container; dropped figures; cut before the terminal `data-print-layout="hide"` topic rail.

**Verdict: gap.** Existing Local Market doctrine explains why someone searches outside a thin pool, but not what crossing jurisdictions bundles into the pairing: relocation, legal status, language access, work prospects, network loss, and unequal exit options. The article also shows why “economic motive” versus “real affection” is a false binary; the same relationship can carry intimacy, mobility, and material bargaining at once.

Reviewer judgment:

- “She saw the man who became her husband” mapped to **The fear of being ‘that guy’** (0.489), a false positive.
- “Her marriage is better now … because they can really talk” mapped to **The Commitment Problem** (0.562). Communication is adjacent, but the entry does not own language acquisition or migration dependence.
- **East Asia** (0.540) correctly catches one geographic descriptor and nothing about the mechanism.
- The gate discarded 31 passages / 605 words, including relocation away from family, interrupted work, agency translation/tour fees, cross-border searching, “better life” motives, and intermediaries misleading both sides.
- The closing assertion that these unions’ divorce rates are “not worse” than the U.S. average is unsourced in the article and is deliberately excluded.

## Proposal P2 — The Border Bundle

**Subject and parent:** **The Border Bundle**, proposed as a sub-entry under **The Local Market** (`frameworks:local-market`). A cross-border pairing joins two local markets and may bundle the relationship with mobility, legal status, language, employment, family separation, and access to a new social network. Those bundled resources can expand options and create leverage at the same time.

**Sourced, tiered claims:**

1. **Tier 2 — peer-reviewed synthesis:** Statham & Sunanta (2026), *Annual Review of Sociology*, argue that cross-border intimate mobility is shaped by gendered opportunity structures linking particular origin and destination places and extends beyond the old “marriage migration” frame. [DOI](https://doi.org/10.1146/annurev-soc-011824-031039)
2. **Tier 1 — natural experiment and administrative data:** Adda, Pinotti & Tura (2025), *Journal of Political Economy*, exploit successive EU enlargements with Italian administrative data on the universe of marriages and separations. The published abstract reports that access to legal status reduced immigrant-native intermarriage probability by 40% and raised separation hazard among intermarriages by 20%, showing that legal status is part of the matching bargain rather than background scenery. [DOI](https://doi.org/10.1086/734093)
3. **Tier 2 — observational counterweight:** Chang (2016), *Journal of Family Issues*, analyzes a South Korean social survey (`N = 64,972`). Greater upward social mobility within transnational pairings was associated with better health, life satisfaction, and views of migration among migrating spouses. This rejects an automatic exploitation story while remaining noncausal. [DOI](https://doi.org/10.1177/0192513X15570317)
4. **Tier 3 — journalistic mechanism case:** The Guardian documents a brokered U.S.–Ukraine pathway involving local-pool dissatisfaction, agency tours and translation, rapid relocation, language dependence, interrupted employment, and mixed intimate/material motives. It is a case account, not prevalence or outcome evidence. [Guardian source](https://www.theguardian.com/lifeandstyle/2016/jan/11/mail-order-marriage-brides-ukraine-america-romance)

**Candidate aliases:** `Border Bundle`; `cross border intimacy`; `intimate mobility`; `marriage migration`; `partner migration`; `transnational courtship`; `international matchmaking`; `migration status leverage`; `cross national pairing`; `relocation bargain`.

**Contract-compliant misreadings:**

- “A foreign partner always gains equal leverage once the relationship crosses a national border.” (14 words)
- “International matchmaking proves each partner values romance above migration, money, and citizenship.” (12 words)
- “A larger global pool gives every couple better options than either local market.” (13 words)

**Boundaries:**

- Cross-border, intercultural, long-distance, immigrant-native, brokered, and partner-migration pairings overlap without being interchangeable.
- Dating abroad, intercultural attraction, and cross-national pairing alone do not establish the bundle; at least one mobility, legal-status, language, employment, network, or relocation channel must enter the relationship’s bargaining conditions.
- Relocation can expand the migrating partner’s opportunity set while also weakening local language, work, legal, or network resources.
- Legal-status effects depend on the governing jurisdiction and policy. The Italian EU-enlargement estimate is not a universal effect size.
- The South Korean well-being result is observational and context-bound; dyadic status gaps do not establish a general causal benefit.
- Economic, citizenship, family, and romantic motives can coexist. Mixed motives neither prove fraud nor erase affection.
- Independent legal status, language access, employment, transport, money, and social ties can change the leverage after migration.

**Deliberate nonclaims:** This proposal does not rank domestic and cross-border pairings; cast migrating partners as passive; cast local partners as exploiters; validate the “mail-order bride” stereotype; treat legal status as the sole motive; or adopt the Guardian’s unsupported divorce-rate comparison. The 40% and 20% estimates are quoted from the published JPE abstract, absent from the local corpus, and explicitly bounded to that study’s Italian natural experiment.


## Cycle 5 — lane B: AI feedback versus ghostwriting

**Source:** [Associated Press — “AI chatbots are helping people communicate with dating partners. Here are some do’s and don’ts”](https://apnews.com/article/3c612af2284e85860927d95998750829)  
**Capture:** 800 words · SHA-256 `75e5d42d53e624db44f6197fa556dfe0405a8b824c53f8e449d0231744710fd8` · canon `1.0.0+79158e0f6247` (564 concepts) · 16 claim-like passages · 4 mapped · **25.0% mapped** · 0 tensions.  
**Extraction:** AP `RichTextStoryBody RichTextBody` container; dropped advertising, related-story, HTML-embed, and figure blocks; no prose footer was present.

**Verdict: gap, corroborating P1; secondary instrument finding.** This source independently draws the same stage-sensitive boundary proposed in the Delegation Boundary: feedback, proofreading, and questions that help a seeker reason remain different from copying a generated message, supplying a synthetic image, or letting the assisted voice stand in for the person a counterpart later meets.

Reviewer judgment:

- Three rows mapped to **The Survivorship Channel** at the identical 0.540 score solely through its `dating coach` alias: people using AI as a coach, a named human coach favoring limited use, and asking a bot to reason through a potential match’s message. None makes the entry’s claim about advice selected on commercial or personal success. This is a credible-line topic magnet on an existing alias.
- “Skepticism about technology’s place in dating” mapped to **Cold logic keeps reaching the same place** (0.481), a generic false positive.
- Core rows about drafting replies, preserving identity across the online/offline handoff, profile feedback, proofreading, and sycophantic one-sided advice remain unmapped.
- The gate discarded the article’s sharpest boundary sentence against copying chatbot messages or altering/creating self-images, plus the headline distinction “wingman, not ghostwriter.”
- The article is expert guidance, not an outcomes study. It supports a conceptual boundary and falsifier, not a causal harm claim.

**P1 addendum:** Use this AP source inside P1 claim 3 as the explicit assistance/substitution boundary; keep the Guardian for emerging product scope. This stays inside the proposal's third sourced claim. It strengthens the claim’s source spine and leaves the evidence classified Tier 3.


## Blocked lane-A claim — WIRED date-me docs

**Source:** [WIRED — “‘Date Me’ Google Docs and the Hyper-Optimized Quest for Love”](https://www.wired.com/story/date-me-google-docs-and-the-hyper-optimized-quest-for-love/)  
**Status:** blocked(extractor-paywall); excluded from verdict tally. Raw HTML was fetched twice (canonical and /amp) to external scratch. WIRED exposed the complete prose only inside JSON-LD while rendering a paywall-truncated article body. Because the mandated extractor removes script blocks before selecting a container, it could not produce a complete deterministic text capture. No partial text was hashed or analyzed.


## Cycle 6 — lane A: self-authored date-me docs

**Source:** [The Indian Express / New York Times — “Tired of dating apps, some turn to ‘Date-Me Docs’”](https://indianexpress.com/article/lifestyle/life-style/dating-apps-date-me-docs-8883575/)  
**Capture:** 982 words · SHA-256 `e27b9194f1e3ab3728bedbf4781be4979c4bf5d7ca1f09f9c9e4ce045f279583` · canon `1.0.0+79158e0f6247` (564 concepts) · 21 claim-like passages · 4 mapped · **19.0% mapped** · 1 tension.  
**Extraction:** Indian Express `pcl-full-content` container; dropped the syndicated byline paragraph, inline ad blocks, and an “also read” card; cut before the social-follow footer.

**Verdict: instrument finding — no doctrine needed.** A self-authored long-form profile is a meeting-channel format: it changes information depth, distribution, and screening order while leaving authorship and selection with the seeker. Friend-of-friend circulation is already Third-Party Layer activity. It therefore pressure-tests P1’s boundary and sits outside Delegated Courtship unless another person or system supplies the profile’s intent, choices, or conversations.

Reviewer judgment:

- Two app-statistic mappings are wrong-owner adjacency: user-growth decline → **Why people are actually on the apps** (0.438), and positive app experience → **Do most couples meet on dating apps now?** (0.447).
- **Leadership & network** (0.540) is a defensible adjacency for organic social-circle matchmaking, but it does not own the date-me-doc format.
- The **Survivorship Channel** mapping (0.540) and generated tension are defensible in this particular row: a dating coach calls date-me docs a potential burnout antidote while the article supplies anecdotes, not outcome evidence. This contrasts with cycle 5’s same-score `dating coach` hits on claims that contained no advice-evidence mechanism.
- The gate discarded core channel rows: sharing a view-only document on social media, creator-controlled public/private distribution, document contents, and four-of-six anecdotal conversion.
- The article’s creator anecdotes, database counts, app-satisfaction figures, and claimed “small but growing” trend do not establish comparative efficacy and are not proposed as doctrine.

**P1 boundary addendum:** Keep self-authored date-me docs, personal ads, and longer profiles outside the entry. Distribution by friends also remains Third-Party Layer routing unless those friends take over authorship, screening, or conversation.


## Cycle 7 — lane C: interfaith pairing prevalence

**Source:** [Pew Research Center — “Religious intermarriage”](https://www.pewresearch.org/religion/2025/02/26/religious-intermarriage/)  
**Capture:** 1,241 words · SHA-256 `f823a5c644cf3c8217b7a324d164bad4b240c9ad6652b12c70f30f235c23445b` · canon `1.0.0+79158e0f6247` (564 concepts) · 40 claim-like passages · 4 mapped · **10.0% mapped** · 1 tension.  
**Extraction:** Pew `entry-content wp-block-post-content` container; dropped figures. The selected container ends before report pagination, citation, footnotes, materials, and newsletter blocks.

**Verdict: instrument finding — no doctrine needed.** This chapter reports the composition of current intact pairings, belief similarity, and discussion frequency. It does not identify a faith-specific dating mechanism beyond existing Shared values, Ideological Filter, Meeting Channel, and stock-versus-flow doctrine. The descriptive estimates could support a separately governed statistics entry, but they do not warrant a new relationship framework.

Reviewer judgment:

- “This analysis does not include marriages that have ended” mapped to **Ended** (0.584). The topical link is real, but the generated tension is false: a sample exclusion does not challenge the canon claim that all pairings eventually end.
- Same-religion partners discussing religion more often mapped to **Marriage and cohabitation do not feel identical from inside** (0.500). This is a wrong-comparison false positive.
- A cross-tradition prevalence row mapped to **The Effective Sex Ratio** (0.488), and a religiously unaffiliated prevalence row mapped to **More is not better past about once a week** (0.432). Both are lexical false positives.
- The gate discarded 21 passages / 307 words, including several in-domain interfaith definitions and prevalence rows. Most remaining unmapped rows are correctly unowned descriptive estimates rather than doctrine gaps.
- This cross-sectional survey of current intact pairings cannot establish religious assortative selection, relationship quality, or effects of interfaith pairing. Its 74%/26%, belief-similarity, and discussion-frequency estimates are not promoted into a proposal.

**Proposal routing:** none. The religion lane continues to support composition from existing concepts rather than a duplicate faith-specific doctrine entry.


## Cycle 8 — lane D: dating while abroad

**Source:** [The Guardian — “British singles on the awkward truth about dating abroad”](https://www.theguardian.com/lifeandstyle/2022/sep/10/british-singles-on-the-awkward-truth-about-dating-abroad)  
**Capture:** 3,784 words · SHA-256 `faa12d6f91ca3c85e3c2e3e9191321ef418dbe5b0f0ad1cdb684e8162b78abb4` · canon `1.0.0+79158e0f6247` (564 concepts) · 72 claim-like passages · 13 mapped · **18.1% mapped** · 3 tensions.  
**Extraction:** Guardian `data-gu-name="body"` container; dropped figures; cut before the terminal `data-print-layout="hide"` rail.

**Verdict: instrument finding — no doctrine needed.** Six expatriate anecdotes primarily instantiate existing Local Market and Meeting Channel concepts: nationality can change perceived distinctiveness, local norms alter initiation and app use, language narrows usable pools, and legal/social constraints alter visible LGBTQ search. These are market-context observations, not evidence that every intercultural encounter carries the migration-status bundle in P2.

Reviewer judgment:

- **The Meeting Channel** (0.484) correctly owns one app-origin sentence. **Ended** (0.655) is literal but uninformative for a passing relationship-end reference.
- The remaining displayed mappings are overwhelmingly generic false positives: a sex-preference quotation to a men’s-advice question, “we’re not dating” to Marriage Bar, gay dating in Abidjan to a male-age-window question, and first-date anecdotes to Face, first-message, social-circle, and “Just Be First” entries.
- All three generated tensions are spurious. “No second date” does not reveal unmapped social-circle doctrine; a spicy anecdote does not challenge a one-sided commitment frame; country variation in app purpose is context for existing Meeting Channel doctrine, not standalone doctrine.
- The gate discarded 164 passages / 2,350 words, including clear rows on foreigner novelty, cross-cultural app norms, small gay pools, second-language misunderstandings, street-versus-app meeting channels, transient-city supply, and in-app racism.
- Anecdotes from six writers cannot establish national dating norms or comparative outcomes. Country labels must not be converted into population traits.

**P2 boundary addendum:** Dating while abroad, dating someone of another nationality, and intercultural misunderstanding remain outside the Border Bundle unless mobility, legal status, relocation, employment, language dependence, or network access becomes part of the pairing’s bargain or leverage.


## Cycle 9 — lane A: professional matchmaking

**Source:** [TIME — “5 Matchmakers on What Materialists Gets Right and Wrong About the Job”](https://time.com/7292743/matchmakers-react-to-materialists/)  
**Capture:** 2,471 words · SHA-256 `5e92728191ad569f70f7838122459ba0067cebea26e2b3f53e9b8df59db94b8f` · canon `1.0.0+79158e0f6247` (564 concepts) · 30 claim-like passages · 8 mapped · **26.7% mapped** · 2 tensions.  
**Extraction:** TIME `article#article-body` container; dropped rendered advertising wrappers, figures, and asides.

**Verdict: instrument finding — no doctrine needed.** The profession described here performs channel curation, preference elicitation, identity/background screening, feedback, and coaching. Existing Matchmaker, Third-Party Layer, Meeting Channel, Shared values/lifestyle, Practical compatibility, and Survivorship Channel doctrine can own those functions. The source is a roundtable of five industry participants reacting to fiction, so its prescriptions and self-reports do not establish efficacy or safety outcomes.

Reviewer judgment:

- **Practical compatibility** (0.660) correctly owns one claim connecting spending and time preferences to lifestyle fit. **Matchmaker** (0.432) is the right instrument for a named practitioner’s compatibility rubric, though the generated “genuinely unmapped” tension adds nothing.
- A statement that wealthy ex-clients still divorce mapped to **Single Parenthood** (0.445), a clear false positive.
- Generic statements about wanting love mapped to body-count, Survivorship Channel, shy-women, and situationship entries; payment satisfaction mapped to a male-isolation entry; app absence mapped to looks-versus-personality. These are topic noise.
- The gate discarded 153 passages / 1,889 words, including the operational core: essays on prospects, enthusiasm before presentation, identity verification, basic background checks, blind vetting, character flags, client safety cautions, date curation, and expectation management.
- The second tension—“It almost makes people look better that they’re not using apps”—does not challenge looks-gate doctrine.
- Practitioner claims about zero incidents, client behavior, 80%/20% height preferences, weight loss, and industry turnover lack sampling or independent verification and are excluded.

**P1 boundary addendum:** Candidate sourcing, preference screening, background checks, date logistics, and coaching remain ordinary intermediary functions. They enter the Delegation Boundary only when the intermediary authors material self-presentation, makes a consequential choice as the seeker, or converses in the seeker’s identity.


## Cycle 10 — lane B: agentic AI screening and coaching

**Source:** [The Guardian — “No swiping involved: the AI dating apps promising to find your soulmate”](https://www.theguardian.com/technology/2026/feb/15/ai-dating-apps-personality-matchmaking)  
**Capture:** 1,027 words · SHA-256 `aa5a54cef274a44aac286a7d8c5f624631642abb2a2e2cd504314757e3dc5d02` · canon `1.0.0+79158e0f6247` (564 concepts) · 21 claim-like passages · 3 mapped · **14.3% mapped** · 1 tension.  
**Extraction:** Guardian `data-gu-name="body"` container; dropped figures; cut before the terminal `data-print-layout="hide"` rail.

**Verdict: gap, corroborating P1; secondary instrument finding.** The article makes selection delegation concrete: an AI interviews seekers, reduces the presented pool to five candidates, and optionally coaches the subsequent interaction. That belongs inside the Delegation Boundary because selecting and ranking on a seeker’s behalf transfers a different decision from proofreading, while still stopping short of impersonating the seeker.

Reviewer judgment:

- The lone coaching row mapped to **The Survivorship Channel** at 0.540 through the existing `dating coach` alias. As in cycle 5, the row describes a tool and founder claim, not advice selected on the adviser’s success; this confirms a topic magnet.
- Two anecdotal second-date rows mapped to **Why people are actually on the apps** (0.506) and a male-checkout question (0.493). Neither owns a two-user product anecdote.
- The generated tension from those upcoming second dates is spurious; it neither challenges nor extends app-motive statistics.
- The gate discarded 26 passages / 472 words, including AI interviewing, limiting candidate supply, coaching questions, detailed preference feedback, replacement of swipe ranking, and concern about two AIs steering a conversation.
- Two upcoming second dates cannot establish matching efficacy. The founder’s claims, an interested-party 5,000-person survey, and individual user impressions are excluded from causal doctrine.

**P1 addendum:** Fold this source into P1 claim 3 as observed agentic selection/coaching practice. Preserve three sourced claims total. Make the transferred decision explicit: recommendation and candidate suppression can delegate choice even when the system never writes in the seeker’s voice.


## Cycle 11 — lane C: religion, identity, and political filtering

**Source:** [The Guardian — “How views on the Gaza war have changed dating in America”](https://www.theguardian.com/world/2024/oct/09/dating-gaza-war-october-7)  
**Capture:** 1,790 words · SHA-256 `55606509ac79e8b1e95bbc0c11355fa132ab1972d11506366cc50aa1093feb92` · canon `1.0.0+79158e0f6247` (564 concepts) · 33 claim-like passages · 1 mapped · **3.0% mapped** · 0 tensions.  
**Extraction:** Guardian `data-gu-name="body"` container; dropped figures; cut at the terminal “Explore more on these topics” rail. A first extraction using `data-print-layout="hide"` was rejected before analysis because that marker occurred mid-article; its hash is not part of the record.

**Verdict: instrument finding — no doctrine needed.** The source is a direct instance of the Ideological Filter interacting with Shared values/lifestyle, Local Market, and Third-Party Layer. Religious identity narrows a pool, but co-religionists can still divide sharply on a salient political question; profile signals then move that disagreement earlier in the conversion funnel. This is precisely why an identity label cannot substitute for the underlying compatibility dimensions.

Reviewer judgment:

- The only mapping sent parental pressure to pair within Judaism to **The “what about kids?” pressure is often manipulation** (0.494). No child-pressure claim appears; this is a false positive.
- The analyzer missed the obvious owner, **The Ideological Filter**, despite rows explicitly describing views as a filter, swiping past otherwise attractive prospects, and rejecting opposing stances before conversation.
- The gate discarded 41 passages / 907 words, including polarization reducing conversations, same-religion disagreement, identity disclosure, faith-app versus secular-app selection, and heritage/language preferences.
- Self-reported experiences and interested-party app counts establish discourse and mechanisms, not prevalence, national group traits, or relationship outcomes. The article’s casualty count and Lox Club match count are outside this doctrine question and are not proposed.

**Proposal routing:** none. A separate “Faith Filter” would duplicate existing filter, values, market, and channel doctrine while falsely implying that religious identity is one-dimensional.


## Closeout summary and integrator handoff

**Closeout:** 2026-08-06 18:05 MDT, after the certified one-hour floor. Source set frozen.

**Verdict tally:** 11 completed analyses and 1 blocked acquisition. **Gap: 5 · instrument finding: 6 · covered: 0 · correctly unmapped: 0 · blocked: 1.** The six instrument verdicts are all deliberate “no doctrine needed” outcomes. By lane: A = 1 gap, 2 instrument, 1 blocked; B = 3 gap; C = 3 instrument; D = 1 gap, 1 instrument.

**Proposal list:**

1. **P1 — The Delegation Boundary**, under `frameworks:third-party-layer`. Three sourced claims distinguish assistance, co-authorship, selection delegation, and substitution across human and AI intermediaries. The final boundaries keep seeker-reviewed ranking, ordinary vetting/logistics, self-authored date-me docs, accessibility support, and advice from collapsing into concealed proxy authorship or unreviewed seeker judgment.
2. **P2 — The Border Bundle**, under `frameworks:local-market`. Four sourced claims treat mobility, legal status, language, employment, family/network separation, and exit resources as a bundle that may alter leverage. The final boundary keeps dating abroad, nationality difference, and intercultural misunderstanding outside unless a mobility/status/resource channel enters the pairing’s bargaining conditions.

**Instrument handoff:**

- The domain gate repeatedly binned explicit relationship mechanisms as non-domain: proxy authorship and selection, faith and political filtering, cross-border mobility, local meeting norms, and professional vetting.
- The existing `dating coach` alias on **The Survivorship Channel** is a credible-line topic magnet. It produced two false 0.540 mappings in cycles 5 and 10; the same alias produced one defensible tension in cycle 6.
- Eight tensions were generated overall. Reviewer judgment retained one as defensible and rejected seven as inherited from wrong or merely topical matches.
- Generic “dating,” “second date,” app, location, and relationship-end wording repeatedly cleared low-confidence matches to unrelated canon. These are instrument findings, not doctrine requests.

**Closeout QA:**

- Sequential ledger read completed at the hour: 12 ChatGPT rows, zero open claims, zero duplicate ChatGPT URLs. All 12 source rows have one-to-one findings/ledger parity and none duplicates the corpus manifest or pressure tests 02–05.
- All 11 final extracted-text SHA-256 values were recomputed at 18:05 MDT and matched. Their JSON records also matched every logged word count, claim count, mapped count/share, tension count, and canon version.
- Aggregate descriptive totals: 16,818 words, 327 claim-like passages, 48 mapped rows, and 8 tensions. The 14.7% aggregate mapped share crosses two canon versions and is not a fixed-baseline benchmark.
- All captures used local deterministic `le-lab.analysis/2.6` / `local-lexical-v2`; no source text was uploaded. Raw HTML, extracted text, and analyzer JSON remained under external scratch, not the repository.
- P1 passes with 3 tiered sourced claims, 10 aliases, 3 compliant misreadings, 7 boundaries, and deliberate nonclaims. P2 passes with 4 tiered sourced claims, 10 aliases, 3 compliant misreadings, 7 boundaries, and deliberate nonclaims. All six misreadings passed word-count, sentence-count, negator, relational-frame, and banned-morphology checks.
- Both parent IDs exist. Exact proposed aliases have no current canon or local-corpus collision. The P2 paper/statistic strings are absent from the local corpus; the 40%/20% and `N = 64,972` values were checked against the publishers’ abstracts and remain explicitly study-bounded.
- `CLAIMS.md` and this file are strict UTF-8 without BOM, replacement characters, or mojibake. The rejected truncated cycle-11 extraction and the blocked WIRED partial body remain excluded from hashes and tallies.

**Integrator note:** This findings file is closed and intentionally uncommitted for deliberate folding by Claude. Before accepting either proposal, follow the protocol’s baseline `--dump` first, then re-sweep every new alias, boundary, and misreading because authored proposal text is live match surface. For P1, preserve the assistance/delegation gradient and inspect the existing `dating coach` magnet. For P2, preserve jurisdictional and observational bounds around the 40%/20% and South Korean results, and keep ordinary dating abroad outside. The religion lane recommends no faith-specific doctrine. ChatGPT made no site, data, test, tool, corpus, branch, commit, or other git mutation.
