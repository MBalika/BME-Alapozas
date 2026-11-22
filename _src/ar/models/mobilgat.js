// Mobil árvízvédelmi fal (Vízmérnöki): Szentendre, Duna korzó – Magyarország első mobilgátja (2013), 333 m hosszan védi az óvárost.
// Keresztmetszet a falra merőlegesen: balra a korzó és az óváros házsora a templomtornyokkal, jobbra a Szentendrei-Duna.
// Animáció (16 s): a munkások felállítják az alumínium oszlopokat, soronként beemelik a betétgerendákat, közben a Duna megárad; a fal megtartja a vizet,
// majd az ár levonul. Adatok: 333 m, a fal teteje 1,35 m-rel a mértékadó árvízszint fölött (444.hu, infostart.hu, 2012–2013).
// A házsor, a tornyok, az alaptest és a szivárgásgátló fal elvi, egyszerűsített ábrázolás (nem felmérés alapján).
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale, person } from '../lib/common.js';
import { at, sideExtrude, van2, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'mobilgat';
const K = 1 / 200;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'mobilgat';
  const B = new Batch('varos'), tracks = [], T = 16, X0 = -72, X1 = 44, Z0 = -84, YB = -13, WX = 4, RIV = -5.2, FLOOD = 1.9;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];
  // ---- talaj a metszetben: feltöltés, kavics, agyag; a part rézsűje kőburkolattal; a templomdomb ----
  const prof = (pts, col, za = Z0, zb = 0) => B.mesh(sideExtrude(pts, zb - za), mat(col, { r: 1 }), [0, 0, (za + zb) / 2]);
  prof([[X0, YB], [X1, YB], [X1, -9.5], [X0, -8.5]], '#77706a'); prof([[X0, -8.5], [X1, -9.5], [X1, -7], [22, -6.4], [9, -3.5], [X0, -3.2]], C.gravel); prof([[X0, -3.2], [9, -3.5], [6.4, -0.02], [X0, -0.02]], '#a08d77');
  prof([[6.4, -0.02], [9, -3.5], [22, -6.4], [22, -6.0], [9.4, -3.0], [6.9, 0.3], [6.4, 0.3]], '#b9b2a4');
  prof([[X0, -0.02], [-36, -0.02], [-44, 5.5], [X0, 7.5]], '#a08d77'); prof([[X0, 7.5], [-44, 5.5], [-36, -0.02], [-35.4, -0.02], [-43.6, 5.9], [X0, 7.9]], '#8fbf6a');
  // ---- korzó: burkolat, út, platánsor, lámpák, padok ----
  box(B, mat('#d3cdbf', { r: 0.95 }), -36, 6.4, -0.02, 0.06, Z0, 0); box(B, mat('#4a4e55', { r: 0.95 }), -12.5, -6, 0.06, 0.1, Z0, -0.03);
  for (let z = -8; z > Z0 + 4; z -= 13) { tree2(B, -2.6, z, 9.5, 0.06, { c1: '#5a9647', c2: '#74ad55' }); lamp(B, -5.2, z - 6.5, 0.06, 4.6); box(B, mat('#8a5a3a'), 0.6, 2.6, 0.45, 0.55, z - 6.9, z - 6.3); box(B, mat('#3a3f45'), 0.7, 0.8, 0.06, 0.45, z - 6.9, z - 6.3); box(B, mat('#3a3f45'), 2.4, 2.5, 0.06, 0.45, z - 6.9, z - 6.3); }
  // ---- az óváros házsora (egy-két szintes, színes homlokzatok, cseréptető) és két barokk templomtorony ----
  const cols = ['#f2d28a', '#f4f1e6', '#e9b8a0', '#e7d9a8', '#f4e3c0', '#d9c9e0', '#f2c9a0'], gl = mat('#3c5364', { r: 0.2, m: 0.4 }); let z = -1, i = 0;
  while (z > Z0 + 6) { const w = 9 + (i * 5 % 4) * 1.5, hh = i % 3 === 1 ? 7.4 : 4.6, zb = Math.max(Z0, z - w), c = mat(cols[i % 7], { r: 0.9 }); box(B, c, -27, -14, 0.06, hh, zb, z - 0.25); box(B, mat('#f4eedf'), -14.1, -13.8, hh - 0.5, hh, zb, z - 0.25); box(B, mat('#cfc4ae'), -14.1, -13.85, 0.06, 0.8, zb, z - 0.25);
    B.mesh(sideExtrude([[-27.4, 0], [-13.6, 0], [-20.5, 4.4]], z - 0.25 - zb), mat(i % 2 ? '#a65a40' : '#9c4f38', { r: 0.9 }), [0, hh, (zb + z - 0.25) / 2]);
    for (let f = 0; f * 3.2 + 3.4 < hh + 0.4; f++) for (let q = zb + 1.6; q < z - 1.6; q += 2.6) box(B, gl, -13.86, -13.74, 1.4 + f * 3.2, 3.0 + f * 3.2, q, q + 1.1); if (i % 2 === 0) box(B, mat('#5b3f2c'), -13.86, -13.74, 0.06, 2.3, (zb + z) / 2 - 0.6, (zb + z) / 2 + 0.6); z = zb; i++; }
  const tower = (x, zc, y0, hh, col, sp) => { box(B, mat(col, { r: 0.9 }), x - 3, x + 3, y0, y0 + hh, zc - 3, zc + 3); box(B, mat('#f4eedf'), x - 3.3, x + 3.3, y0 + hh, y0 + hh + 0.6, zc - 3.3, zc + 3.3); box(B, mat(col, { r: 0.9 }), x - 12, x - 3, y0, y0 + hh * 0.55, zc - 5, zc + 5); B.mesh(sideExtrude([[-5.4, 0], [5.4, 0], [0, 4.8]], 9.6).rotateY(Math.PI / 2), mat('#9c4f38'), [x - 7.6, y0 + hh * 0.55, zc]);
    for (const s of [-1, 1]) box(B, gl, x + 2.95, x + 3.06, y0 + hh - 5, y0 + hh - 2, zc + s * 0 - 0.6, zc + 0.6); B.mesh(new THREE.SphereGeometry(2.9, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(sp, { r: 0.6, m: 0.3 }), [x, y0 + hh + 0.6, zc], [0, 0, 0], [1, 1.1, 1]); B.mesh(new THREE.ConeGeometry(1.5, 6.5, 8), mat(sp, { r: 0.6, m: 0.3 }), [x, y0 + hh + 6.2, zc]); B.cyl(0.05, 0.05, 2, mat('#d9b23c', { m: 0.8 }), x, y0 + hh + 10.2, zc, [0, 0, 0], 5); };
  tower(-52, -34, 6.2, 19, '#f2e3b0', '#6f9a86'); tower(-40, -66, 3.4, 16, '#e9b8a0', '#5d6670');
  // ---- a mobilgát alépítménye: kőburkolatú vasbeton alaptest, alatta szivárgásgátló fal ----
  box(B, mat('#cfc6b4', { r: 0.9 }), WX - 0.45, WX + 0.45, -0.9, 0.5, Z0, 0.06); box(B, mat('#6f6a60'), WX - 0.3, WX + 0.3, -9.2, -1.5, Z0, 0.06); box(B, mat('#b9b5ad'), WX - 1.2, WX + 1.2, -1.5, -0.9, Z0, 0.06);
  B.build(root);
  // ---- oszlopok és betétgerendák (soronként jelennek meg) ----
  const alu = mat('#c9ced3', { m: 0.75, r: 0.3 }), aluD = mat('#9aa3ab', { m: 0.7, r: 0.35 }), NR = 11, RH = 0.2, tP0 = 1, tL0 = 3, tL1 = 9.5;
  { const n = node(root, 'oszlopok'), b = new Batch('oszlop'); for (let zz = -0.4; zz > Z0; zz -= 3) { box(b, aluD, WX - 0.12, WX + 0.12, 0.5, 0.5 + NR * RH + 0.15, zz - 0.09, zz + 0.09); b.rod([WX - 0.1, 0.5 + NR * RH * 0.7, zz], [WX - 1.5, 0.08, zz], 0.04, aluD, 5); } b.build(n); tracks.push(trackScale(n, [0, tP0, tP0 + 1.4, T - 0.6, T - 0.1, T], [[1, 0.001, 1], [1, 0.001, 1], S1, S1, [1, 0.001, 1], [1, 0.001, 1]])); }
  for (let r = 0; r < NR; r++) { const n = node(root, 'gerendasor', [0, 0.5 + r * RH, 0]), b = new Batch('sor'); box(b, r % 2 ? alu : mat('#d6dadd', { m: 0.75, r: 0.3 }), WX - 0.05, WX + 0.05, 0.01, RH - 0.01, Z0 + 0.1, -0.1); b.build(n); const t0 = tL0 + (tL1 - tL0) * r / NR;
    tracks.push(trackScale(n, [0, t0, t0 + 0.45, T - 0.6, T - 0.1, T], [S0, [1, 1, 0.001], S1, S1, S0, S0])); }
  // ---- a Duna: állandó kisvíz + az árhullám (animált magasság) ----
  { const wm = mat(C.water, { op: 0.8, r: 0.15 }), n0 = new THREE.Mesh(new THREE.BoxGeometry(X1 - 20.5, RIV + 7.2, -Z0), wm); n0.position.set((X1 + 20.5) / 2, (RIV - 7.2) / 2, Z0 / 2); n0.name = 'kisviz'; root.add(n0);
    const fl = node(root, 'arviz', [0, RIV, 0]), g = sideExtrude([[WX + 0.06, 0], [X1, 0], [X1, 1], [WX + 0.06, 1]], -Z0 - 0.04), m = new THREE.Mesh(g, wm); m.position.z = Z0 / 2; m.name = 'arviz_m'; fl.add(m); const H = FLOOD - RIV;
    tracks.push(trackScale(fl, [0, 4, 11.5, 13.5, 15.6, T], [[1, 0.01, 1], [1, 0.01, 1], [1, H, 1], [1, H, 1], [1, 0.01, 1], [1, 0.01, 1]])); fl.scale.set(1, H * 0.8, 1); }
  // ---- munkások, kisteherautó a gerendakötegekkel, homokzsákok; járókelők ----
  { const b = new Batch('munka'); van2(at(b, -9, 0.1, -20, Math.PI / 2), '#f2f3f1'); for (const zz of [-30, -52]) { for (let k = 0; k < 5; k++) box(b, alu, -1.5, 1.5, 0.1 + k * 0.22, 0.3 + k * 0.22, zz - 0.4 - (k % 2) * 0.1, zz + 0.4 - (k % 2) * 0.1); }
    for (const [x, zz, r] of [[2.6, -12, -1.5], [2.7, -26, -1.6], [2.5, -41, -1.4], [0.5, -30.5, 0.4], [-7.4, -17, 2.4], [2.6, -60, -1.6]]) person(b, x, zz, r, { y: 0.06, vest: '#ff7a1a' }); for (const [x, zz, r, c] of [[-10, -44, 0.5, '#3a5f8a'], [-11, -45, 1.5, '#b33a2e'], [-16, -8, 3, '#5a6a3a']]) person(b, x, zz, r, { y: 0.06, vest: c, shirt: c, helmet: '#5a4632' });
    for (let k = 0; k < 14; k++) b.box(0.6, 0.22, 0.36, mat('#cdbb92', { r: 1 }), 2.2 - (k % 2) * 0.3, 0.18 + Math.floor(k / 5) * 0.22, -72 - (k % 5) * 0.62, [0, (k % 3) * 0.2, 0]); b.build(root); }
  plaque(root, hu ? 'Szentendre · Duna korzó' : 'Szentendre · Danube promenade', X0 + 2, YB + 1.2, 0.08, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('arviz', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Mobil árvízvédelmi fal: alumínium oszlopok\nés betétgerendák' : 'Demountable flood wall: aluminium posts\nand stop logs', [WX, 2.4, -6], [-10, 11, 4], '#c9ced3', K);
    label(G, h ? '333 m hosszú – Magyarország első mobilgátja (2013)' : '333 m long – Hungary’s first demountable flood wall (2013)', [WX, 2.7, -50], [-30, 26, -40], SPEC.viz, K);
    label(G, h ? 'A fal teteje 1,35 m-rel a mértékadó\nárvízszint fölött' : 'Top of wall 1.35 m above\nthe design flood level', [WX + 0.1, 2.7, -0.2], [14, 9, 6], C.waterDeep, K);
    label(G, h ? 'Alaptest és szivárgásgátló fal (elvi vázlat)' : 'Foundation and seepage cut-off wall (schematic)', [WX, -5, 0], [-40, -9.5, 7], '#8f8a80', K);
    label(G, h ? 'Az óváros házsora a Duna korzón' : 'The old-town row of houses on the promenade', [-14, 5, -10], [-70, 14, 5], '#f2d28a', K);
    label(G, h ? 'Szentendrei-Duna' : 'Szentendre Danube branch', [32, RIV, -4], [26, -11.5, 7], C.waterDeep, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [26, 20], posterT: 12.5, labelT: 12.5 };
}
