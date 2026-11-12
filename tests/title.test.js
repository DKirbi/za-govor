// The "Za govor!" title scene on the start screen: whole-pixel scaling, full width, the wordmark,
// motion that survives a re-render, reduced motion, desktop and phone.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Title scene ("Za govor!")');

const measure = page => page.evaluate(() => {
  const st = document.querySelector('.title-stage'), fr = st && st.querySelector('.ts-frame'), bar = document.querySelector('.topbar');
  if (!st) return null;
  const r = st.getBoundingClientRect(), f = fr.getBoundingClientRect(), logo = st.querySelector('.ts-logo'), rib = st.querySelector('.ts-ribbon');
  return { s: +st.style.getPropertyValue('--s'), left: r.left, width: r.width, height: r.height, top: r.top, barBottom: bar ? bar.getBoundingClientRect().bottom : 0,
    frameLeft: f.left, frameW: f.width, clientW: document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth,
    appLeft: app.getBoundingClientRect().left, appW: app.getBoundingClientRect().width,
    logo: logo.complete && logo.naturalWidth > 0, logoW: logo.getBoundingClientRect().width, natW: logo.naturalWidth, ribbon: rib.complete && rib.naturalWidth > 0,
    h1: (st.querySelector('h1') || {}).textContent, sparks: st.querySelectorAll('.ts-spark').length, vh: innerHeight };
});
const sparkY = page => page.evaluate(() => [...document.querySelectorAll('.ts-spark')].slice(0, 6).map(e => new DOMMatrix(getComputedStyle(e).transform).f));

run(async () => {
  // desktop
  let ctx = await openGame({ width: 1280, height: 800 });
  let { page, errors, shot } = ctx;
  let m = await measure(page);
  check(m && m.h1 === 'Za govor!', 'the start screen has the "Za govor!" heading', m && m.h1);
  check(await page.evaluate(() => document.title.startsWith('Za govor!')), 'the browser tab says Za govor!');
  check(m.logo && m.ribbon, 'the wordmark and the ribbon are drawn');
  check(Number.isInteger(m.s) && m.s === 3, 'the scene is drawn at a whole-number scale (3× at 1280 px)', 'scale ' + m.s);
  check(m.logoW === m.natW * m.s, 'the wordmark has square pixels at the same scale', `${m.logoW} = ${m.natW} × ${m.s}`);
  check(m.left === 0 && m.width === m.clientW && m.scrollW <= m.clientW, 'the scene spans the window without a sideways scrollbar', JSON.stringify([m.left, m.width, m.clientW, m.scrollW]));
  check(Math.abs(m.top - m.barBottom) < 1, 'the scene starts right under the top bar', `${m.top} vs ${m.barBottom}`);
  check(m.frameW >= m.width && Number.isInteger(m.frameLeft), 'the scene covers the width and sits on a whole pixel', JSON.stringify([m.frameLeft, m.frameW]));
  check(m.height <= m.vh * 0.72 + 1, 'the scene leaves room for the menu below', `${m.height} of ${m.vh}`);
  const y1 = await sparkY(page); await sleep(500); const y2 = await sparkY(page);
  check(y1.some((y, i) => y !== y2[i]), 'sparks rise from the wordmark', JSON.stringify([y1, y2]));
  check(y2.every(y => Math.abs(y / m.s - Math.round(y / m.s)) < 1e-6), 'sparks move in whole art pixels', JSON.stringify(y2));
  // a re-render (changing a setting rebuilds the start screen) keeps the sparks where they were
  const before = await sparkY(page);
  await page.evaluate(() => window.__ZG.go('title')); await sleep(20);
  const after = await sparkY(page);
  const jumps = before.filter((y, i) => Math.abs(after[i] - y) > m.s * 4 && Math.abs(after[i]) > m.s * 2).length;
  check(jumps <= 1, 'rebuilding the start screen does not restart the animation', JSON.stringify([before, after]));
  await shot('title-01-desktop');
  // an odd window width still lands every art pixel on a whole screen pixel
  await page.setViewport({ width: 1279, height: 760 }); await sleep(250);
  m = await measure(page);
  check(Number.isInteger(m.frameLeft) && m.left === 0 && m.width === m.clientW, 'at an odd width the scene still sits on a whole pixel', JSON.stringify([m.frameLeft, m.left, m.width]));
  await page.setViewport({ width: 1920, height: 1080 }); await sleep(250);
  m = await measure(page);
  check(m.s === 4 && m.width === 1920, 'a 1920 px window uses 4×', 'scale ' + m.s);
  check(errors.length === 0, 'no page or console errors on desktop', errors.join(' | '));
  await ctx.browser.close();

  // reduced motion: a still picture
  ctx = await openGame({ width: 1100, height: 800 });
  ({ page, errors } = ctx);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await sleep(100);
  const still = await page.evaluate(() => ({ logo: getComputedStyle(document.querySelector('.ts-logo')).animationName,
    clouds: getComputedStyle(document.querySelector('.ts-clouds')).animationName, sparks: getComputedStyle(document.querySelector('.ts-spark')).display }));
  check(still.logo === 'none' && still.clouds === 'none' && still.sparks === 'none', 'with reduced motion nothing moves', JSON.stringify(still));
  await ctx.browser.close();

  // phone
  ctx = await openGame({ phone: true });
  ({ page, errors, shot } = ctx);
  await page.evaluate(() => { localStorage.setItem('zg-mobile', '1'); }); await page.reload(); await page.waitForFunction(() => !!window.__ZG); await sleep(400);
  m = await measure(page);
  check(m.s === 2 && Math.abs(m.left - m.appLeft) < 1 && Math.abs(m.width - m.appW) < 1, 'on a phone the scene fills the column at 2×', JSON.stringify([m.s, m.left, m.width, m.appW]));
  check(m.logoW <= m.width - 8, 'on a phone the wordmark fits the screen', `${m.logoW} of ${m.width}`);
  check(m.scrollW <= m.clientW, 'no sideways scrolling on a phone', `${m.scrollW} vs ${m.clientW}`);
  await shot('title-02-phone');
  check(errors.length === 0, 'no page or console errors on a phone', errors.join(' | '));
  return ctx;
});
