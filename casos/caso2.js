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
const EVIMG = {credencial:"assets/pruebas/credencial.png", plano:"assets/pruebas/plano.png"};
const EVX = {
  pistola:   {id:"pistola",   icon:"🔫", name:"Pistola 9 mm", desc:"Encontrada en la mochila de Tadeo. Disparada una vez. Sin huellas: alguien la limpió.", read:"El arma del crimen."},
  autopsia:  {id:"autopsia",  icon:"📄", name:"Informe de autopsia", desc:"Leonel Ferrada, 61. Roce de bala en la mejilla izquierda, de frente. Bala 9 mm en la nuca, disparada por la espalda. Muerte instantánea.", read:"Dos heridas, dos direcciones."},
  bala38:    {id:"bala38",    icon:"🔩", name:"Bala .38", desc:"Incrustada en el marco de la puerta de entrada. Calibre .38, de revólver. No es la bala que mató.", read:"El disparo de Rocky."},
  plano:     {id:"plano",     icon:"🗺️", ver:"assets/pruebas/plano.png", name:"Plano de la casona", desc:"Plano de evacuación. La entrada da a un pasillo oscuro. La cocina está a la derecha, sin vista al pasillo. La pieza de Tadeo, al fondo, no tiene ventana a la calle.", read:"Quién podía ver qué."},
  video:     {id:"video",     icon:"📹", name:"Video cámara municipal", desc:"Calle Templeman. 23:15: sale un taxi desde la casona. 23:42: una camioneta roja baja a toda velocidad. La patente no se lee.", read:"Una camioneta sin identificar huyó."},
  fotocam:   {id:"fotocam",   icon:"🚙", name:"Foto de la camioneta", desc:"Camioneta roja de Rodrigo Saavedra, identificada gracias al video e incautada. En el parabrisas hay un soporte vacío.", read:"La camioneta que huyó esa noche."},
  libro:     {id:"libro",     icon:"📒", name:"Libro de huéspedes", desc:"Casona Ferrada, 14 de marzo. Huéspedes: T. Fuegos (pieza del fondo) y B. Plusvalía (pieza del segundo piso).", read:"Dos huéspedes esa noche."},
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
  {id:"rocky",  who:"rocky",  name:"Rodrigo «Rocky» Saavedra", desc:"Mecánico. Dueño de la camioneta roja del video. Le debía plata a Leonel.", hidden:true},
];

/* ---------- INVESTIGACIÓN (formato en js/investigacion.js) ---------- */
const INV = {
  /* ===================== DÍA 1 ===================== */
  dia1: {
    start:"locutorio", music:"espera", fecha:"15 de marzo", hora:9*60+40, paso:25,   // hora de llegada al primer lugar; +25 min por lugar nuevo
    done:{ev:["pistola","autopsia","bala38","plano","video","taza","pastillas","fotomadre","libro"],
          flags:["vio_aurelio","habla_malva","habla_barbara","habla_penna"]},
    hints:{
      pistola:"(Tadeo todavía no me ha contado bien qué pasó esa noche.)",
      autopsia:"(La defensa tiene derecho a ver la carpeta de investigación. La tiene Eduardo.)",
      video:"(La defensa tiene derecho a ver la carpeta de investigación. La tiene Eduardo.)",
      bala38:"(En la entrada de la casona, algo brillaba en el marco de la puerta.)",
      plano:"(No he revisado la pieza de Tadeo rincón por rincón. La pared, por ejemplo.)",
      taza:"(En la pieza de Tadeo, junto a la cama, había algo que no revisé.)",
      pastillas:"(En la pieza de Tadeo, junto a la cama, había algo que no revisé.)",
      fotomadre:"(Las cosas de Tadeo en su pieza... no las revisé todas.)",
      libro:"(El mostrador de la entrada de la casona. Ahí debe estar el registro de huéspedes.)",
      vio_aurelio:"(El vecino de enfrente mira todo. ¿Qué habrá visto esa noche?)",
      habla_malva:"(Todavía no sé casi nada de la casona ni de la familia Ferrada.)",
      habla_barbara:"(La otra huésped... ¿qué hacía en la casona? Tengo que preguntarle.)",
      habla_penna:"(Penna está en la comisaría. Debería escuchar lo que tiene contra Tadeo.)"},
    end:[{who:"ines",mood:"think",text:"(Un muerto, dos disparos, una pistola en la mochila equivocada.)"},
         {who:"ines",mood:"down",text:"(Coté sabría qué preguntar. Hoy tengo que saberlo yo.)"},
         {who:"ines",mood:"serious",text:"(Mañana es el juicio. No hay más tiempo.)"}],
    places:{
      locutorio:{name:"Locutorio de la comisaría", moves:["casona","comisaria"],   // la casona se abre cuando Tadeo cuenta dónde fue
        people:[{who:"tadeo", back:[{who:"tadeo",mood:"down",text:"¿Volvió, abogado? Aquí sigo. No me dejan ir a ninguna parte."}]}],
        enter:[{who:"tadeo",mood:"sweat",meet:"tadeo",text:"...¿Usted es el abogado? Me dijeron que venía uno."},
               {who:"ines",text:"Justo Valdivia, defensor público. Vengo a escucharte. Desde el principio."}],
        talk:[
          {id:"t_quien", who:"tadeo", t:"¿Quién eres?", lines:[
            {who:"tadeo",text:"Tadeo Fuegos. De Puerto Williams. Más al sur ya no hay nada, puros pingüinos."},
            {who:"tadeo",text:"Tres días de ferry y bus para llegar. Llegué antier."},
            {who:"ines",mood:"think",flag:"t_quien",text:"(Puerto Williams. El fin del mundo, literal.)"}]},
          {id:"t_noche", who:"tadeo", t:"Esa noche", lines:[
            {who:"tadeo",text:"Me tomé la pastilla del mareo y me acosté temprano. No escuché nada."},
            {who:"tadeo",mood:"shock",evidence:"pistola",text:"Desperté con un carabinero encima. Dicen que en mi mochila había una pistola."},
            {who:"ines",mood:"think",text:"(Una 9 mm. Disparada y limpia. ¿Quién guarda un arma así en su propia mochila?)"},
            {who:"tadeo",mood:"down",flag:"sabe_casona",text:"Fue en la Casona Ferrada, en Cerro Concepción. Ahí arrendaba una pieza."},
            {who:"ines",mood:"serious",text:"(La Casona Ferrada. Tengo que ver ese lugar con mis propios ojos.)"}]},
          {id:"t_casona", who:"tadeo", t:"La casona", req:{flags:["sabe_casona"]}, lines:[
            {who:"tadeo",mood:"smile",text:"Linda casa. La señora Malva me recibió con un té de bienvenida."},
            {who:"tadeo",text:"Don Leonel, el dueño, casi no habló. Pero me miraba raro."},
            {who:"tadeo",mood:"sweat",text:"Como si... como si me conociera."},
            {who:"ines",mood:"think",text:"(¿Como si lo conociera?)"}]},
          {id:"t_por", who:"tadeo", t:"¿Por qué viniste a Valparaíso?", req:{flags:["t_quien"]}, lines:[
            {who:"tadeo",mood:"sweat",text:"Por... conocer. Turismo. Eso."},
            {who:"ines",mood:"think",text:"(Mintió. Se le notó en toda la cara.)"}]},
          {id:"madre", who:"tadeo", t:"La foto de la mochila", req:{ev:["fotomadre"]},
           silence:{req:{flags:["juicio1"]},
             closed:[{who:"tadeo",mood:"angry",text:"...Eso no tiene nada que ver. No quiero hablar de ella."},
                     {who:"ines",mood:"sweat",text:"(Se cerró. 🔒 Todavía no tengo cómo hacerlo hablar.)"}]},
           lines:[{who:"tadeo",text:"(Este tema ya se habló.)"}]},
        ],
        present:{tadeo:{
          pistola:[{who:"tadeo",mood:"sweat",text:"Nunca la había visto. Se lo juro por mi mamá."}],
          taza:[{who:"tadeo",text:"El té de la señora Malva. Muy rico. Después dormí como nunca en mi vida."},
                {who:"ines",mood:"think",text:"(«Como nunca en su vida».)"}],
          pastillas:[{who:"tadeo",text:"Esas son mías. Para el mareo. Son suavecitas, me dan un poco de sueño no más."}],
          fotomadre:[{who:"tadeo",mood:"angry",text:"¡¿Por qué anda con eso?! Es mía. Devuélvamela."}],
          default:[{who:"tadeo",text:"No sé qué es eso, abogado."}]}}},

      casona:{name:"Casona Ferrada — entrada", req:{flags:["sabe_casona"]}, moves:["pieza","oficinahostal","aurelio","comisaria","locutorio"],
        people:[
          {who:"eduardo", req:{not:["edu_fue"]}, back:[{who:"eduardo",mood:"sweat",text:"¿Otra vez usted, Valdivia? Mire, pero no toque."}]},
          {who:"barbara", req:{ev:["libro"],flags:["edu_fue"]},
           hello:[{who:"barbara",mood:"smug",text:"¿Y usted quién es? ¿Otro policía? El de la huincha se acaba de ir."},
                  {who:"ines",text:"Justo Valdivia. Defensor de Tadeo Fuegos."},
                  {who:"barbara",meet:"barbara",text:"Bárbara Plusvalía. Hoteles Mirador del Pacífico. Venía saliendo."}]}],
        enter:[{who:"eduardo",mood:"serious",text:"Alto ahí. Escena del crimen. No pasa nadie."},
               {who:"ines",mood:"shock",text:"(Eduardo Estuardo. El investigador que llevó el caso de mi papá.)"},
               {who:"eduardo",mood:"shock",text:"...¿Valdivia? ¿El hijo del taxista?"},
               {who:"eduardo",mood:"sweat",text:"Mire qué cosas. Igual no pasa."}],
        examine:[
          {id:"puerta", t:"La puerta", area:[0,0,28,172], req:{not:["pasar"]}, lines:[
            {who:"ines",mood:"think",text:"(Cinta policial. Y en el marco... algo brilla. Desde aquí no alcanzo a verlo.)"}]},
          {id:"calle", t:"La calle", area:[28,10,36,120], lines:[
            {who:"ines",mood:"think",text:"(Cerro Concepción. Adoquines, casas de colores, una escalera que baja al plan.)"},
            {who:"ines",mood:"shock",flag:"vio_cortina",text:"(Al frente, en el segundo piso, una cortina se movió. Alguien está mirando.)"},
            {who:"ines",mood:"think",text:"(Si ese vecino mira todo el día, quizás vio algo esa noche.)"}]},
          {id:"marco", t:"El marco de la puerta", area:[0,0,28,172], req:{flags:["pasar"]}, lines:[
            {who:"ines",mood:"think",evidence:"bala38",text:"(Una bala incrustada en el marco. Calibre .38, de revólver.)"},
            {who:"ines",mood:"think",text:"(Disparada desde la calle, de frente. Le pasó rozando a don Leonel y terminó aquí.)"}],
           again:[{who:"ines",mood:"think",text:"(El agujero de la bala .38. Ya me lo llevé.)"}]},
          {id:"pasillo", t:"El pasillo", area:[112,8,72,124], req:{flags:["pasar"]}, lines:[
            {who:"ines",mood:"think",text:"(Largo y oscuro, justo detrás de la puerta. Aunque afuera haya luz, aquí no llega.)"},
            {who:"ines",mood:"think",flag:"vio_pasillo",text:"(Al fondo, la pieza de Tadeo. A un lado, una puerta con un cartel: «Oficina».)"},
            {who:"ines",mood:"think",text:"(Se oye a alguien adentro. ¿Será la familia?)"}]},
          {id:"mostrador", t:"El mostrador", area:[186,78,70,84], req:{flags:["pasar"]}, lines:[
            {who:"ines",mood:"think",evidence:"libro",text:"(El libro de huéspedes. Esa noche había dos: T. Fuegos... y B. Plusvalía.)"},
            {who:"ines",mood:"think",text:"(¿Plusvalía? Otra huésped esa noche. Tengo que saber quién es.)"}]},
          {id:"perchero", t:"El perchero", area:[72,36,30,98], req:{flags:["pasar"]}, lines:[
            {who:"ines",mood:"down",text:"(Una chaqueta de hombre, gastada. La de don Leonel. La colgó para abrir la puerta.)"}]},
          {id:"flores", t:"Las flores", area:[204,54,28,30], lines:[
            {who:"ines",mood:"think",text:"(Hortensias frescas. Alguien las cambió hoy. En una casa donde anoche mataron a un hombre.)"}]},
        ],
        talk:[
          {id:"e_escena", who:"eduardo", t:"¿Qué pasó aquí?", lines:[
            {who:"eduardo",text:"Víctima en la entrada, boca abajo. Dos disparos. Y una camioneta que huyó, sin identificar."},
            {who:"eduardo",mood:"write",flag:"e_escena",text:"Y en la mochila del cabro, la pistola. Caso cerrado, dice el fiscal."}]},
          {id:"e_pasar", who:"eduardo", t:"Dejarme pasar", req:{flags:["e_escena"]}, lines:[
            {who:"ines",text:"La defensa tiene derecho a ver la escena. Y la carpeta de investigación."},
            {who:"eduardo",mood:"sweat",flag:"pasar",text:"...Ya, ya. Pero no toque nada. Esta vez medí todo."},
            {who:"eduardo",text:"La pieza del cabro es la del fondo. Ahí encontramos la pistola."}]},
          {id:"e_carpeta", who:"eduardo", t:"La carpeta de investigación", req:{flags:["pasar"]}, lines:[
            {who:"eduardo",evidence:"autopsia",text:"La autopsia. Dos heridas."},
            {who:"eduardo",evidence:"video",text:"El video de la cámara municipal. Una camioneta roja, huyendo."},
            {who:"eduardo",mood:"sweat",text:"La camioneta todavía no la ubicamos. La patente no se lee. Estamos en eso."},
            {who:"eduardo",mood:"sweat",flag:"edu_fue",text:"Ya. Me voy a la comisaría a dejar esto. Si quiere pelear, el fiscal está allá."},
            {who:"ines",mood:"think",text:"(Se fue. Puedo revisar la casa con calma... y después, ir a ver a Penna.)"}]},
          {id:"e_papa", who:"eduardo", t:"El caso de mi papá", req:{flags:["e_escena"]}, lines:[
            {who:"eduardo",mood:"down",text:"Me acuerdo de su viejo. No es un caso que se me olvide."},
            {who:"ines",mood:"down",text:"(Algún día le voy a preguntar más. Hoy no.)"}]},
          {id:"b_quien", who:"barbara", t:"¿Qué hace aquí?", lines:[
            {who:"barbara",mood:"smug",flag:"habla_barbara",text:"Negocios. Mi cadena quiere esta casona. Vista al mar, cerro patrimonial."},
            {who:"barbara",text:"El señor Ferrada era... difícil. Ahora habrá que conversar con la heredera."}]},
          {id:"b_cena", who:"barbara", t:"La discusión de la cena", req:{flags:["habla_barbara"]}, lines:[
            {who:"barbara",mood:"angry",text:"Le ofrecí el triple de lo que vale. Me dijo que antes muerto."},
            {who:"barbara",mood:"smug",text:"Mala elección de palabras, ¿no?"}]},
          {id:"b_noche", who:"barbara", t:"¿Dónde estaba esa noche?", req:{flags:["habla_barbara"]}, lines:[
            {who:"barbara",mood:"angry",text:"Eso no es asunto suyo, abogado."},
            {who:"ines",mood:"think",text:"(No quiso contestar.)"}]},
        ],
        present:{
          barbara:{pistola:[{who:"barbara",mood:"smug",text:"Qué vulgar. Yo resuelvo las cosas con contratos."}],
                   default:[{who:"barbara",text:"No tengo tiempo para esto."}]},
          eduardo:{default:[{who:"eduardo",text:"No me muestre cosas, Valdivia. Yo trabajo para la fiscalía."}]}}},

      oficinahostal:{name:"Oficina del hospedaje", req:{flags:["vio_pasillo"]}, moves:["casona","pieza"],
        people:[{who:"malva",
           hello:[{who:"malva",mood:"shock",text:"¡Ay! Me asustó. Perdone, estaba ordenando las cuentas..."},
                  {who:"malva",mood:"down",meet:"malva",text:"Soy Malva. La hija de... de don Leonel."},
                  {who:"malva",mood:"smile",text:"Usted es el abogado del muchacho, ¿no? ¿Le sirvo un tecito? Es lo único que me tiene en pie."}],
           back:[{who:"malva",mood:"smile",text:"Abogado. ¿Otro tecito?"}]}],
        examine:[
          {id:"cajon1", t:"El cajón abierto", area:[28,96,66,40], lines:[
            {who:"ines",mood:"think",text:"(Un cajón con la cerradura forzada. Vacío.)"},
            {who:"malva",mood:"sweat",text:"Ahí mi papá guardaba la plata de la caja. Esa noche alguien lo forzó."},
            {who:"malva",mood:"down",text:"Ladrones, abogado. Seguro el mismo que..."}]},
          {id:"reservas1", t:"El libro abierto", area:[16,58,66,34], lines:[
            {who:"ines",mood:"think",text:"(El libro de reservas. Letra ordenada, todo anotado al centavo.)"},
            {who:"malva",mood:"smile",text:"Llevo las cuentas de la casa desde los veinte años."}]},
          {id:"cuadro1", t:"El cuadro", area:[10,0,48,46], lines:[
            {who:"ines",mood:"think",text:"(Un grabado antiguo del ascensor Concepción.)"},
            {who:"malva",mood:"smile",text:"Lo dibujó mi abuelo. Él construyó esta casa."}]},
          {id:"ventana1", t:"La ventana", area:[96,0,100,94], lines:[
            {who:"ines",mood:"think",text:"(Vista a la bahía. Desde aquí no se ve ni la entrada ni el pasillo.)"}]},
        ],
        talk:[
          {id:"m_casa", who:"malva", t:"La casona", lines:[
            {who:"malva",text:"Era de mi abuelo. Mi papá la convirtió en hospedaje. Yo la administro."},
            {who:"malva",mood:"smile",flag:"habla_malva",text:"Desayunos, sábanas, cuentas... y el té. Siempre el té."}]},
          {id:"m_noche", who:"malva", t:"Esa noche", lines:[
            {who:"malva",mood:"sweat",text:"Yo estaba en la cocina, lavando las tazas. Sentí los disparos..."},
            {who:"ines",mood:"think",text:"(Tiene una curita en la mano.)"},
            {who:"malva",text:"¿Esto? Me corté con el cuchillo del pan. Qué torpe."}]},
          {id:"m_papa", who:"malva", t:"Su padre", lines:[
            {who:"malva",mood:"down",text:"Era duro, pero bueno. Prestaba plata, sí. Medio cerro le debía."},
            {who:"malva",text:"Y odiaba las armas, abogado. Nunca tuvo una."}]},
          {id:"m_tadeo", who:"malva", t:"Tadeo", lines:[
            {who:"malva",text:"Un muchacho tranquilo. Llegó antier. Le di su té, como a todos."},
            {who:"malva",mood:"down",text:"Nunca pensé que... ay. No sé qué pensar."}]},
          {id:"m_barbara", who:"malva", t:"La señora Plusvalía", req:{ev:["libro"]}, lines:[
            {who:"malva",mood:"sweat",text:"Quiere comprar la casa para un hotel. Mi papá no quería vender."},
            {who:"malva",text:"Esa noche discutieron en la cena. Fuerte. Ella salió dando un portazo."}]},
          {id:"m_vecino", who:"malva", t:"Los vecinos", lines:[
            {who:"malva",mood:"smile",flag:"vio_cortina",text:"Don Aurelio, el de enfrente. Ve todo con sus binoculares. Todo."}]},
        ],
        present:{malva:{
          pistola:[{who:"malva",mood:"shock",text:"¡Qué horror! Le digo que mi papá odiaba las armas."}],
          taza:[{who:"malva",mood:"smile",text:"Mi té de bienvenida. Receta de mi abuela. ¿Quiere uno?"}],
          libro:[{who:"malva",text:"Dos huéspedes. Es temporada baja."}],
          default:[{who:"malva",mood:"sweat",text:"No sé qué decirle de eso, abogado."}]}}},

      pieza:{name:"Pieza de Tadeo", req:{flags:["pasar"]}, moves:["casona"],
        examine:[
          {id:"plano", t:"El plano de la pared", area:[74,30,64,34], lines:[{who:"ines",mood:"think",evidence:"plano",text:"(Plano de evacuación. Esta pieza no tiene ventana a la calle. Y la cocina no da al pasillo.)"}]},
          {id:"taza", t:"La taza del velador", area:[88,80,17,22], lines:[{who:"ines",mood:"think",evidence:"taza",text:"(Una taza con restos de té. Huele a hierbas... y a algo más.)"}]},
          {id:"pastillas", t:"La caja de pastillas", area:[105,80,18,22], lines:[{who:"ines",mood:"think",evidence:"pastillas",text:"(Pastillas para el mareo. Suaves. Falta solo una.)"}]},
          {id:"mochila", t:"La mochila", area:[198,84,58,80], lines:[
            {who:"ines",mood:"think",text:"(Enorme. Ropa, un saco de dormir, un mapa de la Patagonia lleno de anotaciones.)"},
            {who:"ines",mood:"think",evidence:"fotomadre",text:"(Y una foto vieja en el bolsillo. Al reverso: «Leo y yo, 2002».)"}]},
          {id:"cama", t:"La cama", area:[0,76,88,116], lines:[{who:"ines",mood:"think",text:"(Deshecha, pero casi ni movida. Durmió como tronco. Demasiado como tronco.)"}]},
          {id:"puertap", t:"La puerta", area:[144,24,56,112], lines:[{who:"ines",mood:"think",text:"(No tiene llave por dentro. Cualquiera pudo entrar mientras él dormía.)"}]},
        ]},

      aurelio:{name:"Casa de Aurelio Mirón", req:{flags:["vio_cortina"]}, moves:["casona"],
        examine:[
          {id:"a_ventana", t:"La ventana", area:[70,0,170,100], lines:[
            {who:"ines",mood:"think",text:"(La Casona Ferrada, justo enfrente. Se ve la puerta perfecta.)"},
            {who:"ines",mood:"think",text:"(Pero el pasillo queda adentro, en penumbra. Y la pieza del fondo no se ve.)"}]},
          {id:"a_cuaderno", t:"El cuaderno de la mesita", area:[34,84,48,24], lines:[
            {who:"ines",mood:"think",text:"(Un cuaderno lleno de patentes de autos y horas. «Martes: el cartero llegó tarde».)"},
            {who:"aurelio",mood:"sweat",text:"¡Eso es privado! Es... es un diario. De vida."}]},
          {id:"a_sillon", t:"El sillón", area:[0,76,64,104], lines:[
            {who:"ines",mood:"think",text:"(Hundido justo en la forma de una persona. Apuntando a la ventana.)"}]},
        ],
        people:[{who:"aurelio", back:[{who:"aurelio",mood:"smile",text:"¡Volvió! ¿Quiere mirar por los binoculares? Se ve todo, ah."}]}],
        enter:[{who:"aurelio",mood:"shock",text:"¡Lo vi mirando para acá! ¿Usted es de la tele?"},
               {who:"ines",mood:"sweat",text:"Abogado. Defensor."},
               {who:"aurelio",mood:"smug",meet:"aurelio",text:"Aurelio Mirón. Vecino. Vigilante del barrio, sin sueldo."}],
        talk:[
          {id:"a_vio", who:"aurelio", t:"¿Qué vio esa noche?", lines:[
            {who:"aurelio",text:"La camioneta roja. Un tipo grandote en la puerta. ¡Y el fogonazo!"},
            {who:"aurelio",mood:"shock",flag:"vio_aurelio",text:"Y otro, casi al tiro. ¡Pum, pum!"},
            {who:"aurelio",mood:"smug",text:"Lo demás lo cuento en el juicio. Me citaron, ¿sabe? Como testigo."}]},
          {id:"a_ferrada", who:"aurelio", t:"Los Ferrada", lines:[
            {who:"aurelio",text:"Don Leonel prestaba plata. Cobraba caro. Medio barrio le debía."},
            {who:"aurelio",mood:"smile",text:"La Malva es trabajadora. Siempre con su delantal, de arriba para abajo."}]},
          {id:"a_senora", who:"aurelio", t:"La señora de traje", req:{ev:["libro"]}, lines:[
            {who:"aurelio",mood:"think",text:"¿La elegante? Vino tres veces esta semana. Con cara de dueña."},
            {who:"aurelio",mood:"smug",text:"Esa noche salió en taxi. Temprano. No le vi la hora, estaba en el baño."}]},
          {id:"a_bino", who:"aurelio", t:"Los binoculares", lines:[
            {who:"aurelio",mood:"smug",text:"Alemanes. De mi suegro. Se ve hasta el puerto con estos."},
            {who:"ines",mood:"sweat",text:"(Y la vida de todos los vecinos, seguro.)"}]},
        ],
        present:{aurelio:{
          video:[{who:"aurelio",mood:"shock",text:"¡Esa! ¡La camioneta roja! Bajó como alma que lleva el diablo."},
                 {who:"aurelio",mood:"sweat",text:"¿La patente? Ay, no... a esa distancia ni con binoculares."}],
          pistola:[{who:"aurelio",mood:"shock",text:"¡Guarde eso, por Dios! ¡Que me da algo!"}],
          default:[{who:"aurelio",mood:"confused",text:"¿Y eso qué es? Déjeme ver con los binoculares... no, igual no sé."}]}}},

      comisaria:{name:"Comisaría", req:{flags:["edu_fue"]}, moves:["locutorio","casona"],
        examine:[
          {id:"c_mural", t:"El diario mural", area:[30,0,92,62], lines:[
            {who:"ines",mood:"think",text:"(Fotos de otros casos. Ninguno resuelto todavía, parece.)"}]},
          {id:"c_bandera", t:"La bandera", area:[0,0,28,110], lines:[
            {who:"ines",mood:"think",text:"(La bandera. Un poco desteñida, pero bien planchada.)"}]},
        ],
        people:[{who:"fiscal",
          hello:[{who:"fiscal",mood:"smug",pose:"cafe",text:"Valdivia. Vino a ver a su cliente, supongo. Lo va a necesitar."}],
          back:[{who:"fiscal",pose:"cafe",text:"¿Todavía por aquí? *sorbo*"}]}],
        talk:[
          {id:"p_caso", who:"fiscal", t:"El caso", lines:[
            {who:"fiscal",mood:"smug",pose:"cafe",flag:"habla_penna",text:"Arma en su mochila, víctima en la puerta. No me haga perder el tiempo."}]},
          {id:"p_acusado", who:"fiscal", t:"Tadeo", lines:[
            {who:"fiscal",text:"Llegó antier. Esa misma noche hay un muerto en la puerta. No creo en coincidencias."}]},
          {id:"p_camioneta", who:"fiscal", t:"La camioneta del video", req:{ev:["video"]}, lines:[
            {who:"fiscal",pose:"cafe",text:"¿La camioneta? Un vecino asustado que escapó de los balazos, nada más."},
            {who:"fiscal",mood:"smug",text:"El asesino estaba adentro, colega. Y dormía en la pieza del fondo."},
            {who:"ines",mood:"think",text:"(¿Y la bala del marco? Alguien disparó desde la calle. Penna no quiere verlo.)"}]},
        ],
        present:{fiscal:{
          pistola:[{who:"fiscal",pose:"cafe",text:"La del acusado. Ya la vio. ¿Algo más?"}],
          default:[{who:"fiscal",mood:"smug",text:"Guárdese eso para el juicio, colega."}]}}},
    }},

  /* ===================== DÍA 3 ===================== */
  dia3: {
    start:"locutorio", music:"espera", fecha:"17 de marzo", hora:9*60+15, paso:25,
    done:{ev:["carta","polvora","sangre","inscripcion","tarjeta","receta","contrato","boleta"]},
    hints:{
      carta:"(Tadeo esconde algo sobre la foto. Ahora sé lo suficiente para que hable.)",
      polvora:"(Eduardo dijo que llegaron informes nuevos. Tengo que preguntarle.)",
      sangre:"(Tadeo durmió demasiado profundo. ¿Le habrán tomado muestras de sangre?)",
      inscripcion:"(¿De quién era esa pistola, en realidad? Eduardo podría averiguarlo.)",
      tarjeta:"(El soporte vacío en el parabrisas de Rocky... ¿dónde está esa cámara?)",
      receta:"(Si a Tadeo lo durmieron, el remedio tiene que estar en algún lugar de la casona.)",
      contrato:"(Bárbara habló de un negocio. Los papeles deben estar en la oficina.)",
      boleta:"(Bárbara nunca dijo dónde estaba esa noche. Tengo que insistir.)"},
    end:[{who:"ines",mood:"serious",text:"(Ya sé quién fue.)"},
         {who:"ines",mood:"serious",text:"(Ahora tengo que demostrarlo. Prueba por prueba.)"}],
    places:{
      locutorio:{name:"Locutorio — Tadeo", moves:["locutorio_rocky","comisaria","casona"],
        people:[{who:"tadeo", back:[{who:"tadeo",mood:"down",text:"Abogado..."}]}],
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
                     {who:"ines",mood:"down",text:"(Lo conoció un día. Y esa misma noche se lo mataron.)"},
                     {who:"ines",mood:"serious",text:"(Necesito saber qué dicen los informes nuevos. A la comisaría.)"}]},
           lines:[{who:"tadeo",text:"Ya le conté todo, abogado."}]},
          {id:"t_te", who:"tadeo", t:"El té de esa noche", lines:[
            {who:"tadeo",text:"La señora Malva me lo llevó a la pieza. Insistió en que me lo tomara caliente."},
            {who:"tadeo",mood:"think",text:"Era más amargo que el del primer día. Pensé que era otra hierba."}]},
        ]},
      locutorio_rocky:{name:"Locutorio — Rocky Saavedra", bg:"locutorio", req:{flags:["rocky_pide"]}, moves:["locutorio","comisaria"],
        people:[{who:"rocky", hello:[{who:"rocky",mood:"angry",text:"¿Usted es el abogado del cabro?"},
                                     {who:"rocky",mood:"angry",meet:"rocky",text:"¡Yo no maté a nadie, ¿ya?! ¡A nadie!"}],
                              back:[{who:"rocky",mood:"down",text:"¿Otra vez? Ya le dije todo."}]}],
        talk:[
          {id:"r_noche", who:"rocky", t:"Esa noche", lines:[
            {who:"rocky",mood:"angry",text:"Le disparé pa' asustarlo. ¡Y el viejo me disparó de vuelta!"},
            {who:"rocky",mood:"sweat",text:"Vi el fogonazo detrás de él. Arranqué. ¿Qué iba a hacer?"}]},
          {id:"r_deuda", who:"rocky", t:"Su deuda con Leonel", lines:[
            {who:"rocky",mood:"down",text:"Le debía cinco palos. Me iba a quitar el taller. Es lo único que tengo."}]},
          {id:"r_huida", who:"rocky", t:"La huida", lines:[
            {who:"rocky",mood:"sweat",text:"Bajé a toda velocidad. No sé ni por dónde. Iba temblando."},
            {who:"rocky",mood:"down",text:"En Templeman choqué con algo... un tarro de basura, creo. No paré."},
            {who:"ines",mood:"think",text:"(Templeman. ¿Por qué me suena esa esquina?)"}]},
        ],
        present:{
          rocky:{fotocam:[
            {who:"ines",text:"Su camioneta tiene un soporte vacío en el parabrisas. ¿Dónde está la cámara?"},
            {who:"rocky",mood:"sweat",text:"...En el taller. La escondí. Me graba disparando."},
            {who:"rocky",mood:"down",flag:"taller",text:"Pero si sirve pa' algo... la llave está en mi chaqueta."}],
            default:[{who:"rocky",mood:"angry",text:"¿Y eso qué, abogado?"}]},
        }},
      comisaria:{name:"Comisaría", req:{flags:["sil:madre3"]}, moves:["locutorio","locutorio_rocky","casona","taller"],
        people:[
          {who:"eduardo", hello:[{who:"eduardo",mood:"sweat",text:"Valdivia. Llegaron informes nuevos. No le van a gustar al fiscal."},
                                 {who:"eduardo",mood:"write",evidence:"fotocam",text:"Y ubicamos la camioneta del video. Rodrigo Saavedra, mecánico. Lo detuvimos anoche."},
                                 {sfx:"badum",who:"eduardo",text:"Tenía un revólver calibre .38. Igual que la bala del marco."},
                                 {who:"eduardo",flag:"rocky_pide",text:"Está en el locutorio. Y pidió hablar con usted, fíjese."}],
                          back:[{who:"eduardo",text:"¿Necesita algo más? Rápido, que me miran feo."}]}],
        talk:[
          {id:"d_polvora", who:"eduardo", t:"El examen de pólvora", lines:[
            {who:"eduardo",evidence:"polvora",text:"Pólvora en las manos del cabro: negativo."},
            {who:"eduardo",mood:"sweat",text:"El fiscal dice que se lavó. A mí... no me cuadra."}]},
          {id:"d_sangre", who:"eduardo", t:"¿Le sacaron sangre a Tadeo?", req:{ev:["taza"]}, lines:[
            {who:"ines",text:"Tadeo durmió como piedra con dos disparos al lado. ¿Le tomaron muestra de sangre?"},
            {who:"eduardo",mood:"write",text:"...Sí. Protocolo. Llegó hoy."},
            {sfx:"badum",who:"eduardo",mood:"shock",evidence:"sangre",text:"Clonazepam. Harto. Eso no es el remedio del mareo."}]},
          {id:"d_arma", who:"eduardo", t:"La pistola", lines:[
            {who:"eduardo",mood:"write",text:"La busqué en el registro de armas. Esta vez lo revisé todo."},
            {sfx:"badum",who:"eduardo",evidence:"inscripcion",text:"Inscrita en 2015... a nombre de Leonel Ferrada."},
            {who:"ines",mood:"shock",text:"(¿«Odiaba las armas»?)"}]},
        ],
        present:{
          eduardo:{default:[{who:"eduardo",text:"Ya le di todo lo que podía, Valdivia."}]}}},
      taller:{name:"Taller de Rocky", req:{flags:["taller"]}, moves:["comisaria"],
        examine:[
          {id:"cajon", t:"La caja de herramientas", lines:[
            {who:"ines",mood:"think",evidence:"tarjeta",text:"(La cámara del tablero. Con su tarjeta de memoria.)"},
            {sfx:"badum",who:"ines",mood:"shock",anim:"hit",text:"(23:41... un fogonazo en la puerta. Y otro, dos segundos después, dentro del pasillo.)"},
            {who:"ines",mood:"serious",text:"(Una silueta de pelo largo. Con delantal.)"},
            {who:"ines",mood:"think",text:"(La grabación sigue... pero esto es lo que necesito. El resto, que lo vea el tribunal.)"},
            {who:"ines",mood:"serious",text:"(Tengo que volver a la casona. Ahora.)"}]},
          {id:"banco", t:"El banco de trabajo", lines:[
            {who:"ines",mood:"think",text:"(Grasa, herramientas... y una foto de Rocky con una niña chica. ¿Su hija?)"}]},
          {id:"calendario", t:"El calendario", lines:[
            {who:"ines",mood:"think",text:"(De 2019. Nadie le ha dado vuelta la hoja en años.)"}]},
        ]},
      casona:{name:"Casona Ferrada", req:{ev:["tarjeta"]}, moves:["oficinahostal","comisaria","locutorio"],
        people:[
          {who:"malva", hello:[{who:"malva",mood:"sweat",text:"Abogado... ¿otra vez por aquí? Pase. Ya no sé qué más quieren de esta casa."},
                               {who:"malva",mood:"angry",flag:"barbara_ofi",text:"Y la señora Plusvalía anda en la oficina revolviendo papeles. Que se vaya luego."}],
                        back:[{who:"malva",mood:"smile",text:"¿Se le quedó algo, abogado?"}]}],
        examine:[
          {id:"marco3", t:"El marco de la puerta", area:[0,0,28,172], lines:[
            {who:"ines",mood:"think",text:"(El agujero de la bala .38 sigue ahí. Ya nadie lo mira.)"}]},
          {id:"flores3", t:"Las flores", area:[204,54,28,30], lines:[
            {who:"ines",mood:"think",text:"(Las hortensias ya están marchitas. Nadie las cambió esta vez.)"}]},
          {id:"pasillo3", t:"El pasillo", area:[112,8,72,124], req:{not:["vio_bano"]}, lines:[
            {who:"ines",mood:"think",text:"(El pasillo. A un costado, el baño de la casa.)"},
            {who:"ines",mood:"think",flag:"vio_bano",text:"(Tadeo durmió como piedra. ¿Habrá algo ahí que lo explique?)"}],
           again:[{who:"ines",mood:"think",text:"(El pasillo de nuevo.)"}]},
          {id:"bano", t:"El baño del pasillo", area:[112,8,72,124], req:{ev:["sangre"],flags:["vio_bano"]}, lines:[
            {who:"ines",mood:"shock",evidence:"receta",text:"(Un frasco de clonazepam casi vacío. Receta a nombre de... Malva Ferrada.)"}]},
        ],
        talk:[
          {id:"m_hoy", who:"malva", t:"¿Cómo está?", lines:[
            {who:"malva",mood:"down",text:"Cansada. ¿Le sirvo un tecito, abogado?"},
            {who:"ines",mood:"sweat",text:"(No, gracias. Hoy no.)"}]},
          {id:"m_mano", who:"malva", t:"Su mano", lines:[
            {who:"malva",mood:"sweat",text:"Ya le dije. El cuchillo del pan."},
            {who:"ines",mood:"think",text:"(Un corte justo entre el pulgar y el índice. Raro para un cuchillo.)"}]},
        ]},
      oficinahostal:{name:"Oficina del hospedaje", req:{flags:["barbara_ofi"]}, moves:["casona"],
        people:[{who:"barbara", hello:[{who:"barbara",mood:"shock",text:"¡Ay! Usted otra vez."},
                                       {who:"barbara",mood:"angry",text:"Vine a buscar mis papeles. Esta casa me da escalofríos."}]}],
        talk:[
          {id:"b_noche3", who:"barbara", t:"¿Dónde estaba esa noche?", lines:[
            {who:"barbara",mood:"sweat",text:"...Está bien. En un bar del plan. No quería que mi empresa lo supiera."},
            {who:"barbara",evidence:"boleta",text:"Aquí está la boleta del taxi. Salí 23:14, volví 00:28."}]},
          {id:"b_adelanto", who:"barbara", t:"El negocio de la casona", req:{ev:["boleta"]}, lines:[
            {who:"barbara",mood:"smug",flag:"adelanto",text:"Pregúntele a Malva por los 40 millones que le adelantamos. Sin que su padre supiera."},
            {who:"ines",mood:"shock",text:"(¿Malva vendió la casa a escondidas?)"}]},
        ],
        examine:[
          {id:"contrato", t:"Las carpetas del escritorio", area:[0,50,38,56], req:{flags:["adelanto"]}, lines:[
            {who:"ines",mood:"think",evidence:"contrato",text:"(Aquí está: 40 millones de adelanto por la casona. Firmado solo por Malva.)"}]},
          {id:"cajonvacio", t:"El cajón forzado", area:[28,96,66,40], lines:[
            {who:"ines",mood:"think",text:"(Forzado. Vacío. Del tamaño justo para una pistola.)"}]},
          {id:"reservas", t:"El libro de reservas", area:[16,58,66,34], lines:[
            {who:"ines",mood:"think",text:"(Ordenado, con letra de mujer. Malva lleva todo al centavo.)"}]},
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
        {who:"fiscal",mood:"sweat",text:"Una silueta de pelo largo. Con... delantal."},
        {who:"jueza",mood:"serious",text:"Que se reproduzca la grabación completa. Hasta el final."},
        {who:"ines",mood:"think",text:"(La camioneta arranca. Baja el cerro. Dobla en Templeman...)"},
        {who:"ines",mood:"think",text:"(En las luces aparece una mujer cruzando. Con un moño rosado.)"},
        {sfx:"badum",who:"ines",mood:"shock",anim:"hit",music:null,text:"(...Coté.)"},
        {who:"ines",mood:"down",text:"(El «tarro de basura». Era ella.)"},
        {who:"rocky",mood:"down",read:["rocky","Fue él quien atropelló a Coté en Templeman y no se detuvo."],text:"...¿Esa es su amiga, abogado? Yo... no sabía. Le juro que no sabía."},
        {who:null,text:"Perfil actualizado: Rodrigo Saavedra."},
        {who:"fiscal",mood:"serious",text:"La fiscalía lo sabía, Su Señoría. Ese hecho se juzgará aparte. Hoy juzgamos un homicidio."},
        {who:"ines",mood:"serious",text:"(Respira, Justo. Coté está bien. Y Tadeo te necesita entero.)"},
        {who:"jueza",mood:"serious",music:"persecucion",text:"Continuemos. Que vuelva a declarar la señora Malva Ferrada."}]},
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
      {id:"a", mood:"worried", text:"Tadeo se tomó su pastilla del mareo y se durmió temprano.", contra:"receta",
       press:[{who:"ines",text:"¿Solo la pastilla?"},{who:"malva",mood:"smile",text:"Y mi té. Un té no le hace mal a nadie."}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"En su sangre había [r]clonazepam[/r]. Y el frasco del baño tiene receta a su nombre."},
        {who:"malva",mood:"panic",anim:"hit",text:"..."}]},
    ]},
  m4: {who:"malva", title:"Cualquiera tiene el pelo largo", music:"persecucion",
    loopHint:[{who:"ines",mood:"think",text:"(¿Dónde estaba Bárbara a las 23:41?)"}],
    statements:[
      {id:"b", mood:"c2", text:"¡La silueta del video puede ser cualquiera! ¡La señora Plusvalía tiene el pelo largo!", contra:"boleta",
       press:[{who:"ines",text:"¿La señora Plusvalía?"},{who:"malva",mood:"angry",text:"¡Ella quería la casa más que nadie!"}],
       contraLines:[
        {who:"ines",bubble:"objecion",pose:"point",anim:"slam",text:"La señora Plusvalía salió en taxi a las 23:14 y volvió a las 00:28."},
        {who:"ines",mood:"serious",text:"Y la cámara municipal la grabó saliendo. A las 23:41 no estaba en la casona."}]},
    ]},
};

/* ---------- INTERROGATORIOS DE LA FISCALÍA (Penna pregunta, Justo puede protestar) ---------- */
const DIRECT = {
  p_aurelio: {title:"La fiscalía interroga a Aurelio Mirón", music:"interrogatorio",
    tutorial:[{who:"ines",mood:"think",text:"(Penna va a interrogar a su testigo. Si le sopla la respuesta o da algo por hecho: protesto.)"}],
    questions:[
      {who:"fiscal", text:"Señor Mirón, ¿desde dónde observaba la calle esa noche?",
       a:[{who:"aurelio",mood:"smug",text:"Desde mi ventana, en el segundo piso. Con mis binoculares alemanes."}]},
      {who:"fiscal", pose:"point", text:"Y desde ahí vio claramente al acusado en la ventana, ¿no es así?", bad:"sugiere",
       a:[{who:"aurelio",mood:"smile",text:"¡Claro que sí! Clarito."}],
       miss:[{who:"ines",mood:"sweat",text:"(Espera. Penna le dictó la respuesta. Aurelio solo tuvo que decir «sí».)"},
             {who:"ines",mood:"serious",text:"(Eso se protesta. Otra vez, con atención.)"}],
       ok:[{who:"jueza",mood:"serious",text:"Ha lugar. Fiscal, no le sople las respuestas a su testigo."},
           {who:"fiscal",mood:"smug",pose:"cafe",text:"Veo que sigue estudiando, Valdivia. Reformulo: ¿qué vio después de los disparos?"},
           {who:"aurelio",mood:"think",text:"Vi... a alguien. Con algo en la mano. Eso lo cuento bien en mi testimonio."}]},
      {who:"fiscal", text:"¿Cuántos disparos escuchó?",
       a:[{who:"aurelio",mood:"shock",text:"¡Dos! Pum, pum. Casi juntos."}],
       noObj:[{who:"ines",mood:"down",text:"(Era una pregunta limpia. No le sopló nada.)"}]},
      {who:"fiscal", mood:"smug", text:"¿Cuánto tardó el acusado en esconder el arma en su mochila?", bad:"supone",
       a:[{who:"aurelio",mood:"confused",text:"Eh... ¿un ratito?"}],
       miss:[{who:"ines",mood:"think",text:"(Un momento. ¿Quién probó que fue Tadeo el que escondió el arma? Nadie.)"},
             {who:"ines",mood:"serious",text:"(Penna lo metió en la pregunta como si fuera un hecho. Eso se protesta.)"}],
       ok:[{who:"jueza",mood:"serious",text:"Ha lugar. Nadie ha probado todavía quién escondió el arma."},
           {who:"fiscal",pose:"cafe",text:"Retiro la pregunta. *sorbo*"}]},
    ],
    end:[{who:"fiscal",mood:"smug",text:"No más preguntas. Que el testigo cuente lo que vio, con sus palabras."}]},

  p_malva: {title:"La fiscalía interroga a Malva Ferrada", music:"interrogatorio",
    tutorial:[{who:"ines",mood:"think",text:"(Penna va a intentar salvar a su testigo. Atento a cada pregunta.)"}],
    questions:[
      {who:"fiscal", text:"Señora Ferrada, ¿dónde estaba usted a las 23:40?",
       a:[{who:"malva",mood:"sweat",text:"En la cocina. Lavando las tazas del té."}]},
      {who:"fiscal", mood:"smug", text:"Usted, una hija devota, jamás le haría daño a su padre, ¿verdad?", bad:"sugiere",
       a:[{who:"malva",mood:"down",text:"Jamás. Era mi papá."}],
       miss:[{who:"ines",mood:"sweat",text:"(Le puso la respuesta en la boca. Debí protestar.)"}],
       ok:[{who:"jueza",mood:"serious",text:"Ha lugar. Fiscal, esa pregunta contesta sola."},
           {who:"fiscal",mood:"sweat",text:"...Retiro la pregunta."}]},
      {who:"fiscal", text:"¿Su padre tenía enemigos?",
       a:[{who:"malva",text:"Prestaba plata a interés. Medio cerro le debía."}],
       noObj:[{who:"ines",mood:"down",text:"(Era una pregunta abierta. No había trampa.)"}]},
      {who:"fiscal", text:"Cuando vio al acusado con la pistola, ¿qué hizo usted?", bad:"supone",
       a:[{who:"malva",mood:"sweat",text:"Me... me escondí. Tenía mucho miedo."}],
       miss:[{who:"ines",mood:"think",text:"(Ella nunca dijo que vio a Tadeo con una pistola. Penna lo dio por hecho.)"}],
       ok:[{who:"jueza",mood:"serious",text:"Ha lugar. La testigo nunca declaró haber visto una pistola en manos del acusado."},
           {who:"fiscal",mood:"angry",text:"...No más preguntas, Su Señoría."}]},
    ],
    end:[{who:"jueza",mood:"serious",text:"La defensa puede contrainterrogar."}]},
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
  {cmd:"location", text:"15 de marzo · 8:10\nHospital Van Buren", pos:"hospital"},
  {who:"cote",pos:"hospital",mood:"sweat",text:"Ya, deja de mirarme así. Pierna quebrada, nada más. Ya me puse la anestesia de chiste."},
  {who:"ines",pos:"hospital",mood:"serious",text:"¿Te acuerdas de algo? ¿Cualquier cosa?"},
  {who:"cote",pos:"hospital",mood:"down",text:"Unas luces que me encandilaron. Ni el color de la camioneta vi. Y no paró."},
  {who:"ines",pos:"hospital",mood:"angry",text:"Carabineros no tiene nada. Ni patente, ni testigos. Nada."},
  {who:"ines",pos:"hospital",mood:"serious",text:"Lo voy a encontrar, Coté. Te lo prometo."},
  {who:"cote",pos:"hospital",mood:"smile",text:"Mi abogado favorito. El único que tengo, pero igual."},
  {who:"ines",pos:"hospital",mood:"shock",text:"(El teléfono. Número desconocido.)"},
  {who:"eduardo",pos:"hospital",phone:true,text:"¿Valdivia? Habla Estuardo. Eduardo Estuardo, de la PDI."},
  {who:"eduardo",pos:"hospital",phone:true,text:"Tengo un caso. Asesinato en Cerro Concepción. Un solo sospechoso: un mochilero."},
  {who:"eduardo",pos:"hospital",phone:true,text:"Y pensé... ¿a quién se lo doy? Al hijo del taxista."},
  {who:"ines",pos:"hospital",mood:"think",text:"¿Por qué yo?"},
  {who:"eduardo",pos:"hospital",phone:true,text:"Porque esta vez es más complicado. No es un cuadro: es un muerto."},
  {who:"eduardo",pos:"hospital",phone:true,text:"Y porque el cabro dice que no fue. Igual que su viejo."},
  {who:"ines",pos:"hospital",mood:"down",text:"(...)"},
  {who:"cote",pos:"hospital",mood:"shock",text:"¡Justo! ¡La tele! ¡Mira!"},
  {who:null,pos:"hospital",text:"«...el fiscal a cargo será Máximo Penna: dieciocho juicios, diecisiete condenas.»"},
  {who:null,pos:"hospital",text:"«Según fuentes, varios defensores ya rechazaron el caso.»"},
  {who:null,pos:"hospital",text:"«El único que le ha ganado es un defensor novato: Justo Valdivia.»"},
  {who:"cote",pos:"hospital",mood:"excited",text:"¡Saliste en la tele! ¡Con nombre y todo!"},
  {who:"ines",pos:"hospital",mood:"sweat",text:"(Y con Penna al frente otra vez.)"},
  {who:"cote",pos:"hospital",mood:"serious",text:"Anda. Ese cabro no tiene a nadie. Y yo no puedo acompañarte."},
  {who:"cote",pos:"hospital",mood:"smile",text:"Y si de paso encuentras al de la camioneta, mejor."},
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
  {cmd:"direct", ref:"p_aurelio"},
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
  {sfx:"badum",who:"fiscal",pose:"point",text:"Ese hijo es [r]el acusado[/r]. Vino a cobrar su herencia antes de tiempo."},
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
  {cmd:"direct", ref:"p_malva"},
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
       {who:"malva",mood:"c7",text:"¡Él me iba a dejar sin nada por un cabro que conoció ayer!"}]},
  {cmd:"breakdown", who:"malva", seq:["c3","c4","c5","c6","c7","c8"]},
  {who:"fiscal",mood:"serious",text:"La fiscalía retira los cargos contra el señor Fuegos. Y formalizará a Malva Ferrada."},
  {who:"jueza",mood:"smile",text:"Ahora sí estoy contenta. Este tribunal declara al acusado, Tadeo Fuegos..."},
  {cmd:"verdict", text:"NO CULPABLE", good:true},
  {cmd:"music", track:"victoria"},
  // ===== FINAL =====
  {cmd:"location", text:"Hospital Van Buren", pos:"hospital"},
  {who:"cote",pos:"hospital",mood:"excited",text:"¡Ganaste! ¡Y sin mí! No sé si alegrarme o sentirme ofendida."},
  {who:"rocky",pos:"hospital",mood:"beg",text:"Señorita... yo fui el de la camioneta. Vengo a pedirle perdón. Y a entregarme por lo suyo."},
  {who:"cote",pos:"hospital",mood:"serious",text:"...Gracias por venir. De verdad."},
  {who:"tadeo",pos:"hospital",mood:"down",text:"Abogado. Creo que me voy a quedar en Valparaíso. Es lo único que tengo de él."},
  {who:"ines",pos:"hospital",mood:"smile",text:"(Hoy también alguien se dio el trabajo de escuchar.)"},
  {who:null,pos:"hospital",text:"FIN DEL CASO 2 — «Dos disparos en Cerro Concepción». (BORRADOR)"},
  {cmd:"end"},
];

return {titulo:"Dos disparos en Cerro Concepción", numero:2,
  intro:"Dos disparos en la misma noche. Un mochilero dormido. Y Coté en el hospital: esta vez, Justo está solo. (Borrador jugable.)",
  CHARS, BGLABELS, EVIDENCE, EVIMG, EVX, PROFILES, INV, CROSS, DIRECT, SCRIPT};
})();
