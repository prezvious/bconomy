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

const jsonResponse = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
});
const registeredId = '123e4567-e89b-42d3-a456-426614174020';
let commandRequests = 0;
let queryMode = 'generic-404';
let authRequiredEvents = 0;
window.addEventListener('bconomy-auth-required', () => { authRequiredEvents += 1; });

globalThis.fetch = async (url, options = {}) => {
    if (url === '/api/auth/signin') {
        return jsonResponse(200, {
            session: { access_token: 'registered-token', refresh_token: 'bad-refresh', user: { id: registeredId } },
            profile: {
                id: registeredId,
                account_kind: 'registered',
                username: 'RegisteredPlayer',
                state_revision: 7,
                state: { cash: 700, rankIndex: 7, prestigeCount: 1, prestigePoints: 5 }
            }
        });
    }
    if (url === '/api/game/queries') {
        if (queryMode === 'generic-404') return jsonResponse(404, { error: { message: 'Route not found.' } });
        throw new Error('A blocked registered state must not be sent as a guest query envelope.');
    }
    if (url === '/api/game/commands') {
        commandRequests += 1;
        const body = JSON.parse(options.body);
        assert.equal(body.guestState, undefined);
        return jsonResponse(401, { error: { code: 'INVALID_AUTH', message: 'Session expired.' } });
    }
    if (url === '/api/auth/refresh') return jsonResponse(401, { error: { code: 'INVALID_AUTH', message: 'Refresh expired.' } });
    throw new Error(`Unexpected request: ${url}`);
};

const auth = await import('../public/js/auth.js');
const state = await import('../public/js/state.js');
const api = await import('../public/js/api.js');

await auth.signInUser({ usernameOrEmail: 'RegisteredPlayer', password: 'password' });
state.setState({ cash: 700, rankIndex: 7, prestigeCount: 1, prestigePoints: 5 });
state.setRevision(7);
state.saveState();

await assert.rejects(api.gameQuery('unknown.test'), error => error.code === 'API_ERROR');
assert.equal(auth.getAuthRecoveryState(), 'ready', 'an arbitrary 404 must not trigger identity recovery');

await assert.rejects(api.gameCommand('player.reset'), error => error.code === 'SIGN_IN_REQUIRED');
assert.equal(commandRequests, 1, 'registered identity failure must not retry as a guest');
assert.equal(auth.getAccessToken(), '');
assert.equal(auth.getAuthRecoveryState(), 'requires-sign-in');
assert.equal(auth.getRecoveryAccountId(), registeredId);
assert.equal(authRequiredEvents, 1);
assert(localStorage.getItem(`bconomy_player_state:${registeredId}`), 'the account-specific local cache must be retained');

queryMode = 'blocked';
await assert.rejects(api.gameQuery('progression.summary'), error => error.code === 'SIGN_IN_REQUIRED');

console.log('✓ Generic 404 isolation, registered sign-in blocking, cache retention, and no guest-envelope fallback verified');
