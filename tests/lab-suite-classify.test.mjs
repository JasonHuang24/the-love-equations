import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { classifyStep, countSkips, skipLines, summarizeSteps } from '../tools/lab-suite-classify.mjs';

/*
 * The suite's third state, guarded.
 *
 * Trap 3 in run-lab-suite.mjs: a skipped gate reads as `ok`. The runner has
 * printed skipped assertions since it existed, but the STEP LABEL and the
 * SUMMARY LINE still said ok — and the corpus tripwire self-disarmed behind
 * that label once already (lab-idf-unseen-token-fallback, exposure unmeasured).
 * The adjudication of 2026-08-08 ruled a gate whose precondition is absent must
 * report a state that cannot be mistaken for coverage. These assertions pin
 * that state into the classifier the runner uses, so reverting the label is a
 * red test and not a quiet regression.
 */

test('a step that skipped assertions is DISARMED, never ok', () => {
  assert.equal(classifyStep({ failed: false, threw: false, notOk: 0, skips: 3 }), 'DISARMED(3)');
  assert.equal(classifyStep({ failed: false, threw: false, notOk: 0, skips: 1 }), 'DISARMED(1)');
  assert.notEqual(classifyStep({ failed: false, threw: false, notOk: 0, skips: 1 }), 'ok');
});

test('a clean step is ok and a failed step is FAIL, skips notwithstanding', () => {
  assert.equal(classifyStep({ failed: false, threw: false, notOk: 0, skips: 0 }), 'ok');
  assert.equal(classifyStep({ failed: true, threw: false, notOk: 2, skips: 0 }), 'FAIL(2)');
  assert.equal(classifyStep({ failed: true, threw: true, notOk: 0, skips: 0 }), 'FAIL(throw)');
  // Failure dominates: a red step that also skipped is a red step. The skipped
  // assertions still print in the skip block; the label must not soften.
  assert.equal(classifyStep({ failed: true, threw: false, notOk: 1, skips: 2 }), 'FAIL(1)');
});

test('the summary line carries the DISARMED count whenever one exists', () => {
  const disarmed = summarizeSteps([
    { failed: false, threw: false, notOk: 0, skips: 0 },
    { failed: false, threw: false, notOk: 0, skips: 2 },
    { failed: true, threw: false, notOk: 1, skips: 0 },
  ]);
  assert.equal(disarmed.ok, 1);
  assert.equal(disarmed.disarmed, 1);
  assert.equal(disarmed.failed, 1);
  assert.equal(disarmed.line, '3 steps · 1 ok · 1 DISARMED · 1 failed');

  // Without a disarmed step the line keeps its historical two-part shape, so
  // scripts and eyes trained on it read on unchanged.
  const clean = summarizeSteps([
    { failed: false, threw: false, notOk: 0, skips: 0 },
    { failed: true, threw: true, notOk: 0, skips: 0 },
  ]);
  assert.equal(clean.line, '2 steps · 1 ok · 1 failed');
});

test('skips are counted in both reporter dialects node actually emits', () => {
  /*
   * Found 2026-08-09, closing the DISARMED work: the runner's own skip
   * detector grepped the literal `# SKIP`, which the TAP reporter emits — and
   * the spec reporter, which node uses here, does not. The detector for the
   * disarmed state was itself disarmed, and the SKIPPED ASSERTIONS block had
   * been silently dead. These samples are pasted from real output of both
   * dialects; the counter must read either.
   */
  const spec = [
    '✔ the frozen band is internally consistent (250ms)',
    '﹣ no corpus pair crosses an admission line without a ruling (0.06ms) # lab-corpus/sources is absent',
    'ℹ tests 4',
    'ℹ pass 3',
    'ℹ skipped 1',
  ].join('\n');
  assert.equal(countSkips(spec), 1);
  assert.equal(skipLines(spec).length, 1);
  assert.ok(skipLines(spec)[0].includes('no corpus pair crosses'));

  const tap = [
    'ok 1 - the frozen band is internally consistent',
    'ok 2 - no corpus pair crosses an admission line without a ruling # SKIP lab-corpus absent',
    '1..2',
    '# skipped: 1',
  ].join('\n');
  assert.equal(countSkips(tap), 1);
  assert.equal(skipLines(tap).length, 1);

  assert.equal(countSkips('✔ all green\nℹ tests 2\nℹ skipped 0'), 0);
  assert.equal(skipLines('✔ all green').length, 0);
});

test('the runner actually uses the classifier it is guarded by', () => {
  const runner = readFileSync(new URL('../tools/run-lab-suite.mjs', import.meta.url), 'utf8');
  assert.ok(runner.includes("from './lab-suite-classify.mjs'"),
    'run-lab-suite.mjs no longer imports lab-suite-classify.mjs — the DISARMED state is unwired');
  assert.ok(runner.includes('classifyStep(') && runner.includes('summarizeSteps('),
    'run-lab-suite.mjs imports the classifier but does not call it');
});
