import express from 'express';

const app=express();
const PORT=Number(process.env.PORT||10000);
const ALLOW_ORIGIN=process.env.ALLOW_ORIGIN||'*';
const POLL_MS=Math.max(300000,Number(process.env.YOUTUBE_POLL_MS||300000));
const API='https://www.googleapis.com/youtube/v3';

const DEFAULT_STREAMER_REGISTRY=[
  {"id":"woodskiyded","platform":"youtube","handle":"@woodskiyded","name":"Вудский Дед","avatar":"🎮","category":"MLBB"},
  {"id":"smetanaml","platform":"youtube","handle":"@smetanaml","name":"СМЕТАНА","avatar":"🎮","category":"MLBB"},
  {"id":"titamin1","platform":"youtube","handle":"@titamin1","name":"ТИТАМИН","avatar":"🎮","category":"MLBB"},
  {"id":"dreadztv","platform":"youtube","handle":"@DreadzTV","name":"Dread","avatar":"🎮","category":"Dota 2"},
  {"id":"stray228","platform":"youtube","handle":"@stray228","name":"Stray228","avatar":"🎮","category":"Dota 2"},
  {"id":"rostikfacekid","platform":"youtube","handle":"@rostikfacekid","name":"rostikfacekid","avatar":"🎮","category":"Dota 2"},
  {"id":"bratishkinoff","platform":"youtube","handle":"@bratishkinoff","name":"bratishkinoff","avatar":"🎮","category":"Minecraft"},
  {"id":"deepins02","platform":"youtube","handle":"@DEEPINSSTREAM","name":"deepins02","avatar":"🎮","category":"Minecraft"},
  {"id":"t2x2","platform":"youtube","handle":"@T2x2","name":"T2x2","avatar":"🎮","category":"Minecraft"},
  {"id":"marmok","platform":"youtube","handle":"@Marmok","name":"Marmok","avatar":"🎮","category":"Разное"},
  {"id":"zubarefff","platform":"youtube","handle":"@zubarefff11","name":"Зубарев","avatar":"🎮","category":"Разное"},
  {"id":"mlbb-esports","platform":"youtube","handle":"@MLBBEsports","name":"MLBB eSports","avatar":"🏆","category":"MLBB резерв","reserve":true},
  {"id":"mobile-legends","platform":"youtube","handle":"@MobileLegends5v5MOONTON","name":"Mobile Legends: Bang Bang","avatar":"🏆","category":"MLBB резерв","reserve":true},
  {"id":"dota2","platform":"youtube","handle":"@dota2","name":"Dota 2","avatar":"🏆","category":"Dota 2 резерв","reserve":true},
  {"id":"noobfromua","platform":"youtube","handle":"@NoobFromUA","name":"NoobFromUA","avatar":"🎮","category":"Dota 2 резерв","reserve":true},
  {"id":"minecraft","platform":"youtube","handle":"@minecraft","name":"Minecraft","avatar":"🏆","category":"Minecraft резерв","reserve":true},
  {"id":"esportsbattle","platform":"youtube","handle":"@EsportsBattle","name":"ESportsBattle | eFootball","avatar":"🏆","category":"EA/eFootball резерв","reserve":true},
  {"id":"fifa","platform":"youtube","handle":"@easportsfc","name":"FIFA / EA SPORTS FC","avatar":"🏆","category":"EA/FIFA резерв","reserve":true},
  {"id":"nasa-live","platform":"youtube","handle":"@NASA","name":"NASA Live","avatar":"🚀","category":"Космос • Наука","testLive":true}
];

app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin',ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.sendStatus(204);
  next();
});

function registry(){
  let configured=[];
  try{
    const parsed=JSON.parse(process.env.STREAMER_REGISTRY||'[]');
    if(Array.isArray(parsed))configured=parsed;
  }catch{}
  const map=new Map(DEFAULT_STREAMER_REGISTRY.map(x=>[x.id,x]));
  for(const x of configured){
    if(x?.id)map.set(x.id,x);
  }
  return [...map.values()];
}

let cache={streamers:registry().map(x=>({...x,live:false,sources:[]})),updatedAt:null,lastError:null};
let busy=false;
const channelCache=new Map();

async function api(path,params){
  const key=process.env.YOUTUBE_API_KEY;
  if(!key)throw Error('YOUTUBE_API_KEY missing');
  const u=new URL(API+'/'+path);
  Object.entries(params||{}).forEach(([k,v])=>u.searchParams.set(k,String(v)));
  u.searchParams.set('key',key);
  const r=await fetch(u);
  if(!r.ok)throw Error('YouTube '+path+' '+r.status);
  return r.json();
}

async function resolveChannel(x){
  const cached=channelCache.get(x.id);
  if(cached)return cached;
  if(x.channelId){
    const value={channelId:x.channelId,uploadsPlaylistId:null};
    channelCache.set(x.id,value);
    return value;
  }
  if(!x.handle)return null;
  const data=await api('channels',{part:'id,contentDetails',forHandle:String(x.handle).replace(/^@/,'')});
  const c=data.items?.[0];
  if(!c)return null;
  const value={
    channelId:c.id,
    uploadsPlaylistId:c.contentDetails?.relatedPlaylists?.uploads||null
  };
  channelCache.set(x.id,value);
  return value;
}

async function ensurePlaylist(x){
  const cached=await resolveChannel(x);
  if(!cached)return null;
  if(cached.uploadsPlaylistId)return cached;
  const data=await api('channels',{part:'contentDetails',id:cached.channelId});
  cached.uploadsPlaylistId=data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads||null;
  return cached;
}

async function youtube(list){
  const users=list.filter(x=>x.platform==='youtube'&&(x.channelId||x.handle)).slice(0,50);
  if(!users.length)return list;

  const candidates=[];
  for(const x of users){
    try{
      if(x.testLive){
        const meta=await ensurePlaylist(x);
        if(meta?.channelId){
          candidates.push({
            owner:x,
            videoId:null,
            title:x.lastStreamTitle||"NASA Live test stream",
            testLive:true,
            channelId:meta.channelId
          });
        }
        continue;
      }
      const meta=await ensurePlaylist(x);
      if(!meta?.uploadsPlaylistId)continue;
      const p=await api('playlistItems',{
        part:'contentDetails,snippet',
        playlistId:meta.uploadsPlaylistId,
        maxResults:10
      });
      for(const item of (p.items||[])){
        const videoId=item.contentDetails?.videoId||item.snippet?.resourceId?.videoId;
        if(videoId)candidates.push({owner:x,videoId,title:item.snippet?.title||''});
      }
    }catch(e){
      console.error('YouTube playlist check failed for '+(x.handle||x.channelId),e);
    }
  }

  const unique=[...new Map(candidates.map(x=>[x.videoId,x])).values()];
  const videos=new Map();

  for(let i=0;i<unique.length;i+=50){
    const ids=unique.slice(i,i+50).map(x=>x.videoId).join(',');
    try{
      const data=await api('videos',{
        part:'snippet,liveStreamingDetails',
        id:ids
      });
      for(const v of (data.items||[]))videos.set(v.id,v);
    }catch(e){
      console.error('YouTube videos check failed',e);
    }
  }

  const found=new Map();
  for(const item of candidates){
    if(item.testLive){
      found.set(item.owner.id,{
        ...item.owner,
        live:true,
        liveStartedAt:new Date().toISOString(),
        lastStreamTitle:item.title||item.owner.lastStreamTitle||'NASA Live test stream',
        sources:[{
          platform:'youtube',
          embedUrl:item.channelId
            ? 'https://www.youtube.com/embed/live_stream?channel='+encodeURIComponent(item.channelId)+'&autoplay=1&mute=1'
            : 'https://www.youtube.com/@NASA/live',
          live:true,
          test:true,
          qualityScore:100,
          trafficScore:100,
          stabilityScore:100,
          latencyScore:90
        }]
      });
      continue;
    }

    const v=videos.get(item.videoId);
    const d=v?.liveStreamingDetails;
    const live=!!(v?.snippet?.liveBroadcastContent==='live'&&d?.actualStartTime&&!d?.actualEndTime);
    if(live){
      const owner=item.owner;
      found.set(owner.id,{
        ...owner,
        live:true,
        liveStartedAt:d.actualStartTime,
        lastStreamTitle:v.snippet?.title||owner.lastStreamTitle||'',
        game:owner.game||'',
        sources:[{
          platform:'youtube',
          embedUrl:'https://www.youtube.com/embed/'+encodeURIComponent(v.id)+'?autoplay=1&mute=1',
          live:true,
          qualityScore:100,
          trafficScore:100,
          stabilityScore:100,
          latencyScore:90
        }]
      });
    }
  }

  return list.map(x=>{
    if(x.platform!=='youtube')return x;
    const live=found.get(x.id);
    if(live)return live;
    return {
      ...x,
      live:false,
      liveStartedAt:null,
      sources:[],
      lastStreamTitle:x.lastStreamTitle||''
    };
  });
}

async function update(){
  if(busy)return;
  busy=true;
  try{
    const data=registry();
    const next=await youtube(data);
    cache={streamers:next,updatedAt:new Date().toISOString(),lastError:null};
  }catch(e){
    console.error(e);
    cache={...cache,lastError:String(e?.message||e)};
  }finally{
    busy=false;
  }
}

app.get('/health',(req,res)=>res.json({ok:true,updatedAt:cache.updatedAt,lastError:cache.lastError}));
app.get('/api/live',(req,res)=>res.set('Cache-Control','no-store').json(cache));
app.get('/api/streamers',(req,res)=>res.json({streamers:registry()}));

update();
setInterval(update,POLL_MS);

app.listen(PORT,()=>console.log('FREEzzzGames YouTube Live Monitor listening on '+PORT+' poll='+POLL_MS+' registry='+registry().length));