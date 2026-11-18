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
const BGX = (() => { try { const v = JSON.parse($('#bgdata').textContent); return { tests: v.tests || {}, packs: v.packs || {}, heroes: v.heroes || {} }; } catch (e) { return { tests: {}, packs: {}, heroes: {} }; } })();
const AB_KEY = 'zg-ab';
const AB = (() => { try { const v = JSON.parse(localStorage.getItem(AB_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } })();
let bgForce = (() => { try { const v = (new URLSearchParams(location.search).get('ozadje') || '').toUpperCase(); return /^[A-Z]$/.test(v) ? v : null; } catch (e) { return null; } })();
// Nastavitve → Razvoj → Kakovost slik: 'auto' (the default) leaves the choice to the A/B test, as before. 'high' shows the
// Codex parallax pack of the sunset (B) where the test would show A. 'low' shows the picture already in the game (A)
// where the test would show the sunset (B). Winter (D) has no low picture yet, so it stays high. Martin Krpan follows the
// same choice, but only 'high' changes him (see below); 'auto' and 'low' keep the sprite already in the game.
const FID_KEY = 'zg-fidelity';
const fidelity = () => { try { const v = localStorage.getItem(FID_KEY); return v === 'high' || v === 'low' ? v : 'auto'; } catch (e) { return 'auto'; } };
const setFidelity = v => { try { if (v === 'high' || v === 'low') localStorage.setItem(FID_KEY, v); else localStorage.removeItem(FID_KEY); } catch (e) { /* no storage */ } applyHeroFidelity(); };
const bgPack = (key, v) => { const t = BGX.tests[key], id = t && t.variants && t.variants[v]; return id ? BGX.packs[id] || null : null; };
const bgReady = (key, v) => v === 'A' || !!bgPack(key, v);
const bgForced = key => !!(bgForce && BGX.tests[key] && bgReady(key, bgForce));
// ---------------------------------------------------------------- Martin Krpan in Visoka (Codex's pack, art/manifests/martin-krpan.json)
// BGX.heroes.krpan (build.py): `strip` is the 96×48 idle | attack picture, which replaces SPRITES.krpan so every card, portrait
// and the codex shows him; `sheet` holds the frames, one row a sequence (tools/art_krpan_sheet.py), which the battle, the road
// and the hero screens play (game.css .spr.hi). The skills follow the revised specification (docs/characters/martin-krpan):
// skill 1 Lipov kij, skill 2 Kmečka moč with rank 1, 2, 3 = two punches, salt sacks, boulder, skill 3 Mesarica.
// Running and victory frames are not delivered yet: the road and the victory use a hop in place (game.css hop).
const HERO_SEQ = { krpan: { idle: 'idle', 1: ['cudgel-strike'], 2: ['kmecka-moc-r1-double-punch', 'kmecka-moc-r2-salt-sacks', 'kmecka-moc-r3-boulder'], 3: ['mesarica-slash'] } };
const heroHi = id => fidelity() === 'high' && !!BGX.heroes[id];
const HERO_LOW = {};   // the sprites already in the game, to go back to
function applyHeroFidelity() { Object.keys(BGX.heroes).forEach(id => { if (!(id in HERO_LOW)) HERO_LOW[id] = SPRITES[id]; SPRITES[id] = heroHi(id) ? BGX.heroes[id].strip : HERO_LOW[id]; }); }
// the sheet row for skill `tier` at `rank` (1–3), or null when the hero has no frames for it
function heroSeqRow(id, tier, rank) {
  const H = BGX.heroes[id], list = HERO_SEQ[id] && HERO_SEQ[id][tier];
  const s = H && list && H.seqs[list[Math.min(list.length, Math.max(1, +rank || 1)) - 1]];
  return s ? s.row : null;
}
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
// for src/stats.js: ozadje-ptuj=B, or B(predogled) when the address chose it
const bgStatTags = () => Object.keys(BGX.tests).map(k => `ozadje-${k}=${bgVariant(k)}${bgForced(k) ? '(predogled)' : ''}`);

applyHeroFidelity();
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
function bgPlace(M, camX, progress, now) {
  const sc = M.scene, W = sc.clientWidth, H = sc.clientHeight;
  if (!H || !W) return;
  const P = M.P, s = Math.max(H / P.canvas.h, W / P.canvas.w), cw = P.canvas.w * s, c0 = (W - cw) / 2, oy = H - P.canvas.h * s;
  const t = bgMotion() ? now / 1000 : 0;
  M.size = W + 'x' + H;
  M.els.forEach((el, i) => {
    const L = P.layers[i], k = L.scale || 1, tw = Math.round(L.w * k * s);   // the tile as the browser repeats it
    let x = camX == null ? c0 : L.tileX ? c0 - camX * L.speed : c0 - Math.max(0, cw - W) / 2 * clamp(progress, 0, 1) * (L.pan == null ? 1 : L.pan);
    x += L.x * s;
    if (L.tileX) { x -= L.drift * s * t; x = ((x % tw) + tw) % tw - tw; }   // the same tile, kept near zero so the numbers stay small
    el.style.backgroundSize = `${tw}px ${Math.round(L.h * k * s)}px`;
    el.style.backgroundPosition = `${Math.round(x)}px ${Math.round(oy + L.y * s)}px`;
    el.style.imageRendering = k * s >= 1 ? 'pixelated' : 'auto';
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
