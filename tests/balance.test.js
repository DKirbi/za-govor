// Balance E (0.17.0, 20 Nov 2026): every hero levels on their own, more slowly, with one point of their own a level,
// spent only at wells and signposts; three battles a region and one chest or trap; enemies grow more steeply in the
// second half, tougher bosses, Knjižni molj steeper. Kept from balance D (0.13.0): a third enemy from Bled, strong
// enemies from Trnovski gozd, at most one Pesjan; Ptuj the same on every Znanje; the Lintvern (Kremplji, Topot,
// Ognjeni dih with scorched letters, wyverns, nothing stops him, delays halved); the zagovor's level bonus halved.
// Numbers: data/world.json → balance, ENEMIES and LV_XP in src/game.js, docs/progression-design.md §4c.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Balance E: own levels, enemy curve, bosses and the Lintvern');

const ev = (page, fn, ...args) => page.evaluate(fn, ...args);
// a journey on this Znanje with this party, standing in region ri (calm mode: enemies wait for words)
const journey = (page, know, party, ri = 0) => ev(page, (know, party, ri) => {
  const Z = window.__ZG; if (Z.B) Z.B.over = true;
  document.querySelectorAll('.overlay').forEach(o => o.remove());
  Z.S.know = know; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun(party[0]); party.slice(1).forEach(id => Z.joinHero(id));
  if (ri) Z.enterRegion(ri);
  return Z.S.run.stops.map(s => ({ kind: s.kind, n: s.enemies ? s.enemies.length : 0, enemies: s.enemies || null, strong: s.strong }));
}, know, party, ri);

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  // ---- every hero levels on their own, more slowly than balance D's party; one point of their own a level
  const lv = await ev(page, () => { const Z = window.__ZG; return { xp: Z.LV_XP.join(), pts: Z.PTS_PER_LV }; });
  check(lv.xp === '0,70,180,360,640,1000,1500,2200,3100' && lv.pts === 1, 'levels at 70 / 180 / 360 / 640 / 1000 / 1500 / 2200 / 3100 XP, one point each', JSON.stringify(lv));
  await journey(page, 'malcek', ['krpan', 'kurent']);
  const up = await ev(page, () => { const Z = window.__ZG, R = Z.S.run, H = Z.S.heroes; H[0].hp = 5; H[1].down = true; H[1].hp = 0;
    Z.addXp(0, 190); Z.addXp(1, 75); const out = { pool: R.pts, lvls: H.map(h => h.lvl), xp: H.map(h => h.xp), pts: H.map(h => h.pts), hp0: [H[0].hp, H[0].maxHp], down: [H[1].down, H[1].hp, H[1].maxHp] };
    Z.joinHero('erazem'); out.joiner = { lvl: H[2].lvl, xp: H[2].xp, pts: H[2].pts, sk: H[2].sk.join() }; return out; });
  check(up.pool === undefined && up.lvls.join() === '3,2' && up.xp.join() === '190,75' && up.pts.join() === '2,1', 'each hero\'s XP lifts only them: 190 XP make level 3 with two points, 75 XP level 2 with one', JSON.stringify(up));
  check(up.hp0[0] === up.hp0[1] && up.down[0] && up.down[1] === 0 && up.down[2] > 30, 'a new level heals a hero standing; a fallen hero stays down (with the new maximum)', JSON.stringify(up));
  check(up.joiner.lvl === 2 && up.joiner.xp === 70 && up.joiner.pts === 1 && up.joiner.sk === '1,0,0', 'a hero who joins arrives at the level of the party\'s lowest hero, knowing skill 1, with the points of those levels', JSON.stringify(up.joiner));
  const spend = await ev(page, () => { const Z = window.__ZG; return [Z.spendPoint(2, 2), Z.spendPoint(0, 1), Z.spendPoint(1, 2), Z.spendPoint(2, 3), Z.S.heroes.map(h => h.pts).join(), Z.S.heroes.map(h => h.sk.join()).join(' | ')]; });
  check(spend.slice(0, 5).join() === 'true,true,true,false,1,0,0', 'a hero spends only their own points', JSON.stringify(spend));

  // ---- enemies by region: Ptuj 1, 1, 2, 2; three battles in every other region (Game Director, 20 Nov: more enemies)
  const ptuj = await journey(page, 'malcek', ['krpan']);
  check(ptuj.filter(s => s.kind === 'battle').map(s => s.n).join() === '1,1,2,2', 'Ptuj: four battles of 1, 1, 2 and 2 enemies', JSON.stringify(ptuj.map(s => s.kind + s.n)));
  const fights = await ev(page, () => window.__ZG.WORLD.regions.map(r => r.stops.filter(k => ['battle', 'elite', 'boss'].includes(k)).length).join());
  check(fights === '4,3,3,3,3,3,3,3,3,1', 'three battles in every region from Peca to Ljubljanica (the ambush and Povodni mož count), the Lintvern alone at the castle', fights);
  const sizes = await ev(page, () => { const Z = window.__ZG, reg = Z.WORLD.regions, out = {};
    Z.setParty(['krpan']); out.solo = Z.groupSize(reg[3], 3, 'battle', 0);
    Z.setParty(['krpan', 'kurent']); out.two = Z.groupSize(reg[3], 3, 'battle', 0); out.ambushSolo = Z.groupSize(reg[6], 6, 'elite', 0);
    Z.setParty(['krpan', 'kurent', 'matjaz']); out.peca3 = Z.groupSize(reg[1], 1, 'battle', 0); out.bled3 = Z.groupSize(reg[3], 3, 'battle', 0);
    return out; });
  check(sizes.solo === 1 && sizes.two === 2 && sizes.peca3 === 2 && sizes.bled3 === 3, 'one enemy against a lone hero, two otherwise, three from Bled once the party has three heroes', JSON.stringify(sizes));
  const pesjan = await ev(page, () => { const Z = window.__ZG; Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz'); Z.joinHero('ajda'); let worst = 0;
    for (let i = 0; i < 300; i++) { const g = Z.enemyGroup(Z.WORLD.regions[5], 5, 'battle', 0); worst = Math.max(worst, g.filter(k => k === 'pesjan').length); } return worst; });
  check(pesjan === 1, 'never two Pesjani in one battle', String(pesjan));

  // ---- strong enemies from Trnovski gozd, about two battles in five
  const strong = await ev(page, () => { const Z = window.__ZG; let n = 0, early = 0;
    for (let i = 0; i < 1000; i++) { if (Z.rollStrong(4, 2) >= 0) n++; if (Z.rollStrong(3, 2) >= 0) early++; }
    Z.S.know = 'ucenjak'; Z.S.run.ri = 4; const plain = Z.makeEnemy('volkodlak', 0, Z.regionScale(4)), st = Z.makeEnemy('volkodlak', 0, Z.regionScale(4), true);
    return { share: n / 1000, early, plain: [plain.name, plain.maxHp, plain.atk], st: [st.name, st.maxHp, st.atk, st.strong] }; });
  check(strong.early === 0 && strong.share > 0.33 && strong.share < 0.47, 'from Trnovski gozd on about 40 % of battles have a strong enemy (none before)', JSON.stringify(strong));
  check(strong.st[0] === 'Silni volkodlak' && strong.st[1] === Math.round(45 * 1.6 * 1.6) && strong.st[2] === Math.round(6 * 1.2 * 1.25) && strong.st[3], 'a strong enemy: Silni …, ×1,6 health and ×1,25 attack', JSON.stringify(strong));

  // ---- region curve, Ptuj the same on every Znanje, Knjižni molj steepens
  const curve = await ev(page, () => { const Z = window.__ZG, R = Z.S.run, out = {};
    const at = (know, ri, key) => { Z.S.know = know; R.ri = ri; const e = Z.makeEnemy(key, 0, Z.regionScale(ri)); return [e.maxHp, e.atk, +e.speed.toFixed(2)]; };
    out.ptuj = ['malcek', 'ucenjak', 'molj'].map(k => at(k, 0, 'skrat')[0]);
    out.peca = at('ucenjak', 1, 'pesjan'); out.barje = at('ucenjak', 7, 'volkodlak');
    out.moljBarje = at('molj', 7, 'volkodlak'); out.ucBarje = at('ucenjak', 7, 'volkodlak');
    return out; });
  check(curve.ptuj.every(x => x === curve.ptuj[0]), 'Ptuj, the tutorial, has the same enemies on every Znanje', JSON.stringify(curve.ptuj));
  check(curve.peca[0] === Math.round(52 * 0.7) && curve.peca[1] === Math.round(7 * 0.8) && curve.barje[0] === Math.round(45 * 3.05) && curve.barje[1] === Math.round(6 * 1.75), 'enemies grow by region: Peca ×0,7 health and ×0,8 attack, Barje ×3,05 and ×1,75', JSON.stringify(curve));
  const steepHp = Math.round(45 * 3.05 * 1.5 * (1 + 0.35 * 7 / 9)), steepSpd = +(11 * (1 - 0.18 * 7 / 9)).toFixed(2);
  check(curve.moljBarje[0] === steepHp && curve.moljBarje[2] === steepSpd && curve.ucBarje[2] === 11, 'Knjižni molj steepens: by Barje more health and quicker attacks; Učenjak does not', JSON.stringify({ molj: curve.moljBarje, want: [steepHp, steepSpd], ucenjak: curve.ucBarje }));

  // ---- the bosses: Povodni mož with two vile; the Lintvern's health by Znanje and his wyverns by party size
  const boss = await ev(page, () => { const Z = window.__ZG, R = Z.S.run, out = {};
    Z.S.know = 'ucenjak'; R.ri = 8; out.povodni = Z.makeEnemy('povodni', 0, Z.regionScale(8)); out.povodni = [out.povodni.maxHp, out.povodni.atk];
    out.vila = Z.makeEnemy('vila', 0, Z.regionScale(8)).maxHp; out.reka = Z.WORLD.regions[8].boss.join();
    R.ri = 9; out.dragon = ['malcek', 'ucenjak', 'molj'].map(k => { Z.S.know = k; return Z.makeEnemy('lintvern', 0, Z.regionScale(9)).maxHp; });
    out.wyvern = Z.makeEnemy('zmajcek', 0, Z.regionScale(9)).maxHp;
    const reg = Z.WORLD.regions[9]; out.adds = [['krpan'], ['krpan', 'kurent'], ['krpan', 'kurent', 'ajda'], ['krpan', 'kurent', 'ajda', 'erazem']].map(p => { Z.setParty(p); return Z.bossGroup(reg).join(' '); });
    return out; });
  check(boss.povodni.join() === '260,16' && boss.reka === 'vila,povodni,vila' && boss.vila === Math.round(30 * 3.65), 'Povodni mož: 260 health (less than the Lintvern on every Znanje), hits 16, two vile beside him that grow with the region', JSON.stringify(boss));
  // his vile (Game Director, 20 Nov): in the boss battle they hit weaker and every third move heal him; with him unhurt they strike
  const escort = await ev(page, () => { const Z = window.__ZG; Z.S.know = 'malcek'; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.joinHero('kurent'); Z.enterRegion(8);
    Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'boss')); const B = Z.B, pov = B.enemies[1], v = B.enemies[0]; B.enemies.forEach(e => { e.charge = -99; });
    const out = { v: [v.maxHp, v.atk, v.pattern.join()], plain: Z.makeEnemy('vila', 0, Z.regionScale(8)).atk, pov: [pov.maxHp, pov.atk] };
    pov.hp = pov.maxHp - 30; v.step = 2; enemyAct(v); out.healed = pov.hp - (pov.maxHp - 30);
    pov.hp = pov.maxHp; v.step = 2; const hp0 = Z.S.partyHp; enemyAct(v); out.struck = hp0 - Z.S.partyHp; out.full = pov.hp === pov.maxHp;
    pov.hp = 0; v.step = 2; const hp1 = Z.S.partyHp; enemyAct(v); out.struckDead = hp1 - Z.S.partyHp; return out; });
  check(escort.v[1] === Math.max(1, Math.round(escort.plain * 0.75)) && escort.v[2] === 'attack,flood,heal' && escort.pov[0] === 221 && escort.pov[0] < 289,
    'beside Povodni mož the vile hit at 0,75 and every third move is Zdravilni val; on Malček he has less health than the Lintvern (289)', JSON.stringify(escort));
  check(escort.healed === Math.round(escort.pov[0] * 0.08) && escort.struck > 0 && escort.full && escort.struckDead > 0,
    'Zdravilni val heals him 8 % of his health; unhurt or fallen, the vila strikes instead', JSON.stringify(escort));
  check(boss.dragon.join() === [289, 320, 480].join() && boss.wyvern === Math.round(55 * 1.5 * 1.35), 'Lintvern: 289 / 320 / 480 health on Malček / Učenjak / Knjižni molj, the most of any enemy; wyverns do not grow by region (only by Znanje)', JSON.stringify(boss));
  check(boss.adds.join(' | ') === 'lintvern | zmajcek lintvern | zmajcek lintvern zmajcek | zmajcek lintvern zmajcek', 'one wyvern per hero beyond the first, at most two', boss.adds.join(' | '));

  // ---- the Lintvern in battle (Učenjak, a full party of three, the castle)
  await journey(page, 'ucenjak', ['krpan', 'kurent', 'ajda'], 9);
  const fight = await ev(page, () => { const Z = window.__ZG, stop = Z.S.run.stops.find(s => s.kind === 'boss'); Z.stopBattle(stop);
    const B = Z.B; B.enemies.forEach(e => { e.charge = -99; }); return { foes: B.enemies.map(e => e.key).join(), n: B.enemies.length }; });
  check(fight.foes === 'zmajcek,lintvern,zmajcek', 'three heroes meet the Lintvern with two wyverns', fight.foes);
  const charge = await ev(page, () => { const Z = window.__ZG, B = Z.B, e = B.enemies[1]; Z.damageEnemy(e, Math.ceil(e.maxHp * 0.36));
    const out = { charging: !!e.charging, speed: e.speed, calmStep: e.calmStep }; Z.damageEnemy(e, Math.ceil(e.maxHp * 0.32)); out.queued = e.breathQ; out.p2 = e.phase2on; out.n = B.enemies.length; out.waiting = B.queue.length; return out; });
  check(charge.charging && charge.speed === 8 && Math.abs(charge.calmStep - 1 / 3) < 1e-9, 'below 66 % he draws breath: 8 s on Učenjak (3 words in calm mode)', JSON.stringify(charge));
  check(charge.queued === 1 && charge.p2 && charge.n === 3 && charge.waiting === 2, 'below 33 % the next breath waits for the first; at half health he enrages and two more wyverns come, but wait in line: three on screen at most (24 Nov)', JSON.stringify(charge));
  const stopIt = await ev(page, () => { const Z = window.__ZG, e = Z.B.enemies[1], c0 = e.charge; e.stone = 2; Z.delayFoe(e, 4); return { moved: +(c0 - e.charge).toFixed(4), want: +(2 / e.speed).toFixed(4), stone: e.stone }; });
  check(stopIt.moved === stopIt.want, 'delays on the Lintvern are halved (4 s moves him 2 s)', JSON.stringify(stopIt));
  const breath = await ev(page, () => { const Z = window.__ZG, B = Z.B, e = B.enemies[1], hp = Z.S.heroes.map(h => h.hp);
    B.grid.forEach(t => { t.scorch = false; t.lockWords = 0; }); Z.breathe(e);
    return { charging: !!e.charging, again: e.breathQ, hit: Z.S.heroes.map((h, k) => hp[k] - h.hp), burn: { ...B.heroBurn }, scorched: B.grid.filter(t => t.scorch).length }; });
  check(breath.hit.every(d => d > 0) && Object.values(breath.burn).filter(n => n >= 4).length === breath.hit.length && breath.scorched === 10, 'Ognjeni dih hits and burns every hero and scorches ten letters', JSON.stringify(breath));
  check(breath.charging && breath.again === 0, 'the waiting breath starts charging right after', JSON.stringify(breath));
  const scorch = await ev(page, () => { const Z = window.__ZG, B = Z.B, i = B.grid.findIndex(t => t.scorch); B.grid[i].owner = 1; B.heroBurn = {};
    Z.scorchedUsed([i]); const used = { ...B.heroBurn }; const lit = B.grid.filter(t => t.scorch).length, hp = Z.S.heroes[1].hp;
    Z.calmDragonWord(); return { used, faded: lit - B.grid.filter(t => t.scorch).length, burnt: hp - Z.S.heroes[1].hp }; });
  check(scorch.used[1] === 4 && Object.keys(scorch.used).length === 1, 'a scorched letter in a word burns the hero of its colour (+4)', JSON.stringify(scorch));
  check(scorch.faded === 3 && scorch.burnt === 2, 'in calm mode, after a word, burns take two and three scorched letters fade', JSON.stringify(scorch));
  // the line (24 Nov): a fallen wyvern's place is taken after 2,5 s of game time; when the last one on screen falls,
  // the next steps in at once; the battle is won only when nobody waits any more
  const line = await ev(page, () => { const Z = window.__ZG, B = Z.B; B.enemies.forEach(e => { e.charge = -99; });
    Z.damageEnemy(B.enemies[0], 99999); const right = { alive: B.enemies.filter(e => e.hp > 0).length, waiting: B.queue.length };
    runLater(1); const early = B.enemies[0].hp > 0; runLater(2);
    const after = { key: B.enemies[0].key, alive: B.enemies[0].hp > 0, waiting: B.queue.length, n: B.enemies.length };
    B.enemies.forEach(e => { e.charge = -99; if (e.hp > 0) Z.damageEnemy(e, 99999); });
    const last = { alive: B.enemies.filter(e => e.hp > 0).map(e => e.key), waiting: B.queue.length, over: B.over };
    runLater(2); const stillOn = !B.over;
    B.enemies.forEach(e => { if (e.hp > 0) Z.damageEnemy(e, 99999); }); runLater(1);
    return { right, early, after, last, stillOn, over: B.over }; });
  check(line.right.alive === 2 && line.right.waiting === 2 && !line.early && line.after.alive && line.after.key === 'zmajcek' && line.after.waiting === 1 && line.after.n === 3 &&
    line.last.alive.join() === 'zmajcek' && line.last.waiting === 0 && line.stillOn && line.over,
    'a fallen wyvern\'s place is taken after a short while; the last one on screen is replaced at once; the battle ends when nobody waits', JSON.stringify(line));
  await ev(page, () => { const Z = window.__ZG; Z.go('battle', Z.B.node); });
  await sleep(300); await shot('balance-01-castle');

  // ---- the zagovor's level bonus is halved: ×1,4 at level 9
  const zag = await ev(page, () => { const Z = window.__ZG; Z.S.heroes.forEach(h => { h.lvl = 9; h.down = false; }); return Z.lvlMult(); });
  check(Math.abs(zag - 1.4) < 1e-9, 'the zagovor\'s level bonus is ×1,4 at level 9 (was ×1,8)', String(zag));

  // ---- balance E: even with points to spend, the hero screen after a battle offers no Veščine (only wells and signposts)
  await journey(page, 'malcek', ['krpan', 'kurent'], 1);
  await ev(page, () => { const Z = window.__ZG, stop = Z.S.run.stops.find(s => s.kind === 'battle'); Z.stopBattle(stop); Z.B.enemies.forEach(e => { e.hp = 1; e.charge = -99; }); Z.S.heroes[0].pts = 3; });
  await ev(page, () => { const Z = window.__ZG, B = Z.B, w = [...Z.allWords().keys()].find(x => x.length >= 4); Z.closeTut(); B.path = Z.findPath(w); B.typed = w; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); });
  await sleep(500);
  await ev(page, () => { const Z = window.__ZG, B = Z.B; if (B.enemies.some(e => e.hp > 0)) { B.enemies.forEach(e => Z.damageEnemy(e, 999)); } });
  for (let i = 0; i < 6 && (await ev(page, () => window.__ZG.S.screen)) !== 'hero'; i++) { await page.keyboard.press('Enter'); await sleep(500); }
  const foot = await ev(page, () => [...document.querySelectorAll('.hm-foot .btn')].map(b => b.textContent.trim()));
  check(foot.length === 1 && /Na pot/.test(foot[0]) && !(await ev(page, () => !!document.querySelector('.hm .skillbtn, .hm .hero.spr.glow'))), 'after a battle, even with points to spend, the hero screen offers only the way on', JSON.stringify(foot));
  await shot('balance-02-after');

  // ---- a save from 0.13.0–0.16.0 (the party's pool) loads hero by hero; one from before 0.17.0 gets its chests and traps planned
  await ev(page, () => { const Z = window.__ZG; Z.writeSave(); const s = JSON.parse(localStorage.getItem('zg-save'));
    s.run.pxp = 150; s.run.plvl = 3; s.run.pts = 3; delete s.run.eventAt; s.run.chestAt = [0, 2]; s.heroes.forEach(h => { h.lvl = 3; h.xp = 150; h.pts = 0; });
    localStorage.setItem('zg-save', JSON.stringify(s)); });
  await page.reload(); await sleep(1500);
  const loaded = await ev(page, () => { const Z = window.__ZG, ok = !!Z.SAVED && Z.loadSave(), R = Z.S.run;
    return { ok, gone: R && [R.pxp, R.plvl, R.pts, R.chestAt].every(x => x === undefined), events: R && R.eventAt && R.eventAt.length, lvls: Z.S.heroes.map(h => h.lvl), xp: Z.S.heroes.map(h => h.xp), pts: Z.S.heroes.map(h => h.pts) }; });
  check(loaded.ok && loaded.gone && loaded.events === 10 && loaded.lvls.every(l => l === 3) && loaded.xp.every(x => x === 180) && loaded.pts.join() === '2,1',
    'a balance D save loads hero by hero: each keeps their level (from its start on the new curve) and the pooled points are shared out; chests and traps are planned', JSON.stringify(loaded));
  await ev(page, () => { localStorage.removeItem('zg-save'); });

  // ---- tester statistics (src/stats.js): off until the player agrees, one row per journey battle, none of the words
  await ev(page, () => { window.__posted = []; window.fetch = async (url, o) => { window.__posted.push({ url, body: String(o && o.body) }); return {}; }; });
  const before = await ev(page, () => { const Z = window.__ZG; Z.go('newrun'); return { ok: Z.STATS_OK, card: !!document.querySelector('.stat-ask'), btns: [...document.querySelectorAll('.stat-ask .btn')].map(b => b.textContent.trim()) }; });
  check(before.ok === null && before.card && before.btns.join() === 'Da, pošiljaj,Ne, hvala', 'Nova pot asks once whether to send battle statistics; nothing is sent until then', JSON.stringify(before));
  await shot('balance-03-stats-ask');
  const quiet = await ev(page, () => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle'));
    Z.B.over = true; return { row: Z.statBattle(true), queued: Z.STATS.length, posted: window.__posted.length }; });
  check(quiet.row === null && quiet.queued === 0 && quiet.posted === 0, 'without a yes no battle is counted', JSON.stringify(quiet));
  const yes = await ev(page, () => { const Z = window.__ZG; Z.go('newrun'); document.querySelector('.stat-ask .btn.primary').click();
    return { ok: Z.STATS_OK, card: !!document.querySelector('.stat-ask'), thanks: (document.querySelector('.stat-done') || {}).textContent, stored: localStorage.getItem('zg-stats-ok') }; });
  check(yes.ok === true && !yes.card && /Nastavitvah/.test(yes.thanks) && yes.stored === '1', '»Da, pošiljaj« turns it on and the card thanks the player (the switch stays in Nastavitve)', JSON.stringify(yes));
  await ev(page, () => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.joinHero('kurent'); Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle')); Z.B.enemies.forEach(e => { e.charge = -99; }); });
  const word = await ev(page, () => { const Z = window.__ZG, B = Z.B, w = [...Z.allWords().keys()].find(x => x.length >= 4); Z.closeTut(); B.path = Z.findPath(w); B.typed = w; B.meshT = 12;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); return w; });
  await sleep(600);
  await ev(page, () => { const Z = window.__ZG, B = Z.B; Z.S.heroes[1].hp = 3; B.enemies.forEach(e => { if (e.hp > 0) Z.damageEnemy(e, 999); }); });
  await page.waitForFunction(() => window.__ZG.B.won === true && window.__posted.length, { timeout: 8000 }).catch(() => {});
  const row = await ev(page, () => ({ posted: window.__posted.map(p => Object.fromEntries(new URLSearchParams(p.body))), left: window.__ZG.STATS.length }));
  const r0 = row.posted[0] || {}, F = await ev(page, () => window.__ZG.REPORT_FORM.entry), meta = r0['entry.' + F.meta] || '';
  check(row.posted.length === 1 && r0['entry.' + F.word] === 'zmaga' && r0['entry.' + F.note] === 'statistika' && /^Ptuj · battle$/.test(r0['entry.' + F.where]) && row.left === 0,
    'a won battle sends one row (zmaga · Ptuj · battle, Opomba statistika); sent rows are not kept', JSON.stringify(row));
  check(/pot=[a-z0-9]{3,} · znanje=\w+ · tempo=mirni · naprava=namizje · v=[\d.]+/.test(meta) && /raven=1\/1 · tocke=0\/0/.test(meta) && /junaki=krpan\(\d+\) kurent\(\d+\)/.test(meta)
    && /sovrazniki=\S/.test(meta) && /besede=1 · s\/besedo=1[2-4]\.\d/.test(meta) && /zdravje=100→\d+%/.test(meta) && /padli=0\/2/.test(meta), 'the row has Znanje, pace, device, version, party, enemies, words and seconds per word on the mesh', meta);
  check(!meta.includes(word) && !Object.values(r0).some(v => String(v).includes(word)), 'none of the words played are sent', word);
  const practice = await ev(page, () => { const Z = window.__ZG; window.__posted.length = 0; const run = Z.S.run; Z.S.run = null; Z.go('battle', Z.NODES.find(n => n.battle && !n.stop) || { battle: { enemies: ['skrat'], scale: 1, meterStart: 0 }, title: 'Vaja', sub: '' });
    Z.B.over = true; const r = Z.statBattle(true); Z.S.run = run; return r; });
  check(practice === null, 'practice battles from the menu are not counted', String(practice));
  const end = await ev(page, () => { const Z = window.__ZG; window.__posted.length = 0; Z.S.run.battles = 3; const r = Z.statJourney(false), again = Z.statJourney(false); return { r, again }; });
  check(end.r && end.r.w === 'pot-končana' && /bitke=3/.test(end.r.meta) && /trajanje=\d+min/.test(end.r.meta) && end.again === null, 'a journey that ends sends one row (pot-končana, battles, minutes)', JSON.stringify(end));
  const off = await ev(page, () => { const Z = window.__ZG; window.fetch = async () => { throw new Error('offline'); }; Z.S.run.statDone = false; Z.statJourney(true); const waiting = Z.STATS.length;
    Z.go('settings'); const box = document.querySelector('.set-stats'), had = box.checked, note = (document.querySelector('.settings .muted') || {}).textContent;
    box.click(); return { waiting, had, note, now: Z.STATS_OK, queue: Z.STATS.length, stored: localStorage.getItem('zg-stats-ok') }; });
  check(off.waiting === 1 && off.had && /Čaka na pošiljanje: 1/.test(off.note) && off.now === false && off.queue === 0 && off.stored === '0', 'offline rows wait; switching it off in Nastavitve drops them', JSON.stringify(off));
  await ev(page, () => { localStorage.removeItem('zg-stats-ok'); });

  check(!errors.length, 'no page errors', errors.join(' | '));
  return ctx;
});
