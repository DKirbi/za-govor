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
           src/effects.js (icons for attack and defence up or down: in skill texts, cards and above heads),
           src/progression.js (the reviewed heroes' own skill kits with ranks 1–3, their XP from the fight),
           src/skills.js (skill texts and stopnje, the skill list, Veščine where points are spent),
           src/shrines.js (svetišča izziva: prayers, the gods' gifts, the gods as challengers),
           src/save.js (the journey saved at checkpoints by Znanje, Izhod),
           src/achievements.js (achievements, story cards and skill cards: the profile zg-dosezki, data/achievements.json),
           src/art-title.js + src/title.js (the "Za govor!" title scene, art from tools/art_title.py),
         data/lexicon.bin (word list from tools/build_lexicon.py, inlined as base64),
         data/clues.json (crossword clue bank), data/world.json (regions and items of the journey),
         data/words.json (words of each region: chests, rock slides, themes), data/meanings.json (word meanings)
         package.json (version and release stage) and git (commit) for the version line
         data/backgrounds.json (background A/B tests) and, for each pack it names, art/manifests/<pack>.json
           with the layer PNGs it lists (art/exports/...), inlined as base64 — a pack is left out until all are committed
         art/exports/characters/skill-cards.json (Codex's painted skill cards, tools/art_skill_cards.py), inlined the same way
Output:  dist/index.html — open it in any modern browser, no server needed.
"""
import base64, hashlib, json, pathlib, struct, subprocess

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


def webp_info(raw, rel):
    """Width, height and whether the WebP has alpha (stdlib: the RIFF header). Simple lossy (VP8), lossless (VP8L) or
    extended (VP8X, which carries the alpha flag), as Pillow writes them for tools/art_bg_webp.py."""
    assert raw[:4] == b'RIFF' and raw[8:12] == b'WEBP', f'{rel} is not a WebP'
    kind, data = raw[12:16], raw[20:]
    if kind == b'VP8X':
        return 1 + int.from_bytes(data[4:7], 'little'), 1 + int.from_bytes(data[7:10], 'little'), bool(data[0] & 0x10)
    if kind == b'VP8L':
        b = int.from_bytes(data[1:5], 'little')
        return 1 + (b & 0x3FFF), 1 + ((b >> 14) & 0x3FFF), bool((b >> 28) & 1)
    if kind == b'VP8 ':
        assert data[3:6] == b'\x9d\x01\x2a', f'{rel}: not a VP8 key frame'
        w, h = struct.unpack('<HH', data[6:10])
        return w & 0x3FFF, h & 0x3FFF, False
    raise AssertionError(f'{rel}: unknown WebP chunk {kind!r}')


def layer_picture(png_rel, webp_cfg, notes, pid):
    """The bytes the build embeds for one layer, their MIME type and (width, height, alpha). A pack with "webp" in
    data/backgrounds.json uses the WebP copy from tools/art_bg_webp.py while it was made from this very PNG at that
    quality; otherwise, and for every other pack, the PNG."""
    png = (root / png_rel).read_bytes()
    if png_rel.endswith('.webp'):   # an export that is a WebP already (tools/art_folk_parallax.py): embedded as it is
        return png, 'image/webp', webp_info(png, png_rel)
    q = (webp_cfg or {}).get('quality')
    if q:
        p = pathlib.PurePosixPath(png_rel)
        wrel, irel = str(p.parent / 'webp' / (p.stem + '.webp')), str(p.parent / 'webp' / 'index.json')
        e = json.loads(read(irel)).get(p.name) if (root / irel).is_file() else None
        if e and (root / wrel).is_file() and e.get('quality') == q and e.get('sha1') == hashlib.sha1(png).hexdigest():
            raw = (root / wrel).read_bytes()
            return raw, 'image/webp', webp_info(raw, wrel)
        notes.append(f'background pack {pid}: {wrel} is missing or stale, the PNG is embedded instead — run python3 tools/art_bg_webp.py')
    return png, 'image/png', png_info(png, png_rel)


def manifest_layers(man, season=None):
    """The layers of a pack manifest, back to front, in one shape. Two formats are read:
    layers: [{id, order, file, width, height, x, y, alpha, tileX, role}] (tools/art_ptuj_parallax.py), and the
    asset-library format layersBackToFront: [{id, export, dimensions.export, alpha (text), tileable.horizontal}]."""
    if man.get('layers'): return sorted(man['layers'], key=lambda L: L['order'])
    out = []
    rows = [L for L in (man.get('layersBackToFront') or []) if not L.get('previewOnly')]
    # a layer's depth is where its id first appears in the manifest: a shared layer (the bridge) keeps the depth of
    # the sunset block, so winter draws it after the wall, not behind the sky
    depth = {}
    for i, L in enumerate(rows): depth.setdefault(L['id'], i)
    for L in sorted((L for L in rows if not season or L.get('season') in (season, 'shared')), key=lambda L: depth[L['id']]):
        w, h = (L.get('dimensions') or {}).get('export') or L.get('exportSize') or (None, None)
        a = L.get('alpha')
        out.append({'id': L['id'], 'order': depth[L['id']] + 1, 'file': L.get('export') or L.get('file', ''), 'width': w, 'height': h,
                    'alpha': a if isinstance(a, bool) else not str(a).lower().startswith('opaque'),
                    'tileX': bool((L.get('tileable') or {}).get('horizontal')) if isinstance(L.get('tileable'), dict) else bool(L.get('tileable')), 'role': L.get('role', 'background'), 'x': (L.get('offset') or [0, 0])[0], 'y': (L.get('offset') or [0, 0])[1]})
    return out


def background_packs():
    """data/backgrounds.json with every delivered pack built in. A pack whose manifest or layer files are not all
    committed is left out (its variant does not exist, everyone sees A) and reported; a delivered pack that
    contradicts its manifest stops the build, so a broken pack never reaches a player.
    Placement: a layer sits where its manifest puts it (x, y; without y on the bottom of the canvas). When the
    manifest leaves placement open, data/backgrounds.json places it for the game's scene: the pack's view (the
    canvas the scene is fitted to) and per layer x, y and scale, in canvas pixels."""
    cfg = json.loads(read('data/backgrounds.json'))
    packs, notes = {}, []
    for pid, pc in cfg.get('packs', {}).items():
        mrel = pc['manifest']
        if not (root / mrel).is_file():
            notes.append(f'background pack {pid}: not delivered yet ({mrel} missing), variant A only'); continue
        man = json.loads(read(mrel))
        if man.get('status') == 'superseded':
            notes.append(f'background pack {pid}: {mrel} is superseded, left out'); continue
        mls = manifest_layers(man, pc.get('season'))
        missing = [L.get('file') or '?' for L in mls if not (root / (L.get('file') or '')).is_file()]
        if not mls or missing:
            notes.append(f'background pack {pid}: {len(missing)} of {len(mls)} layer files not committed, left out'); continue
        cv, view = man.get('canvas') or {}, pc.get('view') or {}
        cw = view.get('width') or cv.get('width') or max(L.get('x', 0) + L['width'] for L in mls)
        ch = view.get('height') or cv.get('height') or max(L.get('y', 0) + L['height'] for L in mls)
        assert len({L['id'] for L in mls}) == len(mls), f'{mrel}: layer ids must be unique'
        assert len({L['order'] for L in mls}) == len(mls), f'{mrel}: layer orders must be unique'
        tune, layers, size = pc.get('layers', {}), [], 0
        for depth, L in enumerate(mls):
            fp = L['file']
            raw, mime, (w, h, alpha) = layer_picture(fp, pc.get('webp'), notes, pid)
            assert (w, h) == (L['width'], L['height']), f"{L['file']} ({mime}) is {w}×{h}, {mrel} says {L['width']}×{L['height']}"
            w, h = L['width'], L['height']   # drawn at the manifest size, whatever the file's resolution
            assert not L.get('alpha') or alpha, f"{L['file']} ({mime}): {mrel} says it is transparent, the picture has no alpha"
            t = tune.get(L['id'])
            if t is None:
                t = {'speed': round(depth / max(1, len(mls) - 1), 2)}
                notes.append(f"background pack {pid}: layer {L['id']} has no tuning in data/backgrounds.json, speed {t['speed']} from its depth")
            k = t.get('scale', 1)
            if any(key in t for key in ('x', 'y', 'scale')):   # placed for the scene by data/backgrounds.json
                x, y = t.get('x', L.get('x', 0)), t.get('y', L.get('y', ch - h * k))
                assert x < cw and y < ch and x + w * k > 0 and y + h * k > 0, f"{pid}/{L['id']}: placed entirely outside the {cw}×{ch} view"
            else:   # placed by its manifest
                x, y = L.get('x', 0), L.get('y', ch - h)   # a layer without an offset sits on the bottom of the canvas
                assert 0 <= x and (L.get('tileX') or x + w <= cw) and 0 <= y and y + h <= ch, f"{L['file']} lies outside the {cw}×{ch} canvas"
            layers.append({'id': L['id'], 'w': w, 'h': h, 'x': x, 'y': y, 'scale': k, 'tileX': bool(L.get('tileX')),
                           'front': t.get('front', L.get('role') == 'foreground'), 'speed': t.get('speed', 0), 'drift': t.get('drift', 0), 'pan': t.get('pan', 1),
                           **{k: t[k] for k in ('stand', 'neck', 'riseOnly', 'below') if k in t},
                           'src': f'data:{mime};base64,' + base64.b64encode(raw).decode('ascii')})
            size += len(raw)
        packs[pid] = {'name': pc.get('name') or man.get('name') or pid, 'version': man.get('version', ''), 'status': man.get('status', 'draft'),
                      'canvas': {'w': cw, 'h': ch}, 'hideRoad': bool(pc.get('hideRoad')), **({'focusY': pc['focusY']} if 'focusY' in pc else {}), 'layers': layers}
        fmt = ' WebP' if all(L['src'].startswith('data:image/webp') for L in layers) else ''
        notes.append(f"background pack {pid}: {len(layers)} layers, {cw}×{ch}, {size // 1024} KB{fmt}, status {packs[pid]['status']}"
                     + (' — large for a single-file build' if size > 1536 * 1024 else ''))
    for key, t in cfg.get('tests', {}).items():
        gone = [v for v, p in t.get('variants', {}).items() if p not in packs]
        if t.get('live') and gone:
            notes.append(f"background test {key} is live but variant {', '.join(gone)} is not built: everyone sees A")
    return {'tests': cfg.get('tests', {}), 'packs': packs, 'cardTest': cfg.get('cardTest')}, notes


def hero_sheets():
    """High-fidelity hero art for Nastavitve → Razvoj → Kakovost slik = Visoka, one entry per hero in data/hero-art.json.
    `strip` is the idle | attack picture every card and portrait uses (SPRITES), `sheet` the frames of tools/art_hero_pack.py
    (one row a sequence) with its index, `states` and `skills` the sequences the game plays, by name. A hero whose pack is not
    committed is left out (its current sprite stays); a stale sheet or a name that is not in the pack stops the build."""
    out, notes = {}, []
    reg = json.loads(read('data/hero-art.json'))['heroes']
    for hid, e in reg.items():
        man_rel = e['manifest']
        stem = pathlib.PurePosixPath(man_rel).stem
        sheet_rel, idx_rel = f'art/exports/characters/{stem}/{stem}-sheet.png', f'art/exports/characters/{stem}/{stem}-sheet.json'
        if not all((root / r).is_file() for r in (man_rel, sheet_rel, idx_rel)):
            notes.append(f'hero art {hid}: pack not committed, the current sprite only'); continue
        man = json.loads(read(man_rel))
        strip_rel = man['runtimeSheet']['path']
        idx = json.loads(read(idx_rel))
        sheet, strip = (root / sheet_rel).read_bytes(), (root / strip_rel).read_bytes()
        sw, sh, _ = png_info(sheet, sheet_rel)
        assert (sw, sh) == (idx['cols'] * idx['frame'], idx['rows'] * idx['frame']), f'{sheet_rel} is {sw}×{sh}, its index says {idx["cols"]}×{idx["rows"]} frames'
        stale = f'{sheet_rel} is out of date: run python3 tools/art_hero_pack.py {man_rel}'
        assert [s['id'] for s in man['sequences']] == list(idx['seqs']), stale
        assert all(len(s['framesBackToFront']) == idx['seqs'][s['id']]['frames'] for s in man['sequences']), stale
        assert png_info(strip, strip_rel)[:2] == (2 * idx['frame'], idx['frame']), f'{strip_rel} must be idle | attack, {2 * idx["frame"]}×{idx["frame"]}'
        states, skills = e.get('states', {}), e.get('skills', {})
        assert states.get('idle'), f'data/hero-art.json: {hid} needs states.idle'
        named = list(states.values()) + [n for ranks in skills.values() for n in ranks]
        missing = [n for n in named if n not in idx['seqs']]
        assert not missing, f'data/hero-art.json: {hid} names {missing}, which {man_rel} does not have'
        uri = lambda b: 'data:image/png;base64,' + base64.b64encode(b).decode('ascii')
        out[hid] = {'strip': uri(strip), 'sheet': uri(sheet), 'frame': idx['frame'], 'cols': idx['cols'], 'rows': idx['rows'], 'seqs': idx['seqs'],
                    'states': states, 'skills': skills, 'status': man.get('status', 'draft')}
        notes.append(f"hero art {hid}: {len(idx['seqs'])} sequences ({', '.join(k for k in ('run', 'win', 'down') if k in states) or 'idle and skills only'}), {(len(sheet) + len(strip)) // 1024} KB, status {man.get('status', 'draft')}")
    return out, notes


def skill_cards():
    """Codex's painted skill cards (art/exports/characters/skill-cards.json, tools/art_skill_cards.py): one WebP per hero
    and skill number, keyed "hero:tier". Missing exports leave that card out (the hand-made SVG stays); a card whose
    master changed since its export is still built in, with a note to export it again."""
    rel = 'art/exports/characters/skill-cards.json'
    if not (root / rel).is_file():
        return {}, [f'skill cards: {rel} missing, the SVG boards only — run python3 tools/art_skill_cards.py']
    out, notes, size = {}, [], 0
    for key, e in json.loads(read(rel)).items():
        if not (root / e['card']).is_file():
            notes.append(f"skill card {key}: {e['card']} missing, left out"); continue
        if (root / e['source']).is_file() and hashlib.sha1((root / e['source']).read_bytes()).hexdigest() != e['sourceSha1']:
            notes.append(f"skill card {key}: its master changed — run python3 tools/art_skill_cards.py")
        raw = (root / e['card']).read_bytes()
        w, h, _ = webp_info(raw, e['card'])
        out[key] = {'skill': e['skill'], 'w': w, 'h': h, 'src': 'data:image/webp;base64,' + base64.b64encode(raw).decode('ascii')}
        size += len(raw)
    notes.append(f'skill cards: {len(out)} paintings, {size // 1024} KB WebP')
    return out, notes


bgdata, bgnotes = background_packs()
cards, cardnotes = skill_cards()
bgdata['cards'] = cards; bgnotes += cardnotes
heroes, heronotes = hero_sheets()
bgdata['heroes'] = heroes; bgnotes += heronotes
template = read('src/index.src.html')
data = {'/*__LEX__*/': base64.b64encode((root / 'data/lexicon.bin').read_bytes()).decode('ascii'),
        '/*__CLUES__*/': read('data/clues.json'), '/*__WORLD__*/': read('data/world.json'), '/*__WORDS__*/': read('data/words.json'), '/*__MEANINGS__*/': read('data/meanings.json'),
        '/*__BGS__*/': json.dumps(bgdata, ensure_ascii=False, separators=(',', ':')),
        '/*__ACH__*/': json.dumps(json.loads(read('data/achievements.json')), ensure_ascii=False, separators=(',', ':'))}
for name, text in data.items():
    assert '</script' not in text, f'{name} would close its <script> tag'

js = read('src/game.js')
for mark, rels in (('/*__LEXICON__*/', ['src/lexicon.js']), ('/*__ART_EXTRA__*/', ['src/art-extra.js', 'src/art-title.js']),
                   ('/*__JOURNEY__*/', ['src/journey.js', 'src/backgrounds.js', 'src/playtest.js', 'src/mobile.js', 'src/credits.js', 'src/report.js', 'src/stats.js', 'src/menu.js', 'src/effects.js', 'src/progression.js', 'src/skills.js', 'src/shrines.js', 'src/save.js', 'src/achievements.js', 'src/title.js'])):
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
