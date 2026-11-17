import sys
from PIL import Image
import numpy as np
S=sys.argv[1]
def cut(f,cell,box,out,flip=False):
    im=np.array(Image.open(f).convert('RGB')).astype(int)
    gx,gy=cell; cw=im.shape[1]//4; ch=im.shape[0]//2
    c=im[gy*ch:(gy+1)*ch, gx*cw:(gx+1)*cw]
    r,g,b=c[...,0],c[...,1],c[...,2]
    a=np.where((g>120)&(g>r+50)&(g>b+50),0,255).astype(np.uint8)
    # despill
    c2=c.copy(); m=(g>np.maximum(r,b)); c2[...,1]=np.where(m,np.maximum(r,b),g)
    rgba=np.dstack([c2.clip(0,255).astype(np.uint8),a])
    x0,y0,x1,y1=box
    crop=Image.fromarray(rgba,'RGBA').crop(box)
    W=512; H=int(round(W*(y1-y0)/(x1-x0)))
    crop=crop.resize((W,H),Image.LANCZOS)
    # 15-bit color
    arr=np.array(crop); arr[...,:3]=(arr[...,:3]//8)*8; arr[...,3]=np.where(arr[...,3]>128,255,0)
    Image.fromarray(arr,'RGBA').save(out); print(out,W,H)
    prev=Image.new('RGBA',(W,H),(64,200,180,255)); prev.alpha_composite(Image.fromarray(arr,'RGBA')); prev.save(out.replace('.png','_prev.png').replace('assets/hud',S))
# Justo serious: cell (2,0); face eyes ~ (1130,140) full -> in cell x 1130-887=243
cut('arte-original/justo-v2-b.png',(2,0),(100,104,390,167),'assets/hud/vs_justo.png')
cut('arte-original/penna-v6-b.jpg',(0,1),(118,71,338,119),'assets/hud/vs_penna.png')
