const assert = require('assert');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { RANKS } = require('../src/engine/dropTables');
const { calculateTargetedRankUpCost, MAX_TARGETED_TIER_ADVANCE } = require('../src/utils/formulas');

console.log('--- Running Targeted Advancement Hardening Tests ---');

const state = { cash: 0, rankIndex: 0, prestigeCount: 12, prestigePoints: 0, perks: {} };
const maximumTier = state.prestigeCount + MAX_TARGETED_TIER_ADVANCE;
const atLimit = calculateTargetedRankUpCost(state, maximumTier, 0, RANKS, false);
assert.strictEqual(atLimit.code, undefined);
assert.strictEqual(atLimit.targetTier, maximumTier);

const startedAt = Date.now();
const overLimit = calculateTargetedRankUpCost(state, maximumTier + 1, 0, RANKS, false);
assert(Date.now() - startedAt < 100, 'oversized explicit targets should reject before tier iteration');
assert.strictEqual(overLimit.code, 'TARGET_TIER_OUT_OF_RANGE');
assert.strictEqual(overLimit.maximumTargetTier, maximumTier);
assert.strictEqual(overLimit.maxTargetedTierAdvance, 3000);

for (const target of [Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, null, '', 'not-a-tier']) {
    const invalid = calculateTargetedRankUpCost(state, target, 1, RANKS, false);
    assert.strictEqual(invalid.code, 'INVALID_TARGET');
}
assert.strictEqual(calculateTargetedRankUpCost(state, '13', '1', RANKS, false).targetTier, 13);

const already = calculateTargetedRankUpCost({ ...state, cash: 100 }, 12, 0, RANKS, false);
assert.strictEqual(already.reason, 'ALREADY_REACHED');
assert.strictEqual(already.canAdvance, false);

const insufficient = calculateTargetedRankUpCost(state, 12, 1, RANKS, false);
assert.strictEqual(insufficient.reason, 'INSUFFICIENT_CASH');
assert.strictEqual(insufficient.canAdvance, false);
assert.strictEqual(insufficient.deficit, insufficient.nextCost);

const readyState = { ...state, cash: insufficient.totalCost };
const ready = calculateTargetedRankUpCost(readyState, 12, 1, RANKS, false);
assert.strictEqual(ready.reason, 'READY');
assert.strictEqual(ready.canAdvance, true);
assert.strictEqual(ready.deficit, 0);

const freeGod = { cash: 0, rankIndex: 106, prestigeCount: 0, prestigePoints: 0, perks: {} };
const freePreview = RankPrestigeEngine.previewTargetedRankUp(freeGod, 1, 0, false);
assert.strictEqual(freePreview.reason, 'READY');
assert.strictEqual(freePreview.totalCost, 0);
assert.strictEqual(RankPrestigeEngine.targetedRankUp(freeGod, 1, 0, false).success, true);
assert.strictEqual(freeGod.prestigeCount, 1);
assert.strictEqual(freeGod.rankIndex, 0);

const paidGod = { cash: 0, rankIndex: 106, prestigeCount: 1, prestigePoints: 0, perks: {} };
const paidPreview = RankPrestigeEngine.previewTargetedRankUp(paidGod, 2, 0, false);
assert.strictEqual(paidPreview.reason, 'INSUFFICIENT_CASH');
assert(paidPreview.deficit > 0);

const hugeMax = { cash: 500000000000000, rankIndex: 0, prestigeCount: 0, prestigePoints: 0, perks: {} };
const maxPreview = calculateTargetedRankUpCost(hugeMax, 0, 0, RANKS, true);
assert.strictEqual(maxPreview.reason, 'READY');
assert.strictEqual(maxPreview.code, undefined, 'max-affordable remains governed by cash rather than the explicit-target cap');

console.log('✓ Bounds, unsafe inputs, preview reasons, free/paid God ascension, and max-affordable behavior verified');
