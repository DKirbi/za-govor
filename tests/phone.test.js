// Phone viewport (390×844, touch): send button, crossword typing through the native
// keyboard input, green-fires / black-does-nothing, chest partial reward, rock slide input.
const { openGame, runner, sleep, typeText } = require('./harness');
const { check, run } = runner('Phone (touch, 390×844)');

const center = (page, sel, idx = 0) => page.evaluate((s, i) => {
  const r = document.querySelectorAll(s)[i].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
}, sel, idx);

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors, shot } = ctx;
  check(await page.evaluate(() => document.body.classList.contains('mobile')), 'mobile layout switches on by itself on a touch phone');

  // 1. Letter mesh: tap a word, the send button is visible and plays it
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[2])); await sleep(600);
  // every tile can be tapped without scrolling: nothing (the sticky action bar) covers any of them
  const covered = () => page.evaluate(() => [...document.querySelectorAll('.mesh .tile')].filter(t => {
    const r = t.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !e || !t.contains(e);
  }).length);
  check(await covered() === 0 && await page.evaluate(() => scrollY === 0), 'the whole letter grid is tappable without scrolling (390×844)');
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await sleep(300);
  check(await covered() === 0, 'the whole letter grid is tappable without scrolling (360×780)');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await sleep(300);
  const [word, tiles] = await page.evaluate(() => [...window.__ZG.allWords().entries()].find(([w]) => w.length >= 4));
  for (const i of tiles) { const [x, y] = await center(page, '.mesh .tile', i); await page.touchscreen.tap(x, y); await sleep(50); }
  await sleep(150);
  const send = await page.evaluate(() => {
    const b = document.querySelector('.wordbar .btn.send'), r = b.getBoundingClientRect();
    return { visible: r.top >= 0 && r.bottom <= innerHeight, ready: b.classList.contains('ready') };
  });
  check(send.visible && send.ready, 'Pošlji is on screen and turns green for a valid word', word);
  await shot('phone-01-send');
  await page.tap('.wordbar .btn.send'); await sleep(700);
  check(await page.evaluate(() => window.__ZG.B.words === 1), 'tapping Pošlji plays the word');

  // 2. Crossword: wrong letters stay black and do nothing; a correct entry turns green and fires
  // full health and no Kresnik burn ticking from the first word, so only the crossword can do damage
  await page.evaluate(() => { const B = window.__ZG.B; B.meter = 30; B.enemies.forEach(e => { e.hp = e.maxHp; e.burn = null; e.burnTurns = 0; }); });
  await page.keyboard.press(' '); await sleep(300);
  check(await page.evaluate(() => !!window.__ZG.B.cw), 'the zagovor crossword opens');
  // tap a regular clue: solving the keyword (gold column or ★ entry) would finish the whole zagovor
  const clueAt = await page.evaluate(() => { const r = document.querySelector('.clues .clue:not(.geslo):not(.main)').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight, scrollY]; });
  await page.tap('.clues .clue:not(.geslo):not(.main)'); await sleep(150);
  const picked = await page.evaluate(() => { const C = window.__ZG.B.cw, e = C.D.entries[C.cur.e]; return { cur: C.cur.e, regular: !e.geslo && !e.main, focus: document.activeElement === C.input, active: document.activeElement.className || document.activeElement.tagName }; });
  check(picked.regular && picked.focus, 'tapping a clue selects its entry and opens the keyboard', JSON.stringify({ ...picked, clueAt }));
  const first = await page.evaluate(() => { const C = window.__ZG.B.cw; return C.D.entries[C.cur.e].answer; });
  const before = await page.evaluate(() => window.__ZG.B.enemies.map(e => e.hp));
  await page.keyboard.type('a'.repeat(first.length)); await sleep(200);
  const wrong = await page.evaluate(() => ({ solved: window.__ZG.B.cw.solved.size, black: document.querySelectorAll('.cell.typed').length, hp: window.__ZG.B.enemies.map(e => e.hp) }));
  check(wrong.solved === 0 && wrong.black > 0 && JSON.stringify(wrong.hp) === JSON.stringify(before), 'a wrong entry stays black and fires nothing', JSON.stringify({ first, before, ...wrong }));
  for (let i = 0; i <= first.length; i++) { await page.keyboard.press('Backspace'); await sleep(30); }
  await page.evaluate(() => { window.__ZG.B.cw.cur.p = 0; });
  await typeText(page, first); await sleep(250);
  const right = await page.evaluate(() => { const C = window.__ZG.B.cw; return { solved: C ? C.solved.size : -1, green: document.querySelectorAll('.cell.ok').length, cards: document.querySelectorAll('.card').length }; });
  check(right.solved >= 1 && right.green >= first.length && right.cards > 0, 'a correct entry turns green and fires an attack card', first);
  await shot('phone-02-crossword');

  // Phone keyboards send composition events (autocorrect, swipe); simulate one
  const next = await page.evaluate(() => { const C = window.__ZG.B.cw; return C ? C.D.entries[C.cur.e].answer.toLowerCase() : null; });
  if (next) {
    const solvedBefore = await page.evaluate(() => window.__ZG.B.cw.solved.size);
    await page.evaluate(w => {
      const inp = window.__ZG.B.cw.input; let v = inp.value;   // an IME composes at the caret, after what is already there
      for (const ch of w) { v += ch; inp.value = v; inp.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true, data: ch, inputType: 'insertCompositionText' })); }
      inp.dispatchEvent(new CompositionEvent('compositionend', { data: w }));
    }, next);
    await sleep(300);
    const after = await page.evaluate(() => { const C = window.__ZG.B.cw; return C ? C.solved.size : Infinity; });
    check(after > solvedBefore, 'typing through a composing phone keyboard fills the entry', next);
  }
  for (let k = 0; k < 8; k++) {
    const a = await page.evaluate(() => { const C = window.__ZG.B && window.__ZG.B.cw; return C ? C.D.entries[C.cur.e].answer : null; });
    if (!a) break;
    await typeText(page, a); await sleep(250);
  }
  check(await page.evaluate(() => !window.__ZG.B.cw), 'the whole crossword can be finished on the phone');

  // 3. Chest: one word. A shorter real word ends it with a partial reward, the hidden word opens it
  await page.evaluate(() => window.__ZG.go('chest', window.__ZG.NODES[1])); await sleep(300);
  const chest = await page.evaluate(() => {
    const E = window.__ZG.S.ev, letters = E.letters.map(l => l.ch), W = window.__ZG.WORDS;
    const can = w => { const pool = letters.slice(); for (const c of w) { const i = pool.indexOf(c); if (i < 0) return false; pool.splice(i, 1); } return true; };
    const partial = [...W].filter(w => w.length >= 3 && w.length < E.item.w.length && w !== E.item.w && can(w)).sort((a, b) => b.length - a.length)[0];
    return { answer: E.item.w, partial };
  });
  const tapWord = async w => {
    for (const ch of w) {
      const idx = await page.evaluate(c => window.__ZG.S.ev.letters.findIndex(l => !l.used && l.ch === c), ch);
      const [x, y] = await center(page, '.letters .tile', idx); await page.touchscreen.tap(x, y); await sleep(40);
    }
  };
  if (chest.partial) {
    await tapWord(chest.partial);
    await page.tap('.sendrow .btn.send'); await sleep(200);
    const part = await page.evaluate(() => { const E = window.__ZG.S.ev; return { done: E.done, win: E.win, partial: E.partial }; });
    check(part.done && !part.win && part.partial && part.partial.xp > 0 && part.partial.xp < 50, 'a real word that does not use every letter ends the chest with a partial reward', JSON.stringify(part));
    await page.evaluate(() => { const Z = window.__ZG; Z.go('chest', Z.NODES[1]); }); await sleep(300);
    chest.answer = await page.evaluate(() => window.__ZG.S.ev.item.w);
  }
  await tapWord(chest.answer);
  await page.tap('.sendrow .btn.send'); await sleep(200);
  check(await page.evaluate(() => window.__ZG.S.ev.win), 'the hidden word opens the chest', chest.answer);
  await shot('phone-03-chest');

  // 4. Rock slide: a real text field plus Pošlji
  await page.evaluate(() => window.__ZG.go('trap', window.__ZG.NODES[3])); await sleep(1600);
  const rock = await page.evaluate(() => window.__ZG.S.ev.rocks.find(r => r.state === 'fall').ch);
  const tw = await page.evaluate(c => [...window.__ZG.WORDS].find(x => x.includes(c) && x.length === 5), rock);
  await page.tap('.wordin'); await typeText(page, tw); await sleep(100);
  await page.tap('.sendrow .btn.send'); await sleep(250);
  const trap = await page.evaluate(() => ({ broken: window.__ZG.S.ev.broken, focused: document.activeElement.className }));
  check(trap.broken >= 1 && trap.focused.includes('wordin'), 'Pošlji breaks the rock and keeps the keyboard open', `${rock} → ${tw}`);

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
