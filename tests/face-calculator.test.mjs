import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { loadCore, pageFunction, scripts, quality } from './helpers/face-core.mjs';

const c = loadCore();
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a-b) < eps, `${a} != ${b}`);
const geo = (extra = {}) => ({depthAvailable:1, yawDeg: 0, pitchDeg: 12, rollDeg: 0, poseSkew: 0, ...extra});

test('reference contains 101 strictly increasing percentile knots', () => {
  assert.equal(c.REF_RAW.length, 101);
  c.REF_RAW.slice(1).forEach((x,i) => assert.ok(x > c.REF_RAW[i]));
});
test('all 101 reference knots map to their declared percentiles', () => c.REF_RAW.forEach((x,i) => near(c.refPercentile(x), i/100)));
test('median maps to 5.5', () => near(c.scoreFromRaw(c.REF_RAW[50]), 5.5));
test('10,001 raw probes are monotone and bounded', () => {
  let previous = 1;
  for(let i=0;i<=10000;i++) { const s=c.scoreFromRaw(i/2000); assert.ok(s>=previous && s>=1 && s<=10); previous=s; }
});
test('nonfinite model outputs have no score', () => [NaN,Infinity,-Infinity,null,undefined,'3'].forEach(x => assert.equal(c.scoreFromRaw(x),null)));
test('CDF round trip across central and tail probabilities', () => [0.001,0.01,0.1,0.5,0.9,0.99,0.999].forEach(p => near(c.normCdf(c.invNorm(p)),p)));
test('multi-photo averages raw outputs before mapping', () => near(c.scoreFromRaws([2.4,2.8,4]),c.scoreFromRaw(9.2/3)));
test('multi-photo ignores invalid outputs; empty set has no score', () => {
  near(c.scoreFromRaws([NaN,3,null,Infinity]),c.scoreFromRaw(3));
  assert.equal(c.scoreFromRaws([]),null); assert.equal(c.scoreFromRaws([NaN]),null);
});
test('repeat identical raw does not move the estimate', () => near(c.scoreFromRaws([3,3,3]),c.scoreFromRaw(3)));
test('RGB preprocessing uses CHW, ImageNet normalization, ignores alpha', () => {
  const rgba = new Uint8ClampedArray([255,128,0,0]);
  const out = c.preprocessToTensor(rgba,1,[0.485,0.456,0.406],[0.229,0.224,0.225]);
  [ (1-.485)/.229, (128/255-.456)/.224, -.406/.225 ].forEach((v,i)=>near(out[i],v));
});
for(const [key,warn,refuse] of [['yawDeg',6,12],['rollDeg',5,8]]) {
  test(`${key}: both signs and exact pass/degraded/refuse boundaries`, () => {
    for(const sign of [-1,1]) for(const [n,band] of [[warn-.001,'pass'],[warn,'degraded'],[refuse-.001,'degraded'],[refuse,'refuse']])
      assert.equal(c.classifyFraming(geo({[key]:sign*n})).band,band);
  });
}
test('missing depth uses skew gate', () => assert.equal(c.classifyFraming(geo({depthAvailable:0,yawDeg:0,pitchDeg:0,poseSkew:.23})).band,'refuse'));
test('valid nonzero depth takes precedence over noisy skew', () => assert.equal(c.classifyFraming(geo({yawDeg:1,poseSkew:.3})).band,'pass'));
test('refusal outranks a simultaneous warning', () => assert.equal(c.classifyFraming(geo({yawDeg:26,rollDeg:11})).band,'refuse'));

// Synthetic landmark fixtures test capture contracts, not human attractiveness.
function mesh({cx=.5,cy=.46,width=.3,height=.4}={}) {
  const lm=Array.from({length:478},()=>({x:cx,y:cy,z:0}));
  lm[234]={x:cx-width/2,y:cy,z:0}; lm[454]={x:cx+width/2,y:cy,z:0};
  lm[10]={x:cx,y:cy-height/2,z:0}; lm[152]={x:cx,y:cy+height/2,z:0};
  for (const i of [33,133]) lm[i]={x:cx-.06,y:cy-.06,z:0};
  for (const i of [263,362]) lm[i]={x:cx+.06,y:cy-.06,z:0};
  return lm;
}
function probe(frames) {
  let index=0, captures=0;
  const globals={alignTimer:null,stream:{},video:{hidden:false,videoWidth:640,videoHeight:480},
    autoSnapChk:{checked:true},lcBusy:false,alignCanvas:{},alignCtx:{drawImage(){}},
    landmarker:{detect(){return {faceLandmarks:[frames[Math.min(index++,frames.length-1)]]};}},
    window:{lcComputeMetrics:()=>geo(),lcClassifyFraming:c.classifyFraming},guideTip:{},GUIDE_TIP_DEFAULT:'Guide',
    alignAnchor:null,alignStreak:0,ALIGN_STREAK_NEEDED:4,ALIGN_EVERY_MS:350,setTimeout:()=>1,captureFrame(){captures++;}};
  const tick=pageFunction('alignTick',globals);
  for(let i=0;i<frames.length;i++) tick();
  return captures;
}
test('camera captures after four conforming reads',()=>assert.equal(probe([mesh(),mesh(),mesh(),mesh()]),1));
test('camera rejects below minimum relative width',()=>assert.equal(probe(Array(4).fill(mesh({width:.13}))),0));
test('camera should require face inside the guide',()=>assert.equal(probe(Array(4).fill(mesh({cx:.12,cy:.16,width:.2,height:.3}))),0));
test('camera should reject overlarge clipped face',()=>assert.equal(probe(Array(4).fill(mesh({width:.95,height:1.1}))),0));
test('hold still should test motion between passing frames',()=>assert.equal(probe([mesh({cx:.48}),mesh({cx:.52}),mesh({cx:.48}),mesh({cx:.52})]),0));
test('missing geometry should not classify as pass',()=>assert.notEqual(c.classifyFraming(null).band,'pass'));
test('zero valid yaw should not be mistaken for missing depth',()=>assert.equal(c.classifyFraming(geo({yawDeg:0,pitchDeg:0,poseSkew:.23})).band,'pass'));

function crop(lm) {
  const calls=[];
  const ctx={drawImage(...args){calls.push(args);},getImageData(){return {data:new Uint8ClampedArray(4)};}};
  pageFunction('cropFaceTensor',{MODEL_CONFIG:{inputSize:224,mean:[],std:[]},document:{createElement:()=>({getContext:()=>ctx})},window:{lcPreprocess:()=>null}})({},lm,640,480);
  return calls[0];
}
test('model crop preserves square aspect ratio',()=>{const args=crop(mesh()); near(args[3],args[4]); assert.equal(args[7],224);assert.equal(args[8],224);});
test('accepted edge framing should not introduce out-of-image model pixels',()=>{
  assert.throws(()=>crop(mesh({cx:.1,cy:.2,width:.2,height:.3})),/outside the image/);
});

function stateHarness() {
  const element={setAttribute(){},addEventListener(){},querySelectorAll:()=>[],classList:{toggle(){}}};
  const ctx=vm.createContext({window:{},document:{querySelectorAll:()=>[],getElementById:()=>element},localStorage:{removeItem(){}}});
  vm.runInContext(scripts.find(s=>s.includes('const IDX =')),ctx);
  vm.runInContext(scripts.find(s=>s.includes('const LC =')),ctx);
  vm.runInContext('renderResult = function(){}; setStatus = function(){};',ctx);
  return ctx.window;
}
test('ordinary new photo replaces accumulated photos',()=>{
  const w=stateHarness(); w.lcAnalyze(geo()); w.lcSetModelScore(.5,3); w.lcAnalyze(geo()); w.lcSetModelScore(.5,4);
  assert.deepEqual(Array.from(w.lcState.shots),[4]);
});
test('explicit add appends up to three, fourth drops oldest',()=>{
  const w=stateHarness(); for(const raw of [2,3,4,5]){w.lcState.addMode=true;w.lcAnalyze(geo());w.lcSetModelScore(.5,raw);}
  assert.deepEqual(Array.from(w.lcState.shots),[3,4,5]);
});
test('overridden photo provenance should survive adding a clean photo',()=>{
  const w=stateHarness(); w.lcAnalyze(geo(),null,'overridden',true);w.lcSetModelScore(.5,3);
  w.lcState.addMode=true;w.lcAnalyze(geo(),null,'',false);w.lcSetModelScore(.5,4);
  assert.equal(w.lcState.framingOverride,true);
});
test('reset clears score, photo set and pending analysis',()=>{
  const w=stateHarness();let cancelled=false;w.lcCancelAnalysis=()=>{cancelled=true;};
  w.lcAnalyze(geo());w.lcSetModelScore(.5,3);w.lcResetAll();
  assert.ok(cancelled);assert.equal(w.lcState.modelRaw,null);assert.equal(w.lcState.shots.length,0);
});

test('native pixel floor distinguishes equal framing at different resolutions',()=>{
  assert.equal(quality.photoQuality(mesh(),640,480).ok,true);
  assert.equal(quality.photoQuality(mesh(),96,72).ok,false);
});
test('exact 110px native floor passes, 109px fails',()=>{
  const lm=mesh({width:.125});
  assert.equal(quality.photoQuality(lm,880,880).ok,true);
  assert.equal(quality.photoQuality(lm,872,872).ok,false);
});
test('invalid or degenerate crop cannot reach model input',()=>{
  const lm=mesh();lm[5].x=NaN;assert.equal(quality.faceCrop(lm,640,480),null);
  assert.equal(quality.photoQuality(Array(478).fill({x:.5,y:.5}),640,480).ok,false);
});
test('camera guide matches SVG meet coordinates for portrait, landscape, and square',()=>{
  for(const [W,H] of [[640,480],[1920,1080],[1080,1920],[800,800]]){
    const fromGuide=(x,y)=>({x:(W/2+(x-50)*Math.min(W,H)/100)/W,y:(H/2+(y-50)*Math.min(W,H)/100)/H,z:0});
    const lm=Array.from({length:478},()=>fromGuide(50,46));
    lm[234]=fromGuide(33,46);lm[454]=fromGuide(67,46);lm[10]=fromGuide(50,23);lm[152]=fromGuide(50,69);
    [33,133].forEach(i=>lm[i]=fromGuide(43,40));[263,362].forEach(i=>lm[i]=fromGuide(57,40));
    assert.equal(quality.cameraQuality(lm,W,H,geo(),c.classifyFraming(geo())).ok,true,`${W}x${H}`);
    near(quality.guidePoint(lm[33],W,H).y,40);
  }
});
test('camera rejects displaced eye line independently of face center',()=>{
  const lm=mesh();[33,133,263,362].forEach(i=>lm[i].y+=.05);
  assert.equal(quality.cameraQuality(lm,640,480,geo(),c.classifyFraming(geo())).ok,false);
});
test('three aligned probes are shorter than the required stable second',()=>assert.equal(probe([mesh(),mesh(),mesh()]),0));
test('slow drift is measured against the first probe',()=>assert.equal(probe([mesh({cx:.49}),mesh({cx:.495}),mesh({cx:.5}),mesh({cx:.505})]),0));
test('mirror tensor reverses each row in each channel and is an involution',()=>{
  const input=new Float32Array([1,2,3,4,5,6,7,8,9,10,11,12]);
  assert.deepEqual(Array.from(quality.mirrorTensor(input,2)),[2,1,4,3,6,5,8,7,10,9,12,11]);
  assert.deepEqual(Array.from(quality.mirrorTensor(quality.mirrorTensor(input,2),2)),Array.from(input));
});
test('model consistency accepts boundary, rejects disagreement and invalid output',()=>{
  const map=x=>Number.isFinite(x)?x:null;
  assert.equal(quality.consistent(5,5.25,map),true);
  assert.equal(quality.consistent(5,5.251,map),false);
  assert.equal(quality.consistent(5,NaN,map),false);
});
test('adding a new photo hides the old raw while its checks are pending',()=>{
  const w=stateHarness();w.lcAnalyze(geo());w.lcSetModelScore(.5,3);
  w.lcState.addMode=true;w.lcBeginPhoto();w.lcAnalyze(geo());
  assert.equal(w.lcState.analysisPending,true);assert.equal(w.lcState.modelRaw,null);
});
test('rejected append rolls back measurements, scores, and warnings',()=>{
  const w=stateHarness();w.lcAnalyze(geo(),null,'angle warning',true);w.lcSetModelScore(.5,3);
  w.lcState.addMode=true;w.lcBeginPhoto();w.lcAnalyze(geo({yawDeg:2}));w.lcRejectPhoto('Rejected');
  assert.deepEqual(Array.from(w.lcState.shots),[3]);assert.equal(w.lcState.geo.yawDeg,0);
  assert.equal(w.lcState.framingOverride,true);assert.equal(w.lcState.reliability,'angle warning');
});
test('parked degraded append preserves previous shots until commit',()=>{
  const w=stateHarness();w.lcAnalyze(geo());w.lcSetModelScore(.5,3);
  w.lcState.addMode=true;w.lcBeginPhoto();w.lcParkGate(['angle']);
  assert.equal(w.lcState.geo,null);assert.equal(w.lcState.shots.length,1);assert.equal(w.lcState.addMode,true);
  w.lcAnalyze(geo(),null,'angle warning',true);w.lcSetModelScore(.5,4);
  assert.deepEqual(Array.from(w.lcState.shots),[3,4]);assert.equal(w.lcState.framingOverride,true);
});
test('discarding a gated append restores the previous result',()=>{
  const w=stateHarness();w.lcAnalyze(geo());w.lcSetModelScore(.5,3);
  w.lcState.addMode=true;w.lcBeginPhoto();w.lcParkGate(['angle']);w.lcRejectPhoto('Discarded');
  assert.equal(w.lcState.gate,null);assert.equal(w.lcState.modelRaw,3);assert.equal(w.lcState.shots.length,1);
});
test('fourth accepted photo evicts only the oldest quality provenance',()=>{
  const w=stateHarness();w.lcAnalyze(geo(),null,'old warning',true);w.lcSetModelScore(.5,2);
  for(const raw of [3,4,5]){w.lcState.addMode=true;w.lcAnalyze(geo());w.lcSetModelScore(.5,raw);}
  assert.equal(w.lcState.framingOverride,false);assert.equal(w.lcState.reliability,'');assert.equal(w.lcState.shotMeta.length,3);
});
test('quality provenance survives restoration and legacy shots cannot restore',()=>{
  const w=stateHarness();w.lcRestoreState({geo:geo(),shots:[9],model:.8});assert.equal(w.lcState.shots.length,0);
  w.lcRestoreState({qualityVersion:1,geo:geo(),shots:[3,4],shotMeta:[{reliability:'warning',framingOverride:true},{reliability:'',framingOverride:false}],model:.5,modelRaw:4});
  assert.equal(w.lcState.shots.length,2);assert.equal(w.lcState.framingOverride,true);assert.equal(w.lcState.reliability,'warning');
});

test('replacing a gated append preserves the original rollback',()=>{
  const w=stateHarness();w.lcAnalyze(geo());w.lcSetModelScore(.5,3);
  w.lcState.addMode=true;w.lcBeginPhoto();w.lcParkGate(['angle']);
  w.lcBeginPhoto();w.lcRejectPhoto('Replacement rejected');
  assert.deepEqual(Array.from(w.lcState.shots),[3]);assert.equal(w.lcState.modelRaw,3);
});
