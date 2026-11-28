# Codex art backlog: everything still missing (28 Nov 2026)

**Status:** READY FOR CODEX. Requested by the Game Director on 28 Nov 2026 ("another Codex spec for all missing
details"). This is the index of all art the game still lacks. Each item points to its detailed spec or gives the
details here. Written by Claude (Lead Developer) from the repository at `review/folk-backgrounds` (PR #46).

**Art:** Codex. **Export, wiring and tests:** Claude. Codex commits masters, study READMEs and manifests' source notes
only, never `art/exports/`, `data/backgrounds.json`, `src/` or `dist/` (as in the parallax specs).

## Priority order

| # | What | Count | Detailed spec | Status in the game now |
|---|---|---|---|---|
| 1 | Three recomposed backgrounds: Ljubljanica (left bank, Tromostovje in the background), **Ljubljanski grad (inside the walls, in the courtyard)**, Predjama's karst mountain | 3 scenes | [`FOLK_PARALLAX_SCENES_SPEC.md`](FOLK_PARALLAX_SCENES_SPEC.md) (all questions answered 28 Nov) | stand-ins for Ljubljanica and Predjama; Ljubljanski grad still shows a far view of the castle |
| 2 | Corrections to the other seven folk backgrounds: bases under floating slices, passing trees, seamless edge trees, strips at their in-game shape | 7 packs | [`FOLK_PARALLAX_CORRECTIONS_SPEC.md`](FOLK_PARALLAX_CORRECTIONS_SPEC.md) | the export tool paints stand-ins |
| 3 | Painted skill cards for Zeleni Jurij, Peter Klepec and the six gods | 24 cards | §A below (style: [`FOLK_SKILL_CARDS_SPEC.md`](FOLK_SKILL_CARDS_SPEC.md)) | an empty board with ??? |
| 4 | Pixel sprites for five enemies that borrow another enemy's sprite in another colour | 5 sprites | §B below | Vešča is a recoloured Mora, Perkmandeljc a Škrat, Pesjan a Volkodlak, Zmajček and Zmajev mladič the Lintvern |
| 5 | Final-battle story cards, one per hero and god | 15 cards | [`../achievement-art-spec.md`](../achievement-art-spec.md), "Final-battle story cards" | a letter in a circle |
| 6 | Achievement icons, including the new *Mojster veščine* | 60 icons | [`../achievement-art-spec.md`](../achievement-art-spec.md) | a letter in a circle |

Items 1 and 2 change what the player sees all journey long. Items 3–6 fill collections that already show ??? or a
letter.

## A. Skill cards still missing (24)

Same format, size and painted-card style as the 21 existing cards (`art/manifests/folk-skill-cards.json`): one scene,
1536 × 1024 master, the hero doing the skill. A card shows the skill, not the number. Names and effects are from the
game's data (`src/game.js`, `ROSTER`). Zeleni Jurij, Peter Klepec and the gods have **no reviewed character
specification** in `docs/characters/` yet. Keep the folklore restrained, and note in the study README which details are
the game's own fiction.

| Hero | Stopnja 1 | Stopnja 2 | Stopnja 3 | What the hero does in the game |
|---|---|---|---|---|
| **Zeleni Jurij** (spring-bringer, green leaves, birch) | *Popek* (LIST): a little health | *Brstenje* (BREZA): more health | *Jurjevo* (POMLAD): much health | heals a little and often |
| **Peter Klepec** (shepherd boy from Osilnica, strength from the vile) | *Pastirska palica* (PAŠA): a staff blow | *Izruvano drevo* (DREVO): a tree pulled up and swung | *Vilin dar* (OSILNICA): the vile's gift, a heavy blow and strength | strength that grows |
| **Perun** (thunder) | *Blisk* (GROM) | *Grom* (STRELA) | *Nevihta* (NEVIHTA): lightning chains to every enemy | strikes |
| **Svarog** (heavenly smith) | *Kladivo* (PEČ): hammer and a small shield | *Kovani ščit* (JEKLO) | *Nebeška kovačnica* (NAKOVALO): a big shield | strikes and shields |
| **Mokoš** (mother earth, spindle) | *Kapljica* (VODA) | *Vir* (ZEMLJA) | *Materina roka* (VRETENO): cleans the letters | heals |
| **Veles** (cattle and the underworld, horns) | *Kačji pik* (ROG): poison | *Medvedja šapa* (MEDVED) | *Korenine sveta* (KORENINE) | poisons and strikes |
| **Dažbog** (the giving sun) | *Žarek* (DAN) | *Jutranja zarja* (ZARJA): strength | *Sončni voz* (SONCE): the sun's chariot | light and strength |
| **Stribog** (grandfather of the winds) | *Sapica* (PIH) | *Burja* (VETER) | *Vihar* (BURJA): mixes the letter mesh | wind on every enemy |

- The gods are not shown on the shrines (only their signs: lightning, anvil, spindle, sun, wind, horns), but they are
  heroes in the party and challengers in battle, so their cards may show them.
- Deliver as `art/source/characters/<id>/folk-art/skills/<skill-slug>/skill-card-concept.png` plus a manifest entry like
  the existing ones. Claude exports them into `art/exports/characters/skill-cards.json`.

## B. Enemy pixel sprites still missing (5)

Every hero and enemy is a simple pixel sprite (Game Director, 25 Nov 2026). Five enemies borrow another's sprite with a
colour filter. Each needs its own, in the existing format: **two frames side by side** (idle and step), **48 × 48 per
frame** (`size` in the game is the drawn height), transparent background, facing **left** (enemies stand on the right),
the same pixel density and outline as `skrat`, `mora`, `volkodlak` and `lintvern`.

| Enemy | Met in | Now | Paint |
|---|---|---|---|
| **Vešča** (she; attacks *Urok*, *Zli pogled*: puts a hero to sleep) | Ptuj, Triglav, Bled, Trnovski gozd | Mora, green | a witch; her evil eye |
| **Perkmandeljc** (attacks *Kramp*, *Zasutje*: buries letters) | Peca, Triglav, Predjamski grad | Škrat, grey-blue | the little mine spirit (*perkmandeljc*): a miner's pick, a lamp |
| **Pesjan** (attacks *Ugriz*, *Lov*) | Peca, Triglav, Piranske soline | Volkodlak, sepia | a dog-headed man (*pesoglavec*) |
| **Zmajček** (working name; *Ugriz*, *Iskre*) | Ljubljanski grad, in the Lintvern's queue | the Lintvern, small and red | a young wyvern of the Lintvern's brood |
| **Zmajev mladič** (*Ugriz*, *Jamski prah*: buries letters) | Predjamski grad | the Lintvern, pale | the "dragon's young" of the karst caves: **the olm** (*človeška ribica*), pale, long, with small legs and hardly any eyes, the way people once took it for a dragon's young |

- The descriptions above follow the game's data and documents (`docs/progression-design.md`). Where the folklore is
  thin (Zmajček, Pesjan's look), keep the design simple and say in the README that it is the game's interpretation.
- Deliver PNG masters under `art/source/enemies/<id>/` with a short README (what it is, what is folklore and what is
  the game's fiction). Claude wires them into `SPRITES` and removes the borrowed art and colour filters.

## C. What is ready already (do not redo)

- The ten folk backgrounds exist as studies. Only the scenes spec (§1 above) recomposes three of them.
- 21 painted skill cards: Ajdovska deklica, Erazem Predjamski, Kresnik, Martin Krpan, Kurent, Kralj Matjaž and Lepa
  Vida, three each.
- Hero and enemy pixel sprites, except §B.
- Item, relic, potion and remedy icons are pixel art drawn by `tools/art_extra.py`. They are not in this backlog.
- The boss's crown, the shrines' signs and the UI icons are drawn by the game itself.

## Delivery and review

- One branch per item, e.g. `codex/skill-cards-gods`, `codex/enemy-sprites`, `codex/parallax-scenes`. Start from
  `review/folk-backgrounds` (or `main` once PR #46 is merged).
- Each delivery ends with a short README note per study (files, sizes, what each picture is). Claude exports and tests
  it, and the Game Director reviews it on a phone before it is approved.
