// ============================================================ battle statistics for balancing (opt-in, 0.13.0)
// A player who agrees sends one row per journey battle and one when a journey ends, so the balance
// simulations (docs/progression-design.md §4b) can be checked against real play. Off until the player says
// yes: once on Nova pot (a small card, never a dialog in the way) and any time in Nastavitve.
// Rows go to the same Google Form as the word reports (src/report.js), with Opomba 'statistika':
//   Beseda  = zmaga / poraz (a battle) or pot-rešena / pot-končana (a journey)
//   Kje     = region · kind of battle
//   Podatki = key=value pairs (see statRow): Znanje, tempo, device, version, enemies, duration, words, seconds
//             per word on the letter mesh (crosswords and pauses left out), party level, heroes, health, fallen
// Nothing personal and none of the words typed are sent. A random id per journey (not per device or player)
// lets the rows of one journey be read together. This collection must be declared in the stores' privacy
// forms (docs/store-release.md).
const ST_OK = 'zg-stats-ok', ST_Q = 'zg-stats', ST_MAX = 300;
const STATS = loadList(ST_Q);   // [{ w, where, meta, t, sent }]
let STATS_OK = (() => { try { const v = localStorage.getItem(ST_OK); return v === '1' ? true : v === '0' ? false : null; } catch (e) { return null; } })();
const statsOn = () => STATS_OK === true;
function setStats(on) {
  STATS_OK = !!on;
  try { localStorage.setItem(ST_OK, on ? '1' : '0'); } catch (e) { /* no storage: the choice lasts this visit */ }
  if (!on) { STATS.length = 0; saveList(ST_Q, STATS); }   // saying no drops what was waiting
  else flushStats();
}
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const statDevice = () => window.Capacitor ? 'Android' : S.mobile ? 'telefon' : 'namizje';
const statHeroes = () => S.heroes.map((st, k) => `${HEROES[k].id}(${st.sk.join('')})`).join(' ');
const statBase = () => {
  const R = S.run;
  return [`pot=${R.sid}`, `znanje=${S.know}`, `tempo=${S.mode === 'real' ? 'realni' : 'mirni'}`, `naprava=${statDevice()}`,
    `v=${BUILD.version}${BUILD.commit ? '+' + BUILD.commit : ''}`, `raven=${R.plvl || 1}`, `tocke=${R.pts || 0}`, `junaki=${statHeroes()}`];
};
function queueStat(w, where, meta) {
  if (!statsOn()) return null;
  const r = { w, where, meta, t: Date.now(), sent: false };
  STATS.push(r); if (STATS.length > ST_MAX) STATS.splice(0, STATS.length - ST_MAX);
  saveList(ST_Q, STATS); flushStats();
  return r;
}
// one row per journey battle (practice battles from the menu are not counted)
function statBattle(win) {
  const R = S.run, node = B && B.node;
  if (!statsOn() || !R || !node || !(node.stop || node.challenge)) return null;
  if (!R.sid) R.sid = Math.random().toString(36).slice(2, 8);
  const was = JSON.parse(B.snap), hp0 = was.reduce((s, x) => s + (x.down ? 0 : x.hp), 0), max0 = was.reduce((s, x) => s + x.maxHp, 0);
  const hp1 = S.heroes.reduce((s, x) => s + (x.down ? 0 : x.hp), 0), max1 = S.heroes.reduce((s, x) => s + x.maxHp, 0);
  const st = B.stats, mesh = B.meshT || 0, kind = node.challenge ? 'bog' : node.stop.kind;
  const foes = B.enemies.map(e => e.key + (e.strong ? '*' : '')).join(' ');
  const meta = statBase().concat([`sovrazniki=${foes}`, `cas=${Math.round(B.time)}s`, `mreza=${Math.round(mesh)}s`, `besede=${st.words}`,
    `s/besedo=${st.words ? (mesh / st.words).toFixed(1) : '-'}`, `najdaljsa=${st.longest.length}`, `krizanke=${st.cw}`,
    `zdravje=${pct(hp0, max0)}→${pct(hp1, max1)}%`, `padli=${S.heroes.filter(x => x.down).length}/${S.heroes.length}`,
    `ostanek=${B.enemies.filter(e => e.hp > 0).map(e => pct(e.hp, e.maxHp) + '%').join(' ') || '-'}`, `umiki=${R.rescues || 0}`]);
  return queueStat(win ? 'zmaga' : 'poraz', `${WORLD.regions[R.ri].name} · ${kind}`, meta.join(' · '));
}
// one row when a journey ends: the dragon beaten, or the last loss
function statJourney(won) {
  const R = S.run;
  if (!statsOn() || !R || R.statDone) return null;
  R.statDone = true;
  if (!R.sid) R.sid = Math.random().toString(36).slice(2, 8);
  const meta = statBase().concat([`bitke=${R.battles}`, `besede=${R.words}`, `umiki=${R.rescues || 0}`, `trajanje=${R.t0 ? Math.round((Date.now() - R.t0) / 60000) + 'min' : '-'}`]);
  return queueStat(won ? 'pot-rešena' : 'pot-končana', WORLD.regions[R.ri].name, meta.join(' · '));
}
async function postStat(r) {
  if (!REPORT_FORM.id || !REPORT_FORM.entry.word) return false;
  const E = REPORT_FORM.entry, body = new URLSearchParams();
  body.set('entry.' + E.word, r.w);
  if (E.where) body.set('entry.' + E.where, r.where);
  if (E.note) body.set('entry.' + E.note, 'statistika');
  if (E.meta) body.set('entry.' + E.meta, r.meta);
  try { await fetch(`https://docs.google.com/forms/d/e/${REPORT_FORM.id}/formResponse`, { method: 'POST', mode: 'no-cors', body }); return true; }
  catch (e) { return false; }
}
let statFlushing = null;
function flushStats() {
  if (statFlushing || !statsOn()) return statFlushing;
  statFlushing = (async () => {
    let sent = 0;
    for (const r of STATS.filter(x => !x.sent)) { if (!(await postStat(r))) break; r.sent = true; sent++; }
    if (sent) { for (let i = STATS.length - 1; i >= 0; i--) if (STATS[i].sent) STATS.splice(i, 1); saveList(ST_Q, STATS); }   // sent rows are not kept
    return sent;
  })().finally(() => { statFlushing = null; });
  return statFlushing;
}
setTimeout(() => { if (statsOn() && STATS.some(r => !r.sent)) flushStats(); }, 3500);

const STAT_TEXT = 'Po vsakem boju na poti gre razvijalcu ena vrstica: izid, pokrajina, sovražniki, Znanje, tempo, naprava, različica igre, trajanje, število besed in čas na besedo, raven družine, junaki in njihove veščine, izgubljeno zdravje. Nič osebnega in nobene besede, ki jih vpišeš.';
// Nastavitve: the switch, what is sent, and how much is waiting
function statsSection() {
  const waiting = STATS.filter(r => !r.sent).length;
  return h('section', {}, h('h2', {}, 'Pomoč pri uravnoteženju'),
    h('label', { class: 'toggle' },
      h('input', { type: 'checkbox', class: 'set-stats', checked: statsOn(), onchange: e => { setStats(e.target.checked); } }),
      h('span', {}, 'Pošiljaj statistiko bojev', h('small', {}, STAT_TEXT))),
    statsOn() && waiting ? h('p', { class: 'muted' }, `Čaka na pošiljanje: ${waiting}.`) : null);
}
// Nova pot: asked once, until the player answers (either way the card goes and Nastavitve keeps the switch)
function statsAsk() {
  if (STATS_OK !== null) return null;
  let card;
  const answer = on => { setStats(on); sfx('sel', { vol: .5 }); card.replaceWith(h('p', { class: 'note stat-done', role: 'status' },
    on ? 'Hvala! Statistiko bojev lahko kadar koli izklopiš v Nastavitvah.' : 'V redu, nič se ne pošilja. Premisliš si lahko v Nastavitvah.')); };
  return card = h('section', { class: 'stat-ask', 'aria-labelledby': 'stat-ask-h' },
    h('h2', { id: 'stat-ask-h' }, 'Pomagaš uravnotežiti igro?'),
    h('p', {}, STAT_TEXT),
    h('div', { class: 'row' },
      h('button', { class: 'btn small primary', onclick: () => answer(true) }, 'Da, pošiljaj'),
      h('button', { class: 'btn small', onclick: () => answer(false) }, 'Ne, hvala')));
}
