# Ptuj parallax backgrounds and integration

**Status:** the sunset and winter packs are proposed previews. Variant A remains in use; the background test stays off.

| Variant | Description | Access |
|---|---|---|
| A | Existing snowy Ptuj | Default until approved |
| B | Sunset Ptuj, bridge, far-bank wall and outer-bank trees | `?ozadje=B`, preview only |
| C | Claude's independent evening pack | `?ozadje=C`, preview only |
| D | Snowy Ptuj companion for Kurent's recruitment scene | `?ozadje=D`, preview only |

The pack retains sunset and winter as separate seasonal variants in one manifest. The D winter preview has share 0. This does not assign winter scenes elsewhere or turn on the A/B test.

## Changes in the combined pack

- Clouds are transparent, horizontal layers and drift slowly in battle and travel. Reduced-motion settings stop drift.
- A low foreground strip of rocks, small shrubs and grasses exists in both seasons. It is drawn over actors so it can overlap their lower legs and feet while leaving faces clear.
- Sparse trees sit behind the retaining wall on the outer riverbank.
- The far-bank retaining wall and the multi-arch scene bridge remain separate layers. The wall visually separates the city from the Drava; the bridge overlaps its left end.
- Winter keeps snow on the roofs, bank trees, wall coping and road.
- The 1672×560 game view places the road at 58% of view height, matching the existing battle layout. Per-season road transforms share a common actor ground row.

## Placement and motion

`art/manifests/ptuj.json` records each cropped export's source-canvas offset and dimensions. `build.py` reads both the older `dimensions.export` / `tileable.horizontal` shape and the asset-library `exportSize` / boolean `tileable` shape, and selects the layer season from `data/backgrounds.json`.

Cloud drift uses the existing renderer's tiled-layer movement and respects reduced motion. The front layer uses the renderer's foreground role and stays above actors, below the battle interface.

## Review notes

- These are proposed art and scene placements. Check the front-layer overlap against actual hero/enemy sprites before approving it.
- The winter scene remains a preview. Kurent's association is the Game Director's direction; future winter assignment stays open.
- No test assignment has been enabled. Preview links do not change player assignment.
- The road is the original road tile at half size, and its top follows the characters (below).

## Size: WebP for the build

- The game embeds every picture in one HTML file. Since 19 Nov (Game Director) the Ptuj layers are embedded as
  quality-90 WebP: 0.44 MB sunset and 0.51 MB winter, against 5.5 and 6.3 MB of PNG. The build is 4.0 MB.
- `python3 tools/art_bg_webp.py` writes `art/exports/environments/ptuj/webp/` and `…/ptuj/winter/webp/` from the PNG
  exports, with an index of the PNG each WebP was made from. Rerun it after any change to a PNG export; until then
  `build.py` embeds the new PNG and warns. `--check` lists stale files.
- The PNG exports are unchanged and stay the masters: lossless, for a PC build at full quality.
- Checked: alpha identical to the PNG in every layer; the road tile's wrap edge differs from its PNG by about as
  much as two neighbouring pixels do (no visible seam); the battle scene on a 412 px phone looks the same.

## Kakovost slik (Visoka / Nizka)

- *Nastavitve → Razvoj → Kakovost slik* chooses which Ptuj picture the travel and battle scenes show, stored in
  `zg-fidelity`. *Samodejno* (the default) leaves the choice to the A/B test. *Visoka* shows the Codex sunset pack
  (B) where the test would show A. *Nizka* shows the picture already in the game (A, `BG.ptuj` in
  `src/art-extra.js`, 384×120) where the test would show B.
- Winter (D, `ptuj-zima`) has no low picture yet, so it stays on its Codex pack under both settings. Only
  `?ozadje=D` shows it until the Game Director assigns it.
- The Codex pack's low copies were removed: they were half-size Codex layers, not the lower tier.
- Martin Krpan's sprites followed this setting from 18 Nov to 0.20.0 (Codex's sheet in *Visoka*). Since 0.21.0
  (Game Director, 25 Nov 2026) heroes and enemies draw their pixel sprites in every setting, and (26 Nov 2026) the painted skill
  cards are the default in every setting too: *Kakovost slik* changes only the backgrounds.

## The road: smaller cobbles, a thinner strip

- **Decisions (Game Director):** 19 Nov, the cobbles are too large next to the heroes; the third mockup (about 0.5)
  is the size. 20 Nov, Codex's redrawn `road-cobbles` were rejected ("look terrible") and removed: the road is the
  original `road-tile`, smaller, and the strip is thinner, with the characters' heads against the water.
- **Size:** `road-tile-tall` at scale 0.5 (stones about 38 % of the old 1.3×). `tools/art_road_stack.py` makes it from
  `road-tile.png`: the curb and cobbles as drawn, then four more copies of the cobble rows, each shifted sideways and
  joined along a minimum-error cut through the mortar, so no straight seam runs across. No pixel is new. The original
  `road-tile` stays as the source (`previewOnly`).
- **Height:** `"stand": 30, "neck": 0.5` in `data/backgrounds.json`. The road's top is the higher of two lines: 30
  canvas pixels above the highest feet in the scene, and the heroes' necks (half a hero sprite from its top)
  (`actorFloor` in `src/backgrounds.js`: heroes, enemies, objects on the road, from their layout boxes so attacks and
  running do not move it). On the road the strip reaches the heroes' necks, so their heads show against the water;
  in battle the enemies stand higher (the labels under them), so the road starts just above their feet and they
  stand on cobbles. Same on every screen. The layer repeats downwards, clipped at its top, so it always reaches
  the bottom. Without characters (the gallery) it sits at its `y`.
