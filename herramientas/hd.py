"""Versión HD de los personajes y muebles.
Para cada cuadro ya procesado (assets/personajes/<quien>/<x>.png, 256×192) busca en las hojas originales
(arte-original/) qué figura es, a qué escala y en qué posición se recortó, y la vuelve a recortar al doble
(512×384) en assets/hd/personajes/<quien>/<x>.png. Si un cuadro no se encuentra con seguridad, se usa el
cuadro chico ampliado (y se avisa en el informe).
Uso: python3 herramientas/hd.py <quien|muebles> [<quien> ...]
"""
import sys, os, json, glob
from PIL import Image, ImageFilter
import numpy as np

HOJAS = {
  "ines":   ["justo-perfil-a.png","justo-perfil-b.png","justo-apunta.png","justo-v2-b.png","justo-v2-c.png","justo-v2-d.png","justo-chaleco.png","justo-lentes.png","justo.png"],
  "fiscal": ["penna-v6-a.jpg","penna-v6-b.jpg","penna-v6-c.jpg","penna-v6-d.jpg","penna-v6-e.jpg","penna-v5.jpg"],
  "chayo":  ["chayo-v2-a.png","chayo-v2-b.png","chayo.jpg"],
  "testigo":["llavin.png"], "zoila":["zoila.png"], "tomas":["tomas.png"], "jueza":["jueza.png"],
  "eduardo":["eduardo.png"], "malva":["malva.png","malva-colapso.png"], "rocky":["rocky.png"],
  "tadeo":["tadeo.png"], "barbara":["barbara.png"], "aurelio":["aurelio.png"],
  "muebles":["muebles.png"],
}
K = 2  # factor HD
LIMITE = float(os.environ.get("LIMITE", 16))   # error máximo para aceptar la figura encontrada

def croma(path):
    a = np.array(Image.open(path).convert("RGB")).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    verde = (g > 110) & (g > r + 45) & (g > b + 45)
    al = np.where(verde, 0, 255).astype(np.uint8)
    m = g > np.maximum(r, b); a[..., 1] = np.where(m, np.maximum(r, b), g)   # quita el reflejo verde
    return np.dstack([a.clip(0, 255).astype(np.uint8), al])

def etiquetas(mask, paso=4, junta=3):
    """Componentes conectados (sin scipy): se trabaja en una versión reducida y dilatada de la máscara."""
    h, w = mask.shape
    sm = Image.fromarray((mask * 255).astype(np.uint8)).resize((w // paso, h // paso), Image.BOX)
    sm = sm.point(lambda v: 255 if v > 20 else 0).filter(ImageFilter.MaxFilter(2 * junta + 1))
    m = np.array(sm) > 0; H, W = m.shape
    lab = np.zeros((H, W), np.int32); n = 0; cajas = []
    for y in range(H):
        for x in range(W):
            if m[y, x] and not lab[y, x]:
                n += 1; pila = [(y, x)]; lab[y, x] = n; x0 = x1 = x; y0 = y1 = y; cnt = 0
                while pila:
                    cy, cx = pila.pop(); cnt += 1
                    x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; pila.append((ny, nx))
                cajas.append((n, cnt, x0 * paso, y0 * paso, (x1 + 1) * paso, (y1 + 1) * paso))
    return lab, paso, cajas

def filas(mask):
    """Franjas horizontales con figuras (separadas por franjas verdes)."""
    occ = mask.mean(1) > 0.002; segs = []; y = 0; H = len(occ)
    while y < H:
        if occ[y]:
            y0 = y
            while y < H and occ[y]: y += 1
            if y - y0 > H * 0.08: segs.append((y0, y))
        else: y += 1
    return segs

def figuras(hoja, gx=4):
    rgba = croma(os.path.join("arte-original", hoja))
    mask = rgba[..., 3] > 0
    H, W = mask.shape; cw = W / gx
    segs = filas(mask)
    if len(segs) < 2:                               # sin franjas claras: cuadrícula 4×4 o 4×2 según el formato
        gy = 4 if abs(W - H) < 50 or H > W * 0.7 else 2
        segs = [(int(i * H / gy), int((i + 1) * H / gy)) for i in range(gy)]
    out = []
    for (y0, y1) in segs:
        for c in range(gx):
            x0, x1 = int(c * cw), int((c + 1) * cw)
            sub = rgba[y0:y1, x0:x1]; m = sub[..., 3] > 0
            if m.mean() < 0.01: continue
            lab, paso, cajas = etiquetas(m, paso=2, junta=2)
            if not cajas: continue
            cajas.sort(key=lambda c_: -c_[1]); principal = cajas[0]
            keep = np.zeros(lab.shape, bool)
            for n, cnt, bx0, by0, bx1, by1 in cajas:
                toca = bx0 <= 2 or bx1 >= m.shape[1] - 3
                if n == principal[0] or (cnt > principal[1] * 0.004 and not toca): keep |= (lab == n)
            km = np.array(Image.fromarray(keep.astype(np.uint8) * 255).resize((lab.shape[1] * paso, lab.shape[0] * paso), Image.NEAREST)) > 0
            km = np.pad(km, ((0, max(0, m.shape[0] - km.shape[0])), (0, max(0, m.shape[1] - km.shape[1]))))[:m.shape[0], :m.shape[1]]
            img = sub.copy(); img[..., 3] = np.where(km, img[..., 3], 0)
            ys, xs = np.where(img[..., 3] > 0)
            if not len(ys): continue
            out.append({"hoja": hoja, "fila": len(set(f_["fila"] for f_ in out if f_["hoja"] == hoja)) if False else segs.index((y0, y1)), "col": c, "img": img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]})
    return out

def escalar(rgba, s, w=None, h=None):
    """Achica/agranda con alfa premultiplicado (sin bordes verdes ni oscuros)."""
    im = rgba.astype(np.float32); al = im[..., 3:4] / 255.0
    pre = np.dstack([im[..., :3] * al, im[..., 3:4]])
    W = w or max(1, round(rgba.shape[1] * s)); H = h or max(1, round(rgba.shape[0] * s))
    ch = [np.array(Image.fromarray(pre[..., i]).resize((W, H), Image.LANCZOS)) for i in range(4)]
    a = np.clip(ch[3], 0, 255); f = np.where(a > 0, 255.0 / np.maximum(a, 1e-3), 0)
    rgb = np.dstack([np.clip(ch[i] * f, 0, 255) for i in range(3)])
    return np.dstack([rgb, a]).astype(np.uint8)

def pegar(lienzo, img, x, y):
    H, W = lienzo.shape[:2]; h, w = img.shape[:2]
    x0, y0 = max(0, x), max(0, y); x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0: return lienzo
    src = img[y0 - y:y1 - y, x0 - x:x1 - x].astype(np.float32); dst = lienzo[y0:y1, x0:x1].astype(np.float32)
    a = src[..., 3:4] / 255.0; da = dst[..., 3:4] / 255.0
    oa = a + da * (1 - a)
    rgb = (src[..., :3] * a + dst[..., :3] * da * (1 - a)) / np.maximum(oa, 1e-6)
    lienzo[y0:y1, x0:x1] = np.dstack([rgb, oa * 255]).clip(0, 255).astype(np.uint8)
    return lienzo

_EC = {}
def render(fig, s, x, y, k=1, flip=False):
    src = fig["img"][:, ::-1] if flip else fig["img"]
    w = round(src.shape[1] * s); h = round(src.shape[0] * s)
    ck = (id(fig), w, h, k, flip)
    if ck not in _EC:
        if len(_EC) > 400: _EC.clear()
        _EC[ck] = escalar(src, None, w * k, h * k)
    im = _EC[ck]
    return pegar(np.zeros((192 * k, 256 * k, 4), np.uint8), im, x * k, y * k)

_MC = {}
def mascara_esc(fig, s, flip):
    k = (id(fig), round(s, 4), flip)
    if k in _MC: return _MC[k]
    m = fig["img"][..., 3]; m = m[:, ::-1] if flip else m
    w = max(1, round(m.shape[1] * s)); h = max(1, round(m.shape[0] * s))
    r = _MC[k] = np.array(Image.fromarray(m).resize((w, h), Image.BILINEAR)) > 127
    return r

def iou_en(lien, msk, x, y):
    H, W = lien.shape; h, w = msk.shape
    x0, y0 = max(0, x), max(0, y); x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0: return 0.0
    inter = (lien[y0:y1, x0:x1] & msk[y0 - y:y1 - y, x0 - x:x1 - x]).sum()
    vis = msk[y0 - y:y1 - y, x0 - x:x1 - x].sum()
    return inter / (lien.sum() + vis - inter + 1e-6)

def ancla(m):
    ys, xs = np.where(m)
    if not len(ys): return None
    y0 = ys.min(); fil = xs[ys < y0 + 3]
    return float(fil.mean()), int(y0)

FLIP = os.environ.get("FLIP", "0") == "1"   # las hojas ya miran hacia el mismo lado que el juego

def buscar(frame, figs):
    """1) por forma (máscara) se eligen las mejores candidatas; 2) se comparan a fondo los colores (la cara incluida)."""
    fm = frame[..., 3] > 127
    af = ancla(fm)
    if af is None: return None
    cand = {}
    for fi, fig in enumerate(figs):
        for flip in ((False, True) if FLIP else (False,)):
            for s in np.arange(0.12, 1.0, 0.01):
                m = mascara_esc(fig, s, flip); am = ancla(m)
                x = int(round(af[0] - am[0])); y = int(round(af[1] - am[1]))
                v = iou_en(fm, m, x, y)
                k = (fi, flip)
                if k not in cand or v > cand[k][0]: cand[k] = (v, float(s), x, y)
    top = sorted(cand.items(), key=lambda kv: -kv[1][0])[:14]
    if not top or top[0][1][0] < 0.5: return None
    res = []
    for (fi, flip), (v, s, x, y) in top:
        if v < top[0][1][0] - 0.12: continue
        e, s2, x2, y2 = afinar(frame, figs[fi], flip, s, x, y, rango=3)
        res.append((e, fi, flip, s2, x2, y2, v))
    res.sort()
    e, fi, flip, s, x, y, v = res[0]
    e, s, x, y = afinar(frame, figs[fi], flip, s, x, y, rango=1)
    return {"fig": fi, "flip": flip, "s": s, "x": x, "y": y, "err": round(float(e), 2), "iou": round(float(v), 3)}

def pareja(figs, fi):
    f = figs[fi]
    for j, g in enumerate(figs):
        if g["hoja"] == f["hoja"] and g["fila"] == f["fila"] and g["col"] == (f["col"] ^ 1): return j
    return None

def afinar(frame, fig, flip, s, x, y, rango=3):
    f = frame.astype(np.float32)
    def err(s, x, y):
        r = render(fig, s, x, y, 1, flip).astype(np.float32)
        a = (f[..., 3] > 127) | (r[..., 3] > 127)
        return np.abs(f[..., :3] - r[..., :3])[a].mean() + 60 * np.mean((f[..., 3] > 127) != (r[..., 3] > 127))
    best = (err(s, x, y), s, x, y)
    for s2 in (np.arange(s - 0.006, s + 0.0061, 0.002) if rango else [s]):
        for dx in range(-rango, rango + 1):
            for dy in range(-rango, rango + 1):
                e = err(s2, x + dx, y + dy)
                if e < best[0]: best = (e, float(s2), x + dx, y + dy)
    return best

def zona_boca(frame, ra, rb):
    """Píxeles donde los dos cuadros de la pareja se distinguen (la boca)."""
    d = np.abs(ra[..., :3].astype(np.int32) - rb[..., :3].astype(np.int32)).sum(2) * ((ra[..., 3] > 127) & (rb[..., 3] > 127))
    z = d > 70
    return np.array(Image.fromarray((z * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0

def cerrado(frame, figs, t):
    """Asegura que el cuerpo salga del cuadro correcto de la pareja (boca cerrada para un cuadro callado)."""
    pj = pareja(figs, t["fig"])
    if pj is None: return t
    ma = mascara_esc(figs[t["fig"]], t["s"], t["flip"]); mb = mascara_esc(figs[pj], t["s"], t["flip"])
    aa, ab = ancla(ma), ancla(mb)
    x0 = int(round(t["x"] + aa[0] - ab[0])); y0 = int(round(t["y"] + aa[1] - ab[1]))
    e2, s2, x2, y2 = afinar(frame, figs[pj], t["flip"], t["s"], x0, y0, rango=4)
    ra = render(figs[t["fig"]], t["s"], t["x"], t["y"], 1, t["flip"]); rb = render(figs[pj], s2, x2, y2, 1, t["flip"])
    z = zona_boca(frame, ra, rb)
    if z.sum() >= 4:                                  # decide por la zona donde las dos caras se distinguen (la boca)
        f = frame[..., :3].astype(np.float32)
        ea = np.abs(f - ra[..., :3])[z].mean(); eb = np.abs(f - rb[..., :3])[z].mean()
        mejor_b = eb < ea
    else:
        mejor_b = e2 < t["err"] - 0.05
    if mejor_b: t = dict(t, fig=pj, s=s2, x=x2, y=y2, err=round(float(e2), 2), cambio="pareja")
    return t

def boca_de(frame, figs, t):
    """Para el cuadro «hablando»: el cuerpo del cuadro cerrado (t) y la boca del otro de la pareja, alineada."""
    pj = pareja(figs, t["fig"])
    if pj is None: return None
    ra = render(figs[t["fig"]], t["s"], t["x"], t["y"], 1, t["flip"])
    # alinear la cara de boca abierta sobre la cerrada: primero por el tope de la cabeza, luego afinando
    ma = mascara_esc(figs[t["fig"]], t["s"], t["flip"]); mb = mascara_esc(figs[pj], t["s"], t["flip"])
    aa, ab = ancla(ma), ancla(mb)
    x0 = int(round(t["x"] + aa[0] - ab[0])); y0 = int(round(t["y"] + aa[1] - ab[1]))
    e, s2, xb, yb = afinar(ra, figs[pj], t["flip"], t["s"], x0, y0, rango=4)
    rb = render(figs[pj], s2, xb, yb, 1, t["flip"])
    z = zona_boca(frame, ra, rb)
    if z.sum() < 3: return None
    f = frame[..., :3].astype(np.float32)
    e = np.abs(f - rb[..., :3])[z].mean()
    return {"fig": pj, "s": s2, "x": xb, "y": yb, "err": round(float(e), 2), "zona": z}

def mezclar_boca(hd, figs, t, b):
    otro = render(figs[b["fig"]], b["s"], b["x"], b["y"], K, t["flip"])
    zm = np.array(Image.fromarray((b["zona"] * 255).astype(np.uint8)).resize((256 * K, 192 * K), Image.BILINEAR).filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32)[..., None] / 255
    return (hd * (1 - zm) + otro * zm).astype(np.uint8)

def main():
    quienes = sys.argv[1:]
    informe = {}
    for qq in quienes:
        q, _, solo = qq.partition(":"); solo = set(solo.split(",")) if solo else None
        figs = []
        for h in HOJAS[q]:
            if os.path.exists(os.path.join("arte-original", h)): figs += figuras(h)
        print(q, "figuras:", len(figs), flush=True)
        carpeta = "assets/muebles" if q == "muebles" else f"assets/personajes/{q}"
        dest = "assets/hd/muebles" if q == "muebles" else f"assets/hd/personajes/{q}"
        os.makedirs(dest, exist_ok=True)
        nombres = sorted(os.path.basename(p)[:-4] for p in glob.glob(carpeta + "/*.png"))
        def base_de(n):
            if n.endswith("Talk"): return n[:-4]
            if n == "talk": return "base"
            if n.endswith("_talk"): return n[:-5] + "_base"
            return None
        hablados = {n: base_de(n) for n in nombres if base_de(n) in nombres}
        T = {}
        orden = [n for n in nombres if n not in hablados] + list(hablados)
        if solo:
            for n in orden:                           # cuadros cerrados ya hechos: se reutiliza su posición para la boca
                if n not in solo and n not in hablados and os.path.exists(f"herramientas/hd-informe/{q}.json"):
                    prev = json.load(open(f"herramientas/hd-informe/{q}.json")).get(f"{q}/{n}")
                    if prev and not prev.get("ampliado"): T[n] = prev
            orden = [n for n in orden if n in solo]
        for n in orden:
            fr = np.array(Image.open(f"{carpeta}/{n}.png").convert("RGBA"))
            if fr.shape[:2] != (192, 256):            # caras chicas del expediente: se amplían tal cual
                Image.fromarray(fr).resize((fr.shape[1] * K, fr.shape[0] * K), Image.LANCZOS).save(f"{dest}/{n}.png"); continue
            if n in hablados and hablados[n] in T:
                t = dict(T[hablados[n]]); b = boca_de(fr, figs, t)
                hd = render(figs[t["fig"]], t["s"], t["x"], t["y"], K, t["flip"])
                if b: hd = mezclar_boca(hd, figs, t, b); t["boca"] = {k: v for k, v in b.items() if k != "zona"}
                Image.fromarray(hd).save(f"{dest}/{n}.png"); informe[f"{q}/{n}"] = t
                print(" ", n, "boca", b and b["err"], flush=True); continue
            t = buscar(fr, figs)
            ok = t and t["err"] < LIMITE
            if ok:
                t = cerrado(fr, figs, t); T[n] = t
                hd = render(figs[t["fig"]], t["s"], t["x"], t["y"], K, t["flip"])
                Image.fromarray(hd).save(f"{dest}/{n}.png")
            else:
                Image.fromarray(fr).resize((256 * K, 192 * K), Image.LANCZOS).save(f"{dest}/{n}.png")
            informe[f"{q}/{n}"] = t if ok else {"ampliado": True, **(t or {})}
            print(" ", n, "OK" if ok else "AMPLIADO", t and t["err"], t and t.get("cambio",""), flush=True)
    os.makedirs("herramientas/hd-informe", exist_ok=True)
    for q in set(k.split("/")[0] for k in informe):
        f = f"herramientas/hd-informe/{q}.json"; viejo = json.load(open(f)) if os.path.exists(f) else {}
        viejo.update({k: v for k, v in informe.items() if k.startswith(q + "/")}); json.dump(viejo, open(f, "w"), indent=1, default=str)

if __name__ == "__main__":
    main()
