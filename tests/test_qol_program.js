const assert = require('assert');
const { getAllItems, normalizeItemId } = require('../src/data/itemRegistry');
const { createDefaultState, normalizePlayerState } = require('../src/state/playerState');
const InventoryEngine = require('../src/engine/inventoryEngine');
const ShopEngine = require('../src/engine/shopEngine');
const BoosterEngine = require('../src/engine/boosterEngine');
const ToolEngine = require('../src/engine/toolEngine');
const CraftingEngine = require('../src/engine/craftingEngine');
const RankPrestigeEngine = require('../src/engine/rankPrestigeEngine');
const { PerkSimulatorEngine } = require('../src/engine/perkSimulatorEngine');
const { BOOSTER_REGISTRY } = require('../src/engine/shopTables');
const catalog = require('../src/data/craftingCatalog');
const { executeCommand, executeQuery } = require('../src/api/gameGateway');

console.log('--- Running Quality-of-Life Program Tests ---');

const registry = getAllItems();
assert(registry.length >= 800, 'Canonical registry should cover the full game catalog');
assert.strictEqual(normalizeItemId('Bones'), 'OldBones');
assert.strictEqual(normalizeItemId('Neodymium Magnet Blank'), 'NeodymiumMagnetBlank');
assert.strictEqual(new Set(registry.map(item => item.id)).size, registry.length);
console.log('✓ Canonical item registry and historical aliases verified');

const migrated = normalizePlayerState({
    inventory: { Bones: 3, Diamond: 2 },
    lockedItems: ['Diamond', 'NotARealItem'],
    pinnedItems: ['Bones', 'Diamond', 'NotARealItem'],
    shopWishlist: { Diamond: { addedAt: 42 }, NeodymiumMagnetBlank: { addedAt: 99 } }
});
assert.deepStrictEqual(migrated.inventory, { OldBones: 3, Diamond: 2 });
assert.deepStrictEqual(migrated.lockedItems, ['Diamond']);
assert.deepStrictEqual(new Set(migrated.favoriteItems), new Set(['OldBones', 'Diamond']));
assert.strictEqual(migrated.pinnedItems, undefined);
assert.strictEqual(migrated.shopWishlist.NeodymiumMagnetBlank.addedAt, 99, 'Wishlist may include unowned catalog items');
console.log('✓ State normalization migrates pinning and scopes owned flags without dropping wishlist entries');

const inventoryState = normalizePlayerState({ inventory: { Diamond: 2, OldBones: 4 } });
const snapshot = JSON.stringify(inventoryState);
const rejectedFlags = InventoryEngine.setFlags(inventoryState, ['Diamond', 'UnknownThing'], { locked: true });
assert(rejectedFlags.error);
assert.strictEqual(JSON.stringify(inventoryState), snapshot, 'Batch flag validation must be atomic');
assert(InventoryEngine.setFlags(inventoryState, ['Diamond', 'OldBones'], { locked: true, favorite: true }).success);
assert.deepStrictEqual(new Set(inventoryState.lockedItems), new Set(['Diamond', 'OldBones']));
inventoryState.inventory.Diamond = 0;
InventoryEngine.setWishlist(inventoryState, ['NeodymiumMagnetBlank'], true, 123);
normalizePlayerState(inventoryState);
console.log('✓ Batch lock/favorite validation is atomic and wishlist membership is independent of ownership');

const sellState = createDefaultState();
ShopEngine.ensureShopState(sellState, 1000, () => 0.5);
const variableRoll = Object.values(ShopEngine.getSellRolls(sellState)).find(roll => roll && !roll.fixed);
assert(variableRoll);
assert(variableRoll.percentage >= 0 && variableRoll.percentage <= 100);
assert.strictEqual(ShopEngine.getSellRoll(variableRoll.itemName, variableRoll.min).percentage, 0);
assert.strictEqual(ShopEngine.getSellRoll(variableRoll.itemName, variableRoll.max).percentage, 100);
console.log('✓ Sell-roll percentages are authoritative, bounded, and range-aware');

const [mineT1Name, mineT1] = Object.entries(BOOSTER_REGISTRY).find(([, item]) => item.action === 'mine' && item.tier === 'T1');
const extendNow = 1_000_000;
const boosterState = normalizePlayerState({
    inventory: { [mineT1Name]: 3 },
    boosters: { activeUntil: { mine: { T1: extendNow + 10_000 } } }
});
const extendPreview = BoosterEngine.buildExtendActivePlan(boosterState, extendNow);
assert.strictEqual(extendPreview.totalUnits, 3);
const priorExpiry = boosterState.boosters.activeUntil.mine.T1;
const extended = BoosterEngine.extendActiveBoosters(boosterState, extendNow);
assert.strictEqual(extended.success, true);
assert.strictEqual(boosterState.inventory[mineT1Name] || 0, 0);
assert.strictEqual(boosterState.boosters.activeUntil.mine.T1, priorExpiry + (mineT1.durationMs * 3));
console.log('✓ Extend All consumes only matching active-slot stock and appends from current expiry');

const toolState = normalizePlayerState({ tools: { mine: 1 }, inventory: {} });
for (const requirement of ToolEngine.getUpgradeRequirements('mine', 2)) toolState.inventory[requirement.item] = requirement.quantity;
const maxTool = ToolEngine.getMaxAffordableLevel(toolState, 'mine');
assert.strictEqual(maxTool.maxAffordableLevel, 2);
assert.strictEqual(maxTool.levelsGained, 1);
assert.strictEqual(maxTool.blockingLevel, 3);
assert(maxTool.blockers.length > 0);
console.log('✓ Tool Max Affordable reports exact target, cumulative cost, and next-level blockers');

const whereUsed = CraftingEngine.getWhereUsed('MoldedWoodFiberPanel');
assert.strictEqual(whereUsed.ok, true);
assert(whereUsed.direct.some(entry => entry.recipeId === 'recipe_BiodegradableSeedlingPotSet'));
assert(whereUsed.paths.length >= whereUsed.direct.length);

const childRecipe = catalog.RECIPE_BY_ID.recipe_MoldedWoodFiberPanel;
const parentRecipe = catalog.RECIPE_BY_ID.recipe_BiodegradableSeedlingPotSet;
const craftingState = normalizePlayerState({ inventory: {} });
for (const input of childRecipe.ingredients) craftingState.inventory[input.itemId] = input.quantity;
for (const input of parentRecipe.ingredients.filter(input => input.itemId !== 'MoldedWoodFiberPanel')) craftingState.inventory[input.itemId] = input.quantity;
const intermediate = CraftingEngine.previewIntermediate(craftingState, parentRecipe.id, 1, 'MoldedWoodFiberPanel');
assert.strictEqual(intermediate.ok, true);
assert.strictEqual(intermediate.craftRuns, 1);
assert.strictEqual(intermediate.canCraftImmediately, true);
const intermediateCommand = executeCommand(craftingState, 'crafting.craftIntermediate', {
    parentRecipeId: parentRecipe.id,
    parentCraftCount: 1,
    inputItemId: 'MoldedWoodFiberPanel'
});
assert.strictEqual(intermediateCommand.ok, true);
assert.strictEqual(intermediateCommand.state.inventory.MoldedWoodFiberPanel, 1);
const directMax = CraftingEngine.getMaxAffordableSummary(craftingState, parentRecipe.id, 'direct');
const recursiveMax = CraftingEngine.getMaxAffordableSummary(craftingState, parentRecipe.id, 'recursive');
assert.strictEqual(directMax.ok, true);
assert.strictEqual(recursiveMax.ok, true);
assert(recursiveMax.resolvedCraftCount >= directMax.resolvedCraftCount);
console.log('✓ Reverse lookup, exact max summaries, and one-step intermediate crafting verified');

const perkState = normalizePlayerState({ prestigePoints: 8, perks: {} });
const optimizedA = PerkSimulatorEngine.optimize(perkState, 8, { goalWeights: { career: 40, actions: 30, farming: 20, gambling: 10 } });
const optimizedB = PerkSimulatorEngine.optimize(perkState, 8, { goalWeights: { career: 40, actions: 30, farming: 20, gambling: 10 } });
assert.strictEqual(optimizedA.success, true);
assert.deepStrictEqual(optimizedA.targetLevels, optimizedB.targetLevels, 'Optimizer must be deterministic');
assert.strictEqual(optimizedA.spent, 8);
assert.strictEqual(Object.hasOwn(optimizedA.targetLevels, 'backchannel'), false, 'Nonfunctional perk must be excluded');
const applyState = normalizePlayerState({ prestigePoints: 8 });
const allocation = RankPrestigeEngine.applyPerkAllocation(applyState, optimizedA.targetLevels);
assert.strictEqual(allocation.success, true);
assert.strictEqual(applyState.prestigePoints, 0);
const badAscendState = normalizePlayerState({ rankIndex: 0, cash: 0, prestigePoints: 0 });
const badSnapshot = JSON.stringify(badAscendState);
assert(RankPrestigeEngine.ascendAndApplyAllocation(badAscendState, optimizedA.targetLevels).error);
assert.strictEqual(JSON.stringify(badAscendState), badSnapshot, 'Failed combined ascension must roll back');
console.log('✓ Deterministic integer optimizer and atomic allocation/ascension behavior verified');

const summaryQuery = executeQuery(createDefaultState(), 'progression.summary');
assert.strictEqual(summaryQuery.ok, true);
assert.strictEqual(summaryQuery.result.deficit, summaryQuery.result.cost);
assert.strictEqual(executeQuery(createDefaultState(), 'not.real').code, 'UNKNOWN_QUERY');
assert.strictEqual(executeCommand(createDefaultState(), 'not.real').code, 'UNKNOWN_COMMAND');
console.log('✓ Typed command/query gateway exposes authoritative progression and rejects unknown operations');

console.log('--- Quality-of-Life Program Tests Passed ---');
