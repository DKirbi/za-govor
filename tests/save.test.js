// Saving the journey (src/save.js): checkpoints by Znanje, Nadaljuj pot after closing the page,
// Izhod on the road and in the pause window, and what removes a save.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Saving the journey (checkpoints, Nadaljuj pot, Izhod)');

// start a journey with Krpan in test mode at this Znanje
const start = (page, know) => page.evaluate(k => { const Z = window.__ZG; Z.clearSave(); Z.S.know = k; Z.S.testMode = true; Z.newRun('krpan'); Z.go('travel'); }, know);
// skip stops (test mode) until the next stop is the last battle of region ri
const toLastBattle = (page, ri) => page.evaluate(ri => { const Z = window.__ZG;
  for (let i = 0; i < 80; i++) {
    const R = Z.S.run, n = R.stops.find(s => !s.passed);
    const last = n && n.enemies && !R.stops.some(s => s !== n && s.enemies && !s.passed);
    if (R.ri === ri && last) return true;
    Z.travelAct('skip');
  }
  return false; }, ri);
async function winBattle(page) {
  await page.evaluate(() => window.__ZG.B.enemies.forEach(e => { e.hp = 1; }));
  for (let i = 0; i < 8; i++) {
    const s = await page.evaluate(() => { const Z = window.__ZG, B = Z.B; if (!B || B.over || Z.S.screen !== 'battle') return 'done';
      const t = B.enemies.findIndex(e => e.hp > 0); if (t < 0) return 'done'; B.target = t;
      const w = [...Z.allWords().keys()].find(w => w.length >= 4); const p = w && Z.findPath(w); if (!p) return 'none'; B.path = p; B.typed = w; return w; });
    if (s === 'done') break;
    await page.keyboard.press('Enter'); await sleep(450);
  }
  await sleep(1900);
}
// walk to the next stop (its prompt appears), then take its first choice (V boj)
async function arrive(page) {
  if (!(await page.evaluate(() => !!window.__ZG.S.run.prompt))) await page.evaluate(() => window.__ZG.travelAct('go'));
  for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!window.__ZG.S.run.prompt)) break; await sleep(150); }
  await page.evaluate(() => window.__ZG.travelAct('go')); await sleep(600);
}
const fight = async page => { await arrive(page); await winBattle(page); };

run(async () => {
  const ctx = await openGame();
  const { page, errors, shot } = ctx;

  // where each Znanje saves
  const cps = await page.evaluate(() => { const Z = window.__ZG; return { malcek: Z.checkpointIds('malcek'), ucenjak: Z.checkpointIds('ucenjak'), molj: Z.checkpointIds('molj') }; });
  check(cps.malcek.join() === 'peca,gozd,predjama' && cps.ucenjak.join() === 'triglav,piran' && cps.molj.join() === 'gozd',
    'checkpoints: Malček every quarter, Učenjak every third, Knjižni molj once at the half (Trnovski gozd)', JSON.stringify(cps));

  // Malček: no save before the first checkpoint, and Izhod says where the first one is
  await start(page, 'malcek');
  check(await page.evaluate(() => window.__ZG.saveLine()) === 'Napredek še ni shranjen – prvo shranjevanje: Peca.', 'before the first save, Izhod names the first checkpoint');
  check(await page.evaluate(() => !!document.querySelector('.travelwrap .bhead .exitbtn')), 'the road has an Izhod button in its header');

  // the first battle at Ptuj is no checkpoint
  await page.evaluate(() => { window.__ZG.S.run.firstBattle = false; });
  await toLastBattle(page, 0); await fight(page);
  check(await page.evaluate(() => !document.querySelector('.savednote') && !window.__ZG.readSaveRaw()), 'a won battle outside a checkpoint saves nothing');
  await page.keyboard.press('Enter'); await sleep(300);
  if (await page.evaluate(() => window.__ZG.S.screen === 'hero')) { await page.keyboard.press('Enter'); await sleep(300); }

  // the last battle at Peca is a checkpoint for Malček
  check(await toLastBattle(page, 1), 'the test reaches the last battle at Peca');
  await page.evaluate(() => { window.__ZG.S.run.gold = 77; });
  await fight(page);
  const saved = await page.evaluate(() => { const raw = window.__ZG.readSaveRaw(), s = raw && JSON.parse(raw); return { note: !!document.querySelector('.savednote'), region: s && s.region, gold: s && s.run.gold, party: s && s.party.join(), know: s && s.know }; });
  check(saved.note && saved.region === 'peca' && saved.know === 'malcek' && saved.party === 'krpan' && saved.gold >= 77,
    'winning the last battle at Peca saves the journey and the result says Shranjeno', JSON.stringify(saved));
  await shot('save-01-result');
  await page.keyboard.press('Enter'); await sleep(300);
  if (await page.evaluate(() => window.__ZG.S.screen === 'hero')) { await page.keyboard.press('Enter'); await sleep(300); }
  check(await page.evaluate(() => window.__ZG.saveLine()) === 'Napredek je shranjen po zadnji zmagi – Peca.', 'Izhod then says where it saved', await page.evaluate(() => window.__ZG.saveLine()));

  // Izhod on the road: the question, Ostani keeps the road, Izhod leaves for the menu
  await page.click('.travelwrap .exitbtn'); await sleep(200);
  const dlg = await page.evaluate(() => { const d = document.querySelector('.exitdlg'); return d && d.querySelector('.saveline').textContent; });
  check(dlg === 'Napredek je shranjen po zadnji zmagi – Peca.', 'Izhod asks first and says where the game last saved', dlg);
  await shot('save-02-exit');
  await page.keyboard.press('Escape'); await sleep(200);
  check(await page.evaluate(() => !document.querySelector('.exitdlg') && window.__ZG.S.screen === 'travel'), 'Esc (Ostani) keeps you on the road');
  await page.click('.travelwrap .exitbtn'); await sleep(200);
  await page.keyboard.press('Enter'); await sleep(300);
  check(await page.evaluate(() => window.__ZG.S.screen === 'title'), 'Izhod leaves for the start screen');

  // closing the page: the next visit continues from the checkpoint
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await page.evaluate(() => { window.__ZG.S.tutOn = false; }); await sleep(400);
  const menu = await page.evaluate(() => { const b = document.querySelector('.mm-item'); return b && b.textContent; });
  check(/Nadaljuj pot/.test(menu) && /Peca/.test(menu) && /shranjeno/.test(menu), 'after closing the page, the menu offers Nadaljuj pot (Peca · shranjeno)', menu);
  await page.click('.mm-item'); await sleep(400);
  const back = await page.evaluate(() => { const Z = window.__ZG, R = Z.S.run; return { screen: Z.S.screen, ri: R && R.ri, party: Z.HEROES.map(x => x.id).join(), gold: R && R.gold, know: Z.S.know }; });
  check(back.screen === 'travel' && back.ri === 1 && back.party === 'krpan' && back.gold >= 77 && back.know === 'malcek', 'Nadaljuj pot picks the journey up at Peca with the same party and gold', JSON.stringify(back));

  // Izhod in a battle's pause window: the battle starts again when the journey continues
  await page.evaluate(() => { window.__ZG.S.testMode = true; });
  await toLastBattle(page, 2); await arrive(page);
  const hp0 = await page.evaluate(() => window.__ZG.S.heroes[0].hp);
  await page.evaluate(() => { const st = window.__ZG.S.heroes[0]; st.hp = Math.max(1, st.hp - 9); });
  await page.evaluate(() => window.__ZG.setPause(true)); await sleep(200);
  check(await page.evaluate(() => !!document.querySelector('.overlay.pause .exitbtn')), 'the pause window of a journey battle has Izhod');
  await page.click('.overlay.pause .exitbtn'); await sleep(200);
  check(await page.evaluate(() => !!document.querySelector('.exitdlg') && !!document.querySelector('.overlay.pause')), 'Izhod from the pause asks over the pause window');
  await page.keyboard.press('Escape'); await sleep(200);
  check(await page.evaluate(() => !document.querySelector('.exitdlg') && window.__ZG.G.paused), 'Esc closes the question and the game stays paused');
  await page.click('.overlay.pause .exitbtn'); await sleep(200);
  await page.keyboard.press('Enter'); await sleep(400);
  const left = await page.evaluate(() => { const Z = window.__ZG; return { screen: Z.S.screen, paused: Z.G.paused, hp: Z.S.heroes[0].hp, over: !document.querySelector('.overlay') }; });
  check(left.screen === 'title' && !left.paused && left.hp === hp0 && left.over, 'leaving mid-battle resets that battle (health as it began) and unpauses', JSON.stringify({ ...left, hp0 }));

  // Knjižni molj: Peca is no checkpoint, Trnovski gozd is
  await start(page, 'molj');
  check(await page.evaluate(() => window.__ZG.saveLine()) === 'Napredek še ni shranjen – prvo shranjevanje: Trnovski gozd.', 'Knjižni molj saves first at Trnovski gozd, after the shrines at Bled');
  await toLastBattle(page, 1);
  check(await page.evaluate(() => { const R = window.__ZG.S.run, n = R.stops.find(s => !s.passed); return window.__ZG.isCheckpoint(n); }) === false, 'for Knjižni molj the last battle at Peca is no checkpoint');
  await toLastBattle(page, 4);
  check(await page.evaluate(() => { const R = window.__ZG.S.run, n = R.stops.find(s => !s.passed); return window.__ZG.isCheckpoint(n); }) === true, 'for Knjižni molj the last battle at Trnovski gozd is the checkpoint');

  // the chests, traps and wells planned for the journey are kept in the save; a 0.10.0 save (no wells planned, a Težavnost of its own) still loads
  const plans = await page.evaluate(() => { const Z = window.__ZG; Z.writeSave(); const s = JSON.parse(Z.readSaveRaw());
    const kept = Array.isArray(s.run.eventAt) && s.run.eventAt.length === 10 && Array.isArray(s.run.wellAt) && !('diff' in s);
    delete s.run.wellAt; s.diff = 'tezka'; localStorage.setItem('zg-save', JSON.stringify(s));
    return { kept, raw: s }; });
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(500);
  const old = await page.evaluate(() => { const Z = window.__ZG; Z.S.tutOn = false; const ok = !!Z.SAVED && Z.loadSave(); return { ok, wells: Z.S.run && Z.S.run.wellAt, know: Z.S.know }; });
  check(plans.kept, 'the save keeps the chests, traps and wells of this journey, and no Težavnost of its own');
  check(old.ok && Array.isArray(old.wells) && old.wells.length >= 2 && old.know === 'molj', 'a save from 0.10.0 still loads; its wells are planned when it loads', JSON.stringify(old));

  // a journey that ends removes its save; a new journey starts without one
  await page.evaluate(() => window.__ZG.writeSave());
  check(await page.evaluate(() => !!window.__ZG.readSaveRaw()), 'the test journey is saved');
  await page.evaluate(() => window.__ZG.resetRun());
  check(await page.evaluate(() => !window.__ZG.readSaveRaw() && !window.__ZG.SAVED), 'a lost journey removes its save');

  // a save from an older build that no longer fits is dropped with a message
  await page.evaluate(() => localStorage.setItem('zg-save', JSON.stringify({ v: 1, region: 'nekje', run: { ri: 99 }, party: ['nobody'], heroes: [] })));
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(500);
  const dropped = await page.evaluate(() => ({ raw: window.__ZG.readSaveRaw(), toast: (document.querySelector('.toast') || {}).textContent || '', first: document.querySelector('.mm-item').textContent }));
  check(!dropped.raw && /starejše različice/.test(dropped.toast) && !/Nadaljuj/.test(dropped.first), 'a save that no longer fits is dropped, with a message', JSON.stringify(dropped));

  // phone: the road's Izhod is a thumb-size button
  const ph = await openGame({ phone: true });
  await start(ph.page, 'malcek');
  const size = await ph.page.evaluate(() => { const r = document.querySelector('.travelwrap .exitbtn').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  check(size[1] >= 40, 'on a phone Izhod is at least 40 px tall', JSON.stringify(size));
  await ph.shot('save-03-phone-road');
  check(!ph.errors.length, 'no page or console errors on a phone', ph.errors.join(' | '));

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
