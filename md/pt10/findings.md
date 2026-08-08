# PT10 findings — recorded, not fixed

This run widens the instrument. It changes no engine code, no canon, no
threshold. Everything below is a finding for a future engine or doctrine
session, with the repro that produced it.

---

## F1 — no HTML-sourced corpus text can ever carry an NBSP

**The acquisition chain erases the surface, not the sources.** pt09 §6 recorded
the corpus as unable to exercise "Unicode spacing" and attributed it to the
academic register. That is only half true: a reader-shaped page *does* carry
U+00A0, and the committed extractor removes it.

Repro, on the archived pair:

```
raw    lab-corpus/sources/27-loveshack-defensive-partner.raw.html : 136 × U+00A0, 2 × &nbsp;
text   lab-corpus/sources/27-loveshack-defensive-partner.txt      :   0 × U+00A0
```

Cause, both in `tools/extract-source-text.mjs`:

- line 99 — `.replace(/&nbsp;/g, ' ')` turns the entity into a plain space
- line 113 — `.replace(/[ \t ]+/g, ' ')` collapses any surviving literal

Consequence: `v2.6.21 #3` (the relevance gate reads `normalizeText`, and one
non-ASCII space binned a passage) is unreachable from every corpus source whose
text came through this extractor — **20 of the 29** (19 archived `.raw.html`
plus source 25's comment bodies). The other nine come through `pdftotext`,
which emits no NBSP either.

**Do not simply add `--keep-nbsp`.** Measured before recommending it: all 136
literal NBSPs in source 27's raw capture are empty-paragraph spacers
(`<p>\n\t&nbsp;\n</p>` — the forum editor's blank line), not NBSP inside a
sentence. Preserving them would archive blank-line noise and *still* not
exercise the defect. Across the 15 reader-shaped pages captured or examined
this run, **NBSP inside a sentence did not occur once**. If the surface is
wanted, it has to come from a source archived off the HTML path — a Word/RTF
document, or a paste captured as-is — not from a flag.

## F2 — the sweep cannot detect RTF, so the RTF fix is unreachable by design

`js/lab-intake.js` `detectTextFormat` (lines 188–215) sniffs VTT, SRT and JSON
from content, but RTF is recognised **only** by file extension or MIME type.
A `{\rtf1…` document with neither falls through the JSON branch (the leading
brace fails `JSON.parse`) and returns `'text'`:

```js
detectTextFormat({ text: '{\\rtf1\\ansi… }' })                    // 'text'
detectTextFormat({ fileName: 'x.rtf', text: '{\\rtf1…' })         // 'rtf'
detectTextFormat({ mimeType: 'application/rtf', text: '{\\rtf1…' })// 'rtf'
```

Both `tools/lab-threshold-sweep.mjs:117` and
`tests/lab-threshold-neighbors.test.mjs:94` call `normalizeInput` with
`format: 'auto'` and no `fileName`/`mimeType`. So an `.rtf` archived as a corpus
source would be swept as **plain text with the control words as prose**, and
`parseRtfDocument` — the `v2.6.21 #8` fix site — would never run.

The fix class is therefore not "acquire an RTF source": it is either a content
sniff for `{\rtf` in `detectTextFormat`, or a manifest-declared `format` the
sweep passes through. Recorded for the engine session; **not built here.**

## F3 — pt09 §6's blanket is too broad in three places

pt09 concluded that all eleven v2.6.21 fixes moved zero corpus rows *because
the corpus cannot see these defects*. Measured per surface (census §2), three
of them were already denser in the old corpus than in reader text:

| surface | old /10k | pt10 /10k |
|---|---:|---:|
| decimals + abbreviation periods (`#11`) | 138.4 | 2.1 |
| statistics spelled in words (`#12`) | 19.4 | 3.6 |
| marry conjugation in CLAIM_CUES (`v2.6.22`) | 11.9 | 4.0 |

Their zero has a different cause — the fix is real but the corpus passages that
carry the surface do not sit near a threshold. A future session should not
spend budget widening the corpus for these three; the pt09 finding stands for
the other eight.

## F4 — the domain gate keeps a third of reader discourse, and it is right to

`keep%` (swept ÷ claim-like): **48.2% academic/newsroom → 34.1% reader-shaped**
(census §3). Spot-checked against source 27's binned claim-like units, the
binning is correct: reader discourse is mostly narrated particulars ("We both
go to the gym 4–5 times per week", "This was on Friday night") which the gate
exists to set aside. No fix is implied. The number is the one to plan with —
a reader's paste yields roughly two thirds set-aside where a paper yields half,
so a coverage percentage measured on this corpus is not comparable across the
two registers without saying which one it was measured on.

## F5 — the largest reservoir of reader discourse is bot-walled

Reddit (`old.reddit.com` HTML and the `.json` API), Ask MetaFilter, The Bump,
enotalone, Ask a Manager and datingadvice.com all refuse a plain browser UA
from this environment (403, or Reddit's login wall); talkaboutmarriage returns
a Cloudflare challenge; Mumsnet renders thread links client-side. See
`CLAIMS.md` for the full rejection list.

This is a **standing constraint on the corpus programme**, not a one-run
accident: the registers reachable by `curl` are publisher-side (advice columns,
moderated comment sections, older forum software). Genuinely peer-to-peer
platform discourse is not reachable, and no amount of widening from this
environment will make it so. If that register matters, it needs a different
acquisition route and Jason's decision — recorded, not solved.

## F6 — the chat register is the least canon-legible thing in the tranche

Source 23 (Slate's two-columnist chat) retains **13.3%** of its claim-like
units, the lowest in the tranche and below every source in the old corpus
except four that are near-zero by topic (12-nep 0.0%, 16-pew-emotional-support
7.3%, 15-asc-american-friendship 7.7%, 14-common-sense 10.3%). Speaker-turn
discourse ("Jenée:
Right! I think I have mentioned this in a column before…") is claim-like by the
detector and off-domain by the gate. Not investigated further this run; flagged
because it is the register a live Lab user is most likely to paste and the one
the corpus is now least able to speak for.
