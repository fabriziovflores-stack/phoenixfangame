"""Recorta una hoja de pruebas 4x2 sobre verde croma y deja íconos de 96x96 en assets/pruebas.
Uso: python3 herramientas/pruebas.py HOJA nombre1 nombre2 ... (vacío = '-')"""
import sys
from PIL import Image
import numpy as np
hoja, nombres = sys.argv[1], sys.argv[2:]
im=np.array(Image.open(hoja).convert('RGB')).astype(int)
H,W=im.shape[:2]; cw,ch=W//4,H//2
for k,n in enumerate(nombres):
    if n=='-': continue
    gx,gy=k%4,k//4
    c=im[gy*ch:(gy+1)*ch, gx*cw:(gx+1)*cw].copy()
    r,g,b=c[...,0],c[...,1],c[...,2]
    a=np.where((g>110)&(g>r+45)&(g>b+45),0,255).astype(np.uint8)
    m=(g>np.maximum(r,b)); c[...,1]=np.where(m,np.maximum(r,b),g)     # quita el reflejo verde
    o=Image.fromarray(np.dstack([c.clip(0,255).astype(np.uint8),a]),'RGBA')
    o=o.crop(o.getbbox())
    s=88/max(o.size); o=o.resize((max(1,round(o.width*s)),max(1,round(o.height*s))),Image.LANCZOS)
    arr=np.array(o); arr[...,3]=np.where(arr[...,3]>110,255,0); o=Image.fromarray(arr,'RGBA')
    out=Image.new('RGBA',(96,96),(0,0,0,0)); out.paste(o,((96-o.width)//2,(96-o.height)//2),o)
    out.save(f'assets/pruebas/{n}.png'); print(n)
