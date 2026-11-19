// Convierte casos/casoN.js en un guion legible (Markdown). Uso: node herramientas/guion_md.js caso1 > docs/caso1-guion-actual.md
const fs=require("fs"); global.CASOS={};
const id=process.argv[2]||"caso1"; eval(fs.readFileSync("casos/caso1.js","utf8")); if(id!=="caso1") eval(fs.readFileSync("casos/"+id+".js","utf8"));
const c=CASOS[id], out=[]; c.OBJ_REASONS=c.OBJ_REASONS||CASOS.caso1.OBJ_REASONS; c.WRONG=c.WRONG||CASOS.caso1.WRONG; c.EVX=c.EVX||{}; c.PROFILES=c.PROFILES||[]; const P=s=>out.push(s);
const N=w=>w===null||w===undefined?"NARRACIÓN":({ines:"JUSTO",testigo:"LLAVÍN",fiscal:"PENNA"}[w]||(c.CHARS[w]?c.CHARS[w].name.toUpperCase():w.toUpperCase()));
const limpia=t=>(t||"").replace(/\[r\](.*?)\[\/r\]/g,"**$1**").replace(/\[(p|s|f)\]/g,"").replace(/\[(m|a)=[a-z0-9]+\]/g,"");
const nombreEv=i=>(c.EVX[i]||c.EVIDENCE.find(e=>e.id===i)||{name:i}).name;
const linea=l=>{
  if(l.cmd) return cmd(l);
  let extra=[];
  if(l.bubble) extra.push(l.bubble==="objecion"?(l.who==="ines"?"¡OBJECIÓN!":"¡PROTESTO!"):l.bubble==="momento"?"¡UN MOMENTO!":"¡MIRE ESTO!");
  if(l.anim==="slam") extra.push("golpe en la mesa");
  if(l.evidence) extra.push("entra al expediente: "+nombreEv(l.evidence)); if(l.flag) extra.push("marca: "+[].concat(l.flag).join(", ")); if(l.meet) extra.push("perfil nuevo: "+l.meet);
  if(l.show) extra.push("muestra: "+nombreEv(l.show));
  if(l.read) extra.push("lectura nueva de "+nombreEv(l.read[0]));
  if(l.music!==undefined) extra.push("música: "+(l.music||"silencio"));
  if(l.zoom) extra.push("zoom"); if(l.auto) extra.push("pasa sola");
  if(l.damage) extra.push("pierde credibilidad");
  P(`**${N(l.who)}:** ${limpia(l.text)}${extra.length?" *["+extra.join("; ")+"]*":""}  `);
};
const lineas=ls=>(ls||[]).forEach(linea);
function cmd(s){
  switch(s.cmd){
    case "music": P(`\n*[Música: ${s.track||"silencio"}]*\n`); break;
    case "cine": P(`\n*Cinemática: ${limpia(s.text)}*\n`); break;
    case "card": P(`\n# ${s.t1} — ${s.t2}\n`); break;
    case "location": P(`\n## ${s.text.replace(/\n/g," — ")}\n`); break;
    case "gavel": P(`\n*[Mazo]*\n`); break;
    case "negro": P(`\n*[Fundido a negro]*\n`); break;
    case "verdict": P(`\n## VEREDICTO: ${s.text}\n`); break;
    case "breakdown": P(`\n*[Derrumbe de ${N(s.who)}]*\n`); break;
    case "end": P(`\n**FIN DEL CASO**`); break;
    case "cross": { const d=c.CROSS[s.ref]; P(`\n### TESTIMONIO Y CONTRAINTERROGATORIO: ${d.title}  _(música: ${d.music})_\n`);
      if(d.pressOnce) P(`_Presionar dos veces la misma declaración quita credibilidad._\n`);
      if(d.tutorial){ P(`_Antes de empezar:_  `); lineas(d.tutorial); }
      d.statements.forEach((st,i)=>{ P(`\n**Declaración ${i+1}${st.hidden?" (aparece después de la contradicción)":""}:** ${limpia(st.text)}\n`);
        P(`*Si se presiona:*  `); lineas(st.press);
        if(st.contra){ P(`\n✅ **Contradicción: presentar ${[].concat(st.contra).map(nombreEv).join(" o ")}**${st.requiere?" _(solo después de la declaración anterior)_":""}  `); lineas(st.contraLines); }
        if(st.ends) P(`\n_(Presionar esta declaración cierra el testimonio.)_`); });
      if(d.loopHint){ P(`\n*Pista si das la vuelta completa:*  `); lineas(d.loopHint); }
      if(d.firstWrong){ P(`\n*Primer error (no cuesta):*  `); lineas(d.firstWrong); }
      P(""); break; }
    case "direct": { const d=c.DIRECT[s.ref]; P(`\n### INTERROGATORIO DE PENNA: ${d.title}\n`); lineas(d.tutorial);
      d.questions.forEach((q,i)=>{ P(`\n**Pregunta ${i+1}:** ${limpia(q.text)}\n`);
        if(q.bad){ P(`✅ **Objetar: ${(c.OBJ_REASONS.find(r=>r.id===q.bad)||{}).t}**  `); lineas(q.ok); P(`*Si la deja pasar:*  `); lineas(q.a); lineas(q.miss); }
        else { P(`*Se deja pasar:*  `); lineas(q.a); } });
      P(`\n*Al terminar:*  `); lineas(d.end); P(""); break; }
    case "choice": P(`\n### DECISIÓN: ${limpia(s.text)}\n`);
      s.options.forEach(o=>{ P(`- ${o.ok?"✅ ":""}${o.t}${o.pierde?" (si se elige, se pierde el juicio)":""}`); if(o.w){ P(`  *Si se elige:*  `); lineas(o.w); } });
      P(`\n*Respuesta correcta:*  `); lineas(s.ok); P(""); break;
    case "present": P(`\n### PRESENTAR: ${limpia(s.text)} → ✅ ${[].concat(s.answer).map(nombreEv).join(" o ")}\n`); if(s.wrong){ P(`*Si presenta otra:*  `); lineas(s.wrong); } P(`*Si presenta la correcta:*  `); lineas(s.ok); break;
    case "senalar": P(`\n### TOCAR EN EL PLANO: ${s.ayuda}\n`); (s.zonas||[]).forEach(z=>{ P(`*Si toca otro lugar:*  `); lineas(z.wrong); }); P(`*Fuera de las zonas:*  `); lineas(s.wrong); P(`✅ **Correcto: la bodega.**\n`); break;
    case "invest": { const d=c.INV[s.ref], req=r=>{ if(!r) return ""; const a=[]; if(r.flags) a.push("marcas: "+[].concat(r.flags).join(", ")); if(r.ev) a.push("pruebas: "+[].concat(r.ev).map(nombreEv).join(", ")); if(r.not) a.push("sin: "+[].concat(r.not).join(", ")); return a.length?" _(se abre con "+a.join("; ")+")_":""; };
      P(`\n## INVESTIGACIÓN (${s.ref})${d.fecha?" — "+d.fecha:""}\n`);
      if(d.done) P(`_Termina cuando tienes: ${[].concat(d.done.ev||[]).map(nombreEv).join(", ")}${d.done.flags?"; y las marcas "+d.done.flags.join(", "):""}._\n`);
      Object.entries(d.places).forEach(([id,pl])=>{
        P(`\n### LUGAR: ${pl.name||id}${req(pl.req)}\n`); if(pl.moves) P(`_Desde aquí se puede ir a: ${pl.moves.map(m=>(d.places[m]&&d.places[m].name)||m).join(", ")}_\n`);
        if(pl.enter){ P(`*Al llegar la primera vez:*  `); lineas(pl.enter); }
        (pl.people||[]).forEach(pp=>{ P(`\n*Persona: ${N(pp.who)}*${req(pp.req)}  `); if(pp.hello){ P(`*Al verla por primera vez:*  `); lineas(pp.hello); } if(pp.back){ P(`*Al volver:*  `); lineas(pp.back); } });
        (pl.examine||[]).forEach(e=>{ P(`\n**🔍 Examinar: ${e.t||e.id}**${req(e.req)}  `); lineas(e.lines); if(e.again){ P(`*Si lo vuelve a examinar:*  `); lineas(e.again); } });
        (pl.talk||[]).forEach(t=>{ P(`\n**💬 Hablar con ${N(t.who)}: ${t.t}**${req(t.req)}  `);
          if(t.silence){ const si=t.silence; P(`*🔒 Silencio (hay que romperlo presentando pruebas):*  `); lineas(si.closed); lineas(si.intro);
            (si.steps||[]).forEach((st,k)=>{ P(`*Paso ${k+1}: ${limpia(st.prompt||"")} → ✅ ${[].concat(st.answer).map(nombreEv).join(" o ")}*  `); lineas(st.ok); });
            if(si.wrong){ P(`*Si falla:*  `); lineas(si.wrong); } if(si.broken){ P(`*Al romperlo:*  `); lineas(si.broken); } }
          lineas(t.lines); });
        if(pl.present) Object.entries(pl.present).forEach(([who,m])=>Object.entries(m).forEach(([ev,ls])=>{ P(`\n**📁 Presentar a ${N(who)}: ${ev==="default"?"cualquier otra cosa":nombreEv(ev)}**  `); lineas(ls); }));
      });
      if(d.hints){ P(`\n*💭 Pistas de «Pensar»:*  `); Object.entries(d.hints).forEach(([k,v])=>P(`- ${nombreEv(k)}: ${limpia(v)}`)); }
      if(d.end){ P(`\n*Al terminar la investigación:*  `); lineas(d.end); }
      P(""); break; }
    case "reacciones": P(`\n*[Se ve a cada uno, sorprendido: ${s.list.map(x=>N(x[0])).join(", ")}]*\n`); break;
    default: P(`*[${s.cmd}]*`);
  }
}
P(`# ACTA CERO — ${c.titulo} (guion tal como está en el juego)\n**Contiene todas las respuestas.**\n`);
P(`## Expediente (fichas)\n`);
c.EVIDENCE.concat(Object.values(c.EVX)).forEach(e=>P(`- **${e.name}**${e.tipo||e.origen?" ("+[e.tipo,e.origen].filter(Boolean).join(" · ")+")":""}: ${(e.desc||"").replace(/\n/g," / ")}`));
P(`\n## Perfiles\n`); c.PROFILES.forEach(p=>P(`- **${p.name}:** ${p.desc}`));
P(`\n---\n`); c.SCRIPT.forEach(linea);
P(`\n---\n## Si presentas una prueba equivocada (sale una al azar)\n`); c.WRONG.forEach((w,i)=>{ P(`*Versión ${i+1}:*  `); lineas(w); });
console.log(out.join("\n"));
