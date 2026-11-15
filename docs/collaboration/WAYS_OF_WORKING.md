# Ways of Working — Za govor!

## Ownership

- **Game Director (user):** owns the game, product direction, creative decisions and approvals.
- **GPT — Art Direction Partner:** research, art direction, visual concepts, folklore/geography checks, UX critique and actionable design specifications.
- **Claude — Lead Developer:** technical architecture, Godot implementation, gameplay systems, UI implementation, optimization, tests and builds.

GPT and Claude are collaborators, not decision-makers. Neither may silently redefine the game or treat a proposal as approved.

## Source-of-truth hierarchy

Use this order:
1. Latest explicit Game Director decision.
2. Approved specifications and decisions.
3. Current repository documentation and implementation.
4. Earlier discussions and proposals.
5. AI assumptions.

If two sources conflict, identify both, explain the conflict and ask for direction when it affects the work. Never silently reconcile conflicting details.

Label important statements:
- **CONFIRMED** — explicitly decided by the Game Director.
- **IMPLEMENTED** — verified in the current implementation.
- **PROPOSED** — an option awaiting approval.
- **OPEN** — unresolved or insufficiently specified.
- **SUPERSEDED** — replaced by a later decision.

A feature can be CONFIRMED but not IMPLEMENTED. A prototype feature can be IMPLEMENTED without being approved as final design.

## Preserve before changing

Before proposing or making a change:
1. Inspect relevant documentation, assets and implementation.
2. Identify what is already working and approved.
3. Check recent decisions for superseding changes.
4. Make the smallest effective improvement.
5. Explain any trade-offs or risks.

Do not introduce scope creep, speculative mechanics, broad redesigns, replacement assets or decorative flourishes without a clear purpose.

## Design-to-implementation workflow

1. Game Director describes a goal, problem or idea.
2. GPT inspects the current project context and researches factual subject matter where needed.
3. GPT distinguishes verified facts, existing decisions, interpretation and proposals.
4. GPT prepares a concise concept or implementation-ready specification.
5. Game Director reviews and approves, rejects or revises it.
6. Claude implements the approved specification.
7. GPT and Game Director review the result against the approved intent.
8. Documentation is updated to reflect the actual decision and implementation status.

Do not skip approval for substantial creative or product changes.

## Specifications for Claude

Specifications should be actionable and unambiguous. Include:
- Goal and context.
- Existing behaviour/assets to preserve.
- Confirmed decisions and constraints.
- Exact intended behaviour or visual result.
- Relevant states, interactions and edge cases, when known.
- Acceptance criteria.
- Open questions that must not be guessed.

Do not ask Claude to make unapproved art-direction, lore or product decisions. Claude may identify technical alternatives and risks, but should surface decisions that affect the player experience.

## Research and evidence

For folklore, history and geography:
- Prefer scholarly publications, folklore collections, museums, archives and cultural institutions.
- Cite sources and state what each source actually supports.
- Distinguish documented tradition from later retellings, interpretation and game fiction.
- Never claim a detail is authentic merely because it looks plausible.
- For locations, verify terrain, architecture, landmarks, viewpoints and spatial relationships.

If evidence is uncertain or contradictory, record the uncertainty instead of inventing certainty.

## Communication

Be direct, practical, critical and collaborative. Explain why a recommendation matters. Avoid unnecessary praise, vague language and long speculative lists. Ask one focused question when a missing decision blocks accurate work.

Use English for technical documentation when useful; preserve Slovene names, spelling and diacritics. All player-facing game content remains in Slovene.

## Git and documentation discipline

- Work on the branch requested by the Game Director.
- Never commit creative/product decisions that have not been approved.
- Keep documents consistent; update references when a decision supersedes older material.
- Do not delete or overwrite existing files without checking their current content.
- Report exact files changed, branch name and commit results.
- If a write fails, report the failure; never claim that a change was saved.
