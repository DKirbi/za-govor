// Background A/B tests (src/backgrounds.js, data/backgrounds.json): variant A is the background in use and stays
// exactly as it was; a pack variant draws a layered parallax background on the road and in battle.
// No art pack is committed yet, so the pack variant is checked with a synthetic test pack drawn on a canvas in
// the page: flat colour bands, not artwork. They only prove the wiring (order, registration, scrolling, drift,
// foreground, the A/B draw and the statistics), never what the real Ptuj layers will look like.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Background variants (A/B tests)');

// a 480×120 test canvas: sky, drifting clouds, hills, a town that does not tile, a road and a foreground strip
const TEST_PACK = () => {
  const png = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); return c.toDataURL('image/png'); };
  const band = (col, stripe) => (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); if (stripe) { g.fillStyle = stripe; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 8, h); } };
  const L = (id, w, h, x, y, tileX, speed, more = {}) => ({ id, w, h, x, y, tileX, speed, drift: 0, front: false, ...more, src: png(w, h, more.paint || band('#888')) });
  return { name: 'TEST', version: 'test', status: 'draft', canvas: { w: 480, h: 120 }, hideRoad: true, layers: [
    L('sky', 480, 120, 0, 0, true, 0, { paint: band('#3a3a7a') }),
    L('clouds', 200, 30, 0, 8, true, 0.03, { drift: 3, paint: (g, w, h) => { g.fillStyle = '#ddd'; g.fillRect(20, 6, 60, 14); g.fillRect(120, 10, 50, 12); } }),
    L('distant-hills', 480, 50, 0, 50, true, 0.06, { paint: band('#5a4a8a', '#4a3a7a') }),
    L('town', 480, 40, 0, 62, false, 0.22, { paint: band('#c86', '#a64') }),
    L('road-tile', 64, 22, 0, 98, true, 1, { paint: band('#a98', '#876') }),
    L('fg', 80, 10, 0, 110, true, 1, { front: true, paint: band('#3a5', '#294') }),
  ] };
};
const mod = (x, tw) => ((x % tw) + tw) % tw - tw;

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const sceneInfo = () => ev(() => { const sc = document.querySelector('.scene'); if (!sc) return null;
    const st = getComputedStyle(sc), road = sc.querySelector('.road');
    return { pbg: sc.classList.contains('pbg'), layers: [...sc.querySelectorAll(':scope > .pbg-l')].map(e => e.dataset.layer), dim: !!sc.querySelector(':scope > .pbg-dim'),
      bgimg: (sc.style.backgroundImage || '').replace(/base64,[^"')]+/g, 'base64,…'), roadShown: road ? getComputedStyle(road).display !== 'none' : null, cls: sc.className, h: sc.clientHeight, w: sc.clientWidth, comp: st.backgroundImage.slice(0, 40) }; });

  // ---------------------------------------------------------------- nothing delivered: everyone sees A, as before
  const none = await ev(() => { const Z = window.__ZG; localStorage.removeItem('zg-ab');
    return { packs: Object.keys(Z.BGX.packs), test: !!Z.BGX.tests.ptuj, live: Z.BGX.tests.ptuj.live, v: Z.bgVariant('ptuj'), tags: Z.bgStatTags(), ab: localStorage.getItem('zg-ab') }; });
  check(none.test && none.packs.length === 0 && none.live === false, 'data/backgrounds.json names the Ptuj test; no pack is built while its art is not committed', JSON.stringify(none));
  check(none.v === 'A' && none.ab === null, 'without the pack everyone sees A and nobody is assigned a variant');
  check(none.tags.join() === 'ozadje-ptuj=A', 'the statistics carry the variant: ozadje-ptuj=A', none.tags.join());

  await ev(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.go('travel'); }); await sleep(250);
  const ptujA = await sceneInfo();
  check(ptujA && !ptujA.pbg && ptujA.layers.length === 0 && /data:image\/png/.test(ptujA.bgimg) && ptujA.roadShown === true, 'variant A on the Ptuj road: the one picture and the road strip, no layers', JSON.stringify(ptujA));
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle')); }); await sleep(250);
  const battleA = await sceneInfo();
  check(battleA && !battleA.pbg && /data:image\/png/.test(battleA.bgimg) && /linear-gradient/.test(battleA.bgimg), 'variant A in a Ptuj battle: the dimmed picture as before', battleA && battleA.cls);
  await shot('bg-00-ptuj-battle-A');

  // ---------------------------------------------------------------- a built pack that is not live: still A unless previewed
  await ev(fn => { const Z = window.__ZG; Z.BGX.packs.ptuj = (new Function('return (' + fn + ')()'))(); }, TEST_PACK.toString());
  const notLive = await ev(() => ({ v: window.__ZG.bgVariant('ptuj'), ab: localStorage.getItem('zg-ab') }));
  check(notLive.v === 'A' && notLive.ab === null, 'a built pack is not shown to players while the test is not live', JSON.stringify(notLive));

  // ---------------------------------------------------------------- preview (?ozadje=B): the road
  await ev(() => { const Z = window.__ZG; Z.setBgForce('B'); Z.newRun('krpan'); Z.go('travel'); }); await sleep(250);
  const tagsB = await ev(() => window.__ZG.bgStatTags());
  check(tagsB.join() === 'ozadje-ptuj=B(predogled)', 'a preview is marked in the statistics, so it never counts as an assigned B', tagsB.join());
  const ptujB = await sceneInfo();
  check(ptujB.pbg && ptujB.layers.join() === 'sky,clouds,distant-hills,town,road-tile,fg' && ptujB.dim, 'variant B on the road: every layer, back to front as the manifest orders them, under the road dimming', JSON.stringify(ptujB.layers));
  check(ptujB.bgimg === '' && ptujB.roadShown === false, 'the pack brings its own ground: the single picture and the road strip of A are not drawn under it');
  const stack = await ev(() => { const sc = document.querySelector('.scene'), z = s => getComputedStyle(sc.querySelector(s)).zIndex;
    return { fg: z('.pbg-l.front'), party: z(':scope > .party'), kids: [...sc.children].map(e => e.className.split(' ')[0]) }; });
  check(+stack.fg > +stack.party && stack.kids.indexOf('pbg-l') === 0 && stack.kids.indexOf('road') > stack.kids.indexOf('pbg-dim'), 'the foreground layer stands in front of the walking party; the others behind the stops and the party', JSON.stringify(stack));

  // walking: each tiling layer moves with the road × its speed; the town (no tiling) pans once across the region
  const at = x => ev(async x => { const Z = window.__ZG, R = Z.S.run; R.prompt = null; R.walking = false; R.x = x; await new Promise(r => setTimeout(r, 120));
    const sc = document.querySelector('.scene'), pos = {};
    sc.querySelectorAll(':scope > .pbg-l').forEach(e => { pos[e.dataset.layer] = parseFloat(e.style.backgroundPositionX); });
    return { pos, W: sc.clientWidth, H: sc.clientHeight, endX: R.endX, mobile: Z.S.mobile }; }, x);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);   // no cloud drift, so the numbers are exact
  const p0 = await at(0), p1 = await at(600);
  const s = p1.H / 120, k = p1.mobile ? 0.62 : 1, P = await ev(() => window.__ZG.BGX.packs.ptuj.layers.map(L => ({ id: L.id, w: L.w, speed: L.speed })));
  const want = id => { const L = P.find(l => l.id === id); return Math.round(mod(-600 * k * L.speed, Math.round(L.w * s))); };
  const near = (a, b) => Math.abs(a - b) <= 1;
  check(near(p1.pos['road-tile'], want('road-tile')) && near(p1.pos['distant-hills'], want('distant-hills')) && near(p1.pos.clouds, want('clouds')),
    'after 600 px of road the road layer has moved 600 px, the hills 6 %, the clouds 3 % (wrapped on their tile)', JSON.stringify({ got: p1.pos, road: want('road-tile'), hills: want('distant-hills') }));
  check(p0.pos.sky === p1.pos.sky, 'the sky (speed 0) stands still', `${p0.pos.sky} → ${p1.pos.sky}`);
  const townWant = Math.round(-Math.max(0, 480 * s - p1.W) * 600 / p1.endX);
  check(near(p1.pos.town, townWant), 'a layer that does not tile pans once across the region with the progress of the walk', `${p1.pos.town} vs ${townWant}`);
  await shot('bg-01-ptuj-road-B');

  // ---------------------------------------------------------------- preview: a Ptuj battle
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle' && !s.done)); Z.B.enemies.forEach(e => { e.charge = -99; }); }); await sleep(300);
  const battleB = await sceneInfo();
  check(battleB.pbg && battleB.layers.length === 6 && battleB.bgimg === '' && battleB.dim, 'variant B in a Ptuj battle: the layers under the battle dimming, no single picture', JSON.stringify(battleB.layers));
  const bstack = await ev(() => { const sc = document.querySelector('.scene'), z = e => getComputedStyle(e).zIndex, q = s => sc.querySelector(s);
    const dim = getComputedStyle(q('.pbg-dim')).backgroundImage;
    return { fg: z(q('.pbg-l.front')), hp: z(q('.partyhp')), cards: z(q('.cards')), floats: z(q('.floats')), party: z(q('.party')), enemies: z(q('.enemies')), dim }; });
  check(bstack.fg === '1' && bstack.party === 'auto' && bstack.enemies === 'auto' && bstack.hp === '2' && bstack.cards === '2' && bstack.floats === '2',
    'in battle the foreground is in front of heroes and enemies but under the health bar, the attack cards and the numbers', JSON.stringify(bstack));
  check(/0\.36/.test(bstack.dim) && /0\.16/.test(bstack.dim), 'the pack gets the same battle dimming as variant A, so A and B are compared fairly');
  const centred = await ev(() => { const sc = document.querySelector('.scene'), s = sc.clientHeight / 120, cw = 480 * s, x0 = (sc.clientWidth - cw) / 2;
    const at = id => parseFloat(sc.querySelector(`[data-layer="${id}"]`).style.backgroundPositionX);
    return { sky: at('sky'), skyWant: Math.round((((x0 % cw) + cw) % cw) - cw), town: at('town'), townWant: Math.round(x0), size: sc.querySelector('[data-layer="sky"]').style.backgroundSize, h: sc.clientHeight }; });
  check(Math.abs(centred.sky - centred.skyWant) <= 1 && Math.abs(centred.town - centred.townWant) <= 1 && centred.size.endsWith(centred.h + 'px'),
    'the battle shows the canvas centred and scaled to the scene height', JSON.stringify(centred));
  const still = await ev(async () => { const c = () => document.querySelector('[data-layer="clouds"]').style.backgroundPositionX; const a = c(); await new Promise(r => setTimeout(r, 700)); return [a, c()]; });
  check(still[0] === still[1], 'with reduced motion the clouds stand still', still.join(' → '));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const drift = await ev(async () => { const q = id => document.querySelector(`[data-layer="${id}"]`), c = () => parseFloat(q('clouds').style.backgroundPositionX), f = () => q('fg').style.backgroundPositionX;
    await new Promise(r => setTimeout(r, 200)); const a = c(), fa = f(); await new Promise(r => setTimeout(r, 1500));
    const tw = parseFloat(q('clouds').style.backgroundSize), d = ((c() - a) % tw + tw * 1.5) % tw - tw / 2;
    return { d: Math.round(d), want: Math.round(-3 * document.querySelector('.scene').clientHeight / 120 * 1.5), fa, fb: f() }; });
  check(Math.abs(drift.d - drift.want) <= 5 && drift.fa === drift.fb, 'otherwise the clouds drift 3 art pixels a second; the foreground never moves in battle', JSON.stringify(drift));
  await shot('bg-02-ptuj-battle-B');

  // other regions are never touched by the Ptuj test
  await ev(() => { const Z = window.__ZG; Z.enterRegion(1); Z.go('travel'); }); await sleep(250);
  const peca = await sceneInfo();
  check(!peca.pbg && peca.layers.length === 0 && /data:image\/png/.test(peca.bgimg), 'Peca keeps its own picture with the Ptuj preview on', peca.cls);

  // the gallery shows the built pack next to the pictures of A
  await ev(() => window.__ZG.go('gallery')); await sleep(300);
  const gal = await ev(() => { const f = [...document.querySelectorAll('.gbg figure')]; const b = f.find(x => x.querySelector('.gpbg'));
    return { n: f.length, cap: b ? b.textContent : '', layers: b ? b.querySelectorAll('.pbg-l').length : 0, h: b ? b.querySelector('.gpbg').clientHeight : 0 }; });
  check(gal.layers === 6 && gal.h > 0 && /različica B \(v pregledu\)/.test(gal.cap), 'Liki in karte → Ozadja shows the pack variant as "v pregledu" until it is approved', JSON.stringify(gal));

  // ---------------------------------------------------------------- live: one variant per install, kept
  const draw = await ev(() => { const Z = window.__ZG, T = Z.BGX.tests.ptuj; Z.setBgForce(null); T.live = true;
    T.share = { A: 0, B: 100 }; delete Z.AB.ptuj; localStorage.removeItem('zg-ab');
    const first = Z.bgVariant('ptuj'), kept = localStorage.getItem('zg-ab');
    T.share = { A: 100, B: 0 }; const again = Z.bgVariant('ptuj');
    const tags = Z.bgStatTags().join();
    const pack = Z.BGX.packs.ptuj; delete Z.BGX.packs.ptuj; const gone = Z.bgVariant('ptuj'), keptAfter = localStorage.getItem('zg-ab'); Z.BGX.packs.ptuj = pack;
    const back = Z.bgVariant('ptuj');
    let seen = { A: 0, B: 0 }; T.share = { A: 50, B: 50 };
    for (let i = 0; i < 400; i++) { delete Z.AB.ptuj; seen[Z.bgVariant('ptuj')]++; }
    T.live = false; delete Z.AB.ptuj; localStorage.removeItem('zg-ab');
    return { first, kept, again, tags, gone, keptAfter, back, seen }; });
  check(draw.first === 'B' && draw.kept === '{"ptuj":"B"}', 'a live test draws one variant by its share and keeps it in zg-ab', JSON.stringify(draw));
  check(draw.again === 'B' && draw.tags === 'ozadje-ptuj=B', 'the same install keeps its variant when the share changes; the statistics say B, not a preview');
  check(draw.gone === 'A' && draw.keptAfter === '{"ptuj":"B"}' && draw.back === 'B', 'a build without the pack shows A but keeps the assignment for when the pack is back');
  check(draw.seen.A > 140 && draw.seen.B > 140, 'a 50/50 share splits installs about evenly', JSON.stringify(draw.seen));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
