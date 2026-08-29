import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

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

const stateModule = await import('../public/js/state.js');
stateModule.setRankData(Array.from({ length: 107 }, (_, index) => ({ index: index + 1 })));

stateModule.setState({ cash: '1234', rankIndex: '200', prestigeCount: '8', prestigePoints: Number.NaN });
assert.deepEqual(
    Object.fromEntries(['cash', 'rankIndex', 'prestigeCount', 'prestigePoints'].map(key => [key, stateModule.getState()[key]])),
    { cash: 1234, rankIndex: 106, prestigeCount: 8, prestigePoints: 0 }
);

stateModule.saveState({ cash: Number.POSITIVE_INFINITY, rankIndex: -5, prestigeCount: null, prestigePoints: '17' });
assert.equal(stateModule.getState().cash, 0);
assert.equal(stateModule.getState().rankIndex, 0);
assert.equal(stateModule.getState().prestigeCount, 0);
assert.equal(stateModule.getState().prestigePoints, 17);
const saved = JSON.parse(localStorage.getItem('bconomy_guest_state'));
assert.equal(saved.cash, 0, 'direct saveState(state) must not bypass normalization');

localStorage.clear();
localStorage.setItem('bconomy_player_state', JSON.stringify({ cash: '9007199254740992', rankIndex: '3', prestigeCount: '-9' }));
const legacy = stateModule.loadState();
assert.equal(legacy.cash, Number.MAX_SAFE_INTEGER);
assert.equal(legacy.rankIndex, 3);
assert.equal(legacy.prestigeCount, 0);
assert.equal(localStorage.getItem('bconomy_player_state'), null, 'legacy save should migrate to the guest key');

const [rankUi, apiClient, auth, html] = await Promise.all([
    fs.readFile(new URL('../public/js/ui/rankPrestigeCombined.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/js/api.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/js/auth.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../public/index.html', import.meta.url), 'utf8')
]);
assert(!rankUi.includes('calculateTargetedCostPreview'), 'duplicated client cost calculator must be removed');
assert(rankUi.includes('setTimeout(() => void updateModalPreview(), 200)'));
assert(rankUi.includes("preview.reason === 'READY'") && rankUi.includes("preview.reason === 'INSUFFICIENT_CASH'") && rankUi.includes("preview.reason === 'ALREADY_REACHED'"));
assert(apiClient.includes('const stableCommandId = commandId()'));
assert(apiClient.includes('requestJsonWithRecovery'));
assert(auth.includes('bconomy_guest_recovery_snapshot'));
assert(auth.includes("setRecoveryState('requires-sign-in')"));
assert(html.includes('identity-recovery-notice'));

console.log('✓ State normalization and recovery/preview UI contracts verified');
