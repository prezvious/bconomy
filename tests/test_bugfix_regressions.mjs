import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

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
    globalThis.CustomEvent = class CustomEvent extends Event {
        constructor(type, options = {}) { super(type); this.detail = options.detail; }
    };
}

const json = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
});

let authRequiredEvents = 0;
window.addEventListener('bconomy-auth-required', () => { authRequiredEvents += 1; });
localStorage.setItem('bconomy_auth_recovery_state', 'requires-sign-in');

globalThis.fetch = async url => {
    if (url === '/api/config/auth') return json(200, { enabled: false });
    if (url === '/api/factions/queries') {
        return json(401, {
            error: { code: 'FACTION_IDENTITY_REQUIRED', message: 'Sign in to use factions.' }
        });
    }
    if (url === '/api/auth/signup') {
        return json(409, {
            error: { code: 'USERNAME_TAKEN', message: 'That username is already taken.' }
        });
    }
    throw new Error(`Unexpected request: ${url}`);
};

const auth = await import('../public/js/auth.js');
const api = await import('../public/js/api.js');

await auth.initAuth({ cash: 0 });
assert.equal(auth.getAuthRecoveryState(), 'ready', 'an orphaned anonymous recovery marker must be cleared');
assert.equal(localStorage.getItem('bconomy_auth_recovery_state'), null);

await assert.rejects(
    api.doFactionState(),
    error => error.code === 'FACTION_IDENTITY_REQUIRED' && error.message === 'Sign in to use factions.'
);
assert.equal(auth.getAuthRecoveryState(), 'ready', 'an account-only 401 must not lock anonymous gameplay');
assert.equal(authRequiredEvents, 0, 'an anonymous faction response must not open account recovery');

await assert.rejects(
    auth.signUpUser({ username: 'TakenName', password: 'password' }),
    error => error.message === 'That username is already taken.'
);

const [shop, cooldowns, css, html, faction, server] = await Promise.all([
    fs.readFile(new URL('../public/js/ui/shop.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/js/ui/cooldowns.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/style.css', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/js/ui/faction.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../server.js', import.meta.url), 'utf8')
]);

assert(shop.includes('startRestockCountdownTimer(nextRestockAt, refreshOnExpire)'));
assert(shop.includes('if (refreshOnExpire && isShopActive()) void renderShop()'));
assert(shop.includes('boosterTimerInterval = null;'), 'expired boosters must schedule at most one refresh');
assert(cooldowns.includes('FARM_SYNC_RETRY_MAX_MS = 60000'));
assert(cooldowns.includes('now >= nextFarmSyncAttemptAt'));
assert(css.includes('grid-template-columns: minmax(0, 1fr);'));
assert(css.includes('.booster-card {\n    min-width: 0;'));
assert(html.includes('id="toast-container" class="toast-container" aria-live="polite"'));
assert(html.includes('id="release-notes-search"') && html.includes('aria-label="Search release notes"'));
for (const label of [
    'Search public factions',
    'Faction access code',
    'Faction Points deposit amount',
    'Faction membership mode',
    'Search for a faction recruit'
]) {
    assert(faction.includes(`aria-label="${label}"`), `missing accessible name: ${label}`);
}
assert(server.includes('Number.isFinite(parsedLevel) ? Math.max(0, parsedLevel) : 0'));

console.log('✓ Anonymous recovery, retry-loop, narrow-layout, API error, and accessibility regressions verified');
