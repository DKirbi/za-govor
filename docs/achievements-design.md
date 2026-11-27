# Achievements — catalog and progression proposal

**Status:** **IMPLEMENTED (draft, 25 Nov 2026, v0.19.0, PR #38)** — every entry below is built from `data/achievements.json` by `src/achievements.js` and shown in *Dosežki in junaki*. Building the whole catalogue was the Game Director's choice (25 Nov). The catalogue itself is still Codex's proposal: titles, conditions and tiers can change. Updated on 25 Nov for the **party of three** (24 Nov), **two shrines** with gifts per region, and **withdrawing only on Malček**. Icons and story-card pictures do not exist yet: the page shows a tier-coloured roundel with the group's initial, and a note that the card pictures are still to come.

**How it is built:** each achievement has a typed rule in `data/achievements.json` — `count` (a lifetime counter reaches `min`), `set` (every listed id seen) or `event` (one moment of a journey meeting every condition) — so the Godot game can read the same file. Counters and sets live in the profile `zg-dosezki` in the browser. Only accepted words on the **letter mesh** count as words for now (crossword entries do not).

**Achievement icon art brief:** [achievement-art-spec.md](achievement-art-spec.md) defines a small folk-art emblem for every catalog entry and gives Codex the production instructions. Generate and review the Bronze, Silver and Gold preview before producing the full set.

## Rules for the system

- Keep achievement progress in a player profile that survives starting a new journey. The current prototype stores progress locally in the browser; Godot should keep it in the local save/profile too. Do not make an online account a requirement.
- Count only accepted words and completed encounters in a real journey. Exclude practice battles and developer test mode so a player cannot farm a repeatable encounter.
- A word achievement counts each accepted battle word once when it is sent. Track unique words by base form, and count Slovene letters so Č, Š and Ž each count as one letter.
- Unlock achievements immediately, then show a small toast and an entry in *Dosežki in junaki*. Keep a compact progress bar for long goals. Avoid interrupting a puzzle with a full-screen award dialog.
- Completing a run earns the run and challenge awards even if a later profile migration changes the hero roster. A special character card is permanently collected on that profile and can be earned on a later run if missed.
- The special-card condition follows the existing character briefs: the named character must be alive in the active party when the player defeats Lintvern. Joining or starting with that character alone is not enough.

## Wordsmith achievements

Lifetime totals are cumulative across journey battles. “Word” means an accepted battle word, including inflected forms and repeats; unique totals use the word's base form.

| Achievement | Unlock condition | Tier |
| --- | --- | --- |
| **Prva beseda** | Send your first accepted word in a journey battle. | Bronze |
| **Besedni tok** | Send 100 accepted battle words. | Bronze |
| **Živa zakladnica** | Send 1,000 accepted battle words. | Silver |
| **Slovar na nogah** | Send 10,000 accepted battle words. | Gold |
| **Zbiralec besed** | Use 100 different base words in journey battles. | Bronze |
| **Tisoč obrazov** | Use 1,000 different base words in journey battles. | Gold |
| **Šest črk** | Send 100 words that are exactly six letters long. | Silver |
| **Dolga sapa** | Send 100 words of nine or more letters. | Gold |
| **Č, Š, Ž — slovenski zaklad** | Send 100 accepted words containing at least one of Č, Š or Ž. | Silver |
| **Brez ponavljanja** | In one battle, send 20 different base words. | Silver |
| **Dolga beseda, močan udarec** | Defeat an enemy with a word of nine or more letters. | Bronze |
| **Beseda za boga** | Use a hero's domain word to defeat an enemy. | Bronze |

## Folklore field notes

Track an enemy type whenever it is defeated in a journey battle. Repeated victories count across journeys.

| Achievement | Unlock condition | Tier |
| --- | --- | --- |
| **Prva zmaga** | Win your first journey battle. | Bronze |
| **Poznavalec pošasti** | Defeat at least one of every enemy type: Škrat, Mora, Volkodlak, Vodna vila, Vešča, Perkmandeljc, Pesjan, Zmajev mladič, Povodni mož and Lintvern. | Gold |
| **Volkodlakov strah** | Defeat Volkodlak 10 times. | Silver |
| **Volkodlakova nočna mora** | Defeat Volkodlak 50 times. | Gold |
| **Vrtinec se poleže** | Defeat Povodni mož for the first time. | Silver |
| **Gospod reke** | Defeat Povodni mož 10 times. | Gold |
| **Zmajeva tehtnica** | Defeat Lintvern for the first time. | Gold |
| **Deset zmajev** | Defeat Lintvern 10 times. | Gold |
| **Lovec na velikane** | Defeat a boss without any hero being knocked out during that battle. | Silver |
| **Niti besede zaman** | Defeat Volkodlak without repeating a base word during that battle. | Silver |

The 10-win boss goals deliberately reward replaying whole journeys. They should show clear progress (for example, “Povodni mož: 4/10”) in the achievements page rather than appear as a surprise-only unlock.

## The road and its trials

| Achievement | Unlock condition | Tier |
| --- | --- | --- |
| **Čez prvi prag** | Finish the Ptuj region. | Bronze |
| **Do gradu** | Reach Ljubljanski grad. | Bronze |
| **Slovenija v besedah** | Complete the journey by defeating Lintvern. | Gold |
| **Brez ovinka** | Complete the journey without withdrawing from a battle (withdrawing exists only on *Malček*). | Silver |
| **Družina ostane skupaj** | Defeat Lintvern with a full party, all three heroes alive (party of three, 24 Nov). | Gold |
| **Sam na poti** | Complete the journey with a one-hero party. | Gold |
| **Brez božjega daru** | Complete a journey without a god in the party and without using a shrine's gift (two shrines a journey, a gift per region). | Silver |
| **Knjigoljubov izziv** | Complete a journey on *Knjižni molj*. | Gold |
| **Vse tri mere znanja** | Complete a journey on each *Znanje* setting. | Gold |
| **Šest znamenj** | Win a shrine challenge against each of the six gods. | Gold |
| **Shranjevalec skrivnosti** | Solve 10 chests correctly across journeys. | Silver |
| **Plaz pod nadzorom** | Clear 10 rock slides without taking damage. | Silver |
| **Mreža brez ran** | Win a battle without any hero losing health. | Gold |
| **Vstani in govori** | Revive a fallen hero and win that same battle. | Bronze |

For the “without a god” goal, a shrine encounter is different from a party god's personal challenge: the requirement is no god travelling with the party and no temporary shrine gift used during the run. This makes the challenge legible and testable.

## Meet the whole company

| Achievement | Unlock condition | Tier |
| --- | --- | --- |
| **Nova družba** | Recruit your first new hero on the road. | Bronze |
| **Vsi obrazi Slovenije** | Unlock all nine folk heroes. | Gold |
| **Stara božanstva** | Unlock all six gods. | Gold |
| **Zbrana druščina** | Unlock all 15 playable heroes and gods. | Gold |
| **Vsak ima svojo zgodbo** | Use each of the nine folk heroes in at least one completed journey. | Gold |
| **Bogovi na poti** | Complete a journey with each of the six gods in the party. | Gold |
| **Mojster veščine** | Use a skill at its highest stopnja (3) in a journey battle (Game Director, 27 Nov 2026). | Silver |

## Final-battle story cards

These are the headline achievements. A card is added to the character collection the first time its owner is alive in the active party at the moment Lintvern is defeated. The reward is a unique, specially designed folk-art story card, not a skill card. A missed card remains available on later journeys.

| Achievement / card | Final-battle condition | Art status in the character briefs |
| --- | --- | --- |
| **Krpan premaga Brdavsa** — *Martin Krpan* | Martin Krpan survives in the active party. | Subject and condition confirmed. |
| **Kurentovanje** — *Kurent* | Kurent survives in the active party. | Subject and condition confirmed; cultural reference review remains. |
| **Speči kralj pod Peco** — *Kralj Matjaž* | Kralj Matjaž survives in the active party. | Subject and condition confirmed; card format open. |
| **Kameni zid** — *Ajdovska deklica* | Ajdovska deklica survives in the active party. | Subject and condition documented; artwork not created. |
| **Predjamski grad** — *Erazem Predjamski* | Erazem survives in the active party. | Subject and condition confirmed; artwork deferred. |
| **Kresna noč** — *Kresnik* | Kresnik survives in the active party. | Shared survival condition noted; subject open and folklore variants need review. |
| **Jurjevo** — *Zeleni Jurij* | Zeleni Jurij survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Vilin dar** — *Peter Klepec* | Peter Klepec survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Pesem z obale** — *Lepa Vida* | Lepa Vida survives in the active party. | Proposed reward; subject and artwork need approval; avoid choosing a ballad ending as canonical. |
| **Nevihta nad gorami** — *Perun* | Perun survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Nebeška kovačnica** — *Svarog* | Svarog survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Materina roka** — *Mokoš* | Mokoš survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Sončni voz** — *Dažbog* | Dažbog survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Burja čez morje** — *Stribog* | Stribog survives in the active party. | Proposed reward; subject and artwork need approval. |
| **Korenine sveta** — *Veles* | Veles survives in the active party. | Proposed reward; subject and artwork need approval. |

Some titles above are working titles, not finalized claims about folklore. In particular, proposed cards should be checked against the character briefs before art production. A character's card should stay hidden while that character is still locked.

## The final secret

**Zlatorogova zapuščina** — after collecting all 15 character cards, defeat Lintvern once more on *Knjižni molj* with a full party, all three heroes alive. Award a unique golden Zlatorog card showing the whole company around the mountain chamois. This gives the long collection a final, visible prize and asks players to master the toughest version of the last battle after they have completed the ordinary roster. The card is a game reward, not a claim that the folklore describes this company or ending.

As a separate hidden skill challenge, **Zadnja beseda**: defeat Lintvern on *Knjižni molj* in *realni tempo*, with all three heroes alive, and land the final blow with a nine-letter-or-longer word containing Č, Š or Ž. Award a badge/title rather than another character card, so the all-character card collection remains the biggest art reward.

## Scope and implementation notes

This is a catalog, not the achievement code or a promise that every proposed card has approved folklore art. The first implementation slice could add persistent counters, the progress list and the first word, battle, journey and first-card unlocks. Add the remaining counters when their events can be recorded reliably. Keep platform achievements (Steam/Play Games) as optional mirrors of in-game unlocks; the in-game collection remains the source of truth.

Use the existing brief's rule for story cards: the hero must be alive in the active party at the final win. Do not require a hit or last blow from that hero; the rest of the party is carrying them through the final battle, too.
