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
  const [portalResult, liveResult] = await Promise.allSettled([
    import("./portal.js?v=20260930e4"),
    import("./live.js?v=20260930j")
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
    syncTelegramBackButton();
  }else{
    const err=portalResult.reason;
    console.error("FREEzzzGames portal module failed",err);
    window.FZG.portalModuleError=String(err?.stack||err);
    installEmergencyShell();
  }

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
}

function syncTelegramBackButton(){
  const tg=Platform.telegram();
  if(!tg?.BackButton)return;
  const sync=()=>{
    const screen=getState().screen;
    if(screen==="home") tg.BackButton.hide?.();
    else tg.BackButton.show?.();
  };
  tg.BackButton.onClick?.(()=>{
    const legacy=window.FZG.legacy;
    const screen=getState().screen;
    if(screen==="chat") legacy?.switchTab?.("games");
    else if(screen==="category") legacy?.returnToMainMenu?.();
    else back();
  });
  sync();
  subscribe(sync);
}

function installEmergencyShell(){
  const list=document.getElementById("categoryList");
  const view=document.getElementById("categoryView");
  const title=document.getElementById("categoryHeadTitle");
  const backBtn=document.getElementById("categoryBack");
  const categories=[
    ["worlds","🌌","ИНТЕРАКТИВНЫЕ МИРЫ",7],
    ["creative","🎨","ТВОРЧЕСТВО • МУЗЫКА • АРТ",7],
    ["puzzles","🧩","ПАЗЛЫ • ЛОГИКА",7],
    ["arcade","🕹️","АРКАДЫ • КЛАССИКА",10],
    ["sandbox","🌍","СИМУЛЯТОРЫ • ПЕСКОЧНИЦЫ",6],
    ["experimental","⚡","ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",5]
  ];
  if(list){
    list.querySelectorAll(".category-item").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const c=categories.find(x=>x[0]===btn.dataset.category);
        if(!c)return;
        list.classList.add("hidden");
        view?.classList.remove("hidden");
        if(title)title.textContent=c[2];
        setState({screen:"category",categoryId:c[0]});
      });
    });
  }
  backBtn?.addEventListener("click",()=>{
    view?.classList.add("hidden");
    list?.classList.remove("hidden");
    setState({screen:"home",categoryId:null});
  });
  document.getElementById("tabGuest")?.addEventListener("click",()=>{
    document.getElementById("gamesBrowser")?.classList.add("hidden");
    document.getElementById("guestView")?.classList.remove("hidden");
    setState({screen:"chat"});
  });
  document.getElementById("langToggleBtn")?.addEventListener("click",()=>{
    const b=document.getElementById("langToggleBtn");
    b.textContent=b.textContent==="RU"?"DE":b.textContent==="DE"?"EN":"RU";
  });
  document.getElementById("radioPlayBtn")?.addEventListener("click",()=>{
    document.getElementById("radioOverlay")?.classList.remove("hidden");
  });
  document.getElementById("radioCloseBtn")?.addEventListener("click",()=>{
    document.getElementById("radioOverlay")?.classList.add("hidden");
  });
}

window.FZG.navigation={navigate,back};
bootPortalModule();

window.addEventListener("beforeunload",()=>{
  Storage.set("lastScreen",getState().screen);
});
