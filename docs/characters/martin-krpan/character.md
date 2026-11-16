# Martin Krpan

> **Status:** Core role, three-skill kit, rank values and final story-card subject CONFIRMED. Artwork production deferred until the full roster review is complete.
> **Character type:** Slovenian literary hero / literary-folklore figure
> **Current role:** Starting hero; heavy single-target attacker
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Martin Krpan is the protagonist of Fran Levstik's *Martin Krpan z Vrha*, first published in 1858. He is a central figure in Slovenian literary and cultural memory, but should not be presented as a documented historical person or as a supernatural mythological being.

**CONFIRMED gameplay role:** Heavy single-target attacker. Preserve his identity as a physically powerful, practical and resourceful fighter. His strength is paired with ingenuity, especially in the story of his duel with Brdavs.

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

### Skill 1 — Kmečka moč

Krpan attacks one enemy with his limewood cudgel (*lipov kij*).

| Rank | Direct damage |
|---|---:|
| 1 | 10 |
| 2 | 16 |
| 3 | 20 |

Single-target physical damage.

### Skill 2 — Krpanova Kobila

A sequence of two attacks against one enemy.

| Rank | First hit | Second hit | Total damage | Additional effect |
|---|---:|---:|---:|---|
| 1 | 8 | 6 | 14 | — |
| 2 | 10 | 8 | 18 | — |
| 3 | 10 | 10 | 20 | 3-second stun |

**CONFIRMED:** This is a two-hit combo. The skill name evokes Krpan's mare, but the approved mechanic is two consecutive attacks. Do not add a mare appearing or attacking in the animation unless the Game Director requests it.

The rank 3 stun is a temporary combat effect. Apply the shared action/status and timed-attack rules.

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
- Apply the shared hero level and skill-point rules. The character-specific rank values above are authoritative for his skills.

## 5. Visual and narrative direction

Artwork production is deferred until the full roster has been reviewed.

Existing prototype cues include a wide hat, moustache, vest, and a sack of salt carried on his back. The limewood cudgel and Mesarica are defining objects. Keep his silhouette grounded in the literary character rather than generic fantasy equipment.

### Final story card — Krpan defeats Brdavs

**CONFIRMED subject:** Krpan cunningly defeats Brdavs, using both the limewood cudgel (*lipov kij*) and Mesarica. The scene should communicate that his victory comes from strength and clever use of the cudgel, not simply from overpowering Brdavs with a sword.

**CONFIRMED unlock condition:** Krpan must survive the final encounter and be in the active party when the final boss is defeated, following the shared final-illustration rule.

The exact composition and execution will be developed during the full roster art review.

## 6. Open decisions

No core skill names, rank values or role decisions are currently open. Animation timing and implementation details should follow the shared combat rules and be tested without changing the approved two-hit combo or bleed values.

## 7. Sources and interpretation notes

- Fran Levstik, [Martin Krpan z Vrha](https://sl.wikisource.org/wiki/Martin_Krpan_z_Vrha), the primary literary source for the character and the episodes summarised above.
- [Slovenska biografija — Fran Levstik](https://www.slovenska-biografija.si/oseba/sbi322455/), biographical context for the author.
- Scholarship on the possible historical and folkloric inspirations for the tale should be treated as interpretation and context, not proof that Martin Krpan was a historical person.

**Interpretation boundary:** The cudgel, Mesarica, mare, salt trade and Brdavs duel belong to Levstik's literary tale. The numerical skill effects, combat status effects and final-card unlock are game mechanics.
