import assert from 'assert';

console.log('--- Running Preferences & Number Formatting Tests ---');

const storage = new Map();
global.localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};

global.document = {
    documentElement: { dataset: {} },
    dispatchEvent: () => true
};

const preferences = await import('../public/js/preferences.js');
const {
    SETTINGS_STORAGE_KEY,
    getDefaultSettings,
    getStoredSettings,
    saveStoredSettings,
    resetDisplaySettings,
    invalidateSettingsCache
} = preferences;
const {
    formatDisplayNumber,
    formatMoney,
    formatNumberCommas
} = await import('../public/js/utils.js');

const defaults = getDefaultSettings();
assert.strictEqual(defaults.numberDisplay, 'full');
assert.strictEqual(defaults.interfaceDensity, 'balanced');
assert.strictEqual(defaults.collapseSearchOnBlur, false);
assert.deepStrictEqual(defaults.inventory, {
    view: 'grid',
    search: '',
    category: 'all',
    sort: 'name-asc',
    showUnavailableBoosterAction: true
});
assert.deepStrictEqual(defaults.bulkActions, { skipAllPreviews: false });
console.log('✓ Defaults use full values and balanced density');

storage.set(SETTINGS_STORAGE_KEY, '{broken json');
invalidateSettingsCache();
assert.strictEqual(getStoredSettings().numberDisplay, 'full');

storage.set(SETTINGS_STORAGE_KEY, JSON.stringify({
    density: 'minimal',
    numberDisplay: 'invalid',
    interfaceDensity: 'giant',
    collapseSearchOnBlur: 'yes',
    bulkActions: { skipAllPreviews: 'yes' },
    inventory: { view: 'table', search: 'x'.repeat(140), category: 'ore', sort: 'bad-sort', showUnavailableBoosterAction: 'no' },
    categories: { shop: false }
}));
invalidateSettingsCache();
const normalized = getStoredSettings();
assert.strictEqual(normalized.density, 'minimal');
assert.strictEqual(normalized.categories.shop, false);
assert.strictEqual(normalized.numberDisplay, 'full');
assert.strictEqual(normalized.interfaceDensity, 'balanced');
assert.strictEqual(normalized.collapseSearchOnBlur, false);
assert.strictEqual(normalized.inventory.view, 'grid');
assert.strictEqual(normalized.inventory.search.length, 120);
assert.strictEqual(normalized.inventory.category, 'ore');
assert.strictEqual(normalized.inventory.sort, 'name-asc');
assert.strictEqual(normalized.inventory.showUnavailableBoosterAction, true);
assert.strictEqual(normalized.bulkActions.skipAllPreviews, false);
console.log('✓ Legacy, partial, invalid, and corrupt settings normalize safely');

assert.strictEqual(formatDisplayNumber(999, { numberDisplay: 'named' }), '999');
assert.strictEqual(formatDisplayNumber(1000, { numberDisplay: 'named' }), '1.00 thousand');
assert.strictEqual(formatDisplayNumber(1250000, { numberDisplay: 'named' }), '1.25 million');
assert.strictEqual(formatDisplayNumber(999999, { numberDisplay: 'named' }), '1.00 million');
assert.strictEqual(formatDisplayNumber(-1250000, { numberDisplay: 'named' }), '-1.25 million');
assert.strictEqual(formatDisplayNumber(1e18, { numberDisplay: 'named' }), '1.00 quintillion');
assert.strictEqual(formatDisplayNumber(1e21, { numberDisplay: 'named' }), '1.00 sextillion');
assert.strictEqual(formatDisplayNumber(1e24, { numberDisplay: 'named' }), '1.00 septillion');
assert.strictEqual(formatDisplayNumber(1e27, { numberDisplay: 'named' }), '1000.00 septillion');
assert.strictEqual(formatDisplayNumber(1250000, { numberDisplay: 'full' }), '1,250,000');
assert.strictEqual(formatNumberCommas(Infinity), '∞');
assert.strictEqual(formatMoney(1250000, { numberDisplay: 'named' }), '$1.25 million');
assert.strictEqual(formatMoney(-1250000, { numberDisplay: 'named' }), '-$1.25 million');
assert.strictEqual(formatMoney(1250000, { numberDisplay: 'full' }), '$1,250,000');
console.log('✓ Full and value-name formats cover thresholds, promotion, signs, currency, and upper bounds');

saveStoredSettings({
    ...getStoredSettings(),
    numberDisplay: 'named',
    interfaceDensity: 'comfortable',
    collapseSearchOnBlur: true,
    bulkActions: { skipAllPreviews: true },
    inventory: { view: 'compact', search: 'ore', category: 'ore', sort: 'quantity-desc', showUnavailableBoosterAction: false }
});
assert.strictEqual(document.documentElement.dataset.density, 'comfortable');
resetDisplaySettings();
const reset = getStoredSettings();
assert.strictEqual(reset.numberDisplay, 'full');
assert.strictEqual(reset.interfaceDensity, 'balanced');
assert.strictEqual(reset.collapseSearchOnBlur, false);
assert.deepStrictEqual(reset.inventory, defaults.inventory);
assert.strictEqual(reset.density, 'minimal', 'Notification preferences remain unchanged');
assert.strictEqual(reset.categories.shop, false, 'Notification category preferences remain unchanged');
assert.strictEqual(reset.bulkActions.skipAllPreviews, true, 'Bulk preview preference remains unchanged');
console.log('✓ Saving applies density and display reset preserves notification settings');

console.log('--- Preferences & Number Formatting Tests Passed ---');
