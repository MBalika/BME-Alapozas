// Magasságmezős terep talajtömbbel: terrain(B, h, X0, X1, Z0, Z1, BOT, NX, NZ, topMat, sideMat) – a felszín h(x, z), az oldalak a BOT szintig érnek
import { THREE, mat, C } from './common.js';
export function terrain(B, h, X0, X1, Z0, Z1, BOT, NX, NZ, top, sideM) { const pos = [], idx = [];
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = X0 + (X1 - X0) * i / NX, z = Z0 + (Z1 - Z0) * j / NZ; pos.push(x, h(x, z), z); }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setIndex(idx); tg.computeVertexNormals(); B.add(tg, top);
  const side = (pts) => { const p = [], ix = []; pts.forEach(([x, z], k) => { p.push(x, h(x, z), z, x, BOT, z); if (k) { const a = 2 * (k - 1); ix.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } }); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); B.add(g, sideM); };
  const edge = (fx, n) => { const a = []; for (let i = 0; i <= n; i++) a.push(fx(i / n)); return a; };
  side(edge(t => [X0 + (X1 - X0) * t, Z1], NX)); side(edge(t => [X1 - (X1 - X0) * t, Z0], NX)); side(edge(t => [X1, Z1 - (Z1 - Z0) * t], NZ)); side(edge(t => [X0, Z0 + (Z1 - Z0) * t], NZ));
  B.box(X1 - X0, 0.3, Z1 - Z0, sideM, (X0 + X1) / 2, BOT + 0.15, (Z0 + Z1) / 2); }
// a terepre fektetett szalag (út, patak, táblaszél): pontsor (x, z) mentén, w szélességben, dy-nal a felszín fölött
export function ribbon(B, h, pts, w, m, dy = 0.08) { const p = [], ix = []; pts.forEach(([x, z], k) => { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L;
    for (const s of [-1, 1]) { const xx = x + nx * s * w / 2, zz = z + nz * s * w / 2; p.push(xx, h(xx, zz) + dy, zz); } if (k) { const q = 2 * (k - 1); ix.push(q, q + 1, q + 2, q + 2, q + 1, q + 3); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); B.add(g, m); }
// nyeregtetős ház a terepen
export function house(B, x, z, ry, w, d, hh, wall, roof, y0) { const c = Math.cos(ry), s = Math.sin(ry); B.box(w, hh, d, mat(wall, { r: 0.9 }), x, y0 + hh / 2, z, [0, ry, 0]);
  const sh = new THREE.Shape([new THREE.Vector2(-d / 2 - 0.3, 0), new THREE.Vector2(d / 2 + 0.3, 0), new THREE.Vector2(0, d * 0.45)]), g = new THREE.ExtrudeGeometry(sh, { depth: w + 0.6, bevelEnabled: false }); g.translate(0, 0, -(w + 0.6) / 2); g.rotateY(Math.PI / 2);
  B.mesh(g, mat(roof, { r: 0.9 }), [x, y0 + hh, z], [0, ry, 0]); for (const k of [-1, 1]) B.box(0.9, 1.0, 0.1, mat('#33485a', { r: 0.3 }), x + k * w / 4 * c + d / 2 * s, y0 + hh * 0.55, z - k * w / 4 * s + d / 2 * c, [0, ry, 0]); }
