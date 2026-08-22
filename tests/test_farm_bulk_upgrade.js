const assert = require('assert');
const app = require('../server');
const { FarmEngine } = require('../src/engine/farmEngine');
const { FARM_PLOT_UPGRADE_RECIPES } = require('../src/engine/farmPlotUpgrade');

console.log('--- Running Farm Bulk Upgrade Engine & API Tests ---');

const addRecipe = (inventory, level, multiplier = 1) => {
    for (const requirement of FARM_PLOT_UPGRADE_RECIPES[level]) {
        inventory[requirement.item] = (inventory[requirement.item] || 0) + (requirement.quantity * multiplier);
    }
};

const t0 = 1700000000000;
const createState = () => ({
    cash: 987654,
    inventory: {},
    perks: { water_byproducts: 0 },
    cooldowns: {},
    farm: {
        waterAvailableAt: 0,
        markedPlotIds: [2, 2, 999, '1'],
        storage: {},
        plots: [
            { id: 1, level: 0, crop: null, plantedAt: 0, nextHarvestAt: 0 },
            { id: 2, level: 0, crop: 'Blueberry', plantedAt: t0, nextHarvestAt: t0 + 20000 },
            { id: 3, level: 16, crop: null, plantedAt: 0, nextHarvestAt: 0 }
        ]
    }
});

const normalized = createState();
FarmEngine.ensureFarmState(normalized);
assert.deepEqual(normalized.farm.markedPlotIds, [2], 'Marks retain unique existing numeric plot IDs');

const previewState = createState();
addRecipe(previewState.inventory, 1, 2);
const previewSnapshot = JSON.stringify(previewState);
const preview = FarmEngine.previewBulkPlotUpgrade(previewState, 'all', undefined, 'next');
assert.equal(preview.success, true);
assert.equal(preview.upgradedPlotCount, 2);
assert.equal(preview.maxedPlotCount, 1);
assert.equal(JSON.stringify(previewState), previewSnapshot, 'Bulk preview does not mutate state');

const executeState = createState();
addRecipe(executeState.inventory, 1, 2);
const cashBefore = executeState.cash;
const execution = FarmEngine.upgradePlotsBulk(executeState, 'all', undefined, 'next', t0 + 19500, () => 0.99);
assert.equal(execution.success, true);
assert.equal(execution.totalLevelsGained, 2);
assert.equal(executeState.farm.plots[0].level, 1);
assert.equal(executeState.farm.plots[1].level, 1);
assert.equal(executeState.farm.plots[2].level, 16);
assert.equal(execution.totalCatchUpCycles, 1, 'Reduced active cycle is caught up after the atomic level change');
assert.equal(executeState.farm.storage.Blueberry, 3);
assert.equal(executeState.cash, cashBefore, 'Bulk plot upgrades never consume cash');
assert.deepEqual(executeState.farm.markedPlotIds, [2], 'Execution preserves normalized marks');

const rejectedState = createState();
const rejectedSnapshot = JSON.stringify(rejectedState);
const rejected = FarmEngine.upgradePlotsBulk(rejectedState, 'selected', [1, 2], 'next', t0);
assert.match(rejected.error, /No selected plot/);
assert.equal(JSON.stringify(rejectedState), rejectedSnapshot, 'Zero-upgrade execution is transactionally unchanged');
assert.match(FarmEngine.previewBulkPlotUpgrade(createState(), 'selected', [99], 'next').error, /Unavailable/);
assert.match(FarmEngine.previewBulkPlotUpgrade(createState(), 'selected', [1.5], 'next').error, /positive safe integers/);

const server = app.listen(0, '127.0.0.1');
(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address();
    const post = async (path, body) => {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return { status: response.status, data: await response.json() };
    };

    const apiState = createState();
    addRecipe(apiState.inventory, 1, 2);
    const apiSnapshot = JSON.stringify(apiState);
    const apiPreview = await post('/api/farm/upgrade-bulk-preview', {
        playerState: apiState,
        scope: 'selected',
        plotIds: [2, 1, 1],
        mode: 'next'
    });
    assert.equal(apiPreview.status, 200);
    assert.deepEqual(apiPreview.data.result.requestedPlotIds, [1, 2]);
    assert.equal(apiPreview.data.state, undefined);
    assert.equal(JSON.stringify(apiState), apiSnapshot);

    const apiExecution = await post('/api/farm/upgrade-bulk', {
        playerState: apiState,
        scope: 'selected',
        plotIds: [1, 2],
        mode: 'next'
    });
    assert.equal(apiExecution.status, 200);
    assert.equal(apiExecution.data.result.totalLevelsGained, 2);
    assert.equal(apiExecution.data.state.farm.plots[0].level, 1);

    const badMode = await post('/api/farm/upgrade-bulk-preview', {
        playerState: apiState,
        scope: 'all',
        mode: 'everything'
    });
    assert.equal(badMode.status, 400);

    const missingState = await post('/api/farm/upgrade-bulk-preview', { scope: 'all', mode: 'next' });
    assert.equal(missingState.status, 400);

    console.log('✓ Mark normalization, preview purity, atomic execution, catch-up, and both endpoints verified');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
