const assert = require('assert');
const { FactionEngine, getCostPerHour, getMultiplierForLevel, getMultiplierTable, MAX_MULTIPLIER_LEVEL, FACTION_CREATION_COST } = require('../src/engine/factionEngine');
const ActionEngine = require('../src/engine/actionEngine');
const { RANKS } = require('../src/engine/dropTables');

console.log('--- Starting Faction Engine Unit Tests ---');

// Mock Player State
function getMockState() {
    return {
        cash: 1000000000, // $1 Billion
        rankIndex: 0,
        prestigeCount: 0,
        inventory: {},
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        perks: { partiality: 0, serendipity: 0, amnesiac: 0 },
        cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 },
        faction: {
            created: true,
            name: 'The Syndicate',
            description: 'An industrious guild of magnates and gatherers.',
            points: 0,
            lifetimeContributed: 0,
            boosts: {}
        }
    };
}

// Test 1: Unaffiliated State Normalization & Multiplier Defaults
{
    const state = { cash: 500000, faction: null };
    FactionEngine.ensureFactionState(state);
    assert.strictEqual(state.faction, null, 'Unaffiliated player should remain faction = null');
    assert.strictEqual(FactionEngine.getFactionMultiplier(state, 'mine'), 1.0, 'Multiplier should be 1.0 when unaffiliated');

    // Deposit should fail when unaffiliated
    const depositRes = FactionEngine.depositCash(state, 100000);
    assert.ok(depositRes.error, 'Deposit should fail if player has no faction');

    console.log('✓ Test 1: Unaffiliated state normalization & 1.0x baseline verified');
}

// Test 2: Faction Creation ($1,000,000 Cost)
{
    const poorState = { cash: 500000, faction: null };
    const failRes = FactionEngine.createFaction(poorState, 'Poor Guild', 'Desc');
    assert.ok(failRes.error, 'Creation should fail with insufficient cash');
    assert.strictEqual(poorState.faction, null);
    assert.strictEqual(poorState.cash, 500000);

    const richState = { cash: 5000000, faction: null };
    const createRes = FactionEngine.createFaction(richState, 'Solar Dynasty', 'Reaching the cosmos.');
    assert.strictEqual(createRes.success, true);
    assert.strictEqual(richState.cash, 4000000, 'Creation should deduct exactly $1,000,000 cash');
    assert.strictEqual(richState.faction.created, true);
    assert.strictEqual(richState.faction.name, 'Solar Dynasty');
    assert.strictEqual(richState.faction.description, 'Reaching the cosmos.');
    assert.strictEqual(richState.faction.points, 0);

    // Double creation should fail
    const doubleRes = FactionEngine.createFaction(richState, 'Another Guild', 'Desc');
    assert.ok(doubleRes.error, 'Cannot create multiple factions');

    console.log('✓ Test 2: Faction creation with $1,000,000 fee and duplicate protection verified');
}

// Test 3: Cash to FP Deposit (1:1 Parity)
{
    const state = getMockState();
    const depositAmt = 50000000; // $50 Million
    const res = FactionEngine.depositCash(state, depositAmt);
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.faction.points, 50000000);
    assert.strictEqual(state.faction.lifetimeContributed, 50000000);
    assert.strictEqual(state.cash, 950000000);

    // Insufficient cash check
    const failRes = FactionEngine.depositCash(state, 2000000000);
    assert.ok(failRes.error);
    console.log('✓ Test 3: 1:1 Cash to FP deposit and lifetime contribution verified');
}

// Test 4: Multiplier and Cost Curve Verification
{
    // Level 0: Inactive
    assert.strictEqual(getMultiplierForLevel(0), 1.0);
    assert.strictEqual(getCostPerHour(0), 0);

    // Level 1: 1.25x
    assert.strictEqual(getMultiplierForLevel(1), 1.25);
    assert.strictEqual(getCostPerHour(1), 100000); // 100k FP/hr

    // Level 4: 2.00x
    assert.strictEqual(getMultiplierForLevel(4), 2.00);
    assert.strictEqual(getCostPerHour(4), 1600000); // 1.6M FP/hr

    // Level 16: 5.00x Threshold
    assert.strictEqual(getMultiplierForLevel(16), 5.00);
    assert.strictEqual(getCostPerHour(16), 25600000); // 25.6M FP/hr

    // Level 20: 6.00x (Steep 5x+)
    assert.strictEqual(getMultiplierForLevel(20), 6.00);
    const cost20 = getCostPerHour(20);
    assert.ok(cost20 > 200000000, `Level 20 cost (${cost20}) should exceed 200M`);

    // Level 36: 10.00x (Max God-Tier Sink)
    assert.strictEqual(getMultiplierForLevel(36), 10.00);
    const cost36 = getCostPerHour(36);
    assert.ok(cost36 > 6000000000, `Level 36 cost (${cost36}) should exceed 6 Billion FP/hr`);

    const table = getMultiplierTable();
    assert.strictEqual(table.length, 37); // 0 to 36
    console.log('✓ Test 4: Multiplier benchmarks and steep 5x+ cost curve verified');
}

// Test 5: Duration Boost Activation & Extension
{
    const state = getMockState();
    FactionEngine.depositCash(state, 100000000); // $100M -> 100M FP
    const now = 1000000;

    // Activate 2.0x (Level 4) for 2 hours (1.6M/hr * 2 = 3.2M FP)
    const actRes = FactionEngine.activateBoost(state, 'mine', 4, 2, 'duration', now);
    assert.strictEqual(actRes.success, true);
    assert.strictEqual(actRes.multiplier, 2.00);
    assert.strictEqual(actRes.costPaid, 3200000);
    assert.strictEqual(state.faction.points, 100000000 - 3200000);
    assert.strictEqual(actRes.activeUntil, now + (2 * 3600 * 1000));

    // Multiplier active check
    const mult = FactionEngine.getFactionMultiplier(state, 'mine', now + 1000);
    assert.strictEqual(mult, 2.00);

    // Multiplier expired check
    const expiredMult = FactionEngine.getFactionMultiplier(state, 'mine', now + (3 * 3600 * 1000));
    assert.strictEqual(expiredMult, 1.00);
    console.log('✓ Test 5: Duration boost activation, FP deduction, and expiration verified');
}

// Test 6: Continuous Drain Mode & 0 FP Auto-Reset
{
    const state = getMockState();
    state.faction.points = 3200000; // 3.2M FP
    const now = 1000000;

    // Start continuous boost at Level 4 (1.6M/hr) -> 3.2M FP lasts exactly 2 hours
    const res = FactionEngine.activateBoost(state, 'hunt', 4, 1, 'continuous', now);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.mode, 'continuous');

    // 1 hour passes: 1.6M FP should be drained
    FactionEngine.processFactionState(state, now + (1 * 3600 * 1000));
    assert.strictEqual(state.faction.points, 1600000);
    assert.strictEqual(FactionEngine.getFactionMultiplier(state, 'hunt', now + (1 * 3600 * 1000)), 2.00);

    // 3 hours pass (total): FP exhausts, multiplier should reset to 1.0x (Level 0)
    FactionEngine.processFactionState(state, now + (3 * 3600 * 1000));
    assert.strictEqual(state.faction.points, 0);
    assert.strictEqual(state.faction.boosts.hunt.level, 0);
    assert.strictEqual(FactionEngine.getFactionMultiplier(state, 'hunt', now + (3 * 3600 * 1000)), 1.00);
    console.log('✓ Test 6: Continuous drain mode and zero-FP auto-reset verified');
}

// Test 7: Instant Changes and Stop Boost
{
    const state = getMockState();
    state.faction.points = 100000000;
    const now = 1000000;

    FactionEngine.activateBoost(state, 'fish', 2, 1, 'duration', now); // 1.5x
    assert.strictEqual(FactionEngine.getFactionMultiplier(state, 'fish', now), 1.50);

    // Upgrade immediately to Level 8 (3.0x) without cooldown
    FactionEngine.activateBoost(state, 'fish', 8, 1, 'duration', now);
    assert.strictEqual(FactionEngine.getFactionMultiplier(state, 'fish', now), 3.00);

    // Stop boost
    const stopRes = FactionEngine.stopBoost(state, 'fish', now);
    assert.strictEqual(stopRes.success, true);
    assert.strictEqual(FactionEngine.getFactionMultiplier(state, 'fish', now), 1.00);
    console.log('✓ Test 7: Instant level switching and manual boost deactivation verified');
}

// Test 8: Integration with ActionEngine (All 5 Actions)
{
    const state = getMockState();
    state.faction.points = 500000000;
    const now = 1000000;

    // 1. Mine with 2.0x Faction Boost
    FactionEngine.activateBoost(state, 'mine', 4, 1, 'duration', now); // 2.0x
    const mineRes = ActionEngine.performAction(state, 'mine', now);
    assert.strictEqual(mineRes.success, true);
    assert.strictEqual(mineRes.factionMultiplier, 2.00);
    assert.ok(mineRes.formattedText.includes('2.00× from Faction Boost'));

    // Reset mine cooldown
    state.cooldowns.mine = 0;

    // 2. Work with 3.0x Faction Boost
    FactionEngine.activateBoost(state, 'work', 8, 1, 'duration', now); // 3.0x
    const workRes = ActionEngine.performAction(state, 'work', now);
    assert.strictEqual(workRes.success, true);
    assert.strictEqual(workRes.factionMultiplier, 3.00);
    assert.ok(workRes.formattedText.includes('3.00× from Faction Boost'));
    console.log('✓ Test 8: Integration across ActionEngine (gathering + work payouts) verified');
}

// Test 9: Customization Validation
{
    const state = getMockState();
    const res = FactionEngine.updateCustomization(state, 'Nova Dynasty', 'Rising beyond the stars.');
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.faction.name, 'Nova Dynasty');
    assert.strictEqual(state.faction.description, 'Rising beyond the stars.');

    // Long name truncation (max 32 chars)
    const longName = 'A'.repeat(50);
    FactionEngine.updateCustomization(state, longName, 'Test');
    assert.strictEqual(state.faction.name.length, 32);
    console.log('✓ Test 9: Faction name and description customization and sanitization verified');
}

// Test 10: Exclusive Active Mode Locking (Continuous vs Fixed Duration)
{
    const state = getMockState();
    state.faction.points = 100000000; // 100M FP
    const now = 1000000;

    // 1. Activate Continuous Boost on 'mine'
    const contRes = FactionEngine.activateBoost(state, 'mine', 4, 1, 'continuous', now);
    assert.strictEqual(contRes.success, true);
    assert.strictEqual(state.faction.boosts.mine.mode, 'continuous');

    // 2. Attempting to activate duration mode directly on active continuous boost should fail
    const durFail = FactionEngine.activateBoost(state, 'mine', 8, 2, 'duration', now);
    assert.ok(durFail.error, 'Should fail to switch directly to duration mode while continuous is active');

    // 3. Updating continuous level directly SHOULD succeed
    const contUpdate = FactionEngine.activateBoost(state, 'mine', 8, 1, 'continuous', now);
    assert.strictEqual(contUpdate.success, true);
    assert.strictEqual(state.faction.boosts.mine.level, 8);

    // 4. Stop continuous boost 100%
    FactionEngine.stopBoost(state, 'mine', now);
    assert.strictEqual(state.faction.boosts.mine.level, 0);

    // 5. Now activating Duration mode SHOULD succeed
    const durOk = FactionEngine.activateBoost(state, 'mine', 4, 2, 'duration', now);
    assert.strictEqual(durOk.success, true);
    assert.strictEqual(state.faction.boosts.mine.mode, 'duration');

    // 6. Attempting to activate continuous mode on active duration boost should fail
    const contFail = FactionEngine.activateBoost(state, 'mine', 6, 1, 'continuous', now);
    assert.ok(contFail.error, 'Should fail to switch directly to continuous mode while duration is active');

    console.log('✓ Test 10: Exclusive active mode locking between Continuous & Fixed Duration verified');
}

console.log('--- ALL FACTION ENGINE UNIT TESTS PASSED CLEANLY! ---');

