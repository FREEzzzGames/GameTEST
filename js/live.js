import { directSources } from "./live-data/channels.js?v=20260930live2";

(() => {
"use strict";

/*
  FREEzzzGames LIVE
  -----------------
  Static streamer registry + fixed LIVE slot.
  There is deliberately NO URL validation, ONLINE/OFFLINE probing,
  source health check, or channel-ID requirement.
*/

const S = {
  all: directSources(),
  selectedId: null,
  selectedVideo: null,
  overlayOpen: false,
  botTimer: null,
  botPhraseTimer: null
};

const $ = id => document.getElementById(id);
const h = () => window.FZG?.platform?.haptic?.("light");
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
}[c]));

const BOT_PHRASES = [
  "Я проверил интернет. Он всё ещё интернет.",
  "Трансляций нет. Зато я есть.",
  "Я хотел запустить стрим, но забыл зачем.",
  "404: хорошая шутка не найдена.",
  "ПИНГ КАРТОШКИ: 73 МС.",
  "Кабель смотрел на меня первым.",
  "Я занят очень важными роботскими делами.",
  "Я робот. У меня нет подписки на YouTube.",
  "Стрим ушёл. Я остался.",
  "Я бы рассказал мем, но он ушёл смотреть стрим.",
  "Минуточку. Я загружаю настроение.",
  "Сегодня я официальный эксперт по ничегонеделанию.",
  "Внимание. Робот находится в рабочем состоянии.",
  "Я вспомнил шутку. Нет, уже забыл.",
  "КАРТОШКА НЕ ПОДКЛЮЧЕНА К WIFI."
];

const BOT_TAPS = [
  "ОЙ.",
  "НЕ ТРОГАЙ МОИ ПРОЦЕССОРЫ.",
  "ЭЙ! Я ТУТ РАБОТАЮ.",
  "ЗАЧЕМ ТЫ МЕНЯ НАЖАЛ?",
  "ПЕРЕЗАПУСК ЧУВСТВА ЮМОРА...",
  "Ладно. Держи мем.",
  "🤖 *делает вид, что занят*"
];

function channelUrl(x){
  if(x?.channelUrl) return x.channelUrl;
  if(x?.channelId) return "https://www.youtube.com/channel/"+encodeURIComponent(x.channelId);
  if(x?.handle) return "https://www.youtube.com/"+String(x.handle).replace(/^\s+/,"");
  return "";
}

function streamerLaunchUrl(x){
  // Prefer the real YouTube live endpoint when a channel ID exists.
  // With handle-only entries, launch the channel's /live surface directly.
  // No preflight request or validity test is performed.
  if(x?.channelId){
    return "https://www.youtube.com/embed/live_stream?channel="+
      encodeURIComponent(x.channelId)+
      "&autoplay=1&mute=1&playsinline=1&rel=0";
  }
  const base=channelUrl(x);
  if(base) return base.replace(/\/$/,"")+"/live?autoplay=1";
  return "about:blank";
}

function botPhrase(text=null){
  const bubble=$("liveBotBubble");
  if(!bubble)return;
  const value=text||BOT_PHRASES[Math.floor(Math.random()*BOT_PHRASES.length)];
  bubble.textContent=value;
  bubble.classList.remove("is-new");
  requestAnimationFrame(()=>bubble.classList.add("is-new"));
}

function botMove(){
  const bot=$("liveBot");
  const area=$("liveMain");
  if(!bot||!area)return;
  const w=Math.max(30,area.clientWidth-44);
  const h=Math.max(30,area.clientHeight-58);
  bot.style.setProperty("--bot-x",Math.round(Math.random()*w)+"px");
  bot.style.setProperty("--bot-y",Math.round(Math.random()*h)+"px");
  bot.classList.toggle("face-left",Math.random()>.5);
}

function renderBot(){
  const m=$("liveMain");
  if(!m)return;
  m.innerHTML=
    '<div class="live-bot-stage" id="liveBotStage">'+
      '<div class="live-bot-bubble" id="liveBotBubble">Готов к запуску трансляции...</div>'+
      '<button class="live-bot" id="liveBot" type="button" aria-label="LIVE Bot">🤖</button>'+
      '<div class="live-bot-floor">FREEzzzGames LIVE BOT</div>'+
    '</div>';

  $("liveBot")?.addEventListener("click",()=>{
    botPhrase(BOT_TAPS[Math.floor(Math.random()*BOT_TAPS.length)]);
    botMove();
    h();
  });

  botPhrase();
  botMove();
  clearInterval(S.botTimer);
  clearInterval(S.botPhraseTimer);
  S.botTimer=setInterval(botMove,3500);
  S.botPhraseTimer=setInterval(()=>botPhrase(),6500);
}

function renderList(){
  const host=$("liveStreamerList");
  if(!host)return;

  host.innerHTML=S.all.map(x=>
    '<button class="live-list-row" type="button" data-live-list-id="'+esc(x.id)+'">'+
      '<span class="live-list-avatar">'+esc(x.avatar)+'</span>'+
      '<span class="live-list-main">'+
        '<strong>'+esc(x.name)+'</strong>'+
        '<small>'+esc(x.category||"YouTube")+'</small>'+
        '<em>'+esc(x.shortDescription||"YouTube-канал")+'</em>'+
      '</span>'+
      '<span class="live-list-status catalog">YT</span>'+
    '</button>'
  ).join("");

  host.querySelectorAll("[data-live-list-id]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const x=S.all.find(v=>v.id===btn.dataset.liveListId);
      if(!x)return;
      closeList();
      openStreamer(x);
      h();
    });
  });
}

function overlayLayer(){ return $("liveOverlayLayer"); }
function overlayShell(){ return $("liveOverlayShell"); }

function positionOverlay(){
  const layer=overlayLayer();
  const portal=$("mainPortal");
  const media=$("homeMediaRow");
  if(!layer||!portal||!media)return;

  const portalRect=portal.getBoundingClientRect();
  const mediaRect=media.getBoundingClientRect();

  // Fixed streamer slot: only the free area below HOME media.
  const top=Math.max(0,Math.round(mediaRect.bottom-portalRect.top));
  const bottom=Math.max(0,Math.round(portalRect.bottom-mediaRect.bottom));

  layer.style.top=top+"px";
  layer.style.bottom=bottom+"px";
}

function showOverlay(){
  const layer=overlayLayer();
  if(!layer)return;
  positionOverlay();
  layer.classList.remove("hidden");
  layer.setAttribute("aria-hidden","false");
  S.overlayOpen=true;
  window.dispatchEvent(new CustomEvent("freezzz:live-overlay",{detail:{open:true}}));
  window.addEventListener("resize",positionOverlay,{passive:true});
  window.addEventListener("orientationchange",positionOverlay,{passive:true});
}

function hideOverlay(){
  const layer=overlayLayer();
  if(!layer)return;
  layer.classList.add("hidden");
  layer.setAttribute("aria-hidden","true");
  S.overlayOpen=false;
  window.dispatchEvent(new CustomEvent("freezzz:live-overlay",{detail:{open:false}}));
  window.removeEventListener("resize",positionOverlay);
  window.removeEventListener("orientationchange",positionOverlay);
}

function openStreamer(x){
  if(!x)return;

  S.selectedId=x.id;
  S.selectedVideo=streamerLaunchUrl(x);
  clearInterval(S.botTimer);
  clearInterval(S.botPhraseTimer);
  showOverlay();

  const shell=overlayShell();
  if(!shell)return;

  const src=S.selectedVideo;
  const external=channelUrl(x);

  shell.innerHTML=
    '<div class="live-youtube-panel">'+
      '<div class="live-youtube-head">'+
        '<div><strong>'+esc(x.name)+'</strong><small>YOUTUBE • АВТОЗАПУСК</small></div>'+
        '<div class="live-youtube-actions">'+
          (external
            ? '<button class="live-youtube-open" data-live-action="external" type="button" aria-label="Открыть канал">↗</button>'
            : '')+
          '<button class="live-youtube-close" data-live-action="youtube-close" type="button" aria-label="Закрыть">×</button>'+
        '</div>'+
      '</div>'+
      '<div class="live-youtube-frame">'+
        '<iframe class="live-youtube-iframe" src="'+esc(src)+'" title="'+esc(x.name)+' — LIVE" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" allowfullscreen loading="eager"></iframe>'+
      '</div>'+
    '</div>';
}

function handleMainAction(event){
  const target=event.target.closest("[data-live-action]");
  if(!target)return;
  event.preventDefault();
  event.stopPropagation();

  const action=target.dataset.liveAction;
  const x=S.all.find(item=>item.id===S.selectedId);

  if(action==="youtube-close"){
    hideOverlay();
    S.selectedId=null;
    S.selectedVideo=null;
    renderBot();
    h();
    return;
  }

  if(action==="external"){
    const url=channelUrl(x);
    if(url) window.FZG?.platform?.openLink?.(url);
    h();
  }
}

function openList(){
  const panel=$("liveListPanel");
  const shell=overlayShell();
  if(!panel||!shell)return;

  showOverlay();

  if(panel.parentElement!==shell){
    shell.innerHTML="";
    shell.appendChild(panel);
  }

  panel.classList.remove("hidden");
  panel.style.display="block";
  panel.style.pointerEvents="auto";
  panel.style.touchAction="pan-y";
  panel.style.position="static";
  panel.style.left="";
  panel.style.top="";
  panel.style.width="100%";
  panel.style.maxHeight="100%";
  panel.style.height="100%";

  const list=$("liveStreamerList");
  if(list)list.scrollTop=0;

  window.FZG?.streamerMenuParallax?.mount?.();
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

  if(host&&panel.parentElement!==host){
    const main=$("liveMain");
    if(main)host.insertBefore(panel,main);
    else host.appendChild(panel);
  }

  window.FZG?.streamerMenuParallax?.reset?.();
  hideOverlay();
}

function visibility(){
  const screen=window.FZG?.state?.get?.().screen||"home";
  const home=screen==="home";
  $("liveView")?.classList.toggle("hidden",!home);
  $("mainPortal")?.classList.toggle("live-home-mode",home);
  if(!home){
    closeList();
    hideOverlay();
  }
}

function renderPlayer(channel){
  if(channel){
    openStreamer(channel);
    return true;
  }
  renderBot();
  return false;
}

function stopPlayback(){
  S.selectedId=null;
  S.selectedVideo=null;
  hideOverlay();
  renderBot();
  return true;
}

function init(){
  if(!$("liveView"))return;

  renderList();
  renderBot();

  $("liveListBtn")?.addEventListener("click",openList);
  $("liveListBack")?.addEventListener("click",closeList);
  $("liveListClose")?.addEventListener("click",closeList);
  $("liveMain")?.addEventListener("click",handleMainAction);
  overlayLayer()?.addEventListener("click",handleMainAction);
  $("liveListPanel")?.addEventListener("click",event=>{
    if(event.target.id==="liveListPanel")closeList();
  });
  overlayLayer()?.addEventListener("click",event=>{
    if(event.target===overlayLayer()){
      hideOverlay();
      S.selectedId=null;
      S.selectedVideo=null;
      renderBot();
    }
  });

  window.FZG?.state?.subscribe?.(visibility);
  visibility();
}

window.FZG=window.FZG||{};
window.FZG.live={
  openStreamer: channelOrId => {
    const x=typeof channelOrId==="string"
      ? S.all.find(v=>v.id===channelOrId)
      : channelOrId;
    if(x){
      openStreamer(x);
      return true;
    }
    return false;
  },
  playVideo: renderPlayer,
  stop: stopPlayback,
  getState: ()=>({...S,all:[...S.all],overlayOpen:S.overlayOpen}),
  back: ()=>{
    if(S.overlayOpen){
      closeList();
      hideOverlay();
      S.selectedId=null;
      S.selectedVideo=null;
      renderBot();
      return true;
    }
    return false;
  }
};

init();
})();
