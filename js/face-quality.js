// Shared camera/upload quality contract. Coordinates use native image pixels.
// Keep the scoring crop unchanged: REF_RAW was calibrated on this exact square.
(function(root){
  const MIN_FACE_PX = 110;
  const GUIDE = { cx:50, cy:46, rx:20, ry:27, eyeY:40 };
  function faceCrop(lm, W, H){
    if (!lm || lm.length < 468 || !(W > 0 && H > 0)) return null;
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const p of lm){
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
      minX=Math.min(minX,p.x*W); minY=Math.min(minY,p.y*H);
      maxX=Math.max(maxX,p.x*W); maxY=Math.max(maxY,p.y*H);
    }
    const width=maxX-minX,height=maxY-minY,side=Math.max(width,height)*1.4;
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2-height*.06;
    if (!(side > 0)) return null;
    const x=cx-side/2,y=cy-side/2;
    return {x,y,side,cx,cy,minX,minY,maxX,maxY,width,height,
      inside:x>=0 && y>=0 && x+side<=W && y+side<=H};
  }
  function photoQuality(lm,W,H){
    const crop=faceCrop(lm,W,H);
    if (!crop) return {ok:false,message:'Could not measure this face (bad landmarks).'};
    const facePx=Math.hypot((lm[234].x-lm[454].x)*W,(lm[234].y-lm[454].y)*H);
    if (facePx < MIN_FACE_PX) return {ok:false,message:'Photo not scored: face too small ('+Math.round(facePx)+'px of detail). Use a sharper, higher-resolution headshot.'};
    if (!crop.inside) return {ok:false,message:'Photo not scored: leave more space around your face so the full crop fits inside the image.'};
    return {ok:true,crop,facePx};
  }
  // SVG viewBox=0 0 100 100 with xMidYMid meet: account for letterboxing
  // in portrait AND landscape, rather than treating guide coords as image %.
  function guidePoint(p,W,H){
    const side=Math.min(W,H);
    return {x:50+(p.x*W-W/2)*100/side,y:50+(p.y*H-H/2)*100/side};
  }
  function cameraQuality(lm,W,H,geo,framing){
    const quality=photoQuality(lm,W,H);
    if (!quality.ok) return quality;
    if (!geo || framing.band!=='pass') return {ok:false,message:'Face the camera square-on and level your eyes.'};
    const cheekR=guidePoint(lm[234],W,H),cheekL=guidePoint(lm[454],W,H);
    const top=guidePoint(lm[10],W,H),chin=guidePoint(lm[152],W,H);
    const eyes=[33,133,263,362].map(i=>guidePoint(lm[i],W,H));
    const cx=(cheekR.x+cheekL.x)/2,cy=(top.y+chin.y)/2;
    const eyeY=eyes.reduce((s,p)=>s+p.y,0)/4;
    const width=Math.abs(cheekL.x-cheekR.x),height=chin.y-top.y;
    if (Math.abs(cx-GUIDE.cx)>3 || Math.abs(cy-GUIDE.cy)>5)
      return {ok:false,message:'Center your face in the oval.'};
    if (width<28 || height<37) return {ok:false,message:'Move closer until your face fills the oval.'};
    if (width>42 || height>56) return {ok:false,message:'Move back until your face fits inside the oval.'};
    if ([cheekR,cheekL,top,chin].some(p=>Math.pow((p.x-GUIDE.cx)/(GUIDE.rx+2),2)+Math.pow((p.y-GUIDE.cy)/(GUIDE.ry+2),2)>1))
      return {ok:false,message:'Keep your whole face inside the oval.'};
    if (Math.abs(eyeY-GUIDE.eyeY)>3) return {ok:false,message:'Bring your eyes onto the red line.'};
    return {ok:true,anchor:{cx,cy,width,height,eyeY,yaw:geo.yawDeg,roll:geo.rollDeg}};
  }
  // Compare with the FIRST frame of the streak, so gradual drift cannot accumulate.
  function stable(a,b){
    return !!a && !!b && Math.hypot(a.cx-b.cx,a.cy-b.cy)<=1.5
      && Math.abs(a.eyeY-b.eyeY)<=1.5 && Math.abs(a.width-b.width)<=1.5
      && Math.abs(a.height-b.height)<=2 && Math.abs(a.yaw-b.yaw)<=2 && Math.abs(a.roll-b.roll)<=1.5;
  }
  function mirrorTensor(data,size){
    const out=new Float32Array(data.length),plane=size*size;
    for(let c=0;c<3;c++)for(let y=0;y<size;y++)for(let x=0;x<size;x++)
      out[c*plane+y*size+x]=data[c*plane+y*size+size-1-x];
    return out;
  }
  function consistent(raw,mirrorRaw,scoreFromRaw){
    const a=scoreFromRaw(raw),b=scoreFromRaw(mirrorRaw);
    return a!==null && b!==null && Math.abs(a-b)<=.25;
  }
  root.FaceQuality={MIN_FACE_PX,GUIDE,faceCrop,photoQuality,guidePoint,cameraQuality,stable,mirrorTensor,consistent};
})(globalThis);
