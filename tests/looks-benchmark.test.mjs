// Unit tests for the pure metrics behind tools/looks-benchmark.mjs. Values are hand-derivable so a
// regression in any metric is a visible arithmetic disagreement, not a drifted snapshot.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ranks, spearman, pearson, auc, icc1, residualGaps, quantile, median, histogram } from '../tools/looks-benchmark-metrics.mjs';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);

test('ranks average ties', () => {
  assert.deepEqual(ranks([10, 20, 20, 30]), [1, 2.5, 2.5, 4]);
});

test('spearman: monotone = 1, reversed = -1, tie-aware', () => {
  close(spearman([1, 2, 3, 4], [10, 20, 35, 400]), 1);
  close(spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1);
  // ranks x=[1,2,3], y=[1.5,1.5,3] -> pearson of those
  close(spearman([1, 2, 3], [5, 5, 9]), pearson([1, 2, 3], [1.5, 1.5, 3]));
});

test('auc: separation, coin flip, ties count half', () => {
  close(auc([3, 4], [1, 2]), 1);
  close(auc([1, 2], [3, 4]), 0);
  close(auc([1], [1]), 0.5);
  close(auc([2, 0], [1]), 0.5);
});

test('icc1: identity within person -> 1; pure noise with equal means -> <= 0', () => {
  close(icc1([[1, 1, 1], [5, 5, 5], [9, 9, 9]]).icc, 1);
  assert.ok(icc1([[1, 9], [9, 1], [1, 9]]).icc <= 0);
  // balanced 2x2 by hand: groups [0,2],[4,6]: grand 3, MSB=2*(1^2+... )  -> ssb=2*(1-3)^2+2*(5-3)^2=16, msb=16
  // ssw=(1+1)+(1+1)=4, msw=4/2=2, k0=2 -> (16-2)/(16+2)=0.777...
  close(icc1([[0, 2], [4, 6]]).icc, 14 / 18);
  assert.ok(Number.isNaN(icc1([[1, 2]]).icc), 'one group cannot estimate between-person variance');
});

test('residualGaps: a group scored 2 below the looks line shows a -2 gap', () => {
  const rows = [];
  for (let l = 3; l <= 9; l++) rows.push({ looks: l, score: l, group: 'white' });
  for (let l = 3; l <= 9; l++) rows.push({ looks: l, score: l - 2, group: 'black' });
  const r = residualGaps(rows, 'black');
  close(r.focusGap, -2);
  close(r.groups.black.meanResidual, -1);
  close(r.groups.white.meanResidual, 1);
});

test('quantile/median/histogram', () => {
  close(quantile([1, 2, 3, 4, 5], 0.5), 3);
  close(quantile([0, 10], 0.25), 2.5);
  close(median([4, 1, 3, 2]), 2.5);
  assert.deepEqual(histogram([1, 2, 7], v => (v < 5 ? 'lo' : 'hi'), ['lo', 'mid', 'hi']), { lo: 2, mid: 0, hi: 1 });
});
