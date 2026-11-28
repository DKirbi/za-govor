# Za govor — journey and progression design (updated 25 Nov 2026, v0.20.0)

Prototype: https://claude.ai/artifact/NTdMnud7X8Um2p38G1fVnb

This replaces the earlier "three starters and cursed-god bosses" proposal. Everything below is built in the browser prototype unless marked *not built*.

## Status at a glance
- **28 Nov — v0.23.0, branch `feat/boss-bars-events` (built, stacked on PR #46):** bosses and mini-bosses with **health bars** — two for the gods and Povodni mož, three for the Lintvern — and a **timed letter-wheel event** at the middle of each bar (§12); the bar drains from the right; the old lock crossword and Zmajeva uganka gave way to the events.
- **25 Nov — v0.20.0 (prepared 24 Nov as v0.18.0), PR #39 `feat/party-three-gods-queue` (built, Game Director's decisions of 24 Nov):** a party of **three** at most (§2); **two shrines** per journey, never in the last region, and the gods' new rules: a fair fight with everyone healed and skill points spendable before it, a won challenge keeps the gift to the journey's end (no longer into the next journey), a lost one never ends the journey and lets the gift go out after the next region (§2a); **at most three enemies on screen**, the rest wait in line (`docs/combat-system.md` §3).
- **24 Nov (decided; built since):** the wheel-križanka on every device's settings, keeping the in-game keyboard (§11.4, built v0.22.0 for the zagovor); bosses and mini-bosses with **two or three health bars** and a **timed letter-wheel event** for each (§12, built v0.23.0).
- **25 Nov — v0.19.0, PR #38 `codex/folk-skill-cards` (built, draft for review):** Codex's painted skill cards in battle as an A/B test and collected on the hero screen; 59 achievements and 15 story cards (`docs/achievements-design.md`, `data/achievements.json`); Codex's folk parallax backgrounds for six regions as preview variants (§11.8; `docs/art-benchmarks/background-parallax-roadmap.md`).
- **20 Nov — v0.17.0, branch `feat/balance-e` (built, balance E from simulations of the real game, §4c):** every hero levels on their own and more slowly, with one point of their own a level; skill points are spent, and skills shown, only at wells and signposts; three battles a region and one chest or trap; enemies steeper in the second half, tougher bosses, Knjižni molj steeper. Malček is won about half the time at a word every 10 s (balance D: 98 %). A simulator that plays the built game (`tools/sim/`).
- **17 Nov — v0.13.0, branch `feat/balance-d` (built, balance version D from the simulations):** the party levels together and shares its skill points; a reviewed hero fires every skill they know up to the number of their letters; enemies grow by region, with a third enemy from Bled and strong enemies from Trnovski gozd; Ptuj is the same tutorial on every Znanje; Knjižni molj steepens towards the castle; Povodni mož and a new Lintvern with three attacks, scorched letters and wyverns; opt-in battle statistics for testers (§4b). Monsters and gods get their own review later; D is the working balance until then.
- **Decided by the user (11 Nov):** the 2D side-scrolling journey is the point of the game; the levels are places in Slovenia visited one after another, with no level list; the dragon at Ljubljana castle is the final battle; healing happens only at special places such as wells; the player starts with one character; four is the most in a party; only one god per play, and gods are stronger; Erasmus of Lueg (Erazem Predjamski) is a new character and more should be explored; all characters are unlocked; there are items with mythical Slavic names; merchants sell potions, poisons and attack boosts; traps, chests and wells have their own sprites; the web prototype is expanded for fast testing and Godot stays the end goal.
- **16 Nov, late — v0.11.0, branch `0.11.0-alpha-fixes` (built, after testing #16):** *Težavnost* merged into *Znanje* (§3c); **starter-help words** in the letter mesh (§11.3); a new level heals fully (§4); **finishing a region heals the party** (§3); **malček: one second chance per journey at full health** (§3c); **chests and wells by chance in every region**, by Znanje (§1).
- **16 Nov, evening — v0.10.0, PR #16 `0.9.0-alpha-fixes` (built):** the journey saved at checkpoints by Znanje and *Izhod* (§11.11); word input (§11.5); 3-letter words on every tier and no hints on knjižni molj (§11.3); chests and rock slides with region words (§11.6, §11.7, `data/words.json`); *Kaj pomeni?* and chips-only word reports (§11.9); hero-screen footer, puzzle names at stops, the signpost walking on, the ambush announced (§11.8, `zagovor-080-alpha-fixes.md`); credits (`zagovor-store-release.md`).
- **16 Nov, afternoon (decided; what is still *not built*, section 11):** geographic word seeding; at most one recruitable hero per region; ~~starter-help words by Znanje~~ (built in 0.11.0 on the mesh); the križanka on a letter wheel and the in-game keyboard removed (PC/tablet setting for the classic form); the full rock-slide redesign; post-match screen and folk cards; road encounters played in the scene (§11.10); ~~Znanje scaling monster health~~ (settled in 0.11.0: Težavnost is part of Znanje).
- **16 Nov, v0.9.0 (built, corrections to "skill expansion and fixes"):** skill 1 known from the start, points learn skills 2 and 3 or raise any skill to **stopnja 3** (stronger, longer effects, one extra effect per stopnja; section 4); a hero with a point to spend glows and a chorus sings; **shrines of challenge**, one god each, three per journey, the god's challenge when the journey ends (section 2a); **Težavnost** with three settings (section 3c); wells no longer raise the fallen; the tap-to-demo on hero screens is no longer announced.
- **13 Nov, v0.9.0 (built, "skill expansion and fixes"):** XP only from beaten enemies; levels 1–9, each with a skill point; three heroes per journey, favouring the hero of each place; only a hero who joins is unlocked; spikes that only hurt.
- **12 Nov (built):** the darts event (*Puščice v zidu*, renamed *Past s konicami* on 13 Nov), the start screen with silhouettes and three known starters, attacks for the healers, every potion used automatically.
- **Evening fixes (built, 11 Nov):** partial healing outside wells, automatic potions, wells raise the fallen (no longer, 16 Nov), gold and XP from every enemy, one-word chests and rock slides with partial outcomes, Krpan as the first starter with unlocks.
- **Built:** the journey (ten regions, 56 stop slots; a journey keeps three hero stops, three shrines and some of the ten chests and ten wells), choosing the first hero, meeting and swapping heroes, shrines of the gods, wells, the pedlar, gold, 23 items, random regional enemies, sprites for every stop, four new heroes, battle abilities for all fifteen heroes.
- **Gods as challengers (16 Nov, replacing the cursed-god trial of 13 Nov; 21 and 24 Nov):** a god you pray to lends a gift and comes for a challenge at the end of that region (section 2a).
- **Not balance-tested:** the journey runs end to end in automated tests, but nobody has played it through for difficulty.

## Character and combat design references

This document records the journey, progression and prototype roster overview. For reviewed character-specific decisions, use [the character documentation index](characters/README.md) and the linked specifications there. The current detailed reviews cover Ajdovska deklica, Erazem Predjamski, Kralj Matjaž, Kresnik and Kurent. Lepa Vida and Peter Klepec remain prototype-level entries pending their individual reviews.

**Source-of-truth rule:** Detailed character specifications contain the latest reviewed skill behaviour, rank values, recruitment constraints, folklore context and open questions. Older summaries in this progression document may describe earlier prototype behaviour; if they conflict with a reviewed specification, flag the discrepancy rather than silently treating the older summary as current.

Shared action/status and interruption rules are maintained separately in [Combat System Rules](combat-system.md). Apply those rules across heroes and enemies unless a character or enemy specification explicitly documents an approved exception.

## 1. The journey
One road, walked left to right. The party stands still and the world scrolls past; the background pans slowly across the landmark of the region. Walking stops at every stop and a prompt offers what can be done there, and names the puzzle that waits there (v0.10.0). A signpost at the end of each region leads to the next; after it the party walks on by itself (v0.10.0).

| # | Region | Landmark in the background | Hero of the place (6× more likely to wait there) | Stops | Enemies |
| --- | --- | --- | --- | --- | --- |
| 1 | Ptuj | castle above the snowy town | Kurent | battle, hero, battle, chest, battle, well\*, battle | Škrat, Vešča |
| 2 | Peca | King Matjaž's cave | Kralj Matjaž | battle, shrine, chest or trap†, battle, hero, well\*, battle | Perkmandeljc, Škrat, Pesjan |
| 3 | Triglav | the three peaks | Ajdovska deklica | battle, shrine, chest or trap†, hero, battle, pedlar, well\*, battle | Pesjan, Perkmandeljc, Vešča |
| 4 | Bled | island church, castle on the cliff | — (Kresnik has no home and turns up anywhere) | battle, shrine, chest or trap†, battle, well\*, battle | Vodna vila, Vešča, Škrat |
| 5 | Trnovski gozd | moonlit forest | Martin Krpan | battle, shrine, chest or trap†, hero, battle, well\*, battle | Mora, Volkodlak, Vešča |
| 6 | Piranske soline | salt pans, Piran at sunset | Lepa Vida | battle, shrine, chest or trap†, pedlar, hero, battle, well\*, battle | Vodna vila, Pesjan, Mora |
| 7 | Predjamski grad | the castle in the cliff | Erazem Predjamski | battle, chest or trap†, hero, battle, well\*, ambush | Zmajev mladič, Perkmandeljc, Volkodlak |
| 8 | Ljubljansko barje | pile dwellings in the mist | Zeleni Jurij | battle, shrine, chest or trap†, hero, battle, pedlar, well\*, battle | Škrat, Mora, Volkodlak, Vodna vila |
| 9 | Ljubljanica | Tromostovje | Peter Klepec | chest or trap†, battle, hero, battle, well\*, **boss: Povodni mož** | Vodna vila, Mora |
| 10 | Ljubljanski grad | the castle wall at sunset | — | chest or trap†, pedlar, well\*, **boss: Lintvern** | — |

- **Stops since balance E (20 Nov, v0.17.0, Game Director):** every region from Peca on has **three battles** (the ambush at Predjamski grad and Povodni mož count; the Lintvern stands alone at the castle) and **one event: a chest or a trap, never both** (†). Before, a region could hold a chest, a rock slide and spikes at once.
- **Random enemies:** each battle draws its enemies from the region's pool. One enemy while the party is a single hero, two after that, three from Bled with three or more heroes (§4b). The very first fight is always one Škrat with the tutorial tips.
- **Scaling:** by region, from `data/world.json → balance` (§4c; bosses have their own numbers).
- **Three heroes per journey (13 Nov):** a hero always waits at Ptuj; two more regions with a hero stop are picked at random and the other hero stops are left out, so one journey never meets everyone. At a hero stop the hero of the place is six times as likely as anyone else, and heroes not yet unlocked twice as likely; if nobody is left, the stop becomes a well. **(16 Nov, stricter — see §11.2: at most one recruitable hero per region, randomized among the region's own heroes when several belong there. *Not built.*)**
- **Shrines and heroes are planned per journey:** only three of the six shrines and three of the hero stops stay on any one journey (sections 1 and 2a).
- **Chests and traps (20 Nov, v0.17.0; † in the table):** every region has one event slot. When a journey starts it becomes a chest with the chance of the chest line below (60 / 45 / 30 % by Znanje), otherwise a trap: a rock slide or a wall of spikes, half and half (`chance.traps`). Ptuj's is always a chest (`firstChest`). The plan is kept in the save (`eventAt`); an older save gets one when it loads. *The rest of this bullet describes v0.11.0–0.16.0, where chests were a slot of their own.*
- **Chests and wells by chance (16 Nov, v0.11.0; \* in the table):** every region has a place for a chest and a place for a well. When a journey starts, each place stays with a chance set by **Znanje** — chests 60 / 45 / 30 %, wells 75 / 55 / 40 % on malček / učenjak / knjižni molj (`data/world.json → chance`), on average about 6 / 4.5 / 3 chests and 7.5 / 5.5 / 4 wells. A journey always keeps at least one chest, and **a well in each half of the road**. The plan is kept in the save (`chestAt`, `wellAt`); a 0.10.0 save gets its wells planned when it loads. (In v0.10.0 only six regions had a chest, by Težavnost 90 / 70 / 50 %.)
- **Data:** regions, stop order, enemy pools, items and save checkpoints live in `data/world.json`, the words of each region in `data/words.json`, so the Godot game can read the same files.

## 2. Party rules
- **Start screen:** all fifteen characters are shown. On a fresh game only **Martin Krpan, Zeleni Jurij and Kurent** are known and can start; the other twelve are nameless silhouettes. You pick one.
- **Joining unlocks (13 Nov):** a hero is unlocked for later journeys only when they join the party; greeting them and walking on leaves them unknown, so a full party has to choose whom to leave. A god is unlocked by beating them in the challenge after praying at their shrine. (Test mode shows everyone.)
- **At most three** travel together (Game Director, 24 Nov 2026: "3 is a fun number"; four before, from 11 Nov). A fourth can only take somebody's place; a hero who has fallen can be left behind this way ("Zapusti"). `PARTY_MAX` in `src/journey.js`; a save with four heroes from before still loads and keeps them until one leaves. A journey still meets three heroes (one at Ptuj, two elsewhere), so the third meeting asks whom to leave.
- **One god per journey.** A god never joins on the road: a god beaten in a challenge is unlocked and can **start** a later journey.
- **A hero who joins** arrives at the level of the party's lowest hero (the one they replace does not count), knowing only skill 1, with the skill points of those levels to spend at the next well or signpost (v0.17.0; v0.13.0–0.16.0: the party's level; before: half the party's average experience).
- **Gods are stronger:** attack ×1.35 (Veles ×1.5) and about a quarter more health than folk heroes.
- **Letter mesh:** the share of coloured tiles grows with the party (30 % with one hero, 46 %, 56 % with three; 62 % with four in the practice battles).

## 2a. Shrines of challenge — *Svetišče* (16 Nov; `src/shrines.js`)
- **Six shrines, one god each, each with its own look** (`tools/art_extra.py`): Perun — a carved post with the thunder mark under an old oak; Svarog — a stone forge altar with an anvil; Mokoš — a spring in a ring of stones with a spindle; Dažbog — a sun disk on a tall pole; Stribog — a windswept cairn with streamers; Veles — a dark stone in the roots, crowned with ox horns, a snake beside it. **The gods are not shown, only their signs** (16×16): lightning, anvil, spindle, sun, wind, horns.
- **Where:** Peca (Svarog or Perun), Triglav (Perun or Stribog), Bled (Dažbog or Mokoš), Trnovski gozd (Veles or Mokoš), Piranske soline (Stribog or Dažbog), Ljubljansko barje (Veles or Mokoš). A journey keeps **two** of these at random (Game Director, 24 Nov; three before), each for a different god, **never in the last region**, so a god never comes in the Lintvern's place. A god who starts the journey always finds their own shrine on it. A save from before keeps the first two of its three planned shrines.
- **The page** is titled *Svetišče* ("posvečeno bogu Perunu"), with the shrine, the god's sign above it, what praying means and two buttons: *Pokloni se* (Game Director, 27 Nov 2026; it was *Pomoli se*) / *Pojdi naprej*. The gods answer a *poklon*, never a *molitev* (CONFIRMED, 28 Nov 2026: *pokloni pred bogovi* has the better meaning), e.g. Perun: *»Zagrmelo je. Tvoj poklon je sprejet. …«*
- **A prayer at each shrine (24 Nov; before, one prayer per journey):** with two shrines a journey, that is two prayers and two challenges at most, and the two gifts stack. The god answers at once (Perun: *»Zagrmelo je. Tvoja molitev je uslišana. Preživi pot do konca in videl bom, ali si vreden te preizkušnje.«*) and lends a **gift for the rest of the journey**: every word that fires a third skill (three letters of one colour) also brings the god's power — Perun: lightning on every enemy (1.5× the strike's power); Svarog: shield (2.5×, cap 30); Mokoš: heals the party (3×, up to 70 %); Dažbog: the next word ×2; Stribog: hits everyone (1.2×) and clears locked letters and sleep; Veles: poisons every enemy. The battle header shows "dar: *god*" (both, when two are lent). State: `S.run.prayers` (`{ god, ri, result }`), `S.run.gifts`, `S.run.giftUntil`. *(OPEN, 24 Nov: "you may be healed when you pray" — praying does not heal; to be confirmed.)*
- **The challenge comes at the end of the region where you prayed (Game Director, 21 Nov; supersedes "when the journey ends"):** *na koncu poti* meant the region's road, before the player goes on to the next place. **The shrines now stand near the start of their regions, right after the first battle** (the table above), so the gift helps through the region and the god comes **before the signpost**. **A fair fight (Game Director, 24 Nov; replaces "the party first rests"):** the party does not rest first, so the road between the shrine and the region's end can still hurt; the god wants a fair challenge, so **every hero is healed to full, the fallen too**, and **skill points can be spent** (*Veščine* on the arrival screen) before the battle. The health they came with is kept (`S.run.godSnap`). Then the god arrives (*»Rekel sem, da bom videl. Zdaj pokaži.«*; arrival lines no longer mention the castle, e.g. *Pred kažipotom nebo potemni in zagrmi.*). The god's answer at the shrine says so: *»Preden zapustiš to pokrajino, bom videl …«*. If the game is reloaded at the region's end with the god still waiting, the road offers *Sprejmi izziv* instead of the signpost; an older save whose prayer region is behind it meets the god at the next region's end. A later shrine of the same god says *Perun te je na tej poti že preizkusil.* The battle, in their holy light: 260 + 26 health per region (`GOD_BAL` in `src/shrines.js`), scaled by the difficulty; attack 5 + a third of the region; **only their special**:
  - Perun, *Nevihta*: a chain of lightning through the whole party, 1.4× the attack on the first hero, then 0.3 less for each next (at least 0.4×).
  - Svarog, *Nebeška kovačnica*: 2× on the first hero, 0.6× on the rest, three letters red-hot (locked).
  - Mokoš, *Materina roka*: 0.8× on everyone; she takes the damage back as health.
  - Dažbog, *Sončni voz*: 0.75× on everyone; the sun climbs and every blow is 1 stronger.
  - Stribog, *Vihar*: 0.75× on everyone and the mesh is shuffled. **Between two storms he blows two gusts, *Sapica*: 0.6× on everyone, the letters stay** (Game Director, 28 Nov 2026: the mesh was shuffled with every blow). The other gods still strike only with their special.
  - Veles, *Korenine sveta*: 0.6× on everyone and four letters overgrown (locked).
- **Losing never ends the journey (Game Director, 24 Nov; replaces "losing is losing a battle"), on every Znanje:** the god leaves without a word and is not unlocked; every hero is **as healthy as they came** (the health from before the fair-fight healing, the fallen down again); no withdrawal is used up. The gift stays **until the next region is behind the party**, then goes out (*»Dar, ki ti ga je posodil Perun, je ugasnil.«*). The road goes on to the signpost, where the region's end heals as always.
- **Winning:** the god speaks a cryptic line (Perun: *»Hm … tebe si bom zapomnil. Ko bo naslednjič zagrmelo, se ozri v nebo.«*), **heals every hero again, the fallen too** (24 Nov; before, the fallen rose with half), gives every hero **250 XP**, is **unlocked** (never joins by themselves), and the **gift stays to the end of this journey** — "until the death of the party". It no longer carries into the next journey (24 Nov; 16–23 Nov it did, stored as `zg-gift`, which a new journey now forgets). The road then goes on to the signpost.
- **A god in the party:** at that god's own shrine the party meets the **godly version** at once — no prayer and no gift. The party god does not strike their other self (their letters only count for the party's common blow; the chip says "ne udari"). Winning gives the party god **a skill point at once** and every hero 250 XP. The fair fight and the loss work as for a prayer's challenge (24 Nov): everyone healed before it, and a loss gives back the health the party came with and the road goes on. Other gods' shrines are closed to a party that travels with a god.

## 3. Health, falling and healing
- Every hero has their own health bar. **Health does not come back after a battle.**
- **Wells are the main healing:** drinking restores every hero still standing to full. **Wells no longer raise the fallen (16 Nov).** Every region has a place for a well, kept by chance (§1).
- **A new level heals the hero fully (16 Nov, v0.11.0)**, besides the extra health it brings.
- **Finishing a region heals the party (16 Nov, v0.11.0):** when the party walks past the signpost into the next region, every hero still standing gets full health (`restAfterRegion` in `src/journey.js`), with a short message; the signpost says so. The fallen stay down, as at a well.
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
- **Experience comes only from beaten enemies (13 Nov; v0.13.0–0.16.0 it went to the party, §4b; since v0.17.0 each hero standing gets their own share, §4c):** every defeated enemy drops gold at once (4 + a share of its XP) and gives XP to every hero still standing. Words, crosswords, chests, rock slides and darts give no XP.
- **Reviewed heroes earn XP from the fight (v0.12.0, first test):** for Ajdovska deklica, Erazem, Kralj Matjaž, Kresnik and Kurent a beaten enemy gives **attacks + damage + the enemy's level**: one XP for every skill they fired at it, one for every point of health they took off it (hits, their burns, counterattacks), plus its level (the region's number, 1–10; 1 in practice battles). Only heroes still standing when it falls get anything, as before. The weights are `XP_RULE` in `src/progression.js` (all 1 for this test). Other heroes keep the enemy's fixed XP. The log and the battle result show the parts (*napadi 2 · škoda 8 · raven 1*).
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
| Enemy health (journey only) | ×0.85 | ×1 | ×1.5 (×1.25 until v0.16.0) |
| Lost battle | **the first time on a journey — withdraw:** everyone gets up with **full health** (v0.11.0; before, a third); the enemies still block the road (a god's godly version goes back into the shrine). **The second time the journey ends** (`withdraw: 1`, counted in `S.run.rescues`, kept in the save) | the journey ends | the journey ends |
| A hero down when a battle is won | gets up with a quarter of their health | stays down | **leaves the party** |
| A hero down when a region ends (v0.13.0) | (already up) | **gets up with half health** (`regionRise`) | stays gone |
| Ptuj (v0.13.0) | a loss never ends the journey and costs no second chance; the party gets up at full health | the same | the same |
| The last battle (v0.13.0) | can always be tried once more at full health (`finalRetry`), besides the second chance | — | — |

On knjižni molj only a healer's skill or *Mrtva voda* during the battle (or a beaten god at its end) saves a fallen hero. A journey that ends removes its save (§11.11).

## 4. Levels, skill points and skills (16 Nov — reviewed-hero testing scope)

- **Levels 1–9.** *Since v0.17.0 (balance E, §4c) every hero levels on their own at 0, 70, 180, 360, 640, 1000, 1500, 2200 and 3100 XP, with **one point of their own** a level; v0.13.0–0.16.0 the party levelled together at 0, 45, 110, 220, 360, 540, 760, 1020 and 1350 XP with three shared points a level (§4b).* Each level adds 8 % health and 4 % attack, a little extra attack for long words (up to +10 % per letter beyond the fourth at level 9), and **heals the hero fully** (v0.11.0). Until v0.12.0 each hero levelled alone at 0, 60, 140, 240, 360, 500, 660, 840 and 1050 XP with one point a level.
- **Skill trigger remains based on the hero's own letters in the submitted word**, not total word length: one, two or three of that hero's letters selects skill 1, 2 or 3. *Since v0.13.0 a reviewed hero fires every skill they know up to that number, each at its own rank (§4b); the rest of this bullet holds for heroes whose reviews are pending.* If the selected skill is not yet known, the strongest known skill below it is used, with +15 % power for every letter beyond the selected skill's threshold. Skill 1 is known from the start.
- **Reviewed heroes — character-specific skill progression for testing:** skill 2 and skill 3 are learned in order, one skill point each. Every learned skill can then be upgraded through its documented ranks (rank 1 → 2 → 3), one skill point per rank. The rank values and effects come from that hero's reviewed character specification. **Do not apply the old generic `RANK_POW`, `RANK_DUR` or `SKILL_UPS` bonuses on top of those values** unless a character specification explicitly says so. The reviewed rank 1–3 definitions are the source of truth for what each skill does at each rank.
- **Heroes whose character reviews are still pending:** they continue to gain levels and receive the normal health and attack increases above. Their existing attacks remain flat for now: no skill-point upgrades, rank scaling, or additional skill effects. Do not redesign or rebalance their existing attacks as part of this testing pass.
- **Skill-point spending location (Game Director, 20 Nov, v0.17.0):** points are spent **only at a well and at the signpost at a region's end** (*Veščine* in the prompt there), and on a journey the skills are **shown only there**: no Veščine button on the hero screens (the codex in the menu keeps it), none after a battle, at shrines or at the pedlar. *(v0.13.0–0.16.0 also after every battle, at shrines and at the pedlar.)* The skill screen shows which skills are learned and the current rank of each.
- **A hero with a point to spend glows** (a ring of light from the head, CSS `.hero.spr.glow`) **only at a well or a signpost** since v0.17.0 (`trainHere` in `src/journey.js`); before, on the road, in battle and on the hero screens too. A short synthesised chorus (`chorus()` in `src/game.js`) still sings at every new level.
- **Outside a journey** (practice battles, the gallery, the codex), every skill is available at rank 1 for testing, unless the relevant test mode explicitly overrides this.
- **Built in v0.12.0:** see §4a for the reviewed heroes' rank values as implemented, the choices made where their specifications are OPEN, and §3a for their XP. Heroes whose reviews are pending were left exactly as they were (they still use the generic stopnje), as decided for this test.
- **Scope note:** this is a focused testing pass for reviewed heroes' bespoke skill kits and their rank progression. It does not author new skills or upgrade effects for unreviewed heroes, and it does not change enemy progression or the separate god skill designs.

## 4a. Reviewed heroes in the game (v0.12.0, testing pass)
Built in `src/progression.js` from the reviewed specifications (`docs/characters/*/character.md` on `docs/reviewed-character-specifications`). Only these six changed (Martin Krpan joined on 18 Nov, see below); every other hero, god and enemy works as before (they keep `RANK_POW`, `RANK_DUR` and `SKILL_UPS`). Animations, art and folk-art cards are not part of this pass.

**How the numbers are read.** Damage values are the base for a three-letter word at level 1; the word still multiplies them (length, šumnik, repeats, relics and potions, the hero's own words, the level's attack). Healing, shields, bonuses, reductions, delays, durations and charges are exact. A counterattack (no word) uses the level's attack only. **TEST** = the specification leaves the number OPEN; it is a placeholder for this test.

| Hero | Skill 1 | Skill 2 | Skill 3 |
| --- | --- | --- | --- |
| Kurent (rebalanced) | **Ježevka** 4 / 6 / 8; the target's next attack comes 2 / 3 / 4 s later | **Zvonci** (name OPEN): Kurent dances 2 s, out of the letter mesh (still hit); the bells hit 1 / 2 / 3 enemies for 3 / 4 / 5 and their next blow is 3 / 4 / 5 weaker | **Pregon zime**: every enemy −4 / 6 / 8 and attacks 3 / 4 / 5 s later; rank 2+: enemies tagged ghost, wind or cold (only Mora for now) take half their attack over 4 s and hit at half for those 4 s; rank 3: their next attack after that is halved too |
| Kralj Matjaž | **Meč** 6 / 12 / 18; ranks 2–3: each hero hit by the next enemy attack takes 3 / 6 less | **Kraljeva vojska**: every hero's next attack +3 / +6 / +10; rank 3: the next two enemy blows −3 on each hero hit | **Prebujenje**: each standing hero +3 / +6 / +6 health, the fallen rise with 15 %, ward 3 / 6 / 6; rank 3: 12 damage to every enemy |
| Kresnik (rebalanced) | **Ognjeni meč** (name OPEN) 5 / 7 / 9, ×1.5 on dragons (Lintvern, Zmajev mladič); burns 2 a second for 2 / 3 / 4 s | **Kresna strela** 10 / 13 / 16, burns 2/s for 3 s; rank 3 jumps to the enemy beside the target for 6 | **Kresna moč** (name OPEN): a flame on every enemy 5 / 7 / 9; the next 1 / 2 / 3 enemy blows that hurt him give back 25 / 50 / 70 % (rounded up, up to full health) and half of that in gold |
| Erazem | **Zamah z mečem** 7 / 11 / 15 (TEST) | **Češnje** 5 / 7 / 9 (TEST, one target); the heroes beside him +1 / +2 / +3 (TEST), not Erazem | **Skrivni rov**: the next attack that reaches him misses; rank 2 counterattack 1.5× Zamah z mečem, rank 3 the hero beside him evades too and the counter is 1.75× |
| Martin Krpan (18 Nov) | **Lipov kij** 10 / 16 / 20 | **Kmečka moč**: rank 1 two punches of 8 (two hits); rank 2 Krpan throws the bags of salt, 20 at one enemy; rank 3 the boulder, 22 split between up to two enemies (11 each) | **Mesarica** 10 / 14 / 20; bleeds 2 a second for 2 / 3 / 4 s |
| Ajdovska deklica | **Metanje skal** 6 at one enemy; ranks 2 / 3: 5 / 8 at every enemy (TEST) | **Varstvo popotnikov**: the next 1 / 2 / 3 enemy attacks on the others land on her, halved (rounded up) | **Okamnitev**: 1 / 2 / 2 enemies skip their next 1 / 1 / 2 attacks; burns and poison go on |

**Rebalance of Kurent and Kresnik (16 Nov, from the simulations).** With the reviewed values Kresnik's skill 1 dealt about 15 / 21 / 28 per four-letter word (Matjaž 8 / 15 / 22, Erazem 9 / 13 / 19) and carried a fresh party; Kurent's delays stacked into a near stun-lock; and skills 2 and 3 of both dealt no damage, so learning them made the hero weaker in battle. Now each skill does at least as much as the one below it at the same rank, and the new values replace the specification's numbers for testing (the character specifications still hold the old ones and need updating if this stays). Measured per four-letter word at level 1 (damage on two enemies / enemy attacks per minute out of 12):

| | Skill 1 (rank 1 / 2 / 3) | Skill 2 | Skill 3 |
| --- | --- | --- | --- |
| Kurent before | 5 / 9 / 13, attacks 10 / 9 / 8 | 0, attacks 12 | 0, attacks 5 / 2 / 2 |
| Kurent now | 5 / 8 / 10, attacks 11 / 10.5 / 10 | 4 / 10 / 12 + next blow weaker | 10 / 15 / 19, attacks 9 / 8 / 8 |
| Kresnik before | 15 / 21 / 28 | 21 / 26 / 43 | 0 |
| Kresnik now | 10 / 14 / 19 | 18 / 22 / 39 | 12 / 17 / 23 + wounds given back |

**Health per level:** Ajdovska deklica +10 % of her base a level (TEST; others +8 %: 68 against 62 at level 9). Kurent never less than +1 a level (the normal +8 % already gives him 2–3).

**Choices made where the specifications are OPEN** (all easy to change in `src/progression.js`):
- *Round* (Okamnitev) = one enemy attack: the enemy lets that attack pass, whatever kind it is.
- Kraljeva vojska's bonus goes to every hero standing, Matjaž included, and is used on their next hit on their target. The ward (Meč, Prebujenje) does not add up: the bigger one stays until the next enemy attack. Prebujenje's healing does not go to the heroes it raises (they keep 15 %), and it can raise every time (no limit per battle).
- Enemy attacks go through, in order: Skrivni rov, the attacker's weakness (Zvonci, Pregon zime), Matjaž's ward and his army's −3, the party's shield, then Varstvo popotnikov. With none of these in force, the old path is unchanged.
- Skrivni rov waits for an attack that actually reaches Erazem (or, at rank 3, the hero after him in the party, else the one before); the counter goes to the attacker; either hero evading counts.
- Varstvo popotnikov uses a charge only when another hero would be hurt; her own share is not halved; she can fall from it.
- Kresna moč: 1 / 2 / 3 charges by rank (a new use replaces what is left), each used by an enemy blow that hurts Kresnik while he stays standing. Burns and poison never trigger it.
- Zvonci picks the target first, then the hardest hitters. The weakening is used up by that enemy's next blow and is taken from each hero the blow hits.
- **Kurent's delays do not add up:** until an enemy acts, a new delay only moves its attack by what it adds over the longest one so far. Before, every Ježevka and Pregon zime pushed the attack back again, which nearly stopped enemies (two enemies attacked about 2 times a minute instead of 12 under Pregon zime at one word every 5 s).
- Reviewed heroes' heals go up to full health; the 70 % cap stays for Mokoš and Zeleni Jurij.
- In calm mode Kresnik's burn is one tick (2) per word for as many words as seconds; Kurent's delays move the enemy's charge by the same share of its attack cycle.
- Enemy tags: `zmaj` (Lintvern, Zmajev mladič) and `duh` (Mora). The specification asks not to guess the other wind / cold / ghost enemies, so none are tagged yet.

**Not in this pass:** Ajdovska deklica only at Triglav and Kralj Matjaž only at Peca (recruitment), the final-boss story cards, enemy affinity tags beyond Mora, animations and art.

## 4b. Balance D — the party levels together, enemies follow a curve (17 Nov, v0.13.0)
> **SUPERSEDED in part by balance E (§4c, 20 Nov, v0.17.0):** the party's shared levels and points, Veščine after every battle, the enemy numbers by region, Povodni mož's and the Lintvern's health and Knjižni molj's steepening. Still in force from D: skills firing together, the halved zagovor bonus, three enemies from Bled, strong enemies, the Lintvern's attacks, Ptuj's rules and the tester statistics.

The simulations of 16–17 Nov (a Python model of the whole road, ten regions and every Znanje; tables in the project doc *zagovor-balance-simulations*) showed the difficulty upside down: Peca was the hardest place on Malček, while Povodni mož and the Lintvern almost never won. Four versions were compared; **D** is built. It stays the working balance until monsters and gods are reviewed.

**The party levels together.** Every beaten enemy gives **attacks + damage + its level** (the whole party's attacks and damage on it, `foeXp` in `src/progression.js`) to the party's pool, `S.run.pxp`. Levels at 0, 45, 110, 220, 360, 540, 760, 1020 and 1350 XP (`LV_XP`); each level gives every hero the level's health and attack, heals the heroes standing (the fallen stay down) and puts **three points** (`PTS_PER_LV`) in a shared pool, `S.run.pts`, which any hero can spend, including one who hit nothing. A hero who joins arrives at the party's level, knowing skill 1. Points can be spent at wells, shrines and the pedlar as before, **and on the hero screen after every battle** (a *Veščine · N točke* button next to *Na pot*). The road glows while points wait. A save from before 0.13.0 loads with the best hero's XP for the party and every unspent point in the pool.

Ptuj has **four battles, 1, 1, 2 and 2 enemies**, so the party is level 3 with six points before Peca (two heroes can both learn skill 2 and raise one skill). On Malček with steady play a starting hero reaches level 9 at Barje; skills 1–3 at rank 3 cost 8 points, so two heroes are maxed by the castle and four are not.

**Skills fire together (reviewed heroes).** One, two or three of a hero's letters fire every skill they know from 1 up to that number, each at its own rank; the gift of the gods and the length of the word apply to each. Before, only the highest one fired, so learning skill 2 could make a word weaker. Heroes whose reviews are pending still fire one skill.

**The zagovor's level bonus is halved:** ×(1 + 0.05 per level above 1), so ×1.4 at level 9 (was ×1.8). It carried the late game alone.

**Enemies by region** (`data/world.json → balance`; bosses ignore it, `makeEnemy` in `src/game.js`):

| Region | Ptuj | Peca | Triglav | Bled | Trnovski gozd | Piranske soline | Predjamski grad | Ljubljansko barje | Ljubljanica | Ljubljanski grad |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Health × | 1 | 0.95 | 1.2 | 1.45 | 1.75 | 1.8 | 2.3 | 2.7 | 3.0 | 3.0 |
| Attack × | 1 | 1 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5 | 1.65 | 1.8 | 1.8 |

- **How many:** one enemy against a lone hero, two otherwise, **three from Bled** when the party has three or more heroes. Never two Pesjani in one battle (`single`).
- **Strong enemies** from Trnovski gozd: about two battles in five have one *Silni / Silna …* enemy with ×1.6 health and ×1.25 attack, a bigger sprite and a mark on the road.
- **By Znanje:** Malček ×0.85 health, Učenjak ×1, Knjižni molj ×1.25 (as before). **Ptuj is the same tutorial on every Znanje** (Malček's numbers). **Knjižni molj steepens:** up to +15 % health and 10 % quicker attacks by the castle (`steep`, growing region by region).
- **Povodni mož** (Ljubljanica): 240 health, hits 12, with **two vile** beside him that grow with the region.

**The Lintvern** (Ljubljanski grad, `ENEMIES.lintvern`):

| Attack | What it does |
| --- | --- |
| *Kremplji* | a scratch for 11 on one hero |
| *Topot* | 4 to everyone; 1 hero (2 from three heroes) is knocked out of the letter mesh for 6 s (*omamljen*) |
| *Ognjeni dih* | at 66 % and 33 % health he **draws breath**: 14 / 8 / 6 s on Malček / Učenjak / Knjižni molj (4 / 3 / 2 words in calm mode), then 1.2 × his attack on every hero and 4 burn on each; **10 letters are scorched** and fade one every 2.5 s (three per word in calm mode); a scorched letter used in a word burns the hero of its colour for 4 more |

- **Nothing stops him:** stuns, sleep and *Okamnitev* do nothing (*neustavljiv*), delays move him half as far, and the breath cannot be interrupted. If the second threshold comes while he is still drawing breath, the second breath follows the first.
- **Health** 170 / 250 / 313 (Malček / Učenjak / Knjižni molj: `hpBy` 200 / 250 / 250 times the Znanje factor). At half health he enrages and summons wyverns.
- **Zmajčki (wyverns):** 55 health, hit 6, only Znanje changes them. One per hero beyond the first, at most two, beside him from the start, and the same number again when he enrages. Since 24 Nov the ones he calls wait in line and fly in where one has fallen: three enemies on screen at most (`docs/combat-system.md` §3).

**Measured (D, 300 journeys each; the targets are the share of journeys won at a word pace):** Učenjak 54 % at a word every 8 s (target about half), Knjižni molj 42 % at 6 s (target 35–45 %), Malček 72 % at 10 s (target about 85 %). What still ends Malček journeys at 10–12 s is the solo battles at Ptuj (a lone Zeleni Jurij deals 2–3 a word) and the Lintvern; the Ptuj rule above came after these runs, so Malček should now do better than measured. The model leaves out potions, relics and gods' gifts, so real win rates on Učenjak and Knjižni molj should be higher.

**Battle statistics for testers (opt-in, `src/stats.js`).** Off until the player agrees, once on *Nova pot* (a card under the options, not a dialog) and any time in *Nastavitve → Pomoč pri uravnoteženju*. Then one row per journey battle and one when a journey ends go to the word-report Google Form with *Opomba* `statistika`: win or loss, region and kind, the enemies (strong ones marked `*`), Znanje, pace, device, version, duration, words, seconds per word on the letter mesh (crosswords and pauses left out), the longest word's length, party level and unspent points, heroes with their skill ranks, health at the start and the end, the fallen, what was left of the enemies and the second chances used. None of the words typed are sent, and the only id is a random one per journey. Rows wait on the device while offline (at most 300); saying no drops them. **This is data collection: declare it in Google Play's Data safety form, Apple's privacy label and the privacy policy** (§11.9, `docs/platform-roadmap.md`).

**Still open:** the review of monsters and gods; Lepa Vida's review (on `main` as a document, not in the game; Martin Krpan's is in the game since 18 Nov); the character specifications still hold the old Kurent and Kresnik numbers (§4a).

## 4c. Balance E — every hero levels on their own, a harder road (20 Nov, v0.17.0)
**Why:** the Game Director found the game too easy: XP got out of hand and "the family gets more and more levels each turn". Driven by the real game (below), balance D was won **98 %** of the time on Malček at a word every 10 s (Učenjak 95 % at 8 s, Knjižni molj 96 % at 6 s); the party reached level 9 by Ljubljansko barje and lost under a tenth of its health per battle after Peca. The earlier Python model said 72 %: it left out potions, relics, chests and the gods' gifts.

**Decided by the Game Director (20 Nov) — CONFIRMED:**
- Every hero **gains XP and levels on their own**, and **more slowly**.
- **Skill points are spent only at wells and at the signpost at a region's end**, and the skills (*Veščine*) are **only shown there**: too much information elsewhere.
- **One chest or one trap per region**, never both, and **more enemies**.
- **Enemies grow in health, and somewhat in attack,** now that the heroes grow stronger with their skills.
- **Target:** of ten journeys on the easiest Znanje, **at least four are lost**.
- *(Art, same day: only the backgrounds are being enriched; the character designs stay as they are. `docs/concept-summary.md`.)*

**How it is built (IMPLEMENTED in v0.17.0):**

| | Balance D (0.13.0–0.16.0) | Balance E (0.17.0) |
| --- | --- | --- |
| XP | the whole party's attacks + damage + enemy level, into one pool | each hero standing gets **their own** attacks + damage + **support** on the beaten enemy + its level (`awardFoeXp`, `src/progression.js`); a fallen hero gets nothing. Support (Game Director, 20 Nov): one XP per point healed (raising the fallen too), per point of party shield given, and per point of a blow taken off by Kralj Matjaž's shield and army or by Ajdovska deklica's Varstvo popotnikov (`noteSupport`); weakening and dodges do not count |
| Levels | one party level at 45 / 110 / 220 / 360 / 540 / 760 / 1020 / 1350 XP | each hero's own at **70 / 180 / 360 / 640 / 1000 / 1500 / 2200 / 3100** XP (`LV_XP`) |
| Points | 3 a level into a shared pool | **1 a level, the hero's own** (`st.pts`, `PTS_PER_LV`) |
| Where points are spent | after every battle, wells, shrines, the pedlar | **wells and the signpost** only |
| Skills shown / glow | hero screens, battle, road | only at a well or the signpost (`trainHere`); the codex in the menu still shows every skill |
| A hero who joins | at the party's level | at the **lowest level in the party**, with that many points (minus one) to spend |
| Battles per region | 2 (Ptuj 4) | **3** from Peca to Ljubljanica (the ambush and Povodni mož count), Ptuj 4, the Lintvern alone |
| Chests and traps | a chest by chance, plus fixed rock slides and spikes | **one event per region**: a chest (60 / 45 / 30 % by Znanje), else a rock slide or spikes; Ptuj always a chest (`chance` in `data/world.json`) |
| A god's challenge won | 250 XP to the party, a point to the pool | 250 XP to every hero, a point to the party god |
| Tester statistics | `raven=` party level, `tocke=` pool | `raven=` and `tocke=` hero by hero (`4/3/3`) |

Saves from 0.13.0–0.16.0 load: every hero keeps their level (starting it on the new curve) and the pooled points are shared out; their chests and traps are planned on loading (`src/save.js`).

**Enemies (data/world.json → balance; tuned by simulation):**

| Region | Ptuj | Peca | Triglav | Bled | Trnovski gozd | Piranske soline | Predjamski grad | Ljubljansko barje | Ljubljanica | Ljubljanski grad |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Health × (D) | 1 (1) | **0.7** (0.95) | **1.0** (1.2) | **1.6** (1.45) | **1.6** (1.75) | **2.05** (1.8) | **2.4** (2.3) | **3.05** (2.7) | **3.65** (3.0) | **3.65** (3.0) |
| Attack × (D) | 1 (1) | **0.8** (1) | **0.95** (1.1) | **1.15** (1.2) | **1.2** (1.3) | **1.35** (1.4) | 1.5 (1.5) | **1.75** (1.65) | **2.0** (1.8) | **2.0** (1.8) |

- **The bosses (Game Director, 20 Nov):** the Lintvern is the toughest enemy on every Znanje, and each boss has helpers that should fall first.
  - **Povodni mož** 260 health, hits 16 (221 / 260 / 390 by Znanje; D: 240 / 12). **His two vile** (`reka.escort` in `data/world.json`) hit at ×0.75 (6 on Malček instead of 8), and every third move (*Val*, *Poplava*, ***Zdravilni val***) one heals him for 8 % of his health (18 on Malček) while she and he stand; with him unhurt or down she strikes instead.
  - **Lintvern** 289 / 320 / 480 by Znanje (`hpBy` 340 / 320 / 320 times the Znanje factor; D: 170 / 250 / 313). His wyverns add their own blows (one per hero beyond the first, at most two, and as many again when he enrages): strike them first.
  - Tried on the way: Povodni mož at 400 / 16 (more health than the Lintvern, dropped); at 220 / 14 with the vile at ×0.6 Ljubljanica became a walkover; the vile's heal at 5 / 8 / 12 % hardly changes the result. Once the bot struck the helpers first, every Znanje got easier (Malček 63 %), so Povodni mož went back up to 260 / 16.
- **Knjižni molj:** enemy health ×1.5 (D: ×1.25) and steeper towards the castle: up to +35 % health and 18 % quicker attacks (D: +15 % / 10 %).
- Unchanged from D: a third enemy from Bled with three or more heroes, strong enemies from Trnovski gozd (40 %), at most one Pesjan, Ptuj the same tutorial on every Znanje, Malček's second chance and its retry at the Lintvern, Učenjak's fallen rising at a region's end.

**The simulator (`tools/sim/`, new):** a bot plays whole journeys **inside the built game** (headless Chrome, `dist/index.html`) on the game's own clock, so every rule of the game runs as it is: kits, potions, relics, chests, traps, wells, the pedlar, gods' gifts, withdrawing and the bosses. Only the player is a model (all assumptions, to be replaced by the testers' statistics):
- a word every *pace* seconds (each gap 0.6–1.4 × pace), chosen among the words really in the mesh, lengths 3 / 4 / 5 / 6 / 7 letters in 25 / 35 / 25 / 12 / 3 %, no base form twice in a battle; no hints;
- the zagovor is spoken as soon as it is full; a crossword entry takes one pace;
- chests open 80 % of the time (10 % in part); rock slides and spikes end by chance (most words break 3–4 rocks or close 4–6 slots);
- the first shrine is prayed at; every hero met joins while there is room; the pedlar sells by a fixed list (Živa voda, Alatir, Perunova sekira …);
- skill points: the next skill first, then the lowest rank, wherever the game allows;
- in a boss battle it strikes the helpers first (both vile, both wyverns, the wyverns that come when the Lintvern enrages), then the boss (Game Director, 20 Nov); elsewhere the game's own target, the first enemy standing.
`node tools/sim/run.js tools/sim/plan.json` runs the table below (about 25 minutes on two cores); `--dist` points to another build for comparisons.

**Measured (balance E as built, with support XP; journeys won, ±95 % interval):**

| Znanje | design pace | at the design pace | faster | slower | battle time per journey |
| --- | --- | --- | --- | --- | --- |
| Malček | 10 s | **55 % (±6), 300 journeys** — about 4.5 of 10 lost | 85 % at 8 s* | 17 % at 12 s* | 29 min (D: 20) |
| Učenjak | 8 s | **49 % (±8), 150** | 86 % at 6 s* | 6 % at 10 s* | 23 min |
| Knjižni molj | 6 s | **36 % (±8), 150** | 68 % at 5 s* | 0 % at 8 s* | 23 min |

Measured with the bosses as built and the bot striking boss helpers first. \* measured on an earlier build of the same day; the changes since cancel out at the design paces, so the slope should hold.

Where Malček journeys end (of 300; 139 lost): Ptuj 0 · Peca 3 · Triglav 4 · Bled 5 · Trnovski gozd 11 · Piranske soline 24 · Predjamski grad 23 · Ljubljansko barje 27 · Ljubljanica 35 · Ljubljanski grad 7. First-try wins per battle: 96–99 % up to Bled, 91–94 % from Trnovski gozd, 84 % against the Lintvern. Several tuning rounds before this (shown in the project doc *zagovor-balance-simulations*) put the losses at Peca and Triglav; the version built moves them to the second half and the bosses.

**Levels (Malček, 10 s):** the highest hero reaches about 2.6 at Peca, 4.7 at Trnovski gozd and 7.8 at the castle; the lowest about 5.5. By hero at Ljubljanica: Martin Krpan 7.8, Kresnik and Kralj Matjaž 6.4, Erazem, Ajdovska deklica and Kurent 6.2, Zeleni Jurij 5.8, Peter Klepec 5.4, Lepa Vida 5.0. The gap between a party's highest and lowest hero grows to about 2.3 levels (2.5 before support XP; Zeleni Jurij gained most, +0.9 levels). Heroes who only weaken (Lepa Vida) and late recruits still stay behind.

**Findings and open questions (PROPOSED / OPEN — for the Game Director):**
1. **The starter decides a lot.** On Malček at 10 s: starting with Martin Krpan wins 74 %, Kurent 46 %, Zeleni Jurij 41 %. Krpan's reviewed kit (Lipov kij 10 / 16 / 20) carries a fresh party. A review of the three starters together would even this out better than enemy numbers can.
2. **Pace dominates.** From 8 s to 12 s a word Malček goes from 85 % to 17 % won. The target holds for the assumed player only; the testers' statistics (seconds per word, `s/besedo`) should set the design pace of each Znanje.
3. **Support XP — DECIDED and built (Game Director, 20 Nov):** healing and shields count as XP (see the table above). Weakening (Lepa Vida's song, Kurent's bells) and Erazem's dodge still earn nothing; Lepa Vida stays the lowest hero.
4. **Učenjak and Knjižni molj lose some journeys early** (Peca and Triglav end 15 % of Učenjak journeys): one loss ends them. Their numbers sit below Malček's as they should, but nobody has asked for them; they are a proposal to review.
5. The model player never uses hints, the word proposals or the planted starter words, and solves every crossword at word pace; real Malček players get more help than the bot, real Knjižni molj players have harder crosswords.

## 4d. Skill texts and effect icons (20 Nov, v0.17.0)
**Game Director, 20 Nov (from the phone):** the skills had too much text; *s* means nothing, write the time; Kurent's sounded illogical; say the effect once and let stopnji 2 and 3 say only what changes; "−4" alone means nothing in Slovene; show stronger and weaker attack and defence with pictures, in the texts and above the heads for as long as the effect lasts.

- **Texts** (`RANK_TEXT` in `src/progression.js`, `SKILL_TEXT` and `UP_TAG` in `src/skills.js`): stopnja 1 says what the skill does, damage as *Udarec N* (superseded the same day by *za N točk*, below), then effects; stopnji 2 and 3 list only the new numbers or the new effect. Time in words with the Slovene forms (*2 sekundi*, *3 sekunde*, *5 sekund*). "Beseda z eno črko te barve" is gone from every skill; one line at the top explains the dots. Kurent: no dance in the text, Zvonci *napadejo cilj / 2 sovražnika / 3 sovražnike*, "naslednji udarec je 3 šibkejši" became the red swords with −3.
- **Wording, second pass (Game Director, 20 Nov):** the enemy in a skill is always *nasprotnik* with its Slovene forms (*nasprotnika*, *2 nasprotnika*, *3 nasprotniki*, *vse nasprotnike*), never *cilj* or *sovražnik*. Damage is *za N točk* (*za 1 točko*, *2 točki*, *3 točke*, *5 točk*; helper `tock()`), delays *napade N sekund kasneje*. **Stopnja 1 gives one well-written line of context from the hero's legend** and then the numbers; stopnji 2 and 3 only update the numbers (or name the new form, e.g. Krpan's *Vreče soli* and *Ogromna skala*). Pregon zime uses the Game Director's own wording: *Kurentov ples privabi ostale kurente, katerih zvonovi odženejo mraz in zlo. Vsi nasprotniki utrpijo 4 točke škode in napadejo 3 sekunde kasneje.* The context lines are game fiction drawn from each character specification (Krpan's club from the empress's linden, Erazem's cherries and the siege tunnel, the giantess guiding travellers through the snow above Prisank, Matjaž's army under Peca); the folklore claims stay as cautious as the specifications. Skill battle cards, Lepa Vida's role line and the zagovor finisher lines (*Strele udarijo vse nasprotnike!*) follow.
- **Nasprotnik everywhere (Game Director, 21 Nov):** *cilj* and *sovražnik* are wrong terms for the foe anywhere in the game. Every player-facing text now says *nasprotnik* (tutorial, Kako igrati, the pace and difficulty lines, item and god texts, the codex heading *Nasprotniki*, battle results and the log). The marker over the chosen foe reads **▼ izbran** and the keyboard hint *← → izberi nasprotnika*. Two exceptions stay on purpose: Peter Klepec's legend (*branil dolino pred sovražniki*, the real invaders) and the crossword clue for DAKAR (*cilj znanega relija*, a finish line). `tests/menu.test.js` fails if a string in the game calls the foe *sovražnik* or *cilj* again.
- **Icons** (`src/effects.js`, drawn in code as 16-pixel pixel art): **crossed swords = attack, a shield = defence; green with an arrow up = stronger, red with an arrow down = weaker.** The swords have gold hilts so they read as swords at 16 px. **The arrow is as tall as the swords or the shield and as wide as the shield** (an 11-pixel head and a 5-pixel shaft; Game Director, 21 Nov: the small arrow could hardly be seen). In texts and battle cards they are tokens (`{atk-} −3`).
- **Above the heads**, for as long as the effect lasts, stacked upwards: enemies with a weaker attack (Kurent's bells until their next blow, Pregon zime's ½, Lepa Vida's song, Volčja jagoda, Oslabitev) or a stronger one (the Volkodlak fed on repeated words); heroes with a stronger next attack (Kraljeva vojska +N, Perunova medica ×1,5, Dažbog ×2, Peter Klepec's growth) or a better defence (Matjaž's shield and army +N, the party's shield, Varstvo popotnikov on the others, Skrivni rov). "šibkejši" under enemies and "ščit N na junaka" / "vojska +N" under the party's health are gone; *varstvo ×N* and *vojska ×N* stay (charges the icons do not show).
- Not covered: delays (*napade pozneje*), burns, sleep and stone keep their words; no effect lowers a hero's attack or defence yet, but the red shield and red swords for heroes are ready for when one does.

## 5. Roster — all playable
| | Hero | Health | What they do | Moves (1 → 3 tiles) |
| --- | --- | --- | --- | --- |
| Folk | Martin Krpan | 36 | Heavy physical hits; the sword leaves a bleed (reviewed, 18 Nov, §4a) | Lipov kij → Kmečka moč → Mesarica |
| Folk | Zeleni Jurij | 26 | Small heals; unlocks letters; revives once per journey | Popek → Brstenje → Jurjevo |
| Folk | Kurent | 30 | Delays the target's next attack; his bells weaken enemies; Pregon zime delays everyone (v0.12.0, §4a) | Ježevka → Zvonci → Pregon zime |
| Folk | Kresnik | 28 | Fire that keeps burning, 1.5× on dragons; wins back part of a wound (v0.12.0, §4a) | Ognjeni meč → Kresna strela → Kresna moč |
| Folk | Kralj Matjaž | 34 | Shield on each hero, a bonus for every hero's next attack, raises the fallen (v0.12.0, §4a) | Meč → Kraljeva vojska → Prebujenje |
| **New** | **Erazem Predjamski** | 34 | Sword; cherries heal his neighbours; evades and strikes back (v0.12.0, §4a) | Zamah z mečem → Češnje → Skrivni rov |
| **New** | **Peter Klepec** | 30 | Every big move makes him 12 % stronger for the rest of the battle | Pastirska palica → Izruvano drevo → Vilin dar |
| **New** | **Lepa Vida** | 26 | Her song lowers enemy attack, the big move for all of them | Hrepenenje → Morska pena → Pesem z obale |
| **New** | **Ajdovska deklica** | 38 | Takes the others' blows (halved); turns enemies to stone (v0.12.0, §4a) | Metanje skal → Varstvo popotnikov → Okamnitev |
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
| *A bigger Pesjan* (CONFIRMED 28 Nov, *not built*) | Pesjan, larger | OPEN | takes the ordinary Volkodlak's place on the road; the Volkodlak becomes one mini-boss (§12) |
| Zmajev mladič (the olm of Postojna, once believed to be a dragon's young) | Lintvern, pale | 40 / 6 | *Jamski prah*: buries four letters |

## 7. Items
**Gold comes from chests (CONFIRMED, Game Director, 27 Nov 2026; IMPLEMENTED v0.22.0).** A chest opened with the whole word pays 35–50 gold (*zlatniki*); one opened a little with a shorter word pays up to 40 by its share. A won battle pays little: 1 gold an enemy, 5 a boss. Rock slides pay none. *(Until v0.21.0 every enemy dropped 4 + a share of its XP, about 7–25 a fight, chests 15–25 and rock slides 3 a rock: battles brought some 500–650 gold a journey and chests about 120.)* Velesov rog's +50 % still applies to both.

**The pedlar (a *krošnjar* from Ribnica) shows four things at most, each sold once (CONFIRMED, 27 Nov 2026):** one remedy, two potions or poisons and one relic the party does not have yet (fewer potions if no relic is left). A thing bought is marked *prodano*; the next pedlar has fresh stock. *(Until v0.21.0: four potions or poisons and two relics, the potions for sale again and again.)* Chests hold one random item, a remedy among them; ambushes and bosses drop one too (bosses always a relic).

**Remedies — the player uses them outside a battle (CONFIRMED, 27 Nov 2026; IMPLEMENTED v0.22.0; names, prices and amounts PROPOSED)**

| Item | Price | Effect |
| --- | --- | --- |
| Zeliščni čaj | 15 | The chosen hero gets back 40 % of their health |
| Arnikino mazilo | 30 | The chosen hero gets back all their health |

In *Torba* the player picks a remedy, then the hero: only heroes who are hurt and still standing can be picked (a remedy does not raise the fallen, like a well since 16 Nov: that takes a healer, Mrtva voda or a beaten god). In a battle the button says *po bitki* and the remedy waits. Potions and poisons still work by themselves in battle (below).

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
| Velesov rog | 40 | Gold from battles and chests +50 % (since 27 Nov nearly all of it is from chests) |
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

### 11.4 Wheel-križanka (*Kolo črk*) — built for the zagovor (v0.22.0, 27 Nov); the other crosswords *not yet*
**Built (Game Director, 27 Nov 2026: "Zagovor should also have a crossword puzzle with the new circular Wordscapes style. Less words available make the puzzles harder"; `src/wheel.js`, `tests/wheel.test.js`):**
- The zagovor opens on a wheel of 7 letters. The grid (at most 8 × 8) shows only progress; there are no clues. A word is made by dragging over the letters and letting go, or by tapping them one by one and the last one again; on a computer by typing and Enter. ⟳ shuffles the wheel.
- **The theme is the key word** (PERUN, KRESNIK, KURENT, MOKOŠ, VILA, TRIGLAV, VELES), always on the wheel and in the grid (gold outline). The other grid words are **base forms** of everyday words (`LEX.suggestedWords` whose base form is the word itself): without clues an inflected form is guesswork.
- **Difficulty = how many words the letters allow (CONFIRMED 28 Nov 2026):** of 36 random wheels, Malček gets the richest (about 33 words), Učenjak a middle one (about 18), Knjižni molj the poorest that still fills the grid (about 9). Malček: 5 words of 3–6 letters, about 30 % of the letters shown in the grid; Učenjak: 6 words of 3–7 letters, 12 % shown; Knjižni molj: 6 words of 4–7 letters, none shown. Every word keeps at least two letters to find. *Razkrij črko* as in the typed crossword (5 / 2 / 0; a word with a revealed letter hits at half power).
- Each grid word found fires its hit as in the typed crossword, and the last one speaks the zagovor. **An extra word** (a real word from the wheel that is not in the grid) is a weak hit, once per word (CONFIRMED 28 Nov 2026).
- **Where (CONFIRMED 28 Nov 2026, with the values above and the extra word's weak hit):** a phone opens the wheel, a computer the typed crossword; *Nastavitve → Križanka zagovora* (Kolo črk / Klasična križanka) switches either way on any device (`zg-kolo`). Zaseda, Vrtinec and Zmajeva uganka stay typed for now, and so do the chest and the rock slide.

The crossword grid stays as the progress display; input moves to a **letter wheel** — no picking a row or cell to type into. No clues: help is pre-revealed letters here and there by tier, plus the §11.3 starter words. Inspired by the Wordscapes kind of word game; like the other inspirations it is not named in the game (`zagovor-store-release.md`).

- **CONFIRMED, 24 Nov (replaces "PC and tablet only" and "the in-game keyboard is removed entirely"):** the wheel replaces the crossword on phones, and **a setting on every device** brings back the classic typed crossword: on a **phone with the in-game Slovene keyboard**, on a **tablet with the system keyboard**. The in-game keyboard therefore stays. Tablets currently run the phone layout with the system keyboard switched off, so tablets need their own detection.
- **PROPOSED defaults (not answered yet):** wheel on phone and tablet, classic on PC; a real word from the wheel that is not in the grid (an "extra word") deals a weak hit, like a three-letter mesh word.
- **CONFIRMED: themes.** A crossword has a theme (Kurentovanje, Ptuj, the boss). On a wheel every grid word must be spelled from the same letters, so the theme lives in the **geslo** — the word that uses the theme letters (KURENT, VINOGRAD) — in the title and in the scene; the other grid words are everyday words, as the crossword rule of 11 Nov already says. Long theme words are **split into parts** (VINO + GRAD, POVODNI + MOŽ), one part per wheel, and the geslo is assembled across the parts (§12).
- **Findings (24 Nov, the real dictionary, frequency-filtered):** a wheel of a theme part plus chosen extra letters gives plenty of everyday words — VINO 84 (7 letters) / 286 (9 letters), GRAD 76 / 236, MOŽ 76 / 245, ZMAJ 67 / 202, OGENJ 67 / 230, POVODNI 23 / 136 (needs 8–9). Whole theme words alone are often too thin (KOŽUH 3, MASKA 9). The picker never chooses Č, Š or Ž by itself, so they have to be put in on purpose. The everyday clue bank (831 words) holds only 2–11 words of any wheel, so the wheel needs its own word picker (layout can reuse `genCross`), and the classic crossword keeps today's generator. A frequency filter still lets through some words unfit for the game; grid words need a reviewed list on top of `never-suggest.json`.
- **Phone layout:** grid in the top half, wheel in the thumb zone, at most 8–9 letters on the wheel; two parts of a crossword fit at about 28 px a cell, three do not, so the grid scrolls to the active part.

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
- **Far wider word pools:** each region has its own chest words with clues in `data/words.json` (a first list of 114 words, 11–13 per region, to review); a chest never repeats a word on one journey. Every region has a place for a chest (at the very start of Ljubljanica and Ljubljanski grad), kept on a journey by chance, by Znanje (§1; v0.11.0).
- **The clue by Znanje:** always on *malček*, on about every other chest on *učenjak*, never on *knjižni molj*.
- **Chest UI:** ✕ and *Pošlji* sit next to the assembled word; the text says a mistake can be cleared.
- *Not built:* the letter wheel here too, with shorter words from the visible letters allowed (§11.4).
- Played **on the road**, not on screens of their own (§11.10, *not built*).

### 11.8 Post-match, folk cards and character screens — *partly built*
- **Built:** hero screens (meeting a hero, after a battle, the party) end in a **full-width footer** right under the content; on a phone it sticks to the bottom of the screen, so the way on is never below the fold (checked on 360×640).
- **Built:** *Upravljanje* in *Kako igrati* covers phone, tablet and computer (this device first), and says the game is most comfortable on a tablet or computer.
- **Built (25 Nov, v0.19.0):** the character screen's toggle between the hero's card and the **folk skill cards** (*Karte veščin*), a tapped card full screen (tap or Esc closes it). A skill's card is collected the first time the skill fires in a real journey battle (Game Director, 25 Nov), with a toast. In battle the paintings were an A/B test against the SVG boards (Game Director, 25 Nov). **Superseded 26 Nov (0.21.0):** the paintings are the default in every *Kakovost slik* setting and the test is over; a hero's skill without a painting shows an empty board with **???** in battle, on the hero screen (*Karte veščin*, now on every hero) and in *Liki in karte*. Enemies keep their hand-made boards.
- **Built (28 Nov, v0.24.0, Game Director):** a skill card won for the first time **flashes in** over the battle's
  result (never during a puzzle); a tap turns it over, **✕ Zapri** on top closes it; the menu opens every card and every
  achievement the same way without the effects. Achievement toasts stand at the middle of the right side. Details in
  `docs/achievements-design.md`. *Open:* whether the reveal should come when a skill is **learned** at a well or a
  signpost rather than when it first fires (the 25 Nov rule, kept).
- **Built (25 Nov, v0.19.0):** **achievements** in *Dosežki in junaki* (59, groups, tiers, progress bars, secrets) and the **story cards** earned at the Lintvern win, from [achievements-design.md](achievements-design.md); the profile survives journeys.
- *Not built:* **post-match screen** (the team, the **last damage dealer** in front, statistics on the others and on their cards); the story cards' pictures; achievement icons (Codex, `achievement-art-spec.md`).

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
- **Store declarations:** sending words and regions is still data collection — declare it in Google Play's Data safety form and Apple's privacy label and in the privacy policy. Since v0.13.0 so are the opt-in battle statistics (§4b): game activity and device type, not linked to a person, sent only with consent.
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

## 12. Bosses and mini-bosses: health bars and timed letter-wheel events (24 Nov) — built (v0.23.0, 28 Nov)
Game Director, 24 Nov 2026; "implement bosses and minibosses (gods including) multiple healthbars and minigames" on
28 Nov 2026. Builds on the wheel-križanka (§11.4). Code: `src/bosses.js`, hooks in `damageEnemy`, `openCrossword`,
`battleTick` and the crossword's end (`src/game.js`) and in the wheel (`src/wheel.js`); tests: `tests/bosses.test.js`.

**CONFIRMED** (IMPLEMENTED v0.23.0 unless marked)
- **Mini-bosses have two health bars and two timed events:** the gods as challengers (§2a) and Povodni mož. **The
  Lintvern has three.** The Volkodlak: see OPEN below (not built).
- **A fixed rhythm:** the letter mesh takes an enemy to the **middle of a health bar**; there the **timed event** starts
  and its words take the **rest of that bar**. Then the mesh again to the middle of the next bar, and the next event.
  Half of a boss's health is fought on the mesh and half in the events, and the last event lands the last blow.
- **The event is the wheel-križanka, timed:** **a minute** (`BOSS_EVENT.sec`). Every word finished takes its share of
  the enemy's health (by its letters; half with a revealed letter). While it lasts, the enemy **hits every hero every
  15 seconds**; the other enemies wait. The event cannot be cancelled (no ✕); its ? opens the wheel's rules.
- **The event screen shows** the boss's health bars with the next events marked, the time, the seconds to the next blow
  and the party's health bars, over the grid and the wheel.
- **The health bar drains as one bar, from the right:** the full bars stay on the left, the first bar to fall is the
  rightmost (Game Director, 28 Nov 2026, on the phone).
- **Theme:** each event's key word is one part of the boss's theme (`BOSS_KEYS`).
- **A big word only pushes the health to the middle of a bar, so the event starts** (Game Director, 28 Nov 2026):
  damage outside an event stops there; during an event only its own words hurt the boss (burns and other blows do
  nothing).
- **The difficulty stays as built** (28 Nov 2026, after the simulator table below: "the bosses should stay this hard"),
  the gods included.

**PROPOSED — built this way, for the Game Director to confirm**
- If the minute runs out, the rest of that bar is fought on the mesh and the next event still starts at the middle of
  the next bar.
- An event that comes due while the zagovor (or another crossword) is open waits and opens as it closes.
- Names and key words: Povodni mož — **Vrtinec**, POVODNI then MOŽ; the Lintvern — **Ognjeni vihar**, ZMAJ, OGENJ, GRAD;
  a god's event is named after their third skill (Perun's *Nevihta*) with two words of their theme (STRELA, NEVIHTA;
  JEKLO, KOVAČ; ZEMLJA, VRETENO; MEDVED, ŽIVINA; ZARJA, SONCE; VETER, BURJA).
- The blow: a god strikes with their special; Povodni mož and the Lintvern with half their attack on every hero
  (`BOSS_EVENT.hit`; see Balance below).
- **Mirni način:** no clock; the boss strikes after **every third word sent** (`BOSS_EVENT.calmEvery`), as enemy attacks
  in calm mode already count words.
- The events replace the old forced crosswords: Povodni mož's lock crossword (*Vrtinec*, the mesh closed) and the
  Lintvern's *Zmajeva uganka*. Povodni mož's third move is now *Poplava* (the bottom row flooded). The Lintvern's fire
  breath (66 % and 33 %) stays on the mesh; his second phase (half his health = the start of his second event) waits for
  the end of that event, never inside it or on the blow that brings it.
- An event's wheel has one word fewer than the zagovor's on the same Znanje (at least four).

**OPEN**
- **The boss flow stays as it is (Game Director, 28 Nov 2026):** Povodni mož at the Ljubljanica, the Lintvern at
  Ljubljanski grad, the gods at their shrines. No new mini-boss encounter for now.
- **Lore expansion — future mini-bosses, written down 28 Nov (not designed, not built):**
  - *Volkodlak* — **CONFIRMED 28 Nov: the Volkodlak is one mini-boss, and the ordinary one on the road becomes just a
    bigger version of the Pesjan** (whose sprite is already the Volkodlak's, tinted). *Not built.* OPEN: where he
    fights (an idea: the last battle of Trnovski gozd, under its full moon, with two bars and two events); the bigger
    Pesjan's name and numbers (Pesjan's moves, the old Volkodlak's strength, PROPOSED); whether "feeds on repeated
    words" stays with the mini-boss; the Volkodlak's achievements (*Volkodlakov strah*, *… nočna mora*, the one about
    repeated words, *every kind of foe*) — they count beaten Volkodlaki, so they wait for the mini-boss or move to the
    bigger Pesjan.
  - *Divji mož* — the wild man of Slovene folklore. He needs a folklore research pass (ChatGPT) before any design:
    region, nature (foe or guardian), look and words.
- Scorched letters carrying into the wheel — not built.
- The gods other than Stribog still use only their special outside the events (Stribog got gusts between his letter
  scrambles on 28 Nov). Whether they get plain attacks too is the Game Director's call.

**Balance (simulator, 28 Nov, 100 journeys each, bot word pace 10 / 8 / 6 s on Malček / Učenjak / Knjižni molj)**

| Build | journeys won M / U / KM | gods beaten M / U / KM | Lintvern at the first try (M) | Lintvern fight (M) |
|---|---|---|---|---|
| v0.22.0, no bars | 37 / 16 / 22 % | 59 / 68 / 70 % | 88 % | 110 s |
| bars, blow 0.5 × attack every 15 s | 22 / 13 / 11 % | 49 / 38 / 56 % | 34 % | 206 s |
| **bars, blow 0.3 × attack every 15 s (built)** | 29 / 8 / 17 % | 27 / 38 / 59 % | 52 % | 218 s |
| bars, blow 0.3 × attack every 20 s | 35 / 19 / 21 % | 49 / 53 / 70 % | 67 % | 225 s |

The target of 20 Nov (on Malček at least 4 of 10 journeys lost) holds in every row. With the bars a boss fight takes
about twice as long. The bot plays an event word every pace × `cw` seconds and never uses Razkrij, so its events are
slower than a player's, and the samples are small (a god's row moves by ±10 points between runs of the same build).
The build keeps the confirmed 15 s and sets the blow of Povodni mož and the Lintvern to **0.3 × their attack**
(PROPOSED). The gods strike with their special in the event (every 15 s, against every 9.5 s outside it); they are
clearly harder than before because a fight with bars lasts longer; a lost challenge never ends a journey. The Game
Director kept it so (28 Nov).

**Ideas of 28 Nov (Game Director's brainstorm — not decided, not built)**
- *Permanent unlocks on harder Znanje:* on the harder tiers some skills unlock for good, so heroes start a journey
  stronger and earn less XP, and meet the bosses and gods stronger.
- *Spread the bosses* (meet Povodni mož earlier, finish him later at half health) — **not pursued:** the Game Director
  keeps the current flow (28 Nov). A note for later: the Ljubljanica never reaches Piran (it flows into the Sava); the
  authentic link is the karst — the "river of seven names" runs underground near Postojna and rises at Vrhnika.
- *More mini-bosses* — the lore expansion list above.
- *Permanent unlocks* — decided the same day: §13.

## 13. Lasting progress by *Znanje* (Game Director, 28 Nov 2026) — *not built*

**CONFIRMED**
- **Malček never makes a hero permanently stronger.** It fills only some achievements of its own (achievements specific
  to that difficulty), nothing else.
- **On Učenjak and Knjižni molj XP is scarcer, and so the heroes' levels are permanent:** a hero keeps the levels, and
  with them the skills, from one journey to the next.
- **Skill cards won on the harder tiers look far more prominent and rare.**
- **More achievements unlock on the harder tiers.**

When built, this supersedes "every journey starts at level 1" (`heroState`, §4 and §4c) on Učenjak and Knjižni molj.
Malček keeps it.

**OPEN — needs the Game Director's decisions before building**
1. **One record or two?** Are a hero's lasting levels shared by Učenjak and Knjižni molj, or kept for each tier?
2. **What carries over:** levels, XP, skill points not yet spent, the skills chosen and their stopnje? Gold, the bag,
   relics, gifts and health would still start fresh. Does a lost journey keep what it earned?
3. **How scarce:** the XP factor on each tier. The simulator proposes numbers once 1–2 are settled.
4. **The ceiling:** levels stop at 9. A party that has reached 9 makes the harder tiers easier over time, so the enemy
   curve (§4c) may need to follow the heroes' level, or the tier may need a prestige reset.
5. **The rare cards:** what changes on a card won on Učenjak or Knjižni molj (frame, foil, a mark of the tier). This
   needs an art spec (ChatGPT) before Codex paints anything.
6. **Which achievements** belong to Malček only, and which are new on the harder tiers (`docs/achievements-design.md`).

**Balancing it:** today every simulated journey starts from scratch. With lasting levels, a journey's difficulty
depends on what earlier journeys earned. The simulator then needs fixed **player profiles** — saved starting states
such as "first journey on Učenjak (everyone at level 1)", "after a few journeys (heroes at 4–5)" and "veteran (heroes
at 9)" — and runs of several journeys in a row with the save carried over. That shows how fast heroes grow and when a
tier stops being a challenge.
