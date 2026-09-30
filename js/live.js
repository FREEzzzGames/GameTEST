(() => {
"use strict";

const cfg=Object.assign({
  endpoint:"https://freezzgames-live-monitor.onrender.com/api/live",
  registryEndpoint:"https://freezzgames-live-monitor.onrender.com/api/streamers",
  pollMs:300000
},window.FZG_LIVE_CONFIG||{});

const S={all:[],online:[],selectedId:null,muted:true,loading:false,connectionState:"idle",lastError:""};
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
      sources:Array.isArray(raw?.sources)?raw.sources:[]
    };
    x.selectedSource=source(x);
    return x;
  }).filter(x=>x.id);
}

function mergePayloads(registryPayload,livePayload){
  const base=normalize(registryPayload);
  const live=normalize(livePayload);
  const map=new Map(base.map(x=>[x.id,x]));

  for(const x of live){
    const prev=map.get(x.id)||{};
    map.set(x.id,{...prev,...x});
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
  if(!m)return;

  if(!s||!s.live||!s.selectedSource){
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
      if(x.live&&x.selectedSource)select(x.id,true);
      else offline(x);
    })
  );
}

function openList(){
  $("liveListPanel")?.classList.remove("hidden");
  h();
}

function closeList(){
  $("liveListPanel")?.classList.add("hidden");
}

function offline(x){
  const p=$("liveOfflineInfo");
  if(!p)return;

  p.innerHTML='<div class="live-offline-card"><button class="live-panel-close" type="button">×</button><div class="live-offline-avatar">'+esc(x.avatar)+'</div><strong>'+esc(x.name)+'</strong><span>⚫ OFFLINE</span><small>'+esc(x.game||x.category||"Стример")+'</small><p>'+(x.lastStreamAt?"Последний эфир: "+fmt(x.lastStreamAt):"Профиль зарегистрирован. Следующий эфир появится здесь автоматически.")+'</p>'+(x.lastStreamTitle?"<p>"+esc(x.lastStreamTitle)+"</p>":"")+'</div>';

  p.classList.remove("hidden");
  p.querySelector(".live-panel-close")?.addEventListener("click",()=>p.classList.add("hidden"));
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
  // null means that endpoint failed; keep the last known data instead of
  // replacing a healthy live list with an artificial empty payload.
  S.all=mergePayloads(
    registryPayload===null?S.all:registryPayload,
    livePayload===null?null:livePayload
  );
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
    const [liveResult,registryResult]=await Promise.allSettled([
      fetchJson(cfg.endpoint),
      fetchJson(cfg.registryEndpoint)
    ]);

    const liveOk=liveResult.status==="fulfilled";
    const registryOk=registryResult.status==="fulfilled";
    const livePayload=liveOk?liveResult.value:null;
    const registryPayload=registryOk?registryResult.value:null;

    if(!liveOk&&!registryOk){
      const reason=[
        liveResult.status==="rejected"?liveResult.reason?.message:null,
        registryResult.status==="rejected"?registryResult.reason?.message:null
      ].filter(Boolean).join("; ");
      throw Error(reason||"LIVE and registry endpoints unavailable");
    }

    refresh(registryPayload,livePayload);
    setConnectionState(liveOk?"online":"partial",liveOk?"": "LIVE endpoint unavailable");
    clearTimeout(retryTimer);
  }catch(e){
    console.warn("FREEzzzGames LIVE monitor unavailable:",e);
    setConnectionState("error",String(e?.message||e));

    // Do not turn a transport error into "0 streamers". Keep the last
    // known state and only show the error when there is no usable state.
    if(!S.all.length){
      connectionError(String(e?.message||"connection error"));
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