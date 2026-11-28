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

## 0.22.0 — 27 Nov 2026 · zaprta alfa · ten folk parallax backgrounds for review, measured on phones; the phone's tip behind a ? button; a clearer hero picker; phone review fixes; gold from chests, remedies

Branch `review/folk-backgrounds`: PRs #40, #41, #43, #44 and #45 (Codex's four later parallax studies and their runtime
packs) and #42 (0.21.0, below) in one pull request for the Game Director to confirm. Those six PRs are closed in
favour of it.

**Four more folk backgrounds as variant B (preview only)**
- **Piranske soline, Predjamski grad, Ljubljansko barje and Ljubljanski grad** get Codex's folk packs as variant B
  (`?ozadje=B` or *Kakovost slik → Visoka*), like the six regions of 0.19.0. Their tests stay off (`live: false`):
  nobody is assigned a variant, everyone else sees A. All ten regions now have one. About +3.4 MB of WebP in the build.
- **Speeds reviewed (PROPOSED, for the Game Director):** nothing in front of a layer moves slower than it, and things
  that stand on one another move together.
  - Piran: the sea and the salt pans were one picture at 0.50 that slid behind the far shore (0.24) and the house
    (0.32). `tools/art_folk_parallax.py` cuts it along the shore: the sea at 0.20 behind the shore, the pans at 0.50
    in front of it. The house and its shore move together at 0.28; the sun moves with the sky (0.02).
  - Predjama: the Lokva moves with the cliff it falls from (0.38, not 0.42).
  - Barje: the willows and pile dwellings move with their channels (0.46, not 0.38).
  - Ljubljanski grad: the edge trees, behind the lane at its far edge, move with it (1.0, not 1.08).
  - The four packs' clouds drift at −1.2 px/s like the other six (Codex's −0.2 to −0.5 barely moved on a phone).
- **Fix:** on Barje a wedge of dawn sky showed down to the lane where the reed channels repeated (an island with
  tapered ends). Each copy's end now overlaps the next copy's start (`wrap` in the export tool).
- **Fix:** the export tool wrote Windows paths (`docs\art-benchmarks\…`) into four manifests, which broke
  `--check` elsewhere; paths are written with `/` and read either way.

**Measured on phones while the party runs**
- **New `tests/parallax-phone.test.js`:** the ten packs on 360×640, 390×844, 412×915 and 844×390 (a phone on its
  side), with the game itself walking the party at the start, middle and end of each region and every frame read:
  each tiling layer moves by the walked distance × its speed (±1 px rounding); chests, enemies, wells and the signpost
  keep their place on the painted lane; the heroes stay put, run, and keep their feet on the lane, whose top never
  jumps; front layers never cover a foot; no hole behind the layers on the road or in battle; tiles are seamless and
  ground and water bands repeat without a gap; standing still or in battle only the clouds move, at their rate.
- `tests/parallax.test.js` now covers all ten regions and checks that layers standing on one another share a speed.

**The coach tip on a phone is a ? button**
- Game Director, 27 Nov 2026: in a battle on a phone the *Namig* tip no longer covers the sky of the scene. It is a
  round **?** button in the scene's top-left corner. A tap opens the tip as a popover; a tap anywhere outside closes
  it again, and that tap still does what it does there (picks a letter, chooses an enemy). The button toggles it too.
- A new tip (the next one after the first word, and so on) marks the button with a gold dot until it is opened
  (it pulses three times; still under reduced motion).
- The letter grid never moves for it. On a desktop the tip keeps its row under the word bar. *Knjižni molj* has no tips
  and no button, as before.

**Martin Krpan's high-fidelity pack is discarded completely**
- Game Director, 27 Nov 2026: Krpan is pixel art only. On top of 0.21.0 (the pack out of the game), its files leave
  the repository: the pose atlases, the 48 × 48 frames, the sheet and strip, the previews and the asset review.
  `art/manifests/martin-krpan.json` keeps only the mare-lift folk illustration and says where the pack is in Git
  history (`main` at 99c2d99). His painted skill cards are a separate pack and stay.

**Phone review fixes (Game Director, 27 Nov 2026, afternoon)**
- **Whose letters are whose:** a hero's letters in the mesh now take the colour of the hero's **place in the party**,
  not the hero's own colour: **red, green and blue** (a violet fourth for practice battles and old saves of four).
  Erazem and Kralj Matjaž were two reds and Kresnik a pale gold. A **diamond** of the same colour stands under each hero
  in battle, beside the level; the word chips, the proposals' dots, *Junaki in barve*, the skill screen's dots and the
  tutorial figures use it too. The colours stay clear of the mesh's own (the gold hint and šumnik dot, the mint path,
  the teal flood). `SLOT_C` and `ownC` in `src/game.js`.
- **Premor is a game menu:** a tall panel (about 85 % of a phone's height), everything centred, the buttons in one column
  of equal width with *Nadaljuj* first, the sound settings at the foot.
- **No slice floats over the lane:** on seven folk packs the sky and far hills showed between a slice (the forest, the
  lake, the salt pans, the channels, edge trees) and the lane. The export tool grounds those slices (`floor`): the gap
  under their paint is filled with their own floor colour down under the lane's edge. Measured over many scroll
  positions in `tests/parallax.test.js` (from up to 96 % of columns to under 0.5 %).
- **Triglav's floating spruces** are now near trees the party walks past: larger, blurred, their trunks below the frame,
  in front of the party at 1.35; on the road only, never in battle, faded while the party stands at a stop.
- **The locked chest** says one line, *Pred teboj se pojavi zakladna skrinja. Jo znaš odpreti?* (its rules are in its
  *Kako se igra*); Malček's clue stays under it as *Namig: …*. The chest picture was squeezed narrow by the text beside
  it and keeps its square shape now.
- **Skill cards** (*Veščine*) have a full border in the hero's colour around the whole card, dashed while the skill is
  not learned (it was a coloured left edge).
- **The role tags** (*Napadalec*, *Zdravilec* …) show only in the chosen hero's details on *Kdo gre na pot?*, not on the
  cards in the list or in *Dosežki in junaki*.
- **Painted bases and passing trees in every wood (Game Director, evening):** the grounded slices' bases are no
  longer a flat colour but continue each slice's own painting (forest undergrowth, lake water, reeds, tree trunks),
  shaded a little, painted on the finished tile so they wrap the way it repeats. **Peca, Trnovski gozd and Ljubljanski
  grad** get passing trees like Triglav's: Triglav's whole tree clumps, mirrored and graded to each region's light
  (moonlit for Trnovski gozd, sunset for Ljubljanski grad), until Codex paints their own. Export tool options `flip`,
  `tint` and `study`; `tests/parallax.test.js` checks the passing trees in all four regions.
- **Round sun, square castle:** Piranske soline, Predjamski grad and Ljubljansko barje were placed at Codex's preview
  boxes, 1.3 times wider than tall, so the sun, Predjama's castle, the salt worker's house and Barje's pile dwellings
  were stretched. They are 1:1 now, like Trnovski gozd and Ljubljanski grad.
- **Pokloni se** replaces *Pomoli se* on the shrines (*Kdor se tu pokloni …*, *Če se pokloniš …*): a bow before the
  god's idol, shorter and plainer than a prayer. The gods' answers still say *molitev* (OPEN, for the Game Director).
- **For Codex:** `docs/art-workflow/FOLK_PARALLAX_CORRECTIONS_SPEC.md` asks for real bases under seven slices, passing
  trees for three woods, seamless edge trees in Gozd and Grad, and the Ptuj, Peca and Ljubljanica strips repainted at
  their in-game shape. The tool's stand-ins stay until then.
- **New `tests/screens.test.js`** (15 checks): the three letter colours by place and far apart on the colour wheel, the
  diamonds, Premor's column, the skill cards' borders and dots, the chest's line and shape, the remedies (below).
  `tests/parallax.test.js` measures floating slices and the passing trees; the "front layers never cover a foot" rules
  leave passing trees out.

**The Game Director's answers (28 Nov 2026)**
- **Poklon, not molitev:** the gods answer a bow (*»Zagrmelo je. Tvoj poklon je sprejet. …«*); no player-facing
  *molitev* is left on the shrines (*pokloni pred bogovi*).
- **Stribog** shuffled the letter mesh with every blow (gods strike only with their special). He now blows two gusts,
  *Sapica* (0.6× on everyone, the letters stay), between his storms (*Vihar*, 0.75× on everyone and the mesh
  shuffled). The other gods are unchanged.
- **Kolo črk confirmed:** the wheel on phones and the typed crossword on computers, the extra word's weak hit and the
  per-Znanje values.
- **Codex:** the scenes spec has its answers (Ljubljanica along the left bank; the Tromostovje seen from the background
  only; Ljubljanski grad inside the walls, in the courtyard, rewritten as its own scene). New
  `docs/art-workflow/CODEX_ART_BACKLOG.md` lists everything the game still lacks, in order: the three scenes, the
  corrections to seven packs, 24 skill cards (Zeleni Jurij, Peter Klepec, the six gods), five enemy sprites that borrow
  another's (Vešča, Perkmandeljc, Pesjan, Zmajček, Zmajev mladič as the olm), 15 story cards and 60 achievement icons.

**The ending is a victory (Game Director, 27 Nov 2026, evening)**
- *Ljubljana je rešena!* in gold, with confetti in the folk colours. The party stands close up (about 100 px a hero on a
  phone, up to 192 on a computer) and **cheers**: each hero hops in turn over a glow of their colour; a fallen hero gets
  up for it.
- **Tapping a hero** shows the skills they learned, with their stopnja (★), the ones not learned yet, and their **three
  hardest hits** of the journey (damage, skill and word), noted from the battle cards.
- **The longest words** of the journey (letter mesh and crosswords, six at most) replace the list of items.
- At the bottom, centred and one under the other, **Nova pot** (the setup of a new journey, `Enter`) and **Nazaj na
  meni** (`Esc`), like a game's last screen. `Nova pot` used to lead to the start menu.
  `tests/screens.test.js` checks the cheer, the words, a hero's details and the two buttons.

**Dosežki in junaki in three tabs (Game Director, 27 Nov 2026, evening)**
- The page has tabs: **Dosežki** (first), **Junaki** and the new **Nasprotniki**, one shown at a time (← → move between
  them). The way back from a hero's card lands on Junaki.
- **Nasprotniki** uses the same view as Junaki: all eleven enemies in road order, known once beaten on a journey (the
  achievements' counters), *???* before. A chosen enemy shows its sprite (a boss with its crown), its health, how often
  it was beaten, its attacks and the regions where it is met, all from the game's data. `tests/menu.test.js` checks it.

**A crown for the boss (Game Director, 27 Nov 2026, evening)**
- "The word Šef is not fitting": a boss on the road has no caption any more, but a small pixel-art gold crown floats
  over its head, bobbing gently (still with reduced motion). It wears it in battle too, until it falls, and the battle's
  title says *Bitka* like any other. `tests/screens.test.js` checks it.

**Kolo črk: the zagovor on a letter wheel (Game Director, 27 Nov 2026, evening)**
- The zagovor's crossword in the Wordscapes style decided on 24 Nov: a wheel of 7 letters, the grid only shows
  progress, no clues. Drag over the letters and let go (or tap them and the last one again; type and Enter on a
  computer); ⟳ shuffles. The key word of the zagovor (PERUN, KRESNIK, MOKOŠ …) is always on the wheel and in the grid;
  the other words are base forms of everyday words from the same letters.
- **Fewer words on the wheel, harder:** Malček gets the richest of 36 wheels (about 33 words, 30 % of the letters
  shown), Učenjak a middle one (about 18), Knjižni molj the poorest that still fills the grid (about 9, none shown).
  A real word that is not in the grid is an extra word: a weak hit, once. Values PROPOSED.
- Phones open the wheel, computers the typed crossword (PROPOSED); *Nastavitve → Križanka zagovora* switches it on any
  device. The other crosswords stay typed. `src/wheel.js`; `tests/wheel.test.js` (19 checks); the phone and keyword
  tests keep testing the typed crossword.
- **Compact (Game Director, 20:54):** the wheel takes no space for rules. One short row says *Zagovor* and its title,
  with **?** (the wheel's *Kako se igra*, over the puzzle, clock stopped; a gold dot until it has been opened) and **✕**
  (cancel; the power stays). The word bar under the scene is hidden while the wheel is open, and the word being made
  sits between *Razkrij* and the count of words left, in one row over the wheel.

**Mojster veščine (Game Director, 27 Nov 2026, evening)**
- A new silver achievement in *Druščina*: the first time a hero uses a skill at its highest stopnja (3) in a journey
  battle, *Dosežek: Mojster veščine* pops up. Practice battles and test mode do not count, as for every achievement.
  60 achievements now; its icon is listed in `docs/achievement-art-spec.md` for Codex.
- The achievements stay the game's own (in `zg-dosezki`, the same on every platform). Google Play Games and Steam
  achievements can mirror them later (`docs/achievements-design.md`); nothing Android-specific is needed for them.

**Predjamski grad and Ljubljanica (Game Director, 27 Nov 2026, evening)**
- **Predjama's cliff is part of a mountain:** the castle's cliff no longer stands alone on a meadow. A forested karst
  mountain moves and repeats with it: its summit always lies behind the cliff, its slopes run off both ways to a
  valley, and behind them far mountains in the evening haze and the karst ridge. Stand-in made by the export tool from
  Peca's mountain (cropped at its summit and mirrored there, warmed) and Triglav's foothills (hazed), until Codex
  paints Predjama's own. Export tool options `cols`, `haze` and `span`.
- **Ljubljanica has one castle and a bridge with two ends:** the town strip (houses, the Franciscan church, the castle
  on its hill) was joined to its mirror image, so the castle stood twice side by side; it now tiles wall to wall as
  Codex painted it. The bridge was mirrored into an arcade without end and shown 1.86 × too wide: it now stands alone at
  its painted proportions every three view widths, its ends on a stone quay taken from Codex's clean plate, the river in
  front of its piers. Stand-ins until Codex's new Ljubljanica.
- **For Codex:** `docs/art-workflow/FOLK_PARALLAX_SCENES_SPEC.md` recomposes three scenes: Ljubljanica along one river
  bank with the castle as the slowest layer and the Tromostovje once, at the last stop before Povodni mož; Ljubljanski
  grad at the castle's walls instead of a view of the castle; Predjama's own karst mountain. Three open questions for
  the Game Director at its end.
- `tests/parallax.test.js`: Predjama's mountain repeats with the cliff, its summit always behind it and mountain in every
  column; Ljubljanica's one castle per stretch and a bridge standing alone on the quay. `ZG_REGIONS=predjama,…` measures
  only some regions.

**The pedlar, gold and remedies (Game Director, 27 Nov 2026, evening)**
- **The pedlar shows four things at most, each sold once:** one remedy, two potions or poisons and one relic the party
  does not have (it showed six, and potions could be bought again and again). A bought thing says *prodano*.
- **Gold comes from chests:** a whole chest pays 35–50 gold (was 15–25), a chest opened a little up to 40 by its share.
  A won battle pays 1 gold an enemy and 5 a boss (it was 4 + a share of the enemy's XP, about 7–25 a fight: battles
  brought some 500–650 gold a journey, chests about 120). Rock slides pay none (3 a rock). `BATTLE_GOLD`, `BOSS_GOLD`
  in `src/journey.js`, `CHEST_GOLD` in `src/game.js`. Gold reads *1 zlatnik, 2 zlatnika, 3 zlatniki, 5 zlatnikov*.
- **Remedies (new, `kind: "heal"` in `data/world.json`):** *Zeliščni čaj* (15, gives back 40 % health) and *Arnikino
  mazilo* (30, all of it). In *Torba* the player picks a remedy and then the hero, any time outside a battle; only
  heroes who are hurt and standing can be picked, the road's health cards update at once. In a battle the button says
  *po bitki*. The pedlar always has one and chests can hold one. Names, prices and amounts PROPOSED.
- `tests/journey.test.js`: the pedlar's four things and *prodano*, a battle's small gold, a chest's 35 or more.

**Kdo gre na pot? and the hero's card (Game Director, 27 Nov 2026)**
- **The hero picker** has no lead text any more. The chosen hero comes first, above the list, in one row on every
  screen: the sprite takes 40 %, the details 60 %. On a 360 px phone the sprite shrinks a little to fit its column
  instead of being cut.
- **The details:** the name; the hero's **role** with its icon and the health with a heart; who they are (*silak z
  Vrha*); **Napadi** as chips, with no arrows between them; **Posebni učinek** (*Posebni učinki* when there are
  more), which replaces *Največji napad*, in a few plain words with an icon each (*nasprotnik krvavi*, *zdravi
  družino*, *izmik in protinapad* …); and the hero's words as chips, *Njene besede* for the heroines.
- **Roles (PROPOSED, for the Game Director):** *Napadalec*, *Branilec*, *Zdravilec*, *Podpornik* and *Oviralec*, with
  the feminine forms for Lepa Vida, Ajdovska deklica and Mokoš. They come from the combat roles in the character
  specifications and what each kit does today: Krpan, Erazem, Klepec, Kresnik, Perun, Veles and Stribog *napad*;
  Ajda and Svarog *obramba*; Zeleni Jurij and Mokoš *zdravje*; Kralj Matjaž and Dažbog *podpora*; Kurent and Vida
  *ovira*. The role shows only in the chosen hero's details: the cards in the list and in *Dosežki in junaki* show
  just the sprite and the name (their old short description, e.g. *težek udar*, is gone). Data: `ROLES` and
  `PLAYSTYLE` in `src/game.js`.
- **New pixel icons** (`src/effects.js`, drawn like the attack and defence icons): a heart, healing, bleeding, poison,
  fire, an hourglass, an open padlock, a spark, a dodge, a stone, a hit on all, and the role icons (a sword, a shield,
  a banner).
- A hero tapped low in the list scrolls the details back into view at the top.
- **The hero's card** (after a battle, on meeting a hero, in *Dosežki in junaki*): the name was pushed up over the
  painting on phones, because the card had a fixed height and its plate overflowed. The front now sizes to the
  painting and its plate, and shows **only the name and the skills**, the name on the plate under the painting. Who
  the hero is (*vitez iz Predjame · meč, češnje, izmik*) moved to the **back** of the card, above the story.
- **New `tests/picker.test.js`** (24 checks): no lead text, the hero above the list, 40/60 in one row on a desktop
  and at 360 and 412 px with the sprite whole, chips without arrows, effects with icons, the roles and their feminine
  forms, no role on the list's cards, and the card's name on its plate under the painting at all three widths.

## 0.21.0 — 26 Nov 2026 · zaprta alfa · Kakovost slik is about the backgrounds only

Branch `art/krpan-pixel-sprite` (PR #42). Decided by the Game Director on 25 Nov (heroes and enemies use simple pixel
sprites) and 26 Nov (*Visoka* shows only the difference in the backgrounds; the painted skill cards become the default
everywhere, with an empty board and ??? where a card is missing).

**Martin Krpan is pixel art again**
- **Martin Krpan in *Kakovost slik → Visoka*** draws the pixel sprite every other quality already showed (the one in
  `SPRITES`), with the early-handheld lunge for his attacks. Codex's 48 × 48 sheet (idle, the skill sequences,
  running, victory, the kneel) is no longer in the game.
- **His skills are unchanged:** Lipov kij, Kmečka moč (ranks 1–3) and Mesarica keep their damage, targets, bleed and
  ranks (`src/progression.js`).
- **Removed:** the hero-sheet path (`data/hero-art.json`, its part of `build.py`, `spriteEl` / `attackAnim` frames,
  the victory salute, `.spr.hi` in `game.css`) and its two offline tools (`tools/art_hero_pack.py`,
  `tools/art_krpan_salt_throw.py`). Codex's Krpan pack stays in `art/` as archived source art; it is not built in.
  The single-file build is about 30 KB smaller.

**The painted skill cards are the default**
- **In battle a hero's skill shows Codex's painted card in every quality** (*Samodejno*, *Visoka*, *Nizka*). The A/B
  test against the hand-made SVG boards is over: `cardTest` left `data/backgrounds.json`, `?karte=` is gone and the
  tester statistics no longer carry `karte=`.
- **A skill without a painting yet shows an empty board with ???** under its usual caption (name, word, value). Today
  that is Perun, Svarog, Veles, Mokoš, Dažbog, Stribog, Zeleni Jurij and Peter Klepec; Krpan, Kurent, Kresnik, Kralj
  Matjaž, Erazem, Lepa Vida and Ajdovska deklica have all three paintings.
- **The hero screen's *Karte veščin* is on every hero now.** A hero without paintings shows three ??? boards
  (*Veščina 1 · karta še nastaja*); collecting works as in 0.19.0 for the painted ones.
- **Enemies keep their hand-made boards**, gods fought at a shrine included.
- *Liki in karte* plays each hero's skills as the party shows them and lists the painting or ??? under each hero.
- *Nastavitve → Razvoj → Kakovost slik* now says it changes only the backgrounds.

**Tests**
- `tests/backgrounds.test.js`: Krpan draws the same pixel sprite in all three qualities and lunges for every skill.
- `tests/achievements.test.js`: the painting by default and with *Nizka* and *Visoka*; ??? boards for Zeleni Jurij in
  battle cards, on his hero screen and in the gallery; Mora keeps her SVG board; no `karte=` in the statistics. The
  test word now goes through a hero's letters, and the quality check runs in the gallery, which fixes two checks that
  failed now and then when a word hit no hero or the first battle had already ended.

## 0.20.0 — 25 Nov 2026 · zaprta alfa · A party of three, two shrines, three enemies on screen

Branch `feat/party-three-gods-queue` (PR #39). Prepared on 24 Nov as 0.18.0; it merged after 0.19.0 (PR #38), so it
is released as 0.20.0 and there is no 0.18.0. Decided by the Game Director on 24 Nov. Details: `docs/progression-design.md`
§2 and §2a, `docs/combat-system.md` §3. Not balance-tested beyond a short simulator run (below).

- **A party of three at most** (four before). A journey still meets three heroes, so the third meeting asks whom to
  leave. A save with four heroes still loads and keeps them until one leaves.
- **Two shrines a journey** (three before), at random and never in the last region. **Each can be prayed at**, so
  two gifts can stack (one prayer a journey before).
- **The god wants a fair fight.** The party no longer rests before the god comes: the god heals every hero to full,
  the fallen too, and skill points can be spent (*Veščine*) before the battle.
- **Winning:** the god heals everyone again, gives 250 XP and is unlocked; the gift stays **to the end of this
  journey only** (it no longer carries into the next journey; a stored one is forgotten).
- **Losing never ends the journey,** on any Znanje, and uses no second chance: the god leaves, every hero is as
  healthy as they came, and the gift goes out once the next region is behind the party.
- **At most three enemies on screen.** More can wait in line; one steps into a fallen enemy's place after 2.5 s, or
  at once when the last one on screen falls. The Lintvern's enraged wyverns wait in line instead of making five.
- Docs: the wheel-križanka decisions (§11.4) and the bosses' health bars and timed wheel events (§12), not built yet.
- **With 0.19.0:** the achievements already count a full party as three (*Družina ostane skupaj*, the secrets), and
  *Brez božjega daru* counts a gift used from either shrine.

## 0.19.0 — 25 Nov 2026 · zaprta alfa · Folk skill cards, achievements and folk parallax backgrounds

PR #38 (branch `codex/folk-skill-cards`, with `Folk-art-BGs`). It merged before PR #39 (a party of three), which was
prepared as 0.18.0 and came out as 0.20.0. Codex's art only: nothing in this release is drawn by Claude; the PNG masters are unchanged
and the game uses resized WebP copies. Decisions of 25 Nov by the Game Director.

- **Codex's painted skill cards in battle**, as an **A/B test like the backgrounds**: half the testers see the
  paintings on the battle cards (B), half the hand-made boards (A). *Kakovost slik → Visoka* always shows the
  paintings, *Nizka* the boards; `?karte=B` previews them. 21 cards for Krpan, Kurent, Kresnik, Kralj Matjaž, Erazem,
  Lepa Vida and Ajdovska deklica (one 768×512 WebP each, `tools/art_skill_cards.py`).
- **Skill cards are collected**: the first time a skill fires in a real journey battle (not practice, not test mode),
  its card joins the collection and a short toast says *Nova karta: Lipov kij (Martin Krpan)*. On the hero screen
  *Karte veščin* turns to the three cards (painted when collected, ??? otherwise); a tapped card opens full screen.
- **Achievements** (Codex's catalogue, updated for the party of three): 59 in six groups (*Besede, Pošasti, Pot,
  Druščina, Zgodbe, Skrivnost*), bronze, silver and gold, with progress bars (*Povodni mož: 4/10*) and two secrets.
  They count only real journeys, survive new journeys (*Ponastavi dosežke* clears them) and unlock with a short toast,
  never a dialog during a puzzle. Data in `data/achievements.json` (typed rules, for Godot later); icons are a
  placeholder roundel until Codex's pack exists.
- **Story cards**: a hero alive in the party when Lintvern falls earns their story card (15, one per hero, hidden
  while the hero is unknown). The pictures are still to be painted.
- **Folk parallax backgrounds for six regions** (Ptuj, Peca, Triglav, Bled, Trnovski gozd, Ljubljanica) from Codex's
  studies, as variant **B** of each region's background test (not live: preview with `?ozadje=B` or *Visoka*). On Ptuj
  the folk pack is B and the sunset pack moves to **E**. The speeds follow Codex's ratios against the walking lane
  (1.0), measured in a test; layers drawn over the lane move at least as fast as it (oak and spruces 1.1, flowers 1.15,
  near rocks 1.25), the Ljubljanica bridge at least as fast as its river. Layers that are not seamless tile as Codex's
  art joined to its mirror image. The lane follows the actors' feet in battle and never sinks below its painted place.
- **Piranske soline and Predjamski grad** use Codex's redrawn pixel backgrounds; Ljubljansko barje, Trnovski gozd,
  Ljubljanica and Ljubljanski grad have their own pixel backgrounds (`Folk-art-BGs`).
- **Build size:** `dist/index.html` 11.5 MB (4.4 MB in 0.17.0): +3.8 MB of background layers and +1.4 MB of cards
  as WebP, ×4/3 as base64.

## 0.17.0 — 20 Nov 2026 · zaprta alfa · Balance E: own levels, a harder road

Branch `feat/balance-e`. Decided by the Game Director on 20 Nov (the game was too easy: XP got out of hand and the
party went up a level nearly every battle); numbers from simulations of the built game. Details and tables:
`docs/progression-design.md` §4c.

- **Every hero levels on their own again, and more slowly.** A beaten enemy gives each hero standing their own attacks
  + damage on it + its level. Levels at 70 / 180 / 360 / 640 / 1000 / 1500 / 2200 / 3100 XP, **one point of their own**
  a level (balance D: one party level, three shared points). A hero who joins arrives at the level of the party's
  lowest hero, with the points of those levels. The battle log and result say what each hero got.
  **Healing and shields count as XP** (Game Director): one XP per point a hero heals (raising the fallen too), per
  point of shield they give, and per point of a blow Kralj Matjaž's shield or Ajdovska deklica's Varstvo takes off.
- **Skill points are spent only at a well and at the signpost at a region's end**, and only there are the skills shown:
  no Veščine after a battle, at shrines or at the pedlar, no Veščine button on the hero screens during a journey (the
  codex keeps it), and a hero with a point glows only at a well or a signpost.
- **Three battles in every region** from Peca to Ljubljanica (Ptuj keeps four), and **one event per region: a chest or
  a trap, never both** (a chest 60 / 45 / 30 % of the time by Znanje, else a rock slide or spikes; Ptuj's is a chest).
- **Enemies:** softer at Peca, Triglav and Trnovski gozd, steeper from Bled to the castle (health ×3.65 and attack
  ×2.0 at the end; D: ×3.0 and ×1.8). The Lintvern is the toughest enemy on every Znanje: 289 / 320 / 480 health by Znanje (D: 170 / 250 / 313).
- **Povodni mož and his vile** (Game Director): 260 health, hits 16 (221 / 260 / 390 by Znanje), less than the
  Lintvern. The vile beside him hit at ×0.75 and every third move one heals him for 8 % of his health (*Zdravilni
  val*), so they should fall first, as the Lintvern's wyverns should.
- **Skill texts, short** (Game Director, from the phone): stopnja 1 says what a skill does, stopnji 2 and 3 only what
  changes; time in words (*2 sekundi*, *5 sekund*); the dots are explained once; Kurent's texts rewritten (no dance,
  no "naslednji udarec").
- **Skill wording** (Game Director): the enemy is *nasprotnik* in its proper forms (no *cilj*, no *sovražnik* in
  skills), damage *za 4 točke*, delays *kasneje*. Stopnja 1 of every reviewed skill opens with a short line from the
  hero's legend (Pregon zime: *Kurentov ples privabi ostale kurente …*); stopnji 2 and 3 only change the numbers.
- **The god comes at the end of the region** (Game Director): after a prayer the god arrives before that region's
  signpost (the party rests first), not after the dragon. The shrines stand near the start of their regions, right
  after the first battle. Losing is losing a battle (Malček withdraws to the signpost; Učenjak and Knjižni molj end
  the journey); winning unlocks the god and the gift stays for this journey and the next. The god's lines no longer
  mention the castle. The balance bot now fights the god too.
- **Nasprotnik everywhere** (Game Director): the whole game calls the foe *nasprotnik*; the marker over the chosen
  foe reads *▼ izbran*. Only Peter Klepec's legend keeps *sovražniki* (the invaders he held off).
- **New: effect icons** (`src/effects.js`): crossed swords for attack, a shield for defence, green with an arrow up
  for stronger, red with an arrow down for weaker; the arrow is as big as the shield. In skill texts and battle cards, and above the heads of heroes and
  enemies for as long as the effect lasts.
  Knjižni molj: enemy health ×1.5 (D: ×1.25), up to +35 % health and 18 % quicker attacks by the castle (D: +15 / 10 %).
- **Measured** (the bot below, journeys won): Malček **55 %** at a word every 10 s (D: 98 %), Učenjak 49 % at 8 s
  (D: 95 %), Knjižni molj 36 % at 6 s (D: 96 %). In boss battles the bot strikes the helpers first.
- **New: `tools/sim/`**, a balance simulator. A bot plays whole journeys inside `dist/index.html` (headless Chrome)
  on the game's own clock, so every rule runs as built; only the player is a model (pace, word lengths, crosswords,
  chests and traps by chance). `node tools/sim/run.js tools/sim/plan.json`; results go to `tools/sim/out/` (ignored).
- Tester statistics: `raven=` and `tocke=` are now hero by hero (`raven=4/3/3`).
- Saves from 0.13.0–0.16.0 load: every hero keeps their level and the pooled points are shared out; chests and traps
  are planned when the save loads.
- **Art scope (Game Director, 20 Nov):** only the backgrounds are being enriched; the character designs stay as they
  are (`docs/concept-summary.md`, `docs/art-benchmarks/ART_PRODUCTION_BENCHMARK.md` §4).

## 0.16.0 — 20 Nov 2026

Branch `fix/post-34-integration`: the work Codex added at the end of #34, connected and checked.

- **The Ptuj road** (*Visoka*, summer and winter): the original cobbles at half size, on a thinner strip.
  - Stones are about 38 % of their old size (scale 0.5, as chosen on 19 Nov). Codex's redrawn `road-cobbles` were
    rejected on 20 Nov and are removed, with their generator and brief.
  - The road's top follows the characters, on every screen: on the road it reaches up to the heroes' necks, so their
    heads show against the water (about a third less road than before); in battle it starts just above the enemies'
    feet (they stand higher than the heroes), a little lower than before.
  - `tools/art_road_stack.py` makes the taller copy the small road needs from the original tile: more of its own
    cobble rows, joined along the mortar so no straight seam shows, still seamless sideways. Nothing is redrawn.
  - The WebP copies follow (`tools/art_bg_webp.py` now skips `previewOnly` layers and removes WebPs nothing draws).
- **Martin Krpan, Kmečka moč rank 2** (*Visoka*): Krpan throws the salt bags alone, without the mare (Game Director,
  20 Nov). The kneel when he is down is a little smaller than before (crouched).
  - **Fix:** both sat 1 px above the ground line every other frame stands on (an off-by-one in
    `tools/art_krpan_salt_throw.py`). Moved down 1 px; the art is otherwise unchanged.
  - **Fix:** the full-pack previews (`martin-krpan-sprite-preview.png`, `animation-preview.html`) still showed the
    mare; the manifest now points to them again, and the rank-2 previews stay as extra review files.
- **Fix:** `tools/art_hero_pack.py` compared pictures by their alpha channel only (Pillow's `getbbox` on RGBA), so a
  sheet whose colours changed could pass `--check`. It now compares every pixel.
- **Fix:** `dist/index.html` on `main` was built before Codex's last commits, so the game showed neither change.

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
- **Readable labels in the scene (19 Nov, Game Director):** the HP numbers, rank tags and enemy names under the
  heroes and enemies have a 1 px dark outline. On snow (winter Ptuj and the picture already in the game) the grey
  numbers were almost invisible. Only labels on the scene change; the same numbers on dark panels stay as they were.
- **The Ptuj layers ship as WebP (19 Nov, Game Director):** the single-file build is **4.0 MB, down from 18.5 MB**.
  `tools/art_bg_webp.py` writes a quality-90 WebP of every layer into `webp/` next to its PNG export (11.5 MB of
  PNG becomes 0.9 MB for both seasons). Alpha stays exact, the road tile still joins without a seam, and side by
  side on a phone the scenes look the same. The PNG exports stay as the lossless masters for a PC build.
  - A pack opts in with `"webp": {"quality": 90}` in `data/backgrounds.json`. Each `webp/index.json` records which
    PNG a WebP was made from; when a PNG changes, `build.py` embeds that PNG instead and says to rerun the tool
    (`--check` lists stale ones). `build.py` still needs only the Python standard library.

- **Martin Krpan follows *Kakovost slik* too** (Codex pack `codex/martin-krpan-sprite-assets`, merged into this branch).
  - *Visoka* draws his Codex sprites; *Samodejno* and *Nizka* keep the sprite already in the game.
  - Every state has its own row in one 192 × 432 sheet (`martin-krpan-sheet.png/.json`, embedded by `build.py`):
    idle, Lipov kij, Kmečka moč R1 / R2 / R3, Mesarica, and the approved running, victory and downed poses.
  - **Running** loops while the party walks the road. **Victory** (a raised bare fist) plays once when the last
    enemy falls, before *Zmaga!*. **Downed** holds the kneel, greyed like every fallen hero, in battle, on the road
    and on his hero screen. Reduced motion shows each state's first frame.
  - **Fix:** the first export of running, victory and downed fitted every frame to 44 px on its own. Krpan grew
    by about a quarter when he ran or cheered, the run lost its bob, and the kneel stood taller than idle. They are
    re-exported from the same atlases at the pack's scale. The poses are unchanged.
- **Hero sprites are data, ready for the rest of the roster:** `data/hero-art.json` names each hero's pack and
  which sequence the game plays for idle, running, victory, down and each skill rank. `tools/art_hero_pack.py`
  exports frames from the source atlases, packs the sheet, writes the review previews and validates a pack
  (`--check`). It replaces `tools/art_krpan_sheet.py` and Codex's two Krpan exporters (`.ps1` and `.py`). The
  convention for the next heroes is `docs/art-benchmarks/hero-sprites/README.md`; for the next regions,
  `docs/art-benchmarks/region-backgrounds/README.md`.
- **Removed as redundant** (17.5 MB): byte-identical copies (`previews/…/ptuj/assembled.*` = `sunset-assembled.*`;
  the mare-lift export = its source), the PNG twins of the JPG previews, two old previews in
  `art/source/environments/ptuj/`, the three Krpan-only tools and `docs/collaboration/GITHUB_WRITE_PERMISSION_TEST.md`.
- **Krpan's skills are now the reviewed ones** (a reviewed hero, like Kurent or Kresnik; `src/progression.js`),
  replacing Zamah, Kobilica and Lipov kij:
  - **Lipov kij** 10 / 16 / 20.
  - **Kmečka moč** (Game Director, 18 Nov): rank 1 two punches of 8, rank 2 the sacks for 20 at one enemy, rank 3 the
    boulder for 22 split between up to two enemies.
  - **Mesarica** 10 / 14 / 20 and a bleed of 2 a second for 2 / 3 / 4 s, as in the specification. A bleed and a burn
    share the enemy's one damage-over-time slot.
  - Balance impact is untested: Krpan is the main starting hero and his old attacks (7 / 18 / 38, the last one
    stunning) are gone.

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
