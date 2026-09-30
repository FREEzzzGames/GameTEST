export const LIVE_CHANNELS=[
  {
    id:"nasa",
    platform:"youtube",
    name:"NASA Live",
    avatar:"🚀",
    category:"Космос • Наука",
    channelUrl:"https://www.youtube.com/@NASA/live",
    embedUrl:"https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1&mute=1&playsinline=1",
    previewUrl:"https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png",
    direct:true
  },
  {
    id:"nasa-kennedy",
    platform:"youtube",
    name:"NASA Kennedy",
    avatar:"🛰️",
    category:"Запуски • Космос",
    channelUrl:"https://www.youtube.com/kscnewsroom",
    embedUrl:"",
    previewUrl:"https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png",
    direct:true
  },
  {
    id:"nasa-live-page",
    platform:"web",
    name:"NASA Live",
    avatar:"🌎",
    category:"Официальные эфиры",
    channelUrl:"https://www.nasa.gov/live/",
    embedUrl:"",
    previewUrl:"https://www.nasa.gov/wp-content/uploads/2023/06/nasa-logo-web-rgb.png",
    direct:true
  }
];

export function directSources(){
  return LIVE_CHANNELS.map(x=>({
    ...x,
    live:true,
    sourceMode:"direct",
    sources:x.embedUrl?[{
      platform:x.platform,
      embedUrl:x.embedUrl,
      live:true,
      direct:true,
      qualityScore:100,
      trafficScore:100,
      stabilityScore:100,
      latencyScore:90
    }]:[]
  }));
}
