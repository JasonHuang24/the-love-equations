import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCsv } from '../tools/run_body_manifest_batch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bytes = relative => fs.readFile(path.join(ROOT, ...relative.split('/')));
const text = async relative => (await bytes(relative)).toString('utf8');
const json = async relative => JSON.parse(await text(relative));
const hash = async relative => crypto.createHash('sha256').update(await bytes(relative)).digest('hex');

test('locked originals-only test split has a reproducible shipped-model baseline', async () => {
  const manifest = await json('data/body-training-manifest-originals-only.json');
  const provenance = await json('data/body-training-baseline-predictions.meta.json');
  const csvText = await text('data/body-training-baseline-predictions.csv');
  const predictions = parseCsv(csvText);
  const expected = manifest.entries.filter(row => row.split === 'test');

  assert.equal(manifest.schema_version, 'body-training-manifest.v1');
  assert.equal(expected.length, 68);
  assert.ok(expected.every(row => row.variant === 'original'));
  assert.equal(provenance.schema_version, 'body-training-baseline-predictions.v1');
  assert.equal(provenance.rows, 68);
  assert.equal(provenance.inputs.manifest.sha256,
    await hash('data/body-training-manifest-originals-only.json'));
  assert.equal(provenance.inputs.model.sha256,
    '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2');
  assert.equal(provenance.output.sha256,
    crypto.createHash('sha256').update(csvText).digest('hex'));
  assert.equal(provenance.tool_sha256,
    await hash('tools/export_body_baseline_predictions.py'));
  assert.match(provenance.role, /training-contaminated/i);
  assert.match(provenance.metrics_diagnostic_only.warning, /not independent test evidence/i);
  assert.ok(Number.isFinite(provenance.metrics_diagnostic_only.spearman));

  assert.deepEqual(predictions.columns, ['image_id', 'prediction']);
  assert.equal(predictions.rows.length, 68);
  assert.deepEqual(predictions.rows.map(row => row.image_id).sort(),
    expected.map(row => row.image_id).sort());
  assert.ok(predictions.rows.every(row => Number.isFinite(Number(row.prediction))));
});
