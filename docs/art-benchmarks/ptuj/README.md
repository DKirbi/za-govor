# Ptuj — parallax background benchmark

**Status:** PROPOSED ART BENCHMARK — not yet integrated into the game runtime.

## Why Ptuj

The current journey data (data/world.json) starts in Ptuj and describes the region as carnival time: the Kurents chase winter away, but winter refuses to leave. The benchmark therefore uses a **late-winter / early-spring sunset**: light snow remains on roofs, castle slopes and the riverbank, while the warm sky keeps the scene welcoming.

## Geographic composition

The view is a stylised panorama from the Drava riverside, looking towards the historic town and the castle hill. The composition prioritises:
- Ptuj Castle on its distinct hill above the old town.
- The compact historic roofline between the castle hill and Drava.
- The recognisable vertical accents of the town skyline: the City Tower and the church tower.
- The Drava as a real foreground element, with reflections of the warm sky and town lights.
- Low, gently rolling Podravje hills in the distance; no dramatic Alpine peaks.

The view is a game-art interpretation, not a measured reconstruction of one exact camera position. Do not add an invented bridge or combine unrelated landmarks. For a more exact landmark composition, use official Ptuj viewpoint photography as the next reference pass.

## Files

- preview.html — standalone animated preview with pause, speed and individual layer controls.
- ptuj-parallax.svg — composed animation preview using the separate layers.
- layers/sky.svg — static sunset sky.
- layers/clouds.svg — slow independent cloud layer.
- layers/distant-hills.svg — low distant hills.
- layers/castle-hill.svg — castle and its wooded hill.
- layers/old-town.svg — historic town roofline and towers.
- layers/drava.svg — water surface.
- layers/reflections.svg — separate reflection and ripple overlay.
- layers/foreground.svg — near bank, path, snow, plants and framing tree.
- layers/ambient.svg — restrained windows, lantern and occasional glints.

All layers share a 640×360 art-space canvas and are separate transparent SVG files. They can be imported as separate textures or rasterised to PNG at the game's integer scale.

## Parallax benchmark

| Layer | Suggested relative speed | Motion |
|---|---:|---|
| Sky | 0.00× | Static |
| Clouds | 0.04× | Slow seamless drift |
| Distant hills | 0.08× | Minimal horizontal parallax |
| Castle hill | 0.16× | Slow parallax |
| Old town | 0.28× | Medium-slow parallax |
| Drava | 0.45× | Subtle horizontal ripples |
| Reflections | 0.48× | Moving highlights / shimmer |
| Foreground | 1.00× | Strongest parallax, still restrained |
| Ambient details | 0.00× | Occasional flicker, not continuous noise |

These are initial benchmark values, not confirmed engine constants.

## Animation principles

- Clouds move slowly and loop seamlessly; they should never become a focal point.
- Water motion is subtle: short horizontal ripple shifts and changing highlights, not a large animated wave.
- Reflections remain vertically aligned with the light sources and town masses. They distort horizontally with the water.
- Windows and lanterns may brighten occasionally. Avoid random blinking across every building.
- Foreground leaves and reeds may sway by only a few art pixels.
- Every movement should remain calm enough that word puzzles and combat remain the focus.
- Respect reduced-motion settings: show the same scene as a still image.

## Art direction

Follow the project's established Hybrid direction: modernised SNES/GBA-inspired 16-bit pixel art for gameplay environments, with crisp clusters, strong silhouettes, controlled palette and readable details. Do not drift into painterly 32-bit concept art, soft blur, photographic texture or excessive decorative clutter.

## Source references

- data/world.json: Ptuj is the first region; current intro: “Pustni čas na Ptuju. Kurenti z zvonci preganjajo zimo, a letos se noče umakniti.”
- Official Ptuj tourism guide identifies Ptuj Castle, City Tower, St George’s Church, the historic old town and the Drava as key elements of the town’s identity and views.
- Official Ptuj tourism material describes the characteristic town view from the footbridge and from the opposite bank of the Drava.

External references:
- https://visitptuj.eu/en/see-do/tours/ptuj-in-a-day/
- https://visitptuj.eu/wp-content/uploads/2025/06/BROSURA-Festivalski-utrip-2025.pdf
- https://www.slovenia.info/en/places-to-go/regions/thermal-pannonian-slovenia/ptuj

## Review checklist

- [ ] Castle hill reads clearly as Ptuj, not a generic mountain castle.
- [ ] Old town is compact and sits between the castle hill and Drava.
- [ ] City Tower and church tower are distinct, not duplicated.
- [ ] River remains visually calm and readable behind combatants.
- [ ] Each layer can be toggled independently in the preview.
- [ ] Motion remains subtle at 640×360 and at mobile scale.
- [ ] No layer movement exposes transparent gaps at the edges.
- [ ] Reduced-motion mode presents a stable still.
- [ ] Final runtime implementation uses separate layers, not the flattened preview.
