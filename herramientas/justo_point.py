"""Pose «point» de Justo: cuerpo y brazo izquierdo del cuadro ap13 (natural) + brazo extendido del point actual (acortado con justo_brazo.py).
Corta en una línea vertical dentro del chaleco, donde ambos dibujos coinciden (alineados por el chaleco: DX, DY).
Uso: python3 herramientas/justo_point.py ORIGEN_POINT ORIGEN_POINTTALK DESTINO_DIR"""
import sys
import numpy as np
from PIL import Image
P='assets/personajes/ines/'
DX, DY, CUT, CUT_ALTO, Y_HOMBRO = 4, 3, 112, 128, 72
def armar(point_png, base_png=P+'ap13.png', boca_de=None):
    pt=np.array(Image.open(point_png).convert('RGBA')); a=np.array(Image.open(base_png).convert('RGBA'))
    ptS=np.zeros_like(pt); ptS[DY:,DX:]=pt[:-DY,:-DX]
    out=a.copy()
    out[:Y_HOMBRO,CUT_ALTO:]=ptS[:Y_HOMBRO,CUT_ALTO:]
    out[Y_HOMBRO:,CUT:]=ptS[Y_HOMBRO:,CUT:]
    hueco=(out[:,:,3]==0)&(ptS[:,:,3]>0); hueco[:,:100]=False; hueco[:60,:]=False; hueco[:78,:116]=False   # rellena el hombro donde A no tiene dibujo
    out[hueco]=ptS[hueco]
    if boca_de is not None:                       # boca abierta: lo que cambia entre pointTalk y point (la cabeza coincide con la de A)
        t=np.array(Image.open(boca_de).convert('RGBA')); p0=np.array(Image.open(point_png).convert('RGBA'))
        m=(np.abs(t.astype(int)-p0.astype(int)).sum(2)>0); m[80:,:]=False; m[:,120:]=False
        out[m]=t[m]
    return out
if __name__=='__main__':
    src_p, src_t, dst = sys.argv[1:4]
    Image.fromarray(armar(src_p)).save(dst+'/point.png')
    Image.fromarray(armar(src_p, boca_de=src_t)).save(dst+'/pointTalk.png')
