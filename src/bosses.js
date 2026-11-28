
// ============================================================ bosses: health bars and timed letter-wheel events
// Game Director, 24 Nov 2026 (docs/progression-design.md §12), built on 28 Nov 2026 ("implement bosses and minibosses
// (gods including) multiple healthbars and minigames"):
// - the mini-bosses (the gods as challengers, Povodni mož) have two health bars, the Lintvern three;
// - the letter mesh takes a boss to the middle of a bar; there a timed event starts on the letter wheel (Kolo črk,
//   about a minute) and its words take the rest of that bar. Damage outside the event stops at the middle, so one big
//   word cannot skip an event (PROPOSED on 24 Nov, built);
// - while an event lasts, the boss hits every hero about every 15 s (Mirni način: after every 3 words sent), and the
//   other enemies wait; if time runs out, the rest of that bar is fought on the mesh and the next event still waits
//   at the middle of the next bar (PROPOSED, built); the last event lands the last blow;
// - each event's key word is one part of the boss's theme (POVODNI + MOŽ; ZMAJ, OGENJ, GRAD; a god's two words).
// The Volkodlak stays an ordinary enemy for now (OPEN in §12).
// hit: the blow of Povodni mož and the Lintvern on every hero, × their attack (PROPOSED from the simulator, 28 Nov:
// 0.5 made the Lintvern a first-try win on Malček only a third of the time, 0.3 about half; a god strikes with their special)
const BOSS_EVENT = { sec: 60, every: 15, calmEvery: 3, hit: 0.3 };
const BOSS_KEYS = { povodni: ['povodni', 'mož'], lintvern: ['zmaj', 'ogenj', 'grad'], perun: ['strela', 'nevihta'], svarog: ['jeklo', 'kovač'],
  mokos: ['zemlja', 'vreteno'], veles: ['medved', 'živina'], dazbog: ['zarja', 'sonce'], stribog: ['veter', 'burja'] };
const BOSS_EVENT_NAME = { povodni: 'Vrtinec', lintvern: 'Ognjeni vihar' };   // a god's event is named after their third skill
const evName = e => e.god ? CHARS.find(c => c.id === e.god).moves[2] : BOSS_EVENT_NAME[e.key] || 'Dvoboj';
const barSize = e => e.maxHp / (e.bars || 1);
const evMid = (e, i) => Math.round(e.maxHp - (i + 0.5) * barSize(e));    // where event i starts
const evEnd = (e, i) => Math.max(0, Math.round(e.maxHp - (i + 1) * barSize(e)));   // where its bar ends
const inBossEvent = e => !!(B && B.cw && B.cw.kind === 'boss' && B.cw.enemy === e);
// the lowest health that damage outside an event may leave: the middle of the next event's bar
const bossFloor = e => e.bars > 1 && (e.evDone || 0) < e.bars ? evMid(e, e.evDone || 0) : 0;

// called by damageEnemy (src/game.js) for a boss with bars: how much of `a` lands
function bossClamp(e, a, opts) {
  const C = B.cw;
  if (opts.event && inBossEvent(e)) return Math.max(0, Math.min(a, e.hp - evEnd(e, C.evI)));
  const floor = inBossEvent(e) ? e.hp : bossFloor(e);   // during its event only the event's words hurt it
  const d = Math.max(0, Math.min(a, e.hp - floor));
  if (!inBossEvent(e) && floor > 0 && e.hp - d <= floor && !e.eventDue) {
    e.eventDue = true; const b = B;
    later(() => { if (B === b) bossEventMaybe(); }, 500);
  }
  return d;
}
// an event waits while another crossword (the zagovor, a lock) is open, and starts when it closes
function bossEventMaybe() {
  if (!B || B.over || B.cw || S.screen !== 'battle') return;
  const e = B.enemies.find(x => x.hp > 0 && x.eventDue);
  if (e) openBossEvent(e);
}
function openBossEvent(e) {
  const i = e.evDone || 0, id = e.god || e.key, keys = BOSS_KEYS[id] || [], key = keys[i] || keys[keys.length - 1];
  e.eventDue = false;
  const L = { ...WL(), count: Math.max(4, WL().count - 1) };
  const D = makeWheel(null, L, { keys: key ? [key] : [], title: `${evName(e)} · ${i + 1}/${e.bars}` });
  if (!D) { e.evDone = i + 1; return; }   // no wheel could be made: the bar is fought on the mesh
  openCrossword('boss', id, { enemy: e, D, boss: { evI: i, share: evMid(e, i) - evEnd(e, i), letters: D.entries.reduce((s, x) => s + [...x.answer].length, 0), hitT: 0, sent: 0 } });
  spawnCard(e.el, { tier: 3, foe: true, name: e.name, move: evName(e), extra: `${i + 1}. od ${e.bars}: sestavi besede, preden te premaga`, portrait: e.name[0] });
  log(`${e.name}: ${evName(e)}! ${S.mode === 'real' ? 'Minuta časa: vsakih 15 sekund udari vso družino.' : 'Na vsake tri besede udari vso družino.'} Besede s kolesa mu vzamejo preostanek ${i + 1}. vrstice zdravja.`);
  sfx('bad', { rate: .7 });
}
// a word of the event: its share of the half bar, by its letters (half with a revealed letter)
function bossWordHit(C, x, aided) {
  const e = C.enemy; if (!e || e.hp <= 0) return 0;
  const d = Math.max(1, Math.round(C.share * [...x.answer].length / C.letters * (aided ? 0.5 : 1)));
  return damageEnemy(e, d, { event: true });
}
// the boss strikes during its event: a god with their special, the others with a blow on every hero
function bossEventHit(e) {
  if (!e || e.hp <= 0 || !B || B.over) return;
  e.atkT = performance.now(); e.atkTier = 3;
  if (e.god) godSpecial(e);
  else {
    const d = hurtEach(living().map(() => Math.round(e.atk * BOSS_EVENT.hit)), e);
    spawnCard(e.el, { tier: 3, foe: true, name: e.name, move: evName(e), value: d ? `−${d} vsem` : 'ščit ujame', portrait: e.name[0] });
    log(d ? `${e.name}: ${evName(e)} (−${d} vsem).` : `${e.name}: ${evName(e)} — ščit ujame udarec.`);
  }
  renderEnemies(); renderPartyHp(); if (B.cw) wheelPaint();
}
function bossEventTick(dt) {   // real time (battleTick)
  const C = B.cw; if (!C || C.kind !== 'boss') return;
  C.hitT += dt;
  if (C.hitT >= BOSS_EVENT.every) { C.hitT = 0; bossEventHit(C.enemy); }
  C.stripAcc = (C.stripAcc || 0) + dt;
  if (B.cw === C && C.stripAcc >= 0.25) { C.stripAcc = 0; bossStrip(); }   // four times a second is enough for seconds
}
function bossEventSent() {   // Mirni način: every third word sent (src/wheel.js)
  const C = B.cw; if (!C || C.kind !== 'boss' || S.mode === 'real') return;
  if (++C.sent % BOSS_EVENT.calmEvery === 0) bossEventHit(C.enemy);
}
// the end of an event: won (the bar's end and the last blow) or out of time (the rest goes back to the mesh)
function bossEventDone(C, won) {
  const e = C.enemy; if (!e) return;
  e.evDone = Math.max(e.evDone || 0, C.evI + 1);
  if (won && e.hp > 0) { const rest = e.hp - evEnd(e, C.evI); if (rest > 0) damageEnemy(e, rest, { event: true, last: true }); }
  if (e.hp > 0) {
    spawnCard(leadEl(), { tier: 3, c: 'var(--gold)', name: 'Družina', move: won ? `${evName(e)} premagan` : `${evName(e)} mine`, extra: won ? `${C.evI + 1}. vrstica zdravja je padla` : 'preostanek vrstice na mreži', portrait: '✶' });
    log(won ? `${evName(e)} premagan: ${e.name} izgubi ${C.evI + 1}. vrstico zdravja.` : `Čas je potekel: preostanek ${C.evI + 1}. vrstice zdravja ${e.f ? 'ji' : 'mu'} vzameš na mreži.`);
    if (e.phase2 && !e.phase2on && e.hp / e.maxHp <= e.phase2.at) enterPhase2(e);   // the Lintvern enrages after the event, not in it
    e.charge = Math.min(e.charge, 0.3);   // a breath before the mesh's fight goes on
  }
  renderEnemies(); checkEnd();
}
// the health bar of a boss: one segment per bar, a mark where the next event starts. It drains as one bar, from the
// right: the first bar to fall is the rightmost, the full ones stay on the left (Game Director, 28 Nov 2026)
function bossBar(e, width) {
  const n = e.bars, size = barSize(e);
  return h('div', { class: 'hpbar bossbar', style: { width, '--n': n } }, Array.from({ length: n }, (_, p) => {
    const j = n - 1 - p, low = e.maxHp - (j + 1) * size, fill = clamp((e.hp - low) / size, 0, 1);   // p: place from the left, j: the bar
    return h('span', { class: 'seg' + (fill <= 0 ? ' gone' : ''), 'data-bar': j }, h('i', { style: { width: (100 * fill) + '%' } }),
      j >= (e.evDone || 0) ? h('b', { class: 'evmark', title: 'tu se začne preizkušnja' }) : null);
  }));
}
// over the wheel during an event: the boss's bars, the time, the next blow and the party's health
function bossStrip() {
  const C = B.cw, el = UI.bossStrip; if (!C || !el) return;
  const e = C.enemy;
  el.innerHTML = '';
  el.append(h('div', { class: 'bsrow' }, h('b', {}, e.name), bossBar(e, '100%'), h('span', { class: 'hpnum' }, `${e.hp}/${e.maxHp}`)),
    h('div', { class: 'bsrow' }, S.mode === 'real'
      ? [h('span', { class: 'bst' }, `${Math.max(0, Math.ceil(C.timer))} s`), h('div', { class: 'bstime' }, h('i', { style: { width: clamp(100 * C.timer / C.timerMax, 0, 100) + '%' } })),
        h('span', { class: 'bsnext', title: 'do naslednjega udarca' }, `udarec čez ${Math.max(0, Math.ceil(BOSS_EVENT.every - C.hitT))} s`)]
      : h('span', { class: 'bsnext' }, `udarec čez ${BOSS_EVENT.calmEvery - C.sent % BOSS_EVENT.calmEvery} ${BOSS_EVENT.calmEvery - C.sent % BOSS_EVENT.calmEvery === 1 ? 'besedo' : 'besede'}`)),
    h('div', { class: 'bsparty' }, HEROES.map((hr, k) => { const st = S.heroes[k];
      return h('span', { class: 'bsh' + (st.down ? ' down' : ''), style: { '--c': ownC(k) } }, h('b', {}, hr.name.split(' ').pop()), h('i', {}, h('u', { style: { width: (100 * st.hp / Math.max(1, st.maxHp)) + '%' } }))); })));
}
