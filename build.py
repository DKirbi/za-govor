"""Build the single-file prototype: inline CSS, data and JS into dist/index.html.

    python3 build.py

Inputs:  src/index.src.html (template), src/game.css + src/title.css,
         src/game.js (battles, crosswords, events) with generated/added parts spliced in:
           src/lexicon.js (reads the word list) at the top,
           src/art-extra.js (pixel art from tools/art_extra.py), src/journey.js (the road) and
           src/playtest.js (pause, puzzle intros, fullscreen, fit to screen) and
           src/mobile.js (phone specifics: in-game Slovene keyboard, haptics),
           src/credits.js (Navdih and Zasluge: the Words for Evil credit and all sources),
           src/report.js (Prijavi besedo: rejected words, reports to a Google Form),
           src/menu.js (the start menu and its pages: Nova pot, Dosežki in junaki, Kako igrati, O igri),
           src/art-title.js + src/title.js (the "Za govor!" title scene, art from tools/art_title.py),
         data/lexicon.bin (word list from tools/build_lexicon.py, inlined as base64),
         data/clues.json (crossword clue bank), data/world.json (regions and items of the journey)
         package.json (version and release stage) and git (commit) for the version line
Output:  dist/index.html — open it in any modern browser, no server needed.
"""
import base64, json, pathlib, subprocess

root = pathlib.Path(__file__).parent
read = lambda rel: (root / rel).read_text(encoding='utf-8')
template = read('src/index.src.html')
data = {'/*__LEX__*/': base64.b64encode((root / 'data/lexicon.bin').read_bytes()).decode('ascii'),
        '/*__CLUES__*/': read('data/clues.json'), '/*__WORLD__*/': read('data/world.json')}
for name, text in data.items():
    assert '</script' not in text, f'{name} would close its <script> tag'

js = read('src/game.js')
for mark, rels in (('/*__LEXICON__*/', ['src/lexicon.js']), ('/*__ART_EXTRA__*/', ['src/art-extra.js', 'src/art-title.js']),
                   ('/*__JOURNEY__*/', ['src/journey.js', 'src/playtest.js', 'src/mobile.js', 'src/credits.js', 'src/report.js', 'src/menu.js', 'src/title.js'])):
    assert js.count(mark) == 1, f'{mark} must appear exactly once in src/game.js'
    js = js.replace(mark, ''.join(read(rel) for rel in rels))

# The version shown in the game (start screen, O igri, missing-word reports): package.json is the one source.
# "version" follows semantic versioning (see CHANGELOG.md); "config.stage" is the release stage players see.
# The commit is added only when the sources match it (CI, a clean checkout): a build made from uncommitted
# changes, such as the dist/index.html committed with them, would otherwise name the commit before them.
pkg = json.loads(read('package.json'))
git = lambda *a: subprocess.run(['git', *a], cwd=root, capture_output=True, text=True, check=True).stdout.strip()
try:
    commit = git('rev-parse', '--short=7', 'HEAD') if not git('status', '--porcelain', '--', '.', ':(exclude)dist') else ''
except (OSError, subprocess.CalledProcessError):
    commit = ''
build = {'version': pkg['version'], 'stage': pkg.get('config', {}).get('stage', ''), 'commit': commit}
assert js.count('/*__BUILD__*/') == 1, '/*__BUILD__*/ must appear exactly once in src/game.js'
js = js.replace("/*__BUILD__*/ { version: '0.0.0', stage: '', commit: '' }", json.dumps(build, ensure_ascii=False))

out = template.replace('/*__CSS__*/', read('src/game.css') + read('src/title.css'))
for mark, text in data.items():
    out = out.replace(mark, text)
out = out.replace('/*__JS__*/', js)

(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/index.html').write_text(out, encoding='utf-8')
print('built dist/index.html,', len(out.encode()) // 1024, 'KB,', f"v{build['version']}", build['stage'], build['commit'])
