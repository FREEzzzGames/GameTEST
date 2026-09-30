/* FREEzzzGames generated game poster renderer */
function escapeSvgText(value){
    return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function hashCode(value){
    let h=0; const s=String(value);
    for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0;
    return h;
  }

  function posterDataUrl(id, gameById){
    const g=gameById[id] || {title:id,emoji:'🎮',genre:'ARCADE'};
    const palettes=[
      ['#07152f','#0b6e99','#19e6d0'],['#210b38','#7c1fff','#ff4fd8'],
      ['#351008','#d64b1f','#ffd166'],['#061d19','#078f75','#72f1b8'],
      ['#17122e','#4d55d9','#8ee3ff'],['#271006','#b83255','#ff9f68']
    ];
    const p=palettes[Math.abs(hashCode(id))%palettes.length];
    const title=escapeSvgText(g.title), genre=escapeSvgText(g.genre||'ARCADE'), emoji=escapeSvgText(g.emoji||'🎮');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">'+
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".55" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient>'+
      '<radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
      '<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".10"/></pattern>'+
      '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity=".38"/></filter></defs>'+
      '<rect width="900" height="620" fill="url(#bg)"/><circle cx="690" cy="120" r="230" fill="url(#glow)"/><rect width="900" height="620" fill="url(#grid)"/>'+
      '<path d="M-60 500 C170 360 280 610 500 445 S760 310 960 430" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="70"/>'+
      '<path d="M-40 505 C170 375 285 590 500 455 S760 330 940 445" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3"/>'+
      '<g filter="url(#shadow)"><circle cx="450" cy="255" r="126" fill="#07101f" fill-opacity=".52" stroke="#fff" stroke-opacity=".22" stroke-width="3"/><text x="450" y="302" text-anchor="middle" font-size="145" font-family="system-ui,Segoe UI Emoji,Apple Color Emoji,sans-serif">'+emoji+'</text></g>'+
      '<text x="48" y="72" fill="#fff" fill-opacity=".78" font-size="20" font-family="monospace" font-weight="700" letter-spacing="4">FREEzzzGAMES • '+genre.toUpperCase()+'</text>'+
      '<text x="48" y="548" fill="#fff" font-size="42" font-family="system-ui,sans-serif" font-weight="900" letter-spacing="2">'+title+'</text>'+
      '<rect x="48" y="570" width="160" height="5" rx="3" fill="#fff" fill-opacity=".65"/></svg>';
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }

  function gameLogoUrl(id, gameById){ return posterDataUrl(id, gameById); }

export { gameLogoUrl };
