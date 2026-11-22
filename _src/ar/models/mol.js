// MOL Campus, Budapest (Geotechnika) – a torony függőleges metszetben, a kari videó épülete szerint:
// lekerekített alaprajzú üvegtorony körbefutó fehér szalagpárkányokkal, ferdén levágott üvegkoronával és tetőkerttel,
// lapos, visszaléptetett pódium zöldtetővel, a torony Duna felőli oldalára felfutó üvegív.
// Alatta: négyszintes mélygarázs, körben 85 cm-es résfal 21 m mélyre, 2,2 m-es lemezalap, a torony alatt Ø1,2 m-es, 5,5 m-es cölöpök.
// Animáció (30 s): résfal (résfalgép) → cölöpök (cölöpfúró) → földkiemelés rétegenként (kotró, billencs) → alaplemez → pinceszintek
// → a torony négyszintenként nő fel a kúszódaruval, közben a pódium és az üvegív → korona és tetőkert.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale } from '../lib/common.js';
import { at, planPrism, car2, excavator, dumper, crawlerCrane, pileRig, towerCrane, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'mol-campus';
const K = 1 / 400;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

// ---- alaprajzi vonalak mentén futó felületek ----
const nrmOf = (pts) => pts.map((_, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [dz / l, -dx / l]; });
const geo = (P, Nn) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3)); return g; };
// függőleges fal a vonal mentén (kifelé „off” eltolással); az alsó és a felső él magassága szám vagy (x, z) függvény
function wallG(pts, yb, yt, off = 0) { const nr = nrmOf(pts), P = [], Nn = [], f = (v, p) => typeof v === 'function' ? v(p[0], p[1]) : v, q = pts.map((p, i) => [p[0] + nr[i][0] * off, p[1] + nr[i][1] * off]);
  for (let i = 0; i < pts.length - 1; i++) { const a = q[i], b = q[i + 1], na = nr[i], nb = nr[i + 1], a0 = f(yb, pts[i]), a1 = f(yt, pts[i]), b0 = f(yb, pts[i + 1]), b1 = f(yt, pts[i + 1]);
    P.push(a[0], a0, a[1], a[0], a1, a[1], b[0], b1, b[1], a[0], a0, a[1], b[0], b1, b[1], b[0], b0, b[1]); Nn.push(na[0], 0, na[1], na[0], 0, na[1], nb[0], 0, nb[1], na[0], 0, na[1], nb[0], 0, nb[1], nb[0], 0, nb[1]); }
  return geo(P, Nn); }
// vízszintes sáv a vonal mentén, o0 és o1 eltolás között (up: felfelé vagy lefelé néz)
function capG(pts, y, o0, o1, up = true) { const nr = nrmOf(pts), P = [], Nn = [], q = (i, o) => [pts[i][0] + nr[i][0] * o, pts[i][1] + nr[i][1] * o];
  for (let i = 0; i < pts.length - 1; i++) { const i0 = q(i, o0), i1 = q(i + 1, o0), a0 = q(i, o1), a1 = q(i + 1, o1); for (const p of (up ? [i0, i1, a0, i1, a1, a0] : [i0, a0, i1, i1, a0, a1])) { P.push(p[0], y, p[1]); Nn.push(0, up ? 1 : -1, 0); } }
  return geo(P, Nn); }
// körbefutó szalagpárkány: külső fal + felső és alsó lap
const band = (b, m, pts, y0, y1, out) => { b.add(wallG(pts, y0, y1, out), m); b.add(capG(pts, y1, 0, out, true), m); b.add(capG(pts, y0, 0, out, false), m); };

export function build({ lang }) {
  const hu = lang !== 'en';
  const root = new THREE.Group(); root.name = 'mol';
  const B = new Batch('mol'); const tracks = [], T = 30;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const grow = (n, t0, t1) => tracks.push(trackScale(n, [0, t0 - 0.001, t0, t1, T - 0.01, T], [S0, S0, SY0, S1, S1, S0])); // előtte rejtett, utána alulról (vagy felülről) kinő
  const show = (n, t0, t1) => { tracks.push(trackScale(n, [0, t0 - 0.06, t0, t1, t1 + 0.06, T], [S0, S0, S1, S1, S0, S0])); n.scale.set(...S0); }; // csak t0 és t1 között látszik (a kész állapotban nem)

  // ---- méretek (m); a metszet síkja z = 0, a torony közepén megy át ----
  const A = 23, BZ = 16, NE = 3.0, NS = 40, NFL = 28, FL = 4.25, YR = NFL * FL;           // torony: 46 × 32 m-es lekerekített alaprajz, 28 szint, 119 m
  const yTop = (x) => 133.5 - 0.413 * x;                                                    // az üvegkorona felső éle: a Duna felé (−x) 143 m, a túloldalon 124 m
  const X0 = -118, X1 = 64, Z0 = -88, GT = 0.3;                                             // talajtömb
  const PX0 = -84, PX1 = 30, PZ0 = -68, RW = 0.85, EB = -18.2, RB = -21, F = 0.3;           // munkagödör (a résfal belső síkja), kiemelési szint, résfaltalp
  const EX0 = PX0 - RW, EX1 = PX1 + RW, EZ0 = PZ0 - RW;
  const PD = { x0: -78, x1: 6, z0: -62, r: 16 }, FH = 4.2, H1 = 3 * FH, H2 = 5 * FH, SET = 3.5; // pódium: öt szint, a felső kettő visszaléptetve
  const LAY = [[2, '#a08d77'], [5.5, '#5d5852'], [0.8, '#8b7a63'], [10.2, C.gravel], [12, '#77706a']];
  const sgn = Math.sign, sp = (t, ins = 0) => { const c = Math.cos(t), s = Math.sin(t), e = 2 / NE; return [(A - ins) * sgn(c) * Math.pow(Math.abs(c), e), (BZ - ins) * sgn(s) * Math.pow(Math.abs(s), e)]; };
  const half = (ins = 0, n = NS) => Array.from({ length: n + 1 }, (_, i) => { const p = sp(Math.PI + Math.PI * i / n, ins); return [p[0], Math.min(0, p[1])]; }); // a torony hátsó fele (z ≤ 0), a Duna felőli oldaltól indulva
  // a pódium külső vonala: elöl a metszetnél indul, hátul lekerekített sarkok, a torony hátsó oldalánál ér véget
  const zTw = (x, o = 0.5) => -(BZ + o) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x) / (A + o), NE)), 1 / NE);
  const podOut = (ins = 0, k = 8) => { const x0 = PD.x0 + ins, x1 = PD.x1 - ins, z0 = PD.z0 + ins, r = Math.max(1, PD.r - ins), p = [[x0, 0]];
    for (let i = 0; i <= k; i++) { const a = Math.PI + Math.PI / 2 * i / k; p.push([x0 + r + r * Math.cos(a), z0 + r + r * Math.sin(a)]); }
    for (let i = 0; i <= k; i++) { const a = 1.5 * Math.PI + Math.PI / 2 * i / k; p.push([x1 - r + r * Math.cos(a), z0 + r + r * Math.sin(a)]); }
    p.push([x1, zTw(x1)]); return p; };
  // a pódium födémének alaprajza: a külső vonal + a torony körvonala (a torony ki van hagyva belőle)
  const podPoly = (ins = 0) => { const o = podOut(ins), x1 = PD.x1 - ins, tw = half(-0.5, 48).filter(p => p[0] < x1 - 0.3).reverse(); return o.concat(tw); };

  // ---- talajtömb rétegenként, a munkagödör kivágva ----
  let y = 0; const pit = [];
  for (const [t, col] of LAY) { const y0 = y, y1 = y - t, m = mat(col);
    box(B, m, X0, X1, y1, y0, Z0, EZ0); box(B, m, X0, EX0, y1, y0, EZ0, 0); box(B, m, EX1, X1, y1, y0, EZ0, 0); box(B, m, EX0, EX1, y1, Math.min(y0, EB), EZ0, 0);
    if (y0 > EB) pit.push([Math.max(y1, EB), y0, m]); y = y1; }
  const YB = y;
  for (const [xa, xb] of [[X0, EX0], [EX1, X1]]) box(B, mat(C.water, { em: '#2d7fd0', ei: 0.4 }), xa, xb, -8.06, -7.94, 0, 0.3); // talajvízszint
  // felszín: füves sáv, burkolt tér az épület körül, hátul út járdával
  const gr = mat('#86b565', { r: 1 }), pav = mat('#d6d1c6', { r: 0.9 });
  box(B, gr, X0, X1, 0, GT, Z0, EZ0); box(B, gr, X0, EX0, 0, GT, EZ0, 0); box(B, gr, EX1, X1, 0, GT, EZ0, 0);
  box(B, pav, EX0 - 9, EX1 + 9, GT, GT + 0.06, EZ0 - 7, EZ0); box(B, pav, EX0 - 9, EX0, GT, GT + 0.06, EZ0, 0); box(B, pav, EX1, EX1 + 9, GT, GT + 0.06, EZ0, 0);
  box(B, mat(C.asphalt), X0, X1, GT, GT + 0.05, Z0 + 1.5, Z0 + 9.5); for (let x = X0 + 5; x < X1 - 4; x += 9) box(B, mat(C.white), x, x + 4, GT + 0.05, GT + 0.08, Z0 + 5.4, Z0 + 5.6);
  box(B, pav, X0, X1, GT, GT + 0.14, Z0 + 9.5, Z0 + 12);
  for (let i = 0; i < 9; i++) tree2(B, X0 + 10 + i * 20.5, Z0 + 15 + (i % 2) * 1.2, 8 + (i % 3), GT);
  for (const [x, z] of [[X0 + 9, -52], [X0 + 16, -30], [X0 + 8, -12], [X1 - 9, -56], [X1 - 15, -34], [X1 - 8, -14], [X0 + 22, -62], [X1 - 22, -64]]) tree2(B, x, z, 7.5 + ((x + z) & 1), GT);
  for (let x = X0 + 14; x < X1 - 6; x += 26) lamp(B, x, Z0 + 10.6, GT, 7);
  [[-96, '#c23a2e', 0], [-58, '#f2f3f1', 0], [-20, '#2f6db5', 0], [18, '#3a3f46', 0], [-78, '#e9b21f', 1], [-34, '#c8ccd0', 1], [6, '#7bb662', 1], [40, '#f2f3f1', 1]].forEach(([x, c, d]) => car2(at(B, x, GT + 0.05, Z0 + (d ? 7.4 : 3.6), d ? Math.PI : 0), c, { lite: true }));

  // ---- kiemelés: a gödör talaja rétegenként fogy, felülről lefelé; a kotró és a billencs követi ----
  let tk = 5.0; const exc = [[4.8, GT]];
  for (const [ya, yb, m] of pit) { const n = node(root, 'kiemeles', [0, ya, 0]); const pb = new Batch('godor'); box(pb, m, EX0, EX1, 0, yb - ya, EZ0 + 0.02, 0); if (yb === 0) box(pb, gr, EX0, EX1, yb - ya, yb - ya + GT, EZ0 + 0.02, 0); pb.build(n);
    const dt = Math.max(0.6, (yb - ya) * 0.34); tracks.push(trackScale(n, [0, tk, tk + dt, tk + dt + 0.001, T - 0.01, T], [S1, S1, SY0, S0, S0, S1])); n.scale.set(...S0); tk += dt; exc.push([tk, ya]); }
  const tExc = tk;
  for (const [nm, x, z, ry, fn] of [['kotro', -44, -16, 0.5, (b) => excavator(b, { dig: -1.0 })], ['billencs', -31, -27, -0.35, (b) => dumper(b)], ['kotro2', 4, -40, 2.6, (b) => excavator(b, { dig: -0.8, color: '#e8862a' })]]) {
    const g = node(root, nm, [x, GT, z]); const gb = new Batch(nm); fn(at(gb, 0, 0, 0, ry)); gb.build(g);
    tracks.push(trackPos(g, exc.map(a => a[0]).concat([T]), exc.map(a => [x, a[1], z]).concat([[x, GT, z]]))); show(g, 4.7, tExc + 0.3); }

  // ---- résfal körben (85 cm), 21 m mélyre: a felszínről lefelé készül; mellette a résfalgép markolóval ----
  const gm = mat(SPEC.geo, { r: 0.7 });
  { const rf = node(root, 'resfal'); const rb = new Batch('resfal'); box(rb, gm, EX0, PX0, RB, 0, EZ0, F); box(rb, gm, PX1, EX1, RB, 0, EZ0, F); box(rb, gm, EX0, EX1, RB, 0, EZ0, PZ0);
    for (let x = PX0 + 6.5; x < PX1; x += 6.5) box(rb, mat('#9cc23a', { r: 0.7 }), x - 0.05, x + 0.05, RB, 0, EZ0 - 0.02, EZ0 + 0.02); rb.build(rf); grow(rf, 0.4, 2.6);   // a résfaltáblák hézagai
    const g = node(root, 'resfalgep', [EX0 - 8.5, GT, -16]); const gb = new Batch('resfalgep'); crawlerCrane(gb, { reach: 8.1, top: 22, grabY: -7 }); gb.build(g); show(g, 0.2, 2.8); }
  // ---- cölöpök a torony alatt (a metszetbe eső sor) és a cölöpfúró gép ----
  { const pl = node(root, 'colopok', [0, EB, 0]); const plb = new Batch('colop'); for (let x = -A + 2; x < A; x += 3) plb.cyl(0.6, 0.6, 5.5, mat(SPEC.geo, { r: 0.6 }), x, -2.75, 0, [0, 0, 0], 14); plb.build(pl); grow(pl, 2.9, 4.5);
    const g = node(root, 'colopfuro', [-10.2, GT, -6]); const gb = new Batch('colopfuro'); pileRig(gb, { mast: 22, toolY: -3 }); gb.build(g); show(g, 2.7, 4.6); }
  // ---- alaplemez ----
  { const sl = node(root, 'alaplemez', [0, EB, 0]); const slb = new Batch('lemez'); box(slb, mat('#c9c4b8'), PX0, PX1, 0, 2.2, PZ0, F); slb.build(sl); grow(sl, tExc + 0.3, tExc + 1.2); }
  // ---- pinceszintek: pillérek, födém, parkoló autók ----
  const cc = ['#c23a2e', '#2f6db5', '#e9b21f', '#f2f3f1', '#3a3f46', '#8a9299']; let tl = tExc + 1.2;
  for (let i = 1; i <= 4; i++) { const y0 = -16 + (i - 1) * 4, n = node(root, 'pince', [0, y0, 0]); const lb = new Batch('pince');
    for (let x = PX0 + 7; x < PX1; x += 8.6) for (const z of [-7.5, -26, -45]) lb.boxB(0.75, 3.62, 0.75, mat(C.concreteDark), x, 0, z);
    box(lb, mat(C.concrete), PX0, PX1, 3.62, 4, PZ0, 0); box(lb, mat('#b9b5ad'), PX0, PX1, 0, 0.04, PZ0, 0);
    for (let k = 0, x = PX0 + 4.6; x < PX1 - 3; x += 6.2, k++) { if ((k + i) % 3 === 0 || Math.abs((x - PX0 - 7) % 8.6) < 1.0) continue; car2(at(lb, x, 0.04, -3.4, (k + i) % 2 ? 0 : Math.PI), cc[(i * 2 + k) % cc.length], { lite: true }); }
    lb.build(n); grow(n, tl, tl + 0.55); tl += 0.55; }

  // ---- a torony négyszintenként: födémek, peremoszlopok, mag, üveghomlokzat fehér szalagpárkányokkal ----
  const glassM = mat('#6ea6c9', { r: 0.12, m: 0.55, ds: true }), white = mat('#f3f4f2', { r: 0.45 }), slabM = mat('#d9d6cf'), coreM = mat('#c4c0b7');
  const outl = half(0), inner = half(0.5), colP = Array.from({ length: 9 }, (_, i) => sp(Math.PI + Math.PI * (i + 0.5) / 9, 2.0));
  const tBlock = (b, f0, f1) => { const h = (f1 - f0) * FL;
    b.add(wallG(outl, 0, h), glassM); box(b, mat('#1b2730', { r: 0.2, m: 0.5 }), -1.6, 1.6, 0, h, -BZ - 0.22, -BZ + 0.1);                                  // üvegfal + a hátsó sötét sáv
    box(b, coreM, -8, 8, 0, h, -11, -0.02);                                                                                                               // vasbeton mag (lépcsők, liftek)
    for (let f = f0; f < f1; f++) { const yc = (f - f0 + 1) * FL; b.add(planPrism(inner, yc - 0.35, yc), slabM); band(b, white, outl, yc - 0.8, yc + 0.32, 0.42);
      for (const [x, z] of colP) b.boxB(0.8, FL - 0.35, 0.8, mat(C.concreteDark), x, yc - FL, z);
      for (const x of [-4.2, 4.2]) { box(b, mat('#8d979f', { m: 0.6, r: 0.35 }), x - 1.25, x + 1.25, yc - FL + 0.05, yc - FL + 2.45, -0.03, 0.03); box(b, mat('#59636d', { m: 0.5, r: 0.4 }), x - 0.03, x + 0.03, yc - FL + 0.05, yc - FL + 2.45, -0.04, 0.04); } } };                // liftajtók a magon
  const NB = 7, t0T = tl + 0.4, dB = 1.25, crane = [];
  for (let k = 0; k < NB; k++) { const f0 = k * 4, f1 = f0 + 4, n = node(root, 'torony', [0, f0 * FL, 0]); const tb = new Batch('torony'); tBlock(tb, f0, f1); tb.build(n); const t0 = t0T + k * dB; grow(n, t0, t0 + dB); crane.push([t0 + dB, f1 * FL]); }
  const tEnd = t0T + NB * dB;

  // ---- pódium: öt szint, körbefutó fehér szalagpárkányok, a felső két szint visszaléptetve (terasz), zöldtető, átrium-felülvilágító ----
  { const pod = node(root, 'podium'); const pb = new Batch('podium'); const pGlass = mat('#79aac8', { r: 0.14, m: 0.5, ds: true }), green = mat('#7fa862', { r: 1 });
    for (let f = 1; f <= 5; f++) { const ins = f > 3 ? SET : 0, y0 = (f - 1) * FH, y1 = f * FH, o = podOut(ins);
      pb.add(wallG(o, y0, y1), pGlass); band(pb, white, o, y1 - 0.75, y1 + (f === 3 || f === 5 ? 0.95 : 0.3), 0.55); pb.add(planPrism(podPoly(ins + 0.45), y1 - 0.35, y1), slabM);
      for (let x = PD.x0 + 5 + ins; x < -A - 2; x += 8.4) pb.boxB(0.7, FH - 0.35, 0.7, mat(C.concreteDark), x, y0, -3.2); }
    pb.add(capG(podOut(0), H1 + 0.18, -0.6, -SET + 0.05, true), green);                                                                                   // terasz a 3. szint fölött
    pb.add(planPrism(podPoly(SET + 0.7), H2, H2 + 0.2), green);                                                                                           // zöldtető
    const sky = [[-66, -8], [-66, -46], [-62, -50], [-38, -50], [-34, -46], [-34, -8]]; pb.add(planPrism(sky, H2 + 0.2, H2 + 0.75), mat('#8fbdd6', { r: 0.1, m: 0.45 }));
    for (let z = -46; z <= -10; z += 4.5) box(pb, white, -66.1, -33.9, H2 + 0.75, H2 + 0.9, z - 0.1, z + 0.1); box(pb, white, -50.1, -49.9, H2 + 0.75, H2 + 0.9, -50, -8);
    for (const [x, z, r0] of [[-72, -30, 1.6], [-70, -52, 1.4], [-28, -40, 1.5], [-28, -54, 1.3], [-12, -56, 1.5], [-2, -40, 1.3], [-46, -56, 1.2], [-72, -10, 1.2]]) { pb.mesh(new THREE.IcosahedronGeometry(r0, 1), mat('#5f9a4c', { r: 1 }), [x, H2 + 0.2 + r0 * 1.2, Math.max(z, PD.z0 + SET + 3)]); pb.cyl(0.12, 0.16, r0 * 0.8, mat(C.trunk), x, H2 + 0.2 + r0 * 0.4, Math.max(z, PD.z0 + SET + 3), [0, 0, 0], 5); }
    pb.build(pod); grow(pod, t0T + 1.0, t0T + 3.4); }
  // ---- a toronyra felfutó üvegív: az átrium tetejétől a torony Duna felőli homlokzatán fel, felfelé keskenyedve ----
  { const iv = node(root, 'uvegiv', [0, H2 + 0.75, 0]); const ib = new Batch('iv'); const NN = 20, xa = -60, xb = -A - 0.25, rise = 50, cv = (u) => [xa + (xb - xa) * u, rise * Math.pow(u, 2.5)], hw = (u) => 13 - 4.5 * Math.pow(u, 0.8);
    const P = [], Nn = [], tri = (a, b, c, nv) => { P.push(...a, ...b, ...c); Nn.push(...nv, ...nv, ...nv); };
    for (let i = 0; i < NN; i++) { const u0 = i / NN, u1 = (i + 1) / NN, [x0, y0] = cv(u0), [x1, y1] = cv(u1), w0 = hw(u0), w1 = hw(u1), l = Math.hypot(x1 - x0, y1 - y0), nv = [-(y1 - y0) / l, (x1 - x0) / l, 0];
      tri([x0, y0, -w0], [x0, y0, 0], [x1, y1, 0], nv); tri([x0, y0, -w0], [x1, y1, 0], [x1, y1, -w1], nv);
      tri([x0, y0, -w0], [x1, y1, -w1], [x1, -0.5, -w1], [0, 0, -1]); tri([x0, y0, -w0], [x1, -0.5, -w1], [x0, -0.5, -w0], [0, 0, -1]);
      ib.rod([x0, y0 + 0.1, -w0], [x1, y1 + 0.1, -w1], 0.28, white, 5); if (i % 2 === 0 && i) ib.rod([x0, y0 + 0.08, -w0], [x0, y0 + 0.08, 0], 0.1, white, 4);
      for (const k of [0.33, 0.66]) ib.rod([x0, y0 + 0.06, -w0 * k], [x1, y1 + 0.06, -w1 * k], 0.07, white, 4); }
    ib.add(geo(P, Nn), mat('#8fbdd6', { r: 0.1, m: 0.45, ds: true })); ib.build(iv); grow(iv, t0T + 3.2, t0T + 6.4); }

  // ---- korona: a homlokzat az utolsó szint fölött üvegfalként fut tovább, ferdén levágva; mögötte tetőkert ----
  { const cr = node(root, 'korona', [0, YR, 0]); const cb = new Batch('korona'); const yT = (x) => yTop(x) - YR;
    cb.add(planPrism(half(0.3), -0.4, 0.02), mat('#cfc9bd', { r: 0.9 })); cb.add(planPrism(half(4.2, 24), 0.02, 0.3), mat('#7fa862', { r: 1 }));
    cb.add(wallG(outl, 0, (x) => yT(x)), mat('#a9d0e6', { op: 0.42, r: 0.08, m: 0.45, ds: true, dw: false }));
    for (let i = 0; i <= NS; i += 4) { const [x, z] = outl[i]; if (yT(x) > 0.6) cb.boxB(0.22, yT(x), 0.22, white, x, 0, z); }
    cb.add(wallG(outl, (x) => yT(x) - 0.9, (x) => yT(x) + 0.35, 0.3), mat('#f3f4f2', { r: 0.45, ds: true })); band(cb, white, outl, -0.6, 0.4, 0.42);
    box(cb, white, -6, 6, 0.02, 3.6, -9, -0.5); box(cb, mat('#8fbdd6', { r: 0.1, m: 0.45 }), -5.4, 5.4, 0.6, 3.0, -0.52, -0.46);                              // tetőfelépítmény (liftgépház)
    for (let i = 0; i < 6; i++) { const [x, z] = sp(Math.PI + Math.PI * (i + 0.5) / 6, 6.5), r0 = 1.5 + (i % 3) * 0.25; cb.mesh(new THREE.IcosahedronGeometry(r0, 1), mat('#5f9a4c', { r: 1 }), [x, 0.3 + r0 * 1.25, z]); cb.cyl(0.13, 0.17, r0, mat(C.trunk), x, 0.3 + r0 * 0.5, z, [0, 0, 0], 5); }
    cb.build(cr); grow(cr, tEnd, tEnd + 1.2); }

  // ---- kúszódaru a magon: a torony tetejével együtt emelkedik, a végén lebontják ----
  { const cn = node(root, 'daru', [0, 0, -5.5]); const cb = new Batch('daru'); towerCrane(cb, { H: 22, J: 44, CJ: 13, T: 30, HY: 5, y0: -7, base: false, w: 1.7 }); cb.build(cn);
    const ck = [[0, 0], [t0T, 0], ...crane]; tracks.push(trackPos(cn, ck.map(a => a[0]).concat([T]), ck.map(a => [0, a[1], -5.5]).concat([[0, 0, -5.5]])));
    tracks.push(trackScale(cn, [0, t0T - 0.3, t0T, tEnd + 0.3, tEnd + 0.7, T], [S0, S0, S1, S1, S0, S0])); cn.position.set(0, YR, -5.5); cn.scale.set(...S0); }

  B.build(root);
  plaque(root, 'MOL Campus · Budapest', X0 + 3, YB + 1.6, 0.25, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('epites', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Torony: 120 m, a csúccsal 143 m' : 'Tower: 120 m, 143 m to the tip', [A - 3, 104, -1], [A + 16, 108, 6], C.white, K);
    label(G, h ? 'Négyszintes mélygarázs' : 'Four-level basement', [PX1 - 8, -8, -3], [PX1 + 14, -1, 8], C.concreteDark, K);
    label(G, h ? 'Résfal: 85 cm, 21 m mély' : 'Diaphragm wall: 85 cm, 21 m deep', [PX0 - 0.4, -20, 0.3], [-86, -41, 8], SPEC.geo, K);
    label(G, h ? '2,2 m-es alaplemez' : '2.2 m raft', [-40, -17, 0.3], [-40, -53, 8], '#c9c4b8', K);
    label(G, h ? '135 cölöp: Ø1,2 m, 5,5 m' : '135 piles: Ø1.2 m, 5.5 m', [6.5, -21, 0.6], [8, -41, 8], SPEC.geo, K);
    label(G, h ? 'Dunai homokos kavics' : 'Danube sandy gravel', [X0 + 10, -13, 0.2], [X0 - 4, -12, 8], C.gravel, K);
    label(G, h ? 'Kiscelli agyag' : 'Kiscell clay', [X1 - 12, -26, 0.2], [52, -53, 8], '#77706a', K);
    label(G, h ? 'Talajvíz: −8 m' : 'Groundwater: −8 m', [X0 + 22, -8, 0.3], [X0 + 4, 9, 8], C.water, K);
    label(G, h ? 'Tetőkert az üvegkorona mögött' : 'Roof garden behind the glass crown', [-10, YR + 6, -2], [-34, YR + 22, 6], '#7fa862', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [26, 14], posterLift: -0.04, posterT: T - 1, labelT: T - 1 };
}
