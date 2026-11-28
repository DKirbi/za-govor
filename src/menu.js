
// ============================================================ main menu and the pages under it
// The start screen is a short menu: Nadaljuj pot (while a journey is under way), Nova pot,
// Dosežki in junaki, Kako igrati, Nastavitve and O igri, with the version of the build at the bottom.
// Each page under it has one way back, a link at the top ("← Nazaj na glavni meni") that stays in
// view while the page scrolls; Esc and the Android back button do the same.
// Difficulty is chosen on Nova pot only, and only takes effect when the new journey starts:
// a journey under way keeps the pace and knowledge level it began with.
const MENU_PAGES = { newrun: 1, howto: 1, about: 1, heroes: 1, settings: 1 };

function menuItems() {
  const R = S.run, items = [];
  if (R && !R.over) items.push({ id: 'continue', label: 'Nadaljuj pot', sub: WORLD.regions[R.ri].name, fn: () => go('travel') });
  else if (SAVED) items.push({ id: 'continue', label: 'Nadaljuj pot', sub: `${regionName(SAVED.region)} · shranjeno`, fn: () => { if (loadSave()) go('travel'); } });
  items.push({ id: 'new', label: 'Nova pot', fn: () => go('newrun') },
    { id: 'heroes', label: 'Dosežki in junaki', fn: () => go('heroes') },
    { id: 'howto', label: 'Kako igrati', fn: () => go('howto') },
    { id: 'settings', label: 'Nastavitve', fn: () => go('settings') },
    { id: 'about', label: 'O igri', fn: () => go('about') });
  return items;
}

function renderTitle() {
  const items = menuItems();
  if (!items.some(it => it.id === S.menuSel)) S.menuSel = items[0].id;
  let cur = null;
  SCR.append(h('div', { class: 'menu' },
    titleStage({ maxVh: .56 }),
    h('nav', { class: 'mainmenu', 'aria-label': 'Glavni meni' }, h('ul', {}, items.map(it => h('li', {},
      h('button', { class: 'mm-item', 'data-id': it.id, ref: el => { if (it.id === S.menuSel) cur = el; },
        onfocus: () => { S.menuSel = it.id; },
        onclick: () => { S.menuSel = it.id; sfx('sel'); it.fn(); } },
        h('span', { class: 'mm-label' }, it.label), it.sub ? h('span', { class: 'mm-sub' }, `(${it.sub})`) : null))))),
    versionLine('mm-version')));
  // keyboard players land on the menu ready to move; on a phone nothing is pre-focused
  if (cur && !S.mobile) cur.focus({ preventScroll: true });
  if (SAVE_DROPPED) { SAVE_DROPPED = false; toast('Shranjena pot je iz starejše različice igre, zato je ni mogoče nadaljevati.'); }
}
// ↑ ↓ (and Home / End) walk the menu; Enter opens the item. A focused button opens itself.
function menuKey(e) {
  const btns = [...document.querySelectorAll('.mm-item')]; if (!btns.length) return;
  let i = Math.max(0, btns.findIndex(b => b.dataset.id === S.menuSel));
  const k = e.key;
  const n = k === 'ArrowDown' ? i + 1 : k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? btns.length - 1 : null;
  if (n != null) { e.preventDefault(); i = (n + btns.length) % btns.length; S.menuSel = btns[i].dataset.id; btns[i].focus(); sfx('sel', { rate: 1.2, vol: .5 }); return; }
  if (k === 'Enter' && !e.repeat && !(e.target && e.target.classList && e.target.classList.contains('mm-item'))) { e.preventDefault(); btns[i].click(); }
}

// The version of this build (semantic versioning, see CHANGELOG.md): stage, number and, for bug reports, the commit.
const STAGE = BUILD.stage || '';
function versionLine(cls) {
  return h('p', { class: cls, title: `Različica ${BUILD.version}${BUILD.commit ? ', gradnja ' + BUILD.commit : ''}` },
    STAGE ? h('span', {}, STAGE) : null, STAGE ? ' · ' : null, h('span', {}, 'v' + BUILD.version),
    BUILD.commit ? h('span', { class: 'commit' }, ' · ' + BUILD.commit) : null);
}

// ------------------------------------------------------------ pages: the way back and the heading
// The way back is the page's only header: it sticks to the top of the screen while the page scrolls.
function crumb(label = 'Nazaj na glavni meni', to = () => go('title')) {
  return h('nav', { class: 'crumbs', 'aria-label': 'Nazaj' },
    h('button', { class: 'crumb', onclick: () => { sfx('sel', { rate: .9, vol: .5 }); to(); } },
      h('span', { class: 'arr', 'aria-hidden': 'true' }, '←'), h('span', {}, label)));
}
const pageH1 = text => h('h1', { class: 'page-h1', tabindex: '-1' }, text);
// a new page takes focus on its heading, so a screen reader announces it and Tab starts at the top
function focusPage() { const t = SCR && SCR.querySelector('.page-h1'); if (t) t.focus({ preventScroll: true }); }
function pageBack() {
  if (S.screen === 'gallery') return go('heroes');
  go('title');
}
function pageKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); pageBack(); return; }
  const onBtn = e.target && e.target.closest && e.target.closest('button, a');
  if (S.screen === 'newrun' && e.key === 'Enter' && !onBtn && !e.repeat) { e.preventDefault(); setupNext(); return; }
  if (S.screen === 'howto' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); if (UI.car) UI.car.step(e.key === 'ArrowRight' ? 1 : -1); }
}

// ------------------------------------------------------------ Nova pot: pace and knowledge, then a hero
// The choices are a draft (S.setup) until the journey starts (startJourney → applySetup).
const PACE = [
  { id: 'real', name: 'Realni čas', badge: 'priporočeno', text: 'Nasprotniki napadajo sproti in počasi topijo zdravje družine.' },
  { id: 'calm', name: 'Mirni način', text: 'Brez časovnega pritiska, nasprotniki napadejo na vsakih nekaj potez. Dogodki imajo dvojni čas.' }];
// Znanje is the one difficulty: puzzle help and what a lost battle and a fallen hero mean (LEVELS and DIFFS
// in src/game.js). Težavnost was a separate choice until 0.11.0.
const KNOW = [
  { id: 'malcek', text: 'Za učenje besed.' },
  { id: 'ucenjak', text: 'Zahtevnejše besede, malo pomoči.' },
  { id: 'molj', text: 'Za križankarje in pametnjakoviče.' }];
const setupVal = k => S.setup ? S.setup[k] : S[k];
function applySetup() {
  const U = S.setup; if (!U) return;
  S.mode = U.mode; S.know = U.know; S.suggest = U.suggest; S.testMode = U.testMode;
  S.tutOn = U.tutOn; if (U.tutOn) resetTuts();      // explanations come back for every puzzle type on this journey
  try { localStorage.setItem('zg-know', U.know); localStorage.setItem('zg-mode', U.mode); localStorage.removeItem('zg-diff'); localStorage.setItem('zg-tutorials', U.tutOn ? '1' : '0'); } catch (e) { /* no storage */ }
  S.setup = null;
}
function setupNext() { sfx('sel'); go('pick'); }

function renderNewRun() {
  if (!S.setup) S.setup = { mode: S.mode, know: S.know, suggest: S.suggest, tutOn: S.tutOn, testMode: S.testMode };
  const U = S.setup, R = S.run && !S.run.over ? S.run : null, saved = !R && SAVED ? regionName(SAVED.region) : null;
  const tick = () => h('span', { class: 'tick', 'aria-hidden': 'true' });
  const radio = (group, id, kids, cls = '') => h('label', { class: `choice ${cls}` + (U[group] === id ? ' on' : ''), 'data-group': group, 'data-id': id },
    h('input', { type: 'radio', name: 'zg-' + group, value: id, checked: U[group] === id, onchange: () => setChoice(group, id) }), kids, tick());
  const toggle = (key, label, hint) => h('label', { class: 'toggle' },
    h('input', { type: 'checkbox', checked: !!U[key], onchange: e => { U[key] = e.target.checked; } }),
    h('span', {}, label, hint ? h('small', {}, hint) : null));
  SCR.append(h('div', { class: 'page setup' },
    crumb(),
    pageH1('Nova pot'),
    h('section', { class: 'set-block' },
      h('h2', { id: 'set-pace' }, 'Tempo'),
      h('div', { class: 'choices', role: 'radiogroup', 'aria-labelledby': 'set-pace' },
        PACE.map(p => radio('mode', p.id, [h('h3', {}, p.name, p.badge ? h('span', { class: 'badge' }, p.badge) : null), h('p', {}, p.text)])))),
    h('section', { class: 'set-block' },
      h('div', { class: 'set-head' }, h('h2', { id: 'set-know' }, 'Znanje'),
        h('button', { type: 'button', class: 'lv-more', 'aria-expanded': String(!!U.knowMore), 'aria-controls': KNOW.map(k => 'lv-more-' + k.id).join(' '),
          onclick: e => toggleKnowMore(e.currentTarget) }, h('span', {}, U.knowMore ? 'Skrij podrobnosti' : 'Podrobnosti'), h('span', { class: 'chev', 'aria-hidden': 'true' }))),
      h('div', { class: 'lv-grid', role: 'radiogroup', 'aria-labelledby': 'set-know' },
        KNOW.map(k => [
          radio('know', k.id, [h('span', { class: 'lv-art', 'aria-hidden': 'true' }, h('i', { class: 'sp', style: { 'background-image': `url(${SPRITES['lv-' + k.id]})` } })),
            h('h3', {}, LEVELS[k.id].name), h('p', {}, k.text), h('p', { class: 'lv-stakes', id: 'lv-more-' + k.id, hidden: !U.knowMore }, DIFFS[LEVELS[k.id].diff].text)], 'lv'),
          LEVELS[k.id].proposals ? h('div', { class: 'subopt', 'data-for': k.id, hidden: U.know !== k.id },
            toggle('suggest', 'Predlogi besed med igro', 'Pod mrežo se pokažejo besede, ki jih lahko sestaviš.')) : null]))),
    h('div', { class: 'set-opts' },
      toggle('tutOn', 'Pokaži razlage ugank', 'Pred prvo uganko vsake vrste kratka razlaga s sliko. Čas medtem stoji.'),
      h('div', { class: 'devbox' }, h('span', { class: 'devtag' }, 'Razvoj'),
        toggle('testMode', 'Preizkusni način', '200 zlatnikov, vsi junaki na izbiro, postaje in pokrajine lahko preskočiš.'))),
    statsAsk(),
    R ? h('p', { class: 'note' }, `Začeta pot (${WORLD.regions[R.ri].name}) se konča, ko izbereš junaka za novo pot.`)
      : saved ? h('p', { class: 'note' }, `Shranjena pot (${saved}) se izbriše, ko izbereš junaka za novo pot.`) : null,
    h('div', { class: 'cta-row' },
      h('button', { class: 'btn primary cta', onclick: setupNext }, 'Izberi junaka', h('span', { 'aria-hidden': 'true' }, ' →')),
      h('kbd', {}, 'Enter'))));
  focusPage();
}
// Znanje: what losing and a fallen hero mean stays folded until asked for; one toggle opens all three cards
// at once, so they can be compared and the row keeps one height. The toggle sits outside the cards: a button
// inside a card's <label> would also pick that Znanje.
function toggleKnowMore(btn) {
  const U = S.setup, open = !U.knowMore; U.knowMore = open;
  btn.setAttribute('aria-expanded', String(open)); btn.firstChild.textContent = open ? 'Skrij podrobnosti' : 'Podrobnosti';
  KNOW.forEach(k => { const p = document.getElementById('lv-more-' + k.id); if (p) p.hidden = !open; });
  sfx('sel', { vol: .4 });
}
function setChoice(group, id) {
  S.setup[group] = id; sfx('sel', { rate: group === 'know' ? 1.1 : 1, vol: .6 });
  SCR.querySelectorAll(`.choice[data-group="${group}"]`).forEach(el => el.classList.toggle('on', el.dataset.id === id));
  if (group === 'know') SCR.querySelectorAll('.subopt').forEach(el => { el.hidden = el.dataset.for !== id; });
}

// ------------------------------------------------------------ Kako igrati: controls for this device, then the puzzles
const CONTROLS_DESK = [
  ['Povsod', [[['Esc'], 'premor: čas se ustavi, uganka se zakrije'], [['Enter'], 'potrdi ali nadaljuj']]],
  ['Na poti', [[['→', 'Enter'], 'hodi naprej ali sprejmi, kar ponuja postaja'], [['Esc'], 'druga izbira na postaji'], [['T'], 'torba']]],
  ['Mreža črk', [[['a–ž'], 'tipkaj besedo; pot po sosednjih črkah se poišče sama'], ['miška', 'vleci čez sosednje črke ali klikaj eno za drugo; klik na zadnjo jo pošlje'],
    [['Enter'], 'pošlji besedo'], [['Backspace', 'Del'], 'briši črko · počisti besedo'], [['presledek'], 'izreci zagovor, ko je poln'],
    [['←', '→'], 'izberi nasprotnika, ki ga napadeš'], [['1', '2', '3'], 'namig · premešaj mrežo · torba']]],
  ['Križanka', [[['a–ž'], 'vpiši odgovor'], [['Tab', 'Enter'], 'naslednja beseda (Shift + Tab: prejšnja)'], [['←', '↑', '↓', '→'], 'premik po mreži'],
    [['Backspace'], 'briši črko'], [['?'], 'razkrij črko (število je omejeno)']]],
  ['Skrinja, konice in plaz', [[['a–ž'], 'tipkaj črke ali klikaj nanje'], [['Enter'], 'pošlji besedo'], [['Backspace', 'Del'], 'briši črko · počisti besedo']]],
];
const CONTROLS_PHONE = [
  ['Povsod', [['Premor', 'gumb zgoraj ustavi čas in zakrije uganko; igra se ustavi tudi, ko jo zapustiš'], ['Izhod', 'na poti in v premoru: pove, kje je igra nazadnje shranila pot'], ['Nazaj', 'tipka nazaj na Androidu ustavi uganko, zapre okno ali te vrne v meni']]],
  ['Na poti', [['Gumbi', 'pod sliko: hodi naprej ali izberi, kaj narediš na postaji'], ['Torba', 'napoji, strupi in predmeti']]],
  ['Mreža črk', [['Vleci', 'po sosednjih črkah, tudi poševno, in spusti: beseda se pošlje sama'], ['Pritiskaj', 'črko za črko, nato Pošlji ob besedi ali še enkrat zadnjo črko'],
    ['Predlog', 'pritisk na predlog ga pošlje'], ['Gumbi', 'Zagovor, Namig, Premešaj in Torba so pod mrežo']]],
  ['Križanka in plaz', [['Tipkovnica', 'slovenska tipkovnica v igri, s Č, Š in Ž'], ['Naprej', 'skoči na naslednjo besedo; izbereš jo lahko tudi s pritiskom na mrežo'], ['Razkrij črko', 'pokaže eno črko (ne na stopnji Knjižni molj)']]],
  ['Skrinja in konice', [['Pritiskaj', 'črke v pravem vrstnem redu'], ['✕ in Pošlji', 'ob besedi: počisti jo ali jo oddaj']]],
];
// what each kind of device is, and why a bigger screen is nicer
const PLATFORMS = [
  { id: 'telefon', name: 'Telefon', note: 'Vse gre s prstom. Na manjšem zaslonu je vse bolj stisnjeno.' },
  { id: 'tablica', name: 'Tablica', note: 'Enako kot na telefonu, a z več prostora: večja mreža črk in križanke, manj pomikanja.' },
  { id: 'racunalnik', name: 'Računalnik', note: 'Tipkovnica in miška: besede tipkaš, križanke izpolnjuješ kot na papirju. Igra je tu najudobnejša.' }];
const devicePlatform = () => S.mobile ? (Math.min(screen.width, screen.height) >= 600 ? 'tablica' : 'telefon') : 'racunalnik';
function controlsEl(platform = S.ctlPlatform || devicePlatform()) {
  // keys of a keyboard are keycaps; the names of touch gestures and buttons are chips
  const keys = ks => Array.isArray(ks) ? ks.map((k, i) => [i ? ' ' : null, h('kbd', {}, k)]) : h('span', { class: 'ctl-chip' }, ks);
  return h('div', { class: 'ctl-groups' }, (platform === 'racunalnik' ? CONTROLS_DESK : CONTROLS_PHONE).map(([title, rows]) =>
    h('section', { class: 'ctl-group' }, h('h3', {}, title),
      h('dl', { class: 'ctl' }, rows.map(([k, text]) => [h('dt', {}, keys(k)), h('dd', {}, text)])))));
}
// Upravljanje: the controls of this device first; the other devices are one tap away
function controlsSection() {
  const cur = S.ctlPlatform || devicePlatform(), P = PLATFORMS.find(p => p.id === cur);
  const sec = h('section', { class: 'ctl-sec' },
    h('h2', {}, 'Upravljanje'),
    h('div', { class: 'ctl-tabs', role: 'group', 'aria-label': 'Naprava' }, PLATFORMS.map(p =>
      h('button', { class: 'ctl-tab' + (p.id === cur ? ' on' : ''), 'aria-pressed': p.id === cur ? 'true' : 'false',
        onclick: () => { S.ctlPlatform = p.id; sfx('sel', { vol: .5 }); sec.replaceWith(controlsSection()); } },
        p.name, p.id === devicePlatform() ? h('small', {}, ' · ta naprava') : null))),
    h('p', { class: 'muted ctl-note' }, P.note, cur !== 'racunalnik' ? ' Igra je najudobnejša na tablici ali računalniku.' : ''),
    controlsEl(cur));
  return sec;
}
// the puzzle explanations of the game (src/playtest.js), with timing told for both paces
function howtoSlides() {
  const T = k => TUT[k]();
  const cross = tutCross('finisher');
  return [
    { id: 'mesh', short: 'Mreža', ...T('mesh'),
      time: 'Realni čas: nasprotniki napadajo sproti, zato so hitre besede vredne več kot popolne. Mirni način: nasprotniki počakajo na tvojo besedo.' },
    { id: 'cross', short: 'Križanka', title: 'Križanka', fig: cross.fig, steps: cross.steps,
      lead: 'Križanko odpre poln zagovor (mogočen udarec), nasprotnikovo zaklepanje (mreža črk je zaprta, dokler je ne rešiš) ali zaseda (udariš prvi). Vsaka pravilno rešena beseda je napad.',
      time: 'Pri zagovoru časa ni. Pri zaklepanju in zasedi kaže rdeča črta nad križanko, koliko časa ostane; v mirnem načinu časa ni.' },
    { id: 'chest', short: 'Skrinja', ...T('chest'), time: 'Rdeča črta je čas. Ko poteče, skrinja ostane zaklenjena. V mirnem načinu je časa dvakrat več.' },
    { id: 'darts', short: 'Konice', ...T('darts'), time: 'Rdeča črta je čas. Ko poteče, se vse konice sprožijo nate. V mirnem načinu je časa dvakrat več.' },
    { id: 'trap', short: 'Plaz', ...T('trap'), time: 'Skale padajo nekaj sekund. Šteje prva prava beseda; če ne pošlješ nobene, udarijo s polno močjo.' },
  ];
}
// A carousel of slides: tabs to jump, ← → buttons (and keys), swipe on touch screens.
function carousel(slides, label) {
  const n = slides.length, reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let idx = clamp(S.howtoSlide || 0, 0, n - 1), track, count, live, prevB, nextB, tabs = [], els = [], settle = 0;
  const set = (i, scroll) => {
    idx = clamp(i, 0, n - 1); S.howtoSlide = idx;
    tabs.forEach((t, k) => t.setAttribute('aria-current', k === idx ? 'true' : 'false'));
    els.forEach((s, k) => { if (k === idx) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
    count.textContent = `${idx + 1} / ${n}`; prevB.disabled = idx === 0;
    // the last slide: the button on the right takes you back to the menu instead of going dark
    const end = idx === n - 1; nextB.classList.toggle('primary', end); nextB.disabled = false;
    nextB.firstChild.textContent = end ? 'Na glavni meni' : 'Naslednja'; nextB.lastChild.textContent = end ? ' ↩' : ' →';
    fit();
    if (scroll) track.scrollTo({ left: els[idx].offsetLeft, behavior: scroll === 'jump' || reduce ? 'auto' : 'smooth' });
    const tab = tabs[idx]; if (tab && tab.parentNode.scrollWidth > tab.parentNode.clientWidth) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  // the track takes the height of the slide in view, so a short slide leaves no empty panel
  const fit = () => { if (els[idx] && els[idx].offsetHeight) track.style.height = els[idx].offsetHeight + 'px'; };
  const go2 = i => { if (i === idx || i < 0 || i >= n) return; sfx('sel', { rate: 1.1, vol: .5 }); set(i, true); live.textContent = `${slides[idx].title}, ${idx + 1} od ${n}`; };
  const nearest = () => { let best = 0; els.forEach((s, k) => { if (Math.abs(s.offsetLeft - track.scrollLeft) < Math.abs(els[best].offsetLeft - track.scrollLeft)) best = k; }); return best; };
  const onScroll = () => { clearTimeout(settle); settle = setTimeout(() => { const k = nearest(); if (k !== idx) { set(k, false); live.textContent = `${slides[idx].title}, ${idx + 1} od ${n}`; } }, 90); };
  const wrap = h('div', { class: 'car', role: 'region', 'aria-roledescription': 'vrtiljak', 'aria-label': label },
    h('div', { class: 'car-tabs', role: 'group', 'aria-label': 'Uganke' }, slides.map((s, k) =>
      h('button', { class: 'car-tab', ref: el => tabs.push(el), onclick: () => go2(k) }, s.short))),
    h('div', { class: 'car-track', ref: el => track = el, onscroll: onScroll }, slides.map((s, k) =>
      h('article', { class: 'car-slide', 'aria-roledescription': 'prosojnica', 'aria-label': `${k + 1} od ${n}: ${s.title}`, ref: el => els.push(el) },
        h('h3', {}, s.title),
        h('p', { class: 'tut-lead' }, s.lead),
        h('div', { class: 'tut-body' },
          h('figure', { class: 'tut-fig' }, h('div', { class: 'tut-cap' }, 'Primer rešene uganke'), s.fig),
          h('div', {},
            h('ol', { class: 'tut-steps' }, s.steps.filter(Boolean).map(st => h('li', {}, h('span', {}, st)))),
            h('p', { class: 'tut-time info' }, s.time)))))),
    h('div', { class: 'car-nav' },
      h('button', { class: 'btn car-btn', ref: el => prevB = el, onclick: () => go2(idx - 1) }, h('span', { 'aria-hidden': 'true' }, '← '), 'Prejšnja'),
      h('span', { class: 'car-count', ref: el => count = el, 'aria-hidden': 'true' }),
      h('button', { class: 'btn car-btn', ref: el => nextB = el, onclick: () => idx === n - 1 ? (sfx('sel'), go('title')) : go2(idx + 1) }, h('span', {}, 'Naslednja'), h('span', { 'aria-hidden': 'true' }, ' →'))),
    h('div', { class: 'sr-only', 'aria-live': 'polite', ref: el => live = el }));
  UI.car = { step: d => go2(idx + d), get idx() { return idx; }, fit };
  requestAnimationFrame(() => set(idx, 'jump'));
  return wrap;
}
function renderHowto() {
  SCR.append(h('div', { class: 'page howto' },
    crumb(),
    pageH1('Kako igrati'),
    h('p', { class: 'lead' }, 'Na poti te čakajo bitke in dogodki. V vsakem rešiš besedno uganko: prava beseda je napad, daljša udari močneje. Barvne črke povedo, kateri junak napade; več črk iste barve sproži močnejšo veščino.'),
    h('section', { class: 'words-ok' },
      h('h2', {}, 'Katere besede veljajo'),
      h('p', {}, 'Veljajo slovenske besede v vseh oblikah: samostalniki, glagoli, pridevniki, prislovi in druge (', h('i', {}, 'volk, volka, volkom, tečem, lep, hitro'), '). Na vseh stopnjah velja beseda s tremi črkami ali več.'),
      h('p', { class: 'muted' }, 'Lastna imena oseb in krajev (', h('i', {}, 'Eva, Ptuj'), ') ne veljajo, prav tako ne kratice. Je igra zavrnila pravo besedo? Pošlji nam jo v premoru ali na strani O igri.')),
    controlsSection(),
    h('section', {},
      h('h2', {}, 'Uganke'),
      h('p', { class: 'muted sec-lead' }, 'Ko uganko srečaš prvič, se razlaga pokaže tudi v igri, in čas medtem stoji. V premoru je vedno na voljo.'),
      carousel(howtoSlides(), 'Razlage ugank'))));
  focusPage();
}

// ------------------------------------------------------------ O igri: what the game is, its inspiration, sources
function renderAbout(at) {
  const sec = (id, title, ...kids) => h('section', { id: 'o-' + id }, h('h2', {}, title), ...kids);
  SCR.append(h('div', { class: 'page about' },
    crumb(),
    pageH1('O igri'),
    h('p', { class: 'lead' }, h('i', {}, 'Za govor!'), ' je besedna igra vlog s slovanskimi bogovi in junaki slovenskega ljudskega izročila. Junaki se bojujejo z besedami: prava beseda je napad, daljša udari močneje.'),
    h('p', {}, 'Pot vodi po Sloveniji, od Ptuja do Ljubljanskega gradu, kjer čaka zmaj. Začneš z enim junakom. Na poti srečaš nasprotnike, skrinje, plazove, vodnjake, krošnjarje, svetišča bogov in nove junake; v družini so največ trije, bog le eden. Zdravje se po bitki ne vrne samo: junaki se pozdravijo pri vodnjaku, ob novi ravni pa se pozdravijo do konca. Zlatnike zapraviš pri krošnjarju za napoje, strupe in predmete.'),
    h('p', { class: 'muted' }, STAGE === 'zaprta alfa' ? 'Igra je v zaprti alfi: igrajo jo povabljeni preizkuševalci. Še nastaja in se po vsakem preizkusu spremeni.' : 'Igra še nastaja in se po vsakem preizkusu spremeni.'),
    versionLine('about-version'),
    sec('avtor', 'Avtor', creditAuthor()),
    sec('navdih', 'Navdih', creditInspiration()),
    sec('besede', 'Besede',
      h('p', {}, 'Je igra zavrnila pravo slovensko besedo? Bi rad vedel, kaj pomeni beseda, ki si jo našel? Izberi jo in nam jo pošlji.'),
      reportButton(openReportWindow, 'Pošlji besede')),
    sec('zasluge', 'Zasluge', creditSourcesFolded())));
  focusPage();
  if (at) { const t = $('#o-' + at); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'start' })); }
}

// ------------------------------------------------------------ Nastavitve
// Sound for now; on a computer also fullscreen (a phone app is always full screen).
function renderSettings() {
  SCR.append(h('div', { class: 'page settings' },
    crumb(),
    pageH1('Nastavitve'),
    h('section', {}, h('h2', {}, 'Zvok'), soundControls()),
    // Kolo črk (src/wheel.js): the zagovor's crossword on a letter wheel or typed; PROPOSED default: the wheel on a phone
    h('section', {}, h('h2', { id: 'set-kolo' }, 'Križanka zagovora'),
      h('div', { role: 'radiogroup', 'aria-labelledby': 'set-kolo' },
        ...[['kolo', 'Kolo črk', 'Besede sestavljaš z vlečenjem po črkah na kolesu, brez opisov. Manj besed na kolesu, težja uganka.'],
          ['klasika', 'Klasična križanka', S.mobile ? 'Opisi besed, odgovore tipkaš s tipkovnico igre.' : 'Opisi besed, odgovore tipkaš.']].map(([v, label, hint]) =>
          h('label', { class: 'toggle' }, h('input', { type: 'radio', name: 'set-kolo', class: 'set-kolo', value: v, checked: wheelOn() === (v === 'kolo'), onchange: () => setWheelPref(v) }),
            h('span', {}, label, h('small', {}, hint)))))),
    statsSection(),
    h('section', {}, h('div', { class: 'devbox' }, h('span', { class: 'devtag' }, 'Razvoj'),
      h('h2', {}, 'Kakovost slik'),
      h('p', { class: 'muted sec-lead' }, 'Velja samo za ozadja. Visoka: slojevita ozadja (Codex). Nizka: slike, ki so v igri doslej. Zimska različica Ptuja nima nizke kakovosti in ostane visoka. Samodejno prepusti izbiro preizkusu A/B. Velja za naslednjo sliko.'),
      ...[['auto', 'Samodejno (privzeto)'], ['high', 'Visoka kakovost'], ['low', 'Nizka kakovost']].map(([v, label]) =>
        h('label', { class: 'toggle' }, h('input', { type: 'radio', name: 'set-fid', class: 'set-fid', value: v, checked: fidelity() === v, onchange: () => setFidelity(v) }),
          h('span', {}, label))))),
    S.mobile ? null : h('section', {}, h('h2', {}, 'Zaslon'),
      h('label', { class: 'toggle' },
        h('input', { type: 'checkbox', class: 'set-fs', checked: isFs(), onchange: e => {
          if (e.target.checked !== isFs()) toggleFullscreen();
          setTimeout(() => { e.target.checked = isFs(); }, 500);   // where fullscreen is refused, the box goes back
        } }),
        h('span', {}, 'Cel zaslon', h('small', {}, 'Igra zapolni ves zaslon. Enako naredi tipka F11.'))))));
  focusPage();
}

// ------------------------------------------------------------ Dosežki in junaki
// Dosežki in junaki: three tabs, Dosežki, Junaki and Nasprotniki (Game Director, 27 Nov 2026). The tab stays chosen
// while the game runs, so the way back from a hero's card lands on Junaki.
const HEROES_TABS = [['dosezki', 'Dosežki'], ['junaki', 'Junaki'], ['nasprotniki', 'Nasprotniki']];
function renderHeroes() {
  const known = CHARS.filter(c => UNLOCKED.has(c.id)).length, tab = S.heroesTab || 'dosezki';
  const panels = {
    dosezki: achSection(),   // src/achievements.js
    junaki: h('section', {},
      h('h2', {}, 'Junaki', h('span', { class: 'tag' }, `spoznanih ${known} od ${CHARS.length}`)),
      h('p', { class: 'muted sec-lead' }, 'Na začetku poznaš tri. Ko koga srečaš na poti, ga spoznaš in z njim lahko začneš naslednjo pot. Izberi junaka za njegovo karto in zgodbo.'),
      h('ul', { class: 'pickgrid herogrid' }, CHARS.map(c => h('li', {}, UNLOCKED.has(c.id)
        ? h('button', { class: 'pickcard' + (isGod(c.id) ? ' god' : ''), style: { '--c': c.c },
          onclick: () => go('hero', { kind: 'codex', ids: [c.id], crumb: 'Nazaj na junake', next: () => go('heroes'), nextLabel: 'Nazaj na junake ' }) },
          h('i', { style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, c.name))
        : h('div', { class: 'pickcard locked', title: 'Še neznan: srečaš ga na poti' },
          h('i', { class: 'shade', style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, '???'), h('span', {}, 'še neznan')))))),
    nasprotniki: foesSection(),
  };
  const tabs = HEROES_TABS.map(([id, label]) => h('button', { class: 'tab' + (id === tab ? ' on' : ''), role: 'tab', id: 'tab-' + id, 'aria-selected': String(id === tab), 'aria-controls': 'tp-' + id,
    tabindex: id === tab ? '0' : '-1', onclick: () => showHeroesTab(id), onkeydown: e => {
      const i = HEROES_TABS.findIndex(t => t[0] === id), d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); e.stopPropagation(); showHeroesTab(HEROES_TABS[(i + d + HEROES_TABS.length) % HEROES_TABS.length][0], true); } } }, label));
  SCR.append(h('div', { class: 'page heroes' },
    crumb(),
    pageH1('Dosežki in junaki'),
    h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Dosežki, junaki in nasprotniki' }, tabs),
    HEROES_TABS.map(([id]) => h('div', { class: 'tabpanel', role: 'tabpanel', id: 'tp-' + id, 'aria-labelledby': 'tab-' + id, hidden: id !== tab }, panels[id])),
    h('div', { class: 'devbox' }, h('span', { class: 'devtag' }, 'Razvoj'),
      h('button', { class: 'btn small', onclick: () => go('gallery') }, 'Vse sličice, karte in ozadja'))));
  focusPage();
}
function showHeroesTab(id, focus) {
  S.heroesTab = id; sfx('sel', { rate: .9, vol: .5 });
  document.querySelectorAll('.heroes .tab').forEach(t => { const on = t.id === 'tab-' + id; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
  document.querySelectorAll('.heroes .tabpanel').forEach(p => { p.hidden = p.id !== 'tp-' + id; });
}
// Nasprotniki: the same view as Junaki. An enemy is known once beaten on a journey (the achievements' counters); its
// details come from the game's own data: its attacks, where the road meets it, how often it has been beaten.
function foesInRoadOrder() {
  const out = [];
  WORLD.regions.forEach(r => [...(r.pool || []), ...(r.boss || []), ...(r.adds ? [r.adds.key] : [])].forEach(k => { if (ENEMIES[k] && !out.includes(k)) out.push(k); }));
  Object.keys(ENEMIES).forEach(k => { if (!out.includes(k)) out.push(k); });
  return out;
}
const foeBeaten = k => (ACHP.counters || {})['foe:' + k] || 0;
function foeSprite(k, cls = '') {
  const e = ENEMIES[k], art = e.art || k;
  return h('i', { class: cls, style: { 'background-image': `url(${SPRITES[art]})`, filter: cls === 'shade' ? '' : e.tint || '' } });
}
function foesSection() {
  const keys = foesInRoadOrder(), known = keys.filter(foeBeaten);
  const box = h('div', { class: 'foeinfo', 'aria-live': 'polite' });
  const show = k => {
    const e = ENEMIES[k], where = WORLD.regions.filter(r => [...(r.pool || []), ...(r.boss || []), ...(r.adds ? [r.adds.key] : [])].includes(k)).map(r => r.name);
    const moves = [...new Set([...Object.values(e.moves || {}), ...(e.bars > 1 && BOSS_EVENT_NAME[k] ? [BOSS_EVENT_NAME[k]] : [])])], n = foeBeaten(k);   // a boss's event (src/bosses.js)
    box.innerHTML = '';
    const art = e.art || k;
    box.append(h('div', { class: 'pickinfo foepick', style: { '--c': e.boss ? '#c0506a' : '#8b93a6' } },
      h('div', { class: 'spirit' }, h('div', { class: 'actor foe spr' + (e.boss ? ' boss' : ''), style: { '--art': Math.round(SPR_SIZE[art] * (e.scale || 1)) } },
        h('i', { class: 'sp', style: { 'background-image': `url(${SPRITES[art]})`, filter: e.tint || '' } }), e.boss ? bossCrown() : null)),
      h('div', { class: 'pdet' },
        h('h2', {}, e.name),
        h('div', { class: 'ptags' }, e.boss ? h('span', { class: 'rtag', style: { '--tc': '#e8b74a' } }, h('img', { class: 'fxi', src: pxUrl('crown'), alt: '' }), 'glavni nasprotnik') : null,
          h('span', { class: 'php' }, pxIcon('heart'), ` ${e.hpBy ? Math.max(...Object.values(e.hpBy)) : e.hp}`),
          e.bars > 1 ? h('span', { class: 'muted' }, `${e.bars} vrstice zdravja`) : null,
          h('span', { class: 'muted' }, `premagan${e.f ? 'a' : ''} ${n}-krat`)),
        h('div', { class: 'psec' }, h('h3', {}, 'Napadi'), h('div', { class: 'pchips' }, moves.map(m => h('span', { class: 'pchip' }, m)))),
        where.length ? h('div', { class: 'psec' }, h('h3', {}, 'Srečaš ' + (e.f ? 'jo' : 'ga')), h('div', { class: 'pchips' }, where.map(m => h('span', { class: 'pchip' }, m)))) : null)));
    document.querySelectorAll('.foegrid .pickcard').forEach(c => c.classList.toggle('on', c.dataset.foe === k));
  };
  const grid = h('ul', { class: 'pickgrid herogrid foegrid' }, keys.map(k => h('li', {}, foeBeaten(k)
    ? h('button', { class: 'pickcard' + (ENEMIES[k].boss ? ' boss' : ''), 'data-foe': k, onclick: () => { show(k); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } },
      foeSprite(k), h('b', {}, ENEMIES[k].name))
    : h('div', { class: 'pickcard locked', title: 'Še neznan: spoznaš ga, ko ga prvič premagaš' }, foeSprite(k, 'shade'), h('b', {}, '???'), h('span', {}, 'še neznan')))));
  const sec = h('section', {},
    h('h2', {}, 'Nasprotniki', h('span', { class: 'tag' }, `spoznanih ${known.length} od ${keys.length}`)),
    h('p', { class: 'muted sec-lead' }, 'Nasprotnika spoznaš, ko ga prvič premagaš na poti. Izberi ga za njegove napade in kraje, kjer ga srečaš.'),
    box, grid);
  if (known.length) requestAnimationFrame(() => show(known[0]));
  return sec;
}
