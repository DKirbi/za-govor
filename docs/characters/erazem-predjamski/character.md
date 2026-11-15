# Erazem Predjamski

> **Status:** Folklore review in progress; current prototype kit documented, redesign not yet approved.  
> **Character type:** Folklore / historical-legend hero  
> **Current prototype role:** Defensive / evasive fighter  
> **Associated region:** Predjamski grad (Region 7)  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Erazem is based on the late-15th-century figure associated with Predjama Castle, whose historical identity became surrounded by a famous popular legend about resistance during a siege, hidden cave passages, cherries, betrayal, and death by cannon fire.

The game may use the familiar name **Erazem Predjamski**. Historical notes should explain that scholarship identifies him with the Jamski (Lueger) family and that the familiar “Predjamski” form became established later.

## 2. Folklore and historical background

### Historical / documented context
- Erazem Lueger was a late-15th-century nobleman associated with Predjama / Jama Castle.
- The castle is built into a rock face and is connected to a karst cave system.
- His conflict with the Habsburg authorities and his death are discussed in historical biographies, but details in popular retellings vary.

### Popular legend
The best-known story tells that Erazem resisted an imperial siege from Predjama Castle, received supplies through hidden cave passages, taunted the besiegers with fresh food (especially cherries), and was betrayed by a servant who signalled when he was in the exposed privy, allowing a cannon to kill him.

### Folklore versus game fiction
| Element | Classification | Notes |
|---|---|---|
| Erazem Lueger / Jamski, late 15th century | Historical figure | Consult scholarly biography |
| Predjama Castle built into the cliff and connected to caves | Documented geography / architecture | Strong visual and gameplay anchor |
| Hidden supply passages during the siege | Popular legend with a real cave setting | Do not overstate exact historical route |
| Fresh cherries taunting the besiegers | Popular legend | Strong character motif |
| Betrayal and cannon death in the privy | Popular legend | Famous ending, not to be presented as fully verified fact |
| Combat skills in the game | Game interpretation | Must be reviewed against story motifs |

## 3. Current prototype skills — not yet approved

The current browser prototype lists:
- **Češnje**
- **Skrivni rov**
- **Trdnjava v skali**

Current prototype summary describes Erazem as a defensive/evasive fighter: cherries as an attack, the secret tunnel causing the next enemy attack to miss, and the strongest move adding a shield. These names and effects are the subject of this review and must not be treated as final.

## 4. Recruitment

The current journey places Predjamski grad in Region 7 and lists Erazem as the hero associated with that place. The current generic hero-stop system can draw unencountered folk heroes at random; whether Erazem should be exclusive to Region 7 is **OPEN** pending Game Director decision.

## 5. Art and narrative presentation

Artwork production is intentionally deferred until the full character roster has been reviewed.

Required folders are scaffolded for:
- Gameplay sprites and combat animations.
- One folk-art depiction per skill.
- Folklore story cards.
- Historical, geographical and visual references.

Project visual direction:
- Gameplay sprites: modernised SNES/GBA-inspired pixel art.
- Folk-art cards: traditional Slovenian folk-art illustration, with panjske končnice as an important reference.

## 6. Open review questions

- Do the three current skill names accurately represent the legend and sound natural in Slovene?
- Should **Češnje** remain the first skill, and should it be an attack or a more mischievous tactical ability?
- Does **Skrivni rov** accurately communicate its gameplay effect, or should it be reframed?
- Does **Trdnjava v skali** represent Erazem's defensive identity, the castle, or both?
- Should Erazem be recruitable only at Predjamski grad, or remain in the general hero pool?
- How much of his controversial outlaw / robber-knight identity should the game communicate?
- How should the betrayal and privy legend be handled in story cards without turning it into cheap comedy?

## 7. Sources

- [Slovenska biografija — Erazem (Pred)jamski](https://www.slovenska-biografija.si/oseba/sbi922140/)
- [Andrej Nared, “Erazem (Pred)jamski – slovenski Robin Hood?”, Zgodovina za vse (1998)](https://www.sistory.si/publication/2502)
- [Culture of Slovenia — Predjama Castle](https://culture.gov.si/en/Predjama_Castle)
- [I feel Slovenia — Slovenian myths and legends](https://www.slovenia.info/en/stories/explore-the-world-of-slovenian-myths-and-legends)
- [Current journey and progression design](../../progression-design.md)
- [Character and combat implementation](../../../src/game.js)

**Research caution:** The popular siege narrative has multiple versions. Record exact source and page details for any specific claim before using it as a factual statement in the game.
