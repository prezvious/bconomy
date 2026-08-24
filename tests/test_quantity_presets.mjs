import assert from 'assert';

const storage = new Map();
global.localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};
global.document = { documentElement: { dataset: {} }, dispatchEvent: () => true };

const {
    getDefaultSettings,
    normalizeSettings,
    resolveQuantityPreferences,
    shouldConfirmQuantityOperation
} = await import('../public/js/preferences.js');

console.log('--- Running Shared Quantity Preset Tests ---');

const defaults = getDefaultSettings();
const resolvedDefaults = resolveQuantityPreferences(defaults, 'crafting', 'recipe_Test');
assert.deepStrictEqual(resolvedDefaults.values, [1, 10, 100, 1000]);
assert.deepStrictEqual(resolvedDefaults.presets.map(preset => preset.label), ['1', '10', '100', '1000', 'Max']);
assert.ok(resolvedDefaults.presets.every(preset => preset.valid));
assert.strictEqual(resolvedDefaults.previewMode, 'recursive-only');
assert.strictEqual(resolvedDefaults.largeThreshold, 100);
console.log('✓ Global defaults and immutable Max preset verified');

const settings = normalizeSettings({
    quantityPresets: {
        global: { values: [2, 20, 200, 2000], previewMode: 'large-only', largeThreshold: 50 },
        systems: { crafting: { values: [3, 30, 300, 3000], previewMode: 'every' } },
        subjects: { crafting: { recipe_Test: { values: [4, 40, 400, 4000], previewMode: 'never' } } }
    }
});
assert.deepStrictEqual(resolveQuantityPreferences(settings, 'shop-buy').values, [2, 20, 200, 2000]);
assert.deepStrictEqual(resolveQuantityPreferences(settings, 'crafting').values, [3, 30, 300, 3000]);
assert.deepStrictEqual(resolveQuantityPreferences(settings, 'crafting', 'recipe_Test').values, [4, 40, 400, 4000]);
assert.strictEqual(resolveQuantityPreferences(settings, 'crafting', 'recipe_Test').largeThreshold, 50);
console.log('✓ Global → system → subject inheritance verified');

const invalid = normalizeSettings({
    quantityPresets: { global: { values: [1, 1, -4, 2.5] } }
});
const invalidResolved = resolveQuantityPreferences(invalid, 'crafting');
assert.deepStrictEqual(invalidResolved.presets.slice(0, 4).map(preset => preset.valid), [false, false, false, false]);
assert.strictEqual(invalidResolved.presets[4].valid, true);
console.log('✓ Duplicate and invalid values remain visible but disabled');

assert.strictEqual(shouldConfirmQuantityOperation({ settings: defaults, systemId: 'crafting', quantity: 1, recursive: false }), false);
assert.strictEqual(shouldConfirmQuantityOperation({ settings: defaults, systemId: 'crafting', quantity: 1, recursive: true }), true);
assert.strictEqual(shouldConfirmQuantityOperation({ settings, systemId: 'crafting', subjectId: 'recipe_Test', quantity: 1000, recursive: true }), false);
const skipAll = normalizeSettings({ bulkActions: { skipAllPreviews: true }, quantityPresets: { global: { previewMode: 'every' } } });
assert.strictEqual(shouldConfirmQuantityOperation({ settings: skipAll, systemId: 'crafting', quantity: 1, recursive: true }), false);
console.log('✓ Preview modes and global skip-all precedence verified');
