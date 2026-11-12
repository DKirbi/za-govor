// ============================================================ playtest round 2: pause, puzzle intros, fullscreen, fit to screen
// One hold switch for the whole game: while the player pauses or reads a puzzle intro, no clock runs
// (battle, crossword, chest, rock slide, delayed attacks) and the puzzle itself is blurred.
const G = { paused: false, tut: null, pauseEl: null, hadFocus: false };
const held = () => G.paused || !!G.tut;

// Delayed game actions run on the game clock, so they wait while the game is held.
const LATER = [];
function later(fn, ms) { LATER.push({ fn, t: ms / 1000 }); }
function runLater(dt) {
  if (!LATER.length) return;
  const due = [];
  for (const j of LATER) { j.t -= dt; if (j.t <= 0) due.push(j); }
  for (const j of due) LATER.splice(LATER.indexOf(j), 1);
  for (const j of due) { try { j.fn(); } catch (err) { console.error(err); } }
}

const TIMED = { battle: 1, chest: 1, trap: 1, darts: 1 };
function pausable() {
  if (S.bagEl) return false;
  if (S.screen === 'battle') return !!B && !B.over;
  if (S.screen === 'chest' || S.screen === 'trap' || S.screen === 'darts') return !!S.ev && !S.ev.done;
  return false;
}
function applyHeld() { document.body.classList.toggle('held', held()); }
function syncTopbar() { const tb = $('.topbar'); if (tb) tb.replaceWith(renderTopbar()); }
function dropFocus() {
  const a = document.activeElement;
  G.hadFocus = isTextInput(a);
  if (a && a !== document.body && a.blur) a.blur();
}
function refocusPuzzle(always) {
  if (!(always || G.hadFocus || !S.mobile)) return;
  if (S.screen === 'battle' && B && B.cw) focusCwInput();
  else if (S.screen === 'trap' && S.ev && !S.ev.done && UI.trapInput && !S.mobile) UI.trapInput.focus();
}

// ------------------------------------------------------------ pause
function setPause(on) {
  on = !!on;
  if (on === G.paused || (on && (G.tut || !pausable()))) return;
  G.paused = on;
  if (on) {
    dropFocus();
    let first;
    const vol = h('output', {}, Math.round(VOLUME * 100) + ' %');
    G.pauseEl = h('div', { class: 'overlay pause', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Premor' }, h('div', { class: 'dialog' },
      h('h2', {}, 'Premor'),
      h('div', { class: 'muted' }, 'Čas stoji. Uganka je zakrita, dokler ne nadaljuješ.'),
      h('div', { class: 'pause-actions' },
        h('button', { class: 'btn primary', ref: el => first = el, onclick: () => setPause(false) }, 'Nadaljuj ', h('kbd', {}, 'Esc')),
        h('button', { class: 'btn', onclick: () => showTut(curTutKind(), true) }, 'Kako se igra'),
        S.mobile ? null : h('button', { class: 'btn', onclick: toggleFullscreen }, 'Cel zaslon: vklop / izklop')),
      h('label', { class: 'volrow' }, 'Glasnost',
        h('input', { type: 'range', min: 0, max: 100, step: 5, value: Math.round(VOLUME * 100), 'aria-label': 'Glasnost zvočnih učinkov',
          oninput: e => { setVolume(e.target.value / 100); vol.textContent = Math.round(VOLUME * 100) + ' %'; },
          onchange: () => sfx('hit1', { soft: true, vol: ATK_VOL }) }), vol)));
    document.body.append(G.pauseEl);
    first.focus();
  } else {
    G.pauseEl.remove(); G.pauseEl = null;
    refocusPuzzle(false);
  }
  applyHeld();
}
function togglePause() { setPause(!G.paused); }
// leaving the window mid-puzzle pauses a timed game instead of letting the clock run out unseen
window.addEventListener('blur', () => { if (S.mode === 'real' && !held()) setPause(true); });

// ------------------------------------------------------------ puzzle intros ("Kako se igra")
const TUT_SEEN = new Set((() => { try { return JSON.parse(localStorage.getItem('zg-tut') || '[]'); } catch (e) { return []; } })());
function saveTutSeen() { try { localStorage.setItem('zg-tut', JSON.stringify([...TUT_SEEN])); } catch (e) { /* no storage */ } }
function resetTuts() { TUT_SEEN.clear(); saveTutSeen(); }
const curTutKind = () => S.screen === 'battle' ? (B && B.cw ? B.cw.kind : 'mesh') : S.screen;
const K = t => h('kbd', {}, t);

// Figures are built from the real game pieces (tiles, cells, rocks, the chest sprite) in a solved state.
function figMesh() {
  const L = 'kvoreadlsitm', path = [1, 2, 6, 5], size = 40, gap = 5, own = ROSTER.krpan;
  const pts = path.map(i => `${(i % 4) * (size + gap) + size / 2},${Math.floor(i / 4) * (size + gap) + size / 2}`).join(' ');
  const svg = svgEl('svg', { class: 'pathsvg' });
  svg.append(svgEl('polyline', { points: pts, fill: 'none', stroke: '#5fd38d', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.6 }));
  return [
    h('div', { class: 'meshwrap' },
      h('div', { class: 'mesh' }, [...L].map((ch, i) => h('div', { class: 'tile' + (path.includes(i) ? ' sel valid' : '') + (i === 6 || i === 8 ? ' own' : ''), style: { '--c': own.c } },
        i === 6 || i === 8 ? h('span', { class: 'ini' }, own.ini || own.name[0]) : null, ch))), svg),
    h('div', { class: 'tut-res ok' }, h('b', {}, 'VODA'), ' — štiri sosednje črke, prava beseda. Črka D je obarvana, zato napade ', own.name, '.')];
}
function figCross() {
  // KRUH across is solved (green); MUHA down is half typed (black)
  const rows = ['..m..', 'kruh.', '..h..', '..?..'], cls = { '1,0': 'ok', '1,1': 'ok', '1,2': 'ok', '1,3': 'ok', '0,2': 'typed', '2,2': 'typed', '3,2': 'cur' };
  const cells = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => cells.push(ch === '.' ? h('div', { class: 'cell void' })
    : h('div', { class: 'cell ' + (cls[r + ',' + c] || '') }, r === 1 && c === 0 ? h('i', {}, '1') : r === 0 ? h('i', {}, '2') : null, h('b', {}, ch === '?' ? '' : ch)))));
  return [
    h('div', { class: 'cwgrid', style: { 'grid-template-columns': 'repeat(5, var(--cell))' } }, cells),
    h('div', { class: 'curclue' }, h('b', {}, '1 vodoravno'), 'Vsakdanji ___, pečen iz moke'),
    h('div', { class: 'tut-key' },
      h('i', { style: { background: 'var(--good)' } }), h('span', {}, 'prava beseda: napad se sproži'),
      h('i', { style: { background: '#16171c', border: '1px solid var(--line)' } }), h('span', {}, 'vpisano, a še ni prav: nič se ne zgodi'))];
}
function figChest() {
  const tiles = w => h('div', { class: 'letters' }, [...w].map(ch => h('div', { class: 'tile' }, ch)));
  const guess = (w, n, cls) => h('div', { class: 'guess ' + cls }, Array.from({ length: n }, (_, k) => h('span', { class: 'lt' }, w[k] || '')));
  return [
    tiles('lokab'), h('div', { class: 'tut-arrow' }, 'Namig: plava po nebu'),
    h('div', { class: 'tut-row' }, objEl('skrinja', 1), h('div', {}, guess('oblak', 5, 'ok'), h('div', { class: 'tut-res ok' }, h('b', {}, 'OBLAK'), ' — vse črke: skrinja se odpre.'))),
    h('div', { class: 'tut-sep' }),
    h('div', { class: 'tut-row' }, objEl('skrinja', 0), h('div', {}, guess('bok', 5, 'part'), h('div', { class: 'tut-res part' }, h('b', {}, 'BOK'), ' — prava, a krajša beseda: le del nagrade.')))];
}
function figTrap() {
  const rocks = (word, all) => h('div', { class: 'tut-rocks' }, [...all].map(ch => h('div', { class: 'rock ' + (word.includes(ch) ? 't-ok' : 't-miss'), style: { 'background-image': `url(${ART.skala})` } }, ch)));
  return [
    rocks('kruh', 'kruh'), h('div', { class: 'tut-typed' }, 'kruh'),
    h('div', { class: 'tut-res ok' }, h('b', {}, 'KRUH'), ' vsebuje vse štiri črke: ves plaz se razbije.'),
    h('div', { class: 'tut-sep' }),
    rocks('ura', 'kruh'), h('div', { class: 'tut-typed' }, 'ura'),
    h('div', { class: 'tut-res part' }, h('b', {}, 'URA'), ' razbije U in R. Skali K in H te oplazita.')];
}
function figDarts() {
  const wall = (cols, sel) => h('div', { class: 'dartcols' }, cols.map((col, c) => h('div', { class: 'dartcol' }, [...col].map((ch, r) => h('div', { class: 'tile' + (sel[c] === r ? ' sel' : '') }, ch)))));
  const cols = ['kso', 'ermu', 'eauo', 'spjk', 'aten', 'rvlm'].map(x => x.slice(0, 3));
  return [
    wall(cols, [0, 1, 1, 0, 0, 0]),
    h('div', { class: 'tut-res part' }, h('b', {}, 'KRASAR'), ' ni beseda: če jo pošlješ, poletijo vse puščice nate.'),
    h('div', { class: 'tut-sep' }),
    wall(cols, [0, 1, 1, 0]),
    h('div', { class: 'tut-res part' }, h('b', {}, 'KRAS'), ' — prava beseda iz prvih štirih stolpcev: štiri puščice se obrnejo, dve te zadeneta.')];
}
function tutCross(kind) {
  const real = S.mode === 'real', C = B && B.cw, geslo = !!(C && C.D && C.D.style === 'geslo'), secs = C && C.timerMax !== Infinity ? Math.round(C.timerMax) : 0;
  const lead = { finisher: 'Zagovor je poln. Vsaka pravilno rešena beseda je napad, cela križanka pa še mogočnejši udarec.',
    lock: 'Sovražnik te je ujel v križanko. Mreža črk je zaprta, dokler križanke ne rešiš.',
    ambush: 'Tokrat udariš prvi. Vsaka pravilno rešena beseda je udarec, preden te sovražniki opazijo.' }[kind];
  const time = kind === 'finisher' ? (real ? 'Časa ni, a sovražniki napadajo naprej, le pol počasneje. Križanko lahko prekličeš; moč zagovora ostane.' : 'Časa ni in sovražniki čakajo. Križanko lahko prekličeš; moč zagovora ostane.')
    : !secs ? 'V mirnem načinu časa ni.'
    : kind === 'lock' ? `Rdeča črta nad križanko je čas (${secs} s). Ko poteče, sovražnik udari z vso močjo.`
    : `Rdeča črta nad križanko je čas (${secs} s). Ko poteče, te opazijo in bitka se nadaljuje v mreži črk.`;
  return { title: { finisher: 'Zagovor: križanka', lock: 'Zaklepanje: križanka', ambush: 'Zaseda: križanka' }[kind], lead, fig: figCross(), calm: kind === 'finisher' || !secs, time,
    steps: [
      S.mobile ? ['Rumeno polje kaže opis označene besede. Odgovor vpiši s tipkovnico pod križanko.'] : ['Rumeno polje kaže opis označene besede. Vpiši odgovor.'],
      ['Prava beseda pozeleni in takoj sproži napad. Črne črke pomenijo, da beseda še ni prava.'],
      S.mobile ? ['Tipka Naprej skoči na naslednjo besedo; izbereš jo lahko tudi s tapom v mreži. Gumb »Razkrij črko« pokaže eno črko.'] : [K('Tab'), ' skoči na naslednjo besedo, ', K('?'), ' razkrije eno črko (število je omejeno).'],
      geslo ? ['Zlat stolpec skriva geslo. Če ga uganeš, je križanka rešena takoj.'] : null] };
}
const TUT = {
  mesh: () => ({ title: 'Mreža črk', lead: 'Iz sosednjih črk sestavi slovensko besedo. Vsaka beseda je napad na sovražnika.', fig: figMesh(), calm: S.mode !== 'real',
    time: S.mode === 'real' ? 'Sovražniki napadajo sproti. Ko sovražnik zažari, sledi udarec, zato so hitre besede vredne več kot popolne.' : 'V mirnem načinu sovražniki počakajo na tvojo besedo.',
    steps: [
      S.mobile ? ['Vleci ali tapkaj po sosednjih črkah, tudi poševno.'] : ['Tipkaj besedo; pot po sosednjih črkah se poišče sama. Lahko tudi vlečeš z miško.'],
      S.mobile ? [`Pritisni Pošlji. Beseda ima vsaj ${MINW()} črke; daljša udari močneje.`] : [K('Enter'), ` pošlje besedo. Imeti mora vsaj ${MINW()} črke; daljša udari močneje.`],
      ['Barvne črke pripadajo junakom: ko jih uporabiš, napade junak te barve.'],
      S.mobile ? ['Vsaka črka polni zagovor. Ko je poln, gumb Izreci zagovor odpre križanko za mogočen udarec.'] : ['Vsaka črka polni zagovor. Ko je poln, ', K('presledek'), ' odpre križanko za mogočen udarec.']] }),
  finisher: () => tutCross('finisher'), lock: () => tutCross('lock'), ambush: () => tutCross('ambush'),
  chest: () => ({ title: 'Zaklenjena skrinja', lead: 'Iz premešanih črk sestavi skrito besedo. Namig pove, kaj iščeš.', fig: figChest(),
    time: `Rdeča črta je čas (${Math.round(S.ev.timeMax)} s). Ko poteče, skrinja ostane zaklenjena.`,
    steps: [
      S.mobile ? ['Tapkaj črke v pravem vrstnem redu.'] : ['Tipkaj črke ali klikaj nanje.'],
      S.mobile ? ['Pritisni Pošlji. Prva prava beseda zaključi dogodek.'] : [K('Enter'), ' odda besedo. Prva prava beseda zaključi dogodek.'],
      ['Beseda iz vseh črk odpre skrinjo in prinese celo nagrado. Krajša prava beseda prinese le del.']] }),
  darts: () => ({ title: 'Puščice v zidu', lead: 'Zid črk v stolpcih. Iz vsakega stolpca vzemi eno črko, od leve proti desni.', fig: figDarts(),
    time: `Rdeča črta je čas (${Math.round(S.ev.timeMax)} s). Ko poteče, poletijo vse puščice nate.`,
    steps: [
      S.mobile ? ['Tapni eno črko v prvem stolpcu, nato v drugem in tako naprej.'] : ['Tipkaj črke ali klikaj nanje: najprej prvi stolpec, nato drugi in tako naprej.'],
      ['Besedo lahko pošlješ, še preden prideš do zadnjega stolpca. Vsaka črka prave besede obrne eno puščico proti sovražnikom naslednje bitke.'],
      ['Puščice, ki ostanejo, zadenejo družino. Beseda, ki ne obstaja, ne obrne nobene.']] }),
  trap: () => ({ title: 'Plaz kamenja', lead: 'S pobočja padajo skale. Vsaka nosi črko in ena sama beseda jih lahko razbije.', fig: figTrap(),
    time: `Skale padajo ${Math.round(S.ev.fall)} s. Šteje prva prava beseda; če ne pošlješ nobene, skale udarijo s polno močjo.`,
    steps: [
      ['Poglej črke na skalah.'],
      [S.mobile ? 'Vpiši eno besedo s tipkami spodaj in pritisni Pošlji.' : 'Vpiši eno besedo in jo pošlji.', ' Vsebuje naj čim več teh črk; v besedi so lahko kjerkoli.'],
      ['Skale s črkami iz besede se razbijejo. Ostale te oplazijo.']] }),
};
function showTut(kind, force) {
  if (G.tut || !TUT[kind]) return false;
  if (!force && (!S.tutOn || TUT_SEEN.has(kind))) return false;
  TUT_SEEN.add(kind); saveTutSeen();
  const T = TUT[kind](), fromPause = G.paused;
  if (!fromPause) dropFocus();
  let first;
  const el = h('div', { class: 'overlay tut', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Kako se igra: ' + T.title }, h('div', { class: 'dialog tutdlg' },
    h('div', { class: 'tut-k' }, 'Kako se igra', h('span', { class: 'stop' }, 'čas stoji')),
    h('h2', {}, T.title),
    h('p', { class: 'tut-lead' }, T.lead),
    h('div', { class: 'tut-body' },
      h('figure', { class: 'tut-fig' }, h('div', { class: 'tut-cap' }, 'Primer rešene uganke'), T.fig),
      h('div', {},
        h('ol', { class: 'tut-steps' }, T.steps.filter(Boolean).map(s => h('li', {}, h('span', {}, s)))),
        h('p', { class: 'tut-time' + (T.calm ? ' calm' : '') }, T.time))),
    h('div', { class: 'tut-foot' },
      h('span', { class: 'muted' }, fromPause ? 'Čas stoji tudi v premoru.' : 'Čas steče šele, ko začneš. Razlaga je vedno na voljo v premoru.'),
      h('button', { class: 'btn primary', ref: b => first = b, onclick: closeTut }, fromPause ? 'Nazaj ' : 'Začni ', K('Enter')))));
  document.body.append(el);
  G.tut = { kind, el, fromPause };
  applyHeld();
  first.focus();
  return true;
}
function closeTut() {
  const T = G.tut; if (!T) return;
  T.el.remove(); G.tut = null;
  applyHeld();
  if (T.fromPause && G.pauseEl) { const b = $('.btn.primary', G.pauseEl); if (b) b.focus(); }
  else refocusPuzzle(true);
  fitSoon();
}

// Overlay keys come first (capture), so nothing typed reaches the puzzle underneath, and Esc pauses from anywhere,
// including the crossword and rock-slide text fields.
window.addEventListener('keydown', e => {
  if (G.tut || G.paused) {
    const onControl = e.target && e.target.closest && e.target.closest('.overlay button, .overlay input');
    if (e.key === 'Escape' || (!onControl && (e.key === 'Enter' || e.key === ' '))) { e.preventDefault(); if (G.tut) closeTut(); else setPause(false); }
    e.stopImmediatePropagation();
    return;
  }
  if (e.key === 'Escape' && !S.overlayKey && pausable()) { e.preventDefault(); e.stopImmediatePropagation(); setPause(true); }
}, true);

// ------------------------------------------------------------ fullscreen + fit to screen
function toast(text) {
  const old = $('.toast'); if (old) old.remove();
  const t = h('div', { class: 'toast', role: 'status' }, text);
  document.body.append(t); setTimeout(() => t.remove(), 6500);
}
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function toggleFullscreen() {
  const fail = () => toast('Celozaslonski način tukaj ni na voljo. Odpri prototip v svojem zavihku ali pritisni F11; prikaz se oknu prilagodi tudi brez tega.');
  try {
    if (isFs()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!rq) return fail();
    const p = rq.call(el); if (p && p.catch) p.catch(fail);
  } catch (e) { fail(); }
}
const FIT = { battle: 1, result: 1, chest: 1, trap: 1, darts: 1, travel: 1, hero: 1, pick: 1 };
const SCENE_H = 330, SCENE_MIN = 240, APP_W = 1000, APP_PAD = 32;
let ZOOM = 1, fitRaf = 0;
function fitScreen() {
  if (!SCR) return;
  const on = !S.mobile && !!FIT[S.screen], fs = isFs();
  const scene = SCR.querySelector('.battle > .scene');
  SCR.style.zoom = ''; app.style.maxWidth = ''; if (scene) scene.style.height = '';
  document.body.classList.toggle('fit', on); document.body.classList.remove('tight');
  ZOOM = 1;
  if (!on) return;
  const top = SCR.getBoundingClientRect().top + window.scrollY;
  const avail = window.innerHeight - top - 12;
  let need = SCR.offsetHeight;
  if (need < 40 || avail < 200) return;
  if (need > avail) { document.body.classList.add('tight'); need = SCR.offsetHeight; }
  if (scene && need > avail) { const cut = Math.min(need - avail, SCENE_H - SCENE_MIN); scene.style.height = (SCENE_H - cut) + 'px'; need -= cut; }
  const zw = (window.innerWidth - APP_PAD) / (APP_W - APP_PAD);
  const z = clamp(Math.min(avail / need, fs ? Math.min(zw, 2) : 1), 0.6, 2);
  if (Math.abs(z - 1) < 0.015) return;
  ZOOM = Math.round(z * 1000) / 1000;
  SCR.style.zoom = ZOOM;
  app.style.maxWidth = Math.round(APP_PAD + (APP_W - APP_PAD) * ZOOM) + 'px';
}
function fitSoon() { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(() => { fitScreen(); if (S.screen === 'travel') layoutTravel(); }); }
// content that grows after the last fit (a taller crossword, more word proposals) must not push the page into scrolling
if (window.ResizeObserver) new ResizeObserver(() => {
  if (S.mobile || !FIT[S.screen] || !SCR) return;
  if (document.documentElement.scrollHeight > window.innerHeight + 2 && ZOOM > 0.6) fitSoon();
}).observe(app);
window.addEventListener('resize', fitSoon);
for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { syncTopbar(); fitSoon(); });
