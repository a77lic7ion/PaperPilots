# Design Contract — Paper Pilots: Origami Elite

Canonical gameplay formulas and constants, transcribed VERBATIM from `paper_plane_game.html` and verified numerically (Node). Any change to a value here must be re-run in Node at branch boundaries + extremes, and this file updated in the same session. Never restate these from memory — read this file.

⚠ This contract was resynced to the live `paper_plane_game.html` (shipped build, 4,427 lines) on 2026-07-08. Several values differ from the 2026-07-07 audit snapshot because the game was rebalanced (bosses ~2× tougher, economy ~half), and a 5th shop upgrade (`collect`) was added. The Godot port's `Balance.gd` snippet still carries the OLD numbers and must be updated to match.

## Identity

Title: **Paper Planes: Origami Elite** (renamed from "Paper Pilots: Antigravity Elite", 2026-07-07). Genre: vertical-scrolling shmup with danmaku-leaning boss patterns; visual theme: folded-paper / origami (enemies render with mountain/valley crease lines and half-shading).

## Structure

- Run = rounds; round = 10 waves × 30,000 ms (real-time, `lastWaveTick`) then a boss.
- Victory currently at `defeatedRound >= 10` (see DD1 in audit-findings.md).
- Family = `ceil((((round−1)%100)+1)/10)`; Rank = `(((round−1)%100)%10)+1`; ascension lap = `floor((round−1)/100)`.

## Difficulty — the two-curve model (PRD Section 3)

**Threat (boss HP budget), linear — REBALANCED ~2× tougher (2026-07-08 sync):**

```
bossHP(round) = round(450 × (1 + (round−1) × 0.6))
```

Verified: r1=450, r3=990, r5=1530, r8=2610, r10=3150.
Baseline player DPS ≈ 25 (3 bullets × dmg 1 × mult 1 / 120 ms) → kill times ~18s → ~108s across the run.

**Reflex (enemy speed/fire-rate), soft-capped piecewise:**

```
r ≤ 5:   base = 0.5 + r×0.06
r ≤ 10:  base = 0.8 + (r−5)×0.05
r > 10:  base = 1.05 + tier×0.18 + (1 − e^(−(r−10)/40))×1.2,  tier = floor((r−1)/10)
reflex = base × max(0.5, 1/playerPower)
```

Verified continuity: r5=0.800 / r6=0.850; r10=1.050 / r11=1.260 (post-victory).
⚠ The `1/playerPower` term is inverse rubber-banding — see DD4 before touching.

**Player power — `collect` is economy-only, has NO difficulty effect (see code calcPlayerPower, 2026-07-08 sync):**

```
power = 1 + (speedLvl+weaponLvl+healthLvl+magnetLvl)×0.04 + (waveUpgradeCount×0.3)×0.04
```

Max shop levels = 10+10+10+8 = 38 (+collect 10, excluded) → max power ≈ 2.64 (verified).

**Wave / round intensity — REDEFINED `getRoundIntensity()` (2026-07-08 sync):**
New rounds start near the previous round's late-game pressure and climb from there (Node-verified: r1 0→1, r2 0.25→1, r3 0.50→1, r4 0.75→1, r5+ 0.80→1).

```
floor = min(0.8, (currentRound−1) × 0.25)
intensity = min(1, floor + (1−floor) × (currentWave−1) / 9)
```

## Economy

**Enemy base rewards:** scout 5, kamikaze 8, interceptor/dasher 10, gunner 12, bomber 15, shielder 18, reaper 20.
**Kill payout — REVISED with two new run-gated multipliers (2026-07-08 sync):**

```
reward = round(reward × comboMult × coreMult × rewardScale(currentRound) × collectMult())
```

where comboMult = `min(5, 1 + floor(comboCount/3))`, combo window 2,500 ms; coreMult = `player.coreMult || 1`.

- `rewardScale(round) = min(1, 0.35 + (round−1)×0.0725)` — run ramp, 0.35× at round 1 → 1.0× at round 10.
- `collectMult() = 0.15 + collectLvl×0.035` — Collector upgrade; 0.15× (15%) at L0 → 0.50× (50%) at L10. Even fully upgraded, total earnings are HALF the pre-rebalance economy.
  ⚠ Veteran ×2.5 and elite ×5 must be applied ONCE (at spawn). Double-application is defect D2 (verified 6.25×/25× inflation).
  **Boss payout — HALVED with the economy rebalance (2026-07-08 sync):** `round(500 × round × (1 + round×0.15) × 0.5)`. Verified r1=287, r5=781, r10=2875.
  **Core magnet:** attract inside `player.magnetRange` (80 + magnetLevel×60), lerp 0.15; collect < 30 px.
  **Drop rates per kill:** weighted powerup at `0.02 + round×0.001`; common/health drop at `0.08` (health if hp < 60% max). Veteran/elite killed in hover/retreat: guaranteed non-common drop.
  **Pickup ramp:** `min(1, 0.2 + (currentRound−1)×0.25 + (currentWave−1)×0.04)` — wave 1 of round 1 is about dodging, not hoovering.

**Shop (persistent, per class) — 5 upgrades, `collect` added (2026-07-08 sync):** cost = `round(base × 1.5^level)`; bases speed 400 / weapon 550 / health 700 / magnet 850 / **collect 500**; caps 10/10/10/8/**10**.
Verified weapon curve: 550, 825, 1238, 1856, 2784, 4177, 6265, 9397, 14096, 21144.

**Armory (in-run) costs:** Common 300–400, Rare 500–650, Epic 700–850, Legendary 1200. Rarity unlock rounds [1, 2, 5, 8]; Legendary also forced pending after an Apex kill. Reroll 150 + 75×rerolls.

## Player & classes

Base: maxHp `round((4+healthLvl)×hpMult)`, speed `(4.5+speedLvl×0.8)×speedMult`, shootDelay `120×fireRateMult` ms, dmg `1.15^weaponLvl × dmgMult`, 3 projectiles (+2 at weaponLvl≥2, +2 during overload, +extraWing), spread 0.25 rad.

| Class       | speed | hp  | fireRate | dmg | Ability (cooldown)                                       |
| ----------- | ----- | --- | -------- | --- | -------------------------------------------------------- |
| dart        | 1.5   | 0.8 | 0.65     | 0.9 | homing missile (3s)                                      |
| interceptor | 1.1   | 1.0 | 0.9      | 1.0 | auto 2s shield (5s)                                      |
| phantom     | 0.7   | 1.4 | 1.2      | 1.3 | 4s shield orb (8s)                                       |
| viper       | 1.2   | 0.9 | 0.8      | 1.1 | toxic aura, 0.3 dmg/30f < 100px (passive)                |
| nova        | 1.0   | 1.1 | 0.85     | 1.2 | EMP: bullet-clear + stun < 180px (6s) ⚠ stun = defect D3 |

Damage model: 1 heart per hit, 1,000 ms i-frames; shield and i-frames block (phasing does NOT — defect D4). Bomb: 3 charges, clears enemy bullets, 5 dmg all enemies, 10 to boss, 500 ms i-frames, key B/Space.

## Timing constants

Attack rhythm (real-time): charge 500 ms → fire 500 ms → rest 2,000 ms; enemies only fire in fire phase; charge phase draws telegraph glow. Boss attack telegraph 350 ms. Boss phase thresholds: phase 2 < 66% HP, phase 3 < 33% (core hits ×2 dmg in phase 3). Enemy AI: enter → hold (2.5–5 s, force-advance at 8 s) → hover (veteran/elite only, 4–6 s) → advance/retreat; advance despawns at y > height−150 or age > 900.

## Entity caps (load-bearing — never remove)

enemyBullets 200 · playerBullets 100 · particles 150 · enemies 40 (oldest spliced).

## Engineering invariants

1. Gameplay timing = `Date.now()` deltas. `frameCount` only for cosmetic oscillation.
2. Listeners touching run-scoped objects null-guard.
3. No array mutation during forEach.
4. Every written property has a read site in the same change.
5. `continueRun()`: rebuild player from base, reapply waveUpgrades once, then clamp hp — preserves Glass Cannon integrity. Do not reorder.
6. Save schema key `pp_save_v3` (localStorage); run sub-object only written while `gameState === 'playing'`.

## Enemy fire assignments (2026-07-07 rework — see shmup-pattern-taxonomy.md)

All small-enemy fire is aimed (anchor rule). scout: aimed 1→3-way fan · interceptor: aimed 3-way ×6.5 spd · bomber: aimed 5-way wide fan · gunner: re-aimed burst stream (3+, 90 ms) · reaper: aimed 7-way curtain + homing core · shielder: aimed 3-way + ±0.55 rad converging flanks · kamikaze/dasher: no bullets. All counts +volleyScale.add, all speeds ×volleyScale.speed.
`volleyScale(r) = { add: ⌊(r−1)/3⌋, speed: 1+(r−1)×0.06, delay: max(0.55, 1−(r−1)×0.05) }` — verified r1/r5/r10 = +0/×1.00, +1/×1.24, +3/×1.54.
Formation size = min(3+⌊i×3⌋+⌊(r−1)/2⌋, 5+⌊(r−1)×0.8⌋); mirrored twin pairs (MIRROR_PAIRS) 60% of dual batches, stagger 0.
Visual FX state: `empWave` (400 ms expanding ring to 180 px), `lightningArcs` (120 ms bolts) — both reset in init().

## New enemy types (2026-07-07)

divebomber: hp (2+⌊r/6⌋)×tier, reward 14, swoop-release-climb cycle, aimed heavy pair ×1.2 dmg · ace: hp (1+⌊r/8⌋)×tier, reward 12, fast strafe, re-aimed 2-burst 110 ms · fortress: hp (6+⌊r/3⌋)×tier, reward 25, slow, aimed 7-way wide slow curtain. Spawn table = weighted pool in pickEnemyType (verified: 3 types at low intensity → 11 at full). Shapes: ENEMY_SHAPES is the single source of truth shared with assets/*.svg — keep in sync. Viewport: 9:16 portrait (width = min(innerWidth, innerHeight×9/16), letterboxed, inputs mapped via getBoundingClientRect).
