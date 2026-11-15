import re, numpy as np, cv2
src=open('build7.py').read(); exec(src[:src.index("def sheet(")])     # uri, load, pairs, gray, fix_pair
U='/mnt/user-data/uploads/'
def g8(im):
    a=np.asarray(im).astype(np.float32); g=a[...,:3].mean(axis=2); g[a[...,3]==0]=128; return g.astype(np.uint8)
def sheet(who,path,names,hh,target,BOT,flip=False,manual={}):
    SC=target/hh
    im=load(path); W,H=im.size; cw=W/4; chh=H/4; iw=int(cw)-2; ih=int(chh)-2
    cells=[im.crop((round((k%4)*cw)+1,round((k//4)*chh)+1,round((k%4)*cw)+1+iw,round((k//4)*chh)+1+ih)) for k in range(16)]
    for k in range(0,16,2): cells[k+1],_,_=fix_pair(cells[k],cells[k+1])
    base=cells[0]; bb=base.getbbox(); top=bb[1]
    hb=base.crop((0,top,iw,top+hh)).getbbox(); hx0,hx1=hb[0],hb[2]
    tpl=g8(base)[top:top+hh,hx0:hx1]
    # ancla: dónde queda la cabeza base en pantalla
    bw=round(iw*SC); bh=round((bb[3]-0)*SC)
    offx0=(256-bw)//2; offy0=BOT-round(bb[3]*SC)
    ax=offx0+hx0*SC; ay=offy0+top*SC
    fr={}; log=[]
    for k in range(0,16,2):
        n=names[k]; cell=cells[k]; g=g8(cell); best=(-1,1,0,0)
        if n in manual:
            f=manual[n]; cb=cell.getbbox(); hb2=cell.crop((0,cb[1],iw,cb[1]+int(hh*f))).getbbox()
            cx=(hb2[0]+hb2[2])/2; mx=cx-(hx1-hx0)*f/2; my=cb[1]; sc=-1
        else:
            for f in np.arange(0.70,1.46,0.025):
                t=cv2.resize(tpl,None,fx=f,fy=f,interpolation=cv2.INTER_AREA)
                if t.shape[0]>=g.shape[0] or t.shape[1]>=g.shape[1]: continue
                r=cv2.matchTemplate(g,t,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(r)
                if mv>best[0]: best=(mv,f,ml[0],ml[1])
            if best[0]<0.6:
                best=(-1,1,0,0)
                for f in np.arange(0.95,1.051,0.025):
                    t=cv2.resize(tpl,None,fx=f,fy=f,interpolation=cv2.INTER_AREA)
                    r=cv2.matchTemplate(g,t,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(r)
                    if mv>best[0]: best=(mv,f,ml[0],ml[1])
            sc,f,mx,my=best
        s=SC/f
        log.append((n,round(float(f),3),round(float(sc),2)))
        for kk in (k,k+1):
            c=cells[kk]; cb=cells[k].getbbox()
            w=round(iw*s); h=round(ih*s); sm=c.resize((w,h),Image.LANCZOS)
            ox=round(ax-mx*s); oy=round(ay-my*s)
            bottom=oy+cb[3]*s
            if bottom<132: oy+=round(132-bottom)
            out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,(ox,oy))
            if flip: out=out.transpose(Image.FLIP_LEFT_RIGHT)
            p=out.load()
            for y in range(192):
                for x in range(256):
                    rr,gg,b,a=p[x,y]; p[x,y]=(rr&0xF8,gg&0xF8,b&0xF8,255) if a>150 else (0,0,0,0)
            fr[names[kk]]=out
    b0=fr[names[0]]; l,t,r,b=b0.getbbox(); hb=b0.crop((0,t,256,t+40)).getbbox(); cx=(hb[0]+hb[2])//2
    face=b0.crop((cx-33,t,cx+33,t+70))
    if flip: face=face.transpose(Image.FLIP_LEFT_RIGHT)
    print(who,round(SC,3),log)
    return fr,face
SH={
 'ines':(U+'fa9f94a1-image.png',pairs("base","smug","sweat","shock","think","angry","point","down"),120,54,134,False,{}),
 'fiscal':(U+'a4705c79-image.png',["base","talk","smug","smugTalk","cafe","cafeTalk","shock","shockTalk","sweat","sweatTalk","angry","angryTalk","point","pointTalk","cross","crossTalk"],125,54,134,True,{}),
 'testigo':(U+'cc7a133d-image.png',pairs("base","smug","proud","sweat","shock","angry","break","cry"),112,52,134,False,{"break":1.1,"cry":1.2}),
 'jueza':(U+'6fcda186-image.png',pairs("base","serious","shock","think","smile","confused","disappoint","gavel"),160,62,128,False,{}),
 'cote':(U+'c70e0d62-image.png',pairs("base","happy","excited","think","serious","sweat","shock","pout"),150,57,134,False,{}),
 'tomas':(U+'ce9ea6b6-image.png',pairs("base","sweat","cry","beg","shock","down","indignant","happy"),130,54,134,False,{}),
}
s=open('v16_backup.html').read()
prev=Image.new('RGBA',(120*8,125*6),(168,104,56,255))
for row,(who,(path,names,hh,target,BOT,flip,manual)) in enumerate(SH.items()):
    fr,face=sheet(who,path,names,hh,target,BOT,flip,manual)
    for i in range(8): prev.alpha_composite(fr[names[i*2]].crop((68,5,188,130)),(i*120,row*125))
    art=who+":{"+",".join('%s:"%s"'%(n,uri(f)) for n,f in fr.items())+',face:"%s"}'%uri(face)
    s,n=re.subn(who+r':\{base:"[^}]*\}',lambda m:art,s,count=1); assert n==1,who
prev.save('/tmp/prevN.png')
open('contraprueba.html','w').write(s); print(len(s))
