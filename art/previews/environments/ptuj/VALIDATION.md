# Ptuj parallax pack Ã¢â‚¬â€ validation report

**Status:** Review candidate; not approved and not runtime integrated.

## Checks performed

- All eight source layer PNGs and eight candidate export PNGs open successfully.
- The seven scene layers share a 1672 Ãƒâ€” 941 canvas. The road is a separate 2172 Ãƒâ€” 724 repeating tile.
- PNG alpha is genuine: the scene cutout layers and road include transparent pixels; sky is opaque. Seven exports preserve source alpha exactly. The road tile uses binary alpha after its edge cleanup.
- The road tile was built from the generated left half mirrored across the right half. The left and right edge columns match exactly on all 724 rows. A three-copy preview was visually inspected and showed no visible seam.
- The assembled preview was made from the individual export files in back-to-front order. It applies proposed offsets for the distant hills and castle hill, as documented in the manifest.
- No hero-zone overlay, Martin Krpan spirits, or high foreground occlusion were added.

## Review files

- Assembled environment: `assembled.jpg`
- Three-copy road seam check: `road-repeat-3x.jpg`
- Eight individual layers: `art/source/environments/ptuj/`
- Machine-readable manifest: `art/manifests/ptuj.json`

## Open questions and limitations

1. The 1672 Ãƒâ€” 941 canvas is not a confirmed runtime size. The inspected repository has no implemented background renderer, loader, configuration, or parallax tests. The 1920 Ãƒâ€” 1080 label in the reference graphic is unverified against game code.
2. The preview's hill offsets and castle-hill scale/placement are proposals; confirm them against the battle layout and hero scale before integration.
3. The supplied brief identifies a conflict between the summer sunset/arched bridge in the reference and earlier winter/Pust context plus an explicit bridge exclusion. The inspected current repo files do not resolve it. No bridge is included pending a decision.
4. Ptuj Castle's hilltop relationship to the town is grounded in official local tourism and museum references, but the generated town skyline and viewpoint are stylized and need visual review.
5. Cloud drift, water movement, reflections, and speed ratios are not implemented. Motion remains qualitative only; no numeric speeds are prescribed.
6. The generated overlays retain partial alpha. The road alone was cleaned to binary alpha to make a crisp, repeatable edge. Review the edge finish and the road's mirrored pattern.

No repository test suite was run because no background renderer or asset validation tests exist in the inspected code. This report records file-level image, transparency, alignment, and road-edge checks only.
