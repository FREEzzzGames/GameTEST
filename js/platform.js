const webApp = () => window.Telegram?.WebApp || null;

const syncTelegramViewport = tg => {
  if(!tg) return;
  const root=document.documentElement;
  const vv=window.visualViewport;
  const viewportHeight=Number(tg.viewportHeight)||Number(vv?.height)||window.innerHeight;
  const stableHeight=Number(tg.viewportStableHeight)||viewportHeight;
  const viewportWidth=Number(vv?.width)||window.innerWidth;
  const safe=tg.safeAreaInset||{};
  const content=tg.contentSafeAreaInset||{};
  const set=(name,value)=>root.style.setProperty(name,Math.max(0,Number(value)||0)+"px");
  root.style.setProperty("--tg-viewport-height",Math.max(1,viewportHeight)+"px");
  root.style.setProperty("--tg-viewport-stable-height",Math.max(1,stableHeight)+"px");
  root.style.setProperty("--tg-viewport-width",Math.max(1,viewportWidth)+"px");
  set("--tg-safe-area-inset-top",safe.top);
  set("--tg-safe-area-inset-right",safe.right);
  set("--tg-safe-area-inset-bottom",safe.bottom);
  set("--tg-safe-area-inset-left",safe.left);
  set("--tg-content-safe-area-inset-top",content.top);
  set("--tg-content-safe-area-inset-right",content.right);
  set("--tg-content-safe-area-inset-bottom",content.bottom);
  set("--tg-content-safe-area-inset-left",content.left);
};

let configuredTelegram=null;
let telegramHandlersInstalled=false;

const installTelegramViewportEvents = tg => {
  if(!tg || telegramHandlersInstalled)return;
  telegramHandlersInstalled=true;
  const sync=()=>syncTelegramViewport(tg);
  ["viewportChanged","safeAreaChanged","contentSafeAreaChanged","themeChanged","fullscreenChanged"].forEach(event=>{
    try{tg.onEvent?.(event,sync);}catch(_){}
  });
  window.addEventListener("resize",sync,{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(sync,80),{passive:true});
  window.visualViewport?.addEventListener("resize",sync,{passive:true});
  sync();
};

export const Platform = {
  isTelegram(){ return !!webApp(); },
  telegram(){ return webApp(); },
  ready(){
    try{ webApp()?.ready?.(); }catch(_){}
  },
  expand(){
    try{ webApp()?.expand?.(); }catch(_){}
  },
  requestFullscreen(){
    try{
      const tg=webApp();
      if(typeof tg?.requestFullscreen==="function"){ tg.requestFullscreen(); return true; }
    }catch(_){}
    return false;
  },
  exitFullscreen(){
    try{
      const tg=webApp();
      if(typeof tg?.exitFullscreen==="function"){ tg.exitFullscreen(); return true; }
    }catch(_){}
    return false;
  },
  isFullscreen(){
    return !!webApp()?.isFullscreen;
  },
  lockOrientation(){
    try{
      const tg=webApp();
      if(typeof tg?.lockOrientation==="function"){tg.lockOrientation();return true;}
    }catch(_){}
    return false;
  },
  unlockOrientation(){
    try{
      const tg=webApp();
      if(typeof tg?.unlockOrientation==="function"){tg.unlockOrientation();return true;}
    }catch(_){}
    return false;
  },
  haptic(style="light"){
    try{ webApp()?.HapticFeedback?.impactOccurred?.(style); }catch(_){}
  },
  openLink(url){
    if(!url)return;
    try{
      const tg=webApp();
      if(tg?.openLink) tg.openLink(url);
      else window.open(url,"_blank","noopener,noreferrer");
    }catch(_){ window.location.href=url; }
  },
  configure(){
    const tg=webApp();
    if(!tg)return;
    configuredTelegram=tg;
    try{
      tg.ready?.();
      tg.expand?.();
      const theme=tg.themeParams||{};
      const header=theme.header_bg_color||theme.bg_color||"#17212b";
      const background=theme.bg_color||"#000000";
      tg.setHeaderColor?.(header);
      tg.setBackgroundColor?.(background);
      if(theme.bottom_bar_bg_color)tg.setBottomBarColor?.(theme.bottom_bar_bg_color);
      document.documentElement.style.setProperty("--telegram-header-color",header);
      document.documentElement.style.setProperty("--telegram-bg-color",background);
      installTelegramViewportEvents(tg);
    }catch(_){}
  },
  syncViewport(){
    if(configuredTelegram)syncTelegramViewport(configuredTelegram);
  }
};
