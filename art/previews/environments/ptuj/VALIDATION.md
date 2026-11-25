# Ptuj parallax pack — review report

**Status:** PROPOSED; awaiting Game Director review. Integrated for preview in PR #34 (see below).

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

## Runtime and integration

This report was written before the packs were integrated. PR #34 integrates them: `data/backgrounds.json` places every
layer on a 1672 × 560 view with the road at 58 %, `build.py` reads this manifest, and *Kakovost slik* chooses between
them and the picture already in the game. See `docs/art-benchmarks/ptuj-background/INTEGRATION.md` for the current
state. Ptuj Castle's hilltop relationship to the old town is supported by
[Visit Ptuj](https://visitptuj.eu/en/see-do/culture-heritage/sightseeing/ptuj-castle/). The skyline, wall and
multi-arch bridge are stylized scene art: the bridge is not the present-day Puh bridge, and the wall is not asserted as
a verified historical structure.

## Review files

- Sunset preview: `sunset-assembled.jpg`
- Winter preview: `winter-assembled.jpg`
- Sunset road repeat preview: `road-repeat-3x.jpg`
- Winter road repeat preview: `winter-road-repeat-3x.jpg`
- Source layers: `art/source/environments/ptuj/`
- Cropped exports: `art/exports/environments/ptuj/`
- Manifest: `art/manifests/ptuj.json`
