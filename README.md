# Za govor

**A Slovene word-puzzle RPG with heroes from Slavic mythology.** Chain letters into
Slovene words to make Perun, Svarog, Mokoš and Kresnik attack, solve crosswords to speak a
*zagovor* (a folk charm), and fight the creatures of Slovene folklore. The game is
inspired by [Words for Evil](https://store.steampowered.com/app/335790) (Chromosphere Games, 2014) and exists to show
how rich and playful the Slovene language is.

> **Slovensko:** *Za govor* je besedna igra s prvinami igre vlog v slovenščini. Junaki iz
> slovanske mitologije se bojujejo z besedami: iz mreže črk sestavljaš besede, rešuješ
> križanke in odpiraš skrinje. Igra želi pokazati, kako bogata in igriva je slovenščina.

The name is a play on words: read as one word, *zagovor* is a spoken charm; read as two,
*za govor* means "for speech".

**Status:** playable browser prototype of all the mini-games (one page, no install). The
full game is planned in Godot 4.7 for Windows, macOS, Linux, Android and iOS — see
[docs/platform-roadmap.md](docs/platform-roadmap.md).

<p>
  <img src="docs/images/battle-desktop.png" alt="Battle in the dark forest: four heroes with pixel sprites, a painted folk-art attack card above Perun, the letter mesh below" width="640">
  <img src="docs/images/crossword-phone.png" alt="Crossword on a phone: rows of everyday words, a gold column hiding the keyword PERUN" width="220">
</p>

## Contents
- [Play the prototype](#play-the-prototype)
- [How it plays](#how-it-plays)
- [Controls](#controls)
- [Build from source](#build-from-source)
- [Tests](#tests)
- [Project structure](#project-structure)
- [How the prototype works](#how-the-prototype-works)
- [Language data and sources](#language-data-and-sources)
- [Roadmap](#roadmap)
- [Known issues](#known-issues)
- [Design documents](#design-documents)
- [Licence](#licence)

## Play the prototype
Download or clone the repository and open **`dist/index.html`** in any modern browser
(Chrome, Firefox, Safari, Edge — desktop, phone or tablet). Everything, including the
46,000-word dictionary, the art and the sound, is inside that one file; no server or
internet connection is needed.

The interface is in Slovene. On a phone or tablet the *Mobilni prikaz* layout switches on
by itself; the switch in the top bar changes it at any time.

## How it plays
The prototype is one short journey along the Ljubljanica, from the marshes to the
castle:

| # | Stop | What happens |
| --- | --- | --- |
| 1 | **Barje** | Battle: two *škrati* — learn the letter mesh |
| 2 | **Skrinja** | Timed chest: rebuild a hidden word |
| 3 | **Temni gozd** | Battle: Mora (puts heroes to sleep) and Volkodlak (feeds on repeated words) |
| 4 | **Plaz kamenja** | Timed rock slide: break falling rocks with words |
| 5 | **Ljubljanica** | Ambush crossword, then Vodna vila (floods letters) and Povodni mož (boss) |
| 6 | **Ljubljanski grad** | Lintvern, the Ljubljana dragon (boss, two phases) |

### Battles: the letter mesh
- A 5×6 grid of Slovene letters (Scrabble letter distribution, balanced vowels). Chain
  neighbouring letters in any of 8 directions into a word of 3+ letters and send it.
- Used letters disappear and new ones fall in. *Premešaj* reshuffles the grid; *Namig*
  shows a word (3 per battle).
- Most tiles belong to a hero (coloured, with the hero's initial). **The hero whose tiles
  you use attacks**: one tile = small move, two = medium, three or more = big move with a
  painted card. Several heroes can attack with one word.
- **Longer words hit harder:** 3 letters ×1, 4 ×1.3, 5 ×1.6, 6 ×2, 7 ×2.5, 8 ×3, 9+ ×4.
- **Č, Š and Ž are letters of their own.** They are picked deliberately — typed on a
  Slovene keyboard or tapped — and c, s, z never stand in for them, in the mesh, the
  crosswords, the chest or the rock slide.
- **Every inflected form counts** (*volk, volka, volkom, volkovi…*), but repeating the
  same base word in one battle weakens it: ×1, ×0.6, ×0.35, ×0.2.
- **Č, Š, Ž** in a word give a critical hit (×1.5). Each hero has **domain words** that
  hit ×1.5 (Perun: *grom, strela, nevihta*…; Mokoš: *voda, zemlja, kruh*…).
- Optional **word proposals** (for learners) list up to 8 words that continue the letters
  you have started.

### Heroes
| Hero | Role | Moves (small → big) |
| --- | --- | --- |
| **Perun** — god of thunder | Highest damage; big move chains lightning to every enemy | Blisk → Grom → Nevihta |
| **Svarog** — heavenly smith | Damage plus a shield for the party | Kladivo → Kovani ščit → Nebeška kovačnica |
| **Mokoš** — mother earth | Heals; overheal becomes shield; cleanses; big move revives a fallen hero | Kapljica → Vir → Materina roka |
| **Kresnik** — sun hero | Fire: damage that keeps burning | Žerjavica → Plamen → Kresni ogenj |

Each hero has their own health bar and levels up to level 3 (more health, stronger
attacks, extra power for long words). A hero who falls stays down for the rest of the
run; only Mokoš can bring one back. The gallery (*Liki in karte* on the start screen)
shows all eleven planned heroes — also Veles, Dažbog, Stribog, Kurent, Zeleni Jurij,
Martin Krpan and Kralj Matjaž — with sprites, cards and backstories.

### Enemies
Enemies attack in real time, telegraphed by a glowing wind-up. Their strongest moves
**take the language away**:

| Enemy | HP | Special |
| --- | --- | --- |
| Škrat | 22 | — (bites) |
| Mora | 35 | *Uspavanka*: a hero falls asleep, their tiles go grey |
| Volkodlak | 45 | Grows stronger every time you repeat a word |
| Vodna vila | 30 | *Poplava*: floods letters so they can't be used |
| Povodni mož (boss) | 110 | *Vrtinec*: forces a crossword with the mesh closed |
| Lintvern (boss) | 180 | *Pepel* locks letters; *Ognjeni dih* hits everyone; at half health a forced *Zmajeva uganka* crossword |

### Crosswords and the zagovor
- Every letter you play fills the **zagovor meter** (30 letters). When it's full, a
  **finisher crossword** opens. Each entry turns **green only when it's fully correct** and
  fires the theme hero's attack at once; partial or wrong entries stay **black** and do
  nothing. Solving the whole grid adds a big themed finisher (Perun strikes every enemy,
  Kresnik burns them, Mokoš heals and cleanses, Triglav stuns).
- Crosswords are **about everyday things** and generated fresh every time from 359
  original clues in 14 topics: food, home, nature, animals, body, sport and music, town,
  people, objects, time, colours and opposites, verbs, Slovenia, and proverbs
  (*Ni vse ___, kar se sveti* → ZLATO).
- **Mythology is the reward, not the obstacle.** About half the finishers hide a god's
  name in a **gold column** (*geslo*): PERUN, MOKOŠ, KRESNIK, TRIGLAV… Every correct row
  reveals one letter. Guess the keyword early and the zagovor fires at once, stronger for
  every hidden letter. The other crosswords are mixed, some with one starred mythology
  entry.
- An **ambush crossword** opens some battles (an early combo). Bosses force short crosswords
  of easy words with the mesh closed: solve them for a counterattack, fail and take triple
  damage. The hidden keyword is a way out — URŠKA (from Prešeren's ballad *Povodni mož*)
  frees you from the whirlpool, ZMAJ from the dragon's riddle.

### Between battles
- **Chest:** rebuild a hidden word from scrambled letters before time runs out (40 s, 80 s
  in calm mode). Every real word you find pays 3 XP per letter; the hidden word opens the
  chest for 50 XP and starts the next battle with a half-full zagovor meter.
- **Rock slide:** every falling rock carries a letter; type any word containing it before
  it lands. Long words break several rocks.

### Pace
Two difficulty options. **Real-time** (recommended) has no countdown: enemies attack at
their own pace and wear the party down. **Calm mode** (*mirni način*) only lets enemies act
after you play words.

## Controls
| Action | Keyboard | Mouse / touch |
| --- | --- | --- |
| Make a word | Type it; the path is found for you. Č, Š, Ž must be typed as themselves (a Slovene keyboard layout), c/s/z never stand in for them | Drag across tiles, or tap them one by one |
| Send the word | `Enter` | *Pošlji* |
| Clear the word / pause | `Esc` (clears first, pauses on an empty word) | *Počisti* / *Premor* |
| Remove the last letter | `Backspace` | *Briši* |
| Speak the zagovor (meter full) | `Space` | *Izreci zagovor* |
| Hint / reshuffle | `1` / `2` | *Namig* / *Premešaj* |
| Crossword: next entry, move | `Enter` or `Tab`, arrow keys | Tap a cell or a clue; the phone keyboard opens |

## Build from source
`dist/index.html` is built from the files in `src/` and `data/` by a small Python script
(standard library only):

```sh
python3 build.py            # -> dist/index.html
```

The two data files are committed, so this is all you need. To regenerate them:

```sh
pip install simplemma wordfreq
python3 tools/build_dict.py   # battle word list  -> data/dict.json  (~1 min)
python3 tools/cluebank.py     # crossword clues   -> data/clues.json (validates every clue)
python3 build.py
```

To add or change crossword clues, edit the `BANK` (and `THEMES` for the mythology
keywords) in `tools/cluebank.py`. The script checks the alphabet, length, duplicates,
that no clue gives its answer away, and that every keyword letter has enough everyday
words to build a keyword column.

## Tests
The tests open the built page in headless Chrome and play it through a test hook
(`window.__ZG`). They need Node 18+ and a local Chrome or Chromium.

```sh
npm install
python3 build.py
npm test                                  # all four test files
CHROME_PATH=/path/to/chrome npm test      # if Chrome isn't found automatically
```

| File | What it checks |
| --- | --- |
| `tests/crossword-generator.test.js` | 2,800 generated crosswords: no letter clashes or stray letters, connected grids, everything fits 9×9, easy words only in enemy crosswords, the gold column spells the keyword |
| `tests/keyword.test.js` | Guessing the keyword early ends the crossword and fires the zagovor; in Povodni mož's whirlpool *urska* with a plain s stays black and *urška* breaks it |
| `tests/phone.test.js` | On a 390×844 touch screen: *Pošlji* is visible and works, wrong entries stay black, correct ones turn green and fire, phone-keyboard composition input, chest partial rewards, rock slide input |
| `tests/desktop.test.js` | A keyboard playthrough: c/s/z are not accepted for č/š/ž, first battle, result and hero screens, chest, finisher, Lintvern's letter lock and forced crossword, ambush, rock slide, and no console errors anywhere |

Screenshots from each run land in `test-output/` (ignored by git).
`npm run screenshots` regenerates the images in `docs/images/` used by this README.

## Project structure
```
za-govor/
├── build.py                  # inlines src/ + data/ into dist/index.html
├── dist/index.html           # the playable prototype (built, committed)
├── src/
│   ├── index.src.html        # page template with placeholders
│   ├── game.js               # all game code (no framework)
│   └── game.css              # styles, desktop and phone layouts
├── data/
│   ├── dict.json             # battle word list: 9,867 base words → 46,094 forms
│   └── clues.json            # crossword clue bank and mythology keywords
├── tools/
│   ├── build_dict.py         # builds data/dict.json
│   ├── cluebank.py           # the clue bank itself; validates and builds data/clues.json
│   └── readme-shots.js       # regenerates docs/images/
├── tests/                    # headless Chrome tests (puppeteer-core)
└── docs/
    ├── concept-summary.md    # decisions, art and audio direction, sources
    ├── progression-design.md # party, health, levels, roster, items
    ├── platform-roadmap.md   # plan for desktop, phone and tablet releases
    └── images/               # README screenshots
```

## How the prototype works
- **One file, no dependencies.** Plain JavaScript with a tiny `h()` element helper; no
  framework or bundler. `build.py` inlines the CSS, the two JSON data files and the script
  into one HTML page.
- **Dictionary.** `data/dict.json` maps each base word (lemma) to its forms. At start-up
  the game builds a set of forms, a form → lemma map (for the repeat penalty and the "base
  form" hint) and a trie. Finding every word in the mesh is a depth-first search over the
  8-neighbour grid, pruned by the trie; the same search powers hints, proposals and the
  "words in the mesh" count. Typed input finds a matching path automatically; letters must
  match exactly, so c, s and z never match a č, š or ž tile.
- **Mesh refill.** Letters are drawn from the Slovene Scrabble distribution (98 tiles),
  vowels are balanced, and the grid is re-rolled if it holds too few words.
- **Crossword generator.** Two styles. *Keyword column:* for each letter of the keyword,
  pick an everyday word containing it and shift the row so that letter lands in the gold
  column. *Mixed crossword:* place a first word, then repeatedly add the bank word with the
  most crossings, rejecting any placement that would touch other letters side by side,
  overlap in the same direction or leave the 9×9 box; keep the best of up to 24 attempts
  and number entries in reading order. Each puzzle takes about 10 ms.
- **Phone keyboard input.** Crossword cells are typed through a hidden `<input>` inside
  the grid's `<label>`, so tapping the grid opens the native keyboard. The field keeps a
  zero-width sentinel and diffs each `input` event against the previous value, which copes
  with autocorrect, swipe typing, IME composition and Backspace.
- **Art.** Pixel sprites (48×48, bosses 64×64, two frames each) and backgrounds are PNG
  sheets embedded as data URIs; the painted folk-art cards are SVG built in JavaScript,
  one painting per hero per attack size. Cards appear above the attacker inside the scene,
  never as pop-ups, and never block input.
- **Sound.** 16 retro effects synthesised in the browser with ZzFX; no audio files.
- **Test hook.** `window.__ZG` exposes the game state and a few functions (`go`,
  `allWords`, `findPath`, `makeCrossword`, `openCrossword`…) so the tests can drive the
  game.

## Language data and sources
- **Battle words:** `data/dict.json` comes from the Slovene dictionary in
  [simplemma](https://github.com/adbar/simplemma) (MIT; its word lists are derived from
  sources such as Michal Měchura's lemmatization lists, ODbL, and Wiktionary), filtered by
  frequency with [wordfreq](https://github.com/rspeer/wordfreq) (Apache-2.0; used only to
  filter, no frequency data is shipped). Kept: lowercase words of 3–9 letters whose form
  or base word is common, minus a short profanity list, plus the mythology and enemy names.
  **The real game will use [Sloleks 3](https://www.clarin.si/repository/xmlui/handle/11356/1745)
  (CC BY-SA 4.0)** instead.
- **Crossword clues:** all 359 clues were written for this project. There is no Slovene
  crossword API; magazine crosswords (*Razvedrilo*, *KIH*, *3K*) are copyrighted, and
  solver sites such as Pet vodoravno are communities, not data sources. The clues follow
  the friendly modern Slovene style — everyday words, verbs, adjectives, proverb
  fill-ins — instead of obscure crossword filler. To scale up later, CJVT's open synonym
  and collocation dictionaries can suggest clue candidates for a person to edit; a
  professional setter (for example Križankar) could edit the final bank.
- **Mythology:** Slovene folklore first (Monika Kropej's work), then pan-Slavic deities and
  public-domain literature (Prešeren's *Povodni mož*, Levstik's *Martin Krpan*). The
  hero backstories in the prototype are first drafts and need a folklore check.
- **Sound:** [ZzFX](https://github.com/KilledByAPixel/ZzFX) (MIT).
- **Art:** prototype pixel art and card paintings made for this project to set the
  direction; final art is meant for illustrators.

## Roadmap
1. **Playtest the prototype** — the one gate that can kill the project is whether the
   Slovene grid is fun. Host it (GitHub Pages or itch.io) as an installable web app so
   testers can play it on phones and tablets.
2. **Move the rules into shared data files** that the prototype and the Godot game both read.
3. **Build the Godot 4.7 game** (GDScript, Compatibility renderer, 640×360 pixel base) with
   one adaptive layout: portrait on phones, landscape on tablets and desktop.
4. **Input for keyboard, touch and controller**, including Steam Deck's on-screen keyboard.
5. **Release:** Steam (Windows, macOS, Linux, Steam Deck) with a free web demo first, then
   Android, then iOS.

Game design still to build: a party of three starters (Martin Krpan, Zeleni Jurij,
Kurent), meeting heroes on the road, cursed gods as bosses whose true name breaks the
curse, items, and the full campaign *Kolo leta* — four acts, one turn of the year. Details
in [docs/progression-design.md](docs/progression-design.md) and
[docs/platform-roadmap.md](docs/platform-roadmap.md).

## Known issues
- The sound effects were tuned without listening and need adjusting by ear.
- Battles still use the four gods as the party; the planned party of three starters is not
  built yet.

## Design documents
- [Concept summary](docs/concept-summary.md) — confirmed decisions, art and audio
  direction, crossword sources, open questions.
- [Progression design](docs/progression-design.md) — party, health and levels, roster,
  cursed-god bosses, items, backgrounds.
- [Platform roadmap](docs/platform-roadmap.md) — from browser prototype to Windows, macOS,
  Linux, Android and iOS.

## Licence
No licence has been chosen yet, so all rights are reserved by the author. Third-party
data and code keep their own licences (see [Language data and sources](#language-data-and-sources));
the Sloleks licence (CC BY-SA 4.0) will require attribution in the final game's credits.
