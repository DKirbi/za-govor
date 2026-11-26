# Bled folk-art parallax study

This first slice pass is based on the Bled panorama and sprite pairing in [the Slovenia folk-location previews](../slovenia-folk-location-previews/README.md). It separates the Julian Alps, forested shore, castle cliff, island church, lake, reflections, clouds and the broad grassy travel lane.

Open the [interactive rightward travel preview](preview.html) to scrub or play the scene. The [static layer composite](layered-composite-preview.png) shows the first assembly with Zeleni Jurij and Vila. This panorama is available as opt-in runtime variant B; variant A remains the default pixel-art battle scene.

## Layer stack

| Order | Image | Scene element | First-pass travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Painted sky base | 0.03× |
| 2 | [clouds.png](layers/clouds.png) | Separate cream cloud band with gentle ambient drift | 0.025× |
| 3 | [distant-mountains.png](layers/distant-mountains.png) | Julian Alps ridge | 0.12× |
| 4 | [forested-shoreline.png](layers/forested-shoreline.png) | Forested hills along the far shore | 0.20× |
| 5 | [castle-cliff.png](layers/castle-cliff.png) | Castle and rocky cliff at the left | 0.30× |
| 6 | [lake-water.png](layers/lake-water.png) | Quiet lake surface without landmark reflections | 0.62× |
| 7 | [water-reflections.png](layers/water-reflections.png) | Separate reflected color and ripple overlay | 0.64× |
| 8 | [island-church.png](layers/island-church.png) | Wooded island, church and bell tower | 0.36× |
| 9 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Broad, continuous grassy travel lane with low edge flowers | 1.0× |

The ratios are relative to a rightward camera journey; the scene layers translate left. The lane moves fastest and fills roughly the lower quarter of the viewport with clear standing room. The lake base and reflected landmarks remain separate so water movement can be tuned independently. Clouds use a slow ambient drift as well as a very low camera ratio.

## Preview and layer notes

- The scrubber represents travel from left to right. The heroes approach the island while the shore lane moves at 1.0×, the lake and reflections at about 0.63×, the island and castle at 0.30–0.36×, the far forest at 0.20×, and the mountains at 0.12×.
- Zeleni Jurij and Vila are idle-frame crops from the current game sprite data, displayed with pixelated scaling to preserve the painterly and pixel-art contrast.
- The cutouts are generated and aligned visual slices, not exact pixel extractions. Inspect edge masks, overlap at the castle cliff and island waterline, and the full camera path before using them in a renderer.
- The page respects reduced-motion preferences. Check landscape and portrait mobile crops, character floor clearance and image memory before production use.
- Runtime rendering is handled by the shared parallax system; this study remains the camera-motion reference.
