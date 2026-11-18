"""Hoja nueva de Justo apuntando (arte-original/justo-apunta-v2.jpg, 4x4) -> ap1..ap16, point, pointTalk.
Se calza a los cuadros actuales: escala y posición que mejor coinciden con la silueta de base.png (una sola para toda la hoja)."""
import sys, numpy as np
from PIL import Image
H='herramientas/'
s1=open(H+'01_croma_y_utilidades.py').read(); exec(s1[:s1.index("def sheet(")])
s2=open(H+'02_pares_de_boca.py').read(); exec(s2[s2.index("from PIL"):s2.index("def sheet(")])
src=open(H+'justo.py').read(); exec(src[src.index("def boca("):src.index("def save(")])
OUT='assets/personajes/ines'
im=load('arte-original/justo-apunta-v2.jpg'); W,Hh=im.size; cw=W/4; ch=Hh/4; iw=int(cw)-2; ih=int(ch)-2
cells=[im.crop((round((k%4)*cw)+1,round((k//4)*ch)+1,round((k%4)*cw)+1+iw,round((k//4)*ch)+1+ih)) for k in range(16)]
ref=np.array(Image.open(OUT+'/base.png').convert('RGBA'))[...,3]>0
rt=np.nonzero(ref.any(1))[0][0]
def colocar(cell,s,ox,oy):
    w=round(iw*s); h=round(ih*s); sm=cell.resize((w,h),Image.LANCZOS)
    out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,(ox,oy))
    a=np.array(out); m=a[...,3]>150; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a)
# buscar escala y posición: la cabeza/torso del cuadro 1 sobre base.png (solo la parte de arriba, sin brazos)
best=None
c0=cells[0]
for s in np.arange(0.40,0.70,0.005):
    w=round(iw*s); h=round(ih*s); a=np.array(c0.resize((w,h),Image.NEAREST))[...,3]>150
    t=np.nonzero(a.any(1))[0][0]; oy=rt-t
    for ox in range(-60,120,1):
        m=np.zeros((192,256),bool); y0=max(oy,0); 
        sub=a[y0-oy:min(h,192-oy)]; x0=max(ox,0); xs=sub[:, x0-ox:min(w,256-ox)]
        m[y0:y0+xs.shape[0], x0:x0+xs.shape[1]]=xs
        r=slice(0,100); inter=(m[r]&ref[r]).sum(); uni=(m[r]|ref[r]).sum()
        sc=inter/uni if uni else 0
        if best is None or sc>best[0]: best=(sc,s,ox,oy)
print('calce', best)
_,s,ox,oy=best
fr=[colocar(c,s,ox,oy) for c in cells]
for k,f in enumerate(fr): f.save(f'{OUT}/ap{k+1}.png',optimize=True)
fr[9].save(f'{OUT}/point.png',optimize=True)
B=alineado(cells[9],cells[8]); boca(fr[9],colocar(B,s,ox,oy)).save(f'{OUT}/pointTalk.png',optimize=True)
