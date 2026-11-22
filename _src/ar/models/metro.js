// M4-metró a Duna alatt: a Szent Gellért tér – Műegyetem állomás és környéke a mai állapotban (Közlekedési létesítmények).
// A modell a térképi helyzetet követi (OpenStreetMap és légifénykép alapján): a metszősík a metróalagút tengelye, dél (a Műegyetem) felől nézve.
// Jobbra a Duna; a metszet mögött a CH épület északi része (a metszősík átvágja), a Szent Gellért tér, a Gellért Szálló, kb. 180 m-rel hátrébb
// a Szabadság híd, mögötte a Gellért-hegy lába. A metszetben: a rakpart alatti résfalas dobozszerkezet a többszintű vasbeton gerendaráccsal,
// a CH épület alá benyúló peronalagút és a pajzzsal épített alagút a Duna alatt. Animáció (22 s): a szerelvény megáll az állomáson, majd
// továbbindul a Duna alá; fent villamosok és autók járnak.
// Adatok: állomáshossz 87 m, peron 80 m, mélység 31 m (a vonal legmélyebb állomása), kb. 40 m doboz + 40 m peronalagút (metro4.hu, BKK, Sporaarchitects).
// Egyszerűsítés: az alagút a modellben egyenes és a híddal párhuzamos (a valóságban a Duna alatt a Fővám tér felé ível); a K épület a metszősík
// innenső oldalára esne, ezért nincs a modellen.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat, trackScale, person } from '../lib/common.js';
import { at, sideExtrude, planPrism, car2, van2, bus2, tree2, lamp, plaque } from '../lib/kit2.js';
import { chBuilding, szabadsagHid, gellertSzallo, villamos, CH, inset, slope, triGeo } from '../lib/bme.js';
export const FILE = 'metro-pajzs';
const K = 1 / 380;

// egy kötegelő tartalmának elmetszése a z ≤ zmax féltérrel (a metszett épülethez)
function clipBatchZ(b, zmax) { for (const [m, gs] of [...b.parts]) { const out = []; for (const g of gs) { const p = g.attributes.position.array, T = [];
      for (let i = 0; i < p.length; i += 9) { const poly = [[p[i], p[i + 1], p[i + 2]], [p[i + 3], p[i + 4], p[i + 5]], [p[i + 6], p[i + 7], p[i + 8]]], res = [];
        for (let k = 0; k < 3; k++) { const a = poly[k], c = poly[(k + 1) % 3], ia = a[2] <= zmax, ic = c[2] <= zmax; if (ia) res.push(a); if (ia !== ic) { const t = (zmax - a[2]) / (c[2] - a[2]); res.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, zmax]); } }
        for (let k = 1; k + 1 < res.length; k++) T.push([res[0], res[k], res[k + 1]]); }
      if (T.length) { const ng = triGeo(T); ng.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(T.length * 6), 2)); out.push(ng); } }
    if (out.length) b.parts.set(m, out); else b.parts.delete(m); } }
const clipPolyZ = (P, zmax) => { const res = []; for (let k = 0; k < P.length; k++) { const a = P[k], c = P[(k + 1) % P.length], ia = a[1] <= zmax, ic = c[1] <= zmax; if (ia) res.push(a); if (ia !== ic) { const t = (zmax - a[1]) / (c[1] - a[1]); res.push([a[0] + (c[0] - a[0]) * t, zmax]); } } return res; };

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'metro';
  const B = new Batch('metro'), tracks = [], T = 22;
  const X0 = -150, X1 = 125, Z0 = -222, YB = -46, ZB = -21, UQ = 8, LQ1 = 16, LQY = -3.5, WL = -6.5, BED = -13, G0 = 0.15, ZBR = -182;
  const YA = -32.4, R = 3.0, RC = R + 0.35, RP = 4.5, YP = YA - R + RP, RPC = RP + 0.4, SB0 = -30, SB1 = 7, PT0 = -74, PLAT = -33.1, RAIL = YA - R + 1.25;
  const LAY = [[0, -4, '#a08d77'], [-4, -13, C.gravel], [-13, YB, '#77706a']];
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const soil = (xa, xb, ya, yb, za, zb) => { for (const [ra, rb, top] of [[X0, UQ, 0], [UQ, LQ1, LQY], [LQ1, X1, BED]]) for (const [la, lb, col] of LAY) box(B, mat(col), Math.max(xa, ra), Math.min(xb, rb), Math.max(ya, lb), Math.min(yb, la, top), za, zb); };
  const stepsOf = (yc, r) => { const o = [], N = 14; for (let i = 0; i < N; i++) { const ya = yc - r + i * 2 * r / N, yb = ya + 2 * r / N, dy = (ya - yc) * (yb - yc) < 0 ? 0 : Math.min(Math.abs(ya - yc), Math.abs(yb - yc)); o.push([ya, yb, Math.sqrt(Math.max(0, r * r - dy * dy))]); } return o; };
  const stR = stepsOf(YA, RC), stP = stepsOf(YP, RPC);
  const groove = (fn, xa, xb, yc, r, st, ya = YB, yb = 0) => { fn(xa, xb, ya, yc - r, ZB, 0); fn(xa, xb, yc + r, yb, ZB, 0); for (const [a, b, half] of st) fn(xa, xb, a, b, ZB, -half); };
  soil(X0, X1, YB, 0, Z0, ZB);
  groove(soil, X0, PT0, YA, RC, stR); groove(soil, PT0, SB0 - 1, YP, RPC, stP); groove(soil, SB1 + 1, X1, YA, RC, stR);
  soil(SB0 - 1, SB0, YB, -44, ZB, 0); soil(SB1, SB1 + 1, YB, -44, ZB, 0); soil(SB0, SB1, YB, -44, ZB, ZB + 1); soil(SB0, SB1, YB, -37.4, ZB + 1, 0);

  // ---- a Duna: víz, kőburkolatú rézsű, alsó rakpart, támfal mellvéddel ----
  box(B, mat(C.water, { op: 0.8, r: 0.15 }), LQ1, X1, BED, WL, Z0, 0);
  B.mesh(sideExtrude([[0, LQY], [12, BED], [0, BED]], -Z0 - 0.1), mat('#a39e93', { r: 1 }), [LQ1, 0, Z0 / 2]);
  box(B, mat('#4a4e55'), UQ + 0.6, LQ1 - 0.8, LQY, LQY + 0.12, Z0, -0.05); box(B, mat('#cfc6b4'), LQ1 - 0.8, LQ1, LQY, LQY + 0.35, Z0, -0.05); box(B, mat('#cfc6b4', { r: 0.95 }), UQ, UQ + 0.6, LQY, 1.2, Z0, -0.05);
  for (let z = -8; z > Z0; z -= 12) B.cyl(0.25, 0.3, 0.6, mat('#3a3f45'), LQ1 - 0.4, LQY + 0.65, z, [0, 0, 0], 8);
  // ---- felszín: burkolat, utak (térkép szerint), villamosvágány ----
  const pav = mat('#d3cdbf', { r: 0.95 }), asp = mat('#4a4e55', { r: 0.95 }), white = mat('#eeeeea'), railM = mat('#9aa3ab', { m: 0.6, r: 0.4 }), grs = mat('#8fbf6a', { r: 1 });
  box(B, pav, X0, UQ, 0, G0, Z0, 0);
  const seg = (a, b, w, m, y = G0, h = 0.12) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); B.box(L + w * 0.5, h, w, m, (a[0] + b[0]) / 2, y + h / 2, (a[1] + b[1]) / 2, [0, Math.atan2(-dz, dx), 0]); };
  const PATH = [[UQ, ZBR], [-27, ZBR + 2], [-47, -150], [-63, -110], [-82, -68], [X0 + 14, -32]];                                   // a hídról a Gellért Szálló előtt a Bartók Béla útra
  for (let i = 0; i + 1 < PATH.length; i++) { seg(PATH[i], PATH[i + 1], 15, asp); for (const o of [-2.5, -1.07, 1.07, 2.5]) { const a = PATH[i], b = PATH[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L; seg([a[0] + nx * o, a[1] + nz * o], [b[0] + nx * o, b[1] + nz * o], 0.1, railM, G0 + 0.12, 0.05); } }
  seg([PATH[4][0] - 12, PATH[4][1] + 7], [X0 + 4, -28 + 7], 0.01, asp);
  box(B, asp, -4.5, 5, G0, G0 + 0.12, Z0, -0.05); for (let z = -6; z > Z0 + 3; z -= 8) if (Math.abs(z - ZBR) > 10) box(B, white, 0.15, 0.35, G0 + 0.12, G0 + 0.15, z - 2.5, z);                                  // Műegyetem rakpart / Szent Gellért rakpart
  seg([-64, -28], [-91, 8], 11, asp);                                                                                                                     // Budafoki út a CH épület mellett
  for (let z = -10; z > -40; z -= 5.2) for (const x of [-12.5, -7.5]) box(B, white, x - 1.2, x + 1.2, G0 + 0.02, G0 + 0.04, z - 0.08, z + 0.08);          // parkoló a CH előtt
  box(B, mat('#c2bba9', { r: 0.95 }), -40, -8, G0, G0 + 0.05, -120, -46); box(B, grs, -30, -12, G0 + 0.05, G0 + 0.2, -100, -62);                         // a tér díszburkolata, zöldfelület
  B.cyl(4.2, 4.4, 0.5, mat('#cfc6b4'), -34, G0 + 0.3, -112, [0, 0, 0], 20); B.cyl(3.8, 3.8, 0.1, mat(C.water, { r: 0.1 }), -34, G0 + 0.56, -112, [0, 0, 0], 20);    // díszkút a téren
  for (const [x, z, h] of [[-16, -56, 9], [-26, -70, 10], [-15, -84, 9], [-27, -96, 10], [-18, -108, 8], [-8, -134, 9], [-8, -150, 10], [-8, -206, 9], [6.6, -40, 8], [6.6, -64, 8], [6.6, -88, 8], [6.6, -112, 8], [6.6, -136, 8], [-12, -42, 8], [-12, -4, 8], [-72, -40, 8], [-112, -8, 8], [-128, -14, 9], [-96, -122, 9], [-112, -98, 9], [-132, -76, 10]]) tree2(B, x, z, h, G0);
  for (const z of [-20, -52, -84, -116, -148, -212]) lamp(B, 5.6, z, G0, 7);
  // metrólejárat a téren (üvegpavilon, „M” oszlop) és a liftek a CH épület sarkánál
  { const gl = mat('#9cc4d8', { op: 0.55, r: 0.1, m: 0.2 }), st = mat('#3a3f45'); box(B, gl, -52, -41, G0, G0 + 3.2, -60, -55.5); box(B, st, -52.3, -40.7, G0 + 3.2, G0 + 3.5, -60.3, -55.2); box(B, mat('#2b2f33'), -51, -42, G0, G0 + 0.3, -59.5, -56);
    B.cyl(0.18, 0.18, 6, st, -39, G0 + 3, -54, [0, 0, 0], 8); box(B, mat('#3fae49', { em: '#2f9a3a', ei: 0.4 }), -39.9, -38.1, G0 + 5.2, G0 + 7, -54.15, -53.85);
    box(B, gl, -13.5, -10.5, G0, G0 + 4.2, -17, -14.5); box(B, st, -13.7, -10.3, G0 + 4.2, G0 + 4.5, -17.2, -14.3); }
  // ---- háztömbök a Bartók Béla út két oldalán (a metszősík és a modell széle elmetszi) ----
  const block = (P, h, col, roof) => { B.add(planPrism(P, G0, h), mat(col, { r: 0.9 })); B.add(planPrism(inset(P, -0.4), h, h + 0.7), mat('#efe8da')); slope(B, mat(roof, { r: 0.85 }), inset(P, -0.4), h + 0.7, inset(P, 5), h + 4.6); B.add(planPrism(inset(P, 5), h + 4.4, h + 4.6), mat('#8f9498'));
    const n = P.length, gl = mat('#3c5364', { r: 0.2, m: 0.4 }); for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (Math.abs(a[1]) < 0.2 && Math.abs(b[1]) < 0.2 || Math.abs(a[0] - X0) < 0.2 && Math.abs(b[0] - X0) < 0.2) continue;
      const W = at(B, a[0], 0, a[1], Math.atan2(-dz, dx)); for (let f = 0; f * 3.4 + 7.6 < h; f++) for (let x = 2.5; x < L - 2; x += 3.6) W.box(1.5, 2.2, 0.2, gl, x, 6.3 + f * 3.4, 0); W.box(L, 4.0, 0.25, mat('#cfc4ae'), L / 2, G0 + 2, 0); } };
  block([[-74, -47], [-98, -0.05], [X0, -0.05], [X0, -5]], 22, '#e6dccb', '#a65a40');
  block([[-92, -80], [X0, -46], [X0, -98], [-112, -104]], 21, '#ddd3c0', '#9c5a44');
  gellertSzallo(at(B, -59, G0, -130, -0.557), { W: 96, D: 60 });
  // ---- a Gellért-hegy lába a híd mögött: sziklás rézsű ----
  { const rock = mat('#c4beb0', { r: 1 }), HY = [0, 7, 15, 23].map(v => v + G0), CT = [0, 1, 2, 3].map(i => [[X0, -196 - i * 5], [-14 - i * 5, -196 - i * 5], [-14 - i * 5, Z0], [X0, Z0]]);
    for (let i = 0; i < 3; i++) { slope(B, i === 1 ? grs : rock, CT[i], HY[i], CT[i + 1], HY[i + 1], [0]); slope(B, rock, CT[i], HY[i], CT[i + 1], HY[i + 1], [1]); B.add(planPrism(CT[i + 1], HY[i], HY[i + 1]), rock);
      B.add(triGeo([[[CT[i][1][0], HY[i], Z0], [CT[i + 1][1][0], HY[i], Z0], [CT[i + 1][1][0], HY[i + 1], Z0]], [[X0, HY[i], CT[i][0][1]], [X0, HY[i + 1], CT[i + 1][0][1]], [X0, HY[i], CT[i + 1][0][1]]]]), mat('#c4beb0', { r: 1, ds: true })); }
    B.add(planPrism(CT[3], HY[3], HY[3] + 0.4), grs); for (const [x, z, y] of [[-40, -216, 23.5], [-70, -214, 23.5], [-100, -217, 23.5], [-130, -214, 23.5], [-56, -203, 9], [-118, -204, 10], [-90, -209, 19]]) tree2(B, x, z, 8, G0 + y, { c1: '#4f8a40' }); }
  // ---- Szabadság híd: a hídfő a felső rakpart szélén, kapuzat a mederpilléren ----
  szabadsagHid(at(B, UQ, 0, ZBR), { xEnd: X1 - UQ, deck: 0.5, bed: BED });
  // ---- álló járművek, hajó, emberek ----
  for (const [x, z, c, r] of [[-2.2, -30, '#c8ccd0', 1], [-2.2, -96, '#b33a2e', 1], [2.6, -128, '#2f6db5', -1], [2.6, -60, '#3a3f46', -1], [-2.2, -210, '#e9ecef', 1], [-12.5, -12.6, '#7b8894', 1], [-12.5, -23, '#c8ccd0', 1], [-7.5, -28.2, '#b33a2e', 1], [-7.5, -17.8, '#3a3f46', 1]]) car2(at(B, x, G0 + 0.12, z, r > 0 ? Math.PI / 2 : -Math.PI / 2), c, { lite: true });
  bus2(at(B, 2.6, G0 + 0.12, -160, -Math.PI / 2), '#2a63b8'); van2(at(B, 12.2, LQY + 0.12, -40, Math.PI / 2));
  { const S = at(B, 92, WL, -96, Math.PI / 2 + 0.1); S.mesh(sideExtrude([[-20, -0.9], [18, -0.9], [22, 1.5], [-20, 1.5]], 7), mat('#f2f3f1', { r: 0.5 })); S.box(30, 2.6, 6.2, mat('#f2f3f1', { r: 0.5 }), -3, 2.8, 0); S.box(30.2, 1.2, 6.3, mat('#2c3c4a', { r: 0.2, m: 0.4 }), -3, 3.1, 0); S.box(26, 0.2, 6.6, mat('#d8dcdf'), -3, 4.2, 0); S.box(3, 2, 3.4, mat('#f2f3f1'), 8, 5.2, 0); }
  for (const [x, z, r, v] of [[-47, -53, 1, '#3a5f8a'], [-36, -66, 2.5, '#b33a2e'], [-22, -50, 0.5, '#5a6a3a'], [-38, -104, 4, '#3a3f46'], [-20, -40, 1.5, '#8a5a3a'], [6.8, -52, 0, '#2f6db5'], [6.8, -100, 3, '#c98a2e'], [-14, -30, 2, '#6a4a8a']]) person(B, x, z, r, { y: G0, vest: v, helmet: '#5a4632', shirt: v });

  // ---- az állomás: résfalas doboz a rakpart alatt ----
  const conc = mat('#d5d1c8'), concD = mat('#b9b5ad'), concL = mat('#e3e0d8');
  const wallX = (xa, xb, yc, r, st) => groove((a, b, ya, yb, za, zb) => box(B, concD, a, b, ya, yb, Math.max(za, ZB + 1), zb), xa, xb, yc, r, st, -44, -2.4);
  wallX(SB0 - 1, SB0, YP, RPC, stP); wallX(SB1, SB1 + 1, YA, RC, stR); box(B, concD, SB0 - 1, SB1 + 1, -44, -2.4, ZB, ZB + 1);
  box(B, conc, SB0, SB1, -37.4, -35, ZB + 1, 0); box(B, conc, SB0 - 1, SB1 + 1, -2.4, -1, ZB, 0); box(B, mat(LAY[0][2]), SB0 - 1, SB1 + 1, -1, 0, ZB, 0);
  box(B, concL, SB0, SB1, -35, PLAT, -11.5, -1.7); box(B, mat('#e8c53a'), SB0, SB1, PLAT, PLAT + 0.04, -2.1, -1.75); box(B, concD, SB0, SB1, -35, RAIL - 0.2, -1.7, 0);
  box(B, conc, SB0, -18, -8.4, -7.6, ZB + 1, 0); box(B, conc, 4, SB1, -8.4, -7.6, ZB + 1, 0); box(B, conc, -18, 4, -8.4, -7.6, ZB + 1, -17.5); box(B, conc, -25, -17, -20.5, -20, -18.5, -4.5);
  const GR = [[-13.2, [[-26, 0.25], [-20, -0.35], [-11, 0.15], [-3, -0.2], [4.5, 0.3]]], [-18.6, [[-24, -0.3], [-15, 0.2], [-8, -0.15], [1, 0.33], [5, -0.1]]], [-25.2, [[-27, 0.15], [-19, -0.25], [-12, 0.3], [-2, -0.3], [4.6, 0.1]]]];
  for (const [y, list] of GR) { for (const [x, a] of list) B.box(1.2, 1.6, 18.6 / Math.cos(a), concL, x, y, -10.5, [0, a, 0]); box(B, concL, SB0, SB1, y - 0.8, y + 0.8, ZB + 1, ZB + 2.2); box(B, concL, SB0, SB1, y - 0.7, y + 0.7, -10.6, -9.4); }
  const esc = (xa, ya, xb, yb, z) => { const L = Math.hypot(xb - xa, yb - ya), a = Math.atan2(yb - ya, xb - xa); B.box(L, 0.9, 3.4, mat('#9aa2aa', { m: 0.5, r: 0.4 }), (xa + xb) / 2, (ya + yb) / 2 - 0.5, z, [0, 0, a]); B.box(L, 0.08, 2.6, mat('#2b2f33'), (xa + xb) / 2, (ya + yb) / 2 - 0.02, z, [0, 0, a]);
    for (const s of [-1.6, 0, 1.6]) B.box(L, 0.9, 0.1, mat('#cfe3ef', { op: 0.6, r: 0.1 }), (xa + xb) / 2, (ya + yb) / 2 + 0.45, z + s, [0, 0, a]); };
  esc(4, -7.6, -17.5, -20, -15.5); esc(-19, -20, 3.6, PLAT, -7.5);
  for (const [x, y, z, r] of [[-6, PLAT, -6, 1], [-14, PLAT, -9, 3], [-24, PLAT, -5, 2], [5.6, -7.6, -10, 4], [-22, -7.6, -8, 1]]) person(B, x, z, r, { y, vest: '#3a5f8a', helmet: '#5a4632', shirt: '#3a5f8a' });
  // ---- peronalagút a CH épület alatt: héj, peron, átjárók a középső csarnok felé ----
  B.mesh(new THREE.CylinderGeometry(RP, RP, SB0 - 1 - PT0, 20, 1, true, Math.PI / 2, Math.PI), mat('#dedad1', { ds: true, r: 0.8 }), [(PT0 + SB0 - 1) / 2, YP, 0], [0, 0, Math.PI / 2]);
  box(B, concL, PT0, SB0, -35, PLAT, -3.85, -1.7); box(B, mat('#e8c53a'), PT0, SB0, PLAT, PLAT + 0.04, -2.1, -1.75); box(B, concD, PT0, SB0, -35.2, RAIL - 0.2, -1.7, 0);
  for (let x = PT0 + 6; x < SB0 - 4; x += 9) box(B, mat('#3b3f44'), x - 1.4, x + 1.4, PLAT, PLAT + 2.7, -4.25, -4.0);
  for (let x = PT0 + 3; x < SB0; x += 6) box(B, mat('#fff6d8', { em: '#fff2c0', ei: 0.9 }), x - 1.2, x + 1.2, YP + 3.3, YP + 3.45, -2.4, -2.1);
  for (const [x, z, r] of [[-40, -2.8, 1], [-54, -3.2, 3], [-65, -2.7, 2]]) person(B, x, z, r, { y: PLAT, vest: '#b33a2e', helmet: '#3a3f46', shirt: '#b33a2e' });
  box(B, railM, X0, X1, RAIL - 0.18, RAIL, -0.78, -0.66);
  // ---- a pajzzsal épített alagút tübbinggyűrűi ----
  const ringGeo = (x, k) => { for (let s = 0; s < 3; s++) { const a0 = Math.PI + s * Math.PI / 3 + 0.015, da = Math.PI / 3 - 0.03; B.mesh(new THREE.CylinderGeometry(R, R, 1.42, 4, 1, true, a0 - Math.PI / 2, da), mat((s + k) % 2 ? '#c8c3b8' : '#bdb7ab', { ds: true }), [x + 0.75, YA, 0], [0, 0, Math.PI / 2]); } };
  for (let x = X0, k = 0; x < PT0 - 0.01; x += 1.5, k++) ringGeo(x, k); for (let x = SB1 + 1, k = 0; x < X1 - 1.4; x += 1.5, k++) ringGeo(x, k);
  box(B, concD, X0, PT0, YA - R + 0.15, RAIL - 0.2, -R * 0.62, 0); box(B, concD, SB1 + 1, X1, YA - R + 0.15, RAIL - 0.2, -R * 0.62, 0);
  for (const [xa, xb] of [[X0 + 4, PT0 - 2], [SB1 + 6, X1 - 3]]) for (let x = xa; x < xb; x += 10) box(B, mat('#fff6d8', { em: '#fff2c0', ei: 0.9 }), x - 0.6, x + 0.6, YA + 1.2, YA + 1.35, -2.72, -2.6);
  B.build(root);
  // ---- a CH épület: a teljes épületből a metszősík mögötti (északi) rész; a metszet a födémeket mutatja ----
  { const cb = new Batch('ch'), OX = -36.56, OZ = -16.54, RY = 2.81, c = Math.cos(RY), s = Math.sin(RY), toM = ([x, z]) => [OX + x * c + z * s, OZ - x * s + z * c];
    chBuilding(at(cb, OX, G0, OZ, RY), { inner: true }); clipBatchZ(cb, -0.02);
    const O = clipPolyZ(inset(CH.P, 0.4).map(toM), -0.02), I = clipPolyZ(inset(CH.P, CH.D - 0.3).map(toM), -0.02);
    for (const y of [CH.Y[1], CH.Y[2], CH.Y[3]]) cb.add(planPrism(O, G0 + y - 0.2, G0 + y + 0.2, I.length > 2 ? [I] : []), mat('#d9d4c8'));
    const g = new THREE.Group(); g.name = 'ch_epulet'; root.add(g); for (const m of cb.build(g)) { m.material = m.material.clone(); m.material.side = THREE.DoubleSide; } }
  // ---- a szerelvény: megáll az állomáson, majd továbbindul a Duna alá ----
  const train = node(root, 'szerelveny'), vb = new Batch('szerelveny');
  for (let i = 0; i < 4; i++) { const x = -28.8 + i * 19.2; vb.box(18.7, 2.9, 2.7, mat('#e9ecef', { r: 0.5, m: 0.2 }), x, 1.95, 0); vb.box(18.2, 1.0, 2.74, mat('#26323d', { r: 0.2, m: 0.5 }), x, 2.35, 0); vb.box(18.7, 0.22, 2.76, mat('#3fae49'), x, 1.05, 0); vb.box(18.0, 0.2, 2.3, mat('#b9bec4'), x, 3.5, 0);
    for (const d of [-6, 0, 6]) vb.box(1.4, 2.1, 2.78, mat('#cfd4d8', { m: 0.3 }), x + d, 1.75, 0); for (const d of [-6.4, 6.4]) vb.box(2.6, 0.5, 2.2, mat('#2b2f33'), x + d, 0.3, 0); }
  for (const sx of [-1, 1]) vb.box(0.1, 1.2, 2.3, mat('#26323d', { r: 0.2, m: 0.5 }), sx * 38.2, 2.3, 0); vb.build(train);
  const xS = -33.5, xA = -106, xE = 84, S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];
  tracks.push(trackPos(train, [0, 2, 5.5, 10.5, 14, 17.5, 17.6, T], [[xA, RAIL, 0], [xA + 22, RAIL, 0], [xS, RAIL, 0], [xS, RAIL, 0], [xS + 24, RAIL, 0], [xE, RAIL, 0], [xA, RAIL, 0], [xA, RAIL, 0]]), trackScale(train, [0, 17.5, 17.6, T - 0.3, T], [S1, S1, S0, S0, S1]));
  train.position.set(xS, RAIL, 0);
  // ---- forgalom: villamosok a hídon át a Bartók Béla útra, autók a rakparton ----
  const along = (nd, pts, y, rev) => { const P = rev ? [...pts].reverse() : pts, L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const ang = (i) => { const a = P[Math.min(i, P.length - 2)], b = P[Math.min(i, P.length - 2) + 1]; return [0, Math.atan2(-(b[1] - a[1]), b[0] - a[0]), 0]; }, tt = L.map(l => l / L[L.length - 1] * (T - 0.2));
    tracks.push(trackPos(nd, [...tt, T - 0.1, T], [...P.map(p => [p[0], y, p[1]]), [P[0][0], y, P[0][1]], [P[0][0], y, P[0][1]]]), trackQuat(nd, [...tt, T - 0.1, T], [...P.map((_, i) => ang(i)), ang(0), ang(0)]));
    const mid = Math.floor(P.length / 2); nd.position.set(P[mid][0], y, P[mid][1]); nd.rotation.set(...ang(mid)); };
  const TP = [[X1 - 14, ZBR], ...PATH.slice(0, 5), [X0 + 16, -33]], off = (o) => TP.map((p, i) => { const a = TP[Math.max(0, i - 1)], b = TP[Math.min(TP.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [p[0] - (b[1] - a[1]) / L * o, p[1] + (b[0] - a[0]) / L * o]; });
  for (const [o, rev] of [[1.8, false], [-1.8, true]]) { const nd = node(root, 'villamos'), b2 = new Batch('villamos'); villamos(b2); b2.build(nd); along(nd, off(o), 0.42, rev); }
  for (const [o, rev, c] of [[5.2, false, '#b33a2e'], [-5.2, true, '#2f6db5']]) { const nd = node(root, 'auto'), b2 = new Batch('auto'); car2(b2, c, { lite: true }); b2.build(nd); along(nd, off(o).map(([x, z], i, A) => [x, z]), 0.3, rev); }
  for (const [x, d, c] of [[-2.2, 1, '#e9ecef'], [2.6, -1, '#7b8894']]) { const nd = node(root, 'auto'), b2 = new Batch('auto'); car2(b2, c, { lite: true }); b2.build(nd); along(nd, [[x, Z0 + 5], [x, -8]], G0 + 0.12, d < 0); }
  plaque(root, hu ? 'Szent Gellért tér – Műegyetem · M4-metró, Budapest' : 'Szent Gellért tér – Műegyetem · Metro line M4, Budapest', X0 + 3, YB + 2.5, 0.3, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('metro', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Pajzzsal épített alagút a Duna alatt' : 'Shield-driven tunnel under the Danube', [70, YA + R - 0.4, -0.3], [58, YA - 12, 8], '#c8c3b8', K);
    label(G, h ? 'Résfalas dobozszerkezet\nvasbeton gerendaráccsal' : 'Diaphragm-wall box braced\nby a concrete beam grid', [-10, -18, 0], [-14, -53, 8], '#e3e0d8', K);
    label(G, h ? 'Peronalagút a CH épület alatt' : 'Platform tunnel beneath the “CH” building', [-54, YP + RP - 0.4, -0.3], [-146, -19, 8], '#dedad1', K);
    label(G, h ? 'A vonal legmélyebb állomása: 31 m' : 'Deepest station of the line: 31 m', [-4, PLAT, -1.8], [44, -52, 8], SPEC.kozl, K);
    label(G, h ? 'BME CH épület (1902–1904)' : 'BME “CH” building (1902–1904)', [-46, 16, -3], [-128, 40, 4], '#b5553d', K);
    label(G, h ? 'Szent Gellért tér' : 'Szent Gellért Square', [-30, G0, -80], [-6, 30, -70], '#c2bba9', K);
    label(G, h ? 'Gellért Szálló' : 'Hotel Gellért', [-62, 30, -132], [-96, 62, -128], '#7f9c92', K);
    label(G, h ? 'Szabadság híd' : 'Liberty Bridge', [87, 34, ZBR + 6.6], [96, 60, ZBR + 8], '#4d7c63', K);
    label(G, h ? 'Duna' : 'Danube', [110, WL, -8], [112, 14, 4], C.waterDeep, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [22, 24], posterT: 8, labelT: 8 };
}
