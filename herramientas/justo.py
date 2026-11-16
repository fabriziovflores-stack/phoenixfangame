import sys, os, numpy as np, cv2
from PIL import Image
H='herramientas/'
s1=open(H+'01_croma_y_utilidades.py').read(); exec(s1[:s1.index("def sheet(")])
s2=open(H+'02_pares_de_boca.py').read(); exec(s2[s2.index("from PIL"):s2.index("def sheet(")])
def g8(im):
    a=np.asarray(im).astype(np.float32); g=a[...,:3].mean(axis=2); g[a[...,3]==0]=128; return g.astype(np.uint8)
OUT=sys.argv[1]; HH=100; TGT=float(sys.argv[2]); BOT=int(sys.argv[3]); DX=int(sys.argv[4])
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
    out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,(round(ax-mx*s),round(ay-my*s)))
    a=np.array(out); m=a[...,3]>150; a[...,:3]&=0xF8; a[...,3]=np.where(m,255,0); a[~m]=0
    return Image.fromarray(a)
def save(name,im): im.save(f'{OUT}/{name}.png',optimize=True)
# 1. poses: cada par con su propia alineación de cabeza
names=["base","smug","sweat","shock","think","angry","point","down"]
log=[]
for i,n in enumerate(names):
    A=main[2*i]; B,_,_=fix_pair(A,main[2*i+1])
    sc,f,mx,my=match(A) if i else (1,1.0,hx0,top)
    if sc<0.6: sc,f,mx,my=match(A,0.95,1.06)
    log.append((n,round(float(f),3),round(float(sc),2)))
    save(n,place(A,f,mx,my,iw,ih)); save("talk" if n=="base" else n+"Talk",place(B,f,mx,my,iw,ih))
# 2. hojas de animación: una sola alineación para toda la hoja (así no tiembla)
def anim_sheet(path,prefix):
    cs,iw2,ih2=cells_of(path); sc,f,mx,my=match(cs[0]); log.append((prefix,round(float(f),3),round(float(sc),2)))
    return [place(c,f,mx,my,iw2,ih2) for c in cs], (f,mx,my,iw2,ih2), cs
ap,P,apc=anim_sheet('arte-original/justo-apunta.png','ap')
for k,im in enumerate(ap): save(f'ap{k+1}',im)
f,mx,my,iw2,ih2=P; B,_,_=fix_pair(apc[9],apc[8])          # apuntando: cuadro 10 (boca cerrada) + boca del 9
save('point',ap[9]); save('pointTalk',place(B,f,mx,my,iw2,ih2))
le,P2,lec=anim_sheet('arte-original/justo-lentes.png','le')
for k,im in enumerate(le): save(f'le{k+1}',im)
f,mx,my,iw2,ih2=P2; B,_,_=fix_pair(lec[12],lec[13])
save('papel',le[12]); save('papelTalk',place(B,f,mx,my,iw2,ih2))
b0=Image.open(f'{OUT}/base.png'); l,t,r,b=b0.getbbox(); hb=b0.crop((0,t,256,t+40)).getbbox(); cx=(hb[0]+hb[2])//2
b0.crop((cx-33,t,cx+33,t+70)).save(f'{OUT}/face.png')
print(log)
