import { directSources } from "./live-data/channels.js?v=20261001-live-rewrite1";

(() => {
  "use strict";

  /*
   * FREEzzzGames LIVE — isolated rewrite
   * ------------------------------------
   * LIVE owns only its own DOM:
   *   #liveView
   *   #liveListPanel
   *   #liveMain
   *
   * It never moves nodes outside #liveView, never touches #mainPortal,
   * never navigates the router and never polls YouTube.
   *
   * ONLINE/OFFLINE is metadata, not a network check.
   * OFFLINE playback uses lastVideoUrl when supplied, otherwise the
   * channel's public uploads playlist when a channelId is known.
   * No recordings are stored or proxied by FREEzzzGames.
   */

  const STORAGE_KEY = "freezzzLiveCustomStreamers";
  const $ = id => document.getElementById(id);
  const haptic = () => window.FZG?.platform?.haptic?.("light");

  const state = {
    all: [],
    selectedId: null,
    playerMode: null,
    listOpen: false,
    addOpen: false,
    botTimer: 0,
    phraseTimer: 0
  };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[ch]));

  const makeId = value => {
    const base = String(value || "streamer")
      .toLowerCase()
      .trim()
      .replace(/https?:\/\//g,"")
      .replace(/[^a-z0-9а-яё]+/gi,"-")
      .replace(/^-+|-+$/g,"")
      .slice(0,48) || "streamer";
    return "custom-" + base + "-" + Date.now().toString(36);
  };

  function safeUrl(value){
    const raw = String(value || "").trim();
    if(!raw) return "";
    try{
      const url = new URL(raw);
      if(url.protocol === "https:" || url.protocol === "http:") return url.href;
    }catch(_){}
    return "";
  }

  function channelUrl(item){
    if(item?.channelUrl) return safeUrl(item.channelUrl);
    if(item?.channelId) return "https://www.youtube.com/channel/" + encodeURIComponent(item.channelId);
    if(item?.handle){
      const handle = String(item.handle).trim().replace(/^@?/, "@");
      return "https://www.youtube.com/" + handle;
    }
    return "";
  }

  function youtubeEmbed(url, fallback){
    const raw = String(url || "").trim();
    if(!raw) return fallback || "";

    try{
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./,"").toLowerCase();

      if(host === "youtu.be"){
        const id = u.pathname.replace(/^\//,"").split("/")[0];
        if(id) return "https://www.youtube.com/embed/" + encodeURIComponent(id) + "?autoplay=1&mute=1&playsinline=1&rel=0";
      }

      if(host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com"){
        const videoId = u.searchParams.get("v");
        if(videoId){
          return "https://www.youtube.com/embed/" + encodeURIComponent(videoId) + "?autoplay=1&mute=1&playsinline=1&rel=0";
        }
        const parts = u.pathname.split("/").filter(Boolean);
        if(parts[0] === "live" && parts[1]){
          return "https://www.youtube.com/embed/" + encodeURIComponent(parts[1]) + "?autoplay=1&mute=1&playsinline=1&rel=0";
        }
        if(parts[0] === "embed" && parts[1]){
          return "https://www.youtube.com/embed/" + encodeURIComponent(parts[1]) + "?autoplay=1&mute=1&playsinline=1&rel=0";
        }
      }
    }catch(_){}

    return safeUrl(raw);
  }

  function uploadsPlaylist(item){
    if(!item?.channelId) return "";
    const id = String(item.channelId);
    if(!id.startsWith("UC")) return "";
    return "https://www.youtube.com/embed/videoseries?list=" +
      encodeURIComponent("UU" + id.slice(2)) +
      "&autoplay=1&mute=1&playsinline=1&rel=0";
  }

  function normalize(item, custom=false){
    const source = item && typeof item === "object" ? item : {};
    const url = channelUrl(source);
    const status = source.status === "online" || source.status === "offline"
      ? source.status
      : (source.liveUrl ? "online" : "offline");

    return {
      id: String(source.id || makeId(source.name || url)),
      platform: "youtube",
      channelId: source.channelId ? String(source.channelId) : "",
      handle: source.handle ? String(source.handle) : "",
      channelUrl: url,
      liveUrl: safeUrl(source.liveUrl || ""),
      lastVideoUrl: safeUrl(source.lastVideoUrl || ""),
      name: String(source.name || "Новый стример").trim().slice(0,80),
      avatar: String(source.avatar || "🎮").slice(0,4),
      category: String(source.category || "YouTube").trim().slice(0,50),
      description: String(source.description || "YouTube-канал автора.").trim().slice(0,180),
      shortDescription: String(source.shortDescription || source.description || "YouTube-канал автора.").trim().slice(0,100),
      status,
      custom: !!custom
    };
  }

  function loadRegistry(){
    const builtins = directSources().map(item => normalize(item, false));
    let custom = [];
    try{
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if(Array.isArray(raw)) custom = raw.map(item => normalize(item, true));
    }catch(_){
      custom = [];
    }

    const map = new Map();
    [...builtins, ...custom].forEach(item => map.set(item.id, item));
    state.all = [...map.values()];
  }

  function saveCustom(){
    try{
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.all.filter(item => item.custom))
      );
    }catch(error){
      console.warn("FREEzzzGames LIVE: custom streamer storage unavailable", error);
    }
  }

  function getSelected(){
    return state.all.find(item => item.id === state.selectedId) || null;
  }

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
    "LIVE BOT: ждём следующий эфир"
  ];

  function botPhrase(text){
    const bubble = $("liveBotBubble");
    if(!bubble) return;
    bubble.textContent = text || BOT_PHRASES[Math.floor(Math.random() * BOT_PHRASES.length)];
    bubble.classList.remove("is-new");
    requestAnimationFrame(() => bubble.classList.add("is-new"));
  }

  function botMove(){
    const bot = $("liveBot");
    const area = $("liveMain");
    if(!bot || !area) return;
    const maxX = Math.max(30, area.clientWidth - 52);
    const maxY = Math.max(30, area.clientHeight - 72);
    bot.style.setProperty("--bot-x", Math.round(Math.random() * maxX) + "px");
    bot.style.setProperty("--bot-y", Math.round(Math.random() * maxY) + "px");
    bot.classList.toggle("face-left", Math.random() > .5);
  }

  function renderBot(){
    const main = $("liveMain");
    if(!main) return;

    clearInterval(state.botTimer);
    clearInterval(state.phraseTimer);

    main.innerHTML =
      '<div class="live-bot-stage" id="liveBotStage">' +
        '<div class="live-bot-bubble" id="liveBotBubble">Готов к запуску трансляции...</div>' +
        '<button class="live-bot" id="liveBot" type="button" aria-label="LIVE Bot">BOT</button>' +
        '<div class="live-bot-floor">FREEzzzGames LIVE BOT</div>' +
      '</div>';

    $("liveBot")?.addEventListener("click", () => {
      botPhrase(BOT_TAPS[Math.floor(Math.random() * BOT_TAPS.length)]);
      botMove();
      haptic();
    });

    botPhrase();
    botMove();
    state.botTimer = setInterval(botMove, 3500);
    state.phraseTimer = setInterval(() => botPhrase(), 6500);
  }

  function statusText(item){
    return item.status === "online" ? "ОНЛАЙН" : "ОФФЛАЙН";
  }

  function renderList(){
    const host = $("liveStreamerList");
    if(!host) return;

    host.innerHTML = state.all.map(item =>
      '<button class="live-list-row ' + (item.status === "online" ? "is-online" : "is-offline") + '" type="button" data-live-id="' + esc(item.id) + '">' +
        '<span class="live-list-avatar">' + esc(item.avatar) + '</span>' +
        '<span class="live-list-main">' +
          '<strong>' + esc(item.name) + '</strong>' +
          '<small>' + esc(item.category) + '</small>' +
          '<em>' + esc(item.shortDescription) + '</em>' +
        '</span>' +
        '<span class="live-list-status ' + (item.status === "online" ? "online" : "offline") + '">' + esc(statusText(item)) + '</span>' +
      '</button>'
    ).join("");

    host.querySelectorAll("[data-live-id]").forEach(button => {
      button.addEventListener("click", () => {
        const item = state.all.find(value => value.id === button.dataset.liveId);
        if(item) openStreamer(item);
      });
    });
  }

  function ensureAddPanel(){
    const panel = $("liveListPanel");
    if(!panel) return null;

    let head = panel.querySelector(".live-list-head");
    if(head && !head.querySelector("[data-live-add-open]")){
      const add = document.createElement("button");
      add.type = "button";
      add.className = "live-panel-add";
      add.dataset.liveAddOpen = "1";
      add.textContent = "ДОБАВИТЬ";
      head.insertBefore(add, head.lastElementChild || null);
      add.addEventListener("click", () => toggleAdd(true));
    }

    let addPanel = $("liveAddPanel");
    if(!addPanel){
      addPanel = document.createElement("div");
      addPanel.id = "liveAddPanel";
      addPanel.className = "live-add-panel hidden";
      addPanel.innerHTML =
        '<form class="live-add-form" id="liveAddForm">' +
          '<div class="live-add-title">ДОБАВИТЬ СТРИМЕРА</div>' +
          '<label>ИМЯ<input id="liveAddName" name="name" maxlength="80" required placeholder="Имя стримера"></label>' +
          '<label>YOUTUBE-КАНАЛ<input id="liveAddChannel" name="channel" maxlength="500" required placeholder="https://youtube.com/@channel"></label>' +
          '<label>КАТЕГОРИЯ<input id="liveAddCategory" name="category" maxlength="50" placeholder="Игры"></label>' +
          '<label>СТАТУС<select id="liveAddStatus" name="status"><option value="offline">ОФФЛАЙН</option><option value="online">ОНЛАЙН</option></select></label>' +
          '<label>ПОСЛЕДНЯЯ ЗАПИСЬ (необязательно)<input id="liveAddLast" name="lastVideo" maxlength="500" placeholder="Ссылка на запись стрима"></label>' +
          '<div class="live-add-actions">' +
            '<button type="button" class="live-add-cancel" data-live-add-cancel>ОТМЕНА</button>' +
            '<button type="submit" class="live-add-submit">СОХРАНИТЬ</button>' +
          '</div>' +
          '<div class="live-add-note">Сохраняются только данные стримера и ссылки. Видео не скачиваются и не хранятся.</div>' +
        '</form>';

      panel.querySelector(".live-list-drawer")?.prepend(addPanel);
      addPanel.querySelector("[data-live-add-cancel]")?.addEventListener("click", () => toggleAdd(false));
      addPanel.querySelector("#liveAddForm")?.addEventListener("submit", submitAdd);
    }

    return addPanel;
  }

  function toggleAdd(open){
    const panel = ensureAddPanel();
    if(!panel) return;
    state.addOpen = !!open;
    panel.classList.toggle("hidden", !open);
    if(open){
      $("liveAddName")?.focus();
    }
  }

  function submitAdd(event){
    event.preventDefault();

    const name = String($("liveAddName")?.value || "").trim();
    const channel = safeUrl($("liveAddChannel")?.value || "");
    const category = String($("liveAddCategory")?.value || "").trim();
    const status = $("liveAddStatus")?.value === "online" ? "online" : "offline";
    const lastVideo = safeUrl($("liveAddLast")?.value || "");

    if(!name || !channel){
      $("liveAddChannel")?.focus();
      return;
    }

    const item = normalize({
      id: makeId(name),
      name,
      channelUrl: channel,
      category: category || "YouTube",
      description: "Пользовательский YouTube-канал.",
      shortDescription: "Пользовательский канал.",
      status,
      lastVideoUrl: lastVideo,
      avatar: "🎥"
    }, true);

    state.all = [item, ...state.all];
    saveCustom();
    state.selectedId = null;
    toggleAdd(false);
    renderList();
    openStreamer(item);
    haptic();

    const form = $("liveAddForm");
    form?.reset();
  }

  function listOpen(){
    const panel = $("liveListPanel");
    if(!panel) return;
    ensureAddPanel();
    panel.classList.remove("hidden");
    panel.setAttribute("aria-hidden","false");
    state.listOpen = true;
    const list = $("liveStreamerList");
    if(list) list.scrollTop = 0;
    window.FZG?.streamerMenuParallax?.mount?.();
    haptic();
  }

  function listClose(){
    const panel = $("liveListPanel");
    if(!panel) return;
    toggleAdd(false);
    panel.classList.add("hidden");
    panel.setAttribute("aria-hidden","true");
    state.listOpen = false;
    window.FZG?.streamerMenuParallax?.reset?.();
  }

  function playerSource(item){
    if(item.status === "online"){
      return {
        mode: "live",
        url: youtubeEmbed(item.liveUrl, item.channelId
          ? "https://www.youtube.com/embed/live_stream?channel=" + encodeURIComponent(item.channelId) + "&autoplay=1&mute=1&playsinline=1&rel=0"
          : "")
      };
    }

    const recorded = youtubeEmbed(item.lastVideoUrl, "");
    if(recorded) return {mode:"recording", url:recorded};

    const playlist = uploadsPlaylist(item);
    if(playlist) return {mode:"recording", url:playlist};

    return {mode:"external", url:channelUrl(item)};
  }

  function renderExternal(item){
    const url = channelUrl(item);
    $("liveMain").innerHTML =
      '<div class="live-external-card">' +
        '<div class="live-external-badge">OFFLINE</div>' +
        '<div class="live-external-avatar">' + esc(item.avatar) + '</div>' +
        '<strong>' + esc(item.name) + '</strong>' +
        '<span>Нет записи с прямой ссылкой. Открой канал YouTube.</span>' +
        (url ? '<button type="button" data-live-action="external">ОТКРЫТЬ КАНАЛ</button>' : '') +
      '</div>';
  }

  function renderPlayer(item){
    const source = playerSource(item);
    const main = $("liveMain");
    if(!main) return;

    clearInterval(state.botTimer);
    clearInterval(state.phraseTimer);

    state.selectedId = item.id;
    state.playerMode = source.mode;

    const modeLabel = source.mode === "live" ? "LIVE" : source.mode === "recording" ? "ПОСЛЕДНЯЯ ЗАПИСЬ" : "YOUTUBE";
    const backButton = '<button class="live-player-action" type="button" data-live-action="player-back">НАЗАД</button>';
    const closeButton = '<button class="live-player-action" type="button" data-live-action="player-close">ЗАКРЫТЬ</button>';

    if(!source.url){
      renderExternal(item);
      return;
    }

    if(source.mode === "external"){
      renderExternal(item);
      return;
    }

    main.innerHTML =
      '<div class="live-player">' +
        '<div class="live-player-head">' +
          '<div class="live-player-title">' +
            '<strong>' + esc(item.name) + '</strong>' +
            '<small>' + esc(modeLabel) + ' • ' + esc(item.category) + '</small>' +
          '</div>' +
          '<div class="live-player-actions">' + backButton + closeButton + '</div>' +
        '</div>' +
        '<div class="live-player-frame">' +
          '<iframe class="live-player-iframe" src="' + esc(source.url) + '" title="' + esc(item.name) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; web-share" allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
        '</div>' +
        '<div class="live-player-foot">' +
          '<span>' + (source.mode === "live" ? "ПРЯМОЙ ЭФИР" : "ЗАПИСЬ КАНАЛА") + '</span>' +
          (channelUrl(item) ? '<button class="live-player-channel" type="button" data-live-action="external">КАНАЛ YOUTUBE</button>' : '') +
        '</div>' +
      '</div>';
  }

  function openStreamer(item){
    if(!item) return;
    listClose();
    renderPlayer(item);
    haptic();
  }

  function closePlayer(){
    state.selectedId = null;
    state.playerMode = null;
    renderBot();
    haptic();
  }

  function handleAction(event){
    const target = event.target.closest?.("[data-live-action]");
    if(!target) return;

    event.preventDefault();
    event.stopPropagation();

    const action = target.dataset.liveAction;
    const item = getSelected();

    if(action === "player-back"){
      listOpen();
      return;
    }

    if(action === "player-close"){
      closePlayer();
      return;
    }

    if(action === "external"){
      const url = channelUrl(item);
      if(url) window.FZG?.platform?.openLink?.(url);
      haptic();
    }
  }

  function visibility(){
    const screen = window.FZG?.state?.get?.().screen || "home";
    const live = $("liveView");
    if(!live) return;

    const home = screen === "home";
    live.classList.toggle("hidden", !home);

    if(!home){
      listClose();
      state.selectedId = null;
      state.playerMode = null;
      clearInterval(state.botTimer);
      clearInterval(state.phraseTimer);
    }
  }

  function init(){
    const live = $("liveView");
    if(!live) return;

    loadRegistry();
    renderList();
    ensureAddPanel();
    renderBot();

    $("liveListBtn")?.addEventListener("click", listOpen);
    $("liveListBack")?.addEventListener("click", listClose);
    $("liveListClose")?.addEventListener("click", listClose);
    $("liveMain")?.addEventListener("click", handleAction);

    window.FZG?.state?.subscribe?.(visibility);
    visibility();
  }

  window.FZG = window.FZG || {};
  window.FZG.live = {
    openStreamer(value){
      const item = typeof value === "string"
        ? state.all.find(entry => entry.id === value)
        : value;
      if(item){
        openStreamer(normalize(item, !!item.custom));
        return true;
      }
      return false;
    },
    playVideo(item){
      if(item) openStreamer(normalize(item, !!item.custom));
      else renderBot();
      return true;
    },
    stop(){
      closePlayer();
      return true;
    },
    getState(){
      return {
        selectedId: state.selectedId,
        playerMode: state.playerMode,
        listOpen: state.listOpen,
        addOpen: state.addOpen,
        all: state.all.map(item => ({...item}))
      };
    },
    back(){
      if(state.addOpen){
        toggleAdd(false);
        return true;
      }
      if(state.listOpen){
        listClose();
        return true;
      }
      if(state.selectedId){
        closePlayer();
        return true;
      }
      return false;
    }
  };

  init();
})();
