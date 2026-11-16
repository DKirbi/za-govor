// Word input in the letter mesh (playtest round 3): proposals and the hint stay put while dragging,
// one proposal per word (its shortest form), the hint lasts until its word is played.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Word input (drag, tap, proposals, hint)');
const center = (page, sel, idx = 0) => page.evaluate((s, i) => { const r = document.querySelectorAll(s)[i].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel, idx);

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors, shot } = ctx;
  await page.evaluate(() => { const Z = window.__ZG; Z.S.know = 'malcek'; Z.S.suggest = true; Z.S.mode = 'calm'; Z.go('battle', Z.NODES[0]); });
  await sleep(500);

  // one proposal per word: DELA, not DELA, DELATI and DELALA
  const forms = await page.evaluate(() => { const Z = window.__ZG; const list = Z.shortestForms([['dela', 1], ['delati', 2], ['delala', 3], ['voda', 4], ['vode', 5]]); return list.map(e => e[0]).sort().join(); });
  check(forms === 'dela,voda', 'several forms of one word make one proposal: the shortest', forms);

  // a tapped first letter shows proposals; dragging on does not change the row until the finger lifts
  const [w, p] = await page.evaluate(() => [...window.__ZG.allWords().entries()].find(([w, p]) => w.length >= 5));
  const pts = []; for (const i of p) pts.push(await center(page, '.mesh .tile', i));
  await page.touchscreen.tap(...pts[0]); await sleep(150);
  const before = await page.evaluate(() => document.querySelector('.wordbar .props').textContent);
  await page.touchscreen.touchStart(...pts[0]);
  for (const pt of pts.slice(1, 3)) { await sleep(40); await page.touchscreen.touchMove(...pt); }
  await sleep(80);
  const during = await page.evaluate(() => ({ props: document.querySelector('.wordbar .props').textContent, path: window.__ZG.B.path.length }));
  check(during.path >= 3 && during.props === before, 'proposals stay as they were while the finger drags', JSON.stringify({ before, during }));
  await page.touchscreen.touchEnd(); await sleep(700);
  await page.evaluate(() => { const Z = window.__ZG, B = Z.B; const e = [...Z.allWords().entries()].find(([w]) => w.length >= 4); B.path = [e[1][0], e[1][1]]; B.typed = e[0].slice(0, 2); Z.renderWordForTest(); }); await sleep(100);
  const lemmas = await page.evaluate(() => { const Z = window.__ZG, ws = [...document.querySelectorAll('.wordbar .props .prop')].map(b => b.textContent.toLowerCase().replace(/[^a-zčšž]/g, ''));
    const ls = ws.map(x => Z.LEMMA.get(x) || x); return { ws, dup: ls.length !== new Set(ls).size }; });
  check(lemmas.ws.length > 0 && !lemmas.dup && !lemmas.ws.some(a => lemmas.ws.some(b => b !== a && b.startsWith(a))), 'no two proposals are forms of the same word, and none hides behind a shorter one', JSON.stringify(lemmas.ws));

  // the hint lasts: a chip in the proposal row and two marked letters, through other words, until a shuffle
  await page.evaluate(() => { const Z = window.__ZG; Z.B.path = []; Z.B.typed = ''; Z.renderWordForTest(); Z.useHint(); }); await sleep(200);
  const h1 = await page.evaluate(() => ({ chip: (document.querySelector('.wordbar .hintchip') || {}).textContent || '', marked: document.querySelectorAll('.mesh .tile.hint').length, hint: window.__ZG.B.hint && window.__ZG.B.hint.w }));
  check(/^Namig: [A-ZČŠŽ]{2}…/.test(h1.chip) && h1.marked === 2, 'Namig shows a lasting chip and marks the first two letters', JSON.stringify(h1));
  await shot('input-01-hint');
  await page.evaluate(() => { const Z = window.__ZG; Z.B.path = Z.findPath('xyz') || []; });
  await sleep(3600);   // longer than a feedback line lasts
  const h2 = await page.evaluate(() => !!document.querySelector('.wordbar .hintchip'));
  check(h2, 'the hint is still there after the feedback line has gone');
  await page.evaluate(() => window.__ZG.shuffleGrid(true)); await sleep(200);
  check(await page.evaluate(() => !document.querySelector('.wordbar .hintchip') && !window.__ZG.B.hint), 'shuffling the mesh ends the hint');

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
