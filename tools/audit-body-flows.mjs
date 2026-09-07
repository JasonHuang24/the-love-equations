import assert from 'node:assert/strict';
import path from 'node:path';
export async function auditBodyFlows(page,output){
 const results=[],layout=[];
 const check=(name,value)=>{assert.ok(value,name);results.push({name,pass:true});console.log(name);};
 const ready=()=>page.waitForFunction(()=>bcState.modelReady&&window.__bcBatchRun,{},{timeout:120000});
 const state=()=>page.evaluate(()=>({shots:JSON.parse(JSON.stringify(bcState.shots)),override:bcState.framingOverride,gate:!!bcState.gate,photo:bcState.shotDataURL,status:document.getElementById('bc-status').textContent,stored:localStorage.getItem('loveEquations.bodyScore.v4')}));
 async function settled(){await page.waitForFunction(()=>!bcState.analysisPending&&!bcState.photoPending&&!/^Test pending|Loading image|Reading pose|Scoring with|The outline read/.test(document.getElementById('bc-status').textContent),{},{timeout:30000});return state();}
 async function submit(url,{append=false,route='upload',small=false}={}){
  await page.evaluate(async({url,append,route,small})=>{
   bcState.addMode=append;bcSetStatus('Test pending');
   let blob=await(await fetch(url)).blob();
   if(small){const img=new Image();img.src=URL.createObjectURL(blob);await img.decode();const c=document.createElement('canvas');c.width=96;c.height=Math.round(img.height*96/img.width);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);blob=await new Promise(r=>c.toBlob(r));}
   const dt=new DataTransfer();dt.items.add(new File([blob],'body.png',{type:blob.type}));
   if(route==='drop')document.getElementById('bc-drop').dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));
   else if(route==='paste')document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
   else{const i=document.getElementById('bc-file');i.files=dt.files;i.dispatchEvent(new Event('change'));}
  },{url,append,route,small});return settled();
 }
 const clean='images/roster/idris-elba/2.jpg',torso='images/roster/armie-hammer/4.jpg';
 await page.evaluate(()=>bcResetAll());let s=await submit(clean);
 check('interactive model upload scores',s.shots.length===1&&!s.gate&&!!s.stored);
 s=await submit(torso,{append:true});check('geometry append parks with earlier photo intact',s.gate&&s.shots.length===1&&!s.stored);
 check('gated append has no stale headline',await page.locator('.bc-score').count()===0);
 await page.locator('#bc-result').screenshot({path:path.join(output,'gate-desktop.png')});
 await page.locator('#bc-gate-go').click();s=await settled();check('framing override commits complete geometry',s.shots.length===2&&s.override&&s.shots[1].route==='geometry');
 s=await submit(clean,{append:true});check('clean third photo retains prior warning',s.shots.length===3&&s.override);
 await page.reload();await ready();await page.waitForFunction(()=>bcState.shots.length===3);s=await state();check('reload restores all shots and warnings',s.override&&s.shots[1].quality.framingOverride);
 const before=s;s=await submit(clean,{append:true,small:true});check('rejected append restores photos and score',JSON.stringify(s.shots)===JSON.stringify(before.shots)&&s.photo===before.photo&&s.stored===before.stored);
 s=await submit(torso,{append:true});await page.locator('#bc-gate-drop').click();s=await state();check('discard append restores earlier set',JSON.stringify(s.shots)===JSON.stringify(before.shots)&&s.photo===before.photo);
 await page.evaluate(()=>localStorage.setItem('loveEquations.faceScore.v4',JSON.stringify({sentinel:'keep-face',convention:'percentile-v3.1',bp:6,cv:6,bpMax:10,cvMax:10,floor:1,source:'model',sex:null,ts:Date.now()})));
 await page.locator('#bc-reset').click();check('body reset preserves face',await page.evaluate(()=>!localStorage.getItem('loveEquations.bodyShot.v2')&&!localStorage.getItem('loveEquations.bodyScore.v4')&&JSON.parse(localStorage.getItem('loveEquations.faceScore.v4')).sentinel==='keep-face'));
 s=await submit(clean,{route:'drop'});check('drop runs checked scoring',s.shots.length===1&&!!s.stored);
 s=await submit(clean,{route:'paste',small:true});check('paste cannot bypass resolution floor',!s.shots.length&&!s.stored&&/too small/.test(s.status));
 await page.locator('#bc-url').fill(new URL(clean,page.url()).href);await page.evaluate(()=>bcSetStatus('Test pending'));await page.locator('#bc-url-go').click();s=await settled();check('URL runs checked scoring',s.shots.length===1&&!!s.stored);
 // Exercise actual rendering while an appended model inference is pending.
 await page.evaluate(()=>{bcState.addMode=true;bcBeginPhoto();bcAnalyze(bcState.metrics,'','full',false,0,false,null,'model');});
 check('model-pending append hides old headline and import',await page.locator('.bc-score').count()===0&&await page.evaluate(()=>!localStorage.getItem('loveEquations.bodyScore.v4')));
 await page.locator('#bc-reset').click();
 await page.evaluate(()=>{localStorage.setItem('loveEquations.bodyScore.v3','{}');localStorage.setItem('loveEquations.bodyShot.v1','{}');});await page.reload();await ready();
 check('legacy body snapshots and scores purged',await page.evaluate(()=>!localStorage.getItem('loveEquations.bodyScore.v3')&&!localStorage.getItem('loveEquations.bodyShot.v1')));
 s=await submit(clean);await page.evaluate(()=>leComposite.reset());check('global reset clears current body snapshot',await page.evaluate(()=>!localStorage.getItem('loveEquations.bodyShot.v2')&&!localStorage.getItem('loveEquations.bodyScore.v4')));
 await page.evaluate(()=>{
  const c=document.createElement('canvas');window.__bodyAuditCamera=c;c.width=1920;c.height=1080;
  const paint=()=>{const ctx=c.getContext('2d');ctx.fillStyle='#363330';ctx.fillRect(0,0,c.width,c.height);};paint();
  navigator.mediaDevices.getUserMedia=async()=>{setInterval(paint,100);return c.captureStream(5);};
  document.getElementById('bc-autosnap').checked=false;
 });
 await page.locator('.bc-src[data-src="camera"]').click();await page.locator('#bc-cam-start').click();await page.waitForFunction(()=>!document.getElementById('bc-guide-tip').hidden);
 const views=[[360,800],[390,844],[768,1024],[820,1180],[1024,768],[1366,768],[1920,1080],[1920,1200],[2560,1440],[3840,2160]];
 for(const aspect of ['landscape','portrait']){
  await page.evaluate(aspect=>{__bodyAuditCamera.width=aspect==='landscape'?1920:1080;__bodyAuditCamera.height=aspect==='landscape'?1080:1920;},aspect);
  await page.waitForFunction(aspect=>document.getElementById('bc-video').videoWidth===(aspect==='landscape'?1920:1080),aspect);
  for(const [width,height] of views)for(const mode of ['original','wide']){
   await page.setViewportSize({width,height});await page.evaluate(mode=>document.documentElement.dataset.contentWidth=mode,mode);
   const m=await page.evaluate(()=>{
    const r=id=>document.getElementById(id).getBoundingClientRect();const v=r('bc-video'),g=document.querySelector('#bc-guide svg').getBoundingClientRect(),tip=r('bc-guide-tip'),stage=r('bc-stage');
    const foot=document.querySelector('#bc-guide .g-bar').getBoundingClientRect(),shutter=r('bc-shutter');
    return {overflow:document.documentElement.scrollWidth>innerWidth+1,overlay:Math.abs(g.width-v.width)<1&&Math.abs(g.height-v.height)<1,aspect:Math.abs(v.width/v.height-document.getElementById('bc-video').videoWidth/document.getElementById('bc-video').videoHeight)<.01,tipClear:tip.top>=stage.bottom,shutterClear:shutter.left>=foot.right || shutter.top>=foot.bottom || shutter.bottom<=foot.top};
   });layout.push({aspect,width,height,mode,...m});assert.ok(!m.overflow&&m.overlay&&m.aspect&&m.tipClear&&m.shutterClear,JSON.stringify(layout.at(-1)));
   if([390,820,1366].includes(width)&&mode==='original')await page.locator('#bc-stage').locator('..').screenshot({path:path.join(output,`camera-${aspect}-${width}.png`)});
  }
 }
 await page.locator('#bc-shutter').click();await page.waitForFunction(()=>/No body found/.test(document.getElementById('bc-status').textContent),{},{timeout:30000});
 check('manual shutter applies the same no-body refusal',await page.evaluate(()=>!bcState.shots.length&&!localStorage.getItem('loveEquations.bodyScore.v4')));
 await page.evaluate(()=>bcStopCamera());check('camera stop hides guide and clears preview width',await page.evaluate(()=>document.getElementById('bc-guide-tip').hidden&&!document.getElementById('bc-stage').style.width));
 await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>window.__resolveBodyCamera=resolve);});
 await page.locator('#bc-cam-start').click();await page.locator('#bc-reset').click();
 await page.evaluate(()=>{window.__lateBodyCamera=__bodyAuditCamera.captureStream(5);__resolveBodyCamera(__lateBodyCamera);});
 await page.waitForFunction(()=>__lateBodyCamera.getTracks().every(t=>t.readyState==='ended'));
 check('reset cancels a pending camera permission request',await page.evaluate(()=>document.getElementById('bc-video').hidden));
 return {results,layout};
}
