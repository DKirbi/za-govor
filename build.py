"""Build the single-file prototype: inline CSS, data and JS into dist/index.html.

    python3 build.py

Inputs:  src/index.src.html (template), src/game.css,
         src/game.js (battles, crosswords, events) with two generated/added parts spliced in:
           src/art-extra.js (pixel art from tools/art_extra.py), src/journey.js (the road) and
           src/playtest.js (pause, puzzle intros, fullscreen, fit to screen) and
           src/mobile.js (phone specifics: in-game Slovene keyboard, haptics),
           src/credits.js (Zasluge: the Words for Evil credit and all sources),
         data/dict.json (battle word list), data/clues.json (crossword clue bank),
         data/world.json (regions and items of the journey)
Output:  dist/index.html — open it in any modern browser, no server needed.
"""
import pathlib

root = pathlib.Path(__file__).parent
read = lambda rel: (root / rel).read_text(encoding='utf-8')
template = read('src/index.src.html')
data = {'/*__DICT__*/': read('data/dict.json'), '/*__CLUES__*/': read('data/clues.json'), '/*__WORLD__*/': read('data/world.json')}
for name, text in data.items():
    assert '</script' not in text, f'{name} would close its <script> tag'

js = read('src/game.js')
for mark, rels in (('/*__ART_EXTRA__*/', ['src/art-extra.js']), ('/*__JOURNEY__*/', ['src/journey.js', 'src/playtest.js', 'src/mobile.js', 'src/credits.js'])):
    assert js.count(mark) == 1, f'{mark} must appear exactly once in src/game.js'
    js = js.replace(mark, ''.join(read(rel) for rel in rels))

out = template.replace('/*__CSS__*/', read('src/game.css'))
for mark, text in data.items():
    out = out.replace(mark, text)
out = out.replace('/*__JS__*/', js)

(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/index.html').write_text(out, encoding='utf-8')
print('built dist/index.html,', len(out.encode()) // 1024, 'KB')
