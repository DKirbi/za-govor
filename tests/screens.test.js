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

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
  return ctx;
});
