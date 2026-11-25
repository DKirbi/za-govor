# Folk skill card art spec

**Status:** Visual direction confirmed by Game Director; current images are generated concept drafts awaiting individual art approval.

## Goal

Create one image for each reviewed character skill: 15 standalone images across Ajdovska deklica, Erazem Predjamski, Kralj Matjaž, Kresnik and Kurent. Each card shows one immediately readable action and retains the established Za govor! folk-card design.

## Visual reference and degree of change

Use the existing card illustrations visible in [`battle-desktop.png`](../images/battle-desktop.png) as the primary style reference. Preserve their compact, hand-painted panjska končnica character: flat color areas, clean silhouettes, clear dark outlines, modest surface texture, restrained background detail and warm folk colors. Improve clarity and finish slightly while keeping the current design recognisable. Do not turn the cards into ornate gallery paintings, high-detail realism, cinematic scenes or modern fantasy splash art. Avoid elaborate floral frames and heavy wood grain.

At the current battle UI size, the character, action and one key prop must remain readable. Keep backgrounds subordinate. Use landscape framing consistent with the battle cards, unless the existing renderer or Game Director approves a different ratio.

## Required subjects

| Character | Skill | Required single-scene subject |
|---|---|---|
| Ajdovska deklica | Metanje skal | Giantess throws a stone on a snowy alpine pass. |
| Ajdovska deklica | Varstvo popotnikov | Giantess guides lost travellers through mountain snow. |
| Ajdovska deklica | Okamnitev | A foe turns to stone; echo the Prisank stone-face tradition without inventing folklore. |
| Erazem Predjamski | Zamah z mečem | Direct sword strike, with Predjama setting suggested simply. |
| Erazem Predjamski | Češnje | Erazem tosses cherries at besiegers; small companion healing is game fiction. |
| Erazem Predjamski | Skrivni rov | Erazem emerges from a credible karst passage, ready to counterattack. |
| Kralj Matjaž | Meč | Grounded sword strike; maintain the king's established prototype cues. |
| Kralj Matjaž | Kraljeva vojska | King rallies loyal soldiers; show their response and readiness. |
| Kralj Matjaž | Prebujenje | King and company awaken; a winter linden may begin to leaf. |
| Kresnik | Flaming sword (working label) | Kresnik strikes with a flaming sword; keep him distinct from Perun. |
| Kresnik | Kresna strela | Fire bolt hits a foe and chains to one adjacent foe. |
| Kresnik | Restorative skill (working label) | Kresnik recovers after a blow; any gold reward is separate game fiction. |
| Kurent | Ježevka | Recognisable Kurent attacks with the hedgehog-skin staff. |
| Kurent | Zvonci (working label) | Kurent shimmies and jumps; large bells visibly ring. |
| Kurent | Pregon zime | Three Kurents dance around snow as it begins to recede. |

## Folklore and design boundaries

- Treat battle effects as game interpretation, not folkloric claims.
- Keep Erazem's cherries and hidden passage rooted in the popular siege legend; do not imply every detail is verified history.
- Use Matjaž's crown, beard, red cloak and sword as existing game design cues. Do not add arbitrary magical armour or symbols.
- Keep Kresnik distinct from Perun; do not add unverified fern-flower or burning-wheel motifs.
- Represent Kurentovanje as a living tradition and preserve locally recognisable kurentija. Do not add unverified ritual claims.
- Preserve differences among character lore variants; do not merge separate traditions for convenience.

## Deliverables and review

- One independent PNG per skill, never a triptych/contact sheet as the deliverable.
- Store original generated masters under `art/source/characters/<character>/folk-art/skills/<skill>/`.
- Keep the character documentation index updated with links to exact files.
- Record source dimensions, color mode, alpha, file format, intended use and approval status in `art/manifests/folk-skill-cards.json`.
- Current files are concept drafts. Do not call them approved, production-ready or integrate them into runtime until the Game Director reviews the individual images.
- Do not crop panels out of the earlier triptychs. The current standalone images were generated as independent scenes.
