// Regenerate the screenshots in docs/images/ used by the README.
//   python3 build.py && npm run screenshots
const path = require('path');
const { openGame, sleep, deacc } = require('../tests/harness');

const IMG = path.resolve(__dirname, '../docs/images');
const save = (page, name, clip) => page.screenshot({ path: path.join(IMG, name), ...(clip ? { clip } : {}) });

(async () => {
  require('fs').mkdirSync(IMG, { recursive: true });

  // Desktop: title, battle with an attack card, gallery
  let ctx = await openGame({ width: 1280, height: 800 });
  let { page } = ctx;
  await save(page, 'title.png');
  await page.evaluate(() => { window.__ZG.S.mode = 'calm'; window.__ZG.go('battle', window.__ZG.NODES[2]); });
  await sleep(800);
  const w = await page.evaluate(() => [...window.__ZG.allWords().keys()].filter(w => w.length >= 6 && !/[čšž]/.test(w))[0]
    || [...window.__ZG.allWords().keys()].filter(w => !/[čšž]/.test(w)).sort((a, b) => b.length - a.length)[0]);
  for (const ch of deacc(w)) await page.keyboard.type(ch);
  await page.keyboard.press('Enter');
  await sleep(450);
  await save(page, 'battle-desktop.png');
  await page.evaluate(() => window.__ZG.go('gallery')); await sleep(800);
  await save(page, 'gallery.png');
  await ctx.browser.close();

  // Phone: battle with the send button, keyword crossword with one row solved
  ctx = await openGame({ phone: true });
  page = ctx.page;
  await page.evaluate(() => { window.__ZG.S.mode = 'calm'; window.__ZG.go('battle', window.__ZG.NODES[0]); });
  await sleep(700);
  const [, tiles] = await page.evaluate(() => [...window.__ZG.allWords().entries()].find(([w]) => w.length >= 5) || [...window.__ZG.allWords().entries()][0]);
  for (const i of tiles) {
    const [x, y] = await page.evaluate(k => { const r = document.querySelectorAll('.mesh .tile')[k].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, i);
    await page.touchscreen.tap(x, y); await sleep(40);
  }
  await sleep(200);
  await save(page, 'battle-phone.png');
  await page.evaluate(() => {
    const Z = window.__ZG; Z.go('battle', Z.NODES[2]);
    Z.B.enemies.forEach(e => { e.hp = e.maxHp = 400; });
    for (let i = 0; i < 60; i++) { Z.openCrossword('finisher', 'perun'); if (Z.B.cw.D.style === 'geslo') break; Z.B.cw = null; }
    document.querySelector('.nativein').focus();
  });
  await sleep(300);
  const row1 = await page.evaluate(() => window.__ZG.B.cw.D.entries[0].answer.toLowerCase());
  await page.keyboard.type(row1); await sleep(500);
  await page.evaluate(() => document.querySelector('.cwgridwrap').scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.scrollBy(0, -70));
  await sleep(200);
  await save(page, 'crossword-phone.png');
  await ctx.browser.close();
  console.log('screenshots written to', IMG);
})();
