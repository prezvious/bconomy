/**
 * @file test_shopEngine.js
 * Automated unit and integration test suite for Bconomy Shop System V1 & Loot Boosters.
 */

const assert = require('assert');
const ShopEngine = require('../src/engine/shopEngine');
const ActionEngine = require('../src/engine/actionEngine');
const {
    SHOP_RESTOCK_SECONDS,
    SELLABLE_ITEMS,
    BOOSTER_REGISTRY,
    getMarkupRange
} = require('../src/engine/shopTables');

const createFreshState = () => {
    return {
        cash: 1000000000, // $1B starting cash for testing
        rankIndex: 0,
        prestigeCount: 0,
        prestigePoints: 0,
        inventory: {},
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        perks: { investiture: 0, cronyism: 0, backchannel: 0, partiality: 0, serendipity: 0, numismatist: 0, amnesiac: 0 },
        cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 }
    };
};

console.log('========================================================');
console.log(' Running Bconomy Shop & Loot Booster Engine Test Suite ');
console.log('========================================================\n');

// 1. Restock Interval & Persistence Tests
console.log('[Test 1] Restock Interval & Persistence...');
assert.strictEqual(SHOP_RESTOCK_SECONDS, 600, 'Restock interval must be exactly 600 seconds');

const state1 = createFreshState();
const t0 = 1000000;
ShopEngine.ensureShopState(state1, t0);

assert.ok(state1.shop, 'Shop state must exist');
assert.strictEqual(state1.shop.lastRestockAt, t0, 'lastRestockAt should equal t0');
assert.strictEqual(state1.shop.nextRestockAt, t0 + 600000, 'nextRestockAt should be t0 + 600000ms');

const firstRestockListings = { ...state1.shop.buyListings };
// Call ensureShopState before nextRestockAt deadline passed
ShopEngine.ensureShopState(state1, t0 + 300000);
assert.strictEqual(state1.shop.lastRestockAt, t0, 'Should not reroll before deadline');

// Call ensureShopState at or after nextRestockAt deadline
const t1 = t0 + 600001;
ShopEngine.ensureShopState(state1, t1);
assert.strictEqual(state1.shop.lastRestockAt, t1, 'Should restock at/after deadline');
assert.strictEqual(state1.shop.nextRestockAt, t1 + 600000, 'nextRestockAt updated to t1 + 600s');
console.log('✓ Passed!\n');

// 2. Pricing & Markup Bounds Tests
console.log('[Test 2] Pricing & Markup Invariants...');
for (const [itemName, config] of Object.entries(SELLABLE_ITEMS)) {
    const [sMin, sMax] = config.sellRange;
    assert.ok(sMin <= sMax, `${itemName}: sMin (${sMin}) must be <= sMax (${sMax})`);

    if (Array.isArray(config.buyRange)) {
        assert.ok(config.buyRange[0] <= config.buyRange[1], `${itemName}: explicit buy range must be ordered`);
        continue;
    }

    const [mMin, mMax] = getMarkupRange(sMax);
    assert.ok(mMin >= 3, `${itemName}: min markup multiplier (${mMin}) must be >= 3`);
    assert.ok(mMax >= mMin, `${itemName}: max markup (${mMax}) must be >= min markup (${mMin})`);
}

const state2 = createFreshState();
// Force deterministic restock with rng that always hits appearance
const deterministicRng = () => 0.00001; // Always passes appearance checks, yields min stock/price
ShopEngine.restockShop(state2, t0, deterministicRng);

for (const [itemName, listing] of Object.entries(state2.shop.buyListings)) {
    const sellPrice = state2.shop.sellPrices[itemName];
    const config = SELLABLE_ITEMS[itemName];
    
    assert.ok(sellPrice >= config.sellRange[0] && sellPrice <= config.sellRange[1], `${itemName}: sellPrice ${sellPrice} out of range`);

    if (listing.available) {
        if (Array.isArray(config.buyRange)) {
            assert.ok(listing.buyPrice >= config.buyRange[0] && listing.buyPrice <= config.buyRange[1], `${itemName}: explicit buy price is in range`);
        } else {
            assert.ok(listing.buyPrice > sellPrice, `${itemName}: buyPrice (${listing.buyPrice}) must be strictly > sellPrice (${sellPrice})`);
            assert.ok(listing.buyPrice >= 3 * config.sellRange[1], `${itemName}: buyPrice (${listing.buyPrice}) must be >= 3 * sMax (${config.sellRange[1]})`);
        }
    }
}
console.log('✓ Passed!\n');

// 3. Mining & Ultra-Rare Item Stock Bounds Tests
console.log('[Test 3] Stock Quantity Bounds...');
const miningItems = ['Coal', 'Copper', 'Flint', 'Clay', 'Aluminum', 'SaltCrystal', 'Tin', 'Iron', 'Neodymium', 'Obsidian', 'Silver', 'Quartz', 'Gold', 'Ruby', 'Sapphire', 'Emerald', 'Lithium', 'Tungsten', 'Petroleum', 'TitaniumOre', 'Iridium', 'Diamond', 'Cobalt', 'MeteoriteFragment', 'AncientCoinCache', 'Alexandrite', 'Uranium', 'Platinum', 'FossilizedDragonScale'];

for (const item of miningItems) {
    const config = SELLABLE_ITEMS[item];
    const [qMin, qMax] = config.stockRange;
    assert.ok(qMin > 400, `Mining item ${item} qMin (${qMin}) must be > 400`);
    assert.ok(qMax < 20000, `Mining item ${item} qMax (${qMax}) must be < 20,000`);
}

const rareMiningItems = ['AncientCoinCache', 'Alexandrite', 'Uranium', 'Platinum', 'FossilizedDragonScale'];
for (const item of rareMiningItems) {
    const config = SELLABLE_ITEMS[item];
    assert.ok(config.stockRange[1] < 5000, `Rare mining item ${item} qMax (${config.stockRange[1]}) must be < 5,000`);
}
console.log('✓ Passed!\n');

// 4. Buy & Sell Transaction Tests
console.log('[Test 4] Buy & Sell Transactions...');
const state3 = createFreshState();
ShopEngine.restockShop(state3, t0, () => 0.01); // All items available

const targetItem = 'Iron';
const initialListing = { ...state3.shop.buyListings[targetItem] };
assert.ok(initialListing.available && initialListing.stock > 0, 'Iron should be in stock');

// Buy 5 Iron
const buyRes = ShopEngine.buyItem(state3, targetItem, 5, t0);
assert.strictEqual(buyRes.success, true, 'Buy should succeed');
assert.strictEqual(state3.inventory['Iron'], 5, 'Inventory should have 5 Iron');
assert.strictEqual(state3.shop.buyListings[targetItem].stock, initialListing.stock - 5, 'Stock should decrease by 5');
assert.strictEqual(state3.cash, 1000000000 - buyRes.totalCost, 'Cash should decrease by totalCost');

// Sell 2 Iron
const sellRes = ShopEngine.sellItem(state3, targetItem, 2, t0);
assert.strictEqual(sellRes.success, true, 'Sell should succeed');
assert.strictEqual(state3.inventory['Iron'], 3, 'Inventory should have 3 Iron remaining');
assert.strictEqual(state3.cash, 1000000000 - buyRes.totalCost + sellRes.totalReceived, 'Cash should increase by totalReceived');

// Attempt to sell more than owned
const failSell = ShopEngine.sellItem(state3, targetItem, 100, t0);
assert.ok(failSell.error, 'Selling more than owned should fail');

// Attempt to sell booster
const boosterSell = ShopEngine.sellItem(state3, 'Prospector Kit', 1, t0);
assert.ok(boosterSell.error, 'Selling boosters must fail');
assert.strictEqual(boosterSell.error, 'Boosters cannot be sold to the system');

// Invalid quantity checks
assert.ok(ShopEngine.buyItem(state3, targetItem, -5, t0).error, 'Negative quantity buy must fail');
assert.ok(ShopEngine.buyItem(state3, targetItem, 0, t0).error, 'Zero quantity buy must fail');
assert.ok(ShopEngine.buyItem(state3, targetItem, NaN, t0).error, 'NaN quantity buy must fail');
assert.ok(ShopEngine.sellItem(state3, targetItem, -1, t0).error, 'Negative quantity sell must fail');

console.log('✓ Passed!\n');

// 5. Loot Booster System & Multiplicative Stacking Tests
console.log('[Test 5] Loot Booster System & Stacking ($2^k$)...');
const state4 = createFreshState();
ShopEngine.restockShop(state4, t0, () => 0.01); // All boosters available in shop

// Check T5 & T6 shop exclusions
assert.strictEqual(BOOSTER_REGISTRY['Industrial Drillhead'].inShop, false, 'T5 Mining booster must not be in shop');
assert.strictEqual(BOOSTER_REGISTRY['Core Extractor'].inShop, false, 'T6 Mining booster must not be in shop');
assert.strictEqual(state4.shop.boosterListings['Industrial Drillhead'].available, false, 'T5 listing must be unavailable');
assert.strictEqual(state4.shop.boosterListings['Core Extractor'].available, false, 'T6 listing must be unavailable');

// Buy T1 Mining Booster (Prospector Kit)
const b1Buy = ShopEngine.buyBooster(state4, 'Prospector Kit', 1, t0);
assert.strictEqual(b1Buy.success, true, 'Buying Prospector Kit should succeed');
assert.strictEqual(state4.inventory['Prospector Kit'], 1, 'Inventory should have 1 Prospector Kit');

// Activate Prospector Kit (T1 Mining: 15 mins)
const act1 = ShopEngine.activateBooster(state4, 'Prospector Kit', t0);
assert.strictEqual(act1.success, true, 'Activating Prospector Kit should succeed');
assert.strictEqual(state4.inventory['Prospector Kit'], undefined, 'Prospector Kit should be consumed from inventory');
assert.strictEqual(state4.boosters.activeUntil['mine']['T1'], t0 + (15 * 60 * 1000), 'T1 Mining activeUntil should be t0 + 15m');

// Check active booster multiplier: 1 tier = 2^1 = 2x
let multMine = ShopEngine.getActiveBoosterMultiplier(state4, 'mine', t0 + 1000);
assert.strictEqual(multMine, 2, '1 active tier must yield 2x multiplier');

// Activate duplicate T1 Mining Booster to test SAME-TIER DURATION EXTENSION
state4.inventory['Prospector Kit'] = 1;
const act1Dup = ShopEngine.activateBooster(state4, 'Prospector Kit', t0 + 60000); // 1 minute later
assert.strictEqual(act1Dup.success, true);
assert.strictEqual(state4.boosters.activeUntil['mine']['T1'], t0 + (15 * 60 * 1000) + (15 * 60 * 1000), 'Duplicate activation must extend duration by 15m');
// Multiplier remains 2x (same tier does not stack yield)
multMine = ShopEngine.getActiveBoosterMultiplier(state4, 'mine', t0 + 1000);
assert.strictEqual(multMine, 2, 'Same tier duration extension must NOT increase yield multiplier');

// Activate T2 Mining Booster (Ore Scanner) -> 2 active tiers = 2^2 = 4x
state4.inventory['Ore Scanner'] = 1;
ShopEngine.activateBooster(state4, 'Ore Scanner', t0);
multMine = ShopEngine.getActiveBoosterMultiplier(state4, 'mine', t0 + 1000);
assert.strictEqual(multMine, 4, '2 active tiers must yield 4x multiplier');

// Activate T3 Mining (Extraction Module) & T4 Mining (Yield Amplifier) -> 4 active tiers = 2^4 = 16x
state4.inventory['Extraction Module'] = 1;
state4.inventory['Yield Amplifier'] = 1;
ShopEngine.activateBooster(state4, 'Extraction Module', t0);
ShopEngine.activateBooster(state4, 'Yield Amplifier', t0);
multMine = ShopEngine.getActiveBoosterMultiplier(state4, 'mine', t0 + 1000);
assert.strictEqual(multMine, 16, '4 active tiers must yield 16x multiplier');

// Activate T5 & T6 (simulated from non-shop acquisition) -> 6 active tiers = 2^6 = 64x
state4.inventory['Industrial Drillhead'] = 1;
state4.inventory['Core Extractor'] = 1;
ShopEngine.activateBooster(state4, 'Industrial Drillhead', t0);
ShopEngine.activateBooster(state4, 'Core Extractor', t0);
multMine = ShopEngine.getActiveBoosterMultiplier(state4, 'mine', t0 + 1000);
assert.strictEqual(multMine, 64, 'All 6 active tiers must yield 64x multiplier');

// Verify ActionEngine integration with active boosters
const actionResult = ActionEngine.performAction(state4, 'mine', t0 + 1000);
assert.strictEqual(actionResult.success, true, 'ActionEngine.performAction should succeed');
assert.strictEqual(actionResult.boosterMultiplier, 64, 'ActionEngine should apply 64x booster multiplier');
assert.ok(actionResult.formattedText.includes('64.00× from Active Loot Boosters'), 'Formatted text must describe active booster multiplier');

console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 6] Bulk Sell Operations (Liquidation, Reserves, Preview & Execution)
// -----------------------------------------------------------------------------
console.log('[Test 6] Bulk Sell Operations...');
const bulkSellState = createFreshState();
ShopEngine.ensureShopState(bulkSellState, t0);

// Populate test inventory with canonical sellable items
bulkSellState.inventory['Rock'] = 10;
bulkSellState.inventory['Weeds'] = 5;
bulkSellState.inventory['Feathers'] = 20;
bulkSellState.inventory['Prospector Kit'] = 3; // Booster item

// Preview bulk sell with no filters -> should sell all Rock, Weeds, Feathers, but ignore Prospector Kit
const sellPreview1 = ShopEngine.previewBulkSell(bulkSellState, {}, t0);
assert.strictEqual(sellPreview1.itemsAffectedCount, 3, 'Bulk sell preview should affect 3 items');
assert.strictEqual(sellPreview1.totalUnits, 35, 'Bulk sell preview should sum 35 units total');
assert.ok(sellPreview1.totalPayout > 0, 'Projected payout must be > 0');

// Execute bulk sell
const sellExec1 = ShopEngine.executeBulkSell(bulkSellState, {}, t0);
assert.strictEqual(sellExec1.success, true, 'Bulk sell execution should succeed');
assert.strictEqual(bulkSellState.inventory['Rock'], undefined, 'Rock should be sold');
assert.strictEqual(bulkSellState.inventory['Weeds'], undefined, 'Weeds should be sold');
assert.strictEqual(bulkSellState.inventory['Feathers'], undefined, 'Feathers should be sold');
assert.strictEqual(bulkSellState.inventory['Prospector Kit'], 3, 'Boosters must NOT be sold during bulk sell');

// Test reserve quantities / keep 1 of each preset
bulkSellState.inventory['Pinecone'] = 5;
bulkSellState.inventory['Chestnut'] = 5;
const sellPreviewReserve = ShopEngine.previewBulkSell(bulkSellState, { keepOneOfEach: true }, t0);
assert.strictEqual(sellPreviewReserve.totalUnits, 8, 'Keep 1 of each preset should leave 1 unit of Pinecone and Chestnut (selling 4 + 4 = 8)');

ShopEngine.executeBulkSell(bulkSellState, { keepOneOfEach: true }, t0);
assert.strictEqual(bulkSellState.inventory['Pinecone'], 1, 'Pinecone inventory should be reduced to 1');
assert.strictEqual(bulkSellState.inventory['Chestnut'], 1, 'Chestnut inventory should be reduced to 1');

console.log('✓ Passed!\n');

// -----------------------------------------------------------------------------
// [Test 7] Bulk Buy Operations (Priority Strategies & Execution)
// -----------------------------------------------------------------------------
console.log('[Test 7] Bulk Buy Operations...');
const bulkBuyState = createFreshState();
bulkBuyState.cash = 1000000;
ShopEngine.forceRestock(bulkBuyState, t0);

// Test lowestPrice priority strategy
const buyPreviewLowest = ShopEngine.previewBulkBuy(bulkBuyState, { priorityStrategy: 'lowestPrice' }, t0);
assert.strictEqual(buyPreviewLowest.success, true, 'Bulk buy preview should succeed');
assert.ok(buyPreviewLowest.itemsAffectedCount > 0, 'Bulk buy preview should find candidate listings');
assert.ok(buyPreviewLowest.totalCost <= bulkBuyState.cash, 'Total cost must not exceed player cash');

// Verify ordering in breakdown
if (buyPreviewLowest.breakdown.length >= 2) {
    assert.ok(
        buyPreviewLowest.breakdown[0].unitPrice <= buyPreviewLowest.breakdown[1].unitPrice,
        'Lowest price strategy must order items ascending by unit price'
    );
}

// Execute bulk buy
const initialCash = bulkBuyState.cash;
const buyExec = ShopEngine.executeBulkBuy(bulkBuyState, { priorityStrategy: 'lowestPrice' }, t0);
assert.strictEqual(buyExec.success, true, 'Bulk buy execution should succeed');
assert.strictEqual(bulkBuyState.cash, initialCash - buyExec.totalCost, 'Cash must be updated accurately');

console.log('✓ Passed!\n');

console.log('========================================================');
console.log(' ALL SHOP & LOOT BOOSTER ENGINE TESTS PASSED CLEANLY!  ');
console.log('========================================================');
