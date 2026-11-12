#!/usr/bin/env python3
"""Az AR labor feliratos modelljeinek angol változata: models/<m>-feliratok.glb/.usdz → models/<m>-feliratok-en.glb/.usdz.
A feliratok a modellbe égetett PNG-k (sötét, lekerekített címke, Inter SemiBold 64 px, opcionális színes pötty). Az angol szöveggel
újrarajzoljuk őket ugyanabban a stílusban; a címke magassága marad, a szélessége a szöveghez igazodik, és a címke síkja (a modellben)
ugyanilyen arányban, a középpontja körül szélesedik/keskenyedik – így a felirat nem torzul. A számos címkék (10 %, −20 m) változatlanok.
Használat: cd _src/arlab_en && python3 build.py [modellnév …]   (a modellek: ar-labor/models; Inter SemiBold betű kell: /usr/share/fonts/opentype/inter/)"""
import sys, os, io, json, struct, zipfile, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from labels import L
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'ar-labor', 'models')
FONT = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
BG = (21, 27, 33, 255); FS = 64; PAD = 34; DOTX = 32; DOTD = 30; DOTGAP = 22; R = 40; SS = 3

def font(sz): return ImageFont.truetype(FONT, sz)

def runs(line):
    """'σ_z / σ_0: …' → [(szöveg, alsó index?)]"""
    out = []; i = 0
    for m in re.finditer(r'_(\w)', line): out.append((line[i:m.start()], False)); out.append((m.group(1), True)); i = m.end()
    out.append((line[i:], False)); return [r for r in out if r[0]]

def line_w(line, sz):
    f, fs = font(sz), font(round(sz * 0.62)); return sum((fs if sub else f).getlength(t) for t, sub in runs(line))

def draw_line(d, x, base, line, sz, s):
    f, fs = font(sz * s), font(round(sz * 0.62) * s)
    for t, sub in runs(line):
        ff = fs if sub else f; d.text((x, base + (sz * 0.18 * s if sub else 0)), t, font=ff, fill=(255, 255, 255, 255), anchor='ls'); x += ff.getlength(t)

def render(text, h, dot):
    lines = text.split('|'); sz = FS
    # kétsoros eredeti (198 px) → két sor; egysoros (121) → egy sor
    tw = max(line_w(l, sz) for l in lines)
    x0 = DOTX + DOTD + DOTGAP - 2 if dot else PAD
    w = int(round(x0 + tw + PAD + 2))
    s = SS; im = Image.new('RGBA', (w * s, h * s), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, s * 1, w * s - 1, h * s - 1), radius=R * s, fill=BG)
    if dot: cy = h / 2; d.ellipse((DOTX * s, (cy - DOTD / 2) * s, (DOTX + DOTD) * s, (cy + DOTD / 2) * s), fill=dot)
    bases = [h / 2 + 21.5] if len(lines) == 1 else [82, 159]
    for l, b in zip(lines, bases): draw_line(d, x0 * s, b * s, l, sz, s)
    return im.resize((w, h), Image.LANCZOS)

def dot_color(im):
    a = np.array(im.convert('RGBA')).astype(int); h, w, _ = a.shape
    reg = a[:, DOTX:DOTX + DOTD]; sat = reg[:, :, :3].max(2) - reg[:, :, :3].min(2); lum = reg[:, :, :3].mean(2)
    m = ((sat > 60) | (lum > 120)) & (reg[:, :, 3] > 200)
    # pötty: a bal szélső 30 px-es sávban kerek folt; szöveg ott nem kezdődik (PAD = 34)
    gap = a[:, DOTX + DOTD + 3:DOTX + DOTD + 16]; gm = ((gap[:, :, :3].max(2) - gap[:, :, :3].min(2) > 60) | (gap[:, :, :3].mean(2) > 120)) & (gap[:, :, 3] > 200)
    if m.sum() < 300 or gm.sum() > 5: return None   # a pötty és a szöveg között üres sáv van
    c = reg[m][:, :3]; return tuple(int(v) for v in np.median(c, 0)) + (255,)

# ---------------- GLB ----------------
def read_glb(p):
    b = open(p, 'rb').read(); l = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + l]); bl = struct.unpack('<I', b[20 + l:24 + l])[0]
    return j, bytearray(b[28 + l:28 + l + bl])

def write_glb(p, j, views):
    """views: a bufferView-ok új tartalma (lista) → újracsomagolás 4 bájtos igazítással"""
    out = bytearray()
    for i, v in enumerate(views):
        while len(out) % 4: out.append(0)
        j['bufferViews'][i]['byteOffset'] = len(out); j['bufferViews'][i]['byteLength'] = len(v); out += v
    while len(out) % 4: out.append(0)
    j['buffers'][0]['byteLength'] = len(out)
    js = json.dumps(j, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    tot = 12 + 8 + len(js) + 8 + len(out)
    open(p, 'wb').write(struct.pack('<III', 0x46546C67, 2, tot) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out), 0x004E4942) + out)

def acc_np(j, B, ai):
    a = j['accessors'][ai]; bv = j['bufferViews'][a['bufferView']]; off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    return off, np.frombuffer(bytes(B[off:off + a['count'] * 12]), dtype=np.float32).reshape(-1, 3).copy()

def build(name):
    src = f'{M}/{name}-feliratok'; dst = f'{M}/{name}-feliratok-en'
    j, B = read_glb(src + '.glb')
    views = [bytes(B[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]) for v in j['bufferViews']]; orig = list(views)
    # kép → a rá hivatkozó hálók POSITION-accessorai
    tex2img = {k: t['source'] for k, t in enumerate(j.get('textures', []))}
    img_pos = {}
    for m in j['meshes']:
        for p in m['primitives']:
            mat = j['materials'][p['material']] if 'material' in p else {}
            ti = mat.get('pbrMetallicRoughness', {}).get('baseColorTexture', {}).get('index')
            if ti is not None: img_pos.setdefault(tex2img[ti], set()).add(p['attributes']['POSITION'])
    newimg = {}; scale = {}
    for k, text in L[name].items():
        im = j['images'][k]; old = Image.open(io.BytesIO(views[im['bufferView']])).convert('RGBA')
        up = old.transpose(Image.FLIP_TOP_BOTTOM)   # a GLB-ben fejjel lefelé tárolt
        if text is None: continue
        dot = dot_color(up) if text.startswith('• ') else None
        if text.startswith('• ') and not dot: raise SystemExit(f'{name} {k}: nincs pötty az eredetiben')
        if dot is None and dot_color(up) and not text.startswith('• '): print(f'  ! {name} {k}: az eredetiben pötty van')
        t = text[2:] if text.startswith('• ') else text
        new = render(t, up.height, dot)
        newimg[k] = new; scale[k] = new.width / up.width
        buf = io.BytesIO(); new.transpose(Image.FLIP_TOP_BOTTOM).save(buf, 'PNG', optimize=True); views[im['bufferView']] = buf.getvalue()
    # a címkesíkok szélessége a kép szélességével arányos (a középpont körül)
    done = set()
    for k, s in scale.items():
        for ai in img_pos.get(k, ()):
            if ai in done: continue
            done.add(ai); a = j['accessors'][ai]; bvi = a['bufferView']
            arr = np.frombuffer(views[bvi], dtype=np.uint8).copy()
            off = a.get('byteOffset', 0); stride = j['bufferViews'][bvi].get('byteStride', 12)
            for v in range(a['count']):
                o = off + v * stride; x = np.frombuffer(arr[o:o + 4].tobytes(), dtype=np.float32)[0]
                arr[o:o + 4] = np.frombuffer(np.float32(x * s).tobytes(), dtype=np.uint8)
            views[bvi] = arr.tobytes()
            a['min'][0] *= s; a['max'][0] *= s
    write_glb(dst + '.glb', j, views)
    # ---------------- USDZ ----------------
    z = zipfile.ZipFile(src + '.usdz'); files = {i.filename: z.read(i) for i in z.infolist()}; order = [i.filename for i in z.infolist()]
    model = files['model.usda'].decode()
    # textúra ↔ GLB-kép: képpontok szerint
    def key(im): return np.array(im.convert('RGBA').resize((64, 16))).astype(int)
    glbkeys = {}
    for k in L[name]:
        im = Image.open(io.BytesIO(orig[j['images'][k]['bufferView']])).convert('RGBA')
        glbkeys[k] = im
    tex2k = {}
    for fn, data in files.items():
        if not fn.endswith('.png'): continue
        ti = Image.open(io.BytesIO(data)).convert('RGBA')
        for k, gi in glbkeys.items():
            if abs(gi.width / gi.height / (ti.width / ti.height) - 1) > 0.012: continue
            for cand in (ti, ti.transpose(Image.FLIP_TOP_BOTTOM)):
                if np.abs(key(cand) - key(gi)).mean() < 8: tex2k[fn] = (k, cand is not ti, ti.width / gi.width); break
            if fn in tex2k: break
    missing = [k for k in L[name] if L[name][k] is not None and k not in [v[0] for v in tex2k.values()]]
    if missing: raise SystemExit(f'{name}: USDZ-ben nem találom a képet: {missing}')
    for fn, (k, flipped, r) in tex2k.items():
        if k not in newimg: continue
        im = newimg[k].transpose(Image.FLIP_TOP_BOTTOM) if flipped else newimg[k]
        if abs(r - 1) > 0.001: im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)   # az exportáló kicsinyítette
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True); files[fn] = buf.getvalue()
    # anyag → textúra, objektum → geometria + anyag
    mat2tex = {}
    for mm in re.finditer(r'def Material "(Material_\d+)"(.*?)(?=def Material "|\Z)', model, re.S):
        t = re.search(r'asset inputs:file = @(textures/[^@]+)@', mm.group(2))
        if t: mat2tex[mm.group(1)] = t.group(1)
    nscaled = 0; gdone = set()
    for om in re.finditer(r'prepend references = @\./(geometries/Geometry_\d+\.usda)@</Geometry>.*?rel material:binding = </Materials/(Material_\d+)>', model, re.S):
        g, mat = om.group(1), om.group(2); tx = mat2tex.get(mat)
        if tx not in tex2k or tex2k[tx][0] not in scale or g in gdone: continue
        gdone.add(g); s = scale[tex2k[tx][0]]; gs = files[g].decode()
        def sc(m): return '(' + ', '.join([f'{float(m.group(1)) * s:.6f}', m.group(2), m.group(3)]) + ')'
        pts = re.search(r'point3f\[\] points = \[(.*?)\]', gs, re.S)
        newpts = re.sub(r'\(([-\d.e]+), ([-\d.e]+), ([-\d.e]+)\)', sc, pts.group(1))
        gs = gs[:pts.start(1)] + newpts + gs[pts.end(1):]
        ext = re.search(r'float3\[\] extent = \[(.*?)\]', gs)
        if ext: gs = gs[:ext.start(1)] + re.sub(r'\(([-\d.e]+), ([-\d.e]+), ([-\d.e]+)\)', sc, ext.group(1)) + gs[ext.end(1):]
        files[g] = gs.encode(); nscaled += 1
    write_usdz(dst + '.usdz', order, files)
    print(f'{name}: {len(newimg)} új felirat, GLB {os.path.getsize(dst + ".glb") // 1024} KB, USDZ {os.path.getsize(dst + ".usdz") // 1024} KB, USDZ-síkok: {nscaled}')
    return newimg

def write_usdz(p, order, files):
    """tömörítetlen ZIP, minden fájl adata 64 bájtra igazítva (USDZ-előírás)"""
    with open(p, 'wb') as f:
        cd = []; off = 0
        for fn in order:
            data = files[fn]; nb = fn.encode(); hdr_len = 30 + len(nb)
            pad = (64 - (off + hdr_len + 4) % 64) % 64; extra = struct.pack('<HH', 0x1986, pad) + b'\0' * pad
            import zlib; crc = zlib.crc32(data) & 0xffffffff
            lh = struct.pack('<IHHHHHIIIHH', 0x04034b50, 20, 0, 0, 0, 0x21, crc, len(data), len(data), len(nb), len(extra)) + nb + extra
            assert (off + len(lh)) % 64 == 0
            f.write(lh); f.write(data); cd.append((fn, nb, crc, len(data), off)); off += len(lh) + len(data)
        cdo = off; cdb = b''
        for fn, nb, crc, n, o in cd:
            cdb += struct.pack('<IHHHHHHIIIHHHHHII', 0x02014b50, 20, 20, 0, 0, 0, 0x21, crc, n, n, len(nb), 0, 0, 0, 0, 0, o) + nb
        f.write(cdb); f.write(struct.pack('<IHHHHIIH', 0x06054b50, 0, 0, len(cd), len(cd), len(cdb), cdo, 0))

if __name__ == '__main__':
    for n in sys.argv[1:] or list(L): build(n)
