# Martin Krpan sprite asset review

**Status:** The original pack remains in review. The running, victory and downed poses below were approved for PR #34 and are integrated for *Kakovost slik = Visoka*: running on the road, victory when the last enemy falls, the kneel while Krpan is down.

## Included

- 33 separately exported, transparent gameplay frames at the game's inspected 48×48 frame size: the original 24 frames plus four running, four victory and one downed frame.
- A 96×48 two-frame sheet (`idle | cudgel impact`) matching the current game convention.
- A separate folk-art-style mare-lifting illustration. This is not a gameplay sprite and not the final Brdavs story card.
- High-resolution generated pose atlases, the separated frame exports, manifest, labeled review preview and a browser animation preview. `tools/art_hero_pack.py` exports, packs and validates the pack (it replaced the two Krpan-only exporters in PR #34).

## Character and cultural notes

The visual identity follows the character document: broad hat, prominent moustache, practical vest, salt sack, limewood cudgel and Mesarica. It avoids generic fantasy armor and changes no damage or combat behavior.

Levstik's primary text describes Krpan carrying his mare and her load aside so the carriage can pass. The overhead mare-lifting pose is an artistic interpretation of the strength episode, not a literal pose specified by the passage. The earlier rank-2 mare-and-salt art is retained as historical material. The active Kmečka moč R2 sequence is the director-confirmed solo materialization and contains no horse.

The character document names the skills Lipov kij, Kmečka moč and Mesarica, and the game uses them since PR #34. Each sequence matches the animation the specification describes for a skill and rank; `data/hero-art.json` records the mapping.

## Technical notes

- Existing hero size is 48×48 per frame; the existing Krpan image is 96×48 with idle and attack frames.
- Generated atlases remain under `art/source/characters/martin-krpan/atlases/` as high-resolution source. Production exports are separated 48×48 PNG files under `art/exports/characters/martin-krpan/animations/`.
- Exports use nearest-neighbor reduction, a shared 27-color palette, binary alpha and a consistent bottom baseline (row 47).
- One scale per sequence: running and victory at the pack scale (0.0766 output px per source px), downed at 0.047 because its atlas is drawn about 1.63× larger (measured on the red hat band). Krpan stands about 35 px tall in every standing state. The first export fitted each new frame to 44 px on its own, which made him about a quarter larger when running or cheering and removed the run's bob.
- The preview contact sheet is for review only. Each production frame is its own PNG.
- Running is an approved four-frame loop: left-foot contact, compression, right-foot contact, opposite compression. Krpan keeps the salt sack secured and carries the cudgel in its existing hand.
- Victory is an approved four-frame one-shot: settle into stance, raise a bare fist, hold, return to stance. He is unarmed throughout.
- Downed is an approved static kneeling pose: one knee down, other boot planted, head bowed, sack on his back and cudgel resting tip-down beside him.
- `animation-preview.html` plays every sequence (written by the tool from the manifest). It is a review tool and is not loaded by the game.
- `art/exports/characters/martin-krpan/martin-krpan-v2.png` is the idle | attack strip; in *Visoka* it replaces the inline sprite on cards and portraits. *Samodejno* and *Nizka* keep the inline sprite.

## Proposed roster benchmark

These three approved Martin Krpan states establish a **proposed** benchmark for a future roster-wide sprite convention, written up in `docs/art-benchmarks/hero-sprites/README.md`. This PR adds no other character assets and does not imply approval of any other character's poses or artwork.

## Review checklist

- Check readability at native 48×48 size, especially the two distinct punches and the rank-2 materialization at the shared spirit scale.
- Review pixel readability and the in-game timing (running 0.5 s a loop, victory 0.8 s once, skills 0.72 s). Pose choices are approved.
- The kneel at the pack scale stands about as tall as idle, because the source pose is hunched under the sack. If he should read lower, that is a change to `downed.png`, not to the export.
- Decide whether the overhead mare-lifting folk-art interpretation fits the collection and where it belongs.
- Keep the confirmed Brdavs story card separate from the mare-lifting illustration.

## Primary source

[Fran Levstik, *Martin Krpan z Vrha*](https://sl.wikisource.org/wiki/Martin_Krpan_z_Vrha).
