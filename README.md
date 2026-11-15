# ACTA CERO

Videojuego original de juicios ambientado en Chile, sucesor espiritual de las aventuras de abogados de Nintendo DS.
Este repositorio contiene el **Caso 1: «La Sirena del Puerto»** (tutorial, solo juicio).

## Cómo jugar
Abre `index.html` en un navegador. No necesita instalación ni conexión.
(En GitHub: Settings → Pages → publicar la rama principal, y queda jugable en una dirección web.)

## Estructura
| Carpeta / archivo | Qué contiene |
|---|---|
| `index.html` | La página: dos pantallas estilo DS |
| `css/style.css` | Todo el aspecto visual |
| `casos/caso1.js` | **El guion**: personajes, pruebas, testimonios y diálogos del Caso 1 |
| `js/engine.js` | El motor: diálogos, contrainterrogatorios, expediente, guardado |
| `js/audio.js` | Música y efectos (sintetizados por código) |
| `js/sprites.js` | Dibujo provisorio por código (respaldo si falta un sprite) y globos de «¡Objeción!» |
| `js/assets.js` | Rutas de las imágenes (sprites, fondos y muebles) |
| `assets/` | Sprites (256×192), fondos, muebles e íconos de pruebas ya procesados |
| `arte-original/` | Las hojas tal como salieron del generador de imágenes |
| `herramientas/` | Scripts de Python con que se procesó el arte (referencia) |
| `docs/` | Brief de guion y diseño del caso |
| `CLAUDE.md` | Instrucciones para trabajar el proyecto con Claude Code |

## Pendientes conocidos
- Fondos propios para **fiscalía** y **detrás de la jueza**.
- Música compuesta de verdad.
- El protagonista se parece demasiado a Phoenix Wright: cambiar antes de publicar.
- Probar el caso con jugadores que no conozcan la solución.
