import { directSources } from "./live-data/channels.js?v=20260930e8";

(() => {
"use strict";

const cfg=Object.assign({
  endpoint:"https://freezzgames-live-monitor.onrender.com/api/live",
  pollMs:300000
},window.FZG_LIVE_CONFIG||{});

const STATIC_SOURCES=directSources();
const S={all:STATIC_SOURCES,online:[],selectedId:null,muted:true,loading:false,connectionState:"idle",lastError:""};
let retryTimer=null;

const $=id=>document.getElementById(id);
const h=()=>window.FZG?.platform?.haptic?.("light");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

function score(x){
  return Number(x?.qualityScore||0)*.42+
    Number(x?.trafficScore||0)*.28+
    Number(x?.stabilityScore||0)*.22+
    Number(x?.latencyScore||0)*.08;
}

function source(s){
  return [...(s.sources||[])]
    .filter(x=>x.live&&x.embedUrl)
    .sort((a,b)=>score(b)-score(a))[0]||null;
}

function shuffle(a){
  a=[...a];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function normalize(payload){
  const a=Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.streamers)
      ? payload.streamers
      : [];

  return a.map(raw=>{
    const x={
      ...raw,
      id:String(raw?.id||""),
      name:String(raw?.name||"Стример"),
      avatar:String(raw?.avatar||"🎮"),
      game:String(raw?.game||""),
      category:String(raw?.category||""),
      live:!!raw?.live,
      liveStartedAt:raw?.liveStartedAt||null,
      lastStreamAt:raw?.lastStreamAt||null,
      lastStreamTitle:String(raw?.lastStreamTitle||""),
      previewUrl:String(raw?.previewUrl||""),
      channelUrl:String(raw?.channelUrl||""),
      sources:Array.isArray(raw?.sources)?raw.sources:[]
    };
    x.selectedSource=source(x);
    return x;
  }).filter(x=>x.id);
}

function mergePayloads(registryPayload,livePayload){
  const registryAvailable=registryPayload!==null;
  const liveAvailable=livePayload!==null;
  const base=registryAvailable?normalize(registryPayload):normalize(S.all);
  const live=liveAvailable?normalize(livePayload):normalize(S.all);
  const map=new Map(base.map(x=>[x.id,x]));

  for(const x of live){
    const prev=map.get(x.id)||{};
    map.set(x.id,{...prev,...x});
  }

  if(!liveAvailable){
    for(const prev of normalize(S.all)){
      const current=map.get(prev.id);
      if(current){
        map.set(prev.id,{
          ...current,
          live:prev.live,
          liveStartedAt:prev.liveStartedAt,
          sources:prev.sources,
          lastStreamTitle:prev.lastStreamTitle
        });
      }
    }
  }

  return [...map.values()].map(x=>{
    x.selectedSource=source(x);
    return x;
  });
}

function fmt(v){
  try{
    return new Intl.DateTimeFormat("ru-RU",{
      day:"2-digit",month:"2-digit",year:"numeric",
      hour:"2-digit",minute:"2-digit"
    }).format(new Date(v));
  }catch{
    return String(v);
  }
}

function empty(){
  const m=$("liveMain");
  if(m)m.innerHTML='<div class="live-empty"><div class="live-empty-icon">📡</div><div class="live-empty-title">СЕЙЧАС НЕТ ТРАНСЛЯЦИЙ</div><div class="live-empty-text">Зарегистрированные каналы проверяются автоматически.</div></div>';
  if($("liveCarousel"))$("liveCarousel").innerHTML="";
}

function connectionError(message){
  const m=$("liveMain");
  if(m)m.innerHTML='<div class="live-empty"><div class="live-empty-icon">⚠️</div><div class="live-empty-title">LIVE-СЕРВЕР НЕДОСТУПЕН</div><div class="live-empty-text">Связь с сервером трансляций временно отсутствует. Попробуем снова автоматически.</div><div class="live-empty-text" style="opacity:.55">'+esc(message||"connection error")+'</div></div>';
  if($("liveCarousel"))$("liveCarousel").innerHTML="";
}

function setConnectionState(state,error=""){
  S.connectionState=state;
  S.lastError=error||"";
  document.getElementById("liveView")?.setAttribute("data-live-state",state);
}

function main(s){
  const m=$("liveMain");
  if(!m){
    return;
  }

  if(!s){
    empty();
    return;
  }

  if(!s.selectedSource){
    if(s.previewUrl){
      m.innerHTML='<div class="live-video-frame live-preview-frame"><a class="live-preview-link" href="'+esc(s.channelUrl||"#")+'" target="_blank" rel="noopener noreferrer"><img class="live-preview-image" src="'+esc(s.previewUrl)+'" alt="'+esc(s.name)+'"><span class="live-preview-shade"><span class="live-preview-badge">SOURCE</span><strong>'+esc(s.name)+'</strong><small>'+esc(s.category||"LIVE")+'</small><span class="live-preview-open">ОТКРЫТЬ ЭФИР ↗</span></span></a></div>';
      return;
    }
    empty();
    return;
  }

  const u=esc(s.selectedSource.embedUrl);
  m.innerHTML='<div class="live-video-frame"><iframe class="live-video" src="'+u+'" title="'+esc(s.name)+' — LIVE" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="eager"></iframe><div class="live-video-shade"><div class="live-streamer-badge"><span class="live-dot"></span> LIVE</div><button class="live-sound-btn" id="liveSoundBtn" type="button">🔇</button></div><div class="live-streamer-info"><div class="live-streamer-avatar">'+esc(s.avatar)+'</div><div class="live-streamer-copy"><strong>'+esc(s.name)+'</strong><span>'+esc(s.game||s.category||"LIVE")+'</span></div></div></div>';

  $("liveSoundBtn")?.addEventListener("click",()=>{
    S.muted=!S.muted;
    $("liveSoundBtn").textContent=S.muted?"🔇":"🔊";
    h();
    window.FZG?.live?.onSoundChange?.(S.muted,s,s.selectedSource);
  });
}

function carousel(){
  const host=$("liveCarousel");
  if(!host)return;

  const a=shuffle(S.online.filter(x=>x.id!==S.selectedId)).slice(0,8);

  host.innerHTML=a.map(x=>
    '<button class="live-carousel-card" type="button" data-live-id="'+esc(x.id)+'">'+
      '<div class="live-carousel-thumb"><span class="live-dot"></span><span class="live-thumb-avatar">'+esc(x.avatar)+'</span></div>'+
      '<div class="live-carousel-name">'+esc(x.name)+'</div>'+
      '<div class="live-carousel-game">'+esc(x.game||x.category||"LIVE")+'</div>'+
    '</button>'
  ).join("");

  host.querySelectorAll("[data-live-id]").forEach(b=>
    b.addEventListener("click",()=>select(b.dataset.liveId,true))
  );
}

function list(){
  const host=$("liveStreamerList");
  if(!host)return;

  const on=S.all.filter(x=>x.live&&x.selectedSource);
  const off=S.all.filter(x=>!x.live||!x.selectedSource);

  const row=(x,isOn)=>
    '<button class="live-list-row" type="button" data-live-list-id="'+esc(x.id)+'">'+
      '<span class="live-list-avatar">'+esc(x.avatar)+'</span>'+
      '<span class="live-list-main">'+
        '<strong>'+esc(x.name)+'</strong>'+
        '<small>'+esc(x.game||x.category||"Стример")+'</small>'+
        '<em>'+(isOn?"СЕЙЧАС В ЭФИРЕ":(x.lastStreamAt?"Последний эфир: "+fmt(x.lastStreamAt):"Ожидает следующий эфир"))+'</em>'+
      '</span>'+
      '<span class="live-list-status '+(isOn?"online":"offline")+'">'+(isOn?"LIVE":"OFF")+'</span>'+
    '</button>';

  host.innerHTML=
    '<div class="live-list-section-title">🔴 ONLINE · '+on.length+'</div>'+
    (on.map(x=>row(x,true)).join("")||'<div class="live-list-none">Сейчас никто не в эфире.</div>')+
    '<div class="live-list-section-title offline-title">⚫ OFFLINE · '+off.length+'</div>'+
    (off.map(x=>row(x,false)).join("")||'<div class="live-list-none">Нет зарегистрированных профилей.</div>');

  host.querySelectorAll("[data-live-list-id]").forEach(b=>
    b.addEventListener("click",()=>{
      const x=S.all.find(v=>v.id===b.dataset.liveListId);
      if(!x)return;
      closeList();
      // The streamer list is a profile directory. Selecting a row always opens
      // the streamer card first; the card decides whether to offer LIVE playback.
      streamerCard(x);
      S.selectedId=x.id;
      S.muted=true;
      h();
    })
  );
}

function positionListPanel(){
  const panel=$("liveListPanel");
  const btn=$("liveListBtn");
  if(!panel||!btn||panel.parentElement!==document.body)return;
  const r=host.getBoundingClientRect();
  const gap=5;
  const maxH=Math.max(180,Math.min(430,window.innerHeight-r.bottom-gap-8));
  panel.style.position="fixed";
  panel.style.left=Math.round(r.left)+"px";
  panel.style.top=Math.round(r.bottom+gap)+"px";
  panel.style.width=Math.round(r.width)+"px";
  panel.style.maxHeight=Math.round(maxH)+"px";
  panel.style.height="auto";
  panel.style.zIndex="2147483000";
}

function openList(){
  const panel=$("liveListPanel");
  const host=$("liveView");
  if(!panel||!host)return;
  if(panel.parentElement!==document.body){
    document.body.appendChild(panel);
  }
  panel.classList.remove("hidden");
  panel.style.display="block";
  panel.style.pointerEvents="auto";
  panel.style.touchAction="pan-y";
  positionListPanel();
  window.addEventListener("resize",positionListPanel,{passive:true});
  window.addEventListener("orientationchange",positionListPanel,{passive:true});
  h();
}

function closeList(){
  const panel=$("liveListPanel");
  const host=$("liveView");
  if(!panel)return;
  panel.classList.add("hidden");
  panel.style.display="";
  panel.style.pointerEvents="";
  panel.style.touchAction="";
  panel.style.position="";
  panel.style.left="";
  panel.style.top="";
  panel.style.width="";
  panel.style.maxHeight="";
  panel.style.height="";
  panel.style.zIndex="";
  window.removeEventListener("resize",positionListPanel);
  window.removeEventListener("orientationchange",positionListPanel);
  if(host&&panel.parentElement!==host){
    const main=$("liveMain");
    if(main)host.insertBefore(panel,main);
    else host.appendChild(panel);
  }
}

function channelUrl(x){
  if(x.channelUrl)return x.channelUrl;
  if(x.channelId)return "https://www.youtube.com/channel/"+encodeURIComponent(x.channelId);
  if(x.handle)return "https://www.youtube.com/"+String(x.handle).replace(/^\s+/,"");
  return "";
}

function streamerCard(x){
  const m=$("liveMain");
  if(!m)return;

  const url=channelUrl(x);
  const isLive=!!(x.live&&x.selectedSource);
  const status=isLive?"🔴 LIVE":"⚫ OFFLINE";
  const title=x.lastStreamTitle||"Следующий эфир появится здесь автоматически.";

  m.innerHTML=
    '<div class="live-streamer-card">'+
      '<button class="live-streamer-card-close" id="liveCardClose" type="button" aria-label="Закрыть">×</button>'+
      '<div class="live-streamer-card-avatar">'+esc(x.avatar)+'</div>'+
      '<strong class="live-streamer-card-name">'+esc(x.name)+'</strong>'+
      '<span class="live-streamer-card-status">'+status+'</span>'+
      '<span class="live-streamer-card-game">'+esc(x.game||x.category||"Стример")+'</span>'+
      '<p class="live-streamer-card-text">'+esc(title)+'</p>'+
      '<div class="live-streamer-card-actions">'+
        (isLive?'<button class="live-streamer-card-watch" id="liveCardWatch" type="button">▶ СМОТРЕТЬ ЭФИР</button>':"")+
        (url?'<a class="live-streamer-card-channel" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">КАНАЛ ↗</a>':"")+
      '</div>'+
    '</div>';

  $("liveCardClose")?.addEventListener("click",()=>{
    const current=S.all.find(v=>v.id===S.selectedId);
    if(current&&current.live&&current.selectedSource)main(current);
    else empty();
  });

  $("liveCardWatch")?.addEventListener("click",()=>{
    select(x.id,true);
  });
}

function offline(x){
  S.selectedId=x.id;
  S.muted=true;
  streamerCard(x);
  h();
}

function select(id,user){
  const x=S.all.find(v=>v.id===id);
  if(!x||!x.live||!x.selectedSource)return;

  S.selectedId=x.id;
  S.muted=true;
  main(x);
  carousel();
  if(user)h();
}

function random(){
  const x=shuffle(S.online)[0]||null;
  S.selectedId=x?.id||null;
  S.muted=true;
  main(x);
  carousel();
}

function refresh(registryPayload,livePayload){
  // The server is authoritative for LIVE state. The local registry is only
  // metadata/fallback; it must never manufacture an active broadcast.
  const incoming=livePayload===null?[]:normalize(livePayload);
  const registry=new Map(directSources().map(x=>[x.id,x]));
  const map=new Map();
  for(const x of incoming){
    map.set(x.id,{...(registry.get(x.id)||{}),...x});
  }
  for(const [id,x] of registry){
    if(!map.has(id)) map.set(id,x);
  }
  S.all=[...map.values()].map(x=>{
    x.selectedSource=source(x);
    return x;
  });
  S.online=S.all.filter(x=>x.live&&x.selectedSource);

  const x=S.all.find(v=>v.id===S.selectedId);
  if(!x||!x.live||!x.selectedSource)random();
  else{
    S.muted=true;
    main(x);
    carousel();
  }

  list();
}

async function fetchJson(url){
  const r=await fetch(url,{cache:"no-store",credentials:"omit"});
  if(!r.ok)throw Error("LIVE endpoint "+r.status);
  return r.json();
}

async function poll(){
  if(S.loading)return;
  S.loading=true;

  try{
    // /api/live already contains the complete streamer cache. One request is
    // enough, avoids a second round-trip, and reduces cold-start latency.
    const livePayload=await fetchJson(cfg.endpoint);
    refresh(null,livePayload);
    setConnectionState("online","");
    clearTimeout(retryTimer);
  }catch(e){
    console.warn("FREEzzzGames LIVE monitor unavailable:",e);
    setConnectionState("error",String(e?.message||e));

    // Do not turn a transport error into "0 streamers". Keep the last
    // known state and only show the error when there is no usable state.
    if(!S.all.length){
      connectionError(String(e?.message||"connection error"));
      list();
    }else if(S.online.length){
      const x=S.all.find(v=>v.id===S.selectedId)||S.online[0];
      S.selectedId=x?.id||null;
      main(x);
      carousel();
      list();
    }

    clearTimeout(retryTimer);
    retryTimer=setTimeout(()=>poll(),15000);
  }finally{
    S.loading=false;
  }
}

function visibility(){
  const screen=window.FZG?.state?.get?.().screen||"home";
  const home=screen==="home";
  $("liveView")?.classList.toggle("hidden",!home);
  document.getElementById("mainPortal")?.classList.toggle("live-home-mode",home);
  if(!home)closeList();
}

function init(){
  if(!$("liveView"))return;

  $("liveListBtn")?.addEventListener("click",openList);
  $("liveListClose")?.addEventListener("click",closeList);
  $("liveListPanel")?.addEventListener("click",e=>{
    if(e.target.id==="liveListPanel")closeList();
  });

  window.FZG?.state?.subscribe?.(visibility);
  visibility();

  setConnectionState("loading");
  connectionError("Подключение к LIVE-серверу…");
  list();
  poll();
  setInterval(poll,Math.max(15000,Number(cfg.pollMs)||30000));
}

window.FZG=window.FZG||{};
window.FZG.live={
  refresh,
  poll,
  select,
  getState:()=>({...S}),
  onSoundChange:null
};

init();
})();