// Földrengésvizsgálat rázóasztalon (Szerkezet-építőmérnöki): szerkezetvizsgáló laborcsarnok reakciófallal és erőpadlóval; a rázóasztalon
// két azonos, ötszintes keretmodell áll: a bal oldali hagyományos (mereven lekötött), a jobb oldali szeizmikus szigetelésű (gumisarukon).
// Animáció (10 s): a hidraulikus munkahenger rázza az asztalt; a hagyományos modell szintjei egyre nagyobbat lengenek, a szigetelt modell
// alig mozdul. A csarnok általános szemléltető labor (nem egy konkrét létesítmény mása); a mozgás felnagyított.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale, person } from '../lib/common.js';
import { plaque } from '../lib/kit2.js';
export const FILE = 'foldrenges-razoasztal';
const K = 1 / 28;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'razoasztal';
  const B = new Batch('labor'), tracks = [], T = 10, DT = 0.1;
  const conc = mat('#cfcbc2', { r: 0.9 }), concD = mat('#aaa59b', { r: 0.9 }), steel = mat('#5d6670', { m: 0.5, r: 0.45 }), yel = mat('#e9b21f', { r: 0.5, m: 0.2 }), dark = mat('#23272b'), org = mat(SPEC.tart, { r: 0.5 }), blue = mat('#2f6db5', { m: 0.3, r: 0.5 });
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -11, X1 = 11, Z0 = -8, Z1 = 8;
  // ---- csarnok: erőpadló rögzítőfuratokkal, L alakú reakciófal, akna az asztal körül, daru, korlát ----
  box(B, concD, X0, X1, -1.6, -0.02, Z0, Z1); box(B, conc, X0, X1, -0.02, 0, Z0, Z1); for (let x = X0 + 1; x < X1; x += 1) for (let z = Z0 + 1; z < Z1; z += 1) if (Math.abs(x + 1) > 5 || Math.abs(z) > 3.2) B.cyl(0.07, 0.07, 0.01, dark, x, 0.006, z, [0, 0, 0], 6);
  box(B, conc, X0, X1, 0, 7.5, Z0, Z0 + 1.2); box(B, conc, X0, X0 + 1.2, 0, 7.5, Z0 + 1.2, 0.5); for (let x = X0 + 2; x < X1; x += 1) for (let y = 1; y < 7.5; y += 1) B.cyl(0.07, 0.07, 0.02, dark, x, y, Z0 + 1.2, [Math.PI / 2, 0, 0], 6);
  for (let z = Z0 + 2; z < 0.4; z += 1) for (let y = 1; y < 7.5; y += 1) B.cyl(0.07, 0.07, 0.02, dark, X0 + 1.2, y, z, [0, 0, Math.PI / 2], 6);
  box(B, dark, -6.6, 4.6, 0.001, 0.012, -3.4, 3.4); box(B, yel, X0 + 0.4, X1 - 0.4, 8.6, 9.3, -1, -0.3); box(B, yel, X0 + 0.4, X1 - 0.4, 8.6, 9.3, 0.3, 1); for (const x of [X0 + 0.6, X1 - 0.6]) box(B, steel, x - 0.25, x + 0.25, 0, 8.6, -1.2, 1.2); box(B, dark, 2.4, 3.6, 8.0, 8.9, -0.6, 0.6); B.rod([3, 8.0, 0], [3, 6.9, 0], 0.03, dark, 4); box(B, yel, 2.8, 3.2, 6.6, 6.9, -0.15, 0.15);
  for (let x = -7.5; x <= 5.5; x += 1.3) { B.cyl(0.03, 0.03, 1.1, yel, x, 0.55, 4.6, [0, 0, 0], 5); } box(B, yel, -7.5, 5.5, 1.05, 1.1, 4.57, 4.63); box(B, yel, -7.5, 5.5, 0.55, 0.59, 4.58, 4.62);
  // reakcióblokk és hidraulikus munkahenger (a dugattyúrúd az asztallal mozog), tápegység, tömlők
  box(B, conc, -9.4, -7.4, 0, 1.8, -1.6, 1.6); for (const z of [-1, 1]) B.cyl(0.26, 0.26, 2.0, org, -6.4, 0.75, z, [0, 0, Math.PI / 2], 14);
  box(B, blue, 7.2, 9.4, 0, 1.5, -6.2, -4.4); box(B, dark, 7.4, 9.2, 1.5, 1.7, -6, -4.6); B.cyl(0.35, 0.35, 1.0, steel, 8.3, 2.2, -5.3, [0, 0, 0], 12); for (const z of [-1, 1]) { B.rod([7.2, 0.5, -5.3], [-5.5, 0.12, z * 2.9], 0.05, dark, 5); B.rod([-5.5, 0.12, z * 2.9], [-6.4, 0.75, z], 0.05, dark, 5); }
  // vezérlőpult monitorokkal, kezelő; kamera állványon; két mérnök
  box(B, mat('#e9ecef'), 6.4, 9.6, 0, 0.9, 4.6, 5.8); for (const [x, c] of [[7.0, '#3fd06a'], [8.0, '#f5c518'], [9.0, '#2f9be8']]) { B.box(0.85, 0.55, 0.06, dark, x, 1.35, 5.0, [-0.15, 0, 0]); B.box(0.7, 0.05, 0.065, mat(c, { em: c, ei: 0.9 }), x, 1.36, 5.03, [-0.15, 0, 0.12]); }
  person(B, 8, 6.5, Math.PI, { y: 0, vest: '#ff7a1a' }); person(B, 5.2, 6.2, 2.6, { y: 0, tablet: true, vest: '#c6f432' }); person(B, -8.6, 5.6, 0.9, { y: 0, vest: '#3a5f8a', shirt: '#3a5f8a' });
  for (const s of [-0.35, 0.35]) B.rod([-3.6 + s, 0, 6.3], [-3.6, 1.5, 6], 0.03, dark, 4); B.rod([-3.6, 0, 5.6], [-3.6, 1.5, 6], 0.03, dark, 4); box(B, dark, -3.8, -3.4, 1.5, 1.75, 5.8, 6.2); B.cyl(0.08, 0.1, 0.2, steel, -3.6, 1.62, 5.7, [Math.PI / 2, 0, 0], 8);
  B.build(root);
  // ---- a mozgás: gerjesztés (felfutó, majd lecsengő szinuszok) ----
  const env = (t) => Math.min(1, t / 2) * (t > 8 ? Math.max(0, (T - t) / 2) : 1), tab = (t) => 0.22 * env(t) * Math.sin(t * 2 * Math.PI / 0.9), tt = []; for (let t = 0; t <= T + 1e-6; t += DT) tt.push(+t.toFixed(2));
  const table = node(root, 'asztal', [0, 0, 0]), tb = new Batch('asztal'); box(tb, steel, -5.4, 3.4, 0.25, 0.75, -2.8, 2.8); box(tb, mat('#8a939c', { m: 0.5, r: 0.4 }), -5.5, 3.5, 0.75, 0.85, -2.9, 2.9); for (const z of [-1, 1]) tb.cyl(0.12, 0.12, 1.6, mat('#d9dde0', { m: 0.8, r: 0.25 }), -6.1, 0.75, z, [0, 0, Math.PI / 2], 10);
  for (const x of [-4.6, -1, 2.6]) for (const z of [-2.3, 2.3]) box(tb, dark, x - 0.3, x + 0.3, 0.02, 0.25, z - 0.3, z + 0.3); tb.build(table); tracks.push(trackPos(table, tt, tt.map(t => [tab(t), 0, 0])));
  // ---- a két keretmodell: szintenként külön csomópont (nyírt épület) ----
  const frame = (x0, iso) => { const nF = 5, fh = 0.95, w = 2.6, d = 2.2, colr = iso ? '#2f9be8' : SPEC.tart; let parent = table, base = 0.85;
    if (iso) { const bn = node(table, 'szigetelt', [x0, 0.85, 0]), b = new Batch('saru'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { b.cyl(0.2, 0.2, 0.22, dark, sx * w / 2, 0.11, sz * d / 2, [0, 0, 0], 12); b.cyl(0.24, 0.24, 0.04, steel, sx * w / 2, 0.02, sz * d / 2, [0, 0, 0], 12); b.cyl(0.24, 0.24, 0.04, steel, sx * w / 2, 0.2, sz * d / 2, [0, 0, 0], 12); }
      box(b, concD, -w / 2 - 0.3, w / 2 + 0.3, 0.22, 0.4, -d / 2 - 0.3, d / 2 + 0.3); b.build(bn); tracks.push(trackPos(bn, tt, tt.map(t => [x0 - 0.82 * tab(t), 0.85, 0]))); parent = bn; base = 0.4; }
    else { const bn = node(table, 'merev', [x0, 0.85, 0]), b = new Batch('talp'); box(b, concD, -w / 2 - 0.3, w / 2 + 0.3, 0, 0.18, -d / 2 - 0.3, d / 2 + 0.3); for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(0.05, 0.05, 0.08, dark, sx * (w / 2 + 0.15), 0.22, sz * (d / 2 + 0.15), [0, 0, 0], 6); b.build(bn); parent = bn; base = 0.18; }
    for (let f = 0; f < nF; f++) { const n = node(parent, 'szint', [0, f ? fh : base, 0]), b = new Batch('szint'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(b, mat('#d9dde0', { m: 0.6, r: 0.35 }), sx * w / 2 - 0.05, sx * w / 2 + 0.05, 0, fh - 0.1, sz * d / 2 - 0.05, sz * d / 2 + 0.05);
      box(b, mat(colr, { r: 0.6 }), -w / 2 - 0.12, w / 2 + 0.12, fh - 0.1, fh, -d / 2 - 0.12, d / 2 + 0.12); box(b, mat('#f2f3f1'), -0.5, 0.5, fh, fh + 0.16, -0.4, 0.4); box(b, mat('#e23b2c'), w / 2 + 0.12, w / 2 + 0.2, fh - 0.09, fh - 0.01, -0.06, 0.06); b.build(n);
      const amp = iso ? 0.006 : 0.05 + f * 0.012, lag = 0.22 * (f + 1); if (f) tracks.push(trackPos(n, tt, tt.map(t => [amp / 0.22 * 1.1 * tab(Math.max(0, t - lag)) * (iso ? 1 : 1.6), fh, 0]))); else if (!iso) tracks.push(trackPos(n, tt, tt.map(t => [0.3 * tab(Math.max(0, t - 0.15)), base, 0]))); parent = n; } };
  frame(-3.1, false); frame(1.3, true);
  plaque(root, hu ? 'Földrengésvizsgálat rázóasztalon · szerkezetvizsgáló labor' : 'Shake-table earthquake test · structures laboratory', X0 + 0.3, -1.45, Z1 + 0.02, K, { h: 0.019 });
  const clips = [new THREE.AnimationClip('razas', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Hagyományos modell:\nnagy kilengés, nagy szinteltolódás' : 'Conventional model:\nlarge sway and storey drift', [-3.1, 5.6, 1.1], [-9.5, 8.6, 4], SPEC.tart, K);
    label(G, h ? 'Szeizmikus szigetelés: gumisarukon\naz épület alig mozdul' : 'Base isolation: on rubber bearings\nthe building hardly moves', [2.6, 1.0, 1.1], [3.2, 6.8, 5], '#2f9be8', K);
    label(G, h ? 'Rázóasztal' : 'Shake table', [-1, 0.8, 2.8], [-2.5, -0.9, Z1 + 1.5], '#8a939c', K);
    label(G, h ? 'Hidraulikus munkahenger' : 'Hydraulic actuator', [-6.4, 1.0, 1], [-10.8, 3.4, 5], SPEC.tart, K);
    label(G, h ? 'Reakciófal és erőpadló' : 'Reaction wall and strong floor', [6, 6, Z0 + 1.2], [5, 9.8, Z0 + 2], '#cfcbc2', K);
    label(G, h ? 'Mérés és vezérlés' : 'Measurement and control', [8, 1.7, 5], [7, 3.6, Z1 + 1], '#3fd06a', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 22], posterT: 4.3, labelT: 4.3 };
}
