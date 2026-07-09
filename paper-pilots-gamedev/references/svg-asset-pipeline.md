# SVG Asset Pipeline — CorelDRAW → Game

Conventions for externalizing game art into standalone SVG files, editable in CorelDRAW Graphics Suite 2022 (Vaughan's environment, Windows), replacing the hand-coded canvas path drawing currently inlined in the SKINS object and Enemy/Boss draw() methods.

## Why this exists

The current game hand-draws every ship with `ctx.lineTo` (~120 lines per ship × 5 skins, plus 8 enemy shapes and the boss). Assets in separate SVG files: (1) editable in Corel without touching code, (2) shrink the game file by ~1,000 lines, (3) render identically in gameplay, shop previews, and fleet cards at any scale.

## File conventions

- Folder: `assets/` beside the game HTML. Assets are NEVER inlined back into the HTML.
- Naming (lowercase, underscores): `ship_<class>.svg` (ship_dart, ship_interceptor, ship_phantom, ship_viper, ship_nova), `enemy_<type>.svg` (scout, bomber, interceptor, reaper, kamikaze, gunner, dasher, shielder), `boss_family<NN>.svg`, `fx_<name>.svg` (powerup icons etc.).
- Existing draw() dimensions to match (so hitboxes stay valid — hit radii are code-side, see below):
  - Ships: fit within 56 w × 62 h units around the anchor (widest current wing span ±28, nose −30/−32 to tail +24/+28).
  - Enemies: fit within 44 × 44 (current shapes span roughly ±18–22).
  - Boss: 200 w × 120 h at scale 1 (Apex renders at 1.3×).

## SVG document rules (CorelDRAW export)

1. **viewBox centered on the anchor**: use `viewBox="-32 -32 64 64"` for ships/enemies (anchor = flight center = 0,0), `viewBox="-110 -60 220 150"` for bosses. The game positions sprites by center, so the SVG origin must be the sprite center — this replaces the `x ± n*s` offsets in the old draw code.
2. Nose points **up** (−y). The game never rotates the player; enemies face down via code-side flip if needed (`ctx.scale(1,-1)`).
3. Export settings in Corel: SVG 1.1, **convert text to curves**, no embedded rasters, units = document units mapping 1:1 to viewBox (px), decimal precision 2.
4. Flat fills and simple strokes only — no filters, masks, or gradients with external refs (canvas `drawImage` of an Image rasterizes the SVG; complex filter effects render inconsistently across browsers).
5. Keep each file < 20 KB. One sprite per file.
6. Palette: reuse the existing class colours so shop/fleet UI stays coherent — dart #E65100/#BF360C, interceptor #78909C/#607D8B, phantom #1565C0/#0D47A1, viper #2E7D32/#1B5E20, nova #7B1FA2/#6A1B9A. Engine glows: dart #ff6d00, interceptor #4FC3F7, phantom/viper #FF9800, nova #FFD54F.

## Loading pattern (game side)

```js
const SPRITES = {};
function loadSprite(key, file, cb) {
  const img = new Image();
  img.onload = () => { SPRITES[key] = img; if (cb) cb(); };
  img.onerror = () => { console.warn('sprite missing:', file); }; // keep old draw() as fallback
  img.src = 'assets/' + file;
}
// draw at center (x,y), scale s — replaces skin.draw(ctx,x,y,s):
function drawSprite(key, x, y, s, wUnits, hUnits) {
  const img = SPRITES[key];
  if (!img) return false;                    // caller falls back to path drawing
  ctx.drawImage(img, x - (wUnits*s)/2, y - (hUnits*s)/2, wUnits*s, hUnits*s);
  return true;
}
```

Rules:
- Preload all sprites at startup (menu screen), not mid-game — first `drawImage` of an unloaded SVG is a blank frame.
- **Keep the existing canvas draw() code as fallback** until every asset is confirmed loading (file:// contexts can block Image loads of local SVGs in some browsers; test in the target browser before deleting fallbacks).
- **Hitboxes are unchanged**: collision uses code-side radii (player hit < 20, enemy hit 25×hoverScale, boss box ±100/−40+80, pickup < 30). Art may not exceed the bounding sizes above or visuals will lie about hitboxes.
- Damage-state variants (boss phase 3, shielder shield ring, veteran/elite rings, charge telegraph) stay code-drawn overlays on top of the sprite — do not bake them into SVGs.

## Workflow per asset

1. Design in Corel at real units matching the viewBox (e.g. 64×64 document for a ship).
2. Export per rules above; drop into `assets/`.
3. Verify: open the SVG standalone in a browser; check anchor centering (temporarily add `<circle r="1" fill="red"/>` at 0,0 and confirm it sits at the sprite's flight center; remove before shipping).
4. Register in the game's sprite manifest; confirm it renders in shop preview + gameplay; confirm hitbox feel unchanged.
5. Asset files are kept permanently — never delete an SVG when restyling; version as `ship_dart_v2.svg` and switch the manifest.
