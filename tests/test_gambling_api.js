const assert = require('assert');
const GamblingEngine = require('../src/engine/gamblingEngine');

console.log('--- Testing Gambling API Handlers ---');

// Mock player state
const mockPlayer = {
    cash: 5000000000, // $5B
    perks: { numismatist: 1 },
    stats: {}
};

// Test Standard Flip Endpoint logic
const resStandard = GamblingEngine.rollCoinflip(mockPlayer, {
    wagerInput: '2k*2',
    choice: 'heads',
    mode: 'standard'
});

assert.strictEqual(resStandard.success, true);
assert.strictEqual(resStandard.wager, 4000);
assert.ok(mockPlayer.stats.coinflipWagered > 0);
console.log('✓ API handler standard roll verified');

// Test Streak Mode Endpoint logic
const resStreak = GamblingEngine.rollCoinflip(mockPlayer, {
    wagerInput: '25%',
    choice: 'tails',
    mode: 'streak'
});

assert.strictEqual(resStreak.success, true);
assert.strictEqual(resStreak.mode, 'streak');
console.log('✓ API handler streak roll verified');

console.log('--- Gambling API Handlers Verified Successfully ---');
