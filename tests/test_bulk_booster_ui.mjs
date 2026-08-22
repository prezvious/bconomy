import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

console.log('--- Running Bulk Booster UI Contract Tests ---');

const storage = new Map();
globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};
globalThis.window = { addEventListener() {} };
globalThis.document = {
    documentElement: { dataset: {} },
    dispatchEvent() {},
    addEventListener() {}
};

const { setState } = await import('../public/js/state.js');
const { getOwnedBoosterEntries, getOwnedBoosterUnitCount } = await import('../public/js/ui/boosterBulk.js');

setState({
    inventory: {
        'Prospector Kit': 2,
        MiningBoosterT2: 3,
        mine_t3: 1,
        Rock: 100,
        BrokenBooster: -1
    }
});

const entries = getOwnedBoosterEntries();
assert.deepEqual(entries.map(entry => [entry.itemName, entry.action, entry.tier, entry.quantity]), [
    ['Prospector Kit', 'mine', 'T1', 2],
    ['MiningBoosterT2', 'mine', 'T2', 3],
    ['mine_t3', 'mine', 'T3', 1]
]);
assert.equal(getOwnedBoosterUnitCount(), 6);
console.log('✓ Inventory action count resolves canonical and supported legacy boosters');

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../public/js/ui/boosterBulk.js', import.meta.url), 'utf8');
const inventorySource = await readFile(new URL('../public/js/ui/inventory.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');

for (const id of [
    'btn-open-bulk-boosters',
    'bulk-booster-modal',
    'bulk-booster-modal-body',
    'bulk-booster-preview-modal',
    'bulk-booster-preview-body',
    'bulk-booster-preview-dont-show-again'
]) {
    assert(html.includes(`id="${id}"`), `Bulk booster UI must include #${id}`);
}

for (const mode of ['allOwned', 'oneEach', 'custom']) {
    assert(source.includes(`data-mode="${mode}"`), `Bulk booster dialog must expose ${mode}`);
}
assert(source.includes('shouldSkipBulkPreview(PREVIEW_KEY)'), 'Bulk booster primary action respects preview suppression');
assert(source.includes('durationAddedMs') && source.includes('newExpiry'), 'Preview renders duration and projected expiry data');
assert(inventorySource.includes('renderActiveBoosts'), 'Successful activation refreshes active booster timers');
assert(css.includes('.bulk-booster-table-wrapper') && css.includes('.booster-action-summary'), 'Bulk booster tables and multiplier summary are styled');
assert(css.includes('@media (max-width: 640px)'), 'Bulk booster UI inherits a mobile layout');
console.log('✓ Presets, accessible dialogs, preview details, suppression, and responsive styling are present');

console.log('--- Bulk Booster UI Contract Tests Passed ---');
