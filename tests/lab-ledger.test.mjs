import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEDGER_COLUMN_COUNT,
  compareLedgerEntries,
  displayedLedgerSection,
  ledgerFilterIsActive,
  ledgerRowMatchesFilter,
  nextLedgerFilter,
  unmatchedLedgerLabel,
} from '../js/lab-ledger.js';

function match({
  title = 'Connection',
  alignment = 'Supports',
  category = 'Statistics',
  subcategory = '',
  score = 0.72,
} = {}) {
  return {
    title,
    alignment: { label: alignment },
    category,
    subcategory,
    score,
  };
}

function entry(order, {
  text = 'Same excerpt',
  mapped = true,
  primary = match(),
  weak = null,
  relevance = {},
} = {}) {
  return {
    order,
    segment: {
      mapped,
      unit: { text, domainRelevance: relevance },
      matches: mapped && primary ? [primary] : [],
      weakMatches: weak ? [weak] : [],
    },
  };
}

function sortedOrders(entries, key, dir) {
  return [...entries]
    .sort((a, b) => compareLedgerEntries(a, b, { key, dir }))
    .map((item) => item.order);
}

test('all ledger filter controls expose the active state and restrictive filters still clear', () => {
  assert.equal(ledgerFilterIsActive('all', 'all'), true);
  assert.equal(ledgerFilterIsActive('mapped', 'all'), false);
  assert.equal(ledgerFilterIsActive('mapped', 'mapped'), true);
  assert.equal(ledgerFilterIsActive('unmapped', 'unmapped'), true);
  assert.equal(nextLedgerFilter('mapped', 'mapped'), 'all');
  assert.equal(nextLedgerFilter('unmapped', 'all'), 'all');
  assert.equal(ledgerRowMatchesFilter({ mapped: true }, 'mapped'), true);
  assert.equal(ledgerRowMatchesFilter({ mapped: false }, 'unmapped'), true);
});

test('alignment keeps unmapped last and source-order ties stable in both directions', () => {
  const entries = [
    entry(0, { mapped: false, primary: null }),
    entry(1, { primary: match({ alignment: 'Supports' }) }),
    entry(2, { primary: match({ alignment: 'Challenges' }) }),
    entry(3, { primary: match({ alignment: 'Supports' }) }),
  ];

  assert.deepEqual(sortedOrders(entries, 'alignment', 'asc'), [2, 1, 3, 0]);
  assert.deepEqual(sortedOrders(entries, 'alignment', 'desc'), [1, 3, 2, 0]);
});

test('every ledger data sorter preserves source order for equal keys in both directions', () => {
  const entries = [entry(4), entry(1)];
  for (const key of ['excerpt', 'alignment', 'connection', 'section', 'confidence', 'triage']) {
    assert.deepEqual(sortedOrders(entries, key, 'asc'), [1, 4], `${key} ascending`);
    assert.deepEqual(sortedOrders(entries, key, 'desc'), [1, 4], `${key} descending`);
  }
});

test('section sorting groups mapped and weak-match display sections with missing last', () => {
  const entries = [
    entry(0, { mapped: false, primary: null, weak: match({ category: 'Statistics' }) }),
    entry(1, { primary: match({ category: 'Mythbuster', subcategory: 'Attraction' }) }),
    entry(2, { mapped: false, primary: null, weak: match({ category: 'Gender Dynamics' }) }),
    entry(3, {
      mapped: false,
      primary: null,
      weak: match({ category: 'Mythbuster', subcategory: 'Attraction' }),
    }),
    entry(4, { mapped: false, primary: null }),
    entry(5, { primary: match({ category: 'Rules & Frameworks' }) }),
    entry(6, { primary: match({ category: 'Statistics' }) }),
  ];

  assert.deepEqual(sortedOrders(entries, 'section', 'asc'), [2, 1, 3, 5, 0, 6, 4]);
  assert.deepEqual(sortedOrders(entries, 'section', 'desc'), [0, 6, 5, 1, 3, 2, 4]);
  assert.equal(displayedLedgerSection(entries[1].segment), 'Mythbuster \u00b7 Attraction');
  assert.equal(displayedLedgerSection(entries[3].segment), 'Mythbuster \u00b7 Attraction');
  assert.equal(displayedLedgerSection(entries[4].segment), '');
});

test('ledger message rows use the full eight-column table width', () => {
  // Bumped at v2.4.1 when the Review column joined Triage. A message row that
  // spans the wrong number of columns is the visible symptom of the two drifting.
  assert.equal(LEDGER_COLUMN_COUNT, 8);
});

test('legacy unmatched rows do not imply a classifier decision', () => {
  assert.equal(unmatchedLedgerLabel(null), 'Unmatched');
  assert.equal(unmatchedLedgerLabel(undefined), 'Unmatched');
  assert.equal(unmatchedLedgerLabel({}), 'Unmatched');
  assert.equal(unmatchedLedgerLabel({
    schemaVersion: 'le-lab.unmatched-triage/1.1.0',
    primaryUmbrella: { id: 'unclassified', label: 'Unclassified' },
  }), 'Unmatched', 'an explicit abstention decision is required');
  assert.equal(unmatchedLedgerLabel({
    schemaVersion: 'le-lab.unmatched-triage/1.1.0',
    abstained: true,
    primaryUmbrella: { id: 'unclassified', label: 'Unclassified' },
  }), 'Unmatched — Unclassified');
  assert.equal(unmatchedLedgerLabel({
    schemaVersion: 'le-lab.unmatched-triage/1.1.0',
    abstained: false,
    primaryUmbrella: {
      id: 'institutional-authority-governance',
      label: 'Institutional authority and governance',
    },
  }), 'Unmatched — Institutional authority and governance');
});
