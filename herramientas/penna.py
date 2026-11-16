"""Penna (hoja 8×5 de 40 cuadros): filas 1-3 de perfil (mira a la izquierda), filas 4-5 de frente.
Uso: python3 herramientas/penna.py CARPETA_SALIDA TARGET BOT DX
Cada cuadro se recorta con margen y se queda solo con la figura del centro (así el dedo que sobresale de su celda no se corta)."""
import sys, os, numpy as np, cv2
from PIL import Image
OUT=sys.argv[1]; TGT=float(sys.argv[2]); BOT=int(sys.argv[3]); DX=int(sys.argv[4]); CW=int(os.environ.get('CW','256'))
os.makedirs(OUT,exist_ok=True)
im=np.array(Image.open('arte-original/penna-nuevo.jpg').convert('RGB')).astype(int)
H0,W0=im.shape[:2]; r,g,b=im[...,0],im[...,1],im[...,2]
key=(g>140)&(g>r*1.45)&(g>b*1.45); spill=(g>r*1.15)&(g>b*1.15)&~key; im[...,1]=np.where(spill,np.maximum(r,b),g)
A=np.where(key,0,255).astype(np.uint8); RGB=im.clip(0,255).astype(np.uint8)
cw,ch=W0/8,H0/5; M=70
def cell(k):
    x0,y0=round(k%8*cw),round(k//8*ch); x1,y1=round(x0+cw),round(y0+ch)
    X0,Y0,X1,Y1=max(x0-M,0),y0,min(x1+M,W0),min(y1,H0)
    a=A[Y0:Y1,X0:X1].copy(); n,lab,st,cen=cv2.connectedComponentsWithStats((a>0).astype(np.uint8),8)
    keep=np.zeros_like(a,bool); cx,cy=(x0+x1)/2-X0,(y0+y1)/2-Y0
    big=max(range(1,n),key=lambda i:st[i,4]-1e6*((cen[i][0]<x0-X0)|(cen[i][0]>x1-X0)))   # la figura de esta celda
    for i in range(1,n):
        if i==big or (x0-X0<=cen[i][0]<=x1-X0 and st[i,4]>20): keep|=lab==i
    a[~keep]=0
    return Image.fromarray(np.dstack([RGB[Y0:Y1,X0:X1],a]),'RGBA'), X0-x0
def g8(c):
    a=np.asarray(c).astype(np.float32); g=a[...,:3].mean(2); g[a[...,3]==0]=128; return g.astype(np.uint8)
cells=[cell(k) for k in range(40)]
HH=95; SC=TGT/HH
def anchor(k0):
    c,off=cells[k0]; bb=c.getbbox(); top=bb[1]; hb=c.crop((0,top,c.width,top+HH)).getbbox()
    return dict(tpl=g8(c)[top:top+HH,hb[0]:hb[2]],hx0=hb[0],top=top,bb=bb,w=c.width)
PROF=anchor(0); FRON=anchor(24)
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
REF={}
def head_anchor(c,front):
    """Punto fijo de la cabeza: arriba del pelo y la nuca (perfil) o el centro del pelo (frente)."""
    a=np.array(c)[...,3]>0; rows=np.where(a.sum(1)>8)[0]; t=rows[0]
    band=a[t:t+40]; xs=np.where(band.any(0))[0]
    if front: return (xs.min()+xs.max())/2, t
    return xs.max(), t
def place(k,T):
    """Mismo tamaño para todo el grupo; cada cuadro se alinea por la parte de arriba y de atrás de la cabeza."""
    c,off=cells[k]; front=T is FRON; key=id(T)
    if key not in REF:
        _,f0,mx0,my0=match(c,T); hx,hy=head_anchor(c,front); REF[key]=(f0,mx0-hx,my0-hy)
    f,dx,dy=REF[key]; hx,hy=head_anchor(c,front); mx,my=hx+dx,hy+dy; sc=1.0
    s=SC/f; sm=c.resize((round(c.width*s),round(c.height*s)),Image.LANCZOS)
    hw=T['tpl'].shape[1]*SC                                      # ancho de la cabeza en pantalla
    out=Image.new('RGBA',(CW,192)); out.paste(sm,(round(AX-hw/2-mx*s),round(AY-my*s)),sm)
    a=np.array(out); m=a[...,3]>140; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a),round(float(sc),2)
F={}; log=[]
for k in range(40):
    F[k+1],sc=place(k, PROF if k<24 else FRON); log.append((k+1,sc))
def boxof(ca,cb):
    d=np.abs(np.array(F[ca])[...,:3].astype(int)-np.array(F[cb])[...,:3].astype(int)).sum(2)
    a=np.array(F[ca])[...,3]>0; ys=np.where(a.any(1))[0]; t=ys[0]
    d[:t+30]=0; d[t+75:]=0; m=d>90
    yy,xx=np.where(m); cy,cx=int(np.median(yy)),int(np.median(xx))
    return (max(cy-6,0),cy+7,max(cx-9,0),cx+10)
BP=boxof(1,3); BF=boxof(25,26)
def talk(closed,opn,box):
    a=np.array(F[closed]); b=np.array(F[opn]); y0,y1,x0,x1=box
    d=np.abs(a[...,:3].astype(int)-b[...,:3].astype(int)).sum(2)
    m=np.zeros(a.shape[:2],bool); m[y0:y1,x0:x1]=(d[y0:y1,x0:x1]>60)|((a[y0:y1,x0:x1,3]==0)!=(b[y0:y1,x0:x1,3]==0))
    o=a.copy(); o[m]=b[m]; return Image.fromarray(o)
# nombre: (cuadro cerrado, cuadro con la boca abierta o None)
P={'base':(1,3),'serious':(2,3),'smug':(4,3),'smile':(6,3),'proud':(7,None),'proud2':(8,None),'think':(9,3),'think2':(10,3),
   'cross':(11,12),'gesture':(13,14),'point':(15,16),'sweat':(17,3),'shock':(18,None),'angry':(19,20),'facepalm':(21,None),
   'down':(22,None),'cuff':(23,3),'cross2':(24,3)}
FR={'base':(25,26),'smug':(28,27),'serious':(29,26),'think':(30,26),'think2':(31,26),'cross':(32,26),'gesture':(33,26),
    'smile':(35,34),'proud':(36,None),'shock':(37,None),'angry':(38,39),'down':(40,None)}
def save(n,im): im.save(f'{OUT}/{n}.png',optimize=True)
for pre,TAB,BOX in (('',P,BP),('frente_',FR,BF)):
    for n,(c,o) in TAB.items():
        save(pre+n,F[c]); t=n+'Talk' if n!='base' else 'talk'
        save(pre+t, F[c] if o is None else (F[o] if (c,o) in ((11,12),(13,14),(15,16),(19,20)) else talk(c,o,BOX)))
b0=F[1]; l,t,r_,b_=b0.getbbox(); hb=b0.crop((0,t,CW,t+40)).getbbox(); cx=(hb[0]+hb[2])//2
b0.crop((cx-33,t,cx+33,t+70)).transpose(Image.FLIP_LEFT_RIGHT).save(f'{OUT}/face.png')
print(log)
