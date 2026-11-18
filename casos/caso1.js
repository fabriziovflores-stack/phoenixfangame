/* =====================================================================
   ACTA CERO — Prototipo
   PARTE 1: CONTENIDO DEL CASO (personajes, expediente, guion).
   Puedes cambiar cualquier texto entre comillas sin tocar el motor.
   Marcas en los textos: [r]palabra[/r] = texto rojo (dato clave).
   Un texto que empieza con "(" es un pensamiento (se ve azul).
   ===================================================================== */

CASOS.caso1 = (()=>{
const CHARS = {
  ines:   {name:"Justo",          skin:"#f0c39d", hair:"#3b2416", suit:"#1f3a6b", accent:"#e6c34a", style:"long",  voice:820, pos:"defensa"},
  chayo:  {name:"Chayo",          skin:"#f0c8a8", hair:"#6a3a22", suit:"#9a2a38", accent:"#f2a0b0", style:"long",  voice:980, pos:"defensa"},
  tomas:  {name:"Tomás",         skin:"#d6a27a", hair:"#141414", suit:"#f2c200", accent:"#222222", style:"messy", voice:520, pos:"defensa"},
  fiscal: {name:"Fiscal Penna",skin:"#f2cfac", hair:"#7a5230", suit:"#6b1d2a", accent:"#e2b23c", style:"slick", voice:300, pos:"fiscalia"},
  testigo:{name:"Llavín",        skin:"#c99067", hair:"#9a9a9a", suit:"#3d4f6b", accent:"#2a3550", style:"cap",   voice:240, pos:"estrado"},
  zoila:  {name:"Zoila",         skin:"#e6b48e", hair:"#8a2f4a", suit:"#4f8fa8", accent:"#f2d15a", style:"bun",   voice:900, pos:"estrado"},
  eduardo:{name:"Estuardo",      skin:"#d6a27a", hair:"#3a2e26", suit:"#c8a878", accent:"#b8502a", style:"messy", voice:360, pos:"lobby"},
  jueza:  {name:"Jueza",         skin:"#dba97f", hair:"#d9d9d9", suit:"#17171c", accent:"#f2f2f2", style:"bun",   voice:620, pos:"juez"},
};

/* El expediente parte casi vacío: las pruebas se van agregando durante el caso.
   read = lectura inicial de la prueba (cambia durante el juicio). */
const EVIDENCE = [
  {id:"credencial", icon:"🪪", name:"Credencial", desc:"Credencial de defensor penal público. Tiene once días de uso.", read:"Prueba de que esto me está pasando de verdad."},
];
const EV0 = EVIDENCE.length;
/* Ilustraciones de las pruebas */
const EVIMG={boleta:"assets/pruebas/ferreteria.png",plano1:"assets/pruebas/plano-galeria.png",chatvecinal:"assets/pruebas/mensajes.png",fotozoila:"assets/pruebas/foto2324.png",parte:"assets/pruebas/parte.png",fibra:"assets/pruebas/f4.png",credencial:"assets/pruebas/credencial.png",ficha:"assets/pruebas/ficha.png",luz:"assets/pruebas/luz.png",bitacora:"assets/pruebas/bitacora.png",ventana:"assets/pruebas/ventana.png",visitas:"assets/pruebas/visitas.png",lona:"assets/pruebas/lona.png",llave:"assets/pruebas/llave.png"};
const EVX = {
  ficha:   {id:"ficha",   icon:"🖼️", name:"Ficha del cuadro", desc:"«La Sirena del Puerto», óleo sobre tela. 180 × 120 cm con marco de roble rígido. 22 kg. No se enrolla ni se desarma.", read:"Datos de catálogo del cuadro desaparecido."},
  luz:     {id:"luz",     icon:"⚡", name:"Aviso de corte", desc:"Aviso de la compañía eléctrica, pegado en todo Cerro Alegre tres días antes: corte programado el 3 de noviembre, de 23:10 a 00:05. Incluye el alumbrado público.", read:"Explica por qué la galería estaba a oscuras."},
  lona:    {id:"lona",    icon:"🟨", name:"Lona amarilla", desc:"Lona de 2 × 3 m que cubría las pinturas en el andamio de Tomás, frente a la galería. Desapareció la noche del 3 de noviembre.", read:"Era de Tomás. Eso no dice quién se la llevó."},
  visitas: {id:"visitas", icon:"📖", name:"Libro de visitas", desc:"Galería Mirador, 3 de noviembre: «18:10 — T. Pincheira (lavar brochas)». El libro anota entradas, no salidas.", read:"Tomás entró a las 18:10."},
  ventana: {id:"ventana", icon:"🪟", name:"Foto de la ventana", desc:"Única ventana de la sala principal, de 60 × 80 cm. Vidrio roto. La mayor parte de los fragmentos quedó afuera, sobre la vereda.", read:"Por aquí habría entrado y salido el ladrón."},
  bitacora:{id:"bitacora",icon:"📒", name:"Bitácora del guardia", desc:"Cuaderno de turno de Llavín, 3 de noviembre: «23:00 sala cerrada. 23:05 linterna sin pilas, pedir repuesto. 23:35 revisé sala, pasillo y bodega: falta la Sirena. 00:12 llegan pilas». Pegado en la tapa, un aviso de la administración: «Desde el 1 de diciembre opera la alarma nueva. Se suprime el turno de noche».", read:"El primer informe de lo ocurrido aquella noche."},
  plano1:  {id:"plano1",  icon:"🗺️", name:"Plano de la galería", desc:"Sala principal con una ventana (60 × 80 cm) y una puerta. Desde la sala, un pasillo lateral lleva a la bodega y a la salida de servicio.", read:"Hay otra ruta, sin usar la ventana."},
  informe: {id:"informe", icon:"📋", name:"Acta de inspección de bodega", desc:"Inspección ordenada por el tribunal el 24 de noviembre. «La Sirena del Puerto» estaba en la bodega, intacta, cubierta con una lona amarilla. El precinto policial seguía intacto.", read:"El cuadro nunca salió de la galería."},
  parte:   {id:"parte",   icon:"📻", name:"Parte de primera patrulla", desc:"Registro de Carabineros, 3 de noviembre. 23:33: la patrulla llega y encuentra al guardia, Custodio Llavín, en la entrada principal. Desde las 23:33 una carabinera custodia sin interrupción el único acceso al pasillo lateral y a la bodega, hasta precintarlo.", read:"Registro horario independiente de la intervención policial."},
};

const PROFILES = [
  {id:"ines",    who:"ines",   name:"Justo Valdivia", desc:"Defensor penal público, 27 años. Once días en el cargo. Hijo de taxista."},
  {id:"chayo",   who:"chayo",  name:"Rosario «Chayo» Catalán", desc:"Fotoperiodista. Curiosidad peligrosa, cámara más peligrosa todavía. Hace las preguntas que nadie hace."},
  {id:"tomas",   who:"tomas",  name:"Tomás Pincheira",desc:"El acusado. Muralista de 22 años. Pinta el muro exterior de la galería. Tiene una multa antigua por rayar."},
  {id:"fiscal",  who:"fiscal", name:"Máximo Penna",   desc:"Fiscal. Diecisiete juicios, diecisiete condenas. No soporta un cabo suelto."},
  {id:"jueza",   who:"jueza",  name:"Prudencia Fallo",desc:"Jueza. No deja pasar una frase sin su prueba. Se toma las palabras al pie de la letra."},
  {id:"zoila",   who:"zoila",  name:"Zoila Vecina",   desc:"Vive frente a la galería hace treinta años. Cuenta las cosas como las siente."},
  {id:"gerardo", who:"testigo",name:"Custodio Llavín",desc:"Guardia nocturno de la Galería Mirador hace doce años. Maneja la única llave de la sala principal."},
];

/* Cuando Justo presiona, Penna interviene (una de estas, por turno). Una declaración puede traer las suyas en `fiscal:[...]`. */
const FISCAL_PRESS = [
  [{who:"fiscal",bubble:"objecion",pose:"point",text:"¡Objeción! La defensa repite preguntas para ganar tiempo."},
   {who:"jueza",mood:"serious",text:"Ha lugar en parte. Abogado, vaya al punto."}],
  [{who:"fiscal",pose:"cafe",text:"*sorbo* Pregunte lo que quiera, Valdivia. La respuesta va a ser la misma."}],
  [{who:"fiscal",mood:"smug",text:"Diecisiete defensores presionaron así antes que usted. Pregúnteme cómo les fue."}],
  [{who:"fiscal",bubble:"objecion",pose:"point",text:"¡Objeción! El colega está hostigando al testigo."},
   {who:"jueza",text:"No ha lugar. Pero cuide el tono, abogado."},
   {who:"fiscal",pose:"bigote",text:"Mmm. Valía la pena intentarlo."}],
  [{who:"fiscal",mood:"proud",text:"En primer año enseñan a no preguntar sin saber la respuesta. ¿Faltó a esa clase?"},
   {who:"ines",mood:"sweat",text:"(Gracias por la clase gratis.)"}],
  [{who:"fiscal",pose:"tirar",text:"...Su Señoría, ¿esto va a durar mucho? Tengo otra audiencia a las doce."},
   {who:"jueza",mood:"serious",text:"Durará lo que tenga que durar, fiscal."}],
  [{who:"fiscal",mood:"smug",text:"Anote, Valdivia: «presionar» no es lo mismo que «tener razón»."}],
  [{who:"fiscal",pose:"cruzado",text:"El testigo ya respondió. Si no le gusta la respuesta, no es culpa de él."}],
];

const WRONG = [
  [{who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡Esta prueba contradice esa declaración!"},
   {who:"jueza",mood:"confused",text:"¿En qué punto, abogado?"},
   {who:"ines",mood:"sweat",text:"(...En ninguno, parece.)"},
   {who:"fiscal",mood:"smug",pose:"cafe",text:"Tómese su tiempo, colega. Yo cobro igual."},
   {who:"jueza",mood:"disappoint",damage:true,text:"Lo anoto como una objeción infundada."},
   {who:"ines",mood:"shock",anim:"hit",text:"(Cuidado. No me quedan tantas.)"}],
  [{who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡Su Señoría, mire esto!"},
   {who:"jueza",mood:"confused",text:"Lo estoy mirando. No veo la relación."},
   {who:"fiscal",mood:"smug",text:"Su Señoría, ¿podríamos dejar que el colega practique en su casa?"},
   {who:"jueza",mood:"disappoint",damage:true,text:"Objeción infundada."},
   {who:"ines",mood:"down",text:"(Releer. ¿Qué dijo exactamente? ¿Qué dice la prueba?)"}],
];

/* =====================================================================
   ACTA CERO — CASO 1: «LA SIRENA DEL PUERTO»  (guion del dueño, versión sin pruebas «milagrosas»)
   LA VERDAD: Llavín no robó para vender. Con el corte programado (23:10) tomó la lona del andamio de Tomás,
   abrió la sala con la única llave, envolvió el cuadro y lo llevó por el pasillo lateral a la bodega. Rompió
   la ventana desde adentro para fingir el robo. Pensaba «encontrar» el cuadro él mismo (en diciembre una
   alarma reemplazaba su turno). Una patrulla cercana llegó a las 23:33 y vigiló el pasillo hasta precintarlo:
   el cuadro quedó atrapado en la bodega. Anotó en su bitácora una revisión de la bodega a las 23:35 que no
   pudo ocurrir. Justo no adivina la autoría: demuestra que nada sitúa a Tomás en el robo.
   ===================================================================== */
const CROSS = {
  z1: {
    who:"zoila", title:"Lo que vi desde mi balcón", music:"interrogatorio",
    tutorial:[{who:"chayo",text:"(Puedes [r]presionar[/r] para saber más y [r]presentar[/r] una prueba cuando algo no cuadre.)"}],
    loopHint:[{who:"chayo",mood:"think",text:"(¿Un farol encendido? Revisa el aviso que te pasé esta mañana.)"}],
    statements:[
      {id:"a", mood:"smug", text:"Llevo treinta años mirando la galería. Se me escapa poco.",
       press:[{who:"ines",text:"¿Mira la galería incluso de noche?"},
              {who:"zoila",mood:"smug",text:"Si el barrio duerme, ¿quién vigila el chisme?"},
              {who:"ines",mood:"sweat",text:"(Por lo menos la vigilancia tiene vocación.)"}]},
      {id:"b", text:"Con el apagón salí al balcón. Mi teleserie quedó a medias.",
       press:[{who:"ines",mood:"think",text:"¿Se fue la luz de toda la calle?"},
              {who:"zoila",mood:"sweat",text:"Hasta el refrigerador se quedó callado. Terrible situación."}]},
      {id:"c", mood:"smile", sigue:true, revela:["d"], text:"Bajo el farol encendido vi clarito a Tomás con algo amarillo.",
       press:[{who:"ines",mood:"think",text:"¿Le vio el rostro?"},
              {who:"zoila",mood:"smug",text:"Le vi… lo suficiente. ¡Ese muchacho siempre anda con pintura!"}],
       fiscal:[{who:"fiscal",mood:"serious",text:"Señora, no le preguntaron qué ropa usa habitualmente. Limítese a aquella noche."}],
       contra:"luz",
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡Ese farol no estaba encendido!"},
        {who:"ines",pose:"papel",show:"luz",text:"El corte afectó incluso al alumbrado público desde las [r]23:10[/r]."},
        {who:"zoila",mood:"shock",anim:"hit",text:"¡Con razón la tele no prendía! ¡Le cambié las pilas al control!"},
        {who:"jueza",mood:"serious",text:"Entonces no reconoció su cara. ¿Qué vio realmente?"},
        {who:"zoila",mood:"sweat",text:"Una figura, algo amarillo… No sé quién era. Pensé en Tomás porque siempre está afuera."},
        {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Protesto! Un error de identificación no borra el objeto amarillo. Y la defensa aún debe explicar el robo."},
        {who:"ines",mood:"think",text:"(La testigo reconoció una costumbre, no una persona.)"},
       ]},
      {id:"d", hidden:true, ends:true, text:"Escuché el vidrio romperse y llamé a Carabineros.",
       press:[{who:"ines",text:"¿Vio quién rompió el vidrio?"},
              {who:"zoila",text:"No, mijito. Oí el estruendo. Eso sí que no se olvida."}]},
    ]
  },
  g1: {
    title:"El ladrón y la ventana", music:"interrogatorio",
    loopHint:[{who:"chayo",mood:"think",text:"(Si alguien rompe una ventana desde la calle, ¿hacia dónde caen los vidrios? Mira la foto.)"}],
    statements:[
      {id:"a", text:"Cerré la sala a las once. Yo guardaba la llave principal.",
       press:[{who:"ines",mood:"think",text:"¿Alguien más podía entrar a la sala?"},
              {who:"testigo",mood:"smug",text:"Con mi llave, no. Y no la suelto ni para tomar té."}],
       fiscal:[{who:"fiscal",mood:"serious",text:"Acceso exclusivo no demuestra autoría, pero sí permite entender cómo estaba custodiado el lugar."}]},
      {id:"b", text:"Cuando se cortó la luz, seguí en mi caseta. No vi nada hasta oír el golpe.",
       press:[{who:"ines",text:"¿Fue a revisar la sala?"},
              {who:"testigo",mood:"smug",text:"Por supuesto. Un guardia no está de adorno."}]},
      {id:"c", mood:"smug", sigue:true, revela:["d"], text:"El ladrón rompió la ventana desde la calle y entró por allí.",
       press:[{who:"ines",mood:"think",text:"¿Usted vio el golpe?"},
              {who:"testigo",mood:"smug",text:"No, pero el vidrio no se quiebra por aburrimiento."}],
       contra:"ventana",
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡El vidrio cayó hacia AFUERA de la galería!"},
        {who:"ines",pose:"papel",show:"ventana",read:["ventana","Rota desde adentro de la sala, no desde la calle."],text:"Los fragmentos terminaron sobre la vereda. El golpe vino desde dentro."},
        {who:null,text:"Lectura actualizada: Foto de la ventana."},
        {who:"testigo",mood:"shock",anim:"hit",text:"¡Entonces el ladrón rompió la ventana para huir! ¡Da lo mismo!"},
        {who:"fiscal",mood:"serious",text:"No se entusiasme, abogado. Un vidrio roto desde dentro puede ser parte del engaño. Falta descubrir para qué lo rompieron."},
        {who:"ines",mood:"think",text:"(La salida… ¿Cómo habría pasado con el cuadro?)"},
       ]},
      {id:"d", hidden:true, ends:true, mood:"angry", text:"Después vi a Tomás escapar por la ventana con el cuadro.",
       press:[{who:"ines",text:"¿Vio el cuadro salir?"},
              {who:"testigo",mood:"angry",text:"¡La ventana rota y el cuadro ausente! ¿Qué más quiere?"},
              {who:"fiscal",mood:"serious",text:"Una deducción del guardia no equivale a una observación. Pero la defensa tampoco ha demostrado la ruta verdadera."}]},
    ]
  },
  g2: {
    title:"Lo que vi dentro de la sala", music:"allegro",
    hintLoops:2,
    loopHint:[{who:"chayo",mood:"think",text:"(¿Con qué luz lo vio? Lee su bitácora entera, Justo. Hasta la última línea.)"}],
    statements:[
      {id:"a", text:"Entré al salón cuando oí el vidrio roto. Estaba muy oscuro.",
       press:[{who:"ines",mood:"think",text:"¿Podía distinguir a alguien?"},
              {who:"testigo",mood:"smug",text:"Por eso llevo una linterna. ¿Cree que soy nuevo en esto?"}]},
      {id:"b", mood:"smug", sigue:true, revela:["c","d"], text:"Alumbré a Tomás y le reconocí perfectamente la cara.",
       press:[{who:"ines",mood:"think",text:"¿Qué linterna?"},
              {who:"testigo",mood:"smug",text:"La de servicio. La llevo conmigo desde las diez."}],
       contra:"bitacora",
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡Su propia bitácora dice que la linterna no tenía pilas!"},
        {who:"ines",pose:"papel",show:"bitacora",read:["bitacora","Llavín no tenía linterna: sin pilas desde las 23:05 hasta las 00:12."],text:"A las [r]23:05[/r] anotó que estaban agotadas. Las nuevas llegaron a las [r]00:12[/r]."},
        {who:null,text:"Lectura actualizada: Bitácora del guardia."},
        {who:"testigo",mood:"sweat",text:"La memoria falla… quizá distinguí la silueta."},
        {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Protesto! La defensa ha desacreditado la identificación, pero no ha demostrado dónde estaba el cuadro."},
        {who:"jueza",mood:"serious",text:"La identificación de Tomás no es fiable. Veamos qué queda de los hechos."},
       ]},
      {id:"c", hidden:true, text:"El cuadro había desaparecido y encontré la ventana rota.",
       press:[{who:"ines",text:"¿Revisó todo el edificio antes de decir que faltaba?"},
              {who:"testigo",mood:"angry",text:"Revisé lo necesario. ¡Doce años llevo cuidando este lugar!"}]},
      {id:"d", hidden:true, ends:true, mood:"smug", text:"Revisé incluso la bodega. Estaba vacía. Lo escribí a las 23:35.",
       press:[{who:"ines",mood:"think",text:"¿Puede explicar en qué orden revisó el recinto?"},
              {who:"testigo",mood:"smug",text:"Sala, pasillo, bodega. ¡Como siempre!"},
              {who:"fiscal",mood:"serious",text:"El orden es relevante. Si la defensa duda, que lo confronte con hechos comprobables."}]},
    ]
  },
  g3: {
    title:"La ronda de las 23:35", music:"allegro",
    pressOnce:true,
    tutorial:[
      {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Una presión más fuera de lugar y solicitaré que lo amonesten, Valdivia!"},
      {who:"jueza",mood:"serious",text:"Puede preguntar sobre hechos nuevos. Repetir una pregunta ya respondida sí tendrá consecuencias."},
      {who:"chayo",mood:"serious",text:"(Puedes [r]presionar cada declaración una vez[/r] sin riesgo. Si la repites, pierdes un punto de credibilidad. Presentar pruebas no tiene ese límite.)"}],
    hintLoops:2,
    loopHint:[{who:"chayo",mood:"think",text:"(¿Quién vigilaba el pasillo desde que llegó la patrulla? Lee el parte de Carabineros.)"}],
    statements:[
      {id:"a", text:"Después de oír el vidrio, fui directo a la sala y comprobé el daño.",
       press:[{who:"ines",text:"¿Fue allí primero?"},
              {who:"testigo",text:"Sí, señor. Esa era mi obligación."}]},
      {id:"b", mood:"angry", sigue:true, revela:["c","d"], text:"A las 23:35 revisé personalmente la bodega. No había ningún cuadro.",
       press:[{who:"ines",mood:"think",text:"¿Está seguro de la hora?"},
              {who:"testigo",mood:"angry",text:"¡La anoté en mi libro, no me la inventé!"}],
       contra:"parte",
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"¡No pudo entrar a esa bodega a las 23:35!"},
        {who:"ines",pose:"papel",show:"parte",text:"Carabineros lo vio en la entrada principal a las [r]23:33[/r]. Desde entonces [r]custodió el único acceso[/r] a la bodega sin interrupciones."},
        {who:"testigo",mood:"shock",anim:"hit",text:"¡Entonces me equivoqué de minuto! ¡Pude revisar antes!"},
        {who:"fiscal",bubble:"objecion",pose:"point",music:"suspenso",text:"¡Protesto! Una hora equivocada no convierte automáticamente al guardia en ladrón."},
        {who:"ines",mood:"serious",text:"No he dicho que lo convierta. Digo que su revisión, tal como la declaró, jamás ocurrió."},
        {who:"testigo",mood:"angry",text:"¡Yo sé lo que vi! ¡Doce años sin perder una obra!"},
        {who:"fiscal",mood:"serious",text:"¡No confunda una ronda falsa con una coartada para Tomás! Si cree que la acusación no se sostiene, tendrá que fundamentarlo."},
       ]},
      {id:"c", hidden:true, text:"Cuando llegó la patrulla, me quedé en la entrada principal.",
       press:[{who:"ines",text:"¿Vio quién custodió el pasillo?"},
              {who:"testigo",text:"Una carabinera. No dejó pasar a nadie."}]},
      {id:"d", hidden:true, ends:true, mood:"sweat", text:"Si la obra estaba en la bodega, Tomás debió haberla escondido antes.",
       press:[{who:"ines",text:"¿Lo vio entrar a la bodega?"},
              {who:"testigo",mood:"sweat",text:"No… pero estaba su lona. Eso lo dice todo."},
              {who:"fiscal",mood:"serious",text:"Eso es una hipótesis, Llavín. No una identificación. La Fiscalía debe demostrar más."}]},
    ]
  },
};

/* ---------- Interrogatorio directo: la fiscalía pregunta, la defensa objeta ----------
   Motivos para objetar (el jugador elige uno). Puedes cambiar los textos de "t".     */
const OBJ_REASONS = [
  {id:"sugiere", t:"Le sopla la respuesta al testigo"},
  {id:"supone",  t:"Da por hecho algo que no está probado"},
  {id:"ajena",   t:"No tiene que ver con el caso"},
];
/* Cada pregunta: who/mood/pose/text = la pregunta.  a = respuesta del testigo.
   bad = id del motivo si la pregunta es tramposa (si no, se deja pasar).
   ok = qué pasa al objetar bien (reformular y responder).
   miss = pista si el jugador deja pasar una pregunta tramposa (la pregunta se repite, sin castigo).
   noObj = comentario extra si el jugador objeta una pregunta correcta.                 */
const DIRECT = {};   // este caso no tiene interrogatorio directo de Penna
/* Respuestas generales del interrogatorio directo (se usan en cualquier interrogatorio) */
const DIRECT_LINES = {
  wrongReason:[
    {who:"jueza",mood:"confused",text:"¿Ese es su fundamento, abogado? No es lo que tiene de malo la pregunta."},
    {who:"jueza",mood:"disappoint",damage:true,text:"No ha lugar."},
    {who:"ines",mood:"sweat",text:"(La pregunta sí tenía algo raro. Pero no era eso.)"}],
  noReason:[
    {who:"jueza",mood:"disappoint",damage:true,text:"No ha lugar. La pregunta es correcta."},
    {who:"fiscal",mood:"smug",pose:"cafe",text:"Si va a objetar todo, avíseme y pido otro café."}],
};

/* ---------- Guion principal ---------- */
const L="lobby";
const SCRIPT = [
  // ===== CINEMÁTICA =====
  {cmd:"music", track:"suspenso"},
  {cmd:"cine", img:"assets/cine/1.png", text:"Cerro Alegre, Valparaíso. 3 de noviembre de 2030."},
  {cmd:"cine", img:"assets/cine/2.png", sfx:"thud", text:"23:10. Un apagón deja la galería a oscuras."},
  {cmd:"cine", img:"assets/cine/4.png", text:"Un ruido en el interior. Pasos que nadie consigue identificar."},
  {cmd:"cine", img:"assets/cine/6.png", sfx:"hit", flash:true, shake:true, text:"Un vidrio se rompe. Al día siguiente, «La Sirena del Puerto» ha desaparecido."},
  // ===== SALA DE ESPERA =====
  {cmd:"music", track:"espera"},
  {cmd:"location", text:"24 de noviembre de 2030 · 9:20\nTribunal de Juicio Oral en lo Penal de Valparaíso\nSala de espera", pos:L},
  {who:"ines",pos:L,mood:"sweat",text:"(Mi primer juicio. Tengo una credencial, una corbata…[p] y un estómago que ya presentó su renuncia.)"},
  {who:"ines",pos:L,pose:"point",anim:"slam",text:"¡La defensa demostrará…[p] que sabe defender!"},
  {who:"ines",pos:L,mood:"down",text:"(La pared no protestó. Eso no me tranquiliza.)"},
  {who:"chayo",pos:L,mood:"excited",sfx:"hit",text:"[s]¡SONRÍE, DEFENSOR!"},
  {who:"ines",pos:L,mood:"hit",anim:"hit",text:"¡¿QUÉ?!"},
  {who:"chayo",pos:L,pose:"foto",text:"[f]*Clic*.[p] Perfecto. Tu primera foto profesional: alguien a punto de desmayarse."},
  {who:"ines",pos:L,mood:"think",text:"(Chayo Catalán. Fotoperiodista. Ni un juicio y ya tiene material para mi obituario.)"},
  {who:"chayo",pos:L,mood:"serious",evidence:"ficha",text:"Empecemos por lo seguro: un cuadro de metro ochenta, marco rígido, veintidós kilos."},
  {who:"chayo",pos:L,pose:"camara",evidence:"luz",text:"Y un apagón anunciado con tres días de anticipación. El aviso sigue pegado en todo el cerro."},
  {who:"ines",pos:L,mood:"think",text:"¿Qué sabemos del acusado?"},
  {who:"tomas",pos:L,mood:"sweat",text:"Que soy Tomás Pincheira. Pinto murales afuera de la galería y no robé nada."},
  {who:"tomas",pos:L,mood:"beg",text:"Entré a lavar unas brochas en la tarde. Don Custodio siempre me presta agua."},
  {who:"ines",pos:L,mood:"think",text:"(El guardia lo conocía. Si alguien podía reconocerlo de noche, era él.)"},
  {who:"tomas",pos:L,mood:"down",text:"Y desapareció una lona amarilla de mi andamio. La policía dice que eso me hace sospechoso."},
  {who:"chayo",pos:L,mood:"think",evidence:"lona",text:"La lona era tuya, pero eso no demuestra quién se la llevó."},
  {who:"ines",pos:L,mood:"serious",text:"No puedo prometer que ganaremos, Tomás. Pero sí que no dejaré pasar una mentira sin preguntarle de dónde salió."},
  {cmd:"music", track:null},
  {who:"fiscal",pos:L,mood:"smug",text:"Una promesa ambiciosa para un abogado que todavía no sabe anudarse la corbata."},
  {who:"ines",pos:L,mood:"shock",text:"(Máximo Penna. Diecisiete victorias seguidas. ¡Justo el fiscal que me faltaba!)"},
  {who:"fiscal",pos:L,mood:"serious",text:"Valdivia, no me interesa su experiencia. Me interesa que sostenga cada frase con una prueba."},
  {who:"chayo",pos:L,mood:"smug",text:"¿Y el bigote también se sostiene con pruebas?"},
  {who:"fiscal",pos:L,mood:"disdain",text:"Señorita Catalán, mi paciencia no figura entre los documentos del expediente."},
  // ===== EL JUICIO =====
  {cmd:"negro", ms:1000, pos:"juez"},
  {cmd:"gavel"},
  {cmd:"music", track:"corte"},
  {who:null,text:"Preside Prudencia Fallo. Los otros dos integrantes del tribunal observan fuera de cámara."},
  {who:"jueza",mood:"gavel",text:"Se abre el juicio contra Tomás Pincheira. Hoy se decidirá si se acreditó su participación en la sustracción de una obra de arte."},
  {who:"fiscal",mood:"serious",evidence:"visitas",text:"El acusado ingresó a la galería a las 18:10. La sala estaba cerrada antes de las once."},
  {who:"fiscal",pose:"point",evidence:"ventana",text:"Por la mañana faltaba el cuadro. La ventana apareció rota. Dos personas vinculan al acusado con lo ocurrido."},
  {who:"fiscal",mood:"serious",evidence:"bitacora",text:"Y aquí está la bitácora del guardia: el primer informe de lo ocurrido aquella noche."},
  {who:"ines",mood:"think",text:"(Una entrada por la tarde no dice dónde estaba de noche. Pero esos testigos…)"},
  {who:"jueza",mood:"gavel",text:"Que comparezca Zoila Vecina Morales."},
  {cmd:"negro", ms:800, pos:"estrado"},
  {who:"zoila",mood:"smug",wait:900,text:"Vecina de apellido y de profesión. Treinta años observando esta calle. Con balcón propio."},
  {who:"ines",mood:"sweat",text:"(Su currículum tiene una sola línea. Muy larga.)"},
  {cmd:"cross", ref:"z1"},
  {who:"jueza",mood:"serious",text:"La testigo no pudo identificar al acusado. Queda el relato de quien estaba dentro."},
  {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Protesto! El error de una vecina no es la absolución de Tomás. Mi siguiente testigo estaba dentro del recinto."},
  {cmd:"negro", ms:800, pos:"estrado"},
  {who:"testigo",mood:"smile",wait:1000,read:["gerardo","Esperó afuera mientras declaraba Zoila."],text:"Custodio Llavín Reyes. Doce años cuidando esa galería. No se pierde una obra sin que yo lo note."},
  {who:"tomas",mood:"down",text:"(Yo le llevaba mate a don Custodio. Él me conoce.)"},
  {who:"jueza",mood:"serious",text:"Describa el supuesto ingreso y la salida del ladrón."},
  {cmd:"cross", ref:"g1"},
  {cmd:"present", who:"jueza", mood:"serious", tab:"pruebas", answer:"ficha",
   text:"La defensa cuestiona la ruta de escape. ¿Qué prueba demuestra que el cuadro no pudo pasar por esa ventana?",
   prompt:"Presenta la prueba que demuestra que el cuadro no cabía por la ventana.",
   ok:[
    {who:"ines",bubble:"mire",pose:"papel",show:"ficha",text:"¡La obra mide [r]180 × 120 cm[/r] y tiene un marco rígido! ¡La ventana solo [r]60 × 80[/r]!"},
    {who:"ines",pose:"point",anim:"slam",read:["ventana","El cuadro (180 × 120) no cabe por la ventana (60 × 80): no salió por ahí."],text:"¡Ni inclinándolo ni girándolo cabe por esa abertura!"},
    {who:null,text:"Lectura actualizada: Foto de la ventana."},
    {who:"testigo",mood:"shock",anim:"hit",text:"¡Entonces… alguien debió usar una puerta!"},
    {who:"fiscal",bubble:"objecion",pose:"point",music:"suspenso",text:"¡Protesto! ¡Exactamente, abogado! La ventana pudo romperse para [r]simular[/r] un robo. ¡Incluso Tomás pudo haberlo hecho!"},
    {who:"ines",mood:"shock",anim:"hit",text:"(¡Mi argumento acaba de ayudar al fiscal!)"},
    {who:"fiscal",pose:"point",evidence:"plano1",text:"Este plano muestra otra ruta: la sala conecta con un pasillo lateral que llega a la bodega y la salida de servicio."},
    {who:"fiscal",mood:"smug",text:"Una puerta no tiene que ser grande si nadie necesita escapar por la ventana."},
    {who:"jueza",mood:"serious",text:"Concluimos que la rotura de la ventana fue deliberadamente engañosa. Falta determinar quién la hizo."},
    {who:"testigo",mood:"angry",text:"¡Yo estaba en mi caseta! ¡Después del golpe entré y vi al muchacho!"},
    {who:"jueza",mood:"serious",text:"Guardia Llavín, precise su identificación y su revisión del lugar."},
   ]},
  {cmd:"cross", ref:"g2"},
  {who:"fiscal",pose:"point",text:"¡Una linterna descargada no absuelve a nadie! El cuadro sigue desaparecido y Tomás conocía el edificio."},
  {who:"ines",mood:"think",text:"(¿Y si hemos estado buscando el cuadro demasiado lejos?)"},
  {cmd:"choice", who:"jueza", mood:"serious", text:"Defensa, si solicita una diligencia adicional, indique qué lugar debería examinarse.",
   options:[
    {t:"El andamio de Tomás", w:[
      {who:"jueza",mood:"disappoint",damage:true,text:"¿Buscar el cuadro en el andamio de su propio cliente? Eso ayuda a la Fiscalía, abogado."},
      {who:"ines",mood:"sweat",text:"(¿Adónde lleva la otra ruta del plano?)"}]},
    {t:"La bodega del pasillo lateral", ok:true},
    {t:"La vereda junto a los vidrios", w:[
      {who:"fiscal",mood:"smug",damage:true,text:"Ya está fotografiada, colega. Y el cuadro no cabe en un vidrio."},
      {who:"ines",mood:"sweat",text:"(El pasillo lateral… ¿y al final de ese pasillo?)"}]},
   ],
   ok:[
    {who:"ines",pose:"point",anim:"slam",text:"El plano conecta el salón con una bodega. Llavín dice que la revisó y estaba vacía. Necesitamos verificarlo."},
    {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Protesto! El depósito está separado de la sala de exposición y quedó precintado. No se abre por una simple sospecha."},
    {who:"ines",mood:"serious",text:"La ruta del cuadro no está aclarada y el guardia afirmó revisar ese depósito. No podemos quedarnos con su palabra."},
    {who:"jueza",mood:"serious",text:"La diligencia tiene fundamento. La primera inspección examinó la sala; el depósito anexo no se abrió por estar cerrado y fuera del sector inicialmente denunciado."},
    {who:"jueza",mood:"gavel",text:"Carabineros lo precintó junto con el pasillo para preservar su estado, pero no se había autorizado una inspección interior. Se ordena su apertura y registro."},
   ]},
  {cmd:"music", track:null},
  {cmd:"location", text:"24 de noviembre de 2030 · 11:15\nReanudación de audiencia", pos:"juez"},
  {cmd:"music", track:"corte"},
  {who:"jueza",mood:"serious",evidence:"informe",text:"Se encontró «La Sirena del Puerto» en la bodega, cubierta con una lona amarilla. El precinto estaba intacto."},
  {who:"tomas",mood:"shock",anim:"hit",text:"¡Mi lona! ¡Y el cuadro… estaba aquí todo este tiempo!"},
  {who:"fiscal",bubble:"objecion",pose:"point",music:"suspenso",text:"¡No tan rápido! Encontrar la obra no identifica a quien la escondió. ¡Tomás sigue teniendo acceso y una lona vinculada al hallazgo!"},
  {who:"ines",mood:"think",text:"(Pero la bodega estaba sellada desde la noche del robo. Si Llavín realmente la revisó…)"},
  {who:"jueza",mood:"serious",evidence:"parte",text:"La patrulla aportó un registro horario independiente. El acceso lateral estuvo bajo vigilancia desde las 23:33 hasta que se precintó."},
  {who:"testigo",mood:"angry",text:"¡No me miren a mí! ¡Yo revisé la bodega! ¡A las veintitrés treinta y cinco!"},
  {who:"fiscal",mood:"serious",text:"Valdivia, si cree que eso es imposible, demuéstrelo. Pero deje de atribuir culpabilidades por intuición."},
  {cmd:"cross", ref:"g3"},
  {who:"jueza",mood:"serious",text:"Se ha demostrado que la revisión declarada a las 23:35 no pudo ocurrir. ¿Qué conclusión puede sostener la defensa?"},
  {cmd:"choice", who:"jueza", mood:"think", pickMusic:null, text:"Abogado Valdivia, ¿qué demuestra en realidad el expediente?",
   options:[
    {t:"Que Llavín cometió todos los delitos", w:[
      {who:"fiscal",mood:"smug",damage:true,text:"¿Todos? Usted acaba de pedirme pruebas, colega. Aplíquese la regla."},
      {who:"ines",mood:"sweat",text:"(Solo lo que el expediente sostiene. Nada más.)"}]},
    {t:"Que no hay prueba fiable contra Tomás", ok:true},
    {t:"Que Zoila fue la autora del robo", w:[
      {who:"zoila",mood:"shock",text:"¡¿Yo?! ¡Si estaba en el balcón con mi teleserie!"},
      {who:"jueza",mood:"disappoint",damage:true,text:"Abogado, nada en el expediente sostiene eso."}]},
   ],
   ok:[
    {who:"ines",bubble:"objecion",pose:"slam",anim:"slam",text:"Ni Zoila ni Llavín identificaron de manera fiable a Tomás."},
    {who:"ines",pos:"rayos",zoom:true,pose:"point",music:"variacion",text:"La ventana no sirvió para el traslado. Y no existe prueba que lo sitúe en la bodega."},
    {who:"ines",pos:"rayos",zoom:true,pose:"point",text:"La Fiscalía tiene una sospecha y un testigo que inventó una revisión. [r]No tiene acreditada la participación de mi cliente[/r]."},
    {who:"fiscal",bubble:"objecion",pose:"point",text:"¡Protesto! ¡Tomás pudo regresar y actuar con otra persona! No es imposible."},
    {who:"ines",mood:"serious",text:"Puede ser imaginable, fiscal. Pero no lo ha demostrado. No puedo desmentir cada posibilidad que inventemos."},
    {who:"jueza",mood:"serious",text:"El tribunal valorará los hechos acreditados, no las posibilidades sin respaldo."},
   ]},
  {who:"testigo",mood:"sweat",text:"…"},
  {who:"fiscal",mood:"serious",text:"Señor Llavín. Voy a darle una última oportunidad: ¿vio realmente a Tomás trasladar el cuadro?"},
  {who:"testigo",mood:"angry",text:"¡No me pongan contra la pared! ¡Yo cuidé esa galería doce años!"},
  {who:"fiscal",mood:"serious",text:"La antigüedad no responde la pregunta."},
  {who:"testigo",mood:"sweat",music:null,text:"…No. No lo vi."},
  {who:"ines",mood:"serious",text:"(No voy a adivinar lo que pasó detrás de esa puerta. Pero ya no pueden condenar a Tomás por lo que otro supone.)"},
  {who:"jueza",mood:"serious",text:"Señor Llavín, puede guardar silencio. ¿Desea aclarar por qué su bitácora registró una revisión imposible?"},
  {who:"testigo",mood:"angry",text:"¡No pienso dar explicaciones por cumplir mi trabajo!"},
  {who:"testigo",mood:"down",text:"…Aunque ni siquiera iba a tener trabajo en diciembre."},
  {who:"ines",mood:"think",read:["bitacora","El aviso de la tapa: en diciembre una alarma reemplazaba su turno."],text:"(El aviso pegado en la bitácora: iban a reemplazar su turno por una alarma.)"},
  {who:null,text:"Lectura actualizada: Bitácora del guardia."},
  {who:"testigo",mood:"angry",text:"¡Doce años encontrando lo que otros perdían! Quería que la administración recordara quién les cuidaba todo."},
  {who:"testigo",mood:"sweat",text:"Pensé esconderlo solo un rato. Romper el vidrio. Después iba a aparecer yo con el cuadro y salvar el día."},
  {who:"fiscal",mood:"serious",text:"¿Está afirmando que retiró la obra personalmente? Responda sin rodeos."},
  {who:"testigo",mood:"down",text:"Sí. Usé la lona del andamio de Tomás. Iba a devolverlo antes de que alguien llamara a Carabineros."},
  {who:"testigo",mood:"sweat",text:"Oyeron el vidrio, llegó una patrulla que estaba cerca… y sellaron el pasillo. Lo dejé allí."},
  {who:"ines",mood:"serious",text:"¿Y después permitió que culparan a Tomás?"},
  {who:"testigo",mood:"shock",text:"¡No quería que lo detuvieran! Pensé que se aclararía… que alguien lo aclararía."},
  {who:"tomas",mood:"down",text:"Yo le convidaba mate, don Custodio."},
  {who:"testigo",mood:"shock",text:"…"},
  {cmd:"breakdown", who:"testigo", seq:["shock","angry","sweat","break"]},
  {who:"testigo",mood:"cry",text:"Te vi pasar tantas tardes, cabro. Y dejé que creyeran lo peor de ti."},
  {who:"testigo",mood:"cry",text:"Lo hice yo. Mentí. Tú no entraste a la sala esa noche."},
  {who:"fiscal",mood:"serious",text:"La Fiscalía no respaldará una identificación que el propio testigo acaba de retirar. Eso no borra lo ocurrido ni me obliga a celebrar esta derrota."},
  {who:"jueza",mood:"serious",text:"La responsabilidad eventual del guardia deberá investigarse por separado. Respecto de Tomás, no se ha probado su participación."},
  {who:"jueza",mood:"gavel",text:"Por decisión unánime, se dicta veredicto absolutorio."},
  {who:"fiscal",mood:"angry",text:"…"},
  {who:null,text:"Penna aprieta su carpeta hasta dejar marcada la cubierta."},
  {cmd:"verdict", text:"NO CULPABLE", good:true},
  {cmd:"music", track:"victoria"},
  {who:"tomas",mood:"smile",anim:"jump",confetti:true,text:"¡Me puedo ir a casa! ¡No había dormido una noche completa desde que me detuvieron!"},
  {who:"ines",mood:"smile",text:"(Primer juicio. Primera absolución. ¿Alguien tiene una silla?)"},
  // ===== FINAL =====
  {cmd:"location", text:"Tribunal de Juicio Oral en lo Penal de Valparaíso\nSala de espera", pos:L},
  {who:"tomas",pos:L,mood:"smile",text:"Don Justo… pensé que nadie me iba a escuchar. Gracias."},
  {who:"ines",pos:L,mood:"smile",text:"No hacía falta un milagro. Hacía falta revisar lo que podían probar."},
  {who:"tomas",pos:L,mood:"down",text:"¿Y don Custodio? ¿Por qué hizo algo así? Antes era bueno conmigo."},
  {who:"chayo",pos:L,mood:"serious",text:"Quería que lo necesitaran. Eso explica el engaño; no lo disculpa."},
  {who:"tomas",pos:L,mood:"down",text:"Hoy quiero dormir. Mañana veré qué hago con esa pregunta."},
  {who:"tomas",pos:L,mood:"smile",anim:"jump",text:"Y le voy a pintar un mural. Pero sin una ventana, por si acaso."},
  {who:"ines",pos:L,mood:"sweat",text:"(Con tal que no lo pinte de dos metros…)"},
  {who:"fiscal",pos:L,mood:"serious",text:"Valdivia."},
  {who:"ines",pos:L,mood:"shock",text:"(¿Todavía sigue aquí?)"},
  {who:"fiscal",pos:L,mood:"serious",text:"Diecisiete victorias. Y el primer abogado que me derrota apenas lleva once días con su credencial."},
  {who:"ines",pos:L,mood:"sweat",text:"Yo solo…"},
  {who:"fiscal",pos:L,mood:"serious",text:"No necesito su explicación. Necesito que recuerde lo que le diré."},
  {who:"fiscal",pos:L,mood:"serious",text:"Hoy mi acusación se apoyó en un hombre que mintió. Lo permití yo. No volverá a pasar."},
  {who:"fiscal",pos:L,mood:"smug",text:"La próxima vez, Valdivia, tendrá que vencer algo más difícil que un testigo incompetente: mis argumentos."},
  {who:"chayo",pos:L,mood:"think",text:"¿Eso fue una felicitación?"},
  {who:"fiscal",pos:L,mood:"disdain",text:"No, señorita Catalán. Fue una advertencia."},
  {who:"ines",pos:L,mood:"sweat",text:"(Excelente. Acabo de ganarme un enemigo con bigote.)"},
  {who:"chayo",pos:L,mood:"excited",text:"¿Empanadas? Invito yo."},
  {who:"ines",pos:L,mood:"shock",text:"¿En serio?"},
  {who:"chayo",pos:L,mood:"smug",text:"Invito. Tú pagas. No confundas la palabra con el hecho, abogado."},
  {who:"ines",pos:L,mood:"sweat",text:"(Eso debería estar penado.)"},
  {who:"ines",pos:L,mood:"think",text:"(Hoy no resolví cada minuto de aquella noche. Pero sí impedí que condenaran a alguien por una historia mal contada.)"},
  {who:null,pos:L,text:"FIN DEL CASO 1 — «La Sirena del Puerto»."},
  {cmd:"end"},
];

return {titulo:"La Sirena del Puerto", numero:1,
  intro:"Valparaíso. Un defensor en su primer juicio. Y un cuadro de casi dos metros que habría salido por una ventana de sesenta centímetros.",
  CHARS, EVIDENCE, EV0, EVIMG, EVX, PROFILES, WRONG, FISCAL_PRESS, CROSS, OBJ_REASONS, DIRECT, DIRECT_LINES, SCRIPT};
})();
