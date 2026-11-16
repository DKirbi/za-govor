# Kurent

> **Status:** Core role, skill concepts, rank values, HP growth and key illustration subjects CONFIRMED. Detailed timing interactions and implementation edge cases remain OPEN.  
> **Character type:** Living Slovenian carnival / folklore figure  
> **Region:** Ptuj (Region 1)  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Kurent is one of Slovenia's best-known traditional figures, especially associated with the Kurentovanje carnival tradition around Ptuj. The character should enrich a living folkloric figure through the game's fantasy interpretation, not falsely present game combat abilities as documented ritual beliefs.

**CONFIRMED gameplay identity:** A crowd-control and disruption specialist. Kurent uses the Ježevka, the sound of his bells, and the collective force of the Kurentovanje procession to delay, weaken and frighten enemies. He should remain a worthwhile end-game party choice through broad control and specialised effects against supernatural enemies.

## 2. Folklore and cultural context

Kurent / korant is associated especially with the Ptuj area and the wider Drava plain, Haloze and Slovenske gorice traditions. The traditional kurentija includes a sheepskin garment, a mask and headwear that varies by local type, a belt of large bells, and a ježevka: a wooden stick with a hedgehog-skin covering at its end.

Kurents traditionally move in groups during the Shrovetide period. Their vigorous movement and loud bell-ringing are popularly understood as driving away winter and evil and welcoming spring, happiness and prosperity. Details of costume and practice vary by locality and have changed over time.

The origins of the figure and the tradition are complex. Do not assert as settled fact that Kurent is an ancient Slavic god or assign him a specific pre-Christian divine identity without strong evidence.

## 3. Skills and combat mechanics

### Skill 1 — Ježevka

**CONFIRMED:** A direct attack using the traditional Ježevka. Damage and attack-delay duration increase by rank.

| Rank | Direct damage | Delay to target's next attack |
|---|---:|---:|
| 1 | 4 | 1.5 seconds |
| 2 | 7 | 2.5 seconds |
| 3 | 10 | 3.5 seconds |

The delay is a control effect on the enemy's next attack, not a general round-based stun. Exact interaction with attacks already charging or with enemies that have no queued attack remains OPEN.

### Skill 2 — Bells (Slovene skill name OPEN)

**CONFIRMED animation and action commitment:** Kurent shimmies and jumps in place. His belt of large cowbells visibly shakes and rings, with a distinctive sound animation. While performing this action, Kurent is unavailable to the letter mesh and cannot contribute letters to word puzzles. He can still receive damage. Taking damage does not interrupt the dance; Kurent completes the full action duration.

**CONFIRMED effect:** Reduce the attack damage of selected enemies for 2 seconds. Because the action runs to completion even when Kurent takes damage, its duration can stack without being cancelled by incoming hits.

| Rank | Enemies affected | Attack damage reduction per enemy | Duration |
|---|---:|---:|---:|
| 1 | 1 | 3 | 2 seconds |
| 2 | 2 | 4 each | 2 seconds |
| 3 | 3 | 5 each | 2 seconds |

Exact target selection (nearest, strongest, or player-selected), stacking with other attack debuffs, and whether the reduction applies to an attack already in progress remain OPEN. The action commitment above is confirmed; the damage-reduction effect's stacking behaviour is not yet specified.

### Skill 3 — Pregon zime

**CONFIRMED core effect:** Delays every enemy.

| Rank | Delay | Additional effect |
|---|---:|---|
| 1 | 3 seconds | Delay only |
| 2 | 4 seconds | Enemies with wind, cold or ghost affinity suffer damage from their own attack, distributed over the 4-second delay; their attack is halved |
| 3 | 4 seconds | Same affinity-based self-damage during the delay; after the delay, their next attack is reduced to 50% damage, without the self-damage component |

**Rank 2 interpretation to preserve:** For an eligible enemy, half of its attack damage is dealt back to itself, divided evenly across the four seconds (one quarter of that half per second). Its attack output is also halved. This is the current design description; exact sequencing when the enemy's attack would normally resolve during the delay remains OPEN.

**Rank 3:** The eligible enemy receives the same four-second self-damage effect. Its next attack after that effect is then reduced to 50% of its normal damage, but does not cause additional self-damage.

**Visual status effect:** An affected enemy displays a new spirit above its head for the remainder of the stun/delay effect. The spirit is a gameplay visual indicator, not a newly asserted folkloric creature.

**Affinity rule:** The special damage applies to enemies tagged with wind, cold or ghost affinity. Mora is an example of a ghost-affinity enemy. The final list of qualifying enemies and affinity tags must be defined in the enemy data; do not infer affinity from appearance alone.

### Health progression

**CONFIRMED:** Kurent gains at least +1 HP per level. This is the minimum health increase per level; exact base HP and any higher growth adjustments remain subject to the shared progression rules.

## 4. Visual and narrative direction

Artwork production is deferred until the full roster has been reviewed.

### Skill illustrations

- **Ježevka:** Kurent wielding the Ježevka in a clear, readable attack pose. The hedgehog-skin end should be recognisable.
- **Bells:** Kurent shimmying and jumping in place, with the large bells visibly shaking. This illustration should communicate movement and sound.
- **Pregon zime:** Three Kurents shimmying and jumping around a pile of snow, potentially shaped as a snowman. Their bells are ringing and shaking. The composition should communicate the collective ritual driving winter away.

### Final story card — Kurentovanje

**CONFIRMED subject and unlock condition:** A large Kurentovanje procession with many Kurents moving through the crowd. A devil figure runs through the crowd while Kurents ring their bells and carry Ježevkas. Unlock only after winning the final encounter with Kurent alive in the active party, following the shared final-illustration rule.

The final image should evoke the recognisable public celebration while remaining respectful of the living tradition. Verify the visual treatment of the devil figure against documented Kurentovanje practice before final artwork.

## 5. Recruitment and progression

- Kurent is associated with Ptuj (Region 1).
- He is one of the three known starting characters in the current progression design.
- Keep the existing starter availability unless a later Game Director decision changes it.
- His control-oriented kit is intended to remain useful in later regions and against bosses, not only early encounters.

## 7. Shared combat rules

The system-wide action, status and interruption rules are documented separately in [Combat System Rules](../../combat-system.md). These rules apply to Kurent and the wider roster.

## 8. Open decisions

- Final Slovene name for the Bells skill.
- Whether Ježevka's attack delay postpones an already charging attack or only the next attack that has not begun.
- Bells target selection and interaction with existing attack modifiers.
- Exact timing and sequencing of Pregon zime when enemies have attacks already queued.
- Final enemy affinity tags for wind, cold and ghost; Mora is a confirmed example of the intended ghost category.
- Whether the spirit visual differs by affinity or uses one shared indicator.
- Exact base HP and final level-scaling formula, while preserving at least +1 HP per level.
- Folklore-source review for the devil figure in the final Kurentovanje card.

## 9. Implementation notes

- Existing character data is in `src/game.js`; progression and roster data are in `docs/progression-design.md`.
- Do not alter implementation until the Game Director approves the remaining timing and targeting rules.
- Distinguish documented costume, objects and ritual practice from supernatural game effects.
- Keep Kurent's identity grounded in the living Kurentovanje tradition.

## 10. Sources

Initial folklore research and source verification to be expanded in [references/README.md](references/README.md).
