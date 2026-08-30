import assert from 'node:assert/strict';

class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
}

globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();
globalThis.window = new EventTarget();
if (typeof globalThis.CustomEvent !== 'function') {
    globalThis.CustomEvent = class CustomEvent extends Event { constructor(type, options = {}) { super(type); this.detail = options.detail; } };
}

const profile = {
    id: '123e4567-e89b-42d3-a456-426614174300',
    player_id: 12,
    account_kind: 'registered',
    state_revision: 4,
    state: { cash: 10, rankIndex: 0, prestigeCount: 0, prestigePoints: 0 }
};
localStorage.setItem('bconomy_auth_session', JSON.stringify({ access_token: 'faction-client-token', refresh_token: 'refresh' }));
localStorage.setItem('bconomy_auth_profile', JSON.stringify(profile));

let commandRequest;
let queryRequest;
let switchIdentityDuringCommand = false;
let authModule;
const latestSnapshot = { status: 'ok', faction: { id: '123e4567-e89b-42d3-a456-426614174301', membershipMode: 'public' } };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

globalThis.fetch = async (url, options = {}) => {
    if (url === '/api/player/profile') return json(200, profile);
    if (url === '/api/factions/queries') {
        queryRequest = options;
        return json(200, { result: latestSnapshot });
    }
    if (url === '/api/factions/commands') {
        commandRequest = options;
        if (switchIdentityDuringCommand) {
            authModule.setAuthProfile({ ...profile, id: '123e4567-e89b-42d3-a456-426614174399' });
        }
        return json(409, {
            error: {
                code: 'FACTION_PRECONDITION_FAILED',
                message: 'changed',
                details: { precondition: 'membershipMode' }
            },
            snapshot: latestSnapshot
        });
    }
    throw new Error(`Unexpected request: ${url}`);
};

const auth = await import('../public/js/auth.js');
authModule = auth;
const state = await import('../public/js/state.js');
const api = await import('../public/js/api.js');
await auth.initAuth(profile.state);
state.setRevision(4);

const query = await api.doFactionState();
assert.equal(query.faction.membershipMode, 'public');
assert.equal(queryRequest.headers['X-Bconomy-API-Version'], '2');

let staleEvent;
window.addEventListener('bconomy-faction-stale', event => { staleEvent = event.detail; });
const expected = { factionId: latestSnapshot.faction.id, membershipMode: 'invite_only' };
await assert.rejects(
    api.doFactionSetMembershipMode('public', null, expected),
    error => error.code === 'FACTION_PRECONDITION_FAILED'
        && error.details.precondition === 'membershipMode'
        && error.snapshot.faction.membershipMode === 'public'
);

const body = JSON.parse(commandRequest.body);
assert.equal(commandRequest.headers['X-Bconomy-API-Version'], '2');
assert.deepEqual(body.expected, expected);
assert.equal(body.expectedFactionRevision, undefined);
assert.equal(body.expectedRevision, 4);
assert.deepEqual(staleEvent.snapshot, latestSnapshot);
assert.equal(staleEvent.error.details.precondition, 'membershipMode');

const priorStaleEvent = staleEvent;
switchIdentityDuringCommand = true;
await assert.rejects(
    api.doFactionDeposit(1, null, { factionId: latestSnapshot.faction.id }),
    error => error.code === 'FACTION_IDENTITY_CHANGED'
);
assert.equal(staleEvent, priorStaleEvent, 'a late response from the prior identity cannot repaint faction state');

console.log('✓ Faction client v2 envelope, semantic error details, and latest-snapshot event verified');
