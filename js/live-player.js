export function createLivePlayer({mount, onBack, onExternal, haptic}){
  let current = null;
  let muted = true;

  const send = command => {
    const frame = mount.querySelector("#liveVideoFrame");
    if(!frame?.contentWindow)return;
    try{
      frame.contentWindow.postMessage(JSON.stringify({event:"command",func:command,args:[]}),"https://www.youtube.com");
    }catch(_){}
  };

  const external = channel => {
    if(!channel?.url)return false;
    try{
      const tg = window.Telegram?.WebApp;
      if(tg?.openLink) tg.openLink(channel.url);
      else window.open(channel.url,"_blank","noopener,noreferrer");
    }catch(_){
      window.location.href = channel.url;
    }
    haptic?.();
    onExternal?.(channel);
    return true;
  };

  const render = channel => {
    current = channel || null;
    muted = true;
    if(!mount)return;

    if(!channel){
      mount.innerHTML = '<div class="live-player-empty"><div class="live-player-icon">📺</div><strong>ВЫБЕРИ СТРИМЕРА</strong></div>';
      return;
    }

    const source = channel.embedUrl || "";
    mount.innerHTML =
      '<div class="live-player-shell">'+
        (source
          ? '<iframe class="live-video" id="liveVideoFrame" src="'+source+'" title="'+escapeHtml(channel.name)+' — LIVE" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen loading="eager"></iframe>'
          : '<div class="live-player-link"><div class="live-player-icon">'+escapeHtml(channel.avatar||"📺")+'</div><strong>'+escapeHtml(channel.name)+'</strong><span>ПРЯМАЯ ССЫЛКА НА КАНАЛ</span><button class="live-player-open" id="livePlayerOpen" type="button">ОТКРЫТЬ YOUTUBE</button></div>')+
        '<div class="live-player-top"><span class="live-player-live"><i></i> LIVE</span><button class="live-player-back" id="livePlayerBack" type="button">‹</button></div>'+
        (source ? '<button class="live-sound-btn" id="liveSoundBtn" type="button">🔇</button>' : '')+
        '<div class="live-player-info"><span class="live-player-avatar">'+escapeHtml(channel.avatar||"🎮")+'</span><span><strong>'+escapeHtml(channel.name)+'</strong><small>'+escapeHtml(channel.category||"YouTube")+'</small></span></div>'+
      '</div>';

    mount.querySelector("#livePlayerBack")?.addEventListener("click",()=>onBack?.());
    mount.querySelector("#livePlayerOpen")?.addEventListener("click",()=>external(channel));
    const frame = mount.querySelector("#liveVideoFrame");
    frame?.addEventListener("load",()=>send(muted?"mute":"unMute"),{once:true});
    mount.querySelector("#liveSoundBtn")?.addEventListener("click",()=>{
      muted=!muted;
      send(muted?"mute":"unMute");
      const button=mount.querySelector("#liveSoundBtn");
      if(button)button.textContent=muted?"🔇":"🔊";
      haptic?.();
    });
  };

  return {
    open:render,
    close:()=>render(null),
    back:()=>{if(current){onBack?.();return true;}return false;},
    external,
    getState:()=>({selectedId:current?.id||null,muted})
  };
}

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
