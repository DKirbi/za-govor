// Generate hundreds of crosswords per theme and check that every grid is valid:
// no letter clashes, no stray letter runs, connected, fits a phone (9×9), only bank
// words as fillers, and the keyword column really spells the keyword.
const { openGame, runner } = require('./harness');
const { check, run } = runner('Crossword generator (400 puzzles per theme)');

run(async () => {
  const ctx = await openGame();
  const res = await ctx.page.evaluate(() => {
    const Z = window.__ZG, bank = new Set(Z.CLUES.bank.map(b => b[0]));
    const keys = new Set(Object.values(Z.CLUES.themes).flatMap(t => t.keys.map(k => k[0])));
    const cases = [['finisher', 'perun'], ['finisher', 'kres'], ['finisher', 'mokos'], ['finisher', 'triglav'], ['ambush', 'zaseda'], ['lock', 'vrtinec'], ['lock', 'zmaj']];
    const stats = {}, bad = [];
    for (const [kind, id] of cases) {
      const st = { geslo: 0, cross: 0, maxR: 0, maxC: 0, maxLen: 0, ms: 0 };
      for (let i = 0; i < 400; i++) {
        const t0 = performance.now(); const D = Z.makeCrossword(kind, id); st.ms += performance.now() - t0;
        st[D.style]++; st.maxR = Math.max(st.maxR, D.rows); st.maxC = Math.max(st.maxC, D.cols);
        const grid = new Map(), seen = new Set();
        for (const e of D.entries) {
          if (seen.has(e.answer)) bad.push(`${id}: duplicate ${e.answer}`); seen.add(e.answer);
          if (!bank.has(e.answer) && !keys.has(e.answer)) bad.push(`${id}: unknown word ${e.answer}`);
          if (!e.geslo && !e.main && keys.has(e.answer)) bad.push(`${id}: mythology word as filler ${e.answer}`);
          if (!e.geslo && !e.main) st.maxLen = Math.max(st.maxLen, e.answer.length);
          for (let p = 0; p < e.answer.length; p++) {
            const r = e.row + (e.dir === 'D' ? p : 0), c = e.col + (e.dir === 'A' ? p : 0), k = r + ',' + c;
            if (r < 0 || c < 0 || r >= D.rows || c >= D.cols) bad.push(`${id}: out of bounds ${e.answer}`);
            if (grid.has(k) && grid.get(k) !== e.answer[p]) bad.push(`${id}: letter clash in ${e.answer}`);
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
              if (run.length >= 2 && !ents.has(dir === 'A' ? `A${a},${start},${run}` : `D${start},${a},${run}`)) bad.push(`${id}: stray letters ${run}`);
              run = '';
            }
          }
          const cells = [...grid.keys()], todo = [cells[0]], vis = new Set(todo);
          while (todo.length) {
            const [r, c] = todo.pop().split(',').map(Number);
            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (r + dr) + ',' + (c + dc); if (grid.has(k) && !vis.has(k)) { vis.add(k); todo.push(k); } }
          }
          if (vis.size !== cells.length) bad.push(`${id}: disconnected grid`);
        } else {
          const g = D.entries.find(e => e.geslo);
          const col = [...g.answer].map((_, p) => grid.get(p + ',' + g.col)).join('');
          if (col !== g.answer) bad.push(`${id}: keyword column spells ${col}, not ${g.answer}`);
        }
      }
      st.avgMs = +(st.ms / 400).toFixed(1);
      stats[`${kind}/${id}`] = st;
    }
    return { stats, bad: [...new Set(bad)] };
  });

  check(res.bad.length === 0, 'every generated grid is valid', res.bad.slice(0, 5).join('; '));
  for (const [name, st] of Object.entries(res.stats)) {
    const easy = !name.startsWith('finisher');
    const ok = st.maxR <= 9 && st.maxC <= 9 && (!easy || st.maxLen <= 5) && st.avgMs < 100;
    check(ok, `${name} fits 9×9${easy ? ', easy words only (≤5 letters)' : ''}`,
      `max ${st.maxR}×${st.maxC}, ${st.geslo} keyword / ${st.cross} mixed, ${st.avgMs} ms each`);
  }
  check(ctx.errors.length === 0, 'no page or console errors', ctx.errors.join(' | '));
  return ctx;
});
