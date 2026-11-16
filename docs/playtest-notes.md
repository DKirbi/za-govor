# Za govor — playtest notes

## Round 3 (13–16 Nov 2026, two testers on Android phones)

Both testers started playing without reading the intros, so the rules that matter also have to
live in the puzzles themselves. What changed is in the CHANGELOG (0.10.0) and
`docs/progression-design.md` §11.

### What testing found
1. **Sending a tapped word** (both testers): one couldn't send at all; the other expected the
   last tap to send, but also said auto-send would take a shorter word too early.
2. **The crossword on a phone**: no entry solved; the in-game keyboard is the weak spot.
3. **Chests** served the same two words every time.
4. **Buttons below the fold** on hero screens; **reading is tiring** on a phone.
5. Smaller things: the pause button not found, no warning which puzzle waits, two *Pošlji*,
   a second *Naprej* after the signpost, an abrupt ambush, the rock-slide rule (letters
   anywhere in the word) not understood, the report form (no deselect, unclear note), names
   like *Eva* rejected without saying why, a dual error (*2 črke*), "tapkaj" reads badly.
6. **What worked:** the translations, the game was played through to the end, tapping feels
   easy once found, the chip UI.

### What changed (0.10.0)
- Pošlji next to a tapped word; a dragged word sends itself; a non-word flashes red and clears.
- Proposals stand still while dragging and show only the shortest version of a word; Namig lasts.
- Chests take their region's words (`data/words.json`) and never repeat on a journey; ✕ and
  Pošlji next to the word; the rock slide says the letters may stand anywhere and falls slower.
- Hero screens keep the way on in view; stops name their puzzle; the signpost walks on; the
  ambush is announced; Kako igrati ends in the menu.
- Words to the developer are chips only, with *Kaj pomeni?* for new words.
- The journey is saved at checkpoints by Znanje; Izhod on the road and in the pause.
- No "tap" wording, the dual fixed, which words count explained, controls for phone, tablet
  and computer, the maker named on O igri.

### Still open from this round
- The crossword on phones: the letter wheel (next branch).
- Readability on phones: only small labels were enlarged; check again in the next round.
- Round 2's questions still without data: attack-sound level, Delete to clear, text at 78 %
  scale (a desktop round is needed).

## Round 2 (11 Nov 2026)

### What testing found
1. Players did not know how each puzzle works before its clock started.
2. There was no real pause; a paused board could still be read, so pausing was a way to
   cheat the timer.
3. Attack sounds were too punchy.
4. In the browser the battle scene was too tall and pushed the puzzle down; scrolling to
   the puzzle hid the scene. Zooming the browser out fixed it. A fullscreen view is
   wanted, in the prototype and later in the game.

### What changed in the prototype
- **Puzzle intros ("Kako se igra"):** the first time each puzzle type appears (letter
  mesh, zagovor crossword, lock crossword, ambush crossword, chest, rock slide, darts) a
  panel explains it with a picture of a solved example built from the real game pieces,
  a few numbered steps and a line on what the timer does. Every clock stands still until
  the player presses *Začni*. Shown once per puzzle type (remembered between visits); a
  start-screen switch turns them off and a button shows them again.
- **Pause:** Esc pauses everywhere a clock runs, also from inside text fields; a *Premor*
  button sits in the top bar (since v0.8.0: at the right of the puzzle's header). The pause panel has *Nadaljuj*, *Kako se igra*, fullscreen
  and a volume slider. Leaving the window pauses a real-time game.
- **No cheating in pause:** while paused or reading an intro, the letter mesh, word bar,
  crossword, chest letters, darts and rocks are blurred beyond reading and typing does not
  reach the puzzle. Delayed attacks wait too (they run on the game clock).
- **Keys changed:** Esc is pause only. Clearing the word moved to **Delete**; cancelling
  a zagovor crossword is a button.
- **Sound:** attack sounds play at about 40 % of their old level through a low-pass
  filter; a master volume (default 80 %) is in the pause panel. Still tuned without
  listening, so check by ear.
- **Fullscreen and fit to screen:** *Cel zaslon* button in the top bar (since v0.8.0: in *Nastavitve* and the pause window). On desktop the
  game screens always fit the window height: the battle scene first gives up sky
  (330 → 240 px), the key legend hides, then the screen scales down (to 60 % at most) so
  the scene and the puzzle are visible together without scrolling; in fullscreen it
  scales up to fill (to 200 % at most).

### Carry over to Godot
- One global hold flag for every timer and delayed action.
- Intros as data per puzzle type, with a solved example rendered from the real puzzle
  nodes.
- Scale the 640×360 base to the window; the puzzle must never scroll away from the scene.

### To check in the next test
- Is the rock-slide rule clear from the intro? It is "one word that contains the
  letters", not "words that start with the letters".
- Is 40 % the right level for attack sounds?
- At 1280×720 the battle runs at about 78 % scale. Is the text still comfortable to read?
- Does Delete for "clear word" get discovered, or does Esc still get pressed out of habit?
