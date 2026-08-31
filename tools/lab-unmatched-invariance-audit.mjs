#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const UMBRELLA_LIMITATION =
  'Unmatched umbrellas and reasons are deterministic explanatory triage applied only after a passage remains unmatched; they are not doctrine coverage, doctrine matches, or changes to canon ownership.';

function withoutAdditiveTriage(result) {
  const copy = JSON.parse(JSON.stringify(result));
  delete copy.generatedAt;
  if (Array.isArray(copy.limitations)) {
    const umbrellaLimitation = copy.limitations.indexOf(UMBRELLA_LIMITATION);
    if (umbrellaLimitation >= 0) copy.limitations.splice(umbrellaLimitation, 1);
  }
  if (copy.provenance?.analyzer) {
    delete copy.provenance.analyzer.version;
    delete copy.provenance.analyzer.researchQueueSchemaVersion;
  }
  if (copy.researchQueue) {
    delete copy.researchQueue.schemaVersion;
    delete copy.researchQueue.umbrellaTaxonomy;
    if (copy.researchQueue.provenance?.analyzer) {
      delete copy.researchQueue.provenance.analyzer.version;
      delete copy.researchQueue.provenance.analyzer.researchQueueSchemaVersion;
    }
    for (const item of copy.researchQueue.items || []) {
      delete item.unmatchedTriage;
      delete item.nearestConceptsStatus;
    }
  }
  return copy;
}

function firstDifference(left, right, trail = '$') {
  if (Object.is(left, right)) return null;
  if (typeof left !== typeof right || left === null || right === null) {
    return { trail, left, right };
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return { trail, left, right };
    if (left.length !== right.length) {
      return { trail: `${trail}.length`, left: left.length, right: right.length };
    }
    for (let index = 0; index < left.length; index += 1) {
      const difference = firstDifference(left[index], right[index], `${trail}[${index}]`);
      if (difference) return difference;
    }
    return null;
  }
  if (typeof left === 'object') {
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const key of keys) {
      if (!(key in left) || !(key in right)) {
        return { trail: `${trail}.${key}`, left: left[key], right: right[key] };
      }
      const difference = firstDifference(left[key], right[key], `${trail}.${key}`);
      if (difference) return difference;
    }
    return null;
  }
  return { trail, left, right };
}

function auditDirectories(beforeDir, afterDir) {
  const beforeFiles = fs.readdirSync(beforeDir).filter((file) => file.endsWith('.json')).sort();
  const afterFiles = fs.readdirSync(afterDir).filter((file) => file.endsWith('.json')).sort();
  assert.deepEqual(afterFiles, beforeFiles, 'baseline and after source populations differ');
  let segments = 0;
  let claims = 0;
  let mapped = 0;
  let unmatched = 0;
  let excluded = 0;
  for (const file of beforeFiles) {
    const before = JSON.parse(fs.readFileSync(path.join(beforeDir, file), 'utf8'));
    const after = JSON.parse(fs.readFileSync(path.join(afterDir, file), 'utf8'));
    const difference = firstDifference(
      withoutAdditiveTriage(before),
      withoutAdditiveTriage(after),
    );
    assert.equal(
      difference,
      null,
      `${file}: matcher/gate projection changed at ${difference?.trail}: `
        + `${JSON.stringify(difference?.left)} -> ${JSON.stringify(difference?.right)}`,
    );
    segments += Number(after.metrics?.analyzedPassages || 0);
    claims += Number(after.metrics?.claimLikeSegments || 0);
    mapped += Number(after.metrics?.mappedClaimSegments || 0);
    unmatched += Number(after.metrics?.unmappedClaimSegments || 0);
    excluded += Number(after.metrics?.ignoredDomainSegments || 0);
  }
  return { sources: beforeFiles.length, segments, claims, mapped, unmatched, excluded };
}

function selftest() {
  const base = {
    generatedAt: 'before',
    limitations: ['pre-existing limitation', 'another pre-existing limitation'],
    provenance: { analyzer: { version: 'old', researchQueueSchemaVersion: 'old', scoringConfigHash: 'same' } },
    metrics: { mappedClaimSegments: 1 },
    domainRelevance: { ignoredPassages: [{ segmentId: 'excluded-1', reasonCode: 'technical-nondomain' }] },
    segments: [{
      mapped: true,
      unit: { domainRelevance: { status: 'relevant', decisiveReason: 'explicit-outcome' } },
      matches: [{ canonId: 'x', score: 0.9, alignment: { label: 'Supports' } }],
    }],
    researchQueue: {
      schemaVersion: 'old',
      provenance: { analyzer: { version: 'old', researchQueueSchemaVersion: 'old', scoringConfigHash: 'same' } },
      items: [{ id: 'rq-1', excerpt: 'exact' }],
    },
  };
  const additive = JSON.parse(JSON.stringify(base));
  additive.generatedAt = 'after';
  additive.limitations.push(UMBRELLA_LIMITATION);
  additive.provenance.analyzer.version = 'new';
  additive.provenance.analyzer.researchQueueSchemaVersion = 'new';
  additive.researchQueue.schemaVersion = 'new';
  additive.researchQueue.umbrellaTaxonomy = { version: '1' };
  additive.researchQueue.items[0].unmatchedTriage = { primaryUmbrella: { id: 'u' } };
  additive.researchQueue.items[0].nearestConceptsStatus = 'nonmatches';
  assert.equal(
    firstDifference(withoutAdditiveTriage(base), withoutAdditiveTriage(additive)),
    null,
  );

  const assertMutationFails = (mutate, expectedTrail) => {
    const candidate = JSON.parse(JSON.stringify(additive));
    mutate(candidate);
    const difference = firstDifference(
      withoutAdditiveTriage(base),
      withoutAdditiveTriage(candidate),
    );
    assert.ok(difference, `mutation must fail invariance: ${expectedTrail}`);
    assert.equal(difference.trail, expectedTrail);
  };

  assertMutationFails(
    (candidate) => candidate.limitations.push('unrelated new limitation'),
    '$.limitations.length',
  );
  assertMutationFails(
    (candidate) => candidate.limitations.splice(0, 1),
    '$.limitations.length',
  );
  assertMutationFails(
    (candidate) => { candidate.limitations[0] = 'rewritten limitation'; },
    '$.limitations[0]',
  );
  assertMutationFails(
    (candidate) => { candidate.segments[0].matches[0].score = 0.89; },
    '$.segments[0].matches[0].score',
  );
  assertMutationFails(
    (candidate) => { candidate.segments[0].matches[0].canonId = 'other-owner'; },
    '$.segments[0].matches[0].canonId',
  );
  assertMutationFails(
    (candidate) => { candidate.segments[0].unit.domainRelevance.status = 'uncertain'; },
    '$.segments[0].unit.domainRelevance.status',
  );
  assertMutationFails(
    (candidate) => { candidate.segments[0].matches[0].alignment.label = 'Challenges'; },
    '$.segments[0].matches[0].alignment.label',
  );
  assertMutationFails(
    (candidate) => candidate.domainRelevance.ignoredPassages.push({ segmentId: 'excluded-2' }),
    '$.domainRelevance.ignoredPassages.length',
  );
  process.stdout.write('UNMATCHED INVARIANCE AUDIT SELFTEST PASSED\n');
}

const args = process.argv.slice(2);
if (args.includes('--selftest')) {
  selftest();
} else {
  const [beforeDir, afterDir] = args;
  if (!beforeDir || !afterDir) {
    process.stderr.write(
      'usage: node tools/lab-unmatched-invariance-audit.mjs <baseline-dir> <after-dir>\n',
    );
    process.exit(64);
  }
  const summary = auditDirectories(path.resolve(beforeDir), path.resolve(afterDir));
  process.stdout.write(
    `MATCHER/GATE INVARIANCE PASSED · ${summary.sources} sources · ${summary.segments} passages`
      + ` · ${summary.claims} claims · mapped=${summary.mapped}`
      + ` · unmatched=${summary.unmatched} · excluded=${summary.excluded}\n`,
  );
}
