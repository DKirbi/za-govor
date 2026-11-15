# Erazem Predjamski

> **Status:** Revised skill direction agreed; detailed balance and implementation remain open.  
> **Character type:** Folklore / historical-legend hero  
> **Combat role:** Sword fighter / resourceful support / evasive counterattacker  
> **Associated region:** Predjamski grad (Region 7)  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Erazem is based on the late-15th-century figure associated with Predjama Castle, whose historical identity became surrounded by a famous popular legend about resistance during a siege, hidden cave passages, cherries, betrayal, and death by cannon fire.

The game may use the familiar name **Erazem Predjamski**. Historical notes should explain that scholarship identifies him with the Jamski (Lueger) family and that the familiar “Predjamski” form became established later.

**Gameplay identity:** A capable sword fighter who is resourceful under pressure. He deals direct sword damage, uses cherries as a modest area of support through minor healing, and turns evasion into counterattacks.

## 2. Folklore and historical background

### Historical / documented context
- Erazem Lueger was a late-15th-century nobleman associated with Predjama / Jama Castle.
- The castle is built into a rock face and is connected to a karst cave system.
- His conflict with the Habsburg authorities and his death are discussed in historical biographies, but details in popular retellings vary.

### Popular legend
The best-known story tells that Erazem resisted an imperial siege from Predjama Castle, received supplies through hidden cave passages, taunted the besiegers with fresh food (especially cherries), and was betrayed by a servant who signalled when he was in the exposed privy, allowing a cannon to kill him.

The cherries and the precise details of the secret supply route belong to the popular legendary tradition, not securely established historical fact.

### Folklore versus game fiction
| Element | Classification | Notes |
|---|---|---|
| Erazem Lueger / Jamski, late 15th century | Historical figure | Consult scholarly biography |
| Predjama Castle built into the cliff and connected to caves | Documented geography / architecture | Strong visual and gameplay anchor |
| Hidden supply passages during the siege | Popular legend with a real cave setting | Do not overstate exact historical route |
| Fresh cherries taunting the besiegers | Popular legend | Strong character motif |
| Betrayal and cannon death in the privy | Popular legend | Famous ending, not to be presented as fully verified fact |
| Sword fighting, cherry throwing with healing, evasive counterattacks | Game interpretation | Inspired by the character's legend and role |

## 3. Skills

The agreed three-skill structure replaces the previous prototype kit. **The revised skill names and targeting decisions above are CONFIRMED; numeric balance and edge-case implementation remain OPEN.** **Trdnjava v skali is superseded as a skill.**

### 3.1 Meč — basic sword attack

**Purpose:** Erazem's straightforward melee attack with his sword.

| Rank | Effect |
|---|---|
| 1 | Sword strike against one enemy. |
| 2 | Stronger sword strike. |
| 3 | Strongest sword strike / enhanced damage. |

Exact damage coefficients and any additional rank-specific properties are **OPEN**. Do not add new effects without approval.

**Name status:** **Zamah z mečem** — confirmed by the Game Director.

### 3.2 Češnje — resourceful cherry attack and minor party healing

**Purpose:** Erazem throws cherries at enemies. The attack deals medium damage, while his resourcefulness also provides a small amount of healing to his companions.

- Cherries deal less damage than his dedicated sword attack.
- Damage should be medium relative to other support-oriented skills.
- The skill also heals Erazem's **adjacent allies only**, by a very small amount. Erazem himself is not healed.
- Exact damage coefficient, healing amount, number of enemy targets, and rank scaling are **OPEN**. The ally-healing target rule is confirmed.

The skill deliberately combines a humorous and recognisable element of the popular siege legend with a modest support effect. The healing is game fiction, not a claim about the historical legend.

### 3.3 Skrivni rov — evasion and counterattack

**Purpose:** Erazem uses the hidden routes and his ability to outmanoeuvre his enemies to evade incoming attacks and retaliate.

| Rank | Effect |
|---|---|
| 1 | Erazem evades the next incoming enemy attack. |
| 2 | Erazem evades the next incoming enemy attack and counterattacks for **1.5× damage**. |
| 3 | Erazem and one adjacent ally evade the next incoming enemy attack; Erazem counterattacks for **1.75× damage**. |

**Open implementation details**
- Define whether the counterattack targets the enemy whose attack was evaded or another valid target.
- Define how an area attack interacts with the evasion effect.
- **Confirmed:** the adjacent ally only evades; only Erazem counterattacks.
- Define how “adjacent” is determined in the party formation.
- Define whether the effect expires after the next enemy attack if that attack does not target Erazem or the protected ally.
- Damage multipliers are agreed values for the counterattack, but the base damage calculation they multiply must be specified consistently with the combat system.

## 4. Recruitment

- **Associated region:** Predjamski grad (Region 7).
- The current journey documentation identifies Erazem as the hero associated with this region.
- Whether he must be exclusively recruitable in Region 7 or may appear in the general hero pool is **OPEN** pending Game Director decision.

## 5. Health and progression

Erazem follows the normal character-level HP and attack progression unless a later balance review explicitly changes it. His current prototype base HP is **34**; this is an existing implementation value, not a final balance approval.

## 6. Art and narrative presentation

Artwork production is intentionally deferred until the full character roster has been reviewed.

Required artwork:
- One folk-art depiction for each of his three skills: **Meč**, **Češnje**, and **Skrivni rov**.
- A special final story card depicting **Predjama Castle / Erazem's castle**.
- The special card is unlocked only if Erazem remains in the player's active surviving party until the final boss is defeated.

The special card should depict the recognisable real Predjama Castle, not a generic fantasy fortress. Keep the castle's real cliff setting and architecture credible.

The three skill depictions should be distinct:
1. **Meč:** Erazem striking with his sword.
2. **Češnje:** Erazem throwing cherries, with the small restorative/support aspect communicated visually without inventing folkloric claims.
3. **Skrivni rov:** Erazem evading through or emerging from a concealed passage, ready to counterattack.

The special castle card is a game reward, not a claim that the historical Erazem's story ended in victory.

## 7. Asset inventory

| Asset | Required | Status |
|---|---:|---|
| Gameplay character sprite | Yes | Existing prototype asset to locate/review |
| Combat animation: Meč | Yes | Artwork deferred |
| Combat animation: Češnje | Yes | Artwork deferred |
| Combat animation: Skrivni rov | Yes | Artwork deferred |
| Folk-art skill depiction: Meč | Yes | Artwork deferred |
| Folk-art skill depiction: Češnje | Yes | Artwork deferred |
| Folk-art skill depiction: Skrivni rov | Yes | Artwork deferred |
| Special story card: Predjama Castle | Yes | Artwork deferred |
| Historical / geographical references | Yes | To be expanded and verified |

## 8. Open decisions

- **Resolved:** basic sword attack name is *Zamah z mečem*.
- Exact damage and healing values for Meč and Češnje.
- Exact number of enemies hit by Češnje.
- **Resolved:** Češnje heal Erazem's adjacent allies only; exact amount and living/standing target handling remain open.
- Counterattack target selection and AoE interaction for Skrivni rov.
- **Resolved:** adjacent ally only evades at rank 3; only Erazem counterattacks.
- Exact adjacency rule in party formation.
- Exclusive recruitment at Predjamski grad versus general hero pool.
- Whether the special Predjama Castle card can be earned on a later journey if missed.

## 9. Implementation notes

- Replace the previous `Češnje → Skrivni rov → Trdnjava v skali` skill order with the revised `Meč → Češnje → Skrivni rov` order.
- Mark `Trdnjava v skali` as superseded and remove it from active character skill data once implementation is updated.
- Implement Skrivni rov using an attack-triggered evasion state, not a round timer.
- At rank 2, trigger Erazem's counterattack at 1.5× damage after a successful evasion.
- At rank 3, include one adjacent ally in the evasion protection and use a 1.75× Erazem counterattack.
- Implement cherry damage and party healing as one skill activation; exact values remain subject to balance approval.
- Add a final-boss victory unlock check: Erazem must be in the active surviving party to unlock the special Predjama Castle card.

## 10. Sources

- [Slovenska biografija — Erazem (Pred)jamski](https://www.slovenska-biografija.si/oseba/sbi922140/)
- [Andrej Nared, “Erazem (Pred)jamski – slovenski Robin Hood?”, Zgodovina za vse (1998)](https://www.sistory.si/publication/2502)
- [Culture of Slovenia — Predjama Castle](https://culture.gov.si/en/Predjama_Castle)
- [I feel Slovenia — Slovenian myths and legends](https://www.slovenia.info/en/stories/explore-the-world-of-slovenian-myths-and-legends)
- [Current journey and progression design](../../progression-design.md)
- [Character and combat implementation](../../../src/game.js)

**Research caution:** The popular siege narrative has multiple versions. Record exact source and page details for any specific claim before using it as a factual statement in the game.
