#!/usr/bin/env node
/*
 * LE Lab — peer-review labeling sheet generator.
 *
 * Turns one analysis export into a CSV with an EMPTY verdict column, so a human
 * reviewer can grade every decision the analyzer made. These sheets are the
 * input the threshold-calibration pass needs: today's thresholds were authored
 * by judgment, never fitted to labelled data, which is why every export carries
 * coverage.provisional. A graded sheet is what turns that into a fixture.
 *
 * Three sections, because there are three distinct ways to be wrong:
 *   A MAPPINGS        one row per ranked match  -> CORRECT | FALSE-POSITIVE
 *   B UNMAPPED        claim-like, nothing stuck -> OK-NO-CANON | MISS
 *   C SET-ASIDE       the domain gate binned it -> OK | SHOULD-HAVE-BEEN-RETAINED
 *
 * Section C matters as much as A. The gate is fail-open triage, so its errors
 * are visible but only if somebody looks; this is the looking.
 *
 * Usage: node tools/lab-labeling-sheet.mjs <analysis.json> [--out <file.csv>]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const input = args[0];
const outIndex = args.indexOf('--out');
const out = outIndex >= 0 ? args[outIndex + 1] : null;

if (!input) {
  process.stderr.write('usage: lab-labeling-sheet.mjs <analysis.json> [--out <file.csv>]\n');
  process.exit(2);
}

const result = JSON.parse(fs.readFileSync(input, 'utf8'));

/** RFC 4180 quoting. Newlines inside a quoted field are legal and preserved. */
function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
const row = (values) => values.map(cell).join(',');

const lines = [];
const push = (...values) => lines.push(row(values));

const claimSegments = (result.segments || []).filter((segment) => segment.unit.isClaimLike);
const mapped = claimSegments.filter((segment) => segment.mapped);
const unmapped = claimSegments.filter((segment) => !segment.mapped);
const ignored = result.domainRelevance?.ignoredPassages || [];

push('LE LAB PEER-REVIEW LABELING SHEET');
push('source', result.source?.title || input);
push('analyzer', `${result.provenance?.analyzer?.version} · ${result.schemaVersion}`);
push('canon index', result.canonIndex?.version);
push('scoring config', result.provenance?.analyzer?.scoringConfigHash);
push('coverage', `${result.coverage?.mappedClaimSegmentSharePct}% mapped${result.coverage?.provisional ? ' (PROVISIONAL — thresholds uncalibrated)' : ''}`);
push('counts', `${claimSegments.length} claim-like · ${mapped.length} mapped · ${unmapped.length} unmapped · ${ignored.length} set aside by the gate`);
push('');
push('HOW TO USE: fill the VERDICT column only. Leave NOTES for anything the verdict cannot carry.');
push('');

push('SECTION A — MAPPINGS (verdict: CORRECT | FALSE-POSITIVE)');
push('ref', 'slot', 'score', 'confidence', 'canon id', 'canon title', 'why matched', 'passage', 'VERDICT', 'NOTES');
mapped.forEach((segment, segmentIndex) => {
  (segment.matches || []).forEach((match, slot) => {
    push(
      `A${segmentIndex + 1}.${slot + 1}`,
      `${slot + 1}/${(segment.matches || []).length}`,
      match.score,
      match.confidence,
      match.canonId,
      match.title,
      (match.whyMatched || []).join(' | '),
      segment.unit.text,
      '',
      '',
    );
  });
});
push('');

push('SECTION B — UNMAPPED CLAIM-LIKE PASSAGES (verdict: OK-NO-CANON | MISS)');
push('ref', 'why unmapped', 'nearest concept', 'nearest score', 'passage', 'VERDICT', 'NOTES');
const queueBySegment = new Map((result.researchQueue?.items || []).map((item) => [item.segmentId, item]));
unmapped.forEach((segment, index) => {
  const queued = queueBySegment.get(segment.unit.id);
  const nearest = queued?.nearestConcepts?.[0] || (segment.weakMatches || [])[0];
  push(
    `B${index + 1}`,
    queued?.whyUnmapped || 'Not queued.',
    nearest ? `${nearest.canonId} — ${nearest.title || ''}` : '(none)',
    nearest ? nearest.score : '',
    segment.unit.text,
    '',
    '',
  );
});
push('');

push('SECTION C — SET ASIDE BY THE DOMAIN GATE (verdict: OK | SHOULD-HAVE-BEEN-RETAINED)');
push('ref', 'reason code', 'reason', 'frame evidence', 'words', 'passage', 'VERDICT', 'NOTES');
ignored.forEach((passage, index) => {
  push(
    `C${index + 1}`,
    passage.reasonCode,
    passage.reasonLabel,
    (passage.frameEvidence || []).map((evidence) => `${evidence.frame}:${evidence.code}`).join(' | '),
    passage.wordCount,
    passage.excerpt,
    '',
    '',
  );
});

const csv = `${lines.join('\n')}\n`;
if (out) {
  fs.writeFileSync(out, csv, 'utf8');
  process.stderr.write(`[labeling-sheet] ${out} · A=${mapped.reduce((n, s) => n + (s.matches || []).length, 0)} mappings · B=${unmapped.length} unmapped · C=${ignored.length} set aside\n`);
} else {
  process.stdout.write(csv);
}
