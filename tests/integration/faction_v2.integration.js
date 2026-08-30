'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const { createDefaultState } = require('../../src/state/playerState');

if (process.env.BCONOMY_FACTION_TEST_CONFIRM !== 'true') {
    console.error('Faction integration tests must be launched by the guarded local or remote runner.');
    process.exit(2);
}

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.SUPABASE_TEST_DB_URL;
const runId = `${Date.now()}-${crypto.randomUUID()}`;
const createdUserIds = [];

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const db = new Client({ connectionString: databaseUrl, ssl: databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false } });
const app = require('../../server');
const server = app.listen(0, '127.0.0.1');

const uuid = () => crypto.randomUUID();
const expectedBoost = (snapshot, actionType) => ({
    factionId: snapshot.faction.id,
    boost: {
        actionType,
        configRevision: Number(snapshot.faction.boosts[actionType].configRevision)
    }
});

async function createTestUser(label) {
    const email = `bconomy-${label}-${runId}@example.com`;
    const password = `Bco!${crypto.randomBytes(18).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            username: `t_${label}_${runId.slice(-8)}`,
            bconomy_test_run: runId,
            bconomy_test_created_at: createdAt
        }
    });
    if (error) throw error;
    createdUserIds.push(data.user.id);
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: signedIn, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    return { id: data.user.id, token: signedIn.session.access_token };
}

async function http(pathname, token, body, version = '2') {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${pathname}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Bconomy-API-Version': version
        },
        body: JSON.stringify(body)
    });
    return { status: response.status, headers: response.headers, body: await response.json() };
}

const factionCommand = (token, { commandId = uuid(), expectedRevision, type, payload = {}, expected }) => http(
    '/api/factions/commands', token, { commandId, expectedRevision, type, payload, expected }, '2'
);

async function factionSnapshot(token) {
    const response = await http('/api/factions/queries', token, { type: 'faction.snapshot', payload: {} }, '2');
    assert.equal(response.status, 200, JSON.stringify(response.body));
    return response.body.result;
}

async function cleanup() {
    const cleanupErrors = [];
    if (createdUserIds.length) {
        try {
            await db.query('delete from public.factions where leader_id = any($1::uuid[])', [createdUserIds]);
        } catch (error) {
            cleanupErrors.push(error);
        }
    }
    for (const userId of createdUserIds) {
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) cleanupErrors.push(error);
    }
    if (cleanupErrors.length) throw new AggregateError(cleanupErrors, 'Faction integration cleanup was incomplete.');
}

(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    await db.connect();
    const leader = await createTestUser('leader');
    const target = await createTestUser('target');
    const initialState = createDefaultState();
    initialState.cash = 2_000_000;
    await db.query(
        'update public.player_state set state = $1::jsonb, state_revision = 0 where id = $2',
        [JSON.stringify(initialState), leader.id]
    );

    let playerRevision = 0;
    const created = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.create',
        payload: { name: `Concurrency ${runId.slice(-8)}`, description: 'Faction API v2 integration test', membershipMode: 'invite_only' },
        expected: { factionId: null }
    });
    assert.equal(created.status, 200, JSON.stringify(created.body));
    playerRevision = created.body.revision;
    const factionId = created.body.snapshot.faction.id;

    const deposited = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.deposit',
        payload: { amount: 1_000_000 },
        expected: { factionId }
    });
    assert.equal(deposited.status, 200, JSON.stringify(deposited.body));
    playerRevision = deposited.body.revision;

    const activated = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.boost.activate',
        payload: { actionType: 'mine', level: 1, durationHours: 1, mode: 'continuous' },
        expected: expectedBoost(deposited.body.snapshot, 'mine')
    });
    assert.equal(activated.status, 200, JSON.stringify(activated.body));
    const reviewedModeSnapshot = activated.body.snapshot;
    const reviewedFactionRevision = Number(reviewedModeSnapshot.faction.revision);

    await db.query(
        "update public.faction_boosts set last_processed_at = timezone('utc'::text, now()) - interval '1 hour' where faction_id = $1 and action_type = 'mine'",
        [factionId]
    );
    const action = await http('/api/game/commands', leader.token, {
        commandId: uuid(),
        expectedRevision: playerRevision,
        type: 'action.perform',
        payload: { actionType: 'mine' }
    }, '1');
    assert.equal(action.status, 200, JSON.stringify(action.body));
    playerRevision = action.body.revision;
    const revisionAfterDrain = Number((await db.query('select revision from public.factions where id = $1', [factionId])).rows[0].revision);
    assert(revisionAfterDrain > reviewedFactionRevision, 'continuous drain must advance the broad snapshot revision');

    const successfulModeCommandId = uuid();
    const modeChanged = await factionCommand(leader.token, {
        commandId: successfulModeCommandId,
        expectedRevision: playerRevision,
        type: 'faction.membership_mode.set',
        payload: { membershipMode: 'public' },
        expected: { factionId, membershipMode: reviewedModeSnapshot.faction.membershipMode }
    });
    assert.equal(modeChanged.status, 200, JSON.stringify(modeChanged.body));
    assert.equal(modeChanged.body.result.membershipMode, 'public', 'runtime boost accounting must not reject a reviewed mode change');

    await db.query("update public.factions set membership_mode = 'code_only', revision = revision + 1 where id = $1", [factionId]);
    const duplicate = await factionCommand(leader.token, {
        commandId: successfulModeCommandId,
        expectedRevision: playerRevision,
        type: 'faction.membership_mode.set',
        payload: { membershipMode: 'public' },
        expected: { factionId, membershipMode: 'invite_only' }
    });
    assert.equal(duplicate.status, 200, JSON.stringify(duplicate.body));
    assert.equal(duplicate.body.duplicate, true, 'idempotent replay must win over later semantic changes');
    assert.equal(duplicate.body.result.membershipMode, 'public');

    const staleMode = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.membership_mode.set',
        payload: { membershipMode: 'invite_only' },
        expected: { factionId, membershipMode: 'public' }
    });
    assert.equal(staleMode.status, 409, JSON.stringify(staleMode.body));
    assert.equal(staleMode.body.error.code, 'FACTION_PRECONDITION_FAILED');
    assert.equal(staleMode.body.error.details.precondition, 'membershipMode');
    assert.equal(staleMode.body.snapshot.faction.membershipMode, 'code_only');

    const parallel = await Promise.all([
        factionCommand(leader.token, {
            expectedRevision: playerRevision,
            type: 'faction.membership_mode.set',
            payload: { membershipMode: 'public' },
            expected: { factionId, membershipMode: 'code_only' }
        }),
        factionCommand(leader.token, {
            expectedRevision: playerRevision,
            type: 'faction.membership_mode.set',
            payload: { membershipMode: 'invite_only' },
            expected: { factionId, membershipMode: 'code_only' }
        })
    ]);
    assert.deepEqual(parallel.map(result => result.status).sort(), [200, 409], 'only one command from the same reviewed mode may apply');
    assert.equal(parallel.find(result => result.status === 409).body.error.details.precondition, 'membershipMode');

    const fresh = await factionSnapshot(leader.token);
    const staleBoostExpected = expectedBoost(fresh, 'mine');
    await db.query("update public.faction_boosts set config_revision = config_revision + 1 where faction_id = $1 and action_type = 'mine'", [factionId]);
    const staleBoost = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.boost.activate',
        payload: { actionType: 'mine', level: 2, durationHours: 1, mode: 'continuous' },
        expected: staleBoostExpected
    });
    assert.equal(staleBoost.status, 409, JSON.stringify(staleBoost.body));
    assert.equal(staleBoost.body.error.details.precondition, 'boost');

    const targetProfile = (await db.query('select player_id from public.player_state where id = $1', [target.id])).rows[0];
    await db.query(
        "insert into public.faction_members(faction_id, player_id, faction_rank) values ($1, $2, 'private')",
        [factionId, target.id]
    );
    await db.query("update public.faction_members set faction_rank = 'corporal' where faction_id = $1 and player_id = $2", [factionId, target.id]);
    const staleMember = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.member.remove',
        payload: { playerId: Number(targetProfile.player_id) },
        expected: { factionId, targetMember: { playerId: Number(targetProfile.player_id), factionRank: 'private' } }
    });
    assert.equal(staleMember.status, 409, JSON.stringify(staleMember.body));
    assert.equal(staleMember.body.error.details.precondition, 'targetMember');

    await db.query("update public.factions set membership_mode = 'code_only', revision = revision + 1 where id = $1", [factionId]);
    const codeOne = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.code.generate',
        expected: { factionId, membershipMode: 'code_only', accessCodeVersion: null }
    });
    assert.equal(codeOne.status, 200, JSON.stringify(codeOne.body));
    assert.match(codeOne.body.result.code, /^BCF-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    const firstCodeVersion = codeOne.body.snapshot.faction.accessCode.version;
    const codeTwo = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.code.generate',
        expected: { factionId, membershipMode: 'code_only', accessCodeVersion: firstCodeVersion }
    });
    assert.equal(codeTwo.status, 200, JSON.stringify(codeTwo.body));
    assert.notEqual(codeTwo.body.snapshot.faction.accessCode.version, firstCodeVersion);
    const staleCode = await factionCommand(leader.token, {
        expectedRevision: playerRevision,
        type: 'faction.code.generate',
        expected: { factionId, membershipMode: 'code_only', accessCodeVersion: firstCodeVersion }
    });
    assert.equal(staleCode.status, 409, JSON.stringify(staleCode.body));
    assert.equal(staleCode.body.error.details.precondition, 'accessCodeVersion');

    const v1Query = await http('/api/factions/queries', leader.token, { type: 'faction.snapshot', payload: {} }, '1');
    assert.equal(v1Query.status, 200);
    assert.equal(v1Query.headers.get('deprecation'), 'true');
    assert.match(v1Query.headers.get('warning'), /v4\.4\.0/);

    console.log('✓ Faction API v2 semantic concurrency, duplicate replay, resource tokens, v1 bridge, and runtime-drain regression verified');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(async () => {
    try { await cleanup(); } catch (error) { console.error('Faction integration cleanup failed:', error); process.exitCode = 1; }
    await db.end().catch(() => {});
    server.close();
});
