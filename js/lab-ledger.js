export const LEDGER_COLUMN_COUNT = 7;

export function ledgerFilterIsActive(controlFilter, activeFilter) {
  return controlFilter === activeFilter;
}

export function nextLedgerFilter(activeFilter, requestedFilter) {
  return activeFilter === requestedFilter ? 'all' : requestedFilter;
}

export function ledgerRowMatchesFilter(segment, filter) {
  if (filter === 'mapped') return Boolean(segment.mapped);
  if (filter === 'unmapped') return !segment.mapped;
  return true;
}

export function matchSection(match) {
  return [match?.category, match?.subcategory].filter(Boolean).join(' \u00b7 ');
}

export function displayedLedgerSection(segment) {
  const match = segment.mapped ? segment.matches?.[0] : segment.weakMatches?.[0];
  return matchSection(match);
}

export function ledgerSortValue(entry, key) {
  const segment = entry.segment;
  const primary = segment.mapped ? segment.matches?.[0] : null;
  switch (key) {
    case 'excerpt':
      return String(segment.unit.text || '').toLowerCase();
    case 'alignment':
      return primary?.alignment?.label
        ? primary.alignment.label.toLowerCase()
        : null;
    case 'connection':
      return primary
        ? `0${primary.title.toLowerCase()}`
        : (segment.weakMatches?.[0] ? `1${segment.weakMatches[0].title.toLowerCase()}` : '2');
    case 'section': {
      const section = displayedLedgerSection(segment);
      return section ? section.toLowerCase() : null;
    }
    case 'confidence':
      return primary
        ? Number(primary.score || primary.bestScore || 0)
        : (segment.weakMatches?.[0] ? Number(segment.weakMatches[0].score || 0) - 1 : -2);
    case 'triage': {
      const relevance = segment.unit.domainRelevance || {};
      if (relevance.override === 'include') return 0;
      if (relevance.status === 'uncertain') return 1;
      return 2;
    }
    case 'order':
    default:
      return entry.order;
  }
}

export function compareLedgerEntries(a, b, sort) {
  const left = ledgerSortValue(a, sort.key);
  const right = ledgerSortValue(b, sort.key);
  const leftMissing = left == null;
  const rightMissing = right == null;
  if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;

  let delta;
  if (typeof left === 'number' && typeof right === 'number') delta = left - right;
  else delta = String(left).localeCompare(String(right));
  if (delta !== 0) return sort.dir === 'desc' ? -delta : delta;
  return a.order - b.order;
}
