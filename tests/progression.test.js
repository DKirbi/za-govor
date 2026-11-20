// Reviewed heroes (src/progression.js): their own skill kits with ranks 1–3, experience from the fight
// (attacks + damage + the enemy's level: each hero their own share since balance E; the whole party's in balance D) and their health per level.
// Since balance D a reviewed hero fires every skill they know up to the number of their letters. The first check is the simplest case on
// purpose: Kurent alone against one škrat, two short words, and the XP adds up by hand.
// Words are three letters (×1 for length), no č/š/ž, not a hero's own word and never repeated, so a skill's
// damage is exactly its rank value at level 1. Battles run in calm mode: enemies only act when a check lets them.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Reviewed heroes: skill ranks, XP from the fight, health per level');

// a journey battle (region 1, Učenjak: enemy health ×1) with this party against these enemies
const battle = (page, party, foes = ['skrat']) => page.evaluate((party, foes) => {
  const Z = window.__ZG; if (Z.B) Z.B.over = true;
  document.querySelectorAll('.overlay').forEach(o => o.remove());
  Z.S.know = 'ucenjak'; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun(party[0]); party.slice(1).forEach(id => Z.joinHero(id));
  Z.go('battle', { ...Z.NODES[0], battle: { ...Z.NODES[0].battle, enemies: foes, tips: [] } });
  Z.B.enemies.forEach(e => { e.charge = -99; });   // the enemies wait
  return Z.B.enemies.map(e => ({ key: e.key, hp: e.hp, lvl: e.lvl }));
}, party, foes);
// play a word of `len` letters, `n` of them hero k's; returns the damage each enemy took
const play = (page, k, n, len = 3) => page.evaluate(async (k, n, len) => {
  const Z = window.__ZG, B = Z.B, used = (window.__used = window.__used || new Set());
  const dom = w => Z.HEROES.some(h => h.domain.includes(w) || h.domain.includes(Z.LEMMA.get(w) || w));
  const w = [...Z.allWords().keys()].find(x => x.length === len && !/[čšž]/.test(x) && !dom(x) && !used.has(Z.LEMMA.get(x) || x));
  used.add(Z.LEMMA.get(w) || w);
  const path = Z.findPath(w);
  path.forEach((i, j) => { B.grid[i].owner = j < n ? k : -1; B.grid[i].lockUntil = 0; B.grid[i].lockWords = 0; });
  B.target = 0; B.boost = 0; B.double = 1;
  const hp0 = B.enemies.map(e => e.hp);
  B.path = path; B.typed = w;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 500));
  return { w, dmg: hp0.map((x, i) => x - B.enemies[i].hp) };
}, k, n, len);
const ev = (page, fn, ...args) => page.evaluate(fn, ...args);

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  // 1. The simplest case: Kurent (skill 1, Ježevka, rank 1) against one škrat in the first region (level 1).
  //    Two attacks of 4 damage each beat it: XP = 2 attacks + 8 damage + level 1 = 11.
  const foes = await battle(page, ['kurent']);
  check(foes.length === 1 && foes[0].key === 'skrat' && foes[0].lvl === 1, 'a battle in the first region: one škrat of level 1', JSON.stringify(foes));
  await ev(page, () => { const e = window.__ZG.B.enemies[0]; e.charge = 0; });
  let p = await play(page, 0, 1);
  const charge = await ev(page, () => window.__ZG.B.enemies[0].charge);
  check(p.dmg[0] === 4, 'Ježevka at rank 1 hits for 4', JSON.stringify(p));
  check(Math.abs(charge - (0.25 - 2 / 8.5)) < 1e-9, 'Ježevka puts the škrat\'s next attack back 2 s (calm mode: the same share of its charge)', String(charge));
  await ev(page, () => { const e = window.__ZG.B.enemies[0]; e.hp = 4; e.charge = -99; });
  p = await play(page, 0, 1);
  const xp1 = await ev(page, () => ({ xp: window.__ZG.S.heroes[0].xp, log: window.__ZG.B.logLines.join(' | ') }));
  check(p.dmg[0] === 4 && xp1.xp === 11, 'the škrat is beaten: Kurent gets 2 attacks + 8 damage + level 1 = 11 XP', JSON.stringify({ ...p, xp: xp1.xp }));
  check(/Kurent \+11 XP/.test(xp1.log), 'the battle log says what XP each hero got', xp1.log);
  await sleep(1600);
  const res = await ev(page, () => (document.querySelector('.dialog .stats') || {}).textContent || '');
  check(/Izkušnje: Kurent/.test(res) && /11 XP/.test(res) && /napadi 2 · škoda 8 · raven 1/.test(res), 'the battle result shows each hero\'s XP and its parts', res);
  await shot('progression-01-result');

  // 2. Rank progression: points raise Ježevka to rank 2 (6) and rank 3 (8), and no further.
  //    Delays do not add up: a second Ježevka before the škrat acts moves nothing (the longest delay counts).
  await battle(page, ['kurent']);
  await ev(page, () => { const e = window.__ZG.B.enemies[0]; e.hp = e.maxHp = 999; e.charge = 0; });
  await play(page, 0, 1);
  const c1 = await ev(page, () => window.__ZG.B.enemies[0].charge);
  await play(page, 0, 1);
  const c2 = await ev(page, () => window.__ZG.B.enemies[0].charge);
  check(Math.abs(c2 - c1 - 0.25) < 1e-9, 'a second Ježevka before the enemy acts adds no delay', JSON.stringify({ c1, c2 }));
  const ranks = await ev(page, () => { const Z = window.__ZG, st = Z.S.heroes[0]; st.pts = 4;   // Kurent's own points (balance E)
    const r = [Z.spendPoint(0, 1), Z.spendPoint(0, 1), Z.spendPoint(0, 1)]; return { r, sk: st.sk.join(), pts: st.pts }; });
  check(ranks.r.join() === 'true,true,false' && ranks.sk === '3,0,0' && ranks.pts === 2, 'two points raise Ježevka to rank 3 and no further', JSON.stringify(ranks));
  await ev(page, () => { window.__ZG.S.heroes[0].sk[0] = 2; });
  p = await play(page, 0, 1);
  check(p.dmg[0] === 6, 'Ježevka at rank 2 hits for 6', JSON.stringify(p));
  await ev(page, () => { window.__ZG.S.heroes[0].sk[0] = 3; });
  p = await play(page, 0, 1);
  check(p.dmg[0] === 8, 'Ježevka at rank 3 hits for 8', JSON.stringify(p));
  const learn = await ev(page, () => { const Z = window.__ZG; return [Z.spendPoint(0, 3), Z.spendPoint(0, 2), Z.spendPoint(0, 3), Z.S.heroes[0].sk.join()]; });
  check(learn.join() === 'false,true,true,3,1,1', 'skill 3 waits for skill 2; then each is learned with one point', JSON.stringify(learn));
  // Zvonci: Kurent dances for 2 s (his letters out of the mesh), the bells hit for 3 and the škrat's next blow is 3 weaker
  await ev(page, () => { window.__ZG.S.heroes[0].sk = [1, 1, 1]; window.__ZG.B.enemies[0].hp = window.__ZG.B.enemies[0].maxHp = 999; });
  p = await play(page, 0, 2);
  const bells = await ev(page, () => { const Z = window.__ZG, B = Z.B, e = B.enemies[0], st = Z.S.heroes[0], hp0 = st.hp;
    const out = { busy: B.busy[0] > B.time, weak: e.weak && e.weak.by, grey: document.querySelectorAll('.puzzle .tile.sleep').length };
    Z.hurtParty(8, e); out.took = hp0 - st.hp; out.after = e.weak; const h1 = st.hp; Z.hurtParty(8, e); out.next = h1 - st.hp; return out; });
  check(p.dmg[0] === 4 + 3 && bells.busy && bells.weak === 3 && bells.took === 5 && !bells.after && bells.next === 8,
    'two letters fire Ježevka and Zvonci together (−4, −3); Kurent dances, the škrat\'s next blow is 3 weaker and the one after it is not', JSON.stringify({ ...p, ...bells }));
  // Pregon zime at rank 1: every enemy −4 and its next attack 3 s later
  await ev(page, () => { const Z = window.__ZG, e = Z.B.enemies[0]; Z.B.busy = {}; e.charge = 0.5; e.dlAmt = 0; });
  p = await play(page, 0, 3);
  const winter = await ev(page, () => window.__ZG.B.enemies[0].charge);
  check(p.dmg[0] === 4 + 3 + 4 && Math.abs(winter - (0.5 - 3 / 8.5 + 0.25)) < 1e-9, 'three letters fire all three: −4, −3, Pregon zime −4; the delays do not add up (the longest, 3 s, counts)', JSON.stringify({ ...p, winter }));

  // 3. Balance E: each hero standing gets their own share; one who did not strike gets only the enemy's level
  await battle(page, ['kurent', 'krpan']);
  await ev(page, () => { window.__ZG.B.enemies[0].hp = 4; });
  p = await play(page, 0, 1);
  const mixed = await ev(page, () => window.__ZG.S.heroes.map(st => st.xp));
  check(p.dmg[0] === 4 && mixed[0] === 1 + 4 + 1 && mixed[1] === 1, 'balance E: Kurent gets his own share of the fight (1 attack + 4 damage + level 1), Krpan, who did not strike, only the level', JSON.stringify({ ...p, xp: mixed }));

  // 4. Kralj Matjaž at rank 3: Meč 18 and a shield of 6 on each hero hit; Kraljeva vojska +10 on the next attack
  //    and the next two enemy blows 3 weaker; Prebujenje raises the fallen (15 %), heals 6 and hits every enemy for 12
  await battle(page, ['matjaz', 'krpan'], ['pesjan', 'pesjan']);
  await ev(page, () => { const Z = window.__ZG; Z.S.heroes[0].sk = [3, 3, 3]; Z.B.enemies.forEach(e => { e.hp = e.maxHp = 500; }); });
  p = await play(page, 0, 1);
  const ward = await ev(page, () => { const Z = window.__ZG, B = Z.B, w = B.ward, before = Z.S.heroes.map(s => s.hp);
    Z.hurtParty(10, B.enemies[0]); return { w, after: B.ward, lost: before.reduce((a, x, i) => a + x - Z.S.heroes[i].hp, 0) }; });
  check(p.dmg[0] === 18 && ward.w === 6 && ward.after === 0 && ward.lost === 4, 'Meč at rank 3: 18 damage, then the next blow of 10 lands as 4', JSON.stringify({ ...p, ...ward }));
  const krpanOwn = (await play(page, 1, 1)).dmg[0];
  p = await play(page, 0, 2);
  const rally = await ev(page, () => ({ rally: { ...window.__ZG.B.rally }, dampen: window.__ZG.B.dampen }));
  const krpanRallied = (await play(page, 1, 1)).dmg[0];
  check(p.dmg[0] === 18 && rally.rally[1] === 10 && rally.dampen.by === 3 && rally.dampen.left === 2 && krpanRallied === krpanOwn + 10,
    'two letters: Meč (18) and Kraljeva vojska at rank 3 — every hero\'s next attack +10 (Krpan hits 10 harder), the next two enemy blows −3', JSON.stringify({ krpanOwn, krpanRallied, ...rally, ...p }));
  const awake = await ev(page, () => { const Z = window.__ZG, st = Z.S.heroes; st[1].down = true; st[1].hp = 0; st[0].hp = st[0].maxHp - 10; Z.B.ward = 0; Z.B.rally = {}; return st[0].hp; });   // Matjaž's own +10 from Kraljeva vojska would still wait
  p = await play(page, 0, 3);
  const woke = await ev(page, () => { const st = window.__ZG.S.heroes; return { down: st[1].down, hp: st[1].hp, max: st[1].maxHp, m: st[0].hp, ward: window.__ZG.B.ward }; });
  check(!woke.down && woke.hp === Math.round(woke.max * 0.15) && woke.m === awake + 6 && woke.ward === 6 && p.dmg[0] === 18 + 12 + 10 && p.dmg[1] === 12,
    'three letters: Meč, Kraljeva vojska and Prebujenje at rank 3 — Krpan rises with 15 %, Matjaž +6, a shield of 6, every enemy −12 (the target also +10 from the army)', JSON.stringify({ ...woke, before: awake, ...p }));
  // support XP (Game Director, 20 Nov): the 6 his shield took off a blow, Krpan's 15 % and his own 6 healed, counted on the enemy struck at
  const sup = await ev(page, () => { const t = window.__ZG.B.enemies[0].tally || {}; return { m: (t.matjaz || {}).s, k: (t.krpan || {}).s || 0, parts: window.__ZG.foeXp(window.__ZG.B.enemies[0], 0) }; });
  check(sup.m === 6 + woke.hp + 6 && sup.k === 0 && sup.parts.n === sup.parts.a + sup.parts.d + sup.parts.s + sup.parts.lv,
    'healing and shields count as XP: Matjaž\'s shield (6 off a blow), Prebujenje (Krpan\'s 15 % and his own 6) go on the enemy\'s tally for him; Krpan gets none', JSON.stringify({ ...sup, risen: woke.hp }));

  // 5. Kresnik: the flaming sword hits a dragon 1,5× (12) and burns 2 a tick; Kresna moč gives back a quarter of the next wound, and half of that in gold
  await battle(page, ['kresnik'], ['mladic']);
  p = await play(page, 0, 1);
  const fire = await ev(page, () => { const e = window.__ZG.B.enemies[0]; return { turns: e.burnTurns, per: e.burnPer }; });
  check(p.dmg[0] === 8 && fire.turns === 2 && fire.per === 2, 'Ognjeni meč at rank 1: 5 × 1,5 (8) against the Zmajev mladič, burning 2 for 2 turns', JSON.stringify({ ...p, ...fire }));
  await ev(page, () => { window.__ZG.S.heroes[0].sk = [1, 1, 1]; });
  p = await play(page, 0, 3);
  const back = await ev(page, () => { const Z = window.__ZG, st = Z.S.heroes[0], g0 = Z.S.run.gold; st.hp = st.maxHp - 10; const h0 = st.hp;
    Z.hurtParty(8, Z.B.enemies[0]); return { got: st.hp - (h0 - 8), gold: Z.S.run.gold - g0, left: Object.keys(Z.B.restore).length }; });
  check(p.dmg[0] >= 5 && back.got === 2 && back.gold === 1 && back.left === 0, 'Kresna moč at rank 1: a flame of 5 on every enemy, then a wound of 8 gives back 2 health and 1 gold, once', JSON.stringify({ ...p, ...back }));

  // 6. Erazem: Skrivni rov at rank 2 — the blow misses him and he strikes back for 1,5 × Zamah z mečem (7 → 11)
  await battle(page, ['erazem', 'krpan']);
  await ev(page, () => { const Z = window.__ZG; Z.S.heroes[0].sk = [1, 1, 2]; Z.B.enemies[0].hp = Z.B.enemies[0].maxHp = 500; });
  p = await play(page, 0, 3);
  const rov = await ev(page, () => { const Z = window.__ZG, B = Z.B, e = B.enemies[0], st = Z.S.heroes, hp = st.map(s => s.hp), e0 = e.hp;
    Z.hurtParty(6, e, true); return { erazem: hp[0] - st[0].hp, krpan: hp[1] - st[1].hp, counter: e0 - e.hp, rov: B.rov }; });
  check(rov.erazem === 0 && rov.krpan === 3 && rov.counter === 11 && !rov.rov, 'Skrivni rov at rank 2: Erazem slips away, Krpan beside him is still hit, and the counterattack does 11', JSON.stringify(rov));
  const cherries = await ev(page, () => { const st = window.__ZG.S.heroes; st[0].hp = st[0].maxHp - 5; st[1].hp = st[1].maxHp - 5; return st.map(s => s.hp); });
  p = await play(page, 0, 2);
  const after = await ev(page, () => window.__ZG.S.heroes.map(s => s.hp));
  check(p.dmg[0] === 7 + 5 && after[0] === cherries[0] && after[1] === cherries[1] + 1, 'two letters: Zamah z mečem (7) and Češnje (5), +1 to the hero beside him, not to Erazem', JSON.stringify({ ...p, before: cherries, after }));

  // 7. Ajdovska deklica: Varstvo popotnikov takes the next blow on the others, halved; Okamnitev makes the enemy miss its attack
  await battle(page, ['ajda', 'krpan']);
  await ev(page, () => { const Z = window.__ZG; Z.S.heroes[0].sk = [1, 1, 1]; Z.B.enemies[0].hp = Z.B.enemies[0].maxHp = 500; });
  p = await play(page, 0, 2);
  const guard = await ev(page, () => { const Z = window.__ZG, st = Z.S.heroes, hp = st.map(s => s.hp);
    Z.hurtParty(10, Z.B.enemies[0], true); return { ajda: hp[0] - st[0].hp, krpan: hp[1] - st[1].hp, left: Z.B.guard }; });
  check(guard.krpan === 0 && guard.ajda === 5 + 3 && !guard.left, 'Varstvo popotnikov at rank 1: Krpan takes nothing, Ajdovska deklica her own 5 and half of his (3)', JSON.stringify(guard));
  const hp0 = await ev(page, () => { const Z = window.__ZG; Z.B.enemies[0].charge = 0.8; return Z.S.heroes.map(s => s.hp); });
  p = await play(page, 0, 3);
  await sleep(800);
  const stone = await ev(page, () => ({ hp: window.__ZG.S.heroes.map(s => s.hp), stone: window.__ZG.B.enemies[0].stone, log: window.__ZG.B.logLines.slice(0, 3).join(' | ') }));   // newest first
  check(p.dmg[0] === 6 && stone.hp.join() === hp0.join() && stone.stone === 0 && /okamnel/.test(stone.log), 'three letters: Metanje skal (6), Varstvo and Okamnitev — the škrat\'s next attack does not come', JSON.stringify({ ...stone, ...p, before: hp0 }));
  await shot('progression-02-ajda');

  // 8. Health per level: Ajdovska deklica a little more than the rest (+10 % a level, TEST), Kurent at least +1, Krpan unchanged
  const hp = await ev(page, () => { const Z = window.__ZG, lv = [...Array(9).keys()].map(i => i + 1);
    return { ajda: lv.map(l => Z.heroMaxHp('ajda', l)), kurent: lv.map(l => Z.heroMaxHp('kurent', l)), krpan: lv.map(l => Z.heroMaxHp('krpan', l)) }; });
  check(hp.ajda[0] === 38 && hp.ajda[8] === 68 && hp.krpan[8] === Math.round(36 * 1.64), 'level 9: Ajdovska deklica 68 health (normal growth would give 62), Krpan 59 as before', JSON.stringify(hp));
  check(hp.kurent.every((x, i) => !i || x - hp.kurent[i - 1] >= 1), 'Kurent gains at least 1 health every level', hp.kurent.join());

  // 9. Veščine shows each reviewed skill's own ranks, not the generic stopnje
  const panel = await ev(page, () => { const Z = window.__ZG; Z.S.heroes[0].pts = 1; Z.go('train', { back: () => Z.go('title') });
    return { rows: document.querySelectorAll('.train .sk').length, ups: document.querySelectorAll('.train .sk-ups li').length, text: (document.querySelector('.train .skills') || {}).textContent || '' }; });
  check(panel.rows === 3 && panel.ups === 6 && /Metanje skal/.test(panel.text) && /Kamni v vse sovražnike \(8\)/.test(panel.text) && !/učinki trajajo/.test(panel.text),
    'Veščine lists Metanje skal, Varstvo popotnikov and Okamnitev with their own rank 2 and 3', panel.text.slice(0, 400));
  await shot('progression-03-skills');

  // 10. Martin Krpan (reviewed 18 Nov): Lipov kij 10 / 16 / 20, Kmečka moč 8×2 / 20 / 22 split between two enemies, Mesarica 10 / 14 / 20 + a bleed
  const kp = async (sk, n, foes = ['skrat']) => { await battle(page, ['krpan'], foes);
    await ev(page, sk => { const Z = window.__ZG; Z.S.heroes[0].sk = sk; Z.B.enemies.forEach(e => { e.hp = e.maxHp = 999; e.dot = null; }); }, sk);
    const q = await play(page, 0, n); q.dot = await ev(page, () => window.__ZG.B.enemies.map(e => e.dot || null)); return q; };
  let q = await kp([1, 0, 0], 1);
  check(q.dmg[0] === 10, 'Krpan: Lipov kij rank 1 hits for 10', JSON.stringify(q));
  q = await kp([3, 0, 0], 1);
  check(q.dmg[0] === 20, 'Krpan: Lipov kij rank 3 hits for 20', JSON.stringify(q));
  q = await kp([1, 1, 0], 2);
  check(q.dmg[0] === 10 + 16, 'Krpan: Kmečka moč rank 1 is two punches of 8 on top of Lipov kij (26)', JSON.stringify(q));
  q = await kp([1, 2, 0], 2);
  check(q.dmg[0] === 10 + 20, 'Krpan: Kmečka moč rank 2 (the salt sacks) hits one enemy for 20', JSON.stringify(q));
  q = await kp([1, 3, 0], 2, ['skrat', 'skrat']);
  check(q.dmg[0] === 10 + 11 && q.dmg[1] === 11, 'Krpan: Kmečka moč rank 3 (the boulder) splits 22 between two enemies, 11 each', JSON.stringify(q));
  q = await kp([1, 3, 0], 2);
  check(q.dmg[0] === 10 + 22, 'Krpan: the boulder against one enemy deals all 22', JSON.stringify(q));
  q = await kp([1, 1, 1], 3);
  check(q.dmg[0] === 10 + 16 + 10 && q.dot[0] === 'krvavi', 'Krpan: Mesarica rank 1 hits for 10 and leaves a bleed (all three skills: 36)', JSON.stringify(q));
  q = await kp([1, 1, 3], 3);
  check(q.dmg[0] === 10 + 16 + 20, 'Krpan: Mesarica rank 3 hits for 20', JSON.stringify(q));
  const bleed = await ev(page, async () => { const Z = window.__ZG, e = Z.B.enemies[0]; const t0 = e.burnTurns, b = e.burn; await new Promise(r => setTimeout(r, 2300)); return { t0, b, hp: e.hp }; });
  check(bleed.t0 === 4 && bleed.hp === 999 - 46, 'Krpan: Mesarica rank 3 bleeds for 4 s (calm mode ticks per word, as Kresnik\'s fire does; nothing extra on the clock)', JSON.stringify(bleed));
  const kt = await ev(page, () => { const Z = window.__ZG; Z.S.heroes[0].pts = 1; Z.go('train', { back: () => Z.go('title') }); return (document.querySelector('.train .skills') || {}).textContent || ''; });
  check(/Lipov kij/.test(kt) && /Kmečka moč/.test(kt) && /Mesarica/.test(kt) && !/Kobilica|Zamah\b/.test(kt.replace(/Zamah z/g, '')) || /Dva zaporedna udarca/.test(kt), 'Veščine shows Krpan\'s new skills with their own rank text', kt.slice(0, 400));

  check(!errors.length, 'no page errors', errors.join(' | '));
  return ctx;
});
