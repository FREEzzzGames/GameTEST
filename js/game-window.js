import { GAME_CARDS, GAME_LINKS, CATEGORIES } from "./portal-data/games.js?v=20260930e4";
import { LANG, GAME_TEXT, CATEGORY_TEXT } from "./portal-data/i18n.js?v=20260930e4";
import { gameLogoUrl } from "./portal-data/posters.js?v=20260930e4";

(() => {
  "use strict";

  const DEFAULT_GAME_ID="ancientearth";
  const S = { mode:"game", gameId:DEFAULT_GAME_ID, open:true, expanded:false, categoryId:null, page:0 };
  const PAGE_SIZE=4;
  const $=id=>document.getElementById(id);
  const byId=Object.fromEntries(GAME_CARDS.map(game=>[game.id,game]));
  const categoryById=Object.fromEntries(CATEGORIES.map(category=>[category.id,category]));
  const haptic=()=>window.FZG?.platform?.haptic?.("light");
  let currentLang=localStorage.getItem("freezzzLang")||"ru";
  if(!LANG[currentLang])currentLang="ru";

  const tr=key=>LANG[currentLang]?.[key]||LANG.ru?.[key]||key;
  const categoryText=id=>CATEGORY_TEXT[id]?.[currentLang]||categoryById[id]?.name||id;
  const gameText=(id,field)=>{
    const x=GAME_TEXT[id]?.[currentLang];
    if(x)return field==="genre"?x[0]:x[1];
    const g=byId[id];
    return field==="genre"?g?.genre||"GAME":g?.desc||"";
  };

  function host(){return $("gameWindow");}
  function frame(){return $("gameWindowFrame");}

  function setExpanded(value){
    const root=host();
    if(!root)return false;
    S.expanded=!!value;
    root.classList.toggle("is-expanded",S.expanded);
    root.setAttribute("aria-expanded",S.expanded?"true":"false");
    document.body.classList.toggle("game-window-expanded",S.expanded);
    window.dispatchEvent(new CustomEvent("freezzz:game-window",{detail:{open:S.open,expanded:S.expanded,gameId:S.gameId,mode:S.mode}}));
    haptic();
    return true;
  }

  function clearFrame(){
    const f=frame();
    if(f){f.src="about:blank";f.removeAttribute("title");}
  }

  function title(text){host()?.querySelector(".game-window-title")?.replaceChildren(document.createTextNode(text));}
  function genre(text){host()?.querySelector(".game-window-genre")?.replaceChildren(document.createTextNode(text));}
  function emoji(text){host()?.querySelector(".game-window-emoji")?.replaceChildren(document.createTextNode(text));}

  function renderCatalog(){
    const root=host();
    if(!root)return;
    clearFrame();
    S.mode=S.categoryId?"category":"catalog";
    S.gameId=null;
    S.open=false;
    S.page=0;
    setExpanded(false);

    root.classList.remove("has-game");
    root.classList.add("has-catalog");
    root.querySelector(".game-window-frame-wrap")?.classList.add("catalog-mode");
    root.querySelector(".game-window-empty")?.classList.add("hidden");
    root.querySelector(".game-window-loading")?.classList.add("hidden");
    root.querySelector(".game-window-fallback")?.classList.add("hidden");

    renderCatalogBody();
    window.dispatchEvent(new CustomEvent("freezzz:game-window",{detail:{open:false,expanded:false,gameId:null,mode:S.mode}}));
  }

  function renderCatalogBody(){
    const root=host();
    const wrap=root?.querySelector(".game-window-frame-wrap");
    if(!wrap)return;

    let panel=wrap.querySelector(".game-catalog");
    if(!panel){
      panel=document.createElement("div");
      panel.className="game-catalog";
      wrap.appendChild(panel);
    }

    if(!S.categoryId){
      panel.innerHTML=
        '<div class="game-catalog-title">🎮 <strong>ИГРЫ</strong><small>'+esc(tr("gamesCount")||"КАТАЛОГ")+'</small></div>'+
        '<div class="game-category-list">'+
        CATEGORIES.map(c=>
          '<button class="game-category-item" type="button" data-action-hint-target="category" data-game-category="'+esc(c.id)+'">'+
            '<span class="game-category-icon">'+esc(c.icon)+'</span>'+
            '<span class="game-category-copy"><strong>'+esc(categoryText(c.id))+'</strong><small>'+c.ids.length+' '+esc(c.ids.length===1?tr("oneGame"):tr("gamesCount"))+'</small></span>'+
            '<span class="game-category-arrow">›</span>'+
          '</button>'
        ).join("")+
        '</div>';
      title(tr("games")||"ИГРЫ");
      genre(currentLang==="de"?"KATEGORIE WÄHLEN":currentLang==="en"?"CHOOSE A CATEGORY":"ВЫБЕРИ КАТЕГОРИЮ");
      emoji("🎮");
      return;
    }

    const category=categoryById[S.categoryId];
    if(!category){S.categoryId=null;renderCatalog();return;}

    const pageCount=Math.max(1,Math.ceil(category.ids.length/PAGE_SIZE));
    S.page=Math.max(0,Math.min(pageCount-1,S.page));
    const start=S.page*PAGE_SIZE;
    const ids=category.ids.slice(start,start+PAGE_SIZE);

    panel.innerHTML=
      '<div class="game-catalog-category-head">'+
        '<button class="game-catalog-back" data-game-catalog-action="back" type="button" aria-label="Назад">‹</button>'+
        '<div><strong>'+esc(categoryText(category.id))+'</strong><small>'+esc(tr("swipeShort")||"СВАЙП ← →")+'</small></div>'+
      '</div>'+
      '<div class="game-catalog-grid">'+
        ids.map(id=>{
          const g=byId[id];
          return '<button class="game-catalog-card" type="button" data-action-hint-target="game" data-game-id="'+esc(id)+'">'+
            '<div class="game-catalog-art"><img src="'+esc(gameLogoUrl(id,byId))+'" alt="" loading="eager"><span>'+esc(g.emoji||"🎮")+'</span></div>'+
            '<div class="game-catalog-card-body"><strong>'+esc(g.title)+'</strong><small>'+esc(gameText(id,"desc"))+'</small><em>'+esc(gameText(id,"genre"))+'</em></div>'+
          '</button>';
        }).join("")+
      '</div>'+
      '<div class="game-catalog-pages">'+
        '<button data-game-catalog-action="prev" type="button" aria-label="Назад">‹</button>'+
        '<span>'+Array.from({length:pageCount},(_,i)=>'<i class="'+(i===S.page?"active":"")+'"></i>').join("")+'</span>'+
        '<button data-game-catalog-action="next" type="button" aria-label="Вперёд">›</button>'+
      '</div>';

    title(categoryText(category.id));
    genre((S.page+1)+" / "+pageCount);
    emoji(category.icon||"🎮");
  }

  function openCategory(id){
    if(!categoryById[id])return false;
    S.categoryId=id;
    S.page=0;
    S.mode="category";
    renderCatalog();
    window.FZG?.state?.set?.({screen:"category",categoryId:id,gameId:null});
    haptic();
    return true;
  }

  function openGame(gameId,options={}){
    const game=byId[gameId];
    const url=GAME_LINKS[gameId];
    const root=host(),f=frame();
    if(!game||!url||!root||!f)return false;

    S.gameId=gameId;
    S.open=true;
    S.mode="game";
    setExpanded(false);
    root.classList.remove("has-catalog");
    root.querySelector(".game-window-frame-wrap")?.classList.remove("catalog-mode");
    root.querySelector(".game-catalog")?.remove();

    title(game.title);
    genre(game.genre||"GAME");
    emoji(game.emoji||"🎮");

    root.querySelector(".game-window-empty")?.classList.add("hidden");
    root.querySelector(".game-window-fallback")?.classList.add("hidden");
    root.querySelector(".game-window-loading")?.classList.remove("hidden");

    const preserveFrame=options.preserveFrame===true && f.getAttribute("src")===url;
    if(!preserveFrame){
      clearFrame();
      requestAnimationFrame(()=>{f.src=url;});
    }
    window.FZG?.state?.set?.({screen:"home",categoryId:null,gameId});
    haptic();
    return true;
  }

  function closeGame(){
    if(S.mode==="game" && S.categoryId){
      renderCatalog();
      window.FZG?.state?.set?.({screen:"category",categoryId:S.categoryId,gameId:null});
      return true;
    }
    renderCatalog();
    window.FZG?.state?.set?.({screen:"home",categoryId:null,gameId:null});
    return true;
  }

  function openExternal(){
    const url=S.gameId?GAME_LINKS[S.gameId]:"";
    if(!url)return false;
    const tg=window.Telegram?.WebApp;
    try{
      if(tg?.openLink)tg.openLink(url);
      else window.open(url,"_blank","noopener,noreferrer");
    }catch(_){window.location.href=url;}
    haptic();
    return true;
  }

  function handleFrameLoad(){
    host()?.querySelector(".game-window-loading")?.classList.add("hidden");
  }

  function handleFrameError(){
    const root=host();
    root?.querySelector(".game-window-loading")?.classList.add("hidden");
    root?.querySelector(".game-window-fallback")?.classList.remove("hidden");
  }

  function back(){
    if(S.expanded){setExpanded(false);return true;}
    if(S.mode==="game"){closeGame();return true;}
    if(S.categoryId){
      S.categoryId=null;
      S.page=0;
      renderCatalog();
      window.FZG?.state?.set?.({screen:"home",categoryId:null,gameId:null});
      return true;
    }
    return false;
  }

  function bindCatalog(){
    const wrap=host()?.querySelector(".game-window-frame-wrap");
    if(!wrap)return;
    wrap.addEventListener("click",event=>{
      const category=event.target.closest("[data-game-category]")?.dataset.gameCategory;
      if(category){openCategory(category);return;}
      const game=event.target.closest("[data-game-id]")?.dataset.gameId;
      if(game){openGame(game);return;}
      const action=event.target.closest("[data-game-catalog-action]")?.dataset.gameCatalogAction;
      if(action==="back"){S.categoryId=null;S.page=0;renderCatalog();window.FZG?.state?.set?.({screen:"home",categoryId:null});return;}
      const categoryData=categoryById[S.categoryId];
      if(!categoryData)return;
      const count=Math.ceil(categoryData.ids.length/PAGE_SIZE);
      if(action==="prev")S.page=Math.max(0,S.page-1);
      if(action==="next")S.page=Math.min(count-1,S.page+1);
      if(action==="prev"||action==="next"){renderCatalogBody();haptic();}
    });
    let startX=0,startY=0,startTime=0;
    wrap.addEventListener("pointerdown",e=>{
      if(!S.categoryId||S.mode!=="category")return;
      startX=e.clientX;startY=e.clientY;startTime=Date.now();
    },{passive:true});
    wrap.addEventListener("pointerup",e=>{
      if(!S.categoryId||S.mode!=="category")return;
      const dx=e.clientX-startX,dy=e.clientY-startY,dt=Math.max(1,Date.now()-startTime);
      const velocity=Math.abs(dx)/dt;
      if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2&&(Math.abs(dx)>60||velocity>.35)){
        const count=Math.ceil(categoryById[S.categoryId].ids.length/PAGE_SIZE);
        const next=dx<0?S.page+1:S.page-1;
        if(next>=0&&next<count){S.page=next;renderCatalogBody();haptic();}
      }
    },{passive:true});
  }

  function setLanguage(lang){
    if(LANG[lang]){currentLang=lang;renderCatalogBody();}
  }

  function init(){
    const root=host();
    if(!root)return;
    root.addEventListener("click",event=>{
      const action=event.target.closest("[data-game-window-action]")?.dataset.gameWindowAction;
      if(action==="close"){event.preventDefault();closeGame();return;}
      if(action==="expand"){event.preventDefault();setExpanded(!S.expanded);return;}
      if(action==="external"){event.preventDefault();openExternal();return;}
    });
    root.addEventListener("dblclick",event=>{
      if(event.target.closest("button,a"))return;
      setExpanded(!S.expanded);
    },{passive:true});
    root.querySelector(".game-window-frame-wrap")?.addEventListener("dblclick",event=>{
      if(event.target.closest("button,a"))return;
      setExpanded(!S.expanded);
    },{passive:true});
    frame()?.addEventListener("load",handleFrameLoad,{passive:true});
    frame()?.addEventListener("error",handleFrameError,{passive:true});
    window.addEventListener("freezzz:language",e=>setLanguage(e.detail?.lang));
    window.FZG=window.FZG||{};
    window.FZG.gameWindow={
      openGame,
      closeGame,
      openCategory,
      showCatalog:()=>{S.categoryId=null;renderCatalog();},
      setLanguage,
      back,
      setExpanded,
      openExternal,
      getState:()=>({...S})
    };
    bindCatalog();
    if(DEFAULT_GAME_ID && GAME_LINKS[DEFAULT_GAME_ID]) openGame(DEFAULT_GAME_ID,{preserveFrame:true});
    else renderCatalog();
  }

  window.addEventListener("freezzz:game-window-open-category",e=>openCategory(e.detail?.id));
  init();

  function esc(value){
    return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
})();