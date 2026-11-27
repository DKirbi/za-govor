# Art asset library

This directory is the canonical home for original visual assets created for **Za govor!**.

## Ownership and workflow

- **Visual creation and art direction:** GPT, under the Game Director's direction.
- **Approval:** Game Director.
- **Technical integration:** Claude. Claude must consume approved assets, not redraw, regenerate, or artistically reinterpret them.
- A PR should reference exact repository paths and include a manifest describing each supplied asset.

## Directory layout

- `source/` — original, high-quality source artwork and separated layers.
- `exports/` — game-ready exports, optimized only where needed for runtime.
- `manifests/` — per-asset-pack metadata, layer order, dimensions, transparency, intended use and approval state.

Benchmark for the next packs: `docs/art-benchmarks/region-backgrounds/README.md` (region backgrounds). Heroes and enemies keep simple pixel sprites (Game Director, 25 Nov 2026); the hero sprite-pack convention (`docs/art-benchmarks/hero-sprites/README.md`) is superseded, and Krpan's high-fidelity sprite pack was discarded completely on 27 Nov 2026 (Game Director): its files are gone from `characters/martin-krpan/` (Git history: `main` at 99c2d99). Only his folk art (the painted skill cards and the mare-lift illustration) stays there.

Keep each asset pack in its own named subdirectory (for example `source/environments/ptuj/` and `exports/environments/ptuj/`). Do not flatten unrelated art packs into one directory.

## Binary asset commits (Git Data API)

For image and other binary files, use GitHub's Git Data API rather than PR attachments:

1. Read the current target branch commit and its tree SHA.
2. Create one Git blob per binary file using `POST /repos/{owner}/{repo}/git/blobs` with:
   - `encoding: "base64"`
   - `content: "<base64-encoded file bytes>"`
3. Create a tree based on the current branch tree. Add each file with its exact path, `mode: "100644"`, `type: "blob"` and returned blob SHA.
4. Create a commit whose parent is the current branch head, then update the feature branch ref to that commit.
5. Open or update the PR with links to the committed files and manifest.

**Important:** Base64 must be produced from the original file bytes. Never encode a screenshot, thumbnail, preview crop or re-rendered substitute and describe it as an original layer. Verify the committed file by fetching its blob and checking its size/hash where possible.

For now, use ordinary Git blobs for reasonably sized PNG/JPG assets. If source files or layered exports become large enough to make repository history unwieldy, propose Git LFS before introducing it; do not silently switch storage systems.

## Asset quality and review

- Preserve original dimensions, transparency and pixel edges.
- Do not upscale pixel art with smoothing.
- Keep source artwork separate from runtime exports.
- Include a manifest for every pack; record dimensions, color mode, alpha, file format, intended layer order, tiling behavior and approval status.
- Do not mark an asset approved or production-ready until the Game Director has reviewed it.
- A technical preview is not a substitute for the actual individual game assets.
