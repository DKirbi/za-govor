#!/usr/bin/env node
// Balance simulator: whole journeys of the real game (dist/index.html) played by a bot (tools/sim/bot.js).
//
//   node tools/sim/run.js tools/sim/plan.json            runs every entry of the plan
//   node tools/sim/run.js tools/sim/plan.json malcek-10  only the entries whose name contains "malcek-10"
//
// A plan is a JSON list: [{ "name": "malcek-10", "know": "malcek", "pace": 10, "n": 200,
//   "set": { "WORLD.balance.hp": [ ... ], "LV_XP": [ ... ] },        overrides of the game's own data, in place
//   "bot": { "lens": { "3": 25, ... } } }]                             the player model (tools/sim/bot.js, DEF)
// Options: --dist <file> (another build, e.g. main's, for a comparison), --workers <n> (default: CPUs, at most 4),
// --out <file> (the journeys as JSON, default tools/sim/out/<plan>-<time>.json).
// Needs Chrome (CHROME_PATH or the usual places, as the tests) and `npm ci`.
const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer-core');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const DIST = path.resolve(opt('--dist', path.join(__dirname, '../../dist/index.html')));
const WORKERS = +opt('--workers', Math.min(4, os.cpus().length));
let OUT = opt('--out', null);
const [planFile, only] = args;
if (!planFile) { console.error('usage: node tools/sim/run.js <plan.json> [name filter] [--dist file] [--workers n]'); process.exit(1); }
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8')).filter(p => !only || p.name.includes(only));
OUT = OUT || path.join(__dirname, 'out', `${path.basename(planFile, '.json')}-${Date.now()}.json`);

function chromePath() {
  const c = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].filter(Boolean);
  const f = c.find(p => fs.existsSync(p)); if (!f) throw new Error('Chrome not found: set CHROME_PATH'); return f;
}

async function openWorker(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + DIST);
  await page.waitForFunction(() => !!window.__ZG);
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8') });
  return { page, errors };
}

// ------------------------------------------------------------ summaries
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
const pct = (n, d) => d ? Math.round(1000 * n / d) / 10 : 0;
function summary(js) {
  const n = js.length, won = js.filter(j => j.won).length, p = won / n, ci = 1.96 * Math.sqrt(p * (1 - p) / n);
  const regions = Math.max(...js.flatMap(j => j.battles.map(b => b.ri))) + 1;
  const per = Array.from({ length: regions }, (_, ri) => {
    const bs = js.flatMap(j => j.battles.filter(b => b.ri === ri && b.kind !== 'god'));
    const end = js.filter(j => !j.won && j.lostAt && j.lostAt.ri === ri).length;
    const lv = js.map(j => j.regions.find(r => r.ri === ri)).filter(Boolean);
    const gap = lv.filter(r => r.lv.length >= 3).map(r => Math.max(...r.lv) - Math.min(...r.lv));
    return { ri, battles: bs.length, firstTry: pct(bs.filter(b => b.win).length, bs.length), drain: Math.round(100 * mean(bs.filter(b => b.win).map(b => b.drain))),
      t: Math.round(mean(bs.map(b => b.t))), ended: end, lvMax: +mean(lv.map(r => Math.max(...r.lv))).toFixed(1), lvMin: +mean(lv.map(r => Math.min(...r.lv))).toFixed(1), gap: +mean(gap).toFixed(1) };
  });
  const gods = js.flatMap(j => j.gods || []), godPer = Array.from({ length: 10 }, (_, ri) => gods.filter(g => g.ri === ri)).map((g, ri) => g.length ? `${RN[ri]} ${pct(g.filter(x => x.win).length, g.length)} % of ${g.length}` : null).filter(Boolean);
  const godEnd = js.filter(j => j.lostAt && j.lostAt.kind === 'god').length;
  return { gods: gods.length ? `gods beaten ${pct(gods.filter(g => g.win).length, gods.length)} % of ${gods.length} (${godPer.join(', ')}); journeys ended by a god ${godEnd}` : 'no god fights',
    n, won, winPct: pct(won, n), ci: Math.round(1000 * ci) / 10, rescues: +mean(js.map(j => j.rescues || 0)).toFixed(2), stalls: js.reduce((s, j) => s + j.stalls, 0),
    minutes: +mean(js.map(j => j.battles.reduce((s, b) => s + b.t, 0) / 60)).toFixed(1),
    dmg: (() => { const t = ['hero', 'burn', 'other'].map(k => js.reduce((s, j) => s + (j.dmg ? j.dmg[k] : 0), 0)), sum = t.reduce((a, b) => a + b, 0) || 1; return t.map(x => Math.round(100 * x / sum)).join('/'); })(), per };
}
const RN = ['Ptuj', 'Peca', 'Triglav', 'Bled', 'Gozd', 'Piran', 'Predjama', 'Barje', 'Ljublj.', 'Grad'];
function print(name, s) {
  console.log(`\n${name}: journeys won ${s.won}/${s.n} = ${s.winPct} % (±${s.ci}), second chances used ${s.rescues}, ${s.minutes} min of battle, damage skills/burns/zagovor+rest ${s.dmg} %, stalls ${s.stalls}`);
  console.log('  ' + s.gods);
  console.log('  region      battles  1st try %  drain %  sec  ended  lv max/min (gap)');
  s.per.forEach(r => console.log(`  ${(RN[r.ri] || r.ri).padEnd(10)} ${String(r.battles).padStart(8)} ${String(r.firstTry).padStart(10)} ${String(r.drain).padStart(8)} ${String(r.t).padStart(4)} ${String(r.ended).padStart(6)}   ${r.lvMax}/${r.lvMin} (${r.gap})`));
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'], protocolTimeout: 0 });
  const workers = await Promise.all(Array.from({ length: WORKERS }, () => openWorker(browser)));
  const all = {};
  for (const entry of plan) {
    const t0 = Date.now(), js = [];
    let todo = entry.n || 100;
    await Promise.all(workers.map(async w => {
      await w.page.evaluate(set => window.__SIM.set(set), entry.set || {});
      while (todo > 0) {
        todo--;
        const j = await w.page.evaluate(o => window.__SIM.journey(o), { know: entry.know, pace: entry.pace, ...(entry.bot || {}) });
        js.push(j);
      }
    }));
    const errs = workers.flatMap(w => w.errors.splice(0));
    const s = summary(js); s.sec = Math.round((Date.now() - t0) / 1000); s.errors = [...new Set(errs)].slice(0, 5);
    print(entry.name, s);
    if (s.errors.length) console.log('  page errors:', s.errors.join(' | '));
    console.log(`  (${s.sec} s)`);
    all[entry.name] = { entry, summary: s, journeys: js };
    // reset what the entry changed: reload the pages
    await Promise.all(workers.map(async (w, i) => { await w.page.close(); workers[i] = await openWorker(browser); }));
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(all));
  console.log('\nwritten', path.relative(process.cwd(), OUT));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
