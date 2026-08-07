/**
 * Comprehensive Integration & Verification Test Suite for Bconomy Backend Engines
 */
const assert = require('assert');
const ActionEngine = require('../src/engine/actionEngine');
const ToolEngine = require('../src/engine/toolEngine');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { FarmEngine } = require('../src/engine/farmEngine');
const { RANKS, PERK_DEFINITIONS } = require('../src/engine/dropTables');
const { getSerendipityMultiplier } = require('../src/utils/formulas');

function runVerificationTests() {
    console.log('--- Starting Full System Verification Tests ---');

    // 1. Test Bug 1 Fix: Tool Upgrades with PascalCase Drop Table Items
    const playerState = {
        cash: 1000000,
        rankIndex: 0,
        inventory: {
            'Rock': 500,
            'Feathers': 500,
            'TatteredBoot': 500,    // PascalCase from FISH/EXPLORE drop table
            'OldBones': 500,       // PascalCase from EXPLORE/HUNT drop table
            'DiscardedButt': 500,  // PascalCase from EXPLORE drop table
            'BigLog': 500,         // PascalCase from EXPLORE/HUNT drop table
            'RustyKnife': 500,     // PascalCase from EXPLORE drop table
            'Copper': 500,
            'Jellyfish': 500,
            'Weeds': 500
        },
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        perks: { serendipity: 0 },
        cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 }
    };
    FarmEngine.ensureFarmState(playerState);

    // Test 1a: Upgrade explore tool (requires TatteredBoot)
    assert.strictEqual(ToolEngine.canUpgrade(playerState, 'explore'), true, 'Player should be able to upgrade explore tool with TatteredBoot');
    const exploreUpgResult = ToolEngine.upgradeTool(playerState, 'explore');
    assert.strictEqual(exploreUpgResult.success, true, 'Explore tool upgrade must succeed');
    assert.strictEqual(playerState.tools.explore, 2, 'Explore tool level should be 2');

    // Test 1b: Upgrade hunt tool (requires DiscardedButt, BigLog, RustyKnife)
    assert.strictEqual(ToolEngine.canUpgrade(playerState, 'hunt'), true, 'Player should be able to upgrade hunt tool with DiscardedButt, BigLog, RustyKnife');
    const huntUpgResult = ToolEngine.upgradeTool(playerState, 'hunt');
    assert.strictEqual(huntUpgResult.success, true, 'Hunt tool upgrade must succeed');
    assert.strictEqual(playerState.tools.hunt, 2, 'Hunt tool level should be 2');

    console.log('✓ Bug 1 Fix Verified: Tool upgrades work with PascalCase drop items');

    // 2. Test Bug 2 Fix: Serendipity Formula (Level + 2)
    assert.strictEqual(getSerendipityMultiplier(1, 4.0), 3, 'Level 1 Serendipity multiplier must be 3 (1 + 2)');
    assert.strictEqual(getSerendipityMultiplier(5, 1.0), 7, 'Level 5 Serendipity multiplier must be 7 (5 + 2)');
    assert.strictEqual(getSerendipityMultiplier(0, 1.0), 1, 'Level 0 Serendipity multiplier must be 1');
    assert.strictEqual(PERK_DEFINITIONS.serendipity.formula, 'Multiplier = Level + 2', 'Perk definition formula must state Level + 2');
    console.log('✓ Bug 2 Fix Verified: Serendipity formula is Level + 2');

    // 3. Test Bug 3 Fix: Rank 107 (God) Base Price
    const rank106 = RANKS.find(r => r.index === 106 || r.name === 'Demigod');
    const rank107 = RANKS.find(r => r.index === 107 || r.name === 'God');
    assert.ok(rank106 && rank107, 'Ranks 106 and 107 must exist');
    assert.strictEqual(rank107.basePrice, 250000000, 'Rank 107 base price must be 250,000,000');
    assert.ok(rank107.basePrice > rank106.basePrice, 'Rank 107 price must be higher than Rank 106 price');
    console.log('✓ Bug 3 Fix Verified: Rank 107 price is $250,000,000 (> Rank 106)');

    // 4. Test Bug 4 Fix: Farm Engine Water Timer Anchor
    const now = 1000000;
    playerState.farm.plots[0] = { id: 1, crop: 'Blueberry', plantedAt: now, nextHarvestAt: now + 5000, composted: false };
    playerState.farm.waterAvailableAt = 0;

    // Water plot with 5s remaining (<= 30 mins reduction)
    const waterRes = FarmEngine.waterPlot(playerState, 1, now, () => 0.5);
    assert.strictEqual(waterRes.success, true);
    // Next harvest timestamp should be old anchor (now + 5000) + growTime (20000) = now + 25000
    assert.strictEqual(playerState.farm.plots[0].nextHarvestAt, now + 25000, 'Watering must anchor next harvest to prior target timestamp + growTime');
    console.log('✓ Bug 4 Fix Verified: Watering anchors next harvest correctly without wiping progress');

    // 5. Test Action Engine Dispatch for all action types & item display name formatting
    playerState.cooldowns = { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 };
    for (const act of ['mine', 'explore', 'hunt', 'fish', 'work']) {
        const res = ActionEngine.performAction(playerState, act);
        assert.ok(res.success, `Action ${act} should succeed`);
        assert.ok(res.formattedText, `Action ${act} should return formatted text`);

        // Verify no CamelCase item names remain in formattedText for drop actions
        if (act !== 'work') {
            assert.strictEqual(res.formattedText.includes('OldBones'), false, 'formattedText should not contain CamelCase OldBones');
            assert.strictEqual(res.formattedText.includes('TatteredBoot'), false, 'formattedText should not contain CamelCase TatteredBoot');
            assert.strictEqual(res.formattedText.includes('SaltCrystal'), false, 'formattedText should not contain CamelCase SaltCrystal');
            assert.strictEqual(res.formattedText.includes('GlowingMushroom'), false, 'formattedText should not contain CamelCase GlowingMushroom');
        }
    }
    const { displayItemName } = require('../src/utils/formulas');
    assert.strictEqual(displayItemName('OldBones'), 'Old Bones');
    assert.strictEqual(displayItemName('TatteredBoot'), 'Tattered Boot');
    assert.strictEqual(displayItemName('SaltCrystal'), 'Salt Crystal');
    assert.strictEqual(displayItemName('GlowingMushroom'), 'Glowing Mushroom');
    assert.strictEqual(displayItemName('EmptySodaCan'), 'Empty Soda Can');
    assert.strictEqual(displayItemName('DiscardedButt'), 'Discarded Butt');
    assert.strictEqual(displayItemName('RustyKnife'), 'Rusty Knife');
    assert.strictEqual(displayItemName('CrushedPack'), 'Crushed Pack');
    assert.strictEqual(displayItemName('ScrapMetal'), 'Scrap Metal');
    assert.strictEqual(displayItemName('BigLog'), 'Big Log');
    assert.strictEqual(displayItemName('RustyNail'), 'Rusty Nail');
    assert.strictEqual(displayItemName('CopperWire'), 'Copper Wire');
    assert.strictEqual(displayItemName('RichWool'), 'Rich Wool');
    assert.strictEqual(displayItemName('FloppyDisk'), 'Floppy Disk');
    assert.strictEqual(displayItemName('InsulatingResin'), 'Insulating Resin');
    assert.strictEqual(displayItemName('RubberTire'), 'Rubber Tire');
    console.log('✓ ActionEngine & displayItemName verified for spaced item names (no CamelCase)');

    // 6. Test Rank & Prestige Engine
    playerState.cash = 50000;
    playerState.rankIndex = 0;
    const rankRes = RankPrestigeEngine.rankUp(playerState);
    assert.strictEqual(rankRes.success, true, 'Rank up should succeed with $50k');
    assert.strictEqual(playerState.rankIndex, 1, 'Rank index should increment to 1');
    console.log('✓ RankPrestigeEngine rankUp verified');

    console.log('--- All System Verification Tests Passed Successfully! ---');
}

runVerificationTests();
