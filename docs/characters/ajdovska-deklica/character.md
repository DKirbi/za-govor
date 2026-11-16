# Ajdovska deklica

> **Status:** Character direction agreed; detailed balance and implementation remain open.  
> **Character type:** Folklore hero  
> **Combat role:** Defensive support / crowd control  
> **Exclusive recruitment:** Triglav region  
> **Current prototype reference:** `src/game.js` and `docs/progression-design.md`

## 1. Character identity

Ajdovska deklica is a durable defensive companion. She protects the party by intercepting enemy attacks, absorbs part of the redirected damage herself, and can temporarily disable enemies through petrification. Her direct damage is deliberately lower than that of dedicated damage dealers.

Her identity should communicate:
- A giantess associated with the Slovenian mountain landscape.
- A protector and guide of travellers in dangerous mountain conditions.
- A prophetic being (sojenica) in the Prisank tradition.
- Her tragic transformation into stone, represented by the recognisable stone face at Prisank.

**Gameplay interpretation:** The protective combat kit is an original game interpretation inspired by her folkloric role as a helper of travellers. It is not a claim that the source tale describes magical combat abilities.

## 2. Folklore and backstory

### 2.1 Prisank / Vršič tradition

In the best-known story associated with the Ajdovska deklica rock face on Prisank, the giantess helps travellers and carriers who become lost in snowstorms on the dangerous route over Vršič towards Trenta. She walks ahead through deep snow and guides them to safety. Travellers leave food and drink in gratitude.

She is also described as a sojenica who visits newborn children and foretells their destinies. In the story, she predicts the future of a boy who will hunt Zlatorog and gain wealth from its golden horns. Her sisters curse her for this prophecy, and she turns to stone in the wall of Prisank.

### 2.2 Separate local traditions

Other Slovenian local traditions also feature an ajdovska deklica or giantess, including a Crngrob story in which a giantess helps build a church by carrying stones and water. Do not merge this story into the Prisank character's biography without an explicit creative decision and clear attribution. Shared motifs do not prove that all stories describe one identical folkloric figure.

### 2.3 Folklore versus game fiction

| Element | Classification | Use in the game |
|---|---|---|
| Giantess associated with Prisank | Documented folklore | Character identity and visual scale |
| Helping lost travellers in snow | Documented folklore | Story card / protector theme |
| Sojenica and prophecy | Documented folklore | Story card / backstory |
| Prophecy concerning Zlatorog | Documented folklore | Story card |
| Petrification and stone face at Prisank | Documented folklore | Character motif and special ending card |
| Throwing stones as a combat skill | Game interpretation | Skill: Metanje skal |
| Intercepting attacks for companions | Game interpretation | Skill: Varstvo popotnikov |
| Disabling enemy attacks through petrification | Game interpretation | Skill: Okamnitev |

## 3. Recruitment

- **Recruitment region:** Triglav only.
- **Availability:** She may be encountered at the hero stop in the Triglav region.
- **Recruitment condition:** The player must meet and recruit her there.
- **Other regions:** She must not appear as a recruitable random hero elsewhere, unless the Game Director changes this rule.

The current journey documentation says hero stops can select from a random pool of unencountered folk heroes. The implementation must add an explicit Triglav-only restriction for Ajdovska deklica rather than relying on the region's generic random hero pool.

## 4. Combat role and skills

All three skills are part of her character kit. Skill ranks are upgraded/unlocked through the game's skill progression system; the tiers below describe the agreed effects, not a claim that the current prototype already implements them.

### 4.1 Metanje skal — offensive attack

**Purpose:** A simple physical attack that grows from a single-target hit into a multi-target stone barrage.

| Rank | Effect |
|---|---|
| 1 | Throws a stone at one enemy. |
| 2 | Throws stones at multiple enemies. Target count and damage values require balancing. |
| 3 | Throws stronger stones at multiple enemies; damage increases. |

**Notes**
- The name *Metanje skal* is natural, clear Slovene and accurately describes the action.
- The exact number of targets at ranks 2 and 3, damage coefficients, targeting rules, and animation timing are **OPEN**.
- Do not assume the target counts are two and three until explicitly approved.

### 4.2 Varstvo popotnikov — defensive protection

**Purpose:** She protects companions by taking their incoming attacks onto herself.

| Rank | Protection charges |
|---|---:|
| 1 | Next 1 enemy attack |
| 2 | Next 2 enemy attacks |
| 3 | Next 3 enemy attacks |

**Damage redirection rules**
- Protection is counted by **enemy attack instances**, not by rounds or elapsed time.
- When an attack would hit a protected companion, redirect that companion's damage to Ajdovska deklica.
- She receives **50% of the redirected damage**.
- If an attack targets multiple protected companions, all of the damage that would have been dealt to those companions is redirected to her and halved.
- Protected companions take no damage from the intercepted attack.
- Each enemy attack instance consumes one protection charge. An area attack is one attack instance even if it targets several companions.
- Exact handling when Ajdovska deklica herself is directly targeted, when an attack has mixed protected/unprotected targets, or when the redirected damage exceeds her remaining HP is **OPEN** and must be specified during implementation.

**Name status:** *Varstvo popotnikov* is the current working name. It reflects the traveller-protection folklore, but final linguistic approval remains open.

### 4.3 Okamnitev — crowd control

**Purpose:** Petrifies enemies, slowing/stopping their attack action so that the attack becomes ineffective.

| Rank | Enemies affected | Duration |
|---|---:|---:|
| 1 | 1 | 1 round |
| 2 | 2 | 1 round |
| 3 | 2 | 2 rounds |

**Effect rules**
- An affected enemy's direct attack action is disabled for the duration.
- This prevents the enemy's attack from damaging the party while the effect is active.
- Damage-over-time effects, including poison and burn, are **not** disabled or removed by Okamnitev. They continue normally.
- Okamnitev is not a cleanse and does not remove existing damage-over-time effects.
- Whether the duration is decremented at the beginning or end of an enemy action cycle must be made consistent in implementation and documented in combat rules.

**Name status:** *Okamnitev* is retained. It is natural Slovene and accurately describes petrification.

## 5. Health and progression

- Ajdovska deklica follows the normal character-level HP progression used by all heroes.
- In addition, she receives a **slightly higher HP increase per level** than standard heroes, because she is a defensive support with comparatively low damage output.
- Her current prototype base HP is **38**. Treat this as the existing implementation value, not a final balance approval.
- The exact additional HP per level or her dedicated growth multiplier is **OPEN** and requires balance testing.
- Do not change the normal level progression of other heroes to accommodate her.

## 6. Art and narrative presentation

The project uses two distinct visual tracks:
- Gameplay sprites and combat effects: modernised SNES/GBA-inspired pixel art.
- Folklore cards and selected narrative artwork: traditional folk-art illustration, with panjske končnice as an important reference.

Ajdovska deklica needs three dedicated folk-art skill depictions, one for each skill:
1. **Metanje skal:** the giantess throwing stones at her foes.
2. **Varstvo popotnikov:** the giantess shielding or standing between endangered travellers and danger.
3. **Okamnitev:** the petrifying power taking hold of enemies.

These are three separate skill depictions, not three versions of the same illustration. Any additional rank-specific variants are **OPEN** and should only be produced if the art direction requires them.

### Story cards

Her folklore backstory should also be presented through separate folk-art story cards:
- **The Prophecy:** her role as a sojenica and the prophecy connected to Zlatorog.
- **The Mountain Protector:** her guiding and helping of travellers in snowstorms.

### Special ending card — The Stone Wall

- A unique depiction of her petrified form / the stone face at Prisank.
- Unlocked only if Ajdovska deklica remains in the player's active party until the final boss is defeated.
- The player must defeat the final boss with her still in the party.
- This is a special narrative/collection reward, not a combat skill.
- The exact unlock UI and whether the card is missable permanently or can be earned in a later journey are **OPEN**.

## 7. Asset inventory

See the folder READMEs for naming conventions and production notes.

| Asset | Required | Status |
|---|---:|---|
| Gameplay character sprite | Yes | Existing prototype asset to locate/review |
| Combat sprite / animation for Metanje skal | Yes | Not yet catalogued |
| Combat sprite / animation for Varstvo popotnikov | Yes | Not yet catalogued |
| Combat sprite / animation for Okamnitev | Yes | Not yet catalogued |
| Folk-art depiction: Metanje skal | Yes | Placeholder only |
| Folk-art depiction: Varstvo popotnikov | Yes | Placeholder only |
| Folk-art depiction: Okamnitev | Yes | Placeholder only |
| Story card: The Prophecy | Yes | Placeholder only |
| Story card: The Mountain Protector | Yes | Placeholder only |
| Special card: The Stone Wall | Yes | Placeholder only |
| Folklore reference notes / bibliography | Yes | To be expanded and verified |

## 8. Open decisions

- Final approval of the name *Varstvo popotnikov*.
- Exact target counts and damage coefficients for Metanje skal ranks 2 and 3.
- Exact damage values for all ranks of Metanje skal.
- Exact additional HP growth per level.
- Protection edge cases: self-targeting, mixed protected/unprotected targets, lethal redirection.
- Exact round timing for Okamnitev.
- Whether rank-specific skill illustrations are needed in addition to the three core skill depictions.
- Whether the Stone Wall card can be unlocked in a later journey if missed.

## 9. Implementation notes

- Add Ajdovska deklica to the Triglav-only recruitment pool and exclude her from generic hero-stop selection in other regions.
- Implement protection as a counter of remaining intercepted enemy attack instances, not a round timer.
- Aggregate the damage of all protected party members hit by the same attack, redirect the total to Ajdovska deklica, then apply the 50% reduction.
- Ensure damage-over-time ticks continue while an enemy is affected by Okamnitev.
- Give her a dedicated HP progression adjustment without changing the standard progression formula for other heroes.
- Add the Stone Wall unlock check to the final-boss victory condition: Ajdovska deklica must be in the active party at victory.

## 10. Sources and references

### Project sources
- [Current journey and progression design](../../progression-design.md)
- [Character and combat implementation](../../../src/game.js)
- [World and regional data](../../../data/world.json)

### Folklore sources to consult / verify
- Triglav National Park, *Miti in legende pod Triglavom* — source for the Prisank / Vršič tradition.
- Dušica Kunaver, *Slovenska dežela v pripovedki in podobi* (1991) — published retelling of the story.
- ZRC SAZU, Language Advisory Service — usage and capitalization of *ajdovska deklica*.

**Research caution:** The exact wording and variants of oral traditions differ between publications. When adding quotations or detailed claims, record the specific edition and page number. Do not conflate the Prisank story with other local giantess traditions.
