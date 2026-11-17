# Claude handoff — visual asset benchmark: Spirits + Ptuj background

> **Status:** READY FOR CLAUDE TO START — production brief, not creative approval  
> **Owner / final authority:** Game Director  
> **Prepared by:** GPT — art direction and production planning  
> **Target:** first reviewable visual benchmark for spirit/status visuals and a layered battle background  
> **Related:** `docs/art-benchmarks/ART_PRODUCTION_BENCHMARK.md`

---

## 1. Assignment

Claude, treat this as the next production task. The Game Director is waiting for actual visual files, not another documentation-only PR.

Build a small, reviewable art benchmark that demonstrates that the current project can produce consistent, readable, technically usable gameplay art.

The benchmark has two workstreams:

1. **Spirit benchmark:** a real transparent PNG visual for the spirit currently described in Kurent's *Pregon zime* effect, with editable source and a preview in context.
2. **Background benchmark:** a real layered Ptuj battle-background prototype with exported PNG layers, an assembled preview and a way to inspect the composition/depth.

This is a benchmark, not approval to redesign the roster, invent new mechanics, or replace current production art. Keep all outputs isolated from production assets until the Game Director approves them.

## 2. What is supplied — use these repository sources

No new external image files are attached to this handoff. The starting material is the existing repository and its implementation.

Read these first:

- `docs/art-benchmarks/ART_PRODUCTION_BENCHMARK.md` — shared process and QA gates.
- `README.md` — current prototype architecture, art pipeline, engine roadmap.
- `docs/concept-summary.md` — project identity, art direction and current product scope.
- `docs/characters/README.md` — character documentation conventions.
- `docs/characters/kurent/character.md` — confirmed Kurent identity and *Pregon zime* visual behaviour.
- `docs/characters/kurent/sprites/README.md` — existing Kurent gameplay sprite direction.
- `docs/characters/kurent/references/README.md` — folklore research leads and cautions.
- `docs/combat-system.md` — shared combat/status communication rules.
- `tools/art_extra.py` and `src/art-extra.js` — existing generated pixel-art pipeline and assets.
- `src/game.js` — current prototype sprite usage, rendering scale and runtime composition.

Also inspect the current Ptuj staging/depth specification and its status before using it. Check the current branch and main; do not assume an old closed PR is current implementation. PR #23 was a staging specification, not finished art.

### Important technical facts already documented

- The browser prototype is a plain JavaScript application; it is not a Godot implementation yet.
- Current gameplay art is generated with Python/Pillow and embedded into JavaScript as PNG data URIs.
- `tools/art_extra.py` documents 48×48 hero frames, two-frame sheets (idle | attack), and 384×120 journey backgrounds with ground beginning around y=76. Verify the current implementation rather than assuming every asset category uses the same dimensions.
- `src/game.js` documents a 96×48 sheet for 48×48 idle/attack hero frames.
- The project roadmap targets Godot 4.7 with a 640×360 pixel base, but do not build or alter the Godot runtime as part of this art benchmark unless the current repository has since changed.
- Existing prototype art is a style reference, not automatically approved final art. Compare against it and report inconsistencies rather than silently replacing it.

If any of these facts conflict with current code, report the discrepancy and follow the current implementation only after documenting it.

## 3. Workstream A — Spirit visual benchmark

### Confirmed game-design facts

From `docs/characters/kurent/character.md`:

- Kurent's *Pregon zime* delays every enemy.
- An affected enemy displays a new spirit above its head for the remainder of the stun/delay effect.
- This spirit is a **gameplay visual indicator**, not a newly asserted folkloric creature.
- The current specification leaves open whether the spirit visual differs by affinity or uses one shared indicator.
- Enemy affinity must come from enemy data; do not infer it from appearance.

These are game-design constraints. Do not change them.

### Your task

1. Inspect how statuses, enemy heads, sprites, effects and draw order are currently rendered.
2. Locate the actual enemy sprite sizes and anchor/pivot conventions.
3. Identify the safest visual attachment point above an enemy without covering its face, attack telegraph, status UI or other important information.
4. Produce **two or three low-detail silhouette/blockout options** for the spirit indicator. Keep them clearly labelled as proposals, not approved folklore designs.
5. Recommend one option and explain the trade-offs: native-size readability, visual distinction from existing effects, overlap risk, animation cost and visual noise.
6. Stop for Game Director selection before polishing a full animation or introducing affinity-specific variants.
7. After direction is approved, produce the representative pixel-art frame and a short animation test only if the current implementation supports it cleanly.

### Deliverables

Place all work under a clearly isolated benchmark folder, for example:

```text
art/benchmarks/spirits/
  source/                 # editable source (Pillow script or other source format)
  exports/                # transparent PNG(s), no baked checkerboard
  previews/               # native-size, enlarged nearest-neighbour and in-context views
  manifest.json
  README.md
```

Use the existing repository naming conventions where possible. Confirm actual frame dimensions and sheet layout before exporting. The example tree is a proposed organisation, not a requirement to restructure the current project.

The preview must show:
- transparent asset on both light and dark/contrasting backgrounds;
- native-size appearance;
- enlarged nearest-neighbour view;
- at least one actual enemy/context mock-up with the indicator attached above the head;
- overlap with another status/effect if the current game can show them together.

Do not invent the final spirit lore, name, affinity colour mapping, gameplay effect or stacking rules.

## 4. Workstream B — Ptuj battle-background benchmark

### Existing direction to preserve

Use the current Ptuj battle staging specification and the shared art benchmark. The current Ptuj direction includes:

- hero group offset to the **left of composition centre**;
- environment remains visible on both left and right sides of the hero group;
- selective foreground overlap may reach the heroes' feet, but never above the ankle line;
- foreground overlap should be varied, not a continuous strip hiding every hero;
- foreground props remain static;
- foreground can be quieter / lower contrast, but do not apply a smooth photographic blur that breaks pixel-art edges;
- clouds and water/reflections are candidates for restrained animation;
- gameplay UI and word puzzle remain unobstructed.

Treat these as Ptuj-specific direction, not universal coordinates for every future location.

### Your task

1. Inspect current background assets, rendering code, viewport, camera behaviour and the actual battle composition. Do not use the journey-map background as if it were automatically a battle background.
2. Read the Ptuj staging guide and identify which constraints are already represented in code versus only described in documentation.
3. Build a composition blockout using the actual battle viewport and current hero/enemy sprite scale.
4. Preserve credible Ptuj geography. Use the existing location/reference notes and research where necessary. Do not invent a bridge, combine incompatible viewpoints or add landmark details without evidence.
5. Present a reviewable composition before polishing. Flag any unresolved viewpoint or landmark question rather than guessing.
6. After composition direction is approved, produce the layered pixel-art benchmark.

### Deliverables

Place work in an isolated benchmark folder, for example:

```text
art/benchmarks/ptuj-background/
  source/                 # editable layer sources / generation script
  exports/                # individual transparent PNG layers
  previews/               # composed image, layer breakdown and in-context view
  manifest.json
  README.md
```

Required visual output:
- composed Ptuj battle-background preview;
- each independently useful layer as its own PNG with transparency where needed;
- layer-order / exploded preview;
- hero staging overlay using current in-game sprite scale;
- UI-safe / gameplay-safe region marked in a separate review overlay (not baked into the art);
- preview at native viewport size and enlarged nearest-neighbour scale.

Do not create layers merely to inflate the file count. Each layer must have a reason to be separate: parallax, independent animation, foreground occlusion or runtime composition.

## 5. Style calibration — mandatory before detailed production

Compare benchmark work with existing project sprites and backgrounds. Document:

- actual pixel density and cluster size;
- outline thickness and edge treatment;
- palette size and colour ramps;
- light direction and contrast;
- native display scale and filtering;
- transparency quality;
- whether the asset reads at the actual gameplay viewport size.

Use hard-edged pixel-art methods consistent with the current Pillow pipeline unless you identify a concrete reason to recommend a change. Do not upscale smooth generated artwork and call it pixel art. No accidental anti-aliasing, blur, fractional scaling, halos or checkerboard baked into transparency.

Do not set new global sprite dimensions or import standards from guesswork. Derive them from the current project and record evidence.

## 6. Scope and safety rails

- Do not modify existing approved character art or production backgrounds.
- Do not overwrite `src/art-extra.js`, `src/game.js`, `tools/art_extra.py`, existing sprite sheets or runtime data as part of the first benchmark pass.
- Do not integrate experimental assets into the production game by default. Use a separate preview/harness or a clearly isolated developer-only route.
- Do not change gameplay, status timing, target selection, enemy affinity, hero positions, camera rules or UI layout.
- Do not silently resolve OPEN decisions. Record them and ask.
- Do not create final animation sets before the silhouette and style sample are approved.
- Keep source files editable and reproducible; do not deliver only flattened PNGs.
- If using generated imagery as a starting point, manually inspect and correct pixel clusters, anatomy, perspective, transparency and consistency. A generated image is not automatically production-ready.
- No new folklore claims without traceable sources.

## 7. Required PR contents

Create a **new draft PR** from the current main branch. Do not add this work to the documentation-only PR #24.

The PR should contain:

1. This benchmark's actual source files.
2. Exported PNG assets (not just SVG diagrams or Markdown).
3. A README explaining how to regenerate / inspect the assets.
4. A manifest with dimensions, frame layout, pivots/anchors, z-order, palette/reference, intended scale and status.
5. Preview images showing native size, enlarged view and in-context composition.
6. A short QA report against the checklists in `ART_PRODUCTION_BENCHMARK.md`.
7. A list of open questions / decisions needed from the Game Director.

Keep the PR reviewable. If the first silhouette or composition requires creative approval, make that a clear checkpoint and do not present the unfinished work as final art. The PR may contain blockouts and draft exports, but label them accurately.

### Suggested PR title

`Create first spirit and Ptuj background visual benchmarks`

### Suggested PR description

State clearly:
- what actual PNG/source files were produced;
- which parts are blockouts versus polished samples;
- which constraints were verified against implementation;
- how to view the previews;
- what decisions are required from the Game Director;
- what is deliberately not integrated or approved.

## 8. Review checklist

Before requesting review, confirm:

- [ ] Current implementation and existing art were inspected.
- [ ] Current Ptuj staging guide and its status were checked.
- [ ] Spirit is represented as a functional gameplay indicator, not asserted folklore.
- [ ] Spirit silhouette reads above an enemy at native scale.
- [ ] Spirit does not obscure face, attack telegraph, status UI or word puzzle.
- [ ] Background composition follows the Ptuj-specific staging direction.
- [ ] Geography / viewpoint claims are sourced or explicitly marked uncertain.
- [ ] Pixel density and outline style are compared with existing assets.
- [ ] PNG alpha is clean; no checkerboard or matte fringe.
- [ ] Each layer has a documented runtime or review purpose.
- [ ] Preview includes native-size and in-context views.
- [ ] Editable sources and manifest are included.
- [ ] No existing production asset or game-design behaviour was changed.
- [ ] Open decisions are clearly listed.
- [ ] Draft status is used until Game Director approval.

## 9. What to report back

In the PR description and review summary, use this structure:

1. **What I inspected** — exact files and implementation paths.
2. **What I produced** — exact source and export paths.
3. **What is verified** — dimensions, anchors, layer order, rendering constraints.
4. **What is only proposed** — silhouettes, composition details, artistic interpretation.
5. **What remains open** — questions requiring the Game Director.
6. **Recommendation** — your preferred option and why, including trade-offs.

Think like a small indie studio: test early at actual game scale, keep the pipeline reproducible, avoid polishing the wrong thing, and explain the reasoning so the Game Director can learn from the process.

**Start with the repository audit and reviewable blockouts. The goal is to get real visual files into the next PR, not to write another process document.**
