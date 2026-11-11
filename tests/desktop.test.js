// Desktop walk-through with the keyboard: battle, chest, finisher crossword,
// Lintvern's letter lock and forced crossword, ambush crossword, rock slide.
const { openGame, runner, sleep, typeText } = require('./harness');
const { check, run } = runner('Desktop playthrough (keyboard)');

const state = page => page.evaluate(() => {
  const Z = window.__ZG, B = Z.B;
  return B ? { screen: Z.S.screen, over: B.over, words: B.words, enemyHp: B.enemies.map(e => e.hp), cw: B.cw && B.cw.kind, log: B.logLines.slice(0, 2) }
           : { screen: Z.S.screen };
});

// Type a random valid word from the current mesh (č/š/ž included) and send it. If a word
// is still selected after Enter, Escape clears it (Escape on an empty word pauses).
async function playWord(page) {
  const w = await page.evaluate(() => {
    const ws = [...window.__ZG.allWords().keys()].filter(w => w.length >= 4 && w.length <= 6);
    return ws[Math.floor(Math.random() * ws.length)] || null;
  });
  if (!w) return null;
  await typeText(page, w);
  await page.keyboard.press('Enter');
  await sleep(50);
  if (await page.evaluate(() => { const B = window.__ZG.B; return !!(B && !B.cw && (B.typed || B.path.length)); })) await page.keyboard.press('Escape');
  return w;
}

// Type the current entry's answer until the crossword closes.
async function solveCrossword(page) {
  for (let i = 0; i < 10; i++) {
    const cur = await page.evaluate(() => { const C = window.__ZG.B && window.__ZG.B.cw; return C ? C.D.entries[C.cur.e].answer : null; });
    if (!cur) return true;
    await typeText(page, cur);
    await sleep(150);
  }
  return page.evaluate(() => !window.__ZG.B.cw);
}

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  // title → choose the first hero → the road (the journey itself is covered by journey.test.js)
  await page.keyboard.press('Enter'); await sleep(200);
  check((await state(page)).screen === 'pick', 'Enter on the title screen opens the choice of the first hero');
  await page.keyboard.press('Enter'); await sleep(300);
  check((await state(page)).screen === 'travel', 'Enter again starts the journey');

  // Battle 1: the practice battle at Barje with the classic four; play random valid words until the škrati fall
  await page.evaluate(() => { const Z = window.__ZG; Z.resetRun(); Z.go('battle', Z.NODES[0]); }); await sleep(700);
  check((await state(page)).screen === 'battle', 'a practice battle starts with the classic four heroes');

  // Č, Š, Ž are deliberate: typing c/s/z for them finds no path; the real letter works
  const sumnik = await page.evaluate(() => {
    const Z = window.__ZG, plain = w => w.replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z');
    for (let i = 0; i < 40; i++) {
      const w = [...Z.allWords().keys()].find(w => /[čšž]/.test(w) && !(Z.findPath(plain(w)) || []).length);
      if (w) return { word: w, plain: plain(w) };
      Z.go('battle', Z.NODES[0]);
    }
    return null;
  });
  if (check(sumnik, 'the mesh has a word with č, š or ž to try')) {
    const words0 = await page.evaluate(() => window.__ZG.B.words);
    for (const ch of sumnik.plain) await page.keyboard.type(ch);
    await page.keyboard.press('Enter'); await sleep(200);
    const words1 = await page.evaluate(() => window.__ZG.B.words);
    check(words1 === words0, 'typing c/s/z instead of č/š/ž is not accepted', `${sumnik.plain} for ${sumnik.word}`);
    await page.keyboard.press('Escape'); await sleep(100);
    await typeText(page, sumnik.word);
    await page.keyboard.press('Enter'); await sleep(700);
    check(await page.evaluate(() => window.__ZG.B.words) === words0 + 1, 'typing the real letters plays the word', sumnik.word);
  }
  let n = 0;
  while (n < 30) {
    const s = await state(page);
    if (s.over || s.screen !== 'battle') break;
    await playWord(page); n++; await sleep(700);
  }
  const b1 = await state(page);
  check(b1.over || b1.screen !== 'battle', 'first battle is won by playing words', `${n} words, enemy HP ${JSON.stringify(b1.enemyHp)}`);
  await shot('desktop-01-battle-won');
  await sleep(1200);

  // result → after-battle hero screen → out of the practice battle
  for (let i = 0; i < 4 && (await state(page)).screen !== 'title'; i++) { await page.keyboard.press('Enter'); await sleep(500); }
  check((await state(page)).screen === 'title', 'Enter goes through the result and hero screens');

  // Chest: type the hidden word and send it
  await page.evaluate(() => window.__ZG.go('chest', window.__ZG.NODES[1])); await sleep(300);
  const answer = await page.evaluate(() => window.__ZG.S.ev.item.w);
  await typeText(page, answer);
  await page.keyboard.press('Enter'); await sleep(300);
  const chest = await page.evaluate(() => ({ win: window.__ZG.S.ev.win, bonus: window.__ZG.S.meterBonus }));
  check(chest.win && chest.bonus > 0, 'chest opens with the hidden word and fills the next zagovor meter', answer);
  await shot('desktop-02-chest');

  // Battle 2 (Temni gozd): full meter → Space opens a finisher crossword → solve it
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[2])); await sleep(700);
  await playWord(page); await sleep(500);
  await page.evaluate(() => { window.__ZG.B.meter = 30; });
  await page.keyboard.press(' '); await sleep(300);
  check((await state(page)).cw === 'finisher', 'Space with a full meter opens the finisher crossword');
  await shot('desktop-03-finisher');
  check(await solveCrossword(page), 'finisher crossword can be solved by typing');

  // Battle 4 (Ljubljanski grad): Lintvern's letter lock, then phase 2 forced crossword
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[5])); await sleep(600);
  await page.evaluate(() => { const e = window.__ZG.B.enemies[0]; e.step = 1; e.charge = 0.99; }); await sleep(500);
  check(await page.evaluate(() => { const B = window.__ZG.B; return B.grid.some(t => t.lockUntil > B.time || t.lockWords > 0); }),
    'Lintvern locks letters in the mesh');
  await page.evaluate(() => { const e = window.__ZG.B.enemies[0]; e.hp = Math.round(e.maxHp * 0.53); e.phase2on = false; });
  await playWord(page); await sleep(600);
  await page.evaluate(() => { const e = window.__ZG.B.enemies[0]; e.step = 0; e.charge = 0.99; }); await sleep(600);
  check((await state(page)).cw === 'lock', 'phase 2 forces a crossword with the mesh closed');
  await shot('desktop-04-forced-crossword');
  check(await solveCrossword(page), 'forced crossword can be solved');

  // Battle 3 (Ljubljanica) starts with an ambush crossword
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[4])); await sleep(800);
  check((await state(page)).cw === 'ambush', 'Ljubljanica starts with an ambush crossword');
  check(await solveCrossword(page), 'ambush crossword can be solved');

  // Rock slide: type a word containing a falling rock's letter
  await page.evaluate(() => window.__ZG.go('trap', window.__ZG.NODES[3])); await sleep(4200);
  const rocks = await page.evaluate(() => window.__ZG.S.ev.rocks.filter(r => r.state === 'fall').map(r => r.ch));
  const word = await page.evaluate(ch => [...window.__ZG.WORDS].find(w => w.includes(ch) && w.length === 5), rocks[0]);
  for (const ch of word) await page.keyboard.type(ch);
  await page.keyboard.press('Enter'); await sleep(300);
  check(await page.evaluate(() => window.__ZG.S.ev.broken >= 1), 'a word with the rock\'s letter breaks it', `${rocks[0]} → ${word}`);
  await shot('desktop-05-rock-slide');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
