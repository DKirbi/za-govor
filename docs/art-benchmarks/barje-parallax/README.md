# Ljubljansko barje folk-art parallax study

This first pass separates the approved dawn panorama into a painted sky, clouds, low wetland ridge, a misty meadow transition, and a connected willow-and-pile-dwelling landmark layer. The shallow channels and reeds, water highlights, wide grass travel lane, and near-camera sedges are independent. Keeping the timber houses and their stilts together preserves their relationship to the water as the view moves.

Open the [interactive rightward travel preview](preview.html) to scrub or play the scene. The [static layer composite](layered-composite-preview.png) pairs the scenery with current 48×48 game sprites; the [runtime-pack composite](runtime-pack-composite.png) shows the exported art at game size. The original [background-only illustration](../slovenia-folk-location-previews/barje-folk-background.png) and [scene preview with characters](../slovenia-folk-location-previews/barje-folk-preview.png) are kept as references. This folk scene is available as an opt-in variant B through `?ozadje=B` or the high-quality setting; the disabled A/B test does not randomize it.

## Layer stack and first-pass speeds

| Order | Image | Scene element | Travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Dawn sky, small sun and low mist base | 0.02× |
| 2 | [clouds.png](layers/clouds.png) | Cream-peach cloud band with very slow ambient drift | 0.025× |
| 3 | [distant-wetland-ridge.png](layers/distant-wetland-ridge.png) | Low tree line and far mist | 0.12× |
| 4 | [far-meadow-transition.png](layers/far-meadow-transition.png) | Narrow, hazy marsh meadow below the ridge | 0.20× |
| 5 | [wetland-channels-reeds.png](layers/wetland-channels-reeds.png) | Shallow channels, filled water, reeds and low banks | 0.46× |
| 6 | [willows-and-pile-dwellings.png](layers/willows-and-pile-dwellings.png) | Edge willows and the timber houses with their stilts | 0.38× |
| 7 | [water-reflections.png](layers/water-reflections.png) | Separate soft dawn-light glints on the water | 0.48× |
| 8 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Broad, level, continuous left-to-right travel surface | 1.0× |
| 9 | [near-foreground-sedges.png](layers/near-foreground-sedges.png) | Sparse plants at the bottom corners | 1.22× |

The ratios measure movement relative to the grass lane during the same camera journey. World art translates left while the party advances right. The lane is the 1.0× reference. Close sedges at 1.22× pass a little faster and read nearer the camera; lower them toward 1.1× if they seem detached. The willow-and-dwelling landmarks stay slower than the lane, while the small water glints move only slightly faster than their channels so they do not slide away from the water.

## Preview and source notes

- The scrubber demonstrates a 12-second rightward journey. Zeleni Jurij and Vila move toward each other while the landscape layers drift left at depth-based speeds.
- Zeleni Jurij is the chapter's hero in `src/journey.js`; Vila is one enemy in Ljubljansko barje's regional pool in `data/world.json`. Both use their current game sprites, kept crisp at integer scaling.
- All nine scene layers share a 1672×941 canvas. The transparent cutouts are first-pass aligned interpretations of the approved panorama, not pixel-perfect extractions.
- The preview adds very slow cloud drift and subtle water-highlight pulsing. Both motions are presentation-only, and the page respects reduced-motion preferences.
- The landscape draws on the park's description of meadows, hedgerows and drainage channels, and on the prehistoric pile-dwelling heritage at Ig. The houses are a stylized historical motif, not a claim that stilt houses remain visible in the modern landscape. See the [Ljubljansko barje Landscape Park](https://www.ljubljanskobarje.si/obiscite-park/individualni-obisk/pot-na-mah/english-translations/01-starting-point/) and UNESCO's [Prehistoric Pile Dwellings around the Alps](https://whc.unesco.org/en/list/1363/maps/).
- The `barje-ljudska` runtime pack has nine WebP layers (about 603 KB combined), generated from the unchanged PNG masters. Its background test remains disabled. Review layer seams, landmark placement, actor foot clearance, mobile framing and image budget before considering a live assignment.
