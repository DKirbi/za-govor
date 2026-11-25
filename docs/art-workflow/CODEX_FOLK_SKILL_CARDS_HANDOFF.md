# Codex handoff — folk skill cards

This handoff is for work in the **Codex project workspace** at `D:\ZaGovor\za-govor`. The art and documentation belong to the repository so Codex can review, stage and commit them through Git.

## Current result

- 15 standalone PNG concept images, one per reviewed skill.
- Original files live under `art/source/characters/<character>/folk-art/skills/<skill>/skill-card-concept.png`.
- Skill index pages are under `docs/characters/<character>/folk-art/skills/README.md`.
- The visual specification is [`FOLK_SKILL_CARDS_SPEC.md`](./FOLK_SKILL_CARDS_SPEC.md).
- The inventory and technical metadata are in [`folk-skill-cards.json`](../../art/manifests/folk-skill-cards.json).

## Instructions for Codex

1. Read `AGENTS.md` files in the repository before editing. Treat the character specifications and the art spec as the source of truth for subjects and lore boundaries.
2. Use `docs/images/battle-desktop.png` as the established card-style reference. The target is a small refinement of the current in-game card art, not a new visual direction.
3. Keep each skill illustration in its own image and skill folder. Never make a triptych the deliverable or crop the earlier triptych to manufacture individual cards.
4. Preserve the current concept status in documentation and manifests. The Game Director must approve each image before runtime integration or production status.
5. Do not change skill names, mechanics, character gameplay code, or folklore claims while handling the art pack.
6. Keep edits scoped to this art pack. The workspace may contain unrelated user changes; inspect `git status --short`, stage only the explicitly intended paths, and never include unrelated modifications in the commit.
7. Before committing, verify all 15 manifest paths exist, all documentation links resolve, image dimensions and color/alpha metadata are accurate, and the diff contains only intended art-pack files. Do not add tests or runtime changes for this documentation-only art pack.
8. Use a focused commit message such as `Add folk skill card concept art`. Do not push or open a PR unless the Game Director asks.

## Approval and integration gate

The present files are concept art for visual review. After individual approval, Codex can update each manifest entry to the approved status and prepare game-ready exports in `art/exports/`. Runtime integration should then follow the actual renderer dimensions and approved composition. Do not convert any image to a runtime export or mark it approved before that review.
