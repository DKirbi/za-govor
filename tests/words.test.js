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

  // chests and wells: a slot for each in every region, at the start of Ljubljanica and Ljubljanski grad a chest;
  // on a journey only by chance, fewer on higher Znanje; never no chest, never a half of the road without a well
  const shipped = require('../data/world.json').chance;   // the harness sets every chance to 1; these checks need the real odds
  const plan = await page.evaluate(shipped => { const Z = window.__ZG, W = Z.WORLD, keep = JSON.parse(JSON.stringify(W.chance));
    Object.assign(W.chance.chest, shipped.chest); Object.assign(W.chance.well, shipped.well);
    const out = { first: {}, everyRegion: W.regions.every(r => r.stops.includes('chest') && r.stops.includes('well')) }, half = W.regions.length / 2;
    for (const id of ['reka', 'grad']) out.first[id] = W.regions.find(r => r.id === id).stops[0];
    for (const kind of ['chest', 'well']) { out[kind] = {};
      for (const k of ['malcek', 'ucenjak', 'molj']) { let sum = 0, none = 0, dryHalf = 0;
        for (let i = 0; i < 600; i++) { const p = Z.planStops(kind, k); sum += p.length; if (!p.length) none++; if (!p.some(x => x < half) || !p.some(x => x >= half)) dryHalf++; }
        out[kind][k] = { avg: +(sum / 600).toFixed(2), none, dryHalf }; } }
    Object.assign(W.chance.chest, keep.chest); Object.assign(W.chance.well, keep.well);
    return out; }, shipped);
  check(plan.everyRegion, 'every region has a chest slot and a well slot');
  check(plan.first.reka === 'chest' && plan.first.grad === 'chest', 'Ljubljanica and Ljubljanski grad start with a chest', JSON.stringify(plan.first));
  check(['chest', 'well'].every(kind => plan[kind].malcek.avg > plan[kind].ucenjak.avg && plan[kind].ucenjak.avg > plan[kind].molj.avg && plan[kind].molj.avg >= 2),
    'chests and wells stand by chance: fewer on higher Znanje (Malček > Učenjak > Knjižni molj)', JSON.stringify(plan));
  check(['malcek', 'ucenjak', 'molj'].every(k => plan.chest[k].none === 0 && plan.well[k].dryHalf === 0), 'a journey always keeps a chest, and a well in each half of the road');
  const drop = await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); const R = Z.S.run;
    R.chestAt = []; R.wellAt = []; Z.enterRegion(0); const without = R.stops.some(s => s.kind === 'chest' || s.kind === 'well');
    R.chestAt = [0]; R.wellAt = [0]; Z.enterRegion(0); const withIt = R.stops.some(s => s.kind === 'chest') && R.stops.some(s => s.kind === 'well');
    return { without, withIt }; });
  check(!drop.without && drop.withIt, 'a chest or a well left out of the journey is not on the road', JSON.stringify(drop));

  // three-letter words count on every level
  const three = await page.evaluate(() => { const Z = window.__ZG; return ['malcek', 'ucenjak', 'molj'].map(k => Z.LEVELS[k].minWord); });
  check(three.every(n => n === 3), 'three-letter words count on Malček, Učenjak and Knjižni molj', JSON.stringify(three));

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
