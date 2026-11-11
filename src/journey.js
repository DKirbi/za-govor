// ============================================================ journey: one walk across Slovenia
// The game is a single side-scrolling road: region after region (data/world.json), each with
// stops — battles with random enemies, chests, rock slides, wells, pedlars, heroes to meet and
// one shrine. You start with one hero; up to four travel together and only one of them may be
// a god. Health does not come back after a battle: it is restored at wells.
const WORLD = JSON.parse($('#worlddata').textContent);
const ITEMS = Object.fromEntries(WORLD.items.map(it => [it.id, it]));
const TV_SPEED = 240;                      // walking speed, world pixels per second
function has(id) { return !!(S.run && S.run.relics.includes(id)); }

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
const bagCount = inBattle => S.run ? Object.entries(S.run.bag).reduce((a, [id, n]) => a + (n > 0 && (inBattle || ITEMS[id].where === 'both') ? n : 0), 0) : 0;

// ------------------------------------------------------------ potions, poisons and other things you use up
// Returns a line of text describing what happened, or null if the item could not be used now.
function useItem(id) {
  const R = S.run, it = ITEMS[id]; if (!R || !it || !(R.bag[id] > 0)) return null;
  const inB = !!B && S.screen === 'battle' && !B.over;
  if (it.where === 'battle' && !inB) return null;
  const t = inB ? cwTarget() : null, foes = inB ? B.enemies.filter(e => e.hp > 0) : [];
  let msg = null;
  if (id === 'ziva-voda') {
    const k = living().filter(i => S.heroes[i].hp < S.heroes[i].maxHp).sort((a, b) => S.heroes[a].hp / S.heroes[a].maxHp - S.heroes[b].hp / S.heroes[b].maxHp)[0];
    if (k != null) { S.heroes[k].hp = S.heroes[k].maxHp; msg = `Živa voda: ${HEROES[k].name} je spet pri polni moči.`; }
  } else if (id === 'mrtva-voda') {
    const k = S.heroes.findIndex(x => x.down);
    if (k >= 0) { const st = S.heroes[k]; st.down = false; st.hp = Math.max(1, Math.round(st.maxHp * 0.5)); msg = `Mrtva voda: ${HEROES[k].name} spet vstane.`; }
  } else if (id === 'perunova-medica') { B.boost = 3; msg = 'Perunova medica: naslednje tri besede udarijo močneje.'; }
  else if (id === 'triglavov-napoj') { if (B.meter < METER_MAX) { B.meter = METER_MAX; msg = 'Triglavov napoj: zagovor je poln.'; } }
  else if (id === 'vesnin-venec') { B.shield = Math.min(30, B.shield + 15); msg = 'Vesnin venec: ščit družine +15.'; }
  else if (id === 'rusalkina-solza') { if (B.grid.some(isLocked) || Object.keys(B.sleep).length) { B.grid.forEach(x => { x.lockUntil = 0; x.lockWords = 0; x.flood = false; }); B.sleep = {}; msg = 'Rusalkina solza: črke so čiste, junaki budni.'; } }
  else if (id === 'velesov-strup') { if (t) { applyBurn(t, 2.8, 'zastrupljen', true); msg = `Velesov strup: ${t.name} — strup deluje.`; } }
  else if (id === 'volcja-jagoda') { if (t) { t.atk = Math.max(1, Math.round(t.atk * 0.7)); msg = `Volčja jagoda: ${t.name} napada šibkeje (napad ${t.atk}).`; } }
  else if (id === 'morin-prah') { if (foes.length) { foes.forEach(e => { if (S.mode === 'real') e.stunUntil = Math.max(e.stunUntil, B.time + 8); else e.stunWords = Math.max(e.stunWords, 2); }); msg = 'Morin prah: sovražniki zaspijo.'; } }
  else if (id === 'kresna-zerjavica') { if (foes.length) { foes.forEach(e => applyBurn(e, 2.5)); msg = 'Kresna žerjavica: vsi sovražniki gorijo.'; } }
  if (!msg) return null;
  R.bag[id]--; sfx(it.poison ? 'venom' : 'heal');
  if (inB) { log(msg); fb(msg, 'ok'); renderParty(); renderEnemies(); renderSide(); if (!B.cw) renderPuzzle(); }
  return msg;
}

// The bag: relics (always on) and things to use. In a battle it pauses the fight while open.
function openBag() {
  const R = S.run; if (!R || S.bagEl) return;
  const inB = !!B && S.screen === 'battle' && !B.over;
  if (inB && B.cw) return;
  const was = inB ? B.paused : false; if (inB) B.paused = true;
  const close = () => { ov.remove(); S.bagEl = null; S.overlayKey = null; if (inB && B) B.paused = was; if (S.screen === 'travel') renderTravelPanel(); };
  const useRow = id => { const it = ITEMS[id], ok = inB || it.where === 'both';
    return h('div', { class: 'itemrow' }, itemIcon(id), h('div', {}, h('b', {}, it.name, R.bag[id] > 1 ? ` ×${R.bag[id]}` : ''), h('span', {}, it.text)),
      h('button', { class: 'btn small', disabled: !ok, title: ok ? '' : 'Uporabno le v bitki', onclick: () => {
        if (inB) { close(); if (!useItem(id)) fb(`${it.name}: zdaj ne bi pomagalo.`, 'warn'); }
        else { const m = useItem(id); note.textContent = m || `${it.name}: zdaj ne bi pomagalo.`; if (m) { close(); openBag(); S.bagEl.querySelector('.bagnote').textContent = m; } }
      } }, ok ? 'Uporabi' : 'v bitki')); };
  const uses = Object.keys(R.bag).filter(id => R.bag[id] > 0), note = h('p', { class: 'bagnote muted' });
  const ov = h('div', { class: 'overlay', onclick: e => { if (e.target === ov) close(); } }, h('div', { class: 'dialog bag' },
    h('h2', {}, 'Torba', h('span', { class: 'goldtag' }, h('i', { class: 'coin' }), R.gold)),
    h('h4', {}, 'Napoji in strupi'),
    uses.length ? h('div', { class: 'itemlist' }, uses.map(useRow)) : h('p', { class: 'muted' }, 'Torba je prazna. Napoje in strupe prodaja krošnjar, nekaj jih je tudi v skrinjah.'),
    inB ? null : h('h4', {}, 'Predmeti (delujejo ves čas)'),
    inB ? null : R.relics.length ? h('div', { class: 'itemlist' }, R.relics.map(id => h('div', { class: 'itemrow' }, itemIcon(id), h('div', {}, h('b', {}, ITEMS[id].name), h('span', {}, ITEMS[id].text)))))
      : h('p', { class: 'muted' }, 'Še nobenega predmeta.'),
    note,
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: close }, 'Zapri ', h('kbd', {}, 'Esc')))));
  document.body.append(ov); S.bagEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close(); } };
}

// ------------------------------------------------------------ choosing the first hero
function renderPick() {
  S.pickSel = clamp(S.pickSel, 0, CHARS.length - 1);
  const ch = CHARS[S.pickSel], K = ROSTER[ch.id];
  SCR.append(h('div', { class: 'pick' },
    h('div', { class: 'logo', style: { 'font-size': '30px' } }, 'Kdo gre na pot?'),
    h('p', { class: 'lead' }, 'Pot začneš z enim junakom. Drugi se ti pridružijo na poti, v družini so največ štirje. Bogovi so močnejši, zato gre s teboj le eden: če začneš z bogom, drugega ne boš več srečal.'),
    h('div', { class: 'pickgrid' }, CHARS.map((c, i) => h('button', { class: 'pickcard' + (i === S.pickSel ? ' on' : '') + (isGod(c.id) ? ' god' : ''), style: { '--c': c.c }, 'aria-pressed': i === S.pickSel ? 'true' : 'false',
      onclick: () => { if (S.pickSel === i) return startJourney(); S.pickSel = i; sfx('sel'); mountShell(); renderPick(); } },
      h('i', { style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, c.name), h('span', {}, isGod(c.id) ? 'bog' : K && ROSTER[c.id].role))),
    ),
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
  if (d) { e.preventDefault(); S.pickSel = (S.pickSel + d + CHARS.length) % CHARS.length; sfx('sel'); mountShell(); renderPick(); }
  else if (e.key === 'Enter') { e.preventDefault(); startJourney(); }
  else if (e.key === 'Escape') go('title');
}
function startJourney() { newRun(CHARS[S.pickSel].id); go('travel'); }

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
      // the hero of this place; if they already travel with you (or were met), someone else is on the road
      const free = id => !R.met.includes(id) && !HEROES.some(x => x.id === id);
      const others = CHARS.filter(c => !isGod(c.id) && free(c.id)).map(c => c.id);
      stop.hero = reg.hero && free(reg.hero) ? reg.hero : others.length ? pick(others) : null;
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
  if (stop.kind === 'trap') return { text: 'S pobočja se usuje plaz kamenja!', actions: [{ label: 'Brani se z besedami', primary: true, fn: () => go('trap', { id: 'plaz', stop }) }, ...skip] };
  if (stop.kind === 'well') {
    const hurt = living().some(k => S.heroes[k].hp < S.heroes[k].maxHp);
    return { text: hurt ? 'Vodnjak s hladno, čisto vodo. Tu se junaki pozdravijo.' : 'Vodnjak s hladno, čisto vodo. Nihče ni ranjen, a požirek ne škodi.',
      actions: [{ label: 'Pij iz vodnjaka', primary: true, fn: () => {
        let got = 0; living().forEach(k => { const st = S.heroes[k]; got += st.maxHp - st.hp; st.hp = st.maxHp; });
        stop.done = stop.passed = true; sfx('heal');
        R.prompt = { text: got ? `Voda zaceli rane: +${got} zdravja. Kdor je obležal, ga zbudi le mrtva voda.` : 'Voda je dobra. Naprej!', actions: [{ label: 'Naprej ▶', primary: true, fn: () => { R.prompt = null; R.walking = true; renderTravelPanel(); } }] };
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
  go('hero', { kind: 'meet', ids, sel: 0,
    info: A => { const id = A.ids[A.sel], full = HEROES.length >= 4;
      return (isGod(id) ? 'Bog je močnejši od ljudskih junakov, a s teboj gre le eden. ' : '') + (full ? 'Družina je polna (štirje). Če ga vzameš s seboj, se mora eden od tvojih posloviti.' : `V družini je še prostor (${HEROES.length} od 4).`); },
    actions: A => { const id = A.ids[A.sel], hr = ROSTER[id], join = at => () => { joinHero(id, at); stop.done = stop.passed = true; R.prompt = null; sfx('win', { vol: .6 }); back(); };
      const acts = HEROES.length < 4 ? [{ label: `${hr.name} gre s teboj`, primary: true, fn: join() }]
        : HEROES.map((x, k) => ({ label: `Namesto: ${x.name}${S.heroes[k].down ? ' (obležal)' : ''}`, fn: join(k) }));
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
    h('div', { class: 'row', style: { 'justify-content': 'flex-start' } }, h('button', { class: 'btn primary', onclick: () => { resetRun(); go('title'); } }, 'Nova pot ', h('kbd', {}, 'Enter')))));
  sfx('win');
}

// ------------------------------------------------------------ gallery: road objects and items
function renderGalleryExtras(wrap) {
  const fig = (id, cap, frame) => h('figure', {}, objEl(id, frame), cap);
  wrap.append(h('h2', {}, 'Na poti'),
    h('p', { class: 'lead' }, 'Postaje ob poti imajo svoje sličice: skrinja (zaprta in odprta), vodnjak, plaz kamenja, svetišče, krošnjar in kažipot do naslednje pokrajine.'),
    h('div', { class: 'gobjs' }, fig('skrinja', 'skrinja'), fig('skrinja', 'odprta skrinja', 1), fig('vodnjak', 'vodnjak'), fig('plaz', 'plaz kamenja'), fig('svetisce', 'svetišče'), fig('krosnjar', 'krošnjar'), fig('kazipot', 'kažipot')),
    h('h2', {}, 'Predmeti'),
    h('p', { class: 'lead' }, 'Predmeti delujejo ves čas, napoji in strupi se porabijo. Dobiš jih v skrinjah, pri krošnjarju in od šefov.'),
    h('div', { class: 'itemlist gitems' }, WORLD.items.map(it => h('div', { class: 'itemrow' }, itemIcon(it.id),
      h('div', {}, h('b', {}, it.name, h('em', {}, it.kind === 'relic' ? 'predmet' : it.poison ? 'strup' : 'napoj')), h('span', {}, it.text)), h('span', { class: 'price' }, h('i', { class: 'coin' }), it.price)))));
}
