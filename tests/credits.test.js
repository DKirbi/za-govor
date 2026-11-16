// Credits inside the game (16 Nov 2026): O igri names the maker (Oygn Productions, Davor Kirbiš), why the
// game was made, a Navdih that names no other game, and every source folded behind ©. The ending names the
// maker and links to O igri. No other game is named anywhere in the game. Desktop and phone layouts.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Credits (maker, Navdih, Zasluge)');

run(async () => {
  const ctx = await openGame({ width: 1100, height: 900 });
  const { page, errors, shot } = ctx;

  // nothing in the game names another game
  check(await page.evaluate(() => !/Words for Evil|Chromosphere|Dylan Loney|steampowered/.test(document.documentElement.innerHTML)), 'the game names no other game, anywhere in the page');

  await page.evaluate(() => [...document.querySelectorAll('.mm-item')].find(b => b.textContent === 'O igri').click()); await sleep(200);
  const cr = await page.evaluate(() => {
    const el = document.querySelector('.about'), sec = id => (document.querySelector('#o-' + id) || {}).textContent || '';
    return { screen: window.__ZG.S.screen, text: el ? el.textContent : '', avtor: sec('avtor'), navdih: sec('navdih'), folded: !!document.querySelector('#o-zasluge details.credits-more:not([open])') };
  });
  check(cr.screen === 'about', 'O igri opens from the menu');
  check(/Ptuja do Ljubljanskega gradu/.test(cr.text) && /bog le eden/.test(cr.text), 'O igri carries the description of the game');
  check(/Igro je razvil Oygn Productions \(Davor Kirbiš\)\./.test(cr.avtor), 'Avtor: developed by Oygn Productions (Davor Kirbiš)', cr.avtor.slice(0, 80));
  check(/neizmerna strast/.test(cr.avtor) && /projekt iz srca/.test(cr.avtor), 'Avtor: the passion for games and storytelling, a passion project');
  check(/slovenskega jezika/.test(cr.avtor) && /folklore/.test(cr.avtor) && /Slovence/.test(cr.avtor), 'Avtor: made to promote the Slovene language and folklore');
  check(/različnih besednih iger/.test(cr.navdih) && /igro vlog/.test(cr.navdih), 'Navdih: grew out of playing word games with a role-playing game in mind, naming none');
  check(cr.folded && ['Sloleks 3.1', 'CC BY-SA 4.0', 'Franček', 'Tezavra sodobne slovenščine', 'ZzFX', 'Capacitor', 'Monike Kropej'].every(s => cr.text.includes(s)),
    'Zasluge list every source, folded behind ©');
  await page.click('#o-zasluge summary'); await sleep(150);
  check(await page.evaluate(() => document.querySelector('#o-zasluge details').open && document.querySelector('#o-zasluge .credit-sec').getBoundingClientRect().height > 0), 'a tap on © opens the sources');
  await shot('credits-01-about');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await page.evaluate(() => window.__ZG.S.screen) === 'title', 'Esc goes back to the start screen');

  // the ending thanks the player and names the maker; the link opens O igri at Avtor
  await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('ending'); }); await sleep(200);
  const end = await page.evaluate(() => { const p = document.querySelector('.ending .inspired'); return { credit: p ? p.textContent : '', thanks: !!document.querySelector('.ending .thanks') }; });
  check(end.thanks && /Oygn Productions/.test(end.credit), 'the ending thanks the player and names the maker', end.credit);
  await shot('credits-02-ending');
  await page.click('.ending .inspired .linkbtn'); await sleep(400);
  const at = await page.evaluate(() => ({ screen: window.__ZG.S.screen, top: Math.round(document.querySelector('#o-avtor').getBoundingClientRect().top), vh: innerHeight }));
  check(at.screen === 'about' && at.top >= 0 && at.top < at.vh - 200, 'the ending\'s link opens O igri with Avtor in view', JSON.stringify(at));

  // phone: the line wraps inside the screen and the link is a comfortable tap target
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluate(() => window.__ZG.setLayout(true)); await sleep(250);
  await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('ending'); }); await sleep(200);
  const ph = await page.evaluate(() => { const p = document.querySelector('.ending .inspired'), b = p.querySelector('.linkbtn').getBoundingClientRect();
    return { right: Math.round(p.getBoundingClientRect().right), vw: innerWidth, wide: document.documentElement.scrollWidth, btnH: Math.round(b.height) }; });
  check(ph.right <= ph.vw && ph.wide <= ph.vw && ph.btnH >= 36, 'on a 360 px phone the credit fits and the link is at least 36 px tall', JSON.stringify(ph));
  await page.evaluate(() => window.__ZG.go('about')); await sleep(150);
  const aph = await page.evaluate(() => ({ wide: document.documentElement.scrollWidth, vw: innerWidth, sum: Math.round(document.querySelector('#o-zasluge summary').getBoundingClientRect().height) }));
  check(aph.wide <= aph.vw && aph.sum >= 44, 'O igri fits a 360 px phone and © is a 44 px tap target', JSON.stringify(aph));
  await shot('credits-03-phone');
  // the Android back button leaves O igri for the start screen
  check(await page.evaluate(() => [window.zgBack(), window.__ZG.S.screen].join(' ')) === 'ok title', 'Android back on O igri returns to the start screen');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
