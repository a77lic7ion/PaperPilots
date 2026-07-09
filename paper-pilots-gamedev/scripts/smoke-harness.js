const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('paper_plane_game-fixed.html', 'utf8');
const ctxStub = new Proxy({}, { get: (t, k) => { if (k === 'canvas') return {}; return (...a) => ctxStub; }});
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window;
w.HTMLCanvasElement.prototype.getContext = () => ctxStub;
w.Audio = class { play(){return Promise.resolve()} pause(){} constructor(){this.volume=1;this.currentTime=0;this.loop=false} };
w.prompt = () => 'TESTPILOT';
w.confirm = () => true;
w.__rafQ = [];
w.requestAnimationFrame = cb => { w.__rafQ.push(cb); return 1; };
w.performance = { now: () => Date.now() };
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const driver = `
;window.__report = (function(){
  const out = { errors: [] };
  try {
    out.fleetCards = document.querySelectorAll('.ss-ship-card').length;
    selectClass('interceptor');            // locked, no cores — should flash, not select
    out.selectedAfterLockedTap = selectedClass;
    totalCores = 99999; selectClass('interceptor');  // now affordable
    out.selectedAfterPurchase = selectedClass;
    out.coresAfterPurchase = totalCores;
    selectClass('dart');
    startGame();
    out.stateAfterStart = gameState;
    for (let f = 0; f < 600; f++) {
      const q = window.__rafQ; window.__rafQ = [];
      for (const cb of q) cb();
      if (f === 300) lastWaveTick = Date.now() - 31000;  // force a wave advance mid-run
    }
    out.frames = frameCount;
    out.enemies = enemies.length;
    out.enemyBullets = enemyBullets.length;
    out.playerBullets = bullets.length;
    out.wave = currentWave;
    out.playerAlive = player && player.hp > 0;
    // pause → save&quit → continue path
    showPause(); saveAndQuit();
    out.menuAfterQuit = gameState;
    const rd = loadProgress();
    out.savedRunFound = !!rd;
    out.savedRunShape = rd ? Object.keys(rd).slice(0,6).join(',') : 'none';
    continueRun();
    out.stateAfterContinue = gameState;
    out.continueWorked = gameState === 'playing';
  } catch (e) { out.errors.push(e.message + ' @ ' + (e.stack||'').split('\\n')[1]); }
  return out;
})();`;
try { w.eval(script + driver); } catch (e) { console.log('BOOT ERROR:', e.message, '\n', (e.stack||'').split('\n').slice(0,5).join('\n')); process.exit(1); }
console.log(JSON.stringify(w.__report, null, 1));
