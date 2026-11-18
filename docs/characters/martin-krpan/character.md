# Martin Krpan

> **Status:** Character identity, role, three-skill structure and final story-card subject CONFIRMED. Skill 1 rank values and Mesarica rank values CONFIRMED. Kmečka moč rank values CONFIRMED by the Game Director on 18 Nov 2026; a few targeting details stay OPEN. Artwork production can proceed from the visual direction below.
> **Character type:** Slovenian literary hero / literary-folklore figure
> **Current role:** Starting hero; heavy physical attacker
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Martin Krpan is the protagonist of Fran Levstik's *Martin Krpan z Vrha*, first published in 1858. He is a central figure in Slovenian literary and cultural memory, but should not be presented as a documented historical person or as a supernatural mythological being.

**CONFIRMED gameplay role:** Heavy physical attacker. Preserve his identity as a physically powerful, practical and resourceful fighter. His strength is paired with ingenuity, especially in the story of his duel with Brdavs.

The Slovene language and cultural identity are important to the literary work. Krpan should not become a generic fantasy barbarian.

## 2. Literary source and defining episodes

The following are events in Levstik's literary tale:

- Krpan is exceptionally strong and transports prohibited English salt from the coast on his mare.
- His mare is small but exceptionally strong and dependable.
- He moves the imperial carriage out of the way by lifting or moving his mare.
- He cuts a linden tree to make a limewood cudgel (*lipov kij*).
- He makes his unusual sword, Mesarica, himself.
- In the duel with Brdavs, he uses the softness of the limewood to trap Brdavs's sword before overpowering him.
- Rather than accept the emperor's daughter or riches, he asks for permission to continue transporting salt.

These are literary source details, not verified biography. Scholarship discusses possible historical and folkloric inspirations, but those inspirations do not make Krpan a confirmed historical individual.

## 3. Skills and combat mechanics

### Skill 1 — Lipov kij

Krpan attacks one enemy with his limewood cudgel (*lipov kij*).

| Rank | Direct damage |
|---|---:|
| 1 | 10 |
| 2 | 16 |
| 3 | 20 |

Single-target physical damage.

### Skill 2 — Kmečka moč

Kmečka moč represents Krpan's exceptional physical strength. Its three ranks use increasingly spectacular displays of strength. The mare is part of the rank 2 visual presentation, not a projectile or an attacker.

#### Rank 1 — Dvojni udarec

Krpan delivers two consecutive punches.

- Each punch is a separate hit and resolves separately.
- **CONFIRMED (Game Director, 18 Nov 2026):** 8 damage per punch, 16 in total.
- Target handling is **OPEN**. The game aims both punches at the one targeted enemy (implementation reading).

#### Rank 2 — Vreči soli

Krpan's mare appears beside him carrying two enormous sacks of salt. Krpan takes the sacks and hurls them at his opponents.

- The two sacks are the visual focus of the attack.
- **CONFIRMED (Game Director, 18 Nov 2026):** 20 damage to one target, resolved as one combined attack.
- The mare helps present the attack but does not kick, charge or attack enemies.

#### Rank 3 — Ogromna skala

Krpan lifts and hurls an enormous boulder.

- The boulder can damage up to two enemies.
- **CONFIRMED (Game Director, 18 Nov 2026):** 22 damage, split between the two enemies it hits (11 each); a single enemy takes all 22. The game takes the targeted enemy and the one beside it (implementation reading; the even split is the reading of "split").
- Damage is high, immediate, flat direct damage.
- This is **not** damage over time and does not apply bleed or another lingering damage status.

### Skill 3 — Mesarica

Krpan draws his legendary sword and uses a precise slash against one enemy. The attack applies bleed damage over time.

| Rank | Direct damage | Bleed damage | Bleed duration | Total bleed |
|---|---:|---:|---:|---:|
| 1 | 10 | 2 per second | 2 seconds | 4 |
| 2 | 14 | 2 per second | 3 seconds | 6 |
| 3 | 20 | 2 per second | 4 seconds | 8 |

Single-target only. Bleed is a separate damage-over-time status, not part of the immediate direct strike. It follows the shared rule that damage-over-time effects are not reduced by attack interruption.

## 4. Recruitment and progression

- **CONFIRMED / IMPLEMENTED in current progression design:** Martin Krpan is one of the three known starting heroes and can be selected at the beginning of a new journey.
- Preserve his current starter status unless the Game Director explicitly changes it.
- Apply the shared hero level and skill-point rules. Use the character-specific rank values above where confirmed; do not invent values for the open Kmečka moč ranks.

## 5. Visual and narrative direction

### Gameplay sprites and skill animations

- Keep Krpan's silhouette grounded in the literary character rather than generic fantasy equipment.
- Existing prototype cues include a wide hat, moustache, vest and a sack of salt carried on his back.
- The limewood cudgel and Mesarica are defining objects.
- **Lipov kij:** a readable, weighty cudgel swing.
- **Kmečka moč R1:** two clear consecutive fist strikes.
- **Kmečka moč R2:** the mare briefly appears beside Krpan with two oversized sacks of salt; Krpan throws the sacks. The mare is a supporting visual element, not an attacker.
- **Kmečka moč R3:** Krpan throws one enormous boulder. Make the possible two-target impact legible without obscuring the combat UI.
- **Mesarica:** a strong, precise sword slash with a clear bleed-status cue.

Keep animations economical and readable at the existing gameplay sprite scale. Prefer a few strong key poses and clear impact frames over complex multi-part animation.

### Folk-art illustration — Krpan lifts his mare

Create a separate traditional folk-art illustration showing Krpan lifting his mare above his head. This is a visual representation of his extraordinary strength and a literary episode from Levstik's tale.

- The mare-lifting scene belongs in folk-art / narrative artwork, not in the Kmečka moč combat animation.
- Do not depict Krpan throwing the mare at an enemy.
- Keep this separate from the already confirmed final story-card subject below.
- The exact placement of this illustration in the game's collection or narrative presentation is **OPEN**.

### Final story card — Krpan defeats Brdavs

**CONFIRMED subject:** Krpan cunningly defeats Brdavs, using both the limewood cudgel (*lipov kij*) and Mesarica. The scene should communicate that his victory comes from strength and clever use of the cudgel, not simply from overpowering Brdavs with a sword.

**CONFIRMED unlock condition:** Krpan must survive the final encounter and be in the active party when the final boss is defeated, following the shared final-illustration rule.

The exact composition and execution will be developed during the full roster art review.

## 6. Open decisions

- Kmečka moč R1: which enemy takes the punches (the game uses the one targeted).
- Kmečka moč R3: which second enemy the boulder hits (the game uses the one beside the target).
- Exact placement of the separate folk-art illustration of Krpan lifting his mare.
- Animation timing and implementation details should follow the shared combat rules and be tested without changing the confirmed skill structure.

## 7. Sources and interpretation notes

- Fran Levstik, [Martin Krpan z Vrha](https://sl.wikisource.org/wiki/Martin_Krpan_z_Vrha), the primary literary source for the character and the episodes summarised above.
- [Slovenska biografija — Fran Levstik](https://www.slovenska-biografija.si/oseba/sbi322455/), biographical context for the author.
- Scholarship on the possible historical and folkloric inspirations for the tale should be treated as interpretation and context, not proof that Martin Krpan was a historical person.

**Interpretation boundary:** The cudgel, Mesarica, mare, salt trade, boulder-throwing gameplay skill and Brdavs duel belong to different layers: the cudgel, sword, mare, salt trade and duel are in Levstik's literary tale; the specific skill ranks, combat targets and numerical effects are game design. The Kmečka moč skill's boulder throw and the use of the mare to present the sacks are game interpretations, not claims about additional episodes in the literary source.
