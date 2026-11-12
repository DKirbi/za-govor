// ============================================================ journey: one walk across Slovenia
// The game is a single side-scrolling road: region after region (data/world.json), each with
// stops — battles with random enemies, chests, rock slides, wells, pedlars, heroes to meet and
// one shrine. You start with one hero; up to four travel together and only one of them may be
// a god. Health does not come back after a battle: it is restored at wells.
const WORLD = JSON.parse($('#worlddata').textContent);
const ITEMS = Object.fromEntries(WORLD.items.map(it => [it.id, it]));
const TV_SPEED = 240;                      // walking speed, world pixels per second
function has(id) { return !!(S.run && S.run.relics.includes(id)); }

// ------------------------------------------------------------ who can start a journey
// Martin Krpan, Zeleni Jurij and Kurent can start the first journey. Everyone else is unknown
// (a silhouette on the start screen) until met on the road; a met character is unlocked for
// later journeys, remembered in this browser. That includes a god met at the shrine.
const STARTERS = ['krpan', 'jurij', 'kurent'];
const UNLOCKED = new Set(STARTERS);
try { JSON.parse(localStorage.getItem('zg-unlocked') || '[]').forEach(id => { if (ROSTER[id]) UNLOCKED.add(id); }); } catch (e) { /* no storage */ }
function unlock(id) {
  if (UNLOCKED.has(id)) return false;
  UNLOCKED.add(id); try { localStorage.setItem('zg-unlocked', JSON.stringify([...UNLOCKED])); } catch (e) { /* no storage */ }
  return true;
}
const canStart = id => S.testMode || UNLOCKED.has(id);
const starterChoices = () => CHARS.filter(c => canStart(c.id)).map(c => c.id);

// backstories of the four heroes added with the journey
Object.assign(LORE, {
  erazem: { story: ['Erazem Predjamski je bil vitez iz 15. stoletja, gospodar gradu v skalni steni pri Postojni. Ko se je zameril cesarju, ga je vojska oblegala leto in dan.', 'Po skrivnem rovu skozi jamo je dobival svežo hrano in oblegovalcem za posmeh metal češnje. Izročilo pravi, da ga je izdal sluga in da ga je topovska krogla zadela na stranišču.'],
    meet: 'Moj grad ne pade. Če greste na zmaja, grem z vami — rov poznam le jaz.', after: 'Leto in dan sem zdržal. To je bila malenkost.' },
  klepec: { story: ['Peter Klepec je bil šibek pastirček iz Osilnice ob Kolpi, ki so ga drugi pastirji zmerjali in tepli.', 'Ko je na paši speče vile zasenčil pred soncem, so mu v zahvalo dale veliko moč. Odtlej je ruval drevesa in branil dolino pred sovražniki.'],
    meet: 'Majhen sem, a drevo izrujem z eno roko. Smem zraven?', after: 'Vile bi bile zadovoljne.' },
  vida: { story: ['Lepa Vida je junakinja ljudske pesmi, ki jo je zapisal tudi Prešeren. Ob morju je prala plenice, ko jo je črni zamorec zvabil na ladjo z obljubo zdravila za bolnega otroka.', 'V tujini je vsak dan stala ob oknu in spraševala sonce in luno po domu. Postala je podoba hrepenenja.'],
    meet: 'Predolgo sem gledala čez morje. Grem z vami, da spet vidim dom.', after: 'Morje je mirno. Za zdaj.' },
  ajda: { story: ['Ajdovska deklica je bila dobra velikanka s Prisanka. Popotnike je vodila čez prelaz Vršič in jim v snegu kazala pot.', 'Bila je tudi rojenica. Ko je otroku napovedala, da bo ustrelil Zlatoroga, so jo sestre preklele in okamnela je. Njen obraz še danes gleda iz stene Prisanka.'],
    meet: 'Vidim, kam vodi vaša pot. Pol mene je že kamen — druga polovica gre z vami.', after: 'Skala pomni. Tudi tole si bo zapomnila.' },
});

// ------------------------------------------------------------ small helpers
const itemIcon = id => h('i', { class: 'icon', style: { 'background-image': `url(${ICONS[id]})` } });
// a still sprite for things on the road; frame 1 is the second state (open chest, drawn bucket)
function objEl(id, frame = 0, cls = '') {
  return h('div', { class: 'actor spr obj ' + cls, style: { '--art': SPR_SIZE[id] } },
    h('i', { class: 'sp', style: { 'background-image': `url(${SPRITES[id]})`, 'background-position': frame ? '100% 0' : '0 0' } }));
}
function gainGold(n) { const g = Math.round(n * (has('velesov-rog') ? 1.5 : 1)); if (S.run) S.run.gold += g; return g; }
function giveItem(id) {
  const R = S.run, it = ITEMS[id]; if (!R || !it) return;
  if (it.kind === 'relic') {
    if (R.relics.includes(id)) return;
    R.relics.push(id);
    if (id === 'alatir') S.heroes.forEach(st => { const mh = heroMaxHp(st.id, st.lvl); if (!st.down) st.hp += mh - st.maxHp; st.maxHp = mh; });
  } else R.bag[id] = (R.bag[id] || 0) + 1;
}
// a random item the party does not own yet (relics are never doubled)
function randomItem(kind) {
  const R = S.run; if (!R) return null;
  const k = kind || (Math.random() < 0.4 ? 'relic' : 'use');
  const pool = WORLD.items.filter(it => it.kind === k && !R.relics.includes(it.id));
  return pool.length ? pick(pool) : pick(WORLD.items.filter(it => it.kind === 'use'));
}
// can this item be used by hand right now? (Živa voda is drunk automatically in battle)
const bagCount = () => S.run ? Object.values(S.run.bag).reduce((a, n) => a + n, 0) : 0;

// ------------------------------------------------------------ potions and poisons work by themselves
// What a potion does. `arg` is a hero index or an enemy, chosen by the trigger in autoItems.
// Returns a line of text, or null when it would change nothing (then it is not spent).
function applyItem(id, arg) {
  const foes = B ? B.enemies.filter(e => e.hp > 0) : [];
  if (id === 'ziva-voda') { const st = S.heroes[arg]; if (!st || st.down || st.hp >= st.maxHp) return null;
    const got = Math.min(st.maxHp - st.hp, Math.round(st.maxHp * POTION_HEAL)); st.hp += got; return `${HEROES[arg].name} popije živo vodo: +${got} zdravja.`; }
  if (id === 'mrtva-voda') { const st = S.heroes[arg]; if (!st || !st.down) return null; st.down = false; st.hp = Math.max(1, Math.round(st.maxHp * 0.5)); return `Mrtva voda: ${HEROES[arg].name} spet vstane.`; }
  if (!B) return null;
  if (id === 'perunova-medica') { B.boost = 3; return 'Perunova medica: prve tri besede udarijo močneje.'; }
  if (id === 'triglavov-napoj') { if (B.meter >= METER_MAX) return null; B.meter = METER_MAX; return 'Triglavov napoj: zagovor je poln.'; }
  if (id === 'vesnin-venec') { B.shield = Math.min(30, B.shield + 15); return 'Vesnin venec: ščit družine +15.'; }
  if (id === 'rusalkina-solza') { B.grid.forEach(x => { x.lockUntil = 0; x.lockWords = 0; x.flood = false; }); B.sleep = {}; return 'Rusalkina solza: črke so čiste, junaki budni.'; }
  if (id === 'velesov-strup') { if (!arg) return null; applyBurn(arg, 2.8, 'zastrupljen', true); return `Velesov strup: ${arg.name} je zastrupljen.`; }
  if (id === 'volcja-jagoda') { if (!arg) return null; arg.atk = Math.max(1, Math.round(arg.atk * 0.7)); return `Volčja jagoda: ${arg.name} napada šibkeje.`; }
  if (id === 'morin-prah') { if (!foes.length) return null; foes.forEach(e => { if (S.mode === 'real') e.stunUntil = Math.max(e.stunUntil, B.time + 8); else e.stunWords = Math.max(e.stunWords, 2); }); return 'Morin prah: sovražniki zaspijo.'; }
  if (id === 'kresna-zerjavica') { if (!foes.length) return null; foes.forEach(e => applyBurn(e, 2.5)); return 'Kresna žerjavica: vsi sovražniki gorijo.'; }
  return null;
}
// Heroes use what the party carries without being told. `when`:
//   'start' — a battle begins: one opening potion in an ordinary battle, every kind against an ambush or a boss
//   'tick'  — during a battle (twice a second and after every hit): hurt or fallen heroes, locked letters
//   'road'  — outside battles: only the two waters
function autoItems(when) {
  const R = S.run; if (!R) return [];
  const inB = !!B && S.screen === 'battle' && !B.over, used = [];
  const spend = (id, arg) => {
    if (!(R.bag[id] > 0)) return false;
    const msg = applyItem(id, arg); if (!msg) return false;
    R.bag[id]--; used.push(id); sfx(ITEMS[id].poison ? 'venom' : 'heal', { vol: .7 });
    if (inB) { log(msg); fb(msg, 'ok'); if (UI.party) floatOn(typeof arg === 'number' && UI.heroEls[arg] ? UI.heroEls[arg] : arg && arg.el ? arg.el : UI.party, ITEMS[id].name, ITEMS[id].poison ? 'burn' : 'heal'); }
    else R.lastAuto = msg;
    return true;
  };
  if (when === 'start') {
    if (!inB) return used;
    const foes = B.enemies.filter(e => e.hp > 0), big = !!(B.node.stop && B.node.stop.kind !== 'battle');
    const top = key => foes.slice().sort((a, b) => b[key] - a[key])[0];
    for (const id of ['triglavov-napoj', 'perunova-medica', 'kresna-zerjavica', 'velesov-strup', 'volcja-jagoda']) {
      if (spend(id, id === 'velesov-strup' ? top('hp') : id === 'volcja-jagoda' ? top('atk') : null) && !big) break;
    }
  } else {
    S.heroes.forEach((st, k) => { if (st.down) spend('mrtva-voda', k); });
    S.heroes.forEach((st, k) => { if (!st.down && st.hp > 0 && st.hp <= st.maxHp * POTION_AT) spend('ziva-voda', k); });
    if (inB && when === 'tick') {
      const low = f => living().some(k => S.heroes[k].hp <= S.heroes[k].maxHp * f);
      if (B.shield <= 0 && low(0.5) && !B.usedVenec && spend('vesnin-venec')) B.usedVenec = true;
      if (low(0.4) && !B.usedPrah && spend('morin-prah')) B.usedPrah = true;
      if ((B.grid.filter(isLocked).length >= 4 || Object.keys(B.sleep).length) && !B.cw) spend('rusalkina-solza');
    }
  }
  if (used.length && inB) { renderParty(); renderEnemies(); renderSide(); renderPartyHp(); if (!B.cw) renderPuzzle(); }
  return used;
}

// The bag only shows what the party carries: relics work all the time, potions wait for their moment.
function openBag() {
  const R = S.run; if (!R || S.bagEl) return;
  const inB = !!B && S.screen === 'battle' && !B.over;
  if (inB && B.cw) return;
  const was = inB ? B.paused : false; if (inB) B.paused = true;
  const close = () => { ov.remove(); S.bagEl = null; S.overlayKey = null; if (inB && B) B.paused = was; };
  const uses = Object.keys(R.bag).filter(id => R.bag[id] > 0);
  const row = (id, n) => h('div', { class: 'itemrow' }, itemIcon(id), h('div', {}, h('b', {}, ITEMS[id].name, n > 1 ? ` ×${n}` : ''), h('span', {}, ITEMS[id].text)));
  const ov = h('div', { class: 'overlay', onclick: e => { if (e.target === ov) close(); } }, h('div', { class: 'dialog bag' },
    h('h2', {}, 'Torba', h('span', { class: 'goldtag' }, h('i', { class: 'coin' }), R.gold)),
    h('h4', {}, 'Napoji in strupi (junaki jih uporabijo sami)'),
    uses.length ? h('div', { class: 'itemlist' }, uses.map(id => row(id, R.bag[id]))) : h('p', { class: 'muted' }, 'Torba je prazna. Napoje in strupe prodaja krošnjar, nekaj jih je tudi v skrinjah.'),
    h('h4', {}, 'Predmeti (delujejo ves čas)'),
    R.relics.length ? h('div', { class: 'itemlist' }, R.relics.map(id => row(id, 1))) : h('p', { class: 'muted' }, 'Še nobenega predmeta.'),
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: close }, 'Zapri ', h('kbd', {}, 'Esc')))));
  document.body.append(ov); S.bagEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close(); } };
}

// ------------------------------------------------------------ choosing the first hero
function renderPick() {
  const ids = starterChoices(), list = ids.map(id => CHARS.find(c => c.id === id));
  S.pickSel = clamp(S.pickSel, 0, list.length - 1);
  const ch = list[S.pickSel], K = ROSTER[ch.id];
  const locked = CHARS.length - ids.length;
  SCR.append(h('div', { class: 'pick' },
    h('div', { class: 'logo', style: { 'font-size': '30px' } }, 'Kdo gre na pot?'),
    h('p', { class: 'lead' }, 'Izberi enega junaka. Na začetku so znani trije: Martin Krpan, Zeleni Jurij in Kurent. Drugi so še sence — ko koga srečaš na poti, ga spoznaš in naslednjič lahko začneš tudi z njim.' + (locked ? ` Še neznanih: ${locked}.` : ' Spoznal si vse.') + (S.testMode ? ' (Preizkusni način: na izbiro so vsi.)' : '')),
    h('div', { class: 'pickgrid' }, CHARS.map(c => { const i = ids.indexOf(c.id);
      return i < 0 ? h('div', { class: 'pickcard locked', title: 'Še neznan: srečaš ga na poti' }, h('i', { class: 'shade', style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, '???'), h('span', {}, 'še neznan'))
        : h('button', { class: 'pickcard' + (i === S.pickSel ? ' on' : '') + (isGod(c.id) ? ' god' : ''), style: { '--c': c.c }, 'aria-pressed': i === S.pickSel ? 'true' : 'false',
          onclick: () => { if (S.pickSel === i) return startJourney(); S.pickSel = i; sfx('sel'); mountShell(); renderPick(); } },
          h('i', { style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, c.name), h('span', {}, isGod(c.id) ? 'bog' : ROSTER[c.id].role)); })),
    h('div', { class: 'pickinfo', style: { '--c': ch.c } },
      h('div', { class: 'spirit' }, spriteEl(ch.id, ch.c)),
      h('div', {},
        h('h2', {}, ch.name, h('span', { class: 'gtag', style: { '--tc': ST_LABEL[CHAR_ST[ch.id]][1] } }, ST_LABEL[CHAR_ST[ch.id]][0])),
        h('p', { class: 'muted' }, ch.sub),
        h('div', { class: 'stats' },
          h('div', {}, 'Zdravje'), h('div', {}, HERO_HP[ch.id]),
          h('div', {}, 'Napadi'), h('div', {}, ch.moves.join(' → ')),
          h('div', {}, 'Največji napad'), h('div', {}, ch.extra),
          h('div', {}, 'Njegove besede (×1,5)'), h('div', {}, K.domain.slice(0, 5).join(', ') + ' …')),
        h('div', { class: 'row', style: { 'justify-content': 'flex-start' } },
          h('button', { class: 'btn primary', onclick: startJourney }, 'Na pot ', h('kbd', {}, 'Enter')),
          h('button', { class: 'btn', onclick: () => go('title') }, 'Nazaj'))))));
}
function pickKey(e) {
  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (d) { e.preventDefault(); const n = starterChoices().length; S.pickSel = (S.pickSel + d + n) % n; sfx('sel'); mountShell(); renderPick(); }
  else if (e.key === 'Enter') { e.preventDefault(); startJourney(); }
  else if (e.key === 'Escape') go('title');
}
function startJourney() { const ids = starterChoices(); newRun(ids[clamp(S.pickSel, 0, ids.length - 1)]); S.pickSel = 0; go('travel'); }

// ------------------------------------------------------------ a run and its regions
function newRun(starterId) {
  S.run = { ri: 0, x: 0, endX: 0, stops: [], gold: S.testMode ? 200 : 20, relics: [], bag: {}, rozaUsed: false, jurijUsed: false,
    battles: 0, words: 0, firstBattle: true, met: [starterId], walking: false, prompt: null, starter: starterId };
  setParty([starterId]); S.meterBonus = 0;
  enterRegion(0);
}
function enemyGroup(reg, ri, kind) {
  const R = S.run;
  if (kind === 'boss') return reg.boss.slice();
  if (R.firstBattle && ri === 0 && !R.stops.length) return [reg.pool[0]];          // the very first fight is one škrat
  const n = HEROES.length <= 1 && kind !== 'elite' ? 1 : 2;
  return Array.from({ length: n }, () => pick(reg.pool));
}
function enterRegion(i) {
  const R = S.run, reg = WORLD.regions[i], gap = WORLD.stopGap;
  R.ri = i; R.x = 0; R.stops = []; R.prompt = null; R.walking = false;
  reg.stops.forEach((kind, n) => {
    const stop = { kind, x: (n + 1) * gap, done: false, passed: false };
    if (kind === 'battle' || kind === 'elite' || kind === 'boss') stop.enemies = enemyGroup(reg, i, kind);
    else if (kind === 'hero') {
      // a random folk hero you have not met on this journey; heroes you never unlocked come first
      const free = id => !R.met.includes(id) && !HEROES.some(x => x.id === id);
      const others = CHARS.filter(c => !isGod(c.id) && free(c.id)).map(c => c.id), fresh = others.filter(id => !UNLOCKED.has(id));
      stop.hero = fresh.length ? pick(fresh) : others.length ? pick(others) : null;
      if (stop.hero) R.met.push(stop.hero); else stop.kind = 'well';
    } else if (kind === 'god') stop.gods = shuffle(CHARS.filter(c => isGod(c.id)).map(c => c.id)).slice(0, 3);
    else if (kind === 'shop') {
      const relics = shuffle(WORLD.items.filter(it => it.kind === 'relic' && !R.relics.includes(it.id))).slice(0, 2);
      stop.stock = shuffle(WORLD.items.filter(it => it.kind === 'use')).slice(0, 4).concat(relics).map(it => ({ id: it.id, sold: false }));
    }
    R.stops.push(stop);
  });
  R.endX = (reg.stops.length + 1) * gap;
}
const nextStop = () => S.run.stops.find(s => !s.passed);

// ------------------------------------------------------------ the travel screen
function renderTravel() {
  const R = S.run; if (!R) return go('title');
  autoItems('road');
  const reg = WORLD.regions[R.ri], T = UI.tv = { objs: [] };
  SCR.innerHTML = '';
  const scene = h('div', { class: 'scene hasbg travel', ref: el => T.scene = el,
    style: { 'background-image': `linear-gradient(rgba(14,16,26,.2), rgba(14,16,26,.05)), url(${BG[reg.bg]})` } },
    h('div', { class: 'road', ref: el => T.road = el, style: { 'background-image': `url(${ART.road})` } }),
    h('div', { class: 'tv-objs', ref: el => T.layer = el }),
    h('div', { class: 'party', ref: el => T.party = el }));
  R.stops.forEach(stop => {
    let body, cap;
    if (stop.enemies) {
      if (stop.done) return;
      body = h('div', { class: 'tv-foes' }, stop.enemies.map((k, n) => { const e = ENEMIES[k], art = e.art || k;
        return h('div', { class: 'actor foe spr' + (e.boss ? ' boss' : ''), style: { '--art': SPR_SIZE[art] } }, h('i', { class: 'sp', style: { 'background-image': `url(${SPRITES[art]})`, filter: e.tint || '', 'animation-delay': (-n * 400) + 'ms' } })); }));
      cap = stop.kind === 'boss' ? 'Šef' : stop.kind === 'elite' ? 'Zaseda' : 'Sovražniki';
    } else if (stop.kind === 'chest') { body = objEl('skrinja', stop.done ? 1 : 0); cap = stop.done ? '' : 'Skrinja'; }
    else if (stop.kind === 'trap') { if (stop.done) return; body = objEl('plaz'); cap = 'Plaz'; }
    else if (stop.kind === 'darts') { body = objEl('puscice', stop.done ? 1 : 0); cap = stop.done ? '' : 'Puščice'; }
    else if (stop.kind === 'well') { body = objEl('vodnjak', stop.done ? 1 : 0); cap = 'Vodnjak'; }
    else if (stop.kind === 'shop') { body = objEl('krosnjar', 0, 'mirror npc'); cap = 'Krošnjar'; }
    else if (stop.kind === 'god') { body = objEl('svetisce', 0, 'npc'); cap = 'Svetišče'; }
    else if (stop.kind === 'hero') { if (stop.done) return; body = h('div', { class: 'mirror' }, spriteEl(stop.hero, ROSTER[stop.hero].c)); cap = ROSTER[stop.hero].name; }
    const el = h('div', { class: 'tv-obj' }, cap ? h('span', { class: 'cap' }, cap) : null, body);
    T.layer.append(el); T.objs.push({ x: stop.x, el });
  });
  const sign = h('div', { class: 'tv-obj' }, R.ri < WORLD.regions.length - 1 ? h('span', { class: 'cap' }, WORLD.regions[R.ri + 1].name) : null, objEl('kazipot'));
  if (R.ri < WORLD.regions.length - 1) { T.layer.append(sign); T.objs.push({ x: R.endX, el: sign }); }
  HEROES.forEach((hr, k) => { const st = S.heroes[k]; T.party.append(spriteEl(hr.id, hr.c, st.down ? 'down' : '')); });

  SCR.append(h('div', { class: 'travelwrap' },
    h('div', { class: 'bhead' },
      h('div', { class: 't' }, reg.name, h('small', {}, `pokrajina ${R.ri + 1} od ${WORLD.regions.length}`)),
      h('div', { class: 'regdots', title: 'Pot do Ljubljanskega gradu' }, WORLD.regions.map((r, i) => h('i', { class: i < R.ri ? 'done' : i === R.ri ? 'on' : '', title: r.name }))),
      h('button', { class: 'btn small', onclick: () => go('title') }, 'Nastavitve')),
    h('p', { class: 'tv-intro' }, reg.intro),
    scene,
    h('div', { class: 'tv-prompt', ref: el => T.prompt = el }),
    h('div', { class: 'tv-status', ref: el => T.status = el })));
  if (!R.prompt) { const n = nextStop(); if (n && Math.abs(n.x - R.x) < 1) R.prompt = promptFor(n); else if (!n && R.x >= R.endX - 1) R.prompt = promptFor(null); }
  renderTravelPanel(); layoutTravel();
}

// Prompt (what you can do at this stop) and the party strip under the scene
function renderTravelPanel() {
  const R = S.run, T = UI.tv; if (!R || !T || !T.prompt) return;
  T.prompt.innerHTML = ''; T.status.innerHTML = '';
  const P = R.prompt;
  if (P) T.prompt.append(h('div', { class: 'ptext' }, P.icon || null, h('span', {}, P.text)),
    h('div', { class: 'pbtns' }, P.actions.map(a => h('button', { class: 'btn' + (a.primary ? ' primary' : ''), onclick: a.fn }, a.label, a.primary ? h('kbd', { style: { 'margin-left': '6px' } }, 'Enter') : null))));
  else T.prompt.append(h('div', { class: 'ptext' }, h('span', {}, R.walking ? 'Družina hodi …' : 'Pot je prosta.')),
    h('div', { class: 'pbtns' },
      h('button', { class: 'btn primary', onclick: () => travelAct('go') }, R.walking ? 'Postoj ' : 'Naprej ▶ ', h('kbd', {}, '→')),
      S.testMode ? h('button', { class: 'btn', onclick: () => travelAct('skip') }, 'Preskoči postajo') : null,
      S.testMode && R.ri < WORLD.regions.length - 1 ? h('button', { class: 'btn', onclick: () => { enterRegion(R.ri + 1); go('travel'); } }, 'Naslednja pokrajina') : null));
  T.status.append(
    h('div', { class: 'tv-heroes' }, HEROES.map((hr, k) => { const st = S.heroes[k], pct = st.down ? 0 : 100 * st.hp / st.maxHp;
      return h('div', { class: 'tv-hero' + (st.down ? ' isdown' : ''), style: { '--c': hr.c } },
        h('i', { style: { 'background-image': `url(${SPRITES[hr.id]})` } }),
        h('div', {}, h('b', {}, hr.name, hr.god ? h('span', { class: 'godtag' }, 'bog') : null),
          h('div', { class: 'hpbar' + (pct <= 25 ? ' crit' : pct <= 50 ? ' low' : '') }, h('i', { style: { width: pct + '%' } })),
          h('span', { class: 'hpnum' }, st.down ? 'obležal' : `${st.hp}/${st.maxHp} · raven ${st.lvl}`))); }),
      Array.from({ length: 4 - HEROES.length }, () => h('div', { class: 'tv-hero empty' }, 'prosto mesto'))),
    h('div', { class: 'tv-gear' },
      h('span', { class: 'goldtag', title: 'Zlatniki' }, h('i', { class: 'coin' }), R.gold),
      h('span', { class: 'relics' }, R.relics.map(id => h('span', { title: `${ITEMS[id].name}: ${ITEMS[id].text}` }, itemIcon(id)))),
      h('button', { class: 'btn small', onclick: openBag }, `Torba (${Object.values(R.bag).reduce((a, n) => a + n, 0)}) `, h('kbd', {}, 'T'))));
}

// positions: the party stands still, the world slides past it
function layoutTravel() {
  const R = S.run, T = UI.tv; if (!R || !T || !T.scene) return;
  const W = T.scene.clientWidth, Ht = T.scene.clientHeight, k = S.mobile ? 0.62 : 1;
  const anchor = Math.round(W * (S.mobile ? 0.7 : 0.62));
  T.objs.forEach(o => { const sx = anchor + (o.x - R.x) * k; o.el.style.transform = `translateX(${Math.round(sx)}px)`; o.el.style.visibility = sx < -160 || sx > W + 40 ? 'hidden' : ''; o.el.style.opacity = clamp((sx - (anchor - 150)) / 90, 0, 1); });
  T.road.style.backgroundPositionX = Math.round(-R.x * k) + 'px';
  const pan = Math.max(0, Ht * 384 / 120 - W);
  T.scene.style.backgroundPositionX = Math.round(-pan * clamp(R.x / R.endX, 0, 1)) + 'px';
  T.scene.classList.toggle('walking', !!R.walking);
}
function travelTick(dt) {
  const R = S.run, T = UI.tv; if (!R || !T || !T.scene || !document.body.contains(T.scene) || S.bagEl) return;
  if (R.walking && !R.prompt) {
    const n = nextStop(), target = n ? n.x : R.endX;
    R.x = Math.min(target, R.x + TV_SPEED * dt);
    if (R.x >= target) { R.walking = false; R.prompt = promptFor(n); sfx('sel', { rate: .7 }); renderTravelPanel(); }
  }
  layoutTravel();
}

// what the prompt offers at each kind of stop
function promptFor(stop) {
  const R = S.run, reg = WORLD.regions[R.ri];
  const pass = (done = false) => { stop.passed = true; if (done) stop.done = true; R.prompt = null; R.walking = true; go('travel'); };
  const skip = S.testMode && stop ? [{ label: 'Preskoči', fn: () => pass(false) }] : [];
  if (!stop) {
    const next = WORLD.regions[R.ri + 1];
    return { text: `Kažipot kaže naprej: ${next.name}.`, actions: [{ label: `Naprej: ${next.name}`, primary: true, fn: () => { enterRegion(R.ri + 1); sfx('ok'); go('travel'); } }] };
  }
  if (stop.enemies) {
    const names = stop.enemies.map(k => ENEMIES[k].name).join(' in ');
    const lead = stop.kind === 'boss' ? 'Tu ni poti mimo' : stop.kind === 'elite' ? 'Zaseda! Na poti stojita' : 'Pot zapira';
    return { text: `${lead}: ${names}.`, actions: [{ label: 'V boj', primary: true, fn: () => stopBattle(stop) }, ...skip] };
  }
  if (stop.kind === 'chest') return { text: 'Ob poti leži zaklenjena skrinja. Odpre jo prava beseda.', actions: [{ label: 'Odpri skrinjo', primary: true, fn: () => go('chest', { id: 'skrinja', stop }) }, { label: 'Pusti jo', fn: () => pass() }] };
  if (stop.kind === 'darts') return { text: 'Iz starega zidu merijo puščice. Kdor jih zagovori s pravo besedo, jih obrne proti sovražniku.', actions: [{ label: 'Stopi pred zid', primary: true, fn: () => go('darts', { id: 'puscice', stop }) }, ...skip] };
  if (stop.kind === 'trap') return { text: 'S pobočja se usuje plaz kamenja!', actions: [{ label: 'Brani se z besedami', primary: true, fn: () => go('trap', { id: 'plaz', stop }) }, ...skip] };
  if (stop.kind === 'well') {
    const hurt = S.heroes.some(st => st.down || st.hp < st.maxHp), fallen = S.heroes.some(st => st.down);
    return { text: fallen ? 'Vodnjak s hladno, čisto vodo. Tu se junaki pozdravijo in kdor je obležal, spet vstane.' : hurt ? 'Vodnjak s hladno, čisto vodo. Tu se junaki pozdravijo.' : 'Vodnjak s hladno, čisto vodo. Nihče ni ranjen, a požirek ne škodi.',
      actions: [{ label: 'Pij iz vodnjaka', primary: true, fn: () => {
        let got = 0; const up = [];
        S.heroes.forEach((st, k) => { if (st.down) { st.down = false; st.hp = 0; up.push(HEROES[k].name); } got += st.maxHp - st.hp; st.hp = st.maxHp; });
        stop.done = stop.passed = true; sfx('heal');
        R.prompt = { text: got ? `Voda zaceli rane: +${got} zdravja.` + (up.length ? ` Spet na nogah: ${up.join(', ')}.` : '') : 'Voda je dobra. Naprej!', actions: [{ label: 'Naprej ▶', primary: true, fn: () => { R.prompt = null; R.walking = true; renderTravelPanel(); } }] };
        go('travel');
      } }, { label: 'Pojdi mimo', fn: () => pass() }] };
  }
  if (stop.kind === 'shop') return { text: 'Krošnjar iz Ribnice razgrne robo: napoji, strupi in nekaj redkih predmetov.', actions: [{ label: 'Poglej robo', primary: true, fn: () => openShop(stop) }, { label: 'Pojdi mimo', fn: () => pass() }] };
  if (stop.kind === 'hero') return { text: `${ROSTER[stop.hero].name} stoji ob poti.`, actions: [{ label: 'Pozdravi', primary: true, fn: () => meetHero(stop, [stop.hero]) }, { label: 'Pojdi mimo', fn: () => pass() }] };
  if (stop.kind === 'god') {
    if (partyGod() >= 0) return { text: `Staro svetišče. ${HEROES[partyGod()].name} že hodi s teboj, zato se ti ne pridruži noben drug bog — svetišče pa te blagoslovi.`,
      actions: [{ label: 'Sprejmi blagoslov', primary: true, fn: () => { gainXp(40); S.meterBonus = 0.5; sfx('heal'); stop.done = true; R.prompt = { text: 'Blagoslov: +40 izkušenj, zagovor v naslednji bitki začne napolnjen do polovice.', actions: [{ label: 'Naprej ▶', primary: true, fn: () => pass(true) }] }; renderTravelPanel(); } }] };
    return { text: 'Staro svetišče. Trije bogovi poslušajo; eden od njih lahko gre s teboj.', actions: [{ label: 'Stopi k svetišču', primary: true, fn: () => meetHero(stop, stop.gods) }, { label: 'Pojdi mimo', fn: () => pass() }] };
  }
  return { text: '…', actions: [{ label: 'Naprej', primary: true, fn: () => pass() }] };
}
// one entry point for keys, buttons and tests: 'go' = walk / confirm, 'alt' = the second choice, 'skip' = test mode
function travelAct(what) {
  const R = S.run; if (!R || S.screen !== 'travel') return;
  if (what === 'skip') { const n = nextStop(); if (n) { n.passed = true; R.x = n.x; R.prompt = null; go('travel'); } else if (R.ri < WORLD.regions.length - 1) { enterRegion(R.ri + 1); go('travel'); } return; }
  if (R.prompt) { const a = what === 'alt' ? R.prompt.actions[1] : R.prompt.actions.find(x => x.primary); if (a) a.fn(); return; }
  if (what === 'go') { R.walking = !R.walking; audioUnlock(); renderTravelPanel(); }
}
function travelKey(e) {
  if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'd') { e.preventDefault(); if (e.repeat) return; travelAct('go'); }
  else if (e.key === 'Escape') { e.preventDefault(); travelAct('alt'); }
  else if (e.key === 't' || e.key === 'T') { e.preventDefault(); openBag(); }
}

// ------------------------------------------------------------ stops: battle, hero, pedlar
function stopBattle(stop) {
  const R = S.run, reg = WORLD.regions[R.ri], names = stop.enemies.map(k => ENEMIES[k].name).join(', ');
  const boss = stop.kind === 'boss';
  go('battle', { id: reg.id, bg: reg.bg, title: reg.name, sub: (boss ? 'Šef · ' : 'Bitka · ') + names, stop,
    battle: { enemies: stop.enemies, scale: boss ? null : { hp: 1 + 0.1 * R.ri, atk: 1 + 0.06 * R.ri }, finishers: shuffle(Object.keys(FINISHER_FX)).slice(0, 2), meterStart: 0,
      ambush: stop.kind === 'elite' ? 'zaseda' : null, tips: R.firstBattle ? NODES[0].battle.tips : [] } });
}
function meetHero(stop, ids) {
  const R = S.run, back = () => go('travel');
  const leave = () => { stop.passed = true; R.prompt = null; back(); };
  const fresh = ids.filter(id => unlock(id));          // whoever you meet is known from now on and can start a later journey
  go('hero', { kind: 'meet', ids, sel: 0,
    info: A => { const id = A.ids[A.sel], full = HEROES.length >= 4;
      return (fresh.includes(id) ? `${ROSTER[id].name} je odklenjen: odslej lahko pot začneš tudi z njim. ` : '') + (isGod(id) ? 'Bog je močnejši od ljudskih junakov, a s teboj gre le eden. ' : '') + (full ? 'Družina je polna (štirje). Če ga vzameš s seboj, se mora eden od tvojih posloviti.' : `V družini je še prostor (${HEROES.length} od 4).`); },
    actions: A => { const id = A.ids[A.sel], hr = ROSTER[id], join = at => () => { joinHero(id, at); stop.done = stop.passed = true; R.prompt = null; sfx('win', { vol: .6 }); back(); };
      const acts = HEROES.length < 4 ? [{ label: `${hr.name} gre s teboj`, primary: true, fn: join() }]
        : HEROES.map((x, k) => ({ label: `${S.heroes[k].down ? 'Zapusti' : 'Namesto'}: ${x.name}${S.heroes[k].down ? ' (obležal)' : ''}`, fn: join(k) }));
      return acts.concat([{ label: 'Pojdi naprej brez novega junaka', fn: leave }]); } });
}
function openShop(stop) {
  const R = S.run; if (S.bagEl) return;
  const close = () => { ov.remove(); S.bagEl = null; S.overlayKey = null; stop.passed = true; stop.done = true; R.prompt = null; go('travel'); };
  const list = h('div', { class: 'itemlist' }), goldEl = h('span', { class: 'goldtag' });
  const paint = () => {
    goldEl.innerHTML = ''; goldEl.append(h('i', { class: 'coin' }), R.gold); list.innerHTML = '';
    stop.stock.forEach(s => { const it = ITEMS[s.id], can = !s.sold && R.gold >= it.price;
      list.append(h('div', { class: 'itemrow' + (s.sold ? ' sold' : '') }, itemIcon(s.id),
        h('div', {}, h('b', {}, it.name, h('em', {}, it.kind === 'relic' ? 'predmet' : it.poison ? 'strup' : 'napoj')), h('span', {}, it.text)),
        h('button', { class: 'btn small', disabled: !can, onclick: () => { R.gold -= it.price; giveItem(s.id); if (it.kind === 'relic') s.sold = true; sfx('ok'); paint(); } },
          s.sold ? 'prodano' : h('span', { class: 'price' }, h('i', { class: 'coin' }), it.price)))); });
  };
  const ov = h('div', { class: 'overlay' }, h('div', { class: 'dialog bag' },
    h('h2', {}, 'Krošnjar', goldEl),
    h('div', { class: 'shophead' }, objEl('krosnjar', 1, 'npc'), h('p', { class: 'muted' }, '»Suha roba, mokra roba! Napoj za žejo, strup za sovražnika, pa kaj starega iz časov bogov.«')),
    list,
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: close }, 'Hvala, grem naprej ', h('kbd', {}, 'Esc')))));
  paint(); document.body.append(ov); S.bagEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
}

// ------------------------------------------------------------ the end of the road
function renderEnding() {
  const R = S.run || { battles: 0, words: 0, gold: 0, relics: [] };
  SCR.append(h('div', { class: 'title ending' },
    h('div', { class: 'logo' }, 'Ljubljana je rešena'),
    h('div', { class: 'tagline' }, 'Lintvern je premagan. Z grajskega stolpa se vidi vsa pot, ki si jo prehodil — od Ptuja do sem.'),
    h('div', { class: 'folk-rule' }),
    h('div', { class: 'endparty' }, HEROES.map((hr, k) => h('figure', {}, spriteEl(hr.id, hr.c, S.heroes[k].down ? 'down' : ''), h('figcaption', {}, hr.name)))),
    h('div', { class: 'stats' },
      h('div', {}, 'Bitke'), h('div', {}, R.battles), h('div', {}, 'Izrečene besede'), h('div', {}, R.words),
      h('div', {}, 'Zlatniki'), h('div', {}, R.gold), h('div', {}, 'Predmeti'), h('div', {}, R.relics.length ? R.relics.map(id => ITEMS[id].name).join(', ') : '—')),
    h('p', { class: 'thanks' }, 'Hvala, ker si prehodil pot do konca.'),
    inspiredLine(),
    h('div', { class: 'row', style: { 'justify-content': 'flex-start' } }, h('button', { class: 'btn primary', onclick: () => { resetRun(); go('title'); } }, 'Nova pot ', h('kbd', {}, 'Enter')))));
  sfx('win');
}

// ------------------------------------------------------------ gallery: road objects and items
function renderGalleryExtras(wrap) {
  const fig = (id, cap, frame) => h('figure', {}, objEl(id, frame), cap);
  wrap.append(h('h2', {}, 'Na poti'),
    h('p', { class: 'lead' }, 'Postaje ob poti imajo svoje sličice: skrinja (zaprta in odprta), vodnjak, plaz kamenja, svetišče, krošnjar in kažipot do naslednje pokrajine.'),
    h('div', { class: 'gobjs' }, fig('skrinja', 'skrinja'), fig('skrinja', 'odprta skrinja', 1), fig('vodnjak', 'vodnjak'), fig('plaz', 'plaz kamenja'), fig('puscice', 'puščice'), fig('svetisce', 'svetišče'), fig('krosnjar', 'krošnjar'), fig('kazipot', 'kažipot')),
    h('h2', {}, 'Predmeti'),
    h('p', { class: 'lead' }, 'Predmeti delujejo ves čas, napoji in strupi se porabijo. Dobiš jih v skrinjah, pri krošnjarju in od šefov.'),
    h('div', { class: 'itemlist gitems' }, WORLD.items.map(it => h('div', { class: 'itemrow' }, itemIcon(it.id),
      h('div', {}, h('b', {}, it.name, h('em', {}, it.kind === 'relic' ? 'predmet' : it.poison ? 'strup' : 'napoj')), h('span', {}, it.text)), h('span', { class: 'price' }, h('i', { class: 'coin' }), it.price)))));
}

// ============================================================ darts: one letter from every column
// The third timed event. A wall of letters in columns: build a word from left to right by taking
// one letter from each column. You may send it before the last column — a shorter word turns
// fewer darts — and nothing stops you from sending a word that does not exist. Darts you turn
// fly at the enemies of the next battle; the others hit the party.
const DART_COLS = 6, DART_ROWS = 3, DART_DMG = 3, DART_XP = 7, DART_GOLD = 2, DART_STRIKE = 4;
let DART_WORDS = null;
function startDarts(node) {
  if (!DART_WORDS) DART_WORDS = [...new Set(LEMMA.values())].filter(w => w.length === DART_COLS && WORDS.has(w));
  const word = pick(DART_WORDS), t = (S.mode === 'real' ? 35 : 70) * (has('pisanica') ? 1.5 : 1);
  const cols = [...word].map(ch => { const col = [ch]; while (col.length < DART_ROWS) { const x = BAG[rnd(BAG.length)]; if (!col.includes(x)) col.push(x); } return shuffle(col); });
  S.ev = { node, kind: 'darts', word, cols, sel: [], time: t, timeMax: t, done: false, msg: '', msgKind: '' };
  renderDarts();
  showTut('darts');
}
const dartsGuess = () => S.ev.sel.map((r, c) => S.ev.cols[c][r]).join('');
function renderDarts() {
  const E = S.ev; SCR.innerHTML = '';
  const guess = dartsGuess(), n = E.sel.length;
  SCR.append(h('div', { class: 'event darts' },
    h('div', { class: 'bhead' }, h('div', { class: 't' }, 'Puščice v zidu', h('small', {}, 'dogodek na čas')), h('div', { class: 'meta' }, `Družina ${S.partyHp}/${S.maxHp}`)),
    h('div', { class: 'panel' },
      h('div', { class: 'chestbox' }, objEl('puscice', E.done ? 1 : 0, 'big'),
        h('div', {}, 'Iz vsakega stolpca vzemi eno črko, od leve proti desni, in pošlji besedo. Vsaka črka prave besede obrne eno puščico proti sovražnikom naslednje bitke; puščice, ki ostanejo, zadenejo družino. Pošlješ lahko tudi krajšo besedo. Če beseda ne obstaja, poletijo vse nate.')),
      h('div', { class: 'timer', style: { margin: '14px 0 4px' } }, h('i', { ref: el => UI.evTimer = el, style: { width: clamp(100 * E.time / E.timeMax, 0, 100) + '%' } })),
      h('div', { class: 'sendrow' },
        h('div', { class: 'guess' }, E.cols.map((_, c) => h('span', { class: 'lt' }, c < n ? E.cols[c][E.sel[c]] : ''))),
        E.done ? null : h('button', { class: 'btn primary send' + (n >= MINW() ? ' ready' : ''), disabled: n < MINW(), onclick: dartsSubmit }, 'Pošlji ', h('kbd', {}, 'Enter'))),
      h('div', { class: 'dartcols' }, E.cols.map((col, c) => h('div', { class: 'dartcol' + (c === n && !E.done ? ' next' : c > n ? ' later' : '') },
        col.map((ch, r) => h('div', { class: 'tile' + (E.sel[c] === r ? ' sel' : ''), onclick: () => dartsPick(c, r) }, ch))))),
      E.msg ? h('p', { class: 'fb ' + E.msgKind }, E.msg) : null,
      E.done ? h('div', {}, h('button', { class: 'btn primary', onclick: () => finishEvent() }, 'Na pot ', h('kbd', {}, 'Enter')))
      : h('div', { class: 'row', style: { 'justify-content': 'flex-start', 'flex-wrap': 'wrap' } },
        h('button', { class: 'btn small', onclick: () => { E.sel.pop(); renderDarts(); } }, '⌫ Briši'),
        h('button', { class: 'btn small', onclick: () => { E.sel = []; renderDarts(); } }, 'Počisti ', h('kbd', {}, 'Del')),
        h('span', { class: 'muted', style: { 'align-self': 'center' } }, `najmanj ${MINW()} črke`)))));
}
// a letter can be taken in the next free column, or changed in a column already used (later letters are dropped)
function dartsPick(c, r) {
  const E = S.ev; if (E.done || c > E.sel.length) return;
  E.sel = E.sel.slice(0, c).concat(r); sfx('sel', { rate: 1 + c * 0.06 }); renderDarts();
}
function dartsKey(e) {
  const E = S.ev; if (!E) return;
  if (E.done) { if (e.key === 'Enter') finishEvent(); return; }
  if (e.key === 'Enter') { e.preventDefault(); dartsSubmit(); return; }
  if (e.key === 'Backspace') { e.preventDefault(); E.sel.pop(); renderDarts(); return; }
  if (e.key === 'Delete') { E.sel = []; renderDarts(); return; }
  const ch = letterKey(e); if (!ch) return;
  e.preventDefault();
  const c = E.sel.length, r = c < E.cols.length ? E.cols[c].indexOf(ch) : -1;
  if (r >= 0) dartsPick(c, r);
}
function dartsEnd(turned, text, kind) {
  const E = S.ev, left = E.cols.length - turned, d = left * DART_DMG;
  E.done = true; E.turned = turned; E.dmg = 0;
  if (d) { const before = S.partyHp; S.partyHp = Math.max(1, S.partyHp - d); E.dmg = before - S.partyHp; }
  E.xp = turned * DART_XP; E.gold = turned && S.run ? gainGold(turned * DART_GOLD) : 0; E.strike = turned * DART_STRIKE;
  if (E.xp) gainXp(E.xp, null, true);
  if (turned) S.strike = E.strike;
  E.msg = text + (turned ? ` Vsak junak +${E.xp} XP` + (E.gold ? `, +${E.gold} zlatnikov` : '') + `; v naslednji bitki puščice zadenejo vsakega sovražnika za ${E.strike}.` : '') + (E.dmg ? ` Družina −${E.dmg}.` : '');
  E.msgKind = kind; sfx(turned === E.cols.length ? 'win' : turned ? 'ok' : 'bad');
  renderDarts();
}
function dartsSubmit() {
  const E = S.ev; if (E.done) return;
  const w = dartsGuess(); if (w.length < MINW()) return;
  if (!WORDS.has(w)) return dartsEnd(0, `»${UP(w)}« ni beseda: vse puščice poletijo (prava je bila ${UP(E.word)}).`, 'err');
  if (w.length === E.cols.length) return dartsEnd(w.length, `${UP(w)}! Vse puščice se obrnejo.`, 'ok');
  dartsEnd(w.length, `${UP(w)} obrne ${w.length} od ${E.cols.length} puščic; ostale poletijo nate.`, 'warn');
}
function dartsTick(dt) {
  const E = S.ev; if (!E || E.done) return;
  E.time -= dt;
  if (UI.evTimer) UI.evTimer.style.width = clamp(100 * E.time / E.timeMax, 0, 100) + '%';
  if (E.time <= 0) dartsEnd(0, `Prepozno: vse puščice poletijo. Skrita beseda je bila ${UP(E.word)}.`, 'err');
}
// the darts turned at the wall open the next battle
function dartStrike() {
  if (!S.strike || !B) return;
  const d = S.strike; S.strike = 0;
  spawnCard(leadEl(), { tier: 2, c: 'var(--gold)', name: 'Puščice', move: 'Obrnjene puščice', value: `−${d} vsakemu` });
  log(`Obrnjene puščice zadenejo vsakega sovražnika za ${d}.`); sfx('hit2');
  B.enemies.filter(e => e.hp > 0).forEach(e => damageEnemy(e, d));
}
