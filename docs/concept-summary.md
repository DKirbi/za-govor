# Za govor — concept summary (updated 11 Nov 2026)

Full concept doc: https://claude.ai/artifact/SNNktnteBoppi5M4PMkzFF
Playable UX prototype (browser; all party heroes and enemies have sprites, cards and sound): https://claude.ai/artifact/NTdMnud7X8Um2p38G1fVnb

## Reference game
- The inspiration is **Words for Evil** (Chromosphere Games / Dylan Loney, 2014, Unity, English only): Boggle-style letter grid; the coloured tiles in a word decide which hero attacks (1/2/3 tiles = simple/super/ultra); enemies attack in real time.
- Plan: an original game with its own name, art, heroes and text, not a translation.

## Confirmed decisions
- **Title: Za govor.** Read as one word, *zagovor* is a folk charm; as two words it means "for speech", a nod to promoting the Slovene language. Write it "Za govor" (Slovene titles capitalise only the first word). Logo treatment is still open.
- **Engine: Godot 4.7.** Lexicon built offline (TypeScript/Python) into a DAWG; GodotSteam added later. The UX prototype is a single HTML/JS page so the mini-games can be tested now; its rules and data carry over.
- **Puzzles:** letter mesh (besedna mreža) for battles, where used letters vanish and new ones appear; crosswords (križanke) that grow from 5×5 minis to 9×9, 13×13 and arrow-word (švedska križanka). The shaded *geslo* of a chapter crossword is the next boss's true name. Folk riddles (uganke) for chests and gates.
- **Crosswords are finishers and openers:** the zagovor meter fills from letters played (30). Each entry turns green only when fully correct and fires the theme hero's attack at once; partial or wrong entries stay black and do nothing. A full solve adds a bonus attack, XP and a themed effect (Perun hits all, Kres burns all, Mokoš heals + cleanses, Triglav stuns). Ambush crosswords at battle start are early combos.
- **Crossword content (iteration 4, after "mythology-only is too hard"):** everyday words fill the grid; mythology is only the hidden keyword (geslo) in a gold column, or sometimes one starred main entry. Puzzles are generated fresh each time from 359 hand-written clues in 14 everyday topics (food, home, nature, animals, body, sport/music, town, people, objects, time, colours/opposites, verbs, Slovenia, proverbs). Guessing the keyword before its column is complete ends the crossword at once (+15 % power and 8 XP per hidden letter). Enemy crosswords use only easy 3–5-letter words.
- **Crossword sources:** no Slovene crossword API exists; magazine puzzles (Razvedrilo, KIH, 3K) are copyrighted; Pet vodoravno is a solvers' community; Križankar is a crossword-setting business (possible partner to commission puzzles). To scale clues: CJVT's synonym dictionary (CC BY-SA 4.0) and collocations dictionary for clue candidates, edited by a person. Follow the modern friendly style (everyday words, verbs, adjectives, proverb fill-ins), not obscure fillers.
- **Enemy strongest attacks take the language away:** letter locks (ash, flood), sleeping heroes (grey tiles), and forced crosswords (34 s, easy words) with the mesh closed; their hidden keyword (URŠKA for Povodni mož, ZMAJ for Lintvern) is a shortcut out (solve = counterattack, fail = triple damage).
- **Timed sequences:** chest (scrambled word, 40 s / 80 s calm; every real word found = partial reward of 3 XP per letter, the hidden word = 50 XP + next battle's meter half full), rock slide (type words containing each falling letter).
- **Inflection:** every inflected form is valid in battle; crosswords use base forms; repeated forms of the same word hit weaker (×1, ×0.6, ×0.35, ×0.2).
- **Input:** keyboard typing (path found automatically), mouse drag / click tile by tile, or touch.
- **Č, Š, Ž are deliberate letters (11 Nov):** they must be typed (Slovene keyboard layout) or tapped; c, s, z never stand in for them anywhere — mesh, crosswords, chest, rock slide. The audience is primarily Slovene, so this is fine. The old "lenient diacritics" option is gone, and ć/đ are no longer mapped to č/d.
- **Mobile mode:** "Mobilni prikaz" switch in a top bar on every screen (auto-on for touch devices, keeps game state). Phone layout: thumb bar pinned to the bottom (Briši, Počisti, Pošlji; Zagovor, Namig, Premešaj).
- **Send button (iteration 3):** a visible *Pošlji* button next to the word in the mesh, chest and rock slide; green when the word is valid; Enter still works.
- **Crossword typing (iteration 3):** tapping the grid opens the phone's native keyboard (swipe, autocorrect and diacritics work); the custom on-screen keyboard was removed. On phones the clues stack under the grid.
- **Knowledge levels (11 Nov):** a second difficulty choice below the pace. *Malček* (baby, the original game): 3-letter words, word proposals, 3 hints per battle, everyday crosswords (359 clues), letter counts and 5 revealed letters per crossword. *Učenjak* (scholar): 4-letter minimum, 1 hint, no proposals, longer and harder crossword words (219 clues, up to 9 letters), 2 revealed letters. *Knjižni molj* (book worm): 4-letter minimum, no tips at all in the mesh (no hints, proposals, word count or coaching), crosswords in the style of paper crosswords (257 original clues: capitals, rivers, Slovene places and writers, art, music, antiquity, science) plus the Učenjak words, no letter counts, 1 revealed letter. A word finished with a revealed letter fires at half power. The choice is remembered between visits.
- **Word proposals:** once a word is started, up to 8 words continuing the path are proposed (strongest first, tap to select). Toggle on the start screen; meant for learners.
- **Enemy HP (iteration 2, much lower):** Škrat 22, Mora 35, Volkodlak 45, Vodna vila 30, Povodni mož 110, Lintvern 180; HP numbers shown under bars.
- **Pace:** two difficulty options. Real-time (recommended) has no on-screen countdown: enemies attack at their own pace, telegraphed by wind-up glow/animation, and wear HP down. Calm mode (mirni način) holds enemies until a word is played.
- **Art:** rich pixel art on the battlefield (640×360 base, integer scaling, sprites ~48–64 px, bosses 96–160 px). When anyone attacks, a painted folk-art card (panjske končnice style) rises above the attacker in the scene layer, never as a pop-up and never over the grid. Card size scales with tier; input is never blocked.
- **Card timing (11 Nov):** every attack or event card stays up to 3 s (small 2.3 s, medium 2.7 s, large 3 s); the last 30 % is a slow fade. A new card replaces an older one it would cover.
- **Steam:** parked for now.

## Art pass 1 (10 Nov 2026, in the prototype)
- **Characters drawn:** Perun, Svarog, Veles. Screen "Liki in karte" (button on the start screen) shows each sprite, both frames, an attack preview against a straw dummy and the card paintings.
- **Sprites:** 48×48 px, two frames (idle, attack), facing right, dark outline, ~12 colours each. Shown at integer scale only (1× phone battle, 2× desktop battle, 2–3× gallery).
  - Perun: silver hair, golden beard and moustache, gold circlet, blue embroidered tunic, red cloak, axe; attack frame swings the axe overhead with a lightning bolt.
  - Svarog: bald with red top-knot, iron headband, ember beard, bare arms, leather apron with a sun sign, hammer; attack frame slams the hammer down with sparks.
  - Veles: bull horns, bearskin hood and cloak, pale face with green eyes, long dark beard, green robe, staff with a coiled snake; attack frame thrusts the staff and the snake strikes.
- **Attack animation (early-handheld style):** attacker jumps forward in hard steps and shows the attack frame; the target flickers and shakes; tier 3 adds a longer double lunge and a white screen flash. Idle is a 1-pixel bob.
- **Cards:** wide painted boards (240×104, like a beehive panel), flat colour, dark outlines, wood grain; one painting per hero per tier, with a paper caption (move, word, damage). Tier 1 small board with plain red frame, tier 2 medium with carnations, tier 3 large with gold frame and thunder-mark rosettes. Simultaneous hero cards fan out side by side.
  - Perun: Blisk (bust, one bolt, irises) → Grom (axe raised on a cloud, oak, Triglav) → Nevihta (storm over Triglav, eagle, burning oak).
  - Svarog: Kladivo (bust, anvil, sun) → Kovani ščit (sun-faced shield, flames) → Nebeška kovačnica (forging the sun at night, sparks become stars).
  - Veles: Kačji pik (bust, snake, cow, coins) → Medvedja šapa (bear in a dark wood) → Korenine sveta (under the world tree's roots, serpent, herd, gold).
- **How it is made:** sprites are generated by a Python script (PNG sheets embedded in the page); cards are SVG built in JS. Both are prototype art to fix the direction; final art is still meant for illustrators.

## Art pass 2 (11 Nov 2026, in the prototype)
- **Now drawn:** Mokoš, Kresnik and all six prototype enemies. Nothing in battle is a placeholder square any more. Veles is still gallery-only. Later-roster heroes (Dažbog, Stribog, Kurent, Zeleni Jurij, Martin Krpan, Kralj Matjaž) and campaign bosses (Pehtra baba, Morana, Triglav) are not drawn yet.
- **Hero sprites:** Mokoš — white headscarf with a wheat wreath, embroidered blouse and apron, green skirt, distaff with wool; casting sends water drops. Kresnik — golden flame hair, red vest, torch; attack throws a burst of flame.
- **Enemy sprites** (face the party; lunge towards it when they attack): Škrat (small, red cap, white beard, pickaxe, bites), Mora (floating, long black hair, glowing eyes, reaching claws), Volkodlak (grey werewolf, red eyes, torn trousers, claw swipe), Vodna vila (teal hair with a water lily, dress turning into a wave), Povodni mož (64×64 boss: green, scaly, water-weed beard, fin ears), Lintvern (64×64 boss: green dragon, red wings, arrow tail, fire breath).
- **Hero cards:** Mokoš: Kapljica (bust, one drop, carnation) → Vir (spring, wheat, tree) → Materina roka (rainbow, wheat, cow, painted beehive). Kresnik: Žerjavica (bust at dusk) → Plamen (bonfire at night) → Kresni ogenj (midsummer night: bonfire, burning wheel rolling downhill, fern flower).
- **Enemy cards:** dark frame with a white lace-dot border; one painting for the plain attack and a second for the special move: Škrat (Ugriz only), Mora (Dušenje / Uspavanka — she sits on the sleeper's chest), Volkodlak (Zobje / howling at the full moon when he feeds on a repeated word), Vodna vila (Val / Poplava with letter tiles washed away), Povodni mož (Objem vode / Vrtinec with letters in a whirlpool), Lintvern (tail strike before Ljubljana castle / Ognjeni dih with the castle burning).

## Audio (11 Nov 2026)
- **What Words for Evil used:** its credits list music by Kevin MacLeod (incompetech.com) — calm royalty-free tracks; no separate sound-effects credit is listed. Reviews describe the soundtrack as calm, changing with the region.
- **In the prototype:** 16 retro sound effects synthesised in the browser with ZzFX (MIT licence), no audio files: tile select (pitch rises with word length), valid / invalid word, three hit strengths, one signature sound per hero (Perun zap, Svarog clang, Mokoš heal chime, Kresnik fire, Veles venom), enemy hit, enemy special, enemy defeated, victory, defeat. A "♪ Zvok" switch sits in the top bar. The parameters were set without listening, so they need tuning by ear.
- **For the real game (candidates):** CC0 packs — SubspaceAudio "512 Sound Effects (8-bit style)" on OpenGameArt, Kenney audio packs; generators — jsfxr / sfxr.me, jfxr (BSD), ZzFX designer; music — incompetech (CC BY, credit required) or commissioned Slovene folk instruments. Keep a licence log.

## Proposed, not yet confirmed
- Dictionary for the real game: Sloleks 3.x (CC BY-SA 4.0). Avoid Sloleks 1.0 and the website data (non-commercial). The prototype uses ~46k forms (every form of common words) from simplemma + wordfreq.
- Dual forms (dvojina) trigger pair attacks; Č/Š/Ž are power tiles (in prototype: crit ×1.5); domain-word bonus per hero (in prototype: ×1.5).
- Archaic layer from Besedje 16. stoletja and Pleteršnik; bohoričica chapter; hero ultimates are multi-word charms.
- Veles moves: Kačji pik, Medvedja šapa, Korenine sveta.

## Content skeleton
- Heroes: Perun, Svarog, Mokoš, Kresnik (starters); Dažbog, Stribog, Kurent, Zeleni Jurij, Martin Krpan, Kralj Matjaž.
- Prototype path: Barje (2 škrata) → Skrinja → Temni gozd (Mora, Volkodlak) → Plaz kamenja → Ljubljanica (Vodna vila, Povodni mož) → Ljubljanski grad (Lintvern).
- Campaign "Kolo leta": I Winter (Alps, boss Pehtra baba) → II Spring (Ptuj/Bela krajina, Morana) → III Summer (Ljubljana/Kras, Povodni mož, Lintvern) → IV Autumn (Triglav trial, Veles finale) → New Game+.
- Source tiers: Slovene folklore (Kropej) > pan-Slavic deities > public-domain literature > contested (Medvešček) > avoid (Book of Veles).

## Still open
Veles's role (the user listed him as a starting character; the campaign has him as the autumn final boss — playable hero, boss, or both?), logo treatment of the title, profanity toggle default, 2D only vs simple 3D world map, company setup (only for EU funding later), balancing after playtests (HP now low — check that later battles still feel tense), whether proposals should cost something (XP or the zagovor meter), whether Križankar or another setter should edit the final crossword bank, tuning the sound effects by ear and choosing music.
