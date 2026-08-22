const assert = require('assert');
const ShopEngine = require('../src/engine/shopEngine');
const { BOOSTER_REGISTRY } = require('../src/engine/shopTables');

console.log('--- Starting Booster Shop Restock & Unlimited Stock Unit Tests ---');

function createTestPlayerState() {
    return {
        cash: 100000000000000, // $100 Trillion starting cash for testing buys
        inventory: {},
        shop: {
            lastRestockAt: 0,
            nextRestockAt: 0,
            sellPrices: {},
            buyListings: {},
            boosterListings: {}
        },
        boosters: {
            activeUntil: {
                mine: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
                explore: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
                fish: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
                hunt: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }
            }
        }
    };
}

// 1. Verify T1-T3 100% Availability & Unlimited Stock
const p1 = createTestPlayerState();
ShopEngine.ensureShopState(p1, 1000);

const t1T3Boosters = Object.entries(BOOSTER_REGISTRY)
    .filter(([_, config]) => config.inShop && ['T1', 'T2', 'T3'].includes(config.tier))
    .map(([name]) => name);

assert.strictEqual(t1T3Boosters.length, 12, '12 T1-T3 boosters must exist');

for (const name of t1T3Boosters) {
    const listing = p1.shop.boosterListings[name];
    assert.strictEqual(listing.available, true, `Booster '${name}' must be available`);
    assert.strictEqual(listing.stock, Infinity, `Booster '${name}' stock must be Infinity`);
}
console.log('✓ Test 1: All T1-T3 boosters 100% available with stock Infinity verified');

// 2. Buy T1-T3 Unlimited Quantity Test
const buyRes = ShopEngine.buyBooster(p1, 'Prospector Kit', 100, 1000);
assert.strictEqual(buyRes.success, true, 'Buying 100 Prospector Kits must succeed');
assert.strictEqual(p1.inventory['Prospector Kit'], 100, 'Inventory must contain 100 Prospector Kits');
assert.strictEqual(p1.shop.boosterListings['Prospector Kit'].stock, Infinity, 'Stock must remain Infinity');
assert.strictEqual(p1.shop.boosterListings['Prospector Kit'].available, true, 'Booster must remain available');
console.log('✓ Test 2: Unlimited buying of T1-T3 boosters verified');

// 3. T4 Boosters 20% Restock & 5-20 Stock Range Test
const t4Boosters = Object.entries(BOOSTER_REGISTRY)
    .filter(([_, config]) => config.inShop && config.tier === 'T4')
    .map(([name]) => name);

assert.strictEqual(t4Boosters.length, 4, '4 T4 boosters must exist in shop');

let t4AppearanceCount = 0;
const restockCycles = 2000;
for (let i = 0; i < restockCycles; i++) {
    const state = createTestPlayerState();
    ShopEngine.restockShop(state, 1000 + i * 600000);
    for (const name of t4Boosters) {
        const listing = state.shop.boosterListings[name];
        if (listing.available) {
            t4AppearanceCount++;
            assert.strictEqual(listing.stock >= 5 && listing.stock <= 20, true, `T4 stock must be between 5 and 20 (got ${listing.stock})`);
        }
    }
}

const totalT4Opportunities = restockCycles * t4Boosters.length;
const actualRate = t4AppearanceCount / totalT4Opportunities;
// Expect rate to be ~20% (between 17% and 23%)
assert.strictEqual(actualRate > 0.17 && actualRate < 0.23, true, `T4 appearance rate (${(actualRate * 100).toFixed(2)}%) must be ~20%`);
console.log(`✓ Test 3: T4 20% restock probability (${(actualRate * 100).toFixed(2)}%) & 5-20 stock range verified`);

// 4. T4 Stock Exhaustion Test
const pT4 = createTestPlayerState();
// Force a restock where a T4 booster appears
let foundT4Name = null;
for (let attempt = 0; attempt < 50; attempt++) {
    ShopEngine.restockShop(pT4, 1000 + attempt * 600000);
    for (const name of t4Boosters) {
        if (pT4.shop.boosterListings[name].available) {
            foundT4Name = name;
            break;
        }
    }
    if (foundT4Name) break;
}

assert.notStrictEqual(foundT4Name, null, 'Must find an available T4 booster listing');
const t4Listing = pT4.shop.boosterListings[foundT4Name];
const availableStock = t4Listing.stock;

// Buy exact stock quantity
const testNow = pT4.shop.lastRestockAt + 1000;
const buyT4Res = ShopEngine.buyBooster(pT4, foundT4Name, availableStock, testNow);
assert.strictEqual(buyT4Res.success, true);
assert.strictEqual(t4Listing.stock, 0, 'Stock must be 0 after buying full quantity');
assert.strictEqual(t4Listing.available, false, 'Listing must be marked unavailable');

// Attempt buying 1 more (should fail)
const failBuyRes = ShopEngine.buyBooster(pT4, foundT4Name, 1, testNow);
assert.strictEqual(failBuyRes.error, 'No stock available');
console.log('✓ Test 4: T4 finite stock exhaustion verified');

// 5. T5 & T6 Shop Exclusion Test
const pT56 = createTestPlayerState();
ShopEngine.ensureShopState(pT56, 1000);
const t56Boosters = Object.entries(BOOSTER_REGISTRY)
    .filter(([_, config]) => !config.inShop)
    .map(([name]) => name);

assert.strictEqual(t56Boosters.length, 8, '8 T5-T6 boosters must exist');

for (const name of t56Boosters) {
    const listing = pT56.shop.boosterListings[name];
    assert.strictEqual(listing.available, false, `T5/T6 booster '${name}' must be unavailable`);
    assert.strictEqual(listing.stock, 0, `T5/T6 booster '${name}' stock must be 0`);
    
    const buyRes = ShopEngine.buyBooster(pT56, name, 1);
    assert.strictEqual(buyRes.error, `Booster '${name}' is not available in the shop`);
}
console.log('✓ Test 5: T5 & T6 shop exclusion verified');

// 6. JSON Stringification / HTTP API Payload Test (stock: null handling)
const pJson = createTestPlayerState();
ShopEngine.ensureShopState(pJson, 1000);
const stringifiedState = JSON.parse(JSON.stringify(pJson));
const jsonBuyRes = ShopEngine.buyBooster(stringifiedState, 'Survey Pack', 5, 1000);
assert.strictEqual(jsonBuyRes.success, true, 'Buying from JSON stringified state must succeed');
assert.strictEqual(stringifiedState.inventory['Survey Pack'], 5, 'Inventory updated on stringified state');
console.log('✓ Test 6: JSON stringification & HTTP payload compatibility verified');

// 7. Force Restock Test
const pForce = createTestPlayerState();
ShopEngine.ensureShopState(pForce, 1000);
const forceRes = ShopEngine.forceRestock(pForce, 2000);
assert.strictEqual(forceRes.success, true, 'forceRestock must return success');
assert.strictEqual(pForce.shop.lastRestockAt, 2000, 'lastRestockAt updated to forced timestamp');
assert.strictEqual(pForce.shop.nextRestockAt, 2000 + 600000, 'nextRestockAt updated to 2000 + 600s');
console.log('✓ Test 7: Manual / Force Restock functionality verified');

console.log('--- ALL BOOSTER SHOP RESTOCK TESTS PASSED CLEANLY! ---');
