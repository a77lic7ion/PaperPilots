# Paper Planes: Origami Elite — Developer Handover

Single-file HTML5 canvas vertical shmup (shoot-'em-up) with danmaku-leaning boss patterns. This package is everything a web developer needs to take ownership.

## Package contents

```
handover/
├── paper_plane_game.html      — the complete game (HTML + CSS + JS, ~4,200 lines)
├── asset-sheet.html           — visual contact sheet of all SVG assets
├── assets/                    — 16 SVG sprites (11 enemies, 5 player ships)
└── docs/
    ├── design-contract.md     — every formula, constant, and tuning value (Node-verified)
    ├── shmup-pattern-taxonomy.md — bullet-pattern vocabulary and design rules
    ├── audit-findings.md      — defect history, dead code, open design decisions
    └── svg-asset-pipeline.md  — CorelDRAW → SVG conventions
```

## Running it

Open `paper_plane_game.html` in a browser. Music files (MP3s, listed in the `musicTracks` array ~line 2370) are loaded by relative path from the same folder — game runs silently without them. No build step, no dependencies beyond Google Fonts.

## Architecture map (all inside the single `<script>` block)

| System                 | Look for                                            | Notes                                                     |
| ---------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Player classes & skins | `CLASSES`, `SKINS`                                  | 5 vessels; skins draw via canvas paths                    |
| Difficulty model       | `bossHP()`, `reflexDifficulty()`, `volleyScale()`   | Two-curve model — see design-contract.md                  |
| Enemy definitions      | `ENEMY_SHAPES`, `ENEMY_STYLES`, `class Enemy`       | 11 types; shapes shared 1:1 with `assets/*.svg`           |
| Fire patterns          | `fireAimedFan()`, `fireAimedBurst()`, `aimAt()`     | ALL small-enemy fire is player-aimed (taxonomy doc)       |
| Formations & spawning  | `FORMATIONS`, `MIRROR_PAIRS`, `generateWaveBatch()` | 60% of dual spawns are synchronized mirrored twins        |
| Boss                   | `class Boss`, `BOSS_ATTACKS`                        | 3 HP phases, 6 movement modes, telegraphs                 |
| Upgrades (in-run)      | `WAVE_UPGRADES`, `applyWaveUpgrade()`               | Rarity-gated Armory after each boss                       |
| Shop (persistent)      | `buyUpgrade()`, `upgrades`                          | Per-class, cost = base × 1.5^level                        |
| Powerups               | `POWERUP_DEFS`, `activatePowerUp()`                 | Note: SYNERGIES badges are display-only (see DD3)         |
| Persistence            | `saveProgress()`, `loadProgress()`                  | localStorage key `pp_save_v3`; mid-run continue supported |
| Viewport               | `fitViewport()`                                     | 9:16 portrait, letterboxed on wide screens                |
| Audio                  | `playMusic()`, `getSfxCtx()`                        | MP3 streaming + WebAudio-synthesized SFX                  |

## Engineering invariants (do not break)

1. Gameplay timing uses `Date.now()` deltas (frame-rate independent). `frameCount` is cosmetic only.
2. Entity caps are load-bearing: enemyBullets ≤ 200, bullets ≤ 100, particles ≤ 150, enemies ≤ 40.
3. Small enemies never fire rings/spirals/walls — those are boss-only. Route new patterns through `fireAimedFan`/`fireAimedBurst`.
4. Event listeners touching `player` must null-guard (player doesn't exist on menus).
5. `continueRun()` rebuilds the player from base stats then reapplies upgrades ONCE — reordering breaks Glass Cannon.
6. Every property you write must have a read site (two shipped features were broken by violating this).
7. Input handlers convert `clientX` through `canvas.getBoundingClientRect()` — required by the letterboxed viewport.

## Adding an enemy (the intended workflow)

1. Add silhouette points to `ENEMY_SHAPES` (nose up, anchor at center, within ±32) and a color to `ENEMY_STYLES`.
2. Add constructor stats + a behavior case using the aimed-pattern helpers, scaled by `volleyScale(currentRound)`.
3. Add spawn weight in `pickEnemyType()`.
4. Regenerate/author the matching `assets/enemy_<type>.svg` (same points — the SVGs are generated from the same tables; keep them in sync).

## Known open items (owner's decisions pending — docs/audit-findings.md DD1–DD4)

- ~500 lines of boss "family" content (`ATTACK_PATTERNS`, `getThreat`, families 2–10) is currently dead — victory triggers at round 10. Wire in or delete.
- Wave-complete upgrade screen path exists but is never called (upgrades are per-boss only).
- Synergy effects are HUD badges without gameplay implementation.
- Difficulty scales INVERSELY with player power (`reflexDifficulty × 1/power`) — deliberate anti-frustration, flagged as a possible balance leak.

## SVG assets

Sprites in `assets/` are visually identical to the in-game canvas rendering (generated from the same coordinate tables). The game currently renders via canvas paths for zero-dependency portability; to switch to sprite rendering, see the loading pattern in docs/svg-asset-pipeline.md (preload via `Image`, `drawImage` centered, keep canvas paths as fallback — hitboxes are code-side and unchanged either way). All SVGs open cleanly in CorelDRAW 2022 for redesign.
