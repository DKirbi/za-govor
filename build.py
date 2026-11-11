"""Build the single-file prototype: inline CSS, word data and JS into dist/index.html.

    python3 build.py

Inputs:  src/index.src.html (template), src/game.css, src/game.js,
         data/dict.json (battle word list), data/clues.json (crossword clue bank)
Output:  dist/index.html — open it in any modern browser, no server needed.
"""
import pathlib

root = pathlib.Path(__file__).parent
template = (root / 'src/index.src.html').read_text(encoding='utf-8')
dictionary = (root / 'data/dict.json').read_text(encoding='utf-8')
clues = (root / 'data/clues.json').read_text(encoding='utf-8')
for name, text in (('dict.json', dictionary), ('clues.json', clues)):
    assert '</script' not in text, f'{name} would close its <script> tag'

out = (template
       .replace('/*__CSS__*/', (root / 'src/game.css').read_text(encoding='utf-8'))
       .replace('/*__DICT__*/', dictionary)
       .replace('/*__CLUES__*/', clues)
       .replace('/*__JS__*/', (root / 'src/game.js').read_text(encoding='utf-8')))

(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/index.html').write_text(out, encoding='utf-8')
print('built dist/index.html,', len(out.encode()) // 1024, 'KB')
