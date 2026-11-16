# Lepa Vida

> **Status:** Core identity, skill kit and recruitment location CONFIRMED. Final folk-art card subject and additional story-card content OPEN / deferred until the roster art review.
> **Character type:** Hero from a Slovenian folk ballad
> **Region:** Piranske soline (Region 6)
> **Gameplay role:** Song-based support and disruption
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Lepa Vida is a song-based support and disruption hero. Her skills express longing (*hrepenenje*) through song, weakening enemies and delaying their attacks. She is not a conventional water mage or a generic damage dealer.

**CONFIRMED design principle:** Preserve the emotional core of the ballad — longing, separation, and the tension between personal desire, family and home. Sea foam and coastal imagery are visual/gameplay interpretations, not evidence that Vida is a water supernatural being.

## 2. Folklore and literary context

Lepa Vida is primarily the central figure of a Slovenian folk ballad, not a documented goddess or supernatural creature. The ballad has multiple variants and endings; they should not be collapsed into one supposedly canonical version.

Broadly documented variant directions include:

- **Tragic variants:** In versions associated with Ihan, Vida is deceived by a seafarer who offers a remedy for her sick child. She is taken aboard and, rather than accept captivity, eventually chooses death.
- **Elegiac variant:** A Dolenjska version has Vida leave for a foreign court, where she becomes a nursemaid and grieves for her child, husband and home.
- **Happy variant:** A Kropa version has Vida taken abroad but eventually return with supernatural assistance from the sun.

The recognisable opening image is Vida washing laundry by the sea as a ship approaches. Details and endings vary between tellings.

Separate eastern Styrian and Prekmurje songs about a Vida and a snake are distinct traditions. Do not import their magical snake material into the coastal Lepa Vida ballad unless deliberately presented as original game fiction.

The motif has been reinterpreted in later Slovenian literature, including France Prešeren's *Od lepe Vide*. The ballad's myth-like place in collective memory should not be confused with evidence that Vida was a historical or divine figure.

### Geographic treatment

**CONFIRMED game setting:** Piranske soline, with Piran at sunset, is the hero's recruitment region and visual association. This is a creative maritime setting for the game; it is not a claim that the ballad originated in Piran. Surviving variants and proposed origins are geographically diverse and debated.

## 3. Skills and combat mechanics

### Skill 1 — Hrepenenje

Focused damage that weakens one enemy's next attack.

| Rank | Direct damage | Reduction to target's next attack |
|---|---:|---:|
| 1 | 6 | — |
| 2 | 10 | 2 |
| 3 | 14 | 4 |

The weakening applies to the target's next attack, not as a permanent reduction to its base attack stat. It should be represented as a temporary status/effect under the shared combat rules.

### Skill 2 — Morska pena

Deals damage and delays one enemy's next attack.

| Rank | Direct damage | Delay to target's next attack |
|---|---:|---:|
| 1 | 5 | 1 second |
| 2 | 8 | 2 seconds |
| 3 | 11 | 3 seconds |

This is a delay to the enemy's next attack, not a generic round-based stun. Follow the shared timed-attack rules and make the delay visible.

### Skill 3 — Pesem z obale

A song that lightly damages all enemies and weakens their attacks.

| Rank | Damage to each enemy | Attack reduction |
|---|---:|---|
| 1 | 3 | Next attack reduced by 2 |
| 2 | 5 | Next attack reduced by 3 |
| 3 | 7 | Next two attacks reduced by 3 each |

The reduction is temporary and applies to the specified upcoming attacks. Do not permanently subtract from enemy base attack values. Represent the weakening with a visible status/effect.

### Shared combat rules

The system-wide action, status and interruption rules are documented in [Combat System Rules](../../combat-system.md). In particular, temporary weakening and attack delays should be modelled as effects with explicit duration/consumption rather than mutations to an enemy's permanent attack stat.

## 4. Recruitment and progression

- **CONFIRMED:** Lepa Vida is recruited at Piranske soline (Region 6), her designated location.
- **CONFIRMED:** She remains eligible for the generic random hero recruitment pool in other regions. She is not exclusive to Piranske soline.
- Apply the shared hero level and skill-point rules. Her character-specific rank values above are authoritative for her skills.

## 5. Visual and narrative direction

Artwork production is deferred until the full roster has been reviewed.

Existing prototype cues include long dark hair, a red ribbon, a white/linen blouse, a blue skirt, laundry in her hands, and a coastal setting with waves, gulls and an approaching ship. A singing gesture and sea foam may communicate the game's interpretation of her song.

Keep the ballad's emotional subject central. Avoid turning her into a generic elemental water caster.

### Final story card

**CONFIRMED unlock condition:** Lepa Vida must be alive and in the active party when the final encounter is won, following the shared final-illustration rule.

**OPEN / deferred:** The final illustration's specific subject and composition, and any additional story-card subjects, will be decided during the full roster art review. Do not invent a canonical ending or combine incompatible ballad variants in advance.

## 6. Open decisions

- Final folk-art card subject, composition and treatment of the ballad's variant endings.
- Whether additional story cards are needed beyond the shared final-card unlock.
- Any finer implementation details for attack-delay timing and how multiple temporary weakening effects interact; follow shared combat rules and flag conflicts rather than silently inventing new behaviour.

## 7. Sources and interpretation notes

- Jožica Čeh Steger (2020), scholarly study comparing Slovenian Lepa Vida ballad variants and their Mediterranean relatives. Use the study to preserve the differences between regional variants and the uncertainty around origin theories.
- France Prešeren, [Od lepe Vide](https://sl.wikisource.org/wiki/Od_lepe_Vide), a literary reworking of the motif.
- The original ballad tradition is oral and variant-rich; cite the specific collected variant when using a particular plot detail in future art or narrative work.

**Interpretation boundary:** Vida's ballad, regional variants and later literary adaptations are cultural source material. The skill effects, sea-foam visuals and recruitment placement are game interpretation, not folkloric facts.
