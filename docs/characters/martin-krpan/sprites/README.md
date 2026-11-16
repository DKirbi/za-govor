# Martin Krpan — sprite and animation specification

**Status:** Existing sprite is IMPLEMENTED. Additional animation states and frame counts below are PROPOSED, not approved.

## Existing asset

- Sprite key: `krpan`
- Source: generated `SPRITES` data in `src/art-extra.js`
- Current embedded image dimensions: inspect the decoded source before assuming frame layout.
- Generator: `tools/art_extra.py`

Do not overwrite the existing sprite. Do not edit `src/art-extra.js` by hand. If an asset change is approved, update the generator/source asset and regenerate through the existing pipeline.

## Visual constraints

- Preserve the existing silhouette, proportions, hat, moustache, cream shirt, brown vest, red sash, dark trousers, salt sack and linden club.
- Keep the existing project's pixel density, outline weight, palette logic and character scale.
- Character faces right in the current battle composition unless the renderer explicitly flips the sprite.
- Keep feet aligned to one consistent ground baseline across frames.
- Transparent background; no baked-in scenery, UI, card frames or ground shadows that duplicate the scene renderer.
- The linden club remains a separate readable silhouette. Do not substitute an axe or cleaver.

## Proposed animation set

These states are an animation-production proposal only. Match frame counts to the actual renderer and performance budget rather than treating the counts as approved.

| State | Purpose | Motion direction |
|---|---|---|
| Idle | Default standing pose | Small breathing/bob; club and sack settle subtly |
| Walk | Journey movement | Alternating footfalls, modest body/sack follow-through |
| Attack | Normal word attack | Readable wind-up, one decisive linden-club swing, recovery |
| Skill 1 — Zamah | Tier-1 skill presentation | Stronger/clearer version of the normal club swing; no invented extra weapon |
| Skill 2 — Kobilica | Tier-2 skill presentation | Hold until the exact object/action in the current design is clarified; see folk-art README |
| Skill 3 — Lipov kij | Tier-3 skill presentation | Major club action against Brdavs; keep boss-stun feedback separate from the character sprite |
| Hurt | Damage feedback | Short recoil; preserve facing and ground contact |
| Victory | Battle win | Brief triumphant pose using the club; no new equipment |

## Layering and implementation guidance

1. Keep character body, held club, attack arc and impact particles separable where practical.
2. Prefer a small number of purposeful frames over noisy, overly fluid motion.
3. Do not bake attack arcs or impact flashes into idle/walk frames.
4. Animation effects must stay in the scene layer and must not obscure the word grid or controls.
5. Respect shared combat rules in `docs/combat-system.md`: actions and statuses are separate. A skill animation is an action; boss stun is a gameplay status/effect and needs its own state communication.
6. Reuse existing timing/state conventions in the current prototype before adding a new animation controller.

## Review checklist

- [ ] Matches existing Krpan sprite and silhouette.
- [ ] Club reads as a wooden linden club, not a blade.
- [ ] Salt sack remains visible where appropriate.
- [ ] Feet do not slide between frames.
- [ ] Attack direction and impact timing are legible.
- [ ] Effects do not cover puzzle interaction.
- [ ] Sprite scale is consistent with current game assets.
