export const LIVE_CHANNELS=[
  {"id":"woodskiyded","platform":"youtube","channelId":"UCKgQPQj9J3BUgTVci1up75A","handle":"@woodskiyded","name":"Вудский Дед","avatar":"🎮","category":"MLBB","description":"Игровые эфиры и контент по MLBB.","shortDescription":"Игровые эфиры и контент по MLBB."},
  {"id":"smetanaml","platform":"youtube","handle":"@smetanaml","name":"СМЕТАНА","avatar":"🎮","category":"MLBB","description":"MLBB-эфиры и игровой контент.","shortDescription":"MLBB-эфиры и игровой контент."},
  {"id":"titamin1","platform":"youtube","handle":"@Titamin","name":"ТИТАМИН","avatar":"🎮","category":"MLBB","description":"Игровые эфиры и контент по MLBB.","shortDescription":"Игровые эфиры и контент по MLBB."},
  {"id":"dreadztv","platform":"youtube","handle":"@DreadzTV","name":"Dread","avatar":"🎮","category":"Dota 2","description":"Эфиры и контент по Dota 2.","shortDescription":"Эфиры и контент по Dota 2."},
  {"id":"rostikfacekid","platform":"youtube","channelId":"UCFtJvIs4RNx097pdImXqNDQ","handle":"@rostikfacekid","name":"rostikfacekid","avatar":"🎮","category":"Dota 2","description":"Игровые эфиры и контент.","shortDescription":"Игровые эфиры и контент."},
  {"id":"bratishkinoff","platform":"youtube","handle":"@bratishkinoff","name":"bratishkinoff","avatar":"🎮","category":"Minecraft","description":"Игровые эфиры и контент.","shortDescription":"Игровые эфиры и контент."},
  {"id":"deepins02","platform":"youtube","handle":"@DEEPINSSTREAM","name":"deepins02","avatar":"🎮","category":"Minecraft","description":"Стримы и игровой контент.","shortDescription":"Стримы и игровой контент."},
  {"id":"t2x2","platform":"youtube","handle":"@T2x2_stream","name":"T2x2","avatar":"🎮","category":"Minecraft","description":"Игровые эфиры и контент.","shortDescription":"Игровые эфиры и контент."},
  {"id":"marmok","platform":"youtube","handle":"@MarmokLive","name":"Marmok","avatar":"🎮","category":"Разное","description":"Развлекательные игровые эфиры и видео.","shortDescription":"Развлекательные игровые эфиры и видео."},
  {"id":"zubarefff","platform":"youtube","handle":"@zubarefff11","name":"Зубарев","avatar":"🎮","category":"Разное","description":"Развлекательный контент и эфиры.","shortDescription":"Развлекательный контент и эфиры."},
  {"id":"mlbb-esports","platform":"youtube","handle":"@MLBBEsports","name":"MLBB eSports","avatar":"🏆","category":"MLBB резерв","reserve":true,"description":"Официальный игровой контент MLBB.","shortDescription":"Официальный игровой контент MLBB."},
  {"id":"mobile-legends","platform":"youtube","handle":"@MobileLegends5v5MOONTON","name":"Mobile Legends: Bang Bang","avatar":"🏆","category":"MLBB резерв","reserve":true,"description":"Официальный контент Mobile Legends.","shortDescription":"Официальный контент Mobile Legends."},
  {"id":"dota2","platform":"youtube","handle":"@dota2","name":"Dota 2","avatar":"🏆","category":"Dota 2 резерв","reserve":true,"description":"Официальный канал Dota 2.","shortDescription":"Официальный канал Dota 2."},
  {"id":"noobfromua","platform":"youtube","handle":"@NoobFromUA","name":"NoobFromUA","avatar":"🎮","category":"Dota 2 резерв","reserve":true,"description":"Игровые эфиры и контент.","shortDescription":"Игровые эфиры и контент."},
  {"id":"minecraft","platform":"youtube","handle":"@minecraft","name":"Minecraft","avatar":"🏆","category":"Minecraft резерв","reserve":true,"description":"Официальный контент Minecraft.","shortDescription":"Официальный контент Minecraft."},
  {"id":"esportsbattle","platform":"youtube","handle":"@EsportsBattle","name":"ESportsBattle | eFootball","avatar":"🏆","category":"EA/eFootball резерв","reserve":true,"description":"Киберспортивный игровой контент.","shortDescription":"Киберспортивный игровой контент."},
  {"id":"fifa","platform":"youtube","handle":"@easportsfc","name":"FIFA / EA SPORTS FC","avatar":"🏆","category":"EA/FIFA резерв","reserve":true,"description":"Официальный контент EA SPORTS FC.","shortDescription":"Официальный контент EA SPORTS FC."},
  {"id":"nasa-live","platform":"youtube","channelId":"UCLA_DiR1FfKNvjuUpBHmylQ","name":"NASA Live","avatar":"🚀","category":"Космос • Наука","description":"Прямые эфиры и научный контент NASA.","shortDescription":"Прямые эфиры и научный контент NASA."}
];

export function directSources(){
  return LIVE_CHANNELS.map(x=>({
    ...x,
    live:false,
    sourceMode:"registry",
    sources:[]
  }));
}
