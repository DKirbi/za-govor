// Flow on the road and hero screens (playtest round 3): the way on is always on screen, a stop says
// which puzzle waits, the signpost walks on by itself, an ambush is announced, Kako igrati ends in the menu.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Flow (hero screens, stops, signpost, ambush, Kako igrati)');

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors, shot } = ctx;

  // a hero met on the road: the way on is a full-width button that is on screen without scrolling
  await page.evaluate(() => { const Z = window.__ZG; Z.S.testMode = true; Z.newRun('krpan');
    Z.go('hero', { kind: 'meet', ids: ['klepec'], sel: 0, actions: A => [{ label: 'Peter Klepec gre s teboj', primary: true, fn: () => {} }, { label: 'Pojdi naprej brez novega junaka', fn: () => {} }] }); });
  await sleep(300);
  const foot = await page.evaluate(() => { const b = document.querySelector('.hm-foot .btn.primary'), r = b.getBoundingClientRect(), w = document.querySelector('.hm').getBoundingClientRect();
    return { bottom: Math.round(r.bottom), vh: innerHeight, wide: Math.round(r.width) >= Math.round(w.width) - 2 }; });
  check(foot.bottom <= foot.vh && foot.wide, 'on a phone the hero screen\'s main button is full width and on screen without scrolling', JSON.stringify(foot));
  // even on a short phone
  await page.setViewport({ width: 360, height: 640, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await sleep(300);
  const short = await page.evaluate(() => { const r = document.querySelector('.hm-foot .btn.primary').getBoundingClientRect(); return { bottom: Math.round(r.bottom), vh: innerHeight }; });
  check(short.bottom <= short.vh, 'on a short phone (360×640) the main button still stays on screen', JSON.stringify(short));
  await shot('flow-01-hero-short');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await sleep(200);

  // a stop says which puzzle waits there
  await page.evaluate(() => { const Z = window.__ZG; Z.go('travel'); Z.travelAct('go'); });
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!window.__ZG.S.run.prompt)) break; await sleep(150); }
  const tag = await page.evaluate(() => (document.querySelector('.tv-prompt .ptag') || {}).textContent || '');
  check(tag === 'Uganka: mreža črk', 'a battle stop says the puzzle: mreža črk', tag);

  // the signpost: after "Naprej: <region>" the party walks on by itself
  const walk = await page.evaluate(() => { const Z = window.__ZG, R = Z.S.run;
    for (let i = 0; i < 20 && R.stops.some(s => !s.passed); i++) Z.travelAct('skip');
    R.x = R.endX; R.prompt = null; Z.go('travel');
    const a = R.prompt && R.prompt.actions.find(x => x.primary); const label = a && a.label; if (a) a.fn();
    return { label, ri: Z.S.run.ri, walking: Z.S.run.walking }; });
  check(/^Naprej: /.test(walk.label || '') && walk.ri === 1 && walk.walking, 'after the signpost the party walks on by itself (no second Naprej)', JSON.stringify(walk));

  // an ambush is announced before its crossword opens
  await page.evaluate(() => { const Z = window.__ZG; Z.S.tutOn = false; Z.go('battle', { ...Z.NODES[4], battle: { ...Z.NODES[4].battle, ambush: 'zaseda' } }); });
  await sleep(300);
  const amb = await page.evaluate(() => ({ fb: (document.querySelector('.wordbar .fb') || {}).textContent || '', cw: !!window.__ZG.B.cw }));
  await sleep(1700);
  const amb2 = await page.evaluate(() => !!window.__ZG.B.cw);
  check(/^Zaseda!/.test(amb.fb) && !amb.cw && amb2, 'an ambush says Zaseda! first; the crossword opens a moment later', JSON.stringify({ ...amb, later: amb2 }));
  await page.evaluate(() => { window.__ZG.B.over = true; window.__ZG.go('title'); });

  // Kako igrati: the last slide leads back to the menu
  await page.evaluate(() => window.__ZG.go('howto')); await sleep(300);
  await page.evaluate(() => { for (let i = 0; i < 6; i++) window.__ZG.car.step(1); }); await sleep(700);
  const last = await page.evaluate(() => { const b = [...document.querySelectorAll('.car-btn')].pop(); return { text: b.textContent, on: !b.disabled, primary: b.classList.contains('primary') }; });
  check(/Na glavni meni/.test(last.text) && last.on && last.primary, 'on the last slide of Kako igrati the button on the right leads to the menu', JSON.stringify(last));
  await page.evaluate(() => [...document.querySelectorAll('.car-btn')].pop().click()); await sleep(300);
  check(await page.evaluate(() => window.__ZG.S.screen === 'title'), 'and it goes to the menu');

  check(!errors.length, 'no page or console errors', errors.join(' | '));
});
