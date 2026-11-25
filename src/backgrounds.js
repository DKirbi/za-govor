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
const BGX = (() => { try { const v = JSON.parse($('#bgdata').textContent); return { tests: v.tests || {}, packs: v.packs || {}, cards: v.cards || {}, cardTest: v.cardTest || null }; } catch (e) { return { tests: {}, packs: {}, cards: {}, cardTest: null }; } })();
const AB_KEY = 'zg-ab';
const AB = (() => { try { const v = JSON.parse(localStorage.getItem(AB_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } })();
let bgForce = (() => { try { const v = (new URLSearchParams(location.search).get('ozadje') || '').toUpperCase(); return /^[A-Z]$/.test(v) ? v : null; } catch (e) { return null; } })();
// Nastavitve → Razvoj → Kakovost slik: 'auto' (the default) leaves the choice to the A/B test, as before. 'high' shows
// variant B where the test would show A: in every region with one, Codex's folk parallax pack (25 Nov 2026; on Ptuj the
// sunset pack moved to E). 'low' shows the picture already in the game (A) where the test would show B. Winter (D) has
// no low picture yet, so it stays high. The painted skill cards follow the same choice (below). Heroes and enemies are not
// part of it: every quality draws their pixel sprites (SPRITES), as Krpan does again since 0.21.0 (Game Director, 25 Nov 2026).
const FID_KEY = 'zg-fidelity';
const fidelity = () => { try { const v = localStorage.getItem(FID_KEY); return v === 'high' || v === 'low' ? v : 'auto'; } catch (e) { return 'auto'; } };
const setFidelity = v => { try { if (v === 'high' || v === 'low') localStorage.setItem(FID_KEY, v); else localStorage.removeItem(FID_KEY); } catch (e) { /* no storage */ } };
const bgPack = (key, v) => { const t = BGX.tests[key], id = t && t.variants && t.variants[v]; return id ? BGX.packs[id] || null : null; };
const bgReady = (key, v) => v === 'A' || !!bgPack(key, v);
const bgForced = key => !!(bgForce && BGX.tests[key] && bgReady(key, bgForce));
// The variant the fidelity choice shows in place of v (the test's or the address's). Winter (D) and the preview C stay as chosen.
const fidVariant = (key, v) => {
  const f = fidelity();
  if (f === 'low' && v === 'B') return 'A';
  if (f === 'high' && v === 'A' && bgReady(key, 'B')) return 'B';
  return v;
};
function bgDraw(share, vs) {
  const w = vs.map(v => Math.max(0, +((share || {})[v]) || 0)), sum = w.reduce((a, b) => a + b, 0);
  if (!sum) return vs[rnd(vs.length)];
  let r = Math.random() * sum;
  for (let i = 0; i < vs.length; i++) { r -= w[i]; if (r < 0) return vs[i]; }
  return vs[vs.length - 1];
}
function bgTestVariant(key) {
  const t = BGX.tests[key];
  if (!t) return 'A';
  if (bgForced(key)) return bgForce;
  if (!t.live) return 'A';
  const vs = ['A', ...Object.keys(t.variants || {})];
  if (!vs.every(v => bgReady(key, v))) return 'A';   // a variant missing from the build: the test is not running, nobody is assigned
  if (!vs.includes(AB[key])) { AB[key] = bgDraw(t.share, vs); try { localStorage.setItem(AB_KEY, JSON.stringify(AB)); } catch (e) { /* no storage: drawn again next visit */ } }
  return AB[key];
}
const bgVariant = key => fidVariant(key, bgTestVariant(key));
// ---------------------------------------------------------------- Codex's painted skill cards (BGX.cards, "hero:tier"; Game Director, 25 Nov 2026)
// An A/B test like the backgrounds: A = the hand-made SVG boards in battle, B = the paintings. data/backgrounds.json
// cardTest {live, share}; ?karte=A or ?karte=B previews one; Kakovost slik: Nizka keeps A, Visoka shows B. The hero
// screen's collection always shows the paintings: they are the reward. Only heroes with a painting change.
let cardForce = (() => { try { const v = (new URLSearchParams(location.search).get('karte') || '').toUpperCase(); return v === 'A' || v === 'B' ? v : null; } catch (e) { return null; } })();
const cardsBuilt = () => Object.keys(BGX.cards).length > 0;
function cardTestVariant() {
  const t = BGX.cardTest;
  if (!cardsBuilt()) return 'A';
  if (cardForce) return cardForce;
  if (!t || !t.live) return 'A';
  if (!['A', 'B'].includes(AB.karte)) { AB.karte = bgDraw(t.share, ['A', 'B']); try { localStorage.setItem(AB_KEY, JSON.stringify(AB)); } catch (e) { /* no storage */ } }
  return AB.karte;
}
const cardVariant = () => { const f = fidelity(); return f === 'low' ? 'A' : f === 'high' && cardsBuilt() ? 'B' : cardTestVariant(); };
// the painting for a battle card, or null (variant A, a foe, a hero without one)
const cardPainting = (id, tier) => cardVariant() === 'B' ? BGX.cards[`${id}:${tier}`] || null : null;
// for src/stats.js: ozadje-ptuj=B, or B(predogled) when the address chose it; karte=B for the skill-card test
const bgStatTags = () => Object.keys(BGX.tests).map(k => `ozadje-${k}=${bgVariant(k)}${bgForced(k) ? '(predogled)' : ''}`)
  .concat(cardsBuilt() ? [`karte=${cardVariant()}${cardForce ? '(predogled)' : ''}`] : []);

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
// Where each layer's picture sits. The pack's canvas is fitted to the scene: to its height, or to its width when the
// scene is wider than the canvas (a short window), then kept on the scene's bottom, where the actors stand. Every
// layer is registered on that canvas (x, y and its own scale, in canvas pixels) and the canvas is centred, as in battle.
// camX = how far the walk has gone in CSS pixels (travel): a tiling layer scrolls camX × its speed; a layer that does
// not tile pans once across the region with progress, from the centre towards its right edge × its pan (1 = all the
// way), so it never shows an edge. camX null = a still scene (battle, gallery). A picture drawn at least at its own
// size keeps hard pixel edges (pixel art); a larger picture shrunk to the scene is smoothed instead of aliased.
// Where the ground must reach in a scene, in CSS pixels from its top: `feet`, the highest feet of every hero, enemy
// and object on the road, and `neck`, the highest hero neck (`neck` of the sprite's height from its top). From layout
// boxes: offsets ignore the transforms of attacks and running, so the ground does not jump with them. null when
// nobody stands in the scene (the gallery).
function actorFloor(sc, neck) {
  let feet = null, nk = null, low = null;
  sc.querySelectorAll(':scope > .party .spr, :scope > .enemies .spr, :scope > .tv-objs > .tv-obj').forEach(el => {
    let y = 0, n = el;
    while (n && n !== sc) { y += n.offsetTop; n = n.offsetParent; }
    const h = el.offsetHeight;
    if (n !== sc || !h) return;
    if (feet === null || y + h < feet) feet = y + h;
    if (low === null || y + h > low) low = y + h;
    if (neck != null && el.closest('.party') && (nk === null || y + h * neck < nk)) nk = y + h * neck;
  });
  return feet === null ? null : { feet, neck: nk, low };
}
const floorKey = f => f ? `${f.feet}|${f.neck}|${f.low}` : '';
// the layers that follow the actors: a ground with `stand`, a low front layer with `below` (its top kept `below` canvas
// pixels under the lowest feet, so near rocks and grass never cover a foot or the status lines under the enemies)
const floorLayer = P => P.layers.find(L => L.stand != null || L.below != null);
const floorNeck = P => { const G = P.layers.find(L => L.stand != null); return G ? G.neck : undefined; };
function bgPlace(M, camX, progress, now) {
  const sc = M.scene, W = sc.clientWidth, H = sc.clientHeight;
  if (!H || !W) return;
  M.floor = floorLayer(M.P) ? actorFloor(sc, floorNeck(M.P)) : null;
  // focusY: where a scene wider than the view crops it (1 = keeps its bottom, as before; less keeps more of the top, so a
  // wide desktop scene still shows the landmark — the ground follows the actors' feet anyway)
  const P = M.P, s = Math.max(H / P.canvas.h, W / P.canvas.w), cw = P.canvas.w * s, c0 = (W - cw) / 2, oy = (H - P.canvas.h * s) * (P.focusY ?? 1);
  const t = bgMotion() ? now / 1000 : 0;
  M.size = W + 'x' + H;
  M.els.forEach((el, i) => {
    const L = P.layers[i], k = L.scale || 1, tw = Math.round(L.w * k * s);   // the tile as the browser repeats it
    let x = camX == null ? c0 : L.tileX ? c0 - camX * L.speed : c0 - Math.max(0, cw - W) / 2 * clamp(progress, 0, 1) * (L.pan == null ? 1 : L.pan);
    x += L.x * s;
    if (L.tileX) { x -= L.drift * s * t; x = ((x % tw) + tw) % tw - tw; }   // the same tile, kept near zero so the numbers stay small
    // a ground layer with `stand` follows the characters: its top `stand` canvas pixels above the highest feet, or at
    // the heroes' necks if that is higher, so they walk on it with their heads against what lies behind; it repeats
    // downwards (clipped above its top) so it reaches the bottom on any screen
    // (riseOnly: a painted lane only rises from where its picture puts it, never sinks below it and opens a gap above)
    const F = L.stand != null && M.floor;
    let y = F ? Math.min(F.feet - L.stand * s, F.neck ?? Infinity, L.riseOnly ? oy + L.y * s : Infinity) : oy + L.y * s;
    if (L.below != null && M.floor) y = Math.max(y, M.floor.low + L.below * s);
    el.style.backgroundSize = `${tw}px ${Math.round(L.h * k * s)}px`;
    el.style.backgroundPosition = `${Math.round(x)}px ${Math.round(y)}px`;
    if (L.stand != null) { el.style.backgroundRepeat = 'repeat'; el.style.clipPath = `inset(${Math.max(0, Math.round(y))}px 0 0 0)`; }
    el.style.imageRendering = k * s >= 1 ? 'pixelated' : 'auto';
  });
}
// still scenes are placed again when their size changes (fit to screen, rotating a phone) and, with drifting layers, every frame
const BG_STILL = new Set();
(function bgFrame(now) {
  BG_STILL.forEach(M => {
    if (!M.scene.isConnected) { BG_STILL.delete(M); return; }
    const drifts = bgMotion() && M.P.layers.some(L => L.tileX && L.drift);
    // placed again when the characters' feet move: they arrive after the layers, and a status line under an enemy lifts it
    const moved = floorLayer(M.P) && floorKey(actorFloor(M.scene, floorNeck(M.P))) !== floorKey(M.floor);
    if (drifts || moved || M.size !== M.scene.clientWidth + 'x' + M.scene.clientHeight) bgPlace(M, null, 0, now);
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
