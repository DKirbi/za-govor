# Changelog

*Za govor!* follows [semantic versioning](https://semver.org/). The game shows its version at
the bottom of the start screen and on *O igri* (for example `zaprta alfa · v0.8.0 · 1a2b3c4`),
and sends it with every missing-word report.

## How versions are numbered

- **1.0.0 is the first public release** (a store listing such as Steam or Google Play). Until
  then the game stays on **0.y.z**, which in semantic versioning means "still being built,
  anything may change".
- **Minor (0.y.0):** every merged pull request that changes what players see or can do: a new
  feature, new content, a reworked screen, or a change that resets saved progress.
- **Patch (0.y.z):** fixes only, with nothing new to learn: a bug, a missing word, a typo.
- **Release stage** is shown next to the number and is not part of it. It is
  `config.stage` in `package.json`:

  | Stage | When |
  | --- | --- |
  | `zaprta alfa` (closed alpha), **now** | Invited testers only. Features are still being added (achievements, settings, items, possibly another engine), so systems and balance change from one build to the next. |
  | `zaprta beta` (closed beta) | Everything planned for 1.0 is in: the whole road to the dragon, the heroes, items and achievements, a save format that will not change. Testing is about balance, words and bugs. |
  | `odprta beta` (open beta) | The same, but anyone can join (a public link or store early access). |
  | (none) | 1.0.0 and later. |

  Who can play (closed or open) and how finished the game is (alpha or beta) are two separate
  questions. Testing with friends makes it a *closed* test; it becomes a *beta* when the
  feature list is complete.
- There is no `-alpha` suffix on the number. In semantic versioning `0.8.0-alpha` sorts *before*
  `0.8.0`, so it would promise a final 0.8.0 that never comes.

**Where it is set:** `package.json` (`version` and `config.stage`) is the only place. `build.py`
writes it into the game with the short git commit, and the Android app reads it in
`android/app/build.gradle`: `versionName` is the version, `versionCode` is
major × 10000 + minor × 100 + patch (0.8.0 → 800), so each new version installs over the last.

**Releasing a version:** bump `package.json` and add a section here in the same pull request.
After it is merged, tag the merge commit on `main` (`git tag v0.8.0 <sha> && git push origin v0.8.0`).

## 0.15.0 — 17 Nov 2026 · zaprta alfa · Ptuj gets a second background for an A/B test
Branch `feat/ptuj-bg-ab`, with the Codex art pack (#33). Details: `docs/art-benchmarks/ptuj-background/INTEGRATION.md`.
- **Variant B is the Codex pack, *Ptuj — sončni zahod nad Dravo*** (`art/manifests/ptuj.json`): sunset sky,
  clouds, distant hills, the castle hill with Ptuj Castle, the town on the Drava, the river with its
  reflections and a road of big cobbles.
  - The pack leaves placement open, so `data/backgrounds.json` places its layers for the game's scene: a
    1672 × 560 view, the town and river moved up, the castle hill at Codex's 0.6 scale, and the road
    enlarged 1.3× to reach from 58 % of the scene to the bottom.
  - Every hero and enemy stands on the cobbles in battle and on the road. No pixel is changed.
- **Variant A, the snowy Ptuj in use, is unchanged**, and it is what players see: the A/B test is off
  (`live: false`). Turned on, each install keeps A or B (localStorage `zg-ab`). `?ozadje=B` previews B,
  and *Liki in karte → Ozadja* shows it.
- **Variant C, *Ptuj — večer ob Dravi*,** is Claude's pixel-art pack (`tools/art_ptuj_parallax.py`, 10
  layers, 25 KB). It is a preview only (`?ozadje=C`, share 0) and has its own id, so it never touches the
  Codex files.
- **Backgrounds in layers** (`src/backgrounds.js`):
  - Each layer moves at its own rate on the road, from the same centred framing as the battles.
  - The view covers short, wide scenes without side gaps, with the ground kept at the bottom.
  - Large pictures are shrunk smoothly, while pixel art keeps hard edges.
  - A foreground layer stands in front of the actors and under the battle UI.
  - Nothing drifts under reduced motion.
- **`build.py`** reads both manifest formats, takes placement from `data/backgrounds.json`, builds a pack
  in only when all its files are committed, and stops on a layer that contradicts its manifest.
- **Battle statistics name the background variant** (`ozadje-ptuj=A`, or `B(predogled)` for a preview).
  The consent text says so (*različica igre in ozadja*).
- **Size:** the Codex layers grow the single-file build from 2.7 MB to about 9 MB. Runtime-sized
  exports are an open question.
- GPT's reference sheet is committed as a reference only. New test file: `tests/backgrounds.test.js`
  (36 checks).
- **Combined seasonal pack (PR #34)**: sunset (B) and winter (D, the Kurent background, share 0) share one depth
  order. The shared bridge sits after the riverbank wall in both, and the outer-bank trees, the foreground
  rocks and the separate cloud strips are in. Winter stays a preview until the Game Director assigns it.
- **Fix:** the winter pack drew the bridge behind the sky, because the shared bridge came first in the manifest.
  `build.py` now orders every layer by where its id first appears in the manifest.
- **Fix:** castle hill in both packs was placed above the 560 px view and failed the build. Its y is now 0.
- **Nastavitve → Razvoj → Kakovost slik:** *Samodejno* (the default: the A/B test chooses, as before), *Visoka*
  (the Codex sunset pack, where the test would show A) or *Nizka* (the picture already in the game, variant A,
  where the test would show the sunset pack). Winter has no low picture yet, so it stays on its Codex pack.
  Stored in `zg-fidelity`. Martin Krpan's pictures are not yet part of the setting.
- **Size:** the half-size copies of the Codex layers are removed, with `tools/art_ptuj_lowfi.py`. They were not
  the low tier. The single-file build is 18 MB, down from 21.8 MB.

## 0.14.0 — 17 Nov 2026 · zaprta alfa · Znanje cards fold their details
- **Nova pot:** each Znanje card shows its figure, name and one line. What losing and a fallen hero
  mean is folded behind **Podrobnosti** beside the *Znanje* heading; it opens all three cards at once
  (they can be compared and the row keeps one height) and picks none. *Skrij podrobnosti* folds them
  again. The toggle sits outside the cards, so it never changes the chosen Znanje.
- `tests/menu.test.js`: folded by default, one toggle opens all three, Enter on it stays on Nova pot.

## 0.13.0 — 17 Nov 2026 · zaprta alfa · balance D: the party levels together, a difficulty curve, a new Lintvern
Branch `feat/balance-d`, from the balance simulations of 16–17 Nov (version D of four compared). The working
balance until monsters and gods are reviewed. Saves from 0.12.0 still load. Details: `docs/progression-design.md` §4b.
- **The party levels together.** Experience from every beaten enemy (all heroes' attacks + damage + its level)
  goes to the party; each level puts **three skill points in a shared pool** that any hero can spend, and
  heals the heroes standing. New levels at 45 / 110 / 220 / 360 / 540 / 760 / 1020 / 1350 XP. A hero who
  joins arrives at the party's level. Points can now also be spent on the hero screen **right after a
  battle** (*Veščine · N točke*). A saved journey keeps its best hero's XP and pools every unspent point.
- **Skills fire together** for the five reviewed heroes: two of their letters fire skills 1 and 2, three fire
  all three, each at its own rank. Learning a skill never makes a word weaker any more.
- **Ptuj has four battles** (1, 1, 2 and 2 enemies), so the party reaches Peca at level 3 with six points.
  **Ptuj is the same on every Znanje, and losing there never ends the journey.**
- **Enemies follow a curve:** more health and attack region by region (Peca a little easier than before,
  about ×3 health by the castle), **a third enemy from Bled** with three or more heroes, **strong enemies**
  (*Silni / Silna …*, marked on the road) in about two battles in five from Trnovski gozd, never two
  Pesjani at once. **Knjižni molj** grows a little stronger and quicker towards the end.
- **Znanje:** on **Učenjak** the fallen get up with half health when a region ends; on **Malček** the
  last battle can always be tried once more.
- **Bosses:** **Povodni mož** 240 health, hits 12, with two vodne vile. **The Lintvern** has three attacks:
  *Kremplji* (a scratch), *Topot* (hits everyone and knocks heroes out of the letter mesh for 6 s) and
  *Ognjeni dih* at two thirds and one third of his health: a long breath (shorter on harder Znanje) that
  nothing can stop, then fire and burns on every hero and **ten scorched letters** that slowly cool and
  burn whoever uses them. Delays move him half as far; stuns and *Okamnitev* do nothing. **Zmajčki**
  (wyverns) fight beside him, one per hero beyond the first, and more come when he enrages.
- **The zagovor's level bonus is halved** (×1.4 at level 9, was ×1.8).
- **Battle statistics for testers, only with consent:** *Nova pot* asks once, *Nastavitve* has the switch.
  One row per journey battle (result, region, enemies, Znanje, pace, device, version, words, seconds per
  word on the mesh, party level, heroes, health) goes to the word-report form. No words and nothing
  personal; it needs declaring in the stores' privacy forms.
- Fix: on phones the Znanje cards no longer squeeze what losing means into the picture's column.
- Includes the Kurent and Kresnik rebalance (merged #19 went in without it) and the 0.11.0 Malček retreat at
  full health and region-end heal (both were missing from `main`).
- New test: `tests/balance.test.js`; `tests/progression.test.js` updated for party XP and combo firing.

## 0.12.0 — 16 Nov 2026 · zaprta alfa · reviewed heroes: own skill ranks and XP from the fight
Branch `feat/reviewed-hero-progression`. A testing pass for the five heroes with a reviewed character
specification: **Ajdovska deklica, Erazem Predjamski, Kralj Matjaž, Kresnik and Kurent**. Everyone else is
unchanged. No new animations or art.
- **Their own skills, rank by rank.** Each of the three skills has its own rank 1–3 values from the
  specification (for example Kurent's *Ježevka* 4 / 7 / 10 with a 1.5 / 2.5 / 3.5 s delay, Matjaž's *Meč*
  6 / 12 / 18). The generic stopnja bonuses (+20 / +40 %, longer effects, an extra effect) no longer apply
  to them. Skill points work as before: learn skill 2, then 3, and raise each to rank 3.
- **New and renamed skills:** Kurent *Ježevka → Zvonci → Pregon zime*, Kresnik *Ognjeni meč → Kresna strela →
  Kresna moč*, Erazem *Zamah z mečem → Češnje → Skrivni rov* (*Trdnjava v skali* is gone), Ajdovska deklica
  *Metanje skal → Varstvo popotnikov → Okamnitev*. *Zvonci*, *Ognjeni meč* and *Kresna moč* are working names.
- **XP from the fight:** a beaten enemy gives these heroes one XP per attack on it, one per point of damage
  dealt to it, plus its level (the region's number). The battle log and the result show the parts.
- **Health per level:** Ajdovska deklica grows a little more (+10 % a level, a test value); Kurent at least +1.
- **Kurent and Kresnik rebalanced** after simulating the road: Kresnik's sword hit too hard for a new
  hero (now 5 / 7 / 9 with a shorter burn), Kurent's delays no longer add up (they nearly froze enemies), and
  their skills 2 and 3 now deal damage too: *Zvonci* hit and weaken the enemy's next blow, *Pregon zime* hits
  every enemy, *Kresna moč* is a flame on every enemy before it gives wounds back. Skill 1 at rank 3 is lower.
- *Veščine* describes every rank of their skills.
- Values the specifications leave open are placeholders, listed in `docs/progression-design.md` §4a.
- New test: `tests/progression.test.js` (starts with Kurent against one škrat: 2 attacks + 8 damage + level 1 = 11 XP).

## 0.11.0 — 16 Nov 2026 · zaprta alfa · one difficulty, starter words, chests and wells by chance
Branch `0.11.0-alpha-fixes`, after testing 0.10.0 (#16).
- **Znanje is the one difficulty.** *Težavnost* is no longer a choice of its own on *Nova pot*:
  Malček plays with the Lahka rules (one second chance per journey, see below; the fallen get up
  after a win; weaker enemies), Učenjak with Srednja (a lost battle ends the journey), Knjižni molj with
  Težka (stronger enemies; a hero still down after a battle leaves). Each Znanje card says so.
  A saved journey keeps going on its Znanje; the separate setting is forgotten.
- **Starter words.** While the help lasts, a battle's letter mesh opens with whole words laid in
  rows, readable from the left or the right: Malček four (5, 4, 4 and 3 letters) for the first
  half of the road, Učenjak three (4, 3, 3) for the first quarter, Knjižni molj two three-letter
  words in the first region only. About half are words of the region in any of their forms. The
  battle log and (on Malček and Učenjak) the coach tip point them out; *Premešaj* lets them go.
- **A new level heals the hero fully** (and still adds health and a skill point), and **finishing a
  region heals every hero still standing to full** (the fallen stay down, as at a well).
- **Malček gets one second chance per journey:** the first lost battle brings the party back with
  full health (no longer a third), the enemies still waiting; a second lost battle ends the journey.
- **Chests and wells by chance, in every region.** Every region now has a place for a chest and
  for a well, including new chests at the start of Ljubljanica and Ljubljanski grad. When a
  journey starts, each place stays with a chance set by Znanje (chests 60 / 45 / 30 %, wells
  75 / 55 / 40 % on Malček / Učenjak / Knjižni molj; `data/world.json → chance`). A journey always
  keeps at least one chest, and a well in each half of the road.

## 0.10.0 — 16 Nov 2026 · zaprta alfa · alpha fixes (playtest round 3)
Branch `0.9.0-alpha-fixes`, stacked on 0.9.0 (#12). From the third playtest (two testers on phones)
and the decisions of 16 Nov.
- **The journey is saved at checkpoints**, by *Znanje*: Malček every quarter of the road (Peca,
  Trnovski gozd, Predjamski grad), Učenjak every third (Triglav, Piranske soline), Knjižni molj
  once, at the half (Trnovski gozd). The result of a checkpoint battle says *Shranjeno*; after
  closing the page, *Nadaljuj pot* continues from there. A new, finished or lost journey removes
  the save; a save from an older build is dropped with a message. **This resets nothing saved
  before: there were no saves.**
- **Izhod** replaces *Meni* on the road and is in the pause window of journey battles. It asks
  first and says where the game last saved (*Napredek je shranjen po zadnji zmagi – Peca.*);
  leaving mid-battle starts that battle again.
- **Words:** *Pošlji* sits next to the word on phones too (for tapped letters); a dragged word
  still sends itself. A non-word flashes red and clears. Proposals stand still while dragging
  and show only the shortest version of a word (DELA, not DELATI or DELALA). *Namig* lasts until
  its word is played.
- **Three-letter words count on every level.** **Knjižni molj has no hints at all**: no
  *Namig*, no *Razkrij črko*, no chest clue (the buttons are gone).
- **Chests** take the words of their region (`data/words.json`, a first list to review) and never
  repeat a word on one journey; the clue shows on Malček, on some chests on Učenjak, never on
  Knjižni molj; ✕ and *Pošlji* sit next to the word. **Rock slides** take their region's words,
  fall slower (22 s) and say the letters may stand anywhere. Rock slides now also on the cliff of
  Predjamski grad and the castle hill of Ljubljanski grad; 114 chest words in all.
- **Kaj pomeni?** A word found for the first time with no meaning yet can be asked about in one
  tap (battle result, chest, rock slide, spikes). **Pošlji besede** (pause, *O igri*) is chips
  only: missing words and new words, picked and sent together. Both go to the same Google Form
  (the *Opomba* field carries the kind, *Kje* the region). `data/meanings.json` holds the
  meanings written so far (none yet).
- **Flow:** hero screens keep the way on in view (a full-width footer, sticky on phones); every
  stop names its puzzle; after a signpost the party walks on by itself; an ambush says
  *Zaseda!* before its crossword; *Kako igrati* ends with a button back to the menu.
- **O igri:** *Avtor* (developed by Oygn Productions, Davor Kirbiš, a passion project made to
  promote the Slovene language and folklore), a *Navdih* that names no other game, the sources
  folded behind ©. The README keeps the full credit to Words for Evil.
- **Copy:** no more "tap" (*pritisni*, *pritiskaj*), the dual on hero boards (*2 črki*), which
  words count (no names), *Upravljanje* for phone, tablet and computer.

## 0.9.0 — 16 Nov 2026 · zaprta alfa · skill expansion and fixes
- **Skills and stopnje.** Experience comes only from beaten enemies. Levels go to 9; every
  level brings a skill point. Each hero has three skills (one, two or three of their letters
  in a word, so longer words fire the stronger skills). **Skill 1 is known from the start.** A
  point learns skill 2 (then 3) or raises a known skill to **stopnja 2 and 3**: +20 % / +40 %
  power, effects that last 1.5× / 2× as long, and one extra effect at each stopnja (critical
  hits, healing, hitting every enemy, shields, stuns, fire, weakening). Points are spent in
  *Veščine* at wells, shrines and pedlars.
- **A hero with a point to spend glows:** a ring of light rises from the head (seen in the
  party on the road, in battle and on the hero screens), and a short synthesised heavenly
  chorus sings when the point arrives.
- **Hero screens:** a *Veščine* button with the three skills, their stopnje and the XP to the
  next level; the card shows known skills filled and the rest outlined (a star per stopnja
  above 1). Tapping the hero still plays the skills they know, but the game no longer tells
  the player (no *tapni junaka*). The notice (unlocked, room in the party) is at the top, and
  the skill pills are larger.
- **Heroes per journey:** three (always Ptuj, plus two random regions), each place favouring
  its own legend. **Only a hero who joins is unlocked**; greeting one is not enough.
- **Shrines of challenge (*Svetišče*).** Six shrines, each of one god and each with its own
  look; a journey passes three of them. The gods are shown only by their signs (lightning,
  anvil, spindle, sun, wind, horns). Pray at one shrine per journey: the god answers and lends
  a gift for the rest of the journey (with every third skill fired). When the journey ends,
  as the ending screen is left, the god comes for a hard challenge using only their special
  (Perun: a chain of lightning, first hero hit hardest). Winning: the god speaks, raises the
  fallen, gives everyone 250 XP, is unlocked (never joins by themselves), and the gift lasts
  the whole next journey. A party god meets their godly version at their own shrine right
  away; they do not strike it, and winning gives them a skill point at once and everyone
  250 XP. The old three-battle blessing and cursed-god trial are gone.
- **Difficulty (*Težavnost*) on *Nova pot*:** *Lahka* (enemies ×0.85; a lost battle is a
  withdrawal and the journey goes on; the fallen get up after a won battle), *Srednja* (a lost
  battle ends the journey; the fallen stay down until raised) and *Težka* (enemies ×1.25; a
  hero still down when a battle ends leaves the party). Pace moved under its own heading,
  *Tempo*. *Poskusi znova* after a lost battle is left only to practice battles and the test
  mode.
- **Wells no longer raise the fallen**; they heal those still standing.
- **Spikes only hurt** (merged from #11, *Past s konicami*): every letter of a real word
  closes a slot, the other spikes hit the heroes one by one (each hit shown on its hero),
  even a full word lets one graze, nothing carries into the next battle. While waiting the
  wall warns *Konice se sprožijo – pripravi se na umik!*; the intro is shorter and *Začni*
  stays in view.
- **Fix:** the word bar no longer grows with long words or many attacking heroes, so the letter
  grid never moves under a finger (letters shrink, chips use the tile initials on one line).
- Chests and rock slides pay gold (and items) but no XP.

## 0.8.0 — 12 Nov 2026 · zaprta alfa
- **No top bar.** On pages under the menu, *← Nazaj na …* is the header and stays at the
  top while the page scrolls. In battles and events, *Premor* sits at the right end of the
  puzzle's header.
- **Nastavitve** in the main menu: sound on/off and volume, plus fullscreen on a computer.
  The same sound controls are in the pause window.
- **Phone or desktop layout is decided by the device.** The *Mobilni prikaz* switch is gone:
  turning it off on a phone broke the game, and a stored choice is now ignored. For
  development, `?prikaz=telefon` or `?prikaz=namizje` in the address forces one.
- **Version** at the bottom of the start screen and on *O igri*; missing-word reports
  include it. Android builds take their version from `package.json`.
- **Fix:** a hero card opened from *Dosežki in junaki* had two ways back. Only the link at
  the top is left (the same in the developer gallery).

## 0.7.0 — 12 Nov 2026 · #9 (with #8)
- *Za govor!* title scene: pixel wordmark over an animated dusk landscape with Triglav.
- New start menu: *Nadaljuj pot*, *Nova pot*, *Dosežki in junaki*, *Kako igrati*, *O igri*,
  each page with *← Nazaj na glavni meni*; difficulty is chosen only on *Nova pot*.
- Word list rebuilt from Sloleks 3.1, Franček and the Thesaurus of Modern Slovene (#8).

## 0.6.0 — 12 Nov 2026 · #7
- Missing base forms accepted (*jasa*, *loj*, *runa*).
- *Prijavi manjkajočo besedo*: players report rejected words to a Google Form.

## 0.5.0 — 12 Nov 2026 · #6
- *Words for Evil* credited inside the game: start screen, *Zasluge* and the ending.

## 0.4.0 — 12 Nov 2026 · #5 (with #4)
- Android: an in-game Slovene keyboard, no *Pošlji* in the letter mesh on phones, the back
  button pauses, and GitHub Actions builds a test APK.

## 0.3.0 — 12 Nov 2026 · #3
- The journey across Slovenia to Ljubljana castle, darts, new rules for heroes, healing and
  items, and the fixes from playtest round 2 (puzzle intros, pause, quieter attacks, fit to screen).

## 0.2.0 — 11 Nov 2026 · #2
- Knowledge levels *Malček*, *Učenjak* and *Knjižni molj*.

## 0.1.0 — 11 Nov 2026 · #1
- First browser prototype: letter-mesh battles, crosswords with a hidden keyword, a timed chest
  and a rock slide, desktop and phone layouts, build and tests.

The merge commits on `main` for the tags: v0.1.0 `8a6048b`, v0.2.0 `eaefb1c`, v0.3.0 `b0e8d54`,
v0.4.0 `b89cc9a`, v0.5.0 `3d3c2e3`, v0.6.0 `0dd709b`, v0.7.0 `db1009a`.
