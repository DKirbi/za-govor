# Ptuj parallax pack — review report

**Status:** PROPOSED; awaiting Game Director review. No runtime integration is included.

## Included variants

- **Sunset:** retains the original warm palette and road.
- **Winter:** adds snow to roofs, tree crowns, and the foreground road. The Drava remains open water; no frozen-river claim is implied.
- **Shared bridge:** a multi-arch bridge appears at the far left, per the Game Director's direction. It is stylized game art, not a documentary depiction of the present-day Puh bridge.

The Game Director identifies the winter background as the setting where Kurent is recruitable. Other winter-scene assignments remain OPEN for future direction.

## File checks

- Source and export PNGs were opened and inspected. Source layers retain their full generated canvases; transparent exports are cropped to opaque bounds and carry binary alpha. The opaque sky layers remain full-canvas.
- Both road exports use a horizontally mirrored half, so the first and last columns match. A three-copy winter-road preview was visually inspected; no edge seam is apparent.
- Sunset and winter previews were assembled from the exported layers. Their transforms and placements are review proposals, not runtime coordinates.
- The manifest records each cropped export's source-canvas offset and dimensions.
- Text in the JSON manifest and this report is UTF-8.

## Runtime and geography limits

- The inspected GitHub `main` branch at the time of review did not contain a background renderer, parallax loader, background configuration, or asset tests. Runtime dimensions, scaling, draw order, and alpha handling remain unconfirmed.
- Feedback mentioned a 1672 × 560 runtime view and `data/backgrounds.json`; neither was present in the inspected `main` branch. The 1672 × 941 value is the generated source/review canvas only.
- Official local tourism information places Ptuj Castle on Castle Hill above the old town. The generated skyline and viewpoint are stylized and are not a surveyed view.
- Ptuj's current Puh bridge is a contemporary structure. The multi-arch bridge in this pack is a visual interpretation, not a claim that it depicts the current Puh bridge.
- Clouds, water, and reflections are still frames. Movement and animation are not implemented, and no numeric parallax speeds are approved.

## Review files

- Sunset preview: `assembled.jpg`
- Winter preview: `winter-assembled.jpg`
- Winter road repeat check: `winter-road-repeat-3x.jpg`
- Source layers: `art/source/environments/ptuj/`
- Cropped exports: `art/exports/environments/ptuj/`
- Machine-readable manifest: `art/manifests/ptuj.json`

No game tests were run because this asset pack is not connected to a renderer or asset test suite in the inspected repository.

## Review check, 2026-11-17 (manifest 0.2.1)

Checked against the exported PNG files:

- All 17 export layers have binary alpha; no partial-alpha pixels were found.
- Every export's pixel size matches its manifest `exportSize`.
- Every offset plus export size fits the 1672 × 941 canvas. The road tiles are horizontal repeats and are excluded from this check.
- The road tiles sit at the bottom of their 724 px source. Their canvas ground lines are 761 (sunset) and 750 (winter). Manifest 0.2.1 records these as `groundY`.

Open items:

- The ground lines are at 80–81% of canvas height. In the browser prototype, enemies stand at about 62–70% of scene height and heroes at about 75–87%, so the party would appear to stand on the river. The composition decision is still open.
- The sunset and winter ground lines differ by 11 px.
- The winter town and winter reflections sources are 1671 px wide against the 1672 px canvas.
- Manifest 0.2.x uses `exportSize`, `offset` and a boolean `tileable`. The 0.1.0 reader expected `dimensions.export`, `tileable.horizontal` and `x`/`y`, so the reader must be updated before this manifest is integrated.
