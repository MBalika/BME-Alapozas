// Talajtörés a sávalap alatt (3. előadás) – a Síkalapok teherbírásszámítása app törési mechanizmusa szerint:
// kétoldali Prandtl-mechanizmus, φ = 30°, c = 10 kPa, γ = 18 kN/m³, B = 2,0 m, D = 1,0 m (R_k/A′ ≈ 994 kPa).
//   aktív ék (oldalai 45° + φ/2) – az alappal együtt süllyed;
//   radiális nyírási zóna (logaritmikus spirál, r = r0·e^(θ·tg φ), π/2 szögelfordulás) – a talaj az alap éle (E) körül áramlik;
//   passzív ék (45° − φ/2) – a csúszólapon felfelé-kifelé csúszik, a takarással együtt: a terep felpúposodik, a kibukkanásnál lépcső.
// Az elmozdulásmező kinematikailag összeférő (a zónahatárokon nincs rés): az ék δ-t süllyed, a radiális zónában a talaj a spirál
// áramvonalai mentén s(θ) = δ·cos(45° + φ/2)/cos φ · e^(θ·tg φ) utat tesz meg, a passzív ék s(π/2)-t. A mozgás torzítva (δ = 0,7 m).
// Az alap éle (E) mellett a talaj nem süllyed az alappal: az alap a ráülő visszatöltéssel lecsúszik mellette, a terep az alap mellett is emelkedik.
// A talaj alakváltozása morf-animáció (egy cél, a súlya a törés mértéke); a metszet jelzőrétegei a talajjal együtt mozdulnak el.
import { THREE, Batch, mat, C, label, node, person, trackPos, trackScale, poseAt, uid } from '../lib/common.js';
import { tree2, plaque } from '../lib/kit2.js';
export const FILE = 'talajtores';
const K = 1 / 55, T = 14;
const S0v = [0.001, 0.001, 0.001], S1v = [1, 1, 1];
const COL = { act: '#C4552B', rad: '#DB9A2E', pas: '#F3DD62', slip: '#2E7D8A', soil: '#CDB98C', over: '#A98F6A', foot: '#B5BBC0', mark: '#7b6844', ink: '#2E2620' }; // a zónák színe az appé, a talajé tompább, hogy a zónák elváljanak

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'talajtores'; const tracks = [];
  const rad = Math.PI / 180, PHI = 30 * rad, k = Math.tan(PHI), A1 = 60 * rad, A2 = 30 * rad;
  const Bw = 2, D = 1, yb = -D, Z = 4.5, X = 13.4, YB = -5.8, DEL = 0.7, GR = 0.12, e1 = 0.03;
  const h = (Bw / 2) * Math.tan(A1), r0 = (Bw / 2) / Math.cos(A1), TH0 = 240 * rad;
  const E = [Bw / 2, yb], Cc = [0, yb - h];
  const Rsp = (th) => r0 * Math.exp(th * k), spPt = (th) => [E[0] + Rsp(th) * Math.cos(TH0 + th), E[1] + Rsp(th) * Math.sin(TH0 + th)];
  const F = spPt(Math.PI / 2), Gb = [F[0] + (yb - F[1]) / Math.tan(A2), yb], G = [F[0] + (0 - F[1]) / Math.tan(A2), 0];
  const xr = (y) => Gb[0] + (y - yb) / Math.tan(A2); // a passzív csúszólap a takarásban
  const sOf = (th) => DEL * Math.cos(A1) / Math.cos(PHI) * Math.exp(th * k), DP = sOf(Math.PI / 2), dp = [DP * Math.cos(A2), DP * Math.sin(A2)];
  const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); }, WB = 0.75, kk = Math.sqrt(1 + k * k);
  // melyik zónában van a pont (jobb fél, x ≥ 0)
  function zone(x, y) {
    if (y >= yb - 1e-9) { if (x < E[0]) return 'in'; return x <= xr(y) + 1e-9 ? 'over' : 'out'; }
    if (x <= E[0] && y >= yb - (E[0] - x) * Math.tan(A1)) return 'wedge';
    const dx = x - E[0], dy = y - E[1], r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) + 120 * rad;
    if (th >= -1e-9 && th <= Math.PI / 2 + 1e-9) return r <= Rsp(th) + 1e-9 ? 'fan' : 'out';
    if (th > Math.PI / 2 && y >= F[1] + (x - F[0]) * Math.tan(A2) - 1e-9) return 'pas';
    return 'out';
  }
  // a pont elmozdulása a teljes törésnél (jobb fél)
  function field(x, y, zn) {
    const dx = x - E[0], dy = y - E[1], r = Math.max(0.04, Math.hypot(dx, dy));
    if (zn === 'fan') { const th = Math.min(Math.PI / 2, Math.max(0, Math.atan2(dy, dx) + 120 * rad)), s = sOf(th), toEnd = r * kk / k * (Math.exp(k * (Math.PI / 2 - th)) - 1); let u;
      if (s <= toEnd) { const dth = Math.log(1 + s * k / (r * kk)) / k, r2 = r * Math.exp(k * dth), a = TH0 + th + dth; u = [E[0] + r2 * Math.cos(a) - x, E[1] + r2 * Math.sin(a) - y]; }
      else { const r2 = r * Math.exp(k * (Math.PI / 2 - th)), a = TH0 + Math.PI / 2, rem = s - toEnd; u = [E[0] + r2 * Math.cos(a) + rem * Math.cos(A2) - x, E[1] + r2 * Math.sin(a) + rem * Math.sin(A2) - y]; }
      const b = smooth(r / WB); return [b * u[0], b * u[1] - (1 - b) * DEL * (1 - th / (Math.PI / 2))]; } /* az E csúcsnál a zóna az alap lesüllyedő oldallapjára simul (E′–E) */
    if (zn === 'pas') { const b = smooth(r / WB); return [b * dp[0], b * dp[1]]; } /* az alap éle mellett a talaj helyben marad: az alap elcsúszik mellette */
    /* takarás: alul a passzív ékkel mozog, az alap oldala mentén alig emelkedik, kifelé a teljes emelkedés, közepén domború (felpúposodás) */
    const w = (x - E[0]) / (xr(y) - E[0]), hf = (y - yb) / D, bx = smooth((x - E[0]) / WB);
    return [dp[0] * ((1 - hf) * bx + hf * smooth((x - E[0]) / 2.4)), dp[1] * ((1 - hf) * bx + hf * (0.15 + 0.85 * smooth((x - E[0]) / 1.1) + 0.25 * Math.sin(Math.PI * w)))];
  }

  // ---- morf-hálók gyűjtése anyagonként ----
  const MM = new Map(); const bucket = (key) => { if (!MM.has(key)) MM.set(key, { pos: [], tgt: [], idx: [] }); return MM.get(key); };
  // rács: P(i, j) → [x, y] (jobb fél), mind a négy helyre (két oldal × elülső/hátsó metszetlap)
  function capGrid(key, zn, ni, nj, P, zOff) { const b = bucket(key);
    const mi = Math.floor(ni / 2), mj = Math.max(1, Math.floor(nj / 2)), p0 = P(mi, mj), p1 = P(mi + 1, mj), p2 = P(mi, mj + 1), ori = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0]) < 0; // a rács körüljárása
    for (const sx of [1, -1]) for (const sz of [1, -1]) { const base = b.pos.length / 3, zc = sz * (Z + zOff);
      for (let i = 0; i <= ni; i++) for (let j = 0; j <= nj; j++) { const [x, y] = P(i, j), u = field(x, y, zn); b.pos.push(sx * x, y, zc); b.tgt.push(sx * (x + u[0]), y + u[1], zc); }
      const flip = ((sx < 0) !== (sz < 0)) !== ori;
      for (let i = 0; i < ni; i++) for (let j = 0; j < nj; j++) { const a = base + i * (nj + 1) + j, c = a + nj + 1; if (flip) b.idx.push(a, a + 1, c, a + 1, c + 1, c); else b.idx.push(a, c, a + 1, a + 1, c, c + 1); } } }
  // radiális zóna: θ × r rács az E csúcs körül
  const NS = 40, sq = (i) => Math.pow(i / NS, 1.7); // az E csúcs felé sűrűsödő osztás; a közös éleken a hálók pontjai egybeesnek (nincs rés)
  capGrid('rad', 'fan', 24, NS, (i, j) => { const th = (Math.PI / 2) * i / 24, r = Rsp(th) * sq(j); return [E[0] + r * Math.cos(TH0 + th), E[1] + r * Math.sin(TH0 + th)]; }, e1);
  // passzív ék: E – F – Gb háromszög
  capGrid('pas', 'pas', NS, 8, (i, j) => { const a = sq(i), bb = j / 8; return [E[0] + a * ((1 - bb) * (F[0] - E[0]) + bb * (Gb[0] - E[0])), E[1] + a * ((1 - bb) * (F[1] - E[1]) + bb * (Gb[1] - E[1]))]; }, e1);
  // takarás a passzív ék felett (a gyepréteg külön anyag)
  capGrid('over', 'over', 4, NS, (i, j) => { const y = yb + (-GR - yb) * i / 4; return [E[0] + (xr(y) - E[0]) * sq(j), y]; }, e1);
  capGrid('grass', 'over', 1, NS, (i, j) => { const y = -GR + GR * i; return [E[0] + (xr(y) - E[0]) * sq(j), y]; }, e1);
  // a terep a takarás tetején (gyep), a metszetlapok között
  { const b = bucket('grass'); const n = NS;
    for (const sx of [1, -1]) { const base = b.pos.length / 3;
      for (let i = 0; i <= n; i++) for (const zc of [-(Z + e1), Z + e1]) { const x = E[0] + (G[0] - E[0]) * sq(i), u = field(x, 0, 'over'); b.pos.push(sx * x, 0, zc); b.tgt.push(sx * (x + u[0]), u[1], zc); }
      for (let i = 0; i < n; i++) { const a = base + 2 * i; if (sx > 0) b.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); else b.idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } } }
  // a kibukkanó csúszólap lépcsője: nyugalomban összezárva, a törésnél a kitolódó tömb homloka
  { const b = bucket('over'); const top = [G[0] + dp[0], dp[1]], bot = [G[0] + dp[0] + 0.42, 0.0];
    for (const sx of [1, -1]) { const base = b.pos.length / 3;
      for (const zc of [-(Z + e1), Z + e1]) { for (let q = 0; q < 3; q++) b.pos.push(sx * G[0], 0, zc); b.tgt.push(sx * G[0], 0, zc, sx * top[0], top[1], zc, sx * bot[0], bot[1], zc); }
      const q = (a, c, d) => (sx > 0 ? b.idx.push(base + a, base + c, base + d) : b.idx.push(base + a, base + d, base + c));
      q(1, 4, 2); q(4, 5, 2); q(3, 5, 4); q(0, 1, 2); } }
  // az alap mellett szabaddá váló talajfal: az alap a ráülő visszatöltéssel lesüllyed, mellette a terep megemelkedik (nyugalomban összezárva)
  { const b = bucket('over'); const yt = field(E[0], 0, 'over')[1];
    for (const sx of [1, -1]) { const base = b.pos.length / 3;
      for (const zc of [-(Z + e1), Z + e1]) { b.pos.push(sx * E[0], 0, zc, sx * E[0], 0, zc); b.tgt.push(sx * E[0], yt, zc, sx * E[0], -DEL, zc); }
      if (sx > 0) b.idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2); else b.idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3); } }
  // jelzőrétegek a metszeten: vízszintes sávok, zónánként szakaszolva (a csúszólapon elválnak)
  const MW = 0.035, statM = new Batch('jel'), wedgeRuns = [];
  const ribbon = (b, pts, tg, zc, wdt) => { const base = b.pos.length / 3; pts.forEach((p, i) => { const q = tg[i]; b.pos.push(p[0], p[1] - wdt, zc, p[0], p[1] + wdt, zc); b.tgt.push(q[0], q[1] - wdt, zc, q[0], q[1] + wdt, zc); });
    for (let i = 0; i < pts.length - 1; i++) { const a = base + 2 * i; if (zc > 0) b.idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); else b.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } };
  for (const ym of [-0.55, -1.5, -2.0, -2.5, -3.0, -3.5, -4.0, -4.5, -5.0, -5.4]) { const step = 0.04; let run = null; const runs = [];
    for (let x = -X; x <= X + 1e-6; x += step) { let zn = zone(Math.abs(x), ym); if (zn === 'in') zn = 'wedge'; const key = zn + (x < 0 ? 'L' : 'R'); const kq = zn === 'out' ? 'out' : zn === 'wedge' ? 'wedge' : key;
      if (!run || run.k !== kq) { run = { k: kq, zn, pts: [] }; runs.push(run); } run.pts.push(x); }
    for (const r of runs) { const xs = r.pts; if (xs.length < 2) continue; const a = xs[0] - step / 2, c = xs[xs.length - 1] + step / 2, n = Math.max(1, Math.round((c - a) / 0.14));
      const pts = Array.from({ length: n + 1 }, (_, i) => [a + (c - a) * i / n, ym]);
      if (r.zn === 'out') { for (const sz of [1, -1]) statM.box(c - a, 2 * MW, 0.004, mat(COL.mark), (a + c) / 2, ym, sz * (Z + 2 * e1)); }
      else if (r.zn === 'wedge') { if (ym < yb) wedgeRuns.push([a, c, ym]); }
      else { const tg = pts.map(p => { const sx = p[0] < 0 ? -1 : 1, u = field(Math.abs(p[0]), p[1], r.zn); return [p[0] + sx * u[0], p[1] + u[1]]; }); for (const sz of [1, -1]) ribbon(bucket('mark'), pts, tg, sz * (Z + 2 * e1), MW); } } }
  const MATS = { rad: mat(COL.rad), pas: mat(COL.pas), over: mat(COL.over, { ds: true }), grass: mat(C.grass, { ds: true }), mark: mat(COL.mark) };
  const morphs = [];
  for (const [key, b] of MM) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setIndex(b.idx); g.computeVertexNormals();
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(b.pos.length / 3 * 2), 2));
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(b.tgt, 3)); g2.setIndex(b.idx); g2.computeVertexNormals();
    g.morphAttributes.position = [g2.attributes.position]; g.morphAttributes.normal = [g2.attributes.normal]; g.morphTargetsRelative = false;
    g.computeBoundingBox(); g.boundingBox.expandByScalar(1.5); g.computeBoundingSphere(); g.boundingSphere.radius += 1.5;
    const m = new THREE.Mesh(g, MATS[key]); m.name = uid('talaj_' + key); m.morphTargetInfluences = [0]; m.morphTargetDictionary = { tores: 0 }; m.frustumCulled = false; root.add(m); morphs.push(m); }

  // ---- álló részek: a teherbíró talaj, a takarás a törési testen kívül, talapzat, környezet ----
  const ext = (pts, z0 = -Z, z1 = Z) => { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return g; };
  const Bs = new Batch('tomb');
  Bs.add(ext([[-X, YB], [X, YB], [X, yb], [-X, yb]]), mat(COL.soil));
  for (const s of [1, -1]) { const P = (p) => [s * p[0], p[1]], o = s > 0 ? (a) => a : (a) => a.slice().reverse();
    Bs.add(ext(o([[Gb[0], yb], [X, yb], [X, -GR], [xr(-GR), -GR]]).map(P)), mat(COL.over)); Bs.add(ext(o([[xr(-GR), -GR], [X, -GR], [X, 0], [G[0], 0]]).map(P)), mat(C.grass)); }
  Bs.boxB(2 * X + 1.4, 0.4, 2 * Z + 1.4, mat(C.base), 0, YB - 0.4, 0);
  person(Bs, -12.5, 2.2, Math.PI / 2, {}); person(Bs, 12.4, -1.0, -Math.PI / 2, { vest: '#d8e04a' });
  tree2(Bs, -12.4, -3.0, 4.2, 0); tree2(Bs, 12.5, 3.0, 3.6, 0); tree2(Bs, 12.3, -3.3, 3.0, 0);
  Bs.build(root); statM.build(root);

  // ---- az alap, a fal, a ráülő visszatöltés és az aktív ék: együtt süllyednek ----
  const nF = node(root, 'alap'); { const b = new Batch('alap'); const ZL = Z + 0.16, FH = 0.5, WT = 0.22, top = 2.9;
    b.box(Bw, FH, 2 * ZL, mat(COL.foot), 0, yb + FH / 2, 0);                                                              // vasbeton sávalap: téglalap keresztmetszet, a teteje vízszintes
    b.box(2 * WT, top - (yb + FH) - 0.3, 2 * ZL, mat('#c98f6b', { r: 0.9 }), 0, (top - 0.3 + yb + FH) / 2, 0);            // falazat
    for (let i = 0; i < 9; i++) b.box(2 * WT + 0.012, 0.03, 2 * ZL + 0.012, mat('#b47b58', { r: 0.9 }), 0, yb + FH + 0.33 + i * 0.36, 0); // habarcshézagok (soronként)
    b.box(2 * WT + 0.1, 0.3, 2 * ZL, mat('#d9d6cf'), 0, top - 0.15, 0);                                                     // koszorú
    for (const s of [1, -1]) { b.box(E[0] - WT, -GR - (yb + FH), 2 * (Z + e1), mat(COL.over), s * (E[0] + WT) / 2, (yb + FH - GR) / 2, 0); b.box(E[0] - WT, GR, 2 * (Z + e1), mat(C.grass), s * (E[0] + WT) / 2, -GR / 2, 0); }
    for (const sz of [1, -1]) { const g = new THREE.BufferGeometry(); const zc = sz * (Z + e1); g.setAttribute('position', new THREE.Float32BufferAttribute([-E[0], yb, zc, E[0], yb, zc, 0, Cc[1], zc], 3)); g.setIndex(sz > 0 ? [0, 2, 1] : [0, 1, 2]); g.computeVertexNormals(); b.add(g, mat(COL.act)); }
    for (const [a, c, ym] of wedgeRuns) for (const sz of [1, -1]) b.box(c - a, 2 * MW, 0.004, mat(COL.mark), (a + c) / 2, ym, sz * (Z + 2 * e1));
    b.build(nF); }
  // a teher: nyilak a koszorún (a törésig nőnek)
  const nL = node(nF, 'teher', [0, 2.9, 0]); { const b = new Batch('teher'); const m = mat('#2f6fd0', { r: 0.5 });
    for (const z of [-3, 0, 3]) { b.cyl(0.1, 0.1, 1.5, m, 0, 1.3, z, [0, 0, 0], 10); b.mesh(new THREE.ConeGeometry(0.3, 0.6, 14), m, [0, 0.33, z], [Math.PI, 0, 0]); }
    b.build(nL); }

  // ---- a csúszólap (a metszeten és a terepen): a törés előtt rajzolódik ki, a helyén marad ----
  const nS = node(root, 'csuszolap'); { const b = new Batch('cs'); const m = mat(COL.slip, { r: 0.6 }), w = 0.06;
    const half = [[0, Cc[1]], ...Array.from({ length: 30 }, (_, i) => spPt((Math.PI / 2) * (i + 1) / 30)), G];
    const line = [...half.slice(1).reverse().map(p => [-p[0], p[1]]), ...half];
    for (const sz of [1, -1]) { const zc = sz * (Z + 3 * e1); const pos = [], idx = [];
      line.forEach((p, i) => { const a = line[Math.max(0, i - 1)], c = line[Math.min(line.length - 1, i + 1)], L = Math.hypot(c[0] - a[0], c[1] - a[1]), nx = -(c[1] - a[1]) / L, ny = (c[0] - a[0]) / L; pos.push(p[0] - nx * w, p[1] - ny * w, zc, p[0] + nx * w, p[1] + ny * w, zc); });
      for (let i = 0; i < line.length - 1; i++) { const a = 2 * i; if (sz > 0) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); else idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); b.add(g, m); }
    for (const s of [1, -1]) b.box(0.14, 0.03, 2 * Z, m, s * (G[0] + 0.02), 0.015, 0);
    b.build(nS); nS.scale.set(...S0v); }

  // ---- elmozdulás-nyilak a metszeten (a törés alatt, az áramlás irányában vándorolnak) ----
  const arrowG = (() => { const s = new THREE.Shape(); const L = 1.0, w = 0.07, hw = 0.2, hl = 0.36; s.moveTo(-L / 2, -w); s.lineTo(L / 2 - hl, -w); s.lineTo(L / 2 - hl, -hw); s.lineTo(L / 2, 0); s.lineTo(L / 2 - hl, hw); s.lineTo(L / 2 - hl, w); s.lineTo(-L / 2, w); s.closePath(); return new THREE.ShapeGeometry(s); })();
  const arrows = []; const addArrow = (x, y, ang, len = 1) => { const n = node(root, 'nyil', [x, y, Z + 4 * e1]); const m = new THREE.Mesh(arrowG, mat(COL.ink, { r: 0.7 })); m.name = uid('nyil_m'); m.scale.set(len, len, 1); n.add(m); n.rotation.z = ang; n.scale.set(...S0v); arrows.push({ n, x, y, ang, len }); };
  addArrow(0, yb - 0.75, -Math.PI / 2, 0.85);
  for (const s of [1, -1]) { const mir = (p, a) => [s * p[0], p[1], s > 0 ? a : Math.PI - a];
    for (const [thd, rf] of [[27, 0.72], [50, 0.6], [74, 0.62]]) { const th = thd * rad, r = Rsp(th) * rf, p = [E[0] + r * Math.cos(TH0 + th), E[1] + r * Math.sin(TH0 + th)]; addArrow(...mir(p, TH0 + th + Math.PI / 2 - PHI), 0.95); }
    addArrow(...mir([4.6, yb - 0.75], A2), 1.05); addArrow(...mir([7.3, yb - 0.4], A2), 1.05); }

  // ---- idővonal: nő a teher (kis süllyedés) → kirajzolódik a csúszólap → talajtörés → áll → vissza ----
  const UT = [0, 1.0, 4.6, 5.4, 6.2, 7.0, 7.8, 8.6, 12.4, 13.2, T], UV = [0, 0, 0.05, 0.14, 0.36, 0.66, 0.9, 1, 1, 0, 0];
  tracks.push(trackPos(nF, UT, UV.map(u => [0, -DEL * u, 0])));
  for (const m of morphs) tracks.push(new THREE.NumberKeyframeTrack(m.name + '.morphTargetInfluences', UT, UV));
  nL.scale.set(1, 0.35, 1); tracks.push(trackScale(nL, [0, 1.0, 4.6, 12.4, 13.0, T], [[1, 0.35, 1], [1, 0.35, 1], [1, 1.5, 1], [1, 1.5, 1], [1, 0.35, 1], [1, 0.35, 1]]));
  tracks.push(trackScale(nS, [0, 3.6, 4.6, 12.4, 13.0, T], [S0v, S0v, S1v, S1v, S0v, S0v]));
  for (const a of arrows) { const tA = 5.2, tB = 12.3, per = 1.4, dx = Math.cos(a.ang), dy = Math.sin(a.ang), z = Z + 4 * e1, ts = [0, tA], vs = [[a.x, a.y, z], [a.x, a.y, z]];
    for (let t = tA; t < tB - 1e-6; t += per) { const t1 = Math.min(tB, t + per), f = (t1 - t) / per; ts.push(t + 0.002, t1); vs.push([a.x - 0.3 * dx, a.y - 0.3 * dy, z], [a.x + (-0.3 + 0.6 * f) * dx, a.y + (-0.3 + 0.6 * f) * dy, z]); }
    ts.push(T); vs.push([a.x, a.y, z]); tracks.push(trackPos(a.n, ts, vs));
    tracks.push(trackScale(a.n, [0, tA, tA + 0.5, tB, tB + 0.4, T], [S0v, S0v, S1v, S1v, S0v, S0v])); }

  plaque(root, lang === 'hu' ? 'Talajtörés a sávalap alatt' : 'Bearing failure beneath a strip footing', -X + 0.5, YB + 0.22, Z + 3 * e1, K, { h: 0.02, color: '#ffb23e' });
  const clips = [new THREE.AnimationClip('talajtores', T, tracks)];
  const PT = 10.2; poseAt(root, clips[0], PT);
  // állókép (iPhone – Gyorsnézet): a morf-célt a hálóba égetjük
  const pose = () => { for (const m of morphs) { const g = m.geometry, w = m.morphTargetInfluences[0], p = g.attributes.position, q = g.morphAttributes.position[0]; for (let i = 0; i < p.count * 3; i++) p.array[i] += w * (q.array[i] - p.array[i]); p.needsUpdate = true; g.morphAttributes = {}; m.morphTargetInfluences = undefined; m.morphTargetDictionary = undefined; g.computeVertexNormals(); } };

  // feliratok: két sor a terep fölött, a fal két oldalán – a táblák szélességét a szövegből számoljuk, így magyarul és angolul sem érnek össze
  const labels = (lg) => { const Gr = new THREE.Group(); Gr.name = 'feliratok'; const hu = lg === 'hu', zf = Z + 5 * e1, zb = Z + 0.9, hL = 0.024, gap = 0.5;
    const cx = document.createElement('canvas').getContext('2d'); cx.font = '600 64px Inter'; const bw = (txt) => (144 + Math.max(...txt.split('\n').map(l => cx.measureText(l).width))) / 128 * hL / K;
    const row = (items, y, x0, dir) => { let x = x0; for (const [txt, anchor, col] of items) { const w = bw(txt); label(Gr, txt, anchor, [x + dir * w / 2, y, zb], col, K, { h: hL }); x += dir * (w + gap); } };
    const sl = [F[0] + 2.6 / Math.tan(A2) * 0 + 3.0, F[1] + 3.0 * Math.tan(A2)]; // pont a passzív csúszólapon
    row([[hu ? 'felpúposodás' : 'heave', [-4.6, field(4.6, 0, 'over')[1] + 0.04, Z], C.grass], [hu ? 'takarás: q′ = γ·D' : 'overburden: q′ = γ·D', [-9.7, -0.55, zf], COL.over]], 3.4, -0.9, -1);
    row([[hu ? 'aktív ék' : 'active wedge', [-0.25, yb - DEL - 0.7, zf], COL.act], [hu ? 'csúszólap' : 'slip surface', [-sl[0], sl[1], zf], COL.slip]], 5.9, -0.9, -1);
    row([[hu ? 'passzív ék' : 'passive wedge', [7.6, -1.45, zf], COL.pas]], 3.4, 4.6, 1);
    row([[hu ? 'radiális nyírási zóna' : 'radial shear zone', [3.3, -3.5, zf], COL.rad]], 5.9, 1.0, 1);
    return Gr; };
  return { root, labels, clips, k: K, posterView: [20, 17], posterT: PT, labelT: PT, pose };
}
