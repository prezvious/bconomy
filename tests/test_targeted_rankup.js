const assert = require('assert');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { RANKS } = require('../src/engine/dropTables');
const { calculateTargetedRankUpCost, getRankUpCost } = require('../src/utils/formulas');

console.log('Testing RankPrestigeEngine Targeted Rank Up & Cash Preservation...');

// 1. Verify Ascension preserves cash
{
    const playerState = {
        cash: 1000000000,
        rankIndex: 106,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    const res = RankPrestigeEngine.ascend(playerState);
    assert.strictEqual(res.success, true, 'Ascension should succeed');
    assert.strictEqual(playerState.cash, 1000000000, 'Cash MUST be preserved upon ascension (not reset to 0)');
    assert.strictEqual(playerState.rankIndex, 0, 'Rank index should reset to 0');
    assert.strictEqual(playerState.prestigeCount, 1, 'Prestige count should be 1');
    assert.strictEqual(playerState.prestigePoints, 5, 'Prestige points should be 5');
    console.log('✔ Test 1 Passed: Ascension preserves cash');
}

// 2. Verify calculateTargetedRankUpCost within single tier
{
    const playerState = {
        cash: 50000,
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        perks: {}
    };

    // Cost to rank up from 0 to 1 (Serf: basePrice 15960)
    const calc1 = calculateTargetedRankUpCost(playerState, 0, 1, RANKS, false);
    assert.strictEqual(calc1.totalCost, 15960, 'Cost for Rank 0 -> 1 should be 15960');
    assert.strictEqual(calc1.affordable, true, 'Player has 50k cash, should be affordable');

    // Cost to rank up from 0 to 2 (Serf: 15960 + Bum: 21920 = 37880)
    const calc2 = calculateTargetedRankUpCost(playerState, 0, 2, RANKS, false);
    assert.strictEqual(calc2.totalCost, 37880, 'Cost for Rank 0 -> 2 should be 37880');
    assert.strictEqual(calc2.affordable, true, 'Player has 50k cash, should be affordable');
    console.log('✔ Test 2 Passed: Single tier cost calculations correct');
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

console.log('ALL TARGETED RANK UP ENGINE TESTS PASSED!');
