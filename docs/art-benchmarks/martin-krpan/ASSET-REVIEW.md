# Martin Krpan sprite asset review

**Status:** The original pack remains in review. The running, victory and downed poses below were approved for this PR and generated as separate production frames. They are not integrated into runtime animation logic.

## Included

- 33 separately exported, transparent gameplay frames at the game's inspected 48×48 frame size: the original 24 frames plus four running, four victory and one downed frame.
- A 96×48 two-frame sheet (`idle | cudgel impact`) matching the current game convention.
- A separate folk-art-style mare-lifting illustration. This is not a gameplay sprite and not the final Brdavs story card.
- High-resolution generated pose atlases, the separated frame exports, repeatable exporters (`tools/export_martin_krpan_frames.ps1` for the full pack and `tools/export_martin_krpan_states.py` for the added states), manifest, labeled review preview and a browser animation preview.

## Character and cultural notes

The visual identity follows the character document: broad hat, prominent moustache, practical vest, salt sack, limewood cudgel and Mesarica. It avoids generic fantasy armor and changes no damage or combat behavior.

Levstik's primary text describes Krpan carrying his mare and her load aside so the carriage can pass. The overhead mare-lifting pose is an artistic interpretation of the strength episode, not a literal pose specified by the passage. The rank-2 mare-and-salt animation is a gameplay presentation in the character specification; the mare is calm and does not attack.

The character document names the skills Lipov kij, Kmečka moč and Mesarica. The current progression design and game code use Zamah, Kobilica and Lipov kij. The frames are labeled by action and this pack does not decide how those skill names map onto one another.

## Technical notes

- Existing hero size is 48×48 per frame; the existing Krpan image is 96×48 with idle and attack frames.
- Generated atlases remain under `art/source/characters/martin-krpan/atlases/` as high-resolution source. Production exports are separated 48×48 PNG files under `art/exports/characters/martin-krpan/animations/`.
- The export script uses nearest-neighbor reduction, a shared 27-color palette, binary alpha and a consistent bottom baseline.
- The preview contact sheet is for review only. Each production frame is its own PNG.
- Running is an approved four-frame loop: left-foot contact, compression, right-foot contact, opposite compression. Krpan keeps the salt sack secured and carries the cudgel in its existing hand.
- Victory is an approved four-frame one-shot: settle into stance, raise a bare fist, hold, return to stance. He is unarmed throughout.
- Downed is an approved static kneeling pose: one knee down, other boot planted, head bowed, sack on his back and cudgel resting tip-down beside him.
- `animation-preview.html` plays the running and victory frames and holds the downed frame. It is a review tool and is not loaded by the game.
- `art/exports/characters/martin-krpan/martin-krpan-v2.png` preserves the existing idle/attack strip layout for later implementation review; the current inline sprite is unchanged.
- No gameplay code, skill mapping, damage, targeting or behavior was modified.

## Proposed roster benchmark

These three approved Martin Krpan states establish a **proposed** benchmark for a future roster-wide sprite convention. This PR adds no other character assets and does not imply approval of any other character's poses or artwork. Runtime state integration remains open because the current renderer exposes only the existing idle/attack strip and down-state filter.

## Review checklist

- Check readability at native 48×48 size, especially the two distinct punches and the mare/sack silhouettes.
- Review pixel readability and source/export alignment. Pose choices are approved; runtime timing and integration remain open.
- Decide whether the overhead mare-lifting folk-art interpretation fits the collection and where it belongs.
- Keep the confirmed Brdavs story card separate from the mare-lifting illustration.

## Primary source

[Fran Levstik, *Martin Krpan z Vrha*](https://sl.wikisource.org/wiki/Martin_Krpan_z_Vrha).
