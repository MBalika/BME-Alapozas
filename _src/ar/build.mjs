// A 3D-modellek építése: node build.mjs [id …]  → ../../ar-labor/models/<fájl>{,-feliratok,-feliratok-en}.glb/.usdz és ../../ar-labor/img/<fájl>.jpg
// A modellek: models/<id>.js (build({lang}) → { root, labels(lang), clips, k, file }); a böngészőben (Playwright + Chromium) készülnek.
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require(process.env.PW || 'playwright');
import http from 'http'; import { execFileSync } from 'child_process'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(HERE, '../..'); const OUT = path.join(ROOT, 'ar-labor');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, s) => { let p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); try { p = fs.realpathSync(p); } catch (e) {} if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const ids = process.argv.slice(2).filter(a => !a.startsWith('--')); const ONLY = process.argv.includes('--poster') ? 'poster' : process.argv.includes('--models') ? 'models' : 'all';
const all = fs.readdirSync(path.join(HERE, 'models')).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
const list = ids.length ? ids : all;
fs.mkdirSync(path.join(OUT, 'models'), { recursive: true }); fs.mkdirSync(path.join(HERE, 'out'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:${port}/_src/ar/build.html`); await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
const sum = [];
for (const id of list) {
  if (ONLY !== 'poster') for (const [lang, lab, suf] of [['hu', false, ''], ['hu', true, '-feliratok'], ['en', true, '-feliratok-en']]) {
    const r = await page.evaluate(([i, l, b]) => window.exportModel(i, l, b), [id, lang, lab]).catch(e => ({ err: String(e) }));
    if (r.err) { console.log(id, lang, 'HIBA', r.err); continue; }
    const file = r.file, gp = path.join(OUT, 'models', file + suf + '.glb'); fs.writeFileSync(gp, Buffer.from(r.glb, 'base64'));
    if (process.env.COMP) execFileSync(path.join(HERE, 'node_modules/.bin/gltf-transform'), ['meshopt', gp, gp, '--level', 'medium'], { stdio: 'ignore' }); // tömörítés (EXT_meshopt_compression)
    r.glbKB = fs.statSync(gp).size / 1024;
    fs.writeFileSync(path.join(OUT, 'models', file + suf + '.usdz'), Buffer.from(r.usdz, 'base64'));
    if (!lab) sum.push(`${id}: ${file}.glb ${r.glbKB.toFixed(0)} KB (nyers ${(r.glb.length * 0.75 / 1024).toFixed(0)}), usdz ${(r.usdz.length * 0.75 / 1024).toFixed(0)} KB, méret ${r.size.join(' × ')} m`);
  }
  const ZOOM = (process.argv.find(a => a.startsWith('--zoom=')) || '').slice(7); const LAB = process.argv.includes('--labels'); const TT = (process.argv.find(a => a.startsWith('--t=')) || '').slice(4);
  if (ONLY !== 'models') { const p = await page.evaluate(([i, z, lb, t]) => window.poster(i, 1120, 700, z, lb, t), [id, ZOOM ? ZOOM.split(',').map(Number) : null, LAB, TT ? +TT : null]).catch(e => ({ url: 'ERR ' + e }));
    if (p.url.startsWith('data:')) fs.writeFileSync(path.join(HERE, 'out', p.file + (ZOOM ? '-zoom' : '') + (LAB ? '-lab' : '') + (TT ? '-t' + TT : '') + '.jpg'), Buffer.from(p.url.split(',')[1], 'base64')); else console.log(id, 'poszter HIBA', p.url); }
}
console.log(sum.join('\n')); if (errs.length) console.log('böngészőhibák:', [...new Set(errs)].slice(0, 8).join('\n'));
await browser.close(); srv.close();
