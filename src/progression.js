
// ============================================================ reviewed heroes: own skill kits with ranks 1–3, XP from the fight
// The testing pass of docs/progression-design.md §4 for the six heroes with a reviewed character specification
// (docs/characters/<hero>/character.md): Ajdovska deklica, Erazem Predjamski, Kralj Matjaž, Kresnik, Kurent and Martin Krpan.
// Every other hero, god and enemy keeps the rules it had.
// - A word still fires skill 1, 2 or 3 by the number of the hero's own letters (firedTier). Skill points learn skills
//   2 and 3 and raise each learned skill to rank 3 (spendPoint, src/skills.js): eight points, as for everyone.
// - The rank values below replace TIER × RANK_POW, RANK_DUR and SKILL_UPS for these heroes; nothing generic is added.
// - Damage values are the base for a three-letter word at level 1. The word still multiplies them (length, šumnik,
//   repeats, relics and potions, the hero's own words, the hero's level), which is the heart of the game.
//   Healing, shields, bonuses, reductions, delays, durations and charges are exact.
// - `TEST` marks a value the specification leaves OPEN: a placeholder for this test, not a decision.
// - Kurent and Kresnik were rebalanced on 16 Nov from the simulations (`REBALANCE`): their old values carried a fresh
//   party (Kresnik) or nearly stopped enemies (Kurent's delays stacked), while their skills 2 and 3 dealt no damage, so
//   learning them made the hero weaker. Now a skill does at least as much as the one below it at the same rank.
// - Experience: every hero's attacks on an enemy and the damage dealt to it, plus its level, when it is beaten
//   (XP_RULE). Since balance E (20 Nov 2026) every hero gets their own share again, on a journey too (src/game.js addXp).
const REVIEWED = ['ajda', 'erazem', 'matjaz', 'kresnik', 'kurent', 'krpan'];
const isReviewed = id => REVIEWED.includes(id);

// rank values per skill (index 0 = skill 1); every array is [rank 1, rank 2, rank 3]
const RK = {
  kurent: [
    // delays never add up: an enemy's next attack moves back by the longest single delay only (delayFoe)
    { name: 'Ježevka', dmg: [4, 6, 8], delay: [2, 3, 4] },                              // REBALANCE (was 4/7/10, delay 1,5/2,5/3,5 s that stacked)
    { name: 'Zvonci', foes: [1, 2, 3], dmg: [3, 4, 5], weaken: [3, 4, 5], dance: 2 },  // name OPEN; Kurent dances 2 s, his letters out of the mesh;
                                                                                         // REBALANCE: the bells hit, and the weakening lasts until that enemy's next blow (was 2 s, no hit)
    { name: 'Pregon zime', dmg: [4, 6, 8], delay: [3, 4, 5], tags: ['duh', 'veter', 'mraz'] },   // REBALANCE: hits every enemy (was no damage, delay 3/4/4)
  ],
  matjaz: [
    { name: 'Meč', dmg: [6, 12, 18], ward: [0, 3, 6] },                                 // ward: less damage to each hero hit by the next enemy attack
    { name: 'Kraljeva vojska', bonus: [3, 6, 10], soften: [0, 0, 3], hits: 2 },         // bonus on every hero's next attack; rank 3: next two enemy hits −3
    { name: 'Prebujenje', heal: [3, 6, 6], revive: 0.15, ward: [3, 6, 6], dmg: [0, 0, 12] },
  ],
  kresnik: [
    { name: 'Ognjeni meč', dmg: [5, 7, 9], burn: [2, 3, 4], vsDragon: 1.5 },            // name OPEN; burn 2 a second for that many seconds; REBALANCE (was 8/12/16, burn 3/3/5 s)
    { name: 'Kresna strela', dmg: [10, 13, 16], chain: [0, 0, 6], burn: [3, 3, 3] },    // rank 3 jumps to the enemy beside the target; REBALANCE (was 12/16/18, chain 8)
    { name: 'Kresna moč', dmg: [5, 7, 9], charges: [1, 2, 3], back: [0.25, 0.5, 0.7], gold: 0.5 },   // name OPEN; a flame on every enemy, then the next
                                                                                         // 1/2/3 blows that hurt him are partly given back; REBALANCE (was no damage, one blow per use)
  ],
  krpan: [
    { name: 'Lipov kij', dmg: [10, 16, 20] },                                            // CONFIRMED (spec §3)
    // Game Director, 18 Nov: rank 1 two punches of 8, each a hit of its own; rank 2 the sacks, 20 on one target; rank 3 the boulder, 22 split
    // between up to two enemies (the target and the one beside it; one enemy takes all 22). Targeting of the punches (one enemy) is my reading.
    { name: 'Kmečka moč', dmg: [8, 20, 22], hits: [2, 1, 1], foes: [1, 1, 2] },
    { name: 'Mesarica', dmg: [10, 14, 20], bleed: [2, 3, 4] },                           // CONFIRMED (spec §3): bleed BURN_DPS a second for that many seconds
  ],
  erazem: [
    { name: 'Zamah z mečem', dmg: [7, 11, 15] },                                        // TEST damage
    { name: 'Češnje', dmg: [5, 7, 9], heal: [1, 2, 3] },                                // TEST damage and healing; heals the heroes beside him only
    { name: 'Skrivni rov', counter: [0, 1.5, 1.75] },                                   // rank 3: one hero beside him evades too
  ],
  ajda: [
    { name: 'Metanje skal', dmg: [6, 5, 8], all: [false, true, true] },                 // TEST damage; ranks 2–3 hit every enemy (count OPEN)
    { name: 'Varstvo popotnikov', charges: [1, 2, 3], share: 0.5 },                     // she takes the next n enemy attacks on the others, halved
    { name: 'Okamnitev', foes: [1, 2, 2], rounds: [1, 1, 2] },                          // a round = one enemy attack it misses
  ],
};
const BURN_DPS = 2;   // Kresnik's burn: 2 damage a second (one word per tick in calm mode)
// health per level: HP_GROW and HP_MIN_STEP in src/game.js (next to HERO_HP; the party is set up before this file runs)

// ------------------------------------------------------------ experience
// First test, kept as simple as possible: one XP per attack, one per point of damage, plus the enemy's level.
// An attack is every skill the hero fires at an enemy (its target), damage is what the hero took off that enemy
// (hits, burns, counterattacks). Only heroes still standing when the enemy falls get anything, as before.
const XP_RULE = { attack: 1, damage: 1, level: 1 };
const foeLevel = e => e.lvl || 1;   // the region's number on the journey (makeEnemy), 1 in practice battles
// Every hero's attacks and damage are counted on the enemy (balance D); since balance E each hero standing when it
// falls gets their own share (heroes of every kit, not only the reviewed ones).
function tallyOf(e, k) {
  const hr = HEROES[k]; if (!e || !hr) return null;
  e.tally = e.tally || {}; return e.tally[hr.id] || (e.tally[hr.id] = { a: 0, d: 0 });
}
function noteAttack(e, k) { const t = tallyOf(e, k); if (t) t.a++; }
function noteDamage(e, k, d) { const t = tallyOf(e, k); if (t) t.d += d; }
// one hero's share (k), or with k == null the whole party's: attacks + damage on this enemy + its level
function foeXp(e, k) {
  const ts = k == null ? Object.values(e.tally || {}) : [(e.tally && e.tally[HEROES[k].id]) || { a: 0, d: 0 }];
  const a = ts.reduce((s, t) => s + t.a, 0), d = ts.reduce((s, t) => s + t.d, 0), lv = foeLevel(e);
  return { n: Math.round(XP_RULE.attack * a + XP_RULE.damage * d + XP_RULE.level * lv), a, d, lv };
}
const xpParts = x => `napadi ${x.a} · škoda ${x.d} · raven ${x.lv}`;
// an enemy is beaten: hand out its experience, hero by hero, and say who got what (the log line after »Škrat je premagan: «)
function awardFoeXp(e) {
  if (!S.run) { gainXp(e.xp, null, true); return `vsak junak +${e.xp} XP`; }   // practice battles: as before
  const said = [];
  HEROES.forEach((hr, k) => {
    if (S.heroes[k].down) return;   // only heroes still standing when it falls
    const x = foeXp(e, k), w = B.xpWhy[hr.id] || (B.xpWhy[hr.id] = { n: 0, a: 0, d: 0, lv: 0 });
    w.n += x.n; w.a += x.a; w.d += x.d; w.lv += x.lv;
    if (B) B.stats.xp += x.n;
    addXp(k, x.n); said.push(`${hr.name} +${x.n}`);
  });
  return said.length ? `${said.join(', ')} XP` : 'nihče ne dobi XP';
}
// the result of a journey battle: each hero's experience with what it was made of
function xpRows() {
  const W = B && B.xpWhy;
  if (!S.run || !W) return null;
  const rows = HEROES.filter(hr => W[hr.id]);
  if (!rows.length) return null;
  return rows.flatMap(hr => { const w = W[hr.id]; return [h('div', {}, `Izkušnje: ${hr.name}`), h('div', {}, `${w.n} XP`, h('small', { class: 'xpwhy' }, ` (${xpParts(w)})`))]; });
}

// ------------------------------------------------------------ helpers
// Slovene number forms: 1 sovražnik, 2 sovražnika, 3–4 sovražniki, 5+ sovražnikov (and the verb with them)
const nForm = (n, f) => n === 1 ? f[0] : n === 2 ? f[1] : n < 5 ? f[2] : f[3];
const FOES_N = ['sovražnik', 'sovražnika', 'sovražniki', 'sovražnikov'], ATTACKS_ACC = ['napad', 'napada', 'napade', 'napadov'];
const v3 = (arr, r) => Array.isArray(arr) ? arr[clamp(r, 1, 3) - 1] : arr;
const hasTag = (e, tags) => !!(e.tags && e.tags.some(t => tags.includes(t)));
const isDragon = e => hasTag(e, ['zmaj', 'kaca']);
// push an enemy's next attack back by `sec` seconds (its charge runs at 1/speed a second; calm mode moves it the same share)
// Delays do not add up: until the enemy acts, a new delay only moves its attack by what it adds over the longest so far
// (enemyAct resets e.dlAmt). Kurent slows an enemy down; he cannot hold it still.
function delayFoe(e, sec) {
  if (!e || e.hp <= 0) return;
  if (e.unstoppable) sec *= 0.5;   // Lintvern: delays on him are halved
  const add = Math.max(0, sec - (e.dlAmt || 0)); e.charge -= add / e.speed; e.dlAmt = Math.max(e.dlAmt || 0, sec);
}
// the target first, then the enemies that hit hardest
function pickFoes(target, n) {
  const rest = B.enemies.filter(e => e.hp > 0 && e !== target).sort((p, q) => q.atk - p.atk);
  return (target && target.hp > 0 ? [target] : []).concat(rest).slice(0, n);
}
// the enemy beside the target (by place), for a chain
function foeBeside(target) {
  return B.enemies.filter(e => e.hp > 0 && e !== target).sort((p, q) => Math.abs(p.i - target.i) - Math.abs(q.i - target.i))[0] || null;
}
// the heroes beside hero k in the party's order, still standing
const heroesBeside = k => [k - 1, k + 1].filter(j => j >= 0 && j < HEROES.length && !S.heroes[j].down);
function fixedBurn(e, sec, k, label = 'gori') {   // Kresnik's fire and Krpan's bleed (label 'krvavi'): 2 a second, not scaled by the word
  if (!e || e.hp <= 0) return;
  e.dot = label;
  if (S.mode === 'real') { e.burn = { dps: BURN_DPS, until: B.time + sec + 0.1, by: k }; e.burnAcc = 0; }   // +0.1 s so the last tick lands
  else { e.burnTurns = sec; e.burnPer = BURN_DPS; e.burnBy = k; }
}
// Kraljeva vojska: the bonus waits for each hero's next attack (their first hit on the target)
function rallyBonus(k, primary) {
  if (!primary || !B.rally || !B.rally[k]) return 0;
  const b = B.rally[k]; delete B.rally[k]; return b;
}
function healHero(k, n) {   // reviewed heroes heal to full health at most (the 70 % cap is Mokoš's and Zeleni Jurij's)
  const st = S.heroes[k]; if (!st || st.down) return 0;
  const g = Math.max(0, Math.min(n, st.maxHp - st.hp)); st.hp += g;
  if (g && UI.heroEls && UI.heroEls[k]) floatOn(UI.heroEls[k], `+${g}`, 'heal');
  return g;
}
const busy = k => !!(B && B.busy && B.busy[k] > B.time);   // Kurent dancing: out of the letter mesh, still hurt by blows

// ------------------------------------------------------------ the skills
// a: the hero's action from resolveWord (k, tier, rank, power), target: the enemy aimed at, card: the skill card to fill
function reviewedAct(a, target, card) {
  const k = a.k, id = HEROES[k].id, r = Math.max(1, a.rank || 1), R = RK[id][a.tier - 1], p = a.power;
  const alive = () => B.enemies.filter(e => e.hp > 0);
  const hit = (base, e = target) => e && e.hp > 0 ? damageEnemy(e, base * p + rallyBonus(k, e === target), { crit: a.crit, by: k }) : 0;
  B.rally = B.rally || {}; B.busy = B.busy || {}; B.restore = B.restore || {};
  noteAttack(target, k);
  const say = [];
  switch (`${id}${a.tier}`) {
    // Kurent
    case 'kurent1': { const d = hit(v3(R.dmg, r)), s = v3(R.delay, r); delayFoe(target, s); say.push(`−${d}`, `napad pozneje ${num(s)} s`); break; }
    case 'kurent2': {
      B.busy[k] = B.time + R.dance;
      const n = v3(R.weaken, r), foes = pickFoes(target, v3(R.foes, r)); let d = 0;
      foes.forEach(e => { d = Math.max(d, hit(v3(R.dmg, r), e)); if (e.hp > 0) e.weak = { by: n }; });   // until its next blow
      say.push(`−${d}${foes.length > 1 ? ' vsakemu' : ''}`, `naslednji udarec −${n}`, foes.length > 1 ? `${foes.length} ${nForm(foes.length, FOES_N)}` : 'cilj'); card.extra = `Kurent pleše ${R.dance} s`;
      renderParty(); renderPuzzle(); renderSide(); break; }
    case 'kurent3': {
      const s = v3(R.delay, r); let hurt = 0, d = 0;
      alive().forEach(e => {
        d = Math.max(d, hit(v3(R.dmg, r), e)); if (e.hp <= 0) return;
        delayFoe(e, s);
        if (r >= 2 && hasTag(e, R.tags)) { hurt++; e.bane = { dps: e.atk * 0.5 / 4, until: B.time + 4, by: k }; e.baneAcc = 0; e.half = B.time + 4; if (r >= 3) e.halfNext = true; }
      });
      say.push(`−${d} vsem`, `napadejo ${num(s)} s pozneje`); if (hurt) card.extra = hurt > 1 ? 'zima se obrne proti sovražnikom' : 'zima se obrne proti sovražniku';
      break; }
    // Kralj Matjaž
    case 'matjaz1': { const d = hit(v3(R.dmg, r)), w = v3(R.ward, r); say.push(`−${d}`); if (w) { B.ward = Math.max(B.ward || 0, w); say.push(`ščit ${w} na junaka`); } break; }
    case 'matjaz2': {
      const b = v3(R.bonus, r); living().forEach(j => { B.rally[j] = Math.max(B.rally[j] || 0, b); });
      say.push(`naslednji napad +${b}`);
      if (v3(R.soften, r)) { B.dampen = { by: v3(R.soften, r), left: Math.max((B.dampen && B.dampen.left) || 0, R.hits) }; say.push(`naslednja ${R.hits} udarca −${B.dampen.by}`); }
      break; }
    case 'matjaz3': {
      const healN = v3(R.heal, r), w = v3(R.ward, r), raised = [];
      HEROES.forEach((x, j) => { const st = S.heroes[j]; if (st.down) { st.down = false; st.hp = Math.max(1, Math.round(st.maxHp * R.revive)); raised.push(x.name); } else healHero(j, healN); });
      B.ward = Math.max(B.ward || 0, w);
      say.push(`+${healN} zdravja`, `ščit ${w} na junaka`);
      if (v3(R.dmg, r)) { let d = 0; alive().forEach(e => { d = Math.max(d, hit(v3(R.dmg, r), e)); }); say.unshift(`−${d} vsem`); }
      if (raised.length) { card.extra = `vstane: ${raised.join(', ')}`; log(`Prebujenje: ${raised.join(', ')} spet ${nForm(raised.length, ['stoji', 'stojita', 'stojijo', 'stojijo'])}.`); sfx('win', { delay: .2, vol: .7 }); renderParty(); renderPuzzle(); renderSide(); }
      break; }
    // Kresnik
    case 'kresnik1': {
      const dragon = isDragon(target), d = hit(v3(R.dmg, r) * (dragon ? R.vsDragon : 1)), s = v3(R.burn, r);
      fixedBurn(target, s, k); say.push(`−${d}`, `gori ${s} s`); if (dragon) card.extra = 'zmaju ×1,5'; break; }
    case 'kresnik2': {
      const d = hit(v3(R.dmg, r)), s = v3(R.burn, r); fixedBurn(target, s, k); say.push(`−${d}`, `gori ${s} s`);
      const c = v3(R.chain, r), o = c ? foeBeside(target) : null;
      if (o) { const d2 = hit(c, o); fixedBurn(o, s, k); card.extra = `strela preskoči: −${d2}`; }
      break; }
    case 'kresnik3': {
      let d = 0; alive().forEach(e => { d = Math.max(d, hit(v3(R.dmg, r), e)); });
      const n = v3(R.charges, r); B.restore[k] = { rank: r, n };
      say.push(`−${d} vsem`, `povrne ${Math.round(v3(R.back, r) * 100)} % ${n > 1 ? `naslednjih ${n} ran` : 'naslednje rane'}`); break; }
    // Martin Krpan
    case 'krpan1': say.push(`−${hit(v3(R.dmg, r))}`); break;
    case 'krpan2': {
      const n = v3(R.hits, r), foes = [target, v3(R.foes, r) > 1 ? foeBeside(target) : null].filter(e => e && e.hp > 0); let d = 0;
      foes.forEach(e => { for (let i = 0; i < n; i++) d += hit(v3(R.dmg, r) / foes.length, e); });
      say.push(`−${d}`, n > 1 ? `${n} udarca po ${v3(R.dmg, r)}` : foes.length > 1 ? `razdeljeno med ${foes.length} ${nForm(foes.length, FOES_N)}` : 'cilj'); break; }
    case 'krpan3': {
      const d = hit(v3(R.dmg, r)), s = v3(R.bleed, r); fixedBurn(target, s, k, 'krvavi'); say.push(`−${d}`, `krvavi ${s} s`); break; }
    // Erazem Predjamski
    case 'erazem1': say.push(`−${hit(v3(R.dmg, r))}`); break;
    case 'erazem2': {
      const d = hit(v3(R.dmg, r)), n = v3(R.heal, r); let got = 0;
      heroesBeside(k).forEach(j => { got += healHero(j, n); });
      say.push(`−${d}`); if (got) say.push(`sosedom +${got}`); renderPartyHp(); break; }
    case 'erazem3': {
      const beside = heroesBeside(k), ally = r >= 3 ? (beside.find(j => j > k) ?? beside[0] ?? -1) : -1;
      B.rov = { k, rank: r, ally };
      say.push(ally >= 0 ? `izmik: Erazem in ${HEROES[ally].name}` : 'naslednji napad nanj zgreši'); if (r >= 2) card.extra = `protinapad ×${num(v3(R.counter, r))}`;
      break; }
    // Ajdovska deklica
    case 'ajda1': {
      if (v3(R.all, r)) { let d = 0; alive().forEach(e => { d = Math.max(d, hit(v3(R.dmg, r), e)); }); say.push(`−${d} vsem`); }
      else say.push(`−${hit(v3(R.dmg, r))}`);
      break; }
    case 'ajda2': {
      const n = v3(R.charges, r); B.guard = { k, left: Math.max((B.guard && B.guard.k === k && B.guard.left) || 0, n) };
      say.push(n > 1 ? `prestreže ${n} ${nForm(n, ATTACKS_ACC)}` : 'prestreže naslednji napad'); break; }
    case 'ajda3': {
      const foes = pickFoes(target, v3(R.foes, r)), n = v3(R.rounds, r);
      foes.forEach(e => { if (e.unstoppable) { floatOn(e.el, 'neustavljiv', 'info'); return; } e.stone = Math.max(e.stone || 0, n); });   // Lintvern cannot be stopped
      say.push(foes.length > 1 ? `okamni ${foes.length} ${nForm(foes.length, FOES_N)}` : 'okamni cilj'); card.extra = n > 1 ? `izpusti ${n} ${nForm(n, ATTACKS_ACC)}` : 'izpusti en napad';
      break; }
  }
  card.value = say.join(' · ');
  renderPartyHp();
}

// ------------------------------------------------------------ enemy attacks against the reviewed heroes' protections
// Anything in force against this attack? If not, hurtParty keeps its old path exactly.
const foeSoft = e => !!e && (!!e.weak || e.half > B.time || !!e.halfNext);
function revGuarding(src) {
  if (!src || !B) return false;
  return !!(B.ward || (B.dampen && B.dampen.left > 0) || B.rov || (B.guard && B.guard.left > 0) || (B.restore && Object.keys(B.restore).length) || foeSoft(src));
}
// One enemy attack, as a list of [hero, damage]. In order: Skrivni rov (Erazem, at rank 3 one hero beside him, slip
// away; from rank 2 he strikes back), the attacker's weakness (Zvonci, Pregon zime), Matjaž's shield and his army's
// resolve on each hero hit, the party's shield, and Varstvo popotnikov (Ajdovska deklica takes the others' blows, halved).
function revHits(hits, src) {
  if (!hits.length) return hits;
  const rov = B.rov;
  if (rov && !S.heroes[rov.k].down) {
    const slip = hits.filter(([k, d]) => d > 0 && (k === rov.k || k === rov.ally));
    if (slip.length) {
      slip.forEach(x => { x[1] = 0; if (UI.heroEls && UI.heroEls[x[0]]) floatOn(UI.heroEls[x[0]], 'izmik!', 'info'); });
      B.rov = null; log(`${src.name} zgreši — skrivni rov.`);
      const m = v3(RK.erazem[2].counter, rov.rank);
      if (m && src.hp > 0) {
        const st = S.heroes[rov.k], base = v3(RK.erazem[0].dmg, Math.max(1, st.sk[0] || 1));
        noteAttack(src, rov.k);
        const d = damageEnemy(src, base * m * heroMult(rov.k, 4), { by: rov.k });
        spawnCard(UI.heroEls[rov.k], { tier: 2, c: HEROES[rov.k].c, name: HEROES[rov.k].name, move: 'Protinapad', value: `−${d}`, art: HEROES[rov.k].id });
        log(`${HEROES[rov.k].name} udari nazaj (−${d}).`);
      }
    }
  } else if (rov) B.rov = null;
  const half = src.halfNext || src.half > B.time, weak = src.weak ? src.weak.by : 0;
  src.weak = null;   // Zvonci: the weakening is used up by this blow
  const ward = B.ward || 0, damp = B.dampen && B.dampen.left > 0 ? B.dampen.by : 0;
  hits.forEach(x => { if (x[1] > 0) x[1] = Math.max(0, Math.round(x[1] * (half ? 0.5 : 1)) - weak - ward - damp); });
  if (src.halfNext) src.halfNext = false;
  if (ward) { B.ward = 0; floatOn(UI.party, `ščit ${ward} na junaka`, 'info'); }
  if (damp) { B.dampen.left--; if (!B.dampen.left) B.dampen = null; }
  shieldHits(hits);
  const g = B.guard;
  if (g && g.left > 0 && !S.heroes[g.k].down) {
    const others = hits.filter(([k, d]) => k !== g.k && d > 0);
    if (others.length) {
      const total = others.reduce((s, x) => s + x[1], 0), mine = Math.ceil(total * RK.ajda[1].share);
      others.forEach(x => { x[1] = 0; });
      const own = hits.find(([k]) => k === g.k); if (own) own[1] += mine; else hits.push([g.k, mine]);
      g.left--; if (!g.left) B.guard = null;
      if (UI.heroEls && UI.heroEls[g.k]) floatOn(UI.heroEls[g.k], 'varstvo', 'info');
      log(`${HEROES[g.k].name} prestreže udarec (${total} → ${mine}).`);
    }
  }
  return hits;
}
// after a blow has landed on hero k: Kresna moč gives part of it back, and half of that in gold
function revWounded(k, real, src) {
  const R = B.restore && B.restore[k], st = S.heroes[k];
  if (!R || !src || real <= 0 || st.down) return;
  const want = Math.ceil(real * v3(RK.kresnik[2].back, R.rank)), got = Math.min(want, st.maxHp - st.hp);
  st.hp += got; if (--R.n <= 0) delete B.restore[k];
  const gold = got && S.run ? gainGold(Math.ceil(got * RK.kresnik[2].gold)) : 0;
  if (got) floatOn(UI.heroEls[k], `+${got}`, 'heal');
  if (gold) { B.stats.gold += gold; floatOn(UI.party, `+${gold} zlatnikov`, 'crit'); }
  log(`Kresna moč: ${HEROES[k].name} +${got} zdravja` + (gold ? `, +${gold} zlatnikov.` : '.'));
}

// ------------------------------------------------------------ time in battle (both modes: B.time runs in calm mode too)
function reviewedTick(dt) {
  let party = false, foes = false;
  if (B.busy) for (const k of Object.keys(B.busy)) if (B.busy[k] <= B.time) { delete B.busy[k]; party = true; }
  for (const e of B.enemies) {
    if (e.hp <= 0) continue;
    if (e.half && e.half <= B.time) { e.half = 0; foes = true; }
    if (e.bane) {
      if (e.bane.until > B.time) {
        e.baneAcc = (e.baneAcc || 0) + e.bane.dps * dt;
        if (e.baneAcc >= 1) { const d = Math.floor(e.baneAcc); e.baneAcc -= d; damageEnemy(e, d, { burn: true, by: e.bane.by }); if (B.over) return; }
      } else { e.bane = null; foes = true; }
    }
  }
  if (party) { renderParty(); renderSide(); if (!B.cw) renderPuzzle(); }
  if (foes) renderEnemies();
}
// what shows under an enemy besides omamljen and gori
function reviewedStatuses(e) {
  const s = [];
  if (e.stone > 0) s.push('okamnel');
  if (foeSoft(e)) s.push('šibkejši');
  if (e.bane && e.bane.until > B.time) s.push('pregnan');
  return s;
}
// what shows under the party's health besides the shield
function reviewedPartyNotes() {
  const s = [];
  if (B.ward) s.push(`ščit ${B.ward} na junaka`);
  if (B.guard && B.guard.left > 0) s.push(`varstvo ×${B.guard.left}`);
  if (B.dampen && B.dampen.left > 0) s.push(`vojska: udarci −${B.dampen.by} ×${B.dampen.left}`);
  if (B.rov) s.push('skrivni rov');
  const rally = Object.values(B.rally || {}).filter(Boolean); if (rally.length) s.push(`vojska +${Math.max(...rally)}`);
  return s;
}

// ------------------------------------------------------------ the Veščine texts, rank by rank (src/skills.js)
const SEC = n => `${num(n)} s`;
const RANK_TEXT = {
  kurent: [
    (R, r) => `Udarec z ježevko (${v3(R.dmg, r)}); cilj napade ${SEC(v3(R.delay, r))} pozneje. Zamiki se ne seštevajo.`,
    (R, r) => { const n = v3(R.foes, r); return `Kurent ${R.dance} s pleše (njegove črke ta čas ne štejejo, rane pa ga dosežejo); zvonci zadenejo ${n > 1 ? `${n} ${nForm(n, ['sovražnika', 'sovražnika', 'sovražnike', 'sovražnikov'])}` : 'cilj'} (${v3(R.dmg, r)}), ${n > 1 ? `njihov` : 'njegov'} naslednji udarec je ${v3(R.weaken, r)} šibkejši.`; },
    (R, r) => r === 1 ? `Vsi sovražniki −${v3(R.dmg, r)} in napadejo ${SEC(v3(R.delay, r))} pozneje.`
      : `Vsi sovražniki −${v3(R.dmg, r)} in napadejo ${SEC(v3(R.delay, r))} pozneje; duhovi in bitja vetra in mraza (Mora) si 4 s škodijo s pol svojega napada in ta čas udarijo s pol moči` + (r === 3 ? '; s pol moči udarijo tudi prvič po tem.' : '.'),
  ],
  matjaz: [
    (R, r) => `Udarec z mečem (${v3(R.dmg, r)})` + (v3(R.ward, r) ? `; ob naslednjem napadu sovražnika vsak zadeti junak dobi ${v3(R.ward, r)} manj.` : '.'),
    (R, r) => `Naslednji napad vsakega junaka je močnejši za ${v3(R.bonus, r)}` + (v3(R.soften, r) ? `; naslednja ${R.hits} udarca sovražnikov sta ${v3(R.soften, r)} šibkejša.` : '.'),
    (R, r) => `Vsi junaki +${v3(R.heal, r)} zdravja, padli vstanejo s ${Math.round(R.revive * 100)} % zdravja, ščit ${v3(R.ward, r)} na junaka za naslednji napad` + (v3(R.dmg, r) ? `; vsi sovražniki −${v3(R.dmg, r)}.` : '.'),
  ],
  kresnik: [
    (R, r) => `Udarec z ognjenim mečem (${v3(R.dmg, r)}, zmaju ${Math.round(v3(R.dmg, r) * R.vsDragon)}); cilj gori ${v3(R.burn, r)} s po ${BURN_DPS}.`,
    (R, r) => `Strela v cilj (${v3(R.dmg, r)}); cilj gori ${v3(R.burn, r)} s po ${BURN_DPS}` + (v3(R.chain, r) ? `; preskoči še na sosednjega sovražnika (${v3(R.chain, r)}), ki tudi gori.` : '.'),
    (R, r) => { const n = v3(R.charges, r); return `Plamen zadene vse sovražnike (${v3(R.dmg, r)}); od ${n > 1 ? `naslednjih ${n} ran` : 'naslednje rane'} si povrne ${Math.round(v3(R.back, r) * 100)} %, družina dobi pol toliko zlatnikov.`; },
  ],
  krpan: [
    (R, r) => `Udarec z lipovim kijem (${v3(R.dmg, r)}).`,
    (R, r) => r === 1 ? `Dva zaporedna udarca s pestjo, po ${v3(R.dmg, r)}; vsak šteje posebej.`
      : r === 2 ? `Kobilica prinese dve veliki vreči soli, Krpan ju vrže v cilj (${v3(R.dmg, r)}).`
      : `Krpan dvigne in vrže ogromno skalo (${v3(R.dmg, r)}); škoda se razdeli med dva sovražnika.`,
    (R, r) => `Natančen zasek z Mesarico (${v3(R.dmg, r)}); cilj krvavi ${v3(R.bleed, r)} s po ${BURN_DPS}.`,
  ],
  erazem: [
    (R, r) => `Zamah z mečem (${v3(R.dmg, r)}).`,
    (R, r) => `Češnje v cilj (${v3(R.dmg, r)}); junaka ob njem dobita +${v3(R.heal, r)} zdravja (on sam ne).`,
    (R, r) => r === 1 ? 'Naslednji napad nanj zgreši.'
      : r === 2 ? `Naslednji napad nanj zgreši, Erazem pa udari nazaj (${num(v3(R.counter, r))}-kratni zamah z mečem).`
      : `Naslednji napad zgreši njega in junaka ob njem; Erazem udari nazaj (${num(v3(R.counter, r))}-kratni zamah z mečem).`,
  ],
  ajda: [
    (R, r) => v3(R.all, r) ? `Kamni v vse sovražnike (${v3(R.dmg, r)}).` : `Kamen v cilj (${v3(R.dmg, r)}).`,
    (R, r) => { const n = v3(R.charges, r); return `${n === 1 ? 'Naslednji napad' : n === 2 ? 'Naslednja 2 napada' : `Naslednje ${n} napade`} na druge junake prestreže sama in dobi le pol škode.`; },
    (R, r) => { const n = v3(R.foes, r), m = v3(R.rounds, r); return `Okamni ${n > 1 ? `${n} ${nForm(n, FOES_N)}` : 'sovražnika'}, ki ${n > 1 ? nForm(n, ['izpusti', 'izpustita', 'izpustijo', 'izpusti']) : 'izpusti'} ${m > 1 ? `${m} ${nForm(m, ATTACKS_ACC)}` : 'en napad'}. Ogenj in strup delujeta naprej.`; },
  ],
};
const rankText = (id, t, r) => RANK_TEXT[id][t - 1](RK[id][t - 1], r);
