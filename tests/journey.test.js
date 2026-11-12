// The journey: one hero sets out, walks from stop to stop, fights, meets heroes, opens a chest,
// drinks at a well, buys from the pedlar, uses an item in battle and meets a god at the shrine.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Journey (side-scrolling road, party, items)');

const state = page => page.evaluate(() => {
  const Z = window.__ZG, R = Z.S.run;
  return { screen: Z.S.screen, party: Z.HEROES.map(h => h.id), xp: Z.S.heroes.map(h => h.xp), hp: Z.S.heroes.map(h => h.hp), maxHp: Z.S.heroes.map(h => h.maxHp),
    ri: R && R.ri, x: R && Math.round(R.x), prompt: R && R.prompt && R.prompt.text, gold: R && R.gold, bag: R && { ...R.bag }, relics: R && R.relics.slice(),
    next: R && (R.stops.find(s => !s.passed) || {}).kind };
});
// walk until the party stops (a prompt appears)
async function walk(page) {
  await page.keyboard.press('ArrowRight');
  for (let i = 0; i < 60; i++) { await sleep(200); if ((await state(page)).prompt) return; }
}
// win the current battle quickly: enemies are left with 1 health, then real words finish them
async function winBattle(page) {
  await page.evaluate(() => window.__ZG.B.enemies.forEach(e => { e.hp = 1; }));
  for (let i = 0; i < 8; i++) {
    const s = await page.evaluate(() => { const Z = window.__ZG, B = Z.B; if (!B || B.over || Z.S.screen !== 'battle') return 'done';
      const t = B.enemies.findIndex(e => e.hp > 0); if (t < 0) return 'done'; B.target = t;
      const w = [...Z.allWords().keys()].find(w => w.length >= 4); const p = w && Z.findPath(w); if (!p) return 'none'; B.path = p; B.typed = w; return w; });
    if (s === 'done') break;
    await page.keyboard.press('Enter'); await sleep(450);
  }
  await sleep(1900);
}
const skip = (page, n) => page.evaluate(k => { for (let i = 0; i < k; i++) window.__ZG.travelAct('skip'); }, n);

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  // a fresh game: Krpan, Zeleni Jurij and Kurent can start; the other twelve are silhouettes (menu → Nova pot → hero)
  await page.keyboard.press('Enter'); await sleep(200); await page.keyboard.press('Enter'); await sleep(200);
  const cards = await page.evaluate(() => ({ open: [...document.querySelectorAll('button.pickcard b')].map(b => b.textContent), locked: document.querySelectorAll('.pickcard.locked').length,
    shades: document.querySelectorAll('.pickcard.locked i.shade').length, names: [...document.querySelectorAll('.pickcard.locked b')].every(b => b.textContent === '???') }));
  check(cards.open.join() === 'Martin Krpan,Zeleni Jurij,Kurent' && cards.locked === 12 && cards.shades === 12 && cards.names, 'a fresh game offers Krpan, Zeleni Jurij and Kurent; the other twelve are nameless silhouettes', JSON.stringify(cards));
  await shot('journey-00-start');
  await page.keyboard.press('Enter'); await sleep(300);
  let s = await state(page);
  check(s.screen === 'travel' && s.party.join() === 'krpan' && s.ri === 0, 'the journey starts at Ptuj with one hero', JSON.stringify(s.party));
  check(await page.evaluate(() => document.querySelectorAll('.tv-hero.empty').length) === 3, 'three places in the party are free');

  // first stop: one škrat
  await walk(page); s = await state(page);
  check(/Škrat/.test(s.prompt || ''), 'walking stops at the first enemy', s.prompt);
  await shot('journey-01-road');
  await page.keyboard.press('Enter'); await sleep(800);
  const b = await page.evaluate(() => { const B = window.__ZG.B; return { n: B.enemies.length, own: new Set(B.grid.map(t => t.owner)).size, heroes: document.querySelectorAll('.battle .party .hero').length }; });
  check(b.n === 1 && b.heroes === 1 && b.own <= 2, 'the first battle is one enemy against one hero; tiles are his or neutral');
  await page.evaluate(() => { window.__ZG.S.heroes[0].hp -= 9; });
  await winBattle(page);
  const hpAfter = (await state(page)).hp[0];
  for (let i = 0; i < 4 && (await state(page)).screen !== 'travel'; i++) { await page.keyboard.press('Enter'); await sleep(450); }
  s = await state(page);
  check(s.screen === 'travel' && s.gold > 20, 'a won battle pays gold and leads back to the road', `gold ${s.gold}`);
  check(s.hp[0] < s.maxHp[0] && s.hp[0] === hpAfter, 'health does not come back after a battle', `${s.hp[0]}/${s.maxHp[0]}`);

  // second stop: a random folk hero waits, joins, and is unlocked as a starter for later journeys
  await walk(page); await page.keyboard.press('Enter'); await sleep(500);
  check((await state(page)).screen === 'hero', 'a hero waits at the second stop');
  await shot('journey-02-meet');
  await page.keyboard.press('Enter'); await sleep(400);
  s = await state(page);
  const met = await page.evaluate(() => { const Z = window.__ZG, id = Z.HEROES[1] && Z.HEROES[1].id; return { id, god: id && Z.ROSTER[id].god, unlocked: Z.UNLOCKED.has(id), stored: localStorage.getItem('zg-unlocked') || '' }; });
  check(s.party.length === 2 && s.party[0] === 'krpan' && !['krpan', 'jurij', 'kurent'].includes(met.id) && !met.god, 'a random folk hero not yet known joins the party at Ptuj', s.party.join());
  check(met.unlocked && met.stored.includes(met.id), 'meeting a hero unlocks them as a starter (remembered in the browser)', met.stored);

  // third stop: the chest gives gold and an item
  await walk(page); await page.keyboard.press('Enter'); await sleep(400);
  const answer = await page.evaluate(() => window.__ZG.S.ev.item.w), gold0 = s.gold;
  for (const ch of answer) await page.evaluate(c => document.dispatchEvent(new KeyboardEvent('keydown', { key: c, bubbles: true, cancelable: true })), ch);
  await page.keyboard.press('Enter'); await sleep(300);
  s = await state(page);
  const items = Object.values(s.bag).reduce((a, n) => a + n, 0) + s.relics.length;
  check(s.gold > gold0 && items === 1, 'the chest pays gold and holds one item', JSON.stringify({ gold: s.gold, bag: s.bag, relics: s.relics }));
  await page.keyboard.press('Enter'); await sleep(400);

  // on to Peca: the well heals
  await skip(page, 2); await sleep(200);
  s = await state(page);
  check(s.ri === 1 && s.screen === 'travel', 'past the last stop the signpost leads to the next region');
  await page.evaluate(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.run.gold = 300; Z.S.heroes[0].hp = 3; });
  await skip(page, 3); await sleep(200); await walk(page);
  s = await state(page);
  check(s.next === 'well', 'a well stands by the road in Peca', s.prompt);
  // hero skills heal only in part, and a badly hurt hero drinks Živa voda by themselves
  const heal = await page.evaluate(() => { const Z = window.__ZG, st = Z.S.heroes[0]; st.hp = 3; Z.healParty(999, Z.HEAL_CAP); const capped = st.hp;
    Z.giveItem('ziva-voda'); st.hp = 5; const drank = Z.autoPotion(0), after = st.hp, left = Z.S.run.bag['ziva-voda']; st.hp = 3; Z.S.heroes[1].down = true; Z.S.heroes[1].hp = 0;
    return { capped, max: st.maxHp, drank, after, left }; });
  check(heal.capped === Math.floor(heal.max * 0.7), 'a hero\'s healing skill stops at 70 % of health', `${heal.capped}/${heal.max}`);
  check(heal.drank && heal.after > 5 && heal.after < heal.max && heal.left === 0, 'a hero under 30 % drinks Živa voda and the flask is gone', JSON.stringify(heal));
  await shot('journey-03-well');
  await page.keyboard.press('Enter'); await sleep(300);
  s = await state(page);
  check(s.hp.every((h, i) => h === s.maxHp[i]), 'drinking at the well heals every hero', JSON.stringify(s.hp));
  check(await page.evaluate(() => window.__ZG.S.heroes.every(h => !h.down)), 'the well also raises a hero who had fallen');
  await page.keyboard.press('Enter'); await sleep(200);

  // Triglav: the pedlar
  await skip(page, 2); await sleep(150); await skip(page, 3); await sleep(200); await walk(page);
  await page.keyboard.press('Enter'); await sleep(400);
  const stock = await page.evaluate(() => document.querySelectorAll('.dialog.bag .itemrow').length);
  check(stock === 6, 'the pedlar offers four potions or poisons and two relics', String(stock));
  await page.evaluate(() => document.querySelectorAll('.dialog.bag .itemrow .btn').forEach(b => { if (!b.disabled) b.click(); }));
  await sleep(200); await shot('journey-04-pedlar');
  const before = s; s = await state(page);
  check(s.gold < 300 && s.relics.length > before.relics.length, 'buying spends gold and adds the items', JSON.stringify({ gold: s.gold, relics: s.relics, bag: s.bag }));
  await page.keyboard.press('Escape'); await sleep(300);

  // a battle with two enemies; a potion from the bag is used up
  await page.evaluate(() => { const Z = window.__ZG; Z.S.run.bag = {}; Z.giveItem('perunova-medica'); });
  await walk(page); await page.keyboard.press('Enter'); await sleep(800);
  await sleep(900);
  const n1 = await page.evaluate(() => ({ left: window.__ZG.S.run.bag['perunova-medica'], boost: window.__ZG.B.boost, foes: window.__ZG.B.enemies.length }));
  check(n1.left === 0 && n1.boost === 3 && n1.foes === 2, 'Perunova medica is drunk by itself when the battle starts', JSON.stringify(n1));
  check(await page.evaluate(() => { const Z = window.__ZG; Z.giveItem('mrtva-voda'); const st = Z.S.heroes[1]; st.down = true; st.hp = 0; Z.autoItems('tick'); return !st.down && st.hp > 0 && !(Z.S.run.bag['mrtva-voda'] > 0); }), 'Mrtva voda raises a fallen hero by itself');
  await page.keyboard.press('3'); await sleep(250);
  check(await page.evaluate(() => !!document.querySelector('.dialog.bag') && window.__ZG.B.paused && !document.querySelector('.dialog.bag .itemrow .btn')), 'key 3 shows the bag and pauses the battle; nothing in it is used by hand');
  await shot('journey-05-bag');
  await page.keyboard.press('Escape'); await sleep(200);
  const pre = await state(page), foeXp = await page.evaluate(() => window.__ZG.B.enemies.map(e => e.xp));
  await winBattle(page);
  s = await state(page);
  check(s.xp.every((x, i) => x - pre.xp[i] >= foeXp[0] + foeXp[1]) && s.gold > pre.gold, 'both defeated enemies drop gold and give their experience to every hero', JSON.stringify({ xp: s.xp, was: pre.xp, foeXp, gold: [pre.gold, s.gold] }));
  for (let i = 0; i < 4 && (await state(page)).screen !== 'travel'; i++) { await page.keyboard.press('Enter'); await sleep(450); }

  // Bled: one god joins at the shrine; a second shrine would only bless
  await skip(page, 1); await sleep(150); await skip(page, 2); await sleep(200); await walk(page);
  s = await state(page);
  check(s.next === 'god', 'a shrine stands at Bled', s.prompt);
  await page.keyboard.press('Enter'); await sleep(500);
  const tabs = await page.evaluate(() => document.querySelectorAll('.hm-tabs .btn').length);
  check(tabs === 3, 'three gods offer themselves at the shrine', String(tabs));
  await shot('journey-06-shrine');
  await page.keyboard.press('Enter'); await sleep(400);
  s = await state(page);
  const gods = await page.evaluate(() => window.__ZG.HEROES.filter(h => h.god).length);
  check(s.party.length === 3 && gods === 1, 'one god travels with the party', s.party.join());
  check(await page.evaluate(() => [...window.__ZG.UNLOCKED].filter(id => window.__ZG.ROSTER[id].god).length) === 3, 'the three gods met at the shrine are known from now on');
  const blessing = await page.evaluate(() => { const Z = window.__ZG, st = Z.S.run.stops.find(x => x.kind === 'god'); st.passed = st.done = false; Z.S.run.prompt = null; Z.go('travel'); return Z.S.run.prompt && Z.S.run.prompt.actions.length; });
  check(blessing === 1 && /blagoslov/.test((await state(page)).prompt), 'with a god in the party the shrine only gives a blessing');

  // a full party: the fifth hero can only replace someone
  await page.evaluate(() => { const Z = window.__ZG, R = Z.S.run; R.stops.find(x => x.kind === 'god').passed = true; R.prompt = null;
    Z.setParty(['erazem', 'kurent', 'stribog', 'krpan']); Z.S.heroes[1].down = true; Z.S.heroes[1].hp = 0; R.stops.push({ kind: 'hero', hero: 'vida', x: R.x + 300, done: false, passed: false }); R.stops.sort((p, q) => p.x - q.x); Z.go('travel'); });
  await page.evaluate(() => { const R = window.__ZG.S.run; R.stops.forEach(x => { if (x.kind !== 'hero' || x.hero !== 'vida') x.passed = true; }); });
  await walk(page); await page.keyboard.press('Enter'); await sleep(400);
  const swap = await page.evaluate(() => [...document.querySelectorAll('.hm .row .btn')].map(b => b.textContent));
  check(swap.length === 5 && swap.filter(t => /^(Namesto|Zapusti)/.test(t)).length === 4 && swap.some(t => /^Zapusti: Kurent/.test(t)), 'with four heroes a new one can only take somebody\'s place; a fallen hero can be left behind', swap.join(' | '));
  await page.evaluate(() => [...document.querySelectorAll('.hm .row .btn')].find(b => /Kurent/.test(b.textContent)).click()); await sleep(300);
  s = await state(page);
  check(s.party.join() === 'erazem,vida,stribog,krpan', 'Lepa Vida takes the fallen Kurent\'s place', s.party.join());
  await page.evaluate(() => { const Z = window.__ZG; Z.S.testMode = false; Z.S.pickIds = null; Z.go('title'); Z.go('newrun'); }); await page.keyboard.press('Enter'); await sleep(200);
  const again = await page.evaluate(() => ({ open: document.querySelectorAll('button.pickcard').length, known: window.__ZG.UNLOCKED.size, locked: document.querySelectorAll('.pickcard.locked').length }));
  check(again.open === again.known && again.open > 3 && again.open + again.locked === 15, 'the next journey can start with anyone met so far', JSON.stringify(again));
  await page.keyboard.press('Escape'); await sleep(150);

  // the last region ends with the dragon
  const last = await page.evaluate(() => { const W = window.__ZG.WORLD.regions; const r = W[W.length - 1]; return { id: r.id, boss: r.boss, last: r.stops[r.stops.length - 1] }; });
  check(last.id === 'grad' && last.last === 'boss' && last.boss.join() === 'lintvern', 'the road ends at Ljubljana castle with Lintvern');

  // darts: one letter from each column, left to right
  await page.evaluate(() => { const Z = window.__ZG; Z.S.heroes.forEach(h => { h.down = false; h.hp = h.maxHp; }); Z.go('darts', { id: 'puscice' }); }); await sleep(250);
  let d = await page.evaluate(() => { const E = window.__ZG.S.ev; return { word: E.word, cols: E.cols.length, rows: E.cols[0].length, ok: [...E.word].every((ch, c) => E.cols[c].includes(ch)) }; });
  check(d.cols === 6 && d.rows === 3 && d.ok, 'the dart wall has six columns of three letters and hides a word', d.word);
  await page.evaluate(() => document.querySelectorAll('.dartcol')[2].querySelector('.tile').click());
  check(await page.evaluate(() => window.__ZG.S.ev.sel.length) === 0, 'a column cannot be taken before the ones to its left');
  for (const ch of d.word) await page.evaluate(c => document.dispatchEvent(new KeyboardEvent('keydown', { key: c, bubbles: true, cancelable: true })), ch);
  await shot('journey-06b-darts');
  await page.keyboard.press('Enter'); await sleep(250);
  d = await page.evaluate(() => { const Z = window.__ZG, E = Z.S.ev; return { done: E.done, turned: E.turned, dmg: E.dmg, strike: Z.S.strike }; });
  check(d.done && d.turned === 6 && d.dmg === 0 && d.strike === 24, 'the whole word turns every dart: no damage, and an opening strike for the next battle', JSON.stringify(d));
  // a shorter real word turns some darts, a word that does not exist turns none
  const short = await page.evaluate(() => { const Z = window.__ZG;
    for (let t = 0; t < 60; t++) { Z.go('darts', { id: 'puscice' }); const E = Z.S.ev;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) for (let e = 0; e < 3; e++) { const w = E.cols[0][a] + E.cols[1][b] + E.cols[2][c] + E.cols[3][e]; if (Z.WORDS.has(w)) { E.sel = [a, b, c, e]; return w; } } }
    return null; });
  if (check(short, 'a four-letter word can be found in some dart wall')) {
    const hp0 = await page.evaluate(() => window.__ZG.S.maxHp);   // a level gained from the darts may raise health, so compare with the ceiling
    await page.keyboard.press('Enter'); await sleep(250);
    d = await page.evaluate(() => { const Z = window.__ZG, E = Z.S.ev; return { turned: E.turned, dmg: E.dmg, hp: Z.S.partyHp, strike: Z.S.strike, done: E.done }; });
    check(d.done && d.turned === 4 && d.dmg === 6 && d.strike === 16, 'sending a shorter word early turns four darts; the other two hit the party', `${short} ${JSON.stringify(d)}`);
  }
  const wrong = await page.evaluate(() => { const Z = window.__ZG; Z.S.heroes.forEach(h => { h.hp = h.maxHp; }); Z.S.strike = 0;
    for (let t = 0; t < 60; t++) { Z.go('darts', { id: 'puscice' }); const E = Z.S.ev, w = E.cols.slice(0, 4).map(c => c[0]).join(''); if (!Z.WORDS.has(w)) { E.sel = [0, 0, 0, 0]; return w; } } return null; });
  await page.keyboard.press('Enter'); await sleep(250);
  d = await page.evaluate(() => { const Z = window.__ZG, E = Z.S.ev; return { turned: E.turned, dmg: E.dmg, strike: Z.S.strike }; });
  check(wrong && d.turned === 0 && d.dmg === 18 && d.strike === 0, 'a word that does not exist can be sent too: every dart hits the party', `${wrong} ${JSON.stringify(d)}`);
  // the darts have a "Kako se igra" intro that holds the clock, and Esc pauses them
  const tut = await page.evaluate(async () => { const Z = window.__ZG; Z.S.tutOn = true; Z.TUT_SEEN.delete('darts'); Z.go('darts', { id: 'puscice' });
    const t0 = Z.S.ev.time; await new Promise(r => setTimeout(r, 500));
    return { shown: !!Z.G.tut && document.body.classList.contains('held') && !!document.querySelector('.tutdlg .dartcols'), frozen: Z.S.ev.time === t0 }; });
  check(tut.shown && tut.frozen, 'the first dart wall opens with an intro and the clock waits', JSON.stringify(tut));
  await shot('journey-06c-darts-intro');
  await page.evaluate(() => { const Z = window.__ZG; Z.closeTut(); Z.S.tutOn = false; }); await sleep(150);
  await page.keyboard.press('Escape'); await sleep(200);
  const paused = await page.evaluate(async () => { const Z = window.__ZG, t0 = Z.S.ev.time; await new Promise(r => setTimeout(r, 400)); return Z.G.paused && Z.S.ev.time === t0 && document.body.classList.contains('held'); });
  await page.keyboard.press('Escape'); await sleep(200);
  check(paused && await page.evaluate(() => !window.__ZG.G.paused), 'Esc pauses the darts (letters hidden, clock stopped) and Esc resumes');
  // healers strike as well as heal
  const healer = await page.evaluate(async () => { const Z = window.__ZG; Z.resetRun(); Z.S.mode = 'calm'; Z.setParty(['jurij']); Z.go('battle', Z.NODES[2]);
    const w = [...Z.allWords().keys()].find(x => x.length >= 4), path = Z.findPath(w); path.forEach((i, n) => { Z.B.grid[i].owner = n < 1 ? 0 : -1; });
    const hp0 = Z.B.enemies[0].hp; Z.B.target = 0; Z.B.path = path; Z.B.typed = w;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); await new Promise(r => setTimeout(r, 400));
    return hp0 - Z.B.enemies[0].hp; });
  check(healer > 0, 'Zeleni Jurij alone can hurt an enemy', `−${healer}`);

  // every hero's three moves run without errors (tier 1, 2 and 3 for each of the fifteen)
  const kits = await page.evaluate(async () => {
    const Z = window.__ZG, ids = Z.CHARS.map(c => c.id), out = [];
    Z.resetRun(); Z.S.mode = 'calm';
    for (let g = 0; g < ids.length; g += 4) {
      const party = ids.slice(g, g + 4); Z.setParty(party); Z.go('battle', Z.NODES[2]);
      for (let k = 0; k < party.length; k++) for (let tier = 1; tier <= 3; tier++) {
        const B = Z.B; if (!B || B.over) { Z.go('battle', Z.NODES[2]); }
        const w = [...Z.allWords().keys()].find(x => x.length >= 4); const path = Z.findPath(w);
        path.forEach((i, n) => { Z.B.grid[i].owner = n < tier ? k : -1; Z.B.grid[i].lockUntil = 0; Z.B.grid[i].lockWords = 0; });
        Z.B.enemies.forEach(e => { e.hp = e.maxHp = 999; });
        Z.B.path = path; Z.B.typed = w;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await new Promise(r => setTimeout(r, 320));
        out.push(Z.B.words);
      }
    }
    Z.go('title'); return out.length;
  });
  check(kits === 45, 'all 45 hero moves (15 heroes × 3 tiers) were played', String(kits));

  // the dragon at the castle ends the journey
  await page.evaluate(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'real'; Z.newRun('krpan'); Z.go('travel'); for (let i = 0; i < 80 && Z.S.run.ri < Z.WORLD.regions.length - 1; i++) Z.travelAct('skip'); Z.travelAct('skip'); Z.travelAct('skip'); Z.travelAct('skip'); });
  await sleep(200); await walk(page);
  s = await state(page);
  check(s.ri === 9 && /Lintvern/.test(s.prompt || ''), 'the last stop is Lintvern', s.prompt);
  await page.keyboard.press('Enter'); await sleep(800);
  await shot('journey-07-dragon');
  await winBattle(page);
  for (let i = 0; i < 5 && (await state(page)).screen !== 'ending'; i++) { await page.keyboard.press('Enter'); await sleep(500); }
  check((await state(page)).screen === 'ending', 'beating the dragon ends the journey');
  await shot('journey-08-ending');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
