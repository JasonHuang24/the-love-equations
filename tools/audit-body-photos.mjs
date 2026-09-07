// Real browser/model repeatability audit. No human-rating labels are inferred.
// Node >=20; CODEX_NODE_MODULES as in responsive_ui_audit.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.CODEX_NODE_MODULES ? path.join(process.env.CODEX_NODE_MODULES,'playwright') : 'playwright');
import {auditBodyFlows} from './audit-body-flows.mjs';
const output=path.join(root,'artifacts','body-review');await fs.mkdir(output,{recursive:true});
const mode='results';
const fixtures=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/body-review-photos.json'),'utf8'));
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
let browser; const rows=[],errors=[];
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.LE_BROWSER_EXECUTABLE});
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/body.html?debug`,{timeout:120000});
 await page.waitForFunction(()=>window.bcState?.modelReady && window.__bcBatchRun,{},{timeout:120000});
 if(!process.argv.includes('--flows-only')){
 for(const fixture of fixtures){
  const r=await page.evaluate(async ({url,variant})=>{
   const img=new Image();img.src=url;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
   if(variant==='small'){canvas.height=Math.round(128*canvas.height/canvas.width);canvas.width=128;}
   const ctx=canvas.getContext('2d');
   if(variant==='mirror'){ctx.translate(canvas.width,0);ctx.scale(-1,1);}
   if(variant==='dim')ctx.filter='brightness(.75)';
   if(variant==='blur')ctx.filter='blur(2px)';
   if(variant==='crop'){canvas.height=Math.round(img.naturalHeight*.65);ctx.drawImage(img,0,0);}
   else ctx.drawImage(img,0,0,canvas.width,canvas.height);
   const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
   const before=window.__bcBatchLS();
   await window.__bcBatchRun([new File([blob],url,{type:blob.type})]);
   return {...window.__bcBatchRows[0],storageUnchanged:before===window.__bcBatchLS()};
  },fixture);
  rows.push({...fixture,...r});console.log(JSON.stringify(rows.at(-1)));
  await fs.writeFile(path.join(output,mode+'.json'),JSON.stringify({rows,errors},null,2));
 }
 const checks=[
  {name:'all photo attempts settled',pass:rows.length===fixtures.length && rows.every(r=>r.outcome!=='error')},
  {name:'batch storage unchanged',pass:rows.every(r=>r.storageUnchanged)},
  {name:'no phantom scored rows',pass:rows.every(r=>r.outcome!=='scored'||!!r.bp)},
  {name:'both scoring routes exercised',pass:['clothed→model','clothed→geometry'].every(route=>rows.some(r=>r.routing===route&&r.bp))},
  {name:'all low-resolution images refused',pass:rows.filter(r=>r.variant==='small').every(r=>r.outcome==='refused')},
  {name:'no browser errors',pass:!errors.length}
 ];
 for(const r of rows.filter(r=>r.variant==='repeat')){
  const b=rows.find(b=>b.url===r.url&&b.variant==='original');
  checks.push({name:'identical pixels repeat: '+r.url,pass:r.outcome===b.outcome && (r.bp===b.bp || Math.abs(Number(r.bp)-Number(b.bp))<=.25)});
 }
 for(const r of rows.filter(r=>['mirror','dim','blur'].includes(r.variant))){
  const b=rows.find(b=>b.url===r.url&&b.variant==='original');
  checks.push({name:`${r.variant} stability: ${r.url}`,pass:!r.bp||!b.bp||Math.abs(Number(r.bp)-Number(b.bp))<=.75});
 }
 const hashes={};for(const f of ['body.html','js/body-quality.js','js/body-pose-worker.js','models/body-beauty.onnx',...new Set(fixtures.map(f=>f.url))])hashes[f]=createHash('sha256').update(await fs.readFile(path.join(root,f))).digest('hex');
 await fs.writeFile(path.join(output,mode+'.json'),JSON.stringify({metadata:{utc:new Date().toISOString(),browser:browser.version(),node:process.version,hashes},rows,errors,checks},null,2));
 if(checks.some(c=>!c.pass)){console.error(checks.filter(c=>!c.pass));process.exitCode=1;}
 }
 const flows=await auditBodyFlows(page,output);await fs.writeFile(path.join(output,'flows.json'),JSON.stringify(flows,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
