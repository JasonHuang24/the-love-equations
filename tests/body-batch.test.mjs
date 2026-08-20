import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertDatasetMetadata,
  normalizeBatchRow,
  parseCsv,
  sha256,
} from '../tools/run_body_manifest_batch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function bytes(relative) {
  return fs.readFile(path.join(ROOT, ...relative.split('/')));
}

async function text(relative) {
  return fs.readFile(path.join(ROOT, ...relative.split('/')), 'utf8');
}

async function json(relative) {
  return JSON.parse(await text(relative));
}

async function hash(relative) {
  return crypto.createHash('sha256').update(await bytes(relative)).digest('hex');
}

test('independent manifest is complete, hash-bound, and stores no copyrighted stimuli', async () => {
  const manifestText = await text('data/body-independent-manifest.csv');
  const manifest = parseCsv(manifestText);
  const metadata = await json('data/body-independent-manifest.meta.json');

  assert.equal(manifest.rows.length, 61);
  assert.equal(new Set(manifest.rows.map(row => row.image_id)).size, 61);
  assert.equal(new Set(manifest.rows.map(row => row.filename)).size, 61);
  assert.equal(metadata.schema_version, 'body-independent-manifest.v2');
  assert.equal(metadata.cases, 61);
  assert.equal(metadata.source_stimuli, 61);
  assert.equal(metadata.usable_labels, 61);
  assert.deepEqual(metadata.excluded_labels, []);
  assert.equal(metadata.manifest_sha256, sha256(manifestText));
  assert.equal(metadata.label.field, 'attractiveness_mean');
  assert.deepEqual(metadata.label.scale,
    { minimum: 1, maximum: 9, higher_is_more_positive: true });
  assert.deepEqual(metadata.label.pairwise_gaps, [0, 0.5, 1, 2]);
  assert.equal(metadata.label.body_specific, true);
  assert.equal(metadata.label.independent_of_shipped_model, true);
  assert.equal(metadata.license.status, 'copyright retained by authors');
  assert.match(metadata.license.restriction, /do not distribute/i);
  assert.doesNotThrow(() => assertDatasetMetadata(metadata, manifest, sha256(manifestText)));

  for (const row of manifest.rows) {
    assert.match(row.image_sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number(row.attractiveness_mean) >= 1 && Number(row.attractiveness_mean) <= 9);
    assert.equal(Number(row.width), 961);
    assert.equal(Number(row.height), 1783);
    await assert.rejects(fs.access(path.join(ROOT, 'data', row.filename)));
  }
});

test('manifest parser and metadata validator reject ambiguous or unbound input', () => {
  assert.throws(() => parseCsv('a,a\n1,2\n'), /duplicate columns/);
  assert.throws(() => parseCsv('a,b\n"unterminated,2\n'), /unterminated/);
  assert.throws(() => parseCsv('a,b\n1\n'), /expected 2/);
  const manifest = { columns: ['image_id', 'score'], rows: [{ image_id: 'x', score: '1' }] };
  assert.throws(() => assertDatasetMetadata({
    dataset: 'fixture', cases: 1, manifest_sha256: 'wrong',
    label: { field: 'score', independent_of_shipped_model: true },
  }, manifest, 'right'), /does not bind/);
  assert.deepEqual(normalizeBatchRow({ timestamp: 'runtime', score: 1 }),
    { timestamp: '', score: 1 });
});

test('browser Canvas2D fixture proves out-of-bounds body crops become transparent black padding', async () => {
  const audit = await json('data/body-canvas-padding-audit.json');
  const html = await text('body.html');
  const provenanceReport = await text('md/body-model-provenance-and-retraining.md');
  assert.equal(audit.schema_version, 'body-canvas-padding-audit.v1');
  assert.equal(audit.tool_sha256, await hash('tools/audit_body_canvas_padding.mjs'));
  assert.match(audit.command, /audit_body_canvas_padding\.mjs/);
  assert.match(audit.command, /--output data\\body-canvas-padding-audit\.json$/);
  assert.equal(audit.passed, true);
  assert.deepEqual(audit.expected_geometry, { in_bounds_fraction: 0.25, padding_fraction: 0.75 });
  assert.equal(audit.observed.destination.pixels, 64);
  assert.equal(audit.observed.transparent_pixels, 48);
  assert.equal(audit.observed.source_color_pixels, 16);
  assert.equal(audit.observed.unexpected_pixels, 0);
  assert.equal(audit.observed.transparent_fraction, 0.75);
  assert.deepEqual(audit.observed.samples.top_left, [0, 0, 0, 0]);
  assert.deepEqual(audit.observed.samples.bottom_right, [200, 10, 20, 255]);
  assert.match(audit.browser.version, /^\d+(?:\.\d+){3}$/);
  assert.match(audit.limitations.join(' '), /not the frequency or score impact/i);
  assert.match(provenanceReport, new RegExp(await hash('data/body-canvas-padding-audit.json')));
  assert.match(provenanceReport, /solid 4×4 source drawn through a 75%-out-of-bounds source rectangle/i);
  assert.match(provenanceReport, /48 transparent-black and 16 source-color pixels/i);
  assert.match(provenanceReport, /Canvas semantics only/i);
  assert.match(html, /drawImage\(srcEl, crop\.sourceX, crop\.sourceY, crop\.sidePx, crop\.sidePx, 0,0, S,S\)/);
  assert.match(html, /getImageData\(0,0,S,S\)\.data/);
});

test('frozen browser batch is complete, deterministic, pipeline-bound, and storage-safe', async () => {
  const batchText = await text('data/body-independent-before.csv');
  const batch = parseCsv(batchText);
  const metadata = await json('data/body-independent-before.meta.json');
  const datasetMetadata = await json('data/body-independent-manifest.meta.json');
  const lock = await json('data/body-evaluation-lock-v1.json');

  assert.equal(batch.rows.length, 61);
  assert.equal(metadata.cases, 61);
  assert.equal(metadata.output_csv_sha256, sha256(batchText));
  assert.equal(metadata.tool_sha256,
    '7d334a2b79d9a7e59d28b9248fbe520b8cf9232b6881a0e1f92a29d6cb24cb4d');
  assert.notEqual(metadata.tool_sha256, await hash('tools/run_body_manifest_batch.mjs'));
  assert.equal(metadata.dataset_metadata_sha256,
    await hash('data/body-independent-manifest.meta.json'));
  assert.equal(metadata.manifest_sha256, datasetMetadata.manifest_sha256);
  assert.equal(metadata.manifest_sha256, lock.independent_test.manifest_sha256);
  assert.equal(metadata.storage_unchanged, true);
  assert.deepEqual(metadata.storage_fixture, {
    love_equations: true,
    unrelated_local_storage: true,
    session_storage: true,
  });
  assert.equal(metadata.storage_before_sha256, metadata.storage_after_sha256);
  assert.deepEqual(metadata.browser_errors, []);
  assert.equal(metadata.served_pipeline_matches_root, true);
  assert.deepEqual(metadata.pipeline_sha256, metadata.served_pipeline_sha256);
  assert.equal(metadata.pipeline_sha256['body.html'], lock.baseline.body_html_sha256);
  assert.equal(metadata.pipeline_sha256['models/body-beauty.onnx'], lock.baseline.model_sha256);
  assert.deepEqual(metadata.normalized_runtime_fields, ['timestamp']);
  assert.ok(batch.rows.every(row => row.timestamp === ''));

  const outcomes = Object.fromEntries([...new Set(batch.rows.map(row => row.outcome))]
    .sort().map(outcome => [outcome, batch.rows.filter(row => row.outcome === outcome).length]));
  const routes = Object.fromEntries([...new Set(batch.rows.map(row => row.routing || 'unknown'))]
    .sort().map(route => [route, batch.rows.filter(row => (row.routing || 'unknown') === route).length]));
  assert.deepEqual(outcomes, metadata.outcome_counts);
  assert.deepEqual(routes, metadata.route_counts);
  assert.deepEqual(outcomes, { refused: 8, scored: 53 });
  assert.deepEqual(routes, { 'clothed→model': 53, unknown: 8 });
  for (const row of batch.rows) {
    if (row.outcome === 'scored') {
      assert.ok(Number.isFinite(Number(row.model_raw)), row.image_id);
      assert.ok(Number.isFinite(Number(row.bp)), row.image_id);
    } else {
      assert.equal(row.model_raw, '');
      assert.equal(row.bp, '');
    }
  }
});
