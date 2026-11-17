// Background A/B tests (src/backgrounds.js, data/backgrounds.json): variant A is the background in use and stays
// exactly as it was; variant B is the layered Ptuj pack (tools/art_ptuj_parallax.py → art/exports/environments/ptuj,
// art/manifests/ptuj.json), drawn with parallax on the road and still, with drifting clouds and water, in battle.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Background variants (A/B tests)');

const ORDER = 'sky,clouds,distant-hills,castle-hill,town,drava-water,reflections,sun-glint,road-tile,foreground';
const mod = (x, tw) => ((x % tw) + tw) % tw - tw;

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const sceneInfo = () => ev(() => { const sc = document.querySelector('.scene'); if (!sc) return null;
    const road = sc.querySelector('.road');
    return { pbg: sc.classList.contains('pbg'), layers: [...sc.querySelectorAll(':scope > .pbg-l')].map(e => e.dataset.layer), dim: !!sc.querySelector(':scope > .pbg-dim'),
      bgimg: (sc.style.backgroundImage || '').replace(/base64,[^"')]+/g, 'base64,…'), roadShown: road ? getComputedStyle(road).display !== 'none' : null, cls: sc.className }; });
  // where each layer's picture is, and the numbers the placement is computed from
  const layerPos = () => ev(() => { const sc = document.querySelector('.scene'), pos = {}, P = window.__ZG.BGX.packs.ptuj;
    sc.querySelectorAll(':scope > .pbg-l').forEach(e => { pos[e.dataset.layer] = parseFloat(e.style.backgroundPositionX); });
    return { pos, W: sc.clientWidth, H: sc.clientHeight, L: Object.fromEntries(P.layers.map(l => [l.id, { w: l.w, speed: l.speed, pan: l.pan, tileX: l.tileX }])) }; });

  // ---------------------------------------------------------------- the pack in the build
  const built = await ev(() => { const Z = window.__ZG, P = Z.BGX.packs.ptuj; localStorage.removeItem('zg-ab');
    return P && { ids: P.layers.map(l => l.id).join(), canvas: P.canvas, status: P.status, name: P.name, front: P.layers.filter(l => l.front).map(l => l.id),
      tiles: P.layers.filter(l => !l.tileX).map(l => l.id), live: Z.BGX.tests.ptuj.live, v: Z.bgVariant('ptuj'), tags: Z.bgStatTags(), ab: localStorage.getItem('zg-ab') }; });
  check(built && built.ids === ORDER && built.canvas.w === 640 && built.canvas.h === 165, 'the Ptuj pack is built in: ten layers in manifest order on a 640×165 canvas', JSON.stringify(built && { ids: built.ids, canvas: built.canvas }));
  check(built.status === 'review' && built.front.join() === 'foreground' && built.tiles.join() === 'sky,sun-glint', 'status review; only the foreground stands in front; sky and the sun\'s road do not tile', JSON.stringify(built));
  check(built.live === false && built.v === 'A' && built.ab === null && built.tags.join() === 'ozadje-ptuj=A', 'the test is not live: everyone sees A, nobody is assigned, the statistics say ozadje-ptuj=A');

  // ---------------------------------------------------------------- variant A, as before
  await ev(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.go('travel'); }); await sleep(250);
  const ptujA = await sceneInfo();
  check(ptujA && !ptujA.pbg && ptujA.layers.length === 0 && /data:image\/png/.test(ptujA.bgimg) && ptujA.roadShown === true, 'variant A on the Ptuj road: the one picture and the road strip, no layers', JSON.stringify(ptujA));
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle')); }); await sleep(250);
  const battleA = await sceneInfo();
  check(battleA && !battleA.pbg && /data:image\/png/.test(battleA.bgimg) && /linear-gradient/.test(battleA.bgimg), 'variant A in a Ptuj battle: the dimmed picture as before', battleA && battleA.cls);
  await shot('bg-00-ptuj-battle-A');

  // ---------------------------------------------------------------- preview (?ozadje=B): the road
  await ev(() => { const Z = window.__ZG; Z.setBgForce('B'); Z.newRun('krpan'); Z.go('travel'); }); await sleep(250);
  const tagsB = await ev(() => window.__ZG.bgStatTags());
  check(tagsB.join() === 'ozadje-ptuj=B(predogled)', 'a preview is marked in the statistics, so it never counts as an assigned B', tagsB.join());
  const ptujB = await sceneInfo();
  check(ptujB.pbg && ptujB.layers.join() === ORDER && ptujB.dim, 'variant B on the road: every layer, back to front, under the road dimming', ptujB.layers.join());
  check(ptujB.bgimg === '' && ptujB.roadShown === false, 'the pack brings its own path: the single picture and the road strip of A are not drawn under it');
  const stack = await ev(() => { const sc = document.querySelector('.scene'), z = s => getComputedStyle(sc.querySelector(s)).zIndex;
    return { fg: z('.pbg-l.front'), party: z(':scope > .party'), kids: [...sc.children].map(e => e.className.split(' ')[0]) }; });
  check(+stack.fg > +stack.party && stack.kids.indexOf('pbg-l') === 0 && stack.kids.indexOf('road') > stack.kids.indexOf('pbg-dim'), 'the foreground stands in front of the walking party; the other layers behind the stops and the party', JSON.stringify(stack));

  // walking: tiling layers scroll with the road × their speed from the battle's centred framing; sky and sun pan together
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);   // no drift, so the numbers are exact
  const at = x => ev(async x => { const Z = window.__ZG, R = Z.S.run; R.prompt = null; R.walking = false; R.x = x; await new Promise(r => setTimeout(r, 120)); return { endX: R.endX, mobile: Z.S.mobile }; }, x);
  await at(0); const p0 = await layerPos();
  const r1 = await at(1200), p1 = await layerPos();
  const s = p1.H / 165, k = r1.mobile ? 0.62 : 1, c0 = (p1.W - 640 * s) / 2;
  const tileWant = (id, x) => Math.round(mod(c0 - x * k * p1.L[id].speed, Math.round(p1.L[id].w * s)));
  const near = (a, b) => Math.abs(a - b) <= 1;
  check(near(p0.pos['road-tile'], tileWant('road-tile', 0)) && near(p0.pos.town, tileWant('town', 0)) && near(p0.pos.sky, Math.round(c0)), 'at the start of the road the canvas is centred, as in battle', JSON.stringify({ got: p0.pos.sky, want: Math.round(c0) }));
  check(['road-tile', 'foreground', 'town', 'castle-hill', 'distant-hills', 'drava-water', 'clouds'].every(id => near(p1.pos[id], tileWant(id, 1200))),
    'after 1200 px of road each tiling layer has moved by its speed: path 1, town 0.16, castle hill 0.09, hills 0.05, clouds 0.03', JSON.stringify(p1.pos));
  check(p1.pos.reflections === p1.pos.town, 'the town\'s reflection moves with the town', `${p1.pos.reflections} / ${p1.pos.town}`);
  const skyWant = Math.round(c0 - Math.max(0, 640 * s - p1.W) / 2 * (1200 / r1.endX) * 0.5);
  check(near(p1.pos.sky, skyWant) && p1.pos['sun-glint'] === p1.pos.sky, 'the sky pans slowly with the walk and the sun\'s road on the water stays under the sun', `${p1.pos.sky} vs ${skyWant}, glint ${p1.pos['sun-glint']}`);
  await at(2400); await shot('bg-01-ptuj-road-B');

  // ---------------------------------------------------------------- preview: a Ptuj battle
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle' && !s.done)); Z.B.enemies.forEach(e => { e.charge = -99; }); }); await sleep(300);
  const battleB = await sceneInfo();
  check(battleB.pbg && battleB.layers.join() === ORDER && battleB.bgimg === '' && battleB.dim, 'variant B in a Ptuj battle: the layers under the battle dimming, no single picture', battleB.layers.join());
  const bstack = await ev(() => { const sc = document.querySelector('.scene'), z = e => getComputedStyle(e).zIndex, q = s => sc.querySelector(s);
    return { fg: z(q('.pbg-l.front')), hp: z(q('.partyhp')), cards: z(q('.cards')), floats: z(q('.floats')), party: z(q('.party')), enemies: z(q('.enemies')), dim: getComputedStyle(q('.pbg-dim')).backgroundImage }; });
  check(bstack.fg === '1' && bstack.party === 'auto' && bstack.enemies === 'auto' && bstack.hp === '2' && bstack.cards === '2' && bstack.floats === '2',
    'in battle the foreground is in front of heroes and enemies but under the health bar, the attack cards and the numbers', JSON.stringify(bstack));
  check(/0\.36/.test(bstack.dim) && /0\.16/.test(bstack.dim), 'the pack gets the same battle dimming as variant A, so A and B are compared fairly');
  const pb = await layerPos(), sb = pb.H / 165, cb = (pb.W - 640 * sb) / 2;
  check(near(pb.pos.sky, Math.round(cb)) && near(pb.pos.town, Math.round(mod(cb, Math.round(640 * sb)))) && near(pb.pos['road-tile'], Math.round(mod(cb, Math.round(192 * sb)))),
    'the battle shows the canvas centred and scaled to the scene height', JSON.stringify({ sky: pb.pos.sky, want: Math.round(cb) }));
  const still = await ev(async () => { const c = () => document.querySelector('[data-layer="clouds"]').style.backgroundPositionX; const a = c(); await new Promise(r => setTimeout(r, 700)); return [a, c()]; });
  check(still[0] === still[1], 'with reduced motion the clouds stand still', still.join(' → '));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const drift = await ev(async () => { const q = id => document.querySelector(`[data-layer="${id}"]`), x = id => parseFloat(q(id).style.backgroundPositionX);
    const step = (id, a) => { const tw = parseFloat(q(id).style.backgroundSize); return Math.round(((x(id) - a) % tw + tw * 1.5) % tw - tw / 2); };
    await new Promise(r => setTimeout(r, 200)); const c = x('clouds'), w = x('drava-water'), f = q('foreground').style.backgroundPositionX, t = q('town').style.backgroundPositionX;
    await new Promise(r => setTimeout(r, 1500)); const s = document.querySelector('.scene').clientHeight / 165;
    return { clouds: step('clouds', c), cloudsWant: Math.round(-2 * s * 1.5), water: step('drava-water', w), waterWant: Math.round(1.5 * s * 1.5), still: f === q('foreground').style.backgroundPositionX && t === q('town').style.backgroundPositionX }; });
  check(Math.abs(drift.clouds - drift.cloudsWant) <= 3 && Math.abs(drift.water - drift.waterWant) <= 3 && drift.still,
    'otherwise the clouds drift left and the Drava flows right; the town and the foreground never move in battle', JSON.stringify(drift));
  await shot('bg-02-ptuj-battle-B');

  // other regions are never touched by the Ptuj test
  await ev(() => { const Z = window.__ZG; Z.enterRegion(1); Z.go('travel'); }); await sleep(250);
  const peca = await sceneInfo();
  check(!peca.pbg && peca.layers.length === 0 && /data:image\/png/.test(peca.bgimg), 'Peca keeps its own picture with the Ptuj preview on', peca.cls);

  // the gallery shows the pack next to the pictures of A
  await ev(() => window.__ZG.go('gallery')); await sleep(300);
  const gal = await ev(() => { const f = [...document.querySelectorAll('.gbg figure')]; const b = f.find(x => x.querySelector('.gpbg'));
    return { n: f.length, cap: b ? b.textContent : '', layers: b ? b.querySelectorAll('.pbg-l').length : 0, h: b ? b.querySelector('.gpbg').clientHeight : 0 }; });
  check(gal.layers === 10 && gal.h > 0 && gal.cap === 'Ptuj — večer ob Dravi — različica B (v pregledu)', 'Liki in karte → Ozadja shows variant B as "v pregledu" until it is approved', JSON.stringify(gal));

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
