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
marcados. Cambio de cámara = **corte directo** del fondo (el dueño no quiere fundidos de cámara). Pero cuando **entra un
personaje nuevo** en el mismo lugar (no en un cambio de cámara), aparece con un **fundido lento de 1,5 s** (solo la primera vez que aparece en ese día o juicio; después sale directo. La lista se borra con cada `card`) y recién
entonces habla (`ENTRADA_MS` en engine.js). El dueño quiere el juego **pausado**. Al llegar por primera vez a un lugar
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
  `ends:true` (presionar esa declaración cierra el contrainterrogatorio), `mood`.
  `early:{ids,lines}`: prueba correcta pero antes de tiempo; se muestran esas líneas sin castigo (hoy no se usa).
  `loopHint`: pista de Coté al completar la primera vuelta; una línea con `ifHidden:"id"` solo sale si esa declaración sigue oculta.
- `DIRECT`: interrogatorios directos (la fiscalía pregunta, el jugador puede objetar). Cada pregunta: `text`,
  `a` (respuesta), `bad` (id del motivo en `OBJ_REASONS` si es tramposa), `ok` (objeción acertada), `miss`
  (pista si la deja pasar; la pregunta se repite sin castigo), `noObj` (comentario si objeta una pregunta limpia). `coach` = consejo que se muestra una sola vez después de la pregunta (tutorial).
  Motivo equivocado u objetar una pregunta limpia = penalización (`DIRECT_LINES`).
- `SCRIPT`: lista de pasos. Una línea es `{who, mood, pose, anim, text}`. Comandos: `music`, `location`,
  `gavel`, `cross`, `direct`, `choice` (elegir respuesta, sin penalización), `present` (presentar prueba o perfil),
  `breakdown`, `verdict`, `end`, `cine` (`img`, `text`, opcional `sfx`/`flash`/`shake`: imagen 256×192 a pantalla completa,
  en `assets/cine/`; originales en `arte-original/cine/`). `present` con `soft:true` no castiga: al fallar muestra `wrong` y repite.
- **Ritmo como en la DS** (ver el video de referencia del dueño): dentro del texto, `[p]` = pausa, `[m=emoción]` = cambia la cara
  a mitad de frase, `[a=slam|hit|tremble]` = animación, `[s]` = temblor, `[f]` = destello. Los «...» se escriben lento.
  Cuando alguien interrumpe (burbuja o golpe en la mesa) y cambia la cámara entre defensa/estrado/fiscalía, hay un **barrido**
  rápido (`PAN_MS` en engine.js; 0 = todo corte directo; `pan:false` en una línea lo evita). `pos:"rayos"` = primer plano
  dramático con rayos azules. Al terminar un testimonio la escena se oscurece. Etiqueta de esquina: Testimonio /
  Contrainterrogatorio / Interrogatorio. Preferir cuadros cortos y reacciones breves («¡¿Q-qué?!», «Mmm...»).
- En una línea: `evidence:"id"` hace entrar la prueba al expediente (el juego se detiene, baja el panel y
  espera al jugador); `read:["id","nueva lectura"]` reinterpreta una prueba; `damage:true` penaliza;
  `music:null` corta la música; `phone:true` = la persona habla por teléfono (no se la ve, nombre con 📞); `confetti:true` lanza confeti sobre la escena. `[r]texto[/r]` = rojo. Un texto que empieza con `(` es pensamiento.
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
Justo: poses de `arte-original/justo-perfil-b.png` (perfil, **siempre mira a la derecha**), más dos hojas de animación:
`justo-apunta.png` (cuadros `ap1`…`ap16`: levanta el brazo, apunta y lo baja) y `justo-lentes.png` (`le1`…`le16`: se pone
los lentes y toma un papel). `TRANS` en engine.js pasa esos cuadros al entrar o salir de `pose:"point"` y `pose:"papel"`
(`papelThink` = pensando con el papel). Las tres hojas se alinean juntas con `herramientas/justo.py` (args: carpeta 50 142 -20). Los cuadros vienen corridos
a la izquierda para que el brazo al apuntar salga entero; el CSS (`#sprite[data-who=ines]`) compensa la posición.
Penna: de perfil. Normal, `cruzado`, `puno` y `point` salen de `arte-original/penna-v4.jpg` (4×2, medio cuerpo):
`SHEET=arte-original/penna-v4.jpg GX=4 GY=2 TABLA=v4 HH=140 HEADY=20 python3 herramientas/penna4.py CARPETA 46 0 18`.
El resto de las caras, de `penna-v3.jpg` al mismo tamaño: `HH=110 HEADY=20 python3 herramientas/penna4.py CARPETA 54 0 20`
(se juntan en la misma carpeta; las 4 poses de v4 reemplazan a las de v3). Al hablar solo se pega la boca.
De frente (`frente_*`, de `arte-original/penna-nuevo.jpg` con `herramientas/penna.py`) se usa **fuera de la fiscalía**.
Poses: `point`, `cafe` (puño al pecho de la hoja v4: no hay café), `gesto`, `cruzado`, `alto` (mano en alto), `puno` (puño al pecho);
emociones extra: `think`, `proud` (mentón arriba), `laugh` (se ríe), `down`, `facepalm`.

## Pantalla de abajo (HUD)
Diseño del dueño en `assets/hud/` (originales en `arte-original/hud/`): `panel.jpg` (fondo 4:3 armado del panel), `botones.png`
(Examinar/Mover/Hablar/Presentar × normal/encima/apretado/apagado; clase `hudimg k0..k3`), `brillo.png` (8 cuadros), `expediente.png`,
`dialogo.png` (recuadro de continuar), `flecha.png`. El letrero de arriba a la izquierda (`#hudlabel`) dice Investigación / Juicio / etc.

## Música
Por defecto es sintetizada (`TRACKS` en `js/audio.js`). El jugador puede elegir canciones de su dispositivo
en «🎵 Mi música» (portada; `js/musica.js`, guardadas solo en su navegador con IndexedDB). También opcional: archivos en `musica-local/` (ignorada por git,
nunca se sube ni se publica) activando `MUSICA_LOCAL` y `MUSIC_FILES` en `js/assets.js`. Si falta un archivo, suena la melodía propia.

## Sonidos
Efectos en archivo en `assets/sonidos/` (`SFX_FILES` en js/assets.js; código abierto según el dueño, ver `docs/creditos.md`):
daño, golpe, prueba nueva, recuerdo (cinemática), revelación (nueva lectura), golpe en la mesa, error, grito (quiebre)
y `badum` (golpe dramático: se pone a mano en una línea con `sfx:"badum"`).
Voz de los diálogos: `assets/sonidos/blip.mp3` (creado por el dueño; `BLIP_FILE`), con el tono de `voice` de cada personaje.
Voces femeninas (`VOCES_FEM` en audio.js: Coté, Zoila, jueza, Malva, Bárbara) usan `assets/sonidos/blip_f.wav` (`BLIP_F_FILE`).
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
`prueba-final.html` = el juego con un botón que salta al veredicto y la escena final del Caso 1 (no toca la partida guardada).
No hay tests en el repo. Antes de entregar: recorrer el caso completo (ruta ganadora, una prueba equivocada,
una respuesta equivocada y la derrota) con un navegador automatizado y confirmar que no hay errores de consola.

## Siguientes pasos sugeridos
1. Caso 2: es un **esqueleto jugable con textos de borrador** (diseño en `docs/caso2-diseno.md`). Falta: que el
   dueño escriba los diálogos y la cinemática (7 imágenes). Personajes y fondos del Caso 2: completos
   (prompts en `docs/caso2-prompts.md`).
2. Fondo de detrás de la jueza (Caso 1).
