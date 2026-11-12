// ============================================================ word list (data/lexicon.bin)
// 1.48 million Slovene word forms (Sloleks 3.1, plus Franček and thesaurus headwords that
// Sloleks lacks) in a minimised automaton (built by tools/build_lexicon.py; format in
// tools/lexicon.py). It stays packed in one Uint32Array of edges (about 1.4 MB) and is walked
// in place: no Set of strings and no object trie, so it fits phones. Each form ends in a separator saying whether the game may suggest it ('+')
// or only accepts it ('|'), followed by its base form (lemma) as "strip n letters, add
// these". States are named by the index of their first edge; the root is 0.
const LEX = (() => {
  const t0 = performance.now();
  const LETTERS = 'abcčdefghijklmnoprsštuvzž', SEP_ACCEPT = 26, SEP_SUGGEST = 27, STRIP0 = 28;
  const CODE = {}; [...LETTERS].forEach((ch, i) => { CODE[ch] = i + 1; });
  const raw = atob($('#lex').textContent.trim()), bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const dv = new DataView(bytes.buffer);
  if (raw.slice(0, 4) !== 'ZGLX') throw new Error('lexicon: bad header');
  const nEdges = dv.getUint32(4, true), nForms = dv.getUint32(8, true), nSuggested = dv.getUint32(12, true);
  const E = new Uint32Array(nEdges);                       // copy, so byte order never matters
  for (let i = 0; i < nEdges; i++) E[i] = dv.getUint32(16 + 4 * i, true);

  // edge index of `label` leaving state st, or -1 (edges are sorted by label)
  function edge(st, label) {
    for (let i = st; ; i++) {
      const l = E[i] & 63;
      if (l === label) return i;
      if (l > label || E[i] & 64) return -1;
    }
  }
  // next state after letter ch, or -1; with onlySuggested, only if a suggested word lies ahead
  function step(st, ch, onlySuggested) {
    const c = CODE[ch]; if (!c) return -1;
    const i = edge(st, c); if (i < 0 || (onlySuggested && !(E[i] & 128))) return -1;
    return E[i] >>> 8;
  }
  // what ends at state st: 2 = a suggested word, 1 = an accepted word, 0 = nothing
  // (every form has one path, so a state has at most one separator)
  function end(st) {
    for (let i = st; ; i++) {
      const l = E[i] & 63;
      if (l === SEP_SUGGEST) return 2;
      if (l === SEP_ACCEPT) return 1;
      if (E[i] & 64) return 0;
    }
  }
  function walk(w) {
    let st = 0;
    for (const ch of w) { st = step(st, ch, false); if (st < 0) return -1; }
    return st;
  }
  const has = w => { if (!w) return false; const st = walk(w); return st >= 0 && end(st) > 0; };
  const suggested = w => { if (!w) return false; const st = walk(w); return st >= 0 && end(st) === 2; };
  function lemma(w) {
    const st = walk(w); if (st < 0) return null;
    let i = edge(st, SEP_SUGGEST); if (i < 0) i = edge(st, SEP_ACCEPT); if (i < 0) return null;
    let s = E[i] >>> 8;
    const strip = (E[s] & 63) - STRIP0;
    let suffix = '';
    for (s = E[s] >>> 8; s; s = E[s] >>> 8) suffix += LETTERS[(E[s] & 63) - 1];
    return w.slice(0, w.length - strip) + suffix;
  }
  // every suggested word with min..max letters (cached): pools for darts and the rock slide
  const cache = new Map();
  function suggestedWords(min, max) {
    const key = min + '-' + max;
    if (cache.has(key)) return cache.get(key);
    const out = [];
    (function dfs(st, w) {
      if (w.length >= min && end(st) === 2) out.push(w);
      if (w.length >= max) return;
      for (let i = st; ; i++) {
        const l = E[i] & 63;
        if (l <= 25 && E[i] & 128) dfs(E[i] >>> 8, w + LETTERS[l - 1]);
        if (E[i] & 64) break;
      }
    })(0, '');
    cache.set(key, out);
    return out;
  }
  return { ROOT: 0, step, end, has, suggested, lemma, suggestedWords, size: nForms, suggestedSize: nSuggested, loadMs: performance.now() - t0 };
})();
// The rest of the game asks WORDS.has(w) (is it a word?) and LEMMA.get(w) (its base form).
const WORDS = { has: w => LEX.has(w), get size() { return LEX.size; } };
const LEMMA = { get: w => LEX.lemma(w) };
