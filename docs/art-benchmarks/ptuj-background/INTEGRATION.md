# Ptuj background: the A/B test and its variants

**Status:** IMPLEMENTED. The art is in REVIEW and the test is **not live**: players see variant A.

| Variant | What | Who sees it |
|---|---|---|
| **A** | The snowy Ptuj in use (`BG.ptuj`, 384 × 120, `tools/art_extra.py`), unchanged | Everyone, until the test goes live; then half of the installs |
| **B** | **Codex pack, *Ptuj — sončni zahod nad Dravo*** (#33): `art/manifests/ptuj.json`, `art/exports/environments/ptuj/` | `?ozadje=B`; half of the installs once live |
| **C** | Claude's pack, *Ptuj — večer ob Dravi*: `art/manifests/ptuj-vecer.json`, drawn by `tools/art_ptuj_parallax.py` | Preview only, `?ozadje=C` (share 0, never drawn) |

The Game Director chose the Codex pack as B on 17 Nov 2026. Claude's pack was made earlier the same day; it moved to its own id so it can never overwrite the Codex files, and it stays as a preview to compare against. Drop it from `data/backgrounds.json` and `art/` if it is not wanted.

## Variant B: the Codex pack in the game

The pack as delivered (`art/manifests/ptuj.json`, `art/previews/environments/ptuj/VALIDATION.md`):
- seven scene layers on a 1672 × 941 (16:9) canvas, plus a 2172 × 724 road tile;
- none of the scene layers tile; the road does, with matching edges;
- 4.7 MB together, with partial alpha on the edges;
- placement left open: the preview's offsets are marked as proposals.

**Why it needs placing.** In the delivered composition the town's waterline is at 64 % of the height and the road starts at 81 %. The game stands its actors lower:

| Where | Measured 17 Nov (desktop and phone) |
|---|---|
| Enemies' feet in battle | 62–70 % of the scene height |
| Heroes' feet in battle | 75–80 % |
| Everyone's feet on the road | 83–87 % |

Unplaced, every actor in a battle would stand on the river. The game's scene is also about 3:1 on desktop, wider than 16:9.

**How it is placed** (`data/backgrounds.json` → `packs.ptuj`). No pixel is changed; only where each layer sits and how big it is drawn:

| Layer | Placement on a 1672 × 560 view | Road motion |
|---|---|---|
| sky | y −252: the sun above the town on the left | pans 0.3 |
| clouds | y −36 | pans 0.4 |
| distant-hills | y −639 | pans 0.5 |
| castle-hill | x 560, y −210, scale 0.6 (Codex's proposed scale) | pans 0.7 |
| town, drava-water | y −337: waterline at 47 % of the view | pan 0.85, together |
| reflections | y −400: the bright tops of the glints under the town | pan 0.85, with the water |
| road-tile | y −381, scale 1.3: the cobbles from 58 % to the bottom | scrolls with the walk |

Every actor's feet land on the cobbles. The test reads the road's first solid row from the image itself and compares it with each sprite.

**How it is drawn** (`src/backgrounds.js`):
- **Scaling:** the view is fitted to the scene's height. On a very wide, short scene it is fitted to the width instead and kept on the bottom, so the sides never show a gap.
- **Smoothing:** pictures shrunk below their own size (all of B) are smoothed; pixel art drawn at its size or larger (A and C) keeps hard edges.
- **Fairness:** B gets the same dimming as A in each scene.
- **Ground:** A's road strip is hidden, because B brings its own road.

**Limits of the delivered art, not fixed in the game:**
- **Little depth on desktop.** The scene layers don't tile and are only as wide as the view. On desktop they can barely pan, so the cobbles carry the motion. On a phone, where the view is cropped, the layers pan at their own rates. Wider or tiling layers would give more depth.
- **No motion loops.** Clouds, water and reflections are stills; nothing drifts.
- **Size.** The pack is inlined into the single-file build, which grows from 2.7 MB to about 9 MB, and adds about 50 MB of decoded images in memory. Runtime exports at about half resolution would cut both by roughly 4×. That would be a new derived file per layer, so it needs a go-ahead.
- **Garbled text in the Codex files.** `art/manifests/ptuj.json` and `VALIDATION.md` contain double-encoded characters (for example `Ã¢â‚¬â€` for an em dash). Nothing in the game reads those fields.

## Variant C: Claude's pack (preview)

- **The art:** 10 hard-edged pixel-art layers on a 640 × 165 canvas, the heroes' pixel size on desktop, 25 KB together.
- **What it shows:** sunset sky, clouds, hills with vine rows, the castle hill, the town with Minoritski samostan, Mestni stolp and St George, the Drava with the town's reflection and the sun's road, then a meadow and a cobbled promenade, with a few foreground tufts.
- **Motion:** the layers tile with seam-checked edges, so on the road each one scrolls at its own speed. In battle the clouds drift and the river flows.
- **Fitted to the game:** it is laid out for the measured feet positions, with the enemies on the meadow and the heroes on the promenade.
- **The source:** the generator script is the source; run it again rather than editing the PNGs.

## How the connection works

1. **`data/backgrounds.json`**
   - `tests.ptuj`: B = `ptuj`, C = `ptuj-vecer`, share A 50 / B 50 / C 0, `live: false`.
   - `packs`: each pack's manifest, name (shown in the gallery), view, and placement and motion per layer.
2. **`build.py`**
   - **Reading:** it reads both manifest formats: `layers` (C) and the asset-library `layersBackToFront` (B).
   - **Checks:** a layer whose PNG contradicts its manifest (size, alpha) stops the build; a partly committed pack is left out, and everyone sees A.
   - **Output:** it inlines the layers into `dist/index.html`.
3. **`src/backgrounds.js`**
   - **Drawing:** it draws the chosen pack in the road and battle scenes. A foreground layer (`role: foreground`) stands in front of the actors but under the battle UI.
   - **Gallery:** *Liki in karte → Ozadja* shows every built pack.

## Preview and starting the A/B test

- **Preview:** open `dist/index.html?ozadje=B` (or `=C`, or `=A`). A preview never assigns a variant, and the statistics mark it `ozadje-ptuj=B(predogled)`.
- **Starting the test (Game Director's call):** set `tests.ptuj.live` to `true` and rebuild. Each install then draws A or B by `share` and keeps it in localStorage `zg-ab`.
- **Reading the results:** every statistics row (opt-in testers) carries `ozadje-ptuj=A` or `=B`. Useful comparisons:
  - Ptuj battle duration and seconds per word
  - wins and losses
  - how many journeys go on past Ptuj

  These don't record which background people prefer; a one-question rating would need a decision first (OPEN).

## Open for the Game Director

1. **Approval of B:** set `status` to `approved` in `art/manifests/ptuj.json` once you've seen it in the game; the gallery then drops *v pregledu*.
2. **Going live:** set `live: true`.
3. **Size:** runtime-sized exports of the Codex layers (see above).
4. **Season and bridge:** both packs follow the reference's summer evening without a bridge. Ptuj's region text is Pust in winter, and A is snowy.
5. **Variant C:** keep it as a preview or remove it.
6. **Android preview:** `?ozadje=` works in a browser; the Android app would need a tester switch (not built).
