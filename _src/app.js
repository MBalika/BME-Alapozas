(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = 'http://www.w3.org/2000/svg';
const h = (tag, a = {}, p = null) => { const e = document.createElementNS(NS, tag); for (const k in a) { if (k === 'text') e.textContent = a[k]; else e.setAttribute(k, a[k]); } if (p) p.appendChild(e); return e; };
const el = (tag, a = {}, p = null, html = null) => { const e = document.createElement(tag); for (const k in a) { if (k === 'cls') e.className = a[k]; else if (k === 'style') e.setAttribute('style', a[k]); else e.setAttribute(k, a[k]); } if (html !== null) e.innerHTML = html; if (p) p.appendChild(e); return e; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const EN = (document.documentElement.lang || '').startsWith('en');   // angol változat (en.html): tizedespont, angol tördelési szabályok
const fmt = (v, d = 1) => v.toFixed(d).replace('.', EN ? '.' : ',').replace('-', '−');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= ADATOK ================= */
const U = (u) => 'https://' + u;
// a tananyag címe: az angol oldalon az angol változaté, ha már van (a.en)
const AU = (a) => U(EN && a.en ? a.en : a.u), AT = (a) => (EN && a.en ? a.en : a.u);
const S = [
  { n: 1, title: 'Bevezetés', rail: 'Bevezetés', q: 'Miért kell érteni a talajhoz?', p: 'A talaj és a szerkezet kölcsönhatása, az alapozás feladata és típusai, a tervezés során igazolandó határállapotok – és az, hogy miért nehezebb jól alapozni, mint bármely más szerkezetet megtervezni.', li: ['a geotechnika alapfogalmai', 'kölcsönhatás: talaj és szerkezet', 'alaptípusok és határállapotok'], apps: [{ here: true }], meta: ['ezen az oldalon', 'bevezető animáció'] },
  { n: 2, title: 'Talajfelderítés', rail: 'Talaj\u00ADfelderítés', q: 'Mi van alattunk?', p: 'A geotechnikai tervezés első és legfontosabb lépése a talajrétegződés és a talajvíz-viszonyok megismerése: adatgyűjtés, fúrások és mintavétel, szondázások és geofizikai mérések, végül a feltárási eredmények összefoglalása és ábrázolása.', li: ['fúrások, mintavétel, szondázások', 'hány feltárás kell, milyen mélyen és milyen sűrűn', 'talajvíz és geotechnikai kategóriák'], apps: [{ t: 'Talajfelderítés', u: 'talajfelderites.vercel.app', en: 'talajfelderites.vercel.app/en', img: 'talajfelderites' }], meta: ['17 animációs videó', '5 × 10 önellenőrző kérdés', '50 igaz/hamis'] },
  { n: 3, title: 'Síkalapok tervezése', rail: 'Síkalapok tervezése', railL: 'Síkalapok tervezése és teherbírás\u00ADszámítása', q: 'Milyen alap kell, és milyen mélyre?', p: 'A síkalap és a mélyalap határától a hét alaptípuson és az alapsík felvételén át a talajtörés mechanizmusáig – majd a teherbírás számítása drénezett és drénezetlen esetben, lépésenként kidolgozott mintapéldákkal.', li: ['sáv-, pillér-, gerenda- és lemezalapok', 'az alapsík felvétele', 'teherbírás: <span class="nw">V<sub>d</sub> ≤ R<sub>d</sub></span>'], apps: [{ t: 'Síkalapok tervezése', u: 'sikalapoktervezese.vercel.app', en: 'sikalapoktervezese.vercel.app/en', img: 'sikalapoktervezese' }, { t: 'Síkalapok teherbírásszámítása', u: 'sikalapok-teherbirasszamitasa.vercel.app', en: 'sikalapok-teherbirasszamitasa.vercel.app/en', img: 'teherbiras', sub: '3b' }], meta: ['3D alaptípus-labor', 'törési mechanizmusok 3D-ben', 'mintapéldák, kalkulátor'] },
  { n: 4, title: 'Síkalapok állékonyság\u00ADvizsgálata', rail: 'Állékonyság', railL: 'Síkalapok állékonyság\u00ADvizsgálata', q: 'Nem csúszik el, nem borul fel?', p: 'Egy alaptest négyféleképpen veszítheti el az állékonyságát: elcsúszik az alapsíkon, felborul, felúszik, vagy a környező talajjal együtt megcsúszik. Mind a négyet külön kell igazolni – szimulátorokkal, mintapéldákkal és kalkulátorral.', li: ['elcsúszás és felborulás', 'felúszás a talajvízben', 'általános állékonyság'], apps: [{ t: 'Síkalapok állékonyságvizsgálata', u: 'sikalapokallekonysagvizsgalata.vercel.app', en: 'sikalapokallekonysagvizsgalata.vercel.app/en', img: 'allekonysag' }], meta: ['4 szimulátor', '9 mintapélda', '5 animációs videó'] },
  { n: 5, title: 'Síkalapok süllyedés\u00ADszámítása', rail: 'Süllyedés', railL: 'Síkalapok süllyedés\u00ADszámítása', q: 'Mennyit és mennyire egyenlőtlenül süllyed?', p: 'Feszültségeloszlás az alap alatt, határmélység, rétegenkénti összenyomódás – majd az, hogy mit tehetünk, ha a számított süllyedés nem engedhető meg: kisebb talpnyomás, mélyebb alapsík, talajjavítás vagy szerkezeti megoldás.', li: ['feszültséghagyma és szuperpozíció', 'süllyedéstűrés és süllyedésmérés', 'védekezés: talajcsere, tömörítés, előterhelés'], apps: [{ t: 'Síkalapok süllyedésszámítása', u: 'sikalapok-sullyedesszamitasa.vercel.app', en: 'sikalapok-sullyedesszamitasa.vercel.app/en', img: 'sullyedes' }, { t: 'Védekezés a káros süllyedések ellen', u: 'vedekezesakarossullyedesekellen.vercel.app', en: 'vedekezesakarossullyedesekellen.vercel.app/en', img: 'vedekezes', sub: '5b' }], meta: ['mintapéldák, kalkulátor', '3D süllyedés-szimulátor', 'BME-felvételek'] },
  { n: 6, title: 'Alapozás kedvezőtlen altalajon', rail: 'Kedvezőtlen talaj', railL: 'Alapozás kedvezőtlen talajon', q: 'Mi van, ha a talaj a legnagyobb ellenfél?', p: 'Négy talaj, amelyre nem lehet „csak úgy” alapozni: a duzzadó-zsugorodó agyag, a vízzel összeroskadó lösz, a feltöltés és az összenyomódó szerves talaj. Hogyan ismerjük fel őket, és hogyan alapozzunk rajtuk?', li: ['térfogatváltozó és roskadékony talajok', 'feltöltések', 'szerves talajok, tőzeg'], apps: [{ t: 'Alapozás kedvezőtlen altalajon', u: 'kedvezotlen-altalaj.vercel.app', en: 'kedvezotlen-altalaj.vercel.app/en', img: 'kedvezotlen' }], meta: ['4 animációs videó', '4 × 3D szimulátor', 'talajdetektív'] },
  { n: 7, title: 'Síkalapokat érő hatások', rail: 'Külső hatások', railL: 'Síkalapokat érő külső hatások', q: 'Mi éri még az alapot?', p: 'A statikus teher okozta süllyedést ki tudjuk számítani – de rezeghet alatta a talaj, megmozdulhat a föld, üreg nyílhat alatta, kimoshatja a víz, vagy felemelheti a fagy. Ezeket nem kiszámítani, hanem felismerni és megelőzni kell.', li: ['dinamikus hatások, földrengés', 'földalatti üregek, kimosás', 'fagyhatás'], apps: [{ t: 'Síkalapokat érő hatások', u: 'sikalapokaterohatasok.vercel.app', en: 'sikalapokaterohatasok.vercel.app/en', img: 'hatasok' }], meta: ['6 animációs videó', '20 valós eset', 'hatásdetektív'] },
  { n: 8, title: 'Mélyalapozások', rail: 'Mély\u00ADalapozás', q: 'Mikor nem elég a síkalap?', p: 'Ha a teherbíró réteg mélyen van, ha a süllyedést korlátozni kell, vagy ha a víz kimoshatja az alapot, a terhet mélyebbre visszük: cölöpökkel, résfalakkal, kút- és szekrényalapokkal. A cölöp a terhet a talpán és a palástján adja át.', li: ['cölöpözési technológiák', 'résfal, mikrocölöp, jet grouting, mélykeverés', 'kút-, szekrény- és keszonalapozás'], apps: [{ t: 'Mélyalapozások', u: 'melyalapozasok.vercel.app', en: 'melyalapozasok.vercel.app/en', img: 'melyalapozasok' }], meta: ['3D cölöpépítő', '13 BME-felvétel', 'magyarázó animációk'] },
  { n: 9, title: 'Munkatér\u00ADhatárolások', rail: 'Munkatér\u00ADhatárolás', q: 'Hogyan jutunk le biztonságosan?', p: 'Minden pince, mélygarázs és közműárok úgy kezdődik, hogy a talajt ki kell emelni – és a gödör falát meg kell tartani. A dúcolástól a szádfalon, a résfalon és a talajhorgonyon át a fagyasztott falig.', li: ['dúcolások, szádfalak, cölöpfalak', 'talajszegezés, talajhorgonyok', 'támaszfödém, víz alatti alaplemez'], apps: [{ t: 'Munkatérhatárolások', u: 'munkaterhatarolasok.vercel.app', en: 'munkaterhatarolasok.vercel.app/en', img: 'munkater' }], meta: ['13 animációs videó', '3D gödörtervező', '100+ kérdés és állítás'] },
];
const cv = (n) => `var(--c${n})`;
const arrow = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 11l6-6M6 5h5v5"/></svg>';

/* ================= TÉMA, MENÜ ================= */
const toggleTheme = () => {
  const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark'; try { localStorage.setItem('alap-theme', r.dataset.theme); } catch (e) {}
};
$('#themeBtn').addEventListener('click', toggleTheme);
{ const d = $('#drawer'), b = $('#menuBtn');
  const items = [['#top', 'Bevezetés'], ['#utvonal', 'A tárgy útja'], ['#temakorok', 'Minden tananyag'], ['#video', 'Bevezető videó']];
  items.forEach(([hh, t]) => el('a', { href: hh }, d, `<i style="background:#2b3440">→</i>${t}`));
  el('a', { cls: 'd-ar', href: U('bme-alapozas.vercel.app/ar-labor/'), target: '_blank', rel: 'noopener' }, d, `<i>AR</i>Alapozás AR labor ↗`);
  S.forEach(s => { const a = s.apps.find(x => !x.here); el('a', { href: a ? AU(a) : '#bevezetes', ...(a ? { target: '_blank', rel: 'noopener' } : {}) }, d, `<i style="background:${cv(s.n)}">${s.n}</i>${s.title}${a ? ' ↗' : ''}`); });
  [['telek', 'Egy telek, egy félév'], ['helyszinelok', 'Geotechnikai helyszínelők'], ['tippelj', 'Tippelj, aztán számolj']].forEach(([u, t]) => el('a', { href: U('bme-alapozas.vercel.app/' + u + '/'), target: '_blank', rel: 'noopener' }, d, `<i style="background:var(--accent);color:#1b1206">★</i>${t} ↗`));
  el('button', { cls: 'd-theme', type: 'button' }, d, '<i>◐</i>Világos vagy sötét téma').addEventListener('click', toggleTheme);
  b.addEventListener('click', () => { const o = d.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  d.addEventListener('click', (e) => { if (e.target.closest('a')) { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } }); }
// aktív menüpont
{ const pairs = $$('.nav a').filter(a => a.getAttribute('href').startsWith('#')).map(a => [a, a.getAttribute('href') === '#top' ? $('.hero') : $(a.getAttribute('href'))]).filter(p => p[1]);
  const io = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) pairs.forEach(([a, sec]) => a.classList.toggle('on', sec === e.target)); }); }, { rootMargin: '-45% 0px -50% 0px' });
  pairs.forEach(p => io.observe(p[1])); }

/* ================= NYELVVÁLTÓ (HU | EN) ================= */
// a választás megmarad (localStorage), és a másik nyelvű oldal ugyanott nyílik meg: a fejléc alatti legmélyebb azonosítós elem + eltolás
{ const sw = $('#langSw'), KEY = 'alap-pos', hh = () => $('.top').offsetHeight;
  if (sw) sw.addEventListener('click', () => {
    try { localStorage.setItem('alap-lang', EN ? 'hu' : 'en'); } catch (e) {}
    const H = hh(); let best = null; $$('main [id]').forEach(n => { if (n.closest('svg')) return; const r = n.getBoundingClientRect(); if (r.height && r.top <= H + 1 && r.bottom > H) best = n; });
    try { sessionStorage.setItem(KEY, JSON.stringify({ id: best ? best.id : '', off: best ? H - best.getBoundingClientRect().top : 0, y: scrollY, t: Date.now() })); } catch (e) {}
    sw.setAttribute('href', (EN ? './' : 'en') + (best ? '#' + best.id : ''));
  });
  let p = null; try { p = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch (e) {}
  if (p && Date.now() - p.t < 20000) { if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const go = () => { const n = p.id && document.getElementById(p.id); const y = n ? n.getBoundingClientRect().top + scrollY - hh() + p.off : p.y; scrollTo({ top: Math.max(0, y), behavior: 'instant' }); };
    requestAnimationFrame(go); addEventListener('load', () => { go(); setTimeout(go, 500); }, { once: true }); } }

/* ================= ÚTVONALTÉRKÉP ================= */
{ const rail = $('#rail');
  S.forEach(s => { const a = el('a', { cls: 'stn' + (s.n === 1 ? ' here' : ''), href: '#st' + s.n, style: `--c:${cv(s.n)}` }, rail);
    el('span', { cls: 'dot' }, a, String(s.n)); el('b', {}, a, s.railL || s.rail); el('small', {}, a, s.n === 1 ? 'itt vagy most' : (s.apps.filter(x => !x.here).length > 1 ? s.apps.filter(x => !x.here).length + ' tananyag' : 'tananyag ↗')); }); }

/* ================= 1 · KŐZETBŐL TALAJ ================= */
{ const svg = $('#rkSvg'), cap = $('#rkCap'), seg = $('#rkSeg'), play = $('#rkPlay');
  const T = {
    1: ['Szilárd kőzet', 'A kiindulás a szilárd kőzet: nagy a szilárdsága, és terhelés hatására alig nyomódik össze. Ahol a kőzet a felszín közelében van, ott az alapozás tervezésében a kőzetmechanika kerül előtérbe.'],
    2: ['Aprózódás és mállás', 'A felszínre került kőzetet az időjárás lassan szétbontja. Az aprózódás (fagy, hőingás) mechanikusan darabolja: repedések nyílnak, tömbök válnak le. A mállás (víz, kémiai hatások) az ásványi összetételét is átalakítja, és egyre finomabb szemcsék keletkeznek.'],
    3: ['Szállítás és lerakódás', 'A szemcséket a víz, a szél és a gravitáció elszállítja, majd a medencékben rétegről rétegre lerakja. Ahol a víz lelassul, előbb a durva szemcsék ülepednek le, a csendes vízben pedig a finomak: kavics, homok, iszap, agyag. Magyarország síkvidékein is ilyen, víz és szél által lerakott laza üledékek borítják a felszínt.'],
    4: ['Laza üledék: a talaj', 'A lerakódott laza üledék a talaj. Maga is kőzet – üledékes kőzet –, de a szemcséi nincsenek szilárdan összecementálva, a hézagokat víz és levegő tölti ki. Ezért kisebb a teherbírása és nagyobb az alakváltozása, mint a szilárd kőzeté. Ami rá épül, az süllyed: az alapozás feladata, hogy ez biztonságos és károsodásmentes legyen.'] };
  let cur = 1, tm = null;
  const set = (k) => { cur = k; svg.querySelectorAll('[data-s]').forEach(g => g.classList.toggle('vis', g.dataset.s.includes(String(k))));
    seg.querySelectorAll('button').forEach(b => { const on = +b.dataset.v === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    cap.innerHTML = `<div class="kick">${k}. lépés</div><h4>${T[k][0]}</h4><p>${T[k][1]}</p>`; };
  const stop = () => { clearInterval(tm); tm = null; play.textContent = '▶ végigjátszás'; };
  seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { stop(); set(+b.dataset.v); }));
  play.addEventListener('click', () => { if (tm) return stop(); set(1); play.textContent = '■ megállítás'; tm = setInterval(() => { if (cur >= 4) return stop(); set(cur + 1); }, 4500); });
  if (!reduce) { const g = $('#rkGr'), NS = 'http://www.w3.org/2000/svg', P0 = 'M140 84L166 116L192 150L214 182L234 206';
    [[4.2, '#a99a83', P0 + 'L250 214L262 262', 2.6], [2.8, '#dcc28a', P0 + 'L292 218L318 252', 3.2], [1.9, '#b79f7c', P0 + 'L360 220L420 238', 3.8]].forEach(([r, c, d, dur], i) => {
      for (let j = 0; j < 3; j++) { const ci = document.createElementNS(NS, 'circle'); ci.setAttribute('r', r); ci.setAttribute('fill', c);
        const am = document.createElementNS(NS, 'animateMotion'); am.setAttribute('path', d); am.setAttribute('dur', dur + 's'); am.setAttribute('repeatCount', 'indefinite'); am.setAttribute('begin', (-(j * dur / 3 + i * 0.37)).toFixed(2) + 's');
        ci.appendChild(am); g.appendChild(ci); } }); }
  set(1); }

/* ================= 1 · KÖLCSÖNHATÁS-LABOR ================= */
// Vasbeton lemezalap rugalmas talajon: a lemez be tud hajlani, de a merevsége miatt simán görbül. A talaj süllyedése
// s(x) = Σ Δσz(x, z) · Δz / E(x, z) (Steinbrenner/Newmark-szuperpozíció, 12 m összenyomható réteg, alaprajz 14 × 12 m),
// a lemez rugalmas gerenda; a kettő együttdolgozása adja a talpfeszültség eloszlását. Szögtorzulás: szomszédos falak/pillérek
// (3,5 m) között, a dőlés levonásával.
{ const svg = $('#kshSvg'), N = $('#kshN'); let soil = 0;
  const W = 560, GY = 150, CX = 280, PX = 220 / 14, BX0 = CX - 7 * PX, BX1 = CX + 7 * PX;
  const LB = 14, BB = 12, HC = 12, DZ = 0.25, SP = 3.5, PTS = [-7, -3.5, 0, 3.5, 7];
  const LENS = { x: 3.5, z: 3.8, rx: 3.0, rz: 1.5, E: 6 };
  const Ic = (a, b, z) => { if (a <= 0 || b <= 0) return 0; const m = a / z, n = b / z, m2 = m * m, n2 = n * n, V = m2 + n2 + 1, Vr = Math.sqrt(V); let at = Math.atan2(2 * m * n * Vr, V - m2 * n2); if (at < 0) at += Math.PI; return (2 * m * n * Vr / (V + m2 * n2) * (V + 1) / V + at) / (4 * Math.PI); };
  const g = (a, b, z) => Math.sign(a) * Math.sign(b) * Ic(Math.abs(a), Math.abs(b), z);
  const sig = (x, z) => g(LB / 2 - x, BB / 2, z) - g(-LB / 2 - x, BB / 2, z) - g(LB / 2 - x, -BB / 2, z) + g(-LB / 2 - x, -BB / 2, z);
  // talaj–lemez kölcsönhatás: a vasbeton lemez (50 cm, EI ≈ 3,75·10⁶ kNm²) rugalmas gerendaként hajlik, a talpfeszültség
  // q(x) a lemez merevsége és a talaj (Steinbrenner-hajlékonysági mátrix) együttdolgozásából adódik
  const HN = 0.5, EI = 3.75e6, NX = []; for (let x = -7; x <= 7.001; x += HN) NX.push(+x.toFixed(2)); const NM = NX.length;
  const PAN = NX.map((x, j) => [j === 0 ? x : x - HN / 2, j === NM - 1 ? x : x + HN / 2]), AR = PAN.map(([a, b]) => (b - a) * BB);
  const sigR = (x, x1, x2, z) => g(x2 - x, BB / 2, z) - g(x1 - x, BB / 2, z) - g(x2 - x, -BB / 2, z) + g(x1 - x, -BB / 2, z);
  const XS = [], ZS = []; for (let x = -18; x <= 18.001; x += 0.5) XS.push(+x.toFixed(2)); for (let z = DZ / 2; z < HC; z += DZ) ZS.push(z);
  const NI = NX.map(x => Math.round((x + 18) / 0.5));       // a lemez csomópontjai az XS-rácson
  let SIGP = null; const prep = () => { SIGP = XS.map(x => PAN.map(([a, b]) => Float32Array.from(ZS, z => sigR(x, a, b, z)))); };
  const solve = (A, bv) => { const n = bv.length, M = A.map((r, i) => [...r, bv[i]]); for (let c = 0; c < n; c++) { let pv = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[pv][c])) pv = r; [M[c], M[pv]] = [M[pv], M[c]]; for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let q = c; q <= n; q++) M[r][q] -= f * M[c][q]; } } const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let t = M[i][n]; for (let q = i + 1; q < n; q++) t -= M[i][q] * x[q]; x[i] = t / M[i][i]; } return x; };
  // gerenda-merevségi mátrix (Hermite-elemek), a forgások kondenzálásával csak a süllyedésekre
  const KC = (() => { const N = 2 * NM, K = Array.from({ length: N }, () => Array(N).fill(0)), c = EI / HN ** 3, h2 = HN * HN;
    const ke = [[12, 6 * HN, -12, 6 * HN], [6 * HN, 4 * h2, -6 * HN, 2 * h2], [-12, -6 * HN, 12, -6 * HN], [6 * HN, 2 * h2, -6 * HN, 4 * h2]];
    for (let e = 0; e < NM - 1; e++) { const d = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3]; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) K[d[i]][d[j]] += c * ke[i][j]; }
    const W = [...Array(NM).keys()].map(i => 2 * i), T = W.map(i => i + 1), pick = (R, C) => R.map(i => C.map(j => K[i][j]));
    const Kww = pick(W, W), Kwt = pick(W, T), Ktt = pick(T, T), Ktw = pick(T, W);
    const X = Ktw[0].map((_, j) => solve(Ktt, Ktw.map(r => r[j])));            // Ktt⁻¹·Ktw oszloponként
    return Kww.map((r, i) => r.map((v, j) => v - Kwt[i].reduce((t, a, k) => t + a * X[j][k], 0)));
  })();
  const Emod = (x, z) => { if (soil === 1) return 10; if (soil === 2) { const u = (x - LENS.x) / LENS.rx, v = (z - LENS.z) / LENS.rz; if (u * u + v * v <= 1) return LENS.E; } return 60; };
  const profile = (p) => { if (!SIGP) prep();
    const F = XS.map((x, i) => PAN.map((_, j) => { let t = 0; const sg = SIGP[i][j]; for (let k = 0; k < ZS.length; k++) t += sg[k] * DZ / (Emod(x, ZS[k]) * 1000); return t; }));   // m/kPa
    const Fr = NI.map(i => F[i]); const M = KC.map((r, i) => Fr[0].map((_, j) => r.reduce((t, v, k) => t + v * Fr[k][j], 0) + (i === j ? AR[i] : 0)));
    const q = solve(M, AR.map(a => a * p));
    return F.map(r => r.reduce((t, v, j) => t + v * q[j], 0) * 1000); };   // [mm]
  const sAt = (prof, x) => { const t = (x + 18) / 0.5, i = Math.max(0, Math.min(XS.length - 2, Math.floor(t))); return lerp(prof[i], prof[i + 1], clamp(t - i)); };
  // izobárok (σz/p) – nem függnek a tehertől és a talajtól
  const ISO = [0.8, 0.5].map(r => { const L = [], R = []; for (let z = 0.2; z <= 11.6; z += 0.2) { if (sig(0, z) < r) break; let a = 0, b = 18; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (sig(m, z) > r) a = m; else b = m; } R.push([a, z]); L.unshift([-a, z]); } return { r, pts: L.concat(R) }; });
  const fmtB = (b) => b < 1 / 5000 ? '≈ 0' : '1/' + Math.round(1 / b);
  function draw() {
    const n = +N.value; $('#kshNo').textContent = n + (EN ? (n === 1 ? ' storey' : ' storeys') : ' szint');
    const p = 10 + 12 * n;                                       // talpfeszültség [kPa]
    const prof = profile(p);
    const sp = PTS.map(x => sAt(prof, x));
    const raft = []; for (let x = -7; x <= 7.001; x += 0.5) raft.push(sAt(prof, x));
    const sAvg = raft.reduce((a, b) => a + b, 0) / raft.length, sMax = Math.max(...raft), sMin = Math.min(...raft), dS = sMax - sMin;
    const om = (sp[4] - sp[0]) / (LB * 1000);                   // az egész épület dőlése
    let beta = 0, bi = 0; const bet = []; for (let i = 0; i < 4; i++) { const b = Math.abs((sp[i + 1] - sp[i]) / (SP * 1000) - om); bet.push(b); if (b > beta) { beta = b; bi = i; } }
    const k = Math.min(0.3, 36 / Math.max(sMax, 1));             // torzítás [px/mm] – mérsékelt, hogy a lemez alakja ne legyen eltúlozva
    const X = (m) => CX + m * PX, M = (px) => (px - CX) / PX, Y = (px) => GY + k * sAt(prof, M(px));
    svg.innerHTML = '';
    const defs = h('defs', {}, svg); const pat = h('pattern', { id: 'kshDots', width: 9, height: 9, patternUnits: 'userSpaceOnUse' }, defs); h('circle', { cx: 2, cy: 2, r: 1.1, fill: 'rgba(60,40,20,.35)' }, pat);
    const pat2 = h('pattern', { id: 'kshLen', width: 12, height: 6, patternUnits: 'userSpaceOnUse' }, defs); h('path', { d: 'M0 3 q3 -3 6 0 t6 0', stroke: 'rgba(240,210,160,.55)', fill: 'none', 'stroke-width': 1.3 }, pat2);
    const sky = h('linearGradient', { id: 'kshSky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); h('stop', { offset: 0, 'stop-color': '#b5d3ec' }, sky); h('stop', { offset: .45, 'stop-color': '#e6eef1' }, sky); h('stop', { offset: 1, 'stop-color': '#eef3f0' }, sky);
    const lg = (id, st, a) => { const g = h('linearGradient', { id, ...a }, defs); st.forEach(([o, c, op = 1]) => h('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, g)); };
    lg('kshGD', [[0, '#000', .22], [.12, '#000', 0], [1, '#000', .3]], { x1: 0, y1: GY, x2: 0, y2: 330, gradientUnits: 'userSpaceOnUse' }); lg('kshGB', [[0, '#f8f1e0'], [.7, '#efe6d2'], [1, '#d6ccb5']], { x1: 0, y1: 0, x2: 1, y2: 0 }); lg('kshGG', [[0, '#9dbfd9'], [1, '#48637b']], { x1: 0, y1: 0, x2: 0, y2: 1 }); lg('kshGC', [[0, '#d9d4ca'], [1, '#a9a397']], { x1: 0, y1: 0, x2: 0, y2: 1 });
    const cp = h('clipPath', { id: 'kshClip' }, defs);
    h('rect', { x: 0, y: 0, width: W, height: 330, fill: 'url(#kshSky)' }, svg);
    for (const [x, y] of [[44, 36], [470, 52]]) h('path', { d: `M${x} ${y}c2-9 15-11 20-4 6-5 17-1 16 7 7 1 7 10 0 10h-36c-8 0-8-12 0-13z`, fill: '#fff', opacity: .8 }, svg);
    for (const [x, r] of [[40, 11], [66, 8], [498, 12], [528, 8]]) { const yb = Y(x); h('rect', { x: x - 1.5, y: yb - r - 8, width: 3, height: r + 8, fill: '#6b5136' }, svg); h('circle', { cx: x, cy: yb - r - 12, r, fill: '#5f8f45' }, svg); h('circle', { cx: x - r * .3, cy: yb - r - 15, r: r * .55, fill: '#7fb05e' }, svg); }
    // talaj: a felszín a süllyedési teknő szerint
    let d = `M0 ${Y(0)}`; for (let x = 5; x <= W; x += 5) d += ` L${x} ${Y(x).toFixed(1)}`; d += ` L${W} 330 L0 330 Z`;
    h('path', { d, fill: soil === 1 ? '#8b8274' : '#c9a46b' }, svg); h('path', { d, fill: 'url(#kshDots)' }, svg); h('path', { d, fill: 'url(#kshGD)' }, svg); h('path', { d }, cp);
    { let gd = `M0 ${Y(0)}`; for (let x = 5; x <= W; x += 5) gd += ` L${x} ${Y(x).toFixed(1)}`; h('path', { d: gd, fill: 'none', stroke: '#6f9a4c', 'stroke-width': 3.5 }, svg); }
    if (soil === 2) { const ex = X(LENS.x), ez = GY + LENS.z * PX; h('ellipse', { cx: ex, cy: ez, rx: LENS.rx * PX, ry: LENS.rz * PX, fill: '#4a3626' }, svg); h('ellipse', { cx: ex, cy: ez, rx: LENS.rx * PX, ry: LENS.rz * PX, fill: 'url(#kshLen)' }, svg); h('text', { x: ex, y: ez + 4, 'text-anchor': 'middle', fill: '#f3e3c8', 'font-size': 12, 'font-weight': 700, 'font-family': 'var(--fm)', text: 'puha lencse' }, svg); }
    // izobárok (σz = 0,8 · 0,5 · 0,3 p)
    const ig = h('g', { 'clip-path': 'url(#kshClip)' }, svg);
    ISO.forEach(({ r, pts }, i) => { let dd = ''; pts.forEach(([x, z], j) => { dd += (j ? ' L' : 'M') + X(x).toFixed(1) + ' ' + (GY + k * sAt(prof, x) + z * PX).toFixed(1); }); h('path', { d: dd, fill: 'none', stroke: `rgba(232,149,42,${0.75 - i * 0.18})`, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' }, ig);
      const last = pts[Math.floor(pts.length / 2)]; if (GY + last[1] * PX < 318) h('text', { x: CX - 26, y: GY + k * sAt(prof, 0) + last[1] * PX - 4, 'font-size': 10.5, 'font-family': 'var(--fm)', fill: 'rgba(255,240,215,.9)', text: String(r).replace('.', EN ? '.' : ',') + ' p' }, ig); });
    // eredeti felszín
    h('line', { x1: 0, y1: GY, x2: W, y2: GY, stroke: 'rgba(20,20,20,.45)', 'stroke-dasharray': '7 6', 'stroke-width': 1.3 }, svg);
    // hajlékony lemezalap (a talajjal együtt hajlik)
    const RT = 9; let rd = `M${BX0 - 6} ${Y(BX0 - 6)}`; for (let x = BX0 - 6; x <= BX1 + 6; x += 4) rd += ` L${x} ${Y(x).toFixed(1)}`; rd += ` L${BX1 + 6} ${(Y(BX1 + 6) + RT).toFixed(1)}`; for (let x = BX1 + 6; x >= BX0 - 6; x -= 4) rd += ` L${x} ${(Y(x) + RT).toFixed(1)}`; rd += ' Z';
    h('path', { d: rd, fill: 'url(#kshGC)', stroke: '#6f6a62', 'stroke-width': 1 }, svg);
    { const tc = soil === 1 ? 'rgba(255,245,230,.95)' : 'rgba(40,30,20,.88)', ly = GY + 58; h('line', { x1: 112, y1: ly - 4, x2: BX0 - 4, y2: Y(BX0) + RT / 2, stroke: tc, 'stroke-width': 1 }, svg); h('text', { x: 108, y: ly - 8, 'text-anchor': 'end', 'font-size': 10.5, 'font-family': 'var(--fm)', fill: tc, text: 'vb. lemezalap' }, svg); h('text', { x: 108, y: ly + 5, 'text-anchor': 'end', 'font-size': 10.5, 'font-family': 'var(--fm)', fill: tc, text: '50 cm' }, svg); }
    // épület – a homlokzat együtt hajlik a lemezzel
    const fh = Math.min(17, (GY - 46) / n), wh = Math.min(9, fh - 5), H = n * fh + 8, top = (x) => Y(x) - H;
    let fd = `M${BX0} ${Y(BX0)}`; for (let x = BX0; x <= BX1; x += 4) fd += ` L${x} ${Y(x).toFixed(1)}`; fd += ` L${BX1} ${Y(BX1)}`; for (let x = BX1; x >= BX0; x -= 4) fd += ` L${x} ${top(x).toFixed(1)}`; fd += ' Z';
    h('path', { d: fd, fill: 'url(#kshGB)', stroke: '#8d8576', 'stroke-width': 1.2 }, svg);
    for (let i = 1; i < n; i++) { let ld = ''; for (let x = BX0; x <= BX1; x += 6) ld += (x === BX0 ? 'M' : ' L') + x + ' ' + (Y(x) - 8 - i * fh).toFixed(1); h('path', { d: ld, fill: 'none', stroke: 'rgba(0,0,0,.09)' }, svg); }
    for (let i = 0; i < n; i++) for (let j = 0; j < 8; j++) { const x = BX0 + 10 + j * 26.5; h('rect', { x, y: (Y(x + 7) - 8 - (i + 1) * fh + (fh - wh) / 2).toFixed(1), width: 14, height: wh.toFixed(1), fill: (i * 8 + j) % 7 === 2 ? '#ffd98a' : 'url(#kshGG)', stroke: 'rgba(60,55,45,.5)', 'stroke-width': .6, rx: 1 }, svg); }
    let rf = ''; for (let x = BX0 - 3; x <= BX1 + 3; x += 4) rf += (x === BX0 - 3 ? 'M' : ' L') + x + ' ' + (top(x) - 2.5).toFixed(1); h('path', { d: rf, fill: 'none', stroke: '#7c8086', 'stroke-width': 6 }, svg);
    // falak / pillérek helye (3,5 m-enként)
    PTS.forEach(m => { const x = X(m); h('line', { x1: x, y1: Y(x), x2: x, y2: top(x), stroke: 'rgba(80,70,55,.18)', 'stroke-width': 1.2 }, svg); });
    // repedések: ahol a szomszédos pontok közötti szögtorzulás nagy; a repedés a jobban süllyedő oldal felé emelkedik
    const fc = h('clipPath', { id: 'kshFac' }, defs); h('path', { d: fd }, fc); const cg = h('g', { 'clip-path': 'url(#kshFac)' }, svg);   // a repedések nem futhatnak ki a homlokzatból
    bet.forEach((b, i) => { if (b < 1 / 300) return; const dir = Math.sign(sp[i + 1] - sp[i] - om * SP * 1000) || 1, xm = (X(PTS[i]) + X(PTS[i + 1])) / 2, w = b >= 1 / 150 ? 2.4 : 1.6, segs = Math.min(2 + n, 9);
      for (const off of b >= 1 / 150 ? [-14, 12] : [0]) { const span = segs * 5; let x0 = xm + off - dir * span / 2; const lo = Math.min(x0, x0 + dir * span), hi = Math.max(x0, x0 + dir * span); if (lo < BX0 + 8) x0 += BX0 + 8 - lo; if (hi > BX1 - 8) x0 -= hi - (BX1 - 8);
        let x = x0, y = Y(x) - 5, dd = `M${x.toFixed(1)} ${y.toFixed(1)}`; for (let s = 0; s < segs; s++) { x += dir * (s % 2 ? 7 : 3); y = Y(x) - 5 - (s + 1) * Math.min(9, (H - 16) / segs); dd += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } h('path', { d: dd, stroke: '#3b2a20', 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cg); } });
    // terhek
    for (let i = 0; i < 5; i++) { const x = BX0 + 22 + i * 44, y0 = top(x) - 30; h('path', { d: `M${x} ${y0} v18`, stroke: '#e8952a', 'stroke-width': 3 }, svg); h('path', { d: `M${x - 5} ${y0 + 16} l5 7 l5 -7z`, fill: '#e8952a' }, svg); }
    // Δs: a legkisebb és a legnagyobb süllyedés különbsége (jobbra, méretvonallal)
    if (dS * k > 4) { const iMax = raft.indexOf(sMax), iMin = raft.indexOf(sMin), xMax = X(-7 + iMax * 0.5), xMin = X(-7 + iMin * 0.5), xd = BX0 - 30, y1 = Y(xMin) + RT, y2 = Y(xMax) + RT;
      h('line', { x1: xMin, y1, x2: xd - 6, y2: y1, stroke: 'rgba(255,255,255,.85)', 'stroke-dasharray': '3 3', 'stroke-width': 1.1 }, svg); h('line', { x1: xMax, y1: y2, x2: xd - 6, y2, stroke: 'rgba(255,255,255,.85)', 'stroke-dasharray': '3 3', 'stroke-width': 1.1 }, svg);
      h('line', { x1: xd, y1, x2: xd, y2, stroke: '#fff', 'stroke-width': 1.6 }, svg); { const ah = Math.min(5, (y2 - y1) / 2.5); h('path', { d: `M${xd - 3} ${y1 + ah} l3 ${-ah} l3 ${ah} M${xd - 3} ${y2 - ah} l3 ${ah} l3 ${-ah}`, stroke: '#fff', fill: 'none', 'stroke-width': 1.3 }, svg); }
      h('text', { x: xd - 8, y: (y1 + y2) / 2 + 4, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, 'font-family': 'var(--fm)', fill: '#fff', text: 'Δs' }, svg); }
    // β: a legnagyobb szögtorzulású szakasz pirossal (δs / ℓ)
    if (beta > 1 / 5000) { const xa = X(PTS[bi]), xb = X(PTS[bi + 1]), ya = Y(xa) + RT, yb = Y(xb) + RT, col = beta >= 1 / 300 ? '#d63a2f' : beta >= 1 / 500 ? '#d98a12' : '#2f8f5b';
      h('line', { x1: xa, y1: ya, x2: xb, y2: yb, stroke: col, 'stroke-width': 3 }, svg);
      const yr = ya + (xb - xa) * (om * 1000) * k / PX;       // a dőlésnek megfelelő vonal
      h('line', { x1: xa, y1: ya, x2: xb, y2: yr, stroke: col, 'stroke-dasharray': '4 3', 'stroke-width': 1.3 }, svg);
      if (Math.abs(yb - yr) > 6) { h('line', { x1: xb + 5, y1: yr, x2: xb + 5, y2: yb, stroke: col, 'stroke-width': 1.6 }, svg); h('text', { x: xb + 9, y: (yr + yb) / 2 + 4, 'font-size': 11.5, 'font-weight': 700, 'font-family': 'var(--fm)', fill: col, text: 'δs' }, svg); }
      [xa, xb].forEach((x, i) => h('circle', { cx: x, cy: i ? yb : ya, r: 4, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, svg));
      const lx = BX1 + 74, ly = GY + 40; h('line', { x1: (xa + xb) / 2, y1: (ya + yb) / 2 + 3, x2: lx - 44, y2: ly - 3, stroke: col, 'stroke-width': 1.2 }, svg); h('rect', { x: lx - 44, y: ly - 12, width: 88, height: 36, rx: 6, fill: 'rgba(255,255,255,.94)' }, svg);
      h('text', { x: lx, y: ly + 1, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, 'font-family': 'var(--fm)', fill: col, text: 'β = δs / ℓ' }, svg);
      h('text', { x: lx, y: ly + 16, 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': 'var(--fm)', fill: '#3b3f45', text: 'ℓ = 3,5 m' }, svg); }
    // értékek
    $('#kshS').textContent = Math.round(sAvg) + ' mm'; $('#kshD').textContent = Math.round(dS) + ' mm';
    $('#kshB').innerHTML = fmtB(beta); $('#kshP').textContent = Math.round(p) + ' kPa';
    const V = $('#kshV'); let cls = 'ok', txt = 'Rendben: a szögtorzulás 1/500 alatt marad, az épület károsodás nélkül viseli a süllyedést.';
    if (beta >= 1 / 150) { cls = 'bad'; txt = 'Szerkezeti károsodás veszélye: a szögtorzulás nagyobb, mint 1/150. Itt már nem a síkalap méretén, hanem az alapozás módján kell változtatni.'; }
    else if (beta >= 1 / 300) { cls = 'bad'; txt = 'Repedések várhatók a falakban (1/300 fölött). Az egyenlőtlen süllyedés a veszélyes – nem az abszolút érték.'; }
    else if (beta >= 1 / 500) { cls = 'warn'; txt = 'Határ közelében: érzékeny burkolatok, válaszfalak már repedhetnek (1/500 és 1/300 között).'; }
    V.className = 'verdict ' + cls; V.textContent = txt;
  }
  $$('#kshSoil button').forEach(b => b.addEventListener('click', () => { soil = +b.dataset.v; $$('#kshSoil button').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
  N.addEventListener('input', draw); draw(); }

/* ================= 1 · ALAPTÍPUSOK ================= */
{ const svg = $('#ftSvg'); const TX = [
    'A síkalapok az építmény terheit teljes egészében a talpfelületükön – az alapsíkon – adják át az altalajnak. Az oldalfelületükön fellépő ellenállást elhanyagoljuk (kivéve szeizmikus terhelésnél). Amit itt látsz, az egy ún.\u00A0vasbeton lemezalap – a\u00A0síkalapok egyik fajtája.',
    'A mélyalapok – elsősorban a cölöp- és a résalapok – a terheket egyrészt a talpukon, másrészt az oldalfelületükön, a palástjukon adják át az altalajra, gyakorlatilag egymástól függetlenül.',
    'A vegyes alapozások ötvözik a sík- és a mélyalapozást: ilyen pl.\u00A0a\u00A0cölöppel gyámolított lemezalap.'];
  const GO = [[3, 4, 5], [8], [8]];
  function draw(t) {
    svg.innerHTML = ''; const GY = 92;
    const defs = h('defs', {}, svg);
    const grad = (id, stops, x2 = 0, y2 = 1) => { const g = h('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach(([o, c, a = 1]) => h('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); };
    grad('ftSky', [[0, '#b5d3ec'], [.75, '#e2edf2'], [1, '#f1eee2']]); grad('ftL1', [[0, '#978d7c'], [1, '#7f7769']]); grad('ftL2', [[0, '#d5b67c'], [1, '#b9985d']]);
    grad('ftC', [[0, '#aaa497'], [.3, '#e6e1d7'], [1, '#a29c8f']], 1, 0); grad('ftCs', [[0, '#e2ddd3'], [1, '#b7b1a5']]); grad('ftB', [[0, '#f8f1e0'], [.7, '#efe6d2'], [1, '#d6ccb5']], 1, 0);
    grad('ftSh', [[0, '#000', .32], [1, '#000', 0]]); grad('ftGl', [[0, '#9dbfd9'], [1, '#48637b']]);
    const dots = h('pattern', { id: 'ftD', width: 9, height: 9, patternUnits: 'userSpaceOnUse' }, defs); h('circle', { cx: 2, cy: 2, r: 1, fill: 'rgba(60,40,20,.3)' }, dots);
    h('rect', { x: 0, y: 0, width: 560, height: GY, fill: 'url(#ftSky)' }, svg);
    for (const [x, y] of [[56, 34], [452, 26]]) h('path', { d: `M${x} ${y}c2-9 15-11 20-4 6-5 17-1 16 7 7 1 7 10 0 10h-36c-8 0-8-12 0-13z`, fill: '#fff', opacity: .8 }, svg);
    for (const [x, r] of [[118, 11], [146, 8], [424, 9], [452, 12], [506, 9]]) { h('rect', { x: x - 1.5, y: GY - r - 8, width: 3, height: r + 8, fill: '#6b5136' }, svg); h('circle', { cx: x, cy: GY - r - 12, r, fill: '#5f8f45' }, svg); h('circle', { cx: x - r * .3, cy: GY - r - 15, r: r * .55, fill: '#7fb05e' }, svg); }
    h('rect', { x: 0, y: GY, width: 560, height: 120, fill: 'url(#ftL1)' }, svg); h('rect', { x: 0, y: GY, width: 560, height: 120, fill: 'url(#ftD)' }, svg);
    h('rect', { x: 0, y: GY + 120, width: 560, height: 90, fill: 'url(#ftL2)' }, svg); h('rect', { x: 0, y: GY + 120, width: 560, height: 90, fill: 'url(#ftD)' }, svg);
    let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;   // szemcsék: véletlenszerű, de mindig ugyanaz
    for (let i = 0; i < 96; i++) { const low = i >= 48, x = rnd() * 560, y = low ? GY + 127 + rnd() * 78 : GY + 9 + rnd() * 104, r = low ? 1.6 + rnd() * 2.6 : 1 + rnd() * 1.7, c = rnd() < .5;
      h('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: (r * 1.35).toFixed(1), ry: r.toFixed(1), fill: low ? (c ? 'rgba(255,240,200,.4)' : 'rgba(90,60,20,.25)') : (c ? 'rgba(255,255,255,.13)' : 'rgba(30,25,20,.22)') }, svg); }
    h('path', { d: `M0 ${GY + 120}q70 -5 140 0t140 0 140 0 140 0`, fill: 'none', stroke: 'rgba(40,30,15,.4)', 'stroke-width': 1.2 }, svg);
    h('rect', { x: 0, y: GY, width: 560, height: 18, fill: 'url(#ftSh)' }, svg); h('rect', { x: 0, y: GY - 3, width: 560, height: 4, fill: '#6f9a4c' }, svg);
    h('text', { x: 14, y: GY + 22, fill: '#f1ece2', 'font-size': 12.5, 'font-weight': 700, 'font-family': 'var(--fm)', text: 'gyengébb réteg' }, svg);
    h('text', { x: 14, y: GY + 142, fill: '#3b2d18', 'font-size': 12.5, 'font-weight': 700, 'font-family': 'var(--fm)', text: 'teherbíró réteg' }, svg);
    const conc = 'url(#ftC)', concS = 'url(#ftCs)', cs = '#7d776d';
    const up = (x, y, len, col) => { const g = h('g', { class: 'ft-a', style: `--fd0:${(-(x % 47) / 47 * 1.5).toFixed(2)}s` }, svg); h('path', { d: `M${x} ${y} v${-len + 7}`, stroke: col, 'stroke-width': 2.6 }, g); h('path', { d: `M${x - 4.5} ${y - len + 8} l4.5 -8 l4.5 8z`, fill: col }, g); };
    const lab = (x, y, txt, col, anchor = 'start') => h('text', { x, y, fill: col, 'font-size': 13, 'font-weight': 700, 'font-family': 'var(--fm)', 'text-anchor': anchor, text: txt }, svg);
    // épület
    const bx0 = 190, bx1 = 370; h('rect', { x: bx0, y: 18, width: bx1 - bx0, height: GY - 18, fill: 'url(#ftB)', stroke: '#8d8576' }, svg);
    h('rect', { x: bx0 - 4, y: 14, width: bx1 - bx0 + 8, height: 6, rx: 1.5, fill: '#b9ae97', stroke: '#8d8576', 'stroke-width': .8 }, svg);
    for (let r = 0; r < 2; r++) for (let j = 0; j < 6; j++) { const wx = bx0 + 14 + j * 28, wy = 30 + r * 28; h('rect', { x: wx, y: wy, width: 14, height: 12, rx: 1, fill: (r * 6 + j) % 5 === 1 ? '#ffd98a' : 'url(#ftGl)', stroke: '#6f6a5e', 'stroke-width': .7 }, svg); h('path', { d: `M${wx + 7} ${wy}v12`, stroke: 'rgba(255,255,255,.55)', 'stroke-width': .8 }, svg); }
    for (const x of [205, 280, 355]) { const g = h('g', { class: 'ft-a dn', style: `--fd0:${(-x / 300).toFixed(2)}s` }, svg); h('path', { d: `M${x} 1 v13`, stroke: '#e8952a', 'stroke-width': 3 }, g); h('path', { d: `M${x - 5} 12 l5 7 l5 -7z`, fill: '#e8952a' }, g); }
    if (t === 0) { h('rect', { x: bx0 - 18, y: GY, width: bx1 - bx0 + 36, height: 26, rx: 1.5, fill: concS, stroke: cs }, svg); h('line', { x1: 120, y1: GY + 26, x2: 440, y2: GY + 26, stroke: '#1b1d20', 'stroke-dasharray': '6 5' }, svg); lab(446, GY + 30, 'alapsík', '#1b1d20');
      for (let i = 0; i <= 10; i++) up(bx0 - 14 + i * ((bx1 - bx0 + 28) / 10), GY + 52, 24, '#2f9d62'); lab(280, GY + 72, 'talpfeszültség', '#1d5c39', 'middle'); }
    if (t === 1) { h('rect', { x: bx0 + 10, y: GY - 2, width: bx1 - bx0 - 20, height: 22, rx: 1.5, fill: concS, stroke: cs }, svg);
      for (const x of [222, 338]) { h('rect', { x: x - 9, y: GY + 20, width: 18, height: 150, fill: conc, stroke: cs }, svg); for (let k = 0; k < 6; k++) { up(x - 16, GY + 52 + k * 20, 14, '#2f9d62'); up(x + 16, GY + 52 + k * 20, 14, '#2f9d62'); } up(x, GY + 198, 24, '#e8952a'); }
      lab(160, GY + 92, 'palást', '#e6f4ec', 'end'); lab(338 + 26, GY + 196, 'talp', '#4a2c05'); }
    if (t === 2) { h('rect', { x: bx0 - 30, y: GY, width: bx1 - bx0 + 60, height: 20, rx: 1.5, fill: concS, stroke: cs }, svg);
      for (let i = 0; i <= 12; i++) up(bx0 - 26 + i * ((bx1 - bx0 + 52) / 12), GY + 42, 18, '#2f9d62');
      for (const x of [205, 255, 305, 355]) { h('rect', { x: x - 7, y: GY + 20, width: 14, height: 118, fill: conc, stroke: cs }, svg); for (let k = 0; k < 4; k++) up(x + 13, GY + 66 + k * 20, 12, '#2f9d62'); up(x, GY + 160, 18, '#e8952a'); }
      lab(bx1 + 44, GY + 58, 'lemez +', '#f1ece2'); lab(bx1 + 44, GY + 76, 'cölöpök', '#f1ece2'); }
    $('#ftTxt').textContent = TX[t]; const go = $('#ftGo'); go.innerHTML = '<span class="mut" style="font:600 13px/2 var(--fb); margin-right:4px">Részletesen:</span>';
    GO[t].forEach(n => el('a', { cls: 'pill', href: '#st' + n, style: `--c:${cv(n)}` }, go, `<i>${n}</i>${S[n - 1].rail.replace('\u00AD', '')}`));
  }
  $$('#ftype .seg button').forEach(b => b.addEventListener('click', () => { $$('#ftype .seg button').forEach(x => x.classList.toggle('on', x === b)); draw(+b.dataset.v); })); draw(0); }

/* ================= 1 · TÉNYEZŐK ================= */
{ const I = {
    soil: '<path d="M4 14c4-2 8 1 12-1s8-1 8-1M4 21c4-2 8 1 12-1s8-1 8-1M4 28c4-2 8 1 12-1s8-1 8-1" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="8" r="2" fill="currentColor"/>',
    water: '<path d="M18 4c4 6 7 10 7 14a7 7 0 0 1-14 0c0-4 3-8 7-14z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M6 31h26" stroke="currentColor" stroke-width="2.2"/>',
    sens: '<rect x="8" y="6" width="20" height="18" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15 8l3 6-3 3 3 6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5 29h26" stroke="currentColor" stroke-width="2.2"/>',
    load: '<path d="M18 3v18M12 15l6 7 6-7" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="25" width="22" height="6" fill="currentColor"/>',
    nb: '<rect x="3" y="12" width="11" height="18" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="18" y="5" width="14" height="25" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M1 31h34" stroke="currentColor" stroke-width="2.2"/>',
    site: '<path d="M4 30l8-14 6 6 4-7 10 15z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M22 4h10v6H22z" fill="currentColor"/>' };
  const T = [['soil', 'Az altalaj', 'Milyen rétegek vannak, milyen mélyen kezdődik a teherbíró réteg?', [2, 6]], ['water', 'A talajvíz-viszonyok', 'Milyen mélyen van, mennyit ingadozik, és mennyire agresszív a betonra?', [2, 4]],
    ['sens', 'Az építmény szerkezete', 'Mennyire érzékeny a süllyedésre, mennyi süllyedéskülönbséget visel el károsodás nélkül?', [5]], ['load', 'A terhelési viszonyok', 'Mekkora, milyen irányú és mennyire külpontos a teher?', [3, 4]],
    ['nb', 'A szomszédos építmények', 'Milyen közel vannak, hány szintesek, milyen a szerkezetük – és min állnak?', [7, 9]], ['site', 'A kivitelezés körülményei', 'Mennyi a rendelkezésre álló hely, befér-e a gép, kiemelhető-e a munkagödör?', [8, 9]]];
  const box = $('#tiles'); T.forEach(([ic, t, d, go]) => { const c = el('div', { cls: 'tile' }, box, `<svg viewBox="0 0 36 36" style="color:var(--accent)" aria-hidden="true">${I[ic]}</svg><b>${t}</b><p>${d}</p>`);
    const g = el('div', { cls: 'go' }, c); go.forEach(n => el('a', { cls: 'pill', href: '#st' + n, style: `--c:${cv(n)}` }, g, `<i>${n}</i>${S[n - 1].rail.replace('\u00AD', '')}`)); }); }

/* ================= 1 · HATÁRÁLLAPOTOK ================= */
{ const ic = (k) => { const s = { brk: '<rect x="14" y="12" width="16" height="6" fill="#9a958b"/><path d="M8 20 Q22 40 36 20" stroke="#d4483a" stroke-width="2.4" fill="none"/>', sl: '<rect x="12" y="14" width="18" height="8" fill="#9a958b"/><path d="M30 18h9M36 15l3 3-3 3" stroke="#d4483a" stroke-width="2.4" fill="none"/><path d="M6 22h32" stroke="#555" stroke-width="1.5"/>',
      ov: '<g transform="rotate(-12 30 22)"><rect x="16" y="6" width="12" height="16" fill="#cfc6b3"/><rect x="12" y="22" width="20" height="5" fill="#9a958b"/></g><path d="M12 30 A14 14 0 0 1 9 16" stroke="#d4483a" stroke-width="2.4" fill="none"/>', up: '<rect x="10" y="12" width="24" height="12" fill="#9a958b"/><path d="M6 18h32" stroke="#3d9ad6" stroke-width="2"/><path d="M16 34v-8M28 34v-8" stroke="#3d9ad6" stroke-width="2.4"/><path d="M13 28l3-4 3 4M25 28l3-4 3 4" fill="#3d9ad6"/>',
      gl: '<path d="M4 14h12l20 22H4z" fill="#cbb98f"/><path d="M8 14 A24 24 0 0 0 38 36" stroke="#d4483a" stroke-width="2.4" fill="none" stroke-dasharray="4 3"/>', st: '<rect x="12" y="8" width="20" height="16" fill="#cfc6b3"/><path d="M14 26 Q22 34 30 26" stroke="#3d9ad6" stroke-width="2" fill="none"/><path d="M22 10v10" stroke="#555" stroke-width="1.6" stroke-dasharray="2 2"/>',
      df: '<g transform="rotate(5 22 22)"><rect x="10" y="8" width="24" height="16" fill="#cfc6b3"/><path d="M20 10l3 5-2 3 3 5" stroke="#3b2a20" stroke-width="1.6" fill="none"/></g><path d="M6 30h32" stroke="#555" stroke-width="1.5"/>', str: '<rect x="8" y="16" width="28" height="10" fill="#9a958b"/><path d="M14 16v10M20 16v10M26 16v10M32 16v10" stroke="#555" stroke-width="1.4"/><path d="M8 21h28" stroke="#d4483a" stroke-width="1.6" stroke-dasharray="3 2"/>' }[k];
      return `<svg viewBox="0 0 44 44" aria-hidden="true">${s}</svg>`; };
  const G = [['Teherbírási határállapotok', 'Biztonság a tönkremenetel ellen', [['brk', 'talajtörés', 3], ['sl', 'elcsúszás', 4], ['ov', 'felborulás (billenés)', 4], ['up', 'felúszás', 4], ['gl', 'általános állékonyság', 4]]],
    ['Használhatósági határállapotok', 'Az épület használható marad', [['st', 'káros süllyedések', 5], ['df', 'süllyedéskülönbségek', 5]]],
    ['Szerkezeti szilárdság', 'Maga az alap se menjen tönkre', [['str', 'az alapozási rendszer megfelelő szilárdsága', 3]]]];
  const box = $('#ls'); G.forEach(([t, s, items]) => { const g = el('div', { cls: 'lsg' }, box, `<h4>${t}</h4><h5>${s}</h5>`);
    items.forEach(([k, n, st]) => el('a', { cls: 'lsi', href: '#st' + st }, g, `${ic(k)}<span><b>${n}</b><span>→ ${st}. állomás · ${S[st - 1].rail.replace('\u00AD', '')}</span></span>`)); }); }

/* ================= 1 · PISA ================= */
{ const svg = $('#pisaSvg'); const H = 56, PX = 4.2, CX = 210, GY = 340; let ang = 0, target = 0, ghost = null, raf = 0;
  const TL = [['1173', 'alapozás', 0.0, 'Augusztusban lerakják az alapokat. A torony mindössze kb. 3 m mély, kör alakú síkalapon áll – puha, egyenlőtlen vastagságú agyagrétegek fölött.', 1],
    ['1178', '2. emelet', 0.25, 'A második emelet elkészülte után a torony süllyedni kezd, és megjelenik a dőlés. Az építés közel száz évre leáll – a szünetben a talaj konszolidálódik, és ez valószínűleg megmentette a tornyot.', 3],
    ['1372', 'kész', 1.6, 'Elkészül a harangház. A dőlés az építés alatt végig nőtt; a felső emeleteket az építők már a dőlés ellensúlyozására építették, ezért a torony ma kissé ívelt.', 8],
    ['1990', '5,5°', 5.5, 'A dőlés eléri az 5,5°-ot. A tornyot lezárják a látogatók elől, és nemzetközi szakértői bizottság kezdi meg a stabilizálást.', 8],
    ['2001', '−45 cm', 4.0, 'Ideiglenes ólom ellensúlyok az északi oldalon, majd óvatos talajkiemelés az alap északi széle alól: a dőlés kb. 45 cm-rel csökken.', 8],
    ['ma', '3,97°', 3.97, 'A dőlés kb. 3,97°, a csúcs kb. 3,9 m-re tér el a függőlegestől – és a torony stabil.', 8]];
  let tiers = 8;
  function tower(g, tiersN, dashed = false) {
    const w = 15.5 * PX * 0.95, tierH = (H * PX - 22) / 8;
    for (let i = 0; i < tiersN; i++) { const y0 = -i * tierH; const ww = i === 7 ? w * 0.72 : w;
      h('rect', { x: -ww / 2, y: y0 - tierH, width: ww, height: tierH, fill: dashed ? 'none' : (i % 2 ? '#efe9dc' : '#f6f1e6'), stroke: dashed ? '#e8952a' : '#a79f90', 'stroke-width': dashed ? 1.6 : 1, 'stroke-dasharray': dashed ? '5 4' : '' }, g);
      if (!dashed) { for (let k = 0; k < 6; k++) h('path', { d: `M${-ww / 2 + 6 + k * (ww - 12) / 6} ${y0 - 4} v${-tierH * 0.55} a${(ww - 12) / 14} ${(ww - 12) / 14} 0 0 1 ${(ww - 12) / 7} 0 v${tierH * 0.55}`, fill: '#cfc5b1', stroke: '#b8ae9c', 'stroke-width': .8 }, g);
        h('rect', { x: -ww / 2 - 2, y: y0 - tierH - 1.5, width: ww + 4, height: 3, rx: 1.2, fill: '#d8cfbd', stroke: '#a79f90', 'stroke-width': .6 }, g);
        h('rect', { x: -ww / 2, y: y0 - tierH, width: ww, height: tierH, fill: 'url(#pTw)' }, g); } }
    if (!dashed) { h('rect', { x: -w / 2 - 6, y: -4, width: w + 12, height: 8, rx: 1.5, fill: '#bfb6a5', stroke: '#9c9484', 'stroke-width': .7 }, g);
      if (tiersN === 8) { const yt = -8 * tierH; h('path', { d: `M0 ${yt} v-20`, stroke: '#5a5348', 'stroke-width': 1.4 }, g); h('path', { d: `M0 ${yt - 20} l13 4 l-13 4z`, fill: '#d4483a' }, g); } }
  }
  function draw() {
    svg.innerHTML = ''; const defs = h('defs', {}, svg); const d = h('pattern', { id: 'pD', width: 8, height: 8, patternUnits: 'userSpaceOnUse' }, defs); h('circle', { cx: 2, cy: 2, r: 1, fill: 'rgba(50,40,30,.3)' }, d);
    const grad = (id, stops, x2 = 0, y2 = 1) => { const g = h('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach(([o, c, a = 1]) => h('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); };
    grad('pSky', [[0, '#a5cdee'], [.72, '#dcebf2'], [1, '#f3efe3']]); grad('pTw', [[0, '#000', .22], [.28, '#fff', .2], [.55, '#000', 0], [1, '#000', .3]], 1, 0);
    grad('pS1', [[0, '#bda77c'], [1, '#a8936c']]); grad('pS2', [[0, '#8b9197'], [1, '#6f757c']]); grad('pSh', [[0, '#000', .3], [1, '#000', 0]]);
    h('rect', { x: 0, y: 0, width: 420, height: GY, fill: 'url(#pSky)' }, svg);
    h('circle', { cx: 62, cy: 128, r: 34, fill: '#fff3c9', opacity: .5 }, svg); h('circle', { cx: 62, cy: 128, r: 17, fill: '#ffe08a' }, svg);
    for (const [x, y] of [[282, 150], [20, 208], [330, 232]]) h('path', { d: `M${x} ${y}c2-9 15-11 20-4 6-5 17-1 16 7 7 1 7 10 0 10h-36c-8 0-8-12 0-13z`, fill: '#fff', opacity: .82 }, svg);
    h('path', { d: `M0 ${GY}v-16q46-22 92-6t84-4 74 6 96-8 74 12v20z`, fill: '#a9c59a', opacity: .75 }, svg);   // távoli dombok
    for (const [x, hh] of [[26, 46], [48, 34], [356, 40], [384, 54], [402, 32]]) { h('rect', { x: x - 1, y: GY - 8, width: 2, height: 8, fill: '#5d4a34' }, svg); h('ellipse', { cx: x, cy: GY - 6 - hh / 2, rx: 5.5, ry: hh / 2, fill: '#3f6b3c' }, svg); h('ellipse', { cx: x - 1.6, cy: GY - 8 - hh / 2, rx: 2.4, ry: hh / 2.6, fill: '#55864c' }, svg); }
    // rétegek (vázlat az irodalom alapján): felül homokos iszap és homok, amely dél (a dőlés oldala) felé elvékonyodik; alatta a puha agyag, amely dél felé vastagabb; legalul merevebb rétegek
    const ctop = `M0 ${GY + 46}C150 ${GY + 45} 270 ${GY + 27} 420 ${GY + 20}`;
    h('rect', { x: 0, y: GY, width: 420, height: 80, fill: 'url(#pS1)' }, svg); h('rect', { x: 0, y: GY, width: 420, height: 80, fill: 'url(#pD)' }, svg);
    h('path', { d: `${ctop}V${GY + 66}H0Z`, fill: 'url(#pS2)' }, svg);
    for (let i = 0; i < 9; i++) { const x = 8 + i * 47, y = GY + 56 - (i > 4 ? (i - 4) * 5 : 0) + (i % 2) * 5; h('path', { d: `M${x} ${y}h${20 + (i % 2) * 10}`, stroke: 'rgba(255,255,255,.2)', 'stroke-width': 1.2, 'stroke-linecap': 'round' }, svg); }
    h('path', { d: ctop, fill: 'none', stroke: 'rgba(40,30,15,.5)', 'stroke-width': 1.3 }, svg);
    h('rect', { x: 0, y: GY + 66, width: 420, height: 14, fill: '#5e554a' }, svg); h('rect', { x: 0, y: GY + 66, width: 420, height: 14, fill: 'url(#pD)' }, svg); h('path', { d: `M0 ${GY + 66}H420`, stroke: 'rgba(20,15,10,.55)', 'stroke-width': 1.2 }, svg);
    h('rect', { x: 0, y: GY, width: 420, height: 12, fill: 'url(#pSh)' }, svg); h('rect', { x: 0, y: GY - 3, width: 420, height: 4, fill: '#6f9a4c' }, svg);
    h('line', { x1: CX, y1: GY - H * PX - 30, x2: CX, y2: GY, stroke: '#1d2a33', 'stroke-dasharray': '6 5', 'stroke-width': 1.4 }, svg);
    if (ghost !== null) { const ga = Math.asin(clamp(ghost / H, 0, 0.2)) * 180 / Math.PI; const gg = h('g', { transform: `translate(${CX} ${GY}) rotate(${ga})` }, svg); tower(gg, 8, true); }
    h('ellipse', { cx: CX + 12 + ang * 3, cy: GY + 1, rx: 52, ry: 4.5, fill: 'rgba(0,0,0,.2)' }, svg);
    const g = h('g', { transform: `translate(${CX} ${GY}) rotate(${ang})` }, svg); tower(g, tiers);
    const top = H * PX * (tiers / 8); const dx = Math.sin(ang * Math.PI / 180) * top, ty = GY - Math.cos(ang * Math.PI / 180) * top;
    if (tiers === 8 && ang > 0.5) { h('line', { x1: CX, y1: ty - 12, x2: CX + dx, y2: ty - 12, stroke: '#d4483a', 'stroke-width': 2.4 }, svg); h('text', { x: CX + dx / 2, y: ty - 20, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#d4483a', 'font-family': 'var(--fd)', text: fmt(Math.sin(ang * Math.PI / 180) * H * 1.005, 1) + ' m' }, svg); }
    h('text', { x: 48, y: GY + 18, fill: '#3a2e18', 'font-size': 11.5, 'font-weight': 700, 'font-family': 'var(--fm)', text: 'homokos iszap, homok' }, svg);
    for (const [x, t] of [[30, 'É'], [390, 'D']]) { h('circle', { cx: x, cy: GY + 12, r: 8, fill: 'rgba(20,24,28,.78)' }, svg); h('text', { x, y: GY + 16, 'text-anchor': 'middle', fill: '#fff', 'font-size': 10.5, 'font-weight': 700, 'font-family': 'var(--fm)', text: t }, svg); }
    h('text', { x: 34, y: GY + 62, fill: '#fff', 'font-size': 11.5, 'font-weight': 700, 'font-family': 'var(--fm)', text: 'puha, egyenlőtlen vastagságú agyagréteg' }, svg);
    h('text', { x: 34, y: GY + 77, fill: 'rgba(255,255,255,.8)', 'font-size': 10, 'font-weight': 700, 'font-family': 'var(--fm)', text: 'merevebb rétegek' }, svg);
  }
  function animTo(a) { target = a; cancelAnimationFrame(raf); if (reduce) { ang = a; draw(); return; } const a0 = ang, t0 = performance.now(); const step = (now) => { const u = clamp((now - t0) / 900); ang = lerp(a0, target, 1 - Math.pow(1 - u, 3)); draw(); if (u < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }
  const pg = $('#pg'), pgO = $('#pgO'); pg.addEventListener('input', () => { pgO.textContent = fmt(+pg.value, 1); ghost = +pg.value; draw(); });
  const tl = $('#ptl'), tx = $('#ptx');
  const pick = (i) => { $$('#ptl button').forEach((b, k) => b.classList.toggle('on', k === i)); tiers = TL[i][4]; tx.textContent = TL[i][3]; animTo(TL[i][2]); };
  TL.forEach((r, i) => { const b = el('button', {}, tl, `<b>${r[0]}</b><span>${r[1]}</span>`); b.addEventListener('click', () => pick(i)); });
  $('#pgGo').addEventListener('click', () => { const g = +pg.value; ghost = g; const diff = Math.abs(g - 3.9); $('#pgA').classList.add('on');
    $('#pgAt').textContent = (diff < 0.25 ? 'Telitalálat! ' : `A tipped ${fmt(diff, 1)} m-rel tért el. `) + 'Nem a süllyedés nagysága volt a baj, hanem az egyenlőtlensége: a torony egyenlőtlen vastagságú, puha agyagrétegeken áll, és a konszolidáció évszázadokig tartott. Ezért kell részletes talajvizsgálat.';
    pick(5); });
  tx.textContent = 'Állítsd be a tipped a csúszkával, majd kattints a gombra – vagy lapozz az évszámok között.'; ghost = 2; draw(); }

/* ================= 1 · VILLÁMKÖR ================= */
{ const Q = [['Családi ház tömör homokon', 0, 'Kis teher, jó teherbírású talaj közvetlenül a felszín közelében: a sáv- vagy a lemezalap gazdaságos és biztonságos.'],
    ['Egyemeletes ház puha szerves agyagon', 1, 'A szerves talaj nagyon összenyomható, és a süllyedése évekig tart: a terhet a teherbíró rétegig kell levinni – vagy előbb a talajt kell megjavítani.'],
    ['Hídpillér a folyóban', 1, 'A víz kimoshatja a meder anyagát a pillér körül, és nagy a vízszintes erő is: a pillért a kimosási mélység alá, mélyre kell alapozni.'],
    ['Toronyház két pinceszinttel, a teherbíró réteg 15 m mélyen', 1, 'Nagy teher, mély pince, mély teherbíró réteg: résfalas munkagödör és cölöpök – esetleg cölöppel gyámolított lemezalap.']];
  const box = $('#qz'); let ok = 0, done = 0; const sc = $('#qzScore');
  Q.forEach(([t, a, e], i) => { const c = el('div', { cls: 'q' }, box, `<span class="qn">${i + 1} / ${Q.length}</span><b>${t}</b><div class="opts"><button data-v="0">Síkalap</button><button data-v="1">Mélyalap</button></div><p class="fb"></p>`);
    $$('button', c).forEach(b => b.addEventListener('click', () => { if (c.classList.contains('done')) return; const v = +b.dataset.v; c.classList.add('done'); done++; if (v === a) ok++;
      $$('button', c).forEach(x => x.classList.add(+x.dataset.v === a ? 'right' : (x === b ? 'wrong' : 'x'))); $('.fb', c).innerHTML = `<b style="font-size:15px">${v === a ? 'Igen! ' : 'Nem egészen. '}</b>${e}`; sc.textContent = `${ok} / ${done} helyes`; })); }); }

/* ================= A TÁRGY ÚTJA: lépések ================= */
{ const box = $('#steps'), prog = $('#jprog');
  S.forEach(s => { const c = el('article', { cls: 'stp', id: 'st' + s.n, 'data-n': s.n, style: `--c:${cv(s.n)}` }, box);
    el('div', { cls: 'sn' }, c, `<i>${s.n}</i><div><span>${s.n}. állomás</span><h3>${s.title}</h3></div>`);
    el('p', { cls: 'q1' }, c, s.q); el('p', {}, c, s.p); const ul = el('ul', {}, c); s.li.forEach(x => el('li', {}, ul, x));
    const ap = el('div', { cls: 'apps' }, c);
    s.apps.forEach(a => { if (a.here) { el('a', { cls: 'app here', href: '#bevezetes' }, ap, `<span><b>Ezen az oldalon – a bevezetés</b><span>görgess vissza, vagy nézd meg a bevezető animációt</span><em>↑ Vissza a bevezetéshez</em></span>`); return; }
      el('a', { cls: 'app', href: AU(a), target: '_blank', rel: 'noopener' }, ap, `<img src="img/apps/${a.img}.jpg" alt="${a.t} – a tananyag nyitóképe" loading="lazy" width="960" height="600"><span><b>${a.sub ? a.sub + ' · ' : ''}${a.t}</b><span>${AT(a)}</span><em>Megnyitás ${arrow}</em></span>`); });
    const m = el('div', { cls: 'meta' }, c); s.meta.forEach(x => el('span', {}, m, x));
    el('b', { style: `--c:${cv(s.n)}` }, prog); }); }

/*XS*/
{ const steps = $$('.stp'), hud = $('#jhud'), fr = $('#jframe'), pr = $$('#jprog b'); let cur = 0;
  const go = (n) => { if (n === cur) return; cur = n; XS.set(n); steps.forEach(s => s.classList.toggle('on', +s.dataset.n === n)); pr.forEach((b, i) => b.classList.toggle('on', i < n));
    fr.style.setProperty('--c', cv(n)); hud.innerHTML = `<i style="background:${cv(n)}">${n}</i><span>${S[n - 1].rail.replace('\u00AD', '')}</span>`; };
  const io = new IntersectionObserver((es) => { let best = null; es.forEach(e => { if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e; }); if (best) go(+best.target.dataset.n); }, { rootMargin: '-38% 0px -42% 0px', threshold: [0, .1, .3, .6] });
  steps.forEach(s => io.observe(s)); go(1); }

/* ================= GYŰJTŐRÁCS, LÁBLÉC ================= */
{ const box = $('#gridApps'), fl = $('#footList');
  S.forEach(s => s.apps.forEach(a => { if (a.here) { el('a', { cls: 'ac here', href: '#top', style: `--c:${cv(s.n)}` }, box, `<span class="im"><img src="img/apps/bevezetes.jpg?v=3" alt="Bevezetés – nyitókép" loading="lazy" width="960" height="600"><i>1</i></span><span class="tx"><b>Bevezetés – ez az oldal</b><span>bme-alapozas.vercel.app</span><p class="acd">A tárgy felépítése, a kilenc állomás és az összes tananyag egy helyen – innen indul az út.</p><em>Itt vagy most ↑</em></span>`); return; } const lab = a.sub ? (a.sub === 'extra' ? s.n + '+' : a.sub) : String(s.n);
    el('a', { cls: 'ac' + (a.sub === 'extra' ? ' x' : ''), href: AU(a), target: '_blank', rel: 'noopener', style: `--c:${cv(s.n)}` }, box, `<span class="im"><img src="img/apps/${a.img}.jpg" alt="${a.t} – nyitókép" loading="lazy" width="960" height="600"><i>${lab}</i></span><span class="tx"><b>${a.t}</b><span>${AT(a)}</span><em>${'Megnyitás'} ↗</em></span>`);
    el('li', {}, fl, `<i>${lab}</i><a href="${AU(a)}" target="_blank" rel="noopener">${a.t}</a>${EN && !a.en ? ' <span class="inhu">HU</span>' : ''}`); }));
  // az egész félévet átfogó tananyagok: széles kártyák a rács végén
  const X = [
    { t: 'Egy telek, egy félév', u: 'bme-alapozas.vercel.app/telek', img: 'telek', lab: '1–9', d: 'Kilenc állomás egyetlen telken: te vagy a geotechnikus, és minden megoldott feladattal tovább épül a két ház 3D-makettje, a talaj megismerésétől az utolsó födémig.' },
    { t: 'Geotechnikai helyszínelők', u: 'bme-alapozas.vercel.app/helyszinelok', en: 'bme-alapozas.vercel.app/helyszinelok/en', img: 'helyszinelok', lab: '3–9', d: 'Valós és tipikus alapozási kárügyek: a nyomokból kell kideríteni, mi történt, és mi előzte volna meg. Rangokkal, pontokkal és repedésolvasó játékkal.' },
    { t: 'Tippelj, aztán számolj', u: 'bme-alapozas.vercel.app/tippelj', en: 'bme-alapozas.vercel.app/tippelj/en', img: 'tippelj', lab: '1–9', d: 'Becslős kérdések minden előadáshoz: előbb tippelsz egy logaritmikus skálán, aztán megnézed a számítást. Előadáson kivetítő módban, QR-kóddal.' },
    { t: 'Alapozás AR labor', u: 'bme-alapozas.vercel.app/ar-labor', img: 'ar-labor3', lab: '1–9', d: 'Tizenegy mozgó 3D-modell kiterjesztett valóságban – talajtörés, feszültséghagyma és határmélység, a pisai torony, rázóasztal, CFA-cölöp, munkagödör, a kész telek és négy valós helyszín a MOL Campustól a Néprajzi Múzeumig. Telefonon az asztalra vagy a padlóra tehetők, körbejárhatók.' },
  ];
  X.forEach(a => { el('a', { cls: 'ac wide', href: AU(a), target: '_blank', rel: 'noopener', style: '--c:var(--accent)' }, box, `<span class="im"><img src="img/apps/${a.img}.jpg" alt="${a.t} – nyitókép" loading="lazy" width="960" height="600"><i>${a.lab}</i></span><span class="tx"><b>${a.t}</b><span>${AT(a)}</span><p class="acd">${a.d}</p><em>Megnyitás ↗</em></span>`);
    el('li', {}, fl, `<i>${a.lab}</i><a href="${AU(a)}" target="_blank" rel="noopener">${a.t}</a>${EN && !a.en ? ' <span class="inhu">HU</span>' : ''}`); });
  el('a', { cls: 'ac wide acv', href: '#video', 'data-video': '', style: '--c:var(--accent)' }, box, `<span class="im"><img src="img/poster-alt.jpg?v=2" alt="A bevezető animáció nyitóképe" loading="lazy" width="1600" height="900"><i>▶ 3:10</i></span><span class="tx"><b>A tárgy felépítése – bevezető animáció</b><span>animációs videó · saját zene</span><p class="acd">Három perc alatt az egész félév: egy kitalált telken a talaj feltárásától a síkalapon álló házon át a cölöpökön és résfalas munkagödörben épülő toronyig.</p><em>Lejátszás ▶</em></span>`); }

/* ================= VIDEÓ ================= */
{ const m = $('#vmodal'), f = $('#vmFrame'); let last = null;
  const open = () => { last = document.activeElement; f.src = EN ? 'video/bevezeto-en.html?v=2#autoplay' : 'video/bevezeto.html?v=5#autoplay'; m.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => f.focus(), 300); };
  const close = () => { m.hidden = true; f.src = 'about:blank'; document.body.style.overflow = ''; if (last) last.focus(); };
  $$('[data-video]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); open(); })); $('#vmClose').addEventListener('click', close);
  m.addEventListener('click', (e) => { if (e.target === m) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !m.hidden) close(); });
  addEventListener('message', (e) => { if (e.data === 'vclose' && !m.hidden) close(); }); }

/* ================= LÁTVÁNY: élő hős, előzetes, görgetési sáv, megjelenés görgetésre ================= */
{ const hero = $('.hero'), fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  // csillagok és a talajból felszálló szemcsék a hős hátterében (30 kép/mp, csak amíg a hős látszik)
  const cv2 = $('#heroFx');
  if (cv2 && !reduce && cv2.getContext) { const ctx = cv2.getContext('2d'); let W = 0, HH = 0, vis = true, raf = 0, last = 0, sd = 7;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const stars = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd() * .5, r: .4 + rnd() * .8, p: rnd() * 6.28, s: .5 + rnd() * 1.4 }));
    const COL = ['242,165,49', '207,174,116', '242,179,84', '138,127,110', '95,227,255'];
    const mk = (first) => ({ x: rnd(), y: first ? .3 + rnd() * .75 : 1.03, r: 2.5 + rnd() * 5, v: .012 + rnd() * .03, w: rnd() * 6.28, a: .16 + rnd() * .3, c: COL[Math.floor(rnd() * (rnd() < .12 ? 5 : 4))] });
    const grains = Array.from({ length: 38 }, () => mk(true));
    const size = () => { const r = hero.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; HH = r.height; cv2.width = Math.round(W * d); cv2.height = Math.round(HH * d); ctx.setTransform(d, 0, 0, d, 0, 0); };
    const frame = (now) => { raf = requestAnimationFrame(frame); if (now - last < 32) return; const dt = Math.min(.1, (now - last) / 1000); last = now; ctx.clearRect(0, 0, W, HH); const t = now / 1000;
      for (const st of stars) { ctx.globalAlpha = .12 + .5 * (.5 + .5 * Math.sin(t * st.s + st.p)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(st.x * W, st.y * HH, st.r, 0, 6.28); ctx.fill(); }
      for (let i = 0; i < grains.length; i++) { const g = grains[i]; g.y -= g.v * dt; g.w += dt * .8; if (g.y < .22) grains[i] = mk(false);
        const fade = Math.min(1, (1.03 - g.y) * 9) * Math.min(1, (g.y - .22) * 4); const gx = (g.x + Math.sin(g.w) * .012) * W, gy = g.y * HH, gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.r); gr.addColorStop(0, `rgba(${g.c},${Math.max(0, g.a * fade).toFixed(3)})`); gr.addColorStop(1, `rgba(${g.c},0)`); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, g.r, 0, 6.28); ctx.fill(); }
      ctx.globalAlpha = 1; };
    const run = () => { cancelAnimationFrame(raf); if (vis && !document.hidden) raf = requestAnimationFrame(frame); };
    size(); new ResizeObserver(size).observe(hero); new IntersectionObserver((es) => { vis = es[0].isIntersecting; run(); }).observe(hero); document.addEventListener('visibilitychange', run); }
  // a videókártya az egér felé dől (csak egérrel)
  const card = $('#heroCard');
  if (card && fine && !reduce) { card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; card.style.transform = `perspective(1100px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg) scale(1.015)`; });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; }); }
  // néma, rövid előzetes a hős kártyájában: betöltés után indul, és csak akkor megy, ha a kártya látszik
  const pv = $('#heroPrev'), conn = navigator.connection || {}, can = (t) => !!(pv && pv.canPlayType && pv.canPlayType(t));
  const pvSrc = can('video/mp4; codecs="avc1.42E01E"') ? 'video/elozetes.mp4?v=1' : (can('video/webm; codecs="vp9"') ? 'video/elozetes.webm?v=1' : '');
  if (pv && !reduce && !conn.saveData && pvSrc) { let want = false;
    const sync = () => { if (want && !document.hidden && $('#vmodal').hidden) { const p = pv.play(); if (p && p.catch) p.catch(() => {}); } else pv.pause(); };
    pv.addEventListener('playing', () => pv.classList.add('on'), { once: true });
    const arm = () => setTimeout(() => { pv.src = pvSrc; new IntersectionObserver((es) => { want = es[0].isIntersecting; sync(); }, { threshold: .35 }).observe(pv); document.addEventListener('visibilitychange', sync);
      new MutationObserver(sync).observe($('#vmodal'), { attributes: true, attributeFilter: ['hidden'] }); }, 900);
    if (document.readyState === 'complete') arm(); else addEventListener('load', arm, { once: true }); }
  // görgetési sáv a fejléc alján
  { const bar = el('div', { cls: 'sprog', 'aria-hidden': 'true' }, $('.top'), '<i></i>').firstChild; let tk = false;
    const upd = () => { tk = false; const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${m > 0 ? clamp(scrollY / m) : 0})`; };
    addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true }); addEventListener('resize', upd); upd(); }
  // a számok felpörögnek, amikor a hős megjelenik
  if (!reduce) $$('.stat b').forEach((b, i) => { const m = /^(\d+)(.*)$/.exec(b.textContent.trim()); if (!m) return; const end = +m[1], suf = m[2], t0 = performance.now() + 700 + i * 110, dur = 1100; b.textContent = '0' + suf;
    const step = (now) => { const u = clamp((now - t0) / dur); b.textContent = Math.round(end * (1 - Math.pow(1 - u, 3))) + suf; if (u < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  // megjelenés görgetésre: a blokkok alulról úsznak be, a rácsok elemei egymás után
  const heads = $$('.shead');
  if (reduce || !('IntersectionObserver' in window)) heads.forEach(e => e.classList.add('seen'));
  else { const SEL = '.route-h, .rail, .arb, .xr-h, .xt, .shead, .blk > .bh, .blk > .lead, .blk > .prose, .blk > .wg, .vs, .duo > *, .tile, .lsg, .why .card, .harder > *, .q, #temakorok .lead, .ac, .vgrid > *, footer .fg > *';
    const vh = innerHeight, items = $$(SEL).filter(e => e.getBoundingClientRect().top > vh * .92);   // ami betöltéskor már látszik, az marad
    heads.forEach(e => { if (!items.includes(e)) e.classList.add('seen'); });
    const io = new IntersectionObserver((es) => { const now = es.filter(e => e.isIntersecting).map(e => e.target); if (!now.length) return;
      const rows = new Map(); now.forEach(e => { const k = Math.round(e.getBoundingClientRect().top / 40); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(e); });
      rows.forEach(list => list.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left).forEach((e, i) => { io.unobserve(e); e.style.setProperty('--rd', Math.min(i, 8) * 70 + 'ms'); e.classList.add('in', 'seen');
        setTimeout(() => { e.classList.remove('rise', 'in'); e.style.removeProperty('--rd'); }, 900 + Math.min(i, 8) * 70); })); }, { rootMargin: '0px 0px -7% 0px', threshold: .08 });
    items.forEach(e => { e.classList.add('rise'); io.observe(e); }); } }

/* ================= FORMÁZÁS: nem törő egységek + magyar elválasztás ================= */
const GUARD = (() => {
  const NB = '\u00A0', WJ = '\u2060', NNB = '\u202F', NBH = '\u2011';
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'svg', 'SVG', 'CANVAS', 'SELECT', 'OPTION']);
  const BLOCK = 'main p, main li, main h2, main h3, main h4, main h5, main b, main .verdict, main .vs > div, main .rv, main .tlx, main .note, main .tagline, main .stat span, main .lead, footer p, footer li, .hero-lead';
  const HYPH = 'main p, main li, main .vs > div, main .rv, main .note, main .verdict, main .tlx, main .lead, footer p, .hero-lead';
  const NOHY = 'sub, sup, code, button, label, output, td, th, .nw, h1, h2, h3, h4, h5, .chip, .pill, .kick, .mono, .tag, .bdg, .d';
  const TERMS_HU = ['talaj és szerkezet', 'teherbíró réteg', 'talajvíz-viszonyok', 'egyenlőtlen süllyedés', 'egyenlőtlen süllyedések', 'általános állékonyság', 'teherbírási határállapot', 'használhatósági határállapot', 'puha lencse', 'szerves talaj', 'szerves agyag', 'roskadékony lösz', 'térfogatváltozó agyag', 'kút- és szekrényalapok', 'cölöppel gyámolított lemezalap', 'mélyített síkalap', 'házi feladat', 'pisai torony'];
  const TERMS_EN = ['soil and structure', 'bearing stratum', 'groundwater conditions', 'differential settlement', 'differential settlements', 'overall stability', 'ultimate limit state', 'ultimate limit states', 'serviceability limit state', 'serviceability limit states', 'soft lens', 'organic soil', 'organic clay', 'collapsible loess', 'expansive clay', 'piled raft', 'raft foundation', 'shallow foundation', 'shallow foundations', 'deep foundation', 'deep foundations', 'caisson foundations', 'Leaning Tower', 'ground investigation'];
  const TERMS = EN ? TERMS_EN : TERMS_HU;
  const termRx = new RegExp('(' + TERMS.sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[ \\u00A0]')).join('|') + ')', 'giu');
  const MULT_SYM = /^(tg|ctg|sin|cos|tan|exp|ln|log)\b/;
  const NUMW_HU = /(^|[\s(\u00A0\u2060„])((?:[Kk]ét|[Hh]árom|[Nn]égy|[Öö]t|[Hh]at|[Hh]ét|[Nn]yolc|[Kk]ilenc|[Tt]íz|[Tt]izennégy|[Ee]lső|[Mm]ásodik|[Hh]armadik|[Nn]egyedik|[Mm]indkét|[Mm]indhárom|[Nn]éhány|[Ee]gyik))(?=\s\S)\s/g;
  const NUMW = EN ? /(^|[\s(\u00A0\u2060“])((?:[Tt]wo|[Tt]hree|[Ff]our|[Ff]ive|[Ss]ix|[Ss]even|[Ee]ight|[Nn]ine|[Tt]en|[Ff]irst|[Ss]econd|[Tt]hird|[Bb]oth|[Ee]ach))(?=\s\S)\s/g : NUMW_HU;
  function textPass(s) {
    if (!/[ \-–·]/.test(s)) return s;
    s = s.replace(/(^|[^\d,.])(\d{1,3}) (\d{3})(?!\d)/g, '$1$2' + NNB + '$3');
    s = s.replace(/ ([=≤≥≈→←×±<>⇒↔]) /g, NB + '$1' + NB);
    s = s.replace(/([\p{N}\p{L})\]′″°²³]) ([+−]) (?=[\p{N}\p{L}(])/gu, '$1' + NB + '$2' + NB);
    s = s.replace(/(^|[(\[„])([=≤≥≈<>±~]) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/ · (?=(\S+))/g, (m, nxt) => { const w = nxt.replace(/^[(„"]/, ''); if (/^\p{L}{3,}/u.test(w) && !MULT_SYM.test(w)) return m; return NB + '·' + NB; });
    s = s.replace(/(\d)-(\d)/g, '$1' + NBH + '$2');
    s = s.replace(/\b([A-Z]{2,5})-(\d)/g, '$1' + NBH + '$2');
    s = s.replace(/([^\s\u2060])–([^\s\u2060])/g, '$1' + WJ + '–' + WJ + '$2');
    s = s.replace(EN ? /(^|[\s(\u00A0])(e\.g\.|i\.e\.|approx\.|c\.|No\.|Fig\.|max\.|min\.|Dr\.) (?=\S)/g : /(^|[\s(\u00A0])(pl\.|kb\.|ill\.|ún\.|max\.|min\.|Dr\.) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/(^|[\s(\u00A0\u2060~≈≤≥=<>−+])(\d+(?:[,.]\d+)?\.?%?) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/(^|[\s(\u00A0\u2060~≈≤≥=<>−+])(\d+(?:[,.]\d+)?\.?%?) (?=\S)/g, '$1$2' + NB);
    for (let i = 0; i < 2; i++) s = s.replace(EN ? /(^|[\s(\u00A0\u2060“])(a|an|A|An|the|The|of|to|in|on|at|by|or|and|&) (?=\S)/g : /(^|[\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\S)/g, '$1$2' + NB);
    s = s.replace(NUMW, '$1$2' + NB);
    s = s.replace(/([\d°′″%)\]\p{Lu}])-(\p{Ll}{1,6})(?=$|[\s.,;:!?)”\u00A0\u2060])/gu, '$1' + NBH + '$2');
    s = s.replace(/(\d[\u00A0 ](?:mm|cm|m|kPa|MPa|kN|m²|m³))-(\p{Ll}{1,7})(?=$|[\s.,;:!?)”\u00A0\u2060])/gu, '$1' + NBH + '$2');
    return s;
  }
  const SHORTEND = EN ? new RegExp('(^|[\\s(\u00A0\u2060“])(a|an|A|An|the|The|of|to|in|on|at|by|or|and|e\\.g\\.|i\\.e\\.|approx\\.|\\d+(?:[.,]\\d+)?%?) $') : new RegExp('(^|[\\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És|pl\\.|kb\\.|ill\\.|ún\\.|\\d+(?:[,.]\\d+)?\\.?%?) $');
  function crossPass(nodes) { for (let i = 0; i < nodes.length - 1; i++) { const a = nodes[i], b = nodes[i + 1]; const av = a.nodeValue, bv = b.nodeValue; if (!av || !bv) continue;
    if (av.endsWith(' ') && /^\S/.test(bv) && SHORTEND.test(av)) a.nodeValue = av.slice(0, -1) + NB;
    const ms = /^ ([=≤≥≈→←×±<>⇒+−/]) /.exec(b.nodeValue); if (ms && /\S$/.test(a.nodeValue)) b.nodeValue = NB + ms[1] + NB + b.nodeValue.slice(3);
    const me = / ([=≤≥≈→←×±<>⇒+−/]) $/.exec(a.nodeValue); if (me && /^\S/.test(b.nodeValue)) a.nodeValue = a.nodeValue.slice(0, -3) + NB + me[1] + NB; } }
  function bindPositions(full, cpl = 70) {
    const bind = new Set(); const segMax = Math.max(14, Math.min(38, 0.42 * cpl)), parMax = Math.max(10, Math.min(24, 0.30 * cpl));
    const mark = (a, b) => { for (let i = a; i < b; i++) if (full[i] === ' ') bind.add(i); };
    const sepRx = / · |; | – /g; let last = 0, m, lastSep = ''; const segs = [];
    while ((m = sepRx.exec(full))) { segs.push([last, m.index, lastSep, m[0]]); last = m.index + m[0].length; lastSep = m[0]; } segs.push([last, full.length, lastSep, '']);
    if (segs.length > 1) for (const [a, b, before, after] of segs) { const t = full.slice(a, b).replace(/[\u2060\u00AD]/g, '').trim(); const dashOnly = (before === ' – ' || before === '') && (after === ' – ' || after === '') && (before || after); const lim = dashOnly ? Math.min(22, segMax) : segMax; if (t.length > 0 && t.length < lim) mark(a, b); }
    const pr = /\(([^()]{1,30})\)/g; while ((m = pr.exec(full))) { if (m[0].replace(/[\u2060\u00AD]/g, '').length <= parMax) mark(m.index, m.index + m[0].length); }
    // szakkifejezés-kötés csak akkor, ha a kifejezés elfér egy sor felében (nagy betűs címben, keskeny hasábban nem köt – különben kilógna)
    termRx.lastIndex = 0; while ((m = termRx.exec(full))) if (m[0].length <= 0.5 * cpl) mark(m.index, m.index + m[0].length);
    return bind;
  }
  function textNodes(root) { const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(n) { let p = n.parentNode; while (p && p !== root) { if (SKIP.has(p.nodeName)) return NodeFilter.FILTER_REJECT; p = p.parentNode; } return NodeFilter.FILTER_ACCEPT; } }); let n; while ((n = w.nextNode())) out.push(n); return out; }
  let hyph = null; const done = new WeakMap();
  function processBlock(el) {
    if (!el.isConnected) return; if (el.closest('svg')) return; const cur = el.textContent; if (done.get(el) === cur) return;
    const nodes = textNodes(el); for (const n of nodes) { const v = textPass(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } crossPass(nodes);
    const full = nodes.map(n => n.nodeValue).join(''); const fs = parseFloat(getComputedStyle(el).fontSize) || 16; const cpl = el.clientWidth > 40 ? el.clientWidth / (fs * 0.52) : 70;
    const bind = bindPositions(full, cpl);
    if (bind.size) { let off = 0; for (const n of nodes) { const v = n.nodeValue; let o = '', ch = false; for (let i = 0; i < v.length; i++) { if (v[i] === ' ' && bind.has(off + i)) { o += NB + WJ; ch = true; } else o += v[i]; } off += v.length; if (ch) n.nodeValue = o; } }
    if (hyph && el.matches(HYPH)) { for (const n of textNodes(el)) { if (n.parentElement && n.parentElement.closest(NOHY) && n.parentElement.closest(NOHY) !== el) continue; const parts = n.nodeValue.split(/( )/); let ch = false;
      for (let i = 0; i < parts.length; i += 2) { const t = parts[i]; if (!t || !/\p{L}{6,}/u.test(t)) continue; const clean = t.replace(/[\u00AD\u200B]/g, ''); let hh;
        if (t.includes(WJ)) { const vis = clean.replace(/[\u2060]/g, ''); if (vis.length <= 16 || /^\(.*\)[.,;:!?]*$/.test(vis)) continue; const k = Math.max(clean.lastIndexOf('\u00A0'), clean.lastIndexOf(WJ)); const tail = clean.slice(k + 1); if (!/\p{L}{6,}/u.test(tail)) continue; hh = clean.slice(0, k + 1) + hyph(tail); } else hh = hyph(clean);
        hh = hh.replace(/\u200B/g, ''); if (hh !== t) { parts[i] = hh; ch = true; } } if (ch) n.nodeValue = parts.join(''); } }
    done.set(el, el.textContent);
  }
  let obs = null, pend = new Set(), sched = false;
  function observe() { obs.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  function run(root = document.body) { const set = new Set(); if (root.matches && root.matches(BLOCK)) set.add(root); $$(BLOCK, root).forEach(e => set.add(e)); if (obs) obs.disconnect(); set.forEach(processBlock); if (obs) { obs.takeRecords(); observe(); } }
  function flush() { sched = false; const roots = Array.from(pend); pend.clear(); if (obs) obs.disconnect(); for (const r of roots) { if (!r.isConnected) continue; const blk = r.closest ? r.closest(BLOCK) : null; if (blk) processBlock(blk); if (r.querySelectorAll) $$(BLOCK, r).forEach(processBlock); } if (obs) { obs.takeRecords(); observe(); } }
  function start() { run(); obs = new MutationObserver(recs => { for (const r of recs) { const t = r.type === 'characterData' ? r.target.parentElement : r.target; if (t && !(t.closest && t.closest('svg'))) pend.add(t); } if (pend.size && !sched) { sched = true; requestAnimationFrame(flush); } }); observe();
    const H = window.Hyphenopoly, HK = EN ? 'en-gb' : 'hu'; if (H && H.hyphenators && H.hyphenators[HK]) H.hyphenators[HK].then(fn => { hyph = s => fn(s); $$(HYPH).forEach(e => done.delete(e)); run(); window.__fmtHyphReady = true; }).catch(() => {}); }
  return { start, run };
})();

/* RAG3 – lyukas sorkizárt blokk tartaléka (formázás skill): (1) ha a szép tördelés (text-wrap: pretty) lyukas,
   előbb sima tördeléssel (text-wrap: wrap, .twr) próbálja – a blokk sorkizárt marad; (2) csak ha így is lyukas,
   balra zárt lesz (.rag). Az összetartozó egységek (NBSP/U+2060 kötések) érintetlenek maradnak.
   Idempotens: a döntést szélesség + szöveg szerint megjegyzi, ismételt futáskor nem mér újra. */
const RAG3 = (() => {
  try { const st = document.createElement('style'); st.textContent = '.twr{text-wrap:wrap!important}'; document.head.appendChild(st); } catch (e) {}
  const memo = new WeakMap();
  const sig = (el) => el.textContent;   // a teljes szöveg (az elválasztás után is újramér)
  function bad(el, strict) {
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16; const all = document.createRange(); all.selectNodeContents(el); const rs = all.getClientRects(); if (rs.length < 2) return false;
    let lastTop = -1e9; for (const r of rs) if (r.width && r.top > lastTop) lastTop = r.top; let big = 0, mid = 0;
    // sima tördelésnél (strict): egy nem utolsó, nagyon rövid sor (pl. hosszú, nem törhető képlet előtt) is rossz – a sorokat
    // függőleges átfedés szerint vonjuk össze, így az alsó/felső index nem számít külön sornak; <br>-es blokknál nem vizsgáljuk
    if (strict && !el.querySelector('br')) { const L = []; for (const r of rs) { if (!r.width || !r.height) continue; let l = L.find((q) => Math.min(q.b, r.bottom) - Math.max(q.t, r.top) > 0.5 * Math.min(q.b - q.t, r.height));
      if (!l) L.push({ t: r.top, b: r.bottom, l: r.left, r: r.right }); else { l.t = Math.min(l.t, r.top); l.b = Math.max(l.b, r.bottom); l.l = Math.min(l.l, r.left); l.r = Math.max(l.r, r.right); } }
      L.sort((a, b) => a.t - b.t); for (let i = 0; i < L.length - 1; i++) if (L[i].r - L[i].l < el.clientWidth * 0.35) return true; }
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const t = n.nodeValue; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c !== ' ' && c !== '\u00A0') continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const b = r.getBoundingClientRect(); if (!b.width || b.top >= lastTop - 2) continue; if (b.width > fs * 1.15) big++; else if (b.width > fs * 0.9) mid++; } }
    return big > 0 || mid >= 2;
  }
  function check(el) {
    if (!el || !el.isConnected || !el.offsetParent) return;
    const w = el.clientWidth, s = sig(el), m = memo.get(el);
    if (m && m.w === w && m.s === s) { el.classList.toggle('twr', m.res === 'twr'); el.classList.toggle('rag', m.res === 'rag'); return; }
    el.classList.remove('rag', 'twr'); let res = 'ok';
    if (getComputedStyle(el).textAlign === 'justify' && bad(el)) { el.classList.add('twr'); res = 'twr'; if (bad(el, true)) { el.classList.remove('twr'); el.classList.add('rag'); res = 'rag'; } }
    memo.set(el, { w, s, res });
  }
  return { check };
})();

const RAG = (() => {
  const SEL = 'main p, main li, main .vs > div, main .rv, main .note, main .verdict, main .tlx, footer p, .hero-lead';
  const check = (el) => RAG3.check(el);
  const run = () => $$(SEL).forEach(e => { if (e.offsetParent || e.closest('.vmodal')) check(e); });
  let tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(run, 250); });
  document.addEventListener('click', () => { clearTimeout(tm); tm = setTimeout(run, 120); });
  return { run };
})();
GUARD.start();
setTimeout(() => RAG.run(), 400);
{ const iv = setInterval(() => { if (window.__fmtHyphReady) { clearInterval(iv); requestAnimationFrame(() => { RAG.run(); window.__ragDone = true; }); } }, 100); setTimeout(() => clearInterval(iv), 8000); }
})();
