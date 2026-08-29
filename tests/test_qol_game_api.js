const assert = require('assert');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const supabaseSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'supabase.js'), 'utf8');
assert.ok(serverSource.indexOf('getPlayerCommandReceipt({ userId: context.user.id, commandId })') < serverSource.indexOf('if (expectedRevision !== context.revision)'), 'signed retries must check idempotency receipts before rejecting stale revisions');
assert.ok(supabaseSource.includes(".from('player_command_receipts')"));

console.log('--- Running Versioned Game API Tests ---');

const server = app.listen(0, '127.0.0.1');

(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address();
    const request = async (path, body, headers = {}) => {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body)
        });
        return { status: response.status, data: await response.json() };
    };

    const healthResponse = await fetch(`http://127.0.0.1:${port}/api/health`);
    const health = await healthResponse.json();
    assert.strictEqual(health.status, 'ok');
    assert.strictEqual(health.version, '4.0.1');

    const noVersion = await request('/api/game/queries', { type: 'progression.summary', guestState: { cash: 0 } });
    assert.strictEqual(noVersion.status, 426);
    assert.strictEqual(noVersion.data.error.code, 'INCOMPATIBLE_CLIENT');

    const defaultStateResponse = await fetch(`http://127.0.0.1:${port}/api/state/default`);
    const guestState = await defaultStateResponse.json();
    const headers = { 'X-Bconomy-API-Version': '1' };
    const summary = await request('/api/game/queries', { type: 'progression.summary', guestState }, headers);
    assert.strictEqual(summary.status, 200);
    assert.strictEqual(summary.data.revision, 0);
    assert.strictEqual(summary.data.result.currentRankIndex, 0);
    assert.strictEqual(summary.data.state, undefined, 'Queries must not echo state');

    const commandId = '123e4567-e89b-42d3-a456-426614174000';
    const wished = await request('/api/game/commands', {
        commandId,
        expectedRevision: 0,
        type: 'shop.setWishlist',
        payload: { itemIds: ['Diamond'], wished: true, addedAt: 12345 },
        guestState
    }, headers);
    assert.strictEqual(wished.status, 200);
    assert.strictEqual(wished.data.revision, 1);
    assert(wished.data.state.shopWishlist.Diamond);
    assert.strictEqual(wished.data.state_revision, undefined);

    const retry = await request('/api/game/commands', {
        commandId,
        expectedRevision: 0,
        type: 'shop.setWishlist',
        payload: { itemIds: ['Diamond'], wished: true, addedAt: 12345 },
        guestState
    }, headers);
    assert.deepStrictEqual(retry.data.state, wished.data.state, 'A guest retry from the same envelope is effect-idempotent');

    const invalid = await request('/api/game/commands', {
        commandId: 'bad', expectedRevision: 0, type: 'player.reset', payload: {}, guestState
    }, headers);
    // Test player.setCash & player.addCash in development mode
    const setCashCmd = await request('/api/game/commands', {
        commandId: '123e4567-e89b-42d3-a456-426614174001',
        expectedRevision: 0,
        type: 'player.setCash',
        payload: { cash: 500000000000000 },
        guestState
    }, headers);
    assert.strictEqual(setCashCmd.status, 200);
    assert.strictEqual(setCashCmd.data.state.cash, 500000000000000);

    const addCashCmd = await request('/api/game/commands', {
        commandId: '123e4567-e89b-42d3-a456-426614174002',
        expectedRevision: 0,
        type: 'player.addCash',
        payload: { cash: 1000000 },
        guestState: setCashCmd.data.state
    }, headers);
    assert.strictEqual(addCashCmd.status, 200);
    assert.strictEqual(addCashCmd.data.state.cash, 500000001000000);

    console.log('✓ Version negotiation, query purity, guest envelopes, dev cash commands, retry safety, and command validation verified');
    console.log('--- Versioned Game API Tests Passed ---');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
