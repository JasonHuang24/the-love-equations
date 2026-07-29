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
 *
 * The container and drop patterns match an OPENING TAG; the matching close tag
 * is found by balancing that tag name, so nesting is handled correctly.
 */
import fs from 'node:fs';

const [file, containerPattern, ...rest] = process.argv.slice(2);

if (!file || !containerPattern) {
  process.stderr.write('usage: extract-source-text.mjs <html-file> <container-regex> [--cut <regex>] [--drop <regex>]...\n');
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
  .replace(/\s+/g, ' ');

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
const text = body
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|section|article|h[1-6]|li|tr|blockquote|figcaption|ul|ol|table)\s*>/gi, '\n\n')
  .replace(/<(p|div|section|article|h[1-6]|li|tr|blockquote|figcaption)\b[^>]*>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
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
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/[ \t ]+/g, ' ')
  .replace(/ *\n */g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

process.stdout.write(`${text}\n`);
