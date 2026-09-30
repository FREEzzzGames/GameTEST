import express from 'express';

const app=express();
const PORT=Number(process.env.PORT||10000);
const ALLOW_ORIGIN=process.env.ALLOW_ORIGIN||'*';
const POLL_MS=Math.max(300000,Number(process.env.YOUTUBE_POLL_MS||300000));
const API='https://www.googleapis.com/youtube/v3';

app.use((req,res,next)=>{
  const origin=req.headers.origin;
  if(ALLOW_ORIGIN==='*') res.set('Access-Control-Allow-Origin','*');
  else if(origin && origin===ALLOW_ORIGIN) res.set('Access-Control-Allow-Origin',origin);
  res.set('Access-Control-Allow-Methods','GET,OPTIONS');
  res.set('Access-Control-Allow-Headers','Content-Type');
  res.set('Access-Control-Max-Age','600');
  if(req.method==='OPTIONS') return res.status(204).end();
  next();
});

const DEFAULT_STREAMER_REGISTRY=[
  {"id":"woodskiyded","platform":"youtube","channelId":"UCKgQPQj9J3BUgTVci1up75A","handle":"@woodskiyded","name":"Вудский Дед","avatar":"🎮","category":"MLBB"},
  {"id":"smetanaml","platform":"youtube","handle":"@smetanaml","name":"СМЕТАНА","avatar":"🎮","category":"MLBB"},
  {"id":"titamin1","platform":"youtube","handle":"@Titamin","name":"ТИТАМИН","avatar":"🎮","category":"MLBB"},
  {"id":"dreadztv","platform":"youtube","handle":"@DreadzTV","name":"Dread","avatar":"🎮","category":"Dota 2"},
  {"id":"stray228","platform":"youtube","handle":"@stray228","customUrl":"/c/StrayBest","channelUrl":"https://www.youtube.com/c/StrayBest","name":"Stray228","avatar":"🎮","category":"Dota 2"},
  {"id":"rostikfacekid","platform":"youtube","channelId":"UCFtJvIs4RNx097pdImXqNDQ","handle":"@rostikfacekid","name":"rostikfacekid","avatar":"🎮","category":"Dota 2"},
  {"id":"bratishkinoff","platform":"youtube","handle":"@bratishkinoff","name":"bratishkinoff","avatar":"🎮","category":"Minecraft"},
  {"id":"deepins02","platform":"youtube","handle":"@DEEPINSSTREAM","name":"deepins02","avatar":"🎮","category":"Minecraft"},
  {"id":"t2x2","platform":"youtube","handle":"@T2x2_stream","name":"T2x2","avatar":"🎮","category":"Minecraft"},
  {"id":"marmok","platform":"youtube","handle":"@MarmokLive","name":"Marmok","avatar":"🎮","category":"Разное"},
  {"id":"zubarefff","platform":"youtube","handle":"@zubarefff11","name":"Зубарев","avatar":"🎮","category":"Разное"},
  {"id":"mlbb-esports","platform":"youtube","handle":"@MLBBEsports","name":"MLBB eSports","avatar":"🏆","category":"MLBB резерв","reserve":true},
  {"id":"mobile-legends","platform":"youtube","handle":"@MobileLegends5v5MOONTON","name":"Mobile Legends: Bang Bang","avatar":"🏆","category":"MLBB резерв","reserve":true},
  {"id":"dota2","platform":"youtube","handle":"@dota2","name":"Dota 2","avatar":"🏆","category":"Dota 2 резерв","reserve":true},
  {"id":"noobfromua","platform":"youtube","handle":"@NoobFromUA","name":"NoobFromUA","avatar":"🎮","category":"Dota 2 резерв","reserve":true},
  {"id":"minecraft","platform":"youtube","handle":"@minecraft","name":"Minecraft","avatar":"🏆","category":"Minecraft резерв","reserve":true},
  {"id":"esportsbattle","platform":"youtube","handle":"@EsportsBattle","name":"ESportsBattle | eFootball","avatar":"🏆","category":"EA/eFootball резерв","reserve":true},
  {"id":"fifa","platform":"youtube","handle":"@easportsfc","name":"FIFA / EA SPORTS FC","avatar":"🏆","category":"EA/FIFA резерв","reserve":true},
  {"id":"nasa-live","platform":"youtube","channelId":"UCLA_DiR1FfKNvjuUpBHmylQ","name":"NASA Live","avatar":"🚀","category":"Космос • Наука"}
];

function registry(){
  let configured=[];
  try{
    const parsed=JSON.parse(process.env.STREAMER_REGISTRY||'[]');
    if(Array.isArray(parsed))configured=parsed;
  }catch{}
  const map=new Map(DEFAULT_STREAMER_REGISTRY.map(x=>[x.id,x]));
  // Source code is authoritative for known channels. Environment config may
  // only add new entries and cannot overwrite verified registry records.
  for(const x of configured){
    if(x?.id && !map.has(x.id))map.set(x.id,x);
  }
  return [...map.values()];
}

let cache={
  streamers:registry().map(x=>({...x,live:false,liveStartedAt:null,lastStreamAt:null,sources:[]})),
  updatedAt:null,
  lastError:null
};
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

  if(!x.handle && !x.customUrl)return null;

  try{
    if(x.handle){
      const data=await api('channels',{
        part:'id,contentDetails',
        forHandle:String(x.handle).replace(/^@/,'')
      });
      const c=data.items?.[0];
      if(c){
        const value={
          channelId:c.id,
          uploadsPlaylistId:c.contentDetails?.relatedPlaylists?.uploads||null
        };
        channelCache.set(x.id,value);
        return value;
      }
    }
  }catch{}

  // Some legacy /c/ channels do not resolve through forHandle.
  // Resolve their immutable channel ID from the public channel page once,
  // then cache it for all subsequent polling cycles.
  if(x.customUrl){
    try{
      const base='https://www.youtube.com';
      const url=String(x.customUrl).startsWith('http')
        ? String(x.customUrl)
        : base+String(x.customUrl);
      const r=await fetch(url,{
        headers:{'User-Agent':'Mozilla/5.0'}
      });
      if(r.ok){
        const html=await r.text();
        // Prefer the channel's canonical URL / browseId. A raw
        // "channelId" match can belong to a recommended video/channel
        // embedded elsewhere in the page.
        const patterns=[
          /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\\/\\/www\\.youtube\\.com\\/channel\\/(UC[a-zA-Z0-9_-]{22})["']/i,
          /"browseId":"(UC[a-zA-Z0-9_-]{22})"/,
          /"externalId":"(UC[a-zA-Z0-9_-]{22})"/,
          /"channelId":"(UC[a-zA-Z0-9_-]{22})"/,
          /channel\\/(UC[a-zA-Z0-9_-]{22})/
        ];
        const match=patterns.map(re=>html.match(re)).find(Boolean);
        const channelId=match?.[1]||null;
        if(channelId){
          const value={channelId,uploadsPlaylistId:null};
          channelCache.set(x.id,value);
          return value;
        }
      }
    }catch{}
  }

  return null;
}

async function ensurePlaylist(x){
  const cached=await resolveChannel(x);
  if(!cached)return null;
  if(cached.uploadsPlaylistId)return cached;

  const data=await api('channels',{
    part:'contentDetails',
    id:cached.channelId
  });
  cached.uploadsPlaylistId=data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads||null;
  return cached;
}

async function youtube(list){
  const users=list.filter(x=>x.platform==='youtube'&&(x.channelId||x.handle||x.customUrl));
  if(!users.length)return list;

  const candidates=[];

  // The uploads playlist is cheap to query and contains current broadcasts.
  // We inspect recent videos and then use videos.list to verify LIVE status.
  for(const x of users){
    try{
      const meta=await ensurePlaylist(x);
      if(!meta?.uploadsPlaylistId)continue;

      const p=await api('playlistItems',{
        part:'contentDetails,snippet',
        playlistId:meta.uploadsPlaylistId,
        maxResults:15
      });

      for(const item of (p.items||[])){
        const videoId=item.contentDetails?.videoId||item.snippet?.resourceId?.videoId;
        if(videoId)candidates.push({
          owner:x,
          videoId,
          title:item.snippet?.title||'',
          publishedAt:item.snippet?.publishedAt||null
        });
      }
    }catch(e){
      const label=x.handle||x.channelId||x.customUrl||x.id;
      console.error('YouTube playlist check failed for '+label,e);
    }
  }

  const unique=[...new Map(candidates.map(x=>[x.videoId,x])).values()];
  const videos=new Map();

  for(let i=0;i<unique.length;i+=50){
    const ids=unique.slice(i,i+50).map(x=>x.videoId).join(',');
    if(!ids)continue;
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

  const liveByOwner=new Map();

  for(const item of unique){
    const v=videos.get(item.videoId);
    if(!v)continue;

    const d=v.liveStreamingDetails;
    const isLive=
      v.snippet?.liveBroadcastContent==='live' &&
      !!d?.actualStartTime &&
      !d?.actualEndTime;

    if(isLive){
      const owner=item.owner;
      liveByOwner.set(owner.id,{
        ...owner,
        live:true,
        liveStartedAt:d.actualStartTime,
        lastStreamAt:d.actualStartTime,
        lastStreamTitle:v.snippet?.title||'',
        previewUrl:v.snippet?.thumbnails?.high?.url||v.snippet?.thumbnails?.medium?.url||'',
        channelUrl:owner.channelUrl||(
          owner.handle
            ? 'https://www.youtube.com/'+String(owner.handle).replace(/^@/,'@')
            : 'https://www.youtube.com/channel/'+encodeURIComponent(owner.channelId||'')
        ),
        sources:[{
          platform:'youtube',
          videoId:v.id,
          embedUrl:'https://www.youtube.com/embed/'+encodeURIComponent(v.id)+'?autoplay=1&mute=1&playsinline=1',
          channelUrl:owner.channelUrl||'',
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
    const live=liveByOwner.get(x.id);
    if(live)return live;

    const last=candidates
      .filter(c=>c.owner.id===x.id)
      .sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')))[0];

    const lastVideo=last?videos.get(last.videoId):null;

    return {
      ...x,
      live:false,
      liveStartedAt:null,
      lastStreamAt:lastVideo?.snippet?.publishedAt||x.lastStreamAt||null,
      lastStreamTitle:lastVideo?.snippet?.title||x.lastStreamTitle||'',
      previewUrl:lastVideo?.snippet?.thumbnails?.high?.url||lastVideo?.snippet?.thumbnails?.medium?.url||x.previewUrl||'',
      channelUrl:x.channelUrl||(
        x.handle
          ? 'https://www.youtube.com/'+String(x.handle).replace(/^@/,'')
          : ''
      ),
      sources:[]
    };
  });
}

async function update(){
  if(busy)return;
  busy=true;

  try{
    const data=registry();
    const next=await youtube(data);

    cache={
      streamers:next,
      updatedAt:new Date().toISOString(),
      lastError:null
    };
  }catch(e){
    console.error('LIVE update failed:',e);
    // Keep the last known streamer state instead of replacing it with
    // fabricated LIVE data or an empty list.
    cache={
      ...cache,
      lastError:String(e?.message||e)
    };
  }finally{
    busy=false;
  }
}

app.get('/health',(req,res)=>res.set('Cache-Control','no-store').json({
  ok:true,
  service:'freezzz-live-monitor',
  version:'2026-09-30-live-direct-v2',
  updatedAt:cache.updatedAt,
  lastError:cache.lastError,
  streamers:cache.streamers.length,
  online:cache.streamers.filter(x=>x.live&&x.sources?.some(s=>s.live&&s.embedUrl)).length,
  apiConfigured:!!process.env.YOUTUBE_API_KEY
}));

app.get('/api/live',(req,res)=>res.set('Cache-Control','no-store').json(cache));
app.get('/api/streamers',(req,res)=>res.set('Cache-Control','no-store').json({streamers:registry()}));

update();
setInterval(update,POLL_MS);

app.listen(PORT,()=>console.log(
  'FREEzzzGames YouTube Live Monitor listening on '+PORT+
  ' poll='+POLL_MS+
  ' registry='+registry().length+
  ' apiKey='+(process.env.YOUTUBE_API_KEY?'yes':'no')
));
