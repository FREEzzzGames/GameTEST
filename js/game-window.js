import { GAME_CARDS, GAME_LINKS } from "./portal-data/games.js?v=20260930e4";

(() => {
  "use strict";

  const S = { gameId:null, open:false, expanded:false };
  const $ = id => document.getElementById(id);
  const haptic = () => window.FZG?.platform?.haptic?.("light");
  const byId = Object.fromEntries(GAME_CARDS.map(game => [game.id, game]));

  function host(){ return $("gameWindow"); }
  function frame(){ return $("gameWindowFrame"); }

  function setExpanded(value){
    const root = host();
    if(!root) return false;
    S.expanded = !!value;
    root.classList.toggle("is-expanded", S.expanded);
    root.setAttribute("aria-expanded", S.expanded ? "true" : "false");
    document.body.classList.toggle("game-window-expanded", S.expanded);
    window.dispatchEvent(new CustomEvent("freezzz:game-window", {detail:{open:S.open,expanded:S.expanded,gameId:S.gameId}}));
    haptic();
    return true;
  }

  function clearFrame(){
    const f=frame();
    if(f){ f.src="about:blank"; f.removeAttribute("title"); }
  }

  function showEmpty(){
    const root=host();
    if(!root)return;
    root.classList.remove("has-game");
    root.querySelector(".game-window-empty")?.classList.remove("hidden");
    root.querySelector(".game-window-loading")?.classList.add("hidden");
    root.querySelector(".game-window-fallback")?.classList.add("hidden");
  }

  function showLoading(game){
    const root=host();
    if(!root)return;
    root.classList.add("has-game");
    root.querySelector(".game-window-empty")?.classList.add("hidden");
    root.querySelector(".game-window-loading")?.classList.remove("hidden");
    root.querySelector(".game-window-loading-title")?.replaceChildren(document.createTextNode(game.title));
    root.querySelector(".game-window-fallback")?.classList.add("hidden");
  }

  function openGame(gameId){
    const game=byId[gameId];
    const url=GAME_LINKS[gameId];
    const root=host();
    const f=frame();
    if(!game || !url || !root || !f) return false;

    S.gameId=gameId;
    S.open=true;
    setExpanded(false);
    root.querySelector(".game-window-title")?.replaceChildren(document.createTextNode(game.title));
    root.querySelector(".game-window-genre")?.replaceChildren(document.createTextNode(game.genre || "GAME"));
    root.querySelector(".game-window-emoji")?.replaceChildren(document.createTextNode(game.emoji || "🎮"));
    const external=root.querySelector("[data-game-window-external]");
    if(external) external.dataset.url=url;

    showLoading(game);
    f.src="about:blank";
    requestAnimationFrame(()=>{ f.src=url; });

    window.FZG?.state?.set?.({screen:"home",categoryId:null,gameId});
    window.FZG?.legacy?.showCategoryList?.(false);
    haptic();
    return true;
  }

  function closeGame(){
    const root=host();
    if(!root)return false;
    setExpanded(false);
    clearFrame();
    S.gameId=null;
    S.open=false;
    root.classList.remove("has-game");
    showEmpty();
    root.querySelector(".game-window-title")?.replaceChildren(document.createTextNode("GAME WINDOW"));
    root.querySelector(".game-window-genre")?.replaceChildren(document.createTextNode("ВЫБЕРИ ИГРУ В КАТАЛОГЕ"));
    root.querySelector(".game-window-emoji")?.replaceChildren(document.createTextNode("🎮"));
    window.dispatchEvent(new CustomEvent("freezzz:game-window", {detail:{open:false,expanded:false,gameId:null}}));
    haptic();
    return true;
  }

  function openExternal(){
    const url=S.gameId ? GAME_LINKS[S.gameId] : "";
    if(!url)return false;
    try{
      const tg=window.Telegram?.WebApp;
      if(tg?.openLink) tg.openLink(url);
      else window.open(url,"_blank","noopener,noreferrer");
    }catch(_){ window.location.href=url; }
    haptic();
    return true;
  }

  function handleFrameLoad(){
    host()?.querySelector(".game-window-loading")?.classList.add("hidden");
  }

  function handleFrameError(){
    const root=host();
    if(!root)return;
    root.querySelector(".game-window-loading")?.classList.add("hidden");
    root.querySelector(".game-window-fallback")?.classList.remove("hidden");
  }

  let lastTap=0;
  function handleTapSurface(event){
    if(event.target.closest("button,a"))return;
    const now=Date.now();
    if(now-lastTap<360){
      setExpanded(!S.expanded);
      lastTap=0;
      return;
    }
    lastTap=now;
    window.setTimeout(()=>{ if(Date.now()-lastTap>=340) lastTap=0; },380);
  }

  function back(){
    if(!S.open)return false;
    if(S.expanded){ setExpanded(false); return true; }
    closeGame();
    return true;
  }

  function init(){
    const root=host();
    if(!root)return;

    root.addEventListener("click",event=>{
      const action=event.target.closest("[data-game-window-action]")?.dataset.gameWindowAction;
      if(action==="close"){ event.preventDefault(); closeGame(); return; }
      if(action==="expand"){ event.preventDefault(); setExpanded(!S.expanded); return; }
      if(action==="external"){ event.preventDefault(); openExternal(); return; }
    });

    root.addEventListener("dblclick",handleTapSurface,{passive:true});
    root.querySelector(".game-window-frame-wrap")?.addEventListener("dblclick",handleTapSurface,{passive:true});
    root.querySelector(".game-window-hitbar")?.addEventListener("dblclick",handleTapSurface,{passive:true});
    frame()?.addEventListener("load",handleFrameLoad,{passive:true});
    frame()?.addEventListener("error",handleFrameError,{passive:true});

    window.FZG?.state?.subscribe?.(state=>{
      if(state.screen!=="home" && S.open) closeGame();
    });

    showEmpty();
  }

  window.FZG=window.FZG||{};
  window.FZG.gameWindow={openGame,closeGame,back,setExpanded,openExternal,getState:()=>({...S})};
  init();
})();