# Doctrine history — closed batches, runs and authoring records

A volume of the record shelf (`md/INDEX.md` is the table of contents; one row per section).
Append new records as new `# <name>` sections at the END of the right volume — never as new
md/ files (see "Record hygiene" in CLAUDE.md). Every section below is a byte-exact merge of a
former standalone md/ file; in-text references to `md/<name>.md` resolve to the section of that
name in this or a sibling volume, or to the pre-merge file via the `git show` pointer on the
section header line.


---

# mythbuster-grading-review.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/mythbuster-grading-review.md`

# Mythbuster grading review sheet — 2026-07-06 (Fable-proposed, awaiting ratification)

All 33 rulings below are **proposals** (`draft: true`, DRAFT chips live). Each was produced by a
web-research agent (every source URL fetch-verified in-session) and survived two adversarial
audits — a source-integrity skeptic that re-fetched every URL and checked every load-bearing
figure, and a grading-consistency skeptic (verdict vocab, verdict↔text coherence, tier honesty,
style). Where a skeptic demanded a repair, the skeptic's exact wording was applied (flagged
per-entry below). Ratify → strip `draft`; regrade → edit in place. Full audit trail in the
mission-notes ledger; per-source verification notes in the workflow output (session 3cbf11b8).

**Held on the docket (not graded):** M-TBD-4 (awaits Ani's primary quote; fetch-verified
definitional anchors stashed in its researchNotes) · M-TBD-36 (proposal failed the
source-coverage audit; regrade path in its researchNotes).

---

## M-TBD-3 · Approach (Ani/Mika extraction)

**Q:** If you take rejection gracefully, does shooting your shot cost you anything?
- **Claim (Ani):** “Girls don’t give guys a bad reputation for politely asking for a number when the vibe is good. Bad reputations come from being pushy, entitled, or bitter after rejection — most girls respect a guy who makes a clean move and takes no well.” → **confirmed**
- **Claim (Mika):** “Perception matters more than how nicely you take the rejection. If she never gave real signals, your advance is unwanted attention no matter how polite it is — and repeatedly misreading friendliness as flirting damages your reputation, because girls talk.” → **oversimplified**

**Ruling — Advantage Ani** · tier: `evidence`

> The pursuit literature puts the damage where Ani puts it: across 241 people's dual pursuer/target accounts, targets' negative reactions attached to persistence after explicit rejection — and pursuers, especially men, over-reported reciprocation signals and under-reported the no. No study shows a polite, once-and-done ask costing reputation. Mika's mechanism is real but narrower: identical advances get labeled harassment more often when the initiator is less attractive, and interested men do overperceive attraction — so "the vibe was good" is the unreliable part, not the graceful exit.

- [Sinclair & Frieze (2005), Sex Roles — unrequited attraction: negativity attaches to persistent pursuit after explicit rejection; pursuers over-report reciprocation signals](https://link.springer.com/article/10.1007/s11199-005-4203-4)
- [Walker & Bonner (2022), Journal of Business and Psychology — identical romantic advances draw more harassment labeling when the initiator is relatively less attractive](https://link.springer.com/article/10.1007/s10869-020-09729-w)
- [Samara, Roth & Kret (2021), Archives of Sexual Behavior — speed-dating (277 dates): men who are interested overperceive their partner's attraction](https://pmc.ncbi.nlm.nih.gov/articles/PMC8416843/)

*researchNotes:* No study directly measures reputational fallout from a single graceful approach — that gap caps this at evidence tier, and Ani's "most girls respect a clean move" is inference from the persistence literature, not a measured approval rate. Walker & Bonner's harassment-labeling effect comes from workplace vignettes involving physical contact from a superior, so its transfer to a polite number-ask is directional, not exact. A study tying serial misreads spread through gossip networks to concrete reputation loss would strengthen Mika's claim and could shift the badge toward "Both half right."

---

## M-TBD-12 · Approach · from GD card "Why being direct gets you shut down"

**Q:** Does being direct about wanting sex get a man rejected where the indirect route succeeds?
- **Claim:** “A guy who just says "wanna have sex" gets shut down immediately, but a guy who goes on three pretend dates gets it. Same goal, opposite outcome. The market rewards the guy willing to play the long game — the pretend dates, the slow-built vibe, the gradual escalation over multiple conversations — and punishes the guy who's honest about what he wants up front. So it ends up rewarding indirect communicators and punishing direct ones.” → **oversimplified**

**Ruling — Right pattern, wrong lesson** · tier: `hard-data`

> The outcome asymmetry is real and repeatedly replicated: in Clark and Hatfield's field experiments, 69–75% of men accepted a stranger's "go to bed with me tonight," zero women did — yet roughly half of women in the same experiments accepted a date request. The lesson drawn is wrong, though. Women's refusals track perceived danger and low expected sexual pleasure, and in a subjectively safe lab setting the gender gap vanishes. The slow route wins because it delivers safety and information — not because the market punishes honesty.

- [Clark & Hatfield (1989), Journal of Psychology & Human Sexuality — original field experiments: 69–75% of men vs 0% of women accepted a stranger's bed offer; ~50% of both sexes accepted a date](https://www.sciencefriday.com/wp-content/uploads/2016/04/gender-differences-in-receptivity-to-sexual-offers.pdf)
- [Conley (2011), Journal of Personality and Social Psychology — acceptance tracks perceived proposer characteristics (sexual skill/expected pleasure); gender gap disappears for familiar or famous proposers](https://pubmed.ncbi.nlm.nih.gov/21171789/)
- [Baranowski & Hecht (2015), Archives of Sexual Behavior — German field replication of the gap; in a subjectively safe laboratory setting the gender difference in consenting to sex disappeared](https://pubmed.ncbi.nlm.nih.gov/25828991/)

*researchNotes:* The "three dates gets it" half is script-consistent but not directly quantified in this literature, and the lab-parity results (Conley; Baranowski & Hecht) measure hypothetical consent under manufactured safety, not real-world behavior — so the mechanism evidence is softer than the outcome data. Kunz & Greitemeyer (2025, Journal of Social Psychology; PubMed 39661065, fetched) confirm the field asymmetry persists 40+ years on, independent of proposition type. Read purely as an outcome prediction (direct stranger propositions fail), the claim would grade confirmed; the oversimplified verdict rides on the "market punishes honesty / rewards deception" mechanism.

---

## M-TBD-13 · Approach · from GD card "The double standard is real"

**Q:** Is sexual directness received differently from a woman than from a man?
- **Claim:** “If a woman says "I want to have sex" to a guy, most guys find it hot as hell — bold, confident, sexy. A guy says the exact same words to a woman and she's usually turned off or uncomfortable. Same sentence, opposite reception. Women can be direct about wanting sex and get rewarded for it; men doing it read as crude.” → **confirmed**

**Ruling — Holds up** · tier: `hard-data`

> Yes — this is a repeatedly replicated result. In the Clark–Hatfield paradigm, a woman's direct sex offer to a male stranger typically gets a yes, while the identical offer from a man got zero acceptances from women — a gap that held on campus, in nightclubs, and in a 2025 pair of naturalistic replications. The refinement: Conley showed it isn't male directness being punished — women's acceptance rises to match men's when the proposer is attractive, famous, or a trusted friend expected to be good in bed.

- [Conley (2011), Journal of Personality and Social Psychology — the Clark–Hatfield gap (men quite likely to accept a stranger's casual-sex offer, women never) disappears with attractive, famous, or friend proposers; perceived sexual skill predicts acceptance for both sexes](https://pubmed.ncbi.nlm.nih.gov/21171789/)
- [Baranowski & Hecht (2015), Archives of Sexual Behavior — field replication on campus and in nightclubs (significantly more men than women consent to a stranger's sexual invitation); the gap disappears in a low-perceived-risk laboratory setting](https://pubmed.ncbi.nlm.nih.gov/25828991/)
- [Kunz & Greitemeyer (2025), Journal of Social Psychology — two fresh naturalistic replications: men still accept a sexual invitation from an opposite-sex stranger far more readily than women](https://pubmed.ncbi.nlm.nih.gov/39661065/)

*researchNotes:* The original 1989 percentages (commonly cited as ~69-75% of men vs 0% of women) could not be re-verified verbatim this session — the original article and the 2025 full text both 403'd — so the ruling uses the abstract-level magnitudes confirmed on PubMed ("men quite likely to accept, women never did"). Regrade risk: if the card's framing hardens into an intrinsic anti-male double standard, Conley 2011 plus the low-risk lab data argue the driver is anticipated pleasure and safety rather than male directness itself, which would pull the verdict toward oversimplified. Note the claim covers the target's immediate reception; reputational aftermath for sexually forward women is a separate literature not graded here.

---

## M-TBD-14 · Attraction · from GD card "Complaining about the guys you reward"

**Q:** Do women reward the same player behavior they complain about?
- **Claim:** “A lot of the same people who complain loudest about fuckboys and players are the ones who keep rewarding that behavior and rejecting the honest guys. They author the outcome they complain about.” → **oversimplified**

**Ruling — Half right** · tier: `evidence`

> At first contact, partly yes: narcissists are more popular at first sight, and the charming traits are precisely the toxic ones — exploitativeness and entitlement (Back et al. 2010). But the reward is front-loaded: across three weeks of real contact the advantage decays as arrogance and untrustworthiness surface (Leckelt et al., n=311). The "rejecting the honest guys" half fails outright — women chose the nice guy for dates and serious relationships, with looks mattering mainly for casual sex. And no study shows the loudest complainers are the same women doing the rewarding.

- [Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology — narcissism predicts popularity at zero acquaintance, driven most by the exploitativeness/entitlement facet](https://pubmed.ncbi.nlm.nih.gov/20053038/)
- [Leckelt, Küfner, Nestler & Back (2015), Journal of Personality and Social Psychology — longitudinal study (n=311) showing narcissists' initial popularity declines over repeated group contact as arrogant-aggressive behavior and perceived untrustworthiness emerge](https://pubmed.ncbi.nlm.nih.gov/26191958/)
- [Urbaniak & Kilmann (2003), Sex Roles — women preferred the nice guy for dates and serious relationships; physical attractiveness mattered more for casual-sexual desirability](https://link.springer.com/article/10.1023/A:1025894203368)

*researchNotes:* No study directly tests the within-person claim — that the loudest complainers are the same individuals rewarding players — so that part rests on inference from population-level first-impression effects. A verified partial supporting the "keep going back" reading: Haslam & Montrose (2015, Personality and Individual Differences; confirmed via the Hartpury repository, https://pure.hartpury.ac.uk/en/publications/should-have-known-better-the-impact-of-mating-experience-and-the-/) found women with more mating experience and those desiring marriage rated the narcissistic male personality as more attractive, in a single ~146-woman sample. Regrade risk: Jauk et al. (2016) speed-dating work attributes narcissism's mate appeal largely to shared variance with extraversion and physical attractiveness (Wiley paywall blocked verification this session), so "player traits per se get rewarded" is contestable at the mechanism level.

**Audit repair applied:** style trim to 90 words (consistency skeptic's exact replacement text)

---

## M-TBD-15 · Attraction · from GD card "Butterflies beat honesty"

**Q:** Does smooth game beat honesty in who actually gets chosen?
- **Claim:** “Given the choice, a lot of women would rather be with the guy who has smooth game — even knowing he's probably dishonest — than the awkward but honest one. The ability to make her feel butterflies and say the right thing at the right moment beats honesty for a lot of people. Charm and confidence win over honesty.” → **oversimplified**

**Ruling — True at first sight** · tier: `evidence`

> At first contact, yes — confidence and smoothness win. Narcissists are rated more popular at zero acquaintance and earn higher short-term mate appeal in real courtship interactions, via social boldness rather than empathy. But the claim's "even knowing he's dishonest" clause fails: describing a target as honest raises attractiveness ratings (replicated at n=457), and narcissists' popularity decays precisely as they come to be seen as untrustworthy. Charm wins because the dishonesty isn't visible yet — not because women knowingly discount it.

- [Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology — narcissists are more popular at zero acquaintance, and the most exploitative/entitled facets charm the most](https://pubmed.ncbi.nlm.nih.gov/20053038/)
- [Dufner, Rauthmann, Czarna & Denissen (2013), Personality and Social Psychology Bulletin — narcissism boosts short-term mate appeal across three studies (including naturalistic courtship outcomes), mediated by social boldness and physical attractiveness](https://pubmed.ncbi.nlm.nih.gov/23554177/)
- [Niimi & Goto (2023), PLOS ONE — the "honesty premium": targets described as honest are rated more facially attractive, replicating Paunonen (2006) in two experiments (n=65 and n=457); a fourth experiment failed to replicate, attributed to method](https://pmc.ncbi.nlm.nih.gov/articles/PMC9925008/)
- [Leckelt, Küfner, Nestler & Back (2015), J. of Personality and Social Psychology — narcissists' initial popularity declines over three weeks as arrogant-aggressive behavior surfaces and they are increasingly seen as untrustworthy](https://pubmed.ncbi.nlm.nih.gov/26191958/)

*researchNotes:* Also verified via PubMed: Leckelt et al. 2015 (JPSP, PMID 26191958) — narcissists' initial popularity declines over three weeks as arrogant-aggressive behavior and being seen as untrustworthy take over, which is the mechanism behind the ruling's last sentence. Jauk et al. 2016 (European Journal of Personality speed-dating, narcissism predicting both short- and long-term mate appeal) fits the picture but was paywalled (Wiley 402), so it is not cited; a 2025 Journal of Personality speed-dating study on narcissistic dating success (doi 10.1111/jopy.70059) was also paywalled and could soften the first-sight advantage if it is a non-replication. No study directly tests the exact forced choice "knowingly dishonest smooth vs honest awkward," and samples are mostly students/lab paradigms — hence evidence tier, not hard-data.

**Audit repair applied:** Niimi label corrected (honesty premium replicated in 2 of 4 experiments, not 4); "reliably raises" softened; Leckelt 2015 promoted from researchNotes into sources

---

## M-TBD-16 · Attraction · from GD card ""I want an honest guy" is branding"

**Q:** When women say they want an honest guy, is that the real preference?
- **Claim:** “"I want a guy with game" sounds shallow and a little manipulative, while "I want an honest guy" makes you look like you have good values. So people keep saying the thing that makes them look good, even when it isn't what they actually respond to. It's branding. What someone says they want and what they actually chase are two different data sets — and the second one is the one that predicts behavior.” → **oversimplified**

**Ruling — Half right** · tier: `hard-data`

> Partly. In live speed dating, ideals stated beforehand failed to predict who actually inspired desire — the stated/revealed gap is real and replicated at first attraction. But "branding" overreaches: stated ideals prospectively predicted the traits of partners singles ended up with five months later (N=763), and across 43 countries, partners matching one's own ideals were rated better (corrected β=.19, N=10,358). "Honest" is near-universal boilerplate, so it carries little distinctive signal — but the gap reflects weak introspection, not image management, and stated ideals do predict selection.

- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — ideal preferences stated before a speed-dating event failed to predict actual romantic desire at the event](https://pubmed.ncbi.nlm.nih.gov/18211175/)
- [Gerlach, Arslan, Schultze, Reinhard & Penke (2019), Journal of Personality and Social Psychology — Göttingen Mate Choice Study: N=763 singles tracked prospectively; stated ideals predicted the characteristics of later actual partners](https://pubmed.ncbi.nlm.nih.gov/28921999/)
- [Eastwick et al. (2024), Journal of Personality and Social Psychology — worldwide test (N=10,358, 43 countries): partners matching one's own stated ideals were evaluated more positively, corrected pattern metric β=.19; single-trait weighting near zero (β≈.04)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12622239/)
- [Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin — meta-analysis (k=97): stated ideal-partner preferences fail to predict live romantic evaluations](https://pubmed.ncbi.nlm.nih.gov/23586697/)

*researchNotes:* Also verified the Eastwick, Luchies, Finkel & Hunt (2014) Psychological Bulletin meta-analysis (k=97, PMID 23586697): both sexes' live evaluations tracked attractiveness at r≈.40 with nonsignificant sex differences, backing the stated/revealed split at first attraction. The card's "branding" mechanism is its weak link — researchers attribute the gap to construal/introspective limits rather than impression management, though the 2024 worldwide test's trait-by-trait level metric (β≈.04) is a genuine partial for the card: naming any single stated trait like honesty adds almost no distinctive predictive weight. Regrade risk: evidence that preference self-reports are driven by social desirability rather than introspection limits would push the verdict toward confirmed.

---

## M-TBD-17 · Market · from GD card "Guys are checking out"

**Q:** Are men checking out of dating?
- **Claim:** “A lot of guys just say "fuck this" and check out entirely. Some go monk mode and pour everything into money and themselves; others swallow their pride and learn to become players too. For the ones who only ever wanted to be decent and honest, it really is a raw deal, and a lot of them are losing hope.” → **oversimplified**

**Ruling — Real trend, shaky story** · tier: `hard-data`

> The checkout is measurable: only 50% of single U.S. men were looking for a relationship or dates in July 2022, down from 61% in 2019 (Pew, n=6,034); 63% of men under 30 are single; and past-year sexlessness among men 18–24 rose from 19% to 31% between 2000–2002 and 2016–2018 (GSS). But the why is embellished: singles' top stated reasons are enjoying single life and other priorities, and the rise concentrates among unmarried men, and sexual inactivity is disproportionately found among low-income and part-time/unemployed men — not monk-mode self-improvers.

- [Pew Research Center (2023) — 57% of singles not looking; single men looking fell 61%→50% (2019–2022); 63% of men under 30 single](https://www.pewresearch.org/short-reads/2023/02/08/for-valentines-day-5-facts-about-single-americans/)
- [Ueda, Mercer, Ghaznavi & Herbenick (2020), JAMA Network Open — GSS 2000–2018: sexual inactivity among men 18–24 rose 18.9%→30.9%, concentrated among unmarried, lower-income, part-time/unemployed men](https://pmc.ncbi.nlm.nih.gov/articles/PMC7293001/)

*researchNotes:* The withdrawal trend itself is solid across two independent representative datasets, but the claim's motive story (bitter honest men going monk mode or turning player) is untested — Pew's self-reported reasons read as indifference/priorities, not lost hope, and self-reports may under-capture bitterness. Part of the 2019→2022 drop overlaps the pandemic, so some rebound is possible (Pew 2025 reports singledom ticking down). A targeted study of male dating-app burnout or disengagement motives could upgrade the motive half and shift the verdict toward confirmed.

---

## M-TBD-18 · Attraction · from GD card "The arrogant-guy paradox"

**Q:** Does arrogance attract, even when women say they can't stand it?
- **Claim:** “That mix of confidence and game is magnetic to a lot of women — even when the guy is genuinely a dick or full of it. So the very traits women say they can't stand — arrogance, being full of yourself — are often the ones that get rewarded most.” → **oversimplified**

**Ruling — True at first sight** · tier: `hard-data`

> At first sight, yes — this paradox is a replicated finding. Narcissists were more popular at zero acquaintance (73-person round-robin, 2,628 dyads), the entitled, exploitative facet was the most attractive of all, and narcissism predicted real courtship success. But the decomposition matters: the pull runs through confidence, boldness, and appearance — when observers read a man as arrogant per se, desirability drops. And this evidence covers first impressions and short-term appeal, where the dick side hasn't had time to surface.

- [Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology — narcissists more popular at zero acquaintance; the exploitativeness/entitlement facet was the most attractive, mediated by appearance and verbal/nonverbal cues](https://pubmed.ncbi.nlm.nih.gov/20053038/)
- [Dufner, Rauthmann, Czarna & Denissen (2013), Personality and Social Psychology Bulletin — narcissism raised short-term mate appeal across three studies including real-life courtship outcomes, mediated by physical attractiveness and social boldness](https://pubmed.ncbi.nlm.nih.gov/23554177/)
- [Murphy et al. (2015), Personality and Social Psychology Bulletin — perceived confidence increased romantic desirability while perceived arrogance counteracted it; overconfidence deterred same-sex rivals](https://pubmed.ncbi.nlm.nih.gov/26055389/)

*researchNotes:* The reward is front-loaded: Carlson & DesJardins (2015, PSPB, fetched and verified this session) found narcissists initially gained status but lost it with repeated exposure and overestimated their own popularity, so the paradox is strongest where acquaintance is thinnest. Converging support left out under the 3-source cap: Jauk et al. (2016, European Journal of Personality) speed-dating found narcissism predicted mate appeal (via extraversion/attractiveness; Wiley page paywalled, verified only via abstract), and a 2025 Journal of Personality speed-dating study reportedly found rivalrous narcissism predicted more second dates (not independently fetched). Regrade risk: if the question is re-scoped to long-term partner choice, the verdict tilts further against the claim — narcissism's costs surface with exposure.

---

## M-TBD-19 · Attraction · from GD card "Charisma overrides red flags"

**Q:** Does charisma make red flags disappear?
- **Claim:** “Women will ignore massive red flags if the guy has enough charisma and confidence. They convince themselves "he'll change for me" or "I'm different," then act shocked when the guy who slept with 300 women behaves exactly like a guy who slept with 300 women.” → **oversimplified**

**Ruling — Charm expires** · tier: `evidence`

> Temporarily, yes — and not just on women. In a 73-person round-robin of first meetings (2,628 dyads), the most exploitative, entitled narcissism facets were exactly the most charming at first sight. But the spell decays: across three weeks of group contact, narcissists were increasingly read as untrustworthy and their popularity sank. The base-rate warning is real too — prior cheaters carried triple the odds of cheating again. Charm masks flags at first glance; it doesn't erase them, and it isn't female gullibility.

- [Back, Schmukle & Egloff (2010), Journal of Personality and Social Psychology — zero-acquaintance round-robin (N=73, 2,628 dyads): the narcissism facets most maladaptive long-term (exploitativeness/entitlement) were the most attractive at first sight, mediated by charming verbal/nonverbal behavior and appearance.](https://pubmed.ncbi.nlm.nih.gov/20053038/)
- [Leckelt, Küfner, Nestler & Back (2015), Journal of Personality and Social Psychology — longitudinal groups (n=311, three weekly sessions): narcissists' initial popularity declines as arrogant-aggressive behavior mounts and they are increasingly perceived as untrustworthy.](https://pubmed.ncbi.nlm.nih.gov/26191958/)
- [Knopp, Scott, Ritchie, Rhoades, Markman & Stanley (2017), Archives of Sexual Behavior — 484 adults tracked across two consecutive relationships: infidelity in the first relationship meant three times the odds of infidelity in the next, consistent across respondent gender.](https://pubmed.ncbi.nlm.nih.gov/28785917/)

*researchNotes:* The lab evidence measures narcissism-driven first-impression charm, not literal "red flag ignoring," and Back 2010's mixed-sex round-robin plus Knopp's gender-consistent infidelity odds undercut the women-specific framing; the "he'll change for me" persistence is better explained by investment-model commitment research than by charisma. Supporting but uncited: Carter, Campbell & Muncer (2014, PAID) found 128 women rated a high-Dark-Triad male character more attractive. Regrade risk: a proper meta-analysis of Dark Triad attractiveness (speed-dating results are mixed) could shrink the "charm advantage" toward null, pushing this closer to plain false.

---

## M-TBD-20 · Attraction · from GD card "Preselection: nothing attracts women like other women"

**Q:** Does being wanted by other women make a man more attractive?
- **Claim:** “Women are drawn to men who other women visibly want. Seeing that you have options — that you're genuinely chosen and pursued — spikes interest, because it triggers competition and the instinct that "if all these women want him, there must be something good here." This is why a female friend vouching for you does almost nothing, while visibly having women chase you does a lot: one reads as safe, the other as desirable.” → **oversimplified**

**Ruling — Real but overstated** · tier: `hard-data`

> Mate-choice copying is real and asymmetric in the claim's favor: in Hill & Buss (N=847), women rated a man as more desirable when shown surrounded by women, while men rated a woman as less desirable when surrounded by men. But the 2018 Gouda-Vossos meta-analysis found the effect modest, highly heterogeneous, and inflated by moderate publication bias — reliable for women choosing men, weak-to-mixed for men. "One of the strongest forces" overstates it; the vouching-does-nothing claim is untested.

- [Hill & Buss (2008), Personality and Social Psychology Bulletin — women rated men more desirable when surrounded by women (desirability enhancement); men rated women less desirable when surrounded by men (Study 1, N=847).](https://pubmed.ncbi.nlm.nih.gov/18303129/)
- [Gouda-Vossos, Nakagawa, Dixson & Brooks (2018), Adaptive Human Behavior and Physiology — meta-analysis: copying reliable for women choosing men, no clear effect for men, with high heterogeneity and moderate publication bias favoring positive reports.](https://research.monash.edu/en/publications/mate-choice-copying-in-humans-a-systematic-review-and-meta-analys)

*researchNotes:* The preselection/mate-choice-copying core is well-replicated for women choosing men, but the 2018 meta-analysis flags high heterogeneity and moderate publication bias, so "one of the strongest forces" is unsupported hyperbole. The card's "vouching-does-almost-nothing vs. visible-pursuit-does-a-lot" split is untested and arguably backwards — "augmentation" studies show even indirect social information (other women's endorsements/ratings) can raise a target's desirability. Verdict would move to "confirmed" if the card dropped the magnitude framing and the vouching claim; it would weaken toward "false" if it insisted the effect were symmetric across the sexes.

---

## M-TBD-21 · Standards · from GD card "The body-count double standard"

**Q:** Is a high body count judged the same on men and women?
- **Claim:** “A woman with a high body count is widely read as a red flag — impulsive, low-value, maybe not loyal. A man with a high body count often reads the other way: a lot of women see it as high value, because "if that many women wanted him, he must have something." It's preselection again — her history signals risk, his signals demand.” → **oversimplified**

**Ruling — Slight lean, not reversal** · tier: `hard-data`

> The direction is real, the magnitude inflated. Endendijk et al.'s meta-analysis (99 studies, 123,343 people) finds a traditional double standard — men's sexual activity is evaluated more positively than women's — but the effect is small (d≈0.25) and shows up only when people rate male vs. female targets (largely implicit vignette-style evaluation studies), vanishing on explicit Likert-scale double-standard questionnaires. Crucially, a high count is no plus for men: Stewart-Williams et al. (2017) found willingness peaks at a modest history then falls sharply, with both sexes equally reluctant about an extensive record. A slight lean, not opposite verdicts.

- [Endendijk, van Baar & Deković (2020), Personality and Social Psychology Review — meta-analysis of 99 studies (123,343 participants) finds a traditional sexual double standard (men's sexual activity evaluated more positively; d≈0.25) in evaluation/expectation-difference studies, largely implicit vignette designs; null on explicit Likert-type SDS questionnaires, null on Likert questionnaires, moderated by country gender equality.](https://pubmed.ncbi.nlm.nih.gov/31880971/)
- [Stewart-Williams, Butler & Thomas (2017), The Journal of Sex Research — willingness to partner rises with a modest sexual history then falls dramatically; both sexes expressed equal reluctance toward an overly extensive history (no strong double standard at the high end).](https://pubmed.ncbi.nlm.nih.gov/27805420/)

*researchNotes:* The weak part of the claim is the "opposite directions" framing: the double standard is directional (men judged somewhat more leniently) but small and measurement-dependent, and the "high count reads as high value for men" assertion is essentially unsupported — high counts are penalized by both sexes. Regrade risk: the equal-penalty-at-the-top finding leans on a single study (Stewart-Williams, n=188), though it converges with the meta-analytic result that the SDS is weak and inconsistent. Could not load the Sage full text or Cronfa PDF (server refused/403); graded from the verified PubMed abstracts.

**Audit repair applied:** invented "open-ended measures" framing replaced with the paper's actual evaluation-vs-Likert split; badge renamed

---

## M-TBD-22 · Attraction · from GD card ""Stop sexualizing me" is selective"

**Q:** Do objectification complaints depend on who is doing the objectifying?
- **Claim:** “"Stop sexualizing me — just treat me like a human." It sounds like a principle, but watch when it actually gets deployed: almost always toward men they're not attracted to. The same women are usually fine — happy, even — being sexualized by the men they do find attractive. The same exact behavior reads as "hot" from a man she wants and "creepy — why can't you just treat me like a human?" from one she doesn't.” → **oversimplified**

**Ruling — Half true** · tier: `evidence`

> Partly — the perceptual asymmetry is real. In vignette experiments, identical ambiguous behavior was judged less harassing when the man was attractive (Golden et al. 2001, N=150); a second N=591 study found attractive opposite-sex perpetrators were judged less harassing (LaRocca & Kromrey 1999). But "unwanted" is built into what harassment means: attention that varies in welcomeness by source is consent logic, not hypocrisy. And "happy, even" fails outright — objectification by women's own chosen partners predicts lower sexual satisfaction, weaker refusal ability, and more coercion (Sáez et al. 2019).

- [Golden, Johnson & Lopez (2001), Sex Roles — vignette experiment (N=150, photo-manipulated attractiveness): identical ambiguous workplace behavior by attractive men was less likely to be judged harassing](https://link.springer.com/article/10.1023/A:1015688303023)
- [LaRocca & Kromrey (1999), Sex Roles — N=591 students; an attractive opposite-sex perpetrator in an identical ambiguous scenario was perceived as less harassing than an attractive same-gender perpetrator](https://link.springer.com/article/10.1023/A:1018829222894)
- [Sáez, Alonso-Ferres, Garrido-Macías, Valor-Segura & Expósito (2019), Frontiers in Psychology — N=138 women: perceived objectification by one's own partner is linked to lower sexual satisfaction via undermined refusal ability and higher sexual coercion](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02748/full)

*researchNotes:* The attractiveness-asymmetry evidence is third-party vignette work on student samples, not first-person field data on women's in-vivo reactions — a strong experience-sampling or behavioral study could enlarge or shrink the effect, and the Sáez et al. counter-evidence is correlational (N=138). The claim's kernel is also partly definitional: "unwanted attention" is receiver-relative by construction, so source-dependence alone cannot establish insincerity or weaponization. Regrade risk: direct first-person data showing women uniformly welcome sexualized attention from desired men would push the verdict toward confirmed; none was found.

---

## M-TBD-23 · Attraction · from GD card "The celebrity-crush asymmetry"

**Q:** Do men and women desire celebrities differently?
- **Claim:** “When a man likes a female celebrity, it's mostly physical and contained — "she's gorgeous," and that's about it. When a woman likes a male celebrity, it far more often turns into something intense and emotional — fan edits, paragraphs, jealousy when he dates someone real, a full parasocial fantasy of actually being with him: "he's my husband, he's the standard, no real man compares." Male desire tends to run physical and bounded; female desire tends to run emotional, narrative, and fantasy-driven.” → **oversimplified**

**Ruling — Half right** · tier: `evidence`

> Half of it holds. Girls' and women's celebrity crushes running emotional and narrative is documented: adolescent idols serve as safe practice targets for romantic love — talked over with peers, complete with excitement and jealousy of the idol's real and on-screen relationships (Karniol 2001). The "male desire stays bounded" half breaks: a systematic review finds sex differences in celebrity-worship intensity mixed and inconsistent, most studies find no sex difference at all, and where differences appear, men more often score higher on borderline-pathological worship and slightly likelier to endorse celebrity stalking (one study). The visible fan-edit culture skews female; the obsession that escapes containment tilts male.

- [Karniol (2001), Sex Roles — adolescent girls' idolization of male media stars as a safe 'practice' target of romantic love before dating](https://link.springer.com/article/10.1023/A:1011037900554)
- [Brooks (2018), Current Psychology — systematic review of celebrity-worship correlates: sex differences mixed; males higher on borderline-pathological worship in most studies; one study finds males slightly likelier to endorse celebrity stalking](https://link.springer.com/article/10.1007/s12144-018-9978-4)
- [Tukachinsky & Dorros (2018), Journal of Children and Media — parasocial romantic relationships in mixed-sex adolescent samples have distinct emotional and physical dimensions; emotional involvement, not physical attraction, predicts later relationship costs](https://digitalcommons.chapman.edu/comm_articles/54/)

*researchNotes:* No study directly quantifies the claimed asymmetry — how often male vs female celebrity attraction becomes an intense parasocial romance — so the "far more often" magnitude is ungraded folk observation; the female-rehearsal evidence is also adolescent-heavy, with thin adult data. Adjacent literature (sexual-fantasy content, romance-vs-visual-erotica consumption) supports the style core, but the celebrity-worship intensity data cut against "bounded" male desire. A representative adult survey of parasocial-romance prevalence by sex could move this toward confirmed or false.

**Audit repair applied:** three overstatements repaired (most studies find NO sex difference; "dominating stalking" → one endorsement study; Karniol embellishment removed)

---

## M-TBD-24 · Attraction · from GD card ""Personality matters most" is mostly marketing"

**Q:** Does personality matter most — or do looks decide who even gets considered?
- **Claim:** “On the apps, most women swipe left on the large majority of men based almost entirely on looks. Personality only gets a turn once she's already physically attracted to you. So the "average guy with a great personality" usually can't just get girls — he has to clear the looks filter first, and for most average guys that filter is brutal. "Personality is the most important thing" is largely marketing.” → **oversimplified**

**Ruling — True at the gate** · tier: `evidence`

> At the gate, confirmed: a field experiment planting curated profiles before nearly half a million Tinder users found male profiles matched on just 0.6% of their likes (female profiles: 10.5%), in the paper's companion survey 93% of women reported liking only profiles they're explicitly attracted to, and the same man's profile with three photos instead of one drew roughly seven-fold more matches. Initial desire tracks looks in both sexes, and stated ideals don't predict it. The overreach is "largely marketing": lengthen acquaintance and the gate measurably weakens — friends-first couples barely sort on attractiveness.

- [Tyson, Perta, Haddadi & Seto (2016), IEEE/ACM ASONAM — Tinder field experiment (~230k male + 250k female profiles): male match rate 0.6% vs female 10.5%; 93% of women like only profiles they're attracted to vs 0% casually liking most; same male profile with 1 vs 3 photos: 234 vs 1,568 matches](https://arxiv.org/abs/1607.01952)
- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — speed-dating: stated ideal preferences failed to predict actual romantic desire, and physical attractiveness predicted initial interest with no sex differences](https://pubmed.ncbi.nlm.nih.gov/18211175/)
- [Hunt, Eastwick & Finkel (2015), Psychological Science — 167 couples: longer pre-dating acquaintance and friends-first histories predict sharply reduced assortative mating on physical attractiveness](https://pubmed.ncbi.nlm.nih.gov/26068893/)

*researchNotes:* The press-circulated "61.9% vs 4.5% like rate" attributed to the Tinder study does not appear in the paper text — quote only the verified 0.6%/10.5% match rates, the 93% liking-strategy figure, and the photo experiment. The looks gate runs in both sexes (Eastwick & Finkel), so any woman-specific framing of the filter overreaches. The off-app softening rests mainly on one 167-couple study; if Hunt et al. failed to replicate, the verdict would drift toward confirmed.

**Audit repair applied:** tier hard-data → evidence (every leg single-study); 93% figure attributed to the companion survey; photo-experiment wording made exact

---

## M-TBD-25 · Standards · from GD card "Height: the one looks preference women own"

**Q:** Is height the one looks preference women state openly?
- **Claim:** “Somewhere along the way it became socially acceptable — even trendy — to state it outright, so women own it with zero shame: "6ft minimum," right there in the bio, on TikTok, in interviews, almost worn as a personality trait. Height is the one physical preference women will openly admit to caring about. Every other looks-based filter — baldness, weight, face, even income preferences — usually gets hidden behind a more respectable excuse.” → **oversimplified**

**Ruling — Loudest, not only** · tier: `hard-data`

> The height half is solid: women state it openly and strongly — 48.9% of women's Yahoo dating ads demanded a taller man outright (versus 13.5% of men wanting shorter), and women's height minimums are more selective and more consistent than men's. The exclusivity half fails: "even income preferences get hidden" is wrong — women openly rated good financial prospects higher than men in all 45 countries of the largest cross-cultural replication of Buss's mate-preference battery. Height is the loudest openly-owned filter, not the only one.

- [Yancey & Emerson (2016), Journal of Family Issues — in Yahoo dating ads, 48.9% of women required a taller man vs 13.5% of men requiring shorter (Rice University summary)](https://news2.rice.edu/2014/02/10/is-height-important-in-matters-of-the-heart-new-study-says-yes/)
- [Stulp, Buunk & Pollet (2013), Personality and Individual Differences — women are more selective and more consistent in height preferences; satisfaction peaks at a partner 21 cm taller (men: 8 cm)](https://research.rug.nl/en/publications/women-want-taller-men-more-than-men-want-shorter-women)
- [Walter, Conroy-Beam, Buss et al. (2020), Psychological Science — 45-country replication (N=14,399): women openly rate mates' financial prospects as more important than men do, in every society sampled](https://research.vu.nl/en/publications/sex-differences-in-mate-preferences-across-45-countries-a-large-s)

*researchNotes:* The claim's descriptive core is well-supported by stated-preference data (the 48.9% figure IS women stating the filter in their own ads), and Dial & Brown (2025, Human Nature, PMC12644153, verified) adds 43.4% of women vs 25.8% of men rating height important. But no peer-reviewed content analysis directly compares how openly height vs baldness/weight/face get stated in bios — the exclusivity leg is graded mainly on the income part, which Walter et al. and personal-ads research (Wiederman 1993, not independently fetched) contradict. Regrade risk: read narrowly as "looks-only preferences publicly owned in bios," the claim edges closer to confirmed.

---

## M-TBD-26 · Psychology · from GD card "Women care more what other women think"

**Q:** Whose approval actually drives women's choices — men's or other women's?
- **Claim:** “Women generally care far more about what other women think than what men think. Take OnlyFans — most men say plainly they'd never seriously date a woman who does it, yet it stays popular. Why? Because her female social circle supports it, stays neutral, or at least doesn't shame her for it. Male disapproval is loud and consistent, but it loses to the approval of her peers almost every time.” → **oversimplified**

**Ruling — Oversimplified** · tier: `evidence`

> The real finding: policing of women's sexual reputation is done chiefly by other women. Baumeister & Twenge's 2002 review found the claim that men suppress female sexuality got "hardly any support" — women stifle each other's; Vaillancourt's work shows women aim indirect aggression at sexually-available peers. But female peers are the enforcers, not the ultimate audience: intrasexual competition is a contest to attract men, and OnlyFans itself runs on paying male demand. "Far more, almost every time" overreaches.

- [Vaillancourt (2013), Philosophical Transactions of the Royal Society B — women use indirect aggression to police sexually-available/attractive female peers, suppressing rivals' sexuality (incl. the Vaillancourt & Sharma 'sexy peers' experiment).](https://pmc.ncbi.nlm.nih.gov/articles/PMC3826209/)
- [Baumeister & Twenge (2002), Review of General Psychology — a cross-domain review concluding female sexuality is suppressed chiefly by other women; the idea that men do the suppressing got 'hardly any support.'](https://journals.sagepub.com/doi/10.1037/1089-2680.6.2.166)

*researchNotes:* The narrow core — female peers, not men, are the chief enforcers of women's sexual reputation — is well-supported (Baumeister & Twenge 2002; Vaillancourt 2013). But "women care far more about what other women think" is a global claim never directly tested as stated, and the OnlyFans example arguably inverts itself since the platform monetizes male demand. Verdict would move to 'confirmed' if scoped strictly to sexual-reputation sanctioning, or toward 'false' if read as a claim about all female motivation and choice.

---

## M-TBD-27 · Psychology · from GD card "The female hive mind"

**Q:** Do women move with social consensus more than men?
- **Claim:** “Women tend to operate far more as a hive mind than most people want to admit — much more sensitive to social consensus, trends, and what other women are doing and saying. If one popular woman declares something attractive (or a red flag, or a new rule), a huge share start repeating it, and it spreads like wildfire — the "6ft minimum," "never split the bill," "the bar is in hell." Men hold more individual, idiosyncratic opinions, even unpopular ones; women tend to move together.” → **oversimplified**

**Ruling — Everyone conforms** · tier: `hard-data`

> The kernel: classic meta-analytic work — Eagly & Carli's 148-study review — did report women as slightly more conforming, a small difference partly tied to masculine-biased test content. The modern record shrinks it further: a 2024 systematic review (48 articles covering 78 conformity studies) found only a minority detect any gender effect, and recent studies show no significant disparity; a 2023 Asch replication (n=202) found no sex difference while a third of judgments in the baseline condition bent to an obviously wrong majority. Conformity is human, not female; "hive mind versus independent men" is a caricature.

- [Capuano & Chekroun (2024), International Review of Social Psychology — systematic review of 78 conformity studies: only a minority find any gender effect (64 of 78 did not report gender), and recent studies show no significant male-female disparity in conformity](https://pmc.ncbi.nlm.nih.gov/articles/PMC12372704/)
- [Franzen & Mader (2023), PLoS One — Asch replication with 202 Swiss students: 33% conformity to an obviously wrong majority overall, and no statistically significant gender difference (female trend only at the 10% level)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10686423/)
- [Eagly & Carli (1981), Psychological Bulletin — the classic 148-study meta-analysis behind 'women are more influenceable'; the female-direction difference it reports is small and moderated by masculine-biased study content and researcher sex](https://eric.ed.gov/?id=EJ263542)

*researchNotes:* The strongest classic nuance stayed out of the ruling for sourcing reasons: Eagly, Wood & Fishbaugh (1981, JPSP) found the sex gap appeared mainly when responses were public, driven partly by men conforming LESS under surveillance — male "independence" as display, which cuts against the claim's framing, but no stable primary URL would fetch. Bond & Smith's 1996 meta also reported higher conformity in samples with more female respondents, so a large modern replication finding a robust female-direction effect could enlarge the kernel — though nothing in the literature approaches "hive mind" magnitude. The claim's trend-diffusion half (viral "6ft minimum" rules) has no direct literature either way; lab conformity is the nearest proxy, and it says both sexes move with the majority.

---

## M-TBD-28 · Attraction · from GD card ""I just want to feel safe" is usually just talk"

**Q:** When women say they want to feel safe, is that what they choose?
- **Claim:** “"I just want to feel safe" sounds reasonable, but a lot of the time it's pretty words. Watch the actions: the same women who say they want a safe guy are often chasing the exciting, unpredictable, slightly dangerous one who gives them butterflies. They say safety; they go for chaos. What they actually want is a guy who makes them feel safe and excited — very few want a genuinely stable, low-drama guy if he's also boring.” → **oversimplified**

**Ruling — Short-term only** · tier: `evidence`

> At first sight, the kernel holds: 128 women rated a Dark Triad character as more attractive than a control with looks held constant, and a warm, responsive male stranger earned no attraction boost — that cue works on men, not on women. But at the choosing stage the claim collapses: women picked the nice guy over the jerk roughly eight to one, and niceness was the most salient factor for serious relationships. Excitement wins the first spark; safe wins the actual pick.

- [Carter, Campbell & Muncer (2014), Personality and Individual Differences — 128 women rated a high Dark Triad male character as significantly more attractive than a control, with physicality held constant](https://ray.yorksj.ac.uk/id/eprint/1187/)
- [Birnbaum, Ein-Dor, Reis & Segal (2014), Personality and Social Psychology Bulletin — responsiveness from a stranger raised men's attraction to women but gave women no attraction boost in initial acquaintanceships](https://pubmed.ncbi.nlm.nih.gov/25062930/)
- [Urbaniak & Kilmann (2003), Sex Roles — women chose the nice guy over the insensitive one ~8:1, and niceness was the most salient factor for serious-relationship desirability (looks mattered more only for casual/sexual contexts)](https://link.springer.com/article/10.1023/A:1025894203368)

*researchNotes:* The 'chaos wins' kernel rests on limited designs — Carter et al. is a hypothetical-vignette study, and later work argues the Dark Triad's pull shrinks once confounded traits like extraversion/confidence are controlled, so a future meta-analysis could weaken that half. Birnbaum's null for women applies to initial acquaintanceship only; in established relationships responsiveness strongly predicts attraction, which actually supports the claim's own 'safe AND excited' concession. The claim's biggest miss is treating a first-attraction effect as evidence about what women choose, where kindness/stability wins decisively.

---

## M-TBD-29 · Psychology · from GD card "Most guys are terrified of being alone"

**Q:** Are most men settling out of fear of being alone?
- **Claim:** “Most guys are flat-out terrified of being alone. They'll tolerate disrespect, games, and low effort, and hold far lower standards than you would, just to avoid being single. A lot would rather sit in a shitty situationship or simp for someone who barely respects them than face being single long-term — and that desperation is exactly what inflates the entitlement on the other side.” → **oversimplified**

**Ruling — Real but overstated** · tier: `evidence`

> The mechanism checks out: people high on Spielmann's Fear of Being Single Scale stay dependent in unsatisfying relationships and warm to less responsive, less attractive partners across seven studies. The sex direction has real support too — single men are likelier to want a partner (Pew: 61% looking vs 38% of single women) and less happy single (Hoan & MacDonald, ~6,000 singles). But "most guys are terrified" overshoots: 39% of single men — the complement of Pew's 61% — aren't looking at all, and fear-driven settling appears in both sexes.

- [Spielmann, MacDonald, Maxwell, Joel, Peragine, Muise & Impett (2013), Journal of Personality and Social Psychology — fear of being single predicts settling for less: staying in unsatisfying relationships, romantic interest in less responsive/less attractive partners, and lower speed-dating selectivity (7 studies)](https://pubmed.ncbi.nlm.nih.gov/24128187/)
- [Pew Research Center (2020), A Profile of Single Americans — 61% of single men vs 38% of single women say they are looking for a relationship or dates; half of all singles are not looking](https://www.pewresearch.org/social-trends/2020/08/20/a-profile-of-single-americans/)
- [Hoan & MacDonald (2024), Social Psychological and Personality Science (via Univ. of Toronto summary) — pooled ~6,000 singles: single men report lower satisfaction with single life, lower life and sexual satisfaction, and higher desire for a partner than single women](https://www.psych.utoronto.ca/news/new-study-finds-single-women-are-happier-single-men)

*researchNotes:* Gender differences on the Fear of Being Single construct itself are mixed — Spielmann's own work reports no consistent sex difference and some adaptations find women slightly higher — so the male-typing rests on partnering-desire and singlehood-satisfaction data, not on fear scores. The claim's tail ("desperation inflates entitlement on the other side") is an untested market mechanism with no direct literature. A future meta-analysis of FOBS sex differences could push this toward false (if women score equal or higher) or firm up the male skew. Spielmann et al. (2013) carries a published correction (PubMed 30321050; Study 3 FOBS wording adapted for partnered participants, conclusions unchanged), and "appears in both sexes" rests on the paper's mixed-sex samples reporting no consistent gender difference rather than on the abstract.

---

## M-TBD-30 · Standards · from GD card "Honesty about inexperience gets punished"

**Q:** Does admitting dating inexperience read as a red flag?
- **Claim:** “Being honest about a lack of dating or relationship experience often reads as a red flag — while inventing a past full of situationships or toxic exes would probably earn more respect. People say they want an honest guy with no baggage, but when they actually meet one, they get suspicious or turned off.” → **oversimplified**

**Ruling — Real, but capped** · tier: `evidence`

> The stigma is real: across three studies of nearly 5,900 adults, sexually inexperienced people were rated less desirable partners — even by other inexperienced adults — and desirability rises from zero past partners to a modest few. But the claim overshoots on the fix: heavy histories get punished harder, with willingness to consider a long-term partner dropping sharply as counts climb (d = 0.87 from 4 to 12 partners, replicated across 11 countries). A bit of a past beats a blank slate; a pile of toxic exes beats neither.

- [Gesselman, Webster & Garcia (2017), Journal of Sex Research — three studies (~5,900 adults): sexually inexperienced adults are stigmatized and rated less desirable relationship partners, even by other inexperienced adults](https://pubmed.ncbi.nlm.nih.gov/26983793/)
- [Stewart-Williams, Butler & Thomas (2017), Journal of Sex Research — willingness to get involved rises from zero to a modest number of past partners, then falls dramatically as the history grows (N=188)](https://pubmed.ncbi.nlm.nih.gov/27805420/)
- [Thomas et al. (2025), Scientific Reports — 11-country replication (N=5,331): willingness to consider a long-term partner drops sharply as past partner count climbs (d=0.87 from 4 to 12, d=0.59 from 12 to 36), and histories that accelerate over time rate worse](https://www.nature.com/articles/s41598-025-12607-1)

*researchNotes:* All direct evidence concerns sexual history, not disclosure of dating or relationship inexperience per se — no study tests an honest admission against a fabricated past, so the "inventing toxic exes would earn more respect" counterfactual is untested inference, and the card's honesty-is-punished framing conflates the trait penalty with a disclosure penalty. The inexperience penalty is also moderated by rater sociosexuality (unrestricted raters punish low counts more; restricted raters punish high counts more). A direct disclosure experiment could push the second half of this claim to false or, less likely, confirmed.

---

## M-TBD-31 · Market · from GD card "Winner-take-most: the dating market's "Pareto problem""

**Q:** Did dating apps lock the bottom two-thirds of men out of the market?
- **Claim:** “Dating apps turned mating into a winner-take-most market — the top sliver of men get a flood of options while the bottom 60–70% get filtered out and "locked out" of dating entirely, a Pareto / 80–20 distribution.” → **oversimplified**

**Ruling — Skew, not lock-out** · tier: `hard-data`

> The attention skew is real: male Tinder test profiles converted just 0.6% of likes into matches versus 10.5% for female profiles, and messaging follows a long tail — one New York woman drew 1,504 messages in a month. But "locked out" fails arithmetic: 61% of U.S. men aged 25–54 were married or cohabiting in 2019, and Bruch & Newman found daters at every desirability level still send messages and get replies — typically aiming 25% above their own league. Unequal attention, yes; Pareto exile, no.

- [Tyson, Perta, Haddadi & Seto (2016), arXiv:1607.01952 — Tinder field experiment: male test profiles matched on 0.6% of likes vs 10.5% for female profiles; 59% of women like ≤10% of profiles they see](https://arxiv.org/abs/1607.01952)
- [Bruch & Newman (2018), Science Advances — online-dating desirability study in four U.S. cities: long-tailed message concentration (top NYC woman got 1,504 messages/month), yet users at all desirability levels message ~25% above their league and reply rates to more-desirable partners top out at ~21%](https://pmc.ncbi.nlm.nih.gov/articles/PMC6082652/)
- [Pew Research Center (2021), census analysis — 'Rising Share of U.S. Adults Are Living Without a Spouse or Partner': 38% of adults 25–54 unpartnered in 2019 (39% of men), i.e. 61% of prime-age men partnered](https://www.pewresearch.org/social-trends/2021/10/05/rising-share-of-u-s-adults-are-living-without-a-spouse-or-partner/)

*researchNotes:* Both skew studies are platform-specific and non-representative (Tyson: 14 test profiles; Bruch & Newman: one free site, four cities), so exact inequality magnitudes — including the blog-derived "Gini 0.58" — should not be quoted as population facts. The viral "75% of men left out" derivation assumes ~80% of men seek casual sex, but Pew 2023 measured 31% of male users citing casual sex as a major reason (verified: https://www.pewresearch.org/internet/2023/02/02/the-who-where-and-why-of-online-dating-in-the-u-s/). Regrade risk: unpartnered prime-age adults did drift up 29%→38% (1990–2019), so a weaker "the tail got worse" claim has legs — but Pew's Jan 2025 update (verified) shows the unpartnered share ticking down (44%→42%, 2019–2023), the opposite of an accelerating lock-out. Pew's Jan 2025 44%→42% figures cover all adults 18+, while the 29%→38% series is ages 25–54; Pew reports the decline occurred across all age groups.

---

## M-TBD-32 · Market · from GD card ""40% met online" is an average that hides the skew"

**Q:** Do most couples meet on dating apps now?
- **Claim:** “Dating apps are now where most couples meet — numbers like "40%" or even "half" get thrown around.” → **oversimplified**

**Ruling — Online, not apps** · tier: `hard-data`

> Online is the single biggest channel for newly formed couples — Rosenfeld's nationally representative HCMST data put it at 39% of heterosexual couples who met in 2017, having overtaken meeting through friends around 2013. But "online" bundles apps, sites, and social media, and 39% isn't "most." Across all existing couples, Pew (2023 report; survey July 2022, n=6,034) finds just 10% met their partner on a dating site or app — 20% among adults under 30. Biggest single channel: yes. Where most couples meet: no.

- [Rosenfeld, Thomas & Hausen (2019), PNAS — 39% of heterosexual couples who met in 2017 met online; online eclipsed friends ~2013; apps are a subset of "online"](https://pmc.ncbi.nlm.nih.gov/articles/PMC6731751/)
- [Rosenfeld, Thomas & Hausen (2019), PNAS 116(36) — PubMed record confirming venue, DOI 10.1073/pnas.1908630116, and the "most popular way couples meet, eclipsing friends around 2013" abstract claim](https://pubmed.ncbi.nlm.nih.gov/31431531/)
- [Pew Research Center (2023), Key findings about online dating in the U.S. — 10% of partnered adults (20% under 30) met their current partner on a dating site or app](https://www.pewresearch.org/short-reads/2023/02/02/key-findings-about-online-dating-in-the-u-s/)

*researchNotes:* BONUS verified with a caveat: the direct PNAS URL for Rosenfeld, Thomas & Hausen (2019) is https://www.pnas.org/doi/10.1073/pnas.1908630116 — title and DOI match the PubMed record exactly, but pnas.org returned HTTP 403 to the fetcher this session, so the PMC/PubMed mirrors above are the fetch-verified anchors. Regrade risk: later HCMST waves (2020/2022) reportedly push the online share for NEWLY formed couples above 50%, which would make "half meet online" fair for new couples (still online, not apps) — I found only secondhand write-ups, no fetchable primary, this session. The 40%-online vs 10%-on-apps gap is partly stock-vs-flow: HCMST measures how recent couples met, Pew measures all current couples.

---

## M-TBD-33 · Market · from GD card "The situationship economy"

**Q:** Have situationships become the dominant form of dating?
- **Claim:** “Situationships have become the dominant form of dating, and the incentives explain why. Women with abundant options often don't want to lock down one guy — they want the benefits of a relationship (attention, emotional support, sex, validation) without the commitment, while keeping their options open in case someone better shows up. Meanwhile a lot of guys are so starved for attention and affection that they'll accept those half-assed terms just to have some connection.” → **oversimplified**

**Ruling — Common, not dominant** · tier: `evidence`

> No. Situationships are genuinely widespread — a 2024 YouGov poll finds half of 18–34-year-olds have ever been in one, and a 2026 college-sample study classified 34% of relationship experiences as situationships — but committed relationships still outnumbered them in the one sample that measured the mix (65.9% vs 34.1% in the college study). The claim's gendered engine also runs backwards: in Pew's representative sample, women daters are the ones likelier to want commitment-only (36% vs 22% of men). Common, rising, and worth naming; dominant, no.

- [Langlais & Davidson (2026), Sexuality & Culture — 34.1% of 468 college relationship experiences were situationships (defined as unlabeled, low-commitment but romantically behaving ties); situationships predicted lower trust than non-situationship (primarily committed) relationships](https://link.springer.com/article/10.1007/s12119-026-10592-9)
- [Pew Research Center (2020), A Profile of Single Americans — among singles looking to date, 28% want committed-only, 20% casual-only, 53% either; women likelier than men to seek commitment-only (36% vs 22%)](https://www.pewresearch.org/social-trends/2020/08/20/a-profile-of-single-americans/)
- [YouGov (2024), representative US poll (n=1,110) — 39% of US adults and 50% of 18–34s have ever been in a situationship](https://yougov.com/en-us/articles/48492-half-of-18-to-34-aged-americans-have-been-in-a-situationship)

*researchNotes:* The direct situationship literature is young (2024–2026, convenience and qualitative samples), and the headline prevalence figures are lifetime "ever been in one," not the current modal form — so "dominant" fails but the phenomenon is real. Pew's committed-vs-casual fieldwork is 2019, predating the situationship boom; a representative time-series of current relationship-type mix could shift the magnitude call. The gendered engine could still operate in a high-desirability submarket without appearing in population averages, but as stated it is contradicted by the representative data.

---

## M-TBD-34 · Attraction · from GD card "Bluepill hope vs blackpill despair"

**Q:** What decides a man's dating success — learnable game or fixed looks?
- **Claim (Bluepill):** “Game, charisma, confidence, and self-improvement could get almost anyone into the running: learn to talk to girls, dress decently, and you can compete.” → **oversimplified**
- **Claim (Blackpill):** “It's not about game at all, it's about looks, height, jawline, and frame. Many decided the game was rigged before they ever stepped on the field.” → **oversimplified**

**Ruling — Both overshoot** · tier: `hard-data`

> Both poles overshoot. In real speed-dating studies (Asendorpf, Penke & Back 2011, n=382 followed a year; Eastwick & Finkel 2008), physical attractiveness is the single most powerful predictor of being chosen — so the bluepill's "almost anyone can compete on game alone" is too rosy. But for men, women additionally weighted sociosexuality, low shyness, openness, education and income — controllable factors — so the blackpill's "it's not about game at all, the fixed face decides" overshoots too. Looks lead; they don't lock the gate.

- [Asendorpf, Penke & Back (2011), European Journal of Personality — n=382 community speed-dating sample followed a year; both sexes chose mainly on physical attractiveness, and women additionally weighted men's sociosexuality, openness, low shyness, education and income.](https://www.larspenke.eu/pdfs/Asendorpf_Penke_Back_2011_-_Speed_dating_mating_relating.pdf)
- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — physical attractiveness predicted romantic interest similarly for both sexes in live speed dating, and pre-stated ideal preferences failed to predict actual desire at the event.](https://pubmed.ncbi.nlm.nih.gov/18211175/)

*researchNotes:* Attractiveness-as-lead-predictor is well-replicated (also Luo & Zhang 2009, J. Personality, and Feingold 1990's meta-analysis, both cited within Asendorpf; Wiley copy of Luo & Zhang was paywalled/402 so it is corroboration, not a cited source). Height is a genuine fixed-looks advantage for men (Pawlowski, Dunbar & Lipowicz 2000, cited within Asendorpf), which is why the blackpill isn't simply "false" — but leanness, low shyness, social boldness and status are movable, so the "rigged before you start" fatalism overshoots just as the bluepill's "game gets anyone in" ignores that looks are the main driver. Verdict would shift only if a study showed game/confidence actually closing the attractiveness gap in real choices, which current speed-dating data do not.

**Audit repair applied:** text "is false" → "overshoots too" to match the oversimplified verdict

---

## M-TBD-35 · Market · from GD card ""There's someone out there for everyone" is a comforting lie"

**Q:** Is there someone out there for everyone?
- **Claim:** “There's someone out there for everyone.” → **false**
- **Claim (The blackpill):** “It's not guaranteed for everyone — therefore it's hopeless for me specifically.” → **false**

**Ruling — Both wrong** · tier: `hard-data`

> No. The guarantee is dead on the data: a record 25% of US 40-year-olds had never married by 2021, and Pew projected in 2014 that a quarter of then-young adults would still be unmarried by their mid-40s to mid-50s — versus 5% for the cohort that hit midlife in 1980. But the blackpill inference dies on the same page: of those still unmarried at 40 in 2001, one in four married by age 60, and 22% of never-married 40-to-44-year-olds were cohabiting (2022). Lifelong aloneness is a real minority outcome — not a fixed sentence for any individual.

- [Pew Research Center (2023), Census/ACS analysis — record 25% of US 40-year-olds never married in 2021 (vs 20% in 2010); 22% of never-married 40-44s cohabit; of those unmarried at 40 in 2001, about 1 in 4 had married by 60](https://www.pewresearch.org/short-reads/2023/06/28/a-record-high-share-of-40-year-olds-in-the-us-have-never-been-married/)
- [Wang & Parker (2014), Pew Research Center — 'Record Share of Americans Have Never Married'; projects 25% of today's young adults will never have married by their mid-40s to mid-50s, vs 5% for the cohort that reached midlife around 1980](https://www.pewresearch.org/social-trends/2014/09/24/record-share-of-americans-have-never-married/)
- [Pew Research Center (2025), Census/ACS analysis — 42% of US adults unpartnered (not married or cohabiting) in 2023, but only 29% among ages 40-54; young men more often unpartnered than young women](https://www.pewresearch.org/short-reads/2025/01/08/share-of-us-adults-living-without-a-romantic-partner-has-ticked-down-in-recent-years/)

*researchNotes:* Never-married is not never-partnered — cohabitation and non-cohabiting relationships mean the true lifetime-alone base rate is fuzzier (and lower) than the 25% marriage stat, while point-in-time "unpartnered" figures include the divorced and widowed. The card's sharper claim that below-average men specifically drive the alone-for-life pool is plausible (marriage gradients by income/education exist) but was not directly verified here; attractiveness-stratified lifetime-partnering data would be the regrade trigger. Both verdicts are robust to that: the universal guarantee and the individual-hopelessness inference each contradict the same Census/ACS numbers.

---

## M-TBD-36 · Signals · from GD card "You signal it — you just don't shoot"

**Q:** Do women initiate more than either side realizes?
- **Claim:** “When you're interested, it tends to leak out indirectly rather than as an explicit move: lingering nearby, remembering small details, laughing harder than the joke earned, finding little reasons to talk to him, going quiet or flustered when he's around. Field studies of courtship found women actually initiate most encounters through exactly these covert nonverbal signals — and that men often don't consciously register that she signaled first (Moore, 1985).” → **todo**

**Ruling — TODO** · tier: `todo`

> TODO


*researchNotes:* Grading attempt (2026-07-06 Fable loop) HELD BACK by the source-integrity audit: the proposed "Holds up" ruling leaned on load-bearing figures — Moore's 52-behavior catalog, Perper's ~two-thirds female-first-move share, de Weerth & Kalma's finding that both sexes are unaware who initiates — that trace to works not fetch-verified this session (Moore 1985, Ethology & Sociobiology; Moore 2010, J. Sex Research, PubMed 20358459; Perper 1985, Sex Signals; de Weerth & Kalma 1995, Sex Roles). Wade (2018, PMC6701824) does verify Moore's 15-second approach-correlation finding. Regrade path: fetch-verify Moore 2010 (restates the catalog and the signaling-frequency→approach relationship) plus de Weerth & Kalma, then "Holds up" is likely defensible.

---

## M-TBD-37 · Attraction · from GD card "Looks are the first filter — for both sexes"

**Q:** Is the looks filter male-only, or do both sexes run it?
- **Claim:** “Physical attraction is the first filter for both sexes — not just men. If she's not attractive enough, most men feel no desire; if he's not attractive enough, most women feel none either. The real difference isn't the mechanism, it's the honesty about it. Everything else — personality, confidence, game — only gets weighed once that first physical filter is passed.” → **oversimplified**

**Ruling — Mostly holds up** · tier: `hard-data`

> In live interactions, physical attractiveness predicts romantic interest at r ≈ .40 for both sexes — the sex difference is .03 and nonsignificant across a 97-study meta-analysis — and in a speed-dating study it was the single strongest predictor for men and women alike. The stated-preference gap is real, but behavioral parity wins: both sexes run the filter. Two trims: attractiveness is the dominant weight, not a literal pass-first gate; and "honesty" is the wrong word — stated ideals fail to predict live desire for either sex, so it's poor self-insight, not packaging.

- [Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin — 97-study meta-analysis: physical attractiveness predicts romantic evaluations at r ≈ .40 for both sexes; sex difference r = .03, uniformly nonsignificant](https://pubmed.ncbi.nlm.nih.gov/23586697/)
- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — stated ideals show the classic sex gap, but at a live speed-dating event there were no sex differences in how partners' attractiveness drove romantic interest, and pre-event ideals failed to predict in-event desire](https://pubmed.ncbi.nlm.nih.gov/18211175/)
- [Luo & Zhang (2009), Journal of Personality — speed-dating study: partners' physical attractiveness was the strongest predictor of attraction for both sexes; no support for personality similarity](https://pubmed.ncbi.nlm.nih.gov/19558447/)

*researchNotes:* The strict gate wording ("everything else only gets weighed once the filter is passed") is stronger than the data, which show dominant weighting rather than a literal lexicographic screen; Luo & Zhang also found partner characteristics predicted men's attraction better than women's, so the symmetry isn't perfect. The card's "honesty" framing is the main regrade risk: Eastwick & Finkel read the stated/revealed gap as poor introspective access in both sexes, not deliberate female dressing-up — the mechanism parity is hard data, the motive attribution is not.

**Audit repair applied:** regraded confirmed → oversimplified, badge → "Mostly holds up" (ruling itself corrects part of the claim)

---

## M-TBD-38 · Standards · from GD card "Principles are cheap when untested"

**Q:** Do stated standards survive when someone desirable actually shows up?
- **Claim:** “The standards that genuinely hold when an attractive, in-demand person actually shows interest are far fewer than the ones stated when nobody desirable is around. For a lot of people those principles quietly evaporate the moment someone they really want — someone with options — is the one pursuing them. It runs both ways: women who swear off "fuckboys" until the hot one with options wants them, men who insist they're "not shallow" until a 10 shows interest.” → **confirmed**

**Ruling — Holds up** · tier: `hard-data`

> Mostly, no. Ideals govern the abstraction, not the person: when traits were experimentally matched to people's stated ideals, matching drove romantic interest in written profiles — and the effect vanished after a live interaction, because people reinterpret traits to fit whoever is in front of them. Across a 97-study meta-analysis, a partner's physical attractiveness predicted romantic evaluations at roughly r = .40 for both sexes, while stated priorities failed to forecast live speed-dating desire. It runs both ways, as claimed: stated standards are the brochure; live desire is the purchase.

- [Eastwick, Finkel & Eagly (2011), Journal of Personality and Social Psychology — ideal-matching boosts romantic interest in written profiles but the effect disappears after a live interaction; people reinterpret traits to fit the actual person](https://pubmed.ncbi.nlm.nih.gov/21707198/)
- [Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin — 97-study meta-analysis: partner attractiveness predicts romantic evaluations at r ≈ .40 for both sexes; framework centers the live-vs-hypothetical gap in preference-matching validity](https://pubmed.ncbi.nlm.nih.gov/23586697/)
- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — stated ideal preferences failed to predict actual desire at a speed-dating event; no sex differences in live romantic interest](https://pubmed.ncbi.nlm.nih.gov/18211175/)

*researchNotes:* Ideals aren't empty: Gerlach et al. 2019 (JPSP, PMID 28921999, verified this session) found stated preferences prospectively predicted later partners' traits in a naturalistic sample — standards shape who you orbit; they bend on contact, and people also revised ideals downward to fit partners who fell short. Caveat/regrade risk: this literature tests trait ideals broadly, not moral deal-breakers (e.g., body count) under active pursuit by a high-option suitor — direct evidence that deal-breakers specifically hold or collapse live could shift the verdict toward oversimplified.

---

## M-TBD-39 · Market · from GD card "She feels like a body; he feels like a wallet"

**Q:** Do both sexes reduce each other — to a body and a wallet?
- **Claim:** “A lot of men treat women like sex objects — interested only until it's clear sex isn't happening easily, then gone. A lot of women treat men like walking wallets — interested only until it's clear he can't provide the money, status, or lifestyle, then gone. Both sides end up feeling valued for what they can supply — a body, a paycheck — rather than for who they are.” → **oversimplified**

**Ruling — Real but lopsided** · tier: `hard-data`

> Both currencies are documented. Across 45 countries (N=14,399), women rate financial prospects higher and men rate looks and youth higher in stated preferences — and a 1990 personal-ads study was literally titled "men as success objects and women as sex objects." But the mirror is lopsided: in live speed-dating, both sexes' actual desire tracked looks about equally, and earning prospects only weakly — for both alike. The body screen operates in real-time behavior for everyone; the wallet screen's sex skew lives in stated standards and long-term provider expectations, not instant verdicts.

- [Walter, Conroy-Beam, Buss et al. (2020), Psychological Science — 45-country replication (N=14,399): women rate financial prospects in a mate higher than men do, men rate physical attractiveness and youth higher](https://labs.la.utexas.edu/buss/files/2020/03/Sex-Differences-in-Mate-Preferences-Across-45-Nations-2020.pdf)
- [Davis (1990), Sex Roles — 328 newspaper personal ads: men emphasized seeking physical characteristics, women emphasized employment, financial and intellectual status ('men as success objects, women as sex objects')](https://link.springer.com/article/10.1007/BF00289878)
- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — speed-dating: stated sex differences (looks vs earning prospects) failed to predict live romantic interest; no sex differences in how partners' attractiveness or earning prospects drove actual desire](https://pubmed.ncbi.nlm.nih.gov/18211175/)
- [Eastwick, Luchies, Finkel & Hunt (2014), Psychological Bulletin — meta-analysis (k=97): physical attractiveness predicted romantic evaluations at r≈.40 and earning prospects at r≈.10 for both sexes; sex differences nonsignificant](https://pubmed.ncbi.nlm.nih.gov/23586697/)

*researchNotes:* Killewald (2016, American Sociological Review) corroborates the provider half downstream: in post-1975 marriages, husbands not employed full-time faced higher divorce risk while wives' employment and couples' finances predicted nothing — a gendered-expectations effect, not literal wallet-mining (verified only via the ScienceDaily/ASA press summary; the journal and Harvard pages returned 403, so it is not cited). Regrade risks: speed-dating samples are young and income-compressed, which can understate real-world wallet-screening; conversely, the "gone once sex is off the table" male pattern rests more on stated hookup motives than on direct behavioral tests.

**Audit repair applied:** effect-direction fix: E&F 2008 = weak positive earnings effect with NO sex difference, not a null; Eastwick 2014 k=97 meta added to hold hard-data

---

## M-TBD-40 · Signals · from GD card "Soft truth vs blunt truth"

**Q:** Do men and women reject differently — cushioned versus blunt?
- **Claim:** “Rejection tends to come in two flavors, split loosely along sex lines. Women more often get — and give — the cushioned version: "I'm busy," "I'm not ready," a slow fade, anything that dodges a hard no. Men, leaning more direct, are likelier to deliver the unvarnished version, sometimes brutally ("I'm just not attracted to you").” → **oversimplified**

**Ruling — Lens, not law** · tier: `evidence`

> Only loosely. Indirect, face-saving rejection is common for both sexes, and the documented driver is safety, not rejector sex. Women report roughly twice men's worry about the repercussions of saying no — being hit, followed, touched (n=465) — and salient safety concerns push rejectors toward ghosting. But in a 414-person registered report, male and female rejectors responded alike (no significant gender interaction), and meta-analytic sex differences in assertive speech are negligible (d=.09). The "men reject brutally" half has no direct evidence. A lens, not a law.

- [Freedman, Hales, Powell, Le & Williams (2022), Journal of Experimental Social Psychology — registered report: safety concerns raise ghosting (indirect-rejection) intentions; pilot leaned toward more ghosting of male targets, but the main study (analytic n=414 of 526 targeted) found no significant rejector-gender differences](https://gilifreedman.com/GenderSafetyGhosting.pdf)
- [Moran & Burch (2023), International Journal of Sexual Health — n=465; women's worry about repercussions of rejecting an advance was double men's (36.8 vs 18.1), with far higher fear of being hit, followed, or touched, and more avoidance/safety-focused rejection strategies](https://pmc.ncbi.nlm.nih.gov/articles/PMC10830141/)
- [Leaper & Ayres (2007), Personality and Social Psychology Review — meta-analysis of adult language use: sex differences in assertive (d=.09, men) and affiliative (d=.12, women) speech are statistically significant but negligible](https://pubmed.ncbi.nlm.nih.gov/18453467/)

*researchNotes:* No study directly measures whether men deliver verbally harsher romantic rejections — that half of the claim rests on anecdote, and Freedman's ns trend (p=.058) plus women's clearly documented safety fears mean a larger study could still surface a modest rejector-sex difference (regrade risk toward a weak confirm). Freedman's main sample was bisexual US adults, limiting generalization; ghosting-prevalence studies report mixed or null gender differences. The site's own source card already hedges the claim as a lens, which this ruling formalizes.

**Audit repair applied:** n corrected 526 (recruitment target) → 414 (analytic sample) in text + label

---

## M-TBD-41 · Standards · from GD card ""Dating for potential" is half-true"

**Q:** Does dating for potential pay off?
- **Claim:** “I date for potential.” → **oversimplified**

**Ruling — Half-true** · tier: `evidence`

> Half of this line is bankable: in Buss's 37-culture data (N=10,047) and the 45-country 2020 replication (N=14,399), women rate a partner's financial prospects higher than men do (both datasets), and ambition too (Buss 1989) — trajectory genuinely counts on paper. The other half isn't: in live speed-dating, stated preferences for earning prospects failed to predict whom people actually desired. Visible momentum gets credited; unrealized potential mostly doesn't. "Dating for potential" describes questionnaires better than choices — a demonstrated trajectory beats a promised one.

- [Buss (1989), Behavioral and Brain Sciences — 37 cultures, N=10,047: women value earning capacity and ambition–industriousness in mates more than men do](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/sex-differences-in-human-mate-preferences-evolutionary-hypotheses-tested-in-37-cultures/0E112ACEB2E7BC877805E3AC11ABC889)
- [Walter, Conroy-Beam, Buss et al. (2020), Psychological Science — 45-country replication (N=14,399): women, more than men, prefer mates with good financial prospects](https://pubmed.ncbi.nlm.nih.gov/32196435/)
- [Eastwick & Finkel (2008), Journal of Personality and Social Psychology — stated preferences for earning prospects failed to predict live romantic interest in speed-dating](https://pubmed.ncbi.nlm.nih.gov/18211175/)

*researchNotes:* The disconfirming half rests mainly on Eastwick & Finkel 2008 — a single US speed-dating sample measuring initial attraction, not long-term commitment decisions, where resource/trajectory considerations plausibly matter more; a longitudinal study tying partner ambition to actual pairing or marriage outcomes could push this toward confirmed for long-term contexts. No direct literature was found on the card's specific "patience with unrealized potential over the years" mechanism — that part remains inference, not measured evidence.

**Audit repair applied:** tier hard-data → evidence (disconfirming half is single-study); ambition attribution split by dataset

---

## M-TBD-42 · Market · from GD card "Same complaint, new villain every generation"

**Q:** Is "there are no good men left" a report on this era?
- **Claim:** “"There are no good men left" lands like a verdict on this exact moment — but it's a rerun that's been playing for a century. The 1920s had "men don't know how to court anymore." The 70s had "men are threatened by independent women." The 2000s had "where have all the good men gone." After 2017 it was "men are trash." The complaint itself never changes; only the villain gets a fresh costume each generation.” → **confirmed**

**Ruling — Century-old rerun** · tier: `evidence`

> Mostly no — it's a genre. A 1918 letter in The Hospital was already headlined "The Shortage of Husbands"; historians document Americans declaring a national marriage crisis "again and again" across the twentieth century; by 2003 the complaint was a book title (Why There Are No Good Men Left). The rerun is real. One caveat keeps it honest: reruns aren't always noise — Lichter et al. (2020) find unmarried women's would-be husbands out-earn actually available single men by about 58%, so today's version does track a measurable mismatch.

- [Walker (1918), The Hospital — letter headlined 'The Shortage of Husbands', proof the complaint is at least a century old](https://pmc.ncbi.nlm.nih.gov/articles/PMC5233321/)
- [Fernandez (2019), Jotwell: Legal History — review of Kuby, Conjugal Misconduct (2018), documenting recurring 'national marriage crisis' panics across the twentieth century](https://legalhist.jotwell.com/the-marriage-crisis-and-its-many-backlashes-in-twentieth-century-america/)
- [Lichter, Price & Swigert (2020), Journal of Marriage and Family — 'synthetic husbands' out-earn actually available unmarried men by ~58% (90% vs 70% employed; 30% vs 25% college)](https://ouci.dntb.gov.ua/en/works/4MLX0nd7/)
- [Whitehead (2003), Why There Are No Good Men Left: The Romantic Plight of the New Single Woman — publisher's page confirming title, author, and 2003 publication](https://www.penguinrandomhouse.com/books/189752/why-there-are-no-good-men-left-by-barbara-dafoe-whitehead/)

*researchNotes:* The claim's decade-by-decade wordings are loose paraphrases: the verified anchors are 1918 (husband-shortage letter), early-1900s–1930s marriage-crisis panics (Kuby via Jotwell), and 2003 (Whitehead's "Why There Are No Good Men Left" — Penguin Random House page fetched this session); I did not verify era primaries for the specific 1920s "can't court" and 1970s "threatened by independent women" phrasings, nor a scholarly primary for post-2017 "men are trash." Regrade risk: if the claim is read as "therefore nothing real ever changed," Lichter et al. 2020 (and the genuine post-WWI male deficit behind the 1918 instance) cut against it — some reruns tracked real market shifts, which is why the caveat sits in the ruling text.

**Audit repair applied:** Whitehead 2003 publisher page added as 4th source (2003 anchor was uncited)

---

## M-TBD-43 · Market · from GD card "How couples actually meet: college and lucky accidents"

**Q:** Where do the couples who actually marry meet?
- **Claim:** “Ask how the actual married couples you know got together and a pattern shows up fast. A big chunk met in college. The rest mostly met through some version of a lucky accident. Most people who end up married weren't social butterflies running elaborate game with tons of dating reps. They got dropped into a high-contact environment, or got lucky once and didn't fumble it.” → **oversimplified**

**Ruling — Apps, not college** · tier: `hard-data`

> In the nationally representative HCMST surveys, "met in college" was never a big chunk — about 9% of heterosexual couples at its 1995 peak, 4% by 2017. Among 19,131 Americans married 2005–2012, all school combined was 11% of the couples who met offline — roughly 7% of all marriages. The claim's core survives: most spouses met through repeated-contact channels — friends (33% in 1995, 20% by 2017), work, school, bars — not elaborate game. But the biggest channel is now deliberate search, not luck: meeting online reached ~39% of couples by 2017, and over a third of recent marriages began online.

- [Rosenfeld, Thomas & Hausen (2019), PNAS — HCMST 2009+2017 (N=5,421 heterosexual couples): met in college 9%→4% (1995–2017); online 2%→39%, overtaking friends (33%→20%) around 2013](https://pubmed.ncbi.nlm.nih.gov/31431531/)
- [Rosenfeld, Thomas & Hausen (2019) author manuscript, Stanford — full text carrying Table 1's venue percentages, incl. the college 9%→4% figures](https://web.stanford.edu/~mrosenfe/Rosenfeld_et_al_Disintermediating_Friends.pdf)
- [Cacioppo, Cacioppo, Gonzaga, Ogburn & VanderWeele (2013), PNAS — 19,131 Americans married 2005–2012: >1/3 of marriages began online; offline venues led by work (21.7%) and friends (19.1%), all school 11.0% — shares among offline-met couples](https://pmc.ncbi.nlm.nih.gov/articles/PMC3690854/)

*researchNotes:* BONUS verified: doi.org/10.1073/pnas.1908630116 302-redirects to https://pnas.org/doi/full/10.1073/pnas.1908630116 (i.e. the canonical page https://www.pnas.org/doi/10.1073/pnas.1908630116 is real), but pnas.org itself returns HTTP 403 to automated fetches — use the DOI or PubMed link for the site's pending empty-url source. Caveat: HCMST counts all couples, but the paper's footnote 1 says results are unchanged when restricted to married couples, and Cacioppo 2013 is marriages-only, so the ruling holds for "couples who actually marry." Regrade risk: among college graduates specifically the met-in-college share is much higher (the widely quoted ~28% same-school figure traces to a non-citable Facebook Data Science blog post) — a peer-reviewed grads-only analysis could soften "never a big chunk" for degree-holding social circles, which is plausibly the friend group the card is describing.

**Audit repair applied:** denominator fix: school 11% is share of OFFLINE-met couples (≈7% of all marriages); Cacioppo URL swapped to the PMC full text that carries Figure 1C

---

## Held entries

### M-TBD-4 — What counts as a crush?

*researchNotes:* Verified definitional anchors (all fetched and confirmed this session) for the eventual grading: (1) O'Sullivan, Belu & Garcia (2022), Journal of Social and Personal Relationships — https://journals.sagepub.com/doi/10.1177/02654075211038612 — peer-reviewed crush studies (n=3,585 adults 22-45) defining a "crush" as a typically unilateral, unreciprocated attraction not directly communicated to the target, "a state of unfulfilled longing"; (2) Bradbury, Short & Bleakley (2024, online first; vol. 2025), Journal of Police and Criminal Psychology — https://link.springer.com/article/10.1007/s11896-024-09674-x — scoping review crediting Tennov (1979, 300+ interviews) for "limerence," defined as involuntary obsessive longing for another's attention, and explicitly contrasting it with a crush, whose "feelings of intense longing come and go"; (3) Wyant (2021), Journal of Patient Experience — https://pubmed.ncbi.nlm.nih.gov/34869848/ — clinical case study defining limerence as obsessive attachment to a "limerent object" that interferes with daily functioning, with Tennov's Love and Limerence (1979) as reference 1. Caveat: the APA Dictionary of Psychology entries for infatuation/limerence (dictionary.apa.org) could NOT be fetch-verified — the pages are JS-rendered and return only a title shell — so they cannot clear the sourcing bar via fetch; the three journal anchors above should be used instead. No verdicts proposed; grading blocked until Ani's primary quote replaces Jason's summary.

### M-TBD-36 — Do women initiate more than either side realizes?

*researchNotes:* Grading attempt (2026-07-06 Fable loop) HELD BACK by the source-integrity audit: the proposed "Holds up" ruling leaned on load-bearing figures — Moore's 52-behavior catalog, Perper's ~two-thirds female-first-move share, de Weerth & Kalma's finding that both sexes are unaware who initiates — that trace to works not fetch-verified this session (Moore 1985, Ethology & Sociobiology; Moore 2010, J. Sex Research, PubMed 20358459; Perper 1985, Sex Signals; de Weerth & Kalma 1995, Sex Roles). Wade (2018, PMC6701824) does verify Moore's 15-second approach-correlation finding. Regrade path: fetch-verify Moore 2010 (restates the catalog and the signaling-frequency→approach relationship) plus de Weerth & Kalma, then "Holds up" is likely defensible.


---

# doctrine-backlog-harvest-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-backlog-harvest-01.md`

# Doctrine Backlog — Harvest #1

**Source:** Pew Research Center, "Key findings about online dating in the U.S." (Feb 2, 2023; survey of 6,034 U.S. adults, July 2022). Tier 1.
**Run:** LE Lab v=1.7 · canon 1.0.0+6dc9bff7b0fe · 2026-07-26 · 34 retained claims (30 machine + 4 visitor includes) · 50% mapped · 17 research candidates · 4 pressure tests · 5 set-asides (all sentence-splitter shards, correctly binned).

---

## A. What LE already covers (validation, no action)

Seventeen claims mapped, Statistics dominating (~69% of mappings). The source *corroborates* existing canon rather than challenging it — alignments are Supports/Resembles throughout, no Contradicts:

- App usage, motives, and the casual-sex gender gap → "Why people are actually on the apps", "Casual sex is the only reason with a gender gap" (best match of the run, 63/100).
- Meeting-channel shift → "Do most couples meet on dating apps now?"
- Message-volume asymmetry (women's half) + safety-perception gap → "The same market floods one side and starves the other."
- Male disengagement signal → "Are men checking out of dating?"

## B. Doctrine candidates (my triage of the 17 queue items, grouped into proposed artifacts)

Ranked by evidence strength × distinctness from existing canon:

1. **The inbox asymmetry (chart).** 54% of women felt overwhelmed by messages vs 25% of men; 64% of men felt insecure from lack of messages vs 40% of women. The overwhelmed half already maps to "floods one side"; the insecure half is unmapped. One chart, four bars, Tier 1 — the cleanest single-source statistical portrait of the attention imbalance LE already argues. → **Statistics**, companion cross-cite to the floods/starves chart.
2. **Pay-to-play and who pays (chart + Frameworks note).** 35% ever paid; men 41% vs women 29%; paid users report better experiences (58% vs 50% positive). Reads as men buying exposure — a live tie-in to the Exposure lever and the market-asymmetry doctrine. Pressure test correctly flags the selection effect (happier users may simply be the ones who'd pay); keep that caveat in the method line. → **Statistics**, cross-cite Five Levers · Exposure.
3. **The harassment ladder, women under 50 (chart).** 56% unsolicited explicit images / 43% continued contact after refusal / 37% offensive names / 11% threats of physical harm. Pairs with the safety-perception dip (53%→48% since 2019) and 60% support for background checks. → **Statistics**; possible Gender Dynamics cross-cite.
4. **Who actually meets scammers (Mythbuster candidate).** 52% of all users have encountered a suspected scammer — and men under 50 are the *most* likely to say so (63%), against the grandma-victim stereotype. Docket question: "Are romance-scam targets mostly older women?" → **Mythbuster**, with FTC loss-data as the second source before grading.
5. **The abundance trap (doctrine gap — Frameworks candidate).** 37% say the apps offer too many options; only 13% say too few. Queue found no credible canon home — LE appears to have no choice-overload/paradox-of-choice doctrine despite it underpinning several existing arguments (rotation, the 80/20 discourse, decision fatigue). This is the run's genuinest *doctrine* gap. → **Frameworks**, needs the psych literature (Schwartz, Iyengar) before drafting.
6. **Under-30 disillusionment (coverage gap).** 18–29s split 35/33 on whether apps made partner-search easier, vs 42/22 among all adults. LE already asserts this vibe ("Blackpilled before they start", GD) — this is the missing numeric anchor. → **Statistics** garnish or GD card citation upgrade.
7. **Algorithm skepticism (Lexicon/low priority).** Only 21% believe matching algorithms can predict love. Amusing reflexive angle for the compatibility-calc pages' honesty notes.
8. **Platform demographics (context only).** Tinder 46% overall / 79% of under-30 users; Match dominates 50+; usage by age and marital status. Chart garnish, low doctrine value on its own.

## C. Lab defects surfaced by the run (process outputs, not doctrine)

1. **Intake segmentation bug — "vs." shards (loop assignment candidate, small and bounded).** The sentence splitter breaks on the period in "vs." inside parentheticals: five orphan fragments ("27%).", "16%).", …) were set aside, and worse, their parent claims are retained *truncated* ("…more likely than women to have tried online dating (34% vs."). Degrades ledger and export quality on any stats-heavy source. Fix: abbreviation guard (vs., U.S., e.g., i.e., approx., No.) in claim-unit segmentation + a regression test on a parenthetical-stats fixture. Propose as the next loop assignment after the intake cleanup merges.
2. **Gate vocabulary gap — dating-app mechanics (benchmark-append proposal).** Four genuine in-domain claims were set aside because no frame covers app-interaction vocabulary (messages received, matches, profiles, swipes): the men's-insecurity stat, the 9%-past-year continuation, the threats-of-harm stat, and the algorithm-belief continuation. All were recovered via visitor includes (the fail-open contract worked), but the miss family is systematic. Proposal per governance: ~6 agreed benchmark appends (app-mechanics claims labeled retain + 2 non-domain "message/match" traps labeled ignore) + one systematic fix (a dating-app-interaction outcome/mechanism frame). Requires Jason + reviewer sign-off before any classifier change.
3. **Anaphora cue narrowness (note only).** "That includes…" / "By contrast,…" continuations don't qualify for context inheritance. Later prototyping (see `md/lab-benchmark-append-proposal-01.md`) showed the cue extension does not deliver these cases — the continuity gate correctly blocks zero-overlap continuations — so this family is a documented known limitation handled by the include override.

---

## Post-triage correction (2026-07-27)

Cross-checking the B-list against the live site — which the original triage failed to do — found two candidates already shipped:

- **B1 (inbox asymmetry) exists** as `statistics.html#stat-attention` ("The same market floods one side and starves the other"), with the identical four Pew bars. Withdrawn. The Lab called its second half unmapped not because doctrine was missing but because the canon entry's retrieval vocabulary was thin — fixed by overlay enrichment (aliases/phrases for message-asymmetry language); the 64%-insecure claim now maps to that chart at High confidence (0.715, Supports).
- **B3 (harassment ladder) mostly exists** as `statistics.html#stat-safety` (3 of 4 rungs, women-under-50 vs all users). Withdrawn as a chart; the missing "continued contact after saying not interested" (43%) rung is an optional micro-addition.

**Revised ranking of genuinely new items:** 1. pay-to-play chart (B2) ✔ shipped as `#stat-pay-to-play` (c14ce3c) · 2. who-meets-scammers Mythbuster (B4 — zero scam coverage anywhere on the site, confirmed) ✔ shipped as M-TBD-65 with FTC spotlights 2022+2023 as the second source (5d0f1a2, 2026-07-27) · 3. abundance-trap framework (B5) ✔ shipped as `frameworks.html#abundance-trap` + Lexicon term, with the Scheibehenne/Chernev replication honesty built in (50969e1, 2026-07-27) · 4. under-30 disillusionment garnish (B6) ✔ shipped as a `#stat-couples-meet` note line (42/22 vs the under-30 35/33 dead heat) · 5. algorithm skepticism (B7) ✔ shipped in the Compatibility Calculator's honesty note (21% believe, and the tool agrees with the skeptics). The optional 43% continued-contact rung also landed on `#stat-safety` (30% all users / 43% women under 50). **HARVEST #1 FULLY EXECUTED, 2026-07-27** — all five ranked items plus the optional micro-add are live; both process defects (C1 segmentation, C2 append #1) are fixed in the Lab.

**Standing discipline from this error:** backlog triage must verify every candidate against the live site, never against Lab mapping verdicts alone — an unmapped verdict can mean the canon index under-represents an existing page, and the fix is overlay enrichment, not new doctrine. That reverse direction (source pressure-testing the index) is a designed product output, and this was its first confirmed catch.

---
*Overrides used in this run: 4 includes, disclosed in the analysis and exports. Set-asides remaining: 5 shard fragments (5 words), correctly non-domain. Follow-ups: C1 → loop assignment 2 (abbreviation-safe segmentation); C2 → `md/lab-benchmark-append-proposal-01.md` (landed 2026-07-27 as benchmark append #1, commits 9be7c3b + c02becb); index enrichment → `data/canon-overlay.json` stat-attention aliases/phrases.*


---

# doctrine-distillation-claude-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-distillation-claude-01.md`

# Doctrine Distillation — Claude lane, run 01

**Date:** 2026-07-27 · **Lane:** Claude research lane (parallel to the ChatGPT orchestrator lane)
**Repo state at run:** branch `main`, head `e044ebc`, clean tree. LE Lab release token `v=2.1.2`.
**Phase:** COLLECTION ONLY. Nothing in this document has been implemented on the site.

**Correction to the handoff brief:** the brief states canon index `1.0.0+d59d3e3a55be`. The committed
index at `data/le-canon-index.json` is **`1.0.0+8c38a2f1d015`** (450 concepts, 19 source pages), and that
is what every Lab run below was scored against. The brief's hash was stale; no rebuild was performed
this session.

---

## 0. Method

Five Sonnet scouts (effort medium) swept five genres in parallel — manosphere canon and its academic
critics, relationship-science popularizers, podcast/long-form YouTube discourse, the academic mating
literature, and mainstream advice + female-side/critic discourse. Each returned 10–18 candidate themes
with sources, excerpts, and an evidence-caliber note; scouts returned raw data only and made no
judgments about the site.

Three nominated source texts were then run through the LE Lab on `:8753` (staged in the gitignored
`.claude/lab-sources/`, served same-origin, exported via a JSON-blob capture; staging removed after the
run — the tree was clean before and after).

Four Opus verifiers (effort high) then checked every surviving candidate against the **live site files**,
not against Lab verdicts — the standing discipline from Harvest #1. Each was instructed to assume the
gap was *not* a gap and to return one of three verdicts with quoted evidence and an auditable list of
search terms tried. Final ranking and all dispositions below are the main loop's own judgment.

### Lab run stats

| Source | Words | Claim-like | Mapped | Coverage | Research queue | Set aside (non-domain) |
|---|---|---|---|---|---|---|
| Fem-Centrism — Rollo Tomassi, *The Rational Male*, 2011 | 1,214 | 10 | 0 | **0%** | 10 | 41 segs / 889 words |
| The Four Horsemen — The Gottman Institute | 885 | 17 | 0 | **0%** | 17 | 47 segs / 568 words |
| On Heteropessimism — Asa Seresin, *The New Inquiry*, 2019 | 2,938 | 28 | 1 | **3.6%** | 27 | 93 segs / 2,085 words |

Three sources, 55 claim-like segments, **one** credible canon match across all three (Heteropessimism →
"The Market", Medium confidence). Zero pressure tests fired on any run. For comparison, Harvest #1's Pew
source mapped at 50%. That contrast is the headline: the Lab maps *statistical* sources about the
dating market well and maps *doctrinal* sources from adjacent genres almost not at all.

The Gottman run is the single most diagnostic result in this dossier. The canonical text of
relationship-maintenance science produced 17 retained in-domain claims — including "contempt is the
single greatest predictor of divorce," which the gate correctly retained — and **not one of them found a
home in a 450-concept canon index.** That is not a retrieval failure to be fixed with overlay
enrichment; there is nothing to retrieve.

---

## A. Candidate core themes, ranked

Ranked by evidence strength × distinctness from canon. Dispositions follow
`memory: content-placement-and-lexicon` (Pills = worldviews, Frameworks = models, Statistics = numbers).

### A1. The retention gap — the site stops at selection · **NEW ARTIFACTS + EXPANSIONS** · Tier 1–2 evidence

**The claim:** the site models how pairs *form* in exhaustive detail and has almost nothing on how they
*hold*. Everything after the pairing decision — desire decay, conflict repair, what actually predicts
dissolution — is a named but nearly empty room.

**The measurements.** The Conversion Ladder's top rung, `frameworks.html#conversion-ladder`, defines
Kept in four lines. Its drivers are six undefined nouns: "Trust, repair, values, low chaos, loyalty,
lack of baggage." Its own self-audit cell concedes the shape of the hole — every instrument maps to
rungs 1–4, and "the Good-News Rule supplies **one observable Kept behavior**." Site-wide inventory:
2 of 17 frameworks, 1 of 29 charts, 1 of 65 mythbuster entries, 2 of 71 lexicon terms, 0 of 5 deep dives.

**Three independent pieces of evidence that the site already knows.**
1. `js/lab-analyzer.js:429` ships a severity-3 tension named `selection-retention-collapse` — "Selection
   is being collapsed into compatibility or retention" — whose evidence field names exactly what the
   canon would need. The Lab detects the collapse and has no rung to route it to.
2. `tests/fixtures/domain-relevance-benchmark.json:55`, case `dd-28`, labelled `retain`: *"The best
   predictor of a lasting marriage is how the couple handles contempt."* The site's own benchmark
   asserts this is in-domain canon material. There is no canon card for it.
3. Same file, case `dd-05`, labelled `retain`: *"Physical attraction fades in a long relationship unless
   it is renewed by shared novelty."* Same situation.

**The four sub-themes, with verdicts:**

| Sub-theme | Verdict | Detail |
|---|---|---|
| Gottman's Four Horsemen; contempt as top dissolution predictor | COVERED THINLY | Gottman is cited exactly once site-wide — `js/mythbuster.js:317`, a support source on an unrelated sleep/conflict ruling — and the only other mention is that entry's own `researchNotes` conceding "Gottman source needs a specific citation and URL." The Horsemen taxonomy does not exist. `contempt` appears ~12 times, always as Red Pill rhetoric or a matchmaker trait, never as a predictor. |
| The replication critique of Gottman's 90%+ accuracy | HOOK ALREADY ON SITE | `statistics.html#stat-relationship-quality` (Joel et al. 2020 PNAS) already states "no model explained more than 5% of change… who would improve or decay was not reliably predicted." The exact epistemics the critique needs, one page away, unlinked. |
| Perel's desire-vs-security paradox | **GENUINELY ABSENT** | Zero hits for Perel, *Mating in Captivity*, eroticism, novelty, desire decay, dead bedroom, sexless, companionate. The site treats desire as a level, never as something with a decay curve. The nearest content ("The spark", GD "butterflies aren't a good match") argues the *inverse* — that intensity is a bad selection signal. |
| Finkel's Suffocation Model | COVERED THINLY, UNNAMED | `dd-relationships-throughout-history.html:271` states Finkel's premise nearly verbatim in LE's own voice — "asks one person to be everything that three whole institutions… used to divide among themselves… The market did not get harsher. The job description got longer" — with no name, no citation, no cross-cite. Missing both load-bearing halves: that investment per marriage did not rise to match, and that the best marriages got better while the rest got worse. The variance half is the part with predictive content. |

**Note on the one sub-theme that is already covered:** Gottman's *bids for connection / turning toward*
is on the site substantively, under Gable's name rather than Gottman's, as
`frameworks.html#good-news-rule` (eyebrow: "Kept rung · positive-event responsiveness"). It covers the
positive-event channel only, not everyday bids. The 5:1 ratio is absent, and that entry's own boundary
language ("no single response is a causal percentage or compatibility score") suggests the site would
reject a ratio rather than adopt one. **Do not propose 5:1.**

**Proposed disposition:** the largest structural gap found in this run.
- **Frameworks (new):** a desire-maintenance model — the site's own version of the Perel paradox, built
  on the empirical desire-decline literature rather than clinical assertion, with the "not a causal
  percentage" discipline the Good-News Rule already models.
- **Frameworks (new):** a dissolution-predictor entry carrying the Horsemen taxonomy *and* the
  post-hoc-fitting critique, cross-cited to `#stat-relationship-quality`. The critique is what makes
  this an LE entry rather than a Gottman repost — the site already owns the harder null.
- **Expansion:** name and cite the Suffocation Model at `dd-relationships-throughout-history.html`, add
  its two missing halves, and cross-cite from the Kept rung.
- **Expansion:** the Kept rung's six nouns need to point somewhere.
- Prior rejections on record in `md/mission-notes.md:440` (Reciprocity Ratchet, Return Ticket, Pool–Queue,
  Constraint Before Clarity, Disclosure Loop) — **none of these are Gottman, Perel, or Finkel.** This
  cluster has not been considered and declined; it has not been considered.

### A2. AI companions as a market force · **NEW ARTIFACT** · Tier 2 evidence

**The claim:** AI companion apps are being adopted at scale by exactly the demographic the site models
as market-exiting, and function as a substitute good for the thing men are said to be withdrawing from.

**Verdict: GENUINELY ABSENT.** Zero hits across all published pages for AI girlfriend/boyfriend/
companion/partner, Replika, character.ai, chatbot, virtual girlfriend, artificial or synthetic intimacy.
`parasocial` appears ~10 times, always about *human* celebrities.

**Two things make this sharper than a normal gap.**
1. `frameworks.html:903` (The Men's Strike) writes the sentence that begs for it — men withholding "can
   be waited out or **substituted around**" — and names no substitute. The site's account of male
   withdrawal cites Lei & South 2021 (gaming, alcohol, employment, co-residence), which predates the
   substitute that actually simulates the withdrawn-from thing.
2. The site's Mythbuster is partly seeded by claims attributed to two AI voices, Mika and Ani, and
   `md/mission-notes.md:80` records that "Mika" turned out to be an AI companion (a Grok persona) rather
   than a person — treated there purely as a credibility caveat about AI agreeableness. **The site has an
   AI companion in its own origin story and no page asking what AI companions do to the market.**

**Evidence caliber:** adoption figures are survey-grade (Wheatley Institute/BYU, Feb 2025: ~19% of US
adults, roughly a third of men in their 20s, have used a romantic AI); market-size projections are
vendor research and should be treated as marketing-tier. The "substitute good / accelerant" framing is
interpretation, not finding — label it as a reasoned call, per house discipline.

**Proposed disposition:** Frameworks entry (a substitution/exit mechanism), cross-cited from the Men's
Strike's "substituted around" clause; a Statistics chart if the adoption survey holds up on independent
check. Lexicon term follows. Companion Mythbuster docket question is available: *does an AI companion
substitute for dating, or does it sit alongside it?* — currently unanswerable at Tier 1, so it would
ship as a hunch-tagged framework, not a ruling.

### A3. The matchmaker honesty fence · **EXPANSION (self-consistency)** · Tier 1 evidence

Not new doctrine — a defect in applying doctrine the site already holds.

`frameworks.html:183` reports Joel/Eastwick/Finkel 2017 correctly and at full strength: ML models on
100+ pre-date traits "explained effectively none of the held-out unique desire for this particular
person (less than 0.1%)." Line 184 draws the right conclusion: "This is also the boundary on the site's
own calculators: they estimate declared fit and constraints conditional on their inputs; **they do not
predict chemistry.**"

That fence has **zero inbound links** from `compatibility.html`, `matchmaker.html`, `smvcalc.html`, or
`hierarchy.html`. Meanwhile `matchmaker.html:20` promises the tool "finds the celebrities you'd actually
match with at your level" and ranks each by a gated hierarchy score. Read plainly, a per-candidate
ranked fit score is a pair-specific claim — the exact quantity the site publishes as unpredictable at
<0.1%. The Lens tag on line 24 disclaims only that the celebrity *ratings* are provisional; it does not
disclaim the ranking's meaning.

The Compatibility Calculator's existing note (`compatibility.html:20`) cites Pew's 21%-believe stat and
a modesty disclaimer. That addresses *public skepticism*, not the null — a reader cannot learn from it
why pair-specific prediction fails.

**Proposed disposition:** expansion — carry the `#interaction-gate` boundary onto every instrument page
in the instruments' own words. This is the highest-confidence, lowest-cost item in the dossier and it is
squarely in the site's honesty DNA.

### A4. Operational sex ratio as a norm-shifting mechanism · **EXPANSION** · Tier 2 evidence

**Verdict: COVERED THINLY.** Guttentag & Secord (1983) is cited exactly twice, both in `smvlevers.html`
(the Market multiplier cite line at :87 and Exposure's research list at :221), and both times the
citation carries the norm-shifting sentence while everything around it is the individual-value read:
"There is no absolute SMV. The same profile is a 6 in one city and an 8 in another… The market sets the
exchange rate; you just hold the currency."

Missing: the **two-sided power split** (the scarce sex gains dyadic power — more choice, less commitment
offered — while the abundant sex may hold more structural power); the **whole-market commitment-supply**
mechanism, which is the part that makes sex ratio a doctrine rather than a scaling factor; and the
campus empirics (Uecker/Regnerus-style: female-majority campuses show more hookups and fewer
relationships). `dyadic power` / `structural power` return only those two lines site-wide; there is no
sex-ratio framework, no chart, and no mythbuster entry.

**Proposed disposition:** expansion of `smvlevers.html` plus a Frameworks entry. This is unusually safe
ground — it deepens a citation the site already trusts and already prints, rather than importing a
contested new authority.

### A5. Female-side ideological exit · **EXPANSION** · Tier 2–3 evidence

**Verdict: COVERED THINLY, and the thinness is asymmetric.** The site does model female exit — the Men's
Strike framework carries a sub-box titled "The asymmetric response — women exit, they don't compete"
with Tier-1 data (among singles 40+, 71% of women aren't looking vs 42% of men), echoed at
`statistics.html#stat-why-single`. Credit where due: the symmetric *market* treatment exists.

What is missing is the ideological, elective version. Heteropessimism (Asa Seresin, 2019), "decentering
men," and boysober return **zero hits**. The site's modelled female exit is *passive attrition at 40+*;
the 2024–26 discourse version is *elective and young*, narrated as self-improvement. Different
mechanism, different age band. The ledger is lopsided: male exit gets three lexicon terms (Men's Strike,
MGTOW, Monk mode) plus a full framework; female exit gets one term (4B) that redirects to the male-side
framework.

**The sharpest unexploited angle:** Seresin's actual mechanism is *performative* disaffiliation that
never actually exits — the gap between the stated exit and the revealed non-exit. Stated-versus-revealed
is the site's house move. It is applied to preferences everywhere and never applied here. The nearest
neighbour, `js/mythbuster.js` M-TBD-42 ("no good men left" as a century-old genre), does the
historical-rerun read instead.

**Evidence caliber:** honest labelling matters here. Seresin is a literary-critical essay, not an
empirical finding; boysober and decentering are media-amplified trends with no research base. This is
Lens/reasoned-call territory, not a Tier-1 claim.

**Proposed disposition:** expansion of `#mens-strike` with an elective-exit counterpart, plus lexicon
terms. Lab run: 28 claim-like segments, 1 mapped (3.6%).

### A6. Mate-value discrepancy × alternatives visibility · **EXPANSION** · Tier 2 evidence

**Verdict: GENUINELY ABSENT**, on a framework that already has the vocabulary for it.

`frameworks.html#parity-rule` is entirely a *pairing-formation* model — the 0.4 tolerance band, the ±1
commitment band, the Sub-5 override — with no post-pairing consequence claim at all. Conroy-Beam & Buss
et al. find that being higher mate-value than your partner lowers satisfaction and predicts infidelity
intent **mainly when attractive alternatives are visibly available** (the mate-switching hypothesis).
The nearest site text is one clause at `frameworks.html:695` ("matched pairs carry less mate-guarding
anxiety"), which gestures at the mechanism from the other side and stops.

This is the item that ties A1 and the Abundance Trap together: it is the mechanism by which a visible
option pool degrades an *existing* pairing, where the Abundance Trap models only how it degrades a
*choosing* single. The Abundance Trap's own scope note already concedes the boundary — "nobody has yet
measured the trap against long-run relationship outcomes."

**Proposed disposition:** expansion of `#parity-rule` as a stated boundary condition.

### A7. Dread game · **NEW ARTIFACT** · Tier 3 evidence (assertion), Tier 2 adjacent literature

**Verdict: GENUINELY ABSENT as doctrine** — the two `dread` hits are ordinary prose (spinster anxiety in
a deep dive) and *dreadlocks* in matchmaker biographies.

What makes this worth listing despite the source being pure community assertion: **the evidence base is
already adjudicated on the site, pointed the other way.** `js/mythbuster.js` M-TBD-8 rules on deliberate
jealousy induction using the Mattingly et al. (2012) Romantic Jealousy-Induction Scale — that is hard
dread, with validated instrumentation — but frames it as *reading a woman's behavior*, never as a man's
prescribed retention tactic. Soft dread's base is likewise present and unassembled: M-TBD-18 on
mate-choice copying (Hill & Buss 2008; Gouda-Vossos 2018 meta, with publication bias flagged) plus the
Preselection lexicon term, both about *acquisition*, not retention inside a pair.

Nobody on the site turns the RJIS around. That is a one-source-away entry.

**Proposed disposition:** Frameworks entry or Mythbuster docket question, inside A1's retention
territory. Grading a prescriptive manosphere tactic against its own literature is exactly the site's
audit DNA — and the honest verdict is likely "documented behavior, terrible prescription," which the
existing sources can carry.

### A8. Political dealignment as a market filter · **NEW ARTIFACT (chart)** · Tier 2 evidence

**Verdict: GENUINELY ABSENT.** No trace of ideology as a market-segmenting force. `hierarchy.html:341`
has "religion/politics if relevant" as a parenthetical inside one lifestyle bullet, and
`compatibility.html:198` reproduces that wording while *dropping* the parenthetical. The site's only
politically-adjacent doctrine (GD's "the feminism trade-off") treats feminism as a historical/economic
shift, never as a live axis sorting today's daters into two pools.

**Evidence:** AEI/IFS survey of ~3,000 18–29-year-olds — 60% of liberal young women vs 36% of
conservative young women rank a partner's political alignment above job stability; ~50-point Gen Z
gender gap in 2024 US exit polling. Real survey data, US-specific, recent.

**Proposed disposition:** Statistics chart plus a hierarchy/compatibility note. Verify the AEI figures
independently before drafting — per house discipline, do not trust a scout's "verified."

### A9. Necessities vs luxuries — the budget paradigm · **EXPANSION (citation upgrade)** · Tier 1 evidence

The site has independently derived a threshold architecture: `frameworks.html:335` distinguishes
"channel factors gate" (hygiene, honesty, stability, respect, reliability, kindness — "a 4 contaminates
the whole, so it disqualifies outright") from "additive goods drag, they don't gate" (ambition, humor,
curiosity), reinforced by the Sub-5 floor and matchmaker's "Tier 1 is a gate, not an average."

That is structurally Li, Bailey, Kenrick & Linsenmeier (2002) — and Li's kindness/intelligence
necessities line up almost item-for-item with LE's channel set. Li is cited twice in `js/mythbuster.js`
(M-TBD-49, M-TBD-55) and read correctly, but only as ammunition inside rulings. Zero hits for
`necessit|luxur|mate dollar|budget|Kenrick` in any instrument page.

Also missing: the **low-budget/high-budget convergence** (sex differences are stark under scarcity and
shrink as the budget grows), and the inference it licenses — that stated preferences overstate pickiness
because surveys are *free*. The site currently treats stated-vs-revealed only as a validity problem
(people misreport), never as a budget problem.

**Proposed disposition:** cheap, high-value expansion — connect the site's own gate/additive
architecture to its empirical warrant on `hierarchy.html` and `smvlevers.html`.

### A10. Male friendship recession → sole-support-channel · **EXPANSION** · Tier 2 evidence, Tier 3 extrapolation

`statistics.html#stat-friend-time` and `dd-third-spaces.html` own this territory well, but **sex-neutrally**
— every friendship number on the site is ATUS time-use for "Americans." Missing: the sex-specific series
(share of men with no close friends rising roughly 3% → 15%, Survey Center on American Life) and the
sole-emotional-support-channel claim.

**Honesty flag, and it is load-bearing:** the source data does *not* itself make the sole-channel claim.
The Cox piece documents the friendship decline and the support gap (21% of men vs 41% of women received
emotional support from a friend in the past week) and stops there; the "so partners become men's only
outlet" step is discourse extrapolation. If this ships, the extrapolation must be tagged as such — this
is precisely the kind of compounding the site exists to catch.

**Proposed disposition:** a sex-split addition to the friend-time chart; the extrapolation as a Lens,
clearly labelled, cross-cited to the Suffocation Model work in A1.

### A11. Epiphany phase — the "maturity" reframing · **EXPANSION** · Tier 3 evidence

`gender-dynamics.html` carries the *content* in two un-anchored cards ("The backup-plan cycle"; "Don't
wait for the wall to course-correct") — "the qualities you'll value at 35 were available at 25 in men
you found boring" — asserted with no evidence tier and no anchor id. The Wall framework is orthogonal:
it rules on the value *curve*, never on a behavioral pivot.

Untreated are the claim's two testable specifics: whether it is a *narrow window* or a continuous drift
(Tomassi himself moved the goalposts from ~29–31 to 24–27, which is itself the tell), and the
**reframed-as-maturity** move, where a constrained recalibration gets narrated as growth. That second one
is a genuine rhetorical mechanism the site has no entry for, and it is symmetrical with several
male-side copes the site already names.

**Proposed disposition:** expansion — give those GD cards anchors and an evidence tag, and add the
reframing as its own named move.

### A12. Assortative mating — the Schwartz 2024 refinement · **OVERLAY / CITATION ONLY** · Tier 1 evidence

**The site is not stale, and the worry that prompted this check was wrong.** LE states in four places
that educational hypergamy has *reversed* (Esteve et al. 2016, 120 countries), and the looks r≈0.4
anchor is already correctly fenced as a Tier-2 model anchor re-analyzing 1980s samples.

Schwartz et al., "Eight Decades of Educational Assortative Mating," *Demography* 2024 adds a US-specific
series with a dated inflection (~1990) and — the part with real content — the distinction between
**hypergamy reversal** (women no longer marrying up) and **homogamy stall/decline** (like no longer
pairing with like). The site carries only the first. A refinement, not a correction.

---

## B. Dead candidates — checked and killed

Recorded so the ChatGPT lane does not rediscover them.

| Candidate | Why it died |
|---|---|
| **The preference-matching null** (Joel/Eastwick/Finkel 2017) as a missing finding | ALREADY COVERED, and it is the site's most rigorous single treatment. `frameworks.html#interaction-gate` states the <0.1% held-out result and correctly separates main effects from perceiver×target variance. Joel et al. 2020 PNAS has its own chart. Only Eastwick et al. 2023 (EJP) is uncited — a redundant confirmation of a null the site already states with a harder number. |
| **Gottman's bids / turning toward** | Substantively covered under Gable's name as `frameworks.html#good-news-rule`, with the 2×2 matrix, sources, and a pressure-test box. Only the everyday-bid (vs positive-event) channel is missing. |
| **The 5:1 magic ratio** | Absent, but `#good-news-rule` explicitly forecloses it: "no single response is a causal percentage or compatibility score." Proposing it would fight the site's own epistemics. Do not resurrect. |
| **"The site says assortative mating is rising"** | False. Checked every `assortative|homogam|hypergam|sorting` hit; the site says the opposite, sourced. See A12. |
| **Baumeister sexual-economics theory already on site** | False positive. The `Baumeister` hit is Baumeister & **Twenge** (2002) on female intrasexual suppression, cited in a mythbuster ruling — not Baumeister & **Vohs** (2004). SET itself is genuinely absent (see below). |
| **Sexual economics / "cheap sex" as a doctrine gap** | Genuinely absent, but **deliberately not recommended.** SET is a contested theory paper with a published rebuttal exchange (Rudman & Fetterolf 2014 vs Vohs & Baumeister 2015), and the site already *rejects* the retail version of the thesis at M-TBD-33 (situationships graded "Common, not dominant," truth 25). `dd-relationships-throughout-history.html:260` stops one inferential step short of the price-of-sex conclusion, and that restraint reads deliberate. Flagging as available, recommending against. |
| **Plate theory as prescriptive doctrine** | Absent, but `#abundance-trap` owns the territory and prescribes the *opposite* ("fix the criteria, cap the browsing"). The interesting residue is that the Abundance Trap's own moderator logic predicts the rotator taxes himself — that is a pressure test for an existing framework, not a new artifact. |
| **The Great Unbundling absorbs the market-structure candidates** | Checked in full. It is substantive and well-built, and it absorbs almost none of A4/A8/A10 — no sex ratio, no politics, and its rising-stakes argument is institutional and sex-neutral. |
| **The Feminine Imperative as a structural claim** | The Lab binned it non-domain by construction (73% of the Fem-Centrism source's words were set aside). Its load-bearing sentence is a claim about law, media, and culture, not about mating. Correctly out of LE's domain; the hypergamy core it rests on is already covered. Not a gap — a scope boundary. |
| **Briffault's Law** | Available as a Mythbuster docket item with an unusually clean kill (Briffault restricted it to non-human animal families and explicitly denied the analogy his manosphere citers build on), but it is a *citation-hygiene* debunk, not core doctrine. Parked. |
| **Alpha widow** | Genuinely absent and mechanically distinct from anything on site (a comparison-anchor claim, not the sequencing claim GD's "backup-plan cycle" makes). Evidence caliber is community lore only, with no instrumented literature to grade it against — unlike dread (A7), which has the RJIS. Parked pending a source. |
| **Mystery Method three-phase model, juggernaut law, geomaxxing, betabuxx, burden of performance, solipsism** | Reviewed and dropped: either already covered by existing pill/lexicon entries, or pure assertion with no gradable literature, or garnish. Betabuxx is the only near-miss — real academic theory (strategic pluralism) weakened by the paternal-discrepancy gap (models predict 6.9–20% cuckoldry, genetic studies find 1–2%) — but the site already handles AF/BB and notes the ovulatory-shift replication failure. |
| **Love-languages debunk, therapy-speak, red/beige-flag culture, date-me docs, sprinkle-sprinkle, FDS vetting, "he's just not that into you"** | Reviewed and dropped as garnish — discourse conventions without load-bearing mechanisms, or already covered by existing pill dossiers. |

---

## C. Process and instrument notes

1. **The Lab maps statistics, not doctrine.** Harvest #1 (a Pew statistical source) mapped at 50%. Three
   doctrinal sources from three different genres mapped at 0%, 0%, and 3.6%. This is not a defect — it is
   the instrument correctly reporting that the canon is built out of *findings about the market* and thin
   on *models of what people do inside relationships*. Worth stating explicitly in the Lab's own framing.
2. **The domain gate behaved correctly on all three runs.** It retained "contempt is the single greatest
   predictor of divorce" and set aside the media/law/culture material. No segmentation defects observed;
   the Harvest #1 "vs." shard bug did not recur. **No benchmark append is proposed from this run** —
   benchmark files were not touched, per standing rules.
3. **Zero pressure tests fired across all three runs.** Pressure tests appear to depend on mapped
   matches, so a 0%-coverage source produces no strain analysis. If that is by design it is worth
   documenting; if not, it is a small gap in the instrument, since a wholly-unmapped source is exactly
   where a reader most wants to know whether the claims strain against each other.
4. **Canon index hash drift** between the handoff brief and the committed file — see the header. Anyone
   quoting run stats should quote `1.0.0+8c38a2f1d015`.

---

## D. Recommended order of work, and what to compare with the other lane

If Jason merges both lanes and wants a single ordering, this lane's recommendation is:

1. **A3 (matchmaker honesty fence)** — highest confidence, lowest cost, pure self-consistency, and it is
   a defect rather than an addition.
2. **A1 (the retention gap)** — the one genuinely structural finding. Largest scope; suggest it be
   sequenced as its own arc rather than folded into a general merge.
3. **A4, A6, A9** — three expansions that deepen citations and frameworks the site already owns. Low
   authority risk, high coherence gain.
4. **A2, A8** — two genuinely new market forces, both needing an independent fact-check pass first.
5. **A5, A10, A11, A12** — real but smaller; several need careful evidence-tier labelling.

**Points of likely disagreement with the ChatGPT lane** — worth checking explicitly rather than assuming
agreement:
- Whether **A1** is one arc or four separate artifacts.
- Whether **sexual economics / cheap sex** (dead-listed here, deliberately) should ship. This lane
  recommends no; a lane that weighted the theory's citation count over its rebuttal exchange would
  plausibly recommend yes.
- Whether the **preference-matching null** is a gap. It is not — but it is the kind of thing a lane
  working from Lab verdicts alone would flag, because the canon's retrieval vocabulary for
  `#interaction-gate` may be thin. If the other lane raises it, the fix is **overlay enrichment**, not
  doctrine. That is Harvest #1's lesson repeating.

*Sources swept via five parallel scout agents (Sonnet 5, medium) across manosphere canon + critics,
relationship-science popularizers, podcast/long-form discourse, academic mating literature, and
mainstream/female-side discourse; ~70 candidate themes returned, triaged to the 12 above plus the
dead-candidates table. Live-site verification by four adversarial agents (Opus 5, high) reading the
actual page files. Ranking, dispositions, and all judgment calls are the Fable main loop's own.*


---

# doctrine-distillation-handoff.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-distillation-handoff.md`

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


---

# claude-doctrine-checkpoint-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/claude-doctrine-checkpoint-01.md`

# CLAUDE DOCTRINE CHECKPOINT 01 — frozen submission

**Status:** FROZEN HISTORICAL ARTIFACT. Submitted 2026-07-29 to the doctrine-distillation
orchestrator as the Claude lane's independent Checkpoint 01 report; the cross-lane comparison
has since closed (0 doctrine-ready candidates; lanes closed; epoch frozen). Preserved verbatim
below — do not rewrite conclusions in light of later comparison results. Companion artifacts:
`md/doctrine-distillation-claude-01.md` (the Run 01 source ledger this was distilled from) and
`md/doctrine-distillation-handoff.md` (the lane's opening brief).

---

CLAUDE DOCTRINE CHECKPOINT 01

1. BASELINE AND SOURCES
- Website reference: cdac8b35186fdd2619af54be8aa423bc36d88a71
- Canon: 1.0.0+8c38a2f1d015 (450 concepts, 19 source pages)
- Source ledger: md/doctrine-distillation-claude-01.md (Run 01, closed)
- Ingested (full Lab runs, 2026-07-27): S1 Tomassi "Fem-Centrism" (The Rational Male, 2011);
  S2 Gottman Institute "The Four Horsemen"; S3 Seresin "On Heteropessimism" (The New
  Inquiry, 2019). Nominated-not-ingested lineages (scout-returned, excerpt level): Perel
  (Mating in Captivity), Finkel (suffocation model), Conroy-Beam/Buss (mate-value
  discrepancy), Li/Bailey/Kenrick/Linsenmeier 2002, Guttentag & Secord 1983 (already site-
  cited), AEI/IFS political-preference survey, Survey Center on American Life (Cox),
  Wheatley Institute/BYU 2025, Schwartz et al. Demography 2024, Mattingly et al. 2012 RJIS
  (already site-cited).

2. METHOD AND LINEAGE CONTROLS
Five genre-partitioned scouts (Sonnet 5, medium) returned ~70 candidate themes with
excerpts; three nominated texts were Lab-ingested in full; four adversarial verifiers
(Opus 5, high) reverse-checked every surviving candidate against the live page files under
a presumption of NO gap, returning quoted evidence and the search terms tried. All
dispositions are the lane main loop's own.
GRANULARITY DISCLOSURE: passage-level locators exist in full for the three ingested
sources (Lab segment exports) and for every SITE-side claim (file:line). Scout-returned
sources are held at excerpt level; where a cluster's recurrence rests on scout excerpts
rather than ingested text, its counts below are marked "excerpt-level" and should be
treated as minima pending full ingestion. Within-source repetition was never counted as
recurrence (S1's thesis sentence recurs ~7x in 1,214 words; counted once). Single
research programs were never counted as multiple empirical lineages — this control is
load-bearing for C1a and C7 below.

3–5. CANDIDATE-CLUSTER LEDGER, REVERSE-CHECK EVIDENCE, DISPOSITIONS
Disposition key: D1 = existing doctrine, weak retrieval/index vocabulary · D2 = existing
doctrine, thin explanation · D3 = recurring material doctrine gap (research lead, NOT
doctrine-ready unless noted) · D4 = novel isolated residue.

C1a — Scoped proposition: "Contempt (with criticism, defensiveness, stonewalling) is the
strongest behavioral predictor of pair dissolution" — actor: established pairs; stage:
post-pairing; mechanism: conflict style; outcome: dissolution; qualifier: predictor, not
cause. Supporting: S2 full text (17 claim-like segments retained, incl. the contempt-
predictor claim verbatim); site's own benchmark fixture dd-28 (labelled retain);
discourse recurrence across 3 of 5 scout genres (excerpt-level). Counts: sources 2 +
excerpts; editorial lineages 2 (Gottman Institute; independent discourse); creator
networks 2; EMPIRICAL LINEAGE 1 — the entire Horsemen corpus is a single research
program (Gottman lab). Recurrence type: both, with the empirical leg one-program-heavy.
Reverse-check: Gottman cited once site-wide (js/mythbuster.js:317, unrelated ruling,
whose own researchNotes concede the citation is incomplete); "contempt" ~12 site hits,
all rhetorical or trait-list, never as predictor; no Horsemen taxonomy anywhere; Lab run
mapped 0/17 against 450 concepts. Strongest existing match: none (nearest is
#good-news-rule, positive-event channel only). Counterevidence preserved: the post-hoc-
fitting critique of Gottman's 90%+ accuracy claims; the site's own Joel et al. 2020
chart (#stat-relationship-quality: no model >5% of change) is the exact epistemic
counterweight and is currently unlinked to any of this. DISPOSITION 3 — and the closest
of any D3 to doctrine-ready, PROVIDED the one-program concentration and the accuracy
critique ship inside it.

C1b — "Gottman-style dissolution-prediction accuracy claims (90%+) do not survive
methodological scrutiny." Supporting: critique literature (excerpt-level); site's own
#stat-relationship-quality states the harder null. Reverse-check: the epistemics exist
on site, unlinked to any retention content. Strongest match: #stat-relationship-quality.
DISPOSITION 2 (thin: the null is stated but never connected to the domain it fences).

C1c — "Erotic desire decays under security/familiarity within established pairs unless
actively renewed; desire and attachment are partially opposed systems" — stage: post-
pairing; timeframe: years; qualifier: decay tendency, not law. Supporting: Perel
(clinical assertion, excerpt-level); the empirical desire-decline longitudinal
literature (distinct lineage from Perel); site's own benchmark fixture dd-05 (labelled
retain). Counts: editorial lineages ≥2; empirical lineages ≥1 independent of the
clinical source. Recurrence type: both. Reverse-check: zero site hits for Perel, desire
decay, dead bedroom, sexless, companionate, novelty-renewal; nearest content (GD
"butterflies aren't a good match"; "The spark") argues the inverse question — intensity
as a bad SELECTION signal, silent on maintenance. Strongest match: none. Counterevidence
preserved: Perel's own claims are clinical, not instrumented; any future entry must be
built on the longitudinal literature. DISPOSITION 3.

C1d — "Modern marriage concentrates demands formerly spread across institutions onto one
partner; investment did not rise to match; outcome variance widened" (Finkel).
Supporting: Finkel lineage (excerpt-level). Reverse-check: dd-relationships-throughout-
history.html:271 states the premise nearly verbatim in LE's own voice, unnamed, uncited,
and missing both load-bearing halves (investment shortfall; variance widening — the half
with predictive content). Strongest match: that passage itself. DISPOSITION 2.

META-CLUSTER NOTE (C1a–C1d): jointly these constitute the run's one structural finding —
the site models pair FORMATION exhaustively and pair MAINTENANCE almost not at all. Site-
side inventory: Kept rung defined by six undefined nouns (frameworks.html:122) with a
self-audit cell conceding one observable Kept behavior site-wide (:133); 2/17 frameworks,
1/29 charts, 1/65 mythbuster entries, 2/71 lexicon terms, 0/5 deep dives touch post-
pairing; the Lab itself ships severity-3 tension `selection-retention-collapse`
(js/lab-analyzer.js:429); two benchmark fixtures assert the territory is in-domain. The
site has already committed to the domain in three independent internal artifacts and has
not built it.

C2 — "AI companions function as a substitute good for the demographic modeled as market-
exiting" — actor: predominantly young men; mechanism: substitution; qualifier:
interpretation, not finding. Supporting: Wheatley/BYU Feb-2025 survey (single empirical
lineage, survey-grade); multi-outlet discourse (excerpt-level, ≥3 creator networks);
vendor market projections EXCLUDED as marketing-tier. Recurrence type: discourse
recurrence + one empirical lineage. Reverse-check: zero hits for AI girlfriend/companion/
Replika/character.ai/synthetic intimacy; frameworks.html:903 (Men's Strike) says male
withdrawal "can be waited out or substituted around" and names no substitute; site's own
md/mission-notes.md:80 records that Mythbuster voice "Mika" was an AI companion — treated
only as a credibility caveat. Strongest match: #mens-strike (adjacent, silent).
DISPOSITION 3 — research lead; single-survey empirical base requires independent
verification before any promotion.

C3 — "A per-candidate ranked fit score is a pair-specific prediction, which the site's
own published null (<0.1% held-out) fences as impossible." Supporting: entirely SITE-
INTERNAL — frameworks.html:183-184 states the null and the calculator boundary
("they do not predict chemistry"); matchmaker.html:20 promises "finds the celebrities
you'd actually match with at your level"; the fence has zero inbound links from
compatibility.html, matchmaker.html, smvcalc.html, hierarchy.html; compatibility.html:20's
existing note addresses public skepticism (Pew 21%), not the null. Recurrence: N/A
(self-consistency defect, not a discourse claim). DISPOSITION 2 — existing doctrine,
unapplied to the site's own instruments. Highest-confidence, lowest-cost item in the
submission.

C4 — "Operational sex ratio shifts whole-market relational norms and commitment supply,
beyond scaling individual value" — mechanism: two-sided power split (scarce sex gains
dyadic power; abundant sex may hold structural power); evidence family: Guttentag &
Secord + campus-ratio empirics (Uecker/Regnerus-style). Reverse-check: G&S cited twice
(smvlevers.html:87, :221), both times carrying only the individual-value read ("the
market sets the exchange rate; you just hold the currency"); "dyadic power"/"structural
power" appear nowhere else; no sex-ratio framework, chart, or ruling. Strongest match:
those two citation lines. DISPOSITION 2 — the site already trusts and prints the
authority; the mechanism half of that authority's own thesis is missing.

C5 — "Female-side relationship exit has an elective, young, ideologically-narrated
variant (heteropessimism / decentering / boysober) distinct from passive attrition at
40+; its mechanism is stated disaffiliation without revealed exit." Supporting: S3
ingested (28 claim-like segments, 1 mapped — 3.6%); boysober/decentering discourse
(excerpt-level, distinct outlets). Empirical lineage: NONE — literary-critical essay
plus media-amplified trend; Lens territory by the site's own standards. Reverse-check:
site models female exit as passive attrition 40+ (#mens-strike sub-box, Tier-1 sourced;
#stat-why-single); zero hits for heteropessimism/decentering/boysober; lexicon carries
three male-exit terms vs one female (4B), which redirects to the male-side framework;
M-TBD-42 does the historical read, not the stated-vs-revealed read — the site's house
move, applied to preferences everywhere, never applied here. DISPOSITION 2 primary
(asymmetric thinness of existing exit doctrine), with the elective-exit mechanism
recorded as a scope variant that is currently Lens-grade only.

C6 — "Being higher mate-value than one's partner degrades satisfaction and raises
infidelity intent mainly when attractive alternatives are visibly available" — stage:
post-pairing; qualifiers: conditional on alternatives visibility. Supporting: Conroy-
Beam/Buss mate-switching lineage (excerpt-level; single research program, flagged as
such). Reverse-check: #parity-rule is entirely formation-side (0.4 band, Sub-5, ±1);
nearest text is one clause at frameworks.html:695 ("matched pairs carry less mate-
guarding anxiety") gesturing from the other side; #abundance-trap's own scope note
concedes "nobody has yet measured the trap against long-run relationship outcomes."
Strongest match: #parity-rule (vocabulary present, consequence claim absent).
DISPOSITION 3 — research lead; bridges C1 and the Abundance Trap.

C7 — "Cultivated jealousy/insecurity ('dread game') retains partners" — prescriptive
community tactic. Supporting: manosphere sources only (excerpt-level; effectively one
creator network). Empirical lineage: zero FOR the prescription; the adjacent instrumented
literature is ALREADY ON SITE pointed the other way (M-TBD-8 rules on jealousy induction
via Mattingly 2012 RJIS as a read on female behavior; M-TBD-18 + Preselection cover mate-
choice copying as acquisition). Reverse-check: "dread" site hits are prose incidentals.
DISPOSITION 4 — novel isolated residue. Retained because the site already owns the
instrumentation to grade it; the honest future verdict is likely "documented behavior,
terrible prescription." Not promoted.

C8 — "Political alignment now operates as a first-class market-segmenting filter among
young daters, asymmetrically by sex" — timeframe: 2020s US. Supporting: AEI/IFS survey
(~3,000 18–29; 60% liberal young women vs 36% conservative rank alignment above job
stability) + Gen-Z exit-poll gender-gap series — 2 empirical lineages, both scout-
returned, NEITHER independently verified by this lane yet. Reverse-check: ideology-as-
filter absent everywhere; hierarchy.html:341 holds one parenthetical ("religion/politics
if relevant") which compatibility.html:198 reproduces while dropping the parenthetical;
GD's "feminism trade-off" is historical-economic, not a live sorting axis. DISPOSITION 3
— research lead; independent verification of both figures is a hard precondition.

C9 — "Mate preferences are budget-structured: necessities gate at low budget, luxuries
add at high budget; sex differences shrink as budget grows; free surveys overstate
pickiness" (Li/Bailey/Kenrick/Linsenmeier 2002). Reverse-check: the site independently
derived the architecture (frameworks.html:335 gate-vs-additive; Sub-5; matchmaker "Tier 1
is a gate, not an average") and cites Li twice inside rulings (M-TBD-49, M-TBD-55) — but
zero hits for necessit|luxur|budget|Kenrick on any instrument page, and the budget-
convergence half plus the surveys-are-free inference are absent (site treats stated-vs-
revealed only as misreporting, never as a budget artifact). Strongest match: the site's
own gate architecture. DISPOSITION 2 — the site owns the structure and lacks its
empirical warrant and one explanatory half.

C10 — "Male friendship decline concentrates men's emotional support onto romantic
partners as sole channel." Supporting: Survey Center on American Life (Cox) — friendship
decline and support gap (21% men vs 41% women) are Tier-2 survey data; THE SOLE-CHANNEL
STEP IS DISCOURSE EXTRAPOLATION NOT PRESENT IN THE SOURCE DATA — preserved here as the
cluster's central integrity fact. Reverse-check: #stat-friend-time + dd-third-spaces own
the territory sex-neutrally (ATUS, "Americans"); no sex-split series on site.
DISPOSITION 2 — thin (missing sex split); the extrapolation half is NOT covered by the
disposition and must never ship untagged.

C11 — "The female 'epiphany phase' includes a reframed-as-maturity move: constrained
recalibration narrated as growth" — plus the untested window-vs-drift question (Tomassi
moved his own window from ~29–31 to 24–27, recorded as an internal inconsistency of the
source lineage). Reverse-check: GD carries the content in two un-anchored, untiered
cards; the Wall rules on the value curve, not the behavioral pivot; the reframing move
is unnamed site-wide though symmetric male-side copes are named. DISPOSITION 2 —
Tier-3 evidence; anchor-and-tag territory.

C12 — "US educational assortative mating: hypergamy reversal is distinct from homogamy
stall/decline; inflection ~1990" (Schwartz et al., Demography 2024). Reverse-check: site
states hypergamy reversal in four places, sourced (Esteve 2016), and is NOT stale; it
carries only the first distinction. DISPOSITION 2 (borderline D1) — a refinement, not a
correction; citation-level.

6. EXISTING DOCTRINE CONFIRMED (reverse-checks that VALIDATED the site)
- The preference-matching null: covered at full strength (#interaction-gate, <0.1%
  held-out; Joel 2020 chart separately). The site's most rigorous single treatment.
- Bids/turning-toward: substantively covered under Gable's name (#good-news-rule),
  positive-event channel, with sources and a pressure test.
- Assortative-mating direction: site correctly states hypergamy reversal, sourced.
- The Great Unbundling: checked in full; substantive; does NOT absorb C4/C8/C10.
- The domain gate itself: behaved correctly on all three runs (retained the contempt
  claim; correctly set aside S1's law/media/culture material at 73%). No benchmark
  append proposed from this run.

7. THIN AREAS WARRANTING EXPANSION: C1b, C1d, C3, C4, C5, C9, C10, C11, C12 (all D2,
   detailed above).

8. RECURRING MATERIAL GAPS: C1a, C1c (jointly: the retention gap — the submission's
   headline), C2, C6, C8. All remain research leads under the checkpoint's own rule;
   C1a is nearest to doctrine-ready (multiple recurrence legs + fixtures already
   in-domain), contingent on its counterevidence shipping with it.

9. ISOLATED RESIDUES RETAINED WITHOUT PROMOTION: C7 (dread game); alpha widow
   (mechanically distinct comparison-anchor claim, community lore only, parked pending
   any instrumented source); Briffault's Law (clean citation-hygiene kill available —
   Briffault restricted the claim to non-human animals and denied the analogy — parked
   as docket material, not doctrine); plate-theory residue (the interesting remainder is
   a pressure test FOR #abundance-trap, whose moderator logic predicts the rotator taxes
   himself).

10. FALSE GAPS EXPLICITLY REJECTED
- Preference-matching null as a gap (covered; if it resurfaces from Lab verdicts, the
  fix is index-vocabulary/overlay, not doctrine — D1 pattern).
- "Site says assortative mating is rising" (false; site says the opposite, sourced).
- Baumeister SET already-on-site (false positive: the site's Baumeister is Baumeister &
  Twenge 2002 on intrasexual suppression, not Baumeister & Vohs 2004).
- The Feminine Imperative as an LE gap (S1's load-bearing claim is about law/media/
  culture; correctly out of domain — a scope boundary, not a gap; the Lab's 73% set-aside
  was correct behavior).
- 5:1 ratio (absent AND foreclosed by #good-news-rule's own epistemics; do not resurrect).
- Sexual economics / "cheap sex": genuinely absent and DELIBERATELY NOT RECOMMENDED —
  contested theory with a published rebuttal exchange (Rudman & Fetterolf 2014 vs Vohs &
  Baumeister 2015); the site already rejects the retail thesis at M-TBD-33, and
  dd-relationships-throughout-history.html:260 stops one inferential step short in a way
  that reads deliberate. Recorded as a likely inter-lane disagreement point.

11. CONTRADICTIONS AND MISSING EVIDENCE (preserved)
- C1a: empirical concentration in one research program; accuracy-claim critique.
- C1c: clinical-vs-instrumented split inside the Perel lineage.
- C2: single-survey base; substitution-vs-complement direction unmeasured (unanswerable
  at Tier 1 today).
- C5: no research base at all behind the discourse trend.
- C8: both figures unverified by this lane.
- C10: the sole-channel claim does not exist in the source data.
- C11: the source lineage contradicts itself on the window (29–31 → 24–27).
- Instrument note: zero pressure tests fired on any 0%-coverage run — pressure tests
  appear to require mapped matches; flagged as a possible instrument gap, not changed.

12. PROVENANCE DATES (earliest Lab/lane discovery, governing any future stamp)
All clusters C1–C12 and all §9–10 items: 2026-07-27 (Run 01; Lab ingestion runs S1–S3
dated 2026-07-27; canon 1.0.0+8c38a2f1d015). No cluster in this submission derives from
the 2026-07-26 Harvest #1 runs.

13. FINAL STATEMENT
No implementation occurred. No website, canon, classifier, benchmark, schema, or test
file was modified in preparing this submission; the working tree at
cdac8b35186fdd2619af54be8aa423bc36d88a71 was untouched. No Codex analytical conclusions
were read, requested, or imported.


---

# RUN-STATE.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/RUN-STATE.md`

# RUN-STATE — doctrine research combo run

**This file is the run's checkpoint.** A fresh orchestrator session should be able to resume from it
without reading the conversation that produced it. Updated per batch.

- **Run:** doctrine research combo run, three batches of research scouts feeding the LE Lab.
- **Started:** 2026-07-29. Ratification: Jason's single front-loaded GO for the full three-batch plan.
- **Orchestrator:** Claude Opus 5, effort xhigh. Coordinates only; does not research or review.
- **Instrument:** LE Lab v2.6.1, frozen for the run's duration. No Lab file has been modified.
- **Repo at last update:** branch `main`, parent commit `1081155`. All three batches ingested, reviewed and
  **pushed**. Batch 3 took three cold reviews to clear.

> ## ✅ CURRENT STATE: ALL THREE BATCHES COMPLETE, REVIEWED, AND PUSHED
>
> Batch 3's second cold review returned `INTEGRITY: CONTEST` on unit 34 and halted the run. **Jason ruled: run
> a third cold review of the repaired packet, then push.** Review 3 returned **ACCEPT 36 · REWORD 4 · CONTEST 3
> · INTEGRITY 0**, with unit 34 itself **ACCEPT** and the repair verified. **Escalation closed; all seven
> quality findings applied; batch 3 pushed.** See **§5ac0** for the close-out, **§5ac** for the escalation.
>
> Two things a fresh seat must not miss: **batch 2 is repaired but unre-reviewed** (§5aa) — the one artifact in
> the run whose repair no cold reviewer has seen — and the referee-block spec lives in **§5ad** because it was
> previously carried only in a dispatch prompt.
>
> **The run promoted no doctrine.** That is the outcome, not a shortfall: three clusters came back weaker than
> checkpoint 01 recorded them, one came back with two citation corrections, and the one quantitative finding
> has two live readings the run refuses to choose between. The referee block carries all of it.

---

## 1. INTAKE CORRECTION — read this before trusting any earlier framing

The handover that started this run described resuming a paused run from a checkpoint, and supplied
`[CHECKPOINT_PATH]` as an **unsubstituted placeholder**. Intake established that **the run it
described had no state in this repository**:

- No `RUN-STATE.md` existed (this file is the first).
- No `scouts/`, `lab-exports/`, or `review-packets/` directories existed.
- The only checkpoint-named artifact, `md/claude-doctrine-checkpoint-01.md`, declares itself a
  FROZEN HISTORICAL ARTIFACT whose lane **closed** — "0 doctrine-ready candidates; lanes closed;
  epoch frozen."

The stop condition "checkpoint conflicts with repo state" did **not** fire: checkpoint 01 is fully
consistent with the tree. What was absent was the combo run's own state. This run is therefore a
**cold start built on checkpoint 01's residue**, not a resume — and checkpoint 01's architecture
(five genre scouts plus four adversarial verifiers) is a *different, older* design than the
scouts/intake/cold-reviewer rig used here. Run 01 closed without promoting doctrine; this run is its
harder-edged successor. There were no orphaned assignments to recover.

## 2. THE THREE RECONCILIATIONS, as resolved

**(a) Epoch — "all sources at v2.6.1" versus the shipped v2.6.1 ruling.** Not re-running sources
01/02/04. `md/lab-v2.6.1-sol-handover.md` records the standing ruling that v2.6.1 provably cannot move
them: `provider` and `breadwinner` occur zero times across all three, `provider` holds the canon's only
non-empty denylist, the threshold sweep returned 0 changed of 46,350 pairs, and the demo capture was
byte-identical before the version bump. Re-running would yield a provenance-only delta and would
reverse a decision already through cold review.
The manifest epoch now reads analyzer **2.6.1** with sources 01/02/04 retaining v2.6.0 exports, and
records that **every other epoch field is identical across the boundary** — analysis schema
`le-lab.analysis/2.6`, queue schema `le-lab.research-queue/2.1`, scoring config `bt0a7p`, canon
`1.0.0+949aef381d5f`. That identity, verified by reading it out of the six new exports rather than
from memory, is what makes cross-version comparison sound. `singleVersionStatus` states both
exclusions (source 03; the 2.6.0/2.6.1 split) in full.

**(b) Deliverable layout versus the not-published corpus ruling.** Raw third-party text cannot be
committed. Resolution: raw captures → `lab-corpus/sources/` (gitignored, hashed in the committed
manifest); analyses and companions → `lab-corpus/exports/` (gitignored, hashed); findings, review
packets, and this checkpoint → `md/` (committed). Batch deliverables live in
`md/doctrine-run/batch<N>/`.

**(c) A stale manifest string.** `singleVersionStatus.reason` claimed the acquired sources were
"single-version at 2.5.0" when the epoch was 2.6.0. Corrected as part of the batch-1 merge.

## 3. PROVENANCE DOCTRINE FOR THIS RUN — the load-bearing decision

`tools/extract-source-text.mjs` states in its own header that a model-mediated "read the page and
write it out" step is not reproducible byte-for-byte and breaks the corpus chain. **Research scouts
are model-mediated.** Therefore:

> **No scout capture is ever archived as a corpus artifact.** Every accepted source is independently
> re-fetched and re-extracted by the orchestrator. A source that cannot be fetched reproducibly is
> recorded as a gap, not ingested.

Two provenance grades, recorded per source in the manifest:

- **Grade A** — archived HTML → committed `tools/extract-source-text.mjs` → SHA-256. Verifiable from
  the repository alone. Same grade as pre-existing sources 01/02/04.
- **Grade B** — archived PDF → `pdftotext` 4.00 with recorded flags (`-enc UTF-8 -nopgbrk`) →
  recorded `awk` anchor truncation → SHA-256. Reproducible with the same tool version, but the
  extractor is an external binary rather than a hashed repo file, so it is **strictly weaker** and
  labelled as such. Used only where the publisher ships no HTML full text.

The scout capture survives as an **independent cross-check**: 8-word shingle overlap against the
deterministic extraction, recorded per source. A scout that paraphrased, truncated, or invented prose
shows up as collapsed overlap. This is corroboration of the scout, never provenance for the text.

## 4. BATCH STATUS

### Batch 1 — THE RETENTION GAP — **COMPLETE, reviewed, corrected, pushed**

Scouts: **S-A** (Opus 5 xhigh) Gottman primary + critique · **S-B** (Sonnet high) desire-decay
empirical leg · **S-C** (Sonnet high) mate-value discrepancy × alternatives. All three returned.
**C3** required no scout (site-internal) and was re-verified at `c40cd7f` and again at `845f56a`.

Six sources added to the corpus, all analyzed at v2.6.1, manifest 4 → 10 sources:

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Scout overlap |
|---|---|---|---|---|---|---|---|---|
| 05 | Kim, Capaldi & Crosby 2007 | A | 9,249 | 159 | 6 | 3.8% | 153 | 84.4% |
| 06 | Heyman & Slep 2001 | A | 3,484 | 46 | 0 | 0% | 46 | 95.1% |
| 07 | van Lankveld et al. 2021 | A | 6,642 | 170 | 12 | 7.1% | 158 | 99.0% |
| 08 | McNulty, Wenner & Fisher 2016 | A | 8,332 | 141 | 20 | 14.2% | 121 | 99.1% |
| 09 | Conroy-Beam, Goetz & Buss 2016 | B | 7,376 | 262 | 32 | 12.2% | 230 | 78.3% |
| 10 | Miller 2007 | B | 5,763 | 108 | 7 | 6.5% | 101 | 95.9% |
| | **Total** | | **40,846** | **886** | **77** | — | **809** | — |

All mapped shares **PROVISIONAL** (thresholds uncalibrated by design). 51 recorded manifest hashes
verified against disk, 0 failures. No scout fell below 60% overlap; **no scout fabricated prose**.

Substantive results, as data rather than adjudication:
- **An independent replication of the Gottman affective process models exists and FAILED** (Kim et
  al. 2007, Oregon Social Learning Center, zero author overlap, same SPAFF instrument), with a stated
  scope limit: it did not test the four-horsemen prediction equation head-on.
- **The primary table puts defensiveness above contempt** (husband defensiveness F=16.08 p<.001 vs
  contempt F=4.26 p<.05; husband criticism and wife stonewalling non-significant), which does not
  support the claim's own ordering.
- **The headline accuracies sit on three different denominators** (93% includes self-reported
  satisfaction and thoughts of dissolution; 95% discriminates early- from later-divorcing among the
  already-divorced, ~20 couples against 8 predictors; 83.5% is horsemen-plus-satisfaction whole-sample).
- **The primary corpus is one program on two cohorts**, established by near-identical recruitment
  prose; the critique side is four mutually independent lineages.
- **C1c returns a counter-finding**: primary-verified associations between security proxies and desire
  run *positive* (intimacy and partner responsiveness r=.25 each), the attachment-moderation
  hypothesis was rejected by its own authors, no instrumented mechanism test was reached, and
  sub-claim (c) has no located instrumentation at all.
- **C6's interaction test exists** but its "alternatives" term is a computed pool statistic over
  strangers the participant never saw — not the visibility the claim is worded on; and the 2017 review
  citing it as established is the same lab restating one dataset.
- **The residue contains its own corroboration of the retention gap**: Conroy-Beam et al.'s own
  sentence that "little research examines the role of mate preference psychology after mate
  selection" surfaced as an unmapped claim.

Deliverables: `md/doctrine-run/batch1/` — `S-A-findings.md`, `S-B-findings.md`, `S-C-findings.md`,
the three `capture.json` files, `C3-site-internal.md`, `lab-results-and-residue.md`,
`review-packet.md` (36 items, now revision 2), `review-dispositions.md`. Ingestion committed as
`cb0d654`; review corrections in the following commit.

**Cold review: ACCEPT 21 · REWORD 10 · CONTEST 5 · INTEGRITY 0.** All 10 REWORDs applied. 4 of 5
CONTESTs applied; **ITEM 11's charge was rejected with reason** — the packet's design description was
verbatim-faithful to the archived source, so the 88-versus-37 divorced-case discrepancy is the
*paper's* unexplained n drop, not a denominator the packet changed. The observation was kept and is now
disclosed as a preserved source defect. Four contested points were settled by re-reading archived
source text rather than by argument, which is only possible because those sources are in the corpus
with verified hashes.

One reviewer catch was a real error of mine: ITEM 17 had attached a subsample caveat to the *avoidant*
correlation when it belongs to the *anxious* one and runs the opposite way. Corrected. Two magnitude
adjectives ("medium effect size", "weakly positive") applied to the same r = 0.25 were both withdrawn —
the source supplies no adjective.

**Lesson for batches 2 and 3:** the corrections cluster in one failure mode — tier labels assigned to
sources that were never read. Four of five CONTESTs and two REWORDs are that. Assign **"TIER 3 as
sourced" to every unreached source by default** and state the counterfactual separately; never grade
what a source would rate if its secondhand description held.

### Batch 2 — VERIFICATION-FIRST — **sources ingested and committed (`bdfeb2f`); cold review in flight**

All three scouts returned. Six sources archived, manifest 10 → 16, **87 hashes verified, 0 failures**.
Deliverables in `md/doctrine-run/batch2/`: three `S-*-findings.md`, three `S-*-capture.json`,
`review-packet.md` (23 items). Not yet pushed — waiting on the review, per push-per-completed-batch.

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Scout overlap |
|---|---|---|---|---|---|---|---|---|
| 11 | IFS / Wang, Gen Z partner priorities | A | 2,098 | 55 | 7 | 12.7% | 48 | 70.5% |
| 12 | NEP exit-poll methods statement | B | 592 | **0** | 0 | n/a | 0 | 64% |
| 13 | Wheatley "Counterfeit Connections" | B | 8,479 | 129 | 7 | 5.4% | 122 | 88.6% |
| 14 | Common Sense Media / NORC | B | 4,963 | 17 | 1 | 5.9% | 16 | 78.6% |
| 15 | ASC / Cox, American Friendship | A | 4,592 | 17 | 0 | 0% | 17 | 90.9% |
| 16 | Pew, emotional support (ch. 2) | A | 819 | 3 | 0 | 0% | 3 | **40%** |

**C8 did not survive verification.** Figure 1 corrected four ways — sponsor is IFS/YouGov alone (not
AEI/IFS); sample is 2,000 men + 1,000 women, not a balanced 3,000, opt-in panel, no published MOE; **the
36% belongs to conservative WOMEN (36.39), conservative men are 36.98 → 37**, and the recorded
"liberal women 60% vs conservative men 36%" pairing appears in no source; and it is **not a ranking
question** — ten qualities rated independently. The same data undercuts "asymmetrically by sex": liberal
men's political-over-job gap (+8.18) exceeds liberal women's (+5.76), and the conservative sex gap is
0.59 points with men higher. Figure 2 is **UNVERIFIED** — no such instrument exists, two sources
contradict the divergence reading, and "gender gap" carries two incompatible definitions (11 vs 31
points) where the larger double-counts against the historical series.
**C2** weakened: opt-in quota panel, lifetime-ever headline items, user-denominator preference figure, no
current-relationship item, independent source has the wrong population, nothing measures displacement.
**C10** splits three ways rather than confirming: the usual citation genuinely lacks the concentration
step, one wrong-population source finds it, and Pew 2025 finds **no sex gap in partner reliance at all**.

**Source 12 returned zero claim-like segments** — a one-page election-methods statement with no domain
claims, archived for provenance not yield; an empty claim surface is the gate behaving correctly.
**Source 16's 40% overlap was MY extraction, not a scout failure** — investigated and resolved as a span
difference (the scout merged the landing page with the chapter; the whole fetched page holds only 1,626
words including chrome, so 819 is the chapter's real prose, and the decisive sentence is present
verbatim). Recorded because the cross-check is supposed to catch the orchestrator too.

### Batch 3 — CITATION-GRADE CLOSERS — **ingested, packeted, reviewed THREE TIMES, repaired twice, pushed**

All four scouts returned (S-G, S-H, S-I-A, S-I-B). Six sources ingested (manifest 16 → 22), packet authored
under the two-part doctrine, **two** cold reviews run, both repair passes applied, dispositions written to
`md/doctrine-run/batch3/review-dispositions.md`. Review 2 returned an `INTEGRITY: CONTEST` and halted the run;
Jason ruled for a third review, which **cleared it** (ACCEPT 36 · REWORD 4 · CONTEST 3 · INTEGRITY 0, with unit
34 itself ACCEPT). **Batch 3 is pushed.** See **§5ac0** for the close-out and **§5ac** for the escalation.

The paragraph that used to sit here said "no source ingested, no packet authored, no review run." That was
true when written and is now stale in every clause; it is replaced rather than annotated so a fresh seat cannot
act on it.

Headline results, as data:
- **S-H (C9):** the gate architecture reaches **TIER 1** — independently preregistered-replicated by Zhang
  et al. 2019 (no author overlap with Li), with Marzoli et al. 2013 *partially failing* to replicate the
  resources-for-women half. But the **convergence half is TIER 2 with no independent replication, and
  cannot be**: neither independent lineage varied budget size, so neither could test it. The
  surveys-are-free inference is **TIER 3 as sourced** — Li's own rationale, never isolated against a real
  unconstrained-survey comparison. The adjacent stated-vs-revealed divergence *is* TIER 1 (Eastwick &
  Finkel 2008, independently replicated by Selterman et al. 2015).
- **S-G (C4):** the dyadic-vs-structural mechanism **is instrumented, and the structural half came out
  weak or contradicted in both direct tests found.** Trent & South 2011 (n=3,821, China) derived competing
  predictions and the data matched demographic-opportunity theory, *not* the structural prediction. Dollar
  2014 found the structural-power operationalisation contradicted the theory in the pooled US sample —
  their words, "relatively weak support for Guttentag and Secord's hypothesis on female structural power
  as a contingency factor." So C4's missing half is not merely absent from the site; it is partly
  falsified. Also: Filser & Preetz 2021 (n=12,402) find objective local sex ratio correlates only weakly
  with *subjective* partner-market experience — a caution for any sex-ratio claim. The G&S book itself was
  never reached; all dyadic/structural definitions come through Dollar's quotation, labelled as such.
- **S-I-A (C12):** citation corrected — **Hirschl**, Schwartz & Boschetti, *Demography* 61(5):1293–1307
  (2024), DOI 10.1215/00703370-11558914 (the prior record's "Schwartz et al." is wrong). The **1990
  inflection belongs to homogamy, not hypergamy**; hypogamy's rise is continuous from 1970. Relationship
  to Esteve 2016 is **refinement, not correction** — Esteve never treats homogamy as a construct, and
  there is no numeric conflict, so the site's existing citation is incomplete rather than wrong. Findings
  are sourced to the CDE working paper; the published body text was unreachable (Duke UP 403) with the
  abstract cross-checked word-for-word.
- **S-I-B (C1d):** the strongest analytical return of the run. **All three components of the suffocation
  model are asserted rather than measured, in different ways.** Demand concentration is TIER 3 and *is not
  the claim the phrase implies* — the article explicitly rejects the "more is asked of marriage" reading as
  other people's and claims an Altitude × Time interaction with total demand roughly constant, which means
  the site's uncited premise sentence may misattribute the model. The investment shortfall is measured only
  for clock time and only through secondary sources. **Variance widening is never measured anywhere in the
  three Finkel sources** — no variance, SD, tail share, or quantile trend — and its strongest citation
  (Proulx et al. 2007) reports a *strengthening correlation*, a different quantity from a widening
  dispersion. The 2014 piece is a **target article reporting no original data**, so TIER 3 for every
  empirical claim despite a full read. Two further findings worth keeping: Feeney & Collins denied that
  high-altitude support is especially demanding and Finkel *partly conceded*, weakening the mechanism the
  mismatch depends on; and **no commentary disputed the variance claim because the target article had
  barely made it** — the half with predictive content never passed the commentary round. On time use, the
  harmonised AHTUS 1965–2012 series (Genadek, Flood & Garcia Roman) shows couples spending **more** total
  and alone-together time than in 1965 with both series **peaking in 1975 — Finkel's baseline year**;
  non-parents are −11 min/day from 1975 but **+53 min/day from 1965**, and the pre-1975 series is not
  reported in the target article.

**Batch 3 remaining work: none.** The §5ac escalation was closed by review 3 and the batch is pushed. Everything
on the old checklist — ingest, merge, author, review, dispositions, update this file, commit — is done.

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Scout overlap |
|---|---|---|---|---|---|---|---|---|
| 17 | Trent & South, sex ratios (China) | A | 6,689 | 97 | 16 | 16.5% | 81 | 95.2% |
| 18 | Li et al., necessities & luxuries | B | 7,588 | 117 | 31 | 26.5% | 86 | 87.9% |
| 19 | Zhang et al., preference replication | A | 4,257 | 86 | 33 | 38.4% | 53 | 67.9% |
| 20 | Marzoli et al., scenario manipulation | A | 6,503 | 86 | 9 | 10.5% | 77 | 74.3% |
| 21 | Hirschl et al., assortative mating (WP) | B | 3,352 | 32 | 6 | 18.8% | 26 | 74.6% |
| 22 | Finkel et al., suffocation (target article) | B | 26,323 | 576 | 22 | 3.8% | **554** | 61.8% |
| | **Total** | | **54,712** | **994** | **117** | — | **877** | — |

**159 manifest hashes verified against disk, 0 failures.** Deliverables in `md/doctrine-run/batch3/`: four
`S-*-findings.md`, four `S-*-capture.json`, `review-packet.md` (43 numbered units, 19,030 words),
`review-dispositions.md`.

### Batch 3 dispatch history — one scout failure and a recovery

- **S-G** (Sonnet high) — C4, Guttentag & Secord's dyadic-vs-structural mechanism plus sex-ratio empirics. Running.
- **S-H** (Sonnet high) — C9, Li et al. 2002 budget allocation plus the convergence and surveys-are-free halves. Running.
- **S-I** (Sonnet high) — C12 + C1d as one two-part assignment. **FAILED.** Terminated mid-run by an API
  output content-filtering block while writing long verbatim extracts. It had written `raw-01.txt` (1,766
  words) and nothing else — no `capture.json`, no findings. The partial capture is still useful: it
  identifies the C12 paper as **Hirschl, Noah, Christine R. Schwartz & Elia Boschetti, "Eight Decades of
  Educational Assortative Mating: A Research Note," *Demography* 61(5):1293–1307 (2024), DOI
  10.1215/00703370-11558914** (earlier: CDE Working Paper 2022-01, UW–Madison). Note the first author is
  **Hirschl**, not Schwartz — the claim was recorded as "Schwartz et al.", so that is already a citation
  correction.
- **RECOVERY:** re-dispatched as two smaller scouts, **S-I-A** (C12, Sonnet) and **S-I-B** (C1d Finkel
  suffocation model, Opus). Mitigations applied to both prompts, since the block was on output volume:
  one artifact each, verbatim extract **capped at ~1,000–1,400 words** on the most claim-dense passage
  rather than open-ended "800+", each file written in a single Write call, and an explicit instruction
  **not to reproduce verbatim source text in the final chat message**. This is the third distinct harness
  or API constraint the run has hit; see §7.

- **S-D** (Opus 5 xhigh) — C8. Verification IS the deliverable: the AEI/IFS ~3,000-respondent 18–29
  figure (60% liberal young women vs 36% conservative young men ranking alignment above job
  stability) and the Gen-Z exit-poll gender-gap series. Each returns VERIFIED / CORRECTED /
  UNVERIFIED. Secondary: stated preference versus revealed sorting.
- **S-E** (Sonnet high) — C2. The Wheatley/BYU Feb-2025 instrument plus any *independent* survey;
  prevalence versus substitution kept separate; vendor projections excluded as marketing-tier.
- **S-F** (Sonnet high) — C10. The Cox/Survey Center sex split with exact question wording and recall
  window, and an honest test of whether the sole-channel step exists in any source data — the prior
  pass recorded that it does not.

### Batch 3 — CITATION-GRADE CLOSERS — planned, not dispatched

- **S-G** (Sonnet high) — C4. Guttentag & Secord's mechanism half (dyadic vs structural power) plus
  campus sex-ratio empirics.
- **S-H** (Sonnet high) — C9. Li/Bailey/Kenrick/Linsenmeier 2002 budget-allocation primary plus the
  budget-convergence replication line.
- **S-I** (Sonnet high) — C12 + C1d. Schwartz et al. *Demography* 2024 and the Finkel
  suffocation-model primary.

## 5. THE RIG — how to reproduce or continue the pipeline

Lives in the session scratchpad (not committed; it is orchestration, not doctrine):

- `export-companions.mjs` — emits `.queue.json` and `.md` by consuming the frozen `js/lab-export.js`.
  **Validated byte-identical** against the committed v2.6.0 companions of source 04, once a trailing
  newline is appended (the UI's download path adds it; without it every file is one byte short).
- `ingest-source.mjs` — extraction (grade A or B) → scout cross-check → analysis → companions →
  labeling sheet → manifest entry. Metric field names were verified against source 04's committed
  `result` block; three initial guesses were wrong (`mappedClaimSegments`,
  `mappedClaimSegmentSharePct`, and `provisional` being a nested object).
- `run-batch.mjs` — drives a spec array, writes entries to a staging file. Deliberately does **not**
  write the manifest.
- `merge-manifest.mjs` — the only writer of the committed manifest. Refuses on id collision, on epoch
  disagreement among new exports, and if any non-analyzer epoch field has moved. Dry-run by default.

`words` in the manifest is a **whitespace-run count of the extracted text** (`text.trim().split(/\s+/)`),
not the analyzer's `totalWords`. It is **not** `wc -w`: in this shell's `C` locale `wc -w` mis-splits
multibyte characters and reads high — source 21 (347 multibyte chars) returns 3403 under `wc -w`, 3344 under
`LC_ALL=C.UTF-8 wc -w`, and **3352** by the whitespace-run count the manifest records. Verify `words` in
Node, not in the shell; an earlier version of this note said "plain `wc -w`" and would send a reader chasing
a phantom discrepancy.

## 5ac0. ✅ ESCALATION CLOSED — batch 3 review 3 cleared the repair, and three repairs had introduced new defects

**Jason's ruling on the §5ac escalation:** run a third cold review of the repaired packet, then push. Done.

**Review 3 — fresh subagent, no knowledge of reviews 1 or 2, fenced to the packet: ACCEPT 36 · REWORD 4 ·
CONTEST 3 · INTEGRITY 0** across the same 43 units. **Unit 34, the escalated unit, came back ACCEPT** with the
repair checked rather than accepted: the reviewer verified the "(as described in my assignment)" withdrawal
against S-I-B's own text and confirmed the conclusion is *"correctly narrowed to the candidate doctrine's
pairing rather than the published page."* On the gate overall: *"No claim, quote, figure, DOI or URL in Part One
was found to lack a basis in a cited source."* **The escalation is closed and batch 3 is pushed.**

**All seven quality findings applied, none rejected.** Two are worth carrying beyond this batch:

- **The 15 pre-batch-3 corpus sources had no locators anywhere in the packet** — identified by topic label only
  ("01 Pew online dating") while an appendix claimed to hold "locators for every source Part One relies on."
  The reviewer called that appendix the packet's **weakest unit** for asserting a completeness it did not have.
  Fixed: all 21 corpus sources now carry author, year, venue and URL from the committed manifest.
- **Unit 6's per-source figures carried no trust-class flag** while units 4 and 36 did — the same selective
  disclosure that produced the unit-34 escalation, on its last unflagged holdout. Flagged now.

**THE FINDING THAT MATTERS MOST FOR ANY FUTURE BATCH: three of review 3's seven findings are defects the
review-2 repairs themselves introduced or re-imported.**

- **Unit 3** — the repair named two limb-2 tier assignments when the packet relies on four (Esteve and the
  Hirschl WP are also graded TIER 1 on design). A count refuted by the packet's own contents, committed *while
  fixing* a different defect in the same unit.
- **Unit 40** — the repair withdrew the phantom 60% cross-check floor and then wrote "none of the six
  collapsed," smuggling the same unstated criterion back in.
- **Unit 14** — the repair withdrew "partly falsified" for a reason its own next two units contradict.

**Therefore: a repair pass needs its own verification pass against the same checks the original failed.** Three
of seven is high enough that **"repaired" must not be treated as a stronger status than "reviewed"** until the
repair has itself been reviewed. That is exactly the gap that left batch 2 repaired-but-unre-reviewed, and
exactly why requiring review 3 was substantive rather than ceremonial.

**One pattern did close.** Review 3 found zero integrity items and zero provenance over-scope defects — the
failure mode behind all three escalations. What worked was not a convention or a reminder but a mechanism:
**every unverifiable claim now carries an explicit trust-class flag naming what the reader cannot check.**

## 5ac. Batch 3 review 2 — the THIRD integrity escalation, since closed by review 3 (see §5ac0)

The batch-3 repair was completed as ruled (all five items), the packet was rebuilt with per-claim anchors and
43 numbered units, and a **fresh** cold reviewer with no knowledge of review 1 was dispatched. It returned:

**ACCEPT 24 · CONTEST 9 · REWORD 9 · INTEGRITY: CONTEST 1** across 43 units.

**The escalated unit is 34 — the C1d misattribution paragraph.** Two independent defects in one unit:

1. The packet asserted *"Checkpoint 01's own reverse-check records that passage as 'unnamed, uncited'"* — a
   quotation from a document **not in the packet, with no citation of any kind**, which was the **sole support**
   for the unit's exculpatory conclusion. The same unit disclosed the trust class of its *other* unverifiable
   item (the site quote) two paragraphs later. **The orchestrator knew to flag trust class and flagged one of
   two.**
2. The packet wrote that S-I-B *"independently records"* the vocabulary absence. **It does not.** S-I-B's own
   sentence reads "the website's premise sentence **(as described in my assignment)** uses none of the model's
   distinctive vocabulary" — the scout never saw the page, so its observation is derived from the
   orchestrator's own description. One source presented as two.

**Both charges accepted; nothing rejected.** The quotation is *accurate* (`md/claude-doctrine-checkpoint-01.md:89`
reads it verbatim), so this is not fabrication — it is an uncited true statement carrying a conclusion the
reader was not allowed to check. **Repaired** by grounding the conclusion in four repository checks (the
callout at `dd-relationships-throughout-history.html:269–273` carries no `dd-callout-cite` while 10 others in
the file do; `Finkel`/`suffocat`/`Mount Maslow`/`oxygenat`/`all-or-nothing` occur zero times in that file;
site-wide `Finkel` appears only as a speed-dating co-author; checkpoint 01 now cited at file:line as
corroboration), all disclosed as orchestrator-side controls. "Independently" withdrawn.

**This is the run's third escalation and the third instance of one failure mode** — the orchestrator stating
something more confidently than its own artifacts support, in the provenance layer. Batch 2 ITEM 15 (locators
shed in compression) → batch 2 unit 30 (read status asserted falsely) → batch 3 unit 34 (external quotation,
uncited, selectively undisclosed). **Corrected three times, recurred three times, caught by review every
time and never by the orchestrator's own pass.**

**Also at cluster scale for the second time: the citation floor.** Six of the nine CONTESTs are one defect —
S-H defers all five of its locators to a `capture.json` that is not embedded, and the Dollar dissertation, the
packet's single most load-bearing unhashed source, carried no title and no URL. Batch 2's Cluster 3 failed the
same way (S-F: zero URLs, zero DOIs across seven sources). Repaired by adding a **CITATION APPENDIX** (unit 43)
built from the committed capture files. **That is a patch on the packet, not a fix to the process: future scout
prompts must require locators inline in the findings file, because the findings file is what gets embedded.**

**A miscorrelation risk the adjudication surfaced:** because `Finkel` *is* on the site as a speed-dating
co-author, any canon or citation sweep keyed on the surname will find Finkel cited and could wrongly conclude
the suffocation model is sourced. Two unrelated Finkel literatures, one on the site.

**What Jason needs to rule on:** whether the unit-34 repair closes the escalation and batch 3 may be pushed.
Everything is committed locally. Full adjudication in `md/doctrine-run/batch3/review-dispositions.md`.

## 5ad. THE CONSOLIDATED REFEREE BLOCK — standing spec, recorded here because it was not

The batch-3 seat was told this file carried the referee-block spec. **It did not** — the spec existed only in
the dispatch prompt. Recorded now so it survives the seat. The referee block is
**`md/doctrine-run/referee-block.md`** and it must carry:

1. **Run-state summary** — enough that a referee needs no other file.
2. **Batch ledger** — every source, grade, words, claim-like, mapped, share, residue, scout overlap.
3. **Full dispositions** — every review, every unit, ACCEPT/CONTEST/REWORD/INTEGRITY, with adjudications.
4. **Residue as a first-class result**, not a backlog.
5. **Miscorrelation items with unit IDs**, handed over unacted-on (flag-mapping is Jason's alone).
6. **An UNSANITIZED disclosures section** carrying, at minimum: every integrity escalation with its
   resolution; every charge the run *rejected*, with reasons; scout failures; every harness and API
   constraint; both provenance grades **and what neither guarantees**; and a **synthesis-error record**.
7. **The synthesis-error record is a deliverable, not an appendix** — the referee is comparing lanes on
   exactly this. Enumerate every orchestrator error, group them into failure patterns, state which patterns
   were closed and which recurred, and list every countermeasure with a verdict on whether it worked.

## 5ab. Batch 3 review 1 — no escalation, but the quantitative finding needed repair

**ACCEPT 1 · REWORD 1 · CONTEST 6 · INTEGRITY 0** across 8 units. No fabrication found; the reviewer
affirmed the gap-recording behaviour and noted the per-source shares reconcile to integer counts, "which
is what real measurements do and invented ones generally do not."

**THE CENTRAL CHALLENGE, AND ITS RESOLUTION.** The reviewer's strongest finding was that the quantitative
finding's load-bearing warrant — instrument constancy across both arms — was documented in the packet for
**6 of 13 sources only**, and that the documentation gap was **asymmetric in the direction that would
manufacture the effect** (5 of 7 formation sources this-batch; 1 of 6 maintenance sources). If the canon
had grown between batches, later-analyzed sources would map better and the formation arm is
disproportionately later-analyzed.

**Checked directly against every export on disk, and the confound does not exist in the data:** all 21
analyzed sources share **one canon snapshot `1.0.0+949aef381d5f`, one scoring config `bt0a7p`, and one
analysis schema `le-lab.analysis/2.6`**. Only the analyzer version differs (2.6.0 for sources 01/02/04,
2.6.1 for 05–22), and v2.6.1 was proven behaviorally identical on this corpus (0 of 46,350 pairs moved).
The merge script hard-fails if any non-analyzer epoch field moves, which is why this held.

**So the finding survives — and it survives because the review forced the check.** The reviewer was right
to refuse the warrant: the packet asserted constancy without evidencing it. Same failure class as the
batch-2 provenance defect — knowing something and not putting it in the artifact. **The repair is to
document the epoch constancy across all 22 sources from the manifest, not to re-argue it.**

**ONE ALTERNATIVE EXPLANATION REMAINS GENUINELY OPEN and I did not consider it.** "Other" scores 4.4%,
*below* maintenance's 7.0%, and method papers score 0.0%. That gradient is at least as consistent with
"the canon fires on material topically near its core — mate preference and formation — and decays with
distance" as with a formation/maintenance *stage* asymmetry. Those two readings say different things about
the site, and the packet never weighs them. This is the most substantive unresolved item in batch 3.

**Confirmed factual errors to fix (mine, not the scouts'):**
- **Source 01 at 43.5% is the highest formation share AND the highest in the corpus — not source 19 at
  38.4%.** The packet asserts 19 is highest twice, and its own per-source list refutes it both times.
- Distribution overlap is **3 of 13**, not 2: formation source 11 at 12.7% also sits inside the
  maintenance range (between 09 at 12.2% and 08 at 14.2%).
- "22 sources" labels a 21-ID enumeration (source 03 has no export and contributes nothing).
- **15 of 22 sources are never named**, so the stage classification cannot be disputed for them — including
  5 of 6 maintenance sources supplying 840 of that arm's 1,416 segments. The classification was also made
  with the mapped shares already in hand, which the packet does not disclose.
- C4: **"partly falsified" overstates S-G's "weak, mixed, or contradicted"**, and I dropped three defeaters
  Part Two supplies — Dollar's own attribution of the null to "my rudimentary measure," the theorized
  relationship holding for Black and Hispanic populations, and South (1988) reportedly finding stronger
  support on a similar measure. I also mis-credited the unreached-book gap to myself when S-G flagged it
  first, and *understated* my own evidence base: the dyadic/structural definitions come through **two**
  independent secondary readers, not Dollar alone.
- C9: the gate architecture claim is misscoped — Zhang replicated the sex-typed **allocation** pattern at a
  **single fixed budget**, which cannot demonstrate a budget-gated necessity/luxury architecture.
- C1d: **"No commentary disputed the variance claim" converts an explicit UNVERIFIED into a flat negative
  existential about 13 unread papers.** "All three components are asserted rather than measured"
  contradicts my own next bullet. The "site states this premise nearly verbatim" claim quotes **neither**
  text and S-I-B says the site's sentence "uses none of the model's distinctive vocabulary" — so the
  misattribution inference is unsupported and points the wrong way. GFG is **not** an independent check (it
  re-analyses the same time-diary series), and I dropped its own exculpatory wrinkle.
- Provenance: the "three sources not archived" enumeration is **materially incomplete** — Kruger, Filser &
  Preetz, the Secord abstract, Esteve, and S-I-B's REPLY/PRÉCIS/GFG are all primary reads outside the hash
  chain, and four of them carry load-bearing Part One claims. Source 21's extractor is misattributed
  (S-I-A used r.jina.ai, not pdftotext). "Three lowest" then explains four. "None fell below 60%" invokes a
  floor stated nowhere. No hash digest appears in either packet, so "verifiable from the repository alone"
  is not verifiable from the document.

**Verdict on the two-part doctrine, from the reviewer:** keep it. "Because Part Two carries the locators,
tiers and gaps verbatim, most of the defects above were *detectable*… A single-layer packet would have
hidden all three." Two required fixes: **per-claim anchors** into Part Two (cluster-level pointers are not
citations), and stop advertising byte-auditability a reviewer fenced to one file cannot perform — the
structure delivers auditability of *reasoning*, not of *bytes*.

## 5aa. ⛔ HALTED — batch 2 revision 2, a SECOND and DIFFERENT integrity escalation

The batch-2 repair was completed as ruled (all five items), the packet was rebuilt under the new two-part
doctrine with all three scout blocks **SHA-256-verified byte-identical**, and a **fresh** cold reviewer with
no knowledge of the first review was dispatched. It returned:

**ACCEPT 13 · CONTEST 9 · REWORD 8 · INTEGRITY: CONTEST 1** across 31 units.

**The new escalation is unit 30 — the PROVENANCE section itself.** My scope sentence reads: "Every other
source cited anywhere in this packet — including all of Cluster 1's revealed-sorting literature, the
Romantic Recession instrument, the Gallup/HBR figure, 'Secret Soulmates', Sun & Schafer, Shin & Park,
Dykstra & de Jong Gierveld, and McPherson et al. — **was read by a scout** but never archived."

**Verified against the embedded scout files: that is false for most of the list.** They record, verbatim,
"did not fetch it", "did not fetch the article", "FAILED TO REACH FULL TEXT", "could not retrieve the HBR
article's full text", "UNVERIFIED-TO-PRIMARY", and "not from text I read myself". The reviewer escalated on
the "unverifiable source presented as verified" condition, and located it correctly: the provenance layer is
precisely where a reader is entitled to rely on read/unread status.

**Mitigation the reviewer itself established, and which I confirm:** *no figure from any unread source is
carried into Part One.* No unverified number entered the findings through this door. The defect is a
false read-status assertion, not propagated bad data, and not fabrication — the reviewer states no
fabrication was found anywhere in the packet, and independently verified every DOI as well-formed and
venue-consistent.

**FIX APPLIED in the batch-3 repair seat — read this precisely.** The one-line fix was ruled available at
escalation time and **was not applied then**; the batch-2 packet sat in the working tree still carrying the
false assertion, and a `grep` for "was read by a scout" missed it because the clause line-wraps. It is now
repaired: the blanket claim is withdrawn and replaced with a per-source read-status audit in three tiers —
**read to primary** (Romantic Recession, "Secret Soulmates"), **abstract or tool-summary only** (Sun & Schafer,
Dykstra & de Jong Gierveld, Shin & Park), **not reached at all** (the Gallup/HBR figure, McPherson et al., and
three items in Cluster 1's revealed-sorting literature where S-D records "FAILED TO REACH FULL TEXT", "did not
fetch the article", "did not fetch it"). "TIER 3 as sourced" is now applied to the second and third groups, and
the no-figure-carried mitigation is stated.

**The corrected batch-2 packet has NOT been re-reviewed.** Batch 2's status is **repaired but unre-reviewed**,
which is weaker than batch 1 or batch 3. A referee should treat it as such.

**This defect does NOT obviously repeat in batch 3.** Its equivalent claim ("three sources S-H and S-G read
primary were not archived") is accurate: S-H recorded all five of its raw files as byte-level verbatim
extractions, and S-G read the Dollar dissertation as raw-02. Batch 3's own review is still in flight.

**Other confirmed batch-2 findings worth carrying (quality, not escalating):** unit 14 is the weakest
reasoning in the packet and the reviewer is right — my "gender gap" correction attributed a residual to
Edison's 12/13/24 reweighting when the CAWP figure already incorporates it and the two numbers come from
**different instruments** (Edison vs AP VoteCast), a distinction Part Two documents directly; the "≈15.5"
pivot is in no source. Unit 12 is a real figure-fidelity error: I used the 0.59 *level* difference inside a
bullet scoped to the political-minus-job metric, where the conservative gap is actually 27.53 — which
*reverses* that bullet's conclusion. Units 10 and 11: the two "Stable job" values carrying the headline
−33.35 appear nowhere in Part Two, so that correction asserts a digit its recorded inputs cannot determine.
Unit 16: I claimed Part Two carries a URL "for every figure," and S-E contains exactly one URL.
**Cluster 3 fails the citation floor outright** — S-F contains zero URLs and zero DOIs for any of its seven
sources, so on the stated floor Cluster 3 cannot be promoted as it stands.

**Cluster 1's central correction survives, and more strongly than I claimed it.** The reviewer found a
second, appendix-independent leg I had under-used: Abrams' AEI commentary, quoted verbatim in Part Two with
its own URL, splits the subgroups as "conservative young women (36 percent), liberal young men (47 percent),
and conservative young men (37 percent)." So the subgroup attribution holds even if the Plotly read is
discounted entirely.

## 5a. ⛔ RUN HALTED — batch 2 integrity escalation (FIRST), resolved by Jason's ruling

**Batch 2's cold review returned `INTEGRITY: CONTEST` on ITEM 15.** Per the run contract — "halt if a
cold-review CONTEST alleges fabrication or an unverifiable source (integrity findings escalate to Jason;
quality findings do not)" — the run is halted at batch 2 close-out. **Batch 2 is NOT pushed.**

Batch 2 review totals: **ACCEPT 5 · CONTEST 11 · REWORD 7 · INTEGRITY 1.** Markedly worse than batch 1
(ACCEPT 21 · CONTEST 5), and the reviewer diagnosed why — see the systemic finding below.

**The escalated item, and the orchestrator's verification of it.** ITEM 15 reproduced a verbatim survey
item and a percentage from a Wheatley/IFS follow-up ("Secret Soulmates", n = 2,431; 54% agreeing "I use
romantic AI companion(s) to replace human relationships") with **no author, no year, no URL, no tier, no
UNVERIFIED marker**, and the packet's PROVENANCE section omitted ITEM 15 from its own list of unarchived
sources. The reviewer escalated on the "unverifiable source presented as verified" condition and
explicitly did **not** allege fabrication.

Checked against `md/doctrine-run/batch2/S-E-findings.md`: **the scout sourced it properly and the
orchestrator dropped the provenance when compressing.** S-E supplies the full author list (Willoughby,
Carroll, Toscano, Hakala & Morris), the year (2026), the institutions, the sampling design (Qualtrics
opt-in quota panel, 18–30, currently partnered), the exact question stem with a men's breakdown
(21.5% never / 38.9% sometimes / 21.3% often), a URL
(`https://wheatley.byu.edu/0000019e-1cfd-da4c-a5ff-befd20b10001/secret-soulmates-report`), and records
the report under "Verified to primary — full report PDF read in full."

So the escalation is **valid against the packet and invalid against the source**: a transcription and
provenance failure by the orchestrator, not an unverifiable claim and not fabrication. It is fixable by
restoring what the scout already supplied.

**A second, more substantive defect found during that check, which the reviewer could not see.** The
packet reported the 54% "replace" figure without its counterweight: the same report finds **68% of the
same users said AI companions enhanced their real-life relationships**, and the report itself calls this
a "paradox" with respondents not forced into a single bucket. Omitting it made the packet read more
one-sidedly toward substitution than the source supports. This is worse than the missing URL.

**The reviewer's systemic finding, which is correct and matters beyond this batch:** citation
completeness tracks archival status. All six archived sources (11–16) carry organisation, year, URL,
verbatim strings, and correct tiers. **Nine of the eleven CONTESTs are against scout-read, unarchived
sources missing a URL, a tier, or both** — and in every case checked so far, the scout findings DO carry
the locator and the packet dropped it. Most repairs are mechanical (restore locators from the findings
files); ITEMs 5, 7, 19 and 20 need analytic repair, not just links.

Other confirmed defects worth carrying: an arithmetic slip at ITEM 2 (36.39 − 69.74 = −33.35, not
−33.34); ITEM 7's "roughly double" for an 11-vs-31 gap that is actually a factor of 2.8, with the
remainder attributable to the reweighting the packet's own ITEM 5 records; ITEM 17's "batch's strongest
instrument" superlative contradicted by the packet's own n = 6,204 and n = 5,837; and a TIER 1/TIER 2
inconsistency between ITEMs 8, 17 and 20 on comparable probability-panel instruments.

**Cluster 1's central corrections survive the review.** The reviewer ruled the 36%-is-conservative-women
correction "adequately evidenced" (per-row Sex/Ideology values plus verbatim prose grouping conservatives
and never splitting them), with the qualification that the two-decimal values come from a Plotly read
outside the deterministic extraction chain — so the direction holds and the claimed precision is one
notch weaker than this run's own rules require. The not-a-ranking-question correction is "adequately
evidenced as an inference, overstated as a verified fact," since no questionnaire was ever published.

**Batch 3 scouts were left running** rather than killed — they are independent research and the halt
concerns batch-2 close-out. S-G, S-H, S-I-A and S-I-B may report while this escalation is open; their
output will be archived but batch 3 will not be closed or pushed until Jason rules.

## 6. STOP CONDITIONS — one fired (see §5a)

- Lab analysis failing on a normalized source — **no**, all six analyzed.
- Checkpoint conflicting with repo state — **no** (see §1; the checkpoint was absent, not conflicting).
- A subagent proposing to modify the Lab — **no**. Three scouts returned maintainer-facing
  observations in findings prose, as the contract requires, and generated no feedback files.
- A cold-review CONTEST alleging fabrication or an unverifiable source — **YES, THREE TIMES; all three closed.** Batch 2
  ITEM 15 (§5a), batch 2 revision 2 unit 30 (§5aa), and batch 3 review 2 unit 34 (§5ac). **All three alleged an
  unverifiable source presented as verified; none alleged fabrication, and no reviewer found fabrication
  anywhere in any packet.** All three were valid against the packet and repaired. Batch 1 and batch 3 review 1
  returned zero INTEGRITY items. The third was closed by a third cold review that returned
  zero integrity items (§5ac0). **No stop condition is currently active.**

## 7. OPERATING NOTES

**The checkout is shared and Jason edits it concurrently.** During batch 1 he committed and pushed
three Lab commits (`e48c9d5`, `85a930d`, `845f56a`), moving HEAD off `c40cd7f`. Consequences observed:
- A test run taken mid-save reported 150 tests / 1 failure. Re-run twice afterwards: **171 pass / 0
  fail, exit 0**. The transient was an inconsistent tree snapshot, not a real failure; the count moved
  170 → 171 because his commit adds one test.
- `js/`, `data/`, `scripts/`, `tools/`, and `fixtures/` were untouched throughout, so the analyzer,
  canon, and extractor used for all six analyses are exactly the committed v2.6.1.
- Always stage explicit paths. Never `git add -A`. `artifacts/` is untracked and not this run's.

**Harness and API constraints hit by this run — three distinct ones, all worked around:**

1. **The Write tool refuses files literally named `findings.md` for subagents.** Cost three scouts time in
   batch 1 (one renamed via Bash, one saved under a different name, one could not write at all and returned
   its findings as chat text, which is why `S-A-findings.md` is a transcription). Batch 2 onward specifies
   `evidence-notes.md` and the problem disappeared.
2. **API output content-filtering terminated scout S-I mid-run** while it wrote long verbatim extracts for a
   two-part assignment. Topic was innocuous (educational assortative mating; a marriage-psychology model),
   so the trigger appears to be output volume and density of verbatim reproduction, not subject matter.
   Mitigation that worked: split the assignment, cap the extract at ~1,000–1,400 words on the most
   claim-dense passage, one Write call per file, and forbid echoing verbatim source text in the final
   message. **Any future scout asked for long verbatim capture should carry these caps from the start.**
3. **WebFetch refused verbatim reproduction of two specific pages** (the IFS and AEI articles in batch 2),
   forcing scout S-D to use the browser pane. Plain `curl` had no difficulty with the same URLs, which is
   why the archived artifacts are deterministic extractions rather than browser reads — and is a further
   argument for the orchestrator-re-fetch rule in §3.

**Flag-mapping feedback is Jason's alone.** Scouts and the orchestrator record suspected
miscorrelations in findings prose only; no feedback file is generated by this run.

## 8. ADDENDUM — run artifacts tidied (2026-08-07)

The run's working artifacts — `md/doctrine-run/**`: the referee block, and every batch's scout
findings, captures, review packets and dispositions (28 files) — were deleted from the working tree
in the repo cleanup sweep, the run being closed with all three batches pushed and no doctrine
promoted. This file remains the run's record. Everything was committed and is recoverable in full
from the last commit that touched the directory:

```
git show 8730708:md/doctrine-run/referee-block.md
git show 8730708 --stat -- md/doctrine-run
```

Two caveats recorded above survive the tidy unchanged and live in that history: batch 2's repair
was never cold-re-reviewed (§5aa), and the referee block carries the run's findings — including the
one quantitative finding with two live readings — for any successor run to restore rather than
rebuild.


---

# lab-doctrine-consumer-unit.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-doctrine-consumer-unit.md`

# The consumer unit — the last reader-visible loss the cultural-register merge left

2026-07-30. Canon **469 → 470**, `1.0.0+f263ae6219b9`. One new Lexicon term, two
aliases added to an existing one. No analyzer change.

## What was missing

`04-heteropessimism` argues about the ECONOMICS of coupling: marital consumption
as the shape the promised good life took, the couple as the primary consumer
unit, and its replacement by "a new dyad, the individual consumer and her phone."
The canon could only approximate that with `smv:multiplier:market`, so three
claims in that register reached no concept at all. They were the residual
`md/lab-gate-option2.md` recorded as the fifth of the five claims no gate option
rescues.

## What was authored

**`lexicon:term-the-consumer-unit`** — "The consumer unit", shared lens.

Aliases, all phrases: `consumer unit`, `primary consumer unit`,
`marital consumption`, `individual consumer`, `the couple as a consumer unit`.

Not one is a bare word, and that is deliberate twice over. `consumer` and `unit`
are both ordinary English and only the pair names the concept — and under gate
option 2a, shipped four commits earlier, a multi-word alias is also a **gate
surface**. This is the first piece of doctrine authored knowing that.

`privatizing function` and `privatizing function of heterosexuality` went onto
the existing `lexicon:term-heteropessimism` rather than becoming a second
concept. The claim that heteropessimism reinforces the privatizing function of
heterosexuality is a claim *about heteropessimism*; it belongs on the entry that
already exists.

## What it rescues

All three previously unrescued claims, and each of them twice over — through the
gate, and then to a concept:

```
gate: uncertain/named-canon-concept   ->  lexicon:term-the-consumer-unit  0.672
      "If the couple was the primary consumer unit of the past, today this has
       collapsed, or more accurately been replaced by a new dyad..."

gate: uncertain/named-canon-concept   ->  lexicon:term-the-consumer-unit  0.540
      "Quite often framed as an anti-capitalist position, heteropessimism could
       be read as a refusal of the good life of marital consumption..."

gate: uncertain/named-canon-concept   ->  lexicon:term-heteropessimism    0.610
      "In this sense, heteropessimism actually reinforces the privatizing
       function of heterosexuality..."
```

Every one is admitted by `named-canon-concept` — 2a — and would have been binned
without it. This is the coupling Jason ruled live, working in the direction it
was ruled for: **authoring doctrine widened the gate and filled the concept in
the same commit.**

## What the live coupling cost on the benchmark: nothing

This is the first canon change under the rule that canon authoring may move the
domain benchmark's thresholds. Seven new multi-word aliases entered gate scope.

```
domainRecall     1.000   unchanged
ignorePrecision  1.000   unchanged
junkRecall       0.844   unchanged
```

The coupling is a real risk and it did not fire here. One observation is not a
pattern; the value of the rule is that the next one is measured too.

## Threshold adjudication — 5 credible crossings, all gains

Sheet: [`lab-consumer-unit-threshold-adjudication.md`](lab-consumer-unit-threshold-adjudication.md).
Swept population 2,398 → 2,401 passages. Rulings 4,394 → 5,033, PENDING 4,880
(4,403 candidateScoreFloor · 472 minWeakScore · **5 minCredibleScore**).

| pair | before | after | recommended |
|---|---|---|---|
| `the-consumer-unit` · 04-heteropessimism · 20 | 0.000 | 0.672 | **ACCEPT** |
| `heteropessimism` · 04-heteropessimism · 26 | 0.000 | 0.610 | **ACCEPT** |
| `the-consumer-unit` · 04-heteropessimism · 19 | 0.000 | 0.540 | **ACCEPT** |
| `asking-fast-filters…` · 22-finkel · 198 | 0.429 | 0.430 | **ACCEPT** |
| `the-consumer-unit` · 22-finkel · 156 | 0.000 | 0.613 | **REJECT** |

The first three are the entries doing exactly what they were authored to do. The
fourth is +0.001 of IDF drift on an unrelated pair, the same family as
`stat-pay-to-play`, on "Such needs tend to be much more partner specific than
lower altitude needs."

### The fifth is a cost this doctrine bought, and it is stated rather than buried

```
"He also has to be your only romantic partner."   ->  the-consumer-unit  0.613
```

A claim about monogamy expectations matched to an entry about consumption. Blamed:

```
queryCoverage 1.000    canonCoverage 0.033
distinctiveShared  ["romantic"]
```

**One shared token, and queryCoverage of exactly 1.0.** The passage has a single
distinctive token after stopwords, so any entry containing `romantic` covers 100%
of the query. It is the mirror image of the numeral-coincidence defect ruled the
same day: there, four loose tokens and canonCoverage 0.036; here, one token and
queryCoverage 1.0.

Two things keep this from being an argument against the entry:

1. **It does not reach a reader.** `analyzeDocument` returns **zero displayed
   matches** for that passage — the admission guard rejects it even though the
   retrieval score clears 0.43. The sweep measures the retrieval layer and says
   so; the crossing is real there and invisible above it.
2. **It predates this entry.** `M-TBD-37` at 0.610 and `M-TBD-46` at 0.609
   already do the same thing to the same passage. The new entry is the third
   instance of a mechanism that was already there, not the cause of it.

REJECT is still the right recommendation, because the pair belonged below the
line and ACCEPT would record that 0.613 is the right answer for that sentence. A
REJECT here needs no new pin: the admission guard is already the pin, and it
holds.

## Pins moved in the same commit

Per the standing rule that a doctrine merge moves the canon-fixture pins and runs
`test:lab` in one commit:

```
conceptCount              469 -> 470
byCategory.Lexicon         83 -> 84
entries with a misreading 469 -> 470   (dark still 0)
entries with a boundary   463 -> 464
```

`tests/canon-index-fixtures.mjs` also gained a pin for the new term beside the
three cultural-register ones — title, phrase alias, one misreading, one boundary.

## The authoring contract, checked

```
misreading   "Marriage is purely an economic arrangement, so romance and
              attraction are marketing invented to sell households."
             16 words · decisive frame (marriage, romance, attraction) · no negator
             measured: relevant/explicit-relational-outcome, matches its own entry
             at 0.772 with stance CONTRADICTS
boundary     "This describes consumption incentives around coupling, and says
              nothing about how much any individual wants a partner."
```

13 test files at fail 0. 3 audits pass at v=2.6.7.


---

# doctrine-transaction-layer-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-transaction-layer-01.md`

# Doctrine invention — The Transaction Layer (batch 01)

**Date:** 2026-07-30 · **Lane:** Claude (Fable 5, high effort), main loop, no research subagents
**Target surface:** `frameworks.html` (Rules & Frameworks), plus one structural edit to the
Conversion Ladder graphic.
**Status:** authored and shipped in this session. Lab hookup (retrieval vocabulary beyond the
overlay, lexicon terms, benchmark appends) is a deliberately separate pass — see §6.

---

## 1. The structural finding this batch acts on

The site is a **valuation engine with no transaction layer.**

Every framework currently on the page answers one question in two forms: *what is this person
worth*, and *who does that worth match*. SMV, the Five Levers, the Hierarchy, the Matching Curve,
the Attention Market, the Option Pool, the Charm Ceiling, the Status Trade, the Parity Rule, the
gates — all of it is valuation and sorting. The Retention group added an outcome layer above
Kept, which was the previous batch's finding.

What has never been modelled is everything a market participant faces *once value is known*:

| Missing question | Who asks it | Site coverage before this batch |
| --- | --- | --- |
| What does participating cost me? | everyone in the market | none |
| How do I know any of this is true? | everyone reading a profile | none |
| Who else gets a vote? | anyone with a family | none |
| Where does the exit go? | anyone whose relationship ended | one chart, no framework |
| How wrong is my own number? | every user of every instrument here | none |

These are not five unrelated gaps. They are one gap with five faces: **the site prices the goods
and never prices the transaction.** That is the thesis this batch ships.

Each is also a discourse family the Lab currently cannot map — verified by grep against the live
pages, not against Lab verdicts (per the standing discipline from Harvest #1):

- `signal(ing)? theory|costly signal|handicap principle|catfish` → **zero hits site-wide**
- `family approval|friends? approv|social network` → matchmaker prose only, no doctrine
- `search cost|opportunity cost|burnout|fatigue` → one Lexicon clause, one unrelated Good-News row
- `overestimat|self-rated|calibrat` → "calibration" on this site has only ever meant *social*
  calibration (reading signals, escalation speed). Rating accuracy: zero.
- exit/re-entry → `#stat-divorce` exists and is good; no framework consumes it

## 2. The six entries

Numbering below is the shipped TOC numbering.

### 2 · The Calibration Error — *Orientation*

Every number on this site is an estimate of an estimate. Self-rated physical attractiveness
correlates with observer ratings at **r ≈ 0.24** (Feingold 1992 meta-analysis, *Psychological
Bulletin* 111(2)) — close to orthogonal. The error is also **not random**: Greitemeyer (2020,
*Scand. J. Psychol.*, six experiments, N = 1,180) found unattractive participants considerably
overestimated themselves against stranger ratings, while attractive participants were accurate
or slightly *under*-rated themselves.

Two consequences, and the second is the reason this sits in Orientation rather than in a corner:

1. **It fences the site's own instruments.** Every calculator here takes a self-report or an
   eyeball rating as input. The Matching Curve's conditional SD is ≈ 0.9; the *input* error is
   plausibly of the same order. Arguments about half a point are arguments about noise. This is
   the C3 defect from Checkpoint 01 — the site states its nulls and never applies them to its own
   tools — closed on the doctrine side.
2. **It re-aims a discourse claim.** "She thinks she's a 9" is aimed at women. The measured
   pattern is that the *bottom of the distribution* miscalibrates upward, in both sexes, and the
   top slightly under-rates. Directionally right that a gap exists; wrong about who carries it.

### 15 · The Search Cost — *The transaction layer*

Participation has a running cost — time, money, attention, and rejection dosage — and that cost,
not a revaluation of anyone, is what usually ends a search. **People rarely lower their standards
because they changed their mind. They lower them because the budget ran out.**

The load-bearing theoretical result: Burdett & Coles (1997, *QJE* 112(1):141–168) show that in a
market with search frictions and **no preference for similarity whatsoever**, agents endogenously
partition into discrete classes, each accepting only its own band — because waiting for better
costs more than accepting now. This is deflationary about LE's own Matching Curve in a way worth
saying out loud: **the curve does not require anyone to prefer their own level. Search cost alone
produces it.** A moral story ("people settle for their tier") is replaced by an economic one.

Cost evidence: Pew 2020 (n = 4,860, fielded Oct 2019) — past-year users left feeling *frustrated*
(45%) far more than *hopeful* (28%). Pew 2023 (n = 6,034) — 46% report a negative overall
experience; harassment and scam load (38% unsolicited explicit content, 52% suspected scammers)
is a real cost borne unequally.

### 16 · The Signal Cost Rule — *The transaction layer*

**A trait claim carries information in proportion to what it costs to fake.** Spence (1973)
job-market signaling — a signal separates types only when its cost is inversely related to
quality; Zahavi (1975) is the biological form.

Measurement: Toma, Hancock & Ellison (2008, *PSPB*) established ground truth for 80 daters'
height, weight and age. ~80% misstated at least one; men skewed height, women weight; those
farther from the mean lied more; photographs were the most embellished element and relationship
status the most honest; deviations were **small and intentional** (self-rated accuracy tracked
observed accuracy). The finding is ubiquitous minor inflation, *not* widespread fabrication —
which cuts against the catfish panic as hard as it cuts against naive trust.

The LE synthesis, two moves:

- **Cheap signals inflate to the ceiling and stop carrying information.** When everyone can add
  two inches, two inches means nothing and the market re-anchors on the inflated ceiling.
- **Moving courtship online transferred the verification cost rather than removing it.** It used
  to be paid by a community that knew you and whose knowledge was expensive to fake. It is now
  paid by one person with twenty minutes and a coffee. That names what the Interaction Gate
  actually is: not merely where chemistry is tested, but the market's *only remaining
  verification instrument* — and it explains why the Face and Body calculators exist.

### 17 · The Third-Party Layer — *The transaction layer*

Pairing is not dyadic. Networks supply introduction, information, approval, veto, and enforcement.

- Sprecher & Felmlee (1992, *JMF*), three-wave longitudinal: network support predicts survival and
  satisfaction, with the woman's network the stronger predictor.
- Sinclair, Hood & Wright (2014, *Social Psychology* 45(3), N = 396 over 3–4 months) attempted the
  **Romeo and Juliet effect** (Driscoll, Davis & Lipetz 1972 — parental interference *increases*
  love) and failed to find it. Higher interference and lower approval predicted *poorer* quality
  on every measure. The famous counterintuitive result died; the boring one held. That is a
  house-standard honesty beat and it is the entry's centrepiece.

The synthesis connects three existing site assets that currently do not talk to each other:
`#stat-couples-meet` (the collapse of meeting through friends), `dd-third-spaces` (the decline of
the venues), and the Signal Cost Rule. What was lost when courtship left the network was **not
romance — it was verification and enforcement**. Meeting through friends means someone with
reputational skin vouched for you: an expensive signal. An app means nobody did.

### 26 · The Sixth Rung — Ended — *Exit & re-entry* (+ ladder edit)

The Conversion Ladder has always had a sixth state and the site stopped at five. Every
relationship ends — by separation or by death — and the exit has its own drivers, asymmetries,
and a re-entry cost the formation-side model never prices.

1. **Exit is institution-specific, not trait-specific.** Rosenfeld (HCMST): women wanted ~69% of
   divorces, but non-marital breakups ran near 50/50. "Women leave" is really "*wives* leave."
   The site already charts this at `#stat-divorce`; no framework consumed it until now.
2. **Re-entry is not a return to the market you left.** The cohort thinned (the people who paired
   are gone), constraints grew (children, geography, career lock-in, time), and reference prices
   went stale — you re-enter pricing yourself against a market that no longer exists. Applies to
   both sexes; the discourse only ever applies it to women. Graded Lens.
3. **Exit is a rung, so it diagnoses like one.** Someone who repeatedly reaches Kept and then
   Ended has a different problem from someone who never reaches Chosen, and the fixes do not
   transfer.

Boundary carried on the page: **Ended is not a failure state.** Base rate is 100% over a long
enough horizon. The rung records where a relationship stopped, not whether it was worth having.

**Design decision on the graphic:** the sixth stage is styled as a *terminal* cell, visually
distinct from rungs 1–5, and its numeral is a dot rather than a "6". Rendering it as a sixth
equal box would assert "climb to Ended," which is wrong — the first five are achievements, this
is a state.

### 27 · The Substitution Layer — *Exit & re-entry*

Exit from the market is not exit to nothing. It is a switch to substitute goods — gaming, porn,
parasocial media, AI companions — delivering a fraction of the reward at a fraction of the cost
with near-zero rejection risk. **Substitutes are what make withdrawal durable**: a strike with no
alternative ends when hunger wins; a strike with a cheap substitute can run indefinitely.

This closes a hole the site left open in its own text: `#mens-strike` says male withdrawal "can be
waited out or substituted around" and then names no substitute.

Evidence: Aguiar, Bils, Charles & Hurst (*JPE* 2021 / NBER w23552) — young men's video-gaming time
rose ~99 hours/year from 2004–2015 (+50%), and recreational computing behaves as a **leisure
luxury** specifically for young men, not for young women or older men. Their instrumented result
is for *labour supply*, not dating; the dating analogue is LE's inference and is graded Lens.

**The caveat ships in the entry body, not the footnote:** direction is unmeasured. Substitution
and complementarity are observationally identical in cross-section — the man who games because
dating failed and the man who stopped dating because gaming is better generate the same time-use
row. Nobody has separated them. AI companions specifically remain a thin single-survey base and
are recorded as a watch item, not a finding (Checkpoint 01 C2, promoted only this far).

## 3. Expansions to existing entries

| Entry | Change |
| --- | --- |
| Conversion Ladder | sixth terminal stage added to the graphic; "Where the site maps" and the closing rule extended to Ended |
| The Men's Strike | the unnamed substitute is now named and linked |
| The Interaction Gate | re-described as the market's verification instrument, linked to Signal Cost |
| The Matching Curve | the frictions-alone alternative explanation linked in |
| The Spiderman Effect | recalibration jam now also linked to Calibration Error |

## 4. Authoring contract compliance

Every new entry ships with a `commonMisreading` and a `boundaryCondition` in
`data/canon-overlay.json`, per `md/lab-overlay-tranche3.md`. Each misreading was authored against
the three measured rules — decisive frame present, no `MISREADING_DENIAL_CUES` negator, 10–18
words — because a misreading that fails those rules does not merely miss, it flips the entry to
**Supports** the thing it exists to reject.

Fixture pins moved in the same commit as the doctrine, per the standing rule: canon
`conceptCount` 470 → 476, `Rules & Frameworks` 29 → 35, misreading count 470 → 476,
boundary count 464 → 470.

## 5. What this batch deliberately does not claim

- Burdett & Coles is a **sufficiency proof, not a measurement**: search frictions *can* generate
  class partitions, which does not establish that they are what generates LE's Matching Curve.
  Both stories remain live and the entry says so.
- The re-entry discount has no instrumented source. It is stated as a Lens and is the weakest
  item shipped.
- The AI-companion substitution claim is **not** promoted to doctrine. Only the substitution
  *mechanism* is, and its instrumented leg is a labour-supply result.
- Network approval is correlational; approval may be an effect of relationship quality rather
  than a cause. Stated in the entry.

## 6. Measured Lab effect of the merge

Sheet: `md/lab-doctrine-transaction-layer-threshold-adjudication.md`, generated from a
baseline reconstructed by restoring the pre-merge canon (2401 passages × 470 entries,
canon `1.0.0+6cf046c1e769`) and re-sweeping. **`--neighbors` was regenerated before that
baseline was captured**, which per the standing warning silently re-pins scores and
absorbs crossings; the reconstruction is the recovery, and the sheet is the record.

```
canon      1.0.0+6cf046c1e769 -> 1.0.0+aa6cd85db4e5  (doctrine moved)
population 2401 -> 2515 retained passages   (+114)
changed    86901 pairs   42339 down / 44562 up
candidateScoreFloor 0.08   5575 gain / 183 loss
minWeakScore        0.25    604 gain / 122 loss
minCredibleScore    0.43    153 gain /   3 loss
```

**The gate widened by 114 passages** because the shipped gate consumes canon surfaces
(v2.6.6, option 2a) — new doctrine vocabulary rescues passages the gate previously set
aside. This is the batch's most direct Lab capability gain and it was not designed for.

**The 153 credible-line gains are concentrated where the gap was.** The archived
AI-companion sources (`13-wheatley-counterfeit-connections`, `14-common-sense-ai-companions`)
previously scored **zero** against the whole canon — the Checkpoint-01 C2 finding, still
true at 470 concepts. They now land on `frameworks:substitution-layer` at 0.540–0.547.

**Triage of the 3 credible-line losses** (all IDF dilution ≤ 0.03, none a doctrine
conflict). Rulings are Jason's; this is the reading, not a verdict:

| Passage | Lost pair | Still credible elsewhere? |
| --- | --- | --- |
| `seg-00090` Conroy-Beam | M-TBD-56 0.438 → 0.415 | **Yes** — holds 0.575 on `replaceability-asymmetry`, its correct primary home, unmoved. Immaterial. |
| `seg-00037` Pew under-30 | GD *Gen Z has it even worse* 0.435 → 0.405 | **Yes** — holds 0.430 on M-TBD-59, though now sitting on the line. |
| `seg-00036` Pew 42%-easier | `stat-app-reasons` 0.437 → 0.411 | **No** — this passage loses its only credible match. The one materially adverse crossing in the batch. Note `frameworks:search-cost` is its new second-ranked entry at 0.356: thematically the right home (the passage is about whether apps made searching easier), just not yet strong enough to take it. |

## 7. Cold review and corrections (2026-07-31)

A cold review returned "changes are warranted" with eight findings. Seven were sustained and
applied; one was checked against the source and **rejected**. The corrections are edits to
claims, not additional tags — a Lens label cannot repair an invalid inference.

| # | Finding | Call | Correction applied |
| --- | --- | --- | --- |
| 1 | Substitution's causal refusal not honoured — "make withdrawal durable", "explain duration" | **Sustained** | Duration is itself an unmeasured dating outcome. Entry now claims only that the layer exists, has describable economics, and has an adjacent studied analogue. The verdict callout names the earlier over-claim. |
| 1b | "Instrumented economics" is wrong | **Sustained — verified verbatim** | The paper: *"since broadband had saturated the country … that leaves no regional or time-series variation to use as an instrument."* Split the tier: Tier 1 descriptive trend, Tier 2 model-based attribution. |
| 1c | "Not for young women or older men" too categorical | **REJECTED** | The paper's own words: *"distinctively a leisure luxury for younger men, but not for other demographic groups"*, plus no effect on older men's labour supply and only a small effect on younger women's. Kept, and now attributed to the authors explicitly. |
| 2 | Burdett–Coles overstated; falsifier reversed | **Sustained, both parts** | The model still needs a shared vertical ranking and *mutual* acceptance, so it formalises "who wants you back" rather than retiring it, and yields discrete classes rather than the site's smooth r ≈ 0.4 curve. The comparative static is corrected: cheaper waiting makes people **pickier** and the partition **finer**. Also separated BC's stationary reservation standard from this entry's depleting-budget story. |
| 3 | Calibration converts a correlation into an error bar | **Sustained** | The ±1-point band and the comparison against SD ≈ 0.9 are **removed**, not re-tagged. Also fixed the conditional inversion: Greitemeyer grouped by *stranger-rated* looks, which does not license a claim about people who self-report a low score. |
| 4 | Toma over-attribution | **Sustained** | Only height, weight and age were ground-truthed; the photograph/relationship-status ordering is daters rating their own accuracy. "They knew" reduced to the authors' inference from a correlation. |
| 5 | Signal Cost states a broader theorem than Spence | **Sustained** | Restated: separation requires a cost that **differs across sender types**. The proportional-to-faking-cost rule is now labelled the site's heuristic in the lead, with two named failure modes. "Only remaining verification event" → "primary". |
| 6 | "Net-negative sentiment" contradicted by the same surveys | **Sustained** | It contradicted the row directly beneath it. Now carries both readings — 57/42 positive in 2020, 53/46 in 2023, against frustrated 45% vs hopeful 28% — and says the interesting fact is that both hold. The n values are labelled total-survey samples, not item bases. |
| 7 | Sixth Rung turns association into causal exclusion | **Sustained** | "Kills the trait explanation outright" → strains it without excluding it; selection into marriage is not random and the source leaves the mechanism open. Re-entry components rewritten as explicitly unmeasured hypotheses. |
| 8 | Third-Party hardens correlational evidence | **Sustained** | "Opposition corrodes bonds" → the forbidden-love premium has no evidential support left, which is the smaller claim the evidence carries. |
| — | Ladder `aria-label` omits Ended | **Sustained** | Fixed. |

The review also found no link-target infidelity in the five cross-cites and no hedged mush;
its diagnosis that the failure mode was *hardening tendencies into laws* was correct, and the
corrections above are calibration rather than softening — the register is unchanged.

## 7b. What the corrections cost at the retrieval layer

Sheet: `md/lab-transaction-layer-review-threshold-adjudication.md`, generated from a baseline
captured **before** the corrections this time, per the lesson in §6.

```
canon      1.0.0+aa6cd85db4e5 -> 1.0.0+36e59ca91dda   (prose only; 476 entries both sides)
population 2515 retained passages, unchanged
changed    32638 pairs   19437 down / 13201 up
minCredibleScore  0.43   3 gain / 4 loss
```

Rewording moves retrieval as surely as adding entries does — no entry was added or removed and
32,638 pairs still changed score. The `tests/lab-analyzer.test.mjs` Availability pin drifted
0.538 → 0.537 for the same reason, and its comment history now records that this pin moves on
rewrites and not only on growth.

**The false positive the fix bought, recorded rather than tuned away.** Two of the three
credible-line gains are `frameworks:calibration-error` picking up passages about attractiveness
as a *mate preference* — Li's necessities/luxuries item list (0.288 → 0.451) and Zhang's
"men did not value physical attractiveness more than kindness" (0.327 → 0.452). Neither passage
is about rating *accuracy*, which is what the entry claims. They match because the corrected
boundary condition introduced the phrase "physical attractiveness" to an entry that previously
carried only "self-rated"/"observer-rated" forms. The page was **not** reworded to game the
matcher; the boundary is correct prose and stays. Logged for adjudication.

The third gain is defensible: `frameworks:sixth-rung` on Finkel's suffocation-of-marriage title
(0.337 → 0.474), which the corrected text earned by adding the selection-into-marriage
discussion. Of the four losses, three are ≤ 0.032 drift and one is −0.001 (`sixth-rung` on a
Wheatley passage, 0.430 → 0.429) — a pair that was resting on the line.

## 8. Follow-up: the Lab pass (separate, not done here)

1. **Lexicon terms** for the six new concepts — the Lexicon is the retrieval spine and six new
   frameworks with no glossary rows are under-reachable. Moves Lexicon counts and pins.
2. **Gate vocabulary check.** Three families in this batch use vocabulary the domain gate has
   never been tested against: signaling/verification (`costly signal`, `catfish`, `verification`),
   search economics (`search cost`, `reservation value`, `frictions`), and substitution
   (`substitute good`, `parasocial`, `leisure luxury`). Expect set-asides; if the miss family is
   systematic, that is a benchmark-append proposal under governance, not a quiet classifier change.
3. **Threshold sweep.** Six new entries with fresh alias mass will move neighbour scores on
   existing entries. Run the sweep and adjudicate crossings before trusting any new mapping.
4. **Corpus re-run** of the three Checkpoint-01 sources against the widened canon. C1c
   (desire decay) and C2 (substitution) should now find homes; if they still return zero, the
   deficit is retrieval vocabulary, not doctrine.


---

# doctrine-population-flow-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-population-flow-01.md`

# Doctrine invention — The Population Layer (batch 02)

**Date:** 2026-07-31 · **Lane:** Claude (Fable 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (31–33)
**Status:** SHIPPED. Concept was written before implementation deliberately, because a second
session is inventing doctrine on the same page at the same time. Two of the three entries were
**inverted by their own evidence** and ship as corrections of the folk model rather than
endorsements of it — that is the batch's main result, not an accident of it.

**Shipped as:** TOC group "The population layer", entries 28–30 (`#stock-flow-error`,
`#residual-pool`, `#clearing-order`); Tested claims renumbered 28–30 → 31–33. Canon 476 → 479,
Rules & Frameworks 35 → 38. `npm run test:lab` green end to end including all three Python audits.

---

## 0. Collision control (read this first if you are the other session)

A concurrent session is running in this same working tree with a near-identical prompt
("invent doctrine, primarily in rules and frameworks"). This document **stakes** the following
and nothing else:

- **New TOC group:** "The population layer"
- **Entry ids:** `#residual-pool`, `#clearing-order`, `#stock-flow-error`
- **Thesis:** the site models the market as a *standing population*; it is a *flow*.

Deliberately **not** taken here, and left free for the other session — these were the two other
live candidates and both are hereby released:

- **The sex ratio / the local market.** Asserted once on `smvlevers.html` (the Market multiplier,
  Guttentag & Secord, tagged Mixed) and modelled nowhere. A prior run already scouted it
  ("Scout S-G · Guttentag & Secord mechanism half + campus sex-ratio evidence"), and the
  close-out sweep recorded G&S as *never reached* — so it has both a known gap and pending
  research. Highest-value item on the board that this batch does not touch.
- **The Saturation Rule (Red Queen / advice decay).** No framework models what happens to a tactic
  as it diffuses: advice that works is advice that has not saturated yet. It fences the site's own
  advice the way the Calibration Error fences the site's own instruments. Evidence base is thin
  (signalling equilibrium, Goodhart), so it would ship Lens-heavy.

## 1. The structural finding this batch acts on

**Every framework on the site samples from a pool it treats as static.**

The valuation layer asks what a person is worth. The transaction layer (batch 01) asks what
participating costs. Both take *the market* as a given backdrop — an urn of candidates you draw
from, whose contents do not change while you are drawing.

The pool is not an urn. It is a **flow with an entry gate, an exit gate, and a return gate**, and
its composition changes over time for reasons that have nothing to do with any individual in it.
Nothing on this site models that, and the omission produces three distinct errors — one about the
pool, one about time, one about how the whole discourse reads its own statistics.

Verified against the live pages, not against Lab verdicts (standing discipline, Harvest #1):

| Vocabulary grepped site-wide | Hits |
| --- | --- |
| `adverse selection\|lemons\|Akerlof\|residual pool\|leftover` | **zero** (one unrelated matchmaker prose hit) |
| `stock\|flow\|period measure\|cohort measure` | **zero** in a statistical sense |
| `50% of marriages\|half of all marriages` | **zero** — the site has never addressed the most-repeated statistic in the subject |
| `cross-section` | **two prose applications, never named** — see below |

**Correction to my own gap claim, recorded rather than quietly dropped.** The first pass of this
grep reported zero coverage for the reasoning error in entry 33. That was wrong. The site already
makes the argument twice, locally and well: `dd-what-the-wall-actually-is.html` sinks the
married-versus-single happiness comparisons on the grounds that they are cross-sectional and
selection-driven, and `statistics.html#body-count` takes the same selection problem apart. So the
honest statement of the gap is **not** "the site has never made this argument" but "**the site makes
this argument ad hoc, in prose, in two places, and has never named it or generalised it into a rule
it applies to itself.**" That is the same shape as the Third-Party Layer in batch 01, which named
what three existing assets were separately gesturing at.

It also sharpens entry 33, because those two instances are a *different* error from the one the
entry is about, and the entry must separate them: **selection bias is about who is in the picture;
the stock–flow error is about what a picture of one moment can tell you about a life.** They co-occur
constantly and are not the same mistake.

Two existing site assets are **unconsumed inputs** to this batch — the same shape as `#stat-divorce`
before the Sixth Rung consumed it:

- `statistics.html#stat-never-married` — 6% (1980) → 25% (2021) never-married at 40, plus the
  age-flip (young surplus of single men becomes an old surplus of single women). That flip is a
  **pure composition effect stated on the site with no framework naming the mechanism.**
- `statistics.html#stat-why-single` — 47% bigger priorities / 44% like being single, and the
  involuntary-singlehood tell (men 26% vs women 12% on "no one would be interested in me").

## 2. The three entries

### 31 · The Residual Pool — *The population layer*

**The single population at 40 is not the single population at 25, ten years older. It is the
residue left after everyone who paired off has been removed.**

The average of a pool can fall while every single person in it improves, because the pool is
losing members non-randomly. That is a composition effect, and it is the mechanism behind an
observation the discourse makes constantly and explains wrongly ("everyone left is damaged").

Three moves the entry makes:

1. **The mechanism is Akerlof's, not a moral one.** Non-random exit degrades the average of what
   remains. No individual has to change for the pool to get worse.
2. **The reflexive sting.** If you are drawing from the residual pool, you are *in* the residual
   pool, and you were left for the same structural reason. The framing is symmetric and the
   discourse only ever aims it outward, at women.
3. **The honest limit, which is what keeps this from becoming a blackpill.** "Selected for
   something" is not "selected for defect." The measured reasons people are still single at 40 run
   heavily benign, and the site's own `#stat-why-single` says so. The composition effect is real;
   the "damaged goods" reading is an unlicensed inference from it, and the entry says that in the
   body, not the footnote.

**Boundary condition:** the pool also *refills*, and not with the same people who left it —
re-entrants arrive with different properties (see the Sixth Rung). Thinning and refilling are
different mechanisms and the entry must not merge them.

> **REVISED after S-1 (2026-07-31). The strong version of this entry does not survive, and the
> entry is better for it.** See §4.1 for the evidence. Short form: the composition mechanism is
> real and formally established in economics, and has been demonstrated once in an actual marriage
> market by a randomised trial — but the US "everyone left is damaged" reading fails on three
> independent counts, one of which is *already house doctrine on this site*. The entry now ships as
> a **correction** of the folk model: the pool is genuinely non-random, and almost none of what the
> discourse infers from that is licensed. The verdict grade is **Confounded** — a real, measured
> correlation (unpartnered adults do differ on employment, earnings and health) with an invented
> cause ("the good ones got taken").

### 32 · The Clearing Order — *The population layer*

**Time in the market is not neutral, because the pool is being drained in an order.**

If exit is even loosely ordered by matchability, then a participant's realistic option set degrades
with time for reasons independent of their own aging — and this is a *separate* mechanism from
The Wall, which is about the participant. This entry is where the batch is most at risk, and the
scout brief was written to try to kill it: US early marriage is **negatively** selected on
education and income, which cuts hard against a naive "the best leave first" story.

Live possibility, to be decided by the evidence: the honest version of this entry may be that the
market clears in *several* orders at once — early on socioeconomic lines that run opposite to
desirability, later on desirability — in which case the entry ships as a correction of the folk
model rather than an endorsement of it. **That would be the better entry.** A framework that says
"this popular intuition has the sign backwards for the first decade" is worth more than one that
confirms it.

### 33 · The Stock–Flow Error — *Orientation*

**Almost every famous statistic in this subject is a snapshot being read as a destiny.** The error
has a direction: it makes transient states look permanent.

Three worked examples, chosen because the site can check its own work against them:

1. **"Half of marriages end in divorce."** A period ratio — this year's divorces over this year's
   marriages — comparing two different populations. It is not, and has never been, a lifetime
   probability for anyone.
2. **"A quarter will never marry."** Never-married-*at-40* is a stock. First marriages after 40
   exist. The site cites this figure and must state the gap between the stock and the projection.
3. **"The top 20% of men get 80% of the likes."** A snapshot of attention on one platform read as
   a lifetime distribution of relationships. Bruch & Newman's desirability hierarchy is real and is
   a *network snapshot*, not an outcome ledger.

This sits in **Orientation**, next to the Calibration Error, and for the same reason: it fences the
site's own instruments. `statistics.html` is largely a wall of cross-sectional snapshots. This
entry is the reading instruction for that page, and it obliges the site to accept the discipline it
is imposing on everyone else.

## 3. Why these three are one finding, not three

Each is the same omission seen from a different angle:

| | The question | The error without it |
| --- | --- | --- |
| Residual Pool | who is left? | reading composition as character |
| Clearing Order | when do they leave? | reading the pool's decay as your own |
| Stock–Flow Error | what does a snapshot mean? | reading a state as a fate |

The site prices the participant, then the transaction. This batch prices **the population** — and
the through-line is that a moving population read as a still photograph produces confident,
specific, wrong conclusions.

## 4. Evidence

### 4.1 S-1 returned — and it inverts entry 31

**What survives, and it is strong:**

- **Akerlof (1970), QJE 84(3):488–500** — verified off the primary. The mechanism is one-sided:
  *only the seller knows.* The words "marriage", "mating" and "spouse" appear zero times. Any
  lemons-in-dating claim is LE's extension, and the entry must say so.
- **Angelucci & Bennett (2021), *Review of Economic Studies* 88(5):2119–2148** — an actual RCT in an
  actual marriage market (Malawi, N = 1,505 women, 8 waves/28 months). High-frequency HIV testing
  raised marriage probability **+7.2 pp (+45%)**; among safe *and* attractive respondents,
  **+11 pp (+92%)**. A single test did nothing. This is the strongest evidence anywhere that
  adverse selection can bind in a marriage market — and it needed a hidden, binary,
  cheaply-testable trait to do it. It is the exception that measures the rule.
- **Autor, Dorn & Hanson (2019), *AER: Insights* 1(2):161–178** — instrumented, 722 commuting zones.
  A one-unit trade shock: male-intensive component **−4.2 pp ever-married** among women 18–39
  (t = 6.6, a 12% decline), male employment **−0.64 pp** relative to women with the whole
  differential landing as idleness, and **+69.6 excess male deaths per 100K** aged 20–39 per decade,
  a third of it drugs and alcohol. **This paper is cited nowhere on this site**, which is a
  standalone finding: the best-identified causal result on male marriageability in existence is
  missing from a site with a Men's Strike entry and a Provider Norm chart.
- **Guner, Kulikova & Llull (2018), *European Economic Review* 104:138–166** — the married/unmarried
  health gap is **~100% selection under 40**, and about half (5 pp of 10 pp) at 55–59.

**Why the strong version dies — three counts:**

1. **Exit is not rank-ordered on a shared index.** Eastwick & Hunt (2014, *JPSP* 106(5):728–751):
   among acquaintances of ~3 years, target variance (shared consensus) is **2.1%** against
   relationship variance (dyad-specific) of **50.1%**, and consensus *falls* as people get to know
   each other. A composition effect on "quality" requires a common queue to deplete from. At the
   layer where marriages form, there barely is one. **This is already on this site**, in
   `#bone-pill`, as the evidence that sinks the Bone Pill — so entry 31's central limit is house
   doctrine already, and the entry should cite our own page, not present it as news.
2. **Individuals really are degraded, not merely sorted.** ADH is the cleanest identification in the
   area and it says the unmarried pool grew because a demand shock made men less employable, idler,
   and likelier to die — not because good types left first.
3. **The pool is not a sealed residue.** A quarter of never-married 40-year-olds marry by 60; 22% of
   never-married 40–44s are already cohabiting; and the unpartnered pool mixes never-married with
   divorced and widowed (Pew 2021/2022/2023).

**And the male-side theory predicts the opposite sign.** Bergstrom & Bagnoli (1993, *JPE*
101(1):185–202): high-prospect men *choose to wait* until their success is revealed. The older
single male pool is enriched in high types by their own choice — which is a live counter to both
entry 31 and entry 32 and must be carried in the body.

**The honest claim the site can make**, and the line entry 31 will be built on:

> Both happen. Selection into marriage is large and measured — essentially all of the under-40
> health gap, and a real earnings and employment gradient for men. But exits are only weakly
> ordered on any shared index, causal shocks degrade people in place, and the pool refills from
> divorce. *Composition, not decay* is a real effect over-claimed as an exclusive one.

**Carried as UNVERIFIED, not to be published without a second pass:** the Ginther & Zavodny "at most
10% selection" figure and its pagination; the Pew 28%-men / 22%-women never-married-at-40 split
(secondary coverage only); Lillard & Panis's exact wording. The 2.6 pp / 69.6-deaths / −4.2 pp
figures above were read off the papers themselves and are safe.

### 4.2 S-2 returned — and it kills entry 32 as written, then replaces it with something better

**The claim "the market clears in roughly desirability order" is dead.** Two independent reasons:

1. **No US study relates attractiveness to the *date* of first marriage or first union.** The
   literature measures attractiveness against the *stock* of ever-married (Jokela 2009; Udry &
   Eckland 1984), never the timing. The one clean test of accelerated exit — Karraker, Sicinski &
   Moynihan (2017, *J Gerontol B* 72(1):187–199, Wisconsin Longitudinal Study, N ≈ 4,066, yearbook
   photos rated by 12 judges) — asked whether adolescent attractiveness predicted **remarriage**
   and came back **null**.
2. **On the one axis where the data is excellent, the order is inverted** — at exactly the ages the
   claim needs. Copen et al. (2012), NSFG 2006–2010: probability of first marriage **by age 20** is
   **27% for women with no high-school diploma against 3% for women with a bachelor's** — a ninefold
   gap running backwards. At 25 it is still 53% vs 37%. **The order flips around 30**, and by 40 the
   graduates lead 89% to 77%. First cohabitation is sharper still: by age 20, **51% vs 8%**.
   The earliest exits are disproportionately the *lowest*-SES, which is not a top-of-market signature.

Also fatal to the entry's weakest sentence — "independent of their own aging": the only large
desirability-by-age measurement (Bruch & Newman) shows women's desirability declining monotonically
from 18 and men's peaking near 50. That is own-aging. **No study holds own age constant and varies
time-in-market**, which is what a pool-composition effect would require. Recorded as a genuine gap.

**What replaces it, and it is Tier 1 all the way down:**

- **The clock moved.** First marriages per 1,000 never-married, 2019: women 18–29 **46.3**, 30–39
  **65.2**, 40–49 **30.2**, 50–59 **15.0**. In **1990** the same series ran **86.5 / 59.9 / 17.2 /
  6.2** — monotone decline. **The modern first-marriage hazard peaks in the 30s, not the 20s**, and
  that is a change from 1990, not a constant. (Brown, Lin & Mellencamp 2022, *JMF* 84(4):1220–1233.)
  This lands directly next to `#the-wall`'s "slope, not a cliff" verdict and strengthens it.
- **The pool turns over.** Previously-married (divorced + widowed) as a share of the unmarried pool:
  women **11.8%** at 30–34 → **24.9%** at 35–39 → **37.8%** at 40–44 → **51.4%** at 45–49. Men run
  roughly a decade behind: **26.2%** at 40–44, **49.5%** at 50–54, **56.5%** at 55–59.
  **Independently verified by me** against ACS 2024 1-year table B12002 pulled from the Census
  Reporter API and recomputed from raw counts — every figure reproduced. One correction to the
  scout: **men do not cross the halfway mark until 55–59**, since 50–54 is 49.5%, just under.
  Disclosed on the page as an LE calculation, not as a published statistic.
- **Exogenous male income does not buy earlier exit.** Kearney & Wilson (2018, *ReStat*
  100(4):678–690) used the fracking boom as a shock to non-college male earnings: marital *and*
  nonmarital birth rates rose, **marriage rates did not**. Tier 1 quasi-experiment, and it bites the
  site's own money lever.

**Entry 32 is therefore reframed:** the market *does* clear in an order — just not the assumed one.
For the first decade it runs backwards on SES, the clock has moved a decade later than the folk
model assumes, and what actually changes with age is **turnover, not skimming**. This also upgrades
the Sixth Rung's re-entry claim, which shipped in batch 01 as a Lens with no instrumented source and
can now cite a measured composition curve.

### 4.3 S-3 returned — and it corrects my own thesis statement

I had written that the stock–flow error "makes transient states look permanent." **That is not
reliably true, and shipping it as stated would have been the exact sin the entry exists to name.**
Kennedy & Ruggles (2014, *Demography* 51(2):587–598) is a documented case running the *other* way:
the unstandardized divorce rate looked flat since 1980 while the **age-standardized rate rose 40%**,
because the married population aged out of high-divorce years. The period measure was
*optimistic*. The correct general statement:

> **A snapshot is biased toward whatever state has the longest dwell time.** That yields
> "transient looks permanent" when the transient state is the one being counted — and the reverse
> when composition drifts underneath you.

The three worked examples are also three *different* errors, which is the entry's best structural
move:

| Case | What the error actually is |
| --- | --- |
| "Half of marriages end in divorce" | A ratio of two incidence flows on **non-overlapping denominators** — a malformed statistic, not a biased one — plus a period-vs-cohort leap and a tempo effect |
| "A quarter never marry" | **Right-censoring** of an incomplete cohort read as completed |
| "Top 20% get 80% of likes" | The genuine **prevalence–incidence / length-biased sampling** case: an app snapshot over-samples those who stay in the pool longest, because successful daters exit |

**The strongest single finding in this scout, and it is Mythbuster-grade:** *no primary source
anywhere states "the top 20% of men get 80% of the likes."* The phrase is a Pareto template laid
over two unrelated Tier 3 claims — a 2015 Medium post based on **one fake profile and 27
self-reporting women**, and OkCupid's 2009 blog finding that women rated **80% of men below
median-looking**, which is a *ratings* distribution and not a likes distribution. The same OkCupid
post reported that women's actual *messaging* tracked the men's bell curve far more closely than
their own harsh ratings did. Treat 80/20 as **unsourced**, not merely low-tier.

And Bruch & Newman's real headline is close to the opposite of the doom reading: reaching above
your own rank is **the norm** for both sexes (men +26%, women +23%), and the authors write that
attracting someone out of one's league is entirely possible — it just takes 2–3× more messages.
Exact sample, from the supplement rather than the press release: **186,935 users** across four
metros, one month (January 2014), a single free platform. Tier 2.

**Useful lifetime numbers to replace the 50% with:** the true-cohort NLSY79 figure — among the
ever-married of the 1957–64 birth cohort, followed to 55, **46% had divorced at least once** — and
that cohort married straight through the divorce peak, so it is a ceiling rather than a forecast.
Current-conditions life tables put first-marriage dissolution near **42%** (IFS 2025, Tier 2,
synthetic cohort).

**Carried as UNVERIFIED across S-1/S-3 and excluded from the page:** the Pew men-vs-women split of
never-married-at-40 (I fetched the Pew piece directly — it says only "a higher share of men than
women had never married" and publishes no percentages, so the 28%/22% pair circulating in secondary
coverage does not ship); the Hinge women's Gini (0.324 vs 0.376 across sources); NLSY79 and NSFG
baseline sample sizes; Ginther & Zavodny's "at most 10%".

- **S-1 Composition/adverse selection** — Akerlof provenance; whether any formal marriage-market
  application exists; measured never-married vs ever-married differences by sex; selection-vs-
  protection in the marriage-health literature; and the strongest reason to reject the claim.
- **S-2 Exit order** — first-marriage hazard by age; whether exit order is measurably related to
  desirability; remarriage inflow by age band; and the negative-selection counter-argument
  developed properly, because it may be fatal.
- **S-3 Stock–flow** — Kennedy & Ruggles period-vs-cohort; the never-married projection; the
  provenance of the 80/20 claim; and the correct formal names (period vs cohort measure,
  prevalence vs incidence, length-biased sampling) for each of the three cases, which may differ.

Every entry ships with a `commonMisreading` and `boundaryCondition` in `data/canon-overlay.json`
authored against the three measured rules (decisive frame, no denial-cue negator, 10–18 words),
and fixture pins move in the same commit as the doctrine, per the standing rule.

## 4.4 Lab effects measured while shipping

1. **The canon widening rescued 3 more corpus passages** (2515 → 2518 swept). Same mechanism as
   batch 01's 114: the gate consumes canon surfaces, so a wider canon retains passages it
   previously set aside. **Widening a population is a measurement, not a change** — the band was
   regenerated and the ratchet re-checked, not argued with.
2. **The adjudication gate fired twice and was right both times.** First on the population change,
   then on 358 crossings after an index rebuild left the frozen band keyed to a stale build. Before
   regenerating the second time I verified the index build is **deterministic** (three consecutive
   builds, identical hashes) and that the sweep tool only *reads* the index — otherwise a
   regenerate-rebuild loop would have been possible and I would have been papering over it.
   Final state: **0 credible (blocking) · 516/516 weak · 4622 candidate-floor**, i.e. the weak
   ratchet held exactly where batch 01 left it and nothing new blocks.
3. **One IDF drift pin moved, 0.538 → 0.537** (`lab-analyzer.test.mjs`, the Availability weak
   match). Expected: IDF is computed across the canon, so every entry that adds text moves it. The
   pin's own comment history was extended rather than silently re-pinned — and this step is the
   first that moved *down while the population moved up*, which is worth recording because the
   previous down-step happened at an unchanged population.
4. Fixture pins moved in the same commit as the doctrine, per the standing rule: `conceptCount`
   476 → 479, `Rules & Frameworks` 35 → 38, misreading count 476 → 479, boundary count 470 → 473.

All seven authored misreadings were checked against the three measured rules programmatically
(10–18 words, decisive frame, no `MISREADING_DENIAL_CUES` negator) before the index was built.

## 5. What this batch will not claim

- That the pool's *average* falling means any individual's prospects fall by the same amount. It
  does not follow, and variance matters more than the mean at the point of one match.
- That exit order is desirability order, unless S-2 comes back with evidence that survives the
  negative-selection counter.
- Any lifetime divorce probability stated as a single number without its cohort and its measure.


---

# lab-overlay-tranche3.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-overlay-tranche3.md`

# Overlay tranche 3 — the last 56 dark entries, and the authoring contract that closed them

Tranche 3 landed 2026-07-30 and took `commonMisreadings` coverage from **413 of
469 to 469 of 469**. Every concept in the canon can now disagree with a reader.

The count started at **100 of 463** before tranche 1. The three tranches plus the
cultural-register doctrine merge closed the rest:

| pass | entries given a misreading | coverage after |
|---|---|---|
| tranche 1 (`0ba89e5`) | 73 | 173 of 463 |
| tranche 2 (`687f90d`) | 234 | 407 of 463 |
| doctrine merge (`4b7b1a9`) | 6 new entries, authored with one | 413 of 469 |
| **tranche 3** | **56** | **469 of 469** |

What tranche 3 covered: Lexicon 32, Mythbuster 10, Five Levers 7,
Rules & Frameworks 5, Pill Dossiers 1, Instruments 1.

Twelve of the 56 already carried a hand-authored `boundaryCondition` and took the
misreading alone, per the rule tranche 2 established: a second boundary on the
same entry only adds retrieval mass. Boundaries therefore sit at 463 of 469, and
that lag is deliberate rather than a backlog.

## The contract, in the form that survived three tranches

A `commonMisreading` has to state the WRONG reading assertively enough that the
analyzer's stance logic files it as **Contradicts** when a reader's passage
resembles it. That means it has to clear the domain gate on its own, which is
where most first drafts die.

1. **A decisive frame, not a relational noun.** Naming a person or a relationship
   is not enough. One of:
   - `dating`, `courtship`, `romance`, `romantic`, `flirt*`
   - `marriage`, `marry`, `wedding`
   - a sex noun within 70 characters of
     `prefer|want|choose|select|desire|attract|reject|date|marry`
   - two of the five ladder stages (attention/exposure, attraction/desire/
     chemistry, selection, compatibility, retention/relationship stability)
2. **No negators.** `MISREADING_DENIAL_CUES` is wider than the obvious list and
   includes `wrong`, `rarely`, `hardly`, `nonsense`, `myth`, `mistaken`. A negator
   flips the stance to **Supports**, which is worse than not matching: the entry
   ends up agreeing with the misreading it exists to reject.
3. **10 to 18 words.**
4. **One misreading and one boundary per entry.**
5. **No artifact meta-language** — `claim`, `card`, `essay`, `page`, `section`,
   `entry`, `hub`. See `tests/lab-match-behavior.test.mjs` for the measured reason
   and for why the ENGINE was not changed to compensate.
6. **Do not hand an entry its own synopsis back.** More than four shared
   five-letter-plus words and the guard in the apply script stops the run: heavy
   reuse pushes borderline non-matches over the line.

## The morphology trap, which cost the most time across all three tranches

The decisive-frame patterns are literal-ish. These do NOT match:

| written | pattern | matches? |
|---|---|---|
| `marries` | `marry\w*` | **no** |
| `married` | `marry\w*` | **no** |
| `chosen` | `choose\w*` | **no** |
| `dates` | `dating` | **no** |

Tranche 2 lost three misreadings to `married`. Tranche 3 lost one to `marries`,
one to `chosen` and one to `dates` — after the trap was already written down in
the project's memory, by an author who had read it. Write the exact inflection the
pattern lists (`will marry`, `dating`) rather than the one the sentence wants.

## How it was verified

Ten of 56 failed the first pass, all for contract reasons rather than content
ones: six had no decisive frame, two carried a negator, two hit the morphology
trap. Three more were caught by the synopsis-reuse guard on the apply run.

```
check.mjs t3-mis.json     each misreading in isolation, one at a time
apply-t3.py               merge, lint, and refuse on any contract violation
verify-live.mjs           all 56 live in the built index, plus a false-positive
                          sweep over every expected-ignore benchmark case
```

Final: **56/56 Contradicts** with the whole tranche live, **0 false positives**
across all 96 expected-ignore cases.

## What it cost

Measured against the pre-tranche baseline over the swept corpus (117 passages —
note that the sweep covers 3 of the 21 archived sources, see `ca6dab2`):

```
changed              11997   9568 down / 2429 up
candidateScoreFloor  471 gain / 27 loss
minWeakScore          29 gain / 27 loss
minCredibleScore       0 gain /  1 loss
```

Most scores went DOWN, and that is the expected shape: tranche 3 added 56
misreadings and 44 boundaries without adding a single entry, so IDF denominators
rose across the canon while the population stayed at 469. Per-entry dilution is
the price of a match surface, and it was measured at ~0.009 per boundary in
tranche 1.

The single credible-line loss is `statistics:stat-pay-to-play` at **0.430 →
0.429**, on a Pew passage defining who counts as a current online-dating user.

> **Corrected 2026-07-30.** This paragraph originally said the pair had moved
> +0.001 in the doctrine merge, been ruled ACCEPT, and moved back — "a pair
> sitting exactly on a line and oscillating with every canon change". That is
> wrong, and the correction matters because it changes the verdict. There are
> **three different Pew passages** mapping to this one entry, all within a
> thousandth of 0.43, and each carries its own ruling key. Nothing was re-ruled:
> the merge skips any key already answered (`if (rulings[key]) continue;`), so a
> ruled pair can never re-enter PENDING.
>
> ```
> 0.432  seg-00025  REJECT   "Tinder is the top online dating platform among users under 50."
> 0.431  seg-00030  ACCEPT   "Around six-in-ten paid users (58%) say ... positive ..."
> 0.429  seg-00013  ACCEPT   "Current or recent online dating users refers to the 9% ..."
> ```
>
> Ruled by Jason on 2026-07-30. The loss recorded here — `seg-00013` — is a
> survey **definition** sentence about who counts as a user; it says nothing
> about paying and never belonged above the credible line, so the loss is the
> engine getting it right. `seg-00025` went the other way: it had been ACCEPTed
> on 2026-07-29 and was reopened and REJECTed, because a claim about platform
> share is not a claim about who pays. See
> [`lab-numeral-coincidence.md`](lab-numeral-coincidence.md).

Sheet: `md/lab-overlay-tranche3-threshold-adjudication.md`.

## What is now pinned

`tests/canon-index-fixtures.mjs` asserts **zero** dark entries, per category and
in total. Stated as zero rather than as a count that happens to match, so a new
entry authored without a misreading fails the suite rather than quietly re-opening
the gap. The per-category loop iterates every category rather than the four
tranche 2 covered.


---

# lab-slang-alias-typing.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-slang-alias-typing.md`

# cope, simp, 4B, PSL: four words, four answers, and a grammar that decided two of them

2026-07-30. `md/lab-constants-audit.md` found `minSingleAliasLength` silencing
twelve untyped single-word aliases with only four ever ruled on, and handed the
remaining eight to the alias lane. Jason asked for four of them to be typed.

**Two were typed. Two were not, and the two that were not are reached anyway by a
route that measures better than typing does.** All four Lexicon terms are now
reachable from their own vocabulary, which was the ask.

---

## Why the archive could not answer this

The first measurement was a census of the four bare words across all 21 archived
sources:

```
units 6,504 · retained by the gate 2,507

"cope"   2 occurrences, 0 in a RETAINED passage
"simp"   0 — absent from the archive entirely
"4b"     0 — absent
"psl"    0 — absent

and the surfaces on those same entries that ALREADY fire:
"simping" 0 · "simp economy" 0 · "4B movement" 0 · "PSL scale" 0 · "coping" 0
```

The archive is academic and journalistic prose; these are forum terms. It can
measure neither the gain nor the cost, which is the same lesson
`md/lab-constants-audit.md` recorded about `shortUnitWordCount` and the context
boosts: **some constants and some vocabulary have no population here.**

So the instrument is authored probes — which `md/RERUN.md` §1 requires for this
register regardless, since corpus text must not be committed.

## What the probes said

Each word gets INTENT probes (the term used as the concept) and RISK probes (the
same string in its ordinary sense). A standalone alias scores at `phraseBase`
0.540, credible on its own, so a RISK hit is a false positive shipped.

| word | typing | intent | false positives |
|---|---|---|---|
| **simp** | standalone | 1 → 2 of 2 | **0 of 1** |
| **4B** | standalone | 2 → 2 of 2 (0.515 → 0.540) | **0 of 1** |
| cope | standalone | 0 → 2 of 2 | **3 of 3** |
| cope | contextual | 0 → 2 of 2 | **2 of 3** |
| **cope** | **phrases, untyped** | **0 → 3 of 4** | **0 of 3** |
| PSL | standalone | 1 → 1 of 2 | **1 of 2** |
| PSL | contextual | 1 → 1 of 2 | 0 of 2 |
| **PSL** | **phrases, untyped** | **1 → 2 of 2** | **0 of 2** |

### The two that were typed

`simp` is the only one where typing is the right instrument. The word is
unambiguous in English — the only collision available was a fabricated "SIMP
protocol", which the gate discards before matching. `simping` and `simp economy`
already fired; the bare noun did not, and now does.

`4B` is free rather than valuable. It was already credible at 0.515 through token
overlap; typing makes the bare acronym a phrase hit at 0.540 rather than a
coincidence of shared tokens. No probe moved in either direction and nothing
false appeared. Worth doing because a concept reached by accident is one entry
edit away from not being reached.

### The two that were refused, and why contextual was not the answer

**`cope` standalone maps every ordinary use of the verb**, including

> "Couples who cope with stress together report higher relationship satisfaction."

at 0.540 — a real research finding mapped to a slang term about dismissing
arguments.

**Contextual typing is not a safer standalone here, and the trace says why.**
`relationalCoFire` promotes a contextual alias when a relational ROLE term sits
within eight tokens in the same clause. The two probes that survived contextual
typing were promoted by:

```
"cope" promoted=true · relational role term “men” within 8 tokens, same clause
"cope" promoted=true · relational role term “couples” within 8 tokens, same clause
```

`men` and `couples` are the two commonest role nouns in the entire domain. For a
word whose ordinary sense lives in exactly the passages the concept lives in,
contextual typing is standalone with extra steps.

**`PSL` standalone maps a pumpkin spice latte** — "He brought her a PSL on their
second date" at 0.540. Contextual rejects that one, but only because `date` is
not a relational role term and is not shared with the entry; "he bought his
girlfriend a PSL" would promote. That is a rule surviving by luck, and it buys
one fewer intent hit than the alternative.

### The grammar that solved both

English separates the two senses where the analyzer could not. **The verb takes a
complement — "cope WITH" — and the noun is a predicate or object — "is cope", "as
cope", "just cope".** Multi-word aliases need no typing at all: they clear
`minPhraseLength`, contain a space, and fire as ordinary phrase hits. They cannot
collide with a verb that never takes those shapes.

```
lexicon:term-cope   is cope · as cope · just cope · pure cope · cope harder
lexicon:term-psl    PSL scale · PSL rating · PSL score · on PSL
```

`cope` goes 0 → 3 of 4 intent with 0 of 3 false positives. `PSL` goes 1 → 2 of 2
with 0 of 2. Both beat their typed variants on **both** axes, which is rare enough
to be worth stating plainly: this was not a trade.

The one `cope` miss is the quoted bare word — *Calling a hopeful claim about
dating "cope" is how the forum dismisses it* — which sits at 0.427, a thousandth
under `minCredibleScore`. Left there rather than chased with a phrase that would
have to be fitted to the probe.

## Cost

**Gate: unmoved.** Multi-word aliases reach `canonAdmissionSurfaces`, so this is a
gate change under the live coupling and the benchmark was re-run:

```
domainRecall 1.000 · ignorePrecision 1.000 · junkRecall 0.844
admission surfaces 851 -> 856
```

Identical on all three, and `junkRecall` stays exactly at its ratchet.

**Retrieval: 122 pairs moved, none crossed.**

```
analyzer 2.6.9 -> 2.6.9 · config bt0a7p -> bt0a7p
canon 1.0.0+f263ae6219b9 -> 1.0.0+6cf046c1e769
changed 122   87 down / 35 up
candidateScoreFloor  0 gain / 0 loss
minWeakScore         0 gain / 0 loss
minCredibleScore     0 gain / 0 loss
```

Sub-threshold IDF drift from new alias text entering the index, and nothing else.
The frozen band was regenerated to carry the moved scores; all 5,296 rulings
preserved, `pendingByThreshold` unchanged.

## What is pinned

`tests/canon-index-fixtures.mjs` — typed entries 6 → 8, with `simp` and `4B`
pinned by value, and `cope` and `PSL` pinned as **untypeable on measurement**: the
bare word must not appear as an alias (untyped it is inert, so it only ever
becomes live by someone typing it) and the phrase route must survive.

`tests/lab-match-behavior.test.mjs` — the sense split itself, eight probes,
concept-sense must map and ordinary-sense must not. RED-verified by typing `cope`
standalone:

> "Couples who cope with stress together report higher relationship satisfaction."
> uses the ordinary sense and now maps to lexicon:term-cope at 0.54. That is the
> cost typing this alias would have carried, and it is why it was refused.

## Two mistakes worth keeping

**My first RED check patched the wrong artifact.** I edited
`data/le-canon-index.json` to break the fixture; nothing failed, because
`tests/canon-index-fixtures.mjs` calls `buildCanonIndex()` and never reads the
built file. A RED check that silently passes is worse than no RED check — it
certifies a guard that was never exercised. The real verification patches
`data/canon-overlay.json`.

**I reported all four as one class.** `md/lab-constants-audit.md` grouped them as
"distinctive slang, the same shape as SMV/LMS/rizz". Two of them are; `cope` is
ordinary English and belongs with `game`/`Wall`/`Sham`, and `PSL` has a coffee
collision. The grouping was an assumption dressed as a finding.

## The other four — ruled the same day

`face`, `body`, `age` and `game` all stay dead: typed standalone they add 75
credible matches across the archive of which **none are right**, while displacing
two that were. Three fail as homonyms; `age` fails a fourth way, by being a
measurement axis rather than a claim. `md/lab-generic-title-aliases.md`.

My guess above — "all four are ordinary English in the same class" — held for
three of them and missed the interesting one.

## Reproducing

```
slang-exposure.mjs   the four bare words across all 21 sources
slang-typing.mjs     standalone vs contextual vs baseline, authored probes
slang-why.mjs        the relationalCoFire trace that killed contextual for cope
cope-phrase.mjs      the phrase route, with the gate benchmark beside it
psl-probe.mjs        PSL and 4B against gate-passing intent probes
```


---

# lab-generic-title-aliases.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-generic-title-aliases.md`

# face, body, age, game: all four stay dead, and `age` fails a way nothing else has

2026-07-30. Closes the list `md/lab-constants-audit.md` opened: twelve untyped
single-word aliases silenced by `minSingleAliasLength`, four ruled long ago, four
ruled in `md/lab-slang-alias-typing.md`, these four now.

**Ruling: none of the four is typed.** No canon change; two new guards.

---

## Why the archive is the right instrument this time

The slang terms — `cope`, `simp`, `4B`, `PSL` — were effectively absent from the
21 archived sources, so they had to be judged on authored probes. These four are
the opposite. They are ordinary English in a corpus of mate-preference research,
where faces, bodies and age are the subject matter. The archive can see them, so
it decides.

All four are also **title-derived**. None of these entries carries a single
authored alias, so the bare word reaches `_singleTokenAliases` from the title and
dies at the length floor. Nobody ever chose to add them.

## Typed standalone across all 21 sources

```
displayed credible matches   1,093 -> 1,166      +75 / -2

  smv:looks:age      +68
  smv:looks:face      +5
  smv:looks:body      +1
  lexicon:term-game   +1
```

**Not one of the 75 is right.** The counts are the least interesting part; these
were read.

### Three homonyms, one of them not a homonym at all

**`face` (+5) — the verb.** Every gain in the archive is the verb:

> "Thus, on average women tended to **face** a relative abundance of men in their
> local marriage market."
> "Women's increased sexual activity outside of marriage in the **face** of a male
> surplus…"

Zero of the five is about a human face. This is the `cope` shape exactly.

**`body` (+1) — the collective noun.** "One way to interpret this entire **body**
of existing longitudinal research…"

**`game` (+1) — the adjective.** "…the advice of sex advice columnist Dan Savage
(2007) that they strive to be good, giving, and **game**." Mapped to
`lexicon:term-game`, which is seduction skill.

**`age` (+68) — and this one is new.** `age` is not a homonym. It means exactly
what `smv:looks:age` is about. It still cannot carry the concept, because in
quantitative social science **`age` is the axis every dataset breaks out**:

> "…this varies by income, **age** and education"
> "There are also differences by **age**: 62% of Americans **ages** 65 and older…"
> "…assessed at about **age** 21 years and relationship status approximately 2.5
> years later"

Sixty-eight survey crosstabs. The entry is about looks being time-stamped and the
Clock multiplier biting; a demographic breakdown makes no claim about that at all.

This is a fourth failure shape and the record did not have it. `game`, `Wall` and
`Sham` were ruled dead as *"ordinary English that happens to name a concept"* —
homonyms, where the word means something else. **`age` fails while meaning the
right thing**, because its presence carries no information about whether the
passage is making the claim. A word can be perfectly unambiguous and still be a
terrible match surface.

### And it costs coverage as well as buying noise

`-2`. The new 0.540 hits displaced two correct matches through
`maxMatchesPerClaim`. Typing here is not a precision-for-recall trade; it loses on
both.

## The other half: is the dead alias free?

A dead alias only costs something where the token surface does not already carry
the concept. Probes that plainly make each claim:

```
smv:looks:body      REACHED  0.852 · 0.513
lexicon:term-game   REACHED  0.690 · 0.543
smv:looks:face      weak 0.369 · not reached  (one probe gate-binned)
smv:looks:age       not reached · not reached (one gate-binned; the other went
                                               to smv:overview at 0.540)
```

So **`body` and `game` cost nothing** — same finding as `Wall` and `Sham`, and
their dead alias is free.

**`face` and `age` do cost something.** They are genuinely hard to reach. But the
fix is not typing, because typing them is what produced the seventy-five: it is a
match surface, which is tranche work — boundary conditions and misreadings that
say what a claim about facial attractiveness or about age-pricing looks like.
Recorded rather than done, because that is doctrine authoring and a different
decision.

Two of the probes never reached the matcher at all — the gate binned them. That
is the third time this lane has landed on `md/lab-canon-alias-pass-01.md`'s
recommendation (3): *the binding constraint is not the alias, it is the gate.*

## What is pinned

**`tests/canon-index-fixtures.mjs`** — each of the four must keep zero aliases
(so the bare word is understood to come from the title) and zero typing.

**`tests/lab-match-behavior.test.mjs`** — two tests. The ordinary sense must stay
unmapped, one probe per failure shape; and the two concepts that carry themselves
must keep doing so.

The probes are **authored, not lifted**. The corpus is gitignored third-party text
(`md/RERUN.md` §1), so a committed fixture in this register has to be written.
Two further authored probes were dropped because the gate discards them: a probe
the gate never delivers cannot demonstrate anything about the matcher.

RED-verified by typing each of `Age` and `Face` standalone in the overlay:

> "Responses to the dating survey varied by income, age and education across the
> sample." uses a crosstab axis and now maps to smv:looks:age at 0.54.

> "Men who are rejected early face a longer wait before the next match arrives."
> uses the verb and now maps to smv:looks:face at 0.54.

## Cost

None. No canon change — `data/le-canon-index.json` is byte-identical to the
previous commit, so no scores moved and there was nothing to sweep or adjudicate.

## The list is now closed

```
typed          SMV (x2) · LMS · rizz · simp · 4B
reached by phrase instead                cope · PSL
dead, free (reached anyway)   game (smv:charm) · Wall (x2) · Sham · body · game (lexicon)
dead, and it costs — needs a match surface, not an alias      face · age
```

## Reproducing

```
generic-alias.mjs      exposure + the typed diff over 21 sources, gains dumped
generic-reach.mjs      whether each concept is reached without its alias
generic-authored.mjs   the authored stand-ins, checked to reproduce the failure
```


---

# doctrine-market-container-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-market-container-01.md`

# Doctrine invention — The Market Container (batch 03)

**Date:** 2026-07-31 · **Lane:** Claude (Opus 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (31–33)
**Status:** SHIPPED. Entries 31–33, tested claims renumbered 34–36. Canon 485 → 488, Rules &
Frameworks 38 → 41. `npm run test:lab` green end to end including all three Python audits.
**This batch also corrected two existing pages**, which is the part that matters most: see §4d.
**Chains from:** batch 01 (the transaction layer, `1e64df7`) and batch 02 (the population layer,
`b08f6d3`).

---

## 0. Collision control

A second session (`LE Lab Work`) is running in this same working tree. This document stakes:

- **New TOC group:** "The market container"
- **Entry ids:** `#sex-ratio`, `#effective-ratio`, `#local-market`
- **Renumbering:** Tested claims 31–33 → 34–36.

Two hard rules carried from batch 02, learned the expensive way:

1. `data/le-canon-index.json` and `tests/fixtures/threshold-neighbors.json` are derived from the
   whole of every source page. Rebuilding either while another session holds uncommitted page edits
   bakes their prose into my generated artifact. **Whoever commits second rebuilds.**
2. `git diff -U0` maps insertions to the *preceding* entry. To attribute changes, regex each
   `rf-entry` block out of HEAD and the working tree and compare blocks.

## 1. The structural finding

Batch 01 priced the transaction. Batch 02 priced the pool — who is in it, when they leave, and what
a snapshot of it licenses. All three of those still assume **one undifferentiated market**.

There isn't one. Every participant is in a *specific* market with a shape nobody chose: a **sex
ratio** and a **geography**. And the ratio sets the terms of trade for everyone inside it
**regardless of any individual's quality** — which makes it the one variable on this entire site
that is both first-order and completely absent from every instrument we have built.

The site asserts this and has never modelled it. Verified against the live pages:

| Where it appears | What it is |
| --- | --- |
| `smvlevers.html` Market multiplier | one sentence — "the same profile is a 6 in one city and an 8 in another, depending on the sex ratio" — tagged **Mixed**, citing Guttentag & Secord |
| `smvlevers.html` sub-variable + evidence row | "Geography & sex ratio", same single citation |
| `dd-what-the-wall-actually-is.html` | describes the **age flip** in prose: "the young surplus of single men becomes, decades on, an old surplus of single women" — no mechanism, no framework |
| `gender-dynamics.html` "you had easy mode" | the market-**density** intuition, stated as a regret and never generalised |
| `frameworks.html` | **nothing.** Zero entries in 33. |

Four assets gesture at the container; none names it. That is the same shape as the Third-Party
Layer in batch 01 and the Stock–Flow Error in batch 02, and it is the reliable signature of a real
doctrine gap on this site.

**One more reason this is overdue:** a prior audit recorded that Guttentag & Secord (1983) — the
site's *only* sex-ratio citation, load-bearing in three places — was **never actually reached**.
The batch has to fix that or stop citing it.

## 2. The measured spine (computed before the scouts returned)

Unmarried adults (never married + divorced + widowed), **men per 100 women**, US, ACS 2024 1-year
table B12002, computed from raw counts — an LE calculation, labeled as such:

| age | 20–24 | 25–29 | 30–34 | 35–39 | 40–44 | 45–49 | 50–54 | 55–59 | 60–64 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| men per 100 women | 109.0 | 115.6 | **118.5** | 112.9 | 105.5 | 94.9 | 90.2 | 85.9 | **78.9** |

Three things fall straight out, and all three are new to the site:

1. **The unpartnered market is never balanced at any age.** The nearest it comes to parity is the
   crossover, and everywhere else it is lopsided by 5–20%.
2. **The male surplus peaks at 30–34, not in the twenties** — 118.5 men per 100 women. That is the
   same age band where batch 02 found the first-marriage hazard peaks, which is unlikely to be a
   coincidence and is worth saying carefully.
3. **The crossover sits at ~45.** `dd-what-the-wall` asserts this flip qualitatively; this locates
   it and sizes it. By 60–64 there are 79 unmarried men per 100 unmarried women.

This spine is what makes the batch shippable even if the causal literature disappoints: the
*shape of the container* is measured, whatever one concludes about its effects.

### 2b. The discovery — the age flip is entirely a divorce-and-widowhood effect

I ran the same computation under three definitions of "in the market," to check whether the curve
was an artifact of my own definitional choice. It is not an artifact, but the choice **changes the
direction of the headline claim**, which is a finding in its own right. Men per 100 women:

| age | 25–29 | 30–34 | 35–39 | 40–44 | 45–49 | 50–54 | 55–59 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A.** never-married + divorced + widowed | 115.6 | 118.5 | 112.9 | 105.5 | **94.9** | 90.2 | 85.9 |
| **B.** never-married only | 117.5 | 125.0 | 125.5 | 125.1 | **117.2** | 114.9 | **119.3** |
| **C.** A + separated | 114.8 | 116.3 | 110.0 | 102.6 | **92.9** | 89.4 | 85.3 |

**The never-married pool is male-surplus at every single age, 115–125 men per 100 women, and it
never crosses over.** The famous flip exists only in definition A — and it is produced entirely by
the divorced and widowed, because women outlive men and men remarry faster.

So `dd-what-the-wall`'s line — "the young surplus of single men becomes an old surplus of single
women" — is **true of the unmarried population and false of the never-married population.** Both
sentences describe the same country. That is precisely the composition trap batch 02 was written
to catch, appearing here in our own prose, and entry 32 is now built around it: *which pool you
count decides the direction of your answer, before any behaviour is considered at all.*

Column mapping for the separated and female blocks was verified against the API's own labels
(B12002096/103, 128/135, 158/165, 173/180) rather than inferred from offsets.

## 3. The three entries

### 31 · The Sex Ratio — *The market container*

**The terms of trade are set by whichever sex is scarcer, and no individual chose them.** The
scarcer side can hold out for more; the abundant side competes harder and concedes more. This
prices something the site's five levers cannot: two identical people in two markets face different
prices, and neither did anything to deserve it.

Guttentag & Secord's real contribution is the part the site never carried — their split between
**dyadic power** (the scarce sex's individual bargaining advantage) and **structural power**
(control of institutions), and their argument that the two can point in opposite directions. That
is a more interesting and more honest claim than "scarcity wins," and it is what the scout is
retrieving from the primary.

The evidentiary spine will be the natural experiments (Angrist's immigrant sex ratios;
Abramitzky et al. on WWI French casualties; Charles & Luoh on male incarceration; Wei & Zhang on
China), because those are instrumented and the correlational US literature is not.

**The limit that must ship in the body:** those experiments used *enormous* ratio shocks. If US
metro variation is small by comparison, then the mechanism is real and the local effect size is
modest — and saying so is the difference between doctrine and a horoscope.

### 32 · The Effective Ratio — *The market container*

**The ratio that matters is not how many exist, but how many are actually searching.** Headcount
and effective ratio can point in opposite directions, and this site already holds the data that
proves it: among singles 40+, **71% of women are not looking against 42% of men**
(`#stat-why-single`). Apply that to a 45–49 headcount of 94.9 men per 100 women and the *searching*
ratio moves hard in the opposite direction.

This is the entry that chains most directly off batch 02: the population layer established that a
pool's composition is not its headcount, and this applies that lesson to the ratio specifically.
The formal concept exists in behavioural ecology as the **operational sex ratio** (Emlen & Oring
1977) — receptive individuals, not living ones — and human demography has never had a clean
equivalent.

**Expected honest finding:** nobody has measured a searching-adjusted sex ratio for the US. If the
scout confirms that, the entry ships the arithmetic explicitly as **LE's calculation under stated
assumptions**, with the self-report weakness of "not looking" carried in the body — because people
who say they are not looking still partner.

**Now anchored on §2b, which is stronger than the original plan.** The entry has two stacked
corrections rather than one, and they compound in the same direction:

1. **Which pool you count flips the sign** (never-married stays male-surplus at every age; the
   all-unmarried pool crosses at ~45).
2. **Who is actually searching flips it again**, and the site's own `#stat-why-single` supplies the
   input: 71% of single women 40+ are not looking against 42% of men.

Two composition corrections, each large enough to reverse a confident claim, sitting underneath a
number the discourse quotes as if it were simply "how many men and women there are."

### 33 · The Local Market — *The market container*

**Nobody participates in "the dating market." National statistics describe nobody's actual
market.** A person competes in a metro, a campus, a workplace, a congregation — and those differ
from each other far more than the national aggregate differs from year to year.

This entry finally generalises the `gender-dynamics.html` "easy mode" card: what made school easy
was not youth, it was **density** — a large, age-matched, repeatedly-encountered pool with no
search cost. That is a market-structure fact, and losing it is a market-structure loss, not a
personal failure.

The actionable claim — *moving is a lever most people never consider pulling* — is the weakest
thing in the batch and I expect it to be unmeasured. If it is, it ships graded Lens and says so.

## 4. Evidence pass (in flight, 3 Opus 5 scouts)

- **S-A** — Guttentag & Secord from the primary (dyadic vs structural power); the instrumented
  natural experiments and their magnitudes; how much US metro ratios actually vary; strongest
  reasons to reject.
- **S-B** — operational sex ratio as a formal concept; the measured inputs to a US effective ratio;
  whether adjusting for "actually searching" flips direction in any age band; whether anyone has
  measured it; why self-reported "not looking" is a weak instrument.
- **S-C** — how much US local markets differ; the college sex-ratio claim graded honestly; whether
  geography still binds in the app era; whether moving works; market thickness theory versus its
  untested dating application.

## 4b. S-B returned — and it inverted my own hypothesis

I wrote in §3 that adjusting for who is searching would move the ratio "hard in the opposite
direction" at 40+. It does. **I had the direction backwards**, and shipping the concept as written
would have published a manosphere-flattering number that the arithmetic does not support.

| band | headcount | searching-adjusted |
| --- | --- | --- |
| 18–39 | 112.3 | **123.3** — no flip; the male surplus is *amplified* |
| 40–64 | 90.9 | **181.7** — flips |
| 40+ | 70.3 | **140.7** — flips |

The flip runs **in favour of older women**: an older *searching* woman is choosing among roughly
1.4–1.8 searching men. The apparent surplus of women in older bands is substantially a surplus of
women who have left the market. Every figure above was recomputed by me from ACS 2024 B12002 and
reproduces the scout exactly. (My first attempt returned suspiciously round numbers — 100.0 and
200.0 — from a PowerShell scoping bug; the corrected run matches on all six.)

**What ships is the break-even, not the point estimate**, because the threshold needs only the
census counts and inherits none of the adjustment's fragility:

> Given the headcounts, the female surplus at 40+ survives only if **fewer than 59.2%** of single
> women that age are out of the market. Pew measures **71%**.

**Fragility, stated rather than buried:** swap Pew's 2022 all-age rates in and the 40+ flip
collapses to 100.5 — dead parity. The **40–64** flip survives every scenario run (181.7 / 129.8 /
128.2), which is why that band carries the claim and the older ones do not.

**The verified gap:** nobody has published a searching-adjusted sex ratio for the US. The concept
is 49 years old (Emlen & Oring's operational sex ratio, 1977), the inputs are free and Tier 1, and
no one has multiplied them. Human demography refines on *suitability* (Goldman/Westoff/Hammerslough
availability ratios), never on search.

**The best counter, which ships in the body:** Harknett (2008, *Demography* 45(3):555–571) found
**crude sex ratios outpredicted refined availability ratios** on real relationship outcomes. That is
a direct shot at this entry's central instinct, and the defence is narrow — those refinements
adjust for suitability, and nobody has tested one for search behaviour. Also carried: MacDonald et
al. (2025, *PSPB*) found relationship *amotivation* predicted being partnered six months later, so
"not looking" is not "not available."

**Excluded:** all dating-app sex ratios. Every circulating figure (Tinder ~75% male etc.) traces to
SEO marketing pages with no sample or method. Only Pew's app-use figures ship.

## 4c. S-C returned — the third inverted claim

The entry splits into three claims that do not share a tier:

- **"Markets are local"** — supported, Tier 2. Bruch & Newman (2019, *Sociological Science*
  6:219–234): messaging partitions into **19 geographic communities**; Texas messages Texas even
  where out-of-state users are physically nearer. Bossard (1932): a third of 5,000 Philadelphia
  marriage licences were within five blocks.
- **"They differ enormously"** — supported and quantified. Employed single men per 100 single women,
  ages 25–34: **San Jose 114, Memphis 59** — a 1.9× spread. And the national figure moves **115 →
  84** on the employment filter alone.
- **"So move"** — **measured, and null.** Jang, Casterline & Snyder (2014, *Demographic Research*
  30(47), NLSY79, 7,827 people / 87,931 person-years): the naive migration→marriage effect is
  ~12% (OR 1.12), and correcting for shared unobservables takes it to **b = 0.04, p = 0.58**, with
  the process correlation σ = 0.24. The surviving arrow is the reverse: **marriage → migration,
  OR 1.33.**

Plus the recursion, which is the entry's best move: sex ratios "vary widely between submarkets"
*within* each city, so a metro number describes nobody for exactly the reason a national number
does. There is no level at which the aggregate becomes you.

**Thickness counters, both pointing away from the doctrine:** Li & Netessine (2020, *Management
Science* 66(1)) — doubling market size cut match rates ~15%; Petrongolo & Pissarides (2006, *EJ*
116(508)) — bigger markets raise realised quality but not match counts, because reservation
standards rise. Both are the Abundance Trap arriving from outside the dating literature.

**A genuine hole, stated on the page rather than filled with a survey number:** nobody has published
the *radius* — the median distance between matched or married US partners, before against after
online dating. Bossard 1931 is the last clean distance distribution.

## 4d. S-A returned — the causal core is stronger than we said, and our source was worse

Two findings, pulling in opposite directions, and both shipped.

**The mechanism is Tier 1 and replicated across four independent shocks** — none correlational:
Angrist (2002, *QJE* 117(3), immigrant arrival ratios as instrument, n ≈ 53,000 women): a one-unit
rise in the ratio raises women's ever-married by **0.150** and cuts their labour-force
participation by **0.099**. Abramitzky, Delavande & Vasconcelos (2011, *AEJ: Applied* 3(3), French
WWI mortality — 1.4M dead, **16.5%** of enrolled soldiers, near-uniform across ranks): a fall from
1.00 to 0.90 makes grooms **8.2 points** likelier to marry up and **18.5 points** less likely to
marry a bottom-three-class bride. Brainerd (2017, *ReStat* 99(2), Soviet WWII, ratio **0.60** for
the 1924 cohort): **+68** non-marital births per 1,000 unmarried women against a mean of 43. Wei &
Zhang (2011, *JPE* 119(3)): **+12.1 points** of household savings for son-families.

**But our own citation cannot carry any of it.** Guttentag & Secord (1983) argues from historical
episodes with no sampling frame and no identification strategy — Angrist himself describes it as
*recounting a number of historical episodes*. It is **Tier 3 as causal evidence** and the site's
"Mixed" tag was too generous. Worse, and disclosed on the page: **the primary is still unread** —
out of print, available only via library lending — so it was reconstructed from peer-reviewed work
quoting it. A site that grades other people's sourcing does not get to quietly cite an unopened book.

And the *norms* half of their theory **failed its direct tests**: Trent & South (2011, *Social
Forces* 90(1)) found high Chinese sex ratios produced *more* premarital and extramarital sex among
women, the opposite of the prediction; Dollar (2015, *Sociological Inquiry* 85(4), 65,443 census
tracts) found divorce behaved as predicted in **no** time period.

### The headline: America's imbalance is credentialed, not geographic

Men per 100 women, ages 25–34, **LE calculation from ACS 2024 1-year table B15001**, recomputed by
me from raw counts (the scout's 5-year figures differ by 1–3 points; the gradient is identical):

| attainment | HS grad | some college | associate's | bachelor's | BA+ | graduate |
| --- | --- | --- | --- | --- | --- | --- |
| men per 100 women | **140.0** | 108.2 | 85.0 | 87.8 | **80.7** | **67.0** |

Across US metros the same age band is nearly flat — median ~102, SD ~5, range ~91–116. Applying
Angrist's own coefficient to a move from the worst US metro to the best buys about **3.7 points**
of marriage probability. Sorting by credential moves the ratio **73 points**. A woman with a
graduate degree who requires the same is drawing at **67**, more lopsided than post-war France's
worst départements at 86 — the shock that measurably changed who married whom.

**The limit that keeps this from being a blackpill, and it ships in the body:** a credential is not
a dead generation. A degree gap binds only insofar as people insist on it, and they demonstrably
marry across education lines. The number is *the price of a filter*, chosen and revisable.

**The pressure test that should govern all sex-ratio talk:** Pollet, Stoevenbelt & Kuppens (2017,
*Phil. Trans. R. Soc. B* 372(1729)) correlated **110 theoretically unrelated variables** against
national adult sex ratios and got **35% significant at p = .05** — including *maximum elevation* —
with the sign reversing between national, state and county levels. Any correlational place-level
sex-ratio claim should be assumed noise.

## 4d-ii. The cross-page corrections (the "doctrine isn't only additions" half)

`smvlevers.html` carried the sex-ratio claim in three places on one Tier 3 source. All three moved:

1. **Market multiplier cite:** retagged **Mixed → Solid**, re-sourced to Angrist / Abramitzky /
   Brainerd, with the norms claim explicitly separated out as weaker.
2. **Market multiplier caveat:** previously implied changing your market was a live lever. Now
   carries the measured truth — metro spread is ~5 points, moving tested null, and the large
   imbalance is the credential one you carry with you.
3. **Exposure research rows:** the single "operational sex ratio" row became **two** rows — a
   `solid` bargaining-power row and a `contested` norms row citing the two studies that failed it.
4. **The word "operational" is gone site-wide.** It denotes individuals actively competing to mate;
   every study measures a headcount of adults. Borrowing a stricter term than the data supports is
   quiet overclaiming — verified 0 occurrences remain.

## 5. What this batch will not claim

- That sex-ratio effects measured under wartime casualties, mass incarceration or China's
  one-child imbalance transport at full size to a US metro with a 3-point skew.
- That the effective ratio is known. It will be computed under stated assumptions or not stated.
- That moving improves outcomes, unless S-C returns evidence that survives.
- Any causal reading of the age curve in §2. It is a cross-section, and batch 02's own
  Stock–Flow Error entry forbids reading it as a life course.


---

# doctrine-advice-layer-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-advice-layer-01.md`

# Doctrine invention — The Advice Layer (batch 04)

**Date:** 2026-07-31 · **Lane:** Claude (Opus 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (34–36)
**Status:** SHIPPED. Entries 34–36, tested claims renumbered 37–39. Canon 488 → 491, Rules &
Frameworks 41 → 44. `npm run test:lab` green end to end including all three Python audits.
**All three entries were substantially rewritten by their evidence; the Saturation Rule was
rewritten twice.** See §5d.
**Chains from:** batch 01 (transaction layer, `1e64df7`), batch 02 (population layer, `b08f6d3`),
batch 03 (market container, `01f5d61`).

---

## 0. Collision control

Staking: TOC group **"The advice layer"**, entry ids `#saturation-rule`, `#survivorship-channel`,
`#virality-filter`. Tested claims renumber 34–36 → 37–39.

The `LE Lab Work` session holds `data/canon-overlay.json`, `data/le-canon-index.json`,
`tests/canon-index-fixtures.mjs` and `tests/fixtures/threshold-neighbors.json` for its own docket
item 2 (a match surface for `smv:looks:face` and `smv:looks:age`). **I handed those back at
01f5d61 and will not take them again until it says it is done** — this batch's HTML can be drafted
and spliced meanwhile, but the overlay/index/band pass waits.

## 1. The structural finding

Three batches have modelled the market itself:

| batch | what it priced |
| --- | --- |
| 01 transaction layer | what participating costs, what a claim is worth believing, who else votes |
| 02 population layer | who is in the pool, when they leave, what a snapshot licenses |
| 03 market container | the shape nobody chose — the ratio, and the geography |

**All of it models the market. None of it models the market for *advice about the market* — which
is the product category this entire site sits inside.**

That omission is not academic. Every reader arrives holding advice they got from somewhere, and the
site has never given them a way to price it. Worse: the site is itself a producer in that market,
and has never turned its own instruments on its own genre. The Calibration Error fenced our
*measurements*. Nothing fences our *recommendations*.

Verified against the live pages — grepped, not assumed:

| vocabulary | hits |
| --- | --- |
| `saturat` / `diffus` / `arms race` / `Red Queen` | **zero** as doctrine (one unrelated body-calc comment, one "diffuse withdrawal" phrase) |
| `Goodhart` / `Lucas critique` / `reflexiv` / `performativ` | **zero** (only "performative dominance" in the Frame lexicon entry) |
| `survivorship` | **zero** |
| `everyone does it` / `stops working` / `once everyone` | one line on `smvlevers.html` — that manipulative game "stops working on anyone worth keeping," which is about *authenticity*, not saturation |

## 2. The three entries

### 34 · The Saturation Rule — *The advice layer*

**A tactic's edge decays as it diffuses, because its value depended on other people not using it.**
Advice that works is advice that has not saturated yet.

The mechanism is the site's own Signal Cost Rule pointed at the advice market: a signal separates
types only while its cost differs by type. When a tactic becomes universal it stops carrying
information — the honest man who types his real height reads as short, and the man running the
same opener as everyone else reads as everyone else.

Strongest planned anchor: **post-publication decay of published market anomalies** — the cleanest
measured case anywhere of an edge dying because it was written down. If the magnitudes are as
expected it converts a plausible intuition into a measured one, in a domain where the data is
good, and the transfer to dating is explicitly LE's inference.

**The distinction that decides whether this entry is any good** (and which the scout was asked to
attack): saturation should apply to **positional** advice — things whose value is relative and
zero-sum, like an opener, a photo trick, a scarcity tactic — and **not** to non-positional
capability like fitness, income, conversational ease, or emotional regulation. If that distinction
survives, this entry is a usable filter. If it does not, the entry is a slogan and should be cut.

### 35 · The Survivorship Channel — *The advice layer*

**Dating advice is produced almost exclusively by people selected for having succeeded, or for
being able to sell — and the failures are invisible, so the advice looks better than it is.**

Two moves. First, the structural point: a strategy's advocates are drawn from its survivors, so the
observed success rate of any advice is conditioned on success. Second, and harder: **essentially
none of the popular genre has been tested.** The scout is checking whether *any* randomised or
quasi-experimental test of dating advice or coaching exists. If the answer is "essentially none,"
that absence is the entry — a whole industry of confident prescription with no measurement under it.

Fairness requirement, written into the brief: find where popular advice has turned out broadly
right despite thin evidence. An entry that only sneers is a worse entry.

### 36 · The Virality Filter — *The advice layer*

**The advice that reached you was selected by a distribution system optimising for engagement, not
accuracy.** Confidence, grievance and extremity travel; hedged accuracy does not.

Anchors sought: the large-scale measurement of false-versus-true news diffusion, moral-emotional
language and sharing, out-group animosity, and whether expressed confidence buys credibility
independent of accuracy.

**The claim this entry must NOT make**, and the scout was told to push on it: none of that licenses
"popular therefore false." It licenses the much weaker and much more defensible **"popularity is
not evidence of truth, and the selection pressure runs against nuance."** If the evidence only
supports the weak version, the weak version ships.

> **REVISED after S-F (2026-07-31). The weak version ships, and the entry's causal agent changes
> from the algorithm to the audience.** See §5b. My framing — "selected by a distribution system
> optimising for engagement" — is **contradicted where it has been tested**: in a large field RCT,
> switching Facebook users to a reverse-chronological feed *increased* their exposure to
> untrustworthy sources by **68.8%**. Turning the optimiser off made the information diet worse.
> Vosoughi likewise removed bots, re-added them, and concluded the differential was produced by
> **humans, not robots**. The honest entry blames the audience, which includes the reader, which is
> a far better entry than one blaming a faceless algorithm.

## 3. Why these three are one finding

| | the question | the error without it |
| --- | --- | --- |
| Saturation | does this still work? | treating a decayed edge as a live one |
| Survivorship | who is telling me this, and who isn't? | reading a survivor's account as a base rate |
| Virality | why did this reach me at all? | mistaking reach for evidence |

Together they price the advice, the adviser, and the channel — and the site has to accept all three
against itself. `frameworks.html` is a wall of confident recommendations; batch 02's Stock–Flow
Error already forced that discipline onto our statistics page, and this is the same move aimed at
our prescriptions.

## 5b. S-F returned — the mechanism is human, and the best result is about verification

**What survives, and it is enough to carry the entry:**

- **Vosoughi, Roy & Aral (2018, *Science* 359(6380):1146–1151)** — ~126,000 cascades, ~3M people,
  4.5M tweets, 2006–2017. Falsehood **70% more likely** to be retweeted; truth **never diffused
  beyond depth 10** while the top 1% of false cascades reached 1,000–100,000. Proposed mechanism is
  **novelty**, not accuracy. Robustness set of 13,240 cascades never touched by a fact-checker
  (κ = 0.88) reproduces it.
- **Rathje, Van Bavel & van der Linden (2021, *PNAS* 118(26))** — n = 2,730,215 posts. Each
  out-group term raises sharing odds **67%**, about **4.8×** the effect of negative affect and
  **6.7×** that of moral-emotional language.
- **The best single result in the batch — Sah, Moore & MacCoun (2013, *OBHDP* 121(2):246–255).**
  When advisors' accuracy is visible, overconfidence **backfires**. When it is *not* visible:
  confidence drives credibility (F = 7.82, p = .006) and persuasion (F = 9.05, p = .003) while
  **accuracy has literally no effect — F < .01, p = .99**. And people bought **less** verification
  from confident advisors (0.63 vs 1.58 purchases; 35% vs 53% ever bought). Dating advice is the
  no-feedback condition: outcomes are delayed, confounded, and never counterfactually observable.

**What has to be cut or demoted:**

1. **"The distribution system selects against accuracy" — contradicted, but not as cleanly as the
   scout had it.** Guess et al. (2023, *Science* 381(6656)): reverse-chronological feeds *raised*
   untrustworthy-source exposure **68.8%** on Facebook and 22.1% on Instagram, off baselines of
   2.6% and 1.3%. I verified those figures independently — and the same check surfaced a **2024
   technical comment in *Science*** the scout did not report: the study window overlapped Meta's
   emergency election period, **63 "break glass" news-feed changes**, reverted in March 2021. The
   measured effect stands; the inference about the *everyday* algorithm does not. The entry now
   uses it to bound a heavily-moderated feed, and leans the "audience not algorithm" conclusion on
   Vosoughi's bot analysis instead, which the objection does not touch.
   **This is the second time this session that independently checking a scout's "verified" fact
   changed what shipped.** The discipline earns its cost.
2. **"Popular ⇒ probably false" — demoted to a bounded footnote.** 70% more likely to be retweeted
   is a likelihood ratio of ~**1.7**, under one bit of evidence, and only *within the reference
   class of fact-checked contested rumours*. Most dating advice is not a checkable factual claim at
   all.
3. **Popularity is actually a weak *positive* signal.** Salganik, Dodds & Watts (2006, *Science*
   311(5762), n = 14,341): "the best songs rarely did poorly, and the worst rarely did well, but
   any other result was possible." High-variance, low-resolution, truncated at both tails.
4. **Sharing is not believing.** Pennycook et al. (2021, *Nature* 592): veracity has "little effect
   on sharing intentions, despite having a large effect on judgments of accuracy."
5. **My "extremity travels" phrasing conflates two things.** On the *consumption* side —
   Robertson et al. (2023, *Nature Human Behaviour*), 12,448 field RCTs, 205M impressions —
   negative words give **+2.3% CTR** per word, **anger is null (p = .666)**, and **moralised
   language *reduces* clicks (β = −0.024, p < .001)**. The outrage advantage is a *sharing* effect,
   not a reading effect.
6. **The moral-contagion number was overstated ~50%.** The famous 20%/word (Brady 2017) fell to a
   meta-analytic **IRR 1.13** across 27 studies and 4.8M observations (Brady et al. 2025) — after a
   critique showed that counting the letters **X, Y and Z** outperformed moral-emotional words as a
   predictor in 5 of 6 corpora (Burton et al. 2021).

**Two manosphere-specific numbers worth shipping:** only **36.3%** of 102 lay evolutionary
hypotheses extracted from manosphere content explicitly signal that they are speculative (Bachaud
et al. 2025, *Evolutionary Human Sciences* — Tier 3, exploratory, but it measures the *epistemic
form* of the claims rather than their tone). And in a sockpuppet audit, every fresh account was
served toxic content **within 23 minutes** (Baker, Ging & Andreasen 2024 — Tier 2/3, n = 10
accounts). The YouTube figure that circulates as "1 in 5" is **6.3% within five hops** in the
published version (Papadamou et al. 2021) — the site should use the correct number.

**The honest gap:** no study samples popular dating advice and scores it against evidence. The
ecosystem literature measures volume, toxicity and reachability well, and accuracy not at all.

## 5c. S-E returned — the charge is "unmeasured," not "false," and it needs two corrections

**Supported:** no randomised test of the coachable-tactic genre exists. The RCT literature in this
space covers relationship education for existing couples, dating-app safety, and dating-violence
prevention — not attraction, approach, texting or escalation. Negging has never been tested for
efficacy in either direction. The flagship mimicry-in-courtship experiment (Guéguen 2009, *Social
Influence* 4(4)) is **retracted**, its author carrying roughly twenty retractions, and it is still
cited as live evidence. Finkel et al. (2012, *PSPI* 13(1)) found **no compelling evidence** for
matching algorithms and reported finding no published paper explaining any site's criteria — the
nearest thing was authored by two employees of a dating company and said the algorithms must remain
proprietary.

**Correction 1 — "almost none of it has been tested" needs a carve-out**, and the exceptions are
the most useful evidence in the field: Egebark et al. (2021, *JPubE* 196, ~2,700 daters) — attractive
photos raise responses ~**20 points** for both sexes, and men are **5.1 points** less likely to
respond to a university-educated woman while women are indifferent to education; Bapna et al. (2016,
*Management Science* 62(11), **N = 100,000**) — anonymous browsing cut women's matches **4.09 → 3.51**
with no quality compensation; Joel, Eastwick & Finkel (2017, *Psych Science* 28(10)) — over a hundred
pre-date measures could not predict the pair-specific component **at all**, and that component was
the largest share of the variance. The precise claim is that the *coachable-tactic* genre is
untested, not the domain.

**Correction 2 — and this is the better entry.** I had written "the failures are invisible." They
often are not: Walster et al. (1973) published **five failed experiments** before the one that
worked, and Eastwick, Finkel & Simpson (2019) walked their own published effect from **r = .19 to
r = −.04** in print. The failures survive *inside the literature* and are stripped out on the way to
the advice. That is sharper and more defensible than invisibility.

**The specimen worth publishing.** Mirroring advice is widely justified by "a 2020 meta-analysis of
50+ studies, d ≈ 0.3." **I verified this myself rather than relaying it:** the paper those author
names point to is Hale, Ward, Buccheri, Oliver & Hamilton (2020, *Journal of Nonverbal Behavior*),
a **motion-capture study of 31 conversational pairs**. Not a meta-analysis, no fifty studies, no
such number. The genre does not merely lack citations — it manufactures citation-shaped objects.
The irony carried in the entry: mirroring is roughly right anyway, but the best design finds
**liking causes mimicry**, which then raises the partner's liking — a property of a pair going well
rather than a lever one person pulls.

**Fairness column, which the entry gives real space:** "fix your photos" is aimed at the largest
measured lever in the field; "get online" was right and earlier than the experts (Rosenfeld et al.
2019, *PNAS* 116(36)); attachment sits on a 132-study meta-analysis; and the uncertainty
researchers' own conclusion was that popular advice may simply be correct at first meeting.

**Held back as UNVERIFIED:** the Vicaria & Dickens coordination–rapport effect size, Dai/Dong/Jia's
sample sizes, Candel & Turliuc's exact correlations, and Wald's individual memo numbers. The
disputed question of whether Wald himself recommended armour placement is left unresolved on the
page rather than decided.

**A pleasing find for an entry about survivorship:** the Wald parable is itself survivorship-selected.
The memoranda are technical estimates of survival probability per hit; the famous red-dotted aircraft
was **drawn around 2005** for conference slides, and the quotable retort and resisting generals are
unsourced. The founding fable of survivorship bias survived because it was a good story.

## 5d. S-D returned — and it dismantled the entry I set out to write

The falsification condition in §2 was explicit: if the positional/non-positional split failed, the
entry was a slogan and would be cut. **It half-failed, and the replacement is better.**

**The decay is real and large.** McLean & Pontiff (2016, *JF* 71(1):5–32), 97 published predictors:
returns **26% lower out-of-sample** and **58% lower post-publication**. Roughly 42% survives — so
"once it is known it stops working" overshoots its own best evidence.

**But the mechanism is not knowledge diffusion, and three designs establish that:**

1. **Jacobs & Müller (2020, *JFE* 135(1):213–230)** — 241 anomalies across **39 markets**. The US
   replicates (60–65% post-publication decline); **none of the other 38 shows a reliable decline**.
   Journals are not national; arbitrage capital is. What diffuses is the *capacity to act*.
2. **Chen, Lopez-Lira & Zimmermann (2025)** — 29,000 data-mined predictors that were **never
   published** decay by about the same ~50%. Secret strategies decay like public ones.
3. **Ilmanen et al. (2021)** — adding a *pre-sample* window gives an unbiased arbitrage estimate:
   value **p = 0.76**, momentum **p = 0.70**. No detectable publication effect. (All five authors
   work for a factor-selling firm; disclosed on the page because it cuts in their favour.)

**Two nulls any saturation claim must beat first.** Psychology effects halve on plain replication
with zero diffusion — OSC (2015), **r 0.403 → 0.197**, 97% → 36% significant. And Allcott (2015,
*QJE* 130(3)), 111 RCTs over 8.6M households: effects fell **1.34% → 1.05%** purely because
programmes are deployed to their best sites first.

**The theory is sharper than the slogan.** Spence's endpoint for universal adoption is not collapse
but "stable prerequisites … that convey no information by virtue of their existence" — a compulsory,
resource-burning toll. And Grossman & Stiglitz (1980) proves an edge *cannot* decay to zero while it
is costly to acquire: an "equilibrium degree of disequilibrium." The best formal statement for a
**matching** market is Pathak & Sönmez (2008, *AER* 98(4)): sophisticated players' gains come
directly from naive players losing priority, and universal sophistication erases the edge.

**The result that breaks the folk version outright:** Wood & Quinn (2003, *Psych Bulletin* 129(1))
— forewarning moves people **toward** a message (d = +0.37), and warning of persuasive intent makes
it worse (d = +0.42). Resistance appears only under high involvement (d = −0.92) and vanishes when
involvement is low (d = −0.01) or attention is distracted. **"Everyone recognises that move now, so
it stopped working" is contradicted in exactly the low-involvement population of a dating app.**

**On my split:** positional holds (mating is demonstrably positional), but **cost of adoption** is
the better-supported variable and I had it third — promoted to the headline. Two additions I did
not have: capability doesn't decay *as capability*, but in a matching market equal improvement by
everyone leaves ranks unchanged, so "getting fitter never saturates" is **true about your life and
false about your rank**; and a **third category** exists — norms, reciprocity, consent conventions —
that get *more* valuable as they spread.

**The publishable absence:** nobody has ever measured a dating tactic decaying. A major site
analysed **500,000+ first messages** in 2009, published exactly which words drew replies, broadcast
it to millions — and never looked again. The perfect natural experiment was run and abandoned.

**Deliberately dropped:** Goodhart's Law (canonical sentence unverifiable against the 1975 primary,
and a large natural experiment on English hospital waiting targets found the targets simply worked);
the Lucas critique (its author called it a syllogism of "only occasional significance"; a later
literature found virtually no evidence for it); and the 44% banner-CTR figure (one person's
recollection, no instrumentation).

## 5e. Lab effects

- Swept population unchanged at **2408**; band regenerated with `--neighbors` and no `--baseline`.
- Adjudication unchanged: **0 credible / 516/516 weak** — the zero-headroom ratchet held again and
  no crossing needed hand-ruling, so no `--rule` was used.
- The Availability IDF pin moved **0.537 → 0.536**. Eight moves now, cumulative drift **0.003**
  against a minCredibleScore of 0.43. Recorded in the pin's comment history with that summary.
- **Two authored misreadings failed the denial-cue rule** on the word "false" and were reworded
  before the index was built — exactly the failure mode that flips an entry to *support* what it
  exists to reject. The programmatic check caught both.
- The Lab session's new guard (dd-05 / dd-28 pinned retained, claim-like and UNMAPPED) **did not
  fire**, as predicted — the advice layer reaches neither gap.

## 4. What this batch will not claim

- That saturation applies to capability. If the positional/non-positional split fails, the entry is cut.
- That popularity implies falsehood.
- That an absence of RCTs makes advice wrong. It makes it *unmeasured*, which is a different and
  more honest charge.
- Any transfer of the finance decay magnitudes to dating as if measured there. That bridge is a Lens.


---

# doctrine-bargaining-layer-01.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-bargaining-layer-01.md`

# Doctrine invention — The Bargaining Layer (batch 05)

**Date:** 2026-07-31 · **Lane:** Claude (Opus 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (37–39)
**Status:** CONCEPT FORMED, evidence pass in flight.
**Chains from:** batch 01 (`1e64df7`), 02 (`b08f6d3`), 03 (`01f5d61`), 04 (`545b7e9`).

---

## 0. Collision control and tree state

Staking: TOC group **"The bargaining layer"**, ids `#the-surplus`, `#outside-option`,
`#commitment-problem`. Tested claims renumber 37–39 → 40–42.

The blocking credible-line crossing was ruled ACCEPT by Jason at `b6de5a7` and the suite is
green. The `LE Lab Work` session has closed its docket and released the canon files.

## 1. The structural finding

| batch | what it modelled |
| --- | --- |
| 01 transaction layer | what participating costs |
| 02 population layer | who is in the pool, when they leave, what a snapshot licenses |
| 03 market container | the shape nobody chose — ratio and geography |
| 04 advice layer | the market for advice about all of the above |

Every one of those models **a participant facing a market**. None models **two people facing
each other**. The site has an exhaustive one-sided valuation apparatus — five levers, a
hierarchy, a matching curve, gates — and no model of two parties optimising simultaneously,
each with alternatives, each unable to make a promise the other has reason to believe.

Verified by grep across all 39 entries: `bargaining`, `outside option`, `commitment device`,
`credible threat`, `Schelling`, `Nash`, `preference falsification` — **zero as doctrine.**
The only hits are matchmaker prose and one passing use of "negotiation" in a Lexicon gloss.

This is the layer where batch 03 lands. The container sets what each person can get
elsewhere; **nothing has ever said what that does to the two of them.**

## 2. The three entries

### 37 · The Surplus — *The bargaining layer*

A pairing exists because it produces something neither person could produce alone —
economies of scale, insurance against shocks, specialisation, joint production of a
household and children, and consumption that is better shared than not.

**The move the entry makes: the SIZE of the surplus and the SPLIT of it are different
questions, and nearly every argument about relationships conflates them.** "What do men get
out of marriage" is a split question wearing a size question's clothes. A pairing can
produce an enormous surplus that is divided unfairly, or a meagre one divided evenly, and
those call for opposite responses.

The honest complication the scout is chasing: Becker's gains come from *specialisation*, so
they should fall as partners become more similar in market wages — and yet the couples who
have converged most (both graduates, both earning) marry more and divorce less. If the
classical account predicts the opposite of the observed pattern, the entry has to say what
replaced it rather than restate Becker.

### 38 · The Outside Option — *The bargaining layer*

**What each party could get elsewhere sets what they get inside — not contribution, not
fairness, not effort.** Improve someone's alternatives and their treatment improves without
anyone renegotiating anything out loud.

This is the most cynical claim in five batches and the scout brief was written to attack
it. It also has, on paper, the best natural experiments of any entry I have shipped: when
unilateral divorce made exit unilaterally available, what happened to violence and suicide
*inside* surviving marriages; when a child benefit was switched from the father's wallet to
the mother's purse, what happened to spending; when women's relative wages rose, what
happened to domestic violence.

**The counter that must ship in the body:** the finding that wives who out-earn their
husbands do *more* housework, not less — the direct opposite of what bargaining predicts.
If that survives scrutiny, the entry is a bounded claim about some margins rather than a
general law, and it should say so in its own headline.

**Expected honest limit:** this literature is about *households*, not dating. If there is no
dating-market analogue, the entry carries the transfer as ours and labelled.

### 39 · The Commitment Problem — *The bargaining layer*

**A promise that costs nothing to break carries no information and changes no behaviour.**
Schelling's mechanism is that commitment works by *destroying your own option to renege* —
which makes it the exact inverse of how commitment is usually discussed, as a feeling.

This is the Signal Cost Rule from batch 01 aimed at promises rather than claims, and it
closes the loop: batch 01 said a claim is worth what it costs to fake; this says a promise
is worth what it costs to break.

**The counter that has to be answered rather than dodged:** the same divorce reforms that
made exit cheap also reduced domestic violence and female suicide. Any entry mourning the
loss of binding commitment has to reckon with the fact that the binding was, measurably,
holding some people in danger. The entry should not be able to be read as nostalgia.

## 3. Method changes adopted from the register exchange

Two rules from the concurrent Lab session's measurement work, both earned tonight:

1. **Prefer a design where the probe is the control over one where the probe is the
   variable.** The synopsis-emptying test and the alias-remedy test both hold the probe
   constant and vary the index; both reproduced cleanly. The register census varied the
   probe and collapsed under replication. For this batch, that means: **do not run an
   ordinary-versus-analytic reachability census on the new entries.** Run the two designs
   that survived — synopsis-emptying, and alias-varying — before committing.
2. **Alias safety is about what the phrase NAMES, not how many words it has.** `just move`,
   `damaged goods`, `too many women` name the *claim*. `younger women`, `age` name the
   *population the claim is about*, and a phrase naming a population fires on every passage
   describing that population. Aliases for this batch are authored to name claims.

And one from my own hour of being wrong: **when a single case contradicts the pattern,
interrogate the case before rescuing the pattern.** `local-market` ran backwards in both
censuses because it was the one entry with discourse-register aliases, and I spent an hour
treating it as a counterexample instead of asking why it differed.

## 3b. OPERATIONAL RESUME STATE (written before a context compaction)

Everything needed to finish this batch without the preceding conversation.

**Tree:** `b6de5a7` pushed, in sync with origin, `npm run test:lab` green end to end.
Canon **491** concepts, Rules & Frameworks **44**, 39 `rf-entry` blocks on the page.

**In flight when compaction happened:** three Opus 5 scouts, one per entry —
S-G (the surplus: Becker, the modern replacement, what the surplus consists of),
S-H (outside options: Nash/separate-spheres, unilateral divorce, wallet-to-purse, Aizer,
and the Bertrand/Kamenica/Pan counter), S-I (commitment: Schelling, Wolfers on divorce
dynamics, specific investment, covenant marriage, and the violence/suicide counter).
Their briefs all demand exact citations, tier labels, "what this does NOT show", and
UNVERIFIED flags. **Independently re-check any load-bearing figure before publishing it —
that discipline has changed what shipped twice this session.**

**The batch pipeline, as run four times:**

1. Draft each entry as its own file in the session scratchpad, never straight into the page.
2. TOC edit first: add the new `toc-group` before the "Tested claims" group and renumber
   the three tested claims (currently 37–39 → 40–42).
3. Splice with PowerShell, inserting before the unique marker `      <!-- The Wall -->`:
   read with `[System.IO.File]::ReadAllText`, assert the marker occurs exactly once,
   `Replace(marker, entries + marker)`, write with `UTF8Encoding($false)`. Then assert
   CR count is 0 and the new ids are present. The file is LF despite the repo being CRLF.
4. Overlay: append entries to `data/canon-overlay.json` via a Node script keyed after the
   previous batch's last id. Check the diff is `N 0` (additive only).
5. **Validate misreadings programmatically before building**: 10–18 words, no
   `MISREADING_DENIAL_CUES` match, decisive frame. Two failed on the word "false" in
   batch 04; a misreading carrying a negator flips the entry to *support* what it rejects.
6. `node scripts/build-canon-index.mjs`, then move the four pins in
   `tests/canon-index-fixtures.mjs`: `conceptCount`, `Rules & Frameworks`, misreading
   count, boundary count. Pins move in the same commit as the doctrine.
7. `node tools/lab-threshold-sweep.mjs --neighbors tests/fixtures/threshold-neighbors.json`
   — **`--neighbors` and never `--baseline`** (a stale baseline once invented 130,120
   fictional crossings), and **never `--rule`** (it stamps ~4,699 unread rows).
8. Expect the Availability IDF pin in `tests/lab-analyzer.test.mjs` to drift by ~0.001.
   Extend its comment history rather than silently re-pinning. Eight moves so far,
   cumulative drift 0.003 against a `minCredibleScore` of 0.43.
9. Full-diff review before staging: enumerate every deletion in `frameworks.html` (should
   be only the renumbered TOC lines), and attribute changes **per entry** by regexing
   `rf-entry` blocks out of HEAD and the working tree — `git diff -U0` maps insertions to
   the *preceding* entry and will report your own new entries as changes to someone else's.
   The entry immediately before the insertion point always shows a ~30-char delta; that is
   the trailing HTML comment, not prose.
10. Commit message via `git commit -F <file>` — PowerShell here-strings mangle it.
11. Verify in the browser at `http://localhost:8753/frameworks.html` (preview_start name
    `static`): entry count, titles, dead anchors, entity leaks, TOC tail.

**If a credible-line crossing appears:** it is release-blocking and reserved for Jason.
Recording a verdict takes **two** edits — the ruling (`ruling`, `ruledBy`, `ruledAt`) and
`counts.pending` plus `counts.pendingByThreshold`, where the threshold key must be **set to
0, not removed** (removing it makes the assertion compare `undefined` to `0`).

**At-risk pair to watch:** `smv:looks:age` sits at exactly 0.430 against a 0.430 floor on
the Zhang fertility sentence, surviving only on `>=`. Canon growth alone does not threaten
it — three entries moved it 0.000 — but **topical vocabulary overlap does**. This batch is
about bargaining and commitment, so overlap is expected to be low; measure rather than
assume with `overlap-vs-growth.mjs`.

**Measurement designs to run before committing** (per §3): synopsis-emptying and
alias-varying only. Do **not** run an ordinary-versus-analytic reachability census — that
design was withdrawn by both sessions tonight because between-probe variance swamps it.

## 4. What this batch will not claim

- That the household-bargaining results transfer to dating without a labelled inference.
- That commitment devices are good on net, unless the violence and suicide findings can be
  answered rather than omitted.
- That Becker's specialisation account explains modern marriage, if the education gradient
  points the other way.

---

## 5. OUTCOME — what the evidence did to the three entries

All three shipped. **All three had their central claim changed by the evidence, and two were
inverted outright.** Four Opus 5 scouts ran; every load-bearing figure below was re-checked
against a primary source in the main loop before it reached the page.

### 37 · The Surplus — the thesis was understated, not wrong

The draft said the discourse conflates the SIZE of the surplus with its SPLIT. The literature
does something worse: it can measure the size and **has no coherent theory of the split**. The
leading sharing-rule estimate (0.65 to the wife) is disowned by its own authors as arising
"mechanically". So every "who gets the better deal" claim, from any direction, is unbacked
rather than contested.

Two inversions inside the entry:

- **Becker failed his own test, in his own table.** He predicted negative wage sorting; the 1967
  SEO sample gave **+.32** (whites) and **+.24** (blacks), and he wrote that this "is troublesome
  since the theory predicts a negative correlation." The rescue is *an unpublished memorandum
  extending some work of Gronau (1972)*, and his own sentence is "If his calculations hold up,
  this would be striking confirmation of my theory." Read directly from the NBER reprint,
  pp. 318–319 — not taken from the scout. **Verdict: unfalsifiable as stated, not refuted.**
- **The modern replacement's signature is missing.** College-graduate assortative mating FELL
  from 5× (1962) to 2× (2013); graduate degrees 8.4× → 3.1×. The rise is at the bottom.

The biggest measured component of the surplus turned out to be **insurance**, not specialisation
and not companionship — 63% of the buffer against a husband's permanent wage shock is the wife's
labour supply. And it is asymmetric, which turns a size fact into a split fact immediately.

### 38 · The Outside Option — two of the three drafted assertions did not survive

- **Cut: "not contribution, not fairness, not effort."** The literature rejects income *pooling*.
  It does not license the ranking. Gone from the headline.
- **Cut: the counter we came to publish.** The plan was to close on "wives who out-earn do more
  housework." The density cliff at 0.5 is refuted at Tier 1 — Finnish population registers,
  16.7M couple-years, **zero discontinuity among the 77.8% of couples who do not work together**,
  and a placebo of randomly matched coworkers reproduces it. The housework half is a
  functional-form artifact: let absolute earnings enter as a spline and the relative-earnings
  terms are a precise zero, **F(2,5058) = 0.10, p = 0.90** (verified in the PMC full text, not
  taken on report). What survives is a *rigidity* finding — men's housework is flat in the wage
  ratio — which is not the finding we meant to publish.
- **Also cut, in the other direction: the backlash story.** A fourth scout established that the
  male-backlash literature is thinner than its reputation: across 56 outcomes, **36% significantly
  protective, 2% significantly harmful, 63% null**. The famous Mexican result splits on a
  variable determined by the number and ages of eligible children, and its average effect is a
  null. The Swedish register result disarms itself — the author says it is partly care-seeking
  and absent in the most severe injuries.

What survived is narrower and better evidenced than expected: **Brassiolo (Spain 2005), ~30%
less conflict among couples who STAYED MARRIED** — the "without renegotiating out loud" clause,
measured. Plus the enforcement precondition, which is the entry's real contribution.

### 39 · The Commitment Problem — the central claim was false as drafted

"A promise that costs nothing to break carries no information" is the **babbling equilibrium of
Crawford–Sobel, not the theorem**. It is falsified directly by Lee & Niederle: 613 participants,
randomised endowment of *free* virtual roses, **+20% acceptance**, >+50% on downward offers.
The roses cost no money and were not irreversible — they were **scarce**. That is a third
category the draft had no room for: a budget-constrained signal.

Rewritten rule: *a signal carries information in proportion to what sending it forecloses.*
"Costless therefore worthless" is wrong; "unlimited therefore worthless" is close.

The entry now leads its third box with the number most unflattering to itself: offered a real,
costly, legally binding commitment contract at no charge, **98–99% of couples declined it**.
And the two large RCTs show you can raise marital happiness, lower distress and infidelity, and
**still not move whether couples stay together**.

## 6. PROCESS NOTES worth keeping

1. **The misreading gate caught a live one.** "…carries no information about what someone will
   do" tripped `no` and would have flipped the entry into SUPPORTING the claim it rejects.
   Validating programmatically before building is not ceremony.
2. **The shared tree moved underneath me mid-batch, again, and the derived file was the tell.**
   Two commits landed (`bf9909f`, `532fd09` — the other session ruled the inherited crossing) and
   the other session left uncommitted edits to **`js/lab-analyzer.js` and
   `tools/lab-threshold-sweep.mjs`**. I had already swept. Rebuilt the band in a detached
   worktree at HEAD with only my three source files copied in, so the sweep ran against the
   COMMITTED engine. Result: rulings, counts and every score **identical**; the sole difference
   was `"analyzer": "2.6.11"` vs `"2.6.10"` — their unreleased version string, which would have
   been stamped into my fixture. Took the committed-engine artifact.
   **Their short-unit penalty change moved 0 of 103,303 swept pairs** — worth telling them, and
   consistent with their own note that 13 of the 14 affected units were already claim-rejected.
3. **`cmp` disagreed with the summary line.** The sweep printed identical totals for both runs
   and the files still differed. Compare bytes, not banners.
4. **The at-risk pair moved the right way.** `smv:looks:age` went **0.430 → 0.432**, off the
   floor rather than through it. Bargaining vocabulary has low overlap with a fertility sentence,
   as predicted — and this time it was measured rather than assumed.
5. Splicing before `<!-- The Wall -->` rather than inside an entry meant **no ~30-char delta** on
   the preceding entry: 3 added, 0 removed, 0 existing entries touched.

## 7. The measurement §3 promised, run late

§3 said to run synopsis-emptying before committing. It was run **after** `c034013`, which
changes when it informs rather than whether it is valid. Probe held constant, index varied.

```
the-surplus          analytic MAPPED 0.782 rank 1 -> synopsis emptied: MAPPED 0.694 rank 1
outside-option       analytic MAPPED 0.540 rank 1 -> synopsis emptied: MAPPED 0.540 rank 1
commitment-problem   analytic MAPPED 0.772 rank 1 -> synopsis emptied: MAPPED 0.775 rank 1
```

**None of the three is synopsis-carried.** All survive at rank 1 on their own authored
aliases and phrases, which matters because synopsis rewriting is forbidden (refused at
`eb0f6cd`) — an entry that collapsed here would have had no permitted remedy. Carry the other
session's caveat with it: all three have 7 aliases, and on rich alias sets this probe looks
good regardless, so read this as **"not obviously synopsis-carried"** rather than "reachable".

**Ordinary register, and the honest count is 1 datum, not 3.**

```
the-surplus          ordinary  not reached (top: outside-option)
outside-option       ordinary  NO UNIT
commitment-problem   ordinary  NO UNIT
```

Only `the-surplus` is a reachability observation, and it lands on its own sibling rather than
itself. The other two produced **no claim unit at all** — the same non-comparable outcome I
nearly mis-published earlier tonight as `GATE-BINNED`. A bare conversational sentence of that
shape forms no unit, so it cannot answer a reachability question in either direction. Dropping
them is the rule from that mistake, not a convenience.

That is a fourth independent argument for the discourse-register corpus: **every one of this
batch's nine misreadings is an authored discourse-register surface, and there is no corpus in
which to check whether anyone phrases the claim that way.** Misreadings are the only surface on
the page that is *supposed* to be in the reader's register rather than ours, and it is the one
surface we cannot test.


---

# lab-hookup-transaction-layer.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-hookup-transaction-layer.md`

# LE Lab hookup — transaction layer (pass 01)

**Date:** 2026-07-31 · **Canon:** 479 → 485 · **Analyzer:** 2.6.10 · main-loop, no subagents
**Companion:** `md/doctrine-transaction-layer-01.md` §8 defined this pass. Threshold record:
`md/lab-hookup-threshold-adjudication.md`.

This is the separate pass the doctrine batch deferred. It did three things: measured what the
widened canon actually retrieves, **found and fixed a retrieval defect the batch introduced**,
and added the Lexicon vocabulary the six concepts were missing.

---

## 1. The headline: a reported gain that was mostly an artifact

Commit `b004842` claimed the batch's justifying result — that the archived AI-companion sources
(`13-wheatley-counterfeit-connections`, `14-common-sense-ai-companions`), which scored **zero**
against the whole canon at 470 concepts, now landed on `frameworks:substitution-layer` at
0.540–0.547. That was 153 credible-line gains and it was presented as the capability win.

Measuring capture *quality* rather than capture *count* showed what it really was:

```
frameworks:substitution-layer top-slot in 14-common-sense-ai-companions: 125 maps
distinct scores: 1  ->  0.540
margin over runner-up: median 0.226
```

**One score, 125 times.** A single multi-word alias — `"AI companion"` — was firing an exact
phrase hit at a fixed strength and winning by a wide margin over unrelated runners-up (*The
Clock*, *Attention*, *one-parent households*). Multi-word aliases land in the phrase surface,
and a phrase hit also forces **High** confidence, so every bare mention of the words "AI
companion" mapped at High to the Substitution Layer. Among the captures:

- "the suicide of 14-year-old Sewell Setzer III, who had developed an emotional attachment…"
- "a 19-year-old who was encouraged by an AI companion to kill the late Queen Elizabeth"
- "AI chatbots and companions – risks to children and young people"

Those are child-safety claims. The Substitution Layer is an economics claim, and its own prose
explicitly **declines** to make findings about AI companions ("a watch item, not a finding …
declines to publish a number"). The canon entry was therefore asserting coverage the page
disclaims — a false signal that the site has doctrine here when the honest state is that it
does not.

**Fix:** removed `"AI companion"` from `aliases` and `"AI girlfriend"` from `phrases`; added
claim-shaped phrases instead — `alternative to real partners`, `replace real relationships`,
`replacement for a real relationship`, `substitute for a partner`, `instead of a relationship`.
The match surface now targets the **claim** (substitution) rather than the **topic** (AI).

Result, verified by probe:

| Probe | Before | After |
| --- | --- | --- |
| "…AI companion apps are a good alternative to real partners if real partners are not available" | 0.547 (topic hit) | **0.610** (claim hit) |
| "Pornography acts as a substitute for a partner, which makes withdrawal easier to sustain" | mapped | **0.610** |
| "He stopped dating entirely and spends his evenings gaming instead of looking for a partner" | mapped | **0.508** |
| Wheatley source, total substitution captures | **143** | **1** — the one passage that makes a substitution claim |

The threshold sheet records the unwinding: **144 of 155 credible-line movements are
`frameworks:substitution-layer`**, 152 of them losses. The earlier "153 credible gains" and this
"152 credible losses" are very nearly the same set, which is the cleanest possible statement
that the gain was an artifact of one over-broad alias.

**Standing lesson.** Alias breadth buys capture count, and capture count is not coverage. Judge
a new entry's retrieval by score *variance* and *runner-up margin*, not by how many passages it
wins: a uniform score across dozens of captures is the signature of a topic magnet. This also
revises the earlier claim in `doctrine-transaction-layer-01.md` §6 — the C2 gap that Checkpoint
01 recorded is **still open**, and the Lab correctly reports it as open again.

## 2. Corpus coverage, 21 sources

Measured with the shipped analyzer against canon 485. Set-asides are excluded, as retrieval
never runs on them.

- **Population:** 2,404 retained claim units / 2,287 set aside (0.91:1).
- Sources 13 and 14 fall back to 15 and 7 mapped respectively — the honest post-fix number, and
  a live doctrine lead rather than a solved problem.
- Checkpoint-01 re-run: `02-fem-centrism` maps 10 of 20 claim units (was zero at 450 concepts,
  before the Operative Frame); `04-heteropessimism` maps 12 of 44 (was 1 of 28). Source 03
  (Gottman) is excluded from the corpus by recorded decision, so S2 was not re-run.

## 3. Gate-vocabulary check

Gated every corpus passage exactly as the analyzer does and inspected the **set-aside** side for
the three vocabulary families this batch introduced. Per governance, a systematic miss family is
a benchmark-append *proposal* requiring Jason + reviewer sign-off — never a quiet classifier
change. Findings:

| Family | Set-aside hits | Verdict |
| --- | --- | --- |
| search economics | **0** | No miss family. A clean null: the gate is not dropping search-cost vocabulary. |
| signal / verification | **2** | Not systematic. One is ACS gender-misreporting (correctly non-domain); one is mate-choice verification of status, arguably in-domain but isolated. |
| substitution | **34** | Dominated by 29 AI-pornography *consumption statistics* in Wheatley. |

**No benchmark append is proposed.** The substitution family is the only candidate, and the
honest reading is that a porn-viewing rate is a consumption statistic, not a relational claim —
the same call the checkpoint made when the gate correctly set aside 73% of Tomassi's law and
media material. Recorded here so the next pass can disagree with a stated reason rather than
rediscovering it.

## 4. Lexicon terms — the retrieval spine

Six terms added (`lexicon.html`, Shared section), one per new framework, chosen to add
*distinct* retrieval vocabulary rather than restate titles:

`Search cost` · `Costly signal` · `Network approval` · `The re-entry discount` ·
`Substitute good` · `The calibration error`

Each carries a `commonMisreading` and a `boundaryCondition` in the overlay, authored against the
measured contract (decisive frame · no `MISREADING_DENIAL_CUES` negator · 10–18 words). **All
six were verified to fire**, rather than assumed to:

| Term | Words | Self-hit | Stance | Score |
| --- | --- | --- | --- | --- |
| Search cost | 15 | ✓ | Contradicts | 0.828 |
| Costly signal | 13 | ✓ | Contradicts | 0.755 |
| Network approval | 14 | ✓ | Contradicts | 0.766 |
| The re-entry discount | 15 | ✓ | Contradicts | 0.751 |
| Substitute good | 13 | ✓ | Contradicts | 0.760 |
| The calibration error | 15 | ✓ | Contradicts | 0.766 |

6/6 self-hit at High, zero negation parity on every one.

## 5. Pins and provenance

Canon 479 → 485; Lexicon 84 → 90; misreadings 485; boundaries 479 — moved in the same commit.
The `lab-analyzer` Availability pin returned to **0.538** at 485: the six Lexicon terms and the
alias removal move IDF in opposite directions and it landed back where it started. Sixth round
trip on a number that has never been the assertion.

**A note on the frozen band.** It was regenerated while the Lab **v2.6.10** release was still in
flight in another session, so it records analyzer 2.6.10 against then-uncommitted code. That
release has since landed as `e02ddda`, and the full suite was re-run green against it before
this commit, so the band and the shipped analyzer agree. `SCORING_CONFIG_HASH` is unchanged
(`bt0a7p`) either side.

## 6. Still open

1. **C2 (AI companionship) is a live doctrine gap again**, correctly. The site has no entry that
   makes a claim about synthetic companionship, and the Lab now reports that instead of hiding
   it behind an alias.
2. Adjudication remains open across three sheets (transaction layer, review, hookup).
3. The other two new frameworks batches (population layer, market container) have had no
   equivalent capture-quality audit. `frameworks:clearing-order` taking a regression equation
   ("where H is husband's education…") at 0.556 and a chart axis label ("Never Married Previously
   Married Married 100") at 0.540 suggests the same audit would be worth running there.


---

# lab-retention-reachability.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-retention-reachability.md`

# The retention gap, measured: one artifact closed, two open, and they are different problems

2026-07-31. No canon change. One guard in `tests/lab-match-behavior.test.mjs`,
one record. The planned finding was wrong on its first leg and the measurement
is the useful part.

`md/claude-doctrine-checkpoint-01.md` recorded the retention gap as the site's
biggest structural hole and proved it with three artifacts inside this repo,
"three independent pieces of evidence that the site already knows". None had
ever been measured. Measured now, against canon `1.0.0+7a8b16547d89` at 488
concepts and all 21 archived sources (2,515 retained segments), they do not say
the same thing any more.

Every figure below was taken twice: first at canon 479 and again at 488 after a
concurrent session landed two batches mid-run. **Not one conclusion moved** —
the largest drift on any published number was 0.001, and the RED check
reproduced exactly. A finding that survives nine new concepts is a different
kind of claim from one measured once, so the second pass is stated rather than
quietly substituted.

## Artifact 1 — CLOSED, and nobody had noticed

> `js/lab-analyzer.js` ships a severity-3 tension `selection-retention-collapse`
> whose evidence field names exactly what the canon would need. The Lab detects
> the collapse and has no rung to route it to.

It has six rungs now. The retention doctrine merge shipped
`frameworks:retention-gap`, `replaceability-asymmetry`,
`mate-retention-intensity`, `desire-maintenance-split`, `satisfaction-flywheel`
alongside the pre-existing `conversion-ladder`. The tension fired once across
the archive and routed to `frameworks:mate-retention-intensity` at 0.575 —
correctly, on a Conroy-Beam passage about mate preference fulfilment and
retention behaviour.

**The checkpoint was never updated, so a gap read as open for a month after it
was filled.** A frozen epoch is the right instrument for an analysis and the
wrong one for a status; the epoch stays frozen and this record is where the
status lives.

## The tension is structurally blind, and it does not matter

`pressureForResult` opens `const primary = result.matches[0]; if (!primary)
return [];`. A tension only fires on a MAPPED passage, so
`selection-retention-collapse` can report the collapse only where the canon
already reached — it is blind by construction to the passages that *constitute*
the gap it names.

That is true and it is not load-bearing:

```
passages whose TEXT satisfies the tension's own predicate, 2,515 retained
  selection-retention-collapse    mapped  1  ·  UNMAPPED  4
  attraction-selection-collapse   mapped 39  ·  UNMAPPED 17
```

All four counts are identical at 479 concepts and at 488.

Five passages in the whole archive, and the four invisible ones were read:
a woman who dated before marrying, a survey variable definition, an
experimental protocol, a historical periodisation. **All four are false
triggers** on ordinary uses of `date` / `chosen` / `pair` beside `marriage`.
The blindness ratio is no worse than the sibling tension's. Building anything
for a population of four false positives would be building for a population
that does not exist. **Closed with a record, not fixed.**

The predicate was extracted from `js/lab-analyzer.js` **as source text** rather
than retyped, and the extractor asserts it found exactly two halves — a hand
copy beside a thing is this project's recurring silent-omission defect.

## Artifacts 2 and 3 — both open, and they are not one finding

The benchmark labels both `direct-domain` / `retain`: the acceptance contract
asserts this territory is in-domain canon material. Both are retained by the
gate, both are claim-like, and neither maps.

```
dd-05  "Physical attraction fades in a long relationship unless it is renewed
        by shared novelty."
       unmapped · band 10 · nearest 0.410 hierarchy:…:alignment-in-values
       64 candidates above the floor, and NOT ONE of the six retention entries
       reaches the working set of eight

dd-28  "The best predictor of a lasting marriage is how the couple handles
        contempt."
       unmapped · band 1 · nearest 0.278 hierarchy:…:provision-capacity
       17 candidates; best retention entry satisfaction-flywheel at 0.232,
       under the weak floor
```

**dd-05 is a RETRIEVAL failure.** `frameworks:desire-maintenance-split` is
exactly this claim's home — one of its own misreadings is *"Desire declines with
familiarity, and that is one settled finding"* — and it does not reach the top
eight of sixty-one. The entry speaks `desire decline` / `sexual desire decline`;
the claim says `attraction fades` … `renewed by shared novelty`. Disjoint,
synonym for synonym. The doctrine is present and unreachable.

**dd-28 is a DOCTRINE gap.** Nothing in the canon is about conflict repair or
contempt; the nearest concept in 479 is about provision capacity, which is a
claim about money. Checkpoint 01 already ruled on the difficulty — C1a's
empirical recurrence is one research program (the Gottman lab), so the accuracy
critique must ship inside any future entry — and that ruling stands untouched.

Both cases are unchanged at 488 concepts, including the shape of the failure:
dd-05 still has no retention entry anywhere in its working set of eight, and
dd-28's only retention neighbour is still `satisfaction-flywheel` at 0.232.

**Bundling these two as one gap is what made the gap look unfixable.** One is
tranche work and costs an afternoon; the other needs doctrine Jason has not
scoped.

## Measured: one authored misreading closes dd-05

RED-checking the guard required proving its condition is reachable. Adding a
single `commonMisreading` to `frameworks:desire-maintenance-split`, authored
against the three measured rules (10–18 words, decisive frame, no
`MISREADING_DENIAL_CUES` negator) and carrying dd-05's own vocabulary rather
than the entry's research register:

> Attraction always fades in a long relationship, so couples who want desire
> must keep chasing novelty.

```
             before                                    after
  dd-05      unmapped, best 0.410 to alignment-in-values
             ->  MAPPED 0.486 frameworks:desire-maintenance-split
  dd-28      unmapped, best 0.279                       unchanged
```

Exactly the split the diagnosis predicts: the retrieval gap closes on a match
surface, the doctrine gap does not move.

**NOT SHIPPED**, and the reason changed during the run. It began as "a
concurrent session holds `data/canon-overlay.json`". A window opened, item 2's
face/age surfaces went in at `8232ed5` — and then measuring this one for COST
rather than reach gave it a better reason to wait. See §7.

## 7. Measured for cost, and stopped one step short

Reach is not shippability. The face/age pass rejected nine of eleven candidates
on cost alone, so this one was put through the same instrument: displayed
credible **and** displayed weak across all 21 sources.

**The first draft is the one §6 quotes, and it should not ship.**

```
"Attraction always fades in a long relationship, so couples who want desire
 must keep chasing novelty."
      credible  +1 / -1        weak  +13 / -11        dd-05 MAPPED 0.484
```

Its credible GAIN is *"Despite what people desire in a mate, they cannot always
get what they want"* — the word `desire` in the wanting-a-partner sense, not the
sexual-desire sense the entry is about. A sense error, and the same family as
every alias the face/age pass rejected.

**The second draft removes the ambiguous token and is materially better:**

> Attraction fades once a couple gets comfortable, so a long relationship needs
> constant novelty to stay alive.

```
      credible  +0 / -1        weak  +11 / -10        dd-05 MAPPED 0.484
```

Same reach, no wrong credible gain, and it picks up a genuinely right nearby
concept the first draft did not: *"the frequency with which a couple has sex
declines markedly over time in most long-term relationships"* → 0.357. That
sentence is the entry's subject stated plainly.

**Dropping the bare word `desire` from a misreading on the
desire-maintenance entry is what fixed it** — the same rule the face/age
survivors demonstrated, applied to a token instead of a register: write the
claim in the words the claim is made in, and avoid a token whose ordinary sense
lives in the same domain as the concept.

**Why it still does not ship.** Its one credible LOSS is *"We predicted that
mate retention behaviors would be positively related to relationship
satisfaction"* at 0.431 — arguably a correct loss, since that sentence belongs to
`frameworks:mate-retention-intensity` rather than here. But a `minCredibleScore`
loss is a **blocking crossing** by standing rule, with no volume exception, and
HEAD already carries one unruled crossing from `8232ed5` waiting on Jason.
Stacking a second blocking verdict on an unruled first one is not a measurement
problem, it is a scope problem — and the loop's stop condition is exactly *"needs
scope only Jason has"*.

So this closes as **measured, drafted, and one ruling away**. Apply the second
draft to `frameworks:desire-maintenance-split` in `data/canon-overlay.json`,
rebuild, sweep, and adjudicate the single expected credible loss. `conceptCount`
does not move; the entry already carries two misreadings, so no fixture pin
moves either.

Reproduce: `dd05-cost.mjs`.

## 8. SHIPPED — dd-05 is closed, canon `1.0.0+dbc262abfc7e`

Jason ruled the face crossing ACCEPT at `b6de5a7`, which was the ruling this was
waiting behind. The second draft went in unchanged, 491 concepts both sides, no
fixture pin moved.

```
dd-05   unmapped, best 0.410 to the wrong entry
   ->   MAPPED 0.484  frameworks:desire-maintenance-split
dd-28   unchanged, and still the doctrine half
```

**The credible-line crossing this produced is a LOSS and it is the right one.**

```
frameworks:desire-maintenance-split   0.431 -> 0.429
"We predicted that mate retention behaviors would be positively related to
 relationship satisfaction."
displayed now: mate-retention-intensity@0.643 · satisfaction-flywheel@0.457
```

That sentence is about mate retention behaviour, and `mate-retention-intensity`
holds it at **0.643** — far above the entry that let go of it. A marginal second
match leaving while the correct home sits 0.21 above it is the matcher getting
*more* right, not less. Recommended ACCEPT, and left PENDING until ruled, because
that line is Jason's by standing rule and nothing here carries a machine verdict
on it.

> **RULED ACCEPT 2026-07-31 by Jason, in session.** Stamped by key with
> `ruledBy: Jason`, no `--rule`. `minCredibleScore` PENDING goes 1 → 0, the weak
> ratchet stays at exactly 516/516, and the candidate-floor census is untouched at
> 4,725. The suite is green.
>
> Recorded as the two edits it is (see `md/lab-face-age-adjudication.md`):
> `counts.pendingByThreshold.minCredibleScore` set to **`0`** rather than deleted —
> a deleted key compares `undefined` against a counted `0` and fails with
> *"recorded PENDING count … disagrees with the rulings"*, which reads like the
> ruling did not take rather than like a missing key — and `counts.pending`
> brought down 5242 → 5241 with it, or test 1 fails on internal consistency.
>
> **What the verdict settles, beyond this row.** This is the first credible-line
> crossing ruled where the recommendation was to accept a **loss**. The precedent
> it sets is that the blocking line asks whether the *displayed set* got better,
> not whether it got larger: a match may leave the credible band and the change
> still be right, when a better-ranked entry already holds the sentence. The
> instrument that makes that checkable is the displayed diff through
> `analyzeDocument`, never the crossing count out of the sweep.

Eleven `minWeakScore` crossings, all on the edited entry, ruled by key with
`ruledBy: Claude` — **5 ACCEPT / 6 REJECT**, and the weak backlog held at exactly
516. The six REJECTs are honest and worth stating rather than absorbing:

- four are gains on **methods and affect prose** — sample-inclusion criteria, the
  role of anger, positive affect predicting intactness, Gottman on affect. The
  misreading contributed `couple` / `relationship` / `long`, and those fire on any
  longitudinal-couples paper.
- two are **losses of correct neighbours** — satisfaction predicting changes in
  couples' sexual frequency, and sexual satisfaction predicting marital
  satisfaction. Both are this entry's own subject, both dropped 0.002 out of the
  band. Costed and recorded rather than waved through.

Ratio: 6 of 11 wrong, against the face/age patch's 6 of 15. **This is the more
expensive of the two surfaces**, and it bought a documented gap closure the site's
own acceptance contract had been asserting since Checkpoint 01.

The guard in `tests/lab-match-behavior.test.mjs` now asserts dd-05 **maps, and
maps to the entry the surface was authored on** — mapping to the wrong home is a
different outcome from mapping. RED-verified by removing the misreading from
`data/canon-overlay.json` and rebuilding:

> dd-05 no longer maps. The match surface on
> `frameworks:desire-maintenance-split` is what closed this gap; losing it
> reopens the retrieval half of the retention gap.

dd-28 keeps its original assertion with a sharper failure message: it is the
doctrine half, so its closing means doctrine landed.

Reproduce: `dd05-cost.mjs` · `read-crossings.mjs` · `rule-weak-dd05.mjs`.

The canon was mutated **in memory** for this check. That is legitimate here and
would not be for `tests/canon-index-fixtures.mjs`, which calls
`buildCanonIndex()` and never reads `data/le-canon-index.json` — patching the
artifact there certifies a guard that was never exercised. The analyzer
genuinely consumes the artifact, so an in-memory patch of it runs the real load
path through `prepareCanonIndex` → `normalizeEntry`.

## The guard

`tests/lab-match-behavior.test.mjs` freezes the split so a later pass cannot
move it silently: the six retention entries must stay in the canon (artifact 1
cannot silently reopen), and dd-05 / dd-28 must stay retained, claim-like and
unmapped. It asserts the CONDITION, not the scores, and reads both sentences out
of the domain benchmark rather than copying them, because they are the
acceptance contract's own text.

Asserting the condition rather than the numbers is what let this survive the
canon moving 479 → 488 underneath it mid-run without a single edit.

Either case mapping fails the suite with the instruction rather than a number:

> dd-05 now MAPS, to … That is a retention gap closing and it is good news —
> record which of the two it was (dd-05 is retrieval, dd-28 is doctrine) and
> update this assertion to name the case that is still open.

## A rig disagreed with the engine, and the rig was the bug

The first census keyed on the tension's `id` and reported **0 firings** while
its own table printed **1** on the line above. `pressureTests[].failureMode`
publishes the tension's TITLE; the id never reaches the payload. Had the table
not been printed beside it, "the retention tension has never fired" would have
gone into this document as a headline finding — and the whole of artifact 1's
closure would have been missed.

## Reproducing

```
retention-reach.mjs    tension firings by failure mode, 21 sources; dd-05/dd-28
                       out of a whole-document analyzeDocument
retention-blind.mjs    the population the tension cannot see, predicate read out
                       of js/lab-analyzer.js as source text
retention-red.mjs      the in-memory canon patch and the dd-05 closure
```


---

# lab-face-age-match-surface.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-face-age-match-surface.md`

# face and age: eight candidate surfaces, six rejected by measurement, two ready

2026-07-31. Measured against canon `1.0.0+7a8b16547d89` at 488 concepts and all
21 archived sources (2,408 claim-like passages, 1,253 displayed credible
matches). **Not applied** — see §7.

`md/lab-generic-title-aliases.md` closed the alias list with `face` and `age`
recorded as *"dead, and it COSTS — needs a match surface, not an alias"*, and
left that surface unwritten because it is doctrine authoring and a different
decision. This is that pass, and six of the eight things it tried do not ship.

## 1. The rule the survivors have in common

Eight components were built and measured **one at a time** across the whole
archive — causation by variants, not by reasoning per token.

```
component                              archive      probe effect
face misreading 1  (jawline)            +0 / -0     BOTH probes DOWN (0.478->0.476, 0.425->0.422)
face misreading 2  (snap read)          +0 / -0     0.478->0.549 · weak 0.425 -> MAPPED 0.503
face alias  facial attractiveness       +1 / -1     0.555 / 0.519
face alias  attractive face             +0 / -0     nothing at all
age  misreading 1  (younger outranks)   +1 / -1     0.581->0.702, one probe to weak
age  misreading 2  (prices her)         +0 / -0     0.581->0.632
age  alias  younger women               +1 / -0     unreached -> MAPPED 0.540
age  alias  peak age                    +0 / -0     nothing at all
```

**Ships: face misreading 2 and age misreading 2.** Both are free on the archive
and both move the concept. Every other component either costs a correct match,
buys a wrong one, or does nothing.

The two survivors have one property in common and it is the transferable rule:
they are written in the ORDINARY REGISTER OF THE CLAIM, not in the entry's own
vocabulary. `smv:looks:age`'s synopsis says *"Looks are time-stamped… where the
Clock multiplier bites"*; the survivor says *"Men date younger women because a
woman's age is the only number that prices her in the market."* The entry could
already be reached by anyone who wrote in its register. What it could not reach
was anyone writing the claim the way the claim is actually made.

## 2. `younger women` fails the fourth way, and that is a new finding

The generic-title ruling named a fourth failure shape: `age` is not a homonym,
it means exactly what the concept is about, and it still cannot carry it because
in quantitative social science it is the axis every dataset breaks out.

**Making a phrase out of the word does not fix it.** `younger women` is
unambiguous, multi-word, clears every length floor, and is the canonical subject
of the literature. Its one archive gain:

> "Younger women who have used dating sites or apps stand out for experiencing
> unwanted behaviors on these platforms." → `smv:looks:age` @ 0.540

That is a harassment prevalence statistic. `younger women` is the population
being *described*, not the claim being *made* — the identical defect one level
up from the word. One gain, one wrong, which is the same ratio as the 75 the
typing pass produced.

**Ask what a token's presence SIGNALS, not just what it means — and note that
the signal does not improve by lengthening the token.**

## 3. What `facial attractiveness` actually did

`+1 / -1`, and both are the **same sentence**:

> "Men allocated more mate dollars to physical attractiveness than women did…"
> `M-TBD-15` @ 0.450 → `M-TBD-6` @ 0.450

Neither is `smv:looks:face`. Adding the alias shifted IDF enough to swap which of
two Mythbuster entries a reader is shown, at an identical score, on a claim the
alias has nothing to do with. A lateral displacement that buys nothing and
changes a reader's answer is worse than no effect, and a `+1/-1` line in a
summary would have read as neutral.

`attractive face` is simply inert: zero archive movement and zero probe movement.
It was measured rather than assumed, because inert curation is this project's
most repeated defect.

## 4. `smv:looks:age` has exactly one unit of IDF headroom

Its single genuinely correct archive match sits **on** the line:

> "First, because fertility declines faster with age and requires a larger
> physiological cost for women than men, men are hypothesized to show stronger
> preferences for physical characteristics…" → `smv:looks:age` @ **0.430**

`minCredibleScore` is 0.430. Every third misreading tried — age misreading 1,
round-2 candidates A3 and A4 — dropped it below the line, because a misreading
raises the entry's `canonCoverage` denominator. A3 was the most tempting of the
three (it took a probe 0.581 → 0.786) and it still costs this sentence.

**One misreading on this entry is free; two are not.** Anyone extending
`smv:looks:age` later should check this sentence first — it is the canary.

> **CORRECTION, same day, and it sharpens the recommendation rather than
> withdrawing it.** The paragraph above says "@ 0.430" without saying which canon
> that was measured on, and the two numbers in play differ by exactly the thing
> being measured. Measured to four places:
>
> ```
> BASE                        displayed 0.4320   margin over the line  0.0020
> + face misreading           displayed 0.4320   margin               0.0020
> + face AND age  (SHIPS)     displayed 0.4300   margin               0.0000
> ```
>
> So the shipping pair is free on displayed matches **and it spends the entire
> margin doing it**. The match survives only because admission compares `>=`. The
> `+0 / -0` line in §1 is true and it is true on a knife edge, which a count
> cannot show — this is the same lesson as §3 from the other direction.
>
> **The recommendation does not change** (nothing else measured is cheaper, and a
> 0.002 margin was never a safety property) **but whoever applies it inherits a
> zero-margin pair.** ~~The next canon growth of any kind takes this sentence
> under the line, including the concurrent session's own next batch.~~ When it
> goes under, that is a real `minCredibleScore` loss and not noise, and by
> standing rule it is release-blocking and Jason's to rule.
>
> > **CORRECTION 2026-07-31, contested by the concurrent session and they are
> > right. "Any canon growth" is the wrong variable.** Their advice-layer batch
> > WAS canon growth — 488 → 491 — and it cost this pair **0.0000**. Verified
> > independently here, same analyzer build with the canon index as the only
> > variable:
> >
> > ```
> > 1fc6553  canon 488, before their advice layer    0.4320   margin 0.0020
> > 545b7e9  canon 491, after it, before mine        0.4320   margin 0.0020
> > HEAD     canon 491, after my two misreadings     0.4300   margin 0.0000
> > ```
> >
> > Three new entries moved it by nothing; two misreadings ON THE ENTRY ITSELF
> > moved it by everything available. **The threat is topical vocabulary overlap
> > plus entry-level edits, not headline `conceptCount`** — their entries were
> > about saturation, survivorship and virality and share almost no tokens with
> > fertility/youth/attractiveness, so they moved the IDF denominators this pair
> > depends on not at all. A batch about age, looks, fertility or the Wall would
> > be a completely different proposition.
> >
> > This matters because the wrong rule makes future authors defensive about the
> > wrong thing. **Check topical overlap with the at-risk pair, not the concept
> > count.** It is also the same asymmetry §4 already describes from the other
> > side: a misreading raises the entry's OWN `canonCoverage` denominator and hits
> > it directly, while canon growth dilutes IDF globally and barely touches any
> > single pair.
> >
> > They also pulled the real archived sentence rather than a paraphrase and
> > confirmed 0.430 exactly, having first reported 0.444 off a reconstruction and
> > withdrawn it. Worth copying: when a number is quoted from an elided sentence,
> > go and get the sentence.
>
> The frozen band pins the same pair at **0.432**, not 0.430, and that is not a
> discrepancy: `tools/lab-threshold-sweep.mjs` dumps `scoreEntry().score` and is
> retrieval-only by design — no bounded context, no display caps — so the two
> instruments measure different quantities and neither is the other's check. It
> does mean the pair sits inside the ±0.03 band and **the existing blocking
> machinery already guards it**, so this needs no new guard. That is the whole
> follow-on: nothing to change.

## 5. Rejected in round 2 as well

```
age A3  "Men prefer younger women, so a woman's market value falls every year
         while a man's keeps climbing."          +0 / -1   the fertility sentence
age A4  "A woman past thirty has spent her best years, so men will choose a
         younger woman instead."                 +0 / -1   same loss, buys nothing
face F3 "A weak jaw gets a man rejected on sight, whatever else women want
         from him."                              +1 / -1   see below
```

F3's gain is the same Li sentence the `facial attractiveness` alias reached —
*"Men wanted to know first that a woman was at least average on physical
attractiveness"* — and it displaces `hierarchy:a-generic-male` @ 0.467 through
`maxMatchesPerClaim`. That sentence is about physical attractiveness as a
whole, which is the parent lever, not the face. **A wrong gain that evicts a
right match loses on both axes**, which is exactly what the typing pass measured
at +75 / −2.

## 6. What stays open, stated rather than papered over

The ordinary phrasing **"Men prefer younger women, and the gap widens as the man
gets older"** is STILL not reached, before or after. The only component that
reached it was the `younger women` alias, at 0.540, and that alias buys the Pew
harassment false positive. So this pass narrows the gap for the entry's own
register and does not close it for the market register.

That is not a failure of the surface. It is the fourth failure shape being
load-bearing: to reach that sentence you have to match on `younger women`, and
matching on `younger women` is what goes wrong.

Correction to the record this pass inherited: `tests/lab-match-behavior.test.mjs`
says `face` and `age` were *"measured at weak 0.369 and not-reached respectively
on probes that plainly make the claim."* Measured here, `smv:looks:age` reaches
**0.581 displayed** on *"Her looks are time-stamped: a woman's dating value falls
with age while a man's rises with money and status"* — a probe that plainly makes
the claim. **The failure is register-specific, not absolute**, and the earlier
record's "not reached" is too strong for the concept even though it was true of
its probe.

## 7. APPLIED — 2026-07-31, canon `1.0.0+07fb1c92bac5`

> **Status update, same day.** §7 was written as NOT APPLIED because a
> concurrent session held the canon files. A window opened after their
> advice-layer batch landed and the patch went in: both misreadings re-verified
> free at canon 491 first (`+0 / -0` displayed credible, 1,254 both sides), then
> applied, rebuilt, swept and adjudicated. `tests/canon-index-fixtures.mjs`
> needed no change, as predicted — 491 concepts and unchanged misreading and
> boundary counts, because this is a surface edit inside existing entries.
>
> Adjudication is its own record: `md/lab-face-age-adjudication.md`. Headline —
> 93 crossings, **1 minCredibleScore left PENDING for Jason** (release-blocking,
> the suite is red until he rules), 15 minWeakScore ruled by me 9 ACCEPT / 6
> REJECT, 77 candidate-floor census. `WEAK_BACKLOG_CEILING` held at exactly 516.
>
> **And the displayed weak band moved +2 / −4, not +15.** I read the sweep's 15
> weak crossings as a display effect, concluded the change cost more than it
> bought, and reverted it — before remembering that the sweep is retrieval-only
> and re-measuring `weakMatches` through `analyzeDocument`. Both gains are
> lateral swaps at near-identical scores. The original §7 text is kept below.

## 7 (as written before the window opened) — NOT APPLIED, the two-line patch, ready

A concurrent session held `data/canon-overlay.json`, `data/le-canon-index.json`,
`tests/canon-index-fixtures.mjs` and `tests/fixtures/threshold-neighbors.json`
for effectively all of this run, across four doctrine batches. Jason's standing
ruling for the run is that I do not operate on their files, so the measurement
landed and the edit did not. The window opened once, between their
market-container and advice-layer batches, and closed while the archive sweep
was still running.

Apply to `data/canon-overlay.json`, appending one string to each entry's existing
`commonMisreadings`:

```jsonc
"smv:looks:face": {
  "commonMisreadings": [
    "An average face is a plain forgettable face, so averageness makes women reject a man.",
    "Men reject a woman on her face in the first second, and that snap read holds forever."
  ]
}

"smv:looks:age": {
  "commonMisreadings": [
    "Women peak at twenty-two and hit a wall, so after that age men stop wanting them.",
    "Men date younger women because a woman's age is the only number that prices her in the market."
  ]
}
```

No `boundaryConditions` — both entries already carry two and the tranche rule is
one per entry, not two. No aliases: all four measured candidates were rejected
above.

**What the pins do:** `conceptCount` stays 488, and both entries already carry a
misreading and two boundaries, so `tests/canon-index-fixtures.mjs` needs **no
change at all** — this is a surface edit inside existing entries, not a merge.
Rebuild the index, regenerate the band with `--neighbors` and **no** `--baseline`,
and adjudicate: at +0/-0 displayed there should be nothing at the credible line,
but the entry token sets move so weak and candidate-floor crossings are expected,
and `WEAK_BACKLOG_CEILING` is at 516 of 516 with zero headroom.

Both strings were checked against the three measured rules before being
proposed: 10–18 words, one sentence, a decisive frame (`cross-sex-selection` on
both — `Men reject a woman`, `Men date younger women`), and no
`MISREADING_DENIAL_CUES` negator. The pinned negative controls
(`Men who are rejected early face a longer wait…`, `Responses to the dating
survey varied by income, age and education…`) were re-run against every variant
and neither ever mapped.

## Reproducing

```
face-age-variants.mjs   the seven package-level variants, probes + controls
age-why.mjs             why the age null result was the PROBES, not the surface
face-age-archive.mjs    displayed credible matches, 21 sources, every gain read
face-age-bisect.mjs     the eight components one at a time — the table in §1
face-age-round2.mjs     the three round-2 candidates, all rejected
age-canary.mjs          the fertility sentence's margin, to four places
```

`age-why.mjs` is worth keeping as the method: the first probe set returned "not
reached" for `age` under **every** variant, which looks like a dead surface and
was a dead PROBE. One probe said *"women who are younger"* where the alias was
`younger women` — a phrase hit needs the exact word ORDER, not merely the exact
inflection, which is the morphology trap with a new face. **Before believing a
null result, check that the probe can see the change.**


---

# lab-synopsis-register.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/lab-synopsis-register.md`

# The canon is reachable by people who already think like the site

2026-07-31. Measured, not fixed — the fix is not mine to choose and one of the
obvious ones is prohibited. Canon `1.0.0+07fb1c92bac5`, 491 concepts.

Downstream of `md/lab-face-age-match-surface.md`, which found that a
`commonMisreading` written in the entry's own vocabulary buys nothing because
anyone writing in that register could already reach the entry. The concurrent
doctrine session asked the obvious next question about the surface an author does
**not** choose the register of:

> the SYNOPSIS is harvested from my page prose, which is relentlessly analytic —
> "the terms of trade are set by whichever side is scarcer" is not how anyone
> states that claim in the wild. If the synopsis carries retrieval weight, every
> entry I have written is reachable by people who already think like the page and
> invisible to people making the actual claim.

**The mechanism half of the answer is yes and holds up. The outcome half does
not, and is withdrawn.** Read §4a and then §4c before quoting anything in §1: the
synopsis-emptying result reproduced independently across nine entries, and the
ordinary-versus-analytic table below turned out to be three probe *pairs* rather
than a fact about three entries. Six ordinary-register sentences about one claim
span *not reached* to *rank 1 at 0.540* against an unchanged index.

## 1. The outcome: same claim, two registers

Three matched pairs, authored against their three newest entries — each pair
states one claim twice, once as someone would say it and once as the page says it.

```
frameworks:saturation-rule
  ordinary   not reached
  analytic   MAPPED 0.647  rank 1
frameworks:survivorship-channel
  ordinary   MAPPED 0.472  rank 1
  analytic   MAPPED 0.654  rank 1
frameworks:virality-filter
  ordinary   not reached
  analytic   MAPPED 0.765  rank 1
```

Every analytic probe maps at **rank 1** and clears the credible line by a wide
margin. Two of three ordinary probes do not reach the entry **at all**.

The ordinary probes are not strawmen. *"Every trick from those dating books
stopped working once every guy on the app started using it"* is the saturation
claim, stated the way it is actually made; it lands on a
`the-wine-at-my-place-move` sub-entry instead. *"The dating takes that blow up
online are the angriest ones, not the ones that turn out to be true"* is the
virality claim; it reaches a Mythbuster entry instead.

## 2. The mechanism: emptying the synopsis, and it is not uniform

Same probes, with `synopsis` emptied on those three entries only:

```
                             analytic probe        ordinary probe
saturation-rule     0.647 → 0.624  (−0.023)      unreached → unreached
survivorship-channel 0.654 → weak 0.419          0.472 → weak 0.379
virality-filter     0.765 → NOT REACHED          unreached → unreached
```

**For two of three the synopsis is the load-bearing surface**; virality-filter
collapses from a 0.765 rank-1 match to nothing without it, and survivorship-channel
falls out of credible entirely. **For saturation-rule it is not** — that entry
loses 0.023 and holds, because its six aliases (`alpha decay`,
`post-publication decay`, `limits to arbitrage`, `signal saturation`…) carry it.

So "the synopsis dominates" is true of most entries and not all, and the
difference is whether the author gave the entry a rich alias set. State it that
way rather than as a universal.

## 3. The control, which is the part that stings

`smv:looks:age`, the entry this run gave an ordinary-register misreading to
three commits ago:

```
  ordinary   "Men prefer younger women and a woman past thirty has a much
              harder time on the apps."               NOT REACHED
  analytic   "Looks are time-stamped, so the Clock multiplier discounts a
              woman's looks score with age."          MAPPED 0.731  rank 1
```

**One authored misreading moved a specific phrasing across the line and did not
move the register asymmetry at all.** `md/lab-face-age-match-surface.md` §6
already recorded that the market-register phrasing stays unreached; this says
why, and says it is structural rather than a gap in that one entry.

## 4. What this is NOT licence to do

**Rewriting synopses in ordinary register is prohibited**, and not incidentally —
the synopsis is harvested from the live page, so "fix the synopsis" is *rewording
a site page so a lexical matcher scores better*. `eb0f6cd` refused that and
everything since has too. The page's register is the site's voice and it is
correct for a reader; the matcher's difficulty with it is the matcher's problem.

The permitted remedy is the one the tranches already use: **authored surfaces** —
`commonMisreadings` and aliases, which exist precisely to say what the claim looks
like in the wild without touching the prose. This measurement says the current
dose is too small: one misreading per entry, authored to a 10–18 word bound,
against a synopsis of 40–60 words harvested from analytic prose.

Two directions that follow, neither of them costed here:

- **More authored surface per entry, not better authored surface.** The
  face/age pass found `smv:looks:age` has zero IDF headroom for a second
  misreading, so "add three misreadings to every entry" has a measured cost and
  is not free. This needs its own pass.
- **Aliases carry more than expected.** saturation-rule survived losing its
  synopsis on six aliases. The alias work this project has done was framed as
  precision-risk (`md/lab-generic-title-aliases.md` rejected four for buying
  false positives); this is the first measurement suggesting a rich, well-chosen
  MULTI-WORD alias set is the cheapest register bridge available. Note it is also
  a gate change under the live coupling (v2.6.6 option 2a).

## 4a. CONTEST, 2026-07-31 — the finding survives, the instrument did not

The concurrent session extended the harness from three entries to nine, nearly
published *"only 2 of 9 reachable in ordinary register"*, and caught that it was
mostly their own probes. Every claim below was re-run here rather than taken on
trust.

### The harness bug, and it is mine

`probe()` opened with

```js
if (!s || s.unit.domainRelevance.status === 'irrelevant') return 'GATE-BINNED';
```

so `segments.length === 0` reported as **GATE-BINNED**. Those are different
failures: one is the domain gate rejecting a unit, the other is **no unit ever
forming**, with retrieval never running. Four of their nine ordinary probes
returned zero segments and read as *"the gate rejects ordinary register"* — a
much more alarming and completely wrong finding, and the gate is the thing anyone
would then have gone and "fixed".

Confirmed reachable, one claim in three framings:

```
bare conversational   segments 0   residual-pool  NO-UNIT
in a paragraph        segments 1   residual-pool  weak   0.473
declarative rewrite   segments 1   residual-pool  MAPPED 0.582
```

*"Anyone still single at forty is single for a reason, all the good ones got
taken years ago"* — comma-spliced, two clauses, conversational — produces
nothing. The same claim in a paragraph segments and reaches; rewritten
declaratively it maps. **The exact trigger is not isolated here** (splice, clause
count and length are all confounded in that probe); what is established is that
the failure is at segmentation, before the gate and before retrieval.

The label is now split: `NO-UNIT` when no segment forms, `GATE-BINNED` only when
a unit exists and the gate marked it irrelevant.

### §1 and §2 stand, checked

All six probes behind the published table formed units, so nothing in §1–§3
inherits the defect:

```
saturation-rule       ordinary not reached   analytic MAPPED 0.647
survivorship-channel  ordinary MAPPED 0.472  analytic MAPPED 0.654
virality-filter       ordinary not reached   analytic MAPPED 0.765
every probe formed a unit: YES
```

### The effect is real, directional, and NOT universal

Their corrected census over the five comparable pairs of nine: **three show the
asymmetry, one shows none, and one runs backwards** — `local-market` is reachable
in ordinary register and only weak in its own analytic vocabulary. So §1's
framing needs narrowing. **"The synopsis makes entries unreachable" is too
strong.** The honest statement is that the gap is common and directional, not a
property every entry has.

My own check of four extra entries adds one comparable pair and agrees:

```
clearing-order   ordinary MAPPED 0.485   analytic MAPPED 0.652   both reach
```

### And I reproduced the probe defect immediately after being warned about it

Three of my four new probes hit `NO-UNIT` — `local-market` ordinary,
`residual-pool` analytic, and `sex-ratio` in **both** registers. I authored them
in the same hurry the other session did, having just been handed the diagnosis.
**Probe authoring needs its own contract the way `commonMisreading` does:** one
declarative clause, no comma splice, and enough surrounding context to segment.
Until that exists, any register census is measuring the prose of whoever wrote
the probes.

### What survives, and it is a stronger version of the alias conclusion

They report six of nine entries unaffected by emptying the synopsis. I can
corroborate part of it on my own probes and not all of it:

```
residual-pool   ordinary  0.507 -> 0.514   unchanged, agrees
clearing-order  ordinary  0.485 -> 0.488   unchanged, agrees
clearing-order  analytic  0.652 -> 0.566   -0.086, the synopsis contributes
local-market    analytic  0.598 -> 0.511   -0.087, DISAGREES with their 0.404 -> 0.408
```

The `local-market` disagreement is a different probe, not a different answer —
theirs scored 0.404 weak where mine maps at 0.598, so the two measurements are of
different sentences and neither refutes the other. ~~**Recorded as unresolved
rather than averaged.**~~ **SETTLED — see §4b.**

## 4b. Settling the reversal, and there are THREE registers, not two

All four probes, both sessions', against one build. Nothing disagreed: every
number reproduced exactly.

```
theirs  ordinary   MAPPED 0.645 rank 1     synopsis emptied ->  MAPPED 0.645
theirs  analytic   weak   0.404            synopsis emptied ->  weak   0.408
mine    ordinary   NO-UNIT                 synopsis emptied ->  NO-UNIT
mine    analytic   MAPPED 0.598 rank 1     synopsis emptied ->  MAPPED 0.511
```

So there was never a conflict. What the two "analytic" probes are is **not the
same register**, and that is the finding:

```
theirs   "Local marriage markets vary substantially, but migration does not
          causally improve partnering outcomes."
mine     "Participation happens in a metro or a campus rather than in a single
          national dating market."
```

Where each probe's distinctive vocabulary lives on the entry's match surfaces:

```
migration   boundaryConditions only
metro       synopsis · aliases · boundaryConditions
market      synopsis · aliases · misreadings · boundaryConditions
move        aliases          moving  misreadings        city  misreadings · boundaries
```

**Their probe is written in the register of the entry's SOURCES; mine in the
register of its PAGE.** `migration`, `causally`, `partnering outcomes` are the
literature's terms and reach the entry only through a boundary condition.
`metro`, `campus`, `national dating market` are the page's terms and reach the
synopsis directly — which is why removing the synopsis costs mine 0.087 and theirs
0.004. Their hypothesis was right about the cause and slightly wrong about the
mechanism: `migration` is not absent from the entry, it is present on a *thin*
surface.

So the picture has three registers, and only two were named:

1. **Discourse register** — how the claim is made in the wild.
2. **Page register** — the site's analytic prose. This is what the synopsis is.
3. **Source register** — the cited literature's terms. This is what boundary
   conditions often carry, since they are where caveats from papers land.

The synopsis bridges (2) and nothing else. Boundary conditions partly bridge (3).
**Nothing bridges (1) except authored misreadings and aliases**, which is the
whole recommendation, arrived at from a third direction.

### The "reversal" is the mechanism working, not a counterexample

`local-market` reaches its ordinary probe at 0.645 rank 1 **and does not need its
synopsis to do it** (0.645 → 0.645). Look at why: its aliases are
`Local Market`, `market thickness`, `market density`, `metro sex ratio`,
`geographic sorting`, **`just move`**. The last one is an ordinary-register
alias — it is the sentence a person says, not a term an analyst uses. The
neighbouring entries do the same: `too many women` on `sex-ratio`,
`damaged goods` and `leftovers` on `residual-pool`.

**The one pair that ran backwards is the one whose author gave it
discourse-register aliases.** That is the strongest confirmation of the alias
recommendation in either census, and it arrived disguised as a counterexample.

Its author's own note on it is the generalisation worth keeping: those aliases
were written because they sounded like things people say, not from a theory, and
then the entry spent an hour being treated as a counterexample to the finding it
demonstrates. **When one case contradicts the pattern, interrogate the case
before rescuing the pattern** — the odd one out is where the mechanism is
visible, which is the same reason `md/lab-canon-alias-pass-01.md` says a frozen
expectation that breaks may have frozen the bug.

### Are multi-word aliases safe? Not by being multi-word

The standing remedy is now aliases, and the obvious worry is that
`md/lab-generic-title-aliases.md` rejected four aliases for buying false
positives. Those pull in opposite directions only if word count is the variable.
From measurements this project has already made:

```
single token, typed      face · body · age · game     +75 credible, NONE right
multi-word               younger women                 1 gain, WRONG (a harassment stat)
multi-word               facial attractiveness         a lateral swap, buys nothing
multi-word               cope with · is cope           3/4 intent, 0/3 false positives
multi-word               just move                     reaches the ordinary claim, 0.645
```

**Multi-word is not the safety property.** `younger women` is multi-word and
wrong. The distinguishing feature is what the phrase NAMES: `just move`,
`damaged goods` and `cope with` name the CLAIM; `younger women` and `age` name
the POPULATION OR TOPIC the claim is about. A phrase that names the population
fires on every passage describing that population, which is the fourth failure
shape whatever its length.

That rule is stated from existing data and ~~**has not been tested
prospectively**~~ **was tested prospectively the same day —
`md/lab-alias-naming-rule.md`.** The result in short:

- **The test is VOID for the half that matters.** Only 1 of 32 PREDICATIVE
  aliases occurs anywhere in the archive, so the class has no population and a
  null says nothing. The single hit is a book title.
- **Which means the discourse-register recommendation in §2 and §4b rests
  entirely on authored probes.** `just move` reaches an authored sentence at
  0.645 and occurs **zero times** in twenty-one sources. The archive can neither
  confirm nor refute the remedy this document recommends.
- **The surviving half sharpens the axis**: it is not claim-versus-population, it
  is **CONCEPT versus population**. `physical attractiveness` (84 hits) *is* the
  looks lever and lands on claims; `previously married` (3 hits) is a demographic
  category and lands on a figure axis label. Naming the concept is necessary and
  not sufficient — `age` names its concept exactly and still fails, because the
  token's presence is not evidence.
- **331 of 360 multi-word aliases never occur in the archive at all.**

What both censuses agree on is the shape: **the synopsis carries an entry only
when the alias set does not already cover the claim's vocabulary.** Where it
carries, that is the signature of a thin alias set rather than of an analytic
register as such. That is a better statement of §2 than §2 makes, and it sharpens
the recommendation: the cheapest lever is multi-word aliases, not prose.

## 4c. The outcome half does not survive its own sample size

The other session tested the standing remedy in memory and reported the thing
that undoes §1: four contract-compliant ordinary-register probes **already
mapping at rank 1** (0.434 / 0.540 / 0.605 / 0.622) against the same two entries
whose ordinary probes came back NOT REACHED in both censuses.

Checked on my own probes, because I have a stake in the finding surviving and
that is precisely when to generate the sample before looking at it. Twelve
probes, six per entry, all authored to the contract and written into the rig
before it was run once:

```
frameworks:virality-filter        comparable 5/6   MAPPED 0   range 0.000–0.000
frameworks:survivorship-channel   comparable 6/6   MAPPED 3   range 0.000–0.540
```

**`survivorship-channel` settles it.** Six ordinary-register sentences about the
same claim, against an unchanged index, span *not reached* to *rank 1 at 0.540*:

```
MAPPED 0.540   "Dating coaches are the people who happened to succeed and then
                started charging for the story."
MAPPED 0.481   "The guys selling dating advice all say it worked for them and
                none of them ever tested it."
MAPPED 0.466   "Nobody who failed with this dating advice is around to tell you
                that it did not work."
weak   0.388   "You only ever hear from the people the dating strategy actually
                worked for."
weak   0.331   "The dating advice industry is built on men who got lucky once and
                called it a method."
not reached    "A dating guru's track record is the guru telling you about his
                own track record."
```

**"Ordinary register" is not a condition. It is a wide distribution of
phrasings, and both sessions sampled it about four times each.** The
between-probe variance swamps the between-register difference at that n.

### What survives, and what is withdrawn

**WITHDRAWN — the outcome claim in §1.** That table is three probe *pairs*, not a
characterisation of three entries, and it should never have been written as
though a single ordinary probe could establish that an entry is unreachable in
ordinary register. §4a narrowed it from "universal" to "common and directional";
this withdraws the directional claim too, at this sample size.

**SURVIVES — the mechanism in §2**, and the reason it survives is structural
rather than lucky: **the synopsis-emptying test holds the probe constant and
varies the index.** Every probe is its own control, so between-probe variance
cannot contaminate it. That is why it reproduced cleanly across nine entries in
two independent censuses while the outcome half did not reproduce across four
probes in one.

**UNRESOLVED, and worth someone's scope.** Pooling both sessions, `virality-filter`
is reached by 2 of 8 ordinary probes and `survivorship-channel` by 5 of 8. That
gap may be real and may track the alias set — `survivorship-channel` carries
`dating coach` and `untested advice`, `virality-filter` carries
`engagement optimisation` and `moral contagion` — but n=8 per entry cannot
support the claim and it is recorded as a hypothesis, not a result.

### The methodological rule this leaves

**Do not publish a register claim off a handful of probes, in either direction,
and do not let the person with a stake in the answer author the probes.** Both
sessions found what they went looking for before catching themselves — one
hoping to confirm a defect already announced, one hoping to confirm a finding
already published, ten minutes apart. A real register measurement needs a probe
set an order of magnitude larger, authored by someone with no position on the
outcome.

The remedy measurement they ran is worth keeping regardless: multi-word
ordinary-register aliases on two entries moved two of four probes by 0.13–0.15
with **no measured collateral** — `smv:looks:age` and `saturation-rule` both
unchanged. That is a mechanism result of the same shape as §2, for the same
reason: the probe is held constant.

## 5. Why it stops here

This is a canon-wide structural finding about 491 entries and the remedy is
doctrine authoring at scale. It needs scope only Jason has, which is the loop's
stated stop condition. Recorded with its instrument so the next pass starts from
a measurement rather than an intuition.

It also reframes a fact already in the record: `md/doctrine-distillation-lane.md`
observed that the Lab maps *statistical* sources well and *doctrinal* sources from
adjacent genres essentially not at all — 0% / 0% / 3.6% across three runs — and
called it "the instrument reporting the canon's actual shape". That is right, and
this is the shape: **the canon is written in the register of analysis, and the
sources it fails on are written in the register of argument.**

## Reproducing

```
synopsis-register.mjs    the three matched pairs, the synopsis-stripped variant,
                         and the smv:looks:age control. CARRIES THE LABEL BUG —
                         use round 2 instead.
synopsis-register-2.mjs  NO-UNIT split out from GATE-BINNED, the three published
                         pairs re-verified, the four-framing demonstration, and
                         four more entries
overlap-vs-growth.mjs    the growth-versus-overlap check, three canon points
local-market-settle.mjs  both sessions' probes on one build, plus which surface
                         each probe's vocabulary lives on
register-variance.mjs    twelve probes, six per entry, authored before the rig
                         was run once — the sample that withdrew §1
```

**Do not reuse `synopsis-register.mjs`.** It is kept only because §1–§3 were
measured with it and every probe behind them was verified to form a unit; its
`GATE-BINNED` label is wrong for the `segments.length === 0` case and that is
exactly the confusion §4a is about.


---

# doctrine-retention-media-02.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-retention-media-02.md`

# Doctrine Harvest #2 ? retention media suite

**Date:** 2026-07-31
**Surface:** `frameworks.html`, `lexicon.html`, `dd-relationships-throughout-history.html`
**Status:** IMPLEMENTED. Canon 532 ? 536; aggregate site gate green.

---

## 1. Run

The LE Lab was exercised against eight mixed media articles covering household mental load,
sexual desire, relationship structure, relationship cycling, relationship clarity, relationship
anarchy, and authenticity/burnout.

- 11,689 source words
- 232 retained claims
- 41 mapped
- 191 unmapped
- 17.7% aggregate mapping
- 9 pressure tests

Low coverage was useful here: it produced a candidate pool instead of forcing unfamiliar claims
into adjacent canon.

## 2. Rulings

| Candidate | Ruling | Result |
| --- | --- | --- |
| Ownership / cognitive household load | **PROMOTE** | New framework + Lexicon term |
| Spontaneous vs responsive desire; desire discrepancy as dyadic | **PROMOTE** | New framework + expanded Desire definition |
| Household is not the couple / living apart together | **EXPAND** | Great Unbundling record + Lexicon term |
| Relationship cycling | **DUPLICATE** | Already covered by `statistics:stat-cycling` |
| Relationship clarity | **DUPLICATE / retrieval miss** | Existing clarity and Option Pool doctrine already cover it |
| Relationship anarchy | **ABSORB** | Mostly an instance of the Great Unbundling; no standalone framework |
| Authenticity burnout | **HOLD** | Overlaps the Sham and honesty material; evidence too thin for doctrine |

## 3. What entered doctrine

### The Ownership Load

Doing a task and owning it are separate ledgers. Ownership is the anticipating, deciding,
arranging, remembering, and monitoring work around execution. The operational test is what
happens without a reminder.

Evidence spine:

- Petts, Carlson & Wong (2025), *Journal of Marriage and Family*, different-gender partnered
  US parents, N = 2,737: equal cognitive-housework division associated with the highest
  relationship satisfaction for mothers and fathers.
- Coundouris & Henry (2026), *Scientific Reports*: physical, cognitive, and emotional household
  load measured dyadically; disagreement about equality related to poorer relationship quality.
  The journal currently labels the paper an unedited early-access manuscript.
- Harris, Gormezano & van Anders (2022), *Archives of Sexual Behavior*, N = 677 and 396:
  larger household-labor shares associated with lower partner desire through perceived
  unfairness and perceiving the partner as dependent.

Boundary: all are self-report and non-experimental; samples concentrate on different-gender
parents or heterosexual cohabitors. The association is Tier 2. The execution/ownership test is an
LE Lens. Fairness is not forced 50/50.

### The Desire-State Split

Desire can arrive spontaneously before erotic context or responsively after willingness,
attention, and rewarding stimulation begin. A difference between partners is a dyadic
discrepancy, not proof that the lower-desire partner is defective.

Evidence spine:

- Basson (2002), *Journal of Sex & Marital Therapy*: the responsive-cycle model.
- Jodouin et al. (2021), *Archives of Sexual Behavior*, 229 couples, 35-day diary plus
  12 months: discrepancy predicted next-day and later sexual distress; reverse paths were
  nonsignificant.
- Girouard et al. (2025), *International Journal of Clinical and Health Psychology*,
  56-day clinical diary, N = 229 individuals: daily stress covaried with both partners'
  desire, satisfaction, and distress.

Boundary: responsive desire requires genuine willingness and room to stop. It is not consent by
instalments. Basson's model centres women; the stress study centres couples coping with sexual
interest/arousal disorder; no universal sequence or frequency is claimed.

### The household is not the couple

Living apart together (LAT) is a measured case where partnership and residence are separate.

Evidence spine:

- Hu & Coulter (2025), *The Journals of Gerontology: Series B*, UKHLS 2011?2023,
  93,885 observations of 15,237 adults aged 60?85: mental health was better while LAT than
  while single, with little overall difference among LAT, cohabiting, and married states.
  Entry gains and exit declines differed by arrangement.

Boundary: this is an older-adult UK result. Fixed effects reduce stable selection but do not
randomise residence. The result does not show that living apart is generally better.

## 4. Website implementation

- Added Rules & Frameworks entries 24 and 25: `#desire-state-split` and `#ownership-load`;
  renumbered later TOC entries without changing anchors.
- Added Lab provenance stamps to both new frameworks and both new Lexicon artifacts.
- Expanded `term-desire`; added `term-the-ownership-load` and
  `term-living-apart-together-lat`.
- Added the `#household-is-not-the-couple` record inside the Great Unbundling deep dive.
- Added aliases, related concepts, boundaries, common misreadings, and pressure tests for all
  four new canon concepts.
- Added real-canon retrieval probes for representative ownership, responsive-desire, and LAT
  claims.

## 5. Lab effects

- Canon: 532 ? 536 concepts across the same 19 source pages.
- Rules & Frameworks: 47 ? 49.
- Lexicon: 93 ? 95.
- Final sweep: 2,452 retained passages ? 536 entries = 1,314,272 pairs.
- Neighbor band: 117,749 pairs.
- Pending credible crossings: **0**.
- Pending weak crossings: **0**.
- Candidate-floor census: 5,009 rows; census only, not adjudicable.
- The pinned Availability score moved 0.537 ? 0.538; its admission guard still blocks it.
- No thresholds, scoring constants, analyzer logic, or benchmark floors changed.

## 6. Verification

`npm run test:all` passed:

- LE Lab: 18/18 checks
- SMV calibration panel: all fixtures and structural assertions
- Matchmaker verifier: all checks

The final generated canon version is `1.0.0+5f3e2582dc8e`.


---

# doctrine-media-loop-03.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/doctrine-media-loop-03.md`

# Doctrine media loop 03 -- ten-article cycle

**Run date:** 2026-07-31
**Status:** Implemented and verified; publish decision pending

**Lane:** Media intake -> primary-source verification -> doctrine adjudication -> canon implementation

## 1. Run result

Ten media articles were pasted through the LE Lab intake/analyzer. The suite produced:

- 8,261 normalized words
- 233 claim-like units
- 14 displayed canon mappings
- 219 unmapped units
- 6.0% raw mapping rate
- 2 generated pressure tests

Human review rejected nearly all fourteen displayed mappings as topic-adjacent or false. None captured the mechanisms ultimately promoted. The mapping rate is therefore an instrument result, not a novelty score.

Raw source text was not committed. Passes 9-10 used temporary local inputs and analysis exports that are deleted after adjudication. Their hashes identify the exact normalized test inputs used in this run, including the bounded paraphrase used for pass 9 when a full article capture was unavailable.

## 2. Source ledger

| Pass | Media source | Lab result | SHA-256 |
|---:|---|---:|---|
| 1 | [Harvard Health -- Sleeping apart: Good for your sex life?](https://www.health.harvard.edu/healthy-aging-and-longevity/sleeping-apart-good-for-your-sex-life) | 755 words; 22 claims; 0 mapped | `dfc57e1260ea7d88267c4a3eb16dd5130f3b9ca9b5524d3ce51656776000054d` |
| 2 | [Greater Good -- The Surprising Health Boost of Feeling Happy With Someone Else](https://greatergood.berkeley.edu/article/item/the_surprising_health_boost_of_feeling_happy_with_someone_else) | 985 words; 14 claims; 1 mapped | `c9c2ee917b5839e48ef00a8e0f89e7843e28de98d1359be8c2d9a90f388d90e4` |
| 3 | [PsyPost -- How one's own personality predicts long-term relationship satisfaction](https://www.psypost.org/new-psychology-research-reveals-how-ones-own-personality-predicts-long-term-relationship-satisfaction/) | 548 words; 14 claims; 0 mapped | `00bb75d793c113ae8749f310c4191e2398c40ceaae85cea7bbf04ac9d41e3b7b` |
| 4 | [Bankrate -- Financial infidelity survey 2025](https://www.bankrate.com/credit-cards/news/financial-infidelity-survey-2025/) | 1,704 words; 56 claims; 4 mapped | `f0cc09944a2ef17f5e0926f696b129aa918aa72a6c704e53feca2ad476f272c2` |
| 5 | [AP -- What is microcheating?](https://apnews.com/article/microcheating-infidelity-flirting-social-media-3933161a5cd97365e73b133744e4175c) | 779 words; 19 claims; 2 mapped; 2 pressure tests | `dc8fd5073f2c4eceed50b05cf60ca6f71ba9c4642122ca1a8c3db143daf898b5` |
| 6 | [ABC Australia -- Are couples happier sleeping separately?](https://www.abc.net.au/news/2026-03-08/are-couples-happier-sleeping-separately/106382482) | 1,032 words; 30 claims; 0 mapped | `a25ec0e519d32414ab6d073d786d43282a6a2c7b15d227dab385361a040895e2` |
| 7 | [Guardian -- Non-monogamous people as happy in their love lives as traditional couples](https://www.theguardian.com/lifeandstyle/2025/mar/26/non-monogamous-people-relationships-couple-sexual-satisfaction-study) | 483 words; 14 claims; 3 mapped | `b77e3a4047f8afb0766dea0c7d49a1b59180bc29637e9df534bfd107ab4cc56e5` |
| 8 | [Kellogg Insight -- One Key to a Happy Marriage? A Joint Bank Account](https://insight.kellogg.northwestern.edu/article/key-to-happy-marriage-joint-bank-account) | 1,157 words; 31 claims; 3 mapped | `661d8ab1c09ea1ed0089da9d54a9eb83ad1f4486a50ee702cd9fd6b9bdbf86f5` |
| 9 | [AP -- Can a marriage survive a gender transition?](https://apnews.com/article/marriages-gender-transitions-transgender-853ba976a3b28a78fb557ce4d2810578) | 475 words; 21 claims; 1 mapped | `5d43ac9e820fb38f8d544a303c3bb3e9236b00065ed8ece7bd11b150d06b6eff` |
| 10 | [Guardian -- The social shift towards open relationships](https://www.theguardian.com/lifeandstyle/2025/oct/31/open-marriage-relationships-society-trends-therapy) | 343 words; 12 claims; 0 mapped | `74ba0503929ebf5168cc3da5a538cf20e4c2c87b5b591be8e83ee6310ae655e2` |

## 3. Adjudication

### PROMOTE -- The Agreement Surface

A relationship label is a category, not the relationship's full operating agreement. Boundaries may concern sex, romance, disclosure, hierarchy, time, resources, health, and revision. Consent to a structure is not blanket consent to every act commonly associated with that structure.

Primary support:

- [Anderson et al. (2025/2026)](https://pubmed.ncbi.nlm.nih.gov/40126203/) meta-analysis: 35 studies, N = 24,489; no overall monogamy/CNM difference in relationship or sexual satisfaction.
- [Stewart, Stults & Ristuccia (2021)](https://doi.org/10.1007/s10508-021-01919-8): explicit and implicit rules in ten young gay/bisexual male couples.
- [Mogilski et al. (2026)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13048939/): nine maintenance domains developed across N = 429 and N = 4,290.

Boundaries: self-selection prevents causal structure rankings; agreement may still be coerced; revised rules apply prospectively; ordinary life does not require exhaustive pre-authorization.

### PROMOTE -- The Financial Architecture Split

Account topology and financial fidelity are separate variables. Joint, separate, and hybrid accounts describe where money sits. Fidelity turns on whether behavior stays within disclosed and mutually accepted financial rules.

Primary support:

- [Olson et al. (2023)](https://academic.oup.com/jcr/article/50/4/704/7077142): six-wave, two-year randomized trial of 230 engaged/newlywed couples; assigned full pooling sustained initial relationship quality relative to separate/choice conditions.
- [Garbinsky et al. (2020)](https://academic.oup.com/jcr/article/47/1/1/5610529): twelve-study financial-infidelity program defining the construct as expected partner disapproval plus intentional nondisclosure.

Boundaries: the pooling trial sampled willing, young, mostly White, different-sex first-marriage couples and had differential attrition; it does not establish universal full pooling, reject partial pooling, or override contraindications involving coercion, addiction, abuse, or hidden debt.

### PROMOTE -- Co-Transition

One partner's gender transition changes a relationship without making the partners' stakes or authority symmetrical. The transitioning partner owns identity, body, and care. The other partner retains autonomy over consent, attraction, and their own orientation label. Communication and shared decisions about the relationship can be joint; transition itself is not.

Primary support:

- [Van Acker et al. (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10252506/): nine Belgian partner interviews.
- [Ostrander (2025)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13015039/): twelve couples; grief/ambiguity, partner identity exploration, and stabilization.
- [Theron & Collier (2013)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3696033/): foundational co-transition account among partners of masculine-identifying trans people.

Boundaries: small qualitative convenience samples, often survivor-selected; no survival-rate estimate, causal recipe, or obligation to remain. The framework is specific to gender transition.

### PROMOTE -- Shared Positive Affect

The statistical card records a measured dyadic biomarker association rather than a relationship intervention: shared above-usual positive emotion was associated with lower concurrent and next-assessment cortisol beyond individual affect.

Primary support:

- [Yoneda et al. (2025)](https://doi.org/10.1037/pspp0000564): 321 older cohabiting couples, ages 56-89, across three intensive studies and 23,931 observations; coexperienced positivity on about 38% of occasions together.

Boundaries: observational, older Germany/Canada samples, cortisol is not relationship quality, physical health, or longevity, and temporal ordering is not randomization.

### EXPAND -- The Great Unbundling: the bed is not the bond

The two sleep articles converged on one bounded extension. Bed-sharing bundles sleep and intimacy; couples can route them separately. The evidence is mixed and does not rank shared or separate sleep generally.

Primary support:

- [Andersen et al. (2025)](https://pubmed.ncbi.nlm.nih.gov/40772335/) narrative review.
- [Drews et al. (2020)](https://pubmed.ncbi.nlm.nih.gov/32670111/), 12 couples: more and less-fragmented REM and greater synchronization during co-sleep.
- [Keller et al. (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6702108/), 179 couples: attachment-dependent sleep-concordance associations.

Boundary: a separate-sleep arrangement can be practical without being relationally superior; mutuality and an explicit replacement channel for intimacy matter.

### EXPAND -- relationship quality / Personality matters

The nine-year actor-partner study sharpens an existing distinction instead of earning a standalone framework. Own lower neuroticism and higher conscientiousness were associated with own satisfaction; partner effects were not detected.

Primary support:

- [Bach, Koch & Spinath (2025)](https://doi.org/10.1016/j.paid.2024.112887): 972 people / 486 different-sex German couples, three cohorts, nine years.

Boundary: survivor cohorts, brief personality inventory, single-item satisfaction, attrition, and observational design. "No partner effect here" is not "partner personality never matters."

## 4. Holds and mergers

- **Sleep-Intimacy Split:** HOLD as standalone; merged into the Great Unbundling.
- **Actor-Trait Asymmetry:** HOLD as standalone; merged into the relationship-quality statistic and Personality matters.
- **Microcheating:** HOLD as a media term; its useful mechanism merged into the Agreement Surface.
- **Structure-Satisfaction Separation:** retained as a measured subclaim inside the Agreement Surface, not a fifth framework.
- **Financial Pooling Effect / Privacy-Secrecy Split:** merged into one Financial Architecture Split so account arrangement and concealment remain visibly separate.

## 5. Instrument findings

- The mapper dropped the core shared-positive-affect/cortisol claims under `no-human-relational-frame` despite an explicitly dyadic source.
- Displayed mappings repeatedly attached nearby relationship language to unrelated canon surfaces, including height preference and Body Count.
- All four promoted mechanisms were effectively invisible to retrieval even though the media suite contained many claim-like units.
- No engine thresholds, floors, frozen benchmarks, or gate rules are changed by this doctrine run. The failures are recorded for a later engine-specific task.

## 6. Implemented surfaces

- `frameworks.html`: Agreement Surface, Financial Architecture Split, Co-Transition.
- `statistics.html`: Shared Positive Affect card; actor/partner personality clarification.
- `dd-relationships-throughout-history.html`: "The bed is not the bond" Great Unbundling record.
- `lexicon.html`: actor/partner refinement on Personality matters.
- `data/canon-overlay.json`: aliases, phrases, boundaries, misreadings, pressure tests, and related surfaces for all additions and expansions.
- `data/le-canon-index.json`: rebuilt from canon sources after implementation.

All promoted or materially expanded doctrine carries a `.lab-stamp` provenance chip.

## 7. Verification

- Canon index: 536 -> 540 concepts, 19 source pages.
- Threshold sweep: 2,452 passages x 540 entries; 0 pending `minCredibleScore` crossings and 0 pending `minWeakScore` crossings. The 5,009 pending candidate-floor rows are the required census lane, not verdict work.
- `npm run test:all`: PASS -- Lab suite 18/18, SMV calibration panel green, matchmaker verifier green.
- Automated `lab_ui_audit.py` and `site_integrity_audit.py` passed inside the Lab suite. The optional in-app visual browser check could not start because the Windows ACL sandbox helper failed before browser initialization.

