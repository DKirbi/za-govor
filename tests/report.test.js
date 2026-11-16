// Pošlji besede: rejected words (manjka) and words found for the first time (pomen) are chips; the
// player picks words and sends them to the Google Form (captured here, nothing leaves the machine).
// No text fields. Kaj pomeni? on the battle result asks in one tap. Unsent reports wait in a queue.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Pošlji besede (missing words and Kaj pomeni?)');

const FORM = 'TESTFORM123';
run(async () => {
  const ctx = await openGame({ width: 1100, height: 900 });
  const { page, errors, shot } = ctx;
  const posts = [];
  await page.setRequestInterception(true);
  page.on('request', r => {
    if (r.url().includes('docs.google.com/forms/')) { posts.push({ url: r.url(), body: Object.fromEntries(new URLSearchParams(r.postData() || '')) }); r.respond({ status: 200, body: '' }); }
    else r.continue();
  });
  const configure = id => page.evaluate((id) => { const F = window.__ZG.REPORT_FORM; F.id = id; Object.assign(F.entry, { word: '11', where: '22', note: '33', meta: '44' }); }, id);
  await page.evaluate(() => { ['zg-rejected', 'zg-reports', 'zg-found', 'zg-seen'].forEach(k => localStorage.removeItem(k)); });
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await page.evaluate(() => { window.__ZG.S.tutOn = false; }); await sleep(300);
  await configure(FORM);

  // 0. the reported word itself, and base forms that only an inflected form used to stand for
  const dict = await page.evaluate(() => ['jasa', 'jase', 'jaso', 'jasah', 'vabiti', 'copata', 'konzerva'].filter(w => !window.__ZG.WORDS.has(w)));
  check(dict.length === 0, 'jasa in every form, and base forms like vabiti, copata, konzerva, are accepted', dict.join(', '));

  // 1. a word the mesh turns down is remembered, and the first rejection says where to send it
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[0])); await sleep(300);
  const bad = await page.evaluate(() => {
    const Z = window.__ZG, B = Z.B, n = B.grid.length, cols = 6, adj = (a, b) => a !== b && Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) <= 1 && Math.abs(a % cols - b % cols) <= 1;
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (adj(a, b)) for (let c = 0; c < n; c++) if (c !== a && adj(b, c)) {
      const w = [a, b, c].map(i => B.grid[i].ch).join(''); if (!Z.WORDS.has(w)) { B.path = [a, b, c]; B.typed = w; return w; } }
    return null;
  });
  await page.keyboard.press('Enter'); await sleep(150);
  const rej = await page.evaluate(() => ({ first: window.__ZG.REJECTED[0], fb: document.querySelector('.fb').textContent }));
  check(rej.first && rej.first.w === bad && rej.first.where === 'mreza' && /Pošlji jo v premoru/.test(rej.fb), 'a word the mesh turns down is remembered and the message says where to send it', JSON.stringify({ bad, ...rej }));

  // 2. a real word played for the first time is noted as new (no meaning yet); the second time it is not
  const found = await page.evaluate(() => { const Z = window.__ZG, w = [...Z.allWords().keys()].find(x => x.length >= 4 && !Z.SEEN.has(Z.LEMMA.get(x) || x));
    const first = Z.noteFound(w, 'mreza'), again = Z.noteFound(w, 'mreza'); return { w, first, again, listed: Z.FOUND[0] && Z.FOUND[0].w }; });
  check(found.first && !found.again && found.listed === found.w, 'a word found for the first time is noted as new; played again it is not', JSON.stringify(found));

  // 3. the pause screen offers Pošlji besede with a count; the panel has chips only, no text fields
  await page.keyboard.press('Escape'); await sleep(150);
  const btn = await page.evaluate(() => { const b = document.querySelector('.overlay.pause .rp-open'); return b ? b.textContent : null; });
  check(btn && /Pošlji besede\s*2/.test(btn), 'the pause screen has Pošlji besede with the number of words waiting', btn);
  await page.click('.overlay.pause .rp-open'); await sleep(150);
  const panel = await page.evaluate(() => ({ inputs: document.querySelectorAll('.report input').length, groups: [...document.querySelectorAll('.report .rl-h')].map(e => e.textContent),
    chips: [...document.querySelectorAll('.report .rejlist .prop')].map(c => c.textContent), send: document.querySelector('.report .rp-send .btn').disabled }));
  check(panel.inputs === 0 && panel.groups.length === 2 && panel.chips.length === 2 && panel.send, 'the panel has two groups of chips (zavrnjene, nove), no text fields, and Pošlji izbrane is off until a word is picked', JSON.stringify(panel));
  await shot('report-01-pause-panel');

  // 4. a tap picks a word, a second tap drops it; picking both and sending posts one row per word
  const chipOf = w => page.evaluate(w => [...document.querySelectorAll('.report .rejlist .prop')].findIndex(c => c.textContent.replace('✓ ', '').startsWith(w.toUpperCase())), w);
  const tapChip = async w => { const i = await chipOf(w); await page.evaluate(i => document.querySelectorAll('.report .rejlist .prop')[i].click(), i); await sleep(80); };
  await tapChip(bad); await tapChip(bad);
  check(await page.evaluate(() => document.querySelectorAll('.report .prop.on').length) === 0, 'a second tap drops a picked word');
  const t0 = await page.evaluate(() => window.__ZG.B.time);
  await tapChip(bad); await tapChip(found.w);
  check(await page.evaluate(() => /Pošlji izbrane \(2\)/.test(document.querySelector('.report .rp-send .btn').textContent)), 'Pošlji izbrane counts the picked words');
  await page.click('.report .rp-send .btn'); await sleep(500);
  const byWord = Object.fromEntries(posts.map(p => [p.body['entry.11'], p.body]));
  check(posts.length === 2 && posts.every(p => p.url.endsWith(`/forms/d/e/${FORM}/formResponse`)) && byWord[bad] && byWord[bad]['entry.33'] === 'manjka' && byWord[bad]['entry.22'] === 'mreža črk'
    && byWord[found.w] && byWord[found.w]['entry.33'] === 'pomen' && /Malček/.test(byWord[bad]['entry.44'] || ''),
    'one row per word goes to the form: the word, where, the kind (manjka / pomen) and the level', JSON.stringify(posts.map(p => p.body)));
  const after = await page.evaluate(() => ({ status: (document.querySelector('.report .fb') || {}).textContent, chips: document.querySelectorAll('.report .rejlist .prop').length, paused: window.__ZG.G.paused, t: window.__ZG.B.time }));
  check(/poslani v pregled/.test(after.status) && after.chips === 0 && after.paused && Math.abs(after.t - t0) < 0.05, 'sent words leave the lists, and the clock still stands', JSON.stringify(after));
  await shot('report-02-sent');

  // 5. back to the pause menu, Esc resumes
  await page.evaluate(() => [...document.querySelectorAll('.report .btn')].find(b => /Nazaj na premor/.test(b.textContent)).click()); await sleep(100);
  check(await page.evaluate(() => !!document.querySelector('.overlay.pause .pause-actions')), 'Nazaj na premor brings the pause menu back');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await page.evaluate(() => !window.__ZG.G.paused), 'Esc resumes the game');

  // 6. Kaj pomeni? on the result of a won battle: one tap asks, and the word is never offered again
  const nw = await page.evaluate(() => { const Z = window.__ZG, B = Z.B; B.enemies.forEach(e => { e.hp = 1; });
    const w = [...Z.allWords().keys()].find(x => x.length >= 4 && !Z.SEEN.has(Z.LEMMA.get(x) || x)); B.path = Z.findPath(w); B.typed = w; return w; });
  await page.keyboard.press('Enter'); await sleep(400);
  for (let i = 0; i < 4 && await page.evaluate(() => window.__ZG.B.enemies.some(e => e.hp > 0)); i++) {
    await page.evaluate(() => { const Z = window.__ZG, B = Z.B; B.target = B.enemies.findIndex(e => e.hp > 0); const w = [...Z.allWords().keys()].find(x => x.length >= 4); B.path = Z.findPath(w); B.typed = w; });
    await page.keyboard.press('Enter'); await sleep(400);
  }
  await sleep(1400);
  const res = await page.evaluate(w => ({ row: !!document.querySelector('.overlay .newwords'), ask: [...document.querySelectorAll('.overlay .mchip.ask')].map(b => b.textContent) }), nw);
  check(res.row && res.ask.some(t => t.startsWith(nw.toUpperCase()) && /Kaj pomeni\?/.test(t)), 'the result of a won battle lists the new word with Kaj pomeni?', JSON.stringify({ nw, ...res }));
  await shot('report-03-kaj-pomeni');
  const n0 = posts.length;
  await page.evaluate(w => [...document.querySelectorAll('.overlay .mchip.ask')].find(b => b.textContent.startsWith(w.toUpperCase())).click(), nw); await sleep(400);
  const asked = await page.evaluate(w => ({ chip: [...document.querySelectorAll('.overlay .mchip')].find(b => b.textContent.startsWith(w.toUpperCase())).className, toast: (document.querySelector('.toast') || {}).textContent || '' }), nw);
  check(posts.length === n0 + 1 && posts[n0].body['entry.11'] === nw && posts[n0].body['entry.33'] === 'pomen' && /asked/.test(asked.chip) && /Pomen dodamo/.test(asked.toast),
    'one tap on Kaj pomeni? sends the word as pomen, the chip turns to ✓ and says the meaning comes later', JSON.stringify({ post: posts[n0] && posts[n0].body, ...asked }));
  check(await page.evaluate(w => { const Z = window.__ZG; return Z.isAsked(w) && !Z.noteFound(w, 'mreza'); }, nw), 'an asked word is never offered again on this device');
  await page.keyboard.press('Enter'); await sleep(300);

  // 7. a meaning that ships with the game is shown instead of the question
  const shown = await page.evaluate(() => { const Z = window.__ZG; Z.MEANINGS.kovač = 'kdor kuje železo'; return { m: Z.meaningOf('kovača') }; });
  check(shown.m === 'kdor kuje železo', 'a meaning that ships with the game is found for every form of the word (kovača → kovač)', JSON.stringify(shown));

  // 8. the chest remembers its rejections too
  await page.evaluate(() => window.__ZG.go('chest', window.__ZG.NODES[1])); await sleep(300);
  const cbad = await page.evaluate(() => {
    const Z = window.__ZG, E = Z.S.ev, L = E.letters.map(l => l.ch);
    for (let a = 0; a < L.length; a++) for (let b = 0; b < L.length; b++) for (let c = 0; c < L.length; c++) if (a !== b && b !== c && a !== c) {
      const w = L[a] + L[b] + L[c]; if (!Z.WORDS.has(w) && w !== E.item.w) { E.sel = [a, b, c]; E.letters.forEach((l, i) => l.used = [a, b, c].includes(i)); return w; } }
    return null;
  });
  await page.keyboard.press('Enter'); await sleep(150);
  check(await page.evaluate(w => window.__ZG.REJECTED[0].w === w && window.__ZG.REJECTED[0].where === 'skrinja', cbad), 'a word the chest turns down is remembered', cbad);

  // 9. without a form, words wait in a queue and the list can be copied; once a form exists they go out
  await configure('');
  await page.evaluate(() => window.__ZG.go('about')); await sleep(200);
  const tbtn = await page.evaluate(() => { const b = document.querySelector('.about .rp-open'); return b ? b.textContent : null; });
  check(tbtn && /Pošlji besede/.test(tbtn), 'O igri has Pošlji besede', tbtn);
  await page.click('.about .rp-open'); await sleep(150);
  const ci = await chipOf(cbad); await page.evaluate(i => document.querySelectorAll('.report .rejlist .prop')[i].click(), ci); await sleep(80);
  await page.click('.report .rp-send .btn'); await sleep(300);
  const n1 = posts.length;
  const queued = await page.evaluate(() => ({ status: document.querySelector('.report .fb').textContent, copy: [...document.querySelectorAll('.report .btn')].some(b => /Kopiraj seznam/.test(b.textContent)),
    unsent: window.__ZG.REPORTS.filter(r => !r.sent).length }));
  check(/ni nastavljeno/.test(queued.status) && queued.copy && queued.unsent === 1, 'with no form set up the word waits on the device and the list can be copied', JSON.stringify(queued));
  await page.keyboard.press('Escape'); await sleep(100);
  const closed = await page.evaluate(() => ({ gone: !document.querySelector('.report'), screen: window.__ZG.S.screen, focus: document.activeElement && document.activeElement.classList.contains('rp-open') }));
  check(closed.gone && closed.screen === 'about' && closed.focus, 'Esc closes the window and stays on O igri, back on its button', JSON.stringify(closed));
  await configure(FORM);
  await page.evaluate(() => window.__ZG.flushReports()); await sleep(300);
  check(posts.length === n1 + 1 && posts[n1].body['entry.11'] === cbad && posts[n1].body['entry.22'] === 'skrinja' && posts[n1].body['entry.33'] === 'manjka' && await page.evaluate(() => window.__ZG.REPORTS.every(r => r.sent)),
    'queued words go out once the form is set up', JSON.stringify(posts[n1] && posts[n1].body));

  // 10. the lists survive a reload
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(300);
  const kept = await page.evaluate(() => ({ rej: window.__ZG.REJECTED.length, rep: window.__ZG.REPORTS.length, seen: window.__ZG.SEEN.size }));
  check(kept.rej >= 2 && kept.rep === 4 && kept.seen >= 2, 'rejected, sent and seen words survive a reload', JSON.stringify(kept));

  // 11. on a phone the panel fits and chips are thumb-size
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await page.evaluate(() => window.__ZG.setLayout(true)); await sleep(250);
  await page.evaluate(() => { const Z = window.__ZG; Z.noteRejected('jasja', 'mreza'); Z.go('about'); }); await sleep(150);
  await page.evaluate(() => document.querySelector('.about .rp-open').click()); await sleep(200);
  const ph = await page.evaluate(() => { const d = document.querySelector('.reportdlg').getBoundingClientRect(), c = document.querySelector('.report .rejlist .prop').getBoundingClientRect(), s = document.querySelector('.report .rp-send .btn').getBoundingClientRect();
    return { right: Math.round(d.right), vw: innerWidth, wide: document.documentElement.scrollWidth, chipH: Math.round(c.height), sendH: Math.round(s.height) }; });
  check(ph.right <= ph.vw && ph.wide <= ph.vw && ph.chipH >= 40 && ph.sendH >= 40, 'on a 360 px phone the panel fits, chips and Pošlji izbrane are at least 40 px tall', JSON.stringify(ph));
  await shot('report-04-phone');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
