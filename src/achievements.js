// ============================================================ achievements, story cards and skill cards (25 Nov 2026)
// The catalogue is data (data/achievements.json, from Codex's docs/achievements-design.md): each achievement has a typed
// rule, so the Godot game can read the same file. This module keeps the player's profile, counts what happens on a real
// journey and unlocks: a short toast, queued, never a dialog during a puzzle.
// The profile (localStorage zg-dosezki) survives new journeys; only Ponastavi in Nastavitve clears it.
//   counters  lifetime numbers (words, len6, foe:volkodlak, chests …)   sets  ids seen (foeTypes, godsBeaten, knowsWon …)
//   words     the base forms already used (LEMMA), for the unique-word goals
//   unlocked  {achievement id: time}   cards.skill {"krpan:1": time}   cards.story {krpan: time}
// Nothing counts in test mode or outside a journey (practice battles): achOn().
const ACH = (() => { try { return JSON.parse($('#achdata').textContent); } catch (e) { return { achievements: [], groups: [] }; } })();
const ACH_KEY = 'zg-dosezki', ACH_WORDS_MAX = 5000;   // enough for Tisoč obrazov with room; the list stays a few tens of KB
const achBlank = () => ({ v: 1, counters: {}, sets: {}, words: [], unlocked: {}, cards: { skill: {}, story: {} } });
let ACHP = (() => {
  try {
    const v = JSON.parse(localStorage.getItem(ACH_KEY) || 'null');
    if (v && v.v === 1) { const b = achBlank(); return { ...b, ...v, cards: { ...b.cards, ...(v.cards || {}) } }; }
  } catch (e) { /* no storage or a broken profile: start again */ }
  return achBlank();
})();
const ACH_WORDS = new Set(ACHP.words);
function achSave() { ACHP.words = [...ACH_WORDS]; try { localStorage.setItem(ACH_KEY, JSON.stringify(ACHP)); } catch (e) { /* no storage: kept for this visit */ } }
function achReset() { ACHP = achBlank(); ACH_WORDS.clear(); try { localStorage.removeItem(ACH_KEY); } catch (e) { /* no storage */ } }
const achOn = () => !!(S.run && !S.testMode);
const achCount = (k, n = 1) => { ACHP.counters[k] = (ACHP.counters[k] || 0) + n; };
const achSetAdd = (k, id) => { const s = ACHP.sets[k] || (ACHP.sets[k] = []); if (!s.includes(id)) s.push(id); };
const ACH_CZS = /[čšž]/i;
const ACH_LEN = w => [...w].length;   // Č, Š and Ž are one letter each (one code point in the word list)
const ACH_TIERS = { bronasta: 'bronasta', srebrna: 'srebrna', zlata: 'zlata' };

// ---------------------------------------------------------------- the toasts, one after another
const ACH_QUEUE = [];
let achShowing = false;
function achToast(text) {
  ACH_QUEUE.push(text);
  if (achShowing) return;
  // another toast on screen (a hero unlocked, a region behind you) is read first
  const next = (waits = 0) => {
    const other = document.querySelector('.toast:not(.ach)');
    if (other && waits < 3) { achShowing = true; setTimeout(() => next(waits + 1), 1500); return; }
    const t = ACH_QUEUE.shift();
    if (!t) { achShowing = false; return; }
    achShowing = true; toast(t); const el = document.querySelector('.toast'); if (el) el.classList.add('ach');
    setTimeout(next, 3200);
  };
  next();
}

// ---------------------------------------------------------------- rules
// where a counted or collected goal stands: [have, need]
function achProgress(a) {
  const r = a.rule;
  if (r.count) return [Math.min(r.min, r.count === 'uniqueWords' ? ACH_WORDS.size : ACHP.counters[r.count] || 0), r.min];
  if (r.set) {
    const have = r.set === 'unlocked' ? r.all.filter(id => UNLOCKED.has(id)) : (ACHP.sets[r.set] || []).filter(id => r.all.includes(id));
    return [have.length, r.all.length];
  }
  return null;
}
// whether an event goal is met by this moment (ctx: what happened)
function achEventMet(r, ev, x) {
  if (r.event !== ev) return false;
  switch (ev) {
    case 'word': return !r.battleUnique || x.battleUnique >= r.battleUnique;
    case 'kill': return (!r.wordMin || (x.word && ACH_LEN(x.word) >= r.wordMin)) && (!r.domain || x.domain) && (!r.foe || x.foe === r.foe) && (!r.noRepeat || x.noRepeat);
    case 'battleWon': return (!r.boss || x.boss) && (!r.noneFell || !x.fell) && (!r.noDamage || !x.hurt) && (!r.revived || x.revived);
    case 'regionLeft': case 'regionEntered': return x.region === r.region;
    case 'journeyWon': {
      const full = x.alive.length >= (ACH.fullParty || 3) && x.alive.length === x.party.length;
      return (!r.noWithdraw || !x.withdrew) && (!r.partyAlive || full) && (!r.solo || x.solo) && (!r.noGod || x.noGod)
        && (!r.know || x.know === r.know) && (!r.mode || x.mode === r.mode) && (!r.alive || x.alive.includes(r.alive))
        && (!r.storyCards || ACH.achievements.filter(b => b.card && b.group === 'Zgodbe').every(b => ACHP.cards.story[b.card]))
        && (!r.lastWordMin || (x.lastWord && ACH_LEN(x.lastWord) >= r.lastWordMin)) && (!r.lastWordCzs || (x.lastWord && ACH_CZS.test(x.lastWord)));
    }
  }
  return false;
}
// everything still locked that this moment (or the counters now) earns
function achCheck(ev, x) {
  const got = [];
  ACH.achievements.forEach(a => {
    if (ACHP.unlocked[a.id]) return;
    const p = achProgress(a);
    if (p ? p[0] >= p[1] : ev && achEventMet(a.rule, ev, x || {})) got.push(a);
  });
  got.forEach(a => {
    ACHP.unlocked[a.id] = Date.now();
    if (a.card && a.group === 'Zgodbe') ACHP.cards.story[a.card] = ACHP.unlocked[a.id];
    achToast(a.card && a.group === 'Zgodbe' ? `Nova karta zgodbe: ${a.title} (${CHARS.find(c => c.id === a.card).name})` : `Dosežek: ${a.title} · ${ACH_TIERS[a.tier]}`);
  });
  achSave();
  return got;
}

// ---------------------------------------------------------------- what the game reports (hooks in src/game.js, journey.js, shrines.js)
// an accepted word in a journey battle; dom: it is one of a party hero's own words
function achWord(w) {
  if (!achOn() || !B) return;
  const lem = LEMMA.get(w) || w, n = ACH_LEN(w);
  achCount('words');
  if (n === 6) achCount('len6');
  if (n >= 9) achCount('len9');
  if (ACH_CZS.test(w)) achCount('czs');
  if (!ACH_WORDS.has(lem) && ACH_WORDS.size < ACH_WORDS_MAX) ACH_WORDS.add(lem);
  const seen = B.achLems || (B.achLems = new Set());
  if (seen.has(lem)) B.achRepeat = true;   // a base word used twice in this battle
  seen.add(lem);
  B.achWord = w;
  B.achDomain = HEROES.some(hr => hr.domain && (hr.domain.includes(lem) || hr.domain.includes(w)));
  achCheck('word', { battleUnique: seen.size });
}
// an enemy beaten; byWord: by the attack of the last word (not a burn or a god's gift)
function achKill(e, byWord) {
  if (!achOn() || !B) return;
  achCount('foe:' + e.key); achSetAdd('foeTypes', e.key);
  const w = byWord ? B.achWord : null;
  if (e.key === 'lintvern' && w) S.run.achLastWord = w;
  achCheck('kill', { foe: e.key, word: w, domain: !!(w && B.achDomain), noRepeat: !B.achRepeat });
}
// a hero falls, a hero is raised, a hero loses health in this battle
function achFell() { if (B) B.achFell = true; }
function achRevived() { if (B) B.achRevived = true; }
function achHurt() { if (B) B.achHurt = true; }
// a battle won (before the fallen rise); boss: a boss stop
function achBattleWon(node) {
  if (!achOn() || !B) return;
  achCount('battlesWon');
  const fin = node.stop && node.stop.kind === 'boss' && S.run.ri === WORLD.regions.length - 1;
  if (fin) S.run.achFinal = { party: HEROES.map(hr => hr.id), alive: HEROES.filter((hr, k) => !S.heroes[k].down).map(hr => hr.id) };
  achCheck('battleWon', { boss: !!(node.stop && node.stop.kind === 'boss'), fell: !!B.achFell, hurt: !!B.achHurt, revived: !!B.achRevived });
}
// a god beaten in a shrine's challenge
function achGodBeaten(id) { if (!achOn()) return; achSetAdd('godsBeaten', id); achCheck(); }
// a chest opened with the right word; a rock slide survived without a wound
function achChest() { if (!achOn()) return; achCount('chests'); achCheck(); }
function achSlide() { if (!achOn()) return; achCount('slides'); achCheck(); }
// a hero joins on the road (not the one you start with); a god travelling with the party
function achRecruit(id) { if (!achOn()) return; achCount('recruits'); if (isGod(id)) S.run.achGod = true; achCheck(); }
function achWithdraw() { if (S.run) S.run.achWithdrew = true; }
function achGift() { if (S.run) S.run.achGift = true; }
// leaving region i for i + 1
function achRegion(from, to) {
  if (!achOn()) return;
  achCheck('regionLeft', { region: WORLD.regions[from].id });
  achCheck('regionEntered', { region: WORLD.regions[to].id });
}
// the journey won: Lintvern beaten (src/journey.js renderEnding); who was alive is taken at the win, before anyone rose
function achJourneyWon() {
  const R = S.run;
  if (!achOn() || R.achDone) return;
  R.achDone = true;
  const F = R.achFinal || { party: HEROES.map(hr => hr.id), alive: HEROES.filter((hr, k) => !S.heroes[k].down).map(hr => hr.id) };
  achSetAdd('knowsWon', S.know);
  F.party.forEach(id => achSetAdd(isGod(id) ? 'godsWon' : 'folkWon', id));
  achCheck('journeyWon', { party: F.party, alive: F.alive, withdrew: !!R.achWithdrew, solo: (R.achMaxParty || HEROES.length) === 1,
    noGod: !R.achGod && !F.party.some(isGod) && !R.achGift, know: S.know, mode: S.mode, lastWord: R.achLastWord || null });
}
// the party's size through the journey (for Sam na poti)
function achParty() { if (S.run) S.run.achMaxParty = Math.max(S.run.achMaxParty || 0, HEROES.length); }

// ---------------------------------------------------------------- skill cards: a skill's painted card is collected the first time it fires
// in a real journey battle (Game Director, 25 Nov 2026); practice battles and test mode do not count
const skillCardKey = (id, tier) => `${id}:${tier}`;
const hasSkillCard = (id, tier) => !!ACHP.cards.skill[skillCardKey(id, tier)];
function achSkillFired(id, tier) {
  const key = skillCardKey(id, tier);
  if (!achOn() || !BGX.cards[key] || ACHP.cards.skill[key]) return;
  ACHP.cards.skill[key] = Date.now(); achSave();
  const ch = CHARS.find(c => c.id === id);
  achToast(`Nova karta: ${ch.moves[tier - 1]} (${ch.name})`);
}

// ---------------------------------------------------------------- the page: Dosežki in junaki
function achSection() {
  const all = ACH.achievements, done = all.filter(a => ACHP.unlocked[a.id]).length;
  const item = a => {
    const got = !!ACHP.unlocked[a.id], p = achProgress(a), secret = a.hidden && !got;
    const lockedHero = a.card && a.group === 'Zgodbe' && !UNLOCKED.has(a.card);
    const title = secret || lockedHero ? '???' : a.title;
    const text = secret ? 'Skrivni dosežek.' : lockedHero ? 'Karta junaka, ki ga še ne poznaš.' : a.text;
    return h('li', { class: 'ach t-' + a.tier + (got ? ' got' : '') + (secret || lockedHero ? ' secret' : ''), 'data-ach': a.id },
      h('span', { class: 'ach-icon', 'aria-hidden': 'true' }, a.icon ? h('img', { src: a.icon, alt: '' }) : (secret || lockedHero ? '?' : a.group[0])),
      h('div', { class: 'ach-body' },
        h('b', {}, title, h('span', { class: 'ach-tier' }, ACH_TIERS[a.tier])),
        h('span', { class: 'ach-text' }, text),
        p && !got && !secret ? h('div', { class: 'ach-bar', title: `${p[0]} od ${p[1]}` }, h('i', { style: { width: (100 * p[0] / p[1]) + '%' } }), h('span', {}, `${p[0]}/${p[1]}`)) : null,
        got ? h('span', { class: 'ach-when' }, 'Doseženo ' + new Date(ACHP.unlocked[a.id]).toLocaleDateString('sl-SI')) : null));
  };
  const cards = all.filter(a => a.group === 'Zgodbe');
  return h('section', { class: 'achs' },
    h('h2', {}, 'Dosežki', h('span', { class: 'tag' }, `${done} od ${all.length}`)),
    h('p', { class: 'muted sec-lead' }, 'Štejejo le bitke na poti, ne vadba in ne preizkusni način. Napredek ostane tudi, ko začneš novo pot.'),
    ACH.groups.filter(g => g !== 'Zgodbe').map(g => h('div', { class: 'achgroup' }, h('h3', {}, g),
      h('ul', { class: 'achlist' }, all.filter(a => a.group === g).map(item)))),
    h('div', { class: 'achgroup' }, h('h3', {}, 'Karte zgodb', h('span', { class: 'tag' }, `${cards.filter(a => ACHP.cards.story[a.card]).length} od ${cards.length}`)),
      h('p', { class: 'muted sec-lead' }, 'Karto zgodbe dobi junak, ki je živ v družini, ko pade Lintvern. Slike kart še nastajajo.'),
      h('ul', { class: 'achlist storycards' }, cards.map(item))),
    h('div', { class: 'achreset' }, achResetButton()));
}
// Ponastavi: two presses, so the profile is never cleared by one stray tap
function achResetButton() {
  const b = h('button', { class: 'btn small', onclick: () => {
    if (!b.classList.contains('sure')) { b.classList.add('sure'); b.textContent = 'Res izbrišem vse dosežke in karte? Pritisni še enkrat.'; return; }
    achReset(); go('heroes');
  } }, 'Ponastavi dosežke');
  return b;
}

// ---------------------------------------------------------------- the hero screen: the hero's card ↔ the folk skill cards
// (docs/progression-design.md §11.8, approved 16 Nov 2026). A collected card shows Codex's painting, the skill's name and
// what it does; one still to collect is a dark board with ???. A tapped card opens full screen; a tap or Esc closes it.
const heroHasPaintings = id => [1, 2, 3].some(t => BGX.cards[skillCardKey(id, t)]);
const skillCardText = (id, t) => fxText(isReviewed(id) ? rankText(id, t, 1) : SKILL_TEXT[id][t - 1]);
function heroCardBox(id, flip, flipBtn) {
  const box = h('div', { class: 'hm-card' }, flip);
  if (!heroHasPaintings(id)) { box.append(h('div', { class: 'hm-actions' }, flipBtn)); return box; }
  const grid = skillCardsView(id);
  grid.hidden = true;
  const toggle = h('button', { class: 'btn', 'aria-pressed': 'false', onclick: () => {
    const on = grid.hidden; grid.hidden = !on; flip.hidden = on; flipBtn.hidden = on;
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false'); toggle.textContent = on ? 'Karta junaka' : 'Karte veščin';
    sfx('sel', { rate: on ? 1.2 : .8 });
  } }, 'Karte veščin');
  box.append(grid, h('div', { class: 'hm-actions' }, flipBtn, toggle));
  return box;
}
function skillCardsView(id) {
  const ch = CHARS.find(c => c.id === id), n = [1, 2, 3].filter(t => hasSkillCard(id, t)).length;
  return h('div', { class: 'skillcards', style: { '--c': ch.c } },
    h('p', { class: 'muted sc-lead' }, `Karte veščin: ${n} od 3. Karto dobiš, ko junak veščino prvič uporabi v bitki na poti.`),
    h('ul', {}, [1, 2, 3].map(t => {
      const P = BGX.cards[skillCardKey(id, t)];
      if (!P) return null;
      if (!hasSkillCard(id, t)) return h('li', { class: 'sc locked' }, h('div', { class: 'sc-board', 'aria-hidden': 'true' }, '???'),
        h('div', { class: 'sc-cap' }, h('b', {}, '???'), h('span', {}, `Veščina ${t} · še ni zbrana`)));
      return h('li', { class: 'sc' }, h('button', { class: 'sc-open', 'aria-label': `${ch.moves[t - 1]}: odpri karto čez ves zaslon`, onclick: () => openSkillCard(id, t) },
        h('img', { src: P.src, alt: '', draggable: 'false' })),
        h('div', { class: 'sc-cap' }, h('b', {}, ch.moves[t - 1]), h('span', {}, skillCardText(id, t))));
    })));
}
function openSkillCard(id, t) {
  if (S.bagEl) return;
  const ch = CHARS.find(c => c.id === id), P = BGX.cards[skillCardKey(id, t)];
  const close = () => { ov.remove(); S.bagEl = null; S.overlayKey = null; };
  const ov = h('div', { class: 'cardview', role: 'dialog', 'aria-modal': 'true', 'aria-label': `${ch.moves[t - 1]} (${ch.name})`, tabindex: '-1', onclick: close },
    h('figure', {}, h('img', { src: P.src, alt: `${ch.moves[t - 1]} — ${ch.name}` }),
      h('figcaption', {}, h('div', {}, h('b', {}, ch.moves[t - 1]), ` · ${ch.name}`), h('span', {}, skillCardText(id, t)))),
    h('span', { class: 'cv-hint' }, S.mobile ? 'Tapni za zapiranje' : 'Klikni ali pritisni Esc za zapiranje'));
  document.body.append(ov); S.bagEl = ov; ov.focus();
  S.overlayKey = e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); } };
}
// Liki in karte (developer gallery): all of Codex's skill cards, collected or not
function galleryPaintedCards() {
  const keys = Object.keys(BGX.cards);
  if (!keys.length) return [];
  return [h('h2', {}, 'Ljudske karte veščin (Codex)'),
    h('p', { class: 'lead' }, `Vseh ${keys.length} slik kart veščin. V bitki jih pokaže različica B preizkusa kart (Nastavitve → Razvoj → Kakovost slik → Visoka ali ?karte=B); na zaslonu junaka se zbirajo.`),
    h('div', { class: 'gpaint' }, CHARS.filter(c => heroHasPaintings(c.id)).map(c => [1, 2, 3].map(t => {
      const P = BGX.cards[skillCardKey(c.id, t)]; if (!P) return null;
      return h('figure', {}, h('button', { class: 'sc-open', onclick: () => openSkillCard(c.id, t) }, h('img', { src: P.src, alt: '', loading: 'lazy' })),
        h('figcaption', {}, `${c.name}: ${c.moves[t - 1]}`, hasSkillCard(c.id, t) ? ' ✓' : ''));
    })))];
}
