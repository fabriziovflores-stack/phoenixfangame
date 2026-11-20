/* =====================================================================
   MODO INVESTIGACIÓN
   En el guion: {cmd:"invest", ref:"dia1"} usa INV.dia1 del caso. Formato:
   INV.dia1 = {
     start:"lugar", music:"pista", done:{flags:[...], ev:[...]}, end:[líneas al terminar],
     places:{ lugar:{ name, bg, req, enter:[líneas la 1ª vez], moves:["otro", ...],
       people:[{who, req, hello:[al verlo por primera vez], back:[al volver al lugar]}],
       examine:[{id, t, req, lines, again}],
       talk:[{id, who, t, req, lines, silence:{req, closed, intro, steps:[{prompt, answer, tab, ok}], wrong, broken}}],
       present:{ who:{ idPrueba:[líneas], "idPrueba:again":[al mostrarla otra vez], o idPrueba:{req, lines, no}, default:[líneas] } } } }
   }
   req = {flags:[...], ev:[...], not:[...]}. Una línea puede tener flag:"x" (marca) y meet:"id" (agrega perfil).
   ===================================================================== */
function reqOk(r){
  if(!r) return true;
  const has=id=>EVIDENCE.some(e=>e.id===id);
  return [].concat(r.flags||[]).every(f=>G.flags[f]) && [].concat(r.ev||[]).every(has) && ![].concat(r.not||[]).some(f=>G.flags[f]);
}
function invPlace(){ return X.inv.places[G.inv.place]; }
function invPeople(){ return (invPlace().people||[]).filter(p=>reqOk(p.req)).map(p=>p.who).slice(0,1); }   // una sola persona por lugar
function invBg(){ return invPlace().bg||G.inv.place; }

CMD.invest=(st,done)=>{
  checkpoint=pc-1;
  const def=INV[st.ref];
  if(!G.inv||G.inv.ref!==st.ref) G.inv={ref:st.ref, place:def.start, seen:{}};
  X={inv:def, done, step:pc-1};
  if(def.music!==undefined) music(def.music);
  invEnter(G.inv.place);
};
function invEnter(id){
  G.inv.place=id; const p=invPlace(), k="in:"+id, first=!G.inv.seen[k]; if(!X.inv.fecha) G.inv.seen[k]=1;
  if(first && X.inv.fecha){                                // primera vez este día: letrero con fecha, hora y lugar
    const min=(X.inv.hora||600)+(G.inv.reloj||0); G.inv.reloj=(G.inv.reloj||0)+(X.inv.paso||25);
    const hh=String(Math.floor(min/60)%24).padStart(2,"0"), mm=String(min%60).padStart(2,"0");
    setScene(invBg(), null);
    return locCard(X.inv.fecha+" · "+hh+":"+mm+"\n"+p.name, ()=>{ G.inv.seen[k]=1; invEnter2(id, true); });
  }
  invEnter2(id, first);
}
function invEnter2(id, first){
  const p=invPlace();
  if(X.inv.music!==undefined) music(p.music!==undefined ? p.music : X.inv.music);   // un lugar puede tener su propia música
  const here=invPeople();
  const back = !first && (p.people||[]).find(x=>reqOk(x.req) && x.back && G.inv.seen["hi:"+id+":"+x.who]);
  if(back) vistos.add(back.who);                            // al volver, la persona ya está ahí: sin fundido
  if((first && p.enter) || back){ setScene(invBg(), null); return play(first ? p.enter : back.back, invMenu); }   // aparece y luego habla
  setScene(invBg(), here[0]||null);
  invMenu();
}
/* Lo ya conversado o examinado cuenta siempre (también si se hizo en una versión anterior del juego):
   se vuelven a aplicar las marcas (flag) de esas líneas. Evita quedar pillado con partidas guardadas. */
function invSyncFlags(){
  const mark=ls=>(ls||[]).forEach(l=>{ if(l.flag) [].concat(l.flag).forEach(f=>G.flags[f]=1); });
  Object.entries(X.inv.places).forEach(([pid,p])=>{
    (p.talk||[]).forEach(t=>{ if(G.inv.seen["tk:"+t.id] && (!t.silence||G.flags["sil:"+t.id])) mark(t.lines); });
    (p.examine||[]).forEach(e=>{ if(G.inv.seen["ex:"+pid+":"+e.id]) mark(e.lines); });
  });
}
function invMenu(){
  if(!X||!X.inv) return;
  invSyncFlags();
  const kn=G.inv.known=G.inv.known||{};                    // lugares que se acaban de abrir: aviso
  const nuevos=Object.keys(X.inv.places).filter(id=>!kn[id] && reqOk(X.inv.places[id].req));
  nuevos.forEach(id=>kn[id]=1);
  const avisar=nuevos.filter(id=>id!==G.inv.place);
  if(G.inv.knownInit && avisar.length){ toast("🚶 Nuevo lugar: "+avisar.map(id=>X.inv.places[id].name).join(", ")); SFX.ding(); }
  G.inv.knownInit=1;
  if(reqOk(X.inv.done)){                                   // ¿ya se reunió lo necesario?
    const done=X.done, end=X.inv.end||[]; X=null; G.inv=null; play(end, done); return;
  }
  const pl=G.inv.place;                                    // alguien recién visible: reacciona al ver a Justo
  const nuevo=(invPlace().people||[]).find(x=>reqOk(x.req) && !G.inv.seen["hi:"+pl+":"+x.who]);
  if(nuevo){ G.inv.seen["hi:"+pl+":"+nuevo.who]=1; if(nuevo.hello) return play(nuevo.hello, invMenu); }
  mode="invmenu"; setScene(invBg(), invPeople()[0]||null);
  $("name").textContent=""; const t=$("text"); t.className="narr"; t.style.fontSize=""; t.textContent="📍 "+invPlace().name;
  $("next").classList.remove("on"); canTalk=false;
  renderControls(); savePc=X.step; saveGame(false);
}
function invList(items){ mode="invlist"; X.list=items; renderControls(); }
function invControls(m,add,row){
  if(m==="invmenu"){
    const a=row("rowI"); add("Examinar","hudimg k0",invExamine,a); add("Moverse","hudimg k1",invMove,a);
    const b=row("rowI"); add("Hablar","hudimg k2",invTalk,b); add("Presentar","hudimg k3",invPresentStart,b);
    add("💭 Pensar: ¿qué me falta?","opt back",invPensar);
    return true;
  }
  if(m==="invexam"){
    const d=document.createElement("div"); d.className="examhint"; d.innerHTML="🔍<br>Toca en la pantalla de arriba<br>lo que quieras examinar";
    $("controls").appendChild(d); add("◀ Volver","opt back",invMenu); return true;
  }
  if(m==="invlist"){ X.list.forEach(it=>add(it.t,"opt",it.fn)); add("◀ Volver","opt back",invMenu); return true; }
  if(m==="invpresent"||m==="silpresent"){
    add("📁 Abrir expediente","obj wide",()=>openRecord("pruebas", m==="silpresent"?silPrompt():null));
    if(m==="silpresent") add("Retirarse","opt back",()=>play([{who:"ines",mood:"sweat",text:"(Mejor vuelvo cuando tenga cómo hacerlo hablar.)"}], invMenu));
    else add("◀ Volver","opt back",invMenu);
    return true;
  }
  return false;
}
function invThought(t){ play([{who:"ines",mood:"think",text:t}], invMenu); }

/* Pensar: Justo dice en voz alta qué le falta (pistas del caso en INV.diaN.hints: {idPruebaOMarca: "texto"}) */
function invPensar(){
  const d=X.inv.done||{}, h=X.inv.hints||{};
  const falta=[...[].concat(d.ev||[]).filter(id=>!EVIDENCE.some(e=>e.id===id)), ...[].concat(d.flags||[]).filter(f=>!G.flags[f])];
  const txt=[...new Set(falta.map(k=>h[k]).filter(Boolean))].slice(0,2);
  if(!txt.length) txt.push("(Creo que ya tengo lo que necesito. Pero algo se me escapa... revisemos bien.)");
  play(txt.map(t=>({who:"ines",mood:"think",text:t})), invMenu);
}
/* Examinar: como en la DS, se toca el lugar en la pantalla de abajo (area:[x,y,ancho,alto] en 256×192).
   Si el lugar no tiene fondo dibujado o sus objetos no tienen area, se usa una lista. */
const NADA=["(No hay nada especial ahí.)","(Nada que me llame la atención.)","(Mmm... no. Nada.)"];
function invExamine(){
  const its=(invPlace().examine||[]).filter(e=>reqOk(e.req));
  if(BGIMG[invBg()] && its.some(e=>e.area)){
    setScene(invBg(), null); mode="invexam"; $("name").textContent=""; $("text").textContent="";
    renderControls(); return;
  }
  if(!its.length) return invThought("(No veo nada más que revisar aquí.)");
  invList(its.map(e=>{ const k="ex:"+G.inv.place+":"+e.id;
    return {t:(G.inv.seen[k]?"✓ ":"🔍 ")+e.t, fn:()=>{ const again=G.inv.seen[k]&&e.again; G.inv.seen[k]=1; setScene(invBg(),null); play(again?e.again:e.lines, invMenu); }}; }));
}
function invTap(x,y){
  const its=(invPlace().examine||[]).filter(e=>reqOk(e.req)&&e.area)
    .sort((a,b)=>a.area[2]*a.area[3]-b.area[2]*b.area[3]);            // si dos se tocan, gana el más chico
  const e=its.find(e=>{ const [ax,ay,aw,ah]=e.area; return x>=ax&&x<ax+aw&&y>=ay&&y<ay+ah; });
  if(!e) return play([{who:"ines",mood:"think",text:NADA[Math.floor(Math.random()*NADA.length)]}], invExamine);
  const k="ex:"+G.inv.place+":"+e.id, again=G.inv.seen[k]&&e.again; G.inv.seen[k]=1;
  play(again?e.again:e.lines, invExamine);
}
/* tocar la pantalla de arriba mientras se examina */
$("stage").addEventListener("click", ev=>{
  if(mode!=="invexam" || busy) return;
  const r=$("stage").getBoundingClientRect(), x=(ev.clientX-r.left)/r.width*256, y=(ev.clientY-r.top)/r.height*192;
  const m=$("mira"); m.style.left=(x/256*100)+"%"; m.style.top=(y/192*100)+"%"; m.style.display="block";
  busy=true; setTimeout(()=>{ m.style.display="none"; busy=false; invTap(x,y); },260);
});
/* Hablar */
function invTalk(){
  const here=invPeople(), ts=(invPlace().talk||[]).filter(t=>here.includes(t.who)&&reqOk(t.req));
  if(!ts.length) return invThought(here.length?"(Ya no tengo nada que preguntarle.)":"(No hay nadie con quien hablar aquí.)");
  invList(ts.map(t=>{ const k="tk:"+t.id, lock=t.silence&&!G.flags["sil:"+t.id];
    return {t:(lock?"🔒 ":G.inv.seen[k]?"✓ ":"💬 ")+t.t+(here.length>1?" — "+CHARS[t.who].name:""), fn:()=>{
      G.inv.seen[k]=1; if(lock) silStart(t); else play(t.lines||[], invMenu); }}; }));
}
/* Presentar */
function invPresentStart(){
  const here=invPeople();
  if(!here.length) return invThought("(No hay a quién mostrarle nada.)");
  const go=who=>{ X.who=who; setScene(invBg(), who); mode="invpresent"; renderControls(); openRecord("pruebas","¿Qué le muestras a "+CHARS[who].name+"?"); };
  if(here.length===1) go(here[0]); else invList(here.map(w=>({t:"👤 "+CHARS[w].name, fn:()=>go(w)})));
}
/* Moverse */
function invMove(){
  const ms=(invPlace().moves||[]).filter(id=>reqOk(X.inv.places[id].req));
  if(!ms.length) return invThought("(Todavía no tengo adónde ir.)");
  invList(ms.map(id=>({t:"🚶 "+X.inv.places[id].name, fn:()=>invEnter(id)})));
}

/* SILENCIO: un personaje se cierra. Se rompe presentando las pruebas correctas, en orden. */
function silPrompt(){ const {t,i}=X.sil, s=t.silence; return "🔒 Silencio ("+(s.steps.length-i)+") · "+s.steps[i].prompt; }
function silStart(t){
  const s=t.silence;
  if(!reqOk(s.req)) return play(s.closed||[{who:"ines",mood:"sweat",text:"(Se cerró. Todavía no tengo cómo hacerlo hablar.)"}], invMenu);
  play(s.intro||[], ()=>silStep(t,0));
}
function silStep(t,i){
  const s=t.silence;
  if(i>=s.steps.length){ G.flags["sil:"+t.id]=1; SFX.ding(); return play((s.broken||[]).concat(t.lines||[]), invMenu); }
  X.sil={t,i}; setScene(invBg(), t.who); mode="silpresent"; renderControls(); openRecord(s.steps[i].tab||"pruebas", silPrompt());
}

/* gancho desde presentItem() del motor */
function invPresent(id){
  if(mode==="silpresent"){
    const {t,i}=X.sil, st=t.silence.steps[i];
    if([].concat(st.answer).includes(id)) play(st.ok||[], ()=>silStep(t,i+1));
    else SFX.whoops(), play(t.silence.wrong||[{who:"ines",mood:"shock",anim:"hit",damage:true,text:"(No... eso no era. Se cerró más.)"}], ()=>silStep(t,i));
    return true;
  }
  if(mode==="invpresent"){
    const m=((invPlace().present||{})[X.who])||{};
    let e=m[id];                                           // {req, lines, no}: solo sirve cuando se cumple req (si no, dice «no»)
    if(e && !Array.isArray(e)) e = reqOk(e.req) ? e.lines : (e.no||null);
    const k="pr:"+G.inv.place+":"+X.who+":"+id, ok=Array.isArray(m[id])||(m[id]&&reqOk(m[id].req)), otra=ok && G.inv.seen[k] && m[id+":again"];   // «id:again» = lo que dice si se la muestras de nuevo
    if(ok) G.inv.seen[k]=1;
    play(otra||e||m.default||[{who:X.who,text:"Eh... ¿y eso qué tiene que ver conmigo?"}], invMenu);
    return true;
  }
  return false;
}
