const C = require('./core.js');
const f = (v, n = 2) => v == null ? '-' : (+v).toFixed(n);
const show = (lv, d, P) => { const r = C.evaluate(P || C.truth(lv), lv, d), c = C.cost(lv, d, lv.zw); return `${JSON.stringify(d)} Λ=${f(r.lam)} Λk=${f(r.lamk)} sL=${f(r.L.s, 0)} sR=${f(r.R.s, 0)} zl=${f(r.L.zlim,1)}/${f(r.R.zlim,1)} rot=1/${r.rot ? Math.round(1 / r.rot) : '∞'} ${r.fail || 'OK'} költség=${f(c.total)} (víz ${f(c.dewater)})`; };
for (const lv of C.LEVELS) { const o = C.optimum(lv); console.log(`\n== ${lv.id}  p=${C.pLine(lv)} kN/m  keret=${lv.budget}  optimum: ${o ? f(o.c) + ' ' + JSON.stringify(o.d) : 'NINCS'}`);
  if (o) console.log('   opt ', show(lv, o.d));
  for (const d of [{ type: 'strip', B: 0.6, D: 0.5 }, { type: 'strip', B: 0.8, D: 0.8 }, { type: 'strip', B: 1.5, D: 1 }, { type: 'strip', B: 2.5, D: 1.5 }, { type: 'strip', B: 4, D: 3 }, { type: 'raft', D: 1 }, { type: 'raft', D: 3 }, { type: 'pile', L: 6, a: 2.5 }, { type: 'pile', L: 9, a: 3 }, { type: 'pile', L: 13, a: 2.5 }, { type: 'pile', L: 15, a: 2.5 }]) console.log('  ', show(lv, d));
  // legolcsóbb megfelelő típusonként
  for (const t of ['strip', 'raft', 'pile']) { let b = null; const R = C.RANGE[t]; const keys = Object.keys(R); const rec = (i, d) => { if (i === keys.length) { const c = C.cost(lv, d, lv.zw).total; if ((!b || c < b.c) && C.evaluate(C.truth(lv), lv, d).ok) b = { c, d: { ...d } }; return; } for (const v of C.span(R[keys[i]])) rec(i + 1, { ...d, [keys[i]]: v }); }; rec(0, { type: t }); console.log(`   legjobb ${t}: ${b ? f(b.c) + ' ' + JSON.stringify(b.d) : 'nincs megfelelő'}`); } }
