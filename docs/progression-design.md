# Za govor — journey and progression design (updated 13 Nov 2026, v0.9.0)

Prototype: https://claude.ai/artifact/NTdMnud7X8Um2p38G1fVnb

This replaces the earlier "three starters and cursed-god bosses" proposal. Everything below is built in the browser prototype unless marked *not built*.

## Status at a glance
- **Decided by the user (11 Nov):** the 2D side-scrolling journey is the point of the game; the levels are places in Slovenia visited one after another, with no level list; the dragon at Ljubljana castle is the final battle; healing happens only at special places such as wells; the player starts with one character; four is the most in a party; only one god per play, and gods are stronger; Erasmus of Lueg (Erazem Predjamski) is a new character and more should be explored; all characters are unlocked; there are items with mythical Slavic names; merchants sell potions, poisons and attack boosts; traps, chests and wells have their own sprites; the web prototype is expanded for fast testing and Godot stays the end goal.
- **13 Nov, v0.9.0 (built, "skill expansion and fixes"):** XP only from beaten enemies; levels 1–9, each with a skill point; three skills per hero, learned and upgraded three times at wells, shrines and pedlars (section 4); three heroes per journey, favouring the hero of each place; only a hero who joins is unlocked; the shrine's prayer, blessing and trial (section 2a); darts that only hurt.
- **12 Nov (built):** the darts event (*Puščice v zidu*), the start screen with silhouettes and three known starters, attacks for the healers, every potion used automatically.
- **Evening fixes (built):** partial healing outside wells, automatic potions, wells raise the fallen, gold and XP from every enemy, one-word chests and rock slides with partial outcomes, Krpan as the first starter with unlocks.
- **Built:** the journey (ten regions, 48 stops), choosing the first hero, meeting and swapping heroes, the shrine with one god, wells, the pedlar, gold, 23 items, random regional enemies, sprites for every stop, four new heroes, battle abilities for all fifteen heroes.
- **Back, in a new form (13 Nov):** cursed gods as bosses. A god you pray to at the shrine helps for three battles, then has to be beaten (section 2a).
- **Not balance-tested:** the journey runs end to end in automated tests, but nobody has played it through for difficulty.

## 1. The journey
One road, walked left to right. The party stands still and the world scrolls past; the background pans slowly across the landmark of the region. Walking stops at every stop and a prompt offers what can be done there. A signpost at the end of each region leads to the next.

| # | Region | Landmark in the background | Hero of the place (6× more likely to wait there) | Stops | Enemies |
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
- **Three heroes per journey (13 Nov):** a hero always waits at Ptuj; two more regions with a hero stop are picked at random and the other hero stops are left out, so one journey never meets everyone. At a hero stop the hero of the place is six times as likely as anyone else, and heroes not yet unlocked twice as likely; if nobody is left, the stop becomes a well.
- **Data:** regions, stop order, enemy pools and items live in `data/world.json`, so the Godot game can read the same file.

## 2. Party rules
- **Start screen:** all fifteen characters are shown. On a fresh game only **Martin Krpan, Zeleni Jurij and Kurent** are known and can start; the other twelve are nameless silhouettes. You pick one.
- **Joining unlocks (13 Nov):** a hero is unlocked for later journeys only when they join the party; greeting them and walking on leaves them unknown, so a full party has to choose whom to leave. A god is unlocked by beating them in the shrine's trial. (Test mode shows everyone.)
- **At most four** travel together. A fifth can only take somebody's place; a hero who has fallen can be left behind this way ("Zapusti").
- **One god per journey.** A god joins only if you beat them in an earlier journey's trial; then they can join at a shrine.
- **A hero who joins** brings half the party's average experience (and the skill points of the levels it gives); they know only skill 1.
- **Gods are stronger:** attack ×1.35 (Veles ×1.5) and about a quarter more health than folk heroes.
- **Letter mesh:** the share of coloured tiles grows with the party (30 % with one hero, 46 %, 56 %, 62 % with four).

## 2a. The shrine: prayer, blessing, trial (13 Nov)
- At the shrine on Bled three random gods are caught in a curse. **Pray to one** and for the **next three battles** the god fights beside you: a blow on every enemy when each battle starts (6 + 2 per region), and every word ×1.15. The battle header shows "blagoslov: *god* (*battles left*)".
- **After the third battle** the curse turns the god against you: the cursed god (their own sprite, tinted) is fought at once, with their first and third skill as attacks (90 + 12 health per region).
- **Win:** the curse breaks, the god thanks you ("Urok je zlomljen") and is **unlocked** for later journeys. **Lose:** the party withdraws, the god stays cursed and the journey goes on.
- A god beaten in an earlier journey can also simply **join** at a shrine (still one god at a time).

## 3. Health, falling and healing
- Every hero has their own health bar. **Health does not come back after a battle.**
- **Wells are the main healing:** drinking restores every hero to full and raises the fallen. There are six wells on the road.
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

- **A fallen hero stays down** until a well, a hero's skill (Mokoš's Materina roka once per battle, Zeleni Jurij's Jurjevo once per journey) or *Mrtva voda* raises them. Until then their letters are grey, and they can be left behind when a new hero is met.
- After a lost battle the prototype still lets you try again from the state before the fight; "Konec poti" ends the run.

## 3a. Rewards
- **Experience comes only from beaten enemies (13 Nov):** every defeated enemy drops gold at once (4 + a share of its XP) and gives its full XP to every hero still standing. Words, crosswords, chests, rock slides and darts give no XP.
- **Chest (one word):** the hidden word, or any real word from all the letters, opens it: 15–25 gold, one item, and a half-full zagovor in the next battle. A real word that leaves letters unused ends the chest with a share of the gold (no item). Running out of time gives nothing.
- **Rock slide (one word):** the rocks whose letters are in the word break (3 gold per rock); the others graze the party for half damage (4 each). A word with every letter breaks the whole slide. If no word is sent, every rock lands with full force (8 each).

## 3b. Darts: *Puščice v zidu* (new mini-event)
- A wall of letters: **six columns of three letters**. Take one letter from each column, strictly left to right, and send the word. 35 s (70 s in calm mode).
- A hidden six-letter word always exists, but **you may send early**: a real word of 3–5 letters stops that many darts. **A word that does not exist can be sent too** — then no dart is stopped.
- **The darts only hurt (13 Nov):** each letter of a real word stops one dart; the others fly at the heroes one at a time, spread over the party, each hit shown on its hero (3 damage, +1 every two regions). A word from every column still lets one dart graze (half damage). Darts never knock a hero out, and they do nothing for the next battle; there is no reward.
- While the wall waits, it only warns: *Puščice se izstrelijo – pripravi se na umik!* The rules are in the intro (two rows of letters, so it fits a phone) and in the pause.
- Like the chest and the rock slide it has a *Kako se igra* intro with a solved example, and Esc pauses it (Delete clears the letters).
- On the road it stands in Trnovski gozd, at Predjamski grad and before the dragon. It has its own sprite (a wall with dart holes).

## 4. Levels, skill points and skills (13 Nov)
- **Levels 1–9** at 0, 60, 140, 240, 360, 500, 660, 840 and 1050 XP. Each level adds 8 % health and 4 % attack, a little extra for long words (up to +10 % per letter beyond the fourth at level 9), and **one skill point**.
- **Three skills per hero.** A word with one, two or three of the hero's letters fires skill 1, 2 or 3 — if the hero knows it; otherwise the strongest skill they know below it, with +15 % for every letter beyond it. Skill 1 is known from the start.
- **Spending points** (*Veščine*, at a well, a shrine or a pedlar): learning skill 2 (after 1) or skill 3 (after 2) costs one point; after that **every skill can be upgraded three times**, one point each. The upgrades are fixed per skill and bought in order (`SKILL_UPS` in `src/skills.js`): *Moč* (+25 % power), *Kritični udarec* (30 % chance to hit double), *Na vse* (also hits every other enemy), *Zdravljenje* (heals the party a little), *Ščit*, *Omama* (stun), *Ogenj* (burn), *Oslabitev* (the target hits 1 weaker).
- To max out one hero takes 11 points; a journey gives the starting hero about 8, so every journey asks which skills to grow.
- **Where to see it:** the *Veščine* button on every hero screen lists the three skills, their upgrades and the XP to the next level. On the card, known skills are filled, the others outlined, with a star per upgrade. Tapping the hero plays the skills they know, one after another.
- **Outside a journey** (practice battles, the gallery, the codex) every skill is known and nothing is upgraded.

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
- **Road objects:** chest (closed and open), well (bucket down and up), rock slide with a warning board, shrine (carved idol with two fires), pedlar with a loaded *krošnja*, signpost; a rock for the rock-slide mini-game; a gold coin.
- **Item icons:** 23 icons, 16×16.
- **Backgrounds (384×120):** Ptuj, Peca, Triglav, Bled, Piranske soline, Predjamski grad, next to the four older ones.
- Everything is generated by `tools/art_extra.py` and is still prototype art to fix the direction.

## 9. Towards Godot
- `data/world.json` (regions, stops, items) and `data/clues.json` are already engine-neutral. The hero kits, enemy patterns and item effects are small switch statements in `src/game.js` / `src/journey.js` and map one to one onto GDScript `match` blocks.
- The travel screen is a camera-less scroller (party fixed, world offset), which is a `ParallaxBackground` plus one `Node2D` per stop in Godot.
- Sprite sheets are plain PNG frames (idle | attack), ready for `AnimatedSprite2D`.

## 10. Still to decide
1. Gods as starters: a god met at the shrine is now unlocked like anyone else. Keep, or should gods never start?
2. Left out for now, as in the original game: a tool belt for choosing potions by hand, and more potions (slow time and others).
3. Journey length: ten regions and 19 battles is long for one sitting. Save points, or a shorter road?
4. Should a hero you leave behind be met again later, or are they gone (as now)?
5. Which regions come next (Bela krajina, Celje, Kras and Škocjan, Kočevski rog, Prekmurje)?
