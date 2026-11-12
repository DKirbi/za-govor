
// ============================================================ skills: what each one does, upgrades, the Veščine screen
// Levels and points are in src/game.js (MAX_LV, LV_XP, heroState, firedTier). Here:
// - SKILL_TEXT: what each of a hero's three skills always does (skill 1, 2, 3 = a word with 1, 2, 3 of their letters)
// - SKILL_UPS: the three upgrades of every skill, bought in this order (a point each)
// - skillPanel(): the list of skills with their upgrades, used by the hero screens (read only) and by Veščine
// - renderTrain(): Veščine, where points are spent; it opens from wells, shrines and pedlars.
const SKILL_TEXT = {
  perun: ['Hiter udar strele v cilj.', 'Močnejši udar strele v cilj.', 'Silen udar; strela preskoči na vse sovražnike.'],
  svarog: ['Udarec s kladivom; družina dobi malo ščita.', 'Močnejši udarec in več ščita.', 'Silen udarec in velik ščit za vso družino.'],
  mokos: ['Pozdravi družino in šibko udari.', 'Pozdravi več; očisti zaklenjene črke in zbudi speče junake.', 'Pozdravi veliko; enkrat v bitki obudi junaka, ki je obležal.'],
  kresnik: ['Udarec, cilj zagori.', 'Močnejši udarec, cilj zagori.', 'Silen udarec; gorijo vsi sovražniki.'],
  veles: ['Močan udarec in strup.', 'Še močnejši udarec in strup.', 'Silen udarec; kača ovije in zastrupi vse sovražnike.'],
  dazbog: ['Udarec s sončnim žarkom.', 'Udarec; naslednja beseda udari ×1,5.', 'Silen udarec; naslednja beseda šteje dvojno.'],
  stribog: ['Sapica zadene vse sovražnike.', 'Burja močneje zadene vse.', 'Vihar silno zadene vse in očisti mrežo črk.'],
  krpan: ['Težek udarec s kijem.', 'Še težji udarec.', 'Silen udarec, ki cilj omami.'],
  jurij: ['Malo pozdravi in šibko udari.', 'Pozdravi več in odklene zaklenjene črke.', 'Pozdravi veliko; enkrat na poti obudi junaka, ki je obležal.'],
  kurent: ['Šibek udarec z zvoncem.', 'Udarec, ki cilj omami.', 'Udarec; vsi sovražniki zamudijo napad.'],
  matjaz: ['Udarec z mečem in ščit za družino.', 'Močnejši udarec in večji ščit.', 'Silen udarec in velik ščit.'],
  erazem: ['Udarec s češnjami.', 'Udarec; naslednji napad sovražnika zgreši.', 'Silen udarec, izmik in ščit.'],
  klepec: ['Udarec s pastirsko palico.', 'Močnejši udarec z izruvanim drevesom.', 'Silen udarec; vsak Vilin dar ga do konca bitke okrepi.'],
  vida: ['Udarec s hrepenenjem.', 'Udarec; cilj napada šibkeje.', 'Silen udarec; vsi sovražniki napadajo šibkeje.'],
  ajda: ['Udarec s kamnito pestjo.', 'Udarec, ki cilj omami.', 'Silen udarec; cilj okamni za dalj časa.'],
};
// three upgrades per skill, in the order they are bought
const SKILL_UPS = {
  perun: ['krit moc vsi', 'krit omama vsi', 'moc krit omama'],
  svarog: ['scit moc krit', 'scit ogenj moc', 'scit vsi krit'],
  mokos: ['zdravi scit zdravi', 'zdravi slabi zdravi', 'zdravi scit vsi'],
  kresnik: ['ogenj krit moc', 'ogenj vsi krit', 'moc krit zdravi'],
  veles: ['krit slabi vsi', 'moc krit omama', 'moc krit zdravi'],
  dazbog: ['krit moc zdravi', 'moc vsi krit', 'zdravi moc krit'],
  stribog: ['moc slabi krit', 'omama moc krit', 'moc slabi krit'],
  krpan: ['krit moc omama', 'krit vsi moc', 'moc krit vsi'],
  jurij: ['zdravi scit moc', 'zdravi slabi krit', 'zdravi scit moc'],
  kurent: ['omama moc krit', 'moc vsi slabi', 'moc krit zdravi'],
  matjaz: ['scit moc krit', 'scit vsi zdravi', 'scit moc omama'],
  erazem: ['krit scit moc', 'scit krit omama', 'moc krit vsi'],
  klepec: ['moc krit omama', 'moc vsi krit', 'krit moc zdravi'],
  vida: ['slabi zdravi krit', 'slabi vsi moc', 'zdravi moc krit'],
  ajda: ['omama moc krit', 'omama scit vsi', 'moc krit omama'],
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
const LETTERS = ['1 črka', '2 črki', '3 črke'];
// upgrades in force for hero k's skill t
const upTags = (k, t) => { const n = upsOf(S.heroes[k], t); return n ? SKILL_UPS[HEROES[k].id][t - 1].split(' ').slice(0, n) : []; };

// spending points: learn skill 2 after 1 and 3 after 2; then up to three upgrades each
const canLearn = (st, t) => !!st && st.pts > 0 && st.sk[t - 1] === 0 && (t === 1 || st.sk[t - 2] > 0);
const canUpgrade = (st, t) => !!st && st.pts > 0 && st.sk[t - 1] > 0 && st.sk[t - 1] < 1 + MAX_UP;
function spendPoint(k, t) {
  const st = S.heroes[k]; if (!(canLearn(st, t) || canUpgrade(st, t))) return false;
  st.pts--; st.sk[t - 1]++; return true;
}
const partyPoints = () => S.heroes.reduce((a, st) => a + (st.pts || 0), 0);
// XP still needed for the next level (and its skill point); null at the top level
const xpToNext = st => st && st.lvl < MAX_LV ? LV_XP[st.lvl] - st.xp : null;

// The skills of one hero. `st` is the hero's state on this journey (null: every skill shown as known,
// as in the codex outside a journey); with `train` every skill gets a learn / upgrade button.
function skillPanel(id, st, { train = null } = {}) {
  const ch = CHARS.find(c => c.id === id), ups = SKILL_UPS[id], inRun = !!(S.run && st);
  const lv = t => inRun ? st.sk[t - 1] : 1;
  const head = inRun ? h('div', { class: 'sk-sum' },
    h('span', {}, h('b', {}, `Raven ${st.lvl}`), st.lvl < MAX_LV ? ` · do naslednje še ${xpToNext(st)} XP` : ' · najvišja raven'),
    h('span', { class: 'sk-pts' + (st.pts ? ' on' : '') }, `Točke veščin: ${st.pts}`)) : null;
  return h('div', { class: 'skills' }, head,
    [1, 2, 3].map(t => {
      const l = lv(t), known = l > 0, n = Math.max(0, l - 1), tags = ups[t - 1].split(' ');
      const act = train && inRun ? (canLearn(st, t) ? ['Nauči se', () => train(t)] : canUpgrade(st, t) ? ['Izboljšaj', () => train(t)] : null) : null;
      const why = train && inRun && !act ? (l >= 1 + MAX_UP ? 'Najvišja stopnja' : !known && t > 1 && !lv(t - 1) ? `Najprej veščina ${t - 1}` : 'Ni točk') : null;
      return h('section', { class: 'sk' + (known ? ' on' : ' off'), style: { '--c': ch.c } },
        h('div', { class: 'sk-head' },
          h('span', { class: 'sk-dots', title: LETTERS[t - 1] + ' te barve', 'aria-label': LETTERS[t - 1] }, Array.from({ length: t }, () => h('i'))),
          h('b', {}, ch.moves[t - 1]),
          h('span', { class: 'sk-state' }, known ? (n ? `izboljšana ${n}/${MAX_UP}` : 'znana') : 'še ni znana')),
        h('p', { class: 'sk-text' }, `${LETTERS[t - 1]} te barve. ${SKILL_TEXT[id][t - 1]}`),
        h('ol', { class: 'sk-ups' }, tags.map((tg, i) => h('li', { class: i < n ? 'on' : '' },
          h('i', { 'aria-hidden': 'true' }), h('b', {}, UP_TAG[tg][0]), ' — ', UP_TAG[tg][1]))),
        train && inRun ? h('div', { class: 'sk-act' },
          act ? h('button', { class: 'btn small primary', onclick: act[1] }, act[0], h('span', { class: 'cost' }, '1 točka')) : h('span', { class: 'muted' }, why)) : null);
    }));
}

// the hero screens' "Veščine" button: the same list in a window, without spending
function openSkillInfo(id, st) {
  if (S.bagEl) return;
  const ch = CHARS.find(c => c.id === id);
  const close = () => { ov.remove(); S.bagEl = null; S.overlayKey = null; };
  const where = st && S.run ? (st.pts ? `Točke porabiš pri vodnjaku, v svetišču ali pri krošnjarju.` : 'Novo točko dobiš z vsako novo ravnjo; izkušnje prinašajo premagani sovražniki.') : 'Na poti se junak nauči veščine 2 in 3 s točkami, ki jih dobi z ravnmi, in vsako izboljša trikrat.';
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
    h('p', { class: 'lead' }, 'Vsaka nova raven prinese točko. Z njo se junak nauči nove veščine ali izboljša znano: vsako lahko izboljša trikrat.'),
    HEROES.length > 1 ? h('div', { class: 'hm-tabs' }, HEROES.map((x, i) => h('button', { class: 'btn small' + (i === k ? ' on' : ''), style: { '--c': x.c }, 'aria-pressed': i === k ? 'true' : 'false',
      onclick: () => { arg.sel = i; mountShell(); renderTrain(arg); } },
      h('i', { style: { 'background-image': `url(${SPRITES[x.id]})` } }), x.name, S.heroes[i].pts ? h('span', { class: 'ptsbadge' }, S.heroes[i].pts) : null))) : null,
    h('div', { class: 'train-hero', style: { '--c': hr.c } },
      h('div', { class: 'spirit small' }, spriteEl(hr.id, hr.c)),
      skillPanel(hr.id, st, { train }))));
  focusPage();
}
