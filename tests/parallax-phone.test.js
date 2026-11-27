// Codex's folk parallax packs on a phone, while the party runs (27 Nov 2026). tests/parallax.test.js measures each pack
// once, by jumping the walk; this one lets the game itself walk (travelTick, TV_SPEED) on four phone screens and reads
// every animation frame, the way a player sees it:
//   - every tiling layer moves, frame by frame, by the walked distance × its speed (on a phone the world is drawn at
//     0.62, so the lane moves 0.62 CSS px per world px) and nothing else moves it while the clouds' drift is off;
//   - chests, enemies, wells and the signpost on the road keep their place on the painted lane (they never slide);
//   - the heroes stay where they stand on the screen, run (the walking class), and their feet stay on the lane, whose
//     top does not jump while they run; front layers (near grass, rocks, flowers) never cover a foot;
//   - no hole: with the scene's own background turned magenta, no magenta pixel shows at the start, middle and end of
//     the region, nor in battle;
//   - every tiling picture is seamless where it meets itself;
//   - the clouds drift on their own (and only they) when motion is allowed, and in battle nothing but them moves.
// It also writes, per screen, a contact sheet of the road at the start, middle and end of every region and a battle
// (test-output/parallax-phone-<screen>-<region>-*.png) for the Game Director to look at.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { runner, sleep, OUT_DIR } = require('./harness');
const { check, run } = runner('Folk parallax on a phone while the party runs');

const PAGE_URL = 'file://' + path.resolve(__dirname, '../dist/index.html');
const REGIONS = [['ptuj', 0], ['peca', 1], ['triglav', 2], ['bled', 3], ['gozd', 4], ['piran', 5], ['predjama', 6], ['barje', 7], ['ljubljanica', 8], ['grad', 9]];
const SCREENS = [
  { id: '360x640', width: 360, height: 640, deviceScaleFactor: 3 },     // a small Android phone
  { id: '390x844', width: 390, height: 844, deviceScaleFactor: 3 },     // tests/harness.js PHONE
  { id: '412x915', width: 412, height: 915, deviceScaleFactor: 2.625 }, // Pixel 7
  { id: '844x390', width: 844, height: 390, deviceScaleFactor: 3 },     // a phone turned on its side
];
const SEG_MS = 2200;   // each walked stretch (start, middle, end of a region)
const only = (process.env.ZG_REGIONS || '').split(',').filter(Boolean);

function chromePath() {
  return [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean).find(p => fs.existsSync(p));
}

async function openPhone(browser, vp) {
  const page = await browser.newPage();
  await page.emulate({ viewport: { width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile' });
  const errors = [];
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console error: ' + m.text()); });
  await page.goto(PAGE_URL);
  await page.waitForFunction(() => !!window.__ZG);
  await page.evaluate(() => { window.__ZG.S.tutOn = false; });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);   // cloud drift off while measuring the walk
  await sleep(300);
  return { page, errors };
}

// ------------------------------------------------------------------ in the page
// Walk from x for ms, reading every frame after the game has moved: the walked distance, every layer's picture, every
// object on the road and every hero.
function walkFrames(x, ms) {
  return new Promise(resolve => {
    const Z = window.__ZG, R = Z.S.run, sc = document.querySelector('.scene');
    R.stops.forEach(s => { s.passed = true; });   // nothing stops the walk; the objects stay on the road
    R.prompt = null; R.x = x; R.walking = true;
    const out = [], t0 = performance.now();
    const read = () => {
      const f = { t: performance.now(), x: R.x, walking: sc.classList.contains('walking'), L: {}, O: [], P: [] };
      sc.querySelectorAll(':scope > .pbg-l').forEach(e => {
        const [px, py] = e.style.backgroundPosition.split(' ').map(parseFloat), [tw] = e.style.backgroundSize.split(' ').map(parseFloat);
        f.L[e.dataset.layer] = { x: px, y: py, tw };
      });
      sc.querySelectorAll(':scope > .tv-objs > .tv-obj').forEach((e, i) => {
        const m = /translateX\((-?[\d.]+)px\)/.exec(e.style.transform || '');
        if (m && e.style.visibility !== 'hidden') f.O.push({ i, x: parseFloat(m[1]) });
      });
      const r = sc.getBoundingClientRect();
      sc.querySelectorAll(':scope > .party .spr').forEach(e => {
        let y = 0, n = e; while (n && n !== sc) { y += n.offsetTop; n = n.offsetParent; }
        const b = e.getBoundingClientRect();
        f.P.push({ feet: y + e.offsetHeight, left: Math.round(b.left - r.left), drawnFeet: b.bottom - r.top });
      });
      out.push(f);
      if (performance.now() - t0 < ms && R.walking) requestAnimationFrame(read);
      else { R.walking = false; resolve(out); }
    };
    requestAnimationFrame(() => requestAnimationFrame(read));
  });
}

// how many magenta pixels show where the layers should cover the scene (actors, dimming and road objects hidden)
async function holes(page, vp) {
  await page.addStyleTag({ content: '.scene.pbg { background: #ff00ff !important; } .scene.pbg > :not(.pbg-l) { visibility: hidden !important; }' });
  await sleep(120);
  const box = await page.evaluate(() => { const r = document.querySelector('.scene').getBoundingClientRect(); return { x: r.left + 2, y: r.top + 2, width: r.width - 4, height: r.height - 4 }; });
  const png = await page.screenshot({ clip: box, encoding: 'base64' });
  await page.evaluate(() => { [...document.querySelectorAll('style')].filter(s => s.textContent.includes('#ff00ff !important')).forEach(s => s.remove()); });
  return page.evaluate(async b64 => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const a = g.getImageData(0, 0, im.width, im.height).data; let n = 0, top = im.height;
    for (let i = 0; i < a.length; i += 4) if (a[i] > 235 && a[i + 1] < 30 && a[i + 2] > 235) { n++; top = Math.min(top, Math.floor(i / 4 / im.width)); }
    return { n, of: im.width * im.height, firstRow: n ? top : null };
  }, png);
}

// whether a tiling picture meets itself without a seam: the jump from its last column to its first, against the
// largest jump between neighbouring columns inside the picture (paint only; transparent columns meet anything)
function seams(pid) {
  const P = window.__ZG.BGX.packs[pid];
  return Promise.all(P.layers.filter(l => l.tileX).map(async l => {
    const im = new Image(); im.src = l.src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, im.width, im.height).data, W = im.width, H = im.height;
    const colDiff = (x1, x2) => { let s = 0, n = 0; for (let y = 0; y < H; y++) { const i = (y * W + x1) * 4, j = (y * W + x2) * 4;
      if (d[i + 3] < 16 && d[j + 3] < 16) continue; s += Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]) + Math.abs(d[i + 3] - d[j + 3]); n++; }
      return n ? s / n : 0; };
    const inner = []; for (let x = 1; x < W; x += Math.max(1, Math.floor(W / 400))) inner.push(colDiff(x - 1, x));
    inner.sort((a, b) => a - b);
    const p99 = inner[Math.floor(inner.length * 0.99)] || 0, seam = colDiff(W - 1, 0);
    // a band of ground or water (not a landmark or a silhouette) must also meet its next copy without a gap: in every
    // row it fills almost entirely (below its uneven top fifth), no transparent run where the tile's end meets its start
    let gap = 0;
    if (/channel|water|river|lake|sea|lane|road|ground/.test(l.id)) {
      const rows = []; for (let y = 0; y < H; y++) { let n = 0; for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 128) n++; rows.push(n / W); }
      const full = rows.map((c, y) => c >= 0.85 ? y : -1).filter(y => y >= 0), from = full.length ? full[0] + Math.round((full[full.length - 1] - full[0]) * 0.2) : H;
      full.filter(y => y >= from).forEach(y => { let a = 0, b = 0; while (a < W && d[(y * W + a) * 4 + 3] <= 128) a++; while (b < W && d[(y * W + W - 1 - b) * 4 + 3] <= 128) b++; gap = Math.max(gap, a + b); });
    }
    return { id: l.id, seam: Math.round(seam), p99: Math.round(p99), gap, ok: seam <= Math.max(24, p99 * 1.5) && gap <= 2 };
  }));
}

run(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  try {
    let first = true;
    for (const vp of SCREENS) {
      const { page, errors } = await openPhone(browser, vp);
      const ev = (fn, ...a) => page.evaluate(fn, ...a);
      check(await ev(() => window.__ZG.S.mobile), `${vp.id}: the game takes the phone layout`);
      for (const [key, ri] of REGIONS) {
        if (only.length && !only.includes(key)) continue;
        const pid = `${key}-ljudska`, tag = `${key} @ ${vp.id}`;
        if (first) {   // the pictures are the same on every screen: once
          const sm = await ev(seams, pid);
          const bad = sm.filter(s => !s.ok);
          check(!bad.length, `${key}: every tiling picture is seamless where it meets itself`, bad.map(s => `${s.id}: seam ${s.seam} vs ${s.p99} inside, gap ${s.gap} px`).join('; ') || `${sm.length} pictures`);
        }
        await ev(ri => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.setBgForce('B'); Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz'); Z.enterRegion(ri); Z.go('travel'); }, ri);
        await sleep(300);
        const meta = await ev(pid => { const Z = window.__ZG, R = Z.S.run, sc = document.querySelector('.scene'), P = Z.BGX.packs[pid];
          return { pbg: sc.classList.contains('pbg'), W: sc.clientWidth, H: sc.clientHeight, endX: R.endX, stops: R.stops.map(s => s.x), k: Z.S.mobile ? 0.62 : 1,
            s: Math.max(sc.clientHeight / P.canvas.h, sc.clientWidth / P.canvas.w),
            layers: P.layers.map(l => ({ id: l.id, speed: l.speed, tileX: l.tileX, front: !!l.front, stand: l.stand, drift: l.drift || 0, w: l.w, scale: l.scale || 1 })) }; }, pid);
        check(meta.pbg, `${tag}: the folk pack draws the road`);
        const lane = meta.layers.find(l => l.stand != null), fronts = meta.layers.filter(l => l.front);
        // three stretches: the region's start, middle and end, each walked in real time
        const xs = [0, Math.max(0, meta.endX / 2 - 300), Math.max(0, meta.endX - SEG_MS / 1000 * 240 - 40)];
        const where = ['start', 'middle', 'end'];
        const bad = { speed: [], glue: [], feet: [], laneY: [], front: [], party: [], walk: [] };
        let frames = 0, maxGlue = 0, maxErr = 0, objsSeen = 0;
        for (let si = 0; si < 3; si++) {
          const F = await ev(walkFrames, xs[si], SEG_MS);
          frames += F.length;
          if (!F.some(f => f.walking)) bad.walk.push(where[si]);
          const laneY0 = F[0].L[lane.id].y, party0 = F[0].P.map(p => p.left).join();
          const unwrap = {}, glue = {};
          for (let i = 1; i < F.length; i++) {
            const a = F[i - 1], b = F[i], dx = (b.x - a.x) * meta.k;
            meta.layers.filter(l => l.tileX).forEach(l => {
              const A = a.L[l.id], Bm = b.L[l.id], tw = Bm.tw, want = -dx * l.speed;
              let moved = Bm.x - A.x; moved = ((moved - want) % tw + tw * 1.5) % tw - tw / 2 + want;   // the tile wraps
              const err = Math.abs(moved - want); maxErr = Math.max(maxErr, err);
              if (err > 1.01) bad.speed.push(`${where[si]} f${i} ${l.id}: ${moved.toFixed(1)} not ${want.toFixed(1)}`);
              if (l === lane) unwrap[i] = (unwrap[i - 1] ?? A.x) + moved;
            });
            // the road objects against the lane: their screen x minus the lane's (unwrapped) x stays put
            b.O.forEach(o => { const off = o.x - unwrap[i]; if (!(o.i in glue)) { glue[o.i] = off; objsSeen++; } else { const dv = Math.abs(off - glue[o.i]); maxGlue = Math.max(maxGlue, dv); if (dv > 1.01) bad.glue.push(`${where[si]} obj${o.i} slid ${dv.toFixed(1)} px`); } });
            if (b.L[lane.id].y !== laneY0) bad.laneY.push(`${where[si]} f${i}: ${b.L[lane.id].y} not ${laneY0}`);
            if (b.P.map(p => p.left).join() !== party0) bad.party.push(`${where[si]} f${i}`);
            b.P.forEach(p => { if (p.feet < b.L[lane.id].y + 2) bad.feet.push(`${where[si]} f${i}: feet ${p.feet} above lane ${b.L[lane.id].y}`); });
            fronts.forEach(fl => { const y = b.L[fl.id].y; if (b.P.some(p => y < p.feet - 1)) bad.front.push(`${where[si]} f${i} ${fl.id} at ${y}`); });
          }
          const hole = await holes(page, vp);
          if (hole.n) bad.walk.push(`${where[si]}: ${hole.n} magenta px from row ${hole.firstRow}`);
          await page.screenshot({ path: path.join(OUT_DIR, `parallax-phone-${vp.id}-${key}-${where[si]}.png`) });
        }
        check(!bad.walk.length, `${tag}: the party runs at the start, middle and end, and no hole shows behind the layers`, bad.walk.join('; '));
        check(frames > 60 && !bad.speed.length, `${tag}: frame by frame every tiling layer moves by the walked distance × its speed`, bad.speed.slice(0, 4).join('; ') || `${frames} frames, largest error ${maxErr.toFixed(2)} px (rounding)`);
        check(objsSeen > 0 && !bad.glue.length, `${tag}: road objects keep their place on the painted lane while the party runs`, bad.glue.slice(0, 4).join('; ') || `${objsSeen} objects, largest slide ${maxGlue.toFixed(2)} px`);
        check(!bad.laneY.length && !bad.party.length, `${tag}: the lane's top and the heroes' places on the screen stay put while they run`, [...bad.laneY, ...bad.party].slice(0, 4).join('; '));
        check(!bad.feet.length, `${tag}: the heroes' feet stay on the painted lane`, bad.feet.slice(0, 3).join('; '));
        check(!bad.front.length, `${tag}: front layers never cover a hero's feet`, bad.front.slice(0, 3).join('; ') || fronts.map(f => f.id).join(', ') || 'no front layer');

        // drift: with motion allowed and the party standing, only the drifting clouds move
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
        const still = await ev(async () => { const R = window.__ZG.S.run; R.walking = false; R.prompt = null; window.__ZG.go('travel');
          await new Promise(r => setTimeout(r, 200));
          const pos = () => Object.fromEntries([...document.querySelectorAll('.scene > .pbg-l')].map(e => [e.dataset.layer, parseFloat(e.style.backgroundPositionX)]));
          const a = pos(), t0 = performance.now(); await new Promise(r => setTimeout(r, 1500)); const b = pos();
          return { a, b, dt: (performance.now() - t0) / 1000 }; });
        // (a tiny drift may round to no visible pixel in 1.5 s: each layer is held to its own rate, ±1 px)
        const driftBad = meta.layers.filter(l => l.tileX).map(l => { const tw = Math.round(l.w * l.scale * meta.s), want = -l.drift * meta.s * still.dt;
          const moved = (((still.b[l.id] - still.a[l.id] - want) % tw) + tw * 1.5) % tw - tw / 2 + want;
          return { id: l.id, moved, want, bad: Math.abs(moved - want) > 1.01 }; });
        const rates = meta.layers.filter(l => l.drift).map(l => `${l.id} ${(-l.drift * meta.s).toFixed(2)} px/s`).join(', ');
        check(!driftBad.some(d => d.bad), `${tag}: standing still, only the drifting layers move, at their rate`, driftBad.filter(d => d.bad).map(d => `${d.id}: ${d.moved.toFixed(1)} not ${d.want.toFixed(1)}`).join('; ') || rates || 'no drift');
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

        // battle: still (camX null), the actors on the painted lane, front layers under the lowest feet, no hole
        await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle' || s.kind === 'boss')); Z.B.enemies.forEach(e => { e.charge = -99; }); });
        await sleep(500);
        const bt = await ev(async pid => {
          const sc = document.querySelector('.scene'), r = sc.getBoundingClientRect(), P = window.__ZG.BGX.packs[pid];
          const pos = () => [...sc.querySelectorAll(':scope > .pbg-l')].map(e => e.style.backgroundPosition).join('|');
          const a = pos(); await new Promise(res => setTimeout(res, 700)); const b = pos();
          const lane = P.layers.find(l => l.stand != null), laneTop = parseFloat(sc.querySelector(`[data-layer="${lane.id}"]`).style.backgroundPosition.split(' ')[1]);
          const feet = [...sc.querySelectorAll('.party .sp, .enemies .sp')].filter(e => e.getBoundingClientRect().width).map(e => Math.round(e.getBoundingClientRect().bottom - r.top));
          const fronts = P.layers.filter(l => l.front).map(l => Math.round(parseFloat(sc.querySelector(`[data-layer="${l.id}"]`).style.backgroundPosition.split(' ')[1])));
          return { still: a === b, laneTop: Math.round(laneTop), feet, fronts, H: Math.round(r.height) }; }, pid);
        check(bt.still, `${tag}: in battle the layers stand still`);
        check(bt.feet.length >= 4 && bt.feet.every(f => f >= bt.laneTop), `${tag}: in battle every hero and enemy stands on the painted lane`, JSON.stringify(bt));
        check(bt.fronts.every(y => y >= Math.max(...bt.feet)), `${tag}: in battle front layers stay under the lowest feet`, JSON.stringify({ fronts: bt.fronts, feet: bt.feet }));
        const bh = await holes(page, vp);
        check(!bh.n, `${tag}: no hole behind the battle`, bh.n ? `${bh.n} magenta px from row ${bh.firstRow}` : '');
        await page.screenshot({ path: path.join(OUT_DIR, `parallax-phone-${vp.id}-${key}-battle.png`) });
      }
      check(errors.length === 0, `${vp.id}: no page errors`, errors.join(' | '));
      await page.close();
      first = false;
    }
  } finally { await browser.close(); }
});
