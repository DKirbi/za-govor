
// ============================================================ saving the journey
// The journey is saved at checkpoints: after the last battle of certain regions, chosen by Znanje
// (data/world.json → checkpoints). Counted in battles (19 on the road), rounded to a region's end:
//   malček        every quarter of the road: Peca, Trnovski gozd, Predjamski grad
//   učenjak       every third: Triglav, Piranske soline
//   knjižni molj  once, at the half: Trnovski gozd (after the shrines at Bled)
// The save lives in this browser (localStorage `zg-save`), so closing the page at any moment is safe:
// Nadaljuj pot on the start screen picks the journey up from the last checkpoint, and whatever happened
// after it is played again. Starting a new journey, reaching the end or losing the journey removes it.
// Izhod (on the road and in the pause window) says where the game last saved before it leaves.
const SAVE_KEY = 'zg-save', SAVE_V = 1;
const CHECKPOINTS = WORLD.checkpoints || {};
const checkpointIds = (know = S.know) => CHECKPOINTS[know] || CHECKPOINTS.malcek || [];
const regionName = id => (WORLD.regions.find(r => r.id === id) || {}).name || id;

// a save from another build that no longer fits the road or the roster is dropped, not loaded half-broken
function saveFits(s) {
  try {
    const R = s.run, reg = WORLD.regions[R.ri];
    return s.v === SAVE_V && !!reg && reg.id === s.region && Array.isArray(s.party) && s.party.length >= 1 && s.party.length <= 4 &&   // four: a save from before the party of three (24 Nov) still loads
     
      s.party.every(id => ROSTER[id]) && Array.isArray(s.heroes) && s.heroes.length === s.party.length && !!LEVELS[s.know] &&
      Array.isArray(R.stops) && R.stops.every(st => st && typeof st.kind === 'string');
  } catch (e) { return false; }
}
let SAVED = null, SAVE_DROPPED = false;
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) { const s = JSON.parse(raw); if (saveFits(s)) SAVED = s; else { localStorage.removeItem(SAVE_KEY); SAVE_DROPPED = true; } }
} catch (e) { /* no storage, or a broken save: start without one */ }

function writeSave() {
  const R = S.run; if (!R) return false;
  const s = { v: SAVE_V, t: Date.now(), build: BUILD.version, region: WORLD.regions[R.ri].id,
    know: S.know, mode: S.mode, suggest: S.suggest, testMode: !!S.testMode,
    party: HEROES.map(x => x.id), heroes: S.heroes.map(st => ({ ...st, leveled: false })),
    run: JSON.parse(JSON.stringify({ ...R, prompt: null, walking: false, over: false })) };
  SAVED = s;   // kept for this visit even where the browser keeps nothing
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
}
function clearSave() { SAVED = null; try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* no storage */ } }
// the saved journey becomes the current one: settings it began with, the party, the road
function loadSave() {
  const s = SAVED; if (!s) return false;
  S.know = s.know; S.mode = s.mode; S.suggest = !!s.suggest; S.testMode = !!s.testMode;
  S.run = JSON.parse(JSON.stringify(s.run));
  if (!S.run.wellAt) S.run.wellAt = planWells();   // a save from 0.10.0: wells did not stand by chance yet
  migratePrayers(S.run);   // a save from before 24 Nov: one prayer, three shrines (src/shrines.js)
  // a save from before 0.17.0 (balance E): one event slot per region, a chest or a trap; regions already planned keep their stops
  if (!S.run.eventAt) { S.run.eventAt = planEvents(s.know); delete S.run.chestAt; }
  // a save from 0.13.0–0.16.0 (balance D): the party levelled together with one pool of points. Every hero keeps
  // the level they have, starting it afresh on the new curve, and the pool is shared out among them, one by one.
  if (S.run.pxp != null || S.run.pts != null) {
    let pool = S.run.pts || 0;
    s.heroes.forEach(st => { st.lvl = clamp(st.lvl || 1, 1, MAX_LV); st.xp = LV_XP[st.lvl - 1]; st.pts = st.pts || 0; });
    for (let i = 0; pool > 0 && i < 64; i++) { s.heroes[i % s.heroes.length].pts++; pool--; }
    delete S.run.pxp; delete S.run.plvl; delete S.run.pts;
  }
  HEROES.length = 0; s.party.forEach(id => HEROES.push(ROSTER[id]));
  S.heroes = s.heroes.map(st => ({ ...st, leveled: false })); S.lastHero = 0; S.meterBonus = 0;
  return true;
}
// A won battle is a checkpoint when it is the last battle of a checkpoint region for this Znanje.
function isCheckpoint(stop) {
  const R = S.run; if (!R || !stop || !['battle', 'elite', 'boss'].includes(stop.kind)) return false;
  if (!checkpointIds().includes(WORLD.regions[R.ri].id)) return false;
  return !R.stops.some(x => x !== stop && x.enemies && !x.passed);   // no battle of this region left ahead
}
function saveAtCheckpoint(stop) { return isCheckpoint(stop) && writeSave(); }
// the next checkpoint still ahead on this journey (for the exit dialog before the first save)
function nextCheckpoint() {
  const R = S.run, ids = checkpointIds(); if (!R) return null;
  const reg = WORLD.regions.slice(R.ri).find(r => ids.includes(r.id));
  return reg ? reg.name : null;
}
// what Izhod says: where the game last saved this journey
function saveLine() {
  if (SAVED && S.run && SAVED.run.starter === S.run.starter) return `Napredek je shranjen po zadnji zmagi – ${regionName(SAVED.region)}.`;
  const nx = nextCheckpoint();
  return 'Napredek še ni shranjen' + (nx ? ` – prvo shranjevanje: ${nx}.` : '.');
}

// ------------------------------------------------------------ Izhod: leave for the start screen
// On the road and in the pause window. In a battle, the battle starts again from its beginning
// when the journey continues (health, bag and gold go back to how they were when it began).
function exitBtn(cls = '') {
  return h('button', { class: 'btn exitbtn ' + cls, onclick: askExit, title: 'Izhod na glavni meni' },
    h('span', { 'aria-hidden': 'true' }, '⏏ '), 'Izhod');
}
function askExit() {
  if (S.exitEl) return;
  const wasPaused = G.paused;
  const close = () => { ov.remove(); S.exitEl = null; S.overlayKey = keep; };
  const leave = () => {
    close();
    if (B && S.screen === 'battle' && !B.over) {
      S.heroes = JSON.parse(B.snap);
      if (S.run && B.snapBag) { S.run.bag = JSON.parse(B.snapBag); S.run.gold = B.snapGold; }
      if (B.node.stop) B.node.stop.passed = false;
      B.over = true;
    }
    if (S.run) { S.run.prompt = null; S.run.walking = false; }
    if (G.paused) setPause(false);
    LATER.length = 0;
    go('title');
  };
  const keep = S.overlayKey;
  if (S.run && S.screen === 'travel' && S.run.walking) { S.run.walking = false; renderTravelPanel(); }
  let first;
  const ov = h('div', { class: 'overlay exitdlg', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Izhod' }, h('div', { class: 'dialog' },
    h('h2', {}, 'Izhod'),
    h('p', { class: 'saveline' }, saveLine()),
    h('div', { class: 'row' },
      h('button', { class: 'btn', ref: el => first = el, onclick: close }, wasPaused ? 'Nazaj na premor' : 'Ostani'),
      h('button', { class: 'btn primary', onclick: leave }, 'Izhod ', h('kbd', {}, 'Enter')))));
  document.body.append(ov); S.exitEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } else if (e.key === 'Enter') { e.preventDefault(); leave(); } };
  first.focus();
}
