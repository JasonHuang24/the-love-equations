/*
 * Rebuild data/canon-overlay.json's tail from HEAD's copy plus a misreading
 * batch, so the 450 existing entries stay byte-identical and the diff is a pure
 * addition. Rebuilding from HEAD rather than from the working file makes the
 * script idempotent — re-running it cannot stack two copies of the batch.
 *
 * Usage: node apply-overlay.mjs <repo-root> <mis.json> [skip-id ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [root, misPath, ...skip] = process.argv.slice(2);
const target = path.join(root, 'data/canon-overlay.json');
const orig = execFileSync('git', ['show', 'HEAD:data/canon-overlay.json'], {
  cwd: root, encoding: 'utf8', maxBuffer: 1e9,
});
const mis = JSON.parse(fs.readFileSync(misPath, 'utf8'));
for (const id of skip) delete mis[id];

const nl = orig.includes('\r\n') ? '\r\n' : '\n';
const anchor = `${nl}  }${nl}}${nl}`;
if (!orig.endsWith(anchor)) throw new Error('tail anchor not found in HEAD copy — refusing');

for (const id of Object.keys(mis)) {
  if (orig.includes(`"${id}": {`)) throw new Error(`${id} already present in HEAD overlay — refusing`);
}

const body = Object.entries(mis).map(([id, text]) => [
  `    ${JSON.stringify(id)}: {`,
  '      "commonMisreadings": [',
  `        ${JSON.stringify(text)}`,
  '      ]',
  '    }',
].join(nl)).join(`,${nl}`);

const out = `${orig.slice(0, orig.length - anchor.length)},${nl}${body}${anchor}`;
JSON.parse(out);
fs.writeFileSync(target, out);
const parsed = JSON.parse(out);
console.log(`overlay entries ${Object.keys(parsed.entries).length} · added ${Object.keys(mis).length} · skipped ${skip.length}`);
