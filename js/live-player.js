export function createLivePlayer({mount, onBack, haptic}){
  let current = null;
  let expanded = false;

  const externalUrl = channel => channel?.url || "";

  const setExpanded = value => {
    expanded = !!value;
    const root = mount?.querySelector(".live-video-window");
    root?.classList.toggle("is-expanded", expanded);
    document.body.classList.toggle("live-video-expanded", expanded);
    root?.setAttribute("aria-expanded", expanded ? "true" : "false");
    window.dispatchEvent(new CustomEvent("freezzz:live-player",{
      detail:{open:!!current,expanded,channelId:current?.id||null}
    }));
    haptic?.();
  };

  const toggleExpanded = () => setExpanded(!expanded);

  const render = channel => {
    current = channel || null;
    expanded = false;
    document.body.classList.remove("live-video-expanded");

    if(!mount)return;

    if(!channel){
      mount.innerHTML =
        '<div class="live-player-empty">'+
          '<div class="live-player-icon">📺</div>'+
          '<strong>ВЫБЕРИ СТРИМЕРА</strong>'+
        '</div>';
      return;
    }

    const src = channel.embedUrl || externalUrl(channel);

    mount.innerHTML =
      '<div class="live-video-window" aria-expanded="false">'+
        '<div class="live-video-head">'+
          '<strong><span class="live-dot"></span> '+escapeHtml(channel.name)+'</strong>'+
          '<div class="live-video-actions">'+
            '<button class="live-video-action" data-live-video-action="expand" type="button" aria-label="Развернуть LIVE">↗</button>'+
            '<button class="live-video-action" data-live-video-action="back" type="button" aria-label="Назад">×</button>'+
          '</div>'+
        '</div>'+
        '<div class="live-video-frame-wrap">'+
          '<iframe class="live-video-frame" title="'+escapeHtml(channel.name)+' — LIVE" src="'+escapeAttr(src)+'" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share" allowfullscreen loading="eager"></iframe>'+
          '<div class="live-video-fallback hidden">'+
            '<span>YOUTUBE</span>'+
            '<strong>ЭТОТ КАНАЛ НЕ ПРЕДОСТАВЛЯЕТ EMBED</strong>'+
            '<small>Ссылка остаётся внутри LIVE-окна.</small>'+
          '</div>'+
        '</div>'+
        '<div class="live-video-foot">'+
          '<span>DOUBLE TAP — FULLSCREEN</span>'+
          '<button class="live-video-foot-expand" data-live-video-action="expand" type="button" aria-label="Развернуть LIVE">↗</button>'+
        '</div>'+
      '</div>';

    const root=mount.querySelector(".live-video-window");
    const frame=mount.querySelector(".live-video-frame");

    const fallback=mount.querySelector(".live-video-fallback");
    frame?.addEventListener("error",()=>fallback?.classList.remove("hidden"),{once:true});

    root?.addEventListener("click",event=>{
      const action=event.target.closest("[data-live-video-action]")?.dataset.liveVideoAction;
      if(action==="expand"){ event.preventDefault(); toggleExpanded(); return; }
      if(action==="back"){ event.preventDefault(); onBack?.(); return; }
    });

    let lastTap=0;
    const tapSurface=event=>{
      if(event.target.closest("button"))return;
      const now=Date.now();
      if(now-lastTap<360){
        toggleExpanded();
        lastTap=0;
        return;
      }
      lastTap=now;
      window.setTimeout(()=>{ if(Date.now()-lastTap>=340)lastTap=0; },380);
    };

    root?.addEventListener("dblclick",tapSurface,{passive:true});
    mount.querySelector(".live-video-frame-wrap")?.addEventListener("dblclick",tapSurface,{passive:true});
  };

  return {
    open:render,
    close:()=>render(null),
    back:()=>{if(current){onBack?.();return true;}return false;},
    setExpanded,
    toggleExpanded,
    getState:()=>({selectedId:current?.id||null,expanded})
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
