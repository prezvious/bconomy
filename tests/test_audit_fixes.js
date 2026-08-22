/**
 * Unit Test Suite for Audit Fixes
 * Verifies key normalization, state validation, and error contract fixes.
 */
const assert = require('assert');
const { FarmEngine } = require('../src/engine/farmEngine');
const ShopEngine = require('../src/engine/shopEngine');

function testAuditFixes() {
    console.log('--- Starting Audit Fix Regression Tests ---');

    // 1. Golden Wheat preservation after ensureFarmState
    const playerState = {
        inventory: { 'Golden Wheat': 5, 'GoldenWheat': 3 },
        farm: { storage: {}, plots: [] },
        cooldowns: {},
        perks: {},
        shop: { nextRestockAt: Date.now() + 100000, sellPrices: { 'Golden Wheat': 5000 }, buyListings: {}, boosterListings: {} },
        cash: 0
    };

    FarmEngine.ensureFarmState(playerState);
    assert.strictEqual(playerState.inventory['Golden Wheat'], 8);
    assert.strictEqual(playerState.inventory['GoldenWheat'], undefined);

    const sellResult = ShopEngine.sellItem(playerState, 'Golden Wheat', 2);
    assert.strictEqual(sellResult.success, true);
    assert.strictEqual(playerState.inventory['Golden Wheat'], 6);
    console.log('✓ Test 1 Passed: Golden Wheat canonical key preserved & sellable after farm sync');

    // 2. Unknown space-less item key fallback
    const customState = {
        inventory: { 'Custom Item': 2, 'CustomItem': 3 }
    };
    FarmEngine.ensureFarmState(customState);
    assert.strictEqual(customState.inventory['CustomItem'], 5);
    assert.strictEqual(customState.inventory['Custom Item'], undefined);
    console.log('✓ Test 2 Passed: Custom space-less items correctly consolidate to canonical no-space key');

    console.log('ALL AUDIT FIX REGRESSION TESTS PASSED!');
}

testAuditFixes();
