/* FREEzzzGames portal localization/data */
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
      profileAchievements:"🏆 АЧИВКИ",write:"НАПИСАТЬ",player:"Игрок",hintsOn:"💡 ПОДСКАЗКИ: ВКЛ",hintsOff:"💡 ПОДСКАЗКИ: ВЫКЛ",disableHints:"Не показывать подсказки",enableHints:"Показывать подсказки"
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
      profileAchievements:"🏆 ERFOLGE",write:"SCHREIBEN",player:"Spieler",hintsOn:"💡 HINWEISE: AN",hintsOff:"💡 HINWEISE: AUS",disableHints:"Hinweise nicht mehr anzeigen",enableHints:"Hinweise anzeigen"
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
      profileAchievements:"🏆 ACHIEVEMENTS",write:"WRITE",player:"Player",hintsOn:"💡 HINTS: ON",hintsOff:"💡 HINTS: OFF",disableHints:"Don’t show hints",enableHints:"Show hints"
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
    worlds:{ru:'ИНТЕРАКТИВНЫЕ МИРЫ',de:'INTERAKTIVE WELTEN',en:'INTERACTIVE WORLDS'},
    creative:{ru:'ТВОРЧЕСТВО • МУЗЫКА • АРТ',de:'KREATIVITÄT • MUSIK • KUNST',en:'CREATIVE • MUSIC • ART'},
    puzzles:{ru:'ПАЗЛЫ • ЛОГИКА',de:'PUZZLES • LOGIK',en:'PUZZLES • LOGIC'},
    arcade:{ru:'АРКАДЫ • КЛАССИКА',de:'ARCADE • KLASSIKER',en:'ARCADE • CLASSICS'},
    sandbox:{ru:'СИМУЛЯТОРЫ • ПЕСКОЧНИЦЫ',de:'SIMULATIONEN • SANDBOX',en:'SIMULATORS • SANDBOX'},
    experimental:{ru:'ЭКСПЕРИМЕНТАЛЬНЫЕ ПРОЕКТЫ',de:'EXPERIMENTELLE PROJEKTE',en:'EXPERIMENTAL PROJECTS'},
    onefinger:{ru:'ОДИН ПАЛЕЦ',de:'EIN FINGER',en:'ONE TOUCH'},
    think:{ru:'НЕ СПЕШИ',de:'NIMM DIR ZEIT',en:'TAKE YOUR TIME'},
    reaction:{ru:'РЕАКТОР',de:'REAKTOR',en:'REACTION'},
    strange:{ru:'СТРАННОЕ',de:'DAS SELTSAME',en:'THE STRANGE'},
    lost:{ru:'ПОТЕРЯЙСЯ И НАЙДИСЬ',de:'VERIRREN & FINDEN',en:'LOST & FOUND'},
    timetrip:{ru:'МАШИНА ВРЕМЕНИ',de:'ZEITMASCHINE',en:'TIME MACHINE'},
    zen:{ru:'НЕ СПЕШИ ЕХАТЬ',de:'ZEN-FAHRT',en:'ZEN DRIVE'},
    duel:{ru:'ДВА БОКА ЭКРАНА',de:'ZWEI SEITEN',en:'TWO SIDES'},
    lab:{ru:'FREEzzz LAB',de:'FREEzzz LAB',en:'FREEzzz LAB'}
  };

export { LANGS, LANG, GAME_TEXT, CATEGORY_TEXT };
