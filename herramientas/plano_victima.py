"""Plano de la casona con la víctima marcada (V) y una flecha hacia la puerta: assets/pruebas/plano-victima.png
(se usa para tocar desde dónde vino el disparo de frente, Caso 2, día 3)."""
from PIL import Image, ImageDraw
im=Image.open('assets/pruebas/plano.png').convert('RGBA'); d=ImageDraw.Draw(im)
cx,cy=76,146
d.line([(cx-6,cy+5),(63,160)],fill=(200,30,30,255),width=2)          # flecha hacia la puerta
d.polygon([(60,163),(66,158),(62,156)],fill=(200,30,30,255))
d.ellipse([cx-7,cy-7,cx+7,cy+7],fill=(255,255,255,255),outline=(200,30,30,255),width=2)
d.line([(cx-3,cy-3),(cx,cy+3)],fill=(200,30,30,255),width=2); d.line([(cx,cy+3),(cx+3,cy-3)],fill=(200,30,30,255),width=2)   # «V»
im.save('assets/pruebas/plano-victima.png')
