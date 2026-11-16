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
