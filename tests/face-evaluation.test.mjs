import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else cell += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') { row.push(cell); cell = ''; }
    else if (character === '\n') {
      row.push(cell.replace(/\r$/, '')); cell = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else cell += character;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  const [header, ...body] = rows;
  return {
    header,
    rows: body.map(values => Object.fromEntries(header.map((key, index) => [key, values[index] ?? '']))),
  };
}

async function csv(relative) {
  return parseCsv(await fs.readFile(path.join(ROOT, relative), 'utf8'));
}

async function json(relative) {
  return JSON.parse(await fs.readFile(path.join(ROOT, relative), 'utf8'));
}

async function sha256(relative) {
  return crypto.createHash('sha256').update(await fs.readFile(path.join(ROOT, relative))).digest('hex');
}

function assertFiniteTree(value, location = 'root') {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), location + ' must be finite');
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteTree(item, location + '[' + index + ']'));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => assertFiniteTree(item, location + '.' + key));
  }
}

test('frozen split assigns every identity and gallery image to exactly one phase', async () => {
  const split = await csv('data/face-identity-split-v1.csv');
  assert.equal(split.rows.length, 199);
  assert.equal(new Set(split.rows.map(row => row.identity_id)).size, 199);
  assert.deepEqual(
    Object.fromEntries(['train', 'validation', 'holdout'].map(phase => [
      phase, split.rows.filter(row => row.split === phase).length,
    ])),
    { train: 119, validation: 40, holdout: 40 },
  );
  assert.ok(split.rows.every(row =>
    row.demographic_metadata_source.includes('not image-inferred')));

  const gallery = await csv('data/face-roster-gallery-after.csv');
  assert.equal(gallery.rows.length, 825);
  const phaseByIdentity = new Map(split.rows.map(row => [row.identity_id, row.split]));
  assert.ok(gallery.rows.every(row => phaseByIdentity.get(row.identity_id) === row.split));
  assert.equal(new Set(gallery.rows.map(row => row.relative_path)).size, 825);
});

test('browser batch artifacts are complete, hash-bound, finite, and storage-safe', async () => {
  for (const [csvPath, metaPath, cases] of [
    ['data/face-roster-gallery-before.csv', 'data/face-roster-gallery-before.meta.json', 825],
    ['data/face-roster-gallery-after.csv', 'data/face-roster-gallery-after.meta.json', 825],
    ['data/face-roster-pressure-test-after.csv', 'data/face-roster-pressure-test-after.meta.json', 199],
  ]) {
    const batch = await csv(csvPath);
    const metadata = await json(metaPath);
    assert.equal(batch.rows.length, cases);
    assert.equal(metadata.cases, cases);
    assert.equal(metadata.output_csv_sha256, await sha256(csvPath));
    assert.equal(metadata.storage_unchanged, true);
    const counts = Object.fromEntries(
      [...new Set(batch.rows.map(row => row.outcome))].sort().map(outcome => [
        outcome, batch.rows.filter(row => row.outcome === outcome).length,
      ]),
    );
    assert.deepEqual(metadata.outcome_counts, counts);
    for (const row of batch.rows) {
      if (row.outcome === 'scored') {
        assert.ok(Number.isFinite(Number(row.model_raw)));
      } else {
        assert.equal(row.model_raw, '');
      }
    }
  }

  const after = await csv('data/face-roster-gallery-after.csv');
  const diagnosticColumns = [
    'source_width', 'source_height', 'analysis_width', 'analysis_height',
    'crop_requested_fits', 'crop_source_contained', 'crop_side_px',
    'crop_shift_x_px', 'crop_shift_y_px', 'crop_pad_left_px', 'crop_pad_top_px',
    'crop_pad_right_px', 'crop_pad_bottom_px', 'crop_padding_area_pct',
    'crop_face_visible_pct', 'capture_source', 'capture_trigger', 'guide_passed',
    'alignment_code', 'camera_frame_width', 'camera_frame_height', 'guide_face_scale',
    'guide_center_offset_display', 'guide_center_offset_raw', 'guide_eye_line_offset',
    'guide_roll_deg', 'guide_yaw_deg', 'guide_pose_skew',
  ];
  diagnosticColumns.forEach(column => assert.ok(after.header.includes(column), column));
  const scored = after.rows.filter(row => row.outcome === 'scored');
  assert.equal(scored.length, 656);
  assert.ok(scored.every(row => row.source_width && row.crop_requested_fits));
  assert.ok(scored.every(row =>
    row.crop_requested_fits !== 'true' || row.crop_source_contained === 'true'));
});

test('identity gallery output preserves worst pairs and aggregation measurements', async () => {
  for (const relative of [
    'data/face-gallery-identity-before.csv',
    'data/face-gallery-identity-after.csv',
  ]) {
    const identities = await csv(relative);
    assert.equal(identities.rows.length, 199);
    const eligible = identities.rows.filter(row => Number(row.scored_images) >= 2);
    assert.ok(eligible.length >= 175);
    assert.ok(eligible.every(row =>
      row.worst_pair_image_a && row.worst_pair_image_b
      && Number.isFinite(Number(row.worst_pair_raw_a))
      && Number.isFinite(Number(row.worst_pair_raw_b))
      && Number(row.worst_pair_absolute_raw_gap) >= 0));
  }
  for (const relative of [
    'data/face-gallery-stability-before.json',
    'data/face-gallery-stability-after.json',
  ]) {
    const artifact = await json(relative);
    assert.equal(artifact.multi_photo_aggregation.length, 3);
    assert.deepEqual(
      artifact.multi_photo_aggregation.map(row => row.eligible_identities),
      [99, 99, 99],
    );
    assertFiniteTree(artifact);
  }
});

test('paired comparison and error gallery preserve exact common cohorts and finite values', async () => {
  const comparison = await json('data/face-before-after-comparison.json');
  assertFiniteTree(comparison);
  assert.equal(comparison.canonical.submitted, 199);
  assert.equal(comparison.canonical.paired_common.common_scored_identities, 166);
  assert.equal(comparison.gallery.identities, 199);
  assert.equal(comparison.gallery.images, 825);
  assert.equal(comparison.gallery.paired_common.common_scored_identities, 195);
  assert.deepEqual(comparison.canonical.outcome_transitions,
    { 'refused->refused': 33, 'scored->scored': 166 });
  assert.deepEqual(comparison.gallery.outcome_transitions,
    { 'refused->refused': 169, 'scored->scored': 656 });
  assert.equal(comparison.crop_diagnostics.canonical.fit_capable_containment_violations, 0);
  assert.equal(comparison.crop_diagnostics.gallery.fit_capable_containment_violations, 0);
  assert.equal(comparison.runtime_provenance.canonical_and_gallery_after_identical_scoring_page, true);

  const errors = await csv('data/face-crop-error-gallery.csv');
  assert.equal(errors.rows.length, 361);
  assert.equal(new Set(errors.rows.map(row => row.dataset + ':' + row.identity_id)).size, 361);
  for (const row of errors.rows) {
    for (const key of [
      'before_raw', 'after_raw', 'raw_delta', 'before_rank_error',
      'after_rank_error', 'rank_error_improvement',
    ]) assert.ok(Number.isFinite(Number(row[key])), row.identity_id + ':' + key);
    await fs.access(path.join(ROOT, ...row.image_path.split('/')));
  }
});

test('validation lock excludes holdout metrics and holdout binds the locked finalist', async () => {
  const prereg = await json('data/face-evaluation-preregistration-v1.json');
  assert.equal(prereg.demographic_policy.image_inference_used, false);
  assert.equal(prereg.identity_split.sha256, await sha256('data/face-identity-split-v1.csv'));

  const validation = await json('data/face-aggregation-validation-lock-v1.json');
  assert.equal(validation.phase, 'validation');
  assert.equal(validation.holdout_examined_by_this_artifact, false);
  assert.equal(validation.selected_candidate, 'gallery_mean');
  assert.equal(validation.common_scored_identity_count, 37);
  assert.equal(validation.inputs.preregistration.sha256,
    await sha256('data/face-evaluation-preregistration-v1.json'));

  const holdout = await json('data/face-aggregation-holdout-v1.json');
  assert.equal(holdout.phase, 'holdout');
  assert.equal(holdout.selected_candidate, validation.selected_candidate);
  assert.equal(holdout.validation_lock_sha256,
    await sha256('data/face-aggregation-validation-lock-v1.json'));
  assert.equal(holdout.common_scored_identity_count, 35);
  assert.ok(holdout.expected_sex_subgroups.f.gallery_mean.auc.value
    < holdout.expected_sex_subgroups.f.canonical_single.auc.value);
  assert.equal(holdout.demographic_provenance.image_inference_used, false);
  assertFiniteTree(validation);
  assertFiniteTree(holdout);
});
