
// ============================================================ svetišča izziva: the shrines of challenge
// Every shrine belongs to one god and has its own look (tools/art_extra.py). A journey passes two of
// them (Game Director, 24 Nov 2026; three before), in regions picked at random and never in the last one;
// SHRINE_GODS says who is worshipped where. The gods are not shown at the shrines, only their signs
// (strela, nakovalo, vreteno, sonce, veter, rogovi).
// - Pray at a shrine: the god answers and lends a gift: every word that fires a third skill (three letters of
//   one colour) also brings the god's gift. Gifts of both shrines stack.
// - The god comes for the challenge at the end of the region where the player prayed, before the signpost
//   (21 Nov: "na koncu poti" meant the region's road, not the journey; the shrines stand near the start of
//   their regions). 24 Nov: no rest first. The god wants a fair fight: every hero is healed to full, the
//   fallen too, and skill points can be spent before it (fairFight). Then a hard battle in which the god only
//   uses their special.
// - Winning: the god speaks, heals the party again, gives everyone a big chunk of XP, is unlocked for later
//   journeys, and the gift stays to the end of this journey (no longer into the next one).
// - Losing is not losing the journey, on any Znanje: the god leaves, every hero is as healthy as they came
//   (R.godSnap), and the gift goes out once the next region is behind the party (R.giftUntil).
// - A party that travels with a god meets that god's godly version at the god's own shrine, right away:
//   no prayer and no gift; the party god does not strike their other self. Winning gives the party god a
//   skill point at once and everyone a big chunk of XP. Other gods' shrines stay closed to such a party.
const GODS = ['perun', 'svarog', 'mokos', 'dazbog', 'stribog', 'veles'];
const SHRINE_GODS = { peca: ['svarog', 'perun'], triglav: ['perun', 'stribog'], bled: ['dazbog', 'mokos'], gozd: ['veles', 'mokos'], piran: ['stribog', 'dazbog'], barje: ['veles', 'mokos'] };
const SHRINES_PER_RUN = 2, GOD_XP = 250;
// names in the cases the lines need, the shrine, the answer to a prayer, the arrival and the last word
const GOD = {
  perun: { name: 'Perun', to: 'Perunu', acc: 'Peruna', title: 'Gromovnik Perun', sign: 'strela',
    look: 'Pod starim hrastom stoji izrezljan steber, na njem gromovno znamenje.',
    gift: 'strela preskoči na vse nasprotnike',
    answer: 'Zagrmelo je. Tvoj poklon je sprejet. Preden zapustiš to pokrajino, bom videl, ali si vreden te preizkušnje.',
    come: 'Pred kažipotom nebo potemni in zagrmi. Perun je prišel po svoje.',
    won: 'Hm … tebe si bom zapomnil. Ko bo naslednjič zagrmelo, se ozri v nebo.' },
  svarog: { name: 'Svarog', to: 'Svarogu', acc: 'Svaroga', title: 'Nebeški kovač Svarog', sign: 'nakovalo',
    look: 'Kamnit oltar z nakovalom. V njem gori ogenj, ki ga nihče ne neti.',
    gift: 'družina dobi velik ščit',
    answer: 'Ogenj je videl tvoj poklon. Preden zapustiš to pokrajino, bom videl, ali si iz pravega železa.',
    come: 'Kamni ob poti zažarijo kot v kovačnici. Svarog je prišel po svoje.',
    won: 'Železo se pokaže šele v ognju. Tvoje se ni zlomilo. Tebe si bom zapomnil.' },
  mokos: { name: 'Mokoš', to: 'Mokoši', acc: 'Mokoš', title: 'Mati Mokoš', sign: 'vreteno', f: true,
    look: 'Studenec v kamnitem krogu, nad njim stoji vreteno.',
    gift: 'družina se pozdravi',
    answer: 'Tvoj poklon je sprejet, otrok. Preden zapustiš to pokrajino, bom videla, ali si vreden te preizkušnje.',
    come: 'Iz tal privre studenec in se dvigne v podobo. Mokoš je prišla po svoje.',
    won: 'Nit tvoje usode je trša, kot sem mislila. Spredla jo bom naprej … in videla, kam vodi.' },
  dazbog: { name: 'Dažbog', to: 'Dažbogu', acc: 'Dažboga', title: 'Sončni Dažbog', sign: 'sonce',
    look: 'Na visokem drogu se sveti sončni kolut.',
    gift: 'naslednja beseda šteje dvojno',
    answer: 'Sonce je videlo tvoj poklon. Preden zapustiš to pokrajino, bom videl, ali si vreden moje luči.',
    come: 'Sonce obstane nad potjo in ne zaide. Dažbog je prišel po svoje.',
    won: 'Hm. Sonce ne pozabi nikogar, ki je zdržal njegov pogled. Tebe si bom zapomnil.' },
  stribog: { name: 'Stribog', to: 'Stribogu', acc: 'Striboga', title: 'Ded vetrov Stribog', sign: 'veter',
    look: 'Kup kamenja na vetrovnem vrhu. Trakovi na drogu nikoli ne mirujejo.',
    gift: 'veter zadene vse nasprotnike in očisti mrežo',
    answer: 'Veter mi je prinesel tvoj poklon. Preden zapustiš to pokrajino, bom videl, ali te odnese ali obstaneš.',
    come: 'Ob kažipotu zatuli veter. Stribog je prišel po svoje.',
    won: 'Veter si zapomni vsak glas. Tvojega bom nosil daleč … dlje, kot misliš.' },
  veles: { name: 'Veles', to: 'Velesu', acc: 'Velesa', title: 'Gospodar podzemlja Veles', sign: 'rogovi',
    look: 'Temen kamen med koreninami, okronan z volovskimi rogovi. Ob njem se zvija kača.',
    gift: 'vsi nasprotniki so zastrupljeni',
    answer: 'Tvoj poklon je sprejet … a vsak dar ima svojo ceno. Preden zapustiš to pokrajino, bom videl, ali jo zmoreš plačati.',
    come: 'Pod potjo zašumijo korenine in zemlja se odpre. Veles je prišel po svoje.',
    won: 'Hm … tebe si bom zapomnil. In nekoč pridem po svoj dolg.' },
};
const godSign = (id, cls = '') => h('img', { class: 'godsign ' + cls, src: ART['znak-' + id], alt: GOD[id].sign, draggable: 'false' });

// ------------------------------------------------------------ prayers and gifts on this journey (24 Nov 2026)
// R.prayers: { god, ri, result }, result null while the god waits at the end of region ri, then 'won' or 'lost'.
// Two shrines a journey, so two prayers and two challenges at most. R.gifts lists the gifts that work now;
// R.giftUntil[god] = the region after which a gift goes out (a lost challenge: the next region).
const waitingPrayer = () => (S.run && S.run.prayers || []).find(p => !p.result) || null;
// The gift a beaten god used to lend to the whole next journey (zg-gift, 16–23 Nov) is gone: forget a stored one.
function forgetNextGift() { try { localStorage.removeItem('zg-gift'); } catch (e) { /* no storage */ } }
// a save from before 24 Nov: one prayer (R.prayer, R.challenged) and three shrines planned; keep the first two
function migratePrayers(R) {
  if (!R || R.prayers) return;
  R.prayers = R.prayer ? [{ god: R.prayer, ri: R.ri, result: R.challenged ? 'won' : null }] : [];
  R.giftUntil = R.giftUntil || {};
  delete R.prayer; delete R.challenged;
  if (R.shrines) {
    const keep = Object.keys(R.shrines).map(Number).sort((a, b) => a - b).slice(0, SHRINES_PER_RUN);
    Object.keys(R.shrines).forEach(k => { if (!keep.includes(+k)) delete R.shrines[k]; });
  }
}
// leaving region `ri`: the gifts whose time ends with it go out; returns their gods
function expireGifts(ri) {
  const R = S.run; if (!R || !R.giftUntil) return [];
  const gone = Object.keys(R.giftUntil).filter(g => R.giftUntil[g] <= ri);
  gone.forEach(g => { delete R.giftUntil[g]; R.gifts = R.gifts.filter(x => x !== g); });
  return gone;
}
const giftGoneLine = g => `Dar, ki ${GOD[g].f ? 'ti ga je posodila' : 'ti ga je posodil'} ${GOD[g].name}, je ugasnil.`;

// ------------------------------------------------------------ where the shrines stand on this journey
function planShrines(starterId) {
  // never in the last region: the god would come in the Lintvern's place (24 Nov)
  const slots = WORLD.regions.map((r, i) => r.stops.includes('god') && SHRINE_GODS[r.id] && i < WORLD.regions.length - 1 ? i : -1).filter(i => i >= 0);
  const at = shuffle(slots).slice(0, SHRINES_PER_RUN).sort((a, b) => a - b), used = new Set(), out = {};
  at.forEach(i => {
    const own = SHRINE_GODS[WORLD.regions[i].id].filter(g => !used.has(g));
    const g = own.length ? pick(own) : pick(GODS.filter(x => !used.has(x)));
    used.add(g); out[i] = g;
  });
  // a god who starts the journey always finds their own shrine on it (at a place of theirs if there is one)
  if (isGod(starterId) && !used.has(starterId)) {
    const home = at.find(i => SHRINE_GODS[WORLD.regions[i].id].includes(starterId));
    out[home != null ? home : at[at.length - 1]] = starterId;
  }
  return out;
}

// ------------------------------------------------------------ the shrine on the road
function shrinePrompt(stop, pass, train) {
  const R = S.run, id = stop.god, G = GOD[id], pg = partyGod(), extra = train ? [train] : [];
  const where = `Svetišče, posvečeno ${G.f ? 'boginji' : 'bogu'} ${G.to}. ${G.look}`;
  if (pg >= 0 && HEROES[pg].id === id) {
    return { text: `${where} ${G.name} v tvoji družini obstane: iz svetišča ${G.f ? 'jo' : 'ga'} kliče ${G.f ? 'njena' : 'njegova'} božanska podoba.`,
      actions: [{ label: 'Sprejmi izziv', primary: true, fn: () => challengeOwn(stop) }, { label: 'Pojdi mimo', fn: () => pass() }, ...extra] };
  }
  if (pg >= 0) return { text: `${where} ${HEROES[pg].name} ne dovoli, da bi se klanjal ${G.f ? 'drugi boginji' : 'drugemu bogu'}.`, actions: [{ label: 'Naprej ▶', primary: true, fn: () => pass(true) }, ...extra] };
  // a god already met on this journey, or one still waiting (only an older save can get here)
  const met = (R.prayers || []).find(p => p.god === id), w = waitingPrayer();
  if (met || w) {
    const p = GOD[(met || w).god];
    return { text: met && met.result ? `${where} ${p.name} te je na tej poti že ${p.f ? 'preizkusila' : 'preizkusil'}.` : `${where} ${p.name} te čaka na koncu pokrajine; dveh izzivov hkrati ni.`,
      actions: [{ label: 'Naprej ▶', primary: true, fn: () => pass(true) }, ...extra] };
  }
  return { text: `${where} Kdor se tu pokloni, izzove ${G.f ? 'boginjo' : 'boga'}.`,
    actions: [{ label: 'Stopi v svetišče', primary: true, fn: () => go('shrine', { stop }) }, { label: 'Pojdi mimo', fn: () => pass() }, ...extra] };
}

// ------------------------------------------------------------ Svetišče: bow to the god's sign
// The button is "Pokloni se" (Game Director, 27 Nov 2026; it was "Pomoli se"): pokloniti se is the usual Slovene
// for bowing to someone in reverence; nakloniti se reads first as "to lean", and nakloniti komu as "to grant". The gods
// answer a poklon, not a molitev (Game Director, 28 Nov 2026: "pokloni pred bogovi" has the better meaning).
function renderShrine(arg) {
  arg = arg || S.shrineArg; S.shrineArg = arg;
  const R = S.run, stop = arg.stop, id = stop.god, G = GOD[id], ch = CHARS.find(c => c.id === id);
  const back = () => { S.shrineArg = null; go('travel'); };
  const leave = () => { stop.passed = true; R.prompt = null; back(); };
  const pray = () => {
    R.prayers.push({ god: id, ri: R.ri, result: null }); if (!R.gifts.includes(id)) R.gifts.push(id);
    stop.done = stop.passed = true; R.prompt = null; arg.prayed = true; chorus();
    mountShell(); renderShrine(arg);
  };
  arg.actions = arg.prayed ? [{ label: 'Naprej ', primary: true, fn: back }] : [{ label: 'Pokloni se ', primary: true, fn: pray }, { label: 'Pojdi naprej ', fn: leave }];
  SCR.append(h('div', { class: 'hm shrine', style: { '--c': ch.c } },
    h('div', {}, h('div', { class: 'kind' }, 'Svetišče izziva'), h('h2', {}, 'Svetišče', h('small', {}, `posvečeno ${G.f ? 'boginji' : 'bogu'} ${G.to}`))),
    h('div', { class: 'shrine-body' },
      h('div', { class: 'shrine-art' + (arg.prayed ? ' heard' : '') },
        godSign(id, 'big'),
        h('div', { class: 'shrine-obj' }, objEl('svetisce-' + id, arg.prayed ? 1 : 0)),
        [16, 30, 48, 64, 80].map((x, i) => h('span', { class: 'mote', style: { left: x + '%', 'animation-delay': (-i * .7) + 's' } }))),
      h('div', { class: 'shrine-text' },
        arg.prayed
          ? h('div', { class: 'say god' }, godSign(id), h('div', {}, h('b', {}, G.name), '»' + G.answer + '«'))
          : [h('p', { class: 'lead' }, G.look),
            h('p', {}, `Tu se ne prosi za pomoč, tu se izziva. Če se pokloniš, ti ${G.name} posodi svoj dar: ko beseda nosi tri črke iste barve, ${G.gift}.`),
            h('p', {}, `Na koncu te pokrajine, pred kažipotom, pride ${G.name} ${G.f ? 'sama' : 'sam'} in te preizkusi. Boj mora biti pošten, zato pred njim vsem junakom vrne polno zdravje. Če ${G.f ? 'jo' : 'ga'} premagaš, ${G.f ? 'jo' : 'ga'} odkleneš za naslednje poti in ${G.f ? 'njen' : 'njegov'} dar ostane s tabo do konca poti. Če izgubiš, se pot ne konča: junaki so spet tako zdravi kot pred izzivom, dar pa ugasne, ko je za tabo še naslednja pokrajina.`),
            h('p', { class: 'muted' }, 'Na eni poti srečaš le dve svetišči.')])),
    h('div', { class: 'row', style: { 'flex-wrap': 'wrap' } }, arg.actions.map(a => h('button', { class: 'btn' + (a.primary ? ' primary' : ''), onclick: a.fn }, a.label, h('kbd', {}, a.primary ? 'Enter' : 'Esc'))))));
  focusPage();
}
function shrineKey(e) {
  const A = S.shrineArg; if (!A || !A.actions) return;
  if (e.key === 'Enter') { e.preventDefault(); const a = A.actions.find(x => x.primary); if (a) a.fn(); }
  else if (e.key === 'Escape') { e.preventDefault(); const a = A.actions.find(x => !x.primary) || A.actions[0]; a.fn(); }
}

// ------------------------------------------------------------ the gods' gifts in battle
// called after a word: `p` is the power of the strongest third skill the word fired
const giftsNow = () => !S.run || !B ? [] : (S.run.gifts || []).filter(g => !(B.node.challenge && B.node.challenge.god === g));
function giftStrike(id, p) {
  achGift();   // a shrine's gift used on this journey (src/achievements.js: Brez božjega daru)
  const G = GOD[id], ch = CHARS.find(c => c.id === id), alive = B.enemies.filter(e => e.hp > 0);
  if (!alive.length) return;
  const card = { tier: 3, c: ch.c, name: `dar: ${G.name}`, move: ch.moves[2], portrait: godSign(id) };
  if (id === 'perun') { let d = 0; alive.forEach(e => { d = Math.max(d, damageEnemy(e, 1.5 * p)); }); card.value = `−${d} vsem`; card.extra = 'strela preskoči na vse'; }
  else if (id === 'svarog') { const sh = Math.min(30 - B.shield, Math.round(2.5 * p)); B.shield += Math.max(0, sh); card.value = `ščit +${Math.max(0, sh)}`; }
  else if (id === 'mokos') { const got = healParty(Math.round(3 * p), HEAL_CAP); if (got) floatOn(UI.party, `+${got}`, 'heal'); card.value = `+${got} zdravja`; }
  else if (id === 'dazbog') { B.double = Math.max(B.double, 2); card.value = 'naslednja beseda ×2'; }
  else if (id === 'stribog') {
    let d = 0; alive.forEach(e => { d = Math.max(d, damageEnemy(e, 1.2 * p)); });
    B.grid.forEach(t => { t.lockUntil = 0; t.lockWords = 0; t.flood = false; t.scorch = false; }); B.sleep = {}; renderPuzzle(); renderParty();
    card.value = `−${d} vsem`; card.extra = 'mreža je čista'; }
  else if (id === 'veles') { alive.forEach(e => applyBurn(e, p, 'zastrupljen')); card.value = 'strup vsem'; }
  spawnCard(leadEl(), card); log(`Dar: ${G.name} — ${G.gift}.`);
  renderPartyHp(); renderEnemies();
}

// ------------------------------------------------------------ the god as the challenger
const HOLY_TINT = 'drop-shadow(0 0 3px rgba(255, 236, 160, .95)) drop-shadow(0 0 9px rgba(255, 214, 110, .6)) brightness(1.08)';
// gods are far tougher than any boss on the road; the difficulty scales them like other enemies (makeEnemy).
// GOD_BAL: health hp + perRegion × region, attack atk + region / 3 (the simulator can override it, tools/sim)
const GOD_BAL = { hp: 260, perRegion: 26, atk: 5, atkPerRegion: 1 / 3 };
function godFoe(id) {
  const key = 'bog-' + id, ch = CHARS.find(c => c.id === id), ri = S.run ? S.run.ri : 3, G = GOD[id];
  ENEMIES[key] = { name: G.title, f: !!G.f, art: id, tint: HOLY_TINT, hp: GOD_BAL.hp + GOD_BAL.perRegion * ri, atk: GOD_BAL.atk + Math.round(ri * GOD_BAL.atkPerRegion), speed: 9.5, calmStep: 0.34, size: 72,
    xp: 40, boss: true, god: id, moves: { attack: ch.moves[0], gust: ch.moves[0], special: ch.moves[2] },
    // Stribog mixed the letters with every blow (Game Director, 28 Nov 2026): two gusts on everyone (Sapica, no mixing)
    // between his storms; the other gods still strike only with their special
    pattern: id === 'stribog' ? ['gust', 'gust', 'special'] : ['special'] };
  return key;
}
function challengeBattle(id, ch) {
  const R = S.run, reg = WORLD.regions[R.ri], key = godFoe(id);
  go('battle', { id: reg.id, bg: reg.bg, title: 'Izziv', sub: `${GOD[id].f ? 'Boginja' : 'Bog'} · ${ENEMIES[key].name}`, challenge: { god: id, ...ch }, stop: ch.stop || null,
    battle: { enemies: [key], scale: null, finishers: shuffle(Object.keys(FINISHER_FX)).slice(0, 2), meterStart: 0.3, tips: [] } });
}
// at the god's own shrine, with the god in the party: the godly version, right away
function challengeOwn(stop) { S.run.prompt = null; fairFight(); challengeBattle(stop.god, { own: true, stop }); }

// the god's only attack: their special (Perun: a chain through the whole party, the first hero hit hardest)
function godSpecial(e) {
  const id = e.god, mv = e.moves.special, L = living(); let d = 0, extra = '';
  if (id === 'perun') { d = hurtEach(L.map((k, i) => e.atk * Math.max(0.4, 1.4 - 0.3 * i)), e); extra = 'veriga strel skozi vso družino'; }
  else if (id === 'svarog') { d = hurtEach(L.map((k, i) => e.atk * (i ? 0.6 : 2)), e); const n = lockTiles(3).length; extra = `prvi junak pod kladivom · ${n} črke razbeljene`; }
  else if (id === 'mokos') { d = hurtEach(L.map(() => e.atk * 0.8), e); const g = Math.min(e.maxHp - e.hp, d); e.hp += g; if (g) floatOn(e.el, `+${g}`, 'heal'); extra = `vzame si življenje: +${g}`; }
  else if (id === 'dazbog') { d = hurtEach(L.map(() => e.atk * 0.75), e); e.atk += 1; extra = 'sonce se dviga: vsak udarec je močnejši'; }
  else if (id === 'stribog') { d = hurtEach(L.map(() => e.atk * 0.75), e); if (!B.cw) { B.grid.forEach((t, i) => { if (!isLocked(t)) B.grid[i] = newTile(); }); ensureSolvable(); clearWord(); renderPuzzle(); } extra = 'vihar premeša mrežo'; }
  else if (id === 'veles') { d = hurtEach(L.map(() => e.atk * 0.6), e); const n = lockTiles(4).length; extra = `korenine prerastejo ${n} ${n === 1 ? 'črko' : n === 2 ? 'črki' : n <= 4 ? 'črke' : 'črk'}`; }
  spawnCard(e.el, { tier: 3, foe: true, name: e.name, move: mv, value: d ? `−${d}` : 'ščit ujame', extra });
  log(`${e.name}: ${mv}! (−${d}) — ${extra}.`);
}

// ------------------------------------------------------------ the end of the region: the god comes
// After a prayer the god waits at the end of that region's road, before the signpost (src/journey.js,
// travelTick). An older save whose prayer region is behind it meets the god at the next region's end.
const godWaits = () => !!(S.run && waitingPrayer() && partyGod() < 0);
function godArrives() {
  const R = S.run, w = waitingPrayer(); R.walking = false; R.prompt = null;
  fairFight();   // 24 Nov: no rest first; the god heals everyone for a fair fight
  go('godcome', { god: w.god });
}
// The god wants a fair fight (24 Nov): every hero gets full health, the fallen too. R.godSnap keeps the health
// they came with, which a lost challenge gives back (restoreSnap).
function fairFight() {
  const R = S.run; if (!R) return;
  R.godSnap = S.heroes.map(st => ({ hp: st.hp, down: !!st.down }));
  S.heroes.forEach(st => { st.down = false; st.hp = st.maxHp; });
}
function restoreSnap() {
  const R = S.run, snap = R && R.godSnap; if (!snap) return;
  S.heroes.forEach((st, k) => { const o = snap[k]; if (!o) return; st.down = o.down; st.hp = o.down ? 0 : clamp(o.hp, 1, st.maxHp); });
  delete R.godSnap;
}
// The ending screen's way out (button, Enter, Back) goes through here.
// the ending's two ways out (Game Director, 27 Nov 2026): Nova pot (the setup of a new journey) or Nazaj na meni
function leaveEnding(to = 'title') { resetRun(); go(to); }
function renderGodCome(arg) {
  arg = arg || S.godArg; S.godArg = arg;
  const id = arg.god, G = GOD[id], ch = CHARS.find(c => c.id === id);
  arg.go = () => { S.godArg = null; challengeBattle(id, { prayer: true }); };
  const train = trainAction(() => go('godcome', arg));   // skill points can be spent before the fight (24 Nov)
  SCR.append(h('div', { class: 'hm godcome', style: { '--c': ch.c } },
    h('div', {}, h('div', { class: 'kind' }, 'Izziv'), h('h2', {}, G.name, h('small', {}, G.f ? 'boginja' : 'bog'))),
    godSpirit(id, true),
    h('p', { class: 'lead' }, G.come),
    h('p', { class: 'note' }, `Boj mora biti pošten: ${G.name} vsem junakom vrne polno zdravje.` + (train ? ' Točke veščin lahko porabiš še pred bojem.' : '')),
    h('div', { class: 'say god' }, godSign(id), h('div', {}, h('b', {}, G.name), G.f ? '»Rekla sem, da bom videla. Zdaj pokaži.«' : '»Rekel sem, da bom videl. Zdaj pokaži.«')),
    h('div', { class: 'row', style: { 'flex-wrap': 'wrap' } }, h('button', { class: 'btn primary', onclick: arg.go }, 'V boj ', h('kbd', {}, 'Enter')),
      train ? h('button', { class: 'btn', onclick: train.fn }, train.label) : null)));
  chorus(); focusPage();
}

// the god in person, at the end of a region: their sign above them, in a holy light (dimmer when they leave)
const godSpirit = (id, lit) => h('div', { class: 'spirit grand godspirit' + (lit ? ' lit' : ''), style: { '--c': CHARS.find(c => c.id === id).c } },
  godSign(id, 'big'), [18, 34, 52, 68, 82].map((x, i) => h('span', { class: 'mote', style: { left: x + '%', 'animation-delay': (-i * .8) + 's' } })), spriteEl(id, CHARS.find(c => c.id === id).c, 'holy'));

// after the challenge: the god's last word (won), or the god leaves (lost)
function renderGodWord(arg) {
  arg = arg || S.godArg; S.godArg = arg;
  const id = arg.god, G = GOD[id], ch = CHARS.find(c => c.id === id);
  const notes = arg.won ? [
    arg.own ? `Družina dobi točko veščine (${HEROES[partyGod()] ? HEROES[partyGod()].name : G.name} ti jo podari).` : null,
    `Vsak junak: +${GOD_XP} XP.`,
    `Pred odhodom ${G.name} vsem junakom spet vrne polno zdravje.` + (arg.raised && arg.raised.length ? ` Padli so vstali: ${arg.raised.join(', ')}.` : ''),
    arg.fresh ? `${G.name} je ${G.f ? 'odklenjena' : 'odklenjen'}: na naslednji poti ${G.f ? 'jo' : 'ga'} lahko izbereš.` : null,
    arg.prayer ? `${G.f ? 'Njen' : 'Njegov'} dar ostane s tabo do konca poti: ko beseda nosi tri črke iste barve, ${G.gift}.` : null].filter(Boolean)
    : [`${G.name} odide brez besede.`, 'Pot se nadaljuje: junaki so spet tako zdravi kot pred izzivom.',
      arg.prayer ? `${G.f ? 'Njen' : 'Njegov'} dar ostane s tabo, dokler ni za tabo še naslednja pokrajina; potem ugasne.` : null].filter(Boolean);
  SCR.append(h('div', { class: 'hm godword', style: { '--c': ch.c } },
    h('div', {}, h('div', { class: 'kind' }, arg.won ? 'Izziv je dobljen' : 'Izziv je izgubljen'), h('h2', {}, G.name, h('small', {}, G.f ? 'boginja' : 'bog'))),
    godSpirit(id, arg.won),
    arg.won ? h('div', { class: 'say god' }, godSign(id), h('div', {}, h('b', {}, G.name), '»' + G.won + '«')) : null,
    notes.map(n => h('p', { class: 'note' }, n)),
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => arg.next() }, arg.nextLabel, h('kbd', {}, 'Enter')))));
  if (arg.won) chorus();
  focusPage();
}

// after a challenge battle (src/game.js, showResult): rewards on a win, then what comes next
function challengeWon(node) {
  const C = node.challenge, R = S.run, raised = [];
  // the beaten god heals the party again, the fallen too (24 Nov; before, the fallen rose with half), then
  // everyone gets a big chunk of experience
  S.heroes.forEach((st, k) => { if (st.down) raised.push(HEROES[k].name); st.down = false; st.hp = st.maxHp; });
  if (R) delete R.godSnap;
  gainXp(GOD_XP, null, true);
  if (C.own) { const pg = partyGod(); if (pg >= 0 && S.run) { S.heroes[pg].pts = heroPts(S.heroes[pg]) + 1; chorus(); } }   // a point for the party god (balance E: their own)
  const fresh = unlock(C.god);
  achGodBeaten(C.god);   // src/achievements.js
  if (C.prayer && R) { const p = (R.prayers || []).find(x => x.god === C.god && !x.result); if (p) p.result = 'won'; }
  return { raised, fresh };
}
// a lost challenge (24 Nov): the god leaves, every hero is as healthy as they came, and the journey goes on on
// every Znanje (no withdrawing, no end). After a prayer the gift stays until the next region is behind the party.
function challengeLost(node) {
  const C = node.challenge, R = S.run; if (!R) return;
  restoreSnap();
  if (C.prayer) {
    const p = (R.prayers || []).find(x => x.god === C.god && !x.result); if (p) p.result = 'lost';
    if (R.gifts.includes(C.god)) { R.giftUntil = R.giftUntil || {}; R.giftUntil[C.god] = R.ri + 1; }
  }
}
