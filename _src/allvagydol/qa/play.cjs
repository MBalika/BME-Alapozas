const { chromium } = require('playwright');
// node play.cjs <url> <outprefix> <w> <h> <levelId> '<[[x,d],...]>' '<{"type":"strip","B":1,"D":1}>' – végigjátszik egy telket: fúrások, alap, építés; képek a szakaszokról
(async () => { const [,, url, out, w, h, id, borS, dS] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('C ' + m.text().slice(0, 200)); });
  await p.goto(url + (url.includes('?') ? '&' : '?') + 't=' + id, { waitUntil: 'load' }); await p.waitForTimeout(1200);
  const el = async (sel) => { const e = await p.$(sel); await e.scrollIntoViewIfNeeded(); return e; };
  const shot = async (n) => { const e = await el('#play'); await e.screenshot({ path: `${out}_${n}.png` }); };
  const bor = JSON.parse(borS), d = JSON.parse(dS);
  for (const [x, dep] of bor) { await p.click(`#dsel button[data-d="${dep}"]`); const pt = await p.evaluate((xm) => { const sc = document.querySelector('#sc'), r = sc.getBoundingClientRect(), vb = sc.viewBox.baseVal; const k = Math.min(r.width / vb.width, r.height / vb.height), ox = r.left + (r.width - vb.width * k) / 2, oy = r.top + (r.height - vb.height * k) / 2; return [ox + xm * 25 * k, oy + (vb.height - 200) * k]; }, x); await p.mouse.click(pt[0], pt[1]); await p.waitForTimeout(1800); }
  await shot(1);
  await p.click('#next'); await p.waitForTimeout(300); await p.click(`#tsel button[data-t="${d.type}"]`);
  for (const k of ['B', 'D', 'L', 'a']) if (d[k] != null && await p.$('#s_' + k)) await p.evaluate(([k, v]) => { const i = document.querySelector('#s_' + k); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); }, [k, d[k]]);
  await p.waitForTimeout(400); await shot(2);
  const est = await p.evaluate(() => { const e = window.__avd.est(); return e && { lam: +e.r.lam.toFixed(2), s: +e.r.s.toFixed(0), rot: e.r.rot ? Math.round(1 / e.r.rot) : 0, fail: e.r.fail, c: +e.c.total.toFixed(2) }; });
  const dis = await p.evaluate(() => document.querySelector('#build').disabled); if (dis) { console.log('nem építhető (keret)', JSON.stringify(est)); await b.close(); return; }
  await p.click('#build'); await p.waitForFunction(() => window.__avd.S.phase === 4, null, { timeout: 30000 }); await p.waitForTimeout(3300); await shot(3);
  const res = await p.evaluate(() => { const R = window.__avd.S.res; return { fail: R.r.fail, n: R.n, lam: +R.r.lam.toFixed(2), sL: +R.r.L.s.toFixed(0), sR: +R.r.R.s.toFixed(0), total: +R.total.toFixed(2), econ: R.econ, found: R.found, over: R.over }; });
  console.log(id, 'becslés', JSON.stringify(est), 'valóság', JSON.stringify(res), 'hibák', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
