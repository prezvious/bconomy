const assert = require('assert');

delete process.env.BCONOMY_DEV_COMMANDS;
delete process.env.ALLOW_DEV_COMMANDS;
delete process.env.BCONOMY_DEV_USER_IDS;
process.env.NODE_ENV = 'test';

const { createDefaultState } = require('../src/state/playerState');
const supabasePath = require.resolve('../src/db/supabase');
const factionsPath = require.resolve('../src/db/factions');
const realSupabase = require(supabasePath);
const realFactions = require(factionsPath);

const userId = '123e4567-e89b-42d3-a456-426614174100';
const duplicateCommandId = '123e4567-e89b-42d3-a456-426614174101';
const conflictCommandId = '123e4567-e89b-42d3-a456-426614174102';
const actionCommandId = '123e4567-e89b-42d3-a456-426614174103';
const profileState = createDefaultState();
let activityTouches = 0;
let cleanupRuns = 0;
let factionLookups = 0;
let receiptReads = 0;
const commits = [];

require.cache[supabasePath].exports = {
    ...realSupabase,
    verifyAccessToken: async token => token === 'test-token' ? { id: userId } : null,
    lookupProfileByUserId: async id => ({
        status: 'found',
        profile: {
            id,
            account_kind: 'registered',
            last_active_at: new Date().toISOString(),
            state_revision: 2,
            state: profileState
        }
    }),
    touchPlayerActivity: async () => { activityTouches += 1; return true; },
    getPlayerCommandReceipt: async input => {
        receiptReads += 1;
        if (input.commandId === duplicateCommandId) {
            return { resulting_revision: 2, result: { success: true, marker: 'original-result' } };
        }
        return null;
    },
    commitPlayerCommand: async input => {
        commits.push(input);
        return { status: 'applied', revision: 3, result: input.result };
    }
};

require.cache[factionsPath].exports = {
    ...realFactions,
    getFactionEffect: async () => {
        factionLookups += 1;
        return { status: 'ok', name: null, level: 0, multiplier: 1 };
    },
    cleanupInactiveGuests: async () => {
        cleanupRuns += 1;
        return { status: 'ok', deletedCount: 0 };
    }
};

const app = require('../server');
const server = app.listen(0, '127.0.0.1');

(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const command = async (commandId, expectedRevision, type = 'player.reset', payload = {}) => {
        const response = await fetch(`${origin}/api/game/commands`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json',
                'X-Bconomy-API-Version': '1'
            },
            body: JSON.stringify({ commandId, expectedRevision, type, payload })
        });
        return { status: response.status, data: await response.json(), timing: response.headers.get('server-timing') || '' };
    };

    const duplicate = await command(duplicateCommandId, 1);
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.data.duplicate, true);
    assert.equal(duplicate.data.revision, 2);
    assert.equal(duplicate.data.result.marker, 'original-result');
    assert.match(duplicate.timing, /context;dur=.*replay;dur=.*total;dur=/);

    const conflict = await command(conflictCommandId, 1);
    assert.equal(conflict.status, 409);
    assert.equal(conflict.data.error.code, 'STATE_CONFLICT');
    assert.equal(conflict.data.revision, 2);

    const action = await command(actionCommandId, 2, 'action.perform', { actionType: 'mine' });
    assert.equal(action.status, 200);
    assert.equal(action.data.duplicate, false);
    assert.equal(action.data.revision, 3);
    assert.equal(action.data.result.success, true);
    assert.match(action.timing, /context;dur=.*faction;dur=.*engine;dur=.*commit;dur=.*total;dur=/);

    assert.equal(receiptReads, 2, 'only stale duplicate and conflict requests read receipts');
    assert.equal(commits.length, 1, 'only the current successful action reaches the mutating commit');
    assert.equal(factionLookups, 1, 'only the current action resolves a faction effect');
    assert.equal(activityTouches, 0, 'game commands do not issue standalone activity updates');
    assert.equal(cleanupRuns, 0, 'game commands do not run inactive-guest cleanup');

    console.log('✓ Read-only duplicate replay, stale conflicts, atomic activity, faction lookup, and timing phases verified');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
