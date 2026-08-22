/** Cross-layer contracts for farm materials, loot, routes, and plot UI. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ActionEngine = require('../src/engine/actionEngine');
const ShopEngine = require('../src/engine/shopEngine');
const { SELLABLE_ITEMS } = require('../src/engine/shopTables');
const { FARM_UPGRADE_MATERIALS } = require('../src/engine/farmPlotUpgrade');
const { ITEM_DESCRIPTIONS } = require('../src/data/itemDescriptions');

console.log('--- Starting Farm Plot Upgrade Cross-Layer Tests ---');

for (const [name, material] of Object.entries(FARM_UPGRADE_MATERIALS)) {
    assert.deepStrictEqual(SELLABLE_ITEMS[name].sellRange, material.sellRange);
    assert.deepStrictEqual(SELLABLE_ITEMS[name].buyRange, material.buyRange);
    assert.strictEqual(SELLABLE_ITEMS[name].category, 'farm-upgrade-material');
    assert.strictEqual(ITEM_DESCRIPTIONS[name], material.description);
}
console.log('✓ All farm materials are sellable, purchasable, categorized, and described');

const shopState = { inventory: {}, shop: {} };
ShopEngine.restockShop(shopState, 1000, () => 0.5);
for (const [name, material] of Object.entries(FARM_UPGRADE_MATERIALS)) {
    const listing = shopState.shop.buyListings[name];
    if (listing.available) {
        assert(listing.buyPrice >= material.buyRange[0] && listing.buyPrice <= material.buyRange[1]);
    }
    assert(shopState.shop.sellPrices[name] >= material.sellRange[0]);
    assert(shopState.shop.sellPrices[name] <= material.sellRange[1]);
}
assert.strictEqual(shopState.shop.sellPrices.Gravel, 475);
assert.strictEqual(shopState.shop.buyListings.Gravel.buyPrice, 850);
console.log('✓ Every refresh independently rolls configured buy and sell ranges');

const actionState = {
    cash: 0,
    rankIndex: 0,
    prestigeCount: 0,
    inventory: {},
    tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
    perks: { serendipity: 2, water_byproducts: 0 },
    cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 }
};
const originalRandom = Math.random;
try {
    Math.random = () => 0;
    const result = ActionEngine.performAction(actionState, 'mine', 1000000);
    const farmDrops = result.itemsList.filter(item => item.farmUpgradeMaterial);
    assert.strictEqual(farmDrops.length, 12, 'Independent successful rolls can award every material on one action');
    assert.strictEqual(farmDrops.find(item => item.item === 'Gravel').effectiveChance, 20, 'Common material chance is literal');
    assert(Math.abs(farmDrops.find(item => item.item === 'Water Pump').effectiveChance - 0.6) < 1e-9, 'Serendipity scales ≤5% rare chance');
    for (const drop of farmDrops) assert(actionState.inventory[drop.item] >= 1);

    const workState = JSON.parse(JSON.stringify(actionState));
    workState.inventory = {};
    workState.cooldowns = { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 };
    const work = ActionEngine.performAction(workState, 'work', 2000000);
    assert.strictEqual(work.success, true);
    for (const name of Object.keys(FARM_UPGRADE_MATERIALS)) assert.strictEqual(workState.inventory[name], undefined);
} finally {
    Math.random = originalRandom;
}
console.log('✓ Gathering actions use independent material rolls while Work is excluded');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const api = fs.readFileSync(path.join(root, 'public/js/api.js'), 'utf8');
const farmUi = fs.readFileSync(path.join(root, 'public/js/ui/farm.js'), 'utf8');
const itemModalUi = fs.readFileSync(path.join(root, 'public/js/ui/itemModal.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');

for (const route of ['/api/farm/uproot', '/api/farm/uproot-same-crop', '/api/farm/upgrade-preview', '/api/farm/upgrade', '/api/farm/upgrade-bulk-preview', '/api/farm/upgrade-bulk']) {
    assert(server.includes(route), `${route} is exposed by the server`);
    assert(api.includes(route), `${route} is wired by the client`);
}
for (const removedRoute of ["'/api/farm/remove'", "'/api/farm/water'", "'/api/farm/apply-compost'"]) {
    assert.strictEqual(server.includes(removedRoute), false, `${removedRoute} is removed from the server`);
    assert.strictEqual(api.includes(removedRoute), false, `${removedRoute} is removed from the client`);
}
assert(html.includes('plot-management-modal') && html.includes('plant-crop-modal') && html.includes('plot-upgrade-modal'));
assert(html.includes('farm-manage-modal') && html.includes('farm-bulk-upgrade-preview-modal'));
assert(server.includes('/api/data/farm/materials'));
assert(itemModalUi.includes('/api/data/farm/materials'));
assert(html.includes('item-modal-loot-chance-row') && html.includes('item-modal-market-range-row'));
assert(farmUi.includes('Uproot Same Crop'));
assert(farmUi.includes('Upgrade as Far as Possible'));
assert(farmUi.includes('I know what I’m uprooting—skip this warning next time.'));
assert.strictEqual(farmUi.includes('btn-water'), false, 'Individual plot watering controls are absent');
assert.strictEqual(farmUi.includes('btn-compost'), false, 'Plot compost controls are absent');
assert.strictEqual(farmUi.includes('btn-remove'), false, 'Unused Remove control is absent');
console.log('✓ Routes, modal flows, confirmation suppression, and removed controls match the design');

console.log('--- FARM PLOT UPGRADE CROSS-LAYER TESTS PASSED ---');
