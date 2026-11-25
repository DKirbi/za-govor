#!/usr/bin/env python3
"""Game layers of Codex's folk-art parallax studies (docs/art-benchmarks/<region>-parallax/layers/*.png).

Codex's studies are painted on mixed canvases (1672x941, 2172x724, 546x693 ...) and placed in their preview.html with
CSS boxes in % of a 16:9 scene. This tool draws nothing new. For each region it takes the study PNGs as they are and:

  1. resizes each layer into its preview box on one 16:9 canvas of VIEW_H pixels (the scene the game fits to its own),
     the way the preview's CSS does (fill = stretched into the box, cover = cropped to the box's shape, auto = width only);
  2. trims fully transparent rows above and below, and the sides of layers that do not tile;
  3. for a layer that must tile but is not seamless at its left and right edges (decided 25 Nov 2026 by the Game
     Director), makes the tile Codex's layer followed by its mirror image, so the two joins meet themselves;
  4. for a landmark that tiles (`period`), pads the tile with transparency, so the landmark comes round again only after
     that many view widths instead of every box width;
  5. for the walking lane (`stand`), adds its mirror image below it, so the lane can rise to the actors' feet in battle
     and still reach the bottom of the scene without showing its top edge twice;
  6. writes a lossy WebP (alpha stays lossless) to art/exports/environments/<pack>/<layer>.webp, the pack manifest
     art/manifests/<pack>.json and the layers' placement (x, y) into data/backgrounds.json, keeping every other value
     there (speeds, pan, drift, stand, front) as tuned by hand.

The PNG masters stay where Codex delivered them and are never changed. Only the WebP exports go into the build.

  python3 tools/art_folk_parallax.py               all regions
  python3 tools/art_folk_parallax.py gozd peca      some regions (by pack key)
  python3 tools/art_folk_parallax.py --check        report exports that are missing or older than their masters
  python3 tools/art_folk_parallax.py --composite    also write a check composite of each pack to /tmp/<pack>.png
"""
import hashlib, io, json, pathlib, sys
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIEW_H = 560
VIEW_W = round(VIEW_H * 16 / 9)   # 996
QUALITY = 80
LANE_EXT = 0.35   # how far below itself the lane's mirror image reaches, in view heights (the most a lane rises in battle)

# Per region, back to front: layer id, study file, preview box (left, top, width, height in % of the 16:9 scene;
# height None = auto, from the picture's own shape), fit, and options:
#   tile: the layer tiles horizontally in the game (it scrolls with the walk at its speed);
#   (a tiling layer that reaches its left or right edge is mirrored: the tile is the layer and its mirror image;
#    mirror: False keeps one that only grazes it)
#   period: a tiling landmark comes round only every `period` view widths (transparent padding); layers that must
#           stay together (a town and its reflection) share speed and period;
#   stand: the walking lane (rises to the actors' feet; mirrored below);
#   front: in front of the actors (low and at the edges only).
# Boxes reproduce Codex's layered-composite-preview.png: full-scene cutouts at 1:1 (100 %), other canvases at the box
# of preview.html (whose wider boxes for full-scene layers only make room for its pan). Speeds: data/backgrounds.json.
STUDIES = {
    'gozd': {
        'study': 'trnovski-gozd', 'name': 'Trnovski gozd — ljudska poslikava (Codex)',
        'layers': [   # all eight are full-scene 1672x941 cutouts aligned to each other: 1:1, as layered-composite-preview.png
            ('sky', 'sky.png', (0, 0, 100, 100), 'fill', {}),
            ('moon', 'moon.png', (0, 0, 100, 100), 'fill', {}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-karst-ridge', 'distant-karst-ridge.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('doline-forest', 'doline-forest.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('framing-trees', 'framing-trees.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('grass-lane', 'foreground-grass-lane.png', (0, 0, 100, 100), 'fill', {'tile': True, 'stand': True}),
            ('near-rocks-grass', 'near-foreground-rocks-grass.png', (0, 0, 100, 100), 'fill', {'tile': True, 'front': True}),
        ],
    },
    'ptuj': {
        'study': 'ptuj', 'name': 'Ptuj — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (-8, -8, 116, 116), 'fill', {'tile': True}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-hills', 'distant-hills.png', (0, 14.9, 100, 59.2), 'fill', {'tile': True}),
            ('castle-hill', 'castle-hill.png', (0, 11.7, 100, 38.5), 'fill', {'tile': True, 'period': 2}),
            ('town', 'town.png', (0, 11.2, 100, 38.3), 'fill', {'tile': True, 'period': 2}),
            ('drava-water', 'drava-water.png', (-35, 33.5, 170, 36.1), 'fill', {'tile': True}),
            ('glints', 'water-reflections.png', (-35, 33.5, 170, 36.1), 'fill', {'tile': True}),   # glints on the water, not a mirror image
            ('road', 'foreground-road.png', (-68, -36.7, 170, 136), 'fill', {'tile': True, 'stand': True}),
            ('oak', 'foreground-oak.png', (0, 0, 92.8, 72.3), 'fill', {'tile': True, 'period': 2.5}),
        ],
    },
    'peca': {
        'study': 'peca', 'name': 'Peca — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (-8, -8, 116, 116), 'fill', {'tile': True}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-hills', 'distant-hills.png', (0, 7.4, 100, 59.2), 'fill', {'tile': True}),
            ('mountain', 'peca-mountain.png', (0, 10.6, 100, 51), 'fill', {'tile': True, 'period': 2}),
            ('forest', 'midground-forest.png', (0, 20.7, 100, 51), 'fill', {'tile': True}),
            ('cave-rock', 'cave-rock.png', (36.5, 29.8, 63.5, 44.6), 'fill', {'tile': True, 'period': 3}),
            ('ground', 'foreground-ground.png', (-35, 31, 170, 80), 'fill', {'tile': True, 'stand': True}),
            ('oak', 'foreground-oak.png', (0, 0, 77.8, 69.1), 'fill', {'tile': True, 'period': 2.5}),
        ],
    },
    'triglav': {
        'study': 'triglav', 'name': 'Triglav — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (0, 0, 100, 100), 'fill', {}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-foothills', 'distant-foothills.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-peaks', 'distant-peaks.png', (0, 4, 100, 55.6), 'fill', {'tile': True, 'period': 2}),
            ('zlatorog', 'zlatorog-ibex.png', (20, 31, 5.5, None), 'fill', {'tile': True, 'period': 2, 'mirror': False}),   # a hoof tip at the edge, not a cut
            ('midground-forest', 'midground-forest.png', (-22, -8, 144, 85), 'fill', {'tile': True}),
            ('grass-lane', 'foreground-grass-lane.png', (-48, -14, 196, 116), 'fill', {'tile': True, 'stand': True}),
            ('spruces', 'foreground-spruces.png', (0, -40, 100, 100), 'fill', {'tile': True, 'period': 1.5}),
            ('flowers', 'foreground-flowers.png', (-15, 23, 130, 77), 'fill', {'tile': True, 'front': True}),
        ],
    },
    'bled': {
        'study': 'bled', 'name': 'Bled — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (0, 0, 100, 100), 'fill', {}),
            ('clouds', 'clouds.png', (-15, -1, 130, None), 'fill', {'tile': True}),
            ('distant-mountains', 'distant-mountains.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('forested-shoreline', 'forested-shoreline.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('castle-cliff', 'castle-cliff.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2.5}),
            ('lake-water', 'lake-water.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('reflections', 'water-reflections.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2.5}),   # castle and island mirrored
            ('island-church', 'island-church.png', (22.5, 4, 70, None), 'fill', {'tile': True, 'period': 2.5}),   # in front of the lake, as Codex's preview
            ('grass-lane', 'foreground-grass-lane.png', (0, 4, 100, 100), 'fill', {'tile': True, 'stand': True}),
        ],
    },
    'ljubljanica': {
        'study': 'ljubljanica', 'name': 'Ljubljanica — ljudska poslikava (Codex)',
        'layers': [
            ('sky-hills', 'distant-sky-hills.png', (-8, -8, 116, 116), 'cover', {'tile': True}),
            ('clouds', 'clouds.png', (-8, -15, 128, None), 'fill', {'tile': True}),
            ('town-castle', 'town-castle.png', (-5, 7, 110, None), 'fill', {'tile': True, 'period': 2}),
            ('river', 'river-surface.png', (-35, 69, 145, 22), 'fill', {'tile': True}),
            ('glints', 'water-reflections.png', (-14, 52, 140, 42), 'fill', {'tile': True}),   # glints on the river
            ('bridge', 'bridge.png', (-5, 46, 110, 35), 'fill', {'tile': True, 'period': 2}),
            ('road', 'foreground-road.png', (-68, None, 170, None), 'fill', {'tile': True, 'stand': True}),
        ],
    },
}


def master(study, f):
    return ROOT / 'docs/art-benchmarks' / f'{study}-parallax' / 'layers' / f


def sha1(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()


def place(im, box, fit):
    """the layer resized into its preview box: (picture, x, y) in view pixels"""
    left, top, width, height = box
    bw = width / 100 * VIEW_W
    if height is None:
        bh = bw * im.height / im.width
    else:
        bh = height / 100 * VIEW_H
    w, h = max(1, round(bw)), max(1, round(bh))
    if fit == 'cover':
        im = ImageOps.fit(im, (w, h), Image.LANCZOS)
    else:
        im = im.resize((w, h), Image.LANCZOS)
    return im, round(left / 100 * VIEW_W), (VIEW_H - h) if top is None else round(top / 100 * VIEW_H)


def trim(im, x, y, sides):
    """drop fully transparent rows (and columns, for a layer that does not tile)"""
    a = im.getchannel('A')
    bb = a.point(lambda v: 255 if v > 2 else 0).getbbox()
    if not bb:
        return im, x, y
    l, t, r, b = bb
    if not sides:
        l, r = 0, im.width
    return im.crop((l, t, r, b)), x + l, y + t


def touches_edge(im):
    """(left, right): whether Codex's picture is cut by its left or right side: its paint starts within 3 % of the width from that
    side and, there, already stands at least 15 % as tall as its tallest column (a cut-off row of houses or ridge, not
    a tapering tree top or cloud). A tile of such a layer would show the cut where it meets the next one."""
    a = im.getchannel('A').point(lambda v: 255 if v > 8 else 0)
    w, h = im.size
    cov = [a.crop((x, 0, x + 1, h)).histogram()[255] / h for x in range(w)]
    top = max(cov) or 1
    cols = [x for x, c in enumerate(cov) if c > 0]
    if not cols:
        return False, False
    l, r = cols[0], cols[-1]
    near = round(w * 0.03)
    left = l <= near and max(cov[l:l + 6]) / top >= 0.15
    right = w - 1 - r <= near and max(cov[r - 5:r + 1]) / top >= 0.15
    return left, right


def side_trim(im, x, left, right):
    """cut the transparent margin (and 2 px of soft edge) off a cut side, so a mirror image meets paint to paint"""
    a = im.getchannel('A').point(lambda v: 255 if v > 8 else 0)
    l, _, r, _ = a.getbbox()
    l = l + 2 if left else 0
    r = r - 2 if right else im.width
    return im.crop((l, 0, r, im.height)), x + l


def mirrored_tile(im, left, right):
    """the layer and its mirror image, joined on the cut side(s): both cut = layer | mirror (two joins); only the left
    cut = mirror | layer (the tile's outer sides stay clear, so it can still be padded); only the right = layer | mirror.
    Returns the tile and how far left of the layer the tile starts."""
    out = Image.new('RGBA', (im.width * 2, im.height))
    if left and not right:
        out.paste(ImageOps.mirror(im), (0, 0)); out.paste(im, (im.width, 0))
        return out, im.width
    out.paste(im, (0, 0)); out.paste(ImageOps.mirror(im), (im.width, 0))
    return out, 0


def padded(im, period):
    w = max(im.width, round(VIEW_W * period))
    out = Image.new('RGBA', (w, im.height))
    out.paste(im, (0, 0))
    return out


def lane_below(im):
    ext = min(im.height, round(VIEW_H * LANE_EXT))
    out = Image.new('RGBA', (im.width, im.height + ext))
    out.paste(im, (0, 0)); out.paste(ImageOps.flip(im).crop((0, 0, im.width, ext)), (0, im.height))
    return out


def build(key, composite=False):
    cfg = STUDIES[key]
    pack = f'{key}-ljudska'
    out_dir = ROOT / 'art/exports/environments' / pack
    out_dir.mkdir(parents=True, exist_ok=True)
    layers, total, comp = [], 0, Image.new('RGBA', (VIEW_W, VIEW_H), (0, 0, 0, 255))
    for order, (lid, f, box, fit, opt) in enumerate(cfg['layers'], 1):
        src = master(cfg['study'], f)
        im = Image.open(src).convert('RGBA')
        cut_l, cut_r = touches_edge(im)   # decided on the master, before resizing
        im, x, y = place(im, box, fit)
        if composite:
            comp.alpha_composite(im.crop((max(0, -x), max(0, -y), min(im.width, VIEW_W - x), min(im.height, VIEW_H - y))), (max(0, x), max(0, y)))
        im, x, y = trim(im, x, y, sides=not opt.get('tile'))
        # A tiling layer whose picture is cut by its left or right side is not seamless (Codex's layers are cut-outs of
        # one scene): its tile joins it to its mirror image on the cut side(s). A layer clear of both sides tiles as it
        # is. A landmark (`period`) is padded with transparency on the right, unless it is cut on both sides.
        mirror = bool(opt.get('tile')) and (cut_l or cut_r) and opt.get('mirror', True)
        if mirror:
            im, x = side_trim(im, x, cut_l, cut_r)
            im, back = mirrored_tile(im, cut_l, cut_r)
            x -= back
        period = opt.get('period') if opt.get('tile') and not (mirror and cut_l and cut_r) else None
        if opt.get('period') and not period:
            print(f'  {lid}: cut on both sides, mirrored and not padded')
        if period:
            im = padded(im, period)
        if opt.get('stand'):
            im = lane_below(im)
        opaque = im.getchannel('A').getextrema()[0] == 255
        buf = io.BytesIO()
        (im.convert('RGB') if opaque else im).save(buf, 'WEBP', quality=QUALITY, method=6)
        rel = f'art/exports/environments/{pack}/{lid}.webp'
        (ROOT / rel).write_bytes(buf.getvalue())
        total += buf.tell()
        layers.append({'id': lid, 'order': order, 'file': rel, 'width': im.width, 'height': im.height, 'x': x, 'y': y,
                       'alpha': not opaque, 'tileX': bool(opt.get('tile')), 'role': 'foreground' if opt.get('front') else 'background',
                       'source': str(src.relative_to(ROOT)), 'sourceSha1': sha1(src), 'previewBox': list(box), 'fit': fit,
                       **({'mirrored': 'both sides' if cut_l and cut_r else 'left side' if cut_l else 'right side'} if mirror else {}), **({'period': period} if period else {}),
                       **({'laneMirroredBelow': True} if opt.get('stand') else {})})
    man = {'pack': cfg['name'], 'version': '0.1.0', 'status': 'review',
           'approval': 'OPEN — Game Director review required (first in-game draft, 25 Nov 2026)',
           'canvas': {'width': VIEW_W, 'height': VIEW_H, 'aspectRatio': '16:9',
                      'basis': f'The 16:9 scene of Codex\'s docs/art-benchmarks/{cfg["study"]}-parallax/preview.html at {VIEW_H} px'},
           'madeBy': 'tools/art_folk_parallax.py from Codex\'s study PNGs (unchanged masters); WebP q%d' % QUALITY,
           'layers': layers}
    (ROOT / 'art/manifests' / f'{pack}.json').write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if composite:
        comp.convert('RGB').save(f'/tmp/{pack}.png')
    # placement into data/backgrounds.json, keeping every hand-tuned value
    dp = ROOT / 'data/backgrounds.json'
    data = json.loads(dp.read_text(encoding='utf-8'))
    pc = data['packs'].setdefault(pack, {})
    pc.update({'manifest': f'art/manifests/{pack}.json', 'name': pc.get('name', cfg['name']), 'hideRoad': True,
               'view': {'width': VIEW_W, 'height': VIEW_H}})
    tl = pc.setdefault('layers', {})
    for L in layers:
        t = tl.setdefault(L['id'], {})
        t['x'], t['y'] = L['x'], L['y']
    pc['layers'] = {L['id']: tl[L['id']] for L in layers}
    dp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{pack}: {len(layers)} layers, {total / 1024:.0f} KB WebP')
    return total


def check():
    bad = 0
    for key, cfg in STUDIES.items():
        mp = ROOT / 'art/manifests' / f'{key}-ljudska.json'
        if not mp.is_file():
            print(f'{mp.relative_to(ROOT)}: missing'); bad += 1; continue
        man = json.loads(mp.read_text(encoding='utf-8'))
        for L in man['layers']:
            if not (ROOT / L['file']).is_file() or sha1(ROOT / L['source']) != L['sourceSha1']:
                print(f"{L['file']}: missing or older than {L['source']}"); bad += 1
    print('ok' if not bad else f'{bad} to rebuild: python3 tools/art_folk_parallax.py')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--check' in sys.argv:
        check()
    keys = args or list(STUDIES)
    print(f'{sum(build(k, "--composite" in sys.argv) for k in keys) / 1048576:.2f} MB WebP in all')
