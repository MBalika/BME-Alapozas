// Feszültséghagyma és határmélység (5. előadás) – a Síkalapok süllyedésszámítása tananyag Kany-féle lamellás mintapéldája szerint:
// négyzetes pilléralap, B = L = 1,2 m, alapsík −1,0 m, 450 kN → σ_talp = 312,5 kPa, σ_g = 20 kPa, p_0 = 292,5 kPa;
// 1. réteg kavicsos homok (az alapsík alatt 2,4 m-ig), 2. réteg iszapos homok; γ = 20 kN/m³.
// A héjak a többletfeszültség 80–10 %-os izobárjai (egyenletesen terhelt, azonos területű körlapra; Boussinesq, numerikus integrálás).
// A metszeten a karakterisztikus pont alatti Δσ_z a Kany-táblázatból (B/L = 1, lineáris interpoláció) és a σ_g/5 vonala (n = 5 szabály):
// a metszéspontjuk a határmélység. A teher két lépcsőben kerül rá: fél teherrel m_0 ≈ 2,4 m, a teljessel m_0 = 3,3 m – a határmélység a teherrel nő.
import { THREE, Batch, mat, C, label, node, person, trackPos, trackScale, poseAt } from '../lib/common.js';
import { tree2, plaque } from '../lib/kit2.js';
export const FILE = 'feszultseghagyma';
const K = 1 / 20, T = 16;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];
const KZ = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5, 10, 20], KV = [1, 0.981, 0.898, 0.694, 0.557, 0.470, 0.409, 0.362, 0.289, 0.234, 0.144, 0.094, 0.047, 0.028, 0.018, 0.005, 0.001]; // Kany, B/L = 1
const kany = (zB) => { if (zB <= 0) return 1; for (let i = 0; i < KZ.length - 1; i++) if (zB <= KZ[i + 1]) return KV[i] + (KV[i + 1] - KV[i]) * (zB - KZ[i]) / (KZ[i + 1] - KZ[i]); return KV[KV.length - 1]; };

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'hagyma'; const tracks = [];
  const H = 2.6, DEP = 5.1, FY = -1.0, Bf = 1.2, a = Math.sqrt(Bf * Bf / Math.PI), P0 = 292.5, GAM = 20, YL = FY - 2.4, GR = 0.1;
  const sg5 = (z) => GAM * (-FY + z) / 5;                                   // σ_g/5 az alapsík alatt z mélységben
  const m0 = (u) => { if (u * P0 <= sg5(0)) return 0; let z0 = 0, z1 = 8; for (let i = 0; i < 40; i++) { const zm = (z0 + z1) / 2; if (kany(zm / Bf) * u * P0 > sg5(zm)) z0 = zm; else z1 = zm; } return (z0 + z1) / 2; };
  const M0 = m0(1);                                                         // 3,30 m
  // σz/q a körlap alatt (r, z) pontban
  const sig = (r, z) => { let s = 0; const NR = 22, NT = 40; for (let i = 0; i < NR; i++) { const ro = (i + 0.5) / NR * a; for (let j = 0; j < NT; j++) { const th = (j + 0.5) / NT * Math.PI * 2; const d2 = ro * ro + r * r - 2 * r * ro * Math.cos(th) + z * z; s += ro / Math.pow(d2, 2.5); } }
    return 3 * z * z * z / (2 * Math.PI) * s * (a / NR) * (2 * Math.PI / NT); };
  const profile = (L) => { let z0 = 0.05, z1 = 14; for (let i = 0; i < 30; i++) { const zm = (z0 + z1) / 2; if (sig(0, zm) > L) z0 = zm; else z1 = zm; } const zmax = z0, pts = [];
    const N = 26; for (let i = 0; i <= N; i++) { const z = Math.max(0.03, zmax * (1 - Math.cos(Math.PI / 2 * i / N))); let r0 = 0, r1 = 7; if (i === N) { pts.push([0, -zmax]); break; } for (let k2 = 0; k2 < 22; k2++) { const rm = (r0 + r1) / 2; if (sig(rm, z) > L) r0 = rm; else r1 = rm; } pts.push([r0, -z]); }
    pts.unshift([a, 0]); return pts; }; // felülről (az alap széle) lefelé a tengelyig
  const LV = [[0.1, '#3f8fd6'], [0.2, '#45b6c9'], [0.4, '#f2cf45'], [0.6, '#f08a2e'], [0.8, '#dc3f32']];
  const INK = '#2a2f36', BLUE = '#2a4fd0', BLUEF = '#9cc4f2', SG = '#c8501e', MC = '#b3379a';

  // ---- talajtömb két réteggel: a +x, +z negyed nyitva ----
  const B = new Batch('tomb'); const L1 = '#e2c98f', L2 = '#c7a877', L2D = '#b3966a';
  for (const [x0, x1, z0, z1] of [[-H, 0, -H, H], [0, H, -H, 0]]) { const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    B.box(w, -GR - YL, d, mat(L1), cx, (YL - GR) / 2, cz); B.box(w, YL + DEP, d, mat(L2), cx, (YL - DEP) / 2, cz); B.box(w, GR, d, mat(C.grass), cx, -GR / 2, cz); }
  for (const [w, d, x, z] of [[H, 0.012, H / 2, 0.004], [0.012, H, 0.004, H / 2]]) B.box(w, 0.03, d, mat(L2D), x, YL, z);      // réteghatár a két metszetlapon
  B.box(2 * H, 0.45, 2 * H, mat(L2D), 0, -DEP - 0.225, 0); B.boxB(2 * H + 1.0, 0.3, 2 * H + 1.0, mat(C.base), 0, -DEP - 0.75, 0);
  person(B, -1.9, 1.7, 0.7, {}); tree2(B, -1.9, -1.9, 2.4, 0); tree2(B, 1.9, -2.0, 1.9, 0);
  B.build(root);

  // ---- pilléralap + pillér + teher: a teherrel kissé megsüllyed (torzítva) ----
  const tL = [0, 1.0, 2.2, 9.6, 11.4, 14.6, 15.4, T];
  const nF = node(root, 'alap'); { const b = new Batch('alap'); b.box(Bf, 0.5, Bf, mat(C.concrete), 0, FY + 0.25, 0); b.box(0.4, 1.9, 0.4, mat('#efe9dc'), 0, FY + 0.5 + 0.95, 0); b.box(0.56, 0.12, 0.56, mat(C.concreteDark), 0, FY + 2.46, 0); b.build(nF);
    tracks.push(trackPos(nF, tL, [0.07, 0.07, 0.035, 0.035, 0, 0, 0.07, 0.07].map(y => [0, y, 0]))); }
  const nL = node(nF, 'teher', [0, FY + 2.52, 0]); { const b = new Batch('teher'); const m = mat('#e8952a', { r: 0.5 }); b.cyl(0.11, 0.11, 1.2, m, 0, 1.1, 0, [0, 0, 0], 12); b.mesh(new THREE.ConeGeometry(0.3, 0.56, 16), m, [0, 0.28, 0], [Math.PI, 0, 0]); b.build(nL);
    nL.scale.set(1, 0.25, 1); tracks.push(trackScale(nL, tL, [0.25, 0.25, 0.62, 0.62, 1, 1, 0.25, 0.25].map(s => [1, s, 1]))); }

  // ---- izobár-héjak a nyitott negyedben: a külső héj csak a két metszetsík mellett, a belsők egyre szélesebben ----
  const P = LV.map(([L]) => profile(L)), n = LV.length, anchors = [];
  LV.forEach(([L, col], i) => { const g = node(root, 'izobar', [0, FY, 0]); const b = new Batch('izo'); const m = mat(col, { r: 0.7 }); const pts = P[i], w = (i + 1) / n * Math.PI / 4;
    const lp = pts.slice().reverse().map(p => new THREE.Vector2(Math.max(p[0], 0.001), p[1])); // alulról felfelé: kifelé néző normálisok
    const sh = (mir) => { const s = new THREE.Shape(); s.moveTo(0, 0); pts.forEach(p => s.lineTo(mir ? -p[0] : p[0], p[1])); s.closePath(); return new THREE.ShapeGeometry(s); };
    if (i === n - 1) { b.add(new THREE.LatheGeometry(lp, 30, 0, Math.PI / 2), m); }
    else { b.add(new THREE.LatheGeometry(lp, 10, 0, w), m); b.add(new THREE.LatheGeometry(lp, 10, Math.PI / 2 - w, w), m);
      const c1 = sh(true); c1.rotateY(w + Math.PI / 2); b.add(c1, m); const c2 = sh(false); c2.rotateY(Math.PI / 2 - w - Math.PI / 2); b.add(c2, m); }
    b.build(g); g.scale.set(...S0); const t0 = 2.5 + (n - 1 - i) * 0.8; tracks.push(trackScale(g, [0, t0, t0 + 0.9, 14.6, 15.2, T], [S0, S0, S1, S1, S0, S0]));
    const mid = pts[Math.floor(pts.length * 0.6)]; anchors.push([mid[0], FY + mid[1]]); });

  // ---- a számítás a metszetlapon (z = 0, x > 0): Δσ_z a karakterisztikus pont alatt (Kany) és a σ_g/5 vonal ----
  const xa = 1.32, W0 = 1.18, ZD = 4.1, zf = 0.014;
  const nA = node(root, 'tengely', [xa, FY, zf]); { const b = new Batch('teng'); b.box(0.018, ZD + 0.12, 0.006, mat(INK), 0, -(ZD + 0.12) / 2 + 0.06, 0);
    const g = new THREE.BufferGeometry(), w = 0.014, x0 = W0 * sg5(0) / P0, x1 = W0 * sg5(ZD) / P0; g.setAttribute('position', new THREE.Float32BufferAttribute([x0 - w, 0, 0.004, x0 + w, 0, 0.004, x1 - w, -ZD, 0.004, x1 + w, -ZD, 0.004], 3)); g.setIndex([0, 2, 1, 1, 2, 3]); g.computeVertexNormals(); b.add(g, mat(SG));
    b.build(nA); nA.scale.set(...S0); tracks.push(trackScale(nA, [0, 6.5, 7.1, 14.6, 15.2, T], [S0, S0, S1, S1, S0, S0])); }
  const zs = []; for (let z = 0; z <= ZD + 1e-9; z += 0.03) zs.push(Math.min(z, ZD)); const cur = zs.map(z => [W0 * kany(z / Bf), -z]);
  const nD = node(root, 'dszigma', [xa, FY, zf]); { const b = new Batch('dsz');
    const s = new THREE.Shape(); s.moveTo(0, 0); cur.forEach(p => s.lineTo(p[0], p[1])); s.lineTo(0, -ZD); s.closePath(); const gF = new THREE.ShapeGeometry(s); gF.translate(0, 0, 0.001); b.add(gF, mat(BLUEF, { r: 0.9 }));
    const pos = [], idx = [], w = 0.02; cur.forEach((p, i) => { const q = cur[Math.max(0, i - 1)], r = cur[Math.min(cur.length - 1, i + 1)], L = Math.hypot(r[0] - q[0], r[1] - q[1]), nx = -(r[1] - q[1]) / L, ny = (r[0] - q[0]) / L; pos.push(p[0] - nx * w, p[1] - ny * w, 0.006, p[0] + nx * w, p[1] + ny * w, 0.006); });
    for (let i = 0; i < cur.length - 1; i++) { const q = 2 * i; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
    const gL = new THREE.BufferGeometry(); gL.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gL.setIndex(idx); gL.computeVertexNormals(); b.add(gL, mat(BLUE, { ds: true }));
    b.box(W0, 0.03, 0.006, mat(BLUE), W0 / 2, 0, 0.004);                                                                        // p_0 az alapsíkon
    b.build(nD); }
  // lamellák (a teljes teher után): fent 0,2 m, lejjebb 0,4 m vastagok, a határmélységig
  const nM = node(root, 'lamellak', [xa, FY, zf]); { const b = new Batch('lam'); for (const z of [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2]) { const wd = W0 * kany(z / Bf); b.box(wd, 0.012, 0.004, mat(BLUE), wd / 2, -z, 0.005); }
    b.build(nM); nM.scale.set(...S0); tracks.push(trackScale(nM, [0, 11.5, 12.1, 14.6, 15.0, T], [[1, 0.001, 0.001], [1, 0.001, 0.001], S1, S1, S0, S0])); }
  // a határmélység síkja: sáv a tömb körül és a két metszetlapon, áttetsző lap a nyitott negyedben; a metszésponton jelölő
  const nH = node(root, 'hatarmelyseg', [0, FY, 0]); { const b = new Batch('hm'); const m = mat(MC, { r: 0.6 }), t = 0.05, e = 0.012;
    b.box(H, t, e, m, H / 2, 0, e / 2); b.box(e, t, H, m, e / 2, 0, H / 2);                                                       // a két metszetlapon
    b.box(e, t, 2 * H, m, -H - e / 2, 0, 0); b.box(2 * H, t, e, m, 0, 0, -H - e / 2); b.box(e, t, H, m, H + e / 2, 0, -H / 2); b.box(H, t, e, m, -H / 2, 0, H + e / 2); // a tömb külső lapjain
    b.box(H, 0.012, H, mat(MC, { op: 0.26, r: 0.9 }), H / 2, 0, H / 2);
    b.build(nH); nH.scale.set(...S0); }
  const nP = node(root, 'metszespont', [xa, FY, zf + 0.012]); { const b = new Batch('mp'); b.mesh(new THREE.SphereGeometry(0.075, 18, 12), mat('#ffffff', { r: 0.5 }), [0, 0, 0.02]); b.mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 24), mat(MC), [0, 0, 0.02]); b.build(nP); nP.scale.set(...S0); }
  // a görbe a teherrel szélesedik, a határmélység vele süllyed: fél teher (7,2–8,6 s), majd teljes teher (9,6–11,4 s)
  { const kt = [], ku = []; const N1 = 10, N2 = 8; for (let i = 0; i <= N1; i++) { const f = i / N1; kt.push(7.2 + 1.4 * f); ku.push(0.5 * f * f * (3 - 2 * f)); } for (let i = 0; i <= N2; i++) { const f = i / N2; kt.push(9.6 + 1.8 * f); ku.push(0.5 + 0.5 * f * f * (3 - 2 * f)); }
    const U = (u) => Math.max(u, 0.001), ts = [0, ...kt, 14.6, 15.2, T], us = [0, ...ku, 1, 0, 0];
    tracks.push(trackScale(nD, ts, us.map(u => [U(u), 1, 1]))); nD.scale.set(0.001, 1, 1);
    tracks.push(trackPos(nH, ts, us.map(u => [0, FY - m0(u), 0])));
    tracks.push(trackPos(nP, ts, us.map(u => { const z = m0(u); return [xa + W0 * sg5(z) / P0, FY - z, zf + 0.012]; })));
    for (const nd of [nH, nP]) tracks.push(trackScale(nd, [0, 7.2, 7.5, 14.6, 15.0, T], [S0, S0, S1, S1, S0, S0])); }

  plaque(root, lang === 'hu' ? 'Feszültséghagyma és határmélység' : 'Pressure bulb and influence depth', -H + 0.25, -DEP - 0.41, H + 0.02, K, { h: 0.016, color: '#e866c8' });
  const clips = [new THREE.AnimationClip('hagyma', T, tracks)];
  const PT = 13.4; poseAt(root, clips[0], PT);
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu', o = { h: 0.032, ry: Math.PI / 4 }, dec = (v) => String(v).replace('.', hu ? ',' : '.');
    // a héjak feliratai a bal metszetlap előtt, egymás alatt
    LV.forEach(([L, col], i) => { const [r, y] = anchors[i]; const yl = [-4.3, -3.55, -2.8, -2.05, -1.3][i]; label(G, (L * 100).toFixed(0) + (hu ? ' %' : '%'), i === n - 1 ? [r * 0.72, y, r * 0.72] : [0.03, y, r], [0.1, yl, 4.3], col, K, o); });
    label(G, 'p_0 = ' + dec(P0) + ' kPa', [0.45, FY, 0.62], [0.1, 0.6, 4.3], C.concreteDark, K, o);
    const zc = 0.45; label(G, 'Δσ_z (Kany)', [xa + W0 * kany(zc / Bf) * 0.6, FY - zc, zf + 0.02], [4.3, 0.6, 0.1], BLUE, K, o);
    label(G, 'σ_g / 5', [xa + W0 * sg5(1.9) / P0, FY - 1.9, zf + 0.02], [4.3, -1.4, 0.1], SG, K, o);
    label(G, (hu ? 'határmélység: m_0 = ' : 'influence depth: m_0 = ') + dec(M0.toFixed(1)) + ' m', [xa + W0 * sg5(M0) / P0, FY - M0, zf + 0.06], [4.3, -3.2, 0.1], MC, K, o);
    return G; };
  return { root, labels, clips, k: K, posterView: [45, 22], posterT: PT, labelT: PT };
}
