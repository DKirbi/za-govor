// ============================================================ effect icons: attack and defence, stronger or weaker
// Game Director, 20 Nov 2026: a "−3" alone means nothing in Slovene, so changes to attack and defence get a picture.
// Crossed swords = attack, a shield = defence; green with an arrow up = stronger, red with an arrow down = weaker.
// The icons are 15-pixel-high pixel art drawn here (SVG rects with crisp edges), used
//   - in skill texts and battle cards, as tokens in the text: {atk+} {atk-} {def+} {def-} (fxText);
//   - above the heads of heroes and enemies for as long as the effect lasts (heroFx, foeFx → fxBadges).
const FX_COL = { up: ['#235a2c', '#45b457', '#a9f0a1'], down: ['#6e1813', '#d6443a', '#ffa094'] }, FX_LINE = '#120d16';
const FX_LABEL = { 'atk+': 'močnejši napad', 'atk-': 'šibkejši napad', 'def+': 'močnejša obramba', 'def-': 'šibkejša obramba' };
// the pixels of one icon: Map "x,y" → colour (kind 'atk' or 'def', dir 'up' or 'down')
function fxPixels(kind, dir) {
  const [dk, md, lt] = FX_COL[dir], px = new Map(), set = (x, y, c) => px.set(`${x + 1},${y + 1}`, c);
  if (kind === 'atk') {   // two crossed swords, points up: blades in the colour, gold crossguards and grips at the bottom corners
    const G = ['#8a5a1c', '#e8b74a'];
    // a long blade from the tip at a top corner, a short crossguard, a grip and a pommel at the opposite bottom corner;
    // the guard is kept short so it does not line up with the other blade (at 16 px a long one read as an X)
    const blade = m => { for (let t = 0; t <= 10; t++) { set(m(t), t, lt); if (t) set(m(t), t - 1, md); } };
    const hilt = m => { [[10, 12], [11, 11], [12, 10], [9, 13], [13, 9]].forEach(([x, y], i) => set(m(x), y, i < 3 ? G[1] : G[0])); set(m(12), 12, G[0]); set(m(13), 13, G[0]); set(m(14), 14, G[1]); };
    const a = x => x, b = x => 14 - x;
    blade(a); blade(b); hilt(a); hilt(b);
  } else {               // a heater shield with a dark middle stripe and a light edge
    const rows = [[2, 12], [2, 12], [2, 12], [2, 12], [2, 12], [2, 12], [2, 12], [2, 12], [3, 11], [4, 10], [5, 9], [6, 8], [7, 7]];
    rows.forEach(([x0, x1], i) => { for (let x = x0; x <= x1; x++) set(x, i + 1, md); });
    for (let x = 3; x <= 11; x++) set(x, 2, lt);
    for (let y = 2; y <= 8; y++) set(3, y, lt);
    for (let y = 3; y <= 11; y++) set(7, y, dk);
  }
  // the arrow beside it, as tall as the swords or the shield (Game Director, 21 Nov: the small one could hardly be
  // seen): up for stronger, down for weaker; as wide as the shield (an 11-wide head, a 5-wide shaft), light with a
  // darker right edge
  const xs = [...px.keys()].map(k => +k.split(',')[0]), ys = [...px.keys()].map(k => +k.split(',')[1]);
  const top = Math.min(...ys), H = Math.max(...ys) - top + 1, left = Math.max(...xs) + 3;
  const arrow = Array.from({ length: H }, (_, i) => i < 6 ? [5 - i, 5 + i] : [3, 7]);
  (dir === 'up' ? arrow : arrow.slice().reverse()).forEach(([x0, x1], i) => {
    for (let x = x0; x <= x1; x++) px.set(`${left + x},${top + i}`, x === x1 && x1 > x0 ? md : lt); });
  // a dark outline around everything, so the icon reads on sky, snow and water
  const out = new Map(px);
  for (const k of px.keys()) { const [x, y] = k.split(',').map(Number);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const n = `${x + dx},${y + dy}`; if (!px.has(n)) out.set(n, FX_LINE); }); }
  return out;
}
const FX_URL = {};
function fxUrl(tok) {
  if (FX_URL[tok]) return FX_URL[tok];
  const px = fxPixels(tok.slice(0, 3), tok.endsWith('+') ? 'up' : 'down');
  let w = 0, hgt = 0, rects = '';
  for (const [k, c] of px) { const [x, y] = k.split(',').map(Number); w = Math.max(w, x + 1); hgt = Math.max(hgt, y + 1); rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hgt}" width="${w}" height="${hgt}" shape-rendering="crispEdges">${rects}</svg>`;
  return (FX_URL[tok] = 'data:image/svg+xml,' + encodeURIComponent(svg));
}
const fxIcon = tok => h('img', { class: 'fxi', src: fxUrl(tok), alt: FX_LABEL[tok], title: FX_LABEL[tok], draggable: 'false' });
// text with {atk+} {atk-} {def+} {def-} tokens → text and icons (anything else stays text)
const FX_TOKEN = /\{(atk|def)([+-])\}/g;
function fxText(str) {
  if (str == null) return [];
  const s = String(str), out = []; let last = 0;
  for (const m of s.matchAll(FX_TOKEN)) { if (m.index > last) out.push(s.slice(last, m.index)); out.push(fxIcon(m[1] + m[2])); last = m.index + m[0].length; }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
const fxPlain = str => String(str || '').replace(FX_TOKEN, (_, k, d) => FX_LABEL[k + d]);   // for logs and aria

// ------------------------------------------------------------ what is in force on an actor, for the badges above its head
// an enemy: its attack weakened (Kurent's bells until its next blow, Pregon zime's half, Lepa Vida's song, Volčja
// jagoda) or grown (the Volkodlak feeding on repeated words), against the attack it came with (atkBase)
function foeFx(e) {
  if (!e || e.hp <= 0 || !B) return [];
  const down = [], out = [];
  if (e.weak && e.weak.by) down.push(`−${e.weak.by}`);
  if (e.half > B.time || e.halfNext) down.push('½');
  const base = e.atkBase != null ? e.atkBase : e.atk;
  if (e.atk < base) down.push(`−${base - e.atk}`);
  if (down.length) out.push({ tok: 'atk-', v: down.join(' ') });
  if (e.atk > base) out.push({ tok: 'atk+', v: `+${e.atk - base}` });
  return out;
}
// a hero: Kraljeva vojska's bonus, Perunova medica and Dažbog's light on the next words, Peter Klepec growing;
// Matjaž's shield on each hero and his army's resolve, the party's shield, Varstvo popotnikov (on the others),
// Skrivni rov (on Erazem and, at rank 3, the hero beside him)
function heroFx(k) {
  const st = S.heroes[k]; if (!B || !st || st.down) return [];
  const out = [], up = [];
  if (B.rally && B.rally[k]) up.push(`+${B.rally[k]}`);
  if (B.boost > 0) up.push('×1,5');
  if (B.double > 1) up.push(`×${num(B.double)}`);
  if (HEROES[k].kit === 'grow' && B.grow) up.push(`+${12 * B.grow} %`);
  if (up.length) out.push({ tok: 'atk+', v: up.join(' ') });
  const less = (B.ward || 0) + (B.dampen && B.dampen.left > 0 ? B.dampen.by : 0);
  const guarded = !!(B.guard && B.guard.left > 0 && B.guard.k !== k && !S.heroes[B.guard.k].down);
  const dodge = !!(B.rov && (B.rov.k === k || B.rov.ally === k));
  if (less || B.shield > 0 || guarded || dodge) out.push({ tok: 'def+', v: less ? `+${less}` : '' });
  return out;
}
const fxBadges = list => list.map(b => h('span', { class: 'fxb ' + (b.tok.endsWith('+') ? 'up' : 'down') }, fxIcon(b.tok), b.v ? h('b', {}, b.v) : null));
