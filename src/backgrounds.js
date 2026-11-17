// ============================================================ background variants for A/B tests
// data/backgrounds.json names the region backgrounds being compared. Variant A is always the art in use (BG, from
// tools/art_extra.py), drawn exactly as before. A pack variant is a layered parallax background: its files, sizes
// and back-to-front order come from the pack's manifest (art/manifests/<pack>.json, by the art's author), and
// build.py builds it in only when every layer file is committed. Until then only A exists and nothing changes.
// Which variant a player sees:
//   ?ozadje=A or ?ozadje=B in the address: that one, for this visit (a preview; the statistics mark it)
//   a test with "live": true: one variant per install, drawn by "share" and kept in localStorage zg-ab
//   otherwise: A
// The variant goes into the tester statistics (src/stats.js), so the rows of A and B can be compared.
const BGX = (() => { try { const v = JSON.parse($('#bgdata').textContent); return { tests: v.tests || {}, packs: v.packs || {} }; } catch (e) { return { tests: {}, packs: {} }; } })();
const AB_KEY = 'zg-ab';
const AB = (() => { try { const v = JSON.parse(localStorage.getItem(AB_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } })();
let bgForce = (() => { try { const v = (new URLSearchParams(location.search).get('ozadje') || '').toUpperCase(); return /^[A-Z]$/.test(v) ? v : null; } catch (e) { return null; } })();
const bgPack = (key, v) => { const t = BGX.tests[key], id = t && t.variants && t.variants[v]; return id ? BGX.packs[id] || null : null; };
const bgReady = (key, v) => v === 'A' || !!bgPack(key, v);
const bgForced = key => !!(bgForce && BGX.tests[key] && bgReady(key, bgForce));
function bgDraw(share, vs) {
  const w = vs.map(v => Math.max(0, +((share || {})[v]) || 0)), sum = w.reduce((a, b) => a + b, 0);
  if (!sum) return vs[rnd(vs.length)];
  let r = Math.random() * sum;
  for (let i = 0; i < vs.length; i++) { r -= w[i]; if (r < 0) return vs[i]; }
  return vs[vs.length - 1];
}
function bgVariant(key) {
  const t = BGX.tests[key];
  if (!t) return 'A';
  if (bgForced(key)) return bgForce;
  if (!t.live) return 'A';
  const vs = ['A', ...Object.keys(t.variants || {})];
  if (!vs.every(v => bgReady(key, v))) return 'A';   // a variant missing from the build: the test is not running, nobody is assigned
  if (!vs.includes(AB[key])) { AB[key] = bgDraw(t.share, vs); try { localStorage.setItem(AB_KEY, JSON.stringify(AB)); } catch (e) { /* no storage: drawn again next visit */ } }
  return AB[key];
}
// for src/stats.js: ozadje-ptuj=B, or B(predogled) when the address chose it
const bgStatTags = () => Object.keys(BGX.tests).map(k => `ozadje-${k}=${bgVariant(k)}${bgForced(k) ? '(predogled)' : ''}`);

const bgMotion = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
// The pack's layers in a scene (travel, battle, gallery), or null for variant A, whose scene keeps its one background.
// Layers behind the actors go first, under the same dimming variant A gets in that scene; a foreground layer goes
// in front of the actors but under the battle UI (game.css: .scene.pbg).
function bgLayers(scene, key, where) {
  const v = bgVariant(key), P = v === 'A' ? null : bgPack(key, v);
  if (!P || !scene) return null;
  const els = P.layers.map(L => h('i', { class: 'pbg-l' + (L.tileX ? ' tx' : '') + (L.front ? ' front' : ''), 'data-layer': L.id, 'aria-hidden': 'true',
    style: { 'background-image': `url(${L.src})` } }));
  const back = els.filter((el, i) => !P.layers[i].front), front = els.filter((el, i) => P.layers[i].front);
  const dim = { battle: 'linear-gradient(rgba(14,16,26,.36), rgba(14,16,26,.16))', travel: 'linear-gradient(rgba(14,16,26,.2), rgba(14,16,26,.05))' }[where];
  scene.style.removeProperty('background-image');
  scene.classList.add('pbg'); scene.classList.toggle('pbg-noroad', !!P.hideRoad);
  scene.prepend(...back, ...(dim ? [h('i', { class: 'pbg-dim', 'aria-hidden': 'true', style: { 'background-image': dim } })] : []));
  scene.append(...front);
  const M = { key, v, P, els, scene, where, size: '' };
  if (where !== 'travel') { bgPlace(M, null, 0, performance.now()); BG_STILL.add(M); }   // the road places its layers in layoutTravel
  return M;
}
// Where each layer's picture sits: the pack's canvas scaled to the scene height with whole pixels kept sharp (as
// variant A), every layer registered on that canvas and centred, as in battle. camX = how far the walk has gone in
// CSS pixels (travel): a tiling layer scrolls camX × its speed; a layer that does not tile pans once across the
// region with progress, from the centre towards its right edge × its pan (1 = all the way), so it never shows an
// edge. camX null = a still scene (battle, gallery).
function bgPlace(M, camX, progress, now) {
  const sc = M.scene, W = sc.clientWidth, H = sc.clientHeight;
  if (!H || !W) return;
  const P = M.P, s = H / P.canvas.h, cw = P.canvas.w * s, c0 = (W - cw) / 2, t = bgMotion() ? now / 1000 : 0;
  M.size = W + 'x' + H;
  M.els.forEach((el, i) => {
    const L = P.layers[i], tw = Math.round(L.w * s);   // the tile as the browser repeats it
    let x = camX == null ? c0 : L.tileX ? c0 - camX * L.speed : c0 - Math.max(0, cw - W) / 2 * clamp(progress, 0, 1) * (L.pan == null ? 1 : L.pan);
    x += L.x * s;
    if (L.tileX) { x -= L.drift * s * t; x = ((x % tw) + tw) % tw - tw; }   // the same tile, kept near zero so the numbers stay small
    el.style.backgroundSize = `${tw}px ${Math.round(L.h * s)}px`;
    el.style.backgroundPosition = `${Math.round(x)}px ${Math.round(L.y * s)}px`;
  });
}
// still scenes are placed again when their size changes (fit to screen, rotating a phone) and, with drifting layers, every frame
const BG_STILL = new Set();
(function bgFrame(now) {
  BG_STILL.forEach(M => {
    if (!M.scene.isConnected) { BG_STILL.delete(M); return; }
    const drifts = bgMotion() && M.P.layers.some(L => L.tileX && L.drift);
    if (drifts || M.size !== M.scene.clientWidth + 'x' + M.scene.clientHeight) bgPlace(M, null, 0, now);
  });
  requestAnimationFrame(bgFrame);
})(performance.now());
// Liki in karte → Ozadja: each built pack variant next to the pictures of variant A
function bgGalleryFigures() {
  const out = [];
  Object.entries(BGX.tests).forEach(([key, t]) => Object.keys(t.variants || {}).forEach(v => {
    const P = bgPack(key, v); if (!P) return;
    const box = h('div', { class: 'gpbg', style: { 'aspect-ratio': `${P.canvas.w} / ${P.canvas.h}` } });
    const M = { key, v, P, els: [], scene: box, where: 'gallery', size: '' };
    M.els = P.layers.map(L => h('i', { class: 'pbg-l' + (L.tileX ? ' tx' : ''), 'data-layer': L.id, style: { 'background-image': `url(${L.src})` } }));
    box.append(...M.els); BG_STILL.add(M);
    out.push(h('figure', {}, box, `${P.name} — različica ${v}${P.status === 'approved' ? '' : ' (v pregledu)'}`));
  }));
  return out;
}
