# Za govor! — Project Description

**Status:** Working project reference, assembled from the repository documentation and latest explicit Game Director decisions. This document is a concise entry point, not a replacement for detailed system specifications.

## Identity

*Za govor!* is a Slovene word-puzzle RPG inspired by Slovene folklore and Slavic mythology. The player travels across Slovenia, builds a party of folkloric heroes, and fights creatures by forming Slovene words from letter grids.

The title is a wordplay: *zagovor* means a spoken charm, while *za govor* means “for speech”. The game celebrates the richness and playfulness of Slovene.

### Three pillars
1. **Folklore is the content:** characters, creatures, stories and visual motifs have traceable cultural sources.
2. **RPG is the experience:** exploration, party-building, progression, encounters and combat.
3. **Slovene is the core mechanic:** words are the player's primary means of interaction.

The game must not become a generic fantasy RPG decorated with folklore, nor an encyclopedia with superficial gameplay.

## Product and language

- Game interface, narrative and player-facing content are in Slovene.
- Technical documentation may be in English.
- The browser prototype is the rapid gameplay/UX test bed.
- Godot 4.7 is the intended full-game engine; consult `docs/platform-roadmap.md` for the current platform plan.
- The game is inspired by *Words for Evil*, but is an original work, not a translation or remake. The repository README documents the inspiration and credits.

## Core experience

The player walks a continuous 2D side-scrolling journey through Slovenia. The journey currently documented in the prototype is:

Ptuj → Peca → Triglav → Bled → Trnovski gozd → Piranske soline → Predjamski grad → Ljubljansko barje → Ljubljanica → Ljubljanski grad.

The final encounter is against Lintvern at Ljubljana Castle. This route and its encounter sequence are documented in `docs/progression-design.md`; treat additions or changes as subject to the latest Game Director decision.

### Combat and words

- Battles use a grid of Slovene letters.
- The player chains neighbouring letters into valid Slovene words.
- The letters used determine which party heroes act; word length and other word properties influence attack strength.
- Crosswords contribute to the *zagovor* mechanic and trigger themed effects.
- Other word challenges appear in journey events such as chests and obstacles.

Exact rules, values and implementation status belong in the relevant system documentation and current code. Do not infer that a prototype value is a final balance decision.

### Party and progression

The repository's current prototype documentation describes a party of up to four, one god per journey, recruitable heroes, individual health, wells, items, XP and hero levels. The latest design discussion introduces a skill-point progression model: all heroes begin with their first skill unlocked; skill points can raise it to Rank 3 or unlock the second and third skills, associated with longer-word attacks. Treat this newer skill model as the current design direction, but do not invent costs, thresholds or detailed effects that have not been specified.

The shrine/god challenge has also been discussed as a progression beat: a chosen god grants a skill for the current journey and then appears as a boss when leaving; defeating the god unlocks it for future runs. This is a user-provided design direction that needs to be reconciled with older prototype documentation before implementation.

## World and content

The current documented journey includes ten Slovenian regions/places and a roster of folkloric and mythological figures. The README and `docs/progression-design.md` contain the prototype roster, enemies, items and encounter details. These lists are not a licence to invent lore.

Every character, creature and location must have a verifiable folkloric, historical, literary or geographical basis. Party combinations across separate stories are deliberate gameplay fiction, not claims that those figures met in real life or folklore.

## Art and UX identity

The approved direction is **Hybrid**:
- Modernized SNES/GBA-inspired pixel art for gameplay, characters, creatures, environments, objects and effects.
- Traditional folk-art illustration for folklore stories, collectible artwork and selected narrative elements. Panjske končnice are an important reference.
- Restrained, functional UI using dark surfaces, gold accents and subtle ornament.

Readability, strong silhouettes, consistent pixel density, contrast and mobile usability take priority. Keep the word grid and controls unobstructed. Whitespace is intentional; decoration must have a purpose.

## Current status and caveats

The repository describes a playable browser prototype covering the journey and its mini-games. The full Godot game remains the intended destination. Prototype implementation does not automatically mean a feature is approved for the final game.

Known documentation conflict to preserve:
- Older README/progression documentation describes the road event as **Puščice v zidu** (darts).
- A later Game Director discussion says darts are being replaced by **spikes**. The exact spike design and implementation status were not present in the retrieved specification. Do not restore or re-specify darts; mark the replacement details OPEN until the authoritative design is added.

Balance has not been fully playtested according to the progression document. Treat balance values as provisional unless explicitly approved.

## Source documents

- `README.md` — current prototype overview and controls.
- `docs/concept-summary.md` — concept history and dated decisions.
- `docs/progression-design.md` — journey, party, health, rewards, roster and items.
- `docs/platform-roadmap.md` — intended engine/platform transition.
- `docs/playtest-notes.md` — usability findings and prototype changes.
- `docs/design/art-direction.md` — approved visual direction.
- `docs/design/folklore-references.md` — research discipline and source register.
- `docs/design/locations-and-geography.md` — geographic accuracy and location reference register.
- `docs/collaboration/WAYS_OF_WORKING.md` — collaboration and decision process.

When these documents disagree, follow the source-of-truth hierarchy in `WAYS_OF_WORKING.md` and surface unresolved conflicts.
