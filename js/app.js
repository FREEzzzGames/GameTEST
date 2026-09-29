import { Platform } from "./platform.js";
import { navigate, back, setNavigationBridge } from "./core/router.js";
import { getState, setState } from "./core/state.js";
import { Storage } from "./core/storage.js";

window.FZG = window.FZG || {};
window.FZG.platform = Platform;
window.FZG.storage = Storage;
window.FZG.state = { get:getState, set:setState };

Platform.configure();
Platform.ready();
Platform.expand();

await import("./portal.js");

setNavigationBridge((screen, params)=>{
  const legacy=window.FZG.legacy;
  if(!legacy)return;
  if(screen==="home") legacy.showCategoryList?.(false);
  else if(screen==="chat") legacy.switchTab?.("guest");
  else if(screen==="category") legacy.openCategory?.(params.categoryId);
});

window.FZG.navigation = { navigate, back };

const tg=Platform.telegram();
if(tg?.BackButton){
  const syncBack=()=>{
    const screen=getState().screen;
    if(screen==="home") tg.BackButton.hide?.();
    else tg.BackButton.show?.();
  };
  tg.BackButton.onClick?.(()=>back());
  syncBack();
  window.FZG.state.subscribe?.(syncBack);
}

window.addEventListener("beforeunload",()=>{
  Storage.set("lastScreen",getState().screen);
});
