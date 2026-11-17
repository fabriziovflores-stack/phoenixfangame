"""Penna (hoja 8×5 de 40 cuadros): filas 1-3 de perfil (mira a la izquierda), filas 4-5 de frente.
Uso: python3 herramientas/penna.py CARPETA_SALIDA TARGET BOT DX
Cada cuadro se recorta con margen y se queda solo con la figura del centro (así el dedo que sobresale de su celda no se corta)."""
import sys, os, numpy as np, cv2
from PIL import Image
OUT=sys.argv[1]; TGT=float(sys.argv[2]); BOT=int(sys.argv[3]); DX=int(sys.argv[4]); CW=int(os.environ.get('CW','256'))
os.makedirs(OUT,exist_ok=True)
im=np.array(Image.open(os.environ.get('SHEET','arte-original/penna-v3.jpg')+'').convert('RGB')).astype(int)
H0,W0=im.shape[:2]; r,g,b=im[...,0],im[...,1],im[...,2]
key=(g>140)&(g>r*1.45)&(g>b*1.45); spill=(g>r*1.15)&(g>b*1.15)&~key; im[...,1]=np.where(spill,np.maximum(r,b),g)
A=np.where(key,0,255).astype(np.uint8); RGB=im.clip(0,255).astype(np.uint8)
GX,GY=int(os.environ.get('GX','8')),int(os.environ.get('GY','4')); cw,ch=W0/GX,H0/GY; M=int(os.environ.get('MARGIN','70')); TOPCUT=int(os.environ.get('TOPCUT','0'))
def cell(k):
    x0,y0=round(k%GX*cw),round(k//GX*ch); x1,y1=round(x0+cw),round(y0+ch)
    X0,Y0,X1,Y1=max(x0-M,0),y0+TOPCUT,min(x1+M,W0),min(y1,H0)
    a=A[Y0:Y1,X0:X1].copy(); n,lab,st,cen=cv2.connectedComponentsWithStats((a>0).astype(np.uint8),8)
    keep=np.zeros_like(a,bool); cx,cy=(x0+x1)/2-X0,(y0+y1)/2-Y0
    big=max(range(1,n),key=lambda i:st[i,4]-1e6*((cen[i][0]<x0-X0)|(cen[i][0]>x1-X0)))   # la figura de esta celda
    for i in range(1,n):
        if i==big or (x0-X0<=cen[i][0]<=x1-X0 and st[i,4]>20): keep|=lab==i
    a[~keep]=0
    # en los márgenes (fuera de la celda) solo se queda lo que cruza el borde a la altura del brazo, no el cuadro vecino
    for bx,sl in ((x0-X0, slice(0,x0-X0)), (x1-X0-1, slice(x1-X0,None))):
        if 0<=bx<a.shape[1]:
            rows=np.where(a[:,bx]>0)[0]
            band=np.zeros(a.shape[0],bool)
            if rows.size: band[max(rows.min()-4,0):rows.max()+5]=True
            a[~band,sl]=0
    return Image.fromarray(np.dstack([RGB[Y0:Y1,X0:X1],a]),'RGBA'), X0-x0
def g8(c):
    a=np.asarray(c).astype(np.float32); g=a[...,:3].mean(2); g[a[...,3]==0]=128; return g.astype(np.uint8)
def auto_cells():
    """Hojas sin cuadrícula exacta: encuentra cada figura por su silueta y las ordena en filas y columnas."""
    fig=cv2.dilate((A>0).astype(np.uint8),np.ones((7,7),np.uint8))
    n,lab,st,cen=cv2.connectedComponentsWithStats(fig,8)
    big=[i for i in range(1,n) if st[i,4]>1500]
    big=sorted(big,key=lambda i:cen[i][1]); rows=[sorted(big[r*GX:(r+1)*GX],key=lambda i:cen[i][0]) for r in range(GY)]
    out=[]
    for row in rows:
        for i in row:
            x,y,w,h=st[i,:4]; P=22
            X0,Y0,X1,Y1=max(x-P,0),max(y-P,0),min(x+w+P,W0),min(y+h+P,H0)
            sub=lab[Y0:Y1,X0:X1]; a=A[Y0:Y1,X0:X1].copy()
            mine=(sub==i)
            others=(sub>0)&(sub!=i)&np.isin(sub,big)          # pedazos de otras figuras: fuera
            a[others]=0; a[~(mine|((sub>0)&~np.isin(sub,big)))]=0
            out.append((Image.fromarray(np.dstack([RGB[Y0:Y1,X0:X1],a]),'RGBA'),0))
    return out
cells=auto_cells() if os.environ.get('AUTOGRID')=='1' else [cell(k) for k in range(GX*GY)]
HH=int(os.environ.get('HH','110')); SC=TGT/HH
def anchor(k0):
    c,off=cells[k0]; bb=c.getbbox(); top=bb[1]; hb=c.crop((0,top,c.width,top+HH)).getbbox()
    return dict(tpl=g8(c)[top:top+HH,hb[0]:hb[2]],hx0=hb[0],top=top,bb=bb,w=c.width)
PROF=anchor(0); FRON=None
def match(c,T):
    g=g8(c); best=(-1,1,0,0)
    for f in np.arange(.8,1.25,.02):
        t=cv2.resize(T['tpl'],None,fx=f,fy=f,interpolation=cv2.INTER_AREA)
        if t.shape[0]>=g.shape[0] or t.shape[1]>=g.shape[1]: continue
        rr=cv2.matchTemplate(g,t,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(rr)
        if mv>best[0]: best=(mv,f,ml[0],ml[1])
    return best
# dónde queda la cabeza en pantalla (igual para perfil y frente)
AX=128+DX; AY=BOT-round(PROF['bb'][3]*SC)+PROF['top']*SC
if os.environ.get('HEADY'): AY=float(os.environ['HEADY'])        # dónde queda lo alto del pelo en pantalla
REF={}
def head_anchor(c,front):
    """Punto fijo de la cabeza: arriba del pelo y la nuca (perfil) o el centro del pelo (frente).
    Se mide solo sobre la figura principal (los signos de sorpresa o destellos no cuentan)."""
    a=np.array(c)[...,3]>0
    n,lab,st,_=cv2.connectedComponentsWithStats(a.astype(np.uint8),8)
    if n>2: a=lab==(1+int(np.argmax(st[1:,4])))
    rows=np.where(a.sum(1)>8)[0]; t=rows[0]
    band=a[t:t+40]; xs=np.where(band.any(0))[0]
    if front: return (xs.min()+xs.max())/2, t
    return xs.max(), t
def place(k,T):
    """Mismo tamaño para todo el grupo; cada cuadro se alinea por la parte de arriba y de atrás de la cabeza."""
    c,off=cells[k]; front=(T is FRON) or os.environ.get('FRONT')=='1'; key=id(T)
    if key not in REF:
        _,f0,mx0,my0=match(c,T); hx,hy=head_anchor(c,front); REF[key]=(f0,mx0-hx,my0-hy)
    f,dx,dy=REF[key]; hx,hy=head_anchor(c,front); mx,my=hx+dx,hy+dy; sc=1.0
    s=SC/f; sm=c.resize((round(c.width*s),round(c.height*s)),Image.LANCZOS)
    hw=T['tpl'].shape[1]*SC                                      # ancho de la cabeza en pantalla
    out=Image.new('RGBA',(CW,192)); out.paste(sm,(round(AX-hw/2-mx*s),round(AY-my*s)),sm)
    a=np.array(out); m=a[...,3]>140; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a),round(float(sc),2)
F={}; log=[]
for k in range(GX*GY):
    F[k+1],sc=place(k, PROF); log.append((k+1,sc))
def shift_to(a,b):
    """Corre el cuadro b unos píxeles para que su cara calce con la de a."""
    al=a[...,3]>0; t=np.where(al.any(1))[0][0]; best=(1e18,0,0)
    ga=a[t:t+80,...,:3].astype(int)
    for dy in range(-8,9):
        for dx in range(-8,9):
            bb=np.roll(np.roll(b,dy,0),dx,1)[t:t+80,...,:3].astype(int)
            v=np.abs(ga-bb).sum(2).mean()
            if v<best[0]: best=(v,dx,dy)
    return np.roll(np.roll(b,best[2],0),best[1],1)
def mouthmask(a,b):
    """Boca = la mancha que cambia entre boca cerrada y abierta, la más cercana al lugar donde debería estar la boca
    (bajo el bigote). Así sirve aunque la cabeza esté inclinada y no confunde la boca con una mano."""
    d=np.abs(a[...,:3].astype(int)-b[...,:3].astype(int)).sum(2)
    al=a[...,3]>0; t=np.where(al.sum(1)>8)[0][0]
    m=((d>80)|((a[...,3]>0)!=(b[...,3]>0))); m[:t+28]=0; m[t+78:]=0
    xs=np.where(al[t:t+30].any(0))[0]; hc=(xs.min()+xs.max())/2
    ex,ey=(hc+float(os.environ.get('MOUTHDX','0')),t+float(os.environ.get('MOUTHDY','50'))) if FRONT_NOW[0] else (hc-12,t+48)   # dónde se espera la boca
    m8=cv2.dilate(m.astype(np.uint8),np.ones((3,3),np.uint8))
    n,lab,st,cen=cv2.connectedComponentsWithStats(m8,8)
    cands=[i for i in range(1,n) if st[i,4]>=40]                  # manchas chicas = ruido del dibujo
    if not cands: return np.zeros_like(m)
    k=min(cands,key=lambda i:((cen[i][0]-ex)**2+(cen[i][1]-ey)**2)**.5/st[i,4]**.5)   # cerca de la boca y grande
    x,y,w,h=st[k,:4]; cx,cy=cen[k]
    x0,x1=int(max(x,cx-17)),int(min(x+w,cx+17)); y0,y1=int(max(y,cy-13)),int(min(y+h,cy+13))
    box=np.zeros_like(m); box[y0:y1,x0:x1]=True
    return cv2.dilate((m&box).astype(np.uint8),np.ones((3,3),np.uint8)).astype(bool)&box
FRONT_NOW=[False]
def talk(closed,opn,box=None):
    """Hablar = cuadro cerrado + solo la boca del cuadro abierto (alineado a la cara)."""
    FRONT_NOW[0]=os.environ.get('FRONT')=='1'
    a=np.array(F[closed]); b=shift_to(a,np.array(F[opn])); m=mouthmask(a,b)
    o=a.copy(); o[m]=b[m]; return Image.fromarray(o)
BP=BF=None
# nombre: (cuadro cerrado, cuadro abierto). Tabla según la hoja (env TABLA=v3|v4).
TABLAS={'v3':{'base':(1,2),'smug':(3,2),'proud':(5,None),'smug2':(6,2),'cross':(7,8),'cuff':(9,None),'think':(10,None),'think2':(11,None),
   'facepalm':(12,None),'gesture':(13,14),'stop':(15,16),'point':(17,18),'fist':(21,22),'angry':(23,24),
   'shock':(25,26),'sweat':(27,28),'down':(29,None),'proud2':(31,32),'serious':(1,2),'smile':(6,2)},
 'v4':{'base':(1,2),'cross':(3,4),'fist':(5,6),'point':(7,8)},
 'chayo':{'base':(1,2,'f'),'serious':(3,4,'f'),'smile':(5,2),'laugh':(7,None),'giggle':(8,None),'think':(9,10,'f'),'think2':(11,12,'f'),
   'blush':(13,None),'glasses':(15,None),'wink':(16,None),'camera':(19,None),'photo':(20,None),'excited':(24,23),'surprise':(25,26,'f'),
   'shock':(27,None),'panic':(28,None),'sweat':(29,None),'down':(30,31,'f'),'embarrassed':(32,None),'annoyed':(33,34,'f'),'angry':(35,36,'f'),
   'point':(39,37,'f'),'smug':(40,34),'sad':(41,42,'f'),'facepalm':(43,None),'cry':(44,None),'happy':(45,46,'f'),'grin':(48,None)},
 'v5':{'base':(1,2),'smug':(3,4),'cross':(5,6),'point':(7,8),'angry':(9,10),'shock':(11,12),'sweat':(13,14),'cafe':(15,16)}}
P=TABLAS[os.environ.get('TABLA','v3')]
FR={}
if os.environ.get('DUMP'):
    os.makedirs(os.environ['DUMP'],exist_ok=True)
    for k,f in F.items(): f.save(os.path.join(os.environ['DUMP'],'f%02d.png'%k))
def save(n,im): im.save(f'{OUT}/{n}.png',optimize=True)
for pre,TAB,BOX in (('',P,BP),('frente_',FR,BF)):
    for n,v in TAB.items():
        c,o=v[0],v[1]; full=len(v)>2
        save(pre+n,F[c]); t=n+'Talk' if n!='base' else 'talk'
        save(pre+t, F[c] if o is None else (Image.fromarray(shift_to(np.array(F[c]),np.array(F[o]))) if full else talk(c,o,BOX)))       # siempre: cuadro cerrado + solo la boca (el cuerpo no se mueve)
b0=F[1]; l,t,r_,b_=b0.getbbox(); hb=b0.crop((0,t,CW,t+40)).getbbox(); cx=(hb[0]+hb[2])//2
b0.crop((cx-33,t,cx+33,t+70)).transpose(Image.FLIP_LEFT_RIGHT).save(f'{OUT}/face.png')
print(log)
