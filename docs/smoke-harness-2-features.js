const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('paper_plane_game-fixed.html', 'utf8');
const ctxStub = new Proxy({}, { get: (t, k) => { if (k === 'canvas') return {}; return (...a) => ctxStub; }});
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window;
w.HTMLCanvasElement.prototype.getContext = () => ctxStub;
w.Audio = class { play(){return Promise.resolve()} pause(){} constructor(){this.volume=1;this.currentTime=0;this.loop=false} };
w.prompt = () => 'TESTPILOT'; w.confirm = () => true;
w.__rafQ = [];
w.requestAnimationFrame = cb => { w.__rafQ.push(cb); return 1; };
w.performance = { now: () => Date.now() };
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const driver = `
;window.__report = (function(){
  const out = { errors: [] };
  const pump = n => { for (let f=0; f<n; f++){ const q=window.__rafQ; window.__rafQ=[]; for (const cb of q) cb(); } };
  try {
    startGame();
    pump(60);
    // Weapon evolution: base L1, pickup evolves, hit decays
    out.evoStart = player.weaponEvo;
    activatePowerUp('evolve'); activatePowerUp('evolve');
    out.evoAfterTwoPickups = player.weaponEvo;
    player.iFramesUntil = 0; player.shielded = false; player.takeDamage();
    out.evoAfterHit = player.weaponEvo;
    out.hpAfterHit = player.hp;
    // new powerups
    activatePowerUp('speedup'); out.speedActive = Date.now() < player.speedUntil;
    const bombsBefore = bombCharges; activatePowerUp('bombup'); out.bombGained = bombCharges === bombsBefore + 1;
    // economy: collector multiplier at L0 and L10
    out.collectL0 = collectMult();
    upgrades[selectedClass].collect = 10; out.collectL10 = collectMult();
    upgrades[selectedClass].collect = 0;
    // Boss durability: spawn round-1 boss, fire straight bullets into core, count shots to kill
    boss = new Boss(1); boss.state = 'active'; boss.x = width/2; boss.y = 150;
    out.bossMaxHp = boss.maxHp;
    let shots = 0;
    while (boss && boss.hp > 0 && shots < 5000) {
      bullets.push(new Bullet(boss.x, boss.y, 0, true, player.damageMult, {}));
      shots++; pump(1);
      if (!boss) break;
    }
    out.bossShotsToKill = shots;
    // resume-after-shop flow
    if (gameState !== 'playing') { gameState = 'playing'; }
    showPause(); saveAndQuit();
    showShop(); totalCores = 5000; buyUpgrade('collect');   // menu-time save — must NOT wipe the run
    showStartScreen();
    out.resumeVisibleAfterShop = document.getElementById('continue-btn').style.display;
    continueRun();
    out.resumedAfterShop = gameState === 'playing';
    out.evoAfterResume = player.weaponEvo;
  } catch (e) { out.errors.push(e.message + ' @ ' + (e.stack||'').split('\\n')[1]); }
  return out;
})();`;
try { w.eval(script + driver); } catch (e) { console.log('BOOT ERROR:', e.message); process.exit(1); }
console.log(JSON.stringify(w.__report, null, 1));
