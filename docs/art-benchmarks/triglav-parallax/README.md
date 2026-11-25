# Triglav folk-art parallax study

This first layer pack uses the revised [Triglav folk panorama](../slovenia-folk-location-previews/triglav-folk-background.png). The mountain wall has natural rock contours without a human portrait. Its travel lane is a wide, level grassy route running left to right so a camera pan can carry the heroes forward.

Open the [interactive side-scroll preview](preview.html) to scrub or play the approach. The [static layer composite](layered-composite-preview.png) shows the first assembly. These are art-direction references; they do not replace the game's pixel-art battle scene or add runtime parallax.

## Layer stack

| Order | Image | Scene element | First-pass travel ratio |
| ---: | --- | --- | ---: |
| 1 | [sky.png](layers/sky.png) | Painted sky base | 0.03× |
| 2 | [clouds.png](layers/clouds.png) | Separate cream cloud bands with gentle ambient drift | 0.025× |
| 3 | [distant-foothills.png](layers/distant-foothills.png) | Continuous cool green valley slopes | 0.12× |
| 4 | [distant-peaks.png](layers/distant-peaks.png) | Three snowy Julian Alpine summits | 0.16× |
| 5 | [midground-forest.png](layers/midground-forest.png) | Fir, spruce, and golden larch ridge | 0.34× |
| 6 | [zlatorog-ibex.png](layers/zlatorog-ibex.png) | Small golden-horned ibex motif | 0.16× |
| 7 | [foreground-spruces.png](layers/foreground-spruces.png) | Edge trees framing the travel line | 0.72× |
| 8 | [foreground-grass-lane.png](layers/foreground-grass-lane.png) | Wide continuous left-to-right grassy road | 1.0× |
| 9 | [foreground-flowers.png](layers/foreground-flowers.png) | Low flowers and stones at the outer edges | 0.88× |

The ratios are relative to a rightward camera journey. The scenery translates left. Keep the lane continuous and visibly broader than a footpath; it should occupy roughly the lower third or more of the viewport and stay open enough for the party. The lane moves fastest, edge foliage follows, and distant hills and peaks barely shift. No water or reflection layer is needed for Triglav.

## Travel preview and character staging

- The scrubber represents forward travel from left to right. The grass lane moves at 1.0×, the framing trees and flowers move at 0.72–0.88×, the forest at 0.34×, and distant relief at 0.12–0.16×.
- Krpan is a party-sprite stand-in and moves toward Pesjan in the preview. Pesjan uses the current Volkodlak sprite with the game's regional tint. Ajdovska deklica is suggested only by the chapter setting; her gameplay pixel sprite is not in the current sprite bundle.
- The separate cutouts were generated as visual slices and positioned for the composite. Their masks and overlap edges are not pixel-exact extractions. Check the whole pan, portrait/landscape mobile crops, and battle-floor clearance before production use.
- The broad grass layer and low edge decorations keep a continuous footing without a winding stone trail. Keep foreground plants below the characters' knees and away from their route.
- The preview respects reduced-motion settings. It is a local art-direction page, not a renderer integration.

