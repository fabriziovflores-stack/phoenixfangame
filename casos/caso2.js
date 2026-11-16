/* =====================================================================
   ACTA CERO — CASO 2: «DOS DISPAROS EN CERRO CONCEPCIÓN»
   ESQUELETO / BORRADOR: toda la estructura funciona, pero los textos son provisorios.
   Diseño completo (la verdad, pistas, giros): docs/caso2-diseno.md
   Mismo formato que el Caso 1, más INV (investigación) y {cmd:"card"} (tarjetas de día).
   ===================================================================== */
CASOS.caso2 = (()=>{

const CHARS = {
  ines:   {name:"Justo",          skin:"#f0c39d", hair:"#3b2416", suit:"#1f3a6b", accent:"#e6c34a", style:"long",  voice:820, pos:"defensa"},
  cote:   {name:"Coté",           skin:"#e9b48a", hair:"#8a3b1e", suit:"#c44f7a", accent:"#ffd1e0", style:"pony",  voice:1040,pos:"hospital"},
  fiscal: {name:"Fiscal Penna",   skin:"#f2cfac", hair:"#7a5230", suit:"#6b1d2a", accent:"#e2b23c", style:"slick", voice:300, pos:"fiscalia"},
  jueza:  {name:"Jueza",          skin:"#dba97f", hair:"#d9d9d9", suit:"#17171c", accent:"#f2f2f2", style:"bun",   voice:620, pos:"juez"},
  eduardo:{name:"Estuardo",       skin:"#d6a27a", hair:"#3a2e26", suit:"#c8a878", accent:"#b8502a", style:"messy", voice:360, pos:"estrado"},
  tadeo:  {name:"Tadeo",          skin:"#e2b48c", hair:"#2a2420", suit:"#3f6b52", accent:"#c8c8c8", style:"messy", voice:560, pos:"defensa",
           look:{eye:"#4a6a8a",outfit:"hoodie"}},
  malva:  {name:"Malva",          skin:"#efc6a2", hair:"#4a2a1e", suit:"#8a5a7a", accent:"#f4ecd8", style:"long",  voice:880, pos:"estrado",
           look:{eye:"#6a4a3a",outfit:"cardigan",fem:1}},
  rocky:  {name:"Rocky",          skin:"#c48a62", hair:"#1a1a1a", suit:"#3a4a5a", accent:"#d84a2a", style:"messy", voice:260, pos:"estrado",
           look:{eye:"#3a2a1a",outfit:"hoodie"}},
  aurelio:{name:"Aurelio",        skin:"#e8c0a0", hair:"#e0e0e0", suit:"#6a5a3a", accent:"#a08050", style:"slick", voice:700, pos:"estrado",
           look:{eye:"#5a5a5a",outfit:"cardigan"}},
  barbara:{name:"Bárbara",        skin:"#f2d2b8", hair:"#1a1410", suit:"#2a2a3a", accent:"#d0b060", style:"long",  voice:760, pos:"estrado",
           look:{eye:"#3a4a3a",outfit:"blazer",fem:1}},
};
/* Lugares sin fondo dibujado todavía: se ve un cartel provisorio con este nombre */
const BGLABELS = {oficina:"OFICINA DE JUSTO", hospital:"HOSPITAL VAN BUREN", locutorio:"LOCUTORIO · COMISARÍA",
  casona:"CASONA FERRADA", pieza:"PIEZA DE TADEO", aurelio:"CASA DE AURELIO", comisaria:"COMISARÍA",
  taller:"TALLER DE ROCKY", oficinahostal:"OFICINA DEL HOSPEDAJE"};

const EVIDENCE = [
  {id:"credencial", icon:"🪪", name:"Credencial", desc:"Credencial de defensor penal público. Ya tiene un caso ganado.", read:"Mi segundo caso."},
];
const EVIMG = {credencial:"assets/pruebas/credencial.png"};
const EVX = {
  pistola:   {id:"pistola",   icon:"🔫", name:"Pistola 9 mm", desc:"Encontrada en la mochila de Tadeo. Disparada una vez. Sin huellas: alguien la limpió.", read:"El arma del crimen."},
  autopsia:  {id:"autopsia",  icon:"📄", name:"Informe de autopsia", desc:"Leonel Ferrada, 61. Roce de bala en la mejilla izquierda, de frente. Bala 9 mm en la nuca, disparada por la espalda. Muerte instantánea.", read:"Dos heridas, dos direcciones."},
  bala38:    {id:"bala38",    icon:"🔩", name:"Bala .38", desc:"Incrustada en el marco de la puerta de entrada. Calibre .38, de revólver. No es la bala que mató.", read:"El disparo de Rocky."},
  plano:     {id:"plano",     icon:"🗺️", name:"Plano de la casona", desc:"Plano de evacuación. La entrada da a un pasillo oscuro. La cocina está a la derecha, sin vista al pasillo. La pieza de Tadeo, al fondo, no tiene ventana a la calle.", read:"Quién podía ver qué."},
  video:     {id:"video",     icon:"📹", name:"Video cámara municipal", desc:"Calle Templeman. 23:15: sale un taxi desde la casona. 23:42: camioneta roja baja a toda velocidad.", read:"La huida de Rocky."},
  fotocam:   {id:"fotocam",   icon:"🚙", name:"Foto de la camioneta", desc:"Camioneta roja de Rocky Saavedra, incautada. En el parabrisas hay un soporte vacío.", read:"El vehículo del atropello."},
  taza:      {id:"taza",      icon:"🍵", name:"Taza de té", desc:"En el velador de Tadeo. Restos de té. «El té de bienvenida», según Malva.", read:"Un té."},
  pastillas: {id:"pastillas", icon:"💊", name:"Pastillas para el mareo", desc:"Mareamina suave. Falta una. Producen algo de sueño, no un sueño profundo.", read:"Por qué Tadeo durmió."},
  fotomadre: {id:"fotomadre", icon:"🖼️", name:"Foto de una mujer", desc:"Foto antigua de una mujer joven en Puerto Williams. Al reverso: «Leo y yo, 2002».", read:"Tadeo no quiere hablar de ella."},
  agenda:    {id:"agenda",    icon:"📔", name:"Agenda del notario", desc:"Notaría Valdés. 15 de marzo, 9:00: «L. Ferrada — modificar testamento — reconocimiento de hijo».", read:"Leonel iba a cambiar su testamento."},
  carta:     {id:"carta",     icon:"✉️", name:"Carta de la madre", desc:"«Tadeo: busca a Leonel Ferrada, en Valparaíso. Es tu padre. Perdóname por no decírtelo antes.»", read:"Tadeo vino a conocer a su padre."},
  polvora:   {id:"polvora",   icon:"🧪", name:"Examen de pólvora", desc:"Residuos de disparo en las manos de Tadeo: negativo.", read:"Tadeo no disparó... o se lavó."},
  sangre:    {id:"sangre",    icon:"🩸", name:"Examen de sangre", desc:"Sangre de Tadeo al momento de la detención: clonazepam en dosis alta. No es el remedio para el mareo.", read:"A Tadeo lo durmieron."},
  inscripcion:{id:"inscripcion",icon:"📋", name:"Inscripción del arma", desc:"Registro de armas: pistola 9 mm, inscrita en 2015 a nombre de Leonel Ferrada.", read:"La pistola era de la víctima."},
  tarjeta:   {id:"tarjeta",   icon:"💾", name:"Tarjeta de la cámara", desc:"Cámara del tablero de Rocky. 23:41: un fogonazo en la puerta y, dos segundos después, otro dentro del pasillo, a espaldas de Leonel. Silueta de pelo largo, con delantal.", read:"Hubo un segundo tirador adentro."},
  receta:    {id:"receta",    icon:"🧾", name:"Receta de clonazepam", desc:"Receta médica a nombre de Malva Ferrada. El frasco, en el baño de la casona, está casi vacío.", read:"El clonazepam era de Malva."},
  contrato:  {id:"contrato",  icon:"📑", name:"Contrato de adelanto", desc:"Malva Ferrada recibió 40 millones de la cadena hotelera como adelanto por la venta de la casona. Firmado solo por ella.", read:"Malva vendió lo que no era suyo."},
  boleta:    {id:"boleta",    icon:"🧾", name:"Boleta del taxi", desc:"Taxi de la casona al plan: 23:14 a 23:31. Vuelta a las 00:28.", read:"Bárbara no estaba en la casona."},
};
const PROFILES = [
  {id:"ines",   who:"ines",   name:"Justo Valdivia",   desc:"Defensor penal público. Su segundo caso. Sin Coté."},
  {id:"cote",   who:"cote",   name:"Coté Pino",        desc:"Procuradora. En el hospital con la pierna fracturada: la atropellaron la noche del crimen."},
  {id:"tadeo",  who:"tadeo",  name:"Tadeo Fuegos",     desc:"El acusado. 23 años, de Puerto Williams. Mochilero. Rapado, gorro de lana."},
  {id:"leonel", icon:"🕯️",    name:"Leonel Ferrada",   desc:"La víctima. 61 años. Dueño de la Casona Ferrada. Prestaba plata a interés."},
  {id:"eduardo",who:"eduardo",name:"Eduardo Estuardo", desc:"Investigador policial a cargo del caso. Ahora anda con huincha de medir."},
  {id:"fiscal", who:"fiscal", name:"Máximo Penna",     desc:"Fiscal. Dieciocho juicios, diecisiete condenas."},
  {id:"jueza",  who:"jueza",  name:"Prudencia Fallo",  desc:"Jueza. Exige prueba para cada afirmación."},
  {id:"malva",  who:"malva",  name:"Malva Ferrada",    desc:"Hija de la víctima. Administra el hospedaje. Amable, siempre con delantal.", hidden:true},
  {id:"barbara",who:"barbara",name:"Bárbara Plusvalía",desc:"Representante de una cadena hotelera. Quería comprar la casona.", hidden:true},
  {id:"aurelio",who:"aurelio",name:"Aurelio Mirón",    desc:"Vecino de enfrente. 70 años. Binoculares.", hidden:true},
  {id:"rocky",  who:"rocky",  name:"Rodrigo «Rocky» Saavedra", desc:"Mecánico. Le debía plata a Leonel. Disparó y huyó. Atropelló a Coté.", hidden:true},
];

/* ---------- INVESTIGACIÓN (formato en js/investigacion.js) ---------- */
const INV = {
  dia1: {
    start:"locutorio", music:"espera",
    done:{ev:["pistola","autopsia","bala38","plano","video","fotocam","taza","pastillas","fotomadre"], flags:["vio_aurelio"]},
    end:[{who:"ines",mood:"think",text:"(Ya tengo bastante. Mañana es el juicio.)"},
         {who:"ines",mood:"down",text:"(Coté sabría qué preguntar. Hoy tengo que saberlo yo.)"}],
    places:{
      locutorio:{name:"Locutorio de la comisaría", moves:["casona","comisaria"],
        people:[{who:"tadeo"}],
        enter:[{who:"tadeo",mood:"sweat",meet:"tadeo",text:"...¿Usted es el abogado? Me dijeron que venía uno."},
               {who:"ines",text:"Justo Valdivia, defensor público. Vengo a escucharte."}],
        talk:[
          {id:"noche", who:"tadeo", t:"Esa noche", lines:[
            {who:"tadeo",text:"Me tomé la pastilla del mareo y me dormí. Desperté con un carabinero encima."},
            {who:"tadeo",mood:"shock",evidence:"pistola",text:"Dicen que en mi mochila había una pistola. ¡Yo nunca he tenido una!"},
            {who:"ines",mood:"think",text:"(Una 9 mm, disparada y limpia. Alguien la puso ahí.)"}]},
          {id:"viaje", who:"tadeo", t:"¿Qué hacías en Valparaíso?", lines:[
            {who:"tadeo",text:"Vengo de Puerto Williams. Tres días de ferry y bus."},
            {who:"tadeo",mood:"sweat",text:"Quería... conocer. Nada más."},
            {who:"ines",mood:"think",text:"(Está ocultando algo.)"}]},
          {id:"madre", who:"tadeo", t:"La foto de la mochila", req:{ev:["fotomadre"]},
           silence:{req:{flags:["juicio1"]},
             closed:[{who:"tadeo",mood:"down",text:"...Eso no tiene nada que ver. No quiero hablar de ella."},
                     {who:"ines",mood:"sweat",text:"(Se cerró. 🔒 Todavía no tengo cómo hacerlo hablar.)"}]},
           lines:[{who:"tadeo",text:"(Este tema ya se habló.)"}]},
        ],
        present:{tadeo:{
          pistola:[{who:"tadeo",mood:"sweat",text:"Nunca la había visto. Se lo juro."}],
          taza:[{who:"tadeo",text:"El té de la señora Malva. Muy rico. Después dormí como nunca."}],
          default:[{who:"tadeo",text:"No sé qué es eso, abogado."}]}}},
      casona:{name:"Casona Ferrada — entrada", moves:["pieza","aurelio","comisaria","locutorio"],
        people:[{who:"eduardo"},{who:"malva",req:{flags:["pasar"]}},{who:"barbara",req:{flags:["pasar"]}}],
        enter:[{who:"eduardo",mood:"serious",text:"Alto ahí, Valdivia. Escena del crimen. No pasa nadie."}],
        examine:[
          {id:"marco", t:"El marco de la puerta", req:{flags:["pasar"]}, lines:[
            {who:"ines",mood:"think",evidence:"bala38",text:"(Una bala incrustada en el marco. Calibre .38, de revólver.)"},
            {who:"eduardo",text:"La del mecánico. Esa no mató a nadie: solo le rozó la cara."}]},
          {id:"pasillo", t:"El pasillo oscuro", req:{flags:["pasar"]}, lines:[
            {who:"ines",mood:"think",text:"(Justo detrás de la puerta. Oscuro aunque haya luz afuera.)"}]},
        ],
        talk:[
          {id:"pasar", who:"eduardo", t:"Dejarme pasar", lines:[
            {who:"ines",text:"La defensa tiene derecho a ver la escena y la carpeta de investigación."},
            {who:"eduardo",mood:"sweat",flag:"pasar",text:"...Ya, ya. Pero no toque nada. Esta vez medí todo."}]},
          {id:"carpeta", who:"eduardo", t:"La carpeta", req:{flags:["pasar"]}, lines:[
            {who:"eduardo",evidence:"autopsia",text:"La autopsia. Dos heridas."},
            {who:"eduardo",evidence:"video",text:"El video de la cámara municipal. La camioneta del mecánico, huyendo."},
            {who:"eduardo",mood:"down",evidence:"fotocam",text:"Y la camioneta. La misma que... bueno. Lo de su amiga. Lo siento."}]},
          {id:"m_noche", who:"malva", t:"Esa noche", lines:[
            {who:"malva",mood:"sweat",meet:"malva",text:"Yo estaba en la cocina, lavando las tazas del té. Sentí los disparos..."},
            {who:"ines",mood:"think",text:"(Tiene una curita en la mano.)"},
            {who:"malva",text:"¿Esto? Me corté con el cuchillo del pan. Qué torpe."}]},
          {id:"m_papa", who:"malva", t:"Su padre", lines:[
            {who:"malva",mood:"down",text:"Era duro, pero bueno. Y odiaba las armas, abogado. Nunca tuvo una."}]},
          {id:"b_quien", who:"barbara", t:"¿Quién es usted?", lines:[
            {who:"barbara",meet:"barbara",text:"Bárbara Plusvalía. Cadena Hoteles Mirador del Pacífico."},
            {who:"barbara",mood:"smug",text:"Discutí con el señor Ferrada en la cena, sí. No quería vender. Ahora... ya veremos."}]},
        ],
        present:{
          malva:{pistola:[{who:"malva",mood:"shock",text:"¡Qué horror! Le digo que mi papá odiaba las armas."}]},
          eduardo:{default:[{who:"eduardo",text:"No me muestre cosas, Valdivia. Yo soy de la fiscalía."}]}}},
      pieza:{name:"Pieza de Tadeo", req:{flags:["pasar"]}, moves:["casona"],
        examine:[
          {id:"plano", t:"Plano de evacuación", lines:[{who:"ines",mood:"think",evidence:"plano",text:"(El plano de la casa. Esta pieza no tiene ventana a la calle.)"}]},
          {id:"taza", t:"Taza en el velador", lines:[{who:"ines",mood:"think",evidence:"taza",text:"(Una taza con restos de té.)"}]},
          {id:"pastillas", t:"Caja de pastillas", lines:[{who:"ines",mood:"think",evidence:"pastillas",text:"(Pastillas para el mareo. Suaves. Falta una.)"}]},
          {id:"mochila", t:"La mochila", lines:[
            {who:"ines",mood:"think",evidence:"fotomadre",text:"(Una foto vieja en el bolsillo. «Leo y yo, 2002».)"}]},
        ]},
      aurelio:{name:"Casa de Aurelio Mirón", moves:["casona"],
        people:[{who:"aurelio"}],
        enter:[{who:"aurelio",meet:"aurelio",text:"¡Un abogado! Pase, pase. Desde aquí se ve todo, ¿ve? Con binoculares."}],
        talk:[
          {id:"a_vio", who:"aurelio", t:"¿Qué vio esa noche?", lines:[
            {who:"aurelio",flag:"vio_aurelio",text:"La camioneta roja. El fogonazo en la puerta. ¡Y otro! Casi juntos."},
            {who:"aurelio",mood:"smug",text:"Lo demás lo cuento en el juicio. Me citaron, ¿sabe?"}]},
        ]},
      comisaria:{name:"Comisaría", moves:["locutorio","casona"],
        people:[{who:"fiscal"}],
        talk:[
          {id:"p_caso", who:"fiscal", t:"El caso", lines:[
            {who:"fiscal",mood:"smug",pose:"cafe",text:"Arma en su mochila, víctima en la puerta. No me haga perder el tiempo, Valdivia."}]},
        ]},
    }},

  dia3: {
    start:"locutorio", music:"espera",
    done:{ev:["carta","polvora","sangre","inscripcion","tarjeta","receta","contrato","boleta"]},
    end:[{who:"ines",mood:"serious",text:"(Ya sé quién fue. Ahora tengo que demostrarlo.)"}],
    places:{
      locutorio:{name:"Locutorio de la comisaría", moves:["comisaria","casona"],
        people:[{who:"tadeo"}],
        enter:[{who:"tadeo",mood:"down",text:"...Ahora todos saben. Ya no importa."}],
        talk:[
          {id:"madre3", who:"tadeo", t:"Tu madre y Leonel",
           silence:{
             intro:[{who:"tadeo",mood:"down",text:"No tengo nada que decir."},
                    {who:"ines",mood:"serious",text:"(🔒🔒 Tengo que mostrarle que ya sé la verdad.)"}],
             steps:[
               {prompt:"¿Quién es la mujer de la foto?", answer:"fotomadre", ok:[
                 {who:"ines",text:"«Leo y yo, 2002». Leo es Leonel. Y esta mujer es tu mamá."},
                 {who:"tadeo",mood:"shock",anim:"hit",text:"...¿Cómo...?"}]},
               {prompt:"¿Qué iba a hacer Leonel al día siguiente?", answer:"agenda", ok:[
                 {who:"ines",text:"Te reconoció. Al día siguiente iba al notario a cambiar el testamento. Por ti."},
                 {who:"tadeo",mood:"cry",text:"..."}]}],
             wrong:[{who:"tadeo",mood:"angry",text:"¿Y eso qué? Váyase."},
                    {who:"ines",mood:"shock",anim:"hit",damage:true,text:"(Me equivoqué. Se cerró más.)"}],
             broken:[{who:"tadeo",mood:"cry",text:"Mi mamá me dejó una carta. Vine a conocerlo. Él me reconoció por la foto."},
                     {who:"tadeo",mood:"cry",evidence:"carta",text:"Me dijo «mañana arreglamos todo, hijo». Fue la única vez que me dijo hijo."},
                     {who:"ines",mood:"down",text:"(Lo conoció un día. Y esa misma noche se lo mataron.)"}]},
           lines:[{who:"tadeo",text:"Ya le conté todo, abogado."}]},
        ]},
      comisaria:{name:"Comisaría", moves:["locutorio","casona","taller"],
        people:[{who:"eduardo"},{who:"rocky"}],
        talk:[
          {id:"informes", who:"eduardo", t:"Informes nuevos", lines:[
            {who:"eduardo",evidence:"polvora",text:"Pólvora en las manos del cabro: negativo."},
            {who:"eduardo",evidence:"sangre",text:"Y en la sangre... clonazepam. Harto. No es el remedio del mareo."},
            {who:"eduardo",mood:"sweat",text:"El fiscal dice que se lavó y se drogó solo. A mí... no me cuadra."}]},
          {id:"arma", who:"eduardo", t:"La pistola", lines:[
            {who:"eduardo",mood:"write",evidence:"inscripcion",text:"La busqué en el registro. Inscrita en 2015... a nombre de Leonel Ferrada."},
            {who:"ines",mood:"shock",text:"(¿«Odiaba las armas»?)"}]},
          {id:"r_noche", who:"rocky", t:"Esa noche", lines:[
            {who:"rocky",mood:"angry",meet:"rocky",text:"¡Yo no lo maté! Le disparé pa' asustarlo y el viejo me disparó de vuelta."},
            {who:"rocky",mood:"down",text:"Y la cabra de la esquina... no la vi. Le juro que no la vi."}]},
        ],
        present:{
          rocky:{fotocam:[
            {who:"ines",text:"Su camioneta tiene un soporte vacío en el parabrisas. ¿Dónde está la cámara?"},
            {who:"rocky",mood:"sweat",text:"...En el taller. La escondí. Me graba disparando."},
            {who:"rocky",mood:"down",flag:"taller",text:"Pero si sirve pa' algo... la llave está en mi chaqueta."}],
            default:[{who:"rocky",mood:"angry",text:"¿Y eso qué, abogado?"}]},
          eduardo:{default:[{who:"eduardo",text:"Ya le di todo lo que podía, Valdivia."}]}}},
      taller:{name:"Taller de Rocky", req:{flags:["taller"]}, moves:["comisaria"],
        examine:[
          {id:"cajon", t:"El cajón de herramientas", lines:[
            {who:"ines",mood:"think",evidence:"tarjeta",text:"(La cámara del tablero. Con su tarjeta.)"},
            {who:"ines",mood:"shock",anim:"hit",text:"(23:41... un fogonazo en la puerta. Y otro, dos segundos después, dentro del pasillo.)"},
            {who:"ines",mood:"serious",text:"(Una silueta de pelo largo. Con delantal.)"}]},
        ]},
      casona:{name:"Casona Ferrada", moves:["oficinahostal","comisaria","locutorio"],
        people:[{who:"malva"},{who:"barbara"}],
        examine:[
          {id:"bano", t:"El baño", req:{ev:["sangre"]}, lines:[
            {who:"ines",mood:"shock",evidence:"receta",text:"(Un frasco de clonazepam casi vacío. Receta a nombre de... Malva Ferrada.)"}]},
        ],
        talk:[
          {id:"b_noche", who:"barbara", t:"¿Dónde estaba esa noche?", lines:[
            {who:"barbara",mood:"smug",evidence:"boleta",text:"En un bar del plan. Aquí está la boleta del taxi. Salí 23:14, volví 00:28."},
            {who:"barbara",text:"Pregúntele mejor a Malva por los 40 millones que le adelantamos."}]},
          {id:"m_hoy", who:"malva", t:"¿Cómo está?", lines:[
            {who:"malva",mood:"down",text:"Cansada. ¿Le sirvo un tecito, abogado?"},
            {who:"ines",mood:"sweat",text:"(No, gracias.)"}]},
        ]},
      oficinahostal:{name:"Oficina del hospedaje", moves:["casona"],
        examine:[
          {id:"contrato", t:"Carpetas del escritorio", lines:[
            {who:"ines",mood:"think",evidence:"contrato",text:"(Un contrato: 40 millones de adelanto por la casona. Firmado solo por Malva.)"}]},
          {id:"cajonvacio", t:"Cajón con llave", lines:[
            {who:"ines",mood:"think",text:"(Forzado. Vacío. Aquí cabría justo una pistola.)"}]},
        ]},
    }},
};

/* ---------- CONTRAINTERROGATORIOS ---------- */
const CROSS = {
  e1: {who:"eduardo", title:"La escena del crimen", music:"interrogatorio",
    loopHint:[{who:"ines",mood:"think",text:"(¿Qué dice exactamente la autopsia sobre las heridas?)"}],
    statements:[
      {id:"a", text:"Llegamos a las 23:52. La señorita Malva nos esperaba en la puerta, llorando.",
       press:[{who:"ines",text:"¿Quién llamó?"},{who:"eduardo",text:"Ella misma. A las 23:44."}]},
      {id:"b", text:"El señor Ferrada estaba en el suelo, junto a la puerta abierta.",
       press:[{who:"ines",text:"¿Boca arriba o boca abajo?"},{who:"eduardo",mood:"write",text:"Boca abajo. Lo anoté. Y lo medí."}]},
      {id:"c", text:"Los dos disparos le llegaron de frente, desde la puerta.", contra:"autopsia",
       press:[{who:"ines",text:"¿Los dos?"},{who:"eduardo",mood:"sweat",text:"Eh... eso entendí."}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"La autopsia dice otra cosa: la bala que lo mató entró por la nuca."},
        {who:"ines",mood:"serious",text:"Uno de frente, desde la puerta. [r]El otro, por la espalda[/r]: desde adentro de la casa."},
        {who:"fiscal",mood:"smug",pose:"cafe",text:"Exacto, colega. Desde adentro. Donde dormía su cliente."},
        {who:"ines",mood:"sweat",text:"(...Me la devolvió.)"}]},
      {id:"d", text:"La pistola estaba en la mochila del acusado. Disparada y limpia.",
       press:[{who:"ines",text:"¿Limpia?"},{who:"eduardo",text:"Sin una huella. Ni siquiera las del acusado."},
              {who:"ines",mood:"think",text:"(¿Quién limpia un arma y la deja en su propia mochila?)"}]},
    ]},
  a1: {who:"aurelio", title:"Lo que vi con mis binoculares", music:"interrogatorio",
    loopHint:[{who:"ines",mood:"think",text:"(¿Desde la casa de enfrente se puede ver la pieza del fondo? Revisa el plano.)"}],
    statements:[
      {id:"a", mood:"smug", text:"Yo miro la calle todas las noches. Por seguridad, ah.",
       press:[{who:"ines",text:"¿Todas las noches?"},{who:"aurelio",mood:"smug",text:"Y algunas tardes."}]},
      {id:"b", text:"Vi la camioneta roja y el fogonazo en la puerta.",
       press:[{who:"ines",text:"¿Un fogonazo?"},{who:"aurelio",text:"Uno en la puerta. Y otro más adentro, casi al tiro."}]},
      {id:"c", text:"Y después vi al de la mochila en la ventana de su pieza, con algo en la mano.", contra:"plano",
       press:[{who:"ines",text:"¿Qué tenía en la mano?"},{who:"aurelio",text:"Algo oscuro. Brillante. ¡Una pistola, pues!"}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"Señor Mirón, la pieza de Tadeo [r]no tiene ventana a la calle[/r]."},
        {who:"aurelio",mood:"shock",anim:"hit",text:"¿No? ¿Y entonces qué vi?"},
        {who:"aurelio",mood:"sweat",text:"Bueno... vi algo en el pasillo. Una melena. Larga. Moviéndose."},
        {who:"ines",mood:"think",text:"(¿Una melena?)"}]},
    ]},
  m1: {who:"malva", title:"Lo que vi desde la cocina", music:"interrogatorio",
    loopHint:[{who:"ines",mood:"think",text:"(¿Desde la cocina se ve el pasillo? Revisa el plano.)"}],
    statements:[
      {id:"a", text:"Yo estaba en la cocina, lavando las tazas del té.",
       press:[{who:"ines",text:"¿Las tazas del té?"},{who:"malva",mood:"smile",text:"Siempre les doy un té de bienvenida a los huéspedes."}]},
      {id:"b", text:"Sentí dos disparos, casi juntos.",
       press:[{who:"ines",text:"¿Casi juntos?"},{who:"malva",mood:"sweat",text:"Uno, y al tiro el otro."}]},
      {id:"c", text:"Me asomé y vi a Tadeo corriendo por el pasillo hacia su pieza.", contra:"plano",
       press:[{who:"ines",text:"¿Lo vio bien?"},{who:"malva",mood:"down",text:"Como lo estoy viendo a usted."}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"Según el plano, [r]la cocina no tiene vista al pasillo[/r]."},
        {who:"malva",mood:"shock",anim:"hit",text:"Yo... estaba nerviosa. Me habré confundido."}]},
      {id:"d", text:"Después llamé a Carabineros. Fue horrible.",
       press:[{who:"ines",text:"¿A qué hora?"},{who:"malva",text:"A las 23:44. Lo tengo en el teléfono."}]},
    ]},
  r1: {who:"rocky", title:"El viejo me disparó", music:"interrogatorio",
    loopHint:[{who:"ines",mood:"think",text:"(La cámara de su tablero lo grabó todo.)"}],
    statements:[
      {id:"a", mood:"angry", text:"Fui a hablar con el viejo. Nada más.",
       press:[{who:"ines",text:"¿Con un revólver?"},{who:"rocky",mood:"sweat",text:"...Pa' que me tomara en serio."}]},
      {id:"b", text:"Saqué el fierro pa' asustarlo. Se me escapó un tiro.",
       press:[{who:"ines",text:"¿Se le escapó?"},{who:"rocky",mood:"down",text:"Le rocé la cara. No quería."}]},
      {id:"c", mood:"angry", text:"¡Y el viejo me disparó de vuelta! Por eso arranqué.", contra:"tarjeta",
       press:[{who:"ines",text:"¿Lo vio disparar?"},{who:"rocky",text:"Vi el fogonazo detrás de él. ¿Quién más iba a ser?"}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"Su propia cámara lo grabó. El segundo fogonazo salió [r]del pasillo[/r]."},
        {who:"ines",mood:"serious",text:"A espaldas del señor Ferrada. Nadie le disparó a usted: le dispararon a él."},
        {who:"rocky",mood:"shock",anim:"hit",text:"...Entonces yo no lo maté."},
        {who:"fiscal",mood:"sweat",text:"Una silueta de pelo largo. Con... delantal."}]},
    ]},
  m2: {who:"malva", title:"Mi padre odiaba las armas", music:"persecucion",
    loopHint:[{who:"ines",mood:"think",text:"(Revisa todo lo que encontré ayer.)"}],
    statements:[
      {id:"a", mood:"sweat", text:"Mi papá odiaba las armas. Nunca tuvo una.", contra:"inscripcion",
       press:[{who:"ines",text:"¿Nunca?"},{who:"malva",text:"Nunca. Se lo juro."}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"La pistola del crimen está [r]inscrita a nombre de Leonel Ferrada[/r] desde 2015."},
        {who:"malva",mood:"shock",anim:"hit",text:"¡Eso... eso no lo sabía!"}]},
    ]},
  m3: {who:"malva", title:"Esa noche dormían todos", music:"persecucion",
    loopHint:[{who:"ines",mood:"think",text:"(¿Qué tenía Tadeo en la sangre? ¿Y de quién era?)"}],
    statements:[
      {id:"a", text:"Tadeo se tomó su pastilla del mareo y se durmió temprano.", contra:"receta",
       press:[{who:"ines",text:"¿Solo la pastilla?"},{who:"malva",mood:"smile",text:"Y mi té. Un té no le hace mal a nadie."}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"En su sangre había [r]clonazepam[/r]. Y el frasco del baño tiene receta a su nombre."},
        {who:"malva",mood:"shock",anim:"hit",text:"..."}]},
    ]},
  m4: {who:"malva", title:"Cualquiera tiene el pelo largo", music:"persecucion",
    loopHint:[{who:"ines",mood:"think",text:"(¿Dónde estaba Bárbara a las 23:41?)"}],
    statements:[
      {id:"b", mood:"angry", text:"¡La silueta del video puede ser cualquiera! ¡La señora Plusvalía tiene el pelo largo!", contra:"boleta",
       press:[{who:"ines",text:"¿La señora Plusvalía?"},{who:"malva",mood:"angry",text:"¡Ella quería la casa más que nadie!"}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"La señora Plusvalía salió en taxi a las 23:14 y volvió a las 00:28."},
        {who:"ines",mood:"serious",text:"Y la cámara municipal la grabó saliendo. A las 23:41 no estaba en la casona."}]},
    ]},
};

/* ---------- Guion ---------- */
const SCRIPT = [
  // ===== CINEMÁTICA (imágenes pendientes: por ahora pantalla negra con texto) =====
  {cmd:"music", track:null},
  {cmd:"cine", img:null, text:"14 de marzo. Cerro Concepción. 23:40."},
  {cmd:"cine", img:null, text:"Una discusión. Un arma."},
  {cmd:"cine", img:null, sfx:"hit", flash:true, text:"El primer disparo."},
  {cmd:"cine", img:null, sfx:"hit", flash:true, shake:true, text:"...y un segundo disparo. Desde atrás."},
  {cmd:"cine", img:null, text:"23:42. Una camioneta huye cerro abajo."},
  {cmd:"cine", img:null, sfx:"thud", shake:true, text:"Y en la esquina de Templeman..."},
  {cmd:"cine", img:null, text:"A la mañana siguiente, ya había un culpable. Venía del fin del mundo."},
  // ===== PARTE 1 =====
  {cmd:"card", t1:"— Día 1 —", t2:"Investigación"},
  {cmd:"location", text:"15 de marzo · 2:10\nOficina de Justo", pos:"oficina"},
  {who:"ines",pos:"oficina",mood:"sweat",text:"(El teléfono. A esta hora.)"},
  {who:"ines",pos:"oficina",mood:"shock",anim:"hit",text:"¿Coté? ¿Atropellada? ¡Voy para allá!"},
  {cmd:"location", text:"Hospital Van Buren", pos:"hospital"},
  {who:"cote",pos:"hospital",mood:"sweat",text:"Tranquilo. Pierna quebrada, nada más. Ya me puse la anestesia de chiste."},
  {who:"ines",pos:"hospital",mood:"down",text:"Coté..."},
  {who:"cote",pos:"hospital",mood:"serious",text:"Mira la tele. Detuvieron a un mochilero por un asesinato. A dos cuadras de donde me pasó esto."},
  {who:"cote",pos:"hospital",mood:"serious",text:"Anda. Ese cabro no tiene a nadie. Y yo no puedo acompañarte."},
  {who:"ines",pos:"hospital",mood:"serious",text:"(Esta vez, solo.)"},
  {cmd:"invest", ref:"dia1"},
  // ===== PARTE 2: JUICIO =====
  {cmd:"card", t1:"— Día 2 —", t2:"Juicio"},
  {cmd:"music", track:null},
  {cmd:"gavel"},
  {cmd:"music", track:"corte"},
  {who:"jueza",mood:"gavel",text:"Se abre la audiencia. Causa contra Tadeo Fuegos, por homicidio."},
  {who:"fiscal",mood:"smug",pose:"cafe",text:"La fiscalía llama al investigador Eduardo Estuardo."},
  {cmd:"cross", ref:"e1"},
  {who:"jueza",mood:"think",text:"Dos tiradores, entonces. Uno afuera y otro adentro. Siguiente testigo."},
  {who:"aurelio",mood:"smug",text:"Aurelio Mirón. Vecino. Testigo ocular, como dicen en la tele."},
  {cmd:"cross", ref:"a1"},
  {cmd:"present", who:"jueza", mood:"think", tab:"perfiles", answer:"tadeo",
   text:"¿Una melena? Abogado, ¿adónde quiere llegar?",
   prompt:"Presenta a la persona que demuestra que esa melena no era de Tadeo.",
   ok:[{who:"ines",bubble:"mire",pose:"point",anim:"slam",text:"Mi representado está [r]rapado[/r], Su Señoría."},
       {who:"fiscal",mood:"sweat",text:"...Una melena larga. Como la de la señora Plusvalía, que discutió con la víctima."},
       {who:"jueza",mood:"confused",text:"Ahora tenemos otra sospechosa. Siguiente testigo."}]},
  {who:"malva",mood:"down",text:"Malva Ferrada. Hija de... de la víctima."},
  {cmd:"cross", ref:"m1"},
  {who:"jueza",mood:"think",text:"El testimonio se debilita. Fiscal, ¿algo más?"},
  {who:"fiscal",mood:"smug",pose:"cafe",text:"Sí, Su Señoría. Algo que el acusado no le contó a su propio abogado."},
  {who:"fiscal",pose:"point",evidence:"agenda",text:"Agenda del notario: Leonel Ferrada iba a cambiar su testamento para reconocer a un hijo."},
  {who:"fiscal",pose:"point",text:"Ese hijo es [r]el acusado[/r]. Vino a cobrar su herencia antes de tiempo."},
  {who:"tadeo",mood:"shock",anim:"hit",text:"¡No! ¡No fue así!"},
  {who:"ines",mood:"shock",anim:"hit",text:"(¿Su hijo...? ¡¿Por qué no me lo dijo?!)"},
  {who:"jueza",mood:"disappoint",text:"Me han dado dos tiradores, una melena y un hijo secreto. Y ninguna prueba de quién disparó."},
  {who:"jueza",mood:"serious",flag:"juicio1",text:"No estoy contenta. Se suspende la audiencia. Vuelvan con hechos."},
  // ===== PARTE 3 =====
  {cmd:"card", t1:"— Día 3 —", t2:"Investigación"},
  {cmd:"invest", ref:"dia3"},
  // ===== PARTE 4: JUICIO FINAL =====
  {cmd:"card", t1:"— Día 4 —", t2:"Juicio final"},
  {cmd:"music", track:"corte"},
  {who:"jueza",mood:"serious",text:"Se reanuda la audiencia. Espero que esta vez tengan hechos."},
  {who:"ines",mood:"serious",text:"La defensa llama a Rodrigo Saavedra."},
  {cmd:"cross", ref:"r1"},
  {who:"jueza",mood:"serious",text:"Que vuelva a declarar la señora Malva Ferrada."},
  {cmd:"cross", ref:"m2"},
  {cmd:"cross", ref:"m3"},
  {cmd:"cross", ref:"m4"},
  {cmd:"choice", who:"jueza", mood:"think", text:"Abogado: si fue ella, ¿por qué culpar al acusado y no al mecánico?",
   options:[
    {t:"Porque Tadeo estaba más cerca", w:[{who:"jueza",mood:"serious",text:"Eso es comodidad, no motivo."}]},
    {t:"Porque quien mata a su padre no puede heredarlo", ok:true},
    {t:"Porque odiaba a los mochileros", w:[{who:"fiscal",mood:"smug",text:"Colega, por favor."}]},
   ],
   ok:[{who:"ines",pose:"point",anim:"slam",text:"Código Civil: quien mata a la persona que hereda es [r]indigno de sucederla[/r]."},
       {who:"ines",mood:"serious",text:"Con Leonel muerto y Tadeo condenado por matarlo, la única heredera era ella."},
       {who:"fiscal",mood:"shock",text:"...Artículo 968. Es correcto."}]},
  {cmd:"present", who:"jueza", mood:"serious", tab:"pruebas", answer:"contrato",
   text:"¿Y por qué necesitaba la herencia con tanta urgencia?",
   prompt:"Presenta la prueba de por qué Malva no podía esperar.",
   ok:[{who:"ines",bubble:"mire",pose:"point",anim:"slam",text:"Porque ya había vendido la casona. Cobró 40 millones de adelanto."},
       {who:"ines",mood:"serious",text:"Si su padre cambiaba el testamento al día siguiente, perdía todo. Y debía todo."},
       {who:"malva",mood:"angry",text:"¡Él me iba a dejar sin nada por un cabro que conoció ayer!"}]},
  {cmd:"breakdown", who:"malva"},
  {who:"fiscal",mood:"serious",text:"La fiscalía retira los cargos contra el señor Fuegos. Y formalizará a Malva Ferrada."},
  {who:"jueza",mood:"smile",text:"Ahora sí estoy contenta. Este tribunal declara al acusado, Tadeo Fuegos..."},
  {cmd:"verdict", text:"NO CULPABLE", good:true},
  {cmd:"music", track:"victoria"},
  // ===== FINAL =====
  {cmd:"location", text:"Hospital Van Buren", pos:"hospital"},
  {who:"cote",pos:"hospital",mood:"excited",text:"¡Ganaste! ¡Y sin mí! No sé si alegrarme o sentirme ofendida."},
  {who:"rocky",pos:"hospital",mood:"down",text:"Señorita... yo fui el de la camioneta. Vengo a pedirle perdón. Y a entregarme por lo suyo."},
  {who:"cote",pos:"hospital",mood:"serious",text:"...Gracias por venir. De verdad."},
  {who:"tadeo",pos:"hospital",mood:"down",text:"Abogado. Creo que me voy a quedar en Valparaíso. Es lo único que tengo de él."},
  {who:"ines",pos:"hospital",mood:"smile",text:"(Hoy también alguien se dio el trabajo de escuchar.)"},
  {who:null,pos:"hospital",text:"FIN DEL CASO 2 — «Dos disparos en Cerro Concepción». (BORRADOR)"},
  {cmd:"end"},
];

return {titulo:"Dos disparos en Cerro Concepción", numero:2,
  intro:"Dos disparos en la misma noche. Un mochilero dormido. Y Coté en el hospital: esta vez, Justo está solo. (Borrador jugable.)",
  CHARS, BGLABELS, EVIDENCE, EVIMG, EVX, PROFILES, INV, CROSS, SCRIPT};
})();
