const assert = require('assert');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { RANKS } = require('../src/engine/dropTables');
const { calculateTargetedRankUpCost, getRankUpCost, getAscensionCost } = require('../src/utils/formulas');

console.log('Testing RankPrestigeEngine Targeted Rank Up & Ascension Costs...');

// 1. Verify Ascension at Tier 0 is Free ($0 cost, cash preserved)
{
    const playerState = {
        cash: 1000000000,
        rankIndex: 106,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    assert.strictEqual(RankPrestigeEngine.canAscend(playerState), true);
    assert.strictEqual(RankPrestigeEngine.getAscensionCost(playerState), 0);

    const res = RankPrestigeEngine.ascend(playerState);
    assert.strictEqual(res.success, true, 'Tier 0 Ascension should succeed');
    assert.strictEqual(playerState.cash, 1000000000, 'Tier 0 ascension is free ($0), cash must remain intact');
    assert.strictEqual(playerState.rankIndex, 0, 'Rank index should reset to 0');
    assert.strictEqual(playerState.prestigeCount, 1, 'Prestige count should be 1');
    assert.strictEqual(playerState.prestigePoints, 5, 'Prestige points should be 5');
    console.log('✔ Test 1 Passed: Tier 0 Ascension is free and preserves cash');
}

// 1b. Verify Ascension at Tier 1 costs $1.65B and deducts cash
{
    const playerState = {
        cash: 2000000000,
        rankIndex: 106,
        prestigeCount: 1,
        prestigePoints: 5,
        perks: {}
    };

    // Base ascension cost for Tier 1 = 550,000,000 * (1 + 2) = 1,650,000,000
    assert.strictEqual(RankPrestigeEngine.getAscensionCost(playerState), 1650000000);
    assert.strictEqual(RankPrestigeEngine.canAscend(playerState), true);

    const res = RankPrestigeEngine.ascend(playerState);
    assert.strictEqual(res.success, true, 'Tier 1 Ascension should succeed');
    assert.strictEqual(playerState.cash, 2000000000 - 1650000000, 'Tier 1 ascension cost must be deducted from cash');
    assert.strictEqual(playerState.rankIndex, 0);
    assert.strictEqual(playerState.prestigeCount, 2);
    assert.strictEqual(playerState.prestigePoints, 10);

    // Verify cannot ascend if insufficient cash
    const poorPlayer = {
        cash: 1000000000, // less than 1.65B
        rankIndex: 106,
        prestigeCount: 1,
        prestigePoints: 0,
        perks: {}
    };
    assert.strictEqual(RankPrestigeEngine.canAscend(poorPlayer), false);
    const failRes = RankPrestigeEngine.ascend(poorPlayer);
    assert.ok(failRes.error, 'Ascension should fail when cash is insufficient');

    // Verify Investiture discount (e.g. Lv 10 = 25% discount)
    const discountedPlayer = {
        cash: 1500000000,
        rankIndex: 106,
        prestigeCount: 1,
        prestigePoints: 0,
        perks: { investiture: 10 } // 25% discount on 1.65B = 1,237,500,000
    };
    assert.strictEqual(RankPrestigeEngine.getAscensionCost(discountedPlayer), 1237500000);
    assert.strictEqual(RankPrestigeEngine.canAscend(discountedPlayer), true);
    console.log('✔ Test 1b Passed: Tier 1+ Ascension fee deduction and Investiture discount verified');
}

// 2. Verify calculateTargetedRankUpCost within single tier with (tier + 1) multiplier
{
    const playerState = {
        cash: 100000,
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    // Tier 0: multiplier = 1
    // Cost to rank up from 0 to 1 (Serf: basePrice 15960 * 1 = 15960)
    const calc1 = calculateTargetedRankUpCost(playerState, 0, 1, RANKS, false);
    assert.strictEqual(calc1.totalCost, 15960, 'Cost for Rank 0 -> 1 at Tier 0 should be 15960');
    assert.strictEqual(calc1.affordable, true);

    // Cost to rank up from 0 to 2 (Serf: 15960 + Bum: 21920 = 37880)
    const calc2 = calculateTargetedRankUpCost(playerState, 0, 2, RANKS, false);
    assert.strictEqual(calc2.totalCost, 37880, 'Cost for Rank 0 -> 2 at Tier 0 should be 37880');
    assert.strictEqual(calc2.affordable, true);

    // Tier 1: multiplier = 2
    const tier1State = { ...playerState, prestigeCount: 1 };
    const calcTier1 = calculateTargetedRankUpCost(tier1State, 1, 1, RANKS, false);
    assert.strictEqual(calcTier1.totalCost, 15960 * 2, 'Cost for Rank 0 -> 1 at Tier 1 should be 31920 (2x)');

    console.log('✔ Test 2 Passed: Single tier cost calculations with (tier + 1) multiplier verified');
}

// 3. Verify targetedRankUp method execution
{
    const playerState = {
        cash: 100000,
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    const res = RankPrestigeEngine.targetedRankUp(playerState, 0, 2, false);
    assert.strictEqual(res.success, true);
    assert.strictEqual(playerState.rankIndex, 2);
    assert.strictEqual(playerState.cash, 100000 - 37880);
    console.log('✔ Test 3 Passed: Targeted rank up execution successful');
}

// 4. Verify Max Affordable calculation across ascensions
{
    const playerState = {
        cash: 100000000000, // 100 Billion
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    const calcMax = calculateTargetedRankUpCost(playerState, 0, 0, RANKS, true);
    assert(calcMax.targetTier > 0, 'Should ascend at least once with 100 Billion');
    assert(calcMax.totalCost <= 100000000000, 'Total cost should not exceed available cash');

    const resMax = RankPrestigeEngine.targetedRankUp(playerState, 0, 0, true);
    assert.strictEqual(resMax.success, true);
    assert.strictEqual(playerState.prestigeCount, calcMax.targetTier);
    assert.strictEqual(playerState.rankIndex, calcMax.targetRankIndex);
    assert(playerState.cash >= 0, 'Remaining cash should be non-negative');
    assert.strictEqual(playerState.prestigePoints, calcMax.targetTier * 5, 'Should gain 5 points per tier ascended');
    console.log('✔ Test 4 Passed: Max affordable calculation across multiple ascensions successful');
}

// 5. Verify Max Affordable with 5 Quadrillion cash (5e15)
{
    const playerState = {
        cash: 5000000000000000, // 5 Quadrillion
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    const startTime = Date.now();
    const calcMax = calculateTargetedRankUpCost(playerState, 0, 0, RANKS, true);
    const duration = Date.now() - startTime;

    assert(duration < 500, `Calculation should be fast (<500ms), took ${duration}ms`);
    assert(calcMax.targetTier > 0, 'Target tier must be positive');
    assert(calcMax.totalCost <= 5000000000000000, 'Total cost should not exceed 5 Quadrillion');
    assert(calcMax.affordable, 'Should be affordable');

    const resMax = RankPrestigeEngine.targetedRankUp(playerState, 0, 0, true);
    assert.strictEqual(resMax.success, true);
    assert.strictEqual(playerState.prestigeCount, calcMax.targetTier);
    assert.strictEqual(playerState.rankIndex, calcMax.targetRankIndex);
    assert.strictEqual(playerState.prestigePoints, calcMax.targetTier * 5);
    assert.strictEqual(playerState.cash, 5000000000000000 - calcMax.totalCost);
    assert(playerState.cash >= 0, 'Remaining cash should be non-negative');
    console.log(`✔ Test 5 Passed: 5 Quadrillion cash reached Tier ${calcMax.targetTier} Rank ${calcMax.targetRankIndex} in ${duration}ms`);
}

// 6. Verify custom high target tier (Tier 500)
{
    const playerState = {
        cash: 5000000000000000,
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    const calc500 = calculateTargetedRankUpCost(playerState, 500, 50, RANKS, false);
    assert.strictEqual(calc500.targetTier, 500, 'Target tier must match requested 500');
    assert.strictEqual(calc500.targetRankIndex, 50, 'Target rank index must match requested 50');
    assert.strictEqual(calc500.affordable, true, 'Should be affordable with 5 Quadrillion');
    assert(calc500.totalCost > 0, 'Total cost should be positive');

    const res500 = RankPrestigeEngine.targetedRankUp(playerState, 500, 50, false);
    assert.strictEqual(res500.success, true);
    assert.strictEqual(playerState.prestigeCount, 500);
    assert.strictEqual(playerState.rankIndex, 50);
    assert.strictEqual(playerState.prestigePoints, 500 * 5);
    assert(playerState.cash >= 0);
    console.log('✔ Test 6 Passed: Custom target tier calculation & execution verified');
}

// 7. Verify safe bounds protection on MAX_SAFE_INTEGER
{
    const playerState = {
        cash: Number.MAX_SAFE_INTEGER,
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: { cronyism: 25, investiture: 25 }
    };

    const calcSafe = calculateTargetedRankUpCost(playerState, 0, 0, RANKS, true);
    assert(calcSafe.affordable, 'Should be affordable');
    assert(calcSafe.targetTier > 0, 'Should reach tiers with max safe integer and max perks');
    assert(calcSafe.totalCost <= Number.MAX_SAFE_INTEGER, 'Cost must not exceed MAX_SAFE_INTEGER');

    const resSafe = RankPrestigeEngine.targetedRankUp(playerState, 0, 0, true);
    assert.strictEqual(resSafe.success, true);
    assert.strictEqual(playerState.prestigeCount, calcSafe.targetTier);
    assert.strictEqual(playerState.rankIndex, calcSafe.targetRankIndex);
    assert(playerState.cash >= 0);
    console.log(`✔ Test 7 Passed: MAX_SAFE_INTEGER reached Tier ${calcSafe.targetTier} Rank ${calcSafe.targetRankIndex}`);
}

console.log('ALL TARGETED RANK UP ENGINE TESTS PASSED!');
