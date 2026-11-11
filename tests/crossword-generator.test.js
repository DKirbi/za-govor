// Generate hundreds of crosswords per theme on every knowledge level and check that every
// grid is valid: no letter clashes, no stray letter runs, connected, fits a phone (9×9),
// words only from that level's clue banks, enemy crosswords short enough, and the keyword
// column really spells the keyword.
const { openGame, runner } = require('./harness');
const { check, run } = runner('Crossword generator (200 puzzles per theme and level)');

run(async () => {
  const ctx = await openGame();
  const res = await ctx.page.evaluate(() => {
    const Z = window.__ZG;
    const keys = new Set(Object.values(Z.CLUES.themes).flatMap(t => t.keys.map(k => k[0])));
    const cases = [['finisher', 'perun'], ['finisher', 'kres'], ['finisher', 'mokos'], ['finisher', 'triglav'], ['ambush', 'zaseda'], ['lock', 'vrtinec'], ['lock', 'zmaj']];
    const stats = {}, bad = [];
    for (const level of Object.keys(Z.LEVELS)) {
      Z.S.know = level;
      for (const [kind, id] of cases) {
        const cfg = kind === 'finisher' ? Z.LEVELS[level].fin : Z.LEVELS[level].easy;
        const allowed = new Set(cfg.banks.flatMap(b => Z.CLUES.banks[b].map(r => r[0])));
        const st = { geslo: 0, cross: 0, maxR: 0, maxC: 0, maxLen: 0, entries: 0, ms: 0 };
        for (let i = 0; i < 200; i++) {
          const t0 = performance.now(); const D = Z.makeCrossword(kind, id); st.ms += performance.now() - t0;
          st[D.style]++; st.maxR = Math.max(st.maxR, D.rows); st.maxC = Math.max(st.maxC, D.cols); st.entries += D.entries.length;
          const grid = new Map(), seen = new Set();
          for (const e of D.entries) {
            const tag = `${level}/${id}`;
            if (seen.has(e.answer)) bad.push(`${tag}: duplicate ${e.answer}`); seen.add(e.answer);
            if (!e.geslo && !e.main && !allowed.has(e.answer)) bad.push(`${tag}: ${e.answer} is not in this level's banks`);
            if (!e.geslo && !e.main && keys.has(e.answer)) bad.push(`${tag}: mythology word as filler ${e.answer}`);
            if (!e.geslo && !e.main) st.maxLen = Math.max(st.maxLen, e.answer.length);
            for (let p = 0; p < e.answer.length; p++) {
              const r = e.row + (e.dir === 'D' ? p : 0), c = e.col + (e.dir === 'A' ? p : 0), k = r + ',' + c;
              if (r < 0 || c < 0 || r >= D.rows || c >= D.cols) bad.push(`${tag}: out of bounds ${e.answer}`);
              if (grid.has(k) && grid.get(k) !== e.answer[p]) bad.push(`${tag}: letter clash in ${e.answer}`);
              grid.set(k, e.answer[p]);
            }
          }
          if (D.style === 'cross') {
            const ents = new Set(D.entries.map(e => `${e.dir}${e.row},${e.col},${e.answer}`));
            for (const dir of ['A', 'D']) for (let a = 0; a < (dir === 'A' ? D.rows : D.cols); a++) {
              let run = '', start = -1;
              for (let b = 0; b <= (dir === 'A' ? D.cols : D.rows); b++) {
                const ch = grid.get(dir === 'A' ? a + ',' + b : b + ',' + a);
                if (ch) { if (!run) start = b; run += ch; continue; }
                if (run.length >= 2 && !ents.has(dir === 'A' ? `A${a},${start},${run}` : `D${start},${a},${run}`)) bad.push(`${level}/${id}: stray letters ${run}`);
                run = '';
              }
            }
            const cells = [...grid.keys()], todo = [cells[0]], vis = new Set(todo);
            while (todo.length) {
              const [r, c] = todo.pop().split(',').map(Number);
              for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (r + dr) + ',' + (c + dc); if (grid.has(k) && !vis.has(k)) { vis.add(k); todo.push(k); } }
            }
            if (vis.size !== cells.length) bad.push(`${level}/${id}: disconnected grid`);
          } else {
            const g = D.entries.find(e => e.geslo);
            const col = [...g.answer].map((_, p) => grid.get(p + ',' + g.col)).join('');
            if (col !== g.answer) bad.push(`${level}/${id}: keyword column spells ${col}, not ${g.answer}`);
          }
        }
        st.avgMs = +(st.ms / 200).toFixed(1); st.avgEntries = +(st.entries / 200).toFixed(1);
        stats[`${level} ${kind}/${id}`] = { ...st, maxLenAllowed: cfg.maxLen, size: cfg.size };
      }
    }
    Z.S.know = 'malcek';
    return { stats, bad: [...new Set(bad)] };
  });

  check(res.bad.length === 0, 'every generated grid is valid on every level', res.bad.slice(0, 5).join('; '));
  for (const [name, st] of Object.entries(res.stats)) {
    const ok = st.maxR <= st.size && st.maxC <= st.size && st.maxLen <= st.maxLenAllowed && st.avgMs < 100;
    check(ok, `${name}: fits ${st.size}×${st.size}, words ≤ ${st.maxLenAllowed} letters`,
      `max ${st.maxR}×${st.maxC}, longest ${st.maxLen}, ${st.avgEntries} entries, ${st.geslo} keyword / ${st.cross} mixed, ${st.avgMs} ms`);
  }
  check(ctx.errors.length === 0, 'no page or console errors', ctx.errors.join(' | '));
  return ctx;
});
