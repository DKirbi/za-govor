# Martin Krpan — folk-art skill cards

**Status:** The three skill names, word triggers and base values are IMPLEMENTED. Card compositions below are art direction proposals; the artwork is not yet approved.

## Visual language

Use the project's hybrid direction:
- Gameplay remains modernized SNES/GBA-inspired pixel art.
- Skill/story cards use a painted folk-panel language informed by panjske končnice: strong dark contours, simplified readable figures, flat earthy colours, visible painted/wooden surface character and story-first composition.
- Floral ornament should frame the image, not compete with the action.
- Do not label a newly generated image as an authentic historical beehive panel. It is an original game illustration inspired by the visual tradition.

The earlier art-pass reference used wide painted boards around 240×104 px, with increasing visual weight by skill tier. Verify the current renderer's card dimensions before exporting final assets.

## Current skill data

| Skill | Word trigger | Base value | Current additional effect |
|---|---|---:|---|
| Zamah | SOL | −7 | — |
| Kobilica | KOBILA | −18 | — |
| Lipov kij | BRDAVS | −38 | Omami šefa |

These are current prototype values, not a new balance proposal.

## Card composition proposals

### 1. Zamah — SOL

A clear, compact action: Martin in a grounded stance delivering one decisive swing with the wooden linden club. Use a restrained impact burst to communicate a basic attack. The club is the focus; do not add a second weapon.

### 2. Kobilica — KOBILA

**OPEN — clarify the depicted object/action before final illustration.** The current prototype note says Martin *dvigne kobilico s ceste*, while the word trigger is *KOBILA*. Do not silently decide whether the image should show a mare, a cart/road object or another interpretation. Keep this card at sketch level until the Game Director confirms the intended reading.

### 3. Lipov kij — BRDAVS

A larger, climactic folk-panel composition showing Martin and Brdavs, with Martin's linden club as the decisive visual motif. The current implementation adds a boss-stun effect (*omami šefa*); represent that effect with a separate, readable visual accent rather than inventing a new weapon or a new skill.

Brdavs's detailed appearance must be checked against the current game asset and source/research notes. Treat any unverified armour, helmet or costume as game interpretation, not folklore fact.

## Card behaviour and UI safety

- Cards should narrate the action and remain visually distinct from the pixel sprite animation.
- Do not place a card over the letter grid, word construction area or essential controls.
- Follow existing card placement/timing behaviour if it is still active in the current implementation; inspect the renderer rather than recreating it.
- Avoid text baked into generated art. Add skill names, word triggers and damage values through the UI so Slovene spelling and accessibility remain correct.
- Build one card per skill tier. Do not create extra skills, card tiers or effects.

## Superseded experiment

An older triptych used the names *Kmečka moč*, *Lipov kij* and *Brdavsev konec*, and depicted a cleaver. It is not the current three-skill kit. Do not reuse those names or the cleaver as current skill content.
