# Ptuj background asset manifest

- **Status:** OPEN — parallax concept slices prepared; production pack not yet delivered
- **Visual owner:** GPT
- **Approval:** Game Director
- **Technical integration:** Claude

This manifest is a checklist and destination map for the production paths below. The concept slices listed next are separate references; they do not yet fulfill those production paths.

## Prototype slice references

The first folk-art slice set has been generated from the reviewed panorama. These files are concept references for composition and parallax tuning; they do not fulfill the production paths below or update the in-game background.

| Layer | Current reference |
|---|---|
| Sky | [`sky.png`](../ptuj-parallax/layers/sky.png) |
| Distant hills | [`distant-hills.png`](../ptuj-parallax/layers/distant-hills.png) |
| Castle hill | [`castle-hill.png`](../ptuj-parallax/layers/castle-hill.png) |
| Town | [`town.png`](../ptuj-parallax/layers/town.png) |
| Clouds | [`clouds.png`](../ptuj-parallax/layers/clouds.png) |
| Reflections | [`water-reflections.png`](../ptuj-parallax/layers/water-reflections.png) |
| Drava water | [`drava-water.png`](../ptuj-parallax/layers/drava-water.png) |
| Foreground path | [`foreground-road.png`](../ptuj-parallax/layers/foreground-road.png) |
| Near foreground | [`foreground-oak.png`](../ptuj-parallax/layers/foreground-oak.png) |

See the [Ptuj layer and motion preview](../ptuj-parallax/README.md) for the complete stack, composition and initial speed ratios.

## Planned source files

| Layer | Planned path | Required properties | Status |
|---|---|---|---|
| Sky | `art/source/environments/ptuj/sky.png` | Full-width background layer | OPEN |
| Distant hills | `art/source/environments/ptuj/distant-hills.png` | Independent layer, transparent outside silhouette | OPEN |
| Castle hill | `art/source/environments/ptuj/castle-hill.png` | Independent layer including Ptuj Castle | OPEN |
| Town | `art/source/environments/ptuj/town.png` | Independent town silhouette | OPEN |
| Reflections | `art/source/environments/ptuj/reflections.png` | Separate water reflection layer | OPEN |
| Drava water | `art/source/environments/ptuj/drava-water.png` | Seamless horizontal loop where appropriate | OPEN |
| Foreground road | `art/source/environments/ptuj/road-tile.png` | Long, simple, seamless horizontal tile | OPEN |
| Clouds | `art/source/environments/ptuj/clouds.png` | Independent transparent overlay | OPEN |

## Planned runtime exports

Runtime exports should mirror the source layer names under:

`art/exports/environments/ptuj/`

Exact dimensions and formats remain OPEN until the actual game viewport, scaling and renderer constraints are verified against the current implementation.

## Acceptance notes

- The source files must be actual separately usable artwork, not crops from a labeled preview sheet.
- Preserve transparent pixels and pixel-art edges.
- The road must tile seamlessly and provide the strongest movement cue.
- Relative parallax speeds are implementation parameters to be tuned in the runtime preview; no unverified numeric ratios are prescribed here.
- Do not include an “Območje junakov” overlay.
- Foreground overlap must not exceed ankle level.
- Martin Krpan spirits are outside this pack's scope.

Update this manifest only when files are actually committed. Change status to APPROVED only after Game Director review.
