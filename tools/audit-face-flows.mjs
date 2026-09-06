import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function auditFaceFlows(page,output){
  const results=[];
  const check=(name,condition)=>{assert.ok(condition,name);results.push({name,pass:true});console.log(name);};
  async function ready(){await page.waitForFunction(()=>window.__faceAuditDetectorReady&&window.lcState?.modelReady,{},{timeout:120000});}
  async function state(){return page.evaluate(()=>({shots:[...lcState.shots],meta:lcState.shotMeta,override:lcState.framingOverride,gate:!!lcState.gate,
    status:document.getElementById('lc-status').textContent,stored:localStorage.getItem('loveEquations.faceScore.v4'),photo:lcState.shotDataURL}));}
  async function upload(url,{append=false,route='upload',small=false}={}){
    await page.evaluate(async({url,append,route,small})=>{
      lcState.addMode=append;
      let blob=await (await fetch(url)).blob();
      if(small){const im=new Image();im.src=URL.createObjectURL(blob);await im.decode();const c=document.createElement('canvas');c.width=96;c.height=Math.round(im.height*96/im.width);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(im.src);blob=await new Promise(r=>c.toBlob(r));}
      const dt=new DataTransfer();dt.items.add(new File([blob],'flow.jpg',{type:blob.type}));
      if(route==='drop')document.getElementById('lc-drop').dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));
      else if(route==='paste')document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
      else {const input=document.getElementById('lc-file');input.files=dt.files;input.dispatchEvent(new Event('change'));}
    },{url,append,route,small});
  }
  async function settled(){
    await page.waitForFunction(()=>lcState.gate || /^Scored with|Photo not scored|This angle|No face found/.test(document.getElementById('lc-status').textContent),{},{timeout:30000});
    return state();
  }
  // Wait for each submission to replace its prior status before accepting completion.
  async function submit(url,options){await page.evaluate(()=>lcSetStatus('Test upload pending'));await upload(url,options);return settled();}
  const clean='images/roster/ana-de-armas/2.jpg',angled='images/roster/chris-hemsworth/3.jpg',other='images/roster/emma-watson/3.jpg';
  await page.evaluate(()=>lcResetAll());
  let s=await submit(clean);check('interactive upload scores clean control',s.shots.length===1&&!s.gate);
  s=await submit(angled,{append:true});
  check('degraded append parks without dropping previous shots',s.gate&&s.shots.length===1&&s.stored===null);
  check('pending append displays no stale headline',await page.locator('.lc-score').count()===0);
  await page.screenshot({path:path.join(output,'gate-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:/Rate anyway/}).click();
  await page.waitForFunction(()=>!lcState.analysisPending&&lcState.shots.length===2,{},{timeout:30000});
  s=await state();check('override appends with provenance',s.override&&s.meta[1].framingOverride);
  s=await submit(other,{append:true});check('clean third photo retains earlier warning',s.shots.length===3&&s.override);
  await page.reload({waitUntil:'load'});await ready();s=await state();
  check('reload restores quality metadata and three photos',s.shots.length===3&&s.override);
  const before=s;
  s=await submit(clean,{append:true,small:true});
  check('rejected append restores accepted photo and scores',JSON.stringify(s.shots)===JSON.stringify(before.shots)&&s.photo===before.photo&&s.override);
  // Shared raw-score storage must keep the existing Body score intact on Face reset.
  await page.evaluate(()=>localStorage.setItem('loveEquations.bodyScore.v3',JSON.stringify({sentinel:'keep-body',convention:'percentile-v3.1',bp:6,cv:6,bpMax:10,cvMax:10,floor:1,source:'model',sex:null,ts:Date.now()})));
  await page.locator('#lc-reset').click();
  check('face-only reset keeps body data',await page.evaluate(()=>localStorage.getItem('loveEquations.faceShot.v3')===null&&localStorage.getItem('loveEquations.faceScore.v4')===null&&JSON.parse(localStorage.getItem('loveEquations.bodyScore.v3')).sentinel==='keep-body'));
  s=await submit(clean,{route:'drop'});check('drop uses quality-checked scoring',s.shots.length===1);
  s=await submit(clean,{route:'paste',small:true});check('paste cannot bypass resolution refusal',s.shots.length===0&&s.status.includes('face too small'));
  await page.locator('#lc-url').fill(new URL(clean,page.url()).href);
  await page.evaluate(()=>lcSetStatus('Test URL pending'));await page.locator('#lc-url-go').click();s=await settled();
  check('URL uses quality-checked scoring',s.shots.length===1);
  const batch=await page.evaluate(async url=>{
    const before=JSON.stringify({...localStorage});
    const blob=await(await fetch(url)).blob();await __lcBatchRun([new File([blob],'clean.jpg',{type:'image/jpeg'})]);
    return {same:before===JSON.stringify({...localStorage}),rows:JSON.parse(JSON.stringify(__lcBatchRows))};
  },clean);
  check('debug batch scores through quality gates without persisting',batch.same&&batch.rows.length===1&&batch.rows[0].outcome==='scored');
  await page.evaluate(()=>{localStorage.setItem('loveEquations.faceShot.v2','{}');localStorage.setItem('loveEquations.faceScore.v3','{}');});
  await page.reload({waitUntil:'load'});await ready();
  check('old unvalidated face scores and snapshots are purged',await page.evaluate(()=>localStorage.getItem('loveEquations.faceShot.v2')===null&&localStorage.getItem('loveEquations.faceScore.v3')===null));
  await page.evaluate(()=>leComposite.reset());
  check('global reset clears new face snapshot and composite',await page.evaluate(()=>!localStorage.getItem('loveEquations.faceShot.v3')&&!localStorage.getItem('loveEquations.faceScore.v4')));
  // Webcam substitute tests the real camera start/stop UI and SVG/video geometry.
  // Unit tests cover actual landmark acceptance and motion. No physical camera is claimed.
  await page.evaluate(()=>{
    const source=document.createElement('canvas');window.__faceAuditCamera=source;source.width=1920;source.height=1080;
    source.getContext('2d').fillRect(0,0,source.width,source.height);
    navigator.mediaDevices.getUserMedia=async()=>{const stream=source.captureStream(5);setInterval(()=>source.getContext('2d').fillRect(0,0,source.width,source.height),100);return stream;};
    document.getElementById('lc-autosnap').checked=false;
  });
  await page.locator('.lc-src[data-src="camera"]').click();await page.locator('#lc-cam-start').click();
  await page.waitForFunction(()=>!document.getElementById('lc-guide-tip').hidden);
  const views=[[360,800],[390,844],[768,1024],[820,1180],[1024,768],[1366,768],[1920,1080],[1920,1200],[2560,1440],[3840,2160]];
  const layout=[];
  for(const aspect of ['landscape','portrait']){
  await page.evaluate(aspect=>{__faceAuditCamera.width=aspect==='landscape'?1920:1080;__faceAuditCamera.height=aspect==='landscape'?1080:1920;},aspect);
  await page.waitForFunction(aspect=>document.getElementById('lc-video').videoWidth===(aspect==='landscape'?1920:1080),aspect);
  for(const [width,height] of views)for(const mode of ['original','wide']){
    await page.setViewportSize({width,height});
    await page.evaluate(mode=>document.documentElement.dataset.contentWidth=mode,mode);
    const metrics=await page.evaluate(()=>{
      const r=id=>document.getElementById(id).getBoundingClientRect();
      const tip=r('lc-guide-tip'),stage=r('lc-stage'),video=r('lc-video'),svg=document.querySelector('#lc-guide svg').getBoundingClientRect();
      const oval=document.querySelector('.g-shape').getBoundingClientRect(),shutter=r('lc-shutter');
      return {shutterClear:oval.right<=shutter.left||oval.left>=shutter.right||oval.bottom<=shutter.top||oval.top>=shutter.bottom,overflow:document.documentElement.scrollWidth>innerWidth+1,tipOutside:tip.top>=stage.bottom,
        guideMatchesVideo:Math.abs(svg.width-video.width)<1&&Math.abs(svg.height-video.height)<1};
    });
    assert.ok(!metrics.overflow&&metrics.tipOutside&&metrics.guideMatchesVideo&&metrics.shutterClear,JSON.stringify({width,height,mode,metrics}));
    layout.push({aspect,width,height,mode,...metrics});
    if(([390,820,1366].includes(width))&&mode==='original')await page.screenshot({path:path.join(output,`camera-${width}-${aspect}.png`),fullPage:true});
  }
  }
  await page.evaluate(()=>lcStopCamera());
  check('camera stop hides visual and accessible guidance',await page.locator('#lc-guide-tip').isHidden());
  await fs.writeFile(path.join(output,'flows.json'),JSON.stringify({results,layout},null,2));
  console.log(JSON.stringify({flows:results.length,layout:layout.length}));
}
