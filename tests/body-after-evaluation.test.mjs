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

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}

test('final independent batch is page/model/tool/hash/storage and precision bound', async () => {
  const csvText = await text('data/body-independent-after.csv');
  const rows = parseCsv(csvText);
  const metadata = await json('data/body-independent-after.meta.json');
  const report = await json('data/body-independent-evaluation-after.json');

  assert.equal(rows.rows.length, 61);
  assert.equal(metadata.output_csv_sha256,
    crypto.createHash('sha256').update(csvText).digest('hex'));
  assert.equal(metadata.tool_sha256, await hash('tools/run_body_manifest_batch.mjs'));
  assert.equal(metadata.dataset_metadata_sha256,
    await hash('data/body-independent-manifest.meta.json'));
  assert.equal(metadata.manifest_sha256,
    (await json('data/body-independent-manifest.meta.json')).manifest_sha256);
  assert.equal(metadata.storage_unchanged, true);
  assert.equal(metadata.storage_before_sha256, metadata.storage_after_sha256);
  assert.equal(metadata.served_pipeline_matches_root, true);
  assert.deepEqual(metadata.pipeline_sha256, metadata.served_pipeline_sha256);
  assert.equal(metadata.pipeline_sha256['body.html'],
    'd75ec65acc0d766bef409676f82e10864d1fb6293ee2d4707ff2ab555ae8577d');
  assert.equal(metadata.pipeline_sha256['models/body-beauty.onnx'],
    '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2');
  assert.deepEqual(metadata.outcome_counts, { refused: 8, scored: 53 });
  assert.deepEqual(metadata.route_counts, { 'clothed→model': 53, unknown: 8 });
  assert.ok(rows.columns.includes('public_score'));
  assert.ok(rows.columns.includes('bp_continuous'));
  for (const row of rows.rows.filter(row => row.outcome === 'scored')) {
    assert.ok(Number.isFinite(Number(row.bp_continuous)));
    assert.ok(Number.isFinite(Number(row.public_score)));
    assert.equal(Number(row.bp), Number(row.public_score));
    assert.equal(Number(row.public_score) * 2, Math.round(Number(row.public_score) * 2));
  }

  assert.equal(report.evaluation_phase, 'after');
  assert.equal(report.script_sha256, await hash('tools/evaluate_body_accuracy.py'));
  assert.equal(report.inputs.batch_csv.sha256, await hash('data/body-independent-after.csv'));
  assert.equal(report.inputs.batch_metadata.sha256,
    await hash('data/body-independent-after.meta.json'));
  assert.equal(report.inputs.dataset_metadata.sha256,
    await hash('data/body-independent-manifest.meta.json'));
  assert.equal(report.inputs.evaluation_lock.sha256,
    await hash('data/body-evaluation-lock-v1.json'));
  assert.equal(report.rows, 61);
  assert.equal(report.numeric_display_rows, 53);
  const crop = report.crop_padding_diagnostic;
  assert.equal(crop.instrumented_rows, 53);
  assert.equal(crop.crop_outside_rows, 53);
  assert.equal(crop.crop_inside_rows, 0);
  close(crop.padding_fraction.min, 0.46008464);
  close(crop.padding_fraction.median, 0.55993043);
  close(crop.padding_fraction.mean, 0.5537207671698113);
  close(crop.padding_fraction.max, 0.57675847);
  close(crop.score_sensitivity.padding_vs_continuous_score_spearman,
    -0.35584613595546055);
  assert.match(crop.comparison_limitation, /no inside-crop control group/i);
  assert.equal(crop.outcome_sensitivity.no_diagnostic.refused_or_error, 8);
  close(report.continuous_pipeline_score.spearman, -0.06267905448568309);
  close(report.public_half_point_display.spearman, -0.12769941931207243);
});

test('paired comparison proves zero subjective-discrimination gain on identical rows', async () => {
  const comparison = await json('data/body-before-after-evaluation.json');
  assert.equal(comparison.schema_version, 'body-before-after-comparison.v1');
  assert.equal(comparison.provenance.tool_sha256,
    await hash('tools/compare_body_evaluations.py'));
  assert.equal(comparison.provenance.after_page_sha256,
    'd75ec65acc0d766bef409676f82e10864d1fb6293ee2d4707ff2ab555ae8577d');
  assert.equal(comparison.rows, 61);
  assert.equal(comparison.provenance.before_csv.sha256,
    await hash('data/body-independent-before.csv'));
  assert.equal(comparison.provenance.before_metadata.sha256,
    await hash('data/body-independent-before.meta.json'));
  assert.equal(comparison.provenance.after_csv.sha256,
    await hash('data/body-independent-after.csv'));
  assert.equal(comparison.provenance.after_metadata.sha256,
    await hash('data/body-independent-after.meta.json'));
  assert.equal(comparison.provenance.dataset_metadata.sha256,
    await hash('data/body-independent-manifest.meta.json'));
  assert.equal(comparison.provenance.model_sha256,
    '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2');
  assert.equal(comparison.identical_accepted_rows, 53);
  const delta = comparison.identical_accepted_continuous.delta_after_minus_before;
  assert.equal(delta.spearman, 0);
  assert.equal(delta.pearson, 0);
  assert.equal(delta.top_bottom_quartile_auc, 0);
  assert.deepEqual(delta.pairwise, { 0: 0, '0.5': 0, 1: 0, 2: 0 });
  for (const bounds of Object.values(
    comparison.continuous_paired_bootstrap.delta_95pct_ci_after_minus_before)) {
    assert.deepEqual(bounds, [0, 0]);
  }
  assert.equal(comparison.prediction_shift.continuous.exactly_unchanged, 53);
  assert.equal(comparison.refusals.delta_after_minus_before, 0);
  assert.equal(comparison.decision.meaningful_independent_subjective_discrimination_gain, false);
  assert.equal(comparison.decision.model_replacement_authorized, false);
});

test('independent final browser run reproduces exactly with only declared metadata exclusions', async () => {
  const report = await json('data/body-independent-after-reproduction.json');
  assert.equal(report.schema_version, 'body-batch-reproduction.v1');
  assert.equal(report.exact_csv_bytes_identical, true);
  assert.equal(report.normalized_metadata_identical, true);
  assert.deepEqual(report.metadata_fields_ignored, ['command', 'generated_at']);
  assert.equal(report.primary.csv.sha256,
    '03e1322f73c82ff2cf30f3dfa8f2e697aec2dd66607ea88ec387dae4c14c7af2');
  assert.equal(report.primary.csv.sha256, report.repeat.csv.sha256);
  assert.equal(report.primary.normalized_metadata_sha256,
    report.repeat.normalized_metadata_sha256);
  assert.equal(report.primary.csv.sha256, await hash('data/body-independent-after.csv'));
  assert.equal(report.primary.metadata.sha256,
    await hash('data/body-independent-after.meta.json'));
  assert.match(report.command.join(' '), /body-independent-after-repeat\.csv/);
  assert.equal(report.tool_sha256, await hash('tools/verify_body_batch_reproduction.py'));
});

test('final transform report binds the final page and rejects the letterbox production swap', async () => {
  const dataset = await json('data/body-transform-stability-manifest.meta.json');
  const batch = await json('data/body-transform-stability-batch.meta.json');
  const report = await json('data/body-transform-stability.json');
  assert.equal(dataset.generation.tool_sha256,
    await hash('tools/audit_body_transform_stability.py'));
  assert.equal(batch.pipeline_sha256['body.html'],
    'd75ec65acc0d766bef409676f82e10864d1fb6293ee2d4707ff2ab555ae8577d');
  assert.equal(report.provenance.input_csv.sha256,
    await hash('data/body-transform-stability-batch.csv'));
  assert.equal(report.provenance.tool_sha256,
    await hash('tools/audit_body_transform_stability.py'));
  assert.equal(batch.dataset_metadata_sha256,
    await hash('data/body-transform-stability-manifest.meta.json'));
  assert.equal(batch.output_csv_sha256,
    await hash('data/body-transform-stability-batch.csv'));
  assert.equal(batch.storage_unchanged, true);
  assert.deepEqual(batch.route_counts,
    { 'clothed→geometry': 19, 'clothed→model': 172, unknown: 25 });
  assert.equal(report.provenance.batch_metadata.sha256,
    await hash('data/body-transform-stability-batch.meta.json'));
  assert.equal(report.overview.current_scored, 190);
  assert.equal(report.overview.current_refused, 26);
  close(report.overview.current_delta.mean_absolute, 0.34077639751552785);
  close(report.overview.candidate_delta_common_current_pairs.mean_absolute,
    0.2505125773963906);
  assert.equal(report.candidate_stability_screen.passed, false);
  assert.ok(report.candidate_stability_screen.material_regressions.length > 0);
  assert.match(report.interpretation.candidate_decision, /Rejected for production/i);
  const markdown = await text('md/body-stability-and-subgroups.md');
  assert.equal(report.provenance.dataset_metadata.sha256,
    await hash('data/body-transform-stability-manifest.meta.json'));
  assert.equal(report.provenance.mapping_page.sha256,
    'd75ec65acc0d766bef409676f82e10864d1fb6293ee2d4707ff2ab555ae8577d');
  const crop = report.crop_padding_diagnostic;
  assert.equal(crop.instrumented_rows, 191);
  assert.equal(crop.crop_outside_rows, 191);
  assert.equal(crop.crop_inside_rows, 0);
  close(crop.padding_fraction.min, 0.34265451);
  close(crop.padding_fraction.median, 0.54401284);
  close(crop.padding_fraction.mean, 0.5264982308376963);
  close(crop.padding_fraction.max, 0.6586466);
  assert.equal(crop.paired_score_delta_sensitivity.crop_outside.n, 161);
  close(crop.paired_score_delta_sensitivity.crop_outside.mean_absolute,
    0.3407763975155279);
  assert.equal(crop.paired_padding_change_sensitivity.n, 161);
  assert.equal(crop.paired_padding_change_sensitivity.padding_fraction_delta.nonzero, 82);
  close(crop.paired_padding_change_sensitivity.padding_delta_vs_score_delta_spearman,
    0.20123230566589492);
  assert.match(crop.comparison_limitation, /no inside-crop control group/i);
  assert.match(markdown, /did \*\*not\*\* improve independently measured subjective-attractiveness discrimination/i);
  assert.match(markdown, /Synthetic pixel transforms do \*\*not\*\* prove physical sensor rotation/i);
});
