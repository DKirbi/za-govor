# Za govor — journey and progression design (updated 11 Nov 2026, evening)

Prototype: https://claude.ai/artifact/NTdMnud7X8Um2p38G1fVnb

This replaces the earlier "three starters and cursed-god bosses" proposal. Everything below is built in the browser prototype unless marked *not built*.

## Status at a glance
- **Decided by the user (11 Nov):** the 2D side-scrolling journey is the point of the game; the levels are places in Slovenia visited one after another, with no level list; the dragon at Ljubljana castle is the final battle; healing happens only at special places such as wells; the player starts with one character; four is the most in a party; only one god per play, and gods are stronger; Erasmus of Lueg (Erazem Predjamski) is a new character and more should be explored; all characters are unlocked; there are items with mythical Slavic names; merchants sell potions, poisons and attack boosts; traps, chests and wells have their own sprites; the web prototype is expanded for fast testing and Godot stays the end goal.
- **Evening fixes (built):** partial healing outside wells, automatic potions, wells raise the fallen, gold and XP from every enemy, one-word chests and rock slides with partial outcomes, Krpan as the first starter with unlocks.
- **Built:** the journey (ten regions, 45 stops), choosing the first hero, meeting and swapping heroes, the shrine with one god, wells, the pedlar, gold, 23 items, random regional enemies, sprites for every stop, four new heroes, battle abilities for all fifteen heroes.
- **Parked:** cursed gods as bosses (section 7 of the old design). Gods are simply powerful companions now.
- **Not balance-tested:** the journey runs end to end in automated tests, but nobody has played it through for difficulty.

## 1. The journey
One road, walked left to right. The party stands still and the world scrolls past; the background pans slowly across the landmark of the region. Walking stops at every stop and a prompt offers what can be done there. A signpost at the end of each region leads to the next.

| # | Region | Landmark in the background | Hero who waits there | Stops | Enemies |
| --- | --- | --- | --- | --- | --- |
| 1 | Ptuj | castle above the snowy town | Kurent | battle, hero, chest, battle | Škrat, Vešča |
| 2 | Peca | King Matjaž's cave | Kralj Matjaž | battle, rock slide, hero, well, battle | Perkmandeljc, Škrat, Pesjan |
| 3 | Triglav | the three peaks | Ajdovska deklica | battle, rock slide, hero, pedlar, battle | Pesjan, Perkmandeljc, Vešča |
| 4 | Bled | island church, castle on the cliff | Kresnik (fallback) | battle, chest, **shrine**, well, battle | Vodna vila, Vešča, Škrat |
| 5 | Trnovski gozd | moonlit forest | Martin Krpan | battle, chest, hero, battle | Mora, Volkodlak, Vešča |
| 6 | Piranske soline | salt pans, Piran at sunset | Lepa Vida | battle, pedlar, hero, well, battle | Vodna vila, Pesjan, Mora |
| 7 | Predjamski grad | the castle in the cliff | Erazem Predjamski | battle, rock slide, hero, chest, ambush | Zmajev mladič, Perkmandeljc, Volkodlak |
| 8 | Ljubljansko barje | pile dwellings in the mist | Zeleni Jurij | battle, well, hero, pedlar, battle | Škrat, Mora, Volkodlak, Vodna vila |
| 9 | Ljubljanica | Tromostovje | Peter Klepec | battle, hero, well, **boss: Povodni mož** | Vodna vila, Mora |
| 10 | Ljubljanski grad | the castle wall at sunset | — | pedlar, well, **boss: Lintvern** | — |

- **Random enemies:** each battle draws its enemies from the region's pool. One enemy while the party is a single hero, two after that. The very first fight is always one Škrat with the tutorial tips.
- **Scaling:** enemy health +10 % and attack +6 % per region (bosses are fixed).
- **If the local hero is already with you** (or was your starter), another folk hero you have not met stands there instead; if none is left, the stop becomes a well.
- **Data:** regions, stop order, enemy pools and items live in `data/world.json`, so the Godot game can read the same file.

## 2. Party rules
- **The first journey always starts with Martin Krpan.** Every folk hero you meet on the road is unlocked (remembered in the browser) and can start a later journey.
- **Three starters at most:** the start screen offers Krpan and up to two unlocked folk heroes, drawn at random; locked places are shown as "Še neodkrit". **Gods never start a journey.** (Test mode offers all nine folk heroes.)
- **Heroes are met at random:** each hero stop holds a random folk hero you have not met on this journey, preferring ones not yet unlocked.
- **At most four** travel together. A fifth can only take somebody's place; a hero who has fallen can be left behind this way ("Zapusti").
- **One god per journey.** At the shrine on Bled three random gods offer themselves and one may join.
- **A hero who joins** arrives at the party's average level.
- **Gods are stronger:** attack ×1.35 (Veles ×1.5) and about a quarter more health than folk heroes.
- **Letter mesh:** the share of coloured tiles grows with the party (30 % with one hero, 46 %, 56 %, 62 % with four).

## 3. Health, falling and healing
- Every hero has their own health bar. **Health does not come back after a battle.**
- **Wells are the main healing:** drinking restores every hero to full and raises the fallen. There are six wells on the road.
- **Heroes' healing is partial:** the skills of Mokoš and Zeleni Jurij (and Mokoš's zagovor) never lift a hero above 70 % of their health.
- **Potions work by themselves:** a hero who drops under 30 % in a battle drinks *Živa voda* (+60 % of their health) and the flask is gone. On the road it can be given by hand to the most wounded hero.
- **A fallen hero stays down** until a well, a hero's skill (Mokoš's Materina roka once per battle, Zeleni Jurij's Jurjevo once per journey) or *Mrtva voda* raises them. Until then their letters are grey, and they can be left behind when a new hero is met.
- After a lost battle the prototype still lets you try again from the state before the fight; "Konec poti" ends the run.

## 3a. Rewards
- **Every defeated enemy** drops gold at once (4 + a share of its XP) and gives its full XP to every hero still standing.
- **Chest (one word):** the hidden word, or any real word from all the letters, opens it: 50 XP for every hero, 15–25 gold, one item, and a half-full zagovor in the next battle. A real word that leaves letters unused ends the chest with a share of the reward (XP and gold in proportion to the letters used, no item). Running out of time gives nothing.
- **Rock slide (one word):** the rocks whose letters are in the word break (8 XP for every hero and 3 gold per rock); the others graze the party for half damage (4 each). A word with every letter breaks the whole slide. If no word is sent, every rock lands with full force (8 each).

## 4. Levels (unchanged)
Three levels per hero: level 2 at 50 XP, level 3 at 140 XP; health ×1.25 / ×1.6, attack ×1.15 / ×1.3, and long words add 4 % / 10 % per letter beyond the fourth.

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
| Praprotno seme | 30 | One more hint in every battle |
| Belokranjska pisanica | 30 | Half as much time again at chests and rock slides |

**Potions and poisons — used up; in battle from the bag (key 3)**

| Item | Price | Effect |
| --- | --- | --- |
| Mrtva voda | 70 | Raises a fallen hero with half health (also on the road) |
| Živa voda | 40 | Drunk automatically by a hero under 30 % health in battle: +60 % health; can be given by hand on the road |
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
- **Road objects:** chest (closed and open), well (bucket down and up), rock slide with a warning board, shrine (carved idol with two fires), pedlar with a loaded *krošnja*, signpost; a rock for the rock-slide mini-game; a gold coin.
- **Item icons:** 23 icons, 16×16.
- **Backgrounds (384×120):** Ptuj, Peca, Triglav, Bled, Piranske soline, Predjamski grad, next to the four older ones.
- Everything is generated by `tools/art_extra.py` and is still prototype art to fix the direction.

## 9. Towards Godot
- `data/world.json` (regions, stops, items) and `data/clues.json` are already engine-neutral. The hero kits, enemy patterns and item effects are small switch statements in `src/game.js` / `src/journey.js` and map one to one onto GDScript `match` blocks.
- The travel screen is a camera-less scroller (party fixed, world offset), which is a `ParallaxBackground` plus one `Node2D` per stop in Godot.
- Sprite sheets are plain PNG frames (idle | attack), ready for `AnimatedSprite2D`.

## 10. Still to decide
1. Starters: now Krpan plus up to two random unlocked folk heroes. Should the three be fixed instead (for example Krpan, Zeleni Jurij, Kurent)?
2. Journey length: ten regions and 19 battles is long for one sitting. Save points, or a shorter road?
3. Should a hero you leave behind be met again later, or are they gone (as now)?
4. One shrine or several (different gods in different places)?
5. Which regions come next (Bela krajina, Celje, Kras and Škocjan, Kočevski rog, Prekmurje)?
