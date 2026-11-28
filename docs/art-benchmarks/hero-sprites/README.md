# Hero sprite packs — roster benchmark

**Status:** SUPERSEDED (Game Director, 25 Nov 2026): heroes and enemies use simple pixel sprites, so no hero gets a
sprite pack. Krpan's pack left the game in 0.21.0, with `data/hero-art.json` and `tools/art_hero_pack.py`; both are in Git
history (0.20.0) if the Game Director reopens this. On 27 Nov 2026 the Game Director discarded Krpan's pack completely:
its files and asset review left the repository too (Git history: `main` at 99c2d99). Kept only as a record of the convention.

**Former status:** PROPOSED convention, derived from the Martin Krpan pack (PR #34). Krpan's running, victory and downed
poses are approved for Krpan only; nothing here approves another hero's art. The Game Director approves each pack.

Use this to brief and review the sprite pack of every remaining hero. The pipeline after the art is data only: no game
code changes per hero.

## 1. What a pack contains

| Sequence | Frames | Plays | Notes |
|---|---|---|---|
| `idle` | 4, loop | standing in battle, on the road and on the hero screens | small breathing or weight shift; the hero's weapon or attribute visible |
| one per skill rank | 4, once | the skill fired by a word (0.72 s) | as the character specification §5 describes it. If two ranks look the same, list one sequence for both in `data/hero-art.json` |
| `running` | 4, loop | while the party walks the road (0.5 s a loop) | right-facing: contact, compression, other contact, compression. Keep the bob: the compression frames sit lower |
| `victory` | 4, once, holds the last frame | when the last enemy falls (0.8 s), before *Zmaga!* | the last frame returns to the standing pose |
| `downed` | 1, held | while the hero is down (in battle, on the road, on the hero screen) | crouched or down pose (kneel, slump, sit). If crouched, the silhouette may be shorter than standing states; keep the feet on the baseline. The game greys it, so it must read by silhouette alone |

Plus: the idle | attack strip (two frames side by side) that cards and portraits use, a review contact sheet and an
animation preview. The tool writes all three.

## 2. Frame rules

Measured on Krpan; keep them for every human-sized hero.

- **Frame:** 48 × 48 px, RGBA, binary alpha (0 or 255), facing right. Heroes are 48 in `SPR_SIZE` (`src/game.js`).
- **Baseline:** the lowest opaque pixel of every frame sits on row 47.
- **Size:** a standing hero is about 35 px tall (Krpan: 34–35 px, hat to boots), about 30 px wide without the weapon.
  The head and hat are the same size in every state. A hero whose specification calls for a bigger figure
  (Ajdovska deklica is a giantess) needs that size decided first; it is not a free choice of the export.
- **Room for effects:** a projectile, swing or splash may run to the frame edge. Nothing may be cut off mid-figure.
- **Palette:** one palette per pack, at most 32 colours, dark outline. Record it in the manifest (`export.palette`).
  Krpan uses 27.
- **Style:** modernised SNES/GBA pixel art, as in `art/README.md` and the character specification. No smoothing,
  no semi-transparent pixels, no baked shadow on the ground.

## 3. Source atlases

- Any grid of equal cells. Record it per sequence: `sourceLayout {columns, rows, frameOrder}`.
- Transparent background with real alpha: no checkerboard, labels, guides or ground line in the cells.
- **Draw every atlas of a pack at the same figure scale.** Krpan's running and victory atlases match idle; his
  downed atlas was drawn about 1.63× larger and needs its own `sourceLayout.scale`. A mismatch is the most common
  reason a hero changes size between states.
- Keep the atlases in `art/source/characters/<pack>/atlases/`. They are the masters.

## 4. Export, pack and validate

```bash
python3 tools/art_hero_pack.py art/manifests/<pack>.json                     # export missing frames, sheet, strip, previews
python3 tools/art_hero_pack.py art/manifests/<pack>.json --only running,downed   # re-export these sequences
python3 tools/art_hero_pack.py --check                                       # validate every hero in data/hero-art.json
```

- `fit: "scale"` (use this for new packs): one scale for the whole sequence (`export.scale`, or the sequence's own
  `sourceLayout.scale`), the union of its frames centred, each frame dropped onto row 47. This keeps a run's bob and the
  hero's size.
- `fit: "cell"`: the whole cell resampled to 48 × 48. Krpan's first six sequences were made this way.
- Pick `export.scale` so the standing hero lands at about 35 px. Krpan: 0.0766 output px per source px.
- `--check` fails on a wrong frame size, non-binary alpha, a frame off the baseline, a colour outside the palette, a
  sequence that is not 4 frames (or 1 for `downed`), or a stale sheet or strip. A technical pass is not art approval.

Outputs: frames in `art/exports/characters/<pack>/animations/<sequence>/frame-NN.png`, the sheet
`<pack>-sheet.png/.json` (one row per sequence), the strip (`runtimeSheet.path`), the contact sheet (`preview`) and
`animationPreview` (HTML).

## 5. Manifest (`art/manifests/<pack>.json`)

Copy `art/manifests/martin-krpan.json` as it was at 99c2d99 (its sprite sections are gone since 27 Nov 2026). Required for the tool: `pack`, `status`, `export {frame, baselineRow,
alphaThreshold, palette, scale}`, `sequences[] {id, label, sourceAtlas, sourceLayout, framesBackToFront}`,
`runtimeSheet {path, frameOrder}`, `preview`, `animationPreview`. Also record the approval state, open decisions and
sources, as in Krpan's.

Name sequences by visible action and skill (`kmecka-moc-r2-salt-bag-throw`), not by frame numbers or approval state.

## 6. Connect it to the game

Add the hero to `data/hero-art.json`:

```json
"kurent": {
  "manifest": "art/manifests/kurent.json",
  "states": { "idle": "idle", "run": "running", "win": "victory", "down": "downed" },
  "skills": { "1": ["jezevka"], "2": ["zvonci"], "3": ["pregon-zime-r1", "pregon-zime-r2", "pregon-zime-r3"] }
}
```

The key is the game's hero id (`src/game.js` `CHARS`). Only `idle` is required; a missing state keeps what the game
did before (the old lunge, the rotated fallen sprite). A skill list shorter than three repeats its last entry. Then
`python3 build.py`. The hero appears under *Nastavitve → Razvoj → Kakovost slik = Visoka*; *Samodejno* and *Nizka*
keep the sprite already in the game. `tests/backgrounds.test.js` shows how Krpan's states are checked.

## 7. Review checklist

- [ ] Idle, skills, running and victory show the hero at the established standing scale (lay idle frame 1 over each). A crouched downed pose may be shorter, with its feet still on the baseline.
- [ ] The run keeps its bob; the feet touch row 47 in every frame.
- [ ] Each skill animation matches the specification (§5 of the hero's `character.md`); a rank-3 skill reads bigger
      than rank 1.
- [ ] Downed reads as down in grey, by silhouette alone.
- [ ] Readable at 1× in the battle scene on a phone, against the region background.
- [ ] `python3 tools/art_hero_pack.py --check` passes and `python3 build.py` builds.

## 8. Roster

Ids from `src/game.js`; home regions from `HERO_HOME` (`src/journey.js`). Skill status: see
`docs/progression-design.md` and each `docs/characters/<hero>/character.md`.

| Hero | Id | Home region | Specification | Sprite pack |
|---|---|---|---|---|
| Martin Krpan | `krpan` | Trnovski gozd · starter | reviewed | **in game (Visoka)**, PR #34 |
| Kurent | `kurent` | Ptuj · starter | reviewed | none |
| Zeleni Jurij | `jurij` | Ljubljansko barje · starter | none | none |
| Kralj Matjaž | `matjaz` | Peca | reviewed | none |
| Ajdovska deklica | `ajda` | Triglav | reviewed | none (size to decide: giantess) |
| Kresnik | `kresnik` | none (anywhere) | reviewed | none |
| Lepa Vida | `vida` | Piranske soline | reviewed, not yet in game | none |
| Erazem Predjamski | `erazem` | Predjamski grad | reviewed | none |
| Peter Klepec | `klepec` | Ljubljanica | none | none |
| Gods: Perun, Svarog, Mokoš, Veles, Dažbog, Stribog | `perun` … | shrines | none (gods review open) | none |

Suggested order: the two other starters (Kurent, Zeleni Jurij), then the heroes in road order. A hero without a
reviewed specification has no confirmed skill animations to draw yet.
