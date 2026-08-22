/**
 * @module tests/test_bulk_actions
 * Comprehensive unit and integration test suite for Bulk Actions (Bulk Sell & Bulk Buy).
 */
const assert = require('assert');
const ShopEngine = require('../src/engine/shopEngine');
const { SELLABLE_ITEMS, BOOSTER_REGISTRY } = require('../src/engine/shopTables');

const createFreshState = () => ({
    cash: 100000,
    inventory: {},
    shop: {},
    boosters: {}
});

const t0 = 1700000000000;

console.log('========================================================');
console.log(' Running Bulk Actions Verification Test Suite ');
console.log('========================================================\n');

// -----------------------------------------------------------------------------
// [Test 1] Bulk Sell: Selection, Reserves, and Execution Fidelity
// -----------------------------------------------------------------------------
console.log('[Test 1] Bulk Sell: Selection, Reserves & Execution Fidelity...');
const sellState1 = createFreshState();
ShopEngine.ensureShopState(sellState1, t0);
sellState1.inventory['Rock'] = 50;
sellState1.inventory['Coal'] = 30;
sellState1.inventory['Feathers'] = 20;
sellState1.inventory['Survey Pack'] = 2; // Booster (T1 explore)
sellState1.inventory['Harvest Relay'] = 1; // Booster (T4 hunt)

// User selects only Rock (reserve 10) and Coal (reserve 5), leaving Feathers unselected
const sellOptions1 = {
    selectedItems: {
        'Rock': { selected: true, reserveQty: 10 },
        'Coal': { selected: true, reserveQty: 5 },
        'Feathers': { selected: false, reserveQty: 0 }
    }
};

const previewSell1 = ShopEngine.previewBulkSell(sellState1, sellOptions1, t0);
assert.strictEqual(previewSell1.success, true, 'Bulk sell preview should succeed');
assert.strictEqual(previewSell1.itemsAffectedCount, 2, 'Only Rock and Coal should be affected');
assert.strictEqual(previewSell1.totalUnits, 40 + 25, 'Total units to sell should be (50-10) + (30-5) = 65');

const rockEntry = previewSell1.breakdown.find(b => b.itemName === 'Rock');
const coalEntry = previewSell1.breakdown.find(b => b.itemName === 'Coal');
assert.strictEqual(rockEntry.quantity, 40, 'Rock quantity to sell must be 40');
assert.strictEqual(rockEntry.remainingOwned, 10, 'Rock remaining owned must be 10');
assert.strictEqual(coalEntry.quantity, 25, 'Coal quantity to sell must be 25');
assert.strictEqual(coalEntry.remainingOwned, 5, 'Coal remaining owned must be 5');

// Execute using the same options
const initialCash = sellState1.cash;
const execSell1 = ShopEngine.executeBulkSell(sellState1, sellOptions1, t0);
assert.strictEqual(execSell1.success, true, 'Bulk sell execution should succeed');
assert.strictEqual(sellState1.inventory['Rock'], 10, 'Rock inventory should strictly equal reserve of 10');
assert.strictEqual(sellState1.inventory['Coal'], 5, 'Coal inventory should strictly equal reserve of 5');
assert.strictEqual(sellState1.inventory['Feathers'], 20, 'Unselected Feathers must remain completely untouched (20 units)');
assert.strictEqual(sellState1.inventory['Survey Pack'], 2, 'Boosters must never be sold');
assert.strictEqual(sellState1.inventory['Harvest Relay'], 1, 'Boosters must never be sold');
assert.strictEqual(sellState1.cash, initialCash + execSell1.totalReceived, 'Cash must increase by exact payout');
console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 2] Bulk Sell: Full Liquidation vs Keep 1 of Each
// -----------------------------------------------------------------------------
console.log('[Test 2] Bulk Sell: Liquidation vs Keep 1 Presets...');
const sellState2 = createFreshState();
ShopEngine.ensureShopState(sellState2, t0);
sellState2.inventory['Dandelion'] = 5;
sellState2.inventory['Pinecone'] = 5;

// Liquidation preset: Should sell 100% (reserve 0)
const previewLiq = ShopEngine.previewBulkSell(sellState2, { preset: 'liquidation' }, t0);
assert.strictEqual(previewLiq.totalUnits, 10, 'Liquidation preset must sell all 10 units (0 reserve)');
const execLiq = ShopEngine.executeBulkSell(sellState2, { preset: 'liquidation' }, t0);
assert.strictEqual(execLiq.success, true);
assert.strictEqual(sellState2.inventory['Dandelion'], undefined, 'Dandelion should be fully liquidated');
assert.strictEqual(sellState2.inventory['Pinecone'], undefined, 'Pinecone should be fully liquidated');

// Keep 1 preset: Should leave 1 unit of each
sellState2.inventory['Dandelion'] = 5;
sellState2.inventory['Pinecone'] = 5;
const previewKeep1 = ShopEngine.previewBulkSell(sellState2, { keepOneOfEach: true }, t0);
assert.strictEqual(previewKeep1.totalUnits, 8, 'Keep 1 of each preset must sell 4 + 4 = 8 units');
ShopEngine.executeBulkSell(sellState2, { keepOneOfEach: true }, t0);
assert.strictEqual(sellState2.inventory['Dandelion'], 1, 'Dandelion must retain 1 unit');
assert.strictEqual(sellState2.inventory['Pinecone'], 1, 'Pinecone must retain 1 unit');
console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 3] Bulk Sell: Negative / Invalid Reserve Clamping
// -----------------------------------------------------------------------------
console.log('[Test 3] Bulk Sell: Negative / Invalid Reserve Clamping...');
const sellState3 = createFreshState();
ShopEngine.ensureShopState(sellState3, t0);
sellState3.inventory['Rock'] = 10;

// Attempt negative reserve (-50) -> should be clamped to 0 (cannot sell more than 10)
const previewNegative = ShopEngine.previewBulkSell(sellState3, {
    selectedItems: { 'Rock': { selected: true, reserveQty: -50 } }
}, t0);
assert.strictEqual(previewNegative.totalUnits, 10, 'Negative reserve must be clamped to 0, selling max 10 owned units');

// Attempt reserve larger than owned (999) -> should be clamped to owned, selling 0
const previewExcess = ShopEngine.previewBulkSell(sellState3, {
    selectedItems: { 'Rock': { selected: true, reserveQty: 999 } }
}, t0);
assert.strictEqual(previewExcess.itemsAffectedCount, 0, 'Excess reserve must result in 0 sellable units');
console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 4] Bulk Buy: Priority Strategies (Lowest Price, Highest Price, Rarest First)
// -----------------------------------------------------------------------------
console.log('[Test 4] Bulk Buy: Priority Strategies...');
const buyState4 = createFreshState();
buyState4.cash = 50000000;
ShopEngine.forceRestock(buyState4, t0);

// Ensure test listings
buyState4.shop.buyListings['Seaweed'] = { available: true, stock: 50, buyPrice: 500 };
buyState4.shop.buyListings['BlackPearl'] = { available: true, stock: 2, buyPrice: 10000000 };
buyState4.shop.boosterListings['Prospector Kit'] = { available: true, stock: Infinity, buyPrice: 300000, tier: 'T1' };
buyState4.shop.boosterListings['Yield Amplifier'] = { available: true, stock: 5, buyPrice: 20000000, tier: 'T4' };

// Strategy: Lowest Price
const previewLowest = ShopEngine.previewBulkBuy(buyState4, { priorityStrategy: 'lowestPrice' }, t0);
assert.strictEqual(previewLowest.success, true);
assert.ok(previewLowest.breakdown.length > 1);
for (let i = 0; i < previewLowest.breakdown.length - 1; i++) {
    assert.ok(previewLowest.breakdown[i].unitPrice <= previewLowest.breakdown[i + 1].unitPrice, 'Lowest price must sort ascending');
}

// Strategy: Highest Price
const previewHighest = ShopEngine.previewBulkBuy(buyState4, { priorityStrategy: 'highestPrice' }, t0);
assert.strictEqual(previewHighest.success, true);
for (let i = 0; i < previewHighest.breakdown.length - 1; i++) {
    assert.ok(previewHighest.breakdown[i].unitPrice >= previewHighest.breakdown[i + 1].unitPrice, 'Highest price must sort descending');
}

// Strategy: Rarest First (T4 Booster > T1 Booster > Ultra-rare item > Common item)
const previewRarest = ShopEngine.previewBulkBuy(buyState4, { priorityStrategy: 'rarestFirst' }, t0);
assert.strictEqual(previewRarest.success, true);
const firstItem = previewRarest.breakdown[0].itemName;
assert.strictEqual(firstItem, 'Yield Amplifier', 'T4 booster must be prioritized first in Rarest First strategy');
console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 5] Bulk Buy: Equal Distribution & minQty Enforcement
// -----------------------------------------------------------------------------
console.log('[Test 5] Bulk Buy: Equal Distribution & minQty Enforcement...');
const buyState5 = createFreshState();
ShopEngine.ensureShopState(buyState5, t0);
buyState5.shop.nextRestockAt = t0 + 600000;
buyState5.cash = 3000;

buyState5.shop.buyListings = {
    'ItemA': { available: true, stock: 10, buyPrice: 100 },
    'ItemB': { available: true, stock: 10, buyPrice: 200 }
};
buyState5.shop.boosterListings = {};

// With 3000 cash, ItemA ($100) and ItemB ($200) round-robin:
// 10 of ItemA ($1000) and 10 of ItemB ($2000) = $3000 total.
const previewEqual = ShopEngine.previewBulkBuy(buyState5, { priorityStrategy: 'equalDistribution' }, t0);
assert.strictEqual(previewEqual.success, true);
const itemA = previewEqual.breakdown.find(b => b.itemName === 'ItemA');
const itemB = previewEqual.breakdown.find(b => b.itemName === 'ItemB');
assert.strictEqual(itemA.quantity, 10, 'Equal distribution should purchase 10 ItemA');
assert.strictEqual(itemB.quantity, 10, 'Equal distribution should purchase 10 ItemB');
assert.strictEqual(previewEqual.totalCost, 3000, 'Total cost should exactly equal 3000');

// Test minQty constraint failure rollback in equal distribution
const buyState5b = createFreshState();
ShopEngine.ensureShopState(buyState5b, t0);
buyState5b.shop.nextRestockAt = t0 + 600000;
buyState5b.cash = 500;
buyState5b.shop.buyListings = {
    'ItemA': { available: true, stock: 10, buyPrice: 100 },
    'ItemB': { available: true, stock: 10, buyPrice: 200 }
};
buyState5b.shop.boosterListings = {};

// Player only has 500 cash. ItemB requires minQty: 3 ($600).
// Round-robin can only buy 1 of ItemB before cash runs out.
// Since minQty is 3, ItemB purchase should be canceled and cash retained for ItemA.
const previewMinQty = ShopEngine.previewBulkBuy(buyState5b, {
    priorityStrategy: 'equalDistribution',
    selectedItems: {
        'ItemA': { selected: true, minQty: 1, maxQty: 10 },
        'ItemB': { selected: true, minQty: 3, maxQty: 10 }
    }
}, t0);

const itemB_check = previewMinQty.breakdown.find(b => b.itemName === 'ItemB');
assert.strictEqual(itemB_check, undefined, 'ItemB should be canceled because minQty of 3 could not be met with 500 cash');
console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 6] Bulk Buy: Execution & Stock Decrement
// -----------------------------------------------------------------------------
console.log('[Test 6] Bulk Buy: Execution & Stock Decrement...');
const buyState6 = createFreshState();
ShopEngine.ensureShopState(buyState6, t0);
buyState6.shop.nextRestockAt = t0 + 600000;
buyState6.cash = 10000;
buyState6.shop.buyListings = {
    'ItemA': { available: true, stock: 5, buyPrice: 1000 }
};
buyState6.shop.boosterListings = {
    'Prospector Kit': { available: true, stock: Infinity, buyPrice: 2000, tier: 'T1' }
};

const buyOptions6 = {
    priorityStrategy: 'lowestPrice',
    selectedItems: {
        'ItemA': { selected: true, minQty: 1, maxQty: 3 },
        'Prospector Kit': { selected: true, minQty: 1, maxQty: 2 }
    }
};

const execBuy6 = ShopEngine.executeBulkBuy(buyState6, buyOptions6, t0);
assert.strictEqual(execBuy6.success, true);
assert.strictEqual(buyState6.inventory['ItemA'], 3, 'Inventory should receive 3 ItemA');
assert.strictEqual(buyState6.inventory['Prospector Kit'], 2, 'Inventory should receive 2 Prospector Kit');
assert.strictEqual(buyState6.shop.buyListings['ItemA'].stock, 2, 'Shop stock for ItemA should decrement from 5 to 2');
assert.strictEqual(buyState6.shop.boosterListings['Prospector Kit'].stock, Infinity, 'Infinite stock should remain Infinity');
assert.strictEqual(buyState6.cash, 10000 - (3 * 1000 + 2 * 2000), 'Cash must be accurately deducted');
console.log('✓ Passed!\n');

console.log('========================================================');
console.log(' ALL BULK ACTIONS TESTS PASSED CLEANLY! ');
console.log('========================================================\n');
