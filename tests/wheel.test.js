// Kolo črk (src/wheel.js; Game Director, 27 Nov 2026): the zagovor's crossword on a letter wheel, Wordscapes style.
// The grid shows progress, there are no clues, words are dragged over the wheel's letters. Fewer words on the wheel
// make it harder: Malček gets the richest of several wheels, Knjižni molj the poorest that still fills the grid.
// PROPOSED defaults: the wheel on a phone, the typed crossword on a computer; Nastavitve switches it.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Kolo črk: the zagovor on a letter wheel');

run(async () => {
  // ---------------------------------------------------------------- the generator
  const desk = await openGame({});
  const gen = await desk.page.evaluate(() => {
    const Z = window.__ZG, out = { bad: [], avail: {}, keys: 0, n: 0 };
    const fits = (w, letters) => { const left = [...letters]; return [...w].every(ch => { const i = left.indexOf(ch); if (i < 0) return false; left.splice(i, 1); return true; }); };
    for (const know of ['malcek', 'ucenjak', 'molj']) {
      Z.S.know = know; out.avail[know] = [];
      for (const id of ['perun', 'kres', 'mokos', 'triglav']) for (let t = 0; t < 4; t++) {
        const D = Z.makeWheel(id), L = Z.WHEEL_LV[know]; out.n++;
        if (!D) { out.bad.push(`${know} ${id}: none`); continue; }
        out.avail[know].push(D.words);
        if (D.letters.length !== L.letters) out.bad.push(`${know} ${id}: ${D.letters.length} letters`);
        if (D.entries.length < L.count) out.bad.push(`${know} ${id}: ${D.entries.length} words`);
        D.entries.forEach(e => { const w = e.answer.toLowerCase(); if (!fits(w, D.letters)) out.bad.push(`${know} ${id}: ${w} not from ${D.letters.join('')}`);
          if (!e.main && Z.LEMMA.get(w) !== w) out.bad.push(`${know} ${id}: ${w} is not a base form`); });
        if (D.key && D.entries.some(e => e.main && e.answer.toLowerCase() === D.key)) out.keys++;
        if (D.rows > 8 || D.cols > 8) out.bad.push(`${know} ${id}: ${D.rows}x${D.cols}`);
      }
    }
    const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
    out.mean = Object.fromEntries(Object.entries(out.avail).map(([k, a]) => [k, +mean(a).toFixed(1)]));
    return out;
  });
  check(!gen.bad.length, 'every zagovor makes a wheel on every Znanje: 7 letters, every grid word spelled from them (base forms), at most 8 × 8', gen.bad.slice(0, 6).join('; ') || `${gen.n} wheels`);
  check(gen.keys >= gen.n * 0.9, 'the zagovor\'s key word (PERUN, KRESNIK, MOKOŠ …) is in its grid', `${gen.keys} of ${gen.n}`);
  check(gen.mean.malcek > gen.mean.ucenjak && gen.mean.ucenjak > gen.mean.molj, 'fewer words on the wheel make it harder: Malček\'s wheels allow the most words, Učenjak\'s fewer, Knjižni molj\'s the fewest', JSON.stringify(gen.mean));
  const dflt = await desk.page.evaluate(() => { const Z = window.__ZG; Z.S.tutOn = false; Z.S.mode = 'calm'; Z.S.know = 'malcek'; Z.go('battle', Z.NODES[2]); return null; });
  await sleep(500);
  const deskStyle = await desk.page.evaluate(() => { const Z = window.__ZG; Z.B.meter = 30; Z.openCrossword('finisher', 'perun'); const s = Z.B.cw.D.style; return s; });
  check(deskStyle !== 'wheel', 'on a computer the zagovor stays the typed crossword unless Nastavitve says otherwise', deskStyle);
  if (desk.errors.length) check(false, 'no page errors (computer)', desk.errors.join(' | '));

  // ---------------------------------------------------------------- on a phone
  const ctx = await openGame({ phone: true });
  const { page, errors } = ctx;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const open = async (know = 'malcek') => {
    await ev(know => { const Z = window.__ZG; Z.S.tutOn = false; Z.S.mode = 'calm'; Z.S.know = know; Z.newRun('krpan'); Z.joinHero('kurent'); Z.joinHero('matjaz');
      Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'battle' && !s.done)); Z.B.enemies.forEach(e => { e.charge = -99; e.hp = e.maxHp = 900; }); Z.B.meter = 30; }, know);
    await sleep(300);
    await page.keyboard.press(' '); await sleep(400);
  };
  await open();
  const st = await ev(() => { const C = window.__ZG.B.cw;
    return C && { style: C.D.style, wheel: !!document.querySelector('.wheel'), letters: document.querySelectorAll('.wheel .wl').length, kb: !!document.querySelector('.side .vkbd'),
      clues: !!document.querySelector('.clues'), words: C.D.entries.map(e => e.answer.toLowerCase()), letterSet: C.D.letters,
      given: C.D.entries.map(e => [...e.answer].filter((_, p) => !C.given.has(window.__ZG.B && (e.row + (e.dir === 'D' ? p : 0)) + ',' + (e.col + (e.dir === 'A' ? p : 0)))).length) }; });
  check(st && st.style === 'wheel' && st.wheel && st.letters === 7 && !st.kb && !st.clues, 'on a phone the zagovor opens on a wheel of letters: no clues, no keyboard', JSON.stringify(st && { style: st.style, letters: st.letters, kb: st.kb }));
  check(st && st.given.every(n => n >= 2), 'Malček shows some letters in the grid, but every word keeps at least two to find', JSON.stringify(st && st.given));
  const wheelBox = await ev(() => { const r = document.querySelector('.wheel').getBoundingClientRect(); return { w: Math.round(r.width), inView: r.left >= 0 && r.right <= innerWidth }; });
  check(wheelBox.w >= 220 && wheelBox.inView, 'the wheel is big enough for a thumb and fits the screen', JSON.stringify(wheelBox));

  // drag a grid word (not the key word, which could end it) over the wheel with a finger
  const drag = async word => {
    const pts = await ev(word => { const C = window.__ZG.B.cw, r = C.wheel.getBoundingClientRect(), used = [];
      return [...word].map(ch => { const i = C.D.letters.findIndex((x, j) => x === ch && !used.includes(j)); used.push(i); const p = C.pos[i]; return [r.left + r.width * p[0] / 100, r.top + r.height * p[1] / 100]; }); }, word);
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) { await page.touchscreen.touchMove((p[0] + pts[0][0]) / 2 + 3, (p[1] + pts[0][1]) / 2 + 3); await page.touchscreen.touchMove(p[0], p[1]); await sleep(30); }
    await page.touchscreen.touchEnd(); await sleep(250);
  };
  const target = await ev(() => { const C = window.__ZG.B.cw; return C.D.entries.find(e => !e.main).answer.toLowerCase(); });
  const hp0 = await ev(() => window.__ZG.B.enemies.reduce((s, e) => s + e.hp, 0));
  await drag(target);
  const s1 = await ev(() => { const Z = window.__ZG, C = Z.B.cw; return { solved: C.solved.size, hp: Z.B.enemies.reduce((s, e) => s + e.hp, 0), green: document.querySelectorAll('.wgrid .cell.ok').length }; });
  check(s1.solved === 1 && s1.hp < hp0 && s1.green === [...target].length, 'dragging a word of the grid fills it in green and fires an attack', JSON.stringify({ target, ...s1, hp0 }));
  await drag(target);
  const s2 = await ev(() => ({ solved: window.__ZG.B.cw.solved.size, said: window.__ZG.B.cw.wordEl.textContent }));
  check(s2.solved === 1 && /že najdena/.test(s2.said), 'the same word again does nothing', JSON.stringify(s2));
  // an extra word: a real word from the wheel that is not in the grid hits once, weakly
  const extra = await ev(() => { const Z = window.__ZG, C = Z.B.cw, grid = new Set(C.D.entries.map(e => e.answer.toLowerCase()));
    return [...C.D.avail].find(w => !grid.has(w) && [...w].length >= 3) || null; });
  if (extra) {
    const e0 = await ev(() => window.__ZG.B.enemies.reduce((s, e) => s + e.hp, 0));
    await drag(extra);
    const e1 = await ev(() => ({ hp: window.__ZG.B.enemies.reduce((s, e) => s + e.hp, 0), extra: window.__ZG.B.cw.extra.size, solved: window.__ZG.B.cw.solved.size }));
    check(e1.extra === 1 && e1.hp < e0 && e0 - e1.hp <= 12 && e1.solved === 1, 'a real word from the wheel that is not in the grid is an extra word: a weak hit', JSON.stringify({ extra, e0, ...e1 }));
  }
  // a string that is no word does nothing
  const junk = await ev(() => { const L = window.__ZG.B.cw.D.letters; for (let a = 0; a < L.length; a++) for (let b = 0; b < L.length; b++) for (let c = 0; c < L.length; c++) {
    if (a === b || b === c || a === c) continue; const w = L[a] + L[b] + L[c]; if (!window.__ZG.WORDS.has(w)) return w; } return null; });
  const j0 = await ev(() => window.__ZG.B.enemies.reduce((s, e) => s + e.hp, 0));
  await drag(junk);
  const j1 = await ev(() => ({ hp: window.__ZG.B.enemies.reduce((s, e) => s + e.hp, 0), said: window.__ZG.B.cw.wordEl.textContent }));
  check(j1.hp === j0 && /ni v križanki/.test(j1.said), 'letters that make no word do nothing', JSON.stringify({ junk, ...j1 }));
  // tapping the letters one by one, then the last again, sends too
  const tapWord = await ev(() => { const C = window.__ZG.B.cw; const e = C.D.entries.find((e, k) => !C.solved.has(k) && !e.main); return e ? e.answer.toLowerCase() : null; });
  const taps = await ev(word => { const C = window.__ZG.B.cw, r = C.wheel.getBoundingClientRect(), used = [];
    return [...word].map(ch => { const i = C.D.letters.findIndex((x, j) => x === ch && !used.includes(j)); used.push(i); const p = C.pos[i]; return [r.left + r.width * p[0] / 100, r.top + r.height * p[1] / 100]; }); }, tapWord);
  for (const p of [...taps, taps[taps.length - 1]]) { await page.touchscreen.tap(p[0], p[1]); await sleep(60); }
  await sleep(200);
  const t1 = await ev(word => window.__ZG.B.cw.D.entries.some((e, k) => window.__ZG.B.cw.solved.has(k) && e.answer.toLowerCase() === word), tapWord);
  check(t1, 'tapping the letters one by one and the last one again sends the word', tapWord);
  // shuffle keeps the letters
  const sh = await ev(() => { const C = window.__ZG.B.cw, a = [...C.D.letters].sort().join(''); document.querySelector('.wheel .wshuffle').click(); return a === [...C.D.letters].sort().join(''); });
  check(sh, '⟳ shuffles the wheel and keeps its letters');
  // every word found: the zagovor itself
  const done = await ev(() => { const Z = window.__ZG, C = Z.B.cw;
    C.D.entries.forEach((e, k) => { if (Z.B.cw !== C || C.solved.has(k)) return; C.sel = []; const used = [];
      [...e.answer.toLowerCase()].forEach(ch => { const i = C.D.letters.findIndex((x, j) => x === ch && !used.includes(j)); used.push(i); C.sel.push(i); }); Z.wheelSubmit(); });
    return { open: !!Z.B.cw, meter: Z.B.meter }; });
  await sleep(300);
  check(!done.open && done.meter === 0, 'the last word speaks the zagovor: the wheel closes and the meter is spent', JSON.stringify(done));

  // keys on a computer with the wheel switched on in Nastavitve
  await ev(() => window.__ZG.setWheelPref('kolo'));
  const kd = await desk.page.evaluate(() => { const Z = window.__ZG; Z.setWheelPref('kolo'); Z.B.cw = null; Z.B.meter = 30; Z.openCrossword('finisher', 'kres'); Z.closeTut();
    const C = Z.B.cw; return { style: C.D.style, word: C.D.entries.find(e => !e.main).answer.toLowerCase() }; });
  for (const ch of kd.word) await desk.page.keyboard.type(ch);
  await desk.page.keyboard.press('Enter'); await sleep(200);
  const k1 = await desk.page.evaluate(() => window.__ZG.B.cw && window.__ZG.B.cw.solved.size);
  check(kd.style === 'wheel' && k1 === 1, 'Nastavitve → Kolo črk on a computer: letters typed on the keyboard and Enter send a word', JSON.stringify({ ...kd, k1 }));

  // Nastavitve lists the choice
  await ev(() => { window.__ZG.go('settings'); }); await sleep(300);
  const set = await ev(() => [...document.querySelectorAll('.set-kolo')].map(i => `${i.value}:${i.checked}`));
  check(set.join() === 'kolo:true,klasika:false', 'Nastavitve: Križanka zagovora, Kolo črk or Klasična križanka', set.join());

  check(errors.length === 0 && desk.errors.length === 0, 'no page or console errors', errors.concat(desk.errors).join(' | '));
});
