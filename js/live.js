import { directSources } from "./live-data/channels.js?v=20260930-live4";
import { createLivePlayer } from "./live-player.js?v=20260930-live4";

(() => {
  "use strict";

  const LIVE_API="https://freezzgames-live-monitor.onrender.com/api/live";
  const REFRESH_MS=300000;

  const S = {
    all: directSources(),
    selectedId: null,
    listOpen: false,
    loading:false,
    lastRefreshAt:null,
    lastError:null,
    refreshTimer:0
  };

  const $ = id => document.getElementById(id);
  const haptic = () => window.FZG?.platform?.haptic?.("light");

  const esc = value => String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");

  function openExternal(url){
    if(!url)return false;
    const tg=window.Telegram?.WebApp;
    try{
      if(tg?.openLink)tg.openLink(url);
      else window.open(url,"_blank","noopener,noreferrer");
    }catch(_){
      window.location.href=url;
    }
    haptic();
    return true;
  }

  function mergeRemote(remote){
    const byId=new Map((Array.isArray(remote)?remote:[]).map(item=>[item?.id,item]));
    S.all=S.all.map(local=>{
      const remoteItem=byId.get(local.id);
      if(!remoteItem)return local;
      return {
        ...local,
        ...remoteItem,
        url:remoteItem.channelUrl||remoteItem.url||local.url,
        sources:Array.isArray(remoteItem.sources)?remoteItem.sources:local.sources||[],
        live:remoteItem.live===true,
        sourceMode:remoteItem.sources?.some(s=>s?.live&&s?.embedUrl)?"live-embed":"direct-link"
      };
    });
  }

  async function refreshRemote(){
    if(S.loading)return false;
    S.loading=true;
    try{
      const signal=typeof AbortSignal?.timeout==="function"
        ? AbortSignal.timeout(8000)
        : (()=>{const c=new AbortController();setTimeout(()=>c.abort(),8000);return c.signal;})();
      const response=await fetch(LIVE_API,{
        method:"GET",
        cache:"no-store",
        headers:{Accept:"application/json"},
        signal
      });
      if(!response.ok)throw new Error("LIVE API "+response.status);
      const payload=await response.json();
      mergeRemote(payload?.streamers);
      S.lastRefreshAt=Date.now();
      S.lastError=null;
      renderList();

      if(S.selectedId){
        const selected=S.all.find(item=>item.id===S.selectedId);
        if(selected && selected.live && selected.sources?.some(source=>source?.live&&source?.embedUrl)){
          player.open(selected,{preserveExpanded:true});
        }
      }
      return true;
    }catch(error){
      S.lastError=String(error?.message||error);
      return false;
    }finally{
      S.loading=false;
    }
  }

  function emitOverlay(){
    window.dispatchEvent(new CustomEvent("freezzz:live-overlay",{
      detail:{
        open:S.listOpen,
        selectedId:S.selectedId,
        loading:S.loading,
        updatedAt:S.lastRefreshAt,
        error:S.lastError
      }
    }));
  }

  function renderList(){
    const host=$("liveStreamerList");
    if(!host)return;

    host.innerHTML=S.all.map(channel => {
      const isLive=channel.live===true && channel.sources?.some(source=>source?.live&&source?.embedUrl);
      return '<button class="live-list-row'+(isLive?" is-live":"")+'" type="button" data-live-list-id="'+esc(channel.id)+'">'+
        '<span class="live-list-avatar">'+esc(channel.avatar)+'</span>'+
        '<span class="live-list-main"><strong>'+esc(channel.name)+'</strong><small>'+esc(channel.category||"YouTube")+(isLive?" • LIVE":"")+'</small><em>'+esc(channel.description||"")+'</em></span>'+
      '</button>';
    }).join("");

    host.onclick=event=>{
      const button=event.target.closest("[data-live-list-id]");
      if(!button || !host.contains(button))return;
      const channel=S.all.find(item=>item.id===button.dataset.liveListId);
      if(!channel)return;
      closeList();
      select(channel.id,true);
    };
  }

  function renderIdle(){
    S.selectedId=null;
    player.close();
  }

  function select(id,user=false){
    const channel=S.all.find(item=>item.id===id);
    if(!channel)return false;
    S.selectedId=channel.id;
    player.open(channel);
    emitOverlay();
    if(user)haptic();
    return true;
  }

  function openList(){
    const panel=$("liveListPanel");
    if(!panel)return;
    S.listOpen=true;
    panel.classList.remove("hidden");
    renderList();
    emitOverlay();
    haptic();
  }

  function closeList(){
    const panel=$("liveListPanel");
    S.listOpen=false;
    panel?.classList.add("hidden");
    emitOverlay();
  }

  function backFromPlayer(){
    S.selectedId=null;
    player.close();
    emitOverlay();
    haptic();
  }

  const player=createLivePlayer({
    mount:$("liveMain"),
    haptic,
    onBack:backFromPlayer,
    openExternal
  });

  function syncVisibility(){
    const screen=window.FZG?.state?.get?.().screen||"home";
    const home=screen==="home";
    $("liveView")?.classList.toggle("hidden",!home);
    $("mainPortal")?.classList.toggle("live-home-mode",home);
    if(!home)closeList();
  }

  function init(){
    if(!$("liveView"))return;
    renderList();
    renderIdle();

    $("liveListBtn")?.addEventListener("click",()=>S.listOpen?closeList():openList());
    $("liveListBack")?.addEventListener("click",closeList);
    $("liveListClose")?.addEventListener("click",closeList);

    $("liveListPanel")?.addEventListener("click",event=>{
      if(event.target===$("liveListPanel"))closeList();
    });

    window.FZG?.state?.subscribe?.(syncVisibility);
    syncVisibility();

    refreshRemote();
    S.refreshTimer=window.setInterval(refreshRemote,REFRESH_MS);
  }

  window.FZG=window.FZG||{};
  window.FZG.live={
    openStreamer:id=>select(id,true),
    stop:renderIdle,
    select,
    refresh:refreshRemote,
    openExternal,
    getState:()=>({
      selectedId:S.selectedId,
      all:[...S.all],
      overlayOpen:S.listOpen,
      listOpen:S.listOpen,
      loading:S.loading,
      updatedAt:S.lastRefreshAt,
      lastError:S.lastError,
      player:player.getState()
    }),
    back:()=>{
      if(S.listOpen){closeList();haptic();return true;}
      if(S.selectedId){backFromPlayer();return true;}
      return false;
    }
  };

  init();
})();
