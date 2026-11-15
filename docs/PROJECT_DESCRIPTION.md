# Za govor! — Project Description

**Status:** Working project reference, assembled from repository documentation and the latest explicit Game Director decisions. This is a concise entry point, not a replacement for detailed system specifications.

## Identity

*Za govor!* is a Slovene word-puzzle RPG inspired by Slovene folklore and Slavic mythology. The player travels across Slovenia, builds a party of folkloric heroes, and faces creatures through word puzzles built around Slovene letters.

The title is a wordplay: *zagovor* means a spoken charm, while *za govor* means “for speech”. The game celebrates the richness and playfulness of Slovene.

### Three pillars

1. **Folklore is the content:** characters, creatures, stories and visual motifs have traceable cultural sources.
2. **RPG is the experience:** exploration, party-building, progression, encounters and combat.
3. **Slovene is the core mechanic:** words are the player's primary means of interaction.

The game must not become a generic fantasy RPG decorated with folklore, nor an encyclopedia with superficial gameplay.

## Audience and language

The intended audience includes:
- Fans of word puzzles and word games.
- Slovene players who want to engage with their language and cultural heritage.
- Players who want to learn Slovene and discover Slovene and wider Slavic folklore and mythology.

Slovene is the primary language and first language on the release roadmap. English translations and English-language word-game support are also planned to follow. The characters, world theme and folkloric identity remain the same across languages.

Technical documentation may be written in English.

## Product and platform direction

- **Android** is the primary mobile release target.
- **iOS** is planned as the subsequent mobile release.
- A **Steam** release is also intended, supporting Windows, macOS and Linux.
- Godot 4.7 is the intended full-game engine; consult `docs/platform-roadmap.md` for the detailed platform plan.

The Steam version should make use of the additional screen space available on desktop, including room for larger or more extensive letter puzzles. It may also provide a foundation for future game expansions. The exact desktop-specific puzzle layouts and expansion scope remain OPEN.

The game is inspired by *Words for Evil*, but is an original work, not a translation or remake. The repository README documents the inspiration and credits.

## Browser prototype

The browser prototype has two connected purposes:

1. **Rapid prototyping:** a place to develop and experiment with all game features quickly.
2. **Implementation review:** a place to inspect and review the current state of the game's implementation.

It should expose all currently unlocked levels and all currently unlocked characters, so the Game Director and collaborators can review the available content and systems without being restricted to normal player progression.

The browser prototype is also part of the preparation for the future Steam release, which is planned after the mobile app is ready. It is not merely a disposable early demo or a separate game concept.

The prototype is a review and development tool; its current implementation does not automatically define final game design or balance.

## Core experience

The game is built around word puzzles and the interaction between the player's heroes, the letters and the enemies. The player explores a journey through Slovenia, forms words from letter grids, uses those words to trigger hero actions and overcomes enemies whose abilities can alter the puzzle itself.

### Core gameplay loop

1. **Explore:** travel through the Slovenian world, encounter characters and creatures, and discover events and challenges.
2. **Solve word puzzles:** form valid Slovene words from available letters in combat and other minigames.
3. **Use the party:** the letters and words selected determine which heroes act and how their attacks or effects resolve.
4. **Adapt to enemies:** enemies can interfere with the puzzle by changing letters or applying word-based hazards, forcing the player to adapt their choices.
5. **Grow and discover:** progress through the journey, develop the party, unlock content and discover folklore through stories and collectible artwork.

In the minigames, the central objective is to find Slovene words. In combat, longer words and words that consume more bonus letters produce stronger attacks. The exact scoring, bonus-letter rules and balance belong in the relevant system specifications.

### Enemy interaction with word puzzles

Enemies are intended to have distinctive powers that affect how the player solves word puzzles. Examples discussed so far include:

- **Povodni mož:** can confuse the player by shifting letters in the puzzle.
- **Lintvern:** can burn or mark selected letters. Choosing words that use those letters may cause the affected letters to attack the player or otherwise penalize the choice.
- **Veles:** can disable, poison or curse certain words. If the player casts an affected word in a shorter form, it may hurt the player instead.

These are design examples and directions, not a complete or finalized enemy ability specification. Exact triggers, durations, effects, counterplay and implementation remain OPEN until defined in the relevant design documents and approved.

### Journey through Slovenia

The player travels through a 2D side-scrolling journey. The currently documented prototype route is:

Ptuj → Peca → Triglav → Bled → Trnovski gozd → Piranske soline → Predjamski grad → Ljubljansko barje → Ljubljanica → Ljubljanski grad.

The documented final encounter is against Lintvern at Ljubljana Castle. The route is a current reference, not a closed list: the Slovenian trail through cities and regions remains OPEN to additions, including places connected to additional Slovene or wider Slavic folkloric and mythological characters.

The existing route and encounter sequence are documented in `docs/progression-design.md`. Changes and additions require the latest Game Director direction and geographically credible research.

### Party and progression

The repository's prototype documentation describes a party of up to four, one god per journey, recruitable heroes, individual health, wells, items, XP and hero levels.

The latest skill progression direction is:
- All heroes begin with their first skill unlocked.
- Skill points can upgrade that skill to Rank 3 or unlock the second and third skills.
- Skill progression is associated with attacks using longer words.

The shrine/god challenge has also been discussed as a progression beat: a chosen god grants a skill for the current journey and then appears as a boss when leaving; defeating the god unlocks it for future runs. This direction needs to be reconciled with older prototype documentation before implementation.

The detailed hero skills, active and passive effects, progression costs and thresholds remain OPEN. Potential interactions between heroes and foes—including rivalries, clashes, friendships and special encounters—are also OPEN. For example, a player may encounter Veles while Perun is in the party. Such encounters may unlock unique folk-art cards and short stories.

## Folklore, stories and collectibles

An important purpose of the game is to introduce players to Slovene and wider Slavic folklore and mythology.

Folk-art illustrations will be used for collectible cards and selected narrative content. Collectible cards and short stories should be derived from real folkloric, historical, literary or cultural sources, with the source basis recorded and the distinction between documented tradition and original game fiction kept clear.

Many gods and other characters may have special relationships or stories with other characters. These can be reflected in unique encounters, cards and short stories where supported by research and approved as game content.

Achievements remain OPEN. Many achievements are expected to connect to the collectible system, but their exact structure and rewards have not yet been defined.

The current documented journey includes a roster of folkloric and mythological figures. The README and `docs/progression-design.md` contain prototype rosters, enemies, items and encounter details. These lists are not a licence to invent lore.

Every character, creature and location must have a verifiable folkloric, historical, literary or geographical basis. Party combinations across separate stories are deliberate gameplay fiction, not claims that those figures met in real life or folklore.

## Art and UX identity

The approved visual direction is **Hybrid**:
- Modernized SNES/GBA-inspired pixel art for gameplay, characters, creatures, environments, objects and effects.
- Traditional folk-art illustration for folklore stories, collectible artwork and selected narrative elements. Panjske končnice are an important reference.
- Restrained, functional UI using dark surfaces, gold accents and subtle ornament.

Readability, strong silhouettes, consistent pixel density, contrast and mobile usability take priority. Keep the word grid and controls unobstructed. Whitespace is intentional; decoration must have a purpose.

The overall art direction is established, but the actual pixel-art assets and their detailed designs are still OPEN and subject to the art-direction process. GPT supports research, visual direction and design specifications; the Game Director approves creative decisions.

## Open design areas

The following areas are intentionally not finalized:

- **Slovenian journey:** additions to the route through cities and regions, including locations connected to further folklore and mythology.
- **Enemy puzzle powers:** exact abilities, triggers, durations, effects and counterplay. Povodni mož, Lintvern and Veles examples above are design directions, not complete specifications.
- **Hero skills:** active and passive skills, effects, upgrades and progression details.
- **Character relationships:** possible clashes, rivalries, friendships and special hero/foe encounters, including their effects on gameplay.
- **Stories and collectible cards:** character-specific folk-art cards and short stories, grounded in research.
- **Achievements:** achievement structure, conditions and rewards, many of which may be tied to collectibles.
- **Pixel-art assets:** all detailed gameplay pixel art remains subject to further art direction and approval.
- **Steam-specific puzzles and expansions:** how desktop space will support larger or additional puzzles, and what future expansions may contain.

Do not turn OPEN areas into assumed requirements or silently fill in missing mechanics.

## Current status and caveats

The browser prototype is an active tool for rapid prototyping and reviewing the current implementation. It should expose all unlocked levels and characters. The full Godot game remains the intended product, with Android first, followed by iOS and a Steam release for desktop platforms.

Prototype implementation does not automatically mean a feature is approved for the final game. Balance values remain provisional unless explicitly approved and playtested.

Known documentation conflict to preserve:
- Older README/progression documentation describes the road event as **Puščice v zidu** (darts).
- A later Game Director discussion says darts are being replaced by **spikes**. The exact spike design and implementation status are not fully specified. Do not restore or re-specify darts; keep the replacement details OPEN until the authoritative design is added.

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
