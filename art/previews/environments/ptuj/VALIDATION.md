# Ptuj parallax pack — review report

**Status:** PROPOSED; awaiting Game Director review. No runtime integration is included.

## Included variants

- **Sunset:** retains the warm palette and original road.
- **Winter:** adds snow to roofs, tree crowns, the riverbank wall coping, and foreground road. The Drava remains open water.
- **Shared bridge and riverbank wall:** the wall defines the city's far bank, runs behind the river edge, and meets the left end of the stylized bridge. This is based on the supplied visual reference; it is not a verified historical reconstruction.

The Game Director identifies the winter background as the setting where Kurent is recruitable. Other winter-scene assignments remain OPEN.

## File checks

- Source and export PNGs were opened and inspected. Transparent exports use binary alpha and are cropped to opaque bounds; the manifest records their offsets.
- Winter town and reflection source canvases now match the 1672 × 941 review canvas. The one-pixel transparent extension does not alter their painted content.
- Both road exports mirror one half across the other, so their left and right edge columns match. Three-copy road previews were visually checked for seams.
- Sunset and winter previews include the new wall and show it joining the bridge. The wall layers sit between the town/river and the foreground bridge.
- The road ground lines in the preview match the manifest: sunset y=761, winter y=750.

## Runtime and integration limits

- The inspected GitHub main branch does not contain a background renderer, parallax loader, configuration, or asset tests. The 1672 × 941 canvas is a review canvas, not a confirmed runtime size.
- The referenced 1672 × 560 view and data/backgrounds.json are on the separate open PR 32 branch, not main.
- PR 32's build helper reads dimensions.export and tileable.horizontal from layersBackToFront entries, then uses data/backgrounds.json for scene placement. PR 33's descriptive manifest uses exportSize, a boolean tileable, and offset. It therefore needs a metadata and placement adapter before that build can consume this pack. The build helper checks PNG dimensions and is expected to stop on a missing size declaration; it does not silently accept those missing dimensions.
- The new wall and winter layers are not added to PR 32's data/backgrounds.json or runtime scene layout. This remains OPEN for game integration; the winter background is not assigned to an A/B test here.
- The ground line remains OPEN. On the 941 px review canvas the road starts at y=761 (sunset) and y=750 (winter), while the A/B prototype's actor feet are placed substantially higher. The wall fixes the city's visible riverbank, but does not solve the battle-layout ground placement. The two road lines also differ by 11 px.
- Ptuj Castle's hilltop relationship to the old town is supported by [Visit Ptuj](https://visitptuj.eu/en/see-do/culture-heritage/sightseeing/ptuj-castle/). The skyline, wall, and multi-arch bridge are stylized scene art; the bridge is not a depiction of the present-day Puh bridge, and the wall is not asserted as a verified historical structure.

## Review files

- Sunset preview: `assembled.jpg`
- Winter preview: `winter-assembled.jpg`
- Sunset road repeat preview: `road-repeat-3x.jpg`
- Winter road repeat preview: `winter-road-repeat-3x.jpg`
- Source layers: `art/source/environments/ptuj/`
- Cropped exports: `art/exports/environments/ptuj/`
- Manifest: `art/manifests/ptuj.json`

No game tests were run. The art pack remains unintegrated and the relevant renderer is only on the separate PR 32 branch.