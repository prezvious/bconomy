/**
 * Unit Test for Dynamic Inventory Consolidation
 */
const assert = require('assert');
const { FarmEngine } = require('../src/engine/farmEngine');

function testInventoryConsolidation() {
    console.log('--- Starting Dynamic Inventory Consolidation Tests ---');

    const playerState = {
        inventory: {
            'Antique Bottle': 35,
            'AntiqueBottle': 8,
            'Big Log': 137,
            'BigLog': 46,
            'Mystic Dragon Gem': 10,
            'MysticDragonGem': 5,
            'Rock': 310
        }
    };

    FarmEngine.ensureFarmState(playerState);

    const inv = playerState.inventory;

    // Verify 100% dynamic combination without fixed lists
    assert.strictEqual(inv['Antique Bottle'], undefined);
    assert.strictEqual(inv['AntiqueBottle'], 43);

    assert.strictEqual(inv['Big Log'], undefined);
    assert.strictEqual(inv['BigLog'], 183);

    assert.strictEqual(inv['Mystic Dragon Gem'], undefined);
    assert.strictEqual(inv['MysticDragonGem'], 15);

    assert.strictEqual(inv['Rock'], 310);

    console.log('✓ All Dynamic Inventory Consolidation Tests Passed Successfully!');
}

testInventoryConsolidation();
