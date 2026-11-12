// Prijavi besedo: rejected words are remembered, the pause screen and the start screen list them,
// one tap reports a word to the Google Form (captured here, nothing leaves the machine), typing
// in the panel works while paused, unsent reports wait in a queue, and the list survives a reload.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Prijavi besedo (report a missing word)');

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
  await page.evaluate(() => { localStorage.removeItem('zg-rejected'); localStorage.removeItem('zg-reports'); });
  await configure(FORM);

  // 0. the reported word itself, and base forms that only an inflected form used to stand for
  const dict = await page.evaluate(() => ['jasa', 'jase', 'jaso', 'jasah', 'vabiti', 'copata', 'konzerva'].filter(w => !window.__ZG.WORDS.has(w)));
  check(dict.length === 0, 'jasa in every form, and base forms like vabiti, copata, konzerva, are accepted', dict.join(', '));

  // 1. a word the mesh turns down is remembered, and the first rejection says where to report it
  await page.evaluate(() => window.__ZG.go('battle', window.__ZG.NODES[0])); await sleep(300);
  const bad = await page.evaluate(() => {
    const Z = window.__ZG, B = Z.B, n = B.grid.length, cols = 6, adj = (a, b) => a !== b && Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) <= 1 && Math.abs(a % cols - b % cols) <= 1;
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (adj(a, b)) for (let c = 0; c < n; c++) if (c !== a && adj(b, c)) {
      const w = [a, b, c].map(i => B.grid[i].ch).join(''); if (!Z.WORDS.has(w)) { B.path = [a, b, c]; B.typed = w; return w; } }
    return null;
  });
  await page.keyboard.press('Enter'); await sleep(150);
  const rej = await page.evaluate(() => ({ first: window.__ZG.REJECTED[0], fb: document.querySelector('.fb').textContent }));
  check(rej.first && rej.first.w === bad && rej.first.where === 'mreza' && /Prijavi jo v premoru/.test(rej.fb), 'a word the mesh turns down is remembered and the message says where to report it', JSON.stringify({ bad, ...rej }));

  // 2. the pause screen offers Prijavi besedo with a count; the panel lists the word
  await page.keyboard.press('Escape'); await sleep(150);
  const btn = await page.evaluate(() => { const b = document.querySelector('.overlay.pause .rp-open'); return b ? b.textContent : null; });
  check(btn && /Prijavi besedo\s*1/.test(btn), 'the pause screen has Prijavi besedo with the number of words to report', btn);
  await page.click('.overlay.pause .rp-open'); await sleep(150);
  const chip = await page.evaluate(w => [...document.querySelectorAll('.report .rejlist .prop')].some(c => c.textContent.startsWith(w.toUpperCase())), bad);
  check(chip, 'the panel lists the rejected word');
  await shot('report-01-pause-panel');

  // 3. typing a note works while paused (keys are not swallowed and do not resume), then one tap reports
  const t0 = await page.evaluate(() => window.__ZG.B.time);
  await page.click('.report .rp-note'); await page.keyboard.type('preizkus opombe'); await sleep(50);
  const typed = await page.evaluate(() => ({ note: document.querySelector('.report .rp-note').value, paused: window.__ZG.G.paused }));
  check(typed.note === 'preizkus opombe' && typed.paused, 'the note field types normally and the game stays paused', JSON.stringify(typed));
  await page.evaluate(w => [...document.querySelectorAll('.report .rejlist .prop')].find(c => c.textContent.startsWith(w.toUpperCase())).click(), bad); await sleep(400);
  const p1 = posts[0] && posts[0].body;
  check(posts.length === 1 && posts[0].url.endsWith(`/forms/d/e/${FORM}/formResponse`) && p1['entry.11'] === bad && p1['entry.22'] === 'mreža črk' && p1['entry.33'] === 'preizkus opombe' && /Malček/.test(p1['entry.44'] || ''),
    'one tap sends word, place, note and level to the Google Form', JSON.stringify(posts[0]));
  const after = await page.evaluate(() => ({ status: (document.querySelector('.report .fb') || {}).textContent, done: !!document.querySelector('.report .prop.done'), paused: window.__ZG.G.paused, t: window.__ZG.B.time }));
  check(/poslana v pregled/.test(after.status) && after.done && after.paused && Math.abs(after.t - t0) < 0.05, 'the word is marked as reported, and the clock still stands', JSON.stringify(after));
  await shot('report-02-sent');

  // 4. a typed word, sent with Enter, does not resume the game; a word the game knows is not sent
  await page.click('.report .rp-word'); await page.keyboard.type('pehtrančnica'); await page.keyboard.press('Enter'); await sleep(400);
  check(posts.length === 2 && posts[1].body['entry.11'] === 'pehtrančnica' && posts[1].body['entry.22'] === 'vpisana' && await page.evaluate(() => window.__ZG.G.paused),
    'a typed word goes out with Enter and the game stays paused', JSON.stringify(posts[1] && posts[1].body));
  await page.click('.report .rp-word'); await page.keyboard.type('volk'); await page.keyboard.press('Enter'); await sleep(300);
  check(posts.length === 2 && /že v slovarju/.test(await page.evaluate(() => document.querySelector('.report .fb').textContent)), 'a word the game already knows is not sent');

  // 5. back to the pause menu, Esc resumes
  await page.evaluate(() => [...document.querySelectorAll('.report .btn')].find(b => /Nazaj na premor/.test(b.textContent)).click()); await sleep(100);
  check(await page.evaluate(() => !!document.querySelector('.overlay.pause .pause-actions')), 'Nazaj na premor brings the pause menu back');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await page.evaluate(() => !window.__ZG.G.paused), 'Esc resumes the game');

  // 6. the chest remembers its rejections too
  await page.evaluate(() => window.__ZG.go('chest', window.__ZG.NODES[1])); await sleep(300);
  const cbad = await page.evaluate(() => {
    const Z = window.__ZG, E = Z.S.ev, L = E.letters.map(l => l.ch);
    for (let a = 0; a < L.length; a++) for (let b = 0; b < L.length; b++) for (let c = 0; c < L.length; c++) if (a !== b && b !== c && a !== c) {
      const w = L[a] + L[b] + L[c]; if (!Z.WORDS.has(w) && w !== E.item.w) { E.sel = [a, b, c]; E.letters.forEach((l, i) => l.used = [a, b, c].includes(i)); return w; } }
    return null;
  });
  await page.keyboard.press('Enter'); await sleep(150);
  check(await page.evaluate(w => window.__ZG.REJECTED[0].w === w && window.__ZG.REJECTED[0].where === 'skrinja', cbad), 'a word the chest turns down is remembered', cbad);

  // 7. without a form, reports wait in a queue and the list can be copied; once a form exists they go out
  await configure('');
  await page.evaluate(() => window.__ZG.go('title')); await sleep(200);
  const tbtn = await page.evaluate(() => { const b = document.querySelector('.title-links .rp-open'); return b ? b.textContent : null; });
  check(tbtn && /Prijavi manjkajočo besedo/.test(tbtn), 'the start screen has Prijavi manjkajočo besedo', tbtn);
  await page.click('.title-links .rp-open'); await sleep(150);
  await page.evaluate(w => [...document.querySelectorAll('.report .rejlist .prop')].find(c => c.textContent.startsWith(w.toUpperCase())).click(), cbad); await sleep(300);
  const queued = await page.evaluate(() => ({ status: document.querySelector('.report .fb').textContent, copy: [...document.querySelectorAll('.report .btn')].some(b => /Kopiraj seznam/.test(b.textContent)),
    unsent: window.__ZG.REPORTS.filter(r => !r.sent).length }));
  check(posts.length === 2 && /ni nastavljeno/.test(queued.status) && queued.copy && queued.unsent === 1, 'with no form set up the report waits on the device and the list can be copied', JSON.stringify(queued));
  await shot('report-03-title-queued');
  await page.keyboard.press('Escape'); await sleep(100);
  check(await page.evaluate(() => !document.querySelector('.report')), 'Esc closes the window on the start screen');
  await configure(FORM);
  await page.evaluate(() => window.__ZG.flushReports()); await sleep(300);
  check(posts.length === 3 && posts[2].body['entry.11'] === cbad && posts[2].body['entry.22'] === 'skrinja' && await page.evaluate(() => window.__ZG.REPORTS.every(r => r.sent)), 'queued reports go out once the form is set up', JSON.stringify(posts[2] && posts[2].body));

  // 8. both lists survive a reload
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(300);
  const kept = await page.evaluate(() => ({ rej: window.__ZG.REJECTED.length, rep: window.__ZG.REPORTS.length }));
  check(kept.rej >= 2 && kept.rep === 3, 'rejected and reported words survive a reload', JSON.stringify(kept));

  // 9. on a phone the panel fits, with thumb-size fields and chips
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluate(() => { localStorage.setItem('zg-mobile', '1'); }); await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(300);
  await page.evaluate(() => { const Z = window.__ZG; Z.noteRejected('jasja', 'mreza'); Z.go('title'); }); await sleep(150);
  await page.evaluate(() => document.querySelector('.title-links .rp-open').click()); await sleep(200);
  const ph = await page.evaluate(() => { const d = document.querySelector('.reportdlg').getBoundingClientRect(), i = document.querySelector('.report .rp-word').getBoundingClientRect(), c = document.querySelector('.report .rejlist .prop').getBoundingClientRect();
    return { right: Math.round(d.right), vw: innerWidth, wide: document.documentElement.scrollWidth, inputH: Math.round(i.height), chipH: Math.round(c.height) }; });
  check(ph.right <= ph.vw && ph.wide <= ph.vw && ph.inputH >= 44 && ph.chipH >= 40, 'on a 360 px phone the panel fits, fields are 44 px and chips 40 px tall', JSON.stringify(ph));
  await shot('report-04-phone');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
