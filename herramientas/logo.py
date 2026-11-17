import sys
from PIL import Image, ImageFilter
import numpy as np
def logo(src,out,S):
    im=np.array(Image.open(src).convert('RGB')).astype(int)
    mx=im.max(2); mn=im.min(2); sat=mx-mn
    ink=(sat>90)
    m=Image.fromarray((ink*255).astype(np.uint8))
    bb=m.getbbox(); pad=40
    box=(bb[0]-pad,bb[1]-pad,bb[2]+pad,bb[3]+pad)
    m=m.crop(box); col=Image.fromarray(im.astype(np.uint8)).crop(box)
    W=520; H=int(round(m.height*W/m.width))
    m=m.resize((W,H),Image.LANCZOS); col=col.resize((W,H),Image.LANCZOS)
    ink=np.array(m)>110
    white=np.array(m.filter(ImageFilter.MaxFilter(9)))>110
    dark=np.array(m.filter(ImageFilter.MaxFilter(13)))>110
    c=np.array(col).astype(int)
    out_a=np.zeros((H,W,4),np.uint8)
    out_a[dark]=[20,20,40,255]; out_a[white]=[255,255,255,255]
    ci=c[ink]; out_a[ink,:3]=ci; out_a[ink,3]=255
    o=Image.fromarray(out_a,'RGBA'); o=o.crop(o.getbbox()); o.save(out); print(out,o.size)
    p=Image.new('RGBA',o.size,(90,60,40,255)); p.alpha_composite(o); p.save(S+'/'+out.split('/')[-1])
logo('arte-original/hud/titulo-testimonio.jpg','assets/hud/titulo-testimonio.png',sys.argv[1])
logo('arte-original/hud/titulo-contrainterrogatorio.jpg','assets/hud/titulo-contra.png',sys.argv[1])
logo('arte-original/hud/titulo-interrogatorio.png','assets/hud/titulo-interrogatorio.png',sys.argv[1])
