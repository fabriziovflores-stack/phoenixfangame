# ACTA CERO — guía para Claude Code

El dueño del proyecto **no programa**: escribe y diseña. Explícale los cambios en español simple,
sin jerga, y prueba siempre el juego completo antes de dar algo por terminado.

## Qué es
Juego de juicios en HTML/JS sin dependencias ni build. Se abre `index.html` y funciona.
Los scripts son clásicos (no módulos) y comparten ámbito global; **el orden de carga importa**:
`js/casos.js` → `casos/caso1.js` → `casos/caso2.js` → `js/audio.js` → `js/sprites.js` → `js/assets.js` → `js/engine.js`
→ `js/investigacion.js` → `js/musica.js`.

**Varios casos:** cada `casos/casoN.js` se registra como `CASOS.casoN = (()=>{ ...; return {titulo, numero, intro, CHARS, ...}; })()`.
`useCase()` (js/casos.js) copia sus datos a las variables globales que usa el motor. La portada tiene botones
para elegir caso; cada caso guarda su partida aparte (`actacero_casoN_v1`). Personajes sin hoja de arte usan el
dibujo provisorio por código (`look` en CHARS). Lugares sin fondo muestran un cartel (`BGLABELS` del caso).

## Pantalla
Formato Nintendo DS: dos pantallas 4:3. La escena se dibuja a **256×192** y se amplía con píxeles
marcados. Cambio de cámara = **corte directo** del fondo, sin fundido. **Tiempos (pauta del dueño, tabla `T` en engine.js):** letra 35 ms
(rápido 20, nervioso 50 si la cara es sweat/worried/panic, drama 75 en revelaciones); coma 100; punto 180; «...» 450;
`[p]` 450; cambio de cámara en el juicio 150 antes de hablar; personaje nuevo: fundido 300 (`ENTRADA_MS`) + 120 y habla;
animación previa 250; revelación (`sfx:"badum"` o `pos:"rayos"`) 650 de silencio; cambio de ubicación 750 (fundido a negro);
tarjeta de día 1100; mazo del inicio del juicio 1300. Una línea puede forzar `speed:"rapido"|"nervioso"|"drama"` o un número.
El dueño quiere el juego **pausado**. Al llegar por primera vez a un lugar
(cada día) sale el letrero de fecha · hora · lugar escrito letra por letra (`locCard`; `fecha`, `hora`, `paso` en INV.diaN).
El tecleo puede reemplazarse en «Mi música» (`sfx_lugar`).
Capas de la pantalla superior: fondo (`#bg`) → personaje (`#spr`) → mueble (`#desk`) → caja de texto.

## Formato del guion (`casos/caso1.js`, `casos/caso2.js`)
- `CHARS`: personajes (nombre visible, voz, posición: defensa/fiscalia/estrado/juez).
  Las claves internas son históricas: `ines` = Justo (protagonista), `testigo` = Llavín, `gerardo` = perfil de Llavín.
  `eduardo` = Eduardo Estuardo, investigador (aparece al final del Caso 1).
- `EVIDENCE` (expediente inicial) y `EVX` (pruebas que entran durante el caso). `read` = lectura inicial.
- `CROSS`: contrainterrogatorios. Cada declaración: `text`, `press` (líneas al presionar),
  `contra` (id o lista de ids de la prueba correcta) + `contraLines`, `adds` (agrega una declaración oculta, marcada `hidden:true`; hoy: Llavín «partí para la sala» → «ventana desde la calle»),
  `ends:true` (presionar esa declaración cierra el contrainterrogatorio), `mood`, `fiscal:[líneas]` (lo que dice Penna tras presionar
  esa declaración; si no hay, sale una del repertorio `FISCAL_PRESS` del caso, por turno: Penna interrumpe en cada presión).
  `early:{ids,lines}`: prueba correcta pero antes de tiempo; se muestran esas líneas sin castigo (hoy no se usa).
  `loopHint`: pista de Chayo al completar la primera vuelta (o la vuelta N con `hintLoops:N` en el testimonio); una línea con `ifHidden:"id"` solo sale si esa declaración sigue oculta.
- `DIRECT`: interrogatorios directos (la fiscalía pregunta, el jugador puede objetar). Cada pregunta: `text`,
  `a` (respuesta), `bad` (id del motivo en `OBJ_REASONS` si es tramposa), `ok` (objeción acertada), `miss`
  (pista si la deja pasar; la pregunta se repite sin castigo), `noObj` (comentario si objeta una pregunta limpia). `coach` = consejo que se muestra una sola vez después de la pregunta (tutorial).
  Motivo equivocado u objetar una pregunta limpia = penalización (`DIRECT_LINES`).
- `SCRIPT`: lista de pasos. Una línea es `{who, mood, pose, anim, text}`. Comandos: `music`, `location`,
  `gavel`, `cross`, `direct`, `choice` (elegir respuesta, sin penalización; una opción con `then:[líneas]` es un camino propio y no se repite), `present` (presentar prueba o perfil),
  `breakdown`, `verdict`, `end`, `negro` (fundido a negro y vuelta, `ms`, `pos` = escena vacía al volver; sirve para llamar
  a un testigo: jueza «Llamaremos a…» → negro → el testigo aparece con `wait:ms` y saluda), `cine` (`img`, `text`, opcional `sfx`/`flash`/`shake`: imagen 256×192 a pantalla completa,
  en `assets/cine/`; originales en `arte-original/cine/`), `senalar` (`img`, `area:[x,y,ancho,alto]`, `ayuda`, `wrong`: la imagen ocupa la pantalla de arriba
  y hay que tocar el punto exacto; fallar quita vida; se usa dentro de `contraLines`, hoy en la foto de las 23:24 del Caso 1). `present` con `soft:true` no castiga: al fallar muestra `wrong` y repite.
- **Ritmo como en la DS** (ver el video de referencia del dueño): dentro del texto, `[p]` = pausa, `[m=emoción]` = cambia la cara
  a mitad de frase, `[a=slam|hit|tremble]` = animación, `[s]` = temblor, `[f]` = destello. Los «...» se escriben lento.
  Cuando alguien interrumpe (burbuja o golpe en la mesa) y cambia la cámara entre defensa/estrado/fiscalía, hay un **barrido**
  rápido (`PAN_MS` en engine.js; 0 = todo corte directo; `pan:false` en una línea lo evita). `pos:"rayos"` = primer plano
  dramático con rayos azules. Al terminar un testimonio la escena se oscurece. Al empezar un testimonio cae el letrero dibujado «Testimonio del Testigo» (`assets/hud/titulo-*.png`, `logoCard`); antes de un
  contrainterrogatorio o un interrogatorio de Penna, el letrero rojo sale arriba y **al mismo tiempo** el enfrentamiento en la pantalla de abajo
  (`logoCard(img,título,fin,true)`; recreado del video de referencia del dueño: el letrero entra partido en dos mitades, brillo,
  nombre escrito en franja oscura, sale separándose en diagonal; abajo destello blanco al final. Caras de Justo y Penna en dos franjas, `assets/hud/vs_*.png`, recortadas con `herramientas/vs.py`).
  Estos letreros **no se pueden saltar** (el dueño lo pidió): la música se calla y suena `testimonio.wav`; duran lo mismo que ese sonido (`LOGO_MS`). Etiqueta de esquina: Testimonio /
  Contrainterrogatorio / Interrogatorio. Preferir cuadros cortos y reacciones breves («¡¿Q-qué?!», «Mmm...»).
- En una línea: `evidence:"id"` hace entrar la prueba al expediente (el juego se detiene, baja el panel y
  espera al jugador); `read:["id","nueva lectura"]` reinterpreta una prueba; `damage:true` penaliza;
  `music:null` corta la música; `phone:true` = la persona habla por teléfono (no se la ve, nombre con 📞); `confetti:true` lanza confeti sobre la escena; `show:"id"` muestra en grande una prueba que ya está en el expediente. `[r]texto[/r]` = rojo. Un texto que empieza con `(` es pensamiento (letra celeste). Solo en Justo la boca queda quieta; en los demás es un susurro y la boca se mueve.
- `INV` (investigación; formato completo al inicio de `js/investigacion.js`): `{cmd:"invest", ref:"dia1"}` abre la
  investigación: lugares con Examinar / Hablar / Presentar / Moverse; termina cuando se cumple `done` (pruebas/marcas).
  `req:{flags,ev,not}` condiciona lugares, personas, temas y objetos. **Silencio**: un tema con `silence` se rompe
  presentando pruebas en orden (`steps`); fallar quita vida (en la investigación nunca baja de 1).
  En líneas: `flag:"x"` marca algo, `meet:"id"` agrega un perfil marcado `hidden:true`.
  **Examinar = tocar el lugar** (como en la DS): cada objeto lleva `area:[x,y,ancho,alto]` en coordenadas 256×192; se toca
  la **pantalla de arriba** (el cuadro de texto se esconde mientras se examina; la mirilla es `#mira`). Sin fondo dibujado o sin `area`, se usa una lista. **Una sola persona por lugar**
  (si hay varias en `people`, se muestra la primera cuyo `req` se cumple). En la investigación **a Justo no se le ve**:
  sus líneas se leen sobre el lugar o sobre la persona presente.
  **Los lugares se abren de a uno**: cada lugar tiene `req` atado a una conversación o hallazgo (el dueño no quiere todo
  abierto desde el inicio), Justo dice adónde ir, y al abrirse sale el aviso «🚶 Nuevo lugar».
  **💭 Pensar** (botón de la investigación): Justo dice qué le falta, usando `hints` del día ({idPruebaOMarca: texto}).
  Los archivos de index.html llevan `?v=<versión>` para que el celular no use copias viejas.
  Cada persona de un lugar reacciona a Justo: `hello` (la primera vez que la ve, también si aparece más tarde)
  y `back` (al volver al lugar). En la investigación, quien habla queda en el fondo del lugar actual, no en su puesto del juzgado.
  `{cmd:"card", t1:"— Día 1 —", t2:"Investigación"}` muestra la tarjeta de día. `breakdown` acepta `who` y `seq`
  (lista de emociones que se pasan como animación; Malva usa `c3`…`c8`, su hoja de colapso, sin boca animada).
- Una prueba con `ver:"ruta.png"` muestra el botón «🔍 Ver en grande» en el expediente: la imagen ocupa la pantalla de
  arriba (`verPrueba`). El plano de la casona (`assets/pruebas/plano.png`) se dibujó a partir de los hechos del caso.
- Emociones disponibles por personaje: ver `AMAP` en `js/engine.js`. Si usas una que no existe, cae a `normal`.

## Reglas de escritura (del dueño; ver `docs/brief-de-guion.md`)
- Construir primero la verdad y planificar de atrás hacia adelante. Misterio justo: toda pista aparece antes de exigirla.
- Ninguna confesión reemplaza a la demostración. La fiscalía es competente. La jueza exige prueba para cada afirmación.
- Una idea por cuadro de texto, **máximo ~120 caracteres**. Chilenismos moderados. Sin chistes en los momentos dolorosos.
- Después de cada prueba nueva, alguien la comenta (humor o pista al pasar).
- El Caso 1 es tutorial: **solo juicio**. La investigación se estrena en el Caso 2.

## Arte
Las hojas de personajes son cuadrículas 4×4 sobre verde croma, en **pares**: boca cerrada / boca abierta.
Proceso (scripts en `herramientas/`, escritos para un entorno puntual: adaptar rutas antes de usarlos):
1. Quitar el croma. 2. Cuadro «hablando» = cuadro de boca cerrada + solo la boca del otro (así el cuerpo no tiembla).
3. Igualar el tamaño y la posición de la cabeza entre emociones. 4. Reducir a 256×192 con color de 15 bits.
Los PNG de `assets/` ya están procesados: se dibujan tal cual.
Justo (**siempre mira a la derecha**): base/smug/sweat/shock/think/point de `arte-original/justo-perfil-b.png` (+ `justo-apunta.png`,
cuadros `ap1`…`ap16` para levantar el brazo; `herramientas/justo.py`). Hojas nuevas 4×2 en pares exactos:
`justo-v2-b.png` (cruzado, serious, sad, confused), `justo-v2-c.png` (slam, hit, relieved, angry2), `justo-v2-d.png` (ld1–ld4 =
animación de ponerse los lentes y tomar el papel; papel y papelThink en pares). Se procesan con
`ANCHOR=cell REFK=<1|5> FACER=1 SHEET=… GX=4 GY=2 TABLA=justoB|C|D HH=110 HEADY=… python3 herramientas/penna4.py CARPETA <tam> 0 -45`
(tamaño/posición igualados al `base.png` actual: cabeza arriba en y=13, ancho ~58). Emociones: ver `AMAP.ines` (think = brazos
cruzados, confused, serious, sad, relieved, hit = golpeado por la objeción); poses `point`, `papel`, `papelThink`, `slam`.
Los cuadros vienen corridos a la izquierda para que el brazo al apuntar salga entero; el CSS (`#sprite[data-who=ines]`) compensa.
Penna (mira a la izquierda): cinco hojas 4×2 en pares exactos, `arte-original/penna-v6-a…e.jpg`:
A base/proud/cafe/point · B shock/sweat/angry/facepalm · C cross/think/stop/respect · E smug/twirl/pull/hair (se arregla el bigote,
se tira y se saca un pelo) · D de frente (frente_base/smile/cafe/shock, para fuera del juicio). Se calibran al mismo tamaño
con `ANCHOR=cell REFK=1 SHEET=… GX=4 GY=2 TABLA=pennaA…E HH=110 HEADY=19 python3 herramientas/penna4.py CARPETA <tam> 0 <dx>`
(tamaños y dx en el historial de git; cabeza arriba en y=20, nuca en x=167, ancho ~40). Emociones: ver `AMAP.fiscal`
(proud = mentón arriba, respect = reconoce con respeto); poses `point`, `cafe`, `cruzado`, `alto`, `bigote`, `tirar`, `pelo`.

Chayo (Rosario Velado, practicante y acompañante de Justo; **reemplazó a Coté**, que ya no existe): dos hojas 4×2 en pares
exactos, `arte-original/chayo-v2-a.png` (normal, happy, surprise, think) y `chayo-v2-b.png` (worried, smug, annoyed, point):
`FRONT=1 MOUTHDX=4 SHEET=… GX=4 GY=2 TABLA=chayoA|chayoB HH=110 HEADY=22 python3 herramientas/penna4.py CARPETA 30 0 0`.
Hablar = el cuadro de boca abierta completo, alineado. Todas sus emociones del guion se reparten entre esas 8 (ver `AMAP.chayo`);
`camara`/`foto`/`lentes` hoy no tienen dibujo propio (la cámara ya cuelga en su diseño). Voz femenina.

## Pantalla de abajo (HUD)
Diseño del dueño en `assets/hud/` (originales en `arte-original/hud/`): `panel.jpg` (fondo 4:3 armado del panel), `botones.png`
(Examinar/Mover/Hablar/Presentar × normal/encima/apretado/apagado; clase `hudimg k0..k3`), `brillo.png` (8 cuadros), `expediente.png`,
`dialogo.png` (recuadro de continuar), `flecha.png`. El letrero de arriba a la izquierda (`#hudlabel`) dice Investigación / Juicio / etc.

## Música
Archivos del juego en `assets/musica/` (`MUSIC_GAME` en assets.js; recreaciones del dueño, ver docs/creditos.md): `interrogatorio` =
Moderato, `allegro` (contrainterrogatorios tensos), `logica` (suena sola cuando la jueza pide deducir, `choice`), `objecion` (suena
sola al acertar una contradicción o una prueba), `persecucion` = Cornered, `corte` = Trial (abre el juicio), `espera` = Courtroom Lobby, `suspenso` = Suspense (cinemáticas, entrada de Penna en el Caso 1),
`detencion` = Jailer's Elegy (locutorio del Caso 2). `verdad` = Telling the Truth, `variacion` = Pursuit ~ Cornered (Variation) (golpe final: al presentar la lona, ¡Objeción! + golpe en la mesa en silencio, y en la frase siguiente entra con el zoom mientras Justo habla; suena sin cortes hasta el veredicto).
En una línea, `zoom:true` (con `pos:"rayos"`) = primer plano que se acerca de golpe mientras el personaje habla; si la línea siguiente también lleva zoom, se mantiene.
`{cmd:"zoom", who, mood, pose, music, ms}` = primer plano de golpe sobre rayos con la música que entra en ese instante (sin texto, no se salta).
**Pauta del dueño:** primer testimonio de cada testigo = Moderato; cuando sube la tensión = Allegro; el testimonio suena con su canción
desde la primera lectura. **Objeción acertada:** ¡Objeción! → Justo dice su primera frase con la música que venía → recién en la segunda frase entra Objection! (`conMusica`;
si la primera frase trae su propia `music`, se respeta). **Cornered, Cornered Variation y Telling the Truth no se interrumpen**: mientras suenan, Objection!/Logic and Trick no entran (`MUSICA_TENSA`).
`present` acepta `music` (null = silencio) y `choice` acepta `pickMusic` (al elegir bien); `breakdown` con `keepMusic:true` no corta la música.
Al cambiar de canción (o a silencio) la que termina se apaga con un **fundido** (`FADE_MS` en audio.js; dos reproductores `musicEls`).
Para probar: si solo cambia `casos/casoN.js`, basta recorrer ese caso; si cambia `js/`, recorrer todos.
Un lugar de la investigación puede tener su propia `music` (vuelve la del día al salir). Sin archivo, cada tema cae a la melodía sintetizada
(`TRACKS` en `js/audio.js`, con `TRACK_ALIAS`). El jugador puede elegir canciones de su dispositivo
en «🎵 Mi música» (portada; `js/musica.js`, guardadas solo en su navegador con IndexedDB). También opcional: archivos en `musica-local/` (ignorada por git,
nunca se sube ni se publica) activando `MUSICA_LOCAL` y `MUSIC_FILES` en `js/assets.js`. Si falta un archivo, suena la melodía propia.

## Sonidos
Efectos en archivo en `assets/sonidos/` (`SFX_FILES` en js/assets.js; código abierto según el dueño, ver `docs/creditos.md`):
daño, golpe, prueba nueva, recuerdo (cinemática), revelación (nueva lectura), golpe en la mesa, error, grito (quiebre)
y `badum` (golpe dramático: se pone a mano en una línea con `sfx:"badum"`).
Voz de los diálogos: `assets/sonidos/blip.mp3` (creado por el dueño; `BLIP_FILE`), con el tono de `voice` de cada personaje.
Voces femeninas (`VOCES_FEM` en audio.js: Chayo, Zoila, jueza, Malva, Bárbara) usan `assets/sonidos/blip_f.wav` (`BLIP_F_FILE`).
Objeción y testimonio: `objecion.wav` y `testimonio.wav`. Estos tres son recreaciones del dueño, que declara tener permiso
(ver docs/creditos.md). Todo se puede reemplazar desde «Mi música».
El tecleo de los letreros sigue sintetizado (el archivo que se ofreció era el de Ace Attorney; se usa solo vía «Mi música»).
Orden: archivo elegido por el jugador en «Mi música» → archivo del juego → sonido sintetizado.
Al publicar cambios, subir el número `?v=` de index.html y prueba-final.html.

## Guardado
`localStorage`, clave `actacero_caso1_v1`. Guarda el paso del guion, pruebas, lecturas y penalizaciones.

## Cómo probar
**Siempre antes de publicar**, aunque el cambio sea mínimo: `for f in js/*.js casos/*.js; do node --check $f; done` y abrir el
juego tocando «Nueva partida» (un error de sintaxis en un archivo deja el juego sin arrancar).
`prueba-final.html` = el juego con un botón que salta al veredicto y la escena final del Caso 1, y atajos (`SALTOS`) a momentos clave
(objeción a Zoila, Penna interroga, foto 23:24, la lona, la bitácora); no toca la partida guardada.
No hay tests en el repo. Antes de entregar: recorrer el caso completo (ruta ganadora, una prueba equivocada,
una respuesta equivocada y la derrota) con un navegador automatizado y confirmar que no hay errores de consola.

## Siguientes pasos sugeridos
1. Caso 2: es un **esqueleto jugable con textos de borrador** (diseño en `docs/caso2-diseno.md`). Falta: que el
   dueño escriba los diálogos y la cinemática (7 imágenes). Personajes y fondos del Caso 2: completos
   (prompts en `docs/caso2-prompts.md`).
2. Fondo de detrás de la jueza (Caso 1).
3. Caso 1 = guion del dueño «La X que faltaba» (8 testimonios + interrogatorio de Penna). Pruebas nuevas: boleta, plano1,
   chatvecinal, fotozoila (foto grande `assets/pruebas/foto2324-grande.png`, X en (156,85)), parte, fibra. Íconos con `herramientas/pruebas.py`.
