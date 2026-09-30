import { LANGS, LANG, GAME_TEXT, CATEGORY_TEXT } from "./portal-data/i18n.js?v=20260930e4";
import { ACTION_HINTS } from "./portal-data/hints.js?v=20260930e4";
import { GAME_CARDS, CATEGORIES, GAME_LINKS } from "./portal-data/games.js?v=20260930e4";

(function(){
  const key="freezzz_age_confirmed";
  const gate=document.getElementById("ageGate");
  const yes=document.getElementById("ageYes");
  const no=document.getElementById("ageNo");
  if(localStorage.getItem(key)==="1") gate.remove();
  yes.addEventListener("click",()=>{localStorage.setItem(key,"1");gate.remove();});
  no.addEventListener("click",()=>{localStorage.removeItem(key);window.location.replace("about:blank");});
})();

(() => {
  const telegram = window.Telegram?.WebApp || null;
  const tg = telegram ? {
    initData: telegram.initData || "",
    ready(){ telegram.ready?.(); },
    expand(){ telegram.expand?.(); },
    openLink(url){ telegram.openLink?.(url); },
    HapticFeedback: telegram.HapticFeedback,
    async authenticate(){
      const user = telegram.initDataUnsafe?.user;
      return user ? {user} : {user:{id:"local_guest",username:"browser_test",first_name:"Browser",last_name:"Player"}};
    }
  } : {
    initData: "browser-test",
    ready(){},
    expand(){},
    openLink(url){ window.open(url, "_blank", "noopener,noreferrer"); },
    HapticFeedback: null,
    async authenticate(){ return {user:{id:"local_guest",username:"browser_test",first_name:"Browser",last_name:"Player"}}; }
  };

  let userName = "Игрок";
  const nameTxt = document.getElementById('userNameTxt');
  if (nameTxt) nameTxt.textContent = userName;

  




  let currentLang = localStorage.getItem("freezzzLang") || "ru";
  if(!LANGS.includes(currentLang)) currentLang="ru";
  const tr=(key)=>LANG[currentLang][key]||LANG.ru[key]||key;
  const gameText=(id,field)=>{
    const x=GAME_TEXT[id]&&GAME_TEXT[id][currentLang];
    if(x) return field==="genre"?x[0]:x[1];
    const g=GAME_BY_ID[id]; return field==="genre"?g?.genre||"GAME":g?.desc||"";
  };
  const categoryText=(id)=>CATEGORY_TEXT[id]?.[currentLang]||id;
  const GAME_BY_ID=Object.fromEntries(GAME_CARDS.map(game=>[game.id,game]));

  const ACTION_HINT_ORDER=["profile","avatar","achievements","radio","language","chat","chatRooms","chatMessage","category","game","back"];
  const ACTION_HINT_DONE_KEY="freezzzActionHintsV2";
  const ACTION_HINT_PREF_KEY="freezzzActionHintsEnabledV1";
  let actionHintId=null;
  let actionHintHideTimer=0;
  const actionHintDismissedThisSession=new Set();
  let actionHintsEnabled=localStorage.getItem(ACTION_HINT_PREF_KEY)!=="0";

  function actionHintDone(){try{return JSON.parse(localStorage.getItem(ACTION_HINT_DONE_KEY)||"{}")}catch(e){return {}}}
  function actionHintIsDone(id){return !!actionHintDone()[id]}
  function actionHintMarkDone(id){const d=actionHintDone();d[id]=true;try{localStorage.setItem(ACTION_HINT_DONE_KEY,JSON.stringify(d))}catch(e){}}
  function actionHintTargetVisible(el){
    if(!el||el.classList.contains("hidden"))return false;
    const r=el.getBoundingClientRect();
    return r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth;
  }
  function actionHintRectOverlap(a,b){
    return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
           Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  }
  function positionActionHint(){
    if(!actionHintId)return;
    const target=document.querySelector("[data-action-hint-target='"+actionHintId+"']");
    const marker=document.getElementById("actionHintTarget"),card=document.getElementById("actionHintCard");
    if(!target||!marker||!card||!actionHintTargetVisible(target))return;

    const r=target.getBoundingClientRect();
    const markerX=Math.max(25,Math.min(innerWidth-25,r.left+r.width/2));
    const markerY=Math.max(25,Math.min(innerHeight-25,r.top+r.height/2));
    marker.style.left=markerX+"px";
    marker.style.top=markerY+"px";

    const safe=12,gap=12,cw=Math.min(270,innerWidth-24),ch=Math.min(card.offsetHeight||96,innerHeight-24);
    const candidates=[
      {x:markerX-cw/2,y:r.bottom+gap},
      {x:markerX-cw/2,y:r.top-ch-gap},
      {x:r.right+gap,y:r.top+Math.max(0,(r.height-ch)/2)},
      {x:r.left-cw-gap,y:r.top+Math.max(0,(r.height-ch)/2)}
    ];
    const important=[...document.querySelectorAll(".portal-logo,.header-top,.chat-launch-row,.category-head,.chat-layout,.footer-info")]
      .filter(el=>el!==target&&actionHintTargetVisible(el))
      .map(el=>el.getBoundingClientRect());

    let best=null;
    for(const c of candidates){
      const x=Math.max(safe,Math.min(innerWidth-cw-safe,c.x));
      const y=Math.max(safe,Math.min(innerHeight-ch-safe,c.y));
      const rect={left:x,top:y,right:x+cw,bottom:y+ch};
      const edgePenalty=(x===safe||y===safe||rect.right===innerWidth-safe||rect.bottom===innerHeight-safe)?18:0;
      const overlapPenalty=important.reduce((sum,b)=>sum+Math.min(12000,actionHintRectOverlap(rect,b)),0);
      const targetPenalty=actionHintRectOverlap(rect,r)*40;
      const score=overlapPenalty/500+targetPenalty/500+edgePenalty;
      if(!best||score<best.score)best={x,y,score};
    }
    card.style.left=best.x+"px";
    card.style.top=best.y+"px";
    card.style.width=cw+"px";
  }
  function hideActionHint(animate=true){
    clearTimeout(actionHintHideTimer);
    const layer=document.getElementById("actionHintLayer");
    if(!layer)return;
    actionHintId=null;
    if(animate&&!layer.classList.contains("hidden")){
      layer.classList.add("is-closing");
      actionHintHideTimer=setTimeout(()=>{layer.classList.add("hidden");layer.classList.remove("is-closing")},180);
    }else{
      layer.classList.add("hidden");
      layer.classList.remove("is-closing");
    }
  }
  function dismissCurrentActionHint(){
    if(actionHintId)actionHintDismissedThisSession.add(actionHintId);
    hideActionHint(true);
  }
  function showActionHint(id){
    const d=ACTION_HINTS[id],layer=document.getElementById("actionHintLayer"),target=document.querySelector("[data-action-hint-target='"+id+"']");
    if(!actionHintsEnabled||!d||!layer||!target||actionHintIsDone(id)||actionHintDismissedThisSession.has(id)||!actionHintTargetVisible(target))return false;
    clearTimeout(actionHintHideTimer);
    actionHintId=id;
    document.getElementById("actionHintTitle").textContent=d.title[currentLang]||d.title.en;
    document.getElementById("actionHintText").textContent=d.text[currentLang]||d.text.en;
    layer.classList.remove("hidden","is-closing");
    requestAnimationFrame(positionActionHint);
    return true;
  }
  function showNextActionHint(){
    if(!actionHintsEnabled)return;
    const guestView=document.getElementById("guestView");
    if(guestView && !guestView.classList.contains("hidden")){
      hideActionHint(false);
      return;
    }
    hideActionHint(false);
    for(const id of ACTION_HINT_ORDER){if(showActionHint(id))return}
  }
  function completeActionHint(id){
    if(!actionHintIsDone(id)){
      actionHintMarkDone(id);
      actionHintDismissedThisSession.delete(id);
      if(actionHintId===id)hideActionHint(true);
    }
  }
  function setActionHintsEnabled(enabled){
    actionHintsEnabled=!!enabled;
    try{localStorage.setItem(ACTION_HINT_PREF_KEY,actionHintsEnabled?"1":"0")}catch(e){}
    if(!actionHintsEnabled)hideActionHint(true);
    updateActionHintsControls();
  }
  function updateActionHintsControls(){
    const toggle=document.getElementById("profileHintsToggle");
    const disable=document.getElementById("actionHintDisable");
    if(toggle)toggle.textContent=actionHintsEnabled?tr("hintsOn"):tr("hintsOff");
    if(toggle)toggle.setAttribute("aria-pressed",actionHintsEnabled?"true":"false");
    if(disable)disable.textContent=actionHintsEnabled?tr("disableHints"):tr("enableHints");
  }
  function refreshActionHint(){if(actionHintId)requestAnimationFrame(positionActionHint)}
  document.getElementById("actionHintClose")?.addEventListener("click",dismissCurrentActionHint);
  document.getElementById("actionHintDisable")?.addEventListener("click",()=>setActionHintsEnabled(false));
  document.getElementById("profileHintsToggle")?.addEventListener("click",()=>setActionHintsEnabled(!actionHintsEnabled));
  window.addEventListener("resize",refreshActionHint,{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(refreshActionHint,100),{passive:true});



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
    updateActionHintsControls();
    if(currentCategory) document.getElementById("categoryHeadTitle")?.replaceChildren(document.createTextNode(categoryText(currentCategory.id)));
    window.FZG?.gameWindow?.setLanguage?.(currentLang);
    updateGuestEmptyState();
  }

  function updateGuestEmptyState(){
    const list=document.getElementById("guestList");
    if(!list)return;
    const messages=JSON.parse(localStorage.getItem("freezzzGuestMessages")||"[]");
    if(!messages.length) list.innerHTML='<div class="guest-msg">'+(currentLang==="ru"?"Пока сообщений нет. Напиши первым.":currentLang==="de"?"Noch keine Nachrichten. Schreib die erste Nachricht.":"No messages yet. Write the first one.")+'</div>';
  }

  document.getElementById("langToggleBtn").addEventListener("click",()=>{
    completeActionHint("language");
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
    const list=document.getElementById("achievementsModalList");
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
  function closePlayerProfile(){const el=document.getElementById("playerProfileOverlay");if(el)el.classList.add("hidden");setTimeout(showNextActionHint,80);}
  function openPlayerProfile(target){completeActionHint("profile");syncTelegramIdentity();renderPlayerProfile(target||playerId);haptic();}
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
    const dmKey="freezzzBrowserDmV1";
    const readDm=()=>{try{return JSON.parse(localStorage.getItem(dmKey)||"[]")}catch(e){return []}};
    const writeDm=v=>localStorage.setItem(dmKey,JSON.stringify(v));
    if(path==="/dm"){
      const dm=readDm();
      const ids=[...new Set(dm.flatMap(m=>[String(m.senderId),String(m.targetId)]).filter(id=>id!==playerId))];
      return {conversations:ids.map(id=>{
        const rows=dm.filter(m=>(String(m.senderId)===playerId&&String(m.targetId)===id)||(String(m.senderId)===id&&String(m.targetId)===playerId)).sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt));
        const last=rows[rows.length-1];
        return {playerId:id,username:last?.targetUsername||last?.username||id,name:last?.targetName||last?.name||"Игрок",avatar:last?.targetAvatar||last?.avatar||"👾",lastMessage:last?.text||""};
      })};
    }
    const dmMatch=path.match(/^\/dm\/([^/]+)\/messages(?:\?.*)?$/);
    if(dmMatch){
      const targetId=decodeURIComponent(dmMatch[1]);
      if(options.method==="POST"){
        const list=readDm();
        list.push({senderId:playerId,targetId,text:String(body.text||""),username:"@browser_test",name:"Browser Player",avatar:"🧑‍💻",createdAt:new Date().toISOString()});
        writeDm(list);
        return {ok:true};
      }
      const messages=readDm().filter(m=>
        (String(m.senderId)===playerId&&String(m.targetId)===targetId) ||
        (String(m.senderId)===targetId&&String(m.targetId)===playerId)
      ).slice(-100);
      return {messages};
    }
    if(path.startsWith("/profile/")){
      const targetId=decodeURIComponent(path.slice("/profile/".length));
      if(targetId===playerId) return {id:playerId,avatar:"🧑‍💻",name:"Browser Player",username:"@browser_test",stats:playerStats,achievements:null};
      const chatRows=read().filter(m=>String(m.playerId)===targetId);
      const dmRows=readDm().filter(m=>String(m.senderId)===targetId||String(m.targetId)===targetId);
      const sample=chatRows[chatRows.length-1]||dmRows.find(m=>String(m.senderId)===targetId);
      return {id:targetId,avatar:sample?.avatar||sample?.targetAvatar||"👾",name:sample?.name||sample?.targetName||"Игрок",username:sample?.username||sample?.targetUsername||("@"+targetId),stats:{portalSeconds:0,gameSeconds:0,gameLaunches:0,messagesSent:0,chatSeconds:0,activeDays:[]},achievements:null};
    }
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
    window.FZG?.state?.set?.({chat:{mode:"rooms",room,userId:null}});

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
    window.FZG?.state?.set?.({chat:{mode:"dm",room:chatRoom,userId:null}});

    document.querySelectorAll(".chat-room-tab").forEach(b=>b.classList.toggle("active",b.dataset.room==="dm"));
    document.getElementById("chatRoomTitle").textContent="✉️ "+tr("dmTitle");
    document.getElementById("guestList").classList.add("hidden");
    document.getElementById("dmList").classList.remove("hidden");
    document.getElementById("dmThread").classList.add("hidden");
    document.getElementById("chatCompose").classList.add("hidden");
    loadDmList();
  }

  document.querySelectorAll(".chat-room-tab").forEach(b=>b.addEventListener("click",()=>{completeActionHint("chatRooms");b.dataset.room==="dm"?selectDmMode():selectChatRoom(b.dataset.room);}));
  document.getElementById("chatBackBtn").addEventListener("click",()=>switchTab("games"));
  document.getElementById("chatRefreshBtn").addEventListener("click",()=>{
    const dmMode=document.querySelector(".chat-room-tab.active")?.dataset.room==="dm";
    if(activeDmUserId)openDm(activeDmUserId);
    else if(dmMode)loadDmList();
    else loadMessages();
  });
  document.getElementById("dmBackBtn").addEventListener("click",selectDmMode);
  document.getElementById("sendMsgBtn").addEventListener("click",()=>{completeActionHint("chatMessage");activeDmUserId?sendDmMessage():sendChatMessage();});
  document.getElementById("guestInput").addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("sendMsgBtn").click();});

  async function openChatPanel(){
    completeActionHint("chat");
    const ok=await authorizeChat();
    if(ok){selectChatRoom(chatRoom);}
  }
  /* HOME CHAT WIDGET — compact main-screen chat using the same chat API/state. */
  async function loadHomeChat(){
    const box=document.getElementById("homeChatMessages");
    if(!box)return;
    try{
      await authorizeChat();
      if(!chatAuthorized)return;
      const data=await api("/chat/messages?room="+encodeURIComponent(chatRoom)+"&limit=100");
      const messages=(data.messages||[]).slice(-4);
      const status=document.getElementById("homeChatStatus");
      if(status)status.textContent=(chatRoom==="main"?"ОНЛАЙН":"# "+String(chatRoom).toUpperCase());
      box.innerHTML=messages.length?messages.map(m=>{
        const own=String(m.playerId)===playerId;
        return '<button type="button" class="home-chat-message '+(own?"own":"")+'" data-player-id="'+escapeHtml(m.playerId)+'">'+
          '<span class="home-chat-avatar">'+escapeHtml(m.avatar||"👾")+'</span>'+
          '<span class="home-chat-message-body"><strong>'+escapeHtml(m.username||m.name||"Игрок")+'</strong><span>'+escapeHtml(m.text)+'</span></span>'+
          '<time>'+escapeHtml(formatMsgTime(m.createdAt))+'</time>'+
        '</button>';
      }).join(""):'<div class="home-chat-empty">'+escapeHtml(tr("noMessages"))+'</div>';
      box.querySelectorAll(".home-chat-message").forEach(el=>{
        el.addEventListener("click",()=>openPlayerProfile(el.dataset.playerId));
      });
      box.scrollTop=box.scrollHeight;
    }catch(e){
      const status=document.getElementById("homeChatStatus");
      if(status)status.textContent="OFFLINE";
      box.innerHTML='<div class="home-chat-empty">'+escapeHtml(tr("chatApiError")||"CHAT OFFLINE")+'</div>';
    }
  }

  async function sendHomeChatMessage(){
    if(chatBusy)return;
    const input=document.getElementById("homeChatInput");
    if(!input)return;
    const textValue=(input.value||"").trim();
    if(!textValue)return;
    await authorizeChat();
    if(!chatAuthorized)return;
    chatBusy=true;
    try{
      await api("/chat/messages",{method:"POST",body:{room:chatRoom,text:textValue}});
      input.value="";
      playerStats.messagesSent++;
      savePlayerStats();
      await loadHomeChat();
      haptic();
    }catch(e){
      const status=document.getElementById("homeChatStatus");
      if(status)status.textContent="OFFLINE";
    }finally{chatBusy=false;}
  }

  document.getElementById("homeChatOpen")?.addEventListener("click",()=>{
    markChatSeen();
    switchTab("guest");
  });
  document.getElementById("homeChatSend")?.addEventListener("click",()=>{
    completeActionHint("chatMessage");
    sendHomeChatMessage();
  });
  document.getElementById("homeChatInput")?.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();sendHomeChatMessage();}
  });

  /* The main-screen widget is lightweight; it refreshes only while visible. */
  setTimeout(loadHomeChat,250);
  setInterval(()=>{
    const widget=document.getElementById("homeChatWidget");
    if(widget && !document.hidden && !widget.classList.contains("hidden"))loadHomeChat();
  },10000);

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
    completeActionHint("avatar");
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
    setTimeout(showNextActionHint,80);
    document.getElementById('avatarModal').classList.add('hidden');
  }

  function openAchievementsModal(){
    completeActionHint("achievements");
    haptic();
    document.getElementById('achievementsModal')?.classList.remove('hidden');
  }

  function closeAchievementsModal(){
    haptic();
    setTimeout(showNextActionHint,80);
    document.getElementById('achievementsModal')?.classList.add('hidden');
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
  document.getElementById('profileAchievementsTitle')?.addEventListener('click', openAchievementsModal);
  document.getElementById('closeAchievementsBtn')?.addEventListener('click', closeAchievementsModal);
  document.getElementById('achievementsModal')?.addEventListener('click',e=>{if(e.target.id==='achievementsModal')closeAchievementsModal();});

  // Fixed portal appearance: dark theme is the only standard; sound is always enabled.
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
    completeActionHint("radio");
    radioOverlay?.classList.remove("hidden");
    setRadioStatus(radioAudio?.paused!==false?"PLAYING • TECHNO.FM 320K":"STOPPED");
  }

  function closeRadioPanel(){
    radioOverlay?.classList.add("hidden");
    setTimeout(showNextActionHint,80);
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
    const isChat=tab==='guest';
    window.FZG?.state?.set?.({screen:isChat?'chat':'home',categoryId:null,gameId:null});
    const achievements=document.getElementById('achievementsView');
    const guest=document.getElementById('guestView');
    const homeChat=document.getElementById('homeChatWidget');
    const mediaRow=document.getElementById('homeMediaRow');
    achievements?.classList.add('hidden');
    guest?.classList.toggle('hidden',!isChat);
    homeChat?.classList.toggle('is-hidden',isChat);
    mediaRow?.classList.toggle('is-hidden',isChat);
    const chatTab=document.getElementById('tabGuest');
    if(chatTab)chatTab.classList.toggle('active',isChat);
    if(isChat) hideActionHint(true);
    animateIn(isChat?guest:null,isChat?'forward':'back');
    if(!isChat){
      showCategoryList(false);
      setTimeout(showNextActionHint,180);
    }else{
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

  // GAME WINDOW owns the entire game catalog. Portal keeps only compatibility bridges.
  function showCategoryList(){
    window.FZG?.gameWindow?.showCatalog?.();
  }
  function openCategory(categoryId){
    return !!window.FZG?.gameWindow?.openCategory?.(categoryId);
  }
  function returnToMainMenu(){
    window.FZG?.gameWindow?.showCatalog?.();
    window.FZG?.state?.set?.({screen:"home",categoryId:null,gameId:null,modal:null});
    haptic();
  }
  function animateIn(){}
  function openExternal(url){
    const gameId=Object.keys(GAME_LINKS).find(k=>GAME_LINKS[k]===url);
    if(gameId)trackGameLaunch(gameId);
    return !!window.FZG?.gameWindow?.openGame?.(gameId);
  }

  // Final portal boot. Keep rendering isolated so one optional module cannot blank the whole portal.
  function bootPortal(){
    try{
      applyLanguage();
      showCategoryList(false);
      // The portal always opens on the main screen. Chat is an explicit user action.
      switchTab("games");
    }catch(err){ console.error("FREEzzzGames portal boot error:",err); }
  }
  bootPortal();
  updateActionHintsControls();
  setTimeout(()=>{if(actionHintsEnabled)showNextActionHint()},800);

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
})();
