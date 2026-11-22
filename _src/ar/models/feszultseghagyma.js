// Feszültséghagyma (5. előadás) – pilléralap alatti függőleges feszültségnövekmény (σz/q) izobárjai kivágott talajtömbben.
// Az izobárok egyenletesen terhelt körlapra számítva (Boussinesq, numerikus integrálás), az egyenértékű sugár a 2 × 2 m-es alapéval egyező területű.
// A nyitott negyedben a héjak lépcsősen visszavágva látszanak (kívül a kis, belül a nagy feszültség); a teher ráadása után belülről kifelé jelennek meg.
import { THREE, Batch, mat, C, label, node, person, trackPos, trackScale, poseAt } from '../lib/common.js';
import { at, car2, dumper, pileRig, towerCrane, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'feszultseghagyma';
const K = 1 / 25, T = 13;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'hagyma'; const tracks = [];
  const H = 3.4, DEP = 5.9, FY = -1.0, a = Math.sqrt(4 / Math.PI);
  // σz/q a körlap alatt (r, z) pontban
  const sig = (r, z) => { let s = 0; const NR = 22, NT = 40; for (let i = 0; i < NR; i++) { const ro = (i + 0.5) / NR * a; for (let j = 0; j < NT; j++) { const th = (j + 0.5) / NT * Math.PI * 2; const d2 = ro * ro + r * r - 2 * r * ro * Math.cos(th) + z * z; s += ro / Math.pow(d2, 2.5); } }
    return 3 * z * z * z / (2 * Math.PI) * s * (a / NR) * (2 * Math.PI / NT); };
  const profile = (L) => { let z0 = 0.05, z1 = 14; for (let i = 0; i < 30; i++) { const zm = (z0 + z1) / 2; if (sig(0, zm) > L) z0 = zm; else z1 = zm; } const zmax = z0, pts = [];
    const N = 26; for (let i = 0; i <= N; i++) { const z = Math.max(0.04, zmax * (1 - Math.cos(Math.PI / 2 * i / N))); let r0 = 0, r1 = 7; if (i === N) { pts.push([0, -zmax]); break; } for (let k2 = 0; k2 < 22; k2++) { const rm = (r0 + r1) / 2; if (sig(rm, z) > L) r0 = rm; else r1 = rm; } pts.push([r0, -z]); }
    pts.unshift([a, 0]); return pts; }; // felülről (az alap széle) lefelé a tengelyig
  const LV = [[0.1, '#3f8fd6'], [0.2, '#45b6c9'], [0.4, '#f2cf45'], [0.6, '#f08a2e'], [0.8, '#dc3f32']];
  // talajtömb: a +x, +z negyed nyitva
  const B = new Batch('tomb'); const SAND = '#dcc089', SANDD = '#c7a970';
  for (const [x0, x1, z0, z1] of [[-H, 0, -H, H], [0, H, -H, 0]]) { B.box(x1 - x0, DEP, z1 - z0, mat(SAND), (x0 + x1) / 2, -DEP / 2, (z0 + z1) / 2); B.box(x1 - x0, 0.14, z1 - z0, mat(C.grass), (x0 + x1) / 2, 0.07, (z0 + z1) / 2); }
  B.box(2 * H, 0.7, 2 * H, mat(SANDD), 0, -DEP - 0.35, 0); B.boxB(2 * H + 1.2, 0.35, 2 * H + 1.2, mat(C.base), 0, -DEP - 1.05, 0);
  person(B, -2.5, 2.4, 0.6, { y: 0.14 }); tree2(B, -2.6, -2.5, 2.6, 0.14); tree2(B, 2.5, -2.6, 2.1, 0.14);
  B.build(root);
  // alap + pillér + teher: a teher ráadásakor kissé megsüllyed
  const nF = node(root, 'alap'); { const b = new Batch('alap'); b.box(2, 0.6, 2, mat(C.concrete), 0, FY + 0.3, 0); b.box(0.55, 4.2, 0.55, mat('#efe9dc'), 0, FY + 0.6 + 2.1, 0); b.build(nF);
    tracks.push(trackPos(nF, [0, 1, 2.4, 12, 12.6, T], [[0, 0.1, 0], [0, 0.1, 0], [0, 0, 0], [0, 0, 0], [0, 0.1, 0], [0, 0.1, 0]])); }
  const nL = node(nF, 'teher', [0, FY + 4.8, 0]); { const b = new Batch('teher'); const m = mat('#e8952a', { r: 0.5 }); b.cyl(0.16, 0.16, 1.7, m, 0, 1.55, 0, [0, 0, 0], 12); b.mesh(new THREE.ConeGeometry(0.42, 0.8, 16), m, [0, 0.4, 0], [Math.PI, 0, 0]); b.build(nL);
    nL.scale.set(1, 0.3, 1); tracks.push(trackScale(nL, [0, 0.8, 2.4, 12, 12.6, T], [[1, 0.3, 1], [1, 0.3, 1], S1, S1, [1, 0.3, 1], [1, 0.3, 1]])); }
  // izobár-héjak a nyitott negyedben: a külső héj csak a két metszetsík mellett, a belsők egyre szélesebben
  const P = LV.map(([L]) => profile(L)), n = LV.length, anchors = [];
  LV.forEach(([L, col], i) => { const g = node(root, 'izobar', [0, FY, 0]); const b = new Batch('izo'); const m = mat(col, { r: 0.7 }); const pts = P[i], w = (i + 1) / n * Math.PI / 4;
    const lp = pts.slice().reverse().map(p => new THREE.Vector2(Math.max(p[0], 0.001), p[1])); // alulról felfelé: kifelé néző normálisok
    const sh = (mir) => { const s = new THREE.Shape(); s.moveTo(0, 0); pts.forEach(p => s.lineTo(mir ? -p[0] : p[0], p[1])); s.closePath(); return new THREE.ShapeGeometry(s); };
    const top = (f0, f1) => { const s = new THREE.Shape(); s.moveTo(0, 0); for (let j = 0; j <= 8; j++) { const f = f0 + (f1 - f0) * j / 8; s.lineTo(a * Math.sin(f), -a * Math.cos(f)); } s.closePath(); const q = new THREE.ShapeGeometry(s); q.rotateX(-Math.PI / 2); return q; }; // felső zárólap (az alapsíkban; az alap takarja)
    if (i === n - 1) { b.add(new THREE.LatheGeometry(lp, 30, 0, Math.PI / 2), m); }
    else { b.add(new THREE.LatheGeometry(lp, 10, 0, w), m); b.add(new THREE.LatheGeometry(lp, 10, Math.PI / 2 - w, w), m);
      const c1 = sh(true); c1.rotateY(w + Math.PI / 2); b.add(c1, m); const c2 = sh(false); c2.rotateY(Math.PI / 2 - w - Math.PI / 2); b.add(c2, m); }
    b.build(g); g.scale.set(...S0); const t0 = 2.6 + (n - 1 - i) * 1.5; tracks.push(trackScale(g, [0, t0, t0 + 1.3, 12, 12.6, T], [S0, S0, S1, S1, S0, S0]));
    const mid = pts[Math.floor(pts.length * 0.62)]; anchors.push([mid[0], FY + mid[1]]); });
  plaque(root, lang === 'hu' ? 'Feszültséghagyma' : 'Pressure bulb', -H + 0.3, -DEP - 0.62, H + 0.02, K, { h: 0.02, color: '#e866c8' });
  const clips = [new THREE.AnimationClip('hagyma', T, tracks)];
  poseAt(root, clips[0], 11);
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu', o = { h: 0.034, ry: Math.PI / 4 }, dec = (v) => String(v).replace('.', hu ? ',' : '.');
    LV.forEach(([L, col], i) => { const [r, y] = anchors[i], right = i % 2 === 0; const an = i === n - 1 ? [r * 0.7, y, r * 0.7] : (right ? [r, y, 0.03] : [0.03, y, r]); const yl = [-4.7, -4.0, -3.3, -2.5, -1.8][i]; label(G, dec(L) + ' q', an, right ? [H + 0.7, yl, 0.5] : [0.5, yl, H + 0.7], col, K, o); });
    label(G, hu ? 'q · talpfeszültség' : 'q · contact pressure', [0.9, FY, 0.9], [H + 0.6, 0.9, 1.2], C.concreteDark, K, o);
    label(G, hu ? 'pilléralap · 2 × 2 m' : 'pad footing · 2 × 2 m', [0.6, FY + 0.5, 1.0], [1.0, 2.4, H + 0.6], C.concreteDark, K, o);
    return G; };
  return { root, labels, clips, k: K, posterView: [45, 22], posterT: 11, labelT: 11 };
}
