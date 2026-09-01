#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  UNMATCHED_TRIAGE_SCHEMA_VERSION,
  UNMATCHED_UMBRELLA_TAXONOMY,
  UNMATCHED_UMBRELLA_TAXONOMY_VERSION,
  classifyUnmatchedPassage,
} from '../js/lab-unmatched-umbrellas.js';
import {
  analysisToJson,
  researchQueueToJson,
  researchQueueToMarkdown,
} from '../js/lab-export.js';

function analysisFiles(root) {
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...analysisFiles(target));
    else if (entry.name.endsWith('.json')) {
      try {
        const value = JSON.parse(fs.readFileSync(target, 'utf8'));
        if (value?.schemaVersion?.startsWith('le-lab.analysis/')) found.push([target, value]);
      } catch {
        // Non-JSON and partial evidence files are outside this audit's population.
      }
    }
  }
  return found;
}

function markdownExcerpt(fragment) {
  return String(fragment)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split(/\r\n|\r|\n/)
    .map((line) => (line.length ? `> ${line}` : '>'))
    .join('\n');
}

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/*
 * CURRENT evidence only. The taxonomy-1.0 and 1.1 directories beside these are
 * preserved untouched as historical evidence and are deliberately NOT listed:
 * the version pins below fail on them, which is the point. Passing a stale
 * directory explicitly still fails loudly rather than being quietly accepted,
 * so "the audit passed" cannot mean "the audit read last release's evidence".
 */
const DEFAULT_EVIDENCE_DIRS = Object.freeze([
  'pressure-raw-1.3',
  'pressure-observational-1.3',
  'pressure-holdout-1.3',
  'pressure-confirmation-1.3',
  'pressure-final-holdout-1.3',
  'pressure-remediation-holdout-1.3',
  'pressure-remediation-holdout-2-1.3',
  'pressure-remediation-holdout-3-1.3',
  'after-1.3',
]);

function defaultRoots() {
  const candidates = [
    path.join(PROJECT_ROOT, 'artifacts', 'unmatched-umbrellas'),
    path.resolve(PROJECT_ROOT, '..', '..', 'unmatched-umbrellas'),
  ];
  const evidenceRoot = candidates.find((candidate) =>
    fs.existsSync(candidate) && fs.statSync(candidate).isDirectory());
  assert.ok(
    evidenceRoot,
    'default unmatched-umbrella evidence root was not found; '
      + 'pass one or more analysis directories explicitly',
  );
  const roots = DEFAULT_EVIDENCE_DIRS.map((directory) => path.join(evidenceRoot, directory));
  const missing = roots.filter((root) =>
    !fs.existsSync(root) || !fs.statSync(root).isDirectory());
  assert.deepEqual(
    missing,
    [],
    `default unmatched-umbrella evidence directories are missing: ${missing.join(', ')}`,
  );
  return roots;
}

const requestedRoots = process.argv.slice(2);
const roots = requestedRoots.length
  ? requestedRoots.map((value) => path.resolve(value))
  : defaultRoots();

const umbrellaIds = new Set(UNMATCHED_UMBRELLA_TAXONOMY.umbrellas.map(({ id }) => id));
const reasonIds = new Set(UNMATCHED_UMBRELLA_TAXONOMY.unmatchedReasons.map(({ id }) => id));
const files = roots.flatMap(analysisFiles).sort(([left], [right]) => left.localeCompare(right));
assert.ok(files.length, 'no analysis artifacts found');

const firstPass = new Map();
let items = 0;
let supported = 0;
for (const [file, analysis] of files) {
  const segments = new Map((analysis.segments || []).map((segment) => [segment.unit.id, segment]));
  const markdown = researchQueueToMarkdown(analysis);
  const markdownAgain = researchQueueToMarkdown(analysis);
  assert.equal(markdownAgain, markdown, `${file}: Markdown export drift`);
  const json = analysisToJson(analysis);
  assert.equal(analysisToJson(analysis), json, `${file}: JSON export drift`);
  const parsedJson = JSON.parse(json);
  assert.equal(
    analysisToJson(parsedJson),
    json,
    `${file}: analysis JSON round trip after the documented source-URL sanitization`,
  );
  const queueJson = JSON.parse(researchQueueToJson(analysis));

  for (let index = 0; index < (analysis.researchQueue?.items || []).length; index += 1) {
    const item = analysis.researchQueue.items[index];
    const segment = segments.get(item.segmentId);
    assert.ok(segment, `${file}: missing queue segment ${item.segmentId}`);
    assert.equal(item.excerpt, segment.unit.text, `${file}: exact fragment drift`);
    assert.equal(item.parentSegmentId, segment.unit.parentSegmentId, `${file}: parent boundary drift`);
    assert.deepEqual(
      queueJson.queue.items[index].excerpt,
      item.excerpt,
      `${file}: queue JSON fragment drift`,
    );
    assert.ok(markdown.includes(markdownExcerpt(item.excerpt)), `${file}: Markdown excerpt missing`);

    const triage = item.unmatchedTriage;
    assert.equal(triage.schemaVersion, UNMATCHED_TRIAGE_SCHEMA_VERSION, file);
    assert.equal(triage.taxonomy.version, UNMATCHED_UMBRELLA_TAXONOMY_VERSION, file);
    assert.ok(umbrellaIds.has(triage.primaryUmbrella.id), file);
    assert.ok(reasonIds.has(triage.unmatchedReason.id), file);
    assert.equal(triage.abstained, triage.primaryUmbrella.id === 'unclassified', file);
    assert.match(item.nearestConceptsStatus, /nonmatches/i, file);
    assert.deepEqual(classifyUnmatchedPassage(item.excerpt), triage, `${file}: stored triage drift`);
    firstPass.set(`${file}\u0000${item.id}`, JSON.stringify(triage));
    if (!triage.abstained) supported += 1;
    items += 1;
  }
}

for (const [file, analysis] of [...files].reverse()) {
  for (const item of [...(analysis.researchQueue?.items || [])].reverse()) {
    const expected = firstPass.get(`${file}\u0000${item.id}`);
    assert.equal(JSON.stringify(classifyUnmatchedPassage(item.excerpt)), expected, `${file}: order drift`);
    assert.equal(
      JSON.stringify(classifyUnmatchedPassage(`  ${item.excerpt.toUpperCase().replace(/\s+/g, '   ')}  `)),
      expected,
      `${file}: case/whitespace normalization drift`,
    );
    assert.equal(
      JSON.stringify(classifyUnmatchedPassage(
        `\u200b${item.excerpt.replace(/ /g, '\u00a0').replace(/\. /g, '.\r\n')}\u2060`,
      )),
      expected,
      `${file}: transport normalization drift`,
    );
  }
}

process.stdout.write(
  `UNMATCHED ARTIFACT AUDIT PASSED · analyses=${files.length} · items=${items}`
  + ` · supported=${supported} · abstained=${items - supported}`
  + ' · fragments/boundaries/JSON/Markdown/order/normalization=exact\n',
);
