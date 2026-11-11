# Za govor — progression design (updated 11 Nov 2026, evening state)

Prototype: https://claude.ai/artifact/NTdMnud7X8Um2p38G1fVnb

## Status at a glance
- **Confirmed by the user:** starters Krpan, Jurij, Kurent; a freed god thanks the heroes and lends their power the next time they meet (next run); Veles **and Perun** (the god who fought him most) become playable after the finale; Veles's attacks and presence are stronger than anyone's; enemies attack slower; every hero has their own health bar; a fallen hero stays down for the run (greyscale, lying down); only a few heroes can revive; heroes level up to level 3 (highest HP, attacks grow with longer words).
- **Built in the prototype:** per-hero health, levels and XP; fallen heroes; Mokoš's revive; slower enemies; hero moments (section 5). The party in battle is still Perun, Svarog, Mokoš, Kresnik (four heroes).
- **Not yet built:** party of three with the starters, meeting and swapping heroes on the map, cursed-god boss fights, items, Veles and Perun as post-finale unlocks.

## 1. The idea in one paragraph
Morana's winter has cursed the gods: they no longer hear human speech and guard their lands as bosses. You set out with three ordinary folk heroes. Words are the charm (zagovor) that breaks the curse. A freed god thanks the heroes and promises to lend their power the next time they meet; they can be picked up in the next run. Each run is one turn of the year (Kolo leta). Perun and Veles, the eternal rivals, are the last two curses; both become playable only after the finale.

## 2. Party rules (proposed)
- **Cap: three heroes in the party.** The letter mesh then has three hero colours plus neutral tiles.
- **Meeting a hero on the road** (a map node): take them if you have a free slot, otherwise swap one out or walk on. A hero you leave behind keeps their level and can be met again later in the same run.
- **Items stay with the party**, not with the hero who leaves.

## 3. Health, falling and reviving (built)
- **Own health per hero**, shown as a bar with numbers under each sprite; the bar turns gold under 50 % and red under 25 %. The shield is still shared by the party.
- **Base health at level 1:** Perun 28, Svarog 34, Mokoš 26, Kresnik 26; planned: Krpan 34, Jurij 24, Kurent 28, Matjaž 32, Dažbog 28, Stribog 26, Veles 36.
- **Who gets hit:** a normal enemy attack hits one random standing hero. Attacks that hit everyone (Lintvern's Ognjeni dih, a failed forced crossword) are split evenly.
- **Falling:** at 0 health the hero lies down in greyscale and stays down for the rest of the run. Their letters turn grey and no longer trigger attacks. The battle is lost when all heroes are down.
- **After a won battle** the heroes still standing recover fully; fallen heroes stay fallen.
- **Reviving (rare):** Mokoš's tier-3 move Materina roka lifts one fallen hero at 40 % health, once per battle. Planned: Zeleni Jurij's Jurjevo does the same once per run. Nobody else revives.
- **Prototype convenience:** after a lost battle the heroes return to the state they had when it started, so it can be retried. "Nova pot" on the start screen resets all heroes.

## 4. Levels (built)
- **Three levels per hero.** XP is earned by the hero who attacks (word length × repeat factor × (1 + tier)); enemy and crossword XP is shared by the heroes still standing. Level 2 at 50 XP, level 3 at 140 XP.
- **Health:** ×1.25 at level 2, ×1.6 at level 3 (highest).
- **Attack:** ×1.15 at level 2, ×1.3 at level 3.
- **Long words:** from level 2, every letter beyond the fourth adds 4 % power; at level 3 it adds 10 % (an 8-letter word at level 3 hits ×1.82).
- Level is shown as three dots under each hero, and on the hero screen after a battle.

## 5. Hero moments (built)
One screen, three occasions: after every won battle (opens on the hero who struck last, shows level and health, a fallen hero lies down), when a new hero is met (greeting; preview from the gallery), and when a curse lifts (the violet tint clears, the god thanks the heroes; preview from the gallery). The sprite breathes in stepped frames with an aura and rising motes. Beside it the hero's card: folk-art portrait on the front, a "Obrni karto" button flips it to a two-paragraph backstory. Veles is drawn one size larger with a bigger aura. Backstories for all eleven heroes are first drafts and need a folklore check.

## 6. Roster
| Tier | Hero | Role in battle | How you get them |
| --- | --- | --- | --- |
| Starter | Martin Krpan | Slow, heavy single hits; tier 3 stuns a boss | Start of every run |
| Starter | Zeleni Jurij | Small, frequent heals; tier 3 unlocks letters and (once per run) revives | Start of every run |
| Starter | Kurent | Low damage, stun and delay | Start of every run |
| Road | Kresnik | Fire damage over time | Met in Act I–II |
| Road | Kralj Matjaž | Shield for the whole party | Asleep under Peca; wake him with a crossword |
| God | Svarog | Damage + shield | Cursed boss, Act I; from the next run |
| God | Mokoš | Strong heals, cleanses, revives once per battle | Cursed boss, Act II; from the next run |
| God | Stribog | Hits all enemies, reshuffles the mesh | Cursed boss, Act III; from the next run |
| God | Dažbog | Light: next word counts double | Cursed boss, Act III; from the next run |
| After the finale | Perun | Highest burst, chain lightning | Cursed boss, Act IV; playable after the finale |
| After the finale | Veles | Poison, hits all; strongest attacks of all (×1.4), most health | Final boss; playable after the finale |

Starters have ×0.8 attack and learn their domain words by level 3. Gods have ×1.2 attack; Veles ×1.4.

## 7. Cursed gods as bosses (proposed)
- **Look:** the same sprite with a cold violet tint and a dark aura. Veles is larger than the others.
- **Fight:** the god uses their own three moves against you, plus one language-stealing special (Svarog melts letters to ash, Mokoš floods a row, Stribog reshuffles your mesh, Dažbog blinds tiles, Perun locks the long words, Veles swaps letters).
- **Breaking the curse:** the boss crossword's hidden keyword (geslo) is the god's true name. Solving it ends the fight early and counts as "curse lifted".
- **Perun and Veles:** if one is in your party when you fight the other, both sides hit harder (×1.25).

## 8. Enemy pace (built)
Real-time attack intervals are 30 % longer: Škrat 8.5 s, Mora 10.5 s, Volkodlak 11 s, Vodna vila 9 s, Povodni mož 12.5 s, Lintvern 11.5 s (9.5 s in phase two). In calm mode enemies act every fourth word instead of every third (Vodna vila and Lintvern's second phase every third instead of every second).

## 9. Items (proposed)
Three party slots, found in chests, bought from a pedlar (krošnjar) or dropped by bosses.

| Item | Effect |
| --- | --- |
| Lectovo srce | Heals 3 after every 5-letter word |
| Kurentov zvonec | First enemy attack of each battle is delayed |
| Pisanica | Shield +5 at battle start |
| Idrijska čipka | Words with Č, Š or Ž get +25 % |
| Krpanova sol | Repeated words lose less power |
| Praprotno seme | Word proposals cost nothing; shows one extra |
| Zlatorogova roža | Once per run: a hero survives a lethal hit with 1 health |
| Lipov list | Crossword timers +8 s |
| Panjska končnica | Cards of the wearer always show the tier above (and +10 % damage) |
| Kresna bakla | Burning lasts one word longer |

## 10. Backgrounds
- **In the prototype (own pixel art, 384×120):** Barje, Temni gozd, Ljubljanica, Ljubljanski grad.
- **To draw next:** Triglav and the Alps in snow, Bled or Bohinj, Ptuj at carnival, Bela krajina birch groves, Kras with burja-bent pines and Škocjan caves, Peca with Matjaž's cave, the world tree's roots for Veles.
- **Free packs for placeholders** (check each licence): ansimuz "Forest Background" (OpenGameArt, CC0), Macrune12 "Pixel Art Parallax Forest" (itch.io, CC0), the "CC0 Backgrounds" collection on OpenGameArt.

## 11. Art status
Sprites and three card paintings for all eleven heroes; sprites and two cards for the six prototype enemies. Not drawn: Pehtra baba, Morana, Triglav; proper cursed-god boss sprites (currently a tint); a drawn "fallen" frame per hero (currently the idle frame rotated).

## 12. Still to decide
1. Party of three in the mesh: keep neutral tiles, or give every tile a hero colour?
2. Which cursed god is the first boss on the current prototype path (suggestion: cursed Svarog at Ljubljanski grad after Lintvern)?
3. Should standing heroes recover fully after each battle, or only partly?
