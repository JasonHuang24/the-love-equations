import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * The corpus extractor, guarded.
 *
 * `tools/extract-source-text.mjs` is the reproducibility chain for 20 of the 29
 * archived corpus sources: archived raw HTML -> this script -> the SHA-256 in
 * lab-corpus.manifest.json. It had no test at all until pt10, which is how a
 * silent normalisation survived in it long enough to shape a finding about the
 * corpus (`md/pressure-tests.md`, `# pt10/findings.md`, F1): the extractor
 * deletes every non-breaking space a page carries, so no HTML-sourced corpus
 * text can hold one, and v2.6.21's NBSP-at-the-gate fix was unreachable from
 * the corpus for a reason that had nothing to do with the sources.
 *
 * Two properties are pinned here, and the first is why the second is opt-in:
 *
 *   1. DEFAULT OUTPUT IS UNCHANGED. 17 of the 19 archived raw HTML captures
 *      carry an NBSP somewhere, so preserving them by default would rewrite
 *      most archived texts, break every recorded chain, and — because unit IDs
 *      are content-derived — orphan threshold rulings keyed to passages that
 *      would no longer hash the same. Default byte-identity is the property
 *      that keeps the existing archive valid.
 *
 *   2. `--keep-nbsp` preserves an NBSP that sits BETWEEN WORDS, and still drops
 *      a block whose entire content is one. Both halves matter: measured on the
 *      real captures, `<p>&nbsp;</p>` layout spacers are common and a flag that
 *      kept them would archive blank-line noise instead of the defect surface,
 *      while `12th&nbsp;graders` (11-ifs) and `and&nbsp;traveling more` (15-asc)
 *      are exactly the surface v2.6.21 #3 is about.
 *
 * Every NBSP below is built from a character code, never typed as a literal
 * byte: a test whose subject is an invisible character must not depend on one
 * surviving an editor, a copy-paste, or this file's own encoding.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXTRACTOR = path.join(ROOT, 'tools', 'extract-source-text.mjs');
const NB = String.fromCharCode(0xA0);
const NB_GLOBAL = new RegExp(NB, 'g');

/** Run the extractor over a throwaway HTML file, outside the repo. */
function extract(html, ...args) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'le-extract-'));
  const file = path.join(dir, 'page.html');
  try {
    fs.writeFileSync(file, html, 'utf8');
    const run = spawnSync(process.execPath, [EXTRACTOR, file, '<article>', ...args], {
      encoding: 'utf8',
      timeout: 30_000,
    });
    assert.equal(run.status, 0, `extractor exited ${run.status}: ${run.stderr}`);
    return run.stdout;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// One page carrying both shapes, in both spellings: an NBSP between words
// (entity, then literal) and a spacer paragraph whose whole content is one
// (entity, then literal). Pages in the archive use all four.
const PAGE = '<article>'
  + '<p>A Pew analysis of 12th&nbsp;graders found the gap widened.</p>'
  + '<p>&nbsp;</p>'
  + `<p>They are working longer hours and${NB}traveling more for work.</p>`
  + `<p>${NB}</p>`
  + '<p>Nothing here needs a space at all.</p>'
  + '</article>';

test('the extractor default is unchanged: NBSP still collapses to a plain space', () => {
  const text = extract(PAGE);

  assert.equal((text.match(NB_GLOBAL) || []).length, 0,
    'Default output grew an NBSP. 17 of the 19 archived raw captures carry one, so this '
    + 'rewrites most archived texts, invalidates their recorded SHA-256 chains, and orphans '
    + 'threshold rulings whose unit IDs are derived from the passage text.');
  assert.match(text, /12th graders/);
  assert.match(text, /hours and traveling more/);
  // The spacer paragraphs contributed nothing before and still contribute nothing.
  assert.doesNotMatch(text, /\n\s*\n\s*\n/);
});

test('--keep-nbsp keeps an NBSP between words and still drops a spacer-only block', () => {
  const text = extract(PAGE, '--keep-nbsp');

  assert.match(text, new RegExp(`12th${NB}graders`),
    'the entity form of an in-sentence NBSP was not preserved');
  assert.match(text, new RegExp(`hours and${NB}traveling more`),
    'the literal form of an in-sentence NBSP was not preserved');
  assert.equal((text.match(NB_GLOBAL) || []).length, 2,
    'exactly the two in-sentence NBSPs should survive — neither spacer block may contribute one');

  // No line is only a non-breaking space: a layout spacer is layout, not content.
  const spacerOnly = new RegExp(`^[\\s${NB}]*${NB}[\\s${NB}]*$`);
  const spacerLines = text.split('\n').filter((line) => spacerOnly.test(line));
  assert.deepEqual(spacerLines, [],
    `a spacer block survived as its own line: ${JSON.stringify(spacerLines)}`);

  // Everything else the extractor does is untouched by the flag.
  assert.match(text, /Nothing here needs a space at all\./);
});

test('--keep-nbsp changes nothing else: the two outputs differ only in NBSP', () => {
  const plain = extract(PAGE);
  const kept = extract(PAGE, '--keep-nbsp');

  assert.notEqual(plain, kept, 'the flag did nothing at all');
  assert.equal(kept.replace(NB_GLOBAL, ' '), plain,
    'the flag changed something other than which byte a non-breaking space becomes');
});
