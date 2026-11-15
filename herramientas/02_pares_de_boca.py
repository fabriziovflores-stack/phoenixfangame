import re, numpy as np
src=open('build4.py').read(); exec(src[:src.index("U='/mnt/user-data/uploads/'")])   # uri, load
from PIL import Image, ImageFilter, ImageDraw
def pairs(*e): return [x for n in e for x in (n, "talk" if n=="base" else n+"Talk")]
def gray(im): 
    a=np.asarray(im).astype(np.float32); return (a[...,:3].mean(axis=2))*(a[...,3]>0), a[...,3]>0
def fix_pair(A,B):
    """Devuelve B' = A con solo la boca de B pegada encima."""
    ga,ma=gray(A); gb,mb=gray(B)
    H,W=ga.shape; best=(1e18,0,0)
    sa=ga[::3,::3]; 
    for dy in range(-10,11,1):
        for dx in range(-10,11,1):
            sb=np.roll(np.roll(gb,dy,0),dx,1)[::3,::3]
            d=np.abs(sa-sb)[5:-5,5:-5].mean()
            if d<best[0]: best=(d,dx,dy)
    _,dx,dy=best
    Bs=Image.fromarray(np.roll(np.roll(np.asarray(B),dy,0),dx,1))
    a=np.asarray(A).astype(np.float32); b=np.asarray(Bs).astype(np.float32)
    diff=np.abs(a[...,:3]-b[...,:3]).sum(axis=2)*(ma)
    ys=np.where(ma.any(axis=1))[0]; top,bot=ys[0],ys[-1]
    lim=int(top+(bot-top)*.62); diff[lim:,:]=0
    dimg=Image.fromarray(np.clip(diff/3,0,255).astype(np.uint8)).filter(ImageFilter.BoxBlur(7))
    d=np.asarray(dimg).astype(np.float32)
    cy,cx=np.unravel_index(d.argmax(),d.shape)
    reg=d>d.max()*.4
    # componente conectada que contiene el máximo (flood simple por caja creciente)
    x0=x1=cx; y0=y1=cy; changed=True
    while changed:
        changed=False
        for (nx0,ny0,nx1,ny1) in ((x0-2,y0,x1,y1),(x0,y0-2,x1,y1),(x0,y0,x1+2,y1),(x0,y0,x1,y1+2)):
            nx0=max(nx0,0); ny0=max(ny0,0); nx1=min(nx1,W-1); ny1=min(ny1,H-1)
            if (nx1-nx0)>80 or (ny1-ny0)>64: continue
            new=reg[ny0:ny1+1,nx0:nx1+1].sum(); old=reg[y0:y1+1,x0:x1+1].sum()
            if new>old: x0,y0,x1,y1=nx0,ny0,nx1,ny1; changed=True
    pad=7; box=(max(x0-pad,0),max(y0-pad,0),min(x1+pad,W-1),min(y1+pad,H-1))
    mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).rounded_rectangle(box,radius=8,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(2.5))
    out=A.copy(); out.paste(Bs,(0,0),mask)
    oa=np.asarray(out).copy(); oa[...,3]=np.asarray(A)[...,3]; 
    return Image.fromarray(oa),box,(dx,dy)
def sheet(path,names,SC,BOT,flip=False):
    im=load(path); W,H=im.size; cw=W/4; chh=H/4; fr={}; info=[]
    iw=int(cw)-2; ih=int(chh)-2
    cells=[im.crop((round((k%4)*cw)+1,round((k//4)*chh)+1,round((k%4)*cw)+1+iw,round((k//4)*chh)+1+ih)) for k in range(16)]
    for k in range(0,16,2):
        cells[k+1],box,sh=fix_pair(cells[k],cells[k+1]); info.append((names[k],box,sh))
    for k,n in enumerate(names):
        cell=cells[k]; bb=cells[k-(k%2)].getbbox(); cell=cell.crop((0,bb[1],cell.width,bb[3]))
        if flip: cell=cell.transpose(Image.FLIP_LEFT_RIGHT)
        w=round(cell.width*SC); h=round(cell.height*SC); sm=cell.resize((w,h),Image.LANCZOS)
        out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,((256-w)//2,BOT-h))
        p=out.load()
        for y in range(192):
            for x in range(256):
                rr,g,b,a=p[x,y]; p[x,y]=(rr&0xF8,g&0xF8,b&0xF8,255) if a>150 else (0,0,0,0)
        fr[n]=out
    base=fr[names[0]]; l,t,r,b=base.getbbox(); hb=base.crop((0,t,256,t+40)).getbbox(); cx=(hb[0]+hb[2])//2
    face=base.crop((cx-33,t,cx+33,t+70))
    if flip: face=face.transpose(Image.FLIP_LEFT_RIGHT)
    return fr,face,info
U='/mnt/user-data/uploads/'
SH={
 'ines':(U+'fa9f94a1-image.png',pairs("base","smug","sweat","shock","think","angry","point","down"),.44,134,False),
 'fiscal':(U+'a4705c79-image.png',["base","talk","smug","smugTalk","cafe","cafeTalk","shock","shockTalk","sweat","sweatTalk","angry","angryTalk","point","pointTalk","cross","crossTalk"],.44,134,True),
 'testigo':(U+'cc7a133d-image.png',pairs("base","smug","proud","sweat","shock","angry","break","cry"),.46,134,False),
 'jueza':(U+'6fcda186-image.png',pairs("base","serious","shock","think","smile","confused","disappoint","gavel"),.40,128,False),
 'cote':(U+'c70e0d62-image.png',pairs("base","happy","excited","think","serious","sweat","shock","pout"),.40,134,False),
 'tomas':(U+'ce9ea6b6-image.png',pairs("base","sweat","cry","beg","shock","down","indignant","happy"),.42,134,False),
}
s=open('v11_backup.html').read()
prev=Image.new('RGBA',(110*16,110*6),(168,104,56,255))
for row,(who,(path,names,SC,BOT,flip)) in enumerate(SH.items()):
    fr,face,info=sheet(path,names,SC,BOT,flip)
    print(who,[(n,b[2]-b[0],b[3]-b[1],sh) for n,b,sh in info])
    for i,n in enumerate(names): prev.alpha_composite(fr[n].crop((73,10,183,120)),(i*110,row*110))
    art=who+":{"+",".join('%s:"%s"'%(n,uri(f)) for n,f in fr.items())+',face:"%s"}'%uri(face)
    s,n=re.subn(who+r':\{base:"[^}]*\}',lambda m:art,s,count=1); assert n==1,who
prev.save('/tmp/prevFix.png')
open('contraprueba.html','w').write(s); print(len(s))
