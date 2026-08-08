# PT10 claims ledger

One line per candidate source considered, kept or rejected, with the reason.
Statuses: `kept` (archived and swept) · `rejected` (named cause). Rejections are
recorded because "we could not reach it" and "we chose not to" are different
facts, and the next widening run should not re-spend the hour.

## Kept — the tranche, ids 23–30

- [23-slate-prudence-chat] [kept] advice **chat transcript** — a reader letter
  discussed turn-by-turn by two named columnists; 1,386 words; the only
  two-voice speaker-turn register in the tranche.
- [24-guardian-ask-philippa] [kept] **advice column**, sub-edited broadsheet —
  reader letter + psychotherapist reply; 858 words; typographic punctuation
  throughout (33 U+2019 in 858 words).
- [25-guardian-philippa-comments] [kept] **comment section** — all 251 comments
  on source 24, bodies only, replies inline after their parent; 17,899 words.
  Deliberately paired with 24: the same subject in edited and unedited register.
- [26-captain-awkward-1455] [kept] **advice blog** — letter + long second-person
  reply; 1,216 words; conversational blog register with heavy contractions.
- [27-loveshack-defensive-partner] [kept] **forum thread** (Dating) — opening
  post + multi-poster replies; 4,299 words.
- [28-loveshack-always-the-dumpee] [kept] **forum thread** (Dating) — mate-value
  self-diagnosis, multi-poster; 4,498 words; page 1 of 2 captured, recorded.
  Replaced an earlier pick (`667622-what-is-the-likelihood-he-is-thinking-marriage`)
  that extracted to 659 words — too thin to carry a register.
- [29-dearwendy-too-much-messaging] [kept] **advice column**, informal US dating
  register; 1,036 words.
- [30-alabama-marriage-handbook] [kept] **word-processor / print-authored reader
  handbook** (Alabama Cooperative Extension, HE-0858); 15,890 words; second
  person throughout, numbered exercises, true/false quizzes — the tranche's only
  source of bare list markers at scale (22).

## Rejected — bot-walled (the instrument never got to judge the text)

- [old.reddit.com/r/relationship_advice] [rejected] the subreddit and every
  thread URL return the "Welcome to Reddit" login wall to a plain UA; the
  `.json` API returns 403. **The largest single reservoir of reader-shaped
  relationship discourse is unreachable from this environment** — recorded as
  finding F5 rather than worked around.
- [ask.metafilter.com] [rejected] 403 to a plain UA and to a UA with
  Accept/Accept-Language headers.
- [forums.thebump.com] [rejected] 403. · [enotalone.com] [rejected] 403. ·
  [askamanager.org] [rejected] 403. · [datingadvice.com] [rejected] 403.
- [talkaboutmarriage.com] [rejected] HTTP 202 challenge page (Cloudflare).
- [forum.marriagebuilders.com] [rejected] 307 redirect chain, no thread HTML.
- [mumsnet.com/talk/relationships] [rejected] reachable (200) but the listing
  renders thread links client-side; no thread URL is present in the served HTML.

## Rejected — reachable but wrong for this tranche

- [csueastbay.edu counseling handout PDF] [rejected] scanned images; pdftotext
  yields 0 words.
- [healthymarriageinfo.org 2797.pdf — MRE Program Development and Management
  Manual] [rejected] 59,527 words in **program-administration** register, not
  reader discourse; would have been 38% of the tranche's words on its own and
  unbalanced it. Its 80 soft hyphens were the tranche's only candidate
  format-character surface — see finding F1.
- [fcs.uga.edu NERMEM.pdf] [rejected] academic model paper; the register the
  corpus already has 21 sources of.
