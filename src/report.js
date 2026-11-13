
// ============================================================ report a missing word ("Prijavi besedo")
// Every word the game turns down is remembered on this device (the last 40). From the pause
// screen or the start screen the player taps one to report it, or types a word, with an
// optional note. Reports go to a Google Form whose answers land in a spreadsheet (and an
// e-mail per answer); until they are sent they wait in a queue on the device.

// Filled in from the form's pre-filled link: .../forms/d/e/<id>/viewform?entry.<n>=...
// The four fields are Beseda, Kje, Opomba, Podatki. With no id, reports only queue.
const REPORT_FORM = { id: '1FAIpQLSdQMdF0tOxiSydO23w7HKLdaIzFxF_8vTGCxRxQzTFnNlSK4Q',
  entry: { word: '999563651', where: '450611827', note: '1964532332', meta: '777699005' } };

const RJ_KEY = 'zg-rejected', RP_KEY = 'zg-reports', RJ_MAX = 40, SESSION = Date.now();
const loadList = k => { try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const saveList = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* no storage: the lists live for this visit only */ } };
const REJECTED = loadList(RJ_KEY);   // [{ w, where, n, t, s }] newest first; s = session
const REPORTS = loadList(RP_KEY);    // [{ w, where, note, t, sent }]
const cleanWord = s => [...String(s || '').trim()].map(normLetter).filter(Boolean).join('');
const WHERE = { mreza: 'mreža črk', skrinja: 'skrinja', plaz: 'plaz kamenja', puscice: 'puščice', vpisana: 'vpisana' };

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
  return ' Je to prava beseda? Prijavi jo v premoru.';
}

const isReported = w => REPORTS.some(r => r.w === w);
const unsentCount = () => REPORTS.filter(r => !r.sent).length;
function reportWord(raw, where, note = '') {
  const w = cleanWord(raw);
  if (w.length < 2 || w.length > 20) return { ok: false, msg: 'Vpiši eno besedo iz slovenskih črk.' };
  if (WORDS.has(w)) return { ok: false, known: true, w, msg: `${UP(w)} je že v slovarju igre. Hvala vseeno!` };
  note = String(note || '').trim().slice(0, 200);
  let r = REPORTS.find(x => x.w === w);
  if (r) { if (note && note !== r.note) { r.note = note; r.sent = false; } }
  else REPORTS.push(r = { w, where, note, t: Date.now(), sent: false });
  saveList(RP_KEY, REPORTS);
  return { ok: true, w };
}
function reportMeta(r) {
  const rej = REJECTED.find(x => x.w === r.w);
  return [LV().name, S.mode === 'real' ? 'realni čas' : 'mirni način', window.Capacitor ? 'Android' : S.mobile ? 'telefon' : 'namizje',
    rej ? `zavrnjena ${rej.n}×` : 'vpisana', 'v' + BUILD.version + (BUILD.commit ? '+' + BUILD.commit : '')].join(' · ');
}
// Google Forms takes a plain form POST. no-cors gives no answer to read, so "sent" means the request
// left the device; a network or policy failure keeps the report queued for the next try.
async function postReport(r) {
  if (!REPORT_FORM.id || !REPORT_FORM.entry.word) return false;
  const E = REPORT_FORM.entry, body = new URLSearchParams();
  body.set('entry.' + E.word, r.w);
  if (E.where) body.set('entry.' + E.where, WHERE[r.where] || r.where || '');
  if (E.note) body.set('entry.' + E.note, r.note || '');
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

// The panel, used in the pause screen and in its own window on the start screen.
function reportPanel(close, closeLabel) {
  const wrap = h('div', { class: 'report' });
  let msg = '', kind = 'ok', word, note;
  const say = (text, k = 'ok') => { msg = text; kind = k; paint(); };
  const send = (raw, where) => {
    const res = reportWord(raw, where, note ? note.value : '');
    if (!res.ok) return say(res.msg, res.known ? 'ok' : 'warn');
    sfx('ok', { vol: .6 });
    word.value = ''; note.value = '';   // the next report starts empty, with no leftover note
    say(`Hvala! ${UP(res.w)} je prijavljena.`);
    flushReports().then(() => {
      const r = REPORTS.find(x => x.w === res.w);
      if (r && r.sent) say(`Hvala! ${UP(res.w)} je poslana v pregled.`);
      else if (REPORT_FORM.id) say(`${UP(res.w)} je shranjena v tej napravi in bo poslana, ko bo povezava.`, 'warn');
      else say(`${UP(res.w)} je shranjena v tej napravi. Pošiljanje še ni nastavljeno, zato seznam lahko kopiraš.`, 'warn');
    });
  };
  const keys = e => {
    if (e.key === 'Enter') { e.preventDefault(); send(word.value, 'vpisana'); }
    else if (e.key === 'Escape' && !G.paused) { e.preventDefault(); close(); }
  };
  const paint = () => {
    const keepWord = word ? word.value : '', keepNote = note ? note.value : '';
    wrap.innerHTML = '';
    const recent = REJECTED.filter(r => !WORDS.has(r.w)).slice(0, 20), unsent = REPORTS.filter(r => !r.sent);
    const list = REPORTS.map(r => [r.w, WHERE[r.where] || r.where, r.note].filter(Boolean).join('\t')).join('\n');
    wrap.append(...[   // DOM append would print empty slots as "null"
      h('h2', {}, 'Prijavi manjkajočo besedo'),
      h('p', { class: 'muted' }, 'Je igra zavrnila pravo slovensko besedo? Prijavi jo, pregledali jo bomo in dodali v slovar.'),
      recent.length ? h('div', { class: 'rejlist' },
        h('div', { class: 'rl-h' }, 'Nedavno zavrnjene besede'),
        h('div', { class: 'rjchips' }, recent.map(r => isReported(r.w)
          ? h('span', { class: 'prop done', title: 'Že prijavljena' }, UP(r.w), ' ✓')
          : h('button', { class: 'prop', title: `Prijavi besedo ${UP(r.w)}`, 'aria-label': `Prijavi besedo ${UP(r.w)}`, onclick: () => send(r.w, r.where) },
              UP(r.w), r.n > 1 ? h('small', {}, ` ${r.n}×`) : null, r.s === SESSION ? null : h('small', { class: 'old' }, ' prej'), ' +'))),
        h('div', { class: 'rl-tip muted' }, 'Tapni besedo, da jo prijaviš. Opombo lahko vpišeš spodaj, preden tapneš.'))
      : h('p', { class: 'muted' }, 'Zavrnjenih besed še ni. Besedo lahko vpišeš tudi sam.'),
      h('div', { class: 'reportrow' },
        word = h('input', { type: 'text', class: 'rp-word', placeholder: 'beseda', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false',
          enterkeyhint: 'send', 'aria-label': 'Beseda za prijavo', onkeydown: keys }),
        note = h('input', { type: 'text', class: 'rp-note', placeholder: 'opomba (neobvezno)', autocomplete: 'off', maxlength: 200,
          enterkeyhint: 'send', 'aria-label': 'Opomba k prijavi', onkeydown: keys }),
        h('button', { class: 'btn primary', onclick: () => send(word.value, 'vpisana') }, 'Prijavi')),
      msg ? h('p', { class: 'fb ' + kind, role: 'status' }, msg) : null,
      REPORTS.length ? h('p', { class: 'muted rp-count' }, `Prijavljenih besed: ${REPORTS.length}` + (unsent.length ? `, od tega še neposlanih ${unsent.length}` : '') + '.',
        unsent.length && !REPORT_FORM.id ? h('button', { class: 'btn small', onclick: e => {
          const b = e.currentTarget;
          try { navigator.clipboard.writeText(list).then(() => { b.textContent = 'Kopirano ✓'; }, () => { b.textContent = 'Kopiranje ni uspelo'; }); } catch (err) { b.textContent = 'Kopiranje ni uspelo'; }
        } }, 'Kopiraj seznam') : null) : null,
      h('div', { class: 'row', style: { 'justify-content': 'flex-start' } },
        h('button', { class: 'btn', onclick: close }, closeLabel, G.paused ? null : h('kbd', {}, 'Esc')))].filter(Boolean));
    word.value = keepWord; note.value = keepNote;
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
  const first = dlg.querySelector('.rejlist .prop, .rp-word'); if (first) first.focus({ preventScroll: true });
}
// on O igri: the same panel in its own window; closing it refreshes the count on the button
function openReportWindow() {
  if (S.bagEl) return;
  const close = () => {
    ov.remove(); S.bagEl = null; S.overlayKey = null;
    const b = SCR && SCR.querySelector('.rp-open');
    if (b) { const nb = reportButton(openReportWindow, 'Prijavi manjkajočo besedo'); b.replaceWith(nb); nb.focus({ preventScroll: true }); }
  };
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Prijavi manjkajočo besedo' },
    h('div', { class: 'dialog reportdlg' }, reportPanel(close, 'Zapri')));
  document.body.append(ov); S.bagEl = ov;
  S.overlayKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  const first = ov.querySelector('.rejlist .prop, .rp-word'); if (first) first.focus({ preventScroll: true });
}
// the button that opens the panel, with the number of rejected words not reported yet
function reportButton(onclick = openReportInPause, label = 'Prijavi besedo') {
  const n = REJECTED.filter(r => !WORDS.has(r.w) && !isReported(r.w)).length;
  return h('button', { class: 'btn rp-open', onclick }, label, n ? h('span', { class: 'pill' }, n) : null);
}
