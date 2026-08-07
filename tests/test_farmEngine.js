/**
 * Unit tests for FarmEngine module.
 */

const assert = require('assert');
const { FarmEngine, CROP_DEFINITIONS } = require('../src/engine/farmEngine');

function runTests() {
    console.log('--- Starting FarmEngine Unit Tests ---');

    let now = 1000000000;

    // Test 1: State Normalization
    const playerState = {};
    FarmEngine.ensureFarmState(playerState);
    assert.ok(playerState.farm);
    assert.strictEqual(playerState.farm.plots.length, 1);
    assert.strictEqual(playerState.farm.waterAvailableAt, 0);
    assert.strictEqual(playerState.farm.storage['Blueberry'], 0);
    console.log('✓ Test 1: State Normalization passed');

    // Test 2: Planting & Automatic Harvest offline catchup
    FarmEngine.plantCrop(playerState, 1, 'Blueberry', now);
    assert.strictEqual(playerState.farm.plots[0].crop, 'Blueberry');
    assert.strictEqual(playerState.farm.plots[0].nextHarvestAt, now + 20000);

    // Fast-forward 65 seconds (3 completed cycles of Blueberry @ 20s)
    // Use deterministic RNG (no Berry Burst hits)
    const noBurstRng = () => 0.50; // > 0.02
    FarmEngine.processFarmState(playerState, now + 65000, noBurstRng);

    // Should yield 3 cycles * 3 = 9 Blueberries in storage
    assert.strictEqual(playerState.farm.storage['Blueberry'], 9);
    assert.strictEqual(playerState.farm.plots[0].nextHarvestAt, now + 80000);
    console.log('✓ Test 2: Planting & Offline catchup passed');

    // Test 3: Berry Burst 2% Double Yield
    playerState.farm.storage['Blueberry'] = 0;
    playerState.farm.plots[0].nextHarvestAt = now + 80000;
    const burstRng = () => 0.01; // < 0.02 (Berry Burst hits!)
    FarmEngine.processFarmState(playerState, now + 80000, burstRng);
    // 1 cycle completed * (3 base * 2 burst) = 6 Blueberries
    assert.strictEqual(playerState.farm.storage['Blueberry'], 6);
    console.log('✓ Test 3: Berry Burst double yield passed');

    // Test 4: Compost ordering and single harvest expiry
    playerState.farm.storage['Pumpkin'] = 0;
    playerState.inventory['Pumpkin'] = 2;
    playerState.farm.plots[0].nextHarvestAt = now + 100000;
    const compostRes = FarmEngine.applyCompost(playerState, 1, now + 85000);
    assert.strictEqual(compostRes.success, true);
    assert.strictEqual(playerState.farm.plots[0].composted, true);
    assert.strictEqual(playerState.inventory['Pumpkin'], 1);

    // Process harvest with Compost (round(3 * 1.7) = 5) and Berry Burst (5 * 2 = 10)
    playerState.farm.storage['Blueberry'] = 0;
    FarmEngine.processFarmState(playerState, now + 105000, burstRng);
    assert.strictEqual(playerState.farm.storage['Blueberry'], 10);
    assert.strictEqual(playerState.farm.plots[0].composted, false); // Expired!
    console.log('✓ Test 4: Compost ordering & expiry passed');

    // Test 5: Precise Watering rules (remaining <= 30 mins)
    playerState.farm.plots[0].nextHarvestAt = now + 115000; // 10s remaining (< 30m)
    playerState.farm.waterAvailableAt = 0;
    const waterRes = FarmEngine.waterPlot(playerState, 1, now + 105000, noBurstRng);
    assert.strictEqual(waterRes.success, true);
    // Generated exactly 1 harvest (3 blueberries)
    assert.strictEqual(playerState.farm.storage['Blueberry'], 13); 
    // Global water cooldown set to now + 10 mins (600,000 ms)
    assert.strictEqual(playerState.farm.waterAvailableAt, now + 105000 + 600000);
    console.log('✓ Test 5: Precise Watering single harvest passed');

    // Test 6: Melon Hydration usage
    playerState.inventory['Melon'] = 1;
    const melonRes = FarmEngine.useMelon(playerState, now + 105000);
    assert.strictEqual(melonRes.success, true);
    assert.strictEqual(playerState.farm.waterAvailableAt, 0);
    assert.strictEqual(playerState.inventory['Melon'], 0);
    console.log('✓ Test 6: Melon Hydration usage passed');

    // Test 7: Golden Wheat & Golden Pay Claiming
    playerState.farm.plots[0].crop = null;
    FarmEngine.plantCrop(playerState, 1, 'Golden Wheat', now + 110000);
    playerState.farm.storage['Golden Wheat'] = 10;
    playerState.cash = 5000;

    const claimRes = FarmEngine.claimCrops(playerState, 'Golden Wheat', now + 110000);
    assert.strictEqual(claimRes.success, true);
    assert.strictEqual(playerState.inventory['Golden Wheat'], 10);
    assert.strictEqual(playerState.farm.storage['Golden Wheat'], 0);
    // Cash increased by 10 * 10,000 = 100,000
    assert.strictEqual(playerState.cash, 105000);
    console.log('✓ Test 7: Golden Pay wheat claiming passed');

    // Test 8: Coffee Caffeine benefit
    FarmEngine.addPlot(playerState, now + 110000); // Plot 2
    FarmEngine.removePlant(playerState, 1, now + 110000);
    FarmEngine.plantCrop(playerState, 1, 'Coffee', now + 110000);
    FarmEngine.plantCrop(playerState, 2, 'Coffee', now + 110000);

    playerState.farm.storage['Coffee'] = 5;
    playerState.cooldowns = {
        work: now + 110000 + 100000,
        mine: now + 110000 + 50000,
        explore: now + 110000 + 50000,
        hunt: now + 110000 + 50000,
        fish: now + 110000 + 50000
    };

    const claimCoffeeRes = FarmEngine.claimCrops(playerState, 'Coffee', now + 110000);
    assert.strictEqual(claimCoffeeRes.success, true);
    assert.strictEqual(claimCoffeeRes.caffeineTriggered, true);
    assert.strictEqual(claimCoffeeRes.cooldownReductionMs, 2000); // 2 active coffee plots = 2s = 2000ms
    assert.strictEqual(playerState.cooldowns.work, now + 110000 + 98000);
    console.log('✓ Test 8: Coffee Caffeine cooldown reduction passed');

    // Test 9: Bulk Plant All Plots for Free
    playerState.farm.plots.forEach(p => { p.crop = null; });
    const plantAllRes = FarmEngine.plantAllPlots(playerState, 'Melon', now + 120000);
    assert.strictEqual(plantAllRes.success, true);
    assert.strictEqual(plantAllRes.plantedCount, 2);
    assert.strictEqual(playerState.farm.plots[0].crop, 'Melon');
    assert.strictEqual(playerState.farm.plots[1].crop, 'Melon');
    console.log('✓ Test 9: Bulk plant all plots for free passed');

    // Test 10: Bulk Water All Plots
    playerState.farm.waterAvailableAt = 0;
    const waterAllRes = FarmEngine.waterAllPlots(playerState, now + 120000, noBurstRng);
    assert.strictEqual(waterAllRes.success, true);
    assert.strictEqual(waterAllRes.wateredCount, 2);
    assert.strictEqual(playerState.farm.waterAvailableAt, now + 120000 + 600000);
    console.log('✓ Test 10: Bulk water all plots passed');

    console.log('--- All FarmEngine Unit Tests Passed Successfully! ---');
}

runTests();
