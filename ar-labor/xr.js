// AR Labor – saját WebXR AR-nézet (Android, Chrome + ARCore).
// Menet: felület keresése → a padlón vagy asztalon egy keret mutatja, hová és mekkorában kerül a modell → koppintásra lekerül,
// és horgonyhoz kötve a helyén marad (el lehet távolodni tőle, körbe lehet járni) → két ujjal nagyítás és forgatás, egy ujjal forgatás.
// Gombok: áthelyezés, eredeti méret, a modell animációja elölről, feliratok, kilépés. A munkamenetet az oldal kéri (felhasználói gesztusból),
// ez a modul csak átveszi: run(session, opciók).
import * as THREE from 'three';
import { GLTFLoader } from './vendor/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from './vendor/jsm/environments/RoomEnvironment.js';

const LIME = 0xffb23e;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export async function run(session, o) {
  const ui = o.ui, $ = (s) => ui.querySelector(s), T = o.T, ac = new AbortController(), sig = ac.signal; // a felület eseményei a munkamenet végén leválnak
  const msg = $('#xrMsg'), msgT = $('#xrMsg span'), bot = $('#xrBot'), sizeEl = $('#xrSize');
  $('#xrTitle').textContent = o.title;
  const say = (k, txt) => { msg.dataset.k = k; msgT.textContent = txt; msg.classList.remove('off'); };
  let msgTimer = 0; const sayFor = (k, txt, ms) => { say(k, txt); clearTimeout(msgTimer); msgTimer = setTimeout(() => msg.classList.add('off'), ms); };

  // ---- megjelenítő ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local');
  renderer.domElement.className = 'xr-canvas'; document.body.appendChild(renderer.domElement);
  await renderer.xr.setSession(session);

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.01, 60);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.8;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015;
  scene.add(sun, sun.target);

  // ---- a modell tartója: hely (horgony) → forgatás → méret → modell ----
  const holder = new THREE.Group(), spin = new THREE.Group(), scaler = new THREE.Group(); holder.add(spin); spin.add(scaler); scene.add(holder); holder.visible = false;
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.32 })); catcher.rotation.x = -Math.PI / 2; catcher.position.y = 0.0015; catcher.receiveShadow = true; scaler.add(catcher);
  let model = null, mixer = null, clips = [], size = new THREE.Vector3(0.6, 0.2, 0.4), labelsOn = !!o.labels, loadingUrl = null;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  async function loadModel(url) {
    loadingUrl = url; const g = await loader.loadAsync(url); if (loadingUrl !== url) return;
    const t = mixer ? mixer.time : 0;
    if (model) { scaler.remove(model); model.traverse((n) => { if (n.isMesh) { n.geometry.dispose(); } }); }
    model = g.scene; const bb = new THREE.Box3().setFromObject(model), c = bb.getCenter(new THREE.Vector3()); bb.getSize(size);
    model.position.set(-c.x, -bb.min.y, -c.z); model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = !n.material.transparent; } });
    scaler.add(model); catcher.scale.set(size.x * 1.5, size.z * 1.5, 1);
    clips = g.animations || []; mixer = clips.length ? new THREE.AnimationMixer(model) : null; if (mixer) { for (const cl of clips) mixer.clipAction(cl).play(); mixer.setTime(t); }
    $('#xrAct').hidden = !clips.length; fitFrame();
  }
  const ready = loadModel(labelsOn ? o.urlLabels : o.url).catch((e) => { say('err', T.loadErr); throw e; });

  // ---- célkeret a felületen: gyűrű + a modell valós méretű körvonala ----
  const reticle = new THREE.Group(); reticle.visible = false; scene.add(reticle);
  const rMat = new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.95, depthTest: false }), fMat = new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.14, depthTest: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.042, 40), rMat); ring.rotation.x = -Math.PI / 2; reticle.add(ring);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.008, 20), rMat); dot.rotation.x = -Math.PI / 2; reticle.add(dot);
  const frame = new THREE.Group(); reticle.add(frame);
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fMat); fill.rotation.x = -Math.PI / 2; frame.add(fill);
  const edges = []; for (let i = 0; i < 4; i++) { const e = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), rMat); e.rotation.x = -Math.PI / 2; frame.add(e); edges.push(e); }
  const arrow = new THREE.Mesh(new THREE.CircleGeometry(0.02, 3), rMat); arrow.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); frame.add(arrow); // a modell eleje (a néző felé)
  for (const m of [ring, dot, fill, arrow, ...edges]) m.renderOrder = 10;
  function fitFrame() { const s = scaler.scale.x, w = size.x * s, d = size.z * s, th = clamp(Math.max(w, d) * 0.012, 0.004, 0.02);
    fill.scale.set(w, d, 1); edges[0].scale.set(w, th, 1); edges[0].position.set(0, 0, -d / 2); edges[1].scale.set(w, th, 1); edges[1].position.set(0, 0, d / 2);
    edges[2].scale.set(th, d, 1); edges[2].position.set(-w / 2, 0, 0); edges[3].scale.set(th, d, 1); edges[3].position.set(w / 2, 0, 0);
    arrow.position.set(0, 0, d / 2 + 0.035); arrow.scale.setScalar(clamp(Math.max(w, d) * 0.06, 0.6, 1.6)); }

  // ---- találatvizsgálat ----
  const refSpace = renderer.xr.getReferenceSpace();
  const viewerSpace = await session.requestReferenceSpace('viewer');
  const hitSource = await session.requestHitTestSource({ space: viewerSpace });
  let state = 'scan', lastHit = null, lastHitT = 0, anchor = null, pending = false, dropT = -1;
  const hitPos = new THREE.Vector3(), tmpM = new THREE.Matrix4(), camPos = new THREE.Vector3(); let yaw = 0, haveRet = false;
  say('scan', T.scan);

  async function place() {
    if (!model) { pending = true; say('load', T.loading); try { await ready; } catch (e) { return; } pending = false; if (state !== 'aim') return; }
    holder.position.copy(reticle.position); holder.rotation.set(0, yaw, 0); holder.visible = true; reticle.visible = false; state = 'placed';
    if (anchor) { try { anchor.delete(); } catch (e) {} anchor = null; }
    if (lastHit && lastHit.createAnchor) lastHit.createAnchor().then((a) => { if (state === 'placed') anchor = a; else try { a.delete(); } catch (e) {} }).catch(() => {});
    dropT = performance.now(); try { navigator.vibrate && navigator.vibrate(25); } catch (e) {}
    bot.hidden = false; sayFor('placed', T.placed, 5000); updateSun();
  }
  function replace() { if (anchor) { try { anchor.delete(); } catch (e) {} anchor = null; } holder.visible = false; state = 'scan'; haveRet = false; bot.hidden = true; say('scan', T.scan); }
  session.addEventListener('select', () => { if ((state === 'aim') && !pending) place(); });
  ui.addEventListener('beforexrselect', (e) => { if (e.target.closest('button')) e.preventDefault(); }, { signal: sig });

  // ---- gombok ----
  $('#xrExit').onclick = () => session.end();
  $('#xrMove').onclick = replace;
  $('#xrReset').onclick = () => { scaler.scale.setScalar(1); spin.rotation.y = 0; fitFrame(); updateSun(); showSize(); };
  $('#xrAct').onclick = () => { if (mixer) { mixer.setTime(0); } };
  $('#xrLbl').setAttribute('aria-pressed', String(labelsOn));
  $('#xrLbl').onclick = () => { labelsOn = !labelsOn; $('#xrLbl').setAttribute('aria-pressed', String(labelsOn)); loadModel(labelsOn ? o.urlLabels : o.url).catch(() => {}); };

  // ---- érintés: két ujj = nagyítás + forgatás, egy ujj vízszintesen = forgatás ----
  let g0 = null;
  const pts = (e) => Array.from(e.touches).map((t) => [t.clientX, t.clientY]);
  function showSize() { const m = Math.max(size.x, size.z) * scaler.scale.x; sizeEl.textContent = m >= 1 ? (m.toFixed(1).replace('.', T.dec) + ' m') : (Math.round(m * 100) + ' cm'); sizeEl.classList.add('on'); clearTimeout(showSize.t); showSize.t = setTimeout(() => sizeEl.classList.remove('on'), 1200); }
  ui.addEventListener('touchstart', (e) => { if (state !== 'placed' || e.target.closest('button')) { g0 = null; return; } const p = pts(e);
    g0 = { n: p.length, p, s: scaler.scale.x, r: spin.rotation.y, d: p.length > 1 ? Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]) : 0, a: p.length > 1 ? Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]) : 0 }; }, { passive: true, signal: sig });
  ui.addEventListener('touchmove', (e) => { if (!g0 || state !== 'placed') return; const p = pts(e);
    if (p.length > 1 && g0.n > 1) { const d = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), a = Math.atan2(p[1][1] - p[0][1], p[1][0] - p[0][0]);
      scaler.scale.setScalar(clamp(g0.s * d / Math.max(g0.d, 1), 0.08, 12)); spin.rotation.y = g0.r - (a - g0.a); fitFrame(); updateSun(); showSize(); }
    else if (p.length === 1 && g0.n === 1) spin.rotation.y = g0.r + (p[0][0] - g0.p[0][0]) * 0.012;
    if (e.cancelable) e.preventDefault(); }, { passive: false, signal: sig });
  ui.addEventListener('touchend', (e) => { if (!g0) return; if (e.touches.length === 0) g0 = null; else { const p = pts(e); g0 = { n: p.length, p, s: scaler.scale.x, r: spin.rotation.y, d: 0, a: 0 }; } }, { passive: true, signal: sig });

  function updateSun() { const s = Math.max(size.x, size.z, size.y) * scaler.scale.x; const c = holder.position;
    sun.position.set(c.x + s * 0.7, c.y + s * 1.6, c.z + s * 0.9); sun.target.position.copy(c); const sc = sun.shadow.camera; const r = s * 0.9;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 0.01; sc.far = s * 5; sc.updateProjectionMatrix(); }

  // ---- képkockák ----
  const clock = new THREE.Clock();
  renderer.setAnimationLoop((t, frameXR) => {
    const dt = Math.min(clock.getDelta(), 0.1); if (mixer && holder.visible) mixer.update(dt);
    if (!frameXR) { renderer.render(scene, camera); return; }
    const xc = renderer.xr.getCamera(); xc.getWorldPosition(camPos);
    if (state !== 'placed') {
      const hits = frameXR.getHitTestResults(hitSource); let ok = false;
      if (hits.length) { const pose = hits[0].getPose(refSpace); if (pose) { tmpM.fromArray(pose.transform.matrix); const up = new THREE.Vector3().setFromMatrixColumn(tmpM, 1);
          if (up.y > 0.8) { ok = true; lastHit = hits[0]; lastHitT = t; hitPos.setFromMatrixPosition(tmpM); } } }
      if (ok) { const want = Math.atan2(camPos.x - hitPos.x, camPos.z - hitPos.z);
        if (!haveRet) { reticle.position.copy(hitPos); yaw = want; haveRet = true; } else { reticle.position.lerp(hitPos, 0.35); let dy = want - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); yaw += dy * 0.2; }
        reticle.rotation.set(0, yaw + spin.rotation.y, 0); reticle.visible = true; const pulse = 1 + 0.08 * Math.sin(t / 220); ring.scale.setScalar(pulse);
        if (state !== 'aim') { state = 'aim'; say('aim', T.aim); } }
      else if (t - lastHitT > 600) { reticle.visible = false; haveRet = false; if (state !== 'scan') { state = 'scan'; say('scan', T.scan); } }
    } else {
      if (anchor && frameXR.trackedAnchors && frameXR.trackedAnchors.has(anchor)) { const ap = frameXR.getPose(anchor.anchorSpace, refSpace); if (ap) { holder.position.set(ap.transform.position.x, ap.transform.position.y, ap.transform.position.z); updateSun(); } }
      if (dropT >= 0) { const k = clamp((performance.now() - dropT) / 380, 0, 1), e = 1 - Math.pow(1 - k, 3); spin.position.y = (1 - e) * 0.06; holder.scale.setScalar(0.92 + 0.08 * e); if (k >= 1) dropT = -1; }
    }
    renderer.render(scene, camera);
  });

  // ---- vége ----
  session.addEventListener('end', () => {
    ac.abort(); renderer.setAnimationLoop(null); try { hitSource.cancel(); } catch (e) {} if (anchor) try { anchor.delete(); } catch (e) {}
    scene.traverse((n) => { if (n.isMesh) { n.geometry.dispose(); } }); pm.dispose(); renderer.dispose(); renderer.domElement.remove();
    clearTimeout(msgTimer); bot.hidden = true; o.onEnd && o.onEnd();
  }, { once: true });
  ready.catch(() => {});
}
