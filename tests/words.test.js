// Words of the regions (data/words.json) at chests and rock slides, and the Znanje rules for hints:
// clues at chests by Znanje, no hints at all on Knjižni molj, three-letter words on every level.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Region words, chests and hints by Znanje');

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  const data = await page.evaluate(() => { const Z = window.__ZG, R = Z.REGION_WORDS;
    const ids = Z.WORLD.regions.map(r => r.id), missing = ids.filter(id => !R[id] || !(R[id].chest || []).length);
    const bad = Object.values(R).flatMap(r => (r.chest || []).map(x => x[0]).concat(r.rocks || [], r.theme || [])).filter(w => !Z.WORDS.has(w));
    const rocks = Z.WORLD.regions.filter(r => r.stops.includes('trap')).map(r => r.id).filter(id => !(R[id].rocks || []).length);
    return { missing, bad, rocks, n: Object.values(R).reduce((a, r) => a + r.chest.length, 0) }; });
  check(!data.missing.length && !data.rocks.length && data.n >= 50, 'every region has chest words, every rock-slide region has rock words', JSON.stringify(data));
  check(!data.bad.length, 'every word in data/words.json is in the game\'s word list', data.bad.join(', '));

  // a chest at Ptuj takes a Ptuj word; the next chest on the same journey takes another
  const chests = await page.evaluate(() => { const Z = window.__ZG; Z.S.know = 'malcek'; Z.S.testMode = true; Z.newRun('krpan');
    const ptuj = Z.REGION_WORDS.ptuj.chest.map(x => x[0]), got = [];
    for (let i = 0; i < 4; i++) { Z.go('chest', { id: 'skrinja', stop: null }); got.push(Z.S.ev.item.w); }
    return { got, ptuj, allPtuj: got.every(w => ptuj.includes(w)), distinct: new Set(got).size }; });
  check(chests.allPtuj && chests.distinct === 4, 'chests at Ptuj use Ptuj words, never the same word twice on one journey', JSON.stringify(chests.got));

  // Malček sees the clue; Knjižni molj never does
  const clue = await page.evaluate(() => { const Z = window.__ZG, out = {};
    for (const k of ['malcek', 'molj']) { Z.S.know = k; let n = 0; for (let i = 0; i < 6; i++) { Z.go('chest', { id: 'skrinja', stop: null }); if (document.querySelector('.chestclue')) n++; } out[k] = n; }
    Z.S.know = 'ucenjak'; let u = 0; for (let i = 0; i < 40; i++) { Z.go('chest', { id: 'skrinja', stop: null }); if (document.querySelector('.chestclue')) u++; } out.ucenjak = u;
    return out; });
  check(clue.malcek === 6 && clue.molj === 0 && clue.ucenjak > 5 && clue.ucenjak < 35, 'the chest clue: always on Malček, on some chests on Učenjak, never on Knjižni molj', JSON.stringify(clue));

  // the chest: ✕ and Pošlji right next to the word; ✕ clears it
  await page.evaluate(() => { const Z = window.__ZG; Z.S.know = 'malcek'; Z.go('chest', { id: 'skrinja', stop: null }); });
  await page.click('.event .letters .tile'); await page.click('.event .letters .tile:nth-child(2)'); await sleep(100);
  const row = await page.evaluate(() => { const r = document.querySelector('.event .sendrow'); return { clr: !!r.querySelector('.btn.clr:not([disabled])'), send: !!r.querySelector('.btn.send'), sel: window.__ZG.S.ev.sel.length }; });
  await page.click('.event .sendrow .btn.clr'); await sleep(100);
  const cleared = await page.evaluate(() => window.__ZG.S.ev.sel.length);
  check(row.clr && row.send && row.sel === 2 && cleared === 0, 'the chest has ✕ and Pošlji next to the word; ✕ clears it', JSON.stringify({ ...row, cleared }));
  await shot('words-01-chest');

  // the rock slide at Peca builds its rocks from a Peca word and says the letters may stand anywhere
  const rock = await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('travel');
    for (let i = 0; i < 20 && Z.S.run.ri < 1; i++) Z.travelAct('skip');
    Z.go('trap', { id: 'plaz', stop: null });
    const letters = Z.S.ev.rocks.map(r => r.ch), words = Z.REGION_WORDS.peca.rocks;
    return { ri: Z.S.run.ri, letters, fits: words.some(w => letters.every(ch => w.includes(ch))), rule: /v poljubnem vrstnem redu/.test(document.querySelector('.event .panel').textContent), fall: Z.S.ev.fall }; });
  check(rock.ri === 1 && rock.fits && rock.rule, 'the rock slide at Peca uses a Peca word and says the letters may stand anywhere', JSON.stringify(rock));
  check(rock.fall >= 22, 'the rocks fall slower than before (22 s in real time)', String(rock.fall));
  await page.evaluate(() => { window.__ZG.S.ev.done = true; window.__ZG.go('title'); });

  // Knjižni molj: no Namig, even with Praprotno seme; Malček keeps it
  const hints = await page.evaluate(() => { const Z = window.__ZG, out = {};
    for (const k of ['malcek', 'molj']) { Z.S.know = k; Z.newRun('krpan'); Z.giveItem('praprotno-seme'); Z.go('battle', Z.NODES[0]);
      out[k] = { hints: Z.B.hints, btn: [...document.querySelectorAll('.side button')].some(b => b.textContent.startsWith('Namig')) }; Z.B.over = true; Z.go('title'); }
    return out; });
  check(hints.molj.hints === 0 && !hints.molj.btn && hints.malcek.hints === 4 && hints.malcek.btn, 'Knjižni molj has no Namig at all, even with Praprotno seme', JSON.stringify(hints));

  // three-letter words count on every level
  const three = await page.evaluate(() => { const Z = window.__ZG; return ['malcek', 'ucenjak', 'molj'].map(k => Z.LEVELS[k].minWord); });
  check(three.every(n => n === 3), 'three-letter words count on Malček, Učenjak and Knjižni molj', JSON.stringify(three));

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
