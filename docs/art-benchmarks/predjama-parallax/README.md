# Predjamski grad folk-art parallax study

This first pass separates the approved Predjama panorama into a painted sky, slow clouds, distant Karst forest, and a single castle-and-cliff layer. The Lokva stream, broad grass travel lane, and near-edge rocks and plants remain separate for depth motion. Keeping the castle attached to its cliff preserves the landmark's geography as the camera travels.

Open the [interactive rightward approach preview](preview.html) to scrub or play the scene. The [static layer composite](layered-composite-preview.png) pairs the layers with Erazem and Perkmandeljc; the [runtime-pack composite](runtime-pack-composite.png) shows the exported art at game size. The approved flattened [background](../slovenia-folk-location-previews/predjama-folk-background.png) and [character preview](../slovenia-folk-location-previews/predjama-folk-preview.png) remain unchanged. This folk scene is available as an opt-in variant B through `?ozadje=B` or the high-quality setting; the disabled A/B test does not randomize it.

## Layer stack and first-pass speeds

| Order | Image | Scene element | Travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Muted slate and peach sky base | 0.02× |
| 2 | [clouds.png](layers/clouds.png) | Pale late-afternoon clouds with slow ambient drift | 0.025× |
| 3 | [distant-karst-forest.png](layers/distant-karst-forest.png) | Rounded forested ridge and limestone outcrops | 0.12× |
| 4 | [castle-cliff.png](layers/castle-cliff.png) | Predjama Castle, enclosing cliff and cave mouth as one landmark | 0.38× |
| 5 | [lokva-stream.png](layers/lokva-stream.png) | Short stream and spill from the cave opening | 0.42× |
| 6 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Wide, level left-to-right travel surface | 1.0× |
| 7 | [near-foreground-rocks-grass.png](layers/near-foreground-rocks-grass.png) | Low limestone rocks and sparse plants at the frame edge | 1.25× |

The ratios measure how far each layer moves relative to the lane during the same camera journey. World art translates left as the party advances right. The lane is the 1.0× reference. The cliff and castle move together so their relationship cannot drift; the stream is only slightly faster at 0.42×, preserving its connection to the cave while giving it a hint of independent water motion. Close rocks at 1.25× pass farther than the lane, which makes them feel near the camera. If they appear detached from the ground, lower them toward 1.1×.

## Preview and layer notes

- The scrubber demonstrates a 12-second rightward approach. Erazem and Perkmandeljc move toward each other while the painted layers drift left at depth-based speeds.
- Erazem uses his current 48×48 idle sprite. Perkmandeljc uses the game's Škrat sprite crop with the same hue rotation and palette treatment used by the game.
- All seven scene layers share a 1672×941 canvas. Their first-pass alignment follows the approved background composition; they are not measured pixel extractions.
- The page adds very slow cloud drift and a restrained stream glint. Both are preview-only ambient motion.
- The page respects reduced-motion preferences and keeps the scene in a responsive landscape frame. Review mobile landscape and portrait crops, cliff placement, actor foot clearance, layer seams and image memory before a live assignment.
- The `predjama-ljudska` runtime pack has seven WebP layers (about 480 KB combined), generated from the unchanged PNG masters. Its background test remains disabled. Review the camera, loop strategy, mobile framing and asset budget before considering a live assignment.

The castle's cliff setting and the Lokva disappearing underground below it follow the [official Predjama Castle overview from Postojna Cave Park](https://www.postojnska-jama.eu/en/predjama-castle). This folk-art panorama is a stylized scene, not a surveyed reconstruction.
