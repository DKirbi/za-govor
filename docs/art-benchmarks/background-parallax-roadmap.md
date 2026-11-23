# Folk-art backgrounds and parallax roadmap

The campaign currently has ten implemented battle backgrounds. Their order and `bg` keys come from [`data/world.json`](../../data/world.json); [`src/game.js`](../../src/game.js) provides the background descriptions and lookup. The backgrounds currently rendered in-game are the small pixel-art scenes in the art bundle. The folk-painted panoramas in `docs/art-benchmarks/` are a separate visual direction and are not wired into the battle renderer.

## Implemented campaign backgrounds

| Order | Campaign region | Runtime key | Game background | Folk-art reference / next step |
| ---: | --- | --- | --- | --- |
| 1 | Ptuj | `ptuj` | Implemented pixel-art scene | Folk panorama already reviewed. First separate slices and motion preview are in [Ptuj parallax study](ptuj-parallax/README.md). |
| 2 | Peca | `peca` | Implemented pixel-art scene | Approved folk panorama; first-pass layers and camera preview are in the [Peca parallax study](peca-parallax/README.md). |
| 3 | Triglav | `triglav` | Implemented pixel-art scene | Approved side-scrolling panorama; the first slices and motion preview are in the [Triglav parallax study](triglav-parallax/README.md). |
| 4 | Bled | `bled` | Implemented pixel-art scene | First-pass layers and rightward camera preview are in the [Bled parallax study](bled-parallax/README.md). |
| 5 | Trnovski gozd | `gozd` | Implemented pixel-art scene | First-pass layers and near-foreground motion guide are in the [Trnovski gozd parallax study](trnovski-gozd-parallax/README.md). |
| 6 | Piranske soline | `piran` | Implemented pixel-art scene | Make a folk-art preview, get approval, then slice. |
| 7 | Predjamski grad | `predjama` | Implemented pixel-art scene | Make a folk-art preview, get approval, then slice. |
| 8 | Ljubljansko barje | `barje` | Implemented pixel-art scene | Make a folk-art preview, get approval, then slice. |
| 9 | Ljubljanica | `ljubljanica` | Implemented pixel-art scene | Existing [side-view Triple Bridge battle preview](slovenia-folk-location-previews/ljubljanica-folk-preview.png) and [parallax slice study](ljubljanica-parallax/README.md); review the scene before any production slicing. |
| 10 | Ljubljanski grad | `grad` | Implemented pixel-art scene | Make a folk-art preview, get approval, then slice. |

The folk-art panorama references currently cover Ptuj, Peca, Triglav, Bled, Trnovski gozd and Ljubljanica. The Ljubljana Barje and Castle art functions were added to the game background bundle in the `Folk-art-BGs` branch; they still need folk-art previews before they can be sliced in this visual style.

## Work order

- [x] Create branch `Folk-art-BGs` with the existing folk landscape references and the full ten-scene game background set.
- [x] Finish the first Ptuj layer pass: sky, clouds, distant hills, castle hill, town, Drava water, reflections, near-bank oak and foreground path.
- [x] Create a Ptuj layer-composite image and an interactive camera-pan preview.
- [ ] Review the Ptuj cutout edges and layer placement during runtime integration; the current slices are art-direction references and have not replaced game assets.
- [x] Complete the Peca first-pass layer set from the approved character/background preview and create a static composite plus an interactive camera-pan preview.
- [x] Complete the first Triglav layer set and left-to-right travel preview. Keep the continuous grassy route faster than the scenery.
- [x] Complete the Bled first-pass layer set: sky, clouds, Julian Alps, forested shore, castle cliff, island church, separate lake and reflections, and a broad grassy travel lane. Create a static composite and rightward camera preview.
- [x] Complete the Trnovski gozd first-pass layer set: night sky, moon, clouds, karst ridge, doline forest, framing trees, wide grass lane, and separate near-edge rocks/grass. Create the static composite and rightward travel preview; demonstrate close foreground at 1.25× lane speed.
- [ ] **Next: Piranske soline.** Create its folk-art preview first and wait for scene approval before slicing.
- [ ] Continue in campaign order after Trnovski gozd: Piranske soline, Predjama, Ljubljansko barje, Ljubljanica, then Ljubljanski grad.
- [ ] For each remaining region, create the folk-art scene preview first and pause for approval before generating its slices. The existing Ljubljanica preview still needs review before any new production slicing.
- [ ] After each scene's slices are approved, tune parallax speeds, cloud/water/ambient motion, character staging, reduced-motion behavior, and mobile landscape/portrait framing in the battle viewport.

## Layer workflow

1. Start from the region's approved folk-art panorama and keep it as an untouched reference.
2. Show the proposed scene with the relevant existing pixel-art hero/enemy sprites; settle the landmark view and battle-space composition before slicing.
3. Create independently positionable, transparent landmark/foreground layers and separate environmental overlays such as clouds and water reflections. Keep base surfaces such as sky and water filled where appropriate.
4. Assemble a static image and a scrub-able preview to inspect alignment before writing runtime integration notes.
5. Keep exported concept files out of the runtime bundle until dimensions, transparency edges, mobile framing and asset budget have been reviewed.

For side-scrolling roads, keep the travel lane continuous from the left edge to the right edge, broad enough for the heroes to read clearly, and place it in a foreground layer that travels faster than the distant scenery.

These folk-art studies complement the in-game pixel scenes. They do not change game code by themselves, and each region should remain a preview plus slice set until its art is confirmed.
