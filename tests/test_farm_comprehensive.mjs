/** Comprehensive farm configuration and transaction tests. */
import assert from 'node:assert/strict';
import farmEngineModule from '../src/engine/farmEngine.js';
import upgradeModule from '../src/engine/farmPlotUpgrade.js';

const { FarmEngine } = farmEngineModule;
const {
    FARM_UPGRADE_MATERIALS,
    FARM_PLOT_UPGRADE_RECIPES,
    MAX_RECIPE_EFFORT_ERROR,
    getRecipeEffortSummary,
    buildUpgradePreview
} = upgradeModule;

console.log('--- Starting Comprehensive Farm System Tests ---');
const now = 1700000000000;

assert.equal(Object.keys(FARM_UPGRADE_MATERIALS).length, 12);
assert.equal(Object.keys(FARM_PLOT_UPGRADE_RECIPES).length, 16);
for (let level = 1; level <= 16; level++) {
    const summary = getRecipeEffortSummary(level);
    assert(summary.relativeError <= MAX_RECIPE_EFFORT_ERROR, `Level ${level} recipe effort follows U(L)`);
}
assert.equal(FARM_PLOT_UPGRADE_RECIPES[16].find(entry => entry.item === 'Water Pump').quantity, 5);
console.log('✓ All 16 recipes and design-time effort targets verified');

for (const [name, material] of Object.entries(FARM_UPGRADE_MATERIALS)) {
    assert(material.description.length > 35, `${name} has a useful description`);
    assert(material.dropChance > 0 && material.dropChance <= 100, `${name} has a literal loot chance`);
    assert(material.dropStack[0] >= 1 && material.dropStack[1] >= material.dropStack[0]);
    assert(material.sellRange[1] >= material.sellRange[0]);
    assert(material.buyRange[1] >= material.buyRange[0]);
}
console.log('✓ Material descriptions, drop chances, stacks, and independent market ranges verified');

const fullInventory = {};
for (const recipe of Object.values(FARM_PLOT_UPGRADE_RECIPES)) {
    for (const requirement of recipe) {
        fullInventory[requirement.item] = (fullInventory[requirement.item] || 0) + requirement.quantity;
    }
}
const preview = buildUpgradePreview(0, fullInventory, 'max');
assert.equal(preview.maxAffordableLevel, 16);
assert.equal(preview.canUpgrade, true);
assert.equal(preview.requirements['Granular Fertilizer'], 135, 'Per-level fertilizer values total 135');
assert.equal(preview.requirements.Gravel, 7927, 'Level 1 adds its own Gravel cost to the reference levels');
console.log('✓ Max-level preview aggregates every sequential recipe');

const state = {
    cash: 123456,
    inventory: { ...fullInventory },
    perks: { water_byproducts: 0 },
    cooldowns: {},
    farm: { plots: [], storage: {}, waterAvailableAt: 0 }
};
FarmEngine.ensureFarmState(state);
assert.equal(state.farm.plots[0].level, 0);
const maxResult = FarmEngine.upgradePlot(state, 1, 'max', now, () => 0.99);
assert.equal(maxResult.level, 16);
assert.equal(maxResult.levelsGained, 16);
assert.equal(state.cash, 123456);
for (const name of Object.keys(FARM_UPGRADE_MATERIALS)) assert.equal(state.inventory[name], undefined);
console.log('✓ Full Level 0→16 transaction consumes only materials and leaves cash unchanged');

FarmEngine.plantCrop(state, 1, 'Pumpkin', now);
assert.equal(state.farm.plots[0].nextHarvestAt, now + 360000, 'Level 16 Pumpkin grows in 6 minutes');
assert.match(FarmEngine.getPlotStats(state.farm.plots[0]).crop, /Pumpkin/);
assert(!('composted' in state.farm.plots[0]));
console.log('✓ Pumpkin is a normal crop using the level-adjusted timer');

const added = FarmEngine.addPlot(state, now);
assert.equal(added.totalPlots, 2);
assert.equal(added.plot.level, 0);
assert.equal(state.cash, 123456, 'Additional plots are free for now');
const plantAll = FarmEngine.plantAllPlots(state, 'Melon', now);
assert.equal(plantAll.plantedCount, 1, 'Plant All fills every empty plot');
console.log('✓ Unlimited free plots and existing Plant All behavior verified');

console.log('--- All Comprehensive Farm System Tests Passed Successfully! ---');
