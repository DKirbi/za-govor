# Martin Krpan sprite asset review

**Status:** PROPOSED artwork for Game Director review. Not approved and not integrated.

## Included

- 24 separately exported, transparent gameplay frames at the game's inspected 48×48 frame size: idle, cudgel strike, two punches, salt sacks with the mare, boulder throw and Mesarica slash.
- A 96×48 two-frame sheet (`idle | cudgel impact`) matching the current game convention.
- A separate folk-art-style mare-lifting illustration. This is not a gameplay sprite and not the final Brdavs story card.
- High-resolution generated pose atlases, the separated frame exports, a repeatable export script, manifest and labeled review preview.

## Character and cultural notes

The visual identity follows the character document: broad hat, prominent moustache, practical vest, salt sack, limewood cudgel and Mesarica. It avoids generic fantasy armor and changes no damage or combat behavior.

Levstik's primary text describes Krpan carrying his mare and her load aside so the carriage can pass. The overhead mare-lifting pose is an artistic interpretation of the strength episode, not a literal pose specified by the passage. The rank-2 mare-and-salt animation is a gameplay presentation in the character specification; the mare is calm and does not attack.

The character document names the skills Lipov kij, Kmečka moč and Mesarica. The current progression design and game code use Zamah, Kobilica and Lipov kij. The frames are labeled by action and this pack does not decide how those skill names map onto one another.

## Technical notes

- Existing hero size is 48×48 per frame; the existing Krpan image is 96×48 with idle and attack frames.
- Generated atlases remain under `art/source/characters/martin-krpan/atlases/` as high-resolution source. Production exports are separated 48×48 PNG files under `art/exports/characters/martin-krpan/animations/`.
- The export script uses nearest-neighbor reduction, a shared 27-color palette, binary alpha and a consistent bottom baseline.
- The preview contact sheet is for review only. Each production frame is its own PNG.
- `art/exports/characters/martin-krpan/martin-krpan-v2.png` preserves the existing idle/attack strip layout for later implementation review; the current inline sprite is unchanged.
- No gameplay code, skill mapping, damage, targeting or behavior was modified.

## Review checklist

- Check readability at native 48×48 size, especially the two distinct punches and the mare/sack silhouettes.
- Review the proposed frame timing and sprite selection before Claude integrates them.
- Decide whether the overhead mare-lifting folk-art interpretation fits the collection and where it belongs.
- Keep the confirmed Brdavs story card separate from the mare-lifting illustration.

## Primary source

[Fran Levstik, *Martin Krpan z Vrha*](https://sl.wikisource.org/wiki/Martin_Krpan_z_Vrha).
