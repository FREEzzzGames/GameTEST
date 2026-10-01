import { Platform } from "./platform.js?v=20260930-platform2";
import { navigate, back, setNavigationBridge } from "./core/router.js";
import { getState, setState, subscribe } from "./core/state.js";
import { Storage } from "./core/storage.js";

window.FZG = window.FZG || {};
window.FZG.platform = Platform;
window.FZG.storage = Storage;
window.FZG.state = { get:getState, set:setState, subscribe };

Platform.configure();

async function bootPortalModule(){
  // LIVE must boot independently. A failure inside the large legacy portal
  // module must never prevent the independent LIVE module from loading.
  const [portalResult, liveResult, parallaxResult, streamerParallaxResult, gameWindowResult, tvRemoteResult] = await Promise.allSettled([
    import("./portal.js?v=20260930e17"),
    import("./live.js?v=20260930-live-streamer-slot3"),
    import("./parallax.js?v=20260930a"),
    import("./streamer-menu-parallax.js?v=20260930e"),
    import("./game-window.js?v=20260930-gamecatalog16"),
    import("./tv-remote.js?v=20260930-tv4")
  ]);

  if(portalResult.status==="fulfilled"){
    window.FZG.portalModuleReady=true;
    // HOME is the only cold-start screen. Do not restore CHAT or another
    // transient surface after a reload; CHAT must always be user-opened.
    requestAnimationFrame(()=>{
      try{
        window.FZG.legacy?.switchTab?.("games");
        setState({screen:"home",categoryId:null,gameId:null,modal:null});
      }catch(e){
        const guest=document.getElementById("guestView");
        const media=document.getElementById("homeMediaRow");
        const achievements=document.getElementById("achievementsView");
        guest?.classList.add("hidden");
        media?.classList.remove("hidden","is-hidden");
        achievements?.classList.add("hidden");
      }
    });
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
      main.innerHTML='<div class="live-empty"><div class="live-empty-title">LIVE-МОДУЛЬ НЕ ЗАПУСТИЛСЯ</div><div class="live-empty-text">Попробуйте обновить приложение.</div></div>';
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


// -----------------------------------------------------------------------------
// SERVICE UI MODE BRIDGE
// The developer/user switch must NEVER navigate, reload, or replace the page.
// It only changes interface visibility and restores the HOME surface.
// This is intentionally defensive so older/newer developer panels can use
// different selectors without breaking the portal.
// -----------------------------------------------------------------------------
(function installInterfaceModeBridge(){
  const USER_MODE_KEY="freezzzInterfaceMode";

  const hideDeveloperSurfaces=()=>{
    document.querySelectorAll(
      '[data-dev-only], .developer-only, .dev-only, #developerOverlay, #developerPanel, .developer-panel, .dev-panel'
    ).forEach(el=>{
      el.classList.add("hidden");
      el.setAttribute("aria-hidden","true");
    });
  };

  const showUserSurfaces=()=>{
    document.querySelectorAll(
      '[data-user-only], .user-only, #userInterface, #userShell, .user-shell'
    ).forEach(el=>{
      el.classList.remove("hidden","is-hidden");
      el.setAttribute("aria-hidden","false");
    });
  };

  const closeTransientSurfaces=()=>{
    document.querySelectorAll(
      '.modal-overlay:not(#ageGate), .player-profile-overlay, .radio-overlay, .developer-overlay, .dev-overlay'
    ).forEach(el=>el.classList.add("hidden"));

    document.body.classList.remove(
      "developer-mode","dev-mode","developer-open","is-developer",
      "developer-view","interface-developer"
    );
    document.documentElement.classList.remove(
      "developer-mode","dev-mode","developer-open","is-developer",
      "developer-view","interface-developer"
    );
  };

  function restoreUserMode(){
    try{
      localStorage.setItem(USER_MODE_KEY,"user");
      closeTransientSurfaces();
      hideDeveloperSurfaces();
      showUserSurfaces();

      // Restore the canonical HOME surface without a navigation/reload.
      window.FZG?.gameWindow?.closeGame?.();
      window.FZG?.gameWindow?.showCatalog?.();
      window.FZG?.live?.back?.();

      window.FZG?.legacy?.switchTab?.("games");
      window.FZG?.legacy?.showCategoryList?.(false);

      const guest=document.getElementById("guestView");
      const media=document.getElementById("homeMediaRow");
      const live=document.getElementById("liveView");
      const game=document.getElementById("gameWindow");
      const achievements=document.getElementById("achievementsView");

      guest?.classList.add("hidden","is-hidden");
      media?.classList.remove("hidden","is-hidden");
      live?.classList.remove("hidden","is-hidden");
      game?.classList.remove("hidden","is-hidden");
      achievements?.classList.add("hidden","is-hidden");

      setState({
        screen:"home",
        categoryId:null,
        gameId:null,
        modal:null,
        chat:{mode:"rooms",room:"main",userId:null},
        radio:{open:false,playing:false}
      });

      window.FZG?.platform?.ready?.();
      window.FZG?.platform?.expand?.();

      window.dispatchEvent(new CustomEvent("freezzz:interface-mode",{
        detail:{mode:"user"}
      }));
      window.dispatchEvent(new CustomEvent("freezzz:user-mode-restored"));
    }catch(error){
      console.error("FREEzzzGames: failed to restore user mode",error);
      // Last-resort DOM recovery. Still no navigation and no reload.
      document.getElementById("guestView")?.classList.add("hidden");
      document.getElementById("homeMediaRow")?.classList.remove("hidden","is-hidden");
      document.getElementById("liveView")?.classList.remove("hidden","is-hidden");
      document.getElementById("gameWindow")?.classList.remove("hidden","is-hidden");
    }
    return false;
  }

  function restoreDeveloperMode(){
    localStorage.setItem(USER_MODE_KEY,"developer");
    document.body.classList.add("developer-mode");
    document.documentElement.classList.add("developer-mode");
    document.querySelectorAll(
      '[data-dev-only], .developer-only, .dev-only, #developerOverlay, #developerPanel, .developer-panel, .dev-panel'
    ).forEach(el=>{
      el.classList.remove("hidden","is-hidden");
      el.setAttribute("aria-hidden","false");
    });
    window.dispatchEvent(new CustomEvent("freezzz:interface-mode",{
      detail:{mode:"developer"}
    }));
  }

  const userSelector=[
    '[data-switch-user]','#switchToUserBtn','#userModeBtn',
    '.switch-user-mode','.developer-user-toggle',
    '[data-interface-mode="user"]'
  ].join(",");

  const devSelector=[
    '[data-switch-developer]','#switchToDeveloperBtn','#developerModeBtn',
    '.switch-developer-mode','[data-interface-mode="developer"]'
  ].join(",");

  // Capture phase guarantees that an old handler cannot navigate/reload first.
  document.addEventListener("click",event=>{
    const userButton=event.target?.closest?.(userSelector);
    if(userButton){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      restoreUserMode();
      return;
    }

    const devButton=event.target?.closest?.(devSelector);
    if(devButton){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      restoreDeveloperMode();
    }
  },true);

  window.FZG=window.FZG||{};
  window.FZG.interfaceMode={
    get:()=>localStorage.getItem(USER_MODE_KEY)||"user",
    user:restoreUserMode,
    developer:restoreDeveloperMode
  };

  // If the previous click stored USER mode, repair a blank/hidden shell on boot.
  if(localStorage.getItem(USER_MODE_KEY)==="user"){
    requestAnimationFrame(()=>setTimeout(restoreUserMode,0));
  }
})();

window.FZG.navigation={navigate,back};
bootPortalModule();

window.addEventListener("beforeunload",()=>{
  Storage.set("lastScreen",getState().screen);
});
