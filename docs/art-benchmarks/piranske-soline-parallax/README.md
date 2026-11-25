# Piranske soline folk-art parallax study

This first parallax pass separates the approved sunset Piranske soline panorama into a sky, slow clouds and sun, Istrian hills, shallow basin water, a salt-worker house and far shore, embankments, reflections, a wide grassy travel lane, and low salt-marsh plants at the near edge.

Open the [interactive rightward travel preview](preview.html) to scrub or play the scene. The [static layer composite](layered-composite-preview.png) shows the assembled pass with current Martin Krpan and Mora idle sprites. The approved flattened [background](../slovenia-folk-location-previews/piran-folk-background.png) and [character preview](../slovenia-folk-location-previews/piran-folk-preview.png) remain unchanged. These are art-direction references; they do not replace the game's pixel-art battle scene or add runtime parallax.

## Layer stack and first-pass speeds

| Order | Image | Scene element | Travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Painted sunset sky base | 0.02× |
| 2 | [setting-sun.png](layers/setting-sun.png) | Separate setting sun | 0.03× |
| 3 | [clouds.png](layers/clouds.png) | Cream clouds with extra slow ambient drift | 0.025× |
| 4 | [distant-istrian-hills.png](layers/distant-istrian-hills.png) | Far Istrian coastline and hills | 0.12× |
| 5 | [salt-pan-water.png](layers/salt-pan-water.png) | Sea and shallow pan water | 0.50× |
| 6 | [salt-pan-far-shore.png](layers/salt-pan-far-shore.png) | Thin salt-tolerant vegetation along the far edge | 0.24× |
| 7 | [salt-worker-house.png](layers/salt-worker-house.png) | House, drying shed, and salt mounds | 0.32× |
| 8 | [salt-pan-embankments.png](layers/salt-pan-embankments.png) | Raised pan walls and crossings | 0.50× |
| 9 | [sunset-reflections.png](layers/sunset-reflections.png) | Separate broken warm glints, clipped to visible water in this study | 0.54× |
| 10 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Wide, continuous travel lane | 1.0× |
| 11 | [near-foreground-salt-grass.png](layers/near-foreground-salt-grass.png) | Sparse close grasses and salt-edge stones | 1.25× |

The ratios measure how far each layer moves relative to the travel lane during the same camera journey. World art translates left as the party advances right. The lane is the 1.0× reference. Midground water at 0.50× and its loose reflections at 0.54× retain a small amount of independent motion without letting highlights drift far from the basins. The near-edge grasses at 1.25× move farther than the lane, which makes them feel close to the camera; keep them low and sparse so they frame the scene without covering character feet.

The 1.25× foreground value is a starting point. If the plants look detached from the ground, bring them toward 1.0×, such as 1.1×. If they barely move, they can feel screen-fixed. Review the full pan, layer seams, and mobile crop before choosing production values.

## Preview and layer notes

- The scrubber demonstrates a 12-second rightward camera journey. Krpan and Mora move toward each other as the background layers drift left at depth-based speeds.
- Krpan and Mora are first-frame crops from the current game sprite sheet, enlarged with nearest-neighbor scaling to preserve the painted-versus-pixel-art contrast. Krpan stands in for the regional heroine Lepa Vida because she has no idle battle sprite in the current sheet; Mora is a Piran-region enemy.
- Generated cutouts share a 1672×941 scene canvas. The house layer was normalized to that canvas; the water, far shore, house, pan walls, reflections and lane are aligned for this composition.
- The reflections are kept separate for later shimmer or subtle offset. The HTML demo adds a restrained opacity shimmer and slow cloud drift; both are preview-only ambient motion.
- Some alpha edges were cleaned after ImageGen baked checkerboard pixels into three cutouts. Review their edges against the original artwork before runtime use. The static composite is a first-pass alignment, not a measured extraction.
- The page respects reduced-motion preferences and works in a responsive landscape viewport. Check portrait crops, character foot clearance, layer seams and image memory before production integration.
- No game renderer or runtime parallax code has changed. These PNGs are references until the mobile camera framing, loop strategy, and asset budget are reviewed.

The coastal setting cues the shallow salt basins, channels and salt-worker heritage described by the [Sečovlje Salina Nature Park overview](https://www.portoroz.si/en/what-to-do/natural-landmarks/obj/13831-secovlje-salina-nature-park). The game places Lepa Vida here as a chapter setting; this is not a claim about the ballad's origin.
