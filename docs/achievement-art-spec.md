# Achievement icon art — Codex production brief

**Status:** visual specification and production instructions. No achievement icons have been approved or produced yet. The complete achievement list is in [achievements-design.md](achievements-design.md).

## Goal

Give every achievement a small, memorable symbol that can be read at a glance in *Dosežki in junaki*. The icons should feel like tiny keepsakes from the game's painted folk-art world: simple hand-painted emblems with the bold contours, worn pigment and warm wood character of the existing folk-art cards. They are interface symbols, not miniature scenes and not replacement story cards.

The current attack-card paintings are authored as compact SVG scenes in JavaScript, with a dark contour and a restrained worn-paint treatment. The small journey and item icons are hard-edged pixel art. For this achievement set, use a separate raster icon pack made with image generation: keep the painted surface of the folk-art cards, but reduce the content to one bold central motif. Do not copy a specific museum object or existing character-card composition.

## Art direction

- **Shape:** square 1:1 icon; one centered, unmistakable symbol inside a small painted wooden roundel or square plaque. Keep clear space around the silhouette.
- **Style:** hand-painted Slovenian folk-art / panjska končnica influence, with simplified folk geometry, slightly uneven dark-brown ink outlines, matte tempera-like color, subtle aged paint wear and restrained wood grain. It should feel handmade, not like a modern achievement badge pack.
- **Palette:** shared warm ivory, dark walnut, muted red, leaf green, river blue and soot black. Use only a few colors per icon. Reserve metal accents for the tier: copper/bronze, cool silver, or warm gold. The tier accent is a border, tiny rivets or a small highlight, never a large metallic gradient.
- **Scale:** create at 256 × 256 px with transparent pixels outside the emblem. Export at 64 × 64 px and confirm that the icon still reads at 32 × 32 px and 24 × 24 px.
- **Silhouette:** one main symbol, with at most two supporting shapes. Use large shapes, thick contours and generous negative space. Avoid tiny lettering, tally marks, complex scenery and fine facial detail.
- **Text:** no words, captions, numbers, logos or watermarks in the artwork. A letter may appear only when it is the symbol itself, and it must be a clean, deliberate Slovene glyph, not generated pseudo-text. Prefer objects and shapes for achievement counts.
- **Transparency:** preserve real alpha outside each emblem. No white checkerboard or baked-in UI background.
- **Consistency:** use the same emblem framing, contour weight, apparent scale, perspective and amount of wear throughout the pack. Bronze, Silver and Gold are tiers shown by the small edge accent, not three unrelated art styles.
- **Folklore care:** the icon may visualize a game achievement, but must not turn a proposed scene into a claim about a canonical folk tale. Follow the character briefs for story-card subjects. Mark unreviewed motifs as proposals in the manifest.

## Tier preview to approve first

Create a three-icon preview for these representative achievements. Show the symbols side by side on transparency, with even spacing and no text or labels; the tier is identifiable by its accent material and by the shared framing.

| Tier | Achievement | Preview motif |
| --- | --- | --- |
| Bronze | **Prva beseda** | One sturdy letter tile rising from a small carved wooden plaque, with a single spark above it. |
| Silver | **Šest črk** | Six connected letter tiles forming a short climbing path, with one cool silver inlay. Do not render readable letters. |
| Gold | **Slovar na nogah** | A small open book with a few letter-shaped leaves lifting like wings, framed by a warm gold edge. |

The preview tests the icon style and tier distinction, not final icon polish. Wait for the Game Director's review before producing the other icons or saving these previews as approved game assets. Do not use the preview sheet as a source to crop final icons.

## Complete icon subject list

Create one separate square image for every row below, including the three preview icons after their design is approved. These are visual cues, not text to put inside the icons.

### Wordsmith

| Achievement | Symbol cue |
| --- | --- |
| Prva beseda | Single letter tile on a wooden plaque. |
| Besedni tok | Three letter tiles flowing like a ribbon. |
| Živa zakladnica | Open chest with a few bright letter tiles spilling out. |
| Slovar na nogah | Open book with letter-shaped pages lifting like wings. |
| Zbiralec besed | A hand gathering several different letter tiles. |
| Tisoč obrazov | A full book surrounded by a dense but simple burst of different glyph-like marks. |
| Šest črk | Six linked letter tiles forming a path. |
| Dolga sapa | A long curling breath or wind trail carrying a sequence of tiles. |
| Č, Š, Ž — slovenski zaklad | Three distinct tiles with clear caron marks above their glyphs. |
| Brez ponavljanja | A small row of distinct tiles beside a crossed-out duplicate tile. |
| Dolga beseda, močan udarec | A long tile ribbon striking a simple enemy shield. |
| Beseda za boga | A clean lightning bolt touching one letter tile. |

### Folklore field notes

| Achievement | Symbol cue |
| --- | --- |
| Prva zmaga | A notched wooden shield with one simple monster claw mark. |
| Poznavalec pošasti | An open field notebook with a ring of varied monster tracks. |
| Volkodlakov strah | A wolf head with a bronze crescent accent. |
| Volkodlakova nočna mora | A wolf silhouette howling at a dark moon, with a silver crescent. |
| Vrtinec se poleže | A blue whirlpool opening around one quiet center. |
| Gospod reke | A river whirlpool crowned by a small gold reed crown. |
| Zmajeva tehtnica | One dragon scale with a bright ember edge. |
| Deset zmajev | A ring of overlapping dragon scales around a gold center. |
| Lovec na velikane | A small hero's spear and a fallen giant's footprint. |
| Niti besede zaman | A wolf paw beside one clear, unbroken word ribbon; no duplicate tiles. |

### The road and its trials

| Achievement | Symbol cue |
| --- | --- |
| Čez prvi prag | A stone threshold with a single footprint crossing it. |
| Do gradu | Ljubljana Castle silhouette on its hill. |
| Slovenija v besedah | A simplified Slovenia-shaped outline assembled from a few tiles. |
| Brez ovinka | A straight road through two hills, with no turning arrow. |
| Družina ostane skupaj | Four small figures sheltered beneath one shield. |
| Sam na poti | One footprint on a long, empty road. |
| Brez božjega daru | A closed shrine beside a plain walking staff. |
| Knjigoljubov izziv | A small bookworm curled over an open book. |
| Vse tri mere znanja | Three distinct books with simple easy, middle and hard visual marks (no words). |
| Šest znamenj | Six different god-sign silhouettes arranged around a shrine stone. |
| Shranjevalec skrivnosti | A chest with a glowing keyhole and one key. |
| Plaz pod nadzorom | A boulder split neatly by a small letter tile. |
| Mreža brez ran | An unbroken heart protected by a clean shield. |
| Vstani in govori | A hand helping a small figure rise, with one speech spark. |

### Meet the whole company

| Achievement | Symbol cue |
| --- | --- |
| Nova družba | One new hero silhouette joining a small group. |
| Vsi obrazi Slovenije | A wreath of nine simple folk-hero silhouettes or headwear shapes. |
| Stara božanstva | Six distinct god signs around one sun disk. |
| Zbrana druščina | Fifteen small portrait beads forming one complete circle. |
| Vsak ima svojo zgodbo | Nine footprints leading to one open story book. |
| Bogovi na poti | Six god signs above one shared road of footprints. |

### Final-battle story cards

For these 15 achievements, use a simplified emblem derived from the approved special story-card subject. Keep each icon distinctive at small size and keep the proper full story-card art for the collection view.

| Achievement / character | Symbol cue |
| --- | --- |
| Krpan premaga Brdavsa — Martin Krpan | Limewood cudgel crossed with a small sword. |
| Kurentovanje — Kurent | Kurent bells and one red ribbon. |
| Speči kralj pod Peco — Kralj Matjaž | A long beard curling once around a stone table. |
| Kameni zid — Ajdovska deklica | A calm stone face emerging from a mountain wall. |
| Predjamski grad — Erazem Predjamski | Predjama Castle nestled into a single cliff shape. |
| Kresna noč — Kresnik | A small bonfire with a turning fire wheel; verify motifs before final art. |
| Jurjevo — Zeleni Jurij | A leafy birch branch with a small horse bell. |
| Vilin dar — Peter Klepec | A young tree pulled up with its roots exposed. |
| Pesem z obale — Lepa Vida | A sea shell releasing three flowing wave lines; do not imply one canonical ending. |
| Nevihta nad gorami — Perun | Thunderbolt above a mountain ridge. |
| Nebeška kovačnica — Svarog | Anvil with one bright star-shaped spark. |
| Materina roka — Mokoš | Spindle, thread and one water drop. |
| Sončni voz — Dažbog | A simple sun disk above a two-wheel chariot. |
| Burja čez morje — Stribog | Wind streamer bending over one wave. |
| Korenine sveta — Veles | Horned stone with roots curling beneath it. |

### Final secret achievements

| Achievement | Symbol cue |
| --- | --- |
| Zlatorogova zapuščina | A golden chamois with branching horns above a mountain, surrounded by four tiny party silhouettes. |
| Zadnja beseda | One bright word tile with a caron mark striking a dragon fang. |

## Codex execution prompts

### Stage 1 — preview only

> Read `docs/achievement-art-spec.md`, `docs/achievements-design.md`, `art/README.md`, the relevant folk-art story-card briefs under `docs/characters/`, and the current painted-card implementation in `src/game.js`. Generate only the three tier-preview emblems named in this spec: Bronze **Prva beseda**, Silver **Šest črk**, and Gold **Slovar na nogah**. Show them side by side on transparency for review. Treat the image as a preview sheet only: do not crop it into production assets, save it into the art pack, generate the other 56 icons, or mark any asset approved. Stop and wait for the Game Director's feedback.

### Stage 2 — full pack, only after approval

> Re-read `docs/achievement-art-spec.md` and `docs/achievements-design.md`, then follow the approved preview direction. Create all 59 achievement icons in the complete icon subject list as independent transparent PNGs, including new individual production files for the three preview motifs. Use square hand-painted Slovenian folk-art emblems with a simple central silhouette, subtle worn pigment, dark walnut contours, a consistent small plaque frame, and a restrained tier-colored edge accent. Make each symbol distinct and legible at 24 × 24 px. Do not put achievement names or tier labels in the images. Do not create a contact sheet as the production source and do not crop final icons from a sheet. Preserve approved character story-card subjects; label proposed motifs in the manifest and do not introduce new folklore claims. Save full-quality sources under `art/source/achievements/`, 64 × 64 game exports under `art/exports/achievements/`, and a manifest under `art/manifests/achievements-icons.md`. Inspect each individual export at 64, 32 and 24 px, and report any motifs that still need art-direction review. Do not mark the pack APPROVED or IMPLEMENTED; the Game Director owns visual approval, and runtime wiring is a separate task.

## Pack layout and manifest

```text
art/
├── source/achievements/       # 256 × 256 transparent PNG originals, one per achievement
├── exports/achievements/      # 64 × 64 transparent PNGs used by the game
└── manifests/
    └── achievements-icons.md
```

Use stable lowercase slugs based on achievement IDs, such as `prva-beseda.png`, `sest-crk.png` and `slovar-na-nogah.png`. Record for every image: achievement name and ID, icon subject, source/export paths, dimensions, RGBA/alpha, format, any resizing or optimization, whether its subject is CONFIRMED or PROPOSED, and the approval state. Keep approved preview art and later production assets as separate files until the Game Director selects the direction.

## Review checklist

- Every catalog achievement has one independent image and one manifest row.
- The icon still reads at 24 × 24 px; its distinctive shape is not carried by tiny detail.
- Bronze, Silver and Gold look like one family with clear but restrained tier accents.
- The emblem has clean transparency and no baked-in checkerboard, label or backdrop.
- No accidental text, malformed pseudo-lettering, duplicate motifs or overly fine lines.
- Character and folklore subjects match their current briefs, and proposed subjects remain marked for review.
- Full story-card paintings remain separate from the achievement emblems.
