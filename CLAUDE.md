# ACTA CERO — guía para Claude Code

El dueño del proyecto **no programa**: escribe y diseña. Explícale los cambios en español simple,
sin jerga, y prueba siempre el juego completo antes de dar algo por terminado.

## Qué es
Juego de juicios en HTML/JS sin dependencias ni build. Se abre `index.html` y funciona.
Los scripts son clásicos (no módulos) y comparten ámbito global; **el orden de carga importa**:
`casos/caso1.js` → `js/audio.js` → `js/sprites.js` → `js/assets.js` → `js/engine.js` → `js/musica.js`.

## Pantalla
Formato Nintendo DS: dos pantallas 4:3. La escena se dibuja a **256×192** y se amplía con píxeles
marcados. Cambio de cámara = **corte directo** (sin fundidos: el dueño los rechazó explícitamente).
Capas de la pantalla superior: fondo (`#bg`) → personaje (`#spr`) → mueble (`#desk`) → caja de texto.

## Formato del guion (`casos/caso1.js`)
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
- En una línea: `evidence:"id"` hace entrar la prueba al expediente (el juego se detiene, baja el panel y
  espera al jugador); `read:["id","nueva lectura"]` reinterpreta una prueba; `damage:true` penaliza;
  `music:null` corta la música; `confetti:true` lanza confeti sobre la escena. `[r]texto[/r]` = rojo. Un texto que empieza con `(` es pensamiento.
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
Versión de frente: si existe `frente_<cuadro>` en `ART[personaje]`, se usa en vez del cuadro normal. Hoy: Penna
(la hoja de perfil sigue en `assets/personajes/fiscal/` como respaldo).

## Música
Por defecto es sintetizada (`TRACKS` en `js/audio.js`). El jugador puede elegir canciones de su dispositivo
en «🎵 Mi música» (portada; `js/musica.js`, guardadas solo en su navegador con IndexedDB). También opcional: archivos en `musica-local/` (ignorada por git,
nunca se sube ni se publica) activando `MUSICA_LOCAL` y `MUSIC_FILES` en `js/assets.js`. Si falta un archivo, suena la melodía propia.

## Guardado
`localStorage`, clave `actacero_caso1_v1`. Guarda el paso del guion, pruebas, lecturas y penalizaciones.

## Cómo probar
`prueba-final.html` = el juego con un botón que salta al veredicto y la escena final (no toca la partida guardada).
No hay tests en el repo. Antes de entregar: recorrer el caso completo (ruta ganadora, una prueba equivocada,
una respuesta equivocada y la derrota) con un navegador automatizado y confirmar que no hay errores de consola.

## Siguientes pasos sugeridos
1. Integrar los fondos que faltan (fiscalía, detrás de la jueza).
2. Separar motor y caso para admitir varios casos (menú de selección).
3. Fase de investigación (lugares, examinar, hablar) para el Caso 2.
