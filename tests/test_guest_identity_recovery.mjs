import assert from 'node:assert/strict';

class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
    clear() { this.values.clear(); }
}

globalThis.localStorage = new MemoryStorage();
globalThis.sessionStorage = new MemoryStorage();
globalThis.window = new EventTarget();
if (typeof globalThis.CustomEvent !== 'function') {
    globalThis.CustomEvent = class CustomEvent extends Event { constructor(type, options = {}) { super(type); this.detail = options.detail; } };
}

const jsonResponse = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
});

const oldProfile = {
    id: '123e4567-e89b-42d3-a456-426614174010',
    account_kind: 'guest',
    state_revision: 5,
    guest_migrated_at: '2026-01-01T00:00:00.000Z',
    state: { cash: 50, rankIndex: 1, prestigeCount: 0, prestigePoints: 0 }
};
const replacementProfile = {
    id: '123e4567-e89b-42d3-a456-426614174011',
    account_kind: 'guest',
    state_revision: 0,
    guest_migrated_at: null,
    state: { cash: 0, rankIndex: 0, prestigeCount: 0, prestigePoints: 0 }
};
let guestCreations = 0;
const commandBodies = [];

globalThis.fetch = async (url, options = {}) => {
    if (url === '/api/config/auth') return jsonResponse(200, { enabled: true });
    if (url === '/api/auth/guest') {
        guestCreations += 1;
        const profile = guestCreations === 1 ? oldProfile : replacementProfile;
        return jsonResponse(200, {
            session: { access_token: guestCreations === 1 ? 'old-token' : 'new-token', refresh_token: 'expired-refresh', user: { id: profile.id } },
            profile
        });
    }
    if (url === '/api/auth/refresh') return jsonResponse(401, { error: { code: 'INVALID_AUTH', message: 'Refresh expired.' } });
    if (url === '/api/player/guest-migrate') {
        const migration = JSON.parse(options.body);
        assert.equal(options.headers.Authorization, 'Bearer new-token');
        assert.equal(migration.expectedRevision, 0);
        assert.equal(migration.deviceState.cash, 100);
        return jsonResponse(200, {
            profile: {
                ...replacementProfile,
                state_revision: 1,
                guest_migrated_at: '2026-08-29T00:00:00.000Z',
                state: migration.deviceState
            }
        });
    }
    if (url === '/api/game/commands') {
        const body = JSON.parse(options.body);
        commandBodies.push({ body, authorization: options.headers.Authorization });
        if (commandBodies.length === 1) {
            return jsonResponse(401, { error: { code: 'GUEST_EXPIRED', message: 'Guest expired.' } });
        }
        return jsonResponse(200, {
            state: { ...body.payload, cash: 110, rankIndex: 2, prestigeCount: 0, prestigePoints: 0 },
            revision: 2,
            result: { success: true }
        });
    }
    throw new Error(`Unexpected request: ${url}`);
};

const auth = await import('../public/js/auth.js');
const state = await import('../public/js/state.js');
const api = await import('../public/js/api.js');

let recoveredEvent = null;
window.addEventListener('bconomy-identity-recovered', event => { recoveredEvent = event.detail; });

await auth.ensureGuestIdentity();
state.setState({ cash: 100, rankIndex: 2, prestigeCount: 0, prestigePoints: 0 });
state.setRevision(5);

const result = await api.gameCommand('player.reset', { marker: 'rebuilt' });
assert.equal(result.success, true);
assert.equal(guestCreations, 2);
assert.equal(commandBodies.length, 2);
assert.equal(commandBodies[0].body.commandId, commandBodies[1].body.commandId, 'identity retry must preserve the operation UUID');
assert.equal(commandBodies[0].body.expectedRevision, 5);
assert.equal(commandBodies[1].body.expectedRevision, 1, 'retry must rebuild the authoritative revision');
assert.equal(commandBodies[0].authorization, 'Bearer old-token');
assert.equal(commandBodies[1].authorization, 'Bearer new-token');
assert.equal(commandBodies[1].body.payload.marker, 'rebuilt');
assert.equal(localStorage.getItem('bconomy_guest_recovery_snapshot'), null, 'snapshot clears only after successful migration');
assert.equal(auth.getAuthRecoveryState(), 'ready');
assert.equal(recoveredEvent.profile.id, replacementProfile.id);

console.log('✓ Guest snapshot migration, credential replacement, rebuilt retry, stable UUID, and recovery event verified');
