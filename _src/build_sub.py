"""Az átfogó extrák (/helyszinelok, /tippelj, /vizsga, /telek, /ar-labor) angol változata: <app>/index.html → <app>/en.html (Vercel cleanUrls → /<app>/en).

Használat:  cd _src/sub_i18n && npm install && cd .. && python3 build_sub.py
            python3 build_sub.py catalog   → a fordítandó szövegek munkalapja (sub_i18n/ws_<app>.tsv)
            (a magyar oldalak előkészítése – nyelvváltó, EN jelző, angol tördelési szabályok –: python3 sub_prep_hu.py)
A magyar oldal a forrás (egyfájlos, kézzel írt HTML). Az angol változat:
 1. PRE: néhány szórend-függő sablonrész cseréje (ahol a magyar sorszám/névelő a beágyazott sablon határán van);
 2. sub_i18n/apply.mjs: a szövegek, attribútumok és JS-karakterláncok cseréje a sub_i18n/en_*.tsv párjai szerint
    (STRICT: ha a magyar szöveg változik és nincs hozzá fordítás, leáll; a hiányzók: sub_i18n/missing.tsv);
 3. POST: lang="en-GB", en-gb elválasztás, nyelvváltó a magyar oldalra, az átirányító szkript nélkül; tizedespont a HTML-szövegben és a
    JS-literálokban (sub_i18n/numfix_js.mjs); tg → tan, ctg → cot a képletekben; az angolul is elérhető tananyagokra az /en oldal mutat,
    a többi mellett „(in Hungarian)” jelzés.
"""
import os, re, sys, glob, shutil, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE); I18N = os.path.join(HERE, 'sub_i18n')
APPS = ['helyszinelok', 'tippelj', 'vizsga', 'telek', 'ar-labor']
if os.environ.get('ONLY'): APPS = os.environ['ONLY'].split(',')   # csak a megadott app(ok) – fordítás közben
# az angolul is elérhető tananyagok (a többi magyar marad, „(in Hungarian)” jelzéssel)
EN_SITES = ['bme-alapozas.vercel.app', 'talajfelderites.vercel.app', 'sikalapoktervezese.vercel.app', 'sikalapok-teherbirasszamitasa.vercel.app',
            'sikalapokallekonysagvizsgalata.vercel.app', 'kedvezotlen-altalaj.vercel.app', 'sikalapok-sullyedesszamitasa.vercel.app', 'vedekezesakarossullyedesekellen.vercel.app',
            'sikalapokaterohatasok.vercel.app', 'melyalapozasok.vercel.app', 'munkaterhatarolasok.vercel.app',
            'bme-alapozas.vercel.app/telek', 'bme-alapozas.vercel.app/helyszinelok', 'bme-alapozas.vercel.app/tippelj', 'bme-alapozas.vercel.app/vizsga', 'bme-alapozas.vercel.app/ar-labor',
            'cfa-colop-3d.vercel.app', 'cfa-colop-3d.vercel.app/ar']

# a még csak magyar tananyagra mutató link után: „(in Hungarian)”
HUNOTE = "${{{0}}}${{/\\/en$/.test({1}) ? '' : ' (in Hungarian)'}}"
# PRE: (magyar részlet → angol) a fordítás előtt – szórend a beágyazott sablonok határán
PRE = {
  'helyszinelok': [
    ('<span class="tagreal">${c.st[0]}. előadás</span>', '<span class="tagreal">Lecture ${c.st[0]}</span>'),
    ('<span>${cr + 1}. homlokzat a 6-ból</span>', '<span>Façade ${cr + 1} of 6</span>'),
  ],
  'tippelj': [],
  'telek': [
    ('aria-label="${s.n}. állomás: ${s.t}', 'aria-label="Station ${s.n}: ${s.t}'),
    ('aria-label="${k} rétegsora"', 'aria-label="Borehole log ${k}"'),
    ('aria-label="Többletfeszültség és a geosztatikus feszültség 20 %-a a mélység függvényében"', 'aria-label="Additional stress and 20 % of the geostatic stress versus depth"'),
  ],
  'ar-labor': [
    ("m.lec + '. előadás'", "'Lecture ' + m.lec"),
  ],
  'vizsga': [
    ('<span class="lec">${d.i + 1}. kártya a ${CARDS.length}-ből · ${c[0]}. előadás</span>', '<span class="lec">Card ${d.i + 1} of ${CARDS.length} · Lecture ${c[0]}</span>'),
  ],
}
# POST: (részlet → csere) a fordítás után, a kész angol HTML-ben
POST = {
  'helyszinelok': [
    ('${c.st[1]} ${ARROW}</a>', HUNOTE.format('c.st[1]', 'c.st[2]') + ' ${ARROW}</a>'),
    # pontszám: 1 pt / n pts
    ("`${r.p} pts`", "`${r.p} pt${r.p === 1 ? '' : 's'}`"),
    ("`solved · ${p} pts`", "`solved · ${p} pt${p === 1 ? '' : 's'}`"),
    ("`+${st.p1} pts`", "`+${st.p1} pt${st.p1 === 1 ? '' : 's'}`"),
    ("`+${st.p2} pts`", "`+${st.p2} pt${st.p2 === 1 ? '' : 's'}`"),
  ],
  'tippelj': [
    ('aria-label="${i + 1}. kérdés"', 'aria-label="Question ${i + 1}"'),
    ('aria-label="A tipp és a helyes érték a logaritmikus skálán"', 'aria-label="Your guess and the correct value on the logarithmic scale"'),
    ('aria-label="A tipped"', 'aria-label="Your guess"'),
    ('>tipp: ${fmtN(tip)}</text>', '>guess: ${fmtN(tip)}</text>'),
    ('${q.app[0]} ${ARROW}</a>', HUNOTE.format('q.app[0]', 'q.app[1]') + ' ${ARROW}</a>'),
  ],
  'vizsga': [
    ('aria-label="A támfal vázlata"', 'aria-label="Sketch of the retaining wall"'),
  ],
  'telek': [
    ("`+${x.pts} pts`", "`+${x.pts} pt${x.pts === 1 ? '' : 's'}`"),
    ('rel="noopener">${t} ${ARROW}</a>', 'rel="noopener">' + HUNOTE.format('t', 'u') + ' ${ARROW}</a>'),
  ],
  'ar-labor': [
    ("$('#lbl').checked ? '-feliratok' : ''", "$('#lbl').checked ? '-feliratok-en' : ''"),   # angol feliratos modellek (models/*-feliratok-en.glb/.usdz)
    ("ln.innerHTML = m.link[0] + ' ' + ARROW;", "ln.innerHTML = m.link[0] + (/\\/en$/.test(m.link[1]) ? '' : ' (in Hungarian)') + ' ' + ARROW;"),
  ],
}

def rep(t, a, b, what):
    n = t.count(a)
    if n != 1: sys.exit(f'{what}: a(z) {a[:60]!r} {n}× fordul elő (1 kellene) – a magyar forrás változott?')
    return t.replace(a, b)

def pre():
    d = os.path.join(I18N, '.pre'); shutil.rmtree(d, ignore_errors=True)
    for a in APPS:
        t = open(os.path.join(REPO, a, 'index.html'), encoding='utf-8').read()
        for x, y in PRE[a]: t = rep(t, x, y, f'PRE {a}')
        os.makedirs(os.path.join(d, a)); open(os.path.join(d, a, 'index.html'), 'w', encoding='utf-8').write(t)
    return d

SCRIPT = re.compile(r'(<script(?: type="module")?>)(.*?)(</script>)', re.S)
def numfix_html(t, tmp):
    # 1. inline szkriptek: acornnal, csak a karakterlánc-literálokban és sablonrészekben
    parts = []; out = []; last = 0
    for k, m in enumerate(SCRIPT.finditer(t)):
        p = os.path.join(tmp, f's{k}.js'); open(p, 'w', encoding='utf-8').write(m.group(2)); parts.append((m, p))
    for mod in (False, True):   # a modulszkriptek (telek: three.js) modulként elemezve
        ps = [p for m, p in parts if ('module' in m.group(1)) == mod]
        if not ps: continue
        r = subprocess.run(['node', os.path.join(I18N, 'numfix_js.mjs'), *ps], capture_output=True, text=True, env={**os.environ, **({'MODULE': '1'} if mod else {})})
        if r.returncode: sys.exit(r.stderr)
    for m, p in parts:
        js = open(p, encoding='utf-8').read()
        js = re.sub(r'\btg(?=[  ][δφ$\d(]|²)', 'tan', js); js = re.sub(r'\bctg(?=[  ][δφ$\d(]|²)', 'cot', js)
        out.append(t[last:m.start(2)]); out.append(js); last = m.end(2)
    out.append(t[last:]); t = ''.join(out)
    # 2. HTML-szöveg (a szkripteken és stílusokon kívül): címkék közötti szövegben 0,5 → 0.5
    seg = re.split(r'(<script\b.*?</script>|<style\b.*?</style>)', t, flags=re.S)
    for i in range(0, len(seg), 2): seg[i] = re.sub(r'>([^<]*)<', lambda m: '>' + re.sub(r'(?<=\d),(?=\d)', '.', m.group(1)) + '<', seg[i])
    return ''.join(seg)

def post(a, t, tmp):
    t = rep(t, '<html lang="hu">', '<html lang="en-GB">', a)
    t = rep(t, 'require: { "hu": "FORCEHYPHENOPOLY" }', 'require: { "en-gb": "FORCEHYPHENOPOLY" }', a)
    t = re.sub(r"<script>/\*nyelv\*/.*?</script>\n", '', t, count=1)
    t = rep(t, 'id="langSw" href="en" hreflang="en" lang="en"', 'id="langSw" href="./" hreflang="hu" lang="hu"', a)
    for x, y in POST[a]: t = rep(t, x, y, f'POST {a}')
    for s in EN_SITES: t = t.replace(f"'{s}'", f"'{s}/en'")
    t = numfix_html(t, tmp)
    return t

def catalog():
    # munkalap: a fordítandó egységek (magyar + a „maybe” osztályú, szövegnek látszó egységek) → sub_i18n/ws_<app>.tsv
    d = pre()
    for a in APPS:
        r = subprocess.run(['node', os.path.join(I18N, 'worksheet.mjs'), d, f'{a}/index.html'], capture_output=True, text=True)
        if r.returncode: sys.exit(r.stderr)
        open(os.path.join(I18N, f'ws_{a}.tsv'), 'w', encoding='utf-8').write(r.stdout); print(a, r.stdout.count('\n'), 'egység')

if __name__ == '__main__':
    if sys.argv[1:2] == ['catalog']: catalog(); sys.exit(0)
    d = pre(); en = os.path.join(I18N, '.en'); shutil.rmtree(en, ignore_errors=True)
    tsv = ','.join(sorted(glob.glob(os.path.join(I18N, 'en_*.tsv'))))
    r = subprocess.run(['node', os.path.join(I18N, 'apply.mjs'), d, en, tsv, *[f'{a}/index.html' for a in APPS]], capture_output=True, text=True,
                       env={**os.environ, 'STRICT': '1', 'NUMFIX': '1'})
    print(r.stdout.strip())
    if r.returncode: print(r.stderr[-2000:]); sys.exit('Az angol változat nem készült el (a hiányzók: _src/sub_i18n/missing.tsv).')
    if os.path.exists(os.path.join(I18N, 'missing.tsv')): os.remove(os.path.join(I18N, 'missing.tsv'))
    tmp = os.path.join(I18N, '.tmp'); shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    for a in APPS:
        t = post(a, open(os.path.join(en, a, 'index.html'), encoding='utf-8').read(), tmp)
        open(os.path.join(REPO, a, 'en.html'), 'w', encoding='utf-8').write(t); print(f'{a}/en.html', len(t) // 1024, 'KB')
    shutil.rmtree(tmp, ignore_errors=True)
