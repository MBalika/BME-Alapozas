/* „Áll vagy dől?” – a játék: jelenet (SVG), fúrások, alapozás-választó, építés és értékelés. A számítás: CORE (core.js); a szövegek: L.T (build.py). */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EN = L.lang === 'en', T = L.T, C = CORE;
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const h = (tag, at = {}, par, txt) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; if (par) par.appendChild(e); return e; };
  const fmt = (v, n = 1) => (+v).toFixed(n).replace('.', T.dec).replace('-', '−');
  const NB = ' ', M = (v) => fmt(v, 2) + NB + T.mft;
  const tpl = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, SP = RM ? 0.05 : 1;   // csökkentett mozgásnál az animáció lépései szinte azonnaliak

  /* ---- állapot ---- */
  const KEY = 'avd-v1'; let SAVE = { stars: {} }; try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.stars) SAVE = o; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) {} };
  const S = { lv: C.LEVELS[0], phase: 1, bor: [], depth: 6, sel: -1, d: { type: 'strip', B: 1, D: 1, L: 8, a: 3 }, busy: false, res: null };
  const design = () => S.d.type === 'strip' ? { type: 'strip', B: S.d.B, D: S.d.D } : S.d.type === 'raft' ? { type: 'raft', D: Math.min(S.d.D, 3) } : { type: 'pile', L: S.d.L, a: S.d.a };

  /* ---- talajok megjelenése ---- */
  const COL = { fill: '#a39281', sandL: '#f1e0a9', sandM: '#e7ca80', sandD: '#d7ae5b', grav: '#c59f6c', clayS: '#a3b6c5', clayM: '#8a9dad', clayH: '#6d7f90', peat: '#4d3b2e' };
  const PAT = { fill: 'pFill', sandL: 'pSand', sandM: 'pSand', sandD: 'pSandD', grav: 'pGrav', clayS: 'pClay', clayM: 'pClay', clayH: 'pClayH', peat: 'pPeat' };
  const props = (s) => { const o = C.SOIL[s]; return (o.cu != null ? `c<sub>u</sub>${NB}=${NB}${o.cu}${NB}kPa` : `φ′${NB}=${NB}${o.phi}°`) + ` · E<sub>s</sub>${NB}=${NB}${fmt(o.Es, o.Es < 10 && o.Es % 1 ? 1 : 0)}${NB}MPa`; };

  /* ---- a jelenet: 40 m széles telek, 25 képpont / m; GY: a terepszint y-ja ---- */
  const sc = $('#sc'), VW = 1000, SC = 25; let GY = 300, VH = 740, G = {}, FS = 1;   // FS: betűméret-szorzó – keskeny kijelzőn a rajz kicsi, a feliratok ettől maradnak olvashatók
  const fsCalc = () => Math.max(1, Math.min(1.9, 640 / Math.max(200, sc.getBoundingClientRect().width || 760)));
  const X = (m) => m * SC, Y = (z) => GY + z * SC;
  const bH = (lv) => lv.n * (lv.id === 'pisa' ? 3.1 : 2.8) + (lv.id === 'pisa' ? 4.2 : 2.4);   // az épület magassága tetővel [m]
  const THEME = { homok: ['#f6e7c8', '#c9573f', 'gable'], viz: ['#dfe6ea', '#4f6d86', 'shed'], feltoltes: ['#f3d9c4', '#8c5a3c', 'gable'], lencse: ['#e9eef3', '#5b7187', 'flat'], agyag: ['#efe6da', '#7a8794', 'flat'], pisa: ['#f4efe2', '#b9a988', 'spire'] };

  function defs(svg) { const d = h('defs', {}, svg);
    const lg = (id, st, a = { x1: 0, y1: 0, x2: 0, y2: 1 }) => { const g = h('linearGradient', { id, ...a }, d); st.forEach(([o, c, op = 1]) => h('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, g)); };
    lg('gSky', [[0, '#8fcbf0'], [.7, '#d9effa'], [1, '#f1f8f6']]); lg('gDeep', [[0, '#000', 0], [1, '#000', .28]]); lg('gConc', [[0, '#d9d6cf'], [1, '#aaa69c']], { x1: 0, y1: 0, x2: 1, y2: 0 }); lg('gShade', [[0, '#fff', .25], [.5, '#fff', 0], [1, '#000', .16]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    const pat = (id, w, hh, f) => { const p = h('pattern', { id, width: w, height: hh, patternUnits: 'userSpaceOnUse' }, d); f(p); };
    pat('pSand', 12, 12, p => { h('circle', { cx: 3, cy: 3, r: 1.1, fill: 'rgba(90,60,20,.35)' }, p); h('circle', { cx: 9, cy: 8, r: 1, fill: 'rgba(90,60,20,.28)' }, p); });
    pat('pSandD', 9, 9, p => { h('circle', { cx: 2.5, cy: 2.5, r: 1.2, fill: 'rgba(80,50,10,.42)' }, p); h('circle', { cx: 7, cy: 6.5, r: 1.1, fill: 'rgba(80,50,10,.34)' }, p); });
    pat('pGrav', 22, 18, p => { h('ellipse', { cx: 6, cy: 6, rx: 4.2, ry: 3, fill: 'rgba(255,240,210,.5)', stroke: 'rgba(70,45,15,.5)', 'stroke-width': 1 }, p); h('ellipse', { cx: 16, cy: 13, rx: 3.4, ry: 2.6, fill: 'rgba(255,240,210,.42)', stroke: 'rgba(70,45,15,.45)', 'stroke-width': 1 }, p); h('circle', { cx: 17, cy: 4, r: 1.2, fill: 'rgba(70,45,15,.4)' }, p); });
    pat('pClay', 20, 10, p => { h('path', { d: 'M2 3 h8 M12 8 h7', stroke: 'rgba(30,45,60,.42)', 'stroke-width': 1.4 }, p); });
    pat('pClayH', 16, 8, p => { h('path', { d: 'M1 2.5 h8 M9 6.5 h7', stroke: 'rgba(15,25,40,.55)', 'stroke-width': 1.6 }, p); });
    pat('pPeat', 18, 9, p => { h('path', { d: 'M0 5 q4.5 -5 9 0 t9 0', stroke: 'rgba(235,215,180,.5)', fill: 'none', 'stroke-width': 1.4 }, p); });
    pat('pFill', 18, 16, p => { h('path', { d: 'M3 4 l4 -2 l2 4 z M11 12 l5 -1 l-2 4 z', fill: 'rgba(60,45,35,.45)' }, p); h('rect', { x: 12, y: 3, width: 3, height: 2, fill: 'rgba(200,90,60,.6)' }, p); });
    pat('pFog', 26, 26, p => { h('rect', { width: 26, height: 26, fill: '#2a323d' }, p); h('path', { d: 'M-4 30 L30 -4 M-4 17 L17 -4 M9 30 L30 9', stroke: '#343e4b', 'stroke-width': 3 }, p); });
    pat('pInt', 8, 8, p => { h('path', { d: 'M-2 10 L10 -2', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 1.6 }, p); });
    pat('pGrass', 14, 8, p => { h('path', { d: 'M2 8 l1 -5 l1 5 M9 8 l1 -4 l1 4', stroke: '#3f8a45', 'stroke-width': 1.2, fill: 'none' }, p); });
    return d; }
  const soilRect = (g, s, x, y, w, hh, op = 1) => { if (hh <= 0) return; h('rect', { x, y, width: w, height: hh, fill: COL[s], opacity: op }, g); h('rect', { x, y, width: w, height: hh, fill: `url(#${PAT[s]})`, opacity: op }, g); };
  const person = (g, x, y, sc2 = 1, vest = '#ff7a1a', flip = 1) => { const p = h('g', { transform: `translate(${x} ${y}) scale(${sc2 * flip} ${sc2})` }, g); h('rect', { x: -4, y: -19, width: 8, height: 11, rx: 2, fill: vest }, p); h('rect', { x: -4, y: -9, width: 3.4, height: 9, fill: '#2f3b4c' }, p); h('rect', { x: .6, y: -9, width: 3.4, height: 9, fill: '#2f3b4c' }, p); h('circle', { cx: 0, cy: -23, r: 3.4, fill: '#e9b88f' }, p); h('path', { d: 'M-4 -24 a4 4 0 0 1 8 0 z', fill: '#ffd21f' }, p); h('rect', { x: 3.5, y: -18, width: 6, height: 2.6, rx: 1.3, fill: vest }, p); return p; };
  const tree = (g, x, y, k = 1) => { const t = h('g', { transform: `translate(${x} ${y}) scale(${k})` }, g); h('rect', { x: -3, y: -26, width: 6, height: 26, fill: '#7a5636' }, t); h('circle', { cx: 0, cy: -40, r: 18, fill: '#4f9a52' }, t); h('circle', { cx: -11, cy: -30, r: 12, fill: '#5cab5c' }, t); h('circle', { cx: 11, cy: -31, r: 13, fill: '#458c49' }, t); };

  function scene() { const lv = S.lv; sc.innerHTML = ''; FS = fsCalc(); GY = Math.round((bH(lv) + 4.5) * SC); VH = GY + C.ZMAX * SC + 8; sc.setAttribute('viewBox', `0 0 ${VW} ${VH}`); defs(sc); G = {};
    const XA = -400, XW = VW + 800;   // a rajz a 0…1000 sávon túl is folytatódik (ég, dombok, talaj), hogy magas jelenetnél a doboz két széle se maradjon üresen
    h('rect', { x: XA, y: 0, width: XW, height: GY, fill: 'url(#gSky)' }, sc);
    h('circle', { cx: 880, cy: 84, r: 34, fill: '#ffe27a' }, sc); h('circle', { cx: 880, cy: 84, r: 52, fill: '#ffe27a', opacity: .28 }, sc);
    const cl = h('g', { class: 'cloud', opacity: .92 }, sc); [[120, 70, 1], [420, 120, .8], [650, 50, .7]].forEach(([x, y, k]) => { const c = h('g', { transform: `translate(${x} ${y}) scale(${k})` }, cl); h('ellipse', { cx: 0, cy: 0, rx: 46, ry: 17, fill: '#fff' }, c); h('ellipse', { cx: -18, cy: -12, rx: 22, ry: 15, fill: '#fff' }, c); h('ellipse', { cx: 16, cy: -15, rx: 26, ry: 18, fill: '#fff' }, c); });
    // háttér: dombok, távoli házak, fák
    h('path', { d: `M${XA} ${GY} L${XA} ${GY - 46} L0 ${GY - 46} Q150 ${GY - 96} 330 ${GY - 52} T640 ${GY - 60} T1000 ${GY - 40} L${XA + XW} ${GY - 40} L${XA + XW} ${GY} Z`, fill: '#b9dcc0' }, sc);
    h('path', { d: `M${XA} ${GY} L${XA} ${GY - 22} L0 ${GY - 22} Q220 ${GY - 54} 470 ${GY - 26} T1000 ${GY - 30} L${XA + XW} ${GY - 30} L${XA + XW} ${GY} Z`, fill: '#9ccc9f' }, sc);
    const deco = h('g', {}, sc); const fx = (x) => x < S.lv.x0 - 3 || x > S.lv.x0 + S.lv.W + 3;
    [[2.2, 1], [5.4, .8], [36.2, .9], [38.6, 1.05], [9, .7], [32.5, .75]].forEach(([x, k]) => { if (fx(x)) tree(deco, X(x), GY, k); });
    if (lv.id === 'viz') { h('path', { d: `M0 ${GY - 14} H${X(4.2)} q10 2 14 14 H0 Z`, fill: '#5aa7d8' }, deco); h('path', { d: `M8 ${GY - 8} h30 M54 ${GY - 5} h22`, stroke: '#e8f6ff', 'stroke-width': 2, 'stroke-linecap': 'round' }, deco); }
    // talaj: a valódi rétegek (alul), rajta a „köd”, azon az értelmezett szelvény és a fúrások
    G.truth = h('g', {}, sc); const ids = lv.layers.map(l => l.s), xs = []; for (let x = -16; x <= 56.001; x += 0.5) xs.push(x);
    const bot = (i, x) => lv.layers[i].bot ? clamp(C.poly(lv.layers[i].bot, x), 0, C.ZMAX) : C.ZMAX;
    ids.forEach((s, i) => { const top = xs.map(x => [X(x), Y(i ? bot(i - 1, x) : 0)]), bt = xs.map(x => [X(x), Y(bot(i, x))]).reverse(); const pts = top.concat(bt).map(p => p.join(',')).join(' ');
      h('polygon', { points: pts, fill: COL[s] }, G.truth); h('polygon', { points: pts, fill: `url(#${PAT[s]})` }, G.truth); if (i < ids.length - 1) h('polyline', { points: bt.map(p => p.join(',')).join(' '), fill: 'none', stroke: 'rgba(27,31,36,.55)', 'stroke-width': 1.6 }, G.truth); });
    if (lv.zw < C.ZMAX) { h('line', { x1: XA, x2: XA + XW, y1: Y(lv.zw), y2: Y(lv.zw), stroke: '#1f6fd0', 'stroke-width': 3, 'stroke-dasharray': '14 7' }, G.truth); h('rect', { x: XA, y: Y(lv.zw), width: XW, height: VH - Y(lv.zw), fill: '#2a78d6', opacity: .1 }, G.truth); }
    h('rect', { x: XA, y: GY, width: XW, height: VH - GY, fill: 'url(#gDeep)' }, G.truth);
    G.fog = h('g', { class: 'fade' }, sc); h('rect', { x: XA, y: GY, width: XW, height: VH - GY, fill: 'url(#pFog)' }, G.fog);
    for (let i = 0; i < 14; i++) { const x = 60 + (i * 137) % 900, y = GY + 70 + (i * 97) % (VH - GY - 110); h('text', { x, y, class: 'fogt', 'font-size': 30 + (i % 3) * 12, opacity: .5 }, G.fog, '?'); }
    G.interp = h('g', { class: 'fade' }, sc); G.cols = h('g', {}, sc);
    // felszín: fű, mélységlépték
    h('rect', { x: XA, y: GY - 5, width: XW, height: 10, fill: '#57a55a' }, sc); h('rect', { x: XA - 2, y: GY - 12, width: XW, height: 9, fill: 'url(#pGrass)' }, sc);
    const ax = h('g', {}, sc); for (let z = 5; z <= 15; z += 5) { h('line', { x1: 0, x2: 14, y1: Y(z), y2: Y(z), stroke: '#fffdf7', 'stroke-width': 3 }, ax); h('text', { x: 18, y: Y(z) + 7 * FS, 'font-size': 20 * FS }, ax, `${z} m`); }
    G.plan = h('g', {}, sc); G.move = h('g', {}, sc); G.found = h('g', {}, G.move); G.bld = h('g', {}, G.move); G.fx = h('g', {}, sc); G.ann = h('g', {}, sc); G.ui = h('g', {}, sc);
    drawCols(); drawPlan(); }

  /* ---- fúrások és az értelmezett szelvény ---- */
  function drawCols(anim = -1) { const lv = S.lv, P = C.truth(lv); G.cols.innerHTML = ''; G.interp.innerHTML = '';
    if (S.bor.length) { const I = C.interp(lv, S.bor), xa = Math.max(0, I.B[0].x - 3), xb = Math.min(40, I.B[I.B.length - 1].x + 3), st = 0.25;
      for (let x = xa; x < xb - 1e-6; x += st) { const xm = x + st / 2, dmax = I.depth(xm), out = xm < I.B[0].x || xm > I.B[I.B.length - 1].x; const op = out ? 0.5 : 0.85;
        h('rect', { x: X(x), y: GY, width: X(st) + .6, height: dmax * SC, fill: '#f3ead6' }, G.interp);
        for (const l of I.col(xm)) { const t = Math.min(l.top, dmax), b = Math.min(l.bot, dmax); soilRect(G.interp, l.s, X(x), Y(t), X(st) + .6, (b - t) * SC, op); }
        if (I.zw != null && dmax > I.zw) h('rect', { x: X(x), y: Y(I.zw) - 1.5, width: X(st) + .6, height: 3, fill: '#1f6fd0', opacity: .8 }, G.interp); }
      const dm = (x) => Y(I.depth(x)); let dpts = ''; for (let x = xa; x <= xb + 1e-6; x += st) dpts += `${X(x)},${dm(Math.min(x + 1e-3, xb - 1e-3))} `;
      h('polygon', { points: `${X(xa)},${GY} ${dpts} ${X(xb)},${GY}`, fill: 'url(#pInt)' }, G.interp); }
    S.bor.forEach((b, i) => { const g = h('g', { class: i === anim ? 'col' : '', 'data-i': i, style: 'cursor:pointer' }, G.cols), w = 1.5 * SC, x = X(b.x) - w / 2;
      for (const l of P.col(b.x)) { const t = Math.min(l.top, b.d), bt = Math.min(l.bot, b.d); soilRect(g, l.s, x, Y(t), w, (bt - t) * SC); if (bt < b.d - 1e-6) h('line', { x1: x, x2: x + w, y1: Y(bt), y2: Y(bt), stroke: '#1b1f24', 'stroke-width': 1.6 }, g); }
      h('rect', { x, y: GY, width: w, height: b.d * SC, fill: 'none', stroke: i === S.sel ? '#ffc21a' : '#1b1f24', 'stroke-width': i === S.sel ? 5 : 3, rx: 2 }, g);
      if (lv.zw < b.d) { h('path', { d: `M${x - 9} ${Y(lv.zw) - 11} h18 l-9 11 z`, fill: '#1f6fd0', stroke: '#fff', 'stroke-width': 1.5 }, g); h('line', { x1: x, x2: x + w, y1: Y(lv.zw), y2: Y(lv.zw), stroke: '#1f6fd0', 'stroke-width': 3 }, g); }
      const f = h('g', { transform: `translate(${X(b.x)} ${GY}) scale(${FS}) translate(${-X(b.x)} ${-GY})` }, G.cols); h('line', { x1: X(b.x), x2: X(b.x), y1: GY - 30, y2: GY, stroke: '#1b1f24', 'stroke-width': 3 }, f); h('rect', { x: X(b.x) - 1, y: GY - 46, width: 34, height: 20, rx: 4, fill: '#ffc21a', stroke: '#1b1f24', 'stroke-width': 2.5 }, f); const t = h('text', { x: X(b.x) + 16, y: GY - 31, 'font-size': 15, 'text-anchor': 'middle' }, f, T.bshort + (i + 1)); t.style.stroke = 'none'; });
    soils(); }
  function rig(xm) { const g = h('g', { class: 'rig' }, G.ui), x = X(xm); h('path', { d: `M${x - 22} ${GY} L${x} ${GY - 86} L${x + 22} ${GY} M${x - 12} ${GY - 40} H${x + 12}`, stroke: '#1b1f24', 'stroke-width': 5, fill: 'none', 'stroke-linejoin': 'round' }, g); h('rect', { x: x - 3, y: GY - 80, width: 6, height: 80, fill: '#d4412f' }, g); h('rect', { x: x - 9, y: GY - 58, width: 18, height: 12, rx: 2, fill: '#ffc21a', stroke: '#1b1f24', 'stroke-width': 2 }, g); person(g, x + 34, GY - 2, 1.25, '#ff7a1a', -1); person(g, x - 36, GY - 2, 1.25, '#d8e04a', 1); setTimeout(() => g.remove(), 1600); }
  function soils() { const box = $('#soils'), P = C.truth(S.lv), seen = []; const add = (s) => { if (!seen.includes(s)) seen.push(s); };
    if (S.phase === 4) S.lv.layers.forEach(l => add(l.s)); else S.bor.forEach(b => P.col(b.x).forEach(l => { if (l.top < b.d) add(l.s); }));
    const order = S.lv.layers.map(l => l.s).filter((s, i, a) => a.indexOf(s) === i).filter(s => seen.includes(s));
    const gwk = S.lv.zw < C.ZMAX && (S.phase === 4 || S.bor.some(b => b.d > S.lv.zw));
    const htm = order.length ? order.map(s => `<span><i style="background:${COL[s]}"></i>${T.soil[s]} <em>${props(s)}</em></span>`).join('') + (gwk ? `<span><i style="background:#1f6fd0"></i>${T.gw} <em>${fmt(S.lv.zw, 1)}${NB}m</em></span>` : '') : `<em>${T.soils_none}</em>`; if (box.innerHTML !== htm) box.innerHTML = htm; }

  /* ---- az alapozás és az épület rajza ---- */
  function foundShape(g, plan) { const lv = S.lv, d = design(), [xl, xr] = C.walls(lv); const st = plan ? { fill: 'rgba(255,194,26,.18)', stroke: '#ffc21a', 'stroke-width': 3, 'stroke-dasharray': '8 5' } : { fill: 'url(#gConc)', stroke: '#1b1f24', 'stroke-width': 2.5 };
    const r = (x0, z0, x1, z1, rx = 0) => h('rect', { x: X(x0), y: Y(z0), width: X(x1 - x0), height: (z1 - z0) * SC, rx, ...st }, g);
    if (d.type === 'strip') [xl, xr].forEach(x => { r(x - 0.22, 0, x + 0.22, Math.max(0.1, d.D - 0.5)); r(x - d.B / 2, d.D - 0.5, x + d.B / 2, d.D, 2); });
    else if (d.type === 'raft') { if (d.D > 1.05) { if (!plan) h('rect', { x: X(xl), y: Y(0), width: X(lv.W), height: (d.D - 0.6) * SC, fill: '#c9d3da' }, g); r(xl - 0.25, 0, xl + 0.25, d.D - 0.6); r(xr - 0.25, 0, xr + 0.25, d.D - 0.6); } else { r(xl - 0.22, 0, xl + 0.22, Math.max(0.05, d.D - 0.6)); r(xr - 0.22, 0, xr + 0.22, Math.max(0.05, d.D - 0.6)); } r(xl - 0.5, d.D - 0.6, xr + 0.5, d.D, 2); }
    else [xl, xr].forEach(x => { r(x - C.PD / 2, C.CAP, x + C.PD / 2, d.L, 8); r(x - 0.75, 0, x + 0.75, C.CAP, 2); }); }
  function building(g) { const lv = S.lv, [wall, roofc, rt] = THEME[lv.id], sh = lv.id === 'pisa' ? 3.1 : 2.8, x0 = X(lv.x0 - 0.25), w = X(lv.W + 0.5); const out = [];
    for (let i = 0; i < lv.n; i++) { const s = h('g', { class: 'storey pre' }, g), y = GY - (i + 1) * sh * SC, hh = sh * SC; h('rect', { x: x0, y, width: w, height: hh + .5, fill: wall, stroke: '#1b1f24', 'stroke-width': 2.5 }, s); h('rect', { x: x0, y, width: w, height: hh, fill: 'url(#gShade)' }, s);
      const nw = lv.id === 'pisa' ? 2 : Math.max(3, Math.round(lv.W / 2.4)), ww = lv.id === 'pisa' ? 30 : 34, wh = hh * 0.46; for (let j = 0; j < nw; j++) { const wx = x0 + (j + 0.5) * w / nw - ww / 2, wy = y + hh * 0.27; if (i === 0 && j === Math.floor(nw / 2) && lv.id !== 'viz') h('rect', { x: wx + 2, y: y + hh * 0.22, width: ww - 4, height: hh * 0.78, fill: '#6b4a32', stroke: '#1b1f24', 'stroke-width': 2 }, s); else if (lv.id === 'pisa') h('path', { d: `M${wx} ${wy + wh} V${wy + 10} a${ww / 2} ${ww / 2} 0 0 1 ${ww} 0 V${wy + wh} z`, fill: '#4c5b6b', stroke: '#1b1f24', 'stroke-width': 2 }, s); else if (lv.id === 'viz') h('rect', { x: wx, y: y + hh * 0.18, width: ww, height: hh * 0.2, fill: '#9ec9e6', stroke: '#1b1f24', 'stroke-width': 2 }, s); else { h('rect', { x: wx, y: wy, width: ww, height: wh, fill: (i * 3 + j) % 5 === 0 ? '#ffe9a6' : '#9ec9e6', stroke: '#1b1f24', 'stroke-width': 2 }, s); h('line', { x1: wx + ww / 2, x2: wx + ww / 2, y1: wy, y2: wy + wh, stroke: '#1b1f24', 'stroke-width': 1.5 }, s); } }
      if (lv.id === 'viz') h('rect', { x: x0 + w * 0.36, y: y + hh * 0.42, width: w * 0.28, height: hh * 0.58, fill: '#7d8b97', stroke: '#1b1f24', 'stroke-width': 2 }, s);
      out.push(s); }
    const r = h('g', { class: 'storey pre' }, g), ty = GY - lv.n * sh * SC, st = { fill: roofc, stroke: '#1b1f24', 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    if (rt === 'gable') h('path', { d: `M${x0 - 14} ${ty} L${x0 + w / 2} ${ty - 2.3 * SC} L${x0 + w + 14} ${ty} Z`, ...st }, r); else if (rt === 'shed') h('path', { d: `M${x0 - 12} ${ty} L${x0 - 12} ${ty - 1.1 * SC} L${x0 + w + 12} ${ty - 2.2 * SC} L${x0 + w + 12} ${ty} Z`, ...st }, r);
    else if (rt === 'flat') { h('rect', { x: x0 - 8, y: ty - 16, width: w + 16, height: 16, ...st }, r); h('rect', { x: x0 + w * 0.62, y: ty - 16 - 1.5 * SC, width: 46, height: 1.5 * SC, fill: '#8c98a3', stroke: '#1b1f24', 'stroke-width': 2.5 }, r); }
    else { h('rect', { x: x0 + 14, y: ty - 1.6 * SC, width: w - 28, height: 1.6 * SC, fill: THEME.pisa[0], stroke: '#1b1f24', 'stroke-width': 2.5 }, r); h('path', { d: `M${x0 + w / 2 - 16} ${ty} v-22 a16 16 0 0 1 32 0 v22 z`, fill: '#4c5b6b', stroke: '#1b1f24', 'stroke-width': 2 }, r); h('path', { d: `M${x0 + 6} ${ty - 1.6 * SC} L${x0 + w / 2} ${ty - 4.1 * SC} L${x0 + w - 6} ${ty - 1.6 * SC} Z`, ...st }, r); h('line', { x1: x0 + w / 2, x2: x0 + w / 2, y1: ty - 4.1 * SC, y2: ty - 4.1 * SC - 18, stroke: '#1b1f24', 'stroke-width': 3 }, r); }
    out.push(r); return out; }
  function drawPlan() { G.plan.innerHTML = ''; if (S.phase > 2) return; const lv = S.lv, hh = bH(lv) * SC;
    h('rect', { x: X(lv.x0 - 0.25), y: GY - hh, width: X(lv.W + 0.5), height: hh, fill: 'rgba(255,255,255,.28)', stroke: '#1b1f24', 'stroke-width': 2.5, 'stroke-dasharray': '10 7', rx: 4 }, G.plan);
    const t = h('text', { x: X(lv.x0 + lv.W / 2), y: GY - hh / 2 + 8, 'font-size': 24 * Math.min(FS, 1.45), 'text-anchor': 'middle' }, G.plan, T.lv[lv.id].bld);
    if (t.getComputedTextLength && t.getComputedTextLength() > X(lv.W) - 10) { t.textContent = ''; const w = T.lv[lv.id].bld.split(' '), m = Math.ceil(w.length / 2); [w.slice(0, m).join(' '), w.slice(m).join(' ')].forEach((s, i) => h('tspan', { x: X(lv.x0 + lv.W / 2), dy: i ? 28 * Math.min(FS, 1.45) : -10 }, t, s)); const tw = t.getComputedTextLength ? Math.max(...[...t.children].map(c => c.getComputedTextLength())) : 0; if (tw > X(lv.W) - 24) { const k = (X(lv.W) - 24) / tw; t.setAttribute('font-size', 24 * Math.min(FS, 1.45) * k); t.children[1].setAttribute('dy', 28 * Math.min(FS, 1.45) * k); } }
    if (S.phase === 2) foundShape(G.plan, true); }

  /* ---- becslés (a fúrásokból értelmezett szelvényen) és költség ---- */
  const est = () => { if (!S.bor.length) return null; const I = C.interp(S.lv, S.bor), d = design(), r = C.evaluate(I, S.lv, d); if (!r) return null; const [xl, xr] = C.walls(S.lv);
    const reach = Math.max(r.L.zlim, r.R.zlim), known = Math.min(I.depth(xl), I.depth(xr)), outside = xl < I.B[0].x - 3 || xr > I.B[I.B.length - 1].x + 3;
    return { r, c: C.cost(S.lv, d, I.zw), shallow: known < Math.min(reach, C.ZMAX - 1) - 0.05, outside, one: S.bor.length < 2 }; };
  const rotTxt = (rot) => rot < 1 / 9999 ? '≈' + NB + '0' : `1${NB}:${NB}${Math.round(1 / rot)}`;
  const fl = (v) => fmt(v > 1 ? Math.max(1.01, Math.min(v, 99)) : v, 2);   // ami épp csak nem felel meg, az ne „1,00”-nak látsszon
  const rows = (r) => [[T.r_bear, r ? `Λ${NB}=${NB}${fl(r.lam)}` : null, r && r.lam <= 1], [T.r_set, r ? `${fmt(r.s, 0)}${NB}mm` : null, r && r.s <= r.slim + 0.5], [T.r_rot, r ? rotTxt(r.rot) : null, r && r.rot <= 1 / 500], [T.r_frost, r ? `${fmt(r.D, 1)}${NB}m` : null, r && r.frost]];

  /* ---- panel ---- */
  const pb = $('#pbody');
  const tabs = () => $$('#tabs span').forEach((s, i) => { const p = Math.min(S.phase, 3); s.className = i + 1 === p ? 'on' : i + 1 < p || S.phase === 4 ? 'done' : ''; });
  const money = (c) => { const lv = S.lv, b = C.borCost(S.bor), tot = b + (c ? c.total : 0), k = 100 / Math.max(lv.budget, tot); return `<div class="money"><div class="bar"><i class="b1" style="width:${b * k}%"></i><i class="b2" style="width:${(c ? c.found : 0) * k}%"></i><i class="b3" style="width:${(c ? c.dewater : 0) * k}%"></i></div><div class="row${tot > lv.budget + 1e-9 ? ' over' : ''}"><span>${T.spent}: ${M(tot)}</span><span>${T.budget}: ${M(lv.budget)}</span></div></div>`; };
  const logHtml = (i) => { const b = S.bor[i], lv = S.lv; if (!b) return ''; const rowsH = C.truth(lv).col(b.x).filter(l => l.top < b.d).map(l => `<tr><td>${fmt(l.top, 1)}–${fmt(Math.min(l.bot, b.d), 1)}${NB}m</td><td><i style="background:${COL[l.s]}"></i>${T.soil[l.s]}</td><td class="pr">${props(l.s)}</td></tr>`).join('');
    const gw = lv.zw < b.d ? `<tr><td>${fmt(lv.zw, 1)}${NB}m</td><td colspan="2"><i style="background:#1f6fd0"></i>${T.gw}</td></tr>` : `<tr><td>—</td><td colspan="2">${T.gw_none}</td></tr>`;
    const end = C.layerAt(C.truth(lv).col(b.x), b.d - 0.01); return `<table class="log"><tbody>${rowsH}${gw}</tbody></table><p class="hint">${tpl(T.log_end, { d: b.d, s: T.soil[end.s] })}</p>`; };
  function panel() { tabs(); const lv = S.lv, t = T.lv[lv.id]; sc.classList.toggle('aim', S.phase === 1 && !S.busy);
    if (S.phase === 1) { pb.className = 'pbody'; pb.innerHTML = `<h2>${t.name}</h2><div class="brief"><p class="hyphenate">${t.brief}</p></div>
      <div class="kv"><div><b>${t.bld_s}</b><span>${T.k_bld}</span></div><div><b>${fmt(C.pLine(lv), 0)}${NB}kN/m</b><span>${T.k_load}</span></div><div><b>${M(lv.budget)}</b><span>${T.k_budget}</span></div></div>
      <div class="seg two" id="dsel">${[6, 16].map(d => `<button type="button" data-d="${d}" aria-pressed="${S.depth === d}">${tpl(T.bor_btn, { d })}<small>${M(C.BOR[d])}</small></button>`).join('')}</div>
      <p class="hint">${T.bor_hint}</p>
      <div class="chips" id="chips">${S.bor.map((b, i) => `<button type="button" data-i="${i}" aria-pressed="${i === S.sel}">${T.bshort}${i + 1} · ${fmt(b.x, 1)}${NB}m · ${b.d}${NB}m</button>`).join('')}</div>
      <div id="log">${S.sel >= 0 ? logHtml(S.sel) : ''}</div>${money(null)}
      <button class="go" type="button" id="next">${S.bor.length ? T.to_found : T.to_found_blind} →</button>`;
      $$('#dsel button').forEach(b => b.onclick = () => { S.depth = +b.dataset.d; panel(); }); $$('#chips button').forEach(b => b.onclick = () => { S.sel = +b.dataset.i; drawCols(); panel(); }); $('#next').onclick = () => { S.phase = 2; S.sel = -1; drawCols(); drawPlan(); panel(); }; }
    else if (S.phase === 2) { const R = C.RANGE, d = S.d; pb.className = 'pbody'; const sl = (k, lab, r) => `<div class="sl"><label for="s_${k}">${lab}</label><output id="o_${k}"></output><input type="range" id="s_${k}" min="${r[0]}" max="${r[1]}" step="${r[2]}" value="${clamp(d[k], r[0], r[1])}"></div>`;
      pb.innerHTML = `<h2>${T.found_h}</h2><div class="seg three" id="tsel">${['strip', 'raft', 'pile'].map(k => `<button type="button" data-t="${k}" aria-pressed="${d.type === k}">${T.ft[k]}<small>${T.ft_s[k]}</small></button>`).join('')}</div>
      ${d.type === 'strip' ? sl('B', T.sl_B, R.strip.B) + sl('D', T.sl_D, R.strip.D) : d.type === 'raft' ? sl('D', T.sl_D, R.raft.D) : sl('L', T.sl_L, R.pile.L) + sl('a', T.sl_a, R.pile.a)}
      <div class="est"><h4>${T.est_h}</h4><div id="est"></div></div><div id="mon"></div>
      <div class="btnrow"><button class="go alt" type="button" id="back">← ${T.back_bor}</button><button class="go" type="button" id="build">${T.build}</button></div>`;
      $$('#tsel button').forEach(b => b.onclick = () => { S.d.type = b.dataset.t; if (S.d.type === 'raft') S.d.D = Math.min(S.d.D, 3); panel(); drawPlan(); });
      $$('.sl input').forEach(inp => inp.oninput = () => { S.d[inp.id.slice(2)] = +inp.value; upd(); drawPlan(); }); $('#back').onclick = () => { S.phase = 1; drawPlan(); panel(); }; $('#build').onclick = build; upd(); }
    else if (S.phase === 3) { pb.className = 'pbody'; pb.innerHTML = `<h2>${T.building_h}</h2><p class="hint">${T.building_p}</p>`; }
    else verdict(); }
  function upd() { const d = S.d, U = { B: 'm', D: 'm', L: 'm', a: 'm' }; $$('.sl input').forEach(inp => { const k = inp.id.slice(2); $('#o_' + k).textContent = `${fmt(d[k], 1)}${NB}${U[k]}`; });
    const e = est(), r = e && e.r, c = e ? e.c : C.cost(S.lv, design(), null); let htm = '<table><tbody>' + rows(r).map(([lab, v, ok]) => `<tr><td>${lab}</td><td class="${v == null ? 'na' : ok ? 'ok' : 'no'}">${v == null ? '?' : v + NB + (ok ? '✓' : '✗')}</td></tr>`).join('') + `<tr><td>${T.r_cost}</td><td>${M(c.found)}${c.dewater ? ` + ${M(c.dewater)}` : ''}</td></tr></tbody></table>`;
    const notes = []; if (!e) notes.push(T.w_none); else { if (c.dewater) notes.push(T.w_dew); if (e.shallow) notes.push(T.w_shallow); if (e.outside) notes.push(T.w_outside); else if (e.one) notes.push(T.w_one); if (!notes.length) notes.push(T.w_ok); }
    htm += `<div class="note">${notes.join(' ')}</div>`; const box = $('#est'); if (box.innerHTML !== htm) box.innerHTML = htm; const mh = money(c), mb = $('#mon'); if (mb.innerHTML !== mh) mb.innerHTML = mh;
    const over = C.borCost(S.bor) + c.total > S.lv.budget + 1e-9, bt = $('#build'); bt.disabled = over; bt.textContent = over ? T.build_over : T.build; }

  /* ---- fúrás lerakása: koppintás a telekre ---- */
  const svgX = (ev) => { const pt = sc.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const p = pt.matrixTransform(sc.getScreenCTM().inverse()); return p; };
  sc.addEventListener('click', (ev) => { const col = ev.target.closest && ev.target.closest('[data-i]'); if (col && S.phase === 1) { S.sel = +col.dataset.i; drawCols(); panel(); return; }
    if (S.phase !== 1 || S.busy) return; const p = svgX(ev), x = clamp(Math.round(p.x / SC * 2) / 2, 1, 39); if (S.bor.some(b => Math.abs(b.x - x) < 1.5)) { flash(T.too_close); return; }
    if (C.borCost(S.bor) + C.BOR[S.depth] > S.lv.budget) { flash(T.no_money); return; }
    S.bor.push({ x, d: S.depth }); S.sel = S.bor.length - 1; rig(x); drawCols(S.sel); panel(); });
  let ft = 0; const status = (txt, ms = 0) => { const e = $('#status'); clearTimeout(ft); if (!txt) { e.classList.remove('on'); return; } e.textContent = txt; e.classList.add('on'); if (ms) ft = setTimeout(() => e.classList.remove('on'), ms); };
  const flash = (txt) => status(txt, 1800);

  /* ---- építés: alap → szintek → teher → süllyedés (felnagyítva) → a köd felszáll → értékelés ---- */
  const ease = (u) => 1 - Math.pow(1 - u, 3);
  const anim = (ms, f) => new Promise(res => { if (RM) { f(1); res(); return; } const t0 = performance.now(); const step = (t) => { const u = Math.min(1, (t - t0) / ms); f(u); if (u < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
  async function build() { if (S.busy) return; S.busy = true; S.phase = 3; const lv = S.lv, d = design(), token = S.token = Math.random(); const alive = () => S.token === token;
    S.estRes = est(); S.res = C.stars(lv, d, S.bor); const r = S.res.r; panel(); drawPlan(); { const bx = $('.scenebox').getBoundingClientRect(); if (bx.top < 60 || bx.bottom > innerHeight + 40) scrollTo({ top: scrollY + bx.top - 76, behavior: RM ? 'auto' : 'smooth' }); } G.found.innerHTML = ''; G.bld.innerHTML = ''; G.fx.innerHTML = ''; G.ann.innerHTML = '';
    status(T.a_found); foundShape(G.found, false); G.found.style.opacity = 0; G.found.style.transition = 'opacity .5s'; requestAnimationFrame(() => G.found.style.opacity = 1); await sleep(700 * SP); if (!alive()) return;
    status(T.a_build); const st = building(G.bld); for (const s of st) { s.classList.remove('pre'); await sleep(Math.max(140, 900 / st.length + 120) * SP); if (!alive()) return; }
    status(T.a_load); const [xl, xr] = C.walls(lv), top = GY - bH(lv) * SC; const ar = h('g', { class: 'pulse' }, G.fx); [xl + lv.W * 0.25, xl + lv.W * 0.75].forEach(x => h('path', { d: `M${X(x)} ${top - 64} V${top - 22} m-11 -13 l11 15 l11 -15`, stroke: '#d4412f', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ar)); await sleep(900 * SP); if (!alive()) return; ar.remove();
    // elmozdulás képpontban: a süllyedés felnagyítva; talajtörésnél a gyengébb oldal lezökken
    const px = (mm) => Math.min(64, mm * 0.36); let yl = px(r.L.s), yr = px(r.R.s); const col = r.fail === 'collapse'; if (col) { const k = r.side > 0 ? [26, 92] : [92, 26]; if (r.type === 'raft' || Math.abs(r.bl.lamk - r.br.lamk) < 0.05 * r.lamk) { const lean = r.lean; yl = lean > 0 ? 40 : 84; yr = lean > 0 ? 84 : 40; } else { yl = Math.max(yl, k[0]); yr = Math.max(yr, k[1]); } }
    else if (r.fail === 'tilt') { const m = Math.max(yl, yr), dlt = clamp(Math.abs(yr - yl), 26, 60); if (yr > yl) { yr = m + 8; yl = yr - dlt; } else { yl = m + 8; yr = yl - dlt; } }
    status(r.ok || r.fail === 'frost' || r.fail === 'uls' ? T.a_years : T.a_move); const cx = X(lv.x0 + lv.W / 2), wpx = X(lv.W);
    if (col && r.type !== 'pile') { const sd = yr > yl ? 1 : -1, xw = sd > 0 ? xr : xl, hv = h('path', { fill: '#57a55a', stroke: '#1b1f24', 'stroke-width': 2 }, G.fx), sl = h('path', { fill: 'none', stroke: '#d4412f', 'stroke-width': 4, 'stroke-dasharray': '10 6' }, G.fx); const x1 = X(xw) + sd * 30, x2 = x1 + sd * 150; anim(1500 * SP, u => { const e = ease(u); hv.setAttribute('d', `M${x1} ${GY - 4} Q${(x1 + x2) / 2} ${GY - 4 - 44 * e} ${x2} ${GY - 4} Z`); sl.setAttribute('d', `M${X(xw)} ${Y(r.D) + 6} Q${X(xw) + sd * 70} ${Y(r.D) + 110} ${x2} ${GY}`); sl.setAttribute('opacity', e); }); }
    if (col) for (let i = 0; i < 9; i++) h('circle', { class: 'dust', cx: X(lv.x0) + (i / 8) * wpx, cy: GY - 6 - (i % 3) * 8, r: 16 + (i % 4) * 5, fill: '#cbbfa6', style: `animation-delay:${0.25 + i * 0.07}s` }, G.fx);
    await anim((col ? 1500 : 2300) * SP, u => { const e = col ? u * u : ease(u), a = yl * e, b = yr * e, ang = Math.atan2(b - a, wpx) * 180 / Math.PI; G.move.setAttribute('transform', `translate(0 ${(a + b) / 2}) rotate(${ang} ${cx} ${GY})`); }); if (!alive()) return;
    if (r.fail && r.fail !== 'uls') cracks(r, yr >= yl ? 1 : -1); await sleep((r.fail ? 800 : 300) * SP); if (!alive()) return;
    status(T.a_reveal); G.fog.style.opacity = 0; G.interp.style.opacity = 0; $$('[data-i]', G.cols).forEach(c => { c.style.transition = 'opacity 1.3s ease'; c.style.opacity = 0.3; }); /* a fúrások elhalványulnak, hogy ne látsszanak cölöpnek */ await sleep(1400 * SP); if (!alive()) return; annotate(r, yl, yr); status('');
    const prev = SAVE.stars[lv.id] || 0; if (S.res.n > prev) { SAVE.stars[lv.id] = S.res.n; save(); } S.phase = 4; S.busy = false; soils(); stamp(r, S.res.n); panel(); levels(); total(); }
  function cracks(r, side) { const lv = S.lv, g = h('g', {}, G.bld), x0 = X(lv.x0 - 0.25), w = X(lv.W + 0.5), sh = (lv.id === 'pisa' ? 3.1 : 2.8) * SC; const zig = (x, y, n, dx, dy) => { let dd = `M${x} ${y}`, len = 0; for (let i = 0; i < n; i++) { const ax = dx * (0.6 + (i % 2) * 0.8), ay = dy * (0.7 + ((i + 1) % 2) * 0.6); dd += ` l${ax} ${ay}`; len += Math.hypot(ax, ay); } const p = h('path', { d: dd, class: 'crack', fill: 'none', stroke: '#1b1f24', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g); p.style.setProperty('--len', Math.ceil(len) + 2); return p; };
    const xs = side > 0 ? x0 + w - 16 : x0 + 16, dir = -side; const heavy = r.fail === 'collapse' || r.fail === 'tilt';
    if (r.fail === 'frost') { zig(x0 + w * 0.2, GY - 4, 5, 9, -11); zig(x0 + w * 0.72, GY - 4, 5, -8, -12); zig(x0 + w * 0.45, GY - 4, 4, 7, -9); return; }
    zig(xs, GY - 6, heavy ? 9 : 6, dir * 13, -sh * 0.2); zig(xs + dir * w * 0.3, GY - sh * 0.9, heavy ? 8 : 5, dir * 12, -sh * 0.16); if (heavy || r.fail === 'settle') zig(x0 + w * 0.5, GY - 6, 6, side * 8, -sh * 0.17); if (heavy && lv.n > 2) zig(xs + dir * w * 0.12, GY - sh * 2.1, 7, dir * 12, -sh * 0.15); }
  function annotate(r, yl, yr) { const lv = S.lv, [xl, xr] = C.walls(lv), g = G.ann; const lab = (x, y, t, anchor = 'middle', fs = 21) => h('text', { x, y, 'font-size': fs * FS, 'text-anchor': anchor }, g, t);
    lab(X(xl) - 14, GY + 12 + 22 * FS + yl, `s = ${fmt(r.L.s, 0)} mm`, 'end'); lab(X(xr) + 14, GY + 12 + 22 * FS + yr, `s = ${fmt(r.R.s, 0)} mm`, 'start');
    if (r.type !== 'pile') { const pts = [[xl + (r.type === 'raft' ? lv.W / 8 : 0), r.L], [xr - (r.type === 'raft' ? lv.W / 8 : 0), r.R]].filter(([x, q]) => q.zlim < C.ZMAX - 0.05);   // határmélység: szaggatott jel a két fal alatt, egy közös felirattal
      pts.forEach(([x, q]) => { h('line', { x1: X(x) - 46, x2: X(x) + 46, y1: Y(q.zlim), y2: Y(q.zlim), stroke: '#fffdf7', 'stroke-width': 6 }, g); h('line', { x1: X(x) - 46, x2: X(x) + 46, y1: Y(q.zlim), y2: Y(q.zlim), stroke: '#d4412f', 'stroke-width': 3, 'stroke-dasharray': '9 5' }, g); });
      if (pts.length) { const zs = pts.map(a => a[1].zlim), same = Math.abs(zs[0] - zs[zs.length - 1]) < 0.25; const yb = Y(Math.max(...zs)) + 8 + 20 * FS; lab(X(lv.x0 + lv.W / 2), yb > VH - 8 ? Y(Math.min(...zs)) - 12 : yb, `${T.zlim} ${same ? fmt(zs[0], 1) : zs.map(z => fmt(z, 1)).join(' / ')} m`, 'middle', 19); } }
    if (lv.zw < C.ZMAX) { h('path', { d: `M${VW - 60} ${Y(lv.zw) - 14 * FS} h${24 * FS} l${-12 * FS} ${14 * FS} z`, fill: '#1f6fd0', stroke: '#fff', 'stroke-width': 2 }, g); }   // a talajvíz neve és mélysége a rajz alatti jelmagyarázatban van
    lab(VW / 2, 18 + 16 * FS, T.magn, 'middle', 17); }
  { let tm = 0, w0 = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { const w = sc.getBoundingClientRect().width; if (S.busy || Math.abs(w - w0) < 40) return; w0 = w; if (Math.abs(fsCalc() - FS) > 0.12 && S.phase <= 2) { scene(); } }, 250); }); }
  function stamp(r, n) { const e = $('#stamp'); e.className = 'stamp ' + (r.ok ? 'good' : r.fail === 'collapse' || r.fail === 'tilt' ? 'bad' : 'mid'); e.textContent = r.ok ? T.v_t.ok : T.v_t[r.fail]; e.classList.toggle('long', e.textContent.length > 11); void e.offsetWidth; e.classList.add('on'); clearTimeout(stamp.t); stamp.t = setTimeout(() => { if (S.phase === 4) e.classList.add('dock'); }, 2200); }

  function describe(d) { return d.type === 'strip' ? tpl(T.d_strip, { B: fmt(d.B, 1), D: fmt(d.D, 1) }) : d.type === 'raft' ? tpl(T.d_raft, { D: fmt(d.D, 1) }) : tpl(T.d_pile, { L: fmt(d.L, 1), a: fmt(d.a, 1) }); }
  function verdict() { const lv = S.lv, t = T.lv[lv.id], R = S.res, r = R.r, e = S.estRes && S.estRes.r; pb.className = 'pbody verdict'; const li = [];
    const why = { collapse: () => tpl(r.type === 'pile' ? T.y_coll_p : T.y_coll, { k: fmt(r.lamk, 2) }), tilt: () => tpl(T.y_tilt, { ds: fmt(r.ds, 0), n: Math.round(1 / r.rot) }), uls: () => tpl(T.y_uls, { l: fl(r.lam) }), crack: () => tpl(T.y_crack, { ds: fmt(r.ds, 0), n: Math.round(1 / r.rot) }), settle: () => tpl(T.y_settle, { s: fmt(r.s, 0), lim: r.slim }), frost: () => tpl(T.y_frost, { D: fmt(r.D, 1) }) };
    if (r.fail) { const v = [r.lamk > 1 ? 'collapse' : r.lam > 1 ? 'uls' : null, r.rot > 1 / 150 ? 'tilt' : r.rot > 1 / 500 ? 'crack' : null, r.s > r.slim + 0.5 ? 'settle' : null, !r.frost ? 'frost' : null].filter(k => k && k !== r.fail);   // az elsődleges hiba elöl, utána minden más, ami nem teljesült
      li.push(['bad', why[r.fail]()]); if (r.fail !== 'collapse') v.forEach(k => li.push(['bad', why[k]()])); } else li.push(['good', tpl(T.y_ok, { l: fmt(r.lam, 2), s: fmt(r.s, 0) })]);
    if (e && e.ok && r.fail) li.push(['mid', T.y_surprise]); else if (!S.bor.length && r.fail) li.push(['mid', T.y_blind]);
    const ce = S.estRes ? S.estRes.c : null; if (R.c.dewater && (!ce || !ce.dewater)) li.push(['mid', tpl(T.y_dew, { c: fmt(R.c.dewater, 2) })]);
    if (R.over) li.push(['bad', tpl(T.y_over, { c: fmt(R.total, 2), b: fmt(lv.budget, 2) })]);
    if (r.ok) { if (R.econ) li.push(['good', T.y_econ]); else if (!R.over) li.push(['mid', tpl(T.y_exp, { k: fmt(R.c.total / R.opt.c, 1) })]); li.push([R.found ? 'good' : 'mid', R.found ? T.y_found : T.y_nfound]); }
    li.push(['', tpl(T.y_opt, { d: describe(R.opt.d), c: fmt(R.opt.c, 2) })]);
    const cmp = `<div class="est"><h4>${T.cmp_h}</h4><table><thead><tr><th></th><th>${T.cmp_est}</th><th>${T.cmp_real}</th></tr></thead><tbody>${rows(e).map((a, i) => { const b = rows(r)[i]; return `<tr><td>${a[0]}</td><td class="${a[1] == null ? 'na' : a[2] ? 'ok' : 'no'}">${a[1] == null ? '?' : a[1]}</td><td class="${b[2] ? 'ok' : 'no'}">${b[1]}${NB}${b[2] ? '✓' : '✗'}</td></tr>`; }).join('')}</tbody></table></div>`;
    const i = C.LEVELS.indexOf(lv), nx = C.LEVELS[(i + 1) % C.LEVELS.length];
    pb.innerHTML = `<h2>${r.ok ? T.v_h.ok : T.v_h[r.fail]}</h2><div class="stars" aria-label="${R.n} / 3">${[0, 1, 2].map(k => k < R.n ? '<i>★</i>' : '★').join('')}</div>
      <ul class="vlist">${li.map(([c, s]) => `<li class="${c}">${s}</li>`).join('')}</ul>${cmp}
      <div class="lesson"><b>${T.lesson_h}</b><p class="hyphenate">${t.lesson}</p><a href="${t.app[1]}" target="_blank" rel="noopener">${T.lesson_link} ${t.app[0]} ↗</a></div>
      <div class="btnrow"><button class="go alt" type="button" id="again">${T.again}</button><button class="go" type="button" id="nextlv">${T.next_lv} →</button></div>`;
    $('#again').onclick = () => start(lv, true); $('#nextlv').onclick = () => { start(nx); $('#jatek').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }; }

  /* ---- telekválasztó, összesítés ---- */
  function levels() { const box = $('#lvs'); const htm = C.LEVELS.map((lv, i) => { const n = SAVE.stars[lv.id] || 0; return `<button class="lv" type="button" data-id="${lv.id}" aria-pressed="${lv === S.lv}"><small>${tpl(T.lv_n, { n: i + 1 })} · ${tpl(T.lec, { n: lv.lec })}</small><b>${T.lv[lv.id].name}</b><span class="st" aria-label="${n} / 3">${[0, 1, 2].map(k => k < n ? '<i>★</i>' : '★').join('')}</span></button>`; }).join('');
    if (box.innerHTML !== htm) { box.innerHTML = htm; $$('.lv', box).forEach(b => b.onclick = () => start(C.LEVELS.find(l => l.id === b.dataset.id))); } }
  function total() { const n = C.LEVELS.reduce((t, lv) => t + (SAVE.stars[lv.id] || 0), 0); $('#totS').textContent = n; $('#rank').textContent = T.ranks[n >= 18 ? 4 : n >= 14 ? 3 : n >= 9 ? 2 : n >= 4 ? 1 : 0]; }
  function start(lv, keep) { S.token = 0; S.lv = lv; S.phase = 1; S.busy = false; S.res = null; S.estRes = null; S.sel = -1; S.bor = []; if (!keep) S.d = { type: 'strip', B: 1, D: 1, L: 8, a: 3 }; S.depth = 6; $('#stamp').className = 'stamp'; status(''); scene(); panel(); levels(); try { history.replaceState(null, '', location.pathname + '?t=' + lv.id); } catch (e) {} }

  { const q = new URLSearchParams(location.search).get('t'); start(C.LEVELS.find(l => l.id === q) || C.LEVELS[0]); total(); }
  window.__avd = { S, C, start, build, design, est };
  /* nyelvváltó: a választás megmarad (a többi Alapozás-oldallal közös kulcs), a másik nyelven ugyanaz a telek nyílik meg */
  { const sw = $('#langSw'); if (sw) sw.addEventListener('click', () => { try { localStorage.setItem('alap-lang', EN ? 'hu' : 'en'); } catch (e) {} sw.setAttribute('href', (EN ? './' : 'en') + '?t=' + S.lv.id + (EN ? '&hu' : '')); }); }
})();
