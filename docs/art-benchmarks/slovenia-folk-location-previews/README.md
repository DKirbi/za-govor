# Slovenian folk-style location previews

Three local art-direction concepts extend the treatment documented in [the Ptuj folk-card and background guide](../ptuj-folk-style-preview/README.md). Each panorama is shown by itself and with actual idle-frame game sprites composited over it. These are previews only: no production art manifest, runtime scene, or character sprite has been changed.

## Peca

![Peca folk-art scene with Kralj Matjaž and Škrat](peca-folk-preview.png)

[Background only](peca-folk-background.png) · The campaign notes place Kralj Matjaž at Peca and list Škrat among the region's enemies. The art suggests the forested Karavanke and his cave beneath the mountain. [I feel Slovenia describes the sleeping-King Matjaž legend at Peca.](https://www.slovenia.info/en/press-centre/news-of-the-tourism-press-agency/6837-sleeping-king-and-peca-underground)

## Trnovski gozd

![Trnovski gozd folk-art scene with Martin Krpan and Volkodlak](trnovski-gozd-folk-preview.png)

[Background only](trnovski-gozd-folk-background.png) · A moonlit karst-forest path frames the campaign's Martin Krpan and its Volkodlak enemy. The landscape cue is the forested high karst plateau and doline of Trnovski gozd; see the [Natura 2000 Slovenia reference](https://natura2000.gov.si/fileadmin/user_upload/Dokumenti/natura2000inslovenia.pdf).

## Ljubljanica

![Ljubljanica folk-art scene with Zeleni Jurij and Povodni mož](ljubljanica-folk-preview.png)

[Background only, side-view version](ljubljanica-folk-background.png) · The river, historic embankment, side-on Triple Bridge and castle hill set up a scene with the existing Zeleni Jurij hero sprite and Povodni mož. **Zeleni Jurij is a visual stand-in:** the campaign chapter's hero is Peter Klepec, but his sprite is not present in the current game sprite sheet. The revised view makes the bridge arches visible from across the river. It remains an art-direction sketch, not a measured architectural elevation; the official landmark description identifies a central bridge with two pedestrian side bridges. See [Visit Ljubljana's bridge overview](https://www.visitljubljana.com/en/poi/triple-bridge).

## Shared art direction

- Continue the recent folk-card treatment: broad hand-painted shapes, dark confident contours, warm ochre, cream, russet and moss green, restrained board texture, and clear scene layers.
- Keep background forms spacious and readable, with open ground for the battle party and visible landmarks behind it.
- Use generated background art as a concept. Keep the game's existing sprites crisp, at integer scaling, and unchanged so the painterly versus pixel-art contrast remains clear.
- Each preview uses one hero and one enemy idle frame extracted from the current `src/game.js` sprite sheet, with small ground shadows. The selected frames and backgrounds are not split into production runtime layers.
- The scenic images are stylized illustrations, not surveyed reconstructions. They do not include parallax layers, water animation, finalized battle coordinates, or battle UI.

## Prompt set and generation

Built-in ImageGen generated each background as a wide 16:9, character-free Slovenian folk-board panorama, using the Ptuj preview and an approved folk skill card as style references. The scene prompts were:

- **Peca:** wooded Karavanke mountain, rocky foothill, and a small cave entrance suggesting King Matjaž's legend.
- **Trnovski gozd:** quiet moonlit woodland path, beech and fir silhouettes, high-karst doline and layered forested plateau.
- **Ljubljanica:** river-level side elevation with the Triple Bridge spanning horizontally, arch openings visible against the water, old-town facades and the castle hill behind it. A targeted view-angle revision produced the selected background.

## Next: parallax and mobile

These are reference images, not ready-to-ship game backgrounds. The next environment-art pass can separate sky, distant land, landmark silhouettes, river, embankment, and foreground into independently addressable layers; define calm parallax and ambient effects; and test mobile landscape and portrait crops against real battle UI and sprite sizes. Keep pixel sprites crisp and the staging area clear as those layers are assembled. No runtime layers, motion, or mobile layouts are implemented in this reference set.