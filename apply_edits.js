const fs = require('fs');

let content = fs.readFileSync('paper_plane_game.html', 'utf8');

// Replacement 1: Enemy count scaling in generateFormation (Round 4+ / Wave 9+)
const find1 = `            // Round-scaled formation size (Node-verified: 5 at r1 → 10 at r10 at full intensity)
            let count = 3 + Math.floor(intensity * 3) + Math.floor((round - 1) / 2);
            let maxCount = 5 + Math.floor((round - 1) * 0.8);
            if (currentRound >= 4 && currentWave >= 9) {
                count = Math.round(count * 1.4);
                maxCount = Math.round(maxCount * 1.4);
            }
            const wp = getWaveProfile(round);
            const capped = (opts && opts.forceCount) ? opts.forceCount : Math.min(Math.round(count * wp.countMult), maxCount);`;

const alternateFind1 = `            // Round-scaled formation size (Node-verified: 5 at r1 → 10 at r10 at full intensity)
            let count = 3 + Math.floor(intensity * 3) + Math.floor((round - 1) / 2);
            const maxCount = 5 + Math.floor((round - 1) * 0.8);
            const wp = getWaveProfile(round);
            const capped = (opts && opts.forceCount) ? opts.forceCount : Math.min(Math.round(count * wp.countMult), maxCount);`;

const replace1 = `            // Round-scaled formation size (Node-verified: 5 at r1 → 10 at r10 at full intensity)
            let count = 3 + Math.floor(intensity * 3) + Math.floor((round - 1) / 2);
            let maxCount = 5 + Math.floor((round - 1) * 0.8);
            if (currentRound >= 4 && currentWave >= 9) {
                count = Math.round(count * 1.4);
                maxCount = Math.round(maxCount * 1.4);
            }
            const wp = getWaveProfile(round);
            const capped = (opts && opts.forceCount) ? opts.forceCount : Math.min(Math.round(count * wp.countMult), maxCount);`;

if (content.includes(alternateFind1)) {
    content = content.replace(alternateFind1, replace1);
    console.log("Applied Replacement 1 (Enemy count scaling)");
} else if (content.includes(find1)) {
    console.log("Replacement 1 already applied");
} else {
    console.error("COULD NOT FIND Replacement 1 target!");
}

// Replacement 2: Enemy HP scaling in Enemy constructor (Round 4+ / Wave 9+)
const find2 = `                    default:
                        this.hp = (1 + Math.floor(currentRound / 10)) * tierHp; this.reward = 5;
                        this.speed = (5 + Math.random() * 1.2) * rsm;
                        this.shootDelay = Math.max(350, 600 - currentRound * 15);
                }
                if (currentRound >= 4 && currentWave >= 9) {
                    this.hp = Math.round(this.hp * (1.5 + (currentRound - 4) * 0.25));
                }
                this.lastShot = 0;`;

const alternateFind2 = `                    default:
                        this.hp = (1 + Math.floor(currentRound / 10)) * tierHp; this.reward = 5;
                        this.speed = (5 + Math.random() * 1.2) * rsm;
                        this.shootDelay = Math.max(350, 600 - currentRound * 15);
                }
                this.lastShot = 0;`;

const replace2 = `                    default:
                        this.hp = (1 + Math.floor(currentRound / 10)) * tierHp; this.reward = 5;
                        this.speed = (5 + Math.random() * 1.2) * rsm;
                        this.shootDelay = Math.max(350, 600 - currentRound * 15);
                }
                if (currentRound >= 4 && currentWave >= 9) {
                    this.hp = Math.round(this.hp * (1.5 + (currentRound - 4) * 0.25));
                }
                this.lastShot = 0;`;

if (content.includes(alternateFind2)) {
    content = content.replace(alternateFind2, replace2);
    console.log("Applied Replacement 2 (Enemy HP scaling)");
} else if (content.includes(find2)) {
    console.log("Replacement 2 already applied");
} else {
    console.error("COULD NOT FIND Replacement 2 target!");
}

// Replacement 3: window.Enemy, setCurrentRoundForTesting, etc.
const find3 = `        window.Enemy = Enemy;
        window.setCurrentRoundForTesting = (r) => { currentRound = r; };
        window.setCurrentWaveForTesting = (w) => { currentWave = w; };
        window.setBossForTesting = (b) => { boss = b; };
        window.getUnlockedClassesForTesting = () => unlockedClasses;
        window.getScrapbookShipsForTesting = () => scrapbookShips;
        window.getUpgradesForTesting = () => upgrades;

        class EnergyCore {`;

const alternateFind3 = `                ctx.restore();
            }
        }

        class EnergyCore {`;

const replace3 = `                ctx.restore();
            }
        }
        window.Enemy = Enemy;
        window.setCurrentRoundForTesting = (r) => { currentRound = r; };
        window.setCurrentWaveForTesting = (w) => { currentWave = w; };
        window.setBossForTesting = (b) => { boss = b; };
        window.getUnlockedClassesForTesting = () => unlockedClasses;
        window.getScrapbookShipsForTesting = () => scrapbookShips;
        window.getUpgradesForTesting = () => upgrades;

        class EnergyCore {`;

// Let's also check if replacement 3 was already partially applied
const alternateFind3_already_applied = `        window.Enemy = Enemy;
        window.setCurrentRoundForTesting = (r) => { currentRound = r; };
        window.setCurrentWaveForTesting = (w) => { currentWave = w; };
        window.setBossForTesting = (b) => { boss = b; };

        class EnergyCore {`;

if (content.includes(alternateFind3)) {
    content = content.replace(alternateFind3, replace3);
    console.log("Applied Replacement 3 (Exposing Enemy & setters)");
} else if (content.includes(alternateFind3_already_applied)) {
    content = content.replace(alternateFind3_already_applied, replace3);
    console.log("Updated Replacement 3 (Exposing Enemy & setters with getters)");
} else if (content.includes(find3)) {
    console.log("Replacement 3 already applied");
} else {
    console.error("COULD NOT FIND Replacement 3 target!");
}

// Replacement 4: Bullet window export
const find4 = `        window.Bullet = Bullet;

        // === EMBEDDED SVG SPRITES — the game renders these actual assets (canvas paths remain as fallback) ===`;

const alternateFind4 = `                ctx.restore();
            }
        }

        // === EMBEDDED SVG SPRITES — the game renders these actual assets (canvas paths remain as fallback) ===`;

const replace4 = `                ctx.restore();
            }
        }
        window.Bullet = Bullet;

        // === EMBEDDED SVG SPRITES — the game renders these actual assets (canvas paths remain as fallback) ===`;

if (content.includes(alternateFind4)) {
    content = content.replace(alternateFind4, replace4);
    console.log("Applied Replacement 4 (Exposing Bullet)");
} else if (content.includes(find4)) {
    console.log("Replacement 4 already applied");
} else {
    console.error("COULD NOT FIND Replacement 4 target!");
}

// Replacement 5: Bullet speed/fewer/isBossBullet balancing in Bullet constructor
const find5 = `        class Bullet {
            constructor(x, y, angle, isPlayer, damage, options) {
                options = options || {};
                this.x = x; this.y = y; this.damage = damage || 1;
                let speed = options.speed || (isPlayer ? 15 : 7);
                let isBossBullet = false;
                let dead = false;
                if (!isPlayer && boss) {
                    isBossBullet = true;
                    speed *= 0.75; // Slower bullet wave speed
                    if (Math.random() < 0.20) {
                        dead = true; // Slightly decrease the number of bullets
                    }
                }
                if (isPlayer) {
                    this.vx = Math.sin(angle) * speed; this.vy = -Math.cos(angle) * speed;
                } else {
                    this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
                }
                this.isPlayer = isPlayer;
                this.isBossBullet = isBossBullet;
                this.dead = dead;`;

const alternateFind5 = `        class Bullet {
            constructor(x, y, angle, isPlayer, damage, options) {
                options = options || {};
                this.x = x; this.y = y; this.damage = damage || 1;
                let speed = options.speed || (isPlayer ? 15 : 7);
                if (isPlayer) {
                    this.vx = Math.sin(angle) * speed; this.vy = -Math.cos(angle) * speed;
                } else {
                    this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
                }
                this.isPlayer = isPlayer;`;

const replace5 = `        class Bullet {
            constructor(x, y, angle, isPlayer, damage, options) {
                options = options || {};
                this.x = x; this.y = y; this.damage = damage || 1;
                let speed = options.speed || (isPlayer ? 15 : 7);
                let isBossBullet = false;
                let dead = false;
                if (!isPlayer && boss) {
                    isBossBullet = true;
                    speed *= 0.75; // Slower bullet wave speed
                    if (Math.random() < 0.20) {
                        dead = true; // Slightly decrease the number of bullets
                    }
                }
                if (isPlayer) {
                    this.vx = Math.sin(angle) * speed; this.vy = -Math.cos(angle) * speed;
                } else {
                    this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
                }
                this.isPlayer = isPlayer;
                this.isBossBullet = isBossBullet;
                this.dead = dead;`;

if (content.includes(alternateFind5)) {
    content = content.replace(alternateFind5, replace5);
    console.log("Applied Replacement 5 (Bullet speed & fewer balancing)");
} else if (content.includes(find5)) {
    console.log("Replacement 5 already applied");
} else {
    console.error("COULD NOT FIND Replacement 5 target!");
}

// Replacement 6: Bullet size balancing (Boss bullets larger)
const find6 = `                let col = (this.homing ? '#FF40FF' : (this.slow ? '#40C4FF' : '#ff1744'));
                let radOuter = this.homing ? 10 : 7.5;
                let radInner = this.homing ? 6 : 4;
                let radCore = this.homing ? 3 : 2;
                if (this.isBossBullet) {
                    radOuter *= 1.4;
                    radInner *= 1.4;
                    radCore *= 1.4;
                }
                ctx.fillStyle = col === '#FF40FF' ? 'rgba(255,64,255,0.22)' : (col === '#40C4FF' ? 'rgba(64,196,255,0.22)' : 'rgba(255,23,68,0.22)');
                ctx.beginPath(); ctx.arc(this.x, this.y, radOuter, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = col;
                ctx.beginPath(); ctx.arc(this.x, this.y, radInner, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.arc(this.x, this.y, radCore, 0, Math.PI * 2); ctx.fill();
                ctx.restore();`;

const alternateFind6 = `                let col = (this.homing ? '#FF40FF' : (this.slow ? '#40C4FF' : '#ff1744'));
                ctx.fillStyle = col === '#FF40FF' ? 'rgba(255,64,255,0.22)' : (col === '#40C4FF' ? 'rgba(64,196,255,0.22)' : 'rgba(255,23,68,0.22)');
                ctx.beginPath(); ctx.arc(this.x, this.y, this.homing ? 10 : 7.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = col;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.homing ? 6 : 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.homing ? 3 : 2, 0, Math.PI * 2); ctx.fill();
                ctx.restore();`;

const replace6 = `                let col = (this.homing ? '#FF40FF' : (this.slow ? '#40C4FF' : '#ff1744'));
                let radOuter = this.homing ? 10 : 7.5;
                let radInner = this.homing ? 6 : 4;
                let radCore = this.homing ? 3 : 2;
                if (this.isBossBullet) {
                    radOuter *= 1.4;
                    radInner *= 1.4;
                    radCore *= 1.4;
                }
                ctx.fillStyle = col === '#FF40FF' ? 'rgba(255,64,255,0.22)' : (col === '#40C4FF' ? 'rgba(64,196,255,0.22)' : 'rgba(255,23,68,0.22)');
                ctx.beginPath(); ctx.arc(this.x, this.y, radOuter, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = col;
                ctx.beginPath(); ctx.arc(this.x, this.y, radInner, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'white';
                ctx.beginPath(); ctx.arc(this.x, this.y, radCore, 0, Math.PI * 2); ctx.fill();
                ctx.restore();`;

if (content.includes(alternateFind6)) {
    content = content.replace(alternateFind6, replace6);
    console.log("Applied Replacement 6 (Bullet size balancing)");
} else if (content.includes(find6)) {
    console.log("Replacement 6 already applied");
} else {
    console.error("COULD NOT FIND Replacement 6 target!");
}

// Replacement 7: Bullet dead discard filtering
const find7 = `            bullets = bullets.filter(b => { b.update(); b.draw(); return b.y > -20 && b.y < height + 40 && b.x > -40 && b.x < width + 40; });
            enemyBullets = enemyBullets.filter(b => {
                if (b.dead) return false;
                b.update(); b.draw();
                if (b.x < -60 || b.x > width + 60 || b.y > height + 20 || b.y < -60) return false;`;

const alternateFind7 = `            bullets = bullets.filter(b => { b.update(); b.draw(); return b.y > -20 && b.y < height + 40 && b.x > -40 && b.x < width + 40; });
            enemyBullets = enemyBullets.filter(b => {
                b.update(); b.draw();
                if (b.x < -60 || b.x > width + 60 || b.y > height + 20 || b.y < -60) return false;`;

const replace7 = `            bullets = bullets.filter(b => { b.update(); b.draw(); return b.y > -20 && b.y < height + 40 && b.x > -40 && b.x < width + 40; });
            enemyBullets = enemyBullets.filter(b => {
                if (b.dead) return false;
                b.update(); b.draw();
                if (b.x < -60 || b.x > width + 60 || b.y > height + 20 || b.y < -60) return false;`;

if (content.includes(alternateFind7)) {
    content = content.replace(alternateFind7, replace7);
    console.log("Applied Replacement 7 (Bullet discard filtering)");
} else if (content.includes(find7)) {
    console.log("Replacement 7 already applied");
} else {
    console.error("COULD NOT FIND Replacement 7 target!");
}

// Replacement 8: Boss erratic movement speed balancing
const find8_1 = `                this.telegraphUntil = 0;
                this.pendingAttack = null;
                this.pendingAttackTime = 0;
                this.moveSpeedMult = 0.65;
            }
            pickMoveType() {
                const types = ['sine', 'charge', 'strafe', 'teleport', 'circle', 'zigzag'];
                let next;
                do { next = types[Math.floor(Math.random() * types.length)]; } while (next === this.moveType && types.length > 1);
                this.moveType = next;
                this.moveDir = Math.random() < 0.5 ? -1 : 1;
                this.moveTarget = Math.random() * (width - 200) + 100;
                this.moveTimer = Date.now();
                this.strafeVx = this.moveDir * (1.5 + Math.min(1.0, this.reflex) * 1.0) * this.moveSpeedMult;
            }`;

const alternateFind8_1 = `                this.telegraphUntil = 0;
                this.pendingAttack = null;
                this.pendingAttackTime = 0;
            }
            pickMoveType() {
                const types = ['sine', 'charge', 'strafe', 'teleport', 'circle', 'zigzag'];
                let next;
                do { next = types[Math.floor(Math.random() * types.length)]; } while (next === this.moveType && types.length > 1);
                this.moveType = next;
                this.moveDir = Math.random() < 0.5 ? -1 : 1;
                this.moveTarget = Math.random() * (width - 200) + 100;
                this.moveTimer = Date.now();
                this.strafeVx = this.moveDir * (1.5 + Math.min(1.0, this.reflex) * 1.0);
            }`;

const replace8_1 = `                this.telegraphUntil = 0;
                this.pendingAttack = null;
                this.pendingAttackTime = 0;
                this.moveSpeedMult = 0.65;
            }
            pickMoveType() {
                const types = ['sine', 'charge', 'strafe', 'teleport', 'circle', 'zigzag'];
                let next;
                do { next = types[Math.floor(Math.random() * types.length)]; } while (next === this.moveType && types.length > 1);
                this.moveType = next;
                this.moveDir = Math.random() < 0.5 ? -1 : 1;
                this.moveTarget = Math.random() * (width - 200) + 100;
                this.moveTimer = Date.now();
                this.strafeVx = this.moveDir * (1.5 + Math.min(1.0, this.reflex) * 1.0) * this.moveSpeedMult;
            }`;

if (content.includes(alternateFind8_1)) {
    content = content.replace(alternateFind8_1, replace8_1);
    console.log("Applied Replacement 8.1 (Boss speed multiplier in pickMoveType)");
} else if (content.includes(find8_1)) {
    console.log("Replacement 8.1 already applied");
} else {
    console.error("COULD NOT FIND Replacement 8.1 target!");
}

const find8_2 = `                    let now = Date.now();
                    if (now - this.moveTimer > 4000 + Math.random() * 1000) this.pickMoveType();
                    const spd = Math.min(1.0, this.reflex) * this.moveSpeedMult; // cap movement speed
                    const px = player.x;
                    switch (this.moveType) {
                        case 'sine':
                            this.x = this.moveCenterX + Math.sin(frameCount * 0.03 * spd) * (width / 3);
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.015) * 25;
                            break;
                        case 'charge':
                            this.x += (px - this.x) * 0.025 * spd;
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.04) * 40;
                            if (Math.abs(this.x - px) < 10) { this.moveType = 'sine'; this.moveTimer = now; }
                            break;
                        case 'strafe':
                            this.x += this.strafeVx * frameDt;
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.025) * 30;
                            if (this.x < 80 || this.x > width - 80) { this.strafeVx *= -1; this.x = Math.max(80, Math.min(width - 80, this.x)); }
                            break;
                        case 'teleport':
                            if (now - this.moveTimer > 800) {
                                this.x = Math.random() * (width - 200) + 100;
                                this.y = 120 + Math.random() * 60;
                                this.moveTimer = now - 3200;
                            }
                            break;
                        case 'circle':
                            const circAngle = frameCount * 0.02 * spd;
                            this.x = this.moveCenterX + Math.cos(circAngle) * (width / 4);
                            this.y = this.moveCenterY + Math.sin(circAngle) * 50;
                            break;
                        case 'zigzag':
                            this.x += this.moveDir * (1.5 + spd * 0.6) * this.moveSpeedMult * frameDt;
                            this.y = this.moveCenterY + ((Math.floor(frameCount / 25) % 2) * 25 - 12);
                            if (this.x < 60 || this.x > width - 60) { this.moveDir *= -1; this.x = Math.max(60, Math.min(width - 60, this.x)); }
                            break;
                    }`;

const alternateFind8_2 = `                    let now = Date.now();
                    if (now - this.moveTimer > 4000 + Math.random() * 1000) this.pickMoveType();
                    const spd = Math.min(1.0, this.reflex); // cap movement speed
                    const px = player.x;
                    switch (this.moveType) {
                        case 'sine':
                            this.x = this.moveCenterX + Math.sin(frameCount * 0.03 * spd) * (width / 3);
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.015) * 25;
                            break;
                        case 'charge':
                            this.x += (px - this.x) * 0.025 * spd;
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.04) * 40;
                            if (Math.abs(this.x - px) < 10) { this.moveType = 'sine'; this.moveTimer = now; }
                            break;
                        case 'strafe':
                            this.x += this.strafeVx * frameDt;
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.025) * 30;
                            if (this.x < 80 || this.x > width - 80) { this.strafeVx *= -1; this.x = Math.max(80, Math.min(width - 80, this.x)); }
                            break;
                        case 'teleport':
                            if (now - this.moveTimer > 800) {
                                this.x = Math.random() * (width - 200) + 100;
                                this.y = 120 + Math.random() * 60;
                                this.moveTimer = now - 3200;
                            }
                            break;
                        case 'circle':
                            const circAngle = frameCount * 0.02 * spd;
                            this.x = this.moveCenterX + Math.cos(circAngle) * (width / 4);
                            this.y = this.moveCenterY + Math.sin(circAngle) * 50;
                            break;
                        case 'zigzag':
                            this.x += this.moveDir * (1.5 + spd * 0.6) * frameDt;
                            this.y = this.moveCenterY + ((Math.floor(frameCount / 25) % 2) * 25 - 12);
                            if (this.x < 60 || this.x > width - 60) { this.moveDir *= -1; this.x = Math.max(60, Math.min(width - 60, this.x)); }
                            break;
                    }`;

const replace8_2 = `                    let now = Date.now();
                    if (now - this.moveTimer > 4000 + Math.random() * 1000) this.pickMoveType();
                    const spd = Math.min(1.0, this.reflex) * this.moveSpeedMult; // cap movement speed
                    const px = player.x;
                    switch (this.moveType) {
                        case 'sine':
                            this.x = this.moveCenterX + Math.sin(frameCount * 0.03 * spd) * (width / 3);
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.015) * 25;
                            break;
                        case 'charge':
                            this.x += (px - this.x) * 0.025 * spd;
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.04) * 40;
                            if (Math.abs(this.x - px) < 10) { this.moveType = 'sine'; this.moveTimer = now; }
                            break;
                        case 'strafe':
                            this.x += this.strafeVx * frameDt;
                            this.y = this.moveCenterY + Math.sin(frameCount * 0.025) * 30;
                            if (this.x < 80 || this.x > width - 80) { this.strafeVx *= -1; this.x = Math.max(80, Math.min(width - 80, this.x)); }
                            break;
                        case 'teleport':
                            if (now - this.moveTimer > 800) {
                                this.x = Math.random() * (width - 200) + 100;
                                this.y = 120 + Math.random() * 60;
                                this.moveTimer = now - 3200;
                            }
                            break;
                        case 'circle':
                            const circAngle = frameCount * 0.02 * spd;
                            this.x = this.moveCenterX + Math.cos(circAngle) * (width / 4);
                            this.y = this.moveCenterY + Math.sin(circAngle) * 50;
                            break;
                        case 'zigzag':
                            this.x += this.moveDir * (1.5 + spd * 0.6) * this.moveSpeedMult * frameDt;
                            this.y = this.moveCenterY + ((Math.floor(frameCount / 25) % 2) * 25 - 12);
                            if (this.x < 60 || this.x > width - 60) { this.moveDir *= -1; this.x = Math.max(60, Math.min(width - 60, this.x)); }
                            break;
                    }`;

if (content.includes(alternateFind8_2)) {
    content = content.replace(alternateFind8_2, replace8_2);
    console.log("Applied Replacement 8.2 (Boss speed multiplier in update)");
} else if (content.includes(find8_2)) {
    console.log("Replacement 8.2 already applied");
} else {
    console.error("COULD NOT FIND Replacement 8.2 target!");
}

// Replacement 9: pilot name "A77lic7ion" backdoor cheat
const cheatCode = `        function applyBackdoorCheat() {
            const maxLevels = { speed: 10, weapon: 10, health: 10, magnet: 8, collect: 10 };
            upgrades = {
                dart: { ...maxLevels },
                interceptor: { ...maxLevels },
                phantom: { ...maxLevels },
                viper: { ...maxLevels },
                nova: { ...maxLevels }
            };
            unlockedClasses = ['dart', 'interceptor', 'phantom', 'viper', 'nova'];
            unlockedSkins = ['default', 'origamicrane', 'stealthwing', 'dragonfly', 'starfighter'];
            scrapbookShips = SCRAPBOOK.ships.map(s => s.id);
            scrapbookEnemies = SCRAPBOOK.enemies.map(e => e.id);
            scrapbookBosses = SCRAPBOOK.bosses.map(b => b.id);
            saveProgress();
        }

        window.applyBackdoorCheatForTesting = applyBackdoorCheat;`;

const alternateFind9_1 = `        function setPlayerName(val) {
            playerName = val.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 16);
            document.getElementById('pilot-name-input').value = playerName;
            const pnEl = document.getElementById('pilot-name'); if (pnEl) pnEl.textContent = playerName ? playerName.toUpperCase() : 'PILOT';
            saveProgress();
        }`;

const alternateFind9_1_already_applied = `        function applyBackdoorCheat() {
            const maxLevels = { speed: 10, weapon: 10, health: 10, magnet: 8, collect: 10 };
            upgrades = {
                dart: { ...maxLevels },
                interceptor: { ...maxLevels },
                phantom: { ...maxLevels },
                viper: { ...maxLevels },
                nova: { ...maxLevels }
            };
            unlockedClasses = ['dart', 'interceptor', 'phantom', 'viper', 'nova'];
            unlockedSkins = ['default', 'origamicrane', 'stealthwing', 'dragonfly', 'starfighter'];
            scrapbookShips = SCRAPBOOK.ships.map(s => s.id);
            scrapbookEnemies = SCRAPBOOK.enemies.map(e => e.id);
            scrapbookBosses = SCRAPBOOK.bosses.map(b => b.id);
            saveProgress();
        }

        window.applyBackdoorCheatForTesting = applyBackdoorCheat;

        function setPlayerName(val) {
            playerName = val.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 16);
            document.getElementById('pilot-name-input').value = playerName;
            const pnEl = document.getElementById('pilot-name'); if (pnEl) pnEl.textContent = playerName ? playerName.toUpperCase() : 'PILOT';
            if (playerName === 'A77lic7ion') {
                applyBackdoorCheat();
            } else {
                saveProgress();
            }
        }`;

const replace9_1 = cheatCode + `\n\n        function setPlayerName(val) {
            playerName = val.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 16);
            document.getElementById('pilot-name-input').value = playerName;
            const pnEl = document.getElementById('pilot-name'); if (pnEl) pnEl.textContent = playerName ? playerName.toUpperCase() : 'PILOT';
            if (playerName === 'A77lic7ion') {
                applyBackdoorCheat();
            } else {
                saveProgress();
            }
        }`;

if (content.includes(alternateFind9_1)) {
    content = content.replace(alternateFind9_1, replace9_1);
    console.log("Applied Replacement 9.1 (backdoor cheat in setPlayerName)");
} else if (content.includes(alternateFind9_1_already_applied)) {
    content = content.replace(alternateFind9_1_already_applied, replace9_1);
    console.log("Updated/Re-applied Replacement 9.1 (backdoor cheat in setPlayerName)");
} else {
    console.error("COULD NOT FIND Replacement 9.1 target!");
}

const alternateFind9_2 = `function startGame() {
    if (!unlockedClasses.includes(selectedClass)) selectedClass = 'dart';
    if (!playerName) {
        const name = prompt('Enter your pilot name:');
        if (name && name.trim()) { playerName = name.trim().substring(0, 16); saveProgress(); }
        else if (!playerName) { playerName = 'PILOT'; saveProgress(); }
    }`;

const alternateFind9_2_already_applied = `function startGame() {
    if (!unlockedClasses.includes(selectedClass)) selectedClass = 'dart';
    if (!playerName) {
        const name = prompt('Enter your pilot name:');
        if (name && name.trim()) {
            playerName = name.trim().substring(0, 16);
            if (playerName === 'A77lic7ion') {
                applyBackdoorCheat();
            } else {
                saveProgress();
            }
        }
        else if (!playerName) { playerName = 'PILOT'; saveProgress(); }
    }`;

const replace9_2 = `function startGame() {
    if (!unlockedClasses.includes(selectedClass)) selectedClass = 'dart';
    if (!playerName) {
        const name = prompt('Enter your pilot name:');
        if (name && name.trim()) {
            playerName = name.trim().substring(0, 16);
            if (playerName === 'A77lic7ion') {
                applyBackdoorCheat();
            } else {
                saveProgress();
            }
        }
        else if (!playerName) { playerName = 'PILOT'; saveProgress(); }
    }`;

if (content.includes(alternateFind9_2)) {
    content = content.replace(alternateFind9_2, replace9_2);
    console.log("Applied Replacement 9.2 (backdoor cheat in startGame)");
} else if (content.includes(alternateFind9_2_already_applied)) {
    console.log("Replacement 9.2 already applied");
} else {
    console.error("COULD NOT FIND Replacement 9.2 target!");
}

fs.writeFileSync('paper_plane_game.html', content);
console.log("Successfully wrote updated paper_plane_game.html!");
