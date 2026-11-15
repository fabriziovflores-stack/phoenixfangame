/* =====================================================================
   MI MÚSICA: el jugador elige canciones de su propio dispositivo.
   Quedan guardadas solo en su navegador (IndexedDB): no se suben a ningún lado.
   ===================================================================== */
const MUS_SLOTS=[["corte","Juicio"],["interrogatorio","Testimonios e interrogatorios"],["persecucion","Cuando el caso se da vuelta"],["espera","Sala de espera"],["victoria","Victoria"]];
const LOCALMUS={}, LOCALMUS_NAME={};
let musDB=null;
function musStore(mode){ try{ return musDB ? musDB.transaction("pistas",mode).objectStore("pistas") : null; }catch(e){ return null; } }
function musSet(k,v){
  if(LOCALMUS[k]) URL.revokeObjectURL(LOCALMUS[k]);
  if(v){ LOCALMUS[k]=URL.createObjectURL(v.blob); LOCALMUS_NAME[k]=v.name; } else { delete LOCALMUS[k]; delete LOCALMUS_NAME[k]; }
}
function musRestart(k){ if(curTrack===k){ curTrack=null; music(k); } }
function musSave(k,file){
  musSet(k,{blob:file,name:file.name});
  const st=musStore("readwrite"); try{ st&&st.put({blob:file,name:file.name},k); }catch(e){}
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
    <p>Elige canciones de tu teléfono para cada momento del juicio. Quedan guardadas <b>solo en este navegador</b>: no se suben a ningún lado.</p>`+
    MUS_SLOTS.map(([k,t])=>`<div class="mrow"><div class="mtx"><b>${t}</b><small>${LOCALMUS_NAME[k]?"♪ "+esc(LOCALMUS_NAME[k]):"Melodía del juego"}</small></div>
      <label class="mbtn">Elegir<input type="file" accept="audio/*" data-k="${k}"></label>${LOCALMUS_NAME[k]?`<button class="mbtn del" data-del="${k}">Quitar</button>`:""}</div>`).join("")+
    `<button class="gold" id="musClose">Listo</button>`;
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
