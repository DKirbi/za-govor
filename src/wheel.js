
// ============================================================ Kolo črk: the zagovor's crossword on a letter wheel
// Game Director, 27 Nov 2026: the zagovor gets a crossword "with the new circular Wordscapes style. Less words
// available make the puzzles harder." As decided on 24 Nov (docs/progression-design.md §11.4): the grid only shows
// progress; words are made by dragging over the letters of a wheel; there are no clues. Help is letters already
// shown in the grid (by Znanje) and Razkrij črko. The theme lives in its key word (PERUN, KRESNIK, MOKOŠ …), which the
// wheel always spells; the other words are everyday words (LEX.suggestedWords) from the same letters.
// Difficulty is how many words the letters allow: of several wheels, Malček gets the richest, Učenjak a middle one and
// Knjižni molj the poorest that still fills the grid (about 25, 18 and 9 words). Fewer words on the wheel, fewer lucky
// finds; Malček's words are also shorter and some of their letters are shown.
// PROPOSED defaults (24 Nov, not answered yet): the wheel on a phone, the typed crossword on a computer; Nastavitve
// switches either way on any device (zg-kolo). A real word from the wheel that is not in the grid is an extra word:
// a weak hit (once per word). A boss's health-bar events use the wheel too (src/bosses.js); Zaseda stays typed.
const WHEEL_LV = {
  malcek: { letters: 7, count: 5, minLen: 3, maxLen: 6, pick: 'rich', given: 0.3 },
  ucenjak: { letters: 7, count: 6, minLen: 3, maxLen: 7, pick: 'mid', given: 0.12 },
  molj: { letters: 7, count: 6, minLen: 4, maxLen: 7, pick: 'poor', given: 0 },
};
const WL = () => WHEEL_LV[S.know] || WHEEL_LV.malcek;
let WHEEL_PREF = (() => { try { return localStorage.getItem('zg-kolo'); } catch (e) { return null; } })();   // 'kolo', 'klasika' or unset
const wheelOn = () => WHEEL_PREF ? WHEEL_PREF === 'kolo' : !!S.mobile;
function setWheelPref(v) { WHEEL_PREF = v; try { localStorage.setItem('zg-kolo', v); } catch (e) { /* no storage */ } }
const isWheel = () => !!(B && B.cw && B.cw.D.style === 'wheel');

// a word fits the wheel when it needs no letter more often than the wheel has it (Č, Š and Ž are letters of their own)
const letterCounts = w => { const m = new Map(); for (const ch of w) m.set(ch, (m.get(ch) || 0) + 1); return m; };
function fitsWheel(w, have) {
  const m = new Map();
  for (const ch of w) { const n = (m.get(ch) || 0) + 1; if (n > (have.get(ch) || 0)) return false; m.set(ch, n); }
  return true;
}
// grid words are base forms (VESEL, SVILA, GLIVA): without clues an inflected form (ŠOKOM, TRAVI) is guesswork; any real
// word from the wheel still counts as an extra word
const WHEEL_BASE = new Map();
const wheelBase = (min, max) => { const k = min + '-' + max; if (!WHEEL_BASE.has(k)) WHEEL_BASE.set(k, LEX.suggestedWords(min, max).filter(w => LEMMA.get(w) === w)); return WHEEL_BASE.get(k); };
const wheelWords = (letters, L) => { const have = letterCounts(letters); return wheelBase(L.minLen, Math.min(L.maxLen, letters.length)).filter(w => fitsWheel(w, have)); };
// the key word's letters, then common letters (the mesh's bag) up to the wheel's size, about half of them vowels
function wheelLetters(key, n) {
  const out = key ? [...key] : [];
  for (let guard = 0; out.length < n && guard < 400; guard++) {
    const ch = BAG[rnd(BAG.length)], v = out.filter(isVowel).length;
    if (isVowel(ch) ? v >= Math.ceil(n / 2) : out.length - v >= n - 2) continue;
    if (out.filter(x => x === ch).length >= 2) continue;   // no letter three times
    out.push(ch);
  }
  return out;
}
function makeWheel(id, L = WL(), opt = {}) {   // opt.keys: the key words to try (a boss's event), opt.title
  const th = opt.keys ? { title: opt.title || 'Kolo črk', keys: opt.keys.map(k => [k]) } : CLUES.themes[id] || { title: 'Zagovor', keys: [] };
  const keys = shuffle(th.keys.map(k => k[0].toLowerCase()).filter(k => [...k].length <= L.letters));
  for (const key of [...keys, null]) {
    const cands = [];
    for (let t = 0; t < 36; t++) {
      const letters = wheelLetters(key, L.letters), words = wheelWords(letters, L).filter(w => w !== key);
      if (words.length >= L.count + 2) cands.push({ letters, words });
    }
    if (!cands.length) continue;
    cands.sort((a, b) => a.words.length - b.words.length);
    const mid = cands.length >> 1;
    const order = L.pick === 'poor' ? cands : L.pick === 'rich' ? [...cands].reverse() : [...cands.slice(mid), ...cands.slice(0, mid).reverse()];
    for (const c of order.slice(0, 8)) {
      const D = genCross(c.words.map(w => ({ a: UP(w), c: '' })), { main: key ? [UP(key), ''] : null, count: L.count, maxR: 8, maxC: 8 });
      if (D.entries.length < L.count) continue;
      return Object.assign(D, { style: 'wheel', title: th.title, letters: shuffle(c.letters), key, words: c.words.length,
        avail: new Set(c.words.concat(key ? [key] : [])) });
    }
  }
  return null;
}
// letters already shown in the grid (Malček and Učenjak): every word keeps at least two of its letters to find
function wheelSetup(C) {
  C.given = new Set(); C.extra = new Set(); C.sel = []; C.drag = false; C.moved = false;
  const share = WL().given, total = C.cells.size;
  for (const key of shuffle([...C.cells.keys()])) {
    if (C.given.size >= Math.round(total * share)) break;
    const ok = C.cells.get(key).ents.every(k => { const e = C.D.entries[k];
      return [...e.answer].filter((_, p) => { const q = cellKey(e, p); return q !== key && !C.given.has(q); }).length >= 2; });
    if (ok) { C.given.add(key); C.fill.set(key, C.cells.get(key).ch); }
  }
}

function renderWheel() {
  const C = B.cw, D = C.D, n = D.letters.length;
  // one short row (Game Director, 27 Nov 2026: save vertical space, no rules repeated): the rules are behind ?, which
  // opens Kako se igra over the puzzle and stops the clock; a gold dot marks it until it has been opened once
  const seen = TUT_SEEN.has('kolo'), boss = C.kind === 'boss';
  UI.puzzle.append(h('div', { class: 'whead' }, h('span', { class: 'k ' + (boss ? 'boss' : 'finisher') }, boss ? 'Preizkušnja' : 'Zagovor'), h('b', {}, D.title), h('span', { class: 'grow' }),
    h('button', { class: 'wq' + (seen ? '' : ' new'), type: 'button', 'aria-label': 'Kako se igra kolo črk', title: 'Kako se igra', onclick: () => { showTut('kolo', true); wheelPaint(); } }, '?'),
    boss ? null : h('button', { class: 'wx', type: 'button', 'aria-label': 'Prekliči zagovor (moč ostane)', title: 'Prekliči zagovor — moč ostane', onclick: () => { closeCrossword(); fb('Zagovor prekinjen — moč ostane shranjena.', 'warn'); } }, '✕')));
  // a boss's event (src/bosses.js): its health bars, the time, the next blow and the party's health over the wheel
  UI.bossStrip = boss ? h('div', { class: 'bossstrip', 'aria-live': 'off' }) : null;
  if (boss) UI.puzzle.append(UI.bossStrip);
  C.cellEls = new Map();
  const grid = h('div', { class: 'cwgrid wgrid', style: { 'grid-template-columns': `repeat(${D.cols}, var(--cell))` } });
  for (let r = 0; r < D.rows; r++) for (let c = 0; c < D.cols; c++) {
    const key = r + ',' + c;
    if (!C.cells.has(key)) { grid.append(h('div', { class: 'cell void' })); continue; }
    const el = h('div', { class: 'cell' }, h('b', {})); C.cellEls.set(key, el); grid.append(el);
  }
  // the letters on a circle: their centres in % of the wheel, where the line between them is drawn too
  C.pos = D.letters.map((_, i) => { const a = 2 * Math.PI * i / n - Math.PI / 2; return [50 + 36 * Math.cos(a), 50 + 36 * Math.sin(a)]; });
  C.wlEls = D.letters.map((ch, i) => h('span', { class: 'wl', style: { left: C.pos[i][0] + '%', top: C.pos[i][1] + '%' } }, UP(ch)));
  C.line = svgEl('polyline', { fill: 'none', stroke: 'var(--gold)', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .75 });
  const svg = svgEl('svg', { class: 'wlines', viewBox: '0 0 100 100', preserveAspectRatio: 'none' }); svg.append(C.line);
  C.wheel = h('div', { class: 'wheel', role: 'group', 'aria-label': 'Kolo črk' }, svg, ...C.wlEls,
    h('button', { class: 'wshuffle', title: 'Premešaj črke (presledek)', 'aria-label': 'Premešaj črke', onpointerdown: e => e.stopPropagation(), onclick: wheelShuffle }, '⟳'));
  wheelPointer(C);
  C.wordEl = h('div', { class: 'wword', 'aria-live': 'polite' });
  C.revBtn = C.reveals > 0 ? h('button', { class: 'btn small wrev', title: 'Razkrij črko: pokaže eno črko v križanki; beseda z njo udari s pol moči', onclick: wheelReveal }, '') : null;
  C.extraEl = h('span', { class: 'wextra muted' });
  // the word being made sits between Razkrij črko and the count, in one row over the wheel
  UI.puzzle.append(h('div', { class: 'wbody' }, h('div', { class: 'wgridwrap' }, grid), h('div', { class: 'wrow' }, C.revBtn || h('span'), C.wordEl, C.extraEl), C.wheel));
  if (B.paused) UI.puzzle.append(h('div', { class: 'pausebanner' }, h('div', {}, 'Premor — ', h('button', { class: 'btn', onclick: togglePause }, 'Nadaljuj'))));
  wheelPaint();
}
function wheelPaint() {
  const C = B && B.cw; if (!C || !C.cellEls || C.D.style !== 'wheel') return;
  const mainKeys = new Set(); C.D.entries.forEach(e => { if (e.main) [...e.answer].forEach((_, p) => mainKeys.add(cellKey(e, p))); });
  for (const [key, el] of C.cellEls) {
    const ok = C.locked.has(key), shown = C.fill.get(key) || '';
    el.className = 'cell' + (ok ? ' ok' : C.revealed.has(key) ? ' rev' : C.given.has(key) ? ' given' : '') + (C.flash.has(key) ? ' flash' : '') + (mainKeys.has(key) ? ' main' : '');
    el.querySelector('b').textContent = shown;
  }
  C.wlEls.forEach((el, i) => { el.textContent = UP(C.D.letters[i]); el.classList.toggle('on', C.sel.includes(i)); });
  const pts = C.sel.map(i => C.pos[i]); if (C.drag && C.pt && pts.length) pts.push(C.pt);
  C.line.setAttribute('points', pts.map(p => p.join(',')).join(' '));
  if (!C.wordEl.classList.contains('said')) C.wordEl.textContent = UP(C.sel.map(i => C.D.letters[i]).join(''));
  if (C.revBtn) { C.revBtn.textContent = `Razkrij · ${C.reveals}`; C.revBtn.disabled = C.reveals <= 0; }
  if (C.kind === 'boss') bossStrip();
  C.extraEl.textContent = `še ${C.D.entries.length - C.solved.size}` + (C.extra.size ? ` · +${C.extra.size}` : '');
  C.extraEl.title = `Besed v križanki še: ${C.D.entries.length - C.solved.size}` + (C.extra.size ? `; dodatnih besed: ${C.extra.size}` : '');
  const q = UI.puzzle.querySelector('.wq'); if (q) q.classList.toggle('new', !TUT_SEEN.has('kolo'));
}
// drag over the letters (the line follows the finger) and let go to send; or tap them one by one and tap the last
// one again to send. Going back to the letter before the last takes the last one off.
function wheelPointer(C) {
  const W = C.wheel;
  const at = e => { const r = W.getBoundingClientRect(); return [100 * (e.clientX - r.left) / r.width, 100 * (e.clientY - r.top) / r.height]; };
  const hit = p => C.pos.findIndex(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 11);
  W.addEventListener('pointerdown', e => {
    if (B.cw !== C || B.paused) return;
    const p = at(e), i = hit(p); if (i < 0) return;
    e.preventDefault(); try { W.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
    if (C.sel.length && !C.drag) {   // tapping: the last letter again sends, an earlier one goes back to it
      if (i === C.sel[C.sel.length - 1]) { wheelSubmit(); return; }
      const j = C.sel.indexOf(i);
      if (j >= 0) C.sel = C.sel.slice(0, j + 1); else C.sel.push(i);
    } else C.sel = [i];
    C.drag = true; C.moved = false; C.pt = p; sfx('sel', { rate: 1.2, vol: .4 }); wheelPaint();
  });
  W.addEventListener('pointermove', e => {
    if (!C.drag || B.cw !== C) return;
    C.pt = at(e); const i = hit(C.pt);
    if (i >= 0 && i !== C.sel[C.sel.length - 1]) {
      if (i === C.sel[C.sel.length - 2]) C.sel.pop();
      else if (!C.sel.includes(i)) { C.sel.push(i); C.moved = true; sfx('sel', { rate: 1.2 + C.sel.length * .08, vol: .4 }); }
    }
    wheelPaint();
  });
  const up = () => { if (!C.drag || B.cw !== C) return; C.drag = false; C.pt = null; if (C.moved) wheelSubmit(); else wheelPaint(); };
  W.addEventListener('pointerup', up); W.addEventListener('pointercancel', up);
}
function wheelSay(text, kind) {
  const C = B.cw; if (!C || !C.wordEl) return;
  C.wordEl.textContent = text; C.wordEl.className = 'wword said ' + kind;
  clearTimeout(C.sayT); C.sayT = setTimeout(() => { if (C.wordEl) { C.wordEl.className = 'wword'; wheelPaint(); } }, 1300);
}
function wheelSubmit() {
  const C = B && B.cw; if (!C || C.D.style !== 'wheel') return;
  const w = C.sel.map(i => C.D.letters[i]).join(''); C.sel = []; C.drag = false; C.pt = null;
  if ([...w].length < 2) { wheelPaint(); return; }
  bossEventSent();   // Mirni način: a boss strikes after every third word sent in its event (src/bosses.js)
  if (B.cw !== C) return;
  const k = C.D.entries.findIndex((e, k) => !C.solved.has(k) && e.answer.toLowerCase() === w);
  if (k >= 0) { wheelSolve(k); return; }
  if (C.D.entries.some((e, k) => C.solved.has(k) && e.answer.toLowerCase() === w)) { wheelSay(`${UP(w)} — že najdena`, 'warn'); sfx('bad'); wheelPaint(); return; }
  if ([...w].length >= MINW() && (C.D.avail.has(w) || WORDS.has(w))) {
    if (C.extra.has(w)) { wheelSay(`${UP(w)} — že najdena`, 'warn'); wheelPaint(); return; }
    C.extra.add(w);
    const t = cwTarget(), d = t ? damageEnemy(t, [...w].length * lvlMult(), { event: C.kind === 'boss' }) : 0;   // a weak hit, about a three-letter mesh word
    wheelSay(`${UP(w)} — dodatna beseda` + (d ? `, −${d}` : ''), 'ok'); sfx('sel', { rate: 1.6 });
    renderEnemies(); if (B.cw === C) wheelPaint(); checkEnd(); return;
  }
  wheelSay(`${UP(w)} ni v križanki`, 'bad'); sfx('bad'); wheelPaint();
}
function wheelSolve(k) {
  const C = B.cw, e = C.D.entries[k], keys = [...e.answer].map((_, p) => cellKey(e, p));
  const hidden = keys.filter(key => !C.locked.has(key) && !C.given.has(key) && !C.revealed.has(key)).length;
  const aided = keys.some(key => C.revealed.has(key) && !C.locked.has(key));
  C.solved.add(k);
  keys.forEach((key, p) => { C.locked.add(key); C.fill.set(key, e.answer[p].toLowerCase()); C.flash.add(key); });
  setTimeout(() => { keys.forEach(key => C.flash.delete(key)); if (B && B.cw === C) wheelPaint(); }, 700);
  sfx('sel', { rate: 1.5 });
  cwEntrySolved(e, hidden, aided);
  if (B.cw !== C) return;   // that hit ended the battle
  if (C.solved.size === C.D.entries.length) { cwComplete(); return; }
  wheelSay(`${UP(e.answer)} — napad!`, 'ok'); wheelPaint();
}
function wheelReveal() {
  const C = B && B.cw; if (!C || C.D.style !== 'wheel' || C.reveals <= 0) return;
  const open = [...C.cells.keys()].filter(k => !C.locked.has(k) && !C.given.has(k) && !C.revealed.has(k));
  if (!open.length) return;
  const k = pick(open); C.fill.set(k, C.cells.get(k).ch); C.revealed.add(k); C.reveals--;
  sfx('sel', { rate: .8, vol: .5 }); wheelPaint();
}
function wheelShuffle() {
  const C = B && B.cw; if (!C || C.D.style !== 'wheel') return;
  const before = C.D.letters.join('');
  for (let t = 0; t < 6 && C.D.letters.join('') === before; t++) C.D.letters = shuffle(C.D.letters);
  C.sel = []; sfx('sel', { rate: .9, vol: .5 }); wheelPaint();
}
// a computer's keys: a letter takes the first free one of it on the wheel, Backspace the last, Enter sends,
// the space bar shuffles and ? shows a letter
function wheelKey(e) {
  const C = B.cw, k = e.key;
  if (k === 'Enter') { e.preventDefault(); wheelSubmit(); return; }
  if (k === 'Backspace') { e.preventDefault(); C.sel.pop(); wheelPaint(); return; }
  if (k === ' ') { e.preventDefault(); wheelShuffle(); return; }
  if (k === '?') { e.preventDefault(); wheelReveal(); return; }
  const ch = letterKey(e); if (!ch) return;
  e.preventDefault();
  const i = C.D.letters.findIndex((x, j) => letterEq(x, ch) && !C.sel.includes(j));
  if (i >= 0) { C.sel.push(i); C.drag = false; sfx('sel', { rate: 1.2, vol: .4 }); wheelPaint(); } else wheelSay(`${UP(ch)} ni na kolesu`, 'bad');
}
