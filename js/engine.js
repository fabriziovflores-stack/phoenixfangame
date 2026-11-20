/* =====================================================================
   PARTE 4: MOTOR
   ===================================================================== */
const $=id=>document.getElementById(id);
const MAXH=5;
/* ===== Tiempos del juego (pauta del dueño) ===== */
const ENTRADA_MS=300;     // fundido cuando aparece un personaje nuevo en el mismo lugar
const T={ letra:35, rapido:20, nervioso:50, drama:75, coma:100, punto:180, suspensivos:450, pausa:450,
  trasAparecer:120,       // empieza a hablar después de aparecer
  camara:150,             // cambio de cámara en el juicio (ej. de Justo a Penna)
  anim:250,               // animación previa a hablar (golpe en la mesa, salto...)
  revelacion:650,         // silencio antes de una revelación (sfx badum o primer plano de rayos)
  lugar:750,              // cambio de ubicación (fundido a negro, ida y vuelta)
  dia:1100 };             // tarjeta de cambio de día
let G={}, pc=0, checkpoint=0, mode="idle", waiting=null, typing=false, tTimer=null, X=null, busy=false;

function resetGame(){ hideEv(); EVIDENCE.splice(EV0); G={notes:{}, health:MAXH, nocap:false, pos:"negro", flags:{}, met:{}, inv:null}; pc=0; checkpoint=0; vistos.clear(); drawHealth(); }
function drawHealth(hit){
  $("health").innerHTML=Array.from({length:MAXH},(_,i)=>`<i class="${i<G.health?"":"off"} ${hit&&i===G.health?"hit":""}">!</i>`).join("");
}

/* escena */
const vistos=new Set();   // quiénes ya aparecieron en este día o juicio: el fundido es solo la primera vez (se borra con cada tarjeta «Día N»)
function setScene(pos, who, mood, pose, yaVisto){
  const st=$("stage");
  drawSprite.corte = !!(pos && pos!==G.pos) || !!yaVisto;              // cambio de cámara: el personaje aparece de golpe
  if(pos && pos!==G.pos){
    st.className="pos-"+pos; G.pos=pos; drawBG(pos);
    $("health").style.visibility = pos==="negro" ? "hidden" : "";
    st.classList.remove("pan"); void st.offsetWidth; st.classList.add("pan");
  }
  const sp=$("sprite");
  if(who===undefined) return;
  if(who===null){ drawSprite(null); return; }
  drawSprite(who,mood,pose);
  sp.dataset.who=who;                                   // Justo tiene su propio encuadre (para que el brazo al apuntar salga completo)
  sp.classList.toggle("flip", G.pos==="fiscalia" && who!=="fiscal");   // Penna ya viene dibujado mirando a la izquierda
}
function anim(name){
  const sp=$("sprite"), st=$("stage");
  sp.classList.remove("slam","jump","jumpL","tremble"); void sp.offsetWidth;
  if(name==="slam"){ sp.classList.add("slam"); SFX.slam(); shake(); }
  if(name==="hit"){ sp.classList.add(G.pos==="fiscalia"?"jumpL":"jump"); SFX.hit(); shake(); flash(); }
  if(name==="jump"){ sp.classList.add("jump"); SFX.hit(); }
  if(name==="tremble"){ sp.classList.add("tremble"); shake(); }
}
function shake(){ const g=$("stage"); g.classList.remove("shakeS"); void g.offsetWidth; g.classList.add("shakeS"); }
function flash(red){ const f=$("flash"); f.className=""; void f.offsetWidth; f.className="on"+(red?" red":""); }

/* texto con efecto máquina de escribir */
/* Códigos dentro de una línea (como en la DS, la escena cambia mientras se escribe):
   [r]…[/r] rojo · [p] pausa · [m=emoción] cambia la cara · [a=slam|hit|tremble] animación · [s] temblor · [f] destello */
const CODE_RE=/\[(\/?r|p|s|f|m=[\w:]+|a=\w+)\]/g;
function plainText(t){ return t.replace(CODE_RE,""); }
function parseText(t){
  const out=[]; let cls=""; let i=0;
  while(i<t.length){
    if(t.startsWith("[r]",i)){ cls="r"; i+=3; continue; }
    if(t.startsWith("[/r]",i)){ cls=""; i+=4; continue; }
    const m=/^\[(p|s|f|m=[\w:]+|a=\w+)\]/.exec(t.slice(i,i+24));
    if(m){ out.push({ctl:m[1]}); i+=m[0].length; continue; }
    out.push({ch:t[i],cls}); i++;
  }
  return out;
}
function typeText(t, style, voice, done){
  const el=$("text"); el.className=style||""; el.innerHTML="";
  const all=parseText(t), chars=all.filter(c=>!c.ctl); el.style.fontSize=""; el.textContent=plainText(t); if(el.scrollHeight>el.clientHeight+2) el.style.fontSize="3.6cqw"; el.innerHTML=""; let i=0, span=null, spanCls=null; typing=true; $("next").classList.remove("on");
  clearTimeout(tTimer);
  const ctlAt={}; let k=0; all.forEach(c=>{ if(c.ctl) (ctlAt[k]=ctlAt[k]||[]).push(c.ctl); else k++; });
  const runCtl=(c,quiet)=>{
    if(c==="s"){ if(!quiet) shake(); }
    else if(c==="f"){ if(!quiet) flash(); }
    else if(c.startsWith("m=") && cur){ let v=c.slice(2); if(v.startsWith("np:")){ v=v.slice(3); cur.pose=""; } cur.mood=v; renderSprite(); }
    else if(c.startsWith("a=") && !quiet) anim(c.slice(2));
  };
  const finish=()=>{ clearTimeout(tTimer); setTalk(0);
    Object.keys(ctlAt).forEach(n=>{ if(+n>=i) ctlAt[n].forEach(c=>{ if(c.startsWith("m=")) runCtl(c,true); }); }); i=chars.length+1; el.innerHTML=chars.map(c=>c.cls?`<span class="r">${esc(c.ch)}</span>`:esc(c.ch)).join(""); typing=false; renderSprite(); done&&done(); };
  typeText.finish=finish;
  const step=()=>{
    let pausa=0;
    if(ctlAt[i] && !ctlAt[i].done){ ctlAt[i].done=1; ctlAt[i].forEach(x=>{ if(x==="p") pausa+=450; else runCtl(x); }); }
    if(pausa){ setTalk(0); tTimer=setTimeout(step,pausa*T.pausa/450); return; }
    if(i>=chars.length){ finish(); return; }
    const c=chars[i];
    if(!span||spanCls!==c.cls){ span=document.createElement("span"); if(c.cls) span.className=c.cls; spanCls=c.cls; el.appendChild(span); }
    span.textContent+=c.ch;
    if(c.ch!==" " && i%2===0) voice==="type"?SFX.type():SFX.blip(voice);
    if(canTalk && i%3===0) setTalk((i/3)%2===0);
    i++;
    const nx=chars[i]&&chars[i].ch;
    const pv=chars[i-2]&&chars[i-2].ch;
    const d = c.ch==="…" || (c.ch==="." && pv==="." && nx!==".") ? T.suspensivos     // puntos suspensivos
            : c.ch==="." && nx==="." ? typeText.vel
            : ".!?".includes(c.ch) && (nx===" "||nx===undefined) ? T.punto : c.ch===","? T.coma : typeText.vel;
    tTimer=setTimeout(step,d);
  };
  step();
}
function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;"); }

/* una línea de diálogo */
/* ---------- Pruebas en pantalla ---------- */
let evPanelTTL=0, evBoxTTL=0;
function evPic(it){ return EVIMG[it.id]?`<img src="${EVIMG[it.id]}">`:(it.icon||miniFace(it.who)||""); }
function showEvPanel(it,by){        // panel que baja cuando una prueba entra al expediente
  const p=$("evpanel"); p.querySelector(".pic").innerHTML=evPic(it); p.querySelector(".nm").textContent=it.name;
  p.querySelector(".ds").textContent="Tipo: Prueba"+(by?"\nAportada por "+by+".":"")+"\n"+it.desc.split(". ")[0].slice(0,90)+".";
  p.classList.add("on"); evPanelTTL=2; SFX.ding();
}
function showEvBox(id,ttl){         // recuadro con la prueba de la que se está hablando
  const it=EVIDENCE.find(e=>e.id===id)||PROFILES.find(e=>e.id===id); if(!it) return;
  const b=$("evbox"); b.innerHTML=evPic(it); b.classList.add("on"); evBoxTTL=ttl||4;
}
function hideEv(){ evPanelTTL=evBoxTTL=0; $("evpanel").classList.remove("on"); $("evbox").classList.remove("on"); }
function tickEv(l){
  if(evBoxTTL>0){ if(--evBoxTTL<=0) $("evbox").classList.remove("on"); }
  const b=$("evbox"); b.classList.toggle("L",G.pos==="fiscalia"); b.classList.toggle("R",G.pos!=="fiscalia");
}
function evBeat(it,by,done){
  EVIDENCE.push(it); showEvPanel(it,by);
  $("name").textContent=""; canTalk=false; mode="dialog"; renderControls();
  waiting=()=>{ $("evpanel").classList.remove("on"); busy=true; setTimeout(()=>{ busy=false; done(); },320); };
  typeText("«"+it.name+"» se agregó al expediente.","narr","type",()=>{ if(mode==="dialog") $("next").classList.add("on"); });
}
function say(l, done){
  if(l.cmd && CMD[l.cmd]) return CMD[l.cmd](l, done);        // un comando simple dentro de una lista de líneas (ej. negro)
  if(l.evidence && EVX[l.evidence] && !EVIDENCE.find(e=>e.id===l.evidence)){
    const d0=done, it=EVX[l.evidence], by=l.who?CHARS[l.who].name:""; done=()=>evBeat(it,by,d0);
  }
  const go=()=>{
    const ch=l.who?CHARS[l.who]:null;
    const enInv0 = G.inv && X && X.inv;
    const pos0=l.pos || (enInv0 ? invBg() : (ch?ch.pos:G.pos));
    if(!go.panned && PAN_MS && PAN_POS[pos0]!==undefined && PAN_POS[G.pos]!==undefined && pos0!==G.pos
       && (l.pan || l.bubble || l.anim==="slam" || l.anim==="hit") && l.pan!==false){
      go.panned=1; busy=true; return swipe(PAN_POS[pos0]>PAN_POS[G.pos], ()=>{ busy=false; go(); });
    }
    $("tag").textContent = X&&X.tag ? X.tag : "";
    const enInv = G.inv && X && X.inv;                   // en la investigación todos hablan en el lugar donde está Justo
    const pos=l.pos || (enInv ? invBg() : (ch?ch.pos:G.pos));
    const prevWho=cur&&cur.who, prevPos=G.pos;
    const yo = (enInv && l.who==="ines" && !l.pos) || l.phone;   // a Justo no se le ve en la investigación; por teléfono, tampoco a quien llama
    const yaVisto = l.who && vistos.has(l.who);
    setScene(pos, yo ? undefined : (l.who?l.who:(l.pos?null:undefined)), l.mood, l.pose, yaVisto);
    if(l.who && !yo) vistos.add(l.who);
    const entra = l.who && !yo && l.who!==prevWho && pos===prevPos && !yaVisto;   // aparece alguien por primera vez en este lugar
    { const sg=$("stage");                                  // zoom:true = primer plano que se acerca de golpe (sigue si la línea anterior también era zoom)
      if(l.zoom){ if(!sg.classList.contains("zoomIn")){ void sg.offsetWidth; sg.classList.add("zoomIn"); flash(); shake(); } }
      else sg.classList.remove("zoomIn"); }
    if(l.music!==undefined) music(l.music, !!(l.bubble || l.cut));   // con burbuja (protesta) el cambio es en seco
    else if(l.autoMusic) musicaAuto(l.autoMusic);              // la música de la objeción entra en la segunda frase
    if(l.anim) anim(l.anim);
    tickEv(l);
    if(l.damage) takeDamage();
    if(l.confetti) confetti();
    if(l.sfx && SFX[l.sfx]) SFX[l.sfx]();                   // sonido puntual: sfx:"badum", etc.
    if(l.read){ G.notes[l.read[0]]=l.read[1]; SFX.realize(); showEvBox(l.read[0],3); }
    if(l.desc) G.notes["desc:"+l.desc[0]]=l.desc[1];          // cambia el texto de la ficha (ej. la foto ya leída)
    if(l.show) showEvBox(l.show,3);                          // muestra una prueba que ya está en el expediente
    if(l.flag) [].concat(l.flag).forEach(f=>G.flags[f]=1);                       // marca: algo ya pasó
    if(l.meet && !G.met[l.meet]){ G.met[l.meet]=1; const pr=PROFILES.find(p=>p.id===l.meet); if(pr) toast("Perfil agregado: "+pr.name); }
    $("name").textContent = ch ? (l.phone?"📞 ":"")+(l.name||ch.name) : "";   // name:"???" = todavía no sabemos quién es
    const think = plainText(l.text).startsWith("("); canTalk = !!l.who && !yo && !(think && l.who==="ines");   // solo Justo piensa en silencio; los demás entre paréntesis susurran y mueven la boca
    const style = l.cross ? "cross" : think ? "think" : !l.who ? "narr" : "";
    mode="dialog"; renderControls();
    waiting=done;
    blipWho=l.who;
    const reveal = l.sfx==="badum" || l.sfx==="drama" || (pos==="rayos" && !l.zoom);   // con zoom (Cornered Variation) habla a velocidad normal
    typeText.vel = typeof l.speed==="number" ? l.speed : l.speed==="rapido" ? T.rapido : l.speed==="nervioso" ? T.nervioso : l.speed==="drama" ? T.drama
      : reveal ? T.drama : ["sweat","worried","panic","nervous"].includes(l.mood) ? T.nervioso : T.letra;
    const start=()=>typeText(l.text, style, ch?ch.voice:(l.who===null?700:700), ()=>{ if(mode==="dialog") $("next").classList.add("on");
      if(l.auto) setTimeout(()=>{ if(mode==="dialog" && waiting===done && !busy && !typing) advance(); }, l.auto); });   // auto:ms = pasa sola, sin tocar
    const anima=Math.max(0, seqUntil-Date.now());          // el texto espera a que termine la animación (apuntar, lentes...)
    const camara = pos!==prevPos && prevPos!=="negro" && ["defensa","fiscalia","estrado","juez"].includes(pos);
    const espera=Math.max(entra?ENTRADA_MS+T.trasAparecer:0, anima, l.anim?T.anim:0, camara?T.camara:0, reveal?T.revelacion:0)+(l.wait||0);
    if(espera>0){ $("text").textContent=""; busy=true; setTimeout(()=>{ busy=false; start(); }, espera); } else start();
  };
  const R=REACT[l.who], rk=R && (l.pose && R["pose:"+l.pose] ? "pose:"+l.pose : (R[l.mood||"normal"] ? (l.mood||"normal") : null));
  if(rk && !(plainText(l.text).startsWith("(") && l.who==="ines")){
    const pre=/^\[(m|a)=/.test(l.text)?"":"[p]";
    l=Object.assign({},l,{text:pre+"[m="+(rk.startsWith("pose:")?"np:":"")+R[rk]+"]"+l.text});
  }
  if(l.bubble) showBubble(l.bubble, go); else go();
}
/* Barrido rápido de cámara (como en la DS cuando alguien interrumpe). PAN_MS=0 lo apaga: todo vuelve a ser corte directo. */
const PAN_MS=260, PAN_POS={defensa:0, estrado:1, fiscalia:2};
function swipe(derecha, done){
  const st=$("stage"), cls=derecha?"swR":"swL";
  st.classList.remove("swR","swL","swInR","swInL"); void st.offsetWidth; st.classList.add(cls); SFX.whoosh&&SFX.whoosh();
  setTimeout(()=>{ st.classList.remove(cls); done(); st.classList.add(derecha?"swInR":"swInL");
    setTimeout(()=>st.classList.remove("swInR","swInL"), PAN_MS/2); }, PAN_MS/2);
}
/* La escena se oscurece (fin de un testimonio, silencio dramático) */
function dim(done){ const d=$("dim"); d.classList.add("on"); setTimeout(()=>{ d.classList.remove("on"); done(); }, 700); }
function play(lines, done){ let i=0; const nx=()=>{ if(i>=lines.length){ done&&done(); return; } say(lines[i++], nx); }; nx(); }
function advance(){
  if(busy) return;
  if(typing){ typeText.finish(); return; }
  if(mode==="dialog" && waiting){ const w=waiting; waiting=null; w(); }
}
function showBubble(kind, then){
  busy=true; const b=$("bubble"); b.innerHTML=bubbleSVG(kind); b.style.display="flex";
  kind==="momento"?SFX.hold():SFX.objection(); shake(); flash();
  setTimeout(()=>{ b.style.display="none"; busy=false; then(); }, 900);
}
/* letrero de lugar: fecha/hora y lugar escritos letra por letra (también al llegar a un lugar nuevo en la investigación) */
function locCard(text, done){
  const o=$("loc"), d=o.querySelector("div"); o.style.display="flex"; d.textContent="";
  $("name").textContent=""; $("text").textContent=""; mode="loc"; renderControls();
  let i=0; busy=true;
  const snd = (typeof LOCALMUS!=="undefined" && LOCALMUS.sfx_lugar) ? new Audio(LOCALMUS.sfx_lugar) : null;   // tecleo elegido por el jugador
  if(snd){ snd.muted=muted; snd.volume=.9; snd.play().catch(()=>{}); }
  const t=setInterval(()=>{ d.textContent=text.slice(0,++i); if(!snd && text[i-1]!==" "&&text[i-1]!=="\n") SFX.type();
    if(i>=text.length){ clearInterval(t); if(snd) snd.pause(); setTimeout(()=>{ busy=false; o.style.display="none"; done(); },1400); } },60);
}
function confetti(){                // confeti volando sobre la escena
  let c=$("confe"); if(!c){ c=document.createElement("div"); c.id="confe"; $("stage").appendChild(c); }
  c.innerHTML="";
  for(let i=0;i<90;i++){ const d=document.createElement("div"); d.className="conf";
    d.style.left=Math.random()*100+"%"; d.style.background=["#f2c14e","#6dff8e","#ff6b5a","#6cc6ff","#fff"][i%5];
    d.style.animationDelay=(Math.random()*1.6)+"s"; c.appendChild(d); }
  clearTimeout(confetti.t); confetti.t=setTimeout(()=>{ c.innerHTML=""; },5000);
}
function takeDamage(){
  G.health=Math.max(0,G.health-1); if(G.health<=0 && G.inv) G.health=1;   // en la investigación no se pierde el caso SFX.damage(); flash(true); shake(); drawHealth(true);
}

/* ejecutor del guion */
/* ---------- Guardado (queda en este navegador) ---------- */
let SAVEKEY="actacero_caso1_v1"; let savePc=0, toastT=null;
function toast(t){ const e=$("toast"); e.textContent=t; e.style.display="block"; clearTimeout(toastT); toastT=setTimeout(()=>e.style.display="none",1600); }
function saveGame(manual){
  try{ localStorage.setItem(SAVEKEY, JSON.stringify({pc:savePc,health:G.health,notes:G.notes,nocap:G.nocap,ev:EVIDENCE.slice(EV0).map(e=>e.id),music:curTrack,flags:G.flags,met:G.met,inv:G.inv}));
       if(manual) toast("Partida guardada"); return true; }
  catch(e){ if(manual) toast("No se pudo guardar aquí"); return false; }
}
function loadSave(){ try{ const v=JSON.parse(localStorage.getItem(SAVEKEY)||"null"); return (v&&v.pc>0&&v.pc<SCRIPT.length)?v:null; }catch(e){ return null; } }
function clearSave(){ try{ localStorage.removeItem(SAVEKEY); }catch(e){} }
function continueGame(){
  const sv=loadSave(); resetGame(); if(!sv){ run(); return; }
  G.health=Math.max(1,sv.health||MAXH); G.notes=sv.notes||{}; G.nocap=!!sv.nocap; G.flags=sv.flags||{}; G.met=sv.met||{}; G.inv=sv.inv||null;
  (sv.ev||[]).forEach(id=>{ if(EVX[id]) EVIDENCE.push(EVX[id]); });
  drawHealth(); pc=sv.pc; checkpoint=sv.pc; music(sv.music||null); run();
}
function run(){
  if(G.health<=0){ gameOver(); return; }
  savePc=pc; if(pc>0) saveGame(false);
  const st=SCRIPT[pc++]; if(!st) return;
  if(st.cmd) CMD[st.cmd](st, run); else say(st, run);
}
const CMD = {
  music(st,done){ music(st.track); done(); },
  location(st,done){
    const d=$("dim"); busy=true; d.style.transition="opacity "+(T.lugar/2)+"ms"; d.classList.add("negro");
    setTimeout(()=>{ setScene(st.pos||G.pos, null); d.classList.remove("negro"); setTimeout(()=>{ busy=false; d.style.transition=""; locCard(st.text, done); }, T.lugar/2); }, T.lugar/2);
  },
  gavel(st,done){
    const o=$("gavel"); o.style.display="flex"; busy=true;
    o.innerHTML=`<svg viewBox="0 0 400 260"><rect x="110" y="200" width="180" height="40" rx="8" fill="#6b4224"/><rect x="130" y="190" width="140" height="16" rx="6" fill="#8a5a30"/>
      <g id="hammer"><rect x="236" y="40" width="14" height="150" rx="6" fill="#8a5a30" transform="rotate(-50 240 40)"/><rect x="150" y="120" width="110" height="48" rx="10" fill="#5a3418" transform="rotate(-50 240 40)"/></g></svg>`;
    $("name").textContent=""; $("text").textContent=""; mode="loc"; renderControls();
    [0,300,600].forEach(ms=>setTimeout(SFX.knock,ms+230));
    setTimeout(()=>{ o.style.display="none"; busy=false; done(); },1300);
  },
  cross(st,done){
    checkpoint=pc-1;
    const def=CROSS[st.ref];
    X={def, list:def.statements.filter(s=>!s.hidden), idx:0, hinted:false, done, tag:"Testimonio"};
    logoCard("assets/hud/titulo-testimonio.png", def.title, ()=>{
      music(def.music||"interrogatorio");                          // el testimonio ya suena con su propia canción
      play(X.list.map(s=>({who:def.who||"testigo",mood:s.mood,pose:s.pose,text:s.text})), ()=>dim(()=>{
        X.tag="Contrainterrogatorio";
        logoCard("assets/hud/titulo-contra.png", def.title, ()=>{
          music(def.music||"interrogatorio");
          play(def.tutorial||[], showStatement);
        }, true);
      }));
    });
  },
  choice(st,done){
    checkpoint=pc-1; if(st.who==="jueza") musicaAuto("logica");          // la jueza pide deducir: suena «Lógica»
    const ask=()=>say({who:st.who,mood:st.mood,pose:st.pose,pos:st.pos,text:st.text}, ()=>{
      mode="choice"; $("next").classList.remove("on");
      X={choice:st, pick:i=>{ const o=st.options[i]; if(o.then) play(o.then,done); else if(o.ok){ if(st.pickMusic!==undefined) music(st.pickMusic); play(st.ok||[],done); } else if(o.pierde){ SFX.whoops(); play(o.w||[], perder); } else { SFX.whoops(); play(o.w||[],ask); } }};   // pierde:true = respuesta final equivocada: se pierde el juicio
      renderControls();
    });
    ask();
  },
  present(st,done){
    checkpoint=pc-1;
    say({who:st.who,mood:st.mood,pos:st.pos,text:st.text}, ()=>{
      mode="present"; renderControls();
      $("next").classList.remove("on");
      X={prompt:st, done};
      openRecord(st.tab, st.prompt);
    });
  },
  direct(st,done){
    checkpoint=pc-1;
    const def=DIRECT[st.ref];
    X={dir:def, qi:0, done, tag:"Interrogatorio"};
    logoCard("assets/hud/titulo-interrogatorio.png", def.title, ()=>{
      music(def.music||"interrogatorio");
      play(def.tutorial||[], showQuestion);
    }, true);
  },
  cine(st,done){                       // cinemática: imagen a pantalla completa + texto (sin imagen: pantalla negra)
    const show=im=>{
      if(G.pos!=="cine" && !st.sfx) SFX.flashback();          // al entrar a una cinemática: sonido de recuerdo
      G.pos="cine"; $("stage").className="pos-cine"; drawSprite(null); $("health").style.visibility="hidden";
      const c=$("bg").getContext("2d"); if(im) c.drawImage(im,0,0,256,192); else R(c,0,0,256,192,"#000");
      $("desk").getContext("2d").clearRect(0,0,256,192);
      if(st.flash) flash(); if(st.shake) shake(); if(st.sfx&&SFX[st.sfx]) SFX[st.sfx]();
      say({who:null,text:st.text||""}, done);
    };
    if(!st.img) return show(null);
    const im=new Image(); im.onload=()=>show(im); im.onerror=()=>{ if(im.src.includes("/assets/hd/")) im.src=st.img; else show(null); }; im.src=hdSrc(st.img);
  },
  negro(st,done){                                       // fundido a negro y vuelta (ej.: llamar a un testigo)
    const d=$("dim"), ms=st.ms||700; busy=true; d.style.transition="opacity "+(ms/2)+"ms"; d.classList.add("negro");
    $("name").textContent=""; $("text").textContent=""; mode="loc"; renderControls();
    setTimeout(()=>{ if(st.pos){ vistos.clear(); setScene(st.pos,null); } d.classList.remove("negro");
      setTimeout(()=>{ busy=false; d.style.transition=""; done(); }, ms/2); }, ms/2);
  },
  card(st,done){ vistos.clear(); titleCard(st.t1||"", st.t2||"", done); },     // tarjeta «Día N — Investigación»
  breakdown(st,done){
    if(!st.keepMusic) music(null); busy=true; mode="loc"; renderControls();
    const W=st.who||"testigo";
    if(st.frames){                                        // colapso dibujado cuadro a cuadro (frames, ms por cuadro, cae = cuadro donde se desploma)
      const ms=st.ms||170, sp=$("sprite"); setScene("estrado",W,st.frames[0]); $("name").textContent=""; $("text").textContent="";
      SFX.breakdown(); shake(); flash();
      st.frames.forEach((m,i)=>setTimeout(()=>{ drawSprite(W,m);
        if(i===2||i===6) { shake(); SFX.hit(); }
        if(i===4) sp.classList.add("tremble");
        if(i===(st.cae||10)){ sp.classList.remove("tremble"); SFX.thud(); shake(); flash(); }
      }, i*ms));
      setTimeout(()=>{ sp.classList.remove("tremble"); busy=false; done(); }, st.frames.length*ms+700);
      return;
    }
    setScene("estrado",W,"break");
    $("name").textContent=""; $("text").textContent="";
    const sp=$("sprite"); sp.classList.add("tremble"); SFX.breakdown();
    if(st.seq) st.seq.forEach((m,i)=>setTimeout(()=>drawSprite(W,m), Math.round(i*1250/st.seq.length)));   // colapso animado
    const cap=$("cap");
    if(W==="testigo"){ cap.innerHTML=CAP_SVG; cap.style.display="block"; cap.style.animation="none"; void cap.offsetWidth; cap.style.animation=""; G.nocap=true; }
    let n=0; const iv=setInterval(()=>{ shake(); flash(n%2); if(++n>5) clearInterval(iv); },200);
    setTimeout(()=>{ sp.classList.remove("tremble"); sp.classList.add("fall"); SFX.thud(); },1300);
    setTimeout(()=>{ cap.style.display="none"; flash(); setScene("negro",null); sp.classList.remove("fall"); },2500);
    setTimeout(()=>{ busy=false; done(); },3100);
  },
  verdict(st,done){ verdict(st.text, st.good, ()=>{ mode="dialog"; waiting=()=>{ verdict.clear(); done(); }; $("next").classList.add("on"); }); },
  end(){ clearSave(); mode="end"; renderControls(); },
  /* Zoom: primer plano de golpe sobre rayos, con la música que entra en ese instante. Sin texto ni toque: dura `ms`.
     {cmd:"zoom", who:"ines", mood, pose, music:"variacion", ms:1500} */
  zoom(st,done){
    busy=true; mode="loc"; renderControls(); $("name").textContent=""; $("text").textContent="";
    if(st.music!==undefined) music(st.music);
    setScene("rayos", st.who||"ines", st.mood||"serious", st.pose, true);
    const sg=$("stage"); sg.classList.remove("zoomIn"); void sg.offsetWidth; sg.classList.add("zoomIn");
    $("topS").classList.add("carta");
    SFX.slam&&SFX.slam(); flash(); shake();
    setTimeout(()=>{ sg.classList.remove("zoomIn"); $("topS").classList.remove("carta"); busy=false; done(); }, st.ms||1500);
  },
  /* Reacciones: se ve a cada personaje, uno tras otro, sin texto (no se salta). {cmd:"reacciones", list:[["jueza","shock"],...], ms:700} */
  reacciones(st,done){
    busy=true; mode="loc"; renderControls(); $("name").textContent=""; $("text").textContent="";
    let i=0; const sig=()=>{ if(i>=st.list.length){ busy=false; return done(); }
      const [w,m,pose]=st.list[i++]; vistos.add(w); setScene(CHARS[w].pos, w, m, pose, true); setTimeout(sig, st.ms||700); };
    sig();
  },
  /* Ordenar letras (foto a contraluz): {cmd:"ordenar", palabra:"LEONEL", extra:"RAM", molde:"{} y yo, 2002", ayuda, wrong:[líneas]}.
     Arriba se ve el reverso con lo que se va armando; abajo, las letras desordenadas. Fallar no castiga: se borra y se repite. */
  ordenar(st,done){
    const prevX=X, o=$("verPrueba"); let usadas=[];
    const bolsa=(st.palabra+(st.extra||"")).split("");                 // letras de la palabra + letras de relleno, mezcladas al azar
    let letras; do{ letras=bolsa.slice().sort(()=>Math.random()-.5); }while(letras.join("").includes(st.palabra.slice(0,3)));
    const cerrar=()=>{ o.style.display="none"; $("topS").classList.remove("carta"); X=prevX; };
    const pinta=()=>{ const pal=st.palabra.split("").map((_,i)=>usadas[i]!=null?letras[usadas[i]]:"_").join(" ");
      o.innerHTML=`<div class="reverso"><div class="rv1">${esc(st.titulo||"Al reverso, a contraluz:")}</div><div class="rv2">«${esc(st.molde.replace("{}",pal))}»</div></div>`;
      o.style.display="flex"; o.onclick=null; $("topS").classList.add("carta");
      X=Object.assign({}, prevX||{}, {orden:{letras, usadas, tap, borrar, ayuda:st.ayuda}}); mode="ordenar"; renderControls(); };
    const borrar=()=>{ if(busy) return; usadas=[]; pinta(); };
    const tap=i=>{ if(busy||usadas.includes(i)) return; usadas.push(i); SFX.blip&&SFX.blip(900); pinta();
      if(usadas.length<st.palabra.length) return;
      busy=true; setTimeout(()=>{ busy=false; const w=usadas.map(k=>letras[k]).join("");
        if(w===st.palabra){ cerrar(); SFX.realize&&SFX.realize(); done(); }
        else { SFX.whoops(); usadas=[]; cerrar(); play(st.wrong||[{who:"ines",mood:"think",text:"(No... así no dice nada. Otra vez.)"}], pinta); }
      }, 500); };
    pinta();
  },
  /* Señalar en una imagen: la foto ocupa la pantalla de arriba y hay que tocar el punto exacto (area:[x,y,ancho,alto] en 256×192).
     Fallar quita vida (wrong) y se repite. `zonas:[{area,wrong}]` = respuesta propia según dónde tocó (sin `damage`, no castiga). Sirve dentro de las líneas de una contradicción: {cmd:"senalar", img, area, ayuda, wrong} */
  senalar(st,done){
    const prevX=X, o=$("verPrueba");
    const abrir=()=>{ o.innerHTML=`<img src="${hdSrc(st.img)}">`; o.style.display="flex"; o.onclick=null;
      $("topS").classList.add("carta"); X=Object.assign({}, prevX||{}, {senal:st}); mode="senalar"; renderControls(); };
    X={senal:st, prevX}; abrir();
    senalar.tap=(x,y)=>{ const [ax,ay,aw,ah]=st.area, ok=x>=ax&&x<ax+aw&&y>=ay&&y<ay+ah;
      const m=$("mira"); m.style.left=(x/256*100)+"%"; m.style.top=(y/192*100)+"%"; m.style.display="block"; busy=true;
      setTimeout(()=>{ m.style.display="none"; busy=false; o.style.display="none"; $("topS").classList.remove("carta"); X=prevX;
        if(ok){ SFX.realize&&SFX.realize(); senalar.tap=null; done(); }
        else { const z=(st.zonas||[]).find(z=>{ const [zx,zy,zw,zh]=z.area; return x>=zx&&x<zx+zw&&y>=zy&&y<zy+zh; });   // zona con respuesta propia
          SFX.whoops(); play((z&&z.wrong)||st.wrong||[{who:"jueza",mood:"disappoint",damage:true,text:"¿Ahí? No veo nada que contradiga al testigo, abogado."}],
                 ()=>{ if(G.health<=0) return gameOver(); abrir(); }); }
      }, 420);
    };
  },
};

function titleCard(t1,t2,done){
  busy=true; const o=$("tcard"); o.innerHTML=`<div class="band"><div class="t1">${t1}</div><div class="t2">${t2}</div></div>`;
  o.style.display="flex"; SFX.whoosh(); mode="loc"; renderControls();
  setTimeout(()=>{ o.style.display="none"; busy=false; done(); },T.dia);
}
/* Letrero dibujado («Testimonio del Testigo», «Contrainterrogatorio», «Interrogatorio») en la pantalla de arriba, como en la DS:
   entra partido en dos mitades (una por cada lado), le pasa un brillo, abajo se escribe el nombre en una franja oscura,
   y sale separándose en diagonal. Con vs=true, las caras de Justo y Penna se enfrentan en la pantalla de abajo.
   No se puede saltar: la música se calla, suena «testimonio» y todo dura lo mismo que ese sonido. */
const LOGO_MS=3050, LOGO_SALE=2600;
function logoCard(img,t2,done,vs){
  busy=true; const o=$("tcard"), lineas=/interrogatorio\.png$/.test(img)&&!/contra/.test(img)?"uno":"dos";
  o.className="ov logo";
  o.innerHTML=`<div class="lg ${lineas}"><img class="h1" src="${img}" alt=""><img class="h2" src="${img}" alt=""><div class="brillo" style="-webkit-mask-image:url(${img});mask-image:url(${img})"></div></div>`+
    (t2?`<div class="sub"><span></span></div>`:"");
  o.style.display="block"; $("topS").classList.add("carta"); mode="loc"; renderControls();
  music(null); SFX.testimony();                                   // silencio: solo el sonido del letrero
  const sp=o.querySelector(".sub span"), txt=t2?"– "+t2+" –":""; let k=0;
  const tip=setInterval(()=>{ if(!sp||k>=txt.length){ clearInterval(tip); return; } sp.textContent=txt.slice(0,++k); }, 40);
  let v=null;
  if(vs){
    v=$("vsS"); if(!v){ v=document.createElement("div"); v.id="vsS"; $("botS").appendChild(v); }
    v.className="";
    v.innerHTML=`<div class="vsb a"><img src="assets/hud/vs_justo.png" alt=""></div><div class="vsm"></div><div class="vsb b"><img src="assets/hud/vs_penna.png" alt=""></div>`;
    v.style.display="block";
  }
  setTimeout(()=>{ o.classList.add("sale"); if(v) v.classList.add("fin"); }, LOGO_SALE);
  setTimeout(()=>{ clearInterval(tip); o.style.display="none"; o.className="ov"; o.innerHTML=""; if(v){ v.style.display="none"; v.className=""; }
    $("topS").classList.remove("carta"); busy=false; done(); }, LOGO_MS);
}
function verdict(text, good, done){
  const o=$("verdict"); o.className="ov "+(good?"good":"bad"); o.innerHTML=""; o.style.display="flex"; busy=true; mode="loc"; renderControls();
  $("name").textContent=""; $("text").textContent="";
  const words=text.split(" "); let k=0;
  words.forEach((w,wi)=>{ const wrap=document.createElement("div"); wrap.style.display="flex"; wrap.style.margin="0 14px";
    [...w].forEach(ch=>{ const s=document.createElement("span"); s.textContent=ch; s.style.animationDelay=(k*.13)+"s"; wrap.appendChild(s); setTimeout(SFX.thud,k*130+120); k++; });
    o.appendChild(wrap); });
  setTimeout(()=>{
    if(good){ SFX.knock(); setTimeout(SFX.knock,250); for(let i=0;i<70;i++){ const c=document.createElement("div"); c.className="conf";
      c.style.left=Math.random()*100+"%"; c.style.background=["#f2c14e","#6dff8e","#ff6b5a","#6cc6ff","#fff"][i%5]; c.style.animationDelay=Math.random()*.8+"s"; o.appendChild(c);} }
    busy=false; done && done();
  }, k*130+500);
  const clear=()=>{ o.style.display="none"; };
  verdict.clear=clear;
}

/* contrainterrogatorio */
function showStatement(){
  mode="cross";
  const s=X.list[X.idx];
  const W=X.def.who||"testigo";
  setScene("estrado",W, s.mood||"normal", s.pose);
  $("name").textContent=CHARS[W].name;
  renderControls();
  canTalk=true; blipWho=W; typeText(s.text,"cross",CHARS[W].voice);
}
/* interrogatorio directo: la fiscalía pregunta, la defensa puede objetar */
function showQuestion(){
  const q=X.dir.questions[X.qi];
  if(!q){ const done=X.done; const end=X.dir.end||[]; X=null; play(end, done); return; }
  mode="direct";
  const W=q.who||"fiscal";
  setScene(CHARS[W].pos, W, q.mood||"normal", q.pose);
  $("name").textContent=CHARS[W].name;
  renderControls();
  canTalk=true; blipWho=W;
  typeText(q.text,"",CHARS[W].voice, ()=>{          // coach = consejo que aparece una sola vez (tutorial)
    X.coached=X.coached||{};
    if(q.coach && !X.coached[X.qi]){ X.coached[X.qi]=1; busy=true; setTimeout(()=>{ busy=false; play(q.coach, showQuestion); }, 400); }
  });
}
function nextQuestion(){ X.qi++; showQuestion(); }
function letPass(){
  if(busy) return;
  if(typing){ typeText.finish(); return; }
  const q=X.dir.questions[X.qi];
  if(q.bad) play((q.a||[]).concat(q.miss||[]), showQuestion);     // pregunta tramposa: pista y se repite
  else play(q.a||[], nextQuestion);
}
function objectQuestion(){
  if(busy) return;
  if(typing) typeText.finish();
  const q=X.dir.questions[X.qi];
  play([{who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡Objeción, Su Señoría!"},
        {who:"jueza",mood:"think",text:"¿Con qué fundamento, abogado?"}], ()=>{
    mode="reason"; $("next").classList.remove("on");
    X.pick=i=>{
      const r=OBJ_REASONS[i].id; X.pick=null;
      if(q.bad && r===q.bad) play(q.ok||[], nextQuestion);
      else if(q.bad) SFX.whoops(), play(DIRECT_LINES.wrongReason, ()=>{ if(G.health<=0) return gameOver(); showQuestion(); });
      else SFX.whoops(), play(DIRECT_LINES.noReason.concat(q.noObj||[]), ()=>{ if(G.health<=0) return gameOver(); play(q.a||[], nextQuestion); });
    };
    renderControls();
  });
}
function move(d){
  if(busy) return;
  if(d>0 && X.idx===X.list.length-1){
    X.idx=0; X.loops=(X.loops||0)+1;
    if(!X.hinted && X.def.loopHint && X.loops>=(X.def.hintLoops||1)){ X.hinted=true;
      const h=X.def.loopHint.filter(l=>!(l.ifHidden && X.list.find(x=>x.id===l.ifHidden)));   // ifHidden: solo si esa declaración sigue oculta
      if(h.length){ play(h, showStatement); return; } }
  } else X.idx=(X.idx+d+X.list.length)%X.list.length;
  showStatement();
}
function press(){
  if(busy) return;
  const s=X.list[X.idx];
  if(X.def.pressOnce){                                   // testimonio donde repetir una pregunta cuesta credibilidad
    X.presionadas=X.presionadas||new Set();
    if(X.presionadas.has(s.id)){ SFX.whoops(); return play(X.def.pressOnceLines||[
      {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Protesto! La defensa repite una pregunta que ya fue respondida."},
      {who:"jueza",mood:"disappoint",damage:true,text:"Ha lugar. Abogado, se lo advertí: lo anoto en su contra."}],
      ()=>{ if(G.health<=0) return gameOver(); showStatement(); }); }
    X.presionadas.add(s.id);
  }
  let lines=s.press.map((l,i)=>i===0?Object.assign({bubble:"momento"},l):l);
  if(s.ends){ const done=X.done; X=null; play(lines, done); return; }
  const pool=(typeof FISCAL_PRESS!=="undefined" && FISCAL_PRESS) || null;
  const extra = s.fiscal || (pool && pool.length ? pool[(G.fp=(G.fp||0)+1) % pool.length] : null);
  if(extra && X.def.fiscal!==false) lines=lines.concat(extra);
  play(lines, ()=>{
    if(G.health<=0) return gameOver();                    // una presión castigada puede dejar sin credibilidad
    if(s.adds && !X.list.find(x=>x.id===s.adds)){
      const ns=X.def.statements.find(x=>x.id===s.adds);
      X.list.splice(X.idx+1,0,ns); X.idx++;
      SFX.ding();
      play([{who:null,text:"Se agregó una nueva declaración al testimonio."}], showStatement);
    } else showStatement();
  });
}
/* Mientras suena una de estas, Objection! y Logic and Trick no la interrumpen (pauta del dueño: «si suena Cornered, no hay que detenerla») */
const MUSICA_TENSA=["persecucion","verdad","variacion"];
function musicaAuto(t){ if(!MUSICA_TENSA.includes(curTrack)) music(t); }
/* Objeción acertada (pauta del dueño): ¡Objeción! → Justo habla un poco → recién en la segunda frase entra la música.
   Si la primera frase ya trae su propia música (o silencio), se respeta y no se agrega nada. */
function conMusica(lines, track){
  if(!lines || !lines.length) return lines;
  if(lines[0].music!==undefined || lines[0].cmd) return lines;
  if(curTrack===track) return lines;                            // ya suena: no se reinicia
  if(!MUSICA_TENSA.includes(curTrack)) music(null, true);      // ¡Objeción!: la música se corta en seco; la primera frase va en silencio
  if(lines.length<2){ musicaAuto(track); return lines; }
  const out=lines.slice(); out[1]=Object.assign({}, out[1], {autoMusic:track}); return out;
}
function presentItem(id){
  closeRecord(); setTimeout(()=>showEvBox(id,5), 950);          // primero el «¡Objeción!», después la prueba en el recuadro
  if(typeof invPresent==="function" && invPresent(id)) return;     // investigación (js/investigacion.js)
  if(mode==="present"){
    const p=X.prompt;
    if([].concat(p.answer).includes(id)){ const d=X.done; if(p.music!==undefined){ music(p.music, true); play(p.ok, d); } else play(p.soft ? p.ok : conMusica(p.ok,"objecion"), d); }
    else if(p.soft) play(p.wrong||[], ()=>{ pc=checkpoint; run(); });     // sin castigo (fuera del juicio)
    else if(p.wrong) SFX.whoops(), play(p.wrong, ()=>{ if(G.health<=0) return gameOver(); pc=checkpoint; run(); });   // error propio (con damage)
    else SFX.whoops(), play([{who:"ines",bubble:"mire",pose:"point",anim:"slam",text:"¡Mire esto, Su Señoría!"},
               {who:"jueza",mood:"serious",text:"...¿Y eso qué tiene que ver, abogado?"},
               {who:"fiscal",mood:"smug",pose:"cafe",text:"Hmph. Novato. *sorbo*"},
               {who:"jueza",mood:"disappoint",damage:true,text:"Se lo descontaré a la defensa."},
   {who:"ines",mood:"hit",anim:"hit",text:"(¡Aaagh! ¡Me equivoqué!)"}],
              ()=>{ if(G.health<=0) return gameOver(); pc=checkpoint; run(); });
    return;
  }
  const s=X.list[X.idx];
  if(s.contra && [].concat(s.contra).includes(id) && s.requiere && !(X.resueltas&&X.resueltas.has(s.requiere)))
    return play(s.antes||[{who:"ines",mood:"think",text:"(Todavía no. Primero tengo que desmontar otra parte de su declaración.)"}], showStatement);   // correcta, pero falta otra antes: sin castigo
  if(s.contra && [].concat(s.contra).includes(id) && s.sigue){   // contradicción que NO cierra el testimonio: sigue con declaraciones nuevas
    X.resueltas=X.resueltas||new Set();
    if(X.resueltas.has(s.id)) return play([{who:"ines",mood:"think",text:"(Eso ya quedó demostrado. Hay que seguir.)"}], showStatement);
    X.resueltas.add(s.id); const cx=X;
    return play(conMusica(s.contraLines,"objecion"), ()=>{ X=cx;
      const nuevas=(s.revela||[]).map(n=>cx.def.statements.find(z=>z.id===n)).filter(z=>z && !cx.list.includes(z));
      nuevas.forEach(z=>cx.list.push(z));
      if(nuevas.length){ cx.idx=cx.list.indexOf(nuevas[0]); SFX.ding(); play([{who:null,text:"El testimonio continúa.",music:cx.def.music||"interrogatorio"}], showStatement); }   // vuelve la canción del testimonio
      else showStatement(); });
  }
  if(s.contra && [].concat(s.contra).includes(id)){ const done=X.done; X=null; play(conMusica(s.contraLines,"objecion"), done); }   // contradicción acertada: suena «Objeción»
  else if(s.early && [].concat(s.early.ids).includes(id)) play(s.early.lines, showStatement);   // correcta, pero antes de tiempo: sin castigo
  else if(X.def.firstWrong && !G.tutErr){ G.tutErr=1; SFX.whoops(); play(X.def.firstWrong, showStatement); }   // tutorial: el primer error no cuesta
  else SFX.whoops(), play(WRONG[Math.floor(Math.random()*WRONG.length)], ()=>{ if(G.health<=0) return gameOver(); showStatement(); });
}
/* Perder de una vez (última oportunidad equivocada): veredicto de culpable sin las líneas genéricas. «Reintentar» vuelve a la pregunta. */
function perder(){ music(null); verdict("CULPABLE", false, ()=>{ mode="gameover"; renderControls(); }); }
function gameOver(){
  music(null);
  play([{who:"jueza",mood:"serious",text:"La defensa ha perdido toda credibilidad ante este tribunal."},
        {who:"jueza",mood:"serious",text:"Se declara al acusado..."}], ()=>{
    verdict("CULPABLE", false, ()=>{
      mode="gameover"; renderControls();
    });
  });
}

/* expediente */
let recTab="pruebas";
/* EXPEDIENTE (pantalla de abajo, al estilo DS): grilla de 4×2 con el nombre de la elegida arriba; al tocarla de nuevo
   se abre su ficha (dibujo, nombre, tipo y origen, y abajo los datos), con flechas para pasar de una a otra.
   La ficha da datos, no conclusiones: la «lectura» solo aparece cuando el juicio ya la cambió (G.notes). */
let REC={};
function recItems(){ return recTab==="pruebas" ? EVIDENCE : PROFILES.filter(p=>!p.hidden||G.met[p.id]); }
function recPic(it){ return EVIMG[it.id]?`<img src="${EVIMG[it.id]}">`:(it.icon?`<span class="emo">${it.icon}</span>`:miniFace(it.who)); }
function openRecord(tab, prompt){
  if(busy) return;
  recTab=tab||recTab; REC={prompt, sel:0, view:"grid", anim:""};
  renderRecord(); $("modal").style.display="flex";
}
function renderRecord(){
  const items=recItems(), n=items.length, per=8;
  const canPresent = ["cross","present","invpresent","silpresent"].includes(mode);
  REC.sel=Math.max(0,Math.min(REC.sel,n-1)); const it=items[REC.sel]; const page=Math.floor(REC.sel/per), pages=Math.max(1,Math.ceil(n/per));
  const head=`<div id="rhead"><div class="tabs"><button data-t="pruebas" class="${recTab==="pruebas"?"on":""}">Pruebas</button><button data-t="perfiles" class="${recTab==="perfiles"?"on":""}">Perfiles</button></div>${canPresent&&it?`<button class="obj" id="mact">¡Presentar!</button>`:""}</div>`
    +(REC.prompt?`<div id="mprompt">${REC.prompt}</div>`:"");
  let body="";
  if(!it) body=`<div id="rname">(vacío)</div>`;
  else if(REC.view==="grid"){
    const cells=[]; for(let i=page*per;i<page*per+per;i++){ const x=items[i]; cells.push(x?`<div class="rcell${i===REC.sel?" sel":""}" data-i="${i}">${recPic(x)}</div>`:`<div class="rcell vacia"></div>`); }
    body=`<div id="rname">${esc(it.name)}</div><div id="rgrid"><button class="rarrow" data-d="-1" ${pages>1?"":"disabled"}>◀</button><div class="rcells">${cells.join("")}</div><button class="rarrow" data-d="1" ${pages>1?"":"disabled"}>▶</button></div>
      <div id="rhint">Toca otra vez para ver la ficha${pages>1?` · página ${page+1}/${pages}`:""}</div>`;
  } else {
    const tipo=it.tipo||(recTab==="perfiles"?"Perfil":""), origen=it.origen||"";
    const nota=G.notes[it.id];
    body=`<div id="rdet" class="${REC.anim}"><button class="rarrow" data-d="-1" ${n>1?"":"disabled"}>◀</button>
        <div class="rcard"><div class="ric">${recPic(it)}</div><div class="rinfo"><div class="rnm">${esc(it.name)}</div>${tipo||origen?`<div class="rtipo">${tipo?"Tipo: "+esc(tipo):""}${tipo&&origen?"<br>":""}${origen?"Origen: "+esc(origen):""}</div>`:""}</div></div>
        <button class="rarrow" data-d="1" ${n>1?"":"disabled"}>▶</button></div>
      <div id="rdesc">${esc(G.notes["desc:"+it.id]||it.desc||"")}${nota?`<div class="rnota">▸ ${esc(nota)}</div>`:""}${it.ver?`<button id="mver">🔍 Ver en grande</button>`:""}</div>`;
  }
  const volver = REC.view==="det" ? `<button id="mback">◂ Volver</button>`
    : mode==="present" ? "" : mode==="silpresent" ? `<button id="mquit">Retirarse</button>` : `<button id="mclose">Volver</button>`;
  $("mbox").innerHTML=head+body+`<div class="row">${volver}</div>`;
  REC.anim="";
  $("mbox").querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{ recTab=b.dataset.t; REC.sel=0; REC.view="grid"; renderRecord(); });
  $("mbox").querySelectorAll(".rcell[data-i]").forEach(c=>c.onclick=()=>{ const i=+c.dataset.i; SFX.blip&&SFX.blip(900);
    if(i===REC.sel) REC.view="det"; else REC.sel=i; renderRecord(); });
  $("mbox").querySelectorAll(".rarrow").forEach(bt=>bt.onclick=()=>{ const d=+bt.dataset.d;
    if(REC.view==="grid"){ REC.sel=((Math.floor(REC.sel/per)+d+pages)%pages)*per; }
    else { REC.sel=(REC.sel+d+n)%n; REC.anim=d>0?"desdeDer":"desdeIzq"; }
    renderRecord(); });
  const v=$("mver"); if(v) v.onclick=()=>verPrueba(it.ver);
  const bk=$("mback"); if(bk) bk.onclick=()=>{ REC.view="grid"; renderRecord(); };
  const c=$("mclose"); if(c) c.onclick=()=>{ closeRecord(); if(mode==="invpresent") invMenu(); };
  const q=$("mquit"); if(q) q.onclick=()=>{ closeRecord(); play([{who:"ines",mood:"sweat",text:"(Mejor vuelvo cuando tenga cómo hacerlo hablar.)"}], invMenu); };
  const a=$("mact"); if(a) a.onclick=()=>{ if(it) presentItem(it.id); };
}
/* ver una prueba en grande en la pantalla de arriba (tocar para cerrar) */
function senalar(){}
$("stage").addEventListener("click", ev=>{
  if(mode!=="senalar" || busy || !senalar.tap) return;
  const r=$("stage").getBoundingClientRect(); senalar.tap((ev.clientX-r.left)/r.width*256, (ev.clientY-r.top)/r.height*192);
});
function verPrueba(src){ src=hdSrc(src);
  const o=$("verPrueba"); o.innerHTML=`<img src="${src}"><div>Toca para cerrar</div>`; o.style.display="flex"; SFX.ding();
  o.onclick=()=>{ o.style.display="none"; };
}
function miniFace(who){ if(ART[who]) return `<img src="${ART[who].face}" style="height:9cqw;image-rendering:pixelated">`; return sprite(who,"normal",null,0,0).replace('viewBox="0 0 256 192"','viewBox="96 2 64 72" shape-rendering="crispEdges"'); }
function closeRecord(){ $("modal").style.display="none"; }

/* botones */
function renderControls(){
  const c=$("controls"); c.innerHTML="";
  $("box").style.visibility = mode==="invexam" ? "hidden" : "";          // examinando: se ve el lugar completo
  $("topS").classList.toggle("examinando", mode==="invexam");
  const add=(t,cls,fn,parent)=>{ const b=document.createElement("button"); b.innerHTML=t; if(cls) b.className=cls; b.onclick=fn; (parent||c).appendChild(b); return b; };
  const row=cls=>{ const d=document.createElement("div"); d.className=cls; c.appendChild(d); return d; };
  $("hudlabel").textContent = G.inv ? "Investigación" : (X&&X.tag) ? X.tag : (["defensa","fiscalia","estrado","juez","rayos"].includes(G.pos) ? "Juicio" : "");
  $("botS").classList.toggle("enInv", !!G.inv); $("hudlabel").classList.toggle("largo", $("hudlabel").textContent.length>14);
  if(mode==="dialog"){
    add('<span class="dlgimg"></span>',"adv",()=>$("box").onclick());
  } else if(mode==="cross"){
    const a=row("rowA"); add("Presionar","hold",press,a); add("Presentar","hudimg k3",()=>openRecord("pruebas"),a);
    const b=row("rowB"); add("◀","nav",()=>move(-1),b);
    const dots=document.createElement("div"); dots.id="dots";
    X.list.forEach((_,i)=>{ const d=document.createElement("div"); d.className="dot"+(i===X.idx?" cur":""); dots.appendChild(d); }); b.appendChild(dots);
    add("▶","nav",()=>move(1),b);
  } else if(mode==="direct"){
    const a=row("rowA"); add("Dejar pasar ▶","hold",letPass,a); add("¡Protestar!","obj",objectQuestion,a);
  } else if(mode==="reason"){
    OBJ_REASONS.forEach((o,i)=>add(o.t,"opt",()=>X.pick&&X.pick(i)));
  } else if(mode==="choice"){
    X.choice.options.forEach((o,i)=>add(o.t,"opt",()=>X.pick(i)));
  } else if(mode==="present"){
    add("📁 Abrir expediente<br>para presentar","obj wide",()=>openRecord(X.prompt.tab, X.prompt.prompt));
  } else if(typeof invControls==="function" && invControls(mode,add,row)){
  } else if(mode==="gameover"){
    add("↺ Reintentar desde el último testimonio","gold",()=>{ verdict.clear&&verdict.clear(); G.health=MAXH; G.nocap=false; drawHealth(); pc=checkpoint; run(); });
  } else if(mode==="ordenar"){
    const O=X.orden, d=document.createElement("div"); d.className="senalaAyuda"; d.textContent=O.ayuda||"Toca las letras en orden para leer el nombre."; c.appendChild(d);
    const a=row("rowL"); O.letras.forEach((ch,i)=>{ const b=add(ch,"letra",()=>O.tap(i),a); if(O.usadas.includes(i)) b.disabled=true; });
    add("↺ Borrar","hold",O.borrar);
  } else if(mode==="senalar"){
    const d=document.createElement("div"); d.className="senalaAyuda"; d.textContent=(X&&X.senal&&X.senal.ayuda)||"Toca en la foto (pantalla de arriba) el punto que contradice al testigo."; c.appendChild(d);
  } else if(mode==="end"){
    add("↺ Jugar de nuevo","gold",()=>{ verdict.clear&&verdict.clear(); resetGame(); run(); });
  }
}

/* ---------- gráficos estilo DS: todo se dibuja a 256x192 ---------- */
function R(c,x,y,w,h,col){ c.fillStyle=col; c.fillRect(x,y,w,h); }
function dith(c,x0,y0,w,h,col){ c.fillStyle=col; for(let y=y0;y<y0+h;y++) for(let x=x0+((y+x0)&1);x<x0+w;x+=2) c.fillRect(x,y,1,1); }
function disc(c,cx,cy,r,col){ c.fillStyle=col; for(let y=-r;y<=r;y++){ const w=Math.floor(Math.sqrt(r*r-y*y)); c.fillRect(cx-w,cy+y,w*2+1,1); } }
function wood(c,base,dark,light){
  R(c,0,0,256,192,base);
  for(let x=0;x<256;x+=32){ R(c,x,0,2,192,dark); R(c,x+2,0,1,192,light); R(c,x+7,16,20,84,dark); R(c,x+8,17,18,82,base); R(c,x+8,99,19,1,light); }
  R(c,0,0,256,9,dark); R(c,0,9,256,2,light);
  dith(c,0,104,256,88,dark);
}
function emblem(c,x,y){ disc(c,x,y,17,"#f8d048"); disc(c,x,y,14,"#b88818");
  R(c,x-1,y-10,2,20,"#f8e8a0"); R(c,x-10,y-7,20,2,"#f8e8a0"); R(c,x-10,y-5,1,6,"#f8e8a0"); R(c,x+9,y-5,1,6,"#f8e8a0");
  R(c,x-13,y+1,7,2,"#f8e8a0"); R(c,x+6,y+1,7,2,"#f8e8a0"); R(c,x-5,y+9,10,2,"#f8e8a0"); }


const SCN={};
function scnImg(kind,pos){ const src=(kind==="bg"?BGIMG:DESKIMG)[pos]; if(!src) return null; const k=kind+pos;
  if(!SCN[k]){ const im=respaldoHD(new Image()); SCN[k]=im; im.onload=()=>{ if(G.pos===pos) drawBG(pos); }; im.src=src; } return SCN[k]; }
/* Fondo de rayos azules: primer plano dramático (pos:"rayos" en una línea). Se mueve mientras está en pantalla. */
function rayos(c,t){
  const g=c.createRadialGradient(128,96,8,128,96,170); g.addColorStop(0,"#f8f8ff"); g.addColorStop(.25,"#88c8f8"); g.addColorStop(1,"#183878");
  c.fillStyle=g; c.fillRect(0,0,256,192);
  c.fillStyle="rgba(255,255,255,.55)";
  for(let k=0;k<36;k++){ const a=(k/36)*Math.PI*2+t*.05+((k*7)%5)*.02, w=.018+(k%3)*.01;
    c.beginPath(); c.moveTo(128+Math.cos(a)*30,96+Math.sin(a)*30);
    c.lineTo(128+Math.cos(a-w)*220,96+Math.sin(a-w)*220); c.lineTo(128+Math.cos(a+w)*220,96+Math.sin(a+w)*220); c.fill(); }
}
setInterval(()=>{ if(G.pos==="rayos"){ rayos.t=(rayos.t||0)+1; rayos($("bg").getContext("2d"),rayos.t); } },90);
function drawBG(pos){
  const c=$("bg").getContext("2d"), d=$("desk").getContext("2d");
  c.clearRect(0,0,256,192); d.clearRect(0,0,256,192);
  if(pos==="rayos"){ rayos(c,0); return; }
  if(pos==="defensa"||pos==="fiscalia"){
    const df=pos==="defensa";
    wood(c, df?"#a86838":"#986048", df?"#784820":"#684030", df?"#d09058":"#c08868");
    R(d,0,112,256,2,"#f8d8a0"); R(d,0,114,256,7,"#d09050"); R(d,0,121,256,71,"#885020");
    for(let x=8;x<256;x+=62){ R(d,x,128,50,64,"#603008"); R(d,x+2,130,46,62,"#784418"); }
    R(d,0,121,256,2,"#603008");
  } else if(pos==="estrado"){
    R(c,0,0,256,192,"#c89860"); dith(c,0,0,256,26,"#d8b078");
    for(let x=0;x<256;x+=16) R(c,x,0,1,58,"#b08048");
    R(c,0,65,256,127,"#583418");
    for(let x=4;x<256;x+=12){ R(c,x,65,5,127,"#885428"); R(c,x+1,65,1,127,"#b87840"); }
    R(c,0,58,256,5,"#784820"); R(c,0,63,256,2,"#f0c088");
    R(d,36,110,184,3,"#f8d8a0"); R(d,36,113,184,8,"#d09050"); R(d,40,121,176,71,"#885020");
    for(let x=48;x<206;x+=14){ R(d,x,127,7,65,"#603008"); R(d,x+1,127,1,65,"#a06830"); }
    R(d,40,121,176,2,"#603008");
  } else if(pos==="juez"){
    R(c,0,0,256,192,"#701818");
    for(let x=0;x<256;x+=16){ R(c,x,0,3,192,"#501010"); R(c,x+3,0,1,192,"#903030"); }
    R(c,0,0,256,6,"#f8d048"); R(c,0,6,256,2,"#b88818");
    emblem(c,44,50); emblem(c,212,50);
    R(d,0,104,256,3,"#c08850"); R(d,0,107,256,85,"#503010");
    R(d,80,96,96,3,"#e0a860"); R(d,80,99,96,93,"#603818"); R(d,88,110,80,82,"#482408"); R(d,90,112,76,80,"#583010");
  } else if(pos==="lobby"){
    R(c,0,0,256,192,"#90a0c0"); R(c,0,108,256,4,"#f0f0f8"); R(c,0,112,256,80,"#586890"); dith(c,0,112,256,80,"#485878");
    R(c,16,16,80,74,"#283048"); R(c,20,20,72,66,"#88d0f8"); R(c,20,56,72,30,"#b8e8f8");
    R(c,28,30,22,6,"#fff"); R(c,34,26,12,4,"#fff"); R(c,64,40,18,5,"#fff");
    R(c,20,70,72,16,"#58a060"); dith(c,20,70,72,6,"#78b878");
    R(c,26,64,9,10,"#f06060"); R(c,38,67,8,8,"#f8d048"); R(c,60,62,10,12,"#6080f0"); R(c,74,68,8,8,"#f8a0c0"); R(c,48,72,8,7,"#f0f0f8");
    R(c,55,20,2,66,"#283048"); R(c,20,52,72,2,"#283048");
    R(c,132,28,58,84,"#583818"); R(c,136,32,50,80,"#805830"); R(c,140,36,42,30,"#906838"); R(c,140,72,42,36,"#906838"); R(c,178,70,4,5,"#f8d048");
    R(c,150,20,22,7,"#f0f0f8");
    R(c,208,98,22,24,"#a05028"); R(c,206,96,26,4,"#c06838");
    disc(c,219,70,13,"#38a048"); disc(c,208,82,9,"#2c8038"); disc(c,230,84,9,"#2c8038"); disc(c,219,84,8,"#48b858");
  } else {
    R(c,0,0,256,192, pos==="negro"||pos==="cine" ? "#000" : "#1c2438");
    if(BGLABELS && BGLABELS[pos]){                   // lugar sin fondo todavía: cartel provisorio
      c.fillStyle="#5a6c94"; c.textAlign="center"; c.font="bold 11px monospace"; c.fillText(BGLABELS[pos],128,52);
      c.font="7px monospace"; c.fillText("(fondo provisorio)",128,64); c.textAlign="left";
    }
  }
  const bi=scnImg("bg",pos), di=scnImg("desk",pos);
  if(bi&&bi.complete&&bi.naturalWidth) c.drawImage(bi,0,0,256,192);
  if(di&&di.complete&&di.naturalWidth){ d.clearRect(0,0,256,192); d.drawImage(di,0,0,256,192); }
}
[...new Set([...Object.keys(BGIMG),...Object.keys(DESKIMG)])].forEach(p=>{ scnImg("bg",p); scnImg("desk",p); });
/* Ilustraciones de personajes (prueba): si existe ART[personaje], reemplaza al dibujo por código */

/* Qué celda de la hoja usa cada emoción: [callado, hablando, parpadeo] */
const AMAP={
  ines:{normal:["base","talk"],smug:["smug","smugTalk"],smile:["relieved","relievedTalk"],relieved:["relieved","relievedTalk"],sweat:["sweat","sweatTalk"],shock:["shock","shockTalk"],hit:["hit","hitTalk"],think:["cruzado","cruzadoTalk"],think2:["think","thinkTalk"],confused:["confused","confusedTalk"],serious:["serious","seriousTalk"],angry:["angry2","angry2Talk"],down:["sad","sadTalk"],sad:["sad","sadTalk"],"pose:point":["point","pointTalk"],"pose:papel":["papel","papelTalk"],"pose:papelThink":["papelThink","papelThinkTalk"],"pose:slam":["slam","slamTalk"],"pose:cruzado":["cruzado","cruzadoTalk"]},
  fiscal:{normal:["base","talk"],serious:["base","talk"],smug:["smug","smugTalk"],smile:["smile","smileTalk"],proud:["proud","proudTalk"],laugh:["proud","proudTalk"],disdain:["cross","crossTalk"],think:["think","thinkTalk"],down:["respect","respectTalk"],respect:["respect","respectTalk"],shock:["shock","shockTalk"],sweat:["sweat","sweatTalk"],angry:["angry","angryTalk"],facepalm:["facepalm","facepalmTalk"],"pose:point":["point","pointTalk"],"pose:cafe":["cafe","cafeTalk"],"pose:gesto":["stop","stopTalk"],"pose:cruzado":["cross","crossTalk"],"pose:alto":["stop","stopTalk"],"pose:puno":["cross","crossTalk"],"pose:bigote":["twirl","twirlTalk"],"pose:tirar":["pull","pullTalk"],"pose:pelo":["hair","hairTalk"],"pose:cuff":["cross","crossTalk"]},
  testigo:{normal:["base","talk","blink"],"pose:llaves":["k6","k5"],smile:["proud","proudTalk"],smug:["smug","smugTalk"],sweat:["sweat","sweatTalk"],shock:["shock","shockTalk"],angry:["angry","angryTalk"],break:["break","breakTalk"],cry:["b14","b13"],down:["sweat","sweatTalk"]},
  jueza:{normal:["base","talk"],serious:["serious","seriousTalk"],shock:["shock","shockTalk"],think:["think","thinkTalk"],smile:["smile","smileTalk"],confused:["confused","confusedTalk"],disappoint:["disappoint","disappointTalk"],gavel:["gavel","gavelTalk"]},
  tomas:{normal:["base","talk"],sweat:["sweat","sweatTalk"],cry:["cry","cryTalk"],beg:["beg","begTalk"],shock:["shock","shockTalk"],down:["down","downTalk"],angry:["indignant","indignantTalk"],smile:["happy","happyTalk"]},
  tadeo:{normal:["base","talk"],sweat:["sweat","sweatTalk"],shock:["shock","shockTalk"],down:["down","downTalk"],cry:["cry","cryTalk"],angry:["angry","angryTalk"],smile:["smile","smileTalk"],think:["think","thinkTalk"]},
  malva:{normal:["base","talk"],smile:["tea","teaTalk"],sweat:["sweat","sweatTalk"],down:["down","downTalk"],shock:["shock","shockTalk"],angry:["angry","angryTalk"],smug:["smug","smugTalk"],break:["break","breakTalk"],
         worried:["q_c1","q_c1"],panic:["q_c2","q_c2"],c1:["q_c1","q_c1"],c2:["q_c2","q_c2"],c3:["q_c3","q_c3"],c4:["q_c4","q_c4"],c5:["q_c5","q_c5"],c6:["q_c6","q_c6"],c7:["q_c7","q_c7"],c8:["q_c8","q_c8"]},
  rocky:{normal:["base","talk"],angry:["angry","angryTalk"],sweat:["sweat","sweatTalk"],down:["down","downTalk"],shock:["shock","shockTalk"],think:["think","thinkTalk"],beg:["beg","begTalk"],smile:["smile","smileTalk"]},
  barbara:{normal:["base","talk"],smug:["smug","smugTalk"],smile:["smile","smileTalk"],angry:["annoyed","annoyedTalk"],disdain:["annoyed","annoyedTalk"],shock:["shock","shockTalk"],sweat:["sweat","sweatTalk"],think:["think","thinkTalk"],"pose:point":["point","pointTalk"]},
  aurelio:{normal:["base","talk"],smug:["smug","smugTalk"],shock:["shock","shockTalk"],sweat:["sweat","sweatTalk"],think:["think","thinkTalk"],smile:["smile","smileTalk"],angry:["angry","angryTalk"],confused:["confused","confusedTalk"]},
  eduardo:{normal:["base","talk"],smile:["smile","smileTalk"],think:["scratch","scratchTalk"],sweat:["sweat","sweatTalk"],write:["note","noteTalk"],shock:["shock","shockTalk"],serious:["fist","fistTalk"],angry:["fist","fistTalk"],down:["down","downTalk"]},
  chayo:{normal:["base","talk"],serious:["base","talk"],smile:["happy","happyTalk"],happy:["happy","happyTalk"],laugh:["happy","happyTalk"],giggle:["happy","happyTalk"],eat:["happy","happyTalk"],grin:["happy","happyTalk"],excited:["happy","happyTalk"],blush:["happy","happyTalk"],think:["think","thinkTalk"],think2:["think","thinkTalk"],surprise:["surprise","surpriseTalk"],shock:["surprise","surpriseTalk"],panic:["surprise","surpriseTalk"],sweat:["worried","worriedTalk"],worried:["worried","worriedTalk"],down:["worried","worriedTalk"],sad:["worried","worriedTalk"],embarrassed:["worried","worriedTalk"],cry:["worried","worriedTalk"],smug:["smug","smugTalk"],wink:["smug","smugTalk"],annoyed:["annoyed","annoyedTalk"],pout:["annoyed","annoyedTalk"],angry:["annoyed","annoyedTalk"],facepalm:["annoyed","annoyedTalk"],"pose:point":["point","pointTalk"],"pose:lentes":["smug","smugTalk"],"pose:camara":["happy","happyTalk"],"pose:foto":["happy","happyTalk"]},
  zoila:{normal:["base","talk"],smug:["smug","smugTalk"],smile:["happy","happyTalk"],sweat:["sweat","sweatTalk"],shock:["shock","shockTalk"],think:["think","thinkTalk"],serious:["serious","seriousTalk"],angry:["indignant","indignantTalk"]},
};
/* Caras sin pareja de boca (solo reacción): al empezar la línea se ven un momento y luego el personaje
   sigue hablando con una cara que SÍ tiene boca cerrada/abierta. «pose:x» = la pose también se deja. */
const REACT={ };   // ej.: chayo:{laugh:"happy"} si alguna vez vuelve a tener caras sin pareja
function artFor(who,mood,pose,m,b){ const A=ART[who]; if(!A) return null; const M=AMAP[who];
  if(pose==="cafe"&&(mood==="shock"||mood==="sweat")) pose="";
  let e=(pose&&M["pose:"+pose])||M[mood]||M.normal; if(typeof e==="string") e=[e];
  let a=m?(e[1]||e[0]):((b&&e[2])||e[0]);
  if(A["frente_"+a] && G.pos!=="fiscalia") a="frente_"+a;     // de frente fuera de su puesto (Penna: de perfil en la fiscalía, de frente en la sala de espera)
  return a; }
const SPR={}; let cur=null, talk=0, blink=0, canTalk=false;

/* Si una imagen HD no existe, se usa la normal (nunca queda un personaje o fondo en blanco) */
/* Cuadros HD: se recortan de la hoja de cada personaje (una imagen por personaje) a un lienzo de 512×384 */
const ATL={}, ATF={};
function atlasFrame(ref){
  if(ATF[ref]) return ATF[ref];
  const [w,k]=ref.slice(6).split("/"), r=HD_ATLAS[w][k], c=document.createElement("canvas");
  c.width=512; c.height=384; c.complete=false; c.listos=[]; ATF[ref]=c;
  if(!ATL[w]){ ATL[w]=new Image(); ATL[w].src="assets/hd/atlas/"+w+".png"; }
  const im=ATL[w], pinta=()=>{ c.getContext("2d").drawImage(im,r[0],r[1],r[2],r[3],r[4],r[5],r[2],r[3]); c.complete=true; c.listos.forEach(f=>f()); c.listos=[]; };
  if(im.complete&&im.naturalWidth) pinta(); else im.addEventListener("load",pinta);
  return c;
}
function respaldoHD(im){ im.addEventListener("error",()=>{ if(im.src.includes("/assets/hd/")) im.src=im.src.replace("/assets/hd/","/assets/"); }); return im; }
const off=document.createElement("canvas"); off.width=1024; off.height=768;
/* Pantalla de arriba: en HD los lienzos tienen el doble de píxeles; el dibujo sigue en coordenadas 256×192 */
["bg","spr","desk"].forEach(id=>{ const cv=$(id); if(HD){ cv.width=512; cv.height=384; const c=cv.getContext("2d"); c.setTransform(2,0,0,2,0,0); c.imageSmoothingEnabled=true; c.imageSmoothingQuality="high"; } });
const imTmp=document.createElement("canvas"); imTmp.width=256; imTmp.height=192;
function putIm(c,data){ if(!HD) return c.putImageData(data,0,0); imTmp.getContext("2d").putImageData(data,0,0);
  c.clearRect(0,0,256,192); c.imageSmoothingEnabled=false; c.drawImage(imTmp,0,0,256,192); c.imageSmoothingEnabled=true; }
function fkey(who,mood,pose,m,b){ const a=artFor(who,mood,pose,m,b); return a ? who+"|art|"+a : [who,mood,pose,G.nocap,m,b].join("|"); }
function getFrame(who,mood,pose,m,b,cb){
  const key=fkey(who,mood,pose,m,b);
  let ent=SPR[key];
  if(ent){ if(ent.data){ cb&&cb(ent.data,key); } else if(cb) ent.cbs.push(cb); return; }
  ent=SPR[key]={data:null,cbs:cb?[cb]:[]};
  const art=artFor(who,mood,pose,m,b);
  if(art && String(ART[who][art]).startsWith("atlas:")){
    const c=atlasFrame(ART[who][art]), fin=()=>{ ent.data=c; ent.cbs.forEach(f=>f(c,key)); ent.cbs=[]; };
    if(c.complete) fin(); else c.listos.push(fin); return;
  }
  const svg=art?null:sprite(who,mood,pose,m,b).replace("<svg ",'<svg width="1024" height="768" shape-rendering="crispEdges" ');
  const img=respaldoHD(new Image());
  img.onload=()=>{
    if(art){ ent.data=img; ent.cbs.forEach(f=>f(img,key)); ent.cbs=[]; return; }
    const o=off.getContext("2d",{willReadFrequently:true}); o.clearRect(0,0,1024,768); o.imageSmoothingEnabled=false; o.drawImage(img,0,0,1024,768);
    let src; try{ src=o.getImageData(0,0,1024,768).data; }catch(e){ return; }
    const out=new ImageData(256,192), p=out.data;
    for(let y=0;y<192;y++) for(let x=0;x<256;x++){
      const q=((y*4+2)*1024+x*4+2)*4, d=(y*256+x)*4;
      if(src[q+3]<128) continue;
      p[d]=src[q]&0xF8; p[d+1]=src[q+1]&0xF8; p[d+2]=src[q+2]&0xF8; p[d+3]=255;   // color de 15 bits, como la DS
    }
    ent.data=out; ent.cbs.forEach(f=>f(out,key)); ent.cbs=[];
  };
  img.src=(art?ART[who][art]:null)||("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg));
}
function renderSprite(){
  if(!cur || seqOn) return;
  getFrame(cur.who,cur.mood,cur.pose,talk,blink,(data,key)=>{
    if(cur && key===fkey(cur.who,cur.mood,cur.pose,talk,blink)) { const c=$("spr").getContext("2d");
      if(data instanceof ImageData) putIm(c,data); else { c.clearRect(0,0,256,192); c.drawImage(data,0,0,256,192); } }
  });
}
/* Animaciones de entrada/salida de una pose (cuadros sueltos de ART que se pasan antes de quedar en la pose).
   Justo: levanta el brazo al apuntar y lo baja al terminar; se pone los lentes y toma el papel. */
for(let i=1;i<=16;i++){ AMAP.testigo["b"+i]=["b"+i,"b"+i]; AMAP.testigo["k"+i]=["k"+i,"k"+i]; }   // cuadros sueltos de Llavín (colapso y gestos)
const TRANS={ testigo:{ llaves:{in:["k2","k3","k4"], out:["k7","k8"], ms:90} }, ines:{
  point:{in:["ap2","ap3","ap4","ap5","ap6","ap7","ap8"], out:["ap12","ap13","ap14","ap15","ap16"], ms:45},
  papel:{in:["ld1","ld2","ld3","ld4"], out:["ld4","ld3","ld2","ld1"], ms:170},
  papelThink:{in:["ld1","ld2","ld3","ld4"], out:["ld4","ld3","ld2","ld1"], ms:170} }};
const RAW={}; function rawImg(who,k){ const key=who+"/"+k; if(!RAW[key] && String(ART[who][k]).startsWith("atlas:")) RAW[key]=atlasFrame(ART[who][k]);
  if(!RAW[key]){ RAW[key]=respaldoHD(new Image()); RAW[key].src=ART[who][k]; } return RAW[key]; }
Object.keys(TRANS).forEach(w=>Object.values(TRANS[w]).forEach(t=>t.in.concat(t.out).forEach(k=>rawImg(w,k))));
let seqTimer=null, seqOn=false, seqUntil=0;
function playSeq(who,frames,ms){
  clearInterval(seqTimer); seqOn=true; seqUntil=Date.now()+frames.length*ms; let i=0; const c=$("spr").getContext("2d");
  const draw=()=>{ if(i>=frames.length){ clearInterval(seqTimer); seqOn=false; renderSprite(); return; }
    const im=rawImg(who,frames[i++]); if(im.complete){ c.clearRect(0,0,256,192); c.drawImage(im,0,0,256,192); } };
  draw(); seqTimer=setInterval(draw,ms);
}
function drawSprite(who,mood,pose){
  const c=$("spr").getContext("2d");
  if(!who){ cur=null; clearInterval(seqTimer); seqOn=false; c.clearRect(0,0,256,192); return; }
  const T=TRANS[who]||{}, antes=cur&&cur.who===who?cur.pose:null, ahora=pose||"";
  let seq=null;
  if(ahora!==antes){
    if(T[ahora] && !(T[antes] && T[antes].in===T[ahora].in)) seq=[T[ahora].in,T[ahora].ms];          // entra a la pose: animación de entrada
    else if(antes && T[antes] && !T[ahora]) seq=[T[antes].out,T[antes].ms];                           // sale de la pose: animación de salida
  }
  if(!cur||cur.who!==who){ c.clearRect(0,0,256,192);          // entra un personaje nuevo: fundido (salvo corte de cámara)
    const cv=$("spr"); cv.classList.remove("fadein"); void cv.offsetWidth; if(!drawSprite.corte) cv.classList.add("fadein"); }
  cur={who,mood:mood||"normal",pose:pose||""}; talk=0; blink=0;
  if(seq && !drawSprite.sinAnim) playSeq(who,seq[0],seq[1]); else { clearInterval(seqTimer); seqOn=false; renderSprite(); }
  getFrame(who,cur.mood,cur.pose,1,0); getFrame(who,cur.mood,cur.pose,0,1);
}
function setTalk(v){ v=v?1:0; if(!cur||talk===v) return; talk=v; renderSprite(); }
/* precarga de todos los cuadros para que el corte de cámara sea instantáneo */
Object.keys(AMAP).forEach(who=>Object.keys(AMAP[who]).forEach(k=>{
  if(k.startsWith("pose:")){ getFrame(who,"normal",k.slice(5),0,0); getFrame(who,"normal",k.slice(5),1,0); }
  else { getFrame(who,k,"",0,0); getFrame(who,k,"",1,0); getFrame(who,k,"",0,1); }
}));
setInterval(()=>{ if(!cur||blink) return; blink=1; renderSprite(); setTimeout(()=>{ blink=0; renderSprite(); },140); },3400);

/* entradas */
$("box").onclick=()=>{ if(mode==="dialog"){ verdict.clear&&$("verdict").style.display==="flex"&&!busy&&verdict.clear(); advance(); } else if((mode==="cross"||mode==="direct")&&typing) typeText.finish(); };
$("recBtn").onclick=()=>{ if(busy) return; if(mode==="cross") openRecord("pruebas"); else if(mode==="present") openRecord(X.prompt.tab,X.prompt.prompt); else openRecord(); };
$("muteBtn").onclick=()=>{ muted=!muted; if(master) master.gain.value=muted?0:.8; musicEls.forEach(m=>m.muted=muted); $("muteBtn").textContent=muted?"🔇":"🔊"; };
document.addEventListener("keydown",e=>{
  if($("modal").style.display==="flex"){ if(e.key==="Escape"&&mode!=="present") closeRecord(); return; }
  if(e.key===" "||e.key==="Enter"){ e.preventDefault(); $("box").onclick(); }
  if(mode==="cross"){ if(e.key==="ArrowLeft") move(-1); if(e.key==="ArrowRight") move(1); }
});
$("saveBtn").onclick=()=>{ if($("title").style.display==="none") saveGame(true); };
$("contBtn").onclick=()=>{ initAudio(); unlockMusic(); if(AC&&AC.state==="suspended") AC.resume(); $("title").style.display="none"; continueGame(); };
$("startBtn").onclick=()=>{ initAudio(); unlockMusic(); if(AC&&AC.state==="suspended") AC.resume(); $("title").style.display="none"; resetGame(); run(); };
/* portada: elegir caso */
function selectCase(id){
  const c=useCase(id); SAVEKEY="actacero_"+CASO_ID+"_v"+(c.guardado||1);   // guardado: sube cuando el guion cambia de forma
  $("casoSub").textContent="CASO "+(c.numero||"")+" · "+(c.titulo||"").toUpperCase(); $("casoIntro").textContent=c.intro||"";
  $("contBtn").style.display=loadSave()?"":"none";
  document.querySelectorAll("#casoSel button").forEach(b=>b.classList.toggle("on",b.dataset.c===CASO_ID));
  SCRIPT.forEach(s=>{ if(s.cmd==="cine"&&s.img) new Image().src=hdSrc(s.img); });   // precarga de la cinemática
  try{ localStorage.setItem("actacero_caso",CASO_ID); }catch(e){}
  resetGame();
}
/* Portada: elegir calidad de imagen (se guarda y la página se recarga para dibujar en esa resolución) */
if(HD_DISPONIBLE) (()=>{ const d=document.createElement("div"); d.id="calidad";
  d.innerHTML=`<button data-hd="1" class="${HD?"on":""}">✨ Versión HD</button><button data-hd="0" class="${HD?"":"on"}">🎮 Versión NDS</button>`;
  $("casoSel").after(d);
  d.querySelectorAll("button").forEach(b=>b.onclick=()=>{ const v=b.dataset.hd==="1"; if(v===HD) return;
    try{ localStorage.setItem("actacero_hd", v?"1":"0"); }catch(e){} location.reload(); }); })();
$("casoSel").innerHTML=Object.entries(CASOS).map(([id,c])=>`<button data-c="${id}">Caso ${c.numero}</button>`).join("");
document.querySelectorAll("#casoSel button").forEach(b=>b.onclick=()=>selectCase(b.dataset.c));
{ let last="caso1"; try{ last=localStorage.getItem("actacero_caso")||"caso1"; }catch(e){} selectCase(last); }
