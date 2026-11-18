"""Junta los cuadros HD de cada personaje (assets/hd/personajes/<quien>/*.png, 512×384) en UNA hoja por personaje
(assets/hd/atlas/<quien>.png) y escribe assets/hd/atlas.js con dónde está cada cuadro.
Así la versión publicada tiene pocos archivos. Las caritas del expediente (face.png) no van en la hoja.
Uso: python3 herramientas/hd_atlas.py
"""
import os, glob, json
from PIL import Image
import numpy as np

ANCHO_MAX = 4096
os.makedirs("assets/hd/atlas", exist_ok=True)
indice = {}
for d in sorted(glob.glob("assets/hd/personajes/*/")):
    quien = os.path.basename(d.rstrip("/"))
    cuadros = []
    for p in sorted(glob.glob(d + "*.png")):
        n = os.path.basename(p)[:-4]
        if n == "face": continue
        im = Image.open(p).convert("RGBA")
        bb = im.getbbox() or (0, 0, 1, 1)
        cuadros.append((n, im.crop(bb), bb[0], bb[1]))
    cuadros.sort(key=lambda c: -c[1].height)
    # empaquetado por estantes
    x = y = alto_fila = 0; pos = {}
    for n, im, ox, oy in cuadros:
        if x + im.width > ANCHO_MAX: x = 0; y += alto_fila + 2; alto_fila = 0
        pos[n] = (x, y, im.width, im.height, ox, oy); x += im.width + 2; alto_fila = max(alto_fila, im.height)
    W = max(p[0] + p[2] for p in pos.values()); H = max(p[1] + p[3] for p in pos.values())
    hoja = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for n, im, ox, oy in cuadros: hoja.paste(im, pos[n][:2])
    hoja.save(f"assets/hd/atlas/{quien}.png", optimize=True)
    indice[quien] = pos
    print(quien, len(pos), "cuadros", W, "x", H, round(os.path.getsize(f"assets/hd/atlas/{quien}.png") / 1e6, 1), "MB")
with open("assets/hd/atlas.js", "w") as f:
    f.write("/* Generado por herramientas/hd_atlas.py: dónde está cada cuadro HD dentro de la hoja de su personaje.\n"
            "   [x, y, ancho, alto, x_en_cuadro, y_en_cuadro] — el cuadro completo mide 512×384. */\n")
    f.write("const HD_ATLAS = " + json.dumps(indice, separators=(",", ":")) + ";\n")
print("assets/hd/atlas.js listo")
