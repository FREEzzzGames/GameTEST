const webApp = () => window.Telegram?.WebApp || null;

export const Platform = {
  isTelegram(){ return !!webApp(); },
  telegram(){ return webApp(); },
  ready(){
    try{ webApp()?.ready?.(); }catch(e){}
  },
  expand(){
    try{ webApp()?.expand?.(); }catch(e){}
  },
  haptic(style="light"){
    try{ webApp()?.HapticFeedback?.impactOccurred?.(style); }catch(e){}
  },
  openLink(url){
    if(!url)return;
    try{
      const tg=webApp();
      if(tg?.openLink) tg.openLink(url);
      else window.open(url,"_blank","noopener,noreferrer");
    }catch(e){ window.location.href=url; }
  },
  configure(){
    const tg=webApp();
    if(!tg)return;
    try{
      tg.ready?.();
      tg.expand?.();
      tg.setHeaderColor?.(tg.themeParams?.header_bg_color || "#17212b");
      tg.setBackgroundColor?.(tg.themeParams?.bg_color || "#000000");
      tg.setBottomBarColor?.(tg.themeParams?.bottom_bar_bg_color || "#000000");
    }catch(e){}
  }
};
