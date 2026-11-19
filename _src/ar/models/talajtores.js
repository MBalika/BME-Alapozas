// Talajtörés a sávalap alatt (3. előadás) – általános nyírási törés homokban (φ = 30°), egyoldali Prandtl-mechanizmus merev tömbökkel:
// a teher nő → kirajzolódik a csúszólap → az alap az aktív ékkel lesüllyed és megdől, a radiális zóna elfordul, a passzív ék kitolódik, a felszín felpúposodik.
import { THREE, Batch, mat, C, label, node, person, trackPos, trackQuat, trackScale, poseAt } from '../lib/common.js';
export const FILE = 'talajtores';
const K = 1 / 40, T = 13;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'talajtores'; const tracks = [];
  const Z = 4, X0 = -5, X1 = 13.2, YB = -5.2, FY = -0.8, PHI = 30 * Math.PI / 180;
  const ext = (pts, z0 = -Z, z1 = Z) => { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return g; };
  // a mechanizmus pontjai (a metszet síkjában)
  const A = [-1, FY], Bp = [1, FY], P = [0, FY - Math.tan(Math.PI / 3)], r0 = 2;
  const sp = (th) => { const a = (240 + th) * Math.PI / 180, r = r0 * Math.exp(th * Math.PI / 180 * Math.tan(PHI)); return [Bp[0] + r * Math.cos(a), Bp[1] + r * Math.sin(a)]; };
  const Q = sp(90), E0 = [Q[0] + (0 - Q[1]) / Math.tan(Math.PI / 6), 0];
  const spiral = (a, b, n = 8) => Array.from({ length: n + 1 }, (_, i) => sp(a + (b - a) * i / n));
  const SAND = '#e4c88c', SANDD = '#d2b376', cA = '#9ccb5a', cR = '#f0a030', cP = '#e98cb2';
  // álló talajtömb (a mechanizmus kivágva), gyep, talapzat
  const B = new Batch('tomb');
  B.add(ext([[X0, 0], [A[0], 0], A, P, ...spiral(0, 90, 18).slice(1), E0, [X1, 0], [X1, YB], [X0, YB]]), mat(SAND));
  B.add(ext([[X0, YB], [X1, YB], [X1, YB - 0.6], [X0, YB - 0.6]]), mat(SANDD));
  B.add(ext([[X0, 0.12], [A[0], 0.12], [A[0], 0], [X0, 0]]), mat(C.grass)); B.add(ext([[E0[0], 0.12], [X1, 0.12], [X1, 0], [E0[0], 0]]), mat(C.grass));
  B.boxB(X1 - X0 + 1.2, 0.35, 2 * Z + 1.2, mat(C.base), (X0 + X1) / 2, YB - 0.95, 0);
  person(B, -3.4, 1.5, Math.PI / 2, { y: 0.12 }); person(B, 12.2, -1.2, -Math.PI / 2, { y: 0.12, vest: '#d8e04a' });
  B.build(root);
  // ---- mozgó tömbök ----
  const ease = (u) => u * u * (3 - 2 * u), KEYS = [0, 5, 5.8, 6.6, 7.4, 8.2, 9, 12, 12.6, T], U = [0, 0, 0.1, 0.35, 0.65, 0.88, 1, 1, 0, 0];
  const al = 9 * Math.PI / 180, be = 7 * Math.PI / 180, dp = 0.85; // az alap dőlése, a radiális zóna elfordulása, a passzív ék eltolódása
  // 1) alap + fal + aktív ék: elfordul az A pont körül (a törés oldala felé dől és süllyed)
  const nF = node(root, 'alap', [A[0], A[1], 0]); { const b = new Batch('alap'); const L = (p) => [p[0] - A[0], p[1] - A[1]];
    b.add(ext([L(A), L(Bp), L(P)]), mat(cA));
    b.add(ext([L([-1, FY]), L([1, FY]), L([1, FY + 0.5]), L([-1, FY + 0.5])]), mat(C.concrete)); b.add(ext([L([-0.22, FY + 0.5]), L([0.22, FY + 0.5]), L([0.22, 3.4]), L([-0.22, 3.4])]), mat('#f1ead9'));
    b.add(ext([L([-1, FY + 0.5]), L([-0.22, FY + 0.5]), L([-0.22, 0]), L([-1, 0])]), mat(SANDD)); b.add(ext([L([0.22, FY + 0.5]), L([1, FY + 0.5]), L([1, 0]), L([0.22, 0])]), mat(SANDD));
    b.add(ext([L([-1, 0]), L([-0.22, 0]), L([-0.22, 0.12]), L([-1, 0.12])]), mat(C.grass)); b.add(ext([L([0.22, 0]), L([1, 0]), L([1, 0.12]), L([0.22, 0.12])]), mat(C.grass));
    b.build(nF); tracks.push(trackQuat(nF, KEYS, U.map(u => [0, 0, -al * ease(u)]))); }
  const bDisp = (u) => { const a = -al * ease(u), dx = Bp[0] - A[0]; return [dx * Math.cos(a) - dx, dx * Math.sin(a)]; }; // a B sarok elmozdulása
  // 2) radiális zóna: három körcikk, a B sarokkal együtt mozdul és elfordul
  for (let i = 0; i < 3; i++) { const n = node(root, 'radial', [Bp[0], Bp[1], 0]); const b = new Batch('rad'); const L = (p) => [p[0] - Bp[0], p[1] - Bp[1]];
    b.add(ext([[0, 0], ...spiral(i * 30, i * 30 + 30, 6).map(L)]), mat(i === 1 ? '#f4b24a' : cR)); b.build(n);
    tracks.push(trackPos(n, KEYS, U.map(u => { const d = bDisp(u), w = 1 - i * 0.28; return [Bp[0] + d[0] * w + 0.18 * i * ease(u), Bp[1] + d[1] * w + 0.1 * i * ease(u), 0]; })));
    tracks.push(trackQuat(n, KEYS, U.map(u => [0, 0, be * ease(u) * (1 - i * 0.22)]))); }
  // 3) passzív ék: a 30°-os csúszólapon felfelé-kifelé tolódik (a felszín felpúposodik), tetején gyeppel
  const nP = node(root, 'passziv'); { const b = new Batch('passz'); b.add(ext([[Bp[0], 0], E0, Q, Bp]), mat(cP)); b.add(ext([[Bp[0], 0.12], [E0[0], 0.12], E0, [Bp[0], 0]]), mat(C.grass)); b.build(nP);
    tracks.push(trackPos(nP, KEYS, U.map(u => [dp * Math.cos(Math.PI / 6) * ease(u), dp * Math.sin(Math.PI / 6) * ease(u), 0]))); }
  // csúszólap (piros sáv a metszet homlokán): a törés előtt rajzolódik ki
  const nS = node(root, 'csuszolap'); { const b = new Batch('cs'); const pts = [A, P, ...spiral(0, 90, 18).slice(1), E0];
    for (let i = 0; i < pts.length - 1; i++) b.rod([pts[i][0], pts[i][1], Z + 0.03], [pts[i + 1][0], pts[i + 1][1], Z + 0.03], 0.07, mat('#d4372a', { r: 0.6 }), 6);
    b.build(nS); nS.scale.set(...S0); tracks.push(trackScale(nS, [0, 3.6, 4.6, 12, 12.6, T], [S0, S0, S1, S1, S0, S0])); }
  // teher: három nyíl a falon, a törés előtt megnő
  const nL = node(nF, 'teher', [1, 3.4 - FY, 0]); { const b = new Batch('teher'); const m = mat('#e8952a', { r: 0.5 });
    for (const z of [-2.6, 0, 2.6]) { b.cyl(0.11, 0.11, 1.5, m, 0, 1.25, z, [0, 0, 0], 10); b.mesh(new THREE.ConeGeometry(0.3, 0.6, 14), m, [0, 0.3, z], [Math.PI, 0, 0]); }
    b.build(nL); nL.scale.set(1, 0.35, 1); tracks.push(trackScale(nL, [0, 1, 3.8, 12, 12.6, T], [[1, 0.35, 1], [1, 0.35, 1], [1, 1.5, 1], [1, 1.5, 1], [1, 0.35, 1], [1, 0.35, 1]])); }
  const clips = [new THREE.AnimationClip('talajtores', T, tracks)];
  poseAt(root, clips[0], 9.5);
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu', zf = Z + 0.05, zl = Z + 1.6;
    label(G, hu ? 'aktív ék' : 'active wedge', [0.2, -2.0, zf], [-4.4, -3.4, zl], cA, K, { h: 0.034 });
    label(G, hu ? 'radiális nyírási zóna' : 'radial shear zone', [2.6, -2.9, zf], [0.4, -4.9, zl], cR, K, { h: 0.034 });
    label(G, hu ? 'passzív zóna' : 'passive zone', [6.4, -1.2, zf], [7.6, -3.9, zl], cP, K, { h: 0.034 });
    label(G, hu ? 'csúszólap' : 'slip surface', [sp(60)[0] + 0.3, sp(60)[1] + 0.1, zf], [3.8, -6.2, zl + 0.3], '#d4372a', K, { h: 0.034 });
    label(G, hu ? 'felpúposodás' : 'heave', [7.2, 0.55, 0], [8.4, 3.0, 0], C.grass, K, { h: 0.034 });
    label(G, hu ? 'sávalap · B = 2,0 m' : 'strip footing · B = 2.0 m', [-0.6, FY + 0.25, zf], [-5.2, 1.6, zl], C.concreteDark, K, { h: 0.034 });
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 20], posterT: 9.5, labelT: 9.5 };
}
