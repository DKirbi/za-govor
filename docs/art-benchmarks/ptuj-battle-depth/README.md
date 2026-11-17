# Ptuj battle background — depth and hero staging

**Status:** PROPOSED ART SPECIFICATION — visual direction updated from the first Ptuj benchmark. Not yet integrated into the game runtime.

## Purpose

Define how the Ptuj environment should frame combatants and create depth without compromising hero readability or the word-puzzle battle UI. This specification supersedes the earlier Ptuj benchmark's foreground-motion suggestion wherever they conflict.

## Composition and hero staging

- The hero staging area is offset to the **left of the composition's horizontal centre**. It must not sit in the middle of the panorama.
- Preserve visible environment on both the left and right sides of the hero group. The composition should read as a broad location, not a narrow arena cropped around the party.
- Keep enough negative space around the party for readable silhouettes, combat animations, status effects and attack effects.
- Do not lock the staging area to exact pixel coordinates in this document. Final anchors must be aligned with the actual battle layout and approved hero sprite dimensions.
- The included SVG is a schematic guide only. Its silhouettes and boundaries are not production assets and do not define final runtime coordinates.

## Foreground depth and partial occlusion

Foreground props may occasionally overlap the very bottom of a hero sprite to create a layered, lived-in environment.

Suitable examples:
- small trees, shrubs and low branches;
- tall grass and reeds;
- small rocks and stones;
- low monuments or other grounded environmental details.

Rules:
- Foreground props may overlap a hero **only up to the ankle line**. Never cover the full hero or obscure the torso, head, hands, weapon or other readable action.
- The ankle limit is a hard maximum, not a target. Many props should sit beside or between heroes without overlapping them at all.
- Occlusion must be selective and varied. Do not create a continuous foreground strip that hides every hero's feet.
- Keep the hero silhouette and animation readable at gameplay scale.
- Props must be placed as separate foreground elements so their draw order can be controlled independently of the hero sprites.

## Foreground focus and motion

- Foreground elements are **static**. Do not animate grass, leaves, shrubs, stones, monuments or other foreground props.
- The foreground may be slightly softened / out of focus so it does not compete with the combatants.
- Preserve the project's pixel-art identity: use restrained low-contrast clusters and, if needed, a subtle pixel-aware softening treatment. Avoid a strong Gaussian blur, photographic depth-of-field or effects that smear pixel edges.
- Keep foreground colours and contrast quieter than the hero sprites and central gameplay area.

## Background animation

Animation should be selective and restrained. Appropriate candidates include:
- slow, seamless cloud drift;
- subtle water movement and reflection shimmer;
- rare ambient light changes in distant windows, if they do not become visual noise.

Do not animate every layer simply because it is separate. Keep all motion calm enough that the word puzzle, heroes and enemy actions remain the focus. Provide a still presentation for reduced-motion settings.

## Layering and draw order

Suggested conceptual order, back to front:

1. Sky.
2. Clouds (animated).
3. Distant Podravje landscape.
4. Ptuj Castle hill and castle.
5. Historic town silhouette.
6. Drava water.
7. Water reflections (animated subtly).
8. Hero sprites and their combat effects, positioned in the left-offset staging area.
9. Selective foreground props, static and allowed to overlap only the lowest part of hero sprites.
10. Battle UI, which must remain unobstructed.

The exact order of water, heroes and foreground props may need adjustment to match the chosen camera composition. Keep foreground props on independently controllable draw layers; do not flatten them into the background.

## Pixel-art and visual constraints

- Use the established modernised SNES/GBA-inspired pixel-art direction.
- Use clear pixel clusters, deliberate silhouettes and a controlled palette.
- Do not use photographic imagery as final game assets.
- Do not introduce soft painterly rendering, excessive texture or high-frequency foreground detail.
- The Ptuj landmarks and geography remain subject to the existing Ptuj benchmark's research notes. Do not invent a bridge or combine unrelated viewpoints.

## Deliverables expected from the art implementation

This PR defines the direction; it does not claim that the final production art is complete.

The eventual asset handoff should contain:
- a composed background without heroes or battle UI;
- separate transparent environment layers;
- a separate static foreground-prop layer (or independently placeable props);
- animation frames or sprite sheets only for the approved animated layers;
- a staging guide aligned to the real battle viewport and approved hero sprites;
- an asset manifest with dimensions, palette, z-order, pivots, parallax values and animation loop notes.

Do not redraw or replace approved hero sprites as part of the environment task. Use the existing approved assets once their paths and dimensions are verified.

## Review checklist

- [ ] Hero group is visibly left of the composition centre.
- [ ] Environment remains visible to both the left and right of the hero group.
- [ ] The staging guide is checked against the real battle screen before final coordinates are set.
- [ ] Foreground overlap never rises above the hero ankle line.
- [ ] Foreground overlap is occasional, varied and never hides an entire hero.
- [ ] Foreground props are static.
- [ ] Foreground is visually quieter and subtly softened without destroying pixel-art edges.
- [ ] Clouds and water/reflections are the only default animated environment candidates.
- [ ] Battle UI, word puzzle and combat effects remain clear.
- [ ] Reduced-motion presentation remains readable as a still scene.
