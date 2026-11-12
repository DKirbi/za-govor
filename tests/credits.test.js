// Words for Evil is credited inside the game: on the start screen, on the Zasluge screen
// (with every other source) and on the ending. Desktop and phone layouts.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Credits (Words for Evil in the game)');

run(async () => {
  const ctx = await openGame({ width: 1100, height: 900 });
  const { page, errors, shot } = ctx;

  const title = await page.evaluate(() => { const p = document.querySelector('.title .inspired'); return p ? { text: p.textContent, afterTagline: !!(p.previousElementSibling && p.previousElementSibling.classList.contains('tagline')), visible: p.getBoundingClientRect().bottom <= innerHeight } : null; });
  check(title && /Words for Evil/.test(title.text) && /Chromosphere Games, 2014/.test(title.text) && title.afterTagline && title.visible,
    'the start screen credits Words for Evil right under the title', JSON.stringify(title));
  await shot('credits-01-title');

  await page.click('.title .inspired .linkbtn'); await sleep(200);
  const cr = await page.evaluate(() => {
    const el = document.querySelector('.credits'), a = el && el.querySelector('a[href*="store.steampowered.com/app/335790"]');
    return { screen: window.__ZG.S.screen, text: el ? el.textContent : '', link: !!a, newTab: a ? a.target === '_blank' && /noopener/.test(a.rel) : false };
  });
  check(cr.screen === 'credits', 'Zasluge opens the credits screen');
  check(/Words for Evil/.test(cr.text) && /Chromosphere Games/.test(cr.text) && /Dylan Loney/.test(cr.text) && /2014/.test(cr.text), 'the credits name Words for Evil, Chromosphere Games, Dylan Loney and 2014');
  check(/ni uradno povezana/.test(cr.text), 'the credits say Za govor is not officially connected to its authors');
  check(cr.link && cr.newTab, 'the credits link to Words for Evil on Steam in a new tab');
  check(['Sloleks 3.1', 'CC BY-SA 4.0', 'Franček', 'Tezavra sodobne slovenščine', 'ZzFX', 'Capacitor', 'Monike Kropej'].every(s => cr.text.includes(s)), 'the credits list the word list (Sloleks, Franček, thesaurus), sound, Android wrapper and folklore sources');
  await shot('credits-02-screen');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await page.evaluate(() => window.__ZG.S.screen) === 'title', 'Esc goes back to the start screen');

  // the ending after the dragon thanks the player and repeats the credit
  await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('ending'); }); await sleep(200);
  const end = await page.evaluate(() => { const p = document.querySelector('.ending .inspired'); return { credit: p ? p.textContent : '', thanks: !!document.querySelector('.ending .thanks') }; });
  check(end.thanks && /Words for Evil/.test(end.credit), 'the ending thanks the player and credits Words for Evil', end.credit);
  await shot('credits-03-ending');

  // phone: the line wraps inside the screen and Zasluge is a comfortable tap target
  await page.evaluate(() => { const Z = window.__ZG; Z.resetRun(); Z.go('title'); });
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluate(() => { if (!window.__ZG.S.mobile) document.querySelector('.tb-mobile').click(); }); await sleep(200);
  const ph = await page.evaluate(() => { const p = document.querySelector('.title .inspired'), b = p.querySelector('.linkbtn').getBoundingClientRect();
    return { right: Math.round(p.getBoundingClientRect().right), vw: innerWidth, wide: document.documentElement.scrollWidth, btnH: Math.round(b.height) }; });
  check(ph.right <= ph.vw && ph.wide <= ph.vw && ph.btnH >= 36, 'on a 360 px phone the credit fits and Zasluge is at least 36 px tall', JSON.stringify(ph));
  await shot('credits-04-phone');
  // the Android back button leaves the credits for the start screen
  await page.evaluate(() => window.__ZG.go('credits'));
  check(await page.evaluate(() => [window.zgBack(), window.__ZG.S.screen].join(' ')) === 'ok title', 'Android back on the credits returns to the start screen');

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
