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
  python3 tools/art_folk_parallax.py --composite    also write a check composite to the system temp folder
"""
import hashlib, io, json, pathlib, sys, tempfile
from PIL import Image, ImageFilter, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIEW_H = 560
VIEW_W = round(VIEW_H * 16 / 9)   # 996
QUALITY = 80
LANE_EXT = 0.35   # how far below itself the lane's mirror image reaches, in view heights (the most a lane rises in battle)
FLOOR_REACH = 8   # how far a grounded slice (`floor`) reaches under the lowest top edge of the lane, in view px
OPAQUE = 160      # alpha from which a pixel counts as paint for `floor`
BASE_BAND = 26    # `floor`: how many rows of the slice's own paint its base continues, mirrored, in view px
BASE_SHADE = (0.92, 0.8)   # `floor`: the base's shade right under the paint, and BASE_FADE px further down
BASE_FADE = 36

# Per region, back to front: layer id, study file, preview box (left, top, width, height in % of the 16:9 scene;
# height None = auto, from the picture's own shape), fit, and options:
#   tile: the layer tiles horizontally in the game (it scrolls with the walk at its speed);
#   (a tiling layer that reaches its left or right edge is mirrored: the tile is the layer and its mirror image;
#    mirror: False keeps one that only grazes it)
#   period: a tiling landmark comes round only every `period` view widths (transparent padding); layers that must
#           stay together (a town and its reflection) share speed and period;
#   stand: the walking lane (rises to the actors' feet; mirrored below);
#   front: in front of the actors (low and at the edges only);
#   wrap: a tiling island with tapered ends: its last `wrap` view px are laid over its first, so the copies overlap
#         instead of leaving a gap between them;
#   rows: (top, bottom) only these view rows of the picture (bottom None = to the end), for a picture that lies at two
#         depths and is cut in two (the same file, two layers);
#   blur: a near layer out of focus: blurred by this radius in view px (premultiplied, so no dark fringe);
#   flip: the picture mirrored left to right (a borrowed or repeated picture that should not look the same);
#   tint: (r, g, b) multipliers grading a borrowed picture to the region's light (moonlight, sunset);
#   study: take the picture from another study (passing trees borrowed from a region with the same woods);
#   floor: the slice stands on the ground (Game Director, 27 Nov 2026: slices floated over the lane with the sky showing
#          under them). In every column whose lowest paint lies in the lower `floor` share of the slice's painted height,
#          a base is painted under that paint, continuing the slice's own painting (`grounded`), down to FLOOR_REACH
#          view px below the lowest top edge of the walking lane. The slice then overlaps the lane in every column at any
#          scroll position, as slices overlap in Codex's own composite.
# Boxes reproduce Codex's layered-composite-preview.png: full-scene cutouts at 1:1 (100 %), other canvases at the box
# of preview.html (whose wider boxes for full-scene layers only make room for its pan).
# Piranske soline, Predjama and Ljubljansko barje had their full-scene cutouts at preview.html's 130 × 100 % boxes, which
# stretched them 1.3 × wide: the sun was an ellipse (Game Director, 27 Nov 2026). They are at 1:1 now, as Trnovski gozd
# and Ljubljanski grad; Barje's overlap (`wrap`) shrank with them, 170 → 131 px. Speeds: data/backgrounds.json.
STUDIES = {
    'gozd': {
        'study': 'trnovski-gozd', 'name': 'Trnovski gozd — ljudska poslikava (Codex)',
        'layers': [   # all eight are full-scene 1672x941 cutouts aligned to each other: 1:1, as layered-composite-preview.png
            ('sky', 'sky.png', (0, 0, 100, 100), 'fill', {}),
            ('moon', 'moon.png', (0, 0, 100, 100), 'fill', {}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-karst-ridge', 'distant-karst-ridge.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('doline-forest', 'doline-forest.png', (0, 0, 100, 100), 'fill', {'tile': True, 'floor': 0.5}),
            ('framing-trees', 'framing-trees.png', (0, 0, 100, 100), 'fill', {'tile': True, 'floor': 0.25}),
            ('grass-lane', 'foreground-grass-lane.png', (0, 0, 100, 100), 'fill', {'tile': True, 'stand': True}),
            ('near-rocks-grass', 'near-foreground-rocks-grass.png', (0, 0, 100, 100), 'fill', {'tile': True, 'front': True}),
            # passing trees, as on Triglav (Game Director, 27 Nov 2026: woods get passing trees). The forest's own edge
            # trees are cut by the picture's sides (mirrored into a double tree, never padded, always on screen), so
            # Triglav's whole fir clumps stand in, mirrored and graded to the moonlight, until Codex paints some
            ('passing-trees', 'foreground-spruces.png', (0, -39.5, 160, 160), 'fill', {'tile': True, 'period': 2.5, 'front': True, 'blur': 5, 'flip': True, 'study': 'triglav', 'tint': (0.5, 0.6, 0.8)}),
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
            ('forest', 'midground-forest.png', (0, 20.7, 100, 51), 'fill', {'tile': True, 'floor': 0.5}),
            ('cave-rock', 'cave-rock.png', (36.5, 29.8, 63.5, 44.6), 'fill', {'tile': True, 'period': 3}),
            ('ground', 'foreground-ground.png', (-35, 31, 170, 80), 'fill', {'tile': True, 'stand': True}),
            ('oak', 'foreground-oak.png', (0, 0, 77.8, 69.1), 'fill', {'tile': True, 'period': 2.5}),
            # passing trees, the same near trees as Triglav's (Game Director, 27 Nov 2026: woods get passing trees): Peca's autumn forest has the same spruces and larches as Triglav, so Triglav's
            # near trees, mirrored, stand in for Peca's own until Codex paints some
            ('passing-trees', 'foreground-spruces.png', (0, -39.5, 160, 160), 'fill', {'tile': True, 'period': 2.5, 'front': True, 'blur': 5, 'flip': True, 'study': 'triglav'}),
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
            ('midground-forest', 'midground-forest.png', (-22, -8, 144, 85), 'fill', {'tile': True, 'floor': 0.5}),
            ('grass-lane', 'foreground-grass-lane.png', (-48, -14, 196, 116), 'fill', {'tile': True, 'stand': True}),
            ('flowers', 'foreground-flowers.png', (-15, 23, 130, 77), 'fill', {'tile': True, 'front': True}),
            # Codex's edge trees, lifted 40 % up the scene, ended in mid-air above the lane and slid fast over the forest
            # (Game Director, 27 Nov 2026). Now they are near trees: 1.6 × as large, their trunks below the scene's bottom
            # edge, blurred (out of focus, close to the eye), in front of the party (and of the flowers: nearer, faster) on the road only (`passing` in
            # data/backgrounds.json), so the party seems to walk through a forest for a moment.
            ('spruces', 'foreground-spruces.png', (0, -39.5, 160, 160), 'fill', {'tile': True, 'period': 2.5, 'front': True, 'blur': 5}),
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
            ('lake-water', 'lake-water.png', (0, 0, 100, 100), 'fill', {'tile': True, 'floor': 0.5}),
            ('reflections', 'water-reflections.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2.5}),   # castle and island mirrored
            ('island-church', 'island-church.png', (22.5, 4, 70, None), 'fill', {'tile': True, 'period': 2.5}),   # in front of the lake, as Codex's preview
            ('grass-lane', 'foreground-grass-lane.png', (0, 4, 100, 100), 'fill', {'tile': True, 'stand': True}),
        ],
    },
    'piran': {
        'study': 'piranske-soline', 'name': 'Piranske soline — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (-2, -2, 104, 104), 'fill', {'tile': True}),
            ('sun', 'setting-sun.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('hills', 'distant-istrian-hills.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            # Codex's water layer is the sea at the horizon and the salt pans in one picture. The sea lies beyond the far
            # shore and the house, the pans in front of them, so it is cut in two along the shore (27 Nov 2026): the sea
            # above view row 247 behind the shore, the pans from row 254 in front of it. Rows 247–253 lie under the
            # shore's opaque strip (245–253) and are not drawn.
            ('sea', 'salt-pan-water.png', (0, 0, 100, 100), 'fill', {'tile': True, 'rows': (0, 247)}),
            ('far-shore', 'salt-pan-far-shore.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('house', 'salt-worker-house.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('water', 'salt-pan-water.png', (0, 0, 100, 100), 'fill', {'tile': True, 'rows': (254, None), 'floor': 0.5}),
            ('embankments', 'salt-pan-embankments.png', (0, 0, 100, 100), 'fill', {'tile': True}),   # not grounded: the water under it is
            ('reflections', 'sunset-reflections.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('grass-lane', 'foreground-grass-lane.png', (-0.5, -0.85, 101, 101), 'fill', {'tile': True, 'stand': True}),
            ('near-grass', 'near-foreground-salt-grass.png', (0, 0, 100, 100), 'fill', {'tile': True, 'front': True}),
        ],
    },
    'predjama': {
        'study': 'predjama', 'name': 'Predjamski grad — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (-2, -2, 104, 104), 'fill', {'tile': True}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('ridge', 'distant-karst-forest.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('castle-cliff', 'castle-cliff.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('stream', 'lokva-stream.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('grass-lane', 'foreground-grass-lane.png', (-0.5, -0.85, 101, 101), 'fill', {'tile': True, 'stand': True}),
            ('near-foreground', 'near-foreground-rocks-grass.png', (0, 0, 100, 100), 'fill', {'tile': True, 'front': True}),
        ],
    },
    'barje': {
        'study': 'barje', 'name': 'Ljubljansko barje — ljudska poslikava (Codex)',
        'layers': [
            ('sky', 'sky.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('ridge', 'distant-wetland-ridge.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('far-meadow', 'far-meadow-transition.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            # an island of water and reeds with tapered ends: tiled as it is, a wedge of the dawn sky showed down to the
            # lane between two copies (27 Nov 2026), so each copy's tapered end overlaps the next one's start
            ('channels', 'wetland-channels-reeds.png', (0, 0, 100, 100), 'fill', {'tile': True, 'wrap': 131, 'floor': 0.5}),
            ('landmarks', 'willows-and-pile-dwellings.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('reflections', 'water-reflections.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('grass-lane', 'foreground-grass-lane.png', (0, 0, 100, 100), 'fill', {'tile': True, 'stand': True}),
            ('near-foreground', 'near-foreground-sedges.png', (0, 0, 100, 100), 'fill', {'tile': True, 'front': True}),
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
    'grad': {
        'study': 'ljubljanski-grad', 'name': 'Ljubljanski grad — ljudska poslikava (Codex)',
        'layers': [   # aligned 1672x941 cutouts; keep the fortress attached to its wooded hill
            ('sky', 'sky.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('clouds', 'clouds.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('distant-basin-hills', 'distant-basin-hills.png', (0, 0, 100, 100), 'fill', {'tile': True}),
            ('ljubljana-old-town', 'ljubljana-old-town.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('castle-hill-and-fortress', 'castle-hill-and-fortress.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2}),
            ('near-foreground-tree-frame', 'near-foreground-tree-frame.png', (0, 0, 100, 100), 'fill', {'tile': True, 'period': 2.5, 'floor': 0.25}),
            ('foreground-grass-lane', 'foreground-grass-lane.png', (0, 0, 100, 100), 'fill', {'tile': True, 'stand': True}),
            ('near-foreground-flowers', 'near-foreground-flowers.png', (0, 0, 100, 100), 'fill', {'tile': True, 'front': True}),
            # passing trees, as on Triglav (Game Director, 27 Nov 2026): the park's oaks are cut by the picture's sides,
            # so Triglav's whole tree clumps stand in, graded to the sunset, until Codex paints some
            ('passing-trees', 'foreground-spruces.png', (0, -39.5, 160, 160), 'fill', {'tile': True, 'period': 2.5, 'front': True, 'blur': 5, 'study': 'triglav', 'tint': (1.0, 0.82, 0.72)}),
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


def lane_low_top(cfg):
    """the lowest top edge of the walking lane in view rows: the most a slice must reach down to meet it in every column"""
    for lid, f, box, fit, opt in cfg['layers']:
        if opt.get('stand'):
            im, x, y = place(Image.open(master(cfg['study'], f)).convert('RGBA'), box, fit)
            a, w, h = im.getchannel('A').load(), im.width, im.height
            tops = [next((r for r in range(h) if a[c, r] > OPAQUE), None) for c in range(w)]
            return y + max(t for t in tops if t is not None)
    return None


def grounded(im, x, y, share, reach):
    """`floor`: a base painted under the slice, down to view row `reach` (see STUDIES). The base continues the slice's
    own paint (Game Director, 27 Nov 2026: "paint proper bases"): its densest band of rows, mirrored downwards, so a
    forest goes on as forest, water as water, reeds as reeds, and a wide hole in it (Triglav's forest has an arch)
    holds the same paint as beside it, cloned; where a slice has no dense band (edge trees), each column's own lowest
    paint mirrored, so a trunk goes on as a trunk. Shaded a little deeper the lower it lies, as the
    ground under trees lies in their shade. Where neither has paint near, the slice's floor colour."""
    h = max(im.height, reach - y + 1)
    if h > im.height:
        big = Image.new('RGBA', (im.width, h)); big.paste(im, (0, 0)); im = big
    a, px, w = im.getchannel('A').load(), im.load(), im.width
    low = [next((r for r in range(im.height - 1, -1, -1) if a[c, r] > OPAQUE), None) for c in range(w)]
    painted = [r for r in low if r is not None]
    if not painted:
        return im
    top = min(next((r for r in range(im.height) if a[c, r] > OPAQUE), im.height) for c in range(w))
    bottom = max(painted)
    sample = sorted((px[c, r][:3] for c in range(0, w, 2) for r in range(max(0, bottom - 14), bottom + 1) if a[c, r] > 200), key=sum)
    if not sample:
        return im
    floor = sample[len(sample) // 2] + (255,)
    edge = bottom - share * (bottom - top)
    cols = [c for c, b in enumerate(low) if b is not None and b >= edge]
    # the densest band: the lowest row painted in at least 92 % of the grounded columns, with BASE_BAND rows above it
    dense = next((r for r in range(bottom, top - 1, -1) if sum(a[c, r] > OPAQUE for c in cols) >= 0.92 * len(cols)), None)
    if dense is not None and dense - BASE_BAND + 1 < top:
        dense = None

    def mirror(base, k, n):   # k rows under `base`, reflected back and forth through the n rows above it (no seam)
        m = k % (2 * n)
        return base - (m if m < n else 2 * n - 1 - m)

    rows = {}

    def cloned(r):   # row r with every hole in its paint filled with the paint beside it, cloned from the shadier side
        if r not in rows:   # (the layer tiles, so the row wraps): a wide hole holds the same forest or water as beside it
            row = [px[c, r] if a[c, r] > OPAQUE else None for c in range(w)]
            start = next((c for c in range(w) if row[c] is not None), None)
            if start is not None:
                out, i = list(row), 0
                while i < w:
                    if row[(start + i) % w] is None:
                        k = i
                        while row[(start + k) % w] is None:
                            k += 1
                        m = 0   # the paint to the right of the hole, and to its left
                        while m < w and row[(start + k + m) % w] is not None:
                            m += 1
                        lm = 0
                        while lm < w and row[(start + i - 1 - lm) % w] is not None:
                            lm += 1
                        right = [row[(start + k + t % m) % w] for t in range(k - i)]
                        left = [row[(start + i - lm + t % lm) % w] for t in range(k - i)]
                        dark = lambda ps: sum(p[0] * 2 + p[1] * 3 + p[2] for p in ps)   # the shadier side: a base lies in shade
                        for t, p in enumerate(right if dark(right) <= dark(left) else left):
                            out[(start + i + t) % w] = p
                        i = k
                    else:
                        i += 1
                row = out
            rows[r] = row if start is not None else None
        return rows[r]
    under = Image.new('RGBA', im.size)
    u = under.load()
    for c in cols:
        b = low[c]
        n = min(BASE_BAND, b - top + 1)
        for r in range(b + 1, reach - y + 1):
            if dense is not None:   # the dense band, mirrored down; holes in it cloned from beside them
                # (a hole above the band takes the band's rows too: the forest's dark base, not a crown at that height)
                row = cloned(dense - (dense - r) % BASE_BAND if r <= dense else mirror(dense, r - dense - 1, BASE_BAND))
                p = row[c] if row else floor
            else:   # edge trees: the column's own paint, mirrored down (a trunk goes on as a trunk)
                src = mirror(b, r - b - 1, n)
                p = px[c, src] if a[c, src] > OPAQUE else ((cloned(src) or [floor] * w)[c])
            f = BASE_SHADE[0] + (BASE_SHADE[1] - BASE_SHADE[0]) * min(1, (r - b) / BASE_FADE)
            u[c, r] = (round(p[0] * f), round(p[1] * f), round(p[2] * f), 255)
    under.alpha_composite(im)   # the slice's own paint (and its soft edge) stays on top of its base
    return under


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
        src = master(opt.get('study', cfg['study']), f)
        im = Image.open(src).convert('RGBA')
        if opt.get('flip'):
            im = ImageOps.mirror(im)
        if opt.get('tint'):   # graded to the region's light: each colour channel multiplied
            r, g, b, al = im.split()
            im = Image.merge('RGBA', [ch.point(lambda v, k=k: min(255, round(v * k))) for ch, k in zip((r, g, b), opt['tint'])] + [al])
        cut_l, cut_r = touches_edge(im)   # decided on the master, before resizing
        im, x, y = place(im, box, fit)
        if opt.get('rows'):   # only these view rows of the picture (a picture that lies at two depths, cut in two)
            r0, r1 = opt['rows'][0], VIEW_H if opt['rows'][1] is None else opt['rows'][1]
            keep, a, b = Image.new('RGBA', im.size), max(0, r0 - y), min(im.height, r1 - y)
            if b > a:
                keep.paste(im.crop((0, a, im.width, b)), (0, a))
            im = keep
        if opt.get('blur'):   # out of focus, close to the eye: blurred with premultiplied alpha (no dark fringe)
            pad = opt['blur'] * 3
            big = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad)); big.paste(im, (pad, pad))
            im = big.convert('RGBa').filter(ImageFilter.GaussianBlur(opt['blur'])).convert('RGBA'); x -= pad; y -= pad
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
        if opt.get('wrap') and opt.get('tile'):   # the picture's last `wrap` px laid over its first: the copies overlap
            ov = opt['wrap']
            tile = im.crop((0, 0, im.width - ov, im.height))
            tile.alpha_composite(im.crop((im.width - ov, 0, im.width, im.height)), (0, 0))
            im = tile
        if opt.get('floor'):   # the slice stands on the ground: a base under it, painted on the finished tile so that it
            im = grounded(im, x, y, opt['floor'], lane_low_top(cfg) + FLOOR_REACH)   # wraps the way the tile repeats
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
                       'source': src.relative_to(ROOT).as_posix(), 'sourceSha1': sha1(src), 'previewBox': list(box), 'fit': fit,
                       **({'mirrored': 'both sides' if cut_l and cut_r else 'left side' if cut_l else 'right side'} if mirror else {}), **({'period': period} if period else {}),
                       **({'laneMirroredBelow': True} if opt.get('stand') else {}), **({'rows': list(opt['rows'])} if opt.get('rows') else {}), **({'wrap': opt['wrap']} if opt.get('wrap') else {}),
                       **({'floor': opt['floor']} if opt.get('floor') else {}), **({'blur': opt['blur']} if opt.get('blur') else {}),
                       **({'flip': True} if opt.get('flip') else {}), **({'study': opt['study']} if opt.get('study') else {}),
                       **({'tint': list(opt['tint'])} if opt.get('tint') else {})})
    mp = ROOT / 'art/manifests' / f'{pack}.json'
    old = json.loads(mp.read_text(encoding='utf-8')) if mp.is_file() else {}
    man = {'pack': cfg['name'], 'version': '0.1.0', 'status': old.get('status', 'review'),
           'approval': old.get('approval', 'OPEN — Game Director review required (first runtime draft, 26 Nov 2026)'),
           'canvas': {'width': VIEW_W, 'height': VIEW_H, 'aspectRatio': '16:9',
                      'basis': f'The 16:9 scene of Codex\'s docs/art-benchmarks/{cfg["study"]}-parallax/preview.html at {VIEW_H} px'},
           'madeBy': 'tools/art_folk_parallax.py from Codex\'s study PNGs (unchanged masters); WebP q%d' % QUALITY,
           'layers': layers}
    (ROOT / 'art/manifests' / f'{pack}.json').write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if composite:
        comp.convert('RGB').save(pathlib.Path(tempfile.gettempdir()) / f'{pack}.png')
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
            if not (ROOT / L['file']).is_file() or sha1(ROOT / L['source'].replace('\\', '/')) != L['sourceSha1']:
                print(f"{L['file']}: missing or older than {L['source']}"); bad += 1
    print('ok' if not bad else f'{bad} to rebuild: python3 tools/art_folk_parallax.py')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--check' in sys.argv:
        check()
    keys = args or list(STUDIES)
    print(f'{sum(build(k, "--composite" in sys.argv) for k in keys) / 1048576:.2f} MB WebP in all')
