const assert = require('assert');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { RANKS, PERK_DEFINITIONS } = require('../src/engine/dropTables');
const { getRankUpCost, getAscensionCost, calculateTargetedRankUpCost } = require('../src/utils/formulas');

console.log('================================================================');
console.log('  STARTING DEEP AUDIT: RANK-UP, ASCENSION, & PRESTIGE SYSTEM');
console.log('================================================================');

// -----------------------------------------------------------------
// 1. DATA INTEGRITY & RANK TABLE CHECKS
// -----------------------------------------------------------------
console.log('\n[1] Checking Rank Table & Perk Definitions Integrity...');
assert.strictEqual(RANKS.length, 107, 'Must have exactly 107 ranks (Peasant -> God)');
assert.strictEqual(RANKS[0].name, 'Peasant', 'Rank 1 must be Peasant');
assert.strictEqual(RANKS[0].index, 1, 'Rank 1 index must be 1');
assert.strictEqual(RANKS[0].basePrice, 10000, 'Peasant basePrice must be 10,000');
assert.strictEqual(RANKS[106].name, 'God', 'Rank 107 must be God');
assert.strictEqual(RANKS[106].index, 107, 'Rank 107 index must be 107');
assert.strictEqual(RANKS[106].basePrice, 250000000, 'God basePrice must be 250,000,000');

for (let i = 0; i < RANKS.length; i++) {
    assert.strictEqual(RANKS[i].index, i + 1, `Rank at index ${i} must have index ${i + 1}`);
    assert.ok(typeof RANKS[i].name === 'string' && RANKS[i].name.length > 0, `Rank at ${i} must have valid name`);
    assert.ok(typeof RANKS[i].basePrice === 'number' && RANKS[i].basePrice > 0, `Rank at ${i} must have positive basePrice`);
    if (i > 0) {
        assert.ok(RANKS[i].basePrice >= RANKS[i - 1].basePrice, `Rank ${RANKS[i].name} (${RANKS[i].basePrice}) must not be cheaper than ${RANKS[i - 1].name} (${RANKS[i - 1].basePrice})`);
    }
}
console.log('✔ Rank table integrity: All 107 ranks are monotonically non-decreasing and valid.');

// -----------------------------------------------------------------
// 2. FORMULAS PRECISION & BOUNDS CHECKS
// -----------------------------------------------------------------
console.log('\n[2] Checking Formula Precision & Caps...');

// getRankUpCost
assert.strictEqual(getRankUpCost(10000, 0, 0, false, 0), 10000, 'Tier 0, no perks = 10,000');
assert.strictEqual(getRankUpCost(10000, 0, 0, false, 1), 20000, 'Tier 1, no perks = 20,000 (2x)');
assert.strictEqual(getRankUpCost(10000, 0, 0, false, 2), 30000, 'Tier 2, no perks = 30,000 (3x)');
assert.strictEqual(getRankUpCost(10000, 0, 0, false, 9), 100000, 'Tier 9, no perks = 100,000 (10x)');

// Cronyism 25 (62.5% discount)
assert.strictEqual(getRankUpCost(10000, 25, 0, false, 0), 3750, '10,000 * 1 * 0.375 = 3750');
assert.strictEqual(getRankUpCost(10000, 25, 0, false, 1), 7500, '10,000 * 2 * 0.375 = 7500');

// Over-max level clamping (e.g. cronyism 30 should clamp to 25)
assert.strictEqual(getRankUpCost(10000, 30, 0, false, 0), 3750, 'Level 30 cronyism must clamp to max level 25 (62.5%)');

// Negative levels or tier bounds safety
assert.strictEqual(getRankUpCost(10000, -5, 0, false, -2), 10000, 'Negative values must safely normalize');

// getAscensionCost
assert.strictEqual(getAscensionCost(0, 0), 0, 'Tier 0 ascension is Free ($0)');
assert.strictEqual(getAscensionCost(0, 25), 0, 'Tier 0 ascension with perks is Free ($0)');
assert.strictEqual(getAscensionCost(1, 0), 1650000000, 'Tier 1 ascension = 550M * 3 = 1.65B');
assert.strictEqual(getAscensionCost(2, 0), 2200000000, 'Tier 2 ascension = 550M * 4 = 2.20B');
assert.strictEqual(getAscensionCost(3, 0), 2750000000, 'Tier 3 ascension = 550M * 5 = 2.75B');
assert.strictEqual(getAscensionCost(10, 0), 6600000000, 'Tier 10 ascension = 550M * 12 = 6.60B');

// Investiture 25 (62.5% discount) on Ascension
// 1.65B * (1 - 0.625) = 1.65B * 0.375 = 618,750,000
assert.strictEqual(getAscensionCost(1, 25), 618750000, 'Tier 1 ascension with max Investiture = 618,750,000');
assert.strictEqual(getAscensionCost(1, 30), 618750000, 'Investiture level 30 clamps to max 25');

console.log('✔ Formulas precision & bounds: All mathematical edge cases and caps verified.');

// -----------------------------------------------------------------
// 3. SINGLE PROMOTION & ASCENSION TRANSITIONS
// -----------------------------------------------------------------
console.log('\n[3] Checking Single Rank-Up & Ascension Transitions...');

// Transition from 0 to 106
const testState = {
    cash: 50000000000,
    rankIndex: 0,
    prestigeCount: 0,
    prestigePoints: 0,
    perks: { cronyism: 10 }
};

for (let r = 0; r < 106; r++) {
    const expectedNext = RANKS[r + 1];
    const cost = RankPrestigeEngine.getRankUpCost(testState);
    const expectedCost = getRankUpCost(expectedNext.basePrice, 10, 0, false, testState.prestigeCount);
    assert.strictEqual(cost, expectedCost);
    assert.strictEqual(RankPrestigeEngine.canRankUp(testState), true);

    const cashBefore = testState.cash;
    const res = RankPrestigeEngine.rankUp(testState);
    assert.strictEqual(res.success, true);
    assert.strictEqual(testState.rankIndex, r + 1);
    assert.strictEqual(testState.cash, cashBefore - expectedCost);
}

// Now at rankIndex 106 (God)
assert.strictEqual(testState.rankIndex, 106);
assert.strictEqual(RankPrestigeEngine.getRankUpCost(testState), null, 'At God rank, rank up cost is null');
assert.strictEqual(RankPrestigeEngine.canRankUp(testState), false, 'Cannot rank up past God');
const rankUpFail = RankPrestigeEngine.rankUp(testState);
assert.ok(rankUpFail.error, 'RankUp past God must return error');

// Tier 0 Ascension (Free)
assert.strictEqual(RankPrestigeEngine.getAscensionCost(testState), 0);
assert.strictEqual(RankPrestigeEngine.canAscend(testState), true);
const cashBeforeAscend0 = testState.cash;
const ascendRes0 = RankPrestigeEngine.ascend(testState);
assert.strictEqual(ascendRes0.success, true);
assert.strictEqual(testState.cash, cashBeforeAscend0, 'Tier 0 ascension must cost $0');
assert.strictEqual(testState.rankIndex, 0, 'Rank resets to 0 (Peasant)');
assert.strictEqual(testState.prestigeCount, 1, 'Prestige count incremented to 1');
assert.strictEqual(testState.prestigePoints, 5, 'Prestige points incremented by 5');

// Now in Tier 1: Rank from 0 to 106
for (let r = 0; r < 106; r++) {
    RankPrestigeEngine.rankUp(testState);
}
assert.strictEqual(testState.rankIndex, 106);

// Tier 1 Ascension: requires 1.65B (or discounted with investiture)
testState.perks.investiture = 20; // 50% discount -> 825,000,000
const tier1AscendCost = RankPrestigeEngine.getAscensionCost(testState);
assert.strictEqual(tier1AscendCost, 825000000);

// Insufficient cash check
testState.cash = 500000000; // less than 825M
assert.strictEqual(RankPrestigeEngine.canAscend(testState), false);
const failAscend = RankPrestigeEngine.ascend(testState);
assert.ok(failAscend.error, 'Ascension with insufficient cash must fail');

// Sufficient cash check
testState.cash = 1000000000; // 1B >= 825M
assert.strictEqual(RankPrestigeEngine.canAscend(testState), true);
const ascendRes1 = RankPrestigeEngine.ascend(testState);
assert.strictEqual(ascendRes1.success, true);
assert.strictEqual(testState.cash, 1000000000 - 825000000);
assert.strictEqual(testState.prestigeCount, 2);
assert.strictEqual(testState.prestigePoints, 10);
assert.strictEqual(testState.rankIndex, 0);

console.log('✔ Single rank promotion & ascension transitions verified across multiple tiers.');

// -----------------------------------------------------------------
// 4. TARGETED RANK-UP EDGE CASES & MAX AFFORDABLE INVARIANTS
// -----------------------------------------------------------------
console.log('\n[4] Checking Targeted Rank-Up Edge Cases & Invariants...');

// Edge case 4.1: Requesting current or lower tier/rank
{
    const state = { cash: 1000000, rankIndex: 5, prestigeCount: 2, prestigePoints: 10, perks: {} };
    const resSame = calculateTargetedRankUpCost(state, 2, 5, RANKS, false);
    assert.strictEqual(resSame.totalCost, 0);
    assert.strictEqual(resSame.affordable, true);
    assert.strictEqual(resSame.targetTier, 2);
    assert.strictEqual(resSame.targetRankIndex, 5);

    const resLower = calculateTargetedRankUpCost(state, 1, 10, RANKS, false);
    assert.strictEqual(resLower.totalCost, 0);
    assert.strictEqual(resLower.targetTier, 2);
    assert.strictEqual(resLower.targetRankIndex, 5);
}

// Edge case 4.2: Exact edge where player can reach God in Tier 1, but cannot afford ascension fee
{
    const state = { cash: 0, rankIndex: 0, prestigeCount: 1, prestigePoints: 0, perks: {} };
    // Calculate cost to reach God (rank 106) in Tier 1
    let costToGod = 0;
    for (let r = 1; r <= 106; r++) {
        costToGod += getRankUpCost(RANKS[r].basePrice, 0, 0, false, 1);
    }
    const ascendFeeTier1 = getAscensionCost(1, 0); // 1.65B

    // Give player exactly costToGod + ascendFeeTier1 - 1 (1 dollar short of ascension fee)
    state.cash = costToGod + ascendFeeTier1 - 1;
    const calc = calculateTargetedRankUpCost(state, 0, 0, RANKS, true);
    assert.strictEqual(calc.targetTier, 1, 'Should stay in Tier 1');
    assert.strictEqual(calc.targetRankIndex, 106, 'Should reach Rank 106 (God)');
    assert.strictEqual(calc.totalCost, costToGod, 'Should only spend costToGod');
    assert.strictEqual(state.cash - calc.totalCost, ascendFeeTier1 - 1, 'Remaining cash must equal unspent amount');

    // Give player exactly costToGod + ascendFeeTier1
    state.cash = costToGod + ascendFeeTier1;
    const calcAffordAscend = calculateTargetedRankUpCost(state, 0, 0, RANKS, true);
    assert.strictEqual(calcAffordAscend.targetTier, 2, 'Should ascend to Tier 2');
    assert.strictEqual(calcAffordAscend.targetRankIndex, 0, 'Should be at Peasant in Tier 2');
    assert.strictEqual(calcAffordAscend.totalCost, costToGod + ascendFeeTier1);
}

// Edge case 4.3: High Quadrillion stress test consistency between preview & execution
{
    const state = {
        cash: 1234567890123456, // ~1.23 Quadrillion
        rankIndex: 12,
        prestigeCount: 3,
        prestigePoints: 15,
        perks: { cronyism: 15, investiture: 12 }
    };

    const preview = calculateTargetedRankUpCost(state, 0, 0, RANKS, true);
    assert.ok(preview.affordable);
    assert.ok(preview.totalCost <= state.cash);
    assert.ok(preview.targetTier > 3);

    const exec = RankPrestigeEngine.targetedRankUp(state, 0, 0, true);
    assert.strictEqual(exec.success, true);
    assert.strictEqual(exec.totalCost, preview.totalCost);
    assert.strictEqual(state.prestigeCount, preview.targetTier);
    assert.strictEqual(state.rankIndex, preview.targetRankIndex);
    assert.strictEqual(state.cash, 1234567890123456 - preview.totalCost);
}

console.log('✔ Targeted rank up edge cases & Max Affordable mathematical invariants passed.');

console.log('\n================================================================');
console.log('  ALL AUDIT CHECKS & SYSTEM INVARIANTS PASSED 100% CLEANLY!');
console.log('================================================================\n');
