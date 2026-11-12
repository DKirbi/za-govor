"""Pixel art for the title screen: the "Za govor!" wordmark, its ribbon and a layered dusk landscape.

    python3 tools/art_title.py            # -> src/art-title.js (inlined by build.py)
    python3 tools/art_title.py --preview  # also writes test-output/title-*.png

Needs Pillow. Same rules as tools/art_extra.py: hard-edged primitives, no anti-aliasing,
dark outlines, dithered sky bands. The scene is 480 x 160 and is shown at a whole-number
scale (src/title.js picks it), split into layers so parts of it can move:

  sky       sky bands, sunset glow, moon, faint stars          static
  twinkle   two sets of bright stars                           fade in and out
  clouds    thin dusk clouds, tiles horizontally               drift left
  far       the Julian Alps with Triglav in the middle         static
  mist      a dithered band of fog over the lake, tiles        drifts right
  mid       forest ridges, the lake, Blejski otok-like island  static
  shimmer   light on the water, two frames                     flickers
  near      meadow, path, kozolec, lipa, the kres (bonfire)    static
  flame     the kres fire, three frames of 12 x 14             flickers
  logo      "Za govor!" with a lect heart as the dot           hovers
  ribbon    "besedna igra s slovanskimi bogovi"                hovers with the logo
"""
import base64, io, json, math, pathlib, random, sys
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 480, 160
OL = '#1a0f14'


def rgb(h, a=255):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def layer():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def uri(im, colors=None):
    b = io.BytesIO()
    if colors and im.mode == 'RGB': im = im.quantize(colors, method=Image.Quantize.MEDIANCUT)
    im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def outline(im, col=OL):
    """1 px dark edge around every opaque pixel (4-neighbourhood), like the sprites."""
    src = im.load(); out = im.copy(); o = out.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            if src[x, y][3]: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and src[xx, yy][3] > 128:
                    o[x, y] = rgb(col); break
    return out


def periodic(x, base, parts, seed):
    """Ridge height at x; every part repeats a whole number of times across W, so layers tile."""
    rnd = random.Random(seed)
    return base - sum(a * (0.5 + 0.5 * math.sin(2 * math.pi * k * x / W + rnd.random() * 6.28)) for k, a in parts)


# ------------------------------------------------------------------ sky
SKY = [(12, '#141836'), (24, '#1b2047'), (36, '#262a5a'), (48, '#363469'), (60, '#4c3c78'), (70, '#674782'),
       (80, '#895187'), (88, '#ad5f84'), (95, '#cf727d'), (101, '#e78d73'), (108, '#f5ac72'), (H, '#f8c58a')]
SUN = (250, 104)  # sets behind Triglav, so the peaks stand dark against the glow


def sky_band(y):
    for y1, col in SKY:
        if y < y1: return col
    return SKY[-1][1]


def paint_sky():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im); y0 = 0
    for i, (y1, col) in enumerate(SKY):
        d.rectangle([0, y0, W, y1], fill=rgb(col))
        if i:  # dither the seam like the battle backgrounds
            prev = rgb(SKY[i - 1][1])
            for x in range(0, W, 2): d.point((x + (y0 % 2), y0), fill=prev)
            for x in range(0, W, 4): d.point((x, y0 + 1), fill=prev)
        y0 = y1
    # sunset glow behind the mountains, right of Triglav: rings of lighter colour, dithered at the edge
    px = im.load()
    for y in range(56, H):
        for x in range(SUN[0] - 170, SUN[0] + 170):
            r = math.hypot((x - SUN[0]) / 2.6, (y - SUN[1]) * 1.25)
            for rr, col in ((12, '#fff0c0'), (22, '#fde0a2'), (34, '#f9c98c'), (48, '#eea67f')):
                if r < rr or (r < rr + 3 and (x + y) % 2 == 0):
                    px[x % W, y] = rgb(col)[:3]
                    break
    rnd = random.Random(4)
    for _ in range(150):  # faint stars, thinner towards the glow
        x, y = rnd.randrange(W), int(rnd.random() ** 1.6 * 64)
        if y < 70: px[x, y] = rgb(rnd.choice(['#5a5f93', '#7a7fb0', '#9da3cf']))[:3]
    # moon: a thin crescent, top right
    mx, my, r = 432, 20, 7
    for y in range(my - r, my + r + 1):
        for x in range(mx - r, mx + r + 1):
            if (x - mx) ** 2 + (y - my) ** 2 <= r * r and (x - mx - 4) ** 2 + (y - my + 2) ** 2 > (r - 1) ** 2:
                px[x, y] = rgb('#fff1c2')[:3]
    for x, y in ((427, 15), (428, 23), (430, 26)): px[x, y] = rgb('#e8d39a')[:3]
    return im


def paint_twinkle(seed):
    im, d = layer(); rnd = random.Random(seed)
    for _ in range(16):
        x, y = rnd.randrange(150, W - 8), rnd.randrange(3, 56)
        c = rgb(rnd.choice(['#ffffff', '#fff3c8', '#d8e0ff']))
        im.putpixel((x, y), c)
        if rnd.random() < .25:  # a few bigger ones get a faint cross
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): im.putpixel((x + dx, y + dy), c[:3] + (80,))
    return im


def paint_clouds():
    im, d = layer(); rnd = random.Random(12)
    for cx, cy, ln in ((30, 46, 70), (150, 34, 54), (250, 52, 90), (380, 40, 64), (440, 60, 44), (90, 64, 40)):
        for i in range(ln):
            x = (cx + i) % W
            t = i / ln; th = 1 + int(3 * math.sin(math.pi * t) + rnd.random() * 1.3)
            for k in range(th):
                y = cy - k
                col = '#f2a48c' if k == 0 else '#b9708f' if k < th - 1 else '#7a5590'
                im.putpixel((x, y), rgb(col, 235))
            if rnd.random() < .12: im.putpixel((x, cy + 1), rgb('#f6c39a', 200))
    return im


# ------------------------------------------------------------------ mountains
TRI = 240  # Triglav, centred under the logo


def far_profile(x):
    y = periodic(x, 98, ((2, 10), (5, 6), (11, 3), (23, 1.5)), 31)
    # Triglav: main head, with the two smaller heads on its shoulders
    for cx, top, half in ((TRI, 58, 50), (TRI - 22, 69, 24), (TRI + 24, 71, 24)):
        y = min(y, top + abs(x - cx) * (42 / half))
    for cx, top, half in ((112, 80, 40), (150, 85, 30), (336, 82, 44), (392, 79, 40), (440, 86, 30), (40, 82, 44)):
        y = min(y, top + abs(x - cx) * (22 / half))
    return y


def paint_far():
    im, d = layer(); prof = [far_profile(x) for x in range(W)]
    for x in range(W):
        top = int(prof[x]); slope = prof[(x + 1) % W] - prof[x - 1]
        lit = slope < 0  # west-facing slopes catch the glow
        for y in range(top, 106):
            depth = y - top
            if depth < 7 + (top < 76) * 5 and top < 90:
                col = '#f4cfd6' if lit else '#c4a3c6'
                if depth >= 4 and (x + y) % 2: col = '#8a74a6' if not lit else '#c99bb8'
            else:
                col = '#6a5a92' if lit else '#54497e'
                if y > 92: col = '#4d4478'
            im.putpixel((x, y), rgb(col))
        im.putpixel((x, top), rgb('#ffeef0' if lit else '#d8bcd8'))
    # Triglav's north face: a darker wall of rock with snow gullies
    for y in range(66, 100):
        for x in range(TRI + 3, TRI + 3 + (y - 60)):
            if im.getpixel((x, y))[3] and y > prof[x] + 6 and (x * 3 + y * 5) % 9: im.putpixel((x, y), rgb('#463d70'))
        if y % 5 == 0: im.putpixel((TRI + (y - 58) // 2, y), rgb('#b8a6cc'))
    for y in (55, 56, 57): im.putpixel((TRI, y), rgb('#d6d0e0'))  # Aljažev stolp
    im.putpixel((TRI, 54), rgb('#a8382f'))
    return im


def paint_mist():
    im, d = layer(); rnd = random.Random(3)
    for y in range(99, 106):
        a = 110 - abs(y - 102) * 26
        for x in range(W):
            wave = math.sin(2 * math.pi * 4 * x / W) + 0.6 * math.sin(2 * math.pi * 9 * x / W + 1)
            if (x + y) % 2 == 0 and wave > 0.3 + abs(y - 102) * 0.3 and rnd.random() > .2:
                im.putpixel((x, y), rgb('#f3d2d4', a))
    return im


# ------------------------------------------------------------------ the valley
LAKE_TOP, LAKE_BOT = 104, 119
ISLAND = 186


def pine(d, x, y, h, col, dark):
    for i in range(h):
        w = (i * 3) // h + (i % 3 == 2)
        d.line([(x - w, y - h + i), (x + w, y - h + i)], fill=rgb(col if i % 3 else dark))


def paint_mid():
    im, d = layer()
    # lake: reflects the sky upside down, bright at the far shore, dark close by
    lake = [('#e9a07c', 2), ('#d48280', 2), ('#b06a86', 3), ('#87578a', 3), ('#64477e', 3), ('#4b3c70', 3)]
    y = LAKE_TOP
    for col, n in lake:
        d.rectangle([0, y, W, y + n - 1], fill=rgb(col)); y += n
    # forest ridges either side; the middle stays open so Triglav and the lake show
    for x in range(W):
        left = 90 + 10 * max(0, (x - 40) / 120) ** 1.4 if x < 180 else 200
        right = 92 + 10 * max(0, (360 - x) / 100) ** 1.4 if x > 270 else 200
        top = int(min(left, right) + 2 * math.sin(x / 7) + math.sin(x / 2.3))
        for yy in range(min(top, 106), 106): im.putpixel((x, yy), rgb('#2f3352' if yy < top + 3 else '#262a46'))
        # mirrored in the water, broken into lines
        for yy in range(106, min(106 + (106 - top) // 2, LAKE_BOT)):
            if yy % 2 == 0 and (x // 3 + yy) % 5: im.putpixel((x, yy), rgb('#3c3560'))
    for x in list(range(4, 176, 6)) + list(range(276, 478, 6)):
        tops = [yy for yy in range(70, 106) if im.getpixel((x, yy))[3]]
        if tops: pine(d, x + (x * 7) % 3, tops[0] + 1, 6 + (x * 5) % 5, '#2a2f4c', '#22263f')
    # far shore line
    d.line([(0, 105), (W, 105)], fill=rgb('#3a3459'))
    # island with the church
    d.ellipse([ISLAND - 22, 101, ISLAND + 22, 110], fill=rgb('#2a3448'))
    for x in range(ISLAND - 19, ISLAND + 19, 5): d.ellipse([x, 96 + (x % 3), x + 7, 106], fill=rgb('#2e3d4c' if x % 2 else '#33475a'))
    cx = ISLAND + 2
    d.rectangle([cx - 8, 93, cx + 4, 103], fill=rgb('#efe2d6')); d.polygon([(cx - 10, 93), (cx - 2, 88), (cx + 6, 93)], fill=rgb('#a8382f'))
    d.rectangle([cx + 5, 84, cx + 9, 103], fill=rgb('#f4e6da')); d.polygon([(cx + 4, 84), (cx + 7, 76), (cx + 10, 84)], fill=rgb('#3a3468'))
    d.rectangle([cx + 6, 87, cx + 7, 89], fill=rgb('#2a2440'))
    for x in (cx - 6, cx - 2): d.rectangle([x, 97, x, 99], fill=rgb('#ffd27a'))
    d.line([(cx + 4, 84), (cx + 4, 103)], fill=rgb('#d9c4c0'))  # lit edge
    d.rectangle([cx - 8, 102, cx + 9, 103], fill=rgb('#9a8a96'))
    # its reflection
    for yy in range(110, 117, 2):
        d.line([(cx - 7, yy), (cx + 8, yy)], fill=rgb('#c99aa6' if yy < 114 else '#8f6c8e'))
    d.line([(cx + 6, 117), (cx + 8, 117)], fill=rgb('#6a5a8a'))
    return im  # the valley sits in the haze: no hard outline


def paint_shimmer(frame):
    im, d = layer(); rnd = random.Random(40 + frame)
    for _ in range(46):
        x = int(rnd.gauss(SUN[0], 34)) % W; y = rnd.randrange(LAKE_TOP + 1, LAKE_BOT - 2)
        ln = rnd.randrange(2, 7)
        d.line([(x, y), (x + ln, y)], fill=rgb(rnd.choice(['#ffe2a8', '#fbd08f', '#fff4d0'])))
    for _ in range(10):  # moonlight
        x = 432 + rnd.randrange(-3, 4); y = rnd.randrange(LAKE_TOP + 4, LAKE_BOT - 1)
        d.line([(x, y), (x + rnd.randrange(1, 4), y)], fill=rgb('#e8e0ff', 200))
    return im


KRES = (240, 123)  # the fire, in the middle under Triglav and the wordmark, where the path ends


def ground_y(x):
    return 118 + 3 * math.sin(2 * math.pi * 2 * x / W + 1.2) + 2 * math.sin(2 * math.pi * 5 * x / W)


def paint_near():
    im, d = layer(); rnd = random.Random(21)
    bands = [(4, '#4f5a3f'), (6, '#3f4a37'), (10, '#323d31'), (14, '#28322a'), (99, '#1e2622')]
    for x in range(W):
        g = int(ground_y(x))
        im.putpixel((x, g), rgb('#7c7a4a' if x > 200 else '#5f6a46'))  # rim lit by the sunset
        for y in range(g + 1, H):
            depth = y - g
            for lim, col in bands:
                if depth < lim: break
            if depth in (4, 6, 10, 14) and (x + y) % 2: col = bands[[4, 6, 10, 14].index(depth)][1]
            im.putpixel((x, y), rgb(col))
    # grass tufts and flowers (yellow, pink, cornflower) along the meadow
    for _ in range(260):
        x = rnd.randrange(W); g = int(ground_y(x)); y = rnd.randrange(g + 2, min(H, g + 30))
        if rnd.random() < .7:
            d.line([(x, y), (x, y - 2)], fill=rgb('#4d5e3e' if y < g + 10 else '#384634'))
            d.point((x + 1, y - 1), fill=rgb('#4d5e3e'))
        else:
            d.point((x, y), fill=rgb(rnd.choice(['#e8c26a', '#d97a9a', '#9db0f0', '#f4ecd8'])))
    # path from the bottom up to the shore, narrowing with distance
    end = KRES[1] + 4
    for y in range(H - 1, end, -1):
        t = (H - y) / (H - end)
        cx = KRES[0] + (1 - t) * (30 + 14 * math.sin(t * 4.2))
        hw = 13 * (1 - t) + 3
        for x in range(int(cx - hw), int(cx + hw) + 1):
            col = '#6c5a4c' if abs(x - cx) < hw - 1.5 else '#4e4038'
            if (x * 7 + y * 3) % 11 == 0: col = '#86705a'
            im.putpixel((x, y), rgb(col))
    paint_kozolec(im, d)
    paint_lipa(im, d, rnd)
    # the kres: logs and stones (the fire is its own layer)
    kx, ky = KRES
    d.ellipse([kx - 10, ky - 1, kx + 10, ky + 3], fill=rgb('#3a2e26'))
    for dx in (-8, -4, 4, 8): d.rectangle([kx + dx - 1, ky, kx + dx + 1, ky + 1], fill=rgb('#7a7068'))
    d.line([(kx - 6, ky + 1), (kx + 5, ky - 3)], fill=rgb('#5a3a26'), width=2)
    d.line([(kx + 6, ky + 1), (kx - 5, ky - 3)], fill=rgb('#6a4630'), width=2)
    # two people sitting by the fire
    for px_, flip in ((kx - 15, 1), (kx + 13, -1)):
        d.rectangle([px_, ky - 5, px_ + 2, ky], fill=rgb('#2a2230')); d.rectangle([px_, ky - 8, px_ + 2, ky - 6], fill=rgb('#3a2c34'))
        d.point((px_ + (2 if flip > 0 else 0), ky - 7), fill=rgb('#e0905a'))
        d.point((px_ + (2 if flip > 0 else 0), ky - 3), fill=rgb('#c77a4a'))
    return im


def paint_kozolec(im, d):
    """A toplar: two hay racks under one roof, seen from the front, on the right of the meadow."""
    x0, x1, base = 368, 446, 132
    roof_top, eave = 86, 106
    posts = [x0 + 2, x0 + 21, x0 + 39, x0 + 57, x1 - 2]
    for px_ in posts: d.rectangle([px_ - 1, eave, px_ + 1, base], fill=rgb('#4a3226'))
    # rungs with hay hanging between them, warm where the sunset reaches
    for y in range(eave + 4, base - 3, 4):
        d.line([(x0, y), (x1, y)], fill=rgb('#5a3c2a'))
        for i in range(len(posts) - 1):
            for x in range(posts[i] + 2, posts[i + 1] - 1):
                if (x + y) % 3: d.point((x, y + 1), fill=rgb('#c9a24a' if (x * 3 + y) % 7 else '#e3c36a'))
                if (x * 5 + y) % 4 == 0: d.point((x, y + 2), fill=rgb('#8a6a34'))
    # roof: dark shingles, the sunset on its left slope
    d.polygon([(x0 - 6, eave), ((x0 + x1) // 2, roof_top), (x1 + 6, eave)], fill=rgb('#3e2a24'))
    mid = (x0 + x1) // 2
    for y in range(roof_top + 3, eave, 3):  # shingle rows, sunlit on the left slope
        t = (y - roof_top) / (eave - roof_top)
        d.line([(int(mid - (mid - x0 + 6) * t) + 1, y), (mid, y)], fill=rgb('#7a4c36'))
        d.line([(mid + 1, y), (int(mid + (x1 + 6 - mid) * t) - 1, y)], fill=rgb('#4a3028'))
    d.line([(x0 - 6, eave), ((x0 + x1) // 2, roof_top)], fill=rgb('#b07a52'))
    d.rectangle([mid - 7, roof_top + 8, mid + 7, eave - 1], fill=rgb('#2c1e1a'))  # loft under the roof, hay stored inside
    for y in range(roof_top + 10, eave - 1, 2): d.line([(mid - 6, y), (mid + 6, y)], fill=rgb('#8a6a34' if y % 4 else '#a8823e'))
    d.line([(x0 - 6, eave), (x1 + 6, eave)], fill=rgb('#2a1c18'))


def paint_lipa(im, d, rnd):
    """A big linden on the left, framing the scene; its crown overhangs the top corner."""
    # trunk and roots
    d.polygon([(44, H), (50, 96), (58, 70), (66, 70), (70, 98), (80, H)], fill=rgb('#2c201c'))
    d.polygon([(64, 74), (68, 98), (76, H), (70, H), (64, 100)], fill=rgb('#4a342a'))  # sunlit side
    d.line([(58, 76), (40, 54)], fill=rgb('#2c201c'), width=4); d.line([(64, 72), (96, 50)], fill=rgb('#2c201c'), width=4)
    d.line([(60, 72), (62, 40)], fill=rgb('#2c201c'), width=3)
    # crown: overlapping blobs, darker inside, lit on the right edge
    blobs = [(-12, -18, 60, 34), (26, -22, 104, 28), (70, -12, 132, 36), (-16, 14, 44, 62), (20, 12, 92, 56),
             (74, 18, 124, 52), (96, -6, 134, 26), (-6, 44, 34, 78), (40, 40, 84, 66)]
    crown = Image.new('L', (W, H), 0); cd = ImageDraw.Draw(crown)
    for x0, y0, x1, y1 in blobs: cd.ellipse([x0, y0, x1, y1], fill=255)
    cm = crown.load()
    edge = [(x, y) for y in range(H) for x in range(1, W - 1) if cm[x, y] and not (cm[x - 1, y] and cm[x + 1, y] and (y == 0 or cm[x, y - 1]) and (y == H - 1 or cm[x, y + 1]))]
    for x, y in edge:  # ragged, leafy outline instead of clean circles
        r = rnd.random()
        if r < .28: cm[x, y] = 0
        elif r < .5:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if 0 <= x + dx < W and 0 <= y + dy < H and rnd.random() < .5: cm[x + dx, y + dy] = 255
    px = im.load()
    for x0, y0, x1, y1 in blobs:  # each clump: dark base, a lighter cap towards the glow, leaf specks
        cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
        for y in range(max(0, y0), min(H, y1 + 1)):
            for x in range(max(0, x0), min(W, x1 + 1)):
                u, v = (x - cx) / rx, (y - cy) / ry
                if u * u + v * v > 1.08 or not cm[x, y]: continue
                lit = u * .7 - v * .7 + rnd.gauss(0, .16) + .12 * math.sin(x * 1.7 + y * .9)  # up and to the right, leafy edges
                col = '#1a2c24' if lit < -.3 else '#22392d' if lit < .25 else '#2d4a37' if lit < .62 else '#3f5f40'
                if lit > .78: col = '#6f7c46' if (x + y) % 2 else '#3f5f40'
                rr = rnd.random()
                if rr < .07: col = '#16261f'
                elif rr < .1 and lit > 0: col = '#4f7048'
                px[x, y] = rgb(col)
    for y in range(H):  # rim light on the edge that faces the sunset
        for x in range(W - 1):
            if cm[x, y] and not cm[x + 1, y] and y < 70: px[x, y] = rgb('#b8a85a'); px[x - 1, y] = rgb('#7f8a4a')
    for _ in range(14):  # linden blossom
        x, y = rnd.randrange(60, 130), rnd.randrange(0, 50)
        if cm[x, y] and px[x, y][:3] != (26, 44, 36): px[x, y] = rgb('#e8dc8a')


def paint_flame(frame):
    im = Image.new('RGBA', (12, 14), (0, 0, 0, 0)); d = ImageDraw.Draw(im); rnd = random.Random(frame * 7 + 1)
    sway = (0, 1, -1)[frame]
    d.polygon([(1, 13), (3 + sway, 4), (6 + sway, 0), (8, 5), (11, 13)], fill=rgb('#e0502a'))
    d.polygon([(3, 13), (5 + sway, 6), (7, 3 + frame), (9, 13)], fill=rgb('#f6a13a'))
    d.polygon([(4, 13), (6 + sway, 8), (8, 13)], fill=rgb('#ffe58a'))
    for _ in range(2): d.point((rnd.randrange(2, 10), rnd.randrange(0, 5)), fill=rgb('#f6a13a'))
    return im


# ------------------------------------------------------------------ wordmark
# Glyphs: '#' = letter, 'h' = the red lect heart that dots the exclamation mark.
GLYPHS = {
    'Z': ['##################'] * 4 + [('.' * (13 - i) + '#####').ljust(18, '.') for i in range(14)] + ['##################'] * 4,
    'a': ['.....######.####', '...#############', '..##############', '.#####....######', '.####......#####',
          '####........####', '####........####', '####........####', '####........####', '####........####',
          '####........####', '.####......#####', '.#####....######', '..##############', '...#############',
          '.....######.####'],
    'g': ['.....######.####', '...#############', '..##############', '.#####....######', '.####......#####',
          '####........####', '####........####', '####........####', '####........####', '####........####',
          '.####......#####', '.#####....######', '..##############', '...#############', '.....######.####',
          '............####', '####........####', '.####......####.', '.##############.', '..############..',
          '....########....'],
    'o': ['.....######.....', '...##########...', '..############..', '.#####....#####.', '.####......####.',
          '####........####', '####........####', '####........####', '####........####', '####........####',
          '####........####', '.####......####.', '.#####....#####.', '..############..', '...##########...',
          '.....######.....'],
    'v': ['####........####', '####........####', '####........####', '.####......####.', '.####......####.',
          '.####......####.', '..####....####..', '..####....####..', '..####....####..', '...####..####...',
          '...####..####...', '....########....', '....########....', '.....######.....', '.....######.....',
          '......####......'],
    'r': ['####..######.', '####.########', '#######..####', '######.....##', '#####........'] + ['####.........'] * 11,
    '!': ['.#####.', '.#####.', '.#####.', '.#####.', '.#####.', '..####.', '..###..', '..###..', '..###..',
          '..###..', '..###..', '...#...', '.......', '.......', '.......',
          '.hh.hh.', 'hhhhhhh', 'hhhhhhh', '.hhhhh.', '..hhh..', '...h...'],
}
CAP, XH = 22, 16  # cap height and x-height; 'g' hangs 5 below the baseline


def wordmark():
    text, gap, space = 'Za govor!', 2, 9
    widths = [space if c == ' ' else len(GLYPHS[c][0]) for c in text]
    tw = sum(widths) + gap * (len(text) - 1)
    pad, ext = 3, 3  # room for the outline and the 3 px extrusion
    im = Image.new('RGBA', (tw + pad * 2, CAP + 5 + ext + pad * 2), (0, 0, 0, 0))
    mask = Image.new('L', im.size, 0); heart = Image.new('L', im.size, 0)
    x = pad
    for c, w in zip(text, widths):
        if c != ' ':
            g = GLYPHS[c]; top = pad + (CAP - (len(g) if c in 'Z!' else XH))
            for yy, row in enumerate(g):
                for xx, ch in enumerate(row):
                    if ch == '#': mask.putpixel((x + xx, top + yy), 255)
                    elif ch == 'h': heart.putpixel((x + xx, top + yy), 255)
        x += w + gap
    m, hm = mask.load(), heart.load(); px = im.load(); w, h = im.size
    solid = lambda x, y: 0 <= x < w and 0 <= y < h and (m[x, y] or hm[x, y])
    # extrusion: the letters pushed 3 px down, in dark ember
    for y in range(h - 1, -1, -1):
        for x in range(w):
            if not solid(x, y) and any(solid(x, y - k) for k in range(1, ext + 1)):
                hh = any(0 <= y - k and hm[x, y - k] for k in range(1, ext + 1))
                px[x, y] = rgb('#6e1c1c' if hh else '#8a3a1a' if y % 2 else '#7a301a')
    # faces: banded gold-to-ember gradient, a bright top edge and a darker lower edge
    grad = [(4, '#fff0b0'), (8, '#ffd45e'), (12, '#ffbf3f'), (16, '#f8a032'), (20, '#ec7f2c'), (99, '#d8612a')]
    for y in range(h):
        for x in range(w):
            if m[x, y]:
                gy = y - pad
                col = next(c for lim, c in grad if gy < lim)
                if gy in (4, 8, 12, 16, 20) and (x + y) % 2: col = next(c for lim, c in grad if gy - 1 < lim)
                if not solid(x, y - 1): col = '#fffbe8'
                elif not solid(x, y + 1): col = '#b84a22'
                elif not solid(x - 1, y): col = '#ffe8a0' if gy < 12 else '#f6b04a'
                px[x, y] = rgb(col)
            elif hm[x, y]:
                col = '#e0463a'
                if not solid(x, y - 1) or not solid(x - 1, y): col = '#ff9a7a'
                elif not solid(x, y + 1): col = '#a8282a'
                px[x, y] = rgb(col)
    im = outline(im)
    # second, softer outline ring so the letters stand off any background
    ring = outline(im, '#000000'); rp = ring.load()
    for y in range(h):
        for x in range(w):
            if rp[x, y][3] and not px[x, y][3]: rp[x, y] = (10, 6, 16, 110)
    return ring


# ------------------------------------------------------------------ ribbon with the tagline (own tiny font)
TINY = {
    'b': ['#...', '#...', '###.', '#..#', '#..#', '#..#', '###.'],
    'e': ['....', '....', '.##.', '#..#', '####', '#...', '.###'],
    's': ['....', '....', '.###', '#...', '.##.', '...#', '###.'],
    'd': ['...#', '...#', '.###', '#..#', '#..#', '#..#', '.###'],
    'n': ['....', '....', '###.', '#..#', '#..#', '#..#', '#..#'],
    'a': ['....', '....', '.##.', '...#', '.###', '#..#', '.###'],
    'i': ['#', '.', '#', '#', '#', '#', '#'],
    'g': ['....', '....', '.###', '#..#', '#..#', '#..#', '.###', '...#', '.##.'],
    'r': ['....', '....', '#.##', '##..', '#...', '#...', '#...'],
    'l': ['#.', '#.', '#.', '#.', '#.', '#.', '.#'],
    'o': ['....', '....', '.##.', '#..#', '#..#', '#..#', '.##.'],
    'v': ['.....', '.....', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
    'k': ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'],
    'm': ['.....', '.....', '####.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
    't': ['.#..', '.#..', '###.', '.#..', '.#..', '.#..', '..##'],
    'j': ['..#', '...', '..#', '..#', '..#', '..#', '..#', '#.#', '.#.'],
    'B': ['###.', '#..#', '#..#', '###.', '#..#', '#..#', '###.'],
}
TAGLINE = 'Besedna igra s slovansko mitologijo'


def ribbon():
    widths = [3 if c == ' ' else len(TINY[c][0]) for c in TAGLINE]
    tw = sum(widths) + len(TAGLINE) - 1
    bw, tail = tw + 14, 9
    w, h = bw + tail * 2 + 2, 15
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x0 = tail + 1
    # folded tails behind the band, with a notch
    for side in (0, 1):
        sx = 1 if side == 0 else w - tail - 1
        d.rectangle([sx, 4, sx + tail, 12], fill=rgb('#b8865a'))
        nx = sx if side == 0 else sx + tail
        d.polygon([(nx, 4), (nx + (4 if side == 0 else -4), 8), (nx, 12)], fill=(0, 0, 0, 0))
        fx = x0 if side == 0 else x0 + bw - 3
        d.rectangle([fx, 10, fx + 2, 12], fill=rgb('#7a5236'))  # fold shadow
    # the band: parchment with a lit top and darker bottom
    d.rectangle([x0, 1, x0 + bw - 1, 10], fill=rgb('#f2deb0'))
    d.line([(x0, 1), (x0 + bw - 1, 1)], fill=rgb('#fff4d6'))
    d.line([(x0, 10), (x0 + bw - 1, 10)], fill=rgb('#d4b07c')); d.line([(x0, 9), (x0 + bw - 1, 9)], fill=rgb('#e6c994'))
    for x in (x0 + 3, x0 + bw - 4): d.rectangle([x, 4, x + 1, 6], fill=rgb('#b8322f'))  # folk dots
    x = x0 + 7
    for c, cw in zip(TAGLINE, widths):
        if c != ' ':
            for yy, row in enumerate(TINY[c]):
                for xx, ch in enumerate(row):
                    if ch == '#' and 2 + yy < h: im.putpixel((x + xx, 2 + yy), rgb('#4a2a1c'))
        x += cw + 1
    return outline(im)


# ------------------------------------------------------------------ output
def build():
    logo, rib = wordmark(), ribbon()
    flames = Image.new('RGBA', (36, 14), (0, 0, 0, 0))
    for i in range(3): flames.alpha_composite(paint_flame(i), (i * 12, 0))
    sh = Image.new('RGBA', (W * 2, H), (0, 0, 0, 0)); sh.alpha_composite(paint_shimmer(0), (0, 0)); sh.alpha_composite(paint_shimmer(1), (W, 0))
    layers = {'sky': paint_sky(), 'twA': paint_twinkle(1), 'twB': paint_twinkle(2), 'clouds': paint_clouds(), 'far': paint_far(),
              'mist': paint_mist(), 'mid': paint_mid(), 'shimmer': sh, 'near': paint_near()}
    meta = {'w': W, 'h': H, 'logo': [logo.width, logo.height], 'ribbon': [rib.width, rib.height], 'kres': list(KRES),
            'logoY': 13, 'ribbonY': 13 + logo.height - 2}
    return layers, logo, rib, flames, meta


def main():
    layers, logo, rib, flames, meta = build()
    art = {k: uri(v, 48 if k == 'sky' else None) for k, v in layers.items()}
    art.update(logo=uri(logo), ribbon=uri(rib), flame=uri(flames))
    js = ('// Generated by tools/art_title.py — do not edit by hand.\n'
          f'const TITLE_ART = {json.dumps(art)};\n'
          f'const TITLE_META = {json.dumps(meta)};\n')
    (ROOT / 'src/art-title.js').write_text(js, encoding='utf-8')
    print('wrote src/art-title.js,', len(js) // 1024, 'KB')
    if '--preview' in sys.argv:
        out = ROOT / 'test-output'; out.mkdir(exist_ok=True)
        im = layers['sky'].convert('RGBA')
        for k in ('twA', 'twB', 'clouds', 'far', 'mist', 'mid'): im.alpha_composite(layers[k])
        im.alpha_composite(layers['shimmer'].crop((0, 0, W, H)))
        im.alpha_composite(layers['near']); im.alpha_composite(flames.crop((0, 0, 12, 14)), (KRES[0] - 6, KRES[1] - 13))
        im.alpha_composite(logo, ((W - logo.width) // 2, meta['logoY']))
        im.alpha_composite(rib, ((W - rib.width) // 2, meta['ribbonY']))
        im.resize((W * 3, H * 3), Image.NEAREST).save(out / 'title-scene.png')
        print('wrote', out / 'title-scene.png')


if __name__ == '__main__':
    main()
