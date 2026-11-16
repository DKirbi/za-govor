
// ============================================================ skills: what each one does, stopnje, the Veščine screen
// Levels and points are in src/game.js (MAX_LV, LV_XP, heroState, firedTier, RANK_POW, RANK_DUR). Here:
// - SKILL_TEXT: what each of a hero's three skills always does (skill 1, 2, 3 = a word with 1, 2, 3 of their letters)
// - SKILL_UPS: the extra effect a skill gains at stopnja 2 and at stopnja 3 (a point each)
// - skillPanel(): the list of skills with their stopnje, used by the hero screens (read only) and by Veščine
// - renderTrain(): Veščine, where points are spent; it opens from wells, shrines and pedlars.
// The five reviewed heroes (src/progression.js) have no SKILL_UPS: each of their ranks is described by RANK_TEXT.
const SKILL_TEXT = {
  perun: ['Hiter udar strele v cilj.', 'Močnejši udar strele v cilj.', 'Silen udar; strela preskoči na vse sovražnike.'],
  svarog: ['Udarec s kladivom; družina dobi malo ščita.', 'Močnejši udarec in več ščita.', 'Silen udarec in velik ščit za vso družino.'],
  mokos: ['Pozdravi družino in šibko udari.', 'Pozdravi več; očisti zaklenjene črke in zbudi speče junake.', 'Pozdravi veliko; enkrat v bitki obudi junaka, ki je obležal.'],
  veles: ['Močan udarec in strup.', 'Še močnejši udarec in strup.', 'Silen udarec; kača ovije in zastrupi vse sovražnike.'],
  dazbog: ['Udarec s sončnim žarkom.', 'Udarec; naslednja beseda udari ×1,5.', 'Silen udarec; naslednja beseda šteje dvojno.'],
  stribog: ['Sapica zadene vse sovražnike.', 'Burja močneje zadene vse.', 'Vihar silno zadene vse in očisti mrežo črk.'],
  krpan: ['Težek udarec s kijem.', 'Še težji udarec.', 'Silen udarec, ki cilj omami.'],
  jurij: ['Malo pozdravi in šibko udari.', 'Pozdravi več in odklene zaklenjene črke.', 'Pozdravi veliko; enkrat na poti obudi junaka, ki je obležal.'],
  klepec: ['Udarec s pastirsko palico.', 'Močnejši udarec z izruvanim drevesom.', 'Silen udarec; vsak Vilin dar ga do konca bitke okrepi.'],
  vida: ['Udarec s hrepenenjem.', 'Udarec; cilj napada šibkeje.', 'Silen udarec; vsi sovražniki napadajo šibkeje.'],
};
// the extra effect of every skill at stopnja 2 and at stopnja 3
const SKILL_UPS = {
  perun: ['krit vsi', 'krit omama', 'krit omama'],
  svarog: ['scit krit', 'scit ogenj', 'scit vsi'],
  mokos: ['zdravi scit', 'zdravi slabi', 'zdravi scit'],
  veles: ['krit slabi', 'krit omama', 'krit zdravi'],
  dazbog: ['krit zdravi', 'vsi krit', 'zdravi krit'],
  stribog: ['slabi krit', 'omama krit', 'slabi krit'],
  krpan: ['krit omama', 'krit vsi', 'krit vsi'],
  jurij: ['zdravi scit', 'zdravi slabi', 'zdravi scit'],
  klepec: ['krit omama', 'vsi krit', 'krit zdravi'],
  vida: ['slabi zdravi', 'slabi vsi', 'zdravi krit'],
};
const UP_TAG = {
  moc: ['Moč', '+25 % moči'],
  krit: ['Kritični udarec', '30 % možnosti, da udari dvojno'],
  vsi: ['Na vse', 'zadene tudi vse druge sovražnike'],
  zdravi: ['Zdravljenje', 'ob napadu malo pozdravi družino'],
  scit: ['Ščit', 'družini doda ščit'],
  omama: ['Omama', 'cilj za trenutek omami'],
  ogenj: ['Ogenj', 'cilj zagori'],
  slabi: ['Oslabitev', 'cilj napada šibkeje'],
};
// how many of the hero's letters fire each skill (»beseda z dvema črkama te barve«)
const LEN_INS = t => ['z eno črko', 'z dvema črkama', 's tremi črkami'][t - 1];
const rankPips = r => h('span', { class: 'rankpips', 'aria-label': `stopnja ${r} od ${MAX_RANK}` }, Array.from({ length: MAX_RANK }, (_, i) => h('i', { class: i < r ? 'on' : '' })));
// extra effects in force for hero k's skill t
const upTags = (k, t) => { const n = upsOf(S.heroes[k], t), ups = SKILL_UPS[HEROES[k].id]; return n && ups ? ups[t - 1].split(' ').slice(0, n) : []; };

// spending points: learn skill 2 after 1 and 3 after 2; raise any known skill up to stopnja 3
const canLearn = (st, t) => !!st && st.pts > 0 && st.sk[t - 1] === 0 && (t === 1 || st.sk[t - 2] > 0);
const canUpgrade = (st, t) => !!st && st.pts > 0 && st.sk[t - 1] > 0 && st.sk[t - 1] < MAX_RANK;
function spendPoint(k, t) {
  const st = S.heroes[k]; if (!(canLearn(st, t) || canUpgrade(st, t))) return false;
  st.pts--; st.sk[t - 1]++; if (!st.pts) st.glow = false; return true;
}
const partyPoints = () => S.heroes.reduce((a, st) => a + (st.pts || 0), 0);
// XP still needed for the next level (and its skill point); null at the top level
const xpToNext = st => st && st.lvl < MAX_LV ? LV_XP[st.lvl] - st.xp : null;

// The skills of one hero. `st` is the hero's state on this journey (null: every skill shown as known,
// as in the codex outside a journey); with `train` every skill gets a learn / upgrade button.
function skillPanel(id, st, { train = null } = {}) {
  const ch = CHARS.find(c => c.id === id), ups = SKILL_UPS[id], rev = isReviewed(id), inRun = !!(S.run && st);
  const lv = t => inRun ? st.sk[t - 1] : 1;
  const head = inRun ? h('div', { class: 'sk-sum' },
    h('span', {}, h('b', {}, `Raven ${st.lvl}`), st.lvl < MAX_LV ? ` · do naslednje še ${xpToNext(st)} XP` : ' · najvišja raven'),
    h('span', { class: 'sk-pts' + (st.pts ? ' on' : '') }, `Točke veščin: ${st.pts}`)) : null;
  // what stopnja 2 and 3 add on top of the skill
  const rankLine = (r, tag) => `${r === 2 ? '+20 % moči, učinki trajajo 1,5-krat dlje' : '+40 % moči, učinki trajajo 2-krat dlje'}; ${UP_TAG[tag][0].toLowerCase()}: ${UP_TAG[tag][1]}`;
  return h('div', { class: 'skills' }, head,
    [1, 2, 3].map(t => {
      const l = lv(t), known = l > 0, tags = rev ? [] : ups[t - 1].split(' ');
      const act = train && inRun ? (canLearn(st, t) ? ['Nauči se', () => train(t)] : canUpgrade(st, t) ? [`Na stopnjo ${l + 1}`, () => train(t)] : null) : null;
      const why = train && inRun && !act ? (l >= MAX_RANK ? 'Najvišja stopnja' : !known && t > 1 && !lv(t - 1) ? `Najprej veščina ${t - 1}` : 'Ni točk') : null;
      return h('section', { class: 'sk' + (known ? ' on' : ' off'), style: { '--c': ch.c } },
        h('div', { class: 'sk-head' },
          h('span', { class: 'sk-dots', title: `beseda ${LEN_INS(t)} te barve`, 'aria-label': `veščina ${t}` }, Array.from({ length: t }, () => h('i'))),
          h('b', {}, ch.moves[t - 1]),
          h('span', { class: 'sk-state' }, known ? [`stopnja ${l}`, rankPips(l)] : 'še ni znana')),
        h('p', { class: 'sk-text' }, `Beseda ${LEN_INS(t)} te barve. ${rev ? rankText(id, t, 1) : SKILL_TEXT[id][t - 1]}`),
        h('ol', { class: 'sk-ups' }, (rev ? [2, 3] : tags).map((tg, i) => h('li', { class: l >= i + 2 ? 'on' : '' },
          h('i', { 'aria-hidden': 'true' }), h('b', {}, `Stopnja ${i + 2}`), ' — ', rev ? rankText(id, t, i + 2) : rankLine(i + 2, tg)))),
        train && inRun ? h('div', { class: 'sk-act' },
          act ? h('button', { class: 'btn small primary', onclick: act[1] }, act[0], h('span', { class: 'cost' }, '1 točka')) : h('span', { class: 'muted' }, why)) : null);
    }));
}

// the hero screens' "Veščine" button: the same list in a window, without spending
function openSkillInfo(id, st) {
  if (S.bagEl) return;
  const ch = CHARS.find(c => c.id === id);
  const close = () => { ov.remove(); S.bagEl = null; S.overlayKey = null; };
  const where = st && S.run ? (st.pts ? `Točke porabiš pri vodnjaku, v svetišču ali pri krošnjarju.` : 'Novo točko dobiš z vsako novo ravnjo; izkušnje prinašajo premagani sovražniki.') : 'Prvo veščino zna vsak junak od začetka. Na poti s točkami, ki jih prinašajo nove ravni, odklene drugo in tretjo (za daljše besede z več črkami njegove barve) in vsako dvigne do stopnje 3.';
  const ov = h('div', { class: 'overlay', onclick: e => { if (e.target === ov) close(); } }, h('div', { class: 'dialog skilldlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Veščine: ${ch.name}` },
    h('h2', {}, `Veščine: ${ch.name}`),
    skillPanel(id, st),
    h('p', { class: 'muted sk-where' }, where),
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: close }, 'Zapri ', h('kbd', {}, 'Esc')))));
  document.body.append(ov); S.bagEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close(); } };
  const b = ov.querySelector('.btn.primary'); if (b) b.focus();
}

// ------------------------------------------------------------ Veščine: spending points (wells, shrines, pedlars)
function trainAction(back) {
  const n = partyPoints();
  return n ? { train: true, label: `Veščine · ${n} ${n === 1 ? 'točka' : n === 2 ? 'točki' : n < 5 ? 'točke' : 'točk'}`, fn: () => go('train', { back: () => { refreshTrain(back); back(); } }) } : null;
}
// back on the road the stop's prompt shows the points that are left (a prompt that stays after the stop is used keeps its text)
function refreshTrain(back) {
  const R = S.run; if (!R || !R.prompt) return;
  if (!R.prompt.keep) { R.prompt = null; return; }
  const t = trainAction(back); R.prompt.actions = R.prompt.actions.filter(a => !a.train).concat(t ? [t] : []);
}
function renderTrain(arg) {
  arg = arg || S.trainArg; S.trainArg = arg;
  if (arg.sel == null) arg.sel = Math.max(0, S.heroes.findIndex(st => st.pts > 0));
  const k = clamp(arg.sel, 0, HEROES.length - 1), hr = HEROES[k], st = S.heroes[k];
  const train = t => { if (spendPoint(k, t)) { sfx('heal', { rate: 1.1, vol: .7 }); mountShell(); renderTrain(arg); } };
  SCR.append(h('div', { class: 'page train' },
    crumb('Nazaj na pot', () => arg.back()),
    pageH1('Veščine'),
    h('p', { class: 'lead' }, 'Vsaka nova raven prinese točko. Z njo junak odklene veščino za daljše besede (dve ali tri črke njegove barve) ali dvigne znano veščino na višjo stopnjo, do 3. Kaj prinese vsaka stopnja, piše pri veščini.'),
    HEROES.length > 1 ? h('div', { class: 'hm-tabs' }, HEROES.map((x, i) => h('button', { class: 'btn small' + (i === k ? ' on' : ''), style: { '--c': x.c }, 'aria-pressed': i === k ? 'true' : 'false',
      onclick: () => { arg.sel = i; mountShell(); renderTrain(arg); } },
      h('i', { style: { 'background-image': `url(${SPRITES[x.id]})` } }), x.name, S.heroes[i].pts ? h('span', { class: 'ptsbadge' }, S.heroes[i].pts) : null))) : null,
    h('div', { class: 'train-hero', style: { '--c': hr.c } },
      h('div', { class: 'spirit small' }, spriteEl(hr.id, hr.c)),
      skillPanel(hr.id, st, { train }))));
  focusPage();
}
