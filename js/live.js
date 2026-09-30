import { directSources } from "./live-data/channels.js?v=20260930g";

(() => {
"use strict";

/*
  FREEzzzGames LIVE — clean base
  Portal-owned streamer catalog.
  YouTube is the external content source.
  No automatic ONLINE/OFFLINE monitoring.
*/

const S = {
  all: directSources(),
  selectedId: null,
  botTimer: null,
  botPhraseTimer: null
};

const $ = id => document.getElementById(id);
const haptic = () => window.FZG?.platform?.haptic?.("light");

const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
}[char]));

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

function channelUrl(channel) {
  if (channel.channelUrl) return channel.channelUrl;
  if (channel.channelId) {
    return "https://www.youtube.com/channel/" + encodeURIComponent(channel.channelId);
  }
  if (channel.handle) {
    return "https://www.youtube.com/" + String(channel.handle).trim();
  }
  return "";
}

function setBotPhrase(text = "") {
  const bubble = $("liveBotBubble");
  if (!bubble) return;

  bubble.textContent = text || BOT_PHRASES[Math.floor(Math.random() * BOT_PHRASES.length)];
  bubble.classList.remove("is-new");
  requestAnimationFrame(() => bubble.classList.add("is-new"));
}

function moveBot() {
  const bot = $("liveBot");
  const area = $("liveMain");
  if (!bot || !area) return;

  const maxX = Math.max(30, area.clientWidth - 44);
  const maxY = Math.max(30, area.clientHeight - 58);

  bot.style.setProperty("--bot-x", Math.round(Math.random() * maxX) + "px");
  bot.style.setProperty("--bot-y", Math.round(Math.random() * maxY) + "px");
  bot.classList.toggle("face-left", Math.random() > .5);
}

function stopBotTimers() {
  clearInterval(S.botTimer);
  clearInterval(S.botPhraseTimer);
  S.botTimer = null;
  S.botPhraseTimer = null;
}

function startBotTimers() {
  stopBotTimers();
  S.botTimer = setInterval(moveBot, 3500);
  S.botPhraseTimer = setInterval(() => setBotPhrase(), 6500);
}

function renderBot() {
  const main = $("liveMain");
  if (!main) return;

  S.selectedId = null;
  stopBotTimers();

  main.innerHTML =
    '<div class="live-bot-stage" id="liveBotStage">' +
      '<div class="live-bot-bubble" id="liveBotBubble"></div>' +
      '<button class="live-bot" id="liveBot" type="button" aria-label="LIVE Bot">🤖</button>' +
      '<div class="live-bot-floor">FREEzzzGames LIVE BOT</div>' +
    '</div>';

  $("liveBot")?.addEventListener("click", () => {
    setBotPhrase(BOT_TAPS[Math.floor(Math.random() * BOT_TAPS.length)]);
    moveBot();
    haptic();
  });

  setBotPhrase();
  moveBot();
  startBotTimers();
}

function renderList() {
  const host = $("liveStreamerList");
  if (!host) return;

  host.innerHTML = S.all.map(channel =>
    '<button class="live-list-row" type="button" data-live-list-id="' + esc(channel.id) + '">' +
      '<span class="live-list-avatar">' + esc(channel.avatar) + '</span>' +
      '<span class="live-list-main">' +
        '<strong>' + esc(channel.name) + '</strong>' +
        '<small>' + esc(channel.category || "YouTube") + '</small>' +
        '<em>' + esc(channel.shortDescription || "YouTube-канал") + '</em>' +
      '</span>' +
      '<span class="live-list-status catalog">YT</span>' +
    '</button>'
  ).join("");

  host.querySelectorAll("[data-live-list-id]").forEach(button => {
    button.addEventListener("click", () => {
      const channel = S.all.find(item => item.id === button.dataset.liveListId);
      if (!channel) return;

      closeList();
      openCard(channel);
      haptic();
    });
  });
}

function openCard(channel) {
  S.selectedId = channel.id;
  stopBotTimers();

  const main = $("liveMain");
  if (!main) return;

  const url = channelUrl(channel);

  main.innerHTML =
    '<div class="live-streamer-card">' +
      '<button class="live-streamer-card-close" id="liveCardClose" type="button" aria-label="Закрыть">×</button>' +
      '<div class="live-streamer-card-avatar">' + esc(channel.avatar) + '</div>' +
      '<strong class="live-streamer-card-name">' + esc(channel.name) + '</strong>' +
      '<span class="live-streamer-card-game">' + esc(channel.category || "YouTube") + '</span>' +
      '<p class="live-streamer-card-text">' + esc(channel.description || channel.shortDescription || "Канал автора на YouTube.") + '</p>' +
      '<div class="live-streamer-card-actions">' +
        (url ? '<button class="live-streamer-card-channel" id="liveCardChannel" type="button">КАНАЛ ↗</button>' : '') +
      '</div>' +
    '</div>';

  $("liveCardClose")?.addEventListener("click", renderBot);

  $("liveCardChannel")?.addEventListener("click", () => {
    openYouTubePanel(channel);
    haptic();
  });
}

function openYouTubePanel(channel) {
  const main = $("liveMain");
  if (!main) return;

  const url = channelUrl(channel);

  main.innerHTML =
    '<div class="live-youtube-panel">' +
      '<div class="live-youtube-head">' +
        '<button class="live-youtube-back" id="liveYoutubeBack" type="button">‹</button>' +
        '<div><strong>' + esc(channel.name) + '</strong><small>YOUTUBE-КАНАЛ</small></div>' +
        '<button class="live-youtube-close" id="liveYoutubeClose" type="button">×</button>' +
      '</div>' +
      '<div class="live-youtube-body">' +
        '<div class="live-youtube-logo">▶</div>' +
        '<strong>Канал находится на YouTube</strong>' +
        '<p>' + esc(channel.shortDescription || "Открой канал и выбери нужное видео или стрим.") + '</p>' +
        '<button class="live-youtube-open" id="liveYoutubeOpen" type="button">ОТКРЫТЬ КАНАЛ YOUTUBE ↗</button>' +
        '<small class="live-youtube-note">FREEzzzGames не копирует и не хранит контент YouTube.</small>' +
      '</div>' +
    '</div>';

  $("liveYoutubeBack")?.addEventListener("click", () => openCard(channel));
  $("liveYoutubeClose")?.addEventListener("click", renderBot);

  $("liveYoutubeOpen")?.addEventListener("click", () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    haptic();
  });
}

function positionListPanel() {
  const panel = $("liveListPanel");
  const host = $("liveView");
  if (!panel || !host || panel.parentElement !== document.body) return;

  const rect = host.getBoundingClientRect();
  const gap = 5;
  const maxHeight = Math.max(180, Math.min(430, window.innerHeight - rect.bottom - gap - 8));

  panel.style.position = "fixed";
  panel.style.left = Math.round(rect.left) + "px";
  panel.style.top = Math.round(rect.bottom + gap) + "px";
  panel.style.width = Math.round(rect.width) + "px";
  panel.style.maxHeight = Math.round(maxHeight) + "px";
  panel.style.height = "auto";
  panel.style.zIndex = "2147483000";
}

function openList() {
  const panel = $("liveListPanel");
  const host = $("liveView");
  if (!panel || !host) return;

  if (panel.parentElement !== document.body) {
    document.body.appendChild(panel);
  }

  panel.classList.remove("hidden");
  panel.style.display = "block";
  panel.style.pointerEvents = "auto";
  panel.style.touchAction = "pan-y";

  positionListPanel();

  window.addEventListener("resize", positionListPanel, {passive:true});
  window.addEventListener("orientationchange", positionListPanel, {passive:true});
  haptic();
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

function syncVisibility() {
  const screen = window.FZG?.state?.get?.().screen || "home";
  const isHome = screen === "home";

  $("liveView")?.classList.toggle("hidden", !isHome);
  $("mainPortal")?.classList.toggle("live-home-mode", isHome);

  if (!isHome) closeList();
}

function init() {
  if (!$("liveView")) return;

  renderList();
  renderBot();

  $("liveListBtn")?.addEventListener("click", openList);
  $("liveListClose")?.addEventListener("click", closeList);
  $("liveListPanel")?.addEventListener("click", event => {
    if (event.target.id === "liveListPanel") closeList();
  });

  window.FZG?.state?.subscribe?.(syncVisibility);
  syncVisibility();
}

window.FZG = window.FZG || {};
window.FZG.live = {
  openStreamer: id => {
    const channel = S.all.find(item => item.id === id);
    if (channel) openCard(channel);
  },
  stop: renderBot,
  getState: () => ({
    selectedId: S.selectedId,
    all: [...S.all]
  })
};

init();
})();
