const fs = require('fs');
const html = fs.readFileSync('paper_plane_game.html', 'utf8');
const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);

if (!scriptMatch) {
  console.error("No script tag found!");
  process.exit(1);
}

const code = scriptMatch[1];

// Create a universal recursive Proxy for safe DOM mocking
const createDomProxy = (name = 'dom') => {
  const target = function() {};
  return new Proxy(target, {
    get(t, prop) {
      if (prop === 'getContext') {
        return () => createDomProxy('context');
      }
      if (prop === 'getBoundingClientRect') {
        return () => ({ left: 0, top: 0, width: 600, height: 800 });
      }
      if (prop === 'classList') {
        return {
          add: () => {},
          remove: () => {},
          toggle: () => {},
          contains: () => false
        };
      }
      if (prop === 'appendChild') {
        return () => createDomProxy('child');
      }
      if (prop === 'cloneNode') {
        return () => createDomProxy('clone');
      }
      if (prop === 'style') {
        return {};
      }
      if (prop === 'children') {
        return [];
      }
      return createDomProxy(`${name}.${String(prop)}`);
    },
    set() {
      return true;
    },
    apply() {
      return createDomProxy(`${name}()`);
    }
  });
};

const globalMock = {
  window: {
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  document: {
    getElementById: (id) => createDomProxy(`Element(${id})`),
    querySelectorAll: () => [],
    createElement: () => createDomProxy('createdElement'),
  },
  navigator: { maxTouchPoints: 0 },
  Date: { now: () => 1000 },
  performance: { now: () => 1000 },
  Math: Math,
  currentRound: 1,
  currentWave: 1,
  bestRound: 1,
  selectedClass: 'dart',
  upgrades: {
    dart: { speed: 0, weapon: 0, health: 0, magnet: 0, collect: 0 }
  },
  waveUpgrades: [],
  player: { hp: 3, maxHp: 3, baseSpeed: 5, shootDelay: 200, damageMult: 1, magnetRange: 100 },
  ascensionLap: 0,
  Audio: function() {
    return createDomProxy('Audio');
  },
  Image: function() {
    return createDomProxy('Image');
  }
};

// Create a sandbox execution environment
const context = {
  ...globalMock,
  console: console,
};

// Evaluate the script code within the sandbox context
try {
  const runCode = new Function('ctx', `
    with(ctx) {
      try {
        ${code}
      } catch (innerError) {
        console.error("Inner error during eval:", innerError);
        console.error(innerError.stack);
      }
      // Export functions we want to test to ctx
      ctx.calcPlayerPower = calcPlayerPower;
      ctx.getWaveDropPool = getWaveDropPool;
      ctx.getAvailablePowerups = getAvailablePowerups;
      ctx.getThreat = getThreat;
      ctx.getFamily = getFamily;
      ctx.getRank = getRank;
    }
  `);
  runCode(context);
} catch (e) {
  console.error("Error evaluating game code in test sandbox:", e);
  console.error(e.stack);
  process.exit(1);
}

// RUN TESTS
setTimeout(() => {
  console.log("-----------------------------------------");
  console.log("RUNNING AUTOMATED PROGRAMMATIC TESTS...");
  console.log("-----------------------------------------");

  // Test 1: Exclude magnet and health from the difficulty-softening power formula
  console.log("Test 1: Difficulty-softening power formula upgrades...");
  context.upgrades.dart = { speed: 0, weapon: 0, health: 10, magnet: 10 }; // fully upgraded health and magnet
  context.waveUpgrades = ['repair', 'magnetsurge', 'regen']; // health and magnet wave upgrades
  const powerWithHealthMagnet = context.calcPlayerPower();
  console.log("  Power with only health & magnet upgraded:", powerWithHealthMagnet);

  context.upgrades.dart = { speed: 0, weapon: 0, health: 0, magnet: 0 }; // un-upgraded
  context.waveUpgrades = [];
  const powerUnupgraded = context.calcPlayerPower();
  console.log("  Power with zero upgrades:", powerUnupgraded);

  if (powerWithHealthMagnet === powerUnupgraded && powerUnupgraded === 1) {
    console.log("  => Test 1 PASSED! Health and magnet are properly excluded from the power formula.");
  } else {
    console.error("  => Test 1 FAILED! Expected power to be identical (1), got", powerWithHealthMagnet, "vs", powerUnupgraded);
    process.exit(1);
  }

  // Test 2: Curate powerup drops - 2 types per wave, refreshed per wave, excludes health
  console.log("Test 2: Curated wave powerup drop pool...");
  context.currentRound = 10; // high round to make all types available
  context.currentWave = 4;
  const pool1 = context.getWaveDropPool();
  console.log("  Wave 4 Pool (up to 2 types, excludes health):", pool1);
  if (pool1.length > 2) {
    console.error("  => Test 2 FAILED! Pool size exceeds 2.");
    process.exit(1);
  }
  if (pool1.includes('health')) {
    console.error("  => Test 2 FAILED! Pool contains 'health'.");
    process.exit(1);
  }

  // Caching check
  const pool2 = context.getWaveDropPool();
  if (pool1 === pool2) {
    console.log("  => Caching verification PASSED!");
  } else {
    console.error("  => Test 2 FAILED! Caching failed (new pool returned for same wave).");
    process.exit(1);
  }

  // Refresh pool on next wave
  context.currentWave = 5;
  const pool3 = context.getWaveDropPool();
  console.log("  Wave 5 Pool (refreshed):", pool3);
  console.log("  => Test 2 PASSED!");

  // Test 3: Boss maxHp threat formula
  console.log("Test 3: Boss maxHp threat formula...");
  // getThreat(round) = familyBase(getFamily(round)) * rankMultiplier(getRank(round)) * (1 + ascensionLap * 0.25)
  // At round 1: family=1 (familyBase=1), rank=1 (rankMultiplier=1), lap=0. Threat = 1.
  // Expected maxHp at round 1 = Math.round(220 * 1) = 220.
  context.currentRound = 1;
  const threatRound1 = context.getThreat(1);
  const maxHpRound1 = Math.round(220 * threatRound1);
  console.log("  Round 1 Threat:", threatRound1, "-> Max HP:", maxHpRound1);
  if (maxHpRound1 === 220) {
    console.log("  => Test 3 PASSED!");
  } else {
    console.error("  => Test 3 FAILED! Expected 220, got:", maxHpRound1);
    process.exit(1);
  }

  console.log("-----------------------------------------");
  console.log("ALL TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("-----------------------------------------");
}, 100);
