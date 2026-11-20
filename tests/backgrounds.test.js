// Background A/B tests (src/backgrounds.js, data/backgrounds.json): variant A is the background in use and stays
// exactly as it was. Variant B is the Codex pack (art/manifests/ptuj.json, #33): eight layers on a 16:9 canvas,
// with outer-bank trees, wall, bridge and front occlusion, placed for the game's scene by data/backgrounds.json. Variant D is the snowy companion preview. Variant C is Claude's pack (art/manifests/ptuj-vecer.json,
// tools/art_ptuj_parallax.py): ten pixel-art layers with tiling parallax, a preview only (share 0).
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Background variants (A/B tests)');

const ORDER_B = 'sky,clouds,distant-hills,castle-hill,town,riverbank-trees,drava-water,riverbank-wall,bridge,reflections,road-cobbles,foreground';
const ORDER_C = 'sky,clouds,distant-hills,castle-hill,town,drava-water,reflections,sun-glint,road-tile,foreground';
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
  const layerPos = id => ev(id => { const sc = document.querySelector('.scene'), pos = {}, P = window.__ZG.BGX.packs[id];
    sc.querySelectorAll(':scope > .pbg-l').forEach(e => { const [x, y] = e.style.backgroundPosition.split(' ').map(parseFloat), [w, h] = e.style.backgroundSize.split(' ').map(parseFloat);
      pos[e.dataset.layer] = { x, y, w, h, smooth: e.style.imageRendering === 'auto' }; });
    return { pos, W: sc.clientWidth, H: sc.clientHeight, canvas: P.canvas, L: Object.fromEntries(P.layers.map(l => [l.id, { w: l.w, h: l.h, x: l.x, y: l.y, scale: l.scale, speed: l.speed, pan: l.pan, tileX: l.tileX }])) }; }, id);
  // every actor's feet against the top of the ground layer's picture (its first solid row, read from the image)
  const feetOnGround = () => ev(async () => {
    const sc = document.querySelector('.scene'), el = sc.querySelector('[data-layer="road-cobbles"], [data-layer="road-tile"]'), r = sc.getBoundingClientRect();
    const img = new Image(); img.src = getComputedStyle(el).backgroundImage.slice(5, -2); await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const a = g.getImageData(0, 0, img.width, img.height).data;
    let top = 0; for (; top < img.height; top++) { let n = 0; for (let x = 0; x < img.width; x += 4) if (a[(top * img.width + x) * 4 + 3] > 128) n++; if (n > img.width / 4 * .5) break; }
    const [, y] = el.style.backgroundPosition.split(' ').map(parseFloat), [, h] = el.style.backgroundSize.split(' ').map(parseFloat);
    const ground = y + top * h / img.height;
    const feet = [...sc.querySelectorAll('.party .sp, .enemies .sp, .tv-obj .sp')].filter(e => e.getBoundingClientRect().width).map(e => Math.round(e.getBoundingClientRect().bottom - r.top));
    return { ground: Math.round(ground), feet, H: Math.round(r.height) }; });

  // ---------------------------------------------------------------- both packs in the build
  const built = await ev(() => { const Z = window.__ZG, B = Z.BGX.packs.ptuj, C = Z.BGX.packs['ptuj-vecer']; localStorage.removeItem('zg-ab');
    const sum = P => P && { ids: P.layers.map(l => l.id).join(), canvas: P.canvas, status: P.status, name: P.name, tiles: P.layers.filter(l => l.tileX).map(l => l.id).join(), front: P.layers.filter(l => l.front).map(l => l.id).join() };
    return { B: sum(B), C: sum(C), road: B && B.layers.find(l => l.id === 'road-cobbles'), castle: B && B.layers.find(l => l.id === 'castle-hill'), test: Z.BGX.tests.ptuj, v: Z.bgVariant('ptuj'), tags: Z.bgStatTags(), ab: localStorage.getItem('zg-ab') }; });
  check(built.B && built.B.ids === ORDER_B && built.B.canvas.w === 1672 && built.B.canvas.h === 560 && built.B.tiles === 'clouds,road-cobbles' && built.B.name === 'Ptuj — sončni zahod nad Dravo',
    'variant B is the combined seasonal pack: twelve sunset layers back to front, fitted through a 1672×560 view, clouds and road tile horizontally', JSON.stringify(built.B));
  check((built.road.scale || 1) === 1 && built.road.w === 1672 && built.road.h === 240 && built.road.y === 325 && built.castle.scale === 0.6 && built.castle.x === 560, 'the small cobbles are drawn 1:1 from the top of the ground band, and the castle hill keeps Codex\'s 0.6 scale, as data/backgrounds.json places them', JSON.stringify({ road: [built.road.w, built.road.scale, built.road.y], castle: [built.castle.x, built.castle.y, built.castle.scale] }));
  check(built.C && built.C.ids === ORDER_C && built.C.canvas.w === 640 && built.C.front === 'foreground', 'variant C is Claude\'s pack: ten layers on 640×165, the foreground in front', JSON.stringify(built.C));
  check(built.test.share.C === 0 && built.test.live === false && built.v === 'A' && built.ab === null && built.tags.join() === 'ozadje-ptuj=A',
    'the test is not live and C has no share: everyone sees A, nobody is assigned, the statistics say ozadje-ptuj=A', JSON.stringify(built.test));

  // ---------------------------------------------------------------- variant A, as before
  await ev(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz'); Z.go('travel'); }); await sleep(250);
  const ptujA = await sceneInfo();
  check(ptujA && !ptujA.pbg && ptujA.layers.length === 0 && /data:image\/png/.test(ptujA.bgimg) && ptujA.roadShown === true, 'variant A on the Ptuj road: the one picture and the road strip, no layers', JSON.stringify(ptujA));
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle')); }); await sleep(250);
  const battleA = await sceneInfo();
  check(battleA && !battleA.pbg && /data:image\/png/.test(battleA.bgimg) && /linear-gradient/.test(battleA.bgimg), 'variant A in a Ptuj battle: the dimmed picture as before', battleA && battleA.cls);
  await shot('bg-00-ptuj-battle-A');

  // ---------------------------------------------------------------- variant B (preview): the road
  await ev(() => { const Z = window.__ZG; Z.setBgForce('B'); Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz'); Z.go('travel'); }); await sleep(300);
  check((await ev(() => window.__ZG.bgStatTags())).join() === 'ozadje-ptuj=B(predogled)', 'a preview is marked in the statistics, so it never counts as an assigned B');
  const roadB = await sceneInfo();
  check(roadB.pbg && roadB.layers.join() === ORDER_B && roadB.dim && roadB.bgimg === '' && roadB.roadShown === false, 'variant B on the road: the eight layers under the road dimming, without A\'s picture and road strip', roadB.layers.join());
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const at = x => ev(async x => { const Z = window.__ZG, R = Z.S.run; R.prompt = null; R.walking = false; R.x = x; await new Promise(r => setTimeout(r, 150)); return { endX: R.endX, mobile: Z.S.mobile }; }, x);
  await at(0);
  const feetRoadB = await feetOnGround();
  check(feetRoadB.feet.length >= 4 && feetRoadB.feet.every(f => f >= feetRoadB.ground), 'on the road every hero and enemy stands on the Codex cobbles', JSON.stringify(feetRoadB));
  const r1 = await at(1200), p1 = await layerPos('ptuj');
  const s = Math.max(p1.H / 560, p1.W / 1672), c0 = (p1.W - 1672 * s) / 2, rw = Math.round(1672 * s);
  check(Math.abs(p1.pos['road-cobbles'].x - Math.round(mod(c0 - 1200 * (r1.mobile ? .62 : 1), rw))) <= 1, 'the road scrolls with the walk on its 1672 px tile', JSON.stringify(p1.pos['road-cobbles']));
  check(p1.pos.town.x === p1.pos['drava-water'].x && p1.pos.town.x === p1.pos.reflections.x && p1.pos.town.y < p1.pos['drava-water'].y && p1.pos['riverbank-wall'].y < p1.pos['drava-water'].y, 'the town, the river and its reflections stay together');
  check(Object.values(p1.pos).every(p => p.smooth), 'the large Codex pictures are shrunk smoothly, not aliased as pixel art', JSON.stringify(Object.fromEntries(Object.entries(p1.pos).map(([k, v]) => [k, v.smooth]))));
  await shot('bg-01-ptuj-road-B');

  // ---------------------------------------------------------------- variant B: a Ptuj battle
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.filter(s => s.kind === 'battle')[2]); Z.B.enemies.forEach(e => { e.charge = -99; }); }); await sleep(350);
  const battleB = await sceneInfo();
  check(battleB.pbg && battleB.layers.join() === ORDER_B && battleB.bgimg === '' && battleB.dim, 'variant B in a Ptuj battle: the layers under the battle dimming', battleB.layers.join());
  const feetB = await feetOnGround();
  check(feetB.feet.length >= 5 && feetB.feet.every(f => f >= feetB.ground), 'in battle the three heroes and both enemies stand on the cobbles, not on the water', JSON.stringify(feetB));
  const pb = await layerPos('ptuj'), sb = Math.max(pb.H / 560, pb.W / 1672);
  check(Math.abs(pb.pos.sky.x - Math.round((pb.W - 1672 * sb) / 2)) <= 1 && Math.abs(pb.pos['castle-hill'].x - Math.round((pb.W - 1672 * sb) / 2 + 560 * sb)) <= 1 && pb.pos.sky.x <= 0 && pb.pos.sky.x + pb.pos.sky.w >= pb.W,
    'the battle shows the view centred; the sky covers the whole width', JSON.stringify({ sky: pb.pos.sky, castle: pb.pos['castle-hill'].x, W: pb.W }));
  // a short window: the scene is wider than the view, so the view covers its width and keeps the ground at the bottom
  const cover = await ev(async () => { const sc = document.querySelector('.scene'); sc.style.height = '200px'; await new Promise(r => setTimeout(r, 120));
    const sky = sc.querySelector('[data-layer="sky"]'), road = sc.querySelector('[data-layer="road-cobbles"]');
    const [sx] = sky.style.backgroundPosition.split(' ').map(parseFloat), [sw] = sky.style.backgroundSize.split(' ').map(parseFloat);
    const [, ry] = road.style.backgroundPosition.split(' ').map(parseFloat), [, rh] = road.style.backgroundSize.split(' ').map(parseFloat);
    const out = { W: sc.clientWidth, H: sc.clientHeight, skyLeft: sx, skyRight: sx + sw, roadBottom: Math.round(ry + rh) }; sc.style.height = ''; await new Promise(r => setTimeout(r, 120)); return out; });
  check(cover.skyLeft <= 0 && cover.skyRight >= cover.W && cover.roadBottom >= cover.H - 1 && cover.roadBottom - cover.H <= 6, 'in a short, wide scene the view still covers the width and the road reaches the bottom (its 5 spare pixels run just past it)', JSON.stringify(cover));
  await shot('bg-02-ptuj-battle-B');

  // ---------------------------------------------------------------- variant C (preview only): parallax of the pixel-art pack
  await ev(() => { const Z = window.__ZG; Z.setBgForce('C'); Z.newRun('krpan'); Z.joinHero('kurent'); Z.go('travel'); }); await sleep(300);
  const roadC = await sceneInfo();
  check(roadC.layers.join() === ORDER_C && (await ev(() => window.__ZG.bgStatTags())).join() === 'ozadje-ptuj=C(predogled)', '?ozadje=C previews Claude\'s pack, marked as a preview', roadC.layers.join());
  const stack = await ev(() => { const sc = document.querySelector('.scene'), z = s => getComputedStyle(sc.querySelector(s)).zIndex; return { fg: z('.pbg-l.front'), party: z(':scope > .party') }; });
  check(+stack.fg > +stack.party, 'its foreground stands in front of the walking party', JSON.stringify(stack));
  await at(0); const c0p = await layerPos('ptuj-vecer');
  const r2 = await at(1200), c1p = await layerPos('ptuj-vecer');
  const sc2 = c1p.H / 165, cc = (c1p.W - 640 * sc2) / 2, k2 = r2.mobile ? .62 : 1;
  const tileWant = id => Math.round(mod(cc - 1200 * k2 * c1p.L[id].speed, Math.round(c1p.L[id].w * sc2)));
  check(Math.abs(c0p.pos.sky.x - Math.round(cc)) <= 1, 'C starts from the battle\'s centred framing', `${c0p.pos.sky.x} vs ${Math.round(cc)}`);
  check(['road-tile', 'foreground', 'town', 'castle-hill', 'distant-hills', 'drava-water', 'clouds'].every(id => Math.abs(c1p.pos[id].x - tileWant(id)) <= 1),
    'after 1200 px each tiling layer of C has moved by its speed (path 1, town 0.16, castle 0.09, hills 0.05, clouds 0.03)', JSON.stringify(Object.fromEntries(Object.entries(c1p.pos).map(([k, v]) => [k, v.x]))));
  check(c1p.pos.reflections.x === c1p.pos.town.x && c1p.pos['sun-glint'].x === c1p.pos.sky.x, 'C\'s reflection moves with its town, and the sun\'s road with its sky');
  check(Object.values(c1p.pos).every(p => !p.smooth), 'C is drawn at twice its size with hard pixel edges');
  const feetC = await feetOnGround();
  check(feetC.feet.every(f => f >= feetC.ground), 'on C\'s road everyone stands on the meadow or the promenade', JSON.stringify(feetC));
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle')); Z.B.enemies.forEach(e => { e.charge = -99; }); }); await sleep(300);
  const bstack = await ev(() => { const sc = document.querySelector('.scene'), z = e => getComputedStyle(e).zIndex, q = s => sc.querySelector(s);
    return { fg: z(q('.pbg-l.front')), hp: z(q('.partyhp')), cards: z(q('.cards')), floats: z(q('.floats')), party: z(q('.party')), enemies: z(q('.enemies')) }; });
  check(bstack.fg === '1' && bstack.party === 'auto' && bstack.enemies === 'auto' && bstack.hp === '2' && bstack.cards === '2' && bstack.floats === '2',
    'in battle C\'s foreground is in front of the actors but under the health bar, the cards and the numbers', JSON.stringify(bstack));
  const still = await ev(async () => { const c = () => document.querySelector('[data-layer="clouds"]').style.backgroundPosition; const a = c(); await new Promise(r => setTimeout(r, 700)); return [a, c()]; });
  check(still[0] === still[1], 'with reduced motion C\'s clouds stand still', still.join(' → '));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const drift = await ev(async () => { const q = id => document.querySelector(`[data-layer="${id}"]`), x = id => parseFloat(q(id).style.backgroundPositionX);
    const step = (id, a) => { const tw = parseFloat(q(id).style.backgroundSize); return Math.round(((x(id) - a) % tw + tw * 1.5) % tw - tw / 2); };
    await new Promise(r => setTimeout(r, 200)); const c = x('clouds'), w = x('drava-water'), f = q('foreground').style.backgroundPositionX;
    await new Promise(r => setTimeout(r, 1500)); const s = document.querySelector('.scene').clientHeight / 165;
    return { clouds: step('clouds', c), cloudsWant: Math.round(-2 * s * 1.5), water: step('drava-water', w), waterWant: Math.round(1.5 * s * 1.5), still: f === q('foreground').style.backgroundPositionX }; });
  check(Math.abs(drift.clouds - drift.cloudsWant) <= 3 && Math.abs(drift.water - drift.waterWant) <= 3 && drift.still,
    'otherwise C\'s clouds drift left and its river flows right; the foreground never moves', JSON.stringify(drift));
  await shot('bg-03-ptuj-battle-C');

  // other regions are never touched by the Ptuj test
  await ev(() => { const Z = window.__ZG; Z.enterRegion(1); Z.go('travel'); }); await sleep(250);
  const peca = await sceneInfo();
  check(!peca.pbg && peca.layers.length === 0 && /data:image\/png/.test(peca.bgimg), 'Peca keeps its own picture with a Ptuj preview on', peca.cls);

  // the gallery shows B, C and the winter companion D next to the pictures of A
  await ev(() => window.__ZG.go('gallery')); await sleep(400);
  const gal = await ev(() => [...document.querySelectorAll('.gbg figure')].filter(f => f.querySelector('.gpbg')).map(f => ({ cap: f.textContent, layers: f.querySelectorAll('.pbg-l').length, h: f.querySelector('.gpbg').clientHeight })));
  check(gal.length === 3 && gal[0].cap === 'Ptuj — sončni zahod nad Dravo — različica B (v pregledu)' && gal[0].layers === 12 && gal[1].cap === 'Ptuj — večer ob Dravi — različica C (v pregledu)' && gal[1].layers === 10
    && gal[2].cap === 'Ptuj — zimski večer ob Dravi — različica D (v pregledu)' && gal[2].layers === 12 && gal.every(g => g.h > 0),
    'Liki in karte → Ozadja shows B, C and D, each "v pregledu" until approved', JSON.stringify(gal));
  // the winter companion D stands in the same depth order as B: the shared bridge after the riverbank wall, never behind the sky
  const orderD = await ev(() => window.__ZG.BGX.packs['ptuj-zima'].layers.map(l => l.id).join());
  check(orderD === ORDER_B, 'variant D (winter) draws its layers in the sunset order, the bridge after the wall and in front of the river', orderD);

  // ---------------------------------------------------------------- live: one variant per install, kept; C never drawn
  const draw = await ev(() => { const Z = window.__ZG, T = Z.BGX.tests.ptuj, share = T.share; Z.setBgForce(null); T.live = true;
    T.share = { A: 0, B: 100, C: 0 }; delete Z.AB.ptuj; localStorage.removeItem('zg-ab');
    const first = Z.bgVariant('ptuj'), kept = localStorage.getItem('zg-ab');
    T.share = { A: 100, B: 0, C: 0 }; const again = Z.bgVariant('ptuj'), tags = Z.bgStatTags().join();
    const pack = Z.BGX.packs.ptuj; delete Z.BGX.packs.ptuj; const gone = Z.bgVariant('ptuj'), keptAfter = localStorage.getItem('zg-ab'); Z.BGX.packs.ptuj = pack;
    const back = Z.bgVariant('ptuj');
    const seen = { A: 0, B: 0, C: 0 }; T.share = share;
    for (let i = 0; i < 400; i++) { delete Z.AB.ptuj; seen[Z.bgVariant('ptuj')]++; }
    T.live = false; delete Z.AB.ptuj; localStorage.removeItem('zg-ab');
    return { first, kept, again, tags, gone, keptAfter, back, seen }; });
  check(draw.first === 'B' && draw.kept === '{"ptuj":"B"}', 'a live test draws one variant by its share and keeps it in zg-ab', JSON.stringify(draw));
  check(draw.again === 'B' && draw.tags === 'ozadje-ptuj=B', 'the same install keeps its variant when the share changes; the statistics say B, not a preview');
  check(draw.gone === 'A' && draw.keptAfter === '{"ptuj":"B"}' && draw.back === 'B', 'a build without a variant\'s pack shows A but keeps the assignment for when it is back');
  check(draw.seen.A > 140 && draw.seen.B > 140 && draw.seen.C === 0, 'the 50/50 share splits installs between A and B; C (share 0) is never drawn', JSON.stringify(draw.seen));

  // ---------------------------------------------------------------- Nastavitve → Razvoj → Kakovost slik: auto, high, low
  const fidVar = await ev(() => { const Z = window.__ZG, T = Z.BGX.tests.ptuj, live = T.live; T.live = false;
    const pick = (f, forced) => { if (f) localStorage.setItem('zg-fidelity', f); else localStorage.removeItem('zg-fidelity'); Z.setBgForce(forced || null); return Z.bgVariant('ptuj'); };
    const out = { auto: pick(null, null), autoB: pick(null, 'B'), high: pick('high', null), highA: pick('high', 'A'),
      lowB: pick('low', 'B'), lowD: pick('low', 'D'), highD: pick('high', 'D') };
    T.live = live; Z.setBgForce(null); localStorage.removeItem('zg-fidelity'); return out; });
  check(fidVar.auto === 'A' && fidVar.autoB === 'B' && fidVar.high === 'B' && fidVar.highA === 'B' && fidVar.lowB === 'A' && fidVar.lowD === 'D' && fidVar.highD === 'D',
    'Samodejno keeps the test\'s choice; Visoka shows the sunset pack (B) and Nizka the picture in the game (A); winter (D) stays D', JSON.stringify(fidVar));
  const scene = await ev(() => { const Z = window.__ZG, layered = () => !!document.querySelector('.scene [data-layer="town"]'), out = {};
    const radios = () => Object.fromEntries([...document.querySelectorAll('input.set-fid')].map(r => [r.value, r.checked]));
    Z.S.testMode = true; Z.S.mode = 'calm';
    const run = (f, forced) => { if (f) localStorage.setItem('zg-fidelity', f); else localStorage.removeItem('zg-fidelity'); Z.setBgForce(forced || null);
      Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz'); Z.go('travel'); return layered(); };
    out.auto = run(null, null); out.high = run('high', null); out.lowB = run('low', 'B'); out.lowD = run('low', 'D');
    localStorage.removeItem('zg-fidelity'); Z.setBgForce(null); Z.go('settings'); out.radiosAuto = radios();
    localStorage.setItem('zg-fidelity', 'low'); Z.go('settings'); out.radiosLow = radios();
    localStorage.removeItem('zg-fidelity'); return out; });
  check(!scene.auto && scene.high && !scene.lowB && scene.lowD && scene.radiosAuto.auto === true && scene.radiosLow.low === true && scene.radiosLow.auto === false,
    'the travel scene: Visoka draws the layered pack, Nizka the picture in the game, winter stays layered; Nastavitve shows the stored choice', JSON.stringify(scene));

  // ---------------------------------------------------------------- Martin Krpan follows the same setting (Codex's pack = Visoka; the sprite in the game = Samodejno and Nizka)
  const kp = await ev(async () => { const Z = window.__ZG, out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    Z.S.testMode = true; Z.S.mode = 'calm';
    const look = async f => { if (f) localStorage.setItem('zg-fidelity', f); else localStorage.removeItem('zg-fidelity');
      Z.go('settings'); const r = document.querySelector(`input.set-fid[value="${f || 'auto'}"]`); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); await wait(50);
      Z.newRun('krpan'); Z.joinHero('kurent'); Z.go('travel'); await wait(80);
      const el = document.querySelector('.party .spr[data-hero="krpan"], .party .spr.hi'); const k = [...document.querySelectorAll('.party .spr')][0];
      return { hi: !!(k && k.classList.contains('hi')), bg: k ? (k.querySelector('.sp').style.backgroundImage || '').length : 0 }; };
    out.auto = await look(null); out.high = await look('high'); out.low = await look('low');
    const H = Z.BGX.heroes.krpan; out.rows = H ? Object.fromEntries(Object.entries(H.seqs).map(([n, q]) => [n, q.row])) : null;
    localStorage.removeItem('zg-fidelity'); return out; });
  check(!kp.auto.hi && kp.high.hi && !kp.low.hi && kp.high.bg > kp.low.bg, 'Martin Krpan: Samodejno and Nizka keep the sprite already in the game, Visoka uses Codex\'s sheet', JSON.stringify({ ...kp, rows: undefined }));
  check(kp.rows && ['idle', 'cudgel-strike', 'kmecka-moc-r1-double-punch', 'kmecka-moc-r2-salt-bag-throw', 'kmecka-moc-r3-boulder', 'mesarica-slash', 'running', 'victory', 'downed'].every(n => n in kp.rows),
    'the Krpan sheet holds idle, Lipov kij, the three Kmečka moč ranks (rank 2 the solo salt-bag throw), Mesarica, running, victory and downed', JSON.stringify(kp.rows));
  const seq = await ev(async () => { const Z = window.__ZG; localStorage.setItem('zg-fidelity', 'high');
    Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.joinHero('kurent'); Z.go('travel');
    const spr = document.querySelector('.party .spr.hi'), rows = Z.BGX.heroes.krpan.seqs, out = {};
    if (!spr) { localStorage.removeItem('zg-fidelity'); return null; }
    for (const [t, r, n] of [[1, 1, 'cudgel-strike'], [2, 1, 'kmecka-moc-r1-double-punch'], [2, 2, 'kmecka-moc-r2-salt-bag-throw'], [2, 3, 'kmecka-moc-r3-boulder'], [3, 1, 'mesarica-slash'], [3, 3, 'mesarica-slash']]) {
      Z.attackAnim(spr, t, document.querySelector('.scene'), r); out[`${t}/${r}`] = [getComputedStyle(spr).getPropertyValue('--r').trim(), String(rows[n].row)]; }
    localStorage.removeItem('zg-fidelity'); return out; });
  check(seq && Object.values(seq).every(([got, want]) => got === want), 'Krpan\'s skills use their own rows: Lipov kij, Kmečka moč R1 / R2 / R3, Mesarica (any rank)', JSON.stringify(seq));

  // ---------------------------------------------------------------- the Ptuj packs ship as WebP (tools/art_bg_webp.py) and decode at their size
  const wp = await ev(async () => { const P = window.__ZG.BGX.packs, out = {};
    for (const id of ['ptuj', 'ptuj-zima']) {
      const L = (P[id] && P[id].layers) || [];
      const sizes = await Promise.all(L.map(l => new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth === l.w && im.naturalHeight === l.h); im.onerror = () => res(false); im.src = l.src; })));
      out[id] = { n: L.length, webp: L.filter(l => l.src.startsWith('data:image/webp;base64,')).length, decoded: sizes.filter(Boolean).length,
        kb: Math.round(L.reduce((s, l) => s + l.src.length * 0.75, 0) / 1024) };
    }
    return out; });
  check(['ptuj', 'ptuj-zima'].every(id => wp[id].n > 0 && wp[id].webp === wp[id].n && wp[id].decoded === wp[id].n && wp[id].kb < 700),
    'every Ptuj layer (sunset and winter) is WebP, decodes, matches its manifest size, and each pack is under 700 KB', JSON.stringify(wp));

  // ---------------------------------------------------------------- Krpan's running, victory and downed states (data/hero-art.json)
  const st = await ev(async () => { const Z = window.__ZG, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
    localStorage.setItem('zg-fidelity', 'high'); Z.S.testMode = true; Z.S.mode = 'calm';
    const rows = Z.BGX.heroes.krpan.seqs, row = el => getComputedStyle(el).getPropertyValue('--r').trim();
    const look = el => { const sp = el.querySelector('.sp'), cs = getComputedStyle(sp); return { row: row(el), anim: cs.animationName, transform: cs.transform, filter: cs.filter }; };
    out.want = { idle: String(rows.idle.row), run: String(rows.running.row), win: String(rows.victory.row), down: String(rows.downed.row) };
    // the road: idle while standing, running while the party walks; Kurent (no pack) is untouched
    Z.newRun('krpan'); Z.joinHero('kurent'); Z.go('travel'); await wait(60);
    const k = () => document.querySelector('.party .spr.hi[data-hero="krpan"]'), ku = () => document.querySelector('.party .spr[data-hero="kurent"]');
    out.cls = k() ? k().className : null; out.kurentHi = ku() ? ku().classList.contains('hi') : null;
    out.stand = look(k()); Z.travelAct('go'); await wait(80); out.walk = look(k()); out.walking = document.querySelector('.scene').classList.contains('walking'); Z.travelAct('go');
    // down on the road, walking: the kneel wins over running, upright and greyed
    Z.S.heroes[0].down = true; Z.go('travel'); Z.travelAct('go'); await wait(80); out.downWalk = look(k()); Z.travelAct('go'); Z.S.heroes[0].down = false;
    // battle: the last enemy falls, the living Krpan plays victory once
    Z.go('travel'); const stop = Z.S.run.stops.find(s => s.kind === 'battle'); Z.stopBattle(stop); await wait(150);
    const be = () => Z.HEROES.map((h, i) => [h.id, i]).find(([id]) => id === 'krpan')[1];
    out.battleIdle = row(document.querySelectorAll('.party .spr')[be()]);
    // the real path: the enemies fall, checkEnd runs 650 ms later, the salute plays, Zmaga! opens 900 ms after that
    Z.B.enemies.forEach(e => { if (e.hp > 0) Z.damageEnemy(e, 9999); }); await wait(760);
    const bk = document.querySelectorAll('.party .spr')[be()];
    out.cheer = { has: bk.classList.contains('cheer'), ...look(bk) };
    await wait(1000); const h2 = document.querySelector('.overlay h2'); out.resultShown = !!(h2 && h2.textContent === 'Zmaga!');
    localStorage.removeItem('zg-fidelity'); return out; });
  check(st && /\bhi-run\b/.test(st.cls) && /\bhi-win\b/.test(st.cls) && /\bhi-down\b/.test(st.cls) && st.kurentHi === false,
    'Krpan in Visoka carries his running, victory and down rows; a hero without a pack keeps the old sprite', JSON.stringify(st && { cls: st.cls, kurentHi: st.kurentHi }));
  check(st && st.stand.row === st.want.idle && st.walking && st.walk.row === st.want.run && st.walk.anim === 'hiplay',
    'on the road he stands in idle and runs his own four-frame loop while the party walks', JSON.stringify(st && { stand: st.stand, walk: st.walk, want: st.want }));
  check(st && st.downWalk.row === st.want.down && st.downWalk.anim === 'none' && st.downWalk.transform === 'none' && /grayscale/.test(st.downWalk.filter),
    'down, he holds the kneel even while the party walks: upright (not turned on his side), greyed, still', JSON.stringify(st && st.downWalk));
  check(st && st.battleIdle === st.want.idle && st.cheer.has && st.cheer.row === st.want.win && st.cheer.anim === 'hiplay' && st.resultShown,
    'when the last enemy falls he plays the victory salute, then Zmaga! opens', JSON.stringify(st && { battleIdle: st.battleIdle, cheer: st.cheer, resultShown: st.resultShown }));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
