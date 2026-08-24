const assert = require('assert');
const CraftingEngine = require('../src/engine/craftingEngine');
const catalog = require('../src/data/craftingCatalog');

console.log('--- Running Crafting Engine Tests ---');

const recipe = catalog.RECIPE_BY_ID.recipe_WholeGrainFlourBlend;
const stockedState = {
    cash: 123,
    inventory: Object.fromEntries(recipe.ingredients.map(input => [input.itemId, input.quantity * 20])),
    lockedItems: [],
    toolModules: {}
};

const directSnapshot = JSON.stringify(stockedState);
const directPreview = CraftingEngine.preview(stockedState, recipe.id, 2, 'direct');
assert.strictEqual(directPreview.ok, true);
assert.strictEqual(directPreview.craftable, true);
assert.strictEqual(directPreview.output.quantity, 2);
assert.strictEqual(JSON.stringify(stockedState), directSnapshot, 'Preview must not mutate submitted state');

const directExecution = CraftingEngine.execute(stockedState, recipe.id, 2, 'direct');
assert.strictEqual(directExecution.ok, true);
assert.strictEqual(directExecution.playerState.inventory.WholeGrainFlourBlend, 2);
assert.strictEqual(directExecution.playerState.cash, 123);
assert.strictEqual(JSON.stringify(stockedState), directSnapshot, 'Execution must commit to a clone');
console.log('✓ Direct preview and atomic execution verified');

const emptyState = { inventory: {}, lockedItems: [], toolModules: {} };
const emptySnapshot = JSON.stringify(emptyState);
const shortage = CraftingEngine.execute(emptyState, recipe.id, 1, 'direct');
assert.strictEqual(shortage.ok, false);
assert.strictEqual(shortage.code, 'INSUFFICIENT_MATERIALS');
assert.strictEqual(JSON.stringify(emptyState), emptySnapshot);
assert.ok(shortage.preview.shortages.length > 0);
console.log('✓ Shortages reject without mutation');

const allMaterials = Object.fromEntries(catalog.MATERIALS.map(item => [item.id, 1000000]));
const recursiveState = { inventory: allMaterials, lockedItems: [], toolModules: {} };
const recursiveSnapshot = JSON.stringify(recursiveState);
const recursive = CraftingEngine.execute(recursiveState, 'recipe_MobileFeedHopper', 2, 'recursive');
assert.strictEqual(recursive.ok, true);
assert.strictEqual(recursive.playerState.inventory.MobileFeedHopper, 2);
assert.ok(recursive.result.steps.length > 1);
assert.strictEqual(JSON.stringify(recursiveState), recursiveSnapshot);
console.log('✓ Recursive prerequisite planning and atomic commit verified');

const comprehensivePreviewState = {
    inventory: Object.fromEntries(catalog.MATERIALS.map(item => [item.id, 1000000])),
    lockedItems: ['PoplarLog'],
    toolModules: {}
};
const comprehensivePreview = CraftingEngine.preview(comprehensivePreviewState, 'recipe_IrrigatedRaisedBedModule', 1, 'recursive');
assert.strictEqual(comprehensivePreview.craftable, false);
assert.ok(comprehensivePreview.lockedShortages.some(entry => entry.itemId === 'PoplarLog'));
assert.ok(comprehensivePreview.steps.some(step => step.itemId === 'NaturalRubberCompound'), 'Independent feasible branches must still appear after an earlier branch is short');
console.log('✓ Shortage previews continue planning independent feasible dependency branches');

const lockedIngredient = recipe.ingredients[0].itemId;
const lockedState = {
    inventory: Object.fromEntries(recipe.ingredients.map(input => [input.itemId, input.quantity * 10])),
    lockedItems: [lockedIngredient],
    toolModules: {}
};
const locked = CraftingEngine.preview(lockedState, recipe.id, 1, 'recursive');
assert.strictEqual(locked.ok, true);
assert.strictEqual(locked.craftable, false);
assert.ok(locked.lockedShortages.some(entry => entry.itemId === lockedIngredient));
console.log('✓ Locked item types cannot be consumed');

const maximum = CraftingEngine.preview(stockedState, recipe.id, 'max', 'direct');
assert.strictEqual(maximum.ok, true);
assert.strictEqual(maximum.craftable, true);
assert.strictEqual(maximum.resolvedCraftCount, 20);
console.log('✓ Exact maximum craft count verified');

const moduleRecipe = catalog.RECIPE_BY_ID.recipe_multistrike_1;
const moduleState = {
    inventory: Object.fromEntries(moduleRecipe.ingredients.map(input => [input.itemId, input.quantity * 2])),
    lockedItems: [],
    toolModules: {}
};
const moduleExecution = CraftingEngine.execute(moduleState, moduleRecipe.id, 2, 'direct');
assert.strictEqual(moduleExecution.ok, true);
assert.strictEqual(moduleExecution.playerState.toolModules.multistrike_1, 2);
assert.strictEqual(moduleExecution.playerState.inventory.multistrike_1, undefined);
console.log('✓ Socket-module output uses specialized storage');

for (const invalidCount of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1']) {
    const invalid = CraftingEngine.preview(stockedState, recipe.id, invalidCount, 'direct');
    assert.strictEqual(invalid.ok, false);
    assert.strictEqual(invalid.code, 'INVALID_REQUEST');
}
console.log('✓ Unsafe and malformed quantities are rejected');
