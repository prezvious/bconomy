const assert = require('assert');
const { FarmEngine } = require('../src/engine/farmEngine');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { PERK_DEFINITIONS } = require('../src/engine/dropTables');

console.log('--- Starting Farm Water Abundance Unit Tests ---');

const createState = perkLevel => ({
    cash: 100000,
    prestigeCount: 1,
    prestigePoints: 20,
    inventory: {},
    perks: { water_byproducts: perkLevel },
    cooldowns: {},
    farm: {
        waterAvailableAt: 0,
        storage: {},
        plots: [{ id: 1, level: 12, crop: null, plantedAt: 0, nextHarvestAt: 0 }]
    }
});

assert.strictEqual(PERK_DEFINITIONS.water_byproducts.maxLevel, 10);
const perkState = createState(0);
for (let level = 1; level <= 10; level++) {
    assert.strictEqual(RankPrestigeEngine.upgradePerk(perkState, 'water_byproducts').success, true);
}
assert.strictEqual(perkState.perks.water_byproducts, 10);
assert.strictEqual(RankPrestigeEngine.upgradePerk(perkState, 'water_byproducts').error, 'Perk is already at max level');
console.log('✓ Water Abundance upgrade cap remains Level 10');

const noBurst = () => 0.99;
const now = 2000000000;
// Expected totals: accumulate fractional yield across all 225 cycles, then round once.
// baseYield=3 for Blueberry, waterMultiplier = 1 + level*0.15
// Weeds base=2, RedMushroom base=1
for (const expectation of [
    { level: 0, totalYield: 675, totalWeeds: 450, totalMushrooms: 225 },
    { level: 5, totalYield: 1181, totalWeeds: 788, totalMushrooms: 394 },
    { level: 10, totalYield: 1688, totalWeeds: 1125, totalMushrooms: 563 }
]) {
    const state = createState(expectation.level);
    FarmEngine.plantCrop(state, 1, 'Blueberry', now);
    const result = FarmEngine.waterAllPlots(state, now, noBurst);
    assert.strictEqual(result.acceleratedCycles, 225);
    assert.strictEqual(result.totalHarvested, expectation.totalYield);
    assert.strictEqual(result.byproducts.Weeds, expectation.totalWeeds);
    assert.strictEqual(result.byproducts.RedMushroom, expectation.totalMushrooms);
    assert.strictEqual(result.waterYieldBonusPercent, expectation.level * 15);
    assert.strictEqual(state.farm.plots[0].nextHarvestAt, now + 8000);
}
console.log('✓ Yield bonus and both byproducts multiply across every accelerated cycle');

// A 30-minute skip that completes no cycle advances progress but awards nothing.
const slowState = createState(10);
slowState.farm.plots = [{ id: 1, level: 0, crop: 'Pumpkin', plantedAt: now, nextHarvestAt: now + 3600000 }];
const slow = FarmEngine.waterAllPlots(slowState, now, noBurst);
assert.strictEqual(slow.acceleratedCycles, 0);
assert.strictEqual(slow.totalHarvested, 0);
assert.deepStrictEqual(slow.byproducts, { Weeds: 0, RedMushroom: 0 });
assert.strictEqual(slowState.farm.plots[0].plantedAt, now - 1800000);
assert.strictEqual(slowState.farm.plots[0].nextHarvestAt, now + 1800000);
console.log('✓ Partial-cycle watering progress is preserved without phantom rewards');

// Every plot is accelerated by the same fixed duration in a single global action.
const bulkState = createState(0);
bulkState.farm.plots = [
    { id: 1, level: 12, crop: 'Blueberry', plantedAt: now, nextHarvestAt: now + 8000 },
    { id: 2, level: 0, crop: 'Melon', plantedAt: now, nextHarvestAt: now + 900000 }
];
const bulk = FarmEngine.waterAllPlots(bulkState, now, noBurst);
assert.strictEqual(bulk.wateredCount, 2);
assert.strictEqual(bulk.acceleratedCycles, 227); // 225 Blueberry + 2 Melon
assert.strictEqual(bulkState.farm.storage.Melon, 10);
assert.strictEqual(bulkState.farm.waterAvailableAt, now + 600000);
assert.strictEqual(FarmEngine.waterAllPlots(bulkState, now + 1, noBurst).error, 'Watering is on global cooldown');
console.log('✓ Global fixed-duration acceleration and cooldown gating verified');

console.log('--- ALL FARM WATER ABUNDANCE TESTS PASSED CLEANLY! ---');
