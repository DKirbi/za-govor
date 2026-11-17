# Ptuj parallax background — Claude implementation handoff

**Status:** Draft handoff. The attached preview is a visual target, not a set of exported production layers.
**Visual author:** GPT
**Technical implementation/integration:** Claude
**Final approval:** Game Director

## Preview

The intended reference image is the Ptuj parallax asset-pack preview supplied with this task. It shows the overall composition, eight proposed layer categories, a palette and suggested relative motion. Do not treat its infographic panels, labels, checkerboard thumbnails or technical numbers as game assets.

> The preview image must be committed alongside this document as `ptuj-parallax-preview.jpg` before implementation begins. If it is not present in this branch, stop and request it rather than substituting or generating a new image.

## Responsibilities

Claude is **not** being asked to create, redraw, regenerate or artistically reinterpret the Ptuj artwork. Claude's task is to:
- inspect the current repository, viewport, camera and rendering pipeline;
- prepare/import the supplied artwork as game-ready resources;
- implement parallax movement and any required tiling/repetition;
- build an isolated preview/test scene and report technical limitations.

GPT owns the visual asset creation. The Game Director owns final approval.

## Scene and layer intent

The preview proposes these conceptual layers, back to front:

1. **L7 — Sky:** broad sunset gradient and sun; effectively stationary.
2. **L6 — Distant hills:** far mountain silhouette; very slow movement.
3. **L5 — Castle hill:** wooded rise and Ptuj Castle; slow movement.
4. **L4 — Town:** historic town silhouette; moderate movement.
5. **L3 — Reflections:** town lights/reflections on water; subtle loop or movement coordinated with water.
6. **L2 — Drava water:** calm horizontal water surface; subtle seamless animation if supported.
7. **L1 — Foreground road/path:** the player's near-ground travel surface; moves fastest and must tile seamlessly.
8. **L8 — Clouds:** separate sky overlay; slow seamless drift.

The exact render order of clouds should be checked against the visual reference; clouds sit in front of the sky but behind landscape silhouettes.

## Critical road and parallax requirement

The foreground road/path must be designed as a **long, simple, horizontally tileable strip**, not a short decorative patch.

- It should repeat seamlessly as the party runs.
- It should have enough visual variation to communicate movement without busy detail.
- The road should move noticeably faster than town, castle hill and distant hills.
- Avoid unique landmarks, large stones, flowers, fences or other one-off props at tile boundaries.
- Keep foreground decoration sparse and low enough not to obscure characters.
- The road/path should remain visually coherent across repeated tiles; no visible seams, sudden perspective shifts or pattern jumps.

When the characters run, the ground should provide the strongest movement cue. The background should move much less:
- foreground road: fastest;
- water/reflections and town: moderate/subtle;
- castle hill and distant hills: slow;
- sky: stationary or near-stationary;
- clouds: independent slow drift.

These are **relative design intentions**, not fixed pixel-per-second values. Derive actual speed ratios from the current camera and movement implementation, then document the values and expose them as tunable parameters. Do not hardcode the sample speeds shown in the infographic without validating them.

## Hero staging and depth

- Do not add an “Območje junakov” marker, overlay or reserved zone to the artwork.
- Hero placement belongs to the battle layout, not the background.
- Party members may stand closer together; do not enforce excessive gaps.
- Preserve the approved Ptuj composition and visible environment around the party.
- Foreground overlap may reach the ankle line at most. Never cover torso, head, hands, weapon or readable action.
- Foreground props remain static unless the Game Director explicitly approves otherwise.

## Technical tasks

1. Audit current background dimensions, scaling/filtering, camera movement, viewport and asset loading.
2. Identify whether the existing renderer supports independently scrolling layers and seamless horizontal wrapping.
3. Import the supplied original visual files without altering their appearance. Preserve alpha where present.
4. If the source art does not contain a clean tileable road or independently usable layers, report exactly what is missing. Do not fabricate replacement art.
5. Implement an isolated parallax preview/harness; do not change production gameplay or replace existing backgrounds.
6. Test a long run cycle: check for visible seams, discontinuities, drift, jitter and distracting motion.
7. Provide controls or config values for relative layer speeds where practical.
8. Include a still/paused preview and reduced-motion-friendly presentation.
9. Document exact asset dimensions, filtering mode, tile width, wrap method, parallax ratios and any cropping/scaling applied.
10. Keep the PR draft until Game Director review.

## Acceptance checklist

- [ ] Preview image is committed beside this handoff.
- [ ] Original artwork is used; no regenerated substitute.
- [ ] No hero-zone overlay exists.
- [ ] Party spacing is not artificially forced wide.
- [ ] Road is long, simple and seamlessly tileable.
- [ ] Road scroll is the strongest movement cue during running.
- [ ] Background layers move progressively less with depth.
- [ ] No visible seams during extended horizontal movement.
- [ ] Foreground never occludes characters above ankle level.
- [ ] Actual runtime viewport and scaling are verified.
- [ ] Implementation is isolated from production gameplay until approval.
- [ ] Technical constraints and open art requirements are reported clearly.

## Important scope boundary

This PR is for the Ptuj background and its parallax implementation only. **Martin Krpan spirits belong in the next separate PR.**
