/* =====================================================================
   PARTE 3: DIBUJO DE PERSONAJES (SVG)
   ===================================================================== */
const LOOK={
  ines:   {eye:"#3a70b0",outfit:"blazer",fem:1},
  cote:   {eye:"#3a9a5a",outfit:"cardigan",fem:1},
  tomas:  {eye:"#6a4a2a",outfit:"hoodie"},
  fiscal: {eye:"#7a5a9a",outfit:"suit"},
  testigo:{eye:"#4a4a4a",outfit:"uniform"},
  jueza:  {eye:"#5a6a7a",outfit:"robe",fem:1,suit:"#2c2c3c"},
  zoila:  {eye:"#5a7a3a",outfit:"cardigan",fem:1},
};
function shade(hex,f){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255;
  if(f<=1){r*=f;g*=f;b*=f;} else {r+=(255-r)*(f-1);g+=(255-g)*(f-1);b+=(255-b)*(f-1);}
  return "#"+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,"0")).join(""); }
/* Personaje de busto, dibujado sobre una grilla de 256x192 (la pantalla de la DS).
   m = boca abierta (0/1), b = parpadeo (0/1) */
function sprite(id,mood,pose,m,b){
  const c=CHARS[id]; if(!c) return ""; const L=LOOK[id];
  mood=mood||"normal"; if(mood==="angry") mood="serious"; pose=pose||""; if(mood==="think"&&!pose) pose="chin";
  const sk=c.skin, skd=shade(sk,.8), hr=c.hair, hd=shade(hr,.68), hl=shade(hr,1.4), su=L.suit||c.suit, sd=shade(su,.7), sl=shade(su,1.3), ac=c.accent;
  const NS='stroke="none"', W="#f4f4f8", MO="#7a2030";
  const nocap = id==="testigo" && (G.nocap || mood==="break");
  const mir=d=>`<g transform="translate(256 0) scale(-1 1)">${d}</g>`;

  /* ---- cuerpo ---- */
  let body=`<path d="M120 68 L102 75 Q86 78 83 94 L76 192 L180 192 L173 94 Q170 78 154 75 L136 68Z" fill="${su}"/>
    <path d="M158 77 Q170 80 173 94 L180 192 L163 192 L163 104Z" fill="${sd}" ${NS}/>
    <path d="M84 96 Q88 82 100 78 L98 84 Q90 88 88 98Z" fill="${sl}" ${NS}/>
    <path d="M94 102 L91 192 M162 102 L165 192" fill="none"/>`;
  const lapels=`<path d="M119 67 L137 67 L128 100Z" fill="${W}"/>
    <path d="M119 66 L128 100 L121 109 L107 80Z" fill="${sd}"/><path d="M137 66 L128 100 L135 109 L149 80Z" fill="${sd}"/>
    <path d="M119 66 L123.5 78 L128 71Z" fill="#fff"/><path d="M137 66 L132.5 78 L128 71Z" fill="#fff"/>`;
  const tie=col=>`<path d="M126 73 L130 73 L132.5 95 L128 101 L123.5 95Z" fill="${col}"/><path d="M125.5 71 L130.5 71 L130 75.5 L126 75.5Z" fill="${shade(col,.8)}"/>`;
  switch(L.outfit){
    case "blazer": body+=lapels+`<rect x="111" y="89" width="4" height="4" fill="#f8d048"/><path d="M140 112 L152 110" fill="none"/>`; break;
    case "suit": body+=lapels+tie(ac)+`<path d="M143 97 L150 95 L151 100 L144 101Z" fill="${W}"/><circle cx="128" cy="116" r="1.5" fill="${ac}"/>`; break;
    case "uniform": body+=`<path d="M128 100 L128 192" fill="none"/>
      <path d="M119 66 L128 78 L122 85 L113 72Z" fill="${sl}"/><path d="M137 66 L128 78 L134 85 L143 72Z" fill="${sl}"/>`+tie("#1c2434")+
      `<path d="M97 77 L112 72 L113.5 77 L99 83Z" fill="#1c2434"/><path d="M159 77 L144 72 L142.5 77 L157 83Z" fill="#1c2434"/>
      <path d="M139 91 L149 91 L149 97 L144 102 L139 97Z" fill="#f8d048"/><rect x="104" y="92" width="13" height="11" fill="${sd}"/><path d="M104 96 L117 96" fill="none"/>`; break;
    case "cardigan": body+=`<path d="M118 68 Q128 84 138 68 L135 192 L121 192Z" fill="#fbf3f6"/><path d="M121 78 Q128 86 135 78" fill="none" stroke="${ac}"/>
      <circle cx="119" cy="112" r="1.6" fill="${W}"/><circle cx="118.5" cy="126" r="1.6" fill="${W}"/>`; break;
    case "hoodie": body=`<path d="M103 78 Q128 56 153 78 Q128 90 103 78Z" fill="${sd}"/>`+body+
      `<path d="M118 70 Q128 84 138 70 L136 192 L120 192Z" fill="#282830"/><path d="M122 82 L121 102 M134 82 L135 102" fill="none" stroke="${W}"/>
      <rect x="97" y="106" width="5" height="3" fill="#e84a5f" ${NS}/><rect x="150" y="96" width="3" height="5" fill="#4aa3e8" ${NS}/><rect x="104" y="120" width="4" height="4" fill="#58c070" ${NS}/><rect x="146" y="118" width="5" height="2" fill="#e84a5f" ${NS}/>`; break;
    case "robe": body+=`<path d="M109 84 L105 192 M147 84 L151 192" fill="none" stroke="${sl}"/>
      <path d="M117 67 L139 67 L135 81 L128 76 L121 81Z" fill="${W}"/><path d="M123.5 78 L132.5 78 L134.5 98 L128 103 L121.5 98Z" fill="${W}"/><path d="M128 79 L128 101" fill="none" stroke="#c8c8d4"/>`; break;
  }
  if(L.fem) body=`<g transform="translate(128 0) scale(.9 1) translate(-128 0)">${body}</g>`;
  const neck=`<path d="M121 56 L121 73 L135 73 L135 56Z" fill="${sk}"/><path d="M121.5 62 L134.5 62 L134.5 68 L121.5 65Z" fill="${skd}" ${NS}/>`;

  /* ---- cabeza ---- */
  const HEAD="M110 34 Q110 19 128 19 Q146 19 146 34 L146 46 Q145 56 137 62 L131 65.5 Q128 67 125 65.5 L119 62 Q111 56 110 46Z";
  const head=`<ellipse cx="109.5" cy="45.5" rx="3" ry="5" fill="${sk}"/><ellipse cx="146.5" cy="45.5" rx="3" ry="5" fill="${skd}"/>
    <path d="${HEAD}" fill="${sk}"/><path d="M146 34 L146 46 Q145 56 137 62 L131 65.5 Q140 56 141.5 42Z" fill="${skd}" ${NS}/><path d="${HEAD}" fill="none"/>`;

  /* ---- ojos ---- */
  const wide = mood==="shock"||mood==="break";
  const eye=cx=>{
    if(mood==="cry") return `<path d="M${cx-4.5} 45.5 Q${cx} 41.5 ${cx+4.5} 45.5" fill="none" stroke-width="1.6"/><path d="M${cx-2} 47 L${cx-2} 63 L${cx+2} 63 L${cx+2} 47Z" fill="#8fd3ff" ${NS}/><path d="M${cx-.5} 48 L${cx-.5} 62" stroke="#e8f8ff" fill="none"/>`;
    if(b && !wide) return `<path d="M${cx-4.5} 44.5 Q${cx} 47 ${cx+4.5} 44.5" fill="none" stroke-width="1.6"/>`;
    if(wide) return `<ellipse cx="${cx}" cy="43.5" rx="5" ry="5.2" fill="#fff"/><circle cx="${cx}" cy="43.5" r="1.3" fill="#181018" ${NS}/>`;
    const dx = mood==="think" ? 1.4 : 0;
    let e=`<ellipse cx="${cx}" cy="44.2" rx="4.2" ry="3.6" fill="#fff" ${NS}/><circle cx="${cx+dx}" cy="44.5" r="2.8" fill="${L.eye}" ${NS}/><circle cx="${cx+dx}" cy="44.8" r="1.4" fill="#181018" ${NS}/><rect x="${cx+dx-2.6}" y="42" width="1.5" height="1.5" fill="#fff" ${NS}/>`;
    if(mood==="smug") e+=`<rect x="${cx-5}" y="39.5" width="10" height="4.4" fill="${sk}" ${NS}/><path d="M${cx-5} 44 L${cx+5} 44" fill="none" stroke-width="1.7"/>`;
    else e+=`<path d="M${cx-4.8} 42.8 Q${cx} 39 ${cx+4.8} 42.8" fill="none" stroke-width="1.7"/>${L.fem?`<path d="M${cx<128?cx-4.8:cx+4.8} 42.8 l${cx<128?-1.6:1.6} -1.6" fill="none"/>`:""}`;
    return e;
  };
  const bc=shade(hr,.5);
  const BROW={ normal:["M115 37.5 Q120 35.5 125 37.5","M131 37.5 Q136 35.5 141 37.5"], serious:["M115 35.5 L125 39","M141 35.5 L131 39"],
    sweat:["M115 38.5 L125 35.5","M141 38.5 L131 35.5"], shock:["M115 33.5 Q120 30.5 125 33.5","M131 33.5 Q136 30.5 141 33.5"],
    smug:["M115 37.5 Q120 36 125 38.5","M131 36 Q136 33 141 35"], think:["M115 37.5 Q120 35.5 125 37.5","M131 35.5 L141 37.5"] };
  BROW.smile=BROW.normal; BROW.cry=BROW.sweat; BROW.break=BROW.shock;
  const brows=BROW[mood].map(d=>`<path d="${d}" fill="none" stroke="${bc}" stroke-width="1.7"/>`).join("");
  const nose=`<path d="M128.5 49 L127 54 L129.5 54" fill="none" stroke="${shade(sk,.62)}"/>`;

  /* ---- boca (m=1: abierta) ---- */
  const oval=(rx,ry,col)=>`<ellipse cx="128" cy="59.5" rx="${rx}" ry="${ry}" fill="${col||MO}"/>`;
  const line=d=>`<path d="${d}" fill="none"/>`;
  let mouth;
  switch(mood){
    case "smile":  mouth = m ? `<path d="M123 57.5 Q128 65 133 57.5Z" fill="${MO}"/>` : line("M123.5 58 Q128 62 132.5 58"); break;
    case "smug":   mouth = m ? `<path d="M124 58.5 Q129 64 132.5 57.5Z" fill="${MO}"/>` : line("M124 59.5 Q129 61.5 132.5 57.5"); break;
    case "serious":mouth = m ? oval(2.8,2.2) : line("M124.5 59.5 L131.5 59.5"); break;
    case "sweat":  mouth = m ? oval(2.6,2) : line("M123.5 59.5 L125.5 58.5 L128 60 L130.5 58.5 L132.5 59.5"); break;
    case "think":  mouth = m ? oval(2,1.8) : line("M126 59.5 L130 59.5"); break;
    case "shock":  mouth = m ? oval(3.6,4.8,"#5a1020") : oval(3.2,4,"#5a1020"); break;
    case "break":  mouth = `<path d="M121.5 56 L134.5 56 L133.5 ${m?64.5:63.5} L122.5 ${m?64.5:63.5}Z" fill="#5a1020"/><rect x="123" y="56.6" width="10" height="1.8" fill="#fff" ${NS}/>`; break;
    case "cry":    mouth = `<path d="M123 ${m?63:62} Q128 ${m?52:54} 133 ${m?63:62} Q128 61 123 ${m?63:62}Z" fill="${MO}"/>`; break;
    default:       mouth = m ? oval(2.8,2.3) : line("M124.5 59 Q128 60.8 131.5 59");
  }
  let face=brows+eye(120)+eye(136)+nose;
  if(id==="testigo") face+=`<path d="M120.5 57 Q124 52.5 128 55.2 Q132 52.5 135.5 57 Q128 55.8 120.5 57Z" fill="${hr}"/><g transform="translate(0 1.8)">${mouth}</g>`;
  else face+=mouth;
  if(id==="jueza") face+=`<circle cx="120" cy="44.5" r="5.8" fill="none" stroke="#c9a227" stroke-width="1.3"/><circle cx="136" cy="44.5" r="5.8" fill="none" stroke="#c9a227" stroke-width="1.3"/><path d="M125.8 44 L130.2 44" fill="none" stroke="#c9a227"/>`;
  if(mood==="smile"&&L.fem) face+=`<rect x="113" y="50" width="4" height="2" fill="#f0a0a0" ${NS}/><rect x="139" y="50" width="4" height="2" fill="#f0a0a0" ${NS}/>`;

  /* ---- pelo ---- */
  const band=`<path d="M113 24 Q128 15.5 143 24 L142 26.5 Q128 19.5 114 26.5Z" fill="${hl}" ${NS}/>`;
  let back="", top="";
  switch(c.style){
    case "long": back=`<path d="M106 30 Q104 11 128 11 Q152 11 150 30 L156 82 Q150 92 142 85 L142 54 L114 54 L114 85 Q106 92 100 82Z" fill="${hr}"/><path d="M146 40 L150 30 L156 82 Q150 92 144 86Z" fill="${hd}" ${NS}/>`;
      top=`<path d="M108 44 Q103 13 128 13 Q153 13 148 44 L146 32 Q140 24 134 34 L130 25 Q124 36 116 30 Q112 34 110 46Z" fill="${hr}"/>`+band; break;
    case "pony": back=`<path d="M146 19 Q167 15 169 44 Q169 66 158 76 Q160 52 148 36Z" fill="${hr}"/><path d="M160 28 Q167 40 162 62 Q165 44 158 32Z" fill="${hl}" ${NS}/>`;
      top=`<path d="M108 44 Q103 13 128 13 Q153 13 148 44 L145 31 Q136 22 124 31 Q116 34 111 44Z" fill="${hr}"/>`+band+`<circle cx="149" cy="22" r="3.4" fill="${ac}"/>`; break;
    case "messy": top=`<path d="M107 42 L103 22 L111 27 L111 11 L120 20 L126 6 L132 20 L140 8 L142 22 L153 17 L149 42 L145 31 L137 34 L129 28 L121 35 L113 30Z" fill="${hr}"/>
      <path d="M113 24 L113 15 L118 22Z M126 18 L127 10 L130 19Z M140 20 L141 12 L143 21Z" fill="${shade(hr,2.2)}" ${NS}/>`; break;
    case "slick": top=`<path d="M108 42 Q102 13 130 12 Q154 13 149 42 L147 29 Q134 20 113 29Z" fill="${hr}"/><path d="M136 14 Q158 5 155 27 Q149 17 137 20Z" fill="${hr}"/>
      <path d="M114 23 Q126 15 140 17 L140 19 Q126 18 115 26Z" fill="${hl}" ${NS}/><path d="M142 13 Q152 10 153 19 Q149 13 142 15Z" fill="${hl}" ${NS}/>`; break;
    case "bun": back=`<circle cx="128" cy="11" r="8.5" fill="${hr}"/><path d="M123 7 Q128 4 133 7" fill="none" stroke="${hl}"/>`;
      top=`<path d="M108 44 Q103 16 128 16 Q153 16 148 44 L144 31 Q128 21 112 31Z" fill="${hr}"/><path d="M114 26 Q128 18 142 26 L141 28 Q128 21.5 115 28Z" fill="#fff" ${NS}/>`; break;
    case "cap": top = nocap
      ? `<path d="M110 44 L104 32 L110 35 L107 24 L114 31 L113 38Z" fill="${hr}"/>${mir(`<path d="M110 44 L104 32 L110 35 L107 24 L114 31 L113 38Z" fill="${hr}"/>`)}<path d="M123 19 L121 11 M128 18.5 L129 9 M133 19 L136 11" fill="none" stroke="${hr}"/>`
      : `<path d="M109 44 L108 34 L113 34 L112 42Z" fill="${hr}"/>${mir(`<path d="M109 44 L108 34 L113 34 L112 42Z" fill="${hr}"/>`)}
         <path d="M106 31 Q104 9 128 9 Q152 9 150 31Z" fill="${ac}"/><path d="M110 22 Q112 12 124 11 Q114 15 113 24Z" fill="${shade(ac,1.5)}" ${NS}/>
         <rect x="105" y="29" width="46" height="5.5" fill="#141c2c"/><path d="M104 34.5 L152 34.5 Q158 41 150 41 L106 41 Q98 41 104 34.5Z" fill="#1c2638"/>
         <circle cx="128" cy="20.5" r="4.5" fill="#f8d048"/><rect x="126.5" y="19" width="3" height="3" fill="#b88818" ${NS}/>`; break;
  }

  /* ---- brazos / extras ---- */
  let arm="", extra="";
  if(pose==="point") arm=`<path d="M157 78 L205 62 L209 73.5 L170 99Z" fill="${su}"/><path d="M160 86 L207 68 L209 73.5 L170 99Z" fill="${sd}" ${NS}/><path d="M157 78 L205 62 L209 73.5 L170 99Z" fill="none"/>
    <path d="M204 62 L209.5 60.5 L213.5 72 L208 74Z" fill="${W}"/><circle cx="216.5" cy="66" r="5.2" fill="${sk}"/><path d="M219.5 62.5 L233 61 L233.5 65.2 L220.5 67.2Z" fill="${sk}"/>`;
  if(pose==="cafe") arm=`<path d="M82 126 L77 108 L98 88 L109 97 L98 130Z" fill="${su}"/><circle cx="104" cy="91" r="5.2" fill="${sk}"/>
    <path d="M112 79 Q118.5 79 118.5 83.5 Q118.5 88 112 88" fill="none" stroke-width="3.4"/><path d="M112 79 Q118.5 79 118.5 83.5 Q118.5 88 112 88" fill="none" stroke="${W}" stroke-width="1.6"/>
    <path d="M97 76 L112 76 L111 92 L98 92Z" fill="${W}"/><rect x="98" y="77" width="13" height="2" fill="#6a4020" ${NS}/>
    <path d="M101 72 Q103.5 68 101 64 M107 72 Q109.5 68 107 64" fill="none" stroke="#ffffff"/>`;
  if(pose==="chin") arm=`<path d="M172 130 L176 112 L143 72 L134 80 L154 132Z" fill="${su}"/><circle cx="136" cy="69.5" r="5.2" fill="${sk}"/><path d="M131 66 L138 64.5 L138.5 67.5 L132 69Z" fill="${sk}"/>`;
  if(mood==="sweat"||mood==="shock"||mood==="break") extra+=`<path d="M152 28 Q155.5 35 152 38 Q148.5 35 152 28Z" fill="#8fd3ff"/><path d="M103 38 Q106 44 103 46.5 Q100 44 103 38Z" fill="#8fd3ff"/>`;
  if(mood==="break") extra+=`<path d="M156 46 Q159 52 156 54.5 Q153 52 156 46Z" fill="#8fd3ff"/>`;
  if(wide) extra+=`<path d="M98 20 L104 26 M94 30 L101 32 M158 20 L152 26 M162 30 L155 32" fill="none" stroke="#fff" stroke-width="1.6"/>`;

  return `<svg viewBox="0 0 256 192" xmlns="http://www.w3.org/2000/svg"><g stroke="#241820" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">
    ${back}${neck}${body}${head}${face}${top}${arm}${extra}</g></svg>`;
}
const CAP_SVG=`<svg viewBox="40 30 120 70"><path d="M54 84 Q56 38 100 38 Q144 38 146 84Z" fill="#2a3550"/><rect x="46" y="80" width="108" height="11" rx="5" fill="#141c2c"/><circle cx="100" cy="58" r="9" fill="#d8bf55"/></svg>`;

/* burbuja de exclamación */
const BUBBLES={objecion:{t:"¡OBJECIÓN!",c:"#e8262e"},momento:{t:"¡UN MOMENTO!",c:"#2f6bd6"},mire:{t:"¡MIRE ESTO!",c:"#e8262e"}};
function bubbleSVG(kind){
  const b=BUBBLES[kind]; let pts=[]; const N=22;
  for(let i=0;i<N*2;i++){ const ang=i/(N*2)*Math.PI*2, out=i%2===0, j=(i*37%11)/11;
    const rx=out?300+j*40:240, ry=out?135+j*25:105; pts.push((320+Math.cos(ang)*rx).toFixed(1)+","+(170+Math.sin(ang)*ry).toFixed(1)); }
  return `<svg viewBox="0 0 640 340"><polygon points="${pts.join(" ")}" fill="#fff" stroke="#000" stroke-width="8" stroke-linejoin="round"/>
   <text x="320" y="200" text-anchor="middle" font-family="Bebas Neue" font-size="${b.t.length>10?96:118}" fill="${b.c}" stroke="#000" stroke-width="5" paint-order="stroke" letter-spacing="3">${b.t}</text></svg>`;
}

