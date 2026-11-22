// Részletesebb közös elemek a felújított modellekhez (2026-11): járművek, építőgépek, toronydaru, fák, névtábla.
// Minden elem helyi rendszere: x előre (menetirány), y fel, z oldalra; az origó a talajon, az elem közepén. Méretek méterben.
import { THREE, Batch, mat, C, label } from './common.js';

// Egy kötegelő „ablaka” eltolással, függőleges tengely körüli forgatással és skálával: at(B, x, y, z, ry).box(...) a B-be ír
export function at(B, x = 0, y = 0, z = 0, ry = 0, s = 1) {
  const M = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(s, s, s));
  const T = new Batch('t'); T.add = (geom, material, matrix) => { B.add(geom, material, matrix ? M.clone().multiply(matrix) : M); return T; }; return T;
}
// Hasáb: (x, y) oldalnézeti sokszög kihúzva z irányban, w szélességben, a z = 0 síkra szimmetrikusan
export function sideExtrude(pts, w) { const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))); const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -w / 2); return g; }
// Hasáb: (x, z) alaprajzi sokszög y0 és y1 között (lyukakkal)
export function planPrism(pts, y0, y1, holes = []) { const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))); for (const h of holes) sh.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1]))));
  const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false, curveSegments: 4 }); g.rotateX(Math.PI / 2); g.translate(0, y1, 0); return g; }

const DARK = '#22262b', TYRE = '#1d2024', GLS = '#2c3c4a', LAMP = '#fff6d8', RED = '#c23a2e';
const wheel = (B, x, z, r = 0.33, w = 0.24, seg = 10, hub = true) => { B.cyl(r, r, w, mat(TYRE, { r: 0.9 }), x, r, z, [Math.PI / 2, 0, 0], seg); if (hub) B.cyl(r * 0.55, r * 0.55, w + 0.02, mat('#b9bec4', { m: 0.6, r: 0.4 }), x, r, z, [Math.PI / 2, 0, 0], 8); };

// Személyautó (4,4 m): karosszéria, ferde üvegű utastér, kerekek, lámpák. lite: kevesebb háromszög (parkoló autókhoz)
export function car2(B, color = '#c8ccd0', o = {}) {
  const body = mat(color, { r: 0.45, m: 0.3 }), L = o.len ?? 4.4, W = o.w ?? 1.8;
  B.mesh(sideExtrude([[-L / 2, 0.28], [L / 2 - 0.1, 0.28], [L / 2, 0.55], [L / 2 - 0.25, 0.86], [-L / 2 + 0.1, 0.9], [-L / 2, 0.6]], W), body);
  B.mesh(sideExtrude([[-L / 2 + 0.55, 0.88], [L / 2 - 1.15, 0.86], [L / 2 - 1.75, 1.4], [-L / 2 + 0.95, 1.42]], W * 0.9), mat(GLS, { r: 0.15, m: 0.5 }));
  B.box(L * 0.3, 0.05, W * 0.86, body, -0.38, 1.44, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(B, sx * (L / 2 - 0.82), sz * (W / 2 - 0.12), 0.32, 0.22, o.lite ? 8 : 10, !o.lite);
  if (!o.lite) { for (const sz of [-1, 1]) { B.box(0.06, 0.14, 0.34, mat(LAMP, { em: '#fff2c0', ei: 0.6 }), L / 2 - 0.04, 0.66, sz * (W / 2 - 0.3)); B.box(0.06, 0.12, 0.34, mat(RED, { em: '#a02018', ei: 0.5 }), -L / 2 + 0.03, 0.72, sz * (W / 2 - 0.3)); } }
}
// Kisáruszállító / furgon (5,4 m)
export function van2(B, color = '#f2f3f1') { const body = mat(color, { r: 0.5, m: 0.2 });
  B.mesh(sideExtrude([[-2.7, 0.35], [2.6, 0.35], [2.7, 0.9], [2.2, 1.1], [1.7, 2.2], [-2.7, 2.25]], 1.95), body);
  B.mesh(sideExtrude([[1.72, 1.2], [2.16, 1.14], [1.74, 2.1], [0.9, 2.1], [0.9, 1.2]], 1.97), mat(GLS, { r: 0.15, m: 0.5 }));
  for (const sx of [-1.7, 1.75]) for (const sz of [-1, 1]) wheel(B, sx, sz * 0.86, 0.36, 0.26); }
// Nyerges kamion (16 m): vontató + ponyvás félpótkocsi
export function truck2(B, cab = '#2f6db5', box = '#e9ecef') {
  B.mesh(sideExtrude([[4.9, 0.6], [7.6, 0.6], [7.6, 2.2], [7.2, 3.3], [5.0, 3.4], [4.9, 2.0]], 2.5), mat(cab, { r: 0.45, m: 0.3 }));
  B.mesh(sideExtrude([[7.22, 2.25], [7.62, 2.2], [7.24, 3.2], [6.3, 3.2], [6.3, 2.25]], 2.52), mat(GLS, { r: 0.15, m: 0.5 }));
  B.box(13.4, 2.7, 2.55, mat(box, { r: 0.7 }), -2.2, 2.75, 0); B.box(13.4, 0.25, 2.3, mat(DARK), -2.2, 1.25, 0); B.box(13.6, 0.1, 2.6, mat('#c9ccd0'), -2.2, 4.12, 0);
  for (const x of [-7.6, -6.3, -5.0, 3.9, 6.6]) for (const sz of [-1, 1]) wheel(B, x, sz * 1.08, 0.5, 0.36, 10, true);
  B.box(1.2, 0.5, 2.3, mat(DARK), 4.3, 1.1, 0); }
// Városi autóbusz (12 m)
export function bus2(B, color = '#2a63b8') {
  B.mesh(sideExtrude([[-6, 0.4], [5.9, 0.4], [6, 1.2], [5.85, 3.0], [-6, 3.05]], 2.55), mat(color, { r: 0.5, m: 0.25 }));
  B.box(11.2, 1.05, 2.58, mat(GLS, { r: 0.15, m: 0.5 }), -0.1, 2.15, 0); B.box(0.06, 1.3, 2.3, mat(GLS, { r: 0.15, m: 0.5 }), 5.95, 2.0, 0); B.box(12, 0.12, 2.4, mat('#e8eaec'), 0, 3.1, 0);
  for (const x of [-3.6, 3.9]) for (const sz of [-1, 1]) wheel(B, x, sz * 1.1, 0.5, 0.34); }
// Billenőplatós teherautó (8,5 m)
export function dumper(B, color = '#e9a51f') {
  B.mesh(sideExtrude([[1.9, 0.7], [4.2, 0.7], [4.2, 2.0], [3.8, 3.0], [2.0, 3.05], [1.9, 2.0]], 2.45), mat('#f1f2f0', { r: 0.5, m: 0.2 }));
  B.mesh(sideExtrude([[3.82, 2.1], [4.22, 2.02], [3.84, 2.9], [3.0, 2.9], [3.0, 2.1]], 2.47), mat(GLS, { r: 0.15, m: 0.5 }));
  B.box(8.2, 0.3, 2.2, mat(DARK), 0, 1.0, 0);
  B.mesh(sideExtrude([[-4.2, 1.3], [1.6, 1.3], [1.75, 3.0], [-4.3, 2.75]], 2.5), mat(color, { r: 0.6, m: 0.2 })); B.box(5.6, 0.5, 2.2, mat('#7b6a55'), -1.3, 2.75, 0);
  for (const x of [-3.2, -1.9, 3.0]) for (const sz of [-1, 1]) wheel(B, x, sz * 1.05, 0.52, 0.36); }
// Betonmixer (9 m)
export function mixer(B) {
  B.mesh(sideExtrude([[2.4, 0.7], [4.6, 0.7], [4.6, 2.0], [4.2, 3.0], [2.5, 3.05], [2.4, 2.0]], 2.45), mat('#d8452f', { r: 0.5, m: 0.2 }));
  B.mesh(sideExtrude([[4.22, 2.1], [4.62, 2.02], [4.24, 2.9], [3.4, 2.9], [3.4, 2.1]], 2.47), mat(GLS, { r: 0.15, m: 0.5 })); B.box(8.6, 0.3, 2.2, mat(DARK), 0.2, 1.0, 0);
  B.mesh(new THREE.CylinderGeometry(0.75, 1.3, 2.4, 14), mat('#eef0ee', { r: 0.5 }), [-2.9, 2.75, 0], [0, 0, Math.PI / 2 - 0.18]); B.mesh(new THREE.CylinderGeometry(1.3, 1.05, 2.6, 14), mat('#eef0ee', { r: 0.5 }), [-0.4, 2.3, 0], [0, 0, Math.PI / 2 - 0.18]);
  B.mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.3, 14), mat('#d8452f'), [-1.6, 2.5, 0], [0, 0, Math.PI / 2 - 0.18]);
  for (const x of [-3.2, -1.9, 3.3]) for (const sz of [-1, 1]) wheel(B, x, sz * 1.05, 0.52, 0.36); }

// Lánctalp-pár (hossz L, nyomtáv G)
function tracks(B, L, G, h = 0.9, w = 0.6) { for (const sz of [-1, 1]) { B.box(L - h, h, w, mat(DARK, { r: 0.9 }), 0, h / 2, sz * G / 2); for (const sx of [-1, 1]) B.cyl(h / 2, h / 2, w, mat(DARK, { r: 0.9 }), sx * (L - h) / 2, h / 2, sz * G / 2, [Math.PI / 2, 0, 0], 10);
    B.box(L - h * 1.1, h * 0.5, w + 0.06, mat('#3b4046'), 0, h / 2, sz * G / 2); } }
// Lánctalpas kotró (felsőváz elfordítva: slew); a gém a +x felé nyúl, a kanál a talajszint alá (dig) érhet
export function excavator(B, o = {}) { const Y = mat(o.color || '#f2b01e', { r: 0.5, m: 0.2 }), st = mat('#c9ced3', { m: 0.7, r: 0.3 }), dig = o.dig ?? -1.2;
  tracks(B, 4.8, 2.6); B.cyl(0.9, 0.9, 0.3, mat(DARK), 0, 1.05, 0, [0, 0, 0], 14);
  const U = at(B, 0, 0, 0, o.slew || 0);
  U.mesh(sideExtrude([[-2.6, 1.2], [1.6, 1.2], [1.6, 2.0], [0.2, 2.5], [-2.6, 2.5]], 2.7), Y); U.box(1.0, 1.25, 2.6, mat('#3a3f45'), -2.25, 1.9, 0);
  U.mesh(sideExtrude([[0.3, 2.0], [1.7, 2.0], [1.7, 3.0], [1.35, 3.6], [0.3, 3.6]], 1.0), mat(GLS, { r: 0.15, m: 0.5 }), [0, 0, -0.82]); U.box(1.44, 0.08, 1.06, Y, 0.98, 3.64, -0.82); U.box(0.08, 1.6, 1.06, Y, 0.3, 2.8, -0.82);
  U.cyl(0.07, 0.07, 0.8, mat(DARK), -1.6, 2.9, 0.9, [0, 0, 0], 6);
  const p0 = [1.5, 2.1, 0.35], p1 = [4.6, 5.3, 0.35], p2 = [6.9, 3.6, 0.35], p3 = [6.7, dig + 1.0, 0.35];
  const beam = (a, b, w, hh) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), L = d.length(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.clone().normalize());
    U.add(new THREE.BoxGeometry(L, hh, w), Y, new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1))); };
  beam(p0, p1, 0.5, 0.62); beam(p1, p2, 0.5, 0.5); beam(p2, p3, 0.42, 0.42);
  U.rod([1.9, 1.7, 0.35], [3.3, 3.6, 0.35], 0.11, st, 6); U.rod([4.2, 5.45, 0.35], [6.6, 4.25, 0.35], 0.1, st, 6); U.rod([6.95, 3.3, 0.35], [6.75, dig + 1.8, 0.35], 0.09, st, 6);
  U.mesh(sideExtrude([[6.3, dig + 1.1], [7.2, dig + 1.1], [7.3, dig + 0.3], [6.5, dig], [5.7, dig + 0.35]], 1.1), mat('#4b5158', { m: 0.5, r: 0.5 }), [0, 0, 0.35]);
}
// Rácsos rúd két pont között: 4 övrúd (b oldalú négyzet) + cikcakk rácsozás
export function lattice(B, a, b, w, material, o = {}) { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), L = d.length(), n = Math.max(2, Math.round(L / (o.bay ?? w * 1.4)));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); const P = (u, sx, sz) => new THREE.Vector3(sx * w / 2, u * L, sz * w / 2).applyQuaternion(q).add(A).toArray();
  const r = o.r ?? w * 0.06; for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) B.rod(P(0, sx, sz), P(1, sx, sz), r, material, 5);
  const C4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n; for (let f = 0; f < 4; f++) { const c0 = C4[f], c1 = C4[(f + 1) % 4]; const s = (i + f) % 2; B.rod(P(u0, ...(s ? c1 : c0)), P(u1, ...(s ? c0 : c1)), r * 0.6, material, 4); } } }
// Kötélkotró / résfalgép: lánctalpas daru rácsos gémmel, a kötélen résmarkoló (grabY: a markoló aljának magassága)
export function crawlerCrane(B, o = {}) { const col = mat(o.color || '#d8452f', { r: 0.5, m: 0.2 }), jib = mat('#e9b21f', { r: 0.5, m: 0.2 }), reach = o.reach ?? 9, top = o.top ?? 24, gy = o.grabY ?? -6;
  tracks(B, 6.4, 3.6, 1.1, 0.8); B.cyl(1.2, 1.2, 0.35, mat(DARK), 0, 1.25, 0, [0, 0, 0], 14);
  B.mesh(sideExtrude([[-3.6, 1.4], [2.0, 1.4], [2.0, 2.4], [1.2, 3.1], [-3.6, 3.1]], 3.2), col); B.box(1.3, 1.5, 3.3, mat('#3a3f45'), -3.1, 2.3, 0);
  B.mesh(sideExtrude([[0.9, 2.5], [2.3, 2.5], [2.3, 3.5], [1.9, 4.1], [0.9, 4.1]], 1.2), mat(GLS, { r: 0.15, m: 0.5 }), [0, 0, 1.15]);
  lattice(B, [1.6, 2.6, 0], [reach, top, 0], 1.1, jib); B.rod([-2.8, 3.1, 0], [-1.6, 8.5, 0], 0.12, jib, 6); B.rod([-1.6, 8.5, 0], [reach - 0.3, top - 0.4, 0], 0.05, mat(DARK), 4); B.rod([-1.6, 8.5, 0], [1.2, 3.1, 0], 0.08, jib, 5);
  B.rod([reach, top, 0], [reach, gy + 6.2, 0], 0.05, mat(DARK), 4);
  if (o.grab !== false) { const g = mat('#5b636c', { m: 0.6, r: 0.45 }); B.box(0.9, 5.2, 2.6, g, reach, gy + 3.6, 0); for (const sz of [-1, 1]) B.mesh(sideExtrude([[-0.5, 1.0], [0.5, 1.0], [0.42, 0.3], [0, 0], [-0.42, 0.3]], 1.2), mat('#2f353b', { m: 0.6, r: 0.5 }), [reach, gy, sz * 0.66]); B.box(1.0, 0.25, 2.7, mat('#e9b21f'), reach, gy + 6.1, 0); } }
// Cölöpfúró gép: lánctalp, felsőváz, függőleges árboc, forgatófej, Kelly-rúd, fúrószerszám (a +x oldalon fúr)
export function pileRig(B, o = {}) { const col = mat(o.color || '#e9b21f', { r: 0.5, m: 0.2 }), H = o.mast ?? 21, dx = 4.2, toolY = o.toolY ?? -2.5;
  tracks(B, 5.6, 3.2, 1.0, 0.75); B.cyl(1.1, 1.1, 0.3, mat(DARK), 0, 1.15, 0, [0, 0, 0], 14);
  B.mesh(sideExtrude([[-3.4, 1.3], [1.6, 1.3], [1.6, 2.2], [0.8, 2.9], [-3.4, 2.9]], 3.0), col); B.box(1.2, 1.4, 3.1, mat('#3a3f45'), -2.9, 2.1, 0);
  B.mesh(sideExtrude([[0.6, 2.3], [2.0, 2.3], [2.0, 3.3], [1.6, 3.9], [0.6, 3.9]], 1.1), mat(GLS, { r: 0.15, m: 0.5 }), [0, 0, 1.05]);
  B.box(0.8, H, 0.8, col, dx - 0.9, 0.6 + H / 2, 0); B.box(1.5, 0.5, 1.2, col, dx - 0.5, 0.6 + H + 0.25, 0); B.box(1.4, 0.4, 1.4, mat(DARK), dx - 0.9, 0.4, 0);
  B.rod([-1.0, 2.9, 0.9], [dx - 0.9, 0.6 + H * 0.62, 0.3], 0.14, mat('#c9ced3', { m: 0.7, r: 0.3 }), 6); B.rod([-1.0, 2.9, -0.9], [dx - 0.9, 0.6 + H * 0.62, -0.3], 0.14, mat('#c9ced3', { m: 0.7, r: 0.3 }), 6);
  B.box(1.5, 1.6, 1.5, mat('#3a3f45'), dx, 6.5, 0); B.cyl(0.22, 0.22, H - 3, mat('#c9ced3', { m: 0.7, r: 0.3 }), dx, 6.5 + (H - 3) / 2 - 1, 0, [0, 0, 0], 8); B.cyl(0.26, 0.26, 6.5 - toolY - 1.6, mat('#8b939b', { m: 0.6, r: 0.4 }), dx, (6.5 + toolY + 1.6) / 2 - 0.8, 0, [0, 0, 0], 8);
  B.cyl(0.6, 0.6, 1.6, mat('#4b5158', { m: 0.5, r: 0.5 }), dx, toolY + 0.8, 0, [0, 0, 0], 12); B.rod([dx, 0.6 + H + 0.4, 0], [dx, 0.6 + H - 2.5, 0], 0.04, mat(DARK), 4); }
// Toronydaru (felső forgású): rácsos torony H magasan, gém J, ellengém CJ, fülke, futómacska T távolságban, kötél és horog HY magasságig
export function towerCrane(B, o = {}) { const col = mat(o.color || '#f2c21a', { r: 0.5, m: 0.2 }), H = o.H ?? 40, J = o.J ?? 45, CJ = o.CJ ?? 14, T = o.T ?? J * 0.6, HY = o.HY ?? H - 14, w = o.w ?? 1.8;
  if (o.base !== false) B.boxB(5, 0.8, 5, mat(C.concreteDark), 0, 0, 0);
  lattice(B, [0, o.y0 ?? 0.8, 0], [0, H, 0], w, col, { bay: w * 1.5 }); B.box(w + 0.6, 1.0, w + 0.6, mat('#3a3f45'), 0, H + 0.5, 0);
  B.mesh(sideExtrude([[0.4, 0], [2.0, 0], [2.2, 0.9], [1.9, 1.9], [0.4, 1.9]], 1.3), mat(GLS, { r: 0.15, m: 0.5 }), [0, H - 1.6, w / 2 + 0.7]);
  lattice(B, [0, H + 1.0, 0], [0, H + 7.5, 0], w * 0.7, col, { bay: w });
  const jr = (a, b) => B.rod(a, b, 0.09, col, 5), jy = H + 1.6, jt = jy + 1.5, n = Math.round(J / 3);
  for (const sz of [-1, 1]) jr([1, jy, sz * 0.7], [J, jy, sz * 0.7]); jr([1, jt, 0], [J - 1, jt, 0]);
  for (let i = 0; i < n; i++) { const x0 = 1 + (J - 2) * i / n, x1 = 1 + (J - 2) * (i + 1) / n, xm = (x0 + x1) / 2; for (const sz of [-1, 1]) { B.rod([x0, jy, sz * 0.7], [xm, jt, 0], 0.05, col, 4); B.rod([xm, jt, 0], [x1, jy, sz * 0.7], 0.05, col, 4); } if (i % 2 === 0) B.rod([x0, jy, -0.7], [x0, jy, 0.7], 0.05, col, 4); }
  for (const sz of [-1, 1]) jr([-CJ, jy, sz * 0.7], [-1, jy, sz * 0.7]); B.box(CJ - 1, 0.12, 1.5, mat('#9aa2aa'), -CJ / 2 - 0.5, jy + 0.05, 0); B.box(3.2, 2.2, 1.6, mat(C.concreteDark), -CJ + 2, jy - 1.2, 0); B.box(2.4, 1.4, 1.5, mat('#3a3f45'), -CJ * 0.45, jy + 0.9, 0);
  const tie = mat(DARK); B.rod([0, H + 7.5, 0], [J * 0.62, jt, 0], 0.05, tie, 4); B.rod([0, H + 7.5, 0], [-CJ + 1, jy + 0.2, 0], 0.05, tie, 4);
  if (o.hook !== false) { B.box(1.4, 0.4, 1.3, mat('#3a3f45'), T, jy - 0.3, 0); B.rod([T, jy - 0.5, 0], [T, HY + 0.9, 0], 0.04, tie, 4); B.box(0.6, 0.9, 0.5, mat('#e23b2c'), T, HY + 0.45, 0); } }

// Fa: törzs + kétszínű lomb (két gömbszerű test)
export function tree2(B, x, z, h = 8, y = 0, o = {}) { const c1 = o.c1 || '#5a9647', c2 = o.c2 || '#74ad55', r = h * 0.3;
  B.cyl(h * 0.03, h * 0.045, h * 0.45, mat(C.trunk), x, y + h * 0.225, z, [0, 0, 0], 6);
  B.mesh(new THREE.IcosahedronGeometry(r, 1), mat(c1, { r: 1 }), [x, y + h * 0.6, z], [0, (x * 7 + z * 3) % 3, 0], [1, 0.9, 1]); B.mesh(new THREE.IcosahedronGeometry(r * 0.7, 1), mat(c2, { r: 1 }), [x + r * 0.35, y + h * 0.82, z - r * 0.2], [0, (x + z) % 3, 0]); }
// Kandeláber
export function lamp(B, x, z, y = 0, h = 7) { B.cyl(0.07, 0.1, h, mat('#3a3f45'), x, y + h / 2, z, [0, 0, 0], 6); B.box(1.0, 0.12, 0.3, mat('#3a3f45'), x + 0.4, y + h, z); B.box(0.5, 0.08, 0.24, mat(LAMP, { em: '#fff2c0', ei: 0.8 }), x + 0.65, y + h - 0.09, z); }

// Névtábla a modellen: a valós helyszín neve (minden változatban rajta van). A tábla a +z felé néz; (x, y, z) a bal alsó sarka
export function plaque(group, text, x, y, z, k, o = {}) { const p = label(group, text, null, [0, 0, 0], o.color || '#c6f432', k, { h: o.h ?? 0.017 }); { const b = group.children[group.children.length - 1]; if (b !== p && b.name.startsWith('label_back_')) group.remove(b); } const w = p.geometry.parameters.width, h = p.geometry.parameters.height;
  p.position.set(x + w / 2, y + h / 2, z); p.name = 'nevtabla'; p.material.name = 'nevtabla'; return p; }
