import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=async relative=>JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');

async function checkBinding(report){
  assert.equal(report.artifactBinding.algorithm,'sha256');
  for(const item of report.artifactBinding.files){
    const bytes=await fs.readFile(path.join(root,item.path));
    assert.equal(bytes.length,item.bytes,`${item.path} byte binding`);
    assert.equal(sha256(bytes),item.sha256,`${item.path} hash binding`);
  }
}
function checkReproducibility(report){
  const normalized=JSON.parse(JSON.stringify(report));
  delete normalized.generatedAt;delete normalized.reproducibility;
  assert.equal(report.reproducibility.ignoredFields.includes('generatedAt'),true);
  assert.equal(report.reproducibility.ignoredFields.includes('reproducibility'),true);
  if(report.reproducibility.ignoredFields.includes('lifecycleCases[].provenance.timestamp')){
    for(const item of normalized.lifecycleCases)if(item.provenance)delete item.provenance.timestamp;
  }
  assert.equal(sha256(JSON.stringify(normalized)),report.reproducibility.normalizedSha256);
}
async function checkScreenshots(report){
  for(const item of report.screenshots){
    assert.match(item.path,/^md\/body-camera-coverage-screenshots\/[^/]+\.png$/);
    const bytes=await fs.readFile(path.join(root,item.path));
    assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],`${item.path} PNG signature`);
    assert.equal(bytes.length,item.bytes,`${item.path} byte count`);
    assert.equal(sha256(bytes),item.sha256,`${item.path} screenshot hash`);
  }
}

const guide=await readJson('data/body-camera-coverage.json');
assert.equal(guide.schemaVersion,1);
assert.equal(guide.summary.pass,true);
assert.equal(guide.summary.failures,0);
assert.equal(guide.summary.stateCases,4884);
assert.equal(guide.summary.stateCasesPassed,4884);
assert.equal(guide.summary.mappingCases,222);
assert.equal(guide.summary.mappingCasesPassed,222);
assert.equal(guide.summary.lifecycleCases,9);
assert.equal(guide.summary.lifecycleCasesPassed,9);
assert.equal(guide.summary.storageInvariant,true);
assert.equal(guide.summary.screenshots,9);
assert.equal(guide.inventory.requiredViewportClasses,7);
assert.equal(guide.inventory.coveredRequiredViewportClasses,7);
assert.equal(guide.inventory.viewportConfigurations,37);
assert.equal(guide.inventory.widthModes,2);
assert.equal(guide.inventory.feeds,3);
assert.equal(guide.inventory.guideStates,11);
assert.equal(guide.inventory.autoSnapStates,2);
assert.deepEqual(guide.inventory.boundaryWidths,[479,480,481,719,720,721,879,880,881,899,900,901,979,980,981,1023,1024,1025,1199,1200,1201,1479,1480,1481,1699,1700,1701,1759,1760,1761]);
assert.equal(guide.stateCases.every(item=>item.pass),true);
assert.equal(guide.mappingCases.every(item=>item.pass),true);
assert.equal(guide.lifecycleCases.every(item=>item.pass),true);
for(const code of guide.guideCodes)assert.equal(guide.stateCases.filter(item=>item.code===code).length,444,`${code} state count`);
for(const mode of guide.modes)assert.equal(guide.stateCases.filter(item=>item.mode===mode).length,2442,`${mode} state count`);
for(const feed of guide.feeds)assert.equal(guide.stateCases.filter(item=>item.feed===feed.name).length,1628,`${feed.name} state count`);
for(const auto of guide.autoSnapStates)assert.equal(guide.stateCases.filter(item=>item.autoSnap===auto).length,2442,`auto-snap ${auto} state count`);
for(const name of ['late permission canceled by source switch','late play completion canceled by source switch','hardware ended cleanup','hardware inactive cleanup','reset cleanup','pagehide cleanup','auto-snap off keeps stable live guidance','manual shutter available with auto-snap off'])assert.ok(guide.lifecycleCases.some(item=>item.name===name&&item.pass),name);
await checkBinding(guide);checkReproducibility(guide);await checkScreenshots(guide);
const guideMd=await fs.readFile(path.join(root,'md/body-camera-coverage.md'),'utf8');
for(const phrase of ['4884/4884','1199/1200/1201','1759/1760/1761','physical sensor orientation','autofocus','exposure','native permission','browser chrome','real-device motion','Real-device checklist'])assert.ok(guideMd.includes(phrase),`guide report: ${phrase}`);

const result=await readJson('data/body-camera-result-coverage.json');
assert.equal(result.schemaVersion,1);
assert.equal(result.summary.pass,true);
assert.equal(result.summary.failures,0);
assert.equal(result.summary.cases,114);
assert.equal(result.summary.casesPassed,114);
assert.equal(result.summary.screenshots,4);
assert.equal(result.summary.storageInvariant,true);
assert.equal(result.summary.runtimeErrors,0);
assert.equal(result.inventory.viewportConfigurations,19);
assert.equal(result.inventory.requiredViewportClasses,7);
assert.deepEqual(result.inventory.boundaryWidths,[979,980,981,1023,1024,1025,1199,1200,1201,1759,1760,1761]);
assert.equal(result.inventory.widthModes,2);
assert.equal(result.inventory.renderedStates,3);
assert.equal(result.cases.every(item=>item.pass&&item.overflowPx<=1&&item.clipped.length===0&&item.maxApproxCharsPerLine<=100),true);
for(const state of result.states)assert.equal(result.cases.filter(item=>item.state===state).length,38,`${state} case count`);
for(const item of result.cases.filter(item=>item.state==='mixed-route-long')){
  assert.deepEqual(item.routes,['geometry','model','geometry']);
  assert.equal(item.longReliabilityRendered,true);
  assert.match(item.badgeText,/Hybrid/);
}
await checkBinding(result);checkReproducibility(result);await checkScreenshots(result);
const resultMd=await fs.readFile(path.join(root,'md/body-camera-result-coverage.md'),'utf8');
for(const phrase of ['114/114','1199/1200/1201','1759/1760/1761','mixed CNN/geometry hybrid','physical sensor rotation','autofocus','exposure','native permissions','browser chrome','real-device motion'])assert.ok(resultMd.includes(phrase),`result report: ${phrase}`);

const allShots=[...guide.screenshots,...result.screenshots];
assert.equal(allShots.length,13);
assert.equal(new Set(allShots.map(item=>item.path)).size,13);
console.log('body-camera-coverage artifacts: ok (4884 guide states, 222 mappings, 9 lifecycle cases, 114 populated states, 13 PNGs)');
