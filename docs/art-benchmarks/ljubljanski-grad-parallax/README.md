# Ljubljanski grad folk-art parallax study

This first pass separates the approved sunset panorama into a painted sky, independent clouds, distant basin hills and Ljubljana's old-town roofline. The castle stays joined to its wooded hill so the landmark does not drift away from the terrain. The broad grass lane, edge trees and near-camera flowers are separate layers.

Open the [interactive rightward approach preview](preview.html) to scrub or play the scene. The [static layer composite](layered-composite-preview.png) checks the full stack with the current game sprites. The original [background-only illustration](../slovenia-folk-location-previews/ljubljanski-grad-folk-background.png) and [approved scene preview](../slovenia-folk-location-previews/ljubljanski-grad-folk-preview.png) remain unchanged references. This is an art-direction study; it does not replace the game's pixel-art battle scene or add runtime parallax.

## Layer stack and first-pass speeds

| Order | Image | Scene element | Travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Sunset sky and sun | 0.02× |
| 2 | [clouds.png](layers/clouds.png) | Separate warm cloud shapes with slow ambient drift | 0.025× |
| 3 | [distant-basin-hills.png](layers/distant-basin-hills.png) | Low, distant basin and mountain silhouettes | 0.12× |
| 4 | [ljubljana-old-town.png](layers/ljubljana-old-town.png) | Roofs and towers behind the castle hill | 0.22× |
| 5 | [castle-hill-and-fortress.png](layers/castle-hill-and-fortress.png) | Castle walls, towers and connected wooded hill | 0.38× |
| 6 | [near-foreground-tree-frame.png](layers/near-foreground-tree-frame.png) | Close framing trees at the scene edges | 1.08× |
| 7 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Wide, continuous left-to-right travel surface | 1.0× |
| 8 | [near-foreground-flowers.png](layers/near-foreground-flowers.png) | Sparse bottom-corner plants | 1.22× |

Speeds are relative to the grass lane during the same camera move. The lane is the 1.0× reference. Distant scenery moves slowly; close edge trees and flowers move a little faster to show depth. The castle and forested hill share one cutout and one speed so their attachment remains stable. The initial ratios are visual guidance and may need adjustment once tested in the battle viewport.

## Preview and source notes

- The scrubber demonstrates a 12-second rightward approach. Krpan moves toward the Lintvern boss while the painted landscape slides left at depth-based speeds.
- Krpan is a party-sprite stand-in for staging this location; Lintvern is the existing game boss sprite. Both remain crisp at integer-scaled pixel dimensions.
- Each of the eight scene layers shares a 1672×941 canvas. Transparent cutouts are aligned interpretations of the approved panorama, not pixel-perfect extractions.
- Clouds drift slowly as a separate ambient motion. This inland scene has no water or reflection layer.
- Ljubljana Castle is presented on a wooded hill above the city's roofs, based on [Visit Ljubljana's castle overview](https://www.visitljubljana.com/en/poi/ljubljana-castle) and the [castle's history page](https://www.ljubljanskigrad.si/en/why-to-the-castle/history-of-the-castle-en-us/). The image is a stylized concept, not a surveyed reconstruction.
- No game renderer or runtime parallax code has changed. Review layer seams, landmark placement, actor foot clearance, mobile framing, asset memory and image budget before runtime integration.
