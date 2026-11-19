// Egy telek, egy félév (1–9. előadás) – a kitalált telek felépül: A épület (háromszintes lakóház pilléralapokon, homokon) és
// B épület (nyolcszintes irodaház két pinceszinttel, résfalas, horgonyzott munkagödörben, CFA-cölöpökön a homokos kavicsig, puha agyag fölött).
// A tömb a z = 0 síkban el van metszve: az alapok, a pince és a cölöpök a metszeten látszanak.
import { THREE, Batch, mat, C, label, node, person, tree, carGeom, trackPos, trackScale, poseAt } from '../lib/common.js';
export const FILE = 'egy-telek';
const K = 1 / 150, T = 21;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], Sy = [1, 0.01, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'telek'; const tracks = [];
  const X0 = -30, X1 = 30, ZB = -22, YB = -19;
  const ext = (pts, z0 = ZB, z1 = 0) => { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return g; };
  const box = (b, m, xa, xb, ya, yb, za, zb) => b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2);
  const cF = '#8f8172', cS = '#e0c98f', cC = '#8a8f96', cP = '#4a3b2c', cG = '#c4ad84', cH = '#6f675c';
  const BX0 = 8, BX1 = 26, BZ0 = -17, PIT = -7; // a B épület munkagödre (résfalak belső síkja)
  const hide = (n, t0, t1, grow = Sy) => { n.scale.set(...S0); tracks.push(trackScale(n, [0, t0, t0 + 0.02, t1, 19.6, 20, T], [S0, S0, grow, S1, S1, S0, S0])); };
  const B = new Batch('talaj');
  const zc = BZ0 - 0.8, xl = BX0 - 0.8, xr = BX1 + 0.8; // a munkagödör helye a talajból kimarad (elöl), hátul teljes a szelvény
  const sandP = [[X0, -1], [2, -1], [-4, -9], [X0, -9]];
  B.add(ext([[X0, 0], [X1, 0], [X1, -1], [X0, -1]], ZB, zc), mat(cF)); B.add(ext(sandP, ZB, zc), mat(cS)); B.add(ext([[2, -1], [X1, -1], [X1, -9], [-4, -9]], ZB, zc), mat(cC));
  B.add(ext([[X0, 0], [xl, 0], [xl, -1], [X0, -1]], zc, 0), mat(cF)); B.add(ext([[xr, 0], [X1, 0], [X1, -1], [xr, -1]], zc, 0), mat(cF));
  B.add(ext(sandP, zc, 0), mat(cS)); B.add(ext([[2, -1], [xl, -1], [xl, -9], [-4, -9]], zc, 0), mat(cC)); B.add(ext([[xr, -1], [X1, -1], [X1, -9], [xr, -9]], zc, 0), mat(cC)); B.add(ext([[xl, PIT], [xr, PIT], [xr, -9], [xl, -9]], zc, 0), mat(cC));
  B.add(ext([[X0, -9], [X1, -9], [X1, -15], [X0, -15]]), mat(cG)); B.add(ext([[X0, -15], [X1, -15], [X1, YB], [X0, YB]]), mat(cH));
  box(B, mat(C.grass), X0, X1, 0, 0.16, ZB, zc); box(B, mat(C.grass), X0, xl, 0, 0.16, zc, 0); box(B, mat(C.grass), xr, X1, 0, 0.16, zc, 0); box(B, mat(C.asphalt), -1.5, 5.5, 0.16, 0.24, ZB, 0);
  for (let z = ZB + 1.5; z < -1; z += 3.2) box(B, mat('#e8e4da'), 1.9, 2.1, 0.24, 0.26, z, z + 1.6);
  B.box(X1 - X0, 0.14, 0.1, mat(C.water), 0, -3, 0.06);
  B.boxB(X1 - X0 + 3, 0.8, -ZB + 3, mat(C.base), 0, YB - 0.8, ZB / 2);
  for (const [x, z, h] of [[-28, -3, 6], [-27, -19, 7], [-23.5, -20, 6], [6.8, -20, 6], [28.2, -20, 7], [28.4, -3, 6]]) tree(B, x, z, h, 0.16);
  person(B, -22, -2.2, 0.4, { y: 0.16, tablet: true }); person(B, 6.6, -3, -1.2, { y: 0.16, vest: '#d8e04a' });
  B.build(root);
  // autó az utcán
  { const car = node(root, 'auto'); const cg = carGeom('#e0523f'); cg.rotation.y = Math.PI / 2; car.add(cg); tracks.push(trackPos(car, [0, 9, 9.01, T], [[3.6, 0.24, ZB + 2], [3.6, 0.24, -2], [0.3, 0.24, -2], [0.3, 0.24, ZB + 2]])); }
  // ---- A épület: pilléralapok (1–2 s), három szint és tető (2–5,5 s) ----
  const AX0 = -22, AX1 = -6, AZ0 = -12;
  { const n = node(root, 'A_alap', [0, -1.8, 0]); const b = new Batch('aalap'); for (const x of [AX0 + 1, (AX0 + AX1) / 2, AX1 - 1]) for (const z of [-1.2, -6.5, AZ0 + 1.2]) { box(b, mat(C.concrete), x - 1.1, x + 1.1, 0, 0.6, z - 1.1, z + 1.1); box(b, mat(C.concreteDark), x - 0.25, x + 0.25, 0.6, 1.96, z - 0.25, z + 0.25); } b.build(n); hide(n, 1, 2); }
  const floor = (parent, y, h, x0, x1, z0, z1, wall, t0, cols, name) => { const n = node(parent, name, [0, y, 0]); const b = new Batch(name);
    box(b, mat(wall), x0, x1, 0, h, z0, z1); box(b, mat('#bdb6a8'), x0 - 0.15, x1 + 0.15, h - 0.25, h, z0 - 0.15, z1 + 0.15);
    const wm = mat(C.glassDark, { r: 0.25, m: 0.2 }), lit = mat('#ffd98a', { em: '#ffd98a', ei: 0.4 }); const w = (x1 - x0 - 1.2) / cols;
    for (let j = 0; j < cols; j++) { const xa = x0 + 0.6 + j * w + w * 0.18, m = (j * 7 + Math.round(y)) % 5 === 1 ? lit : wm; box(b, m, xa, xa + w * 0.64, h * 0.3, h * 0.78, z1, z1 + 0.07); }
    const d = (z1 - z0 - 1.2) / 3; for (let j = 0; j < 3; j++) { const za = z0 + 0.6 + j * d + d * 0.2; box(b, wm, x0 - 0.07, x0, h * 0.3, h * 0.78, za, za + d * 0.6); box(b, wm, x1, x1 + 0.07, h * 0.3, h * 0.78, za, za + d * 0.6); }
    b.build(n); hide(n, t0, t0 + 0.9); return n; };
  for (let i = 0; i < 3; i++) floor(root, 0.16 + i * 3.1, 3.1, AX0, AX1, AZ0, -0.4, '#f1e8d6', 2.2 + i * 0.9, 5, 'A_szint');
  { const n = node(root, 'A_teto', [0, 0.16 + 9.3, 0]); const b = new Batch('ateto'); box(b, mat('#b5533c'), AX0 - 0.4, AX1 + 0.4, 0, 0.5, AZ0 - 0.4, 0); box(b, mat('#8a8f96'), AX0 + 2, AX0 + 4, 0.5, 1.4, -8, -6); b.build(n); hide(n, 4.9, 5.5); }
  // ---- B épület: résfal (5,5–6,5 s) → cölöpök (6,5–8 s) → kiemelés (8–10 s) → horgony (10–10,8 s) → pince (10,8–12,2 s) → nyolc szint (12,2–17 s) ----
  { const n = node(root, 'B_resfal', [0, -11, 0]); const b = new Batch('resfal'); const m = mat(C.concrete); box(b, m, BX0 - 0.8, BX0, 0, 11.2, BZ0 - 0.8, 0.06); box(b, m, BX1, BX1 + 0.8, 0, 11.2, BZ0 - 0.8, 0.06); box(b, m, BX0, BX1, 0, 11.2, BZ0 - 0.8, BZ0); b.build(n); hide(n, 5.5, 6.5); }
  { const n = node(root, 'B_colop', [0, PIT, 0]); const b = new Batch('colop'); for (let i = 0; i < 5; i++) { const x = BX0 + 2 + i * 3.5; for (const z of [-0.05, -8.5, BZ0 + 1.5]) b.cyl(0.4, 0.4, 7.5, mat('#cfcac0'), x, -3.75, z, [0, 0, 0], 14); } b.build(n); hide(n, 6.5, 8, [1, 0.01, 1]); }
  { const n = node(root, 'B_kiemeles', [0, PIT, 0]); const b = new Batch('kiem'); box(b, mat(cF), BX0, BX1, -PIT - 1, -PIT, BZ0, 0); box(b, mat(C.grass), BX0, BX1, -PIT, -PIT + 0.16, BZ0, 0); box(b, mat(cC), BX0, BX1, 0, -PIT - 1, BZ0, 0); b.mesh(new THREE.SphereGeometry(1, 16, 10), mat(cP), [18, 2.6, 0], [0, 0, 0], [5.2, 1.2, 0.12]); b.build(n);
    tracks.push(trackScale(n, [0, 8, 10, 10.02, 19.6, 20, T], [S1, S1, [1, 0.01, 1], S0, S0, S1, S1])); }
  { const inc = 20 * Math.PI / 180; for (const s of [-1, 1]) { const n = node(root, 'B_horgony', [s > 0 ? BX1 + 0.4 : BX0 - 0.4, -2.6, 0]); const b = new Batch('horg'); const P = (d) => [s * Math.cos(inc) * d, -Math.sin(inc) * d, 0.08];
      b.rod(P(0), P(7), 0.1, mat(C.steelDark, { m: 0.5, r: 0.45 }), 6); b.rod(P(7), P(12), 0.3, mat('#e8e4da'), 10); b.box(0.3, 0.5, 0.5, mat('#d8a32a'), -s * 0.55, 0, -0.3); b.build(n); hide(n, 10, 10.8, S0); } }
  { const n = node(root, 'B_pince', [0, PIT, 0]); const b = new Batch('pince'); const m = mat(C.concrete); box(b, m, BX0, BX1, 0, 0.8, BZ0, 0); box(b, m, BX0, BX1, 3.6, 3.9, BZ0, 0); box(b, m, BX0, BX1, -PIT - 0.14, -PIT + 0.16, BZ0, 0);
    for (let i = 0; i < 4; i++) for (const z of [-0.3, -8.5]) box(b, mat(C.concreteDark), BX0 + 3 + i * 4 - 0.25, BX0 + 3 + i * 4 + 0.25, 0.8, -PIT - 0.14, z - 0.25, z + 0.25); b.build(n); hide(n, 10.8, 12.2); }
  for (let i = 0; i < 8; i++) { const n = floor(root, 0.16 + i * 3.4, 3.4, BX0 + 0.6, BX1 - 0.6, BZ0 + 0.6, -0.6, i === 0 ? '#d9dde2' : '#c9d3dc', 12.2 + i * 0.6, 7, 'B_szint'); }
  { const n = node(root, 'B_teto', [0, 0.16 + 27.2, 0]); const b = new Batch('bteto'); box(b, mat('#9aa3ab'), BX0 + 0.3, BX1 - 0.3, 0, 0.5, BZ0 + 0.3, -0.3); box(b, mat('#6f7880'), BX0 + 5, BX0 + 9, 0.5, 2.2, -11, -7); b.build(n); hide(n, 17, 17.6); }
  const clips = [new THREE.AnimationClip('telek', T, tracks)];
  poseAt(root, clips[0], 18.5);
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu', zf = 0.14, zl = 6, o = { h: 0.036 };
    label(G, hu ? 'A épület · pilléralapok' : 'Building A · pad footings', [-14, -1.5, zf], [-27, 14, zl], C.concreteDark, K, o);
    label(G, hu ? 'B épület · CFA-cölöpök' : 'Building B · CFA piles', [17, -11.5, zf], [22, -23.5, zl], '#cfcac0', K, o);
    label(G, hu ? 'résfal' : 'diaphragm wall', [BX1 + 0.4, -8.5, zf], [33, -12, zl], C.concrete, K, o);
    label(G, hu ? 'talajhorgony' : 'ground anchor', [BX0 - 0.4 - 6, -2.6 - 2.2, zf], [-9, -23.5, zl], C.steelDark, K, o);
    label(G, hu ? 'homok' : 'sand', [-20, -5.5, zf], [-37, -6, zl], cS, K, o);
    label(G, hu ? 'puha agyag' : 'soft clay', [28.6, -5, zf], [33, 4, zl], cC, K, o);
    label(G, hu ? 'homokos kavics · teherbíró réteg' : 'sandy gravel · bearing stratum', [-10, -12, zf], [-40, -17, zl], cG, K, o);
    label(G, hu ? 'talajvíz' : 'groundwater', [-27, -3, zf], [-38, 3.5, zl], C.water, K, o);
    return G; };
  return { root, labels, clips, k: K, posterView: [14, 17], posterT: 18.5, labelT: 18.5 };
}
