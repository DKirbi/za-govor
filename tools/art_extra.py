"""Pixel art for the journey: new heroes, road objects, item icons, backgrounds.

    python3 tools/art_extra.py            # -> src/art-extra.js (inlined by build.py)
    python3 tools/art_extra.py --preview  # also writes test-output/art-*.png

Needs Pillow. Everything is drawn with hard-edged primitives on small grids and gets a
dark outline, to match the sprites already in src/game.js:
  heroes   48x48, two frames side by side (idle | attack), facing right
  levels   48x48, two frames (at rest | chosen): the knowledge-level figures on Nova pot
  objects  48x48 or 32x32, two frames (state A | state B)
  icons    16x16, one frame, drawn as text grids
  backgrounds 384x120, ground from y = 76
"""
import base64, io, json, math, pathlib, random, sys
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
OL = (29, 20, 16, 255)


def rgb(h, a=255):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


class Cv:
    """One frame. Shapes are filled without anti-aliasing; outline() adds the dark edge."""
    def __init__(self, w, h=None):
        self.w, self.h = w, h or w
        self.im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def r(self, x0, y0, x1, y1, c): self.d.rectangle([x0, y0, x1, y1], fill=rgb(c))
    def e(self, x0, y0, x1, y1, c): self.d.ellipse([x0, y0, x1, y1], fill=rgb(c))
    def p(self, pts, c): self.d.polygon(pts, fill=rgb(c))
    def l(self, pts, c, w=1): self.d.line(pts, fill=rgb(c), width=w)
    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h: self.im.putpixel((x, y), rgb(c))
    def dots(self, pts, c):
        for x, y in pts: self.px(x, y, c)

    def outline(self):
        src = self.im.load(); out = self.im.copy(); o = out.load()
        for y in range(self.h):
            for x in range(self.w):
                if src[x, y][3]: continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < self.w and 0 <= yy < self.h and src[xx, yy][3]:
                        o[x, y] = OL; break
        self.im = out; self.d = ImageDraw.Draw(self.im)
        return self


def sheet(frames):
    w, h = frames[0].w, frames[0].h
    im = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames): im.alpha_composite(f.im, (i * w, 0))
    return im


def uri(im, colors=None):
    b = io.BytesIO()
    (im.quantize(colors, method=Image.Quantize.MEDIANCUT) if colors else im).save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


SK, SK2 = '#e9b98f', '#c98f66'
WH, RED, GOLD = '#f2ecdc', '#b8322f', '#e9b93f'


def face(c, cx=21, y=13, eye='#1d1410', cheek='#d9675a'):
    c.r(cx - 4, y, cx - 3, y + 1, eye); c.r(cx + 2, y, cx + 3, y + 1, eye)
    c.px(cx - 5, y + 3, cheek); c.px(cx + 4, y + 3, cheek)


def legs(c, col, boot, y=36, bare=False):
    c.r(16, y, 19, 42, col); c.r(23, y, 26, 42, col)
    c.r(15, 42, 20, 45, SK if bare else boot); c.r(23, 42, 28, 45, SK if bare else boot)


# ------------------------------------------------------------------ heroes
def erazem(f):
    c = Cv(48)
    steel, steel2, tab = '#aeb9c6', '#7d8a9a', '#8f2330'
    # cloak behind
    c.p([(12, 21), (7, 38), (14, 40), (16, 22)], '#3a4660')
    legs(c, steel2, '#4a4038')
    c.r(13, 21, 29, 36, steel)                         # cuirass
    c.r(15, 23, 27, 36, tab); c.r(20, 23, 22, 36, WH)   # tabard with a white pale
    c.r(13, 31, 29, 32, '#4a3220'); c.r(20, 31, 22, 32, GOLD)
    c.e(11, 20, 16, 25, steel2); c.e(26, 20, 31, 25, steel2)   # pauldrons
    # shield arm (left, towards the viewer's left)
    c.r(9, 24, 12, 31, steel)
    c.p([(4, 24), (13, 24), (13, 33), (8, 38), (4, 33)], RED)
    c.r(8, 25, 9, 36, WH); c.r(5, 28, 12, 29, WH)
    # head: open helmet, moustache
    c.e(14, 6, 28, 20, SK)
    c.p([(13, 12), (14, 6), (18, 3), (24, 3), (28, 6), (29, 12), (27, 10), (15, 10)], steel)
    c.r(13, 10, 14, 17, steel2); c.r(28, 10, 29, 17, steel2)
    c.r(20, 2, 22, 4, steel2)
    c.p([(22, 1), (28, 0), (31, 3), (27, 3), (24, 5)], RED)      # plume
    face(c)
    c.r(17, 16, 20, 16, '#5a3a22'); c.r(22, 16, 25, 16, '#5a3a22'); c.px(16, 17, '#5a3a22'); c.px(26, 17, '#5a3a22')
    if f == 0:
        c.r(30, 23, 33, 31, steel); c.r(31, 31, 34, 33, SK)
        c.r(33, 8, 34, 30, '#d5dde3'); c.px(33, 7, '#d5dde3')       # sword upright
        c.r(31, 30, 36, 31, GOLD); c.r(33, 32, 34, 35, '#7a4d2a')
    else:
        c.p([(29, 22), (33, 22), (39, 17), (36, 14)], steel); c.r(37, 13, 40, 16, SK)
        c.l([(39, 14), (46, 5)], '#d5dde3', 2); c.l([(36, 12), (41, 17)], GOLD, 1)
        # the cherries he pelted the besiegers with
        for x, y in ((41, 24), (45, 29), (38, 31), (44, 37)):
            c.r(x, y, x + 1, y + 1, '#d2283a'); c.px(x + 1, y - 1, '#3f8a4f')
    return c.outline()


def klepec(f):
    c = Cv(48)
    shirt, vest, hat = WH, '#7a5634', '#e2c46a'
    legs(c, '#6b5a48', '#6b4426', bare=True)
    c.r(16, 36, 19, 39, '#6b5a48'); c.r(23, 36, 26, 39, '#6b5a48'); c.r(16, 40, 19, 41, SK); c.r(23, 40, 26, 41, SK)
    c.r(13, 21, 29, 36, shirt)
    c.r(13, 21, 17, 34, vest); c.r(25, 21, 29, 34, vest)
    c.r(13, 32, 29, 33, RED)
    c.r(9, 22, 12, 30, shirt); c.r(9, 30, 12, 32, SK)
    c.e(14, 6, 28, 20, SK)
    c.r(14, 8, 15, 14, '#e8c95a'); c.r(27, 8, 28, 14, '#e8c95a'); c.r(16, 7, 26, 8, '#e8c95a')   # blond hair
    c.e(9, 5, 33, 10, hat); c.p([(15, 6), (16, 1), (26, 1), (27, 6)], hat); c.r(15, 5, 27, 5, RED)
    face(c); c.r(19, 17, 23, 17, '#a8402f')
    tree = lambda pts: (c.l(pts, '#6b4426', 3),)
    if f == 0:
        c.r(30, 22, 33, 30, shirt); c.r(31, 30, 34, 32, SK)
        tree([(34, 36), (35, 10)])
        c.e(29, 0, 42, 12, '#4f8a3a'); c.e(32, 2, 39, 8, '#6fae4a')
        c.l([(34, 36), (31, 40)], '#6b4426'); c.l([(34, 36), (37, 41)], '#6b4426'); c.l([(34, 37), (34, 42)], '#6b4426')
    else:
        c.p([(29, 22), (33, 22), (38, 16), (35, 13)], shirt); c.r(36, 12, 39, 15, SK)
        tree([(33, 9), (45, 26)])
        c.e(38, 22, 47, 34, '#4f8a3a'); c.e(40, 25, 45, 30, '#6fae4a')
        c.l([(33, 9), (29, 6)], '#6b4426'); c.l([(33, 9), (33, 4)], '#6b4426')
        c.dots([(37, 38), (42, 40), (45, 37), (40, 43)], '#6fae4a')
    return c.outline()


def vida(f):
    c = Cv(48)
    dress, apron, hair = '#3f6fa8', WH, '#3a2a22'
    c.p([(13, 44), (16, 30), (27, 30), (30, 44)], dress)           # skirt
    c.r(13, 43, 30, 44, '#bfe3f2')
    c.r(18, 31, 25, 42, apron); c.r(18, 39, 25, 39, '#7fb3d6'); c.r(18, 41, 25, 41, '#7fb3d6')
    c.r(17, 45, 20, 46, '#6b4426'); c.r(23, 45, 26, 46, '#6b4426')
    c.r(14, 21, 28, 31, WH); c.r(14, 29, 28, 30, RED)               # blouse, sash
    c.r(19, 21, 23, 24, '#7fb3d6')
    c.p([(13, 8), (15, 4), (27, 4), (30, 9), (31, 26), (27, 24), (27, 12), (15, 12), (15, 24), (12, 26)], hair)   # long hair
    c.e(14, 6, 28, 20, SK)
    c.p([(14, 10), (16, 5), (26, 5), (28, 10), (24, 8), (18, 8)], hair)
    c.r(15, 6, 27, 7, '#d2283a')                                    # red ribbon
    face(c); c.r(20, 17, 22, 17, '#a8402f')
    c.r(10, 22, 13, 30, WH); c.r(10, 30, 13, 32, SK)
    if f == 0:
        c.r(29, 22, 32, 30, WH); c.r(30, 30, 33, 32, SK)
        c.p([(31, 32), (37, 31), (38, 40), (33, 42)], '#f8f6ee'); c.l([(33, 34), (36, 39)], '#cfd8e0')   # the linen she washes
    else:
        c.p([(28, 22), (32, 22), (38, 17), (35, 14)], WH); c.r(36, 13, 39, 16, SK)
        for i, (x, y) in enumerate(((40, 10), (43, 16), (40, 22), (44, 27))):                              # sea foam wave
            c.e(x - 3, y - 2, x + 3, y + 3, '#4f9ad0' if i % 2 else '#7fc3e6'); c.px(x - 1, y - 1, '#f8f6ee'); c.px(x + 1, y, '#f8f6ee')
        c.l([(38, 3), (41, 5), (44, 3)], '#f8f6ee')                                                        # gull
    return c.outline()


def ajda(f):
    c = Cv(48)
    stone, stone2, dress = '#9aa3ad', '#6f7985', '#4f7a5a'
    c.p([(9, 46), (13, 29), (31, 29), (35, 46)], dress)
    c.r(9, 44, 35, 45, '#d9cf9f')
    c.p([(9, 46), (13, 29), (18, 29), (15, 46)], stone2)             # the skirt is already turning to rock
    c.dots([(11, 40), (13, 35), (12, 43)], stone)
    c.r(12, 18, 32, 30, '#e8e2d0'); c.r(12, 28, 32, 29, '#a8761c')
    c.r(20, 18, 24, 22, '#c9a24a')
    c.e(13, 1, 31, 18, SK)
    c.p([(12, 9), (14, 2), (22, 0), (30, 2), (32, 9), (28, 5), (16, 5)], '#e2b84a')    # hair
    c.r(31, 8, 33, 26, '#e2b84a'); c.r(31, 12, 33, 12, '#a8761c'); c.r(31, 17, 33, 17, '#a8761c'); c.r(31, 22, 33, 22, '#a8761c')   # braid
    c.r(16, 3, 17, 4, WH); c.px(16, 2, '#f6e36a'); c.r(19, 2, 20, 3, WH)                   # edelweiss
    face(c, cx=22, y=10); c.r(20, 15, 24, 15, '#a8402f')
    c.p([(13, 4), (13, 16), (17, 17), (16, 8)], stone); c.px(15, 10, stone2)             # one cheek is stone
    c.r(7, 19, 11, 30, stone); c.r(7, 30, 11, 33, stone2)                                 # stone arm
    if f == 0:
        c.r(33, 19, 37, 30, '#e8e2d0'); c.r(34, 30, 38, 33, SK)
    else:
        c.p([(32, 19), (36, 19), (42, 13), (39, 10)], '#e8e2d0'); c.e(38, 6, 45, 13, stone)   # stone fist
        c.px(40, 8, '#c5ccd4')
        for x, y in ((43, 19), (40, 25), (45, 28), (42, 34)):
            c.r(x, y, x + 2, y + 2, stone); c.px(x, y, '#c5ccd4')
    return c.outline()


def krosnjar(f):
    c = Cv(48)
    legs(c, '#56503f', '#3a2a20')
    # the krošnja: a wooden frame on his back, stacked with sieves, spoons and bundles
    c.r(3, 6, 12, 38, '#a8824a'); c.l([(3, 6), (3, 38)], '#6b4426'); c.l([(12, 6), (12, 38)], '#6b4426')
    c.e(2, 2, 13, 11, '#e2c98a'); c.e(4, 4, 11, 9, '#b89a5a')
    c.r(4, 13, 11, 18, '#b8322f'); c.r(4, 20, 11, 25, '#3f6fa8'); c.r(4, 27, 11, 33, '#e9b93f')
    c.l([(13, 14), (15, 4)], '#e2c98a'); c.e(14, 1, 17, 5, '#e2c98a')
    c.r(13, 21, 29, 36, '#6b7f4a'); c.r(13, 31, 29, 32, '#3a2a20')
    c.r(19, 21, 23, 30, WH)
    c.e(14, 6, 28, 20, SK)
    c.e(11, 5, 31, 9, '#2a2530'); c.p([(15, 6), (16, 1), (26, 1), (27, 6)], '#2a2530'); c.r(15, 5, 27, 5, '#3f8a4f')
    face(c); c.r(17, 16, 25, 16, '#8d95a8'); c.r(18, 17, 24, 18, '#c9ced8')
    c.r(9, 22, 12, 30, '#6b7f4a')
    if f == 0:
        c.r(30, 22, 33, 30, '#6b7f4a'); c.r(31, 30, 34, 32, SK); c.l([(35, 20), (35, 45)], '#7a4d2a', 2)
    else:
        c.p([(29, 22), (33, 22), (38, 16), (35, 13)], '#6b7f4a'); c.r(36, 11, 39, 14, SK)
        c.e(38, 5, 45, 12, '#e2c98a'); c.e(40, 7, 43, 10, '#b89a5a')            # holds up a sieve
    return c.outline()


# ------------------------------------------------------------------ knowledge levels (Nova pot)
# One figure per knowledge level, 48x48, two frames: at rest | chosen (the card shows frame 2
# while its level is selected). Letters on slates and pages use a 3x5 pixel font.
GLYPH = {'A': ('.#.', '#.#', '###', '#.#', '#.#'), 'B': ('##.', '#.#', '##.', '#.#', '##.'),
         'C': ('.##', '#..', '#..', '#..', '.##'), 'S': ('.##', '#..', '.#.', '..#', '##.'),
         'Z': ('###', '..#', '.#.', '#..', '###')}


def glyph(c, x, y, ch, col):
    """A letter 3 wide and 5 tall at (x, y); Č Š Ž get their caron in the two rows above."""
    base = {'Č': 'C', 'Š': 'S', 'Ž': 'Z'}.get(ch, ch)
    for j, row in enumerate(GLYPH[base]):
        for i, v in enumerate(row):
            if v == '#': c.px(x + i, y + j, col)
    if base != ch: c.px(x, y - 2, col); c.px(x + 2, y - 2, col); c.px(x + 1, y - 1, col)


def lv_malcek(f):
    """Malček: a little one in a knitted cap with a school slate (ABC, then Č)."""
    c = Cv(48)
    pants, cap, hair, wood, slate = '#3f5f8f', RED, '#7a4a26', '#9a6a3a', '#2f3a36'
    c.r(17, 38, 20, 43, pants); c.r(24, 38, 27, 43, pants)
    c.r(16, 43, 21, 45, '#5a3a22'); c.r(23, 43, 28, 45, '#5a3a22')
    c.r(15, 28, 29, 38, WH); c.r(15, 35, 29, 38, pants)
    c.r(17, 28, 18, 35, RED); c.r(26, 28, 27, 35, RED)                       # braces
    c.e(12, 8, 32, 28, SK)                                                    # a big head
    c.p([(13, 17), (15, 12), (29, 12), (31, 17), (27, 15), (17, 15)], hair)
    c.p([(12, 15), (14, 7), (22, 4), (30, 7), (32, 15)], cap)                # knitted cap
    c.r(12, 13, 32, 15, WH); c.dots([(14, 9), (18, 7), (22, 6), (26, 7), (30, 9)], '#e2665a')
    c.e(19, 0, 25, 5, WH)                                                     # pompom
    face(c, cx=22, y=19)
    if f == 0:
        c.r(20, 24, 23, 24, '#a8402f')
        c.r(11, 29, 14, 35, WH); c.r(11, 35, 14, 37, SK)
        c.r(31, 27, 44, 38, wood); c.r(32, 28, 43, 37, slate)                 # slate held low
        glyph(c, 33, 30, 'A', WH); glyph(c, 37, 30, 'B', WH); glyph(c, 41, 30, 'C', WH)
        c.r(29, 30, 32, 33, SK)
    else:
        c.r(20, 23, 23, 25, '#7a2a22'); c.r(21, 25, 22, 25, '#e2665a')         # open, happy mouth
        c.p([(13, 29), (16, 29), (11, 22), (8, 23)], WH); c.r(7, 19, 10, 22, SK)   # waving
        c.p([(28, 29), (31, 29), (36, 21), (33, 20)], WH); c.r(33, 17, 36, 20, SK)
        c.r(31, 6, 44, 17, wood); c.r(32, 7, 43, 16, slate)                   # slate held up high: Č!
        glyph(c, 36, 10, 'Č', GOLD)
        c.dots([(45, 2), (44, 3), (46, 3), (45, 4), (5, 9), (4, 10), (6, 10), (5, 11), (38, 21)], GOLD)
    return c.outline()


def lv_ucenjak(f):
    """Učenjak: a scholar in a dark gown and cap, round spectacles, book and quill."""
    c = Cv(48)
    robe, robe2, cap, hair, rim, lens = '#2c3550', '#1f2640', '#1d1d24', '#c9c4b8', '#3a2a1a', '#cfe3ea'
    c.p([(12, 46), (15, 21), (29, 21), (32, 46)], robe)
    c.r(21, 23, 23, 46, GOLD); c.r(12, 45, 32, 46, robe2)
    c.e(14, 6, 30, 21, SK)
    c.r(14, 9, 15, 16, hair); c.r(29, 9, 30, 16, hair)
    c.p([(16, 16), (28, 16), (27, 21), (22, 25), (17, 21)], hair)             # beard
    c.r(19, 17, 25, 17, '#8a6a50')
    for x0 in (16, 24):                                                        # round spectacles
        c.r(x0, 11, x0 + 4, 14, rim); c.r(x0 + 1, 12, x0 + 3, 13, lens); c.px(x0 + 2, 13, '#1d1410')
    c.r(21, 12, 23, 12, rim)
    c.p([(10, 5), (22, 1), (34, 5), (22, 8)], cap); c.r(15, 5, 29, 8, cap)     # square cap
    c.l([(22, 4), (32, 6), (32, 11)], GOLD); c.r(31, 11, 33, 13, GOLD)         # tassel
    c.r(9, 23, 14, 31, robe); c.r(9, 31, 13, 33, SK)
    c.r(3, 26, 16, 35, '#8f2330'); c.r(4, 27, 15, 34, '#efe6d1'); c.r(9, 27, 10, 34, '#c9b88f')   # open book
    for y in (29, 31, 33): c.r(5, y, 8, y, '#9a8a6a'); c.r(11, y, 14, y, '#9a8a6a')
    if f == 0:
        c.r(30, 23, 34, 31, robe); c.r(31, 31, 34, 33, SK)
        c.l([(33, 33), (39, 19)], '#efe6d1'); c.p([(36, 25), (41, 15), (42, 21)], WH)     # quill
    else:
        c.p([(29, 22), (33, 22), (38, 15), (35, 12)], robe); c.r(36, 10, 39, 13, SK)
        c.l([(38, 12), (43, 2)], '#efe6d1'); c.p([(40, 8), (45, 0), (46, 5)], WH)
        glyph(c, 40, 20, 'Š', GOLD); glyph(c, 41, 30, 'A', '#e9d9a8')          # letters he conjures
        c.dots([(37, 26), (44, 26), (39, 37)], GOLD)
    return c.outline()


def lv_molj(f):
    """Knjižni molj: a bespectacled bookworm on a stack of books; chosen, it bites a page."""
    c = Cv(48)
    worm, worm2, belly, rim, page = '#86c35e', '#5a9a3f', '#c8e6a0', '#2a2117', '#efe6d1'
    c.r(4, 39, 40, 45, '#3f6fa8'); c.r(8, 40, 40, 44, page); c.r(8, 42, 40, 42, '#cfc4a8')          # bottom book
    c.r(4, 40, 7, 44, '#3f6fa8'); c.r(4, 41, 7, 41, GOLD); c.r(4, 43, 7, 43, GOLD)
    c.r(8, 33, 43, 39, '#4f8a3a'); c.r(8, 34, 39, 38, page); c.r(8, 36, 39, 36, '#cfc4a8')            # middle book
    c.r(40, 34, 43, 38, '#4f8a3a'); c.r(40, 35, 43, 35, GOLD)
    c.r(6, 27, 38, 33, RED); c.r(10, 28, 38, 32, page); c.r(10, 30, 38, 30, '#cfc4a8')                # top book
    c.r(6, 28, 9, 32, RED); c.r(6, 29, 9, 29, GOLD); c.r(6, 31, 9, 31, GOLD)
    c.e(21, 25, 29, 29, '#5a3a22')                                                                    # its burrow
    segs = [(25, 26), (24, 22), (25, 18)] if f == 0 else [(25, 26), (23, 22), (23, 17), (25, 13)]
    for x, y in segs: c.e(x - 3, y - 3, x + 3, y + 3, worm); c.px(x - 1, y + 2, worm2); c.px(x + 1, y + 2, worm2)
    hx, hy = (28, 11) if f == 0 else (29, 7)
    c.e(hx - 6, hy - 5, hx + 6, hy + 5, worm); c.r(hx - 4, hy + 3, hx + 3, hy + 4, belly)
    for dx in (-5, 1):                                                         # big round spectacles
        c.r(hx + dx, hy - 3, hx + dx + 4, hy + 1, rim); c.r(hx + dx + 1, hy - 2, hx + dx + 3, hy, '#dff0f6'); c.px(hx + dx + 2, hy - 1, '#1d1410')
    c.r(hx - 1, hy - 2, hx + 1, hy - 2, rim)
    if f == 0:
        c.r(hx - 1, hy + 3, hx + 2, hy + 3, '#2f5a22')
    else:
        c.p([(hx + 4, hy + 2), (hx + 15, hy + 1), (hx + 16, hy + 12), (hx + 6, hy + 12)], page)          # a bitten page
        c.px(hx + 6, hy + 2, '#5a3a22'); c.px(hx + 5, hy + 3, '#5a3a22')
        glyph(c, hx + 8, hy + 5, 'Ž', '#3a2a1a')
        c.dots([(hx + 13, hy + 5), (hx + 13, hy + 7), (hx + 12, hy + 9)], '#9a8a6a')
        c.dots([(8, 20), (12, 15), (40, 26), (44, 22)], GOLD)                   # crumbs of letters
    return c.outline()


# ------------------------------------------------------------------ road objects
def skrinja(f):
    c = Cv(32)
    wood, wood2, iron = '#8a5a34', '#6b4426', '#8492a6'
    c.r(4, 17, 27, 28, wood); c.r(4, 22, 27, 22, wood2)
    for x in (4, 14, 26): c.r(x, 17, x + 1, 28, iron)
    if f == 0:
        c.p([(4, 17), (5, 11), (8, 9), (23, 9), (26, 11), (27, 17)], wood)
        for x in (4, 14, 26): c.r(x, 10 if x == 14 else 12, x + 1, 17, iron)
        c.r(14, 16, 17, 20, GOLD); c.px(15, 18, OL[:3] and '#1d1410')
    else:
        c.p([(5, 9), (7, 3), (24, 3), (26, 9)], wood2); c.r(5, 9, 26, 10, iron)
        c.r(6, 12, 25, 17, '#e9b93f'); c.dots([(8, 12), (12, 13), (17, 12), (21, 13), (24, 12)], '#fff3b0')
        c.r(10, 10, 11, 11, '#e9b93f'); c.r(19, 9, 20, 10, '#e9b93f'); c.px(15, 7, '#fff3b0'); c.px(22, 6, '#fff3b0'); c.px(9, 6, '#fff3b0')
    return c.outline()


def vodnjak(f):
    c = Cv(48)
    st, st2, wood = '#9aa3ad', '#6f7985', '#7a4d2a'
    c.r(9, 12, 11, 34, wood); c.r(36, 12, 38, 34, wood)
    c.p([(4, 13), (24, 2), (43, 13)], '#b8322f'); c.l([(4, 13), (43, 13)], '#7d1f25', 2)
    c.r(11, 16, 36, 17, wood)
    c.l([(24, 17), (24, 24 if f == 0 else 21)], '#d9cf9f')
    by = 24 if f == 0 else 21
    c.r(21, by, 27, by + 5, '#a8824a'); c.r(21, by + 1, 27, by + 1, '#6b4426'); c.r(22, by, 26, by, '#4f9ad0')
    c.r(6, 31, 41, 45, st); c.r(6, 31, 41, 32, '#c5ccd4')
    for y, off in ((35, 0), (39, 4), (43, 0)):
        c.l([(6, y), (41, y)], st2)
        for x in range(10 + off, 41, 8): c.l([(x, y - 3), (x, y)], st2)
    c.r(10, 29, 37, 31, '#3a6f96'); c.dots([(14, 30), (22, 29), (30, 30)], '#bfe3f2')
    if f == 1: c.dots([(19, 14), (30, 9), (15, 22), (33, 24), (24, 8)], '#bfe3f2'); c.dots([(18, 14), (31, 9)], '#ffffff')
    return c.outline()


def plaz(f):
    c = Cv(48)
    st, st2, hi = '#8a8f9c', '#5d6270', '#b9bdc8'
    for (x0, y0, x1, y1) in ((4, 30, 22, 45), (18, 26, 40, 45), (30, 34, 45, 45), (12, 20, 28, 34)):
        c.e(x0, y0, x1, y1, st); c.e(x0 + 3, y0 + 4, x1 - 1, y1, st2); c.e(x0 + 2, y0 + 1, x0 + 8, y0 + 5, hi)
    y = 4 if f == 0 else 9
    c.e(26, y, 37, y + 10, st); c.e(28, y + 3, 37, y + 10, st2); c.px(29, y + 2, hi)
    c.dots([(24, y + 12), (39, y + 13), (32, y + 14)], hi)
    # warning board
    c.r(3, 12, 4, 30, '#7a4d2a'); c.p([(0, 4), (8, 4), (8, 13), (0, 13)], '#e9b93f'); c.r(4, 6, 4, 9, '#1d1410'); c.px(4, 11, '#1d1410')
    return c.outline()


def svetisce(f):
    c = Cv(48)
    wood, wood2 = '#8a5a34', '#5a3a22'
    c.r(19, 6, 29, 38, wood); c.r(19, 6, 20, 38, wood2)            # carved idol
    c.p([(18, 6), (24, 1), (30, 6)], '#b8322f')
    c.r(21, 9, 22, 10, '#1d1410'); c.r(26, 9, 27, 10, '#1d1410'); c.r(22, 13, 26, 13, '#1d1410'); c.r(21, 16, 27, 19, '#d9cf9f')
    c.l([(21, 23), (27, 23)], wood2); c.l([(21, 27), (27, 27)], wood2); c.dots([(22, 25), (24, 25), (26, 25), (23, 30), (25, 30)], GOLD)
    c.r(8, 36, 40, 45, '#9aa3ad'); c.r(8, 36, 40, 37, '#c5ccd4'); c.l([(8, 41), (40, 41)], '#6f7985')
    for x in (10, 36):
        c.r(x, 30, x + 2, 36, '#6f7985')
        fl = [(x + 1, 24 + f), (x - 1, 29), (x + 3, 29)]
        c.p(fl, '#f2b632'); c.px(x + 1, 28, '#fff3b0'); c.px(x + 1 + (1 if f else -1), 23 + f, '#e2572a')
    return c.outline()


def puscice(f):
    # Past s konicami: a stone wall with three slots; broad iron spikes push out of them and pull back
    c = Cv(48)
    st, st2, hi = '#8f8a7c', '#6a665c', '#bdb9ac'
    c.r(22, 6, 45, 45, st); c.r(22, 6, 45, 7, hi)
    for y, off in ((14, 0), (22, 6), (30, 0), (38, 6)):
        c.l([(22, y), (45, y)], st2)
        for x in range(26 + off, 45, 12): c.l([(x, y - 7), (x, y)], st2)
    for i, y in enumerate((12, 22, 32)):
        c.r(24, y - 2, 27, y + 2, '#1d1410')                                # the slot the spikes come out of
        out = 45 if (i + f) % 2 == 0 else 40                                 # frames alternate: out, then pulled back
        c.p([(27, y - 4), (out, y), (27, y + 4)], '#9aa3ad')                 # iron spike, broad at the base
        c.l([(28, y - 2), (out - 3, y)], '#e3e8ed')                          # highlight on the metal
    c.dots([(30, 44), (36, 43), (41, 44)], '#4f8a3a')
    return c.outline()


def kazipot(f):
    c = Cv(32)
    c.r(15, 8, 16, 30, '#7a4d2a')
    c.p([(6, 6), (24, 6), (28, 10), (24, 14), (6, 14)], '#e2c98a'); c.l([(9, 10), (22, 10)], '#6b4426')
    c.p([(26, 17), (10, 17), (6, 20), (10, 23), (26, 23)], '#c9a86a'); c.l([(12, 20), (23, 20)], '#6b4426')
    c.dots([(11, 30), (13, 29), (19, 30), (21, 29)], '#4f8a3a')
    return c.outline()


def skala(f):
    c = Cv(24)
    c.e(2, 3, 21, 21, '#8a8f9c'); c.e(5, 7, 21, 21, '#6b707e'); c.e(5, 5, 11, 9, '#b9bdc8'); c.dots([(15, 16), (9, 17), (17, 11)], '#5d6270')
    return c.outline()


def zlatnik(f):
    c = Cv(12)
    c.e(1, 1, 10, 10, '#e9b93f'); c.e(3, 3, 8, 8, '#f6d96a'); c.r(5, 4, 6, 7, '#a8761c')
    return c.outline()


# ------------------------------------------------------------------ item icons (16x16 text grids)
# '.' is transparent; every other letter is looked up in the icon's palette. The outline is added.
ICON = {
 'flask': ("""
......kk........
......kk........
.....kggk.......
.....kggk.......
....kggggk......
...kgaaaagk.....
..kgaaaaaagk....
..kaaawaaaak....
..kaaaaaaaak....
..kaabbbbaak....
...kabbbbak.....
....kkkkkk......
""", {'k': '#c9ced8', 'g': '#e8eef4', 'a': 'A', 'b': 'B', 'w': '#ffffff'}),
 'vial': ("""
.....cccc.......
.....cccc.......
......gg........
......gg........
.....gaag.......
.....gaag.......
....gaaaag......
....gaddag......
....gadaag......
....gaaaag......
.....gggg.......
""", {'c': '#7a4d2a', 'g': '#c9ced8', 'a': 'A', 'd': '#1d1410'}),
 'axe': ("""
.........ss.....
.......sssss....
......sssssss...
.....wwssssss...
....wwwwsssss...
.....wwwsssss...
......wwssss....
.......ww.sss...
......ww........
.....ww.........
....ww..........
...ww...........
..ww............
""", {'s': 'A', 'w': '#7a4d2a'}),
 'hammer': ("""
....ssssssss....
...ssssssssss...
...ssssssssss...
...ssssssssss...
....ssssssss....
.......ww.......
.......ww.......
.......ww.......
.......ww.......
.......ww.......
.......ww.......
.......gg.......
""", {'s': 'A', 'w': '#7a4d2a', 'g': '#e9b93f'}),
 'horn': ("""
..........aa....
.........aaaa...
........aaaaa...
.......aaaaa....
......aaaab.....
.....aaaab......
....aaaab.......
...gaaab........
..ggaab.........
..ggab..........
...gb...........
""", {'a': 'A', 'b': 'B', 'g': '#e9b93f'}),
 'pipe': ("""
.............aa.
............aab.
...........aab..
..........aab...
.........adb....
........aab.....
.......adb......
......aab.......
.....adb........
....aab.........
...aab..........
..ggb...........
""", {'a': 'A', 'b': 'B', 'd': '#1d1410', 'g': '#e9b93f'}),
 'disc': ("""
.......a........
..a....a....a...
...a.......a....
.....aaaaa......
....aabbbaa.....
aa..abbbbba..aa.
....abbwbba.....
....abbbbba.....
....aabbbaa.....
.....aaaaa......
...a.......a....
..a....a....a...
.......a........
""", {'a': 'A', 'b': 'B', 'w': '#fff3b0'}),
 'flower': ("""
......aa........
.....aaaa.......
..aa.aaaa.aa....
.aaaaabbaaaaa...
.aaaabbbbaaaa...
..aa.abba.aa....
.....aaaa.......
......aa........
......gg........
.....ggg........
......gg..g.....
......gggg......
......gg........
""", {'a': 'A', 'b': 'B', 'g': '#3f8a4f'}),
 'stone': ("""
................
.....aaaaa......
...aaaaaaaaa....
..aawwaaaaaab...
..awwaaaaaaab...
.aaaaaaggaaabb..
.aaaaagggaaabb..
.aaaaaaggaabbb..
..aaaaaaaabbb...
..aaaaaabbbbb...
...aabbbbbbb....
.....bbbbb......
""", {'a': 'A', 'b': 'B', 'w': '#ffffff', 'g': '#e9b93f'}),
 'bell': ("""
......ww........
.....w..w.......
......aa........
.....aaaa.......
....aaaaaa......
....awaaaa......
...aawaaaab.....
...aaaaaaab.....
...aaaaaabb.....
..aaaaaaabbb....
..bbbbbbbbbb....
......dd........
......dd........
""", {'a': 'A', 'b': 'B', 'w': '#fff3b0', 'd': '#6b4426'}),
 'pouch': ("""
.....g..g.......
......gg........
.....cccc.......
....aaaaaa......
...aaaaaaaa.....
..aaawaaaaab....
..aawaaaaaab....
..aaaaaaaabb....
..aaaaaaaabb....
...aaaaaabb.....
....bbbbbb......
""", {'a': 'A', 'b': 'B', 'c': '#7a4d2a', 'g': '#7a4d2a', 'w': '#ffffff'}),
 'lace': ("""
....a.a.a.a.....
...a.aaaaa.a....
..a.aa.a.aa.a...
...aa.aaa.aa....
..a.aaa.aaa.a...
...aa.aaa.aa....
..a.aa.a.aa.a...
...a.aaaaa.a....
....a.a.a.a.....
""", {'a': 'A'}),
 'spindle': ("""
.......ww.......
.......ww.......
......aaaa......
.....aaaaaa.....
....aabaabaa....
....aaaaaaaa....
....abaabaab....
.....aaaaaa.....
......aaaa......
.......ww.......
.......ww.......
......gggg......
.......ww.......
""", {'a': 'A', 'b': 'B', 'w': '#7a4d2a', 'g': '#e9b93f'}),
 'ember': ("""
.......a........
......aa........
......aaa..a....
.....aaba.aa....
....aabbaaaa....
....abbbbaa.....
...aabbwbbaa....
...aabwwbbaa....
....abbwbba.....
..dddabbbaddd...
...dddddddd.....
""", {'a': 'A', 'b': 'B', 'w': '#fff3b0', 'd': '#3a2a22'}),
 'berry': ("""
.......g........
......gg..gg....
.....g.g.ggg....
....g..gggg.....
...aa...g.......
..aaaa..aa......
..awaa.aaaa.....
..aaaa.awaa.....
...aa..aaaa.....
........aa......
""", {'a': 'A', 'g': '#3f8a4f', 'w': '#ffffff'}),
 'drop': ("""
.......a........
.......a........
......aaa.......
......aaa.......
.....aaaaa......
....aawaaaa.....
....awwaaaa.....
....awaaaab.....
....aaaaabb.....
.....aaabb......
......bbb.......
""", {'a': 'A', 'b': 'B', 'w': '#ffffff'}),
 'wreath': ("""
.....aabaa......
...aabaaabaa....
..aba.....aba...
..aa.......aa...
.aba.......aba..
.aa.........aa..
.aba.......aba..
..aa.......aa...
..aba.....aba...
...aabaaabaa....
.....aabaa......
""", {'a': 'A', 'b': 'B'}),
 'mug': ("""
...wwwwwww......
..wwwwwwwww.....
..aaaaaaaaa.....
..aaaaaaaaabb...
..awaaaaaaa.bb..
..awaaaaaaa..b..
..awaaaaaaa..b..
..aaaaaaaaa.bb..
..aaaaaaaaabb...
..aaaaaaaaa.....
..bbbbbbbbb.....
""", {'a': 'A', 'b': 'B', 'w': '#fff8e0'}),
 'egg': ("""
......aaaa......
.....aaaaaa.....
....aabaabaa....
....aaaaaaaa....
...awawawawaa...
...aaaaaaaaaa...
...abbabbabba...
...aaaaaaaaaa...
....awawawaa....
....aaaaaaaa....
.....aabbaa.....
......aaaa......
""", {'a': 'A', 'b': 'B', 'w': '#ffffff'}),
}


def icon(shape, a, b):
    grid, pal = ICON[shape]
    rows = [r for r in grid.strip('\n').split('\n')]
    c = Cv(16); top = (16 - len(rows)) // 2
    for y, row in enumerate(rows):
        for x, ch in enumerate(row[:16]):
            if ch == '.': continue
            col = pal[ch]; c.px(x, y + top, a if col == 'A' else b if col == 'B' else col)
    return c.outline()


# ------------------------------------------------------------------ backgrounds
W, H, GY = 384, 120, 76


def sky(d, bands):
    """bands: list of (y_end, colour). Rows where two bands meet are dithered."""
    y0 = 0
    for i, (y1, col) in enumerate(bands):
        d.rectangle([0, y0, W, y1], fill=rgb(col))
        if i:
            prev = rgb(bands[i - 1][1])
            for x in range(0, W, 2): d.point((x + (y0 % 2), y0), fill=prev); d.point((x, y0 + 1), fill=prev) if x % 4 == 0 else None
        y0 = y1


def ridge(d, base, amp, col, seed, per=(96, 48, 24), top=None):
    rnd = random.Random(seed); ph = [rnd.random() * 6.28 for _ in per]
    for x in range(W):
        y = base - sum(amp / (i + 1) * (0.5 + 0.5 * math.sin(2 * math.pi * x / p + ph[i])) for i, p in enumerate(per))
        d.line([(x, int(y)), (x, GY)], fill=rgb(col))
        if top: d.point((x, int(y)), fill=rgb(top))


def ground(d, col, specks, seed, y=GY):
    d.rectangle([0, y, W, H], fill=rgb(col)); rnd = random.Random(seed)
    for _ in range(520):
        x, yy = rnd.randrange(W), rnd.randrange(y + 1, H); d.line([(x, yy), (x + rnd.randrange(1, 4), yy)], fill=rgb(rnd.choice(specks)))


def pine_px(d, x, y, h, col, dark):
    for i in range(h):
        w = 1 + (i * 5) // h + (i % 4 == 3)
        d.line([(x - w, y - h + i), (x + w, y - h + i)], fill=rgb(col if i % 4 else dark))
    d.rectangle([x, y, x, y + 2], fill=rgb('#4a3220'))


def bg_ptuj():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    sky(d, [(14, '#3a4468'), (28, '#56608a'), (42, '#8a86a8'), (54, '#c9a8b0'), (GY, '#e8c8b0')])
    ridge(d, 60, 10, '#9aa6c0', 3)
    # castle hill with the long white castle and red roofs
    for x in range(120, 300):
        t = (x - 120) / 180; y = 66 - int(26 * math.sin(math.pi * t) ** .8)
        d.line([(x, y), (x, GY)], fill=rgb('#dfe6ee')); d.point((x, y), fill=rgb('#ffffff'))
    d.rectangle([168, 30, 250, 41], fill=rgb('#efe6d4')); d.polygon([(165, 30), (171, 24), (247, 24), (253, 30)], fill=rgb('#a8382f'))
    d.rectangle([204, 18, 214, 30], fill=rgb('#efe6d4')); d.polygon([(202, 18), (209, 10), (216, 18)], fill=rgb('#a8382f'))
    for x in range(172, 250, 7): d.rectangle([x, 33, x + 1, 36], fill=rgb('#3a4468'))
    d.line([(165, 24), (253, 24)], fill=rgb('#ffffff'))
    # town roofs under snow
    rnd = random.Random(8)
    x = 0
    while x < W:
        w = rnd.randrange(14, 24); hh = rnd.randrange(8, 15); c = rnd.choice(['#e2cfa8', '#d9b89a', '#c9c2b0', '#e8dcc0'])
        d.rectangle([x, 68 - hh, x + w, 70], fill=rgb(c)); d.polygon([(x - 1, 68 - hh), (x + w // 2, 62 - hh), (x + w + 1, 68 - hh)], fill=rgb('#a8382f'))
        d.line([(x - 1, 68 - hh), (x + w // 2, 62 - hh), (x + w + 1, 68 - hh)], fill=rgb('#ffffff'))
        for wx in range(x + 3, x + w - 2, 5): d.rectangle([wx, 71 - hh, wx + 1, 73 - hh], fill=rgb('#f6d96a'))
        x += w + rnd.randrange(1, 4)
    d.rectangle([0, 70, W, GY], fill=rgb('#6f8fb0'));
    for _ in range(60): xx = rnd.randrange(W); d.line([(xx, rnd.randrange(71, 76)), (xx + 4, rnd.randrange(71, 76))], fill=rgb('#a8c3d9'))
    ground(d, '#e6ecf2', ['#ffffff', '#cdd8e4', '#b9c8d8'], 4)
    for _ in range(90): d.point((rnd.randrange(W), rnd.randrange(0, 70)), fill=rgb('#ffffff'))
    return im


def bg_peca():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    sky(d, [(16, '#5a6a8a'), (32, '#7f8aa0'), (46, '#a8a8b0'), (GY, '#d9c8b0')])
    ridge(d, 58, 18, '#6f7a8a', 11, (192, 64, 32), top='#dfe6ee')
    ridge(d, 68, 26, '#4f5a66', 5, (384, 128, 48), top='#8a94a0')
    # the cave where the king sleeps
    d.ellipse([176, 48, 214, 84], fill=rgb('#1d1826')); d.ellipse([184, 58, 206, 84], fill=rgb('#3a2a22')); d.ellipse([190, 64, 200, 80], fill=rgb('#e9b93f'))
    d.rectangle([170, 77, 220, 84], fill=rgb('#4f5a66'))
    for x in (30, 52, 70, 118, 140, 246, 270, 300, 336, 362): pine_px(d, x, 74, 16 + (x * 7) % 9, '#2f5f44', '#234a36')
    for x, y in ((90, 20), (104, 26), (250, 16), (262, 22)): d.line([(x - 3, y - 1), (x, y), (x + 3, y - 1)], fill=rgb('#1d1826'))
    ground(d, '#5a7048', ['#6f8a55', '#4a5f3c', '#7f9a5f'], 6)
    return im


def bg_triglav():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    sky(d, [(18, '#6fa8d9'), (36, '#8fc0e6'), (52, '#b9daf0'), (GY, '#dff0f8')])
    for cx, cy in ((60, 16), (300, 22), (220, 10)):
        for dx, w in ((-10, 8), (0, 12), (11, 7)): d.ellipse([cx + dx - w, cy - w // 2, cx + dx + w, cy + w // 2], fill=rgb('#ffffff'))
    ridge(d, 62, 16, '#9ab0c6', 21, (128, 48, 24), top='#ffffff')
    # Triglav: three heads
    def peak(cx, top, w, col='#8492a6'):
        d.polygon([(cx - w, GY), (cx - w // 4, top + 8), (cx, top), (cx + w // 3, top + 10), (cx + w, GY)], fill=rgb(col))
        d.polygon([(cx - w // 4, top + 8), (cx, top), (cx + w // 3, top + 10), (cx + w // 8, top + 14), (cx, top + 9), (cx - w // 8, top + 15)], fill=rgb('#ffffff'))
        d.polygon([(cx, top), (cx + w // 3, top + 10), (cx + w, GY), (cx + w // 2, GY)], fill=rgb('#6f7d92'))
    peak(150, 30, 46); peak(236, 26, 50); peak(192, 8, 62, '#8d9bb0')
    d.rectangle([191, 5, 192, 8], fill=rgb('#c9ced8'))    # Aljažev stolp
    ridge(d, 74, 14, '#4f7a5a', 9, (96, 32, 16))
    for x in range(8, W, 23): pine_px(d, x + (x * 13) % 9, 75, 12 + (x * 5) % 8, '#2f5f44', '#234a36')
    ground(d, '#6fae5a', ['#8fc46a', '#5a9a4a', '#a6d67e'], 2)
    rnd = random.Random(5)
    for _ in range(40):
        x, y = rnd.randrange(W), rnd.randrange(80, H); d.point((x, y), fill=rgb(rnd.choice(['#f0a0c8', '#ffffff', '#f6d96a'])))
    return im


def bg_bled():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    sky(d, [(14, '#7fb8d9'), (30, '#a8d0e6'), (44, '#d0e6f0'), (GY, '#eef4ec')])
    ridge(d, 50, 22, '#8fa6c0', 31, (192, 64, 24), top='#ffffff')
    ridge(d, 56, 12, '#5f8a6a', 14, (128, 48, 32))
    # castle on its cliff
    d.polygon([(20, 60), (24, 26), (58, 22), (70, 60)], fill=rgb('#b9b4a6')); d.polygon([(46, 60), (58, 22), (70, 60)], fill=rgb('#8f8a80'))
    d.rectangle([26, 14, 54, 24], fill=rgb('#efe6d4')); d.polygon([(24, 14), (40, 7), (56, 14)], fill=rgb('#a8382f')); d.rectangle([46, 6, 51, 14], fill=rgb('#efe6d4')); d.polygon([(45, 6), (48, 1), (52, 6)], fill=rgb('#a8382f'))
    # lake
    d.rectangle([0, 56, W, GY], fill=rgb('#3f8fb0'))
    rnd = random.Random(2)
    for _ in range(150): x, y = rnd.randrange(W), rnd.randrange(57, GY); d.line([(x, y), (x + rnd.randrange(2, 7), y)], fill=rgb(rnd.choice(['#5fa8c6', '#7fc3d9', '#2f7a9a'])))
    # island with the church
    d.ellipse([196, 54, 268, 66], fill=rgb('#3f7a4a'))
    for x in range(202, 264, 6): d.ellipse([x, 46 + (x % 5), x + 8, 58], fill=rgb('#2f6a3f' if x % 12 else '#4f8a55'))
    d.rectangle([226, 42, 242, 56], fill=rgb('#f4efe2')); d.polygon([(224, 42), (234, 36), (244, 42)], fill=rgb('#a8382f'))
    d.rectangle([244, 30, 249, 56], fill=rgb('#f4efe2')); d.polygon([(243, 30), (246, 20), (250, 30)], fill=rgb('#3a4468')); d.point((246, 34), fill=rgb('#3a4468'))
    for y in range(66, 74, 2): d.line([(214, y), (252, y)], fill=rgb('#cfe6ee'))
    d.polygon([(120, 68), (134, 68), (131, 71), (123, 71)], fill=rgb('#7a4d2a')); d.rectangle([122, 64, 132, 66], fill=rgb('#e2c98a'))   # pletna
    ground(d, '#6aa858', ['#8fc46a', '#5a9a4a', '#a6d67e'], 12)
    return im


def bg_piran():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    sky(d, [(12, '#5a5a8a'), (24, '#9a6a90'), (36, '#d98a7a'), (48, '#f0b070'), (GY, '#f8d890')])
    d.ellipse([70, 36, 100, 66], fill=rgb('#fff3b0'))
    d.rectangle([0, 52, W, GY], fill=rgb('#3f6f9a'))
    rnd = random.Random(7)
    for _ in range(160): x, y = rnd.randrange(W), rnd.randrange(53, 70); d.line([(x, y), (x + rnd.randrange(2, 8), y)], fill=rgb(rnd.choice(['#5f8fb8', '#f0b070', '#2f5a80', '#f8d890'] if 50 < x < 130 else ['#5f8fb8', '#2f5a80'])))
    # the town on its point, with the bell tower of St George
    d.polygon([(250, 56), (270, 50), (384, 46), (384, 62), (250, 62)], fill=rgb('#6a6a5a'))
    x = 262
    while x < W:
        w = rnd.randrange(8, 15); hh = rnd.randrange(6, 13); c = rnd.choice(['#f0d0a8', '#e8b890', '#f4e0c0', '#e0a888'])
        d.rectangle([x, 52 - hh, x + w, 54], fill=rgb(c)); d.rectangle([x - 1, 51 - hh, x + w + 1, 52 - hh], fill=rgb('#b8553a'))
        d.point((x + 3, 54 - hh + 3), fill=rgb('#3a4468')); x += w + 1
    d.rectangle([318, 18, 324, 44], fill=rgb('#f0dcc0')); d.polygon([(317, 18), (321, 8), (325, 18)], fill=rgb('#b8553a')); d.rectangle([320, 22, 322, 25], fill=rgb('#3a4468'))
    d.rectangle([326, 34, 346, 44], fill=rgb('#f4e6d0')); d.polygon([(325, 34), (336, 29), (347, 34)], fill=rgb('#b8553a'))
    # salt pans
    d.rectangle([0, 66, 240, GY], fill=rgb('#8fb0c0'))
    for x in range(0, 240, 30): d.line([(x, 66), (x, GY)], fill=rgb('#6a5a48'))
    d.line([(0, 66), (240, 66)], fill=rgb('#6a5a48')); d.line([(0, 71), (240, 71)], fill=rgb('#6a5a48'))
    for x in (12, 44, 100, 160, 196): d.polygon([(x, 71), (x + 5, 66), (x + 10, 71)], fill=rgb('#ffffff'))
    ground(d, '#d9c8a0', ['#e8dcc0', '#c0ae88', '#f4ecd8'], 3)
    return im


def bg_predjama():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    sky(d, [(10, '#7fa8c6'), (20, '#a8c6d9')])
    # the cliff fills the scene
    d.rectangle([0, 14, W, GY], fill=rgb('#a8a496'))
    rnd = random.Random(9)
    for x in range(W):
        y = 16 + int(5 * math.sin(x / 17) + 3 * math.sin(x / 5.3)); d.line([(x, 8), (x, y)], fill=rgb('#a8c6d9'))
        d.point((x, y + 1), fill=rgb('#c9c6ba'))
    for _ in range(420):
        x, y = rnd.randrange(W), rnd.randrange(20, GY); d.line([(x, y), (x + rnd.randrange(0, 2), y + rnd.randrange(2, 7))], fill=rgb(rnd.choice(['#8f8a7c', '#bdb9ac', '#7d786c'])))
    for x in range(0, W, 5):
        y = 14 + int(5 * math.sin(x / 17) + 3 * math.sin(x / 5.3));
        if x % 15 == 0: pine_px(d, x, y + 3, 8, '#3f6f50', '#2f5f44')
    # cave mouth and the castle built into it
    d.polygon([(132, GY), (136, 40), (160, 22), (214, 20), (244, 34), (252, GY)], fill=rgb('#2a2630'))
    d.rectangle([162, 36, 226, GY], fill=rgb('#efe9da')); d.polygon([(160, 36), (170, 28), (222, 28), (228, 36)], fill=rgb('#a8382f'))
    d.rectangle([146, 50, 164, GY], fill=rgb('#e2dcc8')); d.polygon([(144, 50), (155, 43), (166, 50)], fill=rgb('#a8382f'))
    d.rectangle([224, 46, 240, GY], fill=rgb('#d9d2be')); d.polygon([(222, 46), (232, 40), (242, 46)], fill=rgb('#a8382f'))
    for y in (40, 50, 60):
        for x in range(168, 222, 9): d.rectangle([x, y, x + 2, y + 4], fill=rgb('#3a3440'))
    d.rectangle([150, 56, 152, 60], fill=rgb('#3a3440')); d.rectangle([158, 56, 160, 60], fill=rgb('#3a3440')); d.rectangle([230, 52, 232, 56], fill=rgb('#3a3440'))
    d.rectangle([188, 66, 198, GY], fill=rgb('#3a2a20')); d.rectangle([176, 70, 210, GY], fill=rgb('#8f8a7c'))
    for x in range(0, 130, 11): pine_px(d, x + (x * 7) % 5, 75, 14 + (x * 3) % 9, '#2f5f44', '#234a36')
    for x in range(258, W, 11): pine_px(d, x + (x * 7) % 5, 75, 14 + (x * 3) % 9, '#2f5f44', '#234a36')
    ground(d, '#5f9050', ['#7fae5f', '#4f7a44', '#93c070'], 15)
    return im


def road():
    """A see-through strip of tufts and pebbles that scrolls under the walking party."""
    im = Image.new('RGBA', (192, 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im); rnd = random.Random(1)
    for _ in range(26):
        x, y = rnd.randrange(190), rnd.randrange(2, 15)
        if rnd.random() < .5: d.line([(x, y), (x, y - 2)], fill=(20, 30, 20, 150)); d.point((x + 1, y - 1), fill=(20, 30, 20, 150))
        else: d.rectangle([x, y, x + 1, y], fill=(255, 255, 255, 70)); d.point((x, y + 1), fill=(0, 0, 0, 90))
    return im


HEROES = {'erazem': erazem, 'klepec': klepec, 'vida': vida, 'ajda': ajda, 'krosnjar': krosnjar}
OBJECTS = {'skrinja': skrinja, 'vodnjak': vodnjak, 'plaz': plaz, 'svetisce': svetisce, 'kazipot': kazipot, 'puscice': puscice}
LEVEL_ART = {'lv-malcek': lv_malcek, 'lv-ucenjak': lv_ucenjak, 'lv-molj': lv_molj}
BGS = {'ptuj': bg_ptuj, 'peca': bg_peca, 'triglav': bg_triglav, 'bled': bg_bled, 'piran': bg_piran, 'predjama': bg_predjama}


def main():
    world = json.loads((ROOT / 'data/world.json').read_text(encoding='utf-8'))
    sprites, sizes = {}, {}
    for k, fn in {**HEROES, **OBJECTS, **LEVEL_ART}.items():
        fr = [fn(0), fn(1)]; sprites[k] = uri(sheet(fr)); sizes[k] = fr[0].w
    icons = {it['id']: uri(icon(*it['icon']).im) for it in world['items']}
    extra = {'skala': uri(skala(0).im), 'zlatnik': uri(zlatnik(0).im), 'road': uri(road())}
    bgs = {k: uri(fn(), 40) for k, fn in BGS.items()}
    js = ('// Generated by tools/art_extra.py — do not edit by hand.\n'
          f'Object.assign(SPRITES, {json.dumps(sprites)});\n'
          f'Object.assign(SPR_SIZE, {json.dumps(sizes)});\n'
          f'Object.assign(BG, {json.dumps(bgs)});\n'
          f'const ICONS = {json.dumps(icons)};\n'
          f'const ART = {json.dumps(extra)};\n')
    (ROOT / 'src/art-extra.js').write_text(js, encoding='utf-8')
    print('wrote src/art-extra.js,', len(js) // 1024, 'KB')
    if '--preview' in sys.argv:
        out = ROOT / 'test-output'; out.mkdir(exist_ok=True)
        fr = [fn(f) for fn in list(HEROES.values()) + list(OBJECTS.values()) + list(LEVEL_ART.values()) for f in (0, 1)]
        im = Image.new('RGBA', (48 * 10, 48 * 3 + 20), (60, 70, 90, 255))
        for i, f in enumerate(fr): im.alpha_composite(f.im, ((i % 10) * 48, (i // 10) * 48))
        for i, it in enumerate(world['items']): im.alpha_composite(icon(*it['icon']).im, (i * 18 + 2, 146))
        im.resize((im.width * 4, im.height * 4), Image.NEAREST).save(out / 'art-sprites.png')
        b = Image.new('RGB', (W * 2, H * 3))
        for i, fn in enumerate(BGS.values()): b.paste(fn(), ((i % 2) * W, (i // 2) * H))
        b.resize((W * 4, H * 6), Image.NEAREST).save(out / 'art-bgs.png')


if __name__ == '__main__':
    main()
