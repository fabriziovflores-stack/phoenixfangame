import sys, os, numpy as np, cv2
from PIL import Image
H='herramientas/'
s1=open(H+'01_croma_y_utilidades.py').read(); exec(s1[:s1.index("def sheet(")])
s2=open(H+'02_pares_de_boca.py').read(); exec(s2[s2.index("from PIL"):s2.index("def sheet(")])
def g8(im):
    a=np.asarray(im).astype(np.float32); g=a[...,:3].mean(axis=2); g[a[...,3]==0]=128; return g.astype(np.uint8)
OUT=sys.argv[1]; HH=100; TGT=float(sys.argv[2]); BOT=int(sys.argv[3]); DX=int(sys.argv[4]); CW=int(os.environ.get('CW','256'))
os.makedirs(OUT,exist_ok=True)
def cells_of(path):
    im=load(path); W,Hh=im.size; cw=W/4; ch=Hh/4; iw=int(cw)-2; ih=int(ch)-2
    return [im.crop((round((k%4)*cw)+1,round((k//4)*ch)+1,round((k%4)*cw)+1+iw,round((k//4)*ch)+1+ih)) for k in range(16)],iw,ih
SC=TGT/HH
main,iw,ih=cells_of('arte-original/justo-perfil-b.png')
base=main[0]; bb=base.getbbox(); top=bb[1]
hb=base.crop((0,top,iw,top+HH)).getbbox(); hx0,hx1=hb[0],hb[2]
tpl=g8(base)[top:top+HH,hx0:hx1]
bw=round(iw*SC); offx0=(256-bw)//2; offy0=BOT-round(bb[3]*SC)
ax=offx0+hx0*SC+DX; ay=offy0+top*SC
def match(cell,lo=0.7,hi=1.46):
    g=g8(cell); best=(-1,1,0,0)
    for f in np.arange(lo,hi,0.025):
        t=cv2.resize(tpl,None,fx=f,fy=f,interpolation=cv2.INTER_AREA)
        if t.shape[0]>=g.shape[0] or t.shape[1]>=g.shape[1]: continue
        r=cv2.matchTemplate(g,t,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(r)
        if mv>best[0]: best=(mv,f,ml[0],ml[1])
    return best
def place(cell,f,mx,my,iw,ih):
    s=SC/f; w=round(iw*s); h=round(ih*s); sm=cell.resize((w,h),Image.LANCZOS)
    out=Image.new('RGBA',(CW,192),(0,0,0,0)); out.paste(sm,(round(ax-mx*s),round(ay-my*s)))
    a=np.array(out); m=a[...,3]>150; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a)

def boca(Af,Bf):
    """Cuadro hablando = cuadro cerrado + SOLO los píxeles de la boca del abierto (zona chica bajo la nariz)."""
    a=np.array(Af); b=np.array(Bf); al=a[...,3]>0
    ys=np.where(al.any(1))[0]; t=ys[0]
    hx1=max(np.where(r)[0].max() for r in al[t:t+20] if r.any())                      # borde derecho del pelo
    rows=al[t+28:t+50,:hx1+14]; front=max(np.where(r)[0].max() for r in rows if r.any())  # punta de la nariz (mira a la derecha)
    y0,y1=t+42,t+66; x0,x1=front-26,front+2
    d=np.abs(a[...,:3].astype(int)-b[...,:3].astype(int)).sum(2)
    m=np.zeros(al.shape,bool); m[y0:y1,x0:x1]=d[y0:y1,x0:x1]>60
    if m.any():
        yy,xx=np.where(m); cy,cx=int(np.median(yy)),int(np.median(xx))
        k=np.zeros_like(m); k[max(cy-6,0):cy+7,max(cx-8,0):cx+9]=True; m&=k          # solo la boca, nada más
        mm=m.copy(); mm[1:]|=m[:-1]; mm[:-1]|=m[1:]; mm[:,1:]|=m[:,:-1]; mm[:,:-1]|=m[:,1:]; m=mm&k
    out=a.copy(); out[m]=b[m]; return Image.fromarray(out)
def alineado(A,B):
    _,_,(dx,dy)=fix_pair(A,B); return Image.fromarray(np.roll(np.roll(np.asarray(B),dy,0),dx,1))
def save(name,im): im.save(f'{OUT}/{name}.png',optimize=True)
# 1. poses: cada par con su propia alineación de cabeza
names=["base","smug","sweat","shock","think","angry","point","down"]
log=[]
for i,n in enumerate(names):
    A=main[2*i]; B=alineado(A,main[2*i+1])
    sc,f,mx,my=match(A) if i else (1,1.0,hx0,top)
    if sc<0.6: sc,f,mx,my=match(A,0.95,1.06)
    log.append((n,round(float(f),3),round(float(sc),2)))
    Af=place(A,f,mx,my,iw,ih); save(n,Af); save("talk" if n=="base" else n+"Talk",boca(Af,place(B,f,mx,my,iw,ih)))
# 2. hojas de animación: una sola alineación para toda la hoja (así no tiembla)
def anim_sheet(path,prefix):
    cs,iw2,ih2=cells_of(path); sc,f,mx,my=match(cs[0]); log.append((prefix,round(float(f),3),round(float(sc),2)))
    return [place(c,f,mx,my,iw2,ih2) for c in cs], (f,mx,my,iw2,ih2), cs
ap,P,apc=anim_sheet('arte-original/justo-apunta.png','ap')
for k,im in enumerate(ap): save(f'ap{k+1}',im)
f,mx,my,iw2,ih2=P; B=alineado(apc[9],apc[8])               # apuntando: cuadro 10 (boca cerrada) + solo la boca del 9
save('point',ap[9]); save('pointTalk',boca(ap[9],place(B,f,mx,my,iw2,ih2)))
le,P2,lec=anim_sheet('arte-original/justo-lentes.png','le')
for k,im in enumerate(le): save(f'le{k+1}',im)
f,mx,my,iw2,ih2=P2; B=alineado(lec[12],lec[13])
save('papel',le[12]); save('papelTalk',boca(le[12],place(B,f,mx,my,iw2,ih2)))
b0=Image.open(f'{OUT}/base.png'); l,t,r,b=b0.getbbox(); hb=b0.crop((0,t,256,t+40)).getbbox(); cx=(hb[0]+hb[2])//2
b0.crop((cx-33,t,cx+33,t+70)).save(f'{OUT}/face.png')
print(log)
