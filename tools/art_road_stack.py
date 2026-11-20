#!/usr/bin/env python3
"""A taller copy of the Ptuj road tile, so the road can be drawn with small cobbles and still reach the bottom.

The road tile Codex drew (road-tile.png, 2172 x 180 summer, 2172 x 191 winter) has the curb along its top and three
rows of cobbles under it, and it repeats only sideways. Drawn at half size it no longer fills the ground, so this
stacks more of its own cobble rows underneath:

- the curb and the first cobble rows exactly as drawn;
- then the cobble rows again (everything below the curb), shifted sideways each time so the same stones do not sit
  above each other, joined to the rows above along the line where the two overlap most alike (a minimum-error cut,
  which follows the dark mortar instead of a straight seam);
- the join runs all the way round, so the result still repeats sideways without a seam.

Nothing is drawn: every pixel is one of the tile's own. The original export stays the source (previewOnly in
art/manifests/ptuj.json); this writes road-tile-tall.png beside it.

  python3 tools/art_road_stack.py            write both seasons
  python3 tools/art_road_stack.py --check    exit 1 if a tall tile is missing or out of date with its source
"""
import json, pathlib, sys
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
COPIES = 4        # body copies under the original: 180 + 4 x ~110 rows, enough for a road from the top third down
OVERLAP = 24      # rows two copies overlap; the cut runs inside them
SEASONS = {       # source export -> tall export, curb rows (the body starts below them)
    'sunset': ('art/exports/environments/ptuj/road-tile.png', 'art/exports/environments/ptuj/road-tile-tall.png', 45),
    'winter': ('art/exports/environments/ptuj/winter/road-tile.png', 'art/exports/environments/ptuj/winter/road-tile-tall.png', 49),
}


def min_cut(a, b):
    """For overlapping row blocks a (above) and b (below), the row per column where b takes over: the path of least
    colour difference across the width, moving at most one row per column, and ending on the row it started on (so
    the tile still repeats sideways)."""
    cost = np.abs(a[..., :3].astype(int) - b[..., :3].astype(int)).sum(2).astype(float)   # rows x columns
    R, W = cost.shape
    best = None
    for start in range(2, R - 2):          # keep a margin so each side shows some of itself
        acc = np.full(R, np.inf); acc[start] = cost[start, 0]
        back = np.zeros((R, W), int)
        for x in range(1, W):
            prev = np.stack([np.r_[np.inf, acc[:-1]], acc, np.r_[acc[1:], np.inf]])   # from r-1, r, r+1
            k = prev.argmin(0)
            back[:, x] = np.arange(R) + k - 1
            acc = prev[k, np.arange(R)] + cost[:, x]
        if best is None or acc[start] < best[0]:
            path = np.zeros(W, int); r = start
            for x in range(W - 1, -1, -1):
                path[x] = r; r = back[r, x]
            best = (acc[start], path)
    return best[1]


def stack(src, curb):
    tile = np.array(Image.open(ROOT / src).convert('RGBA'))
    H, W = tile.shape[:2]
    body = tile[curb:]
    out = tile.copy()
    for i in range(1, COPIES + 1):
        nxt = np.roll(body, (W * i * 3) // 7, axis=1)       # a different stretch of stones each time
        a, b = out[-OVERLAP:], nxt[:OVERLAP]
        path = min_cut(a, b)
        rows = np.arange(OVERLAP)[:, None]
        join = np.where(rows < path[None, :], np.ones_like(rows, bool), False)[..., None]
        seam = np.where(join, a, b)
        out = np.concatenate([out[:-OVERLAP], seam, nxt[OVERLAP:]])
    return out


def main():
    stale = []
    for season, (src, dst, curb) in SEASONS.items():
        img = Image.fromarray(stack(src, curb))
        p = ROOT / dst
        if '--check' in sys.argv:
            if not p.is_file() or not np.array_equal(np.asarray(Image.open(p).convert('RGBA')), np.asarray(img)):
                stale.append(dst)
            continue
        img.save(p, optimize=True)
        print(f'{season}: {dst} {img.size[0]}x{img.size[1]} from {src}')
    if '--check' in sys.argv:
        print('\n'.join(f'{d}: missing or out of date, run python3 tools/art_road_stack.py' for d in stale) or 'ok: tall road tiles fresh')
        sys.exit(1 if stale else 0)


if __name__ == '__main__':
    main()
