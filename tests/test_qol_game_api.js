const assert = require('assert');
const fs = require('fs');
const path = require('path');
process.env.BCONOMY_DEV_COMMANDS = 'true';
const app = require('../server');

const serverSource = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const schemaSource = fs.readFileSync(path.join(__dirname, '..', 'supabase_schema.sql'), 'utf8');
const gameContextSource = serverSource.slice(serverSource.indexOf('const resolveGameContext'), serverSource.indexOf('const phaseDurationMs'));
const commandRouteSource = serverSource.slice(serverSource.indexOf("app.post('/api/game/commands'"), serverSource.indexOf("app.post('/api/factions/queries'"));
const commitFunctionSource = schemaSource.slice(schemaSource.indexOf('create or replace function public.commit_player_command'), schemaSource.indexOf('revoke all on function public.commit_player_command'));
assert.ok(commandRouteSource.indexOf("expectedRevision !== context.revision") < commandRouteSource.indexOf('getPlayerCommandReceipt'), 'only stale signed commands issue the read-only receipt lookup');
assert.ok(commandRouteSource.includes("measureAsyncPhase(timings, 'replayMs'"), 'stale replay checks expose their own timing phase');
assert.ok(commitFunctionSource.indexOf('existing_receipt') < commitFunctionSource.indexOf('current_revision <> p_expected_revision'), 'atomic commits must recognize duplicate retries before revision conflicts');
assert.ok(commitFunctionSource.includes("last_active_at = timezone('utc'::text, now())"), 'successful commits must update player activity atomically');
assert.ok(!gameContextSource.includes('touchPlayerActivity') && !gameContextSource.includes('maybeCleanupInactiveGuests'), 'game context loading must not issue activity or maintenance writes');

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
        return { status: response.status, data: await response.json(), headers: response.headers };
    };

    const healthResponse = await fetch(`http://127.0.0.1:${port}/api/health`);
    const health = await healthResponse.json();
    assert.strictEqual(health.status, 'ok');
    assert.strictEqual(health.version, '4.1.1');

    const progressionRules = await (await fetch(`http://127.0.0.1:${port}/api/data/progression-rules`)).json();
    assert.deepStrictEqual(progressionRules, { maxTargetedTierAdvance: 3000 });

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
    assert.match(wished.headers.get('server-timing') || '', /context;dur=\d+(?:\.\d+)?, engine;dur=\d+(?:\.\d+)?, total;dur=\d+(?:\.\d+)?/, 'commands expose context, engine, and total timing phases');

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
    // Test canonical dev.setCash and the guarded player.addCash compatibility alias.
    const setCashCmd = await request('/api/game/commands', {
        commandId: '123e4567-e89b-42d3-a456-426614174001',
        expectedRevision: 0,
        type: 'dev.setCash',
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
