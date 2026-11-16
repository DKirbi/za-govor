# Character Documentation

This directory is the central index for the playable character roster in **Za govor!**.

Each reviewed character has an individual folder containing their character specification, folklore research, gameplay design, and art-asset organisation. This index currently lists completed character-review documents; characters that only have prototype roster entries are not presented as reviewed specifications.

## Character folders

| Character | Type | Region / recruitment | Documentation |
|---|---|---|---|
| Ajdovska deklica | Folklore hero | Triglav — exclusive encounter | [Character specification](./ajdovska-deklica/character.md) |
| Erazem Predjamski | Folklore / historical-legend hero | Predjamski grad — associated region; recruitment exclusivity open | [Character specification](./erazem-predjamski/character.md) |
| Kralj Matjaž | Folklore hero / legendary king | Peca — exclusive recruitment location | [Character specification](./kralj-matjaz/character.md) |
| Kresnik | Folklore hero / mythological figure | Bled — associated region; recruitment exclusivity open | [Character specification](./kresnik/character.md) |
| Kurent | Living carnival / folklore figure | Ptuj — starting character | [Character specification](./kurent/character.md) |

## Review status

**Detailed character specifications available:** Ajdovska deklica, Erazem Predjamski, Kralj Matjaž, Kresnik and Kurent.

**Review pending:** Lepa Vida and Peter Klepec currently have prototype roster entries and visual concepts, but no completed reviewed character specification. Their existing prototype material should be preserved and inspected when their reviews begin.

## Shared combat rules

System-wide action/status definitions, interruption behaviour and visual communication principles live in [Combat System Rules](../combat-system.md). Character specifications should reference that document and record only character-specific rules or exceptions.

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
