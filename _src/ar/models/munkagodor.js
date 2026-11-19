// Horgonyzott résfalas munkagödör (9. előadás) – lépcsős kiemelés: résfal → 1. kiemelés → 1. horgonysor és heveder → 2. kiemelés → 2. horgonysor → 3. kiemelés → alaplemez.
// A két horgonysor párhuzamos (20°), egymástól 3,5 m-re (a tengelyek távolsága 3,3 m > 1,5 m). Felül feltöltés és homok, alatta homokos kavics, a résfal a vízzáró agyagba köt be.
import { THREE, Batch, mat, C, label, node, person, trackPos, trackQuat, trackScale, poseAt } from '../lib/common.js';
export const FILE = 'munkagodor';
const K = 1 / 80, T = 19;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], Sy0 = [1, 0.001, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'munkagodor'; const tracks = [];
  const X = 22, Z = 8, W = 8, WT = 0.8, YB = -19, PIT = -9, TOE = -15;
  const L = [[0, -1.5, '#8f8172'], [-1.5, -7, '#e0c98f'], [-7, -12, '#c4ad84'], [-12, YB, '#7c7468']]; // feltöltés · homok · homokos kavics · agyag
  const box = (b, m, xa, xb, ya, yb, za = -Z, zb = Z) => b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2);
  const B = new Batch('talaj');
  for (const [yt, yb, c] of L) { box(B, mat(c), -X, -W - WT, yb, yt); box(B, mat(c), W + WT, X, yb, yt); if (yb < PIT) box(B, mat(c), -W, W, yb, Math.min(yt, PIT)); }
  box(B, mat(C.grass), -X, -W - WT, 0, 0.14); box(B, mat(C.grass), W + WT, X, 0, 0.14);
  for (const s of [-1, 1]) { box(B, mat(C.concrete), s > 0 ? W : -W - WT, s > 0 ? W + WT : -W, TOE, 0.3); box(B, mat(C.concreteDark), s > 0 ? W - 0.1 : -W - WT - 0.1, s > 0 ? W + WT + 0.1 : -W + 0.1, 0.3, 0.7); } // résfal + fejgerenda
  for (const s of [-1, 1]) B.box(X - W - WT, 0.14, 0.1, mat(C.water), s * (W + WT + (X - W - WT) / 2), -4, Z + 0.06); // talajvíz a gödrön kívül
  B.boxB(2 * X + 2.4, 0.7, 2 * Z + 2.4, mat(C.base), 0, YB - 0.7, 0);
  // szomszéd épület (sávalapokon), fák, emberek
  { const x0 = 11.5, x1 = 20, z0 = -6.5, z1 = 1.5; box(B, mat('#efe6d2'), x0, x1, 0.14, 9.5, z0, z1); box(B, mat('#b5533c'), x0 - 0.3, x1 + 0.3, 9.5, 10.1, z0 - 0.3, z1 + 0.3);
    for (let f = 0; f < 3; f++) for (let j = 0; j < 4; j++) { box(B, mat(C.glassDark, { r: 0.3 }), x0 + 0.9 + j * 2.0, x0 + 2.0 + j * 2.0, 1.4 + f * 3, 2.9 + f * 3, z1, z1 + 0.06); }
    for (let f = 0; f < 3; f++) for (let j = 0; j < 3; j++) box(B, mat(C.glassDark, { r: 0.3 }), x0 - 0.06, x0, 1.4 + f * 3, 2.9 + f * 3, z0 + 1 + j * 2.5, z0 + 2.2 + j * 2.5);
    for (const x of [x0 + 0.5, x1 - 0.5]) box(B, mat(C.concreteDark), x - 0.5, x + 0.5, -1.2, 0.14, z0, z1 + 0.02); }
  for (const [x, z, h] of [[-19, -5, 7], [-15.5, -6.5, 6], [-18, 5, 6]]) { B.cyl(0.25, 0.35, h * 0.4, mat(C.trunk), x, 0.14 + h * 0.2, z, [0, 0, 0], 6); B.mesh(new THREE.IcosahedronGeometry(h * 0.33, 0), mat(C.tree), [x, 0.14 + h * 0.62, z]); }
  person(B, -11.5, 4, Math.PI / 2, { y: 0.14, tablet: true }); person(B, -10.6, 5.2, 2.4, { y: 0.14, vest: '#d8e04a' });
  B.build(root);
  // ---- a kiemelendő talaj három lépcsőben (a felszíne süllyed) ----
  const ST = [[0, -3, 1.2, 3.2], [-3, -6.5, 5.4, 7.2], [-6.5, PIT, 9.2, 11]];
  ST.forEach(([yt, yb, t0, t1]) => { const n = node(root, 'kiemeles', [0, yb, 0]); const b = new Batch('kiem');
    for (const [lt, lb, c] of L) { const a = Math.min(yt, lt), bb = Math.max(yb, lb); if (a > bb) box(b, mat(c), -W, W, bb - yb, a - yb); }
    b.build(n); tracks.push(trackScale(n, [0, t0, t1, t1 + 0.02, 18.2, 18.6, T], [S1, S1, [1, 0.01, 1], S0, S0, S1, S1])); });
  // ---- horgonysorok: heveder + horgonyfejek a falon, a metszeten a horgony (szabad szakasz + injektált befogás) ----
  const AN = [[-2.5, 3.4, 4.8], [-6.0, 7.4, 8.8]], inc = 20 * Math.PI / 180, steel = mat(C.steelDark, { m: 0.5, r: 0.45 }), grout = mat('#e8e4da');
  AN.forEach(([ya, t0, t1], r) => { for (const s of [-1, 1]) { const g = node(root, 'horgony', [s * (W + WT * 0.5), ya, 0]); const b = new Batch('horg'); const dir = [s * Math.cos(inc), -Math.sin(inc)];
      const P = (d, z) => [dir[0] * d, dir[1] * d, z]; const fl = 9 - r * 1.5;
      b.rod(P(0, Z + 0.06), P(fl, Z + 0.06), 0.09, steel, 6); b.rod(P(fl, Z + 0.06), P(fl + 6, Z + 0.06), 0.26, grout, 10);
      b.box(0.3, 0.5, 2 * Z - 0.4, steel, -s * (WT * 0.5 + 0.15), 0, 0); for (let z = -Z + 1.5; z < Z; z += 2.6) b.box(0.22, 0.42, 0.42, mat('#d8a32a', { m: 0.4, r: 0.5 }), -s * (WT * 0.5 + 0.38), 0, z);
      b.build(g); g.scale.set(...S0); tracks.push(trackScale(g, [0, t0, t1, 18.2, 18.6, T], [S0, S0, S1, S1, S0, S0])); } });
  // alaplemez a végén
  { const n = node(root, 'alaplemez', [0, PIT, 0]); const b = new Batch('lemez'); box(b, mat(C.concrete), -W, W, 0, 0.9); b.build(n); n.scale.set(...S0); tracks.push(trackScale(n, [0, 12.4, 12.42, 13.6, 18.2, 18.6, T], [S0, S0, [1, 0.01, 1], S1, S1, S0, S0])); }
  // ---- kotró: a gödörfenékkel együtt süllyed, a gém dolgozik, a kezelő a fülkében ----
  const ex = node(root, 'kotro', [-1.5, 0, -1]); { const b = new Batch('kotro'); const yel = mat('#f0b41c', { r: 0.55 }), dk = mat('#2c3036');
    for (const z of [-1.1, 1.1]) { b.box(4.4, 0.7, 0.7, dk, 0, 0.35, z); for (const x of [-1.9, 1.9]) b.cyl(0.35, 0.35, 0.72, mat('#3d434a'), x, 0.35, z, [Math.PI / 2, 0, 0], 12); }
    b.box(3.4, 0.35, 2.4, dk, 0, 0.88, 0); b.box(3.6, 1.2, 2.5, yel, -0.3, 1.65, 0); b.box(1.5, 0.9, 2.3, mat('#3d434a'), -1.5, 1.6, 0);
    for (const [x, z] of [[0.55, 0.35], [1.5, 0.35], [0.55, 1.2], [1.5, 1.2]]) b.box(0.09, 1.5, 0.09, dk, x, 3.0, z); b.box(1.15, 0.1, 1.05, yel, 1.02, 3.78, 0.78);
    person(b, 1.0, 0.78, Math.PI / 2, { y: 2.05, vest: '#ff7a1a' }); b.build(ex); }
  const boom = node(ex, 'gem', [1.3, 2.1, -0.5]); { const b = new Batch('gem'); b.box(4.6, 0.42, 0.42, mat('#f0b41c', { r: 0.55 }), 2.2, 0, 0); b.build(boom); }
  const stick = node(boom, 'szar', [4.4, 0, 0]); { const b = new Batch('szar'); b.box(0.34, 3.0, 0.34, mat('#f0b41c', { r: 0.55 }), 0, -1.4, 0); b.mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 10, 1, false, 0, Math.PI), mat('#2c3036'), [0.1, -3.0, 0], [Math.PI / 2, 0, 0]); b.build(stick); }
  { const tt = [], vb = [], vs = []; for (let t = 0; t <= T + 0.01; t += 1.2) { const ph = t / 1.2 % 2; tt.push(Math.min(t, T)); vb.push([0, 0, ph < 1 ? 0.5 : 0.15]); vs.push([0, 0, ph < 1 ? -0.9 : -0.2]); } tracks.push(trackQuat(boom, tt, vb)); tracks.push(trackQuat(stick, tt, vs));
    tracks.push(trackPos(ex, [0, 1.2, 3.2, 5.4, 7.2, 9.2, 11, 18.2, 18.6, T], [0, 0, -3, -3, -6.5, -6.5, PIT, PIT, 0, 0].map(y => [-1.5, y, -1]))); boom.rotation.z = 0.3; stick.rotation.z = -0.6; }
  const clips = [new THREE.AnimationClip('munkagodor', T, tracks)];
  poseAt(root, clips[0], 16);
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu', zf = Z + 0.12, zl = Z + 2.5, o = { h: 0.034 }, c = Math.cos(inc), s = Math.sin(inc);
    label(G, hu ? 'résfal' : 'diaphragm wall', [-W - WT / 2, -12.5, zf], [-11, -21.5, zl], C.concreteDark, K, o);
    label(G, hu ? 'horgony · szabad szakasz' : 'anchor · free length', [W + WT / 2 + 5 * c, -2.5 - 5 * s, zf], [15, 13.5, zl], C.steelDark, K, o);
    label(G, hu ? 'injektált befogási szakasz' : 'fixed (grouted) length', [-W - WT / 2 - 10.5 * c, -6 - 10.5 * s, zf], [-25, -15, zl], '#bdb8ac', K, o);
    label(G, hu ? 'heveder' : 'waler', [W - 0.15, -2.5, 2], [1, 4.5, 4], '#d8a32a', K, o);
    label(G, hu ? 'talajvíz' : 'groundwater', [-17, -4, zf], [-26, 3.5, zl], C.water, K, o);
    label(G, hu ? 'homok' : 'sand', [-13, -5.4, zf], [-26, -6, zl], '#e0c98f', K, o);
    label(G, hu ? 'homokos kavics' : 'sandy gravel', [16, -9.5, zf], [19, -15, zl], '#c4ad84', K, o);
    label(G, hu ? 'vízzáró agyag' : 'low-permeability clay', [4, -16, zf], [3, -22, zl], '#7c7468', K, o);
    label(G, hu ? 'alaplemez' : 'base slab', [3, PIT + 0.5, zf], [5.5, -2.2, zl], C.concrete, K, o);
    return G; };
  return { root, labels, clips, k: K, posterView: [16, 16], posterT: 16, labelT: 16 };
}
