import { directSources } from "./live-data/channels.js?v=20260930-live";
import { createLivePlayer } from "./live-player.js?v=20260930-live";

(() => {
  "use strict";

  const S = {
    all: directSources(),
    selectedId: null,
    listOpen: false
  };

  const $ = id => document.getElementById(id);
  const haptic = () => window.FZG?.platform?.haptic?.("light");

  const esc = value => String(value ?? "").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

  function emitOverlay(){
    window.dispatchEvent(new CustomEvent("freezzz:live-overlay",{
      detail:{open:S.listOpen,selectedId:S.selectedId}
    }));
  }

  function openExternal(channel){
    if(!channel?.url)return false;
    try{
      const tg=window.Telegram?.WebApp;
      if(tg?.openLink) tg.openLink(channel.url);
      else window.open(channel.url,"_blank","noopener,noreferrer");
    }catch(_){
      window.location.href=channel.url;
    }
    haptic();
    return true;
  }

  function renderList(){
    const host=$("liveStreamerList");
    if(!host)return;

    host.innerHTML=S.all.map(channel =>
      '<button class="live-list-row" type="button" data-live-list-id="'+esc(channel.id)+'">'+
        '<span class="live-list-avatar">'+esc(channel.avatar)+'</span>'+
        '<span class="live-list-main"><strong>'+esc(channel.name)+'</strong><small>'+esc(channel.category||"YouTube")+'</small><em>'+esc(channel.description||"")+'</em></span>'+
        '<span class="live-list-status">LIVE</span>'+
      '</button>'
    ).join("");

    host.querySelectorAll("[data-live-list-id]").forEach(button=>{
      button.addEventListener("click",()=>{
        const channel=S.all.find(item=>item.id===button.dataset.liveListId);
        if(!channel)return;
        closeList();
        select(channel.id,true);
      });
    });
  }

  function renderIdle(){
    S.selectedId=null;
    player.close();
  }

  function select(id,user=false){
    const channel=S.all.find(item=>item.id===id);
    if(!channel)return;
    S.selectedId=channel.id;
    player.open(channel);
    emitOverlay();
    if(user)haptic();
  }

  function openList(){
    const panel=$("liveListPanel");
    if(!panel)return;
    S.listOpen=true;
    panel.classList.remove("hidden");
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
    onExternal:()=>{}
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
  }

  window.FZG=window.FZG||{};
  window.FZG.live={
    openStreamer:id=>select(id,true),
    stop:renderIdle,
    select,
    getState:()=>({selectedId:S.selectedId,all:[...S.all],overlayOpen:S.listOpen,listOpen:S.listOpen}),
    back:()=>{
      if(S.listOpen){closeList();haptic();return true;}
      if(S.selectedId){backFromPlayer();return true;}
      return false;
    }
  };

  init();
})();
