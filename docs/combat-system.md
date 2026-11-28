# Combat System Rules

> **Status:** Core action/status distinction and interruption rules CONFIRMED. Detailed presentation, timing and stacking behaviour remain OPEN where noted.

This document records shared combat principles that apply to heroes and enemies. Character-specific skills may add further rules, but should not silently redefine these foundations.

## 1. Actions and statuses

**Actions** and **statuses** are separate concepts.

- **Actions** describe something a combatant is actively doing on screen, such as attacking, casting, dancing, charging or performing another ability.
- **Statuses** describe a condition or effect currently applied to a combatant, such as being poisoned, burning, frozen, stunned, weakened or otherwise affected.
- Actions and statuses can be instantaneous or lasting. A lasting action occupies the combatant for its duration; a lasting status remains active for its defined duration or until its removal condition is met.
- An action or status may have a dedicated screen effect, animation and/or icon. These visual indicators should make the current state and its gameplay meaning legible to the player.

**Important:** Do not automatically treat words such as *stunned*, *frozen* or *interrupted* as interchangeable. Define whether each is an action interruption, a status, or a visual/gameplay effect in the relevant mechanic.

### 1.1 Action commitment example — Kurent's Bells

While Kurent performs his Bells dance, he is unavailable to the letter mesh and cannot contribute letters to word puzzles. He can still take damage, but incoming damage does not interrupt the dance; he completes its full duration. This is a lasting action commitment, not a stun or damage immunity.

## 2. Timed attacks and interruption

Heroes and enemies use timed attacks. If a hero's and an enemy's attacks clash at the same time, they can interrupt one another.

**Interruption does not cancel the attack.** The interrupted attack still goes through, but its damage is reduced:

| Combatant whose attack is interrupted | Damage dealt |
|---|---:|
| Normal hero or enemy | 50% (0.5×) |
| Boss or mini-boss | 75% (0.75×) |

The same interruption rule applies to both sides: hero attacks can be interrupted by enemies, and enemy attacks can be interrupted by heroes.

**Damage-over-time effects are not reduced by interruption.** Existing poison and burn effects continue unaffected.

## 3. Enemies on screen — at most three (Game Director, 24 Nov 2026)

**Status:** CONFIRMED and IMPLEMENTED (v0.20.0, prepared as v0.18.0, `FOE_SLOTS` and `stepIn` in `src/game.js`).

- A battle can bring more enemies than fit, but **at most three stand on screen** at a time. The rest wait in line (`B.queue`).
- When an enemy on screen is beaten, the next in line **steps into its place after 2.5 s** of game time (the clock stops while the game is paused or a crossword is open, as for every enemy).
- When the **last enemy on screen** is beaten and someone still waits, the next steps in **at once**, so the field is never empty.
- The battle is won only when nobody stands and nobody waits.
- The Lintvern's wyverns that he calls when he enrages join the line and fly in where there is room. Ordinary battles still have one to three enemies; whether some get more waiting is a balance question for the simulator.

## 3a. Bosses' health bars and events (Game Director, 24 and 28 Nov 2026)

**Status:** CONFIRMED and IMPLEMENTED (v0.23.0, `src/bosses.js`); the details marked PROPOSED in
`docs/progression-design.md` §12 are built that way and wait for confirmation.

- The gods as challengers and Povodni mož have **two health bars**, the Lintvern **three**. The bar drains as one bar,
  from the right.
- Damage on the letter mesh stops at the **middle of a bar**. There a **timed event** opens on the letter wheel (Kolo
  črk, a minute): its words take the rest of that bar, and the last event lands the last blow.
- While an event lasts, only its words hurt the boss, the boss **strikes every hero every 15 s** (Mirni način: after
  every third word sent) and every other enemy, burn and timer of the mesh waits.
- If the minute runs out, the rest of that bar goes back to the mesh. An event never opens over another crossword: it
  waits for the zagovor to close.
- A boss's second phase (the Lintvern's) starts after an event, never inside it.

## 4. Screen communication and special effects

Enemies may have unique actions, statuses and special effects. Their current states should be communicated clearly on screen, using appropriate combinations of:

- Dedicated status or action icons.
- Distinctive animations and visual effects.
- Clear duration or progress feedback where useful.
- Consistent visual language so the player can recognise the effect and understand its gameplay significance.

The exact icon set, animation conventions, stacking rules, duration display and UI placement are **OPEN** and should be developed as the combat roster and enemy behaviours are reviewed.

## 5. Implementation guidance

- Keep the underlying action state distinct from applied status effects.
- Make duration, interruption behaviour and damage modifiers explicit for each mechanic.
- Do not assume that every action is interruptible; define exceptions such as Kurent's Bells.
- Do not let interruption retroactively remove damage-over-time effects already applied.
- Character- and enemy-specific documentation should reference these shared rules and record only their exceptions or additional behaviours.
