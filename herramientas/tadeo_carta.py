"""Animación de Tadeo sacando la carta del gorro: arte-original/tadeo-carta.jpg (4x4) -> assets/personajes/tadeo/c1..c16.
La hoja se calza UNA vez (escala y posición) a la silueta de assets/personajes/tadeo/down.png usando el cuadro 1 (triste, mirando abajo)."""
import numpy as np
from PIL import Image
H='herramientas/'
s1=open(H+'01_croma_y_utilidades.py').read(); exec(s1[:s1.index("def sheet(")])
OUT='assets/personajes/tadeo'
ref=np.array(Image.open(OUT+'/down.png').convert('RGBA'))[...,3]>0
ry=np.nonzero(ref.any(1))[0]; rt=ry[0]
im=load('arte-original/tadeo-carta.jpg'); W,Hh=im.size; cw=W/4; ch=Hh/4; iw=int(cw)-4; ih=int(ch)-4
cs=[im.crop((round((k%4)*cw)+2,round((k//4)*ch)+2,round((k%4)*cw)+2+iw,round((k//4)*ch)+2+ih)) for k in range(16)]
def colocar(c,s,ox,oy):
    w=round(iw*s); h=round(ih*s); sm=c.resize((w,h),Image.LANCZOS)
    out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,(ox,oy))
    a=np.array(out); m=a[...,3]>150; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a)
best=None
for s in np.arange(0.25,0.60,0.0025):
    w=round(iw*s); h=round(ih*s); a=np.array(cs[0].resize((w,h),Image.NEAREST))[...,3]>150
    ys=np.nonzero(a.any(1))[0]; oy=rt-ys[0]
    for ox in range(0,256-w+1):
        m=np.zeros((192,256),bool); y0=max(oy,0); sub=a[y0-oy:min(h,192-oy)]; m[y0:y0+sub.shape[0], ox:ox+w]=sub
        r=slice(rt,rt+70); sc=(m[r]&ref[r]).sum()/max(1,(m[r]|ref[r]).sum())
        if best is None or sc>best[0]: best=(sc,s,ox,oy)
print(best)
_,s,ox,oy=best
# En el locutorio el mesón tapa la parte de abajo: a medida que saca la carta, Tadeo sube de a poco (se inclina hacia el vidrio)
SUBE=[0,2,4,6,8,10,12,14,15,16,16,16,16,16,16,16]
for k,c in enumerate(cs): colocar(c,s,ox,oy-SUBE[k]).save(f'{OUT}/c{k+1}.png',optimize=True)
