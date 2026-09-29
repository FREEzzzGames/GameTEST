
(function(){
  const key="freezzz_age_confirmed";
  const gate=document.getElementById("ageGate");
  const yes=document.getElementById("ageYes");
  const no=document.getElementById("ageNo");
  if(localStorage.getItem(key)==="1") gate.remove();
  yes.addEventListener("click",()=>{localStorage.setItem(key,"1");gate.remove();});
  no.addEventListener("click",()=>{localStorage.removeItem(key);window.location.replace("about:blank");});
})();

/* TELEGRAM MINI APP VIEWPORT SYNC */
(function(){
  function syncMiniAppViewport(){
    try{
      const tgApp = window.Telegram && window.Telegram.WebApp;
      if(tgApp){
        if(typeof tgApp.ready === "function") tgApp.ready();
        if(typeof tgApp.expand === "function") tgApp.expand();
        if(typeof tgApp.setHeaderColor === "function") tgApp.setHeaderColor(getComputedStyle(document.documentElement).getPropertyValue("--tg-surface").trim());
        if(typeof tgApp.setBackgroundColor === "function") tgApp.setBackgroundColor(getComputedStyle(document.documentElement).getPropertyValue("--tg-bg").trim());
        const h = tgApp.viewportHeight || tgApp.viewportStableHeight;
        if(h) document.documentElement.style.setProperty("--tg-viewport-height", h + "px");
      }
    }catch(e){}
  }
  window.addEventListener("resize", syncMiniAppViewport, {passive:true});
  window.addEventListener("orientationchange", ()=>setTimeout(syncMiniAppViewport,80), {passive:true});
  document.addEventListener("DOMContentLoaded", syncMiniAppViewport, {once:true});
  syncMiniAppViewport();
})();



window.addEventListener('DOMContentLoaded', () => {
  const tg = {
    initData: "browser-test",
    ready(){},
    expand(){},
    openLink(url){ window.open(url, "_blank", "noopener,noreferrer"); },
    async authenticate(){ return {user:{id:"local_guest",username:"browser_test",first_name:"Browser",last_name:"Player"}}; }
  };

  let userName = "Игрок";
  const nameTxt = document.getElementById('userNameTxt');
  if (nameTxt) nameTxt.textContent = userName;

  const LANGS = ["ru","de","en"];
  const LANG = {
    ru:{
      code:"RU",subtitle:"ARCADE PORTAL 🕹️",games:"🎮 ИГРЫ",top:"🏆 ТОП",achievements:"🎖️ АЧИВКИ",chat:"💬 ЧАТ",random:"🎲 СЛУЧАЙНАЯ ИГРА",share:"📤 ПОДЕЛИТЬСЯ",
      swipeHint:"СВАЙП ВЛЕВО / ВПРАВО • НАЖМИ, ЧТОБЫ ОТКРЫТЬ ИГРУ",swipeShort:"← СВАЙП →",send:"ОТПРАВИТЬ",close:"ЗАКРЫТЬ",arcadeHub:"АРКАДНЫЙ ПОРТАЛ",
      avatarCollection:"КОЛЛЕКЦИЯ АВАТАРОВ",avatarHint:"Выбирай собранную аватарку или возвращайся каждый день за новой!",
      chatPlaceholder:"Напиши сообщение...",back:"НАЗАД",play:"ИГРАТЬ →",oneGame:"ИГРА",gamesCount:"ИГРЫ",
      score:"СЧЁТ",locked:"🔒",unlocked:"✅",topTitle:"ТОП ИГР",theme:"ТЕМА",sound:"ЗВУК",
      roomMain:"ОСНОВНАЯ",roomGames:"ИГРЫ",roomRelax:"ОТДЫХ",roomDm:"ЛИЧНЫЕ СООБЩЕНИЯ",dmTitle:"ЛИЧНЫЕ СООБЩЕНИЯ",
      noMessages:"Пока сообщений нет. Будь первым.",noDialogs:"Личных диалогов пока нет.",authOpen:"Открой чат внутри Telegram для авторизации.",
      authOk:"Браузер: локальный вход подтверждён",authError:"Ошибка авторизации: ",chatApiError:"Ошибка чата: ",dmApiError:"Ошибка личных сообщений: ",
      profilePortal:"ПОРТАЛ",profileGames:"ИГРЫ",profileLaunches:"ЗАПУСКОВ ИГР",profileMessages:"СООБЩЕНИЙ",profileChat:"В ЧАТЕ",profileDays:"ДНЕЙ АКТИВНОСТИ",
      profileAchievements:"🏆 АЧИВКИ",write:"НАПИСАТЬ",player:"Игрок"
    },
    de:{
      code:"DE",subtitle:"ARCADE-PORTAL 🕹️",games:"🎮 SPIELE",top:"🏆 TOP",achievements:"🎖️ ERFOLGE",chat:"💬 CHAT",random:"🎲 ZUFALLSSPIEL",share:"📤 TEILEN",
      swipeHint:"NACH LINKS / RECHTS WISCHEN • ANTIPPEN, UM DAS SPIEL ZU ÖFFNEN",swipeShort:"← WISCHEN →",send:"SENDEN",close:"SCHLIESSEN",arcadeHub:"ARCADE-PORTAL",
      avatarCollection:"AVATAR-SAMMLUNG",avatarHint:"Wähle einen gesammelten Avatar oder komm jeden Tag für einen neuen zurück!",
      chatPlaceholder:"Nachricht schreiben...",back:"ZURÜCK",play:"SPIELEN →",oneGame:"SPIEL",gamesCount:"SPIELE",
      score:"PUNKTZAHL",locked:"🔒",unlocked:"✅",topTitle:"SPIELE-TOP",theme:"THEMA",sound:"TON",
      roomMain:"HAUPTRAUM",roomGames:"SPIELE",roomRelax:"PAUSE",roomDm:"PRIVATNACHRICHTEN",dmTitle:"PRIVATNACHRICHTEN",
      noMessages:"Noch keine Nachrichten. Sei die erste Person.",noDialogs:"Noch keine privaten Gespräche.",authOpen:"Öffne den Chat in Telegram zur Anmeldung.",
      authOk:"Browser: lokaler Zugang bestätigt",authError:"Anmeldung fehlgeschlagen: ",chatApiError:"Chat-Fehler: ",dmApiError:"Fehler bei den Privatnachrichten: ",
      profilePortal:"PORTAL",profileGames:"SPIELE",profileLaunches:"SPIELSTARTS",profileMessages:"NACHRICHTEN",profileChat:"CHATZEIT",profileDays:"AKTIVE TAGE",
      profileAchievements:"🏆 ERFOLGE",write:"SCHREIBEN",player:"Spieler"
    },
    en:{
      code:"EN",subtitle:"ARCADE PORTAL 🕹️",games:"🎮 GAMES",top:"🏆 TOP",achievements:"🎖️ ACHIEVEMENTS",chat:"💬 CHAT",random:"🎲 RANDOM GAME",share:"📤 SHARE",
      swipeHint:"SWIPE LEFT / RIGHT • TAP TO OPEN THE GAME",swipeShort:"← SWIPE →",send:"SEND",close:"CLOSE",arcadeHub:"ARCADE PORTAL",
      avatarCollection:"AVATAR COLLECTION",avatarHint:"Choose a collected avatar or come back every day for a new one!",
      chatPlaceholder:"Write a message...",back:"BACK",play:"PLAY →",oneGame:"GAME",gamesCount:"GAMES",
      score:"SCORE",locked:"🔒",unlocked:"✅",topTitle:"TOP GAMES",theme:"THEME",sound:"SOUND",
      roomMain:"MAIN",roomGames:"GAMES",roomRelax:"RELAX",roomDm:"PRIVATE MESSAGES",dmTitle:"PRIVATE MESSAGES",
      noMessages:"No messages yet. Be the first.",noDialogs:"No private conversations yet.",authOpen:"Open the chat inside Telegram to sign in.",
      authOk:"Browser: local access confirmed",authError:"Authorization failed: ",chatApiError:"Chat error: ",dmApiError:"Private message error: ",
      profilePortal:"PORTAL",profileGames:"GAMES",profileLaunches:"GAME LAUNCHES",profileMessages:"MESSAGES",profileChat:"CHAT TIME",profileDays:"ACTIVE DAYS",
      profileAchievements:"🏆 ACHIEVEMENTS",write:"WRITE",player:"Player"
    }
  };
  const GAME_TEXT = {
    snake:{ru:['ОДИН ПАЛЕЦ','Собирай, расти и бей собственный рекорд.'],de:['EIN FINGER','Sammle, wachse und knacke deinen Rekord.'],en:['ONE TOUCH','Collect, grow and beat your high score.']},
    '2048':{ru:['ОДИН ПАЛЕЦ','Соединяй одинаковые плитки и доберись до 2048.'],de:['EIN FINGER','Verbinde gleiche Kacheln und erreiche 2048.'],en:['ONE TOUCH','Merge matching tiles and reach 2048.']},
    wordle:{ru:['СЛОВА','Угадай слово за ограниченное число попыток.'],de:['WÖRTER','Errate das Wort mit begrenzten Versuchen.'],en:['WORD','Guess the word in a limited number of tries.']},
    princejs:{ru:['МАШИНА ВРЕМЕНИ','Классическое приключение прямо в браузере с touch-управлением.'],de:['ZEITREISE','Klassisches Abenteuer direkt im Browser mit Touch-Steuerung.'],en:['TIME TRIP','A classic browser adventure with touch controls.']},
    paperio:{ru:['ТЕРРИТОРИЯ','Рисуй свой след и захватывай территорию.'],de:['GEBIET','Ziehe deine Spur und erobere Gebiet.'],en:['TERRITORY','Draw your trail and claim territory.']},
    txtaria:{ru:['СТРАННЫЕ МИРЫ','Минималистичное ASCII-приключение с сенсорным управлением.'],de:['SELTSAME WELTEN','Minimalistisches ASCII-Abenteuer mit Touch-Steuerung.'],en:['ODD WORLDS','A minimalist ASCII adventure with touch controls.']},
    labyrinth:{ru:['ПОТЕРЯЙСЯ И НАЙДИСЬ','Найди выход из нового лабиринта.'],de:['VERIRREN & FINDEN','Finde den Ausgang aus einem neuen Labyrinth.'],en:['LOST & FOUND','Find your way out of a fresh maze.']},
    memory:{ru:['ТРЕНАЖЁР МОЗГА','Открывай пары карточек и тренируй память.'],de:['KOPFTRAINING','Finde Kartenpaare und trainiere dein Gedächtnis.'],en:['BRAIN GYM','Match pairs and train your memory.']},
    whacmole:{ru:['РЕАКТОР','Лови появляющиеся цели одним быстрым касанием.'],de:['REAKTOR','Triff die auftauchenden Ziele mit schnellen Taps.'],en:['REACTION','Tap the appearing targets as fast as you can.']},
    pong:{ru:['ДВА БОКА ЭКРАНА','Минималистичная дуэль с мгновенным управлением.'],de:['ZWEI SEITEN','Ein minimalistisches Duell mit direkter Steuerung.'],en:['TWO SIDES','A minimalist duel with instant controls.']},
    tetris:{ru:['ПАДАЮЩАЯ ЛОГИКА','Собирай линии из падающих фигур.'],de:['FALLENDE LOGIK','Baue Linien aus fallenden Formen.'],en:['FALLING LOGIC','Build lines from falling shapes.']},
    quickdraw:{ru:['ЧИТАЕТ МЫСЛИ','Рисуй, а нейросеть попробует угадать рисунок.'],de:['GEDANKENLESER','Zeichne und lass die KI dein Bild erraten.'],en:['MIND READER','Draw and let the AI try to guess it.']},
    slowroads:{ru:['ZEN DRIVE','Бесконечная поездка по процедурным дорогам.'],de:['ZEN DRIVE','Eine endlose Fahrt über prozedurale Straßen.'],en:['ZEN DRIVE','An endless drive on procedural roads.']},
    ligmar:{ru:['ЖИВОЙ МИР','Большой браузерный мир с развитием и заданиями.'],de:['LEBENDIGE WELT','Eine große Browserwelt mit Entwicklung und Aufgaben.'],en:['LIVING WORLD','A large browser world with progression and quests.']}
  };
  const CATEGORY_TEXT = {
    onefinger:{ru:'ОДИН ПАЛЕЦ',de:'EIN FINGER',en:'ONE TOUCH'},
    think:{ru:'НЕ СПЕШИ',de:'NIMM DIR ZEIT',en:'TAKE YOUR TIME'},
    reaction:{ru:'РЕАКТОР',de:'REAKTOR',en:'REACTION'},
    strange:{ru:'СТРАННОЕ',de:'DAS SELTSAME',en:'THE STRANGE'},
    lost:{ru:'ПОТЕРЯЙСЯ И НАЙДИСЬ',de:'VERIRREN & FINDEN',en:'LOST & FOUND'},
    timetrip:{ru:'МАШИНА ВРЕМЕНИ',de:'ZEITMASCHINE',en:'TIME MACHINE'},
    zen:{ru:'НЕ СПЕШИ ЕХАТЬ',de:'ZEN-FAHRT',en:'ZEN DRIVE'},
    worlds:{ru:'ЖИВЫЕ МИРЫ',de:'LEBENDIGE WELTEN',en:'LIVING WORLDS'},
    duel:{ru:'ДВА БОКА ЭКРАНА',de:'ZWEI SEITEN',en:'TWO SIDES'},
    lab:{ru:'FREEzzz LAB',de:'FREEzzz LAB',en:'FREEzzz LAB'}
  };
  let currentLang = localStorage.getItem("freezzzLang") || "ru";
  if(!LANGS.includes(currentLang)) currentLang="ru";
  const tr=(key)=>LANG[currentLang][key]||LANG.ru[key]||key;
  const gameText=(id,field)=>{
    const x=GAME_TEXT[id]&&GAME_TEXT[id][currentLang];
    if(x) return field==="genre"?x[0]:x[1];
    const g=GAME_BY_ID[id]; return field==="genre"?g.genre:g.desc;
  };
  const categoryText=(id)=>CATEGORY_TEXT[id]?.[currentLang]||id;

  function applyLanguage(){
    const L=LANG[currentLang];
    const staticText={
      achSnake:{ru:"🐍 Мастер Змейки|Счёт от 100 в Snake",de:"🐍 Snake-Meister|Mindestens 100 Punkte in Snake",en:"🐍 Snake Master|Score 100+ in Snake"},
      achTetris:{ru:"🧱 Архитектор Тетриса|Счёт от 500 в Tetris",de:"🧱 Tetris-Architekt|Mindestens 500 Punkte in Tetris",en:"🧱 Tetris Architect|Score 500+ in Tetris"},
      achMario:{ru:"🍄 Герой Платформера|Пройди Platformer",de:"🍄 Plattform-Held|Schließe das Plattformspiel ab",en:"🍄 Platformer Hero|Complete the platformer"},
      achRacer:{ru:"🏎️ Путешественник|Открой Slow Roads",de:"🏎️ Reisender|Öffne Slow Roads",en:"🏎️ Traveler|Open Slow Roads"}
    };
    Object.entries(staticText).forEach(([id,val])=>{
      const el=document.getElementById(id); if(!el)return;
      const parts=val[currentLang].split("|");
      const name=el.querySelector(".row-name"); const desc=el.querySelector(".ach-desc");
      if(name){name.textContent=parts[0]} else {el.querySelector(".row-name")?.replaceChildren(document.createTextNode(parts[0]));}
      if(desc&&parts[1])desc.textContent=parts[1];
    });

    document.documentElement.lang=currentLang;
    document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=tr(el.dataset.i18n)});
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{el.placeholder=tr(el.dataset.i18nPlaceholder)});
    document.getElementById("langToggleBtn").textContent=L.code;
    document.getElementById("langToggleBtn").title=currentLang==="ru"?"Язык":currentLang==="de"?"Sprache":"Language";
    // Theme and sound controls are intentionally fixed: dark theme, sound enabled.
    document.getElementById("userNameTxt").textContent=userName || tr("player");
    document.querySelectorAll("[data-chat-room-label]").forEach(el=>{
      const room=el.parentElement?.dataset?.room || el.dataset.chatRoomLabel;
      const key=room==="main"?"roomMain":room==="games"?"roomGames":room==="relax"?"roomRelax":"roomDm";
      el.textContent=tr(key);
    });
    const roomTitle=document.getElementById("chatRoomTitle");
    if(roomTitle && !activeDmUserId) roomTitle.textContent=roomLabel(chatRoom);
    const dmTitle=document.getElementById("dmThreadTitle");
    if(dmTitle && !activeDmUserId) dmTitle.textContent=tr("dmTitle");
    ["profilePortalLabel","profileGameLabel","profileLaunchesLabel","profileMessagesLabel","profileChatTimeLabel","profileDaysLabel","profileAchievementsTitle","playerProfileMessageBtn","playerProfileClose"].forEach((id)=>{
      const map={profilePortalLabel:"profilePortal",profileGameLabel:"profileGames",profileLaunchesLabel:"profileLaunches",profileMessagesLabel:"profileMessages",profileChatTimeLabel:"profileChat",profileDaysLabel:"profileDays",profileAchievementsTitle:"profileAchievements",playerProfileMessageBtn:"write",playerProfileClose:"close"};
      const el=document.getElementById(id); if(el && map[id]) el.textContent=tr(map[id]);
    });
    document.getElementById("userProfileBox")?.setAttribute("aria-label",tr("player"));
    if(currentCategory) document.getElementById("categoryHeadTitle").textContent=categoryText(currentCategory.id);
    renderCategories();
    if(currentCategory) renderCategoryCarousel();
    updateGuestEmptyState();
  }

  function updateGuestEmptyState(){
    const list=document.getElementById("guestList");
    if(!list)return;
    const messages=JSON.parse(localStorage.getItem("freezzzGuestMessages")||"[]");
    if(!messages.length) list.innerHTML='<div class="guest-msg">'+(currentLang==="ru"?"Пока сообщений нет. Напиши первым.":currentLang==="de"?"Noch keine Nachrichten. Schreib die erste Nachricht.":"No messages yet. Write the first one.")+'</div>';
  }

  document.getElementById("langToggleBtn").addEventListener("click",()=>{
    currentLang=LANGS[(LANGS.indexOf(currentLang)+1)%LANGS.length];
    localStorage.setItem("freezzzLang",currentLang);
    applyLanguage(); haptic();
  });


  // PLAYER IDENTITY / STATISTICS
  let tgUser = {id:"local_guest",username:"browser_test",first_name:"Browser",last_name:"Player"};
  let playerId = "local_guest";
  const playerKey = "freezzzPlayerStats:" + playerId;

  const defaultPlayerStats = {
    portalSeconds:0, gameSeconds:0, chatSeconds:0,
    gameLaunches:0, messagesSent:0, categoryOpens:0, gameViews:0,
    activeDays:[], games:{}, lastSeen:0, pendingGame:null
  };

  function readPlayerStats(){
    try{
      const raw=localStorage.getItem(playerKey);
      const parsed=raw?JSON.parse(raw):{};
      return Object.assign({},defaultPlayerStats,parsed,{
        activeDays:Array.isArray(parsed.activeDays)?parsed.activeDays:[],
        games:parsed.games&&typeof parsed.games==="object"?parsed.games:{}
      });
    }catch(e){return Object.assign({},defaultPlayerStats);}
  }
  let playerStats=readPlayerStats();

  function savePlayerStats(){
    try{localStorage.setItem(playerKey,JSON.stringify(playerStats));}catch(e){}
  }

  function formatDuration(sec){
    sec=Math.max(0,Math.floor(Number(sec)||0));
    const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60);
    if(h>0)return h+"ч "+m+"м";
    return m+"м";
  }

  function markActiveDay(){
    const d=new Date().toISOString().slice(0,10);
    if(!playerStats.activeDays.includes(d)){
      playerStats.activeDays.push(d);
      if(playerStats.activeDays.length>366)playerStats.activeDays=playerStats.activeDays.slice(-366);
      savePlayerStats();
    }
  }

  function syncTelegramIdentity(){
    if(!tgUser)return;
    const latestUsername=tgUser.username ? "@"+tgUser.username : "";
    const latestName=[tgUser.first_name||"",tgUser.last_name||""].join(" ").trim();
    const display=latestUsername || latestName || "Игрок";
    userName=display;
    const el=document.getElementById("userNameTxt");
    if(el)el.textContent=display;
    document.title="FREEzzzGames — "+display;
    playerStats.lastSeen=Date.now();
    markActiveDay();
    savePlayerStats();
  }
  async function syncStatsToServer(){
    if(!chatAuthorized)return;
    try{await api("/stats",{method:"POST",body:{portalSeconds:playerStats.portalSeconds,gameSeconds:playerStats.gameSeconds,chatSeconds:playerStats.chatSeconds,gameLaunches:playerStats.gameLaunches,messagesSent:playerStats.messagesSent,categoryOpens:playerStats.categoryOpens,gameViews:playerStats.gameViews,activeDays:playerStats.activeDays}});}catch(e){}
  }
  syncTelegramIdentity();

  function playerIdentity(){
    return {
      id:playerId,
      username:tgUser&&tgUser.username ? "@"+tgUser.username : "",
      name:tgUser ? [tgUser.first_name||"",tgUser.last_name||""].join(" ").trim() : "Игрок",
      avatar:currentAvatar || "👾"
    };
  }

  function tickPortalTime(){
    const now=Date.now();
    if(!document.hidden && window.__freezzzLastVisibleTick){
      const delta=Math.min(60,Math.max(0,(now-window.__freezzzLastVisibleTick)/1000));
      playerStats.portalSeconds+=delta;
      if(document.getElementById("guestView") && !document.getElementById("guestView").classList.contains("hidden")){
        playerStats.chatSeconds+=delta;
      }
      savePlayerStats();
      if(chatAuthorized)syncStatsToServer();
    }
    window.__freezzzLastVisibleTick=now;
  }
  window.__freezzzLastVisibleTick=Date.now();
  markActiveDay();
  setInterval(tickPortalTime,15000);
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      tickPortalTime();
      window.__freezzzLastVisibleTick=null;
    }else{
      window.__freezzzLastVisibleTick=Date.now();
      markActiveDay();
    }
  });
  window.addEventListener("beforeunload",tickPortalTime);

  function recoverPendingGame(){
    const p=playerStats.pendingGame;
    if(!p||!p.startedAt)return;
    const elapsed=Math.min(2*3600,Math.max(0,(Date.now()-p.startedAt)/1000));
    if(elapsed>5){
      playerStats.gameSeconds+=elapsed;
      if(!playerStats.games[p.gameId])playerStats.games[p.gameId]={launches:0,seconds:0};
      playerStats.games[p.gameId].seconds+=elapsed;
      savePlayerStats();
    }
    playerStats.pendingGame=null;
    savePlayerStats();
  }
  recoverPendingGame();

  function trackGameLaunch(gameId){
    if(!gameId)return;
    playerStats.gameLaunches++;
    playerStats.gameViews++;
    if(!playerStats.games[gameId])playerStats.games[gameId]={launches:0,seconds:0};
    playerStats.games[gameId].launches++;
    playerStats.pendingGame={gameId:gameId,startedAt:Date.now()};
    savePlayerStats();
  }

  const ACHIEVEMENT_DEFS=[
    {id:"first_visit",icon:"👋",name:{ru:"Первый визит",de:"Erster Besuch",en:"First Visit"},desc:{ru:"Открыть FREEzzzGames",de:"FREEzzzGames öffnen",en:"Open FREEzzzGames"},ok:s=>s.portalSeconds>0},
    {id:"first_game",icon:"🎮",name:{ru:"Первый запуск",de:"Erstes Spiel",en:"First Game"},desc:{ru:"Запустить игру",de:"Ein Spiel starten",en:"Launch a game"},ok:s=>s.gameLaunches>=1},
    {id:"arcade_10",icon:"🕹️",name:{ru:"Аркадник",de:"Arcade-Fan",en:"Arcade Fan"},desc:{ru:"10 запусков игр",de:"10 Spielstarts",en:"10 game launches"},ok:s=>s.gameLaunches>=10},
    {id:"hour_portal",icon:"⏱️",name:{ru:"Первый час",de:"Erste Stunde",en:"First Hour"},desc:{ru:"1 час на портале",de:"1 Stunde im Portal",en:"1 hour on the portal"},ok:s=>s.portalSeconds>=3600},
    {id:"five_hours",icon:"⏳",name:{ru:"Долгий визит",de:"Langer Besuch",en:"Long Visit"},desc:{ru:"5 часов на портале",de:"5 Stunden im Portal",en:"5 hours on the portal"},ok:s=>s.portalSeconds>=18000},
    {id:"chat_10",icon:"💬",name:{ru:"Первый разговор",de:"Erstes Gespräch",en:"First Conversation"},desc:{ru:"10 сообщений",de:"10 Nachrichten",en:"10 messages"},ok:s=>s.messagesSent>=10},
    {id:"chat_100",icon:"🗣️",name:{ru:"Болтун",de:"Plaudertasche",en:"Chatterbox"},desc:{ru:"100 сообщений",de:"100 Nachrichten",en:"100 messages"},ok:s=>s.messagesSent>=100},
    {id:"days_7",icon:"🔥",name:{ru:"Постоянный",de:"Stammgast",en:"Regular"},desc:{ru:"7 активных дней",de:"7 aktive Tage",en:"7 active days"},ok:s=>s.activeDays.length>=7},
    {id:"games_10",icon:"🌐",name:{ru:"Исследователь",de:"Entdecker",en:"Explorer"},desc:{ru:"Запустить 10 игр",de:"10 Spiele starten",en:"Launch 10 games"},ok:s=>s.gameLaunches>=10}
  ];

  let profileTargetId=null;
  async function renderPlayerProfile(target){
    const id=document.getElementById("playerProfileOverlay");
    if(!id)return;
    const isSelf=!target || String(target)===playerId;
    let data=null;
    if(!isSelf && chatAuthorized){
      try{data=await api("/profile/"+encodeURIComponent(String(target)));}catch(e){}
    }
    if(!data && isSelf){
      const identity=playerIdentity();
      data={id:playerId,avatar:identity.avatar,name:identity.name,username:identity.username,stats:playerStats,achievements:null};
    }
    if(!data)data={id:String(target||""),avatar:"👾",name:"Игрок",username:"",stats:{portalSeconds:0,gameSeconds:0,gameLaunches:0,messagesSent:0,chatSeconds:0,activeDays:[]}};
    profileTargetId=String(data.id||target||playerId);
    const profileAvatarBtn=document.getElementById("playerProfileAvatar");
    profileAvatarBtn.textContent=(isSelf?currentAvatar:(data.avatar||"👾"));
    profileAvatarBtn.disabled=!isSelf;
    profileAvatarBtn.setAttribute("aria-disabled",String(!isSelf));
    profileAvatarBtn.title=isSelf ? "Avatar Loadout" : "Avatar";
    document.getElementById("playerProfileName").textContent=data.name||data.username||"Игрок";
    document.getElementById("playerProfileUsername").textContent=data.username||"";
    const s=data.stats||{};
    document.getElementById("profilePortalTime").textContent=formatDuration(s.portalSeconds);
    document.getElementById("profileGameTime").textContent=formatDuration(s.gameSeconds);
    document.getElementById("profileGameLaunches").textContent=String(s.gameLaunches||0);
    document.getElementById("profileMessages").textContent=String(s.messagesSent||0);
    document.getElementById("profileChatTime").textContent=formatDuration(s.chatSeconds);
    document.getElementById("profileActiveDays").textContent=String(Array.isArray(s.activeDays)?s.activeDays.length:(s.activeDays||0));
    const list=document.getElementById("profileAchievementsList");
    if(list){
      const ach=data.achievements||ACHIEVEMENT_DEFS.map(a=>({icon:a.icon,name:a.name[currentLang]||a.name.en,desc:a.desc[currentLang]||a.desc.en,unlocked:!!a.ok(playerStats)}));
      list.innerHTML=ach.map(a=>'<div class="player-achievement '+(a.unlocked?"":"locked")+'"><div class="player-achievement-icon">'+(a.unlocked?a.icon:"🔒")+'</div><div><div class="player-achievement-name">'+a.name+'</div><div class="player-achievement-desc">'+a.desc+'</div></div></div>').join("");
    }
    const labels={ru:["ПОРТАЛ","ИГРЫ","ЗАПУСКОВ ИГР","СООБЩЕНИЙ","В ЧАТЕ","ДНЕЙ АКТИВНОСТИ","🏆 АЧИВКИ","ЗАКРЫТЬ"],de:["PORTAL","SPIELE","SPIELSTARTS","NACHRICHTEN","CHATZEIT","AKTIVE TAGE","🏆 ERFOLGE","SCHLIESSEN"],en:["PORTAL","GAMES","GAME LAUNCHES","MESSAGES","CHAT TIME","ACTIVE DAYS","🏆 ACHIEVEMENTS","CLOSE"]}[currentLang]||[];
    ["profilePortalLabel","profileGameLabel","profileLaunchesLabel","profileMessagesLabel","profileChatTimeLabel","profileDaysLabel","profileAchievementsTitle","playerProfileClose"].forEach((x,i)=>{const e=document.getElementById(x);if(e&&labels[i])e.textContent=labels[i]});
    const dmBtn=document.getElementById("playerProfileMessageBtn");
    if(dmBtn){const other=profileTargetId && profileTargetId!==playerId && chatAuthorized;dmBtn.classList.toggle("hidden",!other);}
    id.classList.remove("hidden");
  }
  function closePlayerProfile(){const el=document.getElementById("playerProfileOverlay");if(el)el.classList.add("hidden");}
  function openPlayerProfile(target){syncTelegramIdentity();renderPlayerProfile(target||playerId);haptic();}
  document.getElementById("playerProfileMessageBtn").addEventListener("click",()=>{if(profileTargetId&&profileTargetId!==playerId){closePlayerProfile();switchTab("guest");setTimeout(()=>openDm(profileTargetId),0);}});

  document.getElementById("userNameTxt").addEventListener("click",()=>openPlayerProfile(playerId));
  document.getElementById("playerProfileClose").addEventListener("click",closePlayerProfile);
  document.getElementById("playerProfileOverlay").addEventListener("click",e=>{
    if(e.target.id==="playerProfileOverlay")closePlayerProfile();
  });

  // LOCAL BROWSER CHAT
  let chatAuthorized=false;
  let chatRoom="main";
  let activeDmUserId=null;
  let chatBusy=false;

  async function api(path, options={}){
    const key="freezzzBrowserChatV1";
    const read=()=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(e){return []}};
    const write=v=>localStorage.setItem(key,JSON.stringify(v));
    const body=options&&options.body&&typeof options.body==="object"?options.body:{};
    if(path.startsWith("/chat/messages") && (!options.method || options.method==="GET")){
      const room=(new URLSearchParams(path.split("?")[1]||"")).get("room")||"main"; const list=read().filter(x=>x.room===room);
      return {messages:list.slice(-100)};
    }
    if(path==="/chat/messages" && options.method==="POST"){
      const list=read();
      list.push({playerId:playerId,username:"browser_test",name:"Browser Player",avatar:"🧑‍💻",text:String(body.text||""),room:body.room||"main",createdAt:new Date().toISOString()});
      write(list);
      return {ok:true};
    }
    if(path==="/dm") return {conversations:[]};
    if(path.startsWith("/dm/") && path.endsWith("/messages")) return {messages:[]};
    if(path.startsWith("/dm/") && options.method==="POST") return {ok:true};
    if(path.startsWith("/profile/")) return {id:playerId,avatar:"🧑‍💻",name:"Browser Player",username:"@browser_test",stats:playerStats,achievements:null};
    if(path==="/stats") return {ok:true};
    return {};
  }

  function chatSetStatus(text,ok=false){
    const el=document.getElementById("chatAuthState");
    if(el){el.textContent=text;el.style.color=ok?"var(--tg-text)":"var(--tg-text-secondary)";}
  }

  async function authorizeChat(){
    chatAuthorized=true;
    chatSetStatus(tr("authOk"),true);
    syncTelegramIdentity();
    return true;
  }

  function escapeHtml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
  function formatMsgTime(v){try{return new Date(v).toLocaleTimeString(currentLang==="ru"?"ru-RU":currentLang==="de"?"de-DE":"en-US",{hour:"2-digit",minute:"2-digit"});}catch(e){return "";}}
  function roomLabel(room){return room==="games"?"🎮 "+tr("roomGames"):room==="relax"?"🌙 "+tr("roomRelax"):"🏠 "+tr("roomMain");}

  async function loadMessages(){
    if(!chatAuthorized)return;
    const list=document.getElementById("guestList"); if(!list)return;
    try{
      const data=await api("/chat/messages?room="+encodeURIComponent(chatRoom)+"&limit=100");
      const messages=data.messages||[];
      list.innerHTML=messages.length?messages.map(m=>{
        const own=String(m.playerId)===playerId;
        return '<div class="guest-msg '+(own?"chat-message-own":"")+'"><div class="guest-author" data-player-id="'+escapeHtml(m.playerId)+'">'+escapeHtml(m.avatar||"👾")+" "+escapeHtml(m.username||m.name||"Игрок")+'<span class="chat-msg-time">'+formatMsgTime(m.createdAt)+'</span></div><div class="chat-message-block">'+escapeHtml(m.text)+'</div></div>';
      }).join(""):'<div class="guest-msg">'+tr("noMessages")+'</div>';
      list.querySelectorAll(".guest-author").forEach(el=>el.addEventListener("click",()=>openPlayerProfile(el.dataset.playerId)));
    }catch(e){chatSetStatus(tr("chatApiError")+e.message);}
  }

  async function sendChatMessage(){
    if(chatBusy)return;
    const input=document.getElementById("guestInput");
    const textValue=(input.value||"").trim();
    if(!textValue || !chatAuthorized)return;
    chatBusy=true;
    try{
      await api("/chat/messages",{method:"POST",body:{room:chatRoom,text:textValue}});
      input.value="";
      playerStats.messagesSent++; savePlayerStats();
      await loadMessages(); haptic();
    }catch(e){chatSetStatus(tr("chatApiError")+e.message);}
    finally{chatBusy=false;}
  }

  async function loadDmList(){
    if(!chatAuthorized)return;
    const box=document.getElementById("dmList");
    try{
      const data=await api("/dm");
      box.innerHTML=(data.conversations||[]).map(x=>'<button class="dm-item" data-dm-id="'+escapeHtml(x.playerId)+'"><span class="dm-item-avatar">'+escapeHtml(x.avatar||"👾")+'</span><span><div class="dm-item-name">'+escapeHtml(x.username||x.name||tr("player"))+'</div><div class="dm-item-preview">'+escapeHtml(x.lastMessage||"")+'</div></span></button>').join("")||'<div class="guest-msg">'+tr("noDialogs")+'</div>';
      box.querySelectorAll(".dm-item").forEach(el=>el.addEventListener("click",()=>openDm(el.dataset.dmId)));
    }catch(e){chatSetStatus(tr("dmApiError")+e.message);}
  }

  async function openDm(targetId){
    if(!chatAuthorized || !targetId || String(targetId)===playerId)return;
    activeDmUserId=String(targetId);
    document.getElementById("guestList").classList.add("hidden");
    document.getElementById("dmList").classList.add("hidden");
    document.getElementById("dmThread").classList.remove("hidden");
    document.getElementById("chatCompose").classList.remove("hidden");
    try{
      const p=await api("/profile/"+encodeURIComponent(activeDmUserId));
      document.getElementById("dmThreadTitle").textContent=p.username||p.name||tr("dmTitle");
      const data=await api("/dm/"+encodeURIComponent(activeDmUserId)+"/messages?limit=100");
      const list=document.getElementById("dmMessageList");
      list.innerHTML=(data.messages||[]).map(m=>'<div class="guest-msg '+(String(m.senderId)===playerId?"chat-message-own":"")+'"><div class="guest-author">'+escapeHtml(m.username||m.name||"Игрок")+'<span class="chat-msg-time">'+formatMsgTime(m.createdAt)+'</span></div><div>'+escapeHtml(m.text)+'</div></div>').join("")||'<div class="guest-msg">'+tr("noMessages")+'</div>';
      list.scrollTop=list.scrollHeight;
    }catch(e){chatSetStatus(tr("dmApiError")+e.message);}
  }

  async function sendDmMessage(){
    if(!activeDmUserId||chatBusy)return;
    const input=document.getElementById("guestInput"), textValue=(input.value||"").trim();
    if(!textValue)return;
    chatBusy=true;
    try{await api("/dm/"+encodeURIComponent(activeDmUserId)+"/messages",{method:"POST",body:{text:textValue}});input.value="";playerStats.messagesSent++;savePlayerStats();await openDm(activeDmUserId);haptic();}
    catch(e){chatSetStatus("DM: "+e.message);}
    finally{chatBusy=false;}
  }

  function selectChatRoom(room){
    chatRoom=room; activeDmUserId=null;
    document.querySelectorAll(".chat-room-tab").forEach(b=>b.classList.toggle("active",b.dataset.room===room));
    document.getElementById("chatRoomTitle").textContent=roomLabel(room);
    document.getElementById("guestList").classList.remove("hidden");
    document.getElementById("dmList").classList.add("hidden");
    document.getElementById("dmThread").classList.add("hidden");
    document.getElementById("chatCompose").classList.remove("hidden");
    loadMessages();
  }

  function selectDmMode(){
    activeDmUserId=null;
    document.querySelectorAll(".chat-room-tab").forEach(b=>b.classList.toggle("active",b.dataset.room==="dm"));
    document.getElementById("chatRoomTitle").textContent="✉️ "+tr("dmTitle");
    document.getElementById("guestList").classList.add("hidden");
    document.getElementById("dmList").classList.remove("hidden");
    document.getElementById("dmThread").classList.add("hidden");
    document.getElementById("chatCompose").classList.add("hidden");
    loadDmList();
  }

  document.querySelectorAll(".chat-room-tab").forEach(b=>b.addEventListener("click",()=>b.dataset.room==="dm"?selectDmMode():selectChatRoom(b.dataset.room)));
  document.getElementById("chatBackBtn").addEventListener("click",()=>switchTab("games"));
  document.getElementById("chatRefreshBtn").addEventListener("click",()=>activeDmUserId?openDm(activeDmUserId):chatRoom?loadMessages():loadDmList());
  document.getElementById("dmBackBtn").addEventListener("click",selectDmMode);
  document.getElementById("sendMsgBtn").addEventListener("click",()=>activeDmUserId?sendDmMessage():sendChatMessage());
  document.getElementById("guestInput").addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("sendMsgBtn").click();});

  async function openChatPanel(){
    const ok=await authorizeChat();
    if(ok){selectChatRoom(chatRoom);}
  }
  // Chat is authenticated only when the user opens it.
  // This keeps the portal/game catalog independent from the API wake-up path.
  setInterval(()=>{if(chatAuthorized && !document.hidden && !document.getElementById("guestView").classList.contains("hidden")){activeDmUserId?openDm(activeDmUserId):chatRoom&&loadMessages();}},10000);
  // After Chat has been opened once, check for newer messages while the popup is closed.
  setInterval(async()=>{
    if(!chatAuthorized || document.hidden || !chatLastSeenAt || !document.getElementById("guestView").classList.contains("hidden"))return;
    try{
      const data=await api("/chat/messages?room="+encodeURIComponent(chatRoom)+"&limit=20");
      const newest=(data.messages||[]).reduce((max,m)=>Math.max(max,Date.parse(m.createdAt||"")||0),0);
      if(newest>chatLastSeenAt)setChatUnread(true);
    }catch(e){}
  },20000);

  // АВАТАРЫ
  const possibleAvatars = ["👾", "🤖", "👽", "🦊", "🐯", "🐼", "🦄", "🐲", "👻", "💀", "👑", "🚀", "⚡", "💎", "🕹️", "🔥"];
  let userAvatars = JSON.parse(localStorage.getItem("freezzzAvatars") || '["👾"]');
  let currentAvatar = localStorage.getItem("freezzzCurrentAvatar") || userAvatars[0];

  const todayStr = new Date().toDateString();
  if (localStorage.getItem("freezzzLastAvatarDate") !== todayStr) {
    const randomNew = possibleAvatars[Math.floor(Math.random() * possibleAvatars.length)];
    if (!userAvatars.includes(randomNew)) {
      userAvatars.push(randomNew);
      localStorage.setItem("freezzzAvatars", JSON.stringify(userAvatars));
    }
    localStorage.setItem("freezzzLastAvatarDate", todayStr);
  }
  const avatarEmojiEl = document.getElementById('currentAvatarEmoji');
  if (avatarEmojiEl) avatarEmojiEl.textContent = currentAvatar;

  function openAvatarModal() {
    haptic();
    const grid = document.getElementById('avatarGrid');
    if (grid) {
      grid.innerHTML = userAvatars.map(av => `
        <div class="avatar-item ${av === currentAvatar ? 'active' : ''}" data-avatar="${av}">${av}</div>
      `).join('');
      // Навешиваем клики на аватары в модалке
      grid.querySelectorAll('.avatar-item').forEach(item => {
        item.addEventListener('click', () => {
          selectAvatar(item.getAttribute('data-avatar'));
        });
      });
    }
    document.getElementById('avatarModal').classList.remove('hidden');
  }

  function closeAvatarModal() {
    haptic();
    document.getElementById('avatarModal').classList.add('hidden');
  }

  function selectAvatar(av) {
    haptic();
    currentAvatar = av;
    localStorage.setItem("freezzzCurrentAvatar", av);
    if (avatarEmojiEl) avatarEmojiEl.textContent = av;
    const profileAvatar=document.getElementById("playerProfileAvatar");
    if(profileAvatar) profileAvatar.textContent=av;
    closeAvatarModal();
  }

  document.getElementById('userProfileBox').addEventListener('click', ()=>openPlayerProfile(playerId));
  document.getElementById('playerProfileAvatar').addEventListener('click', openAvatarModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeAvatarModal);

  // Fixed portal appearance: dark theme is the only standard; sound is always enabled.
  const themes=["theme-dark"];
  let currentThemeIdx=0;
  function applyTheme(){ document.getElementById('bodyRoot').className='theme-dark'; }
  applyTheme();

  // Звук / Вибрация
  let soundEnabled = true;

  // TECHNO.FM RADIO — separate module; starts only after a user action.
  const TECHNO_FM_STREAM = "https://stream.techno.fm/radio1-320k.mp3";
  const radioAudio = document.getElementById("technoFmAudio");
  const radioOverlay = document.getElementById("radioOverlay");
  const radioStatus = document.getElementById("radioStatus");
  function setRadioStatus(text){ if(radioStatus) radioStatus.textContent=text; }

  async function playTechnoFm(){
    if(!radioAudio)return;
    try{
      radioAudio.src=TECHNO_FM_STREAM;
      await radioAudio.play();
      setRadioStatus("PLAYING • TECHNO.FM 320K");
    }catch(e){
      setRadioStatus("PLAY ERROR • TAP PLAY AGAIN");
    }
  }

  function stopTechnoFm(){
    if(!radioAudio)return;
    try{
      radioAudio.pause();
      radioAudio.currentTime=0;
      radioAudio.removeAttribute("src");
      radioAudio.load();
    }catch(e){}
    setRadioStatus("STOPPED");
  }

  function openRadioPanel(){
    radioOverlay?.classList.remove("hidden");
    setRadioStatus(radioAudio?.paused!==false?"PLAYING • TECHNO.FM 320K":"STOPPED");
  }

  function closeRadioPanel(){
    radioOverlay?.classList.add("hidden");
  }

  // Верхняя кнопка только открывает радио-бар. Она не управляет воспроизведением.
  document.getElementById("radioPlayBtn")?.addEventListener("click",openRadioPanel);

  // Воспроизведение и остановка доступны только внутри всплывающего радио-бара.
  document.getElementById("radioPanelPlay")?.addEventListener("click",playTechnoFm);
  document.getElementById("radioPanelStop")?.addEventListener("click",stopTechnoFm);
  document.getElementById("radioCloseBtn")?.addEventListener("click",closeRadioPanel);
  radioOverlay?.addEventListener("click",e=>{if(e.target===radioOverlay)closeRadioPanel();});

  function haptic() {
    if (soundEnabled && tg && tg.HapticFeedback) {
      try { tg.HapticFeedback.impactOccurred('light'); } catch(e){}
    }
  }

  // Нижняя навигация: только ЧАТ. Игры — основной экран, достижения находятся в визитке игрока.
  function switchTab(tab) {
    haptic();
    window.FZG?.state?.set?.({screen: tab === 'guest' ? 'chat' : 'home', categoryId: null, gameId: null});
    document.getElementById('gamesBrowser').classList.toggle('hidden', tab !== 'games');
    document.getElementById('achievementsView').classList.add('hidden');
    document.getElementById('guestView').classList.toggle('hidden', tab !== 'guest');
    const chatTab=document.getElementById('tabGuest');
    if(chatTab) chatTab.classList.toggle('active', tab==='guest');
    if(tab==='games'){
      showCategoryList(false);
    }else if(tab==='guest'){
      markChatSeen();
      openChatPanel();
    }
  }

  const chatUnreadDot=document.getElementById('chatUnreadDot');
  let chatLastSeenAt=Number(localStorage.getItem("freezzzChatLastSeenAt")||0);
  function setChatUnread(value){chatUnreadDot?.classList.toggle("hidden",!value);}
  function markChatSeen(){
    chatLastSeenAt=Date.now();
    localStorage.setItem("freezzzChatLastSeenAt",String(chatLastSeenAt));
    setChatUnread(false);
  }
  const chatTabButton=document.getElementById('tabGuest');
  if(chatTabButton && !chatTabButton.dataset.bound){
    chatTabButton.dataset.bound='1';
    chatTabButton.addEventListener('click',()=>switchTab('guest'));
  }

  const GAME_CARDS = [
    {id:"deepsea",title:"The Deep Sea",emoji:"🌊",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Исследуй глубины океана."},
    {id:"starschrono",title:"Stars Chrono Experiment",emoji:"⭐",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Экспериментальный интерактивный проект."},
    {id:"windowswap",title:"Window Swap",emoji:"🪟",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Смотри на окна и виды из разных мест."},
    {id:"spaceelevator",title:"Space Elevator",emoji:"🚀",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Поднимайся от поверхности Земли к космосу."},
    {id:"ancientearth",title:"Ancient Earth Globe",emoji:"🌍",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Исследуй Землю в разные геологические эпохи."},
    {id:"radiogarden",title:"Radio Garden",emoji:"📻",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Исследуй радиостанции по всему миру."},
    {id:"geoguessr",title:"GeoGuessr",emoji:"🗺️",genre:"ИНТЕРАКТИВНЫЙ МИР",desc:"Определяй места по панорамам и географии."},
    {id:"patatap",title:"Patatap",emoji:"🎹",genre:"ТВОРЧЕСТВО",desc:"Создавай звуки и анимации нажатием клавиш."},
    {id:"lusion",title:"LUSION",emoji:"✨",genre:"ТВОРЧЕСТВО",desc:"Интерактивный цифровой визуальный опыт."},
    {id:"brunosimon",title:"Bruno Simon Portfolio",emoji:"🚗",genre:"ТВОРЧЕСТВО",desc:"Интерактивное 3D-портфолио."},
    {id:"pollock",title:"Jackson Pollock Art",emoji:"🎨",genre:"ТВОРЧЕСТВО",desc:"Интерактивный проект о живописи Jackson Pollock."},
    {id:"typatone",title:"Typatone",emoji:"🎵",genre:"ТВОРЧЕСТВО",desc:"Превращай текст в музыку."},
    {id:"plink",title:"Plink",emoji:"🎶",genre:"ТВОРЧЕСТВО",desc:"Интерактивный музыкальный эксперимент."},
    {id:"linerider",title:"Line Rider",emoji:"✏️",genre:"ТВОРЧЕСТВО",desc:"Рисуй трассы и наблюдай за движением персонажа."},
    {id:"2048",title:"2048",emoji:"🔢",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Соединяй одинаковые плитки."},
    {id:"password",title:"The Password Game",emoji:"🔐",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Создай пароль, выполняющий всё больше правил."},
    {id:"remojibus",title:"Remojibus",emoji:"🧩",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Разгадывай ребусы из эмодзи."},
    {id:"fillsquare",title:"Fill the Square",emoji:"◼️",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Заполняй поле и решай пространственные задачи."},
    {id:"ricochetdaily",title:"Ricochet Daily",emoji:"🔵",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Рассчитывай отскоки и проходи ежедневную задачу."},
    {id:"evolutiontrust",title:"The Evolution of Trust",emoji:"🤝",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Интерактивное исследование доверия и стратегии."},
    {id:"littlealchemy2",title:"Little Alchemy 2",emoji:"🧪",genre:"ПАЗЛЫ И ЛОГИКА",desc:"Соединяй элементы и открывай новые."},
    {id:"snake",title:"Snake",emoji:"🐍",genre:"АРКАДЫ И КЛАССИКА",desc:"Классическая змейка."},
    {id:"doodlejump",title:"Doodle Jump",emoji:"🦘",genre:"АРКАДЫ И КЛАССИКА",desc:"Прыгай всё выше по платформам."},
    {id:"puffpilot",title:"Puff Pilot",emoji:"💨",genre:"АРКАДЫ И КЛАССИКА",desc:"Проводи воздушный поток через кольца."},
    {id:"pokeclicker",title:"PokéClicker",emoji:"⚡",genre:"АРКАДЫ И КЛАССИКА",desc:"Кликер с коллекционированием существ."},
    {id:"candybox2",title:"Candy Box 2",emoji:"🍬",genre:"АРКАДЫ И КЛАССИКА",desc:"Накопление конфет превращается в приключение."},
    {id:"dino",title:"Dino T-Rex Game",emoji:"🦖",genre:"АРКАДЫ И КЛАССИКА",desc:"Мини-игра с бегущим динозавром."},
    {id:"pip",title:"PIP: Skull Demo",emoji:"💀",genre:"АРКАДЫ И КЛАССИКА",desc:"Небольшой браузерный игровой прототип."},
    {id:"townscaper",title:"Townscaper",emoji:"🏘️",genre:"СИМУЛЯТОРЫ И ПЕСКОЧНИЦЫ",desc:"Строй маленькие города без заданного сценария."},
    {id:"infinitecraft",title:"Infinite Craft",emoji:"🧪",genre:"СИМУЛЯТОРЫ И ПЕСКОЧНИЦЫ",desc:"Комбинируй элементы и открывай новые."},
    {id:"addtown",title:"Add Town ≈ 2048!",emoji:"🏙️",genre:"СИМУЛЯТОРЫ И ПЕСКОЧНИЦЫ",desc:"Объединяй плитки и развивай город."},
    {id:"gridland",title:"Gridland",emoji:"🏰",genre:"СИМУЛЯТОРЫ И ПЕСКОЧНИЦЫ",desc:"Соединяй ресурсы и развивай поселение."},
    {id:"bouncyballs",title:"Bouncy Balls",emoji:"⚪",genre:"СИМУЛЯТОРЫ И ПЕСКОЧНИЦЫ",desc:"Интерактивные прыгающие шарики."},
    {id:"alchemy2",title:"Alchemy 2",emoji:"⚗️",genre:"СИМУЛЯТОРЫ И ПЕСКОЧНИЦЫ",desc:"Комбинируй элементы и создавай новые."},
    {id:"protocol",title:"Protocol ERRORMIND",emoji:"🧠",genre:"ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",desc:"Браузерная серия логических уровней."},
    {id:"lumenoffice",title:"Lumen Office RPG",emoji:"🏢",genre:"ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",desc:"Исследуй офис и решай загадки."},
    {id:"typehelp",title:"Type Help",emoji:"⌨️",genre:"ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",desc:"Небольшая браузерная игра на набор текста."},
    {id:"alchemize",title:"Alchemize",emoji:"🧫",genre:"ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",desc:"Эксперимент с комбинациями и алхимией."},
    {id:"polkadot",title:"Polka Dot Swim Chain",emoji:"🔵",genre:"ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",desc:"Название сохранено по записи на фотографии."},
    {id:"krunker",title:"Krunker",emoji:"🎯",genre:"АРКАДЫ • ЭКШЕН",desc:"Браузерный соревновательный шутер."},
    {id:"tanki",title:"Tanki Online",emoji:"🛡️",genre:"АРКАДЫ • ЭКШЕН",desc:"Браузерный танковый экшен."},
    {id:"diepio",title:"Diep.io",emoji:"🔵",genre:"АРКАДЫ • ЭКШЕН",desc:"Браузерная аркада с танками и развитием."},
  ];
  const CATEGORIES = [
    {id:"worlds",name:"ИНТЕРАКТИВНЫЕ МИРЫ",icon:"🌌",ids:["deepsea","starschrono","windowswap","spaceelevator","ancientearth","radiogarden","geoguessr"]},
    {id:"creative",name:"ТВОРЧЕСТВО • МУЗЫКА • АРТ",icon:"🎨",ids:["patatap","lusion","brunosimon","pollock","typatone","plink","linerider"]},
    {id:"puzzles",name:"ПАЗЛЫ • ЛОГИКА",icon:"🧩",ids:["2048","password","remojibus","fillsquare","ricochetdaily","evolutiontrust","littlealchemy2"]},
    {id:"arcade",name:"АРКАДЫ • КЛАССИКА",icon:"🕹️",ids:["snake","doodlejump","puffpilot","pokeclicker","candybox2","dino","pip","krunker","tanki","diepio"]},
    {id:"sandbox",name:"СИМУЛЯТОРЫ • ПЕСКОЧНИЦЫ",icon:"🌍",ids:["townscaper","infinitecraft","addtown","gridland","bouncyballs","alchemy2"]},
    {id:"experimental",name:"ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ",icon:"⚡",ids:["protocol","lumenoffice","typehelp","alchemize","polkadot"]},
  ];
  const GAME_BY_ID = Object.fromEntries(GAME_CARDS.map(g => [g.id,g]));
  let currentCategory = null;
  let categoryGameIndex = 0;
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeStartTime = 0;

  function showCategoryList(animate=true){
    currentCategory=null;
    document.getElementById('categoryList').classList.remove('hidden');
    document.getElementById('categoryView').classList.add('hidden');
    if(animate){
      const list=document.getElementById('categoryList');
      list.animate([{opacity:.35,transform:'translateX(-14px)'},{opacity:1,transform:'translateX(0)'}],{duration:220,easing:'cubic-bezier(.22,.8,.22,1)'});
    }
  }

  function openCategory(categoryId){
    const category=CATEGORIES.find(c=>c.id===categoryId);
    window.FZG?.state?.set?.({screen:'category', categoryId});
    if(!category)return;
    currentCategory=category;
    categoryGameIndex=0;
    document.getElementById('categoryList').classList.add('hidden');
    document.getElementById('categoryView').classList.remove('hidden');
    document.getElementById('categoryHeadTitle').textContent=categoryText(category.id);
    renderCategoryCarousel();
    haptic();
  }

  function renderCategories(){
    const list=document.getElementById('categoryList');
    list.innerHTML=CATEGORIES.map(c=>{
      const count=c.ids.length;
      return '<button class="category-item" data-category="'+c.id+'">'+
        '<span class="category-icon">'+c.icon+'</span>'+
        '<span class="category-copy"><span class="category-name">'+categoryText(c.id)+'</span><span class="category-count">'+count+' '+(count===1?tr('oneGame'):tr('gamesCount'))+'</span></span>'+
        '<span class="category-arrow">›</span>'+
      '</button>';
    }).join('');
    list.querySelectorAll('.category-item').forEach(btn=>{
      btn.addEventListener('click',()=>openCategory(btn.dataset.category));
    });
  }

  /* Official/creator-sourced artwork where a direct public image URL is available.
     Other cards use the official game's domain icon as a safe visual fallback. */
  // Polished vector poster for every game: no generic favicon/red placeholder.
  const GAME_LOGOS = {};

  function escapeSvgText(value){
    return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function hashCode(value){
    let h=0; const s=String(value);
    for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0;
    return h;
  }

  function posterDataUrl(id){
    const g=GAME_BY_ID[id] || {title:id,emoji:'🎮',genre:'ARCADE'};
    const palettes=[
      ['#07152f','#0b6e99','#19e6d0'],['#210b38','#7c1fff','#ff4fd8'],
      ['#351008','#d64b1f','#ffd166'],['#061d19','#078f75','#72f1b8'],
      ['#17122e','#4d55d9','#8ee3ff'],['#271006','#b83255','#ff9f68']
    ];
    const p=palettes[Math.abs(hashCode(id))%palettes.length];
    const title=escapeSvgText(g.title), genre=escapeSvgText(g.genre||'ARCADE'), emoji=escapeSvgText(g.emoji||'🎮');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">'+
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".55" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient>'+
      '<radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
      '<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".10"/></pattern>'+
      '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity=".38"/></filter></defs>'+
      '<rect width="900" height="620" fill="url(#bg)"/><circle cx="690" cy="120" r="230" fill="url(#glow)"/><rect width="900" height="620" fill="url(#grid)"/>'+
      '<path d="M-60 500 C170 360 280 610 500 445 S760 310 960 430" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="70"/>'+
      '<path d="M-40 505 C170 375 285 590 500 455 S760 330 940 445" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3"/>'+
      '<g filter="url(#shadow)"><circle cx="450" cy="255" r="126" fill="#07101f" fill-opacity=".52" stroke="#fff" stroke-opacity=".22" stroke-width="3"/><text x="450" y="302" text-anchor="middle" font-size="145" font-family="system-ui,Segoe UI Emoji,Apple Color Emoji,sans-serif">'+emoji+'</text></g>'+
      '<text x="48" y="72" fill="#fff" fill-opacity=".78" font-size="20" font-family="monospace" font-weight="700" letter-spacing="4">FREEzzzGAMES • '+genre.toUpperCase()+'</text>'+
      '<text x="48" y="548" fill="#fff" font-size="42" font-family="system-ui,sans-serif" font-weight="900" letter-spacing="2">'+title+'</text>'+
      '<rect x="48" y="570" width="160" height="5" rx="3" fill="#fff" fill-opacity=".65"/></svg>';
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }

  function gameLogoUrl(id){ return posterDataUrl(id); }

  function renderCategoryCarousel(){
    if(!currentCategory)return;
    const ids=currentCategory.ids;
    const track=document.getElementById('gamesTrack');
    const dots=document.getElementById('carouselDots');
    if(!track||!dots)return;
    track.innerHTML=ids.map((id,i)=>{
      const g=GAME_BY_ID[id];
      const offset=i-categoryGameIndex;
      let cls='game-card is-hidden';
      if(offset===0)cls='game-card is-active';
      else if(offset===-1)cls='game-card is-prev';
      else if(offset===1)cls='game-card is-next';
      return '<div class="'+cls+'" data-carousel-game="'+g.id+'">'+
        '<div class="game-card-art">'+
          '<img class="game-card-logo" src="'+gameLogoUrl(g.id)+'" alt="'+g.title.replace(/"/g,'&quot;')+'" loading="eager" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">'+
          '<span class="game-card-logo-fallback" style="display:none">'+g.emoji+'</span>'+        '</div>'+
        '<div class="game-card-body">'+
          '<div class="game-card-title">'+g.title+'</div>'+
          '<div class="game-card-desc">'+gameText(g.id,'desc')+'</div>'+
          '<div class="game-card-meta"><span>'+gameText(g.id,'genre')+'</span><span class="game-card-play">'+tr('play')+'</span></div>'+
        '</div></div>';
    }).join('');
    dots.innerHTML=ids.map((id,i)=>'<span class="carousel-dot '+(i===categoryGameIndex?'active':'')+'"></span>').join('');
    const active=track.querySelector('.game-card.is-active');
    if(active) active.addEventListener('click',()=>openExternal(GAME_LINKS[active.dataset.carouselGame]));
  }

  function moveCategoryGame(delta){
    if(!currentCategory)return;
    const len=currentCategory.ids.length;
    if(len<2)return;
    const next=Math.max(0,Math.min(len-1,categoryGameIndex+delta));
    if(next===categoryGameIndex)return;
    categoryGameIndex=next;
    haptic();
    renderCategoryCarousel();
  }

  const carousel=document.getElementById('gamesCarousel');
  carousel.addEventListener('touchstart',e=>{
    const t=e.touches[0]; if(!t)return;
    swipeStartX=t.clientX; swipeStartY=t.clientY; swipeStartTime=Date.now();
  },{passive:true});
  carousel.addEventListener('touchend',e=>{
    const t=e.changedTouches[0]; if(!t)return;
    const dx=t.clientX-swipeStartX;
    const dy=t.clientY-swipeStartY;
    const dt=Math.max(1,Date.now()-swipeStartTime);
    const velocity=Math.abs(dx)/dt;
    if(Math.abs(dx)>38 && Math.abs(dx)>Math.abs(dy)*1.15 && (Math.abs(dx)>55 || velocity>.35)){
      moveCategoryGame(dx<0?1:-1);
    }
  },{passive:true});

  // Language initialization is performed after GAME_CARDS/CATEGORIES/GAME_LINKS are initialized.

  function returnToMainMenu(){
    window.FZG?.state?.set?.({screen:'home', categoryId:null, gameId:null, modal:null});
    const cv=document.getElementById('categoryView');
    const cl=document.getElementById('categoryList');
    if(cv)cv.classList.add('hidden');
    if(cl)cl.classList.remove('hidden');
    currentCategory=null;
    categoryGameIndex=0;
    renderCategories();
    haptic();
  }

  

/* CHAT BACK — explicit in-app control; no edge-swipe so Telegram/Android system navigation stays untouched */
  document.getElementById('categoryBack').addEventListener('click',returnToMainMenu);

  const GAME_LINKS = {
    "deepsea":"https://neal.fun/deep-sea/",
    "windowswap":"https://window-swap.com/",
    "spaceelevator":"https://neal.fun/space-elevator/",
    "ancientearth":"https://dinosaurpictures.org/ancient-earth/",
    "radiogarden":"https://radio.garden/",
    "geoguessr":"https://www.geoguessr.com/",
    "patatap":"https://patatap.com/",
    "brunosimon":"https://bruno-simon.com/",
    "pollock":"https://www.moma.org/interactives/exhibitions/1998/pollock/website100/txt_intro.html",
    "typatone":"https://typatone.com/",
    "plink":"https://www.experiments.withgoogle.com/plink-multiplayer-music-experience",
    "linerider":"https://www.linerider.com/",
    "2048":"https://play2048.co/",
    "password":"https://neal.fun/password-game/",
    "remojibus":"https://starzonmyarmz.github.io/remojibus/",
    "fillsquare":"https://ryanbalieiro.github.io/fill-the-square/",
    "ricochetdaily":"https://teknamin.github.io/ricochet-daily/",
    "evolutiontrust":"https://ncase.me/trust/",
    "littlealchemy2":"https://littlealchemy2.com/",
    "snake":"https://www.snake.at/game/1.3/index.html",
    "doodlejump":"https://cozyrain.github.io/DoodleJumpGame/",
    "puffpilot":"https://bte808.github.io/fun-20260601-a-puff-pilot/",
    "pokeclicker":"https://www.pokeclicker.com/",
    "candybox2":"https://candybox2.github.io/",
    "dino":"https://chromedino.com/",
    "pip":"https://bandinopla.github.io/pip-skull-demo/",
    "townscaper":"https://www.townscapergame.com/",
    "infinitecraft":"https://neal.fun/infinite-craft/",
    "addtown":"https://www.lexaloffle.com/bbs/?pid=add_town",
    "gridland":"https://gridland.doublespeakgames.com/",
    "bouncyballs":"https://bouncyballs.org/",
    "alchemy2":"https://littlealchemy2.com/",
    "protocol":"https://protocol-errormind.github.io/",
    "lumenoffice":"https://samirsaad786.github.io/LumenOfficeRPG/",
    "typehelp":"https://william-rous.itch.io/type-help",
    "krunker":"https://krunker.io/",
    "tanki":"https://tankionline.com/",
    "diepio":"https://diep.io/",
  };
  function openExternal(url) {
    if (!url) return;
    haptic();
    const gameId=Object.keys(GAME_LINKS).find(k=>GAME_LINKS[k]===url);
    if(gameId)trackGameLaunch(gameId);
    try {
      if (tg && typeof tg.openLink === 'function') tg.openLink(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch(e) {
      window.location.href = url;
    }
  }

  // Final portal boot. Keep rendering isolated so one optional module cannot blank the whole portal.
  function bootPortal(){
    try{
      applyLanguage();
      showCategoryList(false);
    }catch(err){
      console.error("FREEzzzGames boot error:",err);
      const list=document.getElementById("categoryList");
      if(list){
        list.classList.remove("hidden");
        list.innerHTML='<div style="padding:16px;border:1px solid #e52225;border-radius:10px;background:#fff;color:#17212b;font:12px monospace;text-align:left"><b>FREEzzzGames</b><br>Portal boot error.<br><small>'+String(err&&err.message||err).replace(/</g,"&lt;")+'</small></div>';
      }
    }
  }
  bootPortal();

  // Public bridge for the new application shell. Existing feature functions remain intact.
  window.FZG = window.FZG || {};
  window.FZG.legacy = {
    switchTab,
    showCategoryList,
    openCategory,
    returnToMainMenu,
    openPlayerProfile,
    closePlayerProfile,
    openAvatarModal,
    closeAvatarModal,
    openRadioPanel,
    closeRadioPanel
  };
});
