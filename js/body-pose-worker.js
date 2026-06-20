// Body Calc vision worker. PoseLandmarker's built-in CPU segmentation aborts on valid RGBA images
// (ImageFrame ChannelSize 1 vs 4), so landmarks and silhouette deliberately use separate tasks:
// PoseLandmarker without segmentation, plus the dedicated Selfie ImageSegmenter. Both stay off the
// main thread and under the page watchdog, so a native abort or spin cannot freeze the UI.

const VISION_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const POSE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
const SILHOUETTE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';
const PIDX = { nose:0, shoulderR:12, shoulderL:11, hipR:24, hipL:23, kneeR:26, kneeL:25,
  ankleR:28, ankleL:27 };
const REQUIRED = [0,11,12,23,24,25,26,27,28,29,30,31,32];

let mod = null;
let poseLandmarker = null;
let personSegmenter = null;

function postTrace(id, stage, startedAt){
  self.postMessage({ type:'trace', id, stage, elapsedMs:performance.now()-startedAt });
}

function confidence(point){
  const visibility = point.visibility == null ? 1 : point.visibility;
  const presence = point.presence == null ? 1 : point.presence;
  return Math.min(Number.isFinite(visibility) ? visibility : 0, Number.isFinite(presence) ? presence : 0);
}

function assessPose(lm, width, height){
  if (!lm || lm.length < 33 || !REQUIRED.every(i => lm[i] && Number.isFinite(lm[i].x) && Number.isFinite(lm[i].y))){
    return { ok:false, code:'malformed', message:'The pose landmarks were incomplete. Try a clearer photo.' };
  }
  const px = i => ({ x:lm[i].x*width, y:lm[i].y*height });
  const mid = (a,b) => { const p=px(a), q=px(b); return { x:(p.x+q.x)/2, y:(p.y+q.y)/2 }; };
  const dist = (a,b) => { const p=px(a), q=px(b); return Math.hypot(p.x-q.x,p.y-q.y); };
  const inFrame = (i,padX,top,bot) => lm[i].x>=-padX && lm[i].x<=1+padX && lm[i].y>=top && lm[i].y<=bot;
  const shoulders=mid(PIDX.shoulderL,PIDX.shoulderR), hips=mid(PIDX.hipL,PIDX.hipR);
  const torsoLen=Math.hypot(hips.x-shoulders.x,hips.y-shoulders.y);

  // Required for ANY read: an upright, front-facing torso. Both checks use only the shoulders and hips, which
  // a cropped upper-body shot still has — so they gate the full and the torso-only path alike.
  if (!(torsoLen > height*0.07) || (hips.y-shoulders.y)/torsoLen < 0.72){
    return { ok:false, code:'upright', message:'This pose is too bent or tilted for body ratios. Use an upright, front-facing photo.' };
  }
  // The torso path reads waist-to-hip, V-taper and shoulder breadth — all of which need the hips solidly in
  // frame (not extrapolated). If even the hips are cropped, there is not enough body to read. Checked before
  // the frontal test, because that test's torso length is meaningless once the hip is an extrapolated guess.
  const hipsSolid = [PIDX.hipL,PIDX.hipR].every(i => inFrame(i,0.03,0.02,1.05) && confidence(lm[i])>=0.5);
  if (!hipsSolid){
    return { ok:false, code:'partial', message:'Include at least the full torso down to the hips, standing and front-facing.' };
  }
  const shoulderTorso=dist(PIDX.shoulderL,PIDX.shoulderR)/torsoLen;
  const hipTorso=dist(PIDX.hipL,PIDX.hipR)/torsoLen;
  if (shoulderTorso < 0.38 || hipTorso < 0.22){
    return { ok:false, code:'profile', message:'This body is too side-on for frontal width ratios. Use a front-facing photo.' };
  }

  // Lower-body presence decides full vs. torso. Full body (feet in frame, confident) unlocks the height-based
  // adiposity proxy and leg proportion; a cropped upper-body shot scores the frame cues only.
  const lower=[25,26,27,28,29,30,31,32];
  const lowerConfidence=lower.reduce((sum,i)=>sum+confidence(lm[i]),0)/lower.length;
  const feetInside=[27,28,29,30,31,32].every(i => lm[i].x>=-0.03 && lm[i].x<=1.03 && lm[i].y>=0.04 && lm[i].y<=0.985);
  const feetPresent = feetInside && lowerConfidence >= 0.48 && confidence(lm[27]) >= 0.38 && confidence(lm[28]) >= 0.38;
  if (!feetPresent){
    return { ok:true, code:'ok', framing:'torso', shoulderTorso, hipTorso };
  }

  // Feet are in frame, so the legs must be straight and standing for the height/leg cues to be valid.
  const sideStats = [[23,25,27],[24,26,28]].map(([hip,knee,ankle]) => {
    const thigh=dist(hip,knee), shin=dist(knee,ankle);
    return {
      thighVertical:thigh ? (px(knee).y-px(hip).y)/thigh : 0,
      shinVertical:shin ? (px(ankle).y-px(knee).y)/shin : 0,
      thighDrop:px(knee).y-px(hip).y,
      shinDrop:px(ankle).y-px(knee).y
    };
  });
  if (sideStats.some(s => s.thighVertical < 0.38 || s.shinVertical < 0.38 || s.thighDrop < height*0.025 || s.shinDrop < height*0.025)){
    return { ok:false, code:'standing', message:'Seated, crouched, or strongly bent legs cannot support standing body ratios. Use a neutral standing pose.' };
  }
  return { ok:true, code:'ok', framing:'full', lowerConfidence, shoulderTorso, hipTorso,
    thighVertical:sideStats.map(s=>s.thighVertical), shinVertical:sideStats.map(s=>s.shinVertical) };
}

function rowWidthNear(mask, mw, row, centerX){
  const base=row*mw;
  const center=Math.max(0,Math.min(mw-1,Math.round(centerX)));
  const reach=Math.max(2,Math.round(mw*0.14));
  let seed=-1;
  for (let d=0; d<=reach; d++){
    const left=center-d, right=center+d;
    if (left>=0 && mask[base+left]>0.5){ seed=left; break; }
    if (right<mw && mask[base+right]>0.5){ seed=right; break; }
  }
  if (seed<0) return 0;
  let lo=seed, hi=seed;
  while (lo>0 && mask[base+lo-1]>0.5) lo--;
  while (hi<mw-1 && mask[base+hi+1]>0.5) hi++;
  return hi-lo+1;
}

// Robust band width. Taking the absolute min (waist) / max (shoulder, hip) row let a single noisy row —
// a clothing fold, a mask speck, an arm tip — set the value, exaggerating taper and curviness. Instead
// collect every valid row and return a trimmed quantile: a low quantile for 'min' (a robust "narrow"),
// a high quantile for 'max' (a robust "broad"). Resistant to one-row outliers, still direction-aware.
function scanBand(mask, mw, mh, y0, y1, mode, centerX){
  const low=Math.max(0,Math.min(1,Math.min(y0,y1)));
  const high=Math.max(0,Math.min(1,Math.max(y0,y1)));
  const start=Math.max(0,Math.min(mh-1,Math.floor(low*(mh-1))));
  const end=Math.max(start,Math.min(mh-1,Math.ceil(high*(mh-1))));
  const widths=[];
  for (let row=start; row<=end; row++){
    const value=rowWidthNear(mask,mw,row,centerX);
    if (value>0) widths.push(value);
  }
  if (!widths.length) return 0;
  widths.sort((a,b)=>a-b);
  const q = mode==='min' ? 0.20 : 0.80;                       // robust narrow / robust broad
  const idx = Math.max(0, Math.min(widths.length-1, Math.round(q*(widths.length-1))));
  return widths[idx];
}

function maskTopNear(mask, mw, mh, centerX, halfWidth){
  const x0=Math.max(0,Math.floor(centerX-halfWidth));
  const x1=Math.min(mw-1,Math.ceil(centerX+halfWidth));
  for (let row=0; row<mh; row++){
    const base=row*mw;
    for (let x=x0; x<=x1; x++) if (mask[base+x]>0.5) return row/Math.max(1,mh-1);
  }
  return null;
}

function extractSilhouette(mask, mw, mh, lm, framing){
  if (!Number.isInteger(mw) || !Number.isInteger(mh) || mw<=0 || mh<=0 || mask.length<mw*mh){
    throw new Error('invalid segmentation-mask dimensions');
  }
  const torso = framing === 'torso';
  const required = torso ? [11,12,23,24] : [11,12,23,24,27,28];
  if (!required.every(i=>lm[i] && Number.isFinite(lm[i].x) && Number.isFinite(lm[i].y))){
    throw new Error('invalid pose landmarks for silhouette scan');
  }
  const shoulderY=(lm[11].y+lm[12].y)/2;
  const hipY=(lm[23].y+lm[24].y)/2;
  const span=hipY-shoulderY;
  if (!Number.isFinite(span) || span<=0.01) throw new Error('degenerate shoulder-to-hip span');

  // Arm-corruption guard. The width scan grows a contiguous run of body pixels outward from the centre, so an
  // arm pressed against — or resting on — the torso gets counted as torso, inflating the waist/hip and faking a
  // straight, narrow frame (this is why a tapered, hand-on-hip physique can read "narrow"). Detect an elbow or
  // wrist sitting inside a measurement band AND tucked within ~the torso's own width; that band is then
  // unreliable, so we drop the dependent cue rather than score an inflated value (honest over confidently wrong).
  const centerXNorm=(lm[11].x+lm[12].x+lm[23].x+lm[24].x)/4;
  const torsoHalf=Math.max(Math.abs(lm[11].x-lm[12].x), Math.abs(lm[23].x-lm[24].x))/2;
  const armIn=(loY,hiY)=>[13,14,15,16].some(i=>{
    const a=lm[i];
    return a && Number.isFinite(a.x) && Number.isFinite(a.y)
      && a.y>=loY && a.y<=hiY && Math.abs(a.x-centerXNorm) < torsoHalf*1.1;
  });
  const waistArm=armIn(shoulderY+0.42*span, hipY-0.06*span);
  const hipArm  =armIn(hipY-0.04*span, hipY+0.22*span);

  const centerX=centerXNorm*mw;
  const shoulderJointW=Math.abs(lm[11].x-lm[12].x)*mw;
  const shoulderW=scanBand(mask,mw,mh,shoulderY+0.08*span,shoulderY+0.22*span,'max',centerX);
  let waistW=scanBand(mask,mw,mh,shoulderY+0.42*span,hipY-0.06*span,'min',centerX);
  let hipW=scanBand(mask,mw,mh,hipY-0.04*span,hipY+0.22*span,'max',centerX);
  if (!(Number.isFinite(shoulderW) && shoulderW>0)){
    throw new Error('segmentation mask contains no usable body outline');
  }
  if (waistArm) waistW=0;     // arm across the waist → taper / WHR unreadable
  if (hipArm)   hipW=0;       // arm or hand on the hip → WHR / breadth unreadable
  // Plausibility, only on the ratios whose widths we still trust (a flagged width is already zeroed out).
  if (waistW>0 && hipW>0){ const whr=waistW/hipW;        if (whr<0.45 || whr>1.25)   throw new Error('segmentation outline failed plausibility checks'); }
  if (waistW>0){           const taper=shoulderW/waistW; if (taper<0.70 || taper>2.80) throw new Error('segmentation outline failed plausibility checks'); }
  if (hipW>0){             const breadth=shoulderW/hipW;  if (breadth<0.60 || breadth>2.20) throw new Error('segmentation outline failed plausibility checks'); }

  // Height-based cues (the waist-to-height adiposity proxy, leg proportion) need the whole body in frame.
  // A cropped torso shot omits them rather than score them against an extrapolated, off-frame ankle.
  let heightPx = 0;
  if (!torso){
    const ankleY=(lm[27].y+lm[28].y)/2;
    const headTopY=maskTopNear(mask,mw,mh,centerX,Math.max(shoulderJointW*0.75,mw*0.06));
    if (headTopY==null) throw new Error('segmentation mask has no head-to-body component');
    heightPx=(ankleY-headTopY)*mh;
    if (!(Number.isFinite(heightPx) && heightPx>0)) throw new Error('segmentation mask contains no usable body height');
    if (waistW>0){ const whtr=waistW/heightPx; if (whtr<0.12 || whtr>0.72) throw new Error('segmentation outline failed plausibility checks'); }
  }
  return { shoulderW, waistW, hipW, height:heightPx, waistArm, hipArm };
}

// Keep this a classic worker: MediaPipe's WASM loader uses importScripts(), which module workers forbid.
async function makePoseLandmarker(){
  const fileset=await mod.FilesetResolver.forVisionTasks(WASM_URL);
  return mod.PoseLandmarker.createFromOptions(fileset,{
    baseOptions:{modelAssetPath:POSE_MODEL_URL,delegate:'CPU'},
    canvas:new OffscreenCanvas(1,1), runningMode:'IMAGE', numPoses:1,
    outputSegmentationMasks:false
  });
}

async function makePersonSegmenter(){
  const fileset=await mod.FilesetResolver.forVisionTasks(WASM_URL);
  return mod.ImageSegmenter.createFromOptions(fileset,{
    baseOptions:{modelAssetPath:SILHOUETTE_MODEL_URL,delegate:'CPU'},
    runningMode:'IMAGE', outputConfidenceMasks:true, outputCategoryMask:false
  });
}

async function initialize(){
  mod=await import(VISION_MODULE_URL);
  poseLandmarker=await makePoseLandmarker();
  try { personSegmenter=await makePersonSegmenter(); }
  catch(_){ personSegmenter=null; }
  self.postMessage({type:'ready',segmentation:Boolean(personSegmenter)});
}

function analyze(message){
  const id=message.id, bitmap=message.bitmap, startedAt=performance.now();
  let landmarks=null, silhouette=null, quality=null, warning='', recycle=false;
  try {
    if (!poseLandmarker) throw new Error('pose engine is not ready');
    postTrace(id,'pose-start',startedAt);
    poseLandmarker.detect(bitmap,result=>{ landmarks=result.landmarks && result.landmarks[0] || null; });
    postTrace(id,'pose-complete',startedAt);
    if (!landmarks){
      self.postMessage({type:'result',id,landmarks:null,silhouette:null,quality:null,warning:'',recycle:false,
        elapsedMs:performance.now()-startedAt});
      return;
    }
    self.postMessage({type:'landmarks',id,landmarks});
    quality=assessPose(landmarks,bitmap.width,bitmap.height);
    if (!quality.ok){
      self.postMessage({type:'result',id,landmarks,silhouette:null,quality,warning:quality.message,recycle:false,
        elapsedMs:performance.now()-startedAt});
      return;
    }

    if (!personSegmenter){
      warning='the silhouette model is unavailable';
    } else {
      try {
        postTrace(id,'silhouette-start',startedAt);
        personSegmenter.segment(bitmap,result=>{
          const masks=result.confidenceMasks || [];
          const mask=masks[0];
          try {
            if (!mask) throw new Error('the silhouette model returned no mask');
            postTrace(id,'mask-read-start',startedAt);
            const values=mask.getAsFloat32Array();
            postTrace(id,'mask-read-complete',startedAt);
            silhouette=extractSilhouette(values,mask.width,mask.height,landmarks,quality.framing);
            postTrace(id,'silhouette-complete',startedAt);
          } finally {
            masks.forEach(item=>{ try { item.close(); } catch(_){} });
          }
        });
      } catch(error){
        warning=error && error.message ? error.message : 'silhouette analysis failed';
        recycle=true;
      }
      if (!silhouette && !warning) warning='the silhouette outline was not reliable enough to score';
    }
    self.postMessage({type:'result',id,landmarks,silhouette,quality,warning,recycle,
      elapsedMs:performance.now()-startedAt});
  } catch(error){
    self.postMessage({type:'error',id,stage:'vision',message:error && error.message ? error.message : String(error),
      elapsedMs:performance.now()-startedAt});
  } finally {
    try { bitmap.close(); } catch(_){}
  }
}

if (typeof self !== 'undefined'){
  self.onmessage=function(event){
    const message=event.data || {};
    if (message.type==='analyze' && message.bitmap) analyze(message);
  };
  initialize().catch(error=>{
    self.postMessage({type:'init-error',message:error && error.message ? error.message : String(error)});
  });
}

if (typeof module !== 'undefined') module.exports={assessPose,extractSilhouette,rowWidthNear,scanBand,maskTopNear};
