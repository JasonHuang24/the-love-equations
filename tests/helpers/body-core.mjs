import fs from 'node:fs';
import vm from 'node:vm';
export const html=fs.readFileSync(new URL('../../body.html',import.meta.url),'utf8');
export const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const arm=fs.readFileSync(new URL('../../js/body-arm-band.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../../js/body-pose-worker.js',import.meta.url),'utf8');
const ctx=vm.createContext({module:{exports:{}}});vm.runInContext(arm,ctx);vm.runInContext(worker,ctx);
export const pose=ctx.module.exports;
vm.runInContext(fs.readFileSync(new URL('../../js/body-quality.js',import.meta.url),'utf8'),ctx);
export const quality=ctx.BodyQuality;
export const armBand=ctx.bodyArmBand;
const core=scripts.find(s=>s.includes('function poseSkeleton('));
const c=vm.createContext({module:{exports:{}}});vm.runInContext(arm,c);vm.runInContext(core,c);
export const scoring=c.module.exports;
export function landmarks(){
 const a=Array.from({length:33},()=>({x:.5,y:.12,z:0,visibility:1,presence:1}));
 for(const [i,x,y] of [[11,.38,.25],[12,.62,.25],[23,.43,.56],[24,.57,.56],[25,.43,.73],[26,.57,.73],[27,.42,.90],[28,.58,.90],[29,.42,.91],[30,.58,.91],[31,.42,.92],[32,.58,.92],[13,.29,.42],[14,.71,.42],[15,.26,.6],[16,.74,.6]])a[i]={x,y,z:0,visibility:1,presence:1};
 return a;
}
export function stateHarness(){
 const element={value:'',checked:false,dataset:{},style:{},setAttribute(){},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,classList:{toggle(){},add(){},remove(){}}};
 const storage=new Map();
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const context=vm.createContext({window:{},document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>element},localStorage,location:{search:'',hostname:''}});
 vm.runInContext(arm,context);vm.runInContext(core,context);vm.runInContext(scripts.find(s=>s.includes('const BC =')),context);
 vm.runInContext('renderResult=function(){};setStatus=function(){};renderInputsPanel=function(){};',context);
 return {w:context.window,context,storage,element};
}

export function pageFunction(name,globals={}){
 const source=scripts.find(s=>s.includes(`function ${name}(`));
 const start=source.indexOf(`function ${name}(`),end=source.indexOf('\n    }',start);
 return vm.runInNewContext(`(${source.slice(start-6,start)==='async '?'async ':''}${source.slice(start,end+6)})`,{BodyQuality:quality,...globals});
}
export function detectMultiple(){
 const out=[];const c=vm.createContext({module:{exports:{}},performance:{now:()=>0}});
 vm.runInContext(arm,c);vm.runInContext(worker,c);
 c.self={postMessage:r=>out.push(r)};
 c.lm=landmarks();
 vm.runInContext('poseLandmarker={detect(bitmap,cb){cb({landmarks:[lm,lm]});}}; analyze({id:1,bitmap:{width:1000,height:1000,close(){}}});',c);
 return out.find(r=>r.type==='result');
}
