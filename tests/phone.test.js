// Phone viewport (390×844, touch): the mesh sends without a Pošlji button, crosswords and the
// rock slide are typed on the in-game Slovene keyboard (the system keyboard stays closed),
// green-fires / black-does-nothing, chest partial reward, darts fit the screen, Premor pauses.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Phone (touch, 390×844)');

const center = (page, sel, idx = 0) => page.evaluate((s, i) => {
  const r = document.querySelectorAll(s)[i].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
}, sel, idx);

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors, shot } = ctx;
  check(await page.evaluate(() => document.body.classList.contains('mobile')), 'mobile layout switches on by itself on a touch phone');
  // the old Mobilni prikaz switch could turn a phone into the broken desktop layout; a stored choice is ignored now
  await page.evaluate(() => localStorage.setItem('zg-mobile', '0')); await page.reload(); await page.waitForFunction(() => !!window.__ZG);
  await page.evaluate(() => { window.__ZG.S.tutOn = false; }); await sleep(300);
  check(await page.evaluate(() => window.__ZG.S.mobile && localStorage.getItem('zg-mobile') === null && !document.querySelector('.topbar')),
    'a phone stays in the phone layout even with an old "desktop" choice stored, and there is no switch');

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
  // a long word with letters of every hero: the word bar keeps its height, so the grid under the finger stays put
  const shift = await page.evaluate(() => { const Z = window.__ZG, B = Z.B, top = () => Math.round(document.querySelector('.mesh').getBoundingClientRect().top);
    const t0 = top(), bar0 = document.querySelector('.wordbar').offsetHeight, w = [...Z.allWords().keys()].sort((a, b) => b.length - a.length)[0], p = Z.findPath(w);
    p.forEach((i, n) => { B.grid[i].owner = n % Z.HEROES.length; }); B.path = p; B.typed = w; Z.renderWordForTest();
    const r = { w, before: t0, after: top(), bar: [bar0, document.querySelector('.wordbar').offsetHeight], chips: document.querySelectorAll('.wordbar .chip').length };
    B.path = []; B.typed = ''; Z.renderWordForTest(); return r; });
  check(shift.before === shift.after && shift.bar[0] === shift.bar[1] && shift.chips >= 3, 'selecting a long word of several heroes moves nothing: the word bar keeps its height', JSON.stringify(shift));
  const [word, tiles] = await page.evaluate(() => [...window.__ZG.allWords().entries()].find(([w]) => w.length >= 4));
  const tapTile = async i => { const [x, y] = await center(page, '.mesh .tile', i); await page.touchscreen.tap(x, y); await sleep(50); };
  check(await page.evaluate(() => !document.querySelector('.wordbar .btn.send') && !document.querySelector('.actionbar')), 'the mesh has no Pošlji button on a phone');
  for (const i of tiles) await tapTile(i);
  await sleep(150);
  const sel = await page.evaluate(() => { const c = document.querySelector('.wordbar .btn.clr'), r = c.getBoundingClientRect();
    return { words: window.__ZG.B.words, valid: document.querySelector('.word').classList.contains('valid'), clr: getComputedStyle(c).visibility !== 'hidden' && r.width >= 40 && r.height >= 40 }; });
  check(sel.words === 0 && sel.valid && sel.clr, 'tapped letters wait for a confirmation and show a thumb-size clear button', JSON.stringify({ word, ...sel }));
  await shot('phone-01-mesh');
  await tapTile(tiles[tiles.length - 1]); await sleep(700);
  check(await page.evaluate(() => window.__ZG.B.words === 1), 'a second tap on the last letter sends the word');
  // dragging: the word goes out when the finger lifts
  await page.evaluate(() => { const B = window.__ZG.B; B.enemies.forEach(e => { e.hp = e.maxHp; }); }); await sleep(900);
  const [, dragTiles] = await page.evaluate(() => [...window.__ZG.allWords().entries()].find(([w]) => w.length >= 3));
  const pts = []; for (const i of dragTiles) pts.push(await center(page, '.mesh .tile', i));
  const drag = async list => { await page.touchscreen.touchStart(...list[0]); for (const pt of list.slice(1)) { await sleep(40); await page.touchscreen.touchMove(...pt); } await sleep(40); await page.touchscreen.touchEnd(); };
  await drag(pts); await sleep(700);
  check(await page.evaluate(() => window.__ZG.B.words === 2), 'lifting the finger after a drag sends the word');
  // a string that is not a word plays nothing and lets go of its letters by itself
  await sleep(900);
  const bad = await page.evaluate(() => {
    const Z = window.__ZG, n = Z.B.grid.length, cols = 6, adj = (a, b) => a !== b && Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) <= 1 && Math.abs(a % cols - b % cols) <= 1;
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (adj(a, b)) for (let c = 0; c < n; c++) if (c !== a && adj(b, c)) {
      const w = [a, b, c].map(i => Z.B.grid[i].ch).join(''); if (!Z.WORDS.has(w)) return [a, b, c]; }
    return null;
  });
  if (bad) {
    const bp = []; for (const i of bad) bp.push(await center(page, '.mesh .tile', i));
    await drag(bp); await sleep(200);
    const mid = await page.evaluate(() => ({ words: window.__ZG.B.words, path: window.__ZG.B.path.length }));
    await sleep(800);
    const end = await page.evaluate(() => window.__ZG.B.path.length);
    check(mid.words === 2 && end === 0, 'a string that is not a word plays nothing and clears itself', JSON.stringify({ mid, end }));
  }

  // 2. Crossword: wrong letters stay black and do nothing; a correct entry turns green and fires
  // full health and no Kresnik burn ticking from the first word, so only the crossword can do damage
  await page.evaluate(() => { const B = window.__ZG.B; B.meter = 30; B.enemies.forEach(e => { e.hp = e.maxHp; e.burn = null; e.burnTurns = 0; }); });
  await page.keyboard.press(' '); await sleep(300);
  check(await page.evaluate(() => !!window.__ZG.B.cw), 'the zagovor crossword opens');
  // tap a regular clue: solving the keyword (gold column or ★ entry) would finish the whole zagovor
  const clueAt = await page.evaluate(() => { const r = document.querySelector('.clues .clue:not(.geslo):not(.main)').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), innerHeight, scrollY]; });
  await page.tap('.clues .clue:not(.geslo):not(.main)'); await sleep(150);
  const picked = await page.evaluate(() => { const C = window.__ZG.B.cw, e = C.D.entries[C.cur.e], kb = document.querySelector('.side .vkbd'), r = kb && kb.getBoundingClientRect();
    return { cur: C.cur.e, regular: !e.geslo && !e.main, system: C.input.getAttribute('inputmode'), keys: kb ? kb.querySelectorAll('.vkey').length : 0, onScreen: !!r && r.top >= 0 && r.bottom <= innerHeight + 1,
      keyW: kb ? Math.round(kb.querySelector('.vkey').getBoundingClientRect().width) : 0, keyH: kb ? Math.round(kb.querySelector('.vkey').getBoundingClientRect().height) : 0 }; });
  check(picked.regular && picked.system === 'none' && picked.keys === 27 && picked.onScreen, 'tapping a clue selects its entry; the in-game keyboard (25 letters, ⌫, Naprej) is on screen and the system keyboard stays closed', JSON.stringify({ ...picked, clueAt }));
  check(picked.keyW >= 30 && picked.keyH >= 44, 'keyboard keys are thumb-size', `${picked.keyW}×${picked.keyH}`);
  // type on the in-game keyboard the way a thumb does
  // returns false when the keyboard went away mid-word (the crossword finished early, e.g. through its keyword)
  const vk = async text => {
    for (const ch of text.toLowerCase()) {
      const hit = await page.evaluate(c => { const k = [...document.querySelectorAll('.vkbd .vkey')].find(x => x.textContent === c); if (k) k.click(); return !!k; }, ch);
      if (!hit) return false;
      await sleep(25);
    }
    return true;
  };
  const vkBack = () => page.evaluate(() => document.querySelector('.vkbd .vkey.back').click());
  const first = await page.evaluate(() => { const C = window.__ZG.B.cw; return C.D.entries[C.cur.e].answer; });
  const before = await page.evaluate(() => window.__ZG.B.enemies.map(e => e.hp));
  await vk('a'.repeat(first.length)); await sleep(200);
  const wrong = await page.evaluate(() => ({ solved: window.__ZG.B.cw.solved.size, black: document.querySelectorAll('.cell.typed').length, hp: window.__ZG.B.enemies.map(e => e.hp) }));
  check(wrong.solved === 0 && wrong.black > 0 && JSON.stringify(wrong.hp) === JSON.stringify(before), 'a wrong entry stays black and fires nothing', JSON.stringify({ first, before, ...wrong }));
  for (let i = 0; i <= first.length; i++) { await vkBack(); await sleep(30); }
  await page.evaluate(() => { window.__ZG.B.cw.cur.p = 0; });
  await vk(first); await sleep(250);
  const right = await page.evaluate(() => { const C = window.__ZG.B.cw; return { solved: C ? C.solved.size : -1, green: document.querySelectorAll('.cell.ok').length, cards: document.querySelectorAll('.card').length }; });
  check(right.solved >= 1 && right.green >= first.length && right.cards > 0, 'a correct entry turns green and fires an attack card', first);
  await shot('phone-02-crossword');

  // Naprej moves to the next unsolved word
  const curBefore = await page.evaluate(() => window.__ZG.B.cw ? window.__ZG.B.cw.cur.e : -1);
  if (curBefore >= 0) {
    await page.evaluate(() => document.querySelector('.vkbd .vkey.primary').click()); await sleep(100);
    check(await page.evaluate(c => window.__ZG.B.cw.cur.e !== c, curBefore), 'the Naprej key moves to the next word');
  }
  for (let k = 0; k < 8; k++) {
    const a = await page.evaluate(() => { const C = window.__ZG.B && window.__ZG.B.cw; return C ? C.D.entries[C.cur.e].answer : null; });
    if (!a) break;
    await page.evaluate(() => { window.__ZG.B.cw.cur.p = 0; }); await vk(a); await sleep(250);
  }
  check(await page.evaluate(() => !window.__ZG.B.cw), 'the whole crossword can be finished on the in-game keyboard');

  // 3. Chest: one word. A shorter real word ends it with a partial reward, the hidden word opens it
  await page.evaluate(() => window.__ZG.go('chest', window.__ZG.NODES[1])); await sleep(300);
  const chest = await page.evaluate(() => {
    const E = window.__ZG.S.ev, letters = E.letters.map(l => l.ch), W = window.__ZG.LEX.suggestedWords(3, E.item.w.length - 1);
    const can = w => { const pool = letters.slice(); for (const c of w) { const i = pool.indexOf(c); if (i < 0) return false; pool.splice(i, 1); } return true; };
    const partial = W.filter(w => w !== E.item.w && can(w)).sort((a, b) => b.length - a.length)[0];
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
    check(part.done && !part.win && part.partial && part.partial.share > 0 && part.partial.share < 1, 'a real word that does not use every letter ends the chest with a partial reward (part of the gold, no item)', JSON.stringify(part));
    await page.evaluate(() => { const Z = window.__ZG; Z.go('chest', Z.NODES[1]); }); await sleep(300);
    chest.answer = await page.evaluate(() => window.__ZG.S.ev.item.w);
  }
  await tapWord(chest.answer);
  await page.tap('.sendrow .btn.send'); await sleep(200);
  check(await page.evaluate(() => window.__ZG.S.ev.win), 'the hidden word opens the chest', chest.answer);
  await shot('phone-03-chest');

  // 4. Rock slide: typed on the in-game keyboard, sent with Pošlji
  await page.evaluate(() => window.__ZG.go('trap', window.__ZG.NODES[3])); await sleep(1600);
  const rock = await page.evaluate(() => window.__ZG.S.ev.rocks.find(r => r.state === 'fall').ch);
  const tw = await page.evaluate(c => window.__ZG.LEX.suggestedWords(5, 5).find(x => x.includes(c)), rock);
  const trapKb = await page.evaluate(() => { const kb = document.querySelector('.event > .vkbd'), r = kb && kb.getBoundingClientRect(); return { keys: kb ? kb.querySelectorAll('.vkey').length : 0, onScreen: !!r && r.bottom <= innerHeight + 1, readonly: document.querySelector('.wordin').readOnly }; });
  check(trapKb.keys === 26 && trapKb.onScreen && trapKb.readonly, 'the rock slide shows the in-game keyboard and keeps the system keyboard closed', JSON.stringify(trapKb));
  for (const ch of tw) { await page.evaluate(c => [...document.querySelectorAll('.vkbd .vkey')].find(k => k.textContent === c).click(), ch); await sleep(25); }
  check(await page.evaluate(() => document.querySelector('.wordin').value) === tw, 'keys type into the word field', tw);
  await shot('phone-04-rockslide');
  await page.tap('.sendrow .btn.send'); await sleep(250);
  check(await page.evaluate(() => window.__ZG.S.ev.broken >= 1), 'Pošlji breaks the rock', `${rock} → ${tw}`);

  // 5. Darts keep Pošlji and fit the width of a small phone, however long the word is
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluate(() => window.__ZG.go('darts', { id: 'puscice' })); await sleep(400);
  const darts = await page.evaluate(() => ({ cols: window.__ZG.S.ev.cols.length, wide: document.documentElement.scrollWidth, vw: innerWidth, send: !!document.querySelector('.sendrow .btn.send'),
    right: Math.round(Math.max(...[...document.querySelectorAll('.dartcol, .sendrow .btn.send')].map(e => e.getBoundingClientRect().right))) }));
  check(darts.send && darts.wide <= darts.vw && darts.right <= darts.vw, 'darts: every column and Pošlji fit a 360 px phone', JSON.stringify(darts));
  await shot('phone-05-darts');

  // 6. Premor: a labelled thumb-size button that stops the clock and hides the puzzle
  const pause = await page.evaluate(() => { const b = document.querySelector('.bhead .pausebtn'), r = b.getBoundingClientRect(), hd = b.closest('.bhead');
    return { label: b.innerText.trim(), h: Math.round(r.height), right: Math.round(r.right), vw: innerWidth, fits: hd.scrollWidth <= hd.clientWidth }; });
  check(pause.label === 'Premor' && pause.h >= 40 && pause.fits && pause.right <= pause.vw, "the puzzle's header has a labelled Premor button that fits 360 px", JSON.stringify(pause));
  const t0 = await page.evaluate(() => window.__ZG.S.ev.time);
  await page.tap('.bhead .pausebtn'); await sleep(600);
  const held = await page.evaluate(() => ({ paused: window.__ZG.G.paused, t: window.__ZG.S.ev.time, blur: getComputedStyle(document.querySelector('.event .panel')).filter }));
  check(held.paused && Math.abs(held.t - t0) < 0.15 && held.blur.includes('blur'), 'Premor stops the clock and blurs the puzzle', JSON.stringify({ t0, ...held }));
  await page.tap('.overlay.pause .btn.primary'); await sleep(200);
  check(await page.evaluate(() => !window.__ZG.G.paused), 'Nadaljuj resumes');

  // 7. Android back button (MainActivity asks window.zgBack): pause, resume, and leave only from the start screen
  const back = await page.evaluate(async () => {
    const Z = window.__ZG, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
    Z.go('battle', Z.NODES[0]); await wait(200);
    out.pause = [window.zgBack(), Z.G.paused]; out.resume = [window.zgBack(), Z.G.paused];
    Z.go('gallery'); await wait(100); out.gallery = [window.zgBack(), Z.S.screen];
    out.heroes = [window.zgBack(), Z.S.screen];
    out.title = window.zgBack();
    return out;
  });
  check(back.pause[1] === true && back.resume[1] === false && back.gallery[1] === 'heroes' && back.heroes[1] === 'title' && back.title === 'exit',
    'Android back: pauses a battle, resumes it, steps back page by page to the start screen and only exits from there', JSON.stringify(back));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
