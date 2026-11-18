"""Acorta el brazo de Justo en la pose «point» (el dibujo original lo trae demasiado largo).
Saca un tramo del antebrazo (columnas X1..X2) y junta la mano con el resto, bajándola lo que sube el brazo.
Uso (sobre los cuadros originales sin acortar): python3 herramientas/justo_brazo.py point.png pointTalk.png"""
import sys
import numpy as np
from PIL import Image
X1, X2 = 158, 196
def acortar(ruta):
    a=np.array(Image.open(ruta).convert('RGBA')); A=a[:,:,3]>0
    top=lambda x: np.nonzero(A[:,x])[0].min()
    dy=int(round(top(X1)-top(X2)))
    out=a.copy(); out[:,X1:,:]=0
    der=a[:,X2:,:]; sh=np.zeros_like(der)
    if dy>0: sh[dy:]=der[:-dy]
    else: sh=der
    out[:,X1:X1+der.shape[1]]=sh
    Image.fromarray(out).save(ruta)
for r in sys.argv[1:]: acortar(r)
