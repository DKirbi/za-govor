# Character Documentation

This directory is the central index for the playable character roster in **Za govor!**.

Each character has an individual folder containing their approved character specification, folklore research, gameplay design, and art-asset organisation.

## Character folders

| Character | Type | Region / recruitment | Documentation |
|---|---|---|---|
| Ajdovska deklica | Folklore hero | Triglav — exclusive encounter | [Character specification](./ajdovska-deklica/character.md) |
| Erazem Predjamski | Folklore / historical-legend hero | Predjamski grad — associated region; recruitment exclusivity open | [Character specification](./erazem-predjamski/character.md) |
| Kralj Matjaž | Folklore hero / legendary king | Peca — exclusive recruitment location | [Character specification](./kralj-matjaz/character.md) |
| Kresnik | Folklore hero / mythological figure | Bled — associated region; recruitment exclusivity open | [Character specification](./kresnik/character.md) |
| Kurent | Living carnival / folklore figure | Ptuj — starting character | [Character specification](./kurent/character.md) |
| Lepa Vida | Folk-ballad heroine | Piranske soline — designated location; also eligible for generic recruitment | [Character specification](./lepa-vida/character.md) |
| Martin Krpan | Literary / literary-folklore hero | Starting character | [Character specification](./martin-krpan/character.md) |

## Play-style roles on the hero picker

**PROPOSED** by Claude on 27 Nov 2026, at the Game Director's request ("categorize every character as Damage Dealer,
Support, Healer etc."); awaiting approval. One role per character, shown with an icon in the chosen hero's details on
*Kdo gre na pot?* (not on the cards in the hero lists, Game Director, 27 Nov 2026). The roles follow each specification's combat role where one exists, and otherwise what the kit
does in the game today. Data: `ROLES` and `PLAYSTYLE` in `src/game.js`.

| Role | Masculine / feminine | Meaning | Characters |
|---|---|---|---|
| napad | Napadalec / Napadalka | deals the damage | Martin Krpan (*heavy physical attacker*), Erazem Predjamski (*sword fighter*), Peter Klepec, Kresnik (*fire mage*), Perun, Veles, Stribog |
| obramba | Branilec / Branilka | protects the party, takes the blows | Ajdovska deklica (*defensive support*), Svarog |
| zdravje | Zdravilec / Zdravilka | heals | Zeleni Jurij, Mokoš |
| podpora | Podpornik / Podpornica | makes the party stronger | Kralj Matjaž (*party-support defender*), Dažbog |
| ovira | Oviralec / Oviralka | slows and weakens enemies | Kurent (*crowd control and disruption*), Lepa Vida (*support and disruption*) |

Borderline readings worth a decision: Kralj Matjaž (*podpora* or *obramba*), Erazem (*napad*, though his spec also
calls him resourceful support), Lepa Vida (*ovira* or *podpora*).

The picker's **Posebni učinek** lines (a few plain words with an icon, e.g. *nasprotnik krvavi*, *izmik in
protinapad*) describe what each kit does today; the individual specifications stay authoritative for the mechanics.

## Documentation rules

- Individual character folders are the source of truth for that character.
- This index is a concise roster overview and links to individual specifications; do not duplicate detailed skill or folklore descriptions here.
- Keep **CONFIRMED**, **IMPLEMENTED**, **PROPOSED**, **OPEN**, and **SUPERSEDED** status labels explicit.
- Distinguish documented folklore from the game's interpretation and original gameplay fiction.
- Do not treat placeholder asset instructions as completed art.
- When a character is approved, update this index with their role, recruitment location, and link.

## Standard character folder structure

```text
character-slug/
├── character.md
├── sprites/
│   └── README.md
├── folk-art/
│   ├── skills/
│   │   ├── skill-1/
│   │   ├── skill-2/
│   │   └── skill-3/
│   └── story-cards/
│       ├── README.md
│       └── special-unlock/
└── references/
    └── README.md
```
