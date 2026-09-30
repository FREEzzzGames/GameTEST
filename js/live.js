import { directSources } from "./live-data/channels.js?v=20260930j";

(() => {
"use strict";

const S = {
  all: directSources(),
  selectedId: null,
  muted: true,
  listOpen: false
};

const $ = id => document.getElementById(id);
const haptic = () => window.FZG?.platform?.haptic?.("light");
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

function channelEmbedUrl(channel){
  if(!channel?.channelId) return "";
  return "https://www.youtube.com/embed/live_stream?channel=" +
    encodeURIComponent(channel.channelId) +
    "&autoplay=1&playsinline=1";
}

function renderList(){
  const host=$("liveStreamerList");
  if(!host)return;

  host.innerHTML=S.all.map(channel =>
    '<button class="live-list-row" type="button" data-live-list-id="'+esc(channel.id)+'">'+
      '<span class="live-list-avatar">'+esc(channel.avatar)+'</span>'+
      '<span class="live-list-main">'+
        '<strong>'+esc(channel.name)+'</strong>'+
        '<small>'+esc(channel.category||"YouTube")+'</small>'+
        '<em>'+esc(channel.shortDescription||"YouTube-канал")+'</em>'+
      '</span>'+
      '<span class="live-list-status catalog">YT</span>'+
    '</button>'
  ).join("");

  host.querySelectorAll("[data-live-list-id]").forEach(button=>{
    button.addEventListener("click",()=>{
      const channel=S.all.find(x=>x.id===button.dataset.liveListId);
      if(!channel)return;
      closeList();
      select(channel.id,true);
    });
  });
}

function renderIdle(){
  const main=$("liveMain");
  if(!main)return;
  main.innerHTML=
    '<div class="live-bot-stage" id="liveBotStage">'+
      '<div class="live-bot-bubble">ВЫБЕРИ СТРИМЕРА</div>'+
      '<div class="live-bot">🤖</div>'+
      '<div class="live-bot-floor">FREEzzzGames LIVE</div>'+
    '</div>';
}

function select(id,user=false){
  const channel=S.all.find(x=>x.id===id);
  if(!channel)return;

  S.selectedId=channel.id;
  S.muted=true;

  const main=$("liveMain");
  if(!main)return;

  const embed=channelEmbedUrl(channel);

  if(!embed){
    main.innerHTML=
      '<div class="live-empty">'+
        '<div class="live-empty-icon">📡</div>'+
        '<div class="live-empty-title">ПРОСМОТР НЕДОСТУПЕН</div>'+
        '<div class="live-empty-text">Для встроенного воспроизведения нужен ID YouTube-канала.</div>'+
      '</div>';
    if(user)haptic();
    return;
  }

  main.innerHTML=
    '<div class="live-video-frame">'+
      '<iframe class="live-video" src="'+esc(embed)+'" title="'+esc(channel.name)+' — LIVE" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="eager"></iframe>'+
      '<div class="live-video-shade">'+
        '<div class="live-streamer-badge"><span class="live-dot"></span> LIVE</div>'+
        '<button class="live-sound-btn" id="liveSoundBtn" type="button">'+(S.muted?"🔇":"🔊")+'</button>'+
      '</div>'+
      '<div class="live-streamer-info">'+
        '<div class="live-streamer-avatar">'+esc(channel.avatar)+'</div>'+
        '<div class="live-streamer-copy"><strong>'+esc(channel.name)+'</strong><span>'+esc(channel.category||"LIVE")+'</span></div>'+
      '</div>'+
    '</div>';

  $("liveSoundBtn")?.addEventListener("click",()=>{
    S.muted=!S.muted;
    $("liveSoundBtn").textContent=S.muted?"🔇":"🔊";
    haptic();
  });

  if(user)haptic();
}

function openList(){
  const panel=$("liveListPanel");
  if(!panel)return;
  S.listOpen=true;
  panel.classList.remove("hidden");
  haptic();
}

function closeList(){
  const panel=$("liveListPanel");
  S.listOpen=false;
  panel?.classList.add("hidden");
}

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

  $("liveListBtn")?.addEventListener("click",()=>{
    if(S.listOpen)closeList();
    else openList();
  });
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
  getState:()=>({
    selectedId:S.selectedId,
    all:[...S.all],
    overlayOpen:S.listOpen,
    listOpen:S.listOpen
  }),
  back:()=>{
    if(S.listOpen){ closeList(); haptic(); return true; }
    if(S.selectedId){ S.selectedId=null; renderIdle(); haptic(); return true; }
    return false;
  }
};

init();
})();