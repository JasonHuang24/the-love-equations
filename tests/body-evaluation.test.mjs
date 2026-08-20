import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { parseCsv } from '../tools/run_body_manifest_batch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function text(relative) {
  return fs.readFile(path.join(ROOT, ...relative.split('/')), 'utf8');
}

async function json(relative) {
  return JSON.parse(await text(relative));
}

async function hash(relative) {
  return crypto.createHash('sha256')
    .update(await fs.readFile(path.join(ROOT, ...relative.split('/')))).digest('hex');
}

function close(actual, expected, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `${actual} differs from locked ${expected}`);
}

function assertFiniteNumbers(value, location = 'root') {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${location} must be finite`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteNumbers(item, `${location}[${index}]`));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => assertFiniteNumbers(item, `${location}.${key}`));
  }
}

test('optimized pairwise evaluator exactly matches naive fixtures and preserves strict-monotone ordering', () => {
  const run = spawnSync('python', ['tools/evaluate_body_accuracy.py', '--self-test'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.fenwick_vs_naive_random_fixtures, 250);
  assert.equal(result.monotone_ordering_invariance, true);
});

test('independent evaluation is lock-bound, hash-bound, and uses registered 1-9 gaps', async () => {
  const report = await json('data/body-independent-evaluation-before.json');
  const lockHash = await hash('data/body-evaluation-lock-v1.json');
  assert.equal(lockHash, '6cc28bb1861b4441cb460e57393c3f8b6b4c0a5a2fecefcd4734c289e2aacff5');
  assert.equal(report.schema_version, 'body-accuracy-evaluation.v2');
  assert.equal(report.script_sha256, await hash('tools/evaluate_body_accuracy.py'));
  assert.equal(report.inputs.batch_csv.sha256, await hash('data/body-independent-before.csv'));
  assert.equal(report.inputs.batch_metadata.sha256, await hash('data/body-independent-before.meta.json'));
  assert.equal(report.inputs.dataset_metadata.sha256,
    await hash('data/body-independent-manifest.meta.json'));
  assert.deepEqual(report.inputs.evaluation_lock, {
    path: path.join(ROOT, 'data', 'body-evaluation-lock-v1.json'),
    phase: 'before',
    sha256: lockHash,
  });
  assert.equal(report.evaluation_phase, 'before');
  assert.deepEqual(report.pairwise_label_gaps, [0, 0.5, 1, 2]);
  assert.equal(report.bootstrap.repetitions, 1000);
  assert.equal(report.bootstrap.seed, 20260818);
  assert.equal(report.bootstrap.clusters, 53);
  assert.equal(report.public_display_bootstrap.repetitions, 1000);
  assert.match(report.bootstrap.method, /cluster bootstrap by identity_group/);
  assert.equal(report.interpretation.body_specific, true);
  assert.equal(report.interpretation.independent_of_shipped_model, true);
  assert.match(report.interpretation.mapping_limit,
    /Strictly monotone calibration leaves rank correlation, AUC, and pairwise ordering unchanged/);
  for (const field of ['instrument', 'framing', 'routing', 'body_exposure', 'framing_quality', 'override', 'gate_band', 'geom_cues']) {
    assert.ok(report.subgroups[field], `missing subgroup ${field}`);
  }
  assert.equal(report.subgroups.body_exposure.clothed.n, 53);
  assertFiniteNumbers(report);
});

test('continuous pipeline and public half-point metrics remain explicitly distinct', async () => {
  const report = await json('data/body-independent-evaluation-before.json');
  const continuous = report.continuous_pipeline_score;
  const display = report.public_half_point_display;
  const cnn = report.cnn_raw;
  assert.equal(report.rows, 61);
  assert.equal(report.numeric_display_rows, 53);
  assert.equal(report.page_scored_without_numeric_display, 0);
  assert.deepEqual(report.outcomes, { refused: 8, scored: 53 });
  assert.deepEqual(report.instruments, { cnn: 53, none: 8 });
  assert.deepEqual(report.score_precision.public_score_sources,
    { derived_half_point_from_bp: 53 });

  close(continuous.spearman, -0.06267905448568309);
  close(continuous.pearson, -0.09867616500602144);
  close(continuous.top_bottom_quartile_auc, 0.45408163265306123);
  close(display.spearman, -0.12769941931207243);
  close(display.pearson, -0.11902290651257155);
  close(display.top_bottom_quartile_auc, 0.41581632653061223);
  close(cnn.spearman, -0.0697496271179322);
  close(cnn.pearson, -0.05573816327851126);
  close(cnn.top_bottom_quartile_auc, 0.4489795918367347);

  const continuousPairs = {
    '0': [1376, 0.4654796511627907],
    '0.5': [1196, 0.45735785953177255],
    '1': [1018, 0.46660117878192536],
    '2': [782, 0.4936061381074169],
  };
  const displayPairs = {
    '0': [1376, 0.4578488372093023],
    '0.5': [1196, 0.451505016722408],
    '1': [1018, 0.4494106090373281],
    '2': [782, 0.4533248081841432],
  };
  for (const [gap, [pairs, accuracy]] of Object.entries(continuousPairs)) {
    assert.equal(continuous.pairwise[gap].pairs, pairs);
    close(continuous.pairwise[gap].accuracy, accuracy);
  }
  for (const [gap, [pairs, accuracy]] of Object.entries(displayPairs)) {
    assert.equal(display.pairwise[gap].pairs, pairs);
    close(display.pairwise[gap].accuracy, accuracy);
  }
  assert.deepEqual([continuous.score.min, continuous.score.max], [7.07, 7.98]);
  assert.deepEqual([display.score.min, display.score.max], [7, 8]);
  assert.equal(display.score.floor_n, 0);
  assert.equal(display.score.ceiling_n, 0);
  assert.ok(new Set([7, 7.5, 8]).size === 3);

  for (const bootstrap of [report.bootstrap, report.public_display_bootstrap]) {
    for (const [metric, bounds] of Object.entries(bootstrap['95pct_ci'])) {
      assert.equal(bounds.length, 2, metric);
      assert.ok(bounds.every(Number.isFinite), metric);
      assert.ok(bounds[0] <= bounds[1], metric);
      assert.ok(bounds[0] >= -1 && bounds[1] <= 1, metric);
    }
  }
});

test('refusal selectivity exposes the low-label acceptance bias', async () => {
  const report = await json('data/body-independent-evaluation-before.json');
  const selection = report.refusal_selectivity;
  assert.deepEqual(report.refusal_causes, { 'no-body': 5, 'pose-quality:profile': 3 });
  assert.equal(selection.all_labels.n, 61);
  assert.equal(selection.numeric_score.n, 53);
  assert.equal(selection.refused_error_or_non_numeric.n, 8);
  close(selection.refused_error_or_non_numeric.mean, 1.40125);
  assert.deepEqual(
    selection.refused_error_or_non_numeric.image_ids,
    ['H190', 'H200', 'H250', 'H260', 'H270', 'H280', 'H290', 'H300'],
  );
  assert.deepEqual(selection.label_quartile_thresholds,
    { q25: 1.76, median: 3.4, q75: 6.58 });
  assert.deepEqual(
    Object.fromEntries(Object.entries(selection.refusal_by_label_quartile)
      .map(([key, value]) => [key, [value.submitted, value.refused_error_or_non_numeric]])),
    { q1_lowest: [16, 7], q2: [15, 1], q3: [15, 0], q4_highest: [15, 0] },
  );
  assert.match(selection.selection_warning, /selection-biased/);
});

test('one-time locked full-letterbox candidate passes the narrow metric screen only', async () => {
  const report = await json('data/body-independent-preprocessing-candidate.json');
  const rowsText = await text('data/body-independent-preprocessing-candidate.csv');
  const markdown = await text('md/body-preprocessing-candidate.md');
  const rows = parseCsv(rowsText);
  assert.equal(await hash('data/body-preprocessing-candidate-lock-v1.json'),
    '4c67cacbc32386b27b034f0954052252c1180d1a81d3e2c6b17885294c7599e1');
  assert.equal(report.script_sha256, await hash('tools/compare_body_preprocessing.py'));
  assert.equal(report.inputs.candidate_lock_sha256,
    await hash('data/body-preprocessing-candidate-lock-v1.json'));
  assert.equal(report.inputs.evaluation_lock_sha256,
    await hash('data/body-evaluation-lock-v1.json'));
  assert.equal(report.inputs.model_sha256,
    '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2');
  assert.equal(report.identical_rows, 53);
  assert.equal(rows.rows.length, 53);
  assert.equal(report.rows_output.sha256,
    crypto.createHash('sha256').update(rowsText).digest('hex'));
  assert.match(markdown,
    new RegExp(await hash('data/body-independent-preprocessing-candidate.json')));
  assert.match(markdown,
    new RegExp(await hash('data/body-independent-preprocessing-candidate.csv')));

  close(report.baseline_production_pose_crop_raw.spearman, -0.0697496271179322);
  close(report.candidate_training_full_letterbox_raw.spearman, 0.5167520062257439);
  close(report.paired_metric_delta_candidate_minus_baseline.spearman, 0.5865016333436761);
  assert.deepEqual(
    report.paired_bootstrap.delta_95pct_ci_candidate_minus_baseline.spearman,
    [0.36328607305162985, 0.8340852894050058],
  );
  close(report.candidate_training_full_letterbox_raw.top_bottom_quartile_auc,
    0.8724489795918368);
  close(report.display_contract_diagnostic.candidate_public_half_point_existing_mapping.spearman,
    0.1930679148391662);
  assert.equal(report.paired_bootstrap.repetitions, 1000);
  assert.equal(report.paired_bootstrap.clusters, 53);
  assert.equal(report.decision.narrow_locked_metric_screen_passed, true);
  assert.equal(report.decision.stability_requirement_evaluated_here, false);
  assert.equal(report.decision.broader_scope_requirement_met, false);
  assert.equal(report.decision.production_replacement_authorized, false);
  const pairwiseRows = {
    '0': [0.46294, 0.70058, 0.23765],
    '0.5': [0.45318, 0.72575, 0.27258],
    '1': [0.46267, 0.74558, 0.28291],
    '2': [0.49105, 0.77749, 0.28645],
  };
  for (const [gap, [baseline, candidate, delta]] of Object.entries(pairwiseRows)) {
    close(report.baseline_production_pose_crop_raw.pairwise[gap].accuracy, baseline, 5e-6);
    close(report.candidate_training_full_letterbox_raw.pairwise[gap].accuracy, candidate, 5e-6);
    close(report.paired_metric_delta_candidate_minus_baseline.pairwise[gap], delta, 5e-6);
  }
  for (const row of [
    '| CNN-raw pairwise accuracy, label gap 0 | 0.46294 | 0.70058 | +0.23765 |',
    '| CNN-raw pairwise accuracy, label gap 0.5 | 0.45318 | 0.72575 | +0.27258 |',
    '| CNN-raw pairwise accuracy, label gap 1 | 0.46267 | 0.74558 | +0.28291 |',
    '| CNN-raw pairwise accuracy, label gap 2 | 0.49105 | 0.77749 | +0.28645 |',
  ]) {
    assert.ok(markdown.includes(row), `candidate Markdown drifted: ${row}`);
  }
  assertFiniteNumbers(report);
});

test('Markdown states the precision, mapping, refusal, and construct limitations honestly', async () => {
  const markdown = await text('md/body-independent-evaluation-before.md');
  assert.match(markdown, /continuous internal pipeline score \(primary metric\)/i);
  assert.match(markdown, /public half-point headline/i);
  assert.match(markdown, /strictly monotone remap leaves Spearman, AUC, and pairwise ordering unchanged/i);
  assert.match(markdown, /quantization introduces ties/i);
  assert.match(markdown, /7\/16 refused \(43\.8%\)/i);
  assert.match(markdown, /not (?:an )?attractiveness-only/i);
  assert.match(markdown, /6cc28bb1861b4441cb460e57393c3f8b6b4c0a5a2fecefcd4734c289e2aacff5/);
});

test('transform stability artifact is production-pipeline, hash, storage, and scope bound', async () => {
  const manifestText = await text('data/body-transform-stability-manifest.csv');
  const manifest = parseCsv(manifestText);
  const dataset = await json('data/body-transform-stability-manifest.meta.json');
  const batch = await json('data/body-transform-stability-batch.meta.json');
  const report = await json('data/body-transform-stability.json');
  const rowsText = await text('data/body-transform-stability.csv');
  const rows = parseCsv(rowsText);
  const manifestHash = crypto.createHash('sha256').update(manifestText).digest('hex');

  assert.equal(manifest.rows.length, 216);
  assert.equal(dataset.cases, 216);
  assert.equal(dataset.selection.selected_cases, 12);
  assert.equal(Object.keys(dataset.transforms).length, 18);
  assert.equal(dataset.manifest_sha256, manifestHash);
  assert.equal(batch.manifest_sha256, manifestHash);
  assert.equal(batch.dataset_metadata_sha256,
    await hash('data/body-transform-stability-manifest.meta.json'));
  assert.equal(batch.output_csv_sha256,
    await hash('data/body-transform-stability-batch.csv'));
  assert.equal(batch.storage_unchanged, true);
  assert.equal(batch.cases, 216);
  assert.equal(batch.pipeline_sha256['body.html'], batch.served_pipeline_sha256['body.html']);
  assert.equal(batch.pipeline_sha256['js/body-model-integrity.js'],
    batch.served_pipeline_sha256['js/body-model-integrity.js']);

  const sources = new Set(manifest.rows.map(row => row.source_image_id));
  const transforms = new Set(manifest.rows.map(row => row.transform));
  const families = new Set(manifest.rows.map(row => row.transform_family));
  assert.equal(sources.size, 12);
  assert.equal(transforms.size, 18);
  assert.deepEqual([...families].sort(),
    ['background_canvas', 'control', 'crop', 'jpeg', 'lighting', 'mirror',
      'padding_aspect', 'resolution', 'rotation_camera_like']);
  for (const filename of manifest.rows.map(row => row.filename)) {
    await assert.rejects(fs.access(path.join(ROOT, 'data', filename)));
  }

  assert.equal(report.schema_version, 'body-transform-stability-evaluation.v1');
  assert.equal(report.overview.rows, 216);
  assert.equal(report.overview.sources, 12);
  assert.equal(report.overview.transforms, 18);
  assert.equal(report.overview.current_scored + report.overview.current_refused, 216);
  assert.equal(report.provenance.tool_sha256,
    await hash('tools/audit_body_transform_stability.py'));
  assert.equal(report.provenance.input_csv.sha256,
    await hash('data/body-transform-stability-batch.csv'));
  assert.equal(report.provenance.rows_output.sha256,
    crypto.createHash('sha256').update(rowsText).digest('hex'));
  assert.equal(rows.rows.length, 216);
  close(report.by_transform.original.current_delta.mean_absolute, 0);
  close(report.by_transform.original.candidate_delta.mean_absolute, 0);
  assert.equal(report.candidate_stability_screen.passed, false);
  assert.ok(report.candidate_stability_screen.material_regressions.length > 0);
  assert.equal(report.interpretation.candidate_decision.startsWith('Rejected for production'), true);
  assert.match(report.limitations.join(' '), /do not prove physical sensor rotation/i);
  assert.match(await text('md/body-transform-stability.md'), /do \*\*not\*\* prove behavior for actual pose changes/i);
  assertFiniteNumbers(report);
});

test('committed Body Python artifact writers force repository-stable LF bytes', async () => {
  const writers = [
    'tools/verify_body_batch_reproduction.py',
    'tools/prepare_body_independent_eval.py',
    'tools/export_body_baseline_predictions.py',
    'tools/evaluate_body_accuracy.py',
    'tools/compare_body_evaluations.py',
    'tools/audit_body_transform_stability.py',
    'tools/compare_body_preprocessing.py',
  ];
  for (const relative of writers) {
    const source = await text(relative);
    const calls = source.split('\n').filter(line => line.includes('.write_text('));
    assert.ok(calls.length > 0, `${relative} must have a committed artifact writer`);
    for (const call of calls) {
      assert.match(call, /newline="\\n"/, `${relative} writer must force LF: ${call.trim()}`);
    }
  }
  const training = await text('models/train_body_beauty.py');
  assert.match(training,
    /NamedTemporaryFile\("w", encoding="utf-8", newline="\\n"/,
    'atomic training JSON must force LF before its hash is recorded');
});
