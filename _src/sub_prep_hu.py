# Az átfogó extrák (helyszinelok, tippelj, vizsga, telek, ar-labor) magyar forrásának előkészítése az angol változathoz:
# EN jelző, nyelvfüggő tizedesjel, a sortörés-őr angol szabályai, en-gb elválasztás, HU | EN nyelvváltó, hreflang, átirányítás.
# A magyar oldal szövege és működése nem változik. Idempotens: a már előkészített fájlt kihagyja. Ha valamelyik index.html-t
# egy külső forrásból újragenerálják, ezzel lehet az angol változathoz szükséges kapcsokat visszatenni (utána: python3 build_sub.py).
# Használat: cd _src && python3 sub_prep_hu.py
import sys, re
import os
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://bme-alapozas.vercel.app'
PILL = '<a class="langbtn" id="langSw" href="en" hreflang="en" lang="en" aria-label="English version"><b>HU</b><span>EN</span></a>'
CSS = """
/* nyelvváltó (HU | EN): a kitöltött az aktuális nyelv; mobilon csak a másik nyelv kódja */
.langbtn{flex:none; display:inline-flex; align-items:center; gap:2px; padding:3px; border:1px solid rgba(255,255,255,.22); border-radius:999px; text-decoration:none; color:inherit; font:500 12px/1 var(--fm); letter-spacing:.04em}
.langbtn b, .langbtn span{display:inline-grid; place-items:center; min-width:30px; padding:5px 8px; border-radius:999px}
.langbtn b{background:#eef1f4; color:#141a20; font-weight:600}
.langbtn span{opacity:.75}
.langbtn:hover span{opacity:1; background:rgba(255,255,255,.12)}
@media (max-width: 560px){ .langbtn b{display:none} .langbtn span{min-width:0; padding:6px 9px; opacity:1} }
"""
LANGJS = """
/* nyelvváltó: a választás megmarad (alap-lang), a másik nyelvű oldal ugyanott nyílik meg (alap-pos) */
(() => {
  const sw = $('#langSw'), KEY = 'alap-pos'; const hh = () => { const t = $('.top'); return t ? t.offsetHeight : 0; };
  if (sw) sw.addEventListener('click', () => {
    try { localStorage.setItem('alap-lang', EN ? 'hu' : 'en'); } catch (e) {}
    const H0 = hh(); let best = null; document.querySelectorAll('main [id]').forEach((n) => { if (n.closest('svg')) return; const r = n.getBoundingClientRect(); if (r.height && r.top <= H0 + 1 && r.bottom > H0) best = n; });
    try { sessionStorage.setItem(KEY, JSON.stringify({ id: best ? best.id : '', off: best ? H0 - best.getBoundingClientRect().top : 0, y: scrollY, t: Date.now() })); } catch (e) {}
    sw.setAttribute('href', (EN ? './' : 'en') + (location.hash || ''));
  });
  let p = null; try { p = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch (e) {}
  if (p && Date.now() - p.t < 20000) { if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const go = () => { const n = p.id && document.getElementById(p.id); const y = n ? n.getBoundingClientRect().top + scrollY - hh() + p.off : p.y; scrollTo({ top: Math.max(0, y), behavior: 'instant' }); };
    requestAnimationFrame(go); addEventListener('load', () => { go(); setTimeout(go, 600); }, { once: true }); }
})();
"""
NUMW_HU = r"""const NUMW = /(^|[\s(\u00A0\u2060„])((?:[Kk]ét"""
NUMW_EN = r"""const NUMW = EN ? /(^|[\s(\u00A0\u2060“])((?:[Tt]wo|[Tt]hree|[Ff]our|[Ff]ive|[Ss]ix|[Ss]even|[Ee]ight|[Nn]ine|[Tt]en|[Ff]ourteen|[Ff]irst|[Ss]econd|[Tt]hird|[Ff]ourth|[Bb]oth|[Aa]ll|[Ss]everal|[Aa] few))(?=\s\S)\s/g : /(^|[\s(\u00A0\u2060„])((?:[Kk]ét"""
ABBR_HU = r"""(pl\.|kb\.|ill\.|ún\.|max\.|min\.|Dr\.) (?=\S)"""
ABBR_EN = r"""(pl\.|kb\.|ill\.|ún\.|max\.|min\.|Dr\.|e\.g\.|i\.e\.|approx\.|cf\.|No\.) (?=\S)"""
ART_HU = r"""for (let i = 0; i < 2; i++) s = s.replace(/(^|[\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\S)/g, '$1$2' + NB);"""
ART_EN = r"""for (let i = 0; i < 2; i++) s = s.replace(EN ? /(^|[\s(\u00A0\u2060“‘])(a|an|the|A|An|The|&) (?=\S)/g : /(^|[\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\S)/g, '$1$2' + NB);"""
SH_HU = r"""const SHORTEND = new RegExp('(^|[\\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És|pl\\.|kb\\.|ill\\.|ún\\.|\\d+(?:[,.]\\d+)?\\.?%?) $');"""
SH_EN = r"""const SHORTEND = EN ? new RegExp('(^|[\\s(\u00A0\u2060“‘])(a|an|the|A|An|The|e\\.g\\.|i\\.e\\.|approx\\.|\\d+(?:[,.]\\d+)?\\.?%?) $') : new RegExp('(^|[\\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És|pl\\.|kb\\.|ill\\.|ún\\.|\\d+(?:[,.]\\d+)?\\.?%?) $');"""
HY_HU = "const H = window.Hyphenopoly; if (H && H.hyphenators && H.hyphenators.hu) H.hyphenators.hu.then("
HY_EN = "const H = window.Hyphenopoly, HK = EN ? 'en-gb' : 'hu'; if (H && H.hyphenators && H.hyphenators[HK]) H.hyphenators[HK].then("
# telek: keskeny kijelzőn a nyelvváltóval együtt is kiférjen a fejléc (a logó elmarad, kisebb közök)
TELEK_CSS = '@media (max-width: 420px){ .top .wrap{gap:10px} .score{gap:8px} .top .brand svg{display:none} }\n'
# a fejlécben a nyelvváltó helye (utána kerül) és a mobil kiegészítés
ANCHOR = {
  'tippelj': '<button class="modebtn" type="button" id="modeBtn" aria-pressed="false">Kivetítő mód</button>',
  'helyszinelok': None,   # a .rankmini </div>-ja után
  'vizsga': '<a href="#pakli">Igaz vagy hamis</a></nav>',
  'telek': '<span><b id="sPts">0</b> pont</span></div>',
  'ar-labor': '<span class="tag">kiterjesztett valóság</span>',
}
# az EN jelző helye (utána kerül) – alapból a szkript eleje
EN_AT = {
  'telek': "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';\n",
  'ar-labor': "<script>\n(() => {\n",
}
DEC = {
  'tippelj': ("return f ? ii + ',' + f : ii; };", "return f ? ii + (EN ? '.' : ',') + f : ii; };"),
  'vizsga': ("return fr ? ii + ',' + fr : ii; };", "return fr ? ii + (EN ? '.' : ',') + fr : ii; };"),
  'telek': (".toFixed(d).replace('.', ',').replace('-', '−');", ".toFixed(d).replace('.', EN ? '.' : ',').replace('-', '−');"),
}

def rep(t, a, b, n=1):
    c = t.count(a); assert c == n, (a[:70], c); return t.replace(a, b)

for app in ['helyszinelok', 'tippelj', 'vizsga', 'telek', 'ar-labor']:
    p = f'{REPO}/{app}/index.html'; t = open(p, encoding='utf-8').read()
    if 'id="langSw"' in t: print(app, 'már előkészítve'); continue
    # fej: hreflang + átirányítás (ha legutóbb az angolt választották; /?hu kikerüli)
    m = re.search(r'<meta name="description" content="[^"]*">\n', t); assert m
    head = (f'<link rel="alternate" hreflang="hu" href="{SITE}/{app}">\n<link rel="alternate" hreflang="en" href="{SITE}/{app}/en">\n'
            f'<link rel="alternate" hreflang="x-default" href="{SITE}/{app}">\n'
            "<script>/*nyelv*/try{if(localStorage.getItem('alap-lang')==='en'&&!/[?&]hu\\b/.test(location.search))location.replace('en'+location.hash)}catch(e){}</script>\n")
    t = t[:m.end()] + head + t[m.end():]
    # nyelvváltó a fejlécben + stílus
    if ANCHOR[app]: t = rep(t, ANCHOR[app], ANCHOR[app] + '\n    ' + PILL)
    else:
        m = re.search(r'<div class="rankmini"[^\n]*</div>\n', t); assert m; t = t[:m.end()] + '    ' + PILL + '\n' + t[m.end():]
    css = CSS + ('@media (max-width: 560px){ .top .langbtn{margin-left:auto} }\n' if app == 'vizsga' else '.kick .langbtn{margin-left:auto; text-transform:none}\n' if app == 'ar-labor' else TELEK_CSS if app == 'telek' else '')
    i = t.index('</style>\n<script src="vendor/hyphenopoly'); t = t[:i] + css + t[i:]
    # EN jelző a szkript elején
    at = EN_AT.get(app, "(() => {\n'use strict';\n")
    t = rep(t, at, at + "const EN = (document.documentElement.lang || '').toLowerCase().startsWith('en');\n")
    if app in DEC: t = rep(t, *DEC[app])
    # sortörés-őr: angol szabályok
    t = rep(t, NUMW_HU, NUMW_EN); t = rep(t, ABBR_HU, ABBR_EN); t = rep(t, ART_HU, ART_EN); t = rep(t, SH_HU, SH_EN); t = rep(t, HY_HU, HY_EN)
    # nyelvváltó szkript a GUARD elé
    t = rep(t, '\nconst GUARD = (() => {', LANGJS + '\nconst GUARD = (() => {')
    # a gondolatjel nem kezdhet sort (mindkét nyelven)
    a = "    s = s.replace(/([^\\s\\u2060])–([^\\s\\u2060])/g, '$1' + WJ + '–' + WJ + '$2');\n"
    t = rep(t, a, a + "    s = s.replace(/(\\S) ([–—]) /g, '$1' + NB + '$2 ');   // a gondolatjel nem kezdhet sort\n")
    open(p, 'w', encoding='utf-8').write(t); print(app, 'kész', len(t))
