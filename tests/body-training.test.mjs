import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'models', 'train_body_beauty.py');
const PROVENANCE = path.join(ROOT, 'data', 'body-training-provenance.json');
const REPORT = path.join(ROOT, 'md', 'body-model-provenance-and-retraining.md');
const EXPECTED_ARCHIVE_SHA256 = '71577e780ca5a9ba7a54653b55cca14bbbefe1be1783362ee9a9c0f581a950e8';

function findPython() {
  const candidates = [
    process.env.PYTHON ? [process.env.PYTHON] : null,
    ['python'],
    ['python3'],
    process.platform === 'win32' ? ['py', '-3'] : null,
  ].filter(Boolean);
  for (const [command, ...prefix] of candidates) {
    const probe = spawnSync(command, [...prefix, '--version'], {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
    });
    if (probe.status === 0) return { command, prefix };
  }
  throw new Error('Python 3 is required for the Body training contract test.');
}

const PYTHON = findPython();

function runPython(args) {
  return spawnSync(PYTHON.command, [...PYTHON.prefix, SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
  });
}

function parseJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

test('body training dry-run is deterministic, leakage-free, and corpus-free', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'body-training-test-'));
  try {
    const firstPath = path.join(temporary, 'first.json');
    const secondPath = path.join(temporary, 'second.json');
    const first = runPython(['--dry-run', '--dry-run-output', firstPath]);
    assert.equal(first.status, 0, first.stderr || first.stdout);
    const second = runPython(['--dry-run', '--dry-run-output', secondPath]);
    assert.equal(second.status, 0, second.stderr || second.stdout);
    assert.deepEqual(fs.readFileSync(firstPath), fs.readFileSync(secondPath));

    const report = parseJson(firstPath);
    assert.equal(report.schema_version, 'body-training-dry-run.v1');
    assert.equal(report.archive_sha256, EXPECTED_ARCHIVE_SHA256);
    assert.equal(report.invariants.locked_test_access_limit, 1);
    assert.equal(report.invariants.shipped_model_write_forbidden, true);
    assert.equal(report.invariants.onnx_parity_must_be_asserted, true);
    assert.match(report.commands.train, /--environment-lock data[/\\]body-training-environment-lock\.txt/);
    assert.match(report.commands.smoke, /--environment-lock data[/\\]body-training-environment-lock\.txt/);
    assert.deepEqual(
      Object.keys(report.manifest.counts.splits).sort(),
      ['dev', 'test', 'train'],
    );
    for (const count of Object.values(report.manifest.counts.splits)) {
      assert.ok(count > 0, 'every split must contain rows');
    }

    const tokenSplits = new Map();
    const componentSplits = new Map();
    for (const entry of report.manifest.entries) {
      const previousComponent = componentSplits.get(entry.identity_component);
      assert.ok(
        previousComponent === undefined || previousComponent === entry.split,
        'component ' + entry.identity_component + ' crossed splits',
      );
      componentSplits.set(entry.identity_component, entry.split);
      for (const token of entry.identity_tokens) {
        const previous = tokenSplits.get(token);
        assert.ok(
          previous === undefined || previous === entry.split,
          'identity token ' + token + ' crossed splits',
        );
        tokenSplits.set(token, entry.split);
      }
    }

    const changedPath = path.join(temporary, 'changed-seed.json');
    const changed = runPython([
      '--dry-run',
      '--split-seed', '74022',
      '--dry-run-output', changedPath,
    ]);
    assert.equal(changed.status, 0, changed.stderr || changed.stdout);
    assert.notEqual(
      parseJson(changedPath).manifest_sha256,
      report.manifest_sha256,
      'split seed must be hash-bound into a different locked manifest',
    );
  } finally {
    const resolved = path.resolve(temporary);
    assert.ok(
      resolved.startsWith(path.resolve(os.tmpdir()) + path.sep),
      'temporary cleanup target escaped the OS temp directory',
    );
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});

test('body training CLI refuses to replace the shipped ONNX', () => {
  const result = runPython([
    '--dry-run',
    '--candidate-out', path.join(ROOT, 'models', 'body-beauty.onnx'),
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /never writes models[/\\]body-beauty\.onnx/i);
});

test('training and supplied smoke locks fail closed before corpus access', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'body-training-lock-'));
  try {
    const dataDir = path.join(temporary, 'must-not-be-created');
    const missing = runPython(['--data-dir', dataDir]);
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /training requires --environment-lock/i);
    assert.equal(fs.existsSync(dataDir), false, 'missing lock must fail before corpus access');

    const lock = path.join(temporary, 'environment.txt');
    fs.writeFileSync(lock, [
      'torch==0', 'torchvision==0', 'onnx==0', 'onnxruntime==0',
      'onnxscript==0', 'Pillow==0', 'numpy==0', 'scipy==0', 'pandas==0',
      '',
    ].join('\n'));
    const mismatch = runPython([
      '--environment-lock', lock,
      '--data-dir', dataDir,
    ]);
    assert.notEqual(mismatch.status, 0);
    assert.match(mismatch.stderr, /environment lock does not match required installed distributions/i);
    assert.equal(fs.existsSync(dataDir), false, 'mismatched lock must fail before corpus access');

    const smoke = runPython(['--smoke', '--environment-lock', lock]);
    assert.notEqual(smoke.status, 0);
    assert.match(smoke.stderr, /environment lock does not match required installed distributions/i);
  } finally {
    const resolved = path.resolve(temporary);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep));
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});

test('training provenance contract is explicit and not a fabricated result', () => {
  const schema = parseJson(PROVENANCE);
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.ok(schema.required.includes('gate'));
  assert.ok(schema.required.includes('test'));
  assert.ok(schema.required.includes('export'));
  const example = schema.examples.at(0);
  assert.equal(example.status, 'example-not-a-training-result');
  assert.equal(example.dataset.archive_sha256, EXPECTED_ARCHIVE_SHA256);
  assert.equal(example.dataset.training_contaminated_for_shipped_model, true);
  assert.equal(example.dataset.license.declared, false);
  assert.equal(example.dataset.license.redistribution_assumed, false);
  assert.equal(example.dataset.selection.head_swap_composites, 'included');
  assert.match(example.dataset.selection.unmatched_ratings_or_images, /fail closed/);
  assert.equal(example.gate.production_model_replacement, 'forbidden by this script');
  assert.deepEqual(schema.properties.environment.required, ['packages', 'environment_lock']);
  assert.deepEqual(
    schema.properties.environment.properties.packages.required,
    ['torch', 'torchvision', 'onnx', 'onnxruntime', 'onnxscript', 'Pillow', 'numpy', 'scipy', 'pandas'],
  );
  assert.equal(example.environment.environment_lock, null);
  assert.deepEqual(Object.keys(example.environment.packages), [
    'torch', 'torchvision', 'onnx', 'onnxruntime', 'onnxscript', 'Pillow', 'numpy', 'scipy', 'pandas',
  ]);
  assert.equal(example.test, null);
  assert.equal(example.export, null);
});

test('GPU handoff archives and verifies an exact environment lock', () => {
  const source = fs.readFileSync(SCRIPT, 'utf8');
  const report = fs.readFileSync(REPORT, 'utf8');
  for (const distribution of ['torch', 'torchvision', 'onnx', 'onnxruntime', 'onnxscript', 'Pillow', 'numpy', 'scipy', 'pandas']) {
    assert.match(source, new RegExp(`['"]${distribution}['"]`));
  }
  assert.match(source, /verify_environment_lock\(Path\(args\.environment_lock\)\)/);
  assert.match(report, /pip[^\n]+freeze[^\n]+--all/i);
  assert.match(report, /--smoke --environment-lock data[/\\]body-training-environment-lock\.txt/);
  assert.match(report, /--environment-lock data[/\\]body-training-environment-lock\.txt/);
  assert.match(report, /does not invent|does not fabricate/i);
});

test('source records the preprocessing mismatch and REF_RAW handoff', () => {
  const source = fs.readFileSync(SCRIPT, 'utf8');
  assert.match(source, /full-letterbox preserves the historical training transform/);
  assert.match(source, /pose-crop-manifest consumes frozen/);
  assert.match(source, /one locked-test\s+inference pass/i);
  assert.match(source, /Parity uses dev inputs, not a second access/);
  assert.match(source, /regenerate REF_RAW/i);
  assert.match(source, /cannot improve rank correlation, AUC, or pairwise order/i);
  assert.doesNotMatch(source, /nudge outMin\/outMax/i);
});
