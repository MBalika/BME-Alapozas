/* ================= FORMÁZÁS: nem törő egységek + magyar elválasztás ================= */
const GUARD = (() => {
  const NB = '\u00A0', WJ = '\u2060', NNB = '\u202F', NBH = '\u2011';
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'svg', 'SVG', 'CANVAS', 'SELECT', 'OPTION']);
  const BLOCK = 'main p, main li, main h2, main h3, main h4, main h5, main b, main .verdict, main .vs > div, main .rv, main .tlx, main .note, main .tagline, main .stat span, main .lead, footer p, footer li, .hero-lead';
  const HYPH = 'main p, main li, main .vs > div, main .rv, main .note, main .verdict, main .tlx, main .lead, footer p, .hero-lead';
  const NOHY = 'sub, sup, code, button, label, output, td, th, .nw, h1, h2, h3, h4, h5, .chip, .pill, .kick, .mono, .tag, .bdg, .d';
  const TERMS = ['kiscelli agyag', 'kövér agyag', 'laza üledék', 'Pannon-tó', 'Tisza-gát', 'Fővám tér', 'Paks II', 'Jáky József', 'Építőmérnöki Kar', 'Kárpát-medence', 'talajmechanikai labor', 'első vázlat'];
  const termRx = new RegExp('(' + TERMS.sort((a, b) => b.length - a.length).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[ \\u00A0]')).join('|') + ')', 'giu');
  const MULT_SYM = /^(tg|ctg|sin|cos|tan|exp|ln|log)\b/;
  const NUMW = /(^|[\s(\u00A0\u2060„])((?:[Kk]ét|[Hh]árom|[Nn]égy|[Öö]t|[Hh]at|[Hh]ét|[Nn]yolc|[Kk]ilenc|[Tt]íz|[Tt]izennégy|[Ee]lső|[Mm]ásodik|[Hh]armadik|[Nn]egyedik|[Mm]indkét|[Mm]indhárom|[Nn]éhány|[Ee]gyik))(?=\s\S)\s/g;
  function textPass(s) {
    if (!/[ \-–·]/.test(s)) return s;
    s = s.replace(/(^|[^\d,.])(\d{1,3}) (\d{3})(?!\d)/g, '$1$2' + NNB + '$3');
    s = s.replace(/ ([=≤≥≈→←×±<>⇒↔]) /g, NB + '$1' + NB);
    s = s.replace(/([\p{N}\p{L})\]′″°²³]) ([+−]) (?=[\p{N}\p{L}(])/gu, '$1' + NB + '$2' + NB);
    s = s.replace(/(^|[(\[„])([=≤≥≈<>±~]) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/ · (?=(\S+))/g, (m, nxt) => { const w = nxt.replace(/^[(„"]/, ''); if (/^\p{L}{3,}/u.test(w) && !MULT_SYM.test(w)) return m; return NB + '·' + NB; });
    s = s.replace(/(\d)-(\d)/g, '$1' + NBH + '$2');
    s = s.replace(/\b([A-Z]{2,5})-(\d)/g, '$1' + NBH + '$2');
    s = s.replace(/([^\s\u2060])–([^\s\u2060])/g, '$1' + WJ + '–' + WJ + '$2');
    s = s.replace(/(^|[\s(\u00A0])(pl\.|kb\.|ill\.|ún\.|max\.|min\.|Dr\.) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/(^|[\s(\u00A0\u2060~≈≤≥=<>−+])(\d+(?:[,.]\d+)?\.?%?) (?=\S)/g, '$1$2' + NB);
    s = s.replace(/(^|[\s(\u00A0\u2060~≈≤≥=<>−+])(\d+(?:[,.]\d+)?\.?%?) (?=\S)/g, '$1$2' + NB);
    for (let i = 0; i < 2; i++) s = s.replace(/(^|[\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És) (?=\S)/g, '$1$2' + NB);
    s = s.replace(NUMW, '$1$2' + NB);
    s = s.replace(/([\d°′″%)\]\p{Lu}])-(\p{Ll}{1,6})(?=$|[\s.,;:!?)”\u00A0\u2060])/gu, '$1' + NBH + '$2');
    s = s.replace(/(\d[\u00A0 ](?:mm|cm|m|kPa|MPa|kN|m²|m³))-(\p{Ll}{1,7})(?=$|[\s.,;:!?)”\u00A0\u2060])/gu, '$1' + NBH + '$2');
    return s;
  }
  const SHORTEND = new RegExp('(^|[\\s(\u00A0\u2060„])(a|az|A|Az|s|e|egy|Egy|és|És|pl\\.|kb\\.|ill\\.|ún\\.|\\d+(?:[,.]\\d+)?\\.?%?) $');
  function crossPass(nodes) { for (let i = 0; i < nodes.length - 1; i++) { const a = nodes[i], b = nodes[i + 1]; const av = a.nodeValue, bv = b.nodeValue; if (!av || !bv) continue;
    if (av.endsWith(' ') && /^\S/.test(bv) && SHORTEND.test(av)) a.nodeValue = av.slice(0, -1) + NB;
    const ms = /^ ([=≤≥≈→←×±<>⇒+−/]) /.exec(b.nodeValue); if (ms && /\S$/.test(a.nodeValue)) b.nodeValue = NB + ms[1] + NB + b.nodeValue.slice(3);
    const me = / ([=≤≥≈→←×±<>⇒+−/]) $/.exec(a.nodeValue); if (me && /^\S/.test(b.nodeValue)) a.nodeValue = a.nodeValue.slice(0, -3) + NB + me[1] + NB; } }
  function bindPositions(full, cpl = 70) {
    const bind = new Set(); const segMax = Math.max(14, Math.min(38, 0.42 * cpl)), parMax = Math.max(10, Math.min(24, 0.30 * cpl));
    const mark = (a, b) => { for (let i = a; i < b; i++) if (full[i] === ' ') bind.add(i); };
    const sepRx = / · |; | – /g; let last = 0, m, lastSep = ''; const segs = [];
    while ((m = sepRx.exec(full))) { segs.push([last, m.index, lastSep, m[0]]); last = m.index + m[0].length; lastSep = m[0]; } segs.push([last, full.length, lastSep, '']);
    if (segs.length > 1) for (const [a, b, before, after] of segs) { const t = full.slice(a, b).replace(/[\u2060\u00AD]/g, '').trim(); const dashOnly = (before === ' – ' || before === '') && (after === ' – ' || after === '') && (before || after); const lim = dashOnly ? Math.min(22, segMax) : segMax; if (t.length > 0 && t.length < lim) mark(a, b); }
    const pr = /\(([^()]{1,30})\)/g; while ((m = pr.exec(full))) { if (m[0].replace(/[\u2060\u00AD]/g, '').length <= parMax) mark(m.index, m.index + m[0].length); }
    termRx.lastIndex = 0; while ((m = termRx.exec(full))) mark(m.index, m.index + m[0].length);
    return bind;
  }
  function textNodes(root) { const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(n) { let p = n.parentNode; while (p && p !== root) { if (SKIP.has(p.nodeName)) return NodeFilter.FILTER_REJECT; p = p.parentNode; } return NodeFilter.FILTER_ACCEPT; } }); let n; while ((n = w.nextNode())) out.push(n); return out; }
  let hyph = null; const done = new WeakMap();
  function processBlock(el) {
    if (!el.isConnected) return; if (el.closest('svg')) return; const cur = el.textContent; if (done.get(el) === cur) return;
    const nodes = textNodes(el); for (const n of nodes) { const v = textPass(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } crossPass(nodes);
    const full = nodes.map(n => n.nodeValue).join(''); const fs = parseFloat(getComputedStyle(el).fontSize) || 16; const cpl = el.clientWidth > 40 ? el.clientWidth / (fs * 0.52) : 70;
    const bind = bindPositions(full, cpl);
    if (bind.size) { let off = 0; for (const n of nodes) { const v = n.nodeValue; let o = '', ch = false; for (let i = 0; i < v.length; i++) { if (v[i] === ' ' && bind.has(off + i)) { o += NB + WJ; ch = true; } else o += v[i]; } off += v.length; if (ch) n.nodeValue = o; } }
    if (hyph && el.matches(HYPH)) { for (const n of textNodes(el)) { if (n.parentElement && n.parentElement.closest(NOHY) && n.parentElement.closest(NOHY) !== el) continue; const parts = n.nodeValue.split(/( )/); let ch = false;
      for (let i = 0; i < parts.length; i += 2) { const t = parts[i]; if (!t || !/\p{L}{6,}/u.test(t)) continue; const clean = t.replace(/[\u00AD\u200B]/g, ''); let hh;
        if (t.includes(WJ)) { const vis = clean.replace(/[\u2060]/g, ''); if (vis.length <= 16 || /^\(.*\)[.,;:!?]*$/.test(vis)) continue; const k = Math.max(clean.lastIndexOf('\u00A0'), clean.lastIndexOf(WJ)); const tail = clean.slice(k + 1); if (!/\p{L}{6,}/u.test(tail)) continue; hh = clean.slice(0, k + 1) + hyph(tail); } else hh = hyph(clean);
        hh = hh.replace(/\u200B/g, ''); if (hh !== t) { parts[i] = hh; ch = true; } } if (ch) n.nodeValue = parts.join(''); } }
    done.set(el, el.textContent);
  }
  let obs = null, pend = new Set(), sched = false;
  function observe() { obs.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  function run(root = document.body) { const set = new Set(); if (root.matches && root.matches(BLOCK)) set.add(root); $$(BLOCK, root).forEach(e => set.add(e)); if (obs) obs.disconnect(); set.forEach(processBlock); if (obs) { obs.takeRecords(); observe(); } }
  function flush() { sched = false; const roots = Array.from(pend); pend.clear(); if (obs) obs.disconnect(); for (const r of roots) { if (!r.isConnected) continue; const blk = r.closest ? r.closest(BLOCK) : null; if (blk) processBlock(blk); if (r.querySelectorAll) $$(BLOCK, r).forEach(processBlock); } if (obs) { obs.takeRecords(); observe(); } }
  function start() { run(); obs = new MutationObserver(recs => { for (const r of recs) { const t = r.type === 'characterData' ? r.target.parentElement : r.target; if (t && !(t.closest && t.closest('svg'))) pend.add(t); } if (pend.size && !sched) { sched = true; requestAnimationFrame(flush); } }); observe();
    const H = window.Hyphenopoly; if (H && H.hyphenators && H.hyphenators.hu) H.hyphenators.hu.then(fn => { hyph = s => fn(s); $$(HYPH).forEach(e => done.delete(e)); run(); window.__fmtHyphReady = true; }).catch(() => {}); }
  return { start, run };
})();

/* RAG3 – lyukas sorkizárt blokk tartaléka (formázás skill): (1) ha a szép tördelés (text-wrap: pretty) lyukas,
   előbb sima tördeléssel (text-wrap: wrap, .twr) próbálja – a blokk sorkizárt marad; (2) csak ha így is lyukas,
   balra zárt lesz (.rag). Az összetartozó egységek (NBSP/U+2060 kötések) érintetlenek maradnak.
   Idempotens: a döntést szélesség + szöveg szerint megjegyzi, ismételt futáskor nem mér újra. */
const RAG3 = (() => {
  try { const st = document.createElement('style'); st.textContent = '.twr{text-wrap:wrap!important}'; document.head.appendChild(st); } catch (e) {}
  const memo = new WeakMap();
  const sig = (el) => el.textContent;   // a teljes szöveg (az elválasztás után is újramér)
  function bad(el, strict) {
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16; const all = document.createRange(); all.selectNodeContents(el); const rs = all.getClientRects(); if (rs.length < 2) return false;
    let lastTop = -1e9; for (const r of rs) if (r.width && r.top > lastTop) lastTop = r.top; let big = 0, mid = 0;
    // sima tördelésnél (strict): egy nem utolsó, nagyon rövid sor (pl. hosszú, nem törhető képlet előtt) is rossz – a sorokat
    // függőleges átfedés szerint vonjuk össze, így az alsó/felső index nem számít külön sornak; <br>-es blokknál nem vizsgáljuk
    if (strict && !el.querySelector('br')) { const L = []; for (const r of rs) { if (!r.width || !r.height) continue; let l = L.find((q) => Math.min(q.b, r.bottom) - Math.max(q.t, r.top) > 0.5 * Math.min(q.b - q.t, r.height));
      if (!l) L.push({ t: r.top, b: r.bottom, l: r.left, r: r.right }); else { l.t = Math.min(l.t, r.top); l.b = Math.max(l.b, r.bottom); l.l = Math.min(l.l, r.left); l.r = Math.max(l.r, r.right); } }
      L.sort((a, b) => a.t - b.t); for (let i = 0; i < L.length - 1; i++) if (L[i].r - L[i].l < el.clientWidth * 0.35) return true; }
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const t = n.nodeValue; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c !== ' ' && c !== '\u00A0') continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const b = r.getBoundingClientRect(); if (!b.width || b.top >= lastTop - 2) continue; if (b.width > fs * 1.15) big++; else if (b.width > fs * 0.9) mid++; } }
    return big > 0 || mid >= 2;
  }
  function check(el) {
    if (!el || !el.isConnected || !el.offsetParent) return;
    const w = el.clientWidth, s = sig(el), m = memo.get(el);
    if (m && m.w === w && m.s === s) { el.classList.toggle('twr', m.res === 'twr'); el.classList.toggle('rag', m.res === 'rag'); return; }
    el.classList.remove('rag', 'twr'); let res = 'ok';
    if (getComputedStyle(el).textAlign === 'justify' && bad(el)) { el.classList.add('twr'); res = 'twr'; if (bad(el, true)) { el.classList.remove('twr'); el.classList.add('rag'); res = 'rag'; } }
    memo.set(el, { w, s, res });
  }
  return { check };
})();

const RAG = (() => {
  const SEL = 'main p, main li, main .vs > div, main .rv, main .note, main .verdict, main .tlx, footer p, .hero-lead';
  const check = (el) => RAG3.check(el);
  const run = () => $$(SEL).forEach(e => { if (e.offsetParent || e.closest('.vmodal')) check(e); });
  let tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(run, 250); });
  document.addEventListener('click', () => { clearTimeout(tm); tm = setTimeout(run, 120); });
  return { run };
})();
GUARD.start();
setTimeout(() => RAG.run(), 400);
{ const iv = setInterval(() => { if (window.__fmtHyphReady) { clearInterval(iv); requestAnimationFrame(() => { RAG.run(); window.__ragDone = true; }); } }, 100); setTimeout(() => clearInterval(iv), 8000); }
