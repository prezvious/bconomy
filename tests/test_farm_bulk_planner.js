const assert = require('assert');
const {
    FARM_PLOT_UPGRADE_RECIPES,
    buildBulkUpgradePlan
} = require('../src/engine/farmPlotUpgrade');

console.log('--- Running Farm Bulk Upgrade Planner Tests ---');

const inventoryFor = levels => {
    const inventory = {};
    for (const level of levels) {
        for (const requirement of FARM_PLOT_UPGRADE_RECIPES[level]) {
            inventory[requirement.item] = (inventory[requirement.item] || 0) + requirement.quantity;
        }
    }
    return inventory;
};

const oneEach = buildBulkUpgradePlan(
    [{ id: 3, level: 0 }, { id: 1, level: 0 }, { id: 2, level: 0 }],
    inventoryFor([1, 1]),
    'next'
);
assert.equal(oneEach.valid, true);
assert.equal(oneEach.totalLevelsGained, 2);
assert.deepEqual(oneEach.plotResults.filter(result => result.levelsGained).map(result => result.plotId), [1, 2]);
assert.equal(oneEach.plotResults.find(result => result.plotId === 3).status, 'insufficient-materials');

const balanced = buildBulkUpgradePlan(
    [{ id: 1, level: 0 }, { id: 2, level: 0 }],
    inventoryFor([1, 1, 2]),
    'max'
);
assert.deepEqual(balanced.plotResults.map(result => result.targetLevel), [2, 1]);
assert.equal(balanced.totalLevelsGained, 3);

const levelPriorityInventory = inventoryFor([1, 2, 3, 4, 5, 6]);
const levelPriority = buildBulkUpgradePlan(
    [{ id: 1, level: 0 }, { id: 2, level: 5 }],
    levelPriorityInventory,
    'max'
);
assert.deepEqual(levelPriority.plotResults.map(result => result.targetLevel), [6, 5], 'Priority is recalculated after every level and plot ID breaks the tie');

const mixed = buildBulkUpgradePlan(
    [{ id: 1, level: 16 }, { id: 2, level: 4 }, { id: 3, level: 9 }],
    inventoryFor([10]),
    'next'
);
assert.equal(mixed.maxedPlotCount, 1);
assert.equal(mixed.plotResults.find(result => result.plotId === 3).targetLevel, 10);
assert.equal(mixed.plotResults.find(result => result.plotId === 2).targetLevel, 4);

const sourcePlots = [{ id: 2, level: 0 }, { id: 1, level: 0 }];
const sourceInventory = inventoryFor([1]);
const snapshot = JSON.stringify({ sourcePlots, sourceInventory });
const preview = buildBulkUpgradePlan(sourcePlots, sourceInventory, 'next');
assert.equal(preview.canUpgrade, true);
assert.equal(JSON.stringify({ sourcePlots, sourceInventory }), snapshot, 'Planner is non-mutating');

assert.equal(buildBulkUpgradePlan([], {}, 'next').valid, false);
assert.equal(buildBulkUpgradePlan([{ id: 1, level: 17 }], {}, 'next').valid, false);
assert.equal(buildBulkUpgradePlan([{ id: 1, level: 0 }], {}, 'invalid').valid, false);

console.log('✓ Balanced next/max allocation, tie-breaking, skipping, and preview purity verified');
