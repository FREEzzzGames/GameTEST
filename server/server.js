import express from 'express';

const app=express();
const PORT=Number(process.env.PORT||10000);
const ALLOW_ORIGIN=process.env.ALLOW_ORIGIN||'*';
const POLL_MS=Math.max(300000,Number(process.env.YOUTUBE_POLL_MS||300000));
const API='https://www.googleapis.com/youtube/v3';

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

let cache={streamers:[],updatedAt:null,lastError:null};
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
  for(const item of unique){
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

app.listen(PORT,()=>console.log('FREEzzzGames YouTube Live Monitor listening on '+PORT+' poll='+POLL_MS));