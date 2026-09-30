export const LIVE_CHANNELS=[
  {
    id:"nasa-live",
    platform:"youtube",
    name:"NASA Live",
    avatar:"🚀",
    category:"Космос • Наука",
    channelId:"UCLA_DiR1FfKNvjuUpBHmylQ",
    channelUrl:"https://www.youtube.com/@NASA/live",
    previewUrl:"https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png"
  },
  {
    id:"nasa-kennedy",
    platform:"youtube",
    name:"NASA Kennedy",
    avatar:"🛰️",
    category:"Запуски • Космос",
    channelUrl:"https://www.youtube.com/kscnewsroom",
    previewUrl:"https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png"
  },
  {
    id:"nasa-live-page",
    platform:"web",
    name:"NASA Live",
    avatar:"🌎",
    category:"Официальные эфиры",
    channelUrl:"https://www.nasa.gov/live/",
    previewUrl:"https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png"
  }
];

export function directSources(){
  // This is only the client-side registry. A channel is NOT considered LIVE
  // until the LIVE server confirms a real active broadcast.
  return LIVE_CHANNELS.map(x=>({
    ...x,
    live:false,
    sourceMode:"registry",
    sources:[]
  }));
}
