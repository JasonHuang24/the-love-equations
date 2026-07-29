#!/usr/bin/env node
/**
 * LE Lab feedback router.
 *
 * Reads one `le-lab.mapping-feedback/1.1` file, validates it against the shipped
 * schema, decides which frozen fixture its failure layer belongs to, checks
 * whether the case is already covered, and DRAFTS the fixture stub a human would
 * commit.
 *
 * It never applies anything. Writing into tests/fixtures/ is refused outright:
 * promotion is a human commit, reviewed against md/FEEDBACK-PIPELINE.md, and a
 * tool that could edit a frozen benchmark would make "append-only" a courtesy
 * rather than a property.
 *
 * Usage:
 *   node tools/lab-feedback.mjs lab-feedback/inbox/le-lab-feedback-*.json
 *   node tools/lab-feedback.mjs <file> --out lab-feedback/drafts
 *   node tools/lab-feedback.mjs <file> --json
 *
 * REVISIONS. A flag ID is a content hash of the whole review, so the stub name
 * follows the opinion rather than the row: routing the same flag twice rewrites
 * the same file with the same bytes, and a revised or contradicting review is a
 * NEW file beside the old one. Neither is superseded automatically. Which
 * opinion won is an adjudication, recorded by a human in the promoted case's
 * `origin` block, and the losing flag stays in the inbox as part of the record.
 *
 * Options:
 *   --out <dir>   Write the stub to <dir>/<flagId>.stub.json instead of stdout.
 *                 The directory must not be inside tests/fixtures/.
 *   --json        Emit the whole routing report as JSON (for scripting).
 *   --quiet       Suppress the human-readable report; exit code carries the result.
 *
 * Exit codes:
 *   0  valid, routed, stub drafted
 *   1  the file is not a valid mapping-feedback document
 *   2  valid but already covered by an existing frozen case (nothing to draft)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { ALIGNMENT_LABELS, REVIEW_DISPOSITIONS } from '../js/lab-feedback.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN_BENCHMARK = path.join(ROOT_DIR, 'tests', 'fixtures', 'domain-relevance-benchmark.json');
const MAPPING_BENCHMARK = path.join(ROOT_DIR, 'tests', 'fixtures', 'canon-mapping-benchmark.json');
const FIXTURE_DIR = path.join(ROOT_DIR, 'tests', 'fixtures');

const DISPOSITIONS = new Map(REVIEW_DISPOSITIONS.map((item) => [item.id, item]));

/*
 * The routing table. One row per failure layer, and the same table
 * md/FEEDBACK-PIPELINE.md prints for humans — if these two disagree, the
 * document is wrong, because this one is executable.
 */
const ROUTES = {
  'domain-gate': {
    destination: 'tests/fixtures/domain-relevance-benchmark.json',
    benchmark: 'domain',
    idPrefix: 'ds',
    why: 'The gate decided whether this passage entered analysis at all. Nothing downstream can be judged until that is right.',
  },
  'retrieval-ranking': {
    destination: 'tests/fixtures/canon-mapping-benchmark.json',
    benchmark: 'mapping',
    idPrefix: 'cm',
    why: 'The passage was retained; what the matcher then did with it is a retrieval, ranking, or admission decision.',
  },
  alignment: {
    destination: 'tests/fixtures/canon-mapping-benchmark.json',
    benchmark: 'mapping',
    idPrefix: 'cm',
    why: 'The right concept with the wrong stance is an alignment defect; it is asserted as a stance expectation on a mapping case.',
  },
  segmentation: {
    destination: 'tests/lab-intake.test.mjs (intake fixtures)',
    benchmark: null,
    idPrefix: 'seg',
    why: 'The claim unit was cut in the wrong place before the gate or the matcher ran. Intake owns passage boundaries, and its cases are code, not JSON.',
  },
};

function parseArgs(argv) {
  const options = { file: null, out: null, json: false, quiet: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    switch (flag) {
      case '--out': options.out = argv[index + 1]; index += 1; break;
      case '--json': options.json = true; break;
      case '--quiet': options.quiet = true; break;
      case '--help': case '-h': options.help = true; break;
      default:
        if (flag.startsWith('--')) throw new Error(`Unknown option: ${flag}`);
        else if (!options.file) options.file = flag;
        else throw new Error('Route one feedback file at a time.');
    }
  }
  return options;
}

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Structural validation. Deliberately strict about the fields an adjudicator
 * needs and silent about the rest: a future schema may add blocks, and refusing
 * a file for carrying more than expected would age badly.
 */
export function validateFeedback(feedback) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };

  require(feedback?.schema === 'le-lab.mapping-feedback',
    `schema must be le-lab.mapping-feedback (got ${feedback?.schema ?? 'nothing'})`);
  require(String(feedback?.schemaVersion || '').startsWith('1.'),
    `schemaVersion 1.x is required (got ${feedback?.schemaVersion ?? 'nothing'})`);
  require(Boolean(feedback?.flagId), 'flagId is missing');
  require(['mapped', 'unmapped', 'set-aside'].includes(feedback?.row),
    `row must be mapped, unmapped, or set-aside (got ${feedback?.row ?? 'nothing'})`);

  const disposition = DISPOSITIONS.get(feedback?.review?.reviewDisposition);
  require(Boolean(disposition),
    `review.reviewDisposition "${feedback?.review?.reviewDisposition ?? ''}" is not a known disposition`);
  if (disposition) {
    require(feedback.review.failureLayer === disposition.layer,
      `review.failureLayer says ${feedback.review.failureLayer}, but ${disposition.id} belongs to ${disposition.layer}`);
  }
  const alignment = feedback?.review?.expectedAlignment;
  require(!alignment || ALIGNMENT_LABELS.includes(alignment),
    `review.expectedAlignment "${alignment}" is not one of the analyzer's labels`);

  require(Boolean(normalize(feedback?.claimUnit?.excerpt)), 'claimUnit.excerpt is empty');
  require(Boolean(feedback?.claimUnit?.segmentId), 'claimUnit.segmentId is missing');
  require(Boolean(feedback?.build?.analyzer?.version), 'build.analyzer.version is missing');
  require(Boolean(feedback?.build?.canonIndex?.version), 'build.canonIndex.version is missing');
  require(Boolean(feedback?.build?.analyzer?.scoringConfigHash), 'build.analyzer.scoringConfigHash is missing');
  require(feedback?.privacy?.fullTranscriptIncluded === false,
    'privacy.fullTranscriptIncluded must be false; this file should never carry a whole source');

  // A retained row without a trace can still be adjudicated, but the adjudicator
  // is working blind, so say so rather than letting it pass unremarked.
  const warnings = [];
  if (feedback?.row !== 'set-aside' && feedback?.candidateTrace?.available !== true) {
    warnings.push(`the candidate trace is unavailable (${feedback?.candidateTrace?.reason || 'no reason given'}); the pre-display evidence is not in this file`);
  }
  // A UI-only release moves the Lab token and not the analyzer, so a patch-level
  // difference is the normal state and warning about it would be pure noise. A
  // minor-level gap means the flag was raised against an engine the current Lab
  // no longer ships, and that is worth stopping on.
  const minor = (version) => String(version || '').split('.').slice(0, 2).join('.');
  if (feedback?.build?.analyzer?.version && feedback?.build?.labRelease
    && minor(feedback.build.analyzer.version) !== minor(feedback.build.labRelease)) {
    warnings.push(`flagged on Lab ${feedback.build.labRelease} against analyzer ${feedback.build.analyzer.version} — the engine and the interface are more than a patch apart; confirm which one produced the behavior`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Every case text in a benchmark, normalized, so a duplicate is findable. */
function benchmarkTexts(benchmark) {
  const found = new Map();
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    if (node.id && typeof node.text === 'string') found.set(normalize(node.text).toLowerCase(), node);
    Object.values(node).forEach(walk);
  };
  walk(benchmark);
  return found;
}

async function loadJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

/**
 * Is this passage already frozen somewhere? Checked against BOTH benchmarks, not
 * just the routed one: a sentence that is already a known domain miss should not
 * reappear as a fresh mapping case under a different label.
 */
export async function findExistingCase(excerpt) {
  const needle = normalize(excerpt).toLowerCase();
  for (const [file, label] of [[DOMAIN_BENCHMARK, 'domain-relevance-benchmark'], [MAPPING_BENCHMARK, 'canon-mapping-benchmark']]) {
    const existing = benchmarkTexts(await loadJson(file)).get(needle);
    if (existing) return { benchmark: label, file: path.relative(ROOT_DIR, file).replace(/\\/g, '/'), case: existing };
  }
  return null;
}

function primaryOf(feedback) {
  return feedback.display?.primary?.canonId || null;
}

/** The candidates a reviewer most likely means, pulled from the trace for the note. */
function traceHighlights(feedback) {
  const candidates = feedback.candidateTrace?.candidates || [];
  return candidates.slice(0, 6).map((candidate) => ({
    canonId: candidate.canonId,
    rank: candidate.rank,
    rankAtRetrieval: candidate.rankAtRetrieval,
    score: candidate.score,
    display: candidate.display,
    retainedBecause: candidate.truncationFate?.retainedBecause,
    penalties: (candidate.penalties || []).map((penalty) => penalty.code),
    surfaces: candidate.matchSurfaces?.hit || [],
    credible: candidate.admission?.credible,
  }));
}

function domainStub(feedback) {
  // The gate's decision is what is being disputed, so the expected label is the
  // opposite of what happened — but only the reviewer's note can say WHY, and
  // the adjudicator supplies family and register by hand.
  const wasSetAside = feedback.row === 'set-aside';
  return {
    id: 'ds-TBD (assign the next free number)',
    family: 'TBD — direct-domain | polysemous-trap | methodology-prose | …',
    expected: wasSetAside ? 'retain' : 'ignore',
    register: 'TBD',
    text: feedback.claimUnit.excerpt,
    note: `Routed from flag ${feedback.flagId} (${feedback.review.reviewDisposition}) on Lab ${feedback.build.labRelease}. The gate said ${feedback.domainDecision?.status} via ${feedback.domainDecision?.reasonCode}; the reviewer says that is wrong.${feedback.review.note ? ` Reviewer: "${feedback.review.note}"` : ''} ADJUDICATOR: confirm the gold label is unambiguous to a careful reader before appending — deliberately borderline passages are excluded by the benchmark's own policy.`,
  };
}

function mappingStub(feedback) {
  const expected = {};
  const disposition = feedback.review.reviewDisposition;
  const expectedIds = feedback.review.expectedCanonIds || [];
  const forbiddenIds = feedback.review.forbiddenCanonIds || [];

  if (disposition === 'should-remain-unmapped') expected.mapped = false;
  else if (disposition === 'false-positive') expected.absentCanonIds = forbiddenIds.length ? forbiddenIds : [primaryOf(feedback)].filter(Boolean);
  else if (disposition === 'wrong-primary') {
    if (expectedIds.length) expected.primaryCanonId = expectedIds[0];
    if (forbiddenIds.length) expected.absentCanonIds = forbiddenIds;
  } else if (disposition === 'missing-expected-concept') {
    expected.mapped = true;
    if (expectedIds.length) expected.presentCanonIds = expectedIds;
  } else if (disposition === 'wrong-stance') {
    expected.alignment = {
      canonId: expectedIds[0] || primaryOf(feedback),
      label: feedback.review.expectedAlignment || 'TBD — the adjudicated stance',
    };
  }

  const observed = {
    mapped: feedback.row === 'mapped',
    primaryCanonId: primaryOf(feedback),
    primaryScore: feedback.display?.primary?.score ?? null,
    primaryAlignment: feedback.display?.primary?.alignment?.label ?? null,
    credibleMatches: [primaryOf(feedback), ...(feedback.display?.secondary || []).map((match) => match.canonId)]
      .filter(Boolean),
    weakMatches: (feedback.display?.weak || []).map((match) => match.canonId),
    candidateCount: feedback.candidateTrace?.candidateCount ?? null,
    hiddenByDisplayCaps: feedback.candidateTrace?.hiddenByDisplayCaps ?? null,
  };

  return {
    id: 'cm-TBD (assign the next free number)',
    text: feedback.claimUnit.excerpt,
    origin: {
      flagId: feedback.flagId,
      reviewDisposition: disposition,
      failureLayer: feedback.review.failureLayer,
      labRelease: feedback.build.labRelease,
      analyzer: feedback.build.analyzer.version,
      canonIndex: feedback.build.canonIndex.version,
      scoringConfigHash: feedback.build.analyzer.scoringConfigHash,
      adjudicatedOn: 'TBD — the date a human decided this',
      adjudicatedBy: 'TBD — who decided it',
    },
    expected,
    observedAtFreeze: observed,
    note: `Drafted by tools/lab-feedback.mjs from flag ${feedback.flagId}.${feedback.review.note ? ` Reviewer: "${feedback.review.note}"` : ''} ADJUDICATOR: fill every TBD, confirm the expectations state what was actually decided rather than everything that could be asserted, and delete any expectation the adjudication did not reach.`,
    traceHighlights: traceHighlights(feedback),
  };
}

function segmentationStub(feedback) {
  return {
    kind: 'intake-fixture-draft',
    destination: 'tests/lab-intake.test.mjs',
    text: feedback.claimUnit.excerpt,
    observedUnit: {
      segmentId: feedback.claimUnit.segmentId,
      parentSegmentId: feedback.claimUnit.parentSegmentId,
      wordCount: feedback.claimUnit.wordCount,
      sourceBoundary: feedback.claimUnit.sourceBoundary,
      boundedContext: feedback.claimUnit.boundedContext,
      predecessor: feedback.claimUnit.predecessor,
    },
    note: `Routed from flag ${feedback.flagId}. Intake cases are code, not JSON: write this as an assertion about detectClaimUnits/normalizeInput boundaries in tests/lab-intake.test.mjs.${feedback.review.note ? ` Reviewer: "${feedback.review.note}"` : ''} The parent segment's full text is NOT in the flag file by design — reproduce the boundary case from the source before writing the assertion.`,
  };
}

export function routeFeedback(feedback) {
  const layer = feedback.review.failureLayer;
  const route = ROUTES[layer];
  if (!route) throw new Error(`No route for failure layer "${layer}".`);
  const stub = layer === 'domain-gate'
    ? domainStub(feedback)
    : layer === 'segmentation'
      ? segmentationStub(feedback)
      : mappingStub(feedback);
  return { layer, ...route, stub };
}

function reportLines(feedback, validation, route, existing) {
  const lines = [
    `flag ............ ${feedback.flagId}`,
    `disposition ..... ${feedback.review.reviewDisposition} (${feedback.review.dispositionLabel})`,
    `failure layer ... ${feedback.review.failureLayer}`,
    `row ............. ${feedback.row}`,
    `build ........... Lab ${feedback.build.labRelease} · analyzer ${feedback.build.analyzer.version} · canon ${feedback.build.canonIndex.version} · scoring ${feedback.build.analyzer.scoringConfigHash}`,
    `trace ........... ${feedback.candidateTrace?.available
      ? `${feedback.candidateTrace.candidateCount} candidates, ${feedback.candidateTrace.hiddenByDisplayCaps} hidden by display caps`
      : `unavailable (${feedback.candidateTrace?.reason})`}`,
    `excerpt ......... "${normalize(feedback.claimUnit.excerpt).slice(0, 100)}"`,
    '',
    `ROUTE ........... ${route.destination}`,
    `  because ....... ${route.why}`,
  ];
  validation.warnings.forEach((warning) => lines.push(`WARNING ......... ${warning}`));
  if (existing) {
    lines.push(
      '',
      `ALREADY COVERED . ${existing.case.id} in ${existing.file}`,
      `  ${existing.case.note ? normalize(existing.case.note).slice(0, 220) : '(no note)'}`,
      '',
      'Nothing to append. The case is already frozen; the work is the fix, not the fixture.',
    );
  }
  return lines;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.file) {
    process.stdout.write(`${String(await fs.readFile(fileURLToPath(import.meta.url), 'utf8'))
      .split('*/')[0].replace(/^#!.*\n/, '').replace(/^\/\*\*?/, '').replace(/^ \* ?/gm, '')}\n`);
    return;
  }

  const feedback = await loadJson(path.resolve(options.file));
  const validation = validateFeedback(feedback);
  if (!validation.valid) {
    process.stderr.write(`INVALID mapping-feedback file: ${options.file}\n`);
    validation.errors.forEach((error) => process.stderr.write(`- ${error}\n`));
    process.exitCode = 1;
    return;
  }

  const route = routeFeedback(feedback);
  const existing = await findExistingCase(feedback.claimUnit.excerpt);

  if (options.json) {
    process.stdout.write(`${JSON.stringify({
      flagId: feedback.flagId,
      valid: true,
      warnings: validation.warnings,
      route: { layer: route.layer, destination: route.destination, why: route.why },
      alreadyCovered: existing ? { id: existing.case.id, file: existing.file } : null,
      stub: existing ? null : route.stub,
    }, null, 2)}\n`);
  } else if (!options.quiet) {
    process.stdout.write(`${reportLines(feedback, validation, route, existing).join('\n')}\n`);
  }

  if (existing) {
    process.exitCode = 2;
    return;
  }

  if (options.out) {
    const outDir = path.resolve(options.out);
    if (outDir === FIXTURE_DIR || outDir.startsWith(`${FIXTURE_DIR}${path.sep}`)) {
      process.stderr.write('Refusing to write into tests/fixtures/. This tool drafts; promotion is a human commit.\n');
      process.exitCode = 1;
      return;
    }
    await fs.mkdir(outDir, { recursive: true });
    const target = path.join(outDir, `${feedback.flagId}.stub.json`);
    await fs.writeFile(target, `${JSON.stringify(route.stub, null, 2)}\n`, 'utf8');
    if (!options.quiet) process.stdout.write(`\nstub drafted -> ${path.relative(ROOT_DIR, target).replace(/\\/g, '/')}\n`);
  } else if (!options.json && !options.quiet) {
    process.stdout.write(`\n--- draft stub for ${route.destination} ---\n${JSON.stringify(route.stub, null, 2)}\n`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
