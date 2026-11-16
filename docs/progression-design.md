# Za govor — journey and progression design (updated 16 Nov 2026, v0.10.0)

Prototype: https://claude.ai/artifact/NTdMnud7X8Um2p38G1fVnb

This replaces the earlier "three starters and cursed-god bosses" proposal. Everything below is built in the browser prototype unless marked *not built*.

## Status at a glance
- **Decided by the user (11 Nov):** the 2D side-scrolling journey is the point of the game; the levels are places in Slovenia visited one after another, with no level list; the dragon at Ljubljana castle is the final battle; healing happens only at special places such as wells; the player starts with one character; four is the most in a party; only one god per play, and gods are stronger; Erasmus of Lueg (Erazem Predjamski) is a new character and more should be explored; all characters are unlocked; there are items with mythical Slavic names; merchants sell potions, poisons and attack boosts; traps, chests and wells have their own sprites; the web prototype is expanded for fast testing and Godot stays the end goal.
- **16 Nov, late — v0.11.0, branch `0.11.0-alpha-fixes` (built, after testing #16):** *Težavnost* merged into *Znanje* (§3c); **starter-help words** in the letter mesh (§11.3); a new level heals fully (§4); **chests and wells by chance in every region**, by Znanje (§1).
- **16 Nov, evening — v0.10.0, PR #16 `0.9.0-alpha-fixes` (built):** the journey saved at checkpoints by Znanje and *Izhod* (§11.11); word input (§11.5); 3-letter words on every tier and no hints on knjižni molj (§11.3); chests and rock slides with region words (§11.6, §11.7, `data/words.json`); *Kaj pomeni?* and chips-only word reports (§11.9); hero-screen footer, puzzle names at stops, the signpost walking on, the ambush announced (§11.8, `zagovor-080-alpha-fixes.md`); credits (`zagovor-store-release.md`).
- **16 Nov, afternoon (decided; what is still *not built*, section 11):** geographic word seeding; at most one recruitable hero per region; ~~starter-help words by Znanje~~ (built in 0.11.0 on the mesh); the križanka on a letter wheel and the in-game keyboard removed (PC/tablet setting for the classic form); the full rock-slide redesign; post-match screen and folk cards; road encounters played in the scene (§11.10); Znanje scaling monster health.
- **16 Nov, v0.9.0 (built, corrections to "skill expansion and fixes"):** skill 1 known from the start, points learn skills 2 and 3 or raise any skill to **stopnja 3** (stronger, longer effects, one extra effect per stopnja; section 4); a hero with a point to spend glows and a chorus sings; **shrines of challenge**, one god each, three per journey, the god's challenge when the journey ends (section 2a); **Težavnost** with three settings (section 3c); wells no longer raise the fallen; the tap-to-demo on hero screens is no longer announced.
- **13 Nov, v0.9.0 (built, "skill expansion and fixes"):** XP only from beaten enemies; levels 1–9, each with a skill point; three heroes per journey, favouring the hero of each place; only a hero who joins is unlocked; spikes that only hurt.
- **12 Nov (built):** the darts event (*Puščice v zidu*, renamed *Past s konicami* on 13 Nov), the start screen with silhouettes and three known starters, attacks for the healers, every potion used automatically.
- **Evening fixes (built, 11 Nov):** partial healing outside wells, automatic potions, wells raise the fallen (no longer, 16 Nov), gold and XP from every enemy, one-word chests and rock slides with partial outcomes, Krpan as the first starter with unlocks.
- **Built:** the journey (ten regions, 56 stop slots; a journey keeps three hero stops, three shrines and some of the ten chests and ten wells), choosing the first hero, meeting and swapping heroes, shrines of the gods, wells, the pedlar, gold, 23 items, random regional enemies, sprites for every stop, four new heroes, battle abilities for all fifteen heroes.
- **Gods as challengers (16 Nov, replacing the cursed-god trial of 13 Nov):** a god you pray to lends a gift for the journey and comes for a challenge when it ends (section 2a).
- **Not balance-tested:** the journey runs end to end in automated tests, but nobody has played it through for difficulty.

## Character and combat design references

This document records the journey, progression and prototype roster overview. For reviewed character-specific decisions, use [the character documentation index](characters/README.md) and the linked specifications there. The current detailed reviews cover Ajdovska deklica, Erazem Predjamski, Kralj Matjaž, Kresnik and Kurent. Lepa Vida and Peter Klepec remain prototype-level entries pending their individual reviews.

**Source-of-truth rule:** Detailed character specifications contain the latest reviewed skill behaviour, rank values, recruitment constraints, folklore context and open questions. Older summaries in this progression document may describe earlier prototype behaviour; if they conflict with a reviewed specification, flag the discrepancy rather than silently treating the older summary as current.

Shared action/status and interruption rules are maintained separately in [Combat System Rules](combat-system.md). Apply those rules across heroes and enemies unless a character or enemy specification explicitly documents an approved exception.

## 1. The journey
One road, walked left to right. The party stands still and the world scrolls past; the background pans slowly across the landmark of the region. Walking stops at every stop and a prompt offers what can be done there, and names the puzzle that waits there (v0.10.0). A signpost at the end of each region leads to the next; after it the party walks on by itself (v0.10.0).

| # | Region | Landmark in the background | Hero of the place (6× more likely to wait there) | Stops | Enemies |
| --- | --- | --- | --- | --- | --- |
| 1 | Ptuj | castle above the snowy town | Kurent | battle, hero, chest\*, well\*, battle | Škrat, Vešča |
| 2 | Peca | King Matjaž's cave | Kralj Matjaž | battle, rock slide, chest\*, hero, well\*, shrine, battle | Perkmandeljc, Škrat, Pesjan |
| 3 | Triglav | the three peaks | Ajdovska deklica | battle, rock slide, hero, pedlar, shrine, battle | Pesjan, Perkmandeljc, Vešča |
| 4 | Bled | island church, castle on the cliff | — (Kresnik has no home and turns up anywhere) | battle, chest\*, shrine, well\*, battle | Vodna vila, Vešča, Škrat |
| 5 | Trnovski gozd | moonlit forest | Martin Krpan | battle, chest\*, spikes, hero, well\*, shrine, battle | Mora, Volkodlak, Vešča |
| 6 | Piranske soline | salt pans, Piran at sunset | Lepa Vida | battle, chest\*, pedlar, hero, well\*, shrine, battle | Vodna vila, Pesjan, Mora |
| 7 | Predjamski grad | the castle in the cliff | Erazem Predjamski | battle, spikes, hero, rock slide, chest\*, well\*, ambush | Zmajev mladič, Perkmandeljc, Volkodlak |
| 8 | Ljubljansko barje | pile dwellings in the mist | Zeleni Jurij | battle, chest\*, hero, pedlar, well\*, shrine, battle | Škrat, Mora, Volkodlak, Vodna vila |
| 9 | Ljubljanica | Tromostovje | Peter Klepec | chest\*, battle, hero, well\*, **boss: Povodni mož** | Vodna vila, Mora |
| 10 | Ljubljanski grad | the castle wall at sunset | — | chest\*, pedlar, rock slide, spikes, well\*, **boss: Lintvern** | — |

- **Random enemies:** each battle draws its enemies from the region's pool. One enemy while the party is a single hero, two after that. The very first fight is always one Škrat with the tutorial tips.
- **Scaling:** enemy health +10 % and attack +6 % per region (bosses are fixed).
- **Three heroes per journey (13 Nov):** a hero always waits at Ptuj; two more regions with a hero stop are picked at random and the other hero stops are left out, so one journey never meets everyone. At a hero stop the hero of the place is six times as likely as anyone else, and heroes not yet unlocked twice as likely; if nobody is left, the stop becomes a well. **(16 Nov, stricter — see §11.2: at most one recruitable hero per region, randomized among the region's own heroes when several belong there. *Not built.*)**
- **Shrines and heroes are planned per journey:** only three of the six shrines and three of the hero stops stay on any one journey (sections 1 and 2a).
- **Chests and wells by chance (16 Nov, v0.11.0; \* in the table):** every region has a place for a chest and a place for a well. When a journey starts, each place stays with a chance set by **Znanje** — chests 60 / 45 / 30 %, wells 75 / 55 / 40 % on malček / učenjak / knjižni molj (`data/world.json → chance`), on average about 6 / 4.5 / 3 chests and 7.5 / 5.5 / 4 wells. A journey always keeps at least one chest, and **a well in each half of the road**. The plan is kept in the save (`chestAt`, `wellAt`); a 0.10.0 save gets its wells planned when it loads. (In v0.10.0 only six regions had a chest, by Težavnost 90 / 70 / 50 %.)
- **Data:** regions, stop order, enemy pools, items and save checkpoints live in `data/world.json`, the words of each region in `data/words.json`, so the Godot game can read the same files.

## 2. Party rules
- **Start screen:** all fifteen characters are shown. On a fresh game only **Martin Krpan, Zeleni Jurij and Kurent** are known and can start; the other twelve are nameless silhouettes. You pick one.
- **Joining unlocks (13 Nov):** a hero is unlocked for later journeys only when they join the party; greeting them and walking on leaves them unknown, so a full party has to choose whom to leave. A god is unlocked by beating them in the challenge after praying at their shrine. (Test mode shows everyone.)
- **At most four** travel together. A fifth can only take somebody's place; a hero who has fallen can be left behind this way ("Zapusti").
- **One god per journey.** A god never joins on the road: a god beaten in a challenge is unlocked and can **start** a later journey.
- **A hero who joins** brings half the party's average experience (and the skill points of the levels it gives); they know only skill 1.
- **Gods are stronger:** attack ×1.35 (Veles ×1.5) and about a quarter more health than folk heroes.
- **Letter mesh:** the share of coloured tiles grows with the party (30 % with one hero, 46 %, 56 %, 62 % with four).

## 2a. Shrines of challenge — *Svetišče* (16 Nov; `src/shrines.js`)
- **Six shrines, one god each, each with its own look** (`tools/art_extra.py`): Perun — a carved post with the thunder mark under an old oak; Svarog — a stone forge altar with an anvil; Mokoš — a spring in a ring of stones with a spindle; Dažbog — a sun disk on a tall pole; Stribog — a windswept cairn with streamers; Veles — a dark stone in the roots, crowned with ox horns, a snake beside it. **The gods are not shown, only their signs** (16×16): lightning, anvil, spindle, sun, wind, horns.
- **Where:** Peca (Svarog or Perun), Triglav (Perun or Stribog), Bled (Dažbog or Mokoš), Trnovski gozd (Veles or Mokoš), Piranske soline (Stribog or Dažbog), Ljubljansko barje (Veles or Mokoš). A journey keeps **three** of these at random, each for a different god. A god who starts the journey always finds their own shrine on it.
- **The page** is titled *Svetišče* ("posvečeno bogu Perunu"), with the shrine, the god's sign above it, what praying means and two buttons: *Pomoli se* / *Pojdi naprej*.
- **One prayer per journey.** The god answers at once (Perun: *»Zagrmelo je. Tvoja molitev je uslišana. Preživi pot do konca in videl bom, ali si vreden te preizkušnje.«*) and lends a **gift for the rest of the journey**: every word that fires a third skill (three letters of one colour) also brings the god's power — Perun: lightning on every enemy (1.5× the strike's power); Svarog: shield (2.5×, cap 30); Mokoš: heals the party (3×, up to 70 %); Dažbog: the next word ×2; Stribog: hits everyone (1.2×) and clears locked letters and sleep; Veles: poisons every enemy. The battle header shows "dar: *god*". Other shrines on the same journey only let you bow.
- **The challenge comes when the journey ends:** leaving the ending screen (button, Enter or Back) brings the god (*»Rekel sem, da bom videl. Zdaj pokaži.«*) and a battle against them in their holy light: 260 + 26 health per region (494 at the castle, against the dragon's 180), scaled by the difficulty; attack 5 + a third of the region; **only their special**:
  - Perun, *Nevihta*: a chain of lightning through the whole party, 1.4× the attack on the first hero, then 0.3 less for each next (at least 0.4×).
  - Svarog, *Nebeška kovačnica*: 2× on the first hero, 0.6× on the rest, three letters red-hot (locked).
  - Mokoš, *Materina roka*: 0.8× on everyone; she takes the damage back as health.
  - Dažbog, *Sončni voz*: 0.75× on everyone; the sun climbs and every blow is 1 stronger.
  - Stribog, *Vihar*: 0.75× on everyone and the mesh is shuffled.
  - Veles, *Korenine sveta*: 0.6× on everyone and four letters overgrown (locked).
- **Losing is losing a battle;** at the end of a journey the god leaves without a word and the journey is over.
- **Winning:** the god speaks a cryptic line (Perun: *»Hm … tebe si bom zapomnil. Ko bo naslednjič zagrmelo, se ozri v nebo.«*), **raises the fallen** (half health), gives every hero **250 XP**, is **unlocked** (never joins by themselves), and the **gift lasts the whole next journey** (stored in this browser as `zg-gift`, used up when the next journey starts).
- **A god in the party:** at that god's own shrine the party meets the **godly version** at once — no prayer and no gift. The party god does not strike their other self (their letters only count for the party's common blow; the chip says "ne udari"). Winning gives the party god **a skill point at once** and every hero 250 XP; losing follows the difficulty. Other gods' shrines are closed to a party that travels with a god.

## 3. Health, falling and healing
- Every hero has their own health bar. **Health does not come back after a battle.**
- **Wells are the main healing:** drinking restores every hero still standing to full. **Wells no longer raise the fallen (16 Nov).** Every region has a place for a well, kept by chance (§1).
- **A new level heals the hero fully (16 Nov, v0.11.0)**, besides the extra health it brings.
- **Heroes' healing is partial:** the skills of Mokoš and Zeleni Jurij (and Mokoš's zagovor) never lift a hero above 70 % of their health.
- **Healers attack too, weakly at first:** every move of Mokoš and Zeleni Jurij now also hits the target. Their hit starts at roughly half of a fighter's and grows with each level (Mokoš 1.8 → 2.2 → 2.6, Jurij 1.6 → 2.0 → 2.4, against about 3 for the others), so they catch up later while still healing.
- **Potions and poisons work by themselves; there is no tool belt.** The bag only shows what the party carries.

| Item | Used when |
| --- | --- |
| Živa voda | a hero drops to 30 % health or less (+60 % of their health) |
| Mrtva voda | a hero has fallen |
| Vesnin venec | a hero is at half health or less and the shield is gone (once per battle) |
| Morin prah | a hero is at 40 % or less (once per battle) |
| Rusalkina solza | four or more letters are locked, or a hero is asleep |
| Triglavov napoj, Perunova medica, Kresna žerjavica, Velesov strup, Volčja jagoda | a battle begins: one of them in an ordinary battle (in this order), all of them against an ambush or a boss. The poison goes to the enemy with the most health, the berry to the one that hits hardest |

- **A fallen hero stays down** until a hero's skill (Mokoš's Materina roka once per battle, Zeleni Jurij's Jurjevo once per journey), *Mrtva voda* or a beaten god raises them — or the difficulty decides otherwise (section 3c). Until then their letters are grey, and they can be left behind when a new hero is met.
- *Poskusi znova* after a lost battle is only offered in practice battles and the test mode.

## 3a. Rewards
- **Experience comes only from beaten enemies (13 Nov):** every defeated enemy drops gold at once (4 + a share of its XP) and gives its full XP to every hero still standing. Words, crosswords, chests, rock slides and darts give no XP.
- **Chest (one word):** the hidden word, or any real word from all the letters, opens it: 15–25 gold, one item, and a half-full zagovor in the next battle. A real word that leaves letters unused ends the chest with a share of the gold (no item). Running out of time gives nothing. **(v0.10.0: the word comes from the region's list in `data/words.json` and never repeats on one journey; the clue shows by Znanje; ✕ and Pošlji sit next to the word — §11.7.)**
- **Rock slide (one word):** the rocks whose letters are in the word break (3 gold per rock); the others graze the party for half damage (4 each). A word with every letter breaks the whole slide. If no word is sent, every rock lands with full force (8 each). **(v0.10.0: region rock words, 22 s to fall, the rule stated in the panel; the full redesign — §11.6 — is *not built*.)**

## 3b. Spikes trap: *Past s konicami* (the darts of 12 Nov, renamed 13 Nov; ids stay `darts`/`puscice`)
**16 Nov: the trap moves onto the road — it stands on the terrain and is played there, with no screen of its own (§11.10, *not built*).** The rules below stay.
- A wall of letters: **six slots of three letters each**. Take one letter from each slot, strictly left to right, and send the word. 35 s (70 s in calm mode).
- A hidden six-letter word always exists, but **you may send early**: a real word of 3–5 letters closes that many slots. **A word that does not exist can be sent too** — then no slot is closed.
- **The spikes only hurt (13 Nov):** each letter of a real word closes one slot; the spikes of the open slots spring at the heroes one at a time, spread over the party, each hit shown on its hero (3 damage, +1 every two regions). A word from every slot still lets one spike graze (half damage). Spikes never knock a hero out, and they do nothing for the next battle; there is no reward.
- While the wall waits, it only warns: *Konice se sprožijo – pripravi se na umik!* The rules are in the intro (two rows of letters, so it fits a phone) and in the pause.
- Like the chest and the rock slide it has a *Kako se igra* intro with a solved example, and Esc pauses it (Delete clears the letters).
- On the road it stands in Trnovski gozd, at Predjamski grad and before the dragon. It has its own sprite (a stone wall with iron spikes coming out of the slots); a new terrain sprite will come from the art branch.
- Internal ids stay `darts` and `puscice`, so saved runs, `data/world.json` and the missing-word reports keep working.

## 3c. Difficulty — part of *Znanje* (16 Nov; `DIFFS` in `src/game.js`)
**Since v0.11.0 there is one difficulty, *Znanje*.** *Težavnost* was its own choice on *Nova pot* in v0.9.0–0.10.0; its three settings now come with the three Znanje tiers (`LEVELS[…].diff`), and each Znanje card on *Nova pot* says what losing means. The old `zg-diff` setting is forgotten.

| | malček → Lahka | učenjak → Srednja | knjižni molj → Težka |
| --- | --- | --- | --- |
| Enemy health (journey only) | ×0.85 | ×1 | ×1.25 |
| Lost battle | **withdraw:** everyone gets up with a third of their health; the enemies still block the road (a god's godly version goes back into the shrine) | the journey ends | the journey ends |
| A hero down when a battle is won | gets up with a quarter of their health | stays down | **leaves the party** |

On knjižni molj only a healer's skill or *Mrtva voda* during the battle (or a beaten god at its end) saves a fallen hero. A journey that ends removes its save (§11.11).

## 4. Levels, skill points and skills (13 Nov, stopnje 16 Nov)
- **Levels 1–9** at 0, 60, 140, 240, 360, 500, 660, 840 and 1050 XP. Each level adds 8 % health and 4 % attack, a little extra for long words (up to +10 % per letter beyond the fourth at level 9), and **one skill point**, and **heals the hero fully** (v0.11.0).
- **Three skills per hero.** A word with one, two or three of the hero's letters fires skill 1, 2 or 3 — if the hero knows it; otherwise the strongest skill they know below it, with +15 % for every letter beyond it. Skill 1 is known from the start.
- **Spending points** (*Veščine*, at a well, a shrine or a pedlar): learning skill 2 (after 1) or skill 3 (after 2) costs one point. **Every known skill can be raised to stopnja 2 and 3**, one point each, and no further: stopnja 2 = +20 % power, effects 1.5× as long; stopnja 3 = +40 % power, effects 2× as long (`RANK_POW`, `RANK_DUR`). "Effects" are stuns, burns and poison, weakening and Erazem's dodges. Each stopnja also adds one fixed extra effect (`SKILL_UPS` in `src/skills.js`): *Kritični udarec* (30 % chance to hit double), *Na vse* (also hits every other enemy), *Zdravljenje* (heals the party a little), *Ščit*, *Omama* (stun), *Ogenj* (burn), *Oslabitev* (the target hits 1 weaker).
- To max out one hero takes 8 points (2 + 3 + 3) — exactly what levels 2–9 give, so the starting hero can finish only on a full journey, and a newcomer never; every journey asks which skills to grow.
- **A hero with a point to spend glows:** a ring of light rises from the head (CSS `.hero.spr.glow`), seen in the party on the road, in battle and on the hero screens, and a short synthesised chorus (`chorus()` in `src/game.js`: "aah" voices on a rising C major chord, an echo and a high shimmer) sings when the point arrives.
- **Where to see it:** the *Veščine* button on every hero screen lists the three skills, stopnja 2 and 3 and the XP to the next level. On the card, known skills are filled, the others outlined, with a star per stopnja above 1. Tapping the hero still plays the skills they know, one after another, but nothing on the screen says so (a gimmick, not a feature).
- **Outside a journey** (practice battles, the gallery, the codex) every skill is known at stopnja 1.
- **Open question:** the user described the skills as tied to "longer words". The game keeps the original rule (one, two or three of the hero's letters), which needs longer words for skills 2 and 3; switching to pure word length is a one-line change in `firedTier`.

## 5. Roster — all playable
| | Hero | Health | What they do | Moves (1 → 3 tiles) |
| --- | --- | --- | --- | --- |
| Folk | Martin Krpan | 36 | Heavy single hits; the big move stuns | Zamah → Kobilica → Lipov kij |
| Folk | Zeleni Jurij | 26 | Small heals; unlocks letters; revives once per journey | Popek → Brstenje → Jurjevo |
| Folk | Kurent | 30 | Little damage; stuns, then delays every enemy | Zvonec → Ježevka → Pregon zime |
| Folk | Kresnik | 28 | Fire that keeps burning | Žerjavica → Plamen → Kresni ogenj |
| Folk | Kralj Matjaž | 34 | Shield for the party | Meč → Kraljeva vojska → Prebujenje |
| **New** | **Erazem Predjamski** | 34 | The secret tunnel: the next enemy attack misses; the big move adds a shield | Češnje → Skrivni rov → Trdnjava v skali |
| **New** | **Peter Klepec** | 30 | Every big move makes him 12 % stronger for the rest of the battle | Pastirska palica → Izruvano drevo → Vilin dar |
| **New** | **Lepa Vida** | 26 | Her song lowers enemy attack, the big move for all of them | Hrepenenje → Morska pena → Pesem z obale |
| **New** | **Ajdovska deklica** | 38 | Turns the target to stone (stun) | Prerokba → Skalni obraz → Okamnitev |
| God | Perun | 36 | Highest burst; the big move chains to every enemy | Blisk → Grom → Nevihta |
| God | Svarog | 42 | Hit plus shield | Kladivo → Kovani ščit → Nebeška kovačnica |
| God | Mokoš | 34 | Heals, cleanses letters, revives once per battle | Kapljica → Vir → Materina roka |
| God | Dažbog | 36 | His light makes the next word ×1.5 or ×2 | Žarek → Jutranja zarja → Sončni voz |
| God | Stribog | 34 | Hits every enemy; the big move cleans the mesh | Sapica → Burja → Vihar |
| God | Veles | 46 | Hardest hits, poison; the big move strikes everyone | Kačji pik → Medvedja šapa → Korenine sveta |

Every hero has ten domain words that hit ×1.5 (Erazem: *grad, vitez, jama, rov, češnja*…).

**Characters worth exploring next:** Zlatorog (as a guide or a rare companion), Veronika Deseniška and the Counts of Celje (a Celje region), Pegam and Lambergar (a duel as a boss fight), Desetnica (the tenth daughter who must wander — fits a travelling game), Rojenice and Sojenice (fate spirits at a crossroads stop), Kralj Samo, Miklova Zala, Rokovnjači (highwaymen as enemies), Jarnik's Divji mož, Morana and Vesna as seasonal figures.

## 6. Enemies
The six drawn enemies stay. Four regional enemies reuse their sprites with a colour shift (new sprites are a task for the next art pass):

| Enemy | Sprite of | Health / attack | Special |
| --- | --- | --- | --- |
| Vešča (witch) | Mora, green | 26 / 4 | *Zli pogled*: a hero falls asleep |
| Perkmandeljc (mine dwarf) | Škrat, blue-grey | 30 / 5 | *Zasutje*: buries four letters |
| Pesjan (dog-headed raider) | Volkodlak, brown | 52 / 7 | *Lov*: a heavy hit on everyone |
| Zmajev mladič (the olm of Postojna, once believed to be a dragon's young) | Lintvern, pale | 40 / 6 | *Jamski prah*: buries four letters |

## 7. Items
Gold (*zlatniki*) comes from battles (about 7–25 per fight) and chests (15–25). The pedlar (a *krošnjar* from Ribnica) shows four potions or poisons and two relics. Chests hold one random item; ambushes and bosses drop one too (bosses always a relic).

**Relics — work all the time, one of each**

| Item | Price | Effect |
| --- | --- | --- |
| Perunova sekira | 60 | All hero attacks +15 % |
| Kamen Alatir | 60 | Highest health of every hero +20 % |
| Zlatorogova roža | 55 | Once per journey a hero survives a lethal hit with 1 health |
| Stribogova piščal | 50 | Enemies attack 15 % slower |
| Dažbogov kolut | 50 | Words of six or more letters +25 % |
| Svarogovo kladivo | 45 | Every battle starts with a shield of 8 |
| Mokošino vreteno | 45 | The zagovor fills 30 % faster |
| Velesov rog | 40 | Gold from battles and chests +50 % |
| Kurentov zvonec | 35 | The first enemy attack of every battle is late |
| Idrijska čipka | 35 | Words with Č, Š or Ž hit another 25 % harder |
| Krpanova sol | 30 | Repeated words lose less power |
| Praprotno seme | 30 | One more hint in every battle (nothing on Knjižni molj, which has no hints — §10 item 6) |
| Belokranjska pisanica | 30 | Half as much time again at chests and rock slides |

**Potions and poisons — used up automatically (see section 3 for when)**

| Item | Price | Effect |
| --- | --- | --- |
| Mrtva voda | 70 | Raises a fallen hero with half health, by itself |
| Živa voda | 40 | Drunk automatically by a hero at 30 % health or less: +60 % health |
| Triglavov napoj | 35 | Fills the zagovor at once |
| Velesov strup (poison) | 30 | The target loses health for a long time |
| Morin prah (poison) | 30 | Every enemy falls asleep for a while |
| Perunova medica | 25 | The next three words hit 50 % harder |
| Volčja jagoda (poison) | 25 | The target attacks 30 % weaker for the rest of the battle |
| Kresna žerjavica | 25 | Every enemy burns |
| Vesnin venec | 20 | Party shield +15 |
| Rusalkina solza | 15 | Cleans locked letters and wakes sleeping heroes |

On the name *Perun's Hammer*: in the sources Perun's weapon is an axe (and the thunder-stone), so the relic is **Perunova sekira**; the hammer belongs to the smith, **Svarogovo kladivo**. Easy to rename if the hammer is preferred.

## 8. Art added (11 Nov, afternoon)
- **Heroes (48×48, idle + attack):** Erazem (open helmet with a red plume, moustache, red tabard, shield; the attack throws the cherries he pelted his besiegers with), Peter Klepec (straw hat, barefoot, an uprooted tree), Lepa Vida (long dark hair, red ribbon, linen in her hand; sea foam), Ajdovska deklica (larger, half turned to stone, edelweiss in her hair; stone fist). Each has three painted cards and a backstory.
- **Road objects:** chest (closed and open), well (bucket down and up), rock slide with a warning board, shrine (carved idol with two fires; since 16 Nov six god shrines and six god signs, section 2a), pedlar with a loaded *krošnja*, signpost; a rock for the rock-slide mini-game; a gold coin.
- **Item icons:** 23 icons, 16×16.
- **Backgrounds (384×120):** Ptuj, Peca, Triglav, Bled, Piranske soline, Predjamski grad, next to the four older ones.
- Everything is generated by `tools/art_extra.py` and is still prototype art to fix the direction.

## 9. Towards Godot
- `data/world.json` (regions, stops, items, checkpoints), `data/words.json`, `data/meanings.json` and `data/clues.json` are already engine-neutral. The hero kits, enemy patterns and item effects are small switch statements in `src/game.js` / `src/journey.js` and map one to one onto GDScript `match` blocks.
- The travel screen is a camera-less scroller (party fixed, world offset), which is a `ParallaxBackground` plus one `Node2D` per stop in Godot.
- Sprite sheets are plain PNG frames (idle | attack), ready for `AnimatedSprite2D`.
- **Road encounters in the scene (§11.10)** fit this directly: the encounter object is the stop's own `Node2D`, and the puzzle panel is the same scene that battles use under the road view.
- **The journey save (§11.11)** is plain JSON (`zg-save`, versioned), so the same structure becomes a file in `user://` in Godot.

## 10. Still to decide
1. Gods as starters: a god beaten in a challenge is unlocked like anyone else, so they can also start a journey. Keep, or should gods never start?
2. Left out for now, as in the original game: a tool belt for choosing potions by hand, and more potions (slow time and others).
3. Journey length: ten regions and 19 battles is long for one sitting. **Saving decided and built (§11.11): checkpoints by Znanje.** Whether the road should also be shorter is still open.
4. Should a hero you leave behind be met again later, or are they gone (as now)?
5. Which regions come next (Bela krajina, Celje, Kras in Škocjan, Kočevski rog, Prekmurje)?
6. *Praprotno seme* (one more hint per battle): on *knjižni molj*, which has no hints, it now gives nothing. Leave it, or repurpose it there?
7. *Kaj pomeni?* (§11.9): built with Claude's proposals as defaults — one meanings file for the whole game, chips on the battle result instead of a button in the live word bar, two chip groups. Confirm or change.
8. ~~Znanje scaling monster health overlaps Težavnost's ×0.85–×1.25~~ — **settled 16 Nov:** Težavnost is part of Znanje now (§3c), so its ×0.85 / ×1 / ×1.25 enemy health *is* Znanje's scaling. Whether higher tiers need more on top is a balance question for the next test.
9. ~~Three-letter words~~ — **decided and built 16 Nov:** accepted on every tier (§11.3).
10. ~~Save details~~ — **decided 16 Nov:** checkpoints are sparse by Znanje, so a replayed stretch after quitting is the cost of quitting; no per-stop saves, no seed, no special rule for quitting mid-battle (§11.11).
11. ~~Chests at Ljubljanica and Ljubljanski grad~~ — **decided and built 16 Nov:** a chest at the start of each. **Changed the same evening (v0.11.0):** every region has a place for a chest and for a well, each kept by chance **by Znanje** (Težavnost is part of Znanje now), with at least one chest and a well in each half of the road (§1).

## 11. Decisions of 16 Nov, from the Round 3 playtest

From the Round 3 playtest review (see `zagovor-playtest-notes.md`) and the Wordscapes-style reference. Credits and naming are in `zagovor-store-release.md`; the branch to-do in `zagovor-080-alpha-fixes.md`.

### 11.1 Geographic word seeding — *not built*
The letter pools of every letter puzzle (mesh, wheel, chest, rocks) favour words of the current region: its landmark and surroundings, the region's enemies, and the heroes recruitable there. The same algorithm guarantees a hero's personal words are actually spellable when that hero is in the party (povodni mož → *voda*, *Ljubljanica* — a tester deliberately hunted for these and the letters were never there). The first word lists are in `data/words.json` (`theme` per region, to review); chests and rock slides already draw from that file.

### 11.2 One recruitable hero per region — *not built*
Hard cap: **one** recruitable hero per region. Where two or more heroes belong to a region, the one who appears is **randomized per journey**. The current journey table has one named hero per region, so this binds mostly future regions (a Celje region with Veronika Deseniška *and* the Counts, say).

### 11.3 Znanje tiers — *malček / učenjak / knjižni molj* (bookworm)
~~Split: **Znanje** governs puzzle help, **Težavnost** governs combat consequences.~~ **Changed 16 Nov, late (v0.11.0): Znanje is the one difficulty** — malček plays with Lahka's consequences, učenjak with Srednja's, knjižni molj with Težka's (§3c), so Znanje also scales monster health (×0.85 / ×1 / ×1.25). With more health, battles run longer and monsters get more attacks in, so higher tiers demand faster solving — tuned so that good team strategy keeps it challenging but not too hard.

**Three-letter words count on every tier — built (v0.10.0).** The 4-letter minimum on *učenjak* and *knjižni molj* is removed. Three-letter words already deal the lowest damage (×1); watch for short-word spam on *knjižni molj* in the next balance test.

**Starter-help words — built on the letter mesh (v0.11.0; `plantStarters` in `src/game.js`, `LEVELS[…].starters`):** when a battle's letter mesh opens, some whole words lie **in rows, readable from the left or the right**, one word per row. About half are words of the region (`data/words.json`: chest, rock and theme words) **in any of their forms** (*sklanjatve*, *spreganje*: VINA, GRADU, KROFI), the rest any word the game may suggest; never two forms of one base form in one mesh. The battle log says so; on malček and učenjak the coach tip does too until the first word is played (the very first battle keeps its own input tips). *Premešaj* lets the words go. Battles outside a journey always get the help. The wheel-križanka (§11.4) will take the same words when it is built.

| | *malček* | *učenjak* | *knjižni molj* |
| --- | --- | --- | --- |
| Starter words | four: 5, 4, 4 and 3 letters | three: 4, 3, 3 | two of 3 letters |
| Running backwards | about a quarter | about 40 % | about half |
| How long the help lasts | the first **half of the road** (Ptuj to Trnovski gozd) | the first **quarter** (Ptuj, Peca, Triglav) | the **starting region only** (Ptuj) — a reminder of what to do |

**Hints — built (v0.10.0):** *malček* — Namig (3 per battle), Razkrij črko, chest clue always; *učenjak* — Namig (1), Razkrij črko (2), the chest clue on about every other chest; *knjižni molj* — **no hints anywhere**: no Namig (not even with *Praprotno seme*), no Razkrij črko, no chest clue, and the buttons are gone.

### 11.4 Wheel-križanka — *not built*
The crossword grid stays as the progress display; input moves to a **letter wheel** — no picking a row or cell to type into. No clues: help is pre-revealed letters here and there by tier, plus the §11.3 starter words. **PC and tablet** get a main-menu setting to swap the wheel for the classic typed crossword (bigger screens, room for a real keyboard). With the wheel in place, the **in-game on-screen keyboard is removed from the game entirely**.

### 11.5 Input rules — mesh — built (v0.10.0)
- **Drag and tap both stay.**
- **Drag:** lifting the finger **sends the word automatically**. A word that isn't real briefly flashes red, then clears — nothing else happens.
- **Tap:** tapping the last letter again still sends, **and** a *Pošlji* button sits next to the assembled word (with ✕) as a second way to send. One Pošlji only.
- **Hints stay visible while dragging:** the proposal row stands still until the finger lifts, and *Namig* is a lasting chip (with its two letters marked) until its word is played or the mesh is shuffled.
- **Only the shortest version of a word is proposed** (DELA, not DELATI or DELALA): a longer word that starts with a shorter proposal, or another form of the same base form, waits. The same rule picks the *Namig* word.
- A word typed on a computer keyboard stays after a "not a word" so it can be corrected.
- The wheel follows the same rules when it comes (§11.4).

### 11.6 Rock slide (*plaz*) redesign — *partly built*
Built (v0.10.0): the rocks come from the region's rock words (`data/words.json`: Peca, Triglav, Predjamski grad, Ljubljanski grad), fall slower (22 s, calm mode 40 s), and the panel says the letters may stand anywhere in the word, in any order. *Not built (next branch, with the wheel):*
- **Same-screen start:** no scene switch — a brief screen shake with boulder-rolling sound, then the slide begins on the road (§11.10).
- **All boulders visible at once, falling slowly.** The background is **blurred and darkened** during input so the task is clear.
- **Input through the letter wheel** (the keyboard is gone).
- **Blanks always shown** — `_ _ _ _ _ (0/5)`; letters taken from rocks and letters entered from the wheel both count into the word, and **more than one word is accepted**.
- **Tier shapes:** *malček* — smaller rocks and more of them (more letter hints); harder tiers — bigger rocks, fewer of them; the hardest — **one single boulder** hurtling down with only one or two letters shown.
- **Outcome:** a correct word grants minimal or no damage. **Built:** if the game has a meaning for the word it is shown; otherwise *Kaj pomeni?* appears next to it (§11.9).
- **Placement:** rock slides appear only near the **hillsides** of regions: Peca, Triglav, the cliff of Predjamski grad and the castle hill of Ljubljanski grad (the last two added 16 Nov, v0.10.0).

### 11.7 Chests and traps — built (v0.10.0), except the wheel
- **Far wider word pools:** each region has its own chest words with clues in `data/words.json` (a first list of 114 words, 11–13 per region, to review); a chest never repeats a word on one journey. Chests stand at Ptuj, Bled, Trnovski gozd, Predjamski grad, Ljubljanica and Ljubljanski grad (the start of each of the last two), each by chance on a journey (§1).
- **The clue by Znanje:** always on *malček*, on about every other chest on *učenjak*, never on *knjižni molj*.
- **Chest UI:** ✕ and *Pošlji* sit next to the assembled word; the text says a mistake can be cleared.
- *Not built:* the letter wheel here too, with shorter words from the visible letters allowed (§11.4).
- Played **on the road**, not on screens of their own (§11.10, *not built*).

### 11.8 Post-match, folk cards and character screens — *partly built*
- **Built:** hero screens (meeting a hero, after a battle, the party) end in a **full-width footer** right under the content; on a phone it sticks to the bottom of the screen, so the way on is never below the fold (checked on 360×640).
- **Built:** *Upravljanje* in *Kako igrati* covers phone, tablet and computer (this device first), and says the game is most comfortable on a tablet or computer.
- *Not built:* **post-match screen** (the team, the **last damage dealer** in front, statistics on the others and on their cards); **folk cards** minted by character achievements, stored in the achievements view; the character screen's toggle between bio and folk cards, a tapped card full screen.

### 11.9 Word meanings collected from players — *Kaj pomeni?* — built (v0.10.0)
Replaces the 12 Nov "dictionary slip" data plan (`zagovor-next-dictionary-build.md`). Meanings are not sourced up front; players tell us which words need one, and the set grows release by release.

**Decided and built:**
- **The loop:** when a player finds a word that is **new to them** (counted by base form) and the game has **no meaning** for it, it can be asked about with *Kaj pomeni?*. One tap sends it; the chip turns to ✓ with *»Hvala! Pomen dodamo v eni od naslednjih posodobitev.«*, and the word is never offered again on that device. When the game has a meaning, the meaning shows instead.
- **What is sent:** the word, where it was played and the **region** (never shown in the UI), level, pace, device and version. Nothing personal.
- **Same pipeline as missing words:** one Google Form, unchanged; *Opomba* carries the kind (`manjka` / `pomen`), *Kje* the place and region; one row per word; the offline queue as before.
- **The report screen is chips only — no text fields** (*Pošlji besede*, in the pause and on *O igri*).
- **Gradual filling:** meanings are written by hand into `data/meanings.json` (keyed by the word or its base form; empty for now). The dictionary tools are built by the user, not in this branch.

**Claude's proposals, built as defaults (§10 item 7):**
- **One meanings file for the whole game,** keyed by base form, not one per region; the region JSON (`data/words.json`) holds word lists only. Region tallies in the reports are a priority signal for curation.
- **No extra button in the live word bar of a battle** — a stray tap under time pressure costs a word. New words appear as chips on the **battle result**; at the chest, rock slide and spikes the chip sits next to the word on the result.
- **Two chip groups** on *Pošlji besede*: *Zavrnjene besede* (`manjka`) and *Nove besede* (`pomen`); tap picks, tap again drops; *Pošlji izbrane* sends them.

**Constraints:**
- **Glosses are written fresh** — one line, Slovene, reviewed by a native speaker. Sources may be consulted, but definitions are not copied: eSSKJ is CC BY-NC-ND (not for a commercial game); thesaurus synonyms are CC BY-SA (fine with attribution); Pleteršnik is CC BY and suits mythic and archaic words.
- **Ships bundled, offline** — no lookup at play time (Apple 4.2 review runs offline).
- **Store declarations:** sending words and regions is still data collection — declare it in Google Play's Data safety form and Apple's privacy label and in the privacy policy.
- **Why reports seemed not to arrive:** the code counts a request that leaves the device as sent; the prototype runs as a claude.ai artifact, which may not reach other sites, so reports queue on the device. The Android app and a page opened from its own file or site send them.

### 11.10 Road encounters stay in the scene — *not built* (needs sprites)
- The **spikes trap** (*Past s konicami*), **chests** and **rock slides** are seen on the terrain of the journey road and played there — **no separate screen**, the way wells already work.
- The party walks up to the object, the road view stays on top with the object in front of the party, and the puzzle panel opens below it — the same layout as a battle, so it can reuse the battle's screen structure and the Round 2 rule that the puzzle never scrolls away from the scene.
- Outcomes play out in place: spike hits and rock impacts land on the party sprites; the chest opens on the road.
- Pause, the *Kako se igra* intros and the pre-puzzle indicator work as they do for battles.
- **Sprites come later** from the art branch; the current ones stand in until then.
- Why: in Words for Evil every trap and chest was its own screen, so this distances *Za govor!* in presentation, not only in naming.

### 11.11 Save and exit — built (v0.10.0)
With this much reading (intros, bios, folk cards) and a long road, players must be able to stop and come back.

- **Checkpoints by Znanje** (16 Nov, replacing "save after every won battle"): the journey is saved after the **last battle of these regions** (`data/world.json → checkpoints`; counted in battles, 19 on the road, rounded to a region's end):

| Znanje | Saves | Where |
| --- | --- | --- |
| *malček* | every quarter of the road | Peca, Trnovski gozd, Predjamski grad |
| *učenjak* | every third | Triglav, Piranske soline |
| *knjižni molj* | once, at the half | Trnovski gozd (after the shrines at Bled) |

- **What is saved:** the party (heroes, health, XP, levels, skill points, stopnje), gold, bag and relics, the prayer and gift, the position on the road, the journey's plan (kept hero stops, shrines, chests and wells) and Znanje / Tempo (no Težavnost of its own since v0.11.0; a 0.10.0 save still loads and gets its wells planned). One slot (`zg-save`, with a format version); a save from an older build that no longer fits is dropped with a message.
- **The result of a checkpoint battle says *Shranjeno*.** After closing the page, *Nadaljuj pot (Peca · shranjeno)* on the start screen continues from there; *Nova pot* says the saved journey will be removed.
- **Izhod** replaces *Meni* in the road's header and is in the pause window of journey battles (and the Android back button on the road asks the same). It asks first and says where the game last saved: *»Napredek je shranjen po zadnji zmagi – Peca.«* — or, before the first save, *»Napredek še ni shranjen – prvo shranjevanje: Peca.«* Leaving mid-battle starts that battle again when the journey continues.
- **A new, finished or lost journey removes the save.**
- The sparse checkpoints are also the answer to quitting to undo a loss or reroll a stop: it costs the whole stretch since the last checkpoint. No per-stop saves, no seed, no special rule for a battle left midway.
