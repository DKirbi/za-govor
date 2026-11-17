# Ptuj background asset manifest

**Status:** DELIVERED for review — the Codex pack (#33), integrated as variant B of the Ptuj background test (#32). Not approved.  
**Visual owner:** GPT (generated with Codex)  
**Approval:** Game Director  
**Technical integration:** Claude

This was the checklist and destination map before delivery. The delivered files and their properties are in `art/manifests/ptuj.json`; how the game places them is in `INTEGRATION.md`.

## Planned source files

| Layer | Planned path | Required properties | Status |
|---|---|---|---|
| Sky | `art/source/environments/ptuj/sky.png` | Full-width background layer | DELIVERED (review) |
| Distant hills | `art/source/environments/ptuj/distant-hills.png` | Independent layer, transparent outside silhouette | DELIVERED (review) |
| Castle hill | `art/source/environments/ptuj/castle-hill.png` | Independent layer including Ptuj Castle | DELIVERED (review) |
| Town | `art/source/environments/ptuj/town.png` | Independent town silhouette | DELIVERED (review) |
| Reflections | `art/source/environments/ptuj/reflections.png` | Separate water reflection layer | DELIVERED (review) |
| Drava water | `art/source/environments/ptuj/drava-water.png` | Seamless horizontal loop where appropriate | DELIVERED (review); a still, not a loop |
| Foreground road | `art/source/environments/ptuj/road-tile.png` | Long, simple, seamless horizontal tile | DELIVERED (review) |
| Clouds | `art/source/environments/ptuj/clouds.png` | Independent transparent overlay | DELIVERED (review) |

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
