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
