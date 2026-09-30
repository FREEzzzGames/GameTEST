import { directSources } from "./live-data/channels.js?v=20260930f1";

(() => {
"use strict";

/*
  FREEzzzGames LIVE
  -----------------
  The portal owns the streamer catalog and UI.
  YouTube remains the external source of creator content.
  There is NO automatic ONLINE/OFFLINE polling and no LIVE monitor dependency.
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
  "Проверка трансляции завершена. Ничего не проверено.",
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

function channelUrl(x) {
  if (x.channelUrl) return x.channelUrl;
  if (x.channelId) return "https://www.youtube.com/channel/" + encodeURIComponent(x.channelId);
  if (x.handle) return "https://www.youtube.com/" + String(x.handle).trim();
  return "";
}

function botPhrase(text = null) {
  const bubble = $("liveBotBubble");
  if (!bubble) return;
  const value = text || BOT_PHRASES[Math.floor(Math.random() * BOT_PHRASES.length)];
  bubble.textContent = value;
  bubble.classList.remove("is-new");
  requestAnimationFrame(() => bubble.classList.add("is-new"));
}

function botMove() {
  const bot = $("liveBot");
  const area = $("liveMain");
  if (!bot || !area) return;

  const w = Math.max(30, area.clientWidth - 44);
  const h = Math.max(30, area.clientHeight - 58);
  const x = Math.random() * w;
  const y = Math.random() * h;
  bot.style.setProperty("--bot-x", Math.round(x) + "px");
  bot.style.setProperty("--bot-y", Math.round(y) + "px");
  bot.classList.toggle("face-left", Math.random() > .5);
}

function renderBot() {
  const m = $("liveMain");
  if (!m) return;

  m.innerHTML =
    '<div class="live-bot-stage" id="liveBotStage">' +
      '<div class="live-bot-bubble" id="liveBotBubble">Проверяю наличие трансляции...</div>' +
      '<button class="live-bot" id="liveBot" type="button" aria-label="LIVE Bot">🤖</button>' +
      '<div class="live-bot-floor">FREEzzzGames LIVE BOT</div>' +
    '</div>';

  $("liveBot")?.addEventListener("click", () => {
    botPhrase(BOT_TAPS[Math.floor(Math.random() * BOT_TAPS.length)]);
    botMove();
    h();
  });

  botPhrase();
  botMove();

  clearInterval(S.botTimer);
  clearInterval(S.botPhraseTimer);
  S.botTimer = setInterval(botMove, 3500);
  S.botPhraseTimer = setInterval(() => botPhrase(), 6500);
}

function renderList() {
  const host = $("liveStreamerList");
  if (!host) return;

  host.innerHTML = S.all.map(x =>
    '<button class="live-list-row" type="button" data-live-list-id="' + esc(x.id) + '">' +
      '<span class="live-list-avatar">' + esc(x.avatar) + '</span>' +
      '<span class="live-list-main">' +
        '<strong>' + esc(x.name) + '</strong>' +
        '<small>' + esc(x.category || "YouTube") + '</small>' +
        '<em>' + esc(x.shortDescription || "YouTube-канал") + '</em>' +
      '</span>' +
      '<span class="live-list-status catalog">YT</span>' +
    '</button>'
  ).join("");

  host.querySelectorAll("[data-live-list-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const x = S.all.find(v => v.id === btn.dataset.liveListId);
      if (!x) return;
      closeList();
      openCard(x);
      h();
    });
  });
}

function overlayLayer(){
  return $("liveOverlayLayer");
}

function overlayShell(){
  return $("liveOverlayShell");
}

function positionOverlay(){
  const layer=overlayLayer();
  const portal=$("mainPortal");
  const media=$("homeMediaRow");
  if(!layer||!portal||!media)return;

  const portalRect=portal.getBoundingClientRect();
  const mediaRect=media.getBoundingClientRect();

  // The LIVE overlay belongs to the whole LIVE/CHAT/GAME media stage.
  // The old geometry started it at mediaRect.bottom, placing the
  // streamer drawer below the visible portal. Keep it viewport-safe,
  // but anchor it to the top and bottom of the media stage itself.
  const top=Math.max(0,Math.round(mediaRect.top-portalRect.top));
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

function openCard(x){
  S.selectedId=x.id;
  S.selectedVideo=null;
  clearInterval(S.botTimer);
  clearInterval(S.botPhraseTimer);
  showOverlay();

  const shell=overlayShell();
  if(!shell)return;

  const url=channelUrl(x);
  shell.innerHTML=
    '<div class="live-streamer-card">'+
      '<button class="live-streamer-card-close" data-live-action="card-close" type="button" aria-label="Закрыть">×</button>'+
      '<div class="live-streamer-card-avatar">'+esc(x.avatar)+'</div>'+
      '<strong class="live-streamer-card-name">'+esc(x.name)+'</strong>'+
      '<span class="live-streamer-card-game">'+esc(x.category||"YouTube")+'</span>'+
      '<p class="live-streamer-card-text">'+esc(x.description||x.shortDescription||"Канал автора на YouTube.")+'</p>'+
      '<div class="live-streamer-card-actions">'+
        (url?'<button class="live-streamer-card-channel" data-live-action="channel-open" type="button">КАНАЛ ↗</button>':'')+
      '</div>'+
    '</div>';
}

function youtubeEmbedUrl(x){
  if(!x?.channelId)return "";
  const uploadsPlaylistId=x.channelId.startsWith("UC")?"UU"+x.channelId.slice(2):x.channelId;
  return "https://www.youtube.com/embed/videoseries?list="+encodeURIComponent(uploadsPlaylistId)+"&playsinline=1&rel=0";
}

function openYouTubePanel(x){
  const shell=overlayShell();
  if(!shell)return;
  showOverlay();

  const embedUrl=youtubeEmbedUrl(x);
  shell.innerHTML=
    '<div class="live-youtube-panel">'+
      '<div class="live-youtube-head">'+
        '<button class="live-youtube-back" data-live-action="youtube-back" type="button">‹</button>'+
        '<div><strong>'+esc(x.name)+'</strong><small>YOUTUBE • ВНУТРИ LIVE</small></div>'+
        '<button class="live-youtube-close" data-live-action="youtube-close" type="button">×</button>'+
      '</div>'+
      '<div class="live-youtube-frame">'+
        (embedUrl
          ? '<iframe class="live-youtube-iframe" src="'+esc(embedUrl)+'" title="'+esc(x.name)+' — YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="eager"></iframe>'
          : '<div class="live-youtube-unavailable"><strong>YouTube-плеер недоступен для этого канала</strong><p>Для встроенного режима нужен ID канала.</p></div>')+
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
  if(!x)return;

  if(action==="card-close"){
    hideOverlay();
    S.selectedId=null;
    renderBot();
    h();
    return;
  }
  if(action==="channel-open"){
    openYouTubePanel(x);
    h();
    return;
  }
  if(action==="youtube-back"){
    openCard(x);
    h();
    return;
  }
  if(action==="youtube-close"){
    hideOverlay();
    S.selectedId=null;
    renderBot();
    h();
  }
}

function positionListPanel(){
  positionOverlay();
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

function visibility() {
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
  if(channel){ openCard(channel); return true; }
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

function init() {
  if (!$("liveView")) return;

  renderList();

  renderBot();

  $("liveListBtn")?.addEventListener("click", openList);
  $("liveListBack")?.addEventListener("click", closeList);
  $("liveListClose")?.addEventListener("click", closeList);
  $("liveMain")?.addEventListener("click", handleMainAction);
  overlayLayer()?.addEventListener("click", handleMainAction);
  $("liveListPanel")?.addEventListener("click", event => {
    if(event.target.id==="liveListPanel")closeList();
  });
  overlayLayer()?.addEventListener("click", event => {
    if(event.target===overlayLayer()){
      hideOverlay();
      S.selectedId=null;
      renderBot();
    }
  });

  window.FZG?.state?.subscribe?.(visibility);
  visibility();
}

window.FZG = window.FZG || {};
window.FZG.live = {
  openStreamer: id => {
    const x = S.all.find(v => v.id === id);
    if (x) openCard(x);
  },
  playVideo: renderPlayer,
  stop: stopPlayback,
  getState: () => ({...S, all:[...S.all], overlayOpen:S.overlayOpen}),
  back: () => {
    if(S.overlayOpen){ closeList(); hideOverlay(); S.selectedId=null; renderBot(); return true; }
    return false;
  }
};

init();
})();
