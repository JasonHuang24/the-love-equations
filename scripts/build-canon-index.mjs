#!/usr/bin/env node
/**
 * Build the LE Lab canon index from the site's canonical source files.
 *
 * The generator deliberately has no package dependencies. It extracts stable
 * structure and source-authored summaries from the HTML/inline data, then
 * applies data/canon-overlay.json for the small amount of semantic metadata
 * that markup alone cannot express (aliases, dependencies, boundaries, and
 * pressure tests).
 *
 * Run:
 *   node scripts/build-canon-index.mjs
 *
 * The generated file is committed so the static Lab can load it directly.
 */

import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
export const INDEX_PATH = path.join(ROOT_DIR, 'data', 'le-canon-index.json');
export const OVERLAY_PATH = path.join(ROOT_DIR, 'data', 'canon-overlay.json');

// 1.1 adds standaloneAliases / contextualAliases to every entry. Additive, but
// not cosmetic: it is a new statement about what the match surface MEANS, so a
// consumer must be able to tell a typed index from an untyped one without
// inspecting entries.
export const INDEX_SCHEMA_VERSION = 'le-canon-index/1.1';
// 1.1 accepts the same two fields from a curator.
export const OVERLAY_SCHEMA_VERSION = 'le-canon-overlay/1.1';

export const EVIDENCE_TYPES = new Set([
  'Framework',
  'Model',
  'Rule',
  'LE synthesis',
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Observation',
  'Lens',
  'Strategy',
  'Tested claim',
  'Hard data',
  'Evidence-based',
  'Definitional',
  'Glossary',
  'Record',
  'LE framework',
  'Record + framework',
  'Long-form synthesis',
  'Instrument',
]);

const SOURCE_SPECS = [
  { page: 'hierarchy.html', category: 'Love Hierarchy', sourceType: 'Framework page', extractor: extractHierarchy },
  { page: 'smvlevers.html', category: 'Five Levers', sourceType: 'Model page', extractor: extractSmvLevers },
  { page: 'frameworks.html', category: 'Rules & Frameworks', sourceType: 'Framework page', extractor: extractFrameworks },
  { page: 'gender-dynamics.html', category: 'Gender Dynamics', sourceType: 'Canon cards', extractor: extractGenderDynamics },
  { page: 'statistics.html', category: 'Statistics', sourceType: 'Evidence charts', extractor: extractStatistics },
  {
    page: 'mythbuster.html',
    category: 'Mythbuster',
    sourceType: 'Sourced rulings',
    dataFiles: ['js/mythbuster.js'],
    extractor: extractMythbuster,
  },
  { page: 'pills.html', category: 'Pill Dossiers', sourceType: 'Lens dossiers', extractor: extractPills },
  { page: 'lexicon.html', category: 'Lexicon', sourceType: 'Glossary data', extractor: extractLexicon },
  { page: 'deep-dive.html', category: 'Deep Dives', sourceType: 'Essay registry', extractor: extractDeepDiveHub },
  {
    page: 'dd-relationships-throughout-history.html',
    category: 'Deep Dives',
    sourceType: 'Long-form essay',
    extractor: extractDeepDiveEssay,
  },
  { page: 'dd-third-spaces.html', category: 'Deep Dives', sourceType: 'Long-form essay', extractor: extractDeepDiveEssay },
  {
    page: 'dd-relationships-by-country.html',
    category: 'Deep Dives',
    sourceType: 'Long-form essay',
    extractor: extractDeepDiveEssay,
  },
  {
    page: 'dd-what-the-wall-actually-is.html',
    category: 'Deep Dives',
    sourceType: 'Long-form essay',
    extractor: extractDeepDiveEssay,
  },
  {
    page: 'dd-single-parenthood.html',
    category: 'Deep Dives',
    sourceType: 'Long-form essay',
    extractor: extractDeepDiveEssay,
  },
  { page: 'dd-the-red-pill.html', category: 'Deep Dives', sourceType: 'Long-form essay', extractor: extractDeepDiveEssay },
  {
    page: 'dd-competition-anxiety.html',
    category: 'Deep Dives',
    sourceType: 'Long-form essay',
    extractor: extractDeepDiveEssay,
  },
  {
    page: 'dd-autism-and-dating.html',
    category: 'Deep Dives',
    sourceType: 'Long-form essay',
    extractor: extractDeepDiveEssay,
  },
  { page: 'smvcalc.html', category: 'Instruments', sourceType: 'On-device instrument', extractor: extractInstrument },
  { page: 'compatibility.html', category: 'Instruments', sourceType: 'On-device instrument', extractor: extractInstrument },
  { page: 'face.html', category: 'Instruments', sourceType: 'On-device instrument', extractor: extractInstrument },
  { page: 'body.html', category: 'Instruments', sourceType: 'On-device instrument', extractor: extractInstrument },
  { page: 'matchmaker.html', category: 'Instruments', sourceType: 'On-device instrument', extractor: extractInstrument },
];

const ENTITY_MAP = {
  amp: '&',
  apos: "'",
  quot: '"',
  lt: '<',
  gt: '>',
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  middot: '·',
  bull: '•',
  laquo: '«',
  raquo: '»',
  eacute: 'é',
  oacute: 'ó',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  times: '×',
  divide: '÷',
  asymp: '≈',
  ge: '≥',
  le: '≤',
  rarr: '→',
  larr: '←',
  harr: '↔',
  plusmn: '±',
  deg: '°',
  sect: '§',
  copy: '©',
};

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr',
]);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function decodeEntities(value = '') {
  return String(value).replace(/&(#x[\da-f]+|#\d+|[a-z][a-z0-9]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const radix = code[1].toLowerCase() === 'x' ? 16 : 10;
      const raw = radix === 16 ? code.slice(2) : code.slice(1);
      const point = Number.parseInt(raw, radix);
      return Number.isFinite(point) ? String.fromCodePoint(point) : match;
    }
    return Object.prototype.hasOwnProperty.call(ENTITY_MAP, code.toLowerCase())
      ? ENTITY_MAP[code.toLowerCase()]
      : match;
  });
}

function cleanText(value = '') {
  return decodeEntities(String(value))
    .replace(/\u00ad/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?%)\]])/g, '$1')
    .replace(/([([])\s+/g, '$1')
    .trim();
}

function cleanMarkupText(value = '') {
  return cleanText(String(value).replace(/<[^>]*>/g, ' '));
}

export function slugify(value = '') {
  return cleanMarkupText(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function lexSlug(rawTerm) {
  return `term-${String(rawTerm)
    .replace(/&[^;\s]+;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}

function summarize(value, max = 420) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const sample = text.slice(0, max + 1);
  const sentenceStops = [...sample.matchAll(/[.!?](?=\s|$)/g)];
  const usable = sentenceStops.filter((match) => match.index >= Math.floor(max * 0.55));
  if (usable.length) return sample.slice(0, usable.at(-1).index + 1);
  const boundary = sample.lastIndexOf(' ');
  return `${sample.slice(0, boundary > max * 0.6 ? boundary : max).trim()}…`;
}

function parseAttrs(token) {
  const attrs = {};
  const head = token.match(/^<\s*\/?\s*[^\s/>]+/);
  const body = token
    .slice(head ? head[0].length : 1, token.length - (token.endsWith('/>') ? 2 : 1));
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(body))) {
    const name = match[1].toLowerCase();
    attrs[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

/**
 * Tiny purpose-built HTML tree. Script/style bodies are removed first so
 * template literals cannot masquerade as markup. The canonical JS arrays are
 * extracted separately from their raw source.
 */
export function parseHtml(source) {
  const withoutRawText = String(source)
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script\s*>/gi, '<script$1></script>')
    .replace(/<style\b([^>]*)>[\s\S]*?<\/style\s*>/gi, '<style$1></style>');
  const root = { tag: '#root', attrs: {}, children: [], parent: null };
  const stack = [root];
  const tokens = withoutRawText.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+/g) || [];

  for (const token of tokens) {
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const name = token.match(/^<\s*\/\s*([^\s>]+)/)?.[1]?.toLowerCase();
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (token.startsWith('<')) {
      const name = token.match(/^<\s*([^\s/>]+)/)?.[1]?.toLowerCase();
      if (!name) continue;
      const parent = stack.at(-1);
      const node = { tag: name, attrs: parseAttrs(token), children: [], parent };
      parent.children.push(node);
      if (!token.endsWith('/>') && !VOID_TAGS.has(name)) stack.push(node);
      continue;
    }
    if (token) {
      stack.at(-1).children.push({ tag: '#text', value: token, attrs: {}, children: [], parent: stack.at(-1) });
    }
  }
  return root;
}

function walk(node, callback) {
  for (const child of node.children || []) {
    callback(child);
    if (child.children?.length) walk(child, callback);
  }
}

function all(node, predicate) {
  const matches = [];
  walk(node, (candidate) => {
    if (predicate(candidate)) matches.push(candidate);
  });
  return matches;
}

function first(node, predicate) {
  let found = null;
  walk(node, (candidate) => {
    if (!found && predicate(candidate)) found = candidate;
  });
  return found;
}

function classList(node) {
  return new Set(String(node?.attrs?.class || '').split(/\s+/).filter(Boolean));
}

function hasClass(node, className) {
  return classList(node).has(className);
}

function hasAnyClass(node, names) {
  const classes = classList(node);
  return names.some((name) => classes.has(name));
}

function nodeText(node, skipClasses = new Set()) {
  if (!node) return '';
  if (node.tag === '#text') return node.value || '';
  if ([...skipClasses].some((className) => hasClass(node, className))) return '';
  return cleanText((node.children || []).map((child) => nodeText(child, skipClasses)).join(' '));
}

function byClass(node, className) {
  return first(node, (candidate) => hasClass(candidate, className));
}

function allByClass(node, className) {
  return all(node, (candidate) => hasClass(candidate, className));
}

function byTag(node, tag) {
  return first(node, (candidate) => candidate.tag === tag);
}

function allByTag(node, tag) {
  return all(node, (candidate) => candidate.tag === tag);
}

function descendantWithId(node, id) {
  return first(node, (candidate) => candidate.attrs?.id === id);
}

function directChildren(node, predicate) {
  return (node?.children || []).filter((child) => child.tag !== '#text' && predicate(child));
}

function syntheticNode(children) {
  return { tag: '#segment', attrs: {}, children, parent: null };
}

function nodesFrom(node, start, stopPredicate) {
  const siblings = node.children || [];
  const startAt = siblings.indexOf(start);
  if (startAt < 0) return syntheticNode([start]);
  const selected = [];
  for (let i = startAt; i < siblings.length; i += 1) {
    if (i > startAt && stopPredicate(siblings[i])) break;
    selected.push(siblings[i]);
  }
  return syntheticNode(selected);
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const raw of values || []) {
    const value = cleanText(raw);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function uniqueLinks(values) {
  const seen = new Set();
  const result = [];
  for (const source of values || []) {
    if (!source || typeof source !== 'object') continue;
    const url = cleanText(source.url || '');
    if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    result.push({ label: cleanText(source.label || url), url });
  }
  return result;
}

function aliasesForTitle(title) {
  const clean = cleanMarkupText(title);
  const aliases = [];
  const withoutThe = clean.replace(/^the\s+/i, '');
  const withoutParen = clean.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  if (withoutThe !== clean) aliases.push(withoutThe);
  if (withoutParen !== clean) aliases.push(withoutParen);
  const paren = clean.match(/\(([^)]+)\)/);
  if (paren) aliases.push(paren[1]);
  return uniqueStrings(aliases);
}

/**
 * A contextual alias entry: the word, plus the modifiers that disqualify it.
 * `notAfter` lists words which, when they immediately precede the alias, mean
 * the passage is using the other sense of it — "cloud provider" is not the LE
 * concept of a provider no matter how relational the surrounding sentence is.
 */
function normalizeContextualAliases(values) {
  const seen = new Set();
  const result = [];
  for (const value of values || []) {
    const item = typeof value === 'string' ? { alias: value } : value;
    const alias = cleanMarkupText(item?.alias || '');
    if (!alias || seen.has(alias)) continue;
    seen.add(alias);
    result.push({ alias, notAfter: uniqueStrings((item.notAfter || []).map(cleanMarkupText)) });
  }
  return result;
}

/*
 * Link data for a subtree. `allByTag` walks descendants only, so a node that is
 * itself the link — deep-dive.html wraps each essay card in `<a class="dd-feature"
 * href=...>` — would otherwise report no links at all. Widening to `node.parent`
 * is not the fix: for a card sitting in a grid of sibling cards that pulls every
 * sibling's href into every entry.
 */
function linkData(node) {
  const external = [];
  const internal = [];
  const anchors = node?.tag === 'a' ? [node, ...allByTag(node, 'a')] : allByTag(node, 'a');
  for (const anchor of anchors) {
    const href = cleanText(anchor.attrs?.href || '');
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) {
      external.push({ label: nodeText(anchor) || href, url: href });
    } else if (!href.startsWith('//')) {
      internal.push(href);
    }
  }
  return { external: uniqueLinks(external), internal: uniqueStrings(internal) };
}

function createEntry({
  id,
  title,
  page,
  anchor = '',
  category,
  subcategory,
  synopsis,
  evidenceType,
  contentType,
  verdict = '',
  aliases = [],
  standaloneAliases = [],
  contextualAliases = [],
  phrases = [],
  dependencies = [],
  related = [],
  boundaryConditions = [],
  commonMisreadings = [],
  sourceLinks = [],
  pressureTests = [],
  internalHrefs = [],
  dependencyHrefs = [],
}) {
  return {
    id: cleanText(id),
    title: cleanMarkupText(title),
    page,
    anchor: cleanText(anchor).replace(/^#/, ''),
    category: cleanText(category),
    subcategory: cleanText(subcategory),
    synopsis: summarize(cleanMarkupText(synopsis)),
    evidenceType: cleanText(evidenceType),
    contentType: cleanText(contentType),
    // The page's own ruling label (Mythbuster badges). Recorded, never matched:
    // a verdict describes what the canon concluded, not what a source calls the
    // concept, so it must not reach the analyzer's alias/phrase match surface.
    verdict: cleanMarkupText(verdict),
    aliases: uniqueStrings([...aliasesForTitle(title), ...aliases]),
    // Alias TYPING. A single word is insufficient evidence by default; these
    // two lists are the curated exceptions and nothing else changes because of
    // them. `standaloneAliases` are high-specificity terms that mean the
    // concept wherever they appear. `contextualAliases` are ordinary words the
    // concept borrows, and they carry their own conditions - which is why they
    // are objects and standalone aliases are plain strings: being unconditional
    // is what makes an alias standalone.
    standaloneAliases: uniqueStrings(standaloneAliases.map(cleanMarkupText)),
    contextualAliases: normalizeContextualAliases(contextualAliases),
    phrases: uniqueStrings(phrases.map((phrase) => summarize(cleanMarkupText(phrase), 280))),
    dependencies: uniqueStrings(dependencies),
    related: uniqueStrings(related),
    boundaryConditions: uniqueStrings(boundaryConditions.map((item) => summarize(item, 360))),
    commonMisreadings: uniqueStrings(commonMisreadings.map((item) => summarize(item, 360))),
    sourceLinks: uniqueLinks(sourceLinks),
    pressureTests: uniqueStrings(pressureTests),
    _internalHrefs: uniqueStrings(internalHrefs),
    _dependencyHrefs: uniqueStrings(dependencyHrefs),
  };
}

function evidenceFromNode(node, fallback) {
  const candidates = all(node, (candidate) =>
    hasAnyClass(candidate, ['chart-tier', 'smv-tag', 'ev', 'claim-stamp']));
  const text = candidates.map((candidate) => nodeText(candidate)).join(' · ');
  const classes = new Set(candidates.flatMap((candidate) => [...classList(candidate)]));
  if (classes.has('t1') || /\bTier 1\b/i.test(text)) return 'Tier 1';
  if (classes.has('t2') || /\bTier 2\b/i.test(text)) return 'Tier 2';
  if (classes.has('t3') || /\bTier 3\b/i.test(text)) return 'Tier 3';
  if (classes.has('obs') || /\bObservation\b/i.test(text)) return 'Observation';
  if (classes.has('strat') || /\bStrategy\b/i.test(text)) return 'Strategy';
  if (classes.has('lens') || /\bLens\b/i.test(text)) return 'Lens';
  if (classes.has('rule') || /\bRule\b/i.test(text)) return 'Rule';
  if (classes.has('claim-stamp')) return 'Tested claim';
  return fallback;
}

function tocGroups(document) {
  const map = new Map();
  for (const group of allByClass(document, 'toc-group')) {
    const label = nodeText(byClass(group, 'toc-group-label')) || 'Reference';
    for (const anchor of directChildren(group, (node) => node.tag === 'a' && hasClass(node, 'toc-entry'))) {
      const href = anchor.attrs?.href || '';
      if (href.startsWith('#')) map.set(href.slice(1), label);
    }
  }
  return map;
}

function extractHierarchy(context) {
  const { page, document } = context;
  const entries = [];
  const pageSub = nodeText(byClass(document, 'page-sub'));
  const intro = nodeText(byClass(document, 'hierarchy-intro-flat'));
  entries.push(createEntry({
    id: 'hierarchy:overview',
    title: nodeText(byClass(document, 'page-title')),
    page,
    category: 'Love Hierarchy',
    subcategory: 'Orientation',
    synopsis: pageSub || intro,
    evidenceType: 'Framework',
    contentType: 'Hierarchy model',
    phrases: ['Primary factors', 'Secondary factors', 'Tertiary factors', 'Sequential gates'],
  }));

  for (const block of allByClass(document, 'hier-block')) {
    const labelNode = byClass(block, 'section-label');
    if (!labelNode) continue;
    const scopeTitle = nodeText(labelNode, new Set(['label-desc']));
    const scopeNote = nodeText(byClass(block, 'pyr-note'));
    const scopeId = `hierarchy:${slugify(scopeTitle)}`;
    const pyramid = byClass(block, 'pyramid-stage');
    const pyramidSummary = nodeText(pyramid);
    entries.push(createEntry({
      id: scopeId,
      title: scopeTitle,
      page,
      category: 'Love Hierarchy',
      subcategory: 'Perspective',
      synopsis: scopeNote || pyramidSummary,
      evidenceType: 'Framework',
      contentType: 'Hierarchy perspective',
      dependencies: ['hierarchy:overview'],
      phrases: allByClass(pyramid, 'pyramid-tier').map((tier) => nodeText(tier)),
    }));

    const seenFactorIds = new Set();
    for (const tier of allByClass(block, 'tier')) {
      const tierLabel = nodeText(byClass(tier, 'tier-badge')) || 'Tier';
      const rule = nodeText(byClass(tier, 'rule-box'));
      for (const factor of allByClass(tier, 'factor-card')) {
        const title = nodeText(byClass(factor, 'factor-name'));
        const synopsis = nodeText(byClass(factor, 'factor-sub'));
        if (!title || !synopsis) continue;
        let factorId = `${scopeId}:${slugify(tierLabel)}:${slugify(title)}`;
        let suffix = 2;
        while (seenFactorIds.has(factorId)) {
          factorId = `${scopeId}:${slugify(tierLabel)}:${slugify(title)}:${suffix}`;
          suffix += 1;
        }
        seenFactorIds.add(factorId);
        entries.push(createEntry({
          id: factorId,
          title,
          page,
          category: 'Love Hierarchy',
          subcategory: `${scopeTitle} · ${tierLabel}`,
          synopsis,
          evidenceType: 'Framework',
          contentType: 'Hierarchy factor',
          dependencies: [scopeId],
          boundaryConditions: rule ? [rule] : [],
        }));
      }
    }
  }
  return entries;
}

function extractSmvLevers(context) {
  const { page, source, document } = context;
  const entries = [];
  const overview = byClass(document, 'equation-panel');
  entries.push(createEntry({
    id: 'smv:overview',
    title: nodeText(byClass(document, 'page-title')),
    page,
    category: 'Five Levers',
    subcategory: 'Model',
    synopsis: nodeText(byClass(overview, 'eq-copy')) || nodeText(byClass(document, 'page-sub')),
    evidenceType: 'Model',
    contentType: 'SMV model',
    phrases: ['Looks + Money + Status + Charm + Exposure × Clock × Market × Context'],
    boundaryConditions: [nodeText(byClass(overview, 'eq-note'))],
  }));

  const factors = extractJsArray(source, 'const FACTORS');
  for (const factor of factors) {
    const factorId = `smv:${slugify(factor.key || factor.name)}`;
    entries.push(createEntry({
      id: factorId,
      title: factor.name,
      page,
      category: 'Five Levers',
      subcategory: 'Movable factors',
      synopsis: factor.def,
      evidenceType: 'Model',
      contentType: 'SMV lever',
      dependencies: ['smv:overview'],
      phrases: [factor.tagline, factor.lever],
      boundaryConditions: [factor.fixed],
      commonMisreadings: [factor.curdle],
    }));
    for (const [name, description] of factor.subs || []) {
      entries.push(createEntry({
        id: `${factorId}:${slugify(name)}`,
        title: name,
        page,
        category: 'Five Levers',
        subcategory: `${factor.name} · subvariables`,
        synopsis: description,
        evidenceType: 'Model',
        contentType: 'SMV subvariable',
        dependencies: [factorId],
      }));
    }
  }

  for (const card of allByClass(document, 'mult-card')) {
    const title = nodeText(byClass(card, 'mult-name'));
    const links = linkData(card);
    const legacy = nodeText(first(card, (node) => hasClass(node, 'ev')));
    const evidence = legacy === 'Solid' ? 'Tier 1' : legacy === 'Mixed' ? 'Tier 2' : 'Model';
    entries.push(createEntry({
      id: `smv:multiplier:${slugify(title.replace(/^The\s+/i, ''))}`,
      title,
      page,
      category: 'Five Levers',
      subcategory: 'Multipliers',
      synopsis: nodeText(byClass(card, 'mult-text')),
      evidenceType: evidence,
      contentType: 'SMV multiplier',
      dependencies: ['smv:overview'],
      phrases: [nodeText(byClass(card, 'mult-tag'))],
      boundaryConditions: [nodeText(byClass(card, 'mult-caveat'))],
      sourceLinks: links.external,
      internalHrefs: links.internal,
    }));
  }
  return entries;
}

function extractFrameworks(context) {
  const { page, document } = context;
  const entries = [];
  const extractedAnchors = new Set();
  const groups = tocGroups(document);

  for (const block of allByClass(document, 'rf-entry')) {
    const anchor = block.attrs?.id;
    const title = nodeText(byClass(block, 'rf-title'));
    if (!anchor || !title) continue;
    extractedAnchors.add(anchor);
    const links = linkData(block);
    const subcategory = groups.get(anchor) || 'Framework';
    const isTested = subcategory === 'Tested claims' || Boolean(byClass(block, 'claim-stamp'));
    entries.push(createEntry({
      id: `frameworks:${anchor}`,
      title,
      page,
      anchor,
      category: 'Rules & Frameworks',
      subcategory,
      synopsis: nodeText(byClass(block, 'rf-sub')),
      evidenceType: isTested ? 'Tested claim' : evidenceFromNode(byClass(block, 'rf-sub') || block, 'Framework'),
      contentType: isTested ? 'Tested claim' : /rule|gate/i.test(subcategory) ? 'Rule' : 'Framework',
      sourceLinks: links.external,
      internalHrefs: links.internal,
    }));

    const subheads = directChildren(block, (node) => hasClass(node, 'smv-sub') && Boolean(node.attrs?.id));
    for (const subhead of subheads) {
      const subAnchor = subhead.attrs.id;
      extractedAnchors.add(subAnchor);
      const segment = nodesFrom(block, subhead, (node) => hasClass(node, 'smv-sub'));
      const segmentLinks = linkData(segment);
      const stamp = byClass(segment, 'claim-stamp');
      entries.push(createEntry({
        id: `frameworks:${subAnchor}`,
        title: nodeText(byClass(subhead, 'smv-sub-title')),
        page,
        anchor: subAnchor,
        category: 'Rules & Frameworks',
        subcategory: groups.get(subAnchor) || 'SMV Matching',
        synopsis: nodeText(byClass(subhead, 'smv-sub-note')),
        evidenceType: stamp ? 'Tested claim' : evidenceFromNode(segment, 'Model'),
        contentType: stamp ? 'Tested claim' : 'Framework component',
        dependencies: [`frameworks:${anchor}`],
        sourceLinks: segmentLinks.external,
        internalHrefs: segmentLinks.internal,
        phrases: stamp ? [nodeText(byClass(stamp, 'stamp-line'))] : [],
      }));
    }
  }

  // Maps and lifecycle continuations can remain first-class canon concepts
  // without being presented as top-level framework entries on the page.
  for (const block of allByClass(document, 'smv-sub')) {
    const anchor = block.attrs?.id;
    const parent = block.attrs?.['data-parent'];
    if (!anchor || !parent || extractedAnchors.has(anchor)) continue;
    const title = nodeText(byClass(block, 'smv-sub-title'));
    if (!title) continue;
    const links = linkData(block);
    entries.push(createEntry({
      id: `frameworks:${anchor}`,
      title,
      page,
      anchor,
      category: 'Rules & Frameworks',
      subcategory: groups.get(anchor) || 'Framework component',
      synopsis: nodeText(byClass(block, 'smv-sub-note')),
      evidenceType: evidenceFromNode(block, 'Framework'),
      contentType: block.attrs?.['data-content-type'] || 'Framework component',
      dependencies: parent ? [`frameworks:${parent}`] : [],
      sourceLinks: links.external,
      internalHrefs: links.internal,
    }));
  }

  return entries;
}

function extractGenderDynamics(context) {
  const { page, document } = context;
  const entries = [];
  const tabNames = {
    'page-male': 'Male',
    'page-fem': 'Female',
    'page-both': 'Both Sides',
  };
  const used = new Set();

  for (const tab of allByClass(document, 'dyn-page')) {
    const tabId = tab.attrs?.id;
    const tabName = tabNames[tabId] || cleanText(tabId || 'Gender Dynamics');
    let section = 'Orientation';
    for (const child of tab.children || []) {
      if (child.tag === '#text') continue;
      if (hasClass(child, 'dos-section')) {
        section = nodeText(child) || section;
        continue;
      }
      if (!hasClass(child, 'dos-card')) continue;
      const label = byClass(child, 'dos-head-label');
      const title = nodeText(label, new Set(['chart-tier']));
      const body = byClass(child, 'dos-body');
      const synopsis = nodeText(byTag(body, 'p')) || nodeText(body);
      if (!title || !synopsis) continue;
      const cardAnchor = child.attrs?.id || '';
      let id = cardAnchor
        ? `gender-dynamics:${cardAnchor}`
        : `gender-dynamics:${slugify(tabName)}:${slugify(section)}:${slugify(title)}`;
      let suffix = 2;
      while (used.has(id)) {
        id = `${id}:${suffix}`;
        suffix += 1;
      }
      used.add(id);
      const links = linkData(child);
      entries.push(createEntry({
        id,
        title,
        page,
        anchor: cardAnchor || tabId,
        category: 'Gender Dynamics',
        subcategory: `${tabName} · ${section}`,
        synopsis,
        evidenceType: evidenceFromNode(child, 'Observation'),
        contentType: 'Gender Dynamics card',
        sourceLinks: links.external,
        internalHrefs: links.internal,
      }));
    }
  }
  return entries;
}

function extractStatistics(context) {
  const { page, document } = context;
  const entries = [];
  const groups = tocGroups(document);
  for (const chart of allByClass(document, 'chart-card')) {
    const anchor = chart.attrs?.id;
    const title = nodeText(byClass(chart, 'chart-title'));
    if (!anchor || !title) continue;
    const links = linkData(chart);
    entries.push(createEntry({
      id: `statistics:${anchor}`,
      title,
      page,
      anchor,
      category: 'Statistics',
      subcategory: groups.get(anchor) || 'Evidence chart',
      synopsis: nodeText(byClass(chart, 'chart-note')) || nodeText(byClass(chart, 'chart-q')),
      evidenceType: evidenceFromNode(chart, 'Tier 3'),
      contentType: 'Statistical chart',
      phrases: [nodeText(byClass(chart, 'chart-q'))],
      boundaryConditions: [nodeText(byClass(chart, 'chart-method'))],
      sourceLinks: links.external,
      internalHrefs: links.internal,
    }));
  }
  return entries;
}

function extractMythbuster(context) {
  const { page, dataSources } = context;
  const source = dataSources.get('js/mythbuster.js');
  const docket = extractJsArray(source, 'const ENTRIES');
  const tierMap = {
    'hard-data': 'Hard data',
    evidence: 'Evidence-based',
    definitional: 'Definitional',
  };
  return docket.map((item) => {
    // Two early single-claim mockup entries predate the question field. Their
    // sole claim is the public card title in the renderer.
    const title = item.question || item.claims?.[0]?.text;
    const relatedHrefs = (item.related || []).map((relation) => relation.href).filter(Boolean);
    const misreadings = (item.claims || [])
      .filter((claim) => claim.verdict && claim.verdict !== 'confirmed')
      .map((claim) => `${claim.verdict}: ${claim.text}`);
    return createEntry({
      id: item.id,
      title,
      page,
      anchor: item.id,
      category: 'Mythbuster',
      subcategory: item.category || 'Ruling',
      synopsis: item.ruling?.text,
      evidenceType: tierMap[item.ruling?.tier] || 'Evidence-based',
      contentType: 'Mythbuster ruling',
      verdict: item.ruling?.badge,
      phrases: (item.claims || []).map((claim) => claim.text),
      boundaryConditions: item.ruling?.researchNotes ? [item.ruling.researchNotes] : [],
      commonMisreadings: misreadings,
      sourceLinks: item.ruling?.sources || [],
      internalHrefs: relatedHrefs,
    });
  });
}

function pillMetadata(node) {
  const boundaryConditions = [];
  const commonMisreadings = [];
  for (const split of allByClass(node, 'split-card')) {
    const label = nodeText(byClass(split, 'split-label'));
    const statement = `${nodeText(byClass(split, 'split-title'))}: ${nodeText(byClass(split, 'split-copy'))}`;
    if (/discard/i.test(label)) commonMisreadings.push(statement);
  }
  const note = nodeText(byClass(node, 'dossier-note'));
  if (note) boundaryConditions.push(note);
  return { boundaryConditions, commonMisreadings };
}

function extractPills(context) {
  const { page, document } = context;
  const entries = [];
  const labels = { 'page-blk': 'Black Pill', 'page-rp': 'Red Pill', 'page-bp': 'Blue Pill' };
  for (const pillPage of allByClass(document, 'pill-page')) {
    const anchor = pillPage.attrs?.id;
    if (!anchor) continue;
    const label = labels[anchor] || anchor;
    const feature = first(pillPage, (node) => hasClass(node, 'dossier-card') && hasClass(node, 'feature'));
    if (feature) {
      const links = linkData(feature.parent || feature);
      const metadata = pillMetadata(feature.parent || feature);
      entries.push(createEntry({
        id: `pills:${anchor}`,
        title: nodeText(byClass(feature, 'pill-heading')),
        page,
        anchor,
        category: 'Pill Dossiers',
        subcategory: label,
        synopsis: nodeText(byClass(feature, 'pill-summary')),
        evidenceType: 'Lens',
        contentType: 'Pill dossier',
        ...metadata,
        sourceLinks: links.external,
        internalHrefs: links.internal,
      }));
    }

    for (const article of all(pillPage, (node) =>
      node.tag === 'article' && hasClass(node, 'dossier-card') && Boolean(node.attrs?.id))) {
      const title = nodeText(byClass(article, 'pill-heading'));
      if (!title) continue;
      const links = linkData(article);
      entries.push(createEntry({
        id: `pills:${article.attrs.id}`,
        title,
        page,
        anchor: article.attrs.id,
        category: 'Pill Dossiers',
        subcategory: label,
        synopsis: nodeText(byClass(article, 'pill-summary')),
        evidenceType: 'Lens',
        contentType: 'Pill case study',
        dependencies: [`pills:${anchor}`],
        ...pillMetadata(article),
        sourceLinks: links.external,
        internalHrefs: links.internal,
      }));
    }

    for (const wildcard of allByClass(pillPage, 'wildcard-card')) {
      const title = nodeText(byClass(wildcard, 'synthesis-title'));
      if (!title) continue;
      const links = linkData(wildcard);
      entries.push(createEntry({
        id: `pills:${slugify(title)}`,
        title,
        page,
        anchor,
        category: 'Pill Dossiers',
        subcategory: `${label} · wildcard`,
        synopsis: nodeText(byClass(wildcard, 'synthesis-copy')),
        evidenceType: 'Lens',
        contentType: 'Pill mechanic',
        dependencies: [`pills:${anchor}`],
        boundaryConditions: [nodeText(byClass(wildcard, 'dossier-note'))],
        sourceLinks: links.external,
        internalHrefs: links.internal,
      }));
    }

    for (const term of allByClass(pillPage, 'term-card')) {
      const title = nodeText(byClass(term, 'term-name'));
      if (!title) continue;
      entries.push(createEntry({
        id: `pills:${anchor}:${slugify(title)}`,
        title,
        page,
        anchor,
        category: 'Pill Dossiers',
        subcategory: `${label} · concepts`,
        synopsis: nodeText(byClass(term, 'term-copy')),
        evidenceType: 'Lens',
        contentType: 'Pill concept',
        dependencies: [`pills:${anchor}`],
      }));
    }
  }
  return entries;
}

function extractLexicon(context) {
  const { page, source } = context;
  const lexicon = extractJsArray(source, 'const LEX');
  const labelMap = { shared: 'Shared', black: 'Black Pill', red: 'Red Pill', blue: 'Blue Pill' };
  return lexicon.map(([rawTitle, lens, definition, href]) => {
    const title = cleanMarkupText(rawTitle);
    return createEntry({
      id: `lexicon:${lexSlug(rawTitle)}`,
      title,
      page,
      anchor: lexSlug(rawTitle),
      category: 'Lexicon',
      subcategory: labelMap[lens] || lens,
      synopsis: definition,
      evidenceType: 'Glossary',
      contentType: 'Definition',
      aliases: aliasesForTitle(title),
      dependencyHrefs: href ? [href] : [],
    });
  });
}

function extractDeepDiveHub(context) {
  const { page, document } = context;
  return allByClass(document, 'dd-feature').map((feature) => {
    const title = nodeText(byClass(feature, 'dd-feature-title'));
    const links = linkData(feature);
    const kicker = nodeText(byClass(feature, 'dd-feature-kicker'));
    return createEntry({
      id: `deep-dive:hub:${slugify(title)}`,
      title,
      page,
      category: 'Deep Dives',
      subcategory: kicker.replace(/^Essay\s+\d+\s*·\s*/i, '') || 'Essay',
      synopsis: nodeText(byClass(feature, 'dd-feature-hook')),
      evidenceType: 'Long-form synthesis',
      contentType: 'Essay guide',
      dependencyHrefs: links.internal,
    });
  });
}

function deepDiveEvidence(section) {
  const hasRecord = Boolean(first(section, (node) => hasClass(node, 'dd-callout') && hasClass(node, 'record')));
  const hasFramework = Boolean(first(section, (node) => hasClass(node, 'dd-callout') && hasClass(node, 'framework')));
  if (hasRecord && hasFramework) return 'Record + framework';
  if (hasRecord) return 'Record';
  if (hasFramework) return 'LE framework';
  return 'Long-form synthesis';
}

function extractDeepDiveEssay(context) {
  const { page, document } = context;
  const entries = [];
  const title = nodeText(byClass(document, 'dd-essay-title'));
  const rootId = `deep-dive:${slugify(path.basename(page, '.html').replace(/^dd-/, ''))}`;
  const metaDescription = first(document, (node) => node.tag === 'meta' && node.attrs?.name === 'description')?.attrs?.content;
  const related = byClass(document, 'dd-related');
  const relatedLinks = related ? linkData(related) : { external: [], internal: [] };
  entries.push(createEntry({
    id: rootId,
    title,
    page,
    category: 'Deep Dives',
    subcategory: 'Essay',
    synopsis: metaDescription || nodeText(byClass(document, 'dd-standfirst')),
    evidenceType: 'Long-form synthesis',
    contentType: 'Essay',
    sourceLinks: relatedLinks.external,
    internalHrefs: relatedLinks.internal,
  }));

  for (const section of allByClass(document, 'dd-section')) {
    const anchor = section.attrs?.id;
    const heading = byClass(section, 'dd-h2');
    if (!anchor || !heading) continue;
    const sectionLinks = linkData(section);
    const paragraphs = allByTag(section, 'p').filter((node) => !hasClass(node, 'dd-pullquote'));
    entries.push(createEntry({
      id: `${rootId}:${anchor}`,
      title: nodeText(heading, new Set(['dd-anchor'])),
      page,
      anchor,
      category: 'Deep Dives',
      subcategory: title,
      synopsis: nodeText(paragraphs[0]) || nodeText(section),
      evidenceType: deepDiveEvidence(section),
      contentType: 'Essay section',
      dependencies: [rootId],
      sourceLinks: sectionLinks.external,
      internalHrefs: sectionLinks.internal,
    }));
  }
  return entries;
}

function extractInstrument(context) {
  const { page, document } = context;
  const title = nodeText(byClass(document, 'page-title')) || cleanText(byTag(document, 'title'));
  const links = linkData(byClass(document, 'page-header') || document);
  return [createEntry({
    id: `instrument:${slugify(title)}`,
    title,
    page,
    category: 'Instruments',
    subcategory: title,
    synopsis: nodeText(byClass(document, 'page-sub')),
    evidenceType: 'Instrument',
    contentType: 'On-device instrument',
    sourceLinks: links.external,
    internalHrefs: links.internal,
  })];
}

/**
 * Extract a plain array literal from canonical inline JavaScript without
 * executing the page. The scanner skips quoted strings and comments, then the
 * isolated literal is evaluated in an empty VM context.
 */
export function extractJsArray(source, marker) {
  const markerAt = String(source).indexOf(marker);
  if (markerAt < 0) throw new Error(`Cannot find JavaScript data marker: ${marker}`);
  const equalsAt = String(source).indexOf('=', markerAt + marker.length);
  const start = String(source).indexOf('[', equalsAt);
  if (equalsAt < 0 || start < 0) throw new Error(`Cannot find array literal after: ${marker}`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let end = -1;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`Unclosed array literal after: ${marker}`);
  const literal = source.slice(start, end);
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 2_000 });
}

function normalizeHref(fromPage, href) {
  const raw = cleanText(href);
  if (!raw || /^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(raw)) return null;
  const [pathPartRaw, fragmentRaw = ''] = raw.split('#', 2);
  const pathPart = pathPartRaw.split('?')[0];
  const targetPage = pathPart
    ? path.posix.normalize(path.posix.join(path.posix.dirname(fromPage), pathPart.replace(/\\/g, '/')))
    : fromPage;
  if (!targetPage.endsWith('.html')) return null;
  let fragment = fragmentRaw;
  try {
    fragment = decodeURIComponent(fragmentRaw);
  } catch {
    fragment = fragmentRaw;
  }
  return { page: targetPage.replace(/^\.\//, ''), anchor: fragment };
}

function relationTarget(entries, target) {
  if (!target) return null;
  if (target.anchor) {
    return entries.find((entry) => entry.page === target.page && entry.anchor === target.anchor)?.id || null;
  }
  const roots = entries.filter((entry) => entry.page === target.page && !entry.anchor);
  if (!roots.length) return null;
  const preferred = roots.find((entry) =>
    /model|essay|instrument|dossier/i.test(entry.contentType) && !/guide|factor|component/i.test(entry.contentType));
  return (preferred || roots[0]).id;
}

function resolveSourceRelations(entries) {
  for (const entry of entries) {
    for (const href of entry._dependencyHrefs) {
      const target = relationTarget(entries, normalizeHref(entry.page, href));
      if (target && target !== entry.id) entry.dependencies.push(target);
    }
    for (const href of entry._internalHrefs) {
      const target = relationTarget(entries, normalizeHref(entry.page, href));
      if (target && target !== entry.id) entry.related.push(target);
    }
    entry.dependencies = uniqueStrings(entry.dependencies).filter((id) => id !== entry.id);
    entry.related = uniqueStrings(entry.related).filter((id) => id !== entry.id && !entry.dependencies.includes(id));
  }
}

async function readOverlay() {
  const source = await fs.readFile(OVERLAY_PATH, 'utf8');
  const overlay = JSON.parse(source);
  if (overlay.schemaVersion !== OVERLAY_SCHEMA_VERSION || !overlay.entries || typeof overlay.entries !== 'object') {
    throw new Error(`Overlay must use ${OVERLAY_SCHEMA_VERSION} and contain an entries object.`);
  }
  return overlay;
}

const OVERLAY_ARRAY_FIELDS = new Set([
  'aliases',
  'standaloneAliases',
  'contextualAliases',
  'phrases',
  'dependencies',
  'related',
  'boundaryConditions',
  'commonMisreadings',
  'sourceLinks',
  'pressureTests',
]);

function applyOverlay(entries, overlay) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  for (const [id, patch] of Object.entries(overlay.entries)) {
    const entry = byId.get(id);
    if (!entry) throw new Error(`Overlay targets missing canon entry: ${id}`);
    for (const [field, values] of Object.entries(patch)) {
      if (!OVERLAY_ARRAY_FIELDS.has(field) || !Array.isArray(values)) {
        throw new Error(`Overlay ${id}.${field} must be one of the supported array fields.`);
      }
      if (field === 'sourceLinks') {
        entry[field] = uniqueLinks([...entry[field], ...values]);
      } else if (field === 'contextualAliases') {
        entry[field] = normalizeContextualAliases([...entry[field], ...values]);
      } else {
        entry[field] = uniqueStrings([...entry[field], ...values]);
      }
    }
  }
}

function finalEntry(entry) {
  const {
    _internalHrefs,
    _dependencyHrefs,
    ...publicEntry
  } = entry;
  return publicEntry;
}

function countBy(entries, field) {
  const counts = {};
  for (const entry of entries) counts[entry[field]] = (counts[entry[field]] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Typing is a statement ABOUT the match surface, so it can only name strings
 * that are on it. A typed alias that is not an alias is a curation slip that
 * would otherwise do nothing at all, silently — the worst kind.
 */
/*
 * Typing only reaches SINGLE-TOKEN aliases. The analyzer's promotion loop
 * iterates `_singleTokenAliases`, which is the alias list filtered to entries
 * with no space in them, so a multiword alias typed standalone or contextual is
 * never consulted — it does nothing, forever, and looks in the source exactly
 * like a rule that works.
 *
 * That is the same failure the existence check above catches, one level in:
 * a typed alias that is not an alias, and a typed alias the typing cannot
 * reach, are both curation that silently does nothing. Multiword aliases are
 * not a problem; they already earn phrase treatment on their own length. The
 * error is claiming to type one.
 */
function assertSingleToken(entry, alias, kind) {
  if (/\s/.test(alias.trim())) {
    throw new Error(`${entry.id} types "${alias}" ${kind}, but typing only applies to single-token aliases — the analyzer's promotion pass never sees a multiword one, so this rule would be inert. Multiword aliases already match as phrases; drop the typing.`);
  }
}

function assertAliasTyping(entry) {
  const aliases = new Set(entry.aliases);
  const typed = new Set();
  for (const alias of entry.standaloneAliases) {
    if (!aliases.has(alias)) throw new Error(`${entry.id} types "${alias}" standalone but it is not one of its aliases`);
    assertSingleToken(entry, alias, 'standalone');
    typed.add(alias);
  }
  for (const { alias, notAfter } of entry.contextualAliases) {
    if (!aliases.has(alias)) throw new Error(`${entry.id} types "${alias}" contextual but it is not one of its aliases`);
    assertSingleToken(entry, alias, 'contextual');
    if (typed.has(alias)) throw new Error(`${entry.id} types "${alias}" both standalone and contextual`);
    typed.add(alias);
    for (const modifier of notAfter) {
      if (!modifier.trim()) throw new Error(`${entry.id} gives "${alias}" a blank notAfter modifier`);
    }
  }
}

function assertRelations(entries) {
  const ids = new Set(entries.map((entry) => entry.id));
  for (const entry of entries) {
    if (!EVIDENCE_TYPES.has(entry.evidenceType)) {
      throw new Error(`Unsupported evidenceType "${entry.evidenceType}" on ${entry.id}`);
    }
    assertAliasTyping(entry);
    for (const relation of [...entry.dependencies, ...entry.related]) {
      if (!ids.has(relation)) throw new Error(`Invalid relation ${entry.id} -> ${relation}`);
    }
  }
}

async function loadContexts() {
  const contexts = [];
  for (const spec of SOURCE_SPECS) {
    const source = await fs.readFile(path.join(ROOT_DIR, spec.page), 'utf8');
    const dataSources = new Map();
    for (const file of spec.dataFiles || []) {
      dataSources.set(file, await fs.readFile(path.join(ROOT_DIR, file), 'utf8'));
    }
    contexts.push({
      ...spec,
      source,
      document: parseHtml(source),
      dataSources,
    });
  }
  return contexts;
}

export async function buildCanonIndex(options = {}) {
  const contexts = await loadContexts();
  const extracted = [];
  const pageEntries = new Map();

  for (const context of contexts) {
    const entries = context.extractor(context);
    pageEntries.set(context.page, entries);
    extracted.push(...entries);
  }

  const duplicateIds = extracted
    .map((entry) => entry.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);
  if (duplicateIds.length) throw new Error(`Duplicate generated canon IDs: ${[...new Set(duplicateIds)].join(', ')}`);

  resolveSourceRelations(extracted);
  applyOverlay(extracted, await readOverlay());
  for (const entry of extracted) {
    entry.dependencies = uniqueStrings(entry.dependencies).filter((id) => id !== entry.id);
    entry.related = uniqueStrings(entry.related).filter((id) => id !== entry.id && !entry.dependencies.includes(id));
  }
  assertRelations(extracted);

  const entries = extracted.map(finalEntry);
  const sourcePages = contexts.map((context) => {
    const inputs = [context.page, ...(context.dataFiles || [])];
    const combined = inputs.map((file) =>
      file === context.page ? context.source : context.dataSources.get(file)).join('\n').replace(/\r\n?/g, '\n');
    const title = nodeText(byClass(context.document, 'page-title'))
      || nodeText(byClass(context.document, 'dd-essay-title'))
      || nodeText(byTag(context.document, 'title'));
    return {
      page: context.page,
      title,
      category: context.category,
      sourceType: context.sourceType,
      inputs,
      sha256: sha256(combined),
      conceptCount: pageEntries.get(context.page)?.length || 0,
    };
  });

  const contentHash = sha256(JSON.stringify({
    sources: sourcePages.map(({ page, sha256: hash }) => [page, hash]),
    entries,
  }));
  const stats = {
    conceptCount: entries.length,
    sourceCount: sourcePages.length,
    byCategory: countBy(entries, 'category'),
    byEvidenceType: countBy(entries, 'evidenceType'),
    anchoredConceptCount: entries.filter((entry) => entry.anchor).length,
    conceptsWithExternalSources: entries.filter((entry) => entry.sourceLinks.length).length,
    dependencyCount: entries.reduce((sum, entry) => sum + entry.dependencies.length, 0),
    relatedCount: entries.reduce((sum, entry) => sum + entry.related.length, 0),
  };
  const index = {
    schemaVersion: INDEX_SCHEMA_VERSION,
    indexVersion: `1.0.0+${contentHash.slice(0, 12)}`,
    generatedAt: options.generatedAt
      || process.env.CANON_GENERATED_AT
      || sourceStateTimestamp([...new Set(sourcePages.flatMap((page) => page.inputs))]),
    sourcePages,
    stats,
    entries,
  };
  return index;
}

/**
 * When the doctrine this artifact was built from last changed.
 *
 * It used to be `new Date()`, which made the built file's SHA-256 different on
 * every run even when its CONTENT was byte-identical — v2.5.0 §6 had to note
 * that `md/RERUN.md` treats SHA-256 as the reproducibility anchor and that for
 * this one file that was not quite true, and v2.5.0 §7.6 left it open. It is
 * now the last commit that touched a canon SOURCE PAGE.
 *
 * The source pages and nothing else, deliberately. Including this builder reads
 * as more complete — a change to the extraction logic does change the artifact
 * — and it is self-invalidating: committing a builder change moves the answer,
 * so the index built in that same commit is stale the moment it lands, and the
 * staleness check fails on a tree nobody touched. `indexVersion` is a hash of
 * the built content and already moves when extraction changes, which is the
 * right instrument for that question. This field answers a narrower one: when
 * did the doctrine this index reflects last change.
 *
 * It THROWS rather than falling back to a wall clock. A silent fallback is the
 * exact defect being fixed — it would restore an irreproducible hash while the
 * file went on looking reproducible. Callers outside a git checkout pass
 * `generatedAt` or set `CANON_GENERATED_AT`, which is also how a re-run
 * reproduces an archived artifact exactly.
 */
function sourceStateTimestamp(paths) {
  let stamp;
  try {
    stamp = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', ...paths],
      { cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
  } catch (error) {
    throw new Error(
      'Could not read the canon sources\' git state, and this build will not invent a timestamp: '
      + 'a wall-clock stamp makes the artifact\'s SHA-256 differ between byte-identical builds. '
      + 'Pass generatedAt or set CANON_GENERATED_AT.',
    );
  }
  if (!stamp) {
    throw new Error(
      'No commit touches the canon sources, so there is no source state to date this build from. '
      + 'Pass generatedAt or set CANON_GENERATED_AT.',
    );
  }
  // Normalized to the same shape the wall-clock stamp had, so nothing reading
  // this field has to learn a second format.
  return new Date(stamp).toISOString();
}

export async function knownAnchors() {
  const contexts = await loadContexts();
  const result = new Map();
  const duplicates = new Map();
  for (const context of contexts) {
    const counts = new Map();
    for (const node of all(context.document, (candidate) => Boolean(candidate.attrs?.id))) {
      counts.set(node.attrs.id, (counts.get(node.attrs.id) || 0) + 1);
    }
    if (context.page === 'lexicon.html') {
      for (const [rawTitle] of extractJsArray(context.source, 'const LEX')) {
        const id = lexSlug(rawTitle);
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    }
    if (context.page === 'mythbuster.html') {
      const js = context.dataSources.get('js/mythbuster.js');
      for (const item of extractJsArray(js, 'const ENTRIES')) {
        counts.set(item.id, (counts.get(item.id) || 0) + 1);
      }
    }
    result.set(context.page, new Set(counts.keys()));
    duplicates.set(context.page, [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id));
  }
  return { anchors: result, duplicates };
}

async function main() {
  const index = await buildCanonIndex();
  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await fs.writeFile(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `Built ${path.relative(ROOT_DIR, INDEX_PATH)}: ${index.stats.conceptCount} concepts across `
    + `${index.stats.sourceCount} source pages (${index.indexVersion}).\n`,
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
