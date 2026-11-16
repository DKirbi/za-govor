// Starter-help words (Znanje, progression design §11.3): while the help lasts, a battle's letter mesh opens
// with whole words laid in rows, readable left to right or right to left. Malček gets the most and the
// longest words for the first half of the road, Učenjak fewer for the first quarter, Knjižni molj two short
// ones in the first region only. About half come from the region, in any of their forms.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Starter-help words in the letter mesh');

// open a battle in region `ri` of a journey on Znanje `know`; returns what was planted
const battle = (page, know, ri = 0) => page.evaluate((know, ri) => {
  const Z = window.__ZG; if (Z.B) Z.B.over = true;
  Z.S.know = know; Z.S.testMode = true; Z.S.mode = 'calm'; Z.newRun('krpan'); Z.S.run.ri = ri;
  Z.go('battle', { ...Z.NODES[0], battle: { ...Z.NODES[0].battle, tips: [] } });   // like a road battle after the first: no coach tips of its own
  const B = Z.B, rows = [...Array(5).keys()].map(r => B.grid.slice(r * 6, r * 6 + 6).map(t => t.ch).join(''));
  return { rows, log: B.logLines.slice(), starters: B.starters.map(s => ({ ...s,
    spelled: s.path.map(i => B.grid[i].ch).join(''), word: Z.WORDS.has(s.w) && Z.LEX.suggested(s.w), lemma: Z.LEMMA.get(s.w) || s.w,
    inRow: s.path.every(i => Math.floor(i / 6) === s.row), straight: s.path.every((i, k) => k === 0 || Math.abs(i - s.path[k - 1]) === 1),
    found: (Z.findPath(s.w) || []).length === s.w.length })) };
}, know, ri);

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  // Malček at Ptuj: four words (5, 4, 4, 3 letters), each in its own row, spelled along its path
  const mal = await battle(page, 'malcek');
  const lens = mal.starters.map(s => s.w.length).join();
  check(lens === '5,4,4,3', 'Malček: the mesh opens with four words of 5, 4, 4 and 3 letters', lens + ' ' + mal.rows.join('/'));
  check(mal.starters.every(s => s.spelled === s.w && s.word && s.inRow && s.straight && s.found), 'each starter word lies in one row, straight, is a word the game suggests, and can be played', JSON.stringify(mal.starters.map(s => [s.w, s.spelled, s.row, s.back])));
  check(new Set(mal.starters.map(s => s.row)).size === 4 && new Set(mal.starters.map(s => s.lemma)).size === 4, 'one word per row, never two forms of one base form', JSON.stringify(mal.starters.map(s => [s.row, s.lemma])));
  check(/V vrsticah mreže ležijo cele besede/.test(mal.log.join(' ')), 'the battle log says that whole words lie in the rows', mal.log.join(' | '));
  const coach = await page.evaluate(() => { const c = document.querySelector('.coach'); return c && c.style.display !== 'none' ? c.textContent : ''; });
  check(/cele besede/.test(coach), 'Malček: the coach tip points at the words in the rows until the first word is played', coach);
  await shot('starters-01-malcek');

  // the help lasts: Malček the first half of the road, Učenjak the first quarter, Knjižni molj the first region
  const span = await page.evaluate(() => { const Z = window.__ZG, out = {};
    for (const k of ['malcek', 'ucenjak', 'molj']) { Z.S.know = k; Z.newRun('krpan'); out[k] = Z.WORLD.regions.map((r, i) => { Z.S.run.ri = i; return Z.starterLens().length; }).join(''); }
    Z.S.run = null; Z.S.know = 'molj'; out.practice = Z.starterLens().length; Z.S.know = 'malcek';
    return out; });
  check(span.malcek === '4444400000' && span.ucenjak === '3330000000' && span.molj === '2000000000',
    'the help lasts half the road on Malček, a quarter on Učenjak and only the first region on Knjižni molj', JSON.stringify(span));
  check(span.practice === 2, 'battles outside a journey always get the help');

  // Učenjak and Knjižni molj: fewer and shorter words
  const uc = await battle(page, 'ucenjak');
  check(uc.starters.map(s => s.w.length).join() === '4,3,3' && uc.starters.every(s => s.spelled === s.w && s.found), 'Učenjak: three words of 4, 3 and 3 letters', JSON.stringify(uc.starters.map(s => s.w)));
  const mo = await battle(page, 'molj');
  check(mo.starters.map(s => s.w.length).join() === '3,3' && mo.starters.every(s => s.spelled === s.w && s.found), 'Knjižni molj: two three-letter words, as a reminder', JSON.stringify(mo.starters.map(s => s.w)));
  check(await page.evaluate(() => { const c = document.querySelector('.coach'); return !c || c.style.display === 'none'; }), 'Knjižni molj: no coach tip (no hints on that level)');
  const late = await battle(page, 'molj', 1);
  check(!late.starters.length && !/cele besede/.test(late.log.join(' ')), 'Knjižni molj at Peca: no starter words, no line about them', JSON.stringify(late.starters));
  const malLate = await battle(page, 'malcek', 5);
  check(!malLate.starters.length, 'Malček after the first half of the road: the mesh is all random again');

  // forwards and backwards; about half the words come from the region, in any of their forms
  const many = await page.evaluate(() => { const Z = window.__ZG, B = Z.B; Z.S.know = 'malcek'; Z.S.run.ri = 0;
    const lem = w => Z.LEMMA.get(w) || w, R = Z.REGION_WORDS.ptuj, local = new Set([...R.chest.map(x => x[0]), ...(R.rocks || []), ...(R.theme || [])].map(lem));
    let back = 0, fwd = 0, region = 0, inflected = 0, n = 0, bad = 0;
    for (let i = 0; i < 120; i++) { Z.plantStarters();
      B.starters.forEach(s => { n++; if (s.back) back++; else fwd++; if (s.path.map(j => B.grid[j].ch).join('') !== s.w) bad++;
        if (local.has(lem(s.w))) { region++; if (lem(s.w) !== s.w) inflected++; } }); }
    return { n, back, fwd, region, inflected, bad }; });
  check(many.bad === 0 && many.back > 0 && many.fwd > many.back, 'words run left to right and, less often on Malček, right to left', JSON.stringify(many));
  check(many.region > many.n * 0.25 && many.region < many.n * 0.8 && many.inflected > 0, 'about half the words are words of the region, also in other forms (sklanjatve, spreganje)', JSON.stringify(many));

  // shuffling lets the words go; the starters stay only until then
  const sh = await page.evaluate(() => { const Z = window.__ZG, before = Z.B.grid.map(t => t.ch).join(''); Z.shuffleGrid(true); return before !== Z.B.grid.map(t => t.ch).join(''); });
  check(sh, 'Premešaj re-rolls the mesh, starter words included');

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
