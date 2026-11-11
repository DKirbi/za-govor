// The hidden mythology keyword (geslo): guessing it early ends the crossword with a
// stronger zagovor, and it is a way out of Povodni mož's forced crossword.
const { openGame, runner, sleep, typeText } = require('./harness');
const { check, run } = runner('Hidden keyword (geslo) on a phone');

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors, shot } = ctx;
  await page.evaluate(() => { window.__ZG.S.mode = 'calm'; });
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[2])); await sleep(600);
  await page.evaluate(() => { window.__ZG.B.enemies.forEach(e => { e.hp = e.maxHp = 400; }); });

  // open Perun's finisher until it comes up in the keyword-column style
  const style = await page.evaluate(() => {
    const Z = window.__ZG;
    for (let i = 0; i < 60; i++) { Z.openCrossword('finisher', 'perun'); if (Z.B.cw.D.style === 'geslo') return 'geslo'; Z.B.cw = null; }
    return null;
  });
  check(style === 'geslo', 'a finisher can hide the god\'s name in a gold column');
  check(await page.evaluate(() => document.querySelectorAll('.cell.gk').length === 5), 'the gold column has one cell per letter of PERUN');
  const fillers = await page.evaluate(() => window.__ZG.B.cw.D.entries.filter(e => !e.geslo).map(e => e.answer));
  const bank = await page.evaluate(() => window.__ZG.CLUES.banks.malcek.map(b => b[0]));
  check(fillers.every(a => bank.includes(a)), 'every row is an everyday word from the clue bank', fillers.join(', '));

  // solve one row, then type the keyword into the gold column
  await page.evaluate(() => document.querySelector('.nativein').focus());
  const row1 = await page.evaluate(() => window.__ZG.B.cw.D.entries[0].answer.toLowerCase());
  await page.keyboard.type(row1); await sleep(400);
  await shot('keyword-01-one-row');
  const hpBefore = await page.evaluate(() => window.__ZG.B.enemies.map(e => e.hp));
  await page.evaluate(() => document.querySelector('.clue.geslo').click());
  await page.evaluate(() => document.querySelector('.nativein').focus());
  await page.keyboard.type('perun'); await sleep(500);
  const after = await page.evaluate(() => ({ open: !!window.__ZG.B.cw, hp: window.__ZG.B.enemies.map(e => e.hp), log: window.__ZG.B.logLines.join(' | ') }));
  check(!after.open, 'guessing the keyword early ends the crossword at once');
  check(after.hp.every((h, i) => h < hpBefore[i]) && /Perunov zagovor/.test(after.log), 'the zagovor fires and hits every enemy');
  await shot('keyword-02-zagovor');

  // Povodni mož's whirlpool: the keyword URŠKA gets you out (typed without diacritics)
  await page.evaluate(() => { const Z = window.__ZG; Z.openCrossword('lock', 'vrtinec', { enemy: Z.B.enemies[0] }); });
  await sleep(300);
  check(await page.evaluate(() => window.__ZG.B.cw.D.entries.some(e => e.geslo && e.answer === 'URŠKA')), 'the whirlpool crossword hides URŠKA');
  await page.evaluate(() => document.querySelector('.clue.geslo').click());
  await page.evaluate(() => document.querySelector('.nativein').focus());
  await page.keyboard.type('urska'); await sleep(400);
  check(await page.evaluate(() => { const C = window.__ZG.B.cw; return !!C && C.solved.size === 0 && document.querySelectorAll('.cell.typed').length === 5; }),
    'URSKA with a plain s stays black and does not count');
  for (let i = 0; i < 6; i++) { await page.keyboard.press('Backspace'); await sleep(30); }
  await page.evaluate(() => { const C = window.__ZG.B.cw; C.cur.p = 0; });
  await typeText(page, 'urška'); await sleep(400);
  const lock = await page.evaluate(() => ({ open: !!window.__ZG.B.cw, log: window.__ZG.B.logLines[0] }));
  check(!lock.open && /Geslo uganjeno prej/.test(lock.log), 'URŠKA with a real š breaks the whirlpool', lock.log);

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
