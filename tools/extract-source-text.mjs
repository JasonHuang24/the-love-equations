#!/usr/bin/env node
/*
 * LE Lab corpus — deterministic HTML → plain-text extractor.
 *
 * Why this is a committed script rather than an ad-hoc conversion: the corpus
 * archive (lab-corpus/) is gitignored, so the only thing that can prove a
 * future re-acquisition produced the same analyzed text is a reproducible
 * chain — archived HTML → this script → the SHA-256 recorded in
 * lab-corpus.manifest.json. A model-mediated "read the page and write it out"
 * step would break that chain: it is not reproducible byte-for-byte.
 *
 * No network access, no model, no heuristics that depend on page content. Same
 * input bytes plus same arguments always produce the same output bytes.
 *
 * Usage:
 *   node tools/extract-source-text.mjs <html-file> <container-regex> [options]
 *
 * Options:
 *   --cut <regex>    Truncate the container at the first match (share rails,
 *                    comment forms, and other trailing boilerplate).
 *   --drop <regex>   Remove every sub-container whose opening tag matches.
 *                    Repeatable.
 *   --keep-nbsp      Archive U+00A0 as itself instead of folding it to a plain
 *                    space, and drop blocks whose entire content is one. OFF by
 *                    default, and the default is load-bearing — see below.
 *
 * The container and drop patterns match an OPENING TAG; the matching close tag
 * is found by balancing that tag name, so nesting is handled correctly.
 *
 * WHY --keep-nbsp IS OPT-IN (pt10 finding F1).
 *
 * Until 2026-08-08 this script deleted every non-breaking space unconditionally:
 * `&nbsp;` became a plain space, and any literal U+00A0 was swallowed by the
 * horizontal-whitespace collapse. So no HTML-sourced corpus text could hold
 * one, and v2.6.21's "one NBSP bins a passage at the relevance gate" fix was
 * unreachable from the corpus — a blindness manufactured HERE, not by the
 * sources: `12th&nbsp;graders` (11-ifs) and `and&nbsp;traveling more` (15-asc)
 * are sitting in the archived captures right now.
 *
 * Making preservation the DEFAULT was measured and refused. 17 of the 19
 * archived raw captures carry an NBSP somewhere, so it would rewrite most
 * archived texts, invalidate the SHA-256 chains recorded in
 * lab-corpus.manifest.json, and — because unit IDs are content-derived —
 * orphan threshold rulings keyed to passages that would no longer hash the
 * same. Default byte-identity is what keeps the existing archive valid; the
 * flag is how a NEW capture can carry the surface.
 *
 * The flag also drops a block whose entire content is non-breaking space:
 * `<p>&nbsp;</p>` is how a forum editor writes a blank line. It is layout, and
 * archiving it would buy blank-line noise rather than the defect surface.
 *
 * U+00A0 never appears in this file as a literal byte: it is built from its
 * code point and every pattern that mentions it is assembled from that constant.
 * It used to sit as a literal inside two character classes, where it was
 * invisible — most of why the behaviour above went unnoticed for as long as it
 * did, and why the SECOND of the two sites (the `\s+` fold) was missed even by
 * the finding that named the first.
 */
import fs from 'node:fs';

const [file, containerPattern, ...rest] = process.argv.slice(2);
const keepNbsp = rest.includes('--keep-nbsp');
const NBSP = String.fromCharCode(0xA0);

/*
 * The two places a non-breaking space used to die, and one to undo the second.
 *
 * HTML_WS is step 1's whitespace fold. `\s` matches U+00A0 in JavaScript, so
 * that fold killed the LITERAL form before any entity had even been decoded —
 * the site that is easy to miss, because nothing in it names the character.
 * HORIZONTAL_WS is step 3, which killed whatever survived it. SPACER_LINE is
 * the flag's other half: a block whose whole content is one is layout, not text.
 */
const HTML_WS = new RegExp(`[^\\S${NBSP}]+`, 'g');
const HORIZONTAL_WS = new RegExp(`[ \\t${NBSP}]+`, 'g');
const SPACER_LINE = new RegExp(`^[ \\t]*${NBSP}+[ \\t]*$`, 'gm');

if (!file || !containerPattern) {
  process.stderr.write('usage: extract-source-text.mjs <html-file> <container-regex> [--cut <regex>] [--drop <regex>] [--keep-nbsp]\n');
  process.exit(2);
}

let html = fs.readFileSync(file, 'utf8');

// 1. Remove everything that is not prose.
html = html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
  .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  // HTML treats every source newline as ordinary whitespace. Collapse them now
  // so paragraph breaks come only from block tags, never from where the CMS
  // happened to wrap a line (The New Inquiry's drop-cap span embeds one).
  //
  // `\s` MATCHES U+00A0 in JavaScript, so this line is the FIRST of the two
  // places a non-breaking space used to die — and the one that killed the
  // literal form, before any entity had been decoded. Under --keep-nbsp the
  // class becomes "whitespace except U+00A0"; the default stays `\s+` exactly.
  .replace(keepNbsp ? HTML_WS : /\s+/g, ' ');

/** Slice a container by balancing its own tag name. */
function sliceContainer(source, pattern) {
  const match = new RegExp(pattern, 'i').exec(source);
  if (!match) throw new Error(`container not found: ${pattern}`);
  const tagName = /^<\s*([a-z0-9]+)/i.exec(match[0])[1].toLowerCase();
  const scanner = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}\\s*>`, 'gi');
  scanner.lastIndex = match.index;
  let depth = 0;
  let token;
  while ((token = scanner.exec(source))) {
    if (token[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) return source.slice(match.index, scanner.lastIndex);
    } else if (!token[0].endsWith('/>')) {
      depth += 1;
    }
  }
  throw new Error(`unbalanced container: ${pattern}`);
}

let body = sliceContainer(html, containerPattern);

const cutIndex = rest.indexOf('--cut');
if (cutIndex >= 0) {
  const cut = new RegExp(rest[cutIndex + 1], 'i').exec(body);
  if (!cut) throw new Error(`cut marker not found: ${rest[cutIndex + 1]}`);
  body = body.slice(0, cut.index);
}

for (let index = 0; index < rest.length; index += 1) {
  if (rest[index] !== '--drop') continue;
  const pattern = rest[index + 1];
  for (;;) {
    let chunk;
    try {
      chunk = sliceContainer(body, pattern);
    } catch {
      break;
    }
    body = body.replace(chunk, ' ');
  }
}

// 2. Block-level tags become paragraph breaks; inline tags vanish.
let text = body
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|section|article|h[1-6]|li|tr|blockquote|figcaption|ul|ol|table)\s*>/gi, '\n\n')
  .replace(/<(p|div|section|article|h[1-6]|li|tr|blockquote|figcaption)\b[^>]*>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, keepNbsp ? NBSP : ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
  .replace(/&#8217;|&rsquo;/gi, '’')
  .replace(/&#8216;|&lsquo;/gi, '‘')
  .replace(/&#8220;|&ldquo;/gi, '“')
  .replace(/&#8221;|&rdquo;/gi, '”')
  .replace(/&#8211;|&ndash;/gi, '–')
  .replace(/&#8212;|&mdash;/gi, '—')
  .replace(/&#8230;|&hellip;/gi, '…')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

// 3. Horizontal whitespace collapses to one space. U+00A0 is inside that class
// by default — which is exactly what erased it — and outside it under
// --keep-nbsp, where it is content rather than spacing.
text = keepNbsp
  ? text.replace(/[ \t]+/g, ' ')
  : text.replace(HORIZONTAL_WS, ' ');

// 4. Under --keep-nbsp only: a block whose entire content is non-breaking space
// is a layout spacer, not a passage. Emptying the line here lets the paragraph
// fold below treat it as the blank line its author meant.
if (keepNbsp) {
  text = text.replace(SPACER_LINE, '');
}

text = text
  .replace(/ *\n */g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

process.stdout.write(`${text}\n`);
