/*
 * Step classification for the Lab suite runner — extracted so the DISARMED
 * state can be guarded by a test (tests/lab-suite-classify.test.mjs) without
 * executing the runner, which runs the whole suite on import.
 *
 * Three states, not two. A step whose assertions SKIPPED did not pass and did
 * not fail: it reported nothing, and for a tripwire that is the dangerous
 * state — the corpus gate self-disarmed behind an `ok` label once already
 * (lab-idf-unseen-token-fallback: 311 stems landed with exposure unmeasured).
 * DISARMED does not fail the run; absence of the corpus is legitimate. It is
 * only forbidden to look like coverage.
 */

/*
 * Skip counting reads BOTH reporter dialects because node picks one by
 * version and TTY, and the difference already bit: the runner grepped the
 * TAP literal `# SKIP` while node emitted the spec reporter's `﹣ … # reason`
 * lines, so the detector for the disarmed state was itself disarmed. The
 * summary counters (`ℹ skipped N` / `# skipped: N`) are authoritative where
 * present; inline markers are the fallback for output that carries neither.
 */
export function countSkips(out) {
  const spec = out.match(/^ℹ skipped (\d+)$/m);
  if (spec) return Number(spec[1]);
  const tap = out.match(/^# skipped: (\d+)$/m);
  if (tap) return Number(tap[1]);
  return skipLines(out).length;
}

export function skipLines(out) {
  return out.split('\n').filter((line) => /^\s*﹣ /.test(line) || / # SKIP\b/.test(line));
}

export function classifyStep({ failed, threw, notOk, skips }) {
  if (failed) return threw ? 'FAIL(throw)' : `FAIL(${notOk})`;
  if (skips) return `DISARMED(${skips})`;
  return 'ok';
}

export function summarizeSteps(results) {
  const failed = results.filter((r) => r.failed).length;
  const disarmed = results.filter((r) => !r.failed && r.skips > 0).length;
  const ok = results.length - failed - disarmed;
  const line = [
    `${results.length} steps`,
    `${ok} ok`,
    ...(disarmed ? [`${disarmed} DISARMED`] : []),
    `${failed} failed`,
  ].join(' · ');
  return { ok, disarmed, failed, line };
}
