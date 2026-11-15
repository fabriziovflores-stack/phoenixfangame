from PIL import Image, ImageFilter
import base64, io, re
def uri(img):
    b=io.BytesIO(); img.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def load(path):
    im=Image.open(path).convert('RGBA'); W,H=im.size; px=im.load()
    mask=Image.new('L',(W,H),0); mp=mask.load()
    for y in range(H):
        for x in range(W):
            r,g,b,a=px[x,y]
            if g>150 and r<120 and b<120 and g>1.5*max(r,b): mp[x,y]=255
    near=mask.filter(ImageFilter.MaxFilter(7)).load()
    for y in range(H):
        for x in range(W):
            if mp[x,y]: px[x,y]=(20,20,30,0)
            elif near[x,y]:
                r,g,b,a=px[x,y]
                if g>1.15*max(r,b): px[x,y]=(r,max(r,b),b,255) if g<170 else (20,20,30,0)
    return im
def sheet(path,names,SC=.35,BOT=134,flip=False):
    im=load(path); W,H=im.size; cw=W/4; chh=H/3; fr={}
    for k,n in enumerate(names):
        c,r=k%4,k//4
        cell=im.crop((round(c*cw)+1,round(r*chh)+2,round((c+1)*cw)-1,round((r+1)*chh)-1))
        bb=cell.getbbox(); cell=cell.crop((0,bb[1],cell.width,bb[3]))
        if flip: cell=cell.transpose(Image.FLIP_LEFT_RIGHT)
        w=round(cell.width*SC); h=round(cell.height*SC); sm=cell.resize((w,h),Image.LANCZOS)
        out=Image.new('RGBA',(256,192),(0,0,0,0)); out.paste(sm,((256-w)//2,BOT-h))
        p=out.load()
        for y in range(192):
            for x in range(256):
                rr,g,b,a=p[x,y]; p[x,y]=(rr&0xF8,g&0xF8,b&0xF8,255) if a>150 else (0,0,0,0)
        fr[n]=out
    base=fr[names[0]]; l,t,r,b=base.getbbox(); hb=base.crop((0,t,256,t+50)).getbbox(); cx=(hb[0]+hb[2])//2
    face=base.crop((cx-33,t,cx+33,t+70))
    if flip: face=face.transpose(Image.FLIP_LEFT_RIGHT)
    return fr,face
U='/mnt/user-data/uploads/'
SH={
 'fiscal':(U+'3db64288-image.png',["base","talk","blink","smug","smugTalk","sip","cafeTalk","shock","sweat","slam","point","pointTalk"],dict(flip=True)),
 'testigo':(U+'7587310b-image.png',["base","talk","blink","proud","smug","smugTalk","sweat","sweatTalk","shock","angry","break","cry"],dict()),
 'jueza':(U+'2f651b32-image.png',["base","talk","blink","serious","seriousTalk","shock","think","smile","confused","disappoint","gavelUp","gavelHit"],dict(BOT=128)),
 'cote':(U+'768e618a-image.png',["base","talk","blink","smile","excited","think","serious","sweat","shock","pout","eat","worried"],dict(SC=.34)),
}
arts=[]; prev=Image.new('RGBA',(256*12,150*4),(168,104,56,255))
for row,(who,(path,names,kw)) in enumerate(SH.items()):
    fr,face=sheet(path,names,**kw)
    for i,n in enumerate(names): prev.alpha_composite(fr[n].crop((0,0,256,150)),(i*256,row*150))
    arts.append(who+":{"+",".join('%s:"%s"'%(n,uri(f)) for n,f in fr.items())+',face:"%s"}'%uri(face))
prev.crop((0,0,256*6,600)).save('/tmp/prevA.png'); prev.crop((256*6,0,256*12,600)).save('/tmp/prevB.png')

s=open('v7_backup.html').read()
i=s.index('const ART={ines:'); i2=s.index('};\nfunction artFor',i); j=s.index("return A[mood]||A.base; }")+len("return A[mood]||A.base; }")
ines=s[i+len('const ART={'):i2]
s=s[:i]+'const ART={'+ines+",\n"+",\n".join(arts)+'''};
/* Qué celda de la hoja usa cada emoción: [callado, hablando, parpadeo] */
const AMAP={
  ines:{normal:["base","talk","blink"],serious:["base","talk","blink"],sweat:["sweat","sweatTalk"],smug:["smug","smile"],smile:["smug","smile"],shock:"shock",think:"think",angry:"angry","pose:point":["point","pointTalk"]},
  fiscal:{normal:["base","talk","blink"],serious:["base","talk","blink"],smug:["smug","smugTalk"],smile:["smug","smugTalk"],shock:"shock",sweat:"sweat",angry:"slam","pose:point":["point","pointTalk"]},
  testigo:{normal:["base","talk","blink"],smile:"proud",smug:["smug","smugTalk"],sweat:["sweat","sweatTalk"],shock:"shock",angry:"angry",break:"break",cry:"cry"},
  jueza:{normal:["base","talk","blink"],serious:["serious","seriousTalk"],shock:"shock",think:"think",smile:"smile",confused:"confused",disappoint:"disappoint",gavel:["gavelUp","gavelHit"]},
  cote:{normal:["base","talk","blink"],smile:["base","smile"],excited:"excited",think:"think",serious:"serious",sweat:"sweat",shock:"shock",pout:"pout",eat:"eat",worried:"worried"},
};
function artFor(who,mood,pose,m,b){ const A=ART[who]; if(!A) return null; const M=AMAP[who];
  if(who==="fiscal"&&pose==="cafe"&&mood!=="shock") return (m||typing)?"cafeTalk":"sip";
  let e=(pose&&M["pose:"+pose])||M[mood]||M.normal; if(typeof e==="string") e=[e];
  return m?(e[1]||e[0]):((b&&e[2])||e[0]); }'''+s[j:]
def rep(a,b):
    global s
    assert s.count(a)==1,(s.count(a),a[:60]); s=s.replace(a,b)
rep('function fkey(who,mood,pose,m,b){ return [who,mood,pose,G.nocap,m,b].join("|"); }',
    'function fkey(who,mood,pose,m,b){ const a=artFor(who,mood,pose,m,b); return a ? who+"|art|"+a : [who,mood,pose,G.nocap,m,b].join("|"); }')
rep('img.src=art||(','img.src=(art?ART[who][art]:null)||(')
rep('typing=false; done&&done(); };','typing=false; renderSprite(); done&&done(); };')

def setm(who,snip,mood=None,pose=None):
    global s
    assert s.count(snip)==1,(s.count(snip),snip)
    t=s.index(snip); o=s.rindex('{who:"%s"'%who,0,t); e=s.index('}',t)+1
    obj=s[o:e]; assert obj.count('{')==1,obj
    if mood: obj=re.sub(r'mood:"[a-z]+",','',obj).replace('{who:"%s",'%who,'{who:"%s",mood:"%s",'%(who,mood))
    if pose and 'pose:' not in obj: obj=obj.replace('{who:"%s",'%who,'{who:"%s",pose:"%s",'%(who,pose))
    s=s[:o]+obj+s[e:]
def ins_after(snip,line):
    global s
    assert s.count(snip)==1,(s.count(snip),snip)
    t=s.index(snip); e=s.index('}',t)+1; s=s[:e]+",\n   "+line+s[e:]
def stmood(start,mood):
    rep(', text:"'+start, ', mood:"%s", text:"'%mood+start)
# Coté
setm('cote','¡Llegaste! Ya me comí dos empanadas','eat')
setm('cote','Justo la coartada que nadie puede confirmar','worried')
setm('cote','por lo menos almorzamos empanadas','excited')
setm('cote','(¡Lo logramos, Ignacio!)','excited')
setm('cote','¡Empanadas para todos!','eat')
setm('cote','¡Ignacio! Ahora puedes contrainterrogarlo','excited')
ins_after('(¿Novato? Ya vas a ver, cortadito...)','{who:"cote",mood:"pout",text:"(¡Qué tipo más pesado! No le hagas caso.)"}')
ins_after('text:"¡¿Desde adentro?!"','{who:"cote",mood:"shock",text:"(¡Ignacio! ¡Entonces nadie entró por ahí!)"}')
# Jueza
setm('jueza','Se abre la audiencia de juicio oral','gavel')
setm('jueza','Qué... bonito. Señor Molina','confused')
setm('jueza','¿Bajo el brazo? Señor Molina','confused')
setm('jueza','text:"Tiene sentido..."','think')
rep('{cmd:"present", who:"jueza", tab:"perfiles"','{cmd:"present", who:"jueza", mood:"think", tab:"perfiles"')
rep('say({who:st.who,text:st.text}','say({who:st.who,mood:st.mood,text:st.text}')
setm('jueza','¿Y en qué la contradice, exactamente?','confused')
setm('jueza','Muy bien. Este tribunal declara','smile')
setm('jueza','Entonces explíquenos cómo lo reconoció','think')
n=s.count('{who:"jueza",mood:"serious",damage:true'); print("dmg lines",n)
s=s.replace('{who:"jueza",mood:"serious",damage:true','{who:"jueza",mood:"disappoint",damage:true')
# Molina
setm('testigo','¡Pero era él! ¡Le vi la cara clarito!','angry')
setm('testigo','¡Y-yo qué sé! ¡Pregúntele a él!','angry')
setm('testigo','¡Eso! ¡Déjenme contarles lo de la ventana!','smile')
stmood('¡Se lo llevó bajo el brazo','smug'); stmood('Lo reconocí al tiro','smug')
stmood('Bueno, puede que el cuadro lo arrastrara','sweat'); stmood('La sala estaba iluminada','smug'); stmood('Con esa luz, hasta un ciego','smug')
stmood('Yo había cerrado la puerta de la sala','smug'); stmood('Y después salió por la misma ventana','smile'); stmood('Y se fue corriendo cerro abajo','angry')
# Fiscal
ins_after('Envuelto en mi chaqueta de invierno','{who:"fiscal",mood:"angry",anim:"slam",text:"¡N-no puede ser! ¡Mi caso perfecto...!"}')
setm('fiscal','Los hechos: el 3 de noviembre','serious')
open('contraprueba.html','w').write(s); print(len(s))
