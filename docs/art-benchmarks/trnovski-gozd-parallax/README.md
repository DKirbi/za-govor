# Trnovski gozd folk-art parallax study

This first layer set uses the approved Trnovski gozd preview with its broad, continuous grassy travel lane. It separates the moon and clouds, the high-karst ridge, the doline forest, the framing trees, the lane, and the close rocks and grass at the near edge.

Open the [interactive rightward travel preview](preview.html) to scrub or play the scene. The [static layer composite](layered-composite-preview.png) shows the first assembly with the existing Martin Krpan and Volkodlak idle sprites. These are art-direction references; they do not replace the game's pixel-art battle scene or add runtime parallax.

## Layer stack and first-pass speeds

| Order | Image | Scene element | Travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Painted night-sky base | 0.02× |
| 2 | [moon.png](layers/moon.png) | Separate warm moon disc | 0.03× |
| 3 | [clouds.png](layers/clouds.png) | Sparse cream clouds with slow ambient drift | 0.025× |
| 4 | [distant-karst-ridge.png](layers/distant-karst-ridge.png) | High-karst hills and pale limestone outcrops | 0.12× |
| 5 | [doline-forest.png](layers/doline-forest.png) | Layered wooded doline | 0.28× |
| 6 | [framing-trees.png](layers/framing-trees.png) | Large beech and fir forms at the sides | 0.62× |
| 7 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Wide, continuous lane for left-to-right travel | 1.0× |
| 8 | [near-foreground-rocks-grass.png](layers/near-foreground-rocks-grass.png) | Low rocks and grass tufts at the lower edges | 1.25× |

The ratios describe how far each layer moves relative to the travel lane during the same camera journey. The scene artwork translates left as the party advances right. The lane is the 1.0× reference; a distant hill at 0.12× moves only a little, while very close rocks at 1.25× move slightly farther than the lane. That extra motion makes the rocks feel close to the camera instead of stuck to the screen. Keep the near props low and near the edges so they do not obscure character feet.

The 1.25× value is a starting point, not a fixed rule. If the rocks look detached from the lane, bring them closer to 1.0×, such as 1.1×. If they barely move, they can feel screen-fixed. Review the full pan and mobile crop before choosing production values.

## Preview and layer notes

- The scrubber demonstrates a 12-second rightward camera journey. The heroes move through the broad grassy clearing toward the doline.
- Krpan and Volkodlak are first-frame crops from the current game sprite sheets, shown with pixelated scaling to preserve the painted/pixel contrast.
- Generated cutouts are full-scene transparent layers aligned for this study, not exact pixel extractions. Review their overlap edges, the lane horizon, and the foreground drift at the beginning, middle, and end of the pan.
- The page respects reduced-motion preferences. Check landscape and portrait crops, character floor clearance, layer seams and image memory before production use.
- No game renderer or runtime parallax code has been changed.
