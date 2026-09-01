#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import {
  UNMATCHED_TRIAGE_SCHEMA_VERSION,
  UNMATCHED_UMBRELLA_TAXONOMY,
  classifyUnmatchedPassage,
} from '../js/lab-unmatched-umbrellas.js';

const ROOT = new URL('../', import.meta.url);
const historicalEvaluation = JSON.parse(readFileSync(
  new URL('tests/fixtures/unmatched-umbrella-evaluation.json', ROOT),
  'utf8',
));
const successor = JSON.parse(readFileSync(
  new URL('tests/fixtures/unmatched-umbrella-evaluation-1.1.json', ROOT),
  'utf8',
));
const corrections = new Map(successor.caseCorrections.map((item) => [item.id, item]));
const evaluation = {
  ...successor,
  cases: [
    ...historicalEvaluation.cases.map((fixture) => {
      const correction = corrections.get(fixture.id) || {};
      return {
        ...fixture,
        ...correction,
        expected: { ...fixture.expected, ...(correction.expected || {}) },
      };
    }),
    ...successor.cases,
  ],
};
const evaluation13 = JSON.parse(readFileSync(
  new URL('tests/fixtures/unmatched-umbrella-evaluation-1.3.json', ROOT),
  'utf8',
));
const analyzerSource = readFileSync(new URL('js/lab-analyzer.js', ROOT), 'utf8');
const appSource = readFileSync(new URL('js/lab-app.js', ROOT), 'utf8');
const ledgerSource = readFileSync(new URL('js/lab-ledger.js', ROOT), 'utf8');
const exportSource = readFileSync(new URL('js/lab-export.js', ROOT), 'utf8');
const html = readFileSync(new URL('lab.html', ROOT), 'utf8');
const css = readFileSync(new URL('css/lab.css', ROOT), 'utf8');
const globalCss = readFileSync(new URL('css/styles.css', ROOT), 'utf8');

const umbrellaIds = new Set(UNMATCHED_UMBRELLA_TAXONOMY.umbrellas.map(({ id }) => id));
const reasonIds = new Set(
  UNMATCHED_UMBRELLA_TAXONOMY.unmatchedReasons.map(({ id }) => id),
);
assert.equal(umbrellaIds.size, 6, 'taxonomy must carry exactly six unique umbrella IDs');
assert.equal(reasonIds.size, 6, 'taxonomy must carry exactly six unique unmatched-reason IDs');

let exactPrimary = 0;
let exactReason = 0;
let exactSecondary = 0;
let supported = 0;
let abstained = 0;
const firstPass = new Map();

for (const fixture of evaluation.cases) {
  const result = classifyUnmatchedPassage(fixture.text);
  firstPass.set(fixture.id, JSON.stringify(result));
  assert.equal(result.schemaVersion, UNMATCHED_TRIAGE_SCHEMA_VERSION, fixture.id);
  assert.ok(umbrellaIds.has(result.primaryUmbrella.id), fixture.id);
  assert.ok(reasonIds.has(result.unmatchedReason.id), fixture.id);
  assert.equal(result.abstained, result.primaryUmbrella.id === 'unclassified', fixture.id);
  if (result.secondaryUmbrella) {
    assert.ok(umbrellaIds.has(result.secondaryUmbrella.id), fixture.id);
    assert.notEqual(result.secondaryUmbrella.id, result.primaryUmbrella.id, fixture.id);
  }
  if (result.primaryUmbrella.id === fixture.expected.primaryUmbrellaId) exactPrimary += 1;
  if (result.unmatchedReason.id === fixture.expected.unmatchedReasonId) exactReason += 1;
  if ((result.secondaryUmbrella?.id ?? null) === fixture.expected.secondaryUmbrellaId) {
    exactSecondary += 1;
  }
  if (result.abstained) abstained += 1;
  else supported += 1;
  if (fixture.kind === 'negative-control') {
    assert.equal(fixture.expected.abstained, true, `${fixture.id}: negative fixture standard`);
    assert.equal(result.abstained, true, `${fixture.id}: every negative control must abstain`);
  }
}

// Order and prior calls cannot mutate regex state or category decisions.
for (const fixture of [...evaluation.cases].reverse()) {
  assert.equal(
    JSON.stringify(classifyUnmatchedPassage(fixture.text)),
    firstPass.get(fixture.id),
    `${fixture.id}: classification changed when evaluation order reversed`,
  );
  assert.equal(
    JSON.stringify(classifyUnmatchedPassage(
      `  ${fixture.text.toUpperCase().replace(/\s+/g, '   ')}  `,
    )),
    firstPass.get(fixture.id),
    `${fixture.id}: category changed under case or whitespace normalization`,
  );
  assert.equal(
    JSON.stringify(classifyUnmatchedPassage(
      `\u200b${fixture.text.replace(/ /g, '\u00a0').replace(/\. /g, '.\r\n')}\u2060`,
    )),
    firstPass.get(fixture.id),
    `${fixture.id}: category changed under transport whitespace or invisible controls`,
  );
}

/*
 * The 1.3 successor is audited as its own population, not folded into the 61.
 * Folding would let a 1.3 pass paper over a 1.0/1.1 regression inside one
 * averaged number, and the reason the older sets are byte-frozen is precisely
 * that they should answer separately.
 */
let supported13 = 0;
let abstained13 = 0;
let negativeControls13 = 0;
const firstPass13 = new Map();
for (const fixture of evaluation13.cases) {
  const result = classifyUnmatchedPassage(fixture.text);
  firstPass13.set(fixture.id, JSON.stringify(result));
  assert.equal(result.schemaVersion, UNMATCHED_TRIAGE_SCHEMA_VERSION, fixture.id);
  assert.equal(result.abstained, fixture.expected.abstained, `${fixture.id}: abstention`);
  assert.equal(result.primaryUmbrella.id, fixture.expected.primaryUmbrellaId, `${fixture.id}: primary`);
  assert.equal(
    result.secondaryUmbrella?.id ?? null,
    fixture.expected.secondaryUmbrellaId,
    `${fixture.id}: secondary`,
  );
  assert.equal(result.unmatchedReason.id, fixture.expected.unmatchedReasonId, `${fixture.id}: reason`);
  if (fixture.kind === 'negative-control') {
    negativeControls13 += 1;
    assert.equal(result.abstained, true, `${fixture.id}: every negative control must abstain`);
  }
  if (result.abstained) abstained13 += 1;
  else supported13 += 1;
}
for (const fixture of [...evaluation13.cases].reverse()) {
  assert.equal(
    JSON.stringify(classifyUnmatchedPassage(fixture.text)),
    firstPass13.get(fixture.id),
    `${fixture.id}: classification changed when evaluation order reversed`,
  );
  assert.equal(
    JSON.stringify(classifyUnmatchedPassage(
      `  ${fixture.text.toUpperCase().replace(/\s+/g, '   ')}  `,
    )),
    firstPass13.get(fixture.id),
    `${fixture.id}: category changed under case or whitespace normalization`,
  );
  assert.equal(
    JSON.stringify(classifyUnmatchedPassage(
      `\u200b${fixture.text.replace(/ /g, '\u00a0').replace(/\. /g, '.\r\n')}\u2060`,
    )),
    firstPass13.get(fixture.id),
    `${fixture.id}: category changed under transport whitespace or invisible controls`,
  );
}
assert.equal(negativeControls13, 12, '1.3 set must keep its twelve negative controls');
assert.equal(evaluation13.cases.length, 23);
assert.equal(evaluation13.taxonomyVersion, UNMATCHED_UMBRELLA_TAXONOMY.version);

/*
 * The two older fixtures are pinned by content hash. A fixture quietly edited
 * to match new behaviour is the one failure mode a green evaluation cannot
 * reveal, and the standing rule here is that a red test gets diagnosed, never
 * greened by moving the goalpost. CR bytes are dropped so the pin survives a
 * checkout with either line-ending setting.
 */
const pinnedDigest = (name) => createHash('sha256')
  .update(Buffer.from(readFileSync(new URL(`tests/fixtures/${name}`, ROOT))
    .filter((byte) => byte !== 0x0d)))
  .digest('hex');
assert.equal(
  pinnedDigest('unmatched-umbrella-evaluation.json'),
  '96f04813a2d94f0bf7f45b8642208fdce032ccbf8f3d926cf1ff5ec8d4f2cba0',
  'taxonomy 1.0 evidence must stay byte-identical',
);
assert.equal(
  pinnedDigest('unmatched-umbrella-evaluation-1.1.json'),
  'e34ba158f084c1020825df646eb1f498d715bbd70f051f53be97802004b00f04',
  'taxonomy 1.1 successor must stay byte-identical',
);

assert.equal(exactPrimary, evaluation.cases.length);
assert.equal(exactReason, evaluation.cases.length);
assert.equal(exactSecondary, evaluation.cases.length);
assert.equal(supported, 36);
assert.equal(abstained, 25);
assert.deepEqual(
  UNMATCHED_UMBRELLA_TAXONOMY.umbrellas
    .find(({ id }) => id === 'asymmetric-nonhuman-relationships')
    ?.currentDoctrineOwners.map(({ id }) => id),
  ['frameworks:synthetic-reciprocity'],
);
assert.deepEqual(
  UNMATCHED_UMBRELLA_TAXONOMY.umbrellas
    .find(({ id }) => id === 'institutional-authority-governance')
    ?.currentDoctrineOwners.map(({ id }) => id),
  ['frameworks:authority-firewall'],
);

// Architectural coverage: one post-match call site, reached only through the
// final unmapped population. No triage field is admitted to public segments.
assert.equal(
  (analyzerSource.match(/classifyUnmatchedPassage\(result\.unit\.text\)/g) || []).length,
  1,
  'analyzer must have one unmatched-classifier call site',
);
assert.match(analyzerSource, /const unmappedClaims = claimResults\.filter\([\s\S]*?const researchItems = unmappedClaims\.map\(researchItemFor\)/);
assert.doesNotMatch(analyzerSource, /PUBLIC_(?:MATCH|SEGMENT|UNIT)_FIELDS[\s\S]{0,500}unmatchedTriage/);

for (const field of [
  'umbrella-label',
  'umbrella-confidence',
  'umbrella-rationale',
  'unmatched-reason',
  'secondary-umbrella',
  'doctrine-note',
]) {
  assert.match(html, new RegExp(`data-field="${field}"`), `UI field missing: ${field}`);
  assert.match(appSource, new RegExp(`'${field}'`), `UI renderer missing: ${field}`);
}
assert.match(html, /<details class="lab-unmatched-disclosure">[\s\S]*?<summary>/);
assert.match(html, /Closest canon concepts by wording — nonmatches/);
assert.match(appSource, /unmatchedLedgerLabel\(triage\)/);
assert.match(ledgerSource, /typeof triage\.abstained !== 'boolean'\) return 'Unmatched'/);
assert.match(ledgerSource, /triage\.abstained === true\) return 'Unmatched — Unclassified'/);
assert.match(exportSource, /Nearest LE concepts by wording \(nonmatches\)/);
assert.match(exportSource, /Doctrine status/);
assert.match(css, /\.lab-unmatched-disclosure > summary:focus-visible\s*\{/);
assert.match(css, /\.lab-unmatched-summary-copy > strong[\s\S]*?overflow-wrap:\s*anywhere/);
assert.match(
  css,
  /@media\s*\(max-width:\s*540px\)[\s\S]*?\.lab-unmatched-disclosure > summary[\s\S]*?flex-wrap:\s*wrap/,
);
assert.match(
  css,
  /@media\s*\(max-width:\s*540px\)[\s\S]*?\.lab-unmatched-disclosure \.lab-segment-ref[\s\S]*?flex-basis:/,
);
assert.match(globalCss, /html\[data-content-width="original"\]\s*\{\s*--container:/);
assert.match(globalCss, /html\[data-content-width="wide"\]\s*\{\s*--container:/);
assert.match(
  globalCss,
  /@media\s*\(max-width:\s*980px\)[\s\S]*?html\[data-content-width\][\s\S]*?--container:\s*100%/,
);
assert.doesNotMatch(
  css.match(/\.lab-research-card\s*\{[\s\S]*?@media\s*\(max-width:\s*540px\)/)?.[0] || '',
  /white-space:\s*nowrap/,
  'unmatched cards must not introduce nowrap between desktop and mobile contracts',
);

const percent = (value) => Math.round(value * 10_000) / 100;
process.stdout.write(
  `UNMATCHED UMBRELLA AUDIT PASSED · frozen=${evaluation.cases.length}`
  + ` · supported=${supported} · abstained=${abstained} (${percent(abstained / evaluation.cases.length)}%)`
  + ' · primary precision=100% · reason agreement=100% · secondary agreement=100%'
  + ` · 1.3 set=${evaluation13.cases.length} (${supported13} supported, ${abstained13} abstained, ${negativeControls13} negative controls all abstaining)`
  + ' · frozen 1.0/1.1 byte pins intact'
  + ' · category stability=100% · UI/export fields=6/6 · responsive/a11y contract=pass\n',
);
