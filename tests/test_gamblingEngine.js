const assert = require('assert');
const {
    BASE_BET_LIMIT,
    BET_LIMIT_PER_NUMISMATIST,
    getMaxBetLimit,
    parseBetExpression,
    rollCoinflip,
    ensureGamblingStats
} = require('../src/engine/gamblingEngine');

console.log('--- Testing gamblingEngine ---');

// 1. Max Bet Limit calculations
assert.strictEqual(getMaxBetLimit(0), 1000000000);
assert.strictEqual(getMaxBetLimit(1), 6000000000);
assert.strictEqual(getMaxBetLimit(20), 101000000000);
console.log('✓ getMaxBetLimit tests passed');

// 2. Bet expression parsing tests
const cash = 50000000000; // $50B
const limit = 10000000000; // $10B limit

// Numbers & Suffixes
assert.deepStrictEqual(parseBetExpression('5000', cash, limit), { wager: 5000 });
assert.deepStrictEqual(parseBetExpression('2k', cash, limit), { wager: 2000 });
assert.deepStrictEqual(parseBetExpression('5m', cash, limit), { wager: 5000000 });
assert.deepStrictEqual(parseBetExpression('1b', cash, limit), { wager: 1000000000 });
console.log('✓ Numbers & Suffixes parsed');

// Percentages
assert.deepStrictEqual(parseBetExpression('25%', cash, limit), { wager: 2500000000 });
assert.deepStrictEqual(parseBetExpression('100%', cash, limit), { wager: 10000000000 });
assert.deepStrictEqual(parseBetExpression('25%', 100000, 1000000000), { wager: 25000 }); // 25% of $100k cash
assert.deepStrictEqual(parseBetExpression('50%', 100000, 1000000000), { wager: 50000 }); // 50% of $100k cash
console.log('✓ Percentages parsed');

// Math expressions
assert.deepStrictEqual(parseBetExpression('2k*2', cash, limit), { wager: 4000 });
assert.deepStrictEqual(parseBetExpression('10m/2', cash, limit), { wager: 5000000 });
assert.deepStrictEqual(parseBetExpression('100k+50k', cash, limit), { wager: 150000 });
console.log('✓ Math expressions parsed');

// Keywords
assert.deepStrictEqual(parseBetExpression('max', cash, limit), { wager: 10000000000 });
assert.deepStrictEqual(parseBetExpression('all', 500, limit), { wager: 500 });
console.log('✓ Keywords parsed');

// Errors
assert.strictEqual(!!parseBetExpression('abc', cash, limit).error, true);
assert.strictEqual(!!parseBetExpression('-500', cash, limit).error, true);
assert.strictEqual(!!parseBetExpression('20b', cash, limit).error, true); // exceeds $10B limit
console.log('✓ Error handling parsed');

// 3. Coinflip Standard Roll Execution
const mockState = {
    cash: 100000000,
    perks: { numismatist: 2 },
    stats: {}
};

const resStandard = rollCoinflip(mockState, {
    wagerInput: '10m',
    choice: 'heads',
    mode: 'standard'
});

assert.strictEqual(resStandard.success, true);
assert.strictEqual(resStandard.mode, 'standard');
assert.strictEqual(typeof resStandard.isWin, 'boolean');
assert.ok(mockState.stats.coinflipWagered > 0);
console.log('✓ Standard roll coinflip passed');

// 4. Coinflip Streak Double-Down Roll & Cash Out Execution
const streakState = {
    cash: 100000000,
    perks: { numismatist: 0 },
    stats: {}
};

const resStreak = rollCoinflip(streakState, {
    wagerInput: '100k',
    choice: 'tails',
    mode: 'streak'
});

assert.strictEqual(resStreak.success, true);
assert.strictEqual(resStreak.mode, 'streak');

if (resStreak.isWin) {
    assert.strictEqual(resStreak.streakCount, 1);
    assert.ok(resStreak.currentPool > 0);

    // Test Cash out
    const resCashOut = rollCoinflip(streakState, {
        mode: 'streak',
        isCashOut: true,
        streakState: { currentPool: resStreak.currentPool, streakCount: resStreak.streakCount }
    });
    assert.strictEqual(resCashOut.success, true);
    assert.strictEqual(resCashOut.action, 'cash_out');
    assert.strictEqual(resCashOut.cashedOutAmount, resStreak.currentPool);
}

console.log('✓ Streak Double-Down coinflip passed');

// 5. Slots Spin Execution & jackpot_fever Perk Test
const { rollSlots, SLOT_SYMBOLS } = require('../src/engine/gamblingEngine');

const slotsState = {
    cash: 5000000000,
    perks: { numismatist: 1, jackpot_fever: 10 }, // 10 * 5% = +50% payout boost
    stats: {}
};

const slotsRes = rollSlots(slotsState, { wagerInput: '10m' });
assert.strictEqual(slotsRes.success, true);
assert.strictEqual(slotsRes.reels.length, 3);
assert.ok(slotsState.stats.slotsSpins > 0);
console.log('✓ Slots spin execution passed');

console.log('--- All gamblingEngine tests passed successfully! ---');
