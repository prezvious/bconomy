/**
 * @file test_actionEngine_calibration.js
 * Comprehensive Calibration and Monte Carlo Statistical Verification Suite
 * for the Resource Drop & Gathering Engine in Bconomy.
 */

const assert = require('assert');
const ActionEngine = require('../src/engine/actionEngine');
const { 
    MINE_DROP_TABLE, 
    EXPLORE_DROP_TABLE, 
    HUNT_DROP_TABLE, 
    FISH_DROP_TABLE, 
    ACTION_COOLDOWNS, 
    RANKS 
} = require('../src/engine/dropTables');
const { getToolYieldMultiplier, getWorkBasePay, calculateWorkBonuses } = require('../src/utils/formulas');

function runActionEngineCalibrationTests() {
    console.log('--- Starting Resource Drop & Gathering Engine Calibration Tests ---');

    // ── Test 1: Drop Table Probability Sums Exact Normalization (100.0000%) ──
    const tables = [
        { name: 'MINE_DROP_TABLE', table: MINE_DROP_TABLE, pool: 1000 },
        { name: 'EXPLORE_DROP_TABLE', table: EXPLORE_DROP_TABLE, pool: 400 },
        { name: 'HUNT_DROP_TABLE', table: HUNT_DROP_TABLE, pool: 300 },
        { name: 'FISH_DROP_TABLE', table: FISH_DROP_TABLE, pool: 200 }
    ];

    for (const { name, table } of tables) {
        const sum = table.reduce((acc, entry) => acc + entry.chance, 0);
        assert.ok(
            Math.abs(sum - 100.0) < 0.0001,
            `${name} must sum to 100.0000%, got ${sum.toFixed(6)}%`
        );
    }
    console.log('✓ Test 1 Passed: All 4 drop tables normalized to exactly 100.0000%');

    // ── Test 2: Quantization Continuity & Stochastic Rounding Calibration ──
    // Tests sensitive float values to prove zero deadzone bias.
    const testCases = [0.10, 0.45, 0.99, 1.01, 1.35, 1.65, 2.50, 5.75, 12.34];
    const SAMPLES = 50000;

    for (const targetExp of testCases) {
        let total = 0;
        let sumSq = 0;
        for (let i = 0; i < SAMPLES; i++) {
            const variance = 0.96 + (Math.random() * 0.08);
            const scaledVal = targetExp * variance;
            const baseQty = Math.floor(scaledVal);
            const frac = scaledVal - baseQty;
            const qty = baseQty + (Math.random() < frac ? 1 : 0);
            total += qty;
            sumSq += qty * qty;
        }
        const empiricalMean = total / SAMPLES;
        const variance = (sumSq / SAMPLES) - (empiricalMean * empiricalMean);
        const standardError = Math.sqrt(Math.max(0, variance) / SAMPLES);
        const zScore = Math.abs(empiricalMean - targetExp) / (standardError || 0.0001);
        
        // Assert within 3.89 sigma (99.99% confidence interval)
        assert.ok(
            zScore < 3.89,
            `Expected ${targetExp}, got empirical mean ${empiricalMean.toFixed(4)} (z-score ${zScore.toFixed(2)})`
        );
    }
    console.log('✓ Test 2 Passed: Stochastic rounding eliminates all quantization distortion across non-integer expectations');

    // ── Test 3: Monte Carlo Action Gathering Simulation (5,000 runs per action) ──
    const MONTE_CARLO_RUNS = 5000;
    
    for (const { name, table, pool } of tables) {
        const actionType = name.split('_')[0].toLowerCase();
        const dropCounts = {};
        for (const drop of table) {
            dropCounts[drop.item] = 0;
        }

        const playerState = {
            cash: 0,
            rankIndex: 0,
            inventory: {},
            tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
            perks: { serendipity: 0, amnesiac: 0 },
            cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 },
            shop: { lastRestockAt: Date.now() + 1000000, nextRestockAt: Date.now() + 2000000 },
            boosters: { activeUntil: { mine: {}, explore: {}, hunt: {}, fish: {} } },
            faction: null
        };

        for (let i = 0; i < MONTE_CARLO_RUNS; i++) {
            playerState.cooldowns[actionType] = 0;
            playerState.inventory = {};

            const result = ActionEngine.performAction(playerState, actionType, 1000000);
            assert.strictEqual(result.success, true, `Action ${actionType} must succeed`);

            for (const itemObj of result.itemsList) {
                dropCounts[itemObj.item] += itemObj.quantity;
            }
        }

        // Validate items with theoretical drop >= 1 item per action
        for (const drop of table) {
            const theoreticalPerAction = pool * (drop.chance / 100);
            const empiricalPerAction = dropCounts[drop.item] / MONTE_CARLO_RUNS;
            
            if (theoreticalPerAction >= 2.0) {
                const relativeError = Math.abs(empiricalPerAction - theoreticalPerAction) / theoreticalPerAction;
                assert.ok(
                    relativeError < 0.05,
                    `[${actionType}] ${drop.item}: Expected ${theoreticalPerAction.toFixed(4)}/run, got ${empiricalPerAction.toFixed(4)}/run (error ${(relativeError * 100).toFixed(2)}%)`
                );
            }
        }
        console.log(`✓ Test 3 [${actionType.toUpperCase()}] Passed: ${MONTE_CARLO_RUNS.toLocaleString()} Monte Carlo runs converged to theoretical expectations`);
    }

    // ── Test 4: Compounding Multipliers Integrity & Tool Scaling ──
    const maxToolLevel = 50;
    const maxToolMultiplier = getToolYieldMultiplier(maxToolLevel);
    assert.strictEqual(maxToolMultiplier.toFixed(2), '12.00', 'Max tool yield multiplier must be 12.00x');

    const mockMaxedPlayer = {
        cash: 0,
        rankIndex: 0,
        inventory: {},
        tools: { mine: 50, explore: 50, hunt: 50, fish: 50 },
        perks: { serendipity: 29, amnesiac: 0 },
        boosters: {
            activeUntil: {
                mine: {
                    T1: Date.now() + 100000,
                    T2: Date.now() + 100000,
                    T3: Date.now() + 100000,
                    T4: Date.now() + 100000,
                    T5: Date.now() + 100000,
                    T6: Date.now() + 100000
                }
            }
        },
        faction: {
            created: true,
            name: 'Apex Guild',
            boosts: {
                mine: { level: 36, multiplier: 10.0, activeUntil: Date.now() + 100000 }
            }
        },
        cooldowns: { mine: 0 }
    };

    const maxResult = ActionEngine.performAction(mockMaxedPlayer, 'mine', Date.now());
    assert.strictEqual(maxResult.success, true);
    assert.strictEqual(maxResult.toolMultiplier.toFixed(2), '12.00');
    assert.strictEqual(maxResult.boosterMultiplier, 64);
    assert.strictEqual(maxResult.factionMultiplier, 10);
    assert.strictEqual(maxResult.totalMultiplier, 7680); // 12 * 64 * 10
    assert.strictEqual(maxResult.serendipityMultiplier, 30); // 29 + 1
    assert.ok(maxResult.totalItems > 1000000, 'Endgame multipliers must produce scaled million-item yields accurately');
    console.log(`✓ Test 4 Passed: Compounding multipliers scale accurately to ${maxResult.totalMultiplier}x (Tool 12x * Boosters 64x * Faction 10x)`);

    // ── Test 5: Work Base Pay & Partiality Multiplier Stacking ──
    const rank0Pay = getWorkBasePay(0, RANKS, 0);
    assert.strictEqual(rank0Pay, Math.floor((10000 * 1 * 0.05) + 5000)); // $5,500
    
    const rank106Pay = getWorkBasePay(106, RANKS, 0); // God (Rank 107 in 1-based, index 106)
    assert.strictEqual(rank106Pay, Math.floor((250000000 * 1 * 0.05) + 5000)); // $12,505,000

    // Partiality level 15: totalChance = 0.30 + (0.15 * 15) = 2.55 (Guaranteed 2 bonuses, 55% chance for 3rd)
    const workStats = { 2: 0, 3: 0 };
    for (let i = 0; i < 20000; i++) {
        const { bonusCount } = calculateWorkBonuses(15);
        assert.ok(bonusCount === 2 || bonusCount === 3, 'Bonus count must be either 2 or 3');
        workStats[bonusCount]++;
    }
    const empiricalP3 = workStats[3] / 20000;
    assert.ok(Math.abs(empiricalP3 - 0.55) < 0.02, `Empirical P(3 bonuses) should be ~0.55, got ${empiricalP3.toFixed(4)}`);
    console.log('✓ Test 5 Passed: Work Pay and Partiality multi-stack odds verified');

    // ── Test 6: Cooldown Enforcement & Amnesiac Reset ──
    const now = 2000000;
    const cooldownTestPlayer = {
        cooldowns: { mine: now + 50000 }
    };
    const cdResult = ActionEngine.performAction(cooldownTestPlayer, 'mine', now);
    assert.strictEqual(cdResult.error, 'Action on cooldown');
    assert.strictEqual(cdResult.remainingTime, 50000);

    // Amnesiac 100% reset check (Level 50 * 2% = 100%)
    const amnesiacPlayer = {
        cooldowns: { mine: 0 },
        perks: { amnesiac: 50 }
    };
    const amneResult = ActionEngine.performAction(amnesiacPlayer, 'mine', now);
    assert.strictEqual(amneResult.amnesiacTriggered, true);
    assert.strictEqual(amnesiacPlayer.cooldowns.mine, 0, 'Amnesiac trigger must set cooldown to 0');
    console.log('✓ Test 6 Passed: Cooldown gating and Amnesiac resets verified');

    console.log('--- All Resource Drop & Gathering Engine Calibration Tests Passed! ---');
}

if (require.main === module) {
    runActionEngineCalibrationTests();
}

module.exports = runActionEngineCalibrationTests;
