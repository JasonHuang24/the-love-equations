// Capture checks only; empirical score mappings and model preprocessing stay unchanged.
(function(root){
  const ANCHORS=[0,11,12,23,24,27,28];
  function trusted(p, floor=.3){
    return !!p && Number.isFinite(p.x) && Number.isFinite(p.y)
      && [p.visibility,p.presence].every(v=>v==null || (Number.isFinite(v) && v>=floor));
  }
  function bounds(lm,W,H){
    if (!lm || !Number.isFinite(W) || !Number.isFinite(H) || W<=0 || H<=0) return null;
    const points=lm.filter(p=>trusted(p) && p.x>=0 && p.x<=1 && p.y>=0 && p.y<=1);
    if(points.length<4)return null;
    const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x));
    const minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
    return {minX,maxX,minY,maxY,nativePx:Math.max((maxX-minX)*W,(maxY-minY)*H),fraction:Math.max(maxX-minX,maxY-minY)};
  }
  function photoQuality(lm,W,H){
    const b=bounds(lm,W,H);
    if(!b || b.nativePx<220 || b.fraction<.14)return {ok:false,message:'The subject is too small to read reliably. Use a sharper photo with at least 220 pixels of body detail, or step closer.'};
    return {ok:true,...b};
  }
  function guidePoint(p,W,H){const side=Math.min(W,H);return {x:50+(p.x-.5)*W/side*100,y:50+(p.y-.5)*H/side*100};}
  function cameraQuality(lm,W,H,q,arms){
    if(!q?.ok || q.framing!=='full' || q.band!=='pass')return {ok:false,message:'Stand straight, face forward, and include your feet.'};
    if(!photoQuality(lm,W,H).ok)return {ok:false,message:'Step closer or use a sharper camera.'};
    if(![...ANCHORS,13,14,15,16].every(i=>trusted(lm[i],.5)))return {ok:false,message:'Keep your head, arms and legs clearly visible.'};
    if(!arms?.ok || arms.waistArm || arms.hipArm)return {ok:false,message:'Arms a few inches out — keep your waist and hips clear.'};
    const p=ANCHORS.map(i=>guidePoint(lm[i],W,H));
    const cx=(p[1].x+p[2].x+p[3].x+p[4].x)/4;
    const feet=(p[5].y+p[6].y)/2;
    if(Math.abs(cx-50)>6)return {ok:false,message:'Move to the middle of the guide.'};
    if(feet<85 || feet>96)return {ok:false,message:'Move until your feet sit on the red line.'};
    if(p[0].y<6 || p[0].y>23)return {ok:false,message:'Step forward or back to fit head to feet in the guide.'};
    return {ok:true,message:'Hold still…'};
  }
  function stable(first,next,W,H){
    return !!first && ANCHORS.every(i=>trusted(first[i],.5) && trusted(next?.[i],.5)
      && Math.hypot((first[i].x-next[i].x)*W,(first[i].y-next[i].y)*H)/Math.min(W,H)<=.015);
  }
  root.BodyQuality={trusted,bounds,photoQuality,guidePoint,cameraQuality,stable};
})(globalThis);
