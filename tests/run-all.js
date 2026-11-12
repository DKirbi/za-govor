// Run every test file in its own process and report a combined result.
const { spawnSync } = require('child_process');
const path = require('path');

const files = ['crossword-generator.test.js', 'levels.test.js', 'keyword.test.js', 'phone.test.js', 'desktop.test.js', 'journey.test.js', 'credits.test.js', 'report.test.js', 'lexicon.test.js', 'title.test.js'];
let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
console.log(failed ? `${failed} of ${files.length} test files failed` : `all ${files.length} test files passed`);
process.exit(failed ? 1 : 0);
