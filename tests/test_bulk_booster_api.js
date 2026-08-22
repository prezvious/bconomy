const assert = require('assert');
const app = require('../server');

console.log('--- Running Bulk Booster API Tests ---');

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

    const playerState = {
        inventory: { 'Prospector Kit': 2, 'Survey Pack': 1, Rock: 5 },
        boosters: { activeUntil: { mine: { T1: 0 }, explore: { T1: 0 }, hunt: {}, fish: {} } }
    };
    const snapshot = JSON.stringify(playerState);

    const preview = await post('/api/booster/bulk/preview', {
        playerState,
        options: { mode: 'allOwned' }
    });
    assert.strictEqual(preview.status, 200);
    assert.strictEqual(preview.data.result.totalUnits, 3);
    assert.strictEqual(preview.data.state, undefined, 'Preview must not return normalized or mutated state');
    assert.strictEqual(JSON.stringify(playerState), snapshot, 'Client preview fixture remains unchanged');
    console.log('✓ Preview endpoint returns a non-consuming activation plan');

    const execute = await post('/api/booster/bulk/execute', {
        playerState,
        options: { mode: 'oneEach' }
    });
    assert.strictEqual(execute.status, 200);
    assert.strictEqual(execute.data.result.totalUnits, 2);
    assert.strictEqual(execute.data.state.inventory['Prospector Kit'], 1);
    assert.strictEqual(execute.data.state.inventory['Survey Pack'], undefined);
    assert.ok(execute.data.state.boosters.activeUntil.mine.T1 > execute.data.result.activationTime);
    assert.ok(execute.data.state.boosters.activeUntil.explore.T1 > execute.data.result.activationTime);
    console.log('✓ Execute endpoint returns atomically updated inventory and expiries');

    const staleState = JSON.parse(snapshot);
    const staleSnapshot = JSON.stringify(staleState);
    const invalid = await post('/api/booster/bulk/execute', {
        playerState: staleState,
        options: { mode: 'custom', quantities: { 'Prospector Kit': 99 } }
    });
    assert.strictEqual(invalid.status, 400);
    assert.match(invalid.data.error, /only 2 owned/);
    assert.strictEqual(JSON.stringify(staleState), staleSnapshot);

    const missing = await post('/api/booster/bulk/preview', { options: { mode: 'allOwned' } });
    assert.strictEqual(missing.status, 400);
    assert.match(missing.data.error, /playerState/);

    const missingOptions = await post('/api/booster/bulk/preview', { playerState });
    assert.strictEqual(missingOptions.status, 400);
    assert.match(missingOptions.data.error, /options/);

    const unsafeQuantity = await post('/api/booster/bulk/execute', {
        playerState,
        options: { mode: 'custom', quantities: { 'Prospector Kit': '1' } }
    });
    assert.strictEqual(unsafeQuantity.status, 400);
    assert.match(unsafeQuantity.data.error, /quantity/);

    const empty = await post('/api/booster/bulk/preview', {
        playerState: { inventory: { Rock: 4 } },
        options: { mode: 'allOwned' }
    });
    assert.strictEqual(empty.status, 400);
    assert.match(empty.data.error, /No boosters selected/);
    console.log('✓ Invalid, stale, and missing-state API requests fail cleanly');

    console.log('--- Bulk Booster API Tests Passed ---');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
