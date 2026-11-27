/* ================= A TÁRGY ÚTJA: metszet (állomásonként ráközelítő nézet) =================
   Egyetlen telek metszete (a bevezető animáció folyóparti telke), állomásonként más nézettel és más rárajzolt réteggel.
   Mértékegység: méter; 1 m = 6 SVG-egység. A közös elemek (talaj, házak, gépek) valós méretűek, ezért ráközelítve nagyobbak;
   az állomások rárajzolt elemei (nyilak, vonalak, feliratok) a nézethez igazodnak, így minden állomáson egyforma vastagok.
   A feliratok két nyelven a TX táblában vannak (az angol oldal ugyanebből a forrásból készül). */
const XS = (() => {
  const svg = $('#xs'); const U = 6, X = (x) => (x + 66) * U, Y = (y) => (40 - y) * U;
  const P = (pts) => pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const pd = (...a) => a.map(t => typeof t === 'string' ? t : `${X(t[0]).toFixed(1)} ${Y(t[1]).toFixed(1)}`).join(' ');
  const lerpx = (a, b, t) => a + (b - a) * t, sm = (u) => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  const rnd = (i, j = 0) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };
  const TX = EN ? {
    sup: 'structure', fnd: 'foundation', grd: 'ground', str: 'stresses in the ground', q1: 'which layers?', q2: 'where is the groundwater?', loads: 'loads',
    bh: 'BH', sand: 'sand', clay: 'soft clay', peat: 'peat', gravel: 'sandy gravel', hard: 'hard clay', fill: 'made ground', gw: 'groundwater', rig: 'drilling rig', lab: 'samples → lab', core: 'core',
    flev: 'foundation level', frost: '❄ frost depth', cp: 'contact pressure', bf: 'bearing failure', heave: 'heave', slip: 'slip surface',
    wind: 'wind', slide: 'sliding', over: 'overturning', upl: 'uplift', glob: 'overall stability', basin: 'empty basin',
    heavier: 'heavier load', infl: 'influence depth', diff: 'differential settlement', crack: 'cracks',
    rules: 'shallow works too – with more rules', n6: ['Expansive clay', 'Collapsible loess', 'Made ground', 'Organic soil, peat'],
    shrink: 'shrinks', swell: 'swells', active: 'active zone', burst: 'burst pipe', collapse: 'collapse', orig: 'original ground', mixed: 'mixed fill', years: 'years', settle: 'settlement', gas: 'gas',
    flood: 'flood level', fheave: 'frost heave', pdrive: 'pile driving', vib: 'vibration', quake: 'earthquake', cellar: 'collapsed cellar', trough: 'settlement trough', erosion: 'erosion', drawdown: 'rapid drawdown', river: 'river', ice: 'ice lenses',
    bearing: 'bearing stratum', shaft: 'shaft resistance', base: 'base resistance', cfa: 'CFA rig', cage: 'reinforcement cage', cap: 'pile cap', fam: 'two pile families', disp: 'displacement', repl: 'replacement', weak: 'weak layers',
    dwall: 'diaphragm wall', anchor: 'ground anchors', pwall: 'pile wall', strut: 'raking strut', waling: 'waling', dewat: 'dewatering', imperm: 'cut-off in the clay', plan: 'walls in plan', berlin: 'soldier pile wall', sheet: 'sheet pile wall', capb: 'capping beam',
  } : {
    sup: 'felszerkezet', fnd: 'alapozás', grd: 'altalaj', str: 'feszültségek a talajban', q1: 'milyen rétegek?', q2: 'hol a talajvíz?', loads: 'terhek',
    bh: 'F', sand: 'homok', clay: 'puha agyag', peat: 'tőzeg', gravel: 'homokos kavics', hard: 'kemény agyag', fill: 'feltöltés', gw: 'talajvíz', rig: 'fúrógép', lab: 'minták → labor', core: 'magminta',
    flev: 'alapsík', frost: '❄ fagyhatár', cp: 'talpfeszültség', bf: 'talajtörés', heave: 'felpúposodás', slip: 'csúszólap',
    wind: 'szél', slide: 'elcsúszás', over: 'felborulás', upl: 'felúszás', glob: 'általános állékonyság', basin: 'üres medence',
    heavier: 'nagyobb teher', infl: 'határmélység', diff: 'egyenlőtlen süllyedés', crack: 'repedések',
    rules: 'síkalap is lehet – több szabállyal', n6: ['Térfogatváltozó agyag', 'Roskadékony lösz', 'Feltöltés', 'Szerves talaj, tőzeg'],
    shrink: 'zsugorodik', swell: 'duzzad', active: 'aktív zóna', burst: 'csőtörés', collapse: 'roskadás', orig: 'eredeti terep', mixed: 'vegyes anyag', years: 'évek', settle: 'süllyedés', gas: 'gáz',
    flood: 'árvízszint', fheave: 'fagyemelés', pdrive: 'cölöpverés', vib: 'rezgés', quake: 'földrengés', cellar: 'beszakadt pince', trough: 'süllyedési teknő', erosion: 'kimosás', drawdown: 'gyors apadás', river: 'folyó', ice: 'jéglencsék',
    bearing: 'teherbíró réteg', shaft: 'palástellenállás', base: 'talpellenállás', cfa: 'CFA-cölöpfúró', cage: 'vasalás', cap: 'fejtömb', fam: 'két cölöpcsalád', disp: 'talajkiszorításos', repl: 'talajhelyettesítéses', weak: 'gyenge rétegek',
    dwall: 'résfal', anchor: 'talajhorgonyok', pwall: 'cölöpfal', strut: 'ferde dúc', waling: 'heveder', dewat: 'víztelenítés', imperm: 'bekötés a vízzáró agyagba', plan: 'falak alaprajzban', berlin: 'berlini dúcolat', sheet: 'szádfal', capb: 'fejgerenda',
  };
  // folyóparti telek (a bevezető animációval egyezően): rézsű a ház mellett (−36 → −43,5), a lábánál folyó (meder −8, vízszint −5,6)
  const SURF = [[-66, -5], [-59, -5], [-57, -8], [-47, -8], [-45, -5], [-43.5, -5], [-36, 0], [66, 0]], WL = -5.6;
  const ysurf = (x) => { for (let i = 1; i < SURF.length; i++) if (x <= SURF[i][0]) { const [x0, y0] = SURF[i - 1], [x1, y1] = SURF[i]; return x1 === x0 ? y1 : lerpx(y0, y1, (x - x0) / (x1 - x0)); } return 0; };
  const xb = (y) => lerpx(-6, 4, (-1.2 - y) / 7.8);                                   // a homok és a puha agyag határa
  const gwY = (x) => x >= -30 ? -3 : x > -45 ? Math.min(ysurf(x) - 0.25, lerpx(-3, WL, sm((-30 - x) / 15))) : WL;
  const inPeat = (x, y) => (x - 19) ** 2 / 110 + (y + 4.3) ** 2 / 2.4 < 1;
  // nézetek állomásonként: [x0, x1, y_felső] – a képarány 16:10
  const VIEWS = { 1: [-50, 6, 15], 2: [-46, 30, 17.5], 3: [-40, -2, 8], 4: [-50, 34, 22], 5: [-43, -3, 12.6], 6: [-4, 50, 30], 7: [-51.9, 9.1, 16.5], 8: [-6, 46, 12], 9: [-12, 50, 14] };
  const vb = (n) => { const [x0, x1, yt] = VIEWS[n]; const w = (x1 - x0) * U; return [X(x0), Y(yt), w, w * 0.625]; };
  const KF = (n) => (VIEWS[n][1] - VIEWS[n][0]) / 116;                               // az állomás léptéke: a rárajzolt elemek ehhez igazodnak
  const C = { amber: '#f2a531', red: '#ef5a43', blue: '#5cc2f2', sky: '#9fd8ff', green: '#62d394', yel: '#ffd36b', holo: '#8ff0ff', conc: '#cfcac0', concD: '#8d8a83', steel: '#77818c', ink: '#0d1117',
    fillS: '#84796a', sand: '#cfae74', clay: '#6c665e', peat: '#3d2d20', grav: '#a59880', hard: '#5d5046', grass: '#4f8a3c', vest: '#f27a1f' };

  // ---------- defs: átmenetek, minták ----------
  const defs = h('defs', {}, svg);
  const grad = (id, stops, a = { x1: 0, y1: 0, x2: 0, y2: 1 }) => { const g = h('linearGradient', { id, ...a }, defs); stops.forEach(([o, c, op]) => h('stop', { offset: o, 'stop-color': c, ...(op == null ? {} : { 'stop-opacity': op }) }, g)); };
  grad('xsSky', [[0, '#0a111d'], [.55, '#152131'], [1, '#243650']], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: Y(34), x2: 0, y2: Y(-6) });
  grad('xsDeep', [[0, '#000', 0], [.3, '#000', .05], [1, '#000', .36]], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: Y(0), x2: 0, y2: Y(-31) });
  grad('xsWat', [[0, '#3f93b8'], [1, '#1d4f6b']]);
  grad('xsGl', [[0, '#7fa1bb'], [.55, '#34506a'], [1, '#4b6a82']], { x1: 0, y1: 0, x2: 1, y2: 1 });
  grad('xsHolo', [[0, '#5fe3ff', .16], [1, '#5fe3ff', .05]]);
  grad('xsConc', [[0, '#dedad1'], [1, '#b9b4aa']]);
  grad('xsCell', [[0, '#0e1620'], [1, '#1e2d41']]);
  grad('xsSteel', [[0, '#9aa5b0'], [.5, '#5d6772'], [1, '#8b96a1']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  { const g = h('radialGradient', { id: 'xsGlow', cx: .5, cy: .5, r: .5 }, defs); h('stop', { offset: 0, 'stop-color': '#ffd36b', 'stop-opacity': .55 }, g); h('stop', { offset: 1, 'stop-color': '#ffd36b', 'stop-opacity': 0 }, g); }
  const pat = (id, w, hh, draw, tr) => { const p = h('pattern', { id, width: w, height: hh, patternUnits: 'userSpaceOnUse', ...(tr ? { patternTransform: tr } : {}) }, defs); draw(p); };
  pat('pS', 13, 11, p => { for (const [x, y, r, c] of [[2, 3, .9, 'rgba(96,66,22,.5)'], [8, 2, .6, 'rgba(255,236,190,.5)'], [11, 7, .8, 'rgba(96,66,22,.4)'], [5, 8, .7, 'rgba(120,84,30,.45)'], [1.5, 9.5, .5, 'rgba(255,236,190,.4)']]) h('circle', { cx: x, cy: y, r, fill: c }, p); });
  pat('pC', 20, 9, p => { h('path', { d: 'M1 3h8M12 7h6', stroke: 'rgba(20,24,30,.42)', 'stroke-width': 1.1, 'stroke-linecap': 'round' }, p); h('path', { d: 'M13 2.5h3', stroke: 'rgba(255,255,255,.07)', 'stroke-width': 1 }, p); });
  pat('pG', 22, 18, p => { for (const [x, y, rx, ry, f, a] of [[5, 5, 3.6, 2.6, '#c2b69c', 12], [15, 4, 2.4, 1.8, '#8c7f68', -18], [10, 12.5, 4.2, 2.9, '#b3a78d', -8], [19.5, 13.5, 2.2, 1.7, '#cabfa6', 20], [2.5, 14, 1.8, 1.3, '#93876f', 0]]) h('ellipse', { cx: x, cy: y, rx, ry, fill: f, stroke: 'rgba(52,40,26,.55)', 'stroke-width': .6, transform: `rotate(${a} ${x} ${y})` }, p); });
  pat('pP', 18, 7, p => { h('path', { d: 'M0 3.5 q4.5 -3 9 0 t9 0', stroke: 'rgba(226,190,132,.42)', fill: 'none', 'stroke-width': .9 }, p); h('path', { d: 'M3 6h4M12 1h3', stroke: 'rgba(0,0,0,.4)', 'stroke-width': .8 }, p); });
  pat('pF', 16, 13, p => { h('path', { d: 'M2 3l5 2.6M10 10l4 -2', stroke: 'rgba(34,26,18,.5)', 'stroke-width': 1.1, 'stroke-linecap': 'round' }, p); h('circle', { cx: 11, cy: 3.5, r: 1.1, fill: 'rgba(34,26,18,.4)' }, p); h('rect', { x: 3, y: 8.5, width: 3, height: 1.6, fill: 'rgba(176,84,58,.55)' }, p); });
  pat('pH', 16, 7, p => { h('path', { d: 'M0 2h6M9 5h6', stroke: 'rgba(15,12,10,.5)', 'stroke-width': 1.2 }, p); h('path', { d: 'M8 1.5h3', stroke: 'rgba(255,255,255,.06)', 'stroke-width': 1 }, p); });
  pat('pU', 40, 40, p => { h('text', { x: 20, y: 26, 'text-anchor': 'middle', 'font-size': 18, fill: 'rgba(255,255,255,.09)', 'font-family': 'var(--fm)', 'font-weight': 700, text: '?' }, p); });
  pat('pL', 7, 16, p => { h('path', { d: 'M1.5 0v9M5 6v10', stroke: 'rgba(96,66,22,.5)', 'stroke-width': .8 }, p); h('circle', { cx: 3.4, cy: 12, r: .6, fill: 'rgba(96,66,22,.45)' }, p); });
  pat('pBr', 3.6, 2.4, p => { h('rect', { x: 0, y: 0, width: 3.6, height: 2.4, fill: '#a5563c' }, p); h('path', { d: 'M0 1.2h3.6M0 0h3.6M1.8 0v1.2M0 1.2v1.2M3.6 1.2v1.2', stroke: 'rgba(236,214,190,.55)', 'stroke-width': .28 }, p); });
  pat('pHat', 5, 5, p => h('path', { d: 'M0 5L5 0', stroke: 'rgba(255,255,255,.2)', 'stroke-width': .7 }, p));
  { const cp = h('clipPath', { id: 'xsSoil' }, defs); h('polygon', { points: P([...SURF, [66, -31], [-66, -31]]) }, cp); }

  // ---------- rajzoló segédek ----------
  const groups = [];
  const G = (a, b = 99, cls = '') => { const g = h('g', { class: 'st ' + cls }, svg); g._a = a; g._b = b; groups.push(g); return g; };
  const sub = (g, a = {}) => { const q = h('g', a, g); q._a = g._a; q._b = g._b; q._nl = g._nl; return q; };
  const k = (g) => KF(g._a), W = (g, px) => +(px * k(g) * 1.05).toFixed(2);          // állomásléptékű vonalvastagság (asztali képponttal megadva)
  const line = (g, pts, a) => h('polyline', { points: P(pts), fill: 'none', ...a }, g);
  const poly = (g, pts, a) => h('polygon', { points: P(pts), ...a }, g);
  const path = (g, d, a) => h('path', { d, ...a }, g);
  const rect = (g, x0, x1, y0, y1, a) => h('rect', { x: X(x0), y: Y(y1), width: (x1 - x0) * U, height: (y1 - y0) * U, ...a }, g);
  const circ = (g, x, y, r, a) => h('circle', { cx: X(x), cy: Y(y), r: r * U, ...a }, g);
  const ell = (g, x, y, rx, ry, a) => h('ellipse', { cx: X(x), cy: Y(y), rx: rx * U, ry: ry * U, ...a }, g);
  const rot = (g, deg, x, y) => sub(g, { transform: `rotate(${-deg} ${X(x)} ${Y(y)})` });  // pozitív szög: az óramutatóval ellentétesen
  // feliratok: saját csoportban, a keskeny kijelzőn a --ls szorzóval nagyobbak (a horgonypontjuk körül)
  const labs = [];
  const lab = (g, x, y, m = 1) => { if (g._nl) return h('g', { transform: `translate(${X(x).toFixed(1)} ${Y(y).toFixed(1)})` }, g);
    const q = h('g', { class: 'lb', style: `transform:translate(calc(${X(x).toFixed(1)}px + var(--dx, 0px)), calc(${Y(y).toFixed(1)}px + var(--dy, 0px))) scale(${m === 1 ? 'var(--ls,1)' : `calc(1 + (var(--ls,1) - 1) * ${m})`})` }, g);
    q._x = X(x); q._y = Y(y); q._m = m; q._a = g._a; q._b = g._b; labs.push(q); return q; };
  // kártya: a tartalma modellkoordinátákban rajzolható, keskeny kijelzőn a horgonypontja (x, y) körül egyben nagyobb
  const card = (g, x, y) => { const q = lab(g, x, y); q._card = 1; const c = h('g', { transform: `translate(${(-X(x)).toFixed(1)} ${(-Y(y)).toFixed(1)})` }, q); c._a = g._a; c._b = g._b; c._nl = 1; return c; };
  const tl = (t) => t.replace(/_\{([^}]*)\}/g, (m, a) => a.replace(/./g, 'i')).replace(/_(\S)/g, '$1').length - (t.match(/_\{[^}]*\}|_\S/g) || []).length * 0.3;
  const rt = (el, t, f) => { const re = /_\{([^}]*)\}|_([^\s_{}])/g; let i = 0, m, was = false; const add = (s, isSub) => { if (!s) return; const a = { text: s }; if (isSub) { a['font-size'] = (f * 0.7).toFixed(2); a.dy = (f * 0.26).toFixed(2); } else if (was) a.dy = (-f * 0.26).toFixed(2); was = isSub; h('tspan', a, el); };
    while ((m = re.exec(t))) { add(t.slice(i, m.index), false); add(m[1] ?? m[2], true); i = re.lastIndex; } add(t.slice(i), false); };
  const lbl = (g, x, y, t, col = '#fff', anchor = 'middle', sc = 1, m = 1) => { const f = 13.5 * k(g) * sc; const q = lab(g, x, y, m); q._t = t; const e = h('text', { x: 0, y: 0, 'text-anchor': anchor, fill: col, 'font-size': f.toFixed(2), style: `paint-order:stroke; stroke:rgba(8,10,14,.9); stroke-width:${(f * 0.26).toFixed(2)}px; stroke-linejoin:round` }, q); rt(e, t, f); return q; };
  const tag = (g, x, y, t, col = '#fff', o = {}) => { const s = k(g) * (o.sc || 1), f = 13.5 * s, wd = tl(t) * f * 0.615 + 17 * s, hh = 22.5 * s; const q = lab(g, x, y); q._t = t; const ax = o.a === 'start' ? 0 : o.a === 'end' ? -wd : -wd / 2;
    h('rect', { x: ax.toFixed(2), y: (-hh / 2).toFixed(2), width: wd.toFixed(2), height: hh.toFixed(2), rx: (5.5 * s).toFixed(2), fill: o.fill || 'rgba(10,13,17,.9)', stroke: col, 'stroke-width': (1.25 * s).toFixed(2) }, q);
    const e = h('text', { x: (ax + wd / 2).toFixed(2), y: (f * 0.35).toFixed(2), 'text-anchor': 'middle', fill: o.ink || '#fff', 'font-size': f.toFixed(2) }, q); rt(e, t, f); return q; };
  const lead = (g, x0, y0, x1, y1, col, s2) => { const q = sub(g, s2 ? { class: 's2' } : {}); line(q, [[x0, y0], [x1, y1]], { stroke: col, 'stroke-width': W(g, 1.2), opacity: .85 }); h('circle', { cx: X(x1), cy: Y(y1), r: W(g, 2.4), fill: col }, q); };
  const arr = (g, x0, y0, x1, y1, col, wpx = 2.4, a = {}) => { const ax = X(x1), ay = Y(y1), bx = X(x0), by = Y(y0), an = Math.atan2(ay - by, ax - bx), L = W(g, 4.2 + wpx * 2.1);
    h('line', { x1: bx, y1: by, x2: ax - Math.cos(an) * L * 0.8, y2: ay - Math.sin(an) * L * 0.8, stroke: col, 'stroke-width': W(g, wpx), 'stroke-linecap': 'round', ...a }, g);
    h('path', { d: `M${ax} ${ay} L${ax - Math.cos(an - .42) * L} ${ay - Math.sin(an - .42) * L} L${ax - Math.cos(an + .42) * L} ${ay - Math.sin(an + .42) * L}Z`, fill: col, ...(a.opacity ? { opacity: a.opacity } : {}) }, g); };
  const dash = (g, px) => `${W(g, px)} ${W(g, px * 0.75)}`;
  // méretvonal két nyílheggyel
  const dim = (g, x0, y0, x1, y1, col = '#fff') => { arr(g, (x0 + x1) / 2, (y0 + y1) / 2, x0, y0, col, 1.3); arr(g, (x0 + x1) / 2, (y0 + y1) / 2, x1, y1, col, 1.3); };

  // ---------- ember, fa, gépek ----------
  const man = (g, x, y, o = {}) => { const d = o.dir || 1, v = o.vest || C.vest; rect(g, x - 0.17, x - 0.02, y, y + 0.82, { fill: '#27313d' }); rect(g, x + 0.02, x + 0.17, y, y + 0.82, { fill: '#1f2831' });
    rect(g, x - 0.22, x + 0.22, y + 0.78, y + 1.42, { fill: v, rx: .5 }); rect(g, x - 0.22, x + 0.22, y + 1.02, y + 1.1, { fill: '#fff6c9' });
    if (o.arm) line(g, [[x + d * 0.16, y + 1.34], [x + d * 0.5, y + 1.2 + (o.arm - 1) * 0.3]], { stroke: v, 'stroke-width': 0.13 * U, 'stroke-linecap': 'round' });
    circ(g, x, y + 1.58, 0.135, { fill: '#e7b98f' }); path(g, pd('M', [x - 0.17, y + 1.62], 'Q', [x, y + 1.9], [x + 0.17, y + 1.62], 'Z'), { fill: o.hat || '#ffd23e' }); rect(g, x - 0.17 + (d > 0 ? 0 : -0.06), x + 0.17 + (d > 0 ? 0.06 : 0), y + 1.6, y + 1.64, { fill: o.hat || '#ffd23e' }); };
  const tree = (g, x, s = 1) => { const y = ysurf(x); poly(g, [[x - .28 * s, y], [x + .28 * s, y], [x + .16 * s, y + 4.2 * s], [x - .16 * s, y + 4.2 * s]], { fill: '#46362a' }); line(g, [[x, y + 3.2 * s], [x + 1.2 * s, y + 4.6 * s]], { stroke: '#46362a', 'stroke-width': .16 * s * U });
    for (const [dx, dy, r, c] of [[0, 6.2, 2.6, '#27503a'], [-1.5, 5.3, 1.9, '#2c5a40'], [1.6, 5.5, 2.0, '#234a35'], [-.5, 7.4, 1.9, '#346a49'], [.9, 7.0, 1.6, '#2f6145'], [-1.0, 6.5, 1.2, '#3f7d55'], [.2, 8.0, 1.0, '#4a8c60']]) circ(g, x + dx * s, y + dy * s, r * s, { fill: c }); };
  const wheel = (g, x, y, r) => { circ(g, x, y, r, { fill: '#15181c' }); circ(g, x, y, r * 0.5, { fill: '#7b848d' }); circ(g, x, y, r * 0.18, { fill: '#2a2f35' }); };
  const lattice = (g, x0, x1, y0, y1, col, step = 1.1, sw = 0.07) => { rect(g, x0, x1, y0, y1, { fill: 'rgba(0,0,0,.22)', stroke: col, 'stroke-width': sw * 1.5 * U }); const n = Math.max(1, Math.round((y1 - y0) / step)), d = (y1 - y0) / n; for (let i = 0; i < n; i++) { line(g, [[x0, y0 + i * d], [x1, y0 + (i + 1) * d]], { stroke: col, 'stroke-width': sw * U }); line(g, [[x1, y0 + i * d], [x0, y0 + (i + 1) * d]], { stroke: col, 'stroke-width': sw * U, opacity: .55 }); } };
  // lánctalpas alapgép: (x0…x1) a talp, d = merre néz a fülke (+1: jobbra)
  const crawler = (g, x0, x1, y, col, d = 1, o = {}) => { const xm = (x0 + x1) / 2, L = x1 - x0; rect(g, x0, x1, y, y + 0.8, { fill: '#1b1e22', rx: 0.4 * U }); for (let i = 0; i < 5; i++) circ(g, x0 + 0.45 + i * (L - 0.9) / 4, y + 0.4, 0.26, { fill: '#59616a' });
    rect(g, x0 + 0.3, x1 - 0.3, y + 0.8, y + 1.15, { fill: '#2b3037' }); const b0 = xm - L * 0.46, b1 = xm + L * 0.46; rect(g, b0, b1, y + 1.15, y + 2.55, { fill: col, rx: 0.15 * U }); rect(g, d > 0 ? b0 : b1 - L * 0.3, d > 0 ? b0 + L * 0.3 : b1, y + 1.15, y + 2.9, { fill: o.cw || '#3a3f46', rx: 0.15 * U });
    const c0 = d > 0 ? b1 - 1.5 : b0, c1 = c0 + 1.5; rect(g, c0, c1, y + 1.15, y + 3.35, { fill: col, rx: 0.2 * U }); rect(g, c0 + 0.18, c1 - 0.18, y + 2.05, y + 3.15, { fill: '#b7dcf5', opacity: .9 });
    circ(g, c0 + 0.75, y + 2.62, 0.17, { fill: '#e7b98f' }); path(g, pd('M', [c0 + 0.53, y + 2.66], 'Q', [c0 + 0.75, y + 3.02], [c0 + 0.97, y + 2.66], 'Z'), { fill: '#ffd23e' }); rect(g, c0 + 0.5, c0 + 1.0, y + 2.05, y + 2.45, { fill: C.vest });
    rect(g, c0, c1, y + 1.5, y + 1.62, { fill: 'rgba(0,0,0,.25)' }); return { c0, c1 }; };
  const excavator = (g, x, y, d = 1) => { const q = crawler(g, x - 2.1, x + 2.1, y, '#f2b01e', d); const bx = x + d * 1.0, by = y + 2.3, e = [bx + d * 3.3, by + 2.4], s = [e[0] + d * 2.3, by - 0.3];
    line(g, [[bx, by], e], { stroke: '#f2b01e', 'stroke-width': 0.46 * U, 'stroke-linecap': 'round' }); line(g, [e, s], { stroke: '#e09d10', 'stroke-width': 0.34 * U, 'stroke-linecap': 'round' }); line(g, [[bx + d * 0.9, by + 0.2], [bx + d * 2.2, by + 1.9]], { stroke: '#c9ced4', 'stroke-width': 0.14 * U });
    poly(g, [[s[0] - d * 0.1, s[1] + 0.25], [s[0] + d * 0.85, s[1] - 0.1], [s[0] + d * 0.6, s[1] - 1.0], [s[0] - d * 0.45, s[1] - 0.75]], { fill: '#30353c' }); return q; };
  const dumper = (g, x, y, d = 1) => { rect(g, x - 3.4, x + 3.4, y + 0.55, y + 1.0, { fill: '#2b3037' }); const c0 = d > 0 ? x + 1.7 : x - 3.4; rect(g, c0, c0 + 1.7, y + 1.0, y + 2.7, { fill: '#e2e6ea', rx: .2 * U }); rect(g, c0 + (d > 0 ? 0.55 : 0.2), c0 + (d > 0 ? 1.5 : 1.15), y + 1.75, y + 2.5, { fill: '#b7dcf5' });
    const b0 = d > 0 ? x - 3.4 : x - 1.5; poly(g, [[b0, y + 1.05], [b0 + 4.9, y + 1.05], [b0 + 4.9 + (d > 0 ? 0 : 0.4), y + 2.6], [b0 - (d > 0 ? 0.4 : 0), y + 2.6]], { fill: '#d9772b' }); path(g, pd('M', [b0 + 0.2, y + 2.6], 'Q', [b0 + 2.45, y + 3.5], [b0 + 4.7, y + 2.6], 'Z'), { fill: '#7b6a52' });
    for (const wx of d > 0 ? [-2.5, -1.3, 2.5] : [2.5, 1.3, -2.5]) wheel(g, x + wx, y + 0.5, 0.5); };

  // ---------- háttér: ég, csillagok, távoli dombok, fák ----------
  h('rect', { x: -300, y: -300, width: 1500, height: 1100, fill: 'url(#xsSky)' }, svg);
  { const bg = h('g', {}, svg); for (let i = 0; i < 90; i++) circ(bg, -66 + rnd(i, 1) * 132, 2.5 + rnd(i, 2) * 31, 0.04 + rnd(i, 3) * 0.09, { fill: '#dfeaff', opacity: (0.2 + rnd(i, 4) * 0.5).toFixed(2) });
    for (const [amp, base, col, ph] of [[2.2, 3.4, '#152236', 0.4], [1.3, 1.5, '#192a41', 2.1]]) { const pts = [[-70, -12]]; for (let x = -70; x <= 70; x += 2) pts.push([x, base + amp * Math.sin(x * 0.085 + ph) + 0.6 * Math.sin(x * 0.31 + ph * 3)]); pts.push([70, -12]); poly(bg, pts, { fill: col }); }
    for (const [x, s] of [[-63, .8], [-40.6, .85], [-1.2, .9], [40.5, .95], [48.5, 1.05], [59, .85]]) tree(bg, x, s); }
  h('rect', { x: X(-66) - 4, y: Y(-31), width: 132 * U + 8, height: 60, fill: '#20252c' }, svg);

  // ---------- talaj: ismeretlen (1) és feltárt (2–) ----------
  const body = [...SURF, [66, -31], [-66, -31]];
  const gU = G(1, 2); poly(gU, body, { fill: '#272c34' }); poly(gU, body, { fill: 'url(#pU)' });
  { const q = sub(gU, { 'clip-path': 'url(#xsSoil)' }); [-4.4, -10.6, -19.2].forEach((y0, i) => { const pts = []; for (let x = -66; x <= 66; x += 3) pts.push([x, y0 + 0.7 * Math.sin(x * 0.16 + i * 2.1)]); line(q, pts, { stroke: '#fff', 'stroke-width': 0.07 * U, 'stroke-dasharray': '5 6', opacity: .12 }); }); }
  const gL = G(2, 99);
  const L = (pts, fill, p) => { poly(gL, pts, { fill }); if (p) poly(gL, pts, { fill: `url(#${p})` }); };
  L([[-45.8, -6.2], [-45, -5], [-43.5, -5], [-36, 0], [66, 0], [66, -1.2], [-36, -1.2], [-43.5, -6.2]], C.fillS, 'pF');
  L([[-66, -5], [-59, -5], [-58.2, -6.2], [-66, -6.2]], C.fillS, 'pF');
  L([[-66, -6.2], [-58.2, -6.2], [-57, -8], [-47, -8], [-45.8, -6.2], [-43.5, -6.2], [-36, -1.2], [xb(-1.2), -1.2], [xb(-9), -9], [-66, -9]], C.sand, 'pS');
  L([[xb(-1.2), -1.2], [66, -1.2], [66, -9], [xb(-9), -9]], C.clay, 'pC');
  { const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; pts.push([19 + 10.5 * Math.cos(a), -4.3 + 1.55 * Math.sin(a)]); } L(pts, C.peat, 'pP'); poly(gL, pts, { fill: 'none', stroke: 'rgba(0,0,0,.45)', 'stroke-width': 0.06 * U }); }
  L([[-66, -9], [66, -9], [66, -18], [-66, -18]], C.grav, 'pG');
  L([[-66, -18], [66, -18], [66, -31], [-66, -31]], C.hard, 'pH');
  for (const pts of [[[-43.5, -6.2], [-36, -1.2], [66, -1.2]], [[xb(-1.2), -1.2], [xb(-9), -9]], [[-66, -9], [66, -9]], [[-66, -18], [66, -18]]]) line(gL, pts, { stroke: 'rgba(20,14,8,.5)', 'stroke-width': 0.07 * U });
  h('rect', { x: X(-66), y: Y(0), width: 132 * U, height: 31 * U, fill: 'url(#xsDeep)', 'clip-path': 'url(#xsSoil)' }, svg);
  // terepszint: fű, út
  { const sf = h('g', {}, svg); const strip = (pts, col, t = 0.3) => poly(sf, pts.concat(pts.slice().reverse().map(([x, y]) => [x, y - t])), { fill: col });
    strip([[-66, -5], [-59, -5]], C.grass); strip([[-59, -5], [-57, -8], [-47, -8], [-45, -5]], '#7d6f58', 0.25); strip([[-45, -5], [-43.5, -5], [-36, 0], [-13, 0]], C.grass); strip([[-3, 0], [66, 0]], C.grass);
    rect(sf, -13, -3, -0.42, 0, { fill: '#5a554d' }); rect(sf, -13, -3, -0.16, 0, { fill: '#2f3338' }); rect(sf, -13.25, -13, -0.3, 0.12, { fill: '#b9b4aa' }); rect(sf, -3, -2.75, -0.3, 0.12, { fill: '#b9b4aa' });
    for (let i = 0; i < 150; i++) { const x = -66 + i * 0.88 + rnd(i, 7) * 0.5; if ((x > -59.4 && x < -44.6) || (x > -13.4 && x < -2.6)) continue; const y = ysurf(x), hh = 0.16 + rnd(i, 8) * 0.22; poly(sf, [[x - 0.09, y], [x + 0.02 + (rnd(i, 9) - .5) * 0.2, y + hh], [x + 0.11, y]], { fill: rnd(i, 5) > .5 ? '#67a650' : '#5a9746' }); } }
  // a folyó (a metszetre merőlegesen folyik); a 7. állomáson leapadva
  const river = (g, wl, o = {}) => { const xl = lerpx(-59, -57, (-5 - wl) / 3), xr = lerpx(-45, -47, (-5 - wl) / 3);
    for (let i = 0; i < 9; i++) ell(g, -56.4 + i * 1.1 + rnd(i, 21) * .4, -8.02, 0.34 + rnd(i, 22) * .2, 0.13, { fill: i % 2 ? '#8f8674' : '#a59c88' });
    poly(g, [[xl, wl], [-57, -8], [-47, -8], [xr, wl]], { fill: 'url(#xsWat)', opacity: .9 }); line(g, [[xl, wl], [xr, wl]], { stroke: C.sky, 'stroke-width': 0.11 * U });
    for (const [x, d] of [[-55, .7], [-51.4, 1.1], [-48.8, .6], [-53, 1.6]]) line(g, [[x - 1.1, wl - d], [x + 1.1, wl - d]], { stroke: 'rgba(207,239,255,.5)', 'stroke-width': 0.07 * U, class: 'flow' });
    for (const [x, y] of [[-59.3, -5], [-58.9, -5], [-44.9, -5], [-45.3, -5]]) for (const dx of [-.12, .06, .2]) line(g, [[x + dx, y], [x + dx * 2.2, y + 0.9 + Math.abs(dx)]], { stroke: '#7fae5a', 'stroke-width': 0.045 * U }); };
  river(G(1, 7), WL); river(G(8, 99), WL);
  const gwPts = (f, x0 = -66, x1 = 66) => { const a = []; for (let x = x0; x <= x1 + 1e-6; x += 1) a.push([x, f(x)]); return a; };
  const gwMark = (g, x, y, s = 1) => { poly(g, [[x - 0.42 * s, y + 0.75 * s], [x + 0.42 * s, y + 0.75 * s], [x, y + 0.08 * s]], { fill: C.blue }); line(g, [[x - 0.36 * s, y - 0.28 * s], [x + 0.36 * s, y - 0.28 * s]], { stroke: C.blue, 'stroke-width': 0.07 * s * U }); line(g, [[x - 0.2 * s, y - 0.52 * s], [x + 0.2 * s, y - 0.52 * s]], { stroke: C.blue, 'stroke-width': 0.07 * s * U }); };
  const gwLine = (g, pts) => line(g, pts, { stroke: C.blue, 'stroke-width': 0.13 * U, 'stroke-linejoin': 'round', opacity: .95 });
  for (const g of [G(2, 6), G(8, 9)]) gwLine(g, gwPts(gwY));

  // ---------- A ház: hologram (1–4), kész (6–); alaptestek ----------
  const A = { x0: -34, x1: -16 }, FX = [-33, -25, -17];
  // alaptest + falcsonk (dy: süllyedés, lefelé pozitív)
  const foot = (g, x, dy = 0, o = {}) => { if (o.holo) { rect(g, x - 1, x + 1, -1.8 - dy, -1.2 - dy, { class: 'holo' }); rect(g, x - .25, x + .25, -1.2 - dy, 0.3 - dy, { class: 'holo' }); return; }
    rect(g, x - .25, x + .25, -1.2 - dy, 0.3 - dy, { fill: '#b6b0a5', stroke: '#6f6a62', 'stroke-width': 0.04 * U }); rect(g, x - 1, x + 1, -1.8 - dy, -1.2 - dy, { fill: 'url(#xsConc)', stroke: '#6f6a62', 'stroke-width': 0.05 * U });
    for (const bx of [-.7, -.35, 0, .35, .7]) circ(g, x + bx, -1.68 - dy, 0.045, { fill: '#3a3d42' }); };
  const holoA = (g, sag = () => 0) => { const xs = []; for (let x = A.x0; x <= A.x1 + 1e-6; x += 0.5) xs.push(x);
    poly(g, xs.map(x => [x, 10.5 - sag(x)]).concat(xs.slice().reverse().map(x => [x, 0.3 - sag(x)])), { class: 'holo' });
    for (const y of [3.6, 6.9]) line(g, xs.map(x => [x, y - sag(x)]), { stroke: C.holo, 'stroke-width': 0.06 * U, 'stroke-dasharray': '4 4', opacity: .7 });
    for (const x of [-30, -22, -28, -20]) line(g, [[x, 0.3 - sag(x)], [x, 10.5 - sag(x)]], { stroke: C.holo, 'stroke-width': 0.04 * U, 'stroke-dasharray': '2 5', opacity: .35 });
    for (let f = 0; f < 3; f++) for (let c = 0; c < 6; c++) { const cx = A.x0 + 1.5 + c * 3; rect(g, cx - .65, cx + .65, 1.55 + f * 3.3 - sag(cx), 2.85 + f * 3.3 - sag(cx), { fill: 'none', stroke: C.holo, 'stroke-width': 0.035 * U, opacity: .45 }); } };
  const gHA = G(1, 5); holoA(gHA);
  const gA = G(6, 99);
  { for (const x of FX) foot(gA, x);
    rect(gA, A.x0, A.x1, 0.3, 10.5, { fill: '#efe5cf' }); rect(gA, A.x0, A.x1, 0.0, 0.55, { fill: '#b8ad96' }); rect(gA, A.x1 - 0.5, A.x1, 0.55, 10.5, { fill: 'rgba(60,40,10,.12)' });
    for (const y of [3.75, 7.05]) rect(gA, A.x0, A.x1, y - 0.07, y + 0.07, { fill: '#d6c9ac' });
    for (let f = 0; f < 3; f++) for (let c = 0; c < 6; c++) { const cx = A.x0 + 1.5 + c * 3, y0 = 1.55 + f * 3.3; if (f === 0 && c === 3) continue; const lit = rnd(f * 7 + c, 31) > .62;
      rect(gA, cx - .78, cx + .78, y0 - .1, y0 + 1.42, { fill: '#fbf5e6' }); rect(gA, cx - .66, cx + .66, y0, y0 + 1.32, { fill: lit ? '#ffd98a' : '#3f566a' }); if (!lit) poly(gA, [[cx - .66, y0 + .5], [cx - .66, y0 + 1.32], [cx + .2, y0 + 1.32]], { fill: 'rgba(255,255,255,.12)' });
      rect(gA, cx - .03, cx + .03, y0, y0 + 1.32, { fill: '#fbf5e6' }); rect(gA, cx - .86, cx + .86, y0 - .18, y0 - .08, { fill: '#cdbf9f' }); }
    rect(gA, -25.85, -24.15, 0.3, 2.75, { fill: '#5a4232' }); rect(gA, -25.7, -25.05, 0.45, 2.6, { fill: '#6b5140' }); rect(gA, -24.95, -24.3, 0.45, 2.6, { fill: '#6b5140' }); rect(gA, -26.3, -23.7, 2.85, 3.0, { fill: '#7a7f86' });
    rect(gA, A.x0 - .3, A.x1 + .3, 10.5, 10.95, { fill: '#6a6f75' }); rect(gA, A.x0 - .3, A.x1 + .3, 10.95, 11.05, { fill: '#878d94' }); rect(gA, -31, -30.2, 10.95, 12.3, { fill: '#8a6a56' }); rect(gA, -31.1, -30.1, 12.3, 12.45, { fill: '#5d4638' });
    for (const x of [-22.4, -20.9]) poly(gA, [[x, 11.05], [x + 1.3, 11.05], [x + 1.3, 11.75], [x, 11.3]], { fill: '#27405a', stroke: '#9fb7cc', 'stroke-width': 0.03 * U }); }
  // B ház hologramja (8–9)
  const holoB = (g, yb) => { rect(g, 8, 30, yb, 26.7, { fill: 'url(#xsHolo)', stroke: C.holo, 'stroke-width': 0.09 * U, 'stroke-dasharray': '6 5' }); for (let i = 1; i < 9; i++) { const y = i * 3.3; if (y > yb) line(g, [[8, y], [30, y]], { stroke: C.holo, 'stroke-width': 0.05 * U, 'stroke-dasharray': '4 4', opacity: .55 }); }
    for (const x of [12.4, 19, 25.6]) line(g, [[x, yb], [x, 26.7]], { stroke: C.holo, 'stroke-width': 0.045 * U, 'stroke-dasharray': '2 5', opacity: .4 }); rect(g, 17.2, 20.8, Math.max(yb, 0), 26.7, { fill: 'rgba(95,227,255,.06)', stroke: C.holo, 'stroke-width': 0.04 * U, opacity: .6 }); };

  // ================= 1: bevezetés – felszerkezet, alapozás, altalaj; a terhek útja és a feszültségek; a talaj még ismeretlen =================
  const g1 = G(1, 2);
  { for (const x of FX) foot(g1, x, 0, { holo: true });
    const lobe = (x, d, w) => pd('M', [x - 1, -1.8], 'C', [x - 1 - w, -1.8 - d * 0.7], [x - w, -1.8 - d], [x, -1.8 - d], 'C', [x + w, -1.8 - d], [x + 1 + w, -1.8 - d * 0.7], [x + 1, -1.8], 'Z');
    for (const x of FX) [[7.6, 2.6, .07], [5.0, 1.8, .1], [2.8, 1.0, .17]].forEach(([d, w, a], i) => { path(g1, lobe(x, d, w), { fill: C.amber, opacity: a }); path(g1, lobe(x, d, w), { fill: 'none', stroke: C.amber, 'stroke-width': W(g1, 1.3), 'stroke-dasharray': dash(g1, 5), opacity: .5 + i * .16 }); });
    path(g1, pd('M', [A.x0 - 1.6, -1.8], 'C', [A.x0 - 5.5, -17.5], [A.x1 + 5.5, -17.5], [A.x1 + 1.6, -1.8]), { fill: 'none', stroke: C.amber, 'stroke-width': W(g1, 2), 'stroke-dasharray': dash(g1, 7), opacity: .85 });
    for (let i = 0; i < 7; i++) { const x = A.x0 + 1.5 + i * 2.5; arr(g1, x, 13.4, x, 10.9, C.yel, 1.7); }
    for (const x of FX) { line(g1, [[x, 10.3], [x, 0.9]], { stroke: C.amber, 'stroke-width': W(g1, 3.2), class: 'flow', opacity: .95 }); arr(g1, x, 1.5, x, -1.05, C.amber, 3.2); }
    lbl(g1, -15.0, 12.0, TX.loads, C.yel, 'start');
    for (const [y0, y1, t] of [[0.45, 10.5, TX.sup], [-1.8, 0.15, TX.fnd], [-12.6, -2.1, TX.grd]]) { line(g1, [[-14.9, y1], [-14.3, y1], [-14.3, y0], [-14.9, y0]], { stroke: '#fff', 'stroke-width': W(g1, 1.3), opacity: .75 }); lbl(g1, -13.6, (y0 + y1) / 2 - 0.35, t, '#fff', 'start'); }
    tag(g1, -25, -16.9, TX.str, C.amber); tag(g1, -42.6, -11.6, TX.q1, '#fff'); tag(g1, -4.9, -15.6, TX.q2, C.blue); }

  // ================= 2: talajfelderítés – fúrások maggal és mintákkal, fúrógép, CPT-kocsi a q_c görbével, talajvíz, rétegnevek =================
  const g2 = G(2, 3);
  { const BH = [-26, -1, 20], colAt = (x, y) => y > ysurf(x) - 1.2 ? '#93887a' : y > -9 ? (x < xb(y) ? '#e9c77d' : (inPeat(x, y) ? '#553722' : '#8d99a4')) : y > -18 ? '#d6c4a0' : '#7a848f';
    BH.forEach((x, i) => { const y0 = ysurf(x); rect(g2, x - 0.8, x + 0.8, -20, y0, { fill: '#f6f2e8', stroke: C.holo, 'stroke-width': W(g2, 1.5) });
      for (let y = y0; y > -20 + 1e-6; y -= 0.5) rect(g2, x - 0.62, x + 0.62, y - 0.5, y, { fill: colAt(x, y - 0.25) });
      for (let d = 1; d < 20; d++) line(g2, [[x - 0.8, y0 - d], [x - (d % 5 ? 0.5 : 0.12), y0 - d]], { stroke: '#1b1d20', 'stroke-width': W(g2, .9) });
      for (const d of [2.4, 6, 11, 15.5]) rect(g2, x + 0.98, x + 1.5, y0 - d - 0.26, y0 - d + 0.26, { fill: C.yel, stroke: '#1b1d20', 'stroke-width': W(g2, .7) });
      gwMark(g2, x - 1.6, -3.0, 0.8); });
    tag(g2, -26, 2.7, TX.bh + '1', C.holo); tag(g2, -1, 2.7, TX.bh + '2', C.holo); tag(g2, 16.9, 7.6, TX.bh + '3', C.holo);
    // tehergépkocsis fúrógép a 3. fúráson, kezelővel és segítővel
    { const x = 20; rect(g2, x - 0.07, x + 0.07, -17, 4.2, { fill: '#39414a' }); lattice(g2, x - 0.32, x + 0.32, 1.25, 9.3, '#f2b01e', 1.0, 0.06); rect(g2, x - 0.55, x + 0.55, 9.3, 9.65, { fill: '#c8452b' }); rect(g2, x - 0.55, x + 0.55, 3.5, 4.4, { fill: '#c8452b', rx: .12 * U });
      line(g2, [[x + 0.32, 6.8], [x + 3.3, 1.5]], { stroke: '#f2b01e', 'stroke-width': 0.12 * U }); rect(g2, x + 0.8, x + 7.6, 1.0, 1.42, { fill: '#2b3037' }); rect(g2, x + 2.5, x + 5.7, 1.42, 2.7, { fill: '#d9772b', rx: .12 * U }); rect(g2, x + 2.8, x + 3.6, 1.7, 2.3, { fill: '#2b3037' });
      rect(g2, x + 5.9, x + 7.7, 1.42, 3.35, { fill: '#e8eaec', rx: .2 * U }); rect(g2, x + 6.5, x + 7.5, 2.3, 3.1, { fill: '#b7dcf5' }); for (const wx of [1.9, 3.1, 6.7]) wheel(g2, x + wx, 0.52, 0.52);
      for (const ox of [1.1, 5.4]) rect(g2, x + ox - 0.1, x + ox + 0.1, 0, 1.0, { fill: '#8d949b' }); rect(g2, x - 0.6, x + 0.6, 0, 0.18, { fill: '#59616a' });
      man(g2, x - 1.5, 0, { dir: 1, arm: 1.4 }); man(g2, x + 1.5, 0, { dir: -1, vest: '#d6e63a' }); }
    // CPT-kocsi: szondarúd, kúp, csúcsellenállás-görbe
    { const x = 12, q0 = x + 0.9, qc = (y) => y > -1.2 ? 2.6 + 1.1 * Math.sin(y * 9) : inPeat(x, y) ? 0.35 : y > -9 ? 0.9 + 0.25 * Math.sin(y * 7) : 15 + 5 * Math.sin(y * 4.1) + 3 * Math.sin(y * 9.3);
      rect(g2, x - 0.05, x + 0.05, -13.6, 1.0, { fill: '#39414a' }); poly(g2, [[x - 0.12, -13.6], [x + 0.12, -13.6], [x, -14.0]], { fill: '#39414a' });
      for (const jx of [-3.1, 1.7]) rect(g2, x + jx - 0.12, x + jx + 0.12, 0, 1.0, { fill: '#8d949b' });
      rect(g2, x - 3.7, x + 2.4, 1.0, 3.95, { fill: '#e9edf0', rx: .15 * U }); rect(g2, x - 3.7, x + 2.4, 1.9, 2.35, { fill: '#2e73c9' }); rect(g2, x - 2.9, x - 1.9, 2.75, 3.5, { fill: '#b7dcf5' }); rect(g2, x + 2.4, x + 4.4, 1.0, 3.15, { fill: '#2e73c9', rx: .2 * U }); rect(g2, x + 3.0, x + 4.2, 2.1, 2.95, { fill: '#b7dcf5' });
      rect(g2, x - 3.9, x + 4.5, 0.75, 1.02, { fill: '#2b3037' }); for (const wx of [-2.5, -1.3, 3.4]) wheel(g2, x + wx, 0.5, 0.5);
      const cv = []; for (let y = 0; y >= -13.6 - 1e-6; y -= 0.2) cv.push([q0 + qc(y) * 0.2, y]); line(g2, [[q0, 0], [q0, -14.2]], { stroke: 'rgba(255,255,255,.55)', 'stroke-width': W(g2, 1) });
      for (const q of [10, 20]) line(g2, [[q0 + q * 0.2, -14.2], [q0 + q * 0.2, -13.8]], { stroke: 'rgba(255,255,255,.55)', 'stroke-width': W(g2, 1) });
      poly(g2, [[q0, 0], ...cv, [q0, -13.6]], { fill: 'rgba(255,211,107,.16)' }); line(g2, cv, { stroke: C.yel, 'stroke-width': W(g2, 2), 'stroke-linejoin': 'round' });
      tag(g2, x - 0.4, 5.6, 'CPT', C.yel); lbl(g2, q0 + 3.4, -15.4, 'q_c', C.yel); }
    // magláda a minták útjával
    rect(g2, 2.2, 4.8, 0, 0.45, { fill: '#8a6a4a', stroke: '#4a3828', 'stroke-width': 0.04 * U }); ['#93887a', '#8d99a4', '#e9c77d', '#d6c4a0', '#7a848f'].forEach((c, i) => rect(g2, 2.32 + i * 0.49, 2.74 + i * 0.49, 0.1, 0.36, { fill: c }));
    man(g2, 5.6, 0, { dir: -1, arm: 0.6, vest: '#d6e63a', hat: '#fff' }); tag(g2, -6.6, 7.4, TX.lab, '#fff'); lead(g2, 0.2, 6.17, 3.4, 0.62, '#fff', 1);
    gwMark(g2, -12.4, -3.0, 1.1); lbl(g2, -11.2, -2.45, TX.gw, C.blue, 'start');
    for (const [x, y, t] of [[-40.2, -7.2, TX.sand], [7.0, -7.3, TX.clay], [16.4, -4.7, TX.peat], [-12, -13.9, TX.gravel], [-12, -24.6, TX.hard]]) lbl(g2, x, y, t, '#fff');
    tag(g2, -40.2, 4.4, TX.fill, '#d9cdb8'); lead(g2, -40, 3.2, -38.8, -2.3, '#d9cdb8', 1); }

  // ================= 3: síkalapok – alapsík, fagyhatár, talpfeszültség; talajtörés a zónáival, felpúposodás, a teherbírás képlete =================
  const g3 = G(3, 4);
  { line(g3, [[-35.4, -0.8], [-18.6, -0.8]], { stroke: C.sky, 'stroke-width': W(g3, 1.5), 'stroke-dasharray': dash(g3, 5), opacity: .9 });
    line(g3, [[-38.6, -1.8], [-18.4, -1.8]], { stroke: '#fff', 'stroke-width': W(g3, 1.4), 'stroke-dasharray': dash(g3, 6), opacity: .85 });
    tag(g3, -36.6, 4.0, TX.frost, C.sky, { sc: .9 }); lead(g3, -35.9, 3.3, -34.9, -0.8, C.sky, 1); tag(g3, -37.2, 1.9, TX.flev, '#fff', { sc: .9 }); lead(g3, -38.2, 1.2, -38.0, -1.8, '#fff', 1);
    dim(g3, -29.2, 0, -29.2, -1.8); lbl(g3, -28.8, -1.25, 'D', '#fff', 'start', .9); dim(g3, -26, -2.6, -24, -2.6); lbl(g3, -25, -3.75, 'B', '#fff', 'middle', .9);
    // talpfeszültség a bal oldali alaptest alatt, teher a tetején
    arr(g3, -33, 4.2, -33, 0.7, C.amber, 2.8); rect(g3, -34, -32, -2.75, -1.8, { fill: 'rgba(242,165,49,.2)' }); for (const dx of [-.8, -.4, 0, .4, .8]) arr(g3, -33 + dx, -2.75, -33 + dx, -1.86, C.amber, 1.4);
    tag(g3, -34.4, -4.4, TX.cp, C.amber); arr(g3, -25, 4.2, -25, 0.7, C.amber, 2.8);
    // talajtörés a szélső alaptest alatt: aktív ék, radiális zónák, passzív ékek; a csúszólap a terepszintig fut
    { const xc = -17, yb = -1.8, b = 1, f = Math.PI / 6, al = Math.PI / 4 + f / 2, be = Math.PI / 4 - f / 2, Ap = [xc, yb - b * Math.tan(al)];
      arr(g3, xc, 4.6, xc, 0.2, C.red, 3.4);
      const zone = sub(g3, { 'clip-path': 'url(#xsSoil)' });
      poly(zone, [[xc - b, yb], Ap, [xc + b, yb]], { fill: '#c4552b', opacity: .78 });
      for (const s of [1, -1]) { const E = [xc + s * b, yb], r0 = b / Math.cos(al), th0 = s > 0 ? Math.PI + al : -al, sp = [];
        for (let i = 0; i <= 24; i++) { const d = i / 24 * Math.PI / 2, th = s > 0 ? th0 + d : th0 - d, r = r0 * Math.exp(d * Math.tan(f)); sp.push([E[0] + r * Math.cos(th), E[1] + r * Math.sin(th)]); }
        const Pp = sp[sp.length - 1], ts = (0 - Pp[1]) / Math.sin(be), Qs = [Pp[0] + s * ts * Math.cos(be), 0];
        poly(zone, [E, ...sp], { fill: '#db9a2e', opacity: .62 }); poly(zone, [E, Pp, Qs, [E[0], 0]], { fill: '#f3dd62', opacity: .4 });
        const xe = xc + s * (b + 0.05), hp = []; for (let i = 0; i <= 24; i++) { const u = i / 24; hp.push([lerpx(xe, Qs[0], u), 0.95 * Math.sin(Math.PI * u) * (1.15 - 0.45 * u)]); }
        poly(g3, hp.concat([[Qs[0], 0], [xe, 0]]), { fill: '#8c7f6c' }); poly(g3, hp.concat([[Qs[0], 0], [xe, 0]]), { fill: 'url(#pF)' }); line(g3, hp, { stroke: C.grass, 'stroke-width': 0.3 * U, 'stroke-linejoin': 'round' });
        line(g3, [E, Ap], { stroke: C.red, 'stroke-width': W(g3, 2.2) }); line(g3, [...sp, Qs], { stroke: C.red, 'stroke-width': W(g3, 2.8), 'stroke-linejoin': 'round' });
        for (const fi of [8, 16]) line(g3, [E, sp[fi]], { stroke: C.red, 'stroke-width': W(g3, 1.1), opacity: .55 });
        const m = sp[13]; arr(g3, m[0] - s * 0.5, m[1] + 0.95, m[0] + s * 0.9, m[1] + 1.25, '#2a1d12', 1.8);
        const q0 = [lerpx(Pp[0], Qs[0], .45) - s * 1.0, lerpx(Pp[1], Qs[1], .45) - 0.9]; arr(g3, q0[0] - s * 0.3, q0[1] + 0.95, q0[0] + s * 1.3, q0[1] + 1.95, '#2a1d12', 1.8); }
      foot(g3, -33); foot(g3, -25); foot(g3, xc, 0.6); arr(g3, xc, -2.5, xc, -3.3, '#2a1d12', 1.8);
      tag(g3, xc, -7.6, TX.bf, C.red); tag(g3, -7.4, 3.2, TX.heave, '#e8cf98'); lead(g3, -8.2, 2.5, -10, 1.0, '#e8cf98'); tag(g3, -7.4, -6.4, TX.slip, C.red, { sc: .9 }); lead(g3, -8.4, -5.7, -10.6, -3.6, C.red); }
    tag(g3, -21, -13.1, 'R_k/A′ = c′·N_c + q′·N_q + ½·γ′·B′·N_γ', '#fff'); }

  // ================= 4: állékonyság – elcsúszás és felborulás (hirdetőoszlop), felúszás (üres medence), általános állékonyság (rézsű) =================
  const g4 = G(4, 5);
  { for (const x of FX) foot(g4, x);
    { const Pc = { x: -14, r: 0.62, h: 3.7, fB: 2, fh: 0.6, base: -0.85 }, px = Pc.x + Pc.fB / 2, py = Pc.base, y0 = Pc.base + Pc.fh + 0.5;
      rect(g4, Pc.x - Pc.fB / 2, Pc.x + Pc.fB / 2, Pc.base, Pc.base + Pc.fh, { fill: 'none', stroke: '#fff', 'stroke-width': W(g4, 1), 'stroke-dasharray': dash(g4, 3.5), opacity: .7 }); rect(g4, Pc.x - Pc.r, Pc.x + Pc.r, y0, y0 + Pc.h, { fill: 'none', stroke: '#fff', 'stroke-width': W(g4, 1), 'stroke-dasharray': dash(g4, 3.5), opacity: .45 });
      const gp = sub(g4, { transform: `translate(${0.5 * U} 0) rotate(8 ${X(px)} ${Y(py)})` });
      rect(gp, Pc.x - Pc.fB / 2, Pc.x + Pc.fB / 2, Pc.base, Pc.base + Pc.fh, { fill: 'url(#xsConc)', stroke: '#6f6a62', 'stroke-width': 0.05 * U }); rect(gp, Pc.x - Pc.r - .1, Pc.x + Pc.r + .1, Pc.base + Pc.fh, y0, { fill: '#3b4046' });
      ['#e4553f', '#2e73c9', '#f2a531', '#158e9c'].forEach((c, i) => rect(gp, Pc.x - Pc.r + i * Pc.r / 2, Pc.x - Pc.r + (i + 1) * Pc.r / 2, y0, y0 + Pc.h, { fill: c })); rect(gp, Pc.x - Pc.r, Pc.x - Pc.r + 0.22, y0, y0 + Pc.h, { fill: 'rgba(255,255,255,.22)' }); rect(gp, Pc.x + Pc.r - 0.25, Pc.x + Pc.r, y0, y0 + Pc.h, { fill: 'rgba(0,0,0,.25)' });
      for (const yy of [1.2, 2.5]) rect(gp, Pc.x - Pc.r, Pc.x + Pc.r, y0 + yy, y0 + yy + 0.06, { fill: 'rgba(0,0,0,.3)' }); rect(gp, Pc.x - Pc.r - .12, Pc.x + Pc.r + .12, y0 + Pc.h, y0 + Pc.h + .2, { fill: '#3b4046' });
      path(gp, pd('M', [Pc.x - Pc.r, y0 + Pc.h + .2], 'Q', [Pc.x, y0 + Pc.h + 1.0], [Pc.x + Pc.r, y0 + Pc.h + .2], 'Z'), { fill: '#3b4046' });
      for (const y of [1.0, 2.2, 3.4]) { line(g4, [[-22.4, y], [-19.4, y]], { stroke: '#cfe8ff', 'stroke-width': W(g4, 2), class: 'flow', opacity: .8 }); arr(g4, -19.6, y, -15.6, y, '#cfe8ff', 2.2); } lbl(g4, -23.2, 1.8, TX.wind, '#cfe8ff', 'end');
      arr(g4, -12.2, -0.55, -8.8, -0.55, C.red, 3); tag(g4, -7.4, -4.0, TX.slide, C.red); lead(g4, -8.6, -2.9, -11.4, -0.75, C.red);
      path(g4, `M${X(-15.6)} ${Y(5.2)} A ${3.9 * U} ${3.9 * U} 0 0 1 ${X(-10.0)} ${Y(2.6)}`, { fill: 'none', stroke: C.red, 'stroke-width': W(g4, 2.6) }); arr(g4, -10.4, 3.3, -9.9, 2.3, C.red, 2.6); tag(g4, -9.6, 8.6, TX.over, C.red); }
    // felúszás: az üres medencét a talajvíz megemeli
    { const R = 1.6; rect(g4, 8, 30, -7.6, 0.2 + R, { fill: '#121820' }); rect(g4, 8, 30, -7.6, -7.6 + R, { fill: 'rgba(92,194,242,.5)' }); line(g4, gwPts(x => -7.6 + R * 0.55 + 0.12 * Math.sin(x * 2.1), 8, 30), { stroke: 'rgba(207,239,255,.6)', 'stroke-width': W(g4, 1.2) });
      poly(g4, [[8, -7.6 + R], [30, -7.6 + R], [30, 0.5 + R], [29.3, 0.5 + R], [29.3, -6.9 + R], [8.7, -6.9 + R], [8.7, 0.5 + R], [8, 0.5 + R]], { fill: 'url(#xsConc)', stroke: '#6f6a62', 'stroke-width': 0.06 * U });
      for (let i = 0; i < 7; i++) { const x = 9.6 + i * 3.1; arr(g4, x, -11.4, x, -7.9 + R, C.blue, 2.6); } lbl(g4, 31.2, -10.4, 'U', C.blue, 'start');
      arr(g4, 19, 7.4 + R, 19, 1.0 + R, C.amber, 2.8); lbl(g4, 20, 5.0 + R, 'G', C.amber, 'start'); lbl(g4, 19, -3.2 + R, TX.basin, '#cfd6dc'); tag(g4, 19, -14.4, TX.upl, C.blue);
      dim(g4, 32.4, 0, 32.4, R); }
    // általános állékonyság: a csúszólap a szélső alaptest mögül a rézsű lábáig, lamellákkal
    { const cx = -40.21, cy = 7.22, r = 12.92, a0 = Math.atan2(0 - cy, -29.5 - cx), a1 = Math.atan2(-5 - cy, -44.4 - cx), arc = []; for (let i = 0; i <= 40; i++) { const a = a0 + (a1 - a0) * i / 40; arc.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      const yArc = (x) => cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2)); const m = arc.slice(); for (let x = -44.4; x <= -29.5 + 1e-6; x += .5) m.push([x, ysurf(x)]); poly(g4, m, { fill: 'rgba(239,90,67,.26)' });
      for (let x = -43; x < -29.6; x += 1.9) line(g4, [[x, ysurf(x)], [x, yArc(x)]], { stroke: '#fff', 'stroke-width': W(g4, .9), opacity: .45 });
      line(g4, arc, { stroke: C.red, 'stroke-width': W(g4, 2.8), 'stroke-dasharray': dash(g4, 8) }); line(g4, [[-29.5, 0], [cx, cy], [-44.4, -5]], { stroke: C.red, 'stroke-width': W(g4, 1), 'stroke-dasharray': dash(g4, 3), opacity: .6 }); circ(g4, cx, cy, 0.3, { fill: C.red });
      arr(g4, -35.6, -3.2, -40.6, -5.3, C.red, 2.8); tag(g4, -36.5, -12.2, TX.glob, C.red); lead(g4, -37.6, -11, -38.6, -6.2, C.red); } }

  // ================= 5: süllyedés – a jobban terhelt középső alaptest jobban süllyed; Δσ_z és σ_g/5 metszéspontja a határmélység =================
  const g5 = G(5, 6);
  { const sE = 0.35, sM = 1.6, sag = (x) => { const u = (x + 25) / 9; return sE + (sM - sE) * (Math.abs(u) >= 1 ? 0 : Math.cos(u * Math.PI / 2) ** 2); };
    const KZ = [0, .05, .1, .2, .3, .4, .5, .6, .8, 1, 1.5, 2, 3, 4, 5, 10], KV = [1, .99, .945, .826, .739, .677, .63, .59, .524, .467, .36, .288, .203, .155, .125, .063];   // Kany, sávalap (B/L = 0)
    const kany = (zB) => { for (let i = 0; i < KZ.length - 1; i++) if (zB <= KZ[i + 1]) return KV[i] + (KV[i + 1] - KV[i]) * (zB - KZ[i]) / (KZ[i + 1] - KZ[i]); return KV[KV.length - 1]; };
    const sg5 = (z) => 19 * (1.8 + z) / 5, m0 = (p0) => { let a = 0, b = 12; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (kany(m / 2) * p0 > sg5(m)) a = m; else b = m; } return (a + b) / 2; };
    holoA(g5, sag);
    line(g5, [[-37, 0], [-13, 0]], { stroke: '#fff', 'stroke-width': W(g5, 1.1), 'stroke-dasharray': dash(g5, 5), opacity: .7 });
    const xs = []; for (let x = A.x0; x <= A.x1 + 1e-6; x += 0.5) xs.push(x);
    const P0 = [110, 190, 110], Mz = [], sc = 0.021;
    FX.forEach((x, i) => { const yb = -1.8 - sag(x), mz = m0(P0[i]); Mz.push([x, yb - mz]);
      const cv = []; for (let z = 0; z <= 9.01; z += 0.25) cv.push([x + kany(z / 2) * P0[i] * sc, yb - z]);
      poly(g5, [[x, yb], ...cv, [x, yb - 9]], { fill: 'rgba(92,194,242,.3)' }); line(g5, cv, { stroke: '#7fd0ff', 'stroke-width': W(g5, 2), 'stroke-linejoin': 'round' }); line(g5, [[x, yb], [x, yb - 9.3]], { stroke: 'rgba(255,255,255,.6)', 'stroke-width': W(g5, 1) });
      line(g5, [[x + sg5(0) * sc, yb], [x + sg5(9) * sc, yb - 9]], { stroke: '#ff9a5a', 'stroke-width': W(g5, 1.6) });
      for (const z of [1, 2, 3, 4, 5, 6]) if (z < mz) line(g5, [[x, yb - z], [x + kany(z / 2) * P0[i] * sc, yb - z]], { stroke: '#7fd0ff', 'stroke-width': W(g5, .8), opacity: .7 });
      foot(g5, x, sag(x)); const Ld = i === 1 ? 4.6 : 2.6; arr(g5, x, 1.2 + Ld - sag(x), x, 1.0 - sag(x), C.amber, i === 1 ? 4.2 : 2.4);
      h('circle', { cx: X(x + sg5(mz) * sc), cy: Y(yb - mz), r: W(g5, 3.4), fill: '#fff', stroke: C.yel, 'stroke-width': W(g5, 1.6) }, g5); });
    lbl(g5, -24.0, 8.4 - sag(-25), TX.heavier, C.amber, 'start');
    // a határmélység vonala a három metszésponton át – a nagyobb teher alatt mélyebb
    { const pts = []; for (let x = -39; x <= -10; x += 0.5) { const u = (x + 25) / 9, w = Math.abs(u) >= 1 ? 0 : Math.cos(u * Math.PI / 2) ** 2; pts.push([x, Mz[0][1] + (Mz[1][1] - Mz[0][1]) * w]); } line(g5, pts, { stroke: C.yel, 'stroke-width': W(g5, 1.8), 'stroke-dasharray': dash(g5, 7) }); lbl(g5, -10.2, Mz[0][1] + 0.55, TX.infl, C.yel, 'end'); }
    lbl(g5, -30.0, -4.4, 'Δσ_z', '#7fd0ff', 'start', .9); lbl(g5, -33.4, -9.4, 'σ_g/5', '#ff9a5a', 'end', .9);
    line(g5, xs.map(x => [x, -sag(x)]), { stroke: C.red, 'stroke-width': W(g5, 2.8) }); line(g5, [[A.x0, -sE], [A.x1, -sE]], { stroke: '#fff', 'stroke-width': W(g5, 1), 'stroke-dasharray': dash(g5, 4), opacity: .7 });
    arr(g5, -21.6, -sE + 0.2, -21.6, -sag(-21.6) - 0.05, '#fff', 1.8); lbl(g5, -21.0, -0.95, 'Δs', '#fff', 'start'); arr(g5, -14.4, 1.6, -14.4, -sE, '#fff', 2.2); lbl(g5, -13.7, 0.3, 's', '#fff', 'start');
    for (const [x0, d] of [[-30.4, 1], [-19.6, -1]]) for (const fy of [0, 3.3]) line(g5, [[x0, 3.0 + fy - sag(x0)], [x0 - d * 0.5, 2.2 + fy - sag(x0)], [x0 - d * 0.2, 1.7 + fy - sag(x0)], [x0 - d * 0.9, 0.7 + fy - sag(x0)]], { stroke: C.red, 'stroke-width': W(g5, 1.8), 'stroke-linejoin': 'round' });
    lbl(g5, -36.2, 5.2, TX.crack, C.red, 'end', .9); line(g5, [[-35.8, 5.2], [-30.9, 5.6]], { stroke: C.red, 'stroke-width': W(g5, 1.1), opacity: .8 }); tag(g5, -19, 11.3, TX.diff, C.amber); }

  // ================= 6: kedvezőtlen talaj – négy talaj négy kis metszetben; síkalap ezeken is lehet, csak több szabállyal =================
  // kis ház a metszetekhez: két sávalap, fal, nyeregtető; o.rot = [szög, x, y]: elfordulás (negatív: a jobb oldala süllyed), o.dy: egyenletes süllyedés, o.ghost: az eredeti helyzet körvonala
  const mini = (g, cx, yg, o = {}) => { const hw = (o.w || 6.2) / 2, y = yg - (o.dy || 0), q = o.rot ? sub(g, { transform: `rotate(${-o.rot[0]} ${X(o.rot[1])} ${Y(o.rot[2])})` }) : g;
    if (o.ghost) { const a = { fill: 'none', stroke: '#fff', 'stroke-width': W(g, 1), 'stroke-dasharray': dash(g, 3.5), opacity: .55 }; rect(g, cx - hw, cx + hw, yg, yg + 2.7, a); line(g, [[cx - hw - .45, yg + 2.7], [cx, yg + 4.35], [cx + hw + .45, yg + 2.7]], a); }
    for (const s of [-1, 1]) { const fx = cx + s * (hw - 0.3); rect(q, fx - 0.22, fx + 0.22, y - 0.55, y + 0.05, { fill: '#b6b0a5' }); rect(q, fx - 0.62, fx + 0.62, y - 1.0, y - 0.55, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.035 * U }); }
    rect(q, cx + hw * 0.4, cx + hw * 0.4 + 0.5, y + 3.2, y + 4.45, { fill: '#8a6a56' }); rect(q, cx + hw * 0.4 - 0.06, cx + hw * 0.4 + 0.56, y + 4.45, y + 4.58, { fill: '#5d4638' });
    rect(q, cx - hw, cx + hw, y, y + 2.7, { fill: '#efe5cf' }); rect(q, cx - hw, cx + hw, y, y + 0.3, { fill: '#b8ad96' }); rect(q, cx + hw - 0.3, cx + hw, y + 0.3, y + 2.7, { fill: 'rgba(60,40,10,.13)' });
    poly(q, [[cx - hw - .45, y + 2.7], [cx, y + 4.35], [cx + hw + .45, y + 2.7]], { fill: '#b4523b' }); poly(q, [[cx - hw - .45, y + 2.7], [cx, y + 4.35], [cx, y + 4.12], [cx - hw - .05, y + 2.7]], { fill: 'rgba(255,255,255,.16)' });
    for (const [wx, lit] of [[-hw + 0.6, 0], [hw - 1.75, 1]]) { rect(q, cx + wx, cx + wx + 1.15, y + 1.0, y + 2.05, { fill: '#fbf5e6' }); rect(q, cx + wx + .1, cx + wx + 1.05, y + 1.1, y + 1.95, { fill: lit ? '#ffd98a' : '#3f566a' }); rect(q, cx + wx + .545, cx + wx + .605, y + 1.1, y + 1.95, { fill: '#fbf5e6' }); }
    rect(q, cx - 0.45, cx + 0.45, y + 0.3, y + 2.1, { fill: '#5a4232' }); circ(q, cx + 0.28, y + 1.2, 0.05, { fill: '#e0c070' });
    (o.cracks || []).forEach(c => line(q, c.map(([a, b]) => [cx + a, y + b]), { stroke: '#7a1f12', 'stroke-width': W(g, 1.7), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })); return q; };
  const g6 = G(6, 7);
  { rect(g6, -8, 54, -8, 34, { fill: 'rgba(8,10,14,.76)' }); tag(g6, 35.4, 28.3, TX.rules, C.amber);
    const Wc = 25.2, Hc = 13.5, cells = [[-2.8, 25.6], [23.6, 25.6], [-2.8, 11.3], [23.6, 11.3]], sS = .84;
    cells.forEach(([x0, yt], i) => { const x1 = x0 + Wc, yb = yt - Hc, ys = yt - 7.3, id = 'xsC' + i; const cp = h('clipPath', { id }, defs); rect(cp, x0, x1, yb, yt, { rx: 1.0 * U });
      const c = sub(g6, { 'clip-path': `url(#${id})` }); rect(c, x0, x1, yb, yt, { fill: 'url(#xsCell)' });
      const grass = (col = '#5c9547') => rect(c, x0, x1, ys - 0.16, ys, { fill: col });
      const cr = [[[1.9, 2.6], [2.3, 1.9], [2.05, 1.5], [2.6, 0.5]], [[-0.3, 2.65], [0.1, 2.2], [-0.05, 2.12]]];
      if (i === 0) { // térfogatváltozó agyag: nyáron kiszárad és zsugorodik (a fa is szívja a vizet), csapadékos időben duzzad
        rect(c, x0, x1, yb, ys, { fill: '#7b7468' }); rect(c, x0, x1, yb, ys, { fill: 'url(#pC)' }); rect(c, x0, x1, ys - 2.3, ys, { fill: 'rgba(222,196,150,.3)' }); grass('#8f9a52');
        line(c, [[x0, ys - 2.3], [x1, ys - 2.3]], { stroke: '#fff', 'stroke-width': W(g6, 1.1), 'stroke-dasharray': dash(g6, 5), opacity: .7 });
        [[2.1, 1.5], [4.2, .9], [6.0, 1.2], [13.4, 1.7], [15.2, 1.1], [20.6, 1.6], [22.6, 1.0], [24.0, 1.4]].forEach(([dx, d], j) => poly(c, [[x0 + dx - .17, ys], [x0 + dx + .17, ys], [x0 + dx + .1 - rnd(j, 61) * .3, ys - d * .45], [x0 + dx + .12, ys - d * .7], [x0 + dx - .1 + rnd(j, 62) * .2, ys - d]], { fill: '#15110d' }));
        const tx = x0 + 17.6; for (const [ex, ey, mx, my] of [[-5.2, -1.7, -2.4, -0.3], [-3.4, -2.5, -1.2, -1.0], [-1.4, -2.9, -0.2, -1.6], [0.9, -2.6, 0.8, -1.2], [2.6, -1.6, 1.4, -0.5]]) path(c, pd('M', [tx, ys], 'Q', [tx + mx, ys + my], [tx + ex, ys + ey]), { fill: 'none', stroke: '#4a3626', 'stroke-width': 0.11 * U, 'stroke-linecap': 'round' });
        for (const [ax, ay, bx, by] of [[-7.6, -1.25, -5.9, -1.6], [-5.2, -3.3, -3.9, -2.8], [-2.2, -3.9, -1.7, -3.2]]) arr(c, tx + ax, ys + ay, tx + bx, ys + by, C.blue, 1.4);
        poly(c, [[tx - .22, ys], [tx + .22, ys], [tx + .13, ys + 2.9], [tx - .13, ys + 2.9]], { fill: '#46362a' }); for (const [dx, dy, r, col] of [[0, 4.0, 1.7, '#27503a'], [-1.1, 3.5, 1.2, '#2c5a40'], [1.1, 3.6, 1.25, '#234a35'], [-.3, 4.8, 1.2, '#346a49'], [.6, 4.5, 1.0, '#3f7d55']]) circ(c, tx + dx, ys + dy, r, { fill: col });
        mini(c, x0 + 9.5, ys, { rot: [-2.6, x0 + 6.7, ys - 1.0], cracks: cr });
        circ(c, x1 - 2.4, yt - 2.3, 2.0, { fill: 'url(#xsGlow)' }); circ(c, x1 - 2.4, yt - 2.3, 0.85, { fill: '#ffd36b' });
        for (const [ex, ey, rx, ry] of [[2.6, 3.4, 1.3, .62], [3.7, 3.7, 1.1, .6], [1.7, 3.2, .9, .45]]) ell(c, x0 + ex, ys + ey, rx, ry, { fill: '#7f8fa3' }); for (const dx of [1.5, 2.3, 3.1, 3.9]) line(c, [[x0 + dx, ys + 2.5], [x0 + dx - .25, ys + 1.7]], { stroke: C.blue, 'stroke-width': W(g6, 1.5), 'stroke-linecap': 'round', class: 'pulse' });
        arr(c, x0 + 4.9, ys - 1.75, x0 + 4.9, ys - 0.2, C.blue, 2.2); arr(c, x0 + 13.9, ys + 2.3, x0 + 13.9, ys + 0.4, C.amber, 2.2);
        lbl(g6, x0 + 1.0, ys - 1.45, TX.swell, C.blue, 'start', sS); lbl(g6, x1 - 0.9, ys - 1.45, TX.shrink, C.amber, 'end', sS); lbl(g6, x0 + 1.0, ys - 3.4, TX.active, '#e8e2d2', 'start', sS); }
      if (i === 1) { // roskadékony lösz: szárazon áll, de a csőtörés vize átáztatja – a terhelt talaj szerkezete összeomlik
        rect(c, x0, x1, yb, ys, { fill: '#d6b978' }); rect(c, x0, x1, yb, ys, { fill: 'url(#pL)' });
        ell(c, x0 + 15.8, ys - 2.6, 5.0, 3.1, { fill: 'rgba(44,92,138,.5)' }); ell(c, x0 + 15.8, ys - 2.6, 5.0, 3.1, { fill: 'url(#pS)' }); ell(c, x0 + 15.9, ys - 2.3, 3.3, 2.0, { fill: 'rgba(24,56,96,.4)' });
        poly(c, [[x0 + 11.9, ys + .05], [x0 + 13.6, ys - .5], [x0 + 16.6, ys - .62], [x0 + 19.6, ys + .05]], { fill: '#18232f' }); grass(); line(c, [[x0 + 11.9, ys - .08], [x0 + 13.6, ys - .58], [x0 + 16.6, ys - .7], [x0 + 19.6, ys - .08]], { stroke: '#5c9547', 'stroke-width': 0.16 * U, 'stroke-linejoin': 'round' }); poly(c, [[x0 + 11.9, ys + .05], [x0 + 13.6, ys - .5], [x0 + 16.6, ys - .62], [x0 + 19.6, ys + .05], [x0 + 19.6, ys + .3], [x0 + 11.9, ys + .3]], { fill: '#1b2838' });
        rect(c, x0 + 17.3, x1, ys - 1.62, ys - 1.28, { fill: '#6c8aa0' }); rect(c, x0 + 17.3, x1, ys - 1.36, ys - 1.28, { fill: 'rgba(255,255,255,.3)' }); poly(c, [[x0 + 17.3, ys - 1.62], [x0 + 16.9, ys - 1.5], [x0 + 17.15, ys - 1.42], [x0 + 16.85, ys - 1.28], [x0 + 17.3, ys - 1.28]], { fill: '#6c8aa0' });
        { const q = rot(c, -14, x0 + 15.2, ys - 1.7); rect(q, x0 + 13.6, x0 + 16.0, ys - 1.95, ys - 1.61, { fill: '#6c8aa0' }); }
        for (const [dx, dy, r] of [[16.5, -1.7, .16], [16.2, -2.2, .13], [16.9, -2.4, .12], [15.6, -2.9, .14], [16.6, -3.2, .11], [17.3, -2.0, .1]]) circ(c, x0 + dx, ys + dy, r, { fill: '#8fd6ff', class: 'pulse' });
        arr(c, x0 + 16.4, ys - 2.0, x0 + 15.9, ys - 3.6, '#8fd6ff', 1.5);
        mini(c, x0 + 9.6, ys, { rot: [-4.6, x0 + 6.8, ys - 1.0], cracks: cr }); arr(c, x0 + 13.7, ys + 3.4, x0 + 13.7, ys + 1.0, C.red, 2.4);
        tag(g6, x0 + 20.9, ys + 1.9, TX.burst, '#8fd6ff', { sc: sS }); lead(g6, x0 + 20.4, ys + 1.0, x0 + 17.2, ys - 1.4, '#8fd6ff'); lbl(g6, x0 + 15.8, ys - 5.45, TX.collapse, '#ff8e7a', 'middle', sS); }
      if (i === 2) { // feltöltés: vegyes anyag változó vastagságban egy régi gödörben – a ház egyenlőtlenül süllyed
        const og = [[x0, ys - 1.0], [x0 + 8.4, ys - 1.25], [x0 + 12.4, ys - 4.1], [x0 + 21, ys - 4.3], [x1, ys - 2.4]], oy = (x) => { for (let j = 1; j < og.length; j++) if (x <= og[j][0]) return lerpx(og[j - 1][1], og[j][1], (x - og[j - 1][0]) / (og[j][0] - og[j - 1][0])); return ys - 2.4; };
        rect(c, x0, x1, yb, ys, { fill: '#bda77e' }); rect(c, x0, x1, yb, ys, { fill: 'url(#pS)' }); poly(c, [...og, [x1, ys], [x0, ys]], { fill: '#675d51' }); poly(c, [...og, [x1, ys], [x0, ys]], { fill: 'url(#pF)' }); grass('#6f8a4a');
        for (let j = 0; j < 40; j++) { const x = x0 + 0.8 + rnd(j, 71) * (Wc - 1.6), lo = oy(x) + 0.3, hi = ys - 0.45; if (hi - lo < 0.2) continue; const y = lo + rnd(j, 72) * (hi - lo), a = (rnd(j, 73) - .5) * 70, q = rot(c, a, x, y), t = j % 5;
          if (t === 0) { rect(q, x - .42, x + .42, y - .14, y + .14, { fill: '#b4523b' }); rect(q, x - .42, x + .42, y + .08, y + .14, { fill: 'rgba(255,255,255,.18)' }); }
          else if (t === 1) poly(q, [[x - .4, y - .2], [x + .35, y - .28], [x + .5, y + .12], [x - .1, y + .3]], { fill: '#a7a39b' });
          else if (t === 2) ell(q, x, y, .55, .3, { fill: '#1b1612' });
          else if (t === 3) rect(q, x - .7, x + .7, y - .06, y + .06, { fill: '#8a6a4a' });
          else { circ(c, x, y, .34, { fill: 'none', stroke: '#111', 'stroke-width': 0.14 * U }); } }
        line(c, og, { stroke: '#fff', 'stroke-width': W(g6, 1.1), 'stroke-dasharray': dash(g6, 5), opacity: .75 });
        for (const [dx, dy, r] of [[17.4, -3.1, .13], [17.7, -2.4, .17], [17.3, -1.7, .2], [17.8, -0.9, .24]]) circ(c, x0 + dx, ys + dy, r, { fill: 'none', stroke: '#b6f0c0', 'stroke-width': W(g6, 1.2), class: 'pulse' });
        mini(c, x0 + 12.6, ys, { rot: [-5.2, x0 + 9.8, ys - 1.0], cracks: cr }); arr(c, x0 + 16.8, ys + 3.4, x0 + 16.8, ys + 1.0, C.red, 2.4);
        lbl(g6, x0 + 1.0, ys - 2.35, TX.orig, '#fff', 'start', sS); tag(g6, x1 - 3.9, ys + 1.9, TX.mixed, '#d9cdb8', { sc: sS }); lead(g6, x1 - 3.9, ys + 1.0, x1 - 3.4, ys - 1.4, '#d9cdb8'); lbl(g6, x0 + 19.2, ys - 0.85, TX.gas, '#b6f0c0', 'start', sS); }
      if (i === 3) { // szerves talaj, tőzeg: vízzel telt, nagyon összenyomható – a süllyedés évekig tart
        rect(c, x0, x1, yb, ys - 3.6, { fill: C.sand }); rect(c, x0, x1, yb, ys - 3.6, { fill: 'url(#pS)' }); rect(c, x0, x1, ys - 3.6, ys - 0.5, { fill: '#33241a' }); rect(c, x0, x1, ys - 3.6, ys - 0.5, { fill: 'url(#pP)' }); rect(c, x0, x1, ys - 0.5, ys, { fill: '#6f6558' }); grass();
        line(c, [[x0, ys - 0.8], [x1, ys - 0.8]], { stroke: C.blue, 'stroke-width': W(g6, 1.6) }); gwMark(c, x1 - 9.6, ys - 0.8, 0.62);
        poly(c, [[x0 + 2.2, ys + .05], [x0 + 3.6, ys - .72], [x0 + 9.6, ys - .72], [x0 + 11, ys + .05], [x0 + 11, ys + .3], [x0 + 2.2, ys + .3]], { fill: '#1b2838' }); line(c, [[x0 + 2.2, ys - .08], [x0 + 3.6, ys - .8], [x0 + 9.6, ys - .8], [x0 + 11, ys - .08]], { stroke: '#5c9547', 'stroke-width': 0.16 * U, 'stroke-linejoin': 'round' });
        mini(c, x0 + 6.6, ys, { dy: 0.72, ghost: true }); arr(c, x0 + 11.3, ys + 3.3, x0 + 11.3, ys + 0.9, C.red, 2.4);
        const X0 = x0 + 14.4, Y0 = ys + 4.1, Wd = 9.2, Hd = 3.4, cv = []; for (let q = 0; q <= 1.0001; q += 0.04) cv.push([X0 + Wd * q, Y0 - Hd * (0.6 * (1 - Math.exp(-7 * q)) + 0.36 * q)]);
        rect(c, X0 - 0.5, X0 + Wd + 0.6, Y0 - Hd - 0.5, Y0 + 0.3, { fill: 'rgba(8,10,14,.5)', rx: .4 * U }); arr(c, X0, Y0, X0 + Wd + 0.3, Y0, 'rgba(255,255,255,.8)', 1.2); arr(c, X0, Y0, X0, Y0 - Hd - 0.2, 'rgba(255,255,255,.8)', 1.2);
        line(c, [[X0 + Wd * 0.3, Y0], [X0 + Wd * 0.3, Y0 - Hd]], { stroke: '#fff', 'stroke-width': W(g6, .9), 'stroke-dasharray': dash(g6, 3), opacity: .45 }); line(c, cv, { stroke: '#ff9a5a', 'stroke-width': W(g6, 2.4), 'stroke-linejoin': 'round' });
        lbl(g6, X0 + Wd + 0.3, Y0 + 1.05, TX.years + ' →', '#c9cdd2', 'end', sS); lbl(g6, X0 + Wd, Y0 - 1.15, TX.settle + ' ↓', '#ff9a5a', 'end', sS); lbl(g6, x1 - 1.0, ys - 2.55, TX.peat, '#e7c69a', 'end', sS); }
      rect(g6, x0, x1, yb, yt, { fill: 'none', stroke: 'rgba(242,165,49,.6)', 'stroke-width': W(g6, 1.3), rx: 1.0 * U });
      lbl(g6, x0 + 1.0, yt - 2.0, TX.n6[i], '#fff', 'start'); }); }
  // ================= 7: külső hatások – gyors apadás és kimosás, beszakadt pince, fagy, cölöpverés rezgése, földrengés =================
  const g7 = G(7, 8);
  { const WL7 = -7.2, FL = -2.8, gw7 = (x) => x >= -28 ? -3 : -3 - 3.4 * ((-28 - x) / 17.93) ** 2;
    // földrengés: hullámfrontok a mélyből, a ház kilengése
    { const q = sub(g7, { 'clip-path': 'url(#xsSoil)' }); [77, 82, 87].forEach((r, i) => circ(q, -28, -96, r, { fill: 'none', stroke: C.yel, 'stroke-width': W(g7, 2.4), 'stroke-dasharray': dash(g7, 9), opacity: (.25 + i * .12).toFixed(2), class: 'pulse', style: `animation-delay:${(-i * 0.5).toFixed(1)}s` }));
      for (const x of [-44, -12]) arr(q, x, -19.9, x, -17.4, C.yel, 1.8, { opacity: .7 });
      for (const a of [2.4, -2.4]) rect(rot(g7, a, -25, 0), A.x0, A.x1, 0.3, 10.95, { fill: 'none', stroke: C.yel, 'stroke-width': W(g7, 1.1), 'stroke-dasharray': dash(g7, 4), opacity: .55 });
      dim(g7, -24.5, 13.5, -16.5, 13.5, C.yel); }
    // a folyó az árvíz után gyorsan leapad: a talajvíz a part felé áramlik
    river(g7, WL7); line(g7, [[-45.4, -5.6], [-46.47, WL7]], { stroke: 'rgba(20,30,40,.5)', 'stroke-width': 0.3 * U, 'stroke-linecap': 'round' });
    line(g7, [[-66, FL], [-40.2, FL]], { stroke: C.sky, 'stroke-width': W(g7, 1.3), 'stroke-dasharray': dash(g7, 6), opacity: .8 });
    lbl(g7, -48.4, FL + 0.55, TX.flood, C.sky, 'start', .85); arr(g7, -50.2, FL - 0.35, -50.2, WL7 + 0.3, C.blue, 3.2);
    { const pts = gwPts(gw7, -45, 66); pts.unshift([-45.93, -6.4]); gwLine(g7, pts); gwMark(g7, -1.9, -3, 1.0); }
    for (const s of [[[-29, -4.1], [-34, -4.5], [-39, -5.3], [-43, -6.2], [-46.0, -6.85]], [[-29, -5.6], [-35, -5.9], [-40, -6.5], [-44, -7.2], [-46.5, -7.65]], [[-29, -7.3], [-36, -7.6], [-42, -8.1], [-46.2, -8.55], [-48.2, -8.08]]]) { line(g7, s.slice(0, -1), { stroke: C.blue, 'stroke-width': W(g7, 1.6), class: 'flow', opacity: .8, 'stroke-linejoin': 'round' }); arr(g7, ...s[s.length - 2], ...s[s.length - 1], C.blue, 1.6); }
    // kimosás: a szemcséket vivő járat a parttól hátrafelé halad, az alaptest alatt üreg nyílik
    { const ch = [[-45.93, -6.4], [-43.6, -5.75], [-41, -5.0], [-38.4, -4.3], [-36.2, -3.75], [-34.2, -3.4]];
      ell(g7, -33.5, -2.9, 2.3, 1.75, { fill: 'rgba(239,90,67,.16)', stroke: C.red, 'stroke-width': W(g7, 1.2), 'stroke-dasharray': dash(g7, 4), opacity: .9 });
      line(g7, ch, { stroke: '#1a130c', 'stroke-width': 0.46 * U, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); line(g7, ch, { stroke: '#8fd6ff', 'stroke-width': W(g7, 1.4), class: 'flow', 'stroke-linejoin': 'round' });
      poly(g7, [[-34.25, -1.8], [-32.3, -1.8], [-32.0, -2.5], [-32.5, -3.3], [-33.6, -3.75], [-34.6, -3.45], [-34.95, -2.6]], { fill: '#10161d', stroke: 'rgba(0,0,0,.5)', 'stroke-width': 0.05 * U });
      for (const [x, y] of [[-33.9, -3.3], [-33.2, -3.0], [-36.9, -3.95], [-39.6, -4.65], [-42.2, -5.4], [-44.6, -6.05]]) circ(g7, x, y, 0.11, { fill: '#e9c77d', class: 'pulse' });
      poly(g7, [[-45.93, -6.3], [-46.5, -7.2], [-47.5, -7.95], [-50.0, -8.0], [-48.4, -7.65], [-47.2, -7.05]], { fill: '#e2c488', opacity: .95 });
      for (const c of [[[-33.2, 0.6], [-32.7, 1.3], [-33.0, 1.7], [-32.2, 2.9], [-32.5, 3.4], [-31.9, 4.3]], [[-33.9, 4.4], [-33.4, 5.0], [-33.6, 5.4], [-33.0, 6.3]]]) line(g7, c, { stroke: '#7a1f12', 'stroke-width': W(g7, 1.8), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      arr(g7, -35.7, 4.2, -35.7, 1.2, C.red, 2.6); }
    // beszakadt pince a ház alatt: a boltozat közepe beomlott, a szakadólapok az üreg alsó sarkaiból 45° + φ/2 alatt futnak a terepig
    { const c0 = -23.4, c1 = -19.4, fl = -2.85, sp = -1.6, cm = -21.4, t60 = 2.85 / Math.tan(Math.PI / 3), cone = [[cm - 1.9, fl], [cm - 0.6, fl + 0.95], [cm + 0.3, fl + 1.05], [cm + 1.8, fl]];
      poly(g7, [[c0 - 0.35, fl], [c0 - 0.35 - t60, 0], [c1 + 0.35 + t60, 0], [c1 + 0.35, fl]], { fill: 'rgba(239,90,67,.15)' });
      path(g7, `M${X(c0)} ${Y(fl)} L${X(c0)} ${Y(sp)} A ${2 * U} ${1.05 * U} 0 0 1 ${X(c1)} ${Y(sp)} L${X(c1)} ${Y(fl)} Z`, { fill: '#0c1118' });
      poly(g7, [[cm - 1.33, -0.7], [cm - 1.0, 0.0], [cm + 1.0, 0.0], [cm + 1.33, -0.7]], { fill: '#0c1118' });
      for (const [a0, a1] of [[180, 128], [52, 0]]) { const pts = []; for (let i = 0; i <= 8; i++) { const a = (a0 + (a1 - a0) * i / 8) * Math.PI / 180; pts.push([cm + 2.16 * Math.cos(a), sp + 1.21 * Math.sin(a)]); } line(g7, pts, { stroke: 'url(#pBr)', 'stroke-width': 0.32 * U }); }
      rect(g7, c0 - 0.35, c0, fl, sp, { fill: 'url(#pBr)' }); rect(g7, c1, c1 + 0.35, fl, sp, { fill: 'url(#pBr)' }); rect(g7, c0 - 0.35, c1 + 0.35, fl - 0.14, fl, { fill: '#7d4a36' });
      for (const x of [c0 - 0.35, c1]) rect(g7, x, x + 0.35, fl, fl + 0.55, { fill: 'rgba(92,194,242,.35)' });
      poly(g7, cone, { fill: C.fillS }); poly(g7, cone, { fill: 'url(#pF)' });
      for (const [dx, dy, a] of [[-1.0, 0.3, 20], [0.2, 0.8, -30], [0.9, 0.3, 10], [-0.3, 0.25, 60]]) rect(rot(g7, a, cm + dx, fl + dy), cm + dx - 0.2, cm + dx + 0.2, fl + dy - 0.07, fl + dy + 0.07, { fill: '#a5563c' });
      for (const dx of [-0.35, 0.4]) line(g7, [[cm + dx, -0.45], [cm + dx * 0.7, fl + 1.0]], { stroke: '#a39883', 'stroke-width': W(g7, 1.3), class: 'flow', opacity: .9 });
      for (const s of [-1, 1]) { const x0 = s < 0 ? c0 - 0.35 : c1 + 0.35; line(g7, [[x0, fl], [x0 + s * t60, 0]], { stroke: C.red, 'stroke-width': W(g7, 2), 'stroke-dasharray': dash(g7, 5) }); }
      for (const c of [[[-24.15, 2.75], [-23.6, 3.4], [-23.9, 3.9], [-22.72, 4.75]], [[-21.9, 0.55], [-21.5, 1.0], [-21.28, 1.45]], [[-19.72, 2.97], [-19.2, 3.6], [-19.4, 4.1], [-18.4, 5.0]], [[-19.9, 0.55], [-19.5, 1.1], [-19.72, 1.45]]]) line(g7, c, { stroke: '#7a1f12', 'stroke-width': W(g7, 1.8), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      { const pts = []; for (let i = 0; i <= 8; i++) { const a = (180 - 60 * i / 8) * Math.PI / 180; pts.push([c0 - 0.35 + 1.3 * Math.cos(a), fl + 1.3 * Math.sin(a)]); } line(g7, pts, { stroke: '#ffb4a6', 'stroke-width': W(g7, 1.1) }); }
      lbl(g7, -26.3, -2.45, '45° + φ/2', '#ffb4a6', 'end', .75); tag(g7, cm, -6.9, TX.cellar, C.red); lead(g7, cm, -5.9, cm, -3.15, C.red); }
    // fagy: a fagyhatár fölött alapozott kerti falat a jéglencsék megemelik (nagyítva a körben)
    line(g7, [[-15.9, -0.8], [-2.9, -0.8]], { stroke: C.sky, 'stroke-width': W(g7, 1.4), 'stroke-dasharray': dash(g7, 5), opacity: .9 }); lbl(g7, -8.6, -2.3, TX.frost, C.sky, 'middle', .85);
    { const q = rot(g7, 5, -14.6, -0.45); rect(q, -15.0, -14.2, -0.45, -0.12, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.035 * U }); rect(q, -14.73, -14.47, -0.12, 1.55, { fill: 'url(#pBr)' }); rect(q, -14.8, -14.4, 1.55, 1.68, { fill: '#8d8a83' }); }
    { const bx = -8.6, by = 7.0, R = 3.5; line(g7, [[-14.4, 1.8], [bx, by]], { stroke: C.sky, 'stroke-width': W(g7, 1.2), opacity: .85 });
      const cd = card(g7, bx, by), cp = h('clipPath', { id: 'xsFb' }, defs); circ(cp, bx, by, R, {}); const q = sub(cd, { 'clip-path': 'url(#xsFb)' });
      circ(q, bx, by, R, { fill: '#182434' }); rect(q, bx - R, bx + R, by - R, by - 0.3, { fill: C.fillS }); rect(q, bx - R, bx + R, by - R, by - 0.3, { fill: 'url(#pF)' }); rect(q, bx - R, bx + R, by - 2.5, by - 0.3, { fill: 'rgba(190,228,255,.3)' });
      rect(q, bx - R, bx + R, by - 0.3, by - 0.1, { fill: '#eef6fb' }); line(q, [[bx - R, by - 2.5], [bx + R, by - 2.5]], { stroke: C.sky, 'stroke-width': W(g7, 1.4), 'stroke-dasharray': dash(g7, 4) });
      for (const [dx, dy, rx] of [[-0.2, -1.72, 1.35], [0.5, -1.98, 1.1], [-0.7, -2.2, 0.9], [0.2, -2.38, 0.7]]) ell(q, bx + dx, by + dy, rx, 0.1, { fill: '#f2fbff', stroke: '#9fd8ff', 'stroke-width': W(g7, .6) });
      { const w = rot(q, 6, bx, by - 1.5); rect(w, bx - 1.25, bx + 1.25, by - 1.5, by - 0.75, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.04 * U }); rect(w, bx - 0.42, bx + 0.42, by - 0.75, by + 3.8, { fill: 'url(#pBr)' });
        line(w, [[bx - 0.42, by + 0.5], [bx - 0.1, by + 0.85], [bx - 0.2, by + 1.25], [bx + 0.42, by + 1.85]], { stroke: '#3a140c', 'stroke-width': W(g7, 1.5), 'stroke-linejoin': 'round' }); }
      for (const dx of [-2.2, 2.2]) arr(q, bx + dx, by - 2.3, bx + dx, by - 0.85, C.sky, 2);
      for (const [dx, dy] of [[-2.3, 1.4], [1.9, 2.1], [-1.5, 2.6], [2.5, 0.6]]) h('text', { x: X(bx + dx), y: Y(by + dy), 'text-anchor': 'middle', fill: '#cfe8ff', 'font-size': (8 * k(g7)).toFixed(2), opacity: .85, text: '❄' }, q);
      circ(cd, bx, by, R, { fill: 'none', stroke: C.sky, 'stroke-width': W(g7, 1.6) });
      tag(cd, bx, by + R - 0.15, TX.fheave, C.sky); lbl(cd, bx, by - R - 0.25, TX.ice, '#e6f6ff', 'middle', .85); }
    // cölöpverés: vert vasbeton cölöp, verőgép kezelővel; a rezgés a talajban terjed a ház felé
    { const px = 0.8, tip = -7.5, top = 4.4, rg = sub(g7, { transform: `translate(${0.8 * U} 0)` }), vr = sub(rg, { 'clip-path': 'url(#xsSoil)' });
      [3.5, 7, 10.5, 14, 17.5].forEach((r, i) => circ(vr, px, tip, r, { fill: 'none', stroke: C.yel, 'stroke-width': W(rg, 1.8), opacity: (.75 - i * .12).toFixed(2), class: 'wv', style: `animation-delay:${(-i * 0.52).toFixed(2)}s` }));
      rect(rg, px - 0.2, px + 0.2, tip + 0.45, top, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.04 * U }); poly(rg, [[px - 0.2, tip + 0.45], [px + 0.2, tip + 0.45], [px, tip]], { fill: '#8d8a83' });
      lattice(rg, 1.3, 1.9, 0.25, 13.4, '#f2b01e', 1.0, 0.06); rect(rg, 1.1, 2.1, 13.4, 13.75, { fill: '#c8452b' }); rect(rg, 1.15, 2.05, 0, 0.25, { fill: '#59616a' });
      rect(rg, px - 0.4, px + 0.4, top, top + 0.35, { fill: '#3a3f46' });
      { const hm = sub(rg, { class: 'hit' }); rect(hm, px - 0.5, px + 0.5, top + 0.35, top + 2.35, { fill: '#c8452b', rx: .1 * U }); rect(hm, px - 0.5, px + 0.5, top + 1.2, top + 1.4, { fill: 'rgba(0,0,0,.25)' }); rect(hm, px + 0.5, 1.35, top + 0.6, top + 2.1, { fill: '#3a3f46' }); }
      crawler(rg, 2.7, 7.7, 0, '#e3a81c', -1); rect(rg, 1.9, 2.95, 0.95, 1.25, { fill: '#59616a' }); line(rg, [[1.9, 10.6], [6.9, 2.7]], { stroke: '#e3a81c', 'stroke-width': 0.14 * U }); line(rg, [[1.9, 6.4], [4.9, 2.7]], { stroke: '#c9ced4', 'stroke-width': 0.1 * U });
      man(g7, -0.2, 0, { dir: 1, arm: 1.2 });
      for (const [dx, dy] of [[-1, 0.25], [1, 0.25], [-1, -0.25]]) line(rg, [[px + dx * 0.75, top + 0.2 + dy], [px + dx * 1.6, top + 0.2 + dy * 2.6]], { stroke: C.yel, 'stroke-width': W(rg, 1.4), 'stroke-linecap': 'round', class: 'pulse' });
      tag(g7, 8.7, 15.2, TX.pdrive, C.yel, { a: 'end' }); lbl(g7, -5.8, -9.9, TX.vib, C.yel); }
    tag(g7, -51.4, 1.3, TX.drawdown, C.blue, { a: 'start' }); lead(g7, -50.2, 0.3, -50.2, -2.2, C.blue);
    tag(g7, -40.6, -11.3, TX.erosion, C.red); lead(g7, -40.6, -10.3, -40.3, -5.0, C.red); tag(g7, -28, -19.4, TX.quake, C.yel); }

  // ================= 8: mélyalapozás – cölöpök a gyenge rétegeken át a teherbíró kavicsba; CFA-cölöpfúró, vasalás, palást- és talpellenállás, a két cölöpcsalád =================
  const PX = [10.6, 14.8, 19, 23.2, 27.4], PT = -8.4, PB = -17, PR = 0.4;
  // kész cölöp: betontest az alapsíktól a talpig, fölötte az üresfúrás a terepig (o.cage: a vasalás látszik, o.bare: csak a betontest)
  const pile = (g, x, o = {}) => { if (!o.bare) rect(g, x - PR, x + PR, PT, 0, { fill: 'rgba(16,20,26,.3)', stroke: 'rgba(255,255,255,.42)', 'stroke-width': W(g, .9), 'stroke-dasharray': dash(g, 3) });
    rect(g, x - PR, x + PR, PB, PT, { fill: o.cage ? '#ece8de' : 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.05 * U });
    if (o.cage) { for (const dx of [-0.25, 0.25]) line(g, [[x + dx, PB + 0.4], [x + dx, PT + 0.95]], { stroke: '#9a4630', 'stroke-width': 0.075 * U }); for (let y = PB + 0.6; y < PT - 0.1; y += 0.55) line(g, [[x - 0.25, y], [x + 0.25, y + 0.2]], { stroke: '#9a4630', 'stroke-width': 0.045 * U }); }
    else if (!o.bare) for (const dx of [-0.2, 0.2]) line(g, [[x + dx, PT - 0.15], [x + dx, PT + 0.95]], { stroke: '#9a4630', 'stroke-width': 0.06 * U }); };
  const mixer = (g, x, y, d = 1) => { rect(g, x - 3.3, x + 3.3, y + 0.55, y + 0.95, { fill: '#2b3037' }); const c0 = d > 0 ? x + 1.7 : x - 3.3; rect(g, c0, c0 + 1.6, y + 0.95, y + 2.75, { fill: '#e2e6ea', rx: .2 * U }); rect(g, c0 + (d > 0 ? 0.55 : 0.2), c0 + (d > 0 ? 1.4 : 1.05), y + 1.8, y + 2.55, { fill: '#b7dcf5' });
    const mx = x - d * 0.9, q = rot(g, d > 0 ? -12 : 12, mx, y + 2.3); ell(q, mx, y + 2.3, 2.35, 1.2, { fill: '#d9772b' }); ell(q, mx, y + 2.62, 2.1, 0.7, { fill: 'rgba(255,255,255,.12)' }); for (const o of [-1.2, -0.4, 0.4, 1.2]) line(q, [[mx + o - 0.25, y + 1.35 + Math.abs(o) * 0.16], [mx + o + 0.25, y + 3.25 - Math.abs(o) * 0.16]], { stroke: 'rgba(255,255,255,.35)', 'stroke-width': 0.07 * U });
    poly(g, [[x - d * 3.3, y + 0.95], [x - d * 2.5, y + 0.95], [x - d * 2.3, y + 1.9], [x - d * 3.4, y + 1.6]], { fill: '#8d949b' });
    for (const wx of d > 0 ? [-2.5, -1.4, 2.4] : [2.5, 1.4, -2.4]) wheel(g, x + wx, y + 0.5, 0.5); };
  const g8 = G(8, 9);
  { holoB(g8, -7.6); rect(g8, 7.6, 30.4, PT, -7.6, { class: 'holo' });
    line(g8, [[-7, -9], [47, -9]], { stroke: C.green, 'stroke-width': W(g8, 1.7), 'stroke-dasharray': dash(g8, 7), opacity: .95 });
    pile(g8, 14.8, { cage: true }); for (const x of [19, 23.2, 27.4]) pile(g8, x);
    { const x = 27.4; arr(g8, x, -3.2, x, -7.7, C.amber, 3.2); for (const y of [-16.3, -14.3, -12.3, -10.3]) for (const s of [-1, 1]) arr(g8, x + s * 0.78, y, x + s * 0.78, y + 1.35, C.green, 1.9); arr(g8, x, -19.9, x, -17.15, C.yel, 3.2);
      lbl(g8, 29.0, -13.3, TX.shaft, C.green, 'start'); lbl(g8, 28.4, -19.6, TX.base, C.yel, 'start'); }
    // CFA-cölöpfúró: a spirál menetei között végig talaj van (a saját mélységének megfelelő), a kihordott talaj a furat mellett gyűlik
    { const x = 10.6, tip = -14.6, hd = 3.2, scol = (y) => y > -1.2 ? '#84796a' : y > -9 ? (inPeat(x, y) ? '#4a3626' : '#6c665e') : '#a59880';
      for (let y = tip + 0.3; y < hd - 1e-6; y += 0.5) rect(g8, x - PR, x + PR, y, Math.min(hd, y + 0.52), { fill: scol(y + 0.25) });
      for (const s of [-1, 1]) line(g8, [[x + s * PR, 0], [x + s * PR, tip + 0.3]], { stroke: 'rgba(0,0,0,.5)', 'stroke-width': 0.05 * U });
      for (let y = tip + 0.45; y < hd - 0.3; y += 0.55) line(g8, [[x - PR, y], [x + PR, y + 0.3]], { stroke: '#d9dee3', 'stroke-width': 0.075 * U, 'stroke-linecap': 'round' });
      poly(g8, [[x - PR, tip + 0.3], [x + PR, tip + 0.3], [x, tip - 0.3]], { fill: '#59616a' });
      lattice(g8, 9.1, 9.7, 0.3, 19, '#f2b01e', 1.0, 0.06); rect(g8, 8.85, 9.95, 0, 0.3, { fill: '#59616a' });
      rect(g8, 9.7, 11.3, hd, hd + 1.3, { fill: '#c8452b', rx: .12 * U }); rect(g8, 10.25, 10.95, hd + 1.3, hd + 1.8, { fill: '#3a3f46' }); rect(g8, 9.95, 11.3, 0, 0.28, { fill: '#59616a' });
      crawler(g8, 2.8, 8.4, 0, '#f2b01e', 1); rect(g8, 8.15, 9.15, 1.25, 1.6, { fill: '#e09d10' }); line(g8, [[4.3, 2.7], [9.25, 10.9]], { stroke: '#e09d10', 'stroke-width': 0.14 * U }); line(g8, [[5.6, 2.8], [9.25, 7.6]], { stroke: '#c9ced4', 'stroke-width': 0.1 * U });
      path(g8, pd('M', [1.35, 1.0], 'C', [1.8, 0.2], [2.2, 0.14], [3.0, 0.14], 'L', [8.4, 0.14], 'C', [8.9, 0.14], [9.0, 0.5], [9.0, 1.4], 'L', [9.0, 13]), { fill: 'none', stroke: '#8d949b', 'stroke-width': 0.15 * U, 'stroke-linejoin': 'round' });
      { const d = pd('M', [11.3, 0], 'Q', [12.5, 1.55], [13.9, 0], 'Z'); path(g8, d, { fill: '#6f675d' }); path(g8, d, { fill: 'url(#pC)' }); }
      mixer(g8, -2.0, 0, -1); man(g8, 15.2, 0, { dir: -1, vest: '#d6e63a', arm: 1.1 });
      tag(g8, 0.6, 6.2, TX.cfa, C.amber); lead(g8, 2.6, 5.36, 4.8, 2.9, C.amber); }
    // előre szerelt vasalás (kosár) a földön
    { const x0 = 32.6, x1 = 44.2; for (const x of [33.6, 43.0]) rect(g8, x, x + 0.5, 0, 0.2, { fill: '#8a6a4a' }); for (const y of [0.24, 0.96]) line(g8, [[x0, y], [x1, y]], { stroke: '#c7694f', 'stroke-width': 0.08 * U }); for (let x = x0 + 0.2; x < x1; x += 0.5) line(g8, [[x, 0.24], [x + 0.18, 0.96]], { stroke: '#c7694f', 'stroke-width': 0.05 * U });
      man(g8, 31.4, 0, { dir: 1, arm: 1 }); tag(g8, 38.4, -2.0, TX.cage, '#f0a58f'); lead(g8, 38.4, -1.16, 38.4, 0.3, '#f0a58f'); }
    lbl(g8, -5.4, -10.6, TX.bearing, C.green, 'start'); lbl(g8, 4.4, -6.0, TX.clay, '#fff'); lbl(g8, 21.1, -4.75, TX.peat, '#f0d9b0'); lbl(g8, 1.6, -14.4, TX.gravel, '#fff'); lbl(g8, 1.6, -19.6, TX.hard, '#fff'); lbl(g8, 38.4, -6.4, TX.weak, '#e8e2d2'); gwMark(g8, 44.2, -3, 1.0);
    // a két cölöpcsalád
    { const x0 = 30.4, x1 = 45.7, yt = 11.6, yb = 4.2, cd = card(g8, x1, yt);
      rect(cd, x0, x1, yb, yt, { fill: 'rgba(10,13,17,.92)', stroke: 'rgba(242,165,49,.7)', 'stroke-width': W(g8, 1.3), rx: 0.7 * U });
      lbl(cd, (x0 + x1) / 2, yt - 1.5, TX.fam, C.amber, 'middle', .86);
      [[7.0, TX.disp], [4.6, TX.repl]].forEach(([y0, t], i) => { rect(cd, x0 + 0.7, x0 + 4.1, y0, y0 + 1.0, { fill: C.sand }); rect(cd, x0 + 0.7, x0 + 4.1, y0, y0 + 1.0, { fill: 'url(#pS)' });
        if (i === 0) { rect(cd, x0 + 2.22, x0 + 2.58, y0 + 0.12, y0 + 2.0, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.04 * U }); rect(cd, x0 + 2.05, x0 + 2.75, y0 + 2.0, y0 + 2.3, { fill: '#c8452b' }); for (const s of [-1, 1]) arr(cd, x0 + 2.4 + s * 0.3, y0 + 0.5, x0 + 2.4 + s * 1.5, y0 + 0.5, C.amber, 1.5); }
        else { rect(cd, x0 + 2.2, x0 + 2.6, y0 + 0.1, y0 + 1.0, { fill: '#10161d' }); rect(cd, x0 + 2.24, x0 + 2.56, y0 + 0.18, y0 + 2.05, { fill: '#7b6a55' }); for (let y = y0 + 0.3; y < y0 + 1.9; y += 0.3) line(cd, [[x0 + 2.24, y], [x0 + 2.56, y + 0.14]], { stroke: '#d9dee3', 'stroke-width': 0.05 * U });
          arr(cd, x0 + 3.2, y0 + 0.25, x0 + 3.2, y0 + 1.75, C.green, 1.5); path(cd, pd('M', [x0 + 0.9, y0 + 1.0], 'Q', [x0 + 1.45, y0 + 1.6], [x0 + 2.0, y0 + 1.0], 'Z'), { fill: '#7b6a55' }); }
        lbl(cd, x0 + 4.7, y0 + 0.7, t, '#fff', 'start', .8); }); } }

  // ================= 9: munkatérhatárolás – mély munkagödör: résfal két sor talajhorgonnyal, cölöpfal ferde dúccal, víztelenítés; a faltípusok alaprajzban =================
  const g9 = G(9, 99);
  { const PL = -7.6, WT = -19.5, t30 = Math.tan(Math.PI / 6);
    holoB(g9, 0.6);
    // a gödör: szemben a túlsó fal a hevederekkel és a horgonyfejekkel
    rect(g9, 8, 30, PL, 0.1, { fill: '#2f3b49' }); for (let x = 10.2; x < 29.9; x += 2.2) line(g9, [[x, PL], [x, -0.6]], { stroke: 'rgba(255,255,255,.1)', 'stroke-width': 0.05 * U });
    rect(g9, 8, 30, -0.6, 0.1, { fill: '#465260' }); for (const y of [-2.2, -5.0]) { rect(g9, 8, 30, y - 0.17, y + 0.17, { fill: '#586575' }); for (let x = 9.1; x < 30; x += 2.2) circ(g9, x, y, 0.13, { fill: '#aeb6bf' }); }
    rect(g9, 8, 30, PL, 0.1, { fill: 'url(#xsDeep)' });
    // vasbeton alaplemez; alatta a már elkészült cölöpök (halványan), a gödörben leszívott talajvíz
    { const q = sub(g9, { opacity: .4 }); for (const x of PX) pile(q, x, { bare: true }); }
    rect(g9, 8, 30, PT - 0.12, PT, { fill: '#8d8a83' }); rect(g9, 8, 30, PT, PL, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.05 * U });
    for (const x of [12.3, 12.6, 16.9, 17.2, 21.5, 21.8]) line(g9, [[x, PL - 0.35], [x, PL + 1.15]], { stroke: '#c7694f', 'stroke-width': 0.06 * U });
    line(g9, [[8, -9.7], [30, -9.7]], { stroke: C.blue, 'stroke-width': 0.1 * U, 'stroke-dasharray': '5 4', opacity: .9 }); gwMark(g9, 21.2, -9.7, 0.8);
    { const l = gwPts(gwY, -66, 7); gwLine(g9, l); gwLine(g9, gwPts(gwY, 31, 66)); gwMark(g9, 3.4, -3, 1.0); gwMark(g9, 45.2, -3, 1.0); }
    // bal oldal: résfal fejgerendával, két sor talajhorgonnyal (30°, párhuzamosak; a befogási hossz a kavicsban)
    rect(g9, 7.0, 8.0, WT, 0.1, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.05 * U }); for (const x of [7.16, 7.84]) line(g9, [[x, WT + 0.3], [x, -0.1]], { stroke: '#9a4630', 'stroke-width': 0.04 * U, opacity: .7 });
    rect(g9, 6.75, 8.25, -0.6, 0.25, { fill: '#b9b4aa', stroke: '#5d5a54', 'stroke-width': 0.05 * U });
    for (const [yh, Lf] of [[-2.2, 14.2], [-5.0, 8.6]]) { const c = Math.cos(Math.PI / 6), F = [8 - Lf * c, yh - Lf * 0.5], E = [F[0] - 6 * c, F[1] - 3];
      line(g9, [[8.3, yh + 0.3 * t30], F], { stroke: '#d5dade', 'stroke-width': 0.07 * U }); line(g9, [F, E], { stroke: '#e6e1d6', 'stroke-width': 0.46 * U, 'stroke-linecap': 'round' }); line(g9, [F, E], { stroke: '#6b7480', 'stroke-width': 0.07 * U });
      rect(g9, 8.0, 8.34, yh - 0.32, yh + 0.32, { fill: '#5b6877', stroke: '#2b3037', 'stroke-width': 0.04 * U }); rect(rot(g9, 30, 8.34, yh + 0.1), 8.34, 8.62, yh - 0.08, yh + 0.28, { fill: '#c9ced4' }); }
    // jobb oldal: cölöpfal fejgerendával, hevederrel és ferde dúccal; a dúc a lemezen lévő támaszbakra támaszkodik
    rect(g9, 30, 31.0, WT, 0.1, { fill: 'url(#xsConc)', stroke: '#5d5a54', 'stroke-width': 0.05 * U }); rect(g9, 29.75, 31.25, -0.6, 0.25, { fill: '#b9b4aa', stroke: '#5d5a54', 'stroke-width': 0.05 * U });
    rect(g9, 29.66, 30.0, -2.52, -1.88, { fill: '#5b6877', stroke: '#2b3037', 'stroke-width': 0.04 * U });
    poly(g9, [[24.4, PL], [26.2, PL], [26.2, PL + 0.4], [25.5, PL + 1.0], [24.4, PL + 1.0]], { fill: '#a9a49a', stroke: '#5d5a54', 'stroke-width': 0.05 * U });
    line(g9, [[29.68, -2.3], [25.75, PL + 0.75]], { stroke: '#8b96a1', 'stroke-width': 0.4 * U }); line(g9, [[29.6, -2.2], [25.7, PL + 0.85]], { stroke: 'rgba(255,255,255,.35)', 'stroke-width': 0.08 * U });
    // víztelenítés: zsomp szivattyúval, a tömlő a fal mentén a felszíni ülepítőtartályba megy
    rect(g9, 9.0, 10.3, PT - 0.75, PL, { fill: '#10161d' }); rect(g9, 9.0, 10.3, PT - 0.75, PT - 0.2, { fill: 'rgba(92,194,242,.75)' }); rect(g9, 9.35, 9.95, PT - 0.6, PT + 0.15, { fill: '#f2b01e', stroke: '#2b3037', 'stroke-width': 0.04 * U });
    path(g9, pd('M', [9.65, PT + 0.15], 'C', [9.65, PL + 0.9], [8.85, PL + 0.6], [8.85, PL + 1.6], 'L', [8.85, 0.3], 'C', [8.85, 1.1], [6.9, 1.6], [5.9, 1.2]), { fill: 'none', stroke: '#3f8fd0', 'stroke-width': 0.15 * U, 'stroke-linecap': 'round' });
    rect(g9, 4.7, 6.5, 0, 1.2, { fill: '#55718a', stroke: '#2b3d4f', 'stroke-width': 0.05 * U }); rect(g9, 4.8, 6.4, 0.1, 0.85, { fill: 'rgba(92,194,242,.55)' });
    // emberek, gépek
    man(g9, 14.4, PL, { dir: 1, arm: 1.2 }); man(g9, 19.8, PL, { dir: -1, vest: '#d6e63a' }); man(g9, 2.6, 0, { dir: 1 }); man(g9, 39.9, 0, { dir: -1, arm: 1.3, vest: '#d6e63a' });
    excavator(g9, 36.6, 0, -1); dumper(g9, 44.6, 0, 1);
    // feliratok
    tag(g9, 5.6, -15.8, TX.dwall, '#fff', { a: 'end' }); lead(g9, 5.6, -15.8, 7.0, -15.8, '#fff'); tag(g9, -11.4, -5.2, TX.anchor, C.amber, { a: 'start' }); lead(g9, -3.2, -6.2, -2.6, -8.3, C.amber);
    tag(g9, 33.5, -14.4, TX.pwall, '#fff', { a: 'start' }); lead(g9, 33.5, -14.4, 31.0, -14.4, '#fff'); tag(g9, 21.0, -1.7, TX.strut, '#cfd6dc'); lead(g9, 25.1, -2.2, 28.3, -3.85, '#cfd6dc');
    tag(g9, 15.8, -4.3, TX.dewat, C.blue); lead(g9, 11.4, -5.3, 9.9, -8.2, C.blue); lbl(g9, 9.4, -2.55, TX.waling, '#cfd6dc', 'start', .85);
    lbl(g9, 31.9, -1.85, TX.capb, '#e8e2d2', 'start', .85); line(g9, [[31.8, -1.3], [31.2, -0.5]], { stroke: '#e8e2d2', 'stroke-width': W(g9, 1), class: 's2' });
    lbl(g9, 19, -22.4, TX.imperm, C.sky, 'middle', .9); for (const [x, s] of [[7.5, 1], [30.5, -1]]) line(g9, [[x, WT - 0.15], [x, -22.0], [x + s * 2.6, -22.0]], { stroke: C.sky, 'stroke-width': W(g9, 1.1), opacity: .85 });
    lbl(g9, 42.5, -6.2, TX.clay, '#fff', 'middle', .9); lbl(g9, 42.5, -11.0, TX.gravel, '#fff', 'middle', .9); lbl(g9, 42.5, -21.6, TX.hard, '#fff', 'middle', .9);
    // a faltípusok alaprajzban
    { const x0 = 32.2, x1 = 49.6, yt = 13.6, yb = 5.0, cd = card(g9, x1, yt), xi = x0 + 0.6;
      rect(cd, x0, x1, yb, yt, { fill: 'rgba(10,13,17,.92)', stroke: 'rgba(242,165,49,.7)', 'stroke-width': W(g9, 1.3), rx: 0.7 * U });
      lbl(cd, (x0 + x1) / 2, yt - 1.55, TX.plan, C.amber, 'middle', .86);
      [TX.berlin, TX.sheet, TX.pwall, TX.dwall].forEach((t, i) => { const yc = 10.6 - i * 1.62;
        if (i === 0) { for (const b of [0, 2.25]) rect(cd, xi + 0.4 + b, xi + 2.55 + b, yc + 0.1, yc + 0.3, { fill: '#b98952' }); for (const cx of [xi + 0.35, xi + 2.6, xi + 4.85]) { rect(cd, cx - 0.3, cx + 0.3, yc + 0.3, yc + 0.42, { fill: '#c9ced4' }); rect(cd, cx - 0.3, cx + 0.3, yc - 0.42, yc - 0.3, { fill: '#c9ced4' }); rect(cd, cx - 0.06, cx + 0.06, yc - 0.3, yc + 0.3, { fill: '#c9ced4' }); } }
        if (i === 1) { const pts = []; for (let j = 0; j < 3; j++) { const b = xi + j * 1.8; pts.push([b, yc - 0.3], [b + 0.35, yc - 0.3], [b + 0.6, yc + 0.3], [b + 1.25, yc + 0.3], [b + 1.5, yc - 0.3]); } pts.push([xi + 5.2, yc - 0.3]); line(cd, pts, { stroke: '#c9ced4', 'stroke-width': 0.12 * U, 'stroke-linejoin': 'round' }); }
        if (i === 2) for (const odd of [0, 1]) for (let j = odd; j < 8; j += 2) { const cx = xi + 0.42 + j * 0.622; circ(cd, cx, yc, 0.42, { fill: odd ? '#e4e0d7' : '#aaa59b', stroke: '#5d5a54', 'stroke-width': 0.035 * U }); if (odd) for (const [dx, dy] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) circ(cd, cx + dx, yc + dy, 0.05, { fill: '#9a4630' }); }
        if (i === 3) for (let j = 0; j < 3; j++) { rect(cd, xi + j * 1.733, xi + (j + 1) * 1.733, yc - 0.3, yc + 0.3, { fill: j % 2 ? '#bdb8ae' : '#dad6cd', stroke: '#5d5a54', 'stroke-width': 0.04 * U }); rect(cd, xi + j * 1.733 + 0.14, xi + (j + 1) * 1.733 - 0.14, yc - 0.17, yc + 0.17, { fill: 'none', stroke: '#9a4630', 'stroke-width': 0.035 * U }); }
        lbl(cd, x0 + 6.3, yc - 0.36, t, '#fff', 'start', .8); }); } }
  // keskeny kijelzőn a másodlagos feliratok nem látszanak: kevesebb, de nagyobb felirat marad
  { const S2T = { 1: [TX.q1, TX.q2], 2: [TX.lab, TX.fill, TX.gw, 'q_c'], 3: [TX.frost, TX.flev, 'D', 'B'], 4: [TX.wind], 6: [TX.rules, TX.years + ' →', TX.settle + ' ↓', TX.orig, TX.gas], 7: [TX.flood, '45° + φ/2', TX.frost, TX.vib], 8: [TX.weak, TX.gravel], 9: [TX.waling, TX.capb, TX.clay, TX.gravel, TX.hard] };
    labs.forEach(q => { if ((S2T[q._a] || []).includes(q._t)) q.classList.add('s2'); }); }

  // ---------- állapot és nézet ----------
  let curVB = vb(1), raf = 0, curN = 1, narrow = false;
  const applyVB = (v) => svg.setAttribute('viewBox', v.map(x => x.toFixed(1)).join(' '));
  applyVB(curVB);
  // a feliratok elrendezése az aktuális állomáson: egyik sem lóg ki a keretből, nem kerül az állomásjelző alá, és nem takarják egymást
  // (a kártyák a helyükön maradnak, a többi felirat a legkisebb eltolással tér ki); a rajz nem változik, csak a feliratcsoportok --dx/--dy értéke
  const hudEl = $('#jhud');
  function arrange() { const n = curN, [vx, vy, vw, vh] = vb(n), fr = svg.getBoundingClientRect(); if (!fr.width) return;
    const u = vw / fr.width, ls = parseFloat(svg.style.getPropertyValue('--ls')) || 1, pad = vw * 0.012, gap = pad * 0.5, placed = [];
    if (hudEl) { const r = hudEl.getBoundingClientRect(); if (r.width) placed.push([vx, vy, (r.right - fr.left) * u + gap, (r.bottom - fr.top) * u + gap]); }
    const hit = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
    const sh = (r) => { const t = Math.min(r[2], r[3]) * 0.14; return [r[0] + t, r[1] + t, r[2] - 2 * t, r[3] - 2 * t]; };
    const inFrame = (r) => { r[0] = Math.max(vx + pad, Math.min(vx + vw - pad - r[2], r[0])); r[1] = Math.max(vy + pad, Math.min(vy + vh - pad - r[3], r[1])); return r; };
    const dist = (c, r0) => Math.abs(c[0] - r0[0]) + Math.abs(c[1] - r0[1]);
    const els = labs.filter(q => q._a <= n && n < q._b && !(narrow && q.classList.contains('s2'))).sort((a, b) => (b._card || 0) - (a._card || 0));
    for (const q of els) { let bb; try { bb = q.getBBox(); } catch (e) { continue; } if (!bb.width) continue;
      const s = 1 + (ls - 1) * q._m, r0 = [q._x + bb.x * s, q._y + bb.y * s, bb.width * s, bb.height * s]; let r = inFrame(r0.slice());
      if (!q._card) for (let it = 0; it < 3; it++) { const o = placed.find(p => hit(sh(r), p)); if (!o) break;
        const c = [[r[0], o[1] + o[3] + gap], [r[0], o[1] - r[3] - gap], [o[0] + o[2] + gap, r[1]], [o[0] - r[2] - gap, r[1]]].map(([x, y]) => inFrame([x, y, r[2], r[3]])).filter(c => !placed.some(p => hit(sh(c), p)));
        if (!c.length) break; c.sort((a, b) => dist(a, r0) - dist(b, r0)); r = c[0]; }
      placed.push(r); const dx = (r[0] - r0[0]).toFixed(1) + 'px', dy = (r[1] - r0[1]).toFixed(1) + 'px';
      if (q._dx !== dx) { q._dx = dx; q.style.setProperty('--dx', dx); } if (q._dy !== dy) { q._dy = dy; q.style.setProperty('--dy', dy); } } }
  // keskeny kijelzőn a feliratok nagyobbak (a rajzhoz képest), hogy olvashatók maradjanak
  const fit = () => { const w = svg.getBoundingClientRect().width || 660; narrow = w < 480; svg.classList.toggle('nar', narrow); svg.style.setProperty('--ls', Math.max(1, Math.min(1.45, 540 / w)).toFixed(3)); arrange(); };
  fit(); addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrange);
  function set(n) { curN = n;
    groups.forEach(g => { const on = n >= g._a && n < g._b; g.classList.toggle('off', !on); g.setAttribute('aria-hidden', on ? 'false' : 'true'); }); requestAnimationFrame(arrange);
    const to = vb(n), from = curVB.slice(); cancelAnimationFrame(raf);
    if (reduce) { curVB = to; applyVB(to); return; }
    const t0 = performance.now(); const step = (now) => { const u = clamp((now - t0) / 1100); const e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; curVB = from.map((a, i) => a + (to[i] - a) * e); applyVB(curVB); if (u < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  return { set };
})();
