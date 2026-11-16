/* =====================================================================
   MODO INVESTIGACIÓN
   En el guion: {cmd:"invest", ref:"dia1"} usa INV.dia1 del caso. Formato:
   INV.dia1 = {
     start:"lugar", music:"pista", done:{flags:[...], ev:[...]}, end:[líneas al terminar],
     places:{ lugar:{ name, bg, req, enter:[líneas la 1ª vez], moves:["otro", ...],
       people:[{who, req}],
       examine:[{id, t, req, lines, again}],
       talk:[{id, who, t, req, lines, silence:{req, closed, intro, steps:[{prompt, answer, tab, ok}], wrong, broken}}],
       present:{ who:{ idPrueba:[líneas], default:[líneas] } } } }
   }
   req = {flags:[...], ev:[...], not:[...]}. Una línea puede tener flag:"x" (marca) y meet:"id" (agrega perfil).
   ===================================================================== */
function reqOk(r){
  if(!r) return true;
  const has=id=>EVIDENCE.some(e=>e.id===id);
  return [].concat(r.flags||[]).every(f=>G.flags[f]) && [].concat(r.ev||[]).every(has) && ![].concat(r.not||[]).some(f=>G.flags[f]);
}
function invPlace(){ return X.inv.places[G.inv.place]; }
function invPeople(){ return (invPlace().people||[]).filter(p=>reqOk(p.req)).map(p=>p.who); }
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
  G.inv.place=id; const p=invPlace(), k="in:"+id, first=!G.inv.seen[k]; G.inv.seen[k]=1;
  setScene(invBg(), invPeople()[0]||null);
  if(first && p.enter) play(p.enter, invMenu); else invMenu();
}
function invMenu(){
  if(!X||!X.inv) return;
  if(reqOk(X.inv.done)){                                   // ¿ya se reunió lo necesario?
    const done=X.done, end=X.inv.end||[]; X=null; G.inv=null; play(end, done); return;
  }
  mode="invmenu"; setScene(invBg(), invPeople()[0]||null);
  $("name").textContent=""; const t=$("text"); t.className="narr"; t.style.fontSize=""; t.textContent="📍 "+invPlace().name;
  $("next").classList.remove("on"); canTalk=false;
  renderControls(); savePc=X.step; saveGame(false);
}
function invList(items){ mode="invlist"; X.list=items; renderControls(); }
function invControls(m,add,row){
  if(m==="invmenu"){
    const a=row("rowA"); add("🔍<br>Examinar","hold",invExamine,a); add("💬<br>Hablar","hold",invTalk,a);
    const b=row("rowA"); add("📁<br>Presentar","obj",invPresentStart,b); add("🚶<br>Moverse","hold",invMove,b);
    return true;
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

/* Examinar */
function invExamine(){
  const its=(invPlace().examine||[]).filter(e=>reqOk(e.req));
  if(!its.length) return invThought("(No veo nada más que revisar aquí.)");
  invList(its.map(e=>{ const k="ex:"+G.inv.place+":"+e.id;
    return {t:(G.inv.seen[k]?"✓ ":"🔍 ")+e.t, fn:()=>{ const again=G.inv.seen[k]&&e.again; G.inv.seen[k]=1; setScene(invBg(),null); play(again?e.again:e.lines, invMenu); }}; }));
}
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
    else play(t.silence.wrong||[{who:"ines",mood:"shock",anim:"hit",damage:true,text:"(No... eso no era. Se cerró más.)"}], ()=>silStep(t,i));
    return true;
  }
  if(mode==="invpresent"){
    const m=((invPlace().present||{})[X.who])||{};
    play(m[id]||m.default||[{who:X.who,text:"Eh... ¿y eso qué tiene que ver conmigo?"}], invMenu);
    return true;
  }
  return false;
}
