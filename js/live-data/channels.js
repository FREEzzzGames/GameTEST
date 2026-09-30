export const LIVE_CHANNELS = [
  {id:"woodskiyded",platform:"youtube",handle:"@woodskiyded",url:"https://www.youtube.com/@woodskiyded",embedUrl:"https://www.youtube.com/embed/live_stream?channel=UCKgQPQj9J3BUgTVci1up75A&autoplay=1&mute=1&playsinline=1&enablejsapi=1",name:"Вудский Дед",avatar:"🎮",category:"MLBB",description:"Игровые эфиры и контент по MLBB."},
  {id:"smetanaml",platform:"youtube",handle:"@smetanaml",url:"https://www.youtube.com/@smetanaml",name:"СМЕТАНА",avatar:"🎮",category:"MLBB",description:"MLBB-эфиры и игровой контент."},
  {id:"titamin1",platform:"youtube",handle:"@Titamin",url:"https://www.youtube.com/@Titamin",name:"ТИТАМИН",avatar:"🎮",category:"MLBB",description:"Игровые эфиры и контент по MLBB."},
  {id:"dreadztv",platform:"youtube",handle:"@DreadzTV",url:"https://www.youtube.com/@DreadzTV",name:"Dread",avatar:"🎮",category:"Dota 2",description:"Эфиры и контент по Dota 2."},
  {id:"rostikfacekid",platform:"youtube",handle:"@rostikfacekid",url:"https://www.youtube.com/@rostikfacekid",embedUrl:"https://www.youtube.com/embed/live_stream?channel=UCFtJvIs4RNx097pdImXqNDQ&autoplay=1&mute=1&playsinline=1&enablejsapi=1",name:"rostikfacekid",avatar:"🎮",category:"Dota 2",description:"Игровые эфиры и контент."},
  {id:"bratishkinoff",platform:"youtube",handle:"@bratishkinoff",url:"https://www.youtube.com/@bratishkinoff",name:"bratishkinoff",avatar:"🎮",category:"Minecraft",description:"Игровые эфиры и контент."},
  {id:"deepins02",platform:"youtube",handle:"@DEEPINSSTREAM",url:"https://www.youtube.com/@DEEPINSSTREAM",name:"deepins02",avatar:"🎮",category:"Minecraft",description:"Стримы и игровой контент."},
  {id:"t2x2",platform:"youtube",handle:"@T2x2_stream",url:"https://www.youtube.com/@T2x2_stream",name:"T2x2",avatar:"🎮",category:"Minecraft",description:"Игровые эфиры и контент."},
  {id:"marmok",platform:"youtube",handle:"@MarmokLive",url:"https://www.youtube.com/@MarmokLive",name:"Marmok",avatar:"🎮",category:"Разное",description:"Развлекательные игровые эфиры и видео."},
  {id:"zubarefff",platform:"youtube",handle:"@zubarefff11",url:"https://www.youtube.com/@zubarefff11",name:"Зубарев",avatar:"🎮",category:"Разное",description:"Развлекательный контент и эфиры."},
  {id:"mlbb-esports",platform:"youtube",handle:"@MLBBEsports",url:"https://www.youtube.com/@MLBBEsports",name:"MLBB eSports",avatar:"🏆",category:"MLBB",reserve:true,description:"Официальный игровой контент MLBB."},
  {id:"mobile-legends",platform:"youtube",handle:"@MobileLegends5v5MOONTON",url:"https://www.youtube.com/@MobileLegends5v5MOONTON",name:"Mobile Legends: Bang Bang",avatar:"🏆",category:"MLBB",reserve:true,description:"Официальный контент Mobile Legends."},
  {id:"dota2",platform:"youtube",handle:"@dota2",url:"https://www.youtube.com/@dota2",name:"Dota 2",avatar:"🏆",category:"Dota 2",reserve:true,description:"Официальный канал Dota 2."},
  {id:"noobfromua",platform:"youtube",handle:"@NoobFromUA",url:"https://www.youtube.com/@NoobFromUA",name:"NoobFromUA",avatar:"🎮",category:"Dota 2",reserve:true,description:"Игровые эфиры и контент."},
  {id:"minecraft",platform:"youtube",handle:"@minecraft",url:"https://www.youtube.com/@minecraft",name:"Minecraft",avatar:"🏆",category:"Minecraft",reserve:true,description:"Официальный контент Minecraft."},
  {id:"esportsbattle",platform:"youtube",handle:"@EsportsBattle",url:"https://www.youtube.com/@EsportsBattle",name:"ESportsBattle | eFootball",avatar:"🏆",category:"EA/eFootball",reserve:true,description:"Киберспортивный игровой контент."},
  {id:"fifa",platform:"youtube",handle:"@easportsfc",url:"https://www.youtube.com/@easportsfc",name:"FIFA / EA SPORTS FC",avatar:"🏆",category:"EA/FIFA",reserve:true,description:"Официальный контент EA SPORTS FC."},
  {id:"nasa-live",platform:"youtube",handle:"@NASA",url:"https://www.youtube.com/@NASA",embedUrl:"https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1&mute=1&playsinline=1&enablejsapi=1",name:"NASA Live",avatar:"🚀",category:"Космос • Наука",description:"Прямые эфиры и научный контент NASA."}
];

export function directSources(){
  return LIVE_CHANNELS.map(channel=>({...channel,live:false,sourceMode:"direct-link",sources:[]}));
}
