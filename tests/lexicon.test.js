// The word list in the browser: Sloleks coverage, headwords Sloleks lacks (Franček, the
// thesaurus), the two tiers (accepted / suggested), base forms, the never-suggest and deny
// lists, start-up time, and speed on a throttled CPU.
const fs = require('fs');
const path = require('path');
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Word list (Sloleks 3.1 lexicon)');
const COV = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'coverage-words.json'), 'utf8'));

run(async () => {
  const ctx = await openGame({ width: 1100, height: 900 });
  const { page, errors } = ctx;

  const info = await page.evaluate(() => ({ size: window.__ZG.LEX.size, sugg: window.__ZG.LEX.suggestedSize, loadMs: Math.round(window.__ZG.LEX.loadMs) }));
  check(info.size > 1400000 && info.sugg > 150000 && info.sugg < info.size, 'about 1.5 million forms accepted, a common part suggested', JSON.stringify(info));
  check(info.loadMs < 150, 'the packed list is ready in under 150 ms at start-up', info.loadMs + ' ms');

  // the hand-picked coverage set from the 11 Nov exploration (old list: 104 of 217)
  const valid = Object.values(COV.valid).flatMap(s => s.split(/\s+/)).filter(Boolean);
  const cov = await page.evaluate((v, bad) => ({ miss: v.filter(w => !window.__ZG.WORDS.has(w)), junk: bad.filter(w => window.__ZG.WORDS.has(w)) }), valid, COV.invalid.split(/\s+/));
  check(cov.miss.length === 0, `all ${valid.length} words of the coverage set are accepted`, cov.miss.join(' '));
  check(cov.junk.length === 0, 'no non-word of the coverage set is accepted (Croatian, English, made up)', cov.junk.join(' '));

  // words players reported, and the forms the old prefix block list ate
  const rep = await page.evaluate(() => ['jasa', 'jas', 'loj', 'lojem', 'runa', 'runo', 'seks', 'ritem', 'ritma', 'ritual', 'riti', 'rijem'].filter(w => !window.__ZG.WORDS.has(w)));
  check(rep.length === 0, 'reported words (jasa, loj, runa, seks) and ritem, ritual, riti are accepted', rep.join(' '));

  const t = await page.evaluate(() => {
    const L = window.__ZG.LEX, s = w => [w, L.has(w), L.suggested(w)];
    return { vulgar: ['rit', 'pizda', 'sranje', 'drek'].map(s), clean: ['riti', 'ritem', 'volk', 'hiša', 'jasa'].map(s),
      myth: ['perun', 'mokoš', 'lintvern', 'svarog', 'kurent'].map(s), deny: ['djevojka', 'nešto', 'daska'].map(s), nonstd: s('gdo') };
  });
  check(t.vulgar.every(([, a, sg]) => a && !sg), 'vulgar words are accepted but never suggested', JSON.stringify(t.vulgar));
  check(t.clean.every(([, a, sg]) => a && sg), 'riti, ritem and everyday words are suggested (exact match, no prefix block)', JSON.stringify(t.clean));
  check(t.myth.every(([, a, sg]) => a && sg), 'mythology names (perun, mokoš, lintvern…) are accepted and suggested', JSON.stringify(t.myth));
  check(t.deny.every(([, a]) => !a), 'foreign words from data/deny.json are not accepted', JSON.stringify(t.deny));
  check(t.nonstd[1] && !t.nonstd[2], 'a non-standard spoken form (gdo) is accepted but not suggested', JSON.stringify(t.nonstd));

  // headwords Sloleks lacks: from Franček and the thesaurus, inflected by analogy; accepted, never suggested
  const extra = await page.evaluate(() => {
    const L = window.__ZG.LEX;
    return ['zborišče', 'zborišča', 'zboriščem', 'kombajnarja', 'kolarno', 'krastavci', 'razvedujem', 'nezdramna', 'volkodlakinjo',
      'prmejduš', 'ohromiti', 'sedemkotnik', 'sedemkotnika', 'oceanologijo'].map(w => [w, L.has(w), L.suggested(w), L.lemma(w)]);
  });
  check(extra.every(([, a, sg]) => a && !sg), 'dictionary headwords Sloleks lacks are accepted with their forms, never suggested (zborišča, kombajnarja, sedemkotnik…)', JSON.stringify(extra.filter(([, a, sg]) => !a || sg)));
  check(extra.find(e => e[0] === 'zboriščem')[3] === 'zborišče' && extra.find(e => e[0] === 'razvedujem')[3] === 'razvedovati', 'their forms know their base form (zboriščem → zborišče, razvedujem → razvedovati)');
  const foreign = await page.evaluate(() => ['house', 'jeep', 'girl', 'shopping', 'juice', 'the', 'people'].filter(w => window.__ZG.WORDS.has(w)));
  check(foreign.length === 0, 'English citation forms in the dictionaries (house, jeep, juice…) are not accepted', foreign.join(' '));
  const homographs = await page.evaluate(() => ['gem', 'drum', 'turn', 'omen', 'zoo'].filter(w => !window.__ZG.WORDS.has(w)));
  check(homographs.length === 0, 'Slovene words spelled like English ones (gem, drum, turn, omen, zoo) are accepted', homographs.join(' '));

  const lem = await page.evaluate(() => Object.fromEntries(['volkom', 'hišama', 'ljudje', 'jas', 'navodil', 'bomo', 'pletem', 'nepozabljenim', 'kozolčki', 'xyz'].map(w => [w, window.__ZG.LEMMA.get(w)])));
  const want = { volkom: 'volk', hišama: 'hiša', ljudje: 'človek', jas: 'jasa', navodil: 'navodilo', bomo: 'biti', pletem: 'plesti', nepozabljenim: 'nepozabljen', kozolčki: 'kozolček', xyz: null };
  check(Object.entries(want).every(([w, l]) => lem[w] === l), 'every form knows its base form (volkom → volk, ljudje → človek, bomo → biti)', JSON.stringify(lem));

  const long = await page.evaluate(() => ['nepozabljenim', 'prepovedanega', 'najlepšimi', 'veselje'].map(w => window.__ZG.WORDS.has(w)));
  check(long.every(Boolean), 'long words up to 15 letters are accepted', JSON.stringify(long));
  const short = await page.evaluate(() => window.__ZG.LEX.suggestedWords(3, 3));
  check(short.length > 200 && ['dan', 'dom', 'kri', 'oko', 'čaj'].every(w => short.includes(w)) && !short.includes('rit'), 'three-letter suggestions are everyday words', short.length + ' words');

  // a battle on a phone-speed CPU: the mesh walks stay fast and only offer suggested words
  const cdp = await page.target().createCDPSession(); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => { const Z = window.__ZG; Z.resetRun(); Z.go('battle', Z.NODES[0]); }); await sleep(500);
  const perf = await page.evaluate(() => {
    const Z = window.__ZG, t0 = performance.now(); let words;
    for (let k = 0; k < 10; k++) words = Z.allWords();
    const ms = (performance.now() - t0) / 10, list = [...words.keys()];
    const t1 = performance.now(); for (let k = 0; k < 10000; k++) Z.WORDS.has('nepozabljenim');
    return { ms: Math.round(ms * 10) / 10, n: list.length, allSuggested: list.every(w => Z.LEX.suggested(w)), lookupUs: Math.round((performance.now() - t1) * 100) / 1000 };
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  check(perf.n > 0 && perf.allSuggested, 'the mesh offers only suggested words', `${perf.n} words`);
  check(perf.ms < 50 && perf.lookupUs < 20, 'at 4× slower CPU a mesh walk takes under 50 ms and a lookup under 20 µs', JSON.stringify(perf));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
