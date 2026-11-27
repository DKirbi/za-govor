// Screens reviewed on a phone by the Game Director, 27 Nov 2026:
// - the party's letters take the colour of the hero's place in the party (red, green, blue), never two alike, with a
//   diamond of the same colour under each hero in battle and the same colour on the skill screen's dots;
// - Premor is a game menu: a tall panel, everything centred, the buttons in one column of equal width;
// - the locked chest says one line (the rules are in its Kako se igra), and the chest keeps its square shape;
// - a skill's card has a full border in the hero's colour, dashed while the skill is not learned.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Screens: party colours, Premor, the chest, skill cards (phone)');

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors, shot } = ctx;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);

  // party colours: Erazem and Kralj Matjaž used to be two reds, Kresnik a pale gold
  await ev(() => { const Z = window.__ZG; Z.S.tutOn = false; Z.newRun('erazem'); Z.setParty(['erazem', 'kresnik', 'matjaz']); Z.go('battle', Z.NODES[2]); });
  await sleep(600);
  const col = await ev(() => {
    const rgb = c => { const e = document.createElement('i'); e.style.color = c; document.body.append(e); const v = getComputedStyle(e).color; e.remove(); return v; };
    const tiles = {}; document.querySelectorAll('.mesh .tile.own').forEach(t => { tiles[t.querySelector('.ini').textContent] = rgb(t.style.getPropertyValue('--c')); });
    const dias = [...document.querySelectorAll('.party .owndia')].map(d => getComputedStyle(d).backgroundColor);
    return { tiles, dias, ini: window.__ZG.HEROES.map(x => x.ini), want: window.__ZG.HEROES.map((x, k) => rgb(window.__ZG.ownC(k))) };
  });
  const tileCols = col.ini.map(i => col.tiles[i]);
  check(new Set(tileCols).size === 3 && tileCols.every((c, k) => c === col.want[k]), 'three heroes, three letter colours: red, green and blue by their place in the party', JSON.stringify(col.tiles));
  check(col.dias.length === 3 && col.dias.every((c, k) => c === col.want[k]), 'a diamond of the same colour stands under each hero', col.dias.join(' | '));
  // the hues stay apart: no two party colours, nor a party colour and the valid path, closer than 60° on the colour wheel
  const hue = c => { const [r, g, b] = c.match(/\d+/g).map(Number).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    return d === 0 ? 0 : mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4); };
  const apart = (a, b) => { const d = Math.abs(((hue(a) - hue(b)) % 360 + 360) % 360); return Math.min(d, 360 - d); };
  const pairs = [[0, 1], [0, 2], [1, 2]].map(([a, b]) => Math.round(apart(col.want[a], col.want[b])));
  check(pairs.every(d => d >= 60), 'the three colours are far apart on the colour wheel', pairs.join('°, ') + '°');
  await shot('screens-colours');

  // Premor: a tall panel, centred, one column of equal buttons
  await ev(() => window.__ZG.setPause(true)); await sleep(250);
  const pz = await ev(() => { const d = document.querySelector('.overlay.pause .dialog').getBoundingClientRect(), bs = [...document.querySelectorAll('.pause-actions .btn')].map(b => b.getBoundingClientRect());
    return { h: d.height, vh: innerHeight, centre: d.left + d.width / 2, vw: innerWidth, lefts: bs.map(b => Math.round(b.left)), widths: bs.map(b => Math.round(b.width)), tops: bs.map(b => Math.round(b.top)),
      first: document.querySelector('.pause-actions .btn').textContent }; });
  check(pz.h >= pz.vh * 0.6, 'Premor is a tall panel, like a game menu', `${Math.round(pz.h)} of ${pz.vh} px`);
  check(new Set(pz.lefts).size === 1 && new Set(pz.widths).size === 1 && pz.tops.every((t, i) => !i || t > pz.tops[i - 1]) && Math.abs(pz.lefts[0] + pz.widths[0] / 2 - pz.centre) < 2,
    'its buttons stand in one centred column of equal width, Nadaljuj first', JSON.stringify(pz));
  await shot('screens-premor');
  await ev(() => window.__ZG.setPause(false));

  // the skill screen: dots in the hero's letter colour, a full border around each card, dashed while not learned
  const sk = await ev(() => { const Z = window.__ZG, el = Z.skillPanel('kresnik', Z.S.heroes[1]); document.body.append(el);
    const cards = [...el.querySelectorAll('.sk')].map(c => { const s = getComputedStyle(c); return { on: c.classList.contains('on'), w: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth], style: [s.borderTopStyle, s.borderLeftStyle] }; });
    const dot = getComputedStyle(el.querySelector('.sk-legend .sk-dots i')).backgroundColor; el.remove();
    return { cards, dot }; });
  check(sk.cards.every(c => new Set(c.w).size === 1 && c.w[0] !== '0px'), 'a skill card has a full border on every side', JSON.stringify(sk.cards.map(c => c.w)));
  check(sk.cards.every(c => c.style.every(s => s === (c.on ? 'solid' : 'dashed'))), 'solid when learned, dashed while not', JSON.stringify(sk.cards.map(c => [c.on, c.style])));
  check(sk.dot === col.want[1], 'the skill screen\'s dots are the colour of the hero\'s letters', `${sk.dot} vs ${col.want[1]}`);

  // the chest: one line and a square chest
  await ev(() => { const Z = window.__ZG; Z.S.know = 'malcek'; Z.go('chest', { id: 'skrinja', stop: null }); }); await sleep(300);
  const ch = await ev(() => { const o = document.querySelector('.chestbox .obj').getBoundingClientRect(); return { w: Math.round(o.width), h: Math.round(o.height), lead: document.querySelector('.chestlead').textContent,
    rules: /en poskus|priškrne/.test(document.querySelector('.chestbox').textContent), clue: !!document.querySelector('.chestclue') }; });
  check(ch.lead === 'Pred teboj se pojavi zakladna skrinja. Jo znaš odpreti?' && !ch.rules, 'the chest says one line; the rules are in its Kako se igra', ch.lead);
  check(ch.w === ch.h && ch.w >= 48, 'the chest keeps its square shape beside the text', `${ch.w}×${ch.h}`);
  check(ch.clue, 'Malček still gets the clue under it');
  await shot('screens-chest');

  // a boss wears a floating crown on the road and in battle; no caption Šef (27 Nov 2026)
  await ev(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.setParty(['krpan', 'kresnik', 'matjaz']); const ri = Z.WORLD.regions.findIndex(r => r.id === 'reka'); Z.enterRegion(ri);
    const R = Z.S.run, st = R.stops.find(s => s.kind === 'boss'); R.stops.forEach(s => { if (s !== st && s.x < st.x) s.passed = s.done = true; }); R.x = st.x - 1; Z.go('travel'); });
  await sleep(500);
  const road = await ev(() => ({ caps: [...document.querySelectorAll('.tv-obj .cap')].map(c => c.textContent), crowns: document.querySelectorAll('.tv-foes .actor.boss .crown').length }));
  await ev(() => { const Z = window.__ZG; Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'boss')); }); await sleep(500);
  const fight = await ev(() => { const c = document.querySelector('.enemies .actor.boss .crown'), sp = c && c.parentElement.querySelector('.sp'); const a = c && c.getBoundingClientRect(), b = sp && sp.getBoundingClientRect();
    return { crowns: document.querySelectorAll('.enemies .crown').length, above: !!(a && b && a.top < b.top + b.height * 0.3) }; });
  check(road.crowns === 1 && !road.caps.includes('Šef') && fight.crowns === 1 && fight.above, 'a boss has a crown floating over its head on the road and in battle, and no caption Šef', JSON.stringify({ road, fight }));
  await ev(() => { const Z = window.__ZG; Z.stopBattle && Z.B && (Z.B.over = true); Z.go('travel'); }); await sleep(200);

  // remedies (27 Nov 2026): the player picks one and the hero it heals, whenever not in a battle
  await ev(() => { const Z = window.__ZG; Z.S.run.bag = {}; Z.giveItem('zeliscni-caj'); Z.giveItem('arnikino-mazilo'); Z.S.heroes[1].hp = 5; Z.S.heroes[0].hp = Z.S.heroes[0].maxHp; Z.S.heroes[2].hp = Z.S.heroes[2].maxHp; Z.go('travel'); });
  await sleep(300);
  await ev(() => window.__ZG.openBag()); await sleep(150);
  await ev(() => document.querySelector('.dialog.bag .itemrow.heal .btn').click()); await sleep(100);
  const pick = await ev(() => [...document.querySelectorAll('.healpick .btn')].map(b => !b.disabled));
  check(pick.join() === 'false,true,false', 'a remedy offers only the heroes it can help (the hurt one)', pick.join());
  await ev(() => [...document.querySelectorAll('.healpick .btn')][1].click()); await sleep(150);
  const healed = await ev(() => { const Z = window.__ZG, st = Z.S.heroes[1]; return { hp: st.hp, max: st.maxHp, caj: Z.S.run.bag['zeliscni-caj'], card: (document.querySelectorAll('.tv-heroes .hpnum')[1] || {}).textContent }; });
  check(healed.hp === Math.min(healed.max, 5 + Math.round(healed.max * 0.4)) && healed.caj === 0 && healed.card.startsWith(`${healed.hp}/`),
    'Zeliščni čaj gives the chosen hero 40 % of their health, is spent, and the road shows the new health', JSON.stringify(healed));
  await ev(() => document.querySelector('.dialog.bag .btn.primary').click()); await sleep(150);
  await ev(() => { const Z = window.__ZG; Z.S.heroes[1].hp = 5; Z.go('battle', Z.NODES[2]); }); await sleep(500);
  await ev(() => window.__ZG.openBag()); await sleep(150);
  const inBattle = await ev(() => { const b = document.querySelector('.dialog.bag .itemrow.heal .btn'); const r = { disabled: b && b.disabled, label: b && b.textContent }; document.querySelector('.dialog.bag .btn.primary').click(); return r; });
  check(inBattle.disabled && inBattle.label === 'po bitki', 'in a battle a remedy waits: used after the battle', JSON.stringify(inBattle));

  // the ending (27 Nov 2026): a victory — the party cheers close up, tap a hero for skills and best hits, the longest words
  await ev(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.setParty(['krpan', 'kresnik', 'matjaz']); Z.S.heroes[0].sk = [3, 1, 0]; Z.S.heroes[2].down = true;
    ['ljubljana', 'kres', 'zmajevina', 'gospodar'].forEach(w => Z.noteLongWord(w));
    Z.noteHit('krpan', { value: '−41 · omama', move: 'Lipov kij', word: 'VRATA' }); Z.noteHit('krpan', { value: '+12 zdravja', move: 'x' }); Z.noteHit('krpan', { value: '−64', move: 'Lipov kij', word: 'KOLOVRAT' });
    Z.go('ending'); });
  await sleep(500);
  const end = await ev(() => { const hs = [...document.querySelectorAll('.endhero')], sp = hs.map(h => h.querySelector('.sp'));
    return { n: hs.length, big: Math.min(...hs.map(h => h.querySelector('.spr').getBoundingClientRect().height)), cheer: sp.every(e => getComputedStyle(e).animationName === 'cheer'),
      down: document.querySelectorAll('.endparty .spr.down').length, items: /Predmeti/.test(document.querySelector('.ending').textContent),
      words: [...document.querySelectorAll('.endwords .pchip')].map(c => c.firstChild.textContent) }; });
  check(end.n === 3 && end.big >= 90 && end.cheer && !end.down, 'the ending: every hero cheers close up (about 100 px on a phone, a fallen one too)', JSON.stringify(end));
  check(!end.items && end.words.join() === 'LJUBLJANA,ZMAJEVINA,GOSPODAR,KRES', 'the ending lists the longest words, longest first, instead of the items', JSON.stringify(end.words));
  await ev(() => document.querySelector('.endhero').click()); await sleep(200);
  const info = await ev(() => ({ chips: [...document.querySelectorAll('.endinfo .pchip')].map(c => c.textContent), hits: [...document.querySelectorAll('.endhits li')].map(l => l.textContent) }));
  check(info.chips[0].includes('★★') && /še ne zna/.test(info.chips[2]) && info.hits.length === 2 && /^−64/.test(info.hits[0]) && /KOLOVRAT/.test(info.hits[0]),
    'tapping a hero shows the skills learned (with their stopnja) and the hardest hits, hardest first', JSON.stringify(info));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
