import express from 'express';

const app=express();
const PORT=Number(process.env.PORT||10000);
const ALLOW_ORIGIN=process.env.ALLOW_ORIGIN||'*';

app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin',ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.sendStatus(204);
  next();
});

function registry(){
  try{return JSON.parse(process.env.STREAMER_REGISTRY||'[]')}
  catch{return[]}
}

let cache={streamers:[],updatedAt:null};
let busy=false;

function youtubeUsers(list){
  return list
    .filter(x=>x.platform==='youtube'&&(x.channelId||x.handle))
    .slice(0,50);
}

async function youtube(list){
  const key=process.env.YOUTUBE_API_KEY;
  const users=youtubeUsers(list);
  if(!users.length)return list;
  if(!key)return list.map(x=>x.platform==='youtube'?{...x,live:false,sources:[]}:x);

  const result=[];
  for(const x of users){
    try{
      let channelId=x.channelId||'';
      if(!channelId&&x.handle){
        const cr=new URL('https://www.googleapis.com/youtube/v3/channels');
        cr.searchParams.set('part','id');
        cr.searchParams.set('forHandle',String(x.handle).replace(/^@/,''));
        cr.searchParams.set('maxResults','1');
        cr.searchParams.set('key',key);
        const rr=await fetch(cr);
        if(rr.ok){const cd=await rr.json();channelId=cd.items?.[0]?.id||'';}
      }
      if(!channelId){result.push({...x,live:false,sources:[]});continue;}
      const url=new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part','snippet');
      url.searchParams.set('channelId',channelId);
      url.searchParams.set('eventType','live');
      url.searchParams.set('type','video');
      url.searchParams.set('maxResults','1');
      url.searchParams.set('key',key);

      const r=await fetch(url);
      if(!r.ok)throw Error('YouTube search '+r.status);
      const data=await r.json();
      const v=data.items?.[0];
      const videoId=v?.id?.videoId||'';
      const snippet=v?.snippet;

      result.push({
        ...x,
        live:!!videoId,
        liveStartedAt:snippet?.publishedAt||null,
        lastStreamTitle:snippet?.title||x.lastStreamTitle||null,
        game:x.game||'',
        sources:videoId?[{
          platform:'youtube',
          embedUrl:'https://www.youtube.com/embed/'+encodeURIComponent(videoId)+'?autoplay=1&mute=1',
          live:true,
          qualityScore:100,
          trafficScore:100,
          stabilityScore:100,
          latencyScore:90
        }]:[]
      });
    }catch(e){
      console.error('YouTube monitor failed for '+(x.handle||x.channelId),e);
      result.push({...x,live:false,sources:[]});
    }
  }

  const byId=new Map(result.map(x=>[x.id,x]));
  return list.map(x=>x.platform==='youtube'?(byId.get(x.id)||{...x,live:false,sources:[]}):x);
}

async function update(){
  if(busy)return;
  busy=true;
  try{
    let data=registry();
    data=await youtube(data);
    cache={streamers:data,updatedAt:new Date().toISOString()};
  }catch(e){
    console.error(e);
  }finally{
    busy=false;
  }
}

app.get('/health',(req,res)=>res.json({ok:true,updatedAt:cache.updatedAt}));
app.get('/api/live',(req,res)=>res.set('Cache-Control','no-store').json(cache));
app.get('/api/streamers',(req,res)=>res.json({streamers:registry()}));

update();
setInterval(update,30000);

app.listen(PORT,()=>console.log('FREEzzzGames YouTube Live Monitor listening on '+PORT));