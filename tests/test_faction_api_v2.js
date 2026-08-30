'use strict';

const assert = require('node:assert/strict');
const { validateFactionExpected } = require('../src/api/factionCommandV2');

const factionId = '123e4567-e89b-42d3-a456-426614174200';
const userId = '123e4567-e89b-42d3-a456-426614174201';
const commandId = '123e4567-e89b-42d3-a456-426614174202';

assert.equal(validateFactionExpected('faction.deposit', { factionId }).ok, true);
assert.equal(validateFactionExpected('faction.create', { factionId: null }).ok, true);
assert.equal(validateFactionExpected('faction.membership_mode.set', { factionId, membershipMode: 'invite_only' }).ok, true);
assert.equal(validateFactionExpected('faction.membership_mode.set', { factionId }).ok, false);
assert.equal(validateFactionExpected('faction.membership_mode.set', { factionId, membershipMode: 'public', revision: 4 }).ok, false);
assert.equal(validateFactionExpected('faction.member.remove', { factionId, targetMember: { playerId: 8, factionRank: 'private' } }).ok, true);
assert.equal(validateFactionExpected('faction.boost.activate', { factionId, boost: { actionType: 'mine', configRevision: 0 } }).ok, true);
assert.equal(validateFactionExpected('faction.code.generate', { factionId, membershipMode: 'code_only', accessCodeVersion: null }).ok, true);
assert.equal(validateFactionExpected('faction.customize', { factionId, name: '🏰'.repeat(32), description: '🏰'.repeat(160) }).ok, true, 'PostgreSQL character limits count Unicode code points');

delete process.env.BCONOMY_DEV_COMMANDS;
process.env.NODE_ENV = 'test';
const supabasePath = require.resolve('../src/db/supabase');
const factionsPath = require.resolve('../src/db/factions');
const realSupabase = require(supabasePath);
const realFactions = require(factionsPath);
const v1Calls = [];
const v2Calls = [];

require.cache[supabasePath].exports = {
    ...realSupabase,
    verifyAccessToken: async token => token === 'faction-v2-token' ? { id: userId } : null,
    touchPlayerActivity: async () => true,
    lookupProfileByUserId: async () => ({
        status: 'found',
        profile: { id: userId, account_kind: 'registered', last_active_at: new Date().toISOString(), state_revision: 6, state: { cash: 6 } }
    })
};

require.cache[factionsPath].exports = {
    ...realFactions,
    cleanupInactiveGuests: async () => ({ status: 'ok', deletedCount: 0 }),
    migrateLegacyFaction: async () => ({ status: 'duplicate', playerState: { cash: 7 }, playerRevision: 7 }),
    getFactionSnapshot: async () => ({ status: 'ok', faction: { id: factionId, membershipMode: 'public' } }),
    executeFactionCommand: async input => {
        v1Calls.push(input);
        return { status: 'applied', result: { bridge: true }, snapshot: { status: 'ok' }, playerRevision: 7, playerState: {} };
    },
    executeFactionCommandV2: async input => {
        v2Calls.push(input);
        if (input.payload.conflict) {
            return {
                status: 'conflict',
                code: 'FACTION_PRECONDITION_FAILED',
                message: 'changed',
                details: { precondition: 'membershipMode' }
            };
        }
        return { status: 'applied', result: { membershipMode: 'public' }, snapshot: { status: 'ok' }, playerRevision: 7, playerState: {} };
    }
};

const app = require('../server');
const server = app.listen(0, '127.0.0.1');

async function post(version, body) {
    const headers = { Authorization: 'Bearer faction-v2-token', 'Content-Type': 'application/json' };
    if (version !== null) headers['X-Bconomy-API-Version'] = version;
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/factions/commands`, {
        method: 'POST', headers, body: JSON.stringify(body)
    });
    return { status: response.status, headers: response.headers, body: await response.json() };
}

async function query(version, body) {
    const headers = { Authorization: 'Bearer faction-v2-token', 'Content-Type': 'application/json' };
    if (version !== null) headers['X-Bconomy-API-Version'] = version;
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/factions/queries`, {
        method: 'POST', headers, body: JSON.stringify(body)
    });
    return { status: response.status, headers: response.headers, body: await response.json() };
}

(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    const body = {
        commandId,
        expectedRevision: 7,
        type: 'faction.membership_mode.set',
        payload: { membershipMode: 'public' },
        expected: { factionId, membershipMode: 'invite_only' }
    };

    const missingVersion = await post(null, body);
    assert.equal(missingVersion.status, 426);

    const snapshot = await query('2', { type: 'faction.snapshot', payload: {}, knownRevision: 6 });
    assert.equal(snapshot.status, 200);
    assert.equal(snapshot.body.revision, 7);
    assert.equal(snapshot.body.state.cash, 7, 'query responses use the migration RPC\'s locked authoritative state');
    assert.equal(snapshot.body.result.faction.membershipMode, 'public');

    const unchangedSnapshot = await query('2', { type: 'faction.snapshot', payload: {}, knownRevision: 7 });
    assert.equal(unchangedSnapshot.status, 200);
    assert.equal(unchangedSnapshot.body.revision, 7);
    assert.equal(unchangedSnapshot.body.state, undefined, 'unchanged queries do not resend the full player save');

    const invalidExpected = await post('2', { ...body, expected: { factionId } });
    assert.equal(invalidExpected.status, 400);
    assert.equal(invalidExpected.body.error.code, 'INVALID_FACTION_EXPECTATION');
    assert.equal(v2Calls.length, 0);

    const applied = await post('2', body);
    assert.equal(applied.status, 200);
    assert.equal(v2Calls.length, 1);
    assert.deepEqual(v2Calls[0].expected, body.expected);
    assert.equal(v1Calls.length, 0);

    const conflict = await post('2', { ...body, commandId: '123e4567-e89b-42d3-a456-426614174203', payload: { membershipMode: 'public', conflict: true } });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.error.code, 'FACTION_PRECONDITION_FAILED');
    assert.equal(conflict.body.error.details.precondition, 'membershipMode');
    assert.equal(conflict.body.snapshot.faction.membershipMode, 'public');

    const v1 = await post('1', { ...body, commandId: '123e4567-e89b-42d3-a456-426614174204', expectedFactionRevision: 9 });
    assert.equal(v1.status, 200);
    assert.equal(v1.headers.get('deprecation'), 'true');
    assert.match(v1.headers.get('warning'), /v4\.4\.0/);
    assert.equal(v1Calls.length, 1);
    assert.equal(v1Calls[0].expectedFactionRevision, 9);

    console.log('✓ Faction API v2 validation, semantic conflicts, latest snapshots, and deprecated v1 routing verified');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
