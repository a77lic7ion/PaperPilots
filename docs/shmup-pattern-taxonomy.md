# Shmup / Danmaku Pattern Taxonomy — Design Vocabulary

The game is a vertical-scrolling **shmup** (shoot-'em-up); the dense-pattern subgenre is **danmaku** ("bullet curtain", Japanese). Reference titles: 1942 (Capcom), Raiden (Seibu Kaihatsu). This file is the shared vocabulary for all enemy/boss fire design. Vaughan's standing directive: bullets must HUNT the player — no untargeted screen litter.

## The anchor rule

Every small-enemy pattern is anchored to `atan2(player.y − sy, player.x − sx)`. Rings, spirals, and walls are **boss-only**. This is what makes Raiden/1942 fire feel aimed instead of floating.

## Pattern catalogue

| #   | Pattern            | Description                                                 | Assigned to                                                  |
| --- | ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | Aimed shot         | Single bullet at player's current position                  | scout (early rounds)                                         |
| 2   | Aimed n-way fan    | 3/5/7 bullets in a spread centred on player                 | scout 1–3, interceptor 3+, bomber 5+, reaper 7+, shielder 3+ |
| 3   | Aimed burst stream | Rapid string, each shot re-aimed (Raiden turret)            | gunner (3+ shots, 90 ms gap)                                 |
| 4   | Ring               | Even radial burst, all directions                           | BOSS ONLY (ring)                                             |
| 5   | Rotating spiral    | Ring arms with rotating phase offset                        | BOSS ONLY (spiral)                                           |
| 6   | Wall with gap      | Bullet sheet with one safe lane                             | BOSS ONLY (wallSweep)                                        |
| 7   | Sweeping fan       | Fan whose centre angle sweeps over time                     | reserved (family library)                                    |
| 8   | Crossfire / pincer | Two converging flank shots around the aimed line            | shielder flanks (±0.55 rad)                                  |
| 9   | Homing             | Steers toward player, limited life (70 frames, max 5.2 spd) | reaper core shot                                             |
| 10  | Splitting flower   | Bullet blooms into 3 children at age 30                     | family library / boss options                                |
| 11  | Aimed spray        | Aimed cone with random jitter                               | family library (sporeSwarm etc.)                             |

Non-shooters: **kamikaze** (pure ram, no bullets), **dasher** (lunge, no bullets).

## Round scaling (Node-verified, in design-contract.md)

`volleyScale(round)` — r1: +0 bullets, ×1.00 speed → r10: +3 bullets, ×1.54 speed, ×0.55 delay (delay term reserved).
Formation size: `min(3 + ⌊intensity×3⌋ + ⌊(r−1)/2⌋, 5 + ⌊(r−1)×0.8⌋)` → 5 enemies at r1 → 10 at r10.

## Symmetry directive

Dual-formation batches use **mirrored twin pairs** 60% of the time: identical formation/type/count/speed entering left+right simultaneously (`MIRROR_PAIRS`: swoopLeft/Right, lineLeft/Right, vFormationLeft/Right, stagger 0). Remaining 40% use opposite-edge staggered pairs. Preserve this when adding formations — every new side formation needs a mirror twin registered in `MIRROR_PAIRS`.

## When adding a new enemy or pattern

1. Pick a pattern number from the catalogue; small enemies stay in 1–3, 8, 9.
2. Route through `fireAimedFan` / `fireAimedBurst` helpers — never hand-roll loops that ignore the anchor rule.
3. Scale with `volleyScale(currentRound)`.
4. Node-verify any new scaling term at r1/r5/r10 and record it in design-contract.md.
