# Kralj Matjaž

> **Status:** Folklore research started; character kit review OPEN.  
> **Character type:** Folklore hero / legendary king  
> **Associated region:** Peca (Region 2)  
> **Current prototype reference:** `src/game.js`, `docs/progression-design.md`, `data/world.json`

## 1. Character identity

Kralj Matjaž is a legendary sleeping king whose return is expected in a time of great need. In the best-known Koroška tradition, he sleeps with his warriors inside Mount Peca, waiting until his beard has wound around the stone table nine times. His return promises the restoration of justice and better times.

**Existing gameplay identity (IMPLEMENTED prototype):** A party defender who combines sword damage with shields for the whole party. His third move is called *Prebujenje* and is associated with the linden tree coming into leaf.

This is a description of the current prototype, not an approved final character design.

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

## 3. Current prototype skills (IMPLEMENTED, NOT YET APPROVED)

The existing prototype lists the following three moves:

| Order | Current name | Current prototype value / effect |
|---|---|---|
| 1 | Meč | `−6 · ščit +3` |
| 2 | Kraljeva vojska | `−12 · ščit +8` |
| 3 | Prebujenje | `−26 · ščit +16`; additional text: `lipa ozeleni` |

The current character summary describes him as a party defender. The move names, damage, shield values, target rules, and awakening effect are all **OPEN for review**. Do not assume these are final or add unapproved mechanics.

## 4. Recruitment and progression

- **Associated region:** Peca (Region 2), whose background and intro already reference Kralj Matjaž and his cave.
- Hero stops currently use a random pool of un-met folk heroes; the regional hero is not guaranteed to appear at their associated location.
- Whether Kralj Matjaž should be exclusive to Peca, guaranteed at Peca, or remain in the general hero pool is **OPEN**.
- Current prototype base HP: **34**. This is an implementation value, not final balance approval.
- Existing progression follows the standard hero level system unless changed during review.

## 5. Art and narrative presentation

Artwork production is intentionally deferred until the full character roster has been reviewed.

Existing prototype art direction note (not a final approval): crown, long grey beard, red cloak with ermine, and sword. The larger story-card concept shows him awakening beneath Peca, beard wound around the stone table, ravens overhead, and a linden tree coming into leaf.

Keep the cave setting credible to Peca and the local Koroška landscape. Do not treat a modern tourist installation or bronze statue as a historical depiction of the legendary king.

## 6. Asset inventory

| Asset | Required | Status |
|---|---:|---|
| Gameplay character sprite | Yes | Existing prototype asset to locate/review |
| Three skill illustrations | To be defined after skill review | Artwork deferred |
| Story cards | To be defined after narrative review | Artwork deferred |
| Folklore / regional references | Yes | Initial research recorded; further review needed |

## 7. Open decisions

- Final combat role and identity: retain party defender / shield specialist or revise?
- Review the three existing skills: *Meč*, *Kraljeva vojska*, *Prebujenje*.
- Whether *Prebujenje* should be a skill activation, a state change, or simply the name of the strongest attack.
- Whether the linden tree motif belongs in the skill kit, story cards, or both.
- Exact rank effects, damage, shield values, target rules, and durations.
- Recruitment placement: guaranteed at Peca, exclusive to Peca, or random hero-stop pool.
- Final Slovene skill naming and domain words.
- Story-card subjects and unlock conditions.

## 8. Implementation notes

- Existing prototype data is in `src/game.js`; regional placement is in `data/world.json`.
- `docs/progression-design.md` lists the current moves and values.
- Do not alter implementation until the Game Director approves the reviewed kit.
- Keep documented Peca folklore distinct from game-only combat effects.

## 9. Sources

See [references/README.md](references/README.md) for the research bibliography and source notes.
