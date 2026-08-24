const assert = require('assert');
const catalog = require('../src/data/craftingCatalog');

console.log('--- Running Crafting Catalog Invariant Tests ---');

const summary = catalog.validateCatalog();
assert.strictEqual(summary.materialCount, 450);
assert.strictEqual(summary.newCraftableCount, 216);
assert.strictEqual(summary.legacyCraftableCount, 10);
assert.strictEqual(summary.socketModuleCount, 15);
assert.strictEqual(summary.recipeCount, 241);
assert.deepStrictEqual({ ...summary.sourceCounts }, { mine: 200, explore: 160, fish: 40, hunt: 50 });
assert.deepStrictEqual({ ...summary.rarityCounts }, {
    Common: 135,
    Uncommon: 112,
    Rare: 90,
    'Very Rare': 63,
    'Ultra Rare': 36,
    Exceptional: 14
});
assert.deepStrictEqual({ ...summary.recipeForms }, { 'raw-only': 60, mixed: 96, 'crafted-only': 60 });
assert.deepStrictEqual({ ...summary.effortCounts }, {
    Basic: 36,
    Workshop: 48,
    Industrial: 48,
    Advanced: 42,
    Specialized: 30,
    Frontier: 12
});
assert.ok(summary.reusedMaterialCount >= 225);
assert.ok(summary.crossDomainCount >= 44);
assert.ok(summary.maxDepth <= 12);

for (const domain of catalog.DOMAIN_ORDER) {
    assert.strictEqual(catalog.MATERIALS.filter(item => item.domain === domain).length, 25);
    assert.strictEqual(catalog.NEW_CRAFTABLES.filter(item => item.domain === domain).length, 12);
}

for (const item of [...catalog.MATERIALS, ...catalog.CRAFTABLES]) {
    assert.ok(item.id && item.name && item.description && item.icon && item.unit);
    assert.match(item.icon, /^[a-z0-9-]+:[a-z0-9-]+$/i);
}

const ingredientIds = itemId => catalog.RECIPE_BY_OUTPUT_ID[itemId].ingredients.map(input => input.itemId);
assert.deepStrictEqual(ingredientIds('FoodGradeLipidBlend'), ['SoybeanSeed', 'CanolaSeed', 'SunflowerSeed', 'PeanutKernel', 'RenderedAnimalFat']);
assert.ok(ingredientIds('BalancedFeedPelletBatch').includes('StarchBinderPowder'));
assert.ok(ingredientIds('IrrigatedRaisedBedModule').includes('CopperPlumbingLoop'));
assert.ok(ingredientIds('VibratorySampleSieve').includes('MineralScreenPanel'));
assert.ok(ingredientIds('VariableSpeedElectricMotor').includes('PermanentMagnetRotor'));
assert.ok(ingredientIds('StationaryBatteryCabinet').includes('LeadAcidCellPack'));
assert.ok(ingredientIds('TurbineHotSectionAssembly').includes('HighTemperatureShieldPanel'));
assert.ok(!ingredientIds('TurbineHotSectionAssembly').some(id => /FuelCell/i.test(id)));
assert.ok(ingredientIds('CopperPlumbingLoop').includes('AnnealedCopperPipe'));
assert.ok(ingredientIds('SmallBoatHullAssembly').includes('BioCompositeHullCore'));
assert.ok(ingredientIds('PVCFumeDuctSection').every(id => !/Acid\d*Percent/i.test(id)));
assert.ok(catalog.CRAFTABLE_BY_ID.RigidPVCPanel.name.includes('PVC Panel'));
assert.ok(catalog.NEW_CRAFTABLES.every(item => item.description.length >= 150 && item.description.includes('bill of materials')));
assert.ok(catalog.NEW_CRAFTABLES.every(item => {
    const firstId = catalog.RECIPE_BY_ID[item.recipeId].ingredients[0].itemId;
    const firstInput = catalog.MATERIAL_BY_ID[firstId] || catalog.CRAFTABLE_BY_ID[firstId];
    return item.description.includes(firstInput.name);
}));
assert.ok(catalog.NEW_CRAFTABLES.every(item => !/\b(magic|enchanted|mythic|dragon|unobtainium|fantasy)\b/i.test(`${item.name} ${item.description}`)));
console.log('✓ Curated sentinel recipes and explicit product descriptions verified');

console.log('✓ Exact counts, quotas, metadata, graph, reuse, and cross-domain invariants verified');
