// Codex's folk parallax packs in game (25–27 Nov 2026; tools/art_folk_parallax.py, data/backgrounds.json): each region's
// variant B, previewed with ?ozadje=B. The speeds are measured, not looked at: walking a known distance moves every
// tiling layer by distance × its speed; the lane the party walks on moves at exactly 1; nothing drawn in front of
// another layer moves slower than it (reflections excepted: they follow what they mirror); front layers stay under the
// feet; and in battle the actors stand on the painted lane, on a phone and on a desktop.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Folk parallax packs (variant B of all ten regions)');

const REGIONS = [['ptuj', 0], ['peca', 1], ['triglav', 2], ['bled', 3], ['gozd', 4], ['piran', 5], ['predjama', 6], ['barje', 7], ['ljubljanica', 8], ['grad', 9]];
// layers that stand on one another move together, or one slides along the other while the party walks (27 Nov 2026):
// the Piran house on its far shore, the Lokva falling out of Predjama's cliff, the Barje willows and pile dwellings in
// their channels, the Ljubljanski grad trees rooted at the lane's far edge
const GLUED = { piran: [['house', 'far-shore']], predjama: [['stream', 'castle-cliff']], barje: [['landmarks', 'channels']], grad: [['near-foreground-tree-frame', 'foreground-grass-lane']] };
const WALK = 1500;   // world px walked between the two measurements

run(async () => {
  const shots = [];
  for (const phone of [false, true]) {
    const ctx = await openGame({ phone, width: 1280, height: 800 });
    const { page, errors } = ctx;
    const ev = (fn, ...a) => page.evaluate(fn, ...a);
    const dev = phone ? 'phone' : 'desktop';
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);   // no cloud drift while measuring
    for (const [key, ri] of REGIONS) {
      const pid = `${key}-ljudska`;
      // the pack is built in, previewed as B, and its layers decode at their manifest size
      const info = await ev(async pid => { const P = window.__ZG.BGX.packs[pid]; if (!P) return null;
        const ok = await Promise.all(P.layers.map(l => new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth === l.w && im.naturalHeight === l.h); im.onerror = () => res(false); im.src = l.src; })));
        return { n: P.layers.length, webp: P.layers.every(l => l.src.startsWith('data:image/webp')), decoded: ok.every(Boolean), layers: P.layers.map(l => ({ id: l.id, speed: l.speed, tileX: l.tileX, front: l.front, stand: l.stand })) }; }, pid);
      if (!phone) {
        check(info && info.n >= 7 && info.webp && info.decoded, `${key}: the pack is built in, every layer WebP and decoded at its size`, JSON.stringify(info && { n: info.n, webp: info.webp, decoded: info.decoded }));
        const L = info.layers, lane = L.filter(l => l.stand != null);
        check(lane.length === 1 && lane[0].speed === 1 && lane[0].tileX, `${key}: the walking lane tiles at exactly 1.0`, JSON.stringify(lane));
        // back to front, nothing moves slower than what is behind it (reflections follow what they mirror)
        const moving = L.filter(l => l.tileX && !/reflection/.test(l.id));
        const breaks = moving.slice(1).filter((l, i) => l.speed + 1e-9 < moving[i].speed).map(l => l.id);
        check(!breaks.length, `${key}: speeds never decrease from back to front`, moving.map(l => `${l.id} ${l.speed}`).join(', '));
        check(L.filter(l => l.front).every(l => l.speed >= 1), `${key}: front layers move at least as fast as the lane`, JSON.stringify(L.filter(l => l.front)));
        check(L.filter(l => l.tileX && l.speed >= 0.2).length === L.filter(l => l.speed >= 0.2).length, `${key}: every layer at 0.2 or faster tiles, so it really scrolls with the walk`);
        (GLUED[key] || []).forEach(([a, b]) => { const A = L.find(l => l.id === a), Bl = L.find(l => l.id === b);
          check(A && Bl && A.speed === Bl.speed, `${key}: ${a} stands on ${b} and moves with it`, A && Bl ? `${A.speed} and ${Bl.speed}` : 'missing'); });
      }
      // walk: measure each tiling layer before and after WALK world px
      await ev((ri) => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.setBgForce('B'); Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz'); Z.enterRegion(ri); Z.go('travel'); }, ri);
      await sleep(250);
      const at = x => ev(async x => { const R = window.__ZG.S.run; R.prompt = null; R.walking = false; R.x = x; await new Promise(r => setTimeout(r, 160));
        const sc = document.querySelector('.scene'), out = {};
        sc.querySelectorAll(':scope > .pbg-l').forEach(e => { out[e.dataset.layer] = { x: parseFloat(e.style.backgroundPositionX), tw: parseFloat(e.style.backgroundSize) }; });
        return { out, k: window.__ZG.S.mobile ? 0.62 : 1, layers: [...sc.querySelectorAll(':scope > .pbg-l')].map(e => e.dataset.layer) }; }, x);
      const a = await at(200), b = await at(200 + WALK);
      const P = await ev(pid => window.__ZG.BGX.packs[pid].layers.map(l => ({ id: l.id, speed: l.speed, tileX: l.tileX })), pid);
      const bad = [];
      P.filter(l => l.tileX).forEach(l => {
        const A = a.out[l.id], Bm = b.out[l.id], tw = Bm.tw, want = -WALK * a.k * l.speed;
        let moved = Bm.x - A.x; moved = ((moved - want) % tw + tw * 1.5) % tw - tw / 2 + want;   // the tile wraps: compare modulo its width
        if (Math.abs(moved - want) > 2) bad.push(`${l.id}: ${Math.round(moved)} not ${Math.round(want)}`);
      });
      check(a.layers.length === P.length && !bad.length, `${key} (${dev}): after ${WALK} px every tiling layer moved by distance × speed`, bad.join('; ') || `${P.filter(l => l.tileX).length} layers`);
      shots.push(page.screenshot({ path: require('path').join(require('./harness').OUT_DIR, `parallax-${key}-${dev}-road.png`) }));
      await Promise.all(shots.splice(0));
      // battle: the actors stand on the painted lane; front layers stay under the lowest feet
      await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle' || s.kind === 'boss')); Z.B.enemies.forEach(e => { e.charge = -99; }); });
      await sleep(450);
      const feet = await ev(async pid => {
        const sc = document.querySelector('.scene'), r = sc.getBoundingClientRect(), P = window.__ZG.BGX.packs[pid];
        const lane = P.layers.find(l => l.stand != null), el = sc.querySelector(`[data-layer="${lane.id}"]`);
        const laneTop = parseFloat(el.style.backgroundPosition.split(' ')[1]);
        const sprites = [...sc.querySelectorAll('.party .sp, .enemies .sp')].filter(e => e.getBoundingClientRect().width).map(e => Math.round(e.getBoundingClientRect().bottom - r.top));
        const fronts = P.layers.filter(l => l.front).map(l => parseFloat(sc.querySelector(`[data-layer="${l.id}"]`).style.backgroundPosition.split(' ')[1]));
        return { laneTop: Math.round(laneTop), feet: sprites, fronts: fronts.map(Math.round), H: Math.round(r.height) }; }, pid);
      check(feet.feet.length >= 2 && feet.feet.every(f => f >= feet.laneTop), `${key} (${dev}): in battle every hero and enemy stands on the painted lane`, JSON.stringify(feet));
      check(feet.fronts.every(y => y >= Math.max(...feet.feet)), `${key} (${dev}): front layers stay under the lowest feet`, JSON.stringify(feet));
      await page.screenshot({ path: require('path').join(require('./harness').OUT_DIR, `parallax-${key}-${dev}-battle.png`) });
    }
    check(errors.length === 0, `no page errors (${dev})`, errors.join(' | '));
    await ctx.browser.close();
  }
});
