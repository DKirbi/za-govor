# Kresnik

> **Status:** Initial folklore research recorded; character kit review OPEN.  
> **Character type:** Folklore hero / mythological figure  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`

## 1. Character identity

Kresnik is a complex figure in Slovenian folk tradition associated with fire, sparks, the sun, and the midsummer turning point of the year. In a prominent cycle of tales, he is a royal or princely hero who fights a snake, dragon, or other hostile being, rescues a woman or restores stolen wealth, and whose victory is followed by rain and a fertile harvest.

**Existing gameplay identity (IMPLEMENTED prototype):** A fire-focused damage dealer. His current moves are *Žerjavica*, *Plamen*, and *Kresni ogenj*. The prototype describes burning enemies and an all-enemy burn effect at the strongest rank. This is existing implementation, not final design approval.

## 2. Folklore and historical context

### Kresnik and midsummer

Monika Kropej identifies Kresnik as a characteristic figure appearing in Slovenian belief traditions around the summer solstice. His attributes include the sun and fire; the Slovene verb *kresati* is associated with striking fire. The figure and narratives vary substantially across regions and periods.

### The royal hero and dragon-slayer cycle

Folktales describe Kresnik as a prince or count associated with a castle, sometimes born with unusual bodily marks or horse hooves. In a well-known narrative cycle, he confronts a snake, dragon, snake king, or giant; rescues a princess or another captive; and restores stolen cattle or wealth. Some versions describe a bright sword, lightning, flight, or animal transformations. After victory, rain, golden grain, or agricultural abundance may follow.

The Vurberg Castle Kresnik legend is one documented regional cycle, recorded in the nineteenth century. It should not automatically be treated as the only or oldest version.

### Kresnik and Perun — interpretation, not settled fact

Some scholars have compared Kresnik with Perun or with a wider Indo-European thunder-god pattern because of the fire, lightning, dragon-combat, and atmospheric motifs. The relationship is a scholarly reconstruction and remains debated. Do not present Kresnik simply as another name for Perun or merge their identities without an explicit creative decision.

### Folklore versus game fiction

| Element | Classification | Notes |
|---|---|---|
| Association with midsummer, fire and sun | Documented Slovenian belief tradition | Strong thematic anchor |
| Kresnik as royal / princely hero | Present in narrative cycles | Not universal to every local tradition |
| Fight against snake, dragon or hostile being | Documented narrative motif | Opponent and circumstances vary |
| Rescue of princess / restoration of stolen cattle or wealth | Documented in several tale variants | Do not combine every episode into one canonical story |
| Victory followed by rain or golden harvest | Documented in some versions | Strong renewal / fertility motif |
| Direct identity with Perun | Scholarly reconstruction / debated interpretation | Not a confirmed historical or religious fact |
| Fire attacks, burning enemies and combat effects | Game interpretation / current prototype | Requires Game Director review |

## 3. Current prototype skills (IMPLEMENTED, NOT YET APPROVED)

| Order | Current name | Current prototype value / effect |
|---|---|---|
| 1 | Žerjavica | `−7 · gori` |
| 2 | Plamen | `−16 · gori` |
| 3 | Kresni ogenj | `−34`; extra effect: all enemies burn |

The current prototype summary describes Kresnik as a solar hero focused on fire. These names, damage values, burn rules, target counts, and rank effects are **OPEN for review**. Do not assume these are final.

## 4. Recruitment and progression

- Current roster lists Kresnik as the hero associated with Bled (Region 4, fallback).
- The current hero-stop system uses a random pool of un-met folk heroes; regional association does not guarantee recruitment at Bled.
- Whether Kresnik should be exclusive to Bled or available in the general hero pool is **OPEN**.
- Current prototype base HP and attack progression should be inspected before balance changes. Do not infer final stats from the roster summary alone.

## 5. Art and narrative presentation

Artwork production is intentionally deferred until the full character roster has been reviewed.

Existing prototype art note (not approved final art): golden hair like flames, red vest, and a torch. The largest card is described as a midsummer night with a bonfire, a burning wheel rolling down a hill, and a fern flower. These are current concept cues, not all verified as one unified Kresnik narrative. The fern flower and rolling wheel need separate folklore-source verification before being treated as authentic Kresnik attributes.

Keep Kresnik distinct from the god Perun in visual identity. Do not automatically give him Perun's established thunder-god attributes or equipment.

## 6. Asset inventory

| Asset | Required | Status |
|---|---:|---|
| Gameplay character sprite | Yes | Existing prototype asset to locate/review |
| Three skill illustrations | To be defined after skill review | Artwork deferred |
| Story cards | To be defined after narrative review | Artwork deferred |
| Folklore / regional references | Yes | Initial research recorded; further review needed |

## 7. Open decisions

- Final combat role: retain fire damage / burning specialist or revise?
- Review the three existing skills: *Žerjavica*, *Plamen*, *Kresni ogenj*.
- Exact rank effects, damage, burn duration, target rules, and stacking.
- Whether Kresnik's kit should reflect the dragon-slayer / rescuer cycle, midsummer fire, or a deliberate combination.
- Recruitment placement: Bled-only, guaranteed at Bled, or general hero-stop pool.
- Verify fern-flower and burning-wheel motifs before using them as Kresnik-specific folklore.
- Final Slovene domain words and story-card subjects.

## 8. Implementation notes

- Existing character data is in `src/game.js`; regional association is described in `docs/progression-design.md`.
- Do not alter implementation until the Game Director approves the reviewed kit.
- Keep documented Kresnik traditions distinct from game-only fire abilities.
- Apply the shared final-illustration condition once its subject and unlock art are approved: the character must survive the final encounter.

## 9. Sources

See [references/README.md](references/README.md) for the research bibliography and source notes.
