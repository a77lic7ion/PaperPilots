# GODOT MASTER PROMPT — Paper Planes: Origami Elite
### Paste everything below this line into your AI assistant inside/alongside Godot 4.x

---

You are building a complete Godot 4.x project in GDScript for a vertical-scrolling shoot-'em-up (shmup) called **Paper Planes: Origami Elite**. Follow this specification exactly. Where a value is given, use it verbatim — the numbers are pre-verified balance data, not suggestions.

## 1. Visual style (this gates everything else)

Flat 2D vector paper-cut aesthetic, top-down: paper planes as clean flat-colour folded shapes with a subtle centre crease line, each casting a **soft blue drop shadow offset +9 px right, +14 px down** (shadow = the plane's own silhouette, colour `Color(0.08, 0.4, 0.75, 0.28)`, rendered on a layer BELOW all planes). Sky is a soft blue gradient. Clouds are white rounded paper-cut shapes. No gradients on planes, no outlines heavier than 1.5 px, no pixel-art. Reference: the classic "red paper plane leaving the white formation" stock illustration style.

## 2. Project setup

- Godot 4.x, GDScript only, 2D renderer.
- Display: **portrait 9:16** — project settings viewport 720×1280, stretch mode `canvas_items`, aspect `keep`.
- Folder structure:
```
res://
├── scenes/        Main.tscn, Game.tscn, Player.tscn, Enemy.tscn, Boss.tscn, Bullet.tscn,
│                  EnemyBullet.tscn, PowerUp.tscn, Core.tscn, SkyTower.tscn, Cloud.tscn,
│                  ui/HUD.tscn, ui/StartScreen.tscn, ui/Armory.tscn, ui/PauseScreen.tscn, ui/GameOver.tscn
├── scripts/       one .gd per scene + autoloads
├── autoload/      GameState.gd (run state, cores, round/wave), Balance.gd (all formulas below),
│                  AudioBus.gd (music crossfade + SFX), SaveGame.gd (JSON user://save.json)
├── assets/
│   ├── sprites/   (see ASSET MANIFEST — filenames must match exactly)
│   ├── audio/sfx/ audio/music/
│   └── fonts/
└── project.godot
```

## 3. Layer sandwich (z_index) — critical for the parallax look

| z | Layer |
|---|-------|
| -30 | Sky gradient (static ColorRect + subtle radial) |
| -20 | Cloud layer FAR (ParallaxLayer, motion_scale 0.3, small clouds, 60% opacity) |
| -15 | SHADOW layer — all plane/tower shadows render here |
| -10 | Cloud layer MID (motion_scale 0.6) |
| 0 | Gameplay: player, enemies, bullets, towers, pickups |
| +10 | Cloud layer NEAR (motion_scale 1.2, large clouds, 90% opacity) — bullets and enemies pass BEHIND these |
| +20 | Particles/FX |
| +100 | HUD (CanvasLayer) |

Clouds scroll downward continuously (world scroll ~120 px/s at NEAR layer). Use `ParallaxBackground` with three `ParallaxLayer`s; mirroring on Y for infinite scroll.

## 4. Player (Player.tscn: CharacterBody2D + Sprite2D + shadow Sprite2D + Area2D hitbox r=14)

Five selectable classes; stats = base × class multiplier:

| Class | speed | hp | fireDelay | dmg | Ability (cooldown) |
|---|---|---|---|---|---|
| dart | 1.5 | 0.8 | 0.65 | 0.9 | Homing missile at nearest enemy (3 s) |
| interceptor | 1.1 | 1.0 | 0.9 | 1.0 | Auto-shield 2 s (5 s) |
| phantom | 0.7 | 1.4 | 1.2 | 1.3 | Shield orb 4 s (8 s) |
| viper | 1.2 | 0.9 | 0.8 | 1.1 | Toxic aura: 0.3 dmg per 0.5 s to enemies < 100 px (passive) |
| nova | 1.0 | 1.1 | 0.85 | 1.2 | EMP: clear bullets + STUN enemies 2 s within 180 px, expanding ring VFX (6 s) |

Base: maxHp 4, speed 270 px/s, fireDelay 0.12 s, 3-projectile fan spread 0.25 rad. Movement: pointer-follow lerp (touch + mouse) AND WASD/arrows. Damage: 1 hp per hit, 1.0 s invulnerability flicker. Bomb (B/Space/on-screen button): 3 charges, clears enemy bullets, 5 dmg all enemies, 10 to boss.
**Player bullets must be highly visible: bright #00FFA6 elongated tracers with white core, larger than enemy bullets.** Enemy bullets: red #ff1744 orbs, magenta if homing, ice-blue if slowing.

## 5. Difficulty & economy (Balance.gd — verbatim)

```gdscript
func boss_hp(round: int) -> int: return roundi(220.0 * (1.0 + (round - 1) * 0.55))
func volley_scale(round: int) -> Dictionary:
    return { "add": (round - 1) / 3, "speed": 1.0 + (round - 1) * 0.06, "delay": max(0.55, 1.0 - (round - 1) * 0.05) }
func formation_size(round: int, intensity: float) -> int:
    return mini(3 + int(intensity * 3) + (round - 1) / 2, 5 + int((round - 1) * 0.8))
```
Run = 10 rounds; round = 10 waves × 30 s (real time) then a boss. Wave intensity = `(wave-1)/9.0`. Combo: kills < 2.5 s apart, multiplier `min(5, 1 + combo/3)`. Enemy rewards: scout 5, kamikaze 8, interceptor/dasher 10, ace 12, gunner 12, divebomber 14, bomber 15, shielder 18, reaper 20, fortress 25; veteran ×2.5, elite ×5 **applied once at spawn**. Boss reward `500 × round × (1 + round×0.15)`.

## 6. Enemy fire — THE ANCHOR RULE (non-negotiable)

Every small-enemy shot is anchored to `(player.global_position - muzzle).angle()`. Rings, spirals, and bullet walls are **boss-only**. Implement two helpers and route ALL enemy fire through them:
- `fire_aimed_fan(pos, count, spread, speed, dmg)` — n bullets centred on the player
- `fire_aimed_burst(enemy, shots, gap_s, speed, dmg)` — rapid stream, each shot re-aimed

11 enemy types (sprite filenames in the manifest):

| Type | HP | Behaviour | Fire (all + volley_scale) |
|---|---|---|---|
| scout | 1+ | side-to-side strafe | aimed 1→3-way fan |
| interceptor | 1+ | tracks player X, bobs | aimed 3-way, fast |
| bomber | 3+ | slow track | aimed 5-way wide fan |
| reaper | 2+ | closes to mid-screen | aimed 7-way curtain + 1 homing |
| kamikaze | 1 | rams player, no bullets | — |
| gunner | 2+ | slow track | re-aimed burst 3+, 90 ms |
| dasher | 1+ | periodic lunge, no bullets | — |
| shielder | 4+ (3-hit shield) | slow advance | aimed 3-way + 2 converging flanks ±0.55 rad |
| divebomber | 2+ | swoop → release → climb cycle | aimed heavy pair ×1.2 dmg at closest approach |
| ace | 1+ | fast strafing runs | re-aimed 2-burst, 110 ms |
| fortress | 6+ | very slow drift | aimed 7-way slow wide curtain |

Attack rhythm (global, real-time): charge 0.5 s (enemies glow yellow telegraph) → fire 0.5 s (only window enemies may shoot) → rest 2.0 s. Enemy AI states: enter → hold (2.5–5 s) → hover (veteran/elite only) → advance/exit.

## 7. Formations & symmetry

~16 formation generators (V, line, column, diamond, wall, chevron, zigzag, spiral, pincer, swoops, side-lines, side-Vs). **60% of dual spawns are mirrored twins: identical formation/type/count/speed entering left+right simultaneously.** Spawn density scales with formation_size(). Hard caps: enemy bullets 200, player bullets 100, enemies 40.

## 8. Stage elements (new — build in from day one)

`SkyTower.tscn` — a StaticBody2D that scrolls down with the world (~NEAR cloud speed × 0.8), sits ON a cloud sprite, and fires an aimed missile (slow homing, destructible, 3 hp) every 3.5 s while on-screen. 8 hp, reward 30, drop shadow like planes. Spawn 0–2 per wave from round 3+. Architect stage elements as a generic `StageElement` base class so more (radar posts, balloon mines) can be added later.

## 9. Boss (Boss.tscn)

HP from boss_hp(); 3 phases at 66%/33% (phase 3: core hits ×2 dmg, red core pulse). Movement modes cycled every 4–5 s: sine, charge, strafe, teleport, circle, zigzag. Patterns: ring, aimed spread, wall-with-gap, multi-arm spiral — phase-gated. 350 ms telegraph ring before every attack. Boss music crossfade 5 s.

## 10. Upgrades, powerups, persistence

Armory after each boss: 3 random cards + reroll (150 + 75/reroll) + skip; rarities Common/Rare/Epic/Legendary unlock at rounds 1/2/5/8; 16 upgrades (heal, +8% speed, −8% delay, +12% dmg, +25% magnet, +1 projectile, rear gun, pierce, shield-orb, +2 bombs, glass cannon, regen, +50% cores, second wind, overclock, graviton). Persistent shop: per-class speed/weapon/health/magnet, cost `base × 1.5^level` (400/550/700/850), caps 10/10/10/8. Powerup drops: shield, warp (global 0.4× enemy slow, 4 s), overload, nova, drone, phase cloak (real immunity!), gravity well, chain lightning (draw yellow bolt Line2D arcs), second wind, core overdrive, health. Save: total cores, per-class upgrades, unlocked skins, settings, best round, and mid-run continue snapshot.

## 11. Deliver

Generate every scene, every script, the project.godot, and placeholder ColorRect/Polygon2D stand-ins for any missing asset so the game runs before final art lands. Load sprites by the exact manifest filenames so hand-made art drops in with zero code changes. Ship a README listing the input map.

---
### End of prompt
