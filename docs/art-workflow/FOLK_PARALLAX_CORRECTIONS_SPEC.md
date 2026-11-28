# Folk parallax backgrounds: corrections for Codex

**Status:** requested by the Game Director, 27 Nov 2026, after reviewing the folk backgrounds (variant B) on a phone.
**Art:** Codex. **Runtime, exports and checks:** Claude. Written by Claude (Lead Developer) from measurements of the
current masters; every number below comes from `tools/art_folk_parallax.py` and `tests/parallax.test.js`.

The game already works around each problem below (generated fills, borrowed trees, mirrored tiles). Those stand-ins
are acceptable for review, not for release. Codex's corrected masters replace them, and Claude then removes the
workarounds. Codex's style, palettes and compositions stay as they are. This is repair work, not a redesign.

**See also** [`FOLK_PARALLAX_SCENES_SPEC.md`](FOLK_PARALLAX_SCENES_SPEC.md) (27 Nov 2026, evening): Ljubljanica,
Ljubljanski grad and Predjamski grad are recomposed there. Where the two overlap (Ljubljanica's bridge, river and
glints in §4), the scenes spec decides.
Everything Codex still has to paint is listed in [`CODEX_ART_BACKLOG.md`](CODEX_ART_BACKLOG.md).

## How the game uses the layers (what the corrections must fit)

- **Scene.** Each region's layers are resized into one view of **996 × 560** px (16:9), as Codex's composites place
  them. A phone shows that view at about 392 × 238 CSS px; heroes stand with their feet at 75–87 % of the scene
  height and enemies at 62–70 %.
- **Speeds.** Every layer scrolls at its own speed while the party walks. The walking lane moves at 1.0, and layers
  behind it are slower (the sky about 0.02, forests about 0.3, lakes about 0.36). **Neighbouring layers therefore
  slide past each other**, and any overlap between two layers must hold at *every* horizontal offset, not only in
  the composite.
- **Tiling.** Layers repeat sideways. A layer cut by its left or right edge is joined to its own mirror image to
  tile. A layer whose content stands clear of both sides is padded with empty space (`period`) and repeats at
  intervals.
- **Masters stay where they are:** `docs/art-benchmarks/<study>-parallax/layers/*.png`. Claude regenerates the WebP
  exports from them.

## 1. Bases: slices that float above the lane (7 layers)

**Problem.** Where a slice's lowest paint ends above the top edge of the walking lane, the sky and the far hills
show through underneath, and the slice seems to float. Measured over a walk, 14–96 % of the columns of seven
packs had such a gap, up to 28 view px.

**Stand-in today.** The export tool paints a base under each of these slices from the slice's own paint: its
densest band mirrored down and shaded, with holes cloned from beside them (`floor` in
`tools/art_folk_parallax.py`). It is close, but it is generated.

**Correction.** Extend each slice's own paint **down to at least the master row given below, in every column**
where the slice stands on the ground. Going further, down to the canvas bottom, is welcome: the lane covers it.
- The lowest edge may stay irregular, since the lane's grass covers it, but no column may stop short of the row.
- Paint what belongs at the foot of that slice (see *Motif*). Do not add new tall shapes; the visible change is a
  few pixels of base above the lane's edge.
- Keep everything else exactly where it is: same canvas size, same position of every existing stroke.

| Region | Master (`layers/`) | Canvas | Paint down to at least row | Now | Worst spots (x in master px: how many rows short) | Motif |
|---|---|---|---|---|---|---|
| Peca | `midground-forest.png` | 2172×724 | **628** (86.7 %) | lowest paint 591; every column short | 11–346: 65 · 1307–2166: 63 · 855–1048: 49 · 1162–1267: 46 | undergrowth, shrubs and shade at the foot of the mixed autumn forest |
| Triglav | `midground-forest.png` | 2172×724 | **596** (82.3 %) | 80 % of columns short | 2067–2155: 86 · 13–40: 55 | dark spruce and larch forest floor. The gap at 2067–2155 becomes an arch on the tile's mirror seam |
| Bled | `lake-water.png` | 1672×941 | **758** (80.6 %) | lowest paint 720; every column short by up to 38 | the whole width | lake water continuing to the shore. No new reflections of the island or castle down there |
| Trnovski gozd | `doline-forest.png` | 1672×941 | **659** (70.0 %) | 34 % of columns short | 1580–1671: 85 · 0–78: 77 · 97–141: 48 | moonlit beech and fir undergrowth |
| Trnovski gozd | `framing-trees.png` | 1672×941 | trunk bases to **659** (70.0 %) | trunks end at 656 | every trunk | root flare into the grass (only the trunks; crowns unchanged) |
| Piranske soline | `salt-pan-water.png` | 1672×941 | **649** (69.0 %) | lowest paint 629 | 163–259: 95 · 1302–1324: 56 | the pans' water and the foot of the nearest embankment. The game cuts this picture in two at view row 254 (sea above, pans below); only the pans' lower edge matters |
| Ljubljansko barje | `wetland-channels-reeds.png` | 1672×941 | **613** (65.1 %) | lowest paint 603 | 1624–1670: 142 · 1–40: 55 (the tapered ends) | channel bank with reeds and sedge. The game overlaps the ends of two copies by 131 view px |
| Ljubljanski grad | `near-foreground-tree-frame.png` | 1672×941 | trunk bases to **639** (67.9 %) | trunks end at 615 | both oaks | oak roots into the grass |

**Rule for every future layer:** a layer that stands on the ground, or on the layer in front of it, carries its paint
**at least 24 master px below the lowest point of the top edge of the layer in front**, across its whole width. It
has to be the *lowest* point because the layers slide: whatever part of the front layer's edge comes along, it must
still cover the slice's foot.

## 2. Passing trees (new art: 3 regions, 1 optional)

**What they are.** Near trees the party walks past (Game Director, 27 Nov 2026). They stand in front of the party,
very close to the eye, and scroll faster than the lane (1.35). They cover the heroes for a moment, about 1.5 s,
then leave a long stretch of open road (they repeat every 2.5 screen widths). The game blurs them (out of focus) and
shows them only on the road. They fade back while the party stands at a stop and never appear in battle.

**Stand-in today.** Triglav's `foreground-spruces.png` clumps for all four regions, mirrored and colour-graded
(moonlit blue for Trnovski gozd, sunset warmth for Ljubljanski grad). It works, but the trees are not the regions'
own. Trnovski gozd's and Grad's own edge trees cannot be used: they are cut by the picture's sides, so as passing
trees they would be mirrored into a doubled tree that never leaves the screen.

**Deliverable, one per region:** `docs/art-benchmarks/<study>-parallax/layers/passing-trees.png`.
- **Canvas 1672 × 941** (one scene view, like the other study layers), RGBA, sRGB, transparent background.
- **Two clumps** of 1–3 trees, one in the left half and one in the right half. Each clump is 250–500 px wide.
- **Not touching the left or right edge:** at least 48 px clear on both sides. Clear sides let the game pad the tile
  instead of mirroring it.
- **Trunks run off the bottom edge**, painted down to row 940. No ground, grass, shadow or roots under them: they
  stand below the frame, close to the eye.
- **Crowns:** the tallest top between rows 60 and 300. Crowns may run off the top edge.
- **Scale:** close to the eye. At this canvas size a hero is about 140 px wide and 230 px tall, so a tree should be
  several heroes tall. Broadleaf trunks are 140–220 px wide where they leave the bottom edge; conifer trunks may be
  slimmer under fuller crowns.
- **Paint them sharp.** The game adds the blur (about 5 px at this size), so no blur, glow or tint in the file. Bold
  shapes read best once blurred: a clear trunk silhouette, a few large leaf masses, and 3–5 values per tree rather
  than fine detail that would turn to mush.
- **Clean alpha:** no halo or matte fringe; a blur would show it as a dark or light outline.

| Region | Trees | Light and palette |
|---|---|---|
| Trnovski gozd | beech and silver fir (the Dinaric fir–beech forest) | night. Cool blue moonlight from the moon's side (upper right in the study), dark blue-green shade, matching `framing-trees.png` |
| Ljubljanski grad | the castle hill's broadleaves: linden, oak, beech | sunset. Warm orange rim light from the sun's side, violet-blue shade, matching `near-foreground-tree-frame.png` |
| Peca | spruce, larch and beech in autumn | daylight. The ochre, olive and dark green of Peca's `midground-forest.png` |
| Triglav (optional) | spruce and larch | the current `foreground-spruces.png` works. Repaint only if there is time, to the same rules |

## 3. Edge trees that tile (2 layers)

**Problem.** `trnovski-gozd-parallax/layers/framing-trees.png` and
`ljubljanski-grad-parallax/layers/near-foreground-tree-frame.png` are cut by **both** picture sides. To tile, the
game joins each one to its mirror image, so on the road a symmetric doubled tree appears at every seam.

**Correction:** make each layer **horizontally seamless**: whatever leaves the right edge continues at the left edge,
at the same rows. Composition, size and everything else stay as they are, and the bases from §1 still apply. If a
seamless edge is not workable, the fallback is complete trees with at least 48 px clear on both sides.

## 4. Stretched strips (Ptuj, Peca, Ljubljanica)

**Problem.** These layers are painted on 2172 × 724 strips but displayed in boxes of a different shape. Codex's own
`preview.html` does the same (`object-fit: fill`), so the stretch is in the approved previews too. Landmarks show it
most: Ptuj's castle and town are 1.54 × too wide, and the Ljubljanica bridge 1.86 ×. (Piranske soline, Predjama and
Barje had the same fault in the export tool; Claude fixed those on 27 Nov, so they need nothing.)

**Correction:** repaint each layer on a canvas of the **in-game shape** below, so it is shown undistorted. Either
size in the last column fits; keep the content where it is in the scene. The landmarks matter most, the water and
ground textures less.

| Priority | Region | Master (`layers/`) | Shown now | Repaint on (either) |
|---|---|---|---|---|
| 1 | Ptuj | `castle-hill.png` | 1.54 × wide | 2172 × 470 or 3345 × 724 |
| 1 | Ptuj | `town.png` | 1.55 × wide | 2172 × 468 or 3362 × 724 |
| 1 | Ljubljanica | `bridge.png` | 1.00 × since 27 Nov (the tool) | replaced by `tromostovje.png`, scenes spec §1 |
| 1 | Peca | `peca-mountain.png` | 1.16 × wide | 2172 × 623 or 2525 × 724 |
| 2 | Peca | `midground-forest.png` | 1.16 × wide | 2172 × 623 or 2525 × 724 (with the base from §1: then to row 539 of 623, i.e. the same 86.7 %) |
| 2 | Peca | `foreground-ground.png` | 1.26 × wide | 2172 × 575 or 2736 × 724 |
| 2 | Ljubljanica | `water-reflections.png` | 1.98 × wide | 2172 × 366 or 4292 × 724 |
| 3 | Ptuj | `drava-water.png`, `water-reflections.png` | 2.79 × wide | 2172 × 259 or 6064 × 724 |
| 3 | Ljubljanica | `river-surface.png` | 3.91 × wide | 2172 × 185 or 8487 × 724 |
| 3 | Triglav | `distant-peaks.png` | 1.07 × wide | 2172 × 679 or 2316 × 724 |
| — | Ptuj, Peca | `sky.png` | 0.59 × (squeezed) | a sky gradient: leave as it is |
| — | Ptuj | `foreground-road.png` | 0.74 × (squeezed) | leave as it is unless repainted for another reason |

## Delivery

- Work on a branch from `review/folk-backgrounds` (PR #46), or from `main` once that is merged, for example
  `codex/parallax-corrections`.
- **Commit only masters and notes:** the PNGs above and each study's `README.md` (what changed, and why). Replace
  masters in place under the same names; git keeps the old versions. New files go in the same `layers/` folders.
- **Do not edit runtime files:** `art/exports/`, `art/manifests/`, `data/backgrounds.json`, `src/`, `dist/`. Claude
  regenerates and tunes those.
- Deliver in priority order: §1 bases, then §2 passing trees, then §3, then §4. Each region can land on its own.

## Acceptance (Claude checks each delivery)

1. **Bases:** re-exported **without** the tool's generated base (`floor` removed for that layer), the slice passes
   *no slice floats over the lane* in `tests/parallax.test.js`: under 0.5 % of columns over a walk.
2. **Passing trees:** padded rather than mirrored (no "cut on both sides" note from the export tool); trunks reach
   the canvas bottom; at most about 80 KB as WebP; on a 360 and a 412 px phone, the clump crosses the party in about
   1.5 s and the road stays open between clumps.
3. **Seamless edge trees:** exported with mirroring switched off (`mirror: False`), no visible seam when walking.
4. **Strips:** shown at 1.00 × (± 2 %) in the game; the castle, town and bridge match their proportions in the master.
5. In every case: `npm test` passes (`tests/parallax.test.js` and `tests/parallax-phone.test.js`), and the Game
   Director reviews the region on a phone (`?ozadje=B`, or *Kakovost slik → Visoka*).

## Out of scope

- Ptuj's winter redraw (a separate, earlier request).
- New regions, new landmarks, recolouring existing layers (except the three scenes of `FOLK_PARALLAX_SCENES_SPEC.md`).
- The skill cards and achievement icons.
