# Ptuj background asset manifest

**Status:** OPEN — asset pack not yet delivered  
**Visual owner:** GPT  
**Approval:** Game Director  
**Technical integration:** Claude

This manifest is a checklist and destination map. It does not claim that any of the files below already exist.

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
