(() => {
  "use strict";

  const ROOT="#mainPortal";
  const SELECTOR=[
    "button:not([disabled])",
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "iframe"
  ].join(",");

  let active=false;
  let lastDirection=0;
  let pointerTarget=null;

  const isVisible=el=>{
    if(!el || el.hidden)return false;
    const style=getComputedStyle(el);
    if(style.display==="none"||style.visibility==="hidden"||style.opacity==="0")return false;
    const r=el.getBoundingClientRect();
    return r.width>0 && r.height>0;
  };

  const isTextControl=el=>{
    if(!el)return false;
    if(el.isContentEditable)return true;
    const tag=el.tagName?.toLowerCase();
    return tag==="input"||tag==="textarea"||tag==="select";
  };

  const focusables=()=>{
    const root=document.querySelector(ROOT);
    if(!root)return [];
    return [...root.querySelectorAll(SELECTOR)].filter(el=>isVisible(el));
  };

  const rect=el=>el.getBoundingClientRect();

  function activate(){
    if(active)return;
    active=true;
    document.body.classList.add("tv-remote-active");
    window.FZG=window.FZG||{};
    window.FZG.tvRemoteActive=true;
  }

  function scoreCandidate(current,candidate,direction){
    const a=rect(current),b=rect(candidate);
    const acx=a.left+a.width/2, acy=a.top+a.height/2;
    const bcx=b.left+b.width/2, bcy=b.top+b.height/2;
    const dx=bcx-acx,dy=bcy-acy;

    if(direction==="left" && dx>=-2)return Infinity;
    if(direction==="right" && dx<=2)return Infinity;
    if(direction==="up" && dy>=-2)return Infinity;
    if(direction==="down" && dy<=2)return Infinity;

    const primary=(direction==="left"||direction==="right")?Math.abs(dx):Math.abs(dy);
    const secondary=(direction==="left"||direction==="right")?Math.abs(dy):Math.abs(dx);

    const overlap=(direction==="left"||direction==="right")
      ? Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))
      : Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));

    const size=(direction==="left"||direction==="right")?Math.min(a.height,b.height):Math.min(a.width,b.width);
    const aligned=overlap>Math.max(4,size*.35);

    return primary + secondary*.72 + (aligned?0:Math.max(35,primary*.55));
  }

  function move(direction){
    const list=focusables();
    if(!list.length)return false;

    let current=document.activeElement;
    if(!list.includes(current)){
      const root=document.querySelector(ROOT);
      const candidates=list.filter(el=>root?.contains(el));
      (candidates[0]||list[0])?.focus({preventScroll:true});
      current=document.activeElement;
      current?.scrollIntoView?.({block:"nearest",inline:"nearest"});
      return !!current;
    }

    let best=null,bestScore=Infinity;
    for(const candidate of list){
      if(candidate===current)continue;
      const score=scoreCandidate(current,candidate,direction);
      if(score<bestScore){bestScore=score;best=candidate;}
    }
    if(!best)return false;

    best.focus({preventScroll:true});
    best.scrollIntoView?.({block:"nearest",inline:"nearest"});
    return true;
  }

  function closeOverlays(){
    const legacy=window.FZG?.legacy;
    const gw=window.FZG?.gameWindow;
    const live=window.FZG?.live;

    if(gw?.getState?.().expanded){gw.setExpanded(false);return true;}
    if(gw?.getState?.().mode==="game"){gw.back?.();return true;}
    if(live?.back?.())return true;

    const modalSelectors=[
      "#playerProfileOverlay:not(.hidden) #playerProfileClose",
      "#avatarModal:not(.hidden) #closeModalBtn",
      "#achievementsModal:not(.hidden) #closeAchievementsBtn",
      "#radioOverlay:not(.hidden) #radioCloseBtn",
      "#dmThread:not(.hidden) #dmBackBtn",
      "#guestView:not(.hidden) #chatBackBtn"
    ];
    for(const selector of modalSelectors){
      const button=document.querySelector(selector);
      if(button){button.click();return true;}
    }

    if(window.FZG?.state?.get?.().screen==="chat"){
      legacy?.switchTab?.("games");
      return true;
    }
    if(gw?.getState?.().categoryId){
      gw.back?.();
      return true;
    }
    return false;
  }

  function handleKeyDown(event){
    const key=String(event.key||"");
    const code=Number(event.keyCode||event.which||0);
    const physical=String(event.code||"");
    const isBack =
      key==="Escape" ||
      key==="BrowserBack" ||
      key==="XF86Back" ||
      key==="Back" ||
      code===27 ||
      code===461 ||
      code===10009;
    const direction =
      key==="ArrowLeft" || key==="Left" || physical==="ArrowLeft" || code===37 ? "left" :
      key==="ArrowRight" || key==="Right" || physical==="ArrowRight" || code===39 ? "right" :
      key==="ArrowUp" || key==="Up" || physical==="ArrowUp" || code===38 ? "up" :
      key==="ArrowDown" || key==="Down" || physical==="ArrowDown" || code===40 ? "down" : "";

    const target=event.target;
    if(target?.tagName?.toLowerCase()==="iframe")return;
    if(isTextControl(target)){
      if(isBack){
        if(closeOverlays()){event.preventDefault();event.stopPropagation();}
      }
      return;
    }

    if(direction){
      activate();
      const now=Date.now();
      if(now-lastDirection<45)return;
      lastDirection=now;
      if(move(direction)){
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if(key==="Enter"||key==="Return"||key==="Select"||code===13){
      activate();
      const target=enterTarget();
      if(target){
        event.preventDefault();
        event.stopPropagation();
        target.focus?.({preventScroll:true});
        target.click();
      }
      return;
    }

    if(isBack){
      activate();
      if(closeOverlays()){
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  function rememberPointerTarget(event){
    const target=event.target;
    if(!(target instanceof Element))return;
    const candidate=target.closest("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])");
    if(candidate && isVisible(candidate))pointerTarget=candidate;
  }

  function enterTarget(){
    const current=document.activeElement;
    if(current && current!==document.body && isVisible(current)){
      if(current.tagName?.toLowerCase()!=="iframe")return current;
    }
    if(pointerTarget && isVisible(pointerTarget))return pointerTarget;
    return null;
  }

  function focusGameFrame(){
    const frame=document.getElementById("gameWindowFrame");
    if(!active||!frame)return false;
    try{
      frame.focus({preventScroll:true});
      return document.activeElement===frame;
    }catch(_){return false;}
  }

  window.FZG=window.FZG||{};
  window.FZG.tvRemote={
    isActive:()=>active,
    focusGameFrame
  };

  document.addEventListener("mouseover",rememberPointerTarget,true);
  document.addEventListener("pointerover",rememberPointerTarget,true);
  document.addEventListener("keydown",handleKeyDown,true);
})();