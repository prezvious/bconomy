/**
 * @file test_toolEngine_level500.js
 * Comprehensive Verification Suite for Level 500 Tooling Expansion,
 * Overclocking Cooldown Reductions, Procedural Recipes, and Modification Sockets.
 */

const assert = require('assert');
const ToolEngine = require('../src/engine/toolEngine');
const ActionEngine = require('../src/engine/actionEngine');
const { 
    SOCKET_MODULE_DEFINITIONS, 
    generateProceduralRecipe, 
    MINE_DROP_TABLE, 
    EXPLORE_DROP_TABLE, 
    HUNT_DROP_TABLE, 
    FISH_DROP_TABLE 
} = require('../src/engine/dropTables');
const { 
    getToolYieldMultiplier, 
    getToolCooldownReduction, 
    getUnlockedSocketCount 
} = require('../src/utils/formulas');

function runLevel500ToolTests() {
    console.log('--- Starting Level 500 Tooling & Overclocking Verification Tests ---');

    // ── 1. Yield Multiplier Milestone Benchmarks (L1 to L500) ──
    assert.strictEqual(getToolYieldMultiplier(1).toFixed(2), '1.00', 'L1 yield multiplier must be 1.00x');
    assert.strictEqual(getToolYieldMultiplier(10).toFixed(2), '2.32', 'L10 yield multiplier must be 2.32x');
    assert.strictEqual(getToolYieldMultiplier(25).toFixed(2), '5.51', 'L25 yield multiplier must be 5.51x');
    assert.strictEqual(getToolYieldMultiplier(50).toFixed(2), '12.00', 'L50 yield multiplier must be 12.00x');
    assert.ok(getToolYieldMultiplier(100) > 180, 'L100 yield should be ~189x');
    assert.ok(getToolYieldMultiplier(300) > 1500, 'L300 yield should be ~1,583x');
    assert.ok(getToolYieldMultiplier(500) > 3400 && getToolYieldMultiplier(500) < 3600, 'L500 yield should be ~3,500x');
    console.log(`✓ Test 1 Passed: Yield multipliers scale smoothly (L1=1.00x, L50=12.00x, L100=${getToolYieldMultiplier(100).toFixed(1)}x, L300=${getToolYieldMultiplier(300).toFixed(1)}x, L500=${getToolYieldMultiplier(500).toFixed(1)}x)`);

    // ── 2. Cooldown Reduction Equation Verification (Lv 300+ to Lv 500) ──
    assert.strictEqual(getToolCooldownReduction(1), 0);
    assert.strictEqual(getToolCooldownReduction(299), 0);
    assert.strictEqual(getToolCooldownReduction(300), 5, 'L300 must reduce cooldown by 5s');
    assert.strictEqual(getToolCooldownReduction(315), 5, 'L315 must reduce cooldown by 5s');
    assert.strictEqual(getToolCooldownReduction(316), 10, 'L316 must reduce cooldown by 10s');
    assert.strictEqual(getToolCooldownReduction(332), 15, 'L332 must reduce cooldown by 15s');
    assert.strictEqual(getToolCooldownReduction(348), 20, 'L348 must reduce cooldown by 20s');
    assert.strictEqual(getToolCooldownReduction(364), 25, 'L364 must reduce cooldown by 25s');
    assert.strictEqual(getToolCooldownReduction(380), 30, 'L380 must reduce cooldown by 30s');
    assert.strictEqual(getToolCooldownReduction(396), 35, 'L396 must reduce cooldown by 35s');
    assert.strictEqual(getToolCooldownReduction(412), 40, 'L412 must reduce cooldown by 40s');
    assert.strictEqual(getToolCooldownReduction(428), 45, 'L428 must reduce cooldown by 45s');
    assert.strictEqual(getToolCooldownReduction(444), 50, 'L444 must reduce cooldown by 50s');
    assert.strictEqual(getToolCooldownReduction(460), 55, 'L460 must reduce cooldown by 55s');
    assert.strictEqual(getToolCooldownReduction(476), 60, 'L476 must reach maximum cap of 60s');
    assert.strictEqual(getToolCooldownReduction(500), 60, 'L500 must stay capped at 60s');
    console.log('✓ Test 2 Passed: Level 300+ cooldown reduction rules verified across all 16-level intervals up to 60s cap');

    // ── 3. Sockets Unlock Intervals (Every 50 Levels up to 10 max) ──
    assert.strictEqual(getUnlockedSocketCount(1), 0);
    assert.strictEqual(getUnlockedSocketCount(49), 0);
    assert.strictEqual(getUnlockedSocketCount(50), 1);
    assert.strictEqual(getUnlockedSocketCount(99), 1);
    assert.strictEqual(getUnlockedSocketCount(100), 2);
    assert.strictEqual(getUnlockedSocketCount(250), 5);
    assert.strictEqual(getUnlockedSocketCount(300), 6);
    assert.strictEqual(getUnlockedSocketCount(500), 10);
    console.log('✓ Test 3 Passed: Sockets unlock every 50 levels up to 10 sockets at L500');

    // ── 4. Procedural Recipe Completeness (All 1,800 recipes L51-500) ──
    const tools = ['mine', 'explore', 'hunt', 'fish'];
    for (const tool of tools) {
        for (let lvl = 51; lvl <= 500; lvl++) {
            const recipe = generateProceduralRecipe(tool, lvl);
            assert.ok(Array.isArray(recipe) && recipe.length >= 3, `Recipe for ${tool} at Lv ${lvl} must have at least 3 materials`);
            for (const r of recipe) {
                assert.ok(typeof r.item === 'string' && r.item.length > 0, `Item name must be non-empty string at ${tool} Lv ${lvl}`);
                assert.ok(typeof r.quantity === 'number' && r.quantity >= 1, `Quantity must be >= 1 at ${tool} Lv ${lvl}`);
            }
        }
    }
    console.log('✓ Test 4 Passed: 1,800 procedural pure-gathering recipes generated validly for Levels 51-500');

    // ── 5. Single and Bulk Upgrades (+1, +10, +50, Max Affordable) ──
    const playerState = {
        tools: { mine: 50, explore: 1, hunt: 1, fish: 1 },
        inventory: {}
    };
    for (const drop of MINE_DROP_TABLE) {
        playerState.inventory[drop.item] = 10000000;
    }

    // 5a. Single upgrade crossing 50 -> 51
    const singleUp = ToolEngine.upgradeTool(playerState, 'mine');
    assert.strictEqual(singleUp.success, true);
    assert.strictEqual(playerState.tools.mine, 51);

    // 5b. Bulk upgrade +10 levels (51 -> 61)
    const bulk10 = ToolEngine.upgradeToolBulk(playerState, 'mine', 10, true);
    assert.strictEqual(bulk10.success, true);
    assert.strictEqual(playerState.tools.mine, 61);
    assert.strictEqual(bulk10.levelsGained, 10);

    // 5c. Target level upgrade to L100
    const target100 = ToolEngine.upgradeToolBulk(playerState, 'mine', 100);
    assert.strictEqual(target100.success, true);
    assert.strictEqual(playerState.tools.mine, 100);

    // 5d. Max Affordable test
    const maxAffordable = ToolEngine.getMaxAffordableLevel(playerState, 'mine');
    assert.ok(maxAffordable.canUpgrade);
    assert.ok(maxAffordable.maxAffordableLevel > 100);
    console.log(`✓ Test 5 Passed: Single and bulk upgrades verified (50 -> 51 -> 61 -> 100, Max reachable: Lv ${maxAffordable.maxAffordableLevel})`);

    // ── 6. Modification Sockets, Module Crafting, Installation & Bonuses ──
    ToolEngine.ensureSocketState(playerState);
    assert.strictEqual(playerState.tools.mine, 100);
    
    // Unlocked sockets at Lv 100 is 2
    const summary1 = ToolEngine.getToolSocketSummary(playerState, 'mine');
    assert.strictEqual(summary1.unlockedSlots, 2);

    // Craft Multistrike Matrix III
    const craftRes = ToolEngine.craftModule(playerState, 'multistrike_3', 1);
    assert.strictEqual(craftRes.success, true);
    assert.strictEqual(playerState.toolModules['multistrike_3'], 1);

    // Craft Chrono Resonator III
    playerState.inventory['Tungsten'] = 1000;
    playerState.inventory['Iridium'] = 1000;
    playerState.inventory['OldCrown'] = 100;
    const craftChrono = ToolEngine.craftModule(playerState, 'chrono_3', 1);
    assert.strictEqual(craftChrono.success, true);

    // Install Multistrike into slot 0
    const install1 = ToolEngine.installModule(playerState, 'mine', 0, 'multistrike_3');
    assert.strictEqual(install1.success, true);
    assert.strictEqual(playerState.toolSockets.mine[0], 'multistrike_3');
    assert.strictEqual(playerState.toolModules['multistrike_3'], 0);

    // Install Chrono into slot 1
    const install2 = ToolEngine.installModule(playerState, 'mine', 1, 'chrono_3');
    assert.strictEqual(install2.success, true);

    // Attempt to install into locked slot 2 (requires Lv 150) -> should fail
    const installLocked = ToolEngine.installModule(playerState, 'mine', 2, 'multistrike_3');
    assert.ok(installLocked.error, 'Installing into locked socket must return error');

    // Verify active socket bonuses
    const summary2 = ToolEngine.getToolSocketSummary(playerState, 'mine');
    assert.strictEqual(summary2.activeBonuses.multistrikeChance, 0.50);
    assert.strictEqual(summary2.activeBonuses.cooldownReduction, 15);
    console.log('✓ Test 6 Passed: Module crafting, socket installation, and active bonuses verified');

    // ── 7. ActionEngine Integration with Lv 300+ Cooldown & Sockets ──
    const endgamePlayer = {
        tools: { mine: 316, explore: 1, hunt: 1, fish: 1 },
        inventory: {},
        cooldowns: { mine: 0 },
        toolSockets: {
            mine: ['chrono_3', null, null, null, null, null, null, null, null, null],
            explore: new Array(10).fill(null),
            hunt: new Array(10).fill(null),
            fish: new Array(10).fill(null)
        },
        toolModules: {}
    };

    const now = 10000000;
    const actionResult = ActionEngine.performAction(endgamePlayer, 'mine', now);
    assert.strictEqual(actionResult.success, true);
    assert.strictEqual(actionResult.toolCooldownReductionSec, 10); // Lv 316 gives -10s
    assert.strictEqual(actionResult.socketCooldownReductionSec, 15); // Chrono III gives -15s
    assert.strictEqual(actionResult.totalCooldownReductionSec, 25); // Total -25s
    assert.strictEqual(actionResult.effectiveCooldownSec, 275); // 300 - 25 = 275s
    assert.strictEqual(endgamePlayer.cooldowns.mine, now + (275 * 1000));
    console.log(`✓ Test 7 Passed: ActionEngine accurately applies tool cooldown reduction (-10s) + socket reduction (-15s) = 275s effective cooldown`);

    console.log('--- All Level 500 Tooling & Overclocking Tests Passed Successfully! ---');
}

if (require.main === module) {
    runLevel500ToolTests();
}

module.exports = runLevel500ToolTests;
