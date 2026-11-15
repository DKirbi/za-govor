# Kralj Matjaž

  > **Status:** Core three-skill kit, combat targeting rules, exclusive recruitment location, and final illustration condition CONFIRMED; implementation remains pending.  
> **Character type:** Folklore hero / legendary king  
> **Associated region:** Peca (Region 2)  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`, `data/world.json`

## 1. Character identity

Kralj Matjaž is a legendary sleeping king whose return is expected in a time of great need. In the best-known Koroška tradition, he sleeps with his warriors inside Mount Peca, waiting until his beard has wound around the stone table nine times. His return promises the restoration of justice and better times.

**Confirmed gameplay identity:** A leader and party-support defender. He fights with his sword, rallies his company to deal more damage, weakens incoming enemy attacks, and awakens to heal and protect the party while striking all enemies at the highest rank.

The skill values below are **CONFIRMED design decisions**. They are not yet confirmed as implemented in the prototype.

## 2. Folklore and historical context

### The Peca tradition

The best-known local story places Matjaž and his sleeping army in a cave beneath Peca. He sits at a stone table; his beard grows and winds around it. When it has circled the table nine times, he will awaken and return to help his people, drive away injustice, and restore good times.

Some tellings add a linden tree growing or blossoming outside the cave in the middle of winter as a sign of his return. The number of turns around the table and other details vary between tellings; do not treat every modern retelling as one fixed canonical version.

### A wider, layered tradition

Kralj Matjaž belongs to a broad Central and Eastern European tradition, not only to a single Slovenian story. Folklore scholarship describes a long development in which older motifs of a sleeping hero in a mountain and a world tree became associated with the remembered figure of King Matthias Corvinus (Matija Korvin, 1443–1490). The relationship between the legendary figure and historical rulers is complex and has been debated.

A 2023 article by Marija Klobčar revisits the historical context and argues for considering an earlier, pre-Corvinus historical layer. This is a scholarly interpretation, not a settled identification. Do not state that Kralj Matjaž was definitely Matija Korvin, Charlemagne, or another historical ruler.

### Folklore versus game fiction

| Element | Classification | Notes |
|---|---|---|
| Sleeping king beneath Peca with his warriors | Documented regional folk tradition | Strong local association with Koroška |
| Stone table and beard winding around it | Documented folk motif | Number varies in tellings; nine is prominent in current popular Peca retellings |
| Return in a time of great need / restoration of justice | Documented folk motif | Central narrative meaning |
| Linden tree blooming in winter | Present in some tellings | Do not assume it appears in every version |
| Matjaž as a good, just ruler | Common folkloric characterisation | Variants differ |
| Identification with Matija Korvin | Widely repeated historical association, discussed by scholarship | Avoid presenting as a proven one-to-one identity |
| Sword, shields, party protection, combat awakening | Game interpretation / current prototype | Requires Game Director review |

## 3. Confirmed skills

The Game Director has confirmed the following three-skill kit and rank values. Each skill has one distinct folk-art illustration brief; see the skill folders under `folk-art/skills/`.

### 3.1 Meč — direct attack and party protection

| Rank | Effect |
|---|---|
| 1 | Deals **6 damage** to one enemy. |
| 2 | Deals **12 damage** to one enemy and grants **3 shield**. The shield reduces damage taken by the entire company of heroes from the next enemy attack. |
| 3 | Deals **18 damage** to one enemy and grants **6 shield**. The shield reduces damage taken by the entire company of heroes from the next enemy attack. |

The shield is party-wide protection for the next enemy attack. It reduces the damage dealt to **each hero hit by that attack by the stated shield value** (3 at rank 2, 6 at rank 3). It is not a shared pool consumed by the first hero. This is deliberately limited to avoid making Matjaž overpowered.

### 3.2 Kraljeva vojska — rally the king's company

**Fantasy:** Matjaž rallies his soldiers and inspires the whole company to fight harder.

| Rank | Effect |
|---|---|
| 1 | Increases the damage of the next attack by every ally by **+3**. |
| 2 | Increases the damage of the next attack by every ally by **+6**. |
| 3 | Increases the damage of the next attack by every ally by **+10** and reduces enemy damage by **3** for the next **two enemy hits**. |

The damage bonus applies independently to the **next attack made by each ally**. Each ally consumes their own bonus when they next attack. At rank 3, enemy damage is reduced by 3 for the next two enemy hits. Exact interaction of this reduction with multi-target attacks remains an implementation detail.

### 3.3 Prebujenje — the king awakens

**Fantasy:** Matjaž awakens beneath Peca, restoring the strength and protection of his company. At the highest rank, his awakening also strikes every enemy.

| Rank | Effect |
|---|---|
| 1 | Heals the entire party for **3 health**, revives fallen allies with **15% of their maximum health**, and grants **3 shield**. |
| 2 | Heals the entire party for **6 health**, revives fallen allies with **15% of their maximum health**, and grants **6 shield**. |
| 3 | Heals the entire party for **6 health**, revives fallen allies with **15% of their maximum health**, grants **6 shield**, and deals **12 damage to every enemy**. |

The revival effect is the same at all three ranks: fallen allies return with **15% of their maximum health**. Healing of standing allies is in addition to revival. Whether the healing amount also applies to revived allies after they return, and how the shield is represented internally, should be resolved consistently in implementation; the specified revival value must not be overwritten by the rank's healing amount.

### Skill naming and thematic notes

- **Meč**, **Kraljeva vojska**, and **Prebujenje** are the confirmed skill names.
- The linden tree is a documented motif in some versions of the awakening tradition. It may appear in the *Prebujenje* folk-art depiction, but should not be treated as universal to every version of the legend.
- Numerical values above are confirmed. No additional effects, targets, or status conditions should be added without approval.

## 4. Recruitment and progression

- **Associated region:** Peca (Region 2), whose background and intro already reference Kralj Matjaž and his cave.
- **Confirmed recruitment rule:** Kralj Matjaž can only be recruited at Peca (Region 2). He must be excluded from the generic hero-stop pool in all other regions.
- Whether he is guaranteed to appear at a Peca hero stop or appears there only as a chance/random encounter is not further specified; the Game Director said he can be recruited there only at times. Treat the exact encounter probability/guarantee as **OPEN**.
- Current prototype base HP: **34**. This is an implementation value, not final balance approval.
- Existing progression follows the standard hero level system unless changed during review.

## 5. Art and narrative presentation

Artwork production is intentionally deferred until the full character roster has been reviewed.

Existing prototype art direction note (not a final approval): crown, long grey beard, red cloak with ermine, and sword.

**Confirmed folk-art subjects:** one distinct folk-art illustration for each of the three skills: *Meč*, *Kraljeva vojska*, and *Prebujenje*.

**Confirmed final story illustration:** Kralj Matjaž asleep in the cave beneath Peca, surrounded by his sleeping soldiers, with his famous long beard wrapped around the stone table. The image should make the sleeping king and his company the central subject. Use the Peca cave tradition as its folkloric basis; do not invent architectural details or combine unrelated landmarks. The final illustration follows the shared character reward condition: it is unlocked only if Kralj Matjaž is alive in the active party when the final encounter is won. This condition is **CONFIRMED**.

Keep the cave setting credible to Peca and the local Koroška landscape. Do not treat a modern tourist installation or bronze statue as a historical depiction of the legendary king.

## 6. Asset inventory

| Asset | Required | Status |
|---|---:|---|
| Gameplay character sprite | Yes | Existing prototype asset to locate/review |
| Folk-art skill illustration: Meč | Yes | Subject confirmed; artwork deferred |
| Folk-art skill illustration: Kraljeva vojska | Yes | Subject confirmed; artwork deferred |
| Folk-art skill illustration: Prebujenje | Yes | Subject confirmed; artwork deferred |
| Final story illustration: sleeping king beneath Peca | Yes | Subject and final-encounter survival condition confirmed; artwork deferred |
| Story cards | To be defined after narrative review | Artwork deferred |
| Folklore / regional references | Yes | Initial research recorded; further review needed |

## 7. Open decisions

- Exact handling of the two-hit enemy damage reduction when an enemy attack hits multiple heroes.
- Whether the normal rank healing amount is applied to revived allies after they return at 15% maximum health.
- Whether the final illustration is presented as a card or another collection reward (unlock condition is confirmed).
- Whether Matjaž is guaranteed at a Peca hero stop or appears there as a chance encounter.
- Final domain words and any additional story-card content.

## 8. Implementation notes

- Existing prototype data is in `src/game.js`; regional placement is in `data/world.json`.
- `docs/progression-design.md` lists the current moves and values.
- The Game Director has approved the three-skill kit, rank values, per-hero shield reduction, independent next-attack ally bonuses, revival amount, Peca-only recruitment, and final-encounter survival condition.
- Implementation has not yet been updated. Keep the prototype's older values marked as stale until a dedicated implementation pass.
- Keep documented Peca folklore distinct from game-only combat effects.

## 9. Sources

See [references/README.md](references/README.md) for the research bibliography and source notes.
