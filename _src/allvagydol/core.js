/* „Áll vagy dől?” – a játék számítási magja (DOM nélkül, Node-ban is fut: node test.cjs).
   Egyszerűsített sík (sávszerű) modell, az épület 1 m-es szeletére:
   - teherbírás: sávalap, EC7 D melléklet szerinti tényezők (drénezett), agyagban drénezetlen: (π + 2)·c_u + q; kétrétegű altalajnál fiktív alaptest 2 : 1 teherszétosztással;
     tervezési érték: V_d = 1,4·V_k, R_d = R_k / 1,4  →  Λ = V_d / R_d;
   - süllyedés: Boussinesq-féle sávteher (szuperpozícióval), rétegenkénti összenyomódás E_s-sel a határmélységig (Δσ_z = 0,2·σ′_g);
   - cölöp: palást- és talpellenállás rétegenként, R_d = R_k / 1,6; a süllyedés tapasztalati becslés. */
const CORE = (function () {
  const PI = Math.PI, GW = 10, ZMAX = 17, FROST = 0.8, PD = 0.8, CAP = 0.8;
  // γ [kN/m³], φ [°], c [kPa], cu [kPa] (drénezetlen – agyag, tőzeg), Es [MPa], qs, qb [kPa] (cölöp palást / talp)
  const SOIL = {
    fill:  { g: 17,   phi: 24, c: 0, Es: 3,   qs: 0,   qb: 0 },
    sandL: { g: 17.5, phi: 28, c: 0, Es: 9,   qs: 25,  qb: 900 },
    sandM: { g: 18.5, phi: 32, c: 0, Es: 25,  qs: 45,  qb: 2200 },
    sandD: { g: 19.5, phi: 36, c: 0, Es: 45,  qs: 70,  qb: 3800 },
    grav:  { g: 20.5, phi: 38, c: 0, Es: 90,  qs: 100, qb: 5500 },
    clayS: { g: 18,   cu: 22,  Es: 2.5, qs: 18, qb: 200 },
    clayM: { g: 19,   cu: 55,  Es: 7,   qs: 32, qb: 500 },
    clayH: { g: 20,   cu: 150, Es: 22,  qs: 55, qb: 1350 },
    peat:  { g: 12,   cu: 8,   Es: 0.7, qs: 0,  qb: 0 },
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const poly = (pts, x) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, z0] = pts[i - 1], [x1, z1] = pts[i]; return lerp(z0, z1, (x - x0) / (x1 - x0)); } return pts[pts.length - 1][1]; };
  // ---- szelvény: col(x) → [{ s, top, bot }] (a nulla vastagságú rétegek nélkül), zw: talajvízszint mélysége (null: nem ismert / nincs)
  const colFrom = (ids, bots) => { const out = []; let top = 0; ids.forEach((s, i) => { const bot = Math.max(top, Math.min(ZMAX, bots[i])); if (bot - top > 0.02) out.push({ s, top, bot }); top = bot; }); if (out.length) out[out.length - 1].bot = ZMAX; return out; };
  const truth = (lv) => ({ zw: lv.zw, col: (x) => colFrom(lv.layers.map(l => l.s), lv.layers.map(l => l.bot ? poly(l.bot, x) : ZMAX)), known: () => true });
  /* a fúrásokból értelmezett szelvény: a réteghatárok a két szomszédos fúrás között lineárisan, a szélső fúráson túl vízszintesen;
     amit egyik fúrás sem ért el, azt nem ismerjük: a legalsó megismert réteg folytatódik lefelé (feltételezés) */
  const interp = (lv, bor) => { const T = truth(lv), ids = lv.layers.map(l => l.s); const B = bor.slice().sort((a, b) => a.x - b.x).map(b => ({ x: b.x, d: b.d, bots: lv.layers.map(l => l.bot ? poly(l.bot, b.x) : ZMAX) }));
    const zw = B.some(b => lv.zw != null && b.d > lv.zw) ? lv.zw : null;
    const col = (x) => { if (!B.length) return []; let L = null, R = null; for (const b of B) { if (b.x <= x) L = b; else if (!R) R = b; } if (!L) L = R; if (!R) R = L; const t = R.x === L.x ? 0 : (x - L.x) / (R.x - L.x);
      const bots = ids.map((_, i) => { const kl = L.bots[i] < L.d - 1e-6, kr = R.bots[i] < R.d - 1e-6; if (kl && kr) return lerp(L.bots[i], R.bots[i], t); if (kl) return L.bots[i]; if (kr) return R.bots[i];
        let best = null; for (const b of B) if (b.bots[i] < b.d - 1e-6 && (!best || Math.abs(b.x - x) < Math.abs(best.x - x))) best = b; return best ? best.bots[i] : ZMAX; });   // amit a szomszédos fúrások nem értek el, azt a legközelebbi mélyebb fúrásból vesszük
      for (let i = 1; i < bots.length; i++) bots[i] = Math.max(bots[i], bots[i - 1]); return colFrom(ids, bots); };
    const depth = (x) => { if (!B.length) return 0; let L = null, R = null; for (const b of B) { if (b.x <= x) L = b; else if (!R) R = b; } if (!L) return R.d; if (!R) return L.d; return Math.min(L.d, R.d); };   // eddig „ismert” a két fúrás között
    return { zw, col, depth, B }; };
  const layerAt = (col, z) => col.find(l => z < l.bot - 1e-9) || col[col.length - 1];
  const sigTot = (col, z) => { let s = 0; for (const l of col) { if (z <= l.top) break; s += SOIL[l.s].g * (Math.min(z, l.bot) - l.top); } return s; };
  const sigEff = (col, zw, z) => sigTot(col, z) - (zw != null && z > zw ? GW * (z - zw) : 0);
  // ---- teherbírás: R_k [kN/m] a zf mélységű, Bf szélességű (fiktív) sávalapra, az alatta lévő réteg jellemzőivel
  const NQ = (phi) => { const t = Math.tan(phi * PI / 180); return Math.exp(PI * t) * Math.pow(Math.tan(PI / 4 + phi * PI / 360), 2); };
  const Rk = (col, zw, soil, Bf, zf) => { const S = SOIL[soil]; if (S.cu != null) return Bf * ((PI + 2) * S.cu + sigTot(col, zf));
    const t = Math.tan(S.phi * PI / 180), Nq = NQ(S.phi), Nc = (Nq - 1) / t, Ng = 2 * (Nq - 1) * t; const dw = zw == null ? 1e9 : zw - zf; const g2 = dw >= Bf ? S.g : dw <= 0 ? S.g - GW : (S.g - GW) + GW * dw / Bf;
    return Bf * (S.c * Nc + sigEff(col, zw, zf) * Nq + 0.5 * g2 * Bf * Ng); };
  const bearing = (P, x, B, D, Vk) => { const col = P.col(x); if (!col.length) return null; let worst = null;
    const chk = (soil, Bf, zf, E) => { const R = Rk(col, P.zw, soil, Bf, zf), r = { lam: 1.96 * E / R, lamk: E / R, soil, zf, Bf, R, E }; if (!worst || r.lam > worst.lam) worst = r; };
    chk(layerAt(col, D + 0.01).s, B, D, Vk);
    for (const l of col) if (l.top > D + 0.05 && l.top <= D + 2 * B) { const Bf = B + (l.top - D); chk(l.s, Bf, l.top, Vk + (sigTot(col, l.top) - sigTot(col, D)) * Bf); }
    return worst; };
  // ---- süllyedés: Δσ_z egyenletes sávteher alatt (b: félszélesség, dx: vízszintes távolság a sáv tengelyétől), szuperpozícióval
  const dsig = (p0, b, dx, z) => { const t1 = Math.atan2(dx + b, z), t2 = Math.atan2(dx - b, z), a = t1 - t2; return p0 / PI * (a + Math.sin(a) * Math.cos(t1 + t2)); };
  const settle = (P, x, D, loads) => { const col = P.col(x); if (!col.length) return null; let s = 0, z = D, zlim = ZMAX; const dz = 0.1;
    while (z < ZMAX - 1e-9) { const zm = z + dz / 2; let d = 0; for (const L of loads) if (L.p0 > 0) d += dsig(L.p0, L.b, x - L.xc, zm - D); if (zm > D + 0.3 && d <= 0.2 * sigEff(col, P.zw, zm)) { zlim = z; break; } s += d * dz / (SOIL[layerAt(col, zm).s].Es * 1000); z += dz; }
    return { s: s * 1000, zlim }; };
  // ---- cölöp (Ø 0,8 m): R_k egy cölöpre az x helyen, L hosszal (a fejgerenda alja 0,8 m)
  const pile = (P, x, L) => { const col = P.col(x); if (!col.length) return null; let Rs = 0; for (const l of col) { const h = Math.min(L, l.bot) - Math.max(CAP, l.top); if (h > 0) Rs += SOIL[l.s].qs * PI * PD * h; }
    const tip = layerAt(col, L - 1e-6); let qb = SOIL[tip.s].qb * Math.min(1, Math.max(0, L - Math.max(tip.top, CAP)) / 1.2); for (const l of col) if (l.top > L && l.top < L + 1.2) qb = Math.min(qb, SOIL[l.s].qb);
    return { R: Rs + qb * PI * PD * PD / 4, Rs, tip: tip.s, firm: SOIL[tip.s].Es >= 20 && qb >= 1000 }; };
  // ---- a terv: { type: 'strip' | 'raft' | 'pile', B, D, L, a }
  const walls = (lv) => [lv.x0, lv.x0 + lv.W], pLine = (lv) => lv.qf * lv.W / 2 * lv.n;
  const evaluate = (P, lv, d) => { const [xl, xr] = walls(lv), p = pLine(lv), r = { type: d.type, p };
    if (d.type === 'strip') { const Vk = p + 22 * d.B * d.D; r.D = d.D; r.bl = bearing(P, xl, d.B, d.D, Vk); r.br = bearing(P, xr, d.B, d.D, Vk); if (!r.bl) return null;
      const loads = [xl, xr].map(xc => ({ xc, b: d.B / 2, p0: Vk / d.B - sigTot(P.col(xc), d.D) })); r.L = settle(P, xl, d.D, loads); r.R = settle(P, xr, d.D, loads); r.span = lv.W; r.slim = 50; r.frost = d.D >= FROST - 1e-9; }
    else if (d.type === 'raft') { const xc = lv.x0 + lv.W / 2, Vk = 2 * p + 25 * 0.6 * lv.W; r.D = d.D; r.bl = r.br = bearing(P, xc, lv.W, d.D, Vk); if (!r.bl) return null;
      const loads = [{ xc, b: lv.W / 2, p0: Vk / lv.W - sigTot(P.col(xc), d.D) }]; r.L = settle(P, xl + lv.W / 8, d.D, loads); r.R = settle(P, xr - lv.W / 8, d.D, loads); r.span = lv.W * 0.75; r.slim = 75; r.frost = d.D >= FROST - 1e-9; }
    else { const E = (p + 15) * d.a; r.D = CAP; const f = (x) => { const q = pile(P, x, d.L); if (!q) return null; const lamk = E / Math.max(q.R, 1e-6); return { lam: 2.24 * lamk, lamk, R: q.R, E, soil: q.tip, firm: q.firm, pile: true }; };
      r.bl = f(xl); r.br = f(xr); if (!r.bl) return null; const sp = (b) => ({ s: Math.min(400, b.firm ? 3 + 22 * b.lamk * b.lamk : 15 + 250 * b.lamk * b.lamk), zlim: d.L }); r.L = sp(r.bl); r.R = sp(r.br); r.span = lv.W; r.slim = 50; r.frost = true; }
    r.lam = Math.max(r.bl.lam, r.br.lam); r.lamk = Math.max(r.bl.lamk, r.br.lamk); r.side = r.br.lamk > r.bl.lamk ? 1 : -1; r.s = Math.max(r.L.s, r.R.s); r.ds = Math.abs(r.R.s - r.L.s); r.rot = r.ds / 1000 / r.span; r.lean = r.R.s > r.L.s ? 1 : -1;
    r.fail = r.lamk > 1 ? 'collapse' : r.rot > 1 / 150 ? 'tilt' : r.lam > 1 ? 'uls' : r.rot > 1 / 500 ? 'crack' : r.s > r.slim + 0.5 ? 'settle' : !r.frost ? 'frost' : null; r.ok = !r.fail; return r; };
  // ---- költség [millió Ft]; zw: a tényleges vagy a megismert talajvízszint (víztelenítés, ha az alapsík alatta van)
  const BOR = { 6: 0.15, 16: 0.4 }; const LB = 15;
  const cost = (lv, d, zw) => { let c, dw = 0; if (d.type === 'strip') c = 2 * LB * (0.055 * d.B + 0.05 * d.D * (0.6 + 0.5 * d.B)); else if (d.type === 'raft') c = lv.W * LB * (0.066 + 0.012 * d.D); else c = 3 + 2 * LB * 0.05 + 2 * (Math.ceil(LB / d.a) + 1) * d.L * 0.07;
    if (d.type !== 'pile' && zw != null && d.D > zw + 1e-9) dw = 1.5 + 1.2 * (d.D - zw) * (d.type === 'raft' ? 1.6 : 1); return { found: c, dewater: dw, total: c + dw }; };
  const borCost = (bor) => bor.reduce((t, b) => t + BOR[b.d], 0);
  const RANGE = { strip: { B: [0.5, 4, 0.1], D: [0.5, 4, 0.1] }, raft: { D: [0.5, 3, 0.1] }, pile: { L: [4, 16, 0.5], a: [2.5, 5, 0.5] } };
  const span = ([a, b, st]) => { const o = []; for (let v = a; v <= b + 1e-9; v += st) o.push(Math.round(v * 100) / 100); return o; };
  const optimum = (lv) => { const P = truth(lv); let best = null; const tryD = (d) => { const c = cost(lv, d, lv.zw).total; if (best && c >= best.c) return; const r = evaluate(P, lv, d); if (r.ok) best = { c, d, r }; };
    for (const B of span(RANGE.strip.B)) for (const D of span(RANGE.strip.D)) tryD({ type: 'strip', B, D }); for (const D of span(RANGE.raft.D)) tryD({ type: 'raft', D }); for (const L of span(RANGE.pile.L)) for (const a of span(RANGE.pile.a)) tryD({ type: 'pile', L, a }); return best; };
  /* ---- a hat telek. x: 0…40 m, a ház bal fala x0-nál; n szint, szintenként qf [kPa] a teljes alapterületen → falanként p = qf·W/2·n [kN/m].
     bot: a réteg aljának mélysége [x, z] töréspontokkal; az utolsó réteg lefelé folytatódik. secret(bor): megtalálta-e a feltárás a telek lényegét. */
  const inFoot = (lv, b) => b.x >= lv.x0 - 2 && b.x <= lv.x0 + lv.W + 2;
  const LEVELS = [
    { id: 'homok', lec: 3, x0: 15, W: 10, n: 2, qf: 14, zw: 5.5, budget: 4, layers: [{ s: 'sandM', bot: [[0, 6.3], [14, 5.6], [28, 6.4], [40, 5.9]] }, { s: 'sandD' }],
      secret: (lv, bor) => true },
    { id: 'viz', lec: 3, x0: 13, W: 12, n: 1, qf: 30, zw: 1.1, budget: 6.5, layers: [{ s: 'sandL', bot: [[0, 1.5], [18, 1.4], [40, 1.7]] }, { s: 'sandM', bot: [[0, 7.5], [40, 8.5]] }, { s: 'grav' }],
      secret: (lv, bor) => bor.some(b => b.d > lv.zw) },
    { id: 'feltoltes', lec: 6, x0: 15, W: 10, n: 3, qf: 14, zw: 9, budget: 8, layers: [{ s: 'fill', bot: [[0, 0.9], [12, 1.1], [20, 2.0], [27, 2.9], [40, 3.4]] }, { s: 'clayH' }],
      secret: (lv, bor) => bor.some(b => Math.abs(b.x - lv.x0) <= 3) && bor.some(b => Math.abs(b.x - lv.x0 - lv.W) <= 3) },
    { id: 'lencse', lec: 5, x0: 13, W: 14, n: 4, qf: 14, zw: 7, budget: 17, layers: [{ s: 'sandD', bot: [[0, 2.6], [21, 2.6], [23, 2.4], [28, 2.2], [32, 2.4], [34, 2.6], [40, 2.6]] }, { s: 'peat', bot: [[0, 2.6], [21, 2.6], [23, 4.6], [28, 5.6], [32, 4.4], [34, 2.6], [40, 2.6]] }, { s: 'sandD' }],
      secret: (lv, bor) => bor.some(b => b.x >= 21.6 && b.x <= 33.4) },
    { id: 'agyag', lec: 8, x0: 14, W: 12, n: 8, qf: 12, zw: 1.6, budget: 24, layers: [{ s: 'clayM', bot: [[0, 1.8], [40, 2.2]] }, { s: 'clayS', bot: [[0, 10.6], [20, 11.4], [40, 12.0]] }, { s: 'grav' }],
      secret: (lv, bor) => bor.some(b => b.d > 12) },
    { id: 'pisa', lec: 5, x0: 16, W: 8, n: 6, qf: 20, zw: 2, budget: 24, layers: [{ s: 'sandM', bot: [[0, 4.2], [16, 3.8], [24, 3.0], [40, 2.4]] }, { s: 'clayS', bot: [[0, 7.0], [16, 8.2], [24, 11.4], [40, 13.5]] }, { s: 'sandD' }],
      secret: (lv, bor) => { const d = bor.filter(b => b.d > 12); return d.some(b => b.x <= lv.x0 + 2) && d.some(b => b.x >= lv.x0 + lv.W - 2); } },
  ];
  const stars = (lv, d, bor) => { const r = evaluate(truth(lv), lv, d); const c = cost(lv, d, lv.zw), opt = optimum(lv); const total = c.total + borCost(bor);
    const near = bor.filter(b => inFoot(lv, b)).length >= 2, found = near && lv.secret(lv, bor);
    return { r, c, total, opt, over: total > lv.budget + 1e-9, econ: r.ok && c.total <= 1.3 * opt.c + 1e-9 && total <= lv.budget + 1e-9, found, n: r.ok ? 1 + (c.total <= 1.3 * opt.c + 1e-9 && total <= lv.budget + 1e-9 ? 1 : 0) + (found ? 1 : 0) : 0 }; };
  return { SOIL, LEVELS, ZMAX, FROST, CAP, PD, LB, BOR, RANGE, truth, interp, evaluate, cost, borCost, optimum, stars, walls, pLine, layerAt, sigEff, inFoot, poly, span };
})();
if (typeof module !== 'undefined') module.exports = CORE;
