# Art production benchmark — characters, spirits and environments

> **Document status:** WORKING STANDARD v0.1 — intended to be edited collaboratively.
>
> **Authority:** The Game Director approves all creative and game-design decisions. This document defines the proposed production and quality-control process; it does not silently approve new character designs, lore, mechanics, camera layouts or visual changes.

## 1. Why this document exists

This is the shared production standard for creating and reviewing:
- playable heroes and other humanoid characters;
- folkloric creatures, enemies and spirits;
- character actions, skill effects, status effects and ambient spirit visuals;
- regional backgrounds, battle environments and overworld locations;
- environment props, foreground elements and animated environmental details;
- related gameplay illustrations, story cards and collectible artwork.

The goal is to catch avoidable problems **before** assets are polished, integrated or multiplied across the roster. A wrong silhouette, unsupported folklore detail, inconsistent sprite scale or unusable layer structure is much cheaper to fix in a brief than after a full animation set exists.

This process cannot guarantee that no mistake will ever occur. It is designed to make assumptions visible, validate high-risk details early, and prevent known categories of production error from reaching implementation.

## 2. Roles and decision authority

### Game Director — final creative authority
- Owns the game, its identity, gameplay, character interpretation and final approvals.
- Defines or approves game-design intent: what a character is, what a spirit does, what an environment should communicate, and how assets serve the experience.
- Resolves conflicts between proposals and existing decisions.
- Can intentionally choose a stylised or fictional interpretation, provided it is not mislabelled as documented folklore or geography.

### GPT — art direction, research and design review
Act as an experienced indie-game art director and design collaborator, not as an automatic image generator.
- Inspect existing project documentation, implementation and approved assets before proposing changes.
- Research folklore, history, architecture and geography where relevant.
- Translate the Game Director's intent into visual briefs and production specifications.
- Propose options, explain trade-offs, identify risks and challenge weak ideas constructively.
- Review outputs for visual coherence, readability, consistency and production readiness.
- Clearly separate verified facts, project decisions, artistic interpretation and suggestions.
- Never treat a proposal as approved or invent a missing game-design decision.

### Claude — implementation and technical production partner
Act as an experienced indie-game developer and technical artist.
- Inspect the current code, asset pipeline, engine constraints and existing art before implementation.
- Implement approved briefs faithfully and preserve working systems.
- Prepare source files, exports, atlases/sprite sheets, import settings and manifests as specified.
- Validate dimensions, transparency, pivots, animation timing, layering and runtime behaviour.
- Report blockers and ambiguities instead of silently choosing a creative solution.
- Do not replace approved art, change gameplay intent or make unapproved visual redesigns.

### Shared working principle

Think like a small indie studio: protect the player's experience, manage scope, build reusable pipelines, test early at actual game scale, and spend polish effort where it matters most. Explain *why* a recommendation is useful so the Game Director can learn the craft and make informed decisions.

## 3. Source of truth and status labels

Use this priority order:
1. Latest explicit decision from the Game Director.
2. Approved project specifications and decisions.
3. Current implementation and project documentation.
4. Earlier discussions and proposals.
5. New recommendations or assumptions.

Every meaningful decision or asset brief must use these labels where applicable:

- **CONFIRMED** — explicitly approved by the Game Director.
- **IMPLEMENTED** — present in the current project implementation; implementation does not automatically mean creative approval.
- **PROPOSED** — a recommendation awaiting approval.
- **OPEN** — a decision or fact that is not yet resolved.
- **SUPERSEDED** — replaced by a newer decision; retain the record where useful, but do not follow it.

If sources conflict, stop and surface the conflict. Do not silently reconcile it. When a new decision supersedes an old one, update the relevant document and record what changed.

## 4. Non-negotiable project identity

> **Current scope — CONFIRMED by the Game Director, 20 Nov 2026:** the art work now goes into **enriching the backgrounds** only. The **character designs stay as they are**: heroes, gods and enemies keep their current designs, sprites and cards. Do not brief, produce or integrate character redesigns unless the Game Director reopens them. Sections 6 (characters and spirits) stay as the standard for the existing assets and for any future work the Game Director approves.

### Gameplay art
- Modernised SNES/GBA-inspired pixel art for gameplay characters, spirits, enemies, props, environments and effects.
- Clear pixel clusters, strong silhouettes, controlled palettes and deliberate detail.
- Readability at the actual in-game render scale is more important than detail at enlarged preview size.
- No photographic imagery as final gameplay assets.
- No painterly rendering or smooth vector art masquerading as pixel art.

### Folklore and narrative artwork
- Traditional folk-art illustration for selected folklore stories, skill illustrations and collectible/narrative artwork.
- Panjske končnice are an important reference, not a template to copy mechanically.
- Keep this illustration track visibly distinct from gameplay pixel art.

### UI
- Restrained, functional UI with dark surfaces, gold accents and subtle ornament.
- Art must not obstruct the word grid, controls, enemy telegraphs, status information or important combat feedback.

## 5. The production pipeline — mandatory gates

Do not skip gates because a concept looks attractive. Each gate should produce a reviewable result and a clear decision.

### Gate 0 — Project and implementation audit

Before creating or changing an asset:
- Read the relevant character, enemy, combat, world, art and collaboration documentation.
- Inspect the current implementation and existing asset folders.
- Locate approved sprites, animations, backgrounds, UI screenshots and reference images.
- Identify actual runtime dimensions, scaling, anchor/pivot conventions, animation playback rules and import settings.
- Check whether a similar asset already exists and can be reused.
- Record what is confirmed, implemented, missing, open or superseded.

**Output:** short audit note with source paths, existing assets, technical constraints and unresolved questions.

**Stop if:** the relevant source of truth cannot be found, existing art may be overwritten, or a key implementation constraint is unknown.

### Gate 1 — Design brief

Write a concise brief before visual production.

For a character or spirit, define:
- identity and category (hero, enemy, spirit, boss, ambient entity, etc.);
- narrative purpose and intended player impression;
- gameplay role only where already approved;
- documented folklore / historical basis and regional context;
- what is authentic, what is interpretation, and what is original game fiction;
- required poses, states, attacks, effects and animation list;
- intended game screen, scale and viewing distance;
- required assets and explicit exclusions.

For an environment, define:
- exact location and the reason it appears in the game;
- documented geographical and architectural anchors;
- camera/viewpoint and intended season, time and weather;
- gameplay camera bounds and available composition space;
- hero/enemy staging, UI-safe zones and foreground depth;
- environment layers, parallax and animation candidates;
- required props and elements that must not appear.

**Output:** approved brief or a list of open questions.

**Stop if:** the brief requires GPT or Claude to invent gameplay behaviour, character identity, an unsupported folklore fact or a major composition decision.

### Gate 2 — Research and reference validation

Research is mandatory for culturally or geographically specific content.

Preferred source hierarchy:
1. Primary folklore collections, archival records, historical documents and archaeological / institutional records.
2. Scholarly publications and university research.
3. Museums, heritage institutions, national parks, municipalities and official cultural organisations.
4. Official tourism sources for practical location identity and viewpoints.
5. Reputable secondary publications.
6. General websites and social media only as leads, not as sole evidence for factual claims.

For each important claim, record:
- source title, author/institution and date;
- exact page, section or URL;
- the claim it supports;
- source type and reliability;
- regional or historical variant;
- contradictions or uncertainty.

For visual references, record what the image actually demonstrates: clothing, object construction, silhouette, architecture, terrain, vegetation, viewpoint or lighting. Do not use a reference image as proof of details it does not show.

**Research rules**
- Do not merge different regional variants into one supposedly authentic design.
- Do not turn uncertain theories about origins into facts.
- Do not present game skills, magical powers or invented combinations as folklore.
- For living traditions, treat cultural practice respectfully and avoid flattening local variation.
- For real locations, do not combine landmarks or viewpoints in a geographically impossible way for convenience.

**Output:** a small annotated reference board and a fact / uncertainty list.

**Stop if:** a defining visual feature or factual claim cannot be verified. Ask the Game Director whether to omit it, stylise it as fiction, or commission further research.

### Gate 3 — Silhouette and composition blockout

Create the simplest readable version first:
- character: silhouette, proportions, pose and key identifying objects;
- spirit/enemy: silhouette, scale, visual distinction and relation to the target;
- environment: large value masses, horizon, landmark placement, staging and depth planes.

Review at actual game size and in monochrome. Do not spend time on textures, tiny ornaments or final animation before the silhouette and composition work.

**Output:** one or more blockout options with a recommendation and trade-offs.

**Approval required:** Game Director approves the chosen direction before detailed production.

### Gate 4 — Style and technical calibration

Before producing a complete asset set, create one representative test:
- one idle frame or one key action pose for a character;
- one representative animation frame for a spirit/effect;
- one representative environment layer and a small composition crop for a background.

Check against existing project assets:
- pixel density and apparent pixel size;
- outline weight and internal contrast;
- proportions and visual scale;
- palette and colour ramps;
- edge treatment and cluster discipline;
- transparency and export behaviour;
- appearance at native size and on mobile.

Do not assume an image's nominal resolution defines its pixel density. A large canvas can contain small, inconsistent pixel clusters. Inspect the actual artwork.

**Output:** approved style calibration sample.

**Stop if:** the test does not match the project's existing art language. Fix the style before producing multiple frames or layers.

### Gate 5 — Production

Only after the brief, references, blockout and style calibration are approved:
- produce the complete asset set;
- keep layers and animation frames independently editable;
- preserve approved designs across all states;
- create only the requested variations;
- document any unavoidable deviation;
- do not add decorative details without a gameplay, readability or narrative purpose.

For generated or externally sourced artwork, treat the first output as a draft. Inspect and correct anatomy, perspective, object construction, pixel clusters, edge artefacts, transparency and consistency. Never assume a generated image is production-ready.

### Gate 6 — Asset QA and integration

Run the checklists in Sections 8–11. Integrate into the actual prototype/runtime or a faithful preview harness.

Review:
- native scale, not only enlarged images;
- desktop and mobile layouts;
- animation in motion and frame-by-frame;
- compositing order and transparency;
- overlap with UI, heroes, enemies and effects;
- performance and memory where relevant;
- still/reduced-motion presentation.

**Output:** asset pack, manifest, preview and QA report.

### Gate 7 — Game Director review and sign-off

Present:
- the final asset in context;
- separate layers / frames;
- references and any remaining uncertainties;
- what changed from the approved brief;
- known limitations and technical notes.

Mark each item **APPROVED**, **CHANGES REQUESTED** or **REJECTED**. Do not mark an asset final or reuse it as an approved reference until the Game Director approves it.

## 6. Character and spirit benchmark

### 6.1 Identity and readability
- The character must be recognisable from its silhouette before internal detail is visible.
- Key identifying objects must read at native gameplay size.
- Avoid unnecessary costume noise, excessive accessories and tiny details that disappear when scaled down.
- Distinguish characters that share a broad archetype through silhouette, posture, palette, costume and signature object — not colour alone.
- Preserve anatomy, limb count, joints, proportions and object attachment across frames.
- Equipment must be held, worn or attached plausibly and consistently.

### 6.2 Folklore authenticity
- Verify costume, masks, tools, weapons, ornaments and materials against regional references.
- Do not assume that a modern festival costume is identical to a historical version.
- Do not invent a traditional weapon or ritual object.
- If the source material does not specify appearance, state that the visual choice is an artistic interpretation.
- Separate the figure's documented identity from the game's original combat role.

### 6.3 Spirits and supernatural entities
- Decide whether the spirit is a character, enemy, summoned entity, status indicator, projectile, aura or ambient visual. These categories have different scale, readability and animation requirements.
- Define its relationship to the affected character or environment: attached, hovering, orbiting, emerging, travelling or appearing temporarily.
- A spirit used as a status indicator must remain readable without hiding the character's face, key equipment, attack telegraph or UI.
- Define attachment point, offset, facing, scale, duration, fade/exit behaviour and draw order.
- If several spirits can appear simultaneously, test overlap and visual clutter.
- Do not add folklore identity or lore to a purely functional visual effect unless researched and approved.

### 6.4 Character animation
Create an animation inventory from the approved design, not from a generic template. Typical candidates may include:
- idle;
- walk / travel;
- attack or skill actions;
- hit reaction;
- defeat;
- victory;
- status / disabled state;
- special transition or interaction.

Not every character needs every animation. The Game Director and existing game behaviour determine the required list.

For every animation specify:
- frame count and frame order;
- frame duration / FPS and total duration;
- loop or one-shot behaviour;
- start, anticipation, impact and recovery beats where applicable;
- root motion or fixed anchor;
- hitbox / effect timing if gameplay depends on it;
- return-to-idle behaviour;
- whether the animation can be interrupted;
- sound cue timing, if relevant.

**Consistency checks**
- Character size and pivot remain stable unless intentional movement is specified.
- No accidental one-pixel jitter, limb popping, disappearing accessories or inconsistent outlines.
- The weapon or held object does not teleport between frames.
- Impact frames communicate contact clearly.
- Effects do not obscure the character's defining silhouette.
- Loop seams are checked at normal speed and frame-by-frame.

## 7. Environment and background benchmark

### 7.1 Location and composition
- Use a credible real-world viewpoint or explicitly label the scene as a stylised composite.
- Preserve the recognisable geography and architectural hierarchy of the place.
- Identify foreground, middle ground and background before detailing.
- Establish a clear focal hierarchy: location identity first, combat readability second, decoration last.
- Leave negative space where gameplay requires it.
- Do not place a landmark merely because it looks attractive if it is geographically implausible from the chosen viewpoint.

### 7.2 Battle staging — current Ptuj direction

The following rules are **CONFIRMED for the Ptuj battle-background direction** and should be treated as the current reference unless the Game Director changes them:
- The hero group is offset to the **left of the composition centre**.
- There must still be visible environment space on both the left and right sides.
- The foreground may occasionally overlap only the very bottom of a hero sprite, never higher than the ankle line.
- Foreground overlap is selective, varied and not constant across all heroes.
- Foreground props are static.
- The foreground is visually quieter and may be subtly softened, but not with a strong smooth blur that destroys pixel-art edges.
- Clouds and water/reflections are suitable candidates for restrained animation.
- Gameplay UI and the word puzzle remain unobstructed.

These are Ptuj direction decisions, not automatically universal pixel coordinates for every future location. Reuse the principles where appropriate, then confirm the staging for each new environment against its actual gameplay layout.

### 7.3 Layering
Use separate layers when they provide actual production or runtime value. A typical conceptual stack may include:
1. sky / far atmosphere;
2. distant landscape;
3. major architecture or landmark silhouettes;
4. middle-ground structures and vegetation;
5. water or ground plane;
6. characters and combatants;
7. foreground props / occlusion elements;
8. gameplay UI.

The exact order depends on camera and scene composition. Do not flatten elements that need independent parallax, animation, occlusion or runtime placement.

For each layer record:
- filename and purpose;
- canvas size and visible bounds;
- alpha / transparency expectations;
- z-order;
- pivot / anchor;
- parallax factor and movement limits;
- animation status and loop details;
- whether it may overlap a character or UI;
- safe margins to avoid exposing empty edges during movement.

### 7.4 Parallax and environmental animation
- Use parallax to communicate depth, not to make every layer move.
- Far layers move less than near layers.
- Avoid exposing empty gaps at the edges during camera movement.
- Use seamless loops for continuous movement.
- Keep water, clouds, foliage and lights restrained; avoid visual noise.
- Do not animate static foreground props by default.
- Provide a still version for reduced-motion settings.
- Test motion behind actual character sprites and UI.

### 7.5 Pixel-art depth and focus
- Use palette, contrast, cluster size, silhouette overlap and controlled detail to separate depth planes.
- If the foreground needs softening, prefer a pixel-aware treatment and lower contrast/detail.
- Avoid Gaussian blur, photographic depth-of-field and smearing that makes pixel art look inconsistent.
- Keep foreground props legible as objects, but less visually dominant than combatants.

## 8. Pixel-art quality checklist

Before approval, check each item at native size and enlarged nearest-neighbour scale:

- [ ] Pixel density is consistent within the asset and with neighbouring assets.
- [ ] Edges use deliberate pixel steps; no accidental anti-aliasing or half-pixel softness.
- [ ] Clusters are intentional; no noisy single-pixel speckling without purpose.
- [ ] Outline thickness and contrast are consistent with the project style.
- [ ] Light direction and shadow logic are consistent.
- [ ] Palette is controlled; colours separate important forms.
- [ ] Silhouette remains readable against the actual game background.
- [ ] Small details survive at native size or have been removed.
- [ ] No stray pixels, halos, matte fringes or unintended background colour.
- [ ] Transparency is clean and does not contain a baked checkerboard.
- [ ] No unintended resampling, smoothing or fractional scaling.
- [ ] Asset remains legible on both desktop and mobile.

## 9. File, export and integration requirements

**Important:** Actual engine requirements must be read from the current project and implementation during Gate 0. The following are production principles, not invented fixed dimensions or import settings.

For every delivered asset, include:
- editable source file where available;
- final runtime export;
- exact canvas dimensions and visible-content bounds;
- colour mode and transparency details;
- pivot / anchor convention;
- intended scale and filtering mode;
- frame count, order, timing and loop mode for animation;
- z-order and attachment metadata where applicable;
- source/reference links and approval status.

### Naming
Follow the existing repository's lowercase, descriptive, hyphenated naming style. Keep names stable and meaningful. Do not introduce a new naming convention without documenting it.

Examples (illustrative only):
- `kurent-idle.png`
- `kurent-bells-01.png`
- `spirit-ghost-idle.png`
- `ptuj-clouds.png`
- `ptuj-foreground-props.png`

Do not assume these examples are the final naming scheme for the engine. Confirm atlas, animation and import conventions against the current implementation.

### Handoff manifest
Every multi-file asset delivery should include a manifest with:
- asset ID and display name;
- category and owning character/location;
- status and approval date;
- source files and exported files;
- dimensions, frame count and frame timing;
- pivot / anchor;
- z-order / attachment point;
- palette or palette reference;
- intended scale / filtering;
- animation and loop description;
- dependencies and known limitations.

## 10. Preview and review package

A review package should make it possible to judge the work without opening the source project.

For characters / spirits:
- sprite shown at native size;
- enlarged nearest-neighbour preview;
- transparent-background view and contrasting-background view;
- animation preview at intended speed;
- contact sheet with numbered frames;
- in-game screenshot or faithful battle mock-up showing scale and overlap.

For environments:
- full composed background;
- each independent layer shown separately;
- exploded layer order;
- parallax / animation preview;
- hero staging overlay;
- UI-safe area and occlusion boundary;
- actual gameplay screenshot or faithful viewport mock-up.

Do not use a polished presentation sheet to conceal weak production assets. The review must include the actual files that will be integrated.

## 11. Common failure modes — reject or fix before handoff

- Wrong or unverified folklore costume, weapon, object, symbol or regional variant.
- A generic fantasy design with folklore decoration pasted on top.
- A character that cannot be recognised at native size.
- Different pixel densities or outline weights within one sprite set.
- Inconsistent anatomy, proportions, pivots or object positions between frames.
- An animation that looks acceptable as a still but jitters, pops or has a broken loop.
- A background that is attractive but geographically implausible.
- A composition that centres the heroes when the approved staging is offset.
- Foreground props that cover a hero above the ankle line or obscure combat readability.
- Foreground plants and props animated against the current static-foreground direction.
- Blur or smoothing that destroys the pixel-art language.
- Layers flattened despite needing independent movement or occlusion.
- Missing transparency, incorrect export dimensions or undocumented import settings.
- A concept image presented as if it were a finished, editable asset pack.
- Claude or GPT silently resolving an open game-design decision.

## 12. Review language and learning

When presenting a proposal or critique, use this structure:

1. **What I see:** objective description of the current asset or problem.
2. **Why it matters:** player experience, readability, folklore accuracy, production cost or technical risk.
3. **Recommendation:** the smallest effective improvement.
4. **Trade-off:** what the recommendation improves and what it may cost.
5. **Decision needed:** only if the Game Director's authority is required.

Explain specialist terms in plain language when first introduced. Examples:
- **Silhouette:** the outer shape that makes a character recognisable.
- **Pivot / anchor:** the point around which an asset is positioned or rotated.
- **Parallax:** background layers moving at different speeds to suggest depth.
- **Occlusion:** one visual element partially covering another.
- **Sprite sheet / atlas:** a texture containing multiple animation frames or sprites.
- **Native scale:** the size at which the asset is actually displayed in the game.

Do not overwhelm the Game Director with unnecessary jargon or ask for decisions that can be safely resolved by checking existing documentation and implementation.

## 13. Definition of done

An asset is **production-ready** only when:
- its brief and relevant creative direction are approved;
- folklore and geographical claims have traceable references or are clearly labelled as interpretation;
- its silhouette and style calibration are approved;
- technical constraints have been checked against the actual project;
- final source and runtime exports are present;
- animation, transparency, pivots, layering and native-scale readability pass QA;
- it has been previewed in the actual game or a faithful harness;
- the manifest and review package are complete;
- the Game Director has approved the final result.

A concept, prompt, mock-up, generated image, SVG sketch or benchmark preview is **not** automatically a production-ready asset.

## 14. Change log

| Version | Status | Change |
|---|---|---|
| 0.1 | WORKING STANDARD | Initial shared pipeline and quality gates for characters, spirits and environments. |

---

## 15. Open questions for future revisions

Keep this section updated rather than guessing:
- Exact engine/runtime asset dimensions and import settings for every asset category.
- Shared character sprite scale, pivot and animation conventions, once verified from implementation.
- Standard spirit attachment points, sizing and stacking rules.
- Standard environment viewport and parallax movement bounds per game mode.
- Whether the project needs a reusable palette reference / colour ramp library.
- Preferred editable source formats and export automation.
- Required accessibility checks beyond reduced-motion still presentation.
