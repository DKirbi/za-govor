// ============================================================ title scene: "Za govor!" over a dusk landscape
// The art is in src/art-title.js (tools/art_title.py): a 480 x 160 scene in layers, the wordmark and its ribbon.
// titleStage() returns the whole header; it is self-contained so any start-screen layout can put it on top.
// - Pixels stay square: the scene is drawn at a whole-number scale (--s) picked from the width it has to fill.
// - It spans the full window (in phone mode, the full phone column) and fades into the dark page at the bottom,
//   so the menu underneath keeps its contrast.
// - The wordmark and ribbon stand still. The scene moves slowly: the fire, embers carried up towards the
//   wordmark, barely drifting clouds, breathing stars and water. All CSS (transform, opacity, background-position);
//   whatever travels moves one whole art pixel per step.
//   Delays come from one clock (--t), so rebuilding the start screen does not restart the sparks mid-flight.
// - prefers-reduced-motion shows the still picture.
const TS_PARTS = (() => {
  let a = 20261112;  // fixed seed: the same sparks on every render
  const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const M = TITLE_META, lw = M.logo[0], lx = (M.w - lw) / 2, ly = M.logoY + M.logo[1];
  const out = [];
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;  // -1..1, most near 0
  // embers from the kres, which sits in the middle right under the wordmark
  for (let i = 0; i < 9; i++) out.push({ k: 'ember', x: M.kres[0] - 3 + Math.round(rnd() * 6), y: M.kres[1] - 10,
    rise: 14 + Math.round(rnd() * 16), d: 2.6 + rnd() * 1.8, off: rnd() * 5, c: pick(['#ffe58a', '#f6a13a', '#e0502a']), sw: rnd() < .5 ? 'l' : 'r' });
  // the same sparks carried higher: they leave the fire's column, rise past Triglav and fade behind the wordmark
  for (let i = 0; i < 12; i++) out.push({ k: 'rise', x: Math.round(M.kres[0] + gauss() * 34), y: Math.round(98 - rnd() * 22),
    rise: 34 + Math.round(rnd() * 16), d: 6 + rnd() * 4, off: rnd() * 10, c: pick(['#ffe58a', '#ffd45e', '#f8a032', '#fff4c8']), sw: rnd() < .5 ? 'l' : 'r' });
  // a few motes around the letters themselves
  for (let i = 0; i < 8; i++) out.push({ k: 'spark', x: Math.round(lx + 6 + rnd() * (lw - 12)), y: Math.round(ly - 2 - rnd() * 8),
    rise: 10 + Math.round(rnd() * 10), d: 5 + rnd() * 3, off: rnd() * 8, c: pick(['#fff4c8', '#ffd45e', '#ffffff']), sw: rnd() < .5 ? 'l' : 'r' });
  // fireflies over the meadow
  for (let i = 0; i < 9; i++) out.push({ k: 'fly', x: 16 + Math.round(rnd() * (M.w - 32)), y: 118 + Math.round(rnd() * 18),
    d: 9 + rnd() * 6, off: rnd() * 15, c: pick(['#e4f58a', '#f6f2a6', '#c8f07a']), path: Math.floor(rnd() * 3) });
  // linden leaves drifting down from the crown on the left
  for (let i = 0; i < 3; i++) out.push({ k: 'leaf', x: 30 + Math.round(rnd() * 100), y: 30 + Math.round(rnd() * 30),
    d: 14 + rnd() * 6, off: rnd() * 20, c: pick(['#6f7c46', '#b8a85a', '#4f7048']) });
  return out;
})();

// opts.maxVh: the most of the screen height the scene may take (default .72; the main menu asks for less)
function titleStage(opts = {}) {
  const M = TITLE_META, A = TITLE_ART;
  const t = (performance.now() / 1000).toFixed(2);
  const lay = (cls, img) => h('div', { class: 'ts-l ' + cls, style: { 'background-image': `url(${img})` } });
  const parts = TS_PARTS.map(p => h('span', { class: `ts-p ts-${p.k}${p.big ? ' big' : ''}${p.sw ? ' sw-' + p.sw : ''}${p.path != null ? ' fp' + p.path : ''}`,
    style: { '--x': p.x, '--y': p.y, '--rise': p.rise || 0, '--d': p.d.toFixed(2) + 's', '--off': p.off.toFixed(2), background: p.c } }));
  const art = h('div', { class: 'ts-art', 'aria-hidden': 'true' },
    lay('ts-sky', A.sky), lay('ts-tw a', A.twA), lay('ts-tw b', A.twB), lay('ts-clouds', A.clouds), lay('ts-far', A.far),
    lay('ts-mist', A.mist), lay('ts-mid', A.mid), lay('ts-shimmer', A.shimmer), lay('ts-shimmer b', A.shimmer), lay('ts-near', A.near),
    h('div', { class: 'ts-glow', style: { '--x': M.kres[0], '--y': M.kres[1] } }),
    h('div', { class: 'ts-flame', style: { '--x': M.kres[0] - 6, '--y': M.kres[1] - 13, 'background-image': `url(${A.flame})` } }),
    ...parts.filter((p, i) => TS_PARTS[i].k !== 'spark'));
  const mark = h('div', { class: 'ts-mark', 'aria-hidden': 'true', style: { '--lw': M.logo[0], '--lh': M.logo[1], '--rw': M.ribbon[0], '--rh': M.ribbon[1], '--ly': M.logoY, '--ry': M.ribbonY } },
    h('span', { class: 'ts-aura' }),
    h('img', { class: 'ts-logo', src: A.logo, alt: '', draggable: 'false' }),
    h('img', { class: 'ts-ribbon', src: A.ribbon, alt: '', draggable: 'false' }),
    ...parts.filter((p, i) => TS_PARTS[i].k === 'spark'));
  const st = h('header', { class: 'title-stage', 'data-maxvh': opts.maxVh || .72, style: { '--t': t, '--s': titleScale(window.innerWidth), height: M.h * titleScale(window.innerWidth) + 'px' } },
    h('div', { class: 'ts-frame' }, art, mark),
    h('div', { class: 'ts-fade' }),
    h('h1', { class: 'sr-only' }, 'Za govor!'),
    h('p', { class: 'sr-only' }, 'Besedna igra s slovansko mitologijo'));
  queueMicrotask(layoutTitleStage);
  return st;
}
const titleScale = width => Math.max(2, Math.ceil(width / TITLE_META.w));
// Full width of the window (or of the phone column), whole-number scale, never taller than maxVh of the screen
// (the bottom of the scene is cropped first: it is the part that fades out anyway).
function layoutTitleStage() {
  const st = document.querySelector('.title-stage'); if (!st || !st.parentElement) return;
  const par = st.parentElement.getBoundingClientRect();
  let left = 0, width = document.documentElement.clientWidth;
  if (S.mobile) { const a = app.getBoundingClientRect(); left = a.left; width = a.width; }
  st.style.width = width + 'px';
  st.style.marginLeft = (left - par.left) + 'px';
  const s = titleScale(width), full = TITLE_META.h * s;
  st.style.setProperty('--s', s);
  // centre the scene on a whole screen pixel, or every art pixel would be smeared across two
  const fr = st.querySelector('.ts-frame');
  fr.style.setProperty('--fx', Math.round((width - TITLE_META.w * s) / 2) + 'px'); fr.classList.add('placed');
  // under a phone's status bar (edge-to-edge Android app) the sky simply continues, and the art starts below it
  const sat = safeTop();
  st.style.setProperty('--sat-px', sat + 'px');
  st.style.height = (sat + Math.min(full, Math.max(TITLE_META.h * 2 - 40, Math.round(window.innerHeight * (+st.dataset.maxvh || .72))))) + 'px';
  // the scene starts at the very top of the page, whatever margins the start screen has
  st.style.marginTop = '0px';
  st.style.marginTop = -Math.round(st.getBoundingClientRect().top + window.scrollY) + 'px';
}
// height of the system status bar over the page (0 in a browser): measured, because --sat is a var() chain
function safeTop() {
  const p = h('div', { style: { position: 'absolute', visibility: 'hidden', height: 'var(--sat)' } });
  document.body.append(p); const v = p.offsetHeight; p.remove(); return v;
}
window.addEventListener('resize', () => requestAnimationFrame(layoutTitleStage));
