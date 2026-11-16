# Ptuj — parallax environment art brief

**Status:** Ptuj is the first journey region in the implemented game. The multi-layer pixel-art environment is a PROPOSED art pass; exact camera composition and landmark placement remain OPEN pending reference review.

## Geographic basis

Use a view that can credibly show the Drava, the historic town and Ptuj Castle. The official Visit Ptuj guide identifies the footbridge as a strong viewpoint for the town and the castle; the castle itself stands above the town and overlooks its tiled roofs and streets.

Reliable starting references:
- Visit Ptuj, [Ptuj in a day](https://visitptuj.eu/en/see-do/tours/ptuj-in-a-day/) — recommends the footbridge viewpoint, old-town streets and castle.
- Visit Ptuj, [Ptuj Castle](https://visitptuj.eu/en/see-do/culture-heritage/sightseeing/ptuj-castle/) — castle hill and view over the old town.
- Government of Slovenia, [Ptuj Castle](https://culture.gov.si/en/Ptuj_Castle) — historical and architectural context.
- I feel Slovenia, [Ptuj](https://www.slovenia.info/en/places-to-go/regions/thermal-pannonian-slovenia/ptuj) — Ptuj's setting by the Drava and castle above the town.

These are orientation sources, not a final approved camera reference. Select one real viewpoint and check photographs/maps before locking relative landmark positions.

## Geographic guardrails

- Ptuj Castle belongs on the hill above the historic town.
- The Drava is a defining part of the setting.
- The old-town roofscape and recognizable skyline may be simplified, but their relative placement must follow the chosen viewpoint.
- Do not add Pohorje as a convenient mountain backdrop. The existing project geography notes explicitly flag that as a previous composition error.
- Do not reuse the experimental stone-arched bridge without verifying that it belongs in the selected view. The documented footbridge viewpoint does not mean a medieval stone bridge should be inserted into the scene.
- Do not combine distant landmarks or invent a viewpoint merely to make the panorama more decorative.

## Proposed parallax stack

Keep layers independent so they can move at different speeds and animate selectively.

| Layer | Content | Motion |
|---|---|---|
| L5 — Sky | Evening sky, clouds, distant atmospheric colour | Very slow horizontal drift; occasional subtle cloud variation |
| L4 — Castle hill | Ptuj Castle silhouette, hill and vegetation | Very slow parallax; mostly static silhouette |
| L3 — Old town | Roofline and only the skyline landmarks visible from the chosen viewpoint | Slow parallax; occasional window glint only if it fits the scene |
| L2 — River | Drava surface, reflections and riverbank edge | Separate looping water strip; subtle current and reflection shimmer |
| L1 — Near bank | Reeds, shrubs, trees and small grounded props | Medium parallax; restrained leaf/reed movement |
| L0 — Ground | Walkable path and foreground edge | Moves with the journey ground; seamless tile edges |

Suggested speed ratios are implementation tuning values, not approved constants: sky 0.05, castle 0.12, town 0.20, river 0.35, near bank 0.65, ground 1.0. Validate against the existing journey camera before implementation.

## Animation opportunities

Keep occasional details independent from the static layer:
- River: 3–4-frame repeating water/reflection cycle, with no large wave motion.
- Reeds: subtle offset sway, not all at once.
- Tree canopy: occasional small leaf movement.
- Distant town: rare window shimmer; avoid flickering every building.
- Birds: optional and only if supported by the selected reference composition.

The scene should feel alive without competing with combat or puzzle readability.

## Asset and export guidance

- Export each parallax layer separately with transparency where needed.
- Keep the river surface and its reflection highlights separable from the riverbank.
- Preserve a consistent pixel grid across all layers.
- Make wide layers tileable or provide explicit start/end padding for camera travel.
- Do not flatten the preview composition into the production background.
- Match dimensions, scale and import conventions to the existing journey renderer after inspecting `src/journey.js` and `data/world.json`.

## Approval checklist

- [ ] One exact real-world viewpoint selected and referenced.
- [ ] Castle hill, town, river and skyline positions verified.
- [ ] No unsupported mountain range or bridge.
- [ ] Parallax layers remain independently exportable.
- [ ] Water animation loops without a visible seam.
- [ ] Foreground movement does not obscure characters.
- [ ] Mobile battle composition remains readable.
