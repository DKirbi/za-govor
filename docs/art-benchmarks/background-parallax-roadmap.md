# Folk-art backgrounds and parallax roadmap

**In game (draft, 26 Nov 2026):** all ten folk studies are built as **variant B** of each region's background test (`data/backgrounds.json`, `live: false`:
preview with `?ozadje=B` or *Kakovost slik → Visoka*). On Ptuj the folk pack is B and the earlier
sunset pack moved to **E**. `tools/art_folk_parallax.py` makes the game layers from Codex's study PNGs, which stay
unchanged: resized into one 996×560 view as Codex's composites place them, WebP q80. Nothing is drawn.

- **Speeds** are Codex's ratios against the walking lane (1.0), measured by `tests/parallax.test.js`. Changes, all
  reported to the Game Director: layers drawn over the lane move at least as fast as it (Game Director, 25 Nov: oak
  0.82 → 1.1, Triglav spruces 0.72 → 1.1 and flowers 0.88 → 1.15); the Ljubljanica bridge 0.40 → 0.55 (over its river
  at 0.50) and its road 0.90 → 1.0; skies no faster than their clouds (Ptuj and Peca sky 0.08 → 0.02, Ljubljanica
  clouds 0.035 → 0.1); Bled's lake 0.62 → 0.36, so the island (0.36) and its reflection (0.34) stay on the water.
- **No slice floats over the lane (Game Director, 27 Nov 2026, from a phone).** Where a slice's lowest paint ended
  above the lane's top edge, the sky and the far hills showed under it, so the forest (and on Bled the lake, on Piran
  the salt pans, on Barje the channels, on Trnovski gozd and Ljubljanski grad the edge trees) seemed to float. Measured
  over many scroll positions, 14–96 % of the columns of seven packs had such a gap (up to 28 canvas px). The export
  tool's new `floor` option grounds a slice: under its lowest paint, in the columns whose paint reaches its lower part,
  a base is painted down to 8 px under the lane's lowest top edge. Now under 0.5 % of columns (`tests/parallax.test.js`,
  *no slice floats over the lane*). The masters are unchanged.
  - **Painted bases (Game Director, 27 Nov 2026 evening: "paint proper bases").** The base continues the slice's own
    painting rather than a flat colour: its densest band of rows mirrored downwards, so the forest goes on as forest
    undergrowth, Bled's lake as water and Barje's channels as reeds; a wide hole in that band (Triglav's forest has an
    arch) is cloned from the paint beside it, from the shadier side; edge trees without a dense band continue each
    column's own paint, so a trunk goes on as a trunk. Shaded a little deeper the lower it lies. The base is painted on
    the finished tile, so it wraps the way the tile repeats (painted before the tile was mirrored, it made a mirrored
    blob on the seam). If Codex paints bases, they replace these.
- **Triglav's spruces are near trees the party walks past (Game Director, 27 Nov 2026).** Codex's edge trees were
  lifted 40 % up the scene and slid at 1.1 over the forest with their trunks in mid-air. They are now 1.6 × as large,
  blurred (out of focus, close to the eye, `blur` in the export tool), their trunks below the scene's bottom edge, at
  1.35 in front of the party and the flowers (`passing`): only on the road, never in battle, and faded while the party
  stands at a stop, so they cover the heroes only for a moment while they walk.
- **Passing trees in every wooded region (Game Director, 27 Nov 2026 evening).** Peca, Trnovski gozd and Ljubljanski
  grad get the same near trees, a `passing-trees` layer each. Their own edge trees (Gozd's framing trees, Grad's oaks)
  are cut by the picture's sides: the tool mirrors such a picture into a double tree and cannot pad it, so a huge tree
  would always be on screen. Until Codex paints passing trees for them, Triglav's whole clumps stand in (`study`),
  mirrored (`flip`) and graded to each region's light (`tint`: moonlit blue for Trnovski gozd, sunset warmth for
  Ljubljanski grad, as they are for Peca's autumn forest). About 40 KB each.
- **The four later packs (27 Nov 2026, reviewed on phones by `tests/parallax-phone.test.js`; PROPOSED, for the Game
  Director to confirm).** The same rules: nothing drawn in front of a layer moves slower than it, and things that stand
  on one another move together, or one slides along the other while the party walks.
  - *Piranske soline:* Codex's water picture holds both the sea at the horizon and the salt pans, at 0.50, so the sea
    slid behind the far shore (0.24) and the house (0.32). `tools/art_folk_parallax.py` now cuts it in two along the
    shore (`rows`): **sea 0.20** behind the shore, **pans 0.50** in front of it; the rows between lie under the
    shore's opaque strip, so the still picture is unchanged. The house stands on the far shore: **both 0.28**. The sun
    sits in the sky behind the clouds: **0.03 → 0.02**, with the sky.
  - *Predjamski grad:* the Lokva falls out of the cliff: **stream 0.42 → 0.38**, with the castle cliff (same period).
  - *Ljubljansko barje:* the willows and pile dwellings stand in the channels: **landmarks 0.38 → 0.46**. The channels
    picture is an island with tapered ends; tiled as it was, a wedge of dawn sky showed down to the lane between two
    copies. Each copy's tapered end now overlaps the next copy's start (`wrap`, 170 px).
  - *Ljubljanski grad:* the edge trees are drawn behind the lane, rooted at its far edge, but moved faster than it
    (1.08): **1.08 → 1.0**, so their trunks do not slide along the grass.
  - *Cloud drift:* Codex's −0.2 to −0.5 px/s is about one screen pixel every 5–11 s on a phone, i.e. still; the four
    packs now drift at −1.2 like the other six.
- **Seams:** a tiling layer whose picture is cut by its side is joined to its mirror image (Game Director, 25 Nov);
  landmarks clear of both sides are padded so they come round only every 2–3 view widths. Codex may deliver true
  seamless tiles later, which would replace the mirror joins.
- **Lanes** follow the actors' feet in battle (`stand`) but never sink below their painted place (`riseOnly`); the
  lane's mirror image below it lets it rise. Low front layers keep under the lowest feet (`below`). `focusY` picks the
  band a wide desktop scene shows, so the landmark stays in view.
- **CONFIRMED (Game Director, 25 Nov): Ptuj should always be winter.** Codex's Ptuj study is not a winter scene, so a
  winter redraw is to be requested from Codex; the folk Ptuj stands in as B until then.

The campaign currently has ten implemented battle backgrounds. Their order and `bg` keys come from [`data/world.json`](../../data/world.json); [`src/game.js`](../../src/game.js) provides the background descriptions and lookup. Variant A remains the normal-quality pixel-art scene. All ten reviewed folk packs are available as variant B through `?ozadje=B` or the high-quality setting; their background tests are disabled, so they are not randomly assigned.

## Implemented campaign backgrounds

| Order | Campaign region | Runtime key | Game background | Folk-art reference / next step |
| ---: | --- | --- | --- | --- |
| 1 | Ptuj | `ptuj` | Implemented pixel-art scene | Folk panorama, first separate slices, motion preview and opt-in runtime variant B are in the [Ptuj parallax study](ptuj-parallax/README.md). The winter variant remains a separate art-direction requirement. |
| 2 | Peca | `peca` | Implemented pixel-art scene | Approved folk panorama, first-pass layers, camera preview and opt-in runtime variant B are in the [Peca parallax study](peca-parallax/README.md). |
| 3 | Triglav | `triglav` | Implemented pixel-art scene | Approved side-scrolling panorama, first slices, motion preview and opt-in runtime variant B are in the [Triglav parallax study](triglav-parallax/README.md). |
| 4 | Bled | `bled` | Implemented pixel-art scene | First-pass layers, rightward camera preview and opt-in runtime variant B are in the [Bled parallax study](bled-parallax/README.md). |
| 5 | Trnovski gozd | `gozd` | Implemented pixel-art scene | First-pass layers, near-foreground motion guide and opt-in runtime variant B are in the [Trnovski gozd parallax study](trnovski-gozd-parallax/README.md). |
| 6 | Piranske soline | `piran` | Implemented pixel-art scene | Approved layers and rightward preview plus opt-in runtime variant B are in the [Piranske soline parallax study](piranske-soline-parallax/README.md). |
| 7 | Predjamski grad | `predjama` | Implemented pixel-art scene | Approved [castle-in-cliff scene](slovenia-folk-location-previews/predjama-folk-preview.png), layers, rightward preview and opt-in runtime variant B are in the [Predjama parallax study](predjama-parallax/README.md). |
| 8 | Ljubljansko barje | `barje` | Implemented pixel-art scene | Approved [dawn wetland scene](slovenia-folk-location-previews/barje-folk-preview.png), layers, rightward preview and opt-in runtime variant B are in the [Barje parallax study](barje-parallax/README.md). |
| 9 | Ljubljanica | `ljubljanica` | Implemented pixel-art scene | Approved [side-view Triple Bridge scene](slovenia-folk-location-previews/ljubljanica-folk-preview.png), first-pass layers/camera preview and opt-in runtime variant B in the [Ljubljanica parallax study](ljubljanica-parallax/README.md). |
| 10 | Ljubljanski grad | `grad` | Implemented pixel-art scene | Approved [sunset castle scene](slovenia-folk-location-previews/ljubljanski-grad-folk-preview.png); first-pass layers, rightward camera preview and opt-in runtime variant B are in the [Ljubljanski grad parallax study](ljubljanski-grad-parallax/README.md). |

All ten campaign regions now have folk-art panorama references, first-pass parallax studies and opt-in runtime packs. The A/B tests remain disabled. On 27 Nov 2026 all ten were measured on four phone screens while the party runs (`tests/parallax-phone.test.js`: speeds frame by frame, road objects on the lane, feet, front layers, holes, seams); final speed approval is the Game Director's.

## Work order

- [x] Create branch `Folk-art-BGs` with the existing folk landscape references and the full ten-scene game background set.
- [x] Finish the first Ptuj layer pass: sky, clouds, distant hills, castle hill, town, Drava water, reflections, near-bank oak and foreground path.
- [x] Create a Ptuj layer-composite image and an interactive camera-pan preview.
- [ ] Review the Ptuj cutout edges and layer placement during runtime integration; the current slices are art-direction references and have not replaced game assets.
- [x] Complete the Peca first-pass layer set from the approved character/background preview and create a static composite plus an interactive camera-pan preview.
- [x] Complete the first Triglav layer set and left-to-right travel preview. Keep the continuous grassy route faster than the scenery.
- [x] Complete the Bled first-pass layer set: sky, clouds, Julian Alps, forested shore, castle cliff, island church, separate lake and reflections, and a broad grassy travel lane. Create a static composite and rightward camera preview.
- [x] Complete the Trnovski gozd first-pass layer set: night sky, moon, clouds, karst ridge, doline forest, framing trees, wide grass lane, and separate near-edge rocks/grass. Create the static composite and rightward travel preview; demonstrate close foreground at 1.25× lane speed.
- [x] Complete the Piranske soline first pass: separate the basins, reflections, far shore, house, embankments, wide travel lane and close salt grass; add the rightward camera preview.
- [x] Create and approve the Predjamski grad scene preview with Erazem and a regional Perkmandeljc on the broad travel lane.
- [x] Complete Predjama's first parallax pass with a castle-and-cliff landmark layer, separate sky and clouds, Karst ridge, Lokva stream, broad travel lane, near-edge rocks/grass, static composite and camera preview.
- [x] Create and approve the Ljubljansko barje scene preview with Zeleni Jurij and a regional Vila on a broad grass lane.
- [x] Complete Barje's first parallax pass with a separate dawn sky and clouds, low wetland ridge, far-meadow transition, willows and pile dwellings, reed-lined channels, water highlights, wide travel lane, near-edge sedges, static composite and rightward camera preview.
- [x] Export Piranske soline, Predjama and Barje as review-only runtime packs with separate WebP layers, preserve their PNG masters, keep their tests disabled and create game-size composites.
- [x] Preserve the existing approved Ljubljanica side-view scene and first-pass slice study; review its alignment before runtime integration.
- [x] Create and approve the Ljubljanski grad sunset scene preview; complete the first layer set with separate sky, clouds, distant hills, old-town roofs, connected castle hill, edge trees, wide grass lane, near flowers, static composite and interactive approach preview.
- [x] Add Ljubljanski grad as a review-only runtime pack: export eight WebP layers, keep the PNG masters, add variant B with the test disabled, and create a game-size composite.
- [x] Measure all ten packs on phones (portrait 360×640, 390×844, 412×915 and landscape 844×390) while the party runs; fix the depth-order breaks of Piran, Predjama, Barje and Ljubljanski grad and the Barje channels gap (27 Nov 2026).
- [ ] After each scene's slices are approved, the Game Director confirms the speeds; then cloud/water/ambient motion and character staging.

## Layer workflow

1. Start from the region's approved folk-art panorama and keep it as an untouched reference.
2. Show the proposed scene with the relevant existing pixel-art hero/enemy sprites; settle the landmark view and battle-space composition before slicing.
3. Create independently positionable, transparent landmark/foreground layers and separate environmental overlays such as clouds and water reflections. Keep base surfaces such as sky and water filled where appropriate.
4. Assemble a static image and a scrub-able preview to inspect alignment before writing runtime integration notes.
5. Keep exported concept files out of the runtime bundle until dimensions, transparency edges, mobile framing and asset budget have been reviewed.

For side-scrolling roads, keep the travel lane continuous from the left edge to the right edge, broad enough for the heroes to read clearly, and place it in a foreground layer that travels faster than the distant scenery.

These folk-art studies complement the in-game pixel scenes. They do not change game code by themselves, and each region should remain a preview plus slice set until its art is confirmed.
