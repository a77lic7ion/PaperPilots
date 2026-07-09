# Verified Audit Findings — paper_plane_game-2.html (4,075 lines)

Audit date: 2026-07-07. Every entry below was verified by call-site grep, Node execution of extracted functions, or write-site/read-site tracing. Line numbers refer to `paper_plane_game-2.html` as audited; re-locate by identifier if the file has since changed. **Update the Status column when a fix lands.**

⚠ **Resync note (2026-07-08):** the shipped `paper_plane_game.html` (4,427 lines) is a newer build than this audit's snapshot. The boss-pattern system was wired to `ATTACK_PATTERNS` AFTER this audit, so **DC1 is now obsolete** (the library is reachable via `BOSS_ATTACKS[name] || ATTACK_PATTERNS[name]`). The game was also rebalanced (boss HP ~2×, economy ~½) and gained a 5th shop upgrade (`collect`). See design-contract.md for current numbers. The D1–D8 Defect fixes listed below remain confirmed present in the live code.

## Verified Defects

| # | Defect | Evidence | Fix | Status |
|---|--------|----------|-----|--------|
| D1 | Menu crash spam: `mousemove` (L4036) and `touchmove` (L4041) handlers set `player.targetX/Y` unconditionally; `player` is undefined until `init()` runs at game start. Every mouse move on menu throws TypeError. | Handlers registered at load; `player` only assigned in `init()`. | Add `if (!player) return;` at top of both handlers. | FIXED 2026-07-07 |
| D2 | Veteran/elite reward double-application: `spawnFormation` (L1980–81) multiplies `reward` by 2.5×/5×; kill handler (L3580–81) multiplies by 2.5×/5× AGAIN. Verified in Node: veteran base-10 pays 63 not 25 (6.25×); elite pays 250 not 50 (25×). Inflates economy from round 4+. | Node reproduction in design-contract.md §Economy. | Remove the re-multiplication at kill site (L3580–81); spawn-time values are canonical. | FIXED 2026-07-07 |
| D3 | EMP stun nonfunctional: Nova's ability sets `e.stunnedUntil` (L3527) but the property is **never read** anywhere. Enemies keep moving/firing while "stunned". Only the bullet-clear half of EMP works. | `grep -n stunnedUntil` → 1 hit total (the write). | In `Enemy.update()`, early-return (skip movement + `runTypeBehavior`) while `Date.now() < this.stunnedUntil`. | FIXED 2026-07-07 |
| D4 | Phase Cloak powerup grants zero protection: sets `player.phasing` (L3118), but `Player.takeDamage()` (L2562) only checks `this.shielded \|\| iFrames`. Player takes full damage while "cloaked". Badge-only feature. | Write site L3118; damage gate L2562 excludes phasing. | Add `\|\| this.phasing` to the takeDamage guard, or route cloak through the shield mechanism. Cloak blocks bullets AND collisions (both route through takeDamage). | FIXED 2026-07-07 |
| D5 | `particles.splice(i,1)` inside `forEach` (gameLoop, ~L3705) — mutation during iteration skips elements. Cosmetic only (delayed particle cleanup). | Standard JS array semantics. | Replace with `particles = particles.filter(p => { p.update(); p.draw(); return p.life > 0; });` | FIXED 2026-07-07 |
| D6 | Chain-lightning triggers on shield hits that dealt 0 damage: shielder shield-block branch still pushes to `chainHitQueue` (kill-handler block ~L3560). Also local `dmg` var in that branch is computed then unused. | Trace of shielder hit branch. | Only push to chainHitQueue when damage actually applied; delete dead `dmg` var or use it. | FIXED 2026-07-07 |

## Verified Dead Code (defined, zero invocations)

| # | Item | Evidence | Disposition |
|---|------|----------|-------------|
| DC1 | `ATTACK_PATTERNS` — the entire ~450-line library of 40+ family-themed boss patterns (L1385–1758: radialPulse, heatDeath, solarCrucible, chronosEternum, etc.) | ⚠ **OBSOLETE as of 2026-07-08:** now reachable via `BOSS_ATTACKS[name] || ATTACK_PATTERNS[name]` (lines 3504/3512 in live build). Boss `getAvailablePatterns()` unlocks names like `flareSweep`, `iceShardWall`, `splitShot`, `sweepFan`, `arcLash`, `solarFlare`, `counterSpiral`, `rewindPulse`, `microBlackHoles`, `convergence`, `eventHorizon` — all `ATTACK_PATTERNS` keys. | Wired into boss attacks post-audit. No longer dead code. |
| DC2 | `getThreat()` (L1351), `familyBase()`, `rankMultiplier()` — threat model computed nowhere; `bossHP()` ignores it. | Call-site grep: getThreat 1 mention; familyBase/rankMultiplier only referenced inside getThreat. | Pending DD1. |
| DC3 | `getBossPatterns()` (L1373) — the rank-gated pattern unlock (rank≥3/5/8/10 tiers). Never called. | grep → 1 mention. | Pending DD1. |
| DC4 | Between-wave upgrade path: `showWaveUpgrades()` only ever called with `afterBoss=true` after boss death (L3657). The "WAVE COMPLETE" branch, and Tutorial step 4's promise ("Pick one upgrade each wave"), are unreachable. | grep showWaveUpgrades → definition + 1 call site. | Pending DD2. Either call it on wave increments, or fix tutorial text. |
| DC5 | Synergy system effects: `SYNERGIES` (L3075) checked only by `checkSynergies()`, whose only consumer is HUD badge rendering (L3140). None of the 5 described effects (nova radius, 3× cores, ghost barrage, etc.) exist in gameplay logic. | grep of all 5 synergy keys → definitions only. | Pending DD3: implement effects or relabel badges. |
| DC6 | Vestigial state: `waveTimer`, `waveQueueSpawned`, `bossTriggered` — written/reset, never read to drive behavior. `sweepAngle` in `wallSweep` computed, unused. | Call-site traces in audit session. | Safe to delete. |

## Verified Reachability Facts

- The run ends in VICTORY when `defeatedRound >= 10` (boss-death handler). Therefore across a full game only **family 1 (Gravity) of the 10 defined families** is reachable (Node: `getFamily(1..10)` → always 1), ascension laps (`/100`) never trigger, and rounds 11+ of the reflex curve never execute. ~One-third of the content system is unreachable. → DD1.
- Rank 1–10 IS reachable within rounds 1–10; the round-10 boss is the Apex (rank 10) and `legendaryPending` does fire.

## Verified-Correct (do not "fix")

- Reflex curve continuous at branch boundaries: r5→r6 = 0.800→0.850, no discontinuity. (r10→r11 jumps 1.05→1.26 but is post-victory.)
- Boss HP vs baseline DPS: live build uses `bossHP = round(450 × (1+(round−1)×0.6))` → 450 HP ≈ 18s at round 1 → 3,150 HP ≈ 126s at round 10 at base 25 DPS (rebalanced ~2× tougher, 2026-07-08). Player damage growth (1.15^weapon, extra projectiles) offsets. Note: the 220/1,309 numbers in this audit's 2026-07-07 snapshot are STALE.
- All radial/spread/mirror angle math (even spacing, atan2 aiming, π−θ vertical mirror) correct.
- `continueRun()` rebuild-then-reapply pattern correctly prevents Glass Cannon maxHp stacking on reload — preserve.
- Entity hard caps (bullets/enemies/particles) present and correct.
- Attack rhythm + wave timers are real-time based (frame-rate independent) — preserve.

## Open Design Decisions (Vaughan to resolve — never assume)

| # | Decision | Options |
|---|----------|---------|
| DD1 | 10-round game or 100-round game? | (a) Keep victory at 10 → delete families 2–10, ATTACK_PATTERNS, threat model, ascension (≈500 lines). (b) Extend/remove victory → wire getBossPatterns + ATTACK_PATTERNS into Boss, use getThreat in bossHP, verify 100-round balance in Node. |
| DD2 | Should upgrades appear between waves (as tutorial claims) or only after bosses (current behavior)? | Per-wave = call showWaveUpgrades(false) on wave increment; per-boss = fix tutorial step 4 text. Economy retuning needed either way (16 upgrade offers/run vs 1). |
| DD3 | Implement the 5 synergy effects, or make badges honest? | Implementation cost is small (each is a conditional in an existing code path); Node-verify any multiplier added. |
| DD4 | Reverse difficulty scaling: `reflexDifficulty ∝ 1/playerPower` means a maxed player (power 2.64) halves enemy speed/fire-rate while being 2.6× stronger — compounding advantage. Node-verified: reflex@r10 drops 1.05→0.525. | Keep (anti-frustration), clamp tighter (e.g. `max(0.8, 1/power)`), or remove. |

## 2026-07-07 Gameplay Rework (post-audit changes, all Node-verified)

- Title → "Paper Planes: Origami Elite"; origami crease rendering added to Enemy.draw (clip + mountain/valley folds + half-shade).
- Enemy fire rebuilt to aimed-only taxonomy (see shmup-pattern-taxonomy.md); removed: bomber 8-ring, reaper 12-flower, interceptor mirror-away shots, kamikaze downward trail. Remaining rotating-ring code exists only inside dead ATTACK_PATTERNS (verified: 3 sites, all family-library).
- Round scaling: volleyScale() + new formation-size formula (5→10 enemies r1→r10, verified).
- Symmetric spawning: MIRROR_PAIRS twin formations, simultaneous entry.
- EMP wave and chain lightning now have visible effects (empWave ring, lightningArcs bolts).

## 2026-07-07 Session 2 additions

| # | Item | Evidence | Status |
|---|------|----------|--------|
| D7 | Player homing bullets steered toward the PLAYER (Dart missiles boomeranged back) — Bullet.update homing block hardcoded player as target. | Read of L2629–2634. | FIXED — player-fired homing targets nearest enemy/boss, max speed 9. |
| D8 | Non-bullet damage couldn't kill: enemy death only checked inside bullet-collision loop, so Viper's toxic trail left enemies at negative HP forever. | hp<=0 grep: only L3607 (bullet loop). | FIXED — enemies filter now pays out deaths from any damage source. |

Also: 3 new enemy types (divebomber/ace/fortress) with weighted spawn table (distribution Node-verified at intensity 0.1/0.5/1.0); all 11 enemies redrawn as distinct paper-plane silhouettes via shared ENEMY_SHAPES table (bounds-verified ±32); 16 SVG assets generated FROM those tables (1:1 parity); 9:16 portrait viewport via fitViewport() with getBoundingClientRect input mapping; developer handover package produced.
