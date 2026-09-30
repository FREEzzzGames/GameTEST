export function createLivePlayer({mount, onBack, onExternal, haptic}){
  let current = null;

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
    if(!mount)return;

    if(!channel){
      mount.innerHTML =
        '<div class="live-player-empty">'+
          '<div class="live-player-icon">📺</div>'+
          '<strong>ВЫБЕРИ СТРИМЕРА</strong>'+
        '</div>';
      return;
    }

    mount.innerHTML =
      '<div class="live-link-stage">'+
        '<div class="live-link-icon">'+escapeHtml(channel.avatar||"📺")+'</div>'+
        '<strong>'+escapeHtml(channel.name)+'</strong>'+
        '<span>ПРЯМАЯ ССЫЛКА НА КАНАЛ</span>'+
        '<a class="live-player-open" id="livePlayerOpen" href="'+escapeAttr(channel.url)+'" target="_blank" rel="noopener noreferrer">ОТКРЫТЬ КАНАЛ</a>'+
        '<button class="live-player-back" id="livePlayerBack" type="button" aria-label="Назад">‹</button>'+
      '</div>';

    mount.querySelector("#livePlayerBack")?.addEventListener("click",()=>onBack?.());

    mount.querySelector("#livePlayerOpen")?.addEventListener("click",event=>{
      event.preventDefault();
      external(channel);
    });

    external(channel);
  };

  return {
    open:render,
    close:()=>render(null),
    back:()=>{if(current){onBack?.();return true;}return false;},
    external,
    getState:()=>({selectedId:current?.id||null})
  };
}

function escapeHtml(value){
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function escapeAttr(value){
  return escapeHtml(value);
}
