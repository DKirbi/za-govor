# Region backgrounds — roster benchmark

**Status:** PROPOSED convention, derived from the Ptuj packs in PR #34 (sunset B, winter D). Nothing here approves a
region's art. The Game Director approves each pack. Composition and depth rules stay as in
`docs/art-benchmarks/ptuj-battle-depth/README.md`; the file rules as in `docs/art-workflow/GRAPHICS_HARNESS_PREPARATION.md`.

Use this to brief and review the high-fidelity background of every remaining region.

## 1. Two tiers

| Tier | What it is | Where |
|---|---|---|
| *Nizka* | the picture already in the game, 384 × 120 px, one image | `BG` in `src/game.js` / `src/art-extra.js`; every region has one |
| *Visoka* | a layered parallax pack, drawn in the travel and battle scenes | `art/manifests/<pack>.json` + `data/backgrounds.json`; only Ptuj so far |

*Nastavitve → Razvoj → Kakovost slik* picks the tier. A region's *Visoka* pack is variant **B** of its test in
`data/backgrounds.json`, so the fidelity switch works for any region without code. A seasonal pack (Ptuj's winter, D)
is a further variant the Game Director assigns.

## 2. Canvas and placement

- **Compose for the game view, 1672 × 560 px.** The Ptuj packs were drawn on 1672 × 941 and had to be moved and cut to
  fit (the sky by −252 px, the castle hill scaled to 0.6, the road scaled 1.3×). Drawing for 1672 × 560 avoids that
  and keeps files smaller.
- **Ground:** the walkable surface starts at 58 % of the view height (y ≈ 325) and runs to the bottom.
- **Actors:** enemies' feet fall at 62–70 % of the scene height, heroes' at 75–87 %. Keep that band readable: no strong
  detail, bright highlight or busy texture where they stand.
- **Hero staging:** left of centre, with landscape visible on both sides (ptuj-battle-depth §Composition).
- `data/backgrounds.json` still sets each layer's `x`, `y`, `scale`, `pan`, `speed`, `drift` and `front` against the
  real scene. Those values are tuned in the browser by the integrator, not specified by the art.

## 3. Layers

Each depth plane is its own transparent PNG, back to front. Use the roles that fit the region; not every region needs
every one.

| Role | Ptuj example | Tiles | Motion |
|---|---|---|---|
| sky | `sky` | no | none (opaque, the only layer without alpha) |
| clouds | `clouds` | horizontally | slow drift, still under reduced motion |
| far landscape | `distant-hills` | no | pans slowly |
| landmark | `castle-hill` | no | pans |
| settlement / middle ground | `town`, `riverbank-trees` | no | pans |
| water, wall, bridge | `drava-water`, `riverbank-wall`, `bridge` | no | pans |
| reflections | `reflections` | no | pans with its water |
| ground | `road-tile` | **horizontally, seamless** | scrolls with the walk (speed 1) |
| foreground | `foreground` | no | static; drawn over the actors |

- **Ground tiles** join left to right with no seam. Check at 1× and in a three-copy preview.
- **Foreground** may cover the actors only up to the ankle line, occasionally and not in a continuous strip
  (ptuj-battle-depth §Foreground).
- **Landmarks are the region's identity** (column *Landmark* below). Research them; record sources and what is
  stylised, as Ptuj's `VALIDATION.md` does for the castle and the bridge.

## 4. Files and size

- `art/source/environments/<pack>/` masters, `art/exports/environments/<pack>/` cropped exports with offsets in the
  manifest, `art/previews/environments/<pack>/` one JPG composite per variant and one JPG road-repeat preview.
  No PNG twin of a JPG preview, no previews in `source/`.
- **Size is OPEN.** The game is one HTML file with every picture embedded as base64. Ptuj's two PNG packs are 5.5 MB
  and 6.3 MB of an 18.5 MB build. WebP at quality 90 would make each about 0.45 MB (proposed 18 Nov, awaiting the Game
  Director). Ten regions at the current PNG size would be too large for the Android build, so settle the format before
  the next pack is integrated.

## 5. Manifest and validation

Copy `art/manifests/ptuj.json`: per layer `id`, `season`, `source`, `export`, `sourceSize`, `exportSize`, `offset`,
`alpha`, `tileable`, `animation`, `role`/`depthRole`; `variants` with their previews; `knownLimitations`; `research`.
`build.py` refuses a pack whose files or sizes disagree with its manifest, and reports its size.

## 6. Connect it to the game

In `data/backgrounds.json`: a `packs.<id>` entry (manifest, `name` in Slovene for *Liki in karte → Ozadja*,
`hideRoad`, `view`, per-layer placement), then `tests.<bg key>` with `variants.B = <id>`, `share` and `live: false`.
The bg key is the region's `bg` in `data/world.json`. `?ozadje=B` previews it; the test stays off until the Game
Director turns it on.

## 7. Review checklist

- [ ] Composed for 1672 × 560: ground from about 58 %, no layer placed outside the view.
- [ ] The landmark reads at phone size; actors stand clear in their band.
- [ ] Ground tile has no seam; foreground stays at or below the ankle line.
- [ ] Only clouds (and, if wanted, water) move; reduced motion is a still picture.
- [ ] Previews are JPG, labelled as previews; manifest matches the files; `python3 build.py` builds.

## 8. Regions

From `data/world.json`, `BG_INFO` (`src/game.js`) and `docs/progression-design.md`.

| # | Region | bg key | Landmark | Home hero | *Nizka* | *Visoka* |
|---|---|---|---|---|---|---|
| 1 | Ptuj | `ptuj` | castle above the town on the Drava | Kurent | yes | **sunset (B) and winter (D)**, PR #34 |
| 2 | Peca | `peca` | King Matjaž's cave | Kralj Matjaž | yes | none |
| 3 | Triglav | `triglav` | the three peaks above larches | Ajdovska deklica | yes | none |
| 4 | Bled | `bled` | island church, castle on the cliff | — (Kresnik anywhere) | yes | none |
| 5 | Trnovski gozd | `gozd` | moonlit forest, eyes between trunks | Martin Krpan | yes | none |
| 6 | Piranske soline | `piran` | salt pans, Piran at sunset | Lepa Vida | yes | none |
| 7 | Predjamski grad | `predjama` | the castle in the cliff | Erazem Predjamski | yes | none |
| 8 | Ljubljansko barje | `barje` | pile dwellings in the morning mist | Zeleni Jurij | yes | none |
| 9 | Ljubljanica | `ljubljanica` | Tromostovje, houses, the castle far off | Peter Klepec | yes | none (boss: Povodni mož) |
| 10 | Ljubljanski grad | `grad` | the castle wall at sunset | — | yes | none (final boss: Lintvern) |

Suggested order: road order, Peca next. Every journey walks the regions in this order, so the early ones are seen most.
