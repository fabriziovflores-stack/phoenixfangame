"""Dibuja el plano grande de la Galería Mirador (Caso 1): assets/pruebas/plano-galeria-grande.png (256×192).
Las zonas que se tocan en el juego (cmd senalar) usan estas mismas coordenadas."""
from PIL import Image, ImageDraw, ImageFont
W,H=256,192
PAPEL=(232,236,242); GRID=(205,214,228); MURO=(31,58,95); VIDRIO=(110,170,230); TXT=(31,58,95)
im=Image.new("RGB",(W,H),PAPEL); d=ImageDraw.Draw(im)
for x in range(0,W,8): d.line([(x,0),(x,H)],fill=GRID)
for y in range(0,H,8): d.line([(0,y),(W,y)],fill=GRID)
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",8)
f7=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",7)
def txt(x,y,s,f=F,c=TXT): w=d.textlength(s,font=f); d.text((x-w/2,y),s,font=f,fill=c)
def muro(a,b): d.line([a,b],fill=MURO,width=3)
def puerta(x,y,horiz,largo=12):   # hueco en el muro
    if horiz: d.line([(x,y),(x+largo,y)],fill=PAPEL,width=3)
    else: d.line([(x,y),(x,y+largo)],fill=PAPEL,width=3)
# calle, vereda y casa de enfrente
d.rectangle([0,148,W,157],fill=(214,214,208)); d.rectangle([0,158,W,178],fill=(120,128,140))
for x in range(4,W,24): d.line([(x,168),(x+12,168)],fill=(230,230,230))
d.rectangle([0,179,W,H],fill=(222,206,186)); txt(128,181,"Casa de enfrente (balcón de Zoila)",f7,(90,60,40))
txt(128,160,"CALLE",F,(240,240,240))
# edificio
muro((20,10),(236,10)); muro((20,10),(20,146)); muro((236,10),(236,146)); muro((20,146),(236,146))
muro((20,60),(170,60)); muro((170,10),(170,146)); muro((196,10),(196,146)); muro((196,60),(236,60)); muro((196,96),(236,96))
# ventana de la sala (hacia la calle)
d.line([(70,146),(110,146)],fill=VIDRIO,width=4)
for x,y in [(74,150),(80,152),(88,151),(95,153),(101,150),(106,152),(84,154)]: d.point((x,y),fill=(70,120,190)); d.point((x+1,y),fill=(70,120,190))
txt(90,138,"ventana",f7)
# puertas
puerta(40,60,True); puerta(170,104,False); puerta(196,26,False); puerta(196,116,False); puerta(206,146,True,16); puerta(176,10,True,14)
# cuadro en la sala
d.rectangle([62,64,118,68],fill=(180,140,60)); txt(90,70,"(lugar del cuadro)",f7)
# rótulos
txt(95,30,"PATIO INTERIOR"); txt(95,100,"SALA PRINCIPAL")
for i,ch in enumerate("PASILLO"): txt(183,40+i*10,ch)
txt(216,14,"BODEGA")
for bx,by in [(202,30),(214,32),(224,28),(206,44),(220,44)]: d.rectangle([bx,by,bx+8,by+8],outline=MURO,fill=(196,170,130))
txt(216,66,"OFICINA",f7)
txt(216,104,"CASETA"); txt(216,114,"del guardia",f7)
txt(216,130,"entrada",f7); txt(216,137,"principal",f7)
txt(183,1,"puerta de servicio",f7)
# andamio en la vereda
for x in range(22,62,6): d.line([(x,148),(x+4,156)],fill=(150,110,60)); d.line([(x+4,148),(x,156)],fill=(150,110,60))
d.rectangle([22,148,62,156],outline=(150,110,60)); txt(42,138,"andamio",f7,(150,110,60))
# norte / título
txt(40,1,"GALERÍA MIRADOR",f7)
im.save("assets/pruebas/plano-galeria-grande.png")
print("ok")
