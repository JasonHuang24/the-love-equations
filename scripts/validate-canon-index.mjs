#!/usr/bin/env node
/**
 * Validate the generated LE Lab canon index against both its schema contract
 * and the canonical source files from which it was built.
 *
 * Run:
 *   node scripts/validate-canon-index.mjs
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  EVIDENCE_TYPES,
  INDEX_PATH,
  INDEX_SCHEMA_VERSION,
  ROOT_DIR,
  buildCanonIndex,
  knownAnchors,
} from './build-canon-index.mjs';

const REQUIRED_ENTRY_STRINGS = [
  'id',
  'title',
  'page',
  'category',
  'subcategory',
  'synopsis',
  'evidenceType',
  'contentType',
];

const REQUIRED_ENTRY_ARRAYS = [
  'aliases',
  'phrases',
  'dependencies',
  'related',
  'boundaryConditions',
  'commonMisreadings',
  'sourceLinks',
  'pressureTests',
];

function fail(message) {
  throw new Error(message);
}

function sortedCountBy(entries, key) {
  return Object.fromEntries(
    [...entries.reduce((counts, entry) => {
      counts.set(entry[key], (counts.get(entry[key]) || 0) + 1);
      return counts;
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)),
  );
}

function assertUniqueStrings(values, label) {
  assert(Array.isArray(values), `${label} must be an array`);
  for (const value of values) {
    assert.equal(typeof value, 'string', `${label} must contain only strings`);
    assert(value.trim(), `${label} must not contain blank strings`);
  }
  assert.equal(new Set(values).size, values.length, `${label} contains duplicate values`);
}

async function fileExists(relativePath) {
  try {
    await fs.access(path.join(ROOT_DIR, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const raw = await fs.readFile(INDEX_PATH, 'utf8');
  const index = JSON.parse(raw);

  assert.equal(index.schemaVersion, INDEX_SCHEMA_VERSION, 'Unexpected canon-index schema version');
  assert.match(index.indexVersion, /^1\.0\.0\+[a-f0-9]{12}$/, 'Malformed indexVersion');
  assert(!Number.isNaN(Date.parse(index.generatedAt)), 'generatedAt must be an ISO-compatible date');
  assert(Array.isArray(index.sourcePages), 'sourcePages must be an array');
  assert(Array.isArray(index.entries), 'entries must be an array');
  assert(index.stats && typeof index.stats === 'object', 'stats must be an object');

  const ids = new Set();
  const pages = new Set(index.sourcePages.map((source) => source.page));
  for (const source of index.sourcePages) {
    for (const field of ['page', 'title', 'category', 'sourceType', 'sha256']) {
      assert.equal(typeof source[field], 'string', `sourcePages.${source.page || '?'} .${field} must be a string`);
      assert(source[field].trim(), `sourcePages.${source.page || '?'} .${field} must not be blank`);
    }
    assert.match(source.sha256, /^[a-f0-9]{64}$/, `${source.page} has a malformed SHA-256`);
    assert(Number.isInteger(source.conceptCount) && source.conceptCount >= 0, `${source.page} has invalid conceptCount`);
    assertUniqueStrings(source.inputs, `${source.page}.inputs`);
    for (const input of source.inputs) {
      assert(await fileExists(input), `${source.page} references missing input ${input}`);
    }
  }
  assert.equal(pages.size, index.sourcePages.length, 'sourcePages contains duplicate pages');

  for (const entry of index.entries) {
    for (const field of REQUIRED_ENTRY_STRINGS) {
      assert.equal(typeof entry[field], 'string', `${entry.id || '?'} .${field} must be a string`);
      assert(entry[field].trim(), `${entry.id || '?'} .${field} must not be blank`);
    }
    assert.equal(typeof entry.anchor, 'string', `${entry.id}.anchor must be a string`);
    assert.equal(typeof entry.verdict, 'string', `${entry.id}.verdict must be a string`);
    assert(
      !entry.verdict || !entry.aliases.some((alias) => alias === entry.verdict),
      `${entry.id} repeats its verdict "${entry.verdict}" as a match alias`,
    );
    assert(!ids.has(entry.id), `Duplicate canon ID ${entry.id}`);
    ids.add(entry.id);
    assert(pages.has(entry.page), `${entry.id} points to unindexed page ${entry.page}`);
    assert(EVIDENCE_TYPES.has(entry.evidenceType), `${entry.id} has malformed evidenceType ${entry.evidenceType}`);

    for (const field of REQUIRED_ENTRY_ARRAYS) {
      assert(Array.isArray(entry[field]), `${entry.id}.${field} must be an array`);
    }
    for (const field of REQUIRED_ENTRY_ARRAYS.filter((field) => field !== 'sourceLinks')) {
      assertUniqueStrings(entry[field], `${entry.id}.${field}`);
    }
    for (const source of entry.sourceLinks) {
      assert(source && typeof source === 'object', `${entry.id}.sourceLinks must contain objects`);
      assert.equal(typeof source.label, 'string', `${entry.id} has a source link without a label`);
      assert(source.label.trim(), `${entry.id} has a blank source-link label`);
      assert.equal(typeof source.url, 'string', `${entry.id} has a source link without a URL`);
      assert.match(source.url, /^https?:\/\//i, `${entry.id} source URL must use HTTP(S): ${source.url}`);
    }
  }

  for (const entry of index.entries) {
    const relations = [...entry.dependencies, ...entry.related];
    for (const relation of relations) {
      assert(ids.has(relation), `${entry.id} points to missing relation ${relation}`);
      assert.notEqual(relation, entry.id, `${entry.id} points to itself`);
    }
    const overlap = entry.dependencies.filter((relation) => entry.related.includes(relation));
    assert.equal(overlap.length, 0, `${entry.id} repeats relations as both dependencies and related`);
  }

  const { anchors, duplicates } = await knownAnchors();
  for (const [page, duplicateAnchors] of duplicates) {
    if (duplicateAnchors.length) {
      fail(`${page} contains duplicate IDs: ${duplicateAnchors.join(', ')}`);
    }
  }
  for (const entry of index.entries) {
    if (entry.anchor && !anchors.get(entry.page)?.has(entry.anchor)) {
      fail(`${entry.id} points to missing anchor ${entry.page}#${entry.anchor}`);
    }
  }

  assert.equal(index.stats.conceptCount, index.entries.length, 'stats.conceptCount is stale');
  assert.equal(index.stats.sourceCount, index.sourcePages.length, 'stats.sourceCount is stale');
  assert.deepEqual(index.stats.byCategory, sortedCountBy(index.entries, 'category'), 'stats.byCategory is stale');
  assert.deepEqual(
    index.stats.byEvidenceType,
    sortedCountBy(index.entries, 'evidenceType'),
    'stats.byEvidenceType is stale',
  );
  assert.equal(
    index.stats.anchoredConceptCount,
    index.entries.filter((entry) => entry.anchor).length,
    'stats.anchoredConceptCount is stale',
  );
  assert.equal(
    index.stats.conceptsWithExternalSources,
    index.entries.filter((entry) => entry.sourceLinks.length).length,
    'stats.conceptsWithExternalSources is stale',
  );
  assert.equal(
    index.stats.dependencyCount,
    index.entries.reduce((sum, entry) => sum + entry.dependencies.length, 0),
    'stats.dependencyCount is stale',
  );
  assert.equal(
    index.stats.relatedCount,
    index.entries.reduce((sum, entry) => sum + entry.related.length, 0),
    'stats.relatedCount is stale',
  );
  for (const source of index.sourcePages) {
    assert.equal(
      source.conceptCount,
      index.entries.filter((entry) => entry.page === source.page).length,
      `${source.page}.conceptCount is stale`,
    );
  }

  const rebuilt = await buildCanonIndex({ generatedAt: index.generatedAt });
  assert.deepEqual(index, rebuilt, 'Generated index is stale; run node scripts/build-canon-index.mjs');

  process.stdout.write(
    `Validated ${index.stats.conceptCount} concepts across ${index.stats.sourceCount} source pages `
    + `(${index.indexVersion}); IDs, relations, source files, fragments, evidence types, counts, and generated output are sound.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
