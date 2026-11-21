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

  // balance E (Game Director, 20 Nov 2026): every region has one event slot, a chest or a trap (never both), and a well
  // slot. The event is a chest by chance, fewer on higher Znanje, else a rock slide or spikes; Ptuj's is always a chest.
  // Wells stand by chance too, never a half of the road without one. Ljubljanica and Ljubljanski grad start with the event.
  const shipped = require('../data/world.json').chance;   // the harness sets every chance to 1; these checks need the real odds
  const plan = await page.evaluate(shipped => { const Z = window.__ZG, W = Z.WORLD, keep = JSON.parse(JSON.stringify(W.chance));
    Object.assign(W.chance.chest, shipped.chest); Object.assign(W.chance.well, shipped.well); W.chance.traps = shipped.traps.slice();
    const out = { first: {}, slots: W.regions.map(r => [r.stops.filter(k => k === 'event').length, r.stops.filter(k => ['chest', 'trap', 'darts'].includes(k)).length, r.stops.filter(k => k === 'well').length]) }, half = W.regions.length / 2;
    for (const id of ['reka', 'grad']) out.first[id] = W.regions.find(r => r.id === id).stops[0];
    out.chest = {}; out.kinds = new Set(); out.ptuj = new Set();
    for (const k of ['malcek', 'ucenjak', 'molj']) { let chests = 0, n = 0;
      for (let i = 0; i < 600; i++) { const p = Z.planEvents(k); out.ptuj.add(p[0]); p.slice(1).forEach(x => { if (x) { n++; out.kinds.add(x); if (x === 'chest') chests++; } }); }
      out.chest[k] = +(chests / n).toFixed(2); }
    out.kinds = [...out.kinds].sort().join(); out.ptuj = [...out.ptuj].join();
    out.well = {};
    for (const k of ['malcek', 'ucenjak', 'molj']) { let sum = 0, dryHalf = 0;
      for (let i = 0; i < 600; i++) { const p = Z.planStops('well', k); sum += p.length; if (!p.some(x => x < half) || !p.some(x => x >= half)) dryHalf++; }
      out.well[k] = { avg: +(sum / 600).toFixed(2), dryHalf }; }
    Object.assign(W.chance.chest, keep.chest); Object.assign(W.chance.well, keep.well); W.chance.traps = keep.traps;
    return out; }, shipped);
  check(plan.slots.every(([ev, old, well]) => ev === 1 && old === 0 && well === 1), 'every region has exactly one event slot (no fixed chests or traps) and one well slot', JSON.stringify(plan.slots));
  check(plan.first.reka === 'event' && plan.first.grad === 'event', 'Ljubljanica and Ljubljanski grad start with the event', JSON.stringify(plan.first));
  check(plan.ptuj === 'chest' && plan.kinds === 'chest,darts,trap', 'Ptuj\'s event is always a chest; elsewhere a chest, a rock slide or spikes', JSON.stringify({ ptuj: plan.ptuj, kinds: plan.kinds }));
  check(plan.chest.malcek > plan.chest.ucenjak && plan.chest.ucenjak > plan.chest.molj && Math.abs(plan.chest.malcek - shipped.chest.malcek) < 0.07,
    'the event is a chest more often on lower Znanje (Malček > Učenjak > Knjižni molj), a trap otherwise', JSON.stringify(plan.chest));
  check(plan.well.malcek.avg > plan.well.ucenjak.avg && plan.well.ucenjak.avg > plan.well.molj.avg && ['malcek', 'ucenjak', 'molj'].every(k => plan.well[k].dryHalf === 0),
    'wells stand by chance, fewer on higher Znanje, and never a half of the road without one', JSON.stringify(plan.well));
  const drop = await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); const R = Z.S.run, kinds = () => R.stops.map(s => s.kind);
    R.eventAt = R.eventAt.map(() => null); R.wellAt = []; Z.enterRegion(1); const without = kinds();
    R.eventAt[1] = 'trap'; R.wellAt = [1]; Z.enterRegion(1); const trap = kinds();
    R.eventAt[1] = 'chest'; Z.enterRegion(1); const chest = kinds();
    return { without, trap, chest }; });
  check(!drop.without.some(k => ['chest', 'trap', 'darts', 'well', 'event'].includes(k)) && drop.trap.includes('trap') && !drop.trap.includes('chest') && drop.trap.includes('well')
    && drop.chest.includes('chest') && !drop.chest.includes('trap'), 'a region\'s event is its chest or its trap, never both; a well left out is not on the road', JSON.stringify(drop));

  // three-letter words count on every level
  const three = await page.evaluate(() => { const Z = window.__ZG; return ['malcek', 'ucenjak', 'molj'].map(k => Z.LEVELS[k].minWord); });
  check(three.every(n => n === 3), 'three-letter words count on Malček, Učenjak and Knjižni molj', JSON.stringify(three));

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
