// A pisai ferde torony (5. előadás) – a torony felépül (1173–1372), közben megdől dél felé, 1990-re 5,5°, a stabilizálás után kb. 3,97°.
// Rétegek (vázlat az irodalom – Burland, Jamiolkowski, Viggiani – alapján): kb. 3 m feltöltés; homokos iszap és homok, amely dél felé elvékonyodik;
// alatta a puha agyag, amely a déli (dőlés felőli) oldalon vastagabb; kb. 21 m alatt merevebb agyag, homok, agyag. Észak: −x, dél: +x.
import { THREE, Batch, mat, C, label, node, person, tree, trackQuat, trackScale, poseAt } from '../lib/common.js';
import { at, car2, dumper, pileRig, towerCrane, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'pisa-makett';
const K = 1 / 130, T = 17;
const S0 = [0.001, 0.001, 0.001], S0y = [1, 0.02, 1], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'pisa'; const tracks = [];
  const X = 30, Z = 14, YB = -31;
  const ext = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 2 * Z, bevelEnabled: false }); g.translate(0, 0, -Z); return g; };
  const cl = (x) => -10.5 + 5 * (x + X) / (2 * X) + 0.4 * Math.sin((x + X) / (2 * X) * Math.PI); // a puha agyag teteje: északon −10,5 m, délen −5,5 m
  const line = Array.from({ length: 13 }, (_, i) => { const x = -X + 2 * X * i / 12; return [x, cl(x)]; });
  const cMG = '#8f8172', cUP = '#d9c28c', cCL = '#7f8f9c', cST = '#5f6e7a', cSA = '#cdb276', cLC = '#6b7884';
  const B = new Batch('talaj');
  B.add(ext([[-X, 0], [X, 0], [X, -3], [-X, -3]]), mat(cMG));
  B.add(ext([[-X, -3], [X, -3], ...line.slice().reverse()]), mat(cUP));
  B.add(ext([...line, [X, -21], [-X, -21]]), mat(cCL));
  B.add(ext([[-X, -21], [X, -21], [X, -25.5], [-X, -25.5]]), mat(cST));
  B.add(ext([[-X, -25.5], [X, -25.5], [X, -27.5], [-X, -27.5]]), mat(cSA));
  B.add(ext([[-X, -27.5], [X, -27.5], [X, YB], [-X, YB]]), mat(cLC));
  B.box(2 * X, 0.25, 2 * Z, mat(C.grass), 0, 0.125, 0); B.cyl(13, 13, 0.12, mat('#e6dfcf'), 0, 0.31, 0, [0, 0, 0], 40);
  B.box(2 * X, 0.16, 0.12, mat(C.water), 0, -1.6, Z + 0.07); // talajvíz a metszeten
  B.boxB(2 * X + 3, 0.9, 2 * Z + 3, mat(C.base), 0, YB - 0.9, 0);
  for (const [x, z, h] of [[-25, -10, 9], [-21, -11, 7], [24, -10, 10], [26, 8, 8], [-26, 9, 8], [18, -11.5, 7.5], [-15, -11, 8]]) tree2(B, x, z, h, 0.25, { c1: '#4f8a45', c2: '#6aa352' });
  for (const [x, z] of [[-11, 10.5], [11, 10.5], [-18, 4], [19, 3]]) lamp(B, x, z, 0.25, 4.2);
  for (const [x, z, r] of [[-14, 9, 0.5], [-12.5, 9.6, 2.2], [15, 8, 3.6], [16.5, 9, 1.2], [3, 11.5, 0.2]]) person(B, x, z, r, { y: 0.3, vest: ['#3a6fb5', '#d85a4a', '#e0b23c', '#4d9a5c', '#8a5bb0'][Math.round(x + 20) % 5], helmet: '#5a4a3a' });
  B.build(root);
  // az eredeti függőleges tengely (piros pálca)
  { const b = new Batch('fuggo'); b.cyl(0.14, 0.14, 62, mat('#d4372a', { r: 0.6 }), -9.2, 31, 0, [0, 0, 0], 8); b.build(root); }
  // ---- torony: az alaptest középpontja körül dől dél (+x) felé; a szintek egymás után épülnek fel ----
  const nT = node(root, 'torony', [0, -3, 0]); const marble = mat('#efe9dc', { r: 0.7 }), col = mat('#f7f3e9', { r: 0.6 }), shade = mat('#cfc6b3'), dark = mat('#8c8474');
  { const b = new Batch('alap'); b.cyl(9.8, 9.8, 3.0, mat('#d8d0bf'), 0, 1.5, 0, [0, 0, 0], 40); b.build(nT); }
  const tiers = []; let y = 3.3;
  const ring = (b, n, r, y0, h, rc) => { for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * Math.PI * 2; b.cyl(rc, rc, h, col, Math.sin(a) * r, y0 + h / 2, Math.cos(a) * r, [0, 0, 0], 8); } };
  for (let i = 0; i < 8; i++) { const g = node(nT, 'szint', [0, y, 0]); const b = new Batch('szint'); const h = i === 0 ? 9.5 : i === 7 ? 8.6 : 6.1;
    if (i === 0) { b.cyl(7.75, 7.75, h, marble, 0, h / 2, 0, [0, 0, 0], 40); ring(b, 15, 7.75, 0, h - 0.6, 0.42); for (let j = 0; j < 15; j++) { const a = j / 15 * Math.PI * 2; b.mesh(new THREE.BoxGeometry(1.5, 3.0, 0.3), shade, [Math.sin(a) * 7.72, 4.2, Math.cos(a) * 7.72], [0, a, 0]); } b.mesh(new THREE.BoxGeometry(1.6, 3.6, 0.5), dark, [0, 1.8, 7.7]); }
    else if (i < 7) { b.cyl(6.3, 6.3, h, marble, 0, h / 2, 0, [0, 0, 0], 36); ring(b, 30, 7.35, 0.3, h - 0.9, 0.24); for (let j = 0; j < 10; j++) { const a = j / 10 * Math.PI * 2; b.mesh(new THREE.BoxGeometry(0.9, 2.2, 0.3), dark, [Math.sin(a) * 6.25, 2.4, Math.cos(a) * 6.25], [0, a, 0]); } b.cyl(7.9, 7.9, 0.28, shade, 0, 0.14, 0, [0, 0, 0], 40); }
    else { b.cyl(7.9, 7.9, 0.3, shade, 0, 0.15, 0, [0, 0, 0], 40); b.cyl(5.3, 5.3, h - 0.6, marble, 0, 0.3 + (h - 0.6) / 2, 0, [0, 0, 0], 32); ring(b, 12, 5.35, 0.3, h - 1.4, 0.3);
      for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2; b.mesh(new THREE.BoxGeometry(1.5, 3.4, 0.3), dark, [Math.sin(a) * 5.25, 3.4, Math.cos(a) * 5.25], [0, a, 0]); }
      b.cyl(5.7, 5.7, 0.4, shade, 0, h - 0.2, 0, [0, 0, 0], 32); b.cyl(0.08, 0.08, 4, dark, 0, h + 2, 0, [0, 0, 0], 6); b.mesh(new THREE.BoxGeometry(1.8, 1.0, 0.06), mat('#d4372a'), [0.95, h + 3.4, 0]); }
    b.build(g); g.scale.set(...S0); tiers.push(g); y += h; }
  // idővonal: 0–3 s az első három szint (1173–78) · 3–4,5 s szünet · 4,5–8 s a 7. szintig (1272–78) · 8,5–9,5 s harangház (1360–72) · 9,5–12,5 s lassú dőlés (1990: 5,5°) · 13–14,5 s stabilizálás (3,97°)
  const tOn = [0.2, 1.1, 2.0, 4.6, 5.5, 6.4, 7.2, 8.6];
  tiers.forEach((g, i) => tracks.push(trackScale(g, [0, tOn[i], tOn[i] + 0.02, tOn[i] + 0.8, 16.4, 16.8, T], [S0, S0, S0y, S1, S1, S0, S0])));
  const d = Math.PI / 180, tk = [0, 2, 3, 4.5, 8, 9.5, 12.5, 13, 14.5, 16.4, 16.8, T], th = [0, 0, 0.25, 0.4, 1.1, 1.6, 5.5, 5.5, 3.97, 3.97, 0, 0];
  tracks.push(trackQuat(nT, tk, th.map(a => [0, 0, -a * d])));
  nT.rotation.z = -3.97 * d; tiers.forEach(g => g.scale.set(1, 1, 1)); // nyugalmi állapot (USDZ): a mai torony
  plaque(root, lang === 'hu' ? 'A pisai ferde torony' : 'The Leaning Tower of Pisa', -X + 1.5, YB + 0.5, Z + 0.06, K, { h: 0.02, color: '#e866c8' });
  const clips = [new THREE.AnimationClip('pisa', T, tracks)];
  poseAt(root, clips[0], 15.5);
  // feliratok: a rétegek neve a metszet jobb oldalán, egymás alatt (a bal oldal szabad marad), a hosszú nevek két sorban
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu', zf = Z + 0.1, zl = Z + 4, o = { h: 0.032 }, xr = X + 15;
    label(G, hu ? 'talajvíz' : 'groundwater', [26, -1.6, zf], [xr - 3, 3.2, zl], C.water, K, o);
    label(G, hu ? 'homokos iszap,\nhomok' : 'sandy silt,\nsand', [27.5, -4.4, zf], [xr, -5.6, zl], cUP, K, o);
    label(G, hu ? 'puha, egyenlőtlen\nvastagságú agyagréteg' : 'soft clay layer\nof uneven thickness', [27, -13, zf], [xr + 1.5, -15.5, zl], cCL, K, o);
    label(G, hu ? 'merevebb agyag,\nhomok, agyag' : 'stiffer clay,\nsand, clay', [27, -26.4, zf], [xr, -29, zl], cSA, K, o);
    label(G, hu ? 'feltöltés' : 'made ground', [-25, -1.5, zf], [-39, -7, zl], cMG, K, o);
    label(G, hu ? 'É' : 'N', null, [-X + 1, 8.5, zl - 3], '#f2f4f6', K, o); label(G, hu ? 'D' : 'S', null, [X - 5, 8.5, zl - 3], '#f2f4f6', K, o);
    label(G, hu ? 'ma kb. 3,97°\na csúcs 3,9 m-rel tér el' : 'today approx. 3.97°\ntop 3.9 m off', [2.2, 55, 0], [21, 57, 0], '#d4372a', K, o);
    label(G, hu ? 'az eredeti\nfüggőleges' : 'the original\nvertical', [-9.2, 40, 0], [-27, 42, 0], '#d4372a', K, o);
    return G; };
  return { root, labels, clips, k: K, posterView: [22, 12], posterT: 15.5, labelT: 15.5 };
}
