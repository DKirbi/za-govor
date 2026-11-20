// Balance simulator, the bot side (not part of the game build). tools/sim/run.js loads the built game (dist/index.html)
// in headless Chrome, adds this file to the page and plays whole journeys with it, on the game's own clock: the bot
// calls battleTick and runLater itself, a tenth of a second at a time, so a ten-minute journey takes a second or two.
// Everything the game does runs as it is: the enemies, the heroes' kits, potions, relics, chests, traps, wells, the
// pedlar, gods' gifts, withdrawing and the bosses. Only the player is a model:
//   - a word every `pace` seconds (each gap drawn between 0.6 and 1.4 × pace), chosen from the words the mesh really
//     holds (allWords), with a preferred length drawn from `lens`, avoiding words whose base form was used;
//   - the zagovor is spoken as soon as it is full; a crossword entry takes `cw` × pace seconds;
//   - chests, rock slides and spikes end by chance (`chest`, `rocks`, `spikes`); the pedlar sells by a fixed list;
//   - the first shrine is prayed at; every hero who waits on the road joins while there is room;
//   - skill points are spent wherever the game lets them be spent (canGrow), one point at a time round the party:
//     learn the next skill first, then raise the lowest rank.
// The parameters are assumptions about players, not measurements; the testers' statistics (src/stats.js) should replace them.
(() => {
  const SIM = window.__SIM = {};
  // Pure visuals and sound do nothing in the simulator (they change no game state); this makes a journey ~3× faster.
  // Function declarations of the game's classic scripts are properties of window, so the game calls these instead.
  const quiet = ['sfx', 'chorus', 'floatOn', 'spawnCard', 'attackAnim', 'shakeEl', 'replay', 'fitScreen', 'fitSoon', 'cheerParty', 'renderLog', 'renderCoach', 'dartsVolley', 'layoutTravel', 'toast'];
  SIM.quiet = on => quiet.forEach(f => { if (typeof window[f] !== 'function') return; SIM['_' + f] = SIM['_' + f] || window[f]; window[f] = on ? () => {} : SIM['_' + f]; });
  SIM.quiet(true);
  // where the damage on enemies comes from: heroes' skills, burns and poison, or the rest (zagovor, gifts, the party's blow)
  const DMG = SIM.dmg = { hero: 0, burn: 0, other: 0 };
  if (!SIM._damageEnemy) {
    SIM._damageEnemy = window.damageEnemy;
    window.damageEnemy = (e, amount, opts = {}) => { const before = e && e.hp > 0 ? e.hp : 0, d = SIM._damageEnemy(e, amount, opts), real = before - Math.max(0, e ? e.hp : 0);
      DMG[opts.burn ? 'burn' : opts.by != null && opts.by >= 0 ? 'hero' : 'other'] += real; return d; };
  }
  const rndIn = (a, b) => a + Math.random() * (b - a);
  const draw = w => { const keys = Object.keys(w), tot = keys.reduce((s, k) => s + w[k], 0); let r = Math.random() * tot; for (const k of keys) { r -= w[k]; if (r <= 0) return +k; } return +keys[keys.length - 1]; };
  const ROOTS = () => ({ WORLD, LV_XP, DIFFS, ENEMIES, LEVELS, ITEMS });
  // overrides: { 'WORLD.balance.hp': [...], 'LV_XP': [...], 'DIFFS.lahka.foeHp': 0.9, ... } (objects are changed in place)
  SIM.set = ov => {
    const R = ROOTS();
    for (const [path, val] of Object.entries(ov || {})) {
      const parts = path.split('.'), root = R[parts[0]];
      if (!root) throw new Error('unknown root ' + parts[0]);
      if (parts.length === 1) { if (Array.isArray(root)) { root.length = 0; val.forEach(v => root.push(v)); } else Object.assign(root, val); continue; }
      let o = root; for (let i = 1; i < parts.length - 1; i++) o = o[parts[i]];
      o[parts[parts.length - 1]] = JSON.parse(JSON.stringify(val));
    }
  };
  SIM.get = paths => { const R = ROOTS(), out = {}; paths.forEach(p => { const parts = p.split('.'); let o = R[parts[0]]; for (let i = 1; i < parts.length; i++) o = o && o[parts[i]]; out[p] = o; }); return out; };

  const DEF = {
    know: 'malcek', pace: 10, cw: 1.0,
    lens: { 3: 25, 4: 35, 5: 25, 6: 12, 7: 3 },
    chest: { win: 0.8, part: 0.1 },                 // else the lock jams
    rocks: { 4: 40, 3: 30, 2: 15, 1: 5, 0: 10 },     // rocks a rock-slide word breaks (0: no word in time)
    spikes: { 6: 25, 5: 25, 4: 25, 3: 15, 0: 10 },   // slots a word closes (0: no real word)
    buy: ['ziva-voda', 'alatir', 'perunova-sekira', 'svarogovo-kladivo', 'mrtva-voda', 'ziva-voda', 'vesnin-venec', 'perunova-medica', 'triglavov-napoj', 'kresna-zerjavica'],
    pray: true, join: true, maxT: 1500,
  };

  // ---------------------------------------------------------------- skill points: learn the next skill, then the lowest rank
  function spendAll() {
    if (!S.run) return 0;
    let spent = 0;
    for (let guard = 0; guard < 60; guard++) {
      let any = false;
      for (let k = 0; k < S.heroes.length; k++) {
        const st = S.heroes[k]; if (!canGrow(st)) continue;
        const learn = [1, 2, 3].find(t => canLearn(st, t));
        const up = [1, 2, 3].filter(t => canUpgrade(st, t)).sort((a, b) => st.sk[a - 1] - st.sk[b - 1] || a - b)[0];
        const t = learn || up; if (t && spendPoint(k, t)) { any = true; spent++; }
      }
      if (!any) break;
    }
    return spent;
  }

  // ---------------------------------------------------------------- a battle
  function playWord(o, used) {
    const words = allWords(400); if (!words.size) return false;
    const all = [...words.entries()];
    const fresh = all.filter(([w]) => !used.has(LEMMA.get(w) || w));
    const pool = fresh.length ? fresh : all;
    const want = draw(o.lens);
    let best = null;
    for (let d = 0; d < 6 && !best; d++) {
      const c = pool.filter(([w]) => w.length === want - d || w.length === want + d);
      if (c.length) best = c[Math.floor(Math.random() * c.length)];
    }
    if (!best) best = pool[0];
    const [w, path] = best; used.add(LEMMA.get(w) || w);
    resolveWord(w, path.slice());
    return true;
  }
  function solveEntry() {
    const C = B.cw; if (!C) return;
    const order = C.D.entries.map((e, k) => k).filter(k => !C.solved.has(k)).sort((a, b) => (C.D.entries[a].geslo ? 1 : 0) - (C.D.entries[b].geslo ? 1 : 0));
    const k = order[0]; if (k == null) return;
    const e = C.D.entries[k];
    for (let p = 0; p < e.answer.length; p++) C.fill.set(cellKey(e, p), e.answer[p].toLowerCase());
    C.cur = { e: k, p: 0 };
    cwCheck();
  }
  function fight(stop, o, J) {
    stopBattle(stop);
    const b = B, used = new Set(), dt = 0.1, R = S.run, ri = R.ri;
    const hp0 = S.partyHp, max0 = S.maxHp, n0 = HEROES.length;
    let next = o.pace * rndIn(0.6, 1.4), cwT = null, t = 0, words = 0;
    while (S.screen === 'battle' && t < o.maxT) {
      t += dt; runLater(dt);
      if (S.screen !== 'battle' || !B) break;
      battleTick(dt);
      if (S.screen !== 'battle' || !B || B.over) continue;
      if (B.cw) { if (cwT == null) cwT = o.pace * o.cw * rndIn(0.6, 1.4); cwT -= dt; if (cwT <= 0) { solveEntry(); cwT = null; } continue; }
      cwT = null;
      if (B.meter >= METER_MAX) { openFinisher(); continue; }
      next -= dt; if (next <= 0) { if (playWord(o, used)) words++; next = o.pace * rndIn(0.6, 1.4); }
    }
    // let the result come (it waits on the game clock)
    for (let i = 0; i < 100 && S.screen === 'battle'; i++) runLater(dt);
    let win;
    if (S.screen === 'result') { win = !!b.won; S.resultEl.remove(); }
    else { win = false; J.stalls++; b.over = true; b.won = false; S.resultNode = b.node; showResult(false); S.resultEl.remove(); }
    J.battles.push({ ri, kind: stop.kind, n: stop.enemies.length, heroes: n0, win, t: Math.round(t), words,
      drain: max0 ? +((hp0 - (win ? S.partyHp : 0)) / max0).toFixed(3) : 0, hpStart: max0 ? +(hp0 / max0).toFixed(3) : 0 });
    J.snap = { lv: S.heroes.map(st => st.lvl), party: HEROES.map(x => x.id), sk: S.heroes.map(st => st.sk.join('')), gold: R.gold, relics: R.relics.slice() };
    afterResult(win);
    // the hero screen after a win: walk on
    if (S.screen === 'hero' && S.heroArg) { spendIfAllowed(o, 'after'); S.heroArg.next(); }
    return win;
  }
  // Balance D let points be spent after every battle, E only at wells and signposts: the bot follows trainAction
  function spendIfAllowed(o, where) {
    if (where === 'after') { const R = S.run; if (R && R.pts != null && typeof gainPartyXp === 'function') spendAll(); return; }   // only in balance D builds
    spendAll();
  }

  // ---------------------------------------------------------------- the other stops
  function chest(stop, o) {
    go('chest', { id: 'skrinja', stop });
    const E = S.ev, r = Math.random();
    if (r < o.chest.win) {
      const pickIdx = [], taken = new Set();
      for (const ch of E.item.w) { const i = E.letters.findIndex((l, j) => !taken.has(j) && l.ch === ch); taken.add(i); pickIdx.push(i); }
      E.sel = pickIdx; chestSubmit();
    } else if (r < o.chest.win + o.chest.part) {
      E.done = true; E.win = false; const g = gainGold(Math.max(1, Math.round(12 * 0.6))); E.partial = { w: '', gold: g, share: 0.6 };
    } else { E.time = 0; chestTick(0.1); }
    finishEvent();
  }
  function slide(stop, o) {
    go('trap', { id: 'plaz', stop });
    const E = S.ev, b = draw(o.rocks);
    if (b === 0) { E.rocks.forEach(() => { S.partyHp = Math.max(1, S.partyHp - TRAP_HIT); }); }
    else { const miss = E.rocks.length - b; if (miss) S.partyHp = Math.max(1, S.partyHp - miss * TRAP_GRAZE); gainGold(TRAP_GOLD * b); }
    E.done = true; finishEvent();
  }
  function spikes(stop, o) {
    go('darts', { id: 'puscice', stop });
    dartsEnd(draw(o.spikes), '', 'ok'); finishEvent();
  }
  function well(stop) {
    S.heroes.forEach(st => { if (!st.down) st.hp = st.maxHp; });
    stop.done = stop.passed = true;
    spendAll();
  }
  function shop(stop, o) {
    const R = S.run;
    for (const id of o.buy) {
      const s = stop.stock.find(x => x.id === id && !x.sold), it = ITEMS[id];
      if (!s || R.gold < it.price) continue;
      R.gold -= it.price; giveItem(id); if (it.kind === 'relic') s.sold = true;
    }
    stop.done = stop.passed = true;
  }

  // ---------------------------------------------------------------- one journey
  SIM.journey = opts => {
    const o = { ...DEF, ...opts };
    LATER.length = 0; G.paused = false; G.tut = null;
    S.know = o.know; S.mode = 'real'; S.tutOn = false; S.testMode = false;
    const starter = o.starter || pick(STARTERS);
    newRun(starter); go('travel');
    const J = { know: o.know, pace: o.pace, starter, won: false, lostAt: null, stalls: 0, battles: [], regions: [] };
    DMG.hero = DMG.burn = DMG.other = 0;
    const last = WORLD.regions.length - 1;
    for (let guard = 0; guard < 400; guard++) {
      const R = S.run; if (!R) break;
      const stop = R.stops.find(s => !s.passed);
      if (!stop) {
        J.regions.push({ ri: R.ri, lv: S.heroes.map(st => st.lvl), xp: S.heroes.map(st => st.xp), sk: S.heroes.map(st => st.sk.join('')), party: HEROES.map(x => x.id), down: S.heroes.filter(st => st.down).length });
        if (R.ri >= last) break;
        spendAll();   // the signpost (balance E); in balance D points are spent wherever
        enterRegion(R.ri + 1); go('travel'); continue;
      }
      if (stop.enemies) {
        const win = fight(stop, o, J);
        if (!S.run) { J.lostAt = { ri: J.battles[J.battles.length - 1].ri, kind: stop.kind, enemies: stop.enemies.join(' ') }; break; }
        if (S.screen === 'ending' || (win && stop.kind === 'boss' && R.ri === last)) {
          J.won = true; J.regions.push({ ri: R.ri, lv: S.heroes.map(st => st.lvl), xp: S.heroes.map(st => st.xp), sk: S.heroes.map(st => st.sk.join('')), party: HEROES.map(x => x.id), down: S.heroes.filter(st => st.down).length });
          break;
        }
        if (!win && S.run && S.run.prompt) S.run.prompt = null;   // withdrew: the same stop waits
        continue;
      }
      if (stop.kind === 'chest') chest(stop, o);
      else if (stop.kind === 'trap') slide(stop, o);
      else if (stop.kind === 'darts') spikes(stop, o);
      else if (stop.kind === 'well') well(stop);
      else if (stop.kind === 'shop') shop(stop, o);
      else if (stop.kind === 'hero') { if (o.join && HEROES.length < 4) joinHero(stop.hero); stop.done = stop.passed = true; }
      else if (stop.kind === 'god') { const R2 = S.run; if (o.pray && !R2.prayer && partyGod() < 0) { R2.prayer = stop.god; if (!R2.gifts.includes(stop.god)) R2.gifts.push(stop.god); } stop.done = stop.passed = true; }
      else stop.passed = true;
      go('travel');
    }
    const R = S.run;
    J.rescues = R ? R.rescues || 0 : null; J.finalRetry = R ? !!R.finalRetry : null;
    J.end = J.snap || null; delete J.snap; J.dmg = { ...DMG };
    if (!J.won && !J.lostAt) J.lostAt = { ri: R ? R.ri : -1, kind: 'stuck' };
    LATER.length = 0; resetRun(); go('title');
    return J;
  };
})();
