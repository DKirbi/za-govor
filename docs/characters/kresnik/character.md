# Kresnik

> **Status:** Folklore research recorded; core combat identity and three-skill direction CONFIRMED. Exact ranks, values, names and implementation details remain OPEN.  
> **Character type:** Folklore hero / mythological figure  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Kresnik is a complex figure in Slovenian folk tradition associated with fire, sparks, the sun, and the midsummer turning point of the year. In a prominent cycle of tales, he is a royal or princely hero who fights a snake, dragon, or other hostile being, rescues a woman or restores stolen wealth, and whose victory is followed by rain and a fertile harvest.

**CONFIRMED gameplay identity:** Kresnik is a fire mage and monster-slayer. His attacks are relatively modest initially but continue dealing damage over time. He has a slight thematic connection to Perun, while remaining a distinct character. Do not merge their identities.

**CONFIRMED matchup direction:** Kresnik's flaming sword strike deals double damage against dragons and serpents. Water-associated beings such as Povodni mož and vodna vila should be a source of increased vulnerability for him. The exact scope and implementation of these matchup modifiers remain OPEN.

## 2. Folklore and historical context

### Kresnik and midsummer

Monika Kropej identifies Kresnik as a characteristic figure appearing in Slovenian belief traditions around the summer solstice. His attributes include the sun and fire; the Slovene verb *kresati* is associated with striking fire. The figure and narratives vary substantially across regions and periods.

### The royal hero and dragon-slayer cycle

Folktales describe Kresnik as a prince or count associated with a castle, sometimes born with unusual bodily marks or horse hooves. In a well-known narrative cycle, he confronts a snake, dragon, snake king, or giant; rescues a princess or another captive; and restores stolen cattle or wealth. Some versions describe a bright sword, lightning, flight, or animal transformations. After victory, rain, golden grain, or agricultural abundance may follow.

The Vurberg Castle Kresnik legend is one documented regional cycle, recorded in the nineteenth century. It should not automatically be treated as the only or oldest version.

### Kresnik and Perun — interpretation, not settled fact

Some scholars have compared Kresnik with Perun or with a wider Indo-European thunder-god pattern because of the fire, lightning, dragon-combat, and atmospheric motifs. The relationship is a scholarly reconstruction and remains debated. The Game Director wants to leave room for a possible thematic relationship or bond, but Kresnik must remain distinct from Perun. Do not present Kresnik simply as another name for Perun or merge their identities.

### Folklore versus game fiction

| Element | Classification | Notes |
|---|---|---|
| Association with midsummer, fire and sun | Documented Slovenian belief tradition | Strong thematic anchor |
| Kresnik as royal / princely hero | Present in narrative cycles | Not universal to every local tradition |
| Fight against snake, dragon or hostile being | Documented narrative motif | Opponent and circumstances vary |
| Rescue of princess / restoration of stolen cattle or wealth | Documented in several tale variants | Do not combine every episode into one canonical story |
| Victory followed by rain or golden harvest | Documented in some versions | Strong renewal / fertility motif |
| Direct identity with Perun | Scholarly reconstruction / debated interpretation | Not a confirmed historical or religious fact |
| Fire attacks, damage-over-time effects and gold generation | Game interpretation | Approved design direction; exact mechanics open |

## 3. Skills and combat mechanics

### Confirmed skill direction

| Order | Skill | Confirmed design |
|---|---|---|
| 1 | Flaming sword — Slovene name OPEN | A flaming sword strike. Direct damage increases with rank and applies a damage-over-time burn. Against dragons and serpents, the sword strike deals 2× damage. |
| 2 | **Kresna strela** | A fire bolt that chains between multiple enemies and applies a separate damage-over-time burn. |
| 3 | Restorative skill — name OPEN | After an enemy damages Kresnik, he restores health equal to up to half of the damage received. He also grants the player gold equal to half of the amount of health restored. |

### Damage-over-time rules — CONFIRMED direction, details OPEN

- The first two attacks begin with comparatively low direct damage.
- Each applies additional damage over time equal to the direct damage dealt by that attack.
- The burn is distributed evenly over the next two or three enemy attacks.
- Exact rank-to-duration mapping, rounding, stacking, refresh behaviour, and whether the burn triggers on every enemy attack or only selected enemy actions remain OPEN.
- The 2× dragon/serpent modifier is confirmed for the flaming sword strike. Whether it also doubles the associated burn damage is OPEN.

### Restorative skill — details OPEN

- Trigger: an enemy damages Kresnik.
- Healing: restore up to 50% of the damage received.
- Gold: grant the player gold equal to 50% of the health restored.
- OPEN: whether it triggers after every damage instance or once per enemy action; whether damage-over-time counts; whether the healing is capped by missing health; whether the skill has ranks/cooldown; and how fractional gold is rounded.
- Do not interpret the gold as being deducted from an enemy or as a party-wide heal unless explicitly approved.

### Previous prototype (IMPLEMENTED, SUPERSEDED as design direction)

The old prototype used *Žerjavica*, *Plamen*, and *Kresni ogenj*, with damage values `−7`, `−16`, and `−34`, and burning effects. These are existing implementation details only. They are superseded as the approved skill direction and must not be treated as final balance or final names.

## 4. Recruitment and progression

- Current roster lists Kresnik as the hero associated with Bled (Region 4, fallback).
- The current hero-stop system uses a random pool of un-met folk heroes; regional association does not guarantee recruitment at Bled.
- Whether Kresnik should be exclusive to Bled or available in the general hero pool is OPEN.
- Current prototype base HP and attack progression should be inspected before balance changes. Do not infer final stats from the roster summary alone.

## 5. Art and narrative presentation

Artwork production is intentionally deferred until the full character roster has been reviewed.

Existing prototype art note (not approved final art): golden hair like flames, red vest, and a torch. The largest card is described as a midsummer night with a bonfire, a burning wheel rolling down a hill, and a fern flower. These are current concept cues, not all verified as one unified Kresnik narrative. The fern flower and rolling wheel need separate folklore-source verification before being treated as authentic Kresnik attributes.

Keep Kresnik distinct from the god Perun in visual identity. A subtle relationship may be explored later, but should not be assumed in his core design.

## 6. Asset inventory

| Asset | Required | Status |
|---|---:|---|
| Gameplay character sprite | Yes | Existing prototype asset to locate/review |
| Three skill illustrations | Yes | Subjects to follow the approved skill direction; artwork deferred |
| Story cards | To be defined after narrative review | Artwork deferred |
| Folklore / regional references | Yes | Initial research recorded; further review needed |

## 7. Open decisions

- Final Slovene name for the flaming sword skill and restorative skill.
- Exact damage values and rank scaling for all three skills.
- Whether the sword's 2× dragon/serpent modifier applies to direct damage only or to its burn as well.
- Kresna strela chain target count, chain damage behaviour and rank scaling.
- Burn duration by rank, stacking/refresh rules, and tick timing.
- Restorative skill trigger frequency, DoT interaction, overheal handling, rank scaling and fractional-gold rounding.
- Exact vulnerability modifiers against water-associated beings.
- Recruitment placement: Bled-only, guaranteed at Bled, or general hero-stop pool.
- Verify fern-flower and burning-wheel motifs before using them as Kresnik-specific folklore.
- Final story-card subjects.

## 8. Implementation notes

- Existing character data is in `src/game.js`; regional association is described in `docs/progression-design.md`.
- Do not alter implementation until the Game Director approves the reviewed kit and its exact rules.
- Keep documented Kresnik traditions distinct from game-only fire abilities.
- Apply the shared final-illustration condition once its subject and unlock art are approved: the character must survive the final encounter.

## 9. Sources

See [references/README.md](references/README.md) for the research bibliography and source notes.
