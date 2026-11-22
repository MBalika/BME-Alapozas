// Műegyetemi és környékbeli épületek a modellekhez: a BME CH épülete (Szent Gellért tér 4., Czigler Győző, 1902–1904),
// a Szabadság híd budai része és a Gellért Szálló tömege. Méretek méterben; a részletek légifénykép és fényképek alapján egyszerűsítve.
import { THREE, Batch, mat, C } from './common.js';
import { at, sideExtrude, planPrism } from './kit2.js';

// ---- alaprajzi segédek (konvex sokszög, a külső normális (dz, −dx)) ----
export function inset(P, d) { const n = P.length, L = [];
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); L.push({ p: [a[0] - dz / l * d, a[1] + dx / l * d], d: [dx / l, dz / l] }); }
  return P.map((_, i) => { const A = L[(i + n - 1) % n], Q = L[i], cr = A.d[0] * Q.d[1] - A.d[1] * Q.d[0], t = ((Q.p[0] - A.p[0]) * Q.d[1] - (Q.p[1] - A.p[1]) * Q.d[0]) / cr; return [A.p[0] + A.d[0] * t, A.p[1] + A.d[1] * t]; }); }
export const triGeo = (tris) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris.flat(2)), 3)); g.computeVertexNormals(); return g; };
// ferde (vagy vízszintes) sáv két, azonos csúcsszámú sokszög megfelelő oldalai között; a lapok felfelé néznek
export function slope(B, m, A, yA, Q, yQ, sides) { const n = A.length, T = [];
  for (const i of sides ?? A.map((_, k) => k)) { const j = (i + 1) % n, p = [[A[i][0], yA, A[i][1]], [A[j][0], yA, A[j][1]], [Q[j][0], yQ, Q[j][1]], [Q[i][0], yQ, Q[i][1]]];
    const u = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], v = [p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]], ny = u[2] * v[0] - u[0] * v[2];
    if (ny >= 0) T.push([p[0], p[1], p[2]], [p[0], p[2], p[3]]); else T.push([p[0], p[2], p[1]], [p[0], p[3], p[2]]); }
  B.add(triGeo(T), m); }
// gyűrű (vagy annak megadott oldalai) két sokszög között, y0 és y1 között
export function ring(B, m, O, I, y0, y1, sides) { const n = O.length; for (const i of sides ?? O.map((_, k) => k)) { const j = (i + 1) % n; B.add(planPrism([O[i], O[j], I[j], I[i]], y0, y1), m); } }
const disc = (B, m, r, x, y, z, t = 0.2) => B.mesh(new THREE.CylinderGeometry(r, r, t, 14), m, [x, y, z], [Math.PI / 2, 0, 0]);

// ---- CH épület: négyszög alaprajzú, zárt udvaros tömb a Szent Gellért tér, a Budafoki út és a Műegyetem rakpart között;
// vörös tégla fehér kősávokkal, kő lábazattal, az emeleten félköríves ablakokkal, vörös cseréptetővel; az udvarban a nagyelőadó.
// Helyi rendszer: az északi (Szent Gellért téri) főhomlokzat a +z felé néz, közepe az origó; a keleti (Duna felőli) oldal a −x.
// A háborúban elpusztult kupolát idéző tetőfelépítményt a modell nem tartalmazza (dome: true-val kérhető).
export const CH = { P: [[21, 0], [-21, 0], [-46.7, -74.7], [42, -84.4]], D: 14, Y: [0, 3.4, 9.0, 15.4], cor: 0.5, roof: 4.4 };
export const CH_LEVELS = { alap: [0, 3.4], f1: [3.4, 9.0], f2: [9.0, 15.4], teto: [15.4, 22] };
export function chBuilding(B, o = {}) {
  const on = (p) => !o.parts || o.parts.includes(p), dy = o.dy || 0, M = o.mono, sides = o.sides, open = !!o.open;
  const brick = mat(M ? M.wall : '#b5553d', { r: 0.9 }), stone = mat(M ? M.trim : '#ece6d8', { r: 0.85 }), tile = mat(M ? M.roof : '#b4573c', { r: 0.85 }), flat = mat(M ? M.roof : '#8f9498', { r: 0.8 }),
    glass = mat(M ? M.glass : '#2f4354', { r: 0.2, m: M ? 0 : 0.5 }), door = mat(M ? M.glass : '#5b3f2c', { r: 0.7 }), plaster = mat(M ? M.trim : '#efe9dc'), slab = mat(M ? M.trim : '#cfcac0');
  const { P, D, Y } = CH, n = P.length, S = sides ?? [0, 1, 2, 3], G = at(B, 0, dy, 0), I = inset(P, D), yC = Y[3] + CH.cor;
  const lv = [['alap', Y[0], Y[1]], ['f1', Y[1], Y[2]], ['f2', Y[2], Y[3]]];
  // --- falak szintenként; nyitott (metszett) változatban homlokzati fal + födémek + harántfalak ---
  for (const [p, ya, yb] of lv) { if (!on(p)) continue;
    if (!open) ring(G, brick, P, I, ya, yb, S); else { ring(G, brick, P, inset(P, 0.9), ya, yb, S); ring(G, plaster, inset(P, 0.9), inset(P, 1.0), ya + 0.4, yb, S); ring(G, slab, inset(P, 0.5), I, ya, ya + 0.4, S); } }
  if (o.lines) for (const [p, ya, yb] of lv) if (on(p)) for (let y = ya + o.lines / 2; y < yb - 0.1; y += o.lines) ring(G, mat(M.line), inset(P, -0.035), inset(P, 0.3), y, y + 0.09, S);
  if (on('alap')) ring(G, stone, inset(P, -0.15), inset(P, 0.5), 0, 1.1, S);                                                                                  // lábazati kősáv
  const bands = [['alap', 2.95, 0.45, 0.14], ['f1', 4.9, 0.28, 0.06], ['f1', 6.5, 0.28, 0.06], ['f1', 8.55, 0.45, 0.16], ['f2', 10.7, 0.28, 0.06], ['f2', 12.5, 0.28, 0.06], ['f2', 14.2, 0.28, 0.06]];
  for (const [p, y, h, out] of bands) if (on(p)) ring(G, stone, inset(P, -out), inset(P, 0.4), y, y + h, S);
  if (on('teto')) { ring(G, stone, inset(P, -0.6), inset(P, open ? 0.9 : D + 0.3), Y[3], yC, S);                                                             // főpárkány
    const yR = yC + CH.roof; slope(G, tile, inset(P, -0.6), yC, inset(P, 4.4), yR, S); slope(G, flat, inset(P, 4.4), yR, inset(P, D - 4.4), yR, S);
    if (!open) slope(G, tile, inset(P, D + 0.3), yC, inset(P, D - 4.4), yR, S); else { ring(G, slab, inset(P, 0.5), I, Y[3], Y[3] + 0.4, S); slope(G, flat, inset(P, D - 4.4), yR, I, yR, S); } }
  // --- homlokzatok oldalanként: ablaktengelyek 4,2 m-enként ---
  for (const i of S) { const a = P[i], b = P[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), W = at(B, a[0], dy, a[1], Math.atan2(-dz, dx));   // helyi x: az oldal mentén, kifelé: −z
    const nW = Math.floor((L - 14) / 4.2), x0 = (L - (nW - 1) * 4.2) / 2;
    for (let k = 0; k < nW; k++) { const x = x0 + k * 4.2; if (i === 0 && Math.abs(x - L / 2) < 8.5) continue; if (i === 2 && Math.abs(x - L / 2) < 12) continue;
      if (on('alap')) W.box(1.5, 1.2, 0.2, glass, x, 1.95, -0.02);
      if (on('f1')) { W.box(2.0, 3.5, 0.24, stone, x, 6.35, -0.02); W.box(1.45, 3.0, 0.3, glass, x, 6.35, -0.03); if (open) W.box(1.45, 3.0, 0.1, mat('#bcd6e6', { em: '#9fc4dc', ei: 0.35 }), x, 6.35, 1.02); }
      if (on('f2')) { W.box(2.1, 3.6, 0.24, stone, x, 12.0, -0.02); disc(W, stone, 1.05, x, 13.8, -0.02, 0.24); W.box(1.5, 3.4, 0.3, glass, x, 12.0, -0.03); disc(W, glass, 0.75, x, 13.7, -0.03, 0.3);
        if (open) W.box(1.5, 3.6, 0.1, mat('#bcd6e6', { em: '#9fc4dc', ei: 0.35 }), x, 12.2, 1.02); }
      if (!open && (i === 0 || o.inner !== false)) { if (on('f1')) W.box(1.5, 3.0, 0.2, glass, x, 6.35, D + 0.02); if (on('f2')) W.box(1.5, 3.4, 0.2, glass, x, 12.1, D + 0.02); } }
    if (open) for (let x = 7.5; x < L - 3; x += 8.4) for (const [p, ya, yb] of lv) if (on(p) && p !== 'alap') W.box(0.35, yb - ya - 0.4, D - 1.0, plaster, x, (ya + yb) / 2 + 0.2, 1.0 + (D - 1.0) / 2);   // harántfalak
    if (on('teto')) for (let x = 12; x < L - 10; x += 12) W.box(1.3, 2.4, 1.3, brick, x, yC + CH.roof + 0.6, D / 2 + 2);                                                                        // kémények
    // északi középrizalit: főbejárat lépcsővel, oszlopos kapuzattal, fölötte három magas, íves ablak; attika, alacsony tető
    if (i === 0) { const cx = L / 2, w = 15;
      for (const [p, ya, yb] of lv) if (on(p)) { W.box(w, yb - ya, 2.2, brick, cx, (ya + yb) / 2, -0.3); for (const s of [-1, 1]) W.box(1.5, yb - ya, 2.5, stone, cx + s * (w / 2 - 0.75), (ya + yb) / 2, -0.35); }
      for (const [p, y, h] of bands) if (on(p)) W.box(w + 0.3, h, 2.6, stone, cx, y + h / 2, -0.4);
      if (on('alap')) { W.box(w + 0.2, 1.1, 2.5, stone, cx, 0.55, -0.4); for (let k = 0; k < 6; k++) W.box(7.6 - k * 0.3, 0.5, 0.6, stone, cx, 0.25 + k * 0.5, -1.4 - (5 - k) * 0.55); W.box(7.2, 3.0, 3.4, stone, cx, 1.5, -1.4); }
      if (on('f1')) { W.box(4.6, 5.2, 0.5, stone, cx, 6.0, -1.5); W.box(2.6, 4.0, 0.56, door, cx, 5.4, -1.52); disc(W, glass, 1.3, cx, 7.4, -1.52, 0.56); for (const s of [-1, 1]) W.cyl(0.34, 0.38, 5.0, stone, cx + s * 2.7, 5.9, -2.0, [0, 0, 0], 10); W.box(7.0, 0.6, 1.4, stone, cx, 8.6, -1.9);
        for (const s of [-1, 1]) { W.box(1.9, 3.4, 0.3, stone, cx + s * 5.0, 6.3, -1.42); W.box(1.4, 2.9, 0.34, glass, cx + s * 5.0, 6.3, -1.44); } }
      if (on('f2')) for (const s of [-1, 0, 1]) { W.box(2.6, 4.3, 0.3, stone, cx + s * 4.3, 11.9, -1.42); disc(W, stone, 1.3, cx + s * 4.3, 14.05, -1.42, 0.3); W.box(1.9, 4.1, 0.34, glass, cx + s * 4.3, 11.9, -1.44); disc(W, glass, 0.95, cx + s * 4.3, 13.95, -1.44, 0.34); }
      if (on('teto')) { W.box(w + 0.9, CH.cor + 0.2, 3.2, stone, cx, Y[3] + (CH.cor + 0.2) / 2, -0.5); W.box(w, 1.9, 2.4, stone, cx, yC + 1.1, -0.4); W.box(5.2, 1.5, 2.6, stone, cx, yC + 2.6, -0.45);
        if (o.dome) { W.mesh(new THREE.SphereGeometry(7.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), flat, [cx, yC + 2, 5], [0, 0, 0], [1, 1.25, 1]); W.cyl(1.2, 1.5, 2.6, stone, cx, yC + 12, 5, [0, 0, 0], 10); }
        else W.mesh(sideExtrude([[-w / 2, 0], [w / 2, 0], [w / 2 - 3.6, 3.4], [-w / 2 + 3.6, 3.4]], 6.5), tile, [cx, yC + 2.05, 3.6]); } }
    // déli pavilon (a kert felé): kiugró tömb magas, íves ablakokkal, szürke tetővel
    if (i === 2) { const cx = L / 2, w = 22, d = 9;
      for (const [p, ya, yb] of lv) if (on(p)) { W.box(w, yb - ya, d + 2, brick, cx, (ya + yb) / 2, -d / 2 + 1); for (const s of [-1, 1]) W.box(1.4, yb - ya, 1.4, stone, cx + s * (w / 2 - 0.5), (ya + yb) / 2, -d + 0.5); }
      for (const [p, y, h] of bands) if (on(p)) W.box(w + 0.3, h, d + 2.3, stone, cx, y + h / 2, -d / 2 + 1);
      if (on('alap')) W.box(w + 0.3, 1.1, d + 2.3, stone, cx, 0.55, -d / 2 + 1);
      for (const s of [-1.5, -0.5, 0.5, 1.5]) { const x = cx + s * 4.6; if (on('f1')) { W.box(2.2, 3.5, 0.3, stone, x, 6.35, -d - 0.02); W.box(1.6, 3.0, 0.36, glass, x, 6.35, -d - 0.03); }
        if (on('f2')) { W.box(2.4, 4.0, 0.3, stone, x, 12.0, -d - 0.02); disc(W, stone, 1.2, x, 14.0, -d - 0.02, 0.3); W.box(1.8, 3.8, 0.36, glass, x, 12.0, -d - 0.03); disc(W, glass, 0.9, x, 13.9, -d - 0.03, 0.36); } }
      if (on('teto')) { W.box(w + 1.2, CH.cor + 0.2, d + 3.2, stone, cx, Y[3] + (CH.cor + 0.2) / 2, -d / 2 + 1); W.mesh(sideExtrude([[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [w / 2 - 5, 4.6], [-w / 2 + 5, 4.6]], d + 2.6).rotateY(0), flat, [cx, yC + 0.1, -d / 2 + 1]); } }
  }
  // --- saroktornyok: lekerekített sarokrizalit kősávokkal, kúpos cseréptetővel ---
  const Ic = inset(P, 3.6);
  for (const i of (o.corners ?? [0, 1, 2, 3])) { const [x, z] = Ic[i], r = 6.0, T = at(B, x, dy, z);
    for (const [p, ya, yb] of lv) if (on(p)) T.cyl(r, r, yb - ya, brick, 0, (ya + yb) / 2, 0, [0, 0, 0], 18);
    for (const [p, y, h, out] of bands) if (on(p)) T.cyl(r + out + 0.05, r + out + 0.05, h, stone, 0, y + h / 2, 0, [0, 0, 0], 18);
    if (on('alap')) T.cyl(r + 0.2, r + 0.25, 1.1, stone, 0, 0.55, 0, [0, 0, 0], 18);
    if (o.lines) for (const [p, ya, yb] of lv) if (on(p)) for (let y = ya + o.lines / 2; y < yb - 0.1; y += o.lines) T.cyl(r + 0.035, r + 0.035, 0.09, mat(M.line), 0, y + 0.045, 0, [0, 0, 0], 18);
    const out = Math.atan2(P[i][0] - x, P[i][1] - z); for (let k = -2; k <= 2; k++) { const a = out + k * 0.5, sx = Math.sin(a), cz = Math.cos(a);
      if (on('f1')) { T.box(1.7, 3.3, 0.3, stone, sx * r, 6.35, cz * r, [0, a, 0]); T.box(1.25, 2.9, 0.36, glass, sx * r, 6.35, cz * r, [0, a, 0]); }
      if (on('f2')) { T.box(1.8, 4.2, 0.3, stone, sx * r, 12.2, cz * r, [0, a, 0]); T.box(1.3, 3.8, 0.36, glass, sx * r, 12.2, cz * r, [0, a, 0]); } }
    if (on('teto')) { T.cyl(r + 0.7, r + 0.7, CH.cor + 0.2, stone, 0, Y[3] + (CH.cor + 0.2) / 2, 0, [0, 0, 0], 18); T.mesh(new THREE.ConeGeometry(r + 0.5, 7.5, 18), tile, [0, yC + 3.85, 0]); T.cyl(0.08, 0.08, 2.2, mat(M ? M.roof : '#3a3f45'), 0, yC + 8.4, 0, [0, 0, 0], 5); } }
  // --- az udvarban a nagyelőadó (fehér tetővel) ---
  if (!sides && on('f1')) { const H = inset(P, D + 5.5); G.add(planPrism(H, Y[1], Y[1] + 6.2), brick); G.add(planPrism(inset(H, -0.3), Y[1] + 6.2, Y[1] + 6.9), mat(M ? M.trim : '#f1f1ee', { r: 0.6 })); }
  if (!sides && on('alap')) G.add(planPrism(inset(P, D - 0.2), 0, 0.15), mat(M ? M.trim : '#b9b2a4'));
}

// ---- Szabadság híd (1896): Gerber-csuklós rácsos acélhíd; a budai parti nyílás és a kapuzat a turulokkal, a középső nyílás eleje.
// Helyi rendszer: a híd tengelye az x; a budai hídfő x = 0, a pillér (kapuzat) x = 79, a modell a főnyílásban xEnd-ig tart; a pálya felső síkja y = deck.
export function szabadsagHid(B, o = {}) { const xE = o.xEnd ?? 125, deck = o.deck ?? 7, bed = o.bed ?? -12, HT = 31, green = mat('#4d7c63', { r: 0.55, m: 0.35 }), stone = mat('#cfc6b4', { r: 0.9 }), ZT = 6.6, gold = mat('#d9b23c', { m: 0.8, r: 0.3 }), bird = mat('#3b3f3a', { m: 0.5, r: 0.5 });
  const hTop = (x) => x <= 79 ? 3.2 + (HT - 3.2) * Math.pow(x / 79, 1.9) : 4.2 + (HT - 4.2) * Math.pow(Math.max(0, 1 - (x - 79) / 87.5), 2.0);         // a felső öv magassága a pálya fölött
  // pálya: útpálya, villamosvágány, járdák a főtartókon kívül (konzolon), korlát
  B.box(xE, 1.1, 2 * ZT + 6.6, mat('#3f5f4f', { r: 0.6, m: 0.3 }), xE / 2, deck - 0.55, 0); B.box(xE, 0.1, 2 * ZT - 1.2, mat('#3f434a', { r: 0.95 }), xE / 2, deck + 0.05, 0);
  for (const z of [-2.5, -1.07, 1.07, 2.5]) B.box(xE, 0.06, 0.1, mat('#9aa3ab', { m: 0.6, r: 0.4 }), xE / 2, deck + 0.12, z);
  for (const s of [-1, 1]) { B.box(xE, 0.12, 2.6, mat('#b9b2a4', { r: 0.9 }), xE / 2, deck + 0.06, s * (ZT + 1.9)); B.box(xE, 0.08, 0.08, green, xE / 2, deck + 1.2, s * (ZT + 3.2)); for (let x = 1; x < xE; x += 3.1) B.box(0.07, 1.15, 0.07, green, x, deck + 0.6, s * (ZT + 3.2)); }
  // rácsos főtartók: felső öv (láncszerű ív), alsó öv, oszlopok, rácsrudak
  for (const s of [-1, 1]) { const z = s * ZT, n = Math.round(xE / 6.2); let px = 0, py = deck + hTop(0);
    B.box(xE, 0.7, 0.7, green, xE / 2, deck + 0.35, z);
    for (let i = 1; i <= n; i++) { const x = xE * i / n, y = deck + hTop(x); B.rod([px, py, z], [x, y, z], 0.34, green, 6); B.rod([x, deck + 0.3, z], [x, y, z], 0.2, green, 5); if (y - deck > 5) B.rod([px, i % 2 ? deck + 0.3 : py, z], [x, i % 2 ? y : deck + 0.3, z], 0.15, green, 5); px = x; py = y; } }
  for (let x = 12; x < xE; x += 12.4) { const y = deck + hTop(x); if (y - deck > 9) B.rod([x, y, -ZT], [x, y, ZT], 0.18, green, 5); }
  // kapuzat a pillér fölött: két oszlop, keresztkötések, középen aranyozott címermező, a csúcsokon aranygömbön turul
  for (const s of [-1, 1]) { const z = s * ZT; B.boxB(2.6, HT + 3.5, 2.2, green, 79, deck, z); B.boxB(3.2, 1.0, 2.8, green, 79, deck + HT + 3.5, z); B.mesh(new THREE.ConeGeometry(1.5, 3.4, 4), green, [79, deck + HT + 6.2, z], [0, Math.PI / 4, 0]);
    B.mesh(new THREE.SphereGeometry(0.75, 10, 8), gold, [79, deck + HT + 8.4, z]); B.box(0.5, 0.9, 2.8, bird, 79, deck + HT + 9.7, z); B.box(1.3, 0.5, 0.5, bird, 79.3, deck + HT + 9.5, z); }
  for (const y of [HT - 1, HT - 9]) B.box(1.4, 1.6, 2 * ZT, green, 79, deck + y, 0); B.box(0.5, 4.5, 4.2, gold, 79, deck + HT - 5, 0);
  // kőpillér a mederben és a budai hídfő a vámszedőházakkal
  B.mesh(sideExtrude([[-4.5, bed - 2], [4.5, bed - 2], [3.3, deck - 1.1], [-3.3, deck - 1.1]], 2 * ZT + 9), stone, [79, 0, 0]); B.box(7.6, 0.9, 2 * ZT + 10, stone, 79, deck - 1.5, 0);
  B.box(9, deck - 1.1 - bed, 2 * ZT + 12, stone, -3.5, (deck - 1.1 + bed) / 2, 0);
  for (const s of [-1, 1]) { B.boxB(5.5, 6.5, 5.5, stone, -2.5, deck, s * (ZT + 6.4)); B.mesh(new THREE.ConeGeometry(4.4, 3.4, 4), mat('#6f9a86', { r: 0.6, m: 0.3 }), [-2.5, deck + 8.2, s * (ZT + 6.4)], [0, Math.PI / 4, 0]); B.box(1.4, 2.4, 0.2, mat('#33485a', { r: 0.2 }), -2.5, deck + 2.6, s * (ZT + 3.6)); }
}

// ---- Gellért Szálló (1918) egyszerűsített tömege: világos homlokzat, a Duna felőli főhomlokzaton középkupola és két saroktorony kupolával.
// Helyi rendszer: a főhomlokzat a +x felé (a Duna felé) néz, az épület a −x felé nyúlik; szélessége (z) W, mélysége D.
export function gellertSzallo(B, o = {}) { const W = o.W ?? 62, D = o.D ?? 44, H = 21, wall = mat('#e9dfc8', { r: 0.9 }), trim = mat('#f4eedf', { r: 0.85 }), roof = mat('#8a8f86', { r: 0.7 }), glass = mat('#3c5364', { r: 0.2, m: 0.5 }), dome = mat('#7f9c92', { r: 0.6, m: 0.3 });
  B.boxB(D, H, W, wall, -D / 2, 0, 0); B.boxB(D + 0.8, 0.9, W + 0.8, trim, -D / 2, H, 0); B.boxB(D - 3, 2.6, W - 3, roof, -D / 2, H + 0.9, 0); B.boxB(D + 0.4, 4.5, W + 0.4, trim, -D / 2, 0, 0);
  for (let f = 0; f < 5; f++) for (let i = 0; i < 15; i++) { const z = -W / 2 + 5 + i * (W - 10) / 14; if (Math.abs(z) < 8.5) continue; B.box(0.3, 2.3, 1.5, glass, 0.06, 6.3 + f * 3.2, z); }
  for (let f = 0; f < 5; f++) for (let i = 0; i < 9; i++) for (const s of [-1, 1]) B.box(1.5, 2.3, 0.3, glass, -5 - i * (D - 10) / 8, 6.3 + f * 3.2, s * (W / 2 + 0.06));
  B.boxB(3.0, H + 4, 16, wall, 0.8, 0, 0); B.box(0.3, 9, 5.5, glass, 2.4, 9, 0); B.mesh(new THREE.CylinderGeometry(2.75, 2.75, 0.3, 14), glass, [2.4, 13.5, 0], [0, 0, Math.PI / 2]);        // középrizalit nagy íves ablakkal
  for (const s of [-1, 1]) B.box(0.3, 7, 1.8, glass, 2.4, 9, s * 5.6); B.boxB(4.2, 4.6, 12, trim, 1.4, 0, 0); B.box(0.3, 3.2, 6, mat('#5b3f2c'), 3.5, 1.9, 0);
  B.mesh(new THREE.SphereGeometry(7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), dome, [-3, H + 4, 0], [0, 0, 0], [1, 0.8, 1]); B.cyl(0.9, 1.2, 2.4, trim, -3, H + 10.4, 0, [0, 0, 0], 8); B.mesh(new THREE.ConeGeometry(1.3, 2.2, 8), dome, [-3, H + 12.6, 0]);
  for (const s of [-1, 1]) { B.cyl(4.6, 4.6, H + 3, wall, -1.5, (H + 3) / 2, s * (W / 2 - 2), [0, 0, 0], 14); B.mesh(new THREE.SphereGeometry(4.8, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), dome, [-1.5, H + 3, s * (W / 2 - 2)], [0, 0, 0], [1, 1.25, 1]); B.cyl(0.5, 0.7, 2, trim, -1.5, H + 9.6, s * (W / 2 - 2), [0, 0, 0], 8); }
}

// ---- sárga budapesti villamos (kb. 27 m, három tagból); helyi x: menetirány ----
export function villamos(B) { const yel = mat('#f2c417', { r: 0.5, m: 0.2 }), gls = mat('#2c3c4a', { r: 0.15, m: 0.5 }), dk = mat('#2a2d31');
  for (const [x, L] of [[-9, 8.6], [0, 8.6], [9, 8.6]]) { B.mesh(sideExtrude([[-L / 2, 0.35], [L / 2, 0.35], [L / 2, 3.1], [-L / 2, 3.1]], 2.4), yel, [x, 0, 0]); B.box(L - 0.8, 1.05, 2.44, gls, x, 2.15, 0); B.box(L - 0.4, 0.2, 2.2, mat('#e9e9e4'), x, 3.2, 0); B.box(L * 0.6, 0.5, 2.0, dk, x, 0.4, 0); }
  for (const x of [-4.5, 4.5]) B.box(0.5, 2.6, 2.1, dk, x, 1.75, 0); for (const s of [-1, 1]) B.box(0.1, 1.5, 2.2, gls, s * 13.32, 2.0, 0);
  B.rod([-1.2, 3.3, 0], [0, 4.6, 0], 0.05, dk, 4); B.rod([1.2, 3.3, 0], [0, 4.6, 0], 0.05, dk, 4); B.box(0.1, 0.06, 1.6, dk, 0, 4.62, 0); }

// ---- kötegelő tartalmának elmetszése egy tengelyre merőleges síkkal: megmarad a (koordináta ≤ max) vagy (≥ max, ha keepLess = false) rész ----
export function clipBatch(b, ax, max, keepLess = true) { const sg = keepLess ? 1 : -1; for (const [m, gs] of [...b.parts]) { const out = []; for (const g of gs) { const p = g.attributes.position.array, T = [];
      for (let i = 0; i < p.length; i += 9) { const poly = [[p[i], p[i + 1], p[i + 2]], [p[i + 3], p[i + 4], p[i + 5]], [p[i + 6], p[i + 7], p[i + 8]]], res = [];
        for (let k = 0; k < 3; k++) { const a = poly[k], c = poly[(k + 1) % 3], ia = sg * (a[ax] - max) <= 0, ic = sg * (c[ax] - max) <= 0; if (ia) res.push(a); if (ia !== ic) { const t = (max - a[ax]) / (c[ax] - a[ax]); res.push([0, 1, 2].map(j => j === ax ? max : a[j] + (c[j] - a[j]) * t)); } }
        for (let k = 1; k + 1 < res.length; k++) T.push([res[0], res[k], res[k + 1]]); }
      if (T.length) { const ng = triGeo(T); ng.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(T.length * 6), 2)); out.push(ng); } }
    if (out.length) b.parts.set(m, out); else b.parts.delete(m); } }

// ---- BME K (központi) épület (Hauszmann Alajos, 1906–1909): a Duna-parti főhomlokzat és az épület elülső része.
// Tégla homlokzat kőtagozatokkal, kő középrizalit hat kétszintes korinthoszi oszloppal, mellette két kis torony, sarokrizalitok, vörösesbarna tető.
// Helyi rendszer: a főhomlokzat a +z felé (a Duna felé) néz, közepe az origó; az épület a −z felé nyúlik, a modell `back` mélységig tartalmazza.
export function kBuilding(B, o = {}) { const L = 105, back = o.back ?? 60, brick = mat('#a9553c', { r: 0.9 }), stone = mat('#e2d8c2', { r: 0.85 }), roof = mat('#7a3328', { r: 0.85 }), roofD = mat('#8a4630', { r: 0.85 }), glass = mat('#2b3a47', { r: 0.2, m: 0.5 }), dark = mat('#1f1b17');
  const box = (m, xa, xb, ya, yb, za, zb) => B.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2);
  const hip = (xa, xb, za, zb, y, h, m) => { const w = xb - xa, d = zb - za; if (w >= d) B.mesh(sideExtrude([[-d / 2 - 0.4, 0], [d / 2 + 0.4, 0], [d * 0.12, h], [-d * 0.12, h]], w + 0.8).rotateY(Math.PI / 2), m, [(xa + xb) / 2, y, (za + zb) / 2]); else B.mesh(sideExtrude([[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [w * 0.12, h], [-w * 0.12, h]], d + 0.8), m, [(xa + xb) / 2, y, (za + zb) / 2]); };
  // ablaksor egy homlokzati szakaszon: (x a→b a z = zf síkon, vagy z a→b az x = xf síkon), szintenként
  const ROWS = [[1.9, 1.1, 0], [5.4, 2.8, 0], [10.6, 3.4, 1], [15.6, 3.0, 0], [19.2, 1.5, 0]];
  const wins = (a, b, f, alongX, out, H, sp = 3.6) => { const n = Math.max(1, Math.floor((b - a - 2) / sp)), s0 = (a + b) / 2 - (n - 1) * sp / 2; for (let i = 0; i < n; i++) { const s = s0 + i * sp; for (const [y, h, arch] of ROWS) { if (y + h / 2 > H - 0.8) continue;
        if (alongX) { if (h > 2) B.box(1.9, h + 0.5, 0.2, stone, s, y, f + out * 0.04); B.box(1.35, h, 0.26, glass, s, y, f + out * 0.05); if (arch) { B.mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.2, 8), stone, [s, y + h / 2, f + out * 0.04], [Math.PI / 2, 0, 0]); B.mesh(new THREE.CylinderGeometry(0.67, 0.67, 0.26, 8), glass, [s, y + h / 2 - 0.05, f + out * 0.05], [Math.PI / 2, 0, 0]); } }
        else { if (h > 2) B.box(0.2, h + 0.5, 1.9, stone, f + out * 0.04, y, s); B.box(0.26, h, 1.35, glass, f + out * 0.05, y, s); } } } };
  const bands = (xa, xb, za, zb, H) => { box(stone, xa - 0.15, xb + 0.15, 0, 1.2, za - 0.15, zb + 0.15); for (const y of [3.6, 8.2, 13.6]) box(stone, xa - 0.08, xb + 0.08, y, y + 0.35, za - 0.08, zb + 0.08); box(stone, xa - 0.5, xb + 0.5, H - 0.8, H, za - 0.5, zb + 0.5); };
  // főszárny a rakpart mentén, oldalszárnyak és középszárny hátrafelé
  box(brick, -L + 12, L - 12, 0, 21, -16, 0); bands(-L + 12, L - 12, -16, 0, 21); hip(-L + 12, L - 12, -16, 0, 21, 4.2, roof); wins(-L + 12, -14, 0, true, 1, 21); wins(14, L - 12, 0, true, 1, 21);
  for (const s of [-1, 1]) { const xa = s > 0 ? L - 16 : -L, xb = s > 0 ? L : -L + 16; box(brick, xa, xb, 0, 21, -back, -16); bands(xa, xb, -back, -16, 21); hip(xa, xb, -back, -16, 21, 4.2, roof); wins(-back, -18, s > 0 ? xb : xa, false, s, 21);
    box(brick, xa - (s < 0 ? 2 : 0), xb + (s > 0 ? 2 : 0), 0, 22.5, -18, 2); bands(xa - (s < 0 ? 2 : 0), xb + (s > 0 ? 2 : 0), -18, 2, 22.5); hip(xa - (s < 0 ? 2 : 0), xb + (s > 0 ? 2 : 0), -18, 2, 22.5, 5.6, roofD); wins(xa, xb, 2, true, 1, 22.5, 3.3); wins(-18, 2, s > 0 ? xb + 2 : xa - 2, false, s, 22.5, 3.3); }
  box(brick, -11, 11, 0, 21, -back, -16); hip(-11, 11, -back, -16, 21, 4.2, roof);
  // középrizalit: kő, három íves kapu, fölötte hat kétszintes oszlop, párkány, attika négy szoborral; magas tető
  box(stone, -13, 13, 0, 23, -14, 7); box(stone, -13.5, 13.5, 22.2, 23, -14.5, 7.5); hip(-13, 13, -14, 7, 23, 8, roof);
  for (const y of [9.2, 14.6]) for (const dx of [-8, -4, 0, 4, 8]) { B.box(1.6, 3.4, 0.2, glass, dx, y, 7.05); }
  box(stone, -11, 11, 0, 6.6, 7, 9.3); box(stone, -11.3, 11.3, 6.6, 7.1, 7, 9.5); for (const dx of [-5, 0, 5]) { B.box(2.6, 3.9, 0.3, dark, dx, 2.45, 9.3); B.mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.3, 14), dark, [dx, 4.4, 9.3], [Math.PI / 2, 0, 0]); }
  for (let i = 0; i < 6; i++) { B.cyl(0.62, 0.72, 11.4, stone, -10 + i * 4, 12.8, 8.2, [0, 0, 0], 12); box(stone, -10.8 + i * 4, -9.2 + i * 4, 18.5, 19.0, 7.4, 9.0); }
  box(stone, -11.4, 11.4, 19.0, 20.8, 7, 9.4); box(stone, -11, 11, 20.8, 22.2, 7, 9.0); for (const dx of [-9, -3, 3, 9]) { box(stone, dx - 0.5, dx + 0.5, 22.2, 22.7, 7.7, 8.5); B.cyl(0.2, 0.36, 2.6, stone, dx, 24.0, 8.1, [0, 0, 0], 8); B.mesh(new THREE.SphereGeometry(0.26, 8, 6), stone, [dx, 25.5, 8.1]); }
  for (let k = 0; k < 4; k++) box(stone, -11 - k * 0.4, 11 + k * 0.4, 0, 0.9 - k * 0.22, 9.3, 10.4 + k * 0.6);
  // a két kis torony a középrizalit mellett
  for (const s of [-1, 1]) { const tx = s * 16; box(stone, tx - 3, tx + 3, 0, 26.5, -5.4, 0.6); box(stone, tx - 3.4, tx + 3.4, 25.7, 26.5, -5.8, 1.0); B.mesh(new THREE.ConeGeometry(4.6, 7.5, 4), roofD, [tx, 30.2, -2.4], [0, Math.PI / 4, 0]); B.cyl(0.07, 0.07, 2.4, dark, tx, 35, -2.4, [0, 0, 0], 5);
    for (const y of [5.4, 10.6, 15.6, 21.5]) B.box(1.5, 2.8, 0.2, glass, tx, y, 0.65); }
}
