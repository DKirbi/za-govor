# Graphics preparation standard for the local harness

**Purpose:** internal production guidance for GPT and the local graphics harness. This is not game-facing documentation and does not approve any particular artwork.

**Status:** workflow guidance / proposed standard. The Game Director remains the final creative approver.

## 1. Responsibilities

- **Game Director:** sets the brief, resolves creative questions and approves/rejects visual output.
- **GPT (art direction and asset author):** researches references when needed, defines the visual target, creates the actual artwork and exports, checks the files against this document, and supplies a manifest.
- **Local harness:** gives GPT access to the working repository and filesystem; runs image inspection/validation scripts; stages exact generated files; commits and pushes a feature branch; opens or updates a PR.
- **Claude (implementation):** consumes approved files, integrates them into the game and reports technical constraints. Claude must not redraw, regenerate, replace or artistically reinterpret supplied art unless the Game Director explicitly changes that responsibility.

The harness is an execution bridge, not an independent art director. It must not make creative decisions to “fix” assets silently.

## 2. Repository destinations

Keep original artwork and runtime exports separate. Follow the existing asset library convention:

- `art/source/<category>/<asset-pack>/` — editable/high-quality source artwork and separated layers.
- `art/exports/<category>/<asset-pack>/` — game-ready PNGs and any runtime-specific variants.
- `art/manifests/<asset-pack>.json` — machine-readable asset metadata.
- `docs/art-benchmarks/<topic>/` — visual benchmark, art direction, implementation notes and review criteria.

Use descriptive, stable filenames. Avoid spaces, ambiguous names such as `final2`, and filenames that encode temporary approval assumptions. Keep related files together in a named pack.

## 3. Artwork preparation

### Pixel-art assets

- Preserve crisp pixel edges and consistent pixel density.
- Do not apply smoothing, anti-aliasing, bilinear filtering or lossy compression to pixel-art exports.
- Do not upscale with interpolation. If a larger export is required, use integer nearest-neighbour scaling and record the scale.
- Keep palette and contrast consistent with the approved visual direction: modernized SNES/GBA-inspired pixel art for gameplay assets; folk-art illustration for selected narrative/collectible artwork; restrained dark UI with gold accents.
- Prefer clean silhouettes and readable shapes at the actual in-game display size.

### Layers and transparency

- Export each independently movable/rendered element as its own full-resolution PNG with genuine alpha transparency.
- Preserve the intended canvas dimensions and alignment across layers. If layers share a scene canvas, do not trim each one independently unless the manifest records the offset.
- Do not bake a background colour, checkerboard, labels, arrows, measurement marks, UI annotations or explanatory text into production layers.
- A flattened composition may be included as a preview/reference, but it is never a substitute for the individual layer files.
- Never create production layers by cropping thumbnails, infographic panels, screenshots or contact sheets. Never use checkerboard-removal tricks as a substitute for real transparency.
- If the image-generation process only produces a composite or an infographic, label it as a reference and stop: request or create proper separated assets before implementation.

### Dimensions and runtime variants

- Do not invent universal sprite or background dimensions. Inspect the target game's current renderer, viewport, camera, sprite conventions and asset loader first.
- Preserve the source master at its native resolution. Create runtime-sized exports only when the implementation requires them.
- Record source dimensions, export dimensions, scale factor, colour mode, alpha presence and any crop/offset.
- Avoid unnecessary duplicate resolutions. Keep one authoritative source and clearly identify each derived export.

## 4. Environment and parallax packs

For a parallax environment, prepare each depth plane as a separate transparent PNG, aligned to a common scene canvas where practical. The manifest must define exact back-to-front order and explain any intentional overlap.

For horizontally repeating elements (ground, road, water or clouds where appropriate):

- The left and right edges must join without a visible seam.
- Validate the seam at native resolution and in a repeated preview (at least three adjacent copies).
- Avoid unique landmarks or one-off props at tile boundaries.
- Record whether the asset is tileable horizontally, vertically, both or neither.
- Record intended motion direction and relative depth role, but do not prescribe arbitrary pixel-per-second values. Runtime speed ratios must be tuned against the actual camera and movement implementation.

Foreground decoration must respect character readability and any project-specific staging constraints. Do not add hero-zone overlays or reserve character placement in background art unless explicitly requested.

## 5. Required pack contents

A typical pack should include:

1. Original source artwork (where available).
2. Individual production layers or sprites as separate PNGs.
3. Runtime exports, if distinct from source.
4. One flattened preview showing the intended composition.
5. A manifest describing every delivered file.
6. A short benchmark/README describing intended appearance, layer order, animation/tiling behaviour, known limitations and approval status.

The preview is for human review only. The harness and implementation must use the actual individual asset files.

## 6. Manifest contract

Use JSON so scripts can validate it. Include, at minimum:

- pack name and version;
- status: `draft`, `review`, `approved` or `superseded`;
- creator and intended game area;
- visual reference/benchmark path;
- for every file: repository path, role, format, width, height, colour mode, alpha, source/export designation, scale/crop/offset if applicable;
- layer order and depth role where relevant;
- tileability and seam-test result where relevant;
- animation frames/timing where relevant;
- open issues and known limitations.

Do not mark assets `approved` or `production-ready` before the Game Director has reviewed them. A successful technical validation is not creative approval.

## 7. Automated validation before Git

The harness should run checks on the exact files that will be committed:

- all referenced files exist and are non-empty;
- PNGs decode successfully;
- dimensions and colour modes match the manifest;
- alpha is present where transparency is required;
- no accidental opaque background exists on a layer declared transparent;
- pixel-art exports have not been unintentionally resampled or softened;
- repeated tiles pass a seam check and a visual repeated-preview check;
- layer canvas alignment/order is consistent;
- filenames and paths follow the pack convention;
- preview and manifest reference the same pack/version.

Generate a contact sheet or preview for review, but never substitute that sheet for source assets. Report validation failures; do not silently modify the art to make tests pass.

## 8. Git and pull-request workflow

The local harness should operate on a clean checkout with authenticated Git access:

1. Read the current `main` head and create a dedicated feature branch from it.
2. Write the exact approved/prepared files into the repository paths above.
3. Run validation and inspect the resulting preview.
4. Show the Game Director a concise file inventory and validation report before committing when the changes are substantial.
5. Commit the original binary files and documentation as normal Git files. Do not Base64-encode screenshots or substitute images for original assets.
6. Push the branch and open a draft PR against `main`.
7. In the PR description, list the asset pack, exact paths, dimensions, validation results, open questions and review status.
8. Keep the PR draft until the Game Director approves the artwork and any implementation preview.
9. Claude may then implement/integrate the supplied assets in a separate implementation change, referencing the exact approved paths.

Use Git LFS only if repository size makes ordinary Git unsuitable; propose it first rather than switching storage silently.

## 9. PR acceptance checklist

- [ ] Files are the actual artwork, not screenshots, crops or infographic thumbnails.
- [ ] Source art and runtime exports are clearly separated.
- [ ] Every production layer/sprite is an individual file.
- [ ] Transparency, dimensions, alignment and pixel edges are verified.
- [ ] Tileable assets pass repeated seam checks.
- [ ] Preview is clearly labelled as a preview/reference.
- [ ] Manifest matches the committed files.
- [ ] Validation report is included in the PR.
- [ ] Creative approval status is explicit and not inferred from technical success.
- [ ] Claude's scope is limited to technical integration of the supplied assets.

## 10. Decision rule

When a requirement is unclear, preserve the source files and stop for clarification. Do not invent missing layers, alter approved composition, fabricate folklore details, or silently change the visual direction. Prefer a clearly reported limitation over a technically convenient but artistically incorrect substitute.
