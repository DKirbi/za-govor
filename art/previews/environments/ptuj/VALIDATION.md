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
