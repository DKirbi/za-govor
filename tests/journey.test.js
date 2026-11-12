// The journey: one hero sets out, walks from stop to stop, fights, meets heroes (only a hero who joins
// is unlocked), opens a chest, drinks at a well, buys from the pedlar, uses an item in battle, levels up
// and spends skill points, prays at the shrine and faces the god's trial, and walks past the dart wall.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Journey (side-scrolling road, party, items, skills, shrine)');

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
// skip stops (test mode) until the next one is of this kind
const skipTo = (page, kind) => page.evaluate(k => { const Z = window.__ZG;
  for (let i = 0; i < 40; i++) { const R = Z.S.run, n = R.stops.find(s => !s.passed); if (n && n.kind === k) return true; Z.travelAct('skip'); }
  return false; }, kind);
// play a word made of `n` letters of hero k and report what the battle did
const playTiles = (page, k, n) => page.evaluate(async (k, n) => {
  const Z = window.__ZG, B = Z.B;
  const all = [...Z.allWords().keys()], w = all.find(x => x.length === 4) || all.find(x => x.length >= 4), path = Z.findPath(w);   // same length every time
  path.forEach((i, j) => { B.grid[i].owner = j < n ? k : -1; B.grid[i].lockUntil = 0; B.grid[i].lockWords = 0; });
  B.enemies.forEach(e => { e.hp = e.maxHp = 999; }); B.target = 0;
  const hp0 = B.enemies[0].hp; B.path = path; B.typed = w;
  const chip = (() => { Z.renderWordForTest(); const c = document.querySelector('.wordbar .chips .chip'); return c ? c.textContent : ''; })();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 450));
  const card = [...document.querySelectorAll('.cards .card .cap b, .cards .card .mv')].map(e => e.textContent).pop() || '';
  return { dmg: hp0 - Z.B.enemies[0].hp, chip, card };
}, k, n);

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
  const start = await page.evaluate(() => { const st = window.__ZG.S.heroes[0]; return { lvl: st.lvl, pts: st.pts, sk: st.sk.join() }; });
  check(start.lvl === 1 && start.pts === 0 && start.sk === '1,0,0', 'a hero starts at level 1 knowing only the first skill', JSON.stringify(start));

  // heroes on the road: Ptuj and two other regions, never all of them
  const plan = await page.evaluate(() => { const Z = window.__ZG, out = []; for (let i = 0; i < 40; i++) out.push(Z.planHeroes()); return { first: Z.S.run.heroAt, all: out }; });
  check(plan.first.length === 3 && plan.first[0] === 0 && plan.all.every(p => p.length === 3 && p[0] === 0) && new Set(plan.all.map(p => p.join())).size > 5,
    'a journey meets three heroes: always at Ptuj, and in two other regions picked at random', JSON.stringify(plan.first));
  const home = await page.evaluate(() => { const Z = window.__ZG, R = Z.S.run, met = R.met, n = {}; R.met = ['krpan'];   // as if nobody had been met yet
    for (let i = 0; i < 400; i++) { const id = Z.pickHero('predjama'); n[id] = (n[id] || 0) + 1; } R.met = met; return n; });
  const top = Object.entries(home).sort((a, b) => b[1] - a[1])[0];
  check(top[0] === 'erazem' && Object.keys(home).length > 3, 'each place favours its own hero (Predjama → Erazem), but others can turn up too', JSON.stringify(home));

  // first stop: one škrat; words give no experience, only beaten enemies do
  await walk(page); s = await state(page);
  check(/Škrat/.test(s.prompt || ''), 'walking stops at the first enemy', s.prompt);
  await shot('journey-01-road');
  await page.keyboard.press('Enter'); await sleep(800);
  const b = await page.evaluate(() => { const B = window.__ZG.B; return { n: B.enemies.length, own: new Set(B.grid.map(t => t.owner)).size, heroes: document.querySelectorAll('.battle .party .hero').length }; });
  check(b.n === 1 && b.heroes === 1 && b.own <= 2, 'the first battle is one enemy against one hero; tiles are his or neutral');
  const xpWord = await page.evaluate(async () => { const Z = window.__ZG, B = Z.B, x0 = Z.S.heroes[0].xp; B.enemies[0].hp = B.enemies[0].maxHp = 999;
    const w = [...Z.allWords().keys()].find(x => x.length >= 4); B.path = Z.findPath(w); B.typed = w;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await new Promise(r => setTimeout(r, 400)); return Z.S.heroes[0].xp - x0; });
  check(xpWord === 0, 'a word does not give experience', String(xpWord));
  await page.evaluate(() => { const Z = window.__ZG; Z.B.enemies[0].maxHp = 22; Z.S.heroes[0].hp -= 9; });
  const foe0 = await page.evaluate(() => window.__ZG.B.enemies[0].xp);
  await winBattle(page);
  const hpAfter = (await state(page)).hp[0], xpAfter = (await state(page)).xp[0];
  check(xpAfter === foe0, 'the beaten enemy gives its experience', `${xpAfter} vs ${foe0}`);
  for (let i = 0; i < 4 && (await state(page)).screen !== 'travel'; i++) { await page.keyboard.press('Enter'); await sleep(450); }
  s = await state(page);
  check(s.screen === 'travel' && s.gold > 20, 'a won battle pays gold and leads back to the road', `gold ${s.gold}`);
  check(s.hp[0] < s.maxHp[0] && s.hp[0] === hpAfter, 'health does not come back after a battle', `${s.hp[0]}/${s.maxHp[0]}`);

  // second stop: a hero waits; greeting does not unlock them, joining does
  // (Ptuj favours Kurent, who is a starter and so already unlocked: pin a hero who is not, for these checks)
  await page.evaluate(() => { const Z = window.__ZG, st = Z.S.run.stops.find(x => x.kind === 'hero'); st.hero = Z.CHARS.find(c => !Z.UNLOCKED.has(c.id) && !Z.ROSTER[c.id].god).id; });
  await walk(page); await page.keyboard.press('Enter'); await sleep(500);
  check((await state(page)).screen === 'hero', 'a hero waits at the second stop');
  const greet = await page.evaluate(() => { const Z = window.__ZG, id = Z.S.heroArg.ids[0]; return { id, unlocked: Z.UNLOCKED.has(id), note: document.querySelector('.hm .note').textContent,
    noteFirst: document.querySelector('.hm .note').getBoundingClientRect().top < document.querySelector('.hm-body').getBoundingClientRect().top }; });
  check(!greet.unlocked && /odkleneš/.test(greet.note), 'greeting a hero does not unlock them; the notice says joining does', JSON.stringify(greet));
  check(greet.noteFirst, 'the notice sits at the top, above the hero and the card');
  await shot('journey-02-meet');
  await page.keyboard.press('Enter'); await sleep(400);
  s = await state(page);
  const met = await page.evaluate(() => { const Z = window.__ZG, id = Z.HEROES[1] && Z.HEROES[1].id; return { id, god: id && Z.ROSTER[id].god, unlocked: Z.UNLOCKED.has(id), stored: localStorage.getItem('zg-unlocked') || '', st: Z.S.heroes[1] }; });
  check(s.party.length === 2 && s.party[0] === 'krpan' && !['krpan', 'jurij', 'kurent'].includes(met.id) && !met.god, 'a random folk hero not yet known joins the party at Ptuj', s.party.join());
  check(met.unlocked && met.stored.includes(met.id), 'the hero who joins is unlocked as a starter (remembered in the browser)', met.stored);
  check(met.st.sk.join() === '1,0,0', 'a newcomer knows only the first skill too', JSON.stringify(met.st));

  // third stop: the chest gives gold and an item, but no experience
  await walk(page); await page.keyboard.press('Enter'); await sleep(400);
  const answer = await page.evaluate(() => window.__ZG.S.ev.item.w), gold0 = s.gold, xp0 = s.xp;
  for (const ch of answer) await page.evaluate(c => document.dispatchEvent(new KeyboardEvent('keydown', { key: c, bubbles: true, cancelable: true })), ch);
  await page.keyboard.press('Enter'); await sleep(300);
  s = await state(page);
  const items = Object.values(s.bag).reduce((a, n) => a + n, 0) + s.relics.length;
  check(s.gold > gold0 && items === 1 && s.xp.join() === xp0.join(), 'the chest pays gold and holds one item; it gives no experience', JSON.stringify({ gold: s.gold, bag: s.bag, relics: s.relics, xp: s.xp }));
  await page.keyboard.press('Enter'); await sleep(400);

  // a hero you walk past stays unknown
  const passBy = await page.evaluate(async () => { const Z = window.__ZG, R = Z.S.run, id = Z.CHARS.find(c => !Z.UNLOCKED.has(c.id) && !Z.ROSTER[c.id].god && !Z.HEROES.some(h => h.id === c.id)).id;
    const stop = { kind: 'hero', hero: id, x: R.x, done: false, passed: false }; R.stops.unshift(stop); R.prompt = null;
    Z.go('travel'); Z.travelAct('go'); await new Promise(r => setTimeout(r, 300));
    [...document.querySelectorAll('.hm .row .btn')].find(b => /brez novega/.test(b.textContent)).click(); await new Promise(r => setTimeout(r, 200));
    return { id, unlocked: Z.UNLOCKED.has(id), screen: Z.S.screen }; });
  check(!passBy.unlocked && passBy.screen === 'travel', 'a hero you leave behind stays locked', JSON.stringify(passBy));

  // on to Peca: the well heals; skill points are spent at the well
  await skipTo(page, 'well');
  await page.evaluate(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.run.gold = 300; Z.S.heroes[0].hp = 3; });
  s = await state(page);
  check(s.ri === 1 && s.next === 'well', 'a well stands by the road in Peca', JSON.stringify({ ri: s.ri, next: s.next }));
  // hero skills heal only in part, and a badly hurt hero drinks Živa voda by themselves
  const heal = await page.evaluate(() => { const Z = window.__ZG, st = Z.S.heroes[0]; st.hp = 3; Z.healParty(999, Z.HEAL_CAP); const capped = st.hp;
    Z.S.run.bag = {}; Z.giveItem('ziva-voda'); st.hp = 5; const drank = Z.autoPotion(0), after = st.hp, left = Z.S.run.bag['ziva-voda']; st.hp = 3; Z.S.heroes[1].down = true; Z.S.heroes[1].hp = 0;
    return { capped, max: st.maxHp, drank, after, left }; });
  check(heal.capped === Math.floor(heal.max * 0.7), 'a hero\'s healing skill stops at 70 % of health', `${heal.capped}/${heal.max}`);
  check(heal.drank && heal.after > 5 && heal.after < heal.max && heal.left === 0, 'a hero under 30 % drinks Živa voda and the flask is gone', JSON.stringify(heal));
  // a level brings a point; the well offers Veščine
  const lv = await page.evaluate(() => { const Z = window.__ZG, st = Z.S.heroes[0]; const x = Z.LV_XP[2] - st.xp; Z.gainXp(x, 0); return { lvl: st.lvl, pts: st.pts, xp: st.xp }; });
  check(lv.lvl === 3 && lv.pts === 2, 'every new level brings a skill point', JSON.stringify(lv));
  await walk(page);
  const wellActs = await page.evaluate(() => window.__ZG.S.run.prompt.actions.map(a => a.label));
  check(wellActs.some(l => /^Veščine · 2 točki/.test(l)), 'with points to spend the well offers Veščine', wellActs.join(' | '));
  await page.evaluate(() => window.__ZG.S.run.prompt.actions.find(a => /^Veščine/.test(a.label)).fn()); await sleep(300);
  const train = await page.evaluate(() => ({ screen: window.__ZG.S.screen, btns: [...document.querySelectorAll('.train .sk-act .btn')].map(b => b.textContent), states: [...document.querySelectorAll('.train .sk')].map(e => e.className) }));
  check(train.screen === 'train' && train.btns.length === 2 && train.btns[0].startsWith('Izboljšaj') && train.btns[1].startsWith('Nauči se') && /off/.test(train.states[2]),
    'Veščine: skill 1 can be upgraded, skill 2 learned, skill 3 waits for skill 2', JSON.stringify(train));
  await shot('journey-03-skills');
  await page.evaluate(() => [...document.querySelectorAll('.train .sk-act .btn')][1].click()); await sleep(150);
  await page.evaluate(() => [...document.querySelectorAll('.train .sk-act .btn')][2].click()); await sleep(150);
  const spent = await page.evaluate(() => { const st = window.__ZG.S.heroes[0]; return { pts: st.pts, sk: st.sk.join() }; });
  check(spent.pts === 0 && spent.sk === '1,1,1', 'two points learn skills 2 and 3', JSON.stringify(spent));
  await page.keyboard.press('Escape'); await sleep(300);
  s = await state(page);
  check(s.screen === 'travel' && /Vodnjak/.test(s.prompt || '') && !(await page.evaluate(() => window.__ZG.S.run.prompt.actions.some(a => /^Veščine/.test(a.label)))), 'back at the well, Veščine is gone once the points are spent', s.prompt);
  await shot('journey-04-well');
  await page.keyboard.press('Enter'); await sleep(300);
  s = await state(page);
  check(s.hp.every((h, i) => h === s.maxHp[i]), 'drinking at the well heals every hero', JSON.stringify(s.hp));
  check(await page.evaluate(() => window.__ZG.S.heroes.every(h => !h.down)), 'the well also raises a hero who had fallen');
  await page.keyboard.press('Enter'); await sleep(200);

  // Triglav: the pedlar
  await skipTo(page, 'shop'); await walk(page);
  await page.keyboard.press('Enter'); await sleep(400);
  const stock = await page.evaluate(() => document.querySelectorAll('.dialog.bag .itemrow').length);
  check(stock === 6, 'the pedlar offers four potions or poisons and two relics', String(stock));
  await page.evaluate(() => document.querySelectorAll('.dialog.bag .itemrow .btn').forEach(b => { if (!b.disabled) b.click(); }));
  await sleep(200); await shot('journey-05-pedlar');
  const before = s; s = await state(page);
  check(s.gold < 300 && s.relics.length > before.relics.length, 'buying spends gold and adds the items', JSON.stringify({ gold: s.gold, relics: s.relics, bag: s.bag }));
  await page.keyboard.press('Escape'); await sleep(300);

  // a battle with two enemies; a potion from the bag is used up
  await page.evaluate(() => { const Z = window.__ZG; Z.S.run.bag = {}; Z.giveItem('perunova-medica'); });
  await skipTo(page, 'battle'); await walk(page); await page.keyboard.press('Enter'); await sleep(800);
  await sleep(900);
  const n1 = await page.evaluate(() => ({ left: window.__ZG.S.run.bag['perunova-medica'], boost: window.__ZG.B.boost, foes: window.__ZG.B.enemies.length }));
  check(n1.left === 0 && n1.boost === 3 && n1.foes === 2, 'Perunova medica is drunk by itself when the battle starts', JSON.stringify(n1));
  check(await page.evaluate(() => { const Z = window.__ZG; Z.giveItem('mrtva-voda'); const st = Z.S.heroes[1]; st.down = true; st.hp = 0; Z.autoItems('tick'); return !st.down && st.hp > 0 && !(Z.S.run.bag['mrtva-voda'] > 0); }), 'Mrtva voda raises a fallen hero by itself');
  await page.keyboard.press('3'); await sleep(250);
  check(await page.evaluate(() => !!document.querySelector('.dialog.bag') && window.__ZG.B.paused && !document.querySelector('.dialog.bag .itemrow .btn')), 'key 3 shows the bag and pauses the battle; nothing in it is used by hand');
  await shot('journey-06-bag');
  await page.keyboard.press('Escape'); await sleep(200);
  // skills in battle: the second hero knows only skill 1, so three of their letters still fire it
  const k2 = await page.evaluate(() => { const Z = window.__ZG; Z.B.boost = 0; return Z.HEROES[1].moves; });
  let p = await playTiles(page, 1, 3);
  check(p.chip.endsWith(k2[0]) && p.dmg > 0, 'three letters of a hero who knows only skill 1 fire skill 1 (the chip says so)', JSON.stringify({ ...p, moves: k2 }));
  await page.evaluate(() => { const st = window.__ZG.S.heroes[1]; st.sk = [1, 1, 1]; });
  p = await playTiles(page, 1, 3);
  check(p.chip.endsWith(k2[2]), 'once learned, three letters fire skill 3', JSON.stringify(p));
  const upg = await page.evaluate(async () => { const Z = window.__ZG, k = 0, id = Z.HEROES[0].id; const st = Z.S.heroes[0]; st.sk = [1, 1, 1];
    const i = Z.SKILL_UPS[id][0].split(' ').indexOf('moc'); return { id, i, tags: Z.SKILL_UPS[id][0] }; });
  if (upg.i >= 0) {
    // the same word twice (the grid is put back), first without upgrades, then with them up to "Moč"; crits held off
    const cmp = await page.evaluate(async i => {
      const Z = window.__ZG, B = Z.B, st = Z.S.heroes[0], rnd = Math.random, wait = ms => new Promise(r => setTimeout(r, ms));
      const all = [...Z.allWords().keys()], w = all.find(x => x.length >= 4 && !/[čšž]/.test(x) && !Z.HEROES.some(h => h.domain.includes(x))), path = Z.findPath(w);
      path.forEach((t, j) => { B.grid[t].owner = j < 1 ? 0 : -1; B.grid[t].lockUntil = 0; B.grid[t].lockWords = 0; });
      const saved = B.grid.map(t => ({ ...t })), play = async () => { B.grid = saved.map(t => ({ ...t })); B.enemies.forEach(e => { e.hp = e.maxHp = 999; }); B.target = 0; B.boost = 0; B.lemmaUses = new Map();   // no repeat penalty
        B.path = path.slice(); B.typed = w; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await wait(450); return 999 - B.enemies[0].hp; };
      Math.random = () => 0.99;
      st.sk[0] = 1; const base = await play();
      st.sk[0] = 1 + i + 1; const more = await play();
      Math.random = rnd; return { w, base, more, tags: Z.upTags(0, 1) };
    }, upg.i);
    check(cmp.tags.includes('moc') && cmp.more > cmp.base, 'an upgraded skill hits harder (Moč), same word', JSON.stringify(cmp));
  }
  const pre = await state(page), foeXp = await page.evaluate(() => { const B = window.__ZG.B; B.enemies.forEach(e => { e.maxHp = 40; }); return B.enemies.map(e => e.xp); });
  await winBattle(page);
  s = await state(page);
  check(s.xp.every((x, i) => x - pre.xp[i] === foeXp[0] + foeXp[1]) && s.gold > pre.gold, 'both defeated enemies drop gold and give their experience to every hero', JSON.stringify({ xp: s.xp, was: pre.xp, foeXp, gold: [pre.gold, s.gold] }));
  // the hero screen after a battle: the Veščine button, skills on the card, tap the hero for a skill
  for (let i = 0; i < 3 && (await state(page)).screen !== 'hero'; i++) { await page.keyboard.press('Enter'); await sleep(450); }
  const after = await page.evaluate(() => ({ btn: !!document.querySelector('.hm .skillbtn'), pills: [...document.querySelectorAll('.hm .face.front .mv em')].map(e => e.className) }));
  check(after.btn && after.pills.length === 3, 'after a battle the hero has a Veščine button and the card lists the three skills', JSON.stringify(after));
  await page.click('.hm .spirit-hit'); await sleep(300);
  check(await page.evaluate(() => document.querySelectorAll('.hm .spirit .cards .card').length) === 1, 'tapping the hero plays a skill card');
  await page.click('.hm .skillbtn'); await sleep(250);
  const info = await page.evaluate(() => ({ rows: document.querySelectorAll('.skilldlg .sk').length, ups: document.querySelectorAll('.skilldlg .sk-ups li').length, xp: (document.querySelector('.skilldlg .sk-sum') || {}).textContent || '' }));
  check(info.rows === 3 && info.ups === 9 && /do naslednje še \d+ XP/.test(info.xp), 'Veščine lists three skills with three upgrades each and the XP to the next level', JSON.stringify(info));
  await page.keyboard.press('Escape'); await sleep(150);
  for (let i = 0; i < 4 && (await state(page)).screen !== 'travel'; i++) { await page.keyboard.press('Enter'); await sleep(450); }

  // Bled: pray at the shrine; the god helps for three battles, then has to be beaten
  await skipTo(page, 'god'); await walk(page);
  s = await state(page);
  check(s.next === 'god' && /svetišče/i.test(s.prompt || ''), 'a shrine stands at Bled', s.prompt);
  await page.keyboard.press('Enter'); await sleep(500);
  const shrine = await page.evaluate(() => ({ tabs: document.querySelectorAll('.hm-tabs .btn').length, btns: [...document.querySelectorAll('.hm .row .btn')].map(b => b.textContent) }));
  check(shrine.tabs === 3 && /^Pomoli se k (bogu|boginji) /.test(shrine.btns[0]), 'three gods wait at the shrine; you can pray to one', JSON.stringify(shrine));
  await shot('journey-07-shrine');
  const godsBefore = await page.evaluate(() => [...window.__ZG.UNLOCKED].filter(id => window.__ZG.ROSTER[id].god).length);
  await page.keyboard.press('Enter'); await sleep(400);
  const bl = await page.evaluate(() => ({ b: window.__ZG.S.run.blessing, party: window.__ZG.HEROES.map(h => h.id), gods: [...window.__ZG.UNLOCKED].filter(id => window.__ZG.ROSTER[id].god).length }));
  check(bl.b && bl.b.left === 3 && !bl.party.some(id => ['perun', 'svarog', 'mokos', 'veles', 'dazbog', 'stribog'].includes(id)) && bl.gods === godsBefore, 'praying gives a blessing for three battles; the god does not join and is not unlocked yet', JSON.stringify(bl));
  // a blessed battle opens with the god's blow and shows the blessing
  await skipTo(page, 'battle'); await walk(page); await page.keyboard.press('Enter'); await sleep(1300);
  const blessed = await page.evaluate(() => ({ meta: document.querySelector('.bhead .meta').textContent, hurt: window.__ZG.B.enemies.every(e => e.hp < e.maxHp) }));
  check(/blagoslov: .+ \(3\)/.test(blessed.meta) && blessed.hurt, 'a blessed battle opens with the god\'s blow on every enemy', JSON.stringify(blessed));
  await page.evaluate(() => { window.__ZG.S.run.blessing.left = 1; });
  await winBattle(page);
  for (let i = 0; i < 2 && (await state(page)).screen !== 'hero'; i++) { await page.keyboard.press('Enter'); await sleep(450); }
  const toTrial = await page.evaluate(() => ({ btn: [...document.querySelectorAll('.hm .row .btn')].map(b => b.textContent).join(), note: (document.querySelector('.hm .note') || {}).textContent }));
  check(/^Preizkušnja: /.test(toTrial.btn) && /Blagoslov je minil/.test(toTrial.note || ''), 'after the third blessed battle the trial is next', JSON.stringify(toTrial));
  await page.keyboard.press('Enter'); await sleep(900);
  const trial = await page.evaluate(() => ({ screen: window.__ZG.S.screen, foes: window.__ZG.B.enemies.map(e => e.name), god: window.__ZG.B.node.trial }));
  check(trial.screen === 'battle' && trial.foes.length === 1 && /^Zaklet[ai] /.test(trial.foes[0]), 'the cursed god fights the party', JSON.stringify(trial));
  await shot('journey-08-trial');
  await winBattle(page);
  for (let i = 0; i < 3 && !(await page.evaluate(() => window.__ZG.S.screen === 'hero' && window.__ZG.S.heroArg.kind === 'freed')); i++) { await page.keyboard.press('Enter'); await sleep(450); }
  const freed = await page.evaluate(g => ({ kind: window.__ZG.S.heroArg && window.__ZG.S.heroArg.kind, unlocked: window.__ZG.UNLOCKED.has(g), blessing: window.__ZG.S.run.blessing }), trial.god);
  check(freed.kind === 'freed' && freed.unlocked && !freed.blessing, 'beating the cursed god breaks the curse and unlocks the god for later journeys', JSON.stringify(freed));
  await page.keyboard.press('Enter'); await sleep(400);

  // a full party: the fifth hero can only replace someone
  await page.evaluate(() => { const Z = window.__ZG, R = Z.S.run; R.prompt = null;
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
  check(again.open === again.known && again.open > 3 && again.open + again.locked === 15, 'the next journey can start with anyone unlocked so far', JSON.stringify(again));
  await page.keyboard.press('Escape'); await sleep(150);

  // the last region ends with the dragon
  const last = await page.evaluate(() => { const W = window.__ZG.WORLD.regions; const r = W[W.length - 1]; return { id: r.id, boss: r.boss, last: r.stops[r.stops.length - 1] }; });
  check(last.id === 'grad' && last.last === 'boss' && last.boss.join() === 'lintvern', 'the road ends at Ljubljana castle with Lintvern');

  // darts: they only hurt; a real word stops some, a word from every column stops all but one graze
  await page.evaluate(() => { const Z = window.__ZG; Z.S.heroes.forEach(h => { h.down = false; h.hp = h.maxHp; }); Z.go('darts', { id: 'puscice' }); }); await sleep(250);
  let d = await page.evaluate(() => { const E = window.__ZG.S.ev; return { word: E.word, cols: E.cols.length, rows: E.cols[0].length, ok: [...E.word].every((ch, c) => E.cols[c].includes(ch)),
    warn: document.querySelector('.darts .dart-warn').textContent, heroes: document.querySelectorAll('.dartparty .dp-hero').length }; });
  check(d.cols === 6 && d.rows === 3 && d.ok, 'the dart wall has six columns of three letters and hides a word', d.word);
  check(d.warn === 'Puščice se izstrelijo – pripravi se na umik!' && d.heroes === 4, 'the wall warns instead of repeating the rules, and the whole party stands in front of it', JSON.stringify(d));
  await page.evaluate(() => document.querySelectorAll('.dartcol')[2].querySelector('.tile').click());
  check(await page.evaluate(() => window.__ZG.S.ev.sel.length) === 0, 'a column cannot be taken before the ones to its left');
  for (const ch of d.word) await page.evaluate(c => document.dispatchEvent(new KeyboardEvent('keydown', { key: c, bubbles: true, cancelable: true })), ch);
  await shot('journey-09-darts');
  await page.keyboard.press('Enter'); await sleep(1300);
  d = await page.evaluate(() => { const Z = window.__ZG, E = Z.S.ev; return { done: E.done, stopped: E.stopped, hits: E.hits.length, dmg: E.dmg, shown: document.querySelectorAll('.dp-dmg').length + document.querySelectorAll('.dp-hero.hurt').length }; });
  check(d.done && d.stopped === 6 && d.hits === 1 && d.dmg > 0, 'the whole word stops every dart but one, which only grazes', JSON.stringify(d));
  await shot('journey-10-darts-hit');
  // a shorter real word stops some darts; the rest hit the heroes, spread over the party, and nobody falls
  const short = await page.evaluate(() => { const Z = window.__ZG; Z.S.heroes.forEach(h => { h.hp = h.maxHp; });
    for (let t = 0; t < 60; t++) { Z.go('darts', { id: 'puscice' }); const E = Z.S.ev;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) for (let e = 0; e < 3; e++) { const w = E.cols[0][a] + E.cols[1][b] + E.cols[2][c] + E.cols[3][e]; if (Z.WORDS.has(w)) { E.sel = [a, b, c, e]; return w; } } }
    return null; });
  if (check(short, 'a four-letter word can be found in some dart wall')) {
    await page.keyboard.press('Enter'); await sleep(300);
    d = await page.evaluate(() => { const Z = window.__ZG, E = Z.S.ev; return { stopped: E.stopped, hits: E.hits.map(x => x.k), dmg: E.dmg, hp: Z.S.heroes.map(h => h.hp), done: E.done }; });
    check(d.done && d.stopped === 4 && d.hits.length === 2 && new Set(d.hits).size === 2 && d.hp.every(x => x >= 1), 'a four-letter word stops four darts; two hit two different heroes', `${short} ${JSON.stringify(d)}`);
  }
  const wrong = await page.evaluate(() => { const Z = window.__ZG; Z.S.heroes.forEach(h => { h.hp = 3; });
    for (let t = 0; t < 60; t++) { Z.go('darts', { id: 'puscice' }); const E = Z.S.ev, w = E.cols.slice(0, 4).map(c => c[0]).join(''); if (!Z.WORDS.has(w)) { E.sel = [0, 0, 0, 0]; return w; } } return null; });
  await page.keyboard.press('Enter'); await sleep(250);
  d = await page.evaluate(() => { const Z = window.__ZG, E = Z.S.ev; return { stopped: E.stopped, hp: Z.S.heroes.map(h => h.hp), down: Z.S.heroes.some(h => h.down) }; });
  check(wrong && d.stopped === 0 && d.hp.every(x => x === 1) && !d.down, 'a word that does not exist stops nothing; the darts never knock a hero out', `${wrong} ${JSON.stringify(d)}`);
  check(await page.evaluate(() => !('strike' in window.__ZG.S) || !window.__ZG.S.strike), 'the darts do nothing for the next battle');
  // the darts have a "Kako se igra" intro that holds the clock, and Esc pauses them
  const tut = await page.evaluate(async () => { const Z = window.__ZG; Z.S.tutOn = true; Z.TUT_SEEN.delete('darts'); Z.go('darts', { id: 'puscice' });
    const t0 = Z.S.ev.time; await new Promise(r => setTimeout(r, 500));
    return { shown: !!Z.G.tut && document.body.classList.contains('held') && !!document.querySelector('.tutdlg .dartcols'), frozen: Z.S.ev.time === t0,
      rows: document.querySelector('.tutdlg .dartcol').children.length }; });
  check(tut.shown && tut.frozen && tut.rows === 2, 'the first dart wall opens with a short intro (two rows) and the clock waits', JSON.stringify(tut));
  await shot('journey-11-darts-intro');
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

  // every hero's three skills, fully upgraded, run without errors (15 heroes × 3 skills)
  const kits = await page.evaluate(async () => {
    const Z = window.__ZG, ids = Z.CHARS.map(c => c.id), out = [];
    Z.resetRun(); Z.S.mode = 'calm'; Z.newRun('krpan'); Z.S.tutOn = false;
    for (let g = 0; g < ids.length; g += 4) {
      const party = ids.slice(g, g + 4); Z.setParty(party); Z.S.heroes.forEach(st => { st.sk = [4, 4, 4]; }); Z.go('battle', Z.NODES[2]);
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
    Z.resetRun(); Z.go('title'); return out.length;
  });
  check(kits === 45, 'all 45 skills (15 heroes × 3), fully upgraded, were played', String(kits));

  // the dragon at the castle ends the journey
  await page.evaluate(() => { const Z = window.__ZG; Z.S.testMode = true; Z.S.mode = 'real'; Z.newRun('krpan'); Z.go('travel'); for (let i = 0; i < 80 && Z.S.run.ri < Z.WORLD.regions.length - 1; i++) Z.travelAct('skip'); Z.travelAct('skip'); Z.travelAct('skip'); Z.travelAct('skip'); });
  await sleep(200); await walk(page);
  s = await state(page);
  check(s.ri === 9 && /Lintvern/.test(s.prompt || ''), 'the last stop is Lintvern', s.prompt);
  await page.keyboard.press('Enter'); await sleep(800);
  await shot('journey-12-dragon');
  await winBattle(page);
  for (let i = 0; i < 5 && (await state(page)).screen !== 'ending'; i++) { await page.keyboard.press('Enter'); await sleep(500); }
  check((await state(page)).screen === 'ending', 'beating the dragon ends the journey');
  await shot('journey-13-ending');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
