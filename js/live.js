import { directSources } from "./live-data/channels.js?v=20260930f";

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
  botTimer: null,
  botPhraseTimer: null
};

const $ = id => document.getElementById(id);
const h = () => window.FZG?.platform?.haptic?.("light");
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#39;"
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

function openCard(x) {
  S.selectedId = x.id;
  S.selectedVideo = null;

  const m = $("liveMain");
  if (!m) return;

  const url = channelUrl(x);

  m.innerHTML =
    '<div class="live-streamer-card">' +
      '<button class="live-streamer-card-close" id="liveCardClose" type="button" aria-label="Закрыть">×</button>' +
      '<div class="live-streamer-card-avatar">' + esc(x.avatar) + '</div>' +
      '<strong class="live-streamer-card-name">' + esc(x.name) + '</strong>' +
      '<span class="live-streamer-card-game">' + esc(x.category || "YouTube") + '</span>' +
      '<p class="live-streamer-card-text">' + esc(x.description || x.shortDescription || "Канал автора на YouTube.") + '</p>' +
      '<div class="live-streamer-card-actions">' +
        (url ? '<button class="live-streamer-card-channel" id="liveCardChannel" type="button">КАНАЛ ↗</button>' : '') +
      '</div>' +
    '</div>';

  $("liveCardClose")?.addEventListener("click", () => {
    S.selectedId = null;
    renderBot();
  });

  $("liveCardChannel")?.addEventListener("click", () => {
    openYouTubePanel(x);
    h();
  });
}

function openYouTubePanel(x) {
  const m = $("liveMain");
  if (!m) return;

  const url = channelUrl(x);

  m.innerHTML =
    '<div class="live-youtube-panel">' +
      '<div class="live-youtube-head">' +
        '<button class="live-youtube-back" id="liveYoutubeBack" type="button">‹</button>' +
        '<div><strong>' + esc(x.name) + '</strong><small>YOUTUBE-КАНАЛ</small></div>' +
        '<button class="live-youtube-close" id="liveYoutubeClose" type="button">×</button>' +
      '</div>' +
      '<div class="live-youtube-body">' +
        '<div class="live-youtube-logo">▶</div>' +
        '<strong>Канал находится на YouTube</strong>' +
        '<p>' + esc(x.shortDescription || "Открой канал, выбери нужное видео или стрим.") + '</p>' +
        '<button class="live-youtube-open" id="liveYoutubeOpen" type="button">ОТКРЫТЬ КАНАЛ YOUTUBE ↗</button>' +
        '<small class="live-youtube-note">FREEzzzGames не копирует и не хранит контент YouTube.</small>' +
      '</div>' +
    '</div>';

  $("liveYoutubeBack")?.addEventListener("click", () => openCard(x));
  $("liveYoutubeClose")?.addEventListener("click", () => renderBot());
  $("liveYoutubeOpen")?.addEventListener("click", () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    h();
  });
}

function stopPlayback() {
  S.selectedVideo = null;
  S.selectedId = null;
  renderBot();
  h();
}

function renderPlayer(video) {
  const m = $("liveMain");
  if (!m || !video?.embedUrl) return;

  m.innerHTML =
    '<div class="live-video-frame">' +
      '<iframe class="live-video" src="' + esc(video.embedUrl) + '" title="' + esc(video.title || "YouTube") + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="eager"></iframe>' +
      '<div class="live-video-shade">' +
        '<div class="live-streamer-badge">▶ YOUTUBE</div>' +
        '<button class="live-sound-btn" id="liveStopBtn" type="button">■</button>' +
      '</div>' +
    '</div>';

  $("liveStopBtn")?.addEventListener("click", stopPlayback);
}

function renderCurrentControl() {
  const host = $("liveCarousel");
  if (!host) return;

  if (!S.selectedVideo) {
    host.innerHTML = "";
    return;
  }

  host.innerHTML =
    '<div class="live-current-control">' +
      '<span>▶ ' + esc(S.selectedVideo.title || "Текущий контент") + '</span>' +
      '<button id="liveStopBottom" type="button">■ ОСТАНОВИТЬ</button>' +
    '</div>';

  $("liveStopBottom")?.addEventListener("click", stopPlayback);
}

function positionListPanel() {
  const panel = $("liveListPanel");
  const host = $("liveView");
  if (!panel || !host || panel.parentElement !== document.body) return;

  const r = host.getBoundingClientRect();
  const gap = 5;
  const maxH = Math.max(180, Math.min(430, window.innerHeight - r.bottom - gap - 8));

  panel.style.position = "fixed";
  panel.style.left = Math.round(r.left) + "px";
  panel.style.top = Math.round(r.bottom + gap) + "px";
  panel.style.width = Math.round(r.width) + "px";
  panel.style.maxHeight = Math.round(maxH) + "px";
  panel.style.height = "auto";
  panel.style.zIndex = "2147483000";
}

function openList() {
  const panel = $("liveListPanel");
  const host = $("liveView");
  if (!panel || !host) return;

  if (panel.parentElement !== document.body) document.body.appendChild(panel);
  panel.classList.remove("hidden");
  panel.style.display = "block";
  panel.style.pointerEvents = "auto";
  panel.style.touchAction = "pan-y";
  positionListPanel();

  window.addEventListener("resize", positionListPanel, {passive:true});
  window.addEventListener("orientationchange", positionListPanel, {passive:true});
  h();
}

function closeList() {
  const panel = $("liveListPanel");
  const host = $("liveView");
  if (!panel) return;

  panel.classList.add("hidden");
  panel.style.display = "";
  panel.style.pointerEvents = "";
  panel.style.touchAction = "";
  panel.style.position = "";
  panel.style.left = "";
  panel.style.top = "";
  panel.style.width = "";
  panel.style.maxHeight = "";
  panel.style.height = "";
  panel.style.zIndex = "";

  window.removeEventListener("resize", positionListPanel);
  window.removeEventListener("orientationchange", positionListPanel);

  if (host && panel.parentElement !== host) {
    const main = $("liveMain");
    if (main) host.insertBefore(panel, main);
    else host.appendChild(panel);
  }
}

function visibility() {
  const screen = window.FZG?.state?.get?.().screen || "home";
  const home = screen === "home";
  $("liveView")?.classList.toggle("hidden", !home);
  $("mainPortal")?.classList.toggle("live-home-mode", home);
  if (!home) closeList();
}

function init() {
  if (!$("liveView")) return;

  renderList();
  renderBot();

  $("liveListBtn")?.addEventListener("click", openList);
  $("liveListClose")?.addEventListener("click", closeList);
  $("liveListPanel")?.addEventListener("click", e => {
    if (e.target.id === "liveListPanel") closeList();
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
  getState: () => ({...S, all:[...S.all]})
};

init();
})();
