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
           src/stats.js (opt-in battle statistics for balancing, to the same form),
           src/menu.js (the start menu and its pages: Nova pot, Dosežki in junaki, Kako igrati, Nastavitve, O igri),
           src/progression.js (the reviewed heroes' own skill kits with ranks 1–3, their XP from the fight),
           src/skills.js (skill texts and stopnje, the skill list, Veščine where points are spent),
           src/shrines.js (svetišča izziva: prayers, the gods' gifts, the gods as challengers),
           src/save.js (the journey saved at checkpoints by Znanje, Izhod),
           src/art-title.js + src/title.js (the "Za govor!" title scene, art from tools/art_title.py),
         data/lexicon.bin (word list from tools/build_lexicon.py, inlined as base64),
         data/clues.json (crossword clue bank), data/world.json (regions and items of the journey),
         data/words.json (words of each region: chests, rock slides, themes), data/meanings.json (word meanings)
         package.json (version and release stage) and git (commit) for the version line
         data/backgrounds.json (background A/B tests) and, for each pack it names, art/manifests/<pack>.json
           with the layer PNGs it lists (art/exports/...), inlined as base64 — a pack is left out until all are committed
Output:  dist/index.html — open it in any modern browser, no server needed.
"""
import base64, json, pathlib, struct, subprocess

root = pathlib.Path(__file__).parent
read = lambda rel: (root / rel).read_text(encoding='utf-8')


# ------------------------------------------------------------ background packs (src/backgrounds.js)
def png_info(raw, rel):
    """Width, height and whether the PNG can be transparent (alpha channel or a tRNS chunk)."""
    assert raw[:8] == b'\x89PNG\r\n\x1a\n', f'{rel} is not a PNG'
    w, h, ctype = struct.unpack('>II', raw[16:24]) + (raw[25],)
    alpha, i = ctype in (4, 6), 8
    while not alpha and i + 8 <= len(raw):
        n, kind = struct.unpack('>I', raw[i:i + 4])[0], raw[i + 4:i + 8]
        if kind in (b'tRNS', b'IDAT'): alpha = kind == b'tRNS'; break
        i += 12 + n
    return w, h, alpha


def background_packs():
    """data/backgrounds.json with every delivered pack built in. A pack whose manifest or layer files are not all
    committed is left out (its variant does not exist, everyone sees A) and reported; a delivered pack that
    contradicts its manifest stops the build, so a broken pack never reaches a player."""
    cfg = json.loads(read('data/backgrounds.json'))
    packs, notes = {}, []
    for pid, pc in cfg.get('packs', {}).items():
        mrel = pc['manifest']
        if not (root / mrel).is_file():
            notes.append(f'background pack {pid}: not delivered yet ({mrel} missing), variant A only'); continue
        man = json.loads(read(mrel))
        if man.get('status') == 'superseded':
            notes.append(f'background pack {pid}: {mrel} is superseded, left out'); continue
        mls = man.get('layers') or []
        missing = [L.get('file', '?') for L in mls if not (root / L.get('file', '')).is_file()]
        if not mls or missing:
            notes.append(f'background pack {pid}: {len(missing)} of {len(mls)} layer files not committed, left out'); continue
        cv = man.get('canvas') or {}
        cw = cv.get('width') or max(L.get('x', 0) + L['width'] for L in mls)
        ch = cv.get('height') or max(L.get('y', 0) + L['height'] for L in mls)
        assert len({L['id'] for L in mls}) == len(mls), f'{mrel}: layer ids must be unique'
        assert len({L['order'] for L in mls}) == len(mls), f'{mrel}: layer orders must be unique'
        tune, layers, size = pc.get('layers', {}), [], 0
        ordered = sorted(mls, key=lambda L: L['order'])
        for depth, L in enumerate(ordered):
            raw = (root / L['file']).read_bytes()
            w, h, alpha = png_info(raw, L['file'])
            assert (w, h) == (L['width'], L['height']), f"{L['file']} is {w}×{h}, {mrel} says {L['width']}×{L['height']}"
            assert not L.get('alpha') or alpha, f"{L['file']}: {mrel} says it is transparent, the PNG has no alpha"
            x, y = L.get('x', 0), L.get('y', ch - h)   # a layer without an offset sits on the bottom of the canvas
            assert 0 <= x and x + w <= cw and 0 <= y and y + h <= ch, f"{L['file']} lies outside the {cw}×{ch} canvas"
            t = tune.get(L['id'])
            if t is None:
                t = {'speed': round(depth / max(1, len(ordered) - 1), 2)}
                notes.append(f"background pack {pid}: layer {L['id']} has no tuning in data/backgrounds.json, speed {t['speed']} from its depth")
            layers.append({'id': L['id'], 'w': w, 'h': h, 'x': x, 'y': y, 'tileX': bool(L.get('tileX')),
                           'front': t.get('front', L.get('role') == 'foreground'), 'speed': t.get('speed', 0), 'drift': t.get('drift', 0),
                           'src': 'data:image/png;base64,' + base64.b64encode(raw).decode('ascii')})
            size += len(raw)
        packs[pid] = {'name': man.get('name', pid), 'version': man.get('version', ''), 'status': man.get('status', 'draft'),
                      'canvas': {'w': cw, 'h': ch}, 'hideRoad': bool(pc.get('hideRoad')), 'layers': layers}
        notes.append(f"background pack {pid}: {len(layers)} layers, {cw}×{ch}, {size // 1024} KB, status {packs[pid]['status']}"
                     + (' — large for a single-file build' if size > 1536 * 1024 else ''))
    for key, t in cfg.get('tests', {}).items():
        gone = [v for v, p in t.get('variants', {}).items() if p not in packs]
        if t.get('live') and gone:
            notes.append(f"background test {key} is live but variant {', '.join(gone)} is not built: everyone sees A")
    return {'tests': cfg.get('tests', {}), 'packs': packs}, notes


bgdata, bgnotes = background_packs()
template = read('src/index.src.html')
data = {'/*__LEX__*/': base64.b64encode((root / 'data/lexicon.bin').read_bytes()).decode('ascii'),
        '/*__CLUES__*/': read('data/clues.json'), '/*__WORLD__*/': read('data/world.json'), '/*__WORDS__*/': read('data/words.json'), '/*__MEANINGS__*/': read('data/meanings.json'),
        '/*__BGS__*/': json.dumps(bgdata, ensure_ascii=False, separators=(',', ':'))}
for name, text in data.items():
    assert '</script' not in text, f'{name} would close its <script> tag'

js = read('src/game.js')
for mark, rels in (('/*__LEXICON__*/', ['src/lexicon.js']), ('/*__ART_EXTRA__*/', ['src/art-extra.js', 'src/art-title.js']),
                   ('/*__JOURNEY__*/', ['src/journey.js', 'src/backgrounds.js', 'src/playtest.js', 'src/mobile.js', 'src/credits.js', 'src/report.js', 'src/stats.js', 'src/menu.js', 'src/progression.js', 'src/skills.js', 'src/shrines.js', 'src/save.js', 'src/title.js'])):
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
for note in bgnotes:
    print('  ' + note)
