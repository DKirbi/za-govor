
// ============================================================ main menu and the pages under it
// The start screen is a short menu: Nadaljuj pot (while a journey is under way), Nova pot,
// Dosežki in junaki, Kako igrati and O igri. Each page under it has one way back, at the top
// ("← Nazaj na glavni meni"); Esc and the Android back button do the same.
// Difficulty is chosen on Nova pot only, and only takes effect when the new journey starts:
// a journey under way keeps the pace and knowledge level it began with.
const MENU_PAGES = { newrun: 1, howto: 1, about: 1, heroes: 1 };

function menuItems() {
  const R = S.run, items = [];
  if (R && !R.over) items.push({ id: 'continue', label: 'Nadaljuj pot', sub: WORLD.regions[R.ri].name, fn: () => go('travel') });
  items.push({ id: 'new', label: 'Nova pot', fn: () => go('newrun') },
    { id: 'heroes', label: 'Dosežki in junaki', fn: () => go('heroes') },
    { id: 'howto', label: 'Kako igrati', fn: () => go('howto') },
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
        h('span', { class: 'mm-label' }, it.label), it.sub ? h('span', { class: 'mm-sub' }, `(${it.sub})`) : null)))))));
  // keyboard players land on the menu ready to move; on a phone nothing is pre-focused
  if (cur && !S.mobile) cur.focus({ preventScroll: true });
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

// ------------------------------------------------------------ pages: the way back and the heading
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
  { id: 'real', name: 'Realni čas', badge: 'priporočeno', text: 'Sovražniki napadajo sproti in počasi topijo zdravje družine.' },
  { id: 'calm', name: 'Mirni način', text: 'Brez časovnega pritiska, sovražniki napadejo na vsakih nekaj potez. Dogodki imajo dvojni čas.' }];
const KNOW = [
  { id: 'malcek', text: 'Za učenje besed.' },
  { id: 'ucenjak', text: 'Zahtevnejše besede, malo pomoči.' },
  { id: 'molj', text: 'Za križankarje in pametnjakoviče.' }];
const setupVal = k => S.setup ? S.setup[k] : S[k];
function applySetup() {
  const U = S.setup; if (!U) return;
  S.mode = U.mode; S.know = U.know; S.suggest = U.suggest; S.testMode = U.testMode;
  S.tutOn = U.tutOn; if (U.tutOn) resetTuts();      // explanations come back for every puzzle type on this journey
  try { localStorage.setItem('zg-know', U.know); localStorage.setItem('zg-mode', U.mode); localStorage.setItem('zg-tutorials', U.tutOn ? '1' : '0'); } catch (e) { /* no storage */ }
  S.setup = null;
}
function setupNext() { sfx('sel'); go('pick'); }

function renderNewRun() {
  if (!S.setup) S.setup = { mode: S.mode, know: S.know, suggest: S.suggest, tutOn: S.tutOn, testMode: S.testMode };
  const U = S.setup, R = S.run && !S.run.over ? S.run : null;
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
      h('h2', { id: 'set-pace' }, 'Težavnost'),
      h('div', { class: 'choices', role: 'radiogroup', 'aria-labelledby': 'set-pace' },
        PACE.map(p => radio('mode', p.id, [h('h3', {}, p.name, p.badge ? h('span', { class: 'badge' }, p.badge) : null), h('p', {}, p.text)])))),
    h('section', { class: 'set-block' },
      h('h2', { id: 'set-know' }, 'Znanje'),
      h('div', { class: 'lv-grid', role: 'radiogroup', 'aria-labelledby': 'set-know' },
        KNOW.map(k => [
          radio('know', k.id, [h('span', { class: 'lv-art', 'aria-hidden': 'true' }, h('i', { class: 'sp', style: { 'background-image': `url(${SPRITES['lv-' + k.id]})` } })),
            h('h3', {}, LEVELS[k.id].name), h('p', {}, k.text)], 'lv'),
          LEVELS[k.id].proposals ? h('div', { class: 'subopt', 'data-for': k.id, hidden: U.know !== k.id },
            toggle('suggest', 'Predlogi besed med igro', 'Pod mrežo se pokažejo besede, ki jih lahko sestaviš.')) : null]))),
    h('div', { class: 'set-opts' },
      toggle('tutOn', 'Pokaži razlage ugank', 'Pred prvo uganko vsake vrste kratka razlaga s sliko. Čas medtem stoji.'),
      h('div', { class: 'devbox' }, h('span', { class: 'devtag' }, 'Razvoj'),
        toggle('testMode', 'Preizkusni način', '200 zlatnikov, vsi junaki na izbiro, postaje in pokrajine lahko preskočiš.'))),
    R ? h('p', { class: 'note' }, `Začeta pot (${WORLD.regions[R.ri].name}) se konča, ko izbereš junaka za novo pot.`) : null,
    h('div', { class: 'cta-row' },
      h('button', { class: 'btn primary cta', onclick: setupNext }, 'Izberi junaka', h('span', { 'aria-hidden': 'true' }, ' →')),
      h('kbd', {}, 'Enter'))));
  focusPage();
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
    [['←', '→'], 'izberi sovražnika, ki ga napadeš'], [['1', '2', '3'], 'namig · premešaj mrežo · torba']]],
  ['Križanka', [[['a–ž'], 'vpiši odgovor'], [['Tab', 'Enter'], 'naslednja beseda (Shift + Tab: prejšnja)'], [['←', '↑', '↓', '→'], 'premik po mreži'],
    [['Backspace'], 'briši črko'], [['?'], 'razkrij črko (število je omejeno)']]],
  ['Skrinja, puščice in plaz', [[['a–ž'], 'tipkaj črke ali klikaj nanje'], [['Enter'], 'pošlji besedo'], [['Backspace', 'Del'], 'briši črko · počisti besedo']]],
];
const CONTROLS_PHONE = [
  ['Povsod', [['Premor', 'gumb zgoraj ustavi čas in zakrije uganko; igra se ustavi tudi, ko jo zapustiš'], ['Nazaj', 'tipka nazaj na Androidu ustavi uganko, zapre okno ali te vrne v meni']]],
  ['Na poti', [['Tap', 'na gumb pod sliko: hodi naprej ali izberi, kaj narediš na postaji'], ['Torba', 'napoji, strupi in predmeti']]],
  ['Mreža črk', [['Vleci', 'po sosednjih črkah, tudi poševno, in spusti: beseda se pošlje sama'], ['Tapkaj', 'črko za črko; zadnjo tapni še enkrat'],
    ['Predlog', 'tap na predlog ga pošlje'], ['Gumbi', 'Zagovor, Namig, Premešaj in Torba so pod mrežo']]],
  ['Križanka in plaz', [['Tipkovnica', 'slovenska tipkovnica v igri, s Č, Š in Ž'], ['Naprej', 'skoči na naslednjo besedo; izbereš jo lahko tudi s tapom v mreži'], ['Razkrij črko', 'pokaže eno črko']]],
  ['Skrinja in puščice', [['Tapkaj', 'črke v pravem vrstnem redu'], ['Pošlji', 'odda besedo; prva prava beseda šteje']]],
];
function controlsEl() {
  const keys = ks => Array.isArray(ks) ? ks.map((k, i) => [i ? ' ' : null, h('kbd', {}, k)]) : h('b', {}, ks);
  return h('div', { class: 'ctl-groups' }, (S.mobile ? CONTROLS_PHONE : CONTROLS_DESK).map(([title, rows]) =>
    h('section', { class: 'ctl-group' }, h('h3', {}, title),
      h('dl', { class: 'ctl' }, rows.map(([k, text]) => [h('dt', {}, keys(k)), h('dd', {}, text)])))));
}
// the puzzle explanations of the game (src/playtest.js), with timing told for both paces
function howtoSlides() {
  const T = k => TUT[k]();
  const cross = tutCross('finisher');
  return [
    { id: 'mesh', short: 'Mreža', ...T('mesh'),
      time: 'Realni čas: sovražniki napadajo sproti, zato so hitre besede vredne več kot popolne. Mirni način: sovražniki počakajo na tvojo besedo.' },
    { id: 'cross', short: 'Križanka', title: 'Križanka', fig: cross.fig, steps: cross.steps,
      lead: 'Križanko odpre poln zagovor (mogočen udarec), sovražnikovo zaklepanje (mreža črk je zaprta, dokler je ne rešiš) ali zaseda (udariš prvi). Vsaka pravilno rešena beseda je napad.',
      time: 'Pri zagovoru časa ni. Pri zaklepanju in zasedi kaže rdeča črta nad križanko, koliko časa ostane; v mirnem načinu časa ni.' },
    { id: 'chest', short: 'Skrinja', ...T('chest'), time: 'Rdeča črta je čas. Ko poteče, skrinja ostane zaklenjena. V mirnem načinu je časa dvakrat več.' },
    { id: 'darts', short: 'Puščice', ...T('darts'), time: 'Rdeča črta je čas. Ko poteče, poletijo vse puščice nate. V mirnem načinu je časa dvakrat več.' },
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
    count.textContent = `${idx + 1} / ${n}`; prevB.disabled = idx === 0; nextB.disabled = idx === n - 1;
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
      h('button', { class: 'btn car-btn', ref: el => nextB = el, onclick: () => go2(idx + 1) }, 'Naslednja', h('span', { 'aria-hidden': 'true' }, ' →'))),
    h('div', { class: 'sr-only', 'aria-live': 'polite', ref: el => live = el }));
  UI.car = { step: d => go2(idx + d), get idx() { return idx; }, fit };
  requestAnimationFrame(() => set(idx, 'jump'));
  return wrap;
}
function renderHowto() {
  SCR.append(h('div', { class: 'page howto' },
    crumb(),
    pageH1('Kako igrati'),
    h('p', { class: 'lead' }, 'Na poti te čakajo bitke in dogodki. V vsakem rešiš besedno uganko: prava beseda je napad, daljša udari močneje. Barvne črke povedo, kateri junak napade.'),
    h('section', {},
      h('h2', {}, 'Upravljanje', h('span', { class: 'tag' }, S.mobile ? 'telefon' : 'tipkovnica in miška')),
      controlsEl()),
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
    h('p', {}, 'Pot vodi po Sloveniji, od Ptuja do Ljubljanskega gradu, kjer čaka zmaj. Začneš z enim junakom. Na poti srečaš sovražnike, skrinje, plazove, vodnjake, krošnjarje in nove junake; v družini so največ štirje, bog le eden. Zdravje se po bitki ne vrne samo: junaki se pozdravijo pri vodnjaku. Zlatnike zapraviš pri krošnjarju za napoje, strupe in predmete.'),
    h('p', { class: 'muted' }, 'To je prototip. Igra še nastaja in se po vsakem preizkusu spremeni.'),
    sec('navdih', 'Navdih', creditInspiration()),
    sec('besede', 'Manjkajoča beseda',
      h('p', {}, 'Je igra zavrnila pravo slovensko besedo? Sporoči nam jo, da jo dodamo.'),
      reportButton(openReportWindow, 'Prijavi manjkajočo besedo')),
    sec('zasluge', 'Zasluge', creditSources())));
  focusPage();
  if (at) { const t = $('#o-' + at); if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'start' })); }
}

// ------------------------------------------------------------ Dosežki in junaki
function renderHeroes() {
  const known = CHARS.filter(c => UNLOCKED.has(c.id)).length;
  SCR.append(h('div', { class: 'page heroes' },
    crumb(),
    pageH1('Dosežki in junaki'),
    h('section', {},
      h('h2', {}, 'Dosežki'),
      h('div', { class: 'empty' }, h('b', {}, 'Dosežkov še ni.'), ' Ko jih dodamo, se bodo zbirali tukaj.')),
    h('section', {},
      h('h2', {}, 'Junaki', h('span', { class: 'tag' }, `spoznanih ${known} od ${CHARS.length}`)),
      h('p', { class: 'muted sec-lead' }, 'Na začetku poznaš tri. Ko koga srečaš na poti, ga spoznaš in z njim lahko začneš naslednjo pot. Izberi junaka za njegovo karto in zgodbo.'),
      h('ul', { class: 'pickgrid herogrid' }, CHARS.map(c => h('li', {}, UNLOCKED.has(c.id)
        ? h('button', { class: 'pickcard' + (isGod(c.id) ? ' god' : ''), style: { '--c': c.c },
          onclick: () => go('hero', { kind: 'codex', ids: [c.id], crumb: 'Nazaj na junake', next: () => go('heroes'), nextLabel: 'Nazaj na junake ' }) },
          h('i', { style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, c.name), h('span', {}, isGod(c.id) ? 'bog' : ROSTER[c.id].role))
        : h('div', { class: 'pickcard locked', title: 'Še neznan: srečaš ga na poti' },
          h('i', { class: 'shade', style: { 'background-image': `url(${SPRITES[c.id]})` } }), h('b', {}, '???'), h('span', {}, 'še neznan')))))),
    h('div', { class: 'devbox' }, h('span', { class: 'devtag' }, 'Razvoj'),
      h('button', { class: 'btn small', onclick: () => go('gallery') }, 'Vse sličice, karte in ozadja'))));
  focusPage();
}
