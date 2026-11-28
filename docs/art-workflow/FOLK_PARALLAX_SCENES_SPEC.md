# Folk parallax backgrounds: three scenes to recompose for Codex

**Status:** READY FOR CODEX. The Game Director answered the open questions on 28 Nov 2026 (see the end). Requested by the Game
Director on 27 Nov 2026 (20:12–20:31) while playing PR #46 on a phone.
**Art:** Codex. **Runtime, exports and checks:** Claude. Written by Claude (Lead Developer).

[`FOLK_PARALLAX_CORRECTIONS_SPEC.md`](FOLK_PARALLAX_CORRECTIONS_SPEC.md) is about repairing layers (bases, seams,
stretched strips). This spec is different: in three regions the **scene itself** is wrong for the place, and some new
pictures are needed. Codex's style, palettes and painting technique stay as they are.

The game already shows a stand-in for each scene, built by `tools/art_folk_parallax.py` from Codex's existing masters
(borrowed, cropped or tinted). The stand-ins are on branch `review/folk-backgrounds` (PR #46) and are described below
so you can see what the Game Director has already reviewed. Your masters replace them, and Claude removes the
workarounds.

## What the game does with the layers (same as the corrections spec)

- One view of **996 × 560** px (16:9). A phone shows it at about 392 × 238 CSS px. Heroes' feet are at 75–87 % of the
  scene height, enemies' at 62–70 %.
- Every layer scrolls at its own **speed** while the party walks: the lane 1.0, the sky about 0.02. Layers slide past
  each other, so an overlap must hold at *every* offset. Things that stand on one another must share a speed.
- Layers **tile** sideways. A picture that ends cleanly at both sides tiles as it is (wall to wall, tree to tree). A
  landmark with empty space around it repeats only every `period` view widths. Only if neither is possible does the
  tool mirror a picture, which causes the problems below (twin castles, an endless bridge).
- **New (Claude, for §1):** a landmark shown **once**, at a chosen stop of the region (the last one), instead of
  repeating. Until Claude builds it, such a landmark repeats every few view widths.

## 1. Ljubljanica: one river bank, and the Tromostovje once, at the end

**The Game Director:** the bridge "keeps going and going, this is a false presentation of it". It should appear once,
connect with the other side, and then other houses follow. The castle should move the slowest. The Tromostovje should
be the last place before Povodni mož appears. "We should better mimic one of the river banks." Also: "a moment where
we encounter twin castles, which is wrong".

**Why it happened (measured):** `bridge.png` and `town-castle.png` reach both sides of their canvas, so the tool joined
each to its mirror image. The bridge became an endless arcade and the castle stood next to its own mirror image. The
castle, the hill and the houses are one picture, so the castle moved as fast as the houses (0.22). The bridge was
shown 1.86 × too wide.

**Stand-in in the game now:** the town strip tiles wall to wall without a mirror (one castle and one Franciscan church
per 1077 px); a stone quay from `riverfront-clean-plate.png` runs under the houses; the bridge, at its painted
proportions, stands alone on the quay every 3 view widths, with the river in front of its piers.

**The scene to paint.** The party walks along **one embankment of the Ljubljanica**: the **left bank** (CONFIRMED, Game
Director 28 Nov 2026), Cankarjevo nabrežje towards Prešernov trg. Across the river is the old town's riverfront under Grajski grič. At the
end of the region the **Tromostovje** spans the river, and Povodni mož rises from the water there.

| # | New master (`ljubljanica-parallax/layers/`) | What | Speed | Tiles |
|---|---|---|---|---|
| 1 | keep `distant-sky-hills.png`, `clouds.png` | sky, far hills, clouds | 0.02–0.1 | as now |
| 2 | `castle-hill.png` | **Ljubljanski grad on its wooded hilltop, alone:** the Outlook Tower, the walls and roofs, trees around them. The hill ends below in trees that the house strips always cover: paint them down to the houses' eaves (row 260 of the 560-row scene), so no sky shows under the hill when it slides behind the roofs. | **0.08, the slowest landmark** | clear of both sides; once every 3 or more view widths |
| 3 | `riverfront-houses-a.png`, `riverfront-houses-b.png` | **the far bank:** two different rows of 3–4-storey houses with pastel façades, roofs with dormers and chimneys, and a tree or two in front. The two strips should be different streets, so the bank changes along the walk. Both strips start and end with a whole house wall. **No castle and no hill in them.** | 0.22 | wall to wall, no mirror |
| 4 | `far-quay.png` | the far bank's stone quay (as in the clean plate) with Plečnik's steps down to the water, an iron ring or two, ivy, weeping willows at the edge | 0.22 (the houses stand on it) | seamless |
| 5 | keep `river-surface.png`, `water-reflections.png` (repaint at the in-game shape, corrections spec §4) | the river | 0.5 | seamless |
| 6 | `tromostovje.png` | **the Tromostovje, seen side-on in the background only (CONFIRMED 28 Nov: the party does not cross it), as in the approved reference:** the central stone bridge (1842) with Plečnik's two footbridges (1929–32), white balustrades with ball-topped posts, lamps, and the stairs down to the lower terrace. Three balustrades one behind the other show that there are three bridges. **Both ends land on the quays**: the bridge begins at one bank and ends at the other, nothing beyond it. | 0.22 (it stands on the quays) | once, at the last stop |
| 7 | `near-quay-lane.png` | **our bank, the lane:** the embankment promenade (stone paving) with a low balustrade along its far (top) edge, between the party and the river. Keep the balustrade within the lane picture's top 30 view px: the lane rises to 40 px above the heroes' feet in battle, so it stays behind their legs. | 1.0 | seamless |
| 8 | keep a few near tufts if you like | front edge | 1.2 | seamless |

- **Proportions:** paint every strip at its in-game shape. The bridge is about 800 × 140 view px: for example a canvas
  of **2172 × 380** with the bridge across it and some transparent margin.
- **The castle moves slowest** because it is the farthest landmark. It must never appear twice on one screen.
- **The houses after the bridge:** the stretch just before the bridge uses strip B, so the old town under the castle
  (strip A) and the houses by the bridge differ. The region after this one, *Ljubljanski grad*, continues on the far
  side (§2).
- **The battle with Povodni mož** is a still scene at the last stop: the Tromostovje in the middle of the view, the
  river in front of it, the party on our quay.

## 2. Ljubljanski grad: inside the walls, in the courtyard

**The Game Director:** the region "should actually have a castle graphic, it still has a view of the castle graphic".
On 28 Nov 2026 he decided that the region is **inside the walls, in the courtyard** (CONFIRMED), and that he will have
Codex generate the new images. The journey ends on Grajski grič, where Lintvern nests. The current pack shows the castle
far away on its hill above the city: that is the view from the river (§1), not being there.

**Stand-in in the game now:** the current pack, unchanged. No stand-in is possible without new art.

**The scene to paint.** The party has come through the gate and crosses **the castle's courtyard**. The castle's
inner walls, wings and towers stand around it, close and tall. The sky shows above the roofs; Ljubljana is not in view.
The last stop, where Lintvern waits, is under the Outlook Tower. In Ljubljana's coat of arms, the dragon stands on the
castle's tower.

| # | New master (`ljubljanski-grad-parallax/layers/`) | What | Speed | Tiles |
|---|---|---|---|---|
| 1 | keep `sky.png`, `clouds.png` (the sunset) | sky | 0.02 | as now |
| 2 | `castle-roofs-far.png` | the far side of the courtyard: roofs, chimneys and tower tops of the castle's farther wings against the sky, low in the picture | 0.15 | seamless |
| 3 | `courtyard-wings.png` | **the courtyard's walls and wings, close:** stone and plastered walls with windows, doors, arcades, the wall-walk with battlements on the outer side. Their tops lie at 10–25 % of the scene height, so the party walks among buildings. | 0.4 | seamless, wall to wall (no mirror) |
| 4 | `courtyard-landmarks.png` (or one file each) | in the wings, each once in a while: **St George's chapel** (Gothic, consecrated 1489) with its door onto the courtyard; **the Pentagonal Tower** (the old main entrance, once over a drawbridge) | 0.4 (they are the wings) | clear of both sides; every 2–3 view widths |
| 5 | `outlook-tower.png` | **the Outlook Tower** (1848) with its flag, for the last stop and the battle with Lintvern. Leave room on and above its top for the dragon. | 0.4 | once, at the last stop |
| 6 | `courtyard-paving-lane.png` | the lane: the courtyard's paving (stone setts), a drain or two, grass between the stones at the edges | 1.0 | seamless |
| 7 | optional `courtyard-front.png` | near edges: a stone bench, a cart wheel, a cannon on its carriage, a lamp, low and only at the bottom corners | 1.0–1.2 | padded |

- Keep the warm sunset of the current pack: the stone in evening light should read clearly against the sky.
- The wings are close and tall, but the middle of the view stays open for the battle. Heroes stand at 75–87 % of the
  height and enemies at 62–70 %, and Lintvern is larger.

## 3. Predjamski grad: the cliff is part of a mountain

**The Game Director:** Predjama "should have some mountains in the background"; the castle is only one part of the
mountain, "the rest of the mountain continues further on, so everything is a hill". The cliff stood alone on a flat
meadow.

**Stand-in in the game now** (Game Director reviewed it on 27 Nov): behind the cliff, Peca's mountain slope
(`peca-parallax/layers/peca-mountain.png`, columns 60–1575), mirrored at its summit and warmed to the evening light,
moves with the cliff (0.38) and repeats with it (2 view widths). Its summit always lies behind the cliff, its forested
slopes run off both ways to a valley, and it reaches the lane in every column. Behind it: Predjama's karst ridge
raised a little (0.12) and Triglav's foothills in an evening haze as far mountains (0.06).

**The scene to paint:**

| # | New master (`predjama-parallax/layers/`) | What | Speed | Tiles |
|---|---|---|---|---|
| 1 | `karst-mountain.png` | **the mountain the cliff belongs to:** Notranjska karst, mixed beech and fir forest, pale limestone outcrops and scree, a wooded plateau above the cliff. Highest behind the cliff (above the scene's top edge there), falling both ways to a valley at about 50–55 % of the scene height half-way between two cliffs, and down to the lane (below 73 % of the height) in every column. | 0.38 (with the cliff) | seamless, **exactly 2 view widths per tile** (the cliff's period), the cliff's place marked in your notes |
| 2 | `castle-cliff.png` (touch-up) | where the cliff's sides meet the mountain, let rock and moss run into the forest instead of a closed black outline | 0.38 | as now |
| 3 | `distant-mountains.png` | Notranjska's mountains in the evening haze: the flat-topped Nanos and the wooded ridges of Javorniki, **no snow, no Alpine peaks** | 0.06 | seamless |
| 4 | keep `distant-karst-forest.png` | the karst ridge between them | 0.12 | as now |

- Paint layer 1 at the in-game shape: 1992 × about 380 view px, for example **4344 × 830**.
- The castle in its cave stays exactly as it is. Only the land around it changes.

## Delivery

- A branch from `review/folk-backgrounds` (or from `main` once PR #46 is merged), e.g. `codex/parallax-scenes`.
- Commit only masters (`docs/art-benchmarks/<study>-parallax/layers/*.png`) and each study's `README.md` (what each new
  layer is, its intended speed and where it tiles). New files use the names above.
- Do not edit `art/exports/`, `art/manifests/`, `data/backgrounds.json`, `src/` or `dist/`. Claude exports, tunes and
  tests.
- Order: §1 Ljubljanica, then §2 Ljubljanski grad, then §3 Predjamski grad. Each region can land on its own.

## Acceptance (Claude checks each delivery)

1. Ljubljanica: one castle per screen at most, moving slower than the houses; the bridge's ends on both quays; with
   Claude's "once" landmark, the Tromostovje shows only at the last stop. `tests/parallax.test.js` checks one castle
   per stretch and a bridge standing alone.
2. Ljubljanski grad: the wings tile wall to wall without a mirror; the party's heads stay below the wings' tops; the
   Outlook Tower frames Lintvern at the last stop.
3. Predjamski grad: exported without the stand-in, the mountain's summit is behind the cliff at every scroll position,
   and there is mountain or cliff in every column (the `predjama` check in `tests/parallax.test.js`).
4. Everywhere: shown at 1.00 × (± 2 %), `npm test` passes, and the Game Director reviews the region on a phone
   (`?ozadje=B`, or *Kakovost slik → Visoka*).

## The Game Director's answers (28 Nov 2026, CONFIRMED)

1. **Ljubljanica's bank:** the left bank (Cankarjevo nabrežje, looking across at the old town and the castle, as in
   the approved reference).
2. **The Tromostovje:** seen from the background only, side-on, with its ends on both quays. The party does not cross
   it.
3. **Ljubljanski grad:** inside the walls, in the courtyard (§2). The Game Director will have Codex generate the new
   images.

Sources for the landmarks: [Triple Bridge (Wikipedia)](https://en.wikipedia.org/wiki/Triple_Bridge);
[Ljubljana Castle (Visit Ljubljana)](https://www.visitljubljana.com/en/ljubljana-castle/).
