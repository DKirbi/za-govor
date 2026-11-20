# Ptuj road with smaller cobbles — brief

**Status:** CONFIRMED size (Game Director, 19 Nov 2026). The art itself is to be made; nothing here approves it.
**For:** GPT / Codex (art). **Integration:** Claude.

## Why

In the battle and travel scenes the cobbles are almost as tall as the heroes. The road tile (`road-tile.png`,
2172 × 180 px, three rows of cobbles under a curb row) is drawn at 1.3× to fill the ground, so each row of stones is
about 58 px on the game canvas.

The Game Director chose the size in `road-cobbles-target.jpg` (sunset left, winter right): stones at about 38 % of
today's size. That mockup was made by shrinking and stacking the existing tile. It shows the **size** only. It has two
faults the redraw must not have: a horizontal line where the stacked copies meet, and stone pixels finer than the
town and wall behind them.

## Target (on the 1672 × 560 game canvas)

- **Ground band:** from y = 325 to the bottom (235 px). The tile starts at the top of the band.
- **Curb row** along the top edge, about 22 px tall, as in the current tile.
- **Cobble rows** about 22 px tall each: 9–10 rows fill the band. Stones irregular as now, about 25–45 px wide.
  On a phone a hero stands about 66 px tall, so a row is roughly a third of a hero.
- **Draw at 1:1**, at the same pixel size as the town and the riverbank wall. The game will place it at scale 1,
  not scaled up or down.
- **Size:** 1672 × 240 px (5 px spare below the canvas). **Seamless left to right**: the road repeats as the party
  walks. Within one width, no visible repeating stone pattern and no straight horizontal seam between rows.
- **Look:** the current tile's palette, light direction and dark mortar. The top edge (curb) may have transparent
  pixels where it meets the river bank; below it the tile is opaque.

## Winter

The same layout and size, 1672 × 240: snow on the curb tops and drifted between the cobbles, as in the current winter
tile. Keep enough stone showing that the ground still reads as a street.

## Deliver

- Masters: `art/source/environments/ptuj/road-cobbles.png` and `art/source/environments/ptuj/winter-road-cobbles.png`.
- Exports: `art/exports/environments/ptuj/road-cobbles.png` and `art/exports/environments/ptuj/winter/road-cobbles.png`.
- `art/manifests/ptuj.json`: a `road-cobbles` layer per season (`exportSize`, `offset`, `tileable: true`), next to
  `road-tile`. Do not remove `road-tile`: the Game Director compares the two in the game first.
- Preview: one JPG per season with three copies side by side (seam check), in `art/previews/environments/ptuj/`.

## Integration (Claude)

Place `road-cobbles` at y = 325, scale 1, in place of `road-tile` in `data/backgrounds.json` (both seasons); make the
WebP copies with `python3 tools/art_bg_webp.py`; check the scene on a phone and on desktop.
