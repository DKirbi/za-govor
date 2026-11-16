---
name: za-govor-art-direction
description: Create and review consistent Za govor! character sprites, animation assets, environments, parallax layers and Slovenian folk-art cards. Use whenever generating, editing, specifying or integrating game art.
---

# Za govor! — Art Direction Skill

## Authority and collaboration

- The Game Director (user) owns all creative, product, lore and approval decisions.
- GPT is the art-direction and research partner: inspect references, research cultural/geographical accuracy, create concepts and production-ready art specifications.
- Claude is the implementation partner: integrate approved assets, build animation/state logic, parallax and tooling, and test in the game.
- Never turn a proposal into an approved decision. Label work **CONFIRMED**, **IMPLEMENTED**, **PROPOSED**, **OPEN** or **SUPERSEDED**.
- Preserve existing implementation and approved decisions. Make the smallest effective improvement; do not redesign unrelated systems.
- When an essential creative detail is unresolved, stop and ask the Game Director.

## The defining visual identity

Za govor! deliberately combines TWO distinct visual languages. Their contrast is a core identity feature, not a temporary production stage:

1. **Gameplay art: restrained 16-bit pixel art.** A direct, controlled upgrade from the existing 8-bit look toward richer SNES/GBA-era RPG pixel art. Keep the same visual scale, proportions, readability and approachable simplicity. Add selective volume, a slightly richer palette, better shading, clearer silhouettes and more expressive poses. Do not jump to 32-bit, HD pixel art, painterly rendering, highly detailed modern indie pixel art or 3D-like rendering.
2. **Folk-art cards and story illustrations: refined traditional illustration.** Keep the deliberate contrast: elegant, carefully composed folk-art panels inspired by Slovenian painted beehive panels (*panjske končnice*), traditional ornament, bold contour drawing, flat expressive shapes and warm pigments. These cards are not pixel art and should not be converted into pixel sprites.

The gameplay world should feel like a lovingly modernized 16-bit RPG; the cards should feel like small, crafted pieces of Slovenian visual storytelling.

## 16-bit pixel-art constraints

- Treat the supplied 8-bit sprite as the baseline. Improve it incrementally; do not redesign the character.
- Preserve recognizable silhouette, head/body proportions, equipment, costume, palette identity and pose language.
- Target a coherent 16-bit SNES/GBA-inspired pixel vocabulary, not a numerical bit-depth simulation. "16-bit" is a style target, not a requirement to use a particular colour count or resolution.
- Use deliberate pixel clusters, clean stepped contours, readable outlines, selective highlights and restrained shadow ramps.
- Increase detail only where it improves recognition, material separation or animation readability.
- Avoid noisy single-pixel texture, excessive dithering, gradients that imitate digital painting, tiny decorative details and over-rendered surfaces.
- Keep characters readable at their actual in-game display size and on mobile screens.
- Keep pixel density, outline weight, lighting direction, palette logic and sprite scale consistent across the roster.
- Transparent sprite backgrounds; no baked scenery, UI, labels or duplicate ground shadows unless specifically requested.
- Separate body, held object, effects and foreground elements when useful for animation.

## Folk-art card constraints

- Cards use a separate, refined illustrated language: confident dark contours, stylized anatomy, flat or lightly textured colour fields, warm parchment/wood tones, deep navy/charcoal, earthy greens, red accents and golden yellow.
- Use ornamental borders and floral/geometric motifs with restraint; framing must support the story rather than overwhelm it.
- Compose like a compact narrative panel: one immediately readable action, clear hierarchy and expressive silhouettes.
- Keep the image free of generated UI text, numbers and labels where these can be rendered by the game UI. Slovene text must be authored and checked separately.
- Panjske končnice are an inspiration, not permission to claim a generated image is an authentic historical panel. Clearly distinguish authentic references from original game illustration.
- Do not turn cards into glossy fantasy trading cards, generic medieval concept art or pixel-art panels.
- Preserve the visual contrast between this refined folk-art treatment and the 16-bit gameplay sprites.

## Character and folklore integrity

- Inspect current character data, existing sprite assets, reviewed character documents and previous approved art before creating anything.
- Research folklore, literary characters, clothing, props, symbols and regional context using scholarly publications, folklore collections, museums, archives and cultural institutions.
- Distinguish documented source material, uncertain interpretations and original game fiction.
- Never invent abilities, attacks, weapons, costume details or folklore facts and present them as authentic.
- Do not alter skill names, order, triggers, values, effects or progression during an art task.
- Preserve existing character identity. A reference image is not permission to change the implemented character kit.

## Animation and asset production

For each character, specify and create only the states needed by the current game:
- idle;
- movement (walk/run only if the game uses both);
- normal attack;
- each implemented skill's visual presentation;
- hurt/reaction;
- victory/defeat only where used.

For each state, provide: purpose, sequence of poses, frame count proposal, timing proposal, loop/non-loop behaviour, facing, pivot/ground baseline, held-object separation, effect layers and gameplay trigger. Mark all unverified frame counts/timings as proposals.

- Prioritize readable key poses and controlled motion over excessive frames.
- Avoid foot sliding, jitter, changing proportions and inconsistent object placement.
- Separate attack arcs, impact flashes, particles and status feedback from the base character sprite.
- An animation communicates an action; it must not create or redefine gameplay mechanics.
- Keep puzzle grid, word entry and combat controls unobstructed.

## Environments and parallax

- Inspect existing world/region data and journey renderer before defining new layer structure or movement constants.
- Use credible real-world geography. Select a real viewpoint and verify landmark relationships; do not combine unrelated landmarks for visual convenience.
- Separate sky, distant terrain, town/castle, water, near environment and walkable ground when appropriate.
- Keep water, reflections, foliage and occasional ambient details independently animatable when useful.
- Layers must share a coherent pixel scale, lighting and palette. Provide transparency, seamless tiling or explicit camera padding as required.
- Motion should be subtle and atmospheric; it must not distract from gameplay.
- Never bake a complete preview composition into one production layer if the scene needs parallax.

## Required workflow

1. **Inspect:** read the project description, approved art direction, collaboration guide, character/region specs, current implementation and existing assets.
2. **Reference:** inspect the supplied approved examples and identify what each demonstrates. Do not rely on filenames alone.
3. **Research:** verify folklore, historical and geographical facts where relevant; record uncertainty.
4. **Specify:** describe the exact asset, style, silhouette, palette, dimensions/scale assumptions, layers, animation states and integration needs. Separate confirmed facts from proposals.
5. **Generate:** create the art in the correct visual language. Use one coherent reference set and avoid uncontrolled style drift.
6. **Review:** compare against the original reference and in-game scale. Check identity, readability, consistency, cultural accuracy and technical separability.
7. **Handoff:** provide assets plus a manifest and Claude instructions: filenames, dimensions, frame layout, pivots, frame timing, loop rules, layer order, parallax ratios (if approved), transparency and integration location.
8. **Approval:** show the result to the Game Director. Do not merge, replace approved assets or mark final without approval.

## Reference examples supplied by the Game Director

Treat these uploaded examples as the primary visual benchmark:
- `Martin Krpan_ 8-bit to 16-bit Upgrade.png` — most important calibration: modest 8-bit-to-16-bit upgrade, sprite scale and animation readability. Do not extrapolate toward 32-bit.
- `Za govor! Pixel Character Roster.png` — shared roster scale, silhouettes and consistency.
- `Green George’s Springtime Sprite Showcase.png` and `Povodni mož Pixel Art Sprite Sheet.png` — character sprite presentation and restrained animation examples.
- `Martin Krpan’s Folk-Art Triumph.png` — folk-art card/panel language and story composition. Its depicted skill labels/actions are an older experiment, not authority over current game data.
- `Kresnik’s Threefold Fire Triumph.png` — another example of the separate folk-art storytelling language.
- `Slovenian Folklore at Sunset.png` — hybrid presentation: pixel gameplay characters alongside illustrated folk-art cards.
- `Ptuj Pixel Art Parallax Asset Sheet.png` and `Pixel-Art Ptuj Sunset Parallax Layers.png` — layered environment/parallax construction references.
- `Slovenian Pixel Landscape Atlas.png` — broad regional pixel-environment reference. Verify every real location independently; the sheet is a style reference, not a geographical source.

## Anti-goals — do not drift into these

- 32-bit/HD/high-resolution pixel art or painterly pixel rendering.
- Realistic concept art, 3D, vector-flat gameplay characters or glossy mobile-game illustration.
- Folk-art cards redrawn as pixel art.
- Generic fantasy decoration replacing Slovene cultural identity.
- Excessive ornament, visual noise, micro-detail or animation for its own sake.
- Invented lore, weapons, skills, landmarks or historical claims.
- Flattened backgrounds where the game needs independently moving layers.
- Replacing existing assets or implementation without explicit approval.

## Quality gate

An asset is ready for Game Director review only when:
- it visibly belongs to Za govor!;
- gameplay art remains a restrained 16-bit upgrade, not a new fidelity tier;
- folk-art cards retain their separate refined illustration style;
- character identity and current game data remain intact;
- silhouettes and details read at actual display size;
- animation layers are technically separable where needed;
- geographic/folklore claims are sourced or explicitly marked as interpretation;
- Claude can implement it without guessing missing creative decisions.
