import fs from 'node:fs';
import vm from 'node:vm';

export const html = fs.readFileSync(new URL('../../face.html', import.meta.url), 'utf8');
export const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const qualityContext=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../../js/face-quality.js', import.meta.url),'utf8'),qualityContext);
export const quality=qualityContext.FaceQuality;

export function loadCore() {
  const source = scripts.find(s => s.includes('const IDX ='));
  if (!source?.includes('module.exports')) throw new Error('Face core not found');
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(source, context, { filename: 'face.html:core' });
  return context.module.exports;
}

// Execute actual page functions, never a port of their behavior.
export function pageFunction(name, globals = {}) {
  const source = scripts.find(s => s.includes(`function ${name}(`));
  if (!source) throw new Error(`Missing function ${name}`);
  const start = source.indexOf(`function ${name}(`);
  // Function bodies in this page close at their four-space declaration indent.
  const end = source.indexOf('\n    }', start);
  if (end < 0) throw new Error(`Cannot extract ${name}`);
  return vm.runInNewContext(`(${source.slice(start, end + 6)})`, {FaceQuality:quality,...globals});
}
