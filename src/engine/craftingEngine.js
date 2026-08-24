'use strict';

const {
    CATALOG_VERSION,
    MATERIAL_BY_ID,
    CRAFTABLE_BY_ID,
    RECIPE_BY_ID,
    RECIPE_BY_OUTPUT_ID,
    validateCatalog
} = require('../data/craftingCatalog');

const MAX_SAFE_QUANTITY = Number.MAX_SAFE_INTEGER;
const MAX_PLANNER_CALLS = 10000;

function failure(code, error, extra = {}) {
    return { ok: false, code, error, ...extra };
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSafeNonNegativeInteger(value) {
    return Number.isSafeInteger(value) && value >= 0;
}

function safeAdd(left, right) {
    if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) return null;
    const result = left + right;
    return Number.isSafeInteger(result) ? result : null;
}

function safeMultiply(left, right) {
    if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) return null;
    const result = left * right;
    return Number.isSafeInteger(result) ? result : null;
}

function clonePlayerState(playerState) {
    return JSON.parse(JSON.stringify(playerState));
}

function validateQuantityMap(candidate, label) {
    if (candidate === undefined || candidate === null) return null;
    if (!isPlainObject(candidate)) return `${label} must be an object`;
    for (const [itemId, quantity] of Object.entries(candidate)) {
        if (!itemId || !isSafeNonNegativeInteger(quantity)) {
            return `${label}.${itemId || '<empty>'} must be a non-negative safe integer`;
        }
    }
    return null;
}

function validatePlayerState(playerState) {
    if (!isPlainObject(playerState)) return 'playerState must be an object';
    const inventoryError = validateQuantityMap(playerState.inventory, 'inventory');
    if (inventoryError) return inventoryError;
    const moduleError = validateQuantityMap(playerState.toolModules, 'toolModules');
    if (moduleError) return moduleError;
    if (playerState.lockedItems !== undefined && !Array.isArray(playerState.lockedItems)) {
        return 'lockedItems must be an array when present';
    }
    if (Array.isArray(playerState.lockedItems) && playerState.lockedItems.some(itemId => typeof itemId !== 'string' || !itemId)) {
        return 'lockedItems must contain non-empty item IDs';
    }
    return null;
}

function storageForItem(itemId) {
    return CRAFTABLE_BY_ID[itemId] && CRAFTABLE_BY_ID[itemId].storage === 'toolModules'
        ? 'toolModules'
        : 'inventory';
}

function addToRecord(record, itemId, quantity) {
    const next = safeAdd(record[itemId] || 0, quantity);
    if (next === null) throw new RangeError(`Quantity overflow for ${itemId}`);
    record[itemId] = next;
}

function recordToList(record) {
    return Object.entries(record)
        .filter(([, quantity]) => quantity > 0)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([itemId, quantity]) => ({
            itemId,
            name: (MATERIAL_BY_ID[itemId] || CRAFTABLE_BY_ID[itemId] || {}).name || itemId,
            quantity,
            unit: (MATERIAL_BY_ID[itemId] || CRAFTABLE_BY_ID[itemId] || {}).unit || null
        }));
}

class PlanningLedger {
    constructor(playerState) {
        this.playerState = playerState;
        this.locked = new Set(playerState.lockedItems || []);
        this.owned = {
            inventory: { ...(playerState.inventory || {}) },
            toolModules: { ...(playerState.toolModules || {}) }
        };
        this.generated = { inventory: {}, toolModules: {} };
        this.consumedOwned = { inventory: {}, toolModules: {} };
        this.generatedConsumed = { inventory: {}, toolModules: {} };
        this.generatedTotals = { inventory: {}, toolModules: {} };
    }

    available(itemId) {
        if (this.locked.has(itemId)) return 0;
        const storage = storageForItem(itemId);
        return (this.owned[storage][itemId] || 0) + (this.generated[storage][itemId] || 0);
    }

    consume(itemId, quantity) {
        if (this.locked.has(itemId)) return { consumed: 0, locked: true, owned: 0, generated: 0 };
        const storage = storageForItem(itemId);
        const fromOwned = Math.min(this.owned[storage][itemId] || 0, quantity);
        this.owned[storage][itemId] = (this.owned[storage][itemId] || 0) - fromOwned;
        if (fromOwned > 0) addToRecord(this.consumedOwned[storage], itemId, fromOwned);

        const remaining = quantity - fromOwned;
        const fromGenerated = Math.min(this.generated[storage][itemId] || 0, remaining);
        this.generated[storage][itemId] = (this.generated[storage][itemId] || 0) - fromGenerated;
        if (fromGenerated > 0) addToRecord(this.generatedConsumed[storage], itemId, fromGenerated);
        return { consumed: fromOwned + fromGenerated, locked: false, owned: fromOwned, generated: fromGenerated };
    }

    produce(itemId, quantity) {
        const storage = storageForItem(itemId);
        addToRecord(this.generated[storage], itemId, quantity);
        addToRecord(this.generatedTotals[storage], itemId, quantity);
    }

    commit() {
        const result = clonePlayerState(this.playerState);
        result.inventory = result.inventory || {};
        result.toolModules = result.toolModules || {};

        for (const storage of ['inventory', 'toolModules']) {
            const itemIds = new Set([
                ...Object.keys(this.owned[storage]),
                ...Object.keys(this.generated[storage])
            ]);
            for (const itemId of itemIds) {
                const quantity = safeAdd(this.owned[storage][itemId] || 0, this.generated[storage][itemId] || 0);
                if (quantity === null) throw new RangeError(`Quantity overflow while committing ${itemId}`);
                if (quantity > 0) result[storage][itemId] = quantity;
                else delete result[storage][itemId];
            }
        }
        return result;
    }
}

function normalizeSteps(stepMap, stepOrder) {
    return stepOrder.map(recipeId => {
        const step = stepMap[recipeId];
        const recipe = RECIPE_BY_ID[recipeId];
        const outputDefinition = CRAFTABLE_BY_ID[recipe.output.itemId];
        return {
            recipeId,
            itemId: recipe.output.itemId,
            name: outputDefinition.name,
            craftCount: step.craftCount,
            outputQuantity: step.outputQuantity,
            storage: outputDefinition.storage
        };
    });
}

function buildPlan(playerState, recipe, craftCount, mode) {
    const ledger = new PlanningLedger(playerState);
    const shortages = {};
    const lockedShortages = {};
    const aggregateRawCosts = {};
    const ownedIntermediateUse = {};
    const generatedIntermediateUse = {};
    const stepMap = {};
    const stepOrder = [];
    let plannerCalls = 0;
    let unsafeError = null;

    const noteStep = (targetRecipe, count, outputQuantity) => {
        if (!stepMap[targetRecipe.id]) {
            stepMap[targetRecipe.id] = { craftCount: 0, outputQuantity: 0 };
            stepOrder.push(targetRecipe.id);
        }
        const nextCount = safeAdd(stepMap[targetRecipe.id].craftCount, count);
        const nextOutput = safeAdd(stepMap[targetRecipe.id].outputQuantity, outputQuantity);
        if (nextCount === null || nextOutput === null) throw new RangeError(`Planner step overflow for ${targetRecipe.id}`);
        stepMap[targetRecipe.id].craftCount = nextCount;
        stepMap[targetRecipe.id].outputQuantity = nextOutput;
    };

    const consumeRequirement = (itemId, quantity, recursive) => {
        plannerCalls += 1;
        if (plannerCalls > MAX_PLANNER_CALLS) throw new RangeError('Crafting plan exceeded the planner step limit');

        const definition = CRAFTABLE_BY_ID[itemId];
        const inputRecipe = definition ? RECIPE_BY_OUTPUT_ID[itemId] : null;
        if (!inputRecipe) addToRecord(aggregateRawCosts, itemId, quantity);

        const firstConsumption = ledger.consume(itemId, quantity);
        if (definition && firstConsumption.owned > 0) addToRecord(ownedIntermediateUse, itemId, firstConsumption.owned);
        if (definition && firstConsumption.generated > 0) addToRecord(generatedIntermediateUse, itemId, firstConsumption.generated);
        let remaining = quantity - firstConsumption.consumed;
        if (remaining === 0) return;

        if (firstConsumption.locked) {
            addToRecord(lockedShortages, itemId, remaining);
            addToRecord(shortages, itemId, remaining);
            return;
        }

        if (!recursive || !inputRecipe) {
            addToRecord(shortages, itemId, remaining);
            return;
        }

        const craftRuns = Math.ceil(remaining / inputRecipe.output.quantity);
        if (!Number.isSafeInteger(craftRuns) || craftRuns <= 0) throw new RangeError(`Unsafe recursive craft count for ${itemId}`);
        craftRecipe(inputRecipe, craftRuns, true);

        const secondConsumption = ledger.consume(itemId, remaining);
        if (secondConsumption.generated > 0) addToRecord(generatedIntermediateUse, itemId, secondConsumption.generated);
        remaining -= secondConsumption.consumed;
        if (remaining > 0) addToRecord(shortages, itemId, remaining);
    };

    const craftRecipe = (targetRecipe, count, recursive) => {
        plannerCalls += 1;
        if (plannerCalls > MAX_PLANNER_CALLS) throw new RangeError('Crafting plan exceeded the planner step limit');
        const shortagesBefore = Object.values(shortages).reduce((sum, quantity) => sum + quantity, 0);
        for (const input of targetRecipe.ingredients) {
            const totalRequired = safeMultiply(input.quantity, count);
            if (totalRequired === null) throw new RangeError(`Ingredient quantity overflow in ${targetRecipe.id}`);
            consumeRequirement(input.itemId, totalRequired, recursive);
        }
        const outputQuantity = safeMultiply(targetRecipe.output.quantity, count);
        if (outputQuantity === null) throw new RangeError(`Output quantity overflow in ${targetRecipe.id}`);
        const shortagesAfter = Object.values(shortages).reduce((sum, quantity) => sum + quantity, 0);
        if (shortagesAfter === shortagesBefore) {
            ledger.produce(targetRecipe.output.itemId, outputQuantity);
            noteStep(targetRecipe, count, outputQuantity);
        }
    };

    try {
        craftRecipe(recipe, craftCount, mode === 'recursive');
    } catch (error) {
        unsafeError = error;
    }

    if (unsafeError) {
        return failure('UNSAFE_QUANTITY', unsafeError.message);
    }

    const outputQuantity = safeMultiply(recipe.output.quantity, craftCount);
    if (outputQuantity === null) return failure('UNSAFE_QUANTITY', 'Requested output quantity exceeds safe integer limits');
    const directCosts = recipe.ingredients.map(input => ({
        itemId: input.itemId,
        name: (MATERIAL_BY_ID[input.itemId] || CRAFTABLE_BY_ID[input.itemId] || {}).name || input.itemId,
        quantity: safeMultiply(input.quantity, craftCount),
        owned: ledger.available(input.itemId) + (ledger.consumedOwned[storageForItem(input.itemId)][input.itemId] || 0),
        locked: ledger.locked.has(input.itemId)
    }));

    const shortageList = recordToList(shortages);
    const rootOutputId = recipe.output.itemId;
    const surplus = {};
    for (const storage of ['inventory', 'toolModules']) {
        for (const [itemId, quantity] of Object.entries(ledger.generated[storage])) {
            if (itemId !== rootOutputId && quantity > 0) surplus[itemId] = quantity;
        }
    }

    const craftable = shortageList.length === 0;
    return {
        ok: true,
        catalogVersion: CATALOG_VERSION,
        recipeId: recipe.id,
        mode,
        requestedCraftCount: craftCount,
        resolvedCraftCount: craftCount,
        craftable,
        output: {
            itemId: rootOutputId,
            name: CRAFTABLE_BY_ID[rootOutputId].name,
            quantity: outputQuantity,
            storage: storageForItem(rootOutputId)
        },
        steps: normalizeSteps(stepMap, stepOrder),
        directCosts,
        aggregateRawCosts: recordToList(aggregateRawCosts),
        ownedIntermediateUse: recordToList(ownedIntermediateUse),
        generatedIntermediateUse: recordToList(generatedIntermediateUse),
        surplus: recordToList(surplus),
        shortages: shortageList,
        lockedShortages: recordToList(lockedShortages),
        confirmation: {
            required: mode === 'recursive' || craftCount >= 100,
            reason: mode === 'recursive' ? 'recursive' : craftCount >= 100 ? 'large' : null
        },
        stagedState: craftable ? ledger.commit() : null
    };
}

function validateRequest(playerState, recipeId, craftCount, mode) {
    const stateError = validatePlayerState(playerState);
    if (stateError) return failure('INVALID_REQUEST', stateError);
    if (typeof recipeId !== 'string' || !RECIPE_BY_ID[recipeId]) {
        return failure('UNKNOWN_RECIPE', 'Unknown crafting recipe');
    }
    if (mode !== 'direct' && mode !== 'recursive') {
        return failure('INVALID_REQUEST', 'mode must be direct or recursive');
    }
    if (craftCount !== 'max' && (!Number.isSafeInteger(craftCount) || craftCount <= 0)) {
        return failure('INVALID_REQUEST', 'craftCount must be a positive safe integer or "max"');
    }
    return null;
}

function resolveMaximum(playerState, recipe, mode) {
    const first = buildPlan(playerState, recipe, 1, mode);
    if (!first.ok) return first;
    if (!first.craftable) return { count: 0, failedPlan: first };

    let low = 1;
    let high = 2;
    while (Number.isSafeInteger(high)) {
        const attempt = buildPlan(playerState, recipe, high, mode);
        if (!attempt.ok || !attempt.craftable) break;
        low = high;
        if (high > Math.floor(MAX_SAFE_QUANTITY / 2)) {
            high = MAX_SAFE_QUANTITY;
            const lastAttempt = buildPlan(playerState, recipe, high, mode);
            if (lastAttempt.ok && lastAttempt.craftable) return { count: high };
            break;
        }
        high *= 2;
    }

    while (low + 1 < high) {
        const middle = low + Math.floor((high - low) / 2);
        const attempt = buildPlan(playerState, recipe, middle, mode);
        if (attempt.ok && attempt.craftable) low = middle;
        else high = middle;
    }
    return { count: low };
}

class CraftingEngine {
    static validateCatalog() {
        return validateCatalog();
    }

    static preview(playerState, recipeId, craftCount = 1, mode = 'direct') {
        const requestError = validateRequest(playerState, recipeId, craftCount, mode);
        if (requestError) return requestError;
        const recipe = RECIPE_BY_ID[recipeId];

        if (craftCount === 'max') {
            const maximum = resolveMaximum(playerState, recipe, mode);
            if (maximum.ok === false) return maximum;
            if (maximum.count === 0) {
                return {
                    ...maximum.failedPlan,
                    requestedCraftCount: 'max',
                    resolvedCraftCount: 0,
                    confirmation: { required: mode === 'recursive', reason: mode === 'recursive' ? 'recursive' : null }
                };
            }
            const plan = buildPlan(playerState, recipe, maximum.count, mode);
            return { ...plan, requestedCraftCount: 'max', resolvedCraftCount: maximum.count };
        }

        return buildPlan(playerState, recipe, craftCount, mode);
    }

    static execute(playerState, recipeId, craftCount = 1, mode = 'direct') {
        const preview = this.preview(playerState, recipeId, craftCount, mode);
        if (!preview.ok) return preview;
        if (!preview.craftable || preview.resolvedCraftCount === 0 || !preview.stagedState) {
            return failure(
                preview.resolvedCraftCount === 0 ? 'NO_CRAFTABLE_QUANTITY' : 'INSUFFICIENT_MATERIALS',
                preview.lockedShortages && preview.lockedShortages.length
                    ? 'One or more required item types are locked'
                    : 'Insufficient materials to complete the crafting plan',
                { preview }
            );
        }

        const { stagedState, ...result } = preview;
        return {
            ok: true,
            catalogVersion: CATALOG_VERSION,
            playerState: stagedState,
            result
        };
    }
}

module.exports = CraftingEngine;
