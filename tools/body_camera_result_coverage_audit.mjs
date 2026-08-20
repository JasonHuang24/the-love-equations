/** Deterministic populated/input/gate layout coverage for the production Body Calculator. */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const moduleRoot=process.env.CODEX_NODE_MODULES;
if(!moduleRoot)throw new Error('CODEX_NODE_MODULES must point to the bundled node_modules directory.');
const {chromium}=require(path.join(moduleRoot,'playwright'));
const root=path.resolve(import.meta.dirname,'..');
const jsonPath=path.join(root,'data','body-camera-result-coverage.json');
const mdPath=path.join(root,'md','body-camera-result-coverage.md');
const screenshotDir=path.join(root,'md','body-camera-coverage-screenshots');
const modes=['original','wide'];
const states=['step2-unresolved','gate-prompt','mixed-route-long'];
const viewports=[
  {name:'mobile-portrait-390x844',width:390,height:844,class:'mobile portrait',required:true},
  {name:'tablet-820x1180',width:820,height:1180,class:'tablet',required:true},
  {name:'desktop-1366x768',width:1366,height:768,class:'standard desktop',required:true},
  {name:'desktop-1920x1080',width:1920,height:1080,class:'1080p',required:true},
  {name:'desktop-2560x1440',width:2560,height:1440,class:'1440p',required:true},
  {name:'desktop-1920x1200',width:1920,height:1200,class:'16:10 desktop',required:true},
  {name:'desktop-3840x2160',width:3840,height:2160,class:'4K',required:true},
  ...[979,980,981,1023,1024,1025,1199,1200,1201,1759,1760,1761].map(width=>({name:`boundary-${width}x1000`,width,height:1000,class:`squeeze boundary ${width}px`,required:false})),
];
const screenshotSpecs=[
  {viewport:'mobile-portrait-390x844',mode:'original',state:'step2-unresolved',target:'.bc-inputs'},
  {viewport:'boundary-980x1000',mode:'wide',state:'mixed-route-long',target:'#bc-result'},
  {viewport:'boundary-1024x1000',mode:'original',state:'gate-prompt',target:'#bc-result'},
  {viewport:'desktop-3840x2160',mode:'wide',state:'mixed-route-long',target:'#bc-result'},
];
const mime=new Map([['.html','text/html; charset=utf-8'],['.css','text/css; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.svg','image/svg+xml'],['.png','image/png'],['.woff2','font/woff2'],['.onnx','application/octet-stream']]);
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const safe=value=>value.replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'').toLowerCase();

async function hashFile(relative){const bytes=await fs.readFile(path.join(root,relative));return{path:relative.replaceAll('\\','/'),sha256:sha256(bytes),bytes:bytes.length};}
async function server(){
  const instance=http.createServer(async(req,res)=>{try{
    const url=new URL(req.url||'/','http://127.0.0.1');
    const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'body.html';
    const file=path.resolve(root,relative);
    if(file!==root&&!file.startsWith(`${root}${path.sep}`)){res.writeHead(403).end('Forbidden');return;}
    const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime.get(path.extname(file).toLowerCase())||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  }catch(error){res.writeHead(error?.code==='ENOENT'?404:500).end('Not found');}});
  await new Promise((resolve,reject)=>{instance.once('error',reject);instance.listen(0,'127.0.0.1',resolve);});
  return{instance,url:`http://127.0.0.1:${instance.address().port}`};
}
async function stub(page){
  await page.route('**/js/body-pose-worker.js*',route=>route.fulfill({status:200,contentType:'text/javascript',body:"self.postMessage({type:'ready',segmentation:true});self.onmessage=e=>{const m=e.data||{};if(m.type==='analyze')self.postMessage({type:'result',id:m.id,landmarks:null,silhouette:null,quality:null,warning:'',recycle:false,elapsedMs:1});};"}));
  await page.route('https://**/*',route=>{const url=route.request().url();if(url.includes('ort.min.js'))return route.fulfill({status:200,contentType:'text/javascript',body:'window.ort=undefined;'});if(url.endsWith('.css')||url.includes('tabler-icons'))return route.fulfill({status:200,contentType:'text/css',body:''});return route.fulfill({status:204,body:''});});
}

function install(){
  const body=window.bcState;
  if(!body||typeof window.bcAnalyze!=='function'||typeof window.bcShowGate!=='function')throw new Error('Body render hooks unavailable');
  window.leComposite=null;
  const a={whtr:0.19,whr:0.88,vTaper:1.56,shoulderHip:1.34,legTorso:1.52,symmetry:0.07};
  const b={whtr:0.21,whr:0.91,vTaper:1.46,shoulderHip:1.28,legTorso:1.45,symmetry:0.12};
  const longReliability='Camera-like framing remained usable, but a loose sleeve crossed the waist contour and the lower-leg landmarks softened near the edge. Lighting was uneven across the torso, the stance shifted between frames, and the latest upper-body crop removed the full-height leanness and leg-proportion cues. This long diagnostic is deliberately rendered to verify that reliability text wraps, stays plain text, and never forces the result column wider than the viewport.';
  function reset(){
    window.bcResetResult();Object.assign(body,{inHeightCm:null,inWeightKg:null,inBfPct:null,inBfSource:null,skipInputs:false,sex:null,sexManual:false,sexAuto:true,sexSource:'unknown',sexConf:null,sexClsSex:null,sexClsConf:null,sexUnknownReason:''});window.bcSetSourceProvenance('upload',null);
  }
  function configure(name){
    reset();
    if(name==='step2-unresolved'){
      body.inHeightCm=178;body.inWeightKg=77;window.bcSetSexUnknown('not enough verified face evidence');
    }else if(name==='gate-prompt'){
      body.inHeightCm=178;body.inWeightKg=77;window.bcSetSexUnknown('not enough verified face evidence');
      window.bcShowGate(['the feet extend beyond the lower frame boundary','one arm overlaps the waist contour used by the silhouette route','the shoulder and hip lines disagree with the square-on guide'],'both');
    }else if(name==='mixed-route-long'){
      Object.assign(body,{inHeightCm:178,inWeightKg:77,inBfPct:14.5,inBfSource:'measured',skipInputs:false,sex:'m',sexManual:true,sexAuto:false,sexSource:'manual',sexConf:null,sexClsSex:null,sexClsConf:null,sexUnknownReason:''});
      window.bcAnalyze(a,'first full-body geometry frame retained its major outline cues','full',false,0.12,false,[],'geometry','geometry',false);
      body.addMode=true;window.bcAnalyze(b,'trained route frame completed with conservative preprocessing notes','full',false,0.10,false,[],'model','model',true);window.bcSetModelScore(0.64,0.22);
      body.addMode=true;window.bcAnalyze(a,longReliability,'torso',false,0.18,false,['the latest crop removed the feet and lower-leg landmarks','a sleeve crossed part of the waist contour'],'geometry','geometry',false);
    }else throw new Error(`Unknown fixture ${name}`);
  }
  function storage(){const local={},session={};for(let i=0;i<localStorage.length;i+=1){const key=localStorage.key(i);local[key]=localStorage.getItem(key);}for(let i=0;i<sessionStorage.length;i+=1){const key=sessionStorage.key(i);session[key]=sessionStorage.getItem(key);}return{local,session};}
  function measure(name){
    configure(name);
    const vw=document.documentElement.clientWidth;
    const overflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-vw;
    const elements=[...document.querySelectorAll('.bc-inputs,#bc-inputs-body,#bc-result,.bc-in-field,.bc-bf-grid,.bc-sex,.bc-meas,.bc-note-line,.bc-missing,.bc-gate,.bc-gate-btns,.bc-score-wrap,.bc-t0-math')].filter(el=>el.getClientRects().length);
    const clipped=elements.filter(el=>{const rect=el.getBoundingClientRect(),style=getComputedStyle(el);return rect.left < -1||rect.right > vw+1||(el.scrollWidth>el.clientWidth+2&&!/(auto|scroll)/.test(style.overflowX));}).map(el=>el.id||String(el.className)||el.tagName).slice(0,12);
    const text=[...document.querySelectorAll('.bc-inputs-lead,.bc-note-line,.bc-missing,.bc-gate-note,.bc-sexnote,.bc-meas-val,.bc-t0-math')].filter(el=>el.getClientRects().length&&el.textContent.trim());
    const measures=text.map(el=>el.getBoundingClientRect().width/((Number.parseFloat(getComputedStyle(el).fontSize)||16)*0.52));
    const controls=[...document.querySelectorAll('#bc-inputs-body input,#bc-inputs-body button,#bc-result button,#bc-result a')].filter(el=>el.getClientRects().length);
    const unnamed=controls.filter(el=>{if((el.getAttribute('aria-label')||el.textContent||el.getAttribute('title')||'').trim())return false;return !(el.matches('input')&&(el.getAttribute('placeholder')||el.closest('.bc-in-field')?.querySelector('.bc-field-label')));}).map(el=>el.id||el.tagName);
    const values=[...document.querySelectorAll('#bc-inputs-body input[type="text"]')].map(el=>el.value).filter(Boolean);
    const specific=name==='step2-unresolved'
      ? document.querySelectorAll('.bc-bf-preview-row').length===2&&document.querySelectorAll('.bc-in-sex button').length===2&&values.length>=2
      : name==='gate-prompt'
        ? document.querySelectorAll('.bc-gate-list li').length===3&&document.querySelectorAll('.bc-gate-btns button').length===2
        : document.querySelectorAll('.bc-meas').length>=8&&document.querySelectorAll('#bc-result .bc-sex button').length===2&&document.querySelectorAll('.bc-shots .bc-dot.on').length===3&&document.querySelector('.bc-srcbadge')?.textContent.includes('Hybrid')&&document.getElementById('bc-result').textContent.includes('Camera-like framing remained usable')&&body.shots.length===3&&body.shots.some(shot=>shot.route==='model')&&body.shots.some(shot=>shot.route==='geometry');
    const checks={noHorizontalOverflow:overflow<=1,noClippedContainers:clipped.length===0,readableLineLength:measures.length>0&&Math.max(...measures)<=100,populatedStep2:document.querySelectorAll('#bc-inputs-body .bc-in-field').length>=3,bodyFatGridFits:[...document.querySelectorAll('.bc-bf-grid')].every(grid=>grid.scrollWidth<=grid.clientWidth+2),sexControlsFit:[...document.querySelectorAll('.bc-sex')].every(group=>group.scrollWidth<=group.clientWidth+2),visibleControlNames:unnamed.length===0,expectedState:specific};
    return{state:name,overflowPx:Math.round(overflow*1000)/1000,clipped,maxApproxCharsPerLine:measures.length?Math.round(Math.max(...measures)*100)/100:null,unnamedControls:unnamed,inputValues:values,measurementRows:document.querySelectorAll('.bc-meas').length,bfTiles:document.querySelectorAll('.bc-bf-tile').length,routes:body.shots.map(shot=>shot.route),badgeText:document.querySelector('.bc-srcbadge')?.textContent||'',longReliabilityRendered:document.getElementById('bc-result').textContent.includes('Camera-like framing remained usable'),checks,pass:Object.values(checks).every(Boolean)};
  }
  window.__bodyResultAudit={configure,measure,storage};
}

await fs.mkdir(path.dirname(jsonPath),{recursive:true});await fs.mkdir(path.dirname(mdPath),{recursive:true});await fs.mkdir(screenshotDir,{recursive:true});
const host=await server();const browser=await chromium.launch({headless:true,executablePath:process.env.LE_BROWSER_EXECUTABLE||chromium.executablePath()});
const browserVersion=browser.version();const cases=[],screenshots=[],failures=[],errors=[];
let before,after;
try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce',colorScheme:'light'});
  await context.addInitScript(()=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('body-result-audit-sentinel','unchanged');localStorage.setItem('le-content-width','original');});
  const page=await context.newPage();await stub(page);page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(`${host.url}/body.html?body-camera-result-coverage=1`,{waitUntil:'load',timeout:30_000});await page.evaluate(()=>document.fonts?.ready);await page.evaluate(install);before=await page.evaluate(()=>window.__bodyResultAudit.storage());
  for(const viewport of viewports){
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    for(const mode of modes){
      await page.evaluate(value=>{document.documentElement.dataset.contentWidth=value;},mode);
      for(const state of states){const result=await page.evaluate(value=>window.__bodyResultAudit.measure(value),state);const row={viewport:viewport.name,width:viewport.width,height:viewport.height,required:viewport.required,mode,...result};cases.push(row);if(!row.pass)failures.push({case:`${viewport.name}/${mode}/${state}`,failedChecks:Object.entries(row.checks).filter(([,ok])=>!ok).map(([key])=>key)});}
      for(const spec of screenshotSpecs.filter(item=>item.viewport===viewport.name&&item.mode===mode)){
        await page.evaluate(value=>window.__bodyResultAudit.configure(value),spec.state);const filename=`${safe(viewport.name)}--${mode}--${spec.state}.png`;const absolute=path.join(screenshotDir,filename);await page.locator('.nav').evaluate(element=>{element.style.visibility='hidden';});await page.locator(spec.target).screenshot({path:absolute,animations:'disabled'});await page.locator('.nav').evaluate(element=>{element.style.visibility='';});screenshots.push({viewport:viewport.name,mode,state:spec.state,path:path.relative(root,absolute).replaceAll('\\','/')});
      }
    }
    console.log(`${cases.filter(item=>item.viewport===viewport.name&&item.pass).length===modes.length*states.length?'PASS':'FAIL'} RESULT ${viewport.name}`);
  }
  after=await page.evaluate(()=>window.__bodyResultAudit.storage());await context.close();
}finally{await browser.close();await new Promise(resolve=>host.instance.close(resolve));}
for(const shot of screenshots){const bytes=await fs.readFile(path.join(root,shot.path));shot.sha256=sha256(bytes);shot.bytes=bytes.length;}
const bindings=[];for(const file of ['body.html','css/styles.css','css/body.css','js/body-state.js','js/body-camera-guide.js','tools/body_camera_result_coverage_audit.mjs'])bindings.push(await hashFile(file));
const uniqueErrors=[...new Set(errors)].filter(message=>!/integrity.*tabler-icons|valid digest.*tabler-icons/i.test(message));
if(uniqueErrors.length)failures.push({case:'runtime-errors',failedChecks:uniqueErrors});if(JSON.stringify(before)!==JSON.stringify(after))failures.push({case:'storage-invariance',failedChecks:['localStorage/sessionStorage changed']});
const report={schemaVersion:1,generatedAt:new Date().toISOString(),browser:{name:'Chromium',version:browserVersion,headless:true,deviceScaleFactor:1,reducedMotion:'reduce'},methodology:{kind:'deterministic production-page populated-state render; valid synthetic metrics, no image or rating claim',command:'CODEX_NODE_MODULES=<bundled-node_modules> node tools/body_camera_result_coverage_audit.mjs',notTested:['physical sensors','rotation metadata','autofocus','exposure','native permission UI','browser chrome','real-device motion','subjective attractiveness accuracy']},inventory:{viewportConfigurations:viewports.length,requiredViewportClasses:7,boundaryWidths:[979,980,981,1023,1024,1025,1199,1200,1201,1759,1760,1761],widthModes:modes.length,renderedStates:states.length,expectedCases:viewports.length*modes.length*states.length},viewports,modes,states,artifactBinding:{algorithm:'sha256',files:bindings},summary:{cases:cases.length,casesPassed:cases.filter(item=>item.pass).length,screenshots:screenshots.length,storageInvariant:JSON.stringify(before)===JSON.stringify(after),runtimeErrors:uniqueErrors.length,failures:failures.length,pass:failures.length===0&&cases.every(item=>item.pass)},screenshots,failures,cases};
const normalized=structuredClone(report);delete normalized.generatedAt;report.reproducibility={ignoredFields:['generatedAt','reproducibility'],normalizedSha256:sha256(JSON.stringify(normalized))};
await fs.writeFile(jsonPath,`${JSON.stringify(report,null,2)}\n`);
const rows=states.map(state=>{const matches=cases.filter(item=>item.state===state);return`| ${state} | ${matches.filter(item=>item.pass).length}/${matches.length} |`;}).join('\n');
const shots=screenshots.map(item=>`| ${item.viewport} | ${item.mode} | ${item.state} | [${path.basename(item.path)}](body-camera-coverage-screenshots/${path.basename(item.path)}) | \`${item.sha256.slice(0,12)}…\` |`).join('\n');
await fs.writeFile(mdPath,`# Body camera populated-state coverage\n\n**${report.summary.pass?'PASS':'FAIL'}** — ${report.summary.casesPassed}/${report.summary.cases} rendered states across seven representative viewport classes plus 979/980/981, 1023/1024/1025, 1199/1200/1201, and 1759/1760/1761 px, in both content-width modes.\n\nThis supplements the 4,884-case guide matrix with production Step 2, both unresolved-sex body-fat grids, a three-issue gate prompt, sex toggles, populated measurement rows, and a three-photo mixed CNN/geometry hybrid carrying long reliability and outline-override copy. It checks page/container overflow, clipping, line measure, body-fat/sex-control fit, visible control names, runtime errors, and storage invariance. These structural renders do not prove subjective accuracy.\n\n| State | Passed |\n|---|---:|\n${rows}\n\n## Screenshots\n\nThe unrelated sticky site navigation is hidden only for these isolated component captures; it remains rendered during every layout and overflow measurement.\n\n| Viewport | Mode | State | File | SHA-256 |\n|---|---|---|---|---|\n${shots}\n\n## Real-device limitation\n\nSynthetic rendering does not prove physical sensor rotation, autofocus, exposure, native permissions, browser chrome/safe areas, or real-device motion. On iOS Safari and Android Chrome, check allow/deny/dismiss/revoke, portrait/landscape rotation, front-camera mirroring, 4:3/16:9/tall feeds, dim/backlit focus and exposure, motion during auto-snap, and interruptions from source switch, reset, backgrounding, pagehide, and track revocation.\n\nMachine-readable detail: \`data/body-camera-result-coverage.json\`. Normalized reproducibility hash: \`${report.reproducibility.normalizedSha256}\`.\n`);
console.log(`BODY CAMERA RESULT STATES=${report.summary.casesPassed}/${report.summary.cases}`);console.log(`BODY CAMERA RESULT SCREENSHOTS=${screenshots.length}`);console.log(`BODY CAMERA RESULT FAILURES=${failures.length}`);console.log(`BODY CAMERA RESULT REPRO=${report.reproducibility.normalizedSha256}`);if(!report.summary.pass)process.exitCode=1;
