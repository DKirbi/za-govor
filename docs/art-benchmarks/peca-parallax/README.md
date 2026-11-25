# Peca folk-art parallax slices

The source is the approved [Peca folk-art background](../slovenia-folk-location-previews/peca-folk-background.png), shown earlier with the existing Kralj Matjaž and Škrat pixel sprites in the [character contrast preview](../slovenia-folk-location-previews/peca-folk-preview.png). This first slice pass turns that panorama into independently movable layers. It is a concept/reference pack and does not replace the in-game background or change the game renderer.

Open the [interactive Peca pan](preview.html) to scrub the layers or play a 12-second approach to the cave. The assembled [static layer preview](layered-composite-preview.png) shows how the layers fit together.

## Layer stack

| Order | Image | Use | Starting camera ratio |
| --- | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Folk-painted blue-grey sky base | 0.08× |
| 2 | [clouds.png](layers/clouds.png) | Separate slow-drifting cream cloud band | 0.025× + ambient drift |
| 3 | [distant-hills.png](layers/distant-hills.png) | Low blue-green far ridges | 0.16× |
| 4 | [peca-mountain.png](layers/peca-mountain.png) | Forested Karavanke slope and rocky Peca summit | 0.28× |
| 5 | [midground-forest.png](layers/midground-forest.png) | Fir and deciduous foothill tree band | 0.36× |
| 6 | [cave-rock.png](layers/cave-rock.png) | Pale limestone outcrop and readable cave entrance | 0.44× |
| 7 | [foreground-ground.png](layers/foreground-ground.png) | Continuous near-ground strip and path | 1.0× |
| 8 | [foreground-oak.png](layers/foreground-oak.png) | Left-edge foreground oak and attached shrubs | 0.82× |

The ratios are first-pass fractions of horizontal camera travel. As the camera advances right, the panorama moves left. Keep far hills slow, the cave and foothill forest more apparent, and the near ground fastest. Let the cloud layer drift gently on its own. Peca has no river in this composition, so there is no water or reflection layer.

## Review and implementation notes

- The scene is built from the approved Peca panorama; the cave entrance and rocky summit remain the main landmarks.
- The transparent cuts were generated as separate images and positioned in the preview. They preserve the broad shapes and palette but are not pixel-exact extractions; inspect their edges and overlaps before production use.
- Keep the near-ground top continuous across the viewport so the forest cannot reveal a sky-colored gap. Preserve a clear battle floor and keep plants below ankle height.
- Keep Kralj Matjaž and Škrat in the existing crisp pixel-art style. The prior character/background composite remains available as the sprite-contrast reference.
- Check all camera positions for layer edges and mobile crops. These images are for art direction; production exports, renderer integration, and device-specific framing remain future work.
