import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCsv } from '../tools/run_body_manifest_batch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFile(path.join(ROOT, ...relative.split('/')), 'utf8');
const json = async relative => JSON.parse(await read(relative));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

test('Connor diagnostic is exact-frozen, training-contaminated, license-honest, and storage-safe', async () => {
  const csvText = await read('data/body-connor-before.csv');
  const rows = parseCsv(csvText);
  const metadata = await json('data/body-connor-before.meta.json');

  assert.equal(rows.rows.length, 724);
  assert.equal(metadata.dataset.source_stimuli, 726);
  assert.equal(metadata.dataset.usable_labels, 724);
  assert.deepEqual(metadata.dataset.excluded_labels.map(row => row.image_id), ['WF111', 'WF112']);
  assert.equal(metadata.dataset.label.body_specific, false);
  assert.equal(metadata.dataset.label.independent_of_shipped_model, false);
  assert.equal(metadata.dataset.training_contaminated, true);
  assert.match(metadata.dataset.license.status, /no license declared/i);
  assert.match(metadata.dataset.license.repository_policy, /no source photographs committed/i);

  assert.equal(metadata.output_csv_sha256, sha(csvText));
  assert.equal(metadata.storage_unchanged, true);
  assert.equal(metadata.storage_before_sha256, metadata.storage_after_sha256);
  assert.equal(metadata.served_pipeline_matches_root, true);
  assert.deepEqual(metadata.pipeline_sha256, metadata.served_pipeline_sha256);
  assert.equal(metadata.pipeline_sha256['body.html'],
    'af651aefcd3e5608681aa211c4dcd4bbbe014c2118124a46e8f1bceb7a10f092');
  assert.equal(metadata.pipeline_sha256['js/body-pose-worker.js'],
    'c987806844eca1ff4bc6df26c6a42882d3cd7013e13fa73817993bbe792c9e4c');
  assert.equal(metadata.pipeline_sha256['models/body-beauty.onnx'],
    '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2');
  assert.deepEqual(metadata.outcome_counts, { refused: 1, scored: 723 });
  assert.deepEqual(metadata.route_counts,
    { 'bare→geometry': 59, 'clothed→geometry': 6, 'clothed→model': 658, unknown: 1 });
  assert.ok(rows.rows.every(row => row.timestamp === ''));
});

test('Connor subgroup and identity report is hash-bound and explicitly contaminated', async () => {
  const csvText = await read('data/body-connor-before.csv');
  const metadataText = await read('data/body-connor-before.meta.json');
  const report = await json('data/body-evaluation-before.json');
  const markdown = await read('md/body-evaluation-before.md');
  const evaluatorText = await read('tools/evaluate_body_accuracy.py');

  assert.equal(report.schema_version, 'body-accuracy-evaluation.v2');
  assert.equal(report.rows, 724);
  assert.equal(report.numeric_display_rows, 722);
  assert.equal(report.script_sha256, sha(evaluatorText));
  assert.equal(report.inputs.batch_csv.sha256, sha(csvText));
  assert.match(markdown, /Dataset: Connor Full-Body Photo Database/i);
  assert.doesNotMatch(markdown, /Dataset: unspecified/i);
  assert.doesNotMatch(markdown, /limitations were not supplied/i);
  assert.match(markdown, /holistic full-person judgments, not body-specific/i);
  assert.match(markdown, /training\/model-selection contaminated/i);
  assert.match(markdown, /head-swap composites, not natural repeat photographs/i);
  assert.match(markdown, /no license declared in the OSF node\/API/i);
  assert.match(markdown, /Evaluation lock: none/i);

  assert.equal(report.inputs.batch_metadata.sha256, sha(metadataText));
  assert.equal(report.inputs.dataset_metadata.sha256, sha(metadataText));
  assert.equal(report.interpretation.body_specific, false);
  assert.equal(report.interpretation.independent_of_shipped_model, false);
  assert.match(report.interpretation.independence, /training-contaminated/i);
  assert.equal(report.continuous_pipeline_score.spearman, 0.46644025597845046);
  assert.equal(report.continuous_pipeline_score.top_bottom_quartile_auc, 0.8090870242056103);
  assert.equal(report.subgroups.instrument.cnn.n, 658);
  assert.equal(report.subgroups.instrument.cnn.spearman, 0.5902471795904316);
  assert.equal(report.subgroups.instrument.geometry.n, 64);
  assert.equal(report.subgroups.body_exposure.bare.n, 58);
  assert.equal(report.subgroups.framing.torso.n, 11);
  assert.equal(report.subgroups.framing_quality.override.n, 32);
  assert.equal(report.subgroups.geom_cues.shoulderHip.small_sample, true);
  assert.equal(report.identity_stability.identities_with_multiple_images, 133);
  assert.equal(report.identity_stability.within_identity_display_range_mean, 0.6398872180451128);
  assert.equal(report.identity_stability.multiple_image_clusters_with_headswap_composites, 133);
  assert.equal(report.identity_stability.natural_repeat_photography, false);
  assert.match(report.identity_stability.evidence_type, /not natural repeat photos/i);
  assert.match(report.identity_stability.limitation, /not general multi-photo identity stability/i);
  assert.match(report.subgroup_provenance.demographic_code.definition, /unverified codes parsed from a filename/i);
  assert.match(report.subgroup_provenance.demographic_code.status, /not legitimate demographic ground truth/i);
  assert.match(markdown, /clusters containing head-swap composites: 133/i);
  assert.match(markdown, /training-contaminated/i);
  assert.match(markdown, /### body_exposure/i);
  assert.match(markdown, /### geom_cues/i);
  assert.match(markdown, /small sample/i);
  assert.match(markdown, /Strictly monotone/i);
  assert.match(markdown, /not fairness evidence/i);
  assert.match(markdown, /not general multi-photo identity stability/i);
});
