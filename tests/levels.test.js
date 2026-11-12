// Knowledge levels (Malček, Učenjak, Knjižni molj): chosen on Nova pot, saved when the journey starts;
// each sets the letter-mesh tips, the shortest word, crossword banks and crossword tips.
const { openGame, runner, sleep, typeText } = require('./harness');
const { check, run } = runner('Knowledge levels (Malček, Učenjak, Knjižni molj)');

const EXPECT = {
  malcek:  { hints: 3, namig: true,  proposals: true,  count: true,  coach: true,  minWord: 3, reveals: 5, lengths: true },
  ucenjak: { hints: 1, namig: true,  proposals: false, count: true,  coach: true,  minWord: 4, reveals: 2, lengths: true },
  molj:    { hints: 0, namig: false, proposals: false, count: false, coach: false, minWord: 4, reveals: 1, lengths: false },
};

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  await page.evaluate(() => window.__ZG.go('newrun')); await sleep(150);
  check(await page.evaluate(() => document.querySelectorAll('.lv-grid .choice').length === 3), 'Nova pot offers three knowledge levels under the pace choice');
  check(await page.evaluate(() => window.__ZG.S.know === 'malcek'), 'Malček is the default');

  for (const [level, ex] of Object.entries(EXPECT)) {
    const name = await page.evaluate(l => window.__ZG.LEVELS[l].name, level);
    // choose the level on Nova pot; it counts (and is saved) once the journey starts
    await page.evaluate(() => { window.__ZG.go('title'); window.__ZG.go('newrun'); }); await sleep(150);
    await page.click(`.lv-grid .choice[data-id="${level}"]`); await sleep(150);
    const shown = await page.evaluate(() => [...document.querySelectorAll('.subopt')].some(t => !t.hidden && t.textContent.includes('Predlogi besed')));
    check(shown === ex.proposals, `${name}: word-proposal switch ${ex.proposals ? 'shown under it' : 'hidden'} on Nova pot`);
    if (level === 'molj') await shot('levels-newrun');
    await page.click('.cta-row .cta'); await sleep(150);
    await page.keyboard.press('Enter'); await sleep(300);
    const saved = await page.evaluate(() => ({ screen: window.__ZG.S.screen, know: window.__ZG.S.know, stored: localStorage.getItem('zg-know') }));
    check(saved.screen === 'travel' && saved.know === level && saved.stored === level, `${name}: starting a journey with it saves it`, JSON.stringify(saved));

    // letter mesh tips
    await page.evaluate(() => { window.__ZG.S.mode = 'calm'; window.__ZG.go('battle', window.__ZG.NODES[2]); }); await sleep(600);
    const mesh = await page.evaluate(() => {
      const Z = window.__ZG, B = Z.B, props = document.querySelector('.props');
      return { hints: B.hints, namig: [...document.querySelectorAll('.side button')].some(b => b.textContent.startsWith('Namig')),
        count: !!props && props.style.display !== 'none' && /besed/.test(props.textContent),
        coach: !!document.querySelector('.coach') && document.querySelector('.coach').style.display !== 'none',
        meta: document.body.textContent.includes(Z.LEVELS[Z.S.know].name) };
    });
    check(mesh.hints === ex.hints && mesh.namig === ex.namig, `${name}: ${ex.hints} hints per battle, Namig button ${ex.namig ? 'shown' : 'hidden'}`);
    check(mesh.count === ex.count, `${name}: word count of the mesh ${ex.count ? 'shown' : 'hidden'}`);
    check(mesh.coach === ex.coach, `${name}: coaching tips ${ex.coach ? 'shown' : 'hidden'}`);
    check(mesh.meta, `${name}: the level name is shown in the battle header`);

    // word proposals appear only on Malček (after starting a word)
    const start = await page.evaluate(() => [...window.__ZG.allWords().keys()].find(w => w.length >= 5));
    await typeText(page, start.slice(0, 2)); await sleep(150);
    const props = await page.evaluate(() => /Predlogi:/.test((document.querySelector('.props') || {}).textContent || ''));
    check(props === ex.proposals, `${name}: word proposals ${ex.proposals ? 'shown' : 'not shown'} while typing`);
    await page.keyboard.press('Delete'); await sleep(100);

    // shortest word
    const three = await page.evaluate(() => {
      const Z = window.__ZG;
      for (let i = 0; i < 30; i++) {
        const w = Z.LEX.suggestedWords(3, 3).find(x => (Z.findPath(x) || []).length === 3);
        if (w) return w;
        Z.go('battle', Z.NODES[2]);
      }
      return null;
    });
    if (three) {
      const w0 = await page.evaluate(() => window.__ZG.B.words);
      await typeText(page, three); await page.keyboard.press('Enter'); await sleep(250);
      const w1 = await page.evaluate(() => window.__ZG.B.words);
      check((w1 === w0 + 1) === (ex.minWord === 3), `${name}: a 3-letter word ${ex.minWord === 3 ? 'counts' : 'is too short'}`, three);
      if (w1 === w0) await page.keyboard.press('Delete');
      await sleep(400);
    }

    // crossword: banks, letter counts, reveal tips
    await page.evaluate(() => { const B = window.__ZG.B; B.meter = 30; B.enemies.forEach(e => { e.hp = e.maxHp = 500; }); });
    await page.keyboard.press(' '); await sleep(300);
    const cw = await page.evaluate(() => {
      const Z = window.__ZG, C = Z.B.cw, cfg = Z.LEVELS[Z.S.know].fin;
      const allowed = new Set(cfg.banks.flatMap(b => Z.CLUES.banks[b].map(r => r[0])));
      return { open: !!C, reveals: C.reveals, fromBanks: C.D.entries.every(e => e.geslo || e.main || allowed.has(e.answer)),
        lengths: [...document.querySelectorAll('.clue')].every(el => /\(\d+\)\s*$/.test(el.textContent)) };
    });
    check(cw.open && cw.fromBanks, `${name}: the finisher crossword uses this level's clue bank`);
    check(cw.reveals === ex.reveals, `${name}: ${ex.reveals} revealed letter${ex.reveals > 1 ? 's' : ''} per crossword`);
    check(cw.lengths === ex.lengths, `${name}: answer lengths ${ex.lengths ? 'shown' : 'hidden'} in the clues`);

    // real mouse clicks must reach the crossword (nothing may cover the panel)
    const target = await page.evaluate(() => { const C = window.__ZG.B.cw; return C.D.entries.findIndex((e, i) => i !== C.cur.e && !e.geslo); });
    const clueEls = await page.$$('.clues .clue');
    if (target >= 0) {
      const idx = await page.evaluate(t => [...window.__ZG.B.cw.clueEls.keys()].indexOf(t), target);
      await clueEls[idx].click(); await sleep(100);
      check(await page.evaluate(t => window.__ZG.B.cw.cur.e === t, target), `${name}: clicking a clue with the mouse selects it`);
      await page.evaluate(() => { const C = window.__ZG.B.cw; C.cur = { e: C.D.entries.findIndex(e => !e.geslo), p: 0 }; });
      await page.evaluate(() => document.querySelector('.nativein').focus());
    }
    await page.click('.revbtn'); await sleep(200);
    const rev = await page.evaluate(() => ({ left: window.__ZG.B.cw.reveals, cells: document.querySelectorAll('.cell.rev').length, btn: !!document.querySelector('.revbtn') }));
    check(rev.left === ex.reveals - 1 && rev.cells === 1, `${name}: Razkrij črko fills one letter of the current entry`);
    check(rev.btn === (ex.reveals > 1), `${name}: the reveal button ${ex.reveals > 1 ? 'stays' : 'disappears'} after one use`);
    if (level === 'ucenjak') await shot('levels-crossword-reveal');

    if (level === 'malcek') {
      // reveal a whole short entry: it is solved and fires at half power
      await page.evaluate(() => {
        const C = window.__ZG.B.cw;
        const k = C.D.entries.map((e, i) => [e, i]).filter(([e, i]) => !e.geslo && !C.solved.has(i)).sort((a, b) => a[0].answer.length - b[0].answer.length)[0][1];
        C.cur = { e: k, p: 0 };
      });
      for (let i = 0; i < 4; i++) { if (await page.$('.revbtn')) { await page.click('.revbtn'); await sleep(120); } }
      const done = await page.evaluate(() => ({ solved: window.__ZG.B.cw ? window.__ZG.B.cw.solved.size : -1, fb: (document.querySelector('.fb') || {}).textContent || '' }));
      check(done.solved >= 1 && /pol moči/.test(done.fb), 'Malček: a word completed with revealed letters still fires, at half power', done.fb);
    }
    await page.evaluate(() => { window.__ZG.B.cw = null; });
  }

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
