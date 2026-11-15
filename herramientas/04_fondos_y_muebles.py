src=open('build4.py').read(); exec(src[:src.index("U='/mnt/user-data/uploads/'")])   # uri, load
from PIL import Image, ImageEnhance
U='/mnt/user-data/uploads/'
def q(im):
    im=im.convert('RGBA'); p=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=p[x,y]; p[x,y]=(r&0xF8,g&0xF8,b&0xF8,255) if a>150 else (0,0,0,0)
    return im
def bg(path): return Image.open(path).convert('RGB').resize((256,192),Image.LANCZOS)
lobby=bg(U+'85a47f4a-image.png'); defensa=bg(U+'6f4b08a0-image.png'); estrado=bg(U+'7a0ea703-image.png')
r,g,b=defensa.transpose(Image.FLIP_LEFT_RIGHT).split()
fiscalia=Image.merge('RGB',(r.point(lambda v:int(v*.80)),g.point(lambda v:int(v*.62)),b.point(lambda v:int(v*.70))))
BG={'lobby':lobby,'defensa':defensa,'fiscalia':fiscalia,'estrado':estrado}
f=load(U+'a86173ef-image.png'); W,H=f.size
def piece(c,r,width,top,x=None):
    cell=f.crop((c*W//2,r*H//2,(c+1)*W//2,(r+1)*H//2)); cell=cell.crop(cell.getbbox())
    h=round(cell.height*width/cell.width); sm=cell.resize((width,h),Image.LANCZOS)
    out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,((256-width)//2 if x is None else x,top)); return q(out)
DESK={'defensa':piece(0,0,276,110),'fiscalia':piece(1,0,276,110),'estrado':piece(0,1,150,106),'juez':piece(1,1,264,98)}
prev=Image.new('RGBA',(256*4,192*2))
for i,(k,v) in enumerate(BG.items()): prev.paste(v,(i*256,0))
for i,(k,v) in enumerate(DESK.items()):
    base=(BG.get(k) or Image.new('RGB',(256,192),(112,24,24))).convert('RGBA'); base.alpha_composite(v); prev.paste(base,(i*256,192))
prev.save('/tmp/prevBG.png')
s=open('v12_backup.html').read()
js='const BGIMG={'+",".join('%s:"%s"'%(k,uri(q(v))) for k,v in BG.items())+'};\nconst DESKIMG={'+",".join('%s:"%s"'%(k,uri(v)) for k,v in DESK.items())+'''};
const SCN={};
function scnImg(kind,pos){ const src=(kind==="bg"?BGIMG:DESKIMG)[pos]; if(!src) return null; const k=kind+pos;
  if(!SCN[k]){ const im=new Image(); SCN[k]=im; im.onload=()=>{ if(G.pos===pos) drawBG(pos); }; im.src=src; } return SCN[k]; }
'''
a='function drawBG(pos){'; assert s.count(a)==1; s=s.replace(a,js+a)
a='''  } else R(c,0,0,256,192,"#000");\n}'''; assert s.count(a)==1
s=s.replace(a,'''  } else R(c,0,0,256,192,"#000");
  const bi=scnImg("bg",pos), di=scnImg("desk",pos);
  if(bi&&bi.complete&&bi.naturalWidth) c.drawImage(bi,0,0);
  if(di&&di.complete&&di.naturalWidth){ d.clearRect(0,0,256,192); d.drawImage(di,0,0); }
}
["lobby","defensa","fiscalia","estrado","juez"].forEach(p=>{ scnImg("bg",p); scnImg("desk",p); });''')
open('contraprueba.html','w').write(s); print(len(s))
