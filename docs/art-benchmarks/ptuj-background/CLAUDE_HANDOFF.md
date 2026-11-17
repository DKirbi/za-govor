# Claude handoff — Ptuj background assets (PR #27)

**Ownership:** GPT creates the visual artwork and supplies the reference assets. Claude does not generate, redesign or replace the artwork. Claude handles technical inspection, asset preparation, integration and QA only.

## Supplied assets

The accompanying asset package contains:
- `ptuj-composite-reference.png` — cropped main scene from the supplied Ptuj iteration.
- `L1-foreground-reference.png` … `L8-clouds-reference.png` — crops of the layer breakdown thumbnails.
- `manifest.json` — dimensions and limitations.
- `CLAUDE_HANDOFF.md` — this brief.

**Important:** the checkerboard behind the layer thumbnails is baked into the source pixels. Those crops are visual references, not alpha-transparent production layers. Do not chroma-key them or use them directly in runtime. Reconstruct clean layers from the supplied composite/reference, retaining the exact approved composition. If the repository cannot host the binary package in this PR yet, the package must be added before treating the PR as a complete asset handoff.

## Required project audit

Before implementation, inspect the current battle viewport, background renderer, camera, scaling/filtering, parallax support and existing asset conventions. Confirm dimensions and anchor rules from code; do not infer them from the infographic's suggested 1920×1080 specification.

## Confirmed direction for this iteration

- Use the supplied Ptuj image as the source of truth. Do not generate a new scene.
- Remove the proposed **“Območje junakov”** overlay/zone entirely. It must not appear in the artwork, preview or runtime.
- Heroes may be positioned closer together. Do not enforce wide spacing or reserve a conspicuously empty hero zone in the background.
- Keep the environment composition natural and uninterrupted.
- Foreground props remain a separate, static layer; overlap may reach the ankle line at most and must never obscure readable actions.
- Keep clouds and water/reflections as restrained animation candidates only if the current implementation supports them cleanly. Provide a still composition too.
- Preserve credible Ptuj geography. Do not add a bridge or combine incompatible viewpoints. Treat the illustration as an approved art direction reference, not independent geographic evidence.

## Claude's implementation tasks

1. Inspect the repository's current background pipeline and document the exact files and constraints found.
2. Create a reproducible technical preparation workflow for clean, independently usable PNG layers. Keep visual authorship and composition unchanged.
3. Reconstruct alpha-transparent layers from the supplied art reference where technically feasible. The checkerboard thumbnail crops are not alpha sources.
4. Keep layer count purposeful: separate only for parallax, independent animation, foreground occlusion or runtime composition.
5. Build a composed preview and layer-order preview, both without hero-zone markings.
6. Verify the composition in the actual battle viewport and at native display scale.
7. Keep experimental assets isolated; do not overwrite production backgrounds or alter gameplay.
8. Provide a manifest documenting dimensions, alpha, z-order, parallax, pivots/anchors and animation notes, all grounded in inspected implementation.
9. Report changed paths, verification steps, limitations and any decisions requiring the Game Director.

## Explicitly out of scope

- Creating or generating new Ptuj artwork.
- Redesigning the composition, changing landmarks or adding a bridge.
- Creating a marked hero staging zone.
- Forcing wide spacing between heroes.
- Implementing Martin Krpan spirits (separate next PR).
- Changing gameplay, UI or production assets without approval.

## Definition of done

- Supplied visual reference is preserved.
- No “Območje junakov” appears anywhere.
- Party spacing is not artificially constrained by the background.
- Clean alpha layers and a composed preview are available, or any source limitation is clearly documented.
- Pixel edges, transparency, scaling and readability are checked in the real battle viewport.
- No visual redesign or gameplay change has been made by Claude.
- PR remains draft until Game Director review.