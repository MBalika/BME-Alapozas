// Közös segédek a modellekhez (three.js). Minden méret valós méterben; a modell végén egy skála (k) teszi asztali méretűvé.
// A geometriákat anyagonként összefűzzük (kevés csomópont → gyors AR), az animált részek külön csomópontok maradnak.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export { THREE };
export const SPEC = { // a szakirányok színei (a kari videóval egyezően)
  tart: '#ff8a3d', geo: '#b8e04a', eti: '#b48cff', kozl: '#ffd23f', viz: '#4f8dff', geoinf: '#3fd0e8', foldr: '#5ccf7a',
};
export const C = { // alapszínek: makettszerű, világos
  grass: '#8fbf6a', grassDark: '#6fa452', soilTop: '#9a7b58', fill: '#8a7562', gravel: '#c9b48c', sand: '#e0c98f', clay: '#8f7a68',
  clayDark: '#6f6153', rock: '#8c8a86', water: '#4f9fe0', waterDeep: '#2f78c4', concrete: '#d9d6cf', concreteDark: '#b9b5ad',
  steel: '#8e99a6', steelDark: '#5d6670', asphalt: '#4a4e55', white: '#f4f3ef', glass: '#a9c8de', glassDark: '#6f93ad', roof: '#cfcac0',
  brick: '#c97b5a', wood: '#b08455', rail: '#9aa3ab', ballast: '#a59d92', tree: '#5e9e4a', trunk: '#7a5a3c', red: '#e0523f',
  yellow: '#f4c430', dark: '#30353c', base: '#e9e6df', baseEdge: '#cfcac0',
};

const MATS = new Map();
export function mat(color, o = {}) { // gyorsítótárazott anyag
  const key = color + JSON.stringify(o);
  if (!MATS.has(key)) {
    const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: o.r ?? 0.82, metalness: o.m ?? 0, transparent: (o.op ?? 1) < 1, opacity: o.op ?? 1,
      emissive: o.em ? new THREE.Color(o.em) : new THREE.Color(0), emissiveIntensity: o.ei ?? (o.em ? 1 : 0), side: o.ds ? THREE.DoubleSide : THREE.FrontSide, depthWrite: (o.op ?? 1) < 1 ? !!o.dw : true });
    m.name = o.name || ('m_' + color.replace('#', '') + (o.op ? '_t' : '') + (o.em ? '_e' : ''));
    MATS.set(key, m);
  }
  return MATS.get(key);
}
export function resetMats() { MATS.clear(); }

// Kötegelő: geometriák gyűjtése anyagonként, a végén egy-egy összefűzött háló
export class Batch {
  constructor(name = 'batch') { this.name = name; this.parts = new Map(); }
  add(geom, material, matrix) { const g = geom.index ? geom.toNonIndexed() : geom.clone(); if (matrix) g.applyMatrix4(matrix);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!this.parts.has(material)) this.parts.set(material, []); this.parts.get(material).push(g); return this; }
  mesh(geom, material, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...scl)); return this.add(geom, material, m); }
  box(w, h, d, material, x = 0, y = 0, z = 0, rot = [0, 0, 0]) { return this.mesh(new THREE.BoxGeometry(w, h, d), material, [x, y, z], rot); }
  // box alsó lapjának közepe a megadott pontban
  boxB(w, h, d, material, x = 0, y = 0, z = 0, rot = [0, 0, 0]) { return this.box(w, h, d, material, x, y + h / 2, z, rot); }
  cyl(r1, r2, h, material, x = 0, y = 0, z = 0, rot = [0, 0, 0], seg = 16) { return this.mesh(new THREE.CylinderGeometry(r1, r2, h, seg), material, [x, y, z], rot); }
  // henger két pont között
  rod(a, b, r, material, seg = 8) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    return this.add(new THREE.CylinderGeometry(r, r, L, seg, 1, true), material, m); }
  build(parent) { const out = [];
    for (const [m, gs] of this.parts) { const g = mergeVertices(mergeGeometries(gs, false), 1e-5); g.computeBoundingBox(); g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, m); mesh.name = this.name + '_' + m.name; parent.add(mesh); out.push(mesh); }
    this.parts.clear(); return out; }
}

// Talajtömb rétegekkel: layers = [[vastagság, szín, név], …] felülről lefelé; a tömb teteje y=0-ban
export function soilBlock(B, x0, x1, z0, z1, layers, topColor = C.grass, topTh = 0.0) {
  let y = 0;
  for (const [t, col] of layers) { B.box(x1 - x0, t, z1 - z0, mat(col), (x0 + x1) / 2, y - t / 2, (z0 + z1) / 2); y -= t; }
  if (topTh > 0) B.box(x1 - x0, topTh, z1 - z0, mat(topColor), (x0 + x1) / 2, topTh / 2, (z0 + z1) / 2);
  return -y;
}

// Fa (makettszerű)
export function tree(B, x, z, h = 8, y = 0) { B.cyl(0.25, 0.35, h * 0.4, mat(C.trunk), x, y + h * 0.2, z, [0, 0, 0], 6);
  B.mesh(new THREE.IcosahedronGeometry(h * 0.33, 0), mat(C.tree), [x, y + h * 0.62, z]); }

// Egyszerű autó (külön csomópont, ha animált)
export function carGeom(color, len = 4.5, w = 1.9, h = 1.5) {
  const B = new Batch('car'); B.boxB(len, h * 0.55, w, mat(color), 0, 0.3, 0); B.boxB(len * 0.55, h * 0.45, w * 0.9, mat(C.glassDark), -len * 0.05, 0.3 + h * 0.55, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.cyl(0.33, 0.33, 0.25, mat(C.dark), sx * len * 0.32, 0.33, sz * w * 0.45, [Math.PI / 2, 0, 0], 10);
  const g = new THREE.Group(); B.build(g); return g;
}

// ---- feliratok (a modellbe égetett táblák, mint az Alapozás AR laborban) ----
let FONT_OK = false;
export async function fontsReady() { if (FONT_OK) return; await document.fonts.load('600 64px Inter'); await document.fonts.ready; FONT_OK = true; }
// a tábla a +z felé néz (szembe a fő nézőponttal), lent egy vékony vonal a jelölt pontig
export function label(group, text, anchor, at, color, k, o = {}) {
  const lines = String(text).split('\n'); const fs = 64, padX = 44, dot = 30, lh = 78;
  const cv = document.createElement('canvas'); const ctx = cv.getContext('2d'); ctx.font = `600 ${fs}px Inter`;
  const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
  const W = Math.ceil(padX + dot + 26 + tw + padX), H = lines.length === 1 ? 128 : 128 + (lines.length - 1) * lh;
  cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = 'rgb(21,27,33)'; const r = 40; c.beginPath(); c.moveTo(r, 0); c.arcTo(W, 0, W, H, r); c.arcTo(W, H, 0, H, r); c.arcTo(0, H, 0, 0, r); c.arcTo(0, 0, W, 0, r); c.closePath(); c.fill();
  c.fillStyle = color; c.beginPath(); c.arc(padX + dot / 2, H / 2, dot / 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#f2f4f6'; c.font = `600 ${fs}px Inter`; c.textBaseline = 'alphabetic';
  lines.forEach((l, i) => c.fillText(l, padX + dot + 26, (lines.length === 1 ? H / 2 + 21.5 : 82 + i * lh)));
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const hM = (o.h ?? 0.022) / k; const wM = hM * W / 128 * (lines.length === 1 ? 1 : 128 / H * (H / 128)); // a tábla magassága a modellben ~2,2 cm
  const pw = hM * W / 128, ph = hM * H / 128;
  const m = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.55, roughness: 1, metalness: 0, transparent: true, alphaTest: 0.5 }); m.name = 'lbl_' + group.children.length;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), m); plane.name = 'label_' + group.children.length;
  plane.position.set(at[0], at[1] + ph / 2, at[2]); if (o.ry) plane.rotation.y = o.ry; group.add(plane);
  { const bm = new THREE.MeshStandardMaterial({ color: new THREE.Color('#151b21'), roughness: 1 }); bm.name = 'lbl_back'; const g = new THREE.PlaneGeometry(pw * 0.985, ph * 0.9); g.rotateY(Math.PI); const back = new THREE.Mesh(g, bm); back.name = 'label_back_' + group.children.length;
    back.position.copy(plane.position); back.rotation.copy(plane.rotation); back.translateZ(-0.0004 / k); group.add(back); }
  if (anchor) { const lm = new THREE.MeshStandardMaterial({ color: new THREE.Color('#151b21'), roughness: 1 }); lm.name = 'lbl_line';
    const A = new THREE.Vector3(...anchor), Bv = new THREE.Vector3(at[0], at[1], at[2]); const d = Bv.clone().sub(A); const L = d.length();
    if (L > 1e-6) { const rr = 0.0012 / k; const ln = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, L, 6, 1, true), lm);
      ln.position.copy(A.clone().add(Bv).multiplyScalar(0.5)); ln.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); ln.name = 'label_line_' + group.children.length; group.add(ln);
      const dm = new THREE.Mesh(new THREE.SphereGeometry(rr * 3.2, 10, 8), mat(color, { name: 'lbl_dot' })); dm.position.copy(A); dm.name = 'label_dot_' + group.children.length; group.add(dm); } }
  return plane;
}

// ---- animáció ----
// kulcskockák: pos/rot/scale sávok egy névvel ellátott csomóponthoz
const inc = (times) => { const o = []; for (const t of times) o.push(o.length && t <= o[o.length - 1] ? o[o.length - 1] + 1e-3 : t); return o; }; // szigorúan növekvő idők
export function trackPos(node, times, values) { return new THREE.VectorKeyframeTrack(node.name + '.position', inc(times), values.flat()); }
export function trackQuat(node, times, eulers) { const v = []; for (const e of eulers) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...e)); v.push(q.x, q.y, q.z, q.w); } return new THREE.QuaternionKeyframeTrack(node.name + '.quaternion', inc(times), v); }
export function trackScale(node, times, values) { return new THREE.VectorKeyframeTrack(node.name + '.scale', inc(times), values.flat()); }
export function spinTrack(node, axis, period, n = 4, total = period) { // egyenletes forgás: n kulcs körönként, a teljes klipen át
  const times = [], v = []; const N = Math.round(n * total / period); for (let i = 0; i <= N; i++) { times.push(period * i / n); const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...axis), Math.PI * 2 * i / n); v.push(q.x, q.y, q.z, q.w); }
  return new THREE.QuaternionKeyframeTrack(node.name + '.quaternion', times, v); }

let UID = 0; export const uid = (p) => p + '_' + (++UID);
export function node(parent, name, pos = [0, 0, 0]) { const g = new THREE.Group(); g.name = uid(name); g.position.set(...pos); parent.add(g); return g; }

// Ember (≈1,8 m): munkavédelmi sisak, láthatósági mellény; rot: elforgatás a függőleges tengely körül; tablet: kezében tablet
export function person(B, x, z, rot = 0, o = {}) {
  const c = Math.cos(rot), s = Math.sin(rot), y0 = o.y || 0; const P = (dx, dy, dz) => [x + dx * c + dz * s, y0 + dy, z - dx * s + dz * c];
  const vest = mat(o.vest || '#ff7a1a'), pants = mat(o.pants || '#2f3a4a'), skin = mat('#e0b48f'), helm = mat(o.helmet || '#f4c430'), shirt = mat(o.shirt || '#3a5f8a');
  for (const sx of [-1, 1]) { B.mesh(new THREE.BoxGeometry(0.17, 0.86, 0.2), pants, P(sx * 0.1, 0.43, 0), [0, rot, 0]); B.mesh(new THREE.BoxGeometry(0.19, 0.1, 0.28), mat('#2a2a2a'), P(sx * 0.1, 0.05, 0.04), [0, rot, 0]); }
  B.mesh(new THREE.BoxGeometry(0.46, 0.62, 0.26), vest, P(0, 1.17, 0), [0, rot, 0]);
  B.mesh(new THREE.BoxGeometry(0.47, 0.06, 0.27), mat('#e8e8e0'), P(0, 1.05, 0), [0, rot, 0]);
  const fwd = o.tablet ? 0.5 : 0; for (const sx of [-1, 1]) B.mesh(new THREE.BoxGeometry(0.12, 0.58, 0.13), shirt, P(sx * 0.3, 1.18, fwd ? 0.1 : 0), [0, rot, 0]);
  B.mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), skin, P(0, 1.53, 0), [0, rot, 0]);
  B.mesh(new THREE.SphereGeometry(0.12, 10, 8), skin, P(0, 1.67, 0));
  B.mesh(new THREE.SphereGeometry(0.135, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), helm, P(0, 1.7, 0)); B.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 12), helm, P(0, 1.7, 0.02));
  if (o.tablet) B.mesh(new THREE.BoxGeometry(0.3, 0.22, 0.03), mat('#20262e'), P(0, 1.02, 0.3), [0, rot, 0]);
}

// A nyugalmi állapot beállítása az animáció egy pillanatára (a USDZ – iPhone Quick Look – ezt az állóképet mutatja)
export function poseAt(root, clip, t) { for (const tr of clip.tracks) { const i = tr.name.lastIndexOf('.'), o = root.getObjectByName(tr.name.slice(0, i)), prop = tr.name.slice(i + 1); if (!o) continue;
    const v = tr.createInterpolant().evaluate(t); if (prop === 'quaternion') o.quaternion.fromArray(v); else o[prop].fromArray(v); } }
