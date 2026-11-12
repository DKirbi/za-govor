# From browser prototype to Windows, macOS, Linux, phones and tablets

Plan as of 11 Nov 2026. Godot builds all five targets from one project, so the work is
not five ports. It is three things: rebuild the prototype as a real Godot game, design
one layout and input scheme that works with mouse, touch and controller, and set up the
accounts, signing and testing each store requires.

## 1. Keep the browser prototype as the test bed
The roadmap's first gate is still "is the Slovene grid fun?", and the prototype answers
that fastest. Host it (GitHub Pages or itch.io) and make it an installable web app (web
manifest + service worker) so testers can add it to phone and tablet home screens and
play offline.

## 2. Turn the rules into shared data
Move heroes, enemies, scoring tables, the clue bank and the dictionary out of
`src/game.js` into JSON files that both the prototype and the Godot project read, so
balancing lives in one place. Build the full Sloleks dictionary offline into a compact
binary DAWG; a full form list would be too big for low-end phones.

## 3. Godot skeleton for every target from day one
- **Godot 4.7.x, GDScript.** C# projects still cannot export to the web in Godot 4;
  GDScript keeps a browser demo possible.
- **Compatibility renderer** (OpenGL / WebGL 2): required for web, safest on old Android,
  enough for 2D pixel art.
- **Structure:** one scene per mode (map, battle, crossword, chest, trap, hero moment),
  plus shared services for game state, dictionary, saves and input.
- **Pixels:** 640×360 base, integer scaling, letterboxing.
- **Tests:** port the checks in `tests/` (generator stress test, scoring) to GUT or GdUnit4.

## 4. One adaptive layout, not five
- Phones in portrait: scene on top, mesh below (the prototype's mobile mode).
- Tablets and desktop in landscape: scene and mesh side by side.
- Respect safe areas (notches, home indicator).
- A pixel font with č, š, ž (and ć, đ).
- Text size: Steam Deck's rule everywhere — the smallest character at least 9 px high at
  1280×800.

## 5. Three kinds of input
- **Keyboard and mouse:** typing with a Slovene keyboard layout; č, š, ž are deliberate letters, c/s/z never stand in for them (players without the layout click tiles).
- **Touch:** drag across tiles and lift to send (no send button in the mesh); crosswords
  and the rock slide use an **in-game Slovene keyboard** (QWERTZ, Č Š Ž as plain keys), not
  the system keyboard. Decided 12 Nov 2026: the system keyboard covers half the screen,
  autocorrects, hides Č Š Ž behind a long press, and is the weakest part of Godot's
  Android export (LineEdit + virtual keyboard). The prototype's phone mode already works
  this way, so the Godot version copies a tested design.
- **Android back button:** pauses, closes a panel, steps back; exits only from the start screen.
- **Controller (Steam Deck):** d-pad over the mesh, buttons for select / undo / send; for
  crosswords open Steam's on-screen keyboard or provide a controller-only letter picker.
  Deck Verified requires a default controller configuration that reaches everything.
- Pause real-time mode whenever the app goes to the background.

## 6. Platform accounts and rules
| Platform | Needs | Watch out for |
| --- | --- | --- |
| Windows | Nothing extra; code signing optional | Unsigned downloads show SmartScreen; Steam installs mostly avoid it |
| macOS | Apple Developer Program (99 USD / year) for Developer ID signing and notarization; one universal build | Since macOS Sequoia the Control-click "Open" bypass for unsigned apps is gone |
| Linux / Steam Deck | x86_64 build | Controller-complete, on-screen keyboard for text, legible text |
| Android phones + tablets | Google Play Console account | New apps must target Android 16 (API 36); new personal accounts need a closed test with 12 testers opted in for 14 continuous days |
| iPhone + iPad | A Mac with Xcode, same Apple membership | TestFlight for testers, then App Review |
| Web demo | itch.io page | GDScript + Compatibility renderer only |

## 6a. Android testing now (12 Nov 2026)
The browser prototype is wrapped with Capacitor 8 (`android/`, target SDK 36, portrait)
and GitHub Actions builds a debug APK on every push. That is the test channel until the
Godot build exists. For testers beyond a sideloaded APK: Google Play internal testing
needs a Play Console account, a release key and an AAB (`./gradlew bundleRelease`).

## 7. Automate builds
Every push builds Windows, Linux, Android and web on Linux runners and macOS / iOS on a
macOS runner, and sends test builds to a Steam beta branch, Google Play internal testing
and TestFlight.

## 8. Release order
1. Steam (Windows, macOS, Linux, Deck) plus a free itch.io web demo.
2. Android.
3. iOS.

Before any store: a privacy policy (required even with no data collection), age-rating
questionnaires, and Sloleks' CC BY-SA attribution in the credits.

## Sources
- [Godot 4.7 release overview](https://app.cinevva.com/news/2026-06-19-godot-4-7-released)
- [Godot web export and C#](https://app.cinevva.com/guides/godot-vs-unity-web-games)
- [Steam Deck compatibility review](https://partner.steamgames.com/doc/steamdeck/compat)
- [Google Play target API level](https://developer.android.com/google/play/requirements/target-sdk)
- [Google Play testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Apple Developer Program enrollment](https://developer.apple.com/support/enrollment)
