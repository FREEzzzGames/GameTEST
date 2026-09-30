import { directSources } from "./live-data/channels.js?v=20260930j";

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
  botPhraseTimer: null,
  overlayOpen: false
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

function overlayLayer() {
  return $("liveOverlayLayer");
}

function overlayShell() {
  return $("liveOverlayShell");
}

function positionOverlay() {
  const layer = overlayLayer();
  const portal = $("mainPortal");
  const media = $("homeMediaRow");
  const categories = $("categoryList");
  if (!layer || !portal || !media || !categories) return;

  const portalRect = portal.getBoundingClientRect();
  const mediaRect = media.getBoundingClientRect();
  const categoryRect = categories.getBoundingClientRect();

  const top = Math.max(0, Math.round(mediaRect.top - portalRect.top));
  const bottom = Math.max(0, Math.round(portalRect.bottom - categoryRect.top));

  layer.style.top = top + "px";
  layer.style.bottom = bottom + "px";
}

function showOverlay() {
  const layer = overlayLayer();
  if (!layer) return;

  positionOverlay();
  layer.classList.remove("hidden");
  layer.setAttribute("aria-hidden", "false");
  S.overlayOpen = true;
  window.dispatchEvent(new CustomEvent("freezzz:live-overlay", {detail:{open:true}}));

  window.addEventListener("resize", positionOverlay, {passive:true});
  window.addEventListener("orientationchange", positionOverlay, {passive:true});
}

function hideOverlay() {
  const layer = overlayLayer();
  if (!layer) return;

  layer.classList.add("hidden");
  layer.setAttribute("aria-hidden", "true");
  S.overlayOpen = false;
  window.dispatchEvent(new CustomEvent("freezzz:live-overlay", {detail:{open:false}}));

  window.removeEventListener("resize", positionOverlay);
  window.removeEventListener("orientationchange", positionOverlay);
}

function openCard(channel) {
  S.selectedId = channel.id;
  stopBotTimers();
  showOverlay();

  const shell = overlayShell();
  if (!shell) return;

  const url = channelUrl(channel);

  shell.innerHTML =
    '<div class="live-streamer-card">' +
      '<button class="live-streamer-card-close" data-live-action="card-close" type="button" aria-label="Закрыть">×</button>' +
      '<div class="live-streamer-card-avatar">' + esc(channel.avatar) + '</div>' +
      '<strong class="live-streamer-card-name">' + esc(channel.name) + '</strong>' +
      '<span class="live-streamer-card-game">' + esc(channel.category || "YouTube") + '</span>' +
      '<p class="live-streamer-card-text">' + esc(channel.description || channel.shortDescription || "Канал автора на YouTube.") + '</p>' +
      '<div class="live-streamer-card-actions">' +
        (url ? '<button class="live-streamer-card-channel" data-live-action="channel-open" type="button">КАНАЛ ↗</button>' : '') +
      '</div>' +
    '</div>';
}

function youtubeEmbedUrl(channel) {
  if (!channel?.channelId) return "";

  const uploadsPlaylistId =
    channel.channelId.startsWith("UC")
      ? "UU" + channel.channelId.slice(2)
      : channel.channelId;

  return "https://www.youtube.com/embed/videoseries?list=" +
    encodeURIComponent(uploadsPlaylistId) +
    "&playsinline=1&rel=0";
}

function openYouTubePanel(channel) {
  const shell = overlayShell();
  if (!shell) return;

  const embedUrl = youtubeEmbedUrl(channel);
  showOverlay();

  shell.innerHTML =
    '<div class="live-youtube-panel">' +
      '<div class="live-youtube-head">' +
        '<button class="live-youtube-back" data-live-action="youtube-back" type="button">‹</button>' +
        '<div><strong>' + esc(channel.name) + '</strong><small>YOUTUBE • ВНУТРИ LIVE</small></div>' +
        '<button class="live-youtube-close" data-live-action="youtube-close" type="button">×</button>' +
      '</div>' +
      '<div class="live-youtube-frame">' +
        (embedUrl
          ? '<iframe class="live-youtube-iframe" src="' + esc(embedUrl) + '" title="' + esc(channel.name) + ' — YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="eager"></iframe>'
          : '<div class="live-youtube-unavailable"><strong>YouTube-плеер недоступен для этого канала</strong><p>Для встроенного режима нужен ID канала.</p></div>') +
      '</div>' +
    '</div>';
}

function handleMainAction(event) {
  const target = event.target.closest("[data-live-action]");
  if (!target) return;

  event.preventDefault();
  event.stopPropagation();

  const action = target.dataset.liveAction;
  const channel = S.all.find(item => item.id === S.selectedId);
  if (!channel) return;

  if (action === "card-close") {
    hideOverlay();
    renderBot();
    haptic();
    return;
  }

  if (action === "channel-open") {
    openYouTubePanel(channel);
    haptic();
    return;
  }

  if (action === "youtube-back") {
    openCard(channel);
    haptic();
    return;
  }

  if (action === "youtube-close") {
    hideOverlay();
    renderBot();
    haptic();
    return;
  }

  if (action === "youtube-open") {
    openYouTubePanel(channel);
    haptic();
  }
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
  const shell = overlayShell();
  if (!panel || !shell) return;

  showOverlay();

  if (panel.parentElement !== shell) {
    shell.innerHTML = "";
    shell.appendChild(panel);
  }

  panel.classList.remove("hidden");
  panel.style.display = "block";
  panel.style.pointerEvents = "auto";
  panel.style.touchAction = "pan-y";
  panel.style.position = "static";
  panel.style.left = "";
  panel.style.top = "";
  panel.style.width = "100%";
  panel.style.maxHeight = "100%";
  panel.style.height = "100%";

  const list = $("liveStreamerList");
  if (list) {
    list.scrollTop = 0;
    list.style.scrollBehavior = "auto";
  }

  window.FZG?.streamerMenuParallax?.mount?.();
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

  if (host && panel.parentElement !== host) {
    const main = $("liveMain");
    if (main) host.insertBefore(panel, main);
    else host.appendChild(panel);
  }

  const list = $("liveStreamerList");
  if (list) list.style.scrollBehavior = "";

  window.FZG?.streamerMenuParallax?.reset?.();
  hideOverlay();
}

function syncVisibility() {
  const screen = window.FZG?.state?.get?.().screen || "home";
  const isHome = screen === "home";

  $("liveView")?.classList.toggle("hidden", !isHome);
  $("mainPortal")?.classList.toggle("live-home-mode", isHome);

  if (!isHome) {
    closeList();
    hideOverlay();
  }
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
    if (event.target.id === "liveListPanel") closeList();
  });

  overlayLayer()?.addEventListener("click", event => {
    if (event.target === overlayLayer()) {
      hideOverlay();
      renderBot();
    }
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
    all: [...S.all],
    overlayOpen: S.overlayOpen
  }),
  back: () => {
    if (!S.overlayOpen) return false;

    const channel = S.all.find(item => item.id === S.selectedId);
    const shell = overlayShell();
    const panel = $("liveListPanel");

    if (shell?.querySelector(".live-youtube-panel") && channel) {
      openCard(channel);
      haptic();
      return true;
    }

    if (panel && !panel.classList.contains("hidden")) {
      closeList();
      haptic();
      return true;
    }

    hideOverlay();
    renderBot();
    haptic();
    return true;
  }
};

init();
})();
