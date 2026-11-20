"""Ptuj at sunset, Claude's version: the layered parallax pack ptuj-vecer, variant C of the Ptuj background test
(data/backgrounds.json → tests.ptuj; a preview only, not in the split). Variant B is the Codex pack art/manifests/ptuj.json.

    python3 tools/art_ptuj_parallax.py            # -> art/exports/environments/ptuj-vecer/*.png, art/manifests/ptuj-vecer.json and
                                                  #    docs/art-benchmarks/ptuj-background/ptuj-vecer-composite.png
    python3 tools/art_ptuj_parallax.py --preview  # also test-output/ptuj-vecer-*.png (composite, tile repeats)

Needs Pillow. Drawn at the Game Director's request of 17 Nov 2026 after GPT's reference sheet
(docs/art-benchmarks/ptuj-background/ptuj-parallax-preview.png): its subject, palette and layer split, laid out for
the game's scene. Every layer is hard-edged pixel art on one 640 × 165 canvas (two screen pixels per art pixel in a
desktop battle, the same as the heroes). Tiling layers are drawn with wrap-around, so their edges join. No bridge
(docs/art-benchmarks/ptuj-battle-depth/README.md).

Canvas rows, from where the game stands its actors (measured 17 Nov: enemies' feet at 62–70 % of the scene height,
heroes' at 75–87 %): sky and castle above, the town's embankment ends at y 76 (HORIZON), the Drava down to 95 (BANK),
a riverside meadow where the enemies stand, and from 118 (PATH) the cobbled promenade where the heroes stand.
This script is the source of the art: change it and run it again rather than editing the PNGs.
"""
import json, math, pathlib, random, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT, MANIFEST = ROOT / 'art/exports/environments/ptuj-vecer', ROOT / 'art/manifests/ptuj-vecer.json'
PREVIEW = ROOT / 'docs/art-benchmarks/ptuj-background/ptuj-vecer-composite.png'   # the flattened preview, 2×, for review only
W, H = 640, 165
TOWN, HORIZON, BANK, PATH = 72, 76, 95, 118
SUN = (232, 47)
VERSION = '1.0.0'


def rgb(h):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def mix(a, b, t):
    a, b = rgb(a) if isinstance(a, str) else a, rgb(b) if isinstance(b, str) else b
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


class L:
    """A layer: width, height, where it sits on the canvas (y), and whether it wraps (tiles) sideways."""
    def __init__(self, w, h, y=0, tile=False, opaque=False):
        self.w, self.h, self.y, self.tile = w, h, y, tile
        self.im = Image.new('RGBA', (w, h), (0, 0, 0, 255) if opaque else (0, 0, 0, 0)); self.p = self.im.load()

    def put(self, x, y, c):   # canvas coordinates
        y -= self.y
        if self.tile: x %= self.w
        if 0 <= x < self.w and 0 <= y < self.h: self.p[x, y] = rgb(c) if isinstance(c, str) else c

    def get(self, x, y):
        y -= self.y
        if self.tile: x %= self.w
        return self.p[x, y] if 0 <= x < self.w and 0 <= y < self.h else (0, 0, 0, 0)

    def hline(self, x0, x1, y, c):
        for x in range(x0, x1 + 1): self.put(x, y, c)

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1): self.hline(x0, x1, y, c)


def wave(x, per, ph):   # 0..1, periodic in x
    return 0.5 + 0.5 * math.sin(2 * math.pi * x / per + ph)


def crown(lay, x, cy, r, lit='#86a44b', mid='#3c6a3d', dark='#21402c', clip=None):
    """A round tree crown lit from the upper left."""
    for yy in range(int(cy - r), int(cy + r) + 1):
        for xx in range(int(x - r), int(x + r) + 1):
            if (xx - x) ** 2 + (yy - cy) ** 2 > r * r or (clip and clip(xx, yy)): continue
            d = (xx - x) + (yy - cy)
            lay.put(xx, yy, lit if d < -r * .6 else dark if d > r * .7 else mid)


# ------------------------------------------------------------------ sky (does not tile: pans slowly with the walk)
SKY = [(0, '#2a1f5c'), (8, '#3a2972'), (15, '#523488'), (22, '#6e3e94'), (28, '#8f4796'), (33, '#b0518f'),
       (38, '#cd5d86'), (42, '#e46e7b'), (46, '#f3866c'), (50, '#f99d60'), (54, '#fbb35f'), (58, '#fcc66a')]


def sky():
    s = L(W, H, opaque=True); rnd = random.Random(3)
    for y in range(H):
        i = max(k for k, (y0, _) in enumerate(SKY) if y >= y0); col, prev, into = SKY[i][1], SKY[i - 1][1] if i else SKY[0][1], y - SKY[i][0]
        for x in range(W):
            s.put(x, y, prev if (into == 0 and (x + y) % 2 == 0) or (into == 1 and x % 4 == y % 4) else col)   # dithered band edges
    for _ in range(14):   # the first stars in the dark top
        x, y = rnd.randrange(W), rnd.randrange(1, 14); s.put(x, y, '#7c6cb4' if rnd.random() < .7 else '#a99ad6')
    cx, cy = SUN
    for y in range(cy - 22, cy + 23):   # the glow around the sun
        for x in range(cx - 30, cx + 31):
            d = math.hypot((x - cx) * .8, y - cy)
            if 10.6 < d <= 13.5: s.put(x, y, mix(s.get(x, y), '#ffd27a', .38))
            elif 13.5 < d <= 17 and (x + y) % 2 == 0: s.put(x, y, mix(s.get(x, y), '#ffcf7a', .3))
            elif 17 < d <= 21 and (x + y) % 4 == 0: s.put(x, y, mix(s.get(x, y), '#ffcf7a', .22))
    for y in range(cy - 11, cy + 12):
        for x in range(cx - 11, cx + 12):
            d = math.hypot(x - cx, y - cy)
            s.put(x, y, '#fff6cf') if d <= 7 else s.put(x, y, '#ffe9a2') if d <= 9.2 else s.put(x, y, '#ffd47c') if d <= 10.6 else None
    for x0, y, n, c in ((30, 36, 70, '#f39a90'), (300, 33, 96, '#ee8a8c'), (110, 45, 56, '#fcc27a'), (430, 44, 84, '#fbbd76'),
                        (540, 38, 60, '#f2938a'), (176, 51, 30, '#fdd796')):   # thin evening streaks low in the sky
        for x in range(x0, x0 + n): s.put(x, y, c)
        for x in range(x0 + 6, x0 + n - 8, 2): s.put(x, y + 1, c)
    return s


# ------------------------------------------------------------------ clouds (tile 320, drift)
def clouds():
    c = L(320, 40, 0, tile=True); mask = set()
    # (centre x, bottom y, [(dx, dy, half width, half height)]): a flat base and round puffs on top
    shapes = ((70, 22, [(0, -3, 40, 4), (-20, -6, 13, 7), (-3, -9, 15, 9), (16, -6, 12, 7), (31, -4, 8, 4)]),
              (200, 12, [(0, -2, 28, 3), (-10, -4, 9, 5), (5, -6, 10, 6), (18, -3, 6, 3)]),
              (285, 29, [(0, -2, 17, 3), (-5, -4, 6, 4), (6, -4, 6, 4)]),
              (150, 33, [(0, -1, 36, 2), (-8, -2, 13, 2)]),
              (12, 37, [(0, -1, 24, 2)]))
    for cx, bot, puffs in shapes:
        for dx, dy, rw, rh in puffs:
            for y in range(bot + dy - rh, bot + 1):
                for x in range(cx + dx - rw, cx + dx + rw + 1):
                    if ((x - cx - dx) / rw) ** 2 + ((y - bot - dy) / rh) ** 2 <= 1: mask.add((x % 320, y))
    for x in range(320):   # lit from below by the low sun: rim, glow, body, shaded top
        ys = sorted(y for (xx, y) in mask if xx == x)
        runs, start = [], None
        for i, y in enumerate(ys):
            if start is None: start = y
            if i == len(ys) - 1 or ys[i + 1] != y + 1: runs.append((start, y)); start = None
        for top, bot in runs:
            for y in range(top, bot + 1):
                up = bot - y
                c.put(x, y + 1, '#ffc98e' if up == 0 else '#f6a0a6' if up <= 2 else '#d97ea0' if up <= 4 else '#a6609c' if y > top else '#82498e')
    return c


# ------------------------------------------------------------------ distant hills (tile 640): Slovenske gorice with vine rows
def hills():
    h = L(W, 50, 38, tile=True)
    far = [(W, 1.2, 9), (160, 4.0, 5), (64, 0.7, 2)]
    near = [(W, 3.1, 8), (320, 0.4, 6), (80, 2.2, 3), (32, 5.0, 1)]
    for x in range(W):
        yf = 56 - sum(a * wave(x, p, ph) for p, ph, a in far)
        yn = 63 - sum(a * wave(x, p, ph) for p, ph, a in near)
        for y in range(int(yf), 88): h.put(x, y, '#7d5ca7' if y > yf + 1 else '#a685c4')
        for y in range(int(yn), 88):
            c = '#5b4491' if y > yn + 1 else '#8b6bb5'
            if y > yn + 3 and (y - int(yn)) % 4 == 0 and (x // 3 + y) % 5 < 3: c = '#4f3b86'   # vineyard rows
            h.put(x, y, c)
    return h


# ------------------------------------------------------------------ castle hill with Ptuj Castle (tile 640, the castle once)
def castle_hill():
    k = L(W, 76, 0, tile=True); rnd = random.Random(21); cx, half = 340, 150
    top = {x: 30 + 44 * (abs(x - cx) / half) ** 1.5 for x in range(cx - half, cx + half + 1)}
    for x, y0 in top.items():   # wooded slope: dark base, then lit tree crowns
        for y in range(int(y0), 76): k.put(x, y, '#284a33')
    for _ in range(800):
        x = rnd.randrange(cx - half, cx + half); y0 = top[x]
        if y0 > 73: continue
        crown(k, x, rnd.uniform(y0, 76), rnd.choice((2, 2, 3, 3, 4)), mid='#3c6a3d' if rnd.random() < .7 else '#46763f',
              lit='#86a44b', clip=lambda xx, yy: yy < top.get(xx, 999) - 2)
    # the castle: terrace wall, the long palace with two rows of windows, the lower west wing, the tower with a flag
    k.rect(298, 27, 390, 31, '#b99a7e'); k.hline(298, 390, 27, '#d8bc9c'); k.hline(298, 390, 31, '#8e7060')
    for x in range(300, 390, 6): k.put(x, 29, '#9c7e68')
    k.rect(290, 18, 306, 28, '#efdcbc'); k.rect(304, 18, 306, 28, '#d2b896')
    for y in range(14, 18):
        inset = 18 - y
        for x in range(289 + inset, 308 - inset): k.put(x, y, '#d85a3c' if x < 298 else '#b8402e')
    k.hline(289, 307, 18, '#7a2622'); k.rect(293, 21, 294, 23, '#563a5a'); k.rect(299, 21, 300, 23, '#ffd56b')
    k.rect(306, 14, 380, 28, '#f6e4c4'); k.rect(377, 14, 380, 28, '#d8bf9c')
    for row in (17, 22):
        for x in range(310, 375, 5): k.rect(x, row, x + 1, row + 2, '#ffd56b' if rnd.random() < .3 else '#563a5a')
    for y in range(8, 14):   # hipped roof, lit on the sunward (left) side
        inset = (14 - y) * 2
        for x in range(304 + inset, 383 - inset): k.put(x, y, '#e05c3c' if x < 330 + inset else '#c0412f' if x < 368 - inset else '#952f27')
    k.hline(305, 381, 13, '#7a2622')
    k.rect(368, 8, 377, 28, '#f1dcb8'); k.rect(376, 8, 377, 28, '#d3b893')
    for y in (11, 18): k.rect(372, y, 373, y + 2, '#563a5a')
    for y in range(2, 8):   # tower roof and flag
        w = y - 2
        for x in range(372 - w, 373 + w + 1): k.put(x, y, '#c0412f' if x <= 372 else '#952f27')
    k.hline(366, 379, 8, '#7a2622')
    for y in range(0, 2): k.put(372, y, '#4a3030')
    k.rect(373, 0, 376, 1, '#d8382c')
    for x in range(294, 394, 5):   # crowns in front of the terrace foot
        crown(k, x, 33 + (x * 3) % 3, 3 + (x * 7) % 3)
    for i in range(16):   # the lane down to the town
        x = 302 - i * 2 + (4 if (i // 4) % 2 else 0); k.put(x, 36 + i * 2, '#c9a27a'); k.put(x + 1, 36 + i * 2, '#a9845f')
    k.y = 3   # the whole hill sits three rows lower, clear of the top edge; its foot stays hidden behind the town
    return k


# ------------------------------------------------------------------ the old town on the Drava (tile 640, landmarks once)
WALLS = ['#f3dcb2', '#f0c79c', '#e9b5a0', '#f5e3a6', '#e4cdb8', '#f2d0c0', '#efd6a0']
ROOFS = [('#d9573a', '#c63d2e', '#8f2c25'), ('#e46a42', '#cf4a33', '#992f27'), ('#cc4b33', '#b43429', '#7f2622')]
LIT = ((255, 213, 107), (255, 240, 184))


def house(t, x0, w, base, wall_h, roof_h, rnd, back=False):
    wall = rnd.choice(WALLS); hi, mid, lo = rnd.choice(ROOFS)
    if back: wall = mix(wall, '#c9a0b0', .25); hi, mid, lo = mix(hi, '#a0607a', .25), mix(mid, '#a0607a', .25), mix(lo, '#a0607a', .25)
    shade, top = mix(wall, '#7a5068', .22), base - wall_h
    t.rect(x0, top, x0 + w - 1, base, wall); t.rect(x0 + w - 2, top, x0 + w - 1, base, shade)
    for y in range(roof_h):   # roof seen from the river: lit left half, shaded right
        inset = round((roof_h - y) * (w / 2) / roof_h * .9)
        for x in range(x0 - 1 + inset, x0 + w + 1 - inset): t.put(x, top - roof_h + y, hi if x < x0 + w // 2 else mid)
    t.hline(x0 - 1, x0 + w, top, lo)
    for wy in range(top + 3, base - 2, 5):
        for wx in range(x0 + 2, x0 + w - 3, 5):
            lit = rnd.random() < (.12 if back else .32)
            t.rect(wx, wy, wx + 1, wy + 2, '#ffd56b' if lit else mix(wall, '#3a2648', .62))
            if lit and rnd.random() < .5: t.put(wx, wy, '#fff0b8')


def town():
    t = L(W, 60, 16, tile=True); rnd = random.Random(42)
    x = 0
    while x < W:   # back row, a little hazier
        w = min(rnd.randrange(14, 24), W - x); w = W - x if W - x - w < 10 else w
        house(t, x, w, TOWN - 4, rnd.randrange(8, 12), rnd.randrange(4, 6), rnd, back=True); x += w
    x = 0
    while x < W:   # front row, along the embankment
        w = min(rnd.randrange(12, 22), W - x); w = W - x if W - x - w < 10 else w
        if not (244 <= x <= 300 or 458 <= x <= 516):
            house(t, x, w, TOWN, rnd.randrange(7, 11), rnd.randrange(4, 6), rnd)
            if rnd.random() < .22: crown(t, x + w - 1, TOWN - rnd.randrange(4, 6), rnd.randrange(3, 5))
        x += w
    # Minoritski samostan: nave and pointed tower at the foot of the castle hill
    t.rect(252, 60, 284, 72, '#f2e4c8'); t.rect(282, 60, 284, 72, '#d6c4a4')
    for y in range(53, 60):
        inset = (60 - y) // 2
        for x in range(251 + inset, 286 - inset): t.put(x, y, '#c9472f' if x < 268 else '#9a3328')
    for x in range(256, 281, 6): t.rect(x, 63, x + 1, 68, '#5a3a5a')
    t.rect(285, 40, 292, 72, '#f6e8cc'); t.rect(291, 40, 292, 72, '#d6c4a4'); t.rect(288, 44, 289, 47, '#5a3a5a'); t.rect(288, 52, 289, 55, '#5a3a5a')
    for y in range(29, 40):
        w = (y - 29) // 3
        for x in range(288 - w, 290 + w): t.put(x, y, '#8a2f2a' if x > 288 else '#b8402e')
    # Mestni stolp with its onion dome, and the church of St George beside it
    t.rect(466, 38, 476, 72, '#efe0c4'); t.rect(475, 38, 476, 72, '#d2bf9e')
    t.rect(469, 42, 473, 46, '#f8f2e2'); t.put(471, 44, '#3a2a40'); t.put(472, 43, '#3a2a40')
    t.rect(469, 50, 470, 54, '#4a3050'); t.rect(472, 50, 473, 54, '#4a3050')
    t.hline(465, 477, 38, '#b89a7c')
    for y, half in ((37, 3), (36, 5), (35, 6), (34, 7), (33, 7), (32, 6), (31, 5), (30, 3), (29, 2), (28, 1), (27, 1)):
        for x in range(471 - half, 472 + half): t.put(x, y, '#6fb09a' if x < 469 else '#3f7f6f' if x < 474 else '#2a5a50')
    t.rect(470, 24, 472, 26, '#3f7f6f'); t.put(471, 23, '#2a5a50')
    for y in range(18, 23): t.put(471, y, '#2a3a3a')
    t.put(471, 17, '#ffd56b')
    t.rect(478, 57, 510, 72, '#f0e0c2'); t.rect(508, 57, 510, 72, '#d2bf9e')
    for y in range(46, 57):
        inset = 57 - y
        for x in range(477 + inset // 2, 512 - inset // 2): t.put(x, y, '#c9472f' if x < 494 else '#9a3328')
    for x in range(482, 506, 6): t.rect(x, 60, x + 1, 68, '#5a3a5a'); t.put(x, 60, mix('#5a3a5a', '#f0e0c2', .5))
    for x in range(W):   # the embankment wall along the river
        for y, c in ((72, '#b08a70'), (73, '#9a7660'), (74, '#8f6f5f'), (75, '#5f4648')): t.put(x, y, c)
        if x % 9 == 0: t.put(x, 74, '#7a5c52')
    return t


# ------------------------------------------------------------------ the Drava (tile 160, opaque) and what it mirrors
WATER = [(0, '#5b4fa1'), (3, '#46499d'), (7, '#3a4697'), (12, '#30418f'), (16, '#283a84')]
WATER_H = BANK - HORIZON


def water_band(ry):
    return WATER[max(k for k, (y0, _) in enumerate(WATER) if ry >= y0)]


def water():
    wt = L(160, WATER_H, HORIZON, tile=True, opaque=True); rnd = random.Random(5)
    for ry in range(WATER_H):
        y0, col = water_band(ry); i = WATER.index((y0, col)); prev = WATER[i - 1][1] if i else col
        for x in range(160): wt.put(x, HORIZON + ry, prev if ry == y0 and i and (x + ry) % 2 == 0 else col)
    for _ in range(30):
        x, ry = rnd.randrange(160), rnd.randrange(1, WATER_H); n = rnd.randrange(2, 4 + ry // 5)
        c = rnd.choice(['#5268b8', '#5268b8', '#7088d0', '#4658a8']) if rnd.random() > .08 else '#c87e94'
        for k in range(n): wt.put(x + k, HORIZON + ry, c)
    return wt


def reflections(tw):
    """The town upside down on the water, broken by ripples; lit windows become warm streaks. Same tile and speed as the town."""
    r = L(W, WATER_H, HORIZON, tile=True)
    for ry in range(WATER_H):
        if ry % 3 == 2: continue
        sy = TOWN - 1 - int(ry * 1.3)   # mirrored at the foot of the embankment, a little stretched
        shift, water_col = (0, 1, 0, -1)[ry % 4], water_band(ry)[1]
        for x in range(W):
            c = tw.get((x // 2) * 2 + shift, sy)
            if not c[3]: continue
            if c[:3] in LIT: r.put(x, HORIZON + ry, mix(c, water_col, .2 + ry * .025))
            elif ry < 11: r.put(x, HORIZON + ry, mix(c, water_col, .58 + ry * .03))
    return r


def sun_glint():
    """The sun's road on the water. It stays under the sun, so it pans with the sky, not with the water."""
    g = L(W, WATER_H, HORIZON); rnd = random.Random(8); cx = SUN[0]
    for ry in range(0, WATER_H, 2):
        half = 3 + ry * .6
        for _ in range(1 + ry // 5):
            x = cx + rnd.randint(-int(half), int(half)); n = rnd.randrange(2, 5 + ry // 5)
            c = '#fff6cf' if abs(x - cx) < half * .35 else '#ffe9a2' if abs(x - cx) < half * .7 else '#fbc06a'
            for k in range(n): g.put(x + k, HORIZON + ry, c)
    return g


# ------------------------------------------------------------------ the near bank: a riverside meadow and the cobbled promenade (tile 192)
def road():
    top = BANK - 6
    r = L(192, H - top, top, tile=True); rnd = random.Random(17)
    for x in range(192):   # the meadow, its uneven edge against the water, lighter towards the promenade
        edge = BANK + (0, 1, 1, 0, -1, 0, 1, 2)[x % 8] - (1 if x % 23 == 0 else 0)
        for y in range(edge, PATH):
            c = '#6f9f45' if y == edge else '#3f7234' if y < BANK + 4 else '#4a7f38' if y < BANK + 13 else '#56893c'
            if (x * 3 + y * 7) % 11 == 0: c = '#3a6a32' if y < BANK + 11 else '#4a7f38'
            r.put(x, y, c)
    for _ in range(26):   # reeds at the water's edge
        x = rnd.randrange(192); n = rnd.randrange(2, 7)
        for k in range(n): r.put(x, BANK - k + 1, '#3f7234' if k < n - 1 else '#94b04a')
    for _ in range(30):   # small flowers in the grass
        x, y = rnd.randrange(192), rnd.randrange(BANK + 3, PATH - 1); r.put(x, y, rnd.choice(['#e04a3a', '#f2c84a', '#f6f0e0', '#b48ad6']))
    for px in range(6, 120, 28):   # a stretch of wooden fence along the water, behind everyone
        r.rect(px, BANK - 4, px + 1, BANK + 6, '#7a5032'); r.put(px, BANK - 4, '#b07a4a')
    r.hline(6, 119, BANK - 2, '#b8834e'); r.hline(6, 119, BANK - 1, '#9a6a42'); r.hline(6, 119, BANK + 2, '#8a5a38')
    for cx, cy in ((146, BANK + 3), (160, BANK + 1), (174, BANK + 4)):   # a flowering bush
        for yy in range(cy - 5, cy + 5):
            for xx in range(cx - 8, cx + 9):
                if ((xx - cx) / 8) ** 2 + ((yy - cy) / 5) ** 2 <= 1: r.put(xx, yy, '#3c6a3d' if (xx + yy) % 3 else '#2e5634')
    for _ in range(16):
        x, y = rnd.randrange(140, 182), rnd.randrange(BANK - 3, BANK + 7)
        if r.get(x, y)[3]: r.put(x, y, rnd.choice(['#e04a3a', '#f2c84a', '#f6f0e0', '#e04a3a']))
    for x in range(192):   # the promenade's edge: a curb with grass growing over it here and there
        r.put(x, PATH, '#4a7f38' if (x * 5) % 13 < 4 else '#6a4c3a'); r.put(x, PATH + 1, '#9a7454'); r.put(x, PATH + 2, '#86603f')
    r.rect(0, PATH + 3, 191, H - 1, '#97704f')   # mortar under the stones (the rounded corners show it)
    y, row = PATH + 3, 0
    for hgt in (3, 4, 4, 5, 5, 6, 6, 7, 7):   # cobbles, larger towards the viewer, every other row offset
        if y >= H: break
        x, end, stones = (row % 2) * 4, 192 + (row % 2) * 4, []
        while x < end:
            w = rnd.randrange(6, 10) + hgt // 2
            if end - (x + w) < 5: w = end - x
            stones.append((x, w)); x += w
        for sx, w in stones:   # calm, close colours: the heroes stand on this and must read clearly against it
            c = rnd.choice(['#b88f6c', '#b48a66', '#bc936f', '#ae8462', '#b68c68']); lit = rnd.random() < .35
            for yy in range(y, min(H, y + hgt)):
                for xx in range(sx + 1, sx + w):
                    if yy in (y, y + hgt - 1) and xx in (sx + 1, sx + w - 1): continue   # rounded stones: mortar in the corners
                    r.put(xx, yy, '#c6a07c' if lit and yy == y and xx < sx + w - 2 else '#a47c5c' if yy == y + hgt - 1 else c)
            for yy in range(y, min(H, y + hgt)): r.put(sx, yy, '#97704f')
            if rnd.random() < .06: r.put(sx, y + hgt // 2, '#5f8a3e'); r.put(sx, y + hgt // 2 - 1, '#4a7a38')
        if y + hgt < H: r.hline(0, 191, y + hgt, '#97704f')
        y += hgt + 1; row += 1
    return r


# ------------------------------------------------------------------ foreground: a few quiet tufts at the front edge (tile 240)
def foreground():
    f = L(240, 22, H - 22, tile=True); rnd = random.Random(29)
    for cx in (18, 92, 150, 214):
        for root in (cx - 4, cx + 3):
            for _ in range(rnd.randrange(5, 9)):   # blades fanning from a root, all below the heroes' feet
                hgt = rnd.randrange(5, 12 if cx != 92 else 15); lean = rnd.uniform(-2.2, 2.2)
                for k in range(hgt):
                    f.put(root + round(lean * (k / hgt) ** 1.5 * 3), H - 1 - k, '#2a5229' if k < hgt * .4 else '#3f6e34' if k < hgt - 2 else '#5f8f42')
        if rnd.random() < .8:
            for _ in range(rnd.randrange(1, 4)): f.put(cx + rnd.randrange(-5, 6), H - rnd.randrange(6, 12), rnd.choice(['#c0503f', '#d0a848', '#9a6ab4']))
        if rnd.random() < .6:
            sx = cx + rnd.randrange(-9, 10); f.rect(sx, H - 3, sx + 3, H - 1, '#8a7a6c'); f.hline(sx, sx + 2, H - 3, '#a89888')
    return f


# ------------------------------------------------------------------ the pack: files, manifest, checks, previews
def seam(layer):
    """Colour step across the wrap compared with the steps between neighbouring columns inside the tile: the wrap's step
    divided by the 95th percentile of the inner steps. At most 1 means the join is no harder than an ordinary edge in the art."""
    px = layer.im.load(); diff = lambda a, b: sum(abs(px[a, y][i] - px[b, y][i]) for y in range(layer.h) for i in range(4))
    inner = sorted(diff(x, x + 1) for x in range(layer.w - 1))
    return round(diff(layer.w - 1, 0) / max(1, inner[int(len(inner) * .95)]), 2)


def build():
    tw = town()
    layers = [  # back to front
        ('sky', sky(), 'background', 'Sunset sky, the sun low on the left, the first stars; pans slowly with the walk.'),
        ('clouds', clouds(), 'background', 'Clouds lit from below; drift slowly.'),
        ('distant-hills', hills(), 'background', 'Distant hills with vine rows.'),
        ('castle-hill', castle_hill(), 'background', 'Wooded castle hill with Ptuj Castle: palace, west wing, tower with a flag.'),
        ('town', tw, 'background', 'Old town on the Drava: two rows of houses, Minoritski samostan, Mestni stolp, the church of St George, the embankment.'),
        ('drava-water', water(), 'background', 'The Drava reflecting the evening sky.'),
        ('reflections', reflections(tw), 'background', 'The town mirrored on the water; keeps the town\'s tile and speed.'),
        ('sun-glint', sun_glint(), 'background', 'The sun\'s road on the water; pans with the sky.'),
        ('road-tile', road(), 'ground', 'Riverside meadow with a fence stretch and a flowering bush (the enemies stand here), then the cobbled promenade (the heroes stand here).'),
        ('foreground', foreground(), 'foreground', 'A few quiet tufts, flowers and stones at the front edge; below every actor\'s feet, static in battle.'),
    ]
    OUT.mkdir(parents=True, exist_ok=True); MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob('*.png'): old.unlink()
    entries = []
    for order, (lid, lay, role, note) in enumerate(layers, 1):
        path = OUT / f'{lid}.png'; lay.im.save(path, optimize=True)
        e = {'id': lid, 'order': order, 'file': str(path.relative_to(ROOT)), 'format': 'PNG', 'width': lay.w, 'height': lay.h,
             'colorMode': 'RGBA', 'alpha': lay.im.getchannel('A').getextrema()[0] < 255, 'designation': 'export, native resolution, no scaling',
             'x': 0, 'y': lay.y, 'tileX': lay.tile, 'role': role, 'note': note}
        if lay.tile: e['seamCheck'] = {'wrapStepVsP95': seam(lay), 'repeatedPreview': 'test-output/ptuj-vecer-tiles.png (3 copies)'}
        entries.append(e)
    manifest = {
        'pack': 'ptuj-vecer', 'name': 'Ptuj — večer ob Dravi', 'version': VERSION, 'status': 'review',
        'creator': 'Claude, generated by tools/art_ptuj_parallax.py at the Game Director\'s request (17 Nov 2026)',
        'gameArea': 'Ptuj (region 1): travel screen and battles; variant C of the Ptuj background test, a preview only (data/backgrounds.json)',
        'reference': 'docs/art-benchmarks/ptuj-background/ptuj-parallax-preview.png (GPT)',
        'preview': 'docs/art-benchmarks/ptuj-background/ptuj-vecer-composite.png (flattened, 2×, review only; the game uses the layers)',
        'source': 'tools/art_ptuj_parallax.py (procedural: the script is the source; run it again instead of editing the PNGs)',
        'canvas': {'width': W, 'height': H},
        'rows': {'townEmbankment': TOWN, 'water': HORIZON, 'meadow': BANK, 'promenade': PATH,
                 'feet': 'enemies at 62–70 % of the scene height (y 102–115), heroes at 75–87 % (y 124–143), measured 17 Nov 2026'},
        'animation': 'clouds drift and the river flows as runtime motion (data/backgrounds.json); no frame animation',
        'layers': entries,
        'openIssues': [
            'No bridge, per docs/art-benchmarks/ptuj-battle-depth/README.md (the reference shows one).',
            'Summer evening as in the reference; the Ptuj region text is Pust in winter and variant A is snowy.',
            'Not approved: status review until the Game Director has seen it in the game.',
        ],
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    composite([(None, lay, None, None) for _, lay, _, _ in layers]).resize((W * 2, H * 2), Image.NEAREST).save(PREVIEW, optimize=True)
    print(f'wrote {len(entries)} layers to {OUT.relative_to(ROOT)} and {MANIFEST.relative_to(ROOT)}')
    for e in entries:
        print(f"  {e['order']:2} {e['id']:14} {e['width']}x{e['height']} y{e['y']:<4} tile={e['tileX']!s:5} alpha={e['alpha']!s:5} "
              f"{(OUT / (e['id'] + '.png')).stat().st_size // 1024} KB" + (f"  seam {e['seamCheck']['wrapStepVsP95']}" if 'seamCheck' in e else ''))
    return layers


def composite(layers):
    """The canvas as a battle shows it: every layer at its place, tiling layers repeated across."""
    im = Image.new('RGBA', (W, H))
    for _, lay, _, _ in layers:
        for dx in range(0, W, lay.w) if lay.tile else (0,):
            im.alpha_composite(lay.im.crop((0, 0, min(lay.w, W - dx), lay.h)), (dx, lay.y))
    return im


def preview(layers):
    out = ROOT / 'test-output'; out.mkdir(exist_ok=True)
    composite(layers).resize((W * 3, H * 3), Image.NEAREST).save(out / 'ptuj-vecer-composite.png')
    tiles = [lay for _, lay, _, _ in layers if lay.tile]
    sheet = Image.new('RGBA', (max(l.w for l in tiles) * 3, sum(l.h + 4 for l in tiles)), (40, 40, 52, 255)); y = 0
    for lay in tiles:
        for i in range(3): sheet.alpha_composite(lay.im, (i * lay.w, y))
        y += lay.h + 4
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(out / 'ptuj-vecer-tiles.png')
    print('previews in test-output/: ptuj-vecer-composite.png, ptuj-vecer-tiles.png')


if __name__ == '__main__':
    built = build()
    if '--preview' in sys.argv: preview(built)
