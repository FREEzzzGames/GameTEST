import { Platform } from "./platform.js";
import { navigate, back, setNavigationBridge } from "./core/router.js";
import { getState, setState, subscribe } from "./core/state.js";
import { Storage } from "./core/storage.js";

window.FZG = window.FZG || {};
window.FZG.platform = Platform;
window.FZG.storage = Storage;
window.FZG.state = { get:getState, set:setState, subscribe };

Platform.configure();
Platform.ready();
Platform.expand();

async function bootPortalModule(){
  // LIVE must boot independently. A failure inside the large legacy portal
  // module must never prevent the LIVE module from loading and polling.
  const [portalResult, liveResult, parallaxResult, streamerParallaxResult, gameWindowResult, tvRemoteResult] = await Promise.allSettled([
    import("./portal.js?v=20260930e12"),
    import("./live.js?v=20260930-live-bot2"),
    import("./parallax.js?v=20260930a"),
    import("./streamer-menu-parallax.js?v=20260930e"),
    import("./game-window.js?v=20260930-gamecatalog10"),
    import("./tv-remote.js?v=20260930-tv1")
  ]);

  if(portalResult.status==="fulfilled"){
    window.FZG.portalModuleReady=true;
    setNavigationBridge((screen, params)=>{
      const legacy=window.FZG.legacy;
      if(!legacy)return;
      if(screen==="home") legacy.showCategoryList?.(false);
      else if(screen==="chat") legacy.switchTab?.("guest");
      else if(screen==="category") legacy.openCategory?.(params.categoryId);
    });
  }else{
    const err=portalResult.reason;
    console.error("FREEzzzGames portal module failed",err);
    window.FZG.portalModuleError=String(err?.stack||err);
    installEmergencyShell();
  }



  if(gameWindowResult.status==="fulfilled"){
    window.FZG.gameWindowModuleReady=true;
  }else{
    const err=gameWindowResult.reason;
    console.error("FREEzzzGames GAME WINDOW module failed",err);
    window.FZG.gameWindowModuleError=String(err?.stack||err);
  }

  if(tvRemoteResult.status==="fulfilled") window.FZG.tvRemoteModuleReady=true;
  else console.warn("FREEzzzGames TV remote module unavailable",tvRemoteResult.reason);

  if(parallaxResult.status==="rejected") console.warn("FREEzzzGames parallax layer unavailable",parallaxResult.reason);
  if(streamerParallaxResult.status==="rejected") console.warn("FREEzzzGames streamer menu parallax unavailable",streamerParallaxResult.reason);
  if(liveResult.status==="fulfilled"){
    window.FZG.liveModuleReady=true;
  }else{
    const err=liveResult.reason;
    console.error("FREEzzzGames LIVE module failed",err);
    window.FZG.liveModuleError=String(err?.stack||err);
    const main=document.getElementById("liveMain");
    if(main){
      main.innerHTML='<div class="live-empty"><div class="live-empty-icon">⚠️</div><div class="live-empty-title">LIVE-МОДУЛЬ НЕ ЗАПУСТИЛСЯ</div><div class="live-empty-text">Попробуйте обновить приложение.</div></div>';
    }
  }

  // Telegram BackButton is an application-level transport for LIVE/GAME/route state.
  // Register it independently from the legacy portal module so optional portal failures
  // cannot break the working LIVE/GAME navigation chain.
  syncTelegramBackButton();
}

function syncTelegramBackButton(){
  const tg=Platform.telegram();
  if(!tg?.BackButton)return;

  const sync=()=>{
    const screen=getState().screen;
    const liveOverlayOpen=!!window.FZG.live?.getState?.().overlayOpen;
    const gameWindow=window.FZG.gameWindow?.getState?.();
    const gameWindowActive=!!gameWindow?.open;
    if(screen==="home" && !liveOverlayOpen && !gameWindowActive) tg.BackButton.hide?.();
    else tg.BackButton.show?.();
  };

  tg.BackButton.onClick?.(()=>{
    if(window.FZG.live?.back?.()) return;
    if(window.FZG.gameWindow?.back?.()) return;

    const legacy=window.FZG.legacy;
    const screen=getState().screen;
    if(screen==="chat") legacy?.switchTab?.("games");
    else if(screen==="category") legacy?.returnToMainMenu?.();
    else back();
  });

  window.addEventListener("freezzz:live-overlay", sync);
  window.addEventListener("freezzz:game-window", sync);
  sync();
  subscribe(sync);
}

function installEmergencyShell(){
  const gw=window.FZG?.gameWindow;
  if(gw?.showCatalog){
    gw.showCatalog();
    return;
  }
  console.error("FREEzzzGames: GAME WINDOW module unavailable");
}

window.FZG.navigation={navigate,back};
bootPortalModule();

window.addEventListener("beforeunload",()=>{
  Storage.set("lastScreen",getState().screen);
});
