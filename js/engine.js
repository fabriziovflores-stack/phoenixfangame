/* =====================================================================
   PARTE 4: MOTOR
   ===================================================================== */
const $=id=>document.getElementById(id);
const MAXH=5;
const ENTRADA_MS=1500;    // fundido (ms) cuando aparece un personaje sin cambio de cámara; recién después habla
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
    if(pausa){ setTalk(0); tTimer=setTimeout(step,pausa); return; }
    if(i>=chars.length){ finish(); return; }
    const c=chars[i];
    if(!span||spanCls!==c.cls){ span=document.createElement("span"); if(c.cls) span.className=c.cls; spanCls=c.cls; el.appendChild(span); }
    span.textContent+=c.ch;
    if(c.ch!==" " && i%2===0) voice==="type"?SFX.type():SFX.blip(voice);
    if(canTalk && i%3===0) setTalk((i/3)%2===0);
    i++;
    const nx=chars[i]&&chars[i].ch;
    const d = c.ch==="." && nx==="." ? 120                       // puntos suspensivos: se escriben lento
            : ".!?…".includes(c.ch) && nx===" " ? 300 : c.ch===","? 140 : 32;
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
    if(l.music!==undefined) music(l.music);
    if(l.anim) anim(l.anim);
    tickEv(l);
    if(l.damage) takeDamage();
    if(l.confetti) confetti();
    if(l.sfx && SFX[l.sfx]) SFX[l.sfx]();                   // sonido puntual: sfx:"badum", etc.
    if(l.read){ G.notes[l.read[0]]=l.read[1]; SFX.realize(); showEvBox(l.read[0],3); }
    if(l.show) showEvBox(l.show,3);                          // muestra una prueba que ya está en el expediente
    if(l.flag) [].concat(l.flag).forEach(f=>G.flags[f]=1);                       // marca: algo ya pasó
    if(l.meet && !G.met[l.meet]){ G.met[l.meet]=1; const pr=PROFILES.find(p=>p.id===l.meet); if(pr) toast("Perfil agregado: "+pr.name); }
    $("name").textContent = ch ? (l.phone?"📞 ":"")+ch.name : "";
    const think = plainText(l.text).startsWith("("); canTalk = !!l.who && !yo && !(think && l.who==="ines");   // solo Justo piensa en silencio; los demás entre paréntesis susurran y mueven la boca
    const style = l.cross ? "cross" : think ? "think" : !l.who ? "narr" : "";
    mode="dialog"; renderControls();
    waiting=done;
    blipWho=l.who;
    const start=()=>typeText(l.text, style, ch?ch.voice:(l.who===null?700:700), ()=>{ if(mode==="dialog") $("next").classList.add("on"); });
    const anima=Math.max(0, seqUntil-Date.now());          // el texto espera a que termine la animación (apuntar, lentes...)
    if(entra||anima>0){ $("text").textContent=""; busy=true; setTimeout(()=>{ busy=false; start(); }, entra?Math.max(ENTRADA_MS,anima):anima); } else start();
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
  location(st,done){ setScene(st.pos||G.pos, null); locCard(st.text, done); },
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
    music("corte");
    SFX.testimony();
    titleCard("— Testimonio —", def.title, ()=>{
      play(X.list.map(s=>({who:def.who||"testigo",mood:s.mood,text:s.text})), ()=>dim(()=>{
        X.tag="Contrainterrogatorio";
        titleCard("— Contrainterrogatorio —", def.title, ()=>{
          music(def.music||"interrogatorio");
          play(def.tutorial||[], showStatement);
        });
      }));
    });
  },
  choice(st,done){
    checkpoint=pc-1;
    const ask=()=>say({who:st.who,mood:st.mood,pose:st.pose,pos:st.pos,text:st.text}, ()=>{
      mode="choice"; $("next").classList.remove("on");
      X={choice:st, pick:i=>{ const o=st.options[i]; if(o.then) play(o.then,done); else if(o.ok) play(st.ok||[],done); else { SFX.whoops(); play(o.w||[],ask); } }};
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
    titleCard("— Interrogatorio —", def.title, ()=>{
      music(def.music||"interrogatorio");
      play(def.tutorial||[], showQuestion);
    });
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
    const im=new Image(); im.onload=()=>show(im); im.onerror=()=>show(null); im.src=st.img;
  },
  card(st,done){ vistos.clear(); titleCard(st.t1||"", st.t2||"", done); },     // tarjeta «Día N — Investigación»
  breakdown(st,done){
    music(null); busy=true; mode="loc"; renderControls();
    const W=st.who||"testigo"; setScene("estrado",W,"break");
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
};

function titleCard(t1,t2,done){
  busy=true; const o=$("tcard"); o.innerHTML=`<div class="band"><div class="t1">${t1}</div><div class="t2">${t2}</div></div>`;
  o.style.display="flex"; SFX.whoosh(); mode="loc"; renderControls();
  setTimeout(()=>{ o.style.display="none"; busy=false; done(); },1850);
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
  setScene("estrado",W, s.mood||"normal");
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
    X.idx=0;
    if(!X.hinted && X.def.loopHint){ X.hinted=true;
      const h=X.def.loopHint.filter(l=>!(l.ifHidden && X.list.find(x=>x.id===l.ifHidden)));   // ifHidden: solo si esa declaración sigue oculta
      if(h.length){ play(h, showStatement); return; } }
  } else X.idx=(X.idx+d+X.list.length)%X.list.length;
  showStatement();
}
function press(){
  if(busy) return;
  const s=X.list[X.idx];
  const lines=s.press.map((l,i)=>i===0?Object.assign({bubble:"momento"},l):l);
  if(s.ends){ const done=X.done; X=null; play(lines, done); return; }
  play(lines, ()=>{
    if(s.adds && !X.list.find(x=>x.id===s.adds)){
      const ns=X.def.statements.find(x=>x.id===s.adds);
      X.list.splice(X.idx+1,0,ns); X.idx++;
      SFX.ding();
      play([{who:null,text:"Se agregó una nueva declaración al testimonio."}], showStatement);
    } else showStatement();
  });
}
function presentItem(id){
  closeRecord(); showEvBox(id,5);
  if(typeof invPresent==="function" && invPresent(id)) return;     // investigación (js/investigacion.js)
  if(mode==="present"){
    const p=X.prompt;
    if([].concat(p.answer).includes(id)){ const d=X.done; play(p.ok, d); }
    else if(p.soft) play(p.wrong||[], ()=>{ pc=checkpoint; run(); });     // sin castigo (fuera del juicio)
    else SFX.whoops(), play([{who:"ines",bubble:"mire",pose:"point",anim:"slam",text:"¡Mire esto, Su Señoría!"},
               {who:"jueza",mood:"serious",text:"...¿Y eso qué tiene que ver, abogado?"},
               {who:"fiscal",mood:"smug",pose:"cafe",text:"Hmph. Novato. *sorbo*"},
               {who:"jueza",mood:"disappoint",damage:true,text:"Se lo descontaré a la defensa."},
   {who:"ines",mood:"shock",anim:"hit",text:"(¡Aaagh! ¡Me equivoqué!)"}],
              ()=>{ if(G.health<=0) return gameOver(); pc=checkpoint; run(); });
    return;
  }
  const s=X.list[X.idx];
  if(s.contra && [].concat(s.contra).includes(id)){ const done=X.done; X=null; play(s.contraLines, done); }
  else if(s.early && [].concat(s.early.ids).includes(id)) play(s.early.lines, showStatement);   // correcta, pero antes de tiempo: sin castigo
  else SFX.whoops(), play(WRONG[Math.floor(Math.random()*WRONG.length)], ()=>{ if(G.health<=0) return gameOver(); showStatement(); });
}
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
function openRecord(tab, prompt){
  if(busy) return;
  recTab=tab||recTab;
  const canPresent = ["cross","present","invpresent","silpresent"].includes(mode);
  const items = recTab==="pruebas" ? EVIDENCE : PROFILES.filter(p=>!p.hidden||G.met[p.id]);
  let sel=null;
  $("mbox").innerHTML=`<div id="mhead"><h2>Expediente</h2><div class="tabs"><button data-t="pruebas" class="${recTab==="pruebas"?"on":""}">Pruebas</button><button data-t="perfiles" class="${recTab==="perfiles"?"on":""}">Perfiles</button></div></div>
    ${prompt?`<div id="mprompt">${prompt}</div>`:""}
    <div class="grid">${items.map((it,i)=>`<div class="card" data-i="${i}"><div class="ic">${EVIMG[it.id]?`<img src="${EVIMG[it.id]}" style="height:100%;image-rendering:pixelated">`:(it.icon||miniFace(it.who))}</div><div class="nm">${it.name}</div></div>`).join("")}</div>
    <div id="mdesc">Toca un elemento para examinarlo.</div>
    <div class="row">${mode==="present"?"":mode==="silpresent"?`<button id="mquit">Retirarse</button>`:`<button id="mclose">Volver</button>`}${canPresent?`<button class="obj" id="mact" style="opacity:.5">¡Presentar!</button>`:""}</div>`;
  $("modal").style.display="flex";
  $("mbox").querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{ recTab=b.dataset.t; openRecord(recTab,prompt); });
  $("mbox").querySelectorAll(".card").forEach(card=>card.onclick=()=>{
    $("mbox").querySelectorAll(".card").forEach(c=>c.classList.remove("sel"));
    card.classList.add("sel"); sel=items[+card.dataset.i]; $("mdesc").innerHTML=(sel.ver?`<button id="mver">🔍 Ver en grande</button>`:"")+(EVIMG[sel.id]?`<img src="${EVIMG[sel.id]}" style="float:left;width:19cqw;margin:0 2cqw .5cqw 0;image-rendering:pixelated">`:"")+esc(sel.desc)+((G.notes[sel.id]||sel.read)?"\n<span style=\"color:var(--blue)\">▸ Lectura actual: "+esc(G.notes[sel.id]||sel.read)+"</span>":"")
;
    const v=$("mver"); if(v) v.onclick=()=>verPrueba(sel.ver);
    const a=$("mact"); if(a) a.style.opacity=1;
  });
  const c=$("mclose"); if(c) c.onclick=()=>{ closeRecord(); if(mode==="invpresent") invMenu(); };
  const q=$("mquit"); if(q) q.onclick=()=>{ closeRecord(); play([{who:"ines",mood:"sweat",text:"(Mejor vuelvo cuando tenga cómo hacerlo hablar.)"}], invMenu); };
  const a=$("mact"); if(a) a.onclick=()=>{ if(sel) presentItem(sel.id); };
}
/* ver una prueba en grande en la pantalla de arriba (tocar para cerrar) */
function verPrueba(src){
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
  if(!SCN[k]){ const im=new Image(); SCN[k]=im; im.onload=()=>{ if(G.pos===pos) drawBG(pos); }; im.src=src; } return SCN[k]; }
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
  if(bi&&bi.complete&&bi.naturalWidth) c.drawImage(bi,0,0);
  if(di&&di.complete&&di.naturalWidth){ d.clearRect(0,0,256,192); d.drawImage(di,0,0); }
}
[...new Set([...Object.keys(BGIMG),...Object.keys(DESKIMG)])].forEach(p=>{ scnImg("bg",p); scnImg("desk",p); });
/* Ilustraciones de personajes (prueba): si existe ART[personaje], reemplaza al dibujo por código */

/* Qué celda de la hoja usa cada emoción: [callado, hablando, parpadeo] */
const AMAP={
  ines:{normal:["base","talk"],serious:["base","talk"],smug:["smug","smugTalk"],smile:["smug","smugTalk"],sweat:["sweat","sweatTalk"],shock:["shock","shockTalk"],think:["think","thinkTalk"],angry:["angry","angryTalk"],down:["down","downTalk"],"pose:point":["point","pointTalk"],"pose:papel":["papel","papelTalk"],"pose:papelThink":["le16","le16"]},
  fiscal:{normal:["base","talk"],serious:["base","talk"],smug:["smug","smugTalk"],smile:["smile","smileTalk"],shock:["shock","shockTalk"],sweat:["sweat","sweatTalk"],angry:["angry","angryTalk"],disdain:["cross","crossTalk"],think:["think","thinkTalk"],proud:["proud2","proud2Talk"],laugh:["proud","proudTalk"],down:["down","downTalk"],facepalm:["facepalm","facepalmTalk"],"pose:point":["point","pointTalk"],"pose:cafe":["cafe","cafeTalk"],"pose:gesto":["gesture","gestureTalk"],"pose:cruzado":["cross","crossTalk"],"pose:alto":["stop","stopTalk"],"pose:puno":["fist","fistTalk"]},
  testigo:{normal:["base","talk"],smile:["proud","proudTalk"],smug:["smug","smugTalk"],sweat:["sweat","sweatTalk"],shock:["shock","shockTalk"],angry:["angry","angryTalk"],break:["break","breakTalk"],cry:["cry","cryTalk"]},
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
const off=document.createElement("canvas"); off.width=1024; off.height=768;
function fkey(who,mood,pose,m,b){ const a=artFor(who,mood,pose,m,b); return a ? who+"|art|"+a : [who,mood,pose,G.nocap,m,b].join("|"); }
function getFrame(who,mood,pose,m,b,cb){
  const key=fkey(who,mood,pose,m,b);
  let ent=SPR[key];
  if(ent){ if(ent.data){ cb&&cb(ent.data,key); } else if(cb) ent.cbs.push(cb); return; }
  ent=SPR[key]={data:null,cbs:cb?[cb]:[]};
  const art=artFor(who,mood,pose,m,b); const svg=art?null:sprite(who,mood,pose,m,b).replace("<svg ",'<svg width="1024" height="768" shape-rendering="crispEdges" ');
  const img=new Image();
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
      if(data instanceof ImageData) c.putImageData(data,0,0); else { c.clearRect(0,0,256,192); c.drawImage(data,0,0); } }
  });
}
/* Animaciones de entrada/salida de una pose (cuadros sueltos de ART que se pasan antes de quedar en la pose).
   Justo: levanta el brazo al apuntar y lo baja al terminar; se pone los lentes y toma el papel. */
const TRANS={ ines:{
  point:{in:["ap2","ap3","ap4","ap5","ap6","ap7","ap8"], out:["ap12","ap13","ap14","ap15","ap16"], ms:45},
  papel:{in:["le2","le3","le4","le5","le6","le7","le8","le9","le10","le11","le12"], out:["le12","le11","le10","le9","le3","le2"], ms:110},
  papelThink:{in:["le2","le3","le4","le5","le6","le7","le8","le9","le10","le11","le12"], out:["le12","le11","le10","le9","le3","le2"], ms:110} }};
const RAW={}; function rawImg(who,k){ const key=who+"/"+k; if(!RAW[key]){ RAW[key]=new Image(); RAW[key].src=ART[who][k]; } return RAW[key]; }
Object.keys(TRANS).forEach(w=>Object.values(TRANS[w]).forEach(t=>t.in.concat(t.out).forEach(k=>rawImg(w,k))));
let seqTimer=null, seqOn=false, seqUntil=0;
function playSeq(who,frames,ms){
  clearInterval(seqTimer); seqOn=true; seqUntil=Date.now()+frames.length*ms; let i=0; const c=$("spr").getContext("2d");
  const draw=()=>{ if(i>=frames.length){ clearInterval(seqTimer); seqOn=false; renderSprite(); return; }
    const im=rawImg(who,frames[i++]); if(im.complete){ c.clearRect(0,0,256,192); c.drawImage(im,0,0); } };
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
$("recBtn").onclick=()=>{ if(mode==="cross") openRecord("pruebas"); else if(mode==="present") openRecord(X.prompt.tab,X.prompt.prompt); else openRecord(); };
$("muteBtn").onclick=()=>{ muted=!muted; if(master) master.gain.value=muted?0:.8; if(musicEl) musicEl.muted=muted; $("muteBtn").textContent=muted?"🔇":"🔊"; };
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
  const c=useCase(id); SAVEKEY="actacero_"+CASO_ID+"_v1";
  $("casoSub").textContent="CASO "+(c.numero||"")+" · "+(c.titulo||"").toUpperCase(); $("casoIntro").textContent=c.intro||"";
  $("contBtn").style.display=loadSave()?"":"none";
  document.querySelectorAll("#casoSel button").forEach(b=>b.classList.toggle("on",b.dataset.c===CASO_ID));
  SCRIPT.forEach(s=>{ if(s.cmd==="cine"&&s.img) new Image().src=s.img; });   // precarga de la cinemática
  try{ localStorage.setItem("actacero_caso",CASO_ID); }catch(e){}
  resetGame();
}
$("casoSel").innerHTML=Object.entries(CASOS).map(([id,c])=>`<button data-c="${id}">Caso ${c.numero}</button>`).join("");
document.querySelectorAll("#casoSel button").forEach(b=>b.onclick=()=>selectCase(b.dataset.c));
{ let last="caso1"; try{ last=localStorage.getItem("actacero_caso")||"caso1"; }catch(e){} selectCase(last); }
