// The start menu and the pages under it: Nadaljuj pot, Nova pot (pace, knowledge, options; a draft
// until the journey starts), Dosežki in junaki, Kako igrati (controls + puzzle carousel) and O igri.
// Every page has "← Nazaj na glavni meni" at the top; Esc and the Android back button do the same.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Start menu and its pages');

const S = page => page.evaluate(() => window.__ZG.S.screen);
const items = page => page.evaluate(() => [...document.querySelectorAll('.mm-item')].map(b => b.textContent));
const focused = page => page.evaluate(() => document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id || document.activeElement.className : null);
const crumbInfo = page => page.evaluate(() => { const c = document.querySelector('#screen .crumb'), r = c && c.getBoundingClientRect();
  return c ? { text: c.textContent, top: Math.round(r.top), h: Math.round(r.height), first: c.closest('.crumbs') === c.closest('#screen > *').firstElementChild } : null; });

run(async () => {
  const ctx = await openGame({ width: 1280, height: 900, intros: true });   // no puzzles here; keeps the explanations at their default
  const { page, errors, shot } = ctx;

  // 1. a fresh game: four items, no text block, the first item ready for the keyboard
  check((await items(page)).join('|') === 'Nova pot|Dosežki in junaki|Kako igrati|O igri', 'a fresh game shows Nova pot, Dosežki in junaki, Kako igrati and O igri', (await items(page)).join('|'));
  // the title scene (wordmark and subtitle, read out to screen readers) does not count as text on the menu
  const bare = await page.evaluate(() => { const m = document.querySelector('.menu'), st = m.querySelector('.title-stage');
    return { text: m.textContent.length - (st ? st.textContent.length : 0), extras: [...m.querySelectorAll('p, .note, input, .choice')].filter(e => !e.closest('.title-stage')).length, scene: !!st }; });
  check(bare.scene && bare.extras === 0 && bare.text < 80, 'the start screen is the title scene and the menu, with no description, settings or help text', JSON.stringify(bare));
  check(await focused(page) === 'new', 'Nova pot has keyboard focus');
  await shot('menu-01-fresh');

  // 2. ↑ ↓ walk the menu (and wrap); Enter opens; Esc comes back to the same item
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
  check(await focused(page) === 'howto', '↓ ↓ moves to Kako igrati');
  await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
  check(await focused(page) === 'about', '↑ from the first item wraps to the last');
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await sleep(200);
  check(await S(page) === 'heroes', 'Enter opens Dosežki in junaki');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await S(page) === 'title' && await focused(page) === 'heroes', 'Esc returns to the menu, on the item it came from');

  // 3. every page under the menu: the way back at the top, first thing on the page
  for (const [id, title] of [['newrun', 'Nova pot'], ['heroes', 'Dosežki in junaki'], ['howto', 'Kako igrati'], ['about', 'O igri']]) {
    await page.evaluate(t => [...document.querySelectorAll('.mm-item')].find(b => b.textContent === t).click(), title); await sleep(200);
    const c = await crumbInfo(page), h1 = await page.evaluate(() => ({ text: document.querySelector('.page-h1').textContent, focus: document.activeElement === document.querySelector('.page-h1') }));
    check(await S(page) === id && c && /^←\s*Nazaj na glavni meni$/.test(c.text) && c.first && c.top < 120 && c.h >= 44 && h1.text === title && h1.focus,
      `${title}: "← Nazaj na glavni meni" at the top, the page heading takes focus`, JSON.stringify({ c, h1 }));
    await page.click('#screen .crumb'); await sleep(150);
    check(await S(page) === 'title', `${title}: the way back returns to the menu`);
  }

  // 4. Nova pot: short copy, sprites, Predlogi only under Malček, explanations on, test mode as a dev option
  await page.evaluate(() => window.__ZG.go('newrun')); await sleep(200);
  const nr = await page.evaluate(() => {
    const t = id => document.querySelector(`.choice[data-id="${id}"] p`).textContent;
    const blocks = [...document.querySelectorAll('.set-block')].map(b => b.getBoundingClientRect()), knowH = document.querySelector('#set-know').getBoundingClientRect();
    const mal = document.querySelector('.choice[data-id="malcek"]').getBoundingClientRect(), sub = document.querySelector('.subopt'), sr = sub.getBoundingClientRect();
    const tog = label => [...document.querySelectorAll('.setup .toggle')].find(x => x.textContent.startsWith(label));
    return { real: t('real'), calm: t('calm'), malcek: t('malcek'), ucenjak: t('ucenjak'), molj: t('molj'),
      sprites: [...document.querySelectorAll('.lv-art .sp')].map(i => /data:image\/png/.test(i.style.backgroundImage)),
      gap: Math.round(knowH.top - blocks[0].bottom), line: getComputedStyle(document.querySelectorAll('.set-block')[1]).borderTopStyle,
      sub: { shown: !sub.hidden, text: sub.textContent, under: Math.abs(sr.top - mal.bottom) <= 3 && Math.abs(sr.left - mal.left) <= 1, checked: sub.querySelector('input').checked },
      tut: tog('Pokaži razlage ugank').querySelector('input').checked,
      dev: { inBox: !!tog('Preizkusni način').closest('.devbox'), checked: tog('Preizkusni način').querySelector('input').checked, tag: document.querySelector('.setup .devtag').textContent } };
  });
  check(nr.real === 'Sovražniki napadajo sproti in počasi topijo zdravje družine.', 'Realni čas keeps only its first sentence', nr.real);
  check(/^Brez časovnega pritiska, sovražniki napadejo/.test(nr.calm) && /Dogodki imajo dvojni čas\.$/.test(nr.calm), 'Mirni način is one short line: no time pressure, events get double time', nr.calm);
  check(nr.malcek === 'Za učenje besed.' && nr.ucenjak === 'Zahtevnejše besede, malo pomoči.' && nr.molj === 'Za križankarje in pametnjakoviče.', 'the knowledge levels have one short line each');
  check(nr.sprites.length === 3 && nr.sprites.every(Boolean), 'each knowledge level has its own pixel figure');
  check(nr.gap >= 48 && nr.line === 'solid', 'Težavnost and Znanje are clearly apart, with a line between them', nr.gap + ' px');
  check(nr.sub.shown && /Predlogi besed med igro/.test(nr.sub.text) && nr.sub.under && nr.sub.checked, 'Predlogi besed sits right under Malček, on by default', JSON.stringify(nr.sub));
  check(nr.tut, 'Pokaži razlage ugank is on by default');
  check(nr.dev.inBox && !nr.dev.checked && /razvoj/i.test(nr.dev.tag), 'Preizkusni način is kept, off, in a box marked as a developer option', JSON.stringify(nr.dev));
  await shot('menu-02-newrun');
  await page.click('.choice[data-id="ucenjak"]'); await sleep(100);
  const uc = await page.evaluate(() => ({ hidden: document.querySelector('.subopt').hidden, on: document.querySelector('.choice.on[data-group="know"]').dataset.id, frame: getComputedStyle(document.querySelector('.choice[data-id="ucenjak"] .sp')).backgroundPositionX }));
  check(uc.hidden && uc.on === 'ucenjak' && uc.frame === '100%', 'choosing Učenjak hides Predlogi besed and wakes its figure', JSON.stringify(uc));
  // keyboard: the levels are one radio group
  await page.focus('.choice[data-id="ucenjak"] input'); await page.keyboard.press('ArrowRight'); await sleep(100);
  check(await page.evaluate(() => window.__ZG.S.setup.know) === 'molj', 'arrow keys move between knowledge levels (a radio group)');

  // 5. the choices are a draft: leaving Nova pot keeps the journey under way as it was
  await page.evaluate(() => { const Z = window.__ZG; Z.go('title'); Z.newRun('krpan'); Z.go('travel'); }); await sleep(150);
  await page.evaluate(() => [...document.querySelectorAll('.travelwrap .bhead .btn')].find(b => b.textContent === 'Meni').click()); await sleep(150);
  const withRun = await items(page);
  check(withRun[0].startsWith('Nadaljuj pot') && /\(.+\)/.test(withRun[0]) && await focused(page) === 'continue', 'Meni on the road leads to the menu with Nadaljuj pot (and the region) first and focused', withRun[0]);
  await shot('menu-03-continue');
  await page.evaluate(() => window.__ZG.go('newrun')); await sleep(150);
  check(await page.evaluate(() => /se konča/.test(document.querySelector('.setup .note').textContent)), 'Nova pot warns that the journey under way will end');
  await page.click('.choice[data-id="calm"]'); await page.click('.choice[data-id="molj"]'); await sleep(100);
  await page.keyboard.press('Escape'); await sleep(150);
  check(await page.evaluate(() => { const S = window.__ZG.S; return S.mode === 'real' && S.know === 'malcek' && !S.setup; }), 'leaving Nova pot drops the draft: the journey under way keeps its pace and level');
  await page.evaluate(() => window.__ZG.go('newrun')); await sleep(150);
  check(await page.evaluate(() => document.querySelector('.choice.on[data-group="mode"]').dataset.id === 'real' && document.querySelector('.choice.on[data-group="know"]').dataset.id === 'malcek'), 'Nova pot opens with the current choices again');
  await page.click('.choice[data-id="calm"]'); await page.click('.choice[data-id="molj"]');
  await page.click('.setup .toggle:not(.subopt .toggle) input'); await sleep(100);   // Pokaži razlage ugank off
  await page.keyboard.press('Enter'); await sleep(200);
  check(await S(page) === 'pick' && await page.evaluate(() => window.__ZG.S.mode) === 'real', 'Enter goes on to the hero; nothing is applied yet');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await S(page) === 'newrun' && await page.evaluate(() => document.querySelector('.choice.on[data-group="know"]').dataset.id) === 'molj', 'Esc on the hero choice steps back to Nova pot with the draft intact');
  await page.click('.cta-row .cta'); await sleep(150); await page.keyboard.press('Enter'); await sleep(300);
  const applied = await page.evaluate(() => { const S = window.__ZG.S; return { screen: S.screen, mode: S.mode, know: S.know, tut: S.tutOn, stored: [localStorage.getItem('zg-mode'), localStorage.getItem('zg-know'), localStorage.getItem('zg-tutorials')].join() }; });
  check(applied.screen === 'travel' && applied.mode === 'calm' && applied.know === 'molj' && applied.tut === false && applied.stored === 'calm,molj,0', 'the new journey starts with the chosen pace, level and options, and remembers them', JSON.stringify(applied));
  // explanations on again: every puzzle type is explained afresh on the new journey
  await page.evaluate(() => { const Z = window.__ZG; Z.TUT_SEEN.add('mesh'); Z.TUT_SEEN.add('chest'); Z.go('title'); Z.go('newrun'); }); await sleep(150);
  check(await page.evaluate(() => !document.querySelector('.setup .toggle:not(.subopt .toggle) input').checked), 'Nova pot remembers that explanations were switched off');
  await page.click('.setup .toggle:not(.subopt .toggle) input'); await page.click('.cta-row .cta'); await sleep(150); await page.keyboard.press('Enter'); await sleep(300);
  check(await page.evaluate(() => window.__ZG.S.tutOn && window.__ZG.TUT_SEEN.size === 0), 'with Pokaži razlage ugank on, a new journey explains every puzzle type again');

  // 6. Kako igrati: keyboard controls on the desktop, the puzzles in a carousel
  await page.evaluate(() => window.__ZG.go('howto')); await sleep(300);
  const ht = await page.evaluate(() => ({ tag: document.querySelector('.howto h2 .tag').textContent, kbd: document.querySelectorAll('.ctl kbd').length,
    groups: [...document.querySelectorAll('.ctl-group h3')].map(x => x.textContent), slides: document.querySelectorAll('.car-slide').length,
    tabs: [...document.querySelectorAll('.car-tab')].map(t => t.textContent), count: document.querySelector('.car-count').textContent,
    hidden: [...document.querySelectorAll('.car-slide')].map(s => s.getAttribute('aria-hidden') === 'true') }));
  check(/tipkovnica/.test(ht.tag) && ht.kbd > 15 && ht.groups.includes('Mreža črk') && ht.groups.includes('Križanka'), 'the desktop gets keyboard and mouse controls, grouped by puzzle', JSON.stringify(ht.groups));
  check(ht.slides === 5 && ht.tabs.join() === 'Mreža,Križanka,Skrinja,Puščice,Plaz' && ht.count === '1 / 5' && ht.hidden.join() === 'false,true,true,true,true', 'the five puzzles are a carousel with one slide in view', JSON.stringify(ht));
  await shot('menu-04-howto');
  await page.click('.car-nav .car-btn:last-child'); await sleep(700);
  await page.keyboard.press('ArrowRight'); await sleep(700);
  const car = await page.evaluate(() => { const t = document.querySelector('.car-track'), cur = document.querySelectorAll('.car-slide')[2];
    return { idx: window.__ZG.car.idx, count: document.querySelector('.car-count').textContent, tab: document.querySelector('.car-tab[aria-current="true"]').textContent,
      inView: Math.abs(cur.offsetLeft - t.scrollLeft) < 2, h: Math.abs(t.offsetHeight - cur.offsetHeight) <= 1 }; });
  check(car.idx === 2 && car.count === '3 / 5' && car.tab === 'Skrinja' && car.inView && car.h, 'Naslednja and → move one slide; the track fits the slide in view', JSON.stringify(car));
  await page.evaluate(() => [...document.querySelectorAll('.car-tab')].find(t => t.textContent === 'Plaz').click()); await sleep(700);
  check(await page.evaluate(() => document.querySelector('.car-nav .car-btn:last-child').disabled && document.querySelector('.car-count').textContent === '5 / 5'), 'a tab jumps straight to its puzzle; Naslednja stops at the last');
  await shot('menu-05-howto-carousel');

  // 7. Dosežki in junaki: met heroes open their card, the others are silhouettes; the dev gallery is one step deeper
  await page.evaluate(() => window.__ZG.go('heroes')); await sleep(200);
  const hr = await page.evaluate(() => ({ open: document.querySelectorAll('.herogrid button.pickcard').length, locked: document.querySelectorAll('.herogrid .pickcard.locked').length, ach: !!document.querySelector('.heroes .empty') }));
  check(hr.open + hr.locked === 15 && hr.open >= 3 && hr.ach, 'Dosežki in junaki lists all fifteen heroes (met ones open) and a place for achievements', JSON.stringify(hr));
  await page.click('.herogrid button.pickcard'); await sleep(250);
  const card = await page.evaluate(() => ({ screen: window.__ZG.S.screen, kind: document.querySelector('.hm .kind').textContent, crumb: document.querySelector('.hm .crumb').textContent }));
  check(card.screen === 'hero' && card.kind === 'Junak' && /Nazaj na junake/.test(card.crumb), 'a met hero opens their card with a way back to the heroes', JSON.stringify(card));
  await page.keyboard.press('Escape'); await sleep(150);
  check(await S(page) === 'heroes', 'Esc on the card returns to the heroes');
  await page.click('.heroes .devbox .btn'); await sleep(250);
  check(await S(page) === 'gallery' && /Nazaj na junake/.test(await page.evaluate(() => document.querySelector('.gallery .crumb').textContent)), 'the developer gallery opens from the heroes, with its way back');
  await page.keyboard.press('Escape'); await sleep(150);
  check(await S(page) === 'heroes', 'Esc in the gallery returns to the heroes');

  // 8. a finished journey cannot be continued
  await page.evaluate(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.go('ending'); Z.go('title'); }); await sleep(150);
  check(!(await items(page))[0].startsWith('Nadaljuj'), 'after the ending the menu offers no Nadaljuj pot');

  // 9. phone
  await page.evaluate(() => { const Z = window.__ZG; Z.resetRun(); Z.newRun('krpan'); Z.go('title'); });
  await page.setViewport({ width: 360, height: 760, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluate(() => { if (!window.__ZG.S.mobile) document.querySelector('.tb-mobile').click(); }); await sleep(250);
  const pm = await page.evaluate(() => { const r = [...document.querySelectorAll('.mm-item')].map(b => b.getBoundingClientRect());
    return { minH: Math.round(Math.min(...r.map(x => x.height))), right: Math.round(Math.max(...r.map(x => x.right))), bottom: Math.round(Math.max(...r.map(x => x.bottom))), vw: innerWidth, vh: innerHeight, wide: document.documentElement.scrollWidth,
      focus: document.activeElement && document.activeElement.classList.contains('mm-item') }; });
  check(pm.minH >= 56 && pm.right <= pm.vw && pm.wide <= pm.vw && pm.bottom <= pm.vh && !pm.focus, 'on a 360 px phone the menu items are 56 px tall, fit on one screen and nothing is pre-focused', JSON.stringify(pm));
  await shot('menu-06-phone');
  for (const id of ['newrun', 'heroes', 'howto', 'about']) {
    await page.evaluate(x => window.__ZG.go(x), id); await sleep(250);
    const f = await page.evaluate(() => ({ wide: document.documentElement.scrollWidth, vw: innerWidth }));
    check(f.wide <= f.vw, `${id}: fits a 360 px phone`, JSON.stringify(f));
  }
  await page.evaluate(() => window.__ZG.go('newrun')); await sleep(200);
  const cta = await page.evaluate(() => { const r = document.querySelector('.cta-row .cta').getBoundingClientRect(); return { bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight }; });
  check(cta.bottom <= cta.vh && cta.h >= 48, 'Izberi junaka stays in reach at the bottom of the phone screen', JSON.stringify(cta));
  await shot('menu-07-phone-newrun');
  await page.evaluate(() => window.__ZG.go('howto')); await sleep(300);
  const hp = await page.evaluate(() => ({ tag: document.querySelector('.howto h2 .tag').textContent, kbd: [...document.querySelectorAll('.ctl kbd')].length, text: document.querySelector('.ctl-groups').textContent }));
  check(/telefon/.test(hp.tag) && hp.kbd === 0 && /Vleci/.test(hp.text) && /slovenska tipkovnica/.test(hp.text), 'the phone gets touch controls instead of keys', JSON.stringify({ tag: hp.tag, kbd: hp.kbd }));
  // a swipe is a scroll of the track; the carousel follows it
  await page.evaluate(() => { const t = document.querySelector('.car-track'); t.scrollTo({ left: document.querySelectorAll('.car-slide')[1].offsetLeft }); }); await sleep(500);
  check(await page.evaluate(() => window.__ZG.car.idx === 1 && document.querySelector('.car-count').textContent === '2 / 5'), 'swiping the carousel moves to the next puzzle');
  await shot('menu-08-phone-howto');
  // Android back: hero choice → Nova pot → menu → exit
  const back = await page.evaluate(async () => { const Z = window.__ZG, wait = ms => new Promise(r => setTimeout(r, ms)), out = [];
    Z.go('newrun'); Z.go('pick'); await wait(100);
    for (let i = 0; i < 3; i++) { const r = window.zgBack(); out.push(r + ':' + Z.S.screen); if (r === 'exit') break; }
    return out.join(' '); });
  check(back === 'ok:newrun ok:title exit:title', 'Android back steps from the hero choice to Nova pot, then the menu, and exits only there', back);

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
