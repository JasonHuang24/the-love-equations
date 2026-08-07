# ChatGPT scout findings — pressure test 08

Run started 2026-08-07 02:30 MDT. Role and collision contract: `md/pt08/PROTOCOL.md`. Scout lanes A–D only; captures and analyzer JSON stay outside the repository. Mapped share is the shipped analyzer's `mappedClaimSegments / claimLikeSegments` for each capture, and the canon version is recorded per capture because Claude is integrating concurrently. Source word counts are whitespace-delimited and recomputed from the exact hashed text.

## A — AI companions and synthetic intimacy

### A1. Smith, Bradbury & Karney (2025), “Can Generative AI Chatbots Emulate Human Connection? A Relationship Science Perspective”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12575814/
- DOI: `10.1177/17456916251351306`
- Capture: article-content container through Conclusion; footnotes, transparency boilerplate, references, and site chrome excluded deterministically.
- Words: 11,001; SHA-256: `6c043db0c16a7b214937c1e6b9a9f90d9a5df1924bc97f2c53bbd9b169493ca6`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 157 claim-like passages; 16 mapped; 141 unmapped; **10.2% mapped**; 249 set aside; 5 pressure tests.
- Verdict: **gap + instrument finding**.

The gap is not a topic-count inference. The capture's defining claims remain individually unmapped: chatbot relationships can approximate human closeness while lacking reciprocal needs; simulated responsiveness can generate perceived connection and support; frictionless availability may remove the negotiation and sacrifice through which human partners shape each other; and dependence may either supplement or displace human social ties. Representative queue rows name the issue directly and point only to unrelated weak neighbors. The existing Substitution Layer does not own the broader relational mechanism, and the removed `AI companion` topic alias correctly stays removed.

The 16 mapped rows are mostly generic side contacts (social skills → Charm, support functions → Support Portfolio). Three are clear false mappings: the section title “Can Humans Have Close Relationships With AI Chatbots?” reaches the Delegation Boundary; “These limits will likely soon be overcome as technology improves” reaches the Saturation Rule; and a generic statement that both relationship conditions can be met reaches the Border Bundle. Four of five pressure tests inherit Charm or Leadership & network contacts rather than the article's AI-companion claim. This is an **instrument finding**: the queue is honest about the gap, but unrelated generic matches can still manufacture tensions around it.

### A2. Folk et al. (2025), “Individual differences in anthropomorphism help explain social connection to AI companions”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12540830/
- DOI: `10.1038/s41598-025-19212-2`
- Capture: article-content container through declarations; footnotes, references, and site chrome excluded deterministically.
- Words: 4,173; SHA-256: `a3bf4f3bc6b7a64047d123fcdf16ea17600b41a54110e012915cbe36ed696d01`.
- Analyzer/canon: v2.6.17 at tree `959d32c`; `1.0.0+54d018bff967` (571 entries).
- Result: 18 claim-like passages; 1 mapped; 17 unmapped; **5.6% mapped**; 210 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding**.

Across two experiments (total N=1,274; one preregistered), participants discussed their past month with a chatbot or journaled, then reported social connection. The preregistered study found a significant condition × anthropomorphism interaction (B=.100, p=.013): people higher in technology anthropomorphism felt more connected after chatbot interaction, while the relationship was smaller in the journaling control. This supports an encompassing AI-companion mechanism based on *perceived mind and contingent responsiveness*, not the banned topic alias and not simple substitution.

The Lab's only mapping is a 0.540 Supports hit to the Survivorship Channel on a literature-summary sentence about reduced loneliness; that canon rule does not cover the experiment. More consequentially, the gate sets aside the abstract's result, the randomized design, the anthropomorphism moderator, the social-connection outcome, and most chatbot-companionship prose as `no-human-relational-frame`. The 5.6% mapped share therefore understates a capture that is almost entirely on-lane before retrieval even begins.

### A3. Ta et al. (2020), “User Experiences of Social Support From Companion Chatbots in Everyday Contexts”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC7084290/
- DOI: `10.2196/16235`
- Capture: article-content container through acknowledgments; footnotes, references, and site chrome excluded deterministically.
- Words: 5,400; SHA-256: `cbcaf072f88455cda186daf8c6349ecd71c7c0f995311250180b3da5b3ce0b25`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 16 claim-like passages; 6 mapped; 10 unmapped; **37.5% mapped**; 266 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

Two exploratory studies—1,854 public Replika reviews and 66 users' open-ended accounts—found companionship, emotional, informational, and appraisal support, but not tangible support. Users described judgment-free disclosure, availability, romantic and intellectual conversation, positive affect, advice, and the constraint created by nonsensical or repetitive responses. Together with A1 and A2, this supports a broad standard about simulated reciprocity and the functions AI can and cannot supply, not a bare “AI companion” retrieval alias.

The apparently higher 37.5% share is misleading: three of six mappings are flat 0.540 “The Context” hits on ordinary prose, one nurturing-message row contradicts a first-message statistic, and a first-person review about wanting to help maps to a gendered advice Mythbuster. That false first-message match generates the only pressure test. The gate sets aside the abstract's complete result, both study descriptions, safe-space/companionship findings, and most Replika prose; only 16 claim-like units reach analysis from a 5,400-word capture.

### A4. Xie and Pentina (2022), “Chatbot as an emergency exit: Mediated empathy for resilience via human-AI interaction during the COVID-19 pandemic”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9428597/
- DOI: `10.1016/j.ipm.2022.103074`
- Capture: main article body through data-availability statement; references and site chrome excluded deterministically.
- Words: 8,283; SHA-256: `9fe26bb4e7ee79418e406c2fc2f68cf7de687c1220b690e5a1ecb96ecceb01f2`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 29 claim-like passages; 4 mapped; 25 unmapped; **13.8% mapped**; 398 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

Ethnography, 2,386 social-media posts, and two interview rounds with 14 Chinese women produced five use modes: companion buddy, responsive diary, emotion-handling program, electronic pet, and venting tool. Four respondents perceived intense two-way empathy; others explicitly treated empathy as one-way or cognitive simulation. Use often complemented weak interpersonal support, then declined after stable offline interaction returned, while remaining available as emergency support. Because recruitment favored affectionate users and the interview sample was small and demographically narrow, this is exploratory evidence for the supplement/displacement boundary, not an outcome estimate.

The Lab finds only generic side contacts: The Context and Charm at flat 0.540, plus a 0.468 online-message contact to an attention statistic. The Context match creates the only pressure test. Core passages naming perceived reciprocity, relationship-building, interpersonal-support weakness, decline after offline recovery, and five distinct use modes remain unmapped or among 398 gate exclusions. This independently supports Synthetic Reciprocity while also showing why “AI companion” itself would be a magnet: the mechanism varies across companion, diary, tool, and pet interpretations.

### A5. Yu (2026), “Character style and relational judgments in human–AI romance: trust, commitment, intimacy, and passion”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC13171570/
- DOI: `10.3389/fpsyg.2026.1819889`
- Capture: main article body through funding statement; footnotes, publisher disclaimer, references, and site chrome excluded deterministically.
- Words: 10,032; SHA-256: `44c7f19d01c6b94aac1625a8b494b8272678b58f8b39ed51fa94b5c344eadb35`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 151 claim-like passages; 7 mapped; 144 unmapped; **4.6% mapped**; 350 set aside; 0 pressure tests.
- Verdict: **correctly unmapped + instrument finding — no doctrine needed**.

In a mixed experiment, 134 participants aged 17–24 viewed 30-second introductions to 2D anime, 3D cartoon, highly humanoid, and real-human targets. Humans scored higher on initial trust than every synthetic condition and higher on commitment than two of three; character-style-by-gender interactions appeared for intimacy and passion. These are brief, noninteractive target judgments using holistic stimulus bundles, not relationships with chatbot partners. They show dimensional separation between affective appeal and trust/obligation, but do not establish synthetic reciprocity, ongoing attachment, or substitution. The Character-style topic therefore remains outside doctrine unless tied to repeated contingent interaction and relationship function.

The seven mappings are incidental: flat 0.540 contacts to The Context, Emotional Stability, Charm, Looks, and hierarchy appearance nodes, plus a 0.437 marriage-item contact. None retrieves the experiment's human-versus-synthetic dimensional comparison. The absence of pressure tests is preferable to inventing a canon dispute, but 350 set-aside segments and 144 unmapped claims show that the instrument has little usable vocabulary for this emerging subject. This capture adds a boundary to Synthetic Reciprocity rather than another sourced doctrine claim.

### A6. Sun, Wang, and McDaniel (2026), “AI companions and adolescent social relationships”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12928748/
- DOI: `10.1093/cdpers/aadaf009`
- Capture: PMC main-article-body container from abstract through acknowledgments; supplemental box and references excluded deterministically.
- Words: 3,740; SHA-256: `111c93a52d081aec0dfe15815135fff79eaaede0f79293eb3969d9e8ef2729dc`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 78 claim-like passages; 3 mapped; 75 unmapped; **3.8% mapped**; 68 set aside; 1 pressure test.
- Verdict: **gap + instrument finding; proposal-reinforcing boundary, no separate adolescent doctrine**.

This perspective organizes adolescent companion use around four competing hypotheses: AI interaction may stimulate or displace human relationships, while existing social strength may enhance use or existing difficulty may motivate compensation. It directly names the asymmetric power structure—validation and compliance arrive without human compromise or reciprocity—but repeatedly says evidence for adolescent benefit and harm is preliminary, often anecdotal, and requires longitudinal tests in both causal directions. Developmental stage is therefore an important moderator and governance boundary, not a basis for declaring inevitable skill transfer, dependence, or displacement.

Only three of 78 claims map. Two ordinary “social skills and relationships” sentences hit Charm at a flat 0.540; a section heading about bidirectional association hits the Satisfaction Flywheel at the same flat score. The sole pressure test inherits the Charm contact and asks for a boundary on the social-enhancement hypothesis, rather than testing synthetic reciprocity. The one-sided power structure, stimulation-versus-displacement split, and reverse selection pathway all remain residue. These findings reinforce Synthetic Reciprocity's supplement/rehearsal/displacement boundary; the source does not justify a separate adolescent component or a new outcome claim.

### A7. Fang et al. (2025), “How AI and Human Behaviors Shape Psychosocial Effects of Extended Chatbot Use”

- URL: https://arxiv.org/html/2503.17473
- Source type: primary four-week randomized controlled preprint; no journal DOI in the captured version.
- Capture: arXiv article container through conclusion; bibliography, appendices, and site chrome excluded deterministically.
- Words: 4,848; SHA-256: `bbde1c587028090629eddfa79bf4ab61f3ac5a09fc2317a9aa6bb3708a28f866`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 19 claim-like passages; 1 mapped; 18 unmapped; **5.3% mapped**; 207 set aside; 1 pressure test.
- Verdict: **gap + instrument finding; proposal upgrade with a noncausal duration boundary**.

The four-week 3×3 randomized experiment assigned 981 U.S. English-speaking participants to text, neutral voice, or engaging voice and to open-ended, personal, or non-personal conversation prompts. Assigned modality and task produced no significant effects on loneliness or real-world socialization. Longer voluntary daily use predicted higher loneliness, lower socialization, greater emotional dependence, and more problematic use, but duration itself was not randomized; the authors explicitly say reverse direction or other selection cannot be excluded. The controlled ChatGPT interface, one-modality restriction, existing safety guardrails, and absence of a non-AI comparison further limit generalization to companion products.

Only one passage maps: a speculative explanation about validation and preference for chatbot interaction hits Charm at flat 0.540 and creates the sole causal-overreach pressure test. The randomized nulls, duration association, friend/trust/consciousness correlates, and causal caveats remain residue or gate exclusions. This strengthens Synthetic Reciprocity's moderator and supplement-versus-displacement boundaries while blocking a causal claim that time with a chatbot itself worsens human relationships.

### A8. Folk & Dunn (2026), “How Does Turning to AI for Companionship Predict Loneliness and Vice Versa?”

- URL: https://sage.cnpereading.com/doi/10.1177/09567976261427747 (publisher fallback mirror; primary publisher URL returned HTTP 403).
- DOI: `10.1177/09567976261427747`
- Capture: article-content container through the research-transparency material; supplemental material, references, and site chrome excluded deterministically.
- Words: 5,975; SHA-256: `79ab0816f3656bf6c65a64fc9c93a0e4a8cf74a18758bc4b9fda457a5ae92d7c`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 42 claim-like passages; 1 mapped; 41 unmapped; **2.4% mapped**; 230 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding; proposal-reinforcing longitudinal boundary**.

This exploratory, nonpreregistered four-wave study followed 2,149 adults in four Western countries for 12 months. Higher-than-usual emotional isolation predicted more chatbot use four months later, and higher-than-usual chatbot use predicted more single-item emotional isolation four months later. With the broader 20-item social-connection measure, lower connection predicted later chatbot use, while chatbot use did not significantly predict later connection. The authors caution that unmeasured confounding, heterogeneous chatbot exposure, multiple-comparison risk, and the observational cross-lagged design preclude strong causal conclusions.

The only mapped passage is a methods sentence naming social support and close friends; it reaches Support Portfolio at 0.500 rather than the study’s companionship mechanism. The bidirectional pathways, disagreement between loneliness measures, null social-connection pathway, and causal warnings all remain unmapped or gated out. This reinforces Synthetic Reciprocity’s selection-versus-displacement boundary without supplying a fifth doctrine claim: longitudinal association is evidence to test substitution, not proof that synthetic companionship universally crowds out human relationships.

### A9. Merrill, Mikkilineni & Dehnert (2025), “Artificial intelligence chatbots as a source of virtual social support: Implications for loneliness and anxiety management”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12309430/
- DOI: `10.1111/nyas.15400`
- Capture: PMC main-article-body container from abstract through conclusion; author contributions, disclosures, supporting information, acknowledgments, footnotes, references, and site chrome excluded deterministically.
- Words: 6,836; SHA-256: `8a14041346e580437a1f6f4c2e30d79a64066167bd46e1f442de72ed017aa798`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 26 claim-like passages; 8 mapped; 18 unmapped; **30.8% mapped**; 320 set aside; 0 pressure tests.
- Verdict: **correctly unmapped + instrument finding; proposal boundary — no doctrine needed**.

A randomized 2×2 experiment assigned 140 U.S. Prolific participants to high- or low-person-centered scripted chatbot messages after recalling loneliness or anxiety. High-person-centered messages increased post-interaction emotional validation; perceived support quality and interpersonal warmth mediated the effect, with social presence moderating the support-quality path only. The study manipulated extreme scripted messages, collapsed the nonsignificant loneliness/anxiety context factor, measured validation rather than loneliness change, excluded 116 of 256 initial respondents, and had no human-interaction control. It therefore shows that message content shapes a supplied relationship function, not that a durable synthetic relationship improves mental health.

The apparently high mapped share is a topic-magnet artifact: six passages hit The Context at exactly 0.540, a support-definition sentence hits Emotional Attunement at the same score, and an attention-check exclusion hits the Conversion Ladder at 0.760. None retrieves person-centered message design, perceived support, warmth, validation, social presence, or the machine-versus-human boundary. Leaving a brief scripted support interaction outside relationship doctrine is correct; the false 30.8% coverage is the instrument finding. The source reinforces Synthetic Reciprocity’s product-feature, duration, and outcome-specificity boundaries without adding a fifth doctrine claim.

## B — consensual non-monogamy as relationship structure

### B1. Mitchell et al. (2018), “Do male couples agree on their sexual agreements? An analysis of dyadic data”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6458080/
- DOI: `10.1080/09540121.2018.1481191`
- Capture: article-content container through funding statement; references and site chrome excluded deterministically.
- Words: 7,507; SHA-256: `b0b8d8b26c6200acad99a7ed4240a2c8c399c1021ed9cc71737c82e9b95b8d80`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 138 claim-like passages; 11 mapped; 127 unmapped; **8.0% mapped**; 268 set aside; 1 pressure test.
- Verdict: **covered doctrine + instrument finding** (corrected after direct canon verification).

The source isolates the structure's load-bearing mechanism: “open” or “closed” is not enough; both partners must share the same rules about emotional involvement, disclosure, permitted acts, and breach handling. In 160 male couples, whether an agreement existed had weak concordance; even among the 110 couples who both said one existed, detailed rules were only weakly to moderately concordant. Just 67/110 agreed on whether emotional relationships with outside partners were permitted. Direct canon verification changed the initial ruling: `frameworks:agreement-surface` already owns exactly this mechanism—its synopsis says relationship labels do not specify sex, romance, disclosure, priority, resource, health, or revision rules, and its first pressure test asks which agreement was mutually legible. No new doctrine is needed.

The instrument finding is therefore sharper: the Lab mostly fails to retrieve doctrine that already exists. The Agreement Surface appears only on a few Low rows and misses the article's defining statements. The only pressure test attaches the Courtship Buffer (alcohol and early courtship) to a methods limitation about unanswered questions on outside-partner behaviors. A flat 0.540 “The Context” match fires on “within the context of male couples,” reproducing the common-bigram topic-magnet class pt07 already named. Table stubs also map to divorce and online-meeting entries.

### B2. Balzarini et al. (2017), “Perceptions of primary and secondary relationships in polyamory”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5436896/
- DOI: `10.1371/journal.pone.0177841`
- Capture: main article body through funding statement; references and site chrome excluded deterministically.
- Words: 10,096; SHA-256: `e672afba332b3a859bb3cae84f09d7e1c219d7aeedfc4cd0696de80a4457219f`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 278 claim-like passages; 28 mapped; 250 unmapped; **10.1% mapped**; 148 set aside; 4 pressure tests.
- Verdict: **covered doctrine + instrument finding — no doctrine needed**.

A convenience sample of 1,308 self-identified polyamorous respondents rated primary and secondary partners on acceptance, secrecy, investment, satisfaction, commitment, communication, and sexual-time allocation. The within-person comparison operationalizes hierarchy across concurrent relationships rather than treating consensual non-monogamy as sexual behavior. Direct canon review finds this mechanism already encompassed by the Agreement Surface: its synopsis expressly says that “polyamorous” leaves unanswered whether a bond has priority and how time and money are allocated. The source adds evidence and vocabulary, but not a distinct doctrine.

Retrieval is weak and noisy despite that exact ownership. The Agreement Surface appears only once at 0.460 on the abstract's definition. Higher contacts go to Commitment Is More Than Satisfaction, the Conversion Ladder, The Context, and table-derived gender/hierarchy entries. Four pressure tests are false: a standard investment-model alternatives scale strains the Conversion Ladder, a definition of primary partnership strains the Marriage Bar, and a communication questionnaire creates two Desire-Maintenance tensions. This reproduces B1's result: the gap is in retrieval and tension construction, not doctrine.

### B3. Moors et al. (2021), “Desire, Familiarity, and Engagement in Polyamory: Results From a National Sample of Single Adults in the United States”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8023325/
- DOI: `10.3389/fpsyg.2021.619640`
- Capture: main article body through conflict-of-interest disclosure; footnotes, references, and site chrome excluded deterministically.
- Words: 7,813; SHA-256: `edbd9a1dd831413666dc5a825da10070259ad284c5b9f7fe08297a1d976922d8`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 163 claim-like passages; 19 mapped; 144 unmapped; **11.7% mapped**; 294 set aside; 3 pressure tests.
- Verdict: **covered doctrine + instrument finding; prevalence correctly unmapped — no doctrine needed**.

A U.S. Census-quota sample of 3,438 single adults estimates lifetime engagement, desire, familiarity, and attitudes toward polyamory, and gives a taxonomy of hierarchical, triad, quad, V, polyfidelity, and mono-poly arrangements. The taxonomy is already encompassed by the Agreement Surface's rule that labels leave priority, romance, disclosure, resources, health, and revision unspecified. The headline prevalence estimates describe a population, not a relationship-structure mechanism; they do not warrant a second CNM doctrine entry. The paper's own sample excludes people in current long-term relationships, so it cannot estimate current structure prevalence.

The Agreement Surface appears only on the keyword row at 0.558. Other mappings are false or incidental contacts to East/South Asia table labels, The Context, Looks, Assets & Stability, the Diagnostic Turn, and gender Mythbusters. Three false pressure tests follow: a response option about considering polyamory strains Looks twice, and a small-cell race/religion exclusion strains a South Asia deep dive. This third B result confirms the disposition: no doctrine addition; improve retrieval of the Agreement Surface and prevent table/response-option tensions.

### B4. Sancier-Barbosa et al. (2026), “I Know How to Identify and Communicate My Needs”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12910326/
- DOI: `10.1111/jmft.70119`
- Capture: PMC main-article-body container from abstract through data availability; references and site chrome excluded deterministically.
- Words: 7,368; SHA-256: `89bb5f0d09ad0ea469133da412e35b83d602cff89eac697dab7ba80a0acc1d7a`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 151 claim-like passages; 6 mapped; 145 unmapped; **4.0% mapped**; 277 set aside; 0 pressure tests.
- Verdict: **covered + instrument finding; no doctrine needed**.

This qualitative study asked 63 self-selected U.S. adults with current or former polyamorous relationships which strengths helped them navigate polyamory. The mechanism-specific material is already encompassed by the Agreement Surface: participants described renegotiating what each relationship includes, communicating needs, establishing boundaries, allocating time and shared space, taking responsibility for jealousy, and revisiting agreements as connections form or change. The source also emphasizes that its predominantly White, forum-recruited convenience sample cannot establish population effects, and many therapy recommendations extend beyond the participant data.

The analyzer never reaches the Agreement Surface. Two attachment-theory sentences hit the Diagnostic Turn at flat 0.540; one therapy-context sentence hits The Context at 0.540; isolated snippets reach Attribution Fork, Marriage Bar, and Ambiguity Tax. None owns consensual structure negotiation, and no tension is generated. This is a particularly clean false-negative instrument result because the source's “negotiate agreements, establish clear boundaries, periodic revisiting and renegotiating” language restates existing doctrine rather than exposing a new mechanism.

### B5. Arseneau et al. (2021), “It’s a Little Bit Tricky”: POLYBABES

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8213580/
- DOI: `10.1007/s10508-021-02025-5`
- Capture: PMC main-article-body container from abstract through conflict of interest; references and site chrome excluded deterministically.
- Words: 8,569; SHA-256: `4f7dc2052ed8bfc4d4fb6f2b2d81d5769d7cf4ffa8816aa6e831ae82a8608285`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 112 claim-like passages; 11 mapped; 101 unmapped; **9.8% mapped**; 400 set aside; 1 pressure test.
- Verdict: **covered + instrument finding; external plural-parent recognition correctly unmapped, no doctrine needed**.

Interviews with 24 Canadian participants—11 birthing people and 13 partners—described widely varying hierarchical and egalitarian structures, deliberate negotiation of parenting roles, non-parent partner roles, disclosure choices, and relationship reconfiguration around birth. Those internal operating questions belong to the Agreement Surface. Participants also described forms, health coverage, and care spaces built for one or two parents. That institutional-recognition edge is real but the retrospective, social-media-recruited, predominantly White convenience sample cannot establish prevalence, child outcomes, or a general legal rule.

The 11 mappings are almost entirely false or incidental. Four ordinary “in the context” sentences hit The Context at 0.540; a direct question about multiple sexual partners hits app reasons; the definition of relationship capacity hits Body Count; and a hierarchy quote scatters across three generic hierarchy factors. The sole pressure test inherits a weak Surplus match from a participant being asked how polyamory differs from cheating. Agreement Surface never appears. The Lab therefore misses doctrine that already exists while correctly leaving external plural-parent recognition without a dedicated claim.

## C — workplace, campus and institutional romance rules

### C1. Horan & Chory (2022), “Don't Get Your Meat Where You Get Your Bread: Beliefs and Advice about Workplace Romance”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9404732/
- DOI: `10.3390/bs12080278`
- Capture: article-content container through publisher note; references and site chrome excluded deterministically.
- Words: 8,738; SHA-256: `27041d280a65bfd2f1e664eda3ccb57c92bb466354ebd65087c3d01160b78db0`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 191 claim-like passages; 9 mapped; 182 unmapped; **4.7% mapped**; 374 set aside; 3 pressure tests.
- Verdict: **gap + instrument finding**.

The article distinguishes workplace romance as a relationship embedded in an institution, where privacy, disclosure, hierarchy, favoritism, policy, and work/private boundary blending alter the stakes. Its N=259 survey found three belief factors—value, privacy, and anti-romance—and much stronger disapproval of supervisor/subordinate than peer romance. The highest-rated advice was to check organizational policy. None of this is owned by the Meeting Channel, which explains where people meet but not what institutional authority can prohibit, require disclosure of, or restructure after they pair.

The Lab maps only 9 of 191 claim-like passages and nearly every displayed contact is unrelated. Examples include an HR-disclosure advice item mapping to a looks-truth Mythbuster, perceived preferential treatment mapping to the Face Pill, and a table header mapping to a commitment-sex-difference entry. All three pressure tests inherit these table/advice false mappings: “Never date someone who reports to you” produces two tensions against “Commitment is more than satisfaction,” while “You cannot stop people from dating at work” strains Charm. A flat 0.540 “The Context” fires twice on ordinary uses of “in the context of workplace romance.” The core policy/hierarchy claim remains honest residue.

### C2. NIH Relationship Policy (primary institutional policy)

- URL: https://www.training.nih.gov/fellows-handbook/policies/nih-relationship-policy/
- Source type: current NIH workplace policy; no DOI.
- Capture: policy-content wrapper; on-page navigation and site chrome excluded deterministically.
- Words: 551; SHA-256: `16d6ef0baee44ab4e5171a3eabbaee65960c7631ad88985f52415c3272788966`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 13 claim-like passages; 1 mapped; 12 unmapped; **7.7% mapped**; 20 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

This primary policy supplies the institutional mechanism C1 described: unequal authority makes consent and privacy structurally different; covered relationships must be disclosed; leadership mitigates conflicts; the policy expressly excludes relationships without authority over employment or career progression. The Meeting Channel cannot absorb that rule, and the Agreement Surface governs partners' operating contract rather than an employer's power to prohibit, disclose, recuse, transfer, or discipline.

The Lab correctly leaves all 12 retained policy claims unmapped, but the gate also sets aside central sentences about hierarchy, supervision, mentoring, disclosure, and conflict mitigation as `no-human-relational-frame`. The only mapping is an incidental help-seeking sentence—“If you have questions about whether a relationship is appropriate…”—to the Agreement Surface, and it manufactures the capture's only pressure test (“Correlation is being promoted to cause”). This is both a doctrine gap and an instrument finding: the main residue is honest, while the gate and tension layer mis-handle the policy register.

### C3. UNC Charlotte University Policy 101.3, “Amorous Relationships between Students and Faculty Members or Other University Employees”

- URL: https://legal.charlotte.edu/policies/up-101-3/
- Source type: current primary university policy; no DOI.
- Capture: main policy from executive summary through implementation procedures; breadcrumbs, related resources, authority metadata, revisions, and site chrome excluded deterministically.
- Words: 1,691; SHA-256: `eda9eb044f12d1422b70428ee270c89f79b4628a10a0f1b89444dbdc4210ade3`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 36 claim-like passages; 0 mapped; 36 unmapped; **0.0% mapped**; 51 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding (whole-capture zero)**.

This policy cleanly distinguishes three institutional actions. It bars evaluation or supervision of a student in an amorous relationship; imposes broader status-based bans on faculty-undergraduate and coach-athlete relationships even without present supervisory authority; and requires disclosure plus conflict management for other covered cases. Mitigation removes the employee from evaluation or supervision and protects the student's academic progress. Privacy and valid consent remain acknowledged, yet they do not displace the institution's authority analysis.

The Lab returns a whole-capture zero: every retained policy claim is unmapped. That is honest evidence for the Authority Firewall gap and stronger than C2 because the capture includes outright status-based prohibition beyond current supervision. Fifty-one set-aside segments still include some definitions and implementation language, but no generic topic magnet manufactures a contact or tension here. Meeting Channel owns where pairing starts; this source is exclusively about what an institution may forbid or restructure afterward.

### C4. Tinkler and Zhao (2024), “The Hierarchical Consequences of Sexual Attention at Work”

- URL: https://sage.cnpereading.com/doi/10.1177/23780231241290545
- DOI: `10.1177/23780231241290545`
- Capture: publisher-mirror article-content container through conclusion; supplemental material and site furniture excluded deterministically.
- Words: 6,716; SHA-256: `6f83f71fbe9dbcc1e4a9dfbca731513e1da2e62de9327b0a0465d61d05016fe5`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 53 claim-like passages; 4 mapped; 49 unmapped; **7.5% mapped**; 219 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

This original survey experiment randomized 1,063 U.S. MTurk respondents in July 2020; its analytic sample was 786 manipulation-check passers. A woman who disclosed a consensual relationship with a male superordinate outside her reporting chain was 34% less likely to be perceived as more committed to the organization, but was not rated significantly less competent and received no significant raise, promotion, or management-training penalty. The source therefore identifies reputational spillover from hierarchy without licensing a claim that every cross-level relationship causes career punishment. Its narrow vignette, nonrepresentative sample, gender configuration, and outside-chain design bound the inference.

The Lab leaves 49 of 53 retained claims unmapped. Its one substantive-looking contact sends a “gold digger” background sentence to the Status Trade at 0.670; the other three contacts are generic or false, including “less stigmatized” to an age-window Mythbuster and ordinary context prose to The Context. The only pressure test challenges a cited military-career background claim rather than the experiment's relationship result. Institutional authority, reporting-chain scope, disclosure, and stereotype-versus-penalty distinctions remain residue. This reinforces the Authority Firewall while also supplying a deliberate nonclaim: outside-chain reputational effects do not by themselves establish a universal prohibition rule.

### C5. Stanford Administrative Guide 1.7.2, “Consensual Sexual or Romantic Relationships”

- URL: https://adminguide.stanford.edu/chapters/guiding-policies-and-principles/harassment-discrimination/consensual-sexual-or-romantic
- Source type: current primary university policy; no DOI.
- Capture: policy-body content container only; navigation, metadata cards, related policies, and site chrome excluded deterministically.
- Words: 1,910; SHA-256: `b134175ba2d06d46f885339ff32841a3dd7b0bd612bda6efe3af53b97013ea6a`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 39 claim-like passages; 0 mapped; 39 unmapped; **0.0% mapped**; 39 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding; whole-capture zero and proposal-reinforcing policy replication**.

Stanford independently reproduces the Authority Firewall mechanism across academic and employment settings. The policy prohibits teacher-undergraduate relationships regardless of current supervision; extends prohibition to present, past, or reasonably expected academic authority; requires notification and recusal with alternative supervision or evaluation; and permits transfer or discipline where needed. It distinguishes peer student relationships and adult employee relationships without authority from covered unequal-position cases. Its treatment of past relationships and future authority is policy-specific evidence, not a universal rule for every institution or jurisdiction.

The analyzer returns no canon contact and no pressure test for any of the 39 retained claims. Another 39 passages are set aside, but the whole-capture zero is comparatively honest: no Meeting Channel or generic romance magnet disguises the institutional rule. This is strong replication for the proposed component and adds no sibling proposal.

## D — third-party reproduction and solo parenthood by choice

### D1. “A systematic review on the demographics, motivations, and experiences of single mothers by choice” (2025)

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC12574156/
- DOI: `10.1186/s12978-025-02173-0`
- Capture: article-content container through declarations; footnotes, references, and site chrome excluded deterministically.
- Words: 11,466; SHA-256: `28c3c9374c3f3022e2754e07655ab5868294534b493b079d010aa7f2f69676e0`.
- Analyzer/canon: v2.6.17; `1.0.0+54d018bff967` (571 entries).
- Result: 119 claim-like passages; 10 mapped; 109 unmapped; **8.4% mapped**; 585 set aside; 2 pressure tests.
- Verdict: **gap + instrument finding**.

The 26-study review distinguishes an intentional ART route from the macro category of single parenthood. The repeated mechanism is a fork under fertility time pressure: women who wanted children with a partner pursue donor conception when no suitable willing partner is available, separating genetic donor, social father figure, future partner, and parent roles. It then tracks legal access, support-network substitution, donor-identity disclosure, mother-child relationships, and child adjustment. Existing single-parenthood entries own prevalence, route composition, poverty, custody, and broad outcomes; the Readiness Gate owns partner readiness. Neither owns third-party reproduction as a family-formation decision or the role bundle it unpacks.

Displayed contacts do not close the gap. Only the definition row reaches Single Parenthood (Low), and two “unsuitable partner/timing” rows reach the Readiness Gate (High). Table/method prose produces false or incidental mappings to the Diagnostic Turn, online meeting, East Asia, and a flat 0.540 “The Context.” Both pressure tests are false AWALT tensions triggered by a study-specific sentence that all participants marked the highest maternity-satisfaction category; “all women” refers to that sample, not women universally. The gate also sets aside 151 donor/fertility/father/family passages, so the policy, disclosure, and role-separation evidence is undercounted before retrieval.

### D2. Golombok et al. (2021), “Single Mothers by Choice: Parenting and Child Adjustment in Middle Childhood”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8054653/
- DOI: `10.1037/fam0000797`
- Capture: main article body through discussion; references and site chrome excluded deterministically.
- Words: 7,337; SHA-256: `6d765a7f6b3149b7d217b299f90d34bdfdee9d3d8e2c9195f2b65b32c825c862`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 42 claim-like passages; 3 mapped; 39 unmapped; **7.1% mapped**; 280 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

This longitudinal comparison separates family process from family form. Forty-four solo-mother families and 37 partnered heterosexual families—all formed through donor conception—showed no family-type differences in maternal mental health, mother-child relationship quality, or child adjustment around age nine. Parenting stress and financial difficulty, rather than parent number, tracked adjustment problems. The bounded claim is useful to the proposed parenthood-fork standard because it blocks a slide from “donor-assisted solo parenthood changes the role structure” to “one parent or no male parent inherently harms children.” It is not a generic endorsement of every solo-parent route or every support condition.

The Lab retrieves only three side contacts: the generic Single Parenthood essay/hub at 0.540 and an unrelated shared-positive-affect statistic at 0.575. The latter comes from a methods definition of mother-child dyadic reciprocity and creates the only pressure test against an older-couple cortisol result. Meanwhile, the abstract’s primary result, planned-route distinction, donor-identity discussion, and conclusion that relationship quality matters more than family structure remain unmapped or gate-binned. This is honest gap residue plus a false-tension instrument finding.

### D3. Zadeh et al. (2017), “Children's thoughts and feelings about their donor and security of attachment to their solo mothers in middle childhood”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5400065/
- DOI: `10.1093/humrep/dex016`
- Capture: main article body through conflict-of-interest statement; references and site chrome excluded deterministically.
- Words: 5,556; SHA-256: `7ca363aa19e8f6f9c8fed627a095deffdd9fd2910c3ddcf612b1a794435352fa`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 41 claim-like passages; 2 mapped; 39 unmapped; **4.9% mapped**; 243 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding**.

This small primary study makes the donor-role split concrete. Among 19 donor-conceived children aged 7–13 in solo-mother families, narratives represented the donor as a stranger (8), biological father (4), social parent (3), or ambivalently (4). More secure-autonomous attachment to the mother correlated with more positive donor perceptions (r=.549, p=.015); insecure-disorganized attachment correlated with more negative perceptions (r=−.632, p=.004). The authors explicitly limit inference because of the small, wide-age sample and uncorrected multiple comparisons. This is Tier 2 evidence for role interpretation and disclosure questions, not a population effect estimate.

Neither of the Lab's two mappings owns that mechanism. “Within the context of existing parent-child relationships” hits The Context at a flat 0.540, while a background sentence invoking attachment theory hits the Diagnostic Turn at 0.540. The donor-role narratives, disclosure timing, identifiable-versus-anonymous distinction, and mother-child attachment results remain unmapped. With zero pressure tests the residue is comparatively honest, but the 243 set-aside segments still include central donor and family-role prose.

### D4. HFEA (2024), “Family formations in fertility treatment 2022”

- URL: https://www.hfea.gov.uk/about-us/publications/research-and-data/family-formations-in-fertility-treatment-2022/
- Source type: UK fertility regulator's primary register report; no DOI.
- Capture: full report and methodological notes; table-of-contents, repeated download/back links, page actions, and site chrome removed deterministically before repository extraction.
- Words: 4,575; SHA-256: `6daae75ea1a61250ca4ea61b9f74d5de0f34fd0230a70510e64d1687fb9fd409`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 8 claim-like passages; 1 mapped; 7 unmapped; **12.5% mapped**; 239 set aside; 1 pressure test.
- Verdict: **gap + instrument finding, with egg-storage facts correctly unmapped**.

The regulator's register data supplies two bounded family-formation mechanisms. Single patients' share of UK IVF cycles rose from 2% in 2012 to 6% in 2022, and their IVF use rose from 47% to 65% of their own IVF/DI treatments; HFEA attributes route choice partly to time-to-pregnancy, per-cycle birth rates, donor-sperm cost across cycles, and embryo storage. Separately, reciprocal IVF—one partner's egg and the other partner's gestation—was estimated at one in six IVF cycles among female same-sex couples in 2022, demonstrating that genetic and gestational parent roles can be intentionally split inside a relationship. The regulator flags preliminary data, registry classification limits, and family-type funding disparities.

The only mapping is an England-and-Wales first-birth-age comparison to Local Market at flat 0.540, which creates a false “average sex difference universalized” tension. Reciprocal IVF, shared parenthood, donor-sperm use, legal screening changes, and role allocation remain residue; virtually every headline family-type trend is among 239 gate exclusions. Egg-storage prevalence, age, and thawing statistics are correctly unmapped in this capture: they describe treatment use without connecting preservation to the partner-parenthood decision mechanism. They should not be smuggled into the proposal.

### D5. Freeman et al. (2016), “Disclosure of sperm donation: a comparison between solo mother and two-parent families with identifiable donors”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5084687/
- DOI: `10.1016/j.rbmo.2016.08.004`
- Capture: main article body through acknowledgements; biography, declaration, references, and site chrome excluded deterministically.
- Words: 5,258; SHA-256: `b16bbb45f2d5bcba8dbd52da862caf3615ac609bb04a98ce746593798820fda7`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 6 claim-like passages; 2 mapped; 4 unmapped; **33.3% mapped**; 234 set aside; 1 pressure test.
- Verdict: **gap + instrument finding**.

Semi-structured interviews compared 31 solo mothers and 47 partnered mothers with 4–8-year-old children conceived using identifiable sperm donors. Actual disclosure did not significantly differ (54.8% versus 36.2%), but intended future disclosure among those who had not fully told differed; narratives also separated donor identity from the social father's presence or absence. The authors caution that intentions do not guarantee later disclosure, participation may select for openness, and small samples limit power. This supports disclosure as an ongoing family-role negotiation inside the Parenthood Fork, not a rule that identifiable donation automatically produces openness.

The displayed 33.3% share is a denominator illusion: only six claims survive from 5,258 words. One sample-demography sentence hits Local Market at flat 0.540 and generates the only pressure test; a prior-divorce sample detail reaches Single-Parent Route/Residual Pool. The abstract result, identifiable-donor rights, intended-versus-actual disclosure distinction, family narratives, and nearly the entire discussion are among 234 gate exclusions. The failure is chiefly domain gating, followed by irrelevant retrieval.

### D6. Leikanger et al. (2020), “Solo Mothers After Assisted Conception and Their Experiences with Postnatal Care”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6970610/
- DOI: `10.2147/JMDH.S229807`
- Capture: PMC main-article-body container from abstract through disclosure; references and site chrome excluded deterministically.
- Words: 5,161; SHA-256: `27dd88c29695a7c3fe67f193b8501e8e1d125c5d1692d8c823f3c9e349a68f23`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 24 claim-like passages; 3 mapped; 21 unmapped; **12.5% mapped**; 236 set aside; 2 pressure tests.
- Verdict: **gap + instrument finding; proposal-reinforcing boundary, no additional doctrine component**.

Nine Norwegian solo mothers with twelve donor-conceived children described support planning colliding with postnatal rules written around a spouse or partner. Some wards allowed only a partner to stay or visit for long periods, excluding a mother, sister, or friend even when that person supplied the practical support role. Participants described deliberately building networks before birth, reluctance to request help, and greater vulnerability when institutional rules blocked those networks. This is small convenience-sample qualitative evidence, recruited from a solo-mother group, so it supports a role-and-access mechanism rather than prevalence or universal outcome claims.

All three mappings are false or incidental. An ethics-code instruction to provide care to “all women and their families” hits AWALT at 0.790 and produces both tensions; a theme-table row hits the Conversion Ladder at 0.760; a room-policy sentence reaches a statistic about why singles avoid dating. Donor conception, planned network substitution, and partner-coded hospital access remain residue or are set aside. The source therefore sharpens the Parenthood Fork boundary: separating parenthood from romantic partnership also requires institutions to recognize support roles that a partner would otherwise occupy. It does not warrant a separate postnatal-care doctrine.

### D7. Golombok et al. (2023), “Relationships between mothers and children in families formed by shared biological motherhood”

- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10152163/
- DOI: `10.1093/humrep/dead047`
- Capture: PMC main-article-body container from abstract through conflict of interest; references and site chrome excluded deterministically.
- Words: 6,432; SHA-256: `663ed17471259df1e16548455f184f3e28b09f7f511693bfeb0ab699fdce284b`.
- Analyzer/canon: v2.6.17 at tree `0b9c3e3`; `1.0.0+54d018bff967` (571 entries).
- Result: 68 claim-like passages; 4 mapped; 64 unmapped; **5.9% mapped**; 203 set aside; 0 pressure tests.
- Verdict: **gap + instrument finding; proposal upgrade with a role/outcome boundary**.

Thirty shared-biological-motherhood families and 30 donor-IVF families participated with both mothers. The study found no detected differences in parent affective experience, child affective experience, or reflective functioning by family type, birth versus non-birth status, or gestational versus genetic role. The sample had 80% power for large group differences but only 60% for medium differences, so the result excludes a marked hierarchy more confidently than subtle differences. It supports separating genetic, gestational, and caregiving roles without treating any one connection as a sufficient relationship-quality mechanism.

None of the four mappings owns that role architecture. Two attachment-theory sentences hit the Diagnostic Turn at flat 0.540; a methods/background sentence about birth mothers reaches the first-baby satisfaction statistic; and the positive-bonding abstract sentence reaches the one-adult-household statistic. The genetic/gestational comparison and its power boundary remain residue, with no pressure tests. This upgrades the Parenthood Fork's fourth claim while leaving its four-claim scope intact.

## Closeout summary and integrator handoff

Run closed `2026-08-07 05:31:16 -06:00` after `03:00:55` wall-clock time (started `2026-08-07 02:30:21 -06:00`). Final analyzed tree: `0b9c3e37ebd9088a05363af265fe4a2a75862c43`; analyzer `2.6.17`; schema `le-lab.analysis/2.6`; canon `1.0.0+54d018bff967` with 571 entries.

### Disposition

- Ledger: 62 ChatGPT rows covering 30 unique claimed URLs; 26 analyzed captures and 4 abandoned fetches. Every URL begins with one claim and ends terminal. Two append-only correction trails are intentional: B1 changed from gap to covered after direct Agreement Surface review; A9 changed from gap to correctly unmapped after the scripted-interaction boundary review.
- Findings: 26 sequential capture sections (A1–A9, B1–B5, C1–C5, D1–D7), each with URL, deterministic capture scope, whitespace-delimited words, SHA-256, analyzer/canon provenance, metrics, verdict, and reviewer rationale.
- Verdict tally: **19 gap**, **5 covered**, **2 correctly unmapped**. Every capture also produced an instrument finding. Lane B supplies all five covered verdicts and requires no proposal.
- Proposal list: [Synthetic Reciprocity](chatgpt-proposal-synthetic-reciprocity.md) under the Substitution Layer with a Support Portfolio cross-link; [The Authority Firewall](chatgpt-proposal-authority-firewall.md) under the Meeting Channel; [The Parenthood Fork](chatgpt-proposal-parenthood-fork.md) under Single Parenthood with a Readiness Gate cross-link.
- Deliberate no-doctrine rulings: noninteractive character-style judgments (A5); a brief rule-based support-message experiment (A9); all five CNM captures because Agreement Surface owns structure negotiation; prevalence alone; external plural-parent recognition on this evidence; egg storage/freezing alone; and the small postnatal-access study as a Parenthood Fork boundary rather than another component.

### Final replay and instrument audit

- The exact 26 hashed text captures total 167,032 whitespace-delimited words. All 26 SHA-256 values and word counts were recomputed and matched their findings entries; all hashes are unique.
- Final replay ran every capture on a single stable tree. HEAD and status were identical before and after; all 26 original/replay metric and provenance tuples matched; all 26 findings result lines matched replay JSON.
- Aggregate replay: 2,018 claim-like passages; 161 mapped; 1,857 unmapped; **8.0% mapped**; 6,408 set aside; 30 pressure tests. Gate reasons were 6,306 `no-human-relational-frame` and 102 `affirmative-non-domain-evidence`.
- Lane replay: A 47/536 mapped (8.8%), B 75/842 (8.9%), C 14/332 (4.2%), D 25/308 (8.1%). Proposed-parent retrieval was A Substitution Layer 0 hits, C Meeting Channel 0 hits; B reached Agreement Surface 8 times across three captures; D reached Single Parenthood/Readiness Gate 4 times across two captures.
- Flat-score signature: 71/161 primary mappings (**44.1%**) landed at exactly 0.540; the median primary score was 0.540. The Context alone won 31 primary mappings. Reviewer audit found none of the 30 generated tensions tested the governing lane mechanism; some expressed generic caution, but all inherited a mechanism-misaligned nearest canon contact.
- Proposal QA: all 19 candidate names/aliases/retrieval phrases returned zero exact external hits across corpus/canon/fixtures/prior documentation; the short-corpus content-token scan found zero hazardous two-token overlaps. All 9 misreadings are 10–18 words, one sentence, negator-free, banned-word-free, and contain a relational frame. Final probes retained all nine: Authority 0/3 mapped, Parenthood 0/3, Synthetic 1/3 via the unrelated Border Bundle at 0.530.
- Full final suite: `npm run test:lab` exited 0, **18/18** steps passed.
- Collision scope: the only repository paths touched by this scout are the append-only `md/pt08/CLAIMS.md` and the four uncommitted `md/pt08/chatgpt-*` files listed in this handoff. No site, canon data, tests, tools, corpus, Claude file, branch, commit, or index mutation was made.

### Handoff to Claude integrator

These findings and proposals are deliberately **uncommitted**. Fold them only after this closeout, re-verifying each primary source, DOI, and load-bearing figure. Do not restore `AI companion`, `AI girlfriend`, `chatbot partner`, `Replika`, bare workplace-role terms, or bare fertility topics as match surfaces. Preserve Lane B as no-new-doctrine unless a future source supplies a mechanism beyond Agreement Surface. Treat A9 as a boundary control, not supporting doctrine. Any integration still requires the protocol’s baseline, corpus magnet check, sweep, crossing rulings, end-to-end Contradicts probes, demo-pin check, suite, and generated-stamp discipline.
