# Native achievements on Steam, Google Play and Apple — research (28 Nov 2026)

**Status:** research for the Game Director (asked 28 Nov 2026). Nothing here is decided; recommendations are marked
PROPOSED. Platform order follows `docs/platform-roadmap.md`: Android first, iOS next, Steam parked.

## 1. What each platform offers

| | Google Play Games Services (Android) | Game Center (iOS, iPadOS, macOS) | Steam (Steamworks) |
|---|---|---|---|
| Native? | Yes: achievements live in the Play Games profile, the Play Store and its *You* tab | Yes: the Games app (iOS 26+) and Game Center | Yes: the Steam client, profile and overlay |
| How many | **at least 10** for the Level Up program, **40+ recommended**; up to 400 | **at most 100** per game | no small limit |
| Points | multiple of 5, **≤ 200** each, **≤ 2,000** in all (1 point = 100 XP of the player's Play Games level) | **≤ 100** each, **≤ 1,000** in all; values cannot change once live | none |
| Progress | *incremental* achievements: 2–10,000 steps, stored by Google, never go back | a percentage 0–100 the game reports | a *progress stat* drives a bar and unlocks at its value |
| Hidden | yes (placeholder text and icon until unlocked) | yes (hidden until earned) | yes |
| Icons | one square icon each; Android shows it in a circle in its pop-up | one image each | two: achieved and not yet achieved |
| Review | publish with the game in Play Console | each achievement is **reviewed by Apple** before players see it | publish in the Steamworks admin |
| Its own pop-up | Play Games shows its own unlock pop-up | an optional banner (`show_completion_banner`) | the Steam overlay always shows its own (corner set by the player) |
| Extra | **Quests** (Play Points rewards) need 4+ achievements reachable by everyone within the first hour; the **Level Up** program (from 2026) asks for Play Games Services v2 sign-in and achievements | the Games app shows achievements, compares them with friends and recommends games with Game Center features | global unlock percentages (rarity) per achievement; *Achievement Sets* (beta) |

**Godot 4 (the production engine):** Android — the community plugin *Google Play Games Services for Godot*
(godot-sdk-integrations, MIT): sign-in, unlock, increment, reveal, show achievements. iOS — Godot's official
**GameCenter** iOS plugin: `award_achievement` with a progress of 0–100 and an option to show Apple's banner. Steam —
**GodotSteam** (GDExtension, Godot 4.4+): achievements and stats. All three need real platform builds to test.

## 2. What this means for Za govor!

Our catalogue today: **60 achievements** in `data/achievements.json` (15 of them story cards, two hidden), three tiers,
counters and sets kept in the local profile (`zg-dosezki`), plus the skill cards (three per hero).

- **It fits every platform.** 60 is above Google's 40, below Apple's 100. Apple's 100 is the real ceiling: the
  achievements that come with §13 (more on the harder tiers) and new mini-bosses must fit under it.
- **Skill cards stay ours.** Three per hero would eat Apple's 100. On the platforms, a few counting achievements stand
  for them (*10 cards*, *all cards of one hero*, *every card*), using incremental progress.
- **Points by tier (PROPOSED):** bronasta 10, srebrna 20, zlata 40 on Google (60 achievements ≈ 1,200 of 2,000, room
  for more); bronasta 5, srebrna 15, zlata 30 on Apple (≈ 700 of 1,000). Apple's values can't change once live, so
  they are set once, before launch, with room kept for updates.
- **One catalogue, three mappings (PROPOSED):** `data/achievements.json` stays the source of truth; each entry gets
  the platform ids it maps to. The game unlocks in its own profile first and reports to the platform when it can
  (offline play still counts; Google syncs unlocks made offline). Counters report as incremental steps (Google),
  percentages (Apple) or progress stats (Steam).
- **Our pop-up and theirs:** the game's own toasts (right side, middle) and the card reveal stay, for one look in
  Slovene on every device. Apple's banner can be switched off, so the game shows only its own. Google and Steam show
  their own pop-up too; on those the game could drop its toast for an achievement and keep its card reveal. OPEN —
  decide when the plugins can be tried on a device.
- **Language:** each platform takes the names and descriptions per language; Slovene first, English with the
  localisation.
- **Story cards** are achievements on the platforms too (their icon is the card's art, once painted).
- **First hour:** Google's Quests want four achievements any player gets within an hour. Ours already have *Prva
  beseda*, *Prva zmaga*, *Čez prvi prag* (Ptuj) and *Nova družba* (the first new hero) — four.

## 3. Gamification: what makes achievements work

- **What an achievement is:** an optional challenge from a meta-game, independent of one session, that brings a reward
  (Hamari & Eranti, DiGRA 2011). They work when they point at play that's worth doing anyway.
- **Google's quality bar** (also good design): every achievement reachable; distinct names, texts and icons; points
  in proportion to time or skill; easy, middle and hard ones mixed; progress visible on long goals (*a marathon, not a
  sprint*, at least ten sessions); hidden ones sparingly, for surprise; new ones with new content.
- **For a word game (PROPOSED):** reward the language and the folklore, not grinding. Long words, words with Č/Š/Ž,
  words of a region, a whole crossword without help, meeting every hero and creature, the story cards. Fewer "beat
  X fifty times".
- **Rarity is a reward of its own:** Steam shows the share of players who hold each achievement. The §13 decision
  (harder tiers: rarer-looking skill cards, more achievements) follows the same idea inside the game.
- **Never punish a style of play:** an achievement shouldn't make Mirni način or Malček feel lesser. §13 already says
  Malček fills its own achievements.

## 4. Next steps (for the Game Director)

1. Platform ids and point values in `data/achievements.json` (one field per platform) — when Android work begins.
2. Which achievements stand for the skill-card collection on the platforms.
3. Which achievements are new on Učenjak and Knjižni molj (§13).
4. Achievement icons (Codex, `achievement-art-spec.md`) at the sizes each platform asks for.

## Sources
- Google: [Achievements — Play Games Services](https://developer.android.com/games/pgs/achievements),
  [Quality checklist](https://developer.android.com/games/pgs/quality),
  [Level Up user experience guidelines](https://developer.android.com/games/guidelines),
  [Introducing Google Play Games Level Up (blog, 23 Sep 2025)](https://android-developers.googleblog.com/2025/09/introducing-google-play-games-level-up.html)
- Apple: [Rewarding players with achievements](https://developer.apple.com/documentation/gamekit/rewarding-players-with-achievements),
  [Manage achievements (App Store Connect)](https://developer.apple.com/help/app-store-connect/configure-game-center/manage-achievements),
  [The Apple Games app](https://developer.apple.com/games-app/)
- Steam: [Stats and Achievements](https://partner.steamgames.com/doc/features/achievements),
  [ISteamUserStats](https://partner.steamgames.com/doc/api/ISteamUserStats)
- Godot: [Plugins for iOS (GameCenter)](https://docs.godotengine.org/en/4.5/tutorials/platform/ios/plugins_for_ios.html),
  [Google Play Games Services for Godot](https://godotengine.org/asset-library/asset/2440),
  [GodotSteam: stats and achievements](https://godotsteam.pages.dev/tutorials/stats_achievements)
- Research: Hamari, J. & Eranti, V. (2011), [Framework for Designing and Evaluating Game Achievements](https://dl.digra.org/index.php/dl/article/view/545), DiGRA.
