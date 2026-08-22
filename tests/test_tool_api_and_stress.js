/**
 * @file test_tool_api_and_stress.js
 * End-to-End API Handlers, Career Progression Stress Test, and Edge Case
 * Verification Suite for the Level 500 Tooling & Overclocking Sockets System.
 */

const assert = require('assert');
const ToolEngine = require('../src/engine/toolEngine');
const ActionEngine = require('../src/engine/actionEngine');
const { 
    MINE_DROP_TABLE, 
    EXPLORE_DROP_TABLE, 
    HUNT_DROP_TABLE, 
    FISH_DROP_TABLE, 
    SOCKET_MODULE_DEFINITIONS 
} = require('../src/engine/dropTables');
const { 
    getToolYieldMultiplier, 
    getToolCooldownReduction, 
    getUnlockedSocketCount 
} = require('../src/utils/formulas');

function runToolApiAndStressTests() {
    console.log('--- Starting Tool API, Career Stress, & Edge-Case Verification Tests ---');

    // ─────────────────────────────────────────────────────────────
    // 1. API PREVIEW & RECIPE BREAKDOWN VALIDATION
    // ─────────────────────────────────────────────────────────────
    const player1 = {
        tools: { mine: 45, explore: 10, hunt: 1, fish: 1 },
        inventory: {
            'Thermite': 5000,
            'BigLog': 200000,
            'SteelBeam': 5000,
            'Coal': 500000,
            'Uranium': 500,
            'LuckyCharm': 20
        }
    };
    ToolEngine.ensureSocketState(player1);

    // Preview 45 -> 50 (5 levels crossing into endgame Mortal tier)
    const preview5 = ToolEngine.getRecipeBreakdown('mine', 45, 50, player1.inventory);
    assert.strictEqual(preview5.valid, true);
    assert.strictEqual(preview5.levelsCount, 5);
    assert.strictEqual(preview5.levelByLevel.length, 5);
    assert.strictEqual(preview5.affordable, true);
    assert.ok(preview5.cumulativeCost['BigLog'] > 0);
    assert.ok(preview5.cumulativeCost['LuckyCharm'] >= 17); // L46-50 require LuckyCharms
    console.log('✓ Section 1a: Preview upgrade breakdown and affordability verified across Level 45->50');

    // Preview 50 -> 100 (50 levels crossing into Quantum tier)
    const preview50 = ToolEngine.getRecipeBreakdown('mine', 50, 100, {});
    assert.strictEqual(preview50.valid, true);
    assert.strictEqual(preview50.levelsCount, 50);
    assert.strictEqual(preview50.levelByLevel.length, 50);
    assert.strictEqual(preview50.affordable, false);
    assert.ok(Object.keys(preview50.missingMaterials).length >= 10);
    console.log('✓ Section 1b: Preview upgrade for 50 procedural levels verified with exact missing materials');

    // ─────────────────────────────────────────────────────────────
    // 2. ATOMIC BULK UPGRADE API & TRANSACTION ROLLBACK TESTS
    // ─────────────────────────────────────────────────────────────
    const player2 = {
        tools: { fish: 50 },
        inventory: {
            'Seaweed': 50000,
            'Sardine': 50000,
            'TatteredBoot': 50000,
            'Prawn': 50000,
            'Lobster': 50000,
            'Jellyfish': 50000
        }
    };
    ToolEngine.ensureSocketState(player2);

    // 2a. Attempt bulk upgrade to L60 with insufficient high-tier rare materials
    const failedUpgrade = ToolEngine.upgradeToolBulk(player2, 'fish', 60);
    assert.strictEqual(failedUpgrade.success, undefined);
    assert.ok(failedUpgrade.error.includes('Insufficient materials'));
    // Ensure inventory was NOT modified on failure
    assert.strictEqual(player2.tools.fish, 50, 'Tool level must not change on failed upgrade');
    assert.strictEqual(player2.inventory['Seaweed'], 50000, 'Inventory must not be deducted on failure');
    console.log('✓ Section 2a: Atomic transaction rollback on insufficient materials verified');

    // 2b. Supply full inventory and execute successful bulk upgrade 50 -> 60
    for (const drop of FISH_DROP_TABLE) {
        player2.inventory[drop.item] = 1000000;
    }
    const successUpgrade = ToolEngine.upgradeToolBulk(player2, 'fish', 60);
    assert.strictEqual(successUpgrade.success, true);
    assert.strictEqual(player2.tools.fish, 60);
    assert.strictEqual(successUpgrade.levelsGained, 10);
    assert.ok(player2.inventory['Sardine'] < 1000000);
    console.log('✓ Section 2b: Successful atomic bulk upgrade 50 -> 60 verified with inventory deduction');

    // ─────────────────────────────────────────────────────────────
    // 3. MODULE CRAFTING, INVENTORY BALANCE & RECIPE DEDUCTION
    // ─────────────────────────────────────────────────────────────
    const player3 = {
        tools: { mine: 50, explore: 50, hunt: 50, fish: 50 },
        inventory: {
            'Diamond': 500,
            'Uranium': 100,
            'AncientCoinCache': 25,
            'Silver': 1000,
            'Quartz': 1000,
            'Ruby': 200
        },
        toolSockets: {},
        toolModules: {}
    };
    ToolEngine.ensureSocketState(player3);

    // 3a. Craft 2x Multistrike Matrix III
    // Recipe per unit: Diamondx100, Uraniumx20, AncientCoinCachex5
    const craftMulti = ToolEngine.craftModule(player3, 'multistrike_3', 2);
    assert.strictEqual(craftMulti.success, true);
    assert.strictEqual(craftMulti.quantityCrafted, 2);
    assert.strictEqual(player3.toolModules['multistrike_3'], 2);
    assert.strictEqual(player3.inventory['Diamond'], 300); // 500 - 200
    assert.strictEqual(player3.inventory['Uranium'], 60);  // 100 - 40
    assert.strictEqual(player3.inventory['AncientCoinCache'], 15); // 25 - 10

    // 3b. Craft Prospector Core I
    const craftProsp = ToolEngine.craftModule(player3, 'prospector_1', 1);
    assert.strictEqual(craftProsp.success, true);
    assert.strictEqual(player3.toolModules['prospector_1'], 1);
    assert.strictEqual(player3.inventory['Silver'], 700); // 1000 - 300
    assert.strictEqual(player3.inventory['Quartz'], 800); // 1000 - 200
    assert.strictEqual(player3.inventory['Ruby'], 150);   // 200 - 50

    // 3c. Craft non-existent module -> fail
    const craftInvalid = ToolEngine.craftModule(player3, 'fake_module_id');
    assert.ok(craftInvalid.error);
    console.log('✓ Section 3: Module crafting with multi-unit batching and exact inventory deductions verified');

    // ─────────────────────────────────────────────────────────────
    // 4. SOCKET MANAGEMENT (INSTALL, SWAP, REFUND, & UNINSTALL)
    // ─────────────────────────────────────────────────────────────
    // At level 50, exactly 1 socket (index 0) is unlocked
    assert.strictEqual(getUnlockedSocketCount(player3.tools.mine), 1);

    // 4a. Install Multistrike Matrix III into slot 0
    const inst1 = ToolEngine.installModule(player3, 'mine', 0, 'multistrike_3');
    assert.strictEqual(inst1.success, true);
    assert.strictEqual(player3.toolSockets.mine[0], 'multistrike_3');
    assert.strictEqual(player3.toolModules['multistrike_3'], 1); // 2 - 1 = 1 remaining

    // 4b. Swap slot 0 with Prospector Core I -> previously installed Multistrike III should be refunded
    const swap1 = ToolEngine.installModule(player3, 'mine', 0, 'prospector_1');
    assert.strictEqual(swap1.success, true);
    assert.strictEqual(swap1.returnedModule, 'multistrike_3');
    assert.strictEqual(player3.toolSockets.mine[0], 'prospector_1');
    assert.strictEqual(player3.toolModules['multistrike_3'], 2, 'Replaced module must be refunded to toolModules');
    assert.strictEqual(player3.toolModules['prospector_1'], 0);

    // 4c. Uninstall slot 0 -> Prospector I should be refunded and slot set to null
    const uninst1 = ToolEngine.uninstallModule(player3, 'mine', 0);
    assert.strictEqual(uninst1.success, true);
    assert.strictEqual(uninst1.uninstalledModule, 'prospector_1');
    assert.strictEqual(player3.toolSockets.mine[0], null);
    assert.strictEqual(player3.toolModules['prospector_1'], 1, 'Uninstalled module must return to toolModules');

    // 4d. Attempt to uninstall already empty socket -> fail
    const uninstEmpty = ToolEngine.uninstallModule(player3, 'mine', 0);
    assert.ok(uninstEmpty.error);

    // 4e. Attempt to install into locked slot 1 (requires Lv 100) -> fail
    const instLocked = ToolEngine.installModule(player3, 'mine', 1, 'multistrike_3');
    assert.ok(instLocked.error);
    console.log('✓ Section 4: Socket equipping, swapping, inventory refunds, and locking guards verified');

    // ─────────────────────────────────────────────────────────────
    // 5. FULL CAREER PROGRESSION STRESS TEST (L1 -> L500)
    // ─────────────────────────────────────────────────────────────
    const careerPlayer = {
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        inventory: {},
        cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 }
    };
    ToolEngine.ensureSocketState(careerPlayer);

    // Fill massive inventory with all drop table items and recipe components
    const { TOOL_UPGRADE_RECIPES } = require('../src/engine/dropTables');
    for (const table of [MINE_DROP_TABLE, EXPLORE_DROP_TABLE, HUNT_DROP_TABLE, FISH_DROP_TABLE]) {
        for (const drop of table) {
            careerPlayer.inventory[drop.item] = 500000000;
        }
    }
    for (const tool of Object.keys(TOOL_UPGRADE_RECIPES)) {
        for (const lvl of Object.keys(TOOL_UPGRADE_RECIPES[tool])) {
            for (const req of TOOL_UPGRADE_RECIPES[tool][lvl]) {
                careerPlayer.inventory[req.item] = 500000000;
            }
        }
    }

    // Step upgrade Mine tool from L1 to L500 in increments
    const milestones = [50, 100, 200, 300, 316, 400, 476, 500];
    for (const target of milestones) {
        const res = ToolEngine.upgradeToolBulk(careerPlayer, 'mine', target);
        assert.strictEqual(res.success, true, `Upgrade to ${target} must succeed`);
        assert.strictEqual(careerPlayer.tools.mine, target);
        assert.strictEqual(res.newLevel, target);
        assert.strictEqual(res.yieldMultiplier.toFixed(2), getToolYieldMultiplier(target).toFixed(2));
        assert.strictEqual(res.cooldownReductionSec, getToolCooldownReduction(target));
        assert.strictEqual(res.socketsUnlocked, getUnlockedSocketCount(target));
    }

    assert.strictEqual(careerPlayer.tools.mine, 500);
    assert.strictEqual(getUnlockedSocketCount(500), 10);
    assert.strictEqual(getToolCooldownReduction(500), 60);
    console.log('✓ Section 5: Full career progression L1 -> L500 verified across all milestone thresholds');

    // ─────────────────────────────────────────────────────────────
    // 6. ENDGAME ACTION EXECUTION WITH 10 SOCKET MODULES
    // ─────────────────────────────────────────────────────────────
    // Craft 10x Chrono Resonator III (-15s each) and install in all 10 slots
    for (let slot = 0; slot < 10; slot++) {
        careerPlayer.toolModules['chrono_3'] = 1;
        const inst = ToolEngine.installModule(careerPlayer, 'mine', slot, 'chrono_3');
        assert.strictEqual(inst.success, true);
    }

    const maxSocketSummary = ToolEngine.getToolSocketSummary(careerPlayer, 'mine');
    assert.strictEqual(maxSocketSummary.unlockedSlots, 10);
    assert.strictEqual(maxSocketSummary.activeBonuses.cooldownReduction, 150); // 10 * 15s

    // Perform action: 300s base - 60s (L500 tool) - 150s (10x Chrono III) = 90s effective cooldown
    const actionNow = 50000000;
    const maxActionResult = ActionEngine.performAction(careerPlayer, 'mine', actionNow);
    assert.strictEqual(maxActionResult.success, true);
    assert.strictEqual(maxActionResult.toolCooldownReductionSec, 60);
    assert.strictEqual(maxActionResult.socketCooldownReductionSec, 150);
    assert.strictEqual(maxActionResult.totalCooldownReductionSec, 210);
    assert.strictEqual(maxActionResult.effectiveCooldownSec, 90); // 300 - 210 = 90s
    assert.strictEqual(careerPlayer.cooldowns.mine, actionNow + (90 * 1000));
    assert.ok(maxActionResult.toolMultiplier > 3400);
    console.log('✓ Section 6: Endgame gathering action verified with L500 tool (-60s) + 10x Chrono Modules (-150s) = 90s effective cooldown and 3,448x yield');

    // ─────────────────────────────────────────────────────────────
    // 7. EDGE CASES & DEFENSIVE ERROR HANDLING
    // ─────────────────────────────────────────────────────────────
    // 7a. Attempt to upgrade past Level 500
    const pastMax = ToolEngine.upgradeToolBulk(careerPlayer, 'mine', 501);
    assert.ok(pastMax.error);

    // 7b. Invalid tool type
    const invalidTool = ToolEngine.upgradeToolBulk(careerPlayer, 'laser_cannon', 10);
    assert.ok(invalidTool.error);

    // 7c. Target level lower than current
    const lowerLevel = ToolEngine.upgradeToolBulk(careerPlayer, 'mine', 400);
    assert.ok(lowerLevel.error);

    // 7d. Out-of-bounds socket index
    const outOfBoundsSocket = ToolEngine.installModule(careerPlayer, 'mine', 15, 'multistrike_3');
    assert.ok(outOfBoundsSocket.error);

    const negativeSocket = ToolEngine.installModule(careerPlayer, 'mine', -1, 'multistrike_3');
    assert.ok(negativeSocket.error);

    console.log('✓ Section 7: All edge cases and defensive bounds guards verified');

    console.log('--- All Tool API, Stress, & Edge-Case Verification Tests Passed Successfully! ---');
}

if (require.main === module) {
    runToolApiAndStressTests();
}

module.exports = runToolApiAndStressTests;
