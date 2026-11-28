// Bosses' health bars and timed letter-wheel events (src/bosses.js; docs/progression-design.md §12).
// Game Director, 24 Nov 2026, built 28 Nov 2026: mini-bosses (the gods, Povodni mož) have two health bars, the
// Lintvern three; the mesh takes a boss to the middle of a bar, a timed event on the letter wheel takes the rest;
// while it lasts the boss hits every hero every 15 s (Mirni način: every 3 words), the other enemies wait.
const { openGame, runner, sleep } = require('./harness');
const { check, run } = runner('Bosses: health bars and letter-wheel events');

run(async () => {
  const ctx = await openGame({ phone: true });
  const { page, errors } = ctx;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const boss = async (region, key, mode = 'real') => ev((region, key, mode) => {
    const Z = window.__ZG; Z.S.tutOn = false; Z.S.mode = mode; Z.S.know = 'malcek'; Z.newRun('krpan'); Z.setParty(['krpan', 'kresnik', 'matjaz']);
    Z.enterRegion(Z.WORLD.regions.findIndex(r => r.id === region)); Z.stopBattle(Z.S.run.stops.find(s => s.kind === 'boss'));
    const e = Z.B.enemies.find(x => x.key === key); return { bars: e.bars, max: e.maxHp, others: Z.B.enemies.filter(x => x !== e).map(x => x.key) };
  }, region, key, mode);
  const solveAll = () => ev(() => { const Z = window.__ZG, C = Z.B.cw;
    C.D.entries.forEach((x, k) => { if (Z.B.cw !== C || C.solved.has(k)) return; C.sel = []; const used = [];
      [...x.answer.toLowerCase()].forEach(ch => { const i = C.D.letters.findIndex((y, j) => y === ch && !used.includes(j)); used.push(i); C.sel.push(i); }); Z.wheelSubmit(); }); });
  const solveOne = () => ev(() => { const Z = window.__ZG, C = Z.B.cw, k = C.D.entries.findIndex((x, k) => !C.solved.has(k) && !x.main), x = C.D.entries[k]; C.sel = []; const used = [];
    [...x.answer.toLowerCase()].forEach(ch => { const i = C.D.letters.findIndex((y, j) => y === ch && !used.includes(j)); used.push(i); C.sel.push(i); }); Z.wheelSubmit(); return [...x.answer].length; });

  // how many bars
  const bars = await ev(() => { const Z = window.__ZG; return { povodni: Z.ENEMIES.povodni.bars, lintvern: Z.ENEMIES.lintvern.bars, perun: Z.ENEMIES[Z.godFoe('perun')].bars, stribog: Z.ENEMIES[Z.godFoe('stribog')].bars, volkodlak: Z.ENEMIES.volkodlak.bars || 1 }; });
  check(bars.povodni === 2 && bars.lintvern === 3 && bars.perun === 2 && bars.stribog === 2 && bars.volkodlak === 1, 'Povodni mož and the gods have two health bars, the Lintvern three; the Volkodlak stays ordinary', JSON.stringify(bars));

  // Povodni mož: the mesh stops at the middle of the first bar, and the event opens there
  const p = await boss('reka', 'povodni');
  const hit = await ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'povodni'); Z.B.enemies.forEach(x => { if (x !== e) x.charge = 0; });
    const d = Z.damageEnemy(e, 9999); return { d, hp: e.hp, mid: Z.evMid(e, 0), seg: document.querySelectorAll('.enemies .bossbar .seg').length, marks: document.querySelectorAll('.enemies .bossbar .evmark').length, fills: [...document.querySelectorAll('.enemies .bossbar .seg i')].map(i => Math.round(parseFloat(i.style.width))) }; });
  check(hit.hp === hit.mid && hit.d === p.max - hit.mid && hit.seg === 2 && hit.marks === 2 && hit.fills.join() === '100,50', 'one huge blow on the mesh stops at the middle of the first bar; the bar shows two segments, draining from the right (full on the left, half on the right), and where each event starts', JSON.stringify({ ...hit, max: p.max }));
  await sleep(900);
  const E = await ev(() => { const Z = window.__ZG, C = Z.B.cw; return C && { kind: C.kind, style: C.D.style, title: C.D.title, key: (C.D.entries.find(x => x.main) || {}).answer, timer: Math.round(C.timer), strip: !!document.querySelector('.bossstrip'), x: !!document.querySelector('.whead .wx'), share: C.share }; });
  check(E && E.kind === 'boss' && E.style === 'wheel' && E.title === 'Vrtinec · 1/2' && E.key === 'POVODNI' && E.timer === 60 && E.strip && !E.x,
    'there the event opens: Vrtinec 1/2 on the letter wheel, POVODNI in the grid, a minute, the boss\'s and party\'s bars over it, no way to cancel it', JSON.stringify(E));
  const w1 = await ev(() => { const Z = window.__ZG, e = Z.B.cw.enemy; return e.hp; });
  const len = await solveOne();
  const w2 = await ev(() => ({ hp: window.__ZG.B.cw.enemy.hp }));
  check(w2.hp < w1, 'a word of the event takes its share of the half bar', JSON.stringify({ before: w1, after: w2.hp, len }));
  const burn = await ev(() => { const Z = window.__ZG, e = Z.B.cw.enemy, hp = e.hp; Z.damageEnemy(e, 50); return { before: hp, after: e.hp }; });
  check(burn.before === burn.after, 'during the event only its own words hurt the boss (a burn or another blow does nothing)', JSON.stringify(burn));
  // fifteen seconds: a blow on every hero; the vile wait
  const blow = await ev(() => { const Z = window.__ZG, hp = Z.HEROES.map((_, k) => Z.S.heroes[k].hp), vile = Z.B.enemies.filter(x => x.key === 'vila').map(x => x.charge);
    for (let i = 0; i < 152; i++) Z.battleTick(0.1);
    return { before: hp, after: Z.HEROES.map((_, k) => Z.S.heroes[k].hp), vile0: vile, vile1: Z.B.enemies.filter(x => x.key === 'vila').map(x => x.charge), open: !!Z.B.cw }; });
  check(blow.after.every((h, k) => h < blow.before[k]) && blow.vile1.join() === blow.vile0.join() && blow.open, 'after 15 seconds Povodni mož hits every hero; the vile wait while the event lasts', JSON.stringify(blow));
  // the time runs out: the rest of the bar goes back to the mesh, the next event waits at the middle of the second bar
  const out = await ev(() => { const Z = window.__ZG, e = Z.B.cw.enemy; for (let i = 0; i < 460 && Z.B.cw; i++) Z.battleTick(0.1);
    const hp = e.hp; Z.damageEnemy(e, 9999); return { open: !!Z.B.cw, evDone: e.evDone, before: hp, after: e.hp, mid2: Z.evMid(e, 1), end1: Z.evEnd(e, 0) }; });
  check(!out.open && out.evDone === 1 && out.before > out.end1 && out.after === out.mid2, 'when the minute runs out the event closes; the mesh takes the rest of the first bar and stops at the middle of the second', JSON.stringify(out));
  await sleep(900);
  const two = await ev(() => { const Z = window.__ZG, C = Z.B.cw; return C && { title: C.D.title, key: (C.D.entries.find(x => x.main) || {}).answer }; });
  check(two && two.title === 'Vrtinec · 2/2' && two.key === 'MOŽ', 'the second event: Vrtinec 2/2 with MOŽ', JSON.stringify(two));
  await ev(() => { window.__ZG.B.enemies.forEach(x => { if (x.key === 'vila') x.hp = 0; }); });
  await solveAll(); await sleep(300);
  const won = await ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'povodni'); return { hp: e.hp, open: !!Z.B.cw }; });
  check(won.hp === 0 && !won.open, 'the last word of the last event lands the last blow', JSON.stringify(won));

  // Mirni način: a blow after every third word sent
  await boss('reka', 'povodni', 'calm');
  await ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'povodni'); Z.damageEnemy(e, 9999); }); await sleep(900);
  const calm = await ev(() => { const Z = window.__ZG, C = Z.B.cw, hp = () => Z.HEROES.map((_, k) => Z.S.heroes[k].hp).join(), a = hp(), send = s => { C.sel = s; Z.wheelSubmit(); };
    send([0, 1]); const b = hp(); send([1, 0]); const c = hp(); send([0, 2]); return { a, b, c, d: hp(), timer: C.timer }; });
  check(calm.a === calm.b && calm.b === calm.c && calm.d !== calm.c && calm.timer == null, 'Mirni način: no clock; the boss strikes after every third word sent', JSON.stringify(calm));

  // the zagovor open at the threshold: the event waits for it
  await boss('reka', 'povodni');
  const wait = await ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'povodni'); Z.B.meter = 30; Z.openCrossword('finisher', 'perun'); Z.damageEnemy(e, 9999); return { kind: Z.B.cw.kind, due: e.eventDue }; });
  await sleep(900);
  const still = await ev(() => window.__ZG.B.cw.kind);
  await ev(() => window.__ZG.closeCrossword());
  await sleep(900);
  const after = await ev(() => window.__ZG.B.cw && window.__ZG.B.cw.kind);
  check(wait.kind === 'finisher' && wait.due && still === 'finisher' && after === 'boss', 'when the zagovor is open at the threshold, the event waits and opens as the zagovor closes', JSON.stringify({ wait, still, after }));

  // the Lintvern: three events, the second phase after the second event, not inside it
  await boss('grad', 'lintvern');
  const L = await ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'lintvern'); return { mids: [0, 1, 2].map(i => Z.evMid(e, i)), max: e.maxHp, at: e.phase2.at }; });
  check(Math.abs(L.mids[0] - L.max * 5 / 6) <= 1 && Math.abs(L.mids[1] - L.max / 2) <= 1 && Math.abs(L.mids[2] - L.max / 6) <= 1, 'the Lintvern\'s three events start at 5/6, 1/2 and 1/6 of his health', JSON.stringify(L));
  const ph = await ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'lintvern'); Z.B.enemies.forEach(x => { if (x !== e) x.hp = 0; }); e.maxHp = 250; e.evDone = 1; e.hp = Z.evEnd(e, 0); Z.damageEnemy(e, 9999); return { hp: e.hp, mid: Z.evMid(e, 1), phase: e.phase2on }; });   // 250: the event starts at exactly half
  await sleep(900);
  const inEv = await ev(() => { const Z = window.__ZG, C = Z.B.cw; return { kind: C && C.kind, title: C && C.D.title, phase: C.enemy.phase2on }; });
  const solvedL = await (async () => { await solveAll(); await sleep(300); return ev(() => { const Z = window.__ZG, e = Z.B.enemies.find(x => x.key === 'lintvern'); return { hp: e.hp, end2: Z.evEnd(e, 1), phase: e.phase2on }; }); })();
  check(ph.hp === ph.mid && !ph.phase && inEv.kind === 'boss' && inEv.title === 'Ognjeni vihar · 2/3' && !inEv.phase && solvedL.hp === solvedL.end2 && solvedL.phase,
    'the Lintvern enrages after his second event (Ognjeni vihar 2/3), not during it; Zmajeva uganka is gone', JSON.stringify({ ph, inEv, solvedL }));

  // a god: two events, named after the god's third skill, the god's special as the blow
  const g = await ev(() => { const Z = window.__ZG; Z.newRun('krpan'); Z.setParty(['krpan', 'kresnik', 'matjaz']); Z.S.mode = 'real'; Z.challengeBattle('perun', {});
    const e = Z.B.enemies[0]; Z.damageEnemy(e, 9999); return { bars: e.bars, hp: e.hp, mid: Z.evMid(e, 0) }; });
  await sleep(900);
  const gE = await ev(() => { const Z = window.__ZG, C = Z.B.cw; const hp = Z.HEROES.map((_, k) => Z.S.heroes[k].hp); for (let i = 0; i < 152; i++) Z.battleTick(0.1);
    return { title: C && C.D.title, key: (C.D.entries.find(x => x.main) || {}).answer, hurt: Z.HEROES.every((_, k) => Z.S.heroes[k].hp < hp[k]) }; });
  check(g.bars === 2 && g.hp === g.mid && gE.title === 'Nevihta · 1/2' && gE.key === 'STRELA' && gE.hurt, 'Perun\'s challenge: two bars, his first event is Nevihta with STRELA, and his chain of lightning strikes every 15 s', JSON.stringify({ g, gE }));

  check(errors.length === 0, 'no page or console errors', errors.join(' | '));
});
