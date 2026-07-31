/*
 * Contract check for a misreading batch, run through the SHIPPED analyzer.
 *
 * The four rules that can be checked mechanically (md/lab-overlay-tranche3.md):
 *   length 10-18 words · no MISREADING_DENIAL_CUES · no artifact meta-language ·
 *   at most 4 shared 5+-letter words with the entry's own synopsis
 * plus the one that actually decides whether it can ever fire: the sentence has
 * to form a claim unit AND clear the domain gate on its own. That is the test
 * most first drafts die on, so it is run through the real engine rather than a
 * regex replica of it.
 *
 * Usage: node check-mis.mjs <worktree-root> <mis.json>
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [root, misPath] = process.argv.slice(2);
const analyzer = await import(pathToFileURL(path.join(root, 'js/lab-analyzer.js')).href);
const build = await import(pathToFileURL(path.join(root, 'scripts/build-canon-index.mjs')).href);
const { analyzerInternals, prepareCanonIndex, detectClaimUnits, classifyDomainRelevance, canonAdmissionSurfaces } = analyzer;
const { normalizeText } = analyzerInternals;

const mis = JSON.parse(fs.readFileSync(misPath, 'utf8'));
const index = process.env.INDEX_FILE ? JSON.parse(fs.readFileSync(process.env.INDEX_FILE,'utf8')) : await build.buildCanonIndex();
const prepared = prepareCanonIndex(index);
const surfaces = canonAdmissionSurfaces(prepared);
const byId = new Map(index.entries.map((e) => [e.id, e]));

const DENIAL = /\b(?:not|never|no|none|false|untrue|myth|mistaken|wrong|isn't|aren't|wasn't|weren't|doesn't|don't|didn't|cannot|can't|won't|nonsense|rarely|hardly)\b/i;
const META = /\b(?:claim|card|essay|page|section|entry|hub)\b/i;
const TRAP = /\b(?:married|marries|chosen|dates)\b/i;

let bad = 0;
for (const [id, text] of Object.entries(mis)) {
  const problems = [];
  const words = text.trim().split(/\s+/u).length;
  if (words < 10 || words > 18) problems.push(`length ${words}`);
  const denial = text.match(DENIAL);
  if (denial) problems.push(`negator "${denial[0]}"`);
  const meta = text.match(META);
  if (meta) problems.push(`meta-language "${meta[0]}"`);
  const trap = text.match(TRAP);
  if (trap) problems.push(`morphology trap "${trap[0]}"`);

  const entry = byId.get(id);
  if (!entry) problems.push('NO SUCH ENTRY');
  else {
    const big = (s) => new Set((s || '').toLowerCase().match(/[a-z]{5,}/g) || []);
    const shared = [...big(text)].filter((w) => big(entry.synopsis).has(w));
    if (shared.length > 4) problems.push(`synopsis reuse ${shared.length}: ${shared.join(',')}`);
  }

  // The gate: does it form a claim unit at all, and does it survive triage?
  const doc = { segments: [{ id: 'probe', text: normalizeText(text) }] };
  const units = detectClaimUnits(doc);
  const classified = classifyDomainRelevance(units, new Map(), surfaces);
  const claimLike = classified.filter((u) => u.isClaimLike);
  if (!claimLike.length) problems.push('NO CLAIM UNIT — cannot fire in either direction');
  else {
    const kept = claimLike.filter((u) => u.domainRelevance.status !== 'irrelevant');
    if (!kept.length) problems.push(`GATE SET ASIDE (${claimLike[0].domainRelevance.status}/${claimLike[0].domainRelevance.reason || '?'})`);
  }

  if (problems.length) { bad += 1; console.log(`FAIL ${id}\n  ${text}\n  -> ${problems.join(' · ')}`); }
  else console.log(`ok   ${id} (${words}w)`);
}
console.log(`\n${Object.keys(mis).length - bad} pass · ${bad} fail`);
process.exit(bad ? 1 : 0);
