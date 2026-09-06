// Real browser/model repeatability audit. No human-rating labels are inferred.
// Node >=20; CODEX_NODE_MODULES as in responsive_ui_audit.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { assessPhotoAudit } from './face-photo-contracts.mjs';
import { auditFaceFlows } from './audit-face-flows.mjs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_NODE_MODULES ? path.join(process.env.CODEX_NODE_MODULES,'playwright') : 'playwright');
const output=path.join(root,'artifacts','face-review');await fs.mkdir(output,{recursive:true});
const people=['ana-de-armas','brad-pitt','chris-hemsworth','zendaya','idris-elba','emma-watson','scarlett-johansson','danny-devito'];
const fixtures=[];
for(const person of people){
  const files=(await fs.readdir(path.join(root,'images','roster',person))).filter(f=>/\.(jpg|png|webp)$/i.test(f)).sort().slice(0,3);
  for(const file of files) fixtures.push({person,url:`images/roster/${person}/${file}`});
}
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root)){res.writeHead(403).end();return;}
    const data=await fs.readFile(file);
    const type={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.onnx':'application/octet-stream','.json':'application/json'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':type});res.end(data);
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
const rows=[],errors=[];
try{
  browser=await chromium.launch({headless:true,...(process.env.LE_BROWSER_EXECUTABLE?{executablePath:process.env.LE_BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    let setter;
    Object.defineProperty(window,'lcSetStatus',{configurable:true,get(){return setter;},set(fn){setter=function(msg,...rest){
      if(String(msg).startsWith('Ready.'))window.__faceAuditDetectorReady=true;
      return fn.call(this,msg,...rest);
    };}});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/face.html?debug`,{waitUntil:'load',timeout:120000});
  await page.waitForFunction(()=>window.__faceAuditDetectorReady && window.lcState?.modelReady && typeof window.__lcBatchRun==='function',{},{timeout:120000});
  console.log('Real browser and ONNX model ready');
  if (!process.argv.includes('--flows-only')) {
  for(const [i,fixture] of fixtures.entries()){
    const variants=i%3===0 ? ['original','repeat','mirror','dim','blur','small','roll8'] : ['original'];
    for(const variant of variants){
      const result=await page.evaluate(async({fixture,variant})=>{
        const img=new Image();img.src=fixture.url;await img.decode();
        const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d');
        if(variant==='mirror'){ctx.translate(canvas.width,0);ctx.scale(-1,1);}
        if(variant==='dim')ctx.filter='brightness(0.75)';
        if(variant==='blur')ctx.filter='blur(2px)';
        if(variant==='roll8'){ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(8*Math.PI/180);ctx.translate(-canvas.width/2,-canvas.height/2);}
        if(variant==='small'){const s=96/canvas.width;canvas.height=Math.round(canvas.height*s);canvas.width=96;}
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
        // Use the interactive upload path; overrides are explicit and recorded below.
        window.lcResetAll();
        const input=document.getElementById('lc-file');const dt=new DataTransfer();dt.items.add(new File([blob],'audit.png',{type:'image/png'}));
        input.files=dt.files;input.dispatchEvent(new Event('change'));
        const started=performance.now();let overridden=false;
        while(performance.now()-started<20000){
          if(window.lcState.gate){overridden=true;window.lcGateOverride();}
          if(window.lcState.model!==null && Number.isFinite(window.lcState.modelRaw))break;
          const status=document.getElementById('lc-status').textContent;
          if(/Photo not scored|No face found|too small|too far off|bad landmarks|Incomplete face|inference failed|Analysis failed/.test(status))break;
          await new Promise(r=>setTimeout(r,50));
        }
        const s=window.lcState;const geo=s.geo;
        const scored=s.model!==null && Number.isFinite(s.modelRaw);
        return {variant,width:canvas.width,height:canvas.height,scored,raw:scored?s.modelRaw:null,score:scored?window.scoreFromRaw(s.modelRaw):null,
          framing:geo?window.lcClassifyFraming(geo).band:null,overridden,yaw:geo?.yawDeg,roll:geo?.rollDeg,pitch:geo?.pitchDeg,
          reliability:s.reliability,status:document.getElementById('lc-status').textContent};
      },{fixture,variant});
      rows.push({...fixture,...result});console.log(JSON.stringify(rows.at(-1)));
      await fs.writeFile(path.join(output,'photos.json'),JSON.stringify({rows,errors},null,2));
    }
  }
  await page.screenshot({path:path.join(output,'last-result.png'),fullPage:true});
  const pairs=rows.filter(r=>r.variant!=='original').map(r=>{
    const base=rows.find(b=>b.url===r.url && b.variant==='original');
    return {...r,delta:r.scored&&base.scored?r.score-base.score:null};
  });
  const ranges=people.map(person=>{
    const scores=rows.filter(r=>r.person===person&&r.variant==='original'&&r.scored).map(r=>r.score);
    return {person,n:scores.length,range:scores.length>1?Math.max(...scores)-Math.min(...scores):null};
  });
  const checks=assessPhotoAudit(rows,errors,fixtures.length);
  const hashes={};
  for(const file of ['face.html','js/face-quality.js','models/face-beauty.onnx',...fixtures.map(f=>f.url)])
    hashes[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
  const metadata={utc:new Date().toISOString(),browser:browser.version(),node:process.version,hashes};
  await fs.writeFile(path.join(output,'summary.json'),JSON.stringify({metadata,images:fixtures.length,runs:rows.length,scored:rows.filter(r=>r.scored).length,ranges,pairs,errors,checks},null,2));
  const failures=checks.filter(c=>!c.pass);
  console.log(JSON.stringify({checks:checks.length,failures}));
  if(failures.length)process.exitCode=1;
  console.log(JSON.stringify({images:fixtures.length,runs:rows.length,ranges,errors}));
  }
  await auditFaceFlows(page,output);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
