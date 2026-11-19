"""Hojas animadas de Llavín (4x4): arte-original/llavin-gestos.jpg (k1..k16) y llavin-colapso.jpg (b1..b16).
Cada hoja se calza UNA vez (escala y posición) a la silueta de assets/personajes/testigo/base.png, así no tiembla."""
import sys, numpy as np
from PIL import Image
H='herramientas/'
s1=open(H+'01_croma_y_utilidades.py').read(); exec(s1[:s1.index("def sheet(")])
OUT='assets/personajes/testigo'
ref=np.array(Image.open(OUT+'/base.png').convert('RGBA'))[...,3]>0
ry=np.nonzero(ref.any(1))[0]; rt,rb=ry[0],ry[-1]
def cells(path):
    im=load(path); W,Hh=im.size; cw=W/4; ch=Hh/4; iw=int(cw)-4; ih=int(ch)-4
    return [im.crop((round((k%4)*cw)+2,round((k//4)*ch)+2,round((k%4)*cw)+2+iw,round((k//4)*ch)+2+ih)) for k in range(16)],iw,ih
def colocar(c,s,ox,oy,iw,ih):
    w=round(iw*s); h=round(ih*s); sm=c.resize((w,h),Image.LANCZOS)
    out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,(ox,oy))
    a=np.array(out); m=a[...,3]>150; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a)
def calzar(c,iw,ih):
    best=None
    for s in np.arange(0.25,0.50,0.0025):
        w=round(iw*s); h=round(ih*s); a=np.array(c.resize((w,h),Image.NEAREST))[...,3]>150
        ys=np.nonzero(a.any(1))[0]; t=ys[0]; oy=rt-t
        for ox in range(0,256-w+1):
            m=np.zeros((192,256),bool); y0=max(oy,0)
            sub=a[y0-oy:min(h,192-oy)]; m[y0:y0+sub.shape[0], ox:ox+w]=sub
            r=slice(rt,rt+70); sc=(m[r]&ref[r]).sum()/max(1,(m[r]|ref[r]).sum())
            if best is None or sc>best[0]: best=(sc,s,ox,oy)
    return best
for path,pre,refk in [('arte-original/llavin-gestos.jpg','k',12),('arte-original/llavin-colapso.jpg','b',None)]:
    cs,iw,ih=cells(path)
    if refk is not None:
        best=calzar(cs[refk],iw,ih); G=best
    else:
        best=G                                   # el colapso usa la misma escala que la hoja de gestos (mismo dibujo)
    print(pre,best)
    _,s,ox,oy=best
    for k,c in enumerate(cs): colocar(c,s,ox,oy,iw,ih).save(f'{OUT}/{pre}{k+1}.png',optimize=True)
# Parpadeo: solo los ojos cerrados (diferencia entre el cuadro abierto y el cerrado de la hoja) pegados sobre la cara actual.
def parpadeo(base_png, abierto, cerrado, destino):
    b=np.array(Image.open(base_png).convert('RGBA')); a=np.array(Image.open(abierto).convert('RGBA')); c=np.array(Image.open(cerrado).convert('RGBA'))
    d=np.abs(a[...,:3].astype(int)-c[...,:3].astype(int)).sum(2)>90
    m=np.zeros_like(d); m[:60,:]=d[:60,:]                      # solo la zona de la cara
    ys,xs=np.nonzero(m)
    if len(ys):
        y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
        box=np.zeros_like(m); box[y0:y1+1,x0:x1+1]=True; m=box&(c[...,3]>0)
    out=b.copy(); out[m]=c[m]; Image.fromarray(out).save(destino,optimize=True)
parpadeo(OUT+'/base.png', OUT+'/k13.png', OUT+'/k14.png', OUT+'/blink.png')
