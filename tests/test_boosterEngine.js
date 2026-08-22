/**
 * Comprehensive Unit & Integration Test Suite for Loot Boosters (T1–T6)
 */
const assert = require('assert');
const BoosterEngine = require('../src/engine/boosterEngine');
const ActionEngine = require('../src/engine/actionEngine');
const { BOOSTER_TIERS, calculateBoosterMultiplier } = require('../src/utils/formulas');

function runBoosterTests() {
    console.log('--- Starting Loot Booster Engine Tests ---');

    // 1. Test Duration Definitions
    assert.strictEqual(BOOSTER_TIERS.T1.durationMs, 15 * 60 * 1000, 'T1 duration must be 15 mins');
    assert.strictEqual(BOOSTER_TIERS.T2.durationMs, 30 * 60 * 1000, 'T2 duration must be 30 mins');
    assert.strictEqual(BOOSTER_TIERS.T3.durationMs, 60 * 60 * 1000, 'T3 duration must be 1 hour');
    assert.strictEqual(BOOSTER_TIERS.T4.durationMs, 120 * 60 * 1000, 'T4 duration must be 2 hours');
    assert.strictEqual(BOOSTER_TIERS.T5.durationMs, 240 * 60 * 1000, 'T5 duration must be 4 hours');
    assert.strictEqual(BOOSTER_TIERS.T6.durationMs, 480 * 60 * 1000, 'T6 duration must be 8 hours');
    console.log('✓ Booster tier duration definitions verified (T1=15m, T2=30m, T3=1h, T4=2h, T5=4h, T6=8h)');

    // 2. Test Multiplicative Stacking Math (2^N)
    const now = 1000000;
    const activeState = {
        T1: now + 100000,
        T2: now + 100000,
        T3: now + 100000,
        T4: now + 100000,
        T5: now + 100000,
        T6: now + 100000
    };

    const calc6 = calculateBoosterMultiplier(activeState, now);
    assert.strictEqual(calc6.activeCount, 6, 'All 6 tiers should be active');
    assert.strictEqual(calc6.multiplier, 64, '6 active boosters must equal 64x loot multiplier (2^6)');
    console.log('✓ Multiplicative stacking verified: 6 active tiers = 64x multiplier');

    // Test partial stacking
    const calc3 = calculateBoosterMultiplier({ T1: now + 500, T3: now + 500, T5: now + 500 }, now);
    assert.strictEqual(calc3.activeCount, 3, '3 tiers should be active');
    assert.strictEqual(calc3.multiplier, 8, '3 active boosters must equal 8x loot multiplier (2^3)');
    console.log('✓ Partial stacking verified: 3 active tiers = 8x multiplier');

    // 3. Test Expiration Handling
    const expiredState = {
        T1: now - 500, // expired
        T2: now + 500, // active
        T3: now - 1000 // expired
    };
    const calcExpired = calculateBoosterMultiplier(expiredState, now);
    assert.strictEqual(calcExpired.activeCount, 1);
    assert.strictEqual(calcExpired.multiplier, 2);
    assert.deepStrictEqual(calcExpired.activeTiers, ['T2']);
    console.log('✓ Expiration handling verified: expired boosters are ignored');

    // 4. Test BoosterEngine State & Direct Activation
    const playerState = {
        cash: 1000,
        inventory: {},
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 }
    };

    BoosterEngine.ensureBoosterState(playerState);
    assert.ok(playerState.boosters && playerState.boosters.activeUntil, 'activeUntil structure must be created');

    const actRes = BoosterEngine.activateBoosterDirect(playerState, 'mine', 'T1');
    assert.strictEqual(actRes.success, true);
    assert.strictEqual(actRes.boosterMultiplier, 2);
    assert.strictEqual(playerState.boosters.activeUntil.mine.T1 > Date.now(), true);
    console.log('✓ BoosterEngine direct activation verified');

    // 5. Test Inventory Booster Usage
    playerState.inventory['Prospector Kit'] = 3;
    const useRes = BoosterEngine.useBooster(playerState, 'Prospector Kit');
    assert.strictEqual(useRes.success, true);
    assert.strictEqual(playerState.inventory['Prospector Kit'], 2, 'Inventory count should be decremented to 2');
    console.log('✓ BoosterEngine inventory consumption verified');

    // 6. Test ActionEngine integration with active boosters
    playerState.cooldowns.mine = 0;
    // Activate all 6 tiers for mining
    ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].forEach(tier => {
        BoosterEngine.activateBoosterDirect(playerState, 'mine', tier);
    });

    const actionRes = ActionEngine.performAction(playerState, 'mine');
    assert.strictEqual(actionRes.success, true);
    assert.strictEqual(actionRes.boosterMultiplier, 64, 'ActionEngine must use 64x booster multiplier when all 6 tiers are active');
    assert.strictEqual(actionRes.formattedText.includes('64.00× from Active Loot Boosters'), true, 'Formatted text must present 64.00x booster readout');
    console.log('✓ ActionEngine integration verified: 64x multiplier correctly applied to drops & output text');

    console.log('--- All Loot Booster Engine Tests Passed Successfully! ---');
}

runBoosterTests();
