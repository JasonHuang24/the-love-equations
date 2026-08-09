#!/usr/bin/env node
/*
 * The Lab suite runner.
 *
 * WHY THIS EXISTS. `test:lab` used to be an eighteen-step `&&` chain, and
 * `tests/lab-analyzer.test.mjs` is step 2. One red there and steps 3-18 never
 * executed: eleven test files, the canon fixtures, `validate-canon-index`, and
 * all three Python audits. Sixteen of eighteen dark, reported as a single
 * failure line.
 *
 * That is tolerable for a transient red. It is not tolerable for an INTENTIONAL
 * one — `lab-analyzer` test 8 is red by Jason's ruling while he adjudicates
 * whether `statistics:stat-desire-prediction` should legitimately catch a probe
 * authored to be unmappable — because then the whole suite is permanently
 * uninformative rather than briefly so. A guard that cannot report is not a
 * guard; that is the same argument `lab-threshold-neighbors.test.mjs` makes
 * about `adjudicationOpen`, one level up.
 *
 * The step ORDER is unchanged. Reordering was the obvious fix and it is the
 * weaker one: it only moves which steps go dark, because a red anywhere still
 * stops everything after it. Running every step and aggregating is what removes
 * the failure mode rather than relocating it.
 *
 * IT ALSO REPORTS THE NEIGHBOURING TRAPS, because each one cost a real
 * mistake in a real session:
 *
 *   1. `&&` chaining hid every later step behind an earlier failure.  (fixed here)
 *   2. Grepping `not ok` misses bare `AssertionError`s — `canon-index-fixtures.mjs`
 *      and `validate-canon-index.mjs` throw rather than emitting TAP.  (classified here)
 *   3. A SKIPPED gate reads as `ok`. `lab-threshold-neighbors` test 3 skips when
 *      `lab-corpus/` is absent, which silently disarms the adjudication tripwire
 *      — correct behaviour, dangerous state, invisible to a `not ok` grep.
 *      (surfaced here as its own line — and since the 2026-08-08 adjudication,
 *      as a third step state: DISARMED(n), carried into the summary line,
 *      never folded into "pass". tools/lab-suite-classify.mjs, guarded by
 *      tests/lab-suite-classify.test.mjs.)
 *   4. A red suite in a stale tree looks exactly like a regression. On
 *      2026-07-31 the shared checkout sat detached at a merge commit eight
 *      files behind origin/main; there, this suite honestly reported
 *      FAIL(1), and at main the same command reported 18/18 ok. Sessions
 *      legitimately test old commits — they just must not do it unknowingly,
 *      so the first line always says WHICH tree produced the numbers, and
 *      DETACHED or behind>0 gets a banner. A banner, not a failure: the
 *      count is against the local origin/main ref (no fetch), and testing
 *      the past on purpose is a normal thing to do.  (printed here, first)
 *
 * The generalisation worth keeping: an instrument that cannot see the population
 * reports success either way.
 *
 * Exit code is 1 if any step failed, 0 otherwise. Skips do not fail the run —
 * they are legitimate — but they are always printed.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { classifyStep, countSkips, skipLines, summarizeSteps } from './lab-suite-classify.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Order preserved exactly as the former `&&` chain had it. */
const STEPS = [
  ['node', 'tests/lab-intake.test.mjs'],
  ['node', 'tests/lab-analyzer.test.mjs'],
  ['node', 'tests/lab-domain-benchmark.test.mjs'],
  ['node', 'tests/lab-match-behavior.test.mjs'],
  ['node', 'tests/lab-export.test.mjs'],
  ['node', 'tests/lab-ledger.test.mjs'],
  ['node', 'tests/lab-feedback.test.mjs'],
  ['node', 'tests/lab-feedback-integrity.test.mjs'],
  ['node', 'tests/lab-canon-mapping-benchmark.test.mjs'],
  ['node', 'tests/lab-short-utterance.test.mjs'],
  ['node', 'tests/lab-tokenizer.test.mjs'],
  ['node', 'tests/lab-threshold-neighbors.test.mjs'],
  ['node', 'tests/lab-gate-register.test.mjs'],
  ['node', 'tests/lab-corpus-extractor.test.mjs'],
  ['node', 'tests/lab-suite-classify.test.mjs'],
  ['node', 'tests/canon-index-fixtures.mjs'],
  ['node', 'scripts/validate-canon-index.mjs'],
  ['python', 'tools/lab_release_audit.py'],
  ['python', 'tools/lab_ui_audit.py'],
  ['python', 'tools/site_integrity_audit.py'],
];

/* Trap 4: say which tree these numbers describe, before printing any of them. */
const git = (...args) => {
  const run = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : null;
};
{
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const sha = git('rev-parse', '--short', 'HEAD');
  if (branch === null || sha === null) {
    process.stdout.write('testing UNKNOWN TREE — git unavailable, results cannot be tied to a commit\n\n');
  } else {
    const detached = branch === 'HEAD';
    const dirty = (git('status', '--porcelain') ?? '') !== '';
    const behindRaw = git('rev-list', '--count', 'HEAD..origin/main');
    const behind = behindRaw === null ? null : Number(behindRaw);
    const where = detached ? `DETACHED ${sha}` : `${branch} ${sha}`;
    const behindNote = behind === null ? 'origin/main ref absent' : `${behind} behind origin/main`;
    process.stdout.write(`testing ${where} · ${dirty ? 'dirty' : 'clean'} · ${behindNote}\n`);
    if (detached || (behind !== null && behind > 0)) {
      const why = [
        detached ? 'HEAD is DETACHED' : null,
        behind !== null && behind > 0 ? `this tree is ${behind} commit(s) behind origin/main` : null,
      ].filter(Boolean).join(' and ');
      process.stdout.write([
        '#'.repeat(70),
        `#  STALE TREE: ${why}.`,
        '#  A red below may already be fixed at the tip, and a green proves',
        '#  nothing about it. Fine on purpose — ruinous unknowingly.',
        '#'.repeat(70),
      ].join('\n') + '\n');
    }
    process.stdout.write('\n');
  }
}

const results = [];
for (const [cmd, file] of STEPS) {
  const run = spawnSync(cmd, [file], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1e9 });
  const out = `${run.stdout || ''}${run.stderr || ''}`;
  const failed = run.status !== 0;

  // TAP counts when present; a thrown AssertionError leaves none, which is trap 2.
  // Failure detection also reads the spec reporter's ✖ marks — `not ok` alone
  // classified every spec-format red as FAIL(throw).
  const notOk = (out.match(/^not ok /gm) || []).length
    || (out.match(/^✖ /gm) || []).length;
  const skips = countSkips(out);
  const threw = failed && notOk === 0;

  results.push({ file, failed, notOk, skips, threw, out });

  const label = classifyStep({ failed, threw, notOk, skips });
  const skipNote = skips ? `  ${skips} SKIPPED` : '';
  process.stdout.write(`${label.padEnd(12)} ${file}${skipNote}\n`);
}

const failures = results.filter((r) => r.failed);
const skipped = results.filter((r) => r.skips);

process.stdout.write(`\n${summarizeSteps(results).line}\n`);

if (skipped.length) {
  process.stdout.write('\nSKIPPED ASSERTIONS — these ran green WITHOUT testing anything:\n');
  for (const r of skipped) {
    for (const line of skipLines(r.out)) {
      process.stdout.write(`  ${r.file}: ${line.trim()}\n`);
    }
  }
  process.stdout.write('  An instrument that cannot see the population reports success either way.\n');
}

if (failures.length) {
  process.stdout.write('\nFAILURES, in full:\n');
  for (const r of failures) {
    process.stdout.write(`\n${'='.repeat(70)}\n${r.file}\n${'='.repeat(70)}\n`);
    process.stdout.write(r.out.trimEnd());
    process.stdout.write('\n');
  }
  process.exit(1);
}
process.exit(0);
