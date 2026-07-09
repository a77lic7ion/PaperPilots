# ASSET MANIFEST — Paper Planes: Origami Elite (Godot build)
### Everything you need to create by hand. Filenames are load-bearing — match them exactly.

## Global art rules (from the reference image)

- Flat vector paper-cut style: solid fills, one subtle centre crease line, NO baked shadows (the engine renders the drop shadow), NO outlines heavier than 1.5 px, no gradients on planes.
- All planes: **top-down, nose pointing UP, centred in the canvas** with ~4 px padding.
- Format: **PNG with transparency, 2× resolution** (design at the listed size ×2, export ×2; Godot downscales cleanly). Keep your Corel/Photoshop source files.
- Palette anchors: sky #87CEEB→#E0F7FA, shadow blue #1566C0 @ 28%, player green tracer #00FFA6, enemy red #ff1744.

## Sprites — planes (folder: assets/sprites/planes/)

| Filename | Canvas (design px) | Subject | Colour | Notes |
|---|---|---|---|---|
| ship_dart.png | 64×64 | slim classic paper dart | #E65100 / #BF360C | player; add tiny canopy highlight |
| ship_interceptor.png | 64×64 | swept-wing fighter fold | #78909C / #607D8B | player |
| ship_phantom.png | 64×64 | broad heavy fold | #1565C0 / #0D47A1 | player |
| ship_viper.png | 64×64 | sharp narrow fold | #2E7D32 / #1B5E20 | player |
| ship_nova.png | 64×64 | sleek long-nose fold | #7B1FA2 / #6A1B9A | player |
| enemy_scout.png | 48×48 | classic white dart | #ECEFF1 | the "white formation" plane from the reference |
| enemy_interceptor.png | 48×48 | swept fighter | #7E57C2 | |
| enemy_bomber.png | 56×56 | wide delta | #455A64 | |
| enemy_reaper.png | 56×56 | bat-wing | #B71C1C | |
| enemy_kamikaze.png | 40×40 | narrow needle | #FF6D00 | |
| enemy_gunner.png | 48×48 | twin-boom | #00897B | |
| enemy_dasher.png | 48×48 | arrowhead | #F44336 | |
| enemy_shielder.png | 56×56 | broad fortress wing | #1565C0 | + separate shield ring below |
| enemy_divebomber.png | 56×56 | gull-wing | #8D6E63 | |
| enemy_ace.png | 48×48 | slim swept ace | #FDD835 | |
| enemy_fortress.png | 96×96 | flying wing | #37474F | biggest non-boss |
| boss_body.png | 256×160 | giant folded flagship | family colours | one per family later; start with grey/red |

Tip: the 16 SVGs in `assets/` of the handover zip are the exact current silhouettes — open them in CorelDRAW as your tracing/starting geometry, then restyle to match the reference image.

## Sprites — world & FX (assets/sprites/world/, fx/)

| Filename | Size | Subject |
|---|---|---|
| cloud_small.png / cloud_mid.png / cloud_large.png | 256×128 / 384×192 / 512×256 | white paper-cut cloud blobs (like the reference's cloud bank), soft rounded lobes |
| skytower.png | 96×128 | paper watch-tower/turret on a cloud base, top-down-ish |
| missile.png | 24×40 | small folded missile, nose up |
| bullet_player.png | 16×24 | bright #00FFA6 elongated tracer, white core |
| bullet_enemy.png | 16×16 | red orb, white core |
| bullet_homing.png | 16×16 | magenta orb |
| bullet_slow.png | 16×16 | ice-blue orb |
| core.png | 24×24 | yellow energy core (#ffea00), white ring |
| powerup_diamond.png | 28×28 | white diamond frame (icon drawn per type at runtime) |
| shield_ring.png | 96×96 | teal ring, 60% opacity |
| particle_square.png | 8×8 | plain white square (engine tints) |

## Icons & UI (assets/sprites/ui/)

| Filename | Size | Subject |
|---|---|---|
| icon_heart_full.png / icon_heart_empty.png | 24×24 | paper-cut heart |
| icon_bomb.png | 24×24 | round bomb |
| icon_upgrade_*.png ×16 | 32×32 | one per Armory upgrade (heal, speed, rapidfire, damage, magnet, wing, reargun, pierce, shieldorb, bombs, glasscannon, regen, corefinder, secondwind, overclock, graviton) |
| game_icon.png | 128×128 | red paper plane on blue (the reference's red plane is perfect) |

## Audio — SFX (assets/audio/sfx/) — WAV, 16-bit PCM, 44.1 kHz, MONO

| Filename | Length | Description |
|---|---|---|
| laser_player.wav | 0.10–0.15 s | soft zap, high→low pitch sweep; will play constantly, keep it gentle |
| hit_enemy.wav | 0.10–0.15 s | paper "thwip" / crumple tick |
| explode_small.wav | 0.35–0.5 s | paper crumple + soft pop |
| explode_big.wav | 0.6–0.9 s | layered crumple + low thump (boss/fortress) |
| pickup_core.wav | 0.15–0.25 s | bright coin blip, rising |
| pickup_power.wav | 0.3–0.4 s | two-note rising chime |
| shield_on.wav | 0.3 s | soft airy whoosh up |
| emp_blast.wav | 0.5–0.7 s | electric zap + descending sweep |
| bomb.wav | 0.7–1.0 s | deep whump + air rush |
| player_hit.wav | 0.25 s | sharp paper tear |
| boss_warning.wav | 1.5–2.0 s | rising alarm, two tones |
| ui_click.wav | 0.05–0.08 s | soft tick |
| ui_purchase.wav | 0.2 s | confirm chime |

## Audio — music (assets/audio/music/) — OGG Vorbis, stereo, seamless loop

| Filename | Length | Description |
|---|---|---|
| music_menu.ogg | 60–90 s loop | calm, airy |
| music_stage_01..NN.ogg | 90–150 s loop | your existing MP3 set converts straight across (ffmpeg → OGG) |
| music_boss.ogg | 90–120 s loop | intense |

## Checklist totals

- 17 plane PNGs · 12 world/FX PNGs · ~20 UI PNGs · 13 SFX WAVs · 3+ music OGGs
- Deliver everything at 2× design size, PNG-24 transparency, sRGB.
