# Unmatched umbrella pressure-test findings

## Scope and run identity

This report records the implementation, remediation, and validation of
unmatched umbrellas in The Love Equations Lab. Umbrellas and unmatched reasons
are explanatory triage metadata only. They do not change canon, doctrine
ownership, match scores, thresholds, gates, exclusions, alignment, or mapping
decisions.

- Branch: `codex/unmatched-umbrellas`
- Base: `69b4bab12a193e1fccb6f80359ff2fc4334ea4f9`
- Analyzer: `2.7.2`
- Analysis schema: `le-lab.analysis/2.6`
- Queue schema: `le-lab.research-queue/2.3`
- Canon: `1.0.0+064e6e7fed71`
- Triage schema: `le-lab.unmatched-triage/1.1.0`
- Taxonomy: `le-lab.unmatched-umbrella-taxonomy/1.1.0`
- Final classifier freeze: `2026-08-31T00:22:52.8357456-06:00`
- Final classifier SHA-256: `5578f27b00c6c5ce8a55bb9830f4146419fc25b3ac83d62cef2c645c7ab21cdd`

The original pressure-test window is preserved as historical work:

- Start: `2026-08-30T15:08:54.9621115-06:00`
- End: `2026-08-30T18:09:22.3653845-06:00`
- Duration: `3:00:27.403`

The review-remediation window ran from
`2026-08-30T23:20:52.9914071-06:00` through
`2026-08-31T00:55:57.7422713-06:00`, a separate duration of
`1:35:04.7508642`.

The final acceptance-correction window ran from
`2026-08-31T01:57:17.5223707-06:00` through
`2026-08-31T02:06:45.0237441-06:00`, a separate duration of
`0:09:27.5013734`. It corrected the artifact-audit default invocation and
regenerated the six current saved exports without shell-added trailing bytes;
no classifier, analyzer decision, or canon behavior changed. Raw third-party
HTML, PDFs, and extracted text remained in the gitignored
`artifacts/unmatched-umbrellas` evidence area and did not enter tracked files.

## Architecture and contracts

The post-match boundary remains intact:

1. The existing analyzer completes relevance gating, exclusions, scoring,
   ownership, alignment, and the mapped/unmatched decision.
2. Only a final unmatched claim reaches `classifyUnmatchedPassage()`.
3. The production classifier has exactly one call site and receives only
   `result.unit.text`, the exact source fragment.
4. Triage metadata is attached to the research item and exported; no value is
   fed back into matching.

Taxonomy 1.1 adds deterministic explanatory ownership metadata:

- `asymmetric-nonhuman-relationships` names
  `frameworks:synthetic-reciprocity`.
- `institutional-authority-governance` names
  `frameworks:authority-firewall`.

This registry is internal to unmatched triage. It never enters the matcher.
Reason precedence is outside-human/furniture, descriptive evidence, boundary
or moderator evidence, existing-doctrine retrieval miss, possible doctrine
gap, then insufficient evidence. Boundary evidence remains boundary evidence
even when the umbrella has a current doctrine owner.

Role unbundling now requires an explicit separation, substitution,
comparison, or unbundling mechanism. Reproduction, surrogacy, donor,
intended-parent, or parenthood vocabulary cannot qualify by itself. Legal
parenthood, recognition, consent, eligibility, and administrative access route
to External recognition when that is the claim. A statistical-methods guard
also prevents `separate ANCOVA`, `between-subjects factor`, response-rate, and
covariate prose from manufacturing relational separation.

## Frozen evaluation

The historical fixture
`tests/fixtures/unmatched-umbrella-evaluation.json` remains byte-preserved as
taxonomy 1.0 evidence. It contains the documented contradiction: `brief-03`
is marked `negative-control` while expecting a supported Brief umbrella.

The successor
`tests/fixtures/unmatched-umbrella-evaluation-1.1.json` records, rather than
silently rewrites, that correction by changing the case kind to `positive`.
The successor audit checks every negative control individually and requires it
to abstain.

| Measure | Taxonomy 1.1 result |
|---|---:|
| Resolved cases | 61 |
| Supported cases | 36 |
| Abstained cases | 25 |
| Abstention rate | 40.98% |
| Primary agreement / precision | 36 / 36 (100%) |
| Unmatched-reason agreement | 61 / 61 (100%) |
| Secondary agreement | 61 / 61 (100%) |
| Category stability | 100% |
| Negative controls abstaining | every negative control |

The successor was reconciled for the historical case-kind contradiction and
sealed before final taxonomy tuning. It is a versioned evaluation set, but it
is not described as a pristine source holdout.

## Adversarial probes

The versioned adversarial fixture covers AI/customer-support collisions,
host/sponsor furniture, titles ending in punctuation, methods prose, donor and
surrogacy tables, Character.AI and Replika punctuation, institutional bans and
reporting lines, legal-parenthood recognition, ordinary/statistical `means`,
`one in which` versus one-in-N statistics, and RBAC/database/cloud/service-
account/parent-child vocabulary.

Across its 20 live-analyzer probes, 1 mapped, 5 reached the live unmatched
population, 13 were excluded, and 1 produced no claim. Direct-classifier
controls that the current gate excludes are retained as future-safety evidence
and are not counted as user-visible live failures. The live authority probe
preserves Authority Firewall as a nearest wording candidate explicitly marked
as a nonmatch.

## Final 38-source replay

All 38 successful historical sources were replayed after the final classifier
freeze. The failed UNICEF acquisition from the historical window remains a
recorded HTTP 403 and is not counted as a successful source. Shared versions
for every row are analyzer/canon/taxonomy
`2.7.2 / 1.0.0+064e6e7fed71 / 1.1.0`. Totals are
`mapped / unmatched / excluded`. Distribution codes are `A` asymmetric or
nonhuman, `I` institutional authority, `R` role unbundling, `X` external
recognition, `B` brief/nonrelationship, and `U` explicit abstention.

| ID | URL and title | Type | Words | SHA-256 | Totals | Distribution | Final review and disposition |
|---|---|---|---:|---|---:|---|---|
| ai-longitudinal | [How AI Companionship Develops](https://arxiv.org/abs/2510.10079) | research preprint | 589 | `d8024ba57f387fe547c678d0fd6a13659f47b7043cb8835da72dea2cbadae373` | 0 / 2 / 92 | A1 U1 | A correct; supports existing Synthetic Reciprocity territory |
| ai-rise | [The Rise of AI Companions](https://arxiv.org/abs/2506.12605) | research preprint | 683 | `02494b9cdca0d17abb152cfcbc9d210b7d7db1c7b709e71f0889b0df139f5719` | 0 / 2 / 98 | U2 | conservative abstention; challenges A recall |
| authority-cu | [APS 5015 — Consensual Amorous Relationships](https://www.cu.edu/ope/aps/5015) | university policy | 2,293 | `4ddfbd7b0ca55b34cc25f3f210d17e5b6d8615c2c504dd849f0618988f936345` | 5 / 29 / 102 | I6 U23 | 6/6 I correct; furniture abstains |
| authority-umass | [Policy on Consensual Relationships Between Faculty and Students](https://www.umass.edu/academic-hr/policy-consensual-relationships-between-faculty-and-students) | university policy | 372 | `c1428ed223795ecec379d7ae846923293bb69dde8834d2666a22152a7e773ff3` | 1 / 4 / 6 | I3 U1 | 3/3 I correct |
| cnm-frontiers | [Trying to understand who seeks open relationships](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1762047/full) | research article | 10,644 | `e9a633e1e0102bcfefce74fb367d58de43821a7515833e765dc936be3d275155` | 50 / 165 / 914 | U165 | methods abstain; known doctrine/retrieval evidence, no new umbrella |
| cnm-openlove | [Love Without Limits](https://podscan.fm/podcasts/the-openlove101-show/episodes/love-without-limits-the-truth-about-consensual-non-monogamy) | podcast transcript | 1,735 | `82e7660af7e25942a20620f03f60ef11bd7cef5076971a7662e86710aecdfeb9` | 18 / 27 / 136 | U27 | transcript abstention / existing doctrine |
| cnm-overthink92 | [Transcript of episode 92](https://overthinkpodcast.com/episode-92-transcript) | podcast transcript | 10,218 | `297b7f933ac7f48cc0ee8d731feced9b10c6f9ddc01fc2f0a4b5c217fb62452e` | 16 / 147 / 391 | U147 | transcript abstention / existing doctrine |
| donors-govuk | [Legal rights for egg and sperm donors](https://www.gov.uk/legal-rights-for-egg-and-sperm-donors) | government guidance | 164 | `eef9a900423c1c38c985724a58670a8d1d312b1d1c16d5c573f589a5e6823517` | 0 / 0 / 18 | none | extraction/gate boundary; no unmatched item |
| home-insemination | [Home insemination with donor sperm](https://www.hfea.gov.uk/donation/donors/home-insemination-with-donor-sperm/) | regulator guidance | 518 | `f2b5ba962575bc24e463f1889b964261a7eef2d73ba11f1023bb1f27040ae461` | 0 / 1 / 39 | X1 | corrected from role topic match to X claim mechanism |
| parenthood-hfea | [Becoming the legal parents of your child](https://www.hfea.gov.uk/treatments/explore-all-treatments/becoming-the-legal-parents-of-your-child/) | regulator guidance | 1,416 | `ebed756abe486228d630585f0ce0f0fee6a5b3d2b65bf5027ffa4e67dd7f8597` | 2 / 18 / 80 | X8 U10 | 8/8 X correct; no vocabulary-only role assignments |
| solo-fathers | [The Growing Cohort of Single Dads by Choice](https://www.theatlantic.com/family/archive/2025/08/single-fathers-by-choice-america/683885/) | reported essay | 2,904 | `56875678fb1694ae674d121b6c9b446012dbcfc9fd3bd8217fb6d2c026ad8fe9` | 6 / 21 / 121 | R1 U20 | explicit partner/parent separation retained; topic-only cases abstain |
| surrogacy-govuk | [The surrogacy pathway](https://www.gov.uk/government/publications/having-a-child-through-surrogacy/the-surrogacy-pathway-surrogacy-and-the-legal-process-for-intended-parents-and-surrogates-in-england-and-wales) | government guidance | 8,629 | `19e5cf3e5a45dee47e01dd3fab999d3a9509d139df5c1967e907e715a31162c7` | 1 / 23 / 465 | X4 U19 | 4/4 X correct; procedural/report-scope role false positives removed |
| h02 | [Not a Silver Bullet for Loneliness](https://arxiv.org/abs/2602.12476) | research abstract | 648 | `1497b853decfd3f2a074b58e6b4febb6c8d6ed5c98a11d65704ec3d586df1491` | 1 / 10 / 85 | A2 U8 | 2/2 A correct; furniture abstains |
| h03 | [Consensual Relationship Policy](https://www.mcneese.edu/policy/consensual-relationship-policy/) | institutional policy | 51 | `9569ca269ea940ae2e9e966a8054c51586dbb3bffcf1ca3e58bb139e8eabc7c2` | 0 / 0 / 18 | none | navigation-only extraction limitation |
| h04 | [FAQs relating to unregulated sperm donation](https://www.hfea.gov.uk/about-us/media-centre/faqs-relating-to-unregulated-sperm-donation/) | regulator guidance | 1,575 | `edc6b4834df42ade239d54e9b83386faca62faf56547c8d7e63fc955c4fbe63f` | 1 / 2 / 93 | U2 | supported abstention; recall remains conservative |
| h05 | [Draft Life Partnership Policy](https://www.dha.gov.za/images/RFQS/TOR_020_-_2025_LIFE_PARTNERSHIP_POLICY.pdf) | government policy PDF | 7,390 | `eb78b0c93381698283b13ad4dbac0ba7390eec47462112e227e0041442af1c7d` | 0 / 15 / 1,012 | U15 | bid furniture abstains; challenges X recall |
| h06 | [On the Intimate Animal](https://www.ciis.edu/podcast/intimate-animal-dr-justin-garcia) | podcast transcript | 11,003 | `5128d472cbe5f943d7665b9f50892c054a7f447cb55445f02ec6b4e1f4a86b9b` | 30 / 142 / 476 | U142 | transcript abstention / existing doctrine |
| h07 | [Service Accounts](https://kubernetes.io/docs/concepts/security/service-accounts/) | technical documentation | 2,384 | `ce16d8eda833d8c9166364a7e0d65a2abdc435e68b455d756de7f00436c4a839` | 1 / 1 / 162 | U1 | negative control passed |
| h08 | [Day–Night Monitoring of Volcanic SO2 and Ash Clouds](https://ntrs.nasa.gov/api/citations/20220015559/downloads/manuscript_accepted.pdf?attachment=true) | research PDF | 9,030 | `08efa2a60c0d4e54bd7bbec0b4e57d08c4e69253fb98f55a8e4fd633cfae7d0d` | 0 / 5 / 555 | U5 | negative control passed |
| c01 | [Anthropomorphism in AI Companion Communities](https://arxiv.org/abs/2606.30942) | research preprint page | 651 | `388d997a296ab4570be2ca5118bd371e97091545e12aa7fb734345dd829cf2b5` | 1 / 3 / 138 | U3 | method/research-question lines abstain |
| c02 | [Policy on Teacher-Student Consensual Relations](https://catalog.yale.edu/dus/university-policy-statements/teacher-student-consensual-relations/) | university policy | 646 | `9b7eedd19d45af1da30f2e3eb02902f6db1446aee4a40f30365edba1c97df850` | 0 / 11 / 47 | I3 U8 | 3/3 I correct; conservative I recall |
| c03 | [Assisted reproduction (accessible version)](https://www.gov.uk/government/publications/assisted-reproduction-caseworker-guidance/assisted-reproduction-accessible-version) | government caseworker guidance | 5,044 | `cbbc56564bd8e9c481872b7bc1d9a1136879c0300e8b68961d65ff0538440d15` | 3 / 12 / 312 | X2 U10 | legal effects route X; procedural prose abstains |
| c04 | [Transcript of episode 17](https://overthinkpodcast.squarespace.com/episode-17-transcript) | podcast transcript | 9,500 | `a57e9e4e5928d7a5966d5a0bda672fb82fc9ddc01fc2f0a4b5c217fb62452e` | 18 / 202 / 531 | U202 | transcript abstention / existing doctrine |
| c05 | [Initial impressions of compatibility and mate value](https://pmc.ncbi.nlm.nih.gov/articles/PMC9659375/) | peer-reviewed research article | 9,930 | `2e46d655872d223a95ebf18310d2ca65459e6d0ad6e7f47f14150c91edd13baf` | 30 / 145 / 1,141 | B1 U144 | 1/1 B correct; methods abstain |
| c06 | [Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) | technical documentation | 6,554 | `545189945ff5fffd2dc25e389aa7b69a9f466ed6aced3670c876d13583f0c67c` | 0 / 5 / 2,062 | U5 | negative control passed |
| c07 | [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) | technical standard | 64,801 | `060054cd5da678a21f03d42eb2797fb4c9c67f96908b6c9a1ae59344dd83022c` | 6 / 11 / 2,470 | U11 | negative control passed |
| o01 | [Negotiating Relationships with ChatGPT](https://arxiv.org/abs/2601.13188) | research preprint page | 697 | `514f5291057693c8ff03d42a9dcc18597e98a626422370cfac69b3ec88040a7b` | 0 / 4 / 157 | A1 U3 | 1/1 A correct; context-dependent references abstain |
| o02 | [MIT consensual relationships policy](https://policies.mit.edu/policies-procedures/90-relations-and-responsibilities-within-mit-community/99-consensual-sexual-or) | university policy | 2,255 | `59252a4e527018d659ebf44017f4d03039cd66cabd24c27122edf6d058730a58` | 4 / 47 / 68 | I22 U25 | 22/22 I correct; conservative I recall |
| o03 | [Surrogacy](https://lawcom.gov.uk/project/surrogacy/) | law-reform project page | 1,331 | `0e45351f2bbae9ac74298270eac2dcd19535b332cd6d2c30d153eb4eab7a8701` | 0 / 0 / 121 | none | extraction/gate boundary |
| o04 | [Single Mothers by Choice](https://pmc.ncbi.nlm.nih.gov/articles/PMC4886836/) | peer-reviewed research article | 9,716 | `a7ddb3bba8e7db3cd9c00a62adc63d45397fba6e78c7409c67377f95ec6ac842` | 6 / 42 / 1,418 | R2 U40 | 2/2 explicit separation correct; inclusion/method prose abstains |
| o05 | [Consent Culture and Intentional Relationships](https://doingitpodcast.co.uk/transcripts/dr-meg-john-barker-transcript) | podcast transcript | 8,001 | `1c963677c17d5de050332c8c9a578b9ab8dfb3c89eec4b9669722081672a5891` | 11 / 61 / 715 | U61 | transcript abstention / existing doctrine |
| o06 | [Role Based Access Control FAQs](https://csrc.nist.gov/projects/role-based-access-control/faqs) | technical documentation | 2,201 | `518f32a964df9cf6d44ef84f4d5df89aa81e7980021760003e3ee3b524dc4874` | 1 / 20 / 181 | U20 | negative control passed |
| f01 | [Playing Games with My Heart](https://arxiv.org/abs/2605.08093) | research preprint page | 693 | `e239ae004d79132e131fd5a14a9cd4833d6ac1f451773417a3f07cedbf7a4ae1` | 0 / 4 / 158 | A2 U2 | 2/2 A correct |
| f02 | [Unprofessional Relationships and Abuse of Authority](https://ari.hms.harvard.edu/harvard-medical-school-harvard-school-dental-medicine-unprofessional-relationships-abuse-authority) | university policy | 235 | `f0fa684513344d18585e9ac70facf33a0149338b4f46e877835c166f9633d61c` | 0 / 6 / 0 | U6 | short extraction; challenges I recall |
| f03 | [Modernising fertility law](https://www.hfea.gov.uk/about-us/modernising-the-regulation-of-fertility-treatment-and-research-involving-human-embryos/modernising-fertility-law) | regulator policy review | 14,125 | `2482618a295690887d72a86d30520316bd975f24ed6e0d591ac1ba6119e21892` | 2 / 21 / 759 | X2 U19 | report-scope role false positive removed; 2/2 X correct |
| f04b | [Let’s Talk Love Episode 7](https://www.realloveready.com/transcript-lets-talk-love-podcast-episode-7-with-shamyra-howard) | podcast transcript | 9,771 | `7948fb3d879262f3134999aac2646cd1120807d7e2368c3de7f3ba65650af97b` | 27 / 174 / 629 | U174 | transcript abstention / existing doctrine |
| f05 | [Laugh is in the air](https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2022.909913/full) | peer-reviewed research article | 12,402 | `376b3c5b363c816263e6c91848a97aaae3e6980727e5ef2578cfb9b6343a167b` | 21 / 111 / 1,834 | B1 U110 | 1/1 B correct; methods abstain |
| f06b | [Formal Specification for RBAC User/Role and Role/Role Relationship Management](https://www.nist.gov/publications/formal-specification-role-based-access-control-userrole-and-rolerole-relationship) | technical publication page | 55 | `d920d5460b00c35771de3c0a276065529b7461421266b8cf0bcd568825a453b8` | 0 / 1 / 8 | U1 | negative control passed |

### Aggregate and precision

| Measure | Final replay |
|---|---:|
| Sources | 38 |
| Extracted words | 230,854 |
| Mapped / unmatched / excluded | 262 / 1,494 / 17,612 |
| Supported umbrella / abstained | 62 / 1,432 |
| Abstention rate | 95.85% |
| A | 6 |
| I | 34 |
| R | 3 |
| X | 17 |
| B | 2 |

Manual review of the replay’s supported population found A 6/6, I 34/34,
R 3/3, X 17/17, and B 2/2, or 62/62 supported assignments. This is a
discovery-influenced replay precision, not an unbiased estimate of live
accuracy. The original role result was 13 correct among 24 assignments
(54.17%); the final replay is 3/3 (100%), with known procedural, report-scope,
eligibility, and legal-parenthood false positives removed. The stricter rule
may trade recall for precision.

Final reason counts across all 1,494 unmatched items:

| Unmatched reason | Count |
|---|---:|
| Insufficient evidence to classify | 1,254 |
| Existing doctrine, retrieval miss | 126 |
| Boundary, moderator, or directional evidence | 70 |
| Outside the human-relational frame | 20 |
| Possible doctrine gap | 15 |
| Descriptive fact without a relational mechanism | 9 |

No supported Synthetic Reciprocity or Authority Firewall fragment is labeled
Possible doctrine gap. Across the replay, all 6 supported A and 34 supported I
assignments use retrieval-miss or higher-precedence boundary/descriptive
reasoning as applicable.

## Remediation discovery sets and final sealed holdout

The first six-source remediation holdout was selected after an earlier freeze,
but later heading-normalization work occurred; it is therefore discovery
evidence. Its final replay is 38,127 words, 46 / 412 / 3,404
mapped/unmatched/excluded, I20 U392, and a 95.15% abstention rate.

The second six-source post-freeze set exposed one false role assignment in a
statistical sentence containing `separate ANCOVA` and `between-subjects
factor`. That result directly changed the methods guard, so this set is also
discovery evidence. Its final replay is 41,570 words, 30 / 190 / 3,864,
A1 R1 U188, and a 98.95% abstention rate. The statistical false positive now
abstains. Acquisition failures and same-stratum replacements are recorded in
its external `selection.json`.

The final five-source holdout was sealed at
`2026-08-31T00:23:12.9349950-06:00`, after the final classifier freeze and
before acquisition. No taxonomy changes followed its review.

| ID | URL and title | Type | Words | SHA-256 | Totals | Distribution | Holdout disposition |
|---|---|---|---:|---|---:|---|---|
| sh01 | [Artificial Intelligence and Adolescent Well-being](https://www.apa.org/topics/artificial-intelligence-machine-learning/health-advisory-ai-adolescent-well-being.pdf) | professional advisory PDF | 6,716 | `f4cd069342ec59a43dffb38de90bacaffeb10eb7dbc9c16b777b8b0266f680db` | 2 / 2 / 898 | U2 | no supported error; challenges A recall and PDF extraction boundaries |
| sh02 | [Consensual Relationships Policy](https://www.buffalo.edu/content/dam/authoritative/policy/30DayReview/Consensual%20Relationships%20Policy%20for%2030Day%20Review%2001-10-20.pdf) | university policy PDF | 2,576 | `26d0a1de634b079b80b48a2c3b96ff594ec0f1cecf567f721bd1eef3b0c1b595` | 2 / 43 / 210 | I2 U41 | 2/2 supported I correct; one nearest nonmatch is Authority Firewall |
| sh03 | [Who has parental responsibility](https://www.gov.uk/parental-rights-responsibilities/who-has-parental-responsibility) | government guidance | 316 | `1f14a613215e1f27dde3f62c2e3224a4923f20851f25e41f8a215f55831e0e5e` | 0 / 1 / 25 | U1 | safe abstention; challenges X recall |
| sh04 | [Perceptions of primary and secondary relationships in polyamory](https://pmc.ncbi.nlm.nih.gov/articles/PMC5436896/) | research article | 12,280 | `f16d24b5f6b85e8cc84e666d634cb6e1ac5fafa5aaae690f817525e82ab90f77` | 35 / 242 / 781 | U242 | mapped/known-doctrine territory; no new umbrella |
| sh05 | [PostgreSQL 18: Role Membership](https://www.postgresql.org/docs/18/role-membership.html) | technical documentation | 850 | `f4e480d8b767c0abc29e4b05722fe6b67876ff6329747d0a0c0185581b4528c6` | 0 / 1 / 124 | U1 | RBAC/database role negative control passed |

Final holdout totals are 22,738 words, 39 / 289 / 2,038
mapped/unmatched/excluded, I2 U287, and 99.31% abstention. Both supported
assignments were correct institutional-authority classifications and existing-
doctrine retrieval misses. Two supported cases are too few for a general live
precision claim; the value of this holdout is its untouched error check.

## Before and after examples

| Before review | Final taxonomy 1.1 behavior |
|---|---|
| Supported authority and synthetic-reciprocity fragments defaulted to `Possible doctrine gap`. | Current owner metadata produces `Existing doctrine, retrieval miss`; boundary claims remain boundary evidence. |
| A report-scope list of patients, donors, intended parents, and surrogates could classify as Role unbundling. | It abstains because no separation/substitution/comparison mechanism exists. |
| Legal-parenthood consent, parental orders, eligibility, and recognition could inherit Role from reproduction vocabulary. | External recognition wins when the exact fragment states a legal or administrative effect; Role can be secondary only with explicit separation evidence. |
| `separate ANCOVA` plus parent/family terms could trigger Role. | Statistical-methods furniture abstains. |
| Markdown collapsed `First  clause.\nSecond\tclause.`. | Excerpt serialization preserves spaces, tabs, line breaks, blank lines, and safely encodes only `&`, `<`, and `>`. JSON remains exact. |
| A legacy result without triage rendered `Unmatched — Unclassified`. | Missing metadata renders plain `Unmatched`; only an explicit versioned abstention renders `Unmatched — Unclassified`. |

## Taxonomy decisions

Retained:

- Asymmetric or nonhuman relationships
- Institutional authority and governance
- Role unbundling and family formation
- External recognition and administrative access
- Brief or nonrelationship interactions
- Unclassified

Changed:

- A and I gained explanatory doctrine-owner metadata.
- Role boundaries were narrowed to explicit relational separation mechanisms.
- External recognition gained precedence for legal/administrative effects.
- Furniture/title/method/technical guards became case- and transport-stable.

Split, merge, and rename decisions: none. The six umbrella labels remain
unchanged in taxonomy 1.1.

Rejected as new umbrellas:

- consensual non-monogamy as a topic, because current doctrine/retrieval and
  boundary reasons explain it without a new subject mechanism;
- assisted reproduction procedure, because procedure alone is not relational
  role unbundling;
- AI/customer support, RBAC, database roles, service accounts, and parent-child
  technical vocabulary, because they are outside the human-relational frame;
- legal parenthood as a separate umbrella, because External recognition has a
  clear mechanism and boundary for it.

Newly proposed umbrellas: none. No candidate met the recurrence, coherent-
mechanism, non-absorbability, reviewer-value, and negative-boundary criteria.

## Exact fragments and exports

The final artifact audit covered 84 analyses and 4,712 unmatched items across
the 38-source replay, three remediation sets, and the 29-source invariance
corpus. Every item preserved its exact source fragment and parent boundary;
JSON, Markdown, forward/reverse order, case/whitespace normalization, and
transport normalization were exact. It found 110 supported and 4,602
abstained records.

The preserved current examples were regenerated from the final analyses after
the classifier freeze. Historical taxonomy 1.0 copies remain beside them.

| Example | Queue items | JSON SHA-256 | Markdown SHA-256 |
|---|---:|---|---|
| `f03-admin-hfea-modernising` | 21 | `b0d59cb6f38b412dfd9878da76be7dbfe8ee84abcbf5738418be42261125841b` | `4a8e126710b1b345eed413bbb9818c2280ac11300979ed927bb278228a12ebde` |
| `f05-brief-speed-dating` | 111 | `6cdd118da5f17e9717a00cc29157868dfaf0b91d08a49ad95b9eba3a54475985` | `1d91fa9a66217558af3a28d5c2a83852ca45c418a78e15ed6cadcbc404b8ace1` |
| `f06b-negative-nist-rbac` | 1 | `ba9eff3428932c86f0430dd39009da177b0de118fff464aa52f29e02047dc5e5` | `595e3efa7d206b84797a2e2c817582e31b11f8f0066ce54988baebe7726df5d6` |

Each current JSON and Markdown export reproduces byte-for-byte from its current
analysis through the documented export normalization. Every JSON excerpt
equals the corresponding source-unit text. The final acceptance pass verified
all six saved files against fresh current serializer calls after regeneration.

## Matcher and gate invariance

The complete 29-source 2.7.0 baseline versus final candidate comparison passed:

- 29 sources
- 3,548 passages
- 3,238 claims
- 911 mapped
- 2,327 unmatched
- 7,626 excluded

The projection compares scores, doctrine ownership, gates, alignment,
exclusions, mappings, and all pre-existing limitations. It removes only the
exact additive unmatched-umbrella warning. Its self-test proves that the
intended warning passes while unrelated limitation addition, removal, or
rewriting fails; score, ownership, gate, alignment, and exclusion mutations
also fail.

## UI and browser verification

The UI retains native `details`/`summary`, an accessible visible-focus state,
the exact fragment block, rationale, reason, optional secondary umbrella,
optional nearest doctrine nonmatches, and the explanatory-triage disclaimer.
Long labels, rationales, doctrine names, excerpts, and URLs are covered by the
responsive audit and overflow rules. Legacy and explicit-abstention ledger
labels have renderer-helper coverage.

The required local server returned HTTP 200 for `lab.html`. The in-app browser
workflow then failed before a page could open. Exact diagnostic:

`node_repl kernel exited unexpectedly` with
`windows sandbox failed: helper_unknown_error: apply deny-read ACLs`.

The final post-correction attempt repeated the same failure before rendering.
The integrator then authorized commit and merge with this host-environment
limitation recorded rather than represented as completed browser QA.

No alternate browser was substituted, and no screenshot-level or rendered-
viewport claim is made. The unmatched-specific static contract does verify
native `details`/`summary`, visible focus styling, wrapping/overflow rules,
mobile flex wrapping at 540 px, standard-width collapse below 980 px, and both
original/wide container modes. It does not replace actual visual inspection at
mobile, tablet, desktop, 1080p, 1440p, 4K, 16:9, or 16:10 sizes.

## Validation

Final validation completed:

- `npm run test:lab`: 24/24 steps passed, including analyzer, focused
  umbrellas, export, ledger, canon fixtures, release graph, UI audit, and site
  integrity;
- `node tests/lab-unmatched-umbrellas.test.mjs`: 7/7 passed;
- `node tools/lab-unmatched-umbrella-audit.mjs`: 61 frozen cases, 100%
  primary/reason/secondary agreement, 40.98% abstention;
- `node tools/lab-unmatched-invariance-audit.mjs <baseline> <after-1.1>`:
  exact across all 29 sources;
- `node tools/lab-unmatched-artifact-audit.mjs`: default evidence discovery
  passed with 84 analyses and 4,712 unmatched items exact;
- preserved real-output JSON/Markdown reproduction: byte-exact from all three
  current analyses;
- `git diff --check`: passed;
- final production call-path scan: one classifier definition and exactly one
  production call, `classifyUnmatchedPassage(result.unit.text)`;
- canon diff: empty.

`origin/main` was refreshed after validation and remained
`69b4bab12a193e1fccb6f80359ff2fc4334ea4f9`, equal to the branch base. There
were zero upstream changed paths and zero collisions with the 26 worktree
paths.

## Limitations and follow-up

- The frozen evaluation measures a compact manually reviewed set, not a
  population rate.
- The 38-source replay influenced rule discovery, so its 62/62 supported
  precision is not an untouched holdout estimate.
- The second remediation set also influenced the final statistical-methods
  guard and is explicitly treated as discovery evidence.
- The untouched final holdout has only two supported results; it is a safety
  check, not a precise accuracy estimate.
- High abstention is deliberate, but A, I, and especially X recall remain
  conservative. Legal-parenthood and policy fragments can abstain when the
  exact sentence lacks enough mechanism evidence.
- PDF text extraction can interleave columns; exact extracted boundaries are
  preserved, but extraction quality can constrain classification.
- Browser-level responsive, keyboard, and screenshot QA remains unavailable
  because the in-app browser runtime failed at Windows deny-read ACL setup. The
  static contract passed but is not represented as rendered visual evidence.
  The integrator explicitly authorized proceeding with this environment
  limitation recorded after the final retry.
- No new umbrella was promoted. Future promotion still requires at least
  three independent sources and the existing mechanism/boundary criteria.

## Handoff

The implementation changes the post-match triage, UI, export, tests, audits,
documentation, and release/cache graph only. Canon, matching scores,
thresholds, gates, exclusions, alignment, doctrine ownership, and doctrine
coverage are unchanged. The final origin refresh found no collision.
Repository-side corrections and all automated validations passed; the
integrator authorized commit and merge. The only incomplete acceptance evidence
is rendered in-app browser QA, blocked by the exact Windows ACL failure recorded
above; it is not misrepresented as complete.
