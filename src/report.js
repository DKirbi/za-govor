
// ============================================================ words sent to the developer ("Pošlji besede")
// Two kinds of report go to one Google Form, one row per word, and nothing typed by hand:
//   manjka — a word the game turned down that the player thinks is real (the last 40 rejections are remembered)
//   pomen  — a word the player found for the first time that the game has no meaning for yet ("Kaj pomeni?")
// The player picks words from chips and sends them. The form's four fields are reused, so the form itself
// does not change: Beseda = the word, Kje = where it was played and the region (never shown in the game),
// Opomba = the kind (manjka / pomen), Podatki = level, pace, device and version. Nothing personal is sent.
// Until a report leaves the device it waits in a queue (offline, or no form set up).
// Meanings the developer has written ship with the game in data/meanings.json (filled in by hand over time).

// Filled in from the form's pre-filled link: .../forms/d/e/<id>/viewform?entry.<n>=...
// The four fields are Beseda, Kje, Opomba, Podatki. With no id, reports only queue.
const REPORT_FORM = { id: '1FAIpQLSdQMdF0tOxiSydO23w7HKLdaIzFxF_8vTGCxRxQzTFnNlSK4Q',
  entry: { word: '999563651', where: '450611827', note: '1964532332', meta: '777699005' } };

const RJ_KEY = 'zg-rejected', RP_KEY = 'zg-reports', FD_KEY = 'zg-found', SN_KEY = 'zg-seen', RJ_MAX = 40, FD_MAX = 40, SN_MAX = 4000, SESSION = Date.now();
const loadList = k => { try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const saveList = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* no storage: the lists live for this visit only */ } };
const REJECTED = loadList(RJ_KEY);   // [{ w, where, n, t, s }] newest first; s = session
const REPORTS = loadList(RP_KEY).map(r => ({ kind: 'manjka', ...r }));   // [{ w, where, region, kind, t, sent }]
const FOUND = loadList(FD_KEY);      // [{ w, where, region, t }] words found for the first time with no meaning yet, newest first
const SEEN = new Set(loadList(SN_KEY));   // base forms of every word this player has played
const cleanWord = s => [...String(s || '').trim()].map(normLetter).filter(Boolean).join('');
const WHERE = { mreza: 'mreža črk', skrinja: 'skrinja', plaz: 'plaz kamenja', puscice: 'konice', vpisana: 'vpisana' };
const MEANINGS = (() => { try { return JSON.parse($('#meaningsdata').textContent).words || {}; } catch (e) { return {}; } })();
const meaningOf = w => MEANINGS[w] || MEANINGS[LEMMA.get(w) || ''] || null;
const hereRegion = () => S.run ? WORLD.regions[S.run.ri].id : '';

// called wherever the game says a word is not in its dictionary
function noteRejected(raw, where) {
  const w = cleanWord(raw); if (w.length < 2 || WORDS.has(w)) return;
  const i = REJECTED.findIndex(r => r.w === w);
  const r = i >= 0 ? REJECTED.splice(i, 1)[0] : { w, n: 0 };
  r.n++; r.where = where; r.t = Date.now(); r.s = SESSION;
  REJECTED.unshift(r); REJECTED.length = Math.min(REJECTED.length, RJ_MAX);
  saveList(RJ_KEY, REJECTED);
}
// the first rejection of a visit says where to report it
let rejectHinted = false;
function rejectHint() {
  if (rejectHinted) return '';
  rejectHinted = true;
  return ' Je to prava beseda? Pošlji jo v premoru.';
}

// Called for every word a player plays. Returns true when the word is new to this player and the game has
// no meaning for it: then it can be asked about (Kaj pomeni?). Words are counted by their base form.
function noteFound(raw, where) {
  const w = cleanWord(raw); if (!WORDS.has(w)) return false;
  const lem = LEMMA.get(w) || w;
  if (SEEN.has(lem)) return false;
  SEEN.add(lem); saveList(SN_KEY, [...SEEN].slice(-SN_MAX));
  if (meaningOf(w) || isAsked(w)) return false;
  FOUND.unshift({ w, where, region: hereRegion(), t: Date.now() }); FOUND.length = Math.min(FOUND.length, FD_MAX);
  saveList(FD_KEY, FOUND);
  return true;
}

const isReported = w => REPORTS.some(r => r.w === w && r.kind === 'manjka');
const isAsked = w => REPORTS.some(r => r.kind === 'pomen' && (r.w === w || (LEMMA.get(r.w) || r.w) === (LEMMA.get(w) || w)));
const unsentCount = () => REPORTS.filter(r => !r.sent).length;
// kind 'manjka': a word the game does not know; kind 'pomen': a known word whose meaning is asked for
function reportWord(raw, where, kind = 'manjka', region = hereRegion()) {
  const w = cleanWord(raw);
  if (w.length < 2 || w.length > 20) return { ok: false, msg: 'To ni beseda iz slovenskih črk.' };
  if (kind === 'manjka' && WORDS.has(w)) return { ok: false, known: true, w, msg: `${UP(w)} je že v slovarju igre. Hvala vseeno!` };
  if (kind === 'pomen' && !WORDS.has(w)) return { ok: false, w, msg: `${UP(w)} ni v slovarju igre.` };
  if (kind === 'pomen' ? isAsked(w) : isReported(w)) return { ok: true, w, again: true };
  REPORTS.push({ w, where, region, kind, t: Date.now(), sent: false });
  if (kind === 'pomen') { const i = FOUND.findIndex(f => f.w === w); if (i >= 0) { FOUND.splice(i, 1); saveList(FD_KEY, FOUND); } }
  saveList(RP_KEY, REPORTS);
  return { ok: true, w };
}
function reportMeta(r) {
  const rej = REJECTED.find(x => x.w === r.w);
  return [LV().name, S.mode === 'real' ? 'realni čas' : 'mirni način', window.Capacitor ? 'Android' : S.mobile ? 'telefon' : 'namizje',
    r.kind === 'manjka' ? (rej ? `zavrnjena ${rej.n}×` : 'zavrnjena') : 'nova beseda', 'v' + BUILD.version + (BUILD.commit ? '+' + BUILD.commit : '')].join(' · ');
}
const reportWhere = r => [WHERE[r.where] || r.where || '', r.region ? (WORLD.regions.find(x => x.id === r.region) || {}).name || r.region : ''].filter(Boolean).join(' · ');
// Google Forms takes a plain form POST. no-cors gives no answer to read, so "sent" means the request
// left the device; a network or policy failure keeps the report queued for the next try. (A page that
// may not reach other sites, such as a sandboxed preview, keeps everything queued; the Android app and
// a page opened from its own file or site send.)
async function postReport(r) {
  if (!REPORT_FORM.id || !REPORT_FORM.entry.word) return false;
  const E = REPORT_FORM.entry, body = new URLSearchParams();
  body.set('entry.' + E.word, r.w);
  if (E.where) body.set('entry.' + E.where, reportWhere(r));
  if (E.note) body.set('entry.' + E.note, r.kind || 'manjka');
  if (E.meta) body.set('entry.' + E.meta, reportMeta(r));
  try { await fetch(`https://docs.google.com/forms/d/e/${REPORT_FORM.id}/formResponse`, { method: 'POST', mode: 'no-cors', body }); return true; }
  catch (e) { return false; }
}
let flushing = null;
function flushReports() {
  if (flushing) return flushing;
  flushing = (async () => {
    let sent = 0;
    for (const r of REPORTS.filter(x => !x.sent)) { if (!(await postReport(r))) break; r.sent = true; sent++; }
    if (sent) saveList(RP_KEY, REPORTS);
    return sent;
  })().finally(() => { flushing = null; });
  return flushing;
}
// reports left over from an earlier visit (offline, or sent before the form existed) go out on load
setTimeout(() => { if (REPORT_FORM.id && unsentCount()) flushReports(); }, 3000);

// ------------------------------------------------------------ Kaj pomeni?
// A chip for a word just found: its meaning when the game has one, otherwise "Kaj pomeni?", which asks
// the developer in one tap (and is never offered again for that word on this device).
function meaningChip(w, where) {
  const m = meaningOf(w);
  if (m) return h('span', { class: 'mchip has', title: m }, h('b', {}, UP(w)), ' — ', m);
  if (isAsked(w)) return h('span', { class: 'mchip asked', title: 'Vprašano: pomen dodamo v eni od naslednjih posodobitev' }, h('b', {}, UP(w)), ' ✓');
  const b = h('button', { class: 'mchip ask', title: `Kaj pomeni ${UP(w)}? Pošlji besedo razvijalcu.`, 'aria-label': `Kaj pomeni ${UP(w)}?`,
    onclick: e => { e.stopPropagation(); const res = reportWord(w, where, 'pomen'); if (!res.ok) return;
      sfx('ok', { vol: .5 }); b.replaceWith(meaningChip(w, where)); flushReports();
      toast('Hvala! Pomen dodamo v eni od naslednjih posodobitev.'); } },
    h('b', {}, UP(w)), h('span', { class: 'q' }, ' Kaj pomeni?'));
  return b;
}
// the words of a battle that are new and have no meaning yet, as chips (on the result screen)
function newWordsRow(words, where) {
  const list = [...new Set(words)].slice(0, 6);
  if (!list.length) return null;
  return h('div', { class: 'newwords' }, h('div', { class: 'nw-h' }, 'Nove besede'), h('div', { class: 'nw-chips' }, list.map(w => meaningChip(w, where))));
}

// ------------------------------------------------------------ the panel: pick words from chips and send them
// Used in the pause window and in its own window on O igri. Rejected words (manjka) and new words (pomen)
// are chips; a tap picks or drops a word, Pošlji izbrane sends them all.
function reportPanel(close, closeLabel) {
  const wrap = h('div', { class: 'report' });
  const pick = new Map();   // word → 'manjka' | 'pomen'
  let msg = '', kind = 'ok';
  const say = (text, k = 'ok') => { msg = text; kind = k; paint(); };
  const send = () => {
    if (!pick.size) return say('Najprej izberi besede.', 'warn');
    const done = [];
    for (const [w, k] of pick) {
      const src = k === 'manjka' ? REJECTED.find(r => r.w === w) : FOUND.find(f => f.w === w);
      const res = reportWord(w, src ? src.where : 'vpisana', k, src && src.region != null ? src.region : hereRegion());
      if (res.ok) done.push(w);
    }
    pick.clear();
    if (!done.length) return say('Ni česa poslati.', 'warn');
    sfx('ok', { vol: .6 });
    const names = done.map(UP).join(', ');
    say(`Hvala! ${names} ${done.length === 1 ? 'je prijavljena' : done.length === 2 ? 'sta prijavljeni' : 'so prijavljene'}.`);
    flushReports().then(() => {
      const left = done.filter(w => { const r = REPORTS.find(x => x.w === w); return r && !r.sent; });
      if (!left.length) say(`Hvala! ${names} ${done.length === 1 ? 'je poslana' : done.length === 2 ? 'sta poslani' : 'so poslane'} v pregled.`);
      else if (REPORT_FORM.id) say('Besede so shranjene v tej napravi in bodo poslane, ko bo povezava.', 'warn');
      else say('Besede so shranjene v tej napravi. Pošiljanje še ni nastavljeno, zato seznam lahko kopiraš.', 'warn');
    });
  };
  const chip = (w, k, extra) => {
    const on = pick.get(w) === k;
    return h('button', { class: 'prop' + (on ? ' on' : ''), 'aria-pressed': on ? 'true' : 'false', title: on ? `Ne pošlji besede ${UP(w)}` : `Izberi besedo ${UP(w)}`,
      onclick: () => { if (on) pick.delete(w); else pick.set(w, k); paint(); } }, on ? '✓ ' : '', UP(w), extra || null);
  };
  const paint = () => {
    wrap.innerHTML = '';
    const rejected = REJECTED.filter(r => !WORDS.has(r.w) && !isReported(r.w)).slice(0, 20);
    const found = FOUND.filter(f => !isAsked(f.w) && !meaningOf(f.w)).slice(0, 20);
    const unsent = REPORTS.filter(r => !r.sent);
    const list = REPORTS.map(r => [r.w, r.kind, reportWhere(r)].filter(Boolean).join('\t')).join('\n');
    wrap.append(...[   // DOM append would print empty slots as "null"
      h('h2', {}, 'Pošlji besede'),
      h('p', { class: 'muted' }, 'Izberi besede in jih pošlji. Manjkajoče besede preverimo in dodamo v slovar, novim besedam dopišemo pomen.'),
      h('div', { class: 'rejlist' },
        h('div', { class: 'rl-h' }, 'Zavrnjene besede', h('small', {}, ' — so prave, a jih igra ne pozna')),
        rejected.length ? h('div', { class: 'rjchips' }, rejected.map(r => chip(r.w, 'manjka', r.n > 1 ? h('small', {}, ` ${r.n}×`) : null)))
          : h('p', { class: 'muted rl-empty' }, 'Zavrnjenih besed še ni.')),
      h('div', { class: 'rejlist' },
        h('div', { class: 'rl-h' }, 'Nove besede', h('small', {}, ' — kaj pomenijo?')),
        found.length ? h('div', { class: 'rjchips' }, found.map(f => chip(f.w, 'pomen')))
          : h('p', { class: 'muted rl-empty' }, 'Ko najdeš besedo prvič, se pokaže tukaj.')),
      h('div', { class: 'row rp-send', style: { 'justify-content': 'flex-start' } },
        h('button', { class: 'btn primary', disabled: !pick.size, onclick: send }, `Pošlji izbrane${pick.size ? ` (${pick.size})` : ''}`)),
      msg ? h('p', { class: 'fb ' + kind, role: 'status' }, msg) : null,
      REPORTS.length ? h('p', { class: 'muted rp-count' }, `Poslanih besed: ${REPORTS.length}` + (unsent.length ? `, od tega še neposlanih ${unsent.length}` : '') + '.',
        unsent.length && !REPORT_FORM.id ? h('button', { class: 'btn small', onclick: e => {
          const b = e.currentTarget;
          try { navigator.clipboard.writeText(list).then(() => { b.textContent = 'Kopirano ✓'; }, () => { b.textContent = 'Kopiranje ni uspelo'; }); } catch (err) { b.textContent = 'Kopiranje ni uspelo'; }
        } }, 'Kopiraj seznam') : null) : null,
      h('div', { class: 'row', style: { 'justify-content': 'flex-start' } },
        h('button', { class: 'btn rp-close', onclick: close }, closeLabel, G.paused ? null : h('kbd', {}, 'Esc')))].filter(Boolean));
  };
  paint();
  return wrap;
}

// inside the pause window: the panel replaces the pause menu, Nazaj brings it back
function openReportInPause() {
  const dlg = G.pauseEl && G.pauseEl.querySelector('.dialog'); if (!dlg) return;
  const menu = [...dlg.childNodes];
  dlg.classList.add('reportdlg');
  dlg.replaceChildren(reportPanel(() => {
    dlg.classList.remove('reportdlg'); dlg.replaceChildren(...menu);
    const b = dlg.querySelector('.rp-open'); if (b) { b.replaceWith(reportButton()); dlg.querySelector('.rp-open').focus(); }
  }, 'Nazaj na premor'));
  const first = dlg.querySelector('.rejlist .prop, .rp-close'); if (first) first.focus({ preventScroll: true });
}
// on O igri: the same panel in its own window; closing it refreshes the count on the button
function openReportWindow() {
  if (S.bagEl) return;
  const close = () => {
    ov.remove(); S.bagEl = null; S.overlayKey = null;
    const b = SCR && SCR.querySelector('.rp-open');
    if (b) { const nb = reportButton(openReportWindow, 'Pošlji besede'); b.replaceWith(nb); nb.focus({ preventScroll: true }); }
  };
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Pošlji besede' },
    h('div', { class: 'dialog reportdlg' }, reportPanel(close, 'Zapri')));
  document.body.append(ov); S.bagEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  const first = ov.querySelector('.rejlist .prop, .rp-close'); if (first) first.focus({ preventScroll: true });
}
// the button that opens the panel, with the number of words waiting to be picked
function reportButton(onclick = openReportInPause, label = 'Pošlji besede') {
  const n = REJECTED.filter(r => !WORDS.has(r.w) && !isReported(r.w)).length + FOUND.filter(f => !isAsked(f.w) && !meaningOf(f.w)).length;
  return h('button', { class: 'btn rp-open', onclick }, label, n ? h('span', { class: 'pill' }, n) : null);
}
