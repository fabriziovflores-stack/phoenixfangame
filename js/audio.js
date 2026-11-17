/* =====================================================================
   PARTE 2: SONIDO (todo sintetizado, melodías originales)
   ===================================================================== */
let AC=null, master, musicG, sfxG, noiseBuf, muted=false, blipBuf=null, blipFBuf=null, blipWho=null;
const VOCES_FEM=new Set(["chayo","zoila","jueza","malva","barbara"]);     // usan el blip femenino
const LOCALBLIP={}, LOCALBLIP_PEND={};
function localBlip(k){                         // blip elegido por el jugador en «Mi música» (se decodifica una vez)
  if(LOCALBLIP[k]) return LOCALBLIP[k];
  const url=typeof LOCALMUS!=="undefined" && LOCALMUS[k];
  if(url && AC && !LOCALBLIP_PEND[k]){ LOCALBLIP_PEND[k]=1;
    fetch(url).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{ LOCALBLIP[k]=buf; }).catch(()=>{}).finally(()=>{ LOCALBLIP_PEND[k]=0; }); }
  return null;
}
function initAudio(){
  if(AC) return;
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  master=AC.createGain(); master.gain.value=.8; master.connect(AC.destination);
  musicG=AC.createGain(); musicG.gain.value=.55; musicG.connect(master);
  sfxG=AC.createGain(); sfxG.gain.value=.9; sfxG.connect(master);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);
  const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  if(typeof BLIP_FILE!=="undefined") fetch(BLIP_FILE).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{ blipBuf=buf; }).catch(()=>{});
  if(typeof BLIP_F_FILE!=="undefined") fetch(BLIP_F_FILE).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(buf=>{ blipFBuf=buf; }).catch(()=>{});
}
function osc(type,f,t,dur,g,dest,f2){
  if(!AC) return;
  const o=AC.createOscillator(), a=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  a.gain.setValueAtTime(0,t); a.gain.linearRampToValueAtTime(g,t+.005); a.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(a); a.connect(dest||sfxG); o.start(t); o.stop(t+dur+.02);
}
function noise(t,dur,g,type,freq,dest){
  if(!AC) return;
  const s=AC.createBufferSource(), f=AC.createBiquadFilter(), a=AC.createGain();
  s.buffer=noiseBuf; f.type=type||"lowpass"; f.frequency.value=freq||1000;
  a.gain.setValueAtTime(g,t); a.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f); f.connect(a); a.connect(dest||sfxG); s.start(t); s.stop(t+dur+.02);
}
const SFX = {
  blip(f){ if(!AC) return;                    // voz de los diálogos: el blip del dueño, con el tono de cada personaje
    const fem=VOCES_FEM.has(blipWho), propioF=fem && (localBlip("sfx_blipf") || blipFBuf), buf=propioF || localBlip("sfx_blipm") || blipBuf;
    if(buf){ const s=AC.createBufferSource(), g=AC.createGain(); s.buffer=buf;
      let r=Math.min(1.16,Math.max(1.0, 1.08*(1+((f||820)-820)/820*.08)));  /* un poco más agudo; casi igual para todos */
      if(propioF) r=1; else if(fem) r*=1.12;      /* el blip femenino suena tal cual; sin él, el masculino un poco más agudo */
      s.playbackRate.value=r; g.gain.value=.55; s.connect(g); g.connect(sfxG); s.start(); return; }
    osc("square",f,AC.currentTime,.035,.035); },
  type(){ if(!AC) return; osc("square",1400,AC.currentTime,.02,.03); },
  slam(){ if(!AC) return; const t=AC.currentTime; noise(t,.25,.9,"lowpass",500); osc("sine",140,t,.3,.7,null,40); },
  objection(){ if(!AC) return; const t=AC.currentTime; noise(t,.35,.5,"bandpass",1800); osc("sawtooth",220,t,.25,.2,null,880);
    [440,554,659,880].forEach((f,i)=>osc("square",f,t+.12,.5,.07)); },
  hold(){ if(!AC) return; const t=AC.currentTime; osc("square",660,t,.1,.1); osc("square",990,t+.09,.25,.1); noise(t,.15,.3,"highpass",2000); },
  hit(){ if(!AC) return; const t=AC.currentTime; osc("square",880,t,.08,.12,null,300); noise(t,.2,.5,"bandpass",900); },
  damage(){ if(!AC) return; const t=AC.currentTime; osc("sawtooth",500,t,.6,.2,null,60); noise(t,.4,.5,"lowpass",700); },
  flashback(){ if(!AC) return; const t=AC.currentTime; noise(t,.9,.3,"bandpass",2400); osc("sine",880,t,.9,.08,null,220); },
  realize(){ if(!AC) return; const t=AC.currentTime; osc("square",1320,t,.12,.1); osc("square",1760,t+.1,.3,.1); },
  badum(){ if(!AC) return; const t=AC.currentTime; osc("sine",110,t,.25,.6,null,70); osc("sine",82,t+.28,.5,.7,null,50); },
  whoops(){ if(!AC) return; const t=AC.currentTime; osc("square",520,t,.12,.08,null,380); osc("square",300,t+.12,.25,.08,null,180); },
  ding(){ if(!AC) return; const t=AC.currentTime; osc("sine",1320,t,.5,.15); osc("sine",1760,t+.08,.6,.12); },
  testimony(){ SFX.whoosh(); },
  whoosh(){ if(!AC) return; const t=AC.currentTime; noise(t,.5,.35,"bandpass",1200); },
  knock(){ if(!AC) return; const t=AC.currentTime; noise(t,.12,1,"lowpass",1400); osc("sine",220,t,.15,.6,null,90); },
  thud(){ if(!AC) return; const t=AC.currentTime; noise(t,.3,.9,"lowpass",300); osc("sine",90,t,.35,.8,null,40); },
  breakdown(){ if(!AC) return; const t=AC.currentTime; noise(t,1.6,.7,"bandpass",600); osc("sawtooth",900,t,1.5,.18,null,50); osc("square",450,t+.1,1.4,.1,null,30); },
};

/* música: cada símbolo es una corchea; "-" sostiene la nota; "." silencio */
const TRACKS = {
  espera:{bpm:92,
    lead:"F4 - A4 - C5 - A4 - | Bb4 - D5 - C5 - - - | A4 - C5 - F5 - E5 - | D5 - - - C5 - - - | F4 - A4 - C5 - A4 - | Bb4 - D5 - F5 - E5 - | D5 - C5 - Bb4 - G4 - | F4 - - - - - - -",
    bass:"F2 - - - C3 - - - | Bb2 - - - F2 - - - | F2 - - - A2 - - - | Bb2 - - - C3 - - - | F2 - - - C3 - - - | Bb2 - - - D3 - - - | Bb2 - - - C3 - - - | F2 - - - - - - -",
    drums:"k . h . s . h ."},
  corte:{bpm:104,
    lead:"D5 - - E5 F5 - - - | F5 - E5 - D5 - C5 - | E5 - - F5 G5 - - - | A5 - - - E5 - - - | D5 - - E5 F5 - A5 - | G5 - F5 - D5 - Bb4 - | C5 - D5 - E5 - G5 - | F5 - E5 - D5 - - -",
    bass:"D3 - A2 - D3 - A2 - | Bb2 - F2 - Bb2 - F2 - | C3 - G2 - C3 - G2 - | A2 - E2 - A2 - C#3 - | D3 - A2 - D3 - A2 - | Bb2 - F2 - Bb2 - F2 - | C3 - G2 - C3 - E3 - | A2 - E2 - A2 - - -",
    drums:"k . h . s . h h"},
  interrogatorio:{bpm:138,
    lead:"A4 - C5 - E5 - D5 C5 | D5 - C5 - A4 - - - | B4 - D5 - G5 - F5 E5 | E5 - - - G#4 - B4 - | A4 - C5 - E5 - A5 G5 | F5 - E5 - D5 - C5 - | D5 - E5 - F5 - E5 D5 | E5 - - - - - - -",
    bass:"A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 F2 F2 F3 F2 | G2 G2 G3 G2 G2 G2 G3 G2 | E2 E2 E3 E2 E2 E2 G#2 E2 | A2 A2 A3 A2 A2 A2 A3 A2 | F2 F2 F3 F2 F2 F2 F3 F2 | D2 D2 D3 D2 D2 D2 D3 D2 | E2 E2 E3 E2 E2 E2 E3 E2",
    drums:"k h s h k k s h"},
  persecucion:{bpm:168,
    lead:"E5 - B4 - E5 F#5 G5 - | G5 - F#5 - E5 - D5 - | F#5 - D5 - A4 - D5 F#5 | B5 - - - A5 - F#5 - | E5 - G5 - B5 - G5 E5 | C6 - B5 - G5 - E5 - | D5 - F#5 - A5 - F#5 D5 | B4 - D#5 - F#5 - B5 -",
    bass:"E2 E3 E2 E3 E2 E3 E2 E3 | C2 C3 C2 C3 C2 C3 C2 C3 | D2 D3 D2 D3 D2 D3 D2 D3 | B1 B2 B1 B2 B1 B2 B1 B2",
    drums:"x h s h x x s h"},
  victoria:{bpm:140,
    lead:"C5 - E5 - G5 - C6 - | B5 - G5 - A5 - - - | F5 - A5 - C6 - A5 - | G5 - - - - - - - | E5 - G5 - C6 - E6 - | D6 - B5 - C6 - A5 - | F5 - G5 - B5 - D6 - | C6 - - - - - - -",
    bass:"C3 - G2 - C3 - G2 - | E3 - C3 - F3 - C3 - | F2 - C3 - F2 - C3 - | G2 - D3 - G2 - B2 - | C3 - G2 - C3 - G2 - | G2 - D3 - A2 - E3 - | F2 - C3 - G2 - D3 - | C3 - G2 - C3 - - -",
    drums:"k h s h k h s h"},
};
const NOTE_IDX={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function freqOf(n){ const m=n.match(/^([A-G])(#|b)?(\d)$/); if(!m) return 0;
  let s=NOTE_IDX[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0); const midi=(+m[3]+1)*12+s; return 440*Math.pow(2,(midi-69)/12); }
function parseSeq(str){ return str.replace(/\|/g," ").trim().split(/\s+/); }
let curTrack=null, seq=null, stepI=0, nextT=0, musTimer=null;
/* Un solo reproductor para la música en archivo. Se «despierta» con el primer toque
   (los celulares no dejan sonar audio sin que el jugador toque la pantalla antes). */
const musicEl=new Audio(); musicEl.loop=true; musicEl.volume=.5;
let musicFile=null;
musicEl.addEventListener("error",()=>{ if(musicFile){ musicFile=null; if(curTrack) synth(curTrack); } });  // si falla el archivo, suena la melodía propia
function unlockMusic(){
  const n=800, b=new Uint8Array(44+n), v=new DataView(b.buffer), w=(o,s)=>[...s].forEach((c,i)=>b[o+i]=c.charCodeAt(0));
  w(0,"RIFF"); v.setUint32(4,36+n,true); w(8,"WAVEfmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,8000,true); v.setUint32(28,8000,true); v.setUint16(32,1,true); v.setUint16(34,8,true); w(36,"data"); v.setUint32(40,n,true); b.fill(128,44);
  if(musicFile) return;
  musicEl.src=URL.createObjectURL(new Blob([b],{type:"audio/wav"})); musicEl.play().then(()=>{ if(!musicFile) musicEl.pause(); }).catch(()=>{});
}
function music(name){
  if(curTrack===name) return;
  if(musTimer){ clearInterval(musTimer); musTimer=null; }
  musicEl.pause(); musicFile=null;
  curTrack=name; if(!name||!AC) return;
  const file=(typeof LOCALMUS!=="undefined" && LOCALMUS[name]) || (MUSICA_LOCAL && MUSIC_FILES[name]);   // música elegida por el jugador, o en archivo
  if(file){
    musicFile=file; musicEl.src=file; musicEl.muted=muted; musicEl.currentTime=0;
    musicEl.play().catch(()=>{});
    return;
  }
  synth(name);
}
function synth(name){
  const t=TRACKS[name]; seq={bpm:t.bpm, lead:parseSeq(t.lead), bass:parseSeq(t.bass), drums:t.drums.replace(/\s/g,"").split("")};
  stepI=0; nextT=AC.currentTime+.08; musTimer=setInterval(schedule,25);
}
function noteLen(arr,i){ let n=1; while(arr[(i+n)%arr.length]==="-"&&n<16) n++; return n; }
function schedule(){
  const sp=60/seq.bpm/2;
  while(nextT<AC.currentTime+.15){
    const L=seq.lead, B=seq.bass, D=seq.drums;
    const l=L[stepI%L.length], b=B[stepI%B.length], d=D[stepI%D.length];
    if(l!=="-"&&l!=="."){ const f=freqOf(l); if(f) osc("square",f,nextT,sp*noteLen(L,stepI%L.length)*.92,.045,musicG); }
    if(b!=="-"&&b!=="."){ const f=freqOf(b); if(f) osc("triangle",f,nextT,sp*noteLen(B,stepI%B.length)*.9,.17,musicG); }
    if(d==="k"||d==="x") osc("sine",130,nextT,.14,.5,musicG,40);
    if(d==="s"){ noise(nextT,.12,.25,"highpass",1500,musicG); }
    if(d==="h"||d==="x"){ noise(nextT,.04,.08,"highpass",7000,musicG); }
    stepI++; nextT+=sp;
  }
}

