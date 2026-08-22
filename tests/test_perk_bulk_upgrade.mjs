import assert from 'assert';
const RankPrestigeEngine = (await import('../src/engine/rankPrestigeEngine.js')).default || (await import('../src/engine/rankPrestigeEngine.js'));

console.log('--- Running Perk Bulk Upgrade Engine Tests ---');

// Test 1: Single perk upgrade (count = 1)
const state1 = {
    cash: 1000000,
    rankIndex: 0,
    prestigeCount: 1,
    prestigePoints: 10,
    perks: { serendipity: 0 }
};

const res1 = RankPrestigeEngine.upgradePerk(state1, 'serendipity', 1);
assert(res1.success, 'Upgrade should succeed');
assert.strictEqual(res1.levelsAdded, 1, 'Should add 1 level');
assert.strictEqual(res1.cost, 1, 'Should cost 1 point');
assert.strictEqual(state1.perks.serendipity, 1, 'Serendipity level should be 1');
assert.strictEqual(state1.prestigePoints, 9, 'Remaining points should be 9');
console.log('✓ Test 1 Passed: Single (+1) perk upgrade verified');

// Test 2: Bulk +5 perk upgrade
const res2 = RankPrestigeEngine.upgradePerk(state1, 'serendipity', 5);
assert(res2.success, 'Bulk +5 upgrade should succeed');
assert.strictEqual(res2.levelsAdded, 5, 'Should add 5 levels');
assert.strictEqual(res2.cost, 5, 'Should cost 5 points');
assert.strictEqual(state1.perks.serendipity, 6, 'Serendipity level should be 6 (1 + 5)');
assert.strictEqual(state1.prestigePoints, 4, 'Remaining points should be 4 (9 - 5)');
console.log('✓ Test 2 Passed: Bulk (+5) perk upgrade verified');

// Test 3: Partial bulk upgrade when points < requested count
// Player has 4 points left, requests 5
const res3 = RankPrestigeEngine.upgradePerk(state1, 'serendipity', 5);
assert(res3.success, 'Partial upgrade should succeed with available points');
assert.strictEqual(res3.levelsAdded, 4, 'Should add 4 levels (max affordable)');
assert.strictEqual(res3.cost, 4, 'Should cost 4 points');
assert.strictEqual(state1.perks.serendipity, 10, 'Serendipity level should be 10 (6 + 4)');
assert.strictEqual(state1.prestigePoints, 0, 'Remaining points should be 0');
console.log('✓ Test 3 Passed: Partial bulk upgrade correctly bounds to available points');

// Test 4: Max upgrade option
// Give player 50 points (serendipity max is 29, currently at 10, needs 19)
state1.prestigePoints = 50;
const res4 = RankPrestigeEngine.upgradePerk(state1, 'serendipity', 'max');
assert(res4.success, 'Max upgrade should succeed');
assert.strictEqual(res4.levelsAdded, 19, 'Should add 19 levels to reach 29 cap');
assert.strictEqual(res4.cost, 19, 'Should cost 19 points');
assert.strictEqual(state1.perks.serendipity, 29, 'Serendipity should be at maxLevel 29');
assert.strictEqual(state1.prestigePoints, 31, 'Remaining points should be 31 (50 - 19)');
console.log('✓ Test 4 Passed: Max upgrade cleanly caps at maxLevel without overspending');

// Test 5: Upgrade on already maxed perk returns error
const res5 = RankPrestigeEngine.upgradePerk(state1, 'serendipity', 1);
assert(res5.error, 'Should return error when maxed');
assert.strictEqual(state1.perks.serendipity, 29, 'Level should remain 29');
assert.strictEqual(state1.prestigePoints, 31, 'Points should not be deducted');
console.log('✓ Test 5 Passed: Maxed perk cleanly rejects further upgrades');

// Test 6: 0 points returns error
state1.prestigePoints = 0;
const res6 = RankPrestigeEngine.upgradePerk(state1, 'cronyism', 1);
assert(res6.error, 'Should return error when 0 prestige points');
console.log('✓ Test 6 Passed: Insufficient points properly rejected');

console.log('--- All Perk Bulk Upgrade Tests Passed Successfully! ---');
process.exit(0);
