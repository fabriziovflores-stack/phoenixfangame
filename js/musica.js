/* =====================================================================
   MI MÚSICA: el jugador elige canciones de su propio dispositivo.
   Quedan guardadas solo en su navegador (IndexedDB): no se suben a ningún lado.
   ===================================================================== */
const MUS_SLOTS=[["corte","Juicio"],["interrogatorio","Testimonios e interrogatorios"],["allegro","Contrainterrogatorios tensos"],["logica","Deducciones"],["objecion","Después de una objeción acertada"],["persecucion","Cuando el caso se da vuelta"],["verdad","Cuando sale la verdad (Telling the Truth)"],["espera","Sala de espera"],["suspenso","Suspenso"],["detencion","Centro de detención"],["victoria","Victoria"]];
/* Efectos de sonido que el jugador puede reemplazar: [clave guardada, efecto del juego, nombre visible] */
const SFX_SLOTS=[["sfx_dano1","damage","Daño (pierdes vida)"],["sfx_dano2","hit","Golpe (alguien queda contra las cuerdas)"],
  ["sfx_prueba","ding","Prueba nueva"],["sfx_recuerdo","flashback","Recuerdo (cinemáticas)"],["sfx_revelacion","realize","Revelación (nueva lectura de una prueba)"],
  ["sfx_golpe","slam","Golpe en la mesa"],["sfx_badum","badum","Golpe dramático"],["sfx_error","whoops","Error"],["sfx_grito","breakdown","Grito del culpable"],
  ["sfx_lugar","","Llegada a un lugar (tecleo de fecha y lugar)"],
  ["sfx_blipm","","Voz de los diálogos: blip masculino"],["sfx_blipf","","Voz de los diálogos: blip femenino"],
  ["sfx_objecion","objection","«¡Objeción!» (con el globo)"],["sfx_testimonio","testimony","Letrero de «Testimonio»"]];
SFX_SLOTS.filter(([,fx])=>fx).forEach(([k,fx])=>{ const orig=SFX[fx]; SFX[fx]=function(...a){
  const file = LOCALMUS[k] || (typeof SFX_FILES!=="undefined" && SFX_FILES[fx]);     // 1º el del jugador, 2º el del juego
  if(file){ try{ const s=new Audio(file); s.volume=.9; s.muted=muted;
    s.addEventListener("error",()=>orig.apply(this,a)); s.play().catch(()=>{}); }catch(e){ orig.apply(this,a); } return; }
  return orig.apply(this,a); }; });
const LOCALMUS={}, LOCALMUS_NAME={};
let musDB=null, musMsg="";
function musStore(mode){ try{ return musDB ? musDB.transaction("pistas",mode).objectStore("pistas") : null; }catch(e){ return null; } }
function musSet(k,v){
  if(LOCALMUS[k]) URL.revokeObjectURL(LOCALMUS[k]);
  if(v){ LOCALMUS[k]=URL.createObjectURL(v.blob); LOCALMUS_NAME[k]=v.name; } else { delete LOCALMUS[k]; delete LOCALMUS_NAME[k]; }
  if(typeof LOCALBLIP!=="undefined") delete LOCALBLIP[k];          // si cambió un blip, se vuelve a cargar
}
function musRestart(k){ if(curTrack===k){ curTrack=null; music(k); } }
function musSave(k,file){
  musSet(k,{blob:file,name:file.name});
  let ok=false; const st=musStore("readwrite"); try{ if(st){ st.put({blob:file,name:file.name},k); ok=true; } }catch(e){}
  musMsg = ok ? "✓ «"+file.name+"» quedó guardada." : "✓ «"+file.name+"» suena en esta partida, pero este navegador no deja guardarla para la próxima.";
  musRestart(k); renderMus();
}
function musDel(k){
  musSet(k,null);
  const st=musStore("readwrite"); try{ st&&st.delete(k); }catch(e){}
  musRestart(k); renderMus();
}
function renderMus(){
  const p=$("musPanel"); if(p.style.display!=="flex") return;
  p.innerHTML=`<h2>🎵 Mi música</h2>
    <p>Elige canciones y sonidos de tu teléfono para cada momento del juicio. Quedan guardadas <b>solo en este navegador</b>: no se suben a ningún lado.</p>`+
    MUS_SLOTS.concat([["",""]],SFX_SLOTS.map(([k,,t])=>[k,t])).map(([k,t])=> !k ? `<h3>🔊 Efectos de sonido</h3>` : `<div class="mrow"><div class="mtx"><b>${t}</b><small>${LOCALMUS_NAME[k]?"♪ "+esc(LOCALMUS_NAME[k]):(k.startsWith("sfx_")?"Sonido del juego":"Melodía del juego")}</small></div>
      <label class="mbtn">Elegir<input type="file" accept=".mp3,.m4a,.aac,.wav,.ogg,audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/wav" data-k="${k}"></label>${LOCALMUS_NAME[k]?`<button class="mbtn del" data-del="${k}">Quitar</button>`:""}</div>`).join("")+
    (musMsg?`<div class="mok">${esc(musMsg)}</div>`:"")+`<button class="gold" id="musClose">Listo</button>`;
  p.querySelectorAll("input[type=file]").forEach(i=>i.onchange=()=>{ if(i.files&&i.files[0]) musSave(i.dataset.k,i.files[0]); });
  p.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>musDel(b.dataset.del));
  $("musClose").onclick=()=>{ p.style.display="none"; };
}
$("musBtn").onclick=()=>{ $("musPanel").style.display="flex"; renderMus(); };
/* cargar lo guardado antes */
try{
  const r=indexedDB.open("actacero_musica",1);
  r.onupgradeneeded=()=>r.result.createObjectStore("pistas");
  r.onsuccess=()=>{ musDB=r.result; const st=musStore("readonly"); if(!st) return;
    const c=st.openCursor(); c.onsuccess=()=>{ const cur=c.result; if(!cur){ renderMus(); return; } musSet(cur.key,cur.value); cur.continue(); }; };
  r.onerror=()=>{};
}catch(e){}
