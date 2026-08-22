/** Unit and integration tests for level-aware FarmEngine behavior. */
const assert = require('assert');
const { FarmEngine } = require('../src/engine/farmEngine');

const noBurst = () => 0.99;
const now = 1700000000000;

const createState = () => ({
    cash: 5000,
    inventory: {},
    perks: { water_byproducts: 0 },
    cooldowns: { work: 0, mine: 0, explore: 0, hunt: 0, fish: 0 },
    farm: { waterAvailableAt: 0, storage: {}, plots: [] }
});

console.log('--- Starting FarmEngine Unit Tests ---');

// Normalization creates one baseline plot and strips legacy farm flags.
const state = createState();
state.farm.plots = [{ id: 1, level: 99, crop: null, plantedAt: 0, nextHarvestAt: 0, composted: true, watered: true }];
FarmEngine.ensureFarmState(state);
assert.strictEqual(state.farm.plots.length, 1);
assert.strictEqual(state.farm.plots[0].level, 16);
assert.strictEqual('composted' in state.farm.plots[0], false);
assert.strictEqual('watered' in state.farm.plots[0], false);
state.farm.plots[0].level = 0;
console.log('✓ Plot state normalization and legacy-field removal passed');

// Level 0 and Level 16 planting durations use 0% and 80% reductions.
FarmEngine.plantCrop(state, 1, 'Blueberry', now);
assert.strictEqual(state.farm.plots[0].nextHarvestAt, now + 20000);
FarmEngine.uprootPlot(state, 1, now);
state.farm.plots[0].level = 16;
FarmEngine.plantCrop(state, 1, 'Blueberry', now);
assert.strictEqual(state.farm.plots[0].nextHarvestAt, now + 4000);
assert.deepStrictEqual(FarmEngine.getPlotStats(state.farm.plots[0]), {
    level: 16,
    reductionPercent: 80,
    maximumLevelReached: true,
    crop: 'Blueberry',
    baseYield: 3,
    baseGrowTimeMs: 20000,
    effectiveGrowTimeMs: 4000
});
console.log('✓ Level-adjusted planting duration passed');

// Offline auto-repeat catch-up uses the adjusted cycle duration.
FarmEngine.processFarmState(state, now + 12500, noBurst);
assert.strictEqual(state.farm.storage.Blueberry, 9);
assert.strictEqual(state.farm.plots[0].plantedAt, now + 12000);
assert.strictEqual(state.farm.plots[0].nextHarvestAt, now + 16000);
console.log('✓ Level-adjusted offline catch-up passed');

// Upgrade recalculates from the current cycle start and immediately settles catch-up.
const upgradeState = createState();
upgradeState.farm.plots = [{ id: 1, level: 0, crop: 'Blueberry', plantedAt: now, nextHarvestAt: now + 20000 }];
upgradeState.inventory = { Gravel: 340, 'Fence Post': 34, 'Irrigation Tubing': 2 };
const upgraded = FarmEngine.upgradePlot(upgradeState, 1, 'next', now + 19500, noBurst);
assert.strictEqual(upgraded.success, true);
assert.strictEqual(upgraded.level, 1);
assert.strictEqual(upgraded.catchUpCycles, 1);
assert.strictEqual(upgradeState.farm.storage.Blueberry, 3);
assert.strictEqual(upgradeState.farm.plots[0].nextHarvestAt, now + 38000);
assert.strictEqual(upgradeState.cash, 5000, 'Plot upgrades never spend cash');
assert.strictEqual(upgradeState.inventory.Gravel, undefined);
console.log('✓ Active-crop upgrade recalculation and material-only spending passed');

// Upgrade-to-max consumes only the affordable sequential prefix.
const maxState = createState();
maxState.farm.plots = [FarmEngine.createEmptyPlot(1)];
maxState.inventory = {
    Gravel: 340 + 342,
    'Fence Post': 34 + 35,
    'Irrigation Tubing': 2 + 2
};
const maxUpgrade = FarmEngine.upgradePlot(maxState, 1, 'max', now, noBurst);
assert.strictEqual(maxUpgrade.level, 2);
assert.strictEqual(maxUpgrade.levelsGained, 2);
assert.strictEqual(maxState.inventory.Gravel, undefined);
assert.strictEqual(maxState.cash, 5000);
console.log('✓ Upgrade-as-far-as-possible stops at the first unaffordable level');

// Global water performs all accelerated cycles and preserves remainder.
const waterState = createState();
waterState.perks.water_byproducts = 2; // +30% per accelerated cycle
waterState.farm.plots = [{ id: 1, level: 12, crop: 'Blueberry', plantedAt: now, nextHarvestAt: now + 8000 }];
const water = FarmEngine.waterAllPlots(waterState, now, noBurst);
assert.strictEqual(water.acceleratedCycles, 225);
// With corrected rounding: accumulate fractional yield across 225 cycles, round once.
// waterMultiplier = 1 + 2*0.15 = 1.30; baseYield=3 for Blueberry
assert.strictEqual(water.totalHarvested, 878); // round(3 * 1.30 * 225) = round(877.5) = 878
assert.strictEqual(waterState.farm.storage.Blueberry, 878);
assert.strictEqual(water.byproducts.Weeds, 585); // round(2 * 1.30 * 225) = round(585) = 585
assert.strictEqual(water.byproducts.RedMushroom, 293); // round(1 * 1.30 * 225) = round(292.5) = 293
assert.strictEqual(waterState.farm.plots[0].nextHarvestAt, now + 8000);
console.log('✓ Global watering awards every accelerated cycle and preserves remainder');

// Uproot one and same-crop discard planted crops while preserving storage.
const uprootState = createState();
uprootState.farm.storage.Blueberry = 50;
uprootState.farm.plots = [
    { id: 1, level: 0, crop: 'Blueberry', plantedAt: now, nextHarvestAt: now + 20000 },
    { id: 2, level: 4, crop: 'Blueberry', plantedAt: now, nextHarvestAt: now + 16000 },
    { id: 3, level: 0, crop: 'Coffee', plantedAt: now, nextHarvestAt: now + 300000 }
];
assert.strictEqual(FarmEngine.uprootPlot(uprootState, 1, now).uprootedCrop, 'Blueberry');
const bulkUproot = FarmEngine.uprootSameCrop(uprootState, 'Blueberry', now);
assert.strictEqual(bulkUproot.uprootedCount, 1);
assert.strictEqual(uprootState.farm.plots[2].crop, 'Coffee');
assert.strictEqual(uprootState.farm.storage.Blueberry, 50);
console.log('✓ Single and same-crop uprooting discard plots without touching storage');

// Existing crop claim effects remain intact.
uprootState.farm.storage['Golden Wheat'] = 10;
uprootState.farm.storage.Coffee = 5;
uprootState.cooldowns.work = now + 60000;
const claim = FarmEngine.claimCrops(uprootState, 'all', now);
assert.strictEqual(claim.cashBonus, 100000);
assert.strictEqual(claim.caffeineTriggered, true);
assert.strictEqual(claim.cooldownReductionMs, 1000);
assert.strictEqual(uprootState.cooldowns.work, now + 59000);
console.log('✓ Crop storage claim effects remain intact');

console.log('--- All FarmEngine Unit Tests Passed Successfully! ---');
