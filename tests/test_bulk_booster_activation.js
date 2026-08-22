const assert = require('assert');
const BoosterEngine = require('../src/engine/boosterEngine');

console.log('--- Running Bulk Booster Activation Tests ---');

const now = 2_000_000;
const createState = () => ({
    inventory: {
        'Prospector Kit': 2,
        MiningBoosterT1: 1,
        'Ore Scanner': 3,
        'Survey Pack': 2,
        'Industrial Drillhead': 1,
        FishingBoosterT6: 1,
        Rock: 50
    },
    boosters: {
        activeUntil: {
            mine: { T1: now + 60_000, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            explore: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            hunt: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            fish: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }
        }
    }
});

// Preview is pure and combines canonical plus legacy entries by action/tier.
const previewState = createState();
const previewSnapshot = JSON.stringify(previewState);
const preview = BoosterEngine.buildBulkActivationPlan(previewState, { mode: 'allOwned' }, now);
assert.strictEqual(preview.success, true);
assert.strictEqual(preview.itemsAffectedCount, 6);
assert.strictEqual(preview.totalUnits, 10);
assert.strictEqual(JSON.stringify(previewState), previewSnapshot, 'Preview must not mutate player state');
const mineT1 = preview.tierSummaries.find(row => row.actionType === 'mine' && row.tier === 'T1');
assert.strictEqual(mineT1.quantity, 3, 'Canonical and legacy T1 mining boosters must aggregate');
assert.strictEqual(mineT1.previousExpiry, now + 60_000);
assert.strictEqual(mineT1.newExpiry, now + 60_000 + (3 * 15 * 60_000));
assert.strictEqual(preview.actionSummaries.find(row => row.actionType === 'mine').multiplier, 8, 'Distinct T1, T2, and T5 mining tiers produce 8x');
assert.strictEqual(preview.actionSummaries.find(row => row.actionType === 'fish').multiplier, 2, 'Legacy T6 fishing booster resolves and activates');
console.log('✓ Pure all-owned preview aggregates mixed names, tiers, and active duration');

// All-owned execution consumes every selected unit atomically with one timestamp.
const allState = createState();
const allResult = BoosterEngine.activateBoostersBulk(allState, { mode: 'allOwned' }, now);
assert.strictEqual(allResult.activationTime, now);
assert.deepStrictEqual(allState.inventory, { Rock: 50 });
for (const summary of allResult.tierSummaries) {
    assert.strictEqual(allState.boosters.activeUntil[summary.actionType][summary.tier], summary.newExpiry);
}
assert.strictEqual(new Set(allResult.tierSummaries.map(() => allResult.activationTime)).size, 1);
console.log('✓ All-owned execution consumes all boosters using a shared activation timestamp');

// One-each consumes one unit per distinct stored booster item.
const oneEachState = createState();
const oneEach = BoosterEngine.activateBoostersBulk(oneEachState, { mode: 'oneEach' }, now);
assert.strictEqual(oneEach.totalUnits, 6);
assert.strictEqual(oneEachState.inventory['Prospector Kit'], 1);
assert.strictEqual(oneEachState.inventory['Ore Scanner'], 2);
assert.strictEqual(oneEachState.inventory['Survey Pack'], 1);
assert.strictEqual(oneEachState.inventory.MiningBoosterT1, undefined);
assert.strictEqual(oneEachState.inventory['Industrial Drillhead'], undefined);
assert.strictEqual(oneEachState.inventory.FishingBoosterT6, undefined);
console.log('✓ One-each consumes one unit per distinct owned booster item');

// Custom quantities select exact units and leave unselected inventory untouched.
const customState = createState();
const custom = BoosterEngine.activateBoostersBulk(customState, {
    mode: 'custom',
    quantities: {
        'Prospector Kit': 1,
        MiningBoosterT1: 0,
        'Ore Scanner': 2
    }
}, now);
assert.strictEqual(custom.totalUnits, 3);
assert.strictEqual(customState.inventory['Prospector Kit'], 1);
assert.strictEqual(customState.inventory['Ore Scanner'], 1);
assert.strictEqual(customState.inventory.MiningBoosterT1, 1);
assert.strictEqual(customState.inventory['Survey Pack'], 2);
console.log('✓ Custom activation consumes only explicitly selected quantities');

// Invalid or stale requests fail without partial inventory or expiry changes.
for (const options of [
    { mode: 'custom', quantities: { 'Prospector Kit': 3 } },
    { mode: 'custom', quantities: { 'Prospector Kit': 1.5 } },
    { mode: 'custom', quantities: { 'Prospector Kit': '1' } },
    { mode: 'custom', quantities: { UnknownBooster: 1 } },
    { mode: 'custom', quantities: { 'Prospector Kit': 0 } },
    { mode: 'unsupported' },
    null
]) {
    const invalidState = createState();
    const before = JSON.stringify(invalidState);
    const result = BoosterEngine.activateBoostersBulk(invalidState, options, now);
    assert.ok(result.error, `Expected validation error for ${JSON.stringify(options)}`);
    assert.strictEqual(JSON.stringify(invalidState), before, 'Rejected execution must be atomic');
}

const emptyState = { inventory: { Rock: 1 } };
assert.ok(BoosterEngine.buildBulkActivationPlan(emptyState, { mode: 'allOwned' }, now).error);
const invalidOwnedState = createState();
invalidOwnedState.inventory['Prospector Kit'] = '2';
assert.match(BoosterEngine.buildBulkActivationPlan(invalidOwnedState, { mode: 'allOwned' }, now).error, /owned quantity/);
console.log('✓ Invalid, stale, and empty selections reject atomically');

console.log('--- Bulk Booster Activation Tests Passed ---');
