// The hero picker and the hero's card (Game Director, 27 Nov 2026):
// - Kdo gre na pot? has no lead text; the chosen hero comes first, above the list, in one row: the sprite 40 %, the
//   details 60 %, on a desktop and on phones (360 and 412 px wide);
// - attacks and the hero's words are chips (no arrows); the special effects are plain words with an icon each;
// - every hero has a role (PLAYSTYLE), feminine for the heroines;
// - the hero's card shows only the name and the skills on its front, the name on the plate under the painting; the
//   rest (who the hero is) is on the back.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Hero picker and the hero card');

const ALL = ['krpan', 'jurij', 'kurent', 'matjaz', 'erazem', 'klepec', 'vida', 'ajda'];
async function openPick(page, id) {
  await page.evaluate(id => { const Z = window.__ZG; Z.go('newrun'); Z.go('pick');
    const names = [...document.querySelectorAll('button.pickcard b')].map(b => b.textContent);
    Z.S.pickSel = Math.max(0, names.indexOf(Z.CHARS.find(c => c.id === id).name)); Z.go('pick'); }, id);
  await sleep(150);
}
const layout = page => page.evaluate(() => {
  const r = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
  const info = r('.pickinfo'), sp = r('.pickinfo .spirit'), det = r('.pdet'), spr = r('.pickinfo .hero.spr'), grid = r('.pickgrid');
  return { lead: !!document.querySelector('.pick .lead'), infoFirst: !!(info && grid && info.bottom <= grid.top),
    share: sp && det ? sp.width / (sp.width + det.width) : 0, oneRow: !!(sp && det && Math.abs(sp.top - det.top) < 2 && sp.right <= det.left),
    sprIn: !!(spr && sp && spr.left >= sp.left - 1 && spr.right <= sp.right + 1), wide: document.documentElement.scrollWidth > innerWidth };
});
const details = page => page.evaluate(() => {
  const P = document.querySelector('.pdet'), secs = [...P.querySelectorAll('.psec')];
  const sec = re => secs.find(s => re.test(s.querySelector('h3').textContent));
  const fx = sec(/^Posebn/);
  return { name: P.querySelector('h2').textContent, role: P.querySelector('.rtag').textContent, roleIcon: !!P.querySelector('.rtag img.fxi'),
    hp: P.querySelector('.php').textContent, hpIcon: !!P.querySelector('.php img.fxi'), text: P.textContent,
    moves: [...sec(/^Napadi$/).querySelectorAll('.pchip')].map(c => c.textContent),
    fxLabel: fx ? fx.querySelector('h3').textContent : '', fx: fx ? [...fx.querySelectorAll('li')].map(li => ({ t: li.textContent, icon: !!li.querySelector('img.fxi') })) : [],
    wordsLabel: sec(/besede/).querySelector('h3').textContent, words: sec(/besede/).querySelectorAll('.pchip').length,
    cardRoles: [...document.querySelectorAll('button.pickcard')].map(b => (b.querySelector('.rtag') || {}).textContent) };
});

run(async () => {
  const ctx = await openGame({ width: 1280, height: 900 });
  const { page, errors, shot } = ctx;
  await page.evaluate(ids => localStorage.setItem('zg-unlocked', JSON.stringify(ids)), ALL);
  await page.reload(); await page.waitForFunction(() => !!window.__ZG); await page.evaluate(() => { window.__ZG.S.tutOn = false; }); await sleep(200);

  // desktop: one row, 40/60, the hero above the list, no lead text
  await openPick(page, 'krpan');
  let L = await layout(page);
  check(!L.lead && L.infoFirst, 'Kdo gre na pot? has no lead text, and the chosen hero comes before the list of heroes', JSON.stringify(L));
  check(L.oneRow && Math.abs(L.share - 0.4) < 0.03 && L.sprIn && !L.wide, 'on a desktop the sprite and the details share one row, 40 % and 60 %', L.share.toFixed(3));
  let D = await details(page);
  check(D.name === 'Martin Krpan' && D.moves.join() === 'Lipov kij,Kmečka moč,Mesarica' && !/→/.test(D.text), 'the attacks are chips, without arrows between them', D.moves.join());
  check(D.fxLabel === 'Posebni učinek' && D.fx.length === 1 && D.fx[0].t === 'nasprotnik krvavi' && D.fx[0].icon && !/Največji napad/.test(D.text),
    '"Največji napad" is now "Posebni učinek", in plain words with an icon', JSON.stringify(D.fx));
  check(D.role === 'Napadalec' && D.roleIcon && D.hp === '36' && D.hpIcon, 'Krpan is a Napadalec (role with its icon); his health has a heart', `${D.role} ${D.hp}`);
  check(D.wordsLabel === 'Njegove besede · ×1,5' && D.words === 5, 'his words are chips too', D.wordsLabel);
  check(D.cardRoles.length === ALL.length && D.cardRoles.every(Boolean), 'every hero in the list shows a role', D.cardRoles.join());
  await shot('picker-desktop');

  // more effects: a plural label; a heroine's role and words are feminine
  await openPick(page, 'erazem'); D = await details(page);
  check(D.fxLabel === 'Posebni učinki' && D.fx.length === 2 && D.fx.every(f => f.icon), 'two effects: "Posebni učinki", each with an icon', JSON.stringify(D.fx));
  await openPick(page, 'vida'); D = await details(page);
  check(D.role === 'Oviralka' && D.wordsLabel === 'Njene besede · ×1,5', 'Lepa Vida is an Oviralka with "Njene besede"', `${D.role} / ${D.wordsLabel}`);
  await openPick(page, 'ajda'); D = await details(page);
  check(D.role === 'Branilka', 'Ajdovska deklica is a Branilka', D.role);
  const roles = await page.evaluate(() => { const Z = window.__ZG; return Z.CHARS.map(c => [c.id, Z.PLAYSTYLE[c.id] && Z.ROLES[Z.PLAYSTYLE[c.id].role] ? 1 : 0, (Z.PLAYSTYLE[c.id] || { fx: [] }).fx.length]); });
  check(roles.every(([, ok, n]) => ok && n > 0), 'all fifteen characters, gods included, have a role and at least one effect', JSON.stringify(roles.filter(r => !r[1] || !r[2])));

  // the hero's card: the name on the plate under the painting, only the skills beside it; who the hero is on the back
  const card = async id => { await page.evaluate(id => window.__ZG.go('hero', { kind: 'codex', ids: [id], crumb: 'Nazaj na junake', next: () => {} }), id); await sleep(250);
    return page.evaluate(() => { const f = document.querySelector('.face.front'), svg = f.querySelector('svg').getBoundingClientRect(), b = f.querySelector('.plate b').getBoundingClientRect();
      const rear = document.querySelector('.face.rear');
      return { below: b.top >= svg.bottom - 0.5 && b.bottom <= f.getBoundingClientRect().bottom + 0.5, plate: [...f.querySelector('.plate').children].map(e => e.tagName + '.' + e.className).join(),
        pills: f.querySelectorAll('.mv em').length, sub: (rear.querySelector('.rsub') || {}).textContent }; }); };
  let C = await card('erazem');
  check(C.below && C.plate === 'B.,DIV.mv' && C.pills === 3, 'the card front: the name on the plate under the painting, then the three skills, nothing else', JSON.stringify(C));
  check(C.sub === 'vitez iz Predjame · meč, češnje, izmik', 'who the hero is moved to the back of the card', C.sub);
  await shot('picker-card-desktop');

  // phones: still one row, the sprite never cut, nothing wider than the screen; the card's name on its plate
  for (const [w, hgt] of [[360, 640], [412, 915]]) {
    await page.setViewport({ width: w, height: hgt, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.evaluate(() => { document.body.classList.add('mobile'); window.__ZG.S.mobile = true; }); await sleep(150);
    for (const id of ['krpan', 'ajda', 'matjaz']) {
      await openPick(page, id); L = await layout(page);
      check(L.oneRow && Math.abs(L.share - 0.4) < 0.04 && L.sprIn && !L.wide && !L.lead && L.infoFirst, `${w} px, ${id}: one row (${Math.round(L.share * 100)} / ${100 - Math.round(L.share * 100)}), the sprite whole, nothing off screen`, JSON.stringify(L));
    }
    await shot(`picker-phone-${w}`);
    C = await card('ajda');
    check(C.below && C.pills === 3, `${w} px: the card's name sits on the plate under the painting`, JSON.stringify(C));
  }
  // a hero tapped low in the list brings the chosen hero's details back into view
  await openPick(page, 'krpan');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await sleep(100);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button.pickcard')].find(x => x.querySelector('b').textContent === 'Ajdovska deklica'); b.click(); });
  await sleep(700);
  const seen = await page.evaluate(() => { const r = document.querySelector('.pickinfo').getBoundingClientRect(); return { top: Math.round(r.top), name: document.querySelector('.pdet h2').textContent }; });
  check(seen.name === 'Ajdovska deklica' && seen.top >= 0 && seen.top < 40, 'a hero tapped low in the list: the details scroll back into view at the top', JSON.stringify(seen));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
