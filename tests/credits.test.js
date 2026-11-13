// Words for Evil is credited inside the game: on the O igri page (Navdih, then Zasluge with every
// other source) and on the ending, whose line links to O igri. Desktop and phone layouts.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Credits (Words for Evil in the game)');

run(async () => {
  const ctx = await openGame({ width: 1100, height: 900 });
  const { page, errors, shot } = ctx;

  // O igri: the description moved here from the start screen, then the credit and the sources
  await page.evaluate(() => [...document.querySelectorAll('.mm-item')].find(b => b.textContent === 'O igri').click()); await sleep(200);
  const cr = await page.evaluate(() => {
    const el = document.querySelector('.about'), nav = document.querySelector('#o-navdih'), a = el && el.querySelector('a[href*="store.steampowered.com/app/335790"]');
    return { screen: window.__ZG.S.screen, text: el ? el.textContent : '', navdih: nav ? nav.textContent : '', link: !!a, newTab: a ? a.target === '_blank' && /noopener/.test(a.rel) : false };
  });
  check(cr.screen === 'about', 'O igri opens from the menu');
  check(/Ptuja do Ljubljanskega gradu/.test(cr.text) && /bog le eden/.test(cr.text), 'O igri carries the description that used to be on the start screen');
  check(/Words for Evil/.test(cr.navdih) && /Chromosphere Games/.test(cr.navdih) && /Dylan Loney/.test(cr.navdih) && /2014/.test(cr.navdih), 'Navdih names Words for Evil, Chromosphere Games, Dylan Loney and 2014');
  check(/ni uradno povezana/.test(cr.navdih), 'Navdih says Za govor is not officially connected to its authors');
  check(cr.link && cr.newTab, 'O igri links to Words for Evil on Steam in a new tab');
  check(['Sloleks 3.1', 'CC BY-SA 4.0', 'Franček', 'Tezavra sodobne slovenščine', 'ZzFX', 'Capacitor', 'Monike Kropej'].every(s => cr.text.includes(s)), 'Zasluge list the word list (Sloleks, Franček, thesaurus), sound, Android wrapper and folklore sources');
  await shot('credits-01-about');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await page.evaluate(() => window.__ZG.S.screen) === 'title', 'Esc goes back to the start screen');

  // the ending after the dragon thanks the player and repeats the credit; Zasluge opens O igri at Navdih
  await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('ending'); }); await sleep(200);
  const end = await page.evaluate(() => { const p = document.querySelector('.ending .inspired'); return { credit: p ? p.textContent : '', thanks: !!document.querySelector('.ending .thanks') }; });
  check(end.thanks && /Words for Evil/.test(end.credit), 'the ending thanks the player and credits Words for Evil', end.credit);
  await shot('credits-02-ending');
  await page.click('.ending .inspired .linkbtn'); await sleep(400);
  const at = await page.evaluate(() => ({ screen: window.__ZG.S.screen, top: Math.round(document.querySelector('#o-navdih').getBoundingClientRect().top) }));
  check(at.screen === 'about' && at.top >= 0 && at.top < 160, 'Zasluge on the ending opens O igri at Navdih', JSON.stringify(at));

  // phone: the line wraps inside the screen and Zasluge is a comfortable tap target
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluate(() => window.__ZG.setLayout(true)); await sleep(250);
  await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('ending'); }); await sleep(200);
  const ph = await page.evaluate(() => { const p = document.querySelector('.ending .inspired'), b = p.querySelector('.linkbtn').getBoundingClientRect();
    return { right: Math.round(p.getBoundingClientRect().right), vw: innerWidth, wide: document.documentElement.scrollWidth, btnH: Math.round(b.height) }; });
  check(ph.right <= ph.vw && ph.wide <= ph.vw && ph.btnH >= 36, 'on a 360 px phone the credit fits and Zasluge is at least 36 px tall', JSON.stringify(ph));
  await page.evaluate(() => window.__ZG.go('about')); await sleep(150);
  const aph = await page.evaluate(() => ({ wide: document.documentElement.scrollWidth, vw: innerWidth }));
  check(aph.wide <= aph.vw, 'O igri fits a 360 px phone', JSON.stringify(aph));
  await shot('credits-03-phone');
  // the Android back button leaves O igri for the start screen
  check(await page.evaluate(() => [window.zgBack(), window.__ZG.S.screen].join(' ')) === 'ok title', 'Android back on O igri returns to the start screen');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
