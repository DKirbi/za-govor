# Ptuj background: variant B integration and A/B test

**Status:** IMPLEMENTED (the connection), with the art OPEN. Variant B's layer files are not delivered yet, so the game builds with variant A only and no player sees a change.
**Art author:** GPT · **Approval:** Game Director · **Integration:** Claude

## What exists

| Part | State |
|---|---|
| Variant A: the Ptuj background in use (`BG.ptuj`, 384 × 120, from `tools/art_extra.py`) | IMPLEMENTED, unchanged. It is never replaced by the test. |
| Reference image `ptuj-parallax-preview.png` (GPT, 17 Nov) | Committed as a **reference only**: the original bytes, not cropped or converted. It is the image PR #28 asks for (as `.jpg`; the original is a PNG). |
| Variant B layer PNGs and manifest | OPEN, not delivered. The infographic's thumbnails are not used as layers (`docs/art-workflow/GRAPHICS_HARNESS_PREPARATION.md` §3). |
| Build connection (`build.py` reads the manifest and builds in the layers) | IMPLEMENTED |
| Parallax renderer on the road and in battle (`src/backgrounds.js`) | IMPLEMENTED, tested with a synthetic test pack |
| A/B assignment, preview override, gallery entry, statistics tag | IMPLEMENTED. The test is **not live**. |
| Layer speeds and cloud drift in `data/backgrounds.json` | PROPOSED starting values, to be tuned on the real art |

## How the connection works

1. `data/backgrounds.json` → `tests.ptuj`: variant B is the pack `ptuj`, split 50/50, `live: false`.
2. `packs.ptuj.manifest` points to **`art/manifests/ptuj.json`**. When that manifest and every layer file it lists are committed, `python3 build.py` inlines the layers into `dist/index.html` and prints a line such as `background pack ptuj: 8 layers, 480×165, 61 KB, status review`. Until then it prints `not delivered yet … variant A only`.
3. A delivered pack that contradicts its manifest **stops the build**: wrong size, missing alpha, a layer outside the canvas, or duplicate ids or orders. A partly delivered pack is left out with a note.
4. In the game (`src/backgrounds.js`), variant B replaces the scene's single picture with the layers, back to front as the manifest orders them. The layers get the same dimming that variant A gets in each scene, so the comparison is fair. The road strip of A is hidden because the pack brings its own ground (`hideRoad`).
   - **Road (travel screen):** a tiling layer scrolls with the walk × its `speed` (1 = with the road, 0 = still). A layer that does not tile pans once across the region, as A's picture does.
   - **Battle:** the canvas is centred and stands still. Only layers with `drift` move (the clouds); under *reduced motion* nothing moves.
   - **Foreground:** a layer with `role: "foreground"` stands in front of the heroes and enemies but under the health bar, attack cards and damage numbers.

The planned layer paths follow draft PR #29: `art/exports/environments/ptuj/<id>.png`, plus the source art in `art/source/environments/ptuj/`. The reference's L1–L8 map to these ids:

| Reference | id | Proposed speed |
|---|---|---|
| L7 Nebo | `sky` | 0 |
| L8 Oblaki | `clouds` | 0.03, drift 3 art px/s |
| L6 Oddaljeni griči | `distant-hills` | 0.06 |
| L5 Grajski grič | `castle-hill` | 0.12 |
| L4 Mesto jedro | `town` | 0.22 |
| L3 Odsevi | `reflections` | 0.35 |
| L2 Voda | `drava-water` | 0.35 |
| L1 Ospredje (pot) | `road-tile` | 1 (the road speed) |

A layer the manifest adds under another id still works. It gets a speed from its depth, and the build says so.

## Manifest fields the build reads

The harness standard asks for more than this (colour mode, source/export, seam tests, open issues). These are the fields the game needs:

```json
{
  "pack": "ptuj", "name": "Ptuj — sončni zahod nad Dravo", "version": "1.0.0", "status": "review",
  "canvas": { "width": 480, "height": 165 },
  "layers": [
    { "id": "sky", "order": 1, "file": "art/exports/environments/ptuj/sky.png",
      "width": 480, "height": 165, "x": 0, "y": 0, "alpha": false, "tileX": true, "role": "background" }
  ]
}
```

- `order`: 1 is the back.
- `x` and `y`: the layer's offset on the canvas. Without `y`, a layer sits on the bottom.
- `tileX`: the left and right edges join seamlessly.
- `role: "foreground"`: drawn in front of the actors.
- `status`: one of `draft | review | approved | superseded`. Until `approved`, the gallery labels B *v pregledu*. `superseded` leaves the pack out.

## Constraints measured in the current game

These come from the code, not from the infographic. Its 1920 × 1080 size and px/s speeds are not used (PR #28).

- **Scene size.**
  - Desktop: 330 px tall, shrinking to 240 px when the screen is fitted, and about 966 px wide.
  - Phone: 215–240 px tall and about 370 px wide.
  - The picture is scaled to the scene height with nearest-neighbour, like variant A.
- **Pixel density.** Variant A is 120 art px tall, so on desktop one art pixel is 2.75 screen pixels. Heroes are 48 × 48 art px drawn at 2× on desktop. A **165 px tall canvas** would match the heroes' pixel size on desktop; 120 px matches variant A. This is a decision for the Game Director and GPT (OPEN).
- **Width.** A layer that does not tile needs a canvas at least as wide as the scene: about 483 art px at 165 tall, or 352 at 120 tall. A wider canvas gives more pan on the road. Tiling layers have no minimum.
- **Walk line.** Heroes and enemies stand 44 px above the scene's bottom on desktop (40 px on a phone), about 13 % of the height. Variant A's road strip fills the bottom 6–38 px. The ground the party walks on should sit in roughly the **bottom 12–13 % of the canvas** (about 20 px of 165, or 16 of 120).
- **File size.** The build is one HTML file (about 2.6 MB now) with every layer inlined. Export layers at native pixel-art size, never upscaled. The build warns above 1.5 MB per pack.

## Preview and starting the A/B test

- **Preview, once the pack is built:** open `dist/index.html?ozadje=B`, or *Liki in karte → Ozadja*, which shows B next to A's pictures. `?ozadje=A` forces A. A preview never assigns a variant, and the statistics mark it `ozadje-ptuj=B(predogled)`, so those rows can be left out.
- **Starting the test (Game Director's call):** set `tests.ptuj.live` to `true` and rebuild.
  - Each install then draws A or B by `share` and keeps it in localStorage `zg-ab`.
  - If B is missing from a build, everyone sees A, and the assignment is kept for when B is back.
- **Reading the results:** every statistics row (opt-in testers, `src/stats.js`) carries `ozadje-ptuj=A` or `=B`. Useful comparisons:
  - Ptuj battle duration and seconds per word
  - wins and losses
  - how many journeys go on past Ptuj

  These are behavioural signals from a small group of testers. They do not record which background people *prefer*. A one-question rating would need a decision first (OPEN).

## Open issues for the Game Director and GPT

1. **Layer order.** The infographic's *od zadaj naprej* stack puts the clouds behind the sky and the reflections behind the water. PR #28 and `docs/art-benchmarks/ptuj-battle-depth/` put the clouds in front of the sky and the reflections over the water. The manifest's `order` decides, so please set it explicitly.
2. **Bridge.** The composite and L4 show an arched bridge on the left. PR #27 and the battle-depth spec say not to add a bridge or combine viewpoints. This needs a decision before export.
3. **Season and mood.**
   - B is a summer sunset with green trees and flowers.
   - Ptuj's region text is Pust ("Kurenti z zvonci preganjajo zimo"), and A is the snowy town.
   - The A/B test would compare season and mood as well as the art.
4. **Foreground.** The reference's L1 merges the path, fence and flowers into one strip. The battle-depth spec wants the ground and selective ankle-level props separate, with the props static. The runtime supports a separate `role: "foreground"` layer. Suggestion: `road-tile` behind the party, plus an optional props layer in front.
5. **Water and reflection animation.** The reference suggests 4–6 s and 6–8 s loops. The runtime has steady sideways drift only. Frame animation (a sprite sheet with frame timing in the manifest) gets built once the delivered format is known.
6. **Android preview.** `?ozadje=B` works in a browser. The Android app has no address bar, so previewing B there would need a tester switch (not built).
