/* Calidad de imagen: «NDS» (256×192, píxeles marcados, como la DS) o «HD» (el doble de resolución, con los dibujos
   originales). Se elige en la portada y queda guardada en el navegador. En HD las imágenes salen de assets/hd/. */
const HD_DISPONIBLE = false;   // POST-PROYECTO: la versión HD está lista pero guardada; true = vuelven los botones de la portada
const HD = HD_DISPONIBLE && (()=>{ try{ return localStorage.getItem("actacero_hd")==="1"; }catch(e){ return false; } })();
document.documentElement.classList.toggle("hd", HD);
function hdSrc(p){
  if(!HD || typeof p!=="string") return p;
  if(/^assets\/(fondos|muebles|cine)\//.test(p) || p==="assets/pruebas/foto2324-grande.png") return "assets/hd/"+p.slice(7);
  return p;
}
/* =====================================================================
   REGISTRO DE CASOS
   Cada archivo de casos/ se registra en CASOS. Al elegir un caso, useCase() copia
   sus datos a estas variables, que son las que usa el motor.
   ===================================================================== */
const CASOS = {};
let CASO_ID=null, FISCAL_PRESS=null, CHARS, EVIDENCE, EV0, EVIMG, EVX, PROFILES, WRONG, CROSS, OBJ_REASONS, DIRECT, DIRECT_LINES, SCRIPT, INV, BGLABELS;
function useCase(id){
  const c=CASOS[id]||CASOS.caso1; CASO_ID=CASOS[id]?id:"caso1";
  if(c.EV0===undefined) c.EV0=c.EVIDENCE.length;
  CHARS=c.CHARS; EVIDENCE=c.EVIDENCE; EV0=c.EV0; EVIMG=c.EVIMG||{}; EVX=c.EVX||{}; PROFILES=c.PROFILES||[];
  WRONG=c.WRONG||CASOS.caso1.WRONG; CROSS=c.CROSS||{}; DIRECT=c.DIRECT||{}; SCRIPT=c.SCRIPT; INV=c.INV||{};
  OBJ_REASONS=c.OBJ_REASONS||CASOS.caso1.OBJ_REASONS; DIRECT_LINES=c.DIRECT_LINES||CASOS.caso1.DIRECT_LINES;
  BGLABELS=c.BGLABELS||{}; FISCAL_PRESS=c.FISCAL_PRESS||null;
  return c;
}
