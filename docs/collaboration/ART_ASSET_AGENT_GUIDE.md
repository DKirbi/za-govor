# Art Asset Agent Guide — Claude implementation notes

**Purpose:** Give implementation agents clear, bounded instructions for producing and integrating approved art assets for *Za govor!*.

## Authority and workflow

- The Game Director approves all creative decisions.
- Art direction documents define constraints; a PROPOSED concept is not an approval.
- Do not invent character skills, weapons, equipment, folklore facts, landmarks or animation effects.
- Preserve existing assets and working implementation unless a specific replacement is approved.
- When a specification is OPEN or contradictory, stop and ask rather than guessing.

## Before touching files

1. Read `docs/concept-summary.md`, `docs/combat-system.md` and the relevant character/environment brief.
2. Inspect the existing renderer and generated-art pipeline.
3. Check current character data in `src/game.js`.
4. Check existing sprites in `src/art-extra.js` and the generator `tools/art_extra.py`.
5. Inspect the current journey camera and region data in `src/journey.js` and `data/world.json`.
6. Check whether a file is generated before editing it.

## Martin Krpan constraints

- Reuse the current `krpan` sprite as the visual baseline.
- Preserve his hat with red band, moustache, cream shirt, brown vest, red sash, salt sack and wooden linden club.
- No axe, cleaver, sword, shield or invented armour.
- Preserve the current skill names, order, word triggers, values and effects in `src/game.js`.
- The exact visual interpretation of **Kobilica** is OPEN; do not finalize that card until clarified.
- Do not conflate the older *Kmečka moč / Brdavsev konec* triptych with the current kit.

## Animation implementation

- Keep body animation, held-item motion, attack arc and impact/status VFX separable where practical.
- Use the existing sprite scale, pivot, facing convention and frame timing.
- Keep feet on a stable baseline; avoid sprite jitter and foot sliding.
- Do not bake the background into character frames.
- Keep actions separate from statuses in code, following `docs/combat-system.md`.
- A skill's gameplay effect must come from existing character data. Animation communicates it; it does not define new mechanics.
- Do not let animation or cards obscure the word grid or controls.

## Ptuj environment implementation

- Use the single selected, geographically verified camera view.
- Keep sky, castle hill, town, river, near bank and ground separate.
- Animate the river independently and make the loop seamless.
- Keep the foreground and ground tileable where the camera requires it.
- Do not insert Pohorje or an unverified stone-arched bridge.
- Avoid excessive ambient animation; every moving detail must serve atmosphere without reducing readability.

## File and PR discipline

- Keep source assets separate from generated bundles.
- Never hand-edit `src/art-extra.js` if it is generated; change the source and run its generator.
- Do not modify combat logic, skill balance, progression, UI layout or region data as part of an art-only task unless explicitly requested.
- Include a preview/contact sheet and a concise asset manifest in the PR.
- Record source provenance, dimensions, frame counts, pivots, animation speed and intended loop behaviour.
- List unresolved questions and do not mark the assets APPROVED until the Game Director reviews them.
