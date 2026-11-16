# Martin Krpan — character art brief

**Status:** Existing character identity and skill data are IMPLEMENTED in the browser prototype. This document is an art-production brief; new animation and card artwork remain PROPOSED until approved by the Game Director.

## Source of truth

Before editing, inspect:
- `src/game.js` — current character entry and skill metadata.
- `src/art-extra.js` — generated sprite data; the `krpan` sprite already exists.
- `tools/art_extra.py` — generator for `src/art-extra.js`. Never hand-edit the generated file.
- `docs/concept-summary.md` — current project and art-pass context.
- The separate `direction-docs` branch: `docs/design/art-direction.md`, `docs/design/folklore-references.md`, `docs/design/locations-and-geography.md`.

The reviewed-character-specification index currently covers five other heroes; Martin does not yet have an individually reviewed folklore/gameplay specification. Do not present this art brief as folklore approval.

## Current implemented character data

Read the live entry in `src/game.js` before implementation. At the time this brief was written:

- Name: **Martin Krpan**
- Role descriptor: *silak z Vrha · močan, počasen udar*
- Skills: **Zamah**, **Kobilica**, **Lipov kij**
- Word triggers: **SOL**, **KOBILA**, **BRDAVS**
- Base values: **−7**, **−18**, **−38**
- Additional effect: **omami šefa**

Do not rename, rebalance, reorder or reinterpret these skills as part of an art task.

## Character identity to preserve

Existing project art consistently depicts:
- Broad dark hat with a red band.
- Large moustache.
- Cream shirt and brown vest.
- Red sash/belt and dark trousers/boots.
- Salt sack carried on the journey.
- A wooden **linden club (lipov kij)**.

The current sprite is already embedded in the generated art data. Preserve it as the baseline and compare new work against it. Do not replace it with a generic fantasy warrior.

**Do not add:** axe, cleaver, sword, shield, armour, magic equipment or newly invented costume details. An older experimental folk-art sheet included a cleaver; that is not the current implemented character kit.

## Truth layers

- **Literary source:** Martin Krpan is a literary hero; begin research with Fran Levstik's *Martin Krpan z Vrha*. Distinguish Levstik's text from later illustrations and popular visual conventions.
- **Existing game interpretation:** the current sprite, salt sack, linden club and skill names above.
- **Gameplay fiction:** combat poses, hit reactions, card staging and the Brdavs encounter. Label these as game interpretation, not historical fact.

Folklore research and Game Director review are still required before the character's visual/lore specification can be marked APPROVED.
