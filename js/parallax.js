/* FREEzzzGames WORLD PARALLAX — visual-only navigation layer */
(() => {
  "use strict";
  const root=document.getElementById("mainPortal");
  const field=root?.querySelector(".space-depth");
  if(!root||!field)return;
  const layers=[...field.querySelectorAll(".space-layer")];
  const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const state={targetX:0,targetY:0,x:0,y:0,vx:0,vy:0,raf:0,dragging:false,moved:false,axis:null,startX:0,startY:0,lastX:0,lastY:0,lastT:0,maxX:90,maxY:70};

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  function geometry(){
    const r=root.getBoundingClientRect();
    state.maxX=Math.max(28,Math.min(120,r.width*.22));
    state.maxY=Math.max(24,Math.min(90,r.height*.16));
  }
  function interactiveTarget(target){
    if(!(target instanceof Element))return false;
    if(target.closest("button,a,input,textarea,select,iframe,[contenteditable='true']"))return true;
    return !!target.closest(".live-streamer-list,.live-youtube-frame,.chat-messages,.chat-layout,.games-carousel,.live-carousel,.category-list,[data-scroll-lock]");
  }
  function horizontalScroller(target){
    return target instanceof Element && !!target.closest(".games-carousel,.live-carousel,[data-horizontal-scroll]");
  }
  function ensureFrame(){if(reduced?.matches)return;if(!state.raf)state.raf=requestAnimationFrame(render)}
  function setTarget(x,y){state.targetX=clamp(x,-state.maxX,state.maxX);state.targetY=clamp(y,-state.maxY,state.maxY);ensureFrame()}
  function resetTarget(){state.targetX=0;state.targetY=0;state.vx=0;state.vy=0;ensureFrame()}
  function render(){
    state.x=lerp(state.x,state.targetX,.105);
    state.y=lerp(state.y,state.targetY,.105);
    layers.forEach((layer,i)=>{
      const d=(i+1)/layers.length;
      layer.style.setProperty("--parallax-x",(state.x*d).toFixed(2)+"px");
      layer.style.setProperty("--parallax-y",(state.y*d).toFixed(2)+"px");
    });
    if(Math.abs(state.x-state.targetX)<.08&&Math.abs(state.y-state.targetY)<.08){
      state.x=state.targetX;state.y=state.targetY;state.raf=0;return;
    }
    state.raf=requestAnimationFrame(render);
  }
  function onScroll(){
    if(reduced?.matches)return;
    const max=Math.max(1,root.scrollHeight-root.clientHeight);
    const progress=clamp(root.scrollTop/max,0,1);
    setTarget(state.targetX,(progress-.5)*state.maxY*.8);
  }
  function onPointerDown(e){
    if(e.pointerType==="mouse"&&e.button!==0)return;
    if(interactiveTarget(e.target)||horizontalScroller(e.target))return;
    state.dragging=true;state.moved=false;state.axis=null;
    state.startX=state.lastX=e.clientX;state.startY=state.lastY=e.clientY;
    state.lastT=performance.now();state.vx=state.vy=0;
    try{root.setPointerCapture(e.pointerId)}catch(_){}
  }
  function onPointerMove(e){
    if(!state.dragging)return;
    const dx=e.clientX-state.startX,dy=e.clientY-state.startY;
    if(!state.axis&&Math.hypot(dx,dy)>8){state.moved=true;state.axis=Math.abs(dx)>Math.abs(dy)?"x":"y"}
    if(!state.axis)return;
    const now=performance.now(),dt=Math.max(8,now-state.lastT);
    const mx=e.clientX-state.lastX,my=e.clientY-state.lastY;
    state.vx=mx/dt*16;state.vy=my/dt*16;state.lastX=e.clientX;state.lastY=e.clientY;
    if(state.axis==="x"){setTarget(state.targetX+mx*.78,state.targetY);if(Math.abs(mx)>Math.abs(my)+1)e.preventDefault()}
    else setTarget(state.targetX,state.targetY+my*.68);
    state.lastT=now;
  }
  function finishPointer(e){
    if(!state.dragging)return;
    state.dragging=false;try{root.releasePointerCapture(e.pointerId)}catch(_){}
    if(!state.moved){state.axis=null;return}
    if(state.axis==="x")state.targetX=clamp(state.targetX+state.vx*5,-state.maxX,state.maxX);
    else state.targetY=clamp(state.targetY+state.vy*4,-state.maxY,state.maxY);
    ensureFrame();window.setTimeout(resetTarget,180);state.axis=null;
  }
  function onWheel(e){
    if(interactiveTarget(e.target))return;
    const amount=Math.max(-34,Math.min(34,e.deltaY));
    setTarget(state.targetX,state.targetY-amount*.20);
    clearTimeout(onWheel.timer);onWheel.timer=setTimeout(resetTarget,140);
  }

  geometry();
  root.addEventListener("scroll",onScroll,{passive:true});
  root.addEventListener("pointerdown",onPointerDown,{passive:true});
  root.addEventListener("pointermove",onPointerMove,{passive:false});
  root.addEventListener("pointerup",finishPointer,{passive:true});
  root.addEventListener("pointercancel",finishPointer,{passive:true});
  root.addEventListener("wheel",onWheel,{passive:true});
  window.addEventListener("resize",geometry,{passive:true});
  window.visualViewport?.addEventListener("resize",geometry,{passive:true});
  ensureFrame();
  window.FZG=window.FZG||{};
  window.FZG.parallax={reset:resetTarget,setPosition:(x=0,y=0)=>setTarget(x,y)};
})();