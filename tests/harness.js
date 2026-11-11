// Shared helpers for the headless-Chrome tests.
// Tests drive the game through the window.__ZG test hook exposed by src/game.js.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PAGE_URL = 'file://' + path.resolve(__dirname, '../dist/index.html');
const OUT_DIR = path.resolve(__dirname, '../test-output');

const sleep = ms => new Promise(r => setTimeout(r, ms));
// Players on English keyboards type c/s/z for č/š/ž; the game accepts both.
const deacc = s => s.toLowerCase().replace(/č/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z');

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to your Chrome or Chromium binary.');
  return found;
}

const PHONE = { viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile' };

async function openGame({ phone = false, width = 1100, height = 1000 } = {}) {
  if (!fs.existsSync(path.resolve(__dirname, '../dist/index.html'))) throw new Error('dist/index.html missing — run `python3 build.py` first.');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  if (phone) await page.emulate(PHONE); else await page.setViewport({ width, height });
  const errors = [];
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console error: ' + m.text()); });
  await page.goto(PAGE_URL);
  await sleep(400);
  const shot = name => page.screenshot({ path: path.join(OUT_DIR, name + '.png') });
  return { browser, page, errors, shot };
}

// Minimal test runner: named checks, a summary, and a non-zero exit code on failure.
function runner(title) {
  const results = [];
  const check = (ok, name, detail = '') => {
    results.push({ ok: !!ok, name, detail });
    console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
    return !!ok;
  };
  const run = async fn => {
    console.log(title);
    let ctx;
    try {
      ctx = await fn(check);
    } catch (e) {
      check(false, 'test crashed', e.stack || String(e));
    } finally {
      if (ctx && ctx.browser) await ctx.browser.close();
    }
    const failed = results.filter(r => !r.ok);
    console.log(failed.length ? `  ${failed.length} of ${results.length} checks failed\n` : `  all ${results.length} checks passed\n`);
    process.exitCode = failed.length ? 1 : 0;
  };
  return { check, run };
}

module.exports = { openGame, runner, sleep, deacc, OUT_DIR };
